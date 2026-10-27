import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeReview } from "@/lib/review.fixtures";

/* A nutraceutical or a prescription drug is not a cosmetic: runProductReview answers "unrated" and stores nothing, and no list, sitemap or count includes one that
   was stored earlier. Same outside-dependency replacements as product-review-engine.research-log.test.ts; here the database also hands back rows. */
const h = vi.hoisted(() => {
  const upserts: Record<string, unknown>[] = [];
  const state: { rows: unknown[] | null } = { rows: null };
  const chain: unknown = new Proxy(function () {}, {
    get: (_t, prop) => {
      if (prop === "then") return (resolve: (v: unknown) => void) => resolve({ data: state.rows, error: null });
      if (prop === "upsert") return (row: Record<string, unknown>) => { upserts.push(row); return chain; };
      return () => chain;
    },
    apply: () => chain,
  });
  return { upserts, state, chain, generate: vi.fn() };
});

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => h.chain }));
vi.mock("@/lib/gemini", async (orig) => ({ ...(await orig<typeof import("@/lib/gemini")>()), generateResilientWithMeta: h.generate }));
vi.mock("@/lib/inci-fetch", async (orig) => ({
  ...(await orig<typeof import("@/lib/inci-fetch")>()),
  resolveINCI: async () => ({ chosen: null, distinct: [], ambiguous: false }),
}));
vi.mock("@/lib/scrape", async (orig) => ({ ...(await orig<typeof import("@/lib/scrape")>()), fetchPageMarkdown: async () => null }));
vi.mock("@/lib/product-image", () => ({
  resolveProductImage: async () => null, searchProductImage: async () => null, findProductImageKeyless: async () => null, findProductReviewImage: async () => null, isLiveImage: async () => false,
}));
vi.mock("@/lib/evidence-images", () => ({ imageEvidenceBlock: async () => "" }));
vi.mock("@/lib/ingredient-directory", () => ({ addDiscoveredNames: async () => undefined }));
vi.mock("@/lib/verified-store", async (orig) => ({ ...(await orig<typeof import("@/lib/verified-store")>()), upsertVerifiedProduct: async () => undefined }));
vi.mock("next/cache", () => ({ revalidatePath: () => undefined }));

import { getRepositoryStats, getUnratedSlugs, listRepositoryCatalogueProducts, listReviewIndex, listStoredReviews, runProductReview } from "@/lib/product-review-engine";

const AZELAIC = ["Azelaic Acid", "Benzoic Acid", "Propylene Glycol", "Cetearyl Octanoate", "Purified Water"];
const model = (over: Parameters<typeof makeReview>[0]) => ({ text: JSON.stringify(makeReview({ brand: "Test Brand", ...over })), groundingMetadata: null });

beforeEach(() => {
  h.upserts.length = 0;
  h.state.rows = null;
  h.generate.mockReset();
});

describe("runProductReview", () => {
  it("answers 'unrated' for a nutraceutical and stores nothing", async () => {
    h.generate.mockResolvedValueOnce(model({ productName: "H2Glow Beauty Hydration Electrolyte Drink Mix", brand: "H2Glow", category: "Oral Supplement / Beauty Drink Mix" }));
    const out = await runProductReview("H2Glow Beauty Hydration Electrolyte Drink Mix");
    expect(out).toEqual({ type: "unrated", kind: "nutraceutical", productName: "H2Glow Beauty Hydration Electrolyte Drink Mix", brand: "H2Glow" });
    expect(h.upserts).toEqual([]);
  });

  it("answers 'unrated' for a prescription-strength azelaic acid product and stores nothing", async () => {
    h.generate.mockResolvedValueOnce(model({ productName: "Aziderm 20% Cream", category: "Topical Acne Treatment / Dermaceutical", inciIngredients: AZELAIC }));
    const out = await runProductReview("Aziderm 20% Cream");
    expect(out).toMatchObject({ type: "unrated", kind: "prescription-drug", productName: "Aziderm 20% Cream" });
    expect(h.upserts).toEqual([]);
  });

  it("answers 'unrated' for a nutraceutical stored before the line was drawn: no model run, nothing written back", async () => {
    const review = makeReview({ productName: "H2Glow Beauty Hydration Electrolyte Drink Mix", brand: "H2Glow", category: "Oral Supplement / Beauty Drink Mix" });
    // getStored reads one row: { result, rubric_rev }
    h.state.rows = { result: { type: "product-review", review, verdict: {} }, rubric_rev: "r7" } as unknown as unknown[];
    const out = await runProductReview("H2Glow Beauty Hydration Electrolyte Drink Mix");
    expect(out).toEqual({ type: "unrated", kind: "nutraceutical", productName: "H2Glow Beauty Hydration Electrolyte Drink Mix", brand: "H2Glow" });
    expect(h.generate).not.toHaveBeenCalled();
    expect(h.upserts).toEqual([]);
  });

  it("still reviews and stores a cosmetic", async () => {
    h.generate.mockResolvedValueOnce(model({ productName: "Alpha Cleanser", category: "Face Wash" }));
    const out = await runProductReview("Alpha Cleanser");
    expect(out.type).toBe("product-review");
    expect(h.upserts).toHaveLength(1);
  });

  it("a cosmetic that only looks like one is still reviewed: a capsule serum, a multivitamin serum", async () => {
    h.generate.mockResolvedValueOnce(model({ productName: "Vitamin C Capsule Serum, 30 capsules", category: "Face Serum" }));
    expect((await runProductReview("Vitamin C Capsule Serum")).type).toBe("product-review");
    h.generate.mockResolvedValueOnce(model({ productName: "Niacinamide Multivitamin Serum", category: "Serum" }));
    expect((await runProductReview("Niacinamide Multivitamin Serum")).type).toBe("product-review");
  });
});

describe("what was stored earlier is left out of every list", () => {
  // One row shape for every query: each function reads only the fields it asks for.
  const row = (slug: string, productName: string, category: string, inci: string[] = []) => ({
    product_slug: slug, product_name: productName, brand: "B", reviewed_at: "2026-10-23T00:00:00Z", tier: "good", image_url: null, category, inci,
    result: { review: makeReview({ productName, category, inciIngredients: inci, brand: "B" }), verdict: {} },
  });
  const ROWS = [
    row("alpha-cleanser", "Alpha Cleanser", "Face Wash"),
    row("h2glow-drink-mix", "H2Glow Beauty Hydration Electrolyte Drink Mix", "Oral Supplement / Beauty Drink Mix"),
    row("aziderm-20-cream", "Aziderm 20% Cream", "Topical Acne Treatment / Dermaceutical", AZELAIC),
    row("beta-serum", "Beta Serum", "Serum"),
  ];

  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-24T10:00:00Z")); h.state.rows = ROWS; });
  afterEach(() => vi.useRealTimers());

  it("knows which stored slugs are unrated, and why", async () => {
    vi.setSystemTime(new Date("2027-01-01T00:00:00Z")); // past the cache of any earlier test
    expect([...(await getUnratedSlugs())]).toEqual([["h2glow-drink-mix", "nutraceutical"], ["aziderm-20-cream", "prescription-drug"]]);
  });

  it("the sitemap and directory index, the grid and the stats count only cosmetics", async () => {
    vi.setSystemTime(new Date("2027-02-01T00:00:00Z"));
    expect((await listReviewIndex()).map((r) => r.slug)).toEqual(["alpha-cleanser", "beta-serum"]);
    expect((await listStoredReviews()).map((r) => r.productSlug)).toEqual(["alpha-cleanser", "beta-serum"]);
    expect((await listRepositoryCatalogueProducts()).map((p) => p.slug)).toEqual(["alpha-cleanser", "beta-serum"]);
    expect((await getRepositoryStats()).productCount).toBe(2);
  });

  it("a database error leaves the lists as they were rather than emptying them", async () => {
    vi.setSystemTime(new Date("2027-03-01T00:00:00Z"));
    const first = await getUnratedSlugs();
    expect(first.size).toBe(2);
    vi.setSystemTime(new Date("2027-03-01T01:00:00Z")); // cache expired
    h.state.rows = null; // the next read gets no data
    expect((await getUnratedSlugs()).size).toBe(2);
  });
});
