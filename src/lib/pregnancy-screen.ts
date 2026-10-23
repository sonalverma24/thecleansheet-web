/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Pregnancy screen for the "at a glance" highlights

   Reads the ingredient database's Pregnancy_Restriction column for every declared ingredient. It states what the database
   holds and nothing more: "clear" means no ingredient on the list carries a pregnancy caution in our reference data. It is
   not a medical statement about the product, and it is never "clear" while an ingredient is unresolved.
──────────────────────────────────────────────────────────────── */

import { lookupIngredient, rowLooksValid } from "@/lib/ingredient-db";

/** The values the database uses for a real caution: "Caution during pregnancy…", "Yes", or wording such as "commonly cautioned",
    "advise clinician review", "contraindicated", "precautionary avoidance". "No specific restriction identified…" and "No" are not
    cautions. A tick that says "no caution" is the dangerous one to get wrong, so soft wording counts as a caution here. */
const CAUTION_RE = /^(caution|yes\b)|\bcaution(ed)?\b|reproductive toxi|contraindicated|clinician review|precautionary avoidance|avoided in pregnancy/i;
/** A note that says a restriction does not apply to a topical cosmetic ("…not applicable to refined topical cosmetic seed oil"). */
const NOT_APPLICABLE_RE = /not applicable/i;

export interface PregnancyScreen {
  /** clear: every ingredient resolved and none cautioned. caution: at least one is cautioned. unknown: nothing cautioned, but some ingredient could not be checked. */
  status: "clear" | "caution" | "unknown";
  cautioned: { name: string; note: string }[];
  unresolved: string[];
}

export function pregnancyScreen(ingredients: string[]): PregnancyScreen {
  const cautioned: PregnancyScreen["cautioned"] = [];
  const unresolved: string[] = [];
  for (const name of ingredients) {
    const row = lookupIngredient(name);
    if (!row || !rowLooksValid(row)) { unresolved.push(name); continue; }
    const raw = (row.Pregnancy_Restriction ?? "").trim();
    if (raw && CAUTION_RE.test(raw) && !NOT_APPLICABLE_RE.test(raw)) cautioned.push({ name, note: raw.split(/[.;]/)[0].trim() });
  }
  if (!ingredients.length) return { status: "unknown", cautioned, unresolved };
  return { status: cautioned.length ? "caution" : unresolved.length ? "unknown" : "clear", cautioned, unresolved };
}
