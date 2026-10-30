import { describe, expect, it } from "vitest";
import { SAMPLE_EXAMPLE_PROHIBITED } from "@/data/analysis/sample-reviews";
import { deriveVerdict } from "@/lib/product-review-engine";
import { reviewToScorecard } from "@/lib/review-to-scorecard";
import { decideReview } from "@/lib/analyser-x";
import { decide } from "@/lib/analyser-x/decision";
import { checkInvariants } from "@/lib/analyser-x/invariants";
import { lint } from "@/lib/analyser-x/copy";
import { NOW, claimOf, evidence, notAllGreen, rv } from "@/lib/analyser-x/test-helpers";
import type { ProductReview } from "@/lib/product-review-types";
import { buildPillsPage } from "./pills-page";

/* Owner decision, 2026-10-30: when all five sections of the product page are green, the product is a Good choice, except for flags. The cautions the sections
   already measure (a claim without a test on this product; a formula that may not deliver) are not flags: they stay on the page, as a note and under Gaps,
   and no longer hold the product at Buy with caution. Every other caution is a flag and still does. The case that raised it: Cetaphil Moisturising Cream,
   five sections Strong, a clean ingredient screen, and a claim gap only. */

const hero = claimOf({ text: "Brightens skin", types: ["appearance"], primaryType: "appearance", evidenceLevel: 6 });
const weak = claimOf({ text: "Supports Dull Skin Recovery", types: ["concern"], primaryType: "concern", evidenceLevel: 2 });
const veganNoProof = claimOf({ text: "cruelty-free and vegan", types: ["safety"], primaryType: "safety", evidenceLevel: 1 });
const MANY_WEAK = [hero, weak, veganNoProof];

const page = (review: ProductReview) => {
  const { product } = reviewToScorecard(review, deriveVerdict(review));
  return buildPillsPage(review, product, NOW, decideReview(review, NOW));
};
const ids = (r: ReturnType<typeof decideReview>) => r.decision.reasons.map((x) => x.ruleId);

describe("all five sections green, and only a claim gap in the way", () => {
  const r = decideReview(rv({ claimMap: MANY_WEAK }), NOW);

  it("is a Good choice", () => {
    expect(r.decision.key).toBe("good-choice");
  });

  it("keeps the claim gap: as a note, never as a caution, and never dropped", () => {
    expect(r.findings.find((f) => f.ruleId === "caution.claim_gap")).toBeDefined();
    expect(r.settled.find((f) => f.ruleId === "caution.claim_gap")?.severity).toBe("note");
    const reason = r.decision.reasons.find((x) => x.ruleId === "caution.claim_gap");
    expect(reason?.kind).toBe("note");
    expect(reason?.text).toContain("not backed by a test on this product");
  });

  it("stands on the three supports, the third being that all five sections are Strong", () => {
    expect(ids(r)).toEqual(expect.arrayContaining(["support.list_verified", "support.safety_clear", "support.sections_green"]));
    expect(ids(r)).not.toContain("support.claims_proportionate");
    const text = r.decision.reasons.find((x) => x.ruleId === "support.sections_green")!.text;
    expect(text).toContain("All five areas of our checks are Strong");
    expect(lint(text).problems).toEqual([]);
  });

  it("passes every invariant of a decision", () => {
    expect(checkInvariants(r.decision, r.settled, r.ctx)).toEqual([]);
  });

  it("shows on the page as Good choice, green, with the claim still listed under Gaps and the five sections Strong", () => {
    const m = page(rv({ claimMap: MANY_WEAK }));
    expect(m.pill).toMatchObject({ key: "good-choice", marker: "green" });
    expect(m.details?.map((d) => d.rating.marker)).toEqual(["green", "green", "green", "green", "green"]);
    expect(m.gaps.join(" ")).toContain("Supports Dull Skin Recovery");
    expect(m.take.notes.join(" ")).toContain("not backed by a test on this product");
  });

  it("is the same colour whichever surface asks: the page, a list tile and a comparison read one decision", () => {
    // Every surface builds its colour from decideReview; two calls on the same analysis agree, and the page's pill is that decision's.
    expect(decideReview(rv({ claimMap: MANY_WEAK }), NOW).decision.key).toBe(r.decision.key);
    expect(page(rv({ claimMap: MANY_WEAK })).pill.key).toBe(r.decision.key);
  });
});

describe("a flag still holds the product back, whatever the sections say", () => {
  it("SPF below 30 on a sunscreen stays Buy with caution", () => {
    const review = rv({ productName: "Daily Sunscreen SPF 20", category: "Sunscreen", claimMap: MANY_WEAK });
    const r = decideReview(review, NOW);
    expect(ids(r)).toContain("caution.spf_low");
    expect(r.decision.key).toBe("buy-with-caution");
  });

  it("the claim gap stays a caution when another caution sits beside it", () => {
    const review = rv({ productName: "Daily Sunscreen SPF 20", category: "Sunscreen", claimMap: MANY_WEAK });
    const r = decideReview(review, NOW);
    expect(r.settled.find((f) => f.ruleId === "caution.claim_gap")?.severity).toBe("caution");
  });
});

describe("it only applies when all five sections are green", () => {
  it("one section not green leaves the claim gap holding the product at Buy with caution", () => {
    const r = decideReview(rv({ claimMap: MANY_WEAK, ...notAllGreen() }), NOW);
    expect(r.decision.key).toBe("buy-with-caution");
    expect(ids(r)).toContain("caution.claim_gap");
    expect(ids(r)).not.toContain("support.sections_green");
  });

  it("each section on its own: any one of them below green turns the rule off", () => {
    const base = rv().scores;
    const cases: Partial<ProductReview>[] = [
      { scores: { ...base, formulaLogic: 10 } },        // Formula logic 67%: yellow
      { scores: { ...base, claimClarity: 9 } },         // Consumer clarity 60%: yellow
      { scores: { ...base, claimEvidence: 10 } },       // Claims evidence 50%: yellow
    ];
    for (const over of cases) expect(decideReview(rv({ claimMap: MANY_WEAK, ...over }), NOW).decision.key, JSON.stringify(over.scores)).toBe("buy-with-caution");
    // Test transparency: no performance claim at level 5 or better, so that section is yellow.
    const noLab = [claimOf({ ...hero, evidenceLevel: 4 }), weak];
    expect(decideReview(rv({ claimMap: noLab }), NOW).decision.key).toBe("buy-with-caution");
  });

  it("a list we cannot verify, a block or a gap decide exactly as before", () => {
    const unreliable = decideReview(rv({ claimMap: MANY_WEAK }, evidence.model()), NOW);
    expect(unreliable.decision.key).toBe("not-enough-info");
    // A prohibited ingredient is a block: Look elsewhere, whatever colour the sections are and however weak the claims.
    const blocked = decideReview({ ...SAMPLE_EXAMPLE_PROHIBITED, scores: rv().scores, claimMap: [...(SAMPLE_EXAMPLE_PROHIBITED.claimMap ?? []), weak] }, NOW);
    expect(ids(blocked)).toContain("block.prohibited");
    expect(blocked.decision.key).toBe("look-elsewhere");
  });

  it("a decision built without sections is untouched", () => {
    const r = decideReview(rv({ claimMap: MANY_WEAK }), NOW);
    const without = decide({ ...r.ctx, sections: undefined });
    expect(without.decision.key).toBe("buy-with-caution");
    expect(without.settled.find((f) => f.ruleId === "caution.claim_gap")?.severity).toBe("caution");
  });
});

describe("the page and the decision read the same section colours", () => {
  it("on every combination of weak and strong scores the page's rows are the sections the decision used", () => {
    const base = rv().scores;
    for (const formulaLogic of [15, 10, 5]) for (const claimEvidence of [20, 12, 6]) for (const claimClarity of [15, 8]) {
      const review = rv({ claimMap: MANY_WEAK, scores: { ...base, formulaLogic, claimEvidence, claimClarity } });
      const r = decideReview(review, NOW);
      const rows = page(review).details?.map((d) => d.rating.marker) ?? [];
      const s = r.ctx.sections!;
      expect(rows.slice(1), `${formulaLogic}/${claimEvidence}/${claimClarity}`).toEqual([s.formula, s.claims, s.tests, s.clarity]);
      // Good choice by the sections happens exactly when all five rows on the page are green.
      expect(r.decision.reasons.some((x) => x.ruleId === "support.sections_green")).toBe(rows.length === 5 && rows.every((m) => m === "green"));
    }
  });
});
