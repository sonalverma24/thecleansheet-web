/* What a fresh capture does to a review's evidence status.

   Two kinds of caller, one comparison. A model-proposed ingredient list is a proposal,
   anchored only when a deterministic re-extraction from its own cited source matches it
   EXACTLY (same identity, ordered sequence identical, duplicates counted). A later capture
   of a source is evaluated against the record, never allowed to stand in for it.

   No similarity threshold approves anything here: the comparison is decideReanchor's.

   State rules:
     matches           the capture is identical in identity and ordered formula.
                       Anchors an unverified record. Never clears a recorded conflict.
     formula_conflict  identity holds (brand, name, variant, title) but the formula
                       differs, for example a classic and a reformulated Cetaphil. The record
                       becomes `conflicting`, its existing anchor is RETAINED, and the diff is
                       queued. It establishes a conflict, not which source is right.
     identity_failed   the capture is not provably the same product or variant. The status
                       does not change; it is queued.
     unusable          no list, an uncomparable entry, or only a quote problem. The status
                       does not change; it is queued.
   Only a person, or a source confirmed as the current formula, resolves `conflicting`. */

import { describeDiff, decideReanchor, type Decision, type SourceSnapshot, type StoredIdentity } from "@/lib/inci-reanchor";
import type { Finding } from "@/lib/review-verifier";

export type EvidenceStatus = "anchored" | "unverified" | "conflicting";
export type CaptureOutcome = "matches" | "formula_conflict" | "identity_failed" | "unusable";

const IDENTITY_CODES = new Set(["BRAND", "NAME", "VARIANT", "NO_TITLE"]);
const UNUSABLE_CODES = new Set(["NO_STORED_LIST", "NO_SOURCE_LIST"]);

export function classifyCapture(d: Decision): CaptureOutcome {
  const codes = new Set(d.failures.map((f) => f.code));
  if (!codes.size) return "matches";
  if ([...codes].some((c) => UNUSABLE_CODES.has(c)) || d.diff.kind === "unkeyed") return "unusable";
  if ([...codes].some((c) => IDENTITY_CODES.has(c))) return "identity_failed";
  if (codes.has("LIST")) return "formula_conflict";
  return "unusable"; // only the quote failed: the text cannot be shown to hold the list
}

export function nextEvidenceStatus(current: EvidenceStatus, outcome: CaptureOutcome): EvidenceStatus {
  if (outcome === "matches") return current === "conflicting" ? "conflicting" : "anchored";
  if (outcome === "formula_conflict") return "conflicting";
  return current;
}

/** Copy for the states. The Provisional wording is the owner's approved text. */
export const EVIDENCE_COPY = {
  unverified: "Ingredient source not yet verified.",
  conflicting: "Conflicting ingredient sources - assessment under review",
} as const;

export const provisionalCopy = (calculatedStanding: string): string =>
  `Provisional assessment. Based on the ingredient list currently recorded, the calculated standing is ${calculatedStanding}. ${EVIDENCE_COPY.unverified}`;

/** The leads a capture raises, with the diff attached. `proposer` decides the wording:
    a model read is a proposal that did not verify, a source is a second capture that disagrees. */
export function captureFindings(d: Decision, outcome: CaptureOutcome, proposer: "model" | "source"): Finding[] {
  if (outcome === "matches") return [];
  if (outcome === "formula_conflict") {
    return [proposer === "model"
      ? { code: "MODEL_READ_MISMATCH", severity: "review_required", message: `the model's read differs from a deterministic read of its own cited source (${describeDiff(d.diff)}); the read stays unverified` }
      : { code: "SOURCE_CONFLICT", severity: "review_required", message: `two captured sources disagree on the formula of the same product (${describeDiff(d.diff)}). This establishes a conflict, not which source is right` }];
  }
  const detail = d.failures.map((f) => `${f.code}: ${f.detail}`).join("; ");
  return [outcome === "identity_failed"
    ? { code: "ANCHOR_IDENTITY_MISMATCH", severity: "review_required", message: `the capture is not provably the same product or variant, so it was not used (${detail})` }
    : { code: "UNANCHORED_EVIDENCE", severity: "review_required", message: `the capture could not be compared exactly (${detail})` }];
}

export interface ModelReadVerification {
  /** `anchored` only on an exact match. A model read is never `conflicting`: it is a proposal. */
  status: Exclude<EvidenceStatus, "conflicting">;
  outcome: CaptureOutcome;
  decision: Decision;
  findings: Finding[];
}

/** Verify a model-proposed list against a deterministic read of the source it cited. */
export function verifyModelRead(model: StoredIdentity, source: SourceSnapshot): ModelReadVerification {
  const decision = decideReanchor(model, source);
  const outcome = classifyCapture(decision);
  return { status: outcome === "matches" ? "anchored" : "unverified", outcome, decision, findings: captureFindings(decision, outcome, "model") };
}

export interface CaptureApplication {
  status: EvidenceStatus;
  outcome: CaptureOutcome;
  decision: Decision;
  /** True when a person has to look: anything other than an exact match. */
  queue: boolean;
  findings: Finding[];
}

/** Evaluate a captured source against the record and return the record's next status. */
export function applyCapture(current: EvidenceStatus, record: StoredIdentity, source: SourceSnapshot): CaptureApplication {
  const decision = decideReanchor(record, source);
  const outcome = classifyCapture(decision);
  return { status: nextEvidenceStatus(current, outcome), outcome, decision, queue: outcome !== "matches", findings: captureFindings(decision, outcome, "source") };
}
