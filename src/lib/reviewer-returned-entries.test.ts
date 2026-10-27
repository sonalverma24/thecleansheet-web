import { describe, expect, it } from "vitest";
import { AUTHORITIES, regulationOf, unresolvedIn } from "@/lib/analyser-x/regulatory";
import { isProhibited, lookupIngredient, rowLooksValid } from "@/lib/ingredient-db";

/* Reference entries added from the reviewer questionnaire returned on 2026-10-27 by TCS-P-024. Only the entries rated High or Medium and with no
   product-type condition were added; the rest (the fragrance blend, the two isothiazolinone preservatives and the entries rated Low) wait for a decision. */

const PLAIN = [
  "Glycol Distearate", "Polyhydroxystearic Acid", "Trisodium Ethylenediamine Disuccinate", "Cetearyl Olivate", "Dicaprylyl Carbonate", "Cocamide MEA",
  "Coco-Caprylate/Caprate", "Glyceryl Monostearate", "Laminaria Digitata Extract", "Pentaerythrityl Tetra-di-t-butyl Hydroxyhydrocinnamate", "Polyisobutene",
  "Phospholipids", "Glucose", "Sodium Acrylates Copolymer", "Tetrahexyldecyl Ascorbate",
];

describe("entries returned by the reviewer: no restriction found", () => {
  it.each(PLAIN)("%s is a valid, sourced entry attributed to the reviewer", (name) => {
    const row = lookupIngredient(name)!;
    expect(row, name).toBeDefined();
    expect(rowLooksValid(row)).toBe(true);
    expect(row.Data_Confidence).toMatch(/^(High|Medium)$/);
    expect(row.Source_Reference).toMatch(/EU Reg\. 1223\/2009/);
    expect(row.Verification_Notes).toContain("TCS-P-024");
    expect(row.Last_Updated).toBe("2026-10-27");
    expect(row.Concern_Level_TCS, "the owner's concern rating is not the reviewer's to give").toBe("N/A");
    expect(row.Pregnancy_Restriction).toMatch(/^No specific restriction identified/);
  });

  it.each(PLAIN)("%s is not prohibited and no authority reads it as restricted", (name) => {
    expect(isProhibited(lookupIngredient(name)!)).toBe(false);
    const reg = regulationOf(name, "Test Serum");
    expect(reg.resolved).toBe(true);
    expect(reg.perAuthority.EU.status).toBe("permitted");
    for (const a of AUTHORITIES) expect(["permitted", "not_covered"], `${name} ${a}`).toContain(reg.perAuthority[a].status);
  });

  it("an authority the reviewer did not check stays not covered rather than being read as permitted", () => {
    for (const name of PLAIN) {
      const reg = regulationOf(name, "Test Serum");
      expect(reg.perAuthority.IN.status, name).toBe("not_covered");
      expect(reg.perAuthority.US.status, name).toBe("not_covered");
    }
  });

  it("these names now resolve, so a serum listing them has none left over as 'not in our reference database'", () => {
    expect(unresolvedIn(PLAIN)).toEqual([]);
  });
});

describe("retinol: restricted, with a pregnancy caution, and the stricter figure as the TCS standard", () => {
  const row = lookupIngredient("Retinol")!;

  it("is a valid High-confidence entry attributed to the reviewer", () => {
    expect(rowLooksValid(row)).toBe(true);
    expect(row.Data_Confidence).toBe("High");
    expect(row.Verification_Notes).toContain("TCS-P-024");
    expect(row.Source_Reference).toMatch(/2024\/996.*SCCS\/1639\/21/);
  });

  it("is restricted in the EU, Canada and Australia with limits that depend on use, so none can be checked from a product name alone", () => {
    const reg = regulationOf("Retinol", "Retinol Serum");
    for (const a of ["EU", "CA", "AU"] as const) expect(reg.perAuthority[a].status, a).toBe("restricted_unverifiable");
    for (const a of ["IN", "US", "KR"] as const) expect(reg.perAuthority[a].status, a).toBe("not_covered");
    expect(isProhibited(row)).toBe(false);
  });

  it("records the EU's own limits as law and the stricter 0.05% as the TCS standard, kept apart", () => {
    expect(row.Max_Concentration_EU).toMatch(/0\.05% retinol equivalent \(RE\) in body lotion; 0\.3% RE in other leave-on and rinse-off/);
    expect(row.Key_Safety_Notes).toMatch(/TCS standard \(owner decision, 27 Oct 2026\)/);
    expect(row.Key_Safety_Notes).toMatch(/held to 0\.05% retinol equivalent, face or body/);
    expect(row.Key_Safety_Notes).toMatch(/less strict for non-body leave-on products/);
  });

  it("carries a caution that does not read as 'no restriction', so the pregnancy screen flags it", () => {
    expect(row.Pregnancy_Restriction).toMatch(/^Caution during pregnancy/);
    expect(row.Pregnancy_Restriction).not.toMatch(/^(?:no|none|not)\b/i);
  });
});
