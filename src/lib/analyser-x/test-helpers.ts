/* Shared builders for the vX tests. Everything here is constructed; no real product is described. */
import { makeReview, claim } from "@/lib/review.fixtures";
import { makeInciEvidence } from "@/lib/review-verifier";
import type { ClaimAnalysis, ProductReview } from "@/lib/product-review-types";

export const NOW = "2026-10-23T00:00:00.000Z";
export const REVIEWED = "2026-10-20T00:00:00.000Z";

export const evidence = {
  incidecoder: () => makeInciEvidence("https://incidecoder.com/products/test-product", "Aqua, Glycerin, Niacinamide, Phenoxyethanol", REVIEWED, "Test Face Wash"),
  brandPage: () => makeInciEvidence("https://brand.example/products/test", "Aqua, Glycerin, Niacinamide, Phenoxyethanol", REVIEWED),
  retailer: () => makeInciEvidence("https://www.nykaa.com/test/p/123", "Aqua, Glycerin, Niacinamide, Phenoxyethanol", REVIEWED),
  model: () => makeInciEvidence(undefined, "", REVIEWED),
};

export const claimOf = (over: Partial<ClaimAnalysis>): ClaimAnalysis => ({ ...claim, ...over });

export function rv(over: Partial<ProductReview> = {}, ev: ReturnType<typeof evidence.incidecoder> | null = evidence.incidecoder()): ProductReview {
  return makeReview({ reviewedAt: REVIEWED, productSlug: "test-product", ...(ev ? { inciEvidence: ev } : {}), ...over });
}

export const BASE = ["Aqua", "Glycerin", "Niacinamide", "Phenoxyethanol"];
