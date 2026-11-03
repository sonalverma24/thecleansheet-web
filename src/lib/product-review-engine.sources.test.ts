import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeReview } from "@/lib/review.fixtures";

/* runProductReview with the ingredient sources searched together (owner decision, 2026-10-30): the Decoder page resolved by name competes with the brand's page
   and Nykaa's, the most complete list is the one published, and what was chosen is recorded in the evidence. Every outside dependency is replaced. */
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
  return { upserts, chain, generate: vi.fn(), fetchPage: vi.fn(), brandInci: vi.fn<(...args: unknown[]) => Promise<unknown>>(async () => null), resolve: vi.fn() };
});

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => h.chain }));
vi.mock("@/lib/gemini", async (orig) => ({ ...(await orig<typeof import("@/lib/gemini")>()), generateResilientWithMeta: h.generate }));
vi.mock("@/lib/inci-fetch", async (orig) => ({ ...(await orig<typeof import("@/lib/inci-fetch")>()), resolveINCI: (...a: unknown[]) => h.resolve(...a) }));
vi.mock("@/lib/inci-from-page", async (orig) => ({ ...(await orig<typeof import("@/lib/inci-from-page")>()), fetchInciFromProductPage: async () => null }));
vi.mock("@/lib/brand-inci", async (orig) => ({ ...(await orig<typeof import("@/lib/brand-inci")>()), findBrandInci: (...args: unknown[]) => h.brandInci(...args) }));
vi.mock("@/lib/scrape", async (orig) => ({ ...(await orig<typeof import("@/lib/scrape")>()), fetchPageMarkdown: (...a: unknown[]) => h.fetchPage(...a) }));
vi.mock("@/lib/product-image", async (orig) => ({ ...(await orig<typeof import("@/lib/product-image")>()), findProductReviewImage: async () => null, isLiveImage: async () => false }));
vi.mock("@/lib/evidence-images", () => ({ imageEvidenceBlock: async () => "" }));
vi.mock("@/lib/ingredient-directory", () => ({ addDiscoveredNames: async () => undefined }));
vi.mock("@/lib/verified-store", async (orig) => ({ ...(await orig<typeof import("@/lib/verified-store")>()), upsertVerifiedProduct: async () => undefined }));
vi.mock("next/cache", () => ({ revalidatePath: () => undefined }));

import { invalidateReviewCache, runProductReview } from "@/lib/product-review-engine";

const DECODER = "https://inkeedecoder.com/products/lotus-gel-creme";
const NYKAA = "https://www.nykaa.com/lotus-gel-creme/p/10787966";
const older = ["Aqua", "Almond Oil", "Glycerin", "Stearic Acid", "Methyl Paraben", "Fragrance"];
const current = ["Aqua (Om Water)", "Niacinamide", "Glycerin", "Propylene Glycol", "Methyl Paraben Sodium", "Fragrance", "Titanium Dioxide"];
const decoderResult = { productName: "Lotus Gel Creme", slug: "lotus-gel-creme", ingredients: older, tags: [], source: DECODER, imageUrl: null, sourceQuote: older.join(", "), pageTitle: "Lotus Gel Creme" };
const modelSays = () => ({ text: JSON.stringify(makeReview({ productName: "Lotus Gel Creme", brand: "Lotus" })), groundingMetadata: { webSearchQueries: ["q"], sourceUris: ["https://v/1"], sourceTitles: ["v.in"] } });
const stored = () => (h.upserts.find((row) => "result" in row) as { result: { review: { inciIngredients: string[]; inciSourceUrl: string; inciEvidence: Record<string, unknown> } } } | undefined)?.result.review;

beforeEach(() => {
  invalidateReviewCache("lotus-gel-creme"); // the engine keeps finished reviews in memory by slug; one test's answer must not be served to the next
  h.upserts.length = 0;
  h.generate.mockReset();
  h.fetchPage.mockReset();
  h.brandInci.mockReset();
  h.resolve.mockReset();
  vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("no network in this test"); }));
  h.fetchPage.mockResolvedValue(`Title: Lotus Gel Creme\n\n${"This is the product page. ".repeat(20)}`);
  h.generate.mockResolvedValue(modelSays());
  h.resolve.mockResolvedValue({ chosen: decoderResult, distinct: [], ambiguous: false });
});

describe("runProductReview: sources searched together", () => {
  it("looks for the other sources even though Decoder resolved by name, offering the Decoder list as one candidate", async () => {
    h.brandInci.mockResolvedValue(null);
    await runProductReview(NYKAA);
    const [, , supplied, , known] = h.brandInci.mock.calls[0] as [string, string, string, unknown, { source: string; origin: string; trust: number; quote: string }[]];
    expect(supplied).toBe(NYKAA);
    expect(known).toHaveLength(1);
    expect(known[0]).toMatchObject({ source: DECODER, origin: "decoder", trust: 3, quote: older.join(", ") });
  });

  it("publishes the Nykaa list when it is the most complete, with its quote, trust 3, origin, and the Decoder list recorded as the alternative", async () => {
    h.brandInci.mockResolvedValue({ ingredients: current, quote: current.join(", "), source: NYKAA, pageTitles: ["Lotus Gel Creme"], siteName: "Nykaa", trust: 3, origin: "nykaa", alternatives: [{ source: DECODER, origin: "decoder", count: 6 }] });
    const out = await runProductReview(NYKAA);
    expect(out.type).toBe("product-review");
    const review = stored()!;
    expect(review.inciIngredients).toEqual(current);
    expect(review.inciSourceUrl).toBe(NYKAA);
    expect(review.inciEvidence).toMatchObject({ sourceUrl: NYKAA, captureTrust: 3, quote: current.join(", "), origin: "nykaa", alternatives: [{ source: DECODER, origin: "decoder", count: 6 }] });
  });

  it("keeps the Decoder list, as before, when it won or nothing else gave a list, recording any alternative", async () => {
    h.brandInci.mockResolvedValue({ ingredients: older, quote: older.join(", "), source: DECODER, pageTitles: ["Lotus Gel Creme"], trust: 3, origin: "decoder", alternatives: [{ source: NYKAA, origin: "nykaa", count: 3 }] });
    await runProductReview(NYKAA);
    expect(stored()).toMatchObject({ inciIngredients: older, inciSourceUrl: DECODER, inciEvidence: { captureTrust: 3, origin: "decoder", alternatives: [{ source: NYKAA, origin: "nykaa", count: 3 }] } });
    h.upserts.length = 0;
    h.brandInci.mockResolvedValue(null);
    await runProductReview(NYKAA);
    expect(stored()).toMatchObject({ inciIngredients: older, inciSourceUrl: DECODER, inciEvidence: { captureTrust: 3, origin: "decoder" } });
  });

  it("falls back to the Decoder list when the lookup throws or overruns, rather than failing the analysis", async () => {
    h.brandInci.mockRejectedValue(new Error("Firecrawl down"));
    const out = await runProductReview(NYKAA);
    expect(out.type).toBe("product-review");
    expect(stored()).toMatchObject({ inciIngredients: older, inciSourceUrl: DECODER });
  });
});

describe("runProductReview: a URL whose slug does not start with the brand (Beauty of Joseon /products/dynasty-cream, 2026-11-02)", () => {
  // The first lookup takes "gel" for the brand, so the brand's own page is refused; the model then names the brand, and the second lookup must let the brand's page meet the list the first took.
  const BRAND_PAGE = "https://lotus.example.com/products/gel-creme";
  const brandPage = { ingredients: current, quote: current.join(", "), source: BRAND_PAGE, pageTitles: ["Lotus Gel Creme"], siteName: "Lotus", trust: 4, origin: "brand-page" };
  const decoderPage = { ingredients: older, quote: older.join(", "), source: DECODER, pageTitles: ["Lotus Gel Creme"], trust: 3, origin: "decoder" };
  beforeEach(() => invalidateReviewCache("lotus-lotus-gel-creme")); // these analyses are stored under the brand-prefixed slug; the engine keeps finished reviews in memory by slug

  it("looks again with the brand the model named, offering the Decoder list found by name, and publishes the brand page's list when it wins", async () => {
    h.brandInci.mockResolvedValueOnce(null).mockResolvedValueOnce(brandPage);
    await runProductReview(BRAND_PAGE);
    expect(h.brandInci).toHaveBeenCalledTimes(2);
    const [query, brand, supplied, , known] = h.brandInci.mock.calls[1] as [string, string, string, unknown, { source: string }[]];
    expect([query, brand, supplied]).toEqual(["Lotus Lotus Gel Creme", "Lotus", BRAND_PAGE]);
    expect(known.map((k) => k.source)).toEqual([DECODER]);
    expect(stored()).toMatchObject({ inciIngredients: current, inciSourceUrl: BRAND_PAGE, inciEvidence: { captureTrust: 4, origin: "brand-page" } });
  });

  it("does the same when the Decoder list was not found by name but came back as the first lookup's winner (what happened on Beauty of Joseon)", async () => {
    h.resolve.mockResolvedValue({ chosen: null, distinct: [], ambiguous: true });
    h.brandInci.mockResolvedValueOnce(decoderPage).mockResolvedValueOnce(brandPage);
    await runProductReview(BRAND_PAGE);
    expect(h.brandInci).toHaveBeenCalledTimes(2);
    const known = h.brandInci.mock.calls[1][4] as { source: string }[];
    expect(known.map((k) => k.source)).toEqual([DECODER]);
    expect(stored()).toMatchObject({ inciIngredients: current, inciSourceUrl: BRAND_PAGE, inciEvidence: { captureTrust: 4, origin: "brand-page" } });
  });

  it("keeps the first list, with what lost recorded, when it wins the second look too, and does not ask the model again", async () => {
    h.resolve.mockResolvedValue({ chosen: null, distinct: [], ambiguous: true });
    h.brandInci.mockResolvedValueOnce(decoderPage).mockResolvedValueOnce({ ...decoderPage, alternatives: [{ source: BRAND_PAGE, origin: "brand-page", count: 7 }] });
    await runProductReview(BRAND_PAGE);
    expect(stored()).toMatchObject({ inciIngredients: older, inciSourceUrl: DECODER, inciEvidence: { origin: "decoder", alternatives: [{ source: BRAND_PAGE, origin: "brand-page", count: 7 }] } });
    expect(h.generate).toHaveBeenCalledTimes(1);
  });

  // 2026-11-03: Lakme's Peach Milk Creme, pasted by its old address (.../lakme-peach-ceramide-moisturizer-...). The slug starts with the brand, so the brand "hint" equals the model's brand
  // and no second look was made; the page's real title shares almost nothing with the address, so the brand's own page failed the title check and another product's Nykaa list was taken.
  it("looks again for a pasted address even when its slug starts with the brand the model named, so the page's real name is used", async () => {
    const OLD_ADDRESS = "https://lotus.example.com/products/lotus-gel-creme-old-name-50g";
    h.resolve.mockResolvedValue({ chosen: null, distinct: [], ambiguous: true });
    h.brandInci.mockResolvedValueOnce(decoderPage).mockResolvedValueOnce({ ...brandPage, source: OLD_ADDRESS });
    await runProductReview(OLD_ADDRESS);
    expect(h.brandInci).toHaveBeenCalledTimes(2);
    const [query, brand, supplied] = h.brandInci.mock.calls[1] as [string, string, string];
    expect([query, brand, supplied]).toEqual(["Lotus Lotus Gel Creme", "Lotus", OLD_ADDRESS]);
    expect(stored()).toMatchObject({ inciIngredients: current, inciEvidence: { captureTrust: 4, origin: "brand-page" } });
  });

  it("does not look a second time when the first lookup already ended on the brand's own page", async () => {
    h.brandInci.mockResolvedValue(brandPage);
    await runProductReview(BRAND_PAGE);
    expect(h.brandInci).toHaveBeenCalledTimes(1);
  });
});
