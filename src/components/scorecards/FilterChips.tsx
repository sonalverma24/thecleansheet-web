"use client";
import { X } from "lucide-react";
import type { ActiveFilters } from "./ScorecardDiscovery";

interface FilterChipsProps {
  filters: ActiveFilters;
  onRemove: (key: keyof ActiveFilters, value: string) => void;
  onClearAll: () => void;
}

const LABEL_MAP: Record<string, string> = {
  categories: "Category",
  productTypes: "Product type",
  scoreRanges: "Score",
  activeIngredients: "Active",
  skinConcerns: "Concern",
  suitability: "For",
  cautionFlags: "Caution",
  priceRanges: "Price",
};

export function FilterChips({ filters, onRemove, onClearAll }: FilterChipsProps) {
  const chips: { key: keyof ActiveFilters; value: string; label: string }[] = [];

  (Object.keys(filters) as Array<keyof ActiveFilters>).forEach((key) => {
    const values = filters[key];
    values.forEach((value) => {
      chips.push({
        key,
        value,
        label: `${LABEL_MAP[key] ?? key}: ${value}`,
      });
    });
  });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map(({ key, value, label }) => (
        <button
          key={`${key}-${value}`}
          onClick={() => onRemove(key, value)}
          className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-xs px-2.5 py-1 rounded-full hover:bg-teal-100 transition-colors group"
        >
          {label}
          <X
            size={11}
            className="text-teal-400 group-hover:text-teal-700 transition-colors"
            aria-hidden
          />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-ink-500 hover:text-ink-800 underline underline-offset-2 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
