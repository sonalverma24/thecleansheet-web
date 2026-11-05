import { describe, expect, it } from "vitest";
import { extractInciWithQuote } from "./inci-from-page";

/* Estée Lauder-group pages (Bobbi Brown, Clinique, MAC) name some entries in several languages split by a backslash, and print a US-style actives block,
   with strengths, glued to the second "Ingredients" label. Bobbi Brown Weightless Skin Foundation SPF 15, read 2026-11-04 as 20 of its 37 entries: the
   reader rejected "Water\Aqua\Eau" and "Honey Extract\Mel\Extrait De Miel", kept the longest stretch after the honey, and lost the water base and both UV
   filters, so the page said an SPF 15 foundation lists no UV filter. Text as the brand page prints it (2026-11-05). */
const BOBBI =
  "Ingredients: Octinoxate 6.7%, Titanium Dioxide 1.6%Ingredients: Water\\Aqua\\Eau, Dimethicone, Glycerin, Trimethylsiloxysilicate, Cetyl Peg/Ppg-10/1 Dimethicone, Butylene Glycol, Polymethylsilsesquioxane, Polyglyceryl-3 Diisostearate, Sodium Chloride, Acetyl Glucosamine, Disteardimonium Hectorite, Laminaria Saccharina Extract, Lavandula Angustifolia (Lavender) Oil, Lavandula Hybrida Oil, Honey Extract\\Mel\\Extrait De Miel, Butyl Avocadate, Caprylyl Glycol, Disodium Stearoyl Glutamate, Sodium Hyaluronate, Salicylic Acid, Methoxy Amodimethicone/Silsesquioxane Copolymer, Aluminum Hydroxide, Silica, Pentaerythrityl Tetra-Di-T-Butyl Hydroxyhydrocinnamate, Polysilicone-11, Citric Acid, Sodium Hydroxide, Hexylene Glycol, Stearic Acid, Linalool, Linalyl Acetate, Bht, Tocopheryl Acetate, Disodium Edta, Phenoxyethanol, [+/- Mica, Titanium Dioxide (Ci 77891), Iron Oxides (Ci 77491), Iron Oxides (Ci 77492), Iron Oxides (Ci 77499)]";

describe("multilingual entries and a glued actives block (Bobbi Brown, 2026-11-04)", () => {
  const ex = extractInciWithQuote(BOBBI)!;

  it("reads the whole formula: both actives, then the list from the water base to the preservative", () => {
    expect(ex.ingredients.slice(0, 4)).toEqual(["Octinoxate", "Titanium Dioxide", "Water/Aqua/Eau", "Dimethicone"]);
    expect(ex.ingredients).toContain("Honey Extract/Mel/Extrait De Miel");
    expect(ex.ingredients.at(-1)).toBe("Phenoxyethanol");
    expect(ex.ingredients).toHaveLength(37);
  });

  it("drops the strength from the entry but keeps it in the quote", () => {
    expect(ex.ingredients.some((x) => /%/.test(x))).toBe(false);
    expect(ex.quote).toMatch(/^Octinoxate 6\.7%, Titanium Dioxide 1\.6%Ingredients: Water\\Aqua\\Eau/);
  });

  it("a backslash entry alone is an entry, not a cut", () => {
    const r = extractInciWithQuote("Ingredients: Water\\Aqua\\Eau, Glycerin, Butylene Glycol, Honey Extract\\Mel\\Extrait De Miel, Caprylyl Glycol, Phenoxyethanol")!;
    expect(r.ingredients).toEqual(["Water/Aqua/Eau", "Glycerin", "Butylene Glycol", "Honey Extract/Mel/Extrait De Miel", "Caprylyl Glycol", "Phenoxyethanol"]);
  });

  it("copy before a label is not glued on: only an entry with a strength continues the run", () => {
    const r = extractInciWithQuote("Hydrating, Lightweight, Long wearing, Soft focus finish Ingredients: Water, Glycerin, Butylene Glycol, Dimethicone, Phenoxyethanol")!;
    expect(r.ingredients[0]).toBe("Water");
  });
});
