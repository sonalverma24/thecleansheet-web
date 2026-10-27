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
  /** Standing from the four pillars (well 70, floor 50) instead of the 7-section total; stamps rows r9. See STAMPS.md. */
  pillarStanding: "ANALYSER_PILLAR_STANDING",
  /** Version X1's pills page: the five buying decisions (Good choice, Buy with caution, Look elsewhere, Not enough info, Medicinal product)
      replace the four standings, and the stored-review product page uses the 13-block layout (src/lib/pills-page.ts). The decision is
      computed at render time from the stored review; nothing is written. Static catalogue pages have no review and are unchanged. */
  pillsPage: "ANALYSER_PILLS_PAGE",
  /** The new product page layout (the 13-block design) for a stored review, with TODAY'S standing in the take card and no confidence. Nothing about
      what the page decides changes: the standing, the search title and description, the star rating and what is indexed are today's. The pills page
      above implies this layout and also changes the decision. Static catalogue pages have no stored review and are unchanged. */
  newLayout: "ANALYSER_NEW_LAYOUT",
  /** Ingredient alias table (src/data/ingredient-aliases.ts): a label name that is another name for a row we already hold ("Water" for Aqua)
      resolves to that row instead of "not in our reference database". Applies only to entries the owner has signed off, so with this on and
      nothing signed off, nothing changes. Adds no ingredient and no regulatory fact. */
  ingredientAliases: "ANALYSER_INGREDIENT_ALIASES",
} as const;

export type AnalyserFlagName = (typeof ANALYSER_FLAGS)[keyof typeof ANALYSER_FLAGS];

export function isFlagOn(name: AnalyserFlagName): boolean {
  const v = typeof process !== "undefined" ? process.env?.[name] : undefined;
  return v === "1" || v?.toLowerCase() === "true";
}
