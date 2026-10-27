import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SAMPLE_EXAMPLE_MINERAL_SUNSCREEN, SAMPLE_MINIMALIST_B5 } from "@/data/analysis/sample-reviews";
import { ANALYSER_FLAGS } from "@/lib/analyser-flags";
import { evidence, rv } from "@/lib/analyser-x/test-helpers";
import type { ProductReview } from "@/lib/product-review-types";

/* The reviews sitemap with only the database replaced. A page the pills page keeps out of search (noindex) must not be listed in it. */
const h = vi.hoisted(() => {
  const state: { rows: unknown[] } = { rows: [] };
  const chain: unknown = new Proxy(function () {}, {
    get: (_t, prop) => (prop === "then" ? (resolve: (v: unknown) => void) => resolve({ data: state.rows, error: null }) : () => chain),
    apply: () => chain,
  });
  return { state, chain };
});
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => h.chain }));
vi.mock("next/cache", () => ({ revalidatePath: () => undefined }));

import { deriveVerdict, listReviewIndex } from "@/lib/product-review-engine";
import { getSitemapEntries } from "@/lib/sitemap-data";

const NO_LIST: ProductReview = rv({ productName: "Face Cream Without A List", brand: "Unlisted Co", category: "Moisturizer", inciIngredients: [], ingredientReads: [], claimMap: [] }, evidence.model());
const row = (slug: string, review: ProductReview) => ({ product_slug: slug, product_name: review.productName, brand: review.brand, rubric_rev: "r7", reviewed_at: "2026-10-20T00:00:00Z", result: { type: "product-review", review, verdict: deriveVerdict(review) } });

beforeEach(() => {
  h.state.rows = [row("rated-clean", SAMPLE_MINIMALIST_B5), row("rated-mineral", SAMPLE_EXAMPLE_MINERAL_SUNSCREEN), row("could-not-rate", NO_LIST)];
});
afterEach(() => vi.unstubAllEnvs());

describe("the review index and the reviews sitemap", () => {
  it("flag off: every review is listed, nothing is marked, and the result is not read", async () => {
    vi.stubEnv(ANALYSER_FLAGS.pillsPage, "0");
    const index = await listReviewIndex();
    expect(index.map((r) => r.slug)).toEqual(["rated-clean", "rated-mineral", "could-not-rate"]);
    for (const r of index) expect("outOfSearch" in r).toBe(false);
    const urls = (await getSitemapEntries("reviews")).map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/analysis/could-not-rate"))).toBe(true);
  });

  it("flag on: a page kept out of search is marked, and the sitemap leaves it out", async () => {
    vi.stubEnv(ANALYSER_FLAGS.pillsPage, "1");
    const index = await listReviewIndex();
    expect(index.find((r) => r.slug === "could-not-rate")?.outOfSearch).toBe(true);
    expect(index.find((r) => r.slug === "rated-mineral")?.outOfSearch).toBeUndefined();
    const urls = (await getSitemapEntries("reviews")).map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/analysis/could-not-rate"))).toBe(false);
    expect(urls.some((u) => u.endsWith("/analysis/rated-mineral"))).toBe(true);
  });

  it("flag on: a row whose review cannot be read stays listed, as before", async () => {
    vi.stubEnv(ANALYSER_FLAGS.pillsPage, "1");
    h.state.rows = [{ product_slug: "unreadable", product_name: "X", brand: "Y", rubric_rev: "r7", reviewed_at: "2026-10-20T00:00:00Z", result: { type: "product-review", review: null } }];
    const index = await listReviewIndex();
    expect(index.map((r) => r.slug)).toEqual(["unreadable"]);
    expect(index[0].outOfSearch).toBeUndefined();
  });
});
