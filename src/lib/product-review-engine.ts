/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ — Product Review engine ("v3.0")
   Runs the original PRODUCT_REVIEW_SYSTEM_PROMPT (grounded web search),
   pulls a product image, and DERIVES an approved / not-approved verdict
   in code from the review's own signals (drug-boundary / red-flag claims,
   claim evidence, formula overreach). The LLM researches; code decides.
──────────────────────────────────────────────────────────────── */

import { PRODUCT_REVIEW_SYSTEM_PROMPT } from "@/lib/product-review-context";
import { generateResilient } from "@/lib/gemini";
import { resolveProductImage, searchProductImage } from "@/lib/product-image";
import { fetchINCI, inciGroundTruthBlock } from "@/lib/inci-fetch";
import type { ProductReview, DerivedVerdict, ReviewGate } from "@/lib/product-review-types";

export const REVIEW_METHODOLOGY_VERSION = "TCS v3.0";

const isURL = (t: string) => /^https?:\/\//i.test(t.trim());

/** Tolerant JSON extraction — handles a stray prose preamble or code fence. */
function parseJSON(text: string): Record<string, unknown> | null {
  if (!text) return null;
  let s = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  s = s.slice(start, end + 1);
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function isValidProductReview(p: Record<string, unknown> | null): p is unknown & ProductReview {
  if (!p) return false;
  if (p.type !== "product-review") return false;
  if (typeof p.productName !== "string" || !p.productName) return false;
  if (!Array.isArray(p.claimMap)) return false;
  const scores = p.scores as Record<string, unknown> | undefined;
  if (!scores || typeof scores.total !== "number") return false;
  return true;
}

/* ═══════════════ Derived approved / not-approved verdict ═══════════════
   Deterministic. Based on the review's calibrated 0–100 scoring and claim
   flags — NOT a per-claim deduction pile-up, so an honest product that makes
   many claims is not auto-failed. */
export function deriveVerdict(r: ProductReview): DerivedVerdict {
  const drugBoundary = r.claimSummary?.drugBoundaryCount ?? 0;
  const redFlags = r.claimSummary?.byRisk?.redFlag ?? 0;
  const evidencePts = r.scores?.claimEvidence ?? 0;      // out of 20
  const formulaPts = r.scores?.formulaLogic ?? 0;        // out of 15
  const total = r.scores?.total ?? 0;                    // out of 100
  const overreach = r.formulaLogic?.claimOverreach === true;

  const lawful = drugBoundary === 0 && redFlags === 0;
  const honest = evidencePts >= 10;                      // ≥ half the evidence points
  const soundFormula = formulaPts >= 8 && !overreach;    // ≥ ~half + no overreach

  const gates: ReviewGate[] = [
    {
      id: "claims",
      label: "Lawful claims",
      passed: lawful,
      detail: lawful
        ? "No drug-boundary or absolute/red-flag claims found"
        : `${drugBoundary} drug-boundary and ${redFlags} red-flag claim(s) found`,
    },
    {
      id: "evidence",
      label: "Honest evidence",
      passed: honest,
      detail: honest
        ? "Claims are substantially backed by visible evidence"
        : "Most claims rely on borrowed ingredient-level evidence, not finished-product proof",
    },
    {
      id: "formula",
      label: "Formula supports claims",
      passed: soundFormula,
      detail: soundFormula
        ? "The formula and format plausibly deliver the claims"
        : overreach
          ? "Claims go beyond what this formula/format can plausibly deliver"
          : "Formula logic is weak relative to the claims made",
    },
  ];

  // Approved requires a credible overall score AND all three gates.
  const status: DerivedVerdict["status"] =
    total >= 70 && lawful && honest && soundFormula ? "approved" : "not_approved";

  const headline =
    status === "approved"
      ? "Clean Sheet Approved — claims hold up to the evidence"
      : lawful
        ? "Not Approved — claims outrun the visible proof"
        : "Not Approved — contains claims that aren't permitted or aren't substantiated";

  return { status, headline, gates, standard: `${REVIEW_METHODOLOGY_VERSION} · claims · evidence · formula` };
}

/* ═══════════════ Run ═══════════════ */
export type ProductReviewResult =
  | { type: "product-review"; review: ProductReview; verdict: DerivedVerdict }
  | { type: "out_of_scope" }
  | { type: "error" };

export async function runProductReview(query: string): Promise<ProductReviewResult> {
  const q = query.trim();
  if (!q) return { type: "error" };

  // Ground truth: pull the real INCI so the model can't invent ingredients.
  const inci = await fetchINCI(q);
  const inciBlock = inciGroundTruthBlock(inci);

  const userPrompt = isURL(q)
    ? `Produce a full Clean Sheet Product Review for the product at this URL: ${q}\nIdentify the product, then search Nykaa, Amazon.in, Flipkart and the brand site for its price, claims, and ingredient list.${inciBlock}`
    : `Produce a full Clean Sheet Product Review for this product: ${q}\nSearch its official page and Nykaa, Amazon.in, Flipkart and quick-commerce listings for price, claims, and the ingredient list.${inciBlock}`;

  let parsed = parseJSON(await generateResilient(PRODUCT_REVIEW_SYSTEM_PROMPT, userPrompt));
  if (parsed?.type === "out_of_scope") return { type: "out_of_scope" };
  if (!isValidProductReview(parsed)) {
    parsed = parseJSON(
      await generateResilient(
        PRODUCT_REVIEW_SYSTEM_PROMPT,
        `${userPrompt}\n\nReturn ONLY the product-review JSON. Start directly with {`,
      ),
    );
  }
  if (parsed?.type === "out_of_scope") return { type: "out_of_scope" };
  if (!isValidProductReview(parsed)) return { type: "error" };

  const review = parsed as ProductReview;

  // Keep the image pulling.
  let imageUrl: string | null = null;
  if (isURL(q)) imageUrl = await resolveProductImage(q);
  if (!imageUrl) {
    const imgQuery = [review.brand, review.productName].filter(Boolean).join(" ");
    imageUrl = await searchProductImage(imgQuery || q);
  }
  review.imageUrl = imageUrl;
  review.methodologyVersion = REVIEW_METHODOLOGY_VERSION;
  review.reviewedAt = new Date().toISOString();

  return { type: "product-review", review, verdict: deriveVerdict(review) };
}
