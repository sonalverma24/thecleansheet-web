/* Free-from claim ontology: matching logic. Data and the review rules for aliases
   live in src/data/ingredients/claim-ontology.ts.

   No substring chemistry: every form is matched as whole words inside one INCI item,
   or must equal the whole item. A relation is only `definitive` when the alias has
   been reviewed (source, qualified reviewer, date); otherwise it is `qualified`, which
   means "a person decides". A match is a LEAD about the recorded list, never a
   finding about the product. */

import { norm } from "@/lib/ingredient-intel";
import {
  AUTHORITATIVE_SOURCE_HOSTS, CLAIM_CLASSES,
  type ClaimClass, type HazardNote, type OntologyEntry,
} from "@/data/ingredients/claim-ontology";

export type RelationStrength = "definitive" | "qualified";

export interface Ontology { classes: ClaimClass[] }
export const DEFAULT_ONTOLOGY: Ontology = { classes: CLAIM_CLASSES };

/* ── Alias provenance ─────────────────────────────────────────────
   "Reviewed" is not "a string is present". Each field is checked for what it claims. */

/** A CAS Registry Number anywhere in the text, with its check digit verified. */
export function isValidCas(text: string): boolean {
  const m = /(?<![\d-])(\d{2,7})-(\d{2})-(\d)(?![\d-])/.exec(text);
  if (!m) return false;
  const digits = (m[1] + m[2]).split("").reverse();
  const sum = digits.reduce((acc, d, i) => acc + Number(d) * (i + 1), 0);
  return sum % 10 === Number(m[3]);
}

/** A verified CAS number, or an https URL on an authoritative host. */
export function isAuthoritativeSource(source?: string, hosts: readonly string[] = AUTHORITATIVE_SOURCE_HOSTS): boolean {
  const t = (source ?? "").trim();
  if (!t) return false;
  if (isValidCas(t)) return true;
  try {
    const u = new URL(t);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    return hosts.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

/** The only form a reviewer takes in this repository: an opaque panel reference. A name,
    a role or a placeholder ("qualified reviewer TBD") does not match. Matching the shape
    proves nothing about the person: scripts/audit-reviewer-register.mts checks the
    reference against the private register. */
export const REVIEW_REF_RE = /^TCS-P-\d{3,6}$/;
export const isReviewRef = (ref?: string): boolean => REVIEW_REF_RE.test((ref ?? "").trim());

/** The only public statement about who reviewed an alias. It names no one and carries no
    reference. It is shown only for an alias that is definitive in code (publicAttribution). */
export const PANEL_ATTRIBUTION = "Reviewed by an expert on the TCS Panel.";

/** YYYY-MM-DD, a real calendar date, not after `now`. */
export function isReviewDate(date?: string, now: Date = new Date()): boolean {
  const t = (date ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return false;
  const d = new Date(`${t}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === t && d.getTime() <= now.getTime();
}

/** Why a declared-definitive entry is not (yet) definitive. Empty means it is. */
export function provenanceProblems(e: OntologyEntry, now: Date = new Date()): string[] {
  const out: string[] = [];
  if (!isAuthoritativeSource(e.source)) out.push("source is not a verified CAS number or an authoritative https URL");
  if (!isReviewRef(e.reviewRef)) out.push("reviewRef is not a panel reference of the form TCS-P-014");
  if (!isReviewDate(e.reviewedAt, now)) out.push("reviewedAt is not a real past or present date (YYYY-MM-DD)");
  return out;
}

/** Declared definitive AND every provenance field checks out; anything less is qualified. */
export function effectiveStrength(e: OntologyEntry, now: Date = new Date()): RelationStrength {
  return e.strength === "definitive" && provenanceProblems(e, now).length === 0 ? "definitive" : "qualified";
}

/** What the public may be told about an alias's review. Null unless the alias is definitive
    in code, so the line cannot be shown for an unreviewed entry. Never includes the
    reference or any name. */
export function publicAttribution(e: OntologyEntry, now: Date = new Date()): string | null {
  return effectiveStrength(e, now) === "definitive" ? PANEL_ATTRIBUTION : null;
}

/** Presence in a recorded list is a hazard-classification matter, not an exposure-risk
    conclusion. Appended in code to every dispute that has an ontology hit, never per row. */
export const HAZARD_DISCLAIMER =
  "Presence of an ingredient in a recorded list is a hazard-classification matter, not an exposure-risk conclusion.";

/** Normalised comparison key for a claim or tick label ("Sulphate-Free" = "sulfate free"). */
export const claimKey = (s: string): string =>
  s.toLowerCase().replace(/sulphate/g, "sulfate").replace(/[\s-]+/g, " ").trim();

export function classForTick(label: string, ontology: Ontology = DEFAULT_ONTOLOGY): ClaimClass | null {
  const k = claimKey(label);
  return ontology.classes.find((c) => c.tickLabels.some((t) => claimKey(t) === k)) ?? null;
}

/** Spelling variants that are the same word (British "sulphate"). Applied to the ingredient
    entry and to the ontology form alike, so neither side can miss on spelling alone. */
const foldSpelling = (n: string): string => n.replace(/\bsulphate/g, "sulfate");

/** Whole-word containment over every occurrence, not just the first. */
function containsWords(hay: string, needle: string): boolean {
  if (!needle) return false;
  for (let i = hay.indexOf(needle); i !== -1; i = hay.indexOf(needle, i + 1)) {
    const before = i === 0 ? " " : hay[i - 1];
    const after = i + needle.length >= hay.length ? " " : hay[i + needle.length];
    if (!/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)) return true;
  }
  return false;
}

export interface RelationHit {
  /** The INCI item as listed. */
  ingredient: string;
  form: string;
  strength: RelationStrength;
  note?: string;
  /** Hazard context, present only when it names an authoritative source of its own. */
  hazard?: HazardNote;
}

/** Every INCI item that stands in a relation to this claim class. */
export function relationHits(cls: ClaimClass, inci: string[]): RelationHit[] {
  const hits: RelationHit[] = [];
  for (const item of inci) {
    const n = foldSpelling(norm(item));
    if (!n) continue;
    for (const e of cls.entries) {
      const form = foldSpelling(norm(e.form));
      const matched = e.match === "exact" ? n === form : containsWords(n, form);
      if (matched) {
        const hazard = e.hazard && e.hazard.text.trim() && isAuthoritativeSource(e.hazard.source) ? e.hazard : undefined;
        hits.push({ ingredient: item, form: e.form, strength: effectiveStrength(e), note: e.note, ...(hazard ? { hazard } : {}) });
        break; // one hit per INCI item is enough
      }
    }
  }
  return hits;
}

export type TickOutcome = "clear" | "present" | "unresolved";

/** What the ontology can honestly say about an "X free" tick. A label that is not a
    tracked class returns null, which means NOT CHECKED. Callers must never read null as
    "clear": that is the fail-open mistake of a claim nobody modelled.
    clear       no member of the class is listed.
    present     a definitive (reviewed) member is listed.
    unresolved  only qualified relations are listed: say nothing rather than guess.
    Returns null when the label is not a tracked claim class. */
export function ontologyTick(
  label: string,
  inci: string[],
  ontology: Ontology = DEFAULT_ONTOLOGY,
): { outcome: TickOutcome; hits: RelationHit[] } | null {
  const cls = classForTick(label, ontology);
  if (!cls) return null;
  const hits = relationHits(cls, inci);
  if (hits.some((h) => h.strength === "definitive")) return { outcome: "present", hits };
  if (hits.length) return { outcome: "unresolved", hits };
  return { outcome: "clear", hits };
}
