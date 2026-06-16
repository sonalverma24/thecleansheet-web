/**
 * Product card display helpers.
 *
 * These functions provide consistent, safe rendering of category labels,
 * prices, and unit prices across all product cards regardless of which
 * optional fields are populated on a given ProductScorecard.
 */

import type { ProductScorecard } from "@/data/brands/types";

// ── Category label ────────────────────────────────────────────────────────────

/**
 * Maps the legacy productType enum to an approved taxonomy category label.
 * Only unambiguous mappings are included here. Ambiguous types ("leave-on",
 * "treatment") are left undefined so the name-based fallback can apply.
 */
const PRODUCT_TYPE_TO_CATEGORY: Partial<Record<ProductScorecard["productType"], string>> = {
  sunscreen: "Sunscreens",
  "rinse-off": "Face Cleansers",
  toner: "Serums",
};

/**
 * Return the approved taxonomy category label for a product.
 *
 * Priority:
 * 1. product.category (explicit taxonomy field)
 * 2. Legacy productType → category map (unambiguous types only)
 * 3. Product name keyword scan (last resort, conservative)
 * 4. "Category Pending" fallback
 */
export function getProductCategoryLabel(product: ProductScorecard): string {
  // 1. Explicit taxonomy field
  if (product.category) return product.category;

  // 2. Legacy enum mapping (unambiguous)
  const fromType = PRODUCT_TYPE_TO_CATEGORY[product.productType];
  if (fromType) return fromType;

  // 3. Name-based keyword scan (conservative - only strong signals)
  const n = product.productName.toLowerCase();
  if (n.includes("sunscreen") || n.includes(" spf ") || n.endsWith(" spf")) return "Sunscreens";
  if (n.includes("face wash") || n.includes("facial wash") || n.includes("cleanser") || n.includes("micellar")) return "Face Cleansers";
  if (n.includes("eye cream") || n.includes("under eye") || n.includes("eye treatment")) return "Eye Care";
  if (n.includes("lip ") || n.startsWith("lip ")) return "Lip Care";
  if (n.includes("shampoo") || n.includes("hair mask") || n.includes("scalp serum") || n.includes("hair oil") || n.includes("hair serum") || n.includes("blow dry")) return "Hair Care";
  if (n.includes("face mask") || n.includes("clay mask") || n.includes("sleeping mask") || n.includes("face peel")) return "Masks";
  if (n.includes("face oil") || n.includes("facial oil") || n.includes("recovery concentrate")) return "Face Oils";
  if (n.includes("moisturizer") || n.includes("moisturiser") || n.includes("night cream") || n.includes("day cream") || n.includes("rich cream") || n.includes("sorbet")) return "Moisturizers";
  if (n.includes("serum") || n.includes("booster") || n.includes("concentrate") || n.includes("solution")) return "Serums";
  if (n.includes("toner") || n.includes("peeling") || n.includes("exfoliant")) return "Exfoliants";

  // 4. Soft fallback for leave-on and treatment (most are serums)
  if (product.productType === "leave-on" || product.productType === "treatment") return "Serums";

  return "Category Pending";
}

// ── Price display ─────────────────────────────────────────────────────────────

/** Parse a raw priceRange string into {min, max} numbers. Returns null if unparseable. */
function parsePriceRange(raw: string): { min: number; max: number } | null {
  // Strip currency symbols, "Rs.", commas, and extra whitespace
  const cleaned = raw
    .replace(/Rs\.\s*/gi, "")
    .replace(/₹/g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Range: "799 - 1199" or "799-1199" (dash/en-dash/em-dash)
  const rangeMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*[-– - ]\s*(\d+(?:\.\d+)?)$/);
  if (rangeMatch) {
    return { min: parseFloat(rangeMatch[1]), max: parseFloat(rangeMatch[2]) };
  }

  // Single: "799"
  const singleMatch = cleaned.match(/^(\d+(?:\.\d+)?)$/);
  if (singleMatch) {
    const v = parseFloat(singleMatch[1]);
    return { min: v, max: v };
  }

  return null;
}

/** Format a number as an Indian Rupee price string (e.g. ₹1,199). */
function fmtPrice(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

/**
 * Return a normalized, ₹-formatted price string for the card price row.
 *
 * Handles:
 * - "₹664-₹699"        → "₹664-₹699" (pass-through)
 * - "Rs. 799 - Rs. 1,199" → "₹799-₹1,199"
 * - "Rs. 899"           → "₹899"
 * - Missing priceRange  → "Price unavailable"
 */
export function getDisplayPrice(product: ProductScorecard): string {
  const raw = product.priceRange;

  if (!raw) {
    return product.price ? fmtPrice(product.price) : "Price unavailable";
  }

  // Already clean ₹ format (starts with ₹, no Rs.) - pass through unchanged
  if (raw.startsWith("₹") && !raw.toLowerCase().includes("rs.")) {
    return raw;
  }

  const parsed = parsePriceRange(raw);
  if (!parsed) return raw; // unrecognised format - surface as-is

  if (parsed.min === parsed.max) return fmtPrice(parsed.min);
  return `${fmtPrice(parsed.min)}-${fmtPrice(parsed.max)}`;
}

// ── Unit price ────────────────────────────────────────────────────────────────

/** Normalise size unit strings to canonical ml / g / oz. */
export function normalizeSizeUnit(unit: string): string {
  const l = unit.toLowerCase().trim();
  if (["gm", "gram", "grams"].includes(l)) return "g";
  if (["millilitre", "milliliter", "ml"].includes(l)) return "ml";
  if (["fl oz", "fl. oz"].includes(l)) return "fl oz";
  return l;
}

/**
 * Calculate and format the unit price for a product card.
 *
 * Returns null (not calculable) when:
 * - sizeValue is missing or zero
 * - sizeUnit is missing or unsupported
 * - Neither price nor a parseable priceRange is available
 *
 * Uses pricePerUnit if already pre-calculated on the product object.
 */
export function getUnitPrice(product: ProductScorecard): string | null {
  const { sizeValue, sizeUnit, price, pricePerUnit, priceRange } = product;

  // 0. Pre-calculated - trust it if present
  if (pricePerUnit && pricePerUnit > 0 && sizeUnit) {
    const unit = normalizeSizeUnit(sizeUnit);
    if (!["ml", "g", "oz", "fl oz"].includes(unit)) return null;
    return `₹${Math.round(pricePerUnit)}/${unit}`;
  }

  // Guard: need a valid size
  if (!sizeValue || sizeValue <= 0 || !sizeUnit) {
    if (process.env.NODE_ENV === "development") {
      const hasPriceData = !!(price || priceRange);
      if (hasPriceData) {
        console.warn(
          `[unit-price] missing_size - ${product.brand}: ${product.productName}`
        );
      }
    }
    return null;
  }
  const unit = normalizeSizeUnit(sizeUnit);
  if (!["ml", "g", "oz", "fl oz"].includes(unit)) return null;

  // Calculate from explicit price
  if (price && price > 0) {
    return `₹${Math.round(price / sizeValue)}/${unit}`;
  }

  // Calculate from priceRange string
  if (priceRange) {
    const parsed = parsePriceRange(priceRange);
    if (parsed && parsed.min > 0) {
      const uMin = Math.round(parsed.min / sizeValue);
      const uMax = Math.round(parsed.max / sizeValue);
      if (uMin === uMax) return `₹${uMin}/${unit}`;
      return `₹${uMin} to ₹${uMax}/${unit}`;
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[unit-price] missing_price - ${product.brand}: ${product.productName}`
    );
  }
  return null;
}
