/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Products we do not rate

   The Clean Sheet rates cosmetics. Two kinds of product are not cosmetics and get no review, no rating and no place in a product list: a nutraceutical
   (something you swallow: a supplement, a drink mix, gummies) and a prescription drug. This file is the one place that decides which a product is. It is
   used on the product page, in every list and sitemap, and before a new analysis is stored, so the three can never disagree.

   Pure: it reads the product's name, its category and its ingredient list, nothing else. It leans toward "not a match": a cosmetic wrongly called a
   nutraceutical would vanish from the site, so each rule asks for an explicit word. See unrated-kind.test.ts for the cosmetics it must leave alone.

   Prescription: only what we can stand behind. Explicit prescription wording (the analyser's own RX_TEXT_RE) or an active listed at the strength the engine
   treats as prescription-only (azelaic acid at 15% or more, DRUG_ACTIVES). Other medicines (an anti-dandruff shampoo with ketoconazole) are medicines, but
   whether they need a prescription is a regulatory call the owner signs off in kb.ts; they keep the Medicinal product page until then.
──────────────────────────────────────────────────────────────── */

import { categorise } from "@/lib/product-categorise";
import { UNCLASSIFIED } from "@/data/analysis/categories";
import { DRUG_ACTIVES, RX_TEXT_RE } from "@/lib/analyser-x/kb";
import { drugActivesIn } from "@/lib/analyser-x/rules";

export type UnratedKind = "nutraceutical" | "prescription-drug";

export interface UnratedInput {
  productName?: string | null;
  category?: string | null;
  /** The declared ingredient list, when we have it. Only the prescription-strength check reads it. */
  inci?: readonly string[] | null;
}

/** Words that name a nutraceutical on their own, whatever else the category says. */
const NUTRACEUTICAL_WORD_RE = /\b(nutraceuticals?|nutricosmetics?|ingestibles?|drink mix(?:es)?|beauty drinks?|electrolyte (?:drink|mix|powder|sachets?)|protein (?:powder|shake)s?)\b/i;
/** Words that point to a nutraceutical but are also used on cosmetics: "multivitamin serum", "probiotic cleanser", "capsule serum", "cleansing tablet", "supplement" in a
    serum's name. They count only when the product's category does not resolve to a cosmetic type in the closed category list. */
const NUTRACEUTICAL_HINT_RE = /\b(supplements?|multivitamins?|probiotics?|omega[- ]?3|fish oil|protein bars?|gummies|gummy|softgels?|chewables?|effervescent|capsules?|tablets?)\b/i;

/** The ingredient screen's prescription-strength actives: the ones DRUG_ACTIVES only counts at or above a stated percentage. */
const rxStrength = new Set(DRUG_ACTIVES.filter((d) => d.minConcentration != null).map((d) => d.name));

export function unratedKindOf(p: UnratedInput): UnratedKind | null {
  const name = (p.productName ?? "").trim();
  const category = (p.category ?? "").trim();
  const said = `${name} ${category}`;

  if (RX_TEXT_RE.test(said)) return "prescription-drug";
  if (p.inci?.length && drugActivesIn([...p.inci], name).some((a) => rxStrength.has(a))) return "prescription-drug";

  if (NUTRACEUTICAL_WORD_RE.test(said)) return "nutraceutical";
  if (NUTRACEUTICAL_HINT_RE.test(said) && categorise(category, name).id === UNCLASSIFIED.id) return "nutraceutical";
  return null;
}

/** True for a product that gets a review and a place in the lists. */
export const isRated = (p: UnratedInput): boolean => unratedKindOf(p) === null;
