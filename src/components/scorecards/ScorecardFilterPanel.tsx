"use client";
import { useState, useMemo, useEffect } from "react";
import { ChevronDown, X, Search } from "lucide-react";
import { ACTIVE_INGREDIENTS, CERTIFICATION_STATUS } from "@/data/taxonomy";
import type { ActiveFilters, FilterOptions } from "./ScorecardDiscovery";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Concern groups: ordered list of [group label, concern labels[]] */
const CONCERN_GROUPS: [string, string[]][] = [
  [
    "Brightening & Pigmentation",
    ["Pigmentation", "Melasma", "Tanning", "Dullness", "Post Acne Marks"],
  ],
  [
    "Acne & Oil Control",
    ["Acne", "Blackheads", "Whiteheads", "Oily Skin", "Enlarged Pores", "Comedogenicity"],
  ],
  [
    "Exfoliation & Texture",
    ["Texture"],
  ],
  [
    "Ageing & Firmness",
    [
      "Fine Lines", "Wrinkles", "Loss of Firmness", "Elasticity",
      "Collagen Support", "Age Prevention", "Photoageing", "Skin Renewal",
    ],
  ],
  [
    "Hydration & Barrier",
    ["Dry Skin", "Dehydrated Skin", "Barrier Damage"],
  ],
  [
    "Soothing & Sensitive",
    ["Sensitive Skin", "Redness", "Rosacea Prone", "Eczema Prone"],
  ],
];

/** Popular actives shown first before grouped list */
const POPULAR_ACTIVE_LABELS = [
  "Vitamin C",
  "Niacinamide",
  "Retinol",
  "Salicylic Acid",
  "Hyaluronic Acid",
  "Ceramides",
  "Zinc Oxide",
  "Peptides",
];

/** Active ingredient group display labels (parent_id -> display name) */
const AI_GROUP_LABELS: Record<string, string> = {
  ai_grp_brightening: "Brightening & Pigmentation",
  ai_grp_acne:        "Acne & Oil Control",
  ai_grp_exfoliation: "Exfoliation & Texture",
  ai_grp_ageing:      "Ageing & Firmness",
  ai_grp_hydration:   "Hydration & Barrier",
  ai_grp_soothing:    "Soothing & Sensitive",
  ai_grp_sunscreen:   "Sunscreen Filters",
  ai_grp_hair:        "Hair & Scalp",
};

const CERT_DOT: Record<string, string> = {
  "TCS Certified": "bg-[#248179]",
  "Under Review":  "bg-amber-400",
  "Not Certified": "bg-[#b0a8a4]",
  "Data Limited":  "bg-[#b0a8a4]",
  "Not Reviewed":  "bg-[#d8d2cf]",
};

// ── Shared Checkbox ────────────────────────────────────────────────────────────

function TcsCheckbox({
  checked,
  indeterminate,
  isCaution,
}: {
  checked: boolean;
  indeterminate?: boolean;
  isCaution?: boolean;
}) {
  const activeColor = isCaution ? "#fd6158" : "#248179";
  const activeBg   = isCaution ? "#fff1f0" : "#e3f1ef";
  return (
    <span
      className="flex-shrink-0 transition-all duration-100"
      style={{
        width: 16,
        height: 16,
        borderRadius: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: checked || indeterminate
          ? `2px solid ${activeColor}`
          : "2px solid #b0a8a4",
        background: checked
          ? activeColor
          : indeterminate
          ? activeBg
          : "transparent",
      }}
    >
      {checked && (
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path
            d="M1 3.5L3.5 6L8 1"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {!checked && indeterminate && (
        <svg width="8" height="2" viewBox="0 0 8 2" fill="none">
          <path
            d="M1 1H7"
            stroke={activeColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}

// ── Option Row (fixed 38px height, no layout shift) ───────────────────────────

function OptionRow({
  value,
  count,
  checked,
  onChange,
  indent = false,
  semibold = false,
  isCaution = false,
}: {
  value: string;
  count: number;
  checked: boolean;
  onChange: () => void;
  indent?: boolean;
  semibold?: boolean;
  isCaution?: boolean;
}) {
  const activeTextColor = isCaution ? "#fd6158" : "#248179";
  return (
    <label
      className="flex items-center gap-2 cursor-pointer group select-none"
      style={{
        height: 38,
        paddingLeft: indent ? 28 : 0,
        flexShrink: 0,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <TcsCheckbox checked={checked} isCaution={isCaution} />
      <span
        className="flex-1 truncate transition-colors duration-100"
        style={{
          fontSize: 14,
          fontWeight: semibold ? 600 : 400,
          color: checked ? activeTextColor : "#282828",
          opacity: indent && !semibold ? 0.8 : 1,
          lineHeight: 1.2,
        }}
      >
        {value}
      </span>
      <span
        className="flex-shrink-0 tabular-nums"
        style={{ fontSize: 12, color: "#b0a8a4" }}
      >
        {count}
      </span>
    </label>
  );
}

// ── Internal search bar ────────────────────────────────────────────────────────

function InternalSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative mb-1">
      <Search
        size={12}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "#b0a8a4" }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border text-ink-800 placeholder:text-ink-300 focus:outline-none transition-colors"
        style={{
          paddingLeft: 28,
          paddingRight: value ? 28 : 8,
          paddingTop: 6,
          paddingBottom: 6,
          fontSize: 13,
          background: "#faf7f2",
          borderColor: "rgba(176,168,164,0.35)",
        }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2"
          aria-label="Clear search"
        >
          <X size={11} style={{ color: "#b0a8a4" }} />
        </button>
      )}
    </div>
  );
}

// ── Section label (sub-group divider inside a section) ─────────────────────────

function SectionSubLabel({ label }: { label: string }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: "#b0a8a4",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        fontWeight: 600,
        padding: "8px 0 2px",
      }}
    >
      {label}
    </div>
  );
}

// ── Accordion wrapper ──────────────────────────────────────────────────────────

function Accordion({
  label,
  selectedCount,
  defaultOpen,
  children,
}: {
  label: string;
  selectedCount: number;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        borderBottom: "1px solid rgba(176,168,164,0.25)",
        marginBottom: 4,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center justify-between w-full text-left"
        style={{ height: 44 }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#282828",
          }}
        >
          {label}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {selectedCount > 0 && (
            <span
              className="tabular-nums"
              style={{
                fontSize: 10,
                background: "#248179",
                color: "white",
                borderRadius: 10,
                padding: "1px 6px",
                fontWeight: 600,
              }}
            >
              {selectedCount}
            </span>
          )}
          <ChevronDown
            size={13}
            style={{
              color: "#b0a8a4",
              transform: open ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 0.15s ease",
            }}
          />
        </div>
      </button>

      {/* Body */}
      {open && (
        <div style={{ paddingBottom: 10 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Generic flat section (with optional internal search) ───────────────────────

function FlatSection({
  label,
  optionKey,
  options,
  selected,
  onToggle,
  defaultOpen = false,
  searchThreshold = 8,
  searchPlaceholder = "Search...",
  isCaution = false,
}: {
  label: string;
  optionKey: keyof ActiveFilters;
  options: { value: string; count: number }[];
  selected: string[];
  onToggle: (key: keyof ActiveFilters, value: string) => void;
  defaultOpen?: boolean;
  searchThreshold?: number;
  searchPlaceholder?: string;
  isCaution?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  if (options.length === 0) return null;

  const showSearch = options.length > searchThreshold;

  const selectedItems = options.filter((o) => selected.includes(o.value));
  const unselectedItems = options.filter((o) => !selected.includes(o.value));

  const filteredUnselected = searchQuery
    ? unselectedItems.filter((o) =>
        o.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : unselectedItems;

  // Selected items always shown, filtered unselected below
  const visibleItems = searchQuery
    ? [...selectedItems, ...filteredUnselected]
    : options;

  const noResults = searchQuery && filteredUnselected.length === 0 && selectedItems.length === 0;

  return (
    <Accordion
      label={label}
      selectedCount={selectedItems.length}
      defaultOpen={defaultOpen}
    >
      {showSearch && (
        <InternalSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={searchPlaceholder}
        />
      )}

      <div
        style={
          visibleItems.length > 10
            ? { overflowY: "auto", maxHeight: 340 }
            : undefined
        }
      >
        {noResults ? (
          <p style={{ fontSize: 12, color: "#b0a8a4", padding: "6px 0" }}>
            No matching filter found.
          </p>
        ) : (
          visibleItems.map(({ value, count }) => (
            <OptionRow
              key={value}
              value={value}
              count={count}
              checked={selected.includes(value)}
              onChange={() => onToggle(optionKey, value)}
              isCaution={isCaution}
            />
          ))
        )}
      </div>
    </Accordion>
  );
}


// ── Active Ingredient Section (grouped + searchable) ───────────────────────────

function ActiveIngredientSection({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; count: number }[];
  selected: string[];
  onToggle: (key: keyof ActiveFilters, value: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const isGroupExpanded = (g: string) => expandedGroups[g] !== false;
  const toggleGroup = (g: string) =>
    setExpandedGroups((p) => ({ ...p, [g]: !isGroupExpanded(g) }));

  const selectedCount = useMemo(
    () => options.filter((o) => selected.includes(o.value)).length,
    [options, selected]
  );

  const optionMap = useMemo(
    () => new Map(options.map((o) => [o.value, o.count])),
    [options]
  );

  const popularOptions = useMemo(
    () =>
      POPULAR_ACTIVE_LABELS.filter((l) => optionMap.has(l)).map((l) => ({
        value: l,
        count: optionMap.get(l)!,
      })),
    [optionMap]
  );

  // Groups: group label -> options[] (in taxonomy order, only those with products)
  const groupedOptions = useMemo(() => {
    const groups = new Map<string, { value: string; count: number }[]>();
    for (const ai of ACTIVE_INGREDIENTS) {
      if (!ai.parent_id || !optionMap.has(ai.label)) continue;
      const groupLabel = AI_GROUP_LABELS[ai.parent_id] ?? ai.parent_id;
      if (!groups.has(groupLabel)) groups.set(groupLabel, []);
      groups.get(groupLabel)!.push({ value: ai.label, count: optionMap.get(ai.label)! });
    }
    return groups;
  }, [optionMap]);

  if (options.length === 0) return null;

  // When searching: show selected items + matching items
  const selectedItems = options.filter((o) => selected.includes(o.value));
  const filteredUnselected = searchQuery
    ? options.filter(
        (o) =>
          !selected.includes(o.value) &&
          o.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  const noSearchResults =
    searchQuery && filteredUnselected.length === 0 && selectedItems.length === 0;

  return (
    <Accordion
      label="Active Ingredient"
      selectedCount={selectedCount}
      defaultOpen={false}
    >
      <InternalSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search actives"
      />

      {searchQuery ? (
        // Search mode
        <div>
          {noSearchResults ? (
            <p style={{ fontSize: 12, color: "#b0a8a4", padding: "6px 0" }}>
              No matching filter found.
            </p>
          ) : (
            <>
              {selectedItems.map(({ value, count }) => (
                <OptionRow
                  key={value}
                  value={value}
                  count={count}
                  checked
                  onChange={() => onToggle("activeIngredients", value)}
                />
              ))}
              {filteredUnselected.map(({ value, count }) => (
                <OptionRow
                  key={value}
                  value={value}
                  count={count}
                  checked={false}
                  onChange={() => onToggle("activeIngredients", value)}
                />
              ))}
            </>
          )}
        </div>
      ) : (
        // Browse mode
        <div>
          {popularOptions.length > 0 && (
            <div>
              <SectionSubLabel label="Popular" />
              {popularOptions.map(({ value, count }) => (
                <OptionRow
                  key={value}
                  value={value}
                  count={count}
                  checked={selected.includes(value)}
                  onChange={() => onToggle("activeIngredients", value)}
                />
              ))}
            </div>
          )}

          {Array.from(groupedOptions.entries()).map(([groupLabel, items]) => {
            if (items.length === 0) return null;
            const expanded = isGroupExpanded(groupLabel);
            const PREVIEW = 4;
            const showToggle = items.length > PREVIEW;
            const visible = expanded ? items : items.slice(0, PREVIEW);
            const groupSelectedCount = items.filter((i) =>
              selected.includes(i.value)
            ).length;

            return (
              <div key={groupLabel}>
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleGroup(groupLabel)}
                  style={{ padding: "8px 0 2px" }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: "#b0a8a4",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      fontWeight: 600,
                    }}
                  >
                    {groupLabel}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {groupSelectedCount > 0 && (
                      <span
                        style={{
                          fontSize: 9,
                          background: "#248179",
                          color: "white",
                          borderRadius: 8,
                          padding: "1px 5px",
                          fontWeight: 600,
                        }}
                      >
                        {groupSelectedCount}
                      </span>
                    )}
                    <ChevronDown
                      size={11}
                      style={{
                        color: "#b0a8a4",
                        transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
                        transition: "transform 0.12s ease",
                      }}
                    />
                  </div>
                </div>

                {expanded && (
                  <div>
                    {visible.map(({ value, count }) => (
                      <OptionRow
                        key={value}
                        value={value}
                        count={count}
                        checked={selected.includes(value)}
                        onChange={() => onToggle("activeIngredients", value)}
                      />
                    ))}
                    {showToggle && (
                      <button
                        onClick={() => toggleGroup(groupLabel)}
                        style={{
                          fontSize: 12,
                          color: "#248179",
                          cursor: "pointer",
                          padding: "2px 0 4px",
                        }}
                      >
                        {expanded && items.length > PREVIEW
                          ? "Show less"
                          : `+${items.length - PREVIEW} more`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Accordion>
  );
}

// ── Concern Section (grouped + searchable) ────────────────────────────────────

function ConcernSection({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; count: number }[];
  selected: string[];
  onToggle: (key: keyof ActiveFilters, value: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const isGroupExpanded = (g: string) => expandedGroups[g] !== false;
  const toggleGroup = (g: string) =>
    setExpandedGroups((p) => ({ ...p, [g]: !isGroupExpanded(g) }));

  const optionMap = useMemo(
    () => new Map(options.map((o) => [o.value, o.count])),
    [options]
  );

  // Build groups: only include items that have product data
  const groups = useMemo(
    () =>
      CONCERN_GROUPS.map(([groupLabel, labels]) => ({
        groupLabel,
        items: labels
          .filter((l) => optionMap.has(l))
          .map((l) => ({ value: l, count: optionMap.get(l)! })),
      })).filter((g) => g.items.length > 0),
    [optionMap]
  );

  const selectedCount = useMemo(
    () => options.filter((o) => selected.includes(o.value)).length,
    [options, selected]
  );

  if (groups.length === 0) return null;

  // Search mode: show selected + matching across all groups
  const selectedItems = options.filter((o) => selected.includes(o.value));
  const filteredUnselected = searchQuery
    ? options.filter(
        (o) =>
          !selected.includes(o.value) &&
          o.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  const noSearchResults =
    !!searchQuery && filteredUnselected.length === 0 && selectedItems.length === 0;

  return (
    <Accordion label="Concern" selectedCount={selectedCount} defaultOpen={false}>
      <InternalSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search concerns"
      />

      {searchQuery ? (
        <div>
          {noSearchResults ? (
            <p style={{ fontSize: 12, color: "#b0a8a4", padding: "6px 0" }}>
              No matching filter found.
            </p>
          ) : (
            <>
              {selectedItems.map(({ value, count }) => (
                <OptionRow
                  key={value}
                  value={value}
                  count={count}
                  checked
                  onChange={() => onToggle("skinConcerns", value)}
                />
              ))}
              {filteredUnselected.map(({ value, count }) => (
                <OptionRow
                  key={value}
                  value={value}
                  count={count}
                  checked={false}
                  onChange={() => onToggle("skinConcerns", value)}
                />
              ))}
            </>
          )}
        </div>
      ) : (
        <div>
          {groups.map(({ groupLabel, items }) => {
            const expanded = isGroupExpanded(groupLabel);
            const groupSelectedCount = items.filter((i) =>
              selected.includes(i.value)
            ).length;

            return (
              <div key={groupLabel}>
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleGroup(groupLabel)}
                  style={{ padding: "8px 0 2px" }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: "#b0a8a4",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      fontWeight: 600,
                    }}
                  >
                    {groupLabel}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {groupSelectedCount > 0 && (
                      <span
                        style={{
                          fontSize: 9,
                          background: "#248179",
                          color: "white",
                          borderRadius: 8,
                          padding: "1px 5px",
                          fontWeight: 600,
                        }}
                      >
                        {groupSelectedCount}
                      </span>
                    )}
                    <ChevronDown
                      size={11}
                      style={{
                        color: "#b0a8a4",
                        transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
                        transition: "transform 0.12s ease",
                      }}
                    />
                  </div>
                </div>

                {expanded && (
                  <div>
                    {items.map(({ value, count }) => (
                      <OptionRow
                        key={value}
                        value={value}
                        count={count}
                        checked={selected.includes(value)}
                        onChange={() => onToggle("skinConcerns", value)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Accordion>
  );
}

// ── Certification Section (with status dots) ───────────────────────────────────

function CertSection({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; count: number }[];
  selected: string[];
  onToggle: (key: keyof ActiveFilters, value: string) => void;
}) {
  if (options.length === 0) return null;

  const selectedCount = options.filter((o) => selected.includes(o.value)).length;

  return (
    <Accordion
      label="Certification Status"
      selectedCount={selectedCount}
      defaultOpen={false}
    >
      {options.map(({ value, count }) => {
        const checked = selected.includes(value);
        const dot = CERT_DOT[value] ?? "bg-[#b0a8a4]";
        return (
          <label
            key={value}
            className="flex items-center gap-2 cursor-pointer select-none"
            style={{ height: 38 }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle("certificationStatus", value)}
              className="sr-only"
            />
            <TcsCheckbox checked={checked} />
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
            <span
              className="flex-1 truncate transition-colors duration-100"
              style={{
                fontSize: 14,
                color: checked ? "#248179" : "#282828",
              }}
            >
              {value}
            </span>
            <span
              className="flex-shrink-0 tabular-nums"
              style={{ fontSize: 12, color: "#b0a8a4" }}
            >
              {count}
            </span>
          </label>
        );
      })}
    </Accordion>
  );
}

// ── Panel content ──────────────────────────────────────────────────────────────

interface FilterPanelProps {
  options: FilterOptions;
  filters: ActiveFilters;
  onToggle: (key: keyof ActiveFilters, value: string) => void;
  onClearAll: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  resultCount?: number;
}

function PanelContent({
  options,
  filters,
  onToggle,
  onClearAll,
}: Pick<FilterPanelProps, "options" | "filters" | "onToggle" | "onClearAll">) {
  const hasActive = Object.values(filters).some((a) => a.length > 0);

  const certTaxonomyOrder = CERTIFICATION_STATUS.filter(
    (c) => c.is_public && !c.is_admin_only
  ).map((c) => c.label);
  const certOptions = certTaxonomyOrder
    .map((label) => options.certificationStatus.find((o) => o.value === label))
    .filter(Boolean) as { value: string; count: number }[];

  return (
    <div>
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ height: 44, flexShrink: 0 }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: "#282828" }}>
          Filters
        </span>
        {hasActive && (
          <button
            onClick={onClearAll}
            className="transition-opacity hover:opacity-60"
            style={{ fontSize: 11, color: "#248179", cursor: "pointer" }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* 1. Product Category (expanded by default) */}
      <FlatSection
        label="Product Category"
        optionKey="categories"
        options={options.categories}
        selected={filters.categories}
        onToggle={onToggle}
        defaultOpen={true}
      />

      {/* 2. Active Ingredient */}
      <ActiveIngredientSection
        options={options.activeIngredients}
        selected={filters.activeIngredients}
        onToggle={onToggle}
      />

      {/* 4. Concern (grouped) */}
      <ConcernSection
        options={options.skinConcerns}
        selected={filters.skinConcerns}
        onToggle={onToggle}
      />

      {/* 5. Suitability */}
      <FlatSection
        label="Suitability"
        optionKey="suitability"
        options={options.suitability}
        selected={filters.suitability}
        onToggle={onToggle}
        defaultOpen={false}
      />

      {/* 6. Certification Status */}
      <CertSection
        options={certOptions}
        selected={filters.certificationStatus}
        onToggle={onToggle}
      />

      {/* 7. Price Range */}
      {options.priceRanges.length > 0 && (
        <FlatSection
          label="Price Range"
          optionKey="priceRanges"
          options={options.priceRanges}
          selected={filters.priceRanges}
          onToggle={onToggle}
          defaultOpen={false}
        />
      )}
    </div>
  );
}

// ── Public export ──────────────────────────────────────────────────────────────

export function ScorecardFilterPanel({
  options,
  filters,
  onToggle,
  onClearAll,
  mobileOpen,
  onMobileClose,
  resultCount,
}: FilterPanelProps) {
  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const activeCount = Object.values(filters).reduce((s, a) => s + a.length, 0);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block flex-shrink-0" style={{ width: 310 }}>
        <div
          className="sticky overflow-y-auto"
          style={{
            top: 72,
            maxHeight: "calc(100vh - 88px)",
            paddingRight: 24,
            borderRight: "1px solid rgba(176,168,164,0.2)",
          }}
        >
          <PanelContent
            options={options}
            filters={filters}
            onToggle={onToggle}
            onClearAll={onClearAll}
          />
        </div>
      </aside>

      {/* Mobile bottom sheet */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onMobileClose}
            aria-hidden
          />
          <div
            className="relative rounded-t-3xl flex flex-col shadow-2xl"
            style={{
              background: "#faf7f2",
              maxHeight: "92vh",
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div
                className="rounded-full"
                style={{ width: 40, height: 4, background: "rgba(176,168,164,0.45)" }}
              />
            </div>

            {/* Mobile header */}
            <div
              className="flex items-center justify-between flex-shrink-0"
              style={{
                height: 52,
                paddingLeft: 20,
                paddingRight: 12,
                borderBottom: "1px solid rgba(176,168,164,0.25)",
              }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 16, fontWeight: 600, color: "#282828" }}>
                  Filters
                </span>
                {activeCount > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      background: "#248179",
                      color: "white",
                      borderRadius: 10,
                      padding: "2px 7px",
                      fontWeight: 600,
                    }}
                  >
                    {activeCount}
                  </span>
                )}
              </div>
              <button
                onClick={onMobileClose}
                className="flex items-center justify-center rounded-full transition-colors"
                style={{
                  width: 40,
                  height: 40,
                  background: "rgba(176,168,164,0.15)",
                }}
                aria-label="Close filters"
              >
                <X size={16} style={{ color: "#282828" }} />
              </button>
            </div>

            {/* Scrollable filter list */}
            <div
              className="overflow-y-auto flex-1"
              style={{ padding: "0 20px" }}
            >
              <PanelContent
                options={options}
                filters={filters}
                onToggle={onToggle}
                onClearAll={onClearAll}
              />
            </div>

            {/* Sticky footer */}
            <div
              className="flex-shrink-0 flex items-center gap-3"
              style={{
                padding: "16px 20px",
                borderTop: "1px solid rgba(176,168,164,0.25)",
                background: "#faf7f2",
              }}
            >
              {activeCount > 0 && (
                <button
                  onClick={onClearAll}
                  className="flex-shrink-0 transition-opacity hover:opacity-60"
                  style={{
                    fontSize: 14,
                    color: "#b0a8a4",
                    fontWeight: 500,
                    minHeight: 48,
                    paddingLeft: 4,
                    paddingRight: 4,
                  }}
                >
                  Clear all
                </button>
              )}
              <button
                onClick={onMobileClose}
                className="flex-1 text-white font-medium rounded-2xl transition-colors active:opacity-90"
                style={{
                  background: "#248179",
                  fontSize: 15,
                  minHeight: 48,
                }}
              >
                {resultCount !== undefined
                  ? `Show ${resultCount} product${resultCount !== 1 ? "s" : ""}`
                  : "Apply filters"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
