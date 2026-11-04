import { describe, expect, it, vi } from "vitest";
vi.mock("./scrape", () => ({ fetchPageMarkdown: vi.fn() }));
import { fetchPageMarkdown } from "./scrape";
import { decoderEntryNamesQuery, resolveINCI } from "./inci-fetch";

/* Live case, 2026-11-04: the search for "Garnier Skin Naturals Micellar Oil-Infused Cleansing Water" took INKEE Decoder's "Garnier Micellar Water Sensitive
   Skin" (the pink bottle, a different product) and its seven-ingredient list became the yellow bottle's list. A neighbouring variant is not this product. */

const productPage = (name: string, ingredients: string[]) =>
  `Title: ${name} ingredients (Explained)\n# [Brand](https://inkeedecoder.com/brands/brand)\n## Ingredients overview\n${ingredients.map((i) => `[${i}](https://inkeedecoder.com/ingredients/${i.toLowerCase().replace(/\s+/g, "-")})`).join(", ")}`;

function decoder(entries: { name: string; slug: string }[], ingredients = ["Aqua", "Hexylene Glycol", "Glycerin", "Disodium Edta", "Poloxamer 184"]) {
  vi.mocked(fetchPageMarkdown).mockImplementation(async (url: string) => {
    if (url.includes("/search?")) return entries.map((e) => `[${e.name}](https://inkeedecoder.com/products/${e.slug})`).join("\n");
    const e = entries.find((x) => url.endsWith(`/products/${x.slug}`));
    return e ? productPage(e.name, ingredients) : null;
  });
}

describe("which Decoder entry names the product asked for", () => {
  it.each([
    ["Garnier Micellar Water Sensitive Skin", "Garnier Skin Naturals Micellar Oil-Infused Cleansing Water", false],
    ["Garnier Micellar Water Sensitive Skin", "Garnier Micellar Cleansing Water Oil Infused", false],
    ["Simple Kind To Skin Refreshing Face Wash", "Simple Kind To Skin Refreshing Facial Wash", true],
    ["glenmark Scalpe Pro Anti Dandruff Shampoo", "Scalpe Pro Daily Anti Dandruff Shampoo", true],
    ["Dot & Key Vitamin C + E Super Bright Gel Face Wash", "Dot & Key Vitamin C+E Super Bright Gel Face Wash, Sicilian Blood Orange, 100ml", true],
    ["La Roche-Posay Cicaplast Baume B5", "La Roche-Posay Cicaplast Balm B5", true],
    // Two live lists the first version of this rule would have turned away: a page code for the apostrophe, and "With Ceramides" for "Ceramide".
    ["Pond&#39;s Super Light Gel", "Ponds Super Light Gel Oil-Free Moisturize With Hyaluronic Acid & Vitamin E", true],
    ["Dot & Key Barrier Repair Face Moisturizer With Ceramides", "Dot & Key Hyaluronic + Ceramide Barrier Repair Hydrating Face Moisturizer Cream, Normal To Dry Skin", true],
  ])("%s for %s: %s", (entry, query, expected) => {
    expect(decoderEntryNamesQuery(entry, query)).toBe(expected);
  });
});

describe("resolveINCI refuses a neighbouring variant", () => {
  it("the Garnier case: the only close entry is another variant, so no list is taken", async () => {
    decoder([{ name: "Garnier Micellar Water Sensitive Skin", slug: "garnier-micellar-water-sensitive-skin" }]);
    const result = await resolveINCI("Garnier Skin Naturals Micellar Oil-Infused Cleansing Water");
    expect(result.chosen).toBeNull();
    expect(result.ambiguous).toBe(false);
  });

  it("the right variant listed next to the wrong one is the one taken", async () => {
    decoder([
      { name: "Garnier Micellar Water Sensitive Skin", slug: "garnier-micellar-water-sensitive-skin" },
      { name: "Garnier Skin Naturals Micellar Oil-Infused Cleansing Water", slug: "garnier-micellar-oil-infused" },
    ]);
    const result = await resolveINCI("Garnier Skin Naturals Micellar Oil-Infused Cleansing Water");
    expect(result.chosen?.slug).toBe("garnier-micellar-oil-infused");
  });

  it("a differently worded entry for the same product is still found (Face Wash for Facial Wash)", async () => {
    decoder([{ name: "Simple Kind To Skin Refreshing Face Wash", slug: "simple-kind-to-skin-refreshing-face-wash" }]);
    const result = await resolveINCI("Simple Kind To Skin Refreshing Facial Wash");
    expect(result.chosen?.slug).toBe("simple-kind-to-skin-refreshing-face-wash");
  });

  it("a retailer's long name that contains the whole entry name is still found", async () => {
    decoder([{ name: "Dot & Key Vitamin C + E Super Bright Gel Face Wash", slug: "dot-key-vitamin-c-e-super-bright-gel-face-wash" }]);
    const result = await resolveINCI("Dot & Key Vitamin C+E Super Bright Gel Face Wash, Sicilian Blood Orange, 100ml");
    expect(result.chosen?.slug).toBe("dot-key-vitamin-c-e-super-bright-gel-face-wash");
  });
});
