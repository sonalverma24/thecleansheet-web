"use client";
import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { PRODUCT_TAXONOMY, PRODUCT_CATEGORIES } from "@/lib/product-taxonomy";
import type { ActiveFilters, FilterOptions } from "./ScorecardDiscovery";

interface FilterPanelProps {
  options: FilterOptions;
  filters: ActiveFilters;
  onToggle: (key: keyof ActiveFilters, value: string) => void;
  onClearAll: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const SCORE_ORDER = ["Excellent", "Good", "Fair", "Concern"];

// ── Generic flat section ───────────────────────────────────────────────────────
function FilterSection({
  label,
  optionKey,
  options,
  selected,
  onToggle,
  defaultCollapsed = false,
}: {
  label: string;
  optionKey: keyof ActiveFilters;
  options: { value: string; count: number }[];
  selected: string[];
  onToggle: (key: keyof ActiveFilters, value: string) => void;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  if (options.length === 0) return null;

  return (
    <div className="border-b border-ink-100 pb-4 mb-4">
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="flex items-center justify-between w-full mb-3 text-left"
      >
        <span className="text-xs font-medium text-ink-800 uppercase tracking-wider">{label}</span>
        <ChevronDown
          size={13}
          className={`text-ink-400 transition-transform ${collapsed ? "-rotate-90" : ""}`}
        />
      </button>
      {!collapsed && (
        <div className="space-y-2">
          {options.map(({ value, count }) => (
            <CheckRow
              key={value}
              value={value}
              count={count}
              checked={selected.includes(value)}
              onChange={() => onToggle(optionKey, value)}
              indent={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shared checkbox row ────────────────────────────────────────────────────────
function CheckRow({
  value,
  count,
  checked,
  onChange,
  indent,
}: {
  value: string;
  count: number;
  checked: boolean;
  onChange: () => void;
  indent: boolean;
}) {
  return (
    <label className={`flex items-center gap-2.5 cursor-pointer group ${indent ? "pl-4" : ""}`}>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span
        className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          checked ? "bg-teal-600 border-teal-600" : "border-ink-300 group-hover:border-teal-400"
        }`}
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none" className="text-white">
            <path d="M1 3.5L3.5 6L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={`text-xs transition-colors flex-1 ${checked ? "text-teal-700 font-medium" : "text-ink-600 group-hover:text-ink-900"}`}>
        {value}
      </span>
      <span className="text-[10px] text-ink-400 font-sans tabular-nums">{count}</span>
    </label>
  );
}

// ── Hierarchical Category + Product Type section ───────────────────────────────
function CategoryProductTypeSection({
  categoryOptions,
  productTypeOptions,
  selectedCategories,
  selectedProductTypes,
  onToggleCategory,
  onToggleProductType,
}: {
  categoryOptions: { value: string; count: number }[];
  productTypeOptions: { value: string; count: number }[];
  selectedCategories: string[];
  selectedProductTypes: string[];
  onToggleCategory: (v: string) => void;
  onToggleProductType: (v: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  // Which categories to show: those with at least one product in current options
  const availableCats = PRODUCT_CATEGORIES.filter((cat) =>
    categoryOptions.some((o) => o.value === cat)
  );

  // Which product types to show for a given category:
  // intersection of taxonomy types for that cat AND what's in productTypeOptions
  const typesForCategory = (cat: string) => {
    const taxonomyTypes = PRODUCT_TAXONOMY[cat] ?? [];
    return taxonomyTypes
      .map((t) => productTypeOptions.find((o) => o.value === t))
      .filter(Boolean) as { value: string; count: number }[];
  };

  // Track which category groups are expanded (all expanded by default if small set)
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(availableCats.map((c) => [c, true]))
  );

  const toggleCatExpand = (cat: string) =>
    setExpandedCats((p) => ({ ...p, [cat]: !p[cat] }));

  if (availableCats.length === 0) return null;

  return (
    <div className="border-b border-ink-100 pb-4 mb-4">
      {/* Section header */}
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="flex items-center justify-between w-full mb-3 text-left"
      >
        <span className="text-xs font-medium text-ink-800 uppercase tracking-wider">Product type</span>
        <ChevronDown
          size={13}
          className={`text-ink-400 transition-transform ${collapsed ? "-rotate-90" : ""}`}
        />
      </button>

      {!collapsed && (
        <div className="space-y-1">
          {availableCats.map((cat) => {
            const catOption = categoryOptions.find((o) => o.value === cat);
            if (!catOption) return null;
            const catChecked = selectedCategories.includes(cat);
            const subTypes = typesForCategory(cat);
            const isExpanded = expandedCats[cat] ?? true;

            return (
              <div key={cat}>
                {/* Category row */}
                <div className="flex items-center gap-1">
                  {/* Expand/collapse sub-types */}
                  <button
                    onClick={() => toggleCatExpand(cat)}
                    className="p-0.5 text-ink-400 hover:text-ink-700 transition-colors flex-shrink-0"
                    aria-label={isExpanded ? `Collapse ${cat}` : `Expand ${cat}`}
                  >
                    <ChevronDown
                      size={11}
                      className={`transition-transform ${isExpanded ? "" : "-rotate-90"}`}
                    />
                  </button>
                  <label className="flex items-center gap-2.5 cursor-pointer group flex-1">
                    <input
                      type="checkbox"
                      checked={catChecked}
                      onChange={() => onToggleCategory(cat)}
                      className="sr-only"
                    />
                    <span
                      className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        catChecked
                          ? "bg-teal-600 border-teal-600"
                          : "border-ink-300 group-hover:border-teal-400"
                      }`}
                    >
                      {catChecked && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none" className="text-white">
                          <path d="M1 3.5L3.5 6L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span
                      className={`text-xs font-medium transition-colors flex-1 ${
                        catChecked ? "text-teal-700" : "text-ink-700 group-hover:text-ink-900"
                      }`}
                    >
                      {cat}
                    </span>
                    <span className="text-[10px] text-ink-400 font-sans tabular-nums">
                      {catOption.count}
                    </span>
                  </label>
                </div>

                {/* Sub-types */}
                {isExpanded && subTypes.length > 0 && (
                  <div className="mt-1.5 space-y-1.5">
                    {subTypes.map(({ value, count }) => (
                      <CheckRow
                        key={value}
                        value={value}
                        count={count}
                        checked={selectedProductTypes.includes(value)}
                        onChange={() => onToggleProductType(value)}
                        indent
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main panel content ────────────────────────────────────────────────────────
function PanelContent({
  options,
  filters,
  onToggle,
  onClearAll,
}: Pick<FilterPanelProps, "options" | "filters" | "onToggle" | "onClearAll">) {
  const hasActive = Object.values(filters).some((a) => a.length > 0);
  const scoreOptions = SCORE_ORDER
    .map((s) => options.scoreRanges.find((x) => x.value === s))
    .filter(Boolean) as { value: string; count: number }[];

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-medium text-ink-900">Filters</span>
        {hasActive && (
          <button onClick={onClearAll} className="text-[11px] text-teal-600 hover:text-teal-800 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Score range */}
      <FilterSection
        label="Score range"
        optionKey="scoreRanges"
        options={scoreOptions}
        selected={filters.scoreRanges}
        onToggle={onToggle}
      />

      {/* Hierarchical Category + Product Type */}
      <CategoryProductTypeSection
        categoryOptions={options.categories}
        productTypeOptions={options.productTypes}
        selectedCategories={filters.categories}
        selectedProductTypes={filters.productTypes}
        onToggleCategory={(v) => onToggle("categories", v)}
        onToggleProductType={(v) => onToggle("productTypes", v)}
      />

      {/* Active ingredient */}
      <FilterSection
        label="Active ingredient"
        optionKey="activeIngredients"
        options={options.activeIngredients}
        selected={filters.activeIngredients}
        onToggle={onToggle}
        defaultCollapsed
      />

      {/* Skin concern */}
      <FilterSection
        label="Skin concern"
        optionKey="skinConcerns"
        options={options.skinConcerns}
        selected={filters.skinConcerns}
        onToggle={onToggle}
        defaultCollapsed
      />

      {/* Suitability */}
      <FilterSection
        label="Suitability"
        optionKey="suitability"
        options={options.suitability}
        selected={filters.suitability}
        onToggle={onToggle}
        defaultCollapsed
      />

      {/* Caution flags */}
      <FilterSection
        label="Caution flags"
        optionKey="cautionFlags"
        options={options.cautionFlags}
        selected={filters.cautionFlags}
        onToggle={onToggle}
        defaultCollapsed
      />

      {/* Price range */}
      {options.priceRanges.length > 0 && (
        <FilterSection
          label="Price range"
          optionKey="priceRanges"
          options={options.priceRanges}
          selected={filters.priceRanges}
          onToggle={onToggle}
          defaultCollapsed
        />
      )}
    </>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────
export function ScorecardFilterPanel({
  options,
  filters,
  onToggle,
  onClearAll,
  mobileOpen,
  onMobileClose,
}: FilterPanelProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 flex-shrink-0">
        <div className="sticky top-6">
          <PanelContent options={options} filters={filters} onToggle={onToggle} onClearAll={onClearAll} />
        </div>
      </aside>

      {/* Mobile bottom sheet */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={onMobileClose} aria-hidden />
          <div className="relative bg-white rounded-t-3xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-ink-200" />
            </div>
            <div className="flex items-center justify-between px-5 pb-4 border-b border-ink-100">
              <span className="font-medium text-ink-900">Filters</span>
              <button onClick={onMobileClose} className="p-2 rounded-full hover:bg-ink-100 transition-colors" aria-label="Close filters">
                <X size={16} className="text-ink-600" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 pt-4">
              <PanelContent options={options} filters={filters} onToggle={onToggle} onClearAll={onClearAll} />
            </div>
            <div className="px-5 py-4 border-t border-ink-100">
              <button onClick={onMobileClose} className="w-full bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium py-3 rounded-xl transition-colors">
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
