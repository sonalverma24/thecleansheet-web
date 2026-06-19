"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import {
  Package, Star, Users, BarChart3, Plus, Upload,
  Database, Shield, ChevronRight, CheckCircle,
  AlertTriangle, Clock, Eye, EyeOff, Loader2,
} from "lucide-react";

type Stats = {
  products: number;
  published: number;
  pending: number;
  reviews: number;
  brands: number;
};

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number | string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#b0a8a4]/15 p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}12` }}>
        <Icon size={18} strokeWidth={1.5} style={{ color }} />
      </div>
      <div>
        <p className="text-[22px] text-[#282828]"
          style={{ fontFamily: "Cooper BT, Georgia, serif", fontWeight: 300 }}>
          {value}
        </p>
        <p className="text-[12px] text-[#b0a8a4]"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
          {label}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [isAdmin, setIsAdmin]     = useState<boolean | null>(null);
  const [stats, setStats]         = useState<Stats | null>(null);
  const [seeding, setSeeding]     = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [settingAdmin, setSettingAdmin] = useState(false);
  const [adminMsg, setAdminMsg]   = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsAdmin(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setIsAdmin(profile?.role === "admin");

      if (profile?.role === "admin") {
        const [
          { count: products },
          { count: published },
          { count: reviews },
          { count: brands },
        ] = await Promise.all([
          supabase.from("products").select("*", { count: "exact", head: true }),
          supabase.from("products").select("*", { count: "exact", head: true }).eq("is_published", true),
          supabase.from("product_reviews").select("*", { count: "exact", head: true }).eq("is_approved", false),
          supabase.from("brands").select("*", { count: "exact", head: true }),
        ]);
        setStats({
          products: products ?? 0,
          published: published ?? 0,
          pending: (products ?? 0) - (published ?? 0),
          reviews: reviews ?? 0,
          brands: brands ?? 0,
        });
      }
    })();
  }, [supabase]);

  const runSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch("/api/admin/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "tcs-bootstrap-2026" }),
      });
      const data = await res.json();
      const logLines = data.log?.length ? `\n${data.log.slice(0, 3).join("\n")}` : "";
      setSeedResult(
        data.success
          ? `Seeded ${data.brands} brands and ${data.products} products. ${data.errors} errors.${logLines}`
          : `Error: ${data.error}`
      );
      // refresh stats
      const { count: products } = await supabase.from("products").select("*", { count: "exact", head: true });
      const { count: brands }   = await supabase.from("brands").select("*", { count: "exact", head: true });
      setStats(s => s ? { ...s, products: products ?? s.products, published: products ?? s.published, brands: brands ?? s.brands } : s);
    } catch (e) {
      setSeedResult("Seed failed - check console");
    } finally {
      setSeeding(false);
    }
  };

  const setAdminRole = async () => {
    setSettingAdmin(true);
    setAdminMsg(null);
    try {
      const res = await fetch("/api/admin/set-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "tcs-bootstrap-2026" }),
      });
      const data = await res.json();
      const msg  = data.results?.map((r: { email: string; status: string }) => `${r.email}: ${r.status}`).join(" · ");
      setAdminMsg(msg ?? "Done");
    } catch {
      setAdminMsg("Failed");
    } finally {
      setSettingAdmin(false);
    }
  };

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <Shield size={32} strokeWidth={1} className="text-[#b0a8a4] mb-4" />
        <h1 className="text-[20px] text-[#282828] mb-2"
          style={{ fontFamily: "Cooper BT, Georgia, serif", fontWeight: 300 }}>
          Admin access required
        </h1>
        <p className="text-[13px] text-[#b0a8a4] mb-6"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
          Sign in with an admin account to access this area.
        </p>
        <Link href="/account"
          className="px-5 py-2.5 rounded-full text-white text-[13px]"
          style={{ background: "#248179", fontFamily: "Helvetica, Arial, sans-serif" }}>
          Sign in
        </Link>
      </div>
    );
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={20} strokeWidth={1.5} className="text-[#248179] animate-spin" />
      </div>
    );
  }

  // ── Admin dashboard ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f7f6f6]">
      {/* Header */}
      <div className="bg-white border-b border-[#b0a8a4]/15 px-4 sm:px-8 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="TCS" className="w-8 h-8 rounded-full" />
            <div>
              <h1 className="text-[16px] text-[#282828]"
                style={{ fontFamily: "Cooper BT, Georgia, serif", fontWeight: 300 }}>
                Admin Dashboard
              </h1>
              <p className="text-[11px] text-[#b0a8a4]"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                The Clean Sheet
              </p>
            </div>
          </div>
          <Link href="/" className="text-[12px] text-[#b0a8a4] hover:text-[#282828] transition-colors"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            ← Back to site
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard icon={Package}  label="Total products" value={stats.products}  color="#248179" />
            <StatCard icon={Eye}      label="Published"       value={stats.published} color="#248179" />
            <StatCard icon={EyeOff}   label="Unpublished"     value={stats.pending}   color="#D97706" />
            <StatCard icon={Star}     label="Reviews pending" value={stats.reviews}   color="#fd6158" />
            <StatCard icon={BarChart3} label="Brands"         value={stats.brands}    color="#282828" />
          </div>
        )}

        {/* Quick actions */}
        <div>
          <p className="text-[11px] tracking-widest uppercase text-[#b0a8a4] mb-3"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            Quick actions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { href: "/admin/products/new", icon: Plus,     label: "Add product",         sub: "Create a new product manually"       },
              { href: "/admin/products",     icon: Package,  label: "Manage products",      sub: "Edit, approve, publish or unpublish" },
              { href: "/admin/reviews",      icon: Star,     label: "Moderate reviews",     sub: "Approve or reject user reviews"      },
              { href: "/admin/brands",       icon: Users,    label: "Manage brands",        sub: "Add or edit brand profiles"          },
              { href: "/admin/articles",     icon: BarChart3, label: "Manage articles",     sub: "Write and publish learn content"     },
              { href: "/admin/csv-upload",   icon: Upload,   label: "Bulk CSV upload",      sub: "Upload products from a CSV file"     },
            ].map(({ href, icon: Icon, label, sub }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-[#b0a8a4]/15 hover:border-[#248179]/25 hover:shadow-sm transition-all group">
                <div className="w-9 h-9 rounded-full bg-[#f7f6f6] flex items-center justify-center flex-shrink-0 group-hover:bg-[#248179]/8 transition-colors">
                  <Icon size={16} strokeWidth={1.5} className="text-[#282828] group-hover:text-[#248179] transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#282828]"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                    {label}
                  </p>
                  <p className="text-[11px] text-[#b0a8a4] truncate"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                    {sub}
                  </p>
                </div>
                <ChevronRight size={14} strokeWidth={1.5} className="text-[#b0a8a4] group-hover:text-[#248179] transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Bootstrap tools */}
        <div>
          <p className="text-[11px] tracking-widest uppercase text-[#b0a8a4] mb-3"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            Setup tools
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Seed database */}
            <div className="bg-white rounded-2xl border border-[#b0a8a4]/15 p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#248179]/8 flex items-center justify-center flex-shrink-0">
                  <Database size={16} strokeWidth={1.5} className="text-[#248179]" />
                </div>
                <div>
                  <p className="text-[14px] text-[#282828]"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                    Seed product database
                  </p>
                  <p className="text-[12px] text-[#b0a8a4] mt-0.5"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                    Push all 200+ products from brand files into Supabase. Safe to re-run.
                  </p>
                </div>
              </div>
              <button onClick={runSeed} disabled={seeding}
                className="w-full py-3 rounded-full text-[13px] flex items-center justify-center gap-2 transition-all"
                style={{
                  fontFamily: "Helvetica, Arial, sans-serif",
                  background: seeding ? "#f7f6f6" : "#248179",
                  color:      seeding ? "#b0a8a4" : "white",
                }}>
                {seeding ? <><Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> Seeding…</> : "Run seed"}
              </button>
              {seedResult && (
                <p className="text-[12px] mt-3 flex items-start gap-1.5"
                  style={{
                    fontFamily: "Helvetica, Arial, sans-serif",
                    color: seedResult.startsWith("Error") ? "#fd6158" : "#248179",
                  }}>
                  {seedResult.startsWith("Error")
                    ? <AlertTriangle size={13} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" />
                    : <CheckCircle size={13} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" />}
                  {seedResult}
                </p>
              )}
            </div>

            {/* Set admin roles */}
            <div className="bg-white rounded-2xl border border-[#b0a8a4]/15 p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#248179]/8 flex items-center justify-center flex-shrink-0">
                  <Shield size={16} strokeWidth={1.5} className="text-[#248179]" />
                </div>
                <div>
                  <p className="text-[14px] text-[#282828]"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                    Grant admin roles
                  </p>
                  <p className="text-[12px] text-[#b0a8a4] mt-0.5"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                    Sets admin role for all emails in ADMIN_EMAILS env var.
                  </p>
                </div>
              </div>
              <button onClick={setAdminRole} disabled={settingAdmin}
                className="w-full py-3 rounded-full text-[13px] flex items-center justify-center gap-2 transition-all"
                style={{
                  fontFamily: "Helvetica, Arial, sans-serif",
                  background: settingAdmin ? "#f7f6f6" : "#248179",
                  color:      settingAdmin ? "#b0a8a4" : "white",
                }}>
                {settingAdmin ? <><Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> Working…</> : "Grant admin access"}
              </button>
              {adminMsg && (
                <p className="text-[12px] mt-3 text-[#248179] flex items-start gap-1.5"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                  <CheckCircle size={13} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" />
                  {adminMsg}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pending reviews */}
        <div className="bg-white rounded-2xl border border-[#b0a8a4]/15 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] text-[#282828]"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              Reviews awaiting moderation
            </p>
            <Link href="/admin/reviews"
              className="text-[12px] text-[#248179] hover:underline"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              Manage all →
            </Link>
          </div>
          {stats?.reviews === 0 ? (
            <p className="text-[13px] text-[#b0a8a4] flex items-center gap-2"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              <CheckCircle size={14} strokeWidth={1.5} className="text-[#248179]" />
              No reviews pending
            </p>
          ) : (
            <p className="text-[13px] text-[#282828] flex items-center gap-2"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              <Clock size={14} strokeWidth={1.5} className="text-[#D97706]" />
              {stats?.reviews} review{(stats?.reviews ?? 0) > 1 ? "s" : ""} waiting for approval
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
