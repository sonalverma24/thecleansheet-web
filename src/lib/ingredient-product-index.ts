import type { ProductScorecard } from "@/data/brands/types";
import { MARKER_OF_TIER } from "@/components/scorecards/pill-palette";
import { resolveTier } from "@/components/scorecards/pillar-ui";
import { listRepositoryCatalogueProducts } from "@/lib/product-review-engine";
import { toSlug } from "@/lib/ingredient-utils";

/**
 * Reverse index: ingredient slug -> analysed products that contain it.
 * Turns the ingredient directory and the product pages into one linked graph
 * (ingredient page <-> product page): a reader can see where an ingredient is used, and
 * every new analysis is added to the pages of its ingredients without anyone listing it.
 *
 * It is built from the stored analyses (newest first), not from the removed hand-written
 * catalogue. Reading every analysis is heavy, so the index is kept for INDEX_TTL_MS and
 * shared by every ingredient page an instance renders; a new analysis shows up on its
 * ingredient pages within that time of the page being refreshed (see site-refresh.ts).
 */

export type IngredientProductRef = {
  brandName: string;
  productName: string;
  productSlug: string;
  image: string;
  /** The rating circle the product's own page shows: green, yellow, red, or null for grey (not rated). */
  marker: "green" | "yellow" | "red" | null;
};

export function buildIngredientIndex(tiles: ProductScorecard[]): Map<string, IngredientProductRef[]> {
  const index = new Map<string, IngredientProductRef[]>();
  for (const tile of tiles) {
    const ref: IngredientProductRef = {
      brandName: tile.brand,
      productName: tile.productName,
      productSlug: tile.slug,
      image: tile.image,
      marker: tile.pill ? tile.pill.marker : MARKER_OF_TIER[resolveTier({ reviewTier: tile.reviewTier, score: tile.score })],
    };
    // A product is listed at most once per ingredient, however many times its list names it.
    const seen = new Set<string>();
    for (const ing of tile.ingredients) {
      const slug = toSlug(ing.name);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      const list = index.get(slug);
      if (list) list.push(ref);
      else index.set(slug, [ref]);
    }
  }
  return index;
}

const INDEX_TTL_MS = 2 * 60 * 1000;
/** An empty read (the table is empty, or the read failed) is only remembered this long, so a recovery shows quickly. */
const EMPTY_TTL_MS = 15 * 1000;

let memo: { at: number; ttl: number; index: Map<string, IngredientProductRef[]> } | null = null;
let inflight: Promise<Map<string, IngredientProductRef[]>> | null = null;

async function currentIndex(): Promise<Map<string, IngredientProductRef[]>> {
  if (memo && Date.now() - memo.at < memo.ttl) return memo.index;
  // Pages render side by side: one read serves them all.
  inflight ??= listRepositoryCatalogueProducts(1000)
    .then((tiles) => {
      const index = buildIngredientIndex(tiles);
      memo = { at: Date.now(), ttl: tiles.length ? INDEX_TTL_MS : EMPTY_TTL_MS, index };
      return index;
    })
    .finally(() => { inflight = null; });
  return inflight;
}

/** Analysed products (newest first) whose ingredient list contains this ingredient. */
export async function getProductsWithIngredient(slug: string, limit = 8): Promise<IngredientProductRef[]> {
  return ((await currentIndex()).get(slug) ?? []).slice(0, limit);
}
