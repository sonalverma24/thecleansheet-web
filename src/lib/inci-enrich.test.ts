import { describe, expect, it } from "vitest";
import { buildGlobalScreen, enrichIngredients, keyActivesFrom, restricted } from "@/lib/inci-enrich";

describe("restricted() - negation handling (Regulatory screen / 10-authority check)", () => {
  it("does not flag a status that negates 'restricted' and 'prohibited' in the same clause", () => {
    expect(restricted("Permitted; listed in EU CosIng; not restricted or prohibited")).toBe(false);
  });

  it("does not flag the common Canada NHPID negated phrasing", () => {
    expect(restricted("Not specifically listed as restricted cosmetic ingredient in NHPID source checked; standard Health Canada cosmetic notification applies")).toBe(false);
  });

  it("does not flag the common Korea MFDS negated phrasing", () => {
    expect(restricted("Not listed as restricted or prohibited by MFDS; permitted cosmetic ingredient")).toBe(false);
  });

  it("does not flag the common US FDA negated phrasing", () => {
    expect(restricted("Permitted cosmetic ingredient; not listed as prohibited or restricted in 21 CFR")).toBe(false);
  });

  it("still flags a genuinely restricted preservative even though 'permitted' also appears", () => {
    expect(restricted("Restricted preservative - permitted only in specific products at low levels (EU Annex V)")).toBe(true);
  });

  it("still flags an explicit EU Annex II prohibition", () => {
    expect(restricted("Prohibited in cosmetics (EU Annex II); permitted only as a regulated drug for skin lightening.")).toBe(true);
  });

  it("still flags an explicit 'not permitted for' restriction", () => {
    expect(restricted("Not permitted for use in leave-on facial products above 2%")).toBe(true);
  });
});

describe("buildGlobalScreen - real-world regression (Moxie Beauty Deep Dive Hair Mask)", () => {
  it("Tripeptide-1 reads clear across every authority, not flagged as restricted/prohibited", () => {
    const screen = buildGlobalScreen(["Tripeptide-1"]);
    expect(screen.eu_1223_2009).not.toContain("Tripeptide-1");
    expect(screen.india_cr_2020).not.toContain("Tripeptide-1");
    expect(screen.us_fda_21cfr).not.toContain("Tripeptide-1");
    expect(screen.korea_mfds).not.toContain("Tripeptide-1");
  });
});

describe("the enrichment lookup reads a colour-index code beside its INCI name the same way lookupIngredient does", () => {
  it("'CI 77891/Titanium Dioxide' gets Titanium Dioxide's note and flag, not the bare fallback for an unknown name", () => {
    const [combined] = enrichIngredients(["CI 77891/Titanium Dioxide"]);
    const [plain] = enrichIngredients(["Titanium Dioxide"]);
    expect(plain.note).not.toBe("");
    expect(combined.note).toBe(plain.note);
    expect(combined.flag).toBe(plain.flag);
  });

  it("an unknown first part is still not rescued by a known name after the slash", () => {
    const [rescued] = enrichIngredients(["Zorbaflux/Titanium Dioxide"]);
    const [plain] = enrichIngredients(["Titanium Dioxide"]);
    expect(rescued.note).not.toBe(plain.note);
  });

  it("the authority screen counts the combined label as Titanium Dioxide", () => {
    expect(buildGlobalScreen(["CI 77891/Titanium Dioxide"])).toEqual(buildGlobalScreen(["Titanium Dioxide"]));
  });

  it("a key active written with its code is still picked up", () => {
    expect(keyActivesFrom(["CI 77891/Titanium Dioxide"]).map((a) => a.name)).toEqual(keyActivesFrom(["Titanium Dioxide"]).map((a) => a.name));
  });
});

describe("an ingredient we hold no row for keeps its generic note in the shared source: today's page still shows it", () => {
  it("the note is unchanged, so only the pills page leaves it out", () => {
    expect(enrichIngredients(["Zorbaflux Glycoside"])[0].note).toBe("Not in our analysed database; assessed from public sources.");
  });
});
