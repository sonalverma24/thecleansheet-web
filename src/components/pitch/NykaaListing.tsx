"use client";

import { useMemo, useState } from "react";
import { Heart, Search, ShoppingBag, ChevronRight, Star } from "lucide-react";
import type { PitchProduct, PitchVerification } from "@/data/pitch/types";
import VerificationDialog, { STAMP_SRC } from "./VerificationDialog";

export type ListingProduct = PitchProduct & { verification: PitchVerification | null };

const RETAILER = "Nykaa";
const PINK = "#FC2779";
const INK = "#001325";

const SORTS = [
  { id: "popularity", label: "Popularity" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "discount", label: "Discount" },
] as const;
type SortId = (typeof SORTS)[number]["id"];

const PRICE_BUCKETS = [
  { id: "lt500", label: "Below ₹500", test: (p: number) => p < 500 },
  { id: "500-1000", label: "₹500 - ₹1000", test: (p: number) => p >= 500 && p < 1000 },
  { id: "1000-1500", label: "₹1000 - ₹1500", test: (p: number) => p >= 1000 && p < 1500 },
  { id: "gt1500", label: "Above ₹1500", test: (p: number) => p >= 1500 },
];

const NAV = ["Makeup", "Skin", "Hair", "Appliances", "Bath & Body", "Natural", "Mom & Baby", "Health & Wellness", "Men", "Fragrance"];

/* ── Card ───────────────────────────────────────────────────── */

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${n} out of 5 star rating`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className="h-[13px] w-[13px]" style={{ fill: i <= n ? INK : "none", color: i <= n ? INK : "#c8c8c8" }} aria-hidden />
      ))}
    </span>
  );
}

function Card({ p, onOpen }: { p: ListingProduct; onOpen: (id: string) => void }) {
  const img = p.image.replace("tr:w-220,h-220", "tr:w-480,h-480");
  return (
    <article className="group flex flex-col bg-white">
      <div className="relative aspect-square overflow-hidden rounded-md border border-[#eeeeee] bg-white">
        <a href={p.retailerUrl} target="_blank" rel="noopener noreferrer" className="block h-full w-full" tabIndex={-1} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" referrerPolicy="no-referrer" loading="lazy" className="h-full w-full object-contain p-3" />
        </a>
        {(p.bestseller || p.isNew) && (
          <span className="absolute left-0 top-2 rounded-r bg-[#e8f0fe] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#3f51b5]">
            {p.isNew ? "New" : "Bestseller"}
          </span>
        )}
        {p.verification && (
          <button
            type="button"
            onClick={() => onOpen(p.id)}
            aria-label={`View The Clean Sheet verification for ${p.name}`}
            className="absolute right-2 top-2 h-12 w-12 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.25)] outline-offset-2 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-[#248179] sm:h-16 sm:w-16"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={STAMP_SRC} alt="" width={56} height={56} className="h-full w-full" />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <h2 className="line-clamp-2 min-h-[2.6em] text-[13.5px] font-medium leading-[1.3]" style={{ color: INK, fontFamily: "Helvetica, Arial, sans-serif" }}>
          {p.name}
        </h2>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-[13px]">
          <span className="text-[#757575] line-through">₹{p.mrp}</span>
          <span className="text-[15px] font-bold" style={{ color: INK }}>₹{p.price}</span>
          <span className="font-bold text-[#0f9d58]">{p.off}% Off</span>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#757575]">
          <Stars n={p.stars} />
          <span>( {p.ratingCount} )</span>
        </div>
        <p className="mt-1.5 h-4 text-[12px] text-[#757575]">{p.sizes ? `${p.sizes} Size${p.sizes > 1 ? "s" : ""}` : ""}</p>
        <div className="mt-auto flex gap-2 pt-2">
          <button type="button" tabIndex={-1} aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#d6d6d6]">
            <Heart className="h-[18px] w-[18px]" style={{ color: INK }} />
          </button>
          <a
            href={p.retailerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 flex-1 items-center justify-center rounded text-[13px] font-bold text-white"
            style={{ background: PINK }}
          >
            Add to Bag
          </a>
        </div>
      </div>
    </article>
  );
}

/* ── Filters ────────────────────────────────────────────────── */

function VerifiedToggle({ on, onChange, compact = false }: { on: boolean; onChange: (v: boolean) => void; compact?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={
        compact
          ? "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[13px]"
          : "flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left text-[14px]"
      }
      style={{ borderColor: on ? "#248179" : "#d6d6d6", background: on ? "#EDF8F7" : "#fff", color: INK }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={STAMP_SRC} alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
      <span className="flex-1 font-medium">Clean Sheet Verified</span>
      {!compact && (
        <span className="relative h-5 w-9 shrink-0 rounded-full transition-colors" style={{ background: on ? "#248179" : "#cfcfcf" }}>
          <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all" style={{ left: on ? 18 : 2 }} />
        </span>
      )}
    </button>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[#ececec] py-4">
      <h3 className="mb-3 text-[14px] font-medium" style={{ color: INK, fontFamily: "Helvetica, Arial, sans-serif" }}>{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Check({ label, count, checked, onChange }: { label: string; count?: number; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px]" style={{ color: INK }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#FC2779]" />
      <span className="flex-1">{label}</span>
      {count != null && <span className="text-[12px] text-[#757575]">{count}</span>}
    </label>
  );
}

/* ── Page ───────────────────────────────────────────────────── */

export default function NykaaListing({ products, title, total }: { products: ListingProduct[]; title: string; total: number }) {
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [brands, setBrands] = useState<Set<string>>(new Set());
  const [buckets, setBuckets] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortId>("popularity");
  const [openId, setOpenId] = useState<string | null>(null);

  const brandCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) m.set(p.brand, (m.get(p.brand) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [products]);

  const shown = useMemo(() => {
    let list = products.map((p, i) => ({ p, i }));
    if (verifiedOnly) list = list.filter(({ p }) => p.verification);
    if (brands.size) list = list.filter(({ p }) => brands.has(p.brand));
    if (buckets.size) {
      const tests = PRICE_BUCKETS.filter((b) => buckets.has(b.id));
      list = list.filter(({ p }) => tests.some((b) => b.test(p.price)));
    }
    if (sort === "price-asc") list.sort((a, b) => a.p.price - b.p.price);
    if (sort === "price-desc") list.sort((a, b) => b.p.price - a.p.price);
    if (sort === "discount") list.sort((a, b) => b.p.off - a.p.off);
    return list.map(({ p }) => p);
  }, [products, verifiedOnly, brands, buckets, sort]);

  const filtered = verifiedOnly || brands.size > 0 || buckets.size > 0;
  const open = openId ? products.find((p) => p.id === openId && p.verification) : null;

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, key: string, on: boolean) => {
    const next = new Set(set);
    if (on) next.add(key);
    else next.delete(key);
    setter(next);
  };

  return (
    <div className="min-h-dvh bg-white" style={{ color: INK, fontFamily: "Helvetica, Arial, sans-serif" }}>
      {/* Header */}
      <header className="border-b border-[#ececec]">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 py-3 lg:gap-8 lg:px-6">
          <span className="text-[26px] font-bold lowercase leading-none tracking-tight" style={{ color: PINK }}>{RETAILER}</span>
          <nav className="hidden items-center gap-5 text-[14px] font-medium lg:flex">
            <span>Categories</span><span>Brands</span><span>Beauty Advice</span>
          </nav>
          <div className="ml-auto flex flex-1 items-center gap-2 rounded-md bg-[#f2f2f2] px-3 py-2 text-[13.5px] text-[#757575] lg:max-w-[300px] lg:flex-none">
            <Search className="h-4 w-4" aria-hidden />
            <span className="truncate">Search on {RETAILER}</span>
          </div>
          <span className="hidden rounded px-5 py-2 text-[13.5px] font-bold text-white sm:inline-block" style={{ background: PINK }}>Sign in</span>
          <ShoppingBag className="h-[22px] w-[22px] shrink-0" aria-hidden />
        </div>
        <nav className="no-scrollbar mx-auto flex max-w-[1280px] gap-5 overflow-x-auto px-4 pb-2.5 text-[13.5px] lg:px-6" aria-label="Categories">
          {NAV.map((n) => (
            <span key={n} className={`shrink-0 ${n === "Mom & Baby" ? "border-b-2 pb-1 font-bold" : "pb-1"}`} style={n === "Mom & Baby" ? { borderColor: PINK } : undefined}>{n}</span>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 pb-16 lg:px-6">
        <div className="flex items-center gap-1 py-3 text-[12.5px] text-[#757575]">
          <span>Home</span><ChevronRight className="h-3 w-3" aria-hidden /><span>Mom & Baby</span><ChevronRight className="h-3 w-3" aria-hidden /><span style={{ color: INK }}>Baby Care</span>
        </div>

        <h1 className="text-[22px] font-medium" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
          {title} <span className="text-[#757575]">({filtered ? shown.length : total})</span>
        </h1>

        {/* Mobile filter row */}
        <div className="no-scrollbar -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 lg:hidden">
          <VerifiedToggle on={verifiedOnly} onChange={setVerifiedOnly} compact />
          <select
            aria-label="Sort by"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortId)}
            className="shrink-0 rounded-full border border-[#d6d6d6] bg-white px-3 py-2 text-[13px]"
          >
            {SORTS.map((s) => <option key={s.id} value={s.id}>Sort: {s.label}</option>)}
          </select>
        </div>

        <div className="mt-4 flex gap-8">
          {/* Sidebar */}
          <aside className="hidden w-[250px] shrink-0 lg:block">
            <div className="pb-4">
              <label htmlFor="sort" className="mb-2 block text-[13px] text-[#757575]">Sort By</label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortId)}
                className="w-full rounded-md border border-[#d6d6d6] bg-white px-3 py-2.5 text-[14px]"
              >
                {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className="border-t border-[#ececec] py-4">
              <VerifiedToggle on={verifiedOnly} onChange={setVerifiedOnly} />
            </div>
            <FilterGroup title="Brand">
              {brandCounts.map(([b, n]) => (
                <Check key={b} label={b} count={n} checked={brands.has(b)} onChange={(on) => toggle(brands, setBrands, b, on)} />
              ))}
            </FilterGroup>
            <FilterGroup title="Price">
              {PRICE_BUCKETS.map((b) => (
                <Check key={b.id} label={b.label} checked={buckets.has(b.id)} onChange={(on) => toggle(buckets, setBuckets, b.id, on)} />
              ))}
            </FilterGroup>
          </aside>

          {/* Grid */}
          <div className="min-w-0 flex-1">
            {shown.length === 0 ? (
              <p className="py-16 text-center text-[14px] text-[#757575]">No products match these filters.</p>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 lg:grid-cols-3">
                {shown.map((p) => <Card key={p.id} p={p} onOpen={setOpenId} />)}
              </div>
            )}
            <p className="mt-10 text-center text-[13px] text-[#757575]">Page 1 of 30</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#ececec] bg-[#fafafa] px-4 py-5 text-center text-[12px] text-[#757575]">
        Concept preview by The Clean Sheet. Not live on {RETAILER}.
      </footer>

      {open && open.verification && (
        <VerificationDialog
          product={open}
          verification={open.verification}
          retailer={RETAILER}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
