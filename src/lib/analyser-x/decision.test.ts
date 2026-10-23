import { describe, expect, it } from "vitest";
import { buildStanding } from "@/lib/review.fixtures";
import { makeInciEvidence } from "@/lib/review-verifier";
import { decideReview } from "./adapter";
import { checkInvariants } from "./invariants";
import { BASE, NOW, REVIEWED, claimOf, evidence, rv } from "./test-helpers";

const ids = (r: ReturnType<typeof decideReview>) => r.decision.reasons.map((x) => x.ruleId);

describe("the five pills: worked examples", () => {
  it("Good choice: a verified list, a clean screen, proportionate claims", () => {
    const r = decideReview(rv(), NOW);
    expect(r.decision.key).toBe("good-choice");
    expect(r.decision.confidence).toBe("high");
    expect(ids(r)).toEqual(expect.arrayContaining(["support.list_verified", "support.safety_clear", "support.claims_proportionate"]));
    expect(checkInvariants(r.decision, r.settled, r.ctx)).toEqual([]);
  });

  it("Good choice: a product that makes no claims at all, with a verified clean list", () => {
    const r = decideReview(rv({ claimMap: [] }), NOW);
    expect(r.decision.key).toBe("good-choice");
  });

  it("Buy with caution: the main claim rests on borrowed research", () => {
    const r = decideReview(rv({ claimMap: [claimOf({ text: "Reduces pores in 4 weeks", types: ["time-bound"], primaryType: "time-bound", evidenceLevel: 2 })] }), NOW);
    expect(r.decision.key).toBe("buy-with-caution");
    expect(ids(r)).toContain("caution.claim_gap");
  });

  it("Look elsewhere: a claim the verified list contradicts, with its evidence trail", () => {
    const r = decideReview(rv({
      inciIngredients: [...BASE, "Methylparaben"],
      claimMap: [claimOf({ text: "Paraben-Free", types: ["free-from"], primaryType: "free-from", evidenceLevel: 1 })],
    }), NOW);
    expect(r.decision.key).toBe("look-elsewhere");
    const reason = r.decision.reasons.find((x) => x.ruleId === "block.contradicted");
    expect(reason?.evidence?.ingredient).toBe("Methylparaben");
    expect(reason?.evidence?.source).toContain("incidecoder.com");
    expect(reason?.text).toContain("Methylparaben");
    expect(checkInvariants(r.decision, r.settled, r.ctx)).toEqual([]);
  });

  it("Not enough info: the same apparent contradiction on a model-transcribed list is not published", () => {
    const r = decideReview(rv({
      inciIngredients: [...BASE, "Methylparaben"],
      claimMap: [claimOf({ text: "Paraben-Free", types: ["free-from"], primaryType: "free-from", evidenceLevel: 1 })],
    }, evidence.model()), NOW);
    expect(r.decision.key).toBe("not-enough-info");
    expect(r.decision.gapKind).toBe("disclosure");
    expect(ids(r)).toContain("gap.list_blocked");
    expect(r.decision.reasons.some((x) => x.kind === "block")).toBe(false);
    expect(r.decision.reasons.map((x) => x.text).join(" ")).not.toMatch(/Methylparaben/);
  });

  it("Not enough info (acquisition): the product page could not be read", () => {
    const r = decideReview(rv({ inciIngredients: [], ingredientReads: [] }, evidence.model()), NOW, { acquisition: { pageFetched: false, errors: ["page_failed"] } });
    expect(r.decision.key).toBe("not-enough-info");
    expect(r.decision.gapKind).toBe("acquisition");
    expect(r.decision.reasons.map((x) => x.text).join(" ")).toMatch(/checking again/);
  });

  it("an unread page is said once: the missing list and the unjudged claims follow from it, but stay in the record", () => {
    const r = decideReview(rv({ inciIngredients: [], ingredientReads: [], claimMap: [] }, evidence.model()), NOW, { acquisition: { pageFetched: false, errors: ["page_failed"] } });
    expect(ids(r)).toEqual(["gap.acquisition"]);
    expect(r.findings.map((f) => f.ruleId)).toEqual(expect.arrayContaining(["gap.acquisition", "gap.no_list", "gap.claims_unreliable"]));
    expect(r.decision.gapKind).toBe("acquisition");
  });

  it("Not enough info (disclosure): no list exists and nothing failed", () => {
    const r = decideReview(rv({ inciIngredients: [], ingredientReads: [] }, evidence.model()), NOW);
    expect(r.decision.key).toBe("not-enough-info");
    expect(r.decision.gapKind).toBe("disclosure");
  });

  it("Medicinal product: a licensed drug active in a verified list", () => {
    const r = decideReview(rv({ productName: "Anti Dandruff Shampoo", inciIngredients: [...BASE, "Ketoconazole"] }), NOW);
    expect(r.decision.key).toBe("medicinal-product");
    expect(ids(r)).toContain("med.drug_active");
  });

  it("a drug active in an unverified list is Not enough info, never Medicinal", () => {
    const r = decideReview(rv({ productName: "Anti Dandruff Shampoo", inciIngredients: [...BASE, "Ketoconazole"] }, evidence.model()), NOW);
    expect(r.decision.key).toBe("not-enough-info");
    expect(ids(r)).toContain("gap.possible_medicinal");
  });

  it("Medicinal product: prescription wording on the page, whatever the list", () => {
    const r = decideReview(rv({ inciIngredients: [], ingredientReads: [] }, evidence.model()), NOW, { rxText: true });
    expect(r.decision.key).toBe("medicinal-product");
    expect(ids(r)).toContain("med.rx_text");
  });

  it("Look elsewhere: a fairness claim needs no ingredient list", () => {
    const r = decideReview(rv({
      inciIngredients: [], ingredientReads: [],
      claimMap: [claimOf({ text: "Skin whitening cream for fairness", primaryType: "appearance", types: ["appearance"] })],
    }, evidence.model()), NOW);
    expect(r.decision.key).toBe("look-elsewhere");
    expect(ids(r)).toContain("block.fairness");
  });

  it("a fairness claim whose wording was never verified is not a block", () => {
    const r = decideReview(rv({ claimMap: [claimOf({ text: "Skin whitening cream", primaryType: "appearance", corroborated: undefined })] }), NOW);
    expect(r.decision.key).not.toBe("look-elsewhere");
  });

  it("Buy with caution: a baby product that lists fragrance (an unreviewed audience rule can only caution)", () => {
    const r = decideReview(rv({ productName: "Baby Lotion", category: "Baby lotion", inciIngredients: [...BASE, "Parfum"] }), NOW);
    expect(r.decision.key).toBe("buy-with-caution");
    expect(ids(r)).toContain("caution.audience");
    expect(r.findings.filter((f) => f.ruleId === "caution.audience").every((f) => f.params.reviewed === false)).toBe(true);
  });

  it("Buy with caution: SPF 20", () => {
    const r = decideReview(rv({ productName: "Daily Sunscreen SPF 20", category: "Sunscreen" }), NOW);
    expect(ids(r)).toContain("caution.spf_low");
    expect(r.decision.key).toBe("buy-with-caution");
  });

  it("Buy with caution: a list from a retailer page only", () => {
    const r = decideReview(rv({}, evidence.retailer()), NOW);
    expect(r.decision.key).toBe("buy-with-caution");
    expect(ids(r)).toContain("caution.list_trust_2");
  });

  it("high confidence needs a complete screen: one ingredient the database cannot resolve caps it at medium", () => {
    expect(decideReview(rv(), NOW).decision.confidence).toBe("high");
    expect(decideReview(rv({ inciIngredients: [...BASE, "Zorbaflux"] }), NOW).decision.confidence).toBe("medium");
  });

  it("a product assessed as a medicine does not say it was assessed as a cosmetic", () => {
    const r = decideReview(rv({ productName: "Anti Dandruff Shampoo", inciIngredients: [...BASE, "Ketoconazole"] }), NOW);
    expect(r.decision.key).toBe("medicinal-product");
    expect(ids(r)).not.toContain("note.framework_differs");
    expect(r.findings.map((f) => f.ruleId)).toContain("note.framework_differs"); // still in the audit trail
  });

  it("an old analysis says when its evidence was last checked; age alone never makes it a worse buying choice", () => {
    const r = decideReview(rv({ reviewedAt: "2025-01-01T00:00:00.000Z" }), NOW);
    expect(ids(r)).toContain("note.freshness");
    expect(ids(r)).not.toContain("caution.stale");
    expect(r.decision.key).toBe("good-choice");
    expect(r.decision.confidence).toBe("medium");
    expect(r.decision.reasons.find((x) => x.ruleId === "note.freshness")?.text).toBe("Evidence last checked on 1 Jan 2025. We re-check older analyses.");
  });

  it("Buy with caution: an unnamed catch-all ingredient", () => {
    const r = decideReview(rv({ inciIngredients: [...BASE, "Soap Base"] }), NOW);
    expect(ids(r)).toContain("caution.catch_all");
    expect(["buy-with-caution", "look-elsewhere"]).toContain(r.decision.key);
  });

  it("Look elsewhere: a prohibited ingredient in a verified list", () => {
    const r = decideReview(rv({ inciIngredients: [...BASE, "Hydroquinone"] }), NOW);
    expect(r.decision.key).toBe("look-elsewhere");
    expect(ids(r)).toContain("block.prohibited");
  });
});

describe("pills against the v3.0 fixture targets", () => {
  it("not-recommended (contradicted claim, anchored list) is Look elsewhere", () => {
    const r = decideReview(buildStanding("not-recommended", { evidence: "anchored" }), NOW);
    expect(r.decision.key).toBe("look-elsewhere");
  });

  it("not-recommended on a model-transcribed list (no source) is Not enough info", () => {
    const r = decideReview(buildStanding("not-recommended", { evidence: "none" }), NOW);
    expect(r.decision.key).toBe("not-enough-info");
    expect(ids(r)).toContain("gap.list_blocked");
  });

  it("a brand-page list with no captured quote is reliable but unanchored: it can block, and it cannot earn high confidence", () => {
    const r = decideReview(buildStanding("not-recommended", { evidence: "unverified" }), NOW);
    expect(r.decision.key).toBe("look-elsewhere");
    expect(r.decision.basis.listAnchored).toBe(false);
    const unanchored = makeInciEvidence("https://brand.example/products/x", "", REVIEWED);
    const good = decideReview(rv({}, unanchored), NOW);
    expect(good.decision.key).toBe("good-choice");
    expect(good.decision.confidence).toBe("medium");
    // The same list with a captured quote earns high confidence.
    expect(decideReview(rv({}, evidence.brandPage()), NOW).decision.confidence).toBe("high");
  });

  it("not-assessed (ketoconazole) is Medicinal product on an anchored list", () => {
    const r = decideReview(buildStanding("not-assessed", { evidence: "anchored" }), NOW);
    expect(r.decision.key).toBe("medicinal-product");
  });

  it("a review with no list is never Good choice and never Look elsewhere (without a claim block)", () => {
    for (const t of ["approved", "mostly-clean", "can-do-better"] as const) {
      const r = decideReview(buildStanding(t, { noList: true, evidence: "anchored" }), NOW);
      expect(["good-choice", "look-elsewhere"]).not.toContain(r.decision.key);
    }
  });
});

describe("every decision is explained", () => {
  it("carries a basis, a version and at least one reason", () => {
    const r = decideReview(rv(), NOW);
    expect(r.decision.version).toBe("TCS-X 1.0");
    expect(r.decision.basis.listSource).toBe("incidecoder");
    expect(r.decision.basis.listTrust).toBe(3);
    expect(r.decision.basis.analysedAt).toBe(REVIEWED);
    expect(r.decision.reasons.length).toBeGreaterThan(0);
  });

  it("reasons name the rule that produced them", () => {
    const r = decideReview(rv({ inciIngredients: [...BASE, "Hydroquinone"] }), NOW);
    for (const x of r.decision.reasons) expect(r.settled.some((f) => f.ruleId === x.ruleId)).toBe(true);
  });
});
