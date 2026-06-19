"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import {
  Plus, Search, Eye, EyeOff, Edit, Loader2,
  CheckCircle, Clock, AlertTriangle
} from "lucide-react";

type Product = {
  id: string;
  product_name: string;
  brand_name: string;
  category: string;
  status: string;
  is_published: boolean;
  analysis_confidence: string;
  updated_at: string;
  product_scores: { total_score: number; score_label: string }[] | null;
};

function scoreColor(score: number) {
  if (score >= 90) return "#248179";
  if (score >= 75) return "#248179";
  if (score >= 60) return "#D97706";
  return "#fd6158";
}

export default function AdminProducts() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("products")
      .select("id,product_name,brand_name,category,status,is_published,analysis_confidence,updated_at,product_scores(total_score,score_label)")
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setProducts((data ?? []) as Product[]);
        setLoading(false);
      });
  }, [supabase]);

  const togglePublish = async (id: string, current: boolean) => {
    setToggling(id);
    await supabase.from("products").update({ is_published: !current }).eq("id", id);
    setProducts(ps => ps.map(p => p.id === id ? { ...p, is_published: !current } : p));
    setToggling(null);
  };

  const filtered = products.filter(p =>
    p.product_name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f7f6f6]">
      <div className="bg-white border-b border-[#b0a8a4]/15 px-4 sm:px-8 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-[11px] text-[#b0a8a4] hover:text-[#282828]"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              ← Dashboard
            </Link>
            <h1 className="text-[18px] text-[#282828] mt-1"
              style={{ fontFamily: "Cooper BT, Georgia, serif", fontWeight: 300 }}>
              Products
            </h1>
          </div>
          <Link href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-[13px]"
            style={{ background: "#248179", fontFamily: "Helvetica, Arial, sans-serif" }}>
            <Plus size={14} strokeWidth={1.5} /> Add product
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} strokeWidth={1.5}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b0a8a4]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full max-w-sm pl-9 pr-4 py-2.5 rounded-full bg-white border border-[#b0a8a4]/20 text-[13px] text-[#282828] placeholder-[#b0a8a4] focus:outline-none focus:border-[#248179]/40"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} strokeWidth={1.5} className="text-[#248179] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[14px] text-[#b0a8a4]" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              {products.length === 0 ? "No products yet. Run the seed or add one manually." : "No results."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#b0a8a4]/15 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#b0a8a4]/15">
                  {["Product", "Brand", "Category", "Score", "Status", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-[#b0a8a4]"
                      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const score = p.product_scores?.[0]?.total_score ?? null;
                  return (
                    <tr key={p.id} className="border-b border-[#b0a8a4]/10 last:border-0 hover:bg-[#f7f6f6]/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-[13px] text-[#282828] line-clamp-1"
                          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                          {p.product_name}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#b0a8a4]"
                        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                        {p.brand_name}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#b0a8a4]"
                        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                        {p.category}
                      </td>
                      <td className="px-4 py-3">
                        {score !== null ? (
                          <span className="text-[13px]"
                            style={{ color: scoreColor(score), fontFamily: "Helvetica, Arial, sans-serif" }}>
                            {score}
                          </span>
                        ) : (
                          <span className="text-[12px] text-[#b0a8a4]"
                            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                            - 
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-[11px]"
                          style={{
                            fontFamily: "Helvetica, Arial, sans-serif",
                            color: p.is_published ? "#248179" : "#b0a8a4",
                          }}>
                          {p.is_published
                            ? <><CheckCircle size={12} strokeWidth={1.5} /> Live</>
                            : <><Clock size={12} strokeWidth={1.5} /> Draft</>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/products/${p.id}`}
                            className="p-1.5 rounded-full hover:bg-[#248179]/8 text-[#b0a8a4] hover:text-[#248179] transition-colors">
                            <Edit size={13} strokeWidth={1.5} />
                          </Link>
                          <button
                            onClick={() => togglePublish(p.id, p.is_published)}
                            disabled={toggling === p.id}
                            className="p-1.5 rounded-full hover:bg-[#248179]/8 text-[#b0a8a4] hover:text-[#248179] transition-colors"
                            title={p.is_published ? "Unpublish" : "Publish"}>
                            {toggling === p.id
                              ? <Loader2 size={13} strokeWidth={1.5} className="animate-spin" />
                              : p.is_published
                                ? <EyeOff size={13} strokeWidth={1.5} />
                                : <Eye    size={13} strokeWidth={1.5} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
