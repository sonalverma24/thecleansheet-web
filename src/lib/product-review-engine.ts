/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Product Review engine ("v3.0")
   Runs the original PRODUCT_REVIEW_SYSTEM_PROMPT (grounded web search),
   pulls a product image, and DERIVES an approved / not-approved verdict
   in code from the review's own signals (drug-boundary / red-flag claims,
   claim evidence, formula overreach). The LLM researches; code decides.
──────────────────────────────────────────────────────────────── */

import { PRODUCT_REVIEW_SYSTEM_PROMPT } from "@/lib/product-review-context";
import { generateResilient } from "@/lib/gemini";
import { resolveProductImage, searchProductImage } from "@/lib/product-image";
import { resolveINCI, inciGroundTruthBlock } from "@/lib/inci-fetch";
import type { INCIResult } from "@/lib/inci-fetch";
import { fetchPageMarkdown, titleFromMarkdown, productBodyExcerpt, evidenceLinksFromMarkdown } from "@/lib/scrape";
import { upsertVerifiedProduct, slugify } from "@/lib/verified-store";
import { createAdminClient } from "@/lib/supabase/admin";
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

/* ═══════════════ Derived approved / not-approved verdict ═══════════════
   Deterministic and simple: score >= APPROVAL_BAR approves, with ONE hard
   block — a genuine India drug-boundary / unlawful claim. Red-flag counts
   and evidence gaps already shape the score itself; they do not double-
   penalise here. (75 matches the analyser's FORMULA_BAR.) */
export const APPROVAL_BAR = 75;

export function deriveVerdict(r: ProductReview): DerivedVerdict {
  const drugBoundary = r.claimSummary?.drugBoundaryCount ?? 0;
  const evidencePts = r.scores?.claimEvidence ?? 0;      // out of 20
  const formulaPts = r.scores?.formulaLogic ?? 0;        // out of 15
  const total = r.scores?.total ?? 0;                    // out of 100
  const overreach = r.formulaLogic?.claimOverreach === true;

  // Gates are informational; only `lawful` can block on its own.
  const lawful = drugBoundary === 0;
  const honest = evidencePts >= 10;                      // ≥ half the evidence points
  // Material overreach = flagged AND the formula score itself is mediocre.
  // A strong formula (11+/15) with one ambitious claim noted passes with a caveat.
  const materialOverreach = overreach && formulaPts < 11;
  const soundFormula = formulaPts >= 8 && !materialOverreach;

  const gates: ReviewGate[] = [
    {
      id: "claims",
      label: "Lawful claims",
      passed: lawful,
      detail: lawful
        ? "No drug-boundary or unlawful claims found"
        : `${drugBoundary} claim(s) cross the India drug-cosmetic boundary`,
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

  /* 4-tier ladder. "Misleading" fires ONLY on hard triggers: a genuine India
     drug-boundary claim, or a red-flag (unlawful language / claim contradicted
     by the brand's own INCI). Missing proof is NEVER "misleading". */
  const redFlags = r.claimSummary?.byRisk?.redFlag ?? 0;
  const tier: DerivedVerdict["tier"] =
    drugBoundary > 0 || redFlags > 0
      ? "misleading"
      : total >= APPROVAL_BAR
        ? "approved"
        : total >= 60
          ? "mostly-clean"
          : "needs-proof";

  const TIER_META: Record<DerivedVerdict["tier"], { label: string; headline: string }> = {
    "approved":     { label: "Clean Sheet Approved", headline: "Claims hold up to the evidence." },
    "mostly-clean": { label: "Mostly Clean",         headline: "A solid product with specific gaps between claims and visible proof." },
    "needs-proof":  { label: "Needs Proof",          headline: "The claims may be honest, but the proof isn't publicly visible yet." },
    "misleading":   { label: "Misleading Claims",    headline: "Makes claims that aren't permitted or are contradicted by its own ingredient list." },
  };

  return {
    status: tier === "approved" ? "approved" : "not_approved",
    tier,
    tierLabel: TIER_META[tier].label,
    headline: TIER_META[tier].headline,
    gates,
    standard: `${REVIEW_METHODOLOGY_VERSION} · claims · evidence · formula`,
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
export const RUBRIC_REV = "r4";

/* Verdict logic lives in code, so always re-derive it when serving a stored
   review — verdict rule changes then apply without re-running the model. */
function withFreshVerdict(r: ProductReviewResult): ProductReviewResult {
  return r.type === "product-review" ? { ...r, verdict: deriveVerdict(r.review) } : r;
}

async function getStored(slug: string): Promise<ProductReviewResult | null> {
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
  try {
    const { data } = await createAdminClient()
      .from("product_reviews").select("tier, rubric_rev").eq("product_slug", slug).maybeSingle();
    return data?.rubric_rev === RUBRIC_REV ? (data.tier as string) : null;
  } catch {
    return null;
  }
}

export async function runProductReview(query: string): Promise<ProductReviewResult> {
  const q = query.trim();
  if (!q) return { type: "error" };

  // ── Resolve the product to ONE canonical identity ──
  // Name queries: resolve on INCIDecoder (ambiguous → ask, don't guess).
  // URLs: scrape the page, take its product name, then resolve the same way.
  let inci: INCIResult | null = null;
  let pageExcerpt = "";
  let evidenceBlock = "";
  let pageName: string | null = null;

  if (isURL(q)) {
    const page = await fetchPageMarkdown(q);
    if (page) {
      pageExcerpt = productBodyExcerpt(page);
      pageName = titleFromMarkdown(page);
      if (pageName) inci = (await resolveINCI(pageName)).chosen;

      // Brand-published evidence: follow report/study/certificate links and read them.
      const links = evidenceLinksFromMarkdown(page, q);
      const docs: string[] = [];
      for (const link of links.slice(0, 2)) {
        const doc = await fetchPageMarkdown(link, 20000);
        if (doc) docs.push(`SOURCE: ${link}\n${productBodyExcerpt(doc, 4000)}`);
      }
      if (docs.length) {
        evidenceBlock = `\n\nBRAND-PUBLISHED EVIDENCE (linked from the product page — read carefully; a real test report here counts as finished-product evidence, Level 4, or Level 5 if an independent lab is named; extract sample size, method, duration, endpoint):\n${docs.join("\n---\n")}`;
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

  const inciBlock = inciGroundTruthBlock(inci);
  // Anchor the review identity to the resolved product so its name never drifts from
  // the ingredient list we actually used.
  const anchor = inci
    ? `\nThe product under review is exactly: "${inci.productName}". Use this exact identity as productName/brand in your output. Do NOT substitute a different size or variant, and do NOT review a different product than this one.`
    : "";

  const pageBlock = pageExcerpt
    ? `\n\nPRODUCT PAGE CONTENT (scraped from the URL the user provided — treat as the primary source of the product's claims):\n${pageExcerpt}`
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

  // Image pulling: INCIDecoder product photo first (reliable, no API key),
  // then page scrape (URLs), then Google CSE if configured.
  let imageUrl: string | null = inci?.imageUrl ?? null;
  if (!imageUrl && isURL(q)) imageUrl = await resolveProductImage(q);
  if (!imageUrl) {
    const imgQuery = [review.brand, review.productName].filter(Boolean).join(" ");
    imageUrl = await searchProductImage(imgQuery || q);
  }
  review.imageUrl = imageUrl;
  review.methodologyVersion = REVIEW_METHODOLOGY_VERSION;
  review.reviewedAt = new Date().toISOString();
  review.productSlug = slug;
  if (inci) {
    review.inciIngredients = inci.ingredients;
    review.inciSourceUrl = inci.source;
  }

  const verdict = deriveVerdict(review);

  // Approved products join the registry (shown as tiles on /review and /verified).
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
  await store(slug, result);
  return result;
}
