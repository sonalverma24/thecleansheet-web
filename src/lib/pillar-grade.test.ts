import { describe, expect, it } from "vitest";
import {
  DEFAULT_PARAMS, PILLARS, failsPillar, gradeAll, gradePillar, scoresWell, standingFromPillars, standingFromThresholds,
  type CheckLike, type GradeParams, type PillarGrade,
} from "@/lib/pillar-grade";

const P = "Ingredient Safety & Toxicity";
const chk = (state: CheckLike["state"], over: Partial<CheckLike> = {}): CheckLike => ({
  pillar: P, label: `${state} check`, state, obtainability: "public", ...over,
});
const params = (over: Partial<GradeParams> = {}): GradeParams => ({ ...DEFAULT_PARAMS, ...over });

describe("gradePillar", () => {
  it("scores 100 when every applicable check is verified", () => {
    const g = gradePillar(P, [chk("verified"), chk("verified")]);
    expect(g).toMatchObject({ score: 100, hardFail: false, applicable: 2, deductions: [] });
  });

  it("leaves not-applicable checks out of the pillar entirely", () => {
    const g = gradePillar(P, [chk("verified"), chk("not-applicable"), chk("not-applicable")]);
    expect(g.applicable).toBe(1);
    expect(g.score).toBe(100);
  });

  it("scores 100 when no check applies, because there is nothing to deduct", () => {
    expect(gradePillar(P, [chk("not-applicable")]).score).toBe(100);
    expect(gradePillar(P, []).score).toBe(100);
  });

  it("fails the pillar outright on a hard adverse check, whatever else is true", () => {
    const g = gradePillar(P, [chk("verified"), chk("verified"), chk("adverse", { hard: true })]);
    expect(g).toMatchObject({ score: 0, hardFail: true });
    expect(scoresWell(g, 0)).toBe(false);
  });

  it("deducts for a soft adverse check but does not fail the pillar", () => {
    const g = gradePillar(P, [chk("verified"), chk("verified"), chk("verified"), chk("adverse", { label: "Comedogenicity risk" })]);
    expect(g.hardFail).toBe(false);
    expect(g.score).toBe(75); // 1 of 4 checks fully deducted
    expect(g.deductions).toEqual([{ label: "Comedogenicity risk", why: "soft-adverse", points: 1 }]);
  });

  it("deducts less for a check the brand states than for one nobody discloses", () => {
    const stated = gradePillar(P, [chk("disclosed")]).score;
    const missing = gradePillar(P, [chk("not-disclosed")]).score;
    expect(stated).toBe(80);
    expect(missing).toBe(40);
    expect(stated).toBeGreaterThan(missing);
  });

  it("deducts least where the evidence is essentially never public", () => {
    const pub = gradePillar(P, [chk("not-disclosed", { obtainability: "public" })]).score;
    const brand = gradePillar(P, [chk("not-disclosed", { obtainability: "brand" })]).score;
    const priv = gradePillar(P, [chk("not-disclosed", { obtainability: "private" })]).score;
    expect([pub, brand, priv]).toEqual([40, 65, 85]);
  });

  it("uses the parameters it is given, so a cutoff and each weight can be adjusted", () => {
    const g = gradePillar(P, [chk("adverse"), chk("verified")], params({ deductSoft: 0.5 }));
    expect(g.score).toBe(75);
    expect(gradePillar(P, [chk("not-disclosed")], params({ deductNotDisclosed: { public: 0, brand: 0, private: 0 } })).score).toBe(100);
  });

  it("never goes below 0 or above 100", () => {
    expect(gradePillar(P, [chk("adverse"), chk("adverse")], params({ deductSoft: 5 })).score).toBe(0);
    expect(gradePillar(P, [chk("verified")]).score).toBeLessThanOrEqual(100);
  });

  it("only counts checks of its own pillar", () => {
    const g = gradePillar(P, [chk("verified"), chk("adverse", { pillar: "Ingredient Transparency" })]);
    expect(g.score).toBe(100);
    expect(g.applicable).toBe(1);
  });
});

describe("gradeAll and scoresWell", () => {
  it("grades the four pillars in order", () => {
    const grades = gradeAll([chk("verified"), chk("not-disclosed", { pillar: "Standards & Compliance", obtainability: "brand" })]);
    expect(grades.map((g) => g.pillar)).toEqual([...PILLARS]);
    expect(grades[3].score).toBe(65);
  });

  it("treats the cutoff as inclusive and moves with it", () => {
    const g = gradePillar(P, [chk("verified"), chk("verified"), chk("verified"), chk("adverse")]); // 75
    expect(scoresWell(g, 75)).toBe(true);
    expect(scoresWell(g, 76)).toBe(false);
    expect(scoresWell(g, 60)).toBe(true);
    expect(scoresWell(g, 80)).toBe(false);
  });
});

describe("standingFromPillars", () => {
  const none = { isDrug: false, hardOverride: false, boundaryOnly: false };
  it("maps the count of well-scoring pillars to a standing", () => {
    expect(standingFromPillars(4, none)).toBe("Good Standing");
    expect(standingFromPillars(3, none)).toBe("Room to Improve");
    expect(standingFromPillars(2, none)).toBe("Not Recommended");
    expect(standingFromPillars(1, none)).toBe("Not Recommended");
    expect(standingFromPillars(0, none)).toBe("Not Recommended");
  });
  it("keeps the overrides the standard already has", () => {
    expect(standingFromPillars(4, { ...none, hardOverride: true })).toBe("Not Recommended");
    expect(standingFromPillars(4, { ...none, isDrug: true })).toBe("Licensed Drug");
    expect(standingFromPillars(0, { ...none, isDrug: true, hardOverride: true })).toBe("Licensed Drug");
    expect(standingFromPillars(4, { ...none, boundaryOnly: true })).toBe("Room to Improve");
    expect(standingFromPillars(2, { ...none, boundaryOnly: true })).toBe("Not Recommended");
  });
});

describe("two thresholds: well and floor", () => {
  const g = (score: number, hardFail = false): PillarGrade => ({ pillar: "p", score: hardFail ? 0 : score, hardFail, applicable: 5, deductions: [] });
  const none = { isDrug: false, hardOverride: false, boundaryOnly: false };
  const T = { well: 75, floor: 50 };

  it("failsPillar is true below the floor or on a hard failure, and false at the floor", () => {
    expect(failsPillar(g(49), 50)).toBe(true);
    expect(failsPillar(g(50), 50)).toBe(false);
    expect(failsPillar(g(90, true), 50)).toBe(true);
  });

  it("is Good Standing only when all four pillars score well", () => {
    expect(standingFromThresholds([g(75), g(80), g(90), g(100)], T, none)).toBe("Good Standing");
    expect(standingFromThresholds([g(74), g(80), g(90), g(100)], T, none)).toBe("Room to Improve");
  });

  it("leaves a middling pillar in the middle zone instead of calling it failing", () => {
    // 60 is below the well cutoff but above the floor: neither well nor failing
    expect(standingFromThresholds([g(60), g(60), g(60), g(60)], T, none)).toBe("Room to Improve");
  });

  it("one failing pillar is still Room to Improve; two failing is Not Recommended", () => {
    expect(standingFromThresholds([g(40), g(80), g(80), g(80)], T, none)).toBe("Room to Improve");
    expect(standingFromThresholds([g(40), g(30), g(80), g(80)], T, none)).toBe("Not Recommended");
    expect(standingFromThresholds([g(40), g(30), g(10), g(0)], T, none)).toBe("Not Recommended");
  });

  it("a hard-failed pillar counts as failing", () => {
    expect(standingFromThresholds([g(90, true), g(80), g(80), g(80)], T, none)).toBe("Room to Improve");
    expect(standingFromThresholds([g(90, true), g(40), g(80), g(80)], T, none)).toBe("Not Recommended");
  });

  it("keeps the standard's overrides", () => {
    expect(standingFromThresholds([g(90), g(90), g(90), g(90)], T, { ...none, hardOverride: true })).toBe("Not Recommended");
    expect(standingFromThresholds([g(0), g(0), g(0), g(0)], T, { ...none, isDrug: true })).toBe("Licensed Drug");
    expect(standingFromThresholds([g(90), g(90), g(90), g(90)], T, { ...none, boundaryOnly: true })).toBe("Room to Improve");
  });

  it("raising the floor names more products Not Recommended, never fewer", () => {
    const grades = [g(55), g(55), g(80), g(80)];
    expect(standingFromThresholds(grades, { well: 75, floor: 50 }, none)).toBe("Room to Improve");
    expect(standingFromThresholds(grades, { well: 75, floor: 60 }, none)).toBe("Not Recommended");
  });

  it("refuses a floor above the well cutoff", () => {
    expect(() => standingFromThresholds([g(80)], { well: 60, floor: 70 }, none)).toThrow(/cannot be above/);
  });
});
