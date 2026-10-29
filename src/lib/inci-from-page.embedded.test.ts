import { afterEach, describe, expect, it, vi } from "vitest";
import { extractEmbeddedInci, extractInciFromHtml, extractInciFromText, extractInciWithQuote, fetchInciFromProductPage } from "@/lib/inci-from-page";

/* Alteryst's "Vitamin C & E Mineral Sunscreen" page. Its full ingredient list is not in the visible
   markup: the "Full ingredients" popup draws it from the page's own Next.js data, a
   self.__next_f.push script, as the escaped string field "ingredientsList". The brand also wrote
   "3-O-Ethyl Ascorbic Acid" as "3-0, ethyl ascorbic acid". Both are copied from the live page. */
const ALTERYST_URL = "https://alteryst.com/products/vitamin-c-e-mineral-face-sunscreen-spf-50-pa";
const ALTERYST_TEXT =
  "Aqua, Zinc Oxide, C12-15 Alkyl Benzoate, Cyclopentasiloxane, Coco-Caprylate/Caprate, Trimethylsiloxysilicate, PEG-10 Dimethicone, Glycerin, Niacinamide, Polyhydroxystearic Acid, Dimethicone, Tocopheryl Acetate, 3-0, ethyl ascorbic acid,Xylitylglucoside (and) Anhydroxylitol (and) Xylitol, titanium di oxide, Silica Silylate, Phenoxyethanol, Allantoin, Carbomer, Xanthan Gum, Ethylhexylglycerin,Disodium EDTA, Triethanolamine, Sodium Hydroxide,Parfum";
const ALTERYST_LIST = [
  "Aqua", "Zinc Oxide", "C12-15 Alkyl Benzoate", "Cyclopentasiloxane", "Coco-Caprylate/Caprate", "Trimethylsiloxysilicate",
  "PEG-10 Dimethicone", "Glycerin", "Niacinamide", "Polyhydroxystearic Acid", "Dimethicone", "Tocopheryl Acetate",
  "3-0,ethyl ascorbic acid", "Xylitylglucoside (and) Anhydroxylitol (and) Xylitol", "titanium di oxide", "Silica Silylate",
  "Phenoxyethanol", "Allantoin", "Carbomer", "Xanthan Gum", "Ethylhexylglycerin", "Disodium EDTA", "Triethanolamine",
  "Sodium Hydroxide", "Parfum",
];

/** The text as a Next.js flight chunk carries it: a JS string literal with \" quotes and < written as <. */
const flight = (field: string, text: string) => String.raw`\"${field}\":\"<p>${text}</p>\"`;
const nextPage = (inner: string, title = "Mineral Sunscreen with Vitamin C &amp; E SPF 50 PA++++ | Alteryst") =>
  `<html><head><title>${title}</title><meta property="og:site_name" content="Alteryst"/></head><body>` +
  `<div><h1>Mineral Sunscreen with Vitamin C &amp; E</h1><ul><li>Zinc Oxide</li><li>Titanium Dioxide</li></ul></div>` +
  `<script>self.__next_f.push([1,"${inner}"])</script></body></html>`;
const product = (handle: string, field = flight("ingredientsList", ALTERYST_TEXT)) =>
  String.raw`{\"slug\":\"${handle}\",\"name\":\"Mineral Sunscreen\",\"description\":\"<p>A light mineral sunscreen.</p>\",${field},\"brand\":\"Alteryst\"}`;
const HANDLE = "vitamin-c-e-mineral-face-sunscreen-spf-50-pa";

afterEach(() => vi.unstubAllGlobals());

describe("a locant fragment split from its name by a comma is joined, as '1, 2-Hexanediol' already is", () => {
  it("keeps the whole Alteryst list, not just the half after '3-0'", () => {
    const ex = extractInciWithQuote(ALTERYST_TEXT);
    expect(ex?.ingredients).toEqual(ALTERYST_LIST);
    expect(ex?.quote).toContain("3-0, ethyl ascorbic acid");
  });

  it("joins a letter locant the same way", () => {
    expect(extractInciFromText("Aqua, Glycerin, Niacinamide, 3-O, Ethyl Ascorbic Acid, Phenoxyethanol, Tocopherol")).toContain("3-O,Ethyl Ascorbic Acid");
  });

  it("still joins the digit-only case it did before", () => {
    expect(extractInciFromText("Aqua, Glycerin, 1, 2-Hexanediol, Sodium PCA, Allantoin, Panthenol, Tocopherol")).toContain("1,2-Hexanediol");
  });
});

describe("a list cut in two at its start by a gap is refused, not published as its longer half", () => {
  const head = "Aqua, Glycerin, Niacinamide, Zinc Oxide";
  const tail = "Dimethicone, Panthenol, Allantoin, Phenoxyethanol, Tocopherol, Parfum";

  it("an empty piece (a doubled comma) between a 4-entry head and the tail", () => {
    expect(extractInciFromText(`${head}, , ${tail}`)).toEqual([]);
    expect(extractInciWithQuote(`${head},, ${tail}`)).toBeNull();
  });

  it("a digit-and-dash fragment that cannot be re-joined (en dash) between head and tail", () => {
    expect(extractInciFromText(`${head}, 3–0, ${tail}`)).toEqual([]);
  });

  it("looks through a label glued to the first entry", () => {
    expect(extractInciFromText(`Ingredients: ${head}, , ${tail}`)).toEqual([]);
    expect(extractInciFromText(`Full Ingredients - Water, Glycerin, Niacinamide, ,${tail}`)).toEqual([]);
  });

  it("leaves a gap after the main list alone, so a secondary list does not veto it", () => {
    expect(extractInciFromText(`${tail}, , Aqua, Glycerin, Niacinamide`)).toHaveLength(6);
    expect(extractInciFromText(`Aqua, Glycerin, Niacinamide, Dimethicone, Mica, Phenoxyethanol, , CI 77891, CI 77492, CI 77499`)).toHaveLength(6);
  });

  it("does not touch a '+/-' separator, a trailing comma or a leading comma", () => {
    const main = "Aqua, Glycerin, Niacinamide, Dimethicone, Mica, Phenoxyethanol";
    expect(extractInciFromText(`${main}, +/-, CI 77891, CI 77492, CI 77499`)).toHaveLength(6);
    expect(extractInciFromText(`${main},`)).toHaveLength(6);
    expect(extractInciFromText(`, ${main}`)).toHaveLength(6);
  });

  it("does not treat plain numbers as a gap: a number is re-joined to the next piece, as before", () => {
    expect(extractInciFromText(`${head}, 400072, ${tail}`)).toHaveLength(10);
  });

  it("does not let a marketing line before a gap veto the real list after it", () => {
    const claims = "Dermatologically Tested, Water Resistant, Hypoallergenic, Non-comedogenic";
    expect(extractInciFromText(`${claims}, , ${tail}, Aqua`)).toHaveLength(7);
  });

  it("does not refuse a gap after fewer than three entries, or after a list that does not open with Aqua or Water", () => {
    expect(extractInciFromText(`Skin, Care, , ${tail}`)).toHaveLength(6);
    expect(extractInciFromText(`Zinc Oxide, Niacinamide, Vitamin E, , ${tail}`)).toHaveLength(6);
  });
});

describe("extractEmbeddedInci reads a list the page ships in its own data", () => {
  it("finds the Alteryst list in the Next.js flight chunk, as the popup does", () => {
    const html = nextPage(product(HANDLE));
    expect(extractInciFromHtml(html)).toEqual([]); // the visible text has no list: scripts are not read
    const ex = extractEmbeddedInci(html, ALTERYST_URL);
    expect(ex?.ingredients).toEqual(ALTERYST_LIST);
    expect(ex?.quote.startsWith("Aqua, Zinc Oxide")).toBe(true);
    expect(ex?.quote.endsWith("Sodium Hydroxide,Parfum")).toBe(true);
  });

  it("reads a plain JSON field (__NEXT_DATA__, a Shopify product blob)", () => {
    const html = `<html><body><script id="__NEXT_DATA__" type="application/json">{"props":{"product":{"handle":"${HANDLE}","title":"Mineral Sunscreen","ingredients":"Aqua, Glycerin, Niacinamide, Zinc Oxide, Dimethicone, Panthenol, Parfum"}}}</script></body></html>`;
    expect(extractEmbeddedInci(html, ALTERYST_URL)?.ingredients).toEqual(["Aqua", "Glycerin", "Niacinamide", "Zinc Oxide", "Dimethicone", "Panthenol", "Parfum"]);
  });

  it("ignores a field that holds an array of key ingredients", () => {
    const html = nextPage(String.raw`{\"slug\":\"${HANDLE}\",\"keyIngredients\":[{\"name\":\"Zinc Oxide\"},{\"name\":\"Niacinamide\"}],\"ingredients\":[{\"name\":\"Aqua\"}]}`);
    expect(extractEmbeddedInci(html, ALTERYST_URL)).toBeNull();
  });

  it("is not used when the page's own handle does not precede the field", () => {
    const html = nextPage(product("some-other-serum-for-the-face"));
    expect(extractEmbeddedInci(html, ALTERYST_URL)).toBeNull();
  });

  it("is not used when the handle is far from the field, so a related product's list is not taken", () => {
    const filler = "x".repeat(7000);
    const html = nextPage(String.raw`{\"slug\":\"${HANDLE}\",\"d\":\"${filler}\"}` + "," + product("another-product-in-a-carousel-ab"));
    expect(extractEmbeddedInci(html, ALTERYST_URL)).toBeNull();
  });

  it("is not used when the page ships two different lists", () => {
    const other = flight("ingredientsList", "Water, Glycerin, Butylene Glycol, Dimethicone, Cetyl Alcohol, Sodium Benzoate");
    const html = nextPage(product(HANDLE) + "," + product(HANDLE, other));
    expect(extractEmbeddedInci(html, ALTERYST_URL)).toBeNull();
  });

  it("accepts the same list twice (variants share one)", () => {
    const html = nextPage(product(HANDLE) + "," + product(HANDLE));
    expect(extractEmbeddedInci(html, ALTERYST_URL)?.ingredients).toEqual(ALTERYST_LIST);
  });

  it("applies the usual list rules: marketing copy in the field is not a list", () => {
    const copy = flight("ingredientsList", "8 Hours Water Resistant, Dermatologically Tested, Oil-Free Matte Finish, Clinically Proven, Broad Spectrum Protection");
    expect(extractEmbeddedInci(nextPage(product(HANDLE, copy)), ALTERYST_URL)).toBeNull();
  });

  it("needs a descriptive product handle in the URL", () => {
    const html = nextPage(product(HANDLE));
    expect(extractEmbeddedInci(html, "https://alteryst.com/")).toBeNull();
    expect(extractEmbeddedInci(html, "not a url")).toBeNull();
  });

  it("skips a field cut by an inner quote rather than reading half a list", () => {
    const cut = String.raw`\"ingredientsList\":\"Aqua, Glycerin, Niacinamide \\\"Pure\\\" Zinc Oxide, Dimethicone, Panthenol\"`;
    const html = nextPage(String.raw`{\"slug\":\"${HANDLE}\",${cut}}`);
    expect(extractEmbeddedInci(html, ALTERYST_URL)).toBeNull();
  });
});

describe("fetchInciFromProductPage uses the embedded list when the visible text has none", () => {
  const serve = (html: string) => vi.stubGlobal("fetch", vi.fn(async () => new Response(html, { status: 200 })));

  it("returns the full Alteryst list with its quote, source and the page's titles", async () => {
    serve(nextPage(product(HANDLE)));
    const page = await fetchInciFromProductPage(ALTERYST_URL);
    expect(page?.ingredients).toEqual(ALTERYST_LIST);
    expect(page?.source).toBe(ALTERYST_URL);
    expect(page?.quote?.startsWith("Aqua, Zinc Oxide")).toBe(true);
    expect(page?.pageTitles?.[0]).toBe("Mineral Sunscreen with Vitamin C & E SPF 50 PA++++ | Alteryst");
    expect(page?.siteName).toBe("Alteryst");
  });

  it("prefers the longer list when the visible text has a partial one", async () => {
    const partial = "<p>Ingredients: Aqua, Zinc Oxide, Glycerin, Niacinamide, Dimethicone, Tocopheryl Acetate</p>";
    serve(nextPage(product(HANDLE)).replace("<body>", `<body>${partial}`));
    expect((await fetchInciFromProductPage(ALTERYST_URL))?.ingredients).toHaveLength(ALTERYST_LIST.length);
  });

  it("keeps the visible list when it is the longer or equal one", async () => {
    const visible = "<p>Ingredients: Water, Glycerin, Butylene Glycol, Dimethicone, Cetyl Alcohol, Sodium Benzoate, Panthenol, Allantoin, Tocopherol, Parfum, Citric Acid, Carbomer</p><h2>How to use</h2>";
    serve(nextPage(product(HANDLE, flight("ingredientsList", "Water, Glycerin, Butylene Glycol, Dimethicone, Cetyl Alcohol, Sodium Benzoate"))).replace("<body>", `<body>${visible}`));
    expect((await fetchInciFromProductPage(ALTERYST_URL))?.ingredients[0]).toBe("Water");
    expect((await fetchInciFromProductPage(ALTERYST_URL))?.ingredients).toHaveLength(12);
  });
});
