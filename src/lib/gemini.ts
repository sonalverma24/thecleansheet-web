/* ────────────────────────────────────────────────────────────────
   Resilient Gemini caller.
   Google's free-tier search-grounded requests intermittently return
   503 "high demand". Strategy: retry with backoff, then fall back to
   an ungrounded call (the model still reasons over scraped content),
   and only then surface a transient "busy" error — never a false
   "out of scope".
──────────────────────────────────────────────────────────────── */

import { GoogleGenerativeAI } from "@google/generative-ai";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class TransientModelError extends Error {}

const TRANSIENT = /503|429|UNAVAILABLE|overloaded|high demand|quota|RESOURCE_EXHAUSTED|fetch failed|timed? ?out|ECONNRESET/i;

export async function generateResilient(systemInstruction: string, prompt: string): Promise<string> {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) throw new TransientModelError("GOOGLE_AI_API_KEY not set");
  const genAI = new GoogleGenerativeAI(key);

  const mk = (search: boolean) =>
    genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(search ? { tools: [{ googleSearch: {} } as any] } : {}),
      systemInstruction,
      generationConfig: { temperature: 0 },
    });

  // Grounded twice, then ungrounded twice
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
      return result.response.text().trim();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (!TRANSIENT.test(msg)) throw err; // real error — don't mask it
    }
  }
  throw new TransientModelError(lastErr instanceof Error ? lastErr.message : "Model unavailable");
}

export const busyResponse = () =>
  Response.json(
    { error: "busy", message: "The engine is at capacity right now. Please try again in a minute." },
    { status: 503 },
  );
