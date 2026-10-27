import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeReview } from "@/lib/review.fixtures";

/* A nutraceutical or a drug is not a cosmetic: runProductReview answers "unrated" and stores nothing, and no list, sitemap or count includes one that
   was stored earlier. A drug is one that says so: a prescription notice, a Drug Facts label (page or artwork), a drug-only maker. Never its ingredients. Same outside-dependency replacements as product-review-engine.research-log.test.ts; here the database also hands back rows. */
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
  const read: { page: string | null; label: string } = { page: null, label: "" };
  return { upserts, state, chain, generate: vi.fn(), read };
});

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => h.chain }));
vi.mock("@/lib/gemini", async (orig) => ({ ...(await orig<typeof import("@/lib/gemini")>()), generateResilientWithMeta: h.generate }));
vi.mock("@/lib/inci-fetch", async (orig) => ({
  ...(await orig<typeof import("@/lib/inci-fetch")>()),
  resolveINCI: async () => ({ chosen: null, distinct: [], ambiguous: false }),
}));
vi.mock("@/lib/scrape", async (orig) => ({ ...(await orig<typeof import("@/lib/scrape")>()), fetchPageMarkdown: async () => h.read.page }));
vi.mock("@/lib/product-image", () => ({
  resolveProductImage: async () => null, searchProductImage: async () => null, findProductImageKeyless: async () => null, findProductReviewImage: async () => null, isLiveImage: async () => false,
}));
// The label artwork is handed back through `out.labelText`, as the real reader does.
vi.mock("@/lib/evidence-images", () => ({ imageEvidenceBlock: async (_url: string, out?: { labelText?: string }) => { if (out) out.labelText = h.read.label; return ""; } }));
vi.mock("@/lib/ingredient-directory", () => ({ addDiscoveredNames: async () => undefined }));
vi.mock("@/lib/verified-store", async (orig) => ({ ...(await orig<typeof import("@/lib/verified-store")>()), upsertVerifiedProduct: async () => undefined }));
vi.mock("next/cache", () => ({ revalidatePath: () => undefined }));

import { getRepositoryStats, getUnratedSlugs, listRepositoryCatalogueProducts, listReviewIndex, listStoredReviews, runProductReview } from "@/lib/product-review-engine";

const AZELAIC = ["Azelaic Acid", "Benzoic Acid", "Propylene Glycol", "Cetearyl Octanoate", "Purified Water"];
type Listing = { platform: string; price: string | null; pricePerMl: string | null; note: string | null }[];
const RX_LISTING: Listing = [{ platform: "Flipkart", price: "Rs.3", pricePerMl: null, note: "Price appears to be an error or placeholder; product listed as 'Prescription Required'." }];
const model = (over: Parameters<typeof makeReview>[0]) => ({ text: JSON.stringify(makeReview({ brand: "Test Brand", ...over })), groundingMetadata: null });

beforeEach(() => {
  h.upserts.length = 0;
  h.state.rows = null;
  h.read.page = null;
  h.read.label = "";
  h.generate.mockReset();
});

describe("runProductReview", () => {
  it("answers 'unrated' for a nutraceutical and stores nothing", async () => {
    h.generate.mockResolvedValueOnce(model({ productName: "H2Glow Beauty Hydration Electrolyte Drink Mix", brand: "H2Glow", category: "Oral Supplement / Beauty Drink Mix" }));
    const out = await runProductReview("H2Glow Beauty Hydration Electrolyte Drink Mix");
    expect(out).toEqual({ type: "unrated", kind: "nutraceutical", productName: "H2Glow Beauty Hydration Electrolyte Drink Mix", brand: "H2Glow" });
    expect(h.upserts).toEqual([]);
  });

  it("answers 'unrated' for a prescription drug when a retailer's listing says Prescription Required, and stores nothing", async () => {
    h.generate.mockResolvedValueOnce(model({ productName: "Aziderm 20% Cream", category: "Topical Acne Treatment / Dermaceutical", inciIngredients: AZELAIC, priceAcrossPlatforms: RX_LISTING }));
    const out = await runProductReview("Aziderm 20% Cream");
    expect(out).toMatchObject({ type: "unrated", kind: "prescription-drug", productName: "Aziderm 20% Cream" });
    expect(h.upserts).toEqual([]);
  });

  it("does NOT treat an ingredient as a prescription: azelaic acid at 20% with no notice is reviewed and stored", async () => {
    h.generate.mockResolvedValueOnce(model({ productName: "Aziderm 20% Cream", category: "Topical Acne Treatment / Dermaceutical", inciIngredients: AZELAIC }));
    const out = await runProductReview("Aziderm 20% Cream");
    expect(out.type).toBe("product-review");
    expect(h.upserts).toHaveLength(1);
  });

  it("answers 'unrated' (a drug) when the product page carries a Drug Facts panel, and stores nothing", async () => {
    h.read.page = "# Daily Shield Sunscreen SPF 30\n\nBroad spectrum protection.\n\nDrug Facts\nActive ingredient: Zinc oxide 8%\n";
    h.generate.mockResolvedValueOnce(model({ productName: "Daily Shield Sunscreen SPF 30", category: "Sunscreen" }));
    const out = await runProductReview("https://shop.example.com/daily-shield");
    expect(out).toMatchObject({ type: "unrated", kind: "drug", productName: "Daily Shield Sunscreen SPF 30" });
    expect(h.upserts).toEqual([]);
  });

  it("answers 'unrated' when the label artwork says Drug Facts, though the page text does not", async () => {
    h.read.page = "# Daily Shield Sunscreen SPF 30\n\nBroad spectrum protection.\n";
    h.read.label = "DRUG FACTS Active ingredient Purpose Zinc oxide 8% Sunscreen";
    h.generate.mockResolvedValueOnce(model({ productName: "Daily Shield Sunscreen SPF 30", category: "Sunscreen" }));
    expect(await runProductReview("https://shop.example.com/daily-shield")).toMatchObject({ type: "unrated", kind: "drug" });
    expect(h.upserts).toEqual([]);
  });

  it("a page whose copy only mentions prescriptions in passing is still reviewed", async () => {
    h.read.page = "# Gentle Cleanser\n\nDermatologists' most prescribed brand (IMS Prescription Audit). No prescription needed.\n";
    h.generate.mockResolvedValueOnce(model({ productName: "Gentle Cleanser", category: "Face Wash" }));
    expect((await runProductReview("https://shop.example.com/gentle-cleanser")).type).toBe("product-review");
    expect(h.upserts).toHaveLength(1);
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
  const row = (slug: string, productName: string, category: string, listing: Listing = []) => ({
    product_slug: slug, product_name: productName, brand: "B", reviewed_at: "2026-10-23T00:00:00Z", tier: "good", image_url: null, category, listing,
    result: { review: makeReview({ productName, category, priceAcrossPlatforms: listing, brand: "B" }), verdict: {} },
  });
  const ROWS = [
    row("alpha-cleanser", "Alpha Cleanser", "Face Wash"),
    row("h2glow-drink-mix", "H2Glow Beauty Hydration Electrolyte Drink Mix", "Oral Supplement / Beauty Drink Mix"),
    row("aziderm-20-cream", "Aziderm 20% Cream", "Topical Acne Treatment / Dermaceutical", RX_LISTING),
    row("beta-serum", "Beta Serum", "Serum"),
    // Medicated, mentions prescriptions in passing, no prescription notice: stays in the lists.
    row("scalpe-shampoo", "Scalpe Plus Anti-Dandruff Shampoo", "Medicated Anti-Dandruff Shampoo", [{ platform: "Nykaa", price: null, pricePerMl: null, note: "Cites 'IMS Prescription Audit' for 'most prescribed'." }]),
  ];

  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-24T10:00:00Z")); h.state.rows = ROWS; });
  afterEach(() => vi.useRealTimers());

  it("knows which stored slugs are unrated, and why", async () => {
    vi.setSystemTime(new Date("2027-01-01T00:00:00Z")); // past the cache of any earlier test
    expect([...(await getUnratedSlugs())]).toEqual([["h2glow-drink-mix", "nutraceutical"], ["aziderm-20-cream", "prescription-drug"]]);
  });

  it("the sitemap and directory index, the grid and the stats count only cosmetics", async () => {
    vi.setSystemTime(new Date("2027-02-01T00:00:00Z"));
    expect((await listReviewIndex()).map((r) => r.slug)).toEqual(["alpha-cleanser", "beta-serum", "scalpe-shampoo"]);
    expect((await listStoredReviews()).map((r) => r.productSlug)).toEqual(["alpha-cleanser", "beta-serum", "scalpe-shampoo"]);
    expect((await listRepositoryCatalogueProducts()).map((p) => p.slug)).toEqual(["alpha-cleanser", "beta-serum", "scalpe-shampoo"]);
    expect((await getRepositoryStats()).productCount).toBe(3);
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
