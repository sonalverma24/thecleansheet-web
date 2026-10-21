/* Runtime flags for the neuro-symbolic analyser rollout.

   Every behaviour that changes what a shopper sees has its own flag, OFF by default,
   and ships in its own deploy (see the rollout plan). Flags are read from the server
   environment at call time. Vercel applies an environment change on the next
   deployment, so turning a flag off is "set it false, redeploy the same commit", then
   re-run scripts/backfill-reviews.mts for the verdict flags. Reading a flag in client
   code always yields false, which is the safe default.

   With every flag off, verdicts, the At a glance ticks (both copies of
   buildAtAGlance), the scorecard, JSON-LD, listings and pitch stamps are identical to
   today. That promise is pinned by src/lib/verdict-parity.test.ts. */

export const ANALYSER_FLAGS = {
  /** 5a. At a glance ticks read the claim ontology instead of the substring logic. Needs reviewed aliases first. */
  ontologyTicks: "ANALYSER_ONTOLOGY_TICKS",
  /** 5b. Suppress a disputed tick and show "This claim is being checked." (not built yet) */
  suppressDisputedTicks: "ANALYSER_SUPPRESS_DISPUTED_TICKS",
  /** 5c. A Good Standing review with an unresolved dispute shows Provisional (not built yet) */
  underReviewEndorsement: "ANALYSER_UNDER_REVIEW_ENDORSEMENT",
  /** 5d. Hold NEW reviews on a definitive match or a source conflict (not built yet) */
  holdNewContradictions: "ANALYSER_HOLD_NEW_CONTRADICTIONS",
  /** 5e. A catch-all caps the total at 64, RUBRIC_REV r9 (not built yet) */
  policyCatchallGate: "ANALYSER_POLICY_CATCHALL_GATE",
  /** 5f. Good Standing needs an anchored ingredient list, else Provisional (not built yet) */
  policyAnchorRequired: "ANALYSER_POLICY_ANCHOR_REQUIRED",
  /** 5g. Only confirmed identity serves an existing review (not built yet) */
  strictIdentity: "ANALYSER_STRICT_IDENTITY",
} as const;

export type AnalyserFlagName = (typeof ANALYSER_FLAGS)[keyof typeof ANALYSER_FLAGS];

export function isFlagOn(name: AnalyserFlagName): boolean {
  const v = typeof process !== "undefined" ? process.env?.[name] : undefined;
  return v === "1" || v?.toLowerCase() === "true";
}
