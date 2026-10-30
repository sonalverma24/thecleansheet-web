import type { ProductReviewResult } from "@/lib/product-review-engine";
import { ANALYSER_FLAGS, isFlagOn } from "@/lib/analyser-flags";
import { layoutFor, pillsFor } from "@/lib/pills-for-review";
import { verifiedChecks } from "@/lib/pills-page";
import { reviewInciList } from "@/lib/review-inci";
import { reconcileMissingIngredients } from "@/lib/review-ingredient-state";
import { unratedInputOf, unratedKindOf } from "@/lib/unrated-kind";
import { seedImageFor } from "@/lib/home-shelf";
import { compareSubjectOfReview, compareTypeOf } from "@/lib/compare-group";
import { canonicalCheck, priceFacts, sunFactsOf, tidyLine, ROW_IDS, type CompareFacts } from "@/lib/compare-products";

/* ────────────────────────────────────────────────────────────────
   COMPARE · a stored analysis, read as the facts the comparison needs

   This is the same page model the product page draws (pillsFor, or layoutFor while the pills page is off), so a comparison can never say something its
   product page does not. The checks are the page's full list, not the five it has room for. Server only: it pulls in the page model.
──────────────────────────────────────────────────────────────── */

/** The facts for a stored result, or the reason there are none: no stored analysis ("missing"), a nutraceutical or a prescription drug ("unrated"), or a
    product whose type we have not filed ("unfiled"), which is never compared. */
export type CompareOutcome = { ok: true; facts: CompareFacts } | { ok: false; reason: "missing" | "unrated" | "unfiled"; name: string };

export function compareFactsOf(slug: string, result: ProductReviewResult | null): CompareOutcome {
  if (!result || result.type !== "product-review") return { ok: false, reason: "missing", name: slug };
  const { review, verdict } = result;
  if (unratedKindOf(unratedInputOf(review))) return { ok: false, reason: "unrated", name: review.productName };

  const type = compareTypeOf(compareSubjectOfReview(review));
  if (!type) return { ok: false, reason: "unfiled", name: review.productName };

  // The product page's own choice: the five pills when the pills page is on, otherwise today's layout with today's standing.
  const { product, model } = isFlagOn(ANALYSER_FLAGS.pillsPage) ? pillsFor(review, verdict) : layoutFor(review, verdict);
  const inci = reviewInciList(reconcileMissingIngredients(review));
  const checks = verifiedChecks(product, inci, product.pregnancyScreen).flatMap((h) =>
    h.state === "unknown" ? [] : [canonicalCheck(h.label, h.state)],
  );

  const facts: CompareFacts = {
    slug,
    href: `/analysis/${slug}`,
    name: review.productName,
    brand: review.brand ?? "",
    // The photo the /brands card shows: the clean pack shot kept for a seeded product, else the stored image.
    image: seedImageFor({ brand: review.brand ?? "", productName: review.productName }) ?? (product.image || null),
    type,
    pill: { label: model.pill.label, tone: model.pill.tone, marker: model.pill.marker },
    confidence: model.take.confidence.level,
    rows: model.details
      ? model.details.map((d, i) => ({ id: ROW_IDS[i], title: d.title, marker: d.rating.marker, word: d.rating.word, line: tidyLine(d.oneLiner) }))
      : null,
    checks,
    keyActives: model.keyActives,
    price: priceFacts({ lowestPrice: review.lowestPrice, priceRange: review.priceRange, quantity: review.quantity, line: model.fit.price }),
    suits: model.fit.suits.slice(0, 4),
    careful: model.fit.careful.slice(0, 3),
    gaps: model.gaps.slice(0, 3),
    analysedAt: model.analysedAt,
    ...(type === "Sunscreens" ? { sun: sunFactsOf(review.productName) } : {}),
  };
  return { ok: true, facts };
}
