import { describe, expect, it } from "vitest";
import { decideReview } from "./adapter";
import { MAX_REASON, lint } from "./copy";
import { ambitionOf, isUserPercentage } from "./ladder";
import { NOW, claimOf, notAllGreen, rv } from "./test-helpers";
import type { ProductReview } from "@/lib/product-review-types";

/* A "% of users" figure says how people felt, not what a test measured. It never moves the pill (owner decision, 2026-10-29); when no test details are
   public for it, it is listed as a gap (note.user_percentage). Wording that claims a proven result still counts. */

const hero = claimOf({ text: "Brightens skin", types: ["appearance"], primaryType: "appearance", evidenceLevel: 6 });
const survey = claimOf({ text: "95% of users felt the product gently cleansed their skin.", types: ["clinical", "time-bound"], primaryType: "clinical", evidenceLevel: 4 });
const surveyDetailed = claimOf({ ...survey, evidenceLevel: 6 });
const proven = claimOf({ text: "Clinically proven: 95% of users saw smoother skin", types: ["clinical"], primaryType: "clinical", evidenceLevel: 4 });
const unproven = claimOf({ text: "Prevents future damage", types: ["functional"], primaryType: "functional", evidenceLevel: 2 });

const run = (claims: ReturnType<typeof claimOf>[], extra: Partial<ProductReview> = {}) => {
  const r = decideReview(rv({ claimMap: claims, ...extra }), NOW);
  const ids = r.decision.reasons.map((x) => x.ruleId);
  return { r, ids, key: r.decision.key, note: r.decision.reasons.find((x) => x.ruleId === "note.user_percentage") };
};

describe("what counts as a % of users figure", () => {
  it("users, consumers, customers and people", () => {
    for (const t of ["95% of users felt softer skin", "9.5% of the consumers agreed", "88 % of customers would repurchase", "94% of people noticed a difference"]) expect(isUserPercentage(t), t).toBe(true);
  });

  it("not participants, not a measured change, and not a figure that also claims a proven result", () => {
    for (const t of ["92% of participants showed visible improvement", "30% reduction in wrinkles", "Clinically proven: 95% of users saw smoother skin", "Clinical study: 90% of users improved", "Dermatologist tested"]) expect(isUserPercentage(t), t).toBe(false);
  });

  it("is no longer clinical wording on its own, while participants and measured changes still are", () => {
    expect(ambitionOf("95% of users felt the product gently cleansed their skin.", "clinical")).toBe("routine");
    expect(ambitionOf("92% of participants showed visible improvement", "clinical")).toBe("clinical");
    expect(ambitionOf("Clinically proven: 95% of users saw smoother skin", "clinical")).toBe("clinical");
  });
});

describe("a % of users figure never moves the pill", () => {
  it("adding one to a product leaves the pill where it was, with no claim-gap caution", () => {
    const without = run([hero]);
    const withSurvey = run([hero, survey]);
    expect(withSurvey.key).toBe(without.key);
    expect(withSurvey.ids).not.toContain("caution.claim_gap");
  });

  it("the same holds however many there are", () => {
    const second = claimOf({ ...survey, text: "94% of users felt the product gently cleansed their skin." });
    expect(run([hero, survey, second]).key).toBe(run([hero]).key);
  });

  it("it is not counted among the claims that need proof, so another claim's gap is still named and counted alone", () => {
    const { r } = run([hero, unproven, survey], notAllGreen());
    const f = r.findings.find((x) => x.ruleId === "caution.claim_gap");
    expect(f?.params).toMatchObject({ claim: "Prevents future damage", count: 1 });
    expect(r.decision.key).toBe("buy-with-caution");
  });

  it("a figure that also says clinically proven is still held to the clinical bar", () => {
    const { ids, key } = run([hero, proven], notAllGreen());
    expect(ids).toContain("caution.claim_gap");
    expect(key).toBe("buy-with-caution");
  });
});

describe("note.user_percentage", () => {
  it("is raised when the test details are not public (below level 6), and names the claim", () => {
    const { note, ids } = run([hero, survey]);
    expect(ids).toContain("note.user_percentage");
    expect(note?.kind).toBe("note");
    expect(note?.text).toBe("The “% of users” claim “95% of users felt the product gently cleansed their skin.” comes with no test details we could find publicly (sample size, duration, method).");
  });

  it("counts them when there are several", () => {
    const second = claimOf({ ...survey, text: "94% of users felt the product gently cleansed their skin." });
    expect(run([hero, survey, second]).note?.text).toMatch(/^2 “% of users” claims come with no test details/);
  });

  it("is not raised when sample size, duration and method are public (level 6)", () => {
    expect(run([hero, surveyDetailed]).ids).not.toContain("note.user_percentage");
  });

  it("passes the language lint and the length limit in both forms", () => {
    const second = claimOf({ ...survey, text: "94% of users felt the product gently cleansed their skin." });
    for (const claims of [[hero, survey], [hero, survey, second]]) {
      const text = run(claims).note!.text;
      expect(lint(text).problems).toEqual([]);
      expect(text.length).toBeLessThanOrEqual(MAX_REASON);
    }
  });
});
