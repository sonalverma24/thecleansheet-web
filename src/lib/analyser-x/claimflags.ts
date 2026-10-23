/* ────────────────────────────────────────────────────────────────
   Analyser vX · claim flags, by code

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
  fairness: string[];
  boundary: string[];
}

/** Hard flags over the claims, given the list. A block needs a verified claim (corroborated === true); drug-style
    wording only needs the claim not to be known-fabricated, because it can only raise a caution. */
export function claimFlags(claims: ClaimValue[], inci: string[]): ClaimFlags {
  const out: ClaimFlags = { contradicted: [], fairness: [], boundary: [] };
  for (const c of claims) {
    if (c.corroborated === false) continue;
    if (c.corroborated === true) {
      out.contradicted.push(...contradictions(c.text, inci));
      if (isFairnessClaim(c.text)) { out.fairness.push(c.text); continue; }
    }
    if (c.drugBoundary && !SPF_LABEL_RE.test(c.text) && !isFairnessClaim(c.text)) out.boundary.push(c.text);
  }
  return out;
}
