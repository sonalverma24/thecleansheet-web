import { describe, expect, it } from "vitest";
import { bannedIngredientsInInci, endocrineFlaggedInInci, hasUnnegatedMatch, ingredientSafety, isProhibited, lookupIngredient, readsAsBan, rowLooksValid } from "@/lib/ingredient-db";
import { productScopeOf } from "@/lib/product-scope";
import { buildGlobalScreen } from "@/lib/inci-enrich";
import { ALL_INGREDIENTS, type Ingredient } from "@/lib/ingredient-utils";

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

  it("does not read 'Not listed in Annex II to VI' as being on Annex II (Madecassoside)", () => {
    expect(isProhibited(row({ EU_Annex: "Not listed in Annex II to VI in source checked", EU_Status: "CosIng listed; no EU Annex II to VI restriction identified in source checked" }))).toBe(false);
    expect(isProhibited(row({ EU_Annex: "None" }))).toBe(false);
    expect(isProhibited(row({ EU_Annex: "Not identified" }))).toBe(false);
  });

  it("still flags an Annex field that lists Annex II, with or without other annexes", () => {
    expect(isProhibited(row({ EU_Annex: "Annex II" }))).toBe(true);
    expect(isProhibited(row({ EU_Annex: "Annex II (banned) - entry 1" }))).toBe(true);
    expect(isProhibited(row({ EU_Annex: "Annex III (restricted) / Annex II (banned under oxidative conditions per entry 1309)" }))).toBe(true);
    expect(isProhibited(row({ EU_Annex: "Annex III" }))).toBe(false);
  });

  it("the real Madecassoside row is not prohibited, and no other real row changes its answer", () => {
    expect(isProhibited(lookupIngredient("Madecassoside")!)).toBe(false);
    expect(isProhibited(lookupIngredient("Lawsone")!)).toBe(true);
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

describe("rowLooksValid - a qualified concern level is not column drift", () => {
  it.each(["Low", "Medium", "Moderate", "High", "Very high", "None", "N/A", "Low-Medium", "Low to Medium", "Low (highly refined)", "Low (at correct pH)", "Low (FCF); High phototoxicity (expressed)"])(
    "accepts the concern level %j", (concern) => expect(rowLooksValid(row({ Concern_Level_TCS: concern }))).toBe(true));

  it.each(["Humectant", "Emollient", "Preservative", "Moderately irritating", "2", "Yes"])(
    "still rejects %j in the concern column: a function word or a number there is drift", (concern) => expect(rowLooksValid(row({ Concern_Level_TCS: concern }))).toBe(false));

  it("still rejects a Function of '2' and a messy SVHC flag", () => {
    expect(rowLooksValid(row({ Function: "2" }))).toBe(false);
    expect(rowLooksValid(row({ SVHC_Flag: "Composition-dependent (Yes if D4 is present above 0.1%)" }))).toBe(false);
  });

  it("the only rows the database still distrusts are the three whose SVHC flag is free text (a deliberate gate)", () => {
    expect(ALL_INGREDIENTS.filter((r) => !rowLooksValid(r)).map((r) => r.INCI_Name).sort()).toEqual(["Bisabolol", "Cyclomethicone", "Polyacrylamide"]);
  });

  it("common ingredients that were wrongly distrusted are screened again", () => {
    for (const name of ["Zinc PCA", "Mineral Oil", "Petrolatum", "Triethanolamine", "Sodium Hydroxide", "BHT (Butylated Hydroxytoluene)", "Lactic Acid", "Sodium Laureth Sulfate", "Cocamidopropyl Betaine", "Mica"]) {
      const s = ingredientSafety(name);
      expect(s.found, name).toBe(true);
      expect(s.valid, name).toBe(true);
    }
  });

  it("the authority screen in inci-enrich agrees: a newly trusted row is now read (Triethanolamine is listed as restricted in the EU)", () => {
    expect(buildGlobalScreen(["Aqua", "Glycerin", "Triethanolamine"]).eu_1223_2009).toMatch(/Triethanolamine/i);
  });

  it("repairing the check adds no prohibition and no endocrine flag: it only lets rows be read", () => {
    const previouslyDistrusted = ["Triethanolamine", "Lactic Acid", "Menthol", "Mica", "Zinc PCA", "BHT (Butylated Hydroxytoluene)", "Lanolin"];
    for (const n of previouslyDistrusted) expect(isProhibited(lookupIngredient(n)!), n).toBe(false);
    expect(endocrineFlaggedInInci(previouslyDistrusted)).toEqual([]);
  });
});

describe("lookupIngredient - a colour-index code written beside the INCI name", () => {
  it("resolves 'CI 77891/Titanium Dioxide' to Titanium Dioxide: CI 77891 has no row of its own, the name after the slash is the ingredient", () => {
    expect(lookupIngredient("CI 77891")).toBeUndefined();
    expect(lookupIngredient("CI 77891/Titanium Dioxide")?.INCI_Name).toBe("Titanium Dioxide");
  });

  it("accepts the spellings a label uses for the code and for the separator", () => {
    for (const label of ["Ci 77891/Titanium Dioxide", "C.I. 77891 / Titanium Dioxide", "CI 77891 (Titanium Dioxide)/Titanium Dioxide"]) {
      expect(lookupIngredient(label)?.INCI_Name, label).toBe("Titanium Dioxide");
    }
  });

  it("a code that has its own row keeps that row: 'CI 77491/Iron Oxides' is CI 77491", () => {
    expect(lookupIngredient("CI 77491")?.INCI_Name).toBe("CI 77491");
    expect(lookupIngredient("CI 77491/Iron Oxides")?.INCI_Name).toBe("CI 77491");
  });

  it("the name before the slash still wins, and an ordinary alias pair still resolves by its first part", () => {
    expect(lookupIngredient("Titanium Dioxide/CI 77891")?.INCI_Name).toBe("Titanium Dioxide");
    expect(lookupIngredient("Aqua/Water")).toBeDefined();
  });

  it("does NOT widen the match: only a colour-index code falls through to the later parts", () => {
    // A made-up first part is not a code, so the known ingredient after the slash must not rescue it: a wrong match would mislabel its safety.
    expect(lookupIngredient("Zorbaflux/Titanium Dioxide")).toBeUndefined();
    expect(lookupIngredient("Zorbaflux (CI 77891)/Titanium Dioxide")).toBeUndefined();
    // A code that is neither held nor followed by a known name stays unresolved.
    expect(lookupIngredient("CI 99999/Zorbaflux")).toBeUndefined();
    expect(lookupIngredient("CI 99999")).toBeUndefined();
  });

  it("the safety read follows: Titanium Dioxide written with its code is found and valid, not 'not in the database'", () => {
    const s = ingredientSafety("CI 77891/Titanium Dioxide");
    expect(s.found).toBe(true);
    expect(s.valid).toBe(true);
  });
});

describe("a ban is read by product type (decision X40)", () => {
  const LIPSTICK = productScopeOf("Hydra Creme Lipstick", "Lipstick");
  const FACE_WASH = productScopeOf("Gentle Face Wash", "Cleanser");

  it("Polyethylene is banned in rinse-off products: prohibited in a face wash, not in a lipstick", () => {
    const pe = lookupIngredient("Polyethylene")!;
    expect(isProhibited(pe, FACE_WASH)).toBe(true);
    expect(isProhibited(pe, LIPSTICK)).toBe(false);
    expect(isProhibited(pe)).toBe(true); // no product given: today's reading
    expect(bannedIngredientsInInci(["Polyethylene"], FACE_WASH).map((b) => b.name)).toEqual(["Polyethylene"]);
    expect(bannedIngredientsInInci(["Polyethylene"], LIPSTICK)).toEqual([]);
  });

  it("an unscoped ban is a ban for every product", () => {
    for (const scope of [LIPSTICK, FACE_WASH]) expect(bannedIngredientsInInci(["Formaldehyde"], scope).map((b) => b.name)).toEqual(["Formaldehyde"]);
  });
});

describe("readsAsBan", () => {
  it.each([
    ["Banned", true],
    ["EU BANNED in rinse-off products (microplastic regulation)", true],
    ["Prohibited in cosmetics (EU Annex II); permitted only as a regulated drug.", true],
    ["Permitted but restricted; EU Annex II (prohibited) applies above 0.1%", true],
    ["Permitted; not banned in any jurisdiction", false],
    ["Not restricted or prohibited", false],
    // the negation comes after the word: the sentence says the ingredient is NOT on the list
    ["Permitted but restricted; EU Annex II (prohibited) does not list polyacrylamide itself, but EU Regulation 1223/2009 specifies residue limits", false],
    // a hedge has not said banned
    ["Restricted or banned (check CPCB)", false],
    ["Banned or restricted depending on the product", false],
    ["", false],
  ] as const)("%s", (text, want) => {
    expect(readsAsBan(text)).toBe(want);
  });
});
