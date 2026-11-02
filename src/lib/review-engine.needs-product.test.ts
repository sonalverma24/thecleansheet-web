import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BrandCatalogue } from "@/lib/brand-catalogue";

/* runDeepScan (the engine behind /api/analyze, which needs no sign-in) when the search names no specific product (src/lib/specific-product.ts).

   Owner rule, 2026-11-02: a search for just a brand, or a generic term, must ask which product, or show nothing, and never becomes a product. Here the model is
   asked nothing for a brand alone or a kind of product, nothing is registered when the model answers with the brand again, and a typed product name is still
   scored and registered. Every outside dependency is replaced. */
const h = vi.hoisted(() => ({
  generate: vi.fn(),
  upsert: vi.fn<(...args: unknown[]) => Promise<void>>(async () => undefined),
  catalogue: { value: { tableBrands: [], rows: [] } as BrandCatalogue },
}));

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({}) }));
vi.mock("@/lib/brand-catalogue", async (orig) => ({ ...(await orig<typeof import("@/lib/brand-catalogue")>()), getBrandCatalogue: async () => h.catalogue.value }));
vi.mock("@/lib/gemini", async (orig) => ({ ...(await orig<typeof import("@/lib/gemini")>()), generateResilient: (...a: unknown[]) => h.generate(...a) }));
vi.mock("@/lib/verified-store", async (orig) => ({ ...(await orig<typeof import("@/lib/verified-store")>()), upsertVerifiedProduct: (...a: unknown[]) => h.upsert(...a) }));
vi.mock("@/lib/verdict-engine", async (orig) => ({
  ...(await orig<typeof import("@/lib/verdict-engine")>()),
  computeVerdict: () => ({ status: "verified", gates: [], standard: "test" }),
}));

import { runDeepScan } from "@/lib/review-engine";

const scorecard = (over: Record<string, unknown> = {}) => JSON.stringify({
  productName: "Cetaphil Gentle Skin Cleanser", brand: "Cetaphil", score: 90, scoreLabel: "Excellent", summary: "A gentle cleanser.",
  pillars: [{ name: "Full Ingredient Disclosure", score: 18, max: 20, note: "Full list." }],
  ...over,
});

beforeEach(() => {
  h.generate.mockReset();
  h.upsert.mockClear();
  h.catalogue.value = { tableBrands: ["Dot & Key"], rows: [] };
  vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("no network in this test"); }));
});

describe("runDeepScan: a search that is only a brand, or a kind of product", () => {
  it.each([
    ["Sunscreen", null],
    ["Dot and key", "Dot & Key"],
    ["Cetaphil", "Cetaphil"],
    ["Cetaphil cleanser", "Cetaphil"],
    ["face wash for oily skin", null],
  ])("asks which product for %j, asks the model nothing and registers nothing", async (typed, brand) => {
    expect(await runDeepScan(typed, null)).toEqual({ type: "needs-product", query: typed, brand, suggestions: [] });
    expect(h.generate).not.toHaveBeenCalled();
    expect(h.upsert).not.toHaveBeenCalled();
  });

  it("is still asked when the repository cannot be read: the built-in brand list stands", async () => {
    h.catalogue.value = { tableBrands: [], rows: [] };
    expect(await runDeepScan("CeraVe", null)).toMatchObject({ type: "needs-product", brand: "CeraVe" });
    expect(h.generate).not.toHaveBeenCalled();
  });

  it("leaves a question and a comparison alone: they are not a search for one product", async () => {
    h.generate.mockResolvedValue(JSON.stringify({ type: "answer", question: "q", verdict: "info", verdictLabel: "Information", text: "t", keyPoints: [], indiaContext: "", chatOpener: "" }));
    expect((await runDeepScan("What is hyaluronic acid?", null)).type).toBe("answer");
    expect(h.generate).toHaveBeenCalledTimes(1);

    h.generate.mockReset();
    h.generate.mockResolvedValue(JSON.stringify({ type: "comparison", productA: JSON.parse(scorecard()), productB: JSON.parse(scorecard({ productName: "CeraVe Foaming Cleanser", brand: "CeraVe" })) }));
    expect((await runDeepScan("Cetaphil vs CeraVe", null)).type).toBe("comparison");
    expect(h.generate).toHaveBeenCalledTimes(1);
  });
});

describe("runDeepScan: a search that names a product", () => {
  it("scores and registers a typed product name", async () => {
    h.generate.mockResolvedValue(scorecard());
    const out = await runDeepScan("Cetaphil Gentle Skin Cleanser", null);
    expect(out.type).toBe("single");
    expect(h.upsert).toHaveBeenCalledTimes(1);
  });

  it("scores and registers a brand's own words typed with a product's: Dot and key watermelon sunscreen", async () => {
    h.generate.mockResolvedValue(scorecard({ productName: "Dot & Key Watermelon Cooling Sunscreen", brand: "Dot & Key" }));
    const out = await runDeepScan("Dot and key watermelon sunscreen", null);
    expect(out.type).toBe("single");
    expect(h.upsert).toHaveBeenCalledTimes(1);
  });

  it("is served, not asked about, when it is exactly the name of a product we hold", async () => {
    h.catalogue.value = { tableBrands: [], rows: [{ brand: "Glow Lab", name: "Hydrating Gel Cream", slug: "glow-lab-hydrating-gel-cream", rubricRev: "r7" }] };
    h.generate.mockResolvedValue(scorecard({ productName: "Hydrating Gel Cream", brand: "Glow Lab" }));
    expect((await runDeepScan("Hydrating Gel Cream", null)).type).toBe("single");
  });

  it("still scores a pasted ingredient list, and registers nothing", async () => {
    h.generate.mockResolvedValue(scorecard({ productName: "Glow Lab Serum", brand: "Glow Lab" }));
    const out = await runDeepScan("Niacinamide, Zinc Oxide, Titanium Dioxide, Retinol, Panthenol", null);
    expect(out.type).toBe("single");
    expect(h.upsert).not.toHaveBeenCalled();
  });
});

describe("runDeepScan: a result that names no product is not registered", () => {
  it.each([
    ["the brand again as the product", "Cetaphil", "Cetaphil"],
    ["the brand and a kind of product", "Cetaphil Cleanser", "Cetaphil"],
    ["a kind of product alone", "Sunscreen", "Dot & Key"],
    ["a brand the model made up, as the product too", "M .Y Sunscreen", "M .Y Sunscreen"],
  ])("when the model answers with %s", async (_label, productName, brand) => {
    h.generate.mockResolvedValue(scorecard({ productName, brand }));
    const out = await runDeepScan("the blue one from the shop", null);
    expect(out).toMatchObject({ type: "needs-product", brand: null, suggestions: [] });
    expect(h.upsert).not.toHaveBeenCalled();
  });

  it("asks without naming a brand the model made up", async () => {
    h.generate.mockResolvedValue(scorecard({ productName: "M .Y Sunscreen", brand: "M .Y Sunscreen" }));
    expect(await runDeepScan("zzq sun thing", null)).toMatchObject({ type: "needs-product", brand: null });
  });

  it("asks when the search is only the brand the model returned and we did not know the brand", async () => {
    h.generate.mockResolvedValue(scorecard({ productName: "Zorbex Brightening Serum", brand: "Zorbex" }));
    expect(await runDeepScan("Zorbex", null)).toMatchObject({ type: "needs-product", brand: "Zorbex" });
    expect(h.upsert).not.toHaveBeenCalled();
  });

  it("does not register, or ask about, a link whose result is the brand again: it is unidentified", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, text: async () => `Title: Cetaphil\n\n${"This is the product page. ".repeat(20)}` })));
    h.generate.mockResolvedValue(scorecard({ productName: "Cetaphil", brand: "Cetaphil" }));
    const out = await runDeepScan("https://brand.example.test/products/cetaphil-gentle-cleanser", null);
    expect(out).toEqual({ type: "unidentified" });
    expect(h.upsert).not.toHaveBeenCalled();
  });
});
