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

/* A prohibition word followed by its own negation: "EU Annex II (prohibited) does not list polyacrylamide itself". The sentence says the ingredient
   is NOT on the prohibited list, but the word comes first and the negation after it, which the clause check above cannot see. */
const NEGATED_AFTER = /\b(?:prohibited|banned)\b\)?\s+(?:list\s+)?(?:does|do|did)\s+not\s+(?:list|include|name|cover|contain|mention)\b/gi;
/* A hedge: "Restricted or banned (check CPCB)" has not said banned. It says one of two things and tells the reader to look elsewhere. */
const HEDGED = /\b(?:restricted|banned|prohibited)\s+or\s+(?:restricted|banned|prohibited)\b|\(check [^)]*\)/i;

/** Does this status text say the ingredient is banned or prohibited? Not when the word is negated before or after it, and not when the text hedges
    between restricted and banned. The one reading both today's ingredient check and the decision core use, so they cannot drift apart. */
export function readsAsBan(text: string | undefined): boolean {
  const t = (text || "").replace(NEGATED_AFTER, " ");
  if (HEDGED.test(t)) return false;
  return hasUnnegatedMatch(t, /\b(prohibited|banned)\b/);
}
