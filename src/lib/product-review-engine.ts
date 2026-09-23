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
import { upsertVerifiedProduct, slugify, canonicalizeBrand, brandNameVariants } from "@/lib/verified-store";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveConcepts, inciContainsConcept } from "@/lib/ingredient-intel";
import { bannedIngredientsInInci } from "@/lib/ingredient-db";
import { addDiscoveredNames } from "@/lib/ingredient-directory";
import type { ProductReview, DerivedVerdict, ReviewGate, ProductReviewScores, ClaimAnalysis, ProductImageSource } from "@/lib/product-review-types";

export const REVIEW_METHODOLOGY_VERSION = "TCS v3.0";

const isURL = (t: string) => /^https?:\/\//i.test(t.trim());

/* A bare INCI paste (an ingredient list on its own) identifies no product: it
   carries a formula but no brand or product name. Reviews of such scans are shown
   to the user but never added to the public directory - the directory is for
   identified products only. Heuristic: not a URL, and five or more comma / newline
   / semicolon-separated tokens. A typed product name ("Cetaphil Gentle Skin
   Cleanser") has none; a real ingredient list always does. */
function looksLikeInciList(t: string): boolean {
  if (isURL(t)) return false;
  const parts = t.split(/[,\n;]+/).map((s) => s.trim()).filter(Boolean);
  return parts.length >= 5;
}

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

/* Actives that make a product a LICENSED DRUG in India (Drugs & Cosmetics Act),
   not a cosmetic. A product built on any of these is regulated as a medicine and
   is entitled to make treatment claims a cosmetic could not - so it must not be
   scored against the Clean Sheet COSMETIC standard at all. We detect it and mark
   the review "not assessed as a cosmetic" rather than condemning it for claims it
   is actually licensed to make. Salicylic acid, niacinamide, zinc pyrithione,
   piroctone olamine, climbazole and the like are cosmetic actives and are NOT on
   this list. */
const LICENSED_DRUG_ACTIVES: { re: RegExp; name: string }[] = [
  { re: /ketoconazole/i, name: "Ketoconazole" },
  { re: /\bminoxidil\b/i, name: "Minoxidil" },
  { re: /selenium\s+sul(f|ph)ide/i, name: "Selenium sulfide" },
  { re: /coal\s+tar/i, name: "Coal tar" },
  { re: /\bclindamycin\b/i, name: "Clindamycin" },
  { re: /\berythromycin\b/i, name: "Erythromycin" },
  { re: /benzoyl\s+peroxide/i, name: "Benzoyl peroxide" },
  { re: /\btretinoin\b|retinoic\s+acid/i, name: "Tretinoin" },
  { re: /\badapalene\b/i, name: "Adapalene" },
  { re: /\bciclopirox\b/i, name: "Ciclopirox" },
  { re: /\bmupirocin\b/i, name: "Mupirocin" },
  { re: /\bterbinafine\b/i, name: "Terbinafine" },
  { re: /\bfluconazole\b/i, name: "Fluconazole" },
  { re: /\bpermethrin\b/i, name: "Permethrin" },
];

/** Drug actives found in the retrieved INCI. Empty when none (or no INCI). */
function licensedDrugActivesInInci(inci: string[]): string[] {
  if (!inci.length) return [];
  const joined = inci.join(" · ");
  return LICENSED_DRUG_ACTIVES.filter((d) => d.re.test(joined)).map((d) => d.name);
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

/* Corroboration corpus for a NAME query (guardrail 2, path-parity fix).
   A URL paste gives markClaimCorroboration a real page to check hard-flag claims
   against; a name query historically gave it nothing, so the SAME product could
   be condemned on the model's word when searched by name yet cleared when pasted
   as a link. This resolves the product's marketplace listing (Amazon.in, Nykaa)
   the same way a shopper would and scrapes it, so a name query corroborates hard
   flags against a source we actually read - just like the URL path. Best-effort
   and keyless: on a miss it returns "", and the caller falls back to the prior
   name-query behaviour. Amazon + Nykaa run in parallel to bound latency. */
async function marketplaceListingCorpus(brand: string, productName: string): Promise<string> {
  const query = [brand, productName].filter(Boolean).join(" ").trim();
  if (!query) return "";
  const enc = encodeURIComponent(query);
  const sources: { search: string; pdp: RegExp }[] = [
    { search: `https://www.amazon.in/s?k=${enc}`, pdp: /https?:\/\/www\.amazon\.in\/[^)\s]*dp\/[A-Z0-9]{10}/i },
    { search: `https://www.nykaa.com/search/result/?q=${enc}`, pdp: /https?:\/\/www\.nykaa\.com\/[^)\s]+\/p\/\d+/i },
  ];
  const parts = await Promise.all(
    sources.map(async ({ search, pdp }) => {
      const searchMd = await fetchPageMarkdown(search, 30000);
      if (!searchMd) return "";
      // Prefer the actual product page (full claim text); the top result for a
      // "[brand] [product]" search is almost always this product. If we grab a
      // near-miss, the hard-flag claim simply won't be found there and is voided
      // - erring toward NOT condemning, the safe direction.
      const url = searchMd.match(pdp)?.[0];
      if (url) {
        const pdpMd = await fetchPageMarkdown(url, 40000);
        if (pdpMd) return productBodyExcerpt(pdpMd, 4000);
      }
      return productBodyExcerpt(searchMd, 2500); // fall back to search-page blurbs
    }),
  );
  return parts.filter(Boolean).join("\n---\n");
}

/* ═══════════════ Derived standing (computed in code) ═══════════════
   Four standings, best → worst. "Clean Sheet Recommended" must mean the CLAIMS
   themselves hold up - not just a good blended score - so the top tier is gated
   on the claim-evidence dimension. "Not Recommended" is the ONLY negative-naming
   tier and requires a code-verified problem. Missing proof is "Room to Improve",
   never "Not Recommended". Full definitions in STAMPS.md. */
export const APPROVAL_BAR = 85;
const CLAIM_EVIDENCE_BAR = 15; // out of 20 - headline claims carry finished-product / clinical proof

/* ═══════════════ Code-authoritative scoring (the maths) ═══════════════
   The model returns a score for each of the seven sections AND a `total`, but
   the total is the number the verdict tier is gated on, so it must be OUR sum,
   not the model's. The model can (and does) return a `total` that doesn't equal
   the sum of its own sections, or a section above its cap - both would let an
   inflated `total` reach the approval bar. reconcileScores is the one place the
   arithmetic is enforced: every section is clamped to its published maximum, the
   total is recomputed as the code sum, and the band label is derived from that
   sum. The model researches the parts; the code adds them up. */
const SECTION_MAX: Record<keyof Omit<ProductReviewScores, "total" | "label">, number> = {
  priceFairness: 10,
  claimClarity: 15,
  claimEvidence: 20,
  ingredientTransparency: 20,
  formulaLogic: 15,
  consumerSuitability: 10,
  platformConsistency: 10,
};
// The /100 scale is the sum of the section caps. Assert it at module load so a
// future section-cap edit that breaks the scale fails loudly instead of silently
// shifting every score and tier.
const TOTAL_MAX = 100;
{
  const capSum = Object.values(SECTION_MAX).reduce((a, b) => a + b, 0);
  if (capSum !== TOTAL_MAX) {
    throw new Error(`Clean Sheet section caps sum to ${capSum}, expected ${TOTAL_MAX}`);
  }
}

/** Band label for a /100 total, matching the SCORING SYSTEM bands in the prompt.
    Derived from the code total so the label can never contradict the sum. */
function totalLabel(total: number): ProductReviewScores["label"] {
  if (total >= 85) return "Clean Sheet Strong";
  if (total >= 75) return "Mostly Transparent";
  if (total >= 55) return "Needs More Clarity";
  if (total >= 40) return "High Claim Risk";
  return "Consumer Confusion Risk";
}

const clampSection = (v: unknown, max: number): number => {
  const n = typeof v === "number" && Number.isFinite(v) ? v : 0;
  return Math.max(0, Math.min(max, Math.round(n)));
};

/* The Claim Evidence section (20 pts) is the single biggest reward and one of
   the two gates on approval, yet the model both grades it AND assigns each
   claim's evidenceLevel - so it can hand out 18/20 while its own claimMap shows
   nothing better than borrowed ingredient research. This turns the prompt's own
   Section-3 banding into a code CEILING: claimEvidence can be no higher than the
   best finished-product evidence actually present in the claimMap supports.
     max evidenceLevel 6-7 (clinical / published) → up to 20
     max evidenceLevel 4-5 (finished-product / third-party) → up to 17
     max evidenceLevel 3   (active % disclosed only)        → up to 13
     max evidenceLevel 2   (ingredient research only)       → up to 7
     max evidenceLevel ≤1 / no claims                       → up to 2
   Because the approval bar is claimEvidence ≥ 15, approval now REQUIRES at least
   one substantive claim at Level 4+ (a real finished-product test), matching the
   prompt's "an ingredient study is Level 2 for a finished-product claim" rule.
   Only downward: it never raises the model's own number. Emotional puffery and
   claims the corroboration guardrail rejected (corroborated===false) cannot
   supply the evidence, so feel-good or fabricated claims can't lift the ceiling. */
export function evidenceCeiling(claimMap: ClaimAnalysis[] | undefined): number {
  const levels = (claimMap ?? [])
    .filter((c) => c.corroborated !== false && c.primaryType !== "emotional")
    .map((c) => (typeof c.evidenceLevel === "number" ? c.evidenceLevel : 0));
  const max = levels.length ? Math.max(...levels) : 0;
  if (max >= 6) return 20;
  if (max >= 4) return 17;
  if (max >= 3) return 13;
  if (max >= 2) return 7;
  return 2;
}

export interface ReconciledScores {
  /** Section scores clamped to their caps, total recomputed as the code sum,
      label derived from that total. */
  scores: ProductReviewScores;
  /** The total the model claimed (0 if it returned none), for audit / logging. */
  modelTotal: number;
  /** code total − model total. Non-zero means the model's arithmetic was off. */
  delta: number;
}

/** Recompute a review's `total` and `label` from its section scores in code.
    Sections are clamped to their caps first, so neither an out-of-range section
    nor a mismatched model `total` can inflate a product toward the approval bar.
    When `opts.evidenceCeiling` is given (from evidenceCeiling(claimMap)),
    claimEvidence is additionally capped to what the structured evidence supports
    before the total is summed - so the reward and the total both reflect the real
    evidence, not the model's asserted number. */
export function reconcileScores(
  raw: Partial<ProductReviewScores> | undefined,
  opts?: { evidenceCeiling?: number },
): ReconciledScores {
  const priceFairness = clampSection(raw?.priceFairness, SECTION_MAX.priceFairness);
  const claimClarity = clampSection(raw?.claimClarity, SECTION_MAX.claimClarity);
  let claimEvidence = clampSection(raw?.claimEvidence, SECTION_MAX.claimEvidence);
  if (typeof opts?.evidenceCeiling === "number") claimEvidence = Math.min(claimEvidence, opts.evidenceCeiling);
  const ingredientTransparency = clampSection(raw?.ingredientTransparency, SECTION_MAX.ingredientTransparency);
  const formulaLogic = clampSection(raw?.formulaLogic, SECTION_MAX.formulaLogic);
  const consumerSuitability = clampSection(raw?.consumerSuitability, SECTION_MAX.consumerSuitability);
  const platformConsistency = clampSection(raw?.platformConsistency, SECTION_MAX.platformConsistency);

  const total = Math.min(
    TOTAL_MAX,
    priceFairness + claimClarity + claimEvidence + ingredientTransparency +
      formulaLogic + consumerSuitability + platformConsistency,
  );
  const modelTotal = typeof raw?.total === "number" && Number.isFinite(raw.total) ? Math.round(raw.total) : 0;

  return {
    scores: {
      priceFairness, claimClarity, claimEvidence, ingredientTransparency,
      formulaLogic, consumerSuitability, platformConsistency,
      total,
      label: totalLabel(total),
    },
    modelTotal,
    delta: total - modelTotal,
  };
}

/** reconcileScores for a whole review: applies the code arithmetic AND the
    evidence ceiling derived from the review's own claimMap. This is the form the
    engine uses everywhere a full review is in hand; call reconcileScores directly
    only when the claimMap is genuinely unavailable. */
export function reconcileReviewScores(review: Pick<ProductReview, "scores" | "claimMap">): ReconciledScores {
  return reconcileScores(review.scores, { evidenceCeiling: evidenceCeiling(review.claimMap) });
}

export function deriveVerdict(r: ProductReview): DerivedVerdict {
  // Grade against the CODE total (with the evidence ceiling applied), never the
  // model's own `total` or its unverified claimEvidence number.
  const norm = reconcileReviewScores(r).scores;
  const evidencePts = norm.claimEvidence;                // out of 20
  const formulaPts = norm.formulaLogic;                  // out of 15
  const total = norm.total;                              // out of 100
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

  // Hard flags come in three kinds, and they no longer carry the same weight:
  //   - "contradiction": the claim is factually false about THIS product - an
  //     ingredient claim the retrieved INCI contradicts (e.g. "with Ketoconazole"
  //     on an INCI that has none, or a "free-from" that the INCI disproves). A
  //     product that lies about its own contents is Not Recommended.
  //   - "fairness": a skin-whitening / fairness / skin-lightening claim. India
  //     (ASCI) treats these as a public-harm category, so The Clean Sheet does
  //     NOT soften them - they stay Not Recommended even when the product is
  //     otherwise safe. (Cosmetic "brightening" / "dark-spot" claims are not
  //     fairness claims and are not caught here.)
  //   - "boundary": other drug-territory treatment LANGUAGE ("eliminates
  //     dandruff", "cures acne") on a product that is otherwise safe and honestly
  //     labelled. A claims/ASCI overreach, not a safety or honesty failure, so it
  //     caps the standing at "Room to Improve" rather than the worst tier.
  const CONTRADICTION_CTX_RE = /contradict|not listed in|inci lists|own ingredient|absent from|no .*in the (inci|ingredient)/i;
  const FAIRNESS_RE = /\b(whiten(?:s|ed|ing)?|fairness|skin[\s-]+lighten(?:s|ed|ing)?|permanent(?:ly)?[\s-]+(?:whiten|lighten|fair))/i;
  type HardKind = "contradiction" | "fairness" | "boundary";
  const hardClassified: { c: ClaimAnalysis; kind: HardKind }[] = [];

  for (const c of r.claimMap ?? []) {
    // Guardrail 2: a claim the engine could not corroborate in any scraped
    // source is never counted - it may be a hallucination.
    if (c.corroborated === false) continue;

    const ctx = `${c.text} ${c.evidenceNote ?? ""} ${c.asciNote ?? ""} ${c.drugBoundaryNote ?? ""}`;
    const isDrugBoundary = c.drugBoundaryRisk && !SPF_LABEL_RE.test(c.text);
    const isRedFlag = c.riskLevel === "red-flag" && HARD_RED_RE.test(ctx);
    if (!isDrugBoundary && !isRedFlag) continue;

    // Guardrail 1: if this is an ingredient (free-from / contains) claim, the
    // contradiction must be code-confirmed against the retrieved INCI. Absent
    // confirmation, void it. Drug-boundary treatment claims are not INCI claims
    // and pass through (still subject to guardrail 2 above).
    if (isIngredientClaim(c.text) && !isDrugBoundary) {
      // A free-from contradiction may only stand when it was corroborated in a
      // scraped source. On a name-only query, where no page was read, we cannot
      // confirm the brand ever made the claim, so we do NOT let it force "Not
      // Recommended" (the conservative, defensible direction).
      if (c.corroborated !== true) continue;
      if (!inciConfirmsContradiction(c.text, inci)) continue;
      hardClassified.push({ c, kind: "contradiction" });
      continue;
    }

    // Fairness/whitening stays severe; a red-flag whose context names an INCI
    // contradiction is a contradiction; everything else is a boundary overreach.
    const kind: HardKind =
      FAIRNESS_RE.test(ctx) ? "fairness"
      : !isDrugBoundary && CONTRADICTION_CTX_RE.test(ctx) ? "contradiction"
      : "boundary";
    hardClassified.push({ c, kind });
  }

  const hardClaims = hardClassified.map((x) => x.c);
  const contradictionFlags = hardClassified.filter((x) => x.kind === "contradiction").length;
  const fairnessFlags = hardClassified.filter((x) => x.kind === "fairness").length;
  const boundaryFlags = hardClassified.filter((x) => x.kind === "boundary").length;

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

  // The banned-ingredient screen can only clear a product it can actually read.
  // With NO retrieved INCI (common for Indian / newly-launched brands not on
  // INCIDecoder and without a scrapable PDP list), bannedIngredientsInInci([])
  // trivially returns nothing - "no banned ingredient FOUND" is not "safe",
  // it is "not checked". Unverified safety must not earn the top stamp (a
  // prohibited fairness active like hydroquinone would slip straight through),
  // so a retrieved INCI is required for approval. It is NOT grounds to condemn:
  // missing data is never "Not Recommended".
  const safetyVerifiable = inci.length > 0;

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
      passed: safetyVerifiable && !hasBannedIngredient,
      detail: hasBannedIngredient
        ? `Contains an ingredient prohibited in cosmetics: ${banned.map((b) => b.name).join(", ")}`
        : !safetyVerifiable
          ? "No ingredient list could be retrieved, so the safety screen could not run - approval is withheld until an INCI is available"
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

  // A licensed drug is regulated as a medicine, not a cosmetic. It is entitled to
  // make treatment claims a cosmetic could not, so scoring it on the Clean Sheet
  // cosmetic standard would be a category error. Detect it and exclude it with a
  // note rather than condemning it. This gate wins over every cosmetic tier below.
  const drugActives = licensedDrugActivesInInci(inci);
  const isDrug = drugActives.length > 0;

  /* Cosmetic standing ladder (best → worst). Two changes from the old rule:
     - not-recommended is now reserved for a product that is UNSAFE or DISHONEST
       about itself - a banned ingredient, or a claim its own INCI contradicts.
       A safe, honestly-labelled product does not land here just for aggressive
       ad copy.
     - a drug-boundary treatment CLAIM ("eliminates dandruff", "cures acne") on
       an otherwise safe product caps the standing at "Room to Improve" - a
       claims-overreach flag, not a condemnation. Missing proof is never
       "not-recommended". */
  const claimsHoldUp = evidencePts >= CLAIM_EVIDENCE_BAR;
  const cosmeticTier: DerivedVerdict["tier"] =
    (contradictionFlags > 0 || fairnessFlags > 0 || hasBannedIngredient)
      ? "not-recommended"
      : boundaryFlags > 0
        ? "can-do-better"
        : total >= APPROVAL_BAR && claimsHoldUp && safetyVerifiable
          ? "approved"
          : total >= 65
            ? "mostly-clean"
            : "can-do-better";

  const tier: DerivedVerdict["tier"] = isDrug ? "not-assessed" : cosmeticTier;

  const TIER_META: Record<DerivedVerdict["tier"], { label: string; headline: string }> = {
    "approved":         { label: "Clean Sheet Recommended", headline: "Claims hold up to the evidence." },
    "mostly-clean":     { label: "Good Standing",           headline: "A well-made, transparent product; some claims rest on ingredient evidence rather than finished-product proof." },
    "can-do-better":    { label: "Room to Improve",         headline: "Nothing wrong here, but the proof and transparency don't yet match the claims." },
    "not-recommended":  { label: "Not Recommended",         headline: "Makes a claim its own ingredient list contradicts, or contains an ingredient prohibited in cosmetics." },
    "not-assessed":     { label: "Licensed Drug",           headline: "Regulated as a drug in India, not a cosmetic, so it is not scored on the Clean Sheet cosmetic standard." },
  };

  const headline = isDrug
    ? `Regulated as a drug in India (contains ${drugActives.join(", ")}), so it is assessed as a licensed medicine, not against the Clean Sheet cosmetic standard.`
    : tier === "not-recommended" && hasBannedIngredient
      ? `Contains an ingredient prohibited in cosmetics${banned[0] ? ` (${banned[0].name})` : ""}.`
      : tier === "not-recommended" && fairnessFlags > 0 && contradictionFlags === 0
        ? "Makes a skin-whitening or fairness claim, a category India (ASCI) treats as misleading and harmful."
        : TIER_META[tier].headline;

  return {
    status: tier === "approved" ? "approved" : "not_approved",
    tier,
    tierLabel: TIER_META[tier].label,
    headline,
    gates,
    standard: `${REVIEW_METHODOLOGY_VERSION} · safety · claims · evidence · formula`,
    ...(isDrug ? { isDrug, drugActives } : {}),
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
/* L1 entries carry the time they were cached. Without a TTL, a warm serverless
   instance would serve a stored review forever, so an out-of-band DB repair
   (e.g. scripts/backfill-review-inci.mts fixing a missing INCI) would not surface
   until the instance recycled or the app redeployed. A short TTL bounds that
   staleness to minutes without a redeploy. In-app edits still call
   invalidateReviewCache for an immediate refresh. */
const REVIEW_CACHE = new Map<string, { result: ProductReviewResult; at: number }>();
const REVIEW_CACHE_TTL_MS = 5 * 60 * 1000; // 5 min, matches the page's ISR revalidate
/* Bump when the rubric/verdict logic changes so stale stored reviews are not served. */
export const RUBRIC_REV = "r7"; // r7: total code-summed from sections + claimEvidence capped to the finished-product evidence actually in claimMap + approval requires a retrieved INCI; r6: 4-tier stamp rename + code-verified hard-flag guardrails

/* Reviews pulled from the site. Suppressed on every read path (getStored,
   listings, catalogue); the stored row is left intact so it can be restored or
   hard-deleted later. Used for known-wrong source data pending re-review, and for
   removing duplicates (e.g. a second review of the same product created because
   the product couldn't be resolved to a canonical slug - see runProductReview). */
const RETRACTED_SLUGS = new Set<string>([
  "la-roche-posay-cicaplast-balm",
  "moxie-curly-hair-shampoo", // duplicate Moxie shampoo review (AI-generated imagery); other Moxie review kept
  // Duplicate of the same product under the old brand name "Minimalist" (the
  // company rebranded to "Be Minimalist"). The brand-PDP scrape flagged two
  // drug-boundary claims ("treats dandruff & itching", "eliminates ...fungus")
  // so it derived Not Recommended, while the INCIDecoder-sourced "Be Minimalist"
  // row never saw those claims and derived Approved. Same INCI, same product.
  // The "be-minimalist-..." row (real image + INCI source) is the keeper.
  "minimalist-cph-complex-oligopeptide-0-8-anti-dandruff-serum",
]);

/* Verdict logic lives in code, so always re-derive it when serving a stored
   review - verdict rule changes then apply without re-running the model. The
   review's `total`/`label` are re-summed from the sections at the same time, so a
   row stored before code-authoritative scoring self-heals on read: the displayed
   total and the tier badge are both the current code sum, no backfill required. */
function withFreshVerdict(r: ProductReviewResult): ProductReviewResult {
  if (r.type !== "product-review") return r;
  const review = { ...r.review, scores: reconcileReviewScores(r.review).scores };
  return { ...r, review, verdict: deriveVerdict(review) };
}

async function getStored(slug: string): Promise<ProductReviewResult | null> {
  if (RETRACTED_SLUGS.has(slug)) return null;
  const mem = REVIEW_CACHE.get(slug);
  if (mem && Date.now() - mem.at < REVIEW_CACHE_TTL_MS) return withFreshVerdict(mem.result);
  try {
    const { data } = await createAdminClient()
      .from("product_reviews").select("result, rubric_rev")
      .eq("product_slug", slug).maybeSingle();
    if (data?.result && data.rubric_rev === RUBRIC_REV) {
      const r = data.result as ProductReviewResult;
      REVIEW_CACHE.set(slug, { result: r, at: Date.now() });
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

/** An admin-pinned image must survive a fresh re-review, so we read it straight
    from the stored row IGNORING the rubric gate (a RUBRIC_REV bump forces a fresh
    run, but the human-corrected photo underneath it still stands). Returns the
    locked URL only when `imageLocked` is set. */
async function getPinnedImage(slug: string): Promise<string | null> {
  try {
    const { data } = await createAdminClient()
      .from("product_reviews").select("result").eq("product_slug", slug).maybeSingle();
    const rv = (data?.result as ProductReviewResult | undefined);
    const review = rv && rv.type === "product-review" ? rv.review : undefined;
    if (review?.imageLocked && review.imageUrl) return review.imageUrl;
  } catch { /* repository unavailable */ }
  return null;
}

/** Drop a slug from the in-memory L1 cache so the next read re-fetches from the
    DB. Called after an admin edits/removes a review so the change shows without a
    redeploy (within the same server instance). */
export function invalidateReviewCache(slug: string): void {
  REVIEW_CACHE.delete(slug);
}

async function store(slug: string, result: ProductReviewResult): Promise<void> {
  REVIEW_CACHE.set(slug, { result, at: Date.now() });
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
      // Re-derive the tier AND re-sum the score from current logic so scoring /
      // approval-rule changes apply to already-stored reviews without re-running
      // the batch (this read path bypasses withFreshVerdict).
      const codeScore = reconcileReviewScores(rv).scores.total;
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
        score: codeScore,
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

  /* Collapse historical brand names to one canonical identity BEFORE the slug is
     computed, so a rebrand (Minimalist → Be Minimalist) can't store the same
     product twice under two names. */
  review.brand = canonicalizeBrand(review.brand);

  /* Guardrail 2 (corroboration): verify that each claim we might penalise the
     brand for is genuinely present in a source we actually read. A red-flag /
     drug-boundary claim whose subject never appears is treated as uncorroborated
     and is NOT hard-flagged - this stops an invented claim (e.g. a "silicone-free"
     the brand never made) from dropping a product a tier.
     Path parity (#4): a URL paste corroborates against the scraped page; a name
     query now corroborates against the product's marketplace listing, fetched the
     same way. So the SAME product no longer earns a different verdict depending on
     whether it was searched by name or by link. If the listing can't be fetched,
     the corpus is empty and the prior name-query behaviour (guardrail 1 only)
     applies. */
  const corroborationCorpus = isURL(q)
    ? `${pageExcerpt}\n${evidenceBlock}`
    : await marketplaceListingCorpus(review.brand, review.productName);
  markClaimCorroboration(review, corroborationCorpus);

  /* Canonical identity + de-dupe. If the product resolved on INCIDecoder, `slug`
     is already canonical. Otherwise it was slugified from the raw query TEXT,
     which (a) makes ugly URLs and (b) lets two differently-worded searches for the
     same product create two separate rows. Now that the model has returned a clean
     brand + product name, recompute a canonical slug and de-dupe against it before
     doing any more work - a second search for the same product now serves the
     existing review instead of creating a duplicate. */
  const canonicalSlug = inci?.slug ?? slugify(review.productName, review.brand);
  // De-dupe across every historical brand spelling (a rebrand must not create a
  // twin review) plus the INCIDecoder slug, so a re-search of a product already
  // stored under any of its names serves the existing review.
  const dedupeSlugs = new Set<string>([
    canonicalSlug,
    ...brandNameVariants(review.brand).map((b) => slugify(review.productName, b)),
  ]);
  for (const candidate of dedupeSlugs) {
    if (candidate === slug) continue;
    const existing = await getStored(candidate);
    if (existing) return existing;
  }

  // Image pulling (all keyless): INCIDecoder photo → pasted-page og:image →
  // Amazon.in/Nykaa search scrape → Google CSE (only if a key is configured).
  // Every candidate is checked for liveness before it is stored: a 404 or
  // hotlink-blocked URL renders as a broken image on the product page forever.
  let imageUrl: string | null = null;
  let imageSource: ProductImageSource | null = null;
  let imageConfidence: number | null = null;
  let imageLocked = false;

  // #4 — Honour an admin-pinned image first: a fresh re-review (e.g. after a
  // RUBRIC_REV bump) must not clobber a human-corrected photo. Checked against
  // both the canonical slug and the incoming slug the row may still live under.
  const pinned = (await getPinnedImage(canonicalSlug)) ?? (canonicalSlug !== slug ? await getPinnedImage(slug) : null);
  if (pinned) { imageUrl = pinned; imageSource = "manual"; imageLocked = true; }

  if (!imageUrl && inci?.imageUrl && (await isLiveImage(inci.imageUrl))) { imageUrl = inci.imageUrl; imageSource = "inci"; }
  if (!imageUrl && isURL(q)) { const u = await resolveProductImage(q); if (u) { imageUrl = u; imageSource = "page"; } }
  if (!imageUrl) {
    const pick = await findProductImageKeyless(review.brand, review.productName);
    if (pick) { imageUrl = pick.url; imageSource = pick.source; imageConfidence = pick.confidence; }
  }
  if (!imageUrl) {
    const imgQuery = [review.brand, review.productName].filter(Boolean).join(" ");
    const pick = await searchProductImage(imgQuery || q, review.brand);
    if (pick) { imageUrl = pick.url; imageSource = pick.source; imageConfidence = pick.confidence; }
  }
  review.imageUrl = imageUrl;
  review.imageSource = imageSource ?? undefined;
  review.imageConfidence = imageConfidence;
  review.imageLocked = imageLocked;
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

  // Code owns the arithmetic: overwrite the model's `total`/`label` with the code
  // sum of the (clamped, evidence-ceilinged) sections before the review is graded
  // or stored, so an inflated total or an unbacked claimEvidence number can never
  // reach the approval bar. Runs after markClaimCorroboration so the ceiling
  // ignores claims the corroboration guardrail rejected.
  review.scores = reconcileReviewScores(review).scores;

  const verdict = deriveVerdict(review);

  // A scan of a bare INCI list (no URL, no product name) has no confirmed product
  // identity, so its review is returned to the user but kept OUT of the public
  // directory - neither the /brands repository grid nor the verified library.
  const productIdentified = isURL(q) || !!inci || !looksLikeInciList(q);

  // Approved products join the registry (shown as tiles on /review and /brands).
  if (verdict.status === "approved" && productIdentified) {
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
  // Persist to the repository (which feeds the /brands directory grid) only for an
  // identified product. An unidentified INCI-only scan is cached in-process so a
  // repeat paste this session is instant, but it never reaches the directory DB.
  if (productIdentified) {
    await store(canonicalSlug, result);
  } else {
    REVIEW_CACHE.set(canonicalSlug, { result, at: Date.now() });
  }
  return result;
}
