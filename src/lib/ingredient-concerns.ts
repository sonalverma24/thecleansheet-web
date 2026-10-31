/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Which ingredient is the concern, and where it lives

   The Ingredient safety line on an analysis page is the decision core's: a prohibited ingredient is Red, a caution is Yellow. The ingredient list under it
   is the reference database's, row by row, with its own dots. Nothing tied the two, so a line that said "comedogenic: isopropyl myristate" sat above a
   list that showed Isopropyl Myristate as "no concern". This file ties them:

     ingredientConcerns   which rows of the list the decision's findings name, with the colour of the finding and its short label
     ingredientHref       the ingredient's own page, when the screen resolved the row to one

   Display only. It reads the decision's reasons and decides nothing: a finding that names no ingredient marks no row, and a name that matches no row marks none.
──────────────────────────────────────────────────────────────── */

import { inciHas } from "@/data/analysis/ingredient-risk";
import { INGREDIENT_CAUTIONS } from "@/lib/analyser-x/sections";
import type { DecisionReason } from "@/lib/analyser-x/types";
import { canonicalIngredientSlug } from "@/lib/ingredient-canonical";
import { lookupIngredient } from "@/lib/ingredient-db";
import { hasIngredientPage, toSlug } from "@/lib/ingredient-utils";

/** Red for a finding that blocks (a prohibited ingredient, a contradicted claim); yellow for a caution. The same split safetyMarker makes for the row's colour. */
export type ConcernTone = "red" | "yellow";

export interface IngredientConcern {
  /** The row's place in the ingredient list (the list can repeat a name, so the place is the key). */
  index: number;
  name: string;
  tone: ConcernTone;
  /** What the findings say about it, in their own short words ("Comedogenicity risk"). One per finding that names it. */
  tags: string[];
}

const words = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const toneOf = (ruleId: string): ConcernTone | null => (ruleId.startsWith("block.") ? "red" : INGREDIENT_CAUTIONS.has(ruleId) ? "yellow" : null);

/**
 * The rows of `entries` that the decision's findings name.
 *
 * A check may name a whole list entry ("Cyclopentasiloxane") or only the stem it matched inside one ("laminaria", in "Laminaria Ochroleuca Extract"). A stem
 * matches a row the way the check itself matched it: as a run of whole words (inciHas), so "oleic acid" does not match inside "linoleic acid". An unnamed
 * entry ("Extract") is matched whole, never inside a longer name, or every extract in the list would be marked.
 */
export function ingredientConcerns(entries: readonly { name: string }[], reasons: readonly DecisionReason[]): IngredientConcern[] {
  const found = new Map<number, IngredientConcern>();
  for (const r of reasons) {
    const tone = toneOf(r.ruleId);
    const names = (r.evidence?.ingredients ?? []).filter(Boolean);
    if (!tone || !names.length) continue;
    const whole = r.ruleId === "caution.catch_all";
    entries.forEach((e, index) => {
      const named = names.some((n) => (whole ? words(e.name) === words(n) : inciHas(e.name, [n]).length > 0));
      if (!named) return;
      const tag = r.evidence?.tag;
      const have = found.get(index);
      if (!have) found.set(index, { index, name: e.name, tone, tags: tag ? [tag] : [] });
      else {
        if (tone === "red") have.tone = "red";
        if (tag && !have.tags.includes(tag)) have.tags.push(tag);
      }
    });
  }
  return [...found.values()].sort((a, b) => a.index - b.index);
}

/**
 * The address of an ingredient's own page, or null. It goes through the same lookup the safety screen uses, so a row links only where the screen found its
 * reference row, and "Aqua/Water/Eau" or "Niacinamide (10%)" reach the page for the ingredient they name. A row the screen could not resolve is not linked:
 * a link to a page that is not there would be worse than no link.
 */
export function ingredientHref(name: string): string | null {
  const row = lookupIngredient(name);
  if (!row) return null;
  const slug = canonicalIngredientSlug(toSlug(row.INCI_Name));
  return hasIngredientPage(slug) ? `/ingredients/${slug}` : null;
}
