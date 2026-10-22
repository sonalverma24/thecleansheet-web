import { describe, expect, it } from "vitest";
import { interpretReviewResponse } from "./review-run";

describe("interpretReviewResponse", () => {
  it("opens the review's own page when the review comes back", () => {
    const out = interpretReviewResponse(200, { type: "product-review", review: { productSlug: "cosrx-bha-blackhead-power-liquid-4" } }, "cosrx bha");
    expect(out).toEqual({ kind: "done", slug: "cosrx-bha-blackhead-power-liquid-4" });
  });

  it("asks the person to sign in when the session is missing or expired", () => {
    expect(interpretReviewResponse(401, { error: "auth_required" }, "x")).toEqual({ kind: "auth" });
  });

  it("offers the options when the product name is ambiguous", () => {
    const out = interpretReviewResponse(200, { type: "disambiguation", query: "cerave", options: [{ name: "CeraVe Moisturising Cream" }, { name: "CeraVe SA Cleanser" }] }, "cerave");
    expect(out).toEqual({ kind: "disambig", query: "cerave", options: [{ name: "CeraVe Moisturising Cream" }, { name: "CeraVe SA Cleanser" }] });
  });

  it("falls back to the typed query when the ambiguity response omits it", () => {
    const out = interpretReviewResponse(200, { type: "disambiguation", options: [{ name: "A" }] }, "typed");
    expect(out).toMatchObject({ kind: "disambig", query: "typed" });
  });

  it("maps busy, out-of-scope and failures to their own messages", () => {
    expect(interpretReviewResponse(503, {}, "x")).toEqual({ kind: "error", error: "busy" });
    expect(interpretReviewResponse(200, { error: "busy" }, "x")).toEqual({ kind: "error", error: "busy" });
    expect(interpretReviewResponse(200, { type: "out_of_scope" }, "x")).toEqual({ kind: "error", error: "scope" });
    expect(interpretReviewResponse(500, { type: "error" }, "x")).toEqual({ kind: "error", error: "fail" });
  });

  it("treats a review with no slug as a failure rather than navigating nowhere", () => {
    expect(interpretReviewResponse(200, { type: "product-review", review: {} }, "x")).toEqual({ kind: "error", error: "fail" });
    expect(interpretReviewResponse(200, null, "x")).toEqual({ kind: "error", error: "fail" });
  });
});
