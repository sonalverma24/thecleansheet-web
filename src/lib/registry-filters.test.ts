import { describe, expect, it } from "vitest";
import type { ProductScorecard } from "@/data/brands/types";
import {
  EMPTY_FILTERS, activeName, computeFacets, filterAndSort, matchesFilters, priceBucket,
  productGroup, searchWithState, standingOf, stateFromParams, type RegistryFilters,
} from "./registry-filters";

let n = 0;
function product(over: Partial<ProductScorecard> & { productName: string; brand: string }): ProductScorecard {
  n += 1;
  return {
    slug: `p-${n}`, brandSlug: over.brand.toLowerCase(), priceRange: "", concern: "", summary: "", score: 70, scoreLabel: "Good",
    image: "", pillars: [], keyActives: [], ingredients: [], pass_badges: [], warn_badges: [], info_badges: [], indiaContext: "",
    analyzedAt: "2026-10-01", category: "Serum", reviewTier: "mostly-clean", ...over,
  } as ProductScorecard;
}

const A = product({ brand: "Anua", productName: "Heartleaf Cleansing Oil", category: "Cleanser", reviewTier: "can-do-better", price: 1200, analyzedAt: "2026-10-05", keyActives: [{ name: "Houttuynia Cordata Extract", function: "soothing" }] });
const B = product({ brand: "COSRX", productName: "BHA Blackhead Power Liquid", category: "Exfoliant", reviewTier: "can-do-better", price: 900, analyzedAt: "2026-10-03", keyActives: [{ name: "Betaine Salicylate 4%", function: "exfoliant" }] });
const C = product({ brand: "SKIN1004", productName: "Centella Purifying Toner", category: "Toner", reviewTier: "mostly-clean", price: 1500, analyzedAt: "2026-10-04", suitabilityTags: ["Sensitive skin"], keyActives: [{ name: "Centella Asiatica Extract (Cica)", function: "calming" }] });
const D = product({ brand: "Minimalist", productName: "Niacinamide 10% Serum", category: "Serum", reviewTier: "not-recommended", priceRange: "Rs. 399 - Rs. 499", analyzedAt: "2026-09-01", keyActives: [{ name: "Niacinamide 10%", function: "brightening" }] });
const E = product({ brand: "Anua", productName: "Heartleaf Foam", category: "Cleanser", reviewTier: "mostly-clean", analyzedAt: "2026-10-02" });
const ALL = [A, B, C, D, E];

const f = (over: Partial<RegistryFilters>): RegistryFilters => ({ ...EMPTY_FILTERS, ...over });
const names = (list: ProductScorecard[]) => list.map((p) => p.productName);

describe("standing", () => {
  it("is a rating colour (green, yellow, red, grey), never a verdict word and never a certified status", () => {
    expect(standingOf(A)).toBe("Yellow");
    expect(standingOf(C)).toBe("Green");
    expect(standingOf(D)).toBe("Red");
    for (const p of ALL) expect(standingOf(p).toLowerCase()).not.toContain("certif");
  });
});

describe("filters", () => {
  it("ORs the choices inside one group", () => {
    const out = filterAndSort(ALL, { filters: f({ standing: ["Green", "Red"] }), query: "", sort: "newest" });
    expect(names(out).sort()).toEqual(["Centella Purifying Toner", "Heartleaf Foam", "Niacinamide 10% Serum"].sort());
  });

  it("ANDs different groups", () => {
    const out = filterAndSort(ALL, { filters: f({ category: ["Cleansers"], standing: ["Green"] }), query: "", sort: "newest" });
    expect(names(out)).toEqual(["Heartleaf Foam"]);
  });

  it("filters by brand, price bucket, key active and suitability", () => {
    expect(names(filterAndSort(ALL, { filters: f({ brand: ["Anua"] }), query: "", sort: "name" }))).toEqual(["Heartleaf Cleansing Oil", "Heartleaf Foam"]);
    expect(names(filterAndSort(ALL, { filters: f({ price: ["Under ₹500"] }), query: "", sort: "newest" }))).toEqual(["Niacinamide 10% Serum"]);
    expect(names(filterAndSort(ALL, { filters: f({ active: ["Centella Asiatica Extract"] }), query: "", sort: "newest" }))).toEqual(["Centella Purifying Toner"]);
    expect(names(filterAndSort(ALL, { filters: f({ suitability: ["Sensitive skin"] }), query: "", sort: "newest" }))).toEqual(["Centella Purifying Toner"]);
  });

  it("leaves out products with no price when a price bucket is chosen", () => {
    expect(matchesFilters(E, f({ price: ["₹500-₹1,000"] }))).toBe(false);
  });

  it("returns everything when nothing is chosen", () => {
    expect(filterAndSort(ALL, { filters: EMPTY_FILTERS, query: "", sort: "newest" })).toHaveLength(5);
  });
});

describe("facets", () => {
  it("counts each group given the choices in the OTHER groups", () => {
    const facets = computeFacets(ALL, f({ category: ["Cleansers"] }), "");
    const standing = Object.fromEntries(facets.standing.map((x) => [x.value, x.count]));
    expect(standing["Green"]).toBe(1); // only Heartleaf Foam is a green Cleanser
    expect(standing["Yellow"]).toBe(1);
    expect(standing["Red"] ?? 0).toBe(0);
  });

  it("does not shrink a group's own choices when one of them is ticked", () => {
    const facets = computeFacets(ALL, f({ category: ["Cleansers"] }), "");
    expect(facets.category.map((x) => x.value)).toEqual(expect.arrayContaining(["Cleansers", "Exfoliants", "Serums", "Toners"]));
  });

  it("keeps a ticked choice listed even at zero, so it can be unticked", () => {
    const facets = computeFacets(ALL, f({ standing: ["Green"], brand: ["COSRX"] }), "");
    expect(facets.brand.find((x) => x.value === "COSRX")?.count).toBe(0);
  });

  it("lists standings and prices in their natural order", () => {
    const facets = computeFacets(ALL, EMPTY_FILTERS, "");
    expect(facets.standing.map((x) => x.value)).toEqual(["Green", "Yellow", "Red"]);
    expect(facets.price.map((x) => x.value)).toEqual(["Under ₹500", "₹500-₹1,000", "₹1,000-₹2,000"]);
  });

  it("follows the search text", () => {
    const facets = computeFacets(ALL, EMPTY_FILTERS, "heartleaf");
    expect(facets.brand).toEqual([{ value: "Anua", count: 2 }]);
  });
});

describe("search and sort", () => {
  it("finds by product name and brand, best match first", () => {
    const out = filterAndSort(ALL, { filters: EMPTY_FILTERS, query: "anua heartleaf", sort: "best_match" });
    expect(names(out).slice(0, 2).sort()).toEqual(["Heartleaf Cleansing Oil", "Heartleaf Foam"]);
    expect(names(out)).not.toContain("Niacinamide 10% Serum");
  });

  it("falls back to newest when best match is chosen without a search", () => {
    const out = filterAndSort(ALL, { filters: EMPTY_FILTERS, query: "", sort: "best_match" });
    expect(names(out)[0]).toBe("Heartleaf Cleansing Oil");
  });

  it("sorts by standing, price and name", () => {
    expect(standingOf(filterAndSort(ALL, { filters: EMPTY_FILTERS, query: "", sort: "standing" })[0])).toBe("Green");
    expect(names(filterAndSort(ALL, { filters: EMPTY_FILTERS, query: "", sort: "price_asc" }))[0]).toBe("Niacinamide 10% Serum");
    expect(names(filterAndSort(ALL, { filters: EMPTY_FILTERS, query: "", sort: "price_desc" }))[0]).toBe("Centella Purifying Toner");
    expect(names(filterAndSort(ALL, { filters: EMPTY_FILTERS, query: "", sort: "name" }))[0]).toBe("Heartleaf Cleansing Oil");
  });

  it("puts products with no price last in a price sort", () => {
    expect(names(filterAndSort(ALL, { filters: EMPTY_FILTERS, query: "", sort: "price_asc" })).at(-1)).toBe("Heartleaf Foam");
  });
});

describe("product types", () => {
  const typeOf = (category: string, productName = "Test Product", subCategory?: string) =>
    productGroup(product({ brand: "X", productName, category, subCategory }));

  it("folds the free-text categories into one short list", () => {
    expect(typeOf("serum")).toBe("Serums");
    expect(typeOf("Serums")).toBe("Serums");
    expect(typeOf("Serum")).toBe("Serums");
    expect(typeOf("Ampoule / Face Serum")).toBe("Serums");
    expect(typeOf("Essence/Toner")).toBe("Toners");
    expect(typeOf("Toners")).toBe("Toners");
    expect(typeOf("Face Cleansers")).toBe("Cleansers");
    expect(typeOf("Moisturizers")).toBe("Moisturisers");
    expect(typeOf("Sunscreens")).toBe("Sunscreens");
  });

  it("reads the more specific kinds first", () => {
    expect(typeOf("Facewash Bar")).toBe("Cleansers"); // a cleanser before it is a bar of soap
    expect(typeOf("Bathing Soap")).toBe("Body & bath");
    expect(typeOf("Hair Serum")).toBe("Hair care"); // not a face serum
    expect(typeOf("Lip Tint")).toBe("Makeup");
    expect(typeOf("Acne Patch / Spot Treatment")).toBe("Spot care");
    expect(typeOf("Deodorant Stick")).toBe("Body & bath");
  });

  it("does not let a sub-category override a clear category", () => {
    expect(typeOf("Serums", "Acne Control Serum", "Acne Serum")).toBe("Serums");
  });

  it("falls back to the sub-category, then the product name, then Other", () => {
    expect(typeOf("Category Pending", "Vitamin C Face Serum")).toBe("Serums");
    expect(typeOf("Dermaceutical", "Brightening Gel Cream")).toBe("Moisturisers");
    expect(typeOf("Dermaceutical", "Mystery Thing")).toBe("Other");
  });

  it("lists Other last in the product type facet", () => {
    const odd = product({ brand: "X", productName: "Mystery Thing", category: "Dermaceutical" });
    const facets = computeFacets([odd, A, B, C, D, E, E, E], EMPTY_FILTERS, "");
    expect(facets.category.at(-1)?.value).toBe("Other");
  });
});

describe("helpers", () => {
  it("buckets a price from a number or a text range", () => {
    expect(priceBucket({ price: 450, priceRange: "" })).toBe("Under ₹500");
    expect(priceBucket({ price: undefined, priceRange: "₹664-₹699" })).toBe("₹500-₹1,000");
    expect(priceBucket({ price: undefined, priceRange: "" })).toBeNull();
  });

  it("cleans a key active's name", () => {
    expect(activeName("Niacinamide (Vitamin B3) 10%")).toBe("Niacinamide");
    expect(activeName("Betaine Salicylate 4%")).toBe("Betaine Salicylate");
  });
});

describe("URL state", () => {
  it("round-trips filters, search and sort", () => {
    const state = { query: "serum", sort: "price_asc" as const, filters: f({ standing: ["Green"], brand: ["Anua", "COSRX"] }) };
    const search = searchWithState("", state);
    expect(stateFromParams(new URLSearchParams(search))).toEqual(state);
  });

  it("leaves out the default sort and keeps unrelated parameters like ?analyse=", () => {
    const out = searchWithState("analyse=cosrx+bha&q=old", { query: "serum", sort: "best_match", filters: EMPTY_FILTERS });
    const sp = new URLSearchParams(out);
    expect(sp.get("analyse")).toBe("cosrx bha");
    expect(sp.get("q")).toBe("serum");
    expect(sp.has("sort")).toBe(false);
  });

  it("drops old filter parameters so a stale link cannot leave a hidden filter", () => {
    const out = searchWithState("cert=TCS%20Certified&score=Good&type=Foam", { query: "", sort: null, filters: EMPTY_FILTERS });
    expect(out).toBe("");
  });

  it("ignores an unknown sort value", () => {
    expect(stateFromParams(new URLSearchParams("sort=bogus")).sort).toBeNull();
  });
});

describe("the pills page: a card of a stored review carries its rating circle", () => {
  const withPill = (p: ProductScorecard, key: string, marker: NonNullable<ProductScorecard["pill"]>["marker"]) => ({ ...p, pill: { key, marker } });
  const GOOD = withPill(C, "good-choice", "green");
  const CAUTION = withPill(A, "buy-with-caution", "yellow");
  const LOOK = withPill(D, "look-elsewhere", "red");
  const NOT_ENOUGH = withPill(E, "not-enough-info", null);
  const MED = withPill(B, "medicinal-product", null);
  const MIXED = [GOOD, CAUTION, LOOK, NOT_ENOUGH, MED];

  it("the rating is the pill's colour when there is a pill, and the standing's colour when there is none", () => {
    expect(standingOf(GOOD)).toBe("Green");
    expect(standingOf(NOT_ENOUGH)).toBe("Grey");
    expect(standingOf(MED)).toBe("Grey");
    expect(standingOf(C)).toBe("Green"); // the same product with no pill
    expect(standingOf({ reviewTier: "not-assessed", score: 0 })).toBe("Grey");
  });

  it("filters by colour, and a pill and the standing it replaces share a colour", () => {
    const out = filterAndSort(MIXED, { filters: f({ standing: ["Green", "Red"] }), query: "", sort: "newest" });
    expect(names(out).sort()).toEqual([GOOD.productName, LOOK.productName].sort());
  });

  it("lists the colours in their natural order, once each, however many products have them", () => {
    expect(computeFacets(MIXED, EMPTY_FILTERS, "").standing.map((x) => x.value)).toEqual(["Green", "Yellow", "Red", "Grey"]);
    expect(computeFacets([...MIXED, D, C], EMPTY_FILTERS, "").standing.map((x) => x.value)).toEqual(["Green", "Yellow", "Red", "Grey"]);
  });

  it("sorts best first: green, yellow, red, then the ones we could not rate", () => {
    const sorted = filterAndSort([MED, LOOK, NOT_ENOUGH, CAUTION, GOOD], { filters: EMPTY_FILTERS, query: "", sort: "standing" });
    expect(sorted.map(standingOf)).toEqual(["Green", "Yellow", "Red", "Grey", "Grey"]);
  });

  it("no verdict word is ever a filter value", () => {
    const values = computeFacets([...MIXED, D, C], EMPTY_FILTERS, "").standing.map((x) => x.value).join(" ");
    expect(values).not.toMatch(/Good choice|Buy with caution|Look elsewhere|Not enough info|Medicinal|Good Standing|Room to Improve|Not Recommended|Licensed/);
  });
});

