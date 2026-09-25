import { describe, expect, it } from "vitest";
import { endocrineFlaggedInInci, hasUnnegatedMatch, isProhibited, lookupIngredient } from "@/lib/ingredient-db";
import type { Ingredient } from "@/lib/ingredient-utils";

describe("hasUnnegatedMatch - shared negation-aware trigger scan", () => {
  const triggers = /\b(prohibited|banned|restricted)\b|annex\s*ii\b/;

  it("ignores a trigger word inside its own negated clause", () => {
    expect(hasUnnegatedMatch("Permitted; listed in EU CosIng; not restricted or prohibited", triggers)).toBe(false);
  });

  it("catches a trigger word with no negation in its clause", () => {
    expect(hasUnnegatedMatch("Prohibited in cosmetics (EU Annex II)", triggers)).toBe(true);
  });

  it("catches a trigger as the very first word (no preceding clause at all)", () => {
    expect(hasUnnegatedMatch("Restricted preservative - permitted only in specific products at low levels", triggers)).toBe(true);
  });

  it("negation in an earlier, unrelated clause does not suppress a later real hit", () => {
    expect(hasUnnegatedMatch("Not fragranced; banned in leave-on products since 2022", triggers)).toBe(true);
  });

  it("empty/undefined text never matches", () => {
    expect(hasUnnegatedMatch(undefined, triggers)).toBe(false);
    expect(hasUnnegatedMatch("", triggers)).toBe(false);
  });
});

/* Minimal valid row satisfying rowLooksValid() (Concern_Level_TCS,
   SVHC_Flag and Function are the fields that gate trust). */
function row(overrides: Partial<Ingredient>): Ingredient {
  return {
    INCI_Name: "Test Ingredient",
    CAS_Number: "",
    EC_Number: "",
    Chemical_Name: "",
    Function: "Skin conditioning",
    Category_Code: "",
    Category_Name: "",
    Ingredient_Origin: "",
    Concern_Level_TCS: "Low",
    EU_Status: "",
    EU_Annex: "",
    India_Status: "",
    US_FDA_Status: "",
    Korea_Status: "",
    Vegan: "",
    Natural_ISO16128: "",
    SVHC_Flag: "No",
    CMR_Flag: "",
    Allergen_Flag: "",
    Endocrine_Flag: "",
    Max_Concentration_EU: "",
    Max_Concentration_India: "",
    Format_Restriction: "",
    Baby_Restriction: "",
    Common_Products: "",
    Key_Safety_Notes: "",
    TCS_Evaluator_Flag: "",
    Source_Reference: "",
    Last_Updated: "",
    ...overrides,
  };
}

describe("isProhibited - negation handling", () => {
  it("does not flag a status that negates 'prohibited' in its own clause", () => {
    expect(isProhibited(row({ EU_Status: "Permitted; listed in EU CosIng; not restricted or prohibited" }))).toBe(false);
  });

  it("does not flag a status that negates 'banned'", () => {
    expect(isProhibited(row({ EU_Status: "Permitted; not banned in any jurisdiction" }))).toBe(false);
  });

  it("does not flag India status phrased as 'not listed or restricted'", () => {
    expect(isProhibited(row({ India_Status: "Not specifically listed or restricted under Cosmetics Rules 2020; permitted by omission" }))).toBe(false);
  });

  it("flags a genuinely prohibited EU status", () => {
    expect(isProhibited(row({ EU_Status: "Prohibited in cosmetics (EU Annex II); permitted only as a regulated drug." }))).toBe(true);
  });

  it("flags a genuinely banned status", () => {
    expect(isProhibited(row({ EU_Status: "Banned for use in leave-on cosmetics since 2022." }))).toBe(true);
  });

  it("flags when 'prohibited' appears in a later, unnegated clause", () => {
    expect(isProhibited(row({ EU_Status: "Permitted but restricted; EU Annex II (prohibited) applies above 0.1%" }))).toBe(true);
  });

  it("flags EU_Annex II regardless of status wording", () => {
    expect(isProhibited(row({ EU_Annex: "II", EU_Status: "See annex" }))).toBe(true);
  });

  it("does not flag EU_Annex III (restricted, not prohibited)", () => {
    expect(isProhibited(row({ EU_Annex: "III", EU_Status: "Permitted with restrictions" }))).toBe(false);
  });

  it("never trusts an invalid row, even with prohibited-looking text", () => {
    expect(isProhibited(row({ Concern_Level_TCS: "2", EU_Status: "Prohibited in cosmetics" }))).toBe(false);
  });
});

describe("isProhibited - real database regression cases", () => {
  it("Tripeptide-1 is not prohibited (the Moxie Beauty false-positive)", () => {
    const r = lookupIngredient("Tripeptide-1");
    expect(r).toBeDefined();
    expect(isProhibited(r!)).toBe(false);
  });

  it("Palmitoyl Oligopeptide is not prohibited (same phrasing bug)", () => {
    const r = lookupIngredient("Palmitoyl Oligopeptide");
    expect(r).toBeDefined();
    expect(isProhibited(r!)).toBe(false);
  });

  it("Formaldehyde is still correctly banned (EU Annex II)", () => {
    const r = lookupIngredient("Formaldehyde");
    expect(r).toBeDefined();
    expect(isProhibited(r!)).toBe(true);
  });

  it("Thimerosal is still correctly banned (mercury compound, EU Annex II)", () => {
    const r = lookupIngredient("Thimerosal");
    expect(r).toBeDefined();
    expect(isProhibited(r!)).toBe(true);
  });

  it("Polyacrylamide's messy SVHC_Flag free text keeps the row untrusted (rowLooksValid gate, unrelated to negation fix)", () => {
    const r = lookupIngredient("Polyacrylamide");
    expect(r).toBeDefined();
    expect(isProhibited(r!)).toBe(false);
  });
});

describe("endocrineFlaggedInInci - the Minimalist Vitamin B5 regression", () => {
  it("flags Cyclopentasiloxane (D5), a permitted-but-endocrine-flagged silicone", () => {
    const hits = endocrineFlaggedInInci(["Water", "Cyclopentasiloxane", "Panthenol"]);
    expect(hits.map((h) => h.name)).toContain("Cyclopentasiloxane");
  });

  it("returns nothing for an INCI list with no endocrine-flagged ingredient", () => {
    expect(endocrineFlaggedInInci(["Water", "Glycerin", "Panthenol"])).toEqual([]);
  });

  it("does not double-report the same ingredient twice", () => {
    const hits = endocrineFlaggedInInci(["Cyclopentasiloxane", "Water", "Cyclopentasiloxane"]);
    expect(hits.length).toBe(1);
  });
});
