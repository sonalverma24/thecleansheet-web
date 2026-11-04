import { afterEach, describe, expect, it, vi } from "vitest";
import { completeLastEntry, extractInciWithQuote, fetchInciFromProductPage } from "@/lib/inci-from-page";

const h = vi.hoisted(() => ({ markdown: null as string | null }));
vi.mock("@/lib/scrape", async (orig) => ({ ...(await orig<typeof import("@/lib/scrape")>()), fetchPageMarkdown: async () => h.markdown }));

afterEach(() => { vi.unstubAllGlobals(); h.markdown = null; });

/* 2026-11-03: Be Minimalist's Vitamin B5 10% Moisturizer on beminimalist.co prints 22 entries, "All Ingredients Water/ Aqua, ... Carbomer,
   Ethylhexylglycerin", and the next section's heading follows with no punctuation: "Ethylhexylglycerin You might also like ...". The last comma piece is
   the entry and the copy together, far too long to be an entry, and was rejected whole, so the engine read 21 entries (ending at Carbomer). */
const URL = "https://beminimalist.co/products/vitamin-b5-10-moisturizer";
const LIST = [
  "Water/Aqua", "Cyclopentasiloxane", "Panthenol", "PEG/PPG-18/18 Dimethicone", "Glycerin", "Hydrogenated Polyisobutene", "Betaine", "Sodium Hyaluronate",
  "Allantoin", "Copper Gluconate", "Dimethicone Crosspolymer", "Xylitylglucoside", "Anhydroxylitol", "Xylitol", "Magnesium Aspartate", "Zinc Gluconate",
  "Pentylene Glycol", "Magnesium Sulphate Heptahydrate", "Phenoxyethanol", "Hydroxyethyl Acrylate/Sodium Acryloyldimethyl Taurate Copolymer", "Carbomer",
  "Ethylhexylglycerin",
];
const PRINTED = "Water/ Aqua, Cyclopentasiloxane, Panthenol, PEG/PPG-18/18 Dimethicone, Glycerin, Hydrogenated Polyisobutene, Betaine, Sodium Hyaluronate, Allantoin, Copper Gluconate, Dimethicone Crosspolymer, Xylitylglucoside, Anhydroxylitol, Xylitol, Magnesium Aspartate, Zinc Gluconate, Pentylene Glycol, Magnesium Sulphate Heptahydrate, Phenoxyethanol, Hydroxyethyl Acrylate/Sodium Acryloyldimethyl Taurate Copolymer, Carbomer, Ethylhexylglycerin";
const TAIL = "You might also like Salicylic Acid + LHA 2% Cleanser Acne, Breakouts Previous Next";
const LEAD = "Biosaccharide Gum A natural occlusive that forms a light, breathable layer on the skin. All Ingredients ";
const PAGE_TEXT = `${LEAD}${PRINTED} ${TAIL}`;

describe("completeLastEntry: a last entry the copy after the list ran on from", () => {
  it("shows the fault first: the extractor, which must not change, ends at Carbomer", () => {
    const raw = extractInciWithQuote(PAGE_TEXT);
    expect(raw?.ingredients).toHaveLength(21);
    expect(raw?.ingredients.at(-1)).toBe("Carbomer");
  });

  it("Be Minimalist: adds Ethylhexylglycerin, keeps the other 21 in order, and extends the quote to cover it", () => {
    const r = completeLastEntry(extractInciWithQuote(PAGE_TEXT), PAGE_TEXT);
    expect(r?.ingredients).toEqual(LIST);
    expect(r?.quote).toBe(PRINTED);
    expect(r?.quote.endsWith("Carbomer, Ethylhexylglycerin")).toBe(true);
    expect(PAGE_TEXT).toContain(r!.quote);
  });

  it("works on the markdown shape the keyless reader gives, where a heading and an image link follow", () => {
    const md = `## Ingredients\n\nAll Ingredients\n\n${PRINTED}\n\n## You might also like\n\nPrevious\n\n[![Image 55: Niacinamide 10% Face Serum](https://sfycdn.speedsize.com/56385b25/https://beminimalist.co/cdn/shop/files/Nia10New.png?v=1721398127&width=480)](https://beminimalist.co/products/niacinamide-10-face-serum)`;
    const raw = extractInciWithQuote(md);
    expect(raw?.ingredients.at(-1)).toBe("Carbomer");
    const r = completeLastEntry(raw, md);
    expect(r?.ingredients).toEqual(LIST);
    expect(r?.quote.endsWith("Carbomer, Ethylhexylglycerin")).toBe(true);
  });

  it("takes a two word ingredient whole, the longest that is exactly one", () => {
    const text = `${LEAD}${PRINTED.replace(", Ethylhexylglycerin", "")}, Salicylic Acid ${TAIL}`;
    const r = completeLastEntry(extractInciWithQuote(text), text);
    expect(r?.ingredients.at(-1)).toBe("Salicylic Acid");
    expect(r?.ingredients).toHaveLength(22);
    // "Sodium Hyaluronate" ends a list that goes on to "Crosspolymer": the longer ingredient wins.
    const longer = `${LEAD}${PRINTED.replace(", Ethylhexylglycerin", "")}, Sodium Hyaluronate Crosspolymer ${TAIL}`;
    expect(completeLastEntry(extractInciWithQuote(longer), longer)?.ingredients.at(-1)).toBe("Sodium Hyaluronate Crosspolymer");
  });

  it("accepts the water and fragrance spellings the normaliser folds, which the reference data does not hold under that name", () => {
    for (const name of ["Parfum", "Fragrance", "Water", "Eau"]) {
      const text = `${LEAD}${PRINTED.replace(", Ethylhexylglycerin", "")}, ${name} ${TAIL}`;
      const r = completeLastEntry(extractInciWithQuote(text), text);
      expect(r?.ingredients.at(-1)).toBe(name);
    }
  });

  it("adds an entry in the spelling the page uses, tidied like any other entry", () => {
    const text = `${LEAD}${PRINTED.replace(", Ethylhexylglycerin", "")}, ethylhexylglycerin ${TAIL}`;
    expect(completeLastEntry(extractInciWithQuote(text), text)?.ingredients.at(-1)).toBe("ethylhexylglycerin");
  });
});

describe("completeLastEntry: adds nothing it is not sure of", () => {
  const body = PRINTED.replace(", Ethylhexylglycerin", "");
  const same = (tail: string) => {
    const text = `${LEAD}${body}${tail}`;
    const raw = extractInciWithQuote(text);
    expect(raw).not.toBeNull();
    expect(completeLastEntry(raw, text)).toBe(raw);
  };

  it("a list followed by copy that is not an ingredient is returned as it was", () => {
    same(", Free Shipping Over 499 You might also like Salicylic Acid + LHA 2% Cleanser Acne, Breakouts");
    same(", Zorbaxium Extrax You might also like Salicylic Acid + LHA 2% Cleanser Acne, Breakouts");
    same(", You might also like Salicylic Acid + LHA 2% Cleanser Acne, Breakouts");
  });

  it("an ingredient name that opens a sentence is not an entry: a lower case word follows it", () => {
    same(", Glycerin helps skin hold on to moisture all day, so a little goes a long way for dry skin types everywhere");
    same(", Tocopherol and citric acid are added to keep the formula fresh for longer, as the brand explains on this page");
  });

  it("an entry the list already has is not added a second time", () => {
    same(", Glycerin You might also like Salicylic Acid + LHA 2% Cleanser Acne, Breakouts");
  });

  it("no comma after the list: nothing to add, even when an ingredient name opens the next sentence", () => {
    same(". Glycerin You might also like Salicylic Acid + LHA 2% Cleanser Acne, Breakouts");
  });

  it("a list ending in a full stop already has its last entry; nothing is added after it", () => {
    const text = `${LEAD}${PRINTED}. ${TAIL}`;
    const raw = extractInciWithQuote(text);
    expect(raw?.ingredients).toEqual(LIST);
    expect(completeLastEntry(raw, text)).toBe(raw);
  });

  it("a list that ends the page with its last entry is returned as it was", () => {
    const text = `${LEAD}${PRINTED}`;
    const raw = extractInciWithQuote(text);
    expect(raw?.ingredients).toEqual(LIST);
    expect(completeLastEntry(raw, text)).toBe(raw);
  });

  it("adds one entry at most, never the ingredient after it, and never reorders", () => {
    const text = `${LEAD}${body}, Ethylhexylglycerin Sodium Benzoate Potassium Sorbate Citric Acid Tocopherol Allantoin ${TAIL}`;
    const r = completeLastEntry(extractInciWithQuote(text), text);
    expect(r?.ingredients).toEqual(LIST);
  });

  it("passes a null through and leaves a quote that is not in the text as it was", () => {
    expect(completeLastEntry(null, PAGE_TEXT)).toBeNull();
    const raw = extractInciWithQuote(PAGE_TEXT);
    expect(completeLastEntry(raw, "a different page")).toBe(raw);
  });

  it("uses the first copy of a list printed twice that is followed by such an entry", () => {
    const first = `${LEAD}${body}. ${TAIL}`;
    const raw = extractInciWithQuote(first);
    expect(raw?.ingredients).toHaveLength(21);
    const text = `${first} ... ${LEAD}${body}, Ethylhexylglycerin ${TAIL}`;
    expect(completeLastEntry(raw, text)?.ingredients.at(-1)).toBe("Ethylhexylglycerin");
    expect(completeLastEntry(raw, text)?.ingredients).toHaveLength(22);
    expect(completeLastEntry(raw, first)).toBe(raw);
  });
});

describe("completeLastEntry: on generated lists", () => {
  const POOL = ["Aqua", "Glycerin", "Niacinamide", "Panthenol", "Allantoin", "Xylitol", "Squalane", "Dimethicone", "Betaine", "Carbomer", "Tocopherol", "Phenoxyethanol", "Sodium Hyaluronate", "Caprylyl Glycol", "Sodium Benzoate", "Potassium Sorbate", "Citric Acid", "Sodium Hydroxide", "Salicylic Acid", "Ethylhexylglycerin"];
  const HEADINGS = ["You might also like", "Customers Also Bought", "Related Products", "Recently Viewed", "Add To Cart", "Frequently Bought Together With"];
  let seed = 20261103;
  const rand = (n: number) => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed % n; };

  it("puts back the last entry on 300 lists followed by a heading, and leaves the first entries as they were", () => {
    let fixed = 0;
    for (let i = 0; i < 300; i++) {
      const size = 6 + rand(9);
      const pool = [...POOL].sort(() => rand(3) - 1);
      const list = pool.slice(0, size);
      const heading = HEADINGS[rand(HEADINGS.length)];
      const text = `A lovely product that is good for the skin. All Ingredients ${list.join(", ")} ${heading} Salicylic Acid + LHA 2% Cleanser Acne, Breakouts`;
      const raw = extractInciWithQuote(text);
      expect(raw?.ingredients).toEqual(list.slice(0, -1));
      const r = completeLastEntry(raw, text);
      expect(r?.ingredients).toEqual(list);
      expect(r?.quote).toBe(list.join(", "));
      fixed++;
    }
    expect(fixed).toBe(300);
  });
});

describe("fetchInciFromProductPage: the page read ends with the brand's last entry", () => {
  const serve = (html: string) => vi.stubGlobal("fetch", vi.fn(async () => new Response(html, { status: 200 })));

  it("from the Jina markdown, when the page's HTML gives no list (the engine's actual read of Be Minimalist)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("no", { status: 503 })));
    h.markdown = `Title: Vitamin B5 10% Moisturizer\n\n## Ingredients\n\nAll Ingredients\n\n${PRINTED}\n\n## You might also like\n\nPrevious\n\n[![Image 55: Face Serum](https://beminimalist.co/cdn/shop/files/a.png?v=1&width=480)](https://beminimalist.co/products/niacinamide-10-face-serum)`;
    const read = await fetchInciFromProductPage(URL);
    expect(read?.ingredients).toEqual(LIST);
    expect(read?.ingredients).toHaveLength(22);
    expect(read?.quote?.endsWith("Carbomer, Ethylhexylglycerin")).toBe(true);
    expect(read?.source).toBe(URL);
  });

  it("from the page's HTML, when only inline tags (no block boundary) lie between the list and the heading after it", async () => {
    serve(`<html><head><title>Vitamin B5 10% Moisturizer | Be Minimalist</title></head><body><p>All Ingredients ${PRINTED}<span> You might also like</span> <a href="/x">Salicylic Acid + LHA 2% Cleanser Acne</a></p></body></html>`);
    const read = await fetchInciFromProductPage(URL);
    expect(read?.ingredients).toEqual(LIST);
    expect(read?.quote?.endsWith("Carbomer, Ethylhexylglycerin")).toBe(true);
  });

  it("a list that already ends cleanly is read as before", async () => {
    serve(`<html><body><div>All Ingredients ${PRINTED}</div><h2>You might also like</h2></body></html>`);
    const read = await fetchInciFromProductPage(URL);
    expect(read?.ingredients).toEqual(LIST);
  });
});
