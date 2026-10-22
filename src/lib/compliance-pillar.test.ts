import { describe, expect, it } from "vitest";
import { COMPLIANCE_ITEMS, COMPLIANCE_PILLAR, complianceChecks, isRegulatoryClear, regulatoryFlagged, type ComplianceInput } from "@/lib/compliance-pillar";
import { gradePillar } from "@/lib/pillar-grade";

const base: ComplianceInput = {
  usageWarningsClear: true, hasInci: true, bannedCount: 0, globalScreen: { eu: "No restriction", india: "No issues" },
  asciConcernClaims: 0, claimsAnalysed: 5, claimsOutcome: "none",
};
const by = (i: ComplianceInput) => Object.fromEntries(complianceChecks(i).map((c) => [c.label, c]));

describe("complianceChecks", () => {
  it("returns exactly the four named items, all in the Standards & Compliance pillar", () => {
    const cs = complianceChecks(base);
    expect(cs.map((c) => c.label)).toEqual([...COMPLIANCE_ITEMS]);
    expect(cs.every((c) => c.pillar === COMPLIANCE_PILLAR)).toBe(true);
  });

  it("is all verified for a clean product, so the pillar scores 100", () => {
    const cs = complianceChecks(base);
    expect(cs.map((c) => c.state)).toEqual(["verified", "verified", "verified", "verified"]);
    expect(gradePillar(COMPLIANCE_PILLAR, cs).score).toBe(100);
  });

  it("label compliance reads not-disclosed, never adverse, when warnings are unclear", () => {
    expect(by({ ...base, usageWarningsClear: false })["Label compliance"].state).toBe("not-disclosed");
  });

  describe("regulatory screen", () => {
    it("a banned ingredient is a hard adverse that fails the pillar", () => {
      const c = by({ ...base, bannedCount: 1 })["Regulatory screen"];
      expect(c).toMatchObject({ state: "adverse", hard: true });
      expect(gradePillar(COMPLIANCE_PILLAR, complianceChecks({ ...base, bannedCount: 1 })).hardFail).toBe(true);
    });
    it("a restricted-but-legal reading is a soft adverse", () => {
      const c = by({ ...base, globalScreen: { eu: "Restricted: max 0.5%", india: "No issues" } })["Regulatory screen"];
      expect(c.state).toBe("adverse");
      expect(c.hard).toBeUndefined();
    });
    it("with no ingredient list the screen could not run, which is not-disclosed, never clear", () => {
      expect(by({ ...base, hasInci: false })["Regulatory screen"].state).toBe("not-disclosed");
      expect(by({ ...base, globalScreen: null })["Regulatory screen"].state).toBe("not-disclosed");
    });
    it("a banned ingredient wins over everything else", () => {
      expect(by({ ...base, bannedCount: 2, hasInci: false, globalScreen: null })["Regulatory screen"]).toMatchObject({ state: "adverse", hard: true });
    });
  });

  describe("ASCI screen and claims screen", () => {
    it("are not-applicable, and so left out of the score, when no claims were analysed", () => {
      const b = by({ ...base, claimsAnalysed: 0 });
      expect(b["ASCI screen"].state).toBe("not-applicable");
      expect(b["Claims screen"].state).toBe("not-applicable");
    });
    it("an ASCI concern is a soft adverse", () => {
      const c = by({ ...base, asciConcernClaims: 2 })["ASCI screen"];
      expect(c.state).toBe("adverse");
      expect(c.hard).toBeUndefined();
    });
    it("a contradicted or fairness claim is a hard adverse; drug-boundary wording is soft", () => {
      expect(by({ ...base, claimsOutcome: "hard" })["Claims screen"]).toMatchObject({ state: "adverse", hard: true });
      const soft = by({ ...base, claimsOutcome: "boundary" })["Claims screen"];
      expect(soft.state).toBe("adverse");
      expect(soft.hard).toBeUndefined();
    });
  });

  it("grades a mixed case: one soft adverse out of four lowers the pillar by a quarter", () => {
    const g = gradePillar(COMPLIANCE_PILLAR, complianceChecks({ ...base, asciConcernClaims: 1 }));
    expect(g.hardFail).toBe(false);
    expect(g.score).toBe(75);
  });
});

describe("regulatory clear test (mirrors the scorecard)", () => {
  it("treats blank, 'No ...', 'no obvious' and 'not triggered' as clear and anything else as flagged", () => {
    for (const v of ["", "No concerns", "none: no obvious restriction", "Not triggered", undefined]) expect(isRegulatoryClear(v)).toBe(true);
    for (const v of ["Restricted", "Prohibited in EU", "Concentration limit applies"]) expect(isRegulatoryClear(v)).toBe(false);
  });
  it("counts the authorities that are not clear", () => {
    expect(regulatoryFlagged({ a: "No issue", b: "Restricted", c: "Prohibited", d: "" })).toBe(2);
    expect(regulatoryFlagged(null)).toBe(0);
  });
});
