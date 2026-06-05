"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, Filter, Eye, EyeOff } from "lucide-react";
import {
  ALL_TAXONOMY_ITEMS,
  type TaxonomyItem,
  type TaxonomyFamily,
} from "@/data/taxonomy";

// ── Taxonomy family display config ────────────────────────────────────────────

const FAMILY_META: Record<TaxonomyFamily, { label: string; color: string }> = {
  product_category:     { label: "Product Category",     color: "bg-[#e3f1ef] text-[#248179] border-[#c0ddd9]" },
  product_type:         { label: "Product Type",          color: "bg-[#e3f1ef] text-[#248179] border-[#c0ddd9]" },
  active_ingredient:    { label: "Active Ingredient",     color: "bg-blue-50 text-blue-700 border-blue-100" },
  concern:              { label: "Concern",               color: "bg-purple-50 text-purple-700 border-purple-100" },
  suitability:          { label: "Suitability",           color: "bg-[#faf7f2] text-[#282828] border-[#e8e2d8]" },
  caution:              { label: "Caution",               color: "bg-[#ffe6e4] text-[#fd6158] border-[#ffd0cc]" },
  certification_status: { label: "Certification Status",  color: "bg-amber-50 text-amber-700 border-amber-100" },
  evidence_status:      { label: "Evidence Status",       color: "bg-sky-50 text-sky-700 border-sky-100" },
  prism_module:         { label: "PRISM Module",          color: "bg-[#d2ff34] text-[#282828] border-[#b8e820]" },
  skin_type:            { label: "Skin Type",             color: "bg-rose-50 text-rose-700 border-rose-100" },
  hair_type:            { label: "Hair Type",             color: "bg-orange-50 text-orange-700 border-orange-100" },
  format:               { label: "Format",                color: "bg-slate-50 text-slate-600 border-slate-200" },
  price_segment:        { label: "Price Segment",         color: "bg-lime-50 text-lime-700 border-lime-100" },
  availability_source:  { label: "Availability Source",   color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
};

const ALL_FAMILIES = Object.keys(FAMILY_META) as TaxonomyFamily[];

// ── Item count by family ──────────────────────────────────────────────────────

function CountBadge({ n }: { n: number }) {
  return (
    <span className="text-[10px] font-sans tabular-nums bg-ink-100 text-ink-500 px-1.5 py-0.5 rounded-full">
      {n}
    </span>
  );
}

// ── Family pill ───────────────────────────────────────────────────────────────

function FamilyPill({ family }: { family: TaxonomyFamily }) {
  const meta = FAMILY_META[family];
  return (
    <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-full border font-normal ${meta.color}`}>
      {meta.label}
    </span>
  );
}

// ── Table row ─────────────────────────────────────────────────────────────────

function ItemRow({ item, onSelect }: { item: TaxonomyItem; onSelect: () => void }) {
  const isAdminOnly = item.is_admin_only;
  const isDraft = item.status === "draft";

  return (
    <tr
      className={`border-b border-ink-50 hover:bg-ink-50/50 transition-colors cursor-pointer ${
        isDraft ? "opacity-60" : ""
      }`}
      onClick={onSelect}
    >
      <td className="py-2.5 px-4">
        <div className="flex items-center gap-2">
          <code className="text-[10px] text-ink-400 font-mono bg-ink-50 px-1.5 py-0.5 rounded select-all">
            {item.id}
          </code>
          {isDraft && (
            <span className="text-[9px] bg-amber-100 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full">
              draft
            </span>
          )}
        </div>
      </td>
      <td className="py-2.5 px-4">
        <span className="text-sm text-ink-900">{item.label}</span>
      </td>
      <td className="py-2.5 px-4">
        <FamilyPill family={item.family} />
      </td>
      <td className="py-2.5 px-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.is_filterable && (
            <span className="text-[9px] bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded-full border border-teal-100">
              filterable
            </span>
          )}
          {item.is_searchable && (
            <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100">
              searchable
            </span>
          )}
          {isAdminOnly && (
            <span className="text-[9px] bg-ink-100 text-ink-500 px-1.5 py-0.5 rounded-full border border-ink-200">
              admin only
            </span>
          )}
          {!item.is_public && !isAdminOnly && (
            <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full border border-amber-100">
              not public
            </span>
          )}
        </div>
      </td>
      <td className="py-2.5 px-4">
        <span className="text-[10px] text-ink-400 font-sans">
          {item.synonyms.length > 0 ? `${item.synonyms.length} synonyms` : ""}
        </span>
      </td>
    </tr>
  );
}

// ── Item detail drawer ────────────────────────────────────────────────────────

function ItemDrawer({ item, onClose }: { item: TaxonomyItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-ink-100 px-6 py-4 flex items-center justify-between">
          <h2 className="font-medium text-ink-900">Taxonomy Item</h2>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 transition-colors p-1"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div>
            <FamilyPill family={item.family} />
            <h3 className="text-xl font-medium text-ink-950 mt-2">{item.label}</h3>
            <code className="text-xs text-ink-400 font-mono">{item.id}</code>
          </div>

          {/* Fields */}
          {[
            { label: "Slug", value: item.slug },
            { label: "Status", value: item.status },
            { label: "Display order", value: String(item.display_order) },
            { label: "Parent ID", value: item.parent_id ?? "none" },
            { label: "Description", value: item.description || "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-medium text-ink-400 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm text-ink-700 font-mono">{value}</p>
            </div>
          ))}

          {/* Flags */}
          <div>
            <p className="text-[10px] font-medium text-ink-400 uppercase tracking-wider mb-2">Flags</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "is_filterable",   label: "Filterable" },
                { key: "is_searchable",   label: "Searchable" },
                { key: "is_public",       label: "Public" },
                { key: "is_admin_only",   label: "Admin Only" },
              ].map(({ key, label }) => {
                const val = item[key as keyof TaxonomyItem] as boolean;
                return (
                  <span
                    key={key}
                    className={`text-[11px] px-2.5 py-1 rounded-full border ${
                      val
                        ? "bg-teal-50 text-teal-700 border-teal-100"
                        : "bg-ink-50 text-ink-400 border-ink-100 line-through"
                    }`}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Synonyms */}
          {item.synonyms.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-ink-400 uppercase tracking-wider mb-2">
                Synonyms ({item.synonyms.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.synonyms.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] bg-ink-50 text-ink-600 border border-ink-100 px-2 py-0.5 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Admin note */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs font-medium text-amber-700 mb-1">Admin note</p>
            <p className="text-xs text-amber-600 leading-relaxed">
              To add synonyms, change status, or modify this item, update the seed data in{" "}
              <code className="font-mono">src/data/taxonomy/seed.ts</code> and submit a pull
              request for review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TaxonomyAdminPage() {
  const [search, setSearch] = useState("");
  const [selectedFamily, setSelectedFamily] = useState<TaxonomyFamily | "all">("all");
  const [showAdminOnly, setShowAdminOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TaxonomyItem | null>(null);
  const [familyOpen, setFamilyOpen] = useState(false);

  const stats = useMemo(() => {
    const byFamily = new Map<TaxonomyFamily, number>();
    for (const item of ALL_TAXONOMY_ITEMS) {
      byFamily.set(item.family, (byFamily.get(item.family) ?? 0) + 1);
    }
    return byFamily;
  }, []);

  const filtered = useMemo(() => {
    let items = ALL_TAXONOMY_ITEMS;

    if (selectedFamily !== "all") {
      items = items.filter((i) => i.family === selectedFamily);
    }
    if (!showAdminOnly) {
      items = items.filter((i) => !i.is_admin_only);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.label.toLowerCase().includes(s) ||
          i.id.toLowerCase().includes(s) ||
          i.slug.includes(s) ||
          i.synonyms.some((syn) => syn.toLowerCase().includes(s))
      );
    }
    return items;
  }, [search, selectedFamily, showAdminOnly]);

  const draftCount = ALL_TAXONOMY_ITEMS.filter((i) => i.status === "draft").length;

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Header */}
      <div className="bg-white border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium text-ink-950">Taxonomy Management</h1>
              <p className="text-sm text-ink-400 mt-0.5">
                {ALL_TAXONOMY_ITEMS.length} items across {ALL_FAMILIES.length} families
                {draftCount > 0 && (
                  <span className="ml-2 text-amber-600">· {draftCount} drafts pending review</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-400 bg-ink-50 border border-ink-100 px-3 py-1.5 rounded-lg">
                Read only. Changes require a code review via pull request.
              </span>
            </div>
          </div>

          {/* Family stat pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            {ALL_FAMILIES.map((family) => {
              const meta = FAMILY_META[family];
              const n = stats.get(family) ?? 0;
              return (
                <button
                  key={family}
                  onClick={() => setSelectedFamily(selectedFamily === family ? "all" : family)}
                  className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                    selectedFamily === family
                      ? meta.color + " ring-1 ring-offset-1 ring-[#248179]"
                      : "bg-white text-ink-500 border-ink-200 hover:border-ink-300"
                  }`}
                >
                  {meta.label}
                  <CountBadge n={n} />
                </button>
              );
            })}
            {selectedFamily !== "all" && (
              <button
                onClick={() => setSelectedFamily("all")}
                className="text-[11px] text-ink-400 hover:text-ink-700 px-2 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by label, ID, or synonym..."
            className="w-full pl-8 pr-4 py-2 text-sm border border-ink-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition-all"
          />
        </div>

        {/* Family dropdown */}
        <div className="relative">
          <button
            onClick={() => setFamilyOpen((p) => !p)}
            className="inline-flex items-center gap-1.5 text-sm border border-ink-200 bg-white px-3 py-2 rounded-xl hover:border-ink-300 transition-colors"
          >
            <Filter size={13} className="text-ink-400" />
            {selectedFamily === "all" ? "All families" : FAMILY_META[selectedFamily].label}
            <ChevronDown size={12} className="text-ink-400" />
          </button>
          {familyOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-ink-200 rounded-xl shadow-lg z-20 w-52 py-1 max-h-64 overflow-y-auto">
              <button
                onClick={() => { setSelectedFamily("all"); setFamilyOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-ink-600 hover:bg-ink-50 transition-colors"
              >
                All families
              </button>
              {ALL_FAMILIES.map((family) => (
                <button
                  key={family}
                  onClick={() => { setSelectedFamily(family); setFamilyOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-ink-600 hover:bg-ink-50 transition-colors"
                >
                  {FAMILY_META[family].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Admin-only toggle */}
        <button
          onClick={() => setShowAdminOnly((p) => !p)}
          className={`inline-flex items-center gap-1.5 text-sm border px-3 py-2 rounded-xl transition-colors ${
            showAdminOnly
              ? "bg-ink-900 border-ink-900 text-white"
              : "border-ink-200 bg-white text-ink-500 hover:border-ink-300"
          }`}
        >
          {showAdminOnly ? <Eye size={13} /> : <EyeOff size={13} />}
          Admin items
        </button>

        <span className="text-xs text-ink-400 font-sans ml-auto">
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-white border border-ink-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50">
                <th className="py-3 px-4 text-[10px] font-medium text-ink-400 uppercase tracking-wider">ID</th>
                <th className="py-3 px-4 text-[10px] font-medium text-ink-400 uppercase tracking-wider">Label</th>
                <th className="py-3 px-4 text-[10px] font-medium text-ink-400 uppercase tracking-wider">Family</th>
                <th className="py-3 px-4 text-[10px] font-medium text-ink-400 uppercase tracking-wider">Flags</th>
                <th className="py-3 px-4 text-[10px] font-medium text-ink-400 uppercase tracking-wider">Synonyms</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onSelect={() => setSelectedItem(item)}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-ink-400">
                    No taxonomy items match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Data rules */}
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <div className="bg-white border border-ink-100 rounded-2xl p-5">
            <h3 className="text-sm font-medium text-ink-900 mb-3">Validation rules</h3>
            <ul className="space-y-1.5">
              {[
                "Product category is mandatory",
                "Product type is mandatory",
                "Category and type must be in approved taxonomy",
                "Certification status must be from taxonomy",
                "Badge labels must never be raw free text",
                "Unknown data must not create a taxonomy item",
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-ink-600">
                  <span className="text-[#fd6158] font-bold mt-0.5">!</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-ink-100 rounded-2xl p-5">
            <h3 className="text-sm font-medium text-ink-900 mb-3">Data limited conditions</h3>
            <ul className="space-y-1.5">
              {[
                "INCI list is missing",
                "Product price is not populated",
                "Evidence is missing or unavailable",
                "Active concentration is not disclosed",
                "Claims proof is not available",
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-ink-600">
                  <span className="text-amber-500 font-bold mt-0.5">~</span>
                  Product allowed but shown as Data Limited: {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {selectedItem && (
        <ItemDrawer item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
