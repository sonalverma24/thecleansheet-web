/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Products we do not rate

   The Clean Sheet rates cosmetics. Two kinds of product are not cosmetics and get no review, no rating and no place in a product list: a nutraceutical
   (something you swallow: a supplement, a drink mix, gummies) and a drug. This file is the one place that decides which a product is. It is used on the product
   page, in every list and sitemap, and before a new analysis is stored, so the three can never disagree.

   Pure: it reads the product's name and category, and the signs a listing or a label gives, nothing else. It leans toward "not a match": a cosmetic wrongly
   called a nutraceutical or a drug would vanish from the site, so each rule asks for an explicit word. See unrated-kind.test.ts for the cosmetics it must leave alone.

   Drug: only what the product itself says (src/lib/drug-signals.ts): a prescription notice (Rx, Prescription Required, Schedule H) makes it a prescription drug; a
   "Drug Facts" label, or a maker the owner has signed off as drug-only, makes it a drug. Never its ingredients: a medicine we can only recognise by an active (a
   ketoconazole shampoo) keeps the Medicinal product page.
──────────────────────────────────────────────────────────────── */

import { categorise } from "@/lib/product-categorise";
import { UNCLASSIFIED } from "@/data/analysis/categories";
import { drugNoticeOf, type DrugSignalInput } from "@/lib/drug-signals";

export type UnratedKind = "nutraceutical" | "prescription-drug" | "drug";

export type UnratedInput = DrugSignalInput;

/** What a stored review lets us read: its name and category, and the notes it keeps on each retailer's listing (where "Prescription Required" is quoted when a listing says it). */
export function unratedInputOf(review: {
  productName?: string | null;
  category?: string | null;
  priceAcrossPlatforms?: readonly { note?: string | null }[] | null;
}): UnratedInput {
  return {
    productName: review.productName,
    category: review.category,
    listingNotes: (review.priceAcrossPlatforms ?? []).map((p) => p?.note ?? "").filter(Boolean),
  };
}

/** Words that name a nutraceutical on their own, whatever else the category says. */
const NUTRACEUTICAL_WORD_RE = /\b(nutraceuticals?|nutricosmetics?|ingestibles?|drink mix(?:es)?|beauty drinks?|electrolyte (?:drink|mix|powder|sachets?)|protein (?:powder|shake)s?)\b/i;
/** Words that point to a nutraceutical but are also used on cosmetics: "multivitamin serum", "probiotic cleanser", "capsule serum", "cleansing tablet", "supplement" in a
    serum's name. They count only when the product's category does not resolve to a cosmetic type in the closed category list. */
const NUTRACEUTICAL_HINT_RE = /\b(supplements?|multivitamins?|probiotics?|omega[- ]?3|fish oil|protein bars?|gummies|gummy|softgels?|chewables?|effervescent|capsules?|tablets?)\b/i;

export function unratedKindOf(p: UnratedInput): UnratedKind | null {
  const drug = drugNoticeOf(p);
  if (drug) return drug.kind;

  const name = (p.productName ?? "").trim();
  const category = (p.category ?? "").trim();
  const said = `${name} ${category}`;
  if (NUTRACEUTICAL_WORD_RE.test(said)) return "nutraceutical";
  if (NUTRACEUTICAL_HINT_RE.test(said) && categorise(category, name).id === UNCLASSIFIED.id) return "nutraceutical";
  return null;
}

/** True for a product that gets a review and a place in the lists. */
export const isRated = (p: UnratedInput): boolean => unratedKindOf(p) === null;
