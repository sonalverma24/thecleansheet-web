/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Product Review engine ("v3.0")
   Runs the original PRODUCT_REVIEW_SYSTEM_PROMPT (grounded web search),
   pulls a product image, and DERIVES an approved / not-approved verdict
   in code from the review's own signals (drug-boundary / red-flag claims,
   claim evidence, formula overreach). The LLM researches; code decides.
──────────────────────────────────────────────────────────────── */

import { PRODUCT_REVIEW_SYSTEM_PROMPT } from "@/lib/product-review-context";
import { generateResilient } from "@/lib/gemini";
import { resolveProductImage, searchProductImage } from "@/lib/product-image";
import { resolveINCI, inciGroundTruthBlock } from "@/lib/inci-fetch";
import type { INCIResult } from "@/lib/inci-fetch";
import { upsertVerifiedProduct, slugify } from "@/lib/verified-store";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProductReview, DerivedVerdict, ReviewGate } from "@/lib/product-review-types";

export const REVIEW_METHODOLOGY_VERSION = "TCS v3.0";

const isURL = (t: string) => /^https?:\/\//i.test(t.trim());

/** Tolerant JSON extraction · handles a stray prose preamble or code fence. */
function parseJSON(text: string): Record<string, unknown> | null {
  if (!text) return null;
  let s = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  s = s.slice(start, end + 1).replace(/,(\s*[}\]])/g, "$1"); // tolerate trailing commas (common LLM slip)
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function isValidProductReview(p: unknown): p is ProductReview {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  if (o.type !== "product-review") return false;
  if (typeof o.productName !== "string" || !o.productName) return false;
  if (!Array.isArray(o.claimMap)) return false;
  const scores = o.scores as Record<string, unknown> | undefined;
  if (!scores || typeof scores.total !== "number") return false;
  return true;
}

/* ═══════════════ Derived approved / not-approved verdict ═══════════════
   Deterministic. Based on the review's calibrated 0–100 scoring and claim
   flags, NOT a per-claim deduction pile-up, so an honest product that makes
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
      ? "Clean Sheet Approved. Claims hold up to the evidence."
      : lawful
        ? "Not Approved. Claims outrun the visible proof."
        : "Not Approved. Contains claims that aren't permitted or aren't substantiated.";

  return { status, headline, gates, standard: `${REVIEW_METHODOLOGY_VERSION} · claims · evidence · formula` };
}

/* ═══════════════ Run ═══════════════ */
export type ProductReviewResult =
  | { type: "product-review"; review: ProductReview; verdict: DerivedVerdict }
  | { type: "disambiguation"; query: string; options: { name: string }[] }
  | { type: "out_of_scope" }
  | { type: "error" };

/* Result cache. L1 = in-memory (fast within an instance); L2 = Supabase table
   public.product_reviews (durable across cold starts) so a product's verdict
   and score are stable every time it is looked up. Both are defensive. */
const REVIEW_CACHE = new Map<string, ProductReviewResult>();
const cacheKey = (q: string) => q.trim().toLowerCase().replace(/\s+/g, " ");

async function getCached(key: string): Promise<ProductReviewResult | null> {
  const mem = REVIEW_CACHE.get(key);
  if (mem) return mem;
  try {
    const { data } = await createAdminClient()
      .from("product_reviews").select("result").eq("query_key", key).maybeSingle();
    if (data?.result) {
      const r = data.result as ProductReviewResult;
      REVIEW_CACHE.set(key, r);
      return r;
    }
  } catch { /* cache unavailable */ }
  return null;
}

async function setCached(key: string, result: ProductReviewResult): Promise<void> {
  REVIEW_CACHE.set(key, result);
  try {
    await createAdminClient()
      .from("product_reviews")
      .upsert({ query_key: key, result, created_at: new Date().toISOString() }, { onConflict: "query_key" });
  } catch { /* cache unavailable */ }
}

export async function runProductReview(query: string): Promise<ProductReviewResult> {
  const q = query.trim();
  if (!q) return { type: "error" };

  const key = cacheKey(q);
  const cached = await getCached(key);
  if (cached) return cached;

  // Resolve the product to a single INCIDecoder entry (name + ingredients from the SAME
  // product). For a vague name that matches several distinct products, ask the user
  // instead of guessing. URLs already name an exact product, so skip resolution there.
  let inci: INCIResult | null = null;
  if (!isURL(q)) {
    const resolution = await resolveINCI(q);
    if (resolution.ambiguous) {
      return { type: "disambiguation", query: q, options: resolution.distinct.map((d) => ({ name: d.name })) };
    }
    inci = resolution.chosen;
  }
  const inciBlock = inciGroundTruthBlock(inci);
  // Anchor the review identity to the resolved product so its name never drifts from
  // the ingredient list we actually used.
  const anchor = inci
    ? `\nThe product under review is exactly: "${inci.productName}". Use this exact identity as productName/brand in your output. Do NOT substitute a different size or variant, and do NOT review a different product than this one.`
    : "";

  const userPrompt = isURL(q)
    ? `Produce a full Clean Sheet Product Review for the product at this URL: ${q}\nIdentify the product, then search Nykaa, Amazon.in, Flipkart and the brand site for its price, claims, and ingredient list.${inciBlock}`
    : `Produce a full Clean Sheet Product Review for this product: ${q}${anchor}\nSearch its official page and Nykaa, Amazon.in, Flipkart and quick-commerce listings for price, claims, and the ingredient list.${inciBlock}`;

  // Up to 3 attempts: the model occasionally returns malformed or truncated JSON.
  const prompts = [
    userPrompt,
    `${userPrompt}\n\nReturn ONLY the product-review JSON, starting directly with { and ending with }. No prose, no code fence, no trailing commas.`,
    `${userPrompt}\n\nYour previous output was not valid JSON. Return ONLY the complete, valid product-review JSON object.`,
  ];
  let parsed: Record<string, unknown> | null = null;
  for (const p of prompts) {
    parsed = parseJSON(await generateResilient(PRODUCT_REVIEW_SYSTEM_PROMPT, p));
    if (parsed?.type === "out_of_scope") return { type: "out_of_scope" };
    if (isValidProductReview(parsed)) break;
  }
  if (!isValidProductReview(parsed)) return { type: "error" };

  const review = parsed as ProductReview;

  // Image pulling: INCIDecoder product photo first (reliable, no API key),
  // then page scrape (URLs), then Google CSE if configured.
  let imageUrl: string | null = inci?.imageUrl ?? null;
  if (!imageUrl && isURL(q)) imageUrl = await resolveProductImage(q);
  if (!imageUrl) {
    const imgQuery = [review.brand, review.productName].filter(Boolean).join(" ");
    imageUrl = await searchProductImage(imgQuery || q);
  }
  review.imageUrl = imageUrl;
  review.methodologyVersion = REVIEW_METHODOLOGY_VERSION;
  review.reviewedAt = new Date().toISOString();

  const verdict = deriveVerdict(review);

  // Approved products join the registry (shown as tiles on /review and /verified).
  if (verdict.status === "approved") {
    await upsertVerifiedProduct({
      slug: slugify(review.productName, review.brand),
      productName: review.productName,
      brand: review.brand,
      score: review.scores.total,
      scoreLabel: review.scores.label,
      integrityScore: null,
      imageUrl: review.imageUrl ?? null,
      summary: review.verdict?.cleanSheetTakeaway || review.priceInsight || "",
      usageGuidance: null,
      verifiedAt: review.reviewedAt || new Date().toISOString(),
      methodologyVersion: REVIEW_METHODOLOGY_VERSION,
    });
  }

  const result: ProductReviewResult = { type: "product-review", review, verdict };
  await setCached(key, result);
  return result;
}
