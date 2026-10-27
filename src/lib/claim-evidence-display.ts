import type { ClaimsCheckItem, ProductScorecard } from "@/data/brands/types";

const SPECIALIST_CLAIM = /\b(?:spf\s*\d+|pa\+{2,}|broad[- ]spectrum|uva\s*protection|dermatolog(?:ist|ically)[ -]tested|non[- ]?comedogenic|vegan|cruelty[- ]?free|pregnancy[- ]safe|pregnancy tested|safe (?:for|during|in) pregnancy|suitable (?:for|during) pregnancy)\b/i;
const FRAGRANCE_FREE_CLAIM = /\b(?:fragrance|parfum|perfume|aroma)[\s-]*free\b|\b(?:no|without)\b[^.;]{0,50}\b(?:fragrance|parfum|perfume|aroma)\b|\bfree from\b[^.;]{0,50}\b(?:fragrance|parfum|perfume|aroma)\b/i;
const AROMATIC_BOTANICAL = /\b(?:lavender|lavandula|rose|rosa|jasmine|jasminum|geranium|pelargonium|ylang|citrus|bergamot|rosemary|rosmarinus|peppermint|mentha|eucalyptus|eugenia|clove|cinnamon|cananga)\b/i;

/** Enforce the same evidence labels for static and live scorecards at render time. */
export function applyClaimEvidenceDisplay(item: ClaimsCheckItem, product: ProductScorecard): ClaimsCheckItem {
  if (FRAGRANCE_FREE_CLAIM.test(item.claim)) {
    const complete = (product.inciCompleteness?.status === "Full INCI on brand PDP" || product.inciCompleteness?.status === "Full INCI in reference database") && product.ingredients.length >= 3;
    if (!complete) return { ...item, decision: "Needs proof", evidenceStatus: "Missing", note: "Fragrance status cannot be derived because a complete ingredient list is not available." };
    const explicit = product.ingredients.find(({ name }) => /\b(?:parfum|perfume|fragrance|aroma)\b/i.test(name));
    const essentialOil = product.ingredients.find(({ name }) => /\bessential\s+oil\b|\b(?:lavender|lavandula|rose|rosa|bergamot|citrus|rosemary|peppermint|eucalyptus|ylang ylang)\b.{0,35}\boil\b/i.test(name));
    const aromatic = product.ingredients.find(({ name }) => AROMATIC_BOTANICAL.test(name) && /\b(?:extract|water|distillate|hydrosol|oil|essence)\b/i.test(name));
    if (explicit || essentialOil) return { ...item, decision: "Not publicly supported", evidenceStatus: "Evidence visible", note: `The complete ingredient list names ${explicit?.name ?? essentialOil?.name}.` };
    if (aromatic) return { ...item, decision: "Needs proof", evidenceStatus: "Missing", note: `Fragrance status remains unknown because the complete ingredient list includes the aromatic extract ${aromatic.name}.` };
    return { ...item, decision: "Publicly supported", evidenceStatus: "Evidence visible", note: "Derived from the complete ingredient list; no explicit fragrance declaration or essential oil was found." };
  }
  if (SPECIALIST_CLAIM.test(item.claim)) {
    return {
      ...item,
      decision: "Needs proof",
      evidenceStatus: "Brand claim — TCS evidence not reviewed",
      note: "This is a brand claim. TCS has not reviewed matching product-specific evidence for the claim. Its presence does not change the product rating by itself.",
    };
  }
  return item;
}
