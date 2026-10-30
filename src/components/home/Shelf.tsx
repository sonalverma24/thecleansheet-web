"use client";

import { RatingDot } from "@/components/scorecards/RatingDot";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ShelfCard } from "@/lib/home-shelf";

/* The product shelf. Cards are real stored reviews with their real standing; the
   category chips are the only client-side state. On a phone the chips and the cards
   swipe sideways (snap to each card), as in the mobile design; from tablet up the
   cards sit in a grid. */

export default function Shelf({ cards, categories }: { cards: ShelfCard[]; categories: string[] }) {
  const [filter, setFilter] = useState("All");
  const shown = filter === "All" ? cards : cards.filter((c) => c.category === filter);

  return (
    <section id="shelf" className="scroll-mt-24 max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pb-14 sm:pb-28 flex flex-col gap-5 md:gap-9">
      <div className="flex flex-wrap items-end justify-between gap-3 md:gap-8">
        <div className="flex flex-col gap-3 md:gap-4">
          <span className="text-[10px] md:text-[12px] font-bold tracking-[0.18em] text-[#248179]">01 · THE ANALYSER</span>
          <h2 className="font-display font-light text-[clamp(36px,4.6vw,60px)] leading-[1.05] md:leading-[1.02] tracking-[-0.02em] text-[#282828]">
            Find products worth
            <br className="hidden md:block" /> a closer look.
          </h2>
        </div>
        <p className="text-[14px] md:text-[15px] leading-[1.55] md:leading-[1.6] text-[#4a4a4a] max-w-[380px]">
          Browse by what matters to you. Public claim analyses and independent certification are clearly separated, so
          you always know what was actually checked.
        </p>
      </div>

      {cards.length > 0 && categories.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap md:gap-2.5 md:overflow-visible"
          role="group"
          aria-label="Filter by product type"
        >
          {["All", ...categories].map((c) => {
            const on = c === filter;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(c)}
                className={`flex-none whitespace-nowrap h-[38px] md:h-auto rounded-full border px-4 md:px-[18px] md:py-[9px] text-[13px] font-bold transition-colors ${
                  on ? "bg-[#248179] border-[#248179] text-white" : "bg-white border-[#e5dfd6] text-[#282828] hover:border-[#248179]"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {shown.length > 0 && (
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-5 no-scrollbar -mx-5 px-5 pb-1 md:mx-0 md:px-0 md:pb-0 md:overflow-visible md:grid md:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {shown.map((p) => (
            <Link
              key={p.slug}
              href={p.href}
              className="group flex flex-col flex-none w-[236px] snap-start md:w-auto bg-white border border-[#e5dfd6] rounded-[14px] overflow-hidden transition-[box-shadow,transform] duration-[240ms] md:hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(40,40,40,0.08),0_18px_40px_rgba(40,40,40,0.10)]"
            >
              <div className="relative aspect-square border-b border-[#e5dfd6] bg-white">
                {p.image && (
                  <Image
                    src={p.image}
                    alt={`${p.brand} ${p.name}`}
                    fill
                    sizes="(min-width: 1024px) 280px, (min-width: 768px) 45vw, 236px"
                    className="object-contain p-3"
                  />
                )}
                <span className="absolute top-2.5 left-2.5 md:top-3 md:left-3 text-[9px] md:text-[10px] tracking-[0.12em] text-[#4a4a4a] border border-[#e5dfd6] rounded-[4px] px-1.5 md:px-[7px] py-[3px] bg-white">
                  {p.category}
                </span>
              </div>
              <div className="p-3.5 md:p-5 flex flex-col gap-2 md:gap-2.5 flex-1">
                <span className="text-[10px] md:text-[11px] font-bold tracking-[0.18em] text-[#4a4a4a] uppercase">{p.brand}</span>
                <span className="font-bold text-[15px] md:text-[16px] leading-[1.3] text-[#282828]">{p.name}</span>
                <span className="self-start py-0.5 pl-0.5"><RatingDot marker={p.marker} size={14} /></span>
                <span className="text-[12px] md:text-[13px] text-[#4a4a4a] leading-[1.45] md:leading-[1.5] flex-1 line-clamp-4">{p.note}</span>
                <span className="flex justify-between pt-2.5 md:pt-3 border-t border-[#e5dfd6] text-[13px] font-bold text-[#248179]">
                  <span>View the proof</span>
                  <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 w-full md:w-auto h-12 md:h-auto rounded-lg border border-[#282828] px-[18px] md:py-[11px] text-[14px] font-bold text-[#282828] hover:bg-[#e3f1ef] transition-colors"
        >
          Browse all products
        </Link>
        <p className="text-[12px] text-[#b0a8a4]">
          Standings come from the Clean Sheet analyser. They are not certifications.
        </p>
      </div>
    </section>
  );
}
