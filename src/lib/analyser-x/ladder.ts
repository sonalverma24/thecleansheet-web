/* ────────────────────────────────────────────────────────────────
   Analyser Version X1 · evidence ladder and residual risk, in code

   In v3.0 the model assigns each claim's evidence level and risk level. In vX
   the model only READS an evidence document into a structured record, with
   quotes; the level and the risk are computed here from the verified record.
   A model can no longer award itself a Level 6 by asserting one.
──────────────────────────────────────────────────────────────── */

/** What the reader extracted from one evidence document, after the verifier has
    checked every quoted span against the captured text. */
export interface EvidenceRecord {
  /** "test_report" | "clinical_study" | "published_paper" | "certificate" | "marketing_graphic" */
  docType: string;
  /** The document's product-tested identity matches THIS product (name tokens and variant equal). */
  productMatches: boolean;
  lab?: string;
  sampleSize?: number;
  durationDays?: number;
  method?: string;
  /** DOI, PubMed id or a registry id (CTRI, ClinicalTrials.gov). */
  registryId?: string;
  /** What was measured, as the report states it, and what it found. Read by the reader, verified by quote, compared with the claim by code. */
  endpoint?: string;
  direction?: "improved" | "no_change" | "worse";
  significant?: boolean;
}

/** STARTER LIST of independent testing houses, to be reviewed by the TCS panel before it is relied on.
    A lab that is not in this list is "named" but not "independent", which caps the level at 4. Keep it
    short and sourced: an unreviewed addition here raises a brand's evidence level. */
export const INDEPENDENT_LABS = ["intertek", "sgs", "eurofins", "bureau veritas", "tuv", "tüv", "dermscan"] as const;

const DOI_RE = /\b10\.\d{4,9}\/\S+/;
const REGISTRY_RE = /\b(?:CTRI\/\d{4}\/\d{2,3}\/\d+|NCT\d{8}|PMID[:\s]*\d{5,9})\b/i;

export const isIndependentLab = (lab?: string): boolean => {
  const t = (lab ?? "").toLowerCase();
  // Short names match as whole words so "sgs" cannot match inside another word.
  return INDEPENDENT_LABS.some((l) => (l.length <= 4 ? new RegExp(`(^|[^a-z])${l}([^a-z]|$)`).test(t) : t.includes(l)));
};

export const hasRegistryId = (id?: string): boolean => !!id && (DOI_RE.test(id) || REGISTRY_RE.test(id));

const STOP = new Set(["with", "from", "that", "this", "your", "also", "after", "before", "visibly", "skin", "hair", "face", "body", "week", "weeks", "days", "month", "months", "hours", "clinically", "tested", "proven", "results", "formula"]);
const stems = (t: string): Set<string> => new Set((t.toLowerCase().match(/[a-z]{4,}/g) ?? []).filter((w) => !STOP.has(w)).map((w) => w.slice(0, 5)));

/** Does the outcome the report measured match what the claim promises? A shared distinctive word stem is the test, so
    "blemish count" supports “reduces blemishes” and "skin hydration" does not. */
export function endpointMatchesClaim(claimText: string, endpoint?: string): boolean {
  if (!endpoint) return false;
  const c = stems(claimText);
  return [...stems(endpoint)].some((s) => c.has(s));
}

const hasDesign = (r: EvidenceRecord): boolean => (r.sampleSize ?? 0) > 0 && (r.durationDays ?? 0) > 0 && !!r.method;

/** The level one record supports for the claim it covers, per the 1 to 7 ladder.

    A registry or DOI identifier makes a study TRACEABLE; it does not make it well designed or its result relevant.
    Level 7 therefore needs the design (sample, duration, method), an identifier, AND a reported result that is an
    improvement, is significant, and measured what the claim promises. */
export function levelFromRecord(r: EvidenceRecord, claimText = ""): number {
  if (!r.productMatches) return 2; // a report about another product is, at best, ingredient-level support
  if (hasDesign(r)) {
    const outcomeSupportsClaim = r.direction === "improved" && r.significant === true && endpointMatchesClaim(claimText, r.endpoint);
    return hasRegistryId(r.registryId) && outcomeSupportsClaim ? 7 : 6;
  }
  const report = /report|study|certificate/.test(r.docType);
  const levels = [
    hasRegistryId(r.registryId) ? 4 : 0,
    report && isIndependentLab(r.lab) ? 5 : 0,
    report ? 4 : 0,
  ];
  return Math.max(2, ...levels);
}

/** The level a claim has overall: the best record, else 3 if a percentage is disclosed, else 2 if an active
    is named, else 1. */
export function evidenceLevelFor(
  claim: { text: string; namesActive: boolean },
  records: EvidenceRecord[],
): number {
  const fromRecords = records.map((r) => levelFromRecord(r, claim.text));
  const best = fromRecords.length ? Math.max(...fromRecords) : 0;
  if (best >= 4) return best;
  const percentDisclosed = /\b\d+(?:\.\d+)?\s*%/.test(claim.text);
  const floor = percentDisclosed ? 3 : claim.namesActive ? 2 : 1;
  return Math.max(best, floor);
}

export type Ambition = "routine" | "cosmetic" | "performance" | "clinical";
export type Residual = "low" | "medium" | "high" | "very-high";

/* Clinical ambition is a claim of OUTCOME proven by a study. "Dermatologist tested" or "clinically tested on 40
   people" states that a test happened, which a finished-product test (level 4) supports; it does not claim a
   proven result, so it is not clinical-tier. */
const CLINICAL_RE = /clinically (?:proven|shown|demonstrated|proved)|clinical (?:study|trial|results?)|proven (?:to|results?)|\b\d+\s*%\s*(?:less|more|reduction|reduced|improvement|increase|of participants)/i;
/** "95% of users felt ...": how people said they felt, a survey figure and not a measured result. It is not held to the clinical bar and never moves the
    pill (owner decision, 2026-10-29); the missing test details are listed as a gap instead (note.user_percentage). "Participants" stay clinical wording, as
    does a figure that also says "clinically proven" or "N% reduction". */
const USER_PERCENT_RE = /\b\d{1,3}(?:\.\d+)?\s*%\s*of\s+(?:the\s+)?(?:users|consumers|customers|people)\b/i;
export const isUserPercentage = (text: string): boolean => USER_PERCENT_RE.test(text) && !CLINICAL_RE.test(text);
/** The verbs of a treatment, and "protects ... against / from" (heat, UV, pollution, damage): a promise of a defence the product has to have shown, so it needs a
    test on the finished product as much as "repairs" does (owner decision, 2026-10-29). "Protects" on its own, with no "against" or "from", is not matched. */
const PERFORMANCE_RE = /\b(fades?|reduces?|repairs?|treats?|clears?|controls?|prevents?|minimi[sz]es?|lightens?|tightens?|strengthens?)\b|\b(?:protects?|shields?|defends?|guards?)\b[^.;]{0,40}\b(?:against|from)\b|\bprotection (?:against|from)\b|dark spots?|acne|pigmentation|wrinkles?|hair fall|dandruff|pores?/i;
const COSMETIC_RE = /\b(glow|radian\w*|smooth\w*|soft\w*|hydrat\w*|brighten\w*|plump\w*|firm\w*|shine|shiny|supple)\b/i;

/** How much proof the wording needs. The strongest tier that matches wins. */
export function ambitionOf(text: string, primaryType: string): Ambition {
  if (CLINICAL_RE.test(text)) return "clinical";
  if (primaryType === "concern" || primaryType === "time-bound" || PERFORMANCE_RE.test(text)) return "performance";
  if (COSMETIC_RE.test(text)) return "cosmetic";
  return "routine";
}

/** Residual risk = ambition minus evidence. A bold claim with matching proof is low. Never "red-flag":
    that label is reserved for the rules (drug-style wording, fairness claims, a contradicted claim). */
export function residualRisk(ambition: Ambition, level: number): Residual {
  switch (ambition) {
    case "routine":
    case "cosmetic":
      return level >= 3 ? "low" : level === 2 ? "medium" : "high";
    case "performance":
      return level >= 4 ? "low" : level === 3 ? "medium" : "high";
    case "clinical":
      return level >= 6 ? "low" : level >= 4 ? "medium" : level === 3 ? "high" : "very-high";
  }
}
