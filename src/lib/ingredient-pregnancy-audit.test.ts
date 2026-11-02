import { describe, expect, it } from "vitest";
import { ALL_INGREDIENTS } from "@/lib/ingredient-utils";
import { ingredientSafety, isProhibited, lookupIngredient, rowLooksValid } from "@/lib/ingredient-db";

/* Reference data audit and owner decision, 2026-11-02 (docs/analyser-decisions.md). One templated sentence, "Caution during pregnancy; endocrine disruption data; precautionary
   avoidance of high-frequency leave-on use", sat on eleven rows, and none of the sources those rows cite says it. The audit found the sentence unsupported; the owner then chose to
   flag every ingredient in the audit lists, each with a one-line reason. The page-level effect is tested in pills-page.test.ts; these tests keep the data itself from drifting. */

const NEUTRAL = "No specific restriction identified in source checked; standard cosmetic use";
const row = (name: string) => ALL_INGREDIENTS.find((r) => r.INCI_Name === name)!;

/** Neutral by decision: the SCCS says the foetus is better protected than a newborn, and the owner did not ask for these two to be flagged. D5 and D6 were fixed on 2026-10-30. */
const NEUTRAL_ROWS = ["Methylparaben", "Ethylparaben", "Cyclopentasiloxane", "Cyclohexasiloxane"];

/** Flagged with a one-line reason that cites a primary source we read. */
const WITH_SOURCE = ["Butylparaben", "BHA (Butylated Hydroxyanisole)", "Eucalyptol", "Benzophenone-3", "Propylparaben", "Benzophenone-4", "Ethylhexyl Methoxycinnamate", "Homosalate"];
/** Flagged with a one-line reason taken from the row's own notes; not checked against a primary source. */
const FROM_ROW_NOTES = [
  "Perillyl Alcohol", "Formaldehyde", "Aminobenzoic Acid", "Disperse Blue 1", "Toluene-2,5-Diamine Sulfate", "Ammonium Persulfate", "Benzophenone-1", "Benzophenone-8",
  "Retinol Acetate", "Tretinoin", "Adapalene", "Tazarotene", "Chlorobutanol", "Thimerosal", "4-Methylbenzylidene Camphor", "Resorcinol", "Salicylic Acid", "Azadirachta Indica Seed Oil",
];
const ONE_LINERS = [...WITH_SOURCE, ...FROM_ROW_NOTES];

describe("the templated pregnancy sentence", () => {
  it("is on no row any more, in either of its two spellings", () => {
    const hits = ALL_INGREDIENTS.filter((r) => /endocrine disruption data[.;]? ?precautionary avoidance of high-frequency leave-on/i.test(r.Pregnancy_Restriction ?? "")).map((r) => r.INCI_Name);
    expect(hits).toEqual([]);
  });

  it("no row's pregnancy text is a bare 'Yes': a chip must say why it is there", () => {
    expect(ALL_INGREDIENTS.filter((r) => /^yes\.?$/i.test((r.Pregnancy_Restriction ?? "").trim())).map((r) => r.INCI_Name)).toEqual([]);
  });

  it.each(NEUTRAL_ROWS)("%s carries the neutral wording and says when and why in its verification notes", (name) => {
    const r = row(name);
    expect(r.Pregnancy_Restriction).toBe(NEUTRAL);
    expect(r.Verification_Notes).toMatch(/Pregnancy caution removed 2026-(10-30|11-02)/);
    expect(["2026-10-30", "2026-11-02"]).toContain(r.Last_Updated);
    expect(ingredientSafety(name).pregnancyRestriction, "the neutral wording is never read as a restriction").toBe(null);
  });
});

describe("the ingredients the owner chose to flag", () => {
  it.each(ONE_LINERS)("%s: a caution that gives its reason in one line, on a row the pregnancy screen will trust", (name) => {
    const r = row(name);
    const text = r.Pregnancy_Restriction ?? "";
    expect(text).toMatch(/^Caution during pregnancy/);
    expect(text, "one sentence").not.toMatch(/\.\s+[A-Z]/);
    expect(text.length).toBeGreaterThan(60);
    expect(text.length).toBeLessThanOrEqual(340);
    expect(rowLooksValid(r)).toBe(true);
    expect(["High", "Medium"], "the pregnancy screen only draws a flag for a High or Medium row").toContain(r.Data_Confidence);
    expect((r.Source_Reference ?? "").trim(), "a flag prints its source").not.toBe("");
    expect(r.Last_Updated).toBe("2026-11-02");
    expect(r.Verification_Notes).toMatch(/2026-11-02/);
    expect(ingredientSafety(name).pregnancyRestriction).toBe(text);
  });

  it.each(WITH_SOURCE)("%s names the opinion it rests on, and the opinion is in its source field", (name) => {
    const r = row(name);
    const cited = /\((SCCS\/\d+\/\d+|EMA\/HMPC\/\d+\/\d+)\)/.exec(r.Pregnancy_Restriction ?? "")?.[1];
    expect(cited, name).toBeDefined();
    expect(r.Source_Reference ?? "").toContain(cited as string);
  });

  it.each(FROM_ROW_NOTES)("%s: the Verification_Notes admit when the reason was not checked against a primary source", (name) => {
    const r = row(name);
    if (name === "Perillyl Alcohol") expect(r.Verification_Notes).toMatch(/no source was found either way/);
    else expect(r.Verification_Notes).toMatch(/not checked against primary sources/);
  });

  it("BHA no longer cites Annex III as the source of its pregnancy text, because the SCCS says BHA is not regulated under the Cosmetics Regulation", () => {
    expect(row("BHA (Butylated Hydroxyanisole)").Source_Reference).not.toMatch(/Annex III/);
  });

  it("an ingredient with no pregnancy-specific finding says so instead of implying one", () => {
    for (const name of ["Formaldehyde", "Aminobenzoic Acid", "Disperse Blue 1", "Toluene-2,5-Diamine Sulfate", "Ammonium Persulfate", "Benzophenone-1", "Benzophenone-8"]) {
      expect(row(name).Pregnancy_Restriction, name).toMatch(/no pregnancy-specific finding is recorded\.$/);
    }
  });
});

describe("D5 and D6 are not in Annex III of the Cosmetics Regulation", () => {
  it.each(["Cyclopentasiloxane", "Cyclohexasiloxane"])("%s: the annex field and the source say REACH Annex XVII entry 70, and the row is still not read as prohibited", (name) => {
    const r = row(name);
    expect(r.EU_Annex).toBe("Not in Annex III of the Cosmetics Regulation; restricted under REACH Annex XVII entry 70");
    expect(r.Source_Reference).toMatch(/^REACH Annex XVII entry 70/);
    expect(r.Source_Reference).not.toMatch(/EU Annex III/);
    // isProhibited reads EU_Annex for a bare "Annex II" (the banned list); naming Annex III to say the row is not on it must not trip that.
    expect(isProhibited(lookupIngredient(name)!)).toBe(false);
    expect(ingredientSafety(name).prohibited).toBe(false);
  });
});
