import { describe, expect, it } from "vitest";
import { decideReview } from "./adapter";
import { isFairnessName } from "./claimflags";
import { lint } from "./copy";
import { checkInvariants } from "./invariants";
import { NOW, claimOf, rv } from "./test-helpers";

/* The two misfits the 2026-11-04 audit of every live page found:
   1. A face wash whose analysis read no claim at all came out Good choice, while its own page showed Claims evidence, Test transparency and Consumer clarity as
      Concern. "No claim was read" was taken for "the claims are modest".
   2. "Lotus Herbals Whiteglow Skin Whitening And Brighening Gel Creme" came out Buy with caution. The fairness block reads claim text, and a claim needs a verified
      quote to block; the product's own name says "Skin Whitening", and a name needs no quote. */

const ids = (r: ReturnType<typeof decideReview>) => r.decision.reasons.map((x) => x.ruleId);
const log = (kept?: number, dropped?: number) => ({ grounded: true, webSearchQueries: [], sourceUris: [], sourceTitles: [], recordedAt: NOW, ...(kept === undefined ? {} : { claimsKept: kept, claimsDropped: dropped ?? 0 }) });

describe("no claim was read from the brand's page", () => {
  it("is not examined, so the product is Not enough info rather than Good choice (kept none, dropped none)", () => {
    const r = decideReview(rv({ claimMap: [], researchLog: log(0, 0) }), NOW);
    expect(r.decision.key).toBe("not-enough-info");
    expect(ids(r)).toEqual(["gap.claims_unreliable"]);
    expect(lint(r.decision.reasons[0].text).problems).toEqual([]);
    expect(checkInvariants(r.decision, r.settled, r.ctx)).toEqual([]);
  });

  it("is the same answer as when some claims were read but all were dropped (the case that was already handled)", () => {
    const dropped = decideReview(rv({ claimMap: [], researchLog: log(0, 4) }), NOW);
    const none = decideReview(rv({ claimMap: [], researchLog: log(0, 0) }), NOW);
    expect(dropped.decision.key).toBe("not-enough-info");
    expect(none.decision.key).toBe(dropped.decision.key);
    expect(ids(none)).toEqual(ids(dropped));
  });

  it("an older row that never recorded how many claims were kept is left as it was", () => {
    const old = decideReview(rv({ claimMap: [], researchLog: log() }), NOW);
    expect(old.decision.key).toBe("good-choice");
  });

  it("a product whose claims were read is unaffected", () => {
    const read = decideReview(rv({ researchLog: log(3, 0) }), NOW);
    expect(read.decision.key).toBe("good-choice");
  });
});

describe("a product whose own name makes a skin-whitening or fairness claim", () => {
  const unverified = [claimOf({ text: "Makes the skin look brighter", primaryType: "appearance", types: ["appearance"], corroborated: undefined })];

  it.each([
    "Lotus Herbals Whiteglow Skin Whitening And Brighening Gel Creme",
    "Visible Whitening Face Wash",
    "Fairness Cream",
    "Skin lightening serum",
  ])("%s is Look elsewhere, on the name alone", (productName) => {
    const r = decideReview(rv({ productName, claimMap: unverified }), NOW);
    expect(r.decision.key).toBe("look-elsewhere");
    expect(ids(r)).toContain("block.fairness");
    expect(r.decision.reasons.find((x) => x.ruleId === "block.fairness")?.evidence?.claim).toBe(productName);
    expect(checkInvariants(r.decision, r.settled, r.ctx)).toEqual([]);
  });

  it("needs no ingredient list, like a fairness claim", () => {
    const r = decideReview(rv({ productName: "Skin Whitening Cream", inciIngredients: [], ingredientReads: [], claimMap: unverified }), NOW);
    expect(r.decision.key).toBe("look-elsewhere");
  });

  it.each([
    "Non-whitening Daily Moisturiser",
    "Whiteglow Brightening Cream",
    "White Tea Face Mist",
    "Brightening Vitamin C Serum",
    "Tan Removal Face Wash",
  ])("%s is not read as one", (productName) => {
    const r = decideReview(rv({ productName, claimMap: unverified }), NOW);
    expect(ids(r)).not.toContain("block.fairness");
  });

  it("whitening toothpaste and nail products are about teeth and nails, not skin", () => {
    for (const n of ["Whitening Toothpaste", "Teeth Whitening Strips", "Nail Whitening Pencil"]) {
      expect(isFairnessName(n)).toBe(false);
      expect(ids(decideReview(rv({ productName: n, claimMap: unverified }), NOW))).not.toContain("block.fairness");
    }
  });

  it("is not read when the name is only what someone typed into a search (identity from text alone)", () => {
    const r = decideReview(rv({ productName: "Skin Whitening Cream", claimMap: unverified }), NOW, { identityFromTextOnly: true });
    expect(ids(r)).not.toContain("block.fairness");
    expect(r.decision.key).toBe("not-enough-info");
  });

  it("a verified claim and the name together make one finding, not two", () => {
    const verified = claimOf({ text: "Skin whitening for fairness", primaryType: "appearance", types: ["appearance"], corroborated: true });
    const r = decideReview(rv({ productName: "Skin Whitening Cream", claimMap: [verified] }), NOW);
    expect(r.findings.filter((f) => f.ruleId === "block.fairness")).toHaveLength(1);
    expect(r.decision.key).toBe("look-elsewhere");
  });

  it("an unverified fairness claim in the claims alone is still not a block (the existing rule, unchanged)", () => {
    const r = decideReview(rv({ productName: "Daily Moisturiser", claimMap: [claimOf({ text: "Skin whitening cream", primaryType: "appearance", corroborated: undefined })] }), NOW);
    expect(ids(r)).not.toContain("block.fairness");
  });
});
