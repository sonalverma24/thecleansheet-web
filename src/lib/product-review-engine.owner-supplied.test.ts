import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeReview } from "@/lib/review.fixtures";

/* runProductReview with every outside dependency replaced (same harness as the research-log test), and one owner-supplied entry in place of the data file. */
const h = vi.hoisted(() => {
  const upserts: Record<string, unknown>[] = [];
  const state: { stored: unknown } = { stored: null };
  const chain: unknown = new Proxy(function () {}, {
    get: (_t, prop) => {
      if (prop === "then") return (resolve: (v: unknown) => void) => resolve({ data: state.stored ? { result: state.stored, rubric_rev: "r7" } : null, error: null });
      if (prop === "upsert") return (row: Record<string, unknown>) => { upserts.push(row); return chain; };
      return () => chain;
    },
    apply: () => chain,
  });
  return { upserts, chain, generate: vi.fn(), findReviewImage: vi.fn(), brandInci: vi.fn(), state };
});

vi.mock("@/data/inci/owner-supplied", () => {
  const entryFor = (name: string) => ({
    brands: ["Test Co"],
    productNames: [name],
    sourceUrl: "https://testco.com/products/daily-shield-spf-50",
    quote: "Ingredients: Aqua, Zinc Oxide, Caprylic/Capric Triglyceride, Glycerin, Sodium Hyaluronate, Tocopheryl Acetate, Xanthan Gum, Phenoxyethanol.",
    suppliedOn: "2026-11-01",
    note: "Back-of-pack photo, fourth gallery image",
  });
  return { OWNER_SUPPLIED_INCI: [entryFor("Daily Shield SPF 50 Mineral Sunscreen"), entryFor("Night Shield SPF 50 Mineral Sunscreen")] };
});
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => h.chain }));
vi.mock("@/lib/gemini", async (orig) => ({ ...(await orig<typeof import("@/lib/gemini")>()), generateResilientWithMeta: h.generate }));
vi.mock("@/lib/inci-fetch", async (orig) => ({
  ...(await orig<typeof import("@/lib/inci-fetch")>()),
  resolveINCI: async () => ({ chosen: null, distinct: [], ambiguous: false }),
}));
vi.mock("@/lib/scrape", async (orig) => ({ ...(await orig<typeof import("@/lib/scrape")>()), fetchPageMarkdown: async () => null }));
vi.mock("@/lib/product-image", () => ({
  resolveProductImage: async () => null, searchProductImage: async () => null, findProductImageKeyless: async () => null, findProductReviewImage: (...args: unknown[]) => h.findReviewImage(...args), isLiveImage: async () => false,
}));
vi.mock("@/lib/brand-inci", async (orig) => ({ ...(await orig<typeof import("@/lib/brand-inci")>()), findBrandInci: (...args: unknown[]) => h.brandInci(...args) }));
vi.mock("@/lib/evidence-images", () => ({ imageEvidenceBlock: async () => "" }));
vi.mock("@/lib/ingredient-directory", () => ({ addDiscoveredNames: async () => undefined }));
vi.mock("@/lib/verified-store", async (orig) => ({ ...(await orig<typeof import("@/lib/verified-store")>()), upsertVerifiedProduct: async () => undefined }));
vi.mock("next/cache", () => ({ revalidatePath: () => undefined }));

import { runProductReview } from "@/lib/product-review-engine";

const LIST = "Aqua, Zinc Oxide, Caprylic/Capric Triglyceride, Glycerin, Sodium Hyaluronate, Tocopheryl Acetate, Xanthan Gum, Phenoxyethanol";
const SEARCHED = { webSearchQueries: ["a query"], sourceUris: ["https://v/1"], sourceTitles: ["v.in"] };
const modelReply = (productName: string) => ({ text: JSON.stringify(makeReview({ productName, brand: "Test Co" })), groundingMetadata: SEARCHED });

beforeEach(() => {
  h.upserts.length = 0;
  h.state.stored = null;
  h.findReviewImage.mockReset();
  h.generate.mockReset();
  h.brandInci.mockReset().mockResolvedValue(null);
});

describe("runProductReview: a list typed in from the pack", () => {
  it("is the last resort: used when no primary source gave a list, grounded in the second analysis, and recorded as owner-supplied", async () => {
    h.generate.mockResolvedValue(modelReply("Daily Shield SPF 50 Mineral Sunscreen"));
    const out = await runProductReview("Test Co Daily Shield SPF 50 Mineral Sunscreen");
    expect(out.type).toBe("product-review");
    if (out.type !== "product-review") return;
    expect(out.review.inciIngredients).toEqual(LIST.split(", "));
    expect(out.review.inciSourceUrl).toBe("https://testco.com/products/daily-shield-spf-50");
    expect(out.review.inciEvidence).toMatchObject({ origin: "owner-supplied", captureTrust: 3, sourceUrl: "https://testco.com/products/daily-shield-spf-50", quote: `Ingredients: ${LIST}.` });
    // The model analysed again with the list in front of it.
    expect(h.generate).toHaveBeenCalledTimes(2);
    expect(String(h.generate.mock.calls[1][1])).toContain("Sodium Hyaluronate");
    expect(String(h.generate.mock.calls[0][1])).not.toContain("Sodium Hyaluronate");
  });

  it("is never used when a primary source gave a list", async () => {
    h.brandInci.mockResolvedValue({ ingredients: ["Aqua", "Glycerin", "Panthenol", "Tocopherol", "Niacinamide"], quote: "Aqua, Glycerin, Panthenol, Tocopherol, Niacinamide", source: "https://testco.com/products/other-page", pageTitles: ["Daily Shield"], trust: 4, origin: "brand-page" });
    // Its own product (the engine keeps finished reviews by product slug), which also has an owner entry: only the primary-source guard can keep that entry out.
    h.generate.mockResolvedValue(modelReply("Night Shield SPF 50 Mineral Sunscreen"));
    const out = await runProductReview("Test Co Night Shield SPF 50 Mineral Sunscreen");
    if (out.type !== "product-review") throw new Error("expected a review");
    expect(out.review.inciEvidence?.origin).toBe("brand-page");
    expect(h.generate).toHaveBeenCalledTimes(1);
    expect(out.review.inciIngredients).not.toContain("Sodium Hyaluronate");
  });

  it("is never lent to a variant of the product: it stays without a list", async () => {
    h.generate.mockResolvedValue(modelReply("Daily Shield SPF 30 Mineral Sunscreen"));
    const out = await runProductReview("Test Co Daily Shield SPF 30 Mineral Sunscreen");
    if (out.type !== "product-review") throw new Error("expected a review");
    expect(out.review.inciIngredients).toEqual([]);
    expect(out.review.inciEvidence).toBeUndefined();
    expect(h.generate).toHaveBeenCalledTimes(1);
  });
});
