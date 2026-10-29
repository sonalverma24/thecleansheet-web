"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import type { ProductScorecard } from "@/data/brands/types";
import { track } from "@/lib/analytics";
import {
  EMPTY_FILTERS, FILTER_KEYS, FILTER_LABELS, SORT_LABELS, activeFilterCount, computeFacets, defaultSort,
  filterAndSort, searchWithState, stateFromParams,
  type FilterKey, type RegistryFilters, type SortKey,
} from "@/lib/registry-filters";
import { useSignInGate } from "@/components/auth/useSignInGate";
import { ComparisonTray } from "@/components/scorecards/ComparisonTray";
import { ComparisonDecisionEngine } from "@/components/scorecards/ComparisonDecisionEngine";
import { NoResultsCard } from "@/components/scorecards/NoResultsCard";
import FilterPanel from "./FilterPanel";
import MarketCard, { MAX_COMPARE, productId } from "./MarketCard";

/* The /brands marketplace: search, filters on the left (a sheet on phones), a grid of
   home-style product cards, "Show more". Everything is chosen and counted in the
   browser from the products the page passes in (see registry-filters.ts), and the
   choices are kept in the URL so a filtered view can be shared.

   The first render is the unfiltered list, so the server HTML already carries the
   first cards; a shared URL's choices are applied right after hydration.

   Looking at the list is open to everyone. Opening a product, comparing, searching, sorting and
   filtering need a sign-in (useSignInGate): the popup comes up in place of the action. Taking a
   choice away (clear, start again, the search's x) and "Show more" are always open, so nobody is
   stuck behind a filter a shared link set. */

const PAGE_SIZE = 24;

export default function BrandsMarketplace({ products }: { products: ProductScorecard[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey | null>(null);
  const [filters, setFilters] = useState<RegistryFilters>(EMPTY_FILTERS);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [comparingIds, setComparingIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const { guard, openLink } = useSignInGate();

  // A shared link's search, sort and filters, applied once after hydration.
  useEffect(() => {
    const t = window.setTimeout(() => {
      const s = stateFromParams(new URLSearchParams(window.location.search));
      setQuery(s.query);
      setSort(s.sort);
      setFilters(s.filters);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const writeUrl = useCallback((next: { query: string; sort: SortKey | null; filters: RegistryFilters }) => {
    const search = searchWithState(window.location.search, next);
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`);
  }, []);

  const applyQuery = (q: string) => {
    setQuery(q);
    setVisible(PAGE_SIZE);
    writeUrl({ query: q, sort, filters });
  };
  // Typing needs a sign-in; the search box's x (applyQuery("")) does not.
  const changeQuery = (q: string) => guard("search", () => applyQuery(q));
  const changeSort = (s: SortKey) =>
    guard("sort", () => {
      setSort(s);
      setVisible(PAGE_SIZE);
      writeUrl({ query, sort: s, filters });
    });
  const toggleFilter = (key: FilterKey, value: string) =>
    guard("filter", () => {
      const has = filters[key].includes(value);
      const next = { ...filters, [key]: has ? filters[key].filter((v) => v !== value) : [...filters[key], value] };
      setFilters(next);
      setVisible(PAGE_SIZE);
      writeUrl({ query, sort, filters: next });
      track("filter_changed", { group: key, value, on: !has });
    });
  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setVisible(PAGE_SIZE);
    writeUrl({ query, sort, filters: EMPTY_FILTERS });
  };
  const clearAll = () => {
    setQuery("");
    setSort(null);
    setFilters(EMPTY_FILTERS);
    setVisible(PAGE_SIZE);
    writeUrl({ query: "", sort: null, filters: EMPTY_FILTERS });
  };

  // Typing stays instant; the list catches up a beat later.
  const deferredQuery = useDeferredValue(query);
  const effectiveSort: SortKey = sort && !(sort === "best_match" && !deferredQuery.trim()) ? sort : defaultSort(deferredQuery);

  const results = useMemo(
    () => filterAndSort(products, { filters, query: deferredQuery, sort: effectiveSort }),
    [products, filters, deferredQuery, effectiveSort],
  );
  const facets = useMemo(() => computeFacets(products, filters, deferredQuery), [products, filters, deferredQuery]);
  const activeCount = activeFilterCount(filters);
  const shown = results.slice(0, visible);

  // ── Phone filter sheet ────────────────────────────────────────────────────
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheetOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  // ── Compare ───────────────────────────────────────────────────────────────
  const toggleCompare = useCallback(
    (id: string) =>
      guard("compare", () =>
        setComparingIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : prev.length >= MAX_COMPARE ? prev : [...prev, id])),
      ),
    [guard],
  );
  const comparingProducts = useMemo(
    () => comparingIds.map((id) => products.find((p) => productId(p) === id)).filter((p): p is ProductScorecard => !!p),
    [comparingIds, products],
  );

  const sortOptions = (Object.keys(SORT_LABELS) as SortKey[]).filter((k) => k !== "best_match" || deferredQuery.trim());

  return (
    <section id="registry" className="scroll-mt-24 max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pb-16 md:pb-24">
      <div className="lg:grid lg:grid-cols-[256px_minmax(0,1fr)] lg:gap-10">
        {/* Filters: sidebar from laptop width up */}
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-[96px] max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5dfd6]">
              <span className="text-[12px] font-bold tracking-[0.14em] uppercase text-[#282828]">Filters</span>
              {activeCount > 0 && (
                <button type="button" onClick={clearFilters} className="text-[13px] font-bold text-[#248179] hover:underline underline-offset-[3px]">
                  Clear all
                </button>
              )}
            </div>
            <div className="pt-4">
              <FilterPanel facets={facets} filters={filters} onToggle={toggleFilter} />
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex flex-col gap-4">
          {/* Search */}
          <form role="search" onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2.5 h-[52px] px-4 border border-[#e5dfd6] focus-within:border-[#248179] rounded-[14px] bg-white transition-colors">
            <span aria-hidden className="text-[#248179] text-[18px]">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(e) => changeQuery(e.target.value)}
              aria-label="Search analysed products by name, brand or ingredient"
              placeholder="Search analysed products by name, brand or ingredient"
              className="flex-1 min-w-0 border-0 outline-none text-[16px] md:text-[15px] text-[#282828] bg-transparent placeholder:text-[#b0a8a4] [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" onClick={() => applyQuery("")} aria-label="Clear search" className="text-[#4a4a4a] hover:text-[#282828] text-[20px] leading-none px-1">
                ×
              </button>
            )}
          </form>

          {/* Count, filters button (phones), sort */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-[14px] text-[#4a4a4a]" aria-live="polite">
              <strong className="text-[#282828]">{results.length}</strong> {results.length === 1 ? "product" : "products"}
              {(activeCount > 0 || query.trim()) && " match"}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => guard("filter", () => setSheetOpen(true))}
                className="lg:hidden inline-flex items-center gap-1.5 h-10 rounded-lg border border-[#282828] px-3.5 text-[14px] font-bold text-[#282828]"
              >
                Filters{activeCount > 0 && <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-[#248179] text-white text-[11px] px-1.5">{activeCount}</span>}
              </button>
              <label className="inline-flex items-center gap-2 text-[13px] text-[#4a4a4a]">
                <span className="hidden sm:inline">Sort</span>
                <select
                  value={effectiveSort}
                  onChange={(e) => changeSort(e.target.value as SortKey)}
                  aria-label="Sort products"
                  className="h-10 rounded-lg border border-[#e5dfd6] bg-white px-2.5 text-[14px] text-[#282828] outline-none focus:border-[#248179]"
                >
                  {sortOptions.map((k) => (
                    <option key={k} value={k}>{SORT_LABELS[k]}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* What is filtered */}
          {activeCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {FILTER_KEYS.flatMap((k) =>
                filters[k].map((v) => (
                  <button
                    key={`${k}:${v}`}
                    type="button"
                    onClick={() => toggleFilter(k, v)}
                    aria-label={`Remove filter ${FILTER_LABELS[k]}: ${v}`}
                    className="inline-flex items-center gap-1.5 h-8 rounded-full border border-[#248179] bg-[#e3f1ef] px-3 text-[13px] font-bold text-[#1d6b64] hover:bg-[#d3eae7] transition-colors"
                  >
                    {v}
                    <span aria-hidden className="text-[15px] leading-none">×</span>
                  </button>
                )),
              )}
              <button type="button" onClick={clearFilters} className="text-[13px] font-bold text-[#248179] hover:underline underline-offset-[3px] px-1">
                Clear all
              </button>
            </div>
          )}

          {/* Results */}
          {results.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {shown.map((p) => (
                  <MarketCard
                    key={productId(p)}
                    product={p}
                    comparing={comparingIds.includes(productId(p))}
                    compareFull={comparingIds.length >= MAX_COMPARE}
                    onCompare={toggleCompare}
                    onOpen={openLink}
                  />
                ))}
              </div>
              {results.length > shown.length && (
                <div className="flex flex-col items-center gap-2 pt-4">
                  <p className="text-[13px] text-[#4a4a4a]">Showing {shown.length} of {results.length}</p>
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="h-12 rounded-lg border border-[#282828] px-6 text-[14px] font-bold text-[#282828] hover:bg-[#e3f1ef] transition-colors"
                  >
                    Show more products
                  </button>
                </div>
              )}
            </>
          ) : query.trim() && activeCount === 0 ? (
            // A search nothing matches: offer to review that product now.
            <NoResultsCard query={query.trim()} />
          ) : (
            <div className="rounded-[14px] border border-[#e5dfd6] bg-white px-5 py-8 text-center">
              <h3 className="font-display font-light text-[26px] leading-[1.1] text-[#282828]">No products match</h3>
              <p className="mt-2 text-[14px] leading-[1.55] text-[#4a4a4a]">
                {activeCount > 0 ? "Try removing a filter, or " : "Try a different search, or "}
                <button type="button" onClick={clearAll} className="font-bold text-[#248179] hover:underline underline-offset-[3px]">start again</button>.
              </p>
            </div>
          )}

          <p className="text-[12px] text-[#b0a8a4] pt-2">Standings come from the Clean Sheet analyser. They are not certifications.</p>
        </div>
      </div>

      {/* Phone filter sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[210] flex flex-col bg-white lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="flex items-center justify-between px-5 h-14 border-b border-[#e5dfd6] flex-none">
            <span className="text-[16px] font-bold text-[#282828]">Filters</span>
            <button type="button" onClick={() => setSheetOpen(false)} aria-label="Close filters" className="h-10 w-10 -mr-2 flex items-center justify-center text-[24px] text-[#282828]">
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <FilterPanel facets={facets} filters={filters} onToggle={toggleFilter} />
          </div>
          <div className="flex-none flex items-center gap-3 px-5 py-3 border-t border-[#e5dfd6] bg-white pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={clearFilters}
              disabled={activeCount === 0}
              className="h-12 px-4 text-[14px] font-bold text-[#248179] disabled:text-[#b0a8a4]"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="flex-1 h-12 rounded-lg bg-[#248179] hover:bg-[#1d6b64] text-white text-[15px] font-bold transition-colors"
            >
              Show {results.length} {results.length === 1 ? "product" : "products"}
            </button>
          </div>
        </div>
      )}

      {/* Compare */}
      <ComparisonTray
        products={comparingProducts}
        onRemove={toggleCompare}
        onClearAll={() => setComparingIds([])}
        onCompare={() => setShowComparison(true)}
      />
      {comparingIds.length > 0 && <div className="h-20" />}
      {showComparison && comparingProducts.length >= 2 && (
        <ComparisonDecisionEngine products={comparingProducts} onClose={() => setShowComparison(false)} />
      )}
    </section>
  );
}
