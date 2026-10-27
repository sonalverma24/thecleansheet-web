import { describe, expect, it } from "vitest";
import { runAnalysis } from "@/lib/analysis-engine";
import { deriveVerdict } from "@/lib/product-review-engine";
import { reviewToScorecard } from "@/lib/review-to-scorecard";
import { makeReview } from "@/lib/review.fixtures";
import { makeInciEvidence } from "@/lib/review-verifier";
import type { ProductReview } from "@/lib/product-review-types";

/* Today's page draws this checklist next to the new source-backed screens. The two must never disagree: a line may say
   "verified" only when the list has a captured source quote, and the pregnancy line never says clear at all. */

const WHEN = "2026-10-21T00:00:00.000Z";
const URL = "https://incidecoder.com/products/x";
const LIST = ["Aqua", "Glycerin", "Niacinamide", "Phenoxyethanol"];
const serum = (over: Partial<ProductReview> = {}) => makeReview({ productName: "Test Serum", category: "Serum", ...over });

const backed = serum({ inciSourceUrl: URL, inciEvidence: makeInciEvidence(URL, LIST.join(", "), WHEN, "Test Serum") });
const noQuote = serum({ inciSourceUrl: URL });
const cutShort = serum({ inciSourceUrl: URL, inciEvidence: makeInciEvidence(URL, "Aqua, Glycerin", WHEN, "Test Serum", true) });
const modelOnly = serum();
const NOT_BACKED = { "a reference page URL and no quote": noQuote, "a quote cut short": cutShort, "a list the model reported with no source": modelOnly };

const check = (r: ProductReview, id: string) => runAnalysis(r).checks.find((c) => c.id === id)!;
const states = (r: ProductReview) => Object.fromEntries(runAnalysis(r).checks.map((c) => [c.id, c.state]));

describe("INCI verification line", () => {
  it("is verified when the list has a captured source quote", () => {
    expect(check(backed, "inci_verified")).toMatchObject({ state: "verified" });
  });

  it.each(Object.entries(NOT_BACKED))("is not verified for %s, and says why", (_name, review) => {
    const c = check(review, "inci_verified");
    expect(c.state).toBe("not-disclosed");
    expect(c.detail).toMatch(/not independently verified/);
  });

  it("agrees with the scorecard's own completeness status", () => {
    for (const review of [backed, ...Object.values(NOT_BACKED)]) {
      const { product } = reviewToScorecard(review, deriveVerdict(review));
      const complete = /^Full INCI/.test(product.inciCompleteness?.status ?? "");
      expect(check(review, "inci_verified").state === "verified").toBe(complete);
    }
  });
});

describe("pregnancy ingredient check", () => {
  it("is renamed so it no longer reads as a safety assessment", () => {
    expect(check(backed, "pregnancy_safe").label).toBe("Pregnancy ingredient check");
  });

  it.each([["a source-backed list", backed], ...Object.entries(NOT_BACKED)])("never says clear, for %s", (_name, review) => {
    const c = check(review, "pregnancy_safe");
    expect(["verified", "disclosed"]).not.toContain(c.state);
    expect(c.detail).not.toMatch(/pregnancy-cautioned active/);
  });

  it("says the list was not screened when it is not source-backed, and that it covers retinoids only when it is", () => {
    expect(check(noQuote, "pregnancy_safe").detail).toMatch(/^Not screened: a complete, source-backed ingredient list is needed/);
    expect(check(backed, "pregnancy_safe").detail).toMatch(/covers retinoids only and is not a pregnancy-safety assessment/);
  });

  it("still flags a retinoid, whatever the source", () => {
    const withRetinol = (r: ProductReview) => ({ ...r, inciIngredients: [...LIST, "Retinol"] }) as ProductReview;
    for (const review of [backed, ...Object.values(NOT_BACKED)]) {
      expect(check(withRetinol(review), "pregnancy_safe")).toMatchObject({ state: "adverse" });
    }
  });

  it("agrees with the new pregnancy screen: never clear on a list the screen did not read", () => {
    for (const review of [backed, ...Object.values(NOT_BACKED)]) {
      const screen = reviewToScorecard(review, deriveVerdict(review)).product.pregnancyScreen;
      if (screen?.status !== "screened") expect(check(review, "pregnancy_safe").state).not.toBe("verified");
    }
  });
});

describe("nothing else on the checklist depends on source-backing", () => {
  it("the same list, with and without a quote, differs only in the INCI verification line", () => {
    const a = states(backed), b = states(noQuote);
    const differing = Object.keys(a).filter((id) => a[id] !== b[id]).sort();
    expect(differing).toEqual(["inci_verified"]);
    expect(runAnalysis(backed).redFlags).toEqual(runAnalysis(noQuote).redFlags);
  });
});
