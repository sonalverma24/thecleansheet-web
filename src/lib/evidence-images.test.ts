import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* The label-artwork pass of the image reader. The vision model is replaced by a stand-in that answers each prompt as the real one is told to, so this proves the wiring
   and the parsing; it cannot prove what the real model sees in a real photograph. */
const model = vi.hoisted(() => ({ prompts: [] as string[], label: "", report: "" }));
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: async (parts: { text?: string }[]) => {
          const prompt = parts[0].text ?? "";
          model.prompts.push(prompt);
          return { response: { text: () => (prompt.includes("DRUG_LABEL") ? model.label : model.report) } };
        },
      };
    }
  },
}));

import { imageEvidenceBlock, parseLabelNotices } from "./evidence-images";

describe("parseLabelNotices", () => {
  it("keeps the printed words of each image marked DRUG_LABEL, and nothing else", () => {
    const out = parseLabelNotices("IMAGE 1: NONE\\n---\\nIMAGE 2: DRUG_LABEL\\nText: Drug Facts\\nActive ingredient: Zinc oxide 8%\\n---\\nIMAGE 3: NONE".replace(/\\n/g, "\n"));
    expect(out).toEqual(["Drug Facts\nActive ingredient: Zinc oxide 8%"]);
  });

  it("reads several images, and ignores a block with no printed text or any other wording", () => {
    expect(parseLabelNotices("IMAGE 1: DRUG_LABEL\nText: Rx only\n---\nIMAGE 2: DRUG_LABEL\n---\nIMAGE 3: This looks like a prescription drug to me")).toEqual(["Rx only"]);
    expect(parseLabelNotices("")).toEqual([]);
  });
});

describe("imageEvidenceBlock, reading label artwork", () => {
  const PAGE = "https://shop.example.com/p/daily-shield";
  const html = `<html><body><img src="https://cdn.example.com/files/pack-front.jpg" alt="pack"><img src="https://cdn.example.com/files/pack-back.jpg" alt="back"></body></html>`;
  const png = () => new Response(new Uint8Array(9000), { status: 200, headers: { "content-type": "image/jpeg" } });

  beforeEach(() => {
    vi.stubEnv("GOOGLE_AI_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn(async (url: string) => (url === PAGE ? new Response(html, { status: 200 }) : png())));
    model.prompts = [];
    model.label = "IMAGE 1: NONE\n---\nIMAGE 2: DRUG_LABEL\nText: DRUG FACTS Active ingredient Zinc oxide 8%";
    model.report = "IMAGE 1: NOT_A_REPORT\n---\nIMAGE 2: NOT_A_REPORT";
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it("hands back what the artwork says through out.labelText, and still returns the report block as before", async () => {
    const out: { labelText?: string } = {};
    const block = await imageEvidenceBlock(PAGE, out);
    expect(out.labelText).toBe("DRUG FACTS Active ingredient Zinc oxide 8%");
    expect(block).toBe(""); // no test report on this page: the existing behaviour, unchanged
    expect(model.prompts.filter((p) => p.includes("DRUG_LABEL"))).toHaveLength(1);
    expect(model.prompts.filter((p) => p.includes("TEST REPORT"))).toHaveLength(1);
  });

  it("an empty answer is recorded as read-and-empty, and is not read again on a retry", async () => {
    model.label = "IMAGE 1: NONE\n---\nIMAGE 2: NONE";
    const out: { labelText?: string } = {};
    await imageEvidenceBlock(PAGE, out);
    expect(out.labelText).toBe("");
    const before = model.prompts.length;
    await imageEvidenceBlock(PAGE, out);
    expect(model.prompts.slice(before).filter((p) => p.includes("DRUG_LABEL"))).toHaveLength(0);
  });

  it("without an out argument it behaves exactly as before: no label pass", async () => {
    await imageEvidenceBlock(PAGE);
    expect(model.prompts.filter((p) => p.includes("DRUG_LABEL"))).toHaveLength(0);
  });

  it("with no API key it reads nothing and leaves labelText unset", async () => {
    vi.stubEnv("GOOGLE_AI_API_KEY", "");
    const out: { labelText?: string } = {};
    expect(await imageEvidenceBlock(PAGE, out)).toBe("");
    expect(out.labelText).toBeUndefined();
  });
});
