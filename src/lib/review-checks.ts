/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · the checks a fresh analysis must pass before it is kept

   One definition of the four checks. The re-run (scripts/approved-rerun-policy.ts, validateReplacement)
   applies all four to a replacement before it overwrites a page, so a good page is never swapped for a
   worse one. The live search (runProductReview, behind /api/review) does NOT refuse a new analysis for any
   of them: a shopper is never shown a failure for a missing web search or a missing ingredient list. A new
   product has no page to protect, so it is analysed and saved with the gap shown (Not enough info), as the
   approved baseline says. The re-run adds checks that only make sense against an existing page (same
   product, list not shorter, decision not lost); those are not here.
──────────────────────────────────────────────────────────────── */
import type { ProductReview } from "@/lib/product-review-types";
import { isSourceBackedInci } from "@/lib/inci-source-backing";
import { isBrandIngredientUrl } from "@/lib/brand-inci";
import { incidecoderProductSlug } from "@/lib/inci-fetch";
import { sanitizeInciList } from "@/lib/product-identity";

export type ReviewCheckIssue =
  /** No ingredient list with a captured source quote (trust 3 or more, not cut short, at least 3 items). */
  | "primary-ingredient-source-missing"
  /** The list did not come from a Decoder product page or the brand's own product page. */
  | "ingredient-source-not-primary"
  /** The list holds something that is not an ingredient name. */
  | "invalid-ingredient-list"
  /** The model wrote the review without a web search. */
  | "web-search-missing";

export function reviewCheckIssues(review: ProductReview): ReviewCheckIssue[] {
  const issues: ReviewCheckIssue[] = [];
  const list = review.inciIngredients ?? [];
  if (!isSourceBackedInci(review, list)) issues.push("primary-ingredient-source-missing");
  const url = review.inciEvidence?.sourceUrl ?? "";
  if (!incidecoderProductSlug(url) && !isBrandIngredientUrl(url, review.brand)) issues.push("ingredient-source-not-primary");
  if (!sanitizeInciList(list).ok) issues.push("invalid-ingredient-list");
  if (!review.researchLog?.grounded) issues.push("web-search-missing");
  return issues;
}
