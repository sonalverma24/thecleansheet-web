/* The standing a review earns from its four pillars. Used by deriveVerdict ONLY when the pillar standing
   flag (ANALYSER_PILLAR_STANDING) is on; with it off nothing here runs.

   Rule (STAMPS.md): each pillar gets a graded score out of 100 (src/lib/pillar-grade.ts). It scores WELL at
   or above `well` (70), and FAILS only below `floor` (50) with an adverse finding, or on a hard failure.
     4 of 4 well            -> Good Standing
     2 or more failing      -> Not Recommended
     anything else          -> Room to Improve
   Overrides that already existed stay: a licensed drug, a hard flag (banned ingredient, contradicted claim,
   fairness claim) and the drug-boundary cap are decided by deriveVerdict and passed in.
   Two guards keep the standard's principle that missing proof is never a negative standing:
     - a pillar that is low only because evidence was not disclosed does not count as failing;
     - a review with no ingredient list is never Good Standing and never Not Recommended on that account.

   Pure: no network, no database. The caller supplies what deriveVerdict already worked out. */

import type { ProductReview, PillarOutcome } from "@/lib/product-review-types";
import { runAnalysis } from "@/lib/analysis-engine";
import { findCatchAllIngredients } from "@/lib/inci-catchall";
import { complianceChecks, COMPLIANCE_PILLAR } from "@/lib/compliance-pillar";
import { globalScreenFor } from "@/lib/global-screen";
import {
  DEFAULT_PARAMS, failsWithAdverse, gradeAll, scoresWell, standingFromThresholds,
  type CheckLike, type GradeParams, type PillarGrade, type Standing,
} from "@/lib/pillar-grade";

/** The thresholds and weights in force. One place to change them; any change needs a fresh preview. */
export const PILLAR_STANDING_CONFIG: { well: number; floor: number; params: GradeParams } = {
  well: 70,
  floor: 50,
  params: DEFAULT_PARAMS,
};

export interface PillarStandingInput {
  review: ProductReview;
  /** The ingredient list the review is graded against (reviewInciList). */
  inci: string[];
  bannedCount: number;
  /** "hard": a contradicted or fairness claim. "boundary": drug-cosmetic boundary wording only. */
  claimsOutcome: "none" | "boundary" | "hard";
  /** A hard flag already decided: banned ingredient, contradicted claim or fairness claim. */
  hardOverride: boolean;
  /** Drug-boundary wording only: caps the standing at Room to Improve. */
  boundaryOnly: boolean;
}

export interface PillarStandingResult {
  standing: Standing;
  pillars: PillarOutcome[];
  /** One plain sentence when the standing is Not Recommended because of the pillars (not a hard flag). */
  reason: string | null;
}

/** The checks of the four pillars: runAnalysis for three, the four named items for Standards & Compliance,
    plus one soft deduction in Transparency when the list carries unnamed catch-alls ("Soap Base", a bare
    "QS"). That check is added only when there is a catch-all, so a review without one scores exactly as it
    would without this line. */
export function pillarChecks(i: PillarStandingInput): CheckLike[] {
  const r = i.review;
  const claims = (r.claimMap ?? []) as { asciConcern?: boolean; corroborated?: boolean }[];
  const compliance = complianceChecks({
    usageWarningsClear: !!r.ingredientTransparency?.usageWarningsClear,
    hasInci: i.inci.length > 0,
    bannedCount: i.bannedCount,
    globalScreen: (globalScreenFor(r, i.inci) as Record<string, string | undefined> | undefined) ?? null,
    asciConcernClaims: claims.filter((c) => c.corroborated !== false && c.asciConcern).length,
    claimsAnalysed: claims.length,
    claimsOutcome: i.claimsOutcome,
  });
  const rest = runAnalysis(r).checks.filter((c) => c.pillar !== COMPLIANCE_PILLAR);
  const catchAll = findCatchAllIngredients(i.inci);
  const extra: CheckLike[] = catchAll.length
    ? [{ pillar: "Ingredient Transparency", label: "Unnamed catch-all entries", state: "adverse", obtainability: "public" }]
    : [];
  return [...rest, ...compliance, ...extra];
}

export function outcomesFrom(grades: PillarGrade[], well: number, floor: number): PillarOutcome[] {
  return grades.map((g) => ({
    pillar: g.pillar,
    score: g.score,
    hardFail: g.hardFail,
    status: scoresWell(g, well) ? "well" : failsWithAdverse(g, floor) ? "failing" : "middle",
  }));
}

export function pillarStanding(i: PillarStandingInput): PillarStandingResult {
  const { well, floor, params } = PILLAR_STANDING_CONFIG;
  const grades = gradeAll(pillarChecks(i), params);
  const pillars = outcomesFrom(grades, well, floor);

  let standing = standingFromThresholds(
    grades, { well, floor },
    { isDrug: false, hardOverride: i.hardOverride, boundaryOnly: i.boundaryOnly },
    { requireAdverse: true },
  );

  // Guard: no ingredient list means the safety screen could not run. Never Good Standing, and never Not
  // Recommended on missing data: at most Room to Improve, unless a hard flag already decided it.
  if (i.inci.length === 0 && !i.hardOverride) standing = "Room to Improve";

  const failing = pillars.filter((p) => p.status === "failing");
  const reason = standing === "Not Recommended" && !i.hardOverride && failing.length
    ? `Two or more areas of the review fall short: ${failing.map((p) => p.pillar).join(" and ")}.`
    : null;
  return { standing, pillars, reason };
}
