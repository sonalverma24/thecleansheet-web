import { describe, expect, it } from "vitest";
import { extractInciFromHtml, extractInciWithQuote, flattenRichTextDumps } from "@/lib/inci-from-page";

/* The hidden block juicychemistry.com prints for a product (2026-10-29): a Shopify rich-text field dumped as Ruby data inside
   <div style="display: none">. Before this change the first (Theobroma Cacao Seed Butter) and last (Rosa Damascena Flower Oil)
   entries were dropped because the dump's punctuation was glued to them: 12 of 14 came back, and the analysis saved none. */
const INGREDIENTS_BLOCK = "<div id=\"default-ingredients\" style=\"display: none;\">{\"type\"=>\"root\", \"children\"=>[{\"type\"=>\"paragraph\", \"children\"=>[{\"type\"=>\"text\", \"value\"=>\"Theobroma Cacao Seed Butter (Cocoa Butter)*,Haelianthus Annuus Seed Oil (Sunflower Oil)*, CoffeaArabica Seed Oil (Coffee Oil)*, Cera Alba (Bees Wax)*, VitisVinifera Seed Oil (Grape Seed Oil)*, Cannabis Sativa SeedOil (Hemp Seed Oil)*, Camellia Sinensis Leaf Oil (Green Tea) Extract*,Simmondsia Chinensis Seed Oil (Jojoba Oil)*, Rosa Canina Fruit Oil(Rosehip Seed Oil)*, Tocopherol (Vitamin E Oil)*, Lavandula Agustifolia Oil(Lavender Oil)*, Pelargonium Graveolens Flower Oil (Geranium Oil)*,Santalum Album Oil (Sandalwood Oil)*, Rosa Damascena Flower Oil (Rose Oil)*\"}]}, {\"type\"=>\"paragraph\", \"children\"=>[{\"type\"=>\"text\", \"value\"=>\"*Ingredient from Organic Farming\"}]}]}</div>";
const USAGE_BLOCK = "<div id=\"default-usage\" style=\"display: none;\">{\"type\"=>\"root\", \"children\"=>[{\"type\"=>\"paragraph\", \"children\"=>[{\"type\"=>\"text\", \"value\"=>\"STEP 1:\", \"bold\"=>true}]}, {\"type\"=>\"paragraph\", \"children\"=>[{\"type\"=>\"text\", \"value\"=>\"Scoop out a tiny amount of the Damask Rose (Gulab) and Coffee eye cream and dot it around the eyes.\"}]}, {\"type\"=>\"paragraph\", \"children\"=>[{\"type\"=>\"text\", \"value\"=>\"STEP 2:\", \"bold\"=>true}]}, {\"type\"=>\"paragraph\", \"children\"=>[{\"type\"=>\"text\", \"value\"=>\"\"}]}, {\"type\"=>\"paragraph\", \"children\"=>[{\"type\"=>\"text\", \"value\"=>\"Gently massage under the eyes with your fingertips applying the least amount of pressure.\\n\\nUse PM only.\"}]}]}</div>";
const page = (...blocks: string[]) => `<html><head><title>Under Eye Cream | Caffeine</title></head><body><h1>Organic Under Eye Repair Cream</h1><p>Made with certified organic ingredients, this nourishing eye cream is suitable for all skin types.</p>${blocks.join("")}<footer>Free shipping</footer></body></html>`;

describe("a rich-text field printed as a data dump is read as text", () => {
  it("returns all 14 entries of the hidden Juicy Chemistry list, first and last included", () => {
    const list = extractInciFromHtml(page(INGREDIENTS_BLOCK, USAGE_BLOCK));
    expect(list).toHaveLength(14);
    expect(list[0]).toMatch(/^Theobroma Cacao Seed Butter/);
    expect(list[13]).toMatch(/^Rosa Damascena Flower Oil/);
    for (const entry of list) expect(entry).not.toMatch(/=>|\{|\}|"/);
  });

  it("keeps the dump's punctuation out of the quote the page is credited with", () => {
    const ex = extractInciWithQuote(flattenRichTextDumps(page(INGREDIENTS_BLOCK)).replace(/<[^>]+>/g, " "));
    expect(ex?.quote).toMatch(/Theobroma Cacao Seed Butter/);
    expect(ex?.quote).not.toMatch(/=>|"type"/);
  });

  it("removes the markup of the dump entirely and sets each paragraph off with a comma", () => {
    const flat = flattenRichTextDumps(INGREDIENTS_BLOCK);
    expect(flat).not.toMatch(/"type"|=>|children/);
    expect(flat).toContain("(Rose Oil)* , *Ingredient from Organic Farming");
  });

  it("reads the same field when it is JSON (colons) and when the text carries escapes", () => {
    const json = '<div hidden>{"type":"root","children":[{"type":"paragraph","children":[{"type":"text","value":"Aqua, Glycerin, Niacinamide, Panthenol, Sodium Hyaluronate, Tocopherol, Allantoin, Xanthan Gum \\u0026 Citric Acid"}]}]}</div>';
    const flat = flattenRichTextDumps(json);
    expect(flat).toContain("Aqua, Glycerin, Niacinamide");
    expect(flat).toContain("Xanthan Gum & Citric Acid");
    expect(flat).not.toMatch(/"type"|children/);
  });

  it("does not turn a dump with no ingredient list into one", () => {
    expect(extractInciFromHtml(page(USAGE_BLOCK))).toEqual([]);
  });

  it("leaves a dump that never closes, and a page with no dump, exactly as they are", () => {
    const cut = '<div>{"type"=>"root", "children"=>[{"type"=>"paragraph", "children"=>[{"type"=>"text", "value"=>"Aqua, Glycerin';
    expect(flattenRichTextDumps(cut)).toBe(cut);
    const plain = "<p>Ingredients: Aqua, Glycerin, Niacinamide, Panthenol, Sodium Hyaluronate</p>";
    expect(flattenRichTextDumps(plain)).toBe(plain);
  });

  it("does not stop at a brace inside the text", () => {
    const tricky = '{"type"=>"root", "children"=>[{"type"=>"paragraph", "children"=>[{"type"=>"text", "value"=>"Aqua {purified}, Glycerin"}]}]} after';
    expect(flattenRichTextDumps(tricky)).toContain("Aqua {purified}, Glycerin");
    expect(flattenRichTextDumps(tricky)).toContain("after");
  });
});
