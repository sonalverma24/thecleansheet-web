/**
 * Product taxonomy - controlled vocabulary for product categories and types.
 *
 * This module re-exports from the authoritative taxonomy data source at
 * src/data/taxonomy/. Do not add categories or product types here directly.
 * All changes must go through the taxonomy seed data.
 */

export { PRODUCT_TAXONOMY, PRODUCT_CATEGORY_LABELS as PRODUCT_CATEGORIES } from "@/data/taxonomy";
export { getTypesForCategory, getTaxonomyItem, getByFamily } from "@/data/taxonomy";
