/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Canonical INCI accessor for a stored review
   One place decides "what is this product's ingredient list", so the
   scorecard, the analyser screen, badges and the regulatory screen can
   never disagree about whether an INCI is present.

   Priority:
     1. review.inciIngredients — the engine-resolved ground truth
        (INCIDecoder, or the brand page via inci-from-page).
     2. review.ingredientReads[].name — the per-ingredient read the model
        authored from the INCI it retrieved. Older stored reviews often have
        this populated while inciIngredients was left empty; without this
        fallback those pages wrongly reported "INCI not available" on every
        ingredient-dependent check.
──────────────────────────────────────────────────────────────── */

import type { ProductReview } from "@/lib/product-review-types";

/** The product's ingredient list, from the best source the review carries. */
export function reviewInciList(review: ProductReview): string[] {
  const direct = review.inciIngredients ?? [];
  if (direct.length >= 3) return direct;
  const fromReads = (review.ingredientReads ?? [])
    .map((r) => r.name)
    .filter((n): n is string => typeof n === "string" && n.trim().length > 0);
  if (fromReads.length >= 3) return fromReads;
  return direct;
}
