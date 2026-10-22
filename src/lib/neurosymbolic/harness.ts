/** Server-owned evidence checks. Model prose, confidence and scores grant no authority. */
import { createHash } from "node:crypto";
import { verifyModelRead } from "@/lib/capture-evidence";
import type { SourceSnapshot } from "@/lib/inci-reanchor";
import { verifyReview, verifyClaimDisputes } from "@/lib/review-verifier";
import { reviewInciList } from "@/lib/review-inci";
import type { ProductReview } from "@/lib/product-review-types";

export const POLICY_VERSION = "tcs-evidence-v1";
export interface Capture {
  id: string;
  url: string;
  text: string;
  retrievedAt: string;
  /** Set by the retrieval adapter, never copied from model output. */
  identity: "matched" | "unresolved" | "conflicting";
  formula?: SourceSnapshot;
}
export interface ClaimDecision {
  text: string;
  state: "source_stated" | "unsubstantiated" | "disputed";
  /** UTF-16 offsets into the retained capture; source_stated does not mean true. */
  citations: { captureId: string; start: number; end: number; quote: string }[];
  reason: string;
}
export interface Assurance {
  version: typeof POLICY_VERSION;
  inputHash: string;
  evaluatedAt: string;
  mode: "shadow";
  ingredientEvidence: "anchored" | "unverified" | "conflicting";
  claims: ClaimDecision[];
  reasons: string[];
  /** Permission to publish an endorsement, NOT a product safety classification. */
  endorsement: "human_review_required";
  captureDigests: { id: string; sha256: string; url: string; retrievedAt: string }[];
}
export interface HarnessInput {
  review: ProductReview;
  captures: Capture[];
  now: string;
  /** Explicit owner policy; absent policy never treats age as acceptable. */
  maxCaptureAgeMs?: number;
}
const digest = (x: string) => createHash("sha256").update(x).digest("hex");
const httpUrl = (s: string) => {
  try { const u = new URL(s); return ["https:", "http:"].includes(u.protocol) && !u.username && !u.password; }
  catch { return false; }
};

/** Validate the trust boundary before any verifier reads nested model fields. */
export function validateProposal(value: unknown): value is ProductReview {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const r = value as Record<string, unknown>;
  const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
  const strings = (v: unknown) => Array.isArray(v) && v.every(x => typeof x === "string");
  if (r.type !== "product-review" || typeof r.productName !== "string" || !r.productName.trim() ||
      typeof r.brand !== "string" || !r.brand.trim()) return false;
  if (!Array.isArray(r.claimMap) || r.claimMap.length > 200 || !r.claimMap.every(c => object(c) &&
    typeof c.text === "string" && c.text.trim().length > 0 && c.text.length <= 10000 &&
    Array.isArray(c.types) && c.types.every(t => typeof t === "string") &&
    typeof c.evidenceLevel === "number" && Number.isInteger(c.evidenceLevel) && c.evidenceLevel >= 1 && c.evidenceLevel <= 7 &&
    [c.evidenceNote, c.asciNote, c.drugBoundaryNote].every(v => v == null || typeof v === "string"))) return false;
  if (r.inciIngredients !== undefined && (!strings(r.inciIngredients) || (r.inciIngredients as string[]).length > 1000)) return false;
  if (r.ingredientReads !== undefined && (!Array.isArray(r.ingredientReads) || !r.ingredientReads.every(x => object(x) && typeof x.name === "string"))) return false;
  if (!object(r.scores) || !["priceFairness", "claimClarity", "claimEvidence", "ingredientTransparency", "formulaLogic", "consumerSuitability", "platformConsistency", "total"].every(k => typeof r.scores === "object" && Number.isFinite((r.scores as Record<string, unknown>)[k]))) return false;
  for (const key of ["formulaLogic", "ingredientTransparency", "consumerSuitability", "platformParity", "verdict"]) if (!object(r[key])) return false;
  const formula = r.formulaLogic as Record<string, unknown>, verdict = r.verdict as Record<string, unknown>;
  if (![formula.note, formula.claimOverreachNote, verdict.biggestConcern, verdict.bestThing, verdict.cleanSheetTakeaway].every(v => v == null || typeof v === "string")) return false;
  for (const key of ["ingredientTransparency", "platformParity"]) {
    const issues = (r[key] as Record<string, unknown>).issues;
    if (issues !== undefined && !strings(issues)) return false;
  }
  return true;
}

/** Pure replay: all clock and source inputs are explicit. No model or network calls. */
export function evaluateEvidence(input: HarnessInput): Assurance {
  if (!validateProposal(input.review)) throw new Error("INVALID_PROPOSAL");
  const now = Date.parse(input.now);
  if (!Number.isFinite(now)) throw new Error("INVALID_CLOCK");
  const { review, captures } = input;
  if (captures.length > 100 || new Set(captures.map(c => c.id)).size !== captures.length) throw new Error("INVALID_CAPTURES");
  const reasons = new Set<string>();
  const maxAge = input.maxCaptureAgeMs;
  if (maxAge === undefined) reasons.add("FRESHNESS_POLICY_UNSET");
  else if (!Number.isFinite(maxAge) || maxAge <= 0) throw new Error("INVALID_FRESHNESS_POLICY");
  const usable = captures.filter(c => {
    if (!c.id || typeof c.text !== "string" || !httpUrl(c.url)) { reasons.add("INVALID_CAPTURE"); return false; }
    const time = Date.parse(c.retrievedAt);
    if (!Number.isFinite(time) || time > now) { reasons.add("INVALID_CAPTURE_TIME"); return false; }
    if (maxAge === undefined || now - time > maxAge) { reasons.add("CAPTURE_CURRENCY_UNCONFIRMED"); return false; }
    if (c.identity !== "matched") { reasons.add("SOURCE_IDENTITY_UNRESOLVED"); return false; }
    return true;
  });
  // Never inherit an anchor authored by a model or a historical nonempty quote.
  const safeReview = { ...review, inciEvidence: undefined, evidenceAudit: undefined };
  const inci = reviewInciList(safeReview);
  const rejectedFormulaCaptures = new Set<string>();
  const checks = usable.filter(c => c.formula).map(c => {
    const source = c.formula!;
    // The snapshot must belong to the retained capture and its quote must exist there.
    if (source.url !== c.url || !source.quote || !c.text.includes(source.quote)) {
      reasons.add("FORMULA_CAPTURE_MISMATCH"); rejectedFormulaCaptures.add(c.id); return null;
    }
    const verification = verifyModelRead({ brand: review.brand, productName: review.productName, inci }, source);
    if (verification.outcome === "identity_failed") rejectedFormulaCaptures.add(c.id);
    return verification;
  }).filter(c => c !== null);
  let ingredientEvidence: Assurance["ingredientEvidence"] = checks.some(c => c.status === "anchored") ? "anchored" : "unverified";
  if (checks.some(c => c.outcome === "formula_conflict") || captures.some(c => c.identity === "conflicting")) ingredientEvidence = "conflicting";
  if (!inci.length) reasons.add("MISSING_INCI");
  if (ingredientEvidence !== "anchored") reasons.add(ingredientEvidence === "conflicting" ? "SOURCE_CONFLICT" : "INCI_NOT_ANCHORED");
  for (const check of checks) for (const f of check.findings) reasons.add(f.code);
  const findings = verifyReview(safeReview).filter(f => f.code !== "UNANCHORED_EVIDENCE");
  for (const f of findings) if (f.severity !== "info") reasons.add(f.code);
  const disputes = verifyClaimDisputes({ ticks: review.claimMap.map(c => c.text), inci, analysisTexts: [], anchored: ingredientEvidence === "anchored" });
  const claims: ClaimDecision[] = review.claimMap.map(claim => {
    // Full literal span, not two keywords. No inference from the model's cited URL.
    const citations = usable.filter(c => !rejectedFormulaCaptures.has(c.id)).flatMap(c => {
      const start = c.text.indexOf(claim.text);
      return start < 0 ? [] : [{ captureId: c.id, start, end: start + claim.text.length, quote: claim.text }];
    });
    const disputed = disputes.some(d => d.subject === claim.text.toLowerCase().replace(/sulphate/g, "sulfate").replace(/[\s-]+/g, " ").trim());
    if (!citations.length) reasons.add("CLAIM_SOURCE_MISSING");
    if (disputed) reasons.add("CLAIM_DISPUTE");
    return { text: claim.text, state: disputed ? "disputed" : citations.length ? "source_stated" : "unsubstantiated", citations,
      reason: disputed ? "Recorded ingredients raise a review lead; this is not a confirmed product defect." : citations.length ? "Exact wording captured. Claim truth and study applicability remain unverified." : "No exact claim span in an identity matched, current capture." };
  });
  // There is deliberately no route from a model evidenceLevel or score to certification.
  reasons.add("EXPERT_EVIDENCE_ADJUDICATION_REQUIRED");
  const captureDigests = captures.map(c => ({ id: c.id, sha256: digest(c.text), url: c.url, retrievedAt: c.retrievedAt }));
  return { version: POLICY_VERSION, inputHash: digest(JSON.stringify({ review: safeReview, captures, now: input.now, maxAge: maxAge ?? null, policy: POLICY_VERSION })),
    evaluatedAt: input.now, mode: "shadow", ingredientEvidence, claims, reasons: [...reasons].sort(), endorsement: "human_review_required", captureDigests };
}

export interface HarnessHooks {
  /** Must persist the captured inputs and decision together; rejection aborts the run. */
  audit: (record: { input: HarnessInput; decision: Assurance }) => Promise<void>;
  onDecision?: (decision: Assurance) => Promise<void>;
}
/** Hooks receive copies, so observers cannot mutate the decision or retained evidence. */
export async function runEvidenceHarness(input: HarnessInput, hooks: HarnessHooks): Promise<Assurance> {
  const snapshot = structuredClone(input);
  const decision = evaluateEvidence(snapshot);
  await hooks.audit(structuredClone({ input: snapshot, decision }));
  if (hooks.onDecision) await hooks.onDecision(structuredClone(decision));
  return decision;
}
