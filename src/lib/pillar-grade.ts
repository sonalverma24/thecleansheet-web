/* Graded score for each of the four audit pillars, and the standing they would give.

   PREVIEW LOGIC. Nothing here is wired into deriveVerdict or any page. It exists so a rule such as
   "4 of 4 pillars scoring well is Good Standing, 3 of 4 is Room to Improve, 2 or fewer is Not
   Recommended" can be measured on real reviews before anyone decides to adopt it.

   A pillar's score is out of 100 and comes from the pillar's own checks (the states runAnalysis already
   produces). Each applicable check carries a weight of 1 and a deduction:
     - a HARD adverse check (a banned ingredient, a contradiction) fails the pillar outright (score 0);
     - a soft adverse check (legal but flagged: an endocrine-active screen, comedogenicity, a pregnancy
       caution) deducts `deductSoft`;
     - a "disclosed" check (the brand states it, not independently confirmed) deducts `deductDisclosed`;
     - a "not-disclosed" check deducts by how obtainable the evidence is: a check we could decide from
       public data costs most, one only the brand can publish less, one that is essentially never public least;
     - a verified check deducts nothing; a not-applicable check is left out of the pillar entirely.
   score = round(100 * (1 - total deductions / applicable checks)).

   "Scoring well" is `score >= cutoff` and no hard failure. The cutoff is a parameter, never a constant. */

import type { CheckResult } from "@/lib/analysis-types";

export const PILLARS = [
  "Ingredient Safety & Toxicity",
  "Irritation & Allergen Risk",
  "Ingredient Transparency",
  "Standards & Compliance",
] as const;
export type Pillar = (typeof PILLARS)[number];

export type CheckLike = Pick<CheckResult, "pillar" | "label" | "state" | "obtainability" | "hard">;

export interface GradeParams {
  deductSoft: number;
  deductDisclosed: number;
  deductNotDisclosed: { public: number; brand: number; private: number };
}

/** Starting values. They are judgement calls, so the preview exposes each one for adjustment. */
export const DEFAULT_PARAMS: GradeParams = {
  deductSoft: 1,
  deductDisclosed: 0.2,
  deductNotDisclosed: { public: 0.6, brand: 0.35, private: 0.15 },
};

export interface Deduction { label: string; why: "soft-adverse" | "disclosed" | "not-disclosed"; points: number }

export interface PillarGrade {
  pillar: string;
  /** 0 to 100. 100 when no check applies (there is nothing to deduct). */
  score: number;
  hardFail: boolean;
  applicable: number;
  deductions: Deduction[];
}

export function gradePillar(pillar: string, checks: CheckLike[], params: GradeParams = DEFAULT_PARAMS): PillarGrade {
  const mine = checks.filter((c) => c.pillar === pillar && c.state !== "not-applicable");
  const deductions: Deduction[] = [];
  let hardFail = false;
  for (const c of mine) {
    if (c.state === "adverse") {
      if (c.hard) hardFail = true;
      else deductions.push({ label: c.label, why: "soft-adverse", points: params.deductSoft });
    } else if (c.state === "disclosed") {
      if (params.deductDisclosed > 0) deductions.push({ label: c.label, why: "disclosed", points: params.deductDisclosed });
    } else if (c.state === "not-disclosed") {
      const pts = params.deductNotDisclosed[c.obtainability];
      if (pts > 0) deductions.push({ label: c.label, why: "not-disclosed", points: pts });
    }
  }
  const total = deductions.reduce((s, d) => s + d.points, 0);
  const score = mine.length === 0 ? 100 : Math.max(0, Math.min(100, Math.round(100 * (1 - total / mine.length))));
  return { pillar, score: hardFail ? 0 : score, hardFail, applicable: mine.length, deductions };
}

export function gradeAll(checks: CheckLike[], params: GradeParams = DEFAULT_PARAMS): PillarGrade[] {
  return PILLARS.map((p) => gradePillar(p, checks, params));
}

/** A pillar scores well when it has no hard failure and reaches the cutoff (a percentage, 0 to 100). */
export const scoresWell = (g: PillarGrade, cutoff: number): boolean => !g.hardFail && g.score >= cutoff;

export type Standing = "Good Standing" | "Room to Improve" | "Not Recommended" | "Licensed Drug";

/** The standing a count of well-scoring pillars would give, with the overrides the standard already has.
    - a licensed drug stays a licensed drug;
    - a hard flag (banned ingredient, contradicted claim, fairness claim) stays Not Recommended;
    - a drug-boundary wording flag still caps at Room to Improve. */
export function standingFromPillars(
  wellScoring: number,
  o: { isDrug: boolean; hardOverride: boolean; boundaryOnly: boolean },
): Standing {
  if (o.isDrug) return "Licensed Drug";
  if (o.hardOverride) return "Not Recommended";
  if (wellScoring >= 4) return o.boundaryOnly ? "Room to Improve" : "Good Standing";
  if (wellScoring === 3) return "Room to Improve";
  return "Not Recommended";
}

/* ─── Two thresholds: "scores well" and "fails" ───
   One cutoff makes every pillar either good or bad, so a middling pillar (most are) is named like a
   failing one. Two thresholds leave a middle zone:
     - a pillar scores WELL at or above `well` (and has no hard failure);
     - a pillar FAILS only below `floor`, or on a hard failure;
     - in between it is neither.
   4 of 4 well is Good Standing; 2 or more failing pillars is Not Recommended; anything else is Room to
   Improve. The standard's existing overrides still apply (see standingFromPillars). */

export interface Thresholds { well: number; floor: number }

/** A pillar fails when it has a hard failure or scores below the floor. */
export const failsPillar = (g: PillarGrade, floor: number): boolean => g.hardFail || g.score < floor;

/** The guarded version used for the live rule: a pillar below the floor counts as failing only if it also
    has at least one adverse finding (hard, or a soft adverse deduction). A pillar that is low purely
    because evidence was not disclosed is not failing: missing proof is never a negative standing. */
export const failsWithAdverse = (g: PillarGrade, floor: number): boolean =>
  g.hardFail || (g.score < floor && g.deductions.some((d) => d.why === "soft-adverse"));

export function standingFromThresholds(
  grades: PillarGrade[],
  t: Thresholds,
  o: { isDrug: boolean; hardOverride: boolean; boundaryOnly: boolean },
  opts: { requireAdverse?: boolean } = {},
): Standing {
  if (t.floor > t.well) throw new Error(`the failing floor (${t.floor}) cannot be above the well cutoff (${t.well})`);
  if (o.isDrug) return "Licensed Drug";
  if (o.hardOverride) return "Not Recommended";
  const fails = opts.requireAdverse ? failsWithAdverse : failsPillar;
  if (grades.filter((g) => fails(g, t.floor)).length >= 2) return "Not Recommended";
  if (grades.every((g) => scoresWell(g, t.well))) return o.boundaryOnly ? "Room to Improve" : "Good Standing";
  return "Room to Improve";
}
