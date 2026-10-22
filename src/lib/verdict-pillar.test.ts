import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ACCEPTED_RUBRIC_REVS, PILLAR_RUBRIC_REV, RUBRIC_REV, activeRubricRev, deriveVerdict, isAcceptedRubricRev,
} from "@/lib/product-review-engine";
import { ANALYSER_FLAGS } from "@/lib/analyser-flags";
import { buildStanding, type StandingTarget } from "@/lib/review.fixtures";

/* The pillar standing end to end, through the real engine and the real analysis checks, with the flag off
   and on. verdict-parity.test.ts separately pins the flag-off output to the recorded snapshot. */

const FLAG = ANALYSER_FLAGS.pillarStanding;
afterEach(() => vi.unstubAllEnvs());

const TARGETS: StandingTarget[] = ["approved", "mostly-clean", "can-do-better", "not-recommended", "not-assessed"];
const MATRIX = TARGETS.flatMap((target) =>
  [false, true].flatMap((catchAll) => [false, true].map((noList) => ({ target, catchAll, noList }))),
);
const verdictOf = (m: (typeof MATRIX)[number]) => deriveVerdict(buildStanding(m.target, { catchAll: m.catchAll, noList: m.noList }));
const label = (m: (typeof MATRIX)[number]) => `${m.target} catchAll=${m.catchAll} list=${m.noList ? "absent" : "present"}`;

describe("flag off", () => {
  it.each(["", "0", "false", "off", "no"])("flag value %j leaves every verdict exactly as without the flag", (value) => {
    const baseline = MATRIX.map((m) => verdictOf(m));
    vi.stubEnv(FLAG, value);
    expect(MATRIX.map((m) => verdictOf(m))).toEqual(baseline);
  });

  it("adds no pillars and keeps the original standard string", () => {
    for (const m of MATRIX) {
      const v = verdictOf(m);
      expect(v.pillars).toBeUndefined();
      expect(v.standard).toMatch(/safety · claims · evidence · formula$/);
    }
  });
});

describe("flag on", () => {
  const on = () => vi.stubEnv(FLAG, "1");

  it("adds the four pillar results to every verdict", () => {
    on();
    for (const m of MATRIX) {
      const v = verdictOf(m);
      expect(v.pillars, label(m)).toHaveLength(4);
      for (const p of v.pillars!) {
        expect(p.score).toBeGreaterThanOrEqual(0);
        expect(p.score).toBeLessThanOrEqual(100);
        expect(["well", "middle", "failing"]).toContain(p.status);
      }
      expect(v.standard).toMatch(/four pillars/);
    }
  });

  it("Good Standing only ever means all four pillars score well", () => {
    on();
    for (const m of MATRIX) {
      const v = verdictOf(m);
      if (v.tier === "approved" || v.tier === "mostly-clean") expect(v.pillars!.every((p) => p.status === "well"), label(m)).toBe(true);
    }
  });

  it("a hard flag stays Not Recommended and a licensed drug stays Licensed Drug", () => {
    on();
    expect(deriveVerdict(buildStanding("not-recommended")).tier).toBe("not-recommended");
    expect(deriveVerdict(buildStanding("not-recommended", { catchAll: true })).tier).toBe("not-recommended");
    const drug = deriveVerdict(buildStanding("not-assessed"));
    expect(drug.tier).toBe("not-assessed");
    expect(drug.isDrug).toBe(true);
  });

  it("no ingredient list is never Good Standing and never Not Recommended on that account", () => {
    on();
    for (const m of MATRIX.filter((x) => x.noList)) expect(verdictOf(m).tier, label(m)).toBe("can-do-better");
  });

  it("an unnamed catch-all keeps a review out of Good Standing", () => {
    on();
    for (const m of MATRIX.filter((x) => x.catchAll && !x.noList && x.target !== "not-recommended" && x.target !== "not-assessed")) {
      expect(["approved", "mostly-clean"], label(m)).not.toContain(verdictOf(m).tier);
    }
  });

  it("drug-boundary wording still caps an otherwise clean review at Room to Improve", () => {
    const boundary = {
      text: "Clears acne in 7 days", source: "brand", types: [], primaryType: "treatment", riskLevel: "amber",
      evidenceLevel: 1, evidenceNote: "", absoluteLanguage: false, asciConcern: false, asciNote: null,
      drugBoundaryRisk: true, drugBoundaryNote: "Treatment wording", corroborated: true,
    };
    // Clear usage warnings keep the compliance pillar high, so one soft claims-screen finding leaves every pillar
    // well and only the drug-boundary cap stands between this review and Good Standing.
    const base = buildStanding("mostly-clean");
    const review = {
      ...base,
      claimMap: [boundary],
      ingredientTransparency: { ...base.ingredientTransparency, usageWarningsClear: true },
    } as ReturnType<typeof buildStanding>;
    expect(deriveVerdict(review).tier).toBe("can-do-better"); // today's behaviour, flag off
    on();
    const v = deriveVerdict(review);
    expect(v.tier).toBe("can-do-better");
    expect(v.pillars!.every((p) => p.status === "well")).toBe(true); // clean pillars would otherwise be Good Standing
  });

  it("is idempotent: deriving twice gives the same verdict", () => {
    on();
    for (const m of MATRIX) {
      const r = buildStanding(m.target, { catchAll: m.catchAll, noList: m.noList });
      expect(deriveVerdict(r)).toEqual(deriveVerdict(r));
    }
  });

  it("keeps the internal approved tier only when the old strict bar also holds", () => {
    on();
    expect(deriveVerdict(buildStanding("approved")).tier).toBe("approved");
    expect(deriveVerdict(buildStanding("mostly-clean")).tier).toBe("mostly-clean");
    // Weak scored sections but strong pillars: Good Standing, but not the strict `approved` tier.
    expect(deriveVerdict(buildStanding("can-do-better")).tier).toBe("mostly-clean");
  });

  it("keeps the approved status (which pitch-stamp eligibility reads) tied to the approved tier, as today", () => {
    on();
    expect(deriveVerdict(buildStanding("approved")).status).toBe("approved");
    expect(deriveVerdict(buildStanding("mostly-clean")).status).toBe("not_approved");
    expect(deriveVerdict(buildStanding("can-do-better")).status).toBe("not_approved");
  });
});

describe("rubric revision stamping", () => {
  it("stamps the current revision with the flag off, exactly as before", () => {
    expect(activeRubricRev()).toBe(RUBRIC_REV);
  });

  it("stamps r9 only while the flag is on", () => {
    vi.stubEnv(FLAG, "1");
    expect(activeRubricRev()).toBe(PILLAR_RUBRIC_REV);
    expect(PILLAR_RUBRIC_REV).toBe("r9");
  });

  it("serves rows stamped with either revision, so a flip or a rollback never hides a review", () => {
    expect(ACCEPTED_RUBRIC_REVS).toEqual(expect.arrayContaining([RUBRIC_REV, PILLAR_RUBRIC_REV]));
    expect(isAcceptedRubricRev(RUBRIC_REV)).toBe(true);
    expect(isAcceptedRubricRev(PILLAR_RUBRIC_REV)).toBe(true);
    expect(isAcceptedRubricRev("r6")).toBe(false);
  });
});
