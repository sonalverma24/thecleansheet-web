import { describe, expect, it, vi } from "vitest";
import { findBrandInci, namedWordsInList, retailerWords, type Dependencies, type SearchTitle } from "./brand-inci";
import type { PageINCI } from "./inci-from-page";

vi.mock("./scrape", async (orig) => ({ ...(await orig<typeof import("./scrape")>()), fetchPageMarkdown: vi.fn().mockResolvedValue(null) }));

/* Live case, 2026-11-16: the analysis of Lacto Calamine "Sunscreen SPF 50 PA+++ For Oily Skin" was Grey with no list. INKEE Decoder has the product as
   "Lacto Calamine SPF 50 PA++ (Kaolin Clay With Lemon Extracts)": a Decoder search for our name lists nothing (it wants every word), and the page's name fails the
   title rule against ours (5 of 8 words). Retailers' titles carry the missing words: Nykaa sells it "With Kaolin Clay & Lemon Extracts", 1mg "with Kaolin Clay Lemon
   Extract". The owner confirmed the Kaolin page is this product. The titles below are those retailers' (from a web search that day). */
const brand = "Lacto Calamine";
const query = "Lacto Calamine Sunscreen SPF 50 PA+++ For Oily Skin";
const titles: SearchTitle[] = [
  { url: "https://www.nykaa.com/lacto-calamine-daily-sunshield-matte-look-sunscreen-spf-50-pa-50g/p/751354", title: "Lacto Calamine Daily Sunscreen SPF 50 PA +++ For Oily Skin With Kaolin Clay & Lemon Extracts(50gm)" },
  { url: "https://www.1mg.com/otc/lacto-calamine-sunscreen-with-kaolin-clay-lemon-extract-spf-50-pa-uva-uvb-paraben-free-otc1094434", title: "Lacto Calamine Sunscreen with Kaolin Clay Lemon Extract SPF 50 PA+++ UVA UVB Paraben Free: Buy tube of 50 gm Cream at best price in India | 1mg" },
  { url: "https://csc.1mg.com/otc/lacto-calamine-sunscreen-with-kaolin-clay-lemon-extract-spf-50-pa-uva-uvb-paraben-free-otc732381", title: "Lacto Calamine Sunscreen with Kaolin Clay Lemon Extract SPF 50 PA+++ | 1mg" },
  { url: "https://reach.dog/shop/pushmycart/products/lacto-calamine-sunscreen-spf-50", title: "Lacto Calamine Sunscreen SPF 50 PA+++ Sunscreen For Oily Skin With Kaolin Clay And Lemon Extracts 50 g" },
  { url: "https://pharmeasy.in/health-care/products/lacto-calamine-daily-sunshield-matte-look-sunscreen-spf-50-pa-for-oily-skin-light-non-sticky---50g-236682", title: "Lacto Calamine Daily Sunshield Matte Look Sunscreen SPF 50 PA+++ For Oily Skin Light Non Sticky - 50g" },
  { url: "https://www.purplle.com/product/lacto-calamine-daily-sunshield-matte-look-sunscreen-spf-50-pa-50g", title: "Lacto Calamine Daily Sunshield Matte Look Sunscreen SPF 50 PA+++ For Oily Skin 50g" },
  // Another of the brand's products, which a search for the brand also finds: its words must not count.
  { url: "https://www.nykaa.com/lacto-calamine-face-wash/p/1", title: "Lacto Calamine Oil Balance Face Wash With Kaolin Clay & Cucumber" },
  { url: "https://www.amazon.in/lacto-calamine-face-wash/dp/2", title: "Lacto Calamine Oil Balance Face Wash With Kaolin Clay & Cucumber" },
];

const decoder = (slug: string) => `https://inkeedecoder.com/products/${slug}`;
const KAOLIN = decoder("lacto-calamine-spf-50-pa-kaolin-clay-with-lemon-extracts");
const DEWY = decoder("lacto-calamine-dewy-sunscreen-spf-50-pa");
const MATTE = decoder("lacto-calamine-daily-sunshield-matte-look-sunscreen-spf-50-pa");
const entries: Record<string, { name: string; url: string }> = {
  kaolin: { name: "Lacto Calamine SPF 50 PA++ (Kaolin Clay With Lemon Extracts)", url: KAOLIN },
  dewy: { name: "Lacto Calamine Dewy Sunscreen SPF 50 PA+++", url: DEWY },
  matte: { name: "Lacto Calamine Daily Sunshield Matte Look Sunscreen SPF 50 PA+++", url: MATTE },
};
const kaolinList = ["Purified Water", "C12-C15 Alkyl Benzoate", "Ethylhexyl Methoxycinnamate", "Kaolin", "Octocrylene", "Glycerin", "Zinc Oxide", "Glyceryl Stearate", "Butyl Methoxydibenzoylmethane", "Citrus Limon Fruit Extract", "Phenoxyethanol", "Parfum"];
const matteList = ["Aqua", "Titanium Dioxide", "Octyl Methoxycinnamate", "Cetearyl Alcohol", "Cocoglucoside", "Sodium Acryloyldimethyl Taurate Copolymer", "Isohexadecane", "Polysorbate 60", "Propylene Glycol", "Phenoxyethanol"];
const dewyList = ["Purified Water", "Ethylhexyl Methoxycinnamate", "Ethylhexyl Methoxycrylene", "Cyclopentasiloxane", "Cetearyl Alcohol", "Niacinamide", "Zinc Oxide", "Glycerin", "Parfum"];
const page = (url: string, name: string, ingredients: string[]): PageINCI =>
  ({ ingredients, source: url, quote: ingredients.join(", "), pageTitles: [name, `${name} ingredients (Explained)`], siteName: "INKEE Decoder", trust: 3, origin: "decoder" });
const pages: Record<string, PageINCI> = {
  [KAOLIN]: page(KAOLIN, entries.kaolin.name, kaolinList),
  [DEWY]: page(DEWY, entries.dewy.name, dewyList),
  [MATTE]: page(MATTE, entries.matte.name, matteList),
};

/** Decoder's search as it answered on 2026-11-16: every word must be in the name. */
const decoderSearch = async (q: string) => {
  const want = q.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return Object.values(entries).filter((e) => { const name = e.name.toLowerCase().replace("extracts", "extracts extract"); return want.every((w) => name.includes(w)); });
};

const deps = (over: Partial<Dependencies> = {}): Dependencies => ({
  search: async () => [], read: async () => null, readDecoder: async (u) => pages[u] ?? null,
  searchTitles: async () => titles, searchDecoder: vi.fn(decoderSearch), ...over,
});

describe("words retailers use for the product", () => {
  it("are the words two or more sites' titles for this product carry and its name lacks, distinctive ones apart", () => {
    const { words, distinctive } = retailerWords(titles, brand, query);
    expect(distinctive).toEqual(expect.arrayContaining(["kaolin", "clay", "lemon", "daily", "sunshield", "matte", "look"]));
    expect(words).toContain("extract");
    expect(distinctive).not.toContain("extract");
    // Shop words, sizes and labels never count; nor do another product's words (the face wash's "cucumber", "balance").
    for (const w of ["buy", "price", "india", "uva", "paraben", "gm", "cucumber", "balance", "wash"]) expect(words).not.toContain(w);
  });
  it("need two sites: one shop's wording is not enough", () => {
    expect(retailerWords([titles[0]], brand, query).words).toEqual([]);
    // Two pages of one shop (www.1mg.com, csc.1mg.com) are one site.
    expect(retailerWords([titles[1], titles[2]], brand, query).words).toEqual([]);
  });
  it("count a name's promise only when its list holds the ingredient", () => {
    expect(namedWordsInList(entries.kaolin.name, brand, ["kaolin", "clay", "lemon"], kaolinList)).toBe(1);
    expect(namedWordsInList(entries.matte.name, brand, ["daily", "sunshield", "matte", "look"], matteList)).toBe(0);
  });
});

describe("a Decoder page found by the words retailers use", () => {
  it("finds Lacto Calamine's Kaolin page, marked as identified by retailers' titles, under our own name", async () => {
    const d = deps();
    const found = await findBrandInci(query, brand, undefined, d);
    expect(found).toMatchObject({ source: KAOLIN, origin: "decoder", trust: 3, identity: "retailer-titles", ingredients: kaolinList });
    expect(d.searchDecoder).toHaveBeenCalledWith("Lacto Calamine kaolin");
  });
  it("never takes a variant whose name has a word no retailer gave (Dewy)", async () => {
    const found = await findBrandInci(query, brand, undefined, deps({ readDecoder: async (u) => (u === DEWY ? pages[DEWY] : null) }));
    expect(found).toBeNull();
  });
  it("gives nothing when two names fit and neither's list holds what its name promises", async () => {
    const tie = { ...pages, [KAOLIN]: page(KAOLIN, entries.kaolin.name, kaolinList.filter((i) => i !== "Kaolin")) };
    expect(await findBrandInci(query, brand, undefined, deps({ readDecoder: async (u) => tie[u] ?? null }))).toBeNull();
  });
  it("is not looked for when retailers' titles add no word, or without the searches", async () => {
    const searchDecoder = vi.fn(decoderSearch);
    expect(await findBrandInci(query, brand, undefined, deps({ searchTitles: async () => titles.slice(6), searchDecoder }))).toBeNull();
    expect(searchDecoder).not.toHaveBeenCalled();
    expect(await findBrandInci(query, brand, undefined, deps({ searchTitles: undefined }))).toBeNull();
  });
  it("runs only when nothing else gave a list: a page the normal search finds is used without it", async () => {
    const searchTitles = vi.fn(async () => titles);
    const own = { ...pages[KAOLIN], pageTitles: [query] };
    expect(await findBrandInci(query, brand, undefined, deps({ search: async () => [KAOLIN], readDecoder: async () => own, searchTitles }))).toMatchObject({ source: KAOLIN });
    expect(searchTitles).not.toHaveBeenCalled();
  });
  it("runs alongside the model, and a page the model found is still weighed with it", async () => {
    const askModel = vi.fn(async () => [] as string[]);
    expect(await findBrandInci(query, brand, undefined, deps({ askModel }))).toMatchObject({ source: KAOLIN });
    expect(askModel).toHaveBeenCalled();
  });
});
