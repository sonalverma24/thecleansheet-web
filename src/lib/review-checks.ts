/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · the checks a fresh analysis must pass before it is kept

   One definition of the four checks. The re-run (scripts/approved-rerun-policy.ts, validateReplacement)
   applies all four to a replacement before it overwrites a page, so a good page is never swapped for a
   worse one. The live search (runProductReview, behind /api/review) refuses to keep a new analysis only
   for the checks in LIVE_REFUSES: a new product has no page to protect, and a product with no
   primary-source ingredient list is still analysed and saved with the gap shown (Not enough info), as the
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

/** What stops a fresh live analysis from being kept: it was written without a web search. The ingredient-source checks do not stop it. */
export const LIVE_REFUSES: ReadonlySet<ReviewCheckIssue> = new Set<ReviewCheckIssue>(["web-search-missing"]);

export function liveRefusalIssues(review: ProductReview): ReviewCheckIssue[] {
  return reviewCheckIssues(review).filter((issue) => LIVE_REFUSES.has(issue));
}
