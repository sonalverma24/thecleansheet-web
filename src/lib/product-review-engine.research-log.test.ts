import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeReview } from "@/lib/review.fixtures";

/* runProductReview with every outside dependency replaced: the model, the database,
   INCIDecoder, the scrapers and the image resolvers. */
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

import { deriveVerdict, runProductReview, withinMs } from "@/lib/product-review-engine";
import { PRODUCT_REVIEW_SYSTEM_PROMPT } from "@/lib/product-review-context";
import { inciGroundTruthBlock } from "@/lib/inci-fetch";

const asModelText = (name: string) => JSON.stringify(makeReview({ productName: name, brand: "Research Log Test Brand" }));

/* A list the live checks accept (a brand's own product page, with its quote), and a model reply with a web search behind it. */
const BRAND_LIST = ["Aqua", "Glycerin", "Panthenol", "Tocopherol", "Niacinamide"];
const brandPage = (slug: string) => ({ ingredients: BRAND_LIST, quote: BRAND_LIST.join(", "), source: `https://researchlogtestbrand.com/products/${slug}`, pageTitles: [slug] });
const SEARCHED = { webSearchQueries: ["a query"], sourceUris: ["https://v/1"], sourceTitles: ["v.in"] };

beforeEach(() => {
  h.upserts.length = 0;
  h.state.stored = null;
  h.findReviewImage.mockReset();
  h.generate.mockReset();
  h.brandInci.mockReset().mockResolvedValue(null);
});

describe("runProductReview: researchLog", () => {
  it("records the queries and sources of the attempt whose output was kept", async () => {
    h.brandInci.mockResolvedValue(brandPage("alpha-cleanser"));
    h.generate
      .mockResolvedValueOnce({ text: "this is not json", groundingMetadata: { webSearchQueries: ["discarded"], sourceUris: ["https://x/discarded"], sourceTitles: ["x"] } })
      .mockResolvedValueOnce({
        text: asModelText("Alpha Cleanser"),
        groundingMetadata: { webSearchQueries: ["alpha cleanser ingredients", "alpha cleanser price"], sourceUris: ["https://v/1", "https://v/2"], sourceTitles: ["alpha.in", "nykaa.com"] },
      });
    const out = await runProductReview("Alpha Cleanser");
    expect(out.type).toBe("product-review");
    if (out.type !== "product-review") return;
    const log = out.review.researchLog!;
    expect(log).toMatchObject({
      grounded: true,
      webSearchQueries: ["alpha cleanser ingredients", "alpha cleanser price"],
      sourceUris: ["https://v/1", "https://v/2"],
      sourceTitles: ["alpha.in", "nykaa.com"],
    });
    expect(Number.isNaN(Date.parse(log.recordedAt))).toBe(false);
    // And it is what gets stored.
    const stored = h.upserts[0].result as { review: { researchLog: unknown } };
    expect(stored.review.researchLog).toEqual(log);
  });

  it("asks the model again when its answer had no web search, and still gives the shopper a page (never an error) if every try had none", async () => {
    h.brandInci.mockResolvedValue(brandPage("beta-serum"));
    h.generate.mockResolvedValue({ text: asModelText("Beta Serum"), groundingMetadata: null });
    const out = await runProductReview("Beta Serum");
    expect(out.type).toBe("product-review");
    if (out.type !== "product-review") return;
    expect(h.generate).toHaveBeenCalledTimes(3); // the first call and two retries, the same as the re-runs allow
    expect(h.generate.mock.calls[1]).toEqual(h.generate.mock.calls[0]);
    expect(out.review.researchLog).toMatchObject({ grounded: false }); // the gap is recorded, so a re-run can replace it later
    expect(h.upserts).toHaveLength(1);
  });

  it("keeps the first answer, and shows no error, when the retry throws", async () => {
    h.brandInci.mockResolvedValue(brandPage("flaky-serum"));
    h.generate
      .mockResolvedValueOnce({ text: asModelText("Flaky Serum"), groundingMetadata: null })
      .mockRejectedValueOnce(new Error("upstream 503"));
    const out = await runProductReview("Flaky Serum");
    expect(out.type).toBe("product-review");
    expect(h.generate).toHaveBeenCalledTimes(2); // the retry was tried once, failed, and no further retry was made
    expect(h.upserts).toHaveLength(1);
  });

  it("keeps the answer from a retry that was grounded", async () => {
    h.brandInci.mockResolvedValue(brandPage("retry-serum"));
    h.generate
      .mockResolvedValueOnce({ text: asModelText("Retry Serum"), groundingMetadata: null })
      .mockResolvedValueOnce({ text: asModelText("Retry Serum"), groundingMetadata: SEARCHED });
    const out = await runProductReview("Retry Serum");
    if (out.type !== "product-review") throw new Error("expected a review");
    expect(h.generate).toHaveBeenCalledTimes(2);
    expect(out.review.researchLog).toMatchObject({ grounded: true, webSearchQueries: ["a query"] });
    expect(h.upserts).toHaveLength(1);
  });

  it("does not start a retry once most of the request's time has gone", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      h.brandInci.mockResolvedValue(brandPage("slow-serum"));
      h.generate.mockImplementation(async () => { vi.setSystemTime(new Date(Date.now() + 80_000)); return { text: asModelText("Slow Serum"), groundingMetadata: null }; });
      const out = await runProductReview("Slow Serum");
      expect(out.type).toBe("product-review"); // no retry fits in the time left, and the shopper still gets the page
      expect(h.generate).toHaveBeenCalledTimes(1);
    } finally { vi.useRealTimers(); }
  });

  it("is engine-authored: a researchLog in the model's own JSON is replaced", async () => {
    const forged = { ...JSON.parse(asModelText("Gamma Toner")), researchLog: { grounded: true, webSearchQueries: ["forged"], sourceUris: ["https://forged"], sourceTitles: [], recordedAt: "2001-01-01" } };
    h.brandInci.mockResolvedValue(brandPage("gamma-toner"));
    h.generate.mockResolvedValueOnce({ text: JSON.stringify(forged), groundingMetadata: SEARCHED });
    const out = await runProductReview("Gamma Toner");
    if (out.type !== "product-review") throw new Error("expected a review");
    expect(out.review.researchLog).toMatchObject({ grounded: true, webSearchQueries: ["a query"], sourceUris: ["https://v/1"] });
    expect(out.review.researchLog!.recordedAt).not.toBe("2001-01-01");
  });

  it("leaves the prompts exactly as they were", async () => {
    h.generate.mockResolvedValue({ text: "still not json", groundingMetadata: null });
    const out = await runProductReview("Delta Gel");
    expect(out.type).toBe("error");
    const userPrompt =
      `Produce a full Clean Sheet Product Review for this product: Delta Gel` +
      `\nSearch its official page and Nykaa, Amazon.in, Flipkart and quick-commerce listings for price, claims, and the ingredient list.${inciGroundTruthBlock(null)}`;
    expect(h.generate.mock.calls).toEqual([
      [PRODUCT_REVIEW_SYSTEM_PROMPT, userPrompt],
      [PRODUCT_REVIEW_SYSTEM_PROMPT, `${userPrompt}\n\nReturn ONLY the product-review JSON, starting directly with { and ending with }. No prose, no code fence, no trailing commas.`],
      [PRODUCT_REVIEW_SYSTEM_PROMPT, `${userPrompt}\n\nYour previous output was not valid JSON. Return ONLY the complete, valid product-review JSON object.`],
    ]);
  });

  it("retries image discovery for an existing review with no image", async () => {
    const review = makeReview({ productName: "Retry Image Product", brand: "Research Log Test Brand" });
    review.imageUrl = null;
    review.productSlug = "retry-image-product";
    h.state.stored = { type: "product-review", review, verdict: deriveVerdict(review) };
    h.findReviewImage.mockResolvedValue({ url: "https://images.example/product.jpg", source: "cse", confidence: 0.9 });

    const out = await runProductReview("Retry Image Product");

    expect(out.type).toBe("product-review");
    if (out.type !== "product-review") return;
    expect(out.review.imageUrl).toBe("https://images.example/product.jpg");
    expect(out.review.imageSource).toBe("cse");
    expect(out.review.imageRetryAt).toBeTruthy();
    expect(h.findReviewImage).toHaveBeenCalledWith("Research Log Test Brand", "Retry Image Product", undefined);
  });
});

describe("primary ingredient sources", () => {
  it("uses and quotes the brand list in both the model prompt and the saved review", async () => {
    const ingredients = ["Aqua", "Glycerin", "Panthenol", "Tocopherol", "Niacinamide"];
    const quote = ingredients.join(", ");
    h.brandInci.mockResolvedValue({ ingredients, quote, source: "https://researchlogtestbrand.com/products/primary-serum", pageTitles: ["Primary Serum"] });
    h.generate.mockResolvedValue({ text: asModelText("Primary Serum"), groundingMetadata: SEARCHED });
    const result = await runProductReview("Primary Serum");
    if (result.type !== "product-review") throw new Error("expected review");
    expect(h.generate.mock.calls[0][1]).toContain(quote);
    expect(result.review.inciIngredients).toEqual(ingredients);
    expect(result.review.inciEvidence).toMatchObject({ sourceUrl: "https://researchlogtestbrand.com/products/primary-serum", quote, captureTrust: 4, matchedTitle: "Primary Serum" });
  });
  it("still saves the analysis, with no ingredient list and the gap showing, when both primary lookups fail", async () => {
    h.generate.mockResolvedValue({ text: asModelText("Unattributed Serum"), groundingMetadata: SEARCHED });
    const result = await runProductReview("Unattributed Serum");
    if (result.type !== "product-review") throw new Error("expected review");
    expect(h.brandInci).toHaveBeenCalled();
    expect(result.review.inciIngredients).toEqual([]);
    expect(result.review.ingredientReads).toEqual([]);
    expect(result.review.inciEvidence).toBeUndefined();
    expect(h.upserts).toHaveLength(1);
  });

  it("asks the web-grounded model where the page is on the first lookup only, not again after the brand is known", async () => {
    h.brandInci.mockResolvedValueOnce(null).mockResolvedValueOnce(brandPage("zeta-serum"));
    h.generate.mockResolvedValue({ text: asModelText("Zeta Serum"), groundingMetadata: SEARCHED });
    const result = await runProductReview("Zeta Serum");
    expect(result.type).toBe("product-review");
    expect(h.brandInci).toHaveBeenCalledTimes(2);
    expect(h.brandInci.mock.calls[0]).toHaveLength(3); // default dependencies, which include the model
    expect(h.brandInci.mock.calls[1][3]).toMatchObject({ askModel: undefined });
    expect(h.brandInci.mock.calls[1][3].search).toBeTypeOf("function");
  });

  it("does not hold a bare ingredient list scan to the checks: it is returned and never stored", async () => {
    h.generate.mockResolvedValue({ text: asModelText("Pasted List Scan"), groundingMetadata: null });
    const result = await runProductReview("Aqua, Glycerin, Niacinamide, Panthenol, Tocopherol, Phenoxyethanol, Sodium Hyaluronate");
    expect(result.type).toBe("product-review");
    expect(h.upserts).toEqual([]);
  });
});

describe("withinMs: the bound that stops a retry from costing the shopper an answer", () => {
  it("returns the result when the work finishes in time, and null when it throws", async () => {
    expect(await withinMs(Promise.resolve("done"), 1000)).toBe("done");
    expect(await withinMs(Promise.reject(new Error("boom")), 1000)).toBeNull();
  });

  it("returns null when the work is still running at the deadline, and leaves no timer behind", async () => {
    vi.useFakeTimers();
    try {
      const pending = withinMs(new Promise<string>(() => { /* never finishes */ }), 5_000);
      await vi.advanceTimersByTimeAsync(5_001);
      expect(await pending).toBeNull();
      expect(vi.getTimerCount()).toBe(0);
      const quick = withinMs(Promise.resolve("ok"), 5_000);
      expect(await quick).toBe("ok");
      expect(vi.getTimerCount()).toBe(0); // cleared once the work won the race
    } finally { vi.useRealTimers(); }
  });
});
