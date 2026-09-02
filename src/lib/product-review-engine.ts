/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Product Review engine ("v3.0")
   Runs the original PRODUCT_REVIEW_SYSTEM_PROMPT (grounded web search),
   pulls a product image, and DERIVES an approved / not-approved verdict
   in code from the review's own signals (drug-boundary / red-flag claims,
   claim evidence, formula overreach). The LLM researches; code decides.
──────────────────────────────────────────────────────────────── */

import { PRODUCT_REVIEW_SYSTEM_PROMPT } from "@/lib/product-review-context";
import { generateResilient } from "@/lib/gemini";
import { resolveProductImage, searchProductImage, findProductImageKeyless, isLiveImage } from "@/lib/product-image";
import { resolveINCI, inciGroundTruthBlock } from "@/lib/inci-fetch";
import type { INCIResult } from "@/lib/inci-fetch";
import { fetchPageMarkdown, titleFromMarkdown, productBodyExcerpt, evidenceLinksFromMarkdown } from "@/lib/scrape";
import { fetchInciFromProductPage } from "@/lib/inci-from-page";
import { reviewInciList } from "@/lib/review-inci";
import { upsertVerifiedProduct, slugify } from "@/lib/verified-store";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveConcepts, inciContainsConcept } from "@/lib/ingredient-intel";
import { bannedIngredientsInInci } from "@/lib/ingredient-db";
import { addDiscoveredNames } from "@/lib/ingredient-directory";
import type { ProductReview, DerivedVerdict, ReviewGate } from "@/lib/product-review-types";

export const REVIEW_METHODOLOGY_VERSION = "TCS v3.0";

const isURL = (t: string) => /^https?:\/\//i.test(t.trim());

/** Tolerant JSON extraction · handles a stray prose preamble or code fence. */
function parseJSON(text: string): Record<string, unknown> | null {
  if (!text) return null;
  let s = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  s = s.slice(start, end + 1).replace(/,(\s*[}\]])/g, "$1"); // tolerate trailing commas (common LLM slip)
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function isValidProductReview(p: unknown): p is ProductReview {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  if (o.type !== "product-review") return false;
  if (typeof o.productName !== "string" || !o.productName) return false;
  if (!Array.isArray(o.claimMap)) return false;
  const scores = o.scores as Record<string, unknown> | undefined;
  if (!scores || typeof scores.total !== "number") return false;
  return true;
}

/* ═══════════════ Code-verified hard flags (the guardrails) ═══════════════
   A product can only drop to "Not Recommended" on a HARD flag, and a hard flag
   must survive two code checks, so the model can never send an honest product
   down a tier by fabricating a claim or mis-reading the INCI:

     Guardrail 1 - INCI truth: a "contains X" claim is never a contradiction
       (an absent active is UNVERIFIED, not a lie). A "free-from X" claim only
       counts against the brand when X is CONFIRMABLY present in the retrieved
       INCI. If we cannot confirm the contradiction in code, we void the flag.
     Guardrail 2 - corroboration: a claim the engine could not find in any
       source it actually scraped (corroborated === false) is never hard-flagged
       - it may be a model hallucination (e.g. an invented "silicone-free"). */

const isFreeFromClaim = (t: string) => /\bfree\b|[- ]free\b|\bwithout\b|\bno\b\s|\bzero\b/i.test(t);
const isContainsClaim = (t: string) => /\bwith\b|\bcontains?\b|\benriched\b|\bboosted\b|\binfused\b|\bpowered by\b|\d+\s*%/i.test(t);

/** Guardrail 1. Returns true when a contradiction/red-flag on an ingredient
    claim is CODE-CONFIRMED against the retrieved INCI, false when it should be
    voided. It defers all ingredient-identity questions to the ingredient
    intelligence layer, so "Hyaluronic Acid" ↔ "Sodium Hyaluronate", "sulphate"
    ↔ SLS/SLES (but not Magnesium Sulphate), etc. are understood in one place.
    Non-ingredient hard flags (drug-boundary treatment language) are judged
    separately in deriveVerdict. */
function inciConfirmsContradiction(claimText: string, inci: string[]): boolean {
  if (!inci.length) return false; // no INCI retrieved → cannot confirm → void

  // "contains X" is never a contradiction: a present active supports the claim,
  // an absent one is merely unverified. Either way, not a hard flag.
  if (isContainsClaim(claimText) && !isFreeFromClaim(claimText)) return false;

  // "free-from X": a genuine contradiction only when the ingredient intelligence
  // layer confirms one of the named things (across all its INCI forms) is present.
  // resolveConcepts (plural) handles multi-target claims like "silicone & paraben free".
  if (isFreeFromClaim(claimText)) {
    return resolveConcepts(claimText).some((concept) => inciContainsConcept(inci, concept));
  }
  return false;
}

/** Is this claim an INCI-based flag (free-from / contains / percentage active)
    rather than a drug-boundary treatment claim? Those go through guardrail 1. */
function isIngredientClaim(t: string): boolean {
  return isFreeFromClaim(t) || isContainsClaim(t);
}

/* Common words that don't identify what a claim is ABOUT - ignored when we test
   whether a claim's subject actually appears in the scraped page. */
const CLAIM_STOP = new Set([
  "with", "without", "free", "from", "this", "that", "your", "skin", "hair",
  "product", "formula", "helps", "help", "provides", "clinically", "tested",
  "proven", "results", "visible", "reduces", "improves",
]);

/** Guardrail 2. When a real text corpus was scraped, mark each hard-flag
    candidate claim as corroborated only if its distinctive subject word(s)
    actually appear in that text. A substantial corpus that never mentions the
    claim's subject ⇒ corroborated=false (likely fabricated). No/short corpus
    (e.g. a name-only query) ⇒ left undefined (assumed made). Mutates in place. */
function markClaimCorroboration(review: ProductReview, corpus: string): void {
  const text = corpus.toLowerCase();
  if (text.replace(/\s+/g, " ").trim().length < 400) return; // too little to judge

  for (const c of review.claimMap ?? []) {
    if (!(c.drugBoundaryRisk || c.riskLevel === "red-flag")) continue; // only hard candidates
    const distinctive = (c.text.toLowerCase().match(/[a-z]+/g) || [])
      .filter((t) => t.length >= 5 && !CLAIM_STOP.has(t))
      .sort((a, b) => b.length - a.length)
      .slice(0, 2);
    if (!distinctive.length) continue; // nothing distinctive to test - leave as made
    c.corroborated = distinctive.some((t) => text.includes(t));
  }
}

/* ═══════════════ Derived standing (computed in code) ═══════════════
   Four standings, best → worst. "Clean Sheet Approved" must mean the CLAIMS
   themselves hold up - not just a good blended score - so the top tier is gated
   on the claim-evidence dimension. "Not Recommended" is the ONLY negative-naming
   tier and requires a code-verified problem. Missing proof is "Can Do Better",
   never "Not Recommended". Full definitions in STAMPS.md. */
export const APPROVAL_BAR = 85;
const CLAIM_EVIDENCE_BAR = 15; // out of 20 - headline claims carry finished-product / clinical proof

export function deriveVerdict(r: ProductReview): DerivedVerdict {
  const evidencePts = r.scores?.claimEvidence ?? 0;      // out of 20
  const formulaPts = r.scores?.formulaLogic ?? 0;        // out of 15
  const total = r.scores?.total ?? 0;                    // out of 100
  const overreach = r.formulaLogic?.claimOverreach === true;
  const inci = reviewInciList(r);

  /* HARD flags, judged claim by claim. The model historically over-flags two
     harmless patterns - standard SPF/PA labelling (sunscreens are licensed
     cosmetics in India) and aspirational puffery - and, as seen in the wild,
     sometimes fabricates a "free-from" claim or ignores a present active. The
     two guardrails below turn its assertion into a code-verified fact before it
     can count. A hard flag is only:
       - a drug-boundary claim that is NOT plain SPF/UV labelling, OR
       - a red-flag whose context is a treatment promise / unlawful language,
         OR an INCI contradiction that guardrail 1 actually confirms -
     and in every case the claim must be corroborated (guardrail 2). */
  const SPF_LABEL_RE = /spf|pa\+|uva|uvb|broad.?spectrum|sun.?protection|blue light/i;
  const HARD_RED_RE = /\b(cures?|treats?|heals?|whitens?|whitening|fairness|lightens?\s+skin|permanent(?:ly)?|guaranteed?)\b|contradict|not listed in|inci lists|own ingredient/i;

  const hardClaims = (r.claimMap ?? []).filter((c) => {
    // Guardrail 2: a claim the engine could not corroborate in any scraped
    // source is never counted - it may be a hallucination.
    if (c.corroborated === false) return false;

    const ctx = `${c.text} ${c.evidenceNote ?? ""} ${c.asciNote ?? ""} ${c.drugBoundaryNote ?? ""}`;
    const isDrugBoundary = c.drugBoundaryRisk && !SPF_LABEL_RE.test(c.text);
    const isRedFlag = c.riskLevel === "red-flag" && HARD_RED_RE.test(ctx);
    if (!isDrugBoundary && !isRedFlag) return false;

    // Guardrail 1: if this is an ingredient (free-from / contains) claim, the
    // contradiction must be code-confirmed against the retrieved INCI. Absent
    // confirmation, void it. Drug-boundary treatment claims are not INCI claims
    // and pass through (still subject to guardrail 2 above).
    if (isIngredientClaim(c.text) && !isDrugBoundary) {
      // A free-from contradiction may only stand when it was corroborated in a
      // scraped source. On a name-only query, where no page was read, we cannot
      // confirm the brand ever made the claim, so we do NOT let it force "Not
      // Recommended" (the conservative, defensible direction).
      if (c.corroborated !== true) return false;
      return inciConfirmsContradiction(c.text, inci);
    }
    return true;
  });

  // Mark voided claims so the UI / audit trail can show WHY a model flag was
  // dropped (mutation is safe - deriveVerdict owns the derived view).
  for (const c of r.claimMap ?? []) {
    const ctx = `${c.text} ${c.evidenceNote ?? ""} ${c.asciNote ?? ""} ${c.drugBoundaryNote ?? ""}`;
    const wasCandidate =
      (c.drugBoundaryRisk && !SPF_LABEL_RE.test(c.text)) ||
      (c.riskLevel === "red-flag" && HARD_RED_RE.test(ctx));
    c.inciFlagVoided = wasCandidate && !hardClaims.includes(c);
  }

  const hardFlags = hardClaims.length;

  // Hard SAFETY gate: an ingredient PROHIBITED in cosmetics (not merely
  // concentration-restricted) can never carry a Clean Sheet approval. This is
  // the one place ingredient safety reaches the stamp, so the badge and the
  // safety screen can no longer contradict each other.
  const banned = bannedIngredientsInInci(inci);
  const hasBannedIngredient = banned.length > 0;

  // Gates are informational; `lawful` or the safety gate can block on their own.
  const lawful = hardFlags === 0;
  const honest = evidencePts >= 10;                      // ≥ half the evidence points
  // Material overreach = flagged AND the formula score itself is mediocre.
  // A strong formula (11+/15) with one ambitious claim noted passes with a caveat.
  const materialOverreach = overreach && formulaPts < 11;
  const soundFormula = formulaPts >= 8 && !materialOverreach;

  const gates: ReviewGate[] = [
    {
      id: "safety",
      label: "Ingredient safety",
      passed: !hasBannedIngredient,
      detail: hasBannedIngredient
        ? `Contains an ingredient prohibited in cosmetics: ${banned.map((b) => b.name).join(", ")}`
        : "No ingredient prohibited in cosmetics found in the retrieved list",
    },
    {
      id: "claims",
      label: "Lawful claims",
      passed: lawful,
      detail: lawful
        ? "No drug-boundary or INCI-contradicted claims confirmed"
        : `${hardFlags} claim(s) cross the India drug-cosmetic boundary or are contradicted by the product's own INCI`,
    },
    {
      id: "evidence",
      label: "Honest evidence",
      passed: honest,
      detail: honest
        ? "Claims are substantially backed by visible evidence"
        : "Most claims rely on borrowed ingredient-level evidence, not finished-product proof",
    },
    {
      id: "formula",
      label: "Formula supports claims",
      passed: soundFormula,
      detail: soundFormula
        ? overreach
          ? "The formula delivers the core claims; one claim is noted as ambitious"
          : "The formula and format plausibly deliver the claims"
        : materialOverreach
          ? "Claims go beyond what this formula/format can plausibly deliver"
          : "Formula logic is weak relative to the claims made",
    },
  ];

  /* 4-tier ladder (best → worst):
     - not-recommended: a code-verified problem only - a confirmed drug-boundary
       crossing or an INCI-contradicted claim (guardrails passed). Missing proof
       is NEVER "not-recommended".
     - approved: high overall score AND the claims themselves are well evidenced.
     - mostly-clean: safe & honest, but proof leans on ingredient evidence.
     - can-do-better: safe, no confirmed problem, but thin proof / transparency
       or claims that outrun their evidence. */
  const claimsHoldUp = evidencePts >= CLAIM_EVIDENCE_BAR;
  const tier: DerivedVerdict["tier"] =
    (hardFlags > 0 || hasBannedIngredient)
      ? "not-recommended"
      : total >= APPROVAL_BAR && claimsHoldUp
        ? "approved"
        : total >= 65
          ? "mostly-clean"
          : "can-do-better";

  const TIER_META: Record<DerivedVerdict["tier"], { label: string; headline: string }> = {
    "approved":         { label: "Clean Sheet Approved", headline: "Claims hold up to the evidence." },
    "mostly-clean":     { label: "Mostly Clean",         headline: "A well-made, transparent product; some claims rest on ingredient evidence rather than finished-product proof." },
    "can-do-better":    { label: "Can Do Better",        headline: "Nothing wrong here, but the proof and transparency don't yet match the claims." },
    "not-recommended":  { label: "Not Recommended",      headline: "Makes a claim that isn't permitted in India, or one the product's own ingredient list contradicts." },
  };

  // A banned ingredient gives "Not Recommended" a safety-specific headline.
  const headline = tier === "not-recommended" && hasBannedIngredient
    ? `Contains an ingredient prohibited in cosmetics${banned[0] ? ` (${banned[0].name})` : ""}.`
    : TIER_META[tier].headline;

  return {
    status: tier === "approved" ? "approved" : "not_approved",
    tier,
    tierLabel: TIER_META[tier].label,
    headline,
    gates,
    standard: `${REVIEW_METHODOLOGY_VERSION} · safety · claims · evidence · formula`,
  };
}

/* ═══════════════ Run ═══════════════ */
export type ProductReviewResult =
  | { type: "product-review"; review: ProductReview; verdict: DerivedVerdict }
  | { type: "disambiguation"; query: string; options: { name: string }[] }
  | { type: "out_of_scope" }
  | { type: "error" };

/* ═══════════════ Product review repository ═══════════════
   Every review (any tier) is stored, keyed by the CANONICAL product slug, so
   any phrasing or URL that resolves to the same product serves the same stored
   review. L1 = in-memory; L2 = Supabase public.product_reviews. Defensive. */
const REVIEW_CACHE = new Map<string, ProductReviewResult>();
/* Bump when the rubric/verdict logic changes so stale stored reviews are not served. */
export const RUBRIC_REV = "r6"; // r6: 4-tier stamp rename + code-verified hard-flag guardrails

/* Reviews pulled from the site. Suppressed on every read path (getStored,
   listings, catalogue); the stored row is left intact so it can be restored or
   hard-deleted later. Used for known-wrong source data pending re-review, and for
   removing duplicates (e.g. a second review of the same product created because
   the product couldn't be resolved to a canonical slug - see runProductReview). */
const RETRACTED_SLUGS = new Set<string>([
  "la-roche-posay-cicaplast-balm",
  "moxie-curly-hair-shampoo", // duplicate Moxie shampoo review (AI-generated imagery); other Moxie review kept
]);

/* Verdict logic lives in code, so always re-derive it when serving a stored
   review - verdict rule changes then apply without re-running the model. */
function withFreshVerdict(r: ProductReviewResult): ProductReviewResult {
  return r.type === "product-review" ? { ...r, verdict: deriveVerdict(r.review) } : r;
}

async function getStored(slug: string): Promise<ProductReviewResult | null> {
  if (RETRACTED_SLUGS.has(slug)) return null;
  const mem = REVIEW_CACHE.get(slug);
  if (mem) return withFreshVerdict(mem);
  try {
    const { data } = await createAdminClient()
      .from("product_reviews").select("result, rubric_rev")
      .eq("product_slug", slug).maybeSingle();
    if (data?.result && data.rubric_rev === RUBRIC_REV) {
      const r = data.result as ProductReviewResult;
      REVIEW_CACHE.set(slug, r);
      return withFreshVerdict(r);
    }
  } catch { /* repository unavailable */ }
  return null;
}

/** Public: fetch a stored review by canonical slug WITHOUT re-running the engine.
    Powers the permanent /reviews/[slug] product page for repository products. */
export async function getStoredReview(slug: string): Promise<ProductReviewResult | null> {
  return getStored(slug);
}

/** Drop a slug from the in-memory L1 cache so the next read re-fetches from the
    DB. Called after an admin edits/removes a review so the change shows without a
    redeploy (within the same server instance). */
export function invalidateReviewCache(slug: string): void {
  REVIEW_CACHE.delete(slug);
}

async function store(slug: string, result: ProductReviewResult): Promise<void> {
  REVIEW_CACHE.set(slug, result);
  if (result.type !== "product-review") return;
  try {
    await createAdminClient().from("product_reviews").upsert(
      {
        product_slug: slug,
        product_name: result.review.productName,
        brand: result.review.brand,
        tier: result.verdict.tier,
        image_url: result.review.imageUrl ?? null,
        result,
        rubric_rev: RUBRIC_REV,
        reviewed_at: result.review.reviewedAt ?? new Date().toISOString(),
      },
      { onConflict: "product_slug" },
    );
  } catch { /* repository unavailable */ }
}

/** Public lookup for pages that overlay tiers (e.g. /brands). */
export async function getStoredReviewTier(slug: string): Promise<string | null> {
  if (RETRACTED_SLUGS.has(slug)) return null;
  try {
    const { data } = await createAdminClient()
      .from("product_reviews").select("tier, rubric_rev").eq("product_slug", slug).maybeSingle();
    return data?.rubric_rev === RUBRIC_REV ? (data.tier as string) : null;
  } catch {
    return null;
  }
}

export interface StoredReviewSummary {
  productSlug: string;
  productName: string;
  brand: string;
  tier: string;
  imageUrl: string | null;
  reviewedAt: string;
}

/** Repository listing for /brands: every product the community has had reviewed. */
export async function listStoredReviews(limit = 60): Promise<StoredReviewSummary[]> {
  try {
    const { data } = await createAdminClient()
      .from("product_reviews")
      .select("product_slug, product_name, brand, tier, image_url, reviewed_at")
      .eq("rubric_rev", RUBRIC_REV)
      .order("reviewed_at", { ascending: false })
      .limit(limit);
    return (data ?? []).filter((r) => !RETRACTED_SLUGS.has(String(r.product_slug))).map((r) => ({
      productSlug: String(r.product_slug),
      productName: String(r.product_name ?? ""),
      brand: String(r.brand ?? ""),
      tier: String(r.tier ?? "can-do-better"),
      imageUrl: (r.image_url as string | null) ?? null,
      reviewedAt: String(r.reviewed_at ?? ""),
    }));
  } catch {
    return [];
  }
}

/** Repository products mapped into the static-catalogue tile format, so live
    reviews sit in the /brands grid exactly like curated products. Tiles link
    to the stored review (there is no static detail page for them). */
export async function listRepositoryCatalogueProducts(limit = 60): Promise<import("@/data/brands/types").ProductScorecard[]> {
  try {
    const { data } = await createAdminClient()
      .from("product_reviews")
      .select("product_slug, result, reviewed_at")
      .eq("rubric_rev", RUBRIC_REV)
      .order("reviewed_at", { ascending: false })
      .limit(limit);

    const tierToLegacy: Record<string, "Excellent" | "Good" | "Fair" | "Concern"> =
      { "approved": "Excellent", "mostly-clean": "Good", "can-do-better": "Fair", "not-recommended": "Concern" };
    const num = (s: string | undefined): number | undefined => {
      const m = String(s ?? "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
      return m ? parseFloat(m[1]) : undefined;
    };

    // Rows arrive newest-first: only the latest 5 arrivals (still within 30
    // days) wear the NEW badge.
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    return (data ?? []).flatMap((row, idx) => {
      if (RETRACTED_SLUGS.has(String(row.product_slug))) return [];
      const res = row.result as { review?: ProductReview; verdict?: DerivedVerdict } | null;
      const rv = res?.review;
      if (!rv?.productName) return [];
      // Re-derive the tier from current logic so approval-rule changes apply
      // to already-stored reviews without re-running the batch.
      const tier = deriveVerdict(rv).tier;
      const newArrival = idx < 5 && Date.now() - new Date(String(row.reviewed_at ?? 0)).getTime() < THIRTY_DAYS;
      return [{
        productName: rv.productName,
        slug: String(row.product_slug),
        brand: rv.brand ?? "",
        brandSlug: slugify(rv.brand ?? "", ""),
        priceRange: rv.priceRange || rv.lowestPrice || "",
        productType: "leave-on" as const,
        concern: rv.category ?? "",
        summary: rv.verdict?.cleanSheetTakeaway ?? "",
        score: rv.scores?.total ?? 0,
        scoreLabel: tierToLegacy[tier] ?? "Fair",
        targetUser: rv.targetUser ?? "",
        image: rv.imageUrl ?? "",
        pillars: [],
        keyActives: [],
        ingredients: (rv.inciIngredients ?? []).map((name) => ({ name, note: "", flag: "ok" as const })),
        pass_badges: [],
        warn_badges: [],
        info_badges: [],
        indiaContext: "",
        analyzedAt: rv.reviewedAt ?? String(row.reviewed_at ?? ""),
        category: rv.category,
        price: num(rv.lowestPrice) ?? num(rv.priceRange),
        pricePerUnit: num(rv.pricePerMl),
        sizeUnit: "ml",
        claimsMade: (rv.claimMap ?? []).slice(0, 8).map((c) => c.text),
        freshReview: true,
        reviewTier: tier,
        newArrival,
      }];
    });
  } catch {
    return [];
  }
}

export async function runProductReview(query: string): Promise<ProductReviewResult> {
  const q = query.trim();
  if (!q) return { type: "error" };

  // ── Resolve the product to ONE canonical identity ──
  // Name queries: resolve on INCIDecoder (ambiguous → ask, don't guess).
  // URLs: scrape the page, take its product name, then resolve the same way.
  let inci: INCIResult | null = null;
  // When INCIDecoder has no entry for the product (common for Indian brands and
  // anything launched recently), the full INCI is still usually printed on the
  // brand's own PDP. This holds that page-scraped list so the review grades
  // against the real ingredients instead of reporting "INCI not available".
  let pageInci: import("@/lib/inci-from-page").PageINCI | null = null;
  let pageExcerpt = "";
  let evidenceBlock = "";
  let pageName: string | null = null;

  if (isURL(q)) {
    const page = await fetchPageMarkdown(q);
    if (page) {
      pageExcerpt = productBodyExcerpt(page);
      pageName = titleFromMarkdown(page);
      if (pageName) inci = (await resolveINCI(pageName)).chosen;
      // INCIDecoder missed it → read the INCI straight off the product page.
      if (!inci) pageInci = await fetchInciFromProductPage(q);

      // Brand-published evidence: follow report/study/certificate links and read them.
      const links = evidenceLinksFromMarkdown(page, q);
      const docs: string[] = [];
      for (const link of links.slice(0, 2)) {
        const doc = await fetchPageMarkdown(link, 20000);
        if (doc) docs.push(`SOURCE: ${link}\n${productBodyExcerpt(doc, 4000)}`);
      }
      if (docs.length) {
        evidenceBlock = `\n\nBRAND-PUBLISHED EVIDENCE (linked from the product page - read carefully; a real test report here counts as finished-product evidence, Level 4, or Level 5 if an independent lab is named; extract sample size, method, duration, endpoint):\n${docs.join("\n---\n")}`;
      }
    }
  } else {
    const resolution = await resolveINCI(q);
    if (resolution.ambiguous) {
      return { type: "disambiguation", query: q, options: resolution.distinct.map((d) => ({ name: d.name })) };
    }
    inci = resolution.chosen;
  }

  // ── Repository: same product ⇒ same stored review ──
  const slug = inci?.slug ?? slugify(isURL(q) ? (pageName ?? q) : q, "");
  const stored = await getStored(slug);
  if (stored) return stored;

  // Ground the model in whichever real INCI we retrieved: INCIDecoder first, else
  // the list read off the brand's product page.
  const groundTruth: INCIResult | null =
    inci ??
    (pageInci
      ? { productName: pageName ?? q, slug: "", ingredients: pageInci.ingredients, tags: [], source: pageInci.source, imageUrl: null }
      : null);
  const inciBlock = inciGroundTruthBlock(groundTruth);
  // Anchor the review identity to the resolved product so its name never drifts from
  // the ingredient list we actually used.
  const anchor = inci
    ? `\nThe product under review is exactly: "${inci.productName}". Use this exact identity as productName/brand in your output. Do NOT substitute a different size or variant, and do NOT review a different product than this one.`
    : "";

  const pageBlock = pageExcerpt
    ? `\n\nPRODUCT PAGE CONTENT (scraped from the URL the user provided - treat as the primary source of the product's claims):\n${pageExcerpt}`
    : "";

  const userPrompt = isURL(q)
    ? `Produce a full Clean Sheet Product Review for the product at this URL: ${q}${anchor}\nAlso search Nykaa, Amazon.in, Flipkart and the brand site for its price, claims, and ingredient list.${pageBlock}${evidenceBlock}${inciBlock}`
    : `Produce a full Clean Sheet Product Review for this product: ${q}${anchor}\nSearch its official page and Nykaa, Amazon.in, Flipkart and quick-commerce listings for price, claims, and the ingredient list.${inciBlock}`;

  // Up to 3 attempts: the model occasionally returns malformed or truncated JSON.
  const prompts = [
    userPrompt,
    `${userPrompt}\n\nReturn ONLY the product-review JSON, starting directly with { and ending with }. No prose, no code fence, no trailing commas.`,
    `${userPrompt}\n\nYour previous output was not valid JSON. Return ONLY the complete, valid product-review JSON object.`,
  ];
  let parsed: Record<string, unknown> | null = null;
  for (const p of prompts) {
    parsed = parseJSON(await generateResilient(PRODUCT_REVIEW_SYSTEM_PROMPT, p));
    if (parsed?.type === "out_of_scope") return { type: "out_of_scope" };
    if (isValidProductReview(parsed)) break;
  }
  if (!isValidProductReview(parsed)) return { type: "error" };

  const review = parsed as ProductReview;

  /* Guardrail 2 (corroboration): when we actually scraped a product page and/or
     brand evidence, verify that each claim we might penalise the brand for is
     genuinely present in that text. A red-flag / drug-boundary claim whose
     subject never appears in what we scraped is treated as uncorroborated and
     is NOT hard-flagged - this is what stops an invented claim (e.g. a
     "silicone-free" the brand never made) from dropping a product a tier.
     Name-only queries have no page corpus, so claims stay unmarked (assumed
     made) and only guardrail 1 (INCI truth) applies. */
  markClaimCorroboration(review, `${pageExcerpt}\n${evidenceBlock}`);

  /* Canonical identity + de-dupe. If the product resolved on INCIDecoder, `slug`
     is already canonical. Otherwise it was slugified from the raw query TEXT,
     which (a) makes ugly URLs and (b) lets two differently-worded searches for the
     same product create two separate rows. Now that the model has returned a clean
     brand + product name, recompute a canonical slug and de-dupe against it before
     doing any more work - a second search for the same product now serves the
     existing review instead of creating a duplicate. */
  const canonicalSlug = inci?.slug ?? slugify(review.productName, review.brand);
  if (canonicalSlug !== slug) {
    const existing = await getStored(canonicalSlug);
    if (existing) return existing;
  }

  // Image pulling (all keyless): INCIDecoder photo → pasted-page og:image →
  // Amazon.in/Nykaa search scrape → Google CSE (only if a key is configured).
  // Every candidate is checked for liveness before it is stored: a 404 or
  // hotlink-blocked URL renders as a broken image on the product page forever.
  let imageUrl: string | null = null;
  if (inci?.imageUrl && (await isLiveImage(inci.imageUrl))) imageUrl = inci.imageUrl;
  if (!imageUrl && isURL(q)) imageUrl = await resolveProductImage(q);
  if (!imageUrl) imageUrl = await findProductImageKeyless(review.brand, review.productName);
  if (!imageUrl) {
    const imgQuery = [review.brand, review.productName].filter(Boolean).join(" ");
    imageUrl = await searchProductImage(imgQuery || q, review.brand);
  }
  review.imageUrl = imageUrl;
  review.methodologyVersion = REVIEW_METHODOLOGY_VERSION;
  review.reviewedAt = new Date().toISOString();
  review.productSlug = canonicalSlug;
  // Ground truth for the INCI, best source first: INCIDecoder, then the brand
  // page we scraped, then whatever the model itself transcribed into its
  // per-ingredient reads. Anything present means the analyser and scorecard grade
  // against a real list rather than reporting "INCI not available".
  if (inci) {
    review.inciIngredients = inci.ingredients;
    review.inciSourceUrl = inci.source;
  } else if (pageInci) {
    review.inciIngredients = pageInci.ingredients;
    review.inciSourceUrl = pageInci.source;
  } else if (!review.inciIngredients?.length && review.ingredientReads?.length) {
    review.inciIngredients = review.ingredientReads.map((r) => r.name).filter(Boolean);
  }

  // Auto-grow the ingredient directory: any ingredient of this product that is
  // not already in the directory is added, so /ingredients always holds every
  // ingredient of every scanned product. Enrichment runs as a background job.
  if (review.inciIngredients?.length) {
    try { await addDiscoveredNames(review.inciIngredients); } catch { /* never block a review */ }
  }

  const verdict = deriveVerdict(review);

  // Approved products join the registry (shown as tiles on /review and /brands).
  if (verdict.status === "approved") {
    await upsertVerifiedProduct({
      slug: slugify(review.productName, review.brand),
      productName: review.productName,
      brand: review.brand,
      score: review.scores.total,
      scoreLabel: review.scores.label,
      integrityScore: null,
      imageUrl: review.imageUrl ?? null,
      summary: review.verdict?.cleanSheetTakeaway || review.priceInsight || "",
      usageGuidance: null,
      verifiedAt: review.reviewedAt || new Date().toISOString(),
      methodologyVersion: REVIEW_METHODOLOGY_VERSION,
    });
  }

  const result: ProductReviewResult = { type: "product-review", review, verdict };
  await store(canonicalSlug, result);
  return result;
}
