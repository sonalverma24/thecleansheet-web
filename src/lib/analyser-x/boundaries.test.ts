import { describe, expect, it } from "vitest";
import { decideReview, factsFromReview } from "./adapter";
import { buildContext } from "./context";
import { decide } from "./decision";
import { FactStore } from "./factstore";
import { BASE, NOW, claimOf, evidence, rv } from "./test-helpers";

const ids = (r: ReturnType<typeof decideReview>) => r.decision.reasons.map((x) => x.ruleId);
const daysAgo = (n: number) => new Date(Date.parse(NOW) - n * 86_400_000).toISOString();

describe("precedence", () => {
  it("Medicinal product beats Look elsewhere: a licensed drug is assessed as a medicine even beside a prohibited ingredient", () => {
    const r = decideReview(rv({ productName: "Anti Dandruff Shampoo", inciIngredients: [...BASE, "Ketoconazole", "Hydroquinone"] }), NOW);
    expect(r.decision.key).toBe("medicinal-product");
  });

  it("Not enough info carries no notes, while a decision that is made does", () => {
    const serum = { productName: "Retinol Night Serum", category: "Serum", inciIngredients: [...BASE, "Retinol"] };
    expect(ids(decideReview(rv(serum), NOW))).toContain("note.retinoid");
    const nei = decideReview(rv({ ...serum, inciIngredients: [], ingredientReads: [] }, evidence.model()), NOW);
    expect(nei.decision.key).toBe("not-enough-info");
    expect(ids(nei).some((x) => x.startsWith("note."))).toBe(false);
  });
});

describe("list reliability", () => {
  it("a retailer-only list (trust 2) cannot support a block", () => {
    const r = decideReview(rv({ inciIngredients: [...BASE, "Hydroquinone"] }, evidence.retailer()), NOW);
    expect(r.decision.key).toBe("not-enough-info");
    expect(ids(r)).toContain("gap.list_blocked");
  });

  it("a list that reads like ad copy is unreliable even from a trusted source", () => {
    const junk = ["Aqua", "Glycerin", "Made with love by people who care deeply about skin and the planet today", "100", "Free from parabens sulphates and silicones for everyone"];
    const r = decideReview(rv({ inciIngredients: junk }), NOW);
    expect(r.decision.key).toBe("not-enough-info");
    expect(ids(r)).toContain("gap.list_unreliable");
  });

  it("a truncated list is unreliable", () => {
    const store = factsFromReview(rv(), NOW);
    store.add({ predicate: "inci.list", subject: "p", value: { ingredients: BASE, source: "pack", truncated: true, sane: true, quote: "Aqua, Glycerin" }, trust: 5, origin: "source", spans: [], derivedFrom: [] });
    const out = decide(buildContext(store, NOW));
    expect(out.decision.key).toBe("not-enough-info");
  });

  it("two sources that disagree make the list unreliable and say so", () => {
    const store = factsFromReview(rv(), NOW);
    store.add({ predicate: "inci.list", subject: "test-product", value: { ingredients: ["Aqua", "Niacinamide", "Glycerin", "Parfum"], source: "brand_page", sane: true, quote: "Aqua, Niacinamide" }, trust: 4, origin: "source", spans: [], derivedFrom: [] });
    const out = decide(buildContext(store, NOW));
    expect(out.decision.key).toBe("not-enough-info");
    expect(out.decision.reasons.map((x) => x.ruleId)).toContain("gap.formula_conflict");
  });

  it("a list our database does not recognise at all has nothing for the screen to check, so nothing is said of it", () => {
    const r = decideReview(rv({ inciIngredients: ["Zorbaflux One", "Zorbaflux Two", "Zorbaflux Three", "Zorbaflux Four"] }), NOW);
    expect(r.decision.key).toBe("not-enough-info");
    expect(ids(r)).toContain("gap.support_insufficient");
    expect(ids(r)).not.toContain("gap.screen_incomplete"); // that rule is gone: coverage is not a reason for the pill
  });

  it("a list our database only partly recognises does not change the pill: coverage sets the confidence and is a note (decision X42)", () => {
    const full = decideReview(rv({ inciIngredients: BASE }), NOW);
    const many = [...BASE, ...Array.from({ length: 12 }, (_, i) => `Zorbaflux ${i + 1}`)];
    const part = decideReview(rv({ inciIngredients: many }), NOW);
    expect(part.decision.key).toBe(full.decision.key);
    expect(part.decision.confidence).toBe("low"); // under half the list was checked
    expect(ids(part)).toContain("note.screen_partial");
    expect(ids(part)).not.toContain("caution.screen_partial");
    expect(ids(part)).not.toContain("gap.screen_incomplete");
    expect(part.settled.filter((f) => f.severity === "gap" || f.severity === "caution").map((f) => f.ruleId)).toEqual(
      full.settled.filter((f) => f.severity === "gap" || f.severity === "caution").map((f) => f.ruleId),
    );
  });

  it("more than half recognised: the pill is unchanged and the confidence is at most Medium", () => {
    const part = decideReview(rv({ inciIngredients: [...BASE, "Zorbaflux One"] }), NOW);
    expect(part.decision.key).toBe(decideReview(rv({ inciIngredients: BASE }), NOW).decision.key);
    expect(part.decision.confidence).not.toBe("high");
    expect(part.decision.confidence).not.toBe("low");
  });
});

describe("thresholds sit where the spec says", () => {
  it("SPF 30 is enough; SPF 29 is not", () => {
    expect(ids(decideReview(rv({ productName: "Daily Sunscreen SPF 30", category: "Sunscreen" }), NOW))).not.toContain("caution.spf_low");
    expect(ids(decideReview(rv({ productName: "Daily Sunscreen SPF 29", category: "Sunscreen" }), NOW))).toContain("caution.spf_low");
  });

  it("the 'evidence last checked' note appears after 180 days, not on the 180th, and never changes the pill", () => {
    expect(ids(decideReview(rv({ reviewedAt: daysAgo(180) }), NOW))).not.toContain("note.freshness");
    const old = decideReview(rv({ reviewedAt: daysAgo(181) }), NOW);
    expect(ids(old)).toContain("note.freshness");
    expect(old.decision.key).toBe("good-choice");
  });

  it("Level 3 on a performance claim is not enough; Level 4 is", () => {
    const perf = (lvl: 1 | 2 | 3 | 4) => rv({ claimMap: [claimOf({ text: "Fades dark spots", types: ["concern"], primaryType: "concern", evidenceLevel: lvl })] });
    expect(ids(decideReview(perf(3), NOW))).toContain("caution.claim_gap");
    expect(ids(decideReview(perf(4), NOW))).not.toContain("caution.claim_gap");
  });
});

describe("claims and wording", () => {
  it("'non-whitening' and 'no white cast' are not fairness claims", () => {
    const r = decideReview(rv({ claimMap: [claimOf({ text: "Non-whitening formula with no white cast", primaryType: "appearance", types: ["appearance"] })] }), NOW);
    expect(ids(r)).not.toContain("block.fairness");
    expect(r.decision.key).not.toBe("look-elsewhere");
  });

  it("a 'contains X' claim is never a contradiction, even when X is absent", () => {
    const r = decideReview(rv({ claimMap: [claimOf({ text: "With Vitamin C", types: ["active"], primaryType: "active", evidenceLevel: 3 })] }), NOW);
    expect(ids(r)).not.toContain("block.contradicted");
  });

  it("SPF labelling is not drug-style wording", () => {
    const r = decideReview(rv({ claimMap: [claimOf({ text: "Broad spectrum SPF 50 PA++++", drugBoundaryRisk: true, primaryType: "functional", types: ["functional"] })] }), NOW);
    expect(ids(r)).not.toContain("caution.boundary");
  });

  it("drug-style wording on an otherwise sound product is a caution, not a block", () => {
    const r = decideReview(rv({ claimMap: [claimOf({ text: "Eliminates dandruff", drugBoundaryRisk: true, primaryType: "concern", types: ["concern"], evidenceLevel: 4 })] }), NOW);
    expect(ids(r)).toContain("caution.boundary");
    expect(r.decision.key).toBe("buy-with-caution");
  });
});

describe("medicinal triggers", () => {
  it("azelaic acid is never a medicine on its own, at any strength: only what the product says makes it one", () => {
    const azelaic = (name: string) => decideReview(rv({ productName: name, inciIngredients: [...BASE, "Azelaic Acid"] }), NOW).decision.key;
    expect(azelaic("Azelaic Acid 20% Gel")).not.toBe("medicinal-product");
    expect(azelaic("Azelaic Acid 10% Serum")).not.toBe("medicinal-product");
    expect(azelaic("Azelaic Acid Serum")).not.toBe("medicinal-product");
    // ... and when the name does carry a prescription notice, it is one
    expect(azelaic("Azelaic Acid 20% Gel (Rx only)")).toBe("medicinal-product");
  });

  it("a prescription notice in the name makes it a medicine; the bare word 'prescription' in marketing copy does not", () => {
    const key = (name: string) => decideReview(rv({ productName: name }), NOW).decision.key;
    expect(key("Tretinoin Cream 0.025% Rx only")).toBe("medicinal-product");
    expect(key("Clindamycin Gel Prescription Required")).toBe("medicinal-product");
    expect(key("Prescription Strength Moisturizer")).not.toBe("medicinal-product");
    expect(key("Dermatologists' most prescribed face wash")).not.toBe("medicinal-product");
    expect(key("Not a prescription drug: Gentle Face Wash")).not.toBe("medicinal-product");
  });

  it("an OTC medicine category is Medicinal whatever the list", () => {
    const r = decideReview(rv({ productName: "Eczema Relief Cream", category: "Eczema cream" }, evidence.model()), NOW);
    expect(r.decision.key).toBe("medicinal-product");
    expect(ids(r)).toContain("med.family");
  });
});

describe("audience rules", () => {
  it("apply only to the audience they name", () => {
    const adult = decideReview(rv({ productName: "Daily Moisturiser", inciIngredients: [...BASE, "Parfum"] }), NOW);
    expect(ids(adult)).not.toContain("caution.audience");
    const baby = decideReview(rv({ productName: "Baby Moisturiser", category: "Baby lotion", inciIngredients: [...BASE, "Parfum"] }), NOW);
    expect(ids(baby)).toContain("caution.audience");
  });
});

describe("Good choice needs every core support", () => {
  it("a product whose screen was never run is Not enough info, not Good choice", () => {
    const full = factsFromReview(rv(), NOW);
    expect(decide(buildContext(full, NOW)).decision.key).toBe("good-choice");
    const noScreen = new FactStore();
    for (const f of full.all()) if (f.predicate !== "screen") noScreen.add(f);
    const out = decide(buildContext(noScreen, NOW));
    expect(out.decision.key).toBe("not-enough-info");
    expect(out.decision.reasons.map((x) => x.ruleId)).toContain("gap.support_insufficient");
  });
});

describe("a conflict hides a block", () => {
  it("a prohibited ingredient in one of two disagreeing lists is a gap, never Look elsewhere", () => {
    const withHq = rv({ inciIngredients: [...BASE, "Hydroquinone"] });
    expect(decideReview(withHq, NOW).decision.key).toBe("look-elsewhere");
    const store = factsFromReview(withHq, NOW);
    store.add({ predicate: "inci.list", subject: "test-product", value: { ingredients: ["Aqua", "Glycerin", "Niacinamide", "Parfum"], source: "brand_page", sane: true, quote: "Aqua, Glycerin, Niacinamide, Parfum" }, trust: 4, origin: "source", spans: [], derivedFrom: [] });
    const out = decide(buildContext(store, NOW));
    expect(out.decision.key).toBe("not-enough-info");
    const found = out.decision.reasons.map((x) => x.ruleId);
    expect(found).toContain("gap.formula_conflict");
    expect(found).toContain("gap.list_blocked");
  });
});

describe("the formula floor", () => {
  const supports = (points: number, overreach = false) => {
    const review = rv({ scores: { ...rv().scores, formulaLogic: points }, formulaLogic: { ...rv().formulaLogic, claimOverreach: overreach } });
    return decide(buildContext(factsFromReview(review, NOW), NOW)).findings.map((f) => f.ruleId);
  };

  it("8 points is a sound formula; 7 is a caution", () => {
    expect(supports(8)).toContain("support.formula_sound");
    expect(supports(8)).not.toContain("caution.formula");
    expect(supports(7)).toContain("caution.formula");
    expect(supports(7)).not.toContain("support.formula_sound");
    expect(supports(0)).not.toContain("support.formula_sound");
  });

  it("a formula that overreaches needs 11 points", () => {
    expect(supports(10, true)).toContain("caution.formula");
    expect(supports(10, true)).not.toContain("support.formula_sound");
    expect(supports(11, true)).toContain("support.formula_sound");
  });
});

describe("how reasons are ordered and what they repeat", () => {
  it("a prohibited ingredient is shown once, not again as 'two areas fall short'", () => {
    const r = decideReview(rv({ productName: "Spot Corrector", category: "Serum", inciIngredients: [...BASE, "Hydroquinone"] }), NOW);
    expect(r.decision.key).toBe("look-elsewhere");
    expect(ids(r)).toContain("block.prohibited");
    expect(ids(r)).not.toContain("block.pillars");
    expect(r.findings.map((f) => f.ruleId)).toContain("block.pillars");
  });

  it("Good choice lists the list first, then the screen, then the claims, then the formula", () => {
    const r = decideReview(rv(), NOW);
    expect(ids(r)).toEqual(["support.list_verified", "support.safety_clear", "support.claims_proportionate", "support.formula_sound"]);
  });

  it("every reason begins with a capital letter", () => {
    for (const review of [rv(), rv({ inciIngredients: [...BASE, "Hydroquinone"] }), rv({ inciIngredients: [...BASE, "Ketoconazole"], productName: "Anti Dandruff Shampoo" })]) {
      for (const reason of decideReview(review, NOW).decision.reasons) expect(reason.text[0]).toBe(reason.text[0].toUpperCase());
    }
  });
});
