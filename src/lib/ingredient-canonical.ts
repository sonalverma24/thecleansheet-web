/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Ingredient canonicalisation
   One ingredient, one URL. The directory holds the same substance under
   several names (spacing/hyphen variants scraped from product labels, INCI
   vs trade vs common name). Those are near-duplicate pages competing for the
   same query, so each group resolves to ONE preferred slug and the others
   301 to it.

   Two sources of duplicates, both deliberately conservative:
     1. SPELLING: a slug that differs from a curated profile only by spaces,
        hyphens or punctuation ("poly-sorbate-80" vs "polysorbate-80").
     2. MERGES: the hand-checked list below, for curated profiles that are
        the same substance under a different name.

   NOT merged, even where names look alike, because they are different
   chemical forms or carry different safety data: nano vs non-nano mineral
   filters, acid vs salt (hyaluronic acid / sodium hyaluronate), oil vs
   extract of the same plant, alpha-/plain tocopherol, hydrolysed variants,
   synthetic vs natural bakuchiol, glyceryl caprylate vs caprate. A pair is
   also left alone when the two profiles disagree on a safety field
   (concern level, CMR, EU status): see MERGE_REVIEW_QUEUE.
──────────────────────────────────────────────────────────────── */

import { ALL_INGREDIENTS, toSlug } from "@/lib/ingredient-utils";

/** [preferred INCI name, ...names that are the same substance]. Every name is a
    curated profile in ingredients.json (enforced by ingredient-canonical.test.ts),
    and no pair disagrees on concern level, CMR/endocrine/SVHC flags or EU status.
    Where the aliases carried the more cautious allergen note, that profile is the
    preferred one, so a merge never hides a warning. */
export const MERGES: ReadonlyArray<readonly [string, ...string[]]> = [
  ["Propanediol", "1,3-Propanediol"],
  ["Helianthus Annuus (Sunflower) Seed Oil", "Helianthus Annuus Seed Oil"],
  ["Simmondsia Chinensis (Jojoba) Seed Oil", "Simmondsia Chinensis Seed Oil", "Jojoba Oil (Simmondsia Chinensis Seed Oil)"],
  ["Cocos Nucifera (Coconut) Oil", "Cocos Nucifera Oil"],
  ["Persea Gratissima (Avocado) Oil", "Persea Gratissima Oil"],
  // Same concern level, CMR/SVHC/endocrine flags and EU status. Both carry the tree-nut caution;
  // the first words it more strictly (patch-test advisory), so it is the preferred profile.
  ["Sweet Almond Oil (Prunus Amygdalus Dulcis Oil)", "Prunus Amygdalus Dulcis Oil"],
  ["Vitis Vinifera Seed Oil", "Grape Seed Oil (Vitis Vinifera Seed Oil)"],
  ["Ricinus Communis Seed Oil", "Castor Oil (Ricinus Communis Seed Oil)"],
  ["Cannabis Sativa Seed Oil", "Hemp Seed Oil (Cannabis Sativa Seed Oil)"],
  ["Glycerin", "Glycerin (Vegetable)"],
  ["Hydroxypropyl Methylcellulose", "Hydroxypropyl Methylcellulose (HPMC)"],
  ["Beeswax", "Cera Alba"],
  ["Carnauba Wax", "Copernicia Cerifera Cera", "Copernicia Cerifera (Carnauba) Wax"],
  ["Candelilla Wax", "Euphorbia Cerifera (Candelilla) Wax"],
  ["Rosmarinus Officinalis (Rosemary) Leaf Extract", "Rosemary Extract (Rosmarinus Officinalis Leaf Extract)", "Rosmarinus Officinalis Leaf Extract"],
  ["Ceramide NP", "Ceramide III (= Ceramide NP)"],
  ["Chamomilla Recutita (Matricaria) Flower Extract", "Chamomilla Recutita Flower Extract"],
  ["Punica Granatum (Pomegranate) Fruit Extract", "Pomegranate Extract (Punica Granatum Fruit Extract)", "Punica Granatum Fruit Extract"],
  ["Iron Oxides (CI 77491)", "CI 77491"],
  ["Iron Oxides (CI 77492)", "CI 77492"],
  ["Iron Oxides (CI 77499)", "CI 77499"],
  ["Ultramarines", "CI 77007"],
  ["Chromium Oxide Greens", "CI 77288"],
  ["Manganese Violet", "CI 77742"],
  ["Marula Oil (Sclerocarya Birrea Seed Oil)", "Sclerocarya Birrea Seed Oil"],
  ["Baobab Oil (Adansonia Digitata Seed Oil)", "Adansonia Digitata Seed Oil"],
  ["Kokum Butter (Garcinia Indica Seed Fat)", "Garcinia Indica Seed Butter"],
  ["Snap-8 (Acetyl Octapeptide-3)", "Acetyl Octapeptide-3"],
  // The INCI-name profiles carry the allergen/sensitisation note the common-name ones lack.
  ["Withania Somnifera Root Extract", "Ashwagandha Extract (Withania Somnifera Root Extract)"],
  ["Trigonella Foenum-Graecum Seed Extract", "Fenugreek Extract (Trigonella Foenum-Graecum Seed Extract)"],
  ["Dimethyl Sulfone", "Methylsulfonylmethane"],
];

/** Same substance, but the two profiles DISAGREE on safety data. Not merged: a
    person has to decide which profile is right first. Merging would silently drop
    the more cautious one. */
export const MERGE_REVIEW_QUEUE: ReadonlyArray<readonly [string, string, string]> = [
  ["Retinyl Acetate", "Retinol Acetate", "CMR flag, EU status and allergen flag differ"],
  ["Cocamidopropyl Betaine", "Cocoamidopropyl Betaine", "concern level differs (Low-Medium vs Low); the second is a misspelling of the first"],
  ["Lavandula Angustifolia (Lavender) Flower Oil", "Lavender Oil (Lavandula Angustifolia Flower Oil)", "concern level differs (Low vs Low-Medium)"],
  ["Curcuma Longa (Turmeric) Root Extract", "Turmeric Extract (Curcuma Longa Root Extract)", "concern level differs (Low vs Low-Medium)"],
  ["Curcuma Longa (Turmeric) Root Extract", "Curcuma Longa Root Extract", "allergen note differs"],
  ["Carmine", "CI 75470", "concern level differs (Low vs Medium)"],
];

/** Letters and digits only: "Poly Sorbate 80", "poly-sorbate-80", "Polysorbate 80" collapse to one key. */
export const squash = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const nameToSlug = (n: string) => toSlug(n);

const MERGE_ALIAS = new Map<string, string>(); // alias slug -> preferred slug
const ALIAS_NAMES = new Map<string, string[]>(); // preferred slug -> alias INCI names
for (const [preferred, ...aliases] of MERGES) {
  const to = nameToSlug(preferred);
  for (const a of aliases) {
    const from = nameToSlug(a);
    if (from === to) continue;
    MERGE_ALIAS.set(from, to);
    (ALIAS_NAMES.get(to) ?? ALIAS_NAMES.set(to, []).get(to)!).push(a);
  }
}

/* squash key -> slug of the curated profile that owns it. When several curated
   rows squash alike the first wins, which matches getDirectoryIngredientBySlug. */
const CORE_BY_SQUASH = new Map<string, string>();
for (const i of ALL_INGREDIENTS) {
  const slug = nameToSlug(i.INCI_Name);
  const key = squash(slug);
  if (key && !CORE_BY_SQUASH.has(key)) CORE_BY_SQUASH.set(key, MERGE_ALIAS.get(slug) ?? slug);
}

/** The one URL slug an ingredient slug should live at. Identity for a slug with no
    duplicate. Pure and synchronous, so it works in sitemaps, link builders and the
    page itself without a database round trip. */
export function canonicalIngredientSlug(slug: string): string {
  const merged = MERGE_ALIAS.get(slug);
  if (merged) return merged;
  const owner = CORE_BY_SQUASH.get(squash(slug));
  return owner ?? slug;
}

/** True when this slug is a duplicate that should redirect rather than render. */
export const isAliasSlug = (slug: string): boolean => canonicalIngredientSlug(slug) !== slug;

/** Other names a preferred profile is known by (for an "Also listed as" line:
    real synonym coverage without a second thin page per name). */
export function aliasNamesFor(preferredSlug: string): string[] {
  return ALIAS_NAMES.get(preferredSlug) ?? [];
}

/* Names that are scraped page furniture or a dosage note, not an ingredient:
   "1,2-Hexanediol Show more Customer", "Carbomer 940 (1.2% W/W)", a 60-item
   essential-oil list. They only ever come from the discovered table. */
const JUNK_RE = /\b(show more|read more|see all|customers?|excluded|full ingredient list)\b|\d\s*%|\bw\/w\b/i;
export function isJunkIngredientName(name: string): boolean {
  const n = name.trim();
  return n.length > 80 || (n.match(/,/g)?.length ?? 0) >= 3 || JUNK_RE.test(n);
}
