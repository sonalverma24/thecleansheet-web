"use client";

import { useState } from "react";

/* Accordion for the For Brands FAQ: one answer open at a time, the first open by default. */

export default function BrandsFaq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="border-t border-[#e5dfd6]">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="border-b border-[#e5dfd6]">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 text-left min-h-[60px] py-4 md:py-[22px] text-[16px] md:text-[17px] font-bold text-[#282828]"
            >
              <span>{f.q}</span>
              <span aria-hidden className="text-[22px] font-light text-[#248179]">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && <p className="text-[15px] leading-[1.65] md:leading-[1.7] text-[#4a4a4a] pb-[18px] md:pb-[22px] pr-6 md:pr-8">{f.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
