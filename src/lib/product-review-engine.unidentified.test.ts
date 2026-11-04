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
  return { upserts, chain, generate: vi.fn(), fetchPage: vi.fn(), brandInci: vi.fn<(...args: unknown[]) => Promise<unknown>>(async () => null) };
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

import { getStoredReview, runProductReview } from "@/lib/product-review-engine";

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

/* The in-process cache outlives a test. An unsaved result is remembered under the text it came from, never under the name the model gave it, so every case below pastes or types text of its own, and the model may give them all the same name. */
const inventedName = () => modelSays({ productName: "Glow Lab Hydrating Gel Cream", brand: "Glow Lab" });

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
  let typedQueries = 0; // a result that is not saved is remembered under the text it came from, so each case types its own
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
    const out = await runProductReview(`Glow Lab Night Cream ${++typedQueries}`);
    expect(out.type).toBe("product-review");
    expect(savedReviews()).toEqual([]);
  });
});

/* A pasted list is analysed for the person who pasted it. The engine keeps that result for a few minutes so the same
   paste is instant, but it must stay apart from the saved reviews: the name the model chose for it is not a product's
   address, so no other paste, no typed query and no /analysis page may be served it, and nothing may write it to the
   repository. The leak needs a brand page found for the model's name (the list is then non-empty, so the saved-review
   reader treats it as a real stored review), which is what brandPageFound sets up. The cache outlives a test, and a typed
   name does get saved, so every case below has a product of its own. */
describe("runProductReview: an analysis that is not saved stays out of the saved reviews", () => {
  const LIST = ["Aqua", "Glycerin", "Niacinamide", "Panthenol", "Allantoin", "Tocopherol"];
  const pasteOf = (...extra: string[]) => [...LIST, ...extra].join(", ");
  let products = 0;
  /** A product the model will name, the page the brand is said to publish for it, and the words a shopper would type to find it. */
  const newProduct = () => {
    const productName = `Hydrating Gel Cream ${++products}`;
    h.brandInci.mockResolvedValue({ ingredients: LIST, quote: LIST.join(", "), source: `https://glowlab.example.test/products/gel-cream-${products}`, pageTitles: [productName] });
    return {
      says: (heroPromise: string) => modelSays({ productName, brand: "Glow Lab", heroPromise }),
      slug: `glow-lab-hydrating-gel-cream-${products}`,
      typed: `Glow Lab ${productName}`,
    };
  };
  const heroOf = (out: Awaited<ReturnType<typeof runProductReview>>) => (out.type === "product-review" ? out.review.heroPromise : out.type);

  beforeEach(() => { h.brandInci.mockReset(); });

  it("never serves one person's pasted-list analysis to a different paste the model names the same way", async () => {
    const product = newProduct();
    h.generate.mockResolvedValueOnce(product.says("first person"));
    const first = await runProductReview(pasteOf("Squalane"));
    h.generate.mockResolvedValueOnce(product.says("second person"));
    const second = await runProductReview(pasteOf("Ceramide NP"));
    expect(h.generate).toHaveBeenCalledTimes(2);
    expect(heroOf(first)).toBe("first person");
    expect(heroOf(second)).toBe("second person");
    expect(savedReviews()).toEqual([]);
  });

  it("does not answer, or write to the repository, a later typed query that spells the name the model chose", async () => {
    const product = newProduct();
    h.generate.mockResolvedValueOnce(product.says("from the pasted list"));
    await runProductReview(pasteOf("Bisabolol"));
    expect(savedReviews()).toEqual([]);

    h.generate.mockResolvedValueOnce(product.says("from the typed name"));
    const typed = await runProductReview(product.typed);
    expect(h.generate).toHaveBeenCalledTimes(2); // the typed query was analysed afresh, not served the pasted list's analysis
    expect(heroOf(typed)).toBe("from the typed name");
    expect(savedReviews().map((row) => (row.result as { review: { heroPromise: string } }).review.heroPromise)).toEqual(["from the typed name"]);
  });

  it("is not served by the product page lookup under the name the model chose", async () => {
    const product = newProduct();
    h.generate.mockResolvedValueOnce(product.says("pasted"));
    await runProductReview(pasteOf("Allantoin Extract"));
    expect(await getStoredReview(product.slug)).toBeNull();
    expect(await getStoredReview(product.slug, { strict: true })).toBeNull();
  });

  it("answers an identical repeat paste without asking the model again, and still saves nothing", async () => {
    const product = newProduct();
    h.generate.mockResolvedValue(product.says("pasted twice"));
    const paste = pasteOf("Beta-Glucan");
    const first = await runProductReview(paste);
    const again = await runProductReview(`  ${paste.toUpperCase()}\n`); // same text up to case and spacing
    expect(h.generate).toHaveBeenCalledTimes(1);
    expect(heroOf(first)).toBe("pasted twice");
    expect(heroOf(again)).toBe("pasted twice");
    expect(savedReviews()).toEqual([]);
  });

  it("remembers a pasted list for five minutes only", async () => {
    const product = newProduct();
    h.generate.mockResolvedValue(product.says("remembered"));
    const paste = pasteOf("Madecassoside");
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      await runProductReview(paste);
      vi.setSystemTime(Date.now() + 4 * 60 * 1000);
      await runProductReview(paste);
      expect(h.generate).toHaveBeenCalledTimes(1);
      vi.setSystemTime(Date.now() + 2 * 60 * 1000);
      await runProductReview(paste);
      expect(h.generate).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps at most a few dozen pasted lists in memory, dropping the oldest", async () => {
    const product = newProduct();
    h.generate.mockResolvedValue(product.says("bounded"));
    const pastes = Array.from({ length: 60 }, (_, i) => pasteOf(`Plant Extract ${i}`));
    for (const paste of pastes) await runProductReview(paste);
    expect(h.generate).toHaveBeenCalledTimes(60);
    await runProductReview(pastes[59]); // newest: still remembered
    expect(h.generate).toHaveBeenCalledTimes(60);
    await runProductReview(pastes[0]); // oldest: dropped
    expect(h.generate).toHaveBeenCalledTimes(61);
  });
});
