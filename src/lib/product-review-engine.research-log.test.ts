import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeReview } from "@/lib/review.fixtures";

/* runProductReview with every outside dependency replaced: the model, the database,
   INCIDecoder, the scrapers and the image resolvers. */
const h = vi.hoisted(() => {
  const upserts: Record<string, unknown>[] = [];
  const chain: unknown = new Proxy(function () {}, {
    get: (_t, prop) => {
      if (prop === "then") return (resolve: (v: unknown) => void) => resolve({ data: null, error: null });
      if (prop === "upsert") return (row: Record<string, unknown>) => { upserts.push(row); return chain; };
      return () => chain;
    },
    apply: () => chain,
  });
  return { upserts, chain, generate: vi.fn(), imageEvidence: vi.fn() };
});

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => h.chain }));
vi.mock("@/lib/gemini", async (orig) => ({ ...(await orig<typeof import("@/lib/gemini")>()), generateResilientWithMeta: h.generate }));
vi.mock("@/lib/inci-fetch", async (orig) => ({
  ...(await orig<typeof import("@/lib/inci-fetch")>()),
  resolveINCI: async () => ({ chosen: null, distinct: [], ambiguous: false }),
}));
vi.mock("@/lib/scrape", async (orig) => ({ ...(await orig<typeof import("@/lib/scrape")>()), fetchPageMarkdown: async () => null }));
vi.mock("@/lib/product-image", () => ({
  resolveProductImage: async () => null, searchProductImage: async () => null, findProductImageKeyless: async () => null, isLiveImage: async () => false,
}));
vi.mock("@/lib/evidence-images", () => ({ imageEvidenceBlock: h.imageEvidence }));
vi.mock("@/lib/ingredient-directory", () => ({ addDiscoveredNames: async () => undefined }));
vi.mock("@/lib/verified-store", async (orig) => ({ ...(await orig<typeof import("@/lib/verified-store")>()), upsertVerifiedProduct: async () => undefined }));
vi.mock("next/cache", () => ({ revalidatePath: () => undefined }));

import { runProductReview } from "@/lib/product-review-engine";
import { PRODUCT_REVIEW_SYSTEM_PROMPT } from "@/lib/product-review-context";
import { inciGroundTruthBlock } from "@/lib/inci-fetch";

const asModelText = (name: string) => JSON.stringify(makeReview({ productName: name, brand: "Research Log Test Brand" }));

beforeEach(() => {
  h.upserts.length = 0;
  h.generate.mockReset();
  h.imageEvidence.mockReset().mockResolvedValue("");
  delete process.env.ANALYSER_EVIDENCE_HARNESS_SHADOW;
  delete process.env.ANALYSER_CAPTURE_MAX_AGE_MS;
});

describe("runProductReview: researchLog", () => {
  it("records the queries and sources of the attempt whose output was kept", async () => {
    h.generate
      .mockResolvedValueOnce({ text: "this is not json", groundingMetadata: { webSearchQueries: ["discarded"], sourceUris: ["https://x/discarded"], sourceTitles: ["x"] } })
      .mockResolvedValueOnce({
        text: asModelText("Alpha Cleanser"),
        groundingMetadata: { webSearchQueries: ["alpha cleanser ingredients", "alpha cleanser price"], sourceUris: ["https://v/1", "https://v/2"], sourceTitles: ["alpha.in", "nykaa.com"] },
      });
    const out = await runProductReview("Alpha Cleanser");
    expect(out.type).toBe("product-review");
    if (out.type !== "product-review") return;
    const log = out.review.researchLog!;
    expect(log).toMatchObject({
      grounded: true,
      webSearchQueries: ["alpha cleanser ingredients", "alpha cleanser price"],
      sourceUris: ["https://v/1", "https://v/2"],
      sourceTitles: ["alpha.in", "nykaa.com"],
    });
    expect(Number.isNaN(Date.parse(log.recordedAt))).toBe(false);
    // And it is what gets stored.
    const stored = h.upserts[0].result as { review: { researchLog: unknown } };
    expect(stored.review.researchLog).toEqual(log);
  });

  it("says plainly when the call that produced the review was not grounded", async () => {
    h.generate.mockResolvedValueOnce({ text: asModelText("Beta Serum"), groundingMetadata: null });
    const out = await runProductReview("Beta Serum");
    if (out.type !== "product-review") throw new Error("expected a review");
    expect(out.review.researchLog).toMatchObject({ grounded: false, webSearchQueries: [], sourceUris: [], sourceTitles: [] });
  });

  it("is engine-authored: a researchLog in the model's own JSON is replaced", async () => {
    const forged = { ...JSON.parse(asModelText("Gamma Toner")), researchLog: { grounded: true, webSearchQueries: ["forged"], sourceUris: ["https://forged"], sourceTitles: [], recordedAt: "2001-01-01" } };
    h.generate.mockResolvedValueOnce({ text: JSON.stringify(forged), groundingMetadata: null });
    const out = await runProductReview("Gamma Toner");
    if (out.type !== "product-review") throw new Error("expected a review");
    expect(out.review.researchLog).toMatchObject({ grounded: false, webSearchQueries: [] });
    expect(out.review.researchLog!.recordedAt).not.toBe("2001-01-01");
  });

  it("leaves the prompts exactly as they were", async () => {
    h.generate.mockResolvedValue({ text: "still not json", groundingMetadata: null });
    const out = await runProductReview("Delta Gel");
    expect(out.type).toBe("error");
    const userPrompt =
      `Produce a full Clean Sheet Product Review for this product: Delta Gel` +
      `\nSearch its official page and Nykaa, Amazon.in, Flipkart and quick-commerce listings for price, claims, and the ingredient list.${inciGroundTruthBlock(null)}`;
    expect(h.generate.mock.calls).toEqual([
      [PRODUCT_REVIEW_SYSTEM_PROMPT, userPrompt],
      [PRODUCT_REVIEW_SYSTEM_PROMPT, `${userPrompt}\n\nReturn ONLY the product-review JSON, starting directly with { and ending with }. No prose, no code fence, no trailing commas.`],
      [PRODUCT_REVIEW_SYSTEM_PROMPT, `${userPrompt}\n\nYour previous output was not valid JSON. Return ONLY the complete, valid product-review JSON object.`],
    ]);
  });
});


describe("evidence harness integration", () => {
  it("records an uncertainty audit and replaces model-authored audit fields", async () => {
    process.env.ANALYSER_EVIDENCE_HARNESS_SHADOW = "true";
    const proposal = makeReview({ productName: "Shadow Evidence Cleanser", brand: "Harness Test" });
    h.generate.mockResolvedValue({ text: JSON.stringify({ ...proposal, evidenceAudit: { decision: { endorsement: "approved" } } }), groundingMetadata: null });
    const out = await runProductReview("Shadow Evidence Cleanser");
    expect(out.type).toBe("product-review");
    if (out.type !== "product-review") return;
    expect(out.review.evidenceAudit?.decision.endorsement).toBe("human_review_required");
    expect(out.review.evidenceAudit?.decision.reasons).toContain("INCI_NOT_ANCHORED");
    expect((h.upserts[0].result as typeof out).review.evidenceAudit).toEqual(out.review.evidenceAudit);
  });
  it("passes image transcription into prompts once, including retries", async () => {
    h.imageEvidence.mockResolvedValue("\nIMAGE TRANSCRIPTION: synthetic report text");
    h.generate.mockResolvedValueOnce({ text: "bad json", groundingMetadata: null })
      .mockResolvedValueOnce({ text: asModelText("Image Evidence Cleanser"), groundingMetadata: null });
    await runProductReview("Image Evidence Cleanser");
    expect(h.imageEvidence).toHaveBeenCalledTimes(1);
    for (const call of h.generate.mock.calls) expect(call[1]).toContain("IMAGE TRANSCRIPTION: synthetic report text");
  });
});
