/* ────────────────────────────────────────────────────────────────
   /api/claim-check — legacy wrapper. All logic lives in
   src/lib/review-engine.ts. The review tool uses /api/review.
──────────────────────────────────────────────────────────────── */

import { runClaimCheck } from "@/lib/review-engine";
import { TransientModelError, busyResponse } from "@/lib/gemini";
import { rateLimit, rateLimited } from "@/lib/rate-limit";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    if (!rateLimit(req, "claim-check", 8)) return rateLimited();

    const { query } = await req.json();
    if (!query?.trim()) {
      return Response.json({ error: "No query provided" }, { status: 400 });
    }

    const result = await runClaimCheck(String(query));
    if (!result) return Response.json({ type: "out_of_scope" });
    return Response.json(result);
  } catch (err: unknown) {
    console.error("[claim-check]", err instanceof Error ? err.message : err);
    if (err instanceof TransientModelError) return busyResponse();
    return Response.json({ error: "Claim check failed. Please try again." }, { status: 500 });
  }
}
