"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PortfolioStanding, StandingColor, StandingCounts } from "@/lib/brand-directory";
import BrandLogo from "./BrandLogo";

export interface BrandCardData {
  slug: string;
  name: string;
  description: string | null;
  founded: string | null;
  logoUrl: string | null;
  countryOfOrigin: string | null;
  indiaPresence: string | null;
  globalPresence: string | null;
  counts: StandingCounts;
  ratedCount: number;
  standing: PortfolioStanding;
  leadingColor: StandingColor | null;
}

const COLOR: Record<StandingColor, string> = {
  green: "#248179", yellow: "#D2A63C", red: "#FD6158", unrated: "#B0A8A4",
};
const NAMES: Record<PortfolioStanding, string> = {
  green: "Mostly Green", yellow: "Mostly Yellow", red: "Mostly Red",
  mixed: "Mixed", limited: "Limited coverage", unrated: "Not rated",
};

export type BrandSort = "products" | "name";

/** Products analysed for a brand, whether or not each has a rating yet. */
export const productCountOf = (b: Pick<BrandCardData, "counts">): number => b.counts.green + b.counts.yellow + b.counts.red + b.counts.unrated;

/** "products": most products analysed first, then most rated, then A to Z. "name": A to Z. Sorts a copy. */
export function sortBrands<T extends Pick<BrandCardData, "counts" | "ratedCount" | "name">>(brands: readonly T[], sort: BrandSort): T[] {
  return [...brands].sort((a, b) => sort === "products"
    ? productCountOf(b) - productCountOf(a) || b.ratedCount - a.ratedCount || a.name.localeCompare(b.name)
    : a.name.localeCompare(b.name));
}

function Distribution({ counts }: { counts: StandingCounts }) {
  const total = counts.green + counts.yellow + counts.red + counts.unrated;
  return (
    <div>
      <div role="img" aria-label={String(counts.green) + " green, " + String(counts.yellow) + " yellow, " + String(counts.red) + " red, " + String(counts.unrated) + " not rated"} className="h-2.5 overflow-hidden rounded-full flex bg-[#f1eeea]">
        {(["green", "yellow", "red", "unrated"] as const).map((color) => (
          counts[color] > 0 ? <span key={color} style={{ width: String((counts[color] / total) * 100) + "%", background: COLOR[color] }} /> : null
        ))}
      </div>
      <p className="mt-2 text-[12px] text-[#6c6865]">
        {counts.green} green · {counts.yellow} yellow · {counts.red} red
        {counts.unrated > 0 ? " · " + counts.unrated + " unrated" : ""}
      </p>
    </div>
  );
}

export default function BrandDirectoryClient({ brands }: { brands: BrandCardData[] }) {
  const [search, setSearch] = useState("");
  const [standing, setStanding] = useState("all");
  const [sort, setSort] = useState<BrandSort>("products");

  const shown = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = brands.filter((brand) => {
      const searchMatch = !query || [brand.name, brand.description, brand.countryOfOrigin].some((part) => part?.toLowerCase().includes(query));
      return searchMatch && (standing === "all" || brand.standing === standing);
    });
    return sortBrands(filtered, sort);
  }, [brands, search, standing, sort]);

  return (
    <section className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12 pb-24">
      <div className="rounded-2xl border border-[#e5dfd6] bg-[#f7faf9] p-4 sm:p-5 mb-7">
        <div className="grid gap-3 md:grid-cols-[1fr_210px_180px]">
          <label className="block">
            <span className="sr-only">Search brands</span>
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search a brand" className="w-full h-12 rounded-xl border border-[#ddd9d4] bg-white px-4 text-[15px] outline-none focus:border-[#248179]" />
          </label>
          <label className="block">
            <span className="sr-only">Filter by portfolio standing</span>
            <select value={standing} onChange={(e) => setStanding(e.target.value)}
              className="w-full h-12 rounded-xl border border-[#ddd9d4] bg-white px-3 text-[14px] text-[#282828]">
              <option value="all">All standings</option>
              <option value="green">Mostly Green</option>
              <option value="yellow">Mostly Yellow</option>
              <option value="red">Mostly Red</option>
              <option value="mixed">Mixed</option>
              <option value="limited">Limited coverage</option>
              <option value="unrated">Not rated</option>
            </select>
          </label>
          <label className="block">
            <span className="sr-only">Sort brands</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as BrandSort)}
              className="w-full h-12 rounded-xl border border-[#ddd9d4] bg-white px-3 text-[14px] text-[#282828]">
              <option value="products">Most products first</option>
              <option value="name">Alphabetical</option>
            </select>
          </label>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 mb-5">
        <h2 className="font-display font-light text-[26px] sm:text-[32px] text-[#282828]">Brands we have covered</h2>
        <span aria-live="polite" className="text-[13px] text-[#77716d] shrink-0">{shown.length} brands</span>
      </div>
      {shown.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {shown.map((brand) => (
            <Link key={brand.slug} href={"/brands/" + brand.slug}
              className="group flex h-full flex-col gap-4 rounded-2xl border border-[#e5dfd6] bg-white p-5 hover:border-[#248179] hover:shadow-lg hover:shadow-[#248179]/5 transition-all">
              <div className="flex items-start gap-3">
                <BrandLogo name={brand.name} logoUrl={brand.logoUrl} size={52} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-light text-[25px] leading-tight text-[#282828] group-hover:text-[#248179] break-words">{brand.name}</h3>
                  <span className="mt-2 inline-block text-[11px] text-[#4a4a4a] rounded-full border border-[#e5dfd6] px-2.5 py-1">{NAMES[brand.standing]}</span>
                </div>
              </div>
              <p className="text-[14px] leading-[1.5] text-[#555] line-clamp-2 min-h-[42px]">
                {brand.description ?? "An independent assessment of this brand's products is in progress."}
              </p>
              <p className="text-[12px] text-[#837d78]">
                {brand.founded ? "Founded " + brand.founded : "Founding year not verified"}
                {brand.countryOfOrigin ? " · " + brand.countryOfOrigin : ""}
              </p>
              <div className="mt-auto pt-2">
                <Distribution counts={brand.counts} />
                <div className="mt-4 pt-3 border-t border-[#eee9e4] flex items-center justify-between text-[13px]">
                  <span className="text-[#4a4a4a]">{productCountOf(brand)} {productCountOf(brand) === 1 ? "product" : "products"} · {brand.ratedCount} rated</span>
                  <span className="font-medium text-[#248179]">Explore brand →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#e5dfd6] p-10 text-center text-[#77716d]">
          No brands match. Try another search or standing.
        </div>
      )}
    </section>
  );
}
