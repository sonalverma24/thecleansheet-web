import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductScorecard } from "@/data/brands/types";

const list = vi.fn();
vi.mock("@/lib/product-review-engine", () => ({ listRepositoryCatalogueProducts: (...a: unknown[]) => list(...a) }));

import { buildIngredientIndex, getProductsWithIngredient } from "./ingredient-product-index";

const tile = (slug: string, names: string[], over: Partial<ProductScorecard> = {}): ProductScorecard => ({
  slug, brand: "Brand", productName: `Product ${slug}`, image: `https://img.example/${slug}.jpg`, score: 70, reviewTier: "mostly-clean",
  ingredients: names.map((name) => ({ name, note: "", flag: "ok" as const })), ...over,
} as ProductScorecard);

describe("which products an ingredient page lists", () => {
  it("lists every analysed product whose ingredient list names it, newest first as given", () => {
    const index = buildIngredientIndex([tile("new", ["Aqua", "Niacinamide"]), tile("old", ["Niacinamide", "Glycerin"])]);
    expect(index.get("niacinamide")?.map((p) => p.productSlug)).toEqual(["new", "old"]);
    expect(index.get("glycerin")?.map((p) => p.productSlug)).toEqual(["old"]);
  });

  it("lists a product once per ingredient however often its list repeats it", () => {
    const index = buildIngredientIndex([tile("a", ["Niacinamide", "niacinamide", "Niacinamide "])]);
    expect(index.get("niacinamide")).toHaveLength(1);
  });

  it("gives each product the circle its own page shows: the pill when there is one, else today's standing", () => {
    const index = buildIngredientIndex([
      tile("pilled", ["Zinc Oxide"], { pill: { key: "buy-with-caution", marker: "yellow" } }),
      tile("grey", ["Zinc Oxide"], { pill: { key: "not-enough-info", marker: null } }),
      tile("tiered", ["Zinc Oxide"]),
    ]);
    expect(index.get("zinc-oxide")?.map((p) => p.marker)).toEqual(["yellow", null, "green"]);
  });

  it("has nothing for an ingredient no analysed product contains", () => {
    expect(buildIngredientIndex([tile("a", ["Aqua"])]).get("retinol")).toBeUndefined();
  });
});

describe("the shared, short-lived index", () => {
  beforeEach(() => { vi.useFakeTimers(); list.mockReset(); });
  afterEach(() => vi.useRealTimers());

  it("reads the analyses once for many pages, then again after two minutes, so a new analysis appears", async () => {
    vi.setSystemTime(new Date("2026-11-01T00:00:00Z"));
    list.mockResolvedValue([tile("a", ["Niacinamide"])]);
    await Promise.all([getProductsWithIngredient("niacinamide"), getProductsWithIngredient("aqua"), getProductsWithIngredient("niacinamide")]);
    expect(list).toHaveBeenCalledTimes(1);

    list.mockResolvedValue([tile("b", ["Niacinamide"]), tile("a", ["Niacinamide"])]);
    vi.setSystemTime(new Date("2026-11-01T00:01:00Z"));
    expect((await getProductsWithIngredient("niacinamide")).map((p) => p.productSlug)).toEqual(["a"]);
    vi.setSystemTime(new Date("2026-11-01T00:02:30Z"));
    expect((await getProductsWithIngredient("niacinamide")).map((p) => p.productSlug)).toEqual(["b", "a"]);
    expect(list).toHaveBeenCalledTimes(2);
  });

  it("remembers an empty read only briefly, so a recovery shows within seconds", async () => {
    vi.setSystemTime(new Date("2026-11-02T00:00:00Z"));
    list.mockResolvedValue([]);
    expect(await getProductsWithIngredient("niacinamide")).toEqual([]);
    list.mockResolvedValue([tile("a", ["Niacinamide"])]);
    vi.setSystemTime(new Date("2026-11-02T00:00:20Z"));
    expect((await getProductsWithIngredient("niacinamide")).map((p) => p.productSlug)).toEqual(["a"]);
  });

  it("caps the list at the limit", async () => {
    vi.setSystemTime(new Date("2026-11-03T00:00:00Z"));
    list.mockResolvedValue(Array.from({ length: 12 }, (_, i) => tile(`p${i}`, ["Niacinamide"])));
    expect(await getProductsWithIngredient("niacinamide", 8)).toHaveLength(8);
  });
});
