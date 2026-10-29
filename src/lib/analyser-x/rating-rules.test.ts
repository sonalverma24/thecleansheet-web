import { describe, expect, it } from "vitest";
import { decideReview } from "./adapter";
import { isExclusionStatement } from "./claimflags";
import { lint } from "./copy";
import { ambitionOf } from "./ladder";
import { checkInvariants } from "./invariants";
import { BASE, NOW, claimOf, evidence, rv } from "./test-helpers";

/* The two rating rules added on 2026-10-29, after a shampoo whose own page called its "synthetic fragrance-free" claim misleading, and showed a crossed
   "Fragrance free" chip, still came out Green:
   1. "Protects ... against / from ..." is a performance claim, so it needs a test on the finished product like "repairs" does.
   2. A "free from" claim nobody has checked, set beside the exact entry in the product's own list that it excludes, is a caution (never a block). */

const ids = (r: ReturnType<typeof decideReview>) => r.decision.reasons.map((x) => x.ruleId);
const unchecked = (text: string) => claimOf({ text, types: ["free-from"], primaryType: "free-from", evidenceLevel: 1, corroborated: undefined });

describe("a 'protects against' claim needs a test on the finished product", () => {
  it.each([
    "Protects hair against heat damage up to 450F & from UV",
    "Protects from UVA/UVB/Blue Light",
    "Broad-spectrum protection against UVA and UVB rays",
    "Shields skin from pollution",
    "Helps defend against sun damage",
  ])("%s is a performance claim", (text) => {
    expect(ambitionOf(text, "functional")).toBe("performance");
  });

  it.each([
    "Protective packaging",
    "Gentle on your skin",
    "Luxuriously cleanses",
    "Vegan",
  ])("%s is not", (text) => {
    expect(ambitionOf(text, "functional")).not.toBe("performance");
  });

  it("a heat-protection claim with no test lowers a clean product to Buy with caution, and names the claim", () => {
    const weak = claimOf({ text: "Protects hair against heat damage up to 450F & from UV", types: ["functional"], primaryType: "functional", evidenceLevel: 1, corroborated: undefined });
    const r = decideReview(rv({ claimMap: [weak] }), NOW);
    expect(r.decision.key).toBe("buy-with-caution");
    expect(r.decision.reasons.find((x) => x.ruleId === "caution.claim_gap")?.text).toContain("Protects hair against heat damage");
  });

  it("the same claim backed by a finished-product test (level 4) leaves a clean product Good choice", () => {
    const backed = claimOf({ text: "Protects hair against heat damage up to 450F & from UV", types: ["functional"], primaryType: "functional", evidenceLevel: 4, corroborated: undefined });
    expect(decideReview(rv({ claimMap: [backed] }), NOW).decision.key).toBe("good-choice");
  });
});

describe("caution.free_from_unverified", () => {
  const withFragrance = [...BASE, "Fragrance (Parfum)", "Linalool"];

  it("an unchecked 'Synthetic fragrance-free' claim beside Fragrance (Parfum) is a caution, not Good choice", () => {
    const r = decideReview(rv({ inciIngredients: withFragrance, claimMap: [unchecked("Synthetic fragrance-free")] }), NOW);
    expect(r.decision.key).toBe("buy-with-caution");
    expect(ids(r)).toContain("caution.free_from_unverified");
    expect(ids(r)).not.toContain("block.contradicted");
    const reason = r.decision.reasons.find((x) => x.ruleId === "caution.free_from_unverified");
    expect(reason?.evidence).toMatchObject({ claim: "Synthetic fragrance-free", ingredient: "Fragrance (Parfum)" });
    expect(checkInvariants(r.decision, r.settled, r.ctx)).toEqual([]);
  });

  it("says the claim is unchecked and names the entry; it never says the claim is false", () => {
    const r = decideReview(rv({ inciIngredients: withFragrance, claimMap: [unchecked("Synthetic fragrance-free")] }), NOW);
    const text = r.decision.reasons.find((x) => x.ruleId === "caution.free_from_unverified")!.text;
    expect(text).toBe("The claim “Synthetic fragrance-free” is unchecked, and the ingredient list shows Fragrance (Parfum). Check it against the pack before you rely on it.");
    expect(lint(text).problems).toEqual([]);
  });

  it("counts the claims when several are unchecked, and gives one as the example", () => {
    const r = decideReview(rv({
      inciIngredients: [...BASE, "Methylparaben", "Sodium Laureth Sulfate"],
      claimMap: [unchecked("Paraben-free"), unchecked("Sulfate-free")],
    }), NOW);
    const reason = r.decision.reasons.find((x) => x.ruleId === "caution.free_from_unverified")!;
    expect(reason.text).toBe("2 “free from” claims are unchecked, and the ingredient list shows entries that may conflict, for example “Paraben-free” beside Methylparaben.");
    expect(lint(reason.text).problems).toEqual([]);
  });

  it("a VERIFIED claim the list contradicts stays a block (Look elsewhere), and is not also counted as this caution", () => {
    const verified = claimOf({ text: "Paraben-Free", types: ["free-from"], primaryType: "free-from", evidenceLevel: 1, corroborated: true });
    const r = decideReview(rv({ inciIngredients: [...BASE, "Methylparaben"], claimMap: [verified] }), NOW);
    expect(r.decision.key).toBe("look-elsewhere");
    expect(ids(r)).toContain("block.contradicted");
    expect(r.findings.map((f) => f.ruleId)).not.toContain("caution.free_from_unverified");
  });

  it("a claim known to be fabricated (corroborated false) is ignored, as everywhere else", () => {
    const fabricated = claimOf({ ...unchecked("Paraben-free"), corroborated: false });
    const r = decideReview(rv({ inciIngredients: [...BASE, "Methylparaben"], claimMap: [fabricated] }), NOW);
    expect(r.findings.map((f) => f.ruleId)).not.toContain("caution.free_from_unverified");
  });

  it("does nothing on a list we cannot verify: that is already a gap, not a finding about the claim", () => {
    const r = decideReview(rv({ inciIngredients: [...BASE, "Methylparaben"], claimMap: [unchecked("Paraben-free")] }, evidence.model()), NOW);
    expect(r.findings.map((f) => f.ruleId)).not.toContain("caution.free_from_unverified");
    expect(r.decision.key).toBe("not-enough-info");
  });

  it("does nothing when the list does not contain what the claim excludes: a true claim stays Good choice", () => {
    const r = decideReview(rv({ claimMap: [unchecked("Paraben-free"), unchecked("Sulfate-free"), unchecked("Synthetic fragrance-free")] }), NOW);
    expect(r.decision.key).toBe("good-choice");
    expect(r.findings.map((f) => f.ruleId)).not.toContain("caution.free_from_unverified");
  });

  it("only reads claims typed free-from: 'free radicals' and 'without water' are not exclusions", () => {
    const wording = claimOf({ text: "Vitamin E: protects from free radicals & moisturises", types: ["functional"], primaryType: "functional", evidenceLevel: 4, corroborated: undefined });
    const r = decideReview(rv({ inciIngredients: [...BASE, "Tocopherol"], claimMap: [wording] }), NOW);
    expect(r.findings.map((f) => f.ruleId)).not.toContain("caution.free_from_unverified");
  });

  it("does not read a list entry that itself says 'free' as the thing it excludes", () => {
    const r = decideReview(rv({ inciIngredients: [...BASE, "Paraben-Free Goat Milk"], claimMap: [unchecked("Paraben-free")] }), NOW);
    expect(r.findings.map((f) => f.ruleId)).not.toContain("caution.free_from_unverified");
  });

  it("does not read a long sentence that only mentions an ingredient (the CodeSkin sunscreen wording)", () => {
    const sentence = unchecked("Only Zinc oxide and no hidden chemical filters in a silicon-based gel");
    const r = decideReview(rv({ inciIngredients: [...BASE, "Zinc Oxide", "Dimethicone"], claimMap: [sentence] }), NOW);
    expect(r.findings.map((f) => f.ruleId)).not.toContain("caution.free_from_unverified");
  });
});

describe("isExclusionStatement", () => {
  it.each([
    "Paraben-free", "Sulfate-free.", "SLES and paraben-free.", "Hypoallergenic and paraben-free", "Synthetic fragrance-free", "No Fragrance.",
    "Free from Parabens, Silicones, Mineral Oil, and Sulphates", "Made without parabens, alcohol or silicones", "Without sulphates", "Zero alcohol",
  ])("reads %s", (t) => expect(isExclusionStatement(t)).toBe(true));

  it.each([
    "Only Zinc oxide and no hidden chemical filters in a silicon-based gel",
    "Vitamin E: protects from free radicals & moisturises",
    "Can be used with or without water.",
    "Maintains skin hydration with d-panthenol and aloe vera no dryness or tightness",
    "A gentle, sulfate-free formula that cleanses while replenishing lost moisture, designed for everyday use on all hair types.",
  ])("does not read %s", (t) => expect(isExclusionStatement(t)).toBe(false));
});
