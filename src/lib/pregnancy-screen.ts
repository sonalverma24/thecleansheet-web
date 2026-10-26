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
/** A note that opens by saying there is no restriction ("No specific restriction identified; precautionary avoidance sometimes recommended…"). Whatever caution
    wording follows is a hedge or about a different material, so the ingredient is not cautioned; but it is not clear either, so it counts as not checked. */
const NO_RESTRICTION_RE = /^no specific restriction/i;
/** The retinoids the decision core's retinoid note names (src/lib/analyser-x/rules.ts), plus their acid and ester forms. The database holds no row for plain
    "Retinol", so without this a retinol serum would read as not checked and the pregnancy chip would vanish from the product that most needs it. Brackets are
    dropped first, so "Bakuchiol (a retinol alternative)" is not caught. */
export const RETINOID_RE = /\b(retinol|retinal|retinaldehyde|retinyl|retinoic|retinoate|tretinoin|isotretinoin|adapalene|tazarotene)\b/i;

export interface PregnancyScreen {
  /** clear: every ingredient resolved and none cautioned. caution: at least one is cautioned. unknown: nothing cautioned, but some ingredient could not be checked
      (no database row, or a row that only hedges). */
  status: "clear" | "caution" | "unknown";
  cautioned: { name: string; note: string }[];
  unresolved: string[];
}

export function pregnancyScreen(ingredients: string[]): PregnancyScreen {
  const cautioned: PregnancyScreen["cautioned"] = [];
  const unresolved: string[] = [];
  for (const name of ingredients) {
    const row = lookupIngredient(name);
    const trusted = row && rowLooksValid(row) ? row : null;
    const raw = (trusted?.Pregnancy_Restriction ?? "").trim();
    const hedged = NO_RESTRICTION_RE.test(raw);
    if (raw && CAUTION_RE.test(raw) && !NOT_APPLICABLE_RE.test(raw) && !hedged) { cautioned.push({ name, note: raw.split(/[.;]/)[0].trim() }); continue; }
    if (RETINOID_RE.test(name.replace(/\([^)]*\)/g, " "))) { cautioned.push({ name, note: "A retinoid, generally advised against during pregnancy" }); continue; }
    if (!trusted || (hedged && CAUTION_RE.test(raw) && !NOT_APPLICABLE_RE.test(raw))) unresolved.push(name);
  }
  if (!ingredients.length) return { status: "unknown", cautioned, unresolved };
  return { status: cautioned.length ? "caution" : unresolved.length ? "unknown" : "clear", cautioned, unresolved };
}
