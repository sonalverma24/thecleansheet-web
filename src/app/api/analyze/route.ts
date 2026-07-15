/* ────────────────────────────────────────────────────────────────
   /api/analyze — legacy wrapper kept for the admin product flow.
   All logic lives in src/lib/review-engine.ts. The review tool
   itself uses /api/review. Output contract: STANDARD.md.
──────────────────────────────────────────────────────────────── */

import { runDeepScan, compactClaimFindings } from "@/lib/review-engine";
import { TransientModelError, busyResponse } from "@/lib/gemini";
import { rateLimit, rateLimited } from "@/lib/rate-limit";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

const outOfScope = () => Response.json({ type: "out_of_scope" });

export async function POST(req: Request) {
  try {
    if (!rateLimit(req, "analyze", 8)) return rateLimited();

    const { query, claimFindings: rawClaimFindings } = await req.json();
    if (!query?.trim()) {
      return Response.json({ error: "No query provided" }, { status: 400 });
    }

    const result = await runDeepScan(String(query), compactClaimFindings(rawClaimFindings));

    if (result.type === "single") {
      return Response.json({ type: "single", scorecard: result.scorecard, verdict: result.verdict });
    }
    if (result.type === "comparison") {
      return Response.json({ type: "comparison", comparison: result.comparison });
    }
    if (result.type === "answer") {
      return Response.json({ type: "answer", answer: result.answer });
    }
    return outOfScope();
  } catch (err: unknown) {
    console.error("[analyze]", err instanceof Error ? err.message : err);
    if (err instanceof TransientModelError) return busyResponse();
    return outOfScope();
  }
}
