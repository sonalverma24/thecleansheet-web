import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeReview } from "@/lib/review.fixtures";
import type { BrandCatalogue } from "@/lib/brand-catalogue";

/* runProductReview when the search names no specific product (src/lib/specific-product.ts).

   Owner rule, 2026-11-02: a search for just a brand, or a generic term, must ask the shopper which product they mean, or show no result, and is never saved as a product.
   Three tiles had been made that way: "Sunscreen" became "M .Y Sunscreen" by "M .Y Sunscreen", "Dot and key" became "Dot and key" by "Dot and key", and "Cetaphil"
   became "Cetaphil" by "Cetaphil". Here the model is asked nothing when the text typed is only a brand or a kind of product, nothing is saved when the model
   answers with the brand again, and a typed product name still saves. Every outside dependency is replaced. */
const h = vi.hoisted(() => {
  const upserts: Record<string, unknown>[] = [];
  const chain: unknown = new Proxy(function () {}, {
    get: (_t, prop) => {
      if (prop === "then") return (resolve: (v: unknown) => void) => resolve({ data: null, error: null });
      if (prop === "upsert") return (row: Record<string, unknown>) => { upserts.push(row); return chain; };
      return () => chain;
    },
    apply: () => chain,
  });
  const catalogue: { value: BrandCatalogue } = { value: { tableBrands: [], rows: [] } };
  return { upserts, chain, catalogue, generate: vi.fn(), fetchPage: vi.fn(), brandInci: vi.fn(), resolve: vi.fn(), registry: vi.fn() };
});

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => h.chain }));
vi.mock("@/lib/brand-catalogue", async (orig) => ({ ...(await orig<typeof import("@/lib/brand-catalogue")>()), getBrandCatalogue: async () => h.catalogue.value }));
vi.mock("@/lib/gemini", async (orig) => ({ ...(await orig<typeof import("@/lib/gemini")>()), generateResilientWithMeta: h.generate }));
vi.mock("@/lib/inci-fetch", async (orig) => ({
  ...(await orig<typeof import("@/lib/inci-fetch")>()),
  resolveINCI: async (...args: unknown[]) => { h.resolve(...args); return { chosen: null, distinct: [], ambiguous: false }; },
}));
vi.mock("@/lib/inci-from-page", async (orig) => ({ ...(await orig<typeof import("@/lib/inci-from-page")>()), fetchInciFromProductPage: async () => null }));
vi.mock("@/lib/brand-inci", async (orig) => ({ ...(await orig<typeof import("@/lib/brand-inci")>()), findBrandInci: (...args: unknown[]) => h.brandInci(...args) }));
vi.mock("@/lib/scrape", async (orig) => ({ ...(await orig<typeof import("@/lib/scrape")>()), fetchPageMarkdown: (...a: unknown[]) => h.fetchPage(...a) }));
vi.mock("@/lib/product-image", async (orig) => ({
  ...(await orig<typeof import("@/lib/product-image")>()),
  findProductReviewImage: async () => null, isLiveImage: async () => false,
}));
vi.mock("@/lib/evidence-images", () => ({ imageEvidenceBlock: async () => "" }));
vi.mock("@/lib/ingredient-directory", () => ({ addDiscoveredNames: async () => undefined }));
vi.mock("@/lib/verified-store", async (orig) => ({ ...(await orig<typeof import("@/lib/verified-store")>()), upsertVerifiedProduct: (...a: unknown[]) => h.registry(...a) }));
vi.mock("next/cache", () => ({ revalidatePath: () => undefined }));

import { runProductReview } from "@/lib/product-review-engine";

const modelSays = (over: Parameters<typeof makeReview>[0] = {}) => ({ text: JSON.stringify(makeReview(over)), groundingMetadata: { webSearchQueries: ["q"], sourceUris: ["https://v/1"], sourceTitles: ["v.in"] } });
const page = (title: string) => `Title: ${title}\n\n${"This is the product page. ".repeat(20)}`;
/** Rows written to the review repository (the engine stores `{ result }`; nothing else carries it). */
const savedReviews = () => h.upserts.filter((row) => "result" in row);
/** Nothing was analysed, looked up, saved, registered or listed. */
const nothingHappened = () => {
  expect(h.generate).not.toHaveBeenCalled();
  expect(h.resolve).not.toHaveBeenCalled();
  expect(h.brandInci).not.toHaveBeenCalled();
  expect(h.registry).not.toHaveBeenCalled();
  expect(h.upserts).toEqual([]);
};

const row = (brand: string, name: string, slug: string, rubricRev = "r7") => ({ brand, name, slug, rubricRev });
/** What the database held on 2026-11-02, in short: the junk tiles were gone, and these brands had analyses. */
const HELD: BrandCatalogue = {
  tableBrands: ["Dot & Key", "Cetaphil", "Minimalist", "The Derma Co"],
  rows: [
    row("Dot & Key", "Dot & Key Watermelon Cooling Sunscreen", "dot-key-watermelon-cooling-sunscreen"),
    row("Dot & Key", "Dot & Key Strawberry Dew Brightening Moisturizer", "dot-key-dot-key-strawberry-dew-brightening-moisturizer", "r9"),
    row("Dot & Key", "Dot & Key Old Formula Serum", "dot-key-old-formula-serum", "r1"), // a revision the page no longer serves
    row("Dot & Key", "Dot and key", "dot-and-key-"), // a junk row of the kind this change stops being made: never offered
    row("Cetaphil", "Cetaphil Gentle Skin Cleanser", "cetaphil-gentle-skin-cleanser"),
    row("Cetaphil", "Cetaphil Daily Facial Moisturizer", "cetaphil-daily-facial-moisturizer"),
    row("La Roche-Posay", "La Roche-Posay Cicaplast Balm", "la-roche-posay-cicaplast-balm"), // retracted
    row("La Roche-Posay", "La Roche-Posay Anthelios UVMune 400", "la-roche-posay-anthelios-uvmune-400"),
  ],
};

let n = 0;
beforeEach(() => {
  h.upserts.length = 0;
  h.generate.mockReset();
  h.fetchPage.mockReset();
  h.brandInci.mockReset();
  h.resolve.mockReset();
  h.registry.mockReset();
  h.catalogue.value = HELD;
  vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("no network in this test"); }));
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("the three searches that made the junk tiles", () => {
  it('"Sunscreen" asks which product, and analyses and saves nothing', async () => {
    expect(await runProductReview("Sunscreen")).toEqual({ type: "needs-product", query: "Sunscreen", brand: null, suggestions: [] });
    nothingHappened();
  });

  it('"Dot and key" asks which Dot & Key product, offers the analysed ones, and analyses and saves nothing', async () => {
    const out = await runProductReview("Dot and key");
    expect(out).toEqual({
      type: "needs-product",
      query: "Dot and key",
      brand: "Dot & Key",
      suggestions: [
        { name: "Dot & Key Strawberry Dew Brightening Moisturizer", slug: "dot-key-dot-key-strawberry-dew-brightening-moisturizer" },
        { name: "Dot & Key Watermelon Cooling Sunscreen", slug: "dot-key-watermelon-cooling-sunscreen" },
      ],
    });
    nothingHappened();
  });

  it('"Cetaphil" asks which Cetaphil product, offers the analysed ones, and analyses and saves nothing', async () => {
    const out = await runProductReview("Cetaphil");
    expect(out).toMatchObject({ type: "needs-product", brand: "Cetaphil", suggestions: [{ slug: "cetaphil-daily-facial-moisturizer" }, { slug: "cetaphil-gentle-skin-cleanser" }] });
    nothingHappened();
  });
});

describe("a search that is only a brand, or a kind of product", () => {
  it.each([
    ["a brand in capitals with a mark", "CETAPHIL!", "Cetaphil"],
    ["a brand spelt with a dash", "dot-and-key", "Dot & Key"],
    ["a brand and a noun", "Cetaphil cleanser", "Cetaphil"],
    ["a brand and a sun rating", "Dot and key sunscreen SPF 50", "Dot & Key"],
    ["a brand we hold no analysis of, from the built-in list", "CeraVe", "CeraVe"],
    ["a brand with a company word left off", "derma co", "The Derma Co"],
  ])("asks which product for %s, naming the brand", async (_label, typed, brand) => {
    const out = await runProductReview(typed);
    expect(out).toMatchObject({ type: "needs-product", brand });
    nothingHappened();
  });

  it.each(["face wash", "SPF 50", "niacinamide serum", "moisturiser for oily skin", "best sunscreen for oily skin in India", "acne", "Is niacinamide safe in pregnancy"])("asks which product for the kind of product %j, naming no brand", async (typed) => {
    expect(await runProductReview(typed)).toEqual({ type: "needs-product", query: typed, brand: null, suggestions: [] });
    nothingHappened();
  });

  it("offers nothing when the brand has no analysis we may serve, and still asks", async () => {
    const out = await runProductReview("La Roche-Posay");
    expect(out).toMatchObject({ type: "needs-product", brand: "La Roche-Posay", suggestions: [{ slug: "la-roche-posay-anthelios-uvmune-400" }] }); // the retracted one is not offered
    const none = await runProductReview("Minimalist");
    expect(none).toMatchObject({ type: "needs-product", brand: "Minimalist", suggestions: [] });
  });

  it("is still asked when the repository cannot be read: the built-in brand list stands", async () => {
    h.catalogue.value = { tableBrands: [], rows: [] };
    expect(await runProductReview("Cetaphil")).toEqual({ type: "needs-product", query: "Cetaphil", brand: "Cetaphil", suggestions: [] });
    nothingHappened();
  });

  it("never saves, whatever else happens: nothing is written for any of them", async () => {
    for (const typed of ["Sunscreen", "Dot and key", "Cetaphil", "face wash", "CeraVe moisturiser"]) await runProductReview(typed);
    expect(h.upserts).toEqual([]);
  });
});

describe("a search that names a product", () => {
  it("is analysed and saved when it is a typed product name", async () => {
    h.generate.mockResolvedValue(modelSays({ productName: "Cetaphil Gentle Skin Cleanser", brand: "Cetaphil" }));
    const out = await runProductReview("Cetaphil Gentle Skin Cleanser");
    expect(out.type).toBe("product-review");
    expect(savedReviews()).toHaveLength(1);
  });

  it("is analysed and saved when a brand's own words are typed with a product's: Dot and key watermelon sunscreen", async () => {
    h.generate.mockResolvedValue(modelSays({ productName: "Dot & Key Watermelon Cooling Sunscreen", brand: "Dot & Key" }));
    const out = await runProductReview("Dot and key watermelon sunscreen");
    expect(out.type).toBe("product-review");
    expect(savedReviews()).toHaveLength(1);
  });

  it("is analysed when it is a link, whatever the page is called", async () => {
    h.fetchPage.mockResolvedValue(page("Cetaphil Gentle Skin Cleanser"));
    h.generate.mockResolvedValue(modelSays({ productName: "Cetaphil Gentle Skin Cleanser", brand: "Cetaphil" }));
    const out = await runProductReview("https://www.nykaa.com/cetaphil-gentle-skin-cleanser/p/1");
    expect(out.type).toBe("product-review");
  });

  it("is served, not asked about, when it is exactly the name of a product we hold, even if every word is a kind-of-product word", async () => {
    h.catalogue.value = { tableBrands: [], rows: [row("Glow Lab", "Hydrating Gel Cream", "glow-lab-hydrating-gel-cream")] };
    h.generate.mockResolvedValue(modelSays({ productName: "Hydrating Gel Cream", brand: "Glow Lab" }));
    const out = await runProductReview("Hydrating Gel Cream");
    expect(out.type).toBe("product-review");
  });
});

describe("a result that names no product is not saved", () => {
  // Each case types text of its own: an answer that is not saved is remembered under the text it came from.
  it.each([
    ["the brand again as the product", "Cetaphil", "Cetaphil"],
    ["the brand again, spelt differently", "Dot and key", "Dot & Key"],
    ["the brand and a kind of product", "Cetaphil Cleanser", "Cetaphil"],
    ["a kind of product alone", "Sunscreen", "Dot & Key"],
  ])("when the model answers with %s", async (_label, productName, brand) => {
    h.generate.mockResolvedValue(modelSays({ productName, brand }));
    const out = await runProductReview(`the blue one from the shop ${++n}`);
    expect(out).toMatchObject({ type: "needs-product", brand: null, suggestions: [] }); // the person typed no brand, so none is put in their mouth, even a real one the model chose
    expect(savedReviews()).toEqual([]);
    expect(h.registry).not.toHaveBeenCalled();
  });

  it("names the brand when the person typed it and the model's answer is the brand again", async () => {
    h.generate.mockResolvedValue(modelSays({ productName: "Zorbex", brand: "Zorbex" }));
    const out = await runProductReview("Zorbex glow");
    expect(out).toEqual({ type: "needs-product", query: "Zorbex glow", brand: "Zorbex", suggestions: [] });
    expect(savedReviews()).toEqual([]);
  });

  it("asks without naming a brand the model made up: a search for nothing in particular answered 'M .Y Sunscreen' by 'M .Y Sunscreen'", async () => {
    h.generate.mockResolvedValue(modelSays({ productName: "M .Y Sunscreen", brand: "M .Y Sunscreen" }));
    const out = await runProductReview(`zzq sun thing ${++n}`);
    expect(out).toMatchObject({ type: "needs-product", brand: null, suggestions: [] });
    expect(savedReviews()).toEqual([]);
  });

  it("asks when the search is only the brand the model returned and we did not know the brand", async () => {
    h.generate.mockResolvedValue(modelSays({ productName: "Zorbex Brightening Serum", brand: "Zorbex" }));
    const out = await runProductReview("Zorbex");
    expect(out).toEqual({ type: "needs-product", query: "Zorbex", brand: "Zorbex", suggestions: [] });
    expect(savedReviews()).toEqual([]);
  });

  it("still saves a product the model names when the search carries a word of its name: an unknown brand and its product", async () => {
    h.generate.mockResolvedValue(modelSays({ productName: "Zorbex Mineral Fluid SPF 50", brand: "Zorbex" }));
    const out = await runProductReview("Zorbex Mineral Fluid SPF 50");
    expect(out.type).toBe("product-review");
    expect(savedReviews()).toHaveLength(1);
  });

  it("does not ask the model again for the same search within five minutes", async () => {
    h.generate.mockResolvedValue(modelSays({ productName: "Cetaphil", brand: "Cetaphil" }));
    const typed = `the white tub ${++n}`;
    const first = await runProductReview(typed);
    const again = await runProductReview(`  ${typed.toUpperCase()}  `);
    expect(first.type).toBe("needs-product");
    expect(again.type).toBe("needs-product");
    expect(h.generate).toHaveBeenCalledTimes(1);
    expect(savedReviews()).toEqual([]);
  });

  it("does not save a link whose result is the brand again: it is unidentified, as an error page is", async () => {
    h.fetchPage.mockResolvedValue(page("Cetaphil"));
    h.generate.mockResolvedValue(modelSays({ productName: "Cetaphil", brand: "Cetaphil" }));
    const out = await runProductReview("https://brand.example.test/products/cetaphil-gentle-cleanser");
    expect(out).toEqual({ type: "unidentified" });
    expect(savedReviews()).toEqual([]);
  });
});

describe("what this does not change", () => {
  it("still analyses a pasted ingredient list, unsaved, even when it is made only of actives", async () => {
    h.generate.mockResolvedValue(modelSays({ productName: "Glow Lab Serum", brand: "Glow Lab" }));
    const out = await runProductReview("Niacinamide, Zinc Oxide, Titanium Dioxide, Retinol, Panthenol");
    expect(out.type).toBe("product-review");
    expect(savedReviews()).toEqual([]);
  });

  it("still returns an empty search as an error and a link that names no product as unidentified", async () => {
    expect(await runProductReview("   ")).toEqual({ type: "error" });
    h.fetchPage.mockResolvedValue(null);
    expect(await runProductReview("https://www.amazon.in/dp/B0ABC12345")).toEqual({ type: "unidentified" });
  });
});
