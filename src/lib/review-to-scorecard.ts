/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Live review → scorecard mapper
   Converts a stored ProductReview (+ derived verdict) into the
   ProductScorecard + Brand shapes so live reviews render in THE one
   product-page format (ProductScorecardView). Pure mapping, no I/O.
──────────────────────────────────────────────────────────────── */

import type { ProductReview, DerivedVerdict, ClaimAnalysis } from "@/lib/product-review-types";
import type { ProductScorecard, Brand, ClaimsCheckItem, ScorePillar, IngredientEntry } from "@/data/brands/types";
import { slugify } from "@/lib/verified-store";

const FRAGRANCE_RE = /^(parfum|fragrance|parfum\/fragrance|aroma)$/i;
const DRYING_ALCOHOL_RE = /^alcohol( denat\.?)?$|^sd alcohol/i;

function claimToCheckItem(c: ClaimAnalysis): ClaimsCheckItem {
  const supported = c.riskLevel === "low";
  const contradicted = c.riskLevel === "red-flag" || c.drugBoundaryRisk;
  return {
    claim: c.text.length > 90 ? c.text.slice(0, 90).replace(/\s+\S*$/, "") + "…" : c.text,
    decision: contradicted ? "Not publicly supported" : supported ? "Publicly supported" : "Needs proof",
    evidenceStatus: c.evidenceLevel >= 4 ? "Evidence visible" : c.evidenceLevel >= 2 ? "Mentioned only" : "Missing",
    note: c.evidenceNote || "",
  };
}

function guessProductType(category: string): ProductScorecard["productType"] {
  const c = category.toLowerCase();
  if (/sunscreen|spf/.test(c)) return "sunscreen";
  if (/wash|cleanser|shampoo|soap|scrub/.test(c)) return "rinse-off";
  if (/toner/.test(c)) return "toner";
  if (/serum|treatment|peel/.test(c)) return "treatment";
  if (/hair|conditioner/.test(c)) return "hair";
  return "leave-on";
}

function ingredientEntry(name: string): IngredientEntry {
  if (FRAGRANCE_RE.test(name.trim()))
    return { name, note: "Fragrance — a potential sensitizer for some users", flag: "info" };
  if (DRYING_ALCOHOL_RE.test(name.trim()))
    return { name, note: "Drying alcohol — can be sensitizing in higher positions", flag: "info" };
  return { name, note: "", flag: "ok" };
}

const num = (s: string | undefined): number | undefined => {
  const m = String(s ?? "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : undefined;
};

export function reviewToScorecard(review: ProductReview, verdict: DerivedVerdict): {
  product: ProductScorecard;
  brand: Brand;
  brandSlug: string;
} {
  const brandSlug = slugify(review.brand || "brand", "");
  const claims = review.claimMap ?? [];

  // Badges drive "At a glance" + proof fallbacks in the shared view.
  const pass_badges: string[] = [];
  const lowClaims = claims.filter((c) => c.riskLevel === "low").map((c) => c.text.toLowerCase());
  const hasLow = (kw: RegExp) => lowClaims.some((t) => kw.test(t));
  if (hasLow(/fragrance[- ]?free/)) pass_badges.push("Fragrance-Free");
  if (hasLow(/non[- ]?comedogenic/)) pass_badges.push("Non-Comedogenic");
  if (hasLow(/dermatolog/)) pass_badges.push("Dermatologist Tested");
  if (hasLow(/vegan/)) pass_badges.push("Vegan");
  if (hasLow(/essential oil/)) pass_badges.push("No Essential Oils");

  const warn_badges: string[] = [...(review.formulaLogic?.irritancyConcerns ?? [])];
  const inci = review.inciIngredients ?? [];
  if (inci.some((i) => FRAGRANCE_RE.test(i.trim()))) warn_badges.push("Fragrance present (parfum)");

  // The 7 review dimensions as pillars (dots + label only in the view — no numerics shown).
  const s = review.scores;
  const pillars: ScorePillar[] = [
    { name: "Public Claim Support", score: s.claimEvidence, max: 20, note: `Strongest public evidence: level ${review.claimSummary?.highestEvidenceLevel ?? 1} of 7. ${review.verdict?.bestThing ?? ""}` },
    { name: "Consumer Clarity", score: s.claimClarity, max: 15, note: `${review.claimSummary?.total ?? claims.length} marketing claims checked. ${review.claimSummary?.asciConcernCount ?? 0} ASCI concern(s), ${review.claimSummary?.drugBoundaryCount ?? 0} drug-boundary flag(s).` },
    { name: "Public INCI Transparency", score: s.ingredientTransparency, max: 20, note: `${review.ingredientTransparency?.label ?? ""}. ${(review.ingredientTransparency?.issues ?? []).join(" ")}` },
    { name: "Formula Logic", score: s.formulaLogic, max: 15, note: review.formulaLogic?.note ?? "" },
    { name: "Consumer Suitability", score: s.consumerSuitability, max: 10, note: [review.consumerSuitability?.sensitivityRisk, review.consumerSuitability?.routineFit].filter(Boolean).join(" ") },
    { name: "Price Fairness", score: s.priceFairness, max: 10, note: review.priceInsight ?? "" },
    { name: "Platform Consistency", score: s.platformConsistency, max: 10, note: review.platformParity?.amplificationPattern ?? (review.platformParity?.consistent ? "Claims are consistent across platforms." : (review.platformParity?.issues?.[0] ?? "")) },
  ];

  const missingProof = claims
    .filter((c) => c.evidenceLevel <= 2 && (c.riskLevel === "high" || c.riskLevel === "very-high" || c.riskLevel === "red-flag"))
    .slice(0, 6)
    .map((c) => `Finished-product evidence for "${c.text.slice(0, 80)}${c.text.length > 80 ? "…" : ""}"`);

  const product: ProductScorecard = {
    productName: review.productName,
    slug: review.productSlug ?? slugify(review.productName, review.brand),
    brand: review.brand ?? "",
    brandSlug,
    priceRange: review.priceRange || review.lowestPrice || "",
    productType: guessProductType(review.category ?? ""),
    concern: review.category ?? "",
    summary: review.verdict?.cleanSheetTakeaway ?? "",
    score: s.total,
    scoreLabel: verdict.tier === "approved" ? "Excellent" : verdict.tier === "mostly-clean" ? "Good" : verdict.tier === "misleading" ? "Concern" : "Fair",
    targetUser: review.targetUser ?? "",
    image: review.imageUrl ?? "",
    pillars,
    keyActives: [],
    ingredients: inci.map(ingredientEntry),
    claimsCheck: claims.slice(0, 10).map(claimToCheckItem),
    missingProof,
    cleanSheetNote: review.cleanSheetNote,
    pass_badges,
    warn_badges,
    info_badges: [],
    indiaContext: "",
    analyzedAt: review.reviewedAt ?? new Date().toISOString(),
    category: review.category,
    price: num(review.lowestPrice) ?? num(review.priceRange),
    pricePerUnit: num(review.pricePerMl),
    sizeUnit: "ml",
    suitabilityTags: review.consumerSuitability?.bestFor?.slice(0, 4),
    cautionTags: review.consumerSuitability?.avoidIf?.slice(0, 4),
    claimsMade: claims.slice(0, 8).map((c) => c.text),
    freshReview: true,
    reviewTier: verdict.tier,
    regulatoryFlags: claims
      .filter((c) => c.asciConcern || c.drugBoundaryRisk)
      .slice(0, 8)
      .map((c) => ({
        claim: c.text.length > 110 ? c.text.slice(0, 110).replace(/\s+\S*$/, "") + "…" : c.text,
        note: c.drugBoundaryNote || c.asciNote || c.evidenceNote || "",
      })),
  };

  const brand: Brand = {
    name: review.brand ?? "",
    slug: brandSlug,
    logo: "",
    tagline: "",
    description: "",
    founded: "",
    headquarters: "",
    website: "",
    instagramHandle: "",
    nykaaUrl: "",
    avgScore: s.total,
    verdict: verdict.tierLabel,
    products: [],
  };

  return { product, brand, brandSlug };
}
