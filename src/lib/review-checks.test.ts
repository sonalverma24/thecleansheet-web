import { describe, expect, it } from "vitest";
import { reviewCheckIssues } from "@/lib/review-checks";
import { researchLogFrom } from "@/lib/gemini";
import { makeInciEvidence } from "@/lib/review-verifier";
import { makeReview } from "@/lib/review.fixtures";
import type { ProductReview } from "@/lib/product-review-types";

const WHEN = "2026-10-28T00:00:00.000Z";
const LIST = ["Aqua", "Glycerin", "Niacinamide", "Panthenol", "Tocopherol"];
const QUOTE = LIST.join(", ");
const DECODER = "https://incidecoder.com/products/plix-pomegranate-night-cream";
const BRAND_PAGE = "https://www.plixlife.com/product/pomegranate-youth-renewal-night-cream/602";
const searched = researchLogFrom({ webSearchQueries: ["plix night cream"], sourceUris: ["https://example.test/a"], sourceTitles: ["plixlife.com"] }, WHEN);

function review(over: Partial<ProductReview> = {}): ProductReview {
  return makeReview({
    brand: "Plix", productName: "Plix Pomegranate Youth Renewal Night Cream",
    inciIngredients: LIST, inciSourceUrl: DECODER,
    inciEvidence: makeInciEvidence(DECODER, QUOTE, WHEN, "Plix Pomegranate Youth Renewal Night Cream"),
    researchLog: searched,
    ...over,
  });
}

describe("the checks a fresh analysis must pass before it is kept", () => {
  it("passes a Decoder list with a captured quote and a web search behind it", () => {
    expect(reviewCheckIssues(review())).toEqual([]);
  });

  it("passes a list read off the brand's own product page", () => {
    const r = review({ inciSourceUrl: BRAND_PAGE, inciEvidence: makeInciEvidence(BRAND_PAGE, QUOTE, WHEN, "Plix Night Cream") });
    expect(reviewCheckIssues(r)).toEqual([]);
  });

  it("accepts the INKEE Decoder domain as a primary source", () => {
    const url = "https://inkeedecoder.com/products/plix-pomegranate-night-cream";
    const r = review({ inciSourceUrl: url, inciEvidence: makeInciEvidence(url, QUOTE, WHEN, "Plix Night Cream") });
    expect(reviewCheckIssues(r)).toEqual([]);
  });

  it("refuses a review with no ingredient list at all", () => {
    const r = review({ inciIngredients: [], ingredientReads: [], inciSourceUrl: undefined, inciEvidence: undefined });
    expect(reviewCheckIssues(r)).toEqual(["primary-ingredient-source-missing", "ingredient-source-not-primary", "invalid-ingredient-list"]);
  });

  it("refuses a list taken from a retailer page, even with a quote", () => {
    const url = "https://www.nykaa.com/plix-night-cream/p/123";
    const r = review({ inciSourceUrl: url, inciEvidence: makeInciEvidence(url, QUOTE, WHEN, "Plix Night Cream") });
    expect(reviewCheckIssues(r)).toEqual(["primary-ingredient-source-missing", "ingredient-source-not-primary"]);
  });

  it("refuses a model-reported list that has no source", () => {
    const r = review({ inciSourceUrl: undefined, inciEvidence: undefined });
    expect(reviewCheckIssues(r)).toContain("primary-ingredient-source-missing");
    expect(reviewCheckIssues(r)).toContain("ingredient-source-not-primary");
  });

  it("refuses a quote that was cut short", () => {
    const r = review({ inciEvidence: makeInciEvidence(DECODER, QUOTE, WHEN, "Plix Night Cream", true) });
    expect(reviewCheckIssues(r)).toEqual(["primary-ingredient-source-missing"]);
  });

  it("refuses a list that is mostly not ingredient names, but tolerates one stray item", () => {
    const withList = (list: string[]) => review({ inciIngredients: list, inciEvidence: makeInciEvidence(DECODER, list.join(", "), WHEN, "Plix Night Cream") });
    expect(reviewCheckIssues(withList([...LIST, "Contains no parabens or sulphates"]))).toEqual([]);
    expect(reviewCheckIssues(withList([...LIST, "Contains no parabens", "Free from sulphates", "Made without fragrance"]))).toEqual(["invalid-ingredient-list"]);
  });

  it("refuses a review the model wrote without a web search, and says only that", () => {
    expect(reviewCheckIssues(review({ researchLog: researchLogFrom(null, WHEN) }))).toEqual(["web-search-missing"]);
    expect(reviewCheckIssues(review({ researchLog: undefined }))).toEqual(["web-search-missing"]);
  });

  it("reports a missing ingredient list as three separate issues, so a re-run can refuse it while a live search still shows the page", () => {
    const noList = review({ inciIngredients: [], ingredientReads: [], inciSourceUrl: undefined, inciEvidence: undefined });
    expect(reviewCheckIssues(noList)).toHaveLength(3);
    const retailer = "https://www.nykaa.com/plix-night-cream/p/123";
    expect(reviewCheckIssues(review({ inciSourceUrl: retailer, inciEvidence: makeInciEvidence(retailer, QUOTE, WHEN, "Plix Night Cream") }))).toContain("ingredient-source-not-primary");
  });
});
