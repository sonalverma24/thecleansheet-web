import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* A scripted stand-in for the Gemini SDK. Each generateContent call takes the next step
   from the script and records whether its model was built with Google Search. */
const sdk = vi.hoisted(() => {
  type Step = { text?: string; throws?: string; grounding?: unknown };
  const state = { script: [] as Step[], calls: [] as { search: boolean; system: string; temperature: unknown }[] };
  class GoogleGenerativeAI {
    constructor(public key: string) {}
    getGenerativeModel(cfg: { tools?: unknown[]; systemInstruction: string; generationConfig: { temperature: number } }) {
      const search = Array.isArray(cfg.tools) && cfg.tools.length > 0;
      return {
        async generateContent(prompt: string) {
          state.calls.push({ search, system: cfg.systemInstruction, temperature: cfg.generationConfig.temperature });
          void prompt;
          const step = state.script.shift() ?? { throws: "script exhausted 503" };
          if (step.throws) throw new Error(step.throws);
          return { response: { text: () => step.text ?? "", candidates: [{ groundingMetadata: step.grounding }] } };
        },
      };
    }
  }
  return { GoogleGenerativeAI, state };
});
vi.mock("@google/generative-ai", () => ({ GoogleGenerativeAI: sdk.GoogleGenerativeAI }));

import { generateResilient, generateResilientWithMeta, groundingRecordFrom, researchLogFrom, TransientModelError } from "@/lib/gemini";

/* LEGACY is generateResilient exactly as it stood before the metadata variant existed. */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const TRANSIENT = /503|429|UNAVAILABLE|overloaded|high demand|quota|RESOURCE_EXHAUSTED|fetch failed|timed? ?out|ECONNRESET/i;
async function legacyGenerateResilient(systemInstruction: string, prompt: string): Promise<string> {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) throw new TransientModelError("GOOGLE_AI_API_KEY not set");
  const genAI = new sdk.GoogleGenerativeAI(key);
  const mk = (search: boolean) =>
    genAI.getGenerativeModel({
      ...(search ? { tools: [{ googleSearch: {} }] } : {}),
      systemInstruction,
      generationConfig: { temperature: 0 },
    });
  const plan = [
    { search: true, delay: 0 },
    { search: true, delay: 1500 },
    { search: false, delay: 800 },
    { search: false, delay: 2500 },
  ];
  let lastErr: unknown;
  for (const step of plan) {
    if (step.delay) await sleep(step.delay);
    try {
      const result = await mk(step.search).generateContent(prompt);
      const text = result.response.text().trim();
      if (text) return text;
      lastErr = new Error("empty model response");
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (!TRANSIENT.test(msg)) throw err;
    }
  }
  throw new TransientModelError(lastErr instanceof Error ? lastErr.message : "Model unavailable");
}

const GROUNDING = {
  webSearchQueries: ["acme serum ingredients", "acme serum price nykaa", "acme serum ingredients"],
  groundingChunks: [
    { web: { uri: "https://vertexaisearch.example/redirect/1", title: "acme.in" } },
    { web: { uri: "https://vertexaisearch.example/redirect/2", title: "nykaa.com" } },
    { web: { uri: "https://vertexaisearch.example/redirect/1", title: "acme.in" } },
    { web: {} },
    {},
  ],
  searchEntryPoint: { renderedContent: "<div>big</div>" },
};

type Settled = { ok: string } | { err: string };
async function settle(fn: () => Promise<string>): Promise<Settled> {
  const p = fn().then((v): Settled => ({ ok: v }), (e): Settled => ({ err: `${e?.constructor?.name}: ${e?.message}` }));
  await vi.advanceTimersByTimeAsync(20_000);
  return p;
}

beforeEach(() => {
  vi.useFakeTimers();
  process.env.GOOGLE_AI_API_KEY = "test-key";
  sdk.state.script = [];
  sdk.state.calls = [];
});
afterEach(() => {
  vi.useRealTimers();
});

describe("groundingRecordFrom", () => {
  it("keeps queries and cited sources, in order, without repeats or blanks", () => {
    expect(groundingRecordFrom(GROUNDING)).toEqual({
      webSearchQueries: ["acme serum ingredients", "acme serum price nykaa"],
      sourceUris: ["https://vertexaisearch.example/redirect/1", "https://vertexaisearch.example/redirect/2"],
      sourceTitles: ["acme.in", "nykaa.com"],
    });
  });

  it("is null when the response reports nothing", () => {
    expect(groundingRecordFrom(undefined)).toBeNull();
    expect(groundingRecordFrom(null)).toBeNull();
    expect(groundingRecordFrom({})).toBeNull();
    expect(groundingRecordFrom({ webSearchQueries: [], groundingChunks: [] })).toBeNull();
  });

  it("keeps queries even when no source was cited", () => {
    expect(groundingRecordFrom({ webSearchQueries: ["q"] })).toEqual({ webSearchQueries: ["q"], sourceUris: [], sourceTitles: [] });
  });
});

describe("researchLogFrom", () => {
  it("says a call was not grounded rather than leaving an empty list to be misread", () => {
    expect(researchLogFrom(null, "t")).toEqual({ grounded: false, webSearchQueries: [], sourceUris: [], sourceTitles: [], recordedAt: "t" });
    expect(researchLogFrom({ webSearchQueries: ["q"], sourceUris: ["u"], sourceTitles: ["d"] }, "t")).toEqual({
      grounded: true, webSearchQueries: ["q"], sourceUris: ["u"], sourceTitles: ["d"], recordedAt: "t",
    });
  });
});

describe("generateResilientWithMeta", () => {
  it("returns the text and the queries and source URIs of a grounded call", async () => {
    sdk.state.script = [{ text: "  the answer \n", grounding: GROUNDING }];
    const r = await generateResilientWithMeta("system", "prompt");
    expect(r.text).toBe("the answer");
    expect(r.groundingMetadata).toEqual({
      webSearchQueries: ["acme serum ingredients", "acme serum price nykaa"],
      sourceUris: ["https://vertexaisearch.example/redirect/1", "https://vertexaisearch.example/redirect/2"],
      sourceTitles: ["acme.in", "nykaa.com"],
    });
    expect(sdk.state.calls).toEqual([{ search: true, system: "system", temperature: 0 }]);
  });

  it("has no grounding metadata when the answer came from an ungrounded fallback, even if the SDK sent some", async () => {
    sdk.state.script = [{ throws: "503 high demand" }, { throws: "503 high demand" }, { text: "fallback", grounding: GROUNDING }];
    const p = generateResilientWithMeta("system", "prompt");
    await vi.advanceTimersByTimeAsync(20_000);
    const r = await p;
    expect(r).toEqual({ text: "fallback", groundingMetadata: null });
    expect(sdk.state.calls.map((c) => c.search)).toEqual([true, true, false]);
  });

  it("has null metadata for a grounded call that reported none", async () => {
    sdk.state.script = [{ text: "ok" }];
    expect(await generateResilientWithMeta("s", "p")).toEqual({ text: "ok", groundingMetadata: null });
  });

  it("does not mask a real error and stops retrying on it", async () => {
    sdk.state.script = [{ throws: "API key not valid" }, { text: "never reached" }];
    await expect(generateResilientWithMeta("s", "p")).rejects.toThrow("API key not valid");
    expect(sdk.state.calls).toHaveLength(1);
  });

  it("needs the API key", async () => {
    delete process.env.GOOGLE_AI_API_KEY;
    await expect(generateResilientWithMeta("s", "p")).rejects.toBeInstanceOf(TransientModelError);
  });
});

describe("generateResilient is the same function as before, by wrapper", () => {
  const scenarios: [string, { text?: string; throws?: string; grounding?: unknown }[]][] = [
    ["grounded first time", [{ text: "a", grounding: GROUNDING }]],
    ["empty then ok", [{ text: "  " }, { text: "b" }]],
    ["two transient failures then ungrounded", [{ throws: "503" }, { throws: "429 quota" }, { text: "c" }]],
    ["ungrounded on the fourth try", [{ throws: "503" }, { throws: "timed out" }, { throws: "UNAVAILABLE" }, { text: "d" }]],
    ["everything fails transiently", [{ throws: "503" }, { throws: "503" }, { throws: "503" }, { throws: "ECONNRESET" }]],
    ["everything is empty", [{ text: "" }, { text: "" }, { text: "" }, { text: "" }]],
    ["real error on the first call", [{ throws: "invalid argument" }]],
    ["real error on the third call", [{ throws: "503" }, { throws: "503" }, { throws: "permission denied" }]],
  ];

  it.each(scenarios)("%s", async (_name, script) => {
    sdk.state.script = script.map((s) => ({ ...s }));
    sdk.state.calls = [];
    const before = await settle(() => legacyGenerateResilient("sys", "prompt"));
    const legacyCalls = sdk.state.calls;

    sdk.state.script = script.map((s) => ({ ...s }));
    sdk.state.calls = [];
    const now = await settle(() => generateResilient("sys", "prompt"));

    expect(now).toEqual(before);
    expect(sdk.state.calls).toEqual(legacyCalls);
  });

  it("has the same signature", () => {
    expect(generateResilient.length).toBe(2);
    expect(generateResilientWithMeta.length).toBe(2);
  });
});
