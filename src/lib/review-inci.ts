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

   Plausibility guard: a bad scrape can pull a retailer's marketing bullet
   list ("Oil-Free Matte Finish", "8 Hours Water Resistant" - the latter trips
   a naive "contains the word water" check) into inciIngredients instead of
   the real INCI. That corrupted list would silently pass every ingredient
   safety/endocrine/drug screen as "clear" against ad copy rather than the
   actual formula. When inciIngredients reads like marketing claims rather
   than ingredient names, it is rejected in favour of ingredientReads.
──────────────────────────────────────────────────────────────── */

import type { ProductReview } from "@/lib/product-review-types";

/* Words that show up in retailer feature bullets ("Dermatologically Tested",
   "8 Hours Water Resistant") but essentially never as a standalone INCI entry
   - those claims live in the review's own `tags`/claim fields, not the
   ingredients array. */
const MARKETING_PHRASE_RE =
  /\b(free|resistant|protection|enriched|tested|proven|clinically|dermatologically|hours?|finish|non[\s-]?comedogenic|hypoallergenic|broad[\s-]spectrum|all skin types|suitable for)\b/i;

/** True when most entries read like ad copy rather than ingredient names. */
function looksLikeMarketingCopy(items: string[]): boolean {
  if (!items.length) return false;
  const flagged = items.filter((i) => MARKETING_PHRASE_RE.test(i)).length;
  return flagged / items.length >= 0.5;
}

/** The product's ingredient list, from the best source the review carries. */
export function reviewInciList(review: ProductReview): string[] {
  const direct = review.inciIngredients ?? [];
  const fromReads = (review.ingredientReads ?? [])
    .map((r) => r.name)
    .filter((n): n is string => typeof n === "string" && n.trim().length > 0);
  if (direct.length >= 3 && !looksLikeMarketingCopy(direct)) return direct;
  if (fromReads.length >= 3) return fromReads;
  return direct;
}
