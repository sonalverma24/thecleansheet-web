/* ────────────────────────────────────────────────────────────────
   Analyser Version X1 · the five sections of a product page, and what colour each is

   The product page rates five sections: Ingredient safety, Formula logic, Claims evidence, Test transparency, Consumer clarity. Each is Strong (green), Fair
   (yellow) or Concern (red), and Ingredient safety can also be not rated. The decision needs the same colours (a product whose five sections are all green
   is not held back by a caution those sections already measure, see decision.ts), so they are worked out here, once, and the page and the decision both
   read this file: they cannot disagree. Pure.
──────────────────────────────────────────────────────────────── */

import { MIN_SCREEN_COVERAGE } from "./kb";
import type { DecisionKey } from "./types";

export type SectionMarker = "green" | "yellow" | "red" | null;

/** A section's colour from its percentage. Green is a clearly strong result (75 and over), red a concern (under 45), yellow everything between. These two
    cut-offs are the only place the three colours are drawn on a percentage. */
export const GREEN_FROM = 75;
export const RED_UNDER = 45;
/** The Claims evidence row is Strong from 70% (owner decision, 2026-11-04; every other percentage row stays at GREEN_FROM). */
export const CLAIMS_GREEN_FROM = 70;
export const markerOfPct = (pct: number, greenFrom: number = GREEN_FROM): "green" | "yellow" | "red" => (pct >= greenFrom ? "green" : pct >= RED_UNDER ? "yellow" : "red");

/** The marker for test transparency, by the strongest public evidence for what the product promises: a named lab report or better is green (levels 5 to
    7), a brand's own say-so or a disclosed percentage or general research is yellow (levels 2 to 4), and no proof at all is red (level 1). */
const MARKER_OF_LEVEL: Record<number, "green" | "yellow" | "red"> = { 7: "green", 6: "green", 5: "green", 4: "yellow", 3: "yellow", 2: "yellow", 1: "red" };
export const testMarker = (level: number): "green" | "yellow" | "red" => MARKER_OF_LEVEL[Math.min(7, Math.max(1, level))];

const PERFORMANCE_TYPES = new Set(["concern", "appearance", "time-bound", "clinical", "functional"]);

/** The strongest public evidence among the claims that promise a result; failing that, among all claims. */
export function testLevelOfClaims(claims: readonly { primaryType: string; evidenceLevel: number }[]): number {
  const promising = claims.filter((c) => PERFORMANCE_TYPES.has(c.primaryType));
  const pool = promising.length ? promising : claims;
  return pool.length ? Math.max(...pool.map((c) => c.evidenceLevel)) : 1;
}

/** Cautions about an ingredient. Any one of them makes the Ingredient safety section yellow. */
export const INGREDIENT_CAUTIONS: ReadonlySet<string> = new Set(["caution.soft_adverse", "caution.audience", "caution.catch_all", "caution.benchmark_gap"]);

/** Blocks that are about the formula or the other rows, not about the ingredients: a sunscreen with no UV filter, and two weak rows. */
export const NON_INGREDIENT_BLOCKS: ReadonlySet<string> = new Set(["block.no_uv_filter", "block.rows"]);

/** Ingredient safety, from the findings that settled. "Clear" is a statement about the ingredients the screen checked (decision X42), so an ingredient our
    reference file does not hold does not make a clear screen Fair. It does once fewer than half the list was checked: the section would then say "Strong"
    about a list mostly unread. */
export function safetyMarker(input: { key: DecisionKey; settled: ReadonlySet<string>; screenCoverage: number }): SectionMarker {
  const { settled, screenCoverage } = input; // input.key is still passed by callers; since 2026-11-04 the row no longer depends on the pill
  const partial = settled.has("note.screen_partial");
  const mostlyChecked = screenCoverage >= MIN_SCREEN_COVERAGE;
  // A block that is about the ingredients (or the claims, as before) makes the row Concern. The two blocks that are about the formula and the other rows are not
  // about ingredient safety, so they leave it alone.
  if ([...settled].some((id) => id.startsWith("block.") && id !== "block.pillars" && !NON_INGREDIENT_BLOCKS.has(id)) || settled.has("block.pillars")) return "red";
  if ([...settled].some((id) => INGREDIENT_CAUTIONS.has(id))) return "yellow";
  if (settled.has("support.safety_clear") && (!partial || mostlyChecked)) return "green";
  if (partial) return "yellow";
  return null;
}

/** The four sections that come from the stored analysis itself (the fifth, Ingredient safety, comes from the findings). */
export interface ReviewSections { formula: SectionMarker; claims: SectionMarker; tests: SectionMarker; clarity: SectionMarker }

export function reviewSections(review: {
  scores?: { formulaLogic?: number; claimEvidence?: number; claimClarity?: number } | null;
  claimMap?: readonly { primaryType: string; evidenceLevel: number }[] | null;
}): ReviewSections {
  const s = review.scores;
  const pct = (points: number | undefined, outOf: number) => Math.round(((points ?? 0) / outOf) * 100);
  return {
    formula: markerOfPct(pct(s?.formulaLogic, 15)),
    claims: markerOfPct(pct(s?.claimEvidence, 20), CLAIMS_GREEN_FROM),
    tests: testMarker(testLevelOfClaims(review.claimMap ?? [])),
    clarity: markerOfPct(pct(s?.claimClarity, 15)),
  };
}

/* ── the five rows, read together (owner decision, 2026-11-04) ───────────────────────────────
   Green: Ingredient safety, Formula logic, Claims evidence and Consumer clarity are all Strong, and Test transparency is Fair or Strong.
   Red, from the rows: two or more rows are weak (Concern). Everything in between is Yellow. */

export interface Rows { safety: SectionMarker; formula: SectionMarker; claims: SectionMarker; tests: SectionMarker; clarity: SectionMarker }

export const ROW_NAMES: Record<keyof Rows, string> = {
  safety: "Ingredient safety", formula: "Formula logic", claims: "Claims evidence", tests: "Test transparency", clarity: "Consumer clarity",
};
const ROW_ORDER: (keyof Rows)[] = ["safety", "formula", "claims", "tests", "clarity"];

/** Whether the five rows are the Green set. A test that is Fair is enough: most brands publish little about their tests, and the rest of the rows say whether the claims are backed. */
export const meetsGreen = (r: Rows): boolean =>
  r.safety === "green" && r.formula === "green" && r.claims === "green" && r.clarity === "green" && (r.tests === "green" || r.tests === "yellow");

/** The names of the rows that keep a page from Green, in page order. */
export const rowsShortOfGreen = (r: Rows): string[] =>
  ROW_ORDER.filter((k) => (k === "tests" ? r[k] !== "green" && r[k] !== "yellow" : r[k] !== "green")).map((k) => ROW_NAMES[k]);

/** The names of the weak (Concern) rows, in page order. */
export const weakRows = (r: Rows): string[] => ROW_ORDER.filter((k) => r[k] === "red").map((k) => ROW_NAMES[k]);
