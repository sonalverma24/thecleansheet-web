import { ALL_BRANDS } from "@/data/brands";
import { resolveTier } from "@/components/scorecards/pillar-ui";
import type { ReviewTier } from "@/lib/product-review-types";
import { toSlug } from "@/lib/ingredient-utils";

/**
 * Reverse index: ingredient slug -> reviewed products that contain it.
 * Turns the ingredient directory and the product catalogue into one linked
 * graph (ingredient page <-> product page), which both spreads crawl equity
 * and gives readers a real "where is this used?" answer. Built once at module
 * load from the static brand catalogue.
 */

export type IngredientProductRef = {
  brandName: string;
  brandSlug: string;
  productName: string;
  productSlug: string;
  image: string;
  tier: ReviewTier;
};

const INDEX = new Map<string, IngredientProductRef[]>();

for (const brand of ALL_BRANDS) {
  for (const product of brand.products) {
    const ref: IngredientProductRef = {
      brandName: brand.name,
      brandSlug: brand.slug,
      productName: product.productName,
      productSlug: product.slug,
      image: product.image,
      tier: resolveTier(product),
    };
    // De-dupe ingredient slugs within a single product so a product is listed
    // at most once per ingredient.
    const seen = new Set<string>();
    for (const ing of product.ingredients) {
      const slug = toSlug(ing.name);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      const list = INDEX.get(slug);
      if (list) list.push(ref);
      else INDEX.set(slug, [ref]);
    }
  }
}

/** Products (from the reviewed catalogue) whose INCI list contains this ingredient. */
export function getProductsWithIngredient(slug: string, limit = 8): IngredientProductRef[] {
  return (INDEX.get(slug) ?? []).slice(0, limit);
}
