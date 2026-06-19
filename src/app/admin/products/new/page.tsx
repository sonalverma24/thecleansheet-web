"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, AlertTriangle, Sparkles } from "lucide-react";

const RETAILERS = ["Amazon", "Nykaa", "Tira", "Myntra", "Brand Website", "Other"];
const STATUSES  = ["Public Data Review", "Verified Scorecard", "Certified Product", "Awaiting Evidence"];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] tracking-widest uppercase text-[#b0a8a4] mb-1.5"
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
        {label}{required && <span className="text-[#fd6158] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-[#b0a8a4]/25 text-[13px] text-[#282828] bg-white focus:outline-none focus:border-[#248179]/50 transition-colors placeholder-[#b0a8a4]";

export default function NewProduct() {
  const router  = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [form, setForm] = useState({
    brand_name:       "",
    product_name:     "",
    category:         "",
    subcategory:      "",
    size:             "",
    mrp:              "",
    ingredient_list:  "",
    claims:           "",
    status:           "Public Data Review",
    image_url:        "",
    retailers:        {} as Record<string, string>,
    verdict:          "",
    best_for:         "",
    avoid_if:         "",
    expert_summary:   "",
  });

  const [scoring, setScoring]   = useState(false);
  const [score, setScore]       = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const setRetailer = (name: string, url: string) =>
    setForm(f => ({ ...f, retailers: { ...f.retailers, [name]: url } }));

  // Run AI scoring
  const runScore = async () => {
    if (!form.ingredient_list.trim()) return;
    setScoring(true);
    setScore(null);
    try {
      const res = await fetch("/api/analyze", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url:             null,
          ingredientText:  form.ingredient_list,
          productName:     form.product_name,
          brand:           form.brand_name,
          category:        form.category,
          claims:          form.claims.split("\n").filter(Boolean),
        }),
      });
      const data = await res.json();
      setScore(data);
      if (data.verdict)        set("verdict", data.verdict);
      if (data.expertSummary)  set("expert_summary", data.expertSummary);
      if (data.bestFor?.length) set("best_for", data.bestFor.join(", "));
      if (data.avoidIf?.length) set("avoid_if", data.avoidIf.join(", "));
    } catch {
      setError("Scoring failed");
    } finally {
      setScoring(false);
    }
  };

  // Save to Supabase
  const handleSave = async () => {
    if (!form.brand_name || !form.product_name || !form.category || !form.ingredient_list) {
      setError("Brand, product name, category, and ingredient list are required.");
      return;
    }
    setSaving(true);
    setError(null);

    const slug = `${form.brand_name.toLowerCase().replace(/\s+/g, "-")}--${form.product_name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;

    // Upsert brand
    const { data: brandRow } = await supabase
      .from("brands")
      .upsert({ name: form.brand_name, slug: form.brand_name.toLowerCase().replace(/\s+/g, "-") }, { onConflict: "slug" })
      .select("id").single();

    const { data: productRow, error: productErr } = await supabase
      .from("products")
      .insert({
        brand_id:           brandRow?.id ?? null,
        brand_name:         form.brand_name,
        brand_slug:         form.brand_name.toLowerCase().replace(/\s+/g, "-"),
        product_name:       form.product_name,
        slug,
        category:           form.category,
        subcategory:        form.subcategory || null,
        mrp:                form.mrp ? parseFloat(form.mrp) : null,
        product_image_url:  form.image_url || null,
        ingredient_list:    form.ingredient_list,
        claims:             form.claims.split("\n").filter(Boolean),
        status:             form.status,
        analysis_confidence: "High",
        analyzed_at:        new Date().toISOString(),
        is_published:       false,
      })
      .select("id").single();

    if (productErr || !productRow) {
      setError(productErr?.message ?? "Failed to save product");
      setSaving(false);
      return;
    }

    // Save score if available
    if (score) {
      const s = score as Record<string, number>;
      await supabase.from("product_scores").insert({
        product_id:        productRow.id,
        total_score:       s.totalScore ?? 0,
        safety_score:      s.safetyScore ?? 0,
        formulation_score: s.formulationScore ?? 0,
        claims_score:      s.claimsScore ?? 0,
        ethics_score:      s.ethicsScore ?? 0,
        score_label:       (s.totalScore >= 90 ? "Excellent" : s.totalScore >= 75 ? "Good" : s.totalScore >= 60 ? "Fair" : "Use with Caution"),
        verdict:           form.verdict || null,
        best_for:          form.best_for.split(",").map(s => s.trim()).filter(Boolean),
        avoid_if:          form.avoid_if.split(",").map(s => s.trim()).filter(Boolean),
        expert_summary:    form.expert_summary || null,
      });
    }

    // Save retailer links
    for (const [name, url] of Object.entries(form.retailers)) {
      if (url.trim()) {
        await supabase.from("product_retailer_links").insert({
          product_id: productRow.id, retailer_name: name, url: url.trim(),
        });
      }
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => router.push("/admin/products"), 1500);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f6]">
      <div className="bg-white border-b border-[#b0a8a4]/15 px-4 sm:px-8 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/admin/products" className="text-[11px] text-[#b0a8a4] hover:text-[#282828]"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              ← Products
            </Link>
            <h1 className="text-[18px] text-[#282828] mt-1"
              style={{ fontFamily: "Cooper BT, Georgia, serif", fontWeight: 300 }}>
              Add product
            </h1>
          </div>
          <button onClick={handleSave} disabled={saving || saved}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-[13px] transition-all"
            style={{
              fontFamily: "Helvetica, Arial, sans-serif",
              background: saved ? "#248179" : saving ? "#b0a8a4" : "#248179",
            }}>
            {saving ? <><Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> Saving…</>
             : saved  ? <><CheckCircle size={14} strokeWidth={1.5} /> Saved</>
             : "Save product"}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {error && (
          <div className="flex items-start gap-2 p-4 rounded-2xl text-[13px] text-[#fd6158]"
            style={{ background: "rgba(253,97,88,0.06)", border: "1px solid rgba(253,97,88,0.2)", fontFamily: "Helvetica, Arial, sans-serif" }}>
            <AlertTriangle size={14} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Basic info */}
        <section className="bg-white rounded-2xl border border-[#b0a8a4]/15 p-6 space-y-4">
          <p className="text-[11px] tracking-widest uppercase text-[#b0a8a4]"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            Basic information
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Brand name" required>
              <input value={form.brand_name} onChange={e => set("brand_name", e.target.value)}
                placeholder="e.g. Minimalist" className={inputCls}
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }} />
            </Field>
            <Field label="Product name" required>
              <input value={form.product_name} onChange={e => set("product_name", e.target.value)}
                placeholder="e.g. Niacinamide 10% Face Serum" className={inputCls}
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }} />
            </Field>
            <Field label="Category" required>
              <input value={form.category} onChange={e => set("category", e.target.value)}
                placeholder="e.g. Serum, Sunscreen, Moisturiser" className={inputCls}
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }} />
            </Field>
            <Field label="Sub-category">
              <input value={form.subcategory} onChange={e => set("subcategory", e.target.value)}
                placeholder="e.g. Vitamin C Serum" className={inputCls}
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }} />
            </Field>
            <Field label="Size / Volume">
              <input value={form.size} onChange={e => set("size", e.target.value)}
                placeholder="e.g. 30ml" className={inputCls}
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }} />
            </Field>
            <Field label="MRP (₹)">
              <input value={form.mrp} onChange={e => set("mrp", e.target.value)}
                placeholder="e.g. 599" type="number" className={inputCls}
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }} />
            </Field>
            <Field label="Product image URL">
              <input value={form.image_url} onChange={e => set("image_url", e.target.value)}
                placeholder="https://…" className={inputCls}
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }} />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value)}
                className={inputCls} style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        </section>

        {/* Ingredients + scoring */}
        <section className="bg-white rounded-2xl border border-[#b0a8a4]/15 p-6 space-y-4">
          <p className="text-[11px] tracking-widest uppercase text-[#b0a8a4]"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            Ingredients & scoring
          </p>
          <Field label="Full ingredient list (INCI)" required>
            <textarea value={form.ingredient_list} onChange={e => set("ingredient_list", e.target.value)}
              rows={5} placeholder="Aqua, Glycerin, Niacinamide, Phenoxyethanol…"
              className={`${inputCls} resize-none`}
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }} />
          </Field>
          <Field label="Claims (one per line)">
            <textarea value={form.claims} onChange={e => set("claims", e.target.value)}
              rows={3} placeholder={"Clinically tested\nReduces pores in 4 weeks"}
              className={`${inputCls} resize-none`}
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }} />
          </Field>
          <button onClick={runScore} disabled={scoring || !form.ingredient_list.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] transition-all"
            style={{
              fontFamily: "Helvetica, Arial, sans-serif",
              background: scoring ? "#f7f6f6" : "rgba(36,129,121,0.08)",
              color:      scoring ? "#b0a8a4" : "#248179",
              border:     "1px solid rgba(36,129,121,0.2)",
            }}>
            {scoring
              ? <><Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> Analysing…</>
              : <><Sparkles size={14} strokeWidth={1.5} /> Run AI scoring</>}
          </button>
          {score && (
            <div className="p-4 rounded-2xl text-[13px]"
              style={{ background: "rgba(36,129,121,0.04)", border: "1px solid rgba(36,129,121,0.15)", fontFamily: "Helvetica, Arial, sans-serif" }}>
              <p className="text-[#248179] mb-1">Score generated</p>
              <p className="text-[#282828]">Total: <strong>{(score as { totalScore?: number }).totalScore ?? " - "}</strong></p>
            </div>
          )}
        </section>

        {/* Verdict + summary */}
        <section className="bg-white rounded-2xl border border-[#b0a8a4]/15 p-6 space-y-4">
          <p className="text-[11px] tracking-widest uppercase text-[#b0a8a4]"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            Consumer summary
          </p>
          <Field label="Verdict (one sentence)">
            <input value={form.verdict} onChange={e => set("verdict", e.target.value)}
              placeholder="Plain English verdict…" className={inputCls}
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }} />
          </Field>
          <Field label="Best for (comma-separated)">
            <input value={form.best_for} onChange={e => set("best_for", e.target.value)}
              placeholder="Oily skin, Acne-prone, Hyperpigmentation" className={inputCls}
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }} />
          </Field>
          <Field label="Avoid if (comma-separated)">
            <input value={form.avoid_if} onChange={e => set("avoid_if", e.target.value)}
              placeholder="Fragrance sensitivity, Rosacea" className={inputCls}
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }} />
          </Field>
          <Field label="Expert summary">
            <textarea value={form.expert_summary} onChange={e => set("expert_summary", e.target.value)}
              rows={4} placeholder="Explain why the score is high or low…"
              className={`${inputCls} resize-none`}
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }} />
          </Field>
        </section>

        {/* Retailer links */}
        <section className="bg-white rounded-2xl border border-[#b0a8a4]/15 p-6 space-y-4">
          <p className="text-[11px] tracking-widest uppercase text-[#b0a8a4]"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            Buy now links
          </p>
          {RETAILERS.map(r => (
            <Field key={r} label={r}>
              <input
                value={form.retailers[r] ?? ""}
                onChange={e => setRetailer(r, e.target.value)}
                placeholder={`${r} product URL`}
                className={inputCls}
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }} />
            </Field>
          ))}
        </section>

        {/* Bottom save */}
        <button onClick={handleSave} disabled={saving || saved}
          className="w-full py-4 rounded-full text-white text-[14px] flex items-center justify-center gap-2 transition-all"
          style={{
            fontFamily: "Helvetica, Arial, sans-serif",
            background: saved ? "#248179" : saving ? "#b0a8a4" : "#248179",
          }}>
          {saving ? <><Loader2 size={15} strokeWidth={1.5} className="animate-spin" /> Saving…</>
           : saved  ? <><CheckCircle size={15} strokeWidth={1.5} /> Saved - redirecting</>
           : "Save product (draft)"}
        </button>
      </div>
    </div>
  );
}
