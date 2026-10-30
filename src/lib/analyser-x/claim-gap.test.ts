import { describe, expect, it } from "vitest";
import { decideReview } from "./adapter";
import { lint } from "./copy";
import { residualOf } from "./rules";
import { NOW, claimOf, notAllGreen, rv } from "./test-helpers";

/* The claim-gap caution names the claim with the widest gap, whatever order the claims were listed in, and
   says "One claim" or "N claims": it was "The main claim", though nothing ever picked the main one. */

const medium = claimOf({ text: "Fades dark spots", types: ["concern"], primaryType: "concern", evidenceLevel: 3 });
const high = claimOf({ text: "Prevents future damage", types: ["functional"], primaryType: "functional", evidenceLevel: 2 });
const veryHigh = claimOf({ text: "Clinically proven to lighten skin", types: ["clinical"], primaryType: "clinical", evidenceLevel: 2 });
const hero = claimOf({ text: "Brightens skin", types: ["appearance"], primaryType: "appearance", evidenceLevel: 6 });

const gap = (claims: ReturnType<typeof claimOf>[]) => {
  const r = decideReview(rv({ claimMap: claims }), NOW);
  return { r, finding: r.findings.find((f) => f.ruleId === "caution.claim_gap"), reason: r.decision.reasons.find((x) => x.ruleId === "caution.claim_gap") };
};
const permutations = <T,>(xs: T[]): T[][] => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) => permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((rest) => [x, ...rest])));

describe("caution.claim_gap names the widest gap", () => {
  it("the fixtures sit at three different residual risks", () => {
    const risk = (c: ReturnType<typeof claimOf>) => residualOf({ text: c.text, platforms: [], types: c.types, primaryType: c.primaryType, emotional: false, drugBoundary: false, asciConcern: false, corroborated: true, evidenceLevel: c.evidenceLevel, levelOrigin: "model" });
    expect([risk(medium), risk(high), risk(veryHigh)]).toEqual(["medium", "high", "very-high"]);
  });

  it("leads with the very-high gap in every order the claims can be listed", () => {
    for (const order of permutations([medium, high, veryHigh])) {
      const { finding, reason } = gap(order);
      expect(finding?.params, order.map((c) => c.text).join(" | ")).toMatchObject({ claim: "Clinically proven to lighten skin", residual: "very-high", count: 3 });
      expect(reason?.text).toContain("Clinically proven to lighten skin");
    }
  });

  it("among equal gaps the first listed claim leads, deterministically", () => {
    const second = claimOf({ ...high, text: "Controls oil all day" });
    expect(gap([high, second]).finding?.params.claim).toBe("Prevents future damage");
    expect(gap([second, high]).finding?.params.claim).toBe("Controls oil all day");
  });
});

describe("caution.claim_gap wording", () => {
  it("says One claim for a single gap, and never calls it the main claim", () => {
    const { reason } = gap([hero, high]);
    expect(reason?.text).toBe("One claim, “Prevents future damage”, is not backed by a test on this product that we could find publicly.");
    expect(reason?.text).not.toMatch(/main claim/i);
  });

  it("counts the claims when there are several, and gives the widest as the example", () => {
    const { reason } = gap([medium, high, veryHigh]);
    expect(reason?.text).toBe("3 claims are not backed by a test on this product that we could find publicly, for example “Clinically proven to lighten skin”.");
  });

  it("passes the language lint in both forms", () => {
    for (const claims of [[hero, high], [medium, high, veryHigh]]) {
      expect(lint(gap(claims).reason!.text).problems).toEqual([]);
    }
  });
});

describe("the threshold is unchanged", () => {
  it("one weak claim still lowers the pill to Buy with caution, even beside a well-evidenced hero claim, unless all five sections are green", () => {
    // With the sections not all green (the claims-evidence section is yellow here), the claim gap holds the pill down.
    const r = decideReview(rv({ claimMap: [hero, high], ...notAllGreen() }), NOW);
    expect(r.findings.find((f) => f.ruleId === "caution.claim_gap")).toBeDefined();
    expect(r.decision.key).toBe("buy-with-caution");
    // With all five green (the default scores) the gap is still found and listed, and no longer lowers the pill (owner decision, 2026-10-30).
    const { r: green, finding } = gap([hero, high]);
    expect(finding).toBeDefined();
    expect(green.decision.key).toBe("good-choice");
  });

  it("a product whose claims all have matching proof has no claim gap", () => {
    expect(gap([hero]).finding).toBeUndefined();
  });
});
