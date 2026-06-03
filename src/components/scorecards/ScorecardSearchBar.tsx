"use client";
import { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

const PLACEHOLDERS = [
  "Search vitamin C serum, sunscreen, niacinamide...",
  "Search by product, brand, active, or concern",
  "Try: fragrance free, retinol, baby safe, acne...",
];

interface ScorecardSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  isSearching: boolean;
}

export function ScorecardSearchBar({
  value,
  onChange,
  resultCount,
  isSearching,
}: ScorecardSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const placeholderIdx = useRef(0);

  // Rotate placeholder on focus
  const getPlaceholder = () => PLACEHOLDERS[placeholderIdx.current % PLACEHOLDERS.length];

  const handleFocus = () => {
    placeholderIdx.current += 1;
  };

  useEffect(() => {
    // Auto-focus on mount
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center bg-white border border-ink-200 rounded-2xl shadow-sm focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 transition-all">
        <Search
          size={18}
          className="ml-4 text-ink-400 flex-shrink-0"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          placeholder={getPlaceholder()}
          className="flex-1 bg-transparent px-3 py-3.5 text-ink-950 placeholder:text-ink-400 text-sm outline-none font-sans"
          aria-label="Search scorecards"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="mr-3 p-1 rounded-full text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
        {isSearching && value && (
          <span className="mr-4 text-[11px] text-ink-400 font-sans tabular-nums whitespace-nowrap">
            {resultCount} result{resultCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
