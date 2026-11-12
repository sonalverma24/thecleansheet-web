import { describe, expect, it } from "vitest";
import { decideReview } from "./adapter";
import { CARCINOGEN_IARC_RE } from "./kb";
import { isHedgedClaim } from "./ladder";
import { checkInvariants } from "./invariants";
import { lint } from "./copy";
import { CLAIMS_GREEN_FROM, meetsGreen, reviewSections, rowsShortOfGreen, safetyMarker, weakRows } from "./sections";
import { BASE, NOW, claimOf, evidence, notAllGreen, rv } from "./test-helpers";

/* The new logic for Green, Yellow and Red, from the owner on 2026-11-04.
   Green: Ingredient safety, Formula logic, Claims evidence (from 70%) and Consumer clarity Strong, Test transparency Fair or Strong.
   Red: a hormone disruptor (octinoxate, oxybenzone, BHA, D4), a carcinogen, a banned ingredient or percentage, a sunscreen with no UV filter, or two weak rows.
   Everything in between is Yellow. Grey is not rated (a medicine, no full information, tools and supplements). "Helps with / supports" claims need no test of their
   own when the formula supports them; "repairs / treats / heals" do. */

const ids = (r: ReturnType<typeof decideReview>) => r.decision.reasons.map((x) => x.ruleId);
const scores = (over: Partial<ReturnType<typeof rv>["scores"]>) => ({ ...rv().scores, ...over });
const tested = claimOf({ text: "Visibly evens skin tone", types: ["appearance"], primaryType: "appearance", evidenceLevel: 4 });

describe("Green is the five rows", () => {
  it("is Good choice when Safety, Formula, Claims and Clarity are Strong and Test transparency is Fair", () => {
    const r = decideReview(rv({ claimMap: [tested] }), NOW);
    expect(r.ctx.sections).toMatchObject({ formula: "green", claims: "green", tests: "yellow", clarity: "green" });
    expect(r.decision.key).toBe("good-choice");
    expect(checkInvariants(r.decision, r.settled, r.ctx)).toEqual([]);
  });

  it("Claims evidence is Strong from 70%: 14 of 20 is, 13 is not", () => {
    expect(CLAIMS_GREEN_FROM).toBe(70);
    expect(reviewSections(rv({ scores: scores({ claimEvidence: 14 }) })).claims).toBe("green");
    expect(reviewSections(rv({ scores: scores({ claimEvidence: 13 }) })).claims).toBe("yellow");
    expect(decideReview(rv({ claimMap: [tested], scores: scores({ claimEvidence: 14 }) }), NOW).decision.key).toBe("good-choice");
    expect(decideReview(rv({ claimMap: [tested], scores: scores({ claimEvidence: 13 }) }), NOW).decision.key).toBe("buy-with-caution");
  });

  it("the other percentage rows stay Strong from 75%", () => {
    expect(reviewSections(rv({ scores: scores({ formulaLogic: 11 }) })).formula).toBe("yellow"); // 73%
    expect(reviewSections(rv({ scores: scores({ formulaLogic: 12 }) })).formula).toBe("green"); // 80%
    expect(reviewSections(rv({ scores: scores({ claimClarity: 11 }) })).clarity).toBe("yellow");
    expect(reviewSections(rv({ scores: scores({ claimClarity: 12 }) })).clarity).toBe("green");
  });

  it("a row short of Strong makes it Buy with caution, and the reason names the row", () => {
    const r = decideReview(rv({ claimMap: [tested], scores: scores({ claimClarity: 9 }) }), NOW);
    expect(r.decision.key).toBe("buy-with-caution");
    const reason = r.decision.reasons.find((x) => x.ruleId === "caution.rows")!;
    expect(reason.text).toBe("Not every area of our checks is Strong yet: Consumer clarity.");
    expect(lint(reason.text).problems).toEqual([]);
    expect(checkInvariants(r.decision, r.settled, r.ctx)).toEqual([]);
  });

  it("names several rows in page order", () => {
    const r = decideReview(rv({ claimMap: [tested], scores: scores({ formulaLogic: 10, claimClarity: 9 }) }), NOW);
    expect(r.decision.reasons.find((x) => x.ruleId === "caution.rows")?.text).toBe("Not every area of our checks is Strong yet: Formula logic and Consumer clarity.");
  });

  it("the helpers read the rows the same way", () => {
    const strong = { safety: "green", formula: "green", claims: "green", tests: "yellow", clarity: "green" } as const;
    expect(meetsGreen(strong)).toBe(true);
    expect(meetsGreen({ ...strong, tests: "red" })).toBe(false);
    expect(meetsGreen({ ...strong, safety: "yellow" })).toBe(false);
    expect(rowsShortOfGreen({ ...strong, tests: "red", clarity: "yellow" })).toEqual(["Test transparency", "Consumer clarity"]);
    expect(weakRows({ ...strong, formula: "red", claims: "red" })).toEqual(["Formula logic", "Claims evidence"]);
  });

  it("flags that are not rows still hold a product at Yellow: SPF below 30 on a sunscreen that lists a filter", () => {
    const r = decideReview(rv({ productName: "Daily Sunscreen SPF 20", category: "Sunscreen", inciIngredients: [...BASE, "Zinc Oxide"], claimMap: [tested] }), NOW);
    expect(ids(r)).toContain("caution.spf_low");
    expect(r.decision.key).toBe("buy-with-caution");
  });
});

describe("a claim that only 'helps with' or 'supports' needs no test when the formula supports it", () => {
  it.each([
    ["Helps with dark spots", true],
    ["Can support the skin barrier", true],
    ["Supports a more even tone", true],
    ["Repairs dark spots", false],
    ["Treats acne", false],
    ["Heals dry skin", false],
    ["Reduces wrinkles by 40%", false],
    ["Clinically proven to help reduce wrinkles", false],
  ])("%s: hedged is %s", (text, hedged) => {
    expect(isHedgedClaim(text)).toBe(hedged);
  });

  const claim = (text: string) => claimOf({ text, types: ["concern"], primaryType: "concern", evidenceLevel: 2, corroborated: undefined });

  it("a hedged concern claim with no test raises no claim gap", () => {
    const r = decideReview(rv({ claimMap: [tested, claim("Helps with dark spots")], ...notAllGreen() }), NOW);
    expect(r.findings.map((f) => f.ruleId)).not.toContain("caution.claim_gap");
  });

  it("the same wording as a promise ('Repairs') does", () => {
    const r = decideReview(rv({ claimMap: [tested, claim("Repairs dark spots")], ...notAllGreen() }), NOW);
    expect(r.findings.map((f) => f.ruleId)).toContain("caution.claim_gap");
  });

  it("only when the formula supports it: a weak formula keeps the claim gap", () => {
    const r = decideReview(rv({ claimMap: [tested, claim("Helps with dark spots")], scores: scores({ formulaLogic: 5 }) }), NOW);
    expect(r.findings.map((f) => f.ruleId)).toContain("caution.claim_gap");
  });
});

describe("Red: a hormone disruptor", () => {
  it.each([
    ["Benzophenone-3", "Benzophenone-3"],
    ["BHA", "BHA (Butylated Hydroxyanisole)"],
    ["Cyclotetrasiloxane", "Cyclotetrasiloxane"],
  ])("%s is Look elsewhere", (entry, named) => {
    const r = decideReview(rv({ claimMap: [tested], inciIngredients: [...BASE, entry] }), NOW);
    expect(r.decision.key).toBe("look-elsewhere");
    expect(r.decision.reasons.find((x) => x.ruleId === "block.endocrine")?.evidence?.ingredient).toBe(named);
    expect(r.decision.reasons.find((x) => x.ruleId === "block.endocrine")?.text).toMatch(/is flagged as a hormone disruptor\. Found in the ingredient list read/);
    expect(ids(r)).not.toContain("note.endocrine"); // not repeated as "legal at its permitted level"
    expect(checkInvariants(r.decision, r.settled, r.ctx)).toEqual([]);
  });

  it("octinoxate is a Red for harm to marine life, never called a hormone disruptor (owner decision, 2026-11-04)", () => {
    for (const entry of ["Ethylhexyl Methoxycinnamate", "Octinoxate"]) {
      const r = decideReview(rv({ claimMap: [tested], inciIngredients: [...BASE, entry] }), NOW);
      expect(r.decision.key, entry).toBe("look-elsewhere");
      const reason = r.decision.reasons.find((x) => x.ruleId === "block.marine");
      expect(reason?.text, entry).toMatch(/linked to harm to marine life, including coral reefs\. Found in the ingredient list read/);
      expect(reason?.text, entry).toMatch(entry === "Octinoxate" ? /^Octinoxate is a UV filter/ : /^Ethylhexyl Methoxycinnamate \(octinoxate\) is a UV filter/);
      expect(ids(r), entry).not.toContain("block.endocrine");
      expect(ids(r), entry).not.toContain("note.endocrine");
      expect(JSON.stringify(r.decision), entry).not.toMatch(/hormone|endocrine/i);
      expect(checkInvariants(r.decision, r.settled, r.ctx)).toEqual([]);
    }
  });

  it("amiloxate and Polysilicone-15 are not octinoxate", () => {
    for (const entry of ["Isoamyl p-Methoxycinnamate", "Polysilicone-15"]) {
      expect(ids(decideReview(rv({ claimMap: [tested], inciIngredients: [...BASE, entry] }), NOW)), entry).not.toContain("block.marine");
    }
  });

  it("the silicones D5 and D6 stay a caution: their flag is mostly about persisting in water", () => {
    for (const entry of ["Cyclopentasiloxane", "Cyclohexasiloxane"]) {
      const r = decideReview(rv({ claimMap: [tested], inciIngredients: [...BASE, entry] }), NOW);
      expect(ids(r), entry).not.toContain("block.endocrine");
      expect(r.decision.key, entry).not.toBe("look-elsewhere");
    }
  });

  it("the other flagged ingredients (parabens, homosalate) are not on the Red list until the owner names them", () => {
    for (const entry of ["Methylparaben", "Propylparaben", "Homosalate"]) {
      expect(ids(decideReview(rv({ claimMap: [tested], inciIngredients: [...BASE, entry] }), NOW)), entry).not.toContain("block.endocrine");
    }
  });

  it("is a gap, not a Red, when the list cannot be verified", () => {
    const r = decideReview(rv({ claimMap: [tested], inciIngredients: [...BASE, "Benzophenone-3"] }, evidence.model()), NOW);
    expect(r.decision.key).toBe("not-enough-info");
  });
});

describe("Red: a carcinogen, a banned ingredient or percentage", () => {
  it("reads the database's own IARC group, anchored to the start of the field", () => {
    expect(CARCINOGEN_IARC_RE.test("Group 1")).toBe(true);
    expect(CARCINOGEN_IARC_RE.test("Group 2A (probably carcinogenic to humans)")).toBe(true);
    expect(CARCINOGEN_IARC_RE.test("Group 2B")).toBe(false);
    expect(CARCINOGEN_IARC_RE.test("Not classified")).toBe(false);
    expect(CARCINOGEN_IARC_RE.test("Acrylamide monomer: Group 2A (probably carcinogenic to humans); polyacrylamide polymer: Not classified")).toBe(false);
  });

  it("polyacrylamide, a common thickener whose monomer residue is classed, is not a Red", () => {
    const r = decideReview(rv({ claimMap: [tested], inciIngredients: [...BASE, "Polyacrylamide"] }), NOW);
    expect(ids(r)).not.toContain("block.carcinogen");
  });

  it("an ingredient that is already prohibited is one block, not two", () => {
    const r = decideReview(rv({ claimMap: [tested], inciIngredients: [...BASE, "Formaldehyde"] }), NOW);
    expect(r.decision.key).toBe("look-elsewhere");
    expect(r.findings.filter((f) => f.ruleId === "block.prohibited" || f.ruleId === "block.carcinogen").map((f) => f.ruleId)).toEqual(["block.prohibited"]);
  });
});

describe("Red: a banned percentage", () => {
  it("a strength the product states above a limit the EU or India sets is Look elsewhere", () => {
    const r = decideReview(rv({ productName: "Zinc Pyrithione 2% Anti Dandruff Shampoo", category: "Shampoo", claimMap: [tested], inciIngredients: [...BASE, "Zinc Pyrithione"] }), NOW);
    expect(r.decision.key).toBe("look-elsewhere");
    const reason = r.decision.reasons.find((x) => x.ruleId === "block.over_limit")!;
    expect(reason.text).toBe("Zinc Pyrithione is stated at 2%, above the 1% limit set by India.");
    expect(reason.evidence?.ingredient).toBe("Zinc Pyrithione");
    expect(lint(reason.text).problems).toEqual([]);
    expect(checkInvariants(r.decision, r.settled, r.ctx)).toEqual([]);
  });

  it("a strength within the limit is not", () => {
    const r = decideReview(rv({ productName: "Zinc Pyrithione 1% Anti Dandruff Shampoo", category: "Shampoo", claimMap: [tested], inciIngredients: [...BASE, "Zinc Pyrithione"] }), NOW);
    expect(ids(r)).not.toContain("block.over_limit");
  });

  it("a limit that depends on the use is not read as a ban: a 5% salicylic acid serum is not Red for 'preservative use up to 0.5%'", () => {
    const r = decideReview(rv({ productName: "5% Salicylic Acid Serum", category: "Serum", claimMap: [tested], inciIngredients: [...BASE, "Salicylic Acid"] }), NOW);
    expect(ids(r)).not.toContain("block.over_limit");
    expect(r.decision.key).not.toBe("look-elsewhere");
  });
});

describe("Red: a sunscreen with no UV filter in its list", () => {
  const sunscreen = (inci: string[], over: Parameters<typeof rv>[0] = {}) => rv({ productName: "Daily Sunscreen SPF 50", category: "Sunscreen", inciIngredients: inci, claimMap: [tested], ...over });

  it("is Look elsewhere on its own, in words a shopper can read", () => {
    const r = decideReview(sunscreen(BASE), NOW);
    expect(r.decision.key).toBe("look-elsewhere");
    const reason = r.decision.reasons.find((x) => x.ruleId === "block.no_uv_filter")!;
    expect(reason.text).toBe("This is sold as an SPF 50 sunscreen, but its ingredient list shows no UV filter.");
    expect(lint(reason.text).problems).toEqual([]);
    expect(checkInvariants(r.decision, r.settled, r.ctx)).toEqual([]);
  });

  it("is not a Red when the list shows a filter, mineral or chemical", () => {
    expect(ids(decideReview(sunscreen([...BASE, "Zinc Oxide"]), NOW))).not.toContain("block.no_uv_filter");
    expect(ids(decideReview(sunscreen([...BASE, "Ethylhexyl Salicylate"]), NOW))).not.toContain("block.no_uv_filter");
  });

  it("only when the name states an SPF: a 'sunscreen remover' or a moisturiser is not judged by it", () => {
    expect(ids(decideReview(rv({ productName: "Sunscreen Remover Cleansing Oil", category: "Cleanser", claimMap: [tested] }), NOW))).not.toContain("block.no_uv_filter");
    expect(ids(decideReview(rv({ productName: "Daily Moisturiser", category: "Moisturizer", claimMap: [tested] }), NOW))).not.toContain("block.no_uv_filter");
  });

  it("is a gap, not a Red, when the list cannot be verified or there is none", () => {
    expect(decideReview(sunscreen(BASE), NOW, {}).decision.key).toBe("look-elsewhere");
    expect(decideReview(sunscreen([], { ingredientReads: [] }), NOW).decision.key).toBe("not-enough-info");
  });
});

describe("Red: two weak rows", () => {
  const weakFormulaAndClaims = scores({ formulaLogic: 5, claimEvidence: 6 }); // 33% and 30%

  it("two weak rows are Look elsewhere, and the reason names them", () => {
    const r = decideReview(rv({ claimMap: [tested], scores: weakFormulaAndClaims }), NOW);
    expect(r.decision.key).toBe("look-elsewhere");
    const reason = r.decision.reasons.find((x) => x.ruleId === "block.rows")!;
    expect(reason.text).toBe("Two areas of our checks are weak: Formula logic and Claims evidence. Details are below.");
    expect(lint(reason.text).problems).toEqual([]);
    expect(checkInvariants(r.decision, r.settled, r.ctx)).toEqual([]);
  });

  it("one weak row alone is Yellow", () => {
    const r = decideReview(rv({ claimMap: [tested], scores: scores({ claimEvidence: 6 }) }), NOW);
    expect(r.decision.key).toBe("buy-with-caution");
    expect(ids(r)).not.toContain("block.rows");
  });

  it("clarity counts as a weak row only when it is weak, not merely Fair", () => {
    expect(decideReview(rv({ claimMap: [tested], scores: scores({ claimEvidence: 6, claimClarity: 9 }) }), NOW).decision.key).toBe("buy-with-caution");
    expect(decideReview(rv({ claimMap: [tested], scores: scores({ claimEvidence: 6, claimClarity: 5 }) }), NOW).decision.key).toBe("look-elsewhere");
  });

  it("with no claim at all there is nothing to rate: two empty rows are not two failures", () => {
    const r = decideReview(rv({ claimMap: [], scores: weakFormulaAndClaims }), NOW);
    expect(ids(r)).not.toContain("block.rows");
  });

  it("is a gap, not a Red, when the list cannot be verified", () => {
    expect(decideReview(rv({ claimMap: [tested], scores: weakFormulaAndClaims }, evidence.model()), NOW).decision.key).toBe("not-enough-info");
  });
});

describe("the Ingredient safety row on a page that is Red for another reason", () => {
  const settled = (...extra: string[]) => new Set(["support.safety_clear", ...extra]);

  it("stays about the ingredients: a missing UV filter or two weak rows do not make it Concern", () => {
    expect(safetyMarker({ key: "look-elsewhere", settled: settled("block.no_uv_filter"), screenCoverage: 1 })).toBe("green");
    expect(safetyMarker({ key: "look-elsewhere", settled: settled("block.rows"), screenCoverage: 1 })).toBe("green");
  });

  it("is Concern for an ingredient block, for a fairness claim and for two failing pillars, as before", () => {
    for (const id of ["block.prohibited", "block.endocrine", "block.marine", "block.carcinogen", "block.over_limit", "block.fairness", "block.pillars"]) {
      expect(safetyMarker({ key: "look-elsewhere", settled: settled(id), screenCoverage: 1 }), id).toBe("red");
    }
  });
});
