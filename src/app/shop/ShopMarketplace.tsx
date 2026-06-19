"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createBrowserClient } from "@supabase/ssr";
import {
  SlidersHorizontal, X, Search, Heart, GitCompare,
  ChevronDown, ExternalLink, ArrowUpDown, Loader2,
} from "lucide-react";

// ── Supabase product type ─────────────────────────────────────────────────────
type DbProduct = {
  id: string;
  brand_name: string;
  brand_slug: string;
  product_name: string;
  slug: string;
  category: string | null;
  subcategory: string | null;
  mrp: number | null;
  price_min: number | null;
  price_max: number | null;
  price_per_ml: number | null;
  product_image_url: string | null;
  fragrance_free: boolean;
  skin_type_tags: string[] | null;
  concern_tags: string[] | null;
  suitability_tags: string[] | null;
  caution_tags: string[] | null;
  status: string | null;
  analyzed_at: string | null;
  product_scores: Array<{
    total_score: number;
    score_label: string | null;
    verdict: string | null;
  }>;
};

// ── helpers ───────────────────────────────────────────────────────────────────
function scoreBand(score: number) {
  if (score >= 90) return { label: "Excellent",      color: "#248179", bg: "rgba(36,129,121,0.08)"  };
  if (score >= 75) return { label: "Good",           color: "#248179", bg: "rgba(36,129,121,0.08)"  };
  if (score >= 60) return { label: "Fair",           color: "#D97706", bg: "rgba(217,119,6,0.08)"   };
  return             { label: "Use with Caution", color: "#fd6158", bg: "rgba(253,97,88,0.08)"   };
}

function formatPrice(p: DbProduct) {
  if (p.mrp)       return `₹${p.mrp}`;
  if (p.price_max) return p.price_min && p.price_min !== p.price_max
    ? `₹${p.price_min}–${p.price_max}` : `₹${p.price_max}`;
  return null;
}

const ALL_CATEGORIES = [
  "Serum","Moisturiser","Sunscreen","Cleanser","Toner",
  "Eye Cream","Mask","Treatment","Body Care","Hair Care",
];

const SORT_OPTIONS = [
  { value: "score_desc", label: "Highest Score"     },
  { value: "score_asc",  label: "Lowest Concern"    },
  { value: "price_asc",  label: "Lowest Price / ml" },
  { value: "newest",     label: "Newest Analysed"   },
  { value: "alpha",      label: "A – Z"             },
];

// ── Score Badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const band = scoreBand(score);
  return (
    <div
      className="flex items-center justify-center w-10 h-10 rounded-full"
      style={{
        background: band.bg,
        color: band.color,
        fontFamily: "Helvetica, Arial, sans-serif",
        fontWeight: 400,
        fontSize: 13,
        border: `1.5px solid ${band.color}30`,
      }}
    >
      {score}
    </div>
  );
}

// ── Status Label ──────────────────────────────────────────────────────────────
function StatusLabel({ status }: { status: string | null }) {
  const s = status ?? "Public Data Review";
  const short = s === "Certified Product"  ? "Certified" :
                s === "Verified Scorecard" ? "Verified"  : "Analysed";
  const colors =
    s === "Certified Product"  ? { text: "#248179", bg: "rgba(36,129,121,0.08)",  border: "rgba(36,129,121,0.2)"  } :
    s === "Verified Scorecard" ? { text: "#248179", bg: "rgba(36,129,121,0.06)",  border: "rgba(36,129,121,0.15)" } :
                                 { text: "#b0a8a4", bg: "rgba(176,168,164,0.08)", border: "rgba(176,168,164,0.2)" };
  return (
    <span
      className="text-[10px] tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ color: colors.text, background: colors.bg, border: `1px solid ${colors.border}`, fontFamily: "Helvetica, Arial, sans-serif" }}
    >
      {short}
    </span>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, saved, onSave }: { product: DbProduct; saved: boolean; onSave: () => void }) {
  const score = product.product_scores?.[0]?.total_score ?? 0;
  const band  = scoreBand(score);
  const href  = `/brands/${product.brand_slug}/${product.slug}`;
  const topPill    = product.skin_type_tags?.[0] ?? product.concern_tags?.[0] ?? null;
  const secondPill = product.fragrance_free ? "Fragrance-free" : product.caution_tags?.[0] ?? null;
  const price = formatPrice(product);

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#b0a8a4]/15 hover:border-[#248179]/25 hover:shadow-lg hover:shadow-[#248179]/6 transition-all duration-200">
      {/* Image */}
      <Link href={href} className="block relative aspect-[4/3] bg-[#f7f6f6] overflow-hidden">
        {product.product_image_url ? (
          <Image
            src={product.product_image_url}
            alt={product.product_name}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[11px] text-[#b0a8a4] tracking-wider uppercase"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              {product.brand_name}
            </span>
          </div>
        )}
        <div className="absolute top-2.5 right-2.5">
          <ScoreBadge score={score} />
        </div>
        <button
          onClick={e => { e.preventDefault(); onSave(); }}
          className="absolute top-2.5 left-2.5 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
          aria-label={saved ? "Unsave" : "Save"}
        >
          <Heart size={14} strokeWidth={1.5}
            fill={saved ? "#fd6158" : "none"}
            className={saved ? "text-[#fd6158]" : "text-[#b0a8a4]"}
          />
        </button>
      </Link>

      {/* Info */}
      <Link href={href} className="flex flex-col flex-1 p-3 gap-1.5">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] tracking-widest text-[#b0a8a4] uppercase truncate"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            {product.brand_name}
          </span>
          <StatusLabel status={product.status} />
        </div>

        <p className="text-[13px] text-[#282828] leading-snug line-clamp-2"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
          {product.product_name}
        </p>

        <span className="text-[11px] text-[#b0a8a4]"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
          {product.category ?? product.subcategory ?? ""}
        </span>

        {(topPill || secondPill) && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {topPill && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-[#248179]/6 text-[#248179] truncate max-w-[120px]"
                style={{ fontFamily: "Helvetica, Arial, sans-serif", minHeight: 24 }}>
                {topPill}
              </span>
            )}
            {secondPill && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-[#b0a8a4]/10 text-[#b0a8a4] truncate max-w-[120px]"
                style={{ fontFamily: "Helvetica, Arial, sans-serif", minHeight: 24 }}>
                {secondPill}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-1.5 flex items-center justify-between">
          <span className="text-[13px] text-[#282828]"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            {price ?? ""}
          </span>
          <ExternalLink size={12} className="text-[#b0a8a4]" strokeWidth={1.5} />
        </div>
      </Link>
    </div>
  );
}

// ── Filters ───────────────────────────────────────────────────────────────────
interface Filters {
  categories: string[];
  brands: string[];
  minScore: number;
  fragranceFree: boolean;
  pregnancyCaution: boolean;
  babySafe: boolean;
}
const DEFAULT_FILTERS: Filters = { categories: [], brands: [], minScore: 0, fragranceFree: false, pregnancyCaution: false, babySafe: false };

function FilterPanel({ filters, setFilters, allBrandNames, onClose }: {
  filters: Filters; setFilters: (f: Filters) => void; allBrandNames: string[]; onClose?: () => void;
}) {
  const toggle = <K extends "categories" | "brands">(key: K, val: string) => {
    const arr = filters[key] as string[];
    setFilters({ ...filters, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] });
  };
  const pill = (active: boolean) =>
    `text-[12px] px-3 rounded-full cursor-pointer select-none transition-all duration-150 ${
      active ? "bg-[#248179] text-white border border-[#248179]"
             : "bg-white text-[#282828] border border-[#b0a8a4]/30 hover:border-[#248179]/40"
    }`;

  return (
    <div className="flex flex-col gap-6 p-4">
      {onClose && (
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-[#282828]" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>Filters</span>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/5">
            <X size={16} strokeWidth={1.5} className="text-[#b0a8a4]" />
          </button>
        </div>
      )}
      <div>
        <p className="text-[11px] tracking-widest uppercase text-[#b0a8a4] mb-2" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>Minimum Score</p>
        <div className="flex flex-wrap gap-1.5">
          {[0, 60, 75, 90].map(v => (
            <button key={v} onClick={() => setFilters({ ...filters, minScore: v })}
              className={pill(filters.minScore === v)} style={{ fontFamily: "Helvetica, Arial, sans-serif", minHeight: 32 }}>
              {v === 0 ? "All" : `${v}+`}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] tracking-widest uppercase text-[#b0a8a4] mb-2" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>Category</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => toggle("categories", cat)}
              className={pill(filters.categories.includes(cat))} style={{ fontFamily: "Helvetica, Arial, sans-serif", minHeight: 32 }}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] tracking-widest uppercase text-[#b0a8a4] mb-2" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>Brand</p>
        <div className="flex flex-wrap gap-1.5">
          {allBrandNames.map(b => (
            <button key={b} onClick={() => toggle("brands", b)}
              className={pill(filters.brands.includes(b))} style={{ fontFamily: "Helvetica, Arial, sans-serif", minHeight: 32 }}>
              {b}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] tracking-widest uppercase text-[#b0a8a4] mb-2" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>Suitability</p>
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "fragranceFree",    label: "Fragrance-free" },
            { key: "pregnancyCaution", label: "Pregnancy Safe" },
            { key: "babySafe",         label: "Baby Safe"      },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilters({ ...filters, [key]: !filters[key as keyof Filters] })}
              className={pill(!!filters[key as keyof Filters])} style={{ fontFamily: "Helvetica, Arial, sans-serif", minHeight: 32 }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => setFilters(DEFAULT_FILTERS)}
        className="text-[12px] text-[#b0a8a4] hover:text-[#fd6158] transition-colors mt-1"
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
        Reset all filters
      </button>
    </div>
  );
}

// ── Main Marketplace ──────────────────────────────────────────────────────────
export default function ShopMarketplace() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filters, setFilters]   = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort]         = useState("score_desc");
  const [saved, setSaved]       = useState<Set<string>>(new Set());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sortOpen, setSortOpen]   = useState(false);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, brand_name, brand_slug, product_name, slug, category, subcategory, mrp, price_min, price_max, price_per_ml, product_image_url, fragrance_free, skin_type_tags, concern_tags, suitability_tags, caution_tags, status, analyzed_at")
      .then(async ({ data: productData, error: productError }) => {
        if (productError || !productData) { setLoading(false); return; }

        const { data: scoresData } = await supabase
          .from("product_scores")
          .select("product_id, total_score, score_label, verdict");

        const scoresMap = new Map((scoresData ?? []).map(s => [s.product_id, s]));
        const merged = productData.map(p => ({
          ...p,
          product_scores: scoresMap.has(p.id) ? [scoresMap.get(p.id)!] : [],
        }));
        setProducts(merged as DbProduct[]);
        setLoading(false);
      });
  }, []);

  const allBrandNames = useMemo(
    () => [...new Set(products.map(p => p.brand_name))].sort(),
    [products]
  );

  const filtered = useMemo(() => {
    let list = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.product_name.toLowerCase().includes(q) ||
        p.brand_name.toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q) ||
        (p.concern_tags ?? []).some(t => t.toLowerCase().includes(q))
      );
    }
    if (filters.categories.length)
      list = list.filter(p => filters.categories.some(c =>
        (p.category ?? p.subcategory ?? "").toLowerCase().includes(c.toLowerCase())
      ));
    if (filters.brands.length)
      list = list.filter(p => filters.brands.includes(p.brand_name));
    if (filters.minScore > 0)
      list = list.filter(p => (p.product_scores?.[0]?.total_score ?? 0) >= filters.minScore);
    if (filters.fragranceFree)
      list = list.filter(p => p.fragrance_free);
    if (filters.babySafe)
      list = list.filter(p => !(p.caution_tags ?? []).some(t => t.toLowerCase().includes("baby")));

    return [...list].sort((a, b) => {
      const sa = a.product_scores?.[0]?.total_score ?? 0;
      const sb = b.product_scores?.[0]?.total_score ?? 0;
      if (sort === "score_desc") return sb - sa;
      if (sort === "score_asc")  return sa - sb;
      if (sort === "price_asc")  return (a.price_per_ml ?? 999) - (b.price_per_ml ?? 999);
      if (sort === "alpha")      return a.product_name.localeCompare(b.product_name);
      if (sort === "newest")     return (b.analyzed_at ?? "").localeCompare(a.analyzed_at ?? "");
      return sb - sa;
    });
  }, [products, search, filters, sort]);

  const toggleSave = useCallback((key: string) => {
    setSaved(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }, []);

  const activeFilterCount =
    filters.categories.length + filters.brands.length +
    (filters.minScore > 0 ? 1 : 0) +
    (filters.fragranceFree ? 1 : 0) +
    (filters.pregnancyCaution ? 1 : 0) +
    (filters.babySafe ? 1 : 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#b0a8a4]/15 bg-white sticky top-0 lg:top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={15} strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0a8a4] pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products, brands, concerns…"
                className="w-full pl-9 pr-4 py-2.5 rounded-full bg-[#f7f6f6] border border-[#b0a8a4]/20 text-[13px] text-[#282828] placeholder-[#b0a8a4] focus:outline-none focus:border-[#248179]/40 focus:bg-white transition-all"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              />
            </div>
            <button onClick={() => setSheetOpen(true)}
              className="lg:hidden relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-[#b0a8a4]/30 text-[#282828] hover:border-[#248179]/40 transition-colors">
              <SlidersHorizontal size={15} strokeWidth={1.5} />
              <span className="text-[13px]" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>Filter</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#fd6158] text-white text-[9px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div className="relative">
              <button onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-[#b0a8a4]/30 text-[#282828] hover:border-[#248179]/40 transition-colors">
                <ArrowUpDown size={14} strokeWidth={1.5} />
                <span className="text-[13px] hidden sm:block" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                  {SORT_OPTIONS.find(o => o.value === sort)?.label ?? "Sort"}
                </span>
                <ChevronDown size={13} strokeWidth={1.5} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#b0a8a4]/20 rounded-2xl shadow-xl overflow-hidden z-50">
                  {SORT_OPTIONS.map(o => (
                    <button key={o.value} onClick={() => { setSort(o.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-[13px] transition-colors hover:bg-[#248179]/5 ${sort === o.value ? "text-[#248179]" : "text-[#282828]"}`}
                      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-[11px] text-[#b0a8a4] mt-2" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            {loading ? "Loading…" : `${filtered.length} product${filtered.length !== 1 ? "s" : ""}${activeFilterCount > 0 ? ` · ${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active` : ""}`}
          </p>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-[8rem] bg-white rounded-2xl border border-[#b0a8a4]/15 overflow-hidden">
              <FilterPanel filters={filters} setFilters={setFilters} allBrandNames={allBrandNames} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 size={20} strokeWidth={1.5} className="text-[#248179] animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-[15px] text-[#282828] mb-2" style={{ fontFamily: "Cooper BT, Georgia, serif" }}>
                  No products found
                </p>
                <p className="text-[13px] text-[#b0a8a4] mb-6" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                  Try adjusting your filters or search query
                </p>
                <button onClick={() => { setSearch(""); setFilters(DEFAULT_FILTERS); }}
                  className="text-[13px] text-[#248179] border border-[#248179]/30 px-4 py-2 rounded-full hover:bg-[#248179]/5 transition-colors"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                  Clear all
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filtered.map(p => {
                  const key = `${p.brand_slug}/${p.slug}`;
                  return (
                    <ProductCard key={p.id} product={p} saved={saved.has(key)} onSave={() => toggleSave(key)} />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      {sheetOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50 lg:hidden" onClick={() => setSheetOpen(false)} />
          <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto">
            <div className="w-10 h-1 bg-[#b0a8a4]/30 rounded-full mx-auto mt-3 mb-1" />
            <FilterPanel filters={filters} setFilters={setFilters} allBrandNames={allBrandNames} onClose={() => setSheetOpen(false)} />
            <div className="px-4 pb-6 pt-2">
              <button onClick={() => setSheetOpen(false)}
                className="w-full py-3.5 rounded-full bg-[#248179] text-white text-[14px]"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                Show {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
