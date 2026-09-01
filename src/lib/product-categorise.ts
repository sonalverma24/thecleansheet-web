/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Deterministic categoriser (step 4)
   Maps a review's free-text category (plus the product name as a hint)
   to exactly one canonical category from the closed taxonomy. The model
   proposes; this code validates - a review can never carry a category
   the checks-matrix doesn't recognise.
──────────────────────────────────────────────────────────────── */

import { PRODUCT_CATEGORIES, UNCLASSIFIED, type ProductCategory } from "@/data/analysis/categories";

const norm = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/* Longer synonyms first so "lip balm with spf" beats "lip balm", and
   "facial cleanser" beats "cleanser". */
const INDEX: { cat: ProductCategory; needle: string }[] = PRODUCT_CATEGORIES
  .flatMap((cat) => [norm(cat.type), ...cat.synonyms.map(norm)].map((needle) => ({ cat, needle })))
  .filter((x) => x.needle.length > 1)
  .sort((a, b) => b.needle.length - a.needle.length);

/** Resolve a product to one canonical category. `proposed` is the model's
    free-text category; `hint` is the product name (and optionally more text). */
export function categorise(proposed: string | undefined, hint = ""): ProductCategory {
  const hay = ` ${norm(proposed || "")} ${norm(hint)} `;

  // 1. Exact type-label match on the proposed category wins outright.
  const p = norm(proposed || "");
  const exact = PRODUCT_CATEGORIES.find((cat) => norm(cat.type) === p);
  if (exact) return exact;

  // 2. Longest synonym/label that appears as a whole word in proposed + hint.
  for (const { cat, needle } of INDEX) {
    if (hay.includes(` ${needle} `)) return cat;
  }

  // 3. Loose contains (handles "…moisturizing lotion" etc.) - still longest-first.
  for (const { cat, needle } of INDEX) {
    if (hay.includes(needle)) return cat;
  }

  return UNCLASSIFIED;
}

/** "Skin · Facial Moisturizer" style display string. */
export function categoryLabel(cat: ProductCategory): string {
  return `${cat.family} · ${cat.type}`;
}
