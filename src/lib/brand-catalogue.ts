/* The brands, and the products we have analysed under each, as a search needs them (src/lib/specific-product.ts).

   Read only. One read of the saved analyses (slug, name, brand and revision, not the large result) and one of the brands table, kept for five minutes like the
   review cache, so a search costs the database nothing most of the time. A database error never reaches the shopper: the last answer is used, or none, and the built-in
   list of brands (src/data/brands/known-names.ts) still stands. Which of the rows may be offered as a suggestion (current rubric, not retracted, a cosmetic) is
   decided by the engine, which knows those rules; see suggestionsFor. */

import { createAdminClient } from "@/lib/supabase/admin";
import { ALL_BRANDS } from "@/data/brands";
import { KNOWN_BRAND_NAMES } from "@/data/brands/known-names";
import { brandKey } from "@/lib/product-identity";
import { MAX_SUGGESTIONS, resultNamesNoProduct, type ProductSuggestion } from "@/lib/specific-product";

export interface CatalogueRow {
  slug: string;
  name: string;
  brand: string;
  rubricRev: string;
}

export interface BrandCatalogue {
  /** The brands table's names, which can hold a brand that has no analysis yet. */
  tableBrands: string[];
  rows: CatalogueRow[];
}

const EMPTY: BrandCatalogue = { tableBrands: [], rows: [] };
const TTL_MS = 5 * 60 * 1000;
const RETRY_AFTER_ERROR_MS = 60 * 1000; // an outage is not asked about on every search
const PAGE = 1000; // PostgREST returns at most this many rows in one response

let cache: { at: number; value: BrandCatalogue; failed: boolean } | null = null;

export async function getBrandCatalogue(): Promise<BrandCatalogue> {
  if (cache && Date.now() - cache.at < (cache.failed ? RETRY_AFTER_ERROR_MS : TTL_MS)) return cache.value;
  try {
    const db = createAdminClient();
    const rows: CatalogueRow[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await db
        .from("product_reviews")
        .select("product_slug, product_name, brand, rubric_rev")
        .order("product_slug", { ascending: true })
        .range(from, from + PAGE - 1);
      if (error || !data) throw error ?? new Error("no data");
      for (const r of data) rows.push({ slug: String(r.product_slug), name: String(r.product_name ?? ""), brand: String(r.brand ?? ""), rubricRev: String(r.rubric_rev ?? "") });
      if (data.length < PAGE) break;
    }
    const { data: brands, error: brandsError } = await db.from("brands").select("name");
    if (brandsError) throw brandsError;
    const value = { tableBrands: (brands ?? []).map((b) => String(b.name ?? "")).filter(Boolean), rows };
    cache = { at: Date.now(), value, failed: false };
    return value;
  } catch (e) {
    console.error("[brand-catalogue] could not read the repository", e instanceof Error ? e.message : e);
    const value = cache?.value ?? EMPTY;
    cache = { at: Date.now(), value, failed: true };
    return value;
  }
}

/** Every brand name a search can consist of: the built-in list, the hand-written catalogue (empty today), the brands table, and the brand of every saved analysis. */
export function knownBrandNames(catalogue: BrandCatalogue): string[] {
  return [...KNOWN_BRAND_NAMES, ...ALL_BRANDS.map((b) => b.name), ...catalogue.tableBrands, ...catalogue.rows.map((r) => r.brand)].filter((b) => b.trim());
}

/** Products of `brand` that may be offered in place of the one that was not named: those `servable` accepts, and never a row whose own name is only its brand. */
export function suggestionsFor(catalogue: BrandCatalogue, brand: string | null, servable: (row: CatalogueRow) => boolean): ProductSuggestion[] {
  if (!brand) return [];
  const want = brandKey(brand);
  const seen = new Set<string>();
  return catalogue.rows
    .filter((r) => brandKey(r.brand) === want && servable(r) && !resultNamesNoProduct(r.name, r.brand))
    .filter((r) => (seen.has(r.slug) ? false : (seen.add(r.slug), true)))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, MAX_SUGGESTIONS)
    .map((r) => ({ name: r.name, slug: r.slug }));
}
