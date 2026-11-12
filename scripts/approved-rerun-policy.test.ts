import { describe, expect, it } from "vitest";
import { makeReview } from "@/lib/review.fixtures";
import { makeInciEvidence } from "@/lib/review-verifier";
import { newestFirst, rerunQuery, validateReplacement, sameReviewTime, keepStoredImage, type RerunRow } from "./approved-rerun-policy";
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
  it("accepts a replacement whose list came from a Nykaa product page (a source since 2026-10-30), and still holds one from another retailer", () => {
    const from = (url: string) => ({ ...review, inciEvidence: makeInciEvidence(url, "Aqua, Glycerin, Niacinamide, Panthenol", "2026-11-03", "Alpha Serum", false, { trust: 3, origin: "nykaa" as const }) });
    expect(validateReplacement(row("a", "2026-07-01"), from("https://www.nykaa.com/test-alpha-serum/p/123"), "not-enough-info", "buy-with-caution")).toEqual([]);
    expect(validateReplacement(row("a", "2026-07-01"), from("https://www.amazon.in/Test-Alpha-Serum/dp/B0X123"), "not-enough-info", "buy-with-caution")).toContain("ingredient-source-not-primary");
  });
  it("does not hold a replacement for being shorter when its list is the brand's own page, but still holds a shorter list from another source", () => {
    const r = row("one", "2026-07-01");
    r.result = { type: "product-review", review: { ...review, inciIngredients: [...review.inciIngredients!, "Tocopherol", "Citric Acid", "Retinol", "Polysorbate 20", "Parfum"] } };
    const from = (url: string, origin: "brand-page" | "decoder") => ({ ...review, inciEvidence: makeInciEvidence(url, "Aqua, Glycerin, Niacinamide, Panthenol", "2026-11-03", "Alpha Serum", false, { trust: origin === "brand-page" ? 4 : 3, origin }) });
    expect(validateReplacement(r, from("https://test.in/products/alpha-serum", "brand-page"), "buy-with-caution", "buy-with-caution")).not.toContain("ingredient-list-shorter");
    expect(validateReplacement(r, from("https://inkeedecoder.com/products/test-alpha-serum", "decoder"), "buy-with-caution", "buy-with-caution")).toContain("ingredient-list-shorter");
  });
  it("holds a replacement whose list cannot be the whole list of a water-based product (Omeo's key actives, 2026-11-04) and accepts it with water", () => {
    const list = (items: string[]) => ({ ...review, productName: "Alpha Shampoo", inciIngredients: items, inciEvidence: makeInciEvidence("https://inkeedecoder.com/products/test-alpha-serum", items.join(", "), "2026-11-04") });
    const actives = ["Arnica Montana Flower Extract", "Calendula Officinalis Flower Extract", "Thuja Occidentalis Leaf Oil", "Propanediol Caprylate", "Lactic Acid"];
    expect(validateReplacement(row("a", "2026-07-01"), list(actives), "not-enough-info", "buy-with-caution")).toContain("implausible-ingredient-list");
    expect(validateReplacement(row("a", "2026-07-01"), list(["Aqua", ...actives]), "not-enough-info", "buy-with-caution")).not.toContain("implausible-ingredient-list");
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

  it("accepts a list the owner typed in from the pack as source-backed, and holds it against a shorter replacement like any other quoted list", () => {
    const supplied = { ...review, inciEvidence: makeInciEvidence("https://test.com/products/alpha-serum", "Aqua, Glycerin, Niacinamide, Panthenol", "2026-11-01", "Alpha Serum", false, { trust: 3, origin: "owner-supplied" }) };
    expect(validateReplacement(row("one", "2026-07-01"), supplied, "buy-with-caution", "buy-with-caution")).not.toContain("primary-ingredient-source-missing");
    const r = row("one", "2026-07-01");
    r.result = { type: "product-review", review: { ...supplied, inciIngredients: [...supplied.inciIngredients!, "Tocopherol", "Citric Acid"] } };
    expect(validateReplacement(r, supplied, "buy-with-caution", "buy-with-caution")).toContain("ingredient-list-shorter");
  });

  it("confirms timestamps by instant, accepting Postgres timezone formatting and rejecting changed values", () => {
    expect(sameReviewTime("2026-10-28T07:41:38.370Z", "2026-10-28T07:41:38.37+00:00")).toBe(true);
    expect(sameReviewTime("2026-10-28T07:41:38.370Z", "2026-10-28T07:41:39.370Z")).toBe(false);
    expect(sameReviewTime("bad", "bad")).toBe(false);
    expect(sameReviewTime(null, null)).toBe(true);
  });

});

describe("a re-run keeps the tile picture", () => {
  const withImage = (url: string | null, extra: Record<string, unknown> = {}): RerunRow => {
    const r = makeReview({ productName: "Alpha Serum", brand: "Test" });
    r.imageUrl = url; Object.assign(r, extra);
    return { ...row("img", "2026-10-28"), image_url: url, result: { type: "product-review", review: r } };
  };
  it("puts the stored picture back over the one the fresh analysis found (the B12 cleanser: a Decoder photo had replaced the Nykaa one)", () => {
    const fresh = makeReview({ productName: "Alpha Serum", brand: "Test" });
    fresh.imageUrl = "https://incidecoder-content.storage.googleapis.com/x/front_photo.jpeg"; fresh.imageSource = "inci";
    keepStoredImage(fresh, withImage("https://images-static.nykaa.com/old.jpg", { imageSource: "nykaa", imageConfidence: 0.9 }));
    expect(fresh.imageUrl).toBe("https://images-static.nykaa.com/old.jpg");
    expect(fresh.imageSource).toBe("nykaa");
    expect(fresh.imageConfidence).toBe(0.9);
  });
  it("falls back to the row's image column, and keeps a lock", () => {
    const fresh = makeReview({ productName: "Alpha Serum", brand: "Test" });
    fresh.imageUrl = "https://new/photo.jpg";
    const old = withImage(null); old.image_url = "https://col/pic.jpg";
    keepStoredImage(fresh, old);
    expect(fresh.imageUrl).toBe("https://col/pic.jpg");
    const locked = makeReview({ productName: "Alpha Serum", brand: "Test" });
    keepStoredImage(locked, withImage("https://pinned/pic.jpg", { imageLocked: true }));
    expect(locked.imageLocked).toBe(true);
  });
  it("uses the fresh picture only where the page had none", () => {
    const fresh = makeReview({ productName: "Alpha Serum", brand: "Test" });
    fresh.imageUrl = "https://new/photo.jpg";
    keepStoredImage(fresh, withImage(null));
    expect(fresh.imageUrl).toBe("https://new/photo.jpg");
  });
});
