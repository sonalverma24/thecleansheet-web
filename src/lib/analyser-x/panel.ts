/* The global-benchmark panel, from a Decision's own basis: one line per authority. A medicine is not judged by the cosmetic
   ingredient rules, so it has no panel; neither does a Not enough info decision, which has no list to check. */

import { AUTHORITIES, AUTHORITY_LABEL } from "./regulatory";
import type { Authority, Decision } from "./types";

export interface BenchmarkPanel {
  authorities: { id: Authority; label: string; result: "Meets" | "Falls short" | "Not fully checked"; detail: string }[];
}

const RESULT_WORDS = { meets: "Meets", falls_short: "Falls short", unverified: "Not fully checked" } as const;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Why an authority got its result, in words a shopper can read. */
function detailOf(s: NonNullable<Decision["basis"]["benchmark"]>[Authority]): string {
  if (s.verdict === "meets") return "Every declared ingredient was checked; none is prohibited or over a stated limit.";
  const parts: string[] = [];
  if (s.prohibited) parts.push(`${plural(s.prohibited, "ingredient is", "ingredients are")} prohibited`);
  if (s.exceeded) parts.push(`${plural(s.exceeded, "ingredient is", "ingredients are")} over a limit the product itself states`);
  if (!parts.length) parts.push("none is prohibited");
  if (s.unverifiable) parts.push(`${plural(s.unverifiable, "restricted ingredient", "restricted ingredients")} could not be checked (strength or conditions not stated)`);
  if (s.notCovered) parts.push(`${plural(s.notCovered, "ingredient is", "ingredients are")} not covered by our reference data`);
  if (s.lowConfidence) parts.push(`${plural(s.lowConfidence, "entry rests", "entries rest")} on a source we grade as low confidence`);
  const text = parts.join("; ");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

export const benchmarkPanel = (d: Decision): BenchmarkPanel | null => {
  const b = d.basis.benchmark;
  if (d.key === "medicinal-product") return null;
  return b ? { authorities: AUTHORITIES.map((id) => ({ id, label: AUTHORITY_LABEL[id], result: RESULT_WORDS[b[id].verdict], detail: detailOf(b[id]) })) } : null;
};
