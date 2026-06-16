"use client";

import { useState, useMemo } from "react";
import { Download, Search } from "lucide-react";

interface ReviewRow {
  id: string;
  product_id: string;
  product_name: string;
  user_name: string | null;
  user_email: string | null;
  rating: number;
  review_text: string;
  display_anonymously: boolean;
  public_display_name: string;
  status: string;
  created_at: string;
}

interface Props {
  reviews: ReviewRow[];
  productOptions: { id: string; name: string }[];
}

const FONT = "Helvetica, 'Helvetica Neue', Arial, sans-serif";
const FONT_DISPLAY = "'Cooper BT', Georgia, serif";

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-[#e3f1ef] text-[#248179]",
  pending:  "bg-amber-50 text-amber-700",
  rejected: "bg-[#ffe6e4] text-[#fd6158]",
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} width="11" height="11" viewBox="0 0 18 18" fill="none">
          <path
            d="M9 1.5l2.09 4.24 4.67.68-3.38 3.29.8 4.65L9 11.9l-4.18 2.46.8-4.65L2.24 6.42l4.67-.68z"
            fill={rating >= s ? "#fd6158" : "#d1cac7"}
          />
        </svg>
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function AdminReviewsClient({ reviews, productOptions }: Props) {
  const [search, setSearch] = useState("");
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (filterProduct !== "all" && r.product_id !== filterProduct) return false;
      if (filterRating !== "all" && r.rating !== parseInt(filterRating)) return false;
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (filterDateFrom && r.created_at < filterDateFrom) return false;
      if (filterDateTo && r.created_at > filterDateTo + "T23:59:59") return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.review_text.toLowerCase().includes(q) &&
          !r.product_name.toLowerCase().includes(q) &&
          !(r.user_name ?? "").toLowerCase().includes(q) &&
          !(r.user_email ?? "").toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [reviews, filterProduct, filterRating, filterStatus, filterDateFrom, filterDateTo, search]);

  async function handleExport() {
    setExporting(true);
    const params = new URLSearchParams();
    if (filterProduct !== "all") params.set("product_id", filterProduct);
    if (filterRating !== "all") params.set("rating", filterRating);
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (filterDateFrom) params.set("date_from", filterDateFrom);
    if (filterDateTo) params.set("date_to", filterDateTo);

    const res = await fetch(`/api/reviews/export?${params.toString()}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tcs-reviews-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  }

  return (
    <div style={{ fontFamily: FONT }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl text-[#282828] mb-1" style={{ fontFamily: FONT_DISPLAY }}>
            Consumer reviews
          </h1>
          <p className="text-sm text-[#b0a8a4]">
            {reviews.length} total &bull; {filtered.length} shown
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-[#248179] text-white text-sm rounded-xl hover:bg-[#1d6e67] transition-colors disabled:opacity-50"
        >
          <Download size={14} />
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#b0a8a4]/25 rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative xl:col-span-2">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0a8a4]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews, products, users..."
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-[#b0a8a4]/30 text-sm text-[#282828] placeholder-[#b0a8a4] focus:outline-none focus:border-[#248179] focus:ring-1 focus:ring-[#248179] transition-colors"
          />
        </div>

        {/* Product filter */}
        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#b0a8a4]/30 text-sm text-[#282828] focus:outline-none focus:border-[#248179] bg-white"
        >
          <option value="all">All products</option>
          {productOptions.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* Rating filter */}
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#b0a8a4]/30 text-sm text-[#282828] focus:outline-none focus:border-[#248179] bg-white"
        >
          <option value="all">All ratings</option>
          {[5,4,3,2,1].map((r) => (
            <option key={r} value={r}>{r} star{r !== 1 ? "s" : ""}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#b0a8a4]/30 text-sm text-[#282828] focus:outline-none focus:border-[#248179] bg-white"
        >
          <option value="all">All statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>

        {/* Date range */}
        <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3 xl:col-span-2">
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-[#b0a8a4]/30 text-sm text-[#282828] focus:outline-none focus:border-[#248179] bg-white"
          />
          <span className="text-xs text-[#b0a8a4] flex-shrink-0">to</span>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-[#b0a8a4]/30 text-sm text-[#282828] focus:outline-none focus:border-[#248179] bg-white"
          />
        </div>

        {/* Clear filters */}
        {(filterProduct !== "all" || filterRating !== "all" || filterStatus !== "all" || filterDateFrom || filterDateTo || search) && (
          <button
            onClick={() => { setFilterProduct("all"); setFilterRating("all"); setFilterStatus("all"); setFilterDateFrom(""); setFilterDateTo(""); setSearch(""); }}
            className="text-xs text-[#b0a8a4] hover:text-[#282828] transition-colors text-left"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white border border-[#b0a8a4]/25 rounded-2xl p-10 text-center">
          <p className="text-sm text-[#b0a8a4]">No reviews match the current filters.</p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="bg-white border border-[#b0a8a4]/25 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#faf7f2] border-b border-[#b0a8a4]/20">
                  {["Date", "Product", "User", "Rating", "Review", "Posted as", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-medium text-[#b0a8a4] uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#b0a8a4]/10">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-[#faf7f2]/60 transition-colors">
                    <td className="px-4 py-3 text-xs text-[#b0a8a4] whitespace-nowrap">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-[#282828] max-w-[140px] line-clamp-2 leading-snug">
                        {r.product_name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-[#282828]">{r.user_name ?? " - "}</div>
                      <div className="text-[11px] text-[#b0a8a4]">{r.user_email ?? " - "}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StarDisplay rating={r.rating} />
                      <span className="text-[11px] text-[#b0a8a4] block mt-0.5">{r.rating}/5</span>
                    </td>
                    <td className="px-4 py-3 max-w-[280px]">
                      <p className="text-xs text-[#282828] leading-relaxed line-clamp-3">
                        {r.review_text}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs text-[#282828]">{r.public_display_name}</div>
                      {r.display_anonymously && (
                        <div className="text-[11px] text-[#b0a8a4]">Anonymous</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex text-[10px] px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[r.status] ?? "bg-gray-50 text-gray-600"}`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
