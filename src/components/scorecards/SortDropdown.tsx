"use client";
import { ChevronDown } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import type { SortOption } from "./ScorecardDiscovery";

interface SortDropdownProps {
  value: SortOption;
  onChange: (v: SortOption) => void;
  hasQuery: boolean;
  hasPriceData: boolean;
}

const SORT_OPTIONS: { value: SortOption; label: string; requiresPrice?: boolean }[] = [
  { value: "best_match",     label: "Best match" },
  { value: "score_desc",     label: "Highest score" },
  { value: "score_asc",      label: "Lowest score" },
  { value: "price_asc",      label: "Lowest price",       requiresPrice: true },
  { value: "price_desc",     label: "Highest price",      requiresPrice: true },
  { value: "value_desc",     label: "Best value (per ml)", requiresPrice: true },
  { value: "fewest_cautions",label: "Fewest caution flags" },
  { value: "newest",         label: "Newest scorecard" },
];

export function SortDropdown({ value, onChange, hasQuery, hasPriceData }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.label ?? "Sort";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const visibleOptions = SORT_OPTIONS.filter((o) => {
    if (o.value === "best_match" && !hasQuery) return false;
    if (o.requiresPrice && !hasPriceData) return false;
    return true;
  });

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="inline-flex items-center gap-2 bg-white border border-ink-200 text-ink-700 text-xs px-3 py-2 rounded-xl hover:border-teal-300 hover:text-teal-700 transition-colors font-sans"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-ink-400 mr-0.5">Sort:</span>
        {currentLabel}
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-30 bg-white border border-ink-200 rounded-xl shadow-lg py-1 min-w-[180px]"
          role="listbox"
        >
          {visibleOptions.map((opt) => (
            <button
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-xs hover:bg-teal-50 hover:text-teal-700 transition-colors ${
                opt.value === value ? "text-teal-700 font-medium bg-teal-50" : "text-ink-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
