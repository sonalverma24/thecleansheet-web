import { describe, expect, it } from "vitest";
import {
  classForTick, claimKey, DEFAULT_ONTOLOGY, effectiveStrength, isAuthoritativeSource, isReviewDate, isReviewRef, isValidCas, PANEL_ATTRIBUTION, publicAttribution,
  ontologyTick, provenanceProblems, relationHits,
} from "@/lib/claim-ontology";
import { FIXTURE_PROVENANCE, reviewedForTest as reviewed } from "@/lib/ontology.fixtures";
import type { OntologyEntry } from "@/data/ingredients/claim-ontology";
import { applyOntologyTicks } from "@/lib/at-a-glance";
import type { ProductScorecard } from "@/data/brands/types";

describe("claimKey", () => {
  it("treats hyphen, spacing, case and the sulphate spelling as one key", () => {
    expect(claimKey("Sulphate-Free")).toBe(claimKey("sulfate  free"));
    expect(claimKey("Alcohol-free")).toBe("alcohol free");
  });
});

describe("classForTick", () => {
  it("finds the class for a tracked tick and ignores the rest", () => {
    expect(classForTick("Paraben free")?.id).toBe("paraben");
    expect(classForTick("Sulphate free")?.id).toBe("sulfate");
    expect(classForTick("Vegan")).toBeNull();
  });
});

const NOW = new Date("2026-10-21T00:00:00Z");
const good: OntologyEntry = { form: "x", strength: "definitive", ...FIXTURE_PROVENANCE };

describe("provenance: a string that merely exists is not a review", () => {
  it("accepts a CAS number only when its check digit is right", () => {
    expect(isValidCas("64-17-5")).toBe(true);        // ethanol
    expect(isValidCas("CAS 50-00-0")).toBe(true);    // formaldehyde
    expect(isValidCas("64-17-6")).toBe(false);       // wrong check digit
    expect(isValidCas("example")).toBe(false);
    expect(isValidCas("1264-17-5")).toBe(false);     // run of digits is not a CAS number
    expect(isValidCas("164-17-5")).toBe(false);      // its tail "64-17-5" is valid, but the run is longer
    expect(isValidCas("3-64-17-5")).toBe(false);     // a valid number inside a hyphenated chain
    expect(isValidCas("64-17-5-1")).toBe(false);     // ...or followed by more of one
  });

  it("accepts an https URL only on an authoritative host or one of its subdomains", () => {
    expect(isAuthoritativeSource("https://pubchem.ncbi.nlm.nih.gov/compound/702")).toBe(true);
    expect(isAuthoritativeSource("https://ec.europa.eu/growth/tools-databases/cosing/")).toBe(true);
    expect(isAuthoritativeSource("https://www.cir-safety.org/ingredients")).toBe(true);
    expect(isAuthoritativeSource("http://pubchem.ncbi.nlm.nih.gov/compound/702")).toBe(false); // not https
    expect(isAuthoritativeSource("https://example.com/cosing")).toBe(false);
    expect(isAuthoritativeSource("https://evil-ec.europa.eu.example.com/")).toBe(false);
    expect(isAuthoritativeSource("https://notec.europa.eu/")).toBe(false);
    expect(isAuthoritativeSource("CosIng record (example)")).toBe(false);
    expect(isAuthoritativeSource("example")).toBe(false);
    expect(isAuthoritativeSource("")).toBe(false);
    expect(isAuthoritativeSource(undefined)).toBe(false);
  });

  it("accepts only an opaque panel reference as the reviewer, never a name", () => {
    for (const ok of ["TCS-P-014", "TCS-P-900", " TCS-P-0001 "]) expect(isReviewRef(ok), ok).toBe(true);
    for (const bad of ["qualified reviewer TBD", "TBD", "Dr Meera Iyer", "Asha Rao", "Site Owner", "TCS-P-1", "TCS-P-", "tcs-p-014", "TCS-X-014", "TCS-P-014 Meera", "", undefined]) {
      expect(isReviewRef(bad), String(bad)).toBe(false);
    }
  });

  it("accepts only a real, past or present calendar date", () => {
    expect(isReviewDate("2026-10-21", NOW)).toBe(true);
    expect(isReviewDate("2026-02-30", NOW)).toBe(false);   // not a date
    expect(isReviewDate("2026-10-22", NOW)).toBe(false);   // the future
    expect(isReviewDate("21/10/2026", NOW)).toBe(false);   // wrong shape
    expect(isReviewDate("yesterday", NOW)).toBe(false);
    expect(isReviewDate("", NOW)).toBe(false);
  });
});

describe("effectiveStrength", () => {
  it("is definitive only when declared definitive AND all three provenance checks pass", () => {
    expect(effectiveStrength(good, NOW)).toBe("definitive");
    expect(provenanceProblems(good, NOW)).toEqual([]);
  });

  it.each([
    ["no source", { source: undefined }],
    ["placeholder source", { source: "CosIng record (example)" }],
    ["bad CAS check digit", { source: "64-17-6" }],
    ["non-authoritative URL", { source: "https://example.com/x" }],
    ["no reviewer reference", { reviewRef: undefined }],
    ["placeholder reviewer", { reviewRef: "qualified reviewer TBD" }],
    ["a person's name instead of a reference", { reviewRef: "Asha Rao" }],
    ["blank date", { reviewedAt: " " }],
    ["impossible date", { reviewedAt: "2026-13-40" }],
    ["future date", { reviewedAt: "2027-01-01" }],
  ] as const)("is qualified with %s", (_label, override) => {
    const e = { ...good, ...override } as OntologyEntry;
    expect(effectiveStrength(e, NOW)).toBe("qualified");
    expect(provenanceProblems(e, NOW).length).toBeGreaterThan(0);
  });

  it("a declared-qualified entry stays qualified however good its provenance", () => {
    expect(effectiveStrength({ ...good, strength: "qualified" }, NOW)).toBe("qualified");
  });

  it("the public line is fixed text that names no one and carries no reference", () => {
    expect(PANEL_ATTRIBUTION).toBe("Reviewed by an expert on the TCS Panel.");
    expect(PANEL_ATTRIBUTION).not.toMatch(/TCS-P|\d/);
  });

  it("the public line appears only for an alias that is definitive in code", () => {
    expect(publicAttribution(good, NOW)).toBe(PANEL_ATTRIBUTION);
    expect(publicAttribution({ ...good, reviewRef: "Asha Rao" }, NOW)).toBeNull();      // a name, not a reference
    expect(publicAttribution({ ...good, reviewedAt: undefined }, NOW)).toBeNull();
    expect(publicAttribution({ ...good, strength: "qualified" }, NOW)).toBeNull();
    for (const cls of DEFAULT_ONTOLOGY.classes) for (const e of cls.entries) expect(publicAttribution(e), `${cls.id}: ${e.form}`).toBeNull();
  });

  it("the attribution never leaks the reference, however the entry is set up", () => {
    expect(publicAttribution(good, NOW)).not.toContain(good.reviewRef!);
  });

  it("no shipped entry is definitive until a qualified reviewer signs it", () => {
    for (const cls of DEFAULT_ONTOLOGY.classes) for (const e of cls.entries) expect(effectiveStrength(e), `${cls.id}: ${e.form}`).toBe("qualified");
  });
});

describe("hazard context needs its own source", () => {
  const withHazard = (source: string): typeof reviewed => ({
    classes: reviewed.classes.map((c) => c.id !== "paraben" ? c : { ...c, entries: c.entries.map((e) => e.form === "methylparaben" ? { ...e, hazard: { text: "classified for potential endocrine activity", source } } : e) }),
  });
  const paraben = (o: typeof reviewed) => o.classes.find((c) => c.id === "paraben")!;

  it("carries the hazard text when it names an authoritative source", () => {
    const hits = relationHits(paraben(withHazard("https://ec.europa.eu/growth/tools-databases/cosing/")), ["Methylparaben"]);
    expect(hits[0].hazard?.text).toMatch(/endocrine/);
  });
  it("drops the hazard text when its source is not authoritative", () => {
    expect(relationHits(paraben(withHazard("my notes")), ["Methylparaben"])[0].hazard).toBeUndefined();
  });
});

describe("relationHits: real INCI spellings, still no substrings", () => {
  const cls = (id: string) => reviewed.classes.find((c) => c.id === id)!;
  it.each([
    ["drying-alcohol", "Alcohol Denat."],
    ["drying-alcohol", "Alcohol Denat"],
    ["fragrance", "Parfum (Fragrance)"],
    ["fragrance", "Fragrance/Parfum"],
    ["fragrance", "Fragrance (Parfum)"],
    ["paraben", "Methylparaben (and) Propylparaben"],
    ["sulfate", "Sodium Laureth Sulfate"],
    ["sulfate", "Sodium Lauryl Sulphate"],
  ])("%s recognises %s", (id, item) => {
    expect(relationHits(cls(id), [item]).length, item).toBeGreaterThan(0);
  });
  it("phenoxyethanol is not a paraben", () => {
    expect(relationHits(cls("paraben"), ["Phenoxyethanol"])).toEqual([]);
  });
  it("SLS and SLES are different members, never collapsed", () => {
    expect(relationHits(cls("sulfate"), ["Sodium Lauryl Sulfate"])[0].form).toBe("sodium lauryl sulfate");
    expect(relationHits(cls("sulfate"), ["Sodium Laureth Sulfate"])[0].form).toBe("sodium laureth sulfate");
  });
});

describe("relationHits: whole words or whole items, never substrings", () => {
  const alcohol = DEFAULT_ONTOLOGY.classes.find((c) => c.id === "drying-alcohol")!;

  it("does not read 'ethanol' inside Phenoxyethanol", () => {
    expect(relationHits(alcohol, ["Phenoxyethanol"])).toEqual([]);
  });
  it("matches a whole-word form inside a longer item", () => {
    expect(relationHits(alcohol, ["Alcohol Denat."]).map((h) => h.form)).toEqual(["alcohol denat"]);
  });
  it("a form must end at a word boundary: 'ethanol' is not found at the start of 'Ethanolamine'", () => {
    expect(relationHits(alcohol, ["Ethanolamine"])).toEqual([]);
  });
  it("a form must start at a word boundary", () => {
    expect(relationHits(alcohol, ["Methylethanol"])).toEqual([]);
  });
  it("finds a whole-word match even when the first occurrence is inside a longer word", () => {
    expect(relationHits(alcohol, ["Ethanolamine / Ethanol"])).toHaveLength(1);
  });
  it("a bare 'Alcohol' needs the whole item, so fatty alcohols never match", () => {
    expect(relationHits(alcohol, ["Cetyl Alcohol", "Cetearyl Alcohol"])).toEqual([]);
    expect(relationHits(alcohol, ["Alcohol"])).toHaveLength(1);
  });
  it("reports one hit per INCI item", () => {
    expect(relationHits(alcohol, ["Alcohol Denat. (SD Alcohol 40-B)"])).toHaveLength(1);
  });
});

describe("ontologyTick", () => {
  it("is clear when no member is listed", () => {
    expect(ontologyTick("Paraben free", ["Aqua", "Glycerin"])?.outcome).toBe("clear");
  });
  it("a tick label nobody modelled is NOT CHECKED (null), never clear", () => {
    for (const label of ["SLS free", "Paraben & Sulphate free", "Silicone-free hair", "Vegan"]) expect(ontologyTick(label, ["Aqua", "Sodium Laureth Sulfate"]), label).toBeNull();
  });
  it("is unresolved while the aliases are unreviewed", () => {
    expect(ontologyTick("Paraben free", ["Aqua", "Methylparaben"])?.outcome).toBe("unresolved");
  });
  it("is present once a reviewed member is listed", () => {
    expect(ontologyTick("Paraben free", ["Aqua", "Methylparaben"], reviewed)?.outcome).toBe("present");
  });
  it("is unresolved for a qualified member even when others are reviewed", () => {
    expect(ontologyTick("Alcohol free", ["Aqua", "Benzyl Alcohol"], reviewed)?.outcome).toBe("unresolved");
  });
  it("a definitive member wins over a qualified one", () => {
    expect(ontologyTick("Alcohol free", ["Benzyl Alcohol", "Alcohol Denat."], reviewed)?.outcome).toBe("present");
  });
  it("returns null for an untracked label", () => {
    expect(ontologyTick("Vegan", ["Aqua"])).toBeNull();
  });
});

describe("applyOntologyTicks", () => {
  const product = (ingredients: string[], warn: string[] = []) =>
    ({ ingredients: ingredients.map((name) => ({ name })), warn_badges: warn } as unknown as ProductScorecard);
  const strip = [{ label: "Fragrance free", value: true }, { label: "Alcohol free", value: true }, { label: "Paraben free", value: true }, { label: "Vegan", value: true }];

  it("leaves untracked ticks alone and keeps order", () => {
    const out = applyOntologyTicks(strip, product(["Aqua"]));
    expect(out.map((i) => i.label)).toEqual(["Fragrance free", "Alcohol free", "Paraben free", "Vegan"]);
  });
  it("turns a tick false when a reviewed member is present", () => {
    const out = applyOntologyTicks(strip, product(["Aqua", "Methylparaben"]), reviewed);
    expect(out.find((i) => i.label === "Paraben free")).toEqual({ label: "Paraben free", value: false });
  });
  it("drops a tick when only a qualified relation is present", () => {
    const out = applyOntologyTicks(strip, product(["Aqua", "Methylparaben"]));
    expect(out.some((i) => i.label === "Paraben free")).toBe(false);
  });
  it("drops 'Alcohol free' when the model wrote a denatured-alcohol warning the list does not show", () => {
    const out = applyOntologyTicks(strip, product(["Aqua"], ["Denatured alcohol"]));
    expect(out.some((i) => i.label === "Alcohol free")).toBe(false);
  });
  it("keeps 'Alcohol free' true on a clean list with no warning", () => {
    expect(applyOntologyTicks(strip, product(["Aqua"])).find((i) => i.label === "Alcohol free")?.value).toBe(true);
  });
});
