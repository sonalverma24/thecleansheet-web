/* Admin-only management for the engine's stored product reviews (Supabase
   public.product_reviews). Gated to ADMIN_EMAILS, same pattern as the reviews
   export route. Powers /admin/repository:
     - GET               → list recent stored reviews (for the UI)
     - POST set-image     → fix a review's image (image_url + result.review.imageUrl)
     - POST delete        → remove a review row entirely
   The write happens on the server under the service-role client; the admin only
   supplies the slug + URL from the browser. */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { invalidateReviewCache } from "@/lib/product-review-engine";

async function requireAdmin(): Promise<{ ok: true; email: string } | { ok: false; status: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, status: 401 };
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  if (!admins.includes(user.email.toLowerCase())) return { ok: false, status: 403 };
  return { ok: true, email: user.email };
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: auth.status });

  const { data, error } = await createAdminClient()
    .from("product_reviews")
    .select("product_slug, product_name, brand, image_url, reviewed_at")
    .order("reviewed_at", { ascending: false })
    .limit(400);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: auth.status });

  const body = (await req.json()) as { action?: string; slug?: string; imageUrl?: string };
  const action = body.action;
  const slug = body.slug?.trim();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const db = createAdminClient();

  if (action === "set-image") {
    const imageUrl = String(body.imageUrl ?? "").trim();
    if (!/^https?:\/\//i.test(imageUrl)) {
      return NextResponse.json({ error: "a valid http(s) image URL is required" }, { status: 400 });
    }
    const { data, error } = await db
      .from("product_reviews").select("result").eq("product_slug", slug).maybeSingle();
    if (error || !data) return NextResponse.json({ error: error?.message ?? "review not found" }, { status: 404 });

    const result = data.result as { review?: { imageUrl?: string | null } } | null;
    if (result?.review) result.review.imageUrl = imageUrl;
    const { error: upErr } = await db
      .from("product_reviews").update({ image_url: imageUrl, result }).eq("product_slug", slug);
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    invalidateReviewCache(slug);
    return NextResponse.json({ ok: true, action, slug, imageUrl });
  }

  if (action === "delete") {
    const { error: delErr } = await db.from("product_reviews").delete().eq("product_slug", slug);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });
    invalidateReviewCache(slug);
    return NextResponse.json({ ok: true, action, slug });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
