/* Catch-all ingredient detector.

   An INCI list names every ingredient. Entries like "Soap Base", "Herbal Blend",
   "Natural Extracts" or a bare "QS" are not INCI names: they hide a composition
   that cannot be screened for banned, restricted or sensitising ingredients, and
   a "base" can be most of the product by weight. This is a disclosure gap, not a
   safety finding, so it costs Ingredient Transparency points and is flagged on the
   ingredient, but it never feeds the safety gate or the banned-ingredient screen.
   Pure functions only, so the engine, the scorecard mapper and the backfill share
   one definition. */

import type { ProductReview } from "@/lib/product-review-types";

export type CatchAllKind = "base" | "blend" | "qs" | "generic";

export interface CatchAllHit {
  name: string;
  kind: CatchAllKind;
}

const QS_SRC = String.raw`(?<![a-z])q\.?\s?s\.?(?![a-z])|\bquantum satis\b`;
const QS_RE = new RegExp(QS_SRC, "i");
const QS_STRIP_RE = new RegExp(QS_SRC, "gi");
const BASE_RE = /\bbase\b/i;
const BLEND_RE = /\b(?:blend|mix|mixture|complex|proprietary|compound)\b/i;
const GENERIC_RE =
  /^(?:(?:other|additional|natural|plant|herbal|botanical|fruit|vegetable|floral|essential|active|inactive) )*(?:ingredients?|extracts?|oils?|actives?|preservatives?|emulsifiers?|surfactants?|colou?rs?|colou?rants?|additives?|stabili[sz]ers?)$|^(?:others?|etc\.?)$/i;

/** "Herbal Blend (Neem, Tulsi, Aloe)" names what is inside, so it is disclosed. */
function hasBreakdown(item: string): boolean {
  const inner = item.match(/\(([^)]*)\)/)?.[1];
  if (!inner) return false;
  return inner.split(/[,;/&]|\band\b/i).filter((p) => p.trim().length > 1).length >= 2;
}

/** The catch-all kind of a single ingredient entry, or null for a named ingredient. */
export function catchAllKind(raw: string): CatchAllKind | null {
  const item = raw.replace(/\s+/g, " ").replace(/\*+$/, "").trim();
  if (!item || hasBreakdown(item)) return null;

  if (QS_RE.test(item)) {
    // q.s. only says the amount is unspecified ("Aqua q.s.", "Perfume (Q.S.)" still name
    // what it is). It is a catch-all when it names nothing, or when what it names is
    // itself a catch-all ("Base QS", "Gel Base: q.s.").
    const rest = item.replace(QS_STRIP_RE, " ").replace(/\bto\s*100\s*%?/gi, " ").replace(/[()\s.,:-]+/g, " ").trim();
    return rest ? catchAllKind(rest) : "qs";
  }

  if (BASE_RE.test(item)) return "base";
  if (BLEND_RE.test(item)) return "blend";
  if (GENERIC_RE.test(item)) return "generic";
  return null;
}

export function findCatchAllIngredients(inci: string[]): CatchAllHit[] {
  const seen = new Set<string>();
  const hits: CatchAllHit[] = [];
  for (const name of inci) {
    const kind = catchAllKind(name);
    const key = name.trim().toLowerCase();
    if (!kind || seen.has(key)) continue;
    seen.add(key);
    hits.push({ name: name.trim(), kind });
  }
  return hits;
}

/* Ingredient Transparency is out of 20, banded 1-5 by the review rubric
   (0-2, 3-7, 8-12, 13-17, 18-20). A base hides the bulk of the formula, so the
   full INCI is not really published: it cannot score above "Basic label
   transparency" (7). Any other catch-all leaves composition context missing,
   which the rubric requires for "Strong formula transparency", so it stops at the
   top of "Good consumer transparency" (12). Three or more is a pattern: 7.
   Only ever a ceiling, never a raise, so applying it twice changes nothing. */
const SECTION_MAX = 20;
const CEILING_BASE = 7;
const CEILING_OTHER = 12;
const CEILING_MANY = 7;
const MANY = 3;

/** The highest Ingredient Transparency score these hits allow (20 when none). */
export function catchAllCeiling(hits: CatchAllHit[]): number {
  if (!hits.length) return SECTION_MAX;
  if (hits.length >= MANY) return CEILING_MANY;
  return hits.some((h) => h.kind === "base") ? CEILING_BASE : CEILING_OTHER;
}

/** Consumer-facing note for the ingredient row. Says plainly it is a disclosure gap. */
export function catchAllNote(kind: CatchAllKind): string {
  switch (kind) {
    case "base": return "Not an INCI name. What this base contains is not disclosed, so it cannot be screened. A disclosure gap, not a safety finding.";
    case "blend": return "A blend or complex listed without its ingredients, so what is in it cannot be screened. A disclosure gap, not a safety finding.";
    case "qs": return "Listed as q.s. with no named ingredient, so what it is and how much is unclear. A disclosure gap, not a safety finding.";
    case "generic": return "A generic term, not a named ingredient, so it cannot be screened. A disclosure gap, not a safety finding.";
  }
}

const issueFor = (h: CatchAllHit): string => {
  switch (h.kind) {
    case "base": return `"${h.name}" is not an INCI name, so the ingredients inside it are not disclosed.`;
    case "blend": return `"${h.name}" is a blend or complex listed without its ingredients.`;
    case "qs": return `"${h.name}" is listed as q.s. with no named ingredient.`;
    case "generic": return `"${h.name}" is a generic term, not a named ingredient.`;
  }
};

type TransparencyLabel = ProductReview["ingredientTransparency"]["label"];
const LABELS: TransparencyLabel[] = [
  "Ingredient theatre",
  "Basic label transparency",
  "Good consumer transparency",
  "Strong formula transparency",
  "Evidence backed transparency",
];

const bandForPoints = (p: number): 1 | 2 | 3 | 4 | 5 => (p <= 2 ? 1 : p <= 7 ? 2 : p <= 12 ? 3 : p <= 17 ? 4 : 5);

/** Record the gap on the review's own transparency read: an issue per catch-all,
    the 1-5 score and label held to what the ceiling allows, and the "full INCI" /
    "complexes explained" booleans set false where a catch-all contradicts them.
    Mutates and is idempotent. The points ceiling itself is enforced in
    reconcileScores so it also holds for rows stored before this existed. */
export function applyCatchAllDisclosure(review: ProductReview, inci: string[]): CatchAllHit[] {
  const hits = findCatchAllIngredients(inci);
  const t = review.ingredientTransparency;
  if (!hits.length || !t) return hits;

  t.issues = Array.isArray(t.issues) ? t.issues : [];
  for (const h of hits) {
    const msg = issueFor(h);
    if (!t.issues.includes(msg)) t.issues.push(msg);
  }
  if (hits.some((h) => h.kind === "base")) t.fullInciAvailable = false;
  if (hits.some((h) => h.kind === "base" || h.kind === "blend")) t.complexesExplained = false;

  const cap = bandForPoints(catchAllCeiling(hits));
  if (typeof t.score === "number" && t.score > cap) {
    t.score = cap;
    t.label = LABELS[cap - 1];
  }
  return hits;
}
