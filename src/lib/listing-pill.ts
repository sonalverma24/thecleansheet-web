/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · The pill and the At a glance ticks for a listing card

   A listing card (the /brands grid, the home shelf) shows the same pill and the same ticks as the product page, because they come from the same
   place: the page model that pillsFor builds from the stored review. Nothing is decided here. A card is only ever built for a stored review; the
   static catalogue has none and keeps its standing. Pure.
──────────────────────────────────────────────────────────────── */

import type { ProductScorecard } from "@/data/brands/types";
import type { DerivedVerdict, ProductReview } from "@/lib/product-review-types";
import { pillsFor } from "@/lib/pills-for-review";

export type ListingPill = Pick<ProductScorecard, "pill" | "glance">;

/** The pill and ticks of a stored review, or null when they cannot be built (the card then keeps the standing; a card must never be dropped for it). */
export function listingPill(review: ProductReview, verdict: DerivedVerdict, now?: string): ListingPill | null {
  try {
    const { model } = pillsFor(review, verdict, now);
    return {
      pill: { key: model.pill.key, label: model.pill.label, tone: model.pill.tone },
      glance: model.highlights.map((h) => ({ label: h.label, state: h.state })),
    };
  } catch {
    return null;
  }
}
