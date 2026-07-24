/* ────────────────────────────────────────────────────────────────
   Evidence Reviews store.
   Reviews are read from Supabase (public.verified_products) and merged
   with the seed file data/verified-products.json, so the library is
   never empty even before the database is populated. All calls are
   defensive: if Supabase is unavailable, the seed is used on its own.
──────────────────────────────────────────────────────────────── */

import seedData from "../../data/verified-products.json";
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

/* Seed reviews shipped in the repo (data/verified-products.json), used to
   populate the library before or alongside the database. */
function seedProducts(): VerifiedProduct[] {
  return (seedData as Partial<VerifiedProduct>[]).map((p) => ({
    slug: String(p.slug ?? slugify(p.productName ?? "", p.brand ?? "")),
    productName: String(p.productName ?? ""),
    brand: String(p.brand ?? ""),
    score: Number(p.score ?? 0),
    scoreLabel: String(p.scoreLabel ?? ""),
    integrityScore: p.integrityScore ?? null,
    imageUrl: p.imageUrl ?? null,
    summary: String(p.summary ?? ""),
    usageGuidance: p.usageGuidance ?? null,
    verifiedAt: String(p.verifiedAt ?? "2026-06-01T00:00:00.000Z"),
    methodologyVersion: String(p.methodologyVersion ?? ""),
  }));
}

export async function listVerifiedProducts(): Promise<VerifiedProduct[]> {
  let dbRows: VerifiedProduct[] = [];
  try {
    const db = createAdminClient();
    const { data } = await db
      .from("verified_products")
      .select("*")
      .order("verified_at", { ascending: false })
      .limit(200);
    dbRows = Array.isArray(data) ? data.map(rowToProduct) : [];
  } catch {
    dbRows = [];
  }
  // Merge seed + database, deduped by slug; database records win.
  const bySlug = new Map<string, VerifiedProduct>();
  for (const p of seedProducts()) bySlug.set(p.slug, p);
  for (const p of dbRows) bySlug.set(p.slug, p);
  return [...bySlug.values()].sort((a, b) => (a.verifiedAt < b.verifiedAt ? 1 : -1));
}
