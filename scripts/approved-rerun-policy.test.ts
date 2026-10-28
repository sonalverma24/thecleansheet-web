import { describe, expect, it } from "vitest";
import { makeReview } from "@/lib/review.fixtures";
import { makeInciEvidence } from "@/lib/review-verifier";
import { newestFirst, rerunQuery, validateReplacement, type RerunRow } from "./approved-rerun-policy";
const review = makeReview({ productName: "Alpha Serum", brand: "Test", inciIngredients: ["Aqua", "Glycerin", "Niacinamide", "Panthenol"], researchLog: { grounded: true, webSearchQueries: ["test"], sourceUris: [], sourceTitles: [], recordedAt: "2026-10-28" } });
review.inciEvidence = makeInciEvidence("https://inkeedecoder.com/products/test-alpha-serum", "Aqua, Glycerin, Niacinamide, Panthenol", "2026-10-28");
const row = (slug: string, date: string | null): RerunRow => ({ product_slug: slug, product_name: "Alpha Serum", brand: "Test", reviewed_at: date, result: { type: "product-review", review }, rubric_rev: "r7", tier: "mostly-clean", image_url: null });
describe("approved catalogue rerun", () => {
  it("processes newest first and puts missing dates last without mutating the backup", () => {
    const rows = [row("old", "2026-07-01"), row("missing", null), row("new", "2026-10-28")];
    expect(newestFirst(rows).map(r => r.product_slug)).toEqual(["new", "old", "missing"]);
    expect(rows[0].product_slug).toBe("old");
  });
  it("prefers the exact saved product URL", () => {
    const r = row("one", "2026-10-28");
    r.result = { type: "product-review", review: { ...review, productPageUrl: "https://nykaa.com/alpha/p/123" } };
    expect(rerunQuery(r)).toBe("https://nykaa.com/alpha/p/123");
  });
  it("accepts a sourced fresh result even if its canonical slug changes, preserving the old URL at write time", () => {
    expect(validateReplacement(row("old-url", "2026-07-01"), { ...review, productSlug: "new-url" }, "buy-with-caution", "look-elsewhere")).toEqual([]);
  });
  it("rejects wrong products and model-only ingredients before writing", () => {
    const bad = { ...review, brand: "Other", productName: "Beta Shampoo", inciEvidence: undefined };
    expect(validateReplacement(row("one", "2026-07-01"), bad, "buy-with-caution", "not-enough-info")).toEqual(expect.arrayContaining(["brand-changed", "product-identity-changed", "primary-ingredient-source-missing", "decision-lost"]));
  });
  it("holds truncated or ungrounded reruns", () => {
    const bad = { ...review, inciEvidence: { ...review.inciEvidence!, quoteTruncated: true }, researchLog: undefined };
    expect(validateReplacement(row("one", "2026-07-01"), bad, "buy-with-caution", "buy-with-caution")).toEqual(expect.arrayContaining(["primary-ingredient-source-missing", "web-search-missing"]));
  });
  it("uses the saved URL identity when a noisy retailer title becomes the clean source title", () => {
    const r = row("old", "2026-07-01");
    r.result = { type: "product-review", review: { ...review, productName: "Alpha Serum Brightening Hydration Best Face Serum 30ml", productPageUrl: "https://nykaa.com/test-alpha-serum/p/123" } };
    expect(validateReplacement(r, review, "buy-with-caution", "buy-with-caution")).not.toContain("product-identity-changed");
  });
  it("holds a shorter verified list but lets a primary source correct an unanchored model list", () => {
    const r = row("one", "2026-07-01");
    r.result = { type: "product-review", review: { ...review, inciIngredients: [...review.inciIngredients!, "Tocopherol", "Citric Acid"] } };
    expect(validateReplacement(r, review, "buy-with-caution", "buy-with-caution")).toContain("ingredient-list-shorter");
    r.result.review!.inciEvidence = undefined;
    expect(validateReplacement(r, review, "buy-with-caution", "buy-with-caution")).not.toContain("ingredient-list-shorter");
  });

});
