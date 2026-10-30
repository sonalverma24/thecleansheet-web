import { describe, expect, it, vi } from "vitest";
import type { ProductScorecard } from "@/data/brands/types";

vi.mock("next/cache", () => ({ revalidatePath: () => undefined }));
vi.mock("@/lib/product-review-engine", () => ({ listRepositoryCatalogueProducts: async () => [] }));

import { EMPTY_FILTERS, computeFacets, filterAndSort } from "./registry-filters";
import { buildIngredientIndex } from "./ingredient-product-index";
import { buildShelf } from "./home-shelf";
import { targetsAfterNewAnalysis } from "./site-refresh";

/* What the owner asked for, as one test: whatever new product is analysed is added to its matching ingredients, to its brand and its products, to the filters
   on the left, to the count at the top, and to the home page (up to five, the owner's picks once chosen). Each place reads the stored analyses, so the test
   hands the same list, with one new product on the front (newest first), to each of them. */

let n = 0;
const product = (over: Partial<ProductScorecard> & { productName: string; brand: string }): ProductScorecard => {
  n += 1;
  return {
    slug: `p-${n}`, brandSlug: over.brand.toLowerCase().replace(/\W+/g, "-"), priceRange: "", concern: "", summary: "A clear takeaway.", score: 70, scoreLabel: "Good",
    image: "https://img.example/p.jpg", pillars: [], keyActives: [], ingredients: [], pass_badges: [], warn_badges: [], info_badges: [], indiaContext: "",
    analyzedAt: "2026-10-30", category: "Sunscreen", reviewTier: "mostly-clean", freshReview: true, ...over,
  } as ProductScorecard;
};
const ing = (...names: string[]) => names.map((name) => ({ name, note: "", flag: "ok" as const }));

const EXISTING = [
  product({ slug: "old-1", brand: "Alpha", productName: "Alpha Sun Gel", ingredients: ing("Aqua", "Zinc Oxide") }),
  product({ slug: "old-2", brand: "Beta", productName: "Beta Face Wash", category: "Face Wash", ingredients: ing("Aqua", "Glycerin") }),
];
const NEW = product({ slug: "new-1", brand: "Gamma Labs", productName: "Gamma Daily Shield SPF 50", ingredients: ing("Aqua", "Zinc Oxide", "Niacinamide"), reviewTier: "approved" });
const AFTER = [NEW, ...EXISTING];

describe("a new analysis reaches every place that shows analyses", () => {
  it("is added to the pages of its matching ingredients, and only those", () => {
    const index = buildIngredientIndex(AFTER);
    expect(index.get("niacinamide")?.map((p) => p.productSlug)).toEqual(["new-1"]);
    expect(index.get("zinc-oxide")?.map((p) => p.productSlug)).toEqual(["new-1", "old-1"]);
    expect(index.get("glycerin")?.map((p) => p.productSlug)).toEqual(["old-2"]);
  });

  it("is added to the product list, its brand and its product type, which are the filters on the left, and to the count of products", () => {
    const before = filterAndSort(EXISTING, { filters: EMPTY_FILTERS, query: "", sort: "newest" });
    const after = filterAndSort(AFTER, { filters: EMPTY_FILTERS, query: "", sort: "newest" });
    expect(after.length).toBe(before.length + 1);
    expect(after.map((p) => p.slug)).toContain("new-1");

    const facets = computeFacets(AFTER, EMPTY_FILTERS, "");
    expect(facets.brand.find((f) => f.value === "Gamma Labs")?.count).toBe(1);
    expect(facets.category.find((f) => f.value === "Sunscreens")?.count).toBe(2);
    expect(facets.standing.find((f) => f.value === "Green")?.count).toBe(computeFacets(EXISTING, EMPTY_FILTERS, "").standing.find((f) => f.value === "Green")!.count + 1);
  });

  it("is found by searching its name, its brand or one of its ingredients", () => {
    for (const query of ["Gamma Daily", "Gamma Labs", "Niacinamide"]) {
      expect(filterAndSort(AFTER, { filters: EMPTY_FILTERS, query, sort: "best_match" }).map((p) => p.slug), query).toContain("new-1");
    }
  });

  it("is added to the home page, newest first, up to five, until the owner picks", () => {
    expect(buildShelf(AFTER, { picks: [] })[0].slug).toBe("new-1");
    const many = [NEW, ...Array.from({ length: 8 }, (_, i) => product({ slug: `x-${i}`, brand: "B", productName: `P${i}` }))];
    expect(buildShelf(many, { picks: [] }).map((c) => c.slug)).toEqual(["new-1", "x-0", "x-1", "x-2", "x-3"]);
  });

  it("stays off the home page when the owner has picked other products, and joins it when picked", () => {
    expect(buildShelf(AFTER, { picks: ["old-2"] }).map((c) => c.slug)).toEqual(["old-2"]);
    expect(buildShelf(AFTER, { picks: ["new-1", "old-2"] }).map((c) => c.slug)).toEqual(["new-1", "old-2"]);
  });

  it("makes every one of those pages refresh when it is saved, without waiting out the five minutes", () => {
    const paths = targetsAfterNewAnalysis("new-1").map((t) => t.type ? `${t.path} (${t.type})` : t.path);
    expect(paths).toEqual(expect.arrayContaining(["/", "/products", "/brands", "/brands/[brand] (page)", "/ingredients/[slug] (page)", "/analysis/new-1", "/sitemaps/reviews.xml"]));
  });
});
