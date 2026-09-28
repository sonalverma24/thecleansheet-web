import { ALL_BRANDS } from "@/data/brands";

/* A product can be both in the curated catalogue (/brands/[brand]/[product]) and
   in the live review repository (/reviews/[slug]). The two pages show the same
   product, so only one may be the canonical. The catalogue page wins. Uses the
   same brand+name normalisation as the /brands grid, so "already covered" means
   the same thing everywhere. */

const norm = (brand: string, name: string) =>
  `${brand} ${name}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const CATALOGUE = new Map<string, string>(
  ALL_BRANDS.flatMap((b) => b.products.map((p) => [norm(p.brand, p.productName), `/brands/${b.slug}/${p.slug}`] as const)),
);

/** Path of the catalogue page for this product, or null when the product is repository-only. */
export function cataloguePathFor(brand: string, productName: string): string | null {
  return CATALOGUE.get(norm(brand, productName)) ?? null;
}
