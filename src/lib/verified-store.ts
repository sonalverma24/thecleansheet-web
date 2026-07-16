/* ────────────────────────────────────────────────────────────────
   Verified Products registry (Clean Sheet Approved)
   Products scoring >= VERIFIED_THRESHOLD are recommended by
   The Clean Sheet and listed with usage guidance.

   Storage: Supabase table public.verified_products (durable across
   serverless cold starts). All calls are defensive: if the table or
   connection is unavailable, reads return [] and writes are skipped,
   so the app never breaks.
──────────────────────────────────────────────────────────────── */

import { createAdminClient } from "@/lib/supabase/admin";
import type { VerifiedProduct } from "@/lib/types";

export const VERIFIED_THRESHOLD = 75;

export function slugify(productName: string, brand: string): string {
  return `${brand} ${productName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function rowToProduct(r: Record<string, unknown>): VerifiedProduct {
  return {
    slug: String(r.slug),
    productName: String(r.product_name ?? ""),
    brand: String(r.brand ?? ""),
    score: Number(r.score ?? 0),
    scoreLabel: String(r.score_label ?? ""),
    integrityScore: r.integrity_score == null ? null : Number(r.integrity_score),
    imageUrl: (r.image_url as string | null) ?? null,
    summary: String(r.summary ?? ""),
    usageGuidance: (r.usage_guidance as VerifiedProduct["usageGuidance"]) ?? null,
    verifiedAt: String(r.verified_at ?? new Date().toISOString()),
    methodologyVersion: String(r.methodology_version ?? ""),
  };
}

export async function upsertVerifiedProduct(p: VerifiedProduct): Promise<void> {
  try {
    const db = createAdminClient();
    // Keep the richest record: don't overwrite an existing image/guidance with nulls.
    const { data: existing } = await db
      .from("verified_products")
      .select("image_url,usage_guidance,integrity_score")
      .eq("slug", p.slug)
      .maybeSingle();

    await db.from("verified_products").upsert(
      {
        slug: p.slug,
        product_name: p.productName,
        brand: p.brand,
        score: p.score,
        score_label: p.scoreLabel,
        integrity_score: p.integrityScore ?? existing?.integrity_score ?? null,
        image_url: p.imageUrl ?? existing?.image_url ?? null,
        summary: p.summary,
        usage_guidance: p.usageGuidance ?? existing?.usage_guidance ?? null,
        verified_at: p.verifiedAt,
        methodology_version: p.methodologyVersion,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    );
  } catch {
    /* persistence unavailable — skip the write, never break the review */
  }
}

export async function listVerifiedProducts(): Promise<VerifiedProduct[]> {
  try {
    const db = createAdminClient();
    const { data } = await db
      .from("verified_products")
      .select("*")
      .order("verified_at", { ascending: false })
      .limit(200);
    return Array.isArray(data) ? data.map(rowToProduct) : [];
  } catch {
    return [];
  }
}
