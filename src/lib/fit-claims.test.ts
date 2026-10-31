import { describe, expect, it } from "vitest";
import type { ProductReview } from "./product-review-types";
import { isUnsupportedFitLine, withoutUnsupportedFitLines } from "./fit-claims";

const review = (avoidIf: unknown, irritancyConcerns: unknown) =>
  ({ consumerSuitability: { bestFor: ["Dry skin"], avoidIf }, formulaLogic: { note: "n", irritancyConcerns } }) as unknown as ProductReview;

describe("isUnsupportedFitLine", () => {
  it.each([
    "Expect a truly 'clean' formula",
    "You expect a truly clean formula",
    "You want a clean beauty product",
    "Clean-label purists",
    "You are prone to fungal acne",
    "Fungal-acne prone skin",
    "May feed Malassezia in prone individuals",
    "Pityrosporum folliculitis",
  ])("drops %s", (line) => expect(isUnsupportedFitLine(line)).toBe(true));

  it.each([
    "You want a squeaky-clean feel",
    "You need a dedicated cleanser for makeup",
    "Sensitive to fragrance",
    "Acne-prone skin",
    "Very dry skin (may need richer cream)",
  ])("keeps %s", (line) => expect(isUnsupportedFitLine(line)).toBe(false));
});

describe("withoutUnsupportedFitLines", () => {
  it("takes the lines out of both lists and leaves the rest", () => {
    const out = withoutUnsupportedFitLines(review(["Sensitive to fragrance", "Expect a truly 'clean' formula", "You are prone to fungal acne"], ["Can sting broken skin.", "may feed Malassezia"]));
    expect(out.consumerSuitability.avoidIf).toEqual(["Sensitive to fragrance"]);
    expect(out.consumerSuitability.bestFor).toEqual(["Dry skin"]);
    expect(out.formulaLogic.irritancyConcerns).toEqual(["Can sting broken skin."]);
  });

  it("returns the same object when there is nothing to take out, and does not change the stored review", () => {
    const r = review(["Sensitive to fragrance"], ["Can sting broken skin."]);
    expect(withoutUnsupportedFitLines(r)).toBe(r);
    const dirty = review(["You are prone to fungal acne"], []);
    withoutUnsupportedFitLines(dirty);
    expect(dirty.consumerSuitability.avoidIf).toEqual(["You are prone to fungal acne"]);
  });

  it("copes with a review that has no lists or odd entries", () => {
    const bare = {} as ProductReview;
    expect(withoutUnsupportedFitLines(bare)).toBe(bare);
    expect(withoutUnsupportedFitLines(review([42, null, "Expect a truly 'clean' formula", "ok"], undefined)).consumerSuitability.avoidIf).toEqual(["ok"]);
  });
});
