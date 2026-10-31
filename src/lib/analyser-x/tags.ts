/* ────────────────────────────────────────────────────────────────
   Analyser Version X1 · the label a finding puts beside each ingredient it names

   A reason says what was found ("Comedogenicity risk: ... isopropyl myristate, laminaria."). The page also marks each ingredient the reason names in the
   ingredient list, with a few words: this file builds those words. Like the reasons, they come from the rule id and its fixed parameters, never from a model,
   and say only what the finding says. Kept apart from copy.ts so that file stays the one list of reason sentences.
──────────────────────────────────────────────────────────────── */

import type { Finding } from "./types";

/** Finding params hold only plain values, so a finding that names several ingredients carries them in one string, split on this. */
export const NAME_SEP = " | ";

type P = Finding["params"];
const word = (v: unknown, fallback: string): string => (v === undefined || v === null || v === "" ? fallback : String(v));
const clip = (v: unknown): string => { const t = word(v, "a claim"); return t.length > 60 ? `${t.slice(0, 57)}...` : t; };

const TAG: Record<string, (p: P) => string> = {
  "block.prohibited": () => "Prohibited in cosmetics",
  "block.contradicted": (p) => `Contradicts “${clip(p.claim)}”`,
  "caution.soft_adverse": (p) => word(p.label, "Flagged by our screen"),
  "caution.audience": (p) => `Caution for ${word(p.audience, "some")} use`,
  "caution.catch_all": () => "Unnamed entry",
  "caution.benchmark_gap": (p) => (p.kind === "exceeded" ? `Over the ${word(p.authority, "regulator's")} limit` : `Not permitted in ${word(p.authority, "another market")}`),
};

/** The rules whose findings name an ingredient and so have a label for it. */
export const TAGGED_RULES: readonly string[] = Object.keys(TAG);

export function tagOf(f: Finding): string | undefined {
  return TAG[f.ruleId]?.(f.params);
}
