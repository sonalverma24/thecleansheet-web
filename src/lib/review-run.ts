/* Shared pieces of the "search a product, get its review" flow that used to live
   on the /review page. The search boxes (home hero, /brands, the no-results card)
   run the review in place and then open the product's permanent /analysis/[slug]
   page; there is no middle page. */

/** Query flag that auto-runs a review on arrival, e.g. after the sign-in round trip. */
export const REVIEW_RUN_PARAM = "analyse";
/** The name this parameter had before the rename; links already in the wild still work. */
export const LEGACY_REVIEW_RUN_PARAM = "review";

export const REVIEW_GATE_TITLE = "Sign in to analyse a product";
export const REVIEW_GATE_SUBTITLE = "Create a free account to run a Clean Sheet analysis on any product.";

export const REVIEW_STEPS = [
  "Pulling the real ingredient list",
  "Mapping price across Nykaa, Amazon, Flipkart",
  "Extracting every marketing claim",
  "Grading each claim on the 1–7 evidence ladder",
  "Checking ASCI + India drug-boundary rules",
  "Reading the formula logic",
  "Writing your verdict",
];

export type ReviewRunError = "scope" | "busy" | "fail";

export type ReviewRunOutcome =
  | { kind: "done"; slug: string }
  | { kind: "disambig"; query: string; options: { name: string }[] }
  | { kind: "auth" }
  | { kind: "error"; error: ReviewRunError };

/** Turn the /api/review response into the one thing the UI should do next. */
export function interpretReviewResponse(status: number, data: unknown, query: string): ReviewRunOutcome {
  if (status === 401) return { kind: "auth" };
  const d = (data ?? {}) as {
    error?: string;
    type?: string;
    query?: string;
    options?: { name: string }[];
    review?: { productSlug?: string };
  };
  if (status === 503 || d.error === "busy") return { kind: "error", error: "busy" };
  if (d.type === "product-review" && d.review?.productSlug) return { kind: "done", slug: d.review.productSlug };
  if (d.type === "disambiguation" && Array.isArray(d.options) && d.options.length) {
    return { kind: "disambig", query: d.query ?? query, options: d.options };
  }
  if (d.type === "out_of_scope") return { kind: "error", error: "scope" };
  return { kind: "error", error: "fail" };
}

export const REVIEW_ERROR_MESSAGE: Record<ReviewRunError, string> = {
  busy: "The engine is at capacity. Please try again in a minute.",
  scope: "That doesn't look like a beauty or personal-care product.",
  fail: "Couldn't complete the analysis. Please try again, or paste the product page link for a more reliable read.",
};
