import type { ProductReview } from "./product-review-types";
import { reviewInciList } from "./review-inci";

export const MISSING_INCI_MESSAGE = "We could not verify a complete ingredient list from the brand website or INKEE Decoder. Ingredient-based conclusions are pending verification.";

/** The reader's prose cannot claim a full list when acquisition retained none.
 * Also used at render time so already-saved incomplete analyses stay consistent. */
export function reconcileMissingIngredients(review: ProductReview): ProductReview {
  if (reviewInciList(review).length) return review;
  return {
    ...review,
    ingredientTransparency: { ...review.ingredientTransparency, score: 1, label: "Basic label transparency", fullInciAvailable: false, inciSource: "Not verified", inciOrderCorrect: false, fragranceDisclosed: false, preservativesVisible: false, issues: [MISSING_INCI_MESSAGE] },
    dataSource: review.dataSource ? { ...review.dataSource, inciFound: false, inciSource: "Not verified" } : review.dataSource,
    verdict: { ...review.verdict, bestThing: "", biggestConcern: "Ingredient list verification is incomplete.", cleanSheetTakeaway: MISSING_INCI_MESSAGE },
    formulaLogic: { ...review.formulaLogic, note: "Formula assessment is pending a verified ingredient list.", irritancyConcerns: [] },
    consumerSuitability: { ...review.consumerSuitability, bestFor: [], avoidIf: [] },
    indiaContext: "Ingredient-based suitability for use in India has not been assessed because a complete source ingredient list could not be verified.",
  };
}
