/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Live review → scorecard mapper
   Converts a stored ProductReview (+ derived verdict) into the
   ProductScorecard + Brand shapes so live reviews render in THE one
   product-page format (ProductScorecardView). Pure mapping, no I/O.
──────────────────────────────────────────────────────────────── */

import type { ProductReview, DerivedVerdict, ClaimAnalysis } from "@/lib/product-review-types";
import type { ProductScorecard, Brand, ClaimsCheckItem, ScorePillar } from "@/data/brands/types";
import { slugify } from "@/lib/verified-store";
import { reviewInciList } from "@/lib/review-inci";
import { evidenceForReview } from "@/lib/review-verifier";
import { ingredientSafety, lookupIngredient, rowLooksValid } from "@/lib/ingredient-db";
import { enrichIngredients, keyActivesFrom } from "@/lib/inci-enrich";
import { globalScreenFor } from "@/lib/global-screen";
import { analysisWording } from "@/lib/analysis-wording";
import { RETINOID_RE } from "@/lib/pregnancy-screen";
import type { GlobalScreen, IngredientEntry, KeyActive, PregnancyIngredientFlag, PregnancyScreen, VeganScreen } from "@/data/brands/types";

const FRAGRANCE_RE = /^(parfum|fragrance|parfum\/fragrance|aroma)$/i;
const DRYING_ALCOHOL_RE = /^alcohol( denat\.?)?$|^sd alcohol/i;

function claimToCheckItem(c: ClaimAnalysis, review: ProductReview, ingredients: string[]): ClaimsCheckItem {
  const fragranceFreeClaim = /\b(?:fragrance|parfum|perfume|aroma)[\s-]*free\b|\b(?:no|without)\b[^.;]{0,50}\b(?:fragrance|parfum|perfume|aroma)\b|\bfree from\b[^.;]{0,50}\b(?:fragrance|parfum|perfume|aroma)\b/i.test(c.text);
  if (fragranceFreeClaim) {
    const evidence = evidenceForReview(review);
    const fullList = ingredients.length >= 3 && evidence.captureTrust >= 3 && !!evidence.quote.trim() && review.inciEvidence?.quoteTruncated !== true;
    const explicit = ingredients.find((name) => /\b(?:parfum|perfume|fragrance|aroma)\b/i.test(name));
    const essentialOil = ingredients.find((name) => /\bessential\s+oil\b|\b(?:lavender|lavandula|rose|rosa|bergamot|citrus|rosemary|peppermint|eucalyptus|ylang ylang)\b.{0,35}\boil\b/i.test(name));
    const aromatic = ingredients.find((name) => /\b(?:lavender|lavandula|rose|rosa|jasmine|jasminum|geranium|pelargonium|ylang|citrus|bergamot|rosemary|rosmarinus|peppermint|mentha|eucalyptus|eugenia|clove|cinnamon|cananga)\b/i.test(name) && /\b(?:extract|water|distillate|hydrosol|oil|essence)\b/i.test(name));
    const sourceUrl = evidence.sourceUrl || undefined;
    if (!fullList) return { claim: c.text, decision: "Needs proof", evidenceStatus: "Missing", note: "Fragrance status cannot be derived because a complete, source-backed ingredient list is unavailable.", sourceUrl };
    if (explicit || essentialOil) return { claim: c.text, decision: "Not publicly supported", evidenceStatus: "Evidence visible", note: `The complete ingredient list names ${explicit ?? essentialOil}.`, sourceUrl };
    if (aromatic) return { claim: c.text, decision: "Needs proof", evidenceStatus: "Missing", note: `Fragrance status remains unknown because the complete ingredient list includes the aromatic extract ${aromatic}.`, sourceUrl };
    return { claim: c.text, decision: "Publicly supported", evidenceStatus: "Evidence visible", note: "Derived from the complete, source-backed ingredient list; no explicit fragrance declaration or essential oil was found.", sourceUrl };
  }
  const needsProductEvidence = /\b(?:spf\s*\d+|pa\+{2,}|broad[- ]spectrum|uva\s*protection|dermatolog(?:ist|ically)[ -]tested|non[- ]?comedogenic|vegan|cruelty[- ]?free|pregnancy[- ]safe|pregnancy tested|safe (?:for|during|in) pregnancy|suitable (?:for|during) pregnancy)\b/i.test(c.text);
  if (needsProductEvidence) {
    return {
      claim: c.text.length > 90 ? c.text.slice(0, 90).replace(/\s+\S*$/, "") + "…" : c.text,
      decision: "Needs proof",
      evidenceStatus: "Brand claim — TCS evidence not reviewed",
      note: "This is a brand claim. TCS has not reviewed matching product-specific evidence for the claim. Its presence does not change the product rating by itself.",
    };
  }
  const supported = c.riskLevel === "low";
  const contradicted = c.riskLevel === "red-flag" || c.drugBoundaryRisk;
  return {
    claim: c.text.length > 90 ? c.text.slice(0, 90).replace(/\s+\S*$/, "") + "…" : c.text,
    decision: contradicted ? "Not publicly supported" : supported ? "Publicly supported" : "Needs proof",
    evidenceStatus: c.evidenceLevel >= 4 ? "Evidence visible" : c.evidenceLevel >= 2 ? "Mentioned only" : "Missing",
    note: c.evidenceNote || "",
  };
}

function buildPregnancyScreen(review: ProductReview, ingredients: string[]): PregnancyScreen {
  const evidence = evidenceForReview(review);
  const anchoredFullList = ingredients.length >= 3 && evidence.captureTrust >= 3 && !!evidence.quote.trim() && review.inciEvidence?.quoteTruncated !== true;
  const category = (review.category ?? "").toLowerCase();
  const exposure: PregnancyScreen["exposure"] = /cleanser|face wash|body wash|shampoo|soap|rinse[- ]off|conditioner|hair mask/.test(category)
    ? "rinse-off"
    : /serum|treatment|toner|lotion|cream|sunscreen|moisturi[sz]er|leave[- ]on/.test(category) ? "leave-on" : "unknown";
  if (!anchoredFullList) {
    return { status: "not-screened", exposure, flags: [], unknownIngredients: ingredients, reason: "A complete, source-backed ingredient list is not available." };
  }
  const flags: PregnancyScreen["flags"] = [];
  const unknownIngredients: string[] = [];
  for (const ingredient of ingredients) {
    const safety = ingredientSafety(ingredient);
    const confidence = safety.confidence.toLowerCase();
    const sourced = safety.valid && !!safety.source && (confidence === "high" || confidence === "medium");
    const restriction = sourced ? safety.pregnancyRestriction : null;
    if (sourced && restriction && !/^(?:no|none|not)\b/i.test(restriction)) {
      flags.push({ ingredient, restriction, source: safety.source, confidence: confidence as "high" | "medium" });
      continue;
    }
    const retinoid = retinoidFlag(ingredient);
    if (retinoid) { flags.push(retinoid); continue; }
    if (!sourced) unknownIngredients.push(ingredient);
  }
  return { status: "screened", exposure, sourceUrl: evidence.sourceUrl || undefined, flags, unknownIngredients };
}

/** The database holds no row for plain Retinol (or the acid and aldehyde forms), so without this a retinol serum would read "not checked" and show no flag.
    A retinoid is flagged on the vitamin A row's own source and confidence; if that row is ever missing or unsourced, nothing is flagged on its authority. */
function retinoidFlag(ingredient: string): PregnancyIngredientFlag | null {
  if (!RETINOID_RE.test(ingredient.replace(/\([^)]*\)/g, " "))) return null;
  const vitaminA = ingredientSafety("Retinyl Palmitate");
  const confidence = vitaminA.confidence.toLowerCase();
  if (!vitaminA.valid || !vitaminA.source || (confidence !== "high" && confidence !== "medium")) return null;
  return { ingredient, restriction: "A retinoid; generally advised against during pregnancy.", source: vitaminA.source, confidence: confidence as "high" | "medium" };
}

function buildVeganScreen(ingredients: string[], reliableList: boolean): VeganScreen {
  if (!reliableList) return { status: "unknown", animalIngredients: [], unknownIngredients: ingredients, sources: [] };
  const animalIngredients: string[] = [];
  const unknownIngredients: string[] = [];
  const sources: VeganScreen["sources"] = [];
  for (const name of ingredients) {
    const row = lookupIngredient(name);
    if (!row || !rowLooksValid(row) || !row.Source_Reference.trim() || !/^high$/i.test(row.Data_Confidence ?? "")) {
      unknownIngredients.push(name);
      continue;
    }
    sources.push({ ingredient: name, source: row.Source_Reference });
    const origin = row.Ingredient_Origin.toLowerCase();
    if (/animal[- ]derived|animal origin|dairy|milk|whey|beeswax|lanolin|carmine|shellac|silk|collagen|keratin|snail|fish|crustacean/.test(origin)) {
      animalIngredients.push(name);
      continue;
    }
    const nonAnimal = /\b(?:plant|botanical|vegetable|synthetic|microbial|ferment(?:ation)?|mineral|inorganic)\b/.test(origin);
    if (!nonAnimal || !/^yes$/i.test(row.Vegan.trim())) unknownIngredients.push(name);
  }
  const status = animalIngredients.length ? "conflict" : unknownIngredients.length || !ingredients.length ? "unknown" : "screened";
  return { status, animalIngredients, unknownIngredients, sources };
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

const num = (s: string | undefined): number | undefined => {
  const m = String(s ?? "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : undefined;
};

/* A true-for-the-category read of how this product type behaves in Indian
   conditions (heat, humidity, high year-round UV). Category-level, never a
   fabricated product-specific fact - the engine authors the richer per-product
   version when its indiaContext field is present. */
function indiaClimateLine(type: ProductScorecard["productType"]): string {
  switch (type) {
    case "sunscreen":
      return "India sees high UV year-round, so daily broad-spectrum protection (UVA/PA rating included) matters more here than the SPF number alone; reapply through the day in direct sun.";
    case "treatment":
      return "Actives like this can raise sun sensitivity, which India's high year-round UV makes significant, so pairing with a daytime SPF is important; the lighter the vehicle, the better it tends to wear in heat and humidity.";
    case "toner":
      return "In India's heat and humidity a lightweight, non-occlusive layer like this usually sits comfortably under the rest of a routine without feeling heavy.";
    case "rinse-off":
      return "For India's hot, humid, higher-pollution days, a cleanser that lifts sweat, sebum and grime without stripping the barrier is the practical fit; hard water in many cities can affect how it lathers and rinses.";
    case "hair":
      return "India's heat, humidity and hard water shape how this performs day to day, so consistency and rinse-out matter as much as the formula itself.";
    default: // leave-on
      return "In India's warm, humid climate a lighter leave-on layer tends to wear more comfortably; how it feels can shift between air-conditioned indoors and humid outdoors.";
  }
}

/* India Context - the whole review is already India-grounded (₹ pricing, ASCI/
   CDSCO claim analysis), so we can compose an honest, per-product read from data
   we already hold. Prefer the engine's authored field when a review carries one;
   otherwise synthesise from price positioning + the real claim analysis. Every
   line is grounded in this product's own data, never a generic template. */
function buildIndiaContext(review: ProductReview): string {
  const authored = review.indiaContext?.trim();
  if (authored && authored.length > 20) return authored;

  const bits: string[] = [];

  // 1. Climate behaviour - grounded in the product TYPE (true for the category,
  //    never a fabricated product-specific claim).
  const climate = indiaClimateLine(guessProductType(review.category ?? ""));
  if (climate) bits.push(climate);

  // 2. Price positioning - already an Indian-market read (all prices are in ₹).
  const price = review.priceInsight?.trim();
  if (price && price.length > 12) {
    bits.push(price);
  } else {
    const p = (review.lowestPrice || review.priceRange || "").trim();
    if (p) bits.push(`Priced at ${p} in the Indian market.`);
  }

  // 3. Regulatory posture - derived from this product's actual claim analysis.
  const asci = review.claimSummary?.asciConcernCount ?? 0;
  const drug = review.claimSummary?.drugBoundaryCount ?? 0;
  if (drug > 0) {
    bits.push(`${drug} claim${drug > 1 ? "s" : ""} edge toward drug-like territory that India (CDSCO) treats as cosmetics-only, so read ${drug > 1 ? "them" : "it"} as a cosmetic benefit, not a treatment.`);
  } else if (asci > 0) {
    bits.push(`${asci} marketing claim${asci > 1 ? "s" : ""} could draw ASCI scrutiny under India's advertising code; the ingredient list is the more reliable guide.`);
  } else {
    bits.push("The marketing stays within India's cosmetic advertising norms (ASCI / CDSCO), with claims that match what the formula can do.");
  }

  return bits.join(" ").trim();
}

export function reviewToScorecard(review: ProductReview, verdict: DerivedVerdict): {
  product: ProductScorecard;
  brand: Brand;
  brandSlug: string;
} {
  const brandSlug = slugify(review.brand || "brand", "");
  const claims = review.claimMap ?? [];

  // Badges drive "At a glance" + proof fallbacks in the shared view.
  const pass_badges: string[] = [];
  // Brand claim text alone does not create verification badges or positive ticks.

  const warn_badges: string[] = [...(review.formulaLogic?.irritancyConcerns ?? [])];
  const inci = reviewInciList(review);
  if (inci.some((i) => FRAGRANCE_RE.test(i.trim()))) warn_badges.push("Fragrance present (parfum)");

  // The 7 review dimensions as pillars (dots + label only in the view - no numerics shown).
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

  /* Plum-depth detail. Prefer the engine's own reads (authored from the real
     INCI). The ingredient DB is only a fallback, and only for a clean, safe
     confirmation note - never the sole source of a warn flag. */
  const ingredients: IngredientEntry[] =
    (review.ingredientReads && review.ingredientReads.length > 0)
      ? review.ingredientReads.map((r) => ({
          name: r.name,
          note: [r.role, r.note].filter(Boolean).join(" · "),
          flag: r.flag === "warn" ? "warn" : r.flag === "info" ? "info" : "ok",
        }))
      : enrichIngredients(inci);

  const keyActives: KeyActive[] =
    (review.keyActivesRead && review.keyActivesRead.length > 0)
      ? review.keyActivesRead.map((k) => ({ name: k.name, function: k.function, concentrationConfidence: k.concentrationConfidence }))
      : keyActivesFrom(inci);

  // The displayed 10-authority screen: the model's, or rebuilt from the ingredient database when it was
  // written without a list. One shared definition (src/lib/global-screen.ts).
  const globalScreen: GlobalScreen | undefined = globalScreenFor(review, inci);
  const inciEvidence = evidenceForReview(review);
  const completeInci = inci.length >= 3 && inciEvidence.captureTrust >= 3 && !!inciEvidence.quote.trim() && review.inciEvidence?.quoteTruncated !== true;
  const completeInciStatus = !completeInci ? (inci.length ? "Partial" as const : "Missing" as const) : inciEvidence.captureTrust === 4
    ? "Full INCI on brand PDP" as const
    : inciEvidence.captureTrust === 3
      ? "Full INCI in reference database" as const
      : "Marketplace only" as const;
  const pregnancyScreen = buildPregnancyScreen(review, inci);
  const veganScreen = buildVeganScreen(inci, completeInci);

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
    ...(typeof verdict.claimEvidencePct === "number" ? { claimEvidencePct: verdict.claimEvidencePct } : {}),
    scoreLabel: verdict.tier === "approved" ? "Excellent" : verdict.tier === "mostly-clean" ? "Good" : verdict.tier === "not-recommended" ? "Concern" : "Fair",
    targetUser: review.targetUser ?? "",
    image: review.imageUrl ?? "",
    pillars,
    keyActives,
    ingredients,
    globalScreen,
    inciCompleteness: { status: completeInciStatus, flags: [] },
    pregnancyScreen,
    veganScreen,
    claimsCheck: claims.slice(0, 10).map((claim) => claimToCheckItem(claim, review, inci)),
    missingProof,
    cleanSheetNote: review.cleanSheetNote ? analysisWording(review.cleanSheetNote) : review.cleanSheetNote,
    pass_badges,
    warn_badges,
    info_badges: [],
    indiaContext: buildIndiaContext(review),
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
    ...(verdict.isDrug ? { drugActives: verdict.drugActives } : {}),
    regulatoryFlags: claims
      .filter((c) => c.asciConcern || c.drugBoundaryRisk)
      .slice(0, 8)
      .map((c) => ({
        claim: c.text.length > 110 ? c.text.slice(0, 110).replace(/\s+\S*$/, "") + "…" : c.text,
        note: c.drugBoundaryNote || c.asciNote || c.evidenceNote || "",
      })),
    productPageChecks: review.productPageChecks?.slice(0, 8),
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
