import type { ProductReview } from "./product-review-types";

/* "Who should be careful" and "Worth knowing" are written by the model from the product's ingredients. Two kinds of line in them are never shown, because we
   hold nothing to support them:

   - A fungal-acne (Malassezia) line. The reference database has no fungal-acne field and the model names no source ("some sources suggest"), so the page
     would state a health caution that nothing we hold backs.
   - A "clean formula" line ("Expect a truly 'clean' formula"). The Clean Sheet does not define clean as an ingredient quality, so telling a shopper to be careful
     about expecting it is not a finding. (Owner rule, 2026-10-30.)

   The lines are dropped, not reworded. A rule that shows a caution only when a sourced, code-owned list backs it (as the comedogenic line does) would be a
   separate decision. */
const FUNGAL_ACNE_RE = /\b(?:fungal[\s-]*acne|malassezia|pityrosporum)\b/i;
const CLEAN_FORMULA_RE = /\bclean(?:['"”’])?[\s-]+(?:beauty|skincare|label|formula(?:tion)?s?|products?|ingredients?)\b|\b(?:truly|totally|completely|entirely|100%)\s+['"“‘]?clean\b/i;

export const isUnsupportedFitLine = (text: string): boolean => FUNGAL_ACNE_RE.test(text) || CLEAN_FORMULA_RE.test(text);

const keepSupported = (items: unknown): string[] =>
  (Array.isArray(items) ? items : []).filter((item): item is string => typeof item === "string" && !isUnsupportedFitLine(item));

/** The review with the unsupported fit lines taken out. The stored analysis is not changed: this is applied every time a page is drawn, so a page is right the
    moment the rule is, with no re-run. Returns the same object when there is nothing to take out. */
export function withoutUnsupportedFitLines(review: ProductReview): ProductReview {
  const avoidIf = review.consumerSuitability?.avoidIf;
  const concerns = review.formulaLogic?.irritancyConcerns;
  const avoidDrops = Array.isArray(avoidIf) && keepSupported(avoidIf).length !== avoidIf.length;
  const concernDrops = Array.isArray(concerns) && keepSupported(concerns).length !== concerns.length;
  if (!avoidDrops && !concernDrops) return review;
  return {
    ...review,
    ...(avoidDrops ? { consumerSuitability: { ...review.consumerSuitability, avoidIf: keepSupported(avoidIf) } } : {}),
    ...(concernDrops ? { formulaLogic: { ...review.formulaLogic, irritancyConcerns: keepSupported(concerns) } } : {}),
  };
}
