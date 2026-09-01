/* ────────────────────────────────────────────────────────────────
   /api/review — THE single endpoint for the review tool.
   Runs the original Product Review engine (TCS v3.0): rich claim map,
   price parity, formula logic, consumer suitability + a code-derived
   approved / not-approved verdict. Logic in src/lib/product-review-engine.ts.
──────────────────────────────────────────────────────────────── */

import { runProductReview } from "@/lib/product-review-engine";
import { TransientModelError, busyResponse } from "@/lib/gemini";
import { rateLimit, rateLimited } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 180;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Analysing a product is a signed-in action. Viewing stored reviews stays
    // public (that route reads the DB directly, not this endpoint), so SEO is
    // unaffected — only running a NEW analysis requires an account.
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "auth_required" }, { status: 401 });
    }

    if (!rateLimit(req, "review", 6)) return rateLimited();

    const { query } = await req.json();
    if (!query?.trim()) {
      return Response.json({ error: "No query provided" }, { status: 400 });
    }

    const result = await runProductReview(String(query));

    // Log the search for backend attribution (which user searched which
    // product). Best-effort and non-blocking: a logging failure must never
    // break the analysis the user asked for. Admin client bypasses RLS.
    try {
      const productSlug =
        result.type === "product-review" ? result.review.productSlug : null;
      await createAdminClient().from("product_searches").insert({
        user_id: user.id,
        query: String(query),
        product_slug: productSlug,
      });
    } catch (logErr) {
      console.error("[review] search-log insert failed", logErr);
    }

    return Response.json(result);
  } catch (err: unknown) {
    console.error("[review]", err instanceof Error ? err.message : err);
    if (err instanceof TransientModelError) return busyResponse();
    // A real engine/scrape/parse failure is NOT "out of scope" — surface it as an
    // honest error so the UI can invite a retry / URL paste, not claim the product
    // isn't a beauty product. (Genuine out-of-scope is a normal engine return above.)
    return Response.json({ type: "error" }, { status: 500 });
  }
}
