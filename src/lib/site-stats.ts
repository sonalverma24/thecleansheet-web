import { ALL_BRANDS } from "@/data/brands";
import { getDirectoryIngredients } from "@/lib/ingredient-directory";
import { listReviewIndex } from "@/lib/product-review-engine";
import { cataloguePathFor } from "@/lib/catalogue-dedupe";

/* ────────────────────────────────────────────────────────────────
   The site's headline numbers, counted from the data. Anywhere the site
   states how many products / brands / ingredients it covers it must use
   these, never a hard-coded figure: the counts change every time a
   product is reviewed or an ingredient is discovered.
──────────────────────────────────────────────────────────────── */

export interface SiteStats {
  /** Products analysed: curated catalogue + live reviews (a product present in both counts once). */
  products: number;
  /** Distinct brands with at least one analysed product. */
  brands: number;
  /** Ingredients in the directory: curated core + discovered profiles. */
  ingredients: number;
}

const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

export async function getSiteStats(): Promise<SiteStats> {
  const [reviews, directory] = await Promise.all([listReviewIndex(), getDirectoryIngredients()]);
  const catalogue = ALL_BRANDS.flatMap((b) => b.products);
  const repoOnly = reviews.filter((r) => !cataloguePathFor(r.brand, r.productName));
  const brands = new Set<string>([
    ...ALL_BRANDS.map((b) => key(b.name)),
    ...repoOnly.map((r) => key(r.brand)).filter(Boolean),
  ]);
  return { products: catalogue.length + repoOnly.length, brands: brands.size, ingredients: directory.length };
}

/** "1,234" style, Indian grouping not needed at these magnitudes. */
export const fmt = (n: number) => n.toLocaleString("en-IN");
