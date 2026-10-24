/* Local preview only: reads stored analyses straight from the database with the PUBLIC anon key (GET only, nothing is written, no service key) so the
   decision core can be shown on real products on localhost. Never reachable in production (the pages 404 first). */

import type { ProductReview } from "@/lib/product-review-types";

/** Ten stored products that the decision core moves, from analyser/tools/pick-movers.mts: three to Good choice, three to Buy with caution, two to Not enough info
    and two to Look elsewhere, from a mix of today's standings. The sentences on the page are the engine's own; nothing about them is written here. */
export const DEMO: string[] = [
  "codeskin-ultrasensitive-mineral-sunscreen-spf-50",
  "bare-anatomy-junior-gentle-cleansing-shampoo",
  "foxtale-12-niacinamide-clarifying-serum",
  "aqualogica-glowy-dewy-sunscreen",
  "antinorm-bye-bye-blow-dry",
  "clean-conscious-care-espresso-whipped-foaming-sugar-scrub",
  "anua-anua-niacinamide-10-txa-4-serum",
  "addy-organics-addy-organics-sulphate-free-oil-clear-facewash-for-oily-acne-prone",
  "nivea-body-nourishing-lotion",
  "lotus-herbals-safe-sun-uv-screen-matte-gel-with-spf-50",
];

type Row = { product_slug: string; result: { type?: string; review?: ProductReview } | null };

/** The stored reviews for these slugs, by slug. */
export async function storedReviews(slugs: string[]): Promise<Map<string, ProductReview>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are needed for this preview");
  const q = new URLSearchParams({ select: "product_slug,result", product_slug: `in.(${slugs.map((s) => `"${s}"`).join(",")})` });
  const res = await fetch(`${url}/rest/v1/product_reviews?${q}`, { method: "GET", headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`read failed: HTTP ${res.status}`);
  const out = new Map<string, ProductReview>();
  for (const r of (await res.json()) as Row[]) if (r.result?.type === "product-review" && r.result.review) out.set(r.product_slug, r.result.review);
  return out;
}

/** Every stored analysis on an accepted rubric, by slug (public key, GET only), cached for five minutes so the overview is quick to reload. */
let cache: { at: number; rows: { slug: string; review: ProductReview }[] } | null = null;
export async function allStored(): Promise<{ slug: string; review: ProductReview }[]> {
  if (cache && Date.now() - cache.at < 5 * 60_000) return cache.rows;
  const { ACCEPTED_RUBRIC_REVS, RETRACTED_SLUGS } = await import("@/lib/product-review-engine");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are needed for this preview");
  const ok = new Set(ACCEPTED_RUBRIC_REVS);
  const rows: { slug: string; review: ProductReview }[] = [];
  for (let offset = 0; ; offset += 50) {
    const q = new URLSearchParams({ select: "product_slug,rubric_rev,result", order: "product_slug", limit: "50", offset: String(offset) });
    const res = await fetch(`${url}/rest/v1/product_reviews?${q}`, { method: "GET", headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" });
    if (!res.ok) throw new Error(`read failed: HTTP ${res.status}`);
    const page = (await res.json()) as (Row & { rubric_rev: string })[];
    for (const r of page) {
      if (ok.has(r.rubric_rev) && !RETRACTED_SLUGS.has(r.product_slug) && r.result?.type === "product-review" && r.result.review?.productName) rows.push({ slug: r.product_slug, review: r.result.review });
    }
    if (page.length < 50) break;
  }
  cache = { at: Date.now(), rows };
  return rows;
}
