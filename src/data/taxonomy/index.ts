/**
 * The Clean Sheet - Taxonomy Index
 *
 * Single import point for all taxonomy access. Provides lookup helpers,
 * filter option builders, synonym expansion, and product validation.
 */

export type { TaxonomyItem, TaxonomyFamily, TaxonomyStatus, ProductTaxonomyMap } from "./schema";

import type { TaxonomyItem, TaxonomyFamily } from "./schema";
import {
  ALL_TAXONOMY_ITEMS,
  PRODUCT_CATEGORIES,
  PRODUCT_TYPES,
  ACTIVE_INGREDIENTS,
  CONCERNS,
  SUITABILITY,
  CAUTION,
  CERTIFICATION_STATUS,
  EVIDENCE_STATUS,
  PRISM_MODULES,
} from "./seed";

// ── Lookup index ──────────────────────────────────────────────────────────────

const INDEX_BY_ID = new Map<string, TaxonomyItem>(
  ALL_TAXONOMY_ITEMS.map((item) => [item.id, item])
);

const INDEX_BY_SLUG = new Map<string, TaxonomyItem>(
  ALL_TAXONOMY_ITEMS.map((item) => [item.slug, item])
);

const INDEX_BY_LABEL = new Map<string, TaxonomyItem>(
  ALL_TAXONOMY_ITEMS.map((item) => [item.label.toLowerCase(), item])
);

const INDEX_BY_FAMILY = new Map<TaxonomyFamily, TaxonomyItem[]>();
for (const item of ALL_TAXONOMY_ITEMS) {
  const list = INDEX_BY_FAMILY.get(item.family) ?? [];
  list.push(item);
  INDEX_BY_FAMILY.set(item.family, list);
}

// ── Public exports from seed ──────────────────────────────────────────────────

export {
  ALL_TAXONOMY_ITEMS,
  PRODUCT_CATEGORIES,
  PRODUCT_TYPES,
  ACTIVE_INGREDIENTS,
  CONCERNS,
  SUITABILITY,
  CAUTION,
  CERTIFICATION_STATUS,
  EVIDENCE_STATUS,
  PRISM_MODULES,
};

// ── Lookup helpers ────────────────────────────────────────────────────────────

/** Get a taxonomy item by its ID. Returns undefined if not found. */
export function getTaxonomyItem(id: string): TaxonomyItem | undefined {
  return INDEX_BY_ID.get(id);
}

/** Get a taxonomy item by its slug. Returns undefined if not found. */
export function getTaxonomyBySlug(slug: string): TaxonomyItem | undefined {
  return INDEX_BY_SLUG.get(slug);
}

/** Get all taxonomy items for a given family, sorted by display_order. */
export function getByFamily(family: TaxonomyFamily): TaxonomyItem[] {
  return (INDEX_BY_FAMILY.get(family) ?? [])
    .filter((i) => i.status === "active")
    .sort((a, b) => a.display_order - b.display_order);
}

/** Get all active, public, filterable items for a family. */
export function getFilterableByFamily(family: TaxonomyFamily): TaxonomyItem[] {
  return getByFamily(family).filter((i) => i.is_filterable && i.is_public && !i.is_admin_only);
}

/** Get all product types for a given category ID. */
export function getTypesForCategory(categoryId: string): TaxonomyItem[] {
  return getByFamily("product_type")
    .filter((t) => t.parent_id === categoryId);
}

/** Get all active ingredients for a given group ID. */
export function getActivesForGroup(groupId: string): TaxonomyItem[] {
  return getByFamily("active_ingredient")
    .filter((a) => a.parent_id === groupId);
}

/**
 * Try to find a taxonomy item by a raw label string (case-insensitive).
 * Returns undefined if no exact match found. Does not do fuzzy matching.
 * Use `findTaxonomyMatch` for fuzzy/synonym matching.
 */
export function findByLabel(label: string): TaxonomyItem | undefined {
  return INDEX_BY_LABEL.get(label.toLowerCase());
}

// ── PRODUCT_TAXONOMY map (for filter panel hierarchy) ────────────────────────
// Format: { "Face Cleansers": ["Gel Cleanser", "Cream Cleanser", ...], ... }

export const PRODUCT_TAXONOMY: Record<string, string[]> = Object.fromEntries(
  PRODUCT_CATEGORIES.map((cat) => [
    cat.label,
    getTypesForCategory(cat.id).map((t) => t.label),
  ])
);

export const PRODUCT_CATEGORY_LABELS: string[] = PRODUCT_CATEGORIES.map((c) => c.label);

// ── Synonym-based matching ────────────────────────────────────────────────────

/** Build a flat synonym map for search: each synonym maps to its canonical TaxonomyItem */
function buildSynonymIndex(): Map<string, TaxonomyItem> {
  const map = new Map<string, TaxonomyItem>();
  for (const item of ALL_TAXONOMY_ITEMS) {
    if (!item.is_searchable) continue;
    // Index label
    map.set(item.label.toLowerCase(), item);
    // Index slug
    map.set(item.slug, item);
    // Index all synonyms
    for (const syn of item.synonyms) {
      map.set(syn.toLowerCase(), item);
    }
  }
  return map;
}

const SYNONYM_INDEX = buildSynonymIndex();

/**
 * Try to find a taxonomy item by fuzzy match (label, slug, or synonym).
 * Returns the best matching item, or undefined if nothing is close enough.
 */
export function findTaxonomyMatch(raw: string): TaxonomyItem | undefined {
  const lower = raw.toLowerCase().trim();
  // Direct lookup
  if (SYNONYM_INDEX.has(lower)) return SYNONYM_INDEX.get(lower);
  // Partial match: find any synonym that the raw string contains
  for (const [key, item] of SYNONYM_INDEX.entries()) {
    if (lower.includes(key) && key.length > 3) return item;
  }
  return undefined;
}

// ── Search expansion ──────────────────────────────────────────────────────────

/**
 * Expand a search query into a deduplicated array of terms including:
 * - Original query
 * - Individual tokens
 * - Canonical labels for matched taxonomy items
 * - All synonyms for matched taxonomy items
 */
export function expandTaxonomyQuery(raw: string): string[] {
  const input = raw.toLowerCase().trim();
  const tokens = input.split(/\s+/).filter((t) => t.length >= 2);
  const expanded = new Set<string>([input, ...tokens]);

  // Find all taxonomy items that any token or the full query matches
  const matchedItems = new Set<TaxonomyItem>();

  const candidates = [input, ...tokens];
  for (const candidate of candidates) {
    const item = findTaxonomyMatch(candidate);
    if (item) matchedItems.add(item);
  }

  // Also check if the full query CONTAINS a known synonym (multi-word phrase matching).
  // Only match when input includes the key — not when the key includes the input,
  // because that direction causes "retinol" to match "retinol serum", "no retinol",
  // "retinol glow" etc., which expands to unrelated parent categories and concerns.
  for (const [key, item] of SYNONYM_INDEX.entries()) {
    if (input.includes(key) && key.length > 3) {
      matchedItems.add(item);
    }
  }

  // Add canonical label and all synonyms from matched items
  for (const item of matchedItems) {
    expanded.add(item.label.toLowerCase());
    expanded.add(item.slug);
    for (const syn of item.synonyms) {
      expanded.add(syn.toLowerCase());
    }
    // If the item is a product type, also add its parent category
    if (item.family === "product_type" && item.parent_id) {
      const parent = INDEX_BY_ID.get(item.parent_id);
      if (parent) {
        expanded.add(parent.label.toLowerCase());
        for (const syn of parent.synonyms) expanded.add(syn.toLowerCase());
      }
    }
    // If the item is a variant active (e.g. Ethyl Ascorbic Acid), also add parent group
    if (item.family === "active_ingredient" && item.parent_id) {
      const group = INDEX_BY_ID.get(item.parent_id);
      if (group) expanded.add(group.label.toLowerCase());
    }
  }

  return Array.from(expanded).filter(Boolean);
}

// ── Product validation ────────────────────────────────────────────────────────

export interface TaxonomyValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  dataLimitedReasons: string[];
}

const VALID_CERT_LABELS = new Set(CERTIFICATION_STATUS.map((c) => c.label));
const VALID_EVIDENCE_LABELS = new Set(EVIDENCE_STATUS.map((e) => e.label));
const VALID_CATEGORY_LABELS = new Set(PRODUCT_CATEGORIES.map((c) => c.label));
const ALL_TYPE_LABELS = new Set(PRODUCT_TYPES.map((t) => t.label));

/** Validate a product object against the controlled taxonomy. */
export function validateProductTaxonomy(product: {
  category?: string;
  subCategory?: string;
  certificationStatus?: string;
  pass_badges?: string[];
  warn_badges?: string[];
  price?: number;
  keyActives?: { name: string }[];
}): TaxonomyValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const dataLimitedReasons: string[] = [];

  // Errors (reject conditions)
  if (!product.category) {
    errors.push("Product category is missing. A category is required.");
  } else if (!VALID_CATEGORY_LABELS.has(product.category)) {
    errors.push(`Category "${product.category}" is not in the approved taxonomy.`);
  }

  if (!product.subCategory) {
    errors.push("Product type (subCategory) is missing. A product type is required.");
  } else if (!ALL_TYPE_LABELS.has(product.subCategory)) {
    errors.push(`Product type "${product.subCategory}" is not in the approved taxonomy.`);
  }

  if (product.certificationStatus && !VALID_CERT_LABELS.has(product.certificationStatus)) {
    errors.push(`Certification status "${product.certificationStatus}" is not in the approved taxonomy.`);
  }

  // Data limited (allow upload but flag)
  if (!product.price) {
    dataLimitedReasons.push("Price is missing.");
  }
  if (!product.keyActives || product.keyActives.length === 0) {
    dataLimitedReasons.push("No key actives listed.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    dataLimitedReasons,
  };
}

// ── Filter options builder ────────────────────────────────────────────────────

/**
 * Build the controlled filter options from a list of products.
 * Only taxonomy-recognized labels appear as filter options.
 * Raw free-text labels are silently dropped.
 */
export function buildControlledFilterOptions(products: {
  category?: string;
  subCategory?: string;
  scoreLabel: string;
  keyActives: { name: string }[];
  concernTags?: string[];
  suitabilityTags?: string[];
  cautionTags?: string[];
  pass_badges: string[];
  warn_badges: string[];
  price?: number;
  priceRange?: string;
  certificationStatus?: string;
  availabilitySources?: string[];
}[]) {
  function count<T extends string>(items: T[]): { value: T; count: number }[] {
    const map = new Map<T, number>();
    items.forEach((v) => map.set(v, (map.get(v) ?? 0) + 1));
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count }));
  }

  const SCORE_LABELS = new Set(["Excellent", "Good", "Fair", "Concern"]);
  const VALID_SUITABILITY = new Set(SUITABILITY.map((s) => s.label));
  const VALID_CAUTION = new Set(CAUTION.map((c) => c.label));
  const VALID_CONCERN = new Set(CONCERNS.map((c) => c.label));
  const VALID_ACTIVE = new Set(ACTIVE_INGREDIENTS.filter((a) => a.is_filterable).map((a) => a.label));

  // Active matching: normalize raw active names to taxonomy labels
  function normActiveLabel(raw: string): string | null {
    const lower = raw.toLowerCase().replace(/\s*\(.*?\)/g, "").replace(/\s+\d.*/, "").trim();
    const matched = findTaxonomyMatch(lower);
    if (matched?.family === "active_ingredient" && matched.is_filterable) return matched.label;
    return null;
  }

  // Concern matching: normalize concern strings to taxonomy labels
  function normConcernLabel(raw: string): string | null {
    const lower = raw.toLowerCase().trim();
    const matched = findTaxonomyMatch(lower);
    if (matched?.family === "concern" && matched.is_filterable) return matched.label;
    return null;
  }

  return {
    categories: count(
      products.flatMap((p) =>
        p.category && VALID_CATEGORY_LABELS.has(p.category) ? [p.category] : []
      )
    ),
    productTypes: count(
      products.flatMap((p) =>
        p.subCategory && ALL_TYPE_LABELS.has(p.subCategory) ? [p.subCategory] : []
      )
    ),
    scoreRanges: count(
      products.flatMap((p) =>
        SCORE_LABELS.has(p.scoreLabel) ? [p.scoreLabel] : []
      )
    ),
    activeIngredients: count(
      products.flatMap((p) => {
        const labels = p.keyActives
          .map((a) => normActiveLabel(a.name))
          .filter((l): l is string => l !== null);
        return [...new Set(labels)];
      })
    ),
    skinConcerns: count(
      products.flatMap((p) => {
        const raw = [...(p.concernTags ?? [])];
        return raw
          .map(normConcernLabel)
          .filter((l): l is string => l !== null && VALID_CONCERN.has(l));
      })
    ),
    suitability: count(
      products.flatMap((p) =>
        (p.suitabilityTags ?? []).filter((s) => VALID_SUITABILITY.has(s))
      )
    ),
    cautionFlags: count(
      products.flatMap((p) =>
        (p.cautionTags ?? []).filter((c) => VALID_CAUTION.has(c))
      )
    ),
    certificationStatus: count(
      products.flatMap((p) =>
        p.certificationStatus && VALID_CERT_LABELS.has(p.certificationStatus)
          ? [p.certificationStatus]
          : []
      )
    ),
    priceRanges: count(
      products.flatMap((p) => {
        // Prefer numeric price; fall back to parsing priceRange string
        let price = p.price;
        if (!price && p.priceRange) {
          const cleaned = p.priceRange
            .replace(/Rs\.\s*/gi, "")
            .replace(/₹/g, "")
            .replace(/,/g, "")
            .trim();
          const m = cleaned.match(/^(\d+(?:\.\d+)?)/);
          if (m) price = parseFloat(m[1]);
        }
        if (!price) return [];
        if (price < 500) return ["Under ₹500"];
        if (price < 1000) return ["₹500-₹1,000"];
        if (price < 2000) return ["₹1,000-₹2,000"];
        return ["₹2,000+"];
      })
    ),
  };
}
