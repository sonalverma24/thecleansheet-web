/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Negation-aware text scan
   Zero dependencies on purpose, so it can be imported from a client
   component (the /ingredients directory badge) without pulling in the
   full ingredient database.
──────────────────────────────────────────────────────────────── */

/* Does `triggerRe` match somewhere in `text` OUTSIDE a negated clause? A
   naive keyword search reads "not restricted or prohibited" as a hit for
   "prohibited" - the exact inverse of what the sentence says. This checks
   each match's own clause (split on ; , .) for a negation cue first. */
export function hasUnnegatedMatch(text: string | undefined, triggerRe: RegExp): boolean {
  const t = (text || "").toLowerCase();
  if (!t) return false;
  const re = new RegExp(triggerRe.source, triggerRe.flags.includes("g") ? triggerRe.flags : triggerRe.flags + "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    const clauseStart = Math.max(t.lastIndexOf(";", m.index), t.lastIndexOf(",", m.index), t.lastIndexOf(".", m.index)) + 1;
    const clause = t.slice(clauseStart, m.index);
    if (!/\b(not|non|no|nor|never|isn't|aren't|wasn't|weren't)\b/.test(clause)) return true;
    if (re.lastIndex === m.index) re.lastIndex++; // guard against zero-width matches looping
  }
  return false;
}
