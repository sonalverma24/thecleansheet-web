import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CheckLike } from "@/lib/pillar-grade";

/* The pillar checks are controlled here so each rule is tested on its own. The real analysis engine and the
   real compliance items are exercised end to end in verdict-pillar.test.ts. */
const control = vi.hoisted(() => ({ analysis: [] as unknown[], compliance: [] as unknown[] }));
vi.mock("@/lib/analysis-engine", () => ({ runAnalysis: () => ({ checks: control.analysis }) }));
vi.mock("@/lib/compliance-pillar", async (orig) => ({
  ...(await orig<typeof import("@/lib/compliance-pillar")>()),
  complianceChecks: () => control.compliance,
}));

import { PILLAR_STANDING_CONFIG, outcomesFrom, pillarChecks, pillarStanding, type PillarStandingInput } from "@/lib/pillar-standing";
import { gradeAll } from "@/lib/pillar-grade";
import { makeReview } from "@/lib/review.fixtures";

const SAFETY = "Ingredient Safety & Toxicity" as const;
const IRRITATION = "Irritation & Allergen Risk" as const;
const TRANSPARENCY = "Ingredient Transparency" as const;
const COMPLIANCE = "Standards & Compliance" as const;
type P = CheckLike["pillar"];
const ck = (pillar: P, state: CheckLike["state"], over: Partial<CheckLike> = {}): CheckLike => ({
  pillar, label: `${pillar} ${state}`, state, obtainability: "public", ...over,
});
/** Four checks per pillar, all verified: every pillar scores 100. */
const clean = (): CheckLike[] => ([SAFETY, IRRITATION, TRANSPARENCY, COMPLIANCE] as P[]).flatMap((p) => [ck(p, "verified"), ck(p, "verified"), ck(p, "verified"), ck(p, "verified")]);
const set = (checks: CheckLike[]) => {
  control.analysis = checks.filter((c) => c.pillar !== COMPLIANCE);
  control.compliance = checks.filter((c) => c.pillar === COMPLIANCE);
};

const INCI = ["Aqua", "Glycerin", "Niacinamide", "Carbomer"];
const input = (over: Partial<PillarStandingInput> = {}): PillarStandingInput => ({
  review: makeReview(), inci: INCI, bannedCount: 0, claimsOutcome: "none", hardOverride: false, boundaryOnly: false, ...over,
});
/** Replace the four checks of one pillar so it scores `score` of 100 with soft adverse findings. */
const pillarAt = (pillar: P, soft: number, of = 4): CheckLike[] => [
  ...Array.from({ length: soft }, () => ck(pillar, "adverse")),
  ...Array.from({ length: of - soft }, () => ck(pillar, "verified")),
];
const others = (...skip: P[]) => ([SAFETY, IRRITATION, TRANSPARENCY, COMPLIANCE] as P[]).filter((p) => !skip.includes(p)).flatMap((p) => pillarAt(p, 0));

beforeEach(() => set(clean()));

describe("pillarStanding", () => {
  it("is Good Standing when all four pillars score well", () => {
    const r = pillarStanding(input());
    expect(r.standing).toBe("Good Standing");
    expect(r.pillars.map((p) => p.status)).toEqual(["well", "well", "well", "well"]);
    expect(r.reason).toBeNull();
  });

  it("uses the configured thresholds: well 70, floor 50", () => {
    expect(PILLAR_STANDING_CONFIG.well).toBe(70);
    expect(PILLAR_STANDING_CONFIG.floor).toBe(50);
  });

  it("one pillar short of well, but not failing, is Room to Improve", () => {
    set([...pillarAt(SAFETY, 1), ...others(SAFETY)]); // 75: well
    expect(pillarStanding(input()).standing).toBe("Good Standing");
    set([...pillarAt(SAFETY, 2), ...others(SAFETY)]); // 50: neither well nor below the floor
    const r = pillarStanding(input());
    expect(r.standing).toBe("Room to Improve");
    expect(r.pillars[0]).toMatchObject({ score: 50, status: "middle" });
  });

  it("two failing pillars is Not Recommended, with a plain reason naming them", () => {
    set([...pillarAt(SAFETY, 3), ...pillarAt(IRRITATION, 3), ...others(SAFETY, IRRITATION)]); // 25 and 25
    const r = pillarStanding(input());
    expect(r.standing).toBe("Not Recommended");
    expect(r.pillars.filter((p) => p.status === "failing").map((p) => p.pillar)).toEqual([SAFETY, IRRITATION]);
    expect(r.reason).toBe(`Two or more areas of the review fall short: ${SAFETY} and ${IRRITATION}.`);
  });

  it("one failing pillar alone is Room to Improve", () => {
    set([...pillarAt(SAFETY, 3), ...others(SAFETY)]);
    expect(pillarStanding(input()).standing).toBe("Room to Improve");
  });

  describe("guard: a pillar low only for missing disclosure is not failing", () => {
    const notDisclosed = (pillar: P) => Array.from({ length: 4 }, () => ck(pillar, "not-disclosed"));
    it("two pillars that score 40 on non-disclosure alone do not make Not Recommended", () => {
      set([...notDisclosed(SAFETY), ...notDisclosed(IRRITATION), ...others(SAFETY, IRRITATION)]);
      const r = pillarStanding(input());
      expect(r.pillars[0]).toMatchObject({ score: 40, status: "middle" });
      expect(r.pillars[1]).toMatchObject({ score: 40, status: "middle" });
      expect(r.standing).toBe("Room to Improve");
    });
    it("the same low scores WITH an adverse finding do count as failing", () => {
      const withAdverse = (pillar: P) => [ck(pillar, "adverse"), ck(pillar, "not-disclosed"), ck(pillar, "not-disclosed"), ck(pillar, "verified")];
      set([...withAdverse(SAFETY), ...withAdverse(IRRITATION), ...others(SAFETY, IRRITATION)]); // (1 + .6 + .6) / 4 = 55 deducted: 45
      expect(pillarStanding(input()).standing).toBe("Not Recommended");
    });
  });

  describe("guard: no ingredient list", () => {
    it("is never Good Standing, even when every pillar scores well", () => {
      expect(pillarStanding(input({ inci: [] })).standing).toBe("Room to Improve");
    });
    it("is never Not Recommended on missing data, even with two failing pillars", () => {
      set([...pillarAt(SAFETY, 3), ...pillarAt(IRRITATION, 3), ...others(SAFETY, IRRITATION)]);
      expect(pillarStanding(input({ inci: [] })).standing).toBe("Room to Improve");
    });
    it("still defers to a hard flag", () => {
      expect(pillarStanding(input({ inci: [], hardOverride: true })).standing).toBe("Not Recommended");
    });
  });

  describe("overrides decided by deriveVerdict", () => {
    it("a hard flag is Not Recommended whatever the pillars say, and carries no pillar reason", () => {
      const r = pillarStanding(input({ hardOverride: true }));
      expect(r.standing).toBe("Not Recommended");
      expect(r.reason).toBeNull();
    });
    it("a hard flag together with failing pillars still carries no pillar reason: the hard flag is the reason", () => {
      set([...pillarAt(SAFETY, 3), ...pillarAt(IRRITATION, 3), ...others(SAFETY, IRRITATION)]);
      const r = pillarStanding(input({ hardOverride: true }));
      expect(r.pillars.filter((p) => p.status === "failing")).toHaveLength(2);
      expect(r.standing).toBe("Not Recommended");
      expect(r.reason).toBeNull();
    });
    it("drug-boundary wording caps a clean review at Room to Improve", () => {
      expect(pillarStanding(input({ boundaryOnly: true })).standing).toBe("Room to Improve");
    });
    it("a hard-failed pillar counts as failing", () => {
      set([ck(SAFETY, "adverse", { hard: true }), ...pillarAt(SAFETY, 0, 3), ...pillarAt(IRRITATION, 3), ...others(SAFETY, IRRITATION)]);
      const r = pillarStanding(input());
      expect(r.pillars[0]).toMatchObject({ score: 0, status: "failing", hardFail: true });
      expect(r.standing).toBe("Not Recommended");
    });
  });
});

describe("pillarChecks: catch-all entries", () => {
  const transparency = (i: PillarStandingInput) => pillarChecks(i).filter((c) => c.pillar === TRANSPARENCY);

  it("adds one soft adverse check to Ingredient Transparency when the list has an unnamed catch-all", () => {
    const without = transparency(input());
    const withBase = transparency(input({ inci: [...INCI, "Soap Base"] }));
    expect(withBase).toHaveLength(without.length + 1);
    expect(withBase.at(-1)).toMatchObject({ label: "Unnamed catch-all entries", state: "adverse" });
    expect(withBase.at(-1)?.hard).toBeUndefined();
  });

  it("adds nothing when the list names everything, so a clean review scores exactly as it would without the rule", () => {
    expect(transparency(input()).map((c) => c.label)).not.toContain("Unnamed catch-all entries");
  });

  it("does not treat a named ingredient with a quantity of q.s. as a catch-all", () => {
    expect(transparency(input({ inci: [...INCI, "Sodium Benzoate - Q.S."] })).map((c) => c.label)).not.toContain("Unnamed catch-all entries");
  });

  it("a catch-all pulls an otherwise 74-scoring Transparency pillar below the well cutoff", () => {
    const base = [ck(TRANSPARENCY, "verified"), ck(TRANSPARENCY, "verified"), ck(TRANSPARENCY, "not-disclosed"), ck(TRANSPARENCY, "disclosed")];
    set([...others(TRANSPARENCY), ...base]);
    const a = pillarStanding(input());
    const b = pillarStanding(input({ inci: [...INCI, "Soap Base"] }));
    expect(a.pillars[2].score).toBeGreaterThanOrEqual(70);
    expect(b.pillars[2].score).toBeLessThan(a.pillars[2].score);
  });
});

describe("outcomesFrom", () => {
  it("labels a pillar well, middle or failing against the two thresholds", () => {
    const grades = gradeAll([...pillarAt(SAFETY, 0), ...pillarAt(IRRITATION, 2), ...pillarAt(TRANSPARENCY, 3), ...pillarAt(COMPLIANCE, 4)]);
    expect(outcomesFrom(grades, 70, 50).map((p) => p.status)).toEqual(["well", "middle", "failing", "failing"]);
  });
});
