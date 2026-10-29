/* ────────────────────────────────────────────────────────────────
   Analyser Version X1 · claim flags, by code

   Mirrors the hard-flag logic in deriveVerdict (src/lib/product-review-engine.ts):
   a contradiction against the ingredient list, a fairness claim, or drug-style
   wording. The difference from v3.0: these are detected from the claim's own text
   and the list, not from the model's risk label, and a block needs a claim whose
   quote was verified (corroborated === true).
──────────────────────────────────────────────────────────────── */

import { resolveConcepts, inciContainsConcept } from "@/lib/ingredient-intel";
import type { ClaimValue } from "./types";

/** Copied from the engine so the two stay comparable. */
export const FREE_FROM_RE = /\bfree\b|[- ]free\b|\bwithout\b|\bno\b\s|\bzero\b/i;
export const SPF_LABEL_RE = /spf|pa\+|uva|uvb|broad.?spectrum|sun.?protection|blue light/i;
export const FAIRNESS_RE = /(?<!\b(?:non|no|not|without|anti)[\s-])\b(whit(?:en(?:s|ed|ing)?|er|est)|fairness|skin[\s-]+lighten(?:s|ed|ing)?|permanent(?:ly)?[\s-]+(?:whiten|lighten|fair))/i;

export const isFreeFrom = (t: string): boolean => FREE_FROM_RE.test(t);

export interface Contradiction {
  claim: string;
  ingredient: string;
}

/** The list entries that contradict a "free-from X" claim. A "contains X" claim never contradicts: an absent
    active is unverified, not a lie. Empty with no list. */
export function contradictions(claimText: string, inci: string[]): Contradiction[] {
  if (!inci.length) return [];
  if (!isFreeFrom(claimText)) return [];
  const out: Contradiction[] = [];
  for (const concept of resolveConcepts(claimText)) {
    const hit = inci.find((name) => inciContainsConcept([name], concept));
    if (hit) out.push({ claim: claimText, ingredient: hit });
  }
  return out;
}

export const isFairnessClaim = (t: string): boolean => FAIRNESS_RE.test(t);

export interface ClaimFlags {
  contradicted: Contradiction[];
  /** A "free-from" claim nobody has checked against its source (corroborated unknown) that the product's own list appears to contradict. It can only
      raise a caution: a block needs a verified claim. Narrow on purpose: the claim must be typed free-from (the loose wording test also fires on "free
      radicals" and "without water"), and a list entry that itself says "free" ("Paraben-Free Goat Milk") is not read as the thing it excludes. */
  unchecked: Contradiction[];
  fairness: string[];
  boundary: string[];
}

const SAYS_FREE_RE = /\bfree\b/i;

/** A statement whose whole point is an exclusion: it starts "free from / free of / without / no / zero" (or "made without"), or it ends "-free". A longer sentence
    that merely mentions an ingredient ("Only zinc oxide and no hidden chemical filters in a silicon-based gel") is not read: the word test cannot tell which side
    of the exclusion the ingredient is on, and a caution that is wrong on a page a shopper reads costs more than one it misses. */
export const isExclusionStatement = (t: string): boolean => t.length <= 90 && /^\W*(?:(?:made|formulated|crafted)\s+)?(?:free (?:from|of)|without|no|zero)\b|[- ]free\W*$/i.test(t);

/** Hard flags over the claims, given the list. A block needs a verified claim (corroborated === true); drug-style
    wording only needs the claim not to be known-fabricated, because it can only raise a caution. */
export function claimFlags(claims: ClaimValue[], inci: string[]): ClaimFlags {
  const out: ClaimFlags = { contradicted: [], unchecked: [], fairness: [], boundary: [] };
  for (const c of claims) {
    if (c.corroborated === false) continue;
    if (c.corroborated == null && c.primaryType === "free-from" && isExclusionStatement(c.text)) out.unchecked.push(...contradictions(c.text, inci).filter((x) => !SAYS_FREE_RE.test(x.ingredient)));
    if (c.corroborated === true) {
      out.contradicted.push(...contradictions(c.text, inci));
      if (isFairnessClaim(c.text)) { out.fairness.push(c.text); continue; }
    }
    if (c.drugBoundary && !SPF_LABEL_RE.test(c.text) && !isFairnessClaim(c.text)) out.boundary.push(c.text);
  }
  return out;
}
