import type { ProductScorecard } from "@/data/brands/types";
import { TIER_STYLES, resolveTier } from "@/components/scorecards/pillar-ui";
import { expandQuery } from "@/lib/search-synonyms";
import { getProductCategoryLabel } from "@/lib/product-card-helpers";

/* ────────────────────────────────────────────────────────────────
   REGISTRY FILTERS · the search, filter, facet-count and sort logic behind
   the /brands marketplace. Plain functions, so it can be tested.

   Rules a shopper would expect:
   - Choices inside one filter group are OR (Good Standing OR Room to Improve).
   - Different groups are AND (Cleansers AND Good Standing).
   - A group's counts show what you would get by ticking that choice given
     everything else already chosen, so a count is never a dead end.
   - The standing filter uses the real standings only; there is no certified status.
──────────────────────────────────────────────────────────────── */

export type FilterKey = "standing" | "category" | "brand" | "price" | "active" | "suitability";
export type RegistryFilters = Record<FilterKey, string[]>;
export type SortKey = "newest" | "best_match" | "standing" | "price_asc" | "price_desc" | "name";

export const FILTER_KEYS: FilterKey[] = ["standing", "category", "brand", "price", "active", "suitability"];

export const EMPTY_FILTERS: RegistryFilters = { standing: [], category: [], brand: [], price: [], active: [], suitability: [] };

export const FILTER_LABELS: Record<FilterKey, string> = {
  standing: "Standing",
  category: "Product type",
  brand: "Brand",
  price: "Price",
  active: "Key active",
  suitability: "Suitable for",
};

/** URL parameter for each filter group. */
export const FILTER_PARAM: Record<FilterKey, string> = {
  standing: "standing",
  category: "category",
  brand: "brand",
  price: "price",
  active: "active",
  suitability: "suit",
};

export const SORT_LABELS: Record<SortKey, string> = {
  newest: "Newest analysis",
  best_match: "Best match",
  standing: "Standing, best first",
  price_asc: "Price, low to high",
  price_desc: "Price, high to low",
  name: "Name, A to Z",
};

// The four standings (every product with no stored review) and the five pills (a stored review, with the pills page on). A listing can hold both while
// the static catalogue has no pill, so each sits beside the one it replaces.
const STANDING_ORDER = ["Good choice", "Good Standing", "Buy with caution", "Room to Improve", "Not enough info", "Look elsewhere", "Not Recommended", "Medicinal product", "Licensed Drug"];
const PRICE_ORDER = ["Under ₹500", "₹500-₹1,000", "₹1,000-₹2,000", "₹2,000+"];

// ── Values a product has for each filter group ───────────────────────────────

export function standingOf(p: Pick<ProductScorecard, "reviewTier" | "score"> & { pill?: ProductScorecard["pill"] }): string {
  if (p.pill) return p.pill.label; // the pills page: the pill its stored review decides
  return TIER_STYLES[resolveTier({ reviewTier: p.reviewTier, score: p.score })].label;
}

function parseMinPrice(raw: string): number | null {
  const cleaned = raw.replace(/Rs\.\s*/gi, "").replace(/₹/g, "").replace(/,/g, "").trim();
  const m = cleaned.match(/^(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

export function priceOf(p: Pick<ProductScorecard, "price" | "priceRange">): number | null {
  if (p.price) return p.price;
  return p.priceRange ? parseMinPrice(p.priceRange) : null;
}

export function priceBucket(p: Pick<ProductScorecard, "price" | "priceRange">): string | null {
  const v = priceOf(p);
  if (!v) return null;
  if (v < 500) return "Under ₹500";
  if (v < 1000) return "₹500-₹1,000";
  if (v < 2000) return "₹1,000-₹2,000";
  return "₹2,000+";
}

/** A key active's name without brackets and percentages: "Niacinamide (Vitamin B3) 10%" becomes "Niacinamide". */
export function activeName(raw: string): string {
  return raw.split("(")[0].replace(/\s+\d[\d.]*\s*%.*/, "").trim();
}

/* Product types. Stored categories are free text ("serum", "Serums", "Ampoule / Face Serum",
   "Essence/Toner"...), which would make a filter of 40 near-duplicates, so each product is
   put in one of a short list of types. The first rule that matches wins, so the order matters
   ("Facewash Bar" is a cleanser before it is a bar of soap). The category text decides first;
   the product name is only used when the category says nothing useful. */
const TYPE_RULES: [string, RegExp][] = [
  ["Hair care", /\b(hair|shampoo|conditioner|scalp)\b/],
  ["Sunscreens", /\b(sunscreens?|sun ?screens?|sun ?block|spf)\b/],
  ["Makeup", /\b(make ?up|lipsticks?|tints?|foundation|concealer|primer|blush|mascara|kajal|eye ?liner|compact|skin base|highlighter|bronzer)\b/],
  ["Lip care", /\blips?\b/],
  ["Baby care", /\b(baby|infant|diaper|nappy)\b/],
  ["Eye care", /\beyes?\b/],
  ["Cleansers", /\b(cleansers?|cleansing|face ?wash|facial wash|foam|micellar|makeup remover)\b/],
  ["Spot care", /\b(patch|patches|spot|pimple|acne|scar|blemish)\b/],
  ["Body & bath", /\b(body|bath|bathing|soap|bar|scrub|deodorant|deo|stick|roll ?on|perfume|fragrance|talc|hand)\b/],
  ["Masks", /\b(masks?|sleeping pack)\b/],
  ["Exfoliants", /\b(exfoliants?|exfoliating|exfoliator|peel|peeling|aha|bha|salicylic|glycolic)\b/],
  ["Toners", /\b(toners?|essence|mist)\b/],
  ["Serums", /\b(serums?|ampoule|concentrate|booster|face oils?|facial oil)\b/],
  ["Moisturisers", /\b(moisturi[sz]ers?|moisturi[sz]ing|creams?|lotion|gel|emulsion|balm|butter)\b/],
];

function classifyType(text: string): string | null {
  const t = text.toLowerCase();
  return TYPE_RULES.find(([, re]) => re.test(t))?.[0] ?? null;
}

/** The product-type group a product is filed under (every product gets one). */
export function productGroup(p: ProductScorecard): string {
  const label = getProductCategoryLabel(p);
  return (
    (label === "Category Pending" ? null : classifyType(label)) ??
    classifyType(p.subCategory ?? "") ??
    classifyType(p.productName) ??
    "Other"
  );
}

function valuesFor(p: ProductScorecard, key: FilterKey): string[] {
  switch (key) {
    case "standing": return [standingOf(p)];
    case "category": return [productGroup(p)];
    case "brand": return p.brand ? [p.brand] : [];
    case "price": { const b = priceBucket(p); return b ? [b] : []; }
    case "active": return [...new Set((p.keyActives ?? []).map((a) => activeName(a.name)).filter(Boolean))].slice(0, 6);
    case "suitability": return p.suitabilityTags ?? [];
  }
}

// ── Text search ───────────────────────────────────────────────────────────────

export function searchScore(p: ProductScorecard, terms: string[]): number {
  let s = 0;
  const name = p.productName.toLowerCase();
  const brand = p.brand.toLowerCase();
  const concern = (p.concern ?? "").toLowerCase();
  const chunks = concern.split(/[,;]+/).map((c) => c.trim()).filter(Boolean);
  for (const t of terms) {
    if (t.length < 2) continue; // one-letter tokens match everything
    if (name.includes(t)) s += 100;
    if (brand.includes(t)) s += 50;
    if (p.keyActives?.some((a) => a.name.toLowerCase().includes(t))) s += 80;
    if (p.keyActives?.some((a) => a.function.toLowerCase().includes(t))) s += 40;
    if (concern.includes(t)) s += 40;
    if (chunks.some((ch) => ch.includes(t) || t.includes(ch))) s += 35;
    if (p.category?.toLowerCase().includes(t)) s += 60;
    if (p.subCategory?.toLowerCase().includes(t)) s += 55;
    if (p.concernTags?.some((c) => c.toLowerCase().includes(t))) s += 45;
    if (p.suitabilityTags?.some((c) => c.toLowerCase().includes(t))) s += 35;
    if (p.skinTypeTags?.some((c) => c.toLowerCase().includes(t))) s += 35;
    if (p.claimsMade?.some((c) => c.toLowerCase().includes(t))) s += 25;
    if (p.ingredients?.some((i) => i.name.toLowerCase().includes(t))) s += 15;
  }
  return s;
}

// ── Filtering ─────────────────────────────────────────────────────────────────

export function matchesFilters(p: ProductScorecard, filters: RegistryFilters, skip?: FilterKey): boolean {
  for (const key of FILTER_KEYS) {
    if (key === skip) continue;
    const chosen = filters[key];
    if (!chosen.length) continue;
    const have = valuesFor(p, key);
    if (!chosen.some((c) => have.includes(c))) return false;
  }
  return true;
}

/** Products matching the search text, each with its relevance (all of them, at 0, when there is no search). */
function searched(products: ProductScorecard[], query: string): { p: ProductScorecard; rel: number }[] {
  const terms = query.trim() ? expandQuery(query.trim()) : [];
  if (!terms.length) return products.map((p) => ({ p, rel: 0 }));
  return products.map((p) => ({ p, rel: searchScore(p, terms) })).filter((x) => x.rel > 0);
}

const STANDING_RANK: Record<string, number> = {
  "Good choice": 0, "Good Standing": 0, "Buy with caution": 1, "Room to Improve": 1, "Not enough info": 2,
  "Look elsewhere": 3, "Not Recommended": 3, "Medicinal product": 4, "Licensed Drug": 4,
};

function sortList(list: { p: ProductScorecard; rel: number }[], sort: SortKey): ProductScorecard[] {
  const newest = (a: ProductScorecard, b: ProductScorecard) => (b.analyzedAt ?? "").localeCompare(a.analyzedAt ?? "");
  const arr = [...list];
  switch (sort) {
    case "best_match": arr.sort((a, b) => b.rel - a.rel || newest(a.p, b.p)); break;
    case "standing": arr.sort((a, b) => (STANDING_RANK[standingOf(a.p)] ?? 9) - (STANDING_RANK[standingOf(b.p)] ?? 9) || newest(a.p, b.p)); break;
    case "price_asc": arr.sort((a, b) => (priceOf(a.p) ?? Infinity) - (priceOf(b.p) ?? Infinity) || newest(a.p, b.p)); break;
    case "price_desc": arr.sort((a, b) => (priceOf(b.p) ?? -1) - (priceOf(a.p) ?? -1) || newest(a.p, b.p)); break;
    case "name": arr.sort((a, b) => `${a.p.brand} ${a.p.productName}`.localeCompare(`${b.p.brand} ${b.p.productName}`)); break;
    default: arr.sort((a, b) => newest(a.p, b.p));
  }
  return arr.map((x) => x.p);
}

export function defaultSort(query: string): SortKey {
  return query.trim() ? "best_match" : "newest";
}

export function filterAndSort(
  products: ProductScorecard[],
  opts: { filters: RegistryFilters; query: string; sort: SortKey },
): ProductScorecard[] {
  const hits = searched(products, opts.query).filter(({ p }) => matchesFilters(p, opts.filters));
  // "Best match" only means something with a search.
  const sort = opts.sort === "best_match" && !opts.query.trim() ? "newest" : opts.sort;
  return sortList(hits, sort);
}

// ── Facets ────────────────────────────────────────────────────────────────────

export interface Facet { value: string; count: number }
export type Facets = Record<FilterKey, Facet[]>;

/** The choices (and counts) for each group, given the search and the choices made in the OTHER groups.
    Choices already ticked always stay listed, even at 0, so they can be unticked. */
export function computeFacets(products: ProductScorecard[], filters: RegistryFilters, query: string): Facets {
  const base = searched(products, query).map((x) => x.p);
  const out = {} as Facets;
  for (const key of FILTER_KEYS) {
    const counts = new Map<string, number>();
    for (const p of base) {
      if (!matchesFilters(p, filters, key)) continue;
      for (const v of valuesFor(p, key)) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    for (const chosen of filters[key]) if (!counts.has(chosen)) counts.set(chosen, 0);
    const list = [...counts.entries()].map(([value, count]) => ({ value, count }));
    if (key === "standing") list.sort((a, b) => STANDING_ORDER.indexOf(a.value) - STANDING_ORDER.indexOf(b.value));
    else if (key === "price") list.sort((a, b) => PRICE_ORDER.indexOf(a.value) - PRICE_ORDER.indexOf(b.value));
    else list.sort((a, b) => Number(a.value === "Other") - Number(b.value === "Other") || b.count - a.count || a.value.localeCompare(b.value));
    out[key] = list;
  }
  return out;
}

export function activeFilterCount(filters: RegistryFilters): number {
  return FILTER_KEYS.reduce((n, k) => n + filters[k].length, 0);
}

// ── URL ───────────────────────────────────────────────────────────────────────

/** Every parameter this page owns, including old ones, so a stale link never leaves a ghost filter. */
const OWNED_PARAMS = ["q", "sort", "view", "type", "score", "concern", "cert", "caution", ...FILTER_KEYS.map((k) => FILTER_PARAM[k])];

export interface RegistryState { query: string; sort: SortKey | null; filters: RegistryFilters }

export function stateFromParams(sp: URLSearchParams): RegistryState {
  const filters = { ...EMPTY_FILTERS } as RegistryFilters;
  for (const k of FILTER_KEYS) filters[k] = (sp.get(FILTER_PARAM[k]) ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const sort = sp.get("sort");
  return { query: sp.get("q") ?? "", sort: sort && sort in SORT_LABELS ? (sort as SortKey) : null, filters };
}

/** The new query string: this page's parameters are rewritten, everything else (like ?analyse=) is kept. */
export function searchWithState(currentSearch: string, state: RegistryState): string {
  const sp = new URLSearchParams(currentSearch);
  for (const key of OWNED_PARAMS) sp.delete(key);
  if (state.query.trim()) sp.set("q", state.query.trim());
  if (state.sort && state.sort !== defaultSort(state.query)) sp.set("sort", state.sort);
  for (const k of FILTER_KEYS) if (state.filters[k].length) sp.set(FILTER_PARAM[k], state.filters[k].join(","));
  return sp.toString();
}
