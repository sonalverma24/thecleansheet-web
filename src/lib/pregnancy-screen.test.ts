import { describe, expect, it } from "vitest";
import { pregnancyScreen } from "./pregnancy-screen";

describe("pregnancy screen", () => {
  it("is clear when every ingredient is resolved and none carries a caution", () => {
    const r = pregnancyScreen(["Aqua", "Glycerin", "Niacinamide"]);
    expect(r).toEqual({ status: "clear", cautioned: [], unresolved: [] });
  });

  it("names a cautioned ingredient, with the first clause of the database's note", () => {
    const r = pregnancyScreen(["Aqua", "Retinyl Palmitate"]);
    expect(r.status).toBe("caution");
    expect(r.cautioned[0].name).toBe("Retinyl Palmitate");
    expect(r.cautioned[0].note).toMatch(/^Caution during pregnancy/);
  });

  it("a hazard row whose pregnancy note is a precaution is a caution (Formaldehyde; it used to hold a bare 'Yes', and the screen still reads one as a caution)", () => {
    expect(pregnancyScreen(["Aqua", "Formaldehyde"]).cautioned.map((c) => c.name)).toEqual(["Formaldehyde"]);
  });

  it("soft wording counts as a caution, because a wrong 'no caution' tick is the dangerous error", () => {
    // Salicylic Acid: "...high-dose or large-area use is commonly cautioned and oral salicylates are contraindicated..."
    expect(pregnancyScreen(["Aqua", "Salicylic Acid"]).status).toBe("caution");
  });

  it("neem seed oil is a caution since the owner's decision of 2026-11-02; its old 'not applicable to refined topical cosmetic seed oil' note is gone, so no row exercises that branch now", () => {
    // The page's own check never skipped that wording, so the page flagged neem while its text said no restriction applied. The owner chose to flag it with a one-line reason.
    const r = pregnancyScreen(["Aqua", "Azadirachta Indica Seed Oil"]);
    expect(r.status).toBe("caution");
    expect(r.cautioned.map((x) => x.name)).toEqual(["Azadirachta Indica Seed Oil"]);
    expect(r.cautioned[0].note).toMatch(/^Caution during pregnancy is precautionary only: azadirachtin from neem/);
  });

  it("a retinoid is a caution even though the database holds no row for it", () => {
    // The database has no "Retinol" row at all, only its esters; without this a retinol serum would read as not checked.
    const r = pregnancyScreen(["Aqua", "Retinol"]);
    expect(r.status).toBe("caution");
    expect(r.cautioned.map((c) => c.name)).toEqual(["Retinol"]);
    expect(r.unresolved).toEqual([]);
  });

  it("a name that only mentions retinol in brackets is not a retinoid", () => {
    expect(pregnancyScreen(["Aqua", "Bakuchiol (a natural retinol alternative)"]).cautioned).toEqual([]);
    expect(pregnancyScreen(["Aqua", "Bakuchiol"])).toEqual({ status: "clear", cautioned: [], unresolved: [] });
  });

  it("a note that opens 'No specific restriction' is never a caution, and its hedge makes the ingredient not checked, not clear", () => {
    // Oligopeptide-1: "No specific restriction identified; precautionary avoidance sometimes recommended due to cell proliferation mechanism"
    expect(pregnancyScreen(["Aqua", "Oligopeptide-1"])).toEqual({ status: "unknown", cautioned: [], unresolved: ["Oligopeptide-1"] });
    // Neem leaf: "No specific restriction for topical leaf extract; seed extract use should be avoided in pregnancy..." - the caution is about the seed
    expect(pregnancyScreen(["Aqua", "Azadirachta Indica Leaf Extract"]).cautioned).toEqual([]);
  });

  it("is never clear while an ingredient is unresolved", () => {
    const r = pregnancyScreen(["Aqua", "Zorbaflux"]);
    expect(r).toEqual({ status: "unknown", cautioned: [], unresolved: ["Zorbaflux"] });
  });

  it("a caution wins over an unresolved ingredient", () => {
    expect(pregnancyScreen(["Retinyl Palmitate", "Zorbaflux"]).status).toBe("caution");
  });

  it("an empty list is unknown, not clear", () => {
    expect(pregnancyScreen([]).status).toBe("unknown");
  });
});
