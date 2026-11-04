/* Admin-only: edit what one stored analysis says. Gated to ADMIN_EMAILS. Powers /admin/repository/<slug>.
     GET  ?slug=…                          → the machine's wording and colour, and the admin's edits
     POST { slug, colour?, text? }         → save edits (a line equal to the machine's wording is not stored)
     POST { slug, clear: true }            → remove every edit, so the rules' colour and machine wording show again
   Edits live in product_reviews.result.review.adminEdits; a re-run of the analysis replaces them. */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { deriveVerdict, invalidateReviewCache } from "@/lib/product-review-engine";
import { pillsFor } from "@/lib/pills-for-review";
import { EDITABLE_FIELDS, cleanEdits, fieldValue, type AdminAnalysisEdits, type TextEdits } from "@/lib/admin-analysis-edits";
import type { ProductReview } from "@/lib/product-review-types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type Stored = { type?: string; review?: ProductReview } & Record<string, unknown>;

async function load(slug: string) {
  const { data, error } = await createAdminClient()
    .from("product_reviews").select("result").eq("product_slug", slug).maybeSingle();
  if (error) return { error: error.message, status: 500 as const };
  const stored = data?.result as Stored | null;
  if (!stored || stored.type !== "product-review" || !stored.review) return { error: "analysis not found", status: 404 as const };
  return { stored, review: stored.review };
}

/** The page as the rules and the model wrote it, with no admin edits. */
function machineView(review: ProductReview) {
  const bare = { ...review, adminEdits: undefined };
  const { model } = pillsFor(bare, deriveVerdict(bare));
  const original = Object.fromEntries(EDITABLE_FIELDS.map((f) => [f.id, fieldValue(model, f.id)])) as Record<string, string | string[]>;
  return { colour: model.decision.key, original, hasCheatCode: model.cheatCode !== null };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: auth.status });
  const slug = req.nextUrl.searchParams.get("slug")?.trim();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  const got = await load(slug);
  if ("error" in got) return NextResponse.json({ error: got.error }, { status: got.status });
  const view = machineView(got.review);
  return NextResponse.json({
    slug,
    productName: got.review.productName,
    brand: got.review.brand,
    reviewedAt: got.review.reviewedAt ?? null,
    ...view,
    edits: got.review.adminEdits ?? null,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: auth.status });
  const body = (await req.json().catch(() => ({}))) as { slug?: unknown; clear?: unknown; colour?: unknown; text?: unknown };
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const got = await load(slug);
  if ("error" in got) return NextResponse.json({ error: got.error }, { status: got.status });

  let adminEdits: AdminAnalysisEdits | undefined;
  if (body.clear !== true) {
    const cleaned = cleanEdits({ colour: body.colour ?? undefined, text: body.text ?? undefined });
    if (!cleaned.ok) return NextResponse.json({ error: cleaned.error }, { status: 400 });
    const view = machineView(got.review);
    // Keep only what differs from the machine's page, so an untouched line keeps following the analysis.
    const text: TextEdits = {};
    for (const [id, v] of Object.entries(cleaned.text)) {
      if (JSON.stringify(v) !== JSON.stringify(view.original[id])) text[id as keyof TextEdits] = v;
    }
    const colour = cleaned.colour && cleaned.colour !== view.colour ? cleaned.colour : undefined;
    if (colour || Object.keys(text).length) {
      adminEdits = { ...(colour ? { colour } : {}), ...(Object.keys(text).length ? { text } : {}), editedBy: auth.email, editedAt: new Date().toISOString() };
    }
  }

  const review = { ...got.review };
  if (adminEdits) review.adminEdits = adminEdits; else delete review.adminEdits;
  const { error } = await createAdminClient()
    .from("product_reviews").update({ result: { ...got.stored, review } }).eq("product_slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  invalidateReviewCache(slug);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, slug, edits: adminEdits ?? null });
}
