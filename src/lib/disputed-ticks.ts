/* A page must not tick what its own words dispute.

   The At a glance ticks ("Fragrance free", "Alcohol free", "Paraben free") are worked out by code from the ingredient list we hold. The summary, the biggest
   concern and the fit lists are written by the model, which can have read a different list. When the model's text says a claim is contradicted ("The
   'fragrance-free' claim is directly contradicted by the INCI") and the code would tick that same claim, the page says both. Seen live on 2026-11-04:
   Garnier Skin Naturals Micellar Oil-Infused Cleansing Water ticked Fragrance free under a summary calling its fragrance-free claim misleading.

   The rule: such a tick is not drawn, on any surface that draws ticks (product page and its FAQ, listing cards, compare, the older scorecard page). It is not
   turned into a cross either, because the cross would rest on the model's reading alone. The text stays as written. Detection is the review verifier's own
   (`proseDisputedClaims`: a quoted claim next to "contradict…", with its bound-negation rule), so the page and the verifier agree on what counts as disputed.
   Applied every time a page is drawn: a stored analysis is right the moment this rule is, with no re-run. */

import { proseDisputedClaims, reviewAnalysisTexts } from "@/lib/review-verifier";
import type { ProductReview } from "@/lib/product-review-types";

/** Every model-written text the page can show that may say a claim is contradicted: the verifier's analysis texts plus the fit lists ("Who it suits",
    "Who should be careful") and the sensitivity line. */
function pageTexts(review: ProductReview): string[] {
  const fit = review.consumerSuitability;
  const texts: unknown[] = [
    ...reviewAnalysisTexts(review),
    ...(Array.isArray(fit?.avoidIf) ? fit.avoidIf : []),
    ...(Array.isArray(fit?.bestFor) ? fit.bestFor : []),
    fit?.sensitivityRisk,
    review.verdict?.whoShouldBeCareful,
    review.verdict?.whoItMaySuit,
  ];
  return texts.filter((t): t is string => typeof t === "string" && t.trim().length > 0);
}

/** The claim keys this analysis's own text says are contradicted, sorted. Empty when none. The surfaces test a tick against them with
    `isDisputedTick` (at-a-glance.ts, kept there so the page code does not pull in the verifier). */
export function disputedTicksOf(review: ProductReview): string[] {
  return [...proseDisputedClaims(pageTexts(review)).keys()].sort();
}
