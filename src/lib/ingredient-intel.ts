/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Ingredient intelligence (the resolver)
   Turns the concept dictionary into the questions the engine asks:
     • what concept is this claim / ingredient talking about?
     • does this product's INCI actually contain that concept?
     • are these two ingredient names the same thing?

   Everything is deterministic and normalised, so "Sodium Hyaluronate"
   in an INCI satisfies a "Hyaluronic Acid" claim - the exact gap that
   let a clean product get wrongly flagged.
──────────────────────────────────────────────────────────────── */

import { CONCEPTS, type IngredientConcept } from "@/data/ingredients/concepts";

/** Lower-case, strip accents/punctuation, collapse whitespace. */
export function norm(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9%+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* Pre-index every term → concept, longest term first so "hyaluronic acid"
   wins over "acid" and "sodium laureth sulfate" over "sulfate". */
interface Term { term: string; concept: IngredientConcept; isInci: boolean }
const TERMS: Term[] = CONCEPTS
  .flatMap((concept) => [
    ...concept.inci.map((t) => ({ term: norm(t), concept, isInci: true })),
    ...concept.aliases.map((t) => ({ term: norm(t), concept, isInci: false })),
  ])
  .filter((t) => t.term.length > 1)
  .sort((a, b) => b.term.length - a.term.length);

/** Does normalised `hay` contain `needle` as a whole word (not a substring of a
    bigger word)? Guards against "aloe" matching "aloe barbadensis"? (that IS a
    match) but stops "eau" matching "beauty". */
function hasWord(hay: string, needle: string): boolean {
  if (!needle) return false;
  const i = hay.indexOf(needle);
  if (i === -1) return false;
  const before = i === 0 ? " " : hay[i - 1];
  const after = i + needle.length >= hay.length ? " " : hay[i + needle.length];
  return !/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after);
}

/** The concept a free-text ingredient/claim string is talking about, if known.
    Longest matching term wins so specific names beat generic ones. */
export function resolveConcept(text: string): IngredientConcept | null {
  const h = ` ${norm(text)} `;
  for (const t of TERMS) if (hasWord(h, t.term)) return t.concept;
  return null;
}

/** EVERY concept named in a string (deduped), so "silicone and paraben free"
    resolves to both silicones and parabens. Longest terms considered first. */
export function resolveConcepts(text: string): IngredientConcept[] {
  const h = ` ${norm(text)} `;
  const out: IngredientConcept[] = [];
  for (const t of TERMS) {
    if (hasWord(h, t.term) && !out.some((c) => c.id === t.concept.id)) out.push(t.concept);
  }
  return out;
}

/** Is `concept` actually present in this INCI list (via any of its INCI forms)? */
export function inciContainsConcept(inci: string[], concept: IngredientConcept): boolean {
  const hay = ` ${norm(inci.join(" | "))} `;
  return concept.inci.some((form) => hasWord(hay, norm(form)));
}

/** The presence, in an INCI list, of whatever ingredient a claim names.
    Returns true (present), false (genuinely absent), or null (we don't
    recognise the ingredient - caller should treat as UNKNOWN, not absent). */
export function claimIngredientInInci(claimSubject: string, inci: string[]): boolean | null {
  const concept = resolveConcept(claimSubject);
  if (!concept) return null;
  if (!inci.length) return null;
  return inciContainsConcept(inci, concept);
}

/** Do two ingredient names refer to the same concept? (e.g. "Aqua" & "Water",
    "Sodium Hyaluronate" & "Hyaluronic Acid"). Null when neither resolves. */
export function sameIngredient(a: string, b: string): boolean | null {
  const ca = resolveConcept(a);
  const cb = resolveConcept(b);
  if (!ca || !cb) return null;
  return ca.id === cb.id;
}

/** Which known concepts (by id) a product's INCI contains - handy for tagging. */
export function conceptsInInci(inci: string[]): IngredientConcept[] {
  return CONCEPTS.filter((c) => inciContainsConcept(inci, c));
}

/** Of the actives a name PROMISES, the fraction the INCI actually delivers.
    1 when the name promises nothing checkable. Powers product disambiguation
    (a "Cica B5" entry with neither Centella nor Panthenol is the wrong product). */
export function promisedActivesMet(name: string, inci: string[]): number {
  const h = ` ${norm(name)} `;
  const promised = new Set<string>();
  for (const t of TERMS) if (!t.isInci && hasWord(h, t.term)) promised.add(t.concept.id);
  // also catch INCI-name mentions in the title (e.g. "Niacinamide 10%")
  for (const t of TERMS) if (t.isInci && hasWord(h, t.term)) promised.add(t.concept.id);
  if (!promised.size) return 1;
  let met = 0;
  for (const id of promised) {
    const concept = CONCEPTS.find((c) => c.id === id)!;
    if (inciContainsConcept(inci, concept)) met++;
  }
  return met / promised.size;
}
