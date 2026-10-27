import { describe, expect, it } from "vitest";
import { buildAtAGlance } from "@/lib/at-a-glance";
import { deriveVerdict } from "@/lib/product-review-engine";
import { isListReadWithoutQuote, isSourceBackedInci } from "@/lib/inci-source-backing";
import { reviewToScorecard } from "@/lib/review-to-scorecard";
import { makeReview } from "@/lib/review.fixtures";
import { makeInciEvidence } from "@/lib/review-verifier";
import type { ProductReview } from "@/lib/product-review-types";

const WHEN = "2026-10-21T00:00:00.000Z";
const URL = "https://incidecoder.com/products/x";
const LIST = ["Aqua", "Glycerin", "Niacinamide", "Phenoxyethanol"];

const cases: Record<string, { review: ProductReview; backed: boolean; readWithoutQuote: boolean; status: string }> = {
  "a captured quote": { review: makeReview({ inciSourceUrl: URL, inciEvidence: makeInciEvidence(URL, LIST.join(", "), WHEN, "Test Face Wash") }), backed: true, readWithoutQuote: false, status: "Full INCI in reference database" },
  "a legacy row: a reference page URL and no quote": { review: makeReview({ inciSourceUrl: URL }), backed: false, readWithoutQuote: true, status: "List read, source quote not captured" },
  "a quote that was cut short": { review: makeReview({ inciSourceUrl: URL, inciEvidence: makeInciEvidence(URL, "Aqua, Glycerin", WHEN, "Test Face Wash", true) }), backed: false, readWithoutQuote: false, status: "Partial" },
  "a list the model reported with no source": { review: makeReview(), backed: false, readWithoutQuote: false, status: "Partial" },
  "a list of only two ingredients": { review: makeReview({ inciSourceUrl: URL, inciIngredients: ["Aqua", "Glycerin"], inciEvidence: makeInciEvidence(URL, "Aqua, Glycerin", WHEN, "Test Face Wash") }), backed: false, readWithoutQuote: false, status: "Partial" },
  "no list at all": { review: makeReview({ inciIngredients: [], ingredientReads: [] }), backed: false, readWithoutQuote: false, status: "Missing" },
};

describe("one definition of a source-backed ingredient list", () => {
  it.each(Object.entries(cases))("%s", (_name, c) => {
    const inci = (c.review.inciIngredients ?? []) as string[];
    expect(isSourceBackedInci(c.review, inci)).toBe(c.backed);
    expect(isListReadWithoutQuote(c.review, inci)).toBe(c.readWithoutQuote);
    expect(reviewToScorecard(c.review, deriveVerdict(c.review)).product.inciCompleteness?.status).toBe(c.status);
  });

  it("a list is never both source-backed and read without a quote", () => {
    for (const c of Object.values(cases)) {
      const inci = (c.review.inciIngredients ?? []) as string[];
      expect(isSourceBackedInci(c.review, inci) && isListReadWithoutQuote(c.review, inci)).toBe(false);
    }
  });

  it("the free-from ticks follow the same definition: they appear exactly when the list is source-backed", () => {
    for (const [name, c] of Object.entries(cases)) {
      const { product } = reviewToScorecard(c.review, deriveVerdict(c.review));
      const ticks = buildAtAGlance(product).filter((t) => /^(Fragrance free|Essential oil free)$/.test(t.label));
      expect(ticks.length > 0, name).toBe(c.backed);
    }
  });
});
