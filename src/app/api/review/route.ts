/* ────────────────────────────────────────────────────────────────
   /api/review — THE single endpoint for the review tool.
   One call in, one complete result out. All classification,
   research, scoring, and verdicts happen server-side in
   src/lib/review-engine.ts. Output contract: STANDARD.md.

   (The previous product-review prompt engine that lived here is
   preserved in git history and superseded by TCS v3.1.)
──────────────────────────────────────────────────────────────── */

import { runFullReview } from "@/lib/review-engine";
import { TransientModelError, busyResponse } from "@/lib/gemini";
import { rateLimit, rateLimited } from "@/lib/rate-limit";

export const maxDuration = 180;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    if (!rateLimit(req, "review", 6)) return rateLimited();

    const { query } = await req.json();
    if (!query?.trim()) {
      return Response.json({ error: "No query provided" }, { status: 400 });
    }

    const result = await runFullReview(String(query));
    return Response.json(result);
  } catch (err: unknown) {
    console.error("[review]", err instanceof Error ? err.message : err);
    if (err instanceof TransientModelError) return busyResponse();
    return Response.json({ kind: "out_of_scope" });
  }
}
