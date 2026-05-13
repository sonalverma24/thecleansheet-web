"use client";

import { useState, useMemo } from "react";
import { Search, X, ChevronDown, ChevronUp, ExternalLink, Filter } from "lucide-react";

export interface Ingredient {
  INCI_Name: string;
  CAS_Number: string;
  EC_Number: string;
  Chemical_Name: string;
  Function: string;
  Category_Code: string;
  Category_Name: string;
  Ingredient_Origin: string;
  Concern_Level_TCS: string;
  EU_Status: string;
  EU_Annex: string;
  India_Status: string;
  US_FDA_Status: string;
  Korea_Status: string;
  Vegan: string;
  Natural_ISO16128: string;
  SVHC_Flag: string;
  CMR_Flag: string;
  Allergen_Flag: string;
  Endocrine_Flag: string;
  Max_Concentration_EU: string;
  Max_Concentration_India: string;
  Format_Restriction: string;
  Baby_Restriction: string;
  Common_Products: string;
  Key_Safety_Notes: string;
  TCS_Evaluator_Flag: string;
  Source_Reference: string;
  Last_Updated: string;
}

function concernStyle(level: string): { bg: string; text: string; dot: string } {
  const l = level.toLowerCase();
  if (l === "high") return { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" };
  if (l === "medium") return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" };
  if (l.includes("low-medium") || l.includes("low (fcf)")) return { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" };
  if (l.startsWith("low")) return { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" };
  return { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" };
}

function ConcernBadge({ level }: { level: string }) {
  const { bg, text, dot } = concernStyle(level);
  const label = level.length > 18 ? level.split(" ")[0] : level;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-normal px-2.5 py-1 rounded-full ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
      {label}
    </span>
  );
}

function FlagBadge({ label, active }: { label: string; active: boolean }) {
  if (!active) return null;
  const styles: Record<string, string> = {
    SVHC: "bg-red-100 text-red-700 border-red-200",
    CMR: "bg-red-100 text-red-700 border-red-200",
    Allergen: "bg-amber-100 text-amber-700 border-amber-200",
    Endocrine: "bg-purple-100 text-purple-700 border-purple-200",
    "Baby Caution": "bg-blue-100 text-blue-700 border-blue-200",
  };
  return (
    <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded border ${styles[label] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {label}
    </span>
  );
}

function StatusCell({ status }: { status: string }) {
  if (!status || status === "Not evaluated") return <span className="text-slate-300 text-xs">-</span>;
  if (status.toLowerCase().includes("banned") || status.toLowerCase().includes("prohibited"))
    return <span className="text-red-600 text-xs font-medium">Banned</span>;
  if (status.toLowerCase().includes("restricted"))
    return <span className="text-amber-600 text-xs font-normal">Restricted</span>;
  if (status.toLowerCase().includes("permitted"))
    return <span className="text-green-700 text-xs">Permitted</span>;
  return <span className="text-slate-500 text-xs">{status}</span>;
}

function DetailPanel({ ing, onClose }: { ing: Ingredient; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-ink-950/40 backdrop-blur-sm p-4 sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 flex items-start justify-between gap-4 rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-medium text-slate-900 leading-tight">{ing.INCI_Name}</h2>
            {ing.Chemical_Name && ing.Chemical_Name !== ing.INCI_Name && (
              <p className="text-slate-400 text-sm mt-0.5 font-mono">{ing.Chemical_Name}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Concern + flags */}
          <div className="flex flex-wrap gap-2 items-center">
            <ConcernBadge level={ing.Concern_Level_TCS} />
            <FlagBadge label="SVHC" active={ing.SVHC_Flag?.toLowerCase() === "yes"} />
            <FlagBadge label="CMR" active={!["none", "no", ""].includes(ing.CMR_Flag?.toLowerCase())} />
            <FlagBadge label="Allergen" active={!["none", "no", ""].includes(ing.Allergen_Flag?.toLowerCase())} />
            <FlagBadge label="Endocrine" active={ing.Endocrine_Flag?.toLowerCase() === "yes"} />
            <FlagBadge label="Baby Caution" active={!!ing.Baby_Restriction && !["none", "no", ""].includes(ing.Baby_Restriction.toLowerCase())} />
            {ing.Vegan === "Yes" && (
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded border bg-green-50 text-green-700 border-green-200">Vegan</span>
            )}
          </div>

          {/* ID info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["CAS Number", ing.CAS_Number],
              ["EC Number", ing.EC_Number],
              ["Function", ing.Function],
              ["Category", ing.Category_Name],
              ["Origin", ing.Ingredient_Origin],
              ["Natural Index (ISO 16128)", ing.Natural_ISO16128 ? `${parseFloat(ing.Natural_ISO16128) * 100}%` : null],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label as string}>
                <div className="text-slate-400 text-xs font-normal uppercase tracking-wide mb-0.5">{label}</div>
                <div className="text-slate-700 font-medium">{value}</div>
              </div>
            ))}
          </div>

          {/* Safety notes */}
          {ing.Key_Safety_Notes && (
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">Safety Notes</div>
              <p className="text-slate-700 text-sm leading-relaxed">{ing.Key_Safety_Notes}</p>
            </div>
          )}

          {/* Regulatory status */}
          <div>
            <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">Regulatory Status</div>
            <div className="space-y-2">
              {[
                ["European Union", ing.EU_Status, ing.EU_Annex],
                ["India (Drugs & Cosmetics Act)", ing.India_Status, ""],
                ["United States (FDA)", ing.US_FDA_Status, ""],
                ["South Korea (MFDS)", ing.Korea_Status, ""],
              ].map(([market, status, annex]) => (
                <div key={market as string} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-600 text-sm">{market}</span>
                  <div className="text-right">
                    <StatusCell status={status as string} />
                    {annex && <div className="text-slate-400 text-[10px] mt-0.5">{annex}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Concentration limits */}
          {(ing.Max_Concentration_EU || ing.Max_Concentration_India) && (
            <div>
              <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">Concentration Limits</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-slate-400 text-xs mb-1">EU Max</div>
                  <div className="text-slate-800 font-medium text-sm">{ing.Max_Concentration_EU || "No limit"}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-slate-400 text-xs mb-1">India Max</div>
                  <div className="text-slate-800 font-medium text-sm">{ing.Max_Concentration_India || "No limit"}</div>
                </div>
              </div>
            </div>
          )}

          {/* Common products */}
          {ing.Common_Products && (
            <div>
              <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">Commonly Found In</div>
              <p className="text-slate-600 text-sm leading-relaxed">{ing.Common_Products}</p>
            </div>
          )}

          {/* Baby restriction */}
          {ing.Baby_Restriction && !["none", "no", ""].includes(ing.Baby_Restriction.toLowerCase()) && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="text-blue-700 text-xs font-medium uppercase tracking-wider mb-1">Baby / Infant Restriction</div>
              <p className="text-blue-700 text-sm">{ing.Baby_Restriction}</p>
            </div>
          )}

          {/* Source */}
          {ing.Source_Reference && (
            <div className="pt-2 border-t border-slate-100">
              <div className="text-slate-400 text-xs font-normal uppercase tracking-wide mb-1">Reference Sources</div>
              <p className="text-slate-500 text-xs leading-relaxed">{ing.Source_Reference}</p>
              <p className="text-slate-400 text-[11px] mt-1">Last updated: {ing.Last_Updated}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const CONCERN_FILTERS = ["All", "Low", "Low-Medium", "Medium", "High"];
const CATEGORY_MAP: Record<string, string> = {
  "SOLV": "Solvent / Carrier",
  "PRES": "Preservative",
  "EMOL": "Emollient",
  "SURF": "Surfactant",
  "EMUL": "Emulsifier",
  "HUMC": "Humectant",
  "ACTV": "Active",
  "ANTOX": "Antioxidant",
  "FRAG": "Fragrance",
  "COLR": "Colorant",
  "COND": "Conditioner",
  "POLY": "Polymer",
  "PIGM": "Pigment",
  "SUNF": "UV Filter",
  "BUFF": "pH Adjuster",
};

const PAGE_SIZE = 60;

export default function IngredientDirectory({ ingredients }: { ingredients: Ingredient[] }) {
  const [query, setQuery] = useState("");
  const [concern, setConcern] = useState("All");
  const [flagFilter, setFlagFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Ingredient | null>(null);

  const filtered = useMemo(() => {
    return ingredients.filter(ing => {
      const q = query.toLowerCase();
      const matchQuery = !q ||
        ing.INCI_Name.toLowerCase().includes(q) ||
        ing.Chemical_Name?.toLowerCase().includes(q) ||
        ing.CAS_Number?.includes(q) ||
        ing.Function?.toLowerCase().includes(q);
      const matchConcern = concern === "All" || ing.Concern_Level_TCS.toLowerCase().startsWith(concern.toLowerCase());
      const matchFlag =
        !flagFilter ||
        (flagFilter === "SVHC" && ing.SVHC_Flag?.toLowerCase() === "yes") ||
        (flagFilter === "CMR" && !["none", "no", ""].includes(ing.CMR_Flag?.toLowerCase())) ||
        (flagFilter === "Allergen" && !["none", "no", ""].includes(ing.Allergen_Flag?.toLowerCase())) ||
        (flagFilter === "Endocrine" && ing.Endocrine_Flag?.toLowerCase() === "yes") ||
        (flagFilter === "Vegan" && ing.Vegan === "Yes") ||
        (flagFilter === "Baby Caution" && !!ing.Baby_Restriction && !["none", "no", ""].includes(ing.Baby_Restriction.toLowerCase()));
      return matchQuery && matchConcern && matchFlag;
    });
  }, [ingredients, query, concern, flagFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetFilters() {
    setQuery(""); setConcern("All"); setFlagFilter(null); setPage(1);
  }

  const hasFilters = query || concern !== "All" || flagFilter;

  return (
    <div className="bg-white">
      {/* Search + filter bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search by INCI name, CAS number, or function…"
              className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-200 transition-colors">
                <X size={14} className="text-slate-500" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-slate-400 text-xs font-normal uppercase tracking-wide flex items-center gap-1.5 mr-1">
              <Filter size={12} /> Filter
            </span>

            {/* Concern */}
            {CONCERN_FILTERS.map(c => (
              <button key={c}
                onClick={() => { setConcern(c); setPage(1); }}
                className={`text-xs font-normal px-3 py-1.5 rounded-full border transition-all ${
                  concern === c
                    ? "bg-slate-800 text-white border-slate-800"
                    : "border-slate-200 text-slate-600 hover:border-slate-400 bg-white"
                }`}>
                {c}
              </button>
            ))}

            <span className="w-px h-5 bg-slate-200 mx-1" />

            {/* Flag filters */}
            {["SVHC", "CMR", "Allergen", "Endocrine", "Vegan", "Baby Caution"].map(f => (
              <button key={f}
                onClick={() => { setFlagFilter(flagFilter === f ? null : f); setPage(1); }}
                className={`text-xs font-normal px-3 py-1.5 rounded-full border transition-all ${
                  flagFilter === f
                    ? f === "Vegan"
                      ? "bg-green-700 text-white border-green-700"
                      : "bg-red-600 text-white border-red-600"
                    : "border-slate-200 text-slate-600 hover:border-slate-400 bg-white"
                }`}>
                {f}
              </button>
            ))}

            {hasFilters && (
              <button onClick={resetFilters} className="ml-2 text-xs text-slate-400 hover:text-slate-700 underline transition-colors">
                Clear all
              </button>
            )}

            <span className="ml-auto text-xs text-slate-400 font-mono">
              {filtered.length.toLocaleString()} of {ingredients.length.toLocaleString()} ingredients
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {pageItems.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <Search size={32} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">No ingredients found</p>
            <p className="text-sm mt-1">Try a different search term or clear your filters</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="text-left py-3 pr-4 text-xs font-medium text-slate-400 uppercase tracking-widest w-[30%]">INCI Name</th>
                    <th className="text-left py-3 pr-4 text-xs font-medium text-slate-400 uppercase tracking-widest w-[20%]">Function</th>
                    <th className="text-left py-3 pr-4 text-xs font-medium text-slate-400 uppercase tracking-widest w-[12%]">TCS Concern</th>
                    <th className="text-left py-3 pr-4 text-xs font-medium text-slate-400 uppercase tracking-widest w-[24%]">Flags</th>
                    <th className="text-left py-3 text-xs font-medium text-slate-400 uppercase tracking-widest w-[14%]">Regulatory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pageItems.map((ing) => (
                    <tr key={ing.INCI_Name}
                      onClick={() => setSelected(ing)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group">
                      <td className="py-3.5 pr-4">
                        <div className="font-normal text-slate-900 group-hover:text-teal-700 transition-colors">{ing.INCI_Name}</div>
                        {ing.Chemical_Name && ing.Chemical_Name !== ing.INCI_Name && (
                          <div className="text-slate-400 text-xs font-mono mt-0.5 truncate max-w-[220px]">{ing.Chemical_Name}</div>
                        )}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-500 text-xs leading-relaxed">
                        {ing.Function?.split("/")[0]?.trim() || ""}
                      </td>
                      <td className="py-3.5 pr-4">
                        <ConcernBadge level={ing.Concern_Level_TCS} />
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="flex flex-wrap gap-1">
                          <FlagBadge label="SVHC" active={ing.SVHC_Flag?.toLowerCase() === "yes"} />
                          <FlagBadge label="CMR" active={!["none", "no", ""].includes(ing.CMR_Flag?.toLowerCase())} />
                          <FlagBadge label="Allergen" active={!["none", "no", ""].includes(ing.Allergen_Flag?.toLowerCase())} />
                          <FlagBadge label="Endocrine" active={ing.Endocrine_Flag?.toLowerCase() === "yes"} />
                          {ing.Vegan === "Yes" && <FlagBadge label="Vegan" active={true} />}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 w-5">EU</span>
                            <StatusCell status={ing.EU_Status} />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 w-5">IN</span>
                            <StatusCell status={ing.India_Status} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {pageItems.map((ing) => (
                <div key={ing.INCI_Name}
                  onClick={() => setSelected(ing)}
                  className="bg-white border border-slate-100 rounded-2xl p-4 active:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="font-normal text-slate-900 text-sm leading-snug">{ing.INCI_Name}</div>
                    <ConcernBadge level={ing.Concern_Level_TCS} />
                  </div>
                  <div className="text-slate-400 text-xs mb-2">{ing.Function?.split("/")[0]?.trim()}</div>
                  <div className="flex flex-wrap gap-1">
                    <FlagBadge label="SVHC" active={ing.SVHC_Flag?.toLowerCase() === "yes"} />
                    <FlagBadge label="CMR" active={!["none", "no", ""].includes(ing.CMR_Flag?.toLowerCase())} />
                    <FlagBadge label="Allergen" active={!["none", "no", ""].includes(ing.Allergen_Flag?.toLowerCase())} />
                    <FlagBadge label="Endocrine" active={ing.Endocrine_Flag?.toLowerCase() === "yes"} />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12 pt-8 border-t border-slate-100">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-30 hover:border-slate-400 transition-all disabled:cursor-default">
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
                    return (
                      <button key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                          p === page ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-100"
                        }`}>
                        {p}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-30 hover:border-slate-400 transition-all disabled:cursor-default">
                  Next
                </button>
                <span className="text-slate-400 text-xs font-mono ml-2">
                  Page {page} of {totalPages}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail panel */}
      {selected && <DetailPanel ing={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
