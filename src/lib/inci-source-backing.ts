/* One definition of "the ingredient list is source-backed", shared by the scorecard badges, the pregnancy
   screen, the claim checks and the legacy checklist so they cannot drift apart. Source-backed means a quote was
   captured from a reference database or a brand page (trust 3 or more) and it was not cut short. It says the
   list was captured as stated, not that the formula is true or current for the SKU. */

import { evidenceForReview } from "@/lib/review-verifier";
import type { ProductReview } from "@/lib/product-review-types";

const MIN_LIST = 3;

export function isSourceBackedInci(review: ProductReview, inci: string[]): boolean {
  const evidence = evidenceForReview(review);
  return inci.length >= MIN_LIST && evidence.captureTrust >= 3 && !!evidence.quote.trim() && review.inciEvidence?.quoteTruncated !== true;
}

/** A list was read from a reference database or a brand page and nothing is wrong with it except that no source quote was kept.
    It is not source-backed, but "Partial" would wrongly say part of the list is missing. */
export function isListReadWithoutQuote(review: ProductReview, inci: string[]): boolean {
  const evidence = evidenceForReview(review);
  return inci.length >= MIN_LIST && evidence.captureTrust >= 3 && !evidence.quote.trim() && review.inciEvidence?.quoteTruncated !== true;
}
