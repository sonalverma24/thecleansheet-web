"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  Suspense,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  ArrowUpDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import type { ProductScorecard } from "@/data/brands/types";
import type { BrandSummary } from "@/data/brands";
import { expandQuery } from "@/lib/search-synonyms";
import { buildControlledFilterOptions } from "@/data/taxonomy";
import { track } from "@/lib/analytics";

import { ScorecardSearchBar } from "./ScorecardSearchBar";
import { ScorecardFilterPanel } from "./ScorecardFilterPanel";
import { FilterChips } from "./FilterChips";
import { SortDropdown } from "./SortDropdown";
import { ScorecardResultCard } from "./ScorecardResultCard";
import { ComparisonTray } from "./ComparisonTray";
import { ComparisonDecisionEngine } from "./ComparisonDecisionEngine";
import { NoResultsCard } from "./NoResultsCard";

// ── Types ────────────────────────────────────────────────────────────────────

export type SortOption =
  | "best_match"
  | "score_desc"
  | "score_asc"
  | "price_asc"
  | "price_desc"
  | "value_desc"
  | "fewest_cautions"
  | "newest";

export interface ActiveFilters {
  categories: string[];
  productTypes: string[];
  scoreRanges: string[];
  activeIngredients: string[];
  skinConcerns: string[];
  suitability: string[];
  cautionFlags: string[];
  certificationStatus: string[];
  priceRanges: string[];
}

export interface FilterOptions {
  categories: { value: string; count: number }[];
  productTypes: { value: string; count: number }[];
  scoreRanges: { value: string; count: number }[];
  activeIngredients: { value: string; count: number }[];
  skinConcerns: { value: string; count: number }[];
  suitability: { value: string; count: number }[];
  cautionFlags: { value: string; count: number }[];
  certificationStatus: { value: string; count: number }[];
  priceRanges: { value: string; count: number }[];
}

const EMPTY_FILTERS: ActiveFilters = {
  categories: [],
  productTypes: [],
  scoreRanges: [],
  activeIngredients: [],
  skinConcerns: [],
  suitability: [],
  cautionFlags: [],
  certificationStatus: [],
  priceRanges: [],
};

const PAGE_SIZE = 16;
const DEBOUNCE_MS = 300;

// ── Helper: price bucket ──────────────────────────────────────────────────────

/** Extract the minimum price from a raw priceRange string like "Rs. 799 - Rs. 1,199" or "₹664-₹699" */
function parseMinPrice(raw: string): number | null {
  const cleaned = raw
    .replace(/Rs\.\s*/gi, "")
    .replace(/₹/g, "")
    .replace(/,/g, "")
    .trim();
  const m = cleaned.match(/^(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

function priceBucket(price?: number, priceRange?: string): string | null {
  const p = price ?? (priceRange ? parseMinPrice(priceRange) : null);
  if (!p) return null;
  if (p < 500) return "Under ₹500";
  if (p < 1000) return "₹500-₹1,000";
  if (p < 2000) return "₹1,000-₹2,000";
  return "₹2,000+";
}

// ── Helper: build controlled filter options from product list ─────────────────
// Only taxonomy-recognized labels appear as filter options.
// Raw free-text strings are silently dropped.
function buildFilterOptions(products: ProductScorecard[]): FilterOptions {
  return buildControlledFilterOptions(products);
}

// ── Helper: relevance score ───────────────────────────────────────────────────
function relevanceScore(product: ProductScorecard, terms: string[]): number {
  let s = 0;
  const name = product.productName.toLowerCase();
  const brand = product.brand.toLowerCase();
  const concern = product.concern.toLowerCase();
  // Split concern into individual chunks for per-term matching
  const concernChunks = concern.split(/[,;]+/).map((c) => c.trim()).filter(Boolean);
  for (const t of terms) {
    // Skip single-character tokens - they match everything and add noise
    if (t.length < 2) continue;
    if (name.includes(t)) s += 100;
    if (brand.includes(t)) s += 50;
    // Search both the active name AND its function description
    if (product.keyActives.some((a) => a.name.toLowerCase().includes(t))) s += 80;
    if (product.keyActives.some((a) => a.function.toLowerCase().includes(t))) s += 40;
    if (concern.includes(t)) s += 40;
    if (concernChunks.some((ch) => ch.includes(t) || t.includes(ch))) s += 35;
    if (product.category?.toLowerCase().includes(t)) s += 60;
    if (product.subCategory?.toLowerCase().includes(t)) s += 55;
    if (product.concernTags?.some((ct) => ct.toLowerCase().includes(t))) s += 45;
    if (product.suitabilityTags?.some((st) => st.toLowerCase().includes(t))) s += 35;
    if (product.skinTypeTags?.some((st) => st.toLowerCase().includes(t))) s += 35;
    if (product.pass_badges.some((b) => b.toLowerCase().includes(t))) s += 30;
    if (product.warn_badges.some((b) => b.toLowerCase().includes(t))) s += 20;
    if (product.claimsMade?.some((c) => c.toLowerCase().includes(t))) s += 25;
    if (product.ingredients.some((i) => i.name.toLowerCase().includes(t))) s += 15;
  }
  return s;
}

// ── Helper: match active filters ─────────────────────────────────────────────
function matchesFilters(product: ProductScorecard, filters: ActiveFilters): boolean {
  const {
    categories, productTypes, scoreRanges, activeIngredients,
    skinConcerns, suitability, cautionFlags, certificationStatus, priceRanges,
  } = filters;

  if (categories.length && !categories.includes(product.category ?? "")) return false;
  if (productTypes.length && !productTypes.includes(product.subCategory ?? "")) return false;
  if (scoreRanges.length && !scoreRanges.includes(product.scoreLabel)) return false;

  if (certificationStatus.length) {
    const cs = product.certificationStatus ?? "Not Reviewed";
    // Normalize stored values to taxonomy labels
    const normMap: Record<string, string> = {
      "tcs-certified": "TCS Certified",
      "under-review":  "Under Review",
      "not-certified": "Not Certified",
    };
    const label = normMap[cs] ?? cs;
    if (!certificationStatus.includes(label)) return false;
  }

  if (activeIngredients.length) {
    const productActives = product.keyActives.map((a) =>
      a.name.split("(")[0].trim().replace(/\s+\d[\d.]*%.*/, "").trim().toLowerCase()
    );
    if (!activeIngredients.some((a) =>
      productActives.some((pa) => pa.includes(a.toLowerCase()) || a.toLowerCase().includes(pa))
    )) return false;
  }

  if (skinConcerns.length) {
    const productConcerns = (product.concernTags ?? []).map((s) => s.toLowerCase());
    if (!skinConcerns.some((c) => productConcerns.some((pc) => pc.includes(c.toLowerCase())))) {
      return false;
    }
  }

  if (suitability.length) {
    const productSuit = (product.suitabilityTags ?? []).map((s) => s.toLowerCase());
    if (!suitability.some((s) => productSuit.some((ps) => ps.includes(s.toLowerCase())))) {
      return false;
    }
  }

  if (cautionFlags.length) {
    const productCautions = (product.cautionTags ?? []).map((s) => s.toLowerCase());
    if (!cautionFlags.some((c) => productCautions.some((pc) => pc.includes(c.toLowerCase())))) {
      return false;
    }
  }

  if (priceRanges.length) {
    const bucket = priceBucket(product.price, product.priceRange);
    if (!bucket || !priceRanges.includes(bucket)) return false;
  }

  return true;
}

// ── URL serialization ─────────────────────────────────────────────────────────
function filtersToParams(filters: ActiveFilters, query: string, sort: SortOption, view: string): URLSearchParams {
  const p = new URLSearchParams();
  if (view === "brands") p.set("view", "brands");
  if (query) p.set("q", query);
  if (sort !== "value_desc") p.set("sort", sort);
  if (filters.categories.length) p.set("category", filters.categories.join(","));
  if (filters.productTypes.length) p.set("type", filters.productTypes.join(","));
  if (filters.scoreRanges.length) p.set("score", filters.scoreRanges.join(","));
  if (filters.activeIngredients.length) p.set("active", filters.activeIngredients.join(","));
  if (filters.skinConcerns.length) p.set("concern", filters.skinConcerns.join(","));
  if (filters.suitability.length) p.set("suit", filters.suitability.join(","));
  if (filters.cautionFlags.length) p.set("caution", filters.cautionFlags.join(","));
  if (filters.certificationStatus.length) p.set("cert", filters.certificationStatus.join(","));
  if (filters.priceRanges.length) p.set("price", filters.priceRanges.join(","));
  return p;
}

function paramsToFilters(sp: URLSearchParams): ActiveFilters {
  const split = (key: string) => sp.get(key)?.split(",").filter(Boolean) ?? [];
  return {
    categories: split("category"),
    productTypes: split("type"),
    scoreRanges: split("score"),
    activeIngredients: split("active"),
    skinConcerns: split("concern"),
    suitability: split("suit"),
    cautionFlags: split("caution"),
    certificationStatus: split("cert"),
    priceRanges: split("price"),
  };
}


// ── Sort options (shared between desktop dropdown and mobile sheet) ───────────
const SORT_OPTIONS_LIST: { value: SortOption; label: string; requiresPrice?: boolean }[] = [
  { value: "score_desc",       label: "Highest score" },
  { value: "score_asc",        label: "Lowest score" },
  { value: "best_match",       label: "Best match" },
  { value: "price_asc",        label: "Lowest price",        requiresPrice: true },
  { value: "price_desc",       label: "Highest price",       requiresPrice: true },
  { value: "value_desc",       label: "Best value (per ml)", requiresPrice: true },
  { value: "fewest_cautions",  label: "Fewest caution flags" },
  { value: "newest",           label: "Newest scorecard" },
];

// ── Mobile sort bottom sheet ──────────────────────────────────────────────────
function MobileSortSheet({
  open,
  onClose,
  value,
  onChange,
  hasQuery,
  hasPriceData,
}: {
  open: boolean;
  onClose: () => void;
  value: SortOption;
  onChange: (v: SortOption) => void;
  hasQuery: boolean;
  hasPriceData: boolean;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const visible = SORT_OPTIONS_LIST.filter((o) => {
    if (o.value === "best_match" && !hasQuery) return false;
    if (o.requiresPrice && !hasPriceData) return false;
    return true;
  });

  return (
    <div className="lg:hidden fixed inset-0 z-[70] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div
        className="relative rounded-t-3xl flex flex-col shadow-2xl"
        style={{ background: "#faf7f2", maxHeight: "70vh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="rounded-full" style={{ width: 40, height: 4, background: "rgba(176,168,164,0.45)" }} />
        </div>
        {/* Header */}
        <div
          className="flex items-center justify-between flex-shrink-0"
          style={{ height: 52, paddingLeft: 20, paddingRight: 12, borderBottom: "1px solid rgba(176,168,164,0.25)" }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: "#282828" }}>Sort by</span>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full"
            style={{ width: 40, height: 40, background: "rgba(176,168,164,0.15)" }}
            aria-label="Close sort"
          >
            <X size={16} style={{ color: "#282828" }} />
          </button>
        </div>
        {/* Options */}
        <div className="overflow-y-auto flex-1" style={{ padding: "4px 0 24px" }}>
          {visible.map((opt) => {
            const selected = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); onClose(); }}
                className="w-full flex items-center justify-between transition-colors active:bg-ink-50"
                style={{ height: 52, paddingLeft: 20, paddingRight: 20 }}
              >
                <span style={{ fontSize: 15, color: selected ? "#248179" : "#282828", fontWeight: selected ? 500 : 400 }}>
                  {opt.label}
                </span>
                {selected && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L7 12L13 5" stroke="#248179" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Inner component (uses useSearchParams) ────────────────────────────────────
interface InnerProps {
  brands: BrandSummary[];
  products: ProductScorecard[];
}

function ScorecardDiscoveryInner({ brands, products }: InnerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ── State ──────────────────────────────────────────────────────────────────
  /* /brands is product search only. Brand browsing and its tab switcher have
     been removed; `view` is a constant so the legacy ?view=brands deep link is
     inert and just shows the product search. */
  const view = "products";
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [filters, setFilters] = useState<ActiveFilters>(() =>
    paramsToFilters(searchParams)
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) ?? "value_desc"
  );
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [comparingIds, setComparingIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);

  // Debounce search query
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(value);
      setPage(1);
      if (value) track("search_query_submitted", { query: value });
    }, DEBOUNCE_MS);
  }, []);

  // ── URL sync ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const params = filtersToParams(filters, debouncedQuery, sortBy, view);
    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;
    router.replace(newUrl, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, debouncedQuery, sortBy, view]);

  // ── Filter options (from all products) ────────────────────────────────────
  const filterOptions = useMemo(() => buildFilterOptions(products), [products]);

  // ── Filtered + sorted results ─────────────────────────────────────────────
  const results = useMemo(() => {
    const terms = debouncedQuery ? expandQuery(debouncedQuery) : [];
    let filtered = products;

    // Text search
    if (terms.length) {
      filtered = filtered
        .map((p) => ({ product: p, score: relevanceScore(p, terms) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) =>
          sortBy === "best_match" ? b.score - a.score : 0
        )
        .map(({ product }) => product);
    }

    // Active filters
    filtered = filtered.filter((p) => matchesFilters(p, filters));

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case "score_desc":
        sorted.sort((a, b) => b.score - a.score);
        break;
      case "score_asc":
        sorted.sort((a, b) => a.score - b.score);
        break;
      case "price_asc":
        sorted.sort((a, b) => (a.price ?? 99999) - (b.price ?? 99999));
        break;
      case "price_desc":
        sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "value_desc":
        // Best value per ml first; products without per-ml data fall to the end, ordered by score.
        sorted.sort((a, b) => {
          const pa = a.pricePerUnit ?? Infinity, pb = b.pricePerUnit ?? Infinity;
          return pa !== pb ? pa - pb : b.score - a.score;
        });
        break;
      case "fewest_cautions":
        sorted.sort(
          (a, b) =>
            (a.warn_badges.length + (a.cautionTags?.length ?? 0)) -
            (b.warn_badges.length + (b.cautionTags?.length ?? 0))
        );
        break;
      case "newest":
        sorted.sort((a, b) => b.analyzedAt.localeCompare(a.analyzedAt));
        break;
      // best_match already sorted above; default keeps order
    }

    // Pin freshly-reviewed products (last 30 days) to the top, regardless of sort,
    // so the lime NEW badge is actually seen. Stable within each group.
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const isFresh = (p: ProductScorecard) =>
      p.freshReview === true && Date.now() - new Date(p.analyzedAt).getTime() < THIRTY_DAYS;
    const fresh = sorted.filter(isFresh);
    const rest = sorted.filter((p) => !isFresh(p));
    return [...fresh, ...rest];
  }, [products, debouncedQuery, filters, sortBy]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const pageResults = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const toggleFilter = useCallback(
    (key: keyof ActiveFilters, value: string) => {
      setFilters((prev) => {
        const arr = prev[key];
        const next = arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value];
        track("filter_applied", { filter: key, value });
        return { ...prev, [key]: next };
      });
      setPage(1);
    },
    []
  );

  const removeFilter = useCallback((key: keyof ActiveFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].filter((v) => v !== value),
    }));
    setPage(1);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  // ── Sort helper ────────────────────────────────────────────────────────────
  const handleSortChange = useCallback((v: SortOption) => {
    setSortBy(v);
    setPage(1);
    track("sort_changed", { sort: v });
  }, []);

  // ── Compare helpers ────────────────────────────────────────────────────────
  const toggleCompare = useCallback((id: string) => {
    setComparingIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const comparingProducts = useMemo(() =>
    comparingIds
      .map((id) => {
        const [brandSlug, slug] = id.split("/");
        return products.find(
          (p) => p.brandSlug === brandSlug && p.slug === slug
        );
      })
      .filter(Boolean) as ProductScorecard[],
    [comparingIds, products]
  );

  const hasPriceData = products.some((p) => !!p.price);
  const hasActiveFilters = Object.values(filters).some((a) => a.length > 0);

  // Stats reflect the full merged catalogue actually shown (curated + live
  // repository), so both counts grow as the repository does — not just the
  // static curated list.
  const totalProducts = products.length;
  const brandsScored = new Set(products.map((p) => p.brandSlug)).size;

  return (
    <>
      {/* ── Stats strip ── */}
      <div className="bg-white border border-ink-100 rounded-2xl shadow-sm mt-3 mb-4 grid grid-cols-3 divide-x divide-ink-100">
        {[
          { label: "Brands scored",       value: brandsScored.toString()   },
          { label: "Products analysed",   value: totalProducts.toString()  },
          { label: "Ingredients checked", value: "25,000+"                 },
        ].map(({ label, value }) => (
          <div key={label} className="px-4 sm:px-8 py-3 text-center">
            <div className="text-2xl sm:text-3xl font-medium text-ink-950 tracking-tight">{value}</div>
            <div className="text-xs text-ink-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Brands-browsing view and its tab switcher deleted — this page is product search only. */}

      {/* ── PRODUCTS SEARCH VIEW ── */}
      {view === "products" && (
        <>
          {/* Sticky top bar: search + mobile filter/sort controls */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm -mx-4 sm:-mx-6 px-4 sm:px-6 mb-3 border-b border-ink-100">
            <div className="pt-2.5 pb-2.5">
              <ScorecardSearchBar
                value={query}
                onChange={handleQueryChange}
                resultCount={results.length}
                isSearching={!!debouncedQuery || hasActiveFilters}
              />
            </div>
            {/* Mobile only: filter + sort row */}
            <div className="lg:hidden flex items-center gap-2 pb-2.5">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="inline-flex items-center gap-1.5 border border-ink-200 text-ink-700 text-sm font-medium px-3 rounded-xl transition-colors active:bg-ink-50"
                style={{ minHeight: 38 }}
              >
                <SlidersHorizontal size={13} />
                Filters
                {hasActiveFilters && (
                  <span
                    className="text-white rounded-full flex items-center justify-center font-sans"
                    style={{ background: "#248179", fontSize: 10, width: 18, height: 18 }}
                  >
                    {Object.values(filters).reduce((s, a) => s + a.length, 0)}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileSortOpen(true)}
                className="inline-flex items-center gap-1.5 border border-ink-200 text-ink-700 text-sm font-medium px-3 rounded-xl transition-colors active:bg-ink-50"
                style={{ minHeight: 38 }}
              >
                <ArrowUpDown size={13} />
                Sort
              </button>
              <span className="ml-auto text-xs text-ink-400 font-sans tabular-nums">
                {results.length} product{results.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="mb-4">
              <FilterChips
                filters={filters}
                onRemove={removeFilter}
                onClearAll={clearAllFilters}
              />
            </div>
          )}

          <div className="flex gap-6">
            {/* Filter panel */}
            <ScorecardFilterPanel
              options={filterOptions}
              filters={filters}
              onToggle={toggleFilter}
              onClearAll={clearAllFilters}
              mobileOpen={mobileFilterOpen}
              onMobileClose={() => setMobileFilterOpen(false)}
              resultCount={results.length}
            />

            {/* Results */}
            <div className="flex-1 min-w-0">
              {/* Desktop toolbar */}
              <div className="hidden lg:flex items-center justify-between mb-5">
                <span className="text-xs text-ink-400 font-sans">
                  {results.length} product{results.length !== 1 ? "s" : ""}
                  {debouncedQuery ? ` for "${debouncedQuery}"` : ""}
                </span>
                <SortDropdown
                  value={sortBy}
                  onChange={handleSortChange}
                  hasQuery={!!debouncedQuery}
                  hasPriceData={hasPriceData}
                />
              </div>

              {/* Results grid */}
              {results.length === 0 ? (
                <div className="grid">
                  <NoResultsCard query={debouncedQuery} />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                    {pageResults.map((product) => {
                      const id = `${product.brandSlug}/${product.slug}`;
                      return (
                        <ScorecardResultCard
                          key={id}
                          product={product}
                          isComparing={comparingIds.includes(id)}
                          onCompareToggle={toggleCompare}
                          compareCount={comparingIds.length}
                        />
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mb-8">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-xl border border-ink-200 disabled:opacity-40 hover:border-teal-300 transition-colors"
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={14} className="text-ink-600" />
                      </button>
                      <span className="text-xs text-ink-500 font-sans">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-xl border border-ink-200 disabled:opacity-40 hover:border-teal-300 transition-colors"
                        aria-label="Next page"
                      >
                        <ChevronRight size={14} className="text-ink-600" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Mobile sort sheet ── */}
      <MobileSortSheet
        open={mobileSortOpen}
        onClose={() => setMobileSortOpen(false)}
        value={sortBy}
        onChange={handleSortChange}
        hasQuery={!!debouncedQuery}
        hasPriceData={hasPriceData}
      />

      {/* ── Comparison tray ── */}
      <ComparisonTray
        products={comparingProducts}
        onRemove={toggleCompare}
        onClearAll={() => setComparingIds([])}
        onCompare={() => setShowComparison(true)}
      />

      {/* Add bottom padding when tray is visible */}
      {comparingIds.length > 0 && <div className="h-20" />}

      {/* ── Comparison modal ── */}
      {showComparison && comparingProducts.length >= 2 && (
        <ComparisonDecisionEngine
          products={comparingProducts}
          onClose={() => setShowComparison(false)}
        />
      )}
    </>
  );
}

// ── Public export (wraps inner in Suspense) ───────────────────────────────────
interface ScorecardDiscoveryProps {
  brands: BrandSummary[];
  products: ProductScorecard[];
}

export function ScorecardDiscovery({ brands, products }: ScorecardDiscoveryProps) {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse">
          <div className="bg-ink-100 h-24 rounded-2xl mt-6 mb-10" />
          <div className="h-10 w-48 bg-ink-100 rounded-2xl mb-8" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-ink-100 h-72 rounded-3xl" />
            ))}
          </div>
        </div>
      }
    >
      <ScorecardDiscoveryInner brands={brands} products={products} />
    </Suspense>
  );
}
