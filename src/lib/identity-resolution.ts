/* Identity resolution: which product is a review about, and do two records agree?

   isSameProduct / isStrictDuplicate in product-identity.ts decide "same product" from
   brand + name tokens and only consult the formula when one name contains the other.
   That serves the stored review for two records with the SAME name but a different
   formula, and it compares raw ingredient strings, so "Aqua" and "Water" count as
   different. This module adds the missing third answer. It never merges silently:
   a name match whose formula disagrees goes to a human queue.

     PROBABLE_DUPLICATE   name and formula both match. Still only a lead: it never serves
                          one product's review as another's, and a dry run is not approval
                          to merge. Confirmed identity needs equal variant tokens and an
                          identical ordered formula, or a person's confirmation.
     CONFLICT_QUARANTINE  same name, formulas disagree (reformulation, a variant, or one
                          bad source record: the overlap alone cannot say which).
     DISTINCT             genuinely different products. Keep both.

   "Same name" means the brand-stripped name tokens are equal or one set contains the
   other (the rule isSameProduct already uses) AND their Jaccard is high enough. Jaccard
   alone calls "Kind to Skin Moisturising Wash" and "Kind to Skin Refreshing Wash" the
   same product, because one differing word on each side still scores 0.71. */

import { inciKey } from "@/lib/inci-normalise";
import { brandKey, nameTokens, type IdentityCandidate } from "@/lib/product-identity";

const isSubset = (a: Set<string>, b: Set<string>) => [...a].every((x) => b.has(x));

export type IdentityVerdict = "PROBABLE_DUPLICATE" | "CONFLICT_QUARANTINE" | "DISTINCT";

export interface IdentityDecision {
  verdict: IdentityVerdict;
  nameJaccard: number;
  /** null when one side has no ingredient list, so the formula could not be compared. */
  inciJaccard: number | null;
  reason: string;
}

const jaccard = <T,>(a: Set<T>, b: Set<T>): number => {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const x of a) if (b.has(x)) shared++;
  return shared / (a.size + b.size - shared);
};

/** Share of ingredients in common after synonym folding (Water = Aqua = Eau). */
export function normalisedInciSimilarity(a: string[], b: string[]): number {
  return jaccard(new Set(a.map(inciKey).filter(Boolean)), new Set(b.map(inciKey).filter(Boolean)));
}

const round = (n: number) => Math.round(n * 1000) / 1000;

export interface IdentityThresholds {
  /** Name-token Jaccard at or above which two records are treated as the same name. */
  name: number;
  /** Formula Jaccard at or above which a same-name pair is a probable duplicate. */
  inci: number;
}
const DEFAULTS: IdentityThresholds = { name: 0.6, inci: 0.75 };

export function identityDecision(
  a: IdentityCandidate,
  b: IdentityCandidate,
  t: IdentityThresholds = DEFAULTS,
): IdentityDecision {
  if (brandKey(a.brand) !== brandKey(b.brand)) {
    return { verdict: "DISTINCT", nameJaccard: 0, inciJaccard: null, reason: "different brand" };
  }
  const ta = nameTokens(a.productName, a.brand);
  const tb = nameTokens(b.productName, b.brand);
  const nameJaccard = round(jaccard(ta, tb));
  const nested = ta.size > 0 && tb.size > 0 && (isSubset(ta, tb) || isSubset(tb, ta));
  if (!nested || nameJaccard < t.name) {
    return { verdict: "DISTINCT", nameJaccard, inciJaccard: null, reason: "names differ" };
  }
  if (!a.inci?.length || !b.inci?.length) {
    return { verdict: "CONFLICT_QUARANTINE", nameJaccard, inciJaccard: null, reason: "same name but one side has no ingredient list to compare" };
  }
  const inciJaccard = round(normalisedInciSimilarity(a.inci, b.inci));
  if (inciJaccard >= t.inci) {
    return { verdict: "PROBABLE_DUPLICATE", nameJaccard, inciJaccard, reason: "name and formula both match" };
  }
  return { verdict: "CONFLICT_QUARANTINE", nameJaccard, inciJaccard, reason: "same name but the formulas disagree" };
}
