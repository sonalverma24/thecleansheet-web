"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight, ChevronRight } from "lucide-react";
import type { ProductScorecard } from "@/data/brands/types";
import {
  buildDecision,
  buildComparisonRow,
  getConcernType,
  getFormulationQuality,
  getIngredientsOfConcern,
  getPricePerMlDisplay,
  type ConcernType,
  type FormulationQuality,
} from "@/lib/comparison-engine";
import { track } from "@/lib/analytics";
import { ExpandableSection } from "./ExpandableSection";

interface ComparisonDecisionEngineProps {
  products: ProductScorecard[];
  onClose: () => void;
}

// ── Style maps ────────────────────────────────────────────────────────────────

const CONCERN_STYLE: Record<ConcernType, { text: string; bg: string; border: string }> = {
  "Low concern":      { text: "text-teal-700",  bg: "bg-teal-50",   border: "border-teal-200"  },
  "Moderate concern": { text: "text-amber-700", bg: "bg-amber-50",  border: "border-amber-200" },
  "High concern":     { text: "text-coral-700", bg: "bg-coral-50",  border: "border-coral-200" },
  "Not enough data":  { text: "text-ink-500",   bg: "bg-ink-50",    border: "border-ink-200"   },
};

const QUALITY_STYLE: Record<FormulationQuality, string> = {
  "Excellent":       "text-teal-700 font-semibold",
  "Good":            "text-teal-600",
  "Average":         "text-amber-700",
  "Weak":            "text-coral-600",
  "Not enough data": "text-ink-400",
};

const SCORE_COLOR = (score: number) => {
  if (score >= 80) return "text-teal-700";
  if (score >= 65) return "text-amber-700";
  return "text-coral-600";
};

// ── Component ─────────────────────────────────────────────────────────────────

export function ComparisonDecisionEngine({ products, onClose }: ComparisonDecisionEngineProps) {
  const decision = useMemo(() => buildDecision(products), [products]);
  const rows = useMemo(() => products.map(buildComparisonRow), [products]);

  const bestId = `${decision.bestOverall.brandSlug}/${decision.bestOverall.slug}`;
  const bestValueId = `${decision.bestValue.brandSlug}/${decision.bestValue.slug}`;

  const handleClose = () => {
    track("comparison_viewed", { slugs: products.map((p) => p.slug) });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/50">
      {/* ── Close bar ── */}
      <div className="bg-white border-b border-ink-100 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3">
        <span className="text-sm font-medium text-ink-700">
          Comparing {products.length} product{products.length > 1 ? "s" : ""}
        </span>
        <button
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-ink-100 transition-colors"
          aria-label="Close comparison"
        >
          <X size={18} className="text-ink-600" />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="overflow-y-auto flex-1" style={{ background: "#faf7f2" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* ── TOP PICK HEADER ── */}
          <div className="bg-white rounded-2xl border border-teal-200 px-5 py-5">
            <p className="text-xs text-teal-600 font-semibold uppercase tracking-wide mb-1">
              Top pick
            </p>
            <h2 className="text-xl font-semibold text-ink-900 leading-snug mb-1">
              {decision.bestOverall.brand} {decision.bestOverall.productName}
            </h2>
            <p className="text-sm text-ink-500 mb-4">
              <span className="font-medium text-ink-700">Why:</span>{" "}
              {decision.bestOverallReason}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/brands/${decision.bestOverall.brandSlug}/${decision.bestOverall.slug}`}
                onClick={handleClose}
                className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 rounded-xl transition-colors"
                style={{ minHeight: 40 }}
              >
                View product <ArrowRight size={13} />
              </Link>
              <button
                onClick={() => {
                  document.getElementById("comparison-table")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-1.5 border border-ink-200 text-ink-600 hover:text-ink-900 hover:border-ink-300 text-sm font-medium px-4 rounded-xl transition-colors bg-white"
                style={{ minHeight: 40 }}
              >
                Compare details
              </button>
            </div>
          </div>

          {/* ── PRODUCT CARDS ── */}
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${Math.min(products.length, 3)}, minmax(0, 1fr))` }}
          >
            {products.map((p, i) => {
              const id = `${p.brandSlug}/${p.slug}`;
              const isWinner = id === bestId;
              const isValue = id === bestValueId && bestValueId !== bestId;
              const row = rows[i];
              const concernStyle = CONCERN_STYLE[row.concernType];

              return (
                <div
                  key={id}
                  className={`bg-white rounded-2xl border overflow-hidden ${
                    isWinner ? "border-teal-300" : "border-ink-100"
                  }`}
                >
                  {/* Winner / value ribbon */}
                  {(isWinner || isValue) && (
                    <div
                      className={`px-4 py-1.5 text-xs font-semibold ${
                        isWinner
                          ? "bg-teal-600 text-white"
                          : "text-ink-800"
                      }`}
                      style={isValue && !isWinner ? { background: "#d2ff34" } : undefined}
                    >
                      {isWinner ? "Top pick" : "Best value"}
                    </div>
                  )}

                  {/* Product image */}
                  <div className="bg-ink-50 flex items-center justify-center overflow-hidden" style={{ height: 140 }}>
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.productName}
                        width={120}
                        height={120}
                        className="object-contain p-3 max-h-full"
                      />
                    ) : (
                      <span className="text-4xl">🧴</span>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="px-4 py-4 space-y-2">
                    <div>
                      <p className="text-[10px] text-ink-400 uppercase tracking-wider">{p.brand}</p>
                      <p className="text-sm font-semibold text-ink-900 leading-snug line-clamp-2">{p.productName}</p>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-ink-900">{p.priceRange}</span>
                      {row.pricePerMl !== "—" && (
                        <span className="text-xs text-ink-400">{row.pricePerMl}</span>
                      )}
                    </div>

                    {/* Score */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-[10px] text-ink-400 uppercase tracking-wide">Clean Sheet Score</p>
                        <p className={`text-2xl font-bold tabular-nums ${SCORE_COLOR(p.score)}`}>
                          {p.score}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${concernStyle.bg} ${concernStyle.text} ${concernStyle.border}`}>
                        {row.concernType}
                      </span>
                    </div>

                    {/* Verdict */}
                    {p.summary && (
                      <p className="text-xs text-ink-500 leading-relaxed line-clamp-2 pt-1 border-t border-ink-50">
                        {p.summary.split(".")[0]}.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── 5-POINT COMPARISON ── */}
          <div id="comparison-table" className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-ink-100">
              <h3 className="text-sm font-semibold text-ink-900">5-point comparison</h3>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-ink-100">
                    <th className="text-left px-5 py-3 text-xs font-medium text-ink-400 w-44">
                      Comparison point
                    </th>
                    {products.map((p) => {
                      const id = `${p.brandSlug}/${p.slug}`;
                      const isWinner = id === bestId;
                      return (
                        <th
                          key={id}
                          className={`px-4 py-3 text-center ${isWinner ? "bg-teal-50/50" : ""}`}
                        >
                          <p className="text-[10px] text-ink-400 uppercase tracking-wide">{p.brand}</p>
                          <p className="text-xs font-semibold text-ink-900 leading-snug line-clamp-2 max-w-[140px] mx-auto">
                            {p.productName}
                          </p>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <TableRow
                    label="Concern type"
                    products={products}
                    bestId={bestId}
                    render={(p) => {
                      const ct = getConcernType(p);
                      const s = CONCERN_STYLE[ct];
                      return (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                          {ct}
                        </span>
                      );
                    }}
                  />
                  <TableRow
                    label="Price per ml"
                    products={products}
                    bestId={bestId}
                    render={(p) => (
                      <span className="text-xs text-ink-700">{getPricePerMlDisplay(p)}</span>
                    )}
                  />
                  <TableRow
                    label="Formulation quality"
                    products={products}
                    bestId={bestId}
                    render={(p) => {
                      const q = getFormulationQuality(p);
                      return <span className={`text-xs ${QUALITY_STYLE[q]}`}>{q}</span>;
                    }}
                  />
                  <TableRow
                    label="Ingredients of concern"
                    products={products}
                    bestId={bestId}
                    render={(p) => {
                      const v = getIngredientsOfConcern(p);
                      return (
                        <span className={`text-xs ${v === "None major" ? "text-teal-600" : "text-coral-600"}`}>
                          {v}
                        </span>
                      );
                    }}
                  />
                  <TableRow
                    label="Clean Sheet score"
                    products={products}
                    bestId={bestId}
                    render={(p) => (
                      <span className={`text-base font-bold tabular-nums ${SCORE_COLOR(p.score)}`}>
                        {p.score}
                      </span>
                    )}
                  />
                </tbody>
              </table>
            </div>

            {/* Mobile stacked rows */}
            <div className="md:hidden divide-y divide-ink-50">
              {(
                [
                  { label: "Concern type",            render: (p: ProductScorecard) => { const ct = getConcernType(p); const s = CONCERN_STYLE[ct]; return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>{ct}</span>; } },
                  { label: "Price per ml",             render: (p: ProductScorecard) => <span className="text-xs text-ink-700">{getPricePerMlDisplay(p)}</span> },
                  { label: "Formulation quality",      render: (p: ProductScorecard) => { const q = getFormulationQuality(p); return <span className={`text-xs ${QUALITY_STYLE[q]}`}>{q}</span>; } },
                  { label: "Ingredients of concern",   render: (p: ProductScorecard) => { const v = getIngredientsOfConcern(p); return <span className={`text-xs ${v === "None major" ? "text-teal-600" : "text-coral-600"}`}>{v}</span>; } },
                  { label: "Clean Sheet score",        render: (p: ProductScorecard) => <span className={`text-sm font-bold tabular-nums ${SCORE_COLOR(p.score)}`}>{p.score}</span> },
                ] as { label: string; render: (p: ProductScorecard) => React.ReactNode }[]
              ).map(({ label, render }) => (
                <div key={label} className="px-4 py-3">
                  <p className="text-xs font-medium text-ink-500 mb-2">{label}</p>
                  <div className="space-y-2">
                    {products.map((p) => {
                      const id = `${p.brandSlug}/${p.slug}`;
                      const isWinner = id === bestId;
                      return (
                        <div key={id} className="flex items-center justify-between">
                          <span className={`text-xs ${isWinner ? "font-semibold text-ink-800" : "text-ink-500"} truncate max-w-[140px]`}>
                            {p.brand}
                          </span>
                          <div>{render(p)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FINAL DECISION ROW ── */}
          <div className="bg-white rounded-2xl border border-ink-100 px-5 py-5">
            <h3 className="text-sm font-semibold text-ink-900 mb-4">Final decision</h3>
            <div className="space-y-3">
              <DecisionLine
                label="Best overall"
                color="teal"
                product={decision.bestOverall}
                onClose={handleClose}
              />
              {bestValueId !== bestId && (
                <DecisionLine
                  label="Best value"
                  color="lime"
                  product={decision.bestValue}
                  onClose={handleClose}
                />
              )}
              {decision.useCaution && (
                <DecisionLine
                  label="Use caution"
                  color="coral"
                  product={decision.useCaution}
                  note={decision.useCautionReason ?? undefined}
                  onClose={handleClose}
                />
              )}
            </div>
          </div>

          {/* ── SEE DETAILED PROOF ── */}
          <div className="bg-white rounded-2xl border border-ink-100 px-5">
            <ExpandableSection title="See detailed proof">
              <div className="space-y-6">
                {products.map((p) => (
                  <ProductDetailBlock key={`${p.brandSlug}/${p.slug}`} product={p} />
                ))}
              </div>
            </ExpandableSection>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-ink-400 text-center leading-relaxed pb-4">
            Scores are based on publicly available ingredient lists and verified brand disclosures.
            Not medical advice. Consult a dermatologist for skin conditions.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Table row (desktop) ───────────────────────────────────────────────────────

function TableRow({
  label,
  products,
  bestId,
  render,
}: {
  label: string;
  products: ProductScorecard[];
  bestId: string;
  render: (p: ProductScorecard) => React.ReactNode;
}) {
  return (
    <tr className="border-b border-ink-50 last:border-b-0 hover:bg-ink-50/30 transition-colors">
      <td className="px-5 py-3.5 text-xs font-medium text-ink-500 align-middle">{label}</td>
      {products.map((p) => {
        const id = `${p.brandSlug}/${p.slug}`;
        return (
          <td
            key={id}
            className={`px-4 py-3.5 text-center align-middle ${id === bestId ? "bg-teal-50/50" : ""}`}
          >
            {render(p)}
          </td>
        );
      })}
    </tr>
  );
}

// ── Decision line ─────────────────────────────────────────────────────────────

function DecisionLine({
  label,
  color,
  product,
  note,
  onClose,
}: {
  label: string;
  color: "teal" | "lime" | "coral";
  product: ProductScorecard;
  note?: string;
  onClose: () => void;
}) {
  const dotColor =
    color === "teal" ? "bg-teal-600" : color === "coral" ? "bg-coral-500" : "bg-[#d2ff34]";
  const labelColor =
    color === "teal" ? "text-teal-700" : color === "coral" ? "text-coral-600" : "text-ink-700";

  return (
    <div className="flex items-start gap-3">
      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
      <div className="min-w-0">
        <span className={`text-xs font-semibold uppercase tracking-wide ${labelColor} mr-2`}>
          {label}:
        </span>
        <Link
          href={`/brands/${product.brandSlug}/${product.slug}`}
          onClick={onClose}
          className="text-sm text-ink-800 hover:text-teal-700 font-medium transition-colors"
        >
          {product.brand}
          <ChevronRight size={12} className="inline ml-0.5 opacity-50" />
        </Link>
        {note && (
          <p className="text-xs text-ink-500 mt-0.5">{note}</p>
        )}
      </div>
    </div>
  );
}

// ── Product detail block (inside expanded accordion) ─────────────────────────

function ProductDetailBlock({ product: p }: { product: ProductScorecard }) {
  const safetyPillar     = p.pillars[0];
  const formulationPillar = p.pillars[1];
  const claimsPillar     = p.pillars[2];
  const ethicsPillar     = p.pillars[3];

  return (
    <div className="border-b border-ink-50 last:border-b-0 pb-6 last:pb-0">
      <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide mb-4">
        {p.brand} — {p.productName}
      </p>

      {/* Score breakdown */}
      <div className="space-y-2 mb-4">
        {[safetyPillar, formulationPillar, claimsPillar, ethicsPillar].map((pillar) => {
          if (!pillar) return null;
          const pct = Math.round((pillar.score / pillar.max) * 100);
          return (
            <div key={pillar.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-ink-600">{pillar.name}</span>
                <span className="text-xs font-medium text-ink-700">{pillar.score}/{pillar.max}</span>
              </div>
              <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${pct >= 80 ? "bg-teal-500" : pct >= 60 ? "bg-amber-400" : "bg-coral-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[11px] text-ink-400 leading-relaxed mt-1">{pillar.note}</p>
            </div>
          );
        })}
      </div>

      {/* Key actives */}
      {p.keyActives.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Key actives</p>
          <div className="space-y-1">
            {p.keyActives.map((a) => (
              <div key={a.name} className="flex gap-2 text-xs">
                <span className="font-medium text-teal-700 flex-shrink-0 w-32 truncate">{a.name.split("(")[0].trim()}</span>
                <span className="text-ink-500 leading-relaxed">{a.function}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claims */}
      {(p.claimsVerified?.length || p.claimsNotVerified?.length) ? (
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Claims proof</p>
          {p.claimsVerified?.map((c, i) => (
            <p key={i} className="text-xs text-ink-600 flex gap-1.5 mb-1">
              <span className="text-teal-500 flex-shrink-0">✓</span>{c}
            </p>
          ))}
          {p.claimsNotVerified?.map((c, i) => (
            <p key={i} className="text-xs text-ink-600 flex gap-1.5 mb-1">
              <span className="text-coral-400 flex-shrink-0">✗</span>{c}
            </p>
          ))}
        </div>
      ) : null}

      {/* Use cautions */}
      {p.warn_badges.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-2">Use cautions</p>
          <div className="flex flex-wrap gap-1.5">
            {p.warn_badges.map((b) => (
              <span key={b} className="text-xs bg-coral-50 text-coral-700 border border-coral-100 px-2 py-0.5 rounded-full">
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* India context */}
      {p.indiaContext && (
        <div>
          <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wide mb-1">India context</p>
          <p className="text-xs text-ink-500 leading-relaxed">{p.indiaContext}</p>
        </div>
      )}
    </div>
  );
}
