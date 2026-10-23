"use client";

import { useState } from "react";
import { FILTER_KEYS, FILTER_LABELS, type Facets, type FilterKey, type RegistryFilters } from "@/lib/registry-filters";

/* The filter groups for the /brands marketplace: Standing, Product type, Brand,
   Price, Key active, Suitable for. Each is a tick list with a live count; groups
   with nothing to choose are left out. Long lists show the first few and a
   "Show more". The same panel sits in the sidebar on desktop and in the sheet on phones. */

const OPEN_BY_DEFAULT: FilterKey[] = ["standing", "category", "brand", "price"];
const SHOWN = 6;

function Group({
  name,
  options,
  chosen,
  onToggle,
}: {
  name: FilterKey;
  options: Facets[FilterKey];
  chosen: string[];
  onToggle: (key: FilterKey, value: string) => void;
}) {
  const [all, setAll] = useState(false);
  const [open, setOpen] = useState(OPEN_BY_DEFAULT.includes(name) || chosen.length > 0);
  // A ticked choice always stays in view, even when the list is collapsed.
  const head = options.slice(0, SHOWN);
  const visible = all ? options : [...head, ...options.slice(SHOWN).filter((o) => chosen.includes(o.value))];
  const more = options.length - visible.length;

  return (
    <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)} className="group border-b border-[#e5dfd6] py-4 first:pt-0">
      <summary className="flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="text-[12px] font-bold tracking-[0.14em] uppercase text-[#282828]">
          {FILTER_LABELS[name]}
          {chosen.length > 0 && <span className="ml-1.5 text-[#248179]">· {chosen.length}</span>}
        </span>
        <span aria-hidden className="text-[#4a4a4a] text-[18px] leading-none w-4 text-center group-open:hidden">+</span>
        <span aria-hidden className="text-[#4a4a4a] text-[18px] leading-none w-4 text-center hidden group-open:inline">−</span>
      </summary>
      <ul className="mt-3 flex flex-col gap-0.5">
        {visible.map((o) => {
          const on = chosen.includes(o.value);
          return (
            <li key={o.value}>
              <label className="flex items-center gap-2.5 min-h-[36px] cursor-pointer rounded-md px-1 hover:bg-[#f4faf9]">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => onToggle(name, o.value)}
                  className="h-4 w-4 flex-none rounded-[4px] border-[#b0a8a4] accent-[#248179]"
                />
                <span className={`flex-1 min-w-0 text-[14px] leading-[1.3] ${on ? "font-bold text-[#282828]" : "text-[#4a4a4a]"}`}>{o.value}</span>
                <span className={`text-[12px] tabular-nums ${o.count === 0 ? "text-[#d0c8c4]" : "text-[#b0a8a4]"}`}>{o.count}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {(more > 0 || all) && options.length > SHOWN && (
        <button
          type="button"
          onClick={() => setAll((v) => !v)}
          className="mt-2 text-[13px] font-bold text-[#248179] hover:underline underline-offset-[3px]"
        >
          {all ? "Show fewer" : `Show ${more} more`}
        </button>
      )}
    </details>
  );
}

export default function FilterPanel({
  facets,
  filters,
  onToggle,
}: {
  facets: Facets;
  filters: RegistryFilters;
  onToggle: (key: FilterKey, value: string) => void;
}) {
  return (
    <div>
      {FILTER_KEYS.filter((k) => facets[k].length > 0).map((k) => (
        <Group key={k} name={k} options={facets[k]} chosen={filters[k]} onToggle={onToggle} />
      ))}
    </div>
  );
}
