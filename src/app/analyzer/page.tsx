"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, Send, Search, RotateCcw, ChevronDown, ChevronUp,
  CheckCircle2, AlertTriangle, Info, MessageSquare,
  Shield, FlaskConical, FileText, Globe, Zap, Eye,
  Star, Loader2, ExternalLink, Award
} from "lucide-react";
import type { Scorecard, ChatMessage, ComparisonResult, ExpertAnswer } from "@/lib/types";

/* ─── Known product redirect map ───────────────────────────────────────────
   If a user pastes a brand product URL for a product we already have a full
   scorecard for, skip the AI engine entirely and redirect to the static page.
   Patterns are checked against a lowercased version of the input.
   Order matters: more specific patterns (e.g. strawberry + sunscreen) must
   appear before generic ones (e.g. just vitamin-c).
─────────────────────────────────────────────────────────────────────────── */
const PRODUCT_REDIRECTS: Array<{ test: (u: string) => boolean; path: string }> = [
  // ── Minimalist (beminimalist.co) ──────────────────────────────────────────
  { test: u => u.includes("beminimalist.co") && u.includes("niacinamide"),   path: "/brands/minimalist/niacinamide-10-face-serum" },
  { test: u => u.includes("beminimalist.co") && u.includes("vitamin-c"),     path: "/brands/minimalist/vitamin-c-10-face-serum" },
  { test: u => u.includes("beminimalist.co") && u.includes("salicylic"),     path: "/brands/minimalist/salicylic-acid-2-face-serum" },
  { test: u => u.includes("beminimalist.co") && u.includes("alpha-arbutin"), path: "/brands/minimalist/alpha-arbutin-2-face-serum" },
  { test: u => u.includes("beminimalist.co") && u.includes("retinol"),       path: "/brands/minimalist/retinol-03-face-serum" },
  { test: u => u.includes("beminimalist.co") && u.includes("aha"),           path: "/brands/minimalist/aha-pha-bha-face-peel" },
  { test: u => u.includes("beminimalist.co") && u.includes("spf"),           path: "/brands/minimalist/spf-50-pa-sunscreen" },
  { test: u => u.includes("beminimalist.co") && u.includes("vitamin-b5"),    path: "/brands/minimalist/vitamin-b5-10-moisturizer" },

  // ── Dot & Key (dotandkey.com) ─────────────────────────────────────────────
  { test: u => u.includes("dotandkey.com") && u.includes("strawberry-dew"),                           path: "/brands/dot-and-key/strawberry-dew-tinted-sunscreen" },
  { test: u => u.includes("dotandkey.com") && u.includes("watermelon") && u.includes("sunscreen"),    path: "/brands/dot-and-key/watermelon-cooling-sunscreen-spf-50" },
  { test: u => u.includes("dotandkey.com") && u.includes("vitamin-c") && u.includes("sunscreen"),     path: "/brands/dot-and-key/vitamin-c-e-sunscreen-spf-50" },
  { test: u => u.includes("dotandkey.com") && u.includes("barrier-repair") && u.includes("face-wash"),path: "/brands/dot-and-key/barrier-repair-face-wash" },
  { test: u => u.includes("dotandkey.com") && u.includes("barrier-repair"),                           path: "/brands/dot-and-key/barrier-repair-restore-moisturizer" },
  { test: u => u.includes("dotandkey.com") && u.includes("niacinamide"),                              path: "/brands/dot-and-key/strawberry-bright-niacinamide-serum" },
  { test: u => u.includes("dotandkey.com") && u.includes("vitamin-c") && u.includes("sorbet"),        path: "/brands/dot-and-key/vitamin-c-e-sorbet-moisturizer" },
  { test: u => u.includes("dotandkey.com") && u.includes("vitamin-c") && u.includes("serum"),         path: "/brands/dot-and-key/vitamin-c-e-face-serum" },
  { test: u => u.includes("dotandkey.com") && (u.includes("72hr") || u.includes("hydrating-gel")),    path: "/brands/dot-and-key/72hr-hydrating-gel-moisturizer" },
  { test: u => u.includes("dotandkey.com") && u.includes("retinol"),                                  path: "/brands/dot-and-key/retinol-ceramide-night-cream" },

  // ── Kiehl's (kiehls.com) ──────────────────────────────────────────────────
  { test: u => u.includes("kiehls.com") && u.includes("ultra-facial-cleanser"),   path: "/brands/kiehls/ultra-facial-cleanser" },
  { test: u => u.includes("kiehls.com") && u.includes("ultra-facial-cream"),      path: "/brands/kiehls/ultra-facial-cream" },
  { test: u => u.includes("kiehls.com") && u.includes("calendula"),               path: "/brands/kiehls/calendula-herbal-extract-toner" },
  { test: u => u.includes("kiehls.com") && u.includes("clearly-corrective"),      path: "/brands/kiehls/clearly-corrective-dark-spot-solution" },
  { test: u => u.includes("kiehls.com") && u.includes("midnight-recovery"),       path: "/brands/kiehls/midnight-recovery-concentrate" },
  { test: u => u.includes("kiehls.com") && u.includes("powerful-strength"),       path: "/brands/kiehls/powerful-strength-line-reducing-concentrate" },
  { test: u => u.includes("kiehls.com") && u.includes("rare-earth"),              path: "/brands/kiehls/rare-earth-deep-pore-cleansing-masque" },
  { test: u => u.includes("kiehls.com") && u.includes("creamy-eye"),              path: "/brands/kiehls/creamy-eye-treatment-with-avocado" },

  // ── Pilgrim (discoverpilgrim.com) ─────────────────────────────────────────
  { test: u => u.includes("discoverpilgrim.com") && u.includes("hyaluronic"),                                          path: "/brands/pilgrim/2-percent-hyaluronic-acid-serum" },
  { test: u => u.includes("discoverpilgrim.com") && u.includes("niacinamide") && u.includes("kojic"),                 path: "/brands/pilgrim/10-percent-niacinamide-kojic-acid-serum" },
  { test: u => u.includes("discoverpilgrim.com") && u.includes("salicylic") && u.includes("niacinamide"),             path: "/brands/pilgrim/salicylic-acid-2-niacinamide-3-oil-control-serum" },
  { test: u => u.includes("discoverpilgrim.com") && (u.includes("vitamin-c") || u.includes("eaa")),                   path: "/brands/pilgrim/15-percent-vitamin-c-eaa-serum" },
  { test: u => u.includes("discoverpilgrim.com") && u.includes("red-vine") && u.includes("retinol"),                  path: "/brands/pilgrim/red-vine-retinol-night-gel-creme" },
  { test: u => u.includes("discoverpilgrim.com") && u.includes("red-vine"),                                            path: "/brands/pilgrim/red-vine-anti-ageing-serum" },
  { test: u => u.includes("discoverpilgrim.com") && u.includes("aha"),                                                 path: "/brands/pilgrim/25-aha-2-bha-5-pha-peeling-solution" },
  { test: u => u.includes("discoverpilgrim.com") && (u.includes("sunscreen") || u.includes("spf")),                   path: "/brands/pilgrim/2-percent-niacinamide-glow-sunscreen-spf-50" },
];

// Text-based name queries for known products (handles "minimalist sunscreen", "dot and key retinol" etc.)
const NAME_REDIRECTS: Array<{ test: (q: string) => boolean; path: string }> = [
  // Minimalist
  { test: q => (q.includes("minimalist") || q.includes("beminimalist")) && (q.includes("sunscreen") || q.includes("spf")), path: "/brands/minimalist/spf-50-pa-sunscreen" },
  { test: q => (q.includes("minimalist") || q.includes("beminimalist")) && q.includes("niacinamide"),  path: "/brands/minimalist/niacinamide-10-face-serum" },
  { test: q => (q.includes("minimalist") || q.includes("beminimalist")) && q.includes("vitamin c"),    path: "/brands/minimalist/vitamin-c-10-face-serum" },
  { test: q => (q.includes("minimalist") || q.includes("beminimalist")) && q.includes("salicylic"),    path: "/brands/minimalist/salicylic-acid-2-face-serum" },
  { test: q => (q.includes("minimalist") || q.includes("beminimalist")) && q.includes("arbutin"),      path: "/brands/minimalist/alpha-arbutin-2-face-serum" },
  { test: q => (q.includes("minimalist") || q.includes("beminimalist")) && q.includes("retinol"),      path: "/brands/minimalist/retinol-03-face-serum" },
  { test: q => (q.includes("minimalist") || q.includes("beminimalist")) && q.includes("aha"),          path: "/brands/minimalist/aha-pha-bha-face-peel" },
  { test: q => (q.includes("minimalist") || q.includes("beminimalist")) && (q.includes("b5") || q.includes("panthenol")), path: "/brands/minimalist/vitamin-b5-10-moisturizer" },
  // Dot & Key
  { test: q => q.includes("dot") && q.includes("key") && (q.includes("sunscreen") || q.includes("spf")) && q.includes("watermelon"), path: "/brands/dot-and-key/watermelon-cooling-sunscreen-spf-50" },
  { test: q => q.includes("dot") && q.includes("key") && (q.includes("sunscreen") || q.includes("spf")) && q.includes("strawberry"), path: "/brands/dot-and-key/strawberry-dew-tinted-sunscreen" },
  { test: q => q.includes("dot") && q.includes("key") && (q.includes("sunscreen") || q.includes("spf")) && q.includes("vitamin c"), path: "/brands/dot-and-key/vitamin-c-e-sunscreen-spf-50" },
  { test: q => q.includes("dot") && q.includes("key") && q.includes("barrier") && q.includes("wash"),  path: "/brands/dot-and-key/barrier-repair-face-wash" },
  { test: q => q.includes("dot") && q.includes("key") && q.includes("barrier"),                        path: "/brands/dot-and-key/barrier-repair-restore-moisturizer" },
  { test: q => q.includes("dot") && q.includes("key") && q.includes("niacinamide"),                    path: "/brands/dot-and-key/strawberry-bright-niacinamide-serum" },
  { test: q => q.includes("dot") && q.includes("key") && q.includes("vitamin c") && q.includes("serum"), path: "/brands/dot-and-key/vitamin-c-e-face-serum" },
  { test: q => q.includes("dot") && q.includes("key") && q.includes("retinol"),                        path: "/brands/dot-and-key/retinol-ceramide-night-cream" },
  // Kiehl's
  { test: q => q.includes("kiehl") && q.includes("calendula"),       path: "/brands/kiehls/calendula-herbal-extract-toner" },
  { test: q => q.includes("kiehl") && q.includes("midnight"),        path: "/brands/kiehls/midnight-recovery-concentrate" },
  { test: q => q.includes("kiehl") && q.includes("clearly corrective"), path: "/brands/kiehls/clearly-corrective-dark-spot-solution" },
  { test: q => q.includes("kiehl") && q.includes("rare earth"),      path: "/brands/kiehls/rare-earth-deep-pore-cleansing-masque" },
  { test: q => q.includes("kiehl") && q.includes("creamy eye"),      path: "/brands/kiehls/creamy-eye-treatment-with-avocado" },
  { test: q => q.includes("kiehl") && q.includes("powerful"),        path: "/brands/kiehls/powerful-strength-line-reducing-concentrate" },
  { test: q => q.includes("kiehl") && q.includes("ultra facial cream"), path: "/brands/kiehls/ultra-facial-cream" },
  { test: q => q.includes("kiehl") && q.includes("ultra facial cleanser"), path: "/brands/kiehls/ultra-facial-cleanser" },
  // Pilgrim
  { test: q => q.includes("pilgrim") && (q.includes("hyaluronic") || q.includes("ha serum")),                                       path: "/brands/pilgrim/2-percent-hyaluronic-acid-serum" },
  { test: q => q.includes("pilgrim") && q.includes("niacinamide") && q.includes("kojic"),                                           path: "/brands/pilgrim/10-percent-niacinamide-kojic-acid-serum" },
  { test: q => q.includes("pilgrim") && q.includes("salicylic") && q.includes("niacinamide"),                                       path: "/brands/pilgrim/salicylic-acid-2-niacinamide-3-oil-control-serum" },
  { test: q => q.includes("pilgrim") && (q.includes("vitamin c") || q.includes("eaa")),                                             path: "/brands/pilgrim/15-percent-vitamin-c-eaa-serum" },
  { test: q => q.includes("pilgrim") && q.includes("retinol") && (q.includes("night") || q.includes("red vine")),                   path: "/brands/pilgrim/red-vine-retinol-night-gel-creme" },
  { test: q => q.includes("pilgrim") && q.includes("red vine") && q.includes("serum"),                                              path: "/brands/pilgrim/red-vine-anti-ageing-serum" },
  { test: q => q.includes("pilgrim") && (q.includes("aha") || q.includes("peeling") || q.includes("peel")),                        path: "/brands/pilgrim/25-aha-2-bha-5-pha-peeling-solution" },
  { test: q => q.includes("pilgrim") && (q.includes("sunscreen") || q.includes("spf")),                                             path: "/brands/pilgrim/2-percent-niacinamide-glow-sunscreen-spf-50" },
];

function findProductRedirect(query: string): string | null {
  const q = query.trim().toLowerCase();
  // URL-based matching
  if (q.includes(".")) {
    const urlMatch = PRODUCT_REDIRECTS.find(r => r.test(q));
    if (urlMatch) return urlMatch.path;
  }
  // Name/text-based matching
  const nameMatch = NAME_REDIRECTS.find(r => r.test(q));
  return nameMatch ? nameMatch.path : null;
}

/* ─── Helpers ─── */
function uid() { return Math.random().toString(36).slice(2); }

function scoreColor(s: number) {
  if (s >= 90) return "#4ade80";
  if (s >= 70) return "#2dd4bf";
  if (s >= 50) return "#fbbf24";
  return "#f87171";
}

function scoreLabel(s: number) {
  if (s >= 90) return { label: "Excellent", color: "#4ade80" };
  if (s >= 70) return { label: "Good",      color: "#2dd4bf" };
  if (s >= 50) return { label: "Fair",      color: "#fbbf24" };
  return              { label: "Concern",   color: "#f87171" };
}

function pillarIcon(name: string) {
  if (name.includes("Safety"))      return Shield;
  if (name.includes("Irritation"))  return AlertTriangle;
  if (name.includes("Disclosure"))  return FileText;
  if (name.includes("Regulatory"))  return Globe;
  if (name.includes("Efficacy"))    return FlaskConical;
  if (name.includes("Transparency")) return Eye;
  return Zap;
}

function pillarBarColor(pct: number) {
  if (pct >= 80) return "#4ade80";
  if (pct >= 60) return "#2dd4bf";
  if (pct >= 40) return "#fbbf24";
  return "#f87171";
}

/* ─── Score Gauge ─── */
function ScoreGauge({ score }: { score: number }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t); }, []);

  const r = 60, sw = 10;
  const circ = 2 * Math.PI * r;
  const offset = animated ? circ - (score / 100) * circ : circ;
  const col = scoreColor(score);
  const tier = scoreLabel(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full blur-xl opacity-30" style={{ background: col }} />
        <svg width="152" height="152" viewBox="0 0 152 152" className="relative">
          {/* Track */}
          <circle cx="76" cy="76" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
          {/* Progress arc */}
          <circle
            cx="76" cy="76" r={r}
            fill="none"
            stroke={col}
            strokeWidth={sw}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 76 76)"
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 8px ${col}90)` }}
          />
          {/* Score text */}
          <text x="76" y="70" textAnchor="middle" fontSize="34" fontWeight="600" fill="#f0fdfa" fontFamily="var(--font-geist-sans)">{score}</text>
          <text x="76" y="88" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.35)" fontFamily="var(--font-geist-sans)">/100</text>
        </svg>
      </div>
      <span className="text-sm font-medium px-4 py-1.5 rounded-full" style={{ color: col, background: `${col}18`, border: `1px solid ${col}35` }}>
        {tier.label}
      </span>
    </div>
  );
}

/* ─── Animated Pillar Bar ─── */
function PillarBar({ pct, color }: { pct: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 150); return () => clearTimeout(t); }, [pct]);
  return (
    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${w}%`,
          background: color,
          boxShadow: `0 0 6px ${color}60`,
          transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}

/* ─── Badge Row ─── */
function BadgeRow({
  items, icon: Icon, color, bg, border
}: {
  items: string[];
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((b, i) => (
        <span key={i} style={{ width: 'fit-content', whiteSpace: 'nowrap' }} className={`inline-flex items-center gap-1.5 text-xs font-normal px-3 py-1.5 rounded-full border ${bg} ${color} ${border}`}>
          <Icon size={11} />
          {b}
        </span>
      ))}
    </div>
  );
}

/* ─── Ingredient Row ─── */
function IngredientRow({ name, note, flag }: { name: string; note: string; flag: "ok" | "warn" | "info" }) {
  const [open, setOpen] = useState(false);
  const C = {
    ok:   { dot: "#4ade80", text: "rgba(74,222,128,0.8)",   bg: "rgba(74,222,128,0.06)",   border: "rgba(74,222,128,0.15)" },
    warn: { dot: "#fbbf24", text: "rgba(251,191,36,0.8)",   bg: "rgba(251,191,36,0.06)",   border: "rgba(251,191,36,0.15)" },
    info: { dot: "#5eead4", text: "rgba(94,234,212,0.7)",   bg: "rgba(94,234,212,0.06)",   border: "rgba(94,234,212,0.15)" },
  }[flag];

  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left rounded-xl px-3 py-2.5 transition-all"
      style={{ background: open ? C.bg : "transparent", border: `1px solid ${open ? C.border : "transparent"}` }}
    >
      <div className="flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: C.dot, boxShadow: `0 0 5px ${C.dot}80` }} />
        <span className="text-sm font-normal flex-1" style={{ color: "rgba(255,255,255,0.8)" }}>{name}</span>
        {flag === "warn" && <AlertTriangle size={12} style={{ color: "#fbbf24" }} className="flex-shrink-0" />}
        {open
          ? <ChevronUp size={12} style={{ color: "rgba(255,255,255,0.3)" }} className="flex-shrink-0" />
          : <ChevronDown size={12} style={{ color: "rgba(255,255,255,0.3)" }} className="flex-shrink-0" />}
      </div>
      {open && <p className="mt-1.5 pl-5 text-xs leading-relaxed" style={{ color: C.text }}>{note}</p>}
    </button>
  );
}

/* ─── Full Scorecard ─── */
function ScorecardView({ card }: { card: Scorecard }) {
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const ingredients = card.ingredients || [];
  const visibleIngredients = showAllIngredients ? ingredients : ingredients.slice(0, 10);

  return (
    <div className="space-y-4" style={{ animation: "tcs-fadeUp 0.4s ease both" }}>

      {/* ── Hero card ── */}
      <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(160deg,#091c1a 0%,#0d2b27 60%,#091e1c 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {/* Scan line */}
        <div className="relative h-0.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="absolute inset-y-0 w-24 opacity-60" style={{ background: "linear-gradient(90deg,transparent,#5eead4,transparent)", animation: "tcs-scan 2.5s ease-in-out infinite" }} />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: "rgba(94,234,212,0.5)" }}>Clean Sheet™ · Scoring Engine · Active</span>
          </div>

          {/* Product + gauge */}
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-6">
            <ScoreGauge score={card.score} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] mb-2" style={{ color: "rgba(94,234,212,0.5)" }}>{card.brand}</p>
              <h2 className="text-xl sm:text-2xl font-medium leading-tight mb-3" style={{ color: "#f0fdfa" }}>{card.productName}</h2>
              <div className="flex flex-wrap items-center gap-2">
                {card.priceRange && (
                  <span className="text-sm font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>{card.priceRange}</span>
                )}
                {card.productType && (
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ color: "#5eead4", background: "rgba(94,234,212,0.1)", border: "1px solid rgba(94,234,212,0.2)" }}>
                    {card.productType}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <p className="text-sm leading-relaxed mb-6 px-4 py-3 rounded-2xl"
            style={{ color: "rgba(153,246,228,0.7)", background: "rgba(94,234,212,0.05)", border: "1px solid rgba(94,234,212,0.1)" }}>
            {card.summary}
          </p>

          {/* Badges */}
          {(card.pass_badges?.length > 0 || card.warn_badges?.length > 0 || card.info_badges?.length > 0) && (
            <div className="space-y-3">
              <BadgeRow items={card.pass_badges} icon={CheckCircle2} color="text-safe-700" bg="bg-safe-100" border="border-safe-500/30" />
              <BadgeRow items={card.warn_badges} icon={AlertTriangle} color="text-caution-600" bg="bg-caution-100" border="border-caution-500/40" />
              <BadgeRow items={card.info_badges} icon={Info} color="text-teal-600" bg="bg-teal-50" border="border-teal-200" />
            </div>
          )}

          <p className="mt-5 text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
            Gives a clean sheet score based on publicly available data · Suggests science-backed safer alternatives
          </p>
        </div>
      </div>

      {/* ── Pillars ── */}
      {card.pillars?.length > 0 && (
        <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(160deg,#091c1a 0%,#0d2b27 60%,#091e1c 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: "rgba(94,234,212,0.6)" }}>Score Breakdown</h3>
          </div>
          <div className="p-6 space-y-5">
            {card.pillars.map((p) => {
              const PIcon = pillarIcon(p.name);
              const pct = Math.round((p.score / p.max) * 100);
              const barCol = pillarBarColor(pct);
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                      <PIcon size={13} style={{ color: barCol }} />
                      {p.name}
                    </span>
                    <span className="text-sm font-mono tabular-nums" style={{ color: barCol }}>
                      {p.score}<span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>/{p.max}</span>
                    </span>
                  </div>
                  <PillarBar pct={pct} color={barCol} />
                  {p.note && (
                    <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>{p.note}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Key Actives ── */}
      {card.keyActives?.length > 0 && (
        <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(160deg,#091c1a 0%,#0d2b27 60%,#091e1c 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: "rgba(94,234,212,0.6)" }}>Key Actives</h3>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-2 gap-3">
              {card.keyActives.map((a, i) => (
                <div key={i} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(94,234,212,0.1)" }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Star size={12} style={{ color: "#fbbf24" }} className="flex-shrink-0" />
                    <span className="text-sm font-normal" style={{ color: "#f0fdfa" }}>{a.name}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{a.function}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Ingredients ── */}
      {ingredients.length > 0 && (
        <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(160deg,#091c1a 0%,#0d2b27 60%,#091e1c 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: "rgba(94,234,212,0.6)" }}>Full Ingredient List</h3>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />Safe</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />Caution</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block" />Info</span>
            </div>
          </div>
          <div className="p-4 space-y-0.5">
            {visibleIngredients.map((ing, i) => (
              <IngredientRow key={i} name={ing.name} note={ing.note} flag={ing.flag} />
            ))}
          </div>
          {ingredients.length > 10 && (
            <div className="px-4 pb-4">
              <button
                onClick={() => setShowAllIngredients(!showAllIngredients)}
                className="w-full flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl transition-all"
                style={{ color: "#5eead4", border: "1px solid rgba(94,234,212,0.15)", background: "rgba(94,234,212,0.04)" }}
              >
                {showAllIngredients ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showAllIngredients ? "Show less" : `Show all ${ingredients.length} ingredients`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── India Context ── */}
      {card.indiaContext && (
        <div className="rounded-3xl p-6" style={{ background: "linear-gradient(135deg,#0d2b27,#0f3d38)", border: "1px solid rgba(94,234,212,0.15)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🇮🇳</span>
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: "rgba(94,234,212,0.6)" }}>India Context</h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(153,246,228,0.7)" }}>{card.indiaContext}</p>
        </div>
      )}

      {/* ── Data Source ── */}
      {card.dataSource && (
        <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(160deg,#091c1a 0%,#0d2b27 60%,#091e1c 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: "rgba(94,234,212,0.6)" }}>Research Sources</h3>
          </div>
          <div className="p-6 grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>INCI Source</div>
              <div className="font-mono text-sm" style={{ color: card.dataSource.inciFound ? "#4ade80" : "#fbbf24" }}>
                {card.dataSource.inciFound ? "✓ Found" : "⚠ Partial"} · {card.dataSource.inciSource}
              </div>
            </div>
            {card.dataSource.rating && (
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>User Rating</div>
                <div className="font-mono text-sm" style={{ color: "#f0fdfa" }}>
                  ★ {card.dataSource.rating}/5 · {card.dataSource.reviewCount}
                </div>
              </div>
            )}
            {card.dataSource.priceSource && (
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>Price Source</div>
                <div className="font-mono text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{card.dataSource.priceSource}</div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

/* ─── Chat Bubble ─── */
function ChatBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%] text-sm leading-relaxed"
          style={{ background: "rgba(94,234,212,0.12)", border: "1px solid rgba(94,234,212,0.2)", color: "#f0fdfa" }}>
          {msg.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "rgba(94,234,212,0.12)", border: "1px solid rgba(94,234,212,0.2)" }}>
        <Sparkles size={13} style={{ color: "#5eead4" }} />
      </div>
      <div className="rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.75)" }}>
        {msg.isStreaming && !msg.content ? (
          <div className="flex gap-1.5 items-center py-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#5eead4", animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        ) : msg.content}
      </div>
    </div>
  );
}

/* ─── Expert Answer View ─── */
function AnswerView({ answer }: { answer: ExpertAnswer }) {
  const verdictCol = {
    safe:    "#4ade80",
    caution: "#fbbf24",
    avoid:   "#f87171",
    info:    "#5eead4",
  }[answer.verdict] ?? "#5eead4";

  const VIcon = answer.verdict === "safe" ? CheckCircle2 : answer.verdict === "info" ? Info : AlertTriangle;

  return (
    <div className="space-y-4" style={{ animation: "tcs-fadeUp 0.4s ease both" }}>
      <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(160deg,#091c1a 0%,#0d2b27 60%,#091e1c 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="relative h-0.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="absolute inset-y-0 w-24 opacity-60" style={{ background: "linear-gradient(90deg,transparent,#5eead4,transparent)", animation: "tcs-scan 2.5s ease-in-out infinite" }} />
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-5">
            <div className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `${verdictCol}15`, border: `1px solid ${verdictCol}30` }}>
              <VIcon size={20} style={{ color: verdictCol }} />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1" style={{ color: "rgba(94,234,212,0.5)" }}>The Clean Sheet™ Verdict</p>
              <h2 className="text-lg font-medium leading-tight mb-2" style={{ color: "#f0fdfa" }}>{answer.question}</h2>
              <span className="inline-flex items-center text-xs font-mono px-3 py-1 rounded-full" style={{ color: verdictCol, background: `${verdictCol}15`, border: `1px solid ${verdictCol}30` }}>
                {answer.verdictLabel}
              </span>
            </div>
          </div>

          <p className="text-sm leading-relaxed mb-5 px-4 py-3 rounded-2xl" style={{ color: "rgba(153,246,228,0.7)", background: "rgba(94,234,212,0.05)", border: "1px solid rgba(94,234,212,0.1)" }}>
            {answer.text}
          </p>

          {answer.keyPoints?.length > 0 && (
            <div className="space-y-2 mb-5">
              {answer.keyPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ background: "#5eead4" }} />
                  {point}
                </div>
              ))}
            </div>
          )}

          {answer.indiaContext && (
            <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg,#0d2b27,#0f3d38)", border: "1px solid rgba(94,234,212,0.15)" }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">🇮🇳</span>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: "rgba(94,234,212,0.6)" }}>India Context</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(153,246,228,0.7)" }}>{answer.indiaContext}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Comparison View ─── */
function ComparisonView({ result }: { result: ComparisonResult }) {
  const [expandA, setExpandA] = useState(false);
  const [expandB, setExpandB] = useState(false);

  const products = [
    { key: "productA" as const, product: result.productA, expanded: expandA, toggle: () => setExpandA((v) => !v) },
    { key: "productB" as const, product: result.productB, expanded: expandB, toggle: () => setExpandB((v) => !v) },
  ];

  const isTie = result.winner === "tie";

  return (
    <div className="space-y-4" style={{ animation: "tcs-fadeUp 0.4s ease both" }}>
      {/* Winner */}
      <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(160deg,#091c1a 0%,#0d2b27 60%,#091e1c 100%)", border: "1px solid rgba(94,234,212,0.15)" }}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award size={13} style={{ color: "#fbbf24" }} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: "rgba(94,234,212,0.5)" }}>
              {isTie ? "It's a tie" : `Our pick for ${result.skinConcern}`}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-5">
            {products.map(({ key, product }) => {
              const isWinner = result.winner === key;
              const col = scoreColor(product.score);
              return (
                <div key={key} className="flex-1 text-center p-4 rounded-2xl transition-all"
                  style={{ background: isWinner ? "rgba(94,234,212,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${isWinner ? "rgba(94,234,212,0.25)" : "rgba(255,255,255,0.06)"}` }}>
                  <div className="text-4xl font-semibold mb-1" style={{ color: col }}>{product.score}</div>
                  <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{key === "productA" ? result.productA.productName : result.productB.productName}</div>
                  {isWinner && !isTie && <div className="text-[10px] font-mono" style={{ color: "#fbbf24" }}>★ Recommended</div>}
                </div>
              );
            })}
          </div>

          <p className="text-sm leading-relaxed px-4 py-3 rounded-2xl" style={{ color: "rgba(153,246,228,0.7)", background: "rgba(94,234,212,0.05)", border: "1px solid rgba(94,234,212,0.1)" }}>
            {result.verdict}
          </p>
        </div>
      </div>

      {/* Individual cards */}
      {products.map(({ key, product, expanded, toggle }) => (
        <div key={key} className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(160deg,#091c1a 0%,#0d2b27 60%,#091e1c 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={toggle} className="w-full px-6 py-4 flex items-center justify-between text-left border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider mb-0.5" style={{ color: "rgba(94,234,212,0.5)" }}>{key === "productA" ? "Product A" : "Product B"}</div>
              <div className="font-medium" style={{ color: "#f0fdfa" }}>{product.productName}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold font-mono" style={{ color: scoreColor(product.score) }}>{product.score}</span>
              {expanded ? <ChevronUp size={15} style={{ color: "rgba(255,255,255,0.3)" }} /> : <ChevronDown size={15} style={{ color: "rgba(255,255,255,0.3)" }} />}
            </div>
          </button>
          {expanded && (
            <div className="p-6 space-y-4">
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{product.summary}</p>
              {product.pillars?.length > 0 && (
                <div className="space-y-3">
                  {product.pillars.map((p: { name: string; score: number; max: number }) => {
                    const pct = Math.round((p.score / p.max) * 100);
                    const col = pillarBarColor(pct);
                    return (
                      <div key={p.name}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span style={{ color: "rgba(255,255,255,0.5)" }}>{p.name}</span>
                          <span className="font-mono" style={{ color: col }}>{p.score}/{p.max}</span>
                        </div>
                        <PillarBar pct={pct} color={col} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Suggestions ─── */
const SUGGESTIONS = [
  "Minimalist 10% Niacinamide Serum",
  "Cetaphil vs CeraVe for oily skin",
  "Is DMDM Hydantoin safe?",
  "Mamaearth Vitamin C Face Wash",
];

/* ─── Main Page ─── */
export default function AnalyzerPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [expertAnswer, setExpertAnswer] = useState<ExpertAnswer | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [outOfScope, setOutOfScope] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatting]);

  /* ─── Analyze ─── */
  const analyze = useCallback(async (q?: string) => {
    const text = (q || query).trim();
    if (!text || isAnalyzing) return;

    // If this looks like a URL for a product we already have a scorecard for,
    // redirect straight to the static scorecard page - no AI call needed.
    const redirectPath = findProductRedirect(text);
    if (redirectPath) {
      router.push(redirectPath);
      return;
    }

    setQuery(text);
    setIsAnalyzing(true);
    setAnalyzeError(null);
    setOutOfScope(false);
    setScorecard(null);
    setComparison(null);
    setExpertAnswer(null);
    setChatMessages([]);

    const steps = [
      "Hunting down the ingredient list…",
      "Ignoring the marketing copy, reading the actual science…",
      "Checking what EU, India, US & Korea regulators say…",
      "Running the 6-pillar Clean Sheet framework…",
      "Almost done, putting your verdict together…",
    ];
    let idx = 0;
    setStepIdx(0);
    setStatusMsg(steps[0]);
    const ticker = setInterval(() => {
      idx = Math.min(idx + 1, steps.length - 1);
      setStepIdx(idx);
      setStatusMsg(steps[idx]);
    }, 4000);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      clearInterval(ticker);

      if (data.type === "out_of_scope" || (!res.ok && !data.type)) { setOutOfScope(true); return; }
      if (data.error) { setOutOfScope(true); return; }

      if (data.type === "comparison" && data.comparison) {
        setComparison(data.comparison);
        const winnerCard = data.comparison.winner === "productB" ? data.comparison.productB : data.comparison.productA;
        const opener = `${data.comparison.verdict}${winnerCard.chatOpener ? `\n\n${winnerCard.chatOpener}` : ""}`;
        setChatMessages([{ id: uid(), role: "assistant", content: opener, timestamp: new Date() }]);
      } else if (data.type === "answer" && data.answer) {
        setExpertAnswer(data.answer);
        if (data.answer.chatOpener) setChatMessages([{ id: uid(), role: "assistant", content: data.answer.chatOpener, timestamp: new Date() }]);
      } else {
        const card = data.scorecard;
        if (card && typeof card.score === "number" && card.productName && Array.isArray(card.pillars) && card.pillars.length > 0) {
          setScorecard(card);
          if (card.chatOpener) setChatMessages([{ id: uid(), role: "assistant", content: card.chatOpener, timestamp: new Date() }]);
        } else {
          setOutOfScope(true);
        }
      }
    } catch {
      clearInterval(ticker);
      setOutOfScope(true);
    } finally {
      setIsAnalyzing(false);
      setStatusMsg(null);
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [query, isAnalyzing, router]);

  /* ─── Chat ─── */
  const sendChat = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || isChatting) return;

    setChatInput("");
    const userMsg: ChatMessage = { id: uid(), role: "user", content: text, timestamp: new Date() };
    const aiId = uid();
    const aiMsg: ChatMessage = { id: aiId, role: "assistant", content: "", timestamp: new Date(), isStreaming: true };
    setChatMessages((prev) => [...prev, userMsg, aiMsg]);
    setIsChatting(true);

    const history = chatMessages.filter((m) => !m.isStreaming).map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          scorecardContext: scorecard
            ?? (comparison ? { productA: comparison.productA, productB: comparison.productB, verdict: comparison.verdict, skinConcern: comparison.skinConcern } : null)
            ?? (expertAnswer ? { question: expertAnswer.question, answer: expertAnswer.text, verdict: expertAnswer.verdict } : null),
        }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setChatMessages((prev) => prev.map((m) => m.id === aiId ? { ...m, content: acc, isStreaming: false } : m));
      }
    } catch {
      setChatMessages((prev) => prev.map((m) => m.id === aiId ? { ...m, content: "Something went wrong. Try again.", isStreaming: false } : m));
    } finally {
      setIsChatting(false);
      setTimeout(() => chatInputRef.current?.focus(), 50);
    }
  }, [chatInput, isChatting, chatMessages, scorecard, comparison, expertAnswer]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); analyze(); }
  };
  const handleChatKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); }
  };

  const hasResult = scorecard || comparison || expertAnswer;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#091c1a 0%,#0b2320 40%,#091c1a 100%)" }}>
      <style>{`
        @keyframes tcs-fadeUp  { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes tcs-scan    { 0%,100%{left:-25%} 50%{left:100%} }
        @keyframes tcs-pulse   { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes tcs-grid    { 0%{background-position:0 0} 100%{background-position:28px 28px} }
        @keyframes tcs-step    { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      {/* Dot grid overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: "radial-gradient(circle, #5eead4 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* ── Hero ── */}
      <section className="relative pt-14 pb-10 px-4">
        <div className="max-w-2xl mx-auto text-center">

          {/* Molecule decoration */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-full pointer-events-none select-none opacity-20" aria-hidden>
            <svg width="100%" height="72" viewBox="0 0 480 72" fill="none">
              {[[60,36,120,20],[120,20,180,40],[180,40,240,18],[240,18,300,36],[300,36,360,16],[360,16,420,34],[180,40,180,60],[300,36,300,58],[120,20,100,4],[360,16,375,4]].map(([x1,y1,x2,y2],i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5eead4" strokeWidth="1.2" strokeDasharray="3 3"/>
              ))}
              {[{cx:60,cy:36,r:4},{cx:120,cy:20,r:5},{cx:180,cy:40,r:3.5},{cx:180,cy:60,r:3},{cx:240,cy:18,r:5},{cx:300,cy:36,r:4},{cx:300,cy:58,r:3},{cx:360,cy:16,r:5},{cx:420,cy:34,r:3.5},{cx:100,cy:4,r:3},{cx:375,cy:4,r:3}].map(({cx,cy,r},i) => (
                <circle key={i} cx={cx} cy={cy} r={r} fill="#5eead4" fillOpacity="0.6"/>
              ))}
            </svg>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 text-xs font-mono px-4 py-1.5 rounded-full mb-5 relative z-10"
            style={{ background: "rgba(94,234,212,0.08)", border: "1px solid rgba(94,234,212,0.2)", color: "#5eead4", animation: "tcs-fadeUp 0.4s ease both" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            The Clean Sheet™ · Scoring Engine · Active
          </div>

          <h1 className="text-3xl sm:text-5xl font-medium tracking-tight mb-3 relative z-10"
            style={{ color: "#f0fdfa", animation: "tcs-fadeUp 0.4s 0.1s ease both" }}>
            What&apos;s really<br />
            <span style={{ color: "#5eead4" }}>in your product?</span>
          </h1>
          <p className="text-base sm:text-lg max-w-lg mx-auto leading-relaxed relative z-10"
            style={{ color: "rgba(153,246,228,0.55)", animation: "tcs-fadeUp 0.4s 0.2s ease both" }}>
            Analyse a product, compare two, or ask about any ingredient.
            India&apos;s most rigorous beauty science engine.
          </p>
        </div>
      </section>

      {/* ── Search ── */}
      <section className="px-4 pb-6" style={{ animation: "tcs-fadeUp 0.4s 0.25s ease both" }}>
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none sm:left-5" style={{ color: "rgba(94,234,212,0.5)" }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Product URL, name, ingredient, or a question…"
              className="w-full rounded-2xl pl-11 pr-14 py-4 sm:pl-12 sm:pr-16 sm:py-4.5 text-sm sm:text-base outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1.5px solid rgba(94,234,212,0.2)",
                color: "#f0fdfa",
                fontFamily: "'Geist Mono', monospace",
                boxShadow: "0 0 0 0 rgba(94,234,212,0)",
              }}
              onFocus={(e) => e.currentTarget.style.border = "1.5px solid rgba(94,234,212,0.5)"}
              onBlur={(e) => e.currentTarget.style.border = "1.5px solid rgba(94,234,212,0.2)"}
              disabled={isAnalyzing}
            />
            <button
              onClick={() => analyze()}
              disabled={!query.trim() || isAnalyzing}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl p-2.5 transition-all"
              style={{ background: query.trim() && !isAnalyzing ? "#14b8a6" : "rgba(255,255,255,0.08)", color: "#f0fdfa" }}
            >
              {isAnalyzing ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
            </button>
          </div>

          {/* Suggestions */}
          {!hasResult && !isAnalyzing && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center" style={{ animation: "tcs-fadeUp 0.4s 0.35s ease both" }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); analyze(s); }}
                  className="text-xs px-3 py-1.5 rounded-full transition-all font-mono"
                  style={{ color: "rgba(94,234,212,0.7)", background: "rgba(94,234,212,0.06)", border: "1px solid rgba(94,234,212,0.15)" }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Analyzing State ── */}
      {isAnalyzing && (
        <section className="px-4 pb-10">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(160deg,#091c1a 0%,#0d2b27 60%,#091e1c 100%)", border: "1px solid rgba(94,234,212,0.15)" }}>
              {/* Scanning bar */}
              <div className="relative h-0.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="absolute inset-y-0 w-32 opacity-80" style={{ background: "linear-gradient(90deg,transparent,#5eead4,transparent)", animation: "tcs-scan 1.8s ease-in-out infinite" }} />
              </div>

              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(94,234,212,0.1)", border: "1px solid rgba(94,234,212,0.2)" }}>
                    <Loader2 size={20} className="animate-spin" style={{ color: "#5eead4" }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "#f0fdfa" }}>Scoring Engine Running</div>
                    <div className="text-[10px] font-mono" style={{ color: "rgba(94,234,212,0.4)" }}>TCS · v2.1 · Active</div>
                  </div>
                  <div className="ml-auto flex gap-1">
                    {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "#4ade80", animation: `tcs-pulse 1.2s ${i * 0.3}s ease-in-out infinite` }} />)}
                  </div>
                </div>

                {/* Step list */}
                <div className="space-y-2.5">
                  {[
                    "Hunting down the ingredient list…",
                    "Ignoring the marketing copy, reading the actual science…",
                    "Checking what EU, India, US & Korea regulators say…",
                    "Running the 6-pillar Clean Sheet framework…",
                    "Almost done, putting your verdict together…",
                  ].map((step, i) => {
                    const done = i < stepIdx;
                    const active = i === stepIdx;
                    return (
                      <div key={step} className="flex items-center gap-3"
                        style={{ opacity: done || active ? 1 : 0.25, animation: active ? "tcs-step 0.3s ease both" : "none" }}>
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: done ? "rgba(74,222,128,0.2)" : active ? "rgba(94,234,212,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${done ? "#4ade80" : active ? "#5eead4" : "rgba(255,255,255,0.1)"}` }}>
                          {done
                            ? <span style={{ fontSize: 8, color: "#4ade80" }}>✓</span>
                            : active
                              ? <span className="w-1.5 h-1.5 rounded-full block animate-pulse" style={{ background: "#5eead4" }} />
                              : null}
                        </div>
                        <span className="text-xs font-mono" style={{ color: done ? "#4ade80" : active ? "#5eead4" : "rgba(255,255,255,0.25)" }}>{step}</span>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-6 text-[11px] font-mono text-center" style={{ color: "rgba(255,255,255,0.2)" }}>
                  Scraping the web · cross-referencing the science · running the framework
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Out of scope ── */}
      {(outOfScope || analyzeError) && !isAnalyzing && (
        <section className="px-4 pb-10">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-3xl p-8 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-3xl mb-4">🧴</p>
              <p className="text-base font-medium mb-2" style={{ color: "#f0fdfa" }}>This one&apos;s outside my lane</p>
              <p className="text-sm leading-relaxed max-w-sm mx-auto mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
                The Clean Sheet™ is built exclusively for beauty and personal care. Try asking about a skincare product, a cosmetic ingredient, or a haircare brand.
              </p>
              <button
                onClick={() => { setOutOfScope(false); setAnalyzeError(null); setQuery(""); inputRef.current?.focus(); }}
                className="inline-flex items-center gap-2 text-sm font-normal px-5 py-2.5 rounded-full transition-all"
                style={{ background: "rgba(94,234,212,0.12)", border: "1px solid rgba(94,234,212,0.25)", color: "#5eead4" }}
              >
                Try a beauty product →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Results ── */}
      {hasResult && !isAnalyzing && (
        <section className="px-4 pb-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: "rgba(94,234,212,0.4)" }}>
                {comparison ? "Clean Sheet™ Comparison" : expertAnswer ? "Clean Sheet™ Expert Answer" : "Clean Sheet™ Transparency Scorecard"}
              </p>
              <button
                onClick={() => { setScorecard(null); setComparison(null); setExpertAnswer(null); setQuery(""); setChatMessages([]); }}
                className="flex items-center gap-1.5 text-xs font-mono transition-colors"
                style={{ color: "rgba(94,234,212,0.5)" }}
              >
                <RotateCcw size={11} /> New analysis
              </button>
            </div>

            {comparison && <ComparisonView result={comparison} />}
            {expertAnswer && <AnswerView answer={expertAnswer} />}
            {scorecard && <ScorecardView card={scorecard} />}
          </div>
        </section>
      )}

      {/* ── Chat ── */}
      {hasResult && !isAnalyzing && (
        <section className="px-4 pb-16">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(160deg,#091c1a 0%,#0d2b27 60%,#091e1c 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {/* Header */}
              <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(94,234,212,0.1)", border: "1px solid rgba(94,234,212,0.2)" }}>
                  <MessageSquare size={14} style={{ color: "#5eead4" }} />
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: "#f0fdfa" }}>Ask the Ingredient Expert</div>
                  <div className="text-[10px] font-mono" style={{ color: "rgba(94,234,212,0.4)" }}>Powered by The Clean Sheet™ Science Engine</div>
                </div>
                <div className="ml-auto flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-4 max-h-72 sm:max-h-96 overflow-y-auto">
                {chatMessages.map((m) => <ChatBubble key={m.id} msg={m} />)}
                {isChatting && chatMessages[chatMessages.length - 1]?.role !== "assistant" && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(94,234,212,0.1)", border: "1px solid rgba(94,234,212,0.2)" }}>
                      <Sparkles size={13} style={{ color: "#5eead4" }} />
                    </div>
                    <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex gap-1.5">
                        {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#5eead4", animationDelay: `${i * 150}ms` }} />)}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input */}
              <div className="px-4 pb-4 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex gap-2">
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleChatKey}
                    placeholder="Ask about ingredients, safety, skin type…"
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-all font-mono"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(94,234,212,0.15)", color: "#f0fdfa" }}
                    onFocus={(e) => e.currentTarget.style.border = "1px solid rgba(94,234,212,0.35)"}
                    onBlur={(e) => e.currentTarget.style.border = "1px solid rgba(94,234,212,0.15)"}
                    disabled={isChatting}
                  />
                  <button
                    onClick={sendChat}
                    disabled={!chatInput.trim() || isChatting}
                    className="rounded-xl px-4 py-2.5 transition-all"
                    style={{ background: chatInput.trim() && !isChatting ? "#14b8a6" : "rgba(255,255,255,0.06)", color: "#f0fdfa" }}
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            {process.env.NEXT_PUBLIC_WHATSAPP_URL && process.env.NEXT_PUBLIC_WHATSAPP_URL !== "https://chat.whatsapp.com/YOUR_LINK_HERE" && (
              <div className="mt-4 rounded-3xl p-5 flex items-center justify-between gap-4"
                style={{ background: "linear-gradient(135deg,#0d2b27,#0f3d38)", border: "1px solid rgba(94,234,212,0.15)" }}>
                <div>
                  <div className="font-medium text-sm mb-0.5" style={{ color: "#f0fdfa" }}>Join the Clean Sheet™ Community</div>
                  <div className="text-xs" style={{ color: "rgba(153,246,228,0.5)" }}>1000+ members discussing ingredient safety and clean beauty in India.</div>
                </div>
                <a href={process.env.NEXT_PUBLIC_WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="flex-shrink-0 text-sm font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
                  style={{ background: "rgba(94,234,212,0.12)", border: "1px solid rgba(94,234,212,0.25)", color: "#5eead4" }}>
                  Join <ExternalLink size={13} />
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Empty state ── */}
      {!hasResult && !isAnalyzing && (
        <section className="px-4 pb-20 pt-2">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Shield, title: "Product Analysis", desc: "Score any beauty product across 6 safety pillars with real INCI data" },
                { icon: Globe,  title: "Comparisons",      desc: "Ask 'X or Y for my skin type?' and get a head-to-head verdict" },
                { icon: FlaskConical, title: "Ingredient Questions", desc: "Is this ingredient safe? Answered with EU, India & CIR science" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl p-5 flex sm:flex-col items-center sm:text-center gap-4 sm:gap-0 transition-all"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 sm:mx-auto sm:mb-3"
                    style={{ background: "rgba(94,234,212,0.08)", border: "1px solid rgba(94,234,212,0.15)" }}>
                    <Icon size={17} style={{ color: "#5eead4" }} />
                  </div>
                  <div>
                    <div className="font-medium text-sm mb-1" style={{ color: "#f0fdfa" }}>{title}</div>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
