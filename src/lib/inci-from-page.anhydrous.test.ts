import { afterEach, describe, expect, it, vi } from "vitest";
import { extendFromBlocks, extractInciFromHtml, extractInciFromText, extractInciWithQuote, fetchInciFromProductPage, type InciExtraction } from "@/lib/inci-from-page";

/* 2026-11-03: Antinorm's High & Dry dry shampoo. The brand's own page prints the whole list in its "FULL INGREDIENTS" accordion, and the pipeline found none:
   the list has no Aqua, Water, Glycerin or Sodium, the words the extractor wanted in a list before it would call it one. Read with that fixed, the list came back
   with the next accordion's title glued to its last entry ("Maize Starch MORE"). The markup is trimmed from the live page. */
const URL = "https://antinorm.co/products/high-dry";
const LIST = ["Zea Mays (Corn) Starch", "Bentonite", "Oryza Sativa (Rice) Starch", "Magnesium Aluminum Silicate", "Kaolin Powder", "Maranta Arundinacea (Arrowroot) Root Powder", "Maize Starch"];
const LIST_TEXT = LIST.join(", ");
const page = (list: string) => `<!doctype html><html><head><title>High &amp; Dry</title></head><body>
<div class="product-info__block-item" data-block-type="collapsible-text"><details class="product-info__accordion accordion group" is="accordion-disclosure">
  <summary><div class="accordion__toggle"><div class="text-with-icon"><span >FULL INGREDIENTS</span> </div></div></summary>
  <div class="accordion__content"><div class="prose"><div class="metafield-rich_text_field"><p>${list}</p></div></div></div>
</details></div><div class="product-info__block-item" data-block-type="collapsible-text"><details class="product-info__accordion accordion group" is="accordion-disclosure">
  <summary><div class="accordion__toggle"><div class="text-with-icon"><span >MORE</span> </div></div></summary>
  <div class="accordion__content"><div class="prose"><div class="metafield-rich_text_field"><p><strong>Country of Origin</strong>: India<br /> <br /> <strong>Marketed by</strong>: Potion Pioneers Pvt. Ltd. W-16/19, Western Avenue, New Delhi, India, 110016<br /> <br /> <strong>Fill Capacity</strong>: 5 g/0.17 oz</p></div></div></div>
</details></div></body></html>`;

afterEach(() => vi.unstubAllGlobals());
const serve = (html: string) => vi.stubGlobal("fetch", vi.fn(async () => new Response(html, { status: 200 })));

describe("a water-free formula's list is read: the botanical INCI form is what marks it", () => {
  it("reads Antinorm's seven entries, none of which is a word the extractor used to need", () => {
    expect(extractInciFromText(LIST_TEXT)).toEqual(LIST);
    expect(extractInciWithQuote(LIST_TEXT)?.quote).toBe(LIST_TEXT);
  });

  it("reads other botanical, anhydrous lists the same way (a balm, an oil blend)", () => {
    expect(extractInciFromText("Butyrospermum Parkii (Shea) Butter, Cocos Nucifera (Coconut) Oil, Cera Alba, Simmondsia Chinensis (Jojoba) Seed Oil, Helianthus Annuus (Sunflower) Seed Oil, Tocopheryl Acetate")).toHaveLength(6);
  });

  it("still refuses what is not a list: bracketed claims, marketing copy, and a single botanical name among generic words", () => {
    expect(extractInciFromText("Salicylic Acid (BHA), Hyaluronic Acid (HA), Vitamin C (Ascorbic Acid), Retinol (Vitamin A), Peptides (Matrixyl), Ceramides (Barrier Lipids)")).toEqual([]);
    expect(extractInciFromText("Lightweight Texture, Absorbs Quickly, Leaves No Residue, Suitable For Everyone, Smells Fresh, Loved By Thousands")).toEqual([]);
    expect(extractInciFromText("Zea Mays (Corn) Starch, Bentonite, Kaolin Powder, Magnesium Aluminum Silicate, Mica")).toEqual([]); // one botanical name is not enough
  });
});

describe("the page read puts the list right at both ends", () => {
  it("returns Antinorm's list whole, without the accordion titles glued to it, and quotes only the list", async () => {
    serve(page(LIST_TEXT));
    const read = await fetchInciFromProductPage(URL);
    expect(read?.ingredients).toEqual(LIST);
    expect(read?.quote).toBe(LIST_TEXT);
    expect(read?.quote).not.toMatch(/FULL INGREDIENTS|MORE|Country of Origin/);
    expect(read?.pageTitles).toEqual(["High & Dry"]);
  });

  it("is what the visible reading alone gets wrong: the title of the next accordion is glued to the last entry", () => {
    expect(extractInciFromHtml(page(LIST_TEXT)).at(-1)).toBe("Maize Starch MORE");
  });

  const glued = (ingredients: string[]): InciExtraction => ({ ingredients, quote: ingredients.join(", ") });
  const html = page(LIST_TEXT);

  it("takes the block reading when it is the same list with the glued text taken off the two ends", () => {
    expect(extendFromBlocks(glued(["FULL INGREDIENTS Zea Mays (Corn) Starch", ...LIST.slice(1, -1), "Maize Starch MORE"]), html)?.ingredients).toEqual(LIST);
  });

  it("changes nothing else: another interior entry, another order, a first entry that does not end with the block's, or a list already identical", () => {
    for (const other of [
      [LIST[0], "Talc", ...LIST.slice(2)],
      [...LIST].reverse(),
      ["Kaolin Powder", ...LIST.slice(1)],
      [LIST[0], ...LIST.slice(1, -1), "Corn Maize Starch"],
      LIST,
    ]) {
      const read = glued(other);
      expect(extendFromBlocks(read, html), other.join("|")).toBe(read);
    }
  });
});
