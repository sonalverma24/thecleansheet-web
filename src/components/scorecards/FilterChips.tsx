"use client";
import { X } from "lucide-react";
import type { ActiveFilters } from "./ScorecardDiscovery";

interface FilterChipsProps {
  filters: ActiveFilters;
  onRemove: (key: keyof ActiveFilters, value: string) => void;
  onClearAll: () => void;
}

const LABEL_MAP: Record<keyof ActiveFilters, string> = {
  categories:          "Category",
  productTypes:        "Type",
  scoreRanges:         "Score",
  activeIngredients:   "Active",
  skinConcerns:        "Concern",
  suitability:         "For",
  cautionFlags:        "Caution",
  certificationStatus: "Cert",
  priceRanges:         "Price",
};

/** Keys where chips should use coral (caution) styling */
const CAUTION_KEYS = new Set<keyof ActiveFilters>(["cautionFlags"]);

export function FilterChips({ filters, onRemove, onClearAll }: FilterChipsProps) {
  const chips: { key: keyof ActiveFilters; value: string; label: string }[] = [];

  (Object.keys(filters) as Array<keyof ActiveFilters>).forEach((key) => {
    filters[key].forEach((value) => {
      chips.push({ key, value, label: `${LABEL_MAP[key]}: ${value}` });
    });
  });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map(({ key, value, label }) => {
        const isCaution = CAUTION_KEYS.has(key);
        return (
          <button
            key={`${key}-${value}`}
            onClick={() => onRemove(key, value)}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors group"
            style={
              isCaution
                ? {
                    background: "#fff1f0",
                    border: "1px solid #fd6158",
                    color: "#fd6158",
                  }
                : {
                    background: "#e3f1ef",
                    border: "1px solid #248179",
                    color: "#248179",
                  }
            }
          >
            {label}
            <X
              size={11}
              className="transition-opacity group-hover:opacity-60"
              aria-hidden
            />
          </button>
        );
      })}
      {chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs underline underline-offset-2 transition-colors hover:opacity-60"
          style={{ color: "#b0a8a4" }}
        >
          Clear all
        </button>
      )}
    </div>
  );
}
