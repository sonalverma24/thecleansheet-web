import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeReview } from "@/lib/review.fixtures";

/* runProductReview when the input does not establish which product it is about.

   A URL that names no product, or whose page is an error page, must come back as "unidentified":
   the model is not asked, and nothing is saved. A pasted ingredient list is a different case and
   must keep working: it has no product name by design, so it is reviewed, shown to the person who
   pasted it, and kept out of the saved repository, in whatever format it was pasted. A typed product name still
   saves, unless the model could only title it with a placeholder. Every outside dependency is replaced. */
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
  return { upserts, chain, generate: vi.fn(), fetchPage: vi.fn(), brandInci: vi.fn() };
});

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => h.chain }));
vi.mock("@/lib/gemini", async (orig) => ({ ...(await orig<typeof import("@/lib/gemini")>()), generateResilientWithMeta: h.generate }));
vi.mock("@/lib/inci-fetch", async (orig) => ({
  ...(await orig<typeof import("@/lib/inci-fetch")>()),
  resolveINCI: async () => ({ chosen: null, distinct: [], ambiguous: false }),
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
vi.mock("@/lib/verified-store", async (orig) => ({ ...(await orig<typeof import("@/lib/verified-store")>()), upsertVerifiedProduct: async () => undefined }));
vi.mock("next/cache", () => ({ revalidatePath: () => undefined }));

import { runProductReview } from "@/lib/product-review-engine";

const modelSays = (over: Parameters<typeof makeReview>[0] = {}) => ({ text: JSON.stringify(makeReview(over)), groundingMetadata: { webSearchQueries: ["q"], sourceUris: ["https://v/1"], sourceTitles: ["v.in"] } });
const page = (title: string) => `Title: ${title}\n\n${"This is the product page. ".repeat(20)}`;
/** Rows written to the review repository (the engine stores `{ result }`; nothing else carries it). */
const savedReviews = () => h.upserts.filter((row) => "result" in row);

beforeEach(() => {
  h.upserts.length = 0;
  h.generate.mockReset();
  h.fetchPage.mockReset();
  vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("no network in this test"); }));
});

describe("runProductReview: a URL that does not establish the product", () => {
  it("returns unidentified, asks no model and saves nothing, when the page failed to load and the URL names no product", async () => {
    h.fetchPage.mockResolvedValue(null);
    const out = await runProductReview("https://www.amazon.in/dp/B0ABC12345");
    expect(out).toEqual({ type: "unidentified" });
    expect(h.generate).not.toHaveBeenCalled();
    expect(h.upserts).toEqual([]);
  });

  it("returns unidentified when the page is an error page and the URL names no product", async () => {
    h.fetchPage.mockResolvedValue(page("Page Not Found"));
    const out = await runProductReview("https://shop.example.test/p/88213");
    expect(out).toEqual({ type: "unidentified" });
    expect(h.generate).not.toHaveBeenCalled();
    expect(h.upserts).toEqual([]);
  });

  it("does not save a review the model could only title with a placeholder", async () => {
    h.fetchPage.mockResolvedValue(page("Alpha Glow Serum"));
    h.generate.mockResolvedValue(modelSays({ productName: "Product not identified from partial INCI", brand: "Unknown" }));
    const out = await runProductReview("https://brand.example.test/products/alpha-glow-serum");
    expect(out).toEqual({ type: "unidentified" });
    expect(savedReviews()).toEqual([]);
  });

  it("reviews and saves a URL whose page and address both name the product", async () => {
    const ingredients = ["Aqua", "Glycerin", "Panthenol", "Tocopherol", "Niacinamide"];
    h.brandInci.mockResolvedValue({ ingredients, quote: ingredients.join(", "), source: "https://betabrand.com/products/beta-glow-serum", pageTitles: ["Beta Glow Serum"] });
    h.fetchPage.mockResolvedValue(page("Beta Glow Serum"));
    h.generate.mockResolvedValue(modelSays({ productName: "Beta Glow Serum", brand: "Beta Brand" }));
    const out = await runProductReview("https://brand.example.test/products/beta-glow-serum");
    expect(out.type).toBe("product-review");
    expect(savedReviews()).toHaveLength(1);
  });
});

describe("runProductReview: a pasted ingredient list", () => {
  it("is still reviewed and returned, but is not saved to the repository", async () => {
    h.generate.mockResolvedValue(modelSays());
    const out = await runProductReview("Aqua, Glycerin, Niacinamide, Phenoxyethanol, Panthenol, Allantoin");
    expect(out.type).toBe("product-review");
    expect(savedReviews()).toEqual([]);
  });
});

/* The in-process review cache outlives a test, and an unsaved result is cached under the name the model gave it, so each case gives the model a name of its own. */
let named = 0;
const inventedName = () => modelSays({ productName: `Glow Lab Hydrating Gel Cream ${++named}`, brand: "Glow Lab" });

describe("runProductReview: a pasted ingredient list, whatever separates its items", () => {
  const LIST = ["Aqua", "Glycerin", "Niacinamide", "Sodium Hyaluronate", "Panthenol", "Allantoin", "Phenoxyethanol"];
  const pastes: Record<string, string> = {
    "bullets": LIST.map((x) => `• ${x}`).join(" "),
    "pipes": LIST.join(" | "),
    "slashes": LIST.join(" / "),
    "full stops": `${LIST.join(". ")}.`,
    "plain spaces": LIST.join(" "),
    "four items": LIST.slice(0, 4).join(", "),
    "three items": LIST.slice(0, 3).join(", "),
    "an Ingredients: label and four items": `Ingredients: ${LIST.slice(0, 4).join(", ")}`,
  };
  for (const [format, paste] of Object.entries(pastes)) {
    it(`is returned to the person but not saved, with ${format}, even when the model gives it a product name`, async () => {
      h.generate.mockResolvedValue(inventedName());
      const out = await runProductReview(paste);
      expect(out.type).toBe("product-review");
      expect(savedReviews()).toEqual([]);
    });
  }
});

describe("runProductReview: a typed product name", () => {
  it("is saved when the model names the product", async () => {
    h.generate.mockResolvedValue(modelSays({ productName: "Cetaphil Gentle Skin Cleanser", brand: "Cetaphil" }));
    const out = await runProductReview("Cetaphil Gentle Skin Cleanser");
    expect(out.type).toBe("product-review");
    expect(savedReviews()).toHaveLength(1);
  });

  it.each([
    ["a name and brand that say it was not identified", { productName: "Not Identified Product", brand: "Not Identified (Based on provided INCI)" }],
    ["a placeholder name", { productName: "Unknown Formulation", brand: "Glow Lab" }],
    ["an unknown brand", { productName: "Glow Lab Night Cream", brand: "Unknown" }],
    ["no brand", { productName: "Glow Lab Night Cream", brand: "" }],
  ])("is returned but not saved when the model gives %s", async (_label, over) => {
    h.generate.mockResolvedValue(modelSays(over));
    const out = await runProductReview("night cream formula");
    expect(out.type).toBe("product-review");
    expect(savedReviews()).toEqual([]);
  });
});
