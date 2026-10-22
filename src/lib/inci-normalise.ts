/* Ingredient normaliser.

   Runs before any verifier rule or identity comparison, so legitimate display
   conventions are mapped, never penalised: "Aqua (Water)", "Water (Aqua) (Eau)" and
   "Eau" are all Water. It maps and it suggests. It never rewrites a stored list and
   never decides which spelling is right: marketing shorthand ("Vit E") and reversed
   names ("Edta Disodium") only get a suggestion that needs a source to confirm it,
   because the brand's own label may well use that wording.

   Catch-all detection stays defined in inci-catchall.ts (the rubric's one
   definition). A fragrance declaration is NOT a catch-all: "Parfum" and "Sugandhit
   Dravya" make the same disclosure (a fragrance is present, its composition is not
   itemised), and language alone is not evidence of worse chemistry. Both are classed
   `fragranceDeclaration` and handled identically: uncapped, ungated, no queue lead. */

import { catchAllKind, type CatchAllKind } from "@/lib/inci-catchall";

export interface NormalisedIngredient {
  raw: string;
  /** Display-synonym-folded name, with any q.s. marker removed. */
  canonical: string;
  /** "X q.s.": X is NAMED, only its quantity is open. Never an undisclosed base. */
  quantityUnspecified: boolean;
  /** The entry names no composition under the rubric (see inci-catchall.ts). */
  catchAll: CatchAllKind | null;
  /** A fragrance is declared without itemising it ("Parfum", "Fragrance", "Sugandhit Dravya").
      Disclosure-neutral: it never costs points, gates a badge or raises a lead. */
  fragranceDeclaration: boolean;
  /** Leads, not corrections. Each needs a source before it is applied. */
  suggestions: string[];
}

const WATER = new Set([
  "water", "aqua", "eau", "purified water",
  "demineralised water", "demineralized water", "deionised water", "deionized water",
]);
const FRAGRANCE = new Set(["fragrance", "parfum", "perfume"]);

/* The Hindi wording for "fragrant substance". Its classification as a fragrance
   declaration is unreviewed, so it only ever gets a suggestion, like "Vit E". */
const HINDI_FRAGRANCE_RE = /^sugandh(?:it|ita)?\s+dravy(?:a|as)$/i;

/* A trailing q.s. marker: "Sodium Benzoate- Q.S.", "Water Q.S.", "Aqua (q.s.)",
   "Aqua q.s. to 100%". The lookbehind stops it matching letters inside a word. */
const QS_TAIL_RE = /\s*[-–:,]?\s*\(?\s*(?<![a-z])q\.?\s?s\.?(?:\s*to\s*100\s*%?)?\s*\)?\s*$/i;

const SHORTHAND: Record<string, string> = {
  vite: "Tocopherol (or Tocopheryl Acetate - confirm against source)",
  vitaminE: "Tocopherol (or Tocopheryl Acetate - confirm against source)",
  vitc: "Ascorbic Acid (or a derivative - confirm against source)",
  vitaminC: "Ascorbic Acid (or a derivative - confirm against source)",
};
const SHORTHAND_BY_KEY = new Map(Object.entries(SHORTHAND).map(([k, v]) => [k.toLowerCase(), v]));

const REVERSED_EDTA_RE = /^edta\s+(disodium|trisodium|tetrasodium)$/i;

const squashSpaces = (s: string) => s.replace(/\s+/g, " ").trim();

/** "Water (Aqua) (Eau)", "Aqua / Water", "Parfum": fold a synonym set to one name. */
function foldSynonym(stem: string): string | null {
  const parts = stem.toLowerCase().split(/[()/]/).map(squashSpaces).filter(Boolean);
  if (!parts.length) return null;
  if (parts.every((p) => WATER.has(p))) return "Water";
  if (parts.every((p) => FRAGRANCE.has(p))) return "Fragrance";
  return null;
}

export function normaliseIngredient(raw: string): NormalisedIngredient {
  const text = squashSpaces(raw.replace(/\*+$/, ""));
  const quantityUnspecified = QS_TAIL_RE.test(text);
  const stripped = squashSpaces(text.replace(QS_TAIL_RE, ""));
  // A bare "QS" strips to nothing: keep the raw text so it can still be reported.
  const stem = stripped || text;

  const suggestions: string[] = [];
  let canonical = stem;
  const folded = foldSynonym(stem);
  const hindiFragrance = HINDI_FRAGRANCE_RE.test(stem);
  if (folded) {
    canonical = folded;
  } else if (hindiFragrance) {
    suggestions.push("possible INCI: Parfum - confirm against source");
  } else {
    const shorthand = SHORTHAND_BY_KEY.get(stem.toLowerCase().replace(/[^a-z0-9]/g, ""));
    if (shorthand) suggestions.push(`possible INCI: ${shorthand}`);
    const edta = REVERSED_EDTA_RE.exec(stem);
    if (edta) suggestions.push(`reversed name? did you mean '${edta[1][0].toUpperCase()}${edta[1].slice(1).toLowerCase()} EDTA'`);
  }

  return {
    raw, canonical, quantityUnspecified,
    catchAll: catchAllKind(text),
    fragranceDeclaration: canonical === "Fragrance" || hindiFragrance,
    suggestions,
  };
}

/** Comparison key for an ingredient: synonym-folded, brackets and punctuation gone,
    and "X / common name" reduced to X. For identity matching, never for display. */
export function inciKey(raw: string): string {
  const canonical = normaliseIngredient(raw).canonical;
  const head = canonical.split(" / ")[0] ?? canonical;
  return head.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, "");
}
