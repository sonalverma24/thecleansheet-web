import { describe, expect, it } from "vitest";
import type { ProductScorecard } from "@/data/brands/types";
import { brandSlug, canonicalDirectoryName, portfolioFromCounts, standingForProduct } from "./brand-directory";

describe("brand identity", () => {
  it("merges punctuation, typography and diacritics for identical brands", () => {
    expect(brandSlug("L'Oreal Paris")).toBe("loreal-paris");
    expect(brandSlug("L’Oréal Paris")).toBe("loreal-paris");
    expect(canonicalDirectoryName("L'Oreal Paris")).toBe("L'Oréal Paris");
    expect(brandSlug("Pond's")).toBe("ponds");
    expect(brandSlug("Ponds")).toBe("ponds");
    expect(brandSlug("Dr Sheth's")).toBe("dr-sheths");
    expect(brandSlug("DR. SHETHS")).toBe("dr-sheths");
  });
});

describe("product colour", () => {
  const review = (reviewTier: ProductScorecard["reviewTier"], pill?: ProductScorecard["pill"]) =>
    ({ reviewTier, pill } as ProductScorecard);

  it("uses the same pill marker that appears on the product page", () => {
    expect(standingForProduct(review("mostly-clean", { key: "unrated", marker: null }))).toBe("unrated");
    expect(standingForProduct(review("mostly-clean", { key: "caution", marker: "yellow" }))).toBe("yellow");
    expect(standingForProduct(review("not-recommended", { key: "red", marker: "red" }))).toBe("red");
  });

  it("maps supported legacy tiers without treating missing ratings as green", () => {
    expect(standingForProduct(review("approved"))).toBe("green");
    expect(standingForProduct(review("mostly-clean"))).toBe("green");
    expect(standingForProduct(review("can-do-better"))).toBe("yellow");
    expect(standingForProduct(review("not-recommended"))).toBe("red");
    expect(standingForProduct(review("not-assessed"))).toBe("unrated");
    expect(standingForProduct(review(undefined))).toBe("unrated");
  });
});

describe("portfolio standing", () => {
  it("uses the most frequent rated colour, not the most severe colour", () => {
    expect(portfolioFromCounts({ green: 6, yellow: 1, red: 2, unrated: 10 })).toEqual({
      standing: "green", leadingColor: "green", ratedCount: 9,
    });
  });

  it("does not hide ties", () => {
    expect(portfolioFromCounts({ green: 3, yellow: 3, red: 1, unrated: 4 }).standing).toBe("mixed");
  });

  it("reports low coverage instead of presenting a firm brand rating", () => {
    expect(portfolioFromCounts({ green: 1, yellow: 0, red: 1, unrated: 30 }).standing).toBe("limited");
    expect(portfolioFromCounts({ green: 2, yellow: 0, red: 0, unrated: 0 })).toEqual({
      standing: "limited", leadingColor: "green", ratedCount: 2,
    });
  });

  it("does not invent an outcome when every product is unrated", () => {
    expect(portfolioFromCounts({ green: 0, yellow: 0, red: 0, unrated: 3 })).toEqual({
      standing: "unrated", leadingColor: null, ratedCount: 0,
    });
  });
});
