/* ────────────────────────────────────────────────────────────────
   Analyser Version X1 · decision invariants

   Checks a finished decision against the rules that must hold whatever the inputs.
   Used by the post_decide hook at run time (a violation holds the analysis for a
   person) and by the property tests. A decision that fails any invariant is a bug in
   the rules, never something to publish.
──────────────────────────────────────────────────────────────── */

import { lint } from "./copy";
import type { Decision, Finding, RuleContext } from "./types";

export function checkInvariants(decision: Decision, settled: Finding[], ctx: RuleContext): string[] {
  const v: string[] = [];
  const has = (s: Finding["severity"]) => settled.some((f) => f.severity === s);

  if ((decision.key === "medicinal-product") !== has("medicinal")) v.push("I1 medicinal-product must match a medicinal finding");

  if (decision.key === "look-elsewhere") {
    const codeBlocks = settled.filter((f) => f.severity === "block" && f.origin === "code");
    if (!codeBlocks.length) v.push("I2 look-elsewhere needs a code-origin block");
    if (codeBlocks.some((b) => b.needsReliableList) && !ctx.list.reliable) v.push("I2 a list-dependent block was published on an unreliable list");
    if (!decision.reasons.some((r) => r.kind === "block" && (r.evidence?.ingredient || r.evidence?.claim))) v.push("I5 look-elsewhere has no evidence trail");
  }

  if (decision.key === "not-enough-info" && !decision.gapKind) v.push("I3 not-enough-info must say whether the gap is acquisition or disclosure");
  if (decision.key === "not-enough-info" && !decision.reasons.some((r) => r.kind === "gap")) v.push("I3 not-enough-info needs a gap reason");

  if (decision.key === "good-choice") {
    if (has("block") || has("gap") || has("caution") || has("medicinal")) v.push("I4 good-choice with a block, gap, caution or medicinal finding");
    if (!ctx.list.reliable) v.push("I4 good-choice on an unreliable list");
    if (decision.reasons.filter((r) => r.kind === "support").length < 2) v.push("I4 good-choice needs at least two support reasons");
  }

  if (decision.reasons.length === 0) v.push("I5 a decision needs at least one reason");
  const ids = new Set(settled.map((f) => f.ruleId));
  for (const r of decision.reasons) {
    if (!ids.has(r.ruleId)) v.push(`I7 reason ${r.ruleId} has no finding`);
    const l = lint(r.text, { allowBanned: r.origin === "code" });
    if (!l.ok) v.push(`I6 reason ${r.ruleId} fails the language lint: ${l.problems.join("; ")}`);
  }
  return v;
}
