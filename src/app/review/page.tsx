"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Search, Loader2, AlertTriangle, CheckCircle2, Info,
  ChevronDown, ChevronUp, TrendingUp, ShieldAlert,
  FlaskConical, Users, LayoutGrid, Star, Zap, ExternalLink,
  BadgeCheck, TriangleAlert, CircleDot,
} from "lucide-react";
import type { ProductReview, ClaimAnalysis, ClaimRiskLevel } from "@/lib/types";

/* ─────────────────────────────────────────────────────────────────
   COLOURS & HELPERS
───────────────────────────────────────────────────────────────── */

const RISK_CONFIG: Record<ClaimRiskLevel, { label: string; color: string; bg: string; border: string }> = {
  "low":       { label: "Low Risk",       color: "#4ade80", bg: "rgba(74,222,128,0.08)",   border: "rgba(74,222,128,0.2)"  },
  "medium":    { label: "Medium Risk",    color: "#fbbf24", bg: "rgba(251,191,36,0.08)",   border: "rgba(251,191,36,0.2)"  },
  "high":      { label: "High Risk",      color: "#f97316", bg: "rgba(249,115,22,0.08)",   border: "rgba(249,115,22,0.2)"  },
  "very-high": { label: "Very High Risk", color: "#f87171", bg: "rgba(248,113,113,0.08)",  border: "rgba(248,113,113,0.2)" },
  "red-flag":  { label: "Red Flag",       color: "#ef4444", bg: "rgba(239,68,68,0.10)",    border: "rgba(239,68,68,0.3)"   },
};

const EVIDENCE_LABELS: Record<number, string> = {
  1: "No visible proof",
  2: "Ingredient research only",
  3: "Percentage disclosed",
  4: "Finished product tested",
  5: "Third-party lab tested",
  6: "Clinical study with details",
  7: "Published / registered study",
};

const CLAIM_TYPE_LABELS: Record<string, string> = {
  functional:   "Functional",
  appearance:   "Appearance",
  active:       "Active",
  concern:      "Concern",
  "time-bound": "Time Bound",
  clinical:     "Clinical",
  safety:       "Safety",
  "free-from":  "Free From",
  emotional:    "Emotional",
};

function reviewScoreColor(s: number) {
  if (s >= 85) return "#4ade80";
  if (s >= 70) return "#2dd4bf";
  if (s >= 55) return "#fbbf24";
  if (s >= 40) return "#f97316";
  return "#f87171";
}

function reviewScoreLabel(s: number) {
  if (s >= 85) return "Clean Sheet Strong";
  if (s >= 70) return "Mostly Transparent";
  if (s >= 55) return "Needs More Clarity";
  if (s >= 40) return "High Claim Risk";
  return "Consumer Confusion Risk";
}

function evidenceColor(level: number) {
  if (level >= 6) return "#4ade80";
  if (level >= 4) return "#2dd4bf";
  if (level >= 3) return "#fbbf24";
  if (level >= 2) return "#f97316";
  return "#f87171";
}

/* ─────────────────────────────────────────────────────────────────
   ANIMATED BAR
───────────────────────────────────────────────────────────────── */
function AnimBar({ pct, color }: { pct: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 150); return () => clearTimeout(t); }, [pct]);
  return (
    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
      <div className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${w}%`, background: color, boxShadow: `0 0 6px ${color}60` }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SCORE RING
───────────────────────────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t); }, []);

  const r = 52, sw = 7, size = 128;
  const circ = 2 * Math.PI * r;
  const col = reviewScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute inset-0 rounded-full blur-xl opacity-20 pointer-events-none" style={{ background: col }} />
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
          <circle
            cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={sw}
            strokeDasharray={circ}
            strokeDashoffset={animated ? circ - (score / 100) * circ : circ}
            strokeLinecap="round"
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 8px ${col}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <Image src="/logo.png" alt="TCS" width={32} height={32} className="rounded-full" />
          <span className="text-2xl font-semibold leading-none tabular-nums" style={{ color: col }}>{score}</span>
        </div>
      </div>
      <span className="text-[10px] font-mono text-center leading-tight px-3 py-1 rounded-full"
        style={{ color: col, background: `${col}15`, border: `1px solid ${col}30` }}>
        {reviewScoreLabel(score)}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   EVIDENCE DOTS  (7 levels visualised)
───────────────────────────────────────────────────────────────── */
function EvidenceDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5,6,7].map((n) => (
        <div key={n} className="w-2 h-2 rounded-full"
          style={{ background: n <= level ? evidenceColor(level) : "rgba(255,255,255,0.08)" }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────────────────────────── */
function SectionHeader({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="px-5 py-3.5 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
      <h3 className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: "rgba(94,234,212,0.6)" }}>{label}</h3>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CARD SHELL
───────────────────────────────────────────────────────────────── */
function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(160deg,#091c1a 0%,#0d2b27 60%,#091e1c 100%)",
        border: `1px solid ${accent ?? "rgba(255,255,255,0.07)"}`,
      }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CLAIM ROW
───────────────────────────────────────────────────────────────── */
function ClaimRow({ claim }: { claim: ClaimAnalysis }) {
  const [open, setOpen] = useState(false);
  const risk = RISK_CONFIG[claim.riskLevel];

  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left rounded-2xl px-4 py-3.5 transition-all"
      style={{
        background: open ? risk.bg : "rgba(255,255,255,0.02)",
        border: `1px solid ${open ? risk.border : "rgba(255,255,255,0.05)"}`,
      }}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: risk.color, boxShadow: `0 0 5px ${risk.color}80` }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-snug mb-1.5" style={{ color: "rgba(255,255,255,0.82)" }}>{claim.text}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Risk badge */}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{ color: risk.color, background: risk.bg, border: `1px solid ${risk.border}` }}>
              {risk.label}
            </span>
            {/* Claim type */}
            {claim.primaryType && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                style={{ color: "rgba(94,234,212,0.7)", background: "rgba(94,234,212,0.07)", border: "1px solid rgba(94,234,212,0.15)" }}>
                {CLAIM_TYPE_LABELS[claim.primaryType] ?? claim.primaryType}
              </span>
            )}
            {/* Source */}
            {claim.source && (
              <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                via {claim.source}
              </span>
            )}
            {/* Flags */}
            {claim.asciConcern && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ color: "#f97316", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
                <TriangleAlert size={9} />ASCI
              </span>
            )}
            {claim.drugBoundaryRisk && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
                <ShieldAlert size={9} />Drug Boundary
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          <EvidenceDots level={claim.evidenceLevel} />
          <span className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
            L{claim.evidenceLevel}
          </span>
        </div>
        <div className="flex-shrink-0">
          {open
            ? <ChevronUp size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
            : <ChevronDown size={12} style={{ color: "rgba(255,255,255,0.3)" }} />}
        </div>
      </div>

      {/* Expanded details */}
      {open && (
        <div className="mt-3 ml-5 space-y-2">
          <div className="text-xs rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="font-mono text-[10px] uppercase tracking-wider block mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
              Evidence Level {claim.evidenceLevel} — {EVIDENCE_LABELS[claim.evidenceLevel]}
            </span>
            <p style={{ color: "rgba(255,255,255,0.55)" }}>{claim.evidenceNote}</p>
          </div>
          {claim.asciConcern && claim.asciNote && (
            <div className="text-xs rounded-xl px-3 py-2.5" style={{ background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.15)" }}>
              <span className="font-mono text-[10px] uppercase tracking-wider block mb-1" style={{ color: "rgba(249,115,22,0.6)" }}>ASCI Concern</span>
              <p style={{ color: "rgba(249,115,22,0.75)" }}>{claim.asciNote}</p>
            </div>
          )}
          {claim.drugBoundaryRisk && claim.drugBoundaryNote && (
            <div className="text-xs rounded-xl px-3 py-2.5" style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)" }}>
              <span className="font-mono text-[10px] uppercase tracking-wider block mb-1" style={{ color: "rgba(248,113,113,0.6)" }}>Drug Boundary — India</span>
              <p style={{ color: "rgba(248,113,113,0.75)" }}>{claim.drugBoundaryNote}</p>
            </div>
          )}
        </div>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FULL REVIEW VIEW
───────────────────────────────────────────────────────────────── */
function ReviewView({ review }: { review: ProductReview }) {
  const [showAllClaims, setShowAllClaims] = useState(false);
  const claims = review.claimMap ?? [];
  const visibleClaims = showAllClaims ? claims : claims.slice(0, 5);

  const sc = review.scores;
  const scoreDims = [
    { label: "Price Fairness",           val: sc.priceFairness,      max: 10 },
    { label: "Claim Clarity",            val: sc.claimClarity,       max: 15 },
    { label: "Claim Evidence",           val: sc.claimEvidence,      max: 20 },
    { label: "Ingredient Transparency",  val: sc.ingredientTransparency, max: 20 },
    { label: "Formula Logic",            val: sc.formulaLogic,       max: 15 },
    { label: "Consumer Suitability",     val: sc.consumerSuitability,max: 10 },
    { label: "Platform Consistency",     val: sc.platformConsistency,max: 10 },
  ];

  const itScore = review.ingredientTransparency?.score ?? 1;
  const itColors = ["","#f87171","#f97316","#fbbf24","#2dd4bf","#4ade80"];

  const claimRiskColor = {
    "low": "#4ade80",
    "medium": "#fbbf24",
    "high": "#f97316",
    "red-flag": "#ef4444",
  }[review.verdict?.claimRisk ?? "medium"] ?? "#fbbf24";

  const transpColor = {
    "poor": "#f87171",
    "basic": "#f97316",
    "good": "#2dd4bf",
    "strong": "#4ade80",
  }[review.verdict?.transparencyLevel ?? "basic"] ?? "#fbbf24";

  return (
    <div className="space-y-4" style={{ animation: "tcs-fadeUp 0.4s ease both" }}>

      {/* ── HERO ── */}
      <Card accent="rgba(94,234,212,0.15)">
        <div className="relative h-0.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="absolute inset-y-0 w-24 opacity-60" style={{ background: "linear-gradient(90deg,transparent,#5eead4,transparent)", animation: "tcs-scan 2.5s ease-in-out infinite" }} />
        </div>
        <div className="p-5 sm:p-7">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: "rgba(94,234,212,0.5)" }}>
              The Clean Sheet™ · Product Review · Claims Intelligence
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 items-start mb-5">
            <ScoreRing score={sc.total} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: "rgba(94,234,212,0.5)" }}>
                {review.brand}{review.parentCompany ? ` · ${review.parentCompany}` : ""}
              </p>
              <h2 className="text-xl sm:text-2xl font-medium leading-tight mb-2" style={{ color: "#f0fdfa" }}>
                {review.productName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {review.category && (
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ color: "#5eead4", background: "rgba(94,234,212,0.1)", border: "1px solid rgba(94,234,212,0.2)" }}>
                    {review.category}
                  </span>
                )}
                {review.quantity && (
                  <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>{review.quantity}</span>
                )}
                {review.priceRange && (
                  <span className="text-sm font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>{review.priceRange}</span>
                )}
                {review.pricePerMl && (
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full"
                    style={{ color: "#fbbf24", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)" }}>
                    {review.pricePerMl}
                  </span>
                )}
              </div>
              {review.heroPromise && (
                <div className="flex items-start gap-2 text-sm rounded-2xl px-3 py-2.5"
                  style={{ background: "rgba(94,234,212,0.05)", border: "1px solid rgba(94,234,212,0.1)" }}>
                  <Zap size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#5eead4" }} />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider block mb-0.5" style={{ color: "rgba(94,234,212,0.45)" }}>Hero Promise</span>
                    <p style={{ color: "rgba(153,246,228,0.75)" }}>{review.heroPromise}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Claim summary pills */}
          {review.claimSummary && (
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { key: "low",      label: "Low",       val: review.claimSummary.byRisk?.low },
                { key: "medium",   label: "Medium",    val: review.claimSummary.byRisk?.medium },
                { key: "high",     label: "High",      val: review.claimSummary.byRisk?.high },
                { key: "veryHigh", label: "Very High", val: review.claimSummary.byRisk?.veryHigh },
                { key: "redFlag",  label: "Red Flag",  val: review.claimSummary.byRisk?.redFlag },
              ].filter(d => (d.val ?? 0) > 0).map(d => {
                const riskKey = (d.key === "veryHigh" ? "very-high" : d.key === "redFlag" ? "red-flag" : d.key) as ClaimRiskLevel;
                const r = RISK_CONFIG[riskKey];
                return (
                  <span key={d.key} className="text-[10px] font-mono px-2.5 py-1 rounded-full"
                    style={{ color: r.color, background: r.bg, border: `1px solid ${r.border}` }}>
                    {d.val} {d.label}
                  </span>
                );
              })}
              {(review.claimSummary.asciConcernCount ?? 0) > 0 && (
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1"
                  style={{ color: "#f97316", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
                  <TriangleAlert size={9} />
                  {review.claimSummary.asciConcernCount} ASCI {review.claimSummary.asciConcernCount === 1 ? "concern" : "concerns"}
                </span>
              )}
              {(review.claimSummary.drugBoundaryCount ?? 0) > 0 && (
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1"
                  style={{ color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
                  <ShieldAlert size={9} />
                  {review.claimSummary.drugBoundaryCount} Drug Boundary
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* ── PRICE ACROSS PLATFORMS ── */}
      {review.priceAcrossPlatforms?.length > 0 && (
        <Card>
          <SectionHeader dot="#fbbf24" label="Price Across Platforms" />
          <div className="p-5">
            <div className="space-y-2 mb-3">
              {review.priceAcrossPlatforms.map((p, i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{p.platform}</span>
                  <div className="flex items-center gap-3">
                    {p.pricePerMl && (
                      <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>{p.pricePerMl}</span>
                    )}
                    <span className="text-sm font-mono font-medium" style={{ color: p.price ? "#f0fdfa" : "rgba(255,255,255,0.25)" }}>
                      {p.price ?? "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {review.lowestPrice && (
              <div className="flex items-center gap-2 text-xs rounded-xl px-3.5 py-2.5"
                style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)" }}>
                <TrendingUp size={12} style={{ color: "#4ade80" }} />
                <span style={{ color: "rgba(74,222,128,0.8)" }}>Lowest: {review.lowestPrice}</span>
              </div>
            )}
            {review.priceInsight && (
              <p className="mt-3 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>{review.priceInsight}</p>
            )}
          </div>
        </Card>
      )}

      {/* ── CLAIM MAP ── */}
      {claims.length > 0 && (
        <Card>
          <SectionHeader dot="#f97316" label={`Claim Map · ${claims.length} claims found`} />
          <div className="p-5">
            {/* Evidence ladder key */}
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.2)" }}>Evidence Scale</span>
              {[1,2,3,4,5,6,7].map(n => (
                <div key={n} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: evidenceColor(n) }} />
                  <span className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>L{n}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {visibleClaims.map((claim, i) => (
                <ClaimRow key={i} claim={claim} />
              ))}
            </div>

            {claims.length > 5 && (
              <button
                onClick={() => setShowAllClaims(!showAllClaims)}
                className="w-full mt-3 flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl transition-all"
                style={{ color: "#5eead4", border: "1px solid rgba(94,234,212,0.15)", background: "rgba(94,234,212,0.04)" }}>
                {showAllClaims ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {showAllClaims ? "Show fewer" : `Show all ${claims.length} claims`}
              </button>
            )}

            <p className="mt-4 text-[11px] font-mono italic" style={{ color: "rgba(255,255,255,0.2)" }}>
              Is the claim proven on this exact product, or only borrowed from the ingredient story?
            </p>
          </div>
        </Card>
      )}

      {/* ── INGREDIENT TRANSPARENCY ── */}
      {review.ingredientTransparency && (
        <Card>
          <SectionHeader dot="#5eead4" label="Ingredient Transparency" />
          <div className="p-5">
            {/* Score 1-5 visual */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1.5">
                {[1,2,3,4,5].map(n => (
                  <div key={n} className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-mono font-medium"
                    style={{
                      background: n <= itScore ? `${itColors[itScore]}18` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${n <= itScore ? `${itColors[itScore]}35` : "rgba(255,255,255,0.06)"}`,
                      color: n <= itScore ? itColors[itScore] : "rgba(255,255,255,0.15)",
                    }}>
                    {n}
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium" style={{ color: itColors[itScore] }}>
                {review.ingredientTransparency.label}
              </span>
            </div>

            {/* Check grid */}
            <div className="grid sm:grid-cols-2 gap-2 mb-3">
              {[
                { label: "Full INCI Available",           val: review.ingredientTransparency.fullInciAvailable },
                { label: "INCI Order Correct",            val: review.ingredientTransparency.inciOrderCorrect },
                { label: "Active % Disclosed",            val: review.ingredientTransparency.activePercentagesDisclosed },
                { label: "Complexes Explained",           val: review.ingredientTransparency.complexesExplained },
                { label: "Preservatives Visible",         val: review.ingredientTransparency.preservativesVisible },
                { label: "Fragrance Disclosed",           val: review.ingredientTransparency.fragranceDisclosed },
                { label: "pH Disclosed Where Relevant",   val: review.ingredientTransparency.phDisclosedWhereRelevant },
                { label: "Usage Warnings Clear",          val: review.ingredientTransparency.usageWarningsClear },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center gap-2.5 text-xs rounded-xl px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  {val
                    ? <CheckCircle2 size={12} style={{ color: "#4ade80" }} />
                    : <CircleDot size={12} style={{ color: "rgba(255,255,255,0.2)" }} />}
                  <span style={{ color: val ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}>{label}</span>
                </div>
              ))}
            </div>

            {review.ingredientTransparency.inciSource && (
              <p className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                INCI source: {review.ingredientTransparency.inciSource}
              </p>
            )}

            {review.ingredientTransparency.issues?.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {review.ingredientTransparency.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "rgba(249,115,22,0.75)" }}>
                    <AlertTriangle size={10} className="flex-shrink-0 mt-0.5" />
                    {issue}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ── FORMULA LOGIC ── */}
      {review.formulaLogic && (
        <Card>
          <SectionHeader dot="#a78bfa" label="Formula Logic" />
          <div className="p-5">
            <div className="grid sm:grid-cols-2 gap-2 mb-4">
              {[
                { label: "Hero Ingredients Match Claim",  val: review.formulaLogic.heroIngredientsMatchClaim },
                { label: "Format Suitable for Claim",     val: review.formulaLogic.formatSuitableForClaim },
                { label: "Actives Likely Meaningful",     val: review.formulaLogic.activesLikelyMeaningful },
                { label: "Base Formula Appropriate",      val: review.formulaLogic.baseFormulaAppropriate },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center gap-2.5 text-xs rounded-xl px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  {val
                    ? <CheckCircle2 size={12} style={{ color: "#4ade80" }} />
                    : <CircleDot size={12} style={{ color: "rgba(255,255,255,0.2)" }} />}
                  <span style={{ color: val ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}>{label}</span>
                </div>
              ))}
            </div>

            {review.formulaLogic.claimOverreach && review.formulaLogic.claimOverreachNote && (
              <div className="flex items-start gap-2.5 mb-3 px-3.5 py-2.5 rounded-2xl text-xs"
                style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.18)" }}>
                <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" style={{ color: "#f87171" }} />
                <p style={{ color: "rgba(248,113,113,0.8)" }}>
                  <span className="font-medium">Claim Overreach — </span>
                  {review.formulaLogic.claimOverreachNote}
                </p>
              </div>
            )}

            {review.formulaLogic.irritancyConcerns?.length > 0 && (
              <div className="mb-3 space-y-1.5">
                {review.formulaLogic.irritancyConcerns.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "rgba(251,191,36,0.75)" }}>
                    <AlertTriangle size={10} className="flex-shrink-0 mt-0.5" />
                    {c}
                  </div>
                ))}
              </div>
            )}

            {review.formulaLogic.note && (
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{review.formulaLogic.note}</p>
            )}
          </div>
        </Card>
      )}

      {/* ── CONSUMER SUITABILITY ── */}
      {review.consumerSuitability && (
        <Card>
          <SectionHeader dot="#34d399" label="Consumer Suitability" />
          <div className="p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              {review.consumerSuitability.bestFor?.length > 0 && (
                <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)" }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 size={12} style={{ color: "#4ade80" }} />
                    <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "rgba(74,222,128,0.6)" }}>Best For</span>
                  </div>
                  <ul className="space-y-1">
                    {review.consumerSuitability.bestFor.map((item, i) => (
                      <li key={i} className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>· {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {review.consumerSuitability.avoidIf?.length > 0 && (
                <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)" }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertTriangle size={12} style={{ color: "#f87171" }} />
                    <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "rgba(248,113,113,0.6)" }}>Avoid If</span>
                  </div>
                  <ul className="space-y-1">
                    {review.consumerSuitability.avoidIf.map((item, i) => (
                      <li key={i} className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>· {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {review.consumerSuitability.routineFit && (
                <InfoCell label="Routine Fit" value={review.consumerSuitability.routineFit} />
              )}
              {review.consumerSuitability.sensitivityRisk && (
                <InfoCell label="Sensitivity Risk" value={review.consumerSuitability.sensitivityRisk} />
              )}
              {review.consumerSuitability.immediateExpectation && (
                <InfoCell label="Immediate Expectation" value={review.consumerSuitability.immediateExpectation} />
              )}
              {review.consumerSuitability.longTermExpectation && (
                <InfoCell label="Long-term Expectation" value={review.consumerSuitability.longTermExpectation} />
              )}
            </div>

            {review.consumerSuitability.layeringNotes && (
              <div className="text-xs rounded-xl px-3.5 py-2.5"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <span className="font-mono text-[10px] uppercase tracking-wider block mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>Layering</span>
                <p style={{ color: "rgba(255,255,255,0.5)" }}>{review.consumerSuitability.layeringNotes}</p>
              </div>
            )}

            {review.consumerSuitability.pregnancyOrTeenNote && (
              <div className="flex items-start gap-2.5 text-xs rounded-xl px-3.5 py-2.5"
                style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
                <Info size={11} className="flex-shrink-0 mt-0.5" style={{ color: "#fbbf24" }} />
                <p style={{ color: "rgba(251,191,36,0.75)" }}>{review.consumerSuitability.pregnancyOrTeenNote}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ── PLATFORM PARITY ── */}
      {review.platformParity && (
        <Card accent={review.platformParity.consistent ? "rgba(255,255,255,0.07)" : "rgba(249,115,22,0.2)"}>
          <SectionHeader dot={review.platformParity.consistent ? "#4ade80" : "#f97316"} label="Platform Parity Check" />
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: review.platformParity.consistent ? "rgba(74,222,128,0.08)" : "rgba(249,115,22,0.08)",
                  border: `1px solid ${review.platformParity.consistent ? "rgba(74,222,128,0.2)" : "rgba(249,115,22,0.2)"}`,
                }}>
                {review.platformParity.consistent
                  ? <BadgeCheck size={13} style={{ color: "#4ade80" }} />
                  : <TriangleAlert size={13} style={{ color: "#f97316" }} />}
                <span className="text-xs font-mono"
                  style={{ color: review.platformParity.consistent ? "#4ade80" : "#f97316" }}>
                  {review.platformParity.consistent ? "Claims consistent across platforms" : "Claim inconsistencies found"}
                </span>
              </div>
            </div>

            {review.platformParity.issues?.length > 0 && (
              <div className="space-y-2 mb-3">
                {review.platformParity.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs rounded-xl px-3 py-2"
                    style={{ background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.12)" }}>
                    <ExternalLink size={10} className="flex-shrink-0 mt-0.5" style={{ color: "#f97316" }} />
                    <p style={{ color: "rgba(249,115,22,0.75)" }}>{issue}</p>
                  </div>
                ))}
              </div>
            )}

            {review.platformParity.amplificationPattern && (
              <div className="mb-3 px-3.5 py-2.5 rounded-2xl text-xs"
                style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)" }}>
                <span className="font-mono text-[10px] uppercase tracking-wider block mb-1" style={{ color: "rgba(248,113,113,0.5)" }}>
                  Claim Amplification Pattern
                </span>
                <p style={{ color: "rgba(248,113,113,0.75)" }}>{review.platformParity.amplificationPattern}</p>
              </div>
            )}

            {review.platformParity.packVsOnline && (
              <div className="mb-3 px-3.5 py-2.5 rounded-2xl text-xs"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="font-mono text-[10px] uppercase tracking-wider block mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>
                  Pack vs. Online
                </span>
                <p style={{ color: "rgba(255,255,255,0.5)" }}>{review.platformParity.packVsOnline}</p>
              </div>
            )}

            {review.platformParity.reelAngle && (
              <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs"
                style={{ background: "rgba(214,255,62,0.06)", border: "1px solid rgba(214,255,62,0.15)" }}>
                <Star size={11} className="flex-shrink-0 mt-0.5" style={{ color: "#D6FF3E" }} />
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider block mb-0.5" style={{ color: "rgba(214,255,62,0.5)" }}>
                    Reel Angle
                  </span>
                  <p style={{ color: "rgba(214,255,62,0.8)" }}>{review.platformParity.reelAngle}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ── SCORE BREAKDOWN ── */}
      <Card>
        <SectionHeader dot="#5eead4" label="Score Breakdown · 7 Dimensions" />
        <div className="p-5 space-y-4">
          {scoreDims.map(({ label, val, max }) => {
            const pct = Math.round((val / max) * 100);
            const col = pct >= 80 ? "#4ade80" : pct >= 60 ? "#2dd4bf" : pct >= 40 ? "#fbbf24" : "#f87171";
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
                  <span className="text-sm font-mono tabular-nums" style={{ color: col }}>
                    {val}<span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>/{max}</span>
                  </span>
                </div>
                <AnimBar pct={pct} color={col} />
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── VERDICT ── */}
      {review.verdict && (
        <Card accent={`${claimRiskColor}25`}>
          <SectionHeader dot={claimRiskColor} label="The Clean Sheet Verdict" />
          <div className="p-5 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)" }}>
                <div className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: "rgba(74,222,128,0.5)" }}>Best Thing</div>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{review.verdict.bestThing}</p>
              </div>
              <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)" }}>
                <div className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: "rgba(248,113,113,0.5)" }}>Biggest Concern</div>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{review.verdict.biggestConcern}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-full"
                style={{ color: claimRiskColor, background: `${claimRiskColor}12`, border: `1px solid ${claimRiskColor}30` }}>
                Claim Risk: {review.verdict.claimRisk?.replace("-", " ")}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-full"
                style={{ color: transpColor, background: `${transpColor}12`, border: `1px solid ${transpColor}30` }}>
                Transparency: {review.verdict.transparencyLevel}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {review.verdict.whoItMaySuit && (
                <div className="text-xs rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>May Suit</div>
                  <p style={{ color: "rgba(255,255,255,0.55)" }}>{review.verdict.whoItMaySuit}</p>
                </div>
              )}
              {review.verdict.whoShouldBeCareful && (
                <div className="text-xs rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>Be Careful If</div>
                  <p style={{ color: "rgba(255,255,255,0.55)" }}>{review.verdict.whoShouldBeCareful}</p>
                </div>
              )}
            </div>

            {/* Takeaway */}
            {review.verdict.cleanSheetTakeaway && (
              <div className="rounded-2xl px-5 py-4"
                style={{ background: "linear-gradient(135deg, rgba(214,255,62,0.08), rgba(214,255,62,0.04))", border: "1px solid rgba(214,255,62,0.2)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Star size={13} style={{ color: "#D6FF3E" }} />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: "rgba(214,255,62,0.6)" }}>
                    Clean Sheet Takeaway
                  </span>
                </div>
                <p className="text-sm leading-relaxed font-medium" style={{ color: "rgba(214,255,62,0.9)" }}>
                  "{review.verdict.cleanSheetTakeaway}"
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ── DATA SOURCE ── */}
      {review.dataSource && (
        <Card>
          <SectionHeader dot="#5eead4" label="Research Sources" />
          <div className="p-5 grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>INCI Source</div>
              <div className="font-mono text-sm" style={{ color: review.dataSource.inciFound ? "#4ade80" : "#fbbf24" }}>
                {review.dataSource.inciFound ? "✓ Found" : "⚠ Not found"} · {review.dataSource.inciSource}
              </div>
            </div>
            {review.dataSource.rating && (
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>User Rating</div>
                <div className="font-mono text-sm" style={{ color: "#f0fdfa" }}>
                  ★ {review.dataSource.rating}/5 · {review.dataSource.reviewCount}
                </div>
              </div>
            )}
            {review.dataSource.userSentiment && (
              <div className="sm:col-span-2">
                <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>User Sentiment</div>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{review.dataSource.userSentiment}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ── GO DEEPER ── */}
      <a href={`/analyzer?q=${encodeURIComponent(review.productName + " " + review.brand)}`}
        className="flex items-center justify-between gap-3 rounded-2xl px-5 py-4 transition-all hover:opacity-80"
        style={{ background: "rgba(94,234,212,0.05)", border: "1px solid rgba(94,234,212,0.12)" }}>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider mb-0.5" style={{ color: "rgba(94,234,212,0.45)" }}>
            Want ingredient-level safety?
          </div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            Run a full ingredient safety analysis — EU, India, FDA, ECHA screening
          </p>
        </div>
        <ExternalLink size={15} className="flex-shrink-0" style={{ color: "rgba(94,234,212,0.4)" }} />
      </a>

      {/* ── DISCLAIMER ── */}
      {review.cleanSheetNote && (
        <p className="text-[11px] leading-relaxed px-1" style={{ color: "rgba(255,255,255,0.2)" }}>
          {review.cleanSheetNote}
        </p>
      )}

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SMALL HELPER: INFO CELL
───────────────────────────────────────────────────────────────── */
function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-3.5 py-2.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>{label}</div>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{value}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CLAIM ILLUSTRATION  (inline SVG, no external deps)
───────────────────────────────────────────────────────────────── */
function ClaimIllustration() {
  return (
    <div className="relative w-full select-none" style={{ maxWidth: 540 }}>
      <style>{`
        @keyframes ci-scan  { 0%{transform:translateY(-10px);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateY(480px);opacity:0} }
        @keyframes ci-pulse { 0%,100%{opacity:0.15} 50%{opacity:0.28} }
        @keyframes ci-mag   { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(2deg)} }

        /* Position IS the animation — no separate SVG transform attr, so nothing to conflict with */
        @keyframes ci-bL1 { 0%,100%{transform:translate(8px,140px)}   50%{transform:translate(8px,130px)} }
        @keyframes ci-bL2 { 0%,100%{transform:translate(8px,265px)}   50%{transform:translate(8px,258px)} }
        @keyframes ci-bR1 { 0%,100%{transform:translate(350px,58px)}  50%{transform:translate(350px,48px)} }
        @keyframes ci-bR2 { 0%,100%{transform:translate(350px,222px)} 50%{transform:translate(350px,210px)} }
        @keyframes ci-bBT { 0%,100%{transform:translate(184px,355px)} 50%{transform:translate(184px,346px)} }

        .ci-bL1 { animation: ci-bL1 3.8s ease-in-out infinite;        animation-fill-mode: both; }
        .ci-bL2 { animation: ci-bL2 5.0s ease-in-out infinite 0.6s;  animation-fill-mode: both; }
        .ci-bR1 { animation: ci-bR1 4.0s ease-in-out infinite;        animation-fill-mode: both; }
        .ci-bR2 { animation: ci-bR2 4.5s ease-in-out infinite 1.1s;  animation-fill-mode: both; }
        .ci-bBT { animation: ci-bBT 5.2s ease-in-out infinite 1.7s;  animation-fill-mode: both; }
        .ci-scan  { animation: ci-scan 4s ease-in-out infinite 0.8s; }
        .ci-pulse { animation: ci-pulse 3s ease-in-out infinite; }
        .ci-mag   { animation: ci-mag 6s ease-in-out infinite; transform-origin: 305px 158px; }
      `}</style>

      <svg viewBox="0 0 540 460" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <defs>
          <linearGradient id="scanGradCI" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#5eead4" stopOpacity="0" />
            <stop offset="50%"  stopColor="#5eead4" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Background dots */}
        {[[28,32],[516,42],[45,395],[508,385],[62,218],[490,208],[185,415],[325,18],[20,158],[528,278],[255,445],[130,405]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r={2.5} fill="#5eead4" opacity={0.1} />
        ))}
        {[[28,32,62,218],[62,218,45,395],[516,42,490,208],[490,208,508,385],[325,18,516,42],[20,158,28,32]].map(([x1,y1,x2,y2],i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5eead4" strokeWidth={0.5} opacity={0.07} strokeDasharray="4 7" />
        ))}

        {/* Ambient glow */}
        <ellipse cx={240} cy={218} rx={60} ry={92} fill="#5eead4" className="ci-pulse" />

        {/* Bottle */}
        <rect x={232} y={50} width={16} height={46} rx={6} fill="#0d3530" stroke="#5eead4" strokeWidth={1.2} opacity={0.88} />
        <ellipse cx={240} cy={98} rx={5} ry={4} fill="#5eead4" opacity={0.55} />
        <path d="M235 95 L240 110 L245 95" fill="#5eead4" opacity={0.42} />
        <rect x={210} y={96} width={60} height={30} rx={8} fill="#112f2b" stroke="#5eead4" strokeWidth={1.2} />
        <rect x={214} y={100} width={52} height={22} rx={6} fill="rgba(94,234,212,0.07)" />
        <rect x={198} y={124} width={84} height={178} rx={16} fill="#0a2522" stroke="#5eead4" strokeWidth={1.2} />
        <rect x={202} y={130} width={10} height={160} rx={4} fill="rgba(255,255,255,0.04)" />
        <rect x={204} y={155} width={72} height={138} rx={10} fill="rgba(94,234,212,0.05)" />
        <rect x={208} y={160} width={64} height={106} rx={8} fill="rgba(255,255,255,0.03)" stroke="rgba(94,234,212,0.13)" strokeWidth={0.8} />
        {[170,182,194,206,218].map((y,i) => (
          <rect key={i} x={215} y={y} width={i===0?44:i===2?28:36} height={3} rx={1.5} fill="rgba(255,255,255,0.11)" />
        ))}
        <circle cx={240} cy={248} r={12} fill="rgba(94,234,212,0.12)" stroke="rgba(94,234,212,0.32)" strokeWidth={0.9} />
        <text x={240} y={252} textAnchor="middle" fontSize={7} fill="#5eead4" fontFamily="monospace" fontWeight={700}>TCS</text>
        <rect x={198} y={295} width={84} height={12} rx={7} fill="#112f2b" stroke="#5eead4" strokeWidth={0.8} opacity={0.75} />

        {/* Scan line */}
        <rect x={198} y={0} width={84} height={3} rx={1} fill="url(#scanGradCI)" className="ci-scan" opacity={0.55} />

        {/* Magnifying glass */}
        <g className="ci-mag">
          <circle cx={305} cy={158} r={52} fill="rgba(214,255,62,0.04)" stroke="#D6FF3E" strokeWidth={1.8} />
          <circle cx={305} cy={158} r={46} fill="none" stroke="rgba(214,255,62,0.11)" strokeWidth={0.8} />
          <line x1={305} y1={120} x2={305} y2={140} stroke="rgba(214,255,62,0.22)" strokeWidth={0.8} />
          <line x1={305} y1={176} x2={305} y2={196} stroke="rgba(214,255,62,0.22)" strokeWidth={0.8} />
          <line x1={267} y1={158} x2={287} y2={158} stroke="rgba(214,255,62,0.22)" strokeWidth={0.8} />
          <line x1={323} y1={158} x2={343} y2={158} stroke="rgba(214,255,62,0.22)" strokeWidth={0.8} />
          <line x1={345} y1={196} x2={381} y2={236} stroke="#D6FF3E" strokeWidth={4.5} strokeLinecap="round" />
          <line x1={345} y1={196} x2={381} y2={236} stroke="rgba(214,255,62,0.28)" strokeWidth={9} strokeLinecap="round" />
        </g>

        {/* Connector dashes */}
        <line x1={174} y1={172} x2={198} y2={172} stroke="#5eead4" strokeWidth={0.7} strokeDasharray="3 4" opacity={0.18} />
        <line x1={174} y1={297} x2={198} y2={273} stroke="#fbbf24" strokeWidth={0.7} strokeDasharray="3 4" opacity={0.18} />
        <line x1={282} y1={155} x2={350} y2={90}  stroke="#4ade80" strokeWidth={0.7} strokeDasharray="3 4" opacity={0.18} />
        <line x1={282} y1={238} x2={350} y2={254} stroke="#ef4444" strokeWidth={0.7} strokeDasharray="3 4" opacity={0.18} />
        <line x1={240} y1={307} x2={240} y2={355} stroke="#f97316" strokeWidth={0.7} strokeDasharray="3 4" opacity={0.18} />

        {/* ── Bubbles: no SVG transform attr — position is baked into the CSS animation keyframes ── */}

        {/* L1 · 5% Niacinamide ✓ · teal · x=8-171, y=140-204 */}
        <g className="ci-bL1">
          <rect x={0} y={0} width={163} height={64} rx={12} fill="rgba(94,234,212,0.08)" stroke="rgba(94,234,212,0.26)" strokeWidth={1} />
          <circle cx={22} cy={22} r={9} fill="rgba(94,234,212,0.14)" />
          <text x={22} y={27} textAnchor="middle" fontSize={10} fill="#5eead4" fontWeight={700}>✓</text>
          <text x={38} y={18} fontSize={10} fill="rgba(255,255,255,0.82)" fontFamily="Helvetica,Arial,sans-serif">5% Niacinamide</text>
          <text x={38} y={31} fontSize={7.5} fill="rgba(94,234,212,0.52)" fontFamily="monospace">Active · % disclosed</text>
          <g transform="translate(12,45)">
            {[0,1,2,3,4,5,6].map(n => <circle key={n} cx={n*11} cy={0} r={3} fill={n<3?"#5eead4":"rgba(255,255,255,0.09)"} />)}
          </g>
          <text x={107} y={49} fontSize={7} fill="rgba(94,234,212,0.38)" fontFamily="monospace">L3</text>
        </g>

        {/* L2 · Clinically Proven ? · yellow · x=8-171, y=265-329 */}
        <g className="ci-bL2">
          <rect x={0} y={0} width={163} height={64} rx={12} fill="rgba(251,191,36,0.07)" stroke="rgba(251,191,36,0.24)" strokeWidth={1} />
          <circle cx={22} cy={22} r={9} fill="rgba(251,191,36,0.14)" />
          <text x={22} y={27} textAnchor="middle" fontSize={10} fill="#fbbf24" fontWeight={700}>?</text>
          <text x={38} y={18} fontSize={10} fill="rgba(255,255,255,0.82)" fontFamily="Helvetica,Arial,sans-serif">Clinically Proven</text>
          <text x={38} y={31} fontSize={7.5} fill="rgba(251,191,36,0.5)" fontFamily="monospace">Clinical · No study</text>
          <g transform="translate(12,45)">
            {[0,1,2,3,4,5,6].map(n => <circle key={n} cx={n*11} cy={0} r={3} fill={n<2?"#fbbf24":"rgba(255,255,255,0.09)"} />)}
          </g>
          <text x={107} y={49} fontSize={7} fill="rgba(251,191,36,0.38)" fontFamily="monospace">L2</text>
        </g>

        {/* R1 · Deeply Hydrating ✓ · green · x=350-518, y=58-122 */}
        <g className="ci-bR1">
          <rect x={0} y={0} width={168} height={64} rx={12} fill="rgba(74,222,128,0.08)" stroke="rgba(74,222,128,0.26)" strokeWidth={1} />
          <circle cx={22} cy={22} r={9} fill="rgba(74,222,128,0.15)" />
          <text x={22} y={27} textAnchor="middle" fontSize={10} fill="#4ade80" fontWeight={700}>✓</text>
          <text x={38} y={18} fontSize={10} fill="rgba(255,255,255,0.82)" fontFamily="Helvetica,Arial,sans-serif">Deeply Hydrating</text>
          <text x={38} y={31} fontSize={7.5} fill="rgba(74,222,128,0.52)" fontFamily="monospace">Functional · Low Risk</text>
          <g transform="translate(12,45)">
            {[0,1,2,3,4,5,6].map(n => <circle key={n} cx={n*11} cy={0} r={3} fill={n<4?"#4ade80":"rgba(255,255,255,0.09)"} />)}
          </g>
          <text x={107} y={49} fontSize={7} fill="rgba(74,222,128,0.38)" fontFamily="monospace">L4</text>
        </g>

        {/* R2 · Removes Dark Spots ⚠ · red · x=350-518, y=222-286 */}
        <g className="ci-bR2">
          <rect x={0} y={0} width={168} height={64} rx={12} fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.28)" strokeWidth={1} />
          <circle cx={22} cy={22} r={9} fill="rgba(239,68,68,0.15)" />
          <text x={22} y={27} textAnchor="middle" fontSize={9} fill="#ef4444" fontWeight={700}>⚠</text>
          <text x={38} y={18} fontSize={9.5} fill="rgba(255,255,255,0.82)" fontFamily="Helvetica,Arial,sans-serif">Removes Dark Spots</text>
          <text x={38} y={31} fontSize={7.5} fill="rgba(239,68,68,0.52)" fontFamily="monospace">Red Flag · No evidence</text>
          <g transform="translate(12,45)">
            {[0,1,2,3,4,5,6].map(n => <circle key={n} cx={n*11} cy={0} r={3} fill={n<1?"#ef4444":"rgba(255,255,255,0.09)"} />)}
          </g>
          <text x={107} y={49} fontSize={7} fill="rgba(239,68,68,0.38)" fontFamily="monospace">L1</text>
        </g>

        {/* BT · 72-Hour Results ? · orange · x=184-344, y=355-419 */}
        <g className="ci-bBT">
          <rect x={0} y={0} width={160} height={64} rx={12} fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.25)" strokeWidth={1} />
          <circle cx={22} cy={22} r={9} fill="rgba(249,115,22,0.15)" />
          <text x={22} y={27} textAnchor="middle" fontSize={9} fill="#f97316" fontWeight={700}>?</text>
          <text x={38} y={18} fontSize={10} fill="rgba(255,255,255,0.82)" fontFamily="Helvetica,Arial,sans-serif">72-Hour Results</text>
          <text x={38} y={31} fontSize={7.5} fill="rgba(249,115,22,0.5)" fontFamily="monospace">Time-bound · Needs proof</text>
          <g transform="translate(12,45)">
            {[0,1,2,3,4,5,6].map(n => <circle key={n} cx={n*11} cy={0} r={3} fill={n<2?"#f97316":"rgba(255,255,255,0.09)"} />)}
          </g>
          <text x={107} y={49} fontSize={7} fill="rgba(249,115,22,0.38)" fontFamily="monospace">L2</text>
        </g>

      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   HOW IT WORKS STRIP
───────────────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      num: "01",
      color: "#f97316",
      title: "Every claim found",
      body: "We collect claims from the brand website, Nykaa listing, Amazon title, and product pack. Not one — all of them.",
    },
    {
      num: "02",
      color: "#fbbf24",
      title: "Evidence checked",
      body: "Each claim is rated on a 7-level evidence ladder. Is the proof on this product, or borrowed from an ingredient study?",
    },
    {
      num: "03",
      color: "#4ade80",
      title: "Platforms compared",
      body: "Same product, different claims on different platforms? We catch the amplification — and name it.",
    },
  ];
  return (
    <div className="grid sm:grid-cols-3 gap-3 mb-12">
      {steps.map(({ num, color, title, body }) => (
        <div key={num} className="rounded-2xl p-5"
          style={{ background: "linear-gradient(160deg,#091c1a,#0d2b27)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="text-3xl font-bold font-mono mb-3" style={{ color, opacity: 0.35 }}>{num}</div>
          <div className="text-sm font-medium mb-1.5" style={{ color: "#f0fdfa" }}>{title}</div>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>{body}</p>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   LOADING STEPS
───────────────────────────────────────────────────────────────── */
const LOADING_STEPS = [
  "Mapping claims across brand website, Nykaa, Amazon…",
  "Checking evidence ladder for each claim…",
  "Comparing prices across platforms…",
  "Assessing ingredient transparency…",
  "Running formula logic for this category…",
  "Checking platform parity — are claims the same everywhere?…",
  "Checking ASCI compliance and India drug boundary…",
  "Calculating final scores across 7 dimensions…",
];

/* ─────────────────────────────────────────────────────────────────
   SUGGESTIONS
───────────────────────────────────────────────────────────────── */
const SUGGESTIONS = [
  "Mamaearth Vitamin C Face Wash",
  "Minimalist 10% Niacinamide Serum",
  "WOW Skin Science Hair Oil",
  "mCaffeine Coffee Body Wash",
  "Plum Green Tea Sunscreen SPF 50",
];

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */
export default function ReviewPage() {
  const [query, setQuery] = useState("");
  const [review, setReview] = useState<ProductReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outOfScope, setOutOfScope] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setStepIdx(i => (i + 1) % LOADING_STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isLoading]);

  const runReview = useCallback(async (q?: string) => {
    const text = (q || query).trim();
    if (!text || isLoading) return;

    setQuery(text);
    setIsLoading(true);
    setError(null);
    setOutOfScope(false);
    setReview(null);
    setStepIdx(0);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      if (data.type === "out_of_scope") {
        setOutOfScope(true);
      } else if (data.type === "product-review" && data.review) {
        setReview(data.review as ProductReview);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } else if (data.type === "error") {
        setError(data.message ?? "Something went wrong. Please try again.");
      } else {
        setError("Could not generate a review. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [query, isLoading]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") runReview();
  };

  return (
    <div className="min-h-screen" style={{ background: "#060f0e" }}>

      {/* ── HERO (wide layout, illustration on right) ── */}
      <div className="relative overflow-hidden border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {/* Atmospheric orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div style={{ position:"absolute", top:"-15%", right:"-8%", width:560, height:560, background:"radial-gradient(circle, rgba(36,129,121,0.14) 0%, transparent 70%)", borderRadius:"50%" }} />
          <div style={{ position:"absolute", bottom:"-20%", left:"-5%", width:380, height:380, background:"radial-gradient(circle, rgba(94,234,212,0.07) 0%, transparent 70%)", borderRadius:"50%" }} />
          <div style={{ position:"absolute", top:"30%", right:"28%", width:200, height:200, background:"radial-gradient(circle, rgba(214,255,62,0.04) 0%, transparent 70%)", borderRadius:"50%" }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: copy + search */}
          <div>
            {/* Badge */}
            <div className="flex items-center gap-2.5 mb-6">
              <Image src="/logo.png" alt="The Clean Sheet" width={40} height={40} className="rounded-full" />
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-[0.2em]" style={{ color: "rgba(94,234,212,0.7)" }}>
                  The Clean Sheet™ · Product Review
                </span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4"
              style={{ color: "#f0fdfa", fontFamily: "'Cooper BT', Georgia, serif", letterSpacing: "-0.02em" }}>
              Does it actually<br />
              <span style={{ color: "#5eead4" }}>do what it says?</span>
            </h1>
            <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.4)", maxWidth: 440 }}>
              We map every claim a brand makes, check what evidence actually exists, compare prices across Nykaa, Amazon and quick commerce — and give you one honest verdict.
            </p>

            {/* Search bar */}
            <div className="rounded-2xl overflow-hidden mb-4"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(94,234,212,0.18)" }}>
              <div className="flex items-center gap-3 px-4 py-4">
                <Search size={16} style={{ color: "rgba(94,234,212,0.5)", flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Product name, brand, or paste a URL…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-[rgba(255,255,255,0.2)]"
                  style={{ color: "#f0fdfa" }}
                  disabled={isLoading}
                />
                <button
                  onClick={() => runReview()}
                  disabled={isLoading || !query.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
                  style={{ background: "rgba(94,234,212,0.14)", color: "#5eead4", border: "1px solid rgba(94,234,212,0.25)" }}>
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  {isLoading ? "Reviewing…" : "Review"}
                </button>
              </div>
            </div>

            {/* Suggestions */}
            {!review && !isLoading && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => { setQuery(s); runReview(s); }}
                    className="text-[11px] font-mono px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                    style={{ color: "rgba(94,234,212,0.6)", background: "rgba(94,234,212,0.07)", border: "1px solid rgba(94,234,212,0.12)" }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <ClaimIllustration />
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS (only before first search) ── */}
      {!review && !isLoading && (
        <div className="max-w-3xl mx-auto px-4 pt-10">
          <HowItWorks />
        </div>
      )}

      {/* ── LOADING ── */}
      {isLoading && (
        <div className="max-w-2xl mx-auto px-4 pt-10">
          <div className="rounded-3xl p-8 text-center"
            style={{ background: "linear-gradient(160deg,#091c1a 0%,#0d2b27 60%,#091e1c 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex justify-center mb-5">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full blur-lg opacity-40" style={{ background: "#5eead4" }} />
                <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "rgba(94,234,212,0.3)", borderTopColor: "#5eead4" }} />
              </div>
            </div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] mb-3" style={{ color: "rgba(94,234,212,0.4)" }}>
              Claims Intelligence Engine · Active
            </p>
            <p className="text-sm min-h-[1.5rem] transition-all duration-300" style={{ color: "rgba(255,255,255,0.45)" }}>
              {LOADING_STEPS[stepIdx]}
            </p>
          </div>
        </div>
      )}

      {/* ── ERRORS ── */}
      {error && !isLoading && (
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <div className="rounded-2xl px-5 py-4 flex items-start gap-3"
            style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)" }}>
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#f87171" }} />
            <p className="text-sm" style={{ color: "rgba(248,113,113,0.85)" }}>{error}</p>
          </div>
        </div>
      )}
      {outOfScope && !isLoading && (
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <div className="rounded-2xl px-5 py-4 flex items-start gap-3"
            style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <Info size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#fbbf24" }} />
            <p className="text-sm" style={{ color: "rgba(251,191,36,0.85)" }}>
              This doesn't look like a beauty or personal care product. Try searching for a moisturizer, serum, shampoo, sunscreen, or body wash.
            </p>
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      <div ref={resultsRef} className="max-w-2xl mx-auto px-4 pt-6 pb-20">
        {review && !isLoading && <ReviewView review={review} />}
      </div>

    </div>
  );
}
