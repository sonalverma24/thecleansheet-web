import { describe, expect, it } from "vitest";
import { ALL_INGREDIENTS } from "@/lib/ingredient-utils";
import { ingredientSafety, isProhibited, lookupIngredient } from "@/lib/ingredient-db";

/* Reference data audit, 2026-11-02 (docs/analyser-decisions.md). One templated sentence, "Caution during pregnancy; endocrine disruption data; precautionary avoidance of
   high-frequency leave-on use", sat on eleven rows, and none of the sources those rows cite says it. The page-level effect is tested in pills-page.test.ts; these tests
   keep the data itself from drifting back. */

const NEUTRAL = "No specific restriction identified in source checked; standard cosmetic use";
const REMOVED = ["Methylparaben", "Ethylparaben", "Propylparaben", "Perillyl Alcohol", "Benzophenone-4", "Ethylhexyl Methoxycinnamate", "Homosalate", "Cyclopentasiloxane", "Cyclohexasiloxane"];
const REWORDED = ["Butylparaben", "BHA (Butylated Hydroxyanisole)", "Eucalyptol", "Benzophenone-3"];
const row = (name: string) => ALL_INGREDIENTS.find((r) => r.INCI_Name === name)!;

describe("the templated pregnancy sentence", () => {
  it("is on no row any more, in either of its two spellings", () => {
    const hits = ALL_INGREDIENTS.filter((r) => /endocrine disruption data[.;]? ?precautionary avoidance of high-frequency leave-on/i.test(r.Pregnancy_Restriction ?? "")).map((r) => r.INCI_Name);
    expect(hits).toEqual([]);
  });

  it.each(REMOVED)("%s carries the neutral wording and says when and why in its verification notes", (name) => {
    const r = row(name);
    expect(r.Pregnancy_Restriction).toBe(NEUTRAL);
    expect(r.Verification_Notes).toMatch(/Pregnancy caution removed 2026-(10-30|11-02)/);
    expect(["2026-10-30", "2026-11-02"]).toContain(r.Last_Updated);
    expect(ingredientSafety(name).pregnancyRestriction, "the neutral wording is never read as a restriction").toBe(null);
  });
});

describe("the four cautions that stand", () => {
  it.each(REWORDED)("%s opens as a caution, names an SCCS or EMA source, and says what the source found", (name) => {
    const r = row(name);
    expect(r.Pregnancy_Restriction).toMatch(/^Caution during pregnancy is precautionary only: /);
    expect(r.Pregnancy_Restriction).toMatch(/\((SCCS\/\d+\/\d+|EMA\/HMPC\/\d+\/\d+)\)/);
    expect(r.Source_Reference).toMatch(/SCCS\/\d+\/\d+|EMA\/HMPC\/\d+\/\d+/);
    expect(r.Verification_Notes).toMatch(/Pregnancy wording replaced 2026-11-02/);
    expect(r.Last_Updated).toBe("2026-11-02");
    expect(["High", "Medium"], "the pregnancy screen only draws a flag for a High or Medium row").toContain(r.Data_Confidence);
  });

  it("BHA no longer cites Annex III as the source of its pregnancy text, because the SCCS says BHA is not regulated under the Cosmetics Regulation", () => {
    expect(row("BHA (Butylated Hydroxyanisole)").Source_Reference).not.toMatch(/Annex III/);
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
