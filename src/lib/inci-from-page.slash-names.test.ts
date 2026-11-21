import { describe, expect, it } from "vitest";
import { extractInciWithQuote, readMarkdownList } from "./inci-from-page";

/* The Body Shop prints some entries with the name twice, joined by a slash, the second with its common name in brackets. Read as one name, such an entry was too
   long, so the list was cut after it: 19 of 24 entries from "Sodium Polyacrylate", no water, and the list was refused as impossible for a cream (2026-11-21). */
const BODY_SHOP = "Ingredients Aqua/Water/Eau, Glycerin, Caprylic/Capric Triglyceride, Cetyl Alcohol, Prunus Amygdalus Dulcis Oil/Prunus Amygdalus Dulcis (Sweet Almond) Oil, Sodium Polyacrylate, Parfum/Fragrance, Pentaerythrityl Distearate, Phenoxyethanol, Caprylyl Glycol, Cetearyl Alcohol, Cetearyl Glucoside, Glycine Soja Oil/Glycine Soja (Soybean) Oil, Orbignya Oleifera Seed Oil, Butyrospermum Parkii Butter/Butyrospermum Parkii (Shea) Butter, Myristamidopropyl PG-Dimonium Chloride Phosphate, Sodium Stearoyl Glutamate, Xanthan Gum, Linalool, Citrus Aurantium Peel Oil, Limonene, Tetrasodium Glutamate Diacetate, Citral, Mentha Piperita Oil.";

describe("an entry that gives its name twice, joined by a slash", () => {
  it("is one entry, so the list is read from its first entry", () => {
    const ex = readMarkdownList(BODY_SHOP);
    expect(ex?.ingredients).toHaveLength(24);
    expect(ex?.ingredients[0]).toBe("Aqua/Water/Eau");
    expect(ex?.ingredients[4]).toBe("Prunus Amygdalus Dulcis Oil/Prunus Amygdalus Dulcis (Sweet Almond) Oil");
    expect(ex?.ingredients.at(-1)).toBe("Mentha Piperita Oil");
  });

  it("still refuses a piece of prose, slash or not", () => {
    const prose = "Our hand cream is made with care for every skin type and every season/it is loved by our customers all over the world, Glycerin, Water";
    expect(extractInciWithQuote(prose)?.ingredients ?? []).not.toContain("Our hand cream is made with care for every skin type and every season/it is loved by our customers all over the world");
  });
});
