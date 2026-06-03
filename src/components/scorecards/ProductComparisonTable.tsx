"use client";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { ScoreRing } from "./ScoreRing";
import { scoreColors } from "@/data/brands";
import type { ProductScorecard } from "@/data/brands/types";
import { track } from "@/lib/analytics";

interface ProductComparisonTableProps {
  products: ProductScorecard[];
  onClose: () => void;
}

// ── Comparison summary logic ──────────────────────────────────────────────────
function buildSummary(products: ProductScorecard[]) {
  if (products.length < 2) return [];
  const lines: string[] = [];

  const highest = [...products].sort((a, b) => b.score - a.score)[0];
  lines.push(`Choose ${highest.brand} ${highest.productName} for the highest Clean Sheet Score (${highest.score}/100).`);

  // Best value
  const withPrice = products.filter((p) => p.pricePerUnit && p.sizeUnit);
  if (withPrice.length >= 2) {
    const bestValue = [...withPrice].sort((a, b) => (a.pricePerUnit ?? 999) - (b.pricePerUnit ?? 999))[0];
    lines.push(`Best value per ${bestValue.sizeUnit}: ${bestValue.brand} ${bestValue.productName} at ₹${bestValue.pricePerUnit?.toFixed(0)}/${bestValue.sizeUnit}.`);
  }

  // Fewest cautions
  const fewestCautions = [...products].sort(
    (a, b) => (a.warn_badges.length + (a.cautionTags?.length ?? 0)) - (b.warn_badges.length + (b.cautionTags?.length ?? 0))
  )[0];
  if ((fewestCautions.warn_badges.length + (fewestCautions.cautionTags?.length ?? 0)) === 0) {
    lines.push(`${fewestCautions.brand} ${fewestCautions.productName} has no caution flags.`);
  } else {
    lines.push(`Fewest caution flags: ${fewestCautions.brand} ${fewestCautions.productName}.`);
  }

  // Strongest evidence (Claims & Transparency pillar)
  const claimsPillar = (p: ProductScorecard) => {
    const pillar = p.pillars.find((pl) => pl.name.toLowerCase().includes("claim"));
    return pillar ? (pillar.score / pillar.max) * 100 : 0;
  };
  const bestEvidence = [...products].sort((a, b) => claimsPillar(b) - claimsPillar(a))[0];
  if (bestEvidence) {
    const pct = Math.round(claimsPillar(bestEvidence));
    lines.push(`Strongest evidence and transparency: ${bestEvidence.brand} ${bestEvidence.productName} (${pct}% Claims score).`);
  }

  // Fragrance-free
  const fragranceFree = products.filter(
    (p) => p.fragranceStatus === "free" || p.pass_badges.some((b) => b.toLowerCase().includes("fragrance-free"))
  );
  if (fragranceFree.length > 0 && fragranceFree.length < products.length) {
    lines.push(`Fragrance-free: ${fragranceFree.map((p) => p.productName.split(" ").slice(0, 3).join(" ")).join(", ")}.`);
  }

  return lines;
}

// ── Row types ─────────────────────────────────────────────────────────────────
type CellValue = string | number | React.ReactNode;

function inferFragrance(p: ProductScorecard): string {
  if (p.fragranceStatus === "free") return "Fragrance-free";
  if (p.fragranceStatus === "synthetic") return "Contains synthetic fragrance";
  if (p.fragranceStatus === "essential-oil") return "Contains essential oils";
  if (p.fragranceStatus === "both") return "Synthetic fragrance + essential oils";
  if (p.pass_badges.some((b) => b.toLowerCase().includes("fragrance-free"))) return "Fragrance-free";
  if (p.warn_badges.some((b) => b.toLowerCase().includes("fragrance"))) return "Contains fragrance";
  if (p.ingredients.some((i) => i.name.toLowerCase().includes("fragrance") || i.name.toLowerCase().includes("parfum"))) return "Contains fragrance";
  return "Unknown";
}

function inferAlcohol(p: ProductScorecard): string {
  if (p.alcoholStatus === "free") return "Alcohol-free";
  if (p.alcoholStatus === "contains-drying") return "Contains drying alcohol";
  if (p.alcoholStatus === "contains-fatty-only") return "Fatty alcohols only";
  if (p.pass_badges.some((b) => b.toLowerCase().includes("alcohol-free"))) return "Alcohol-free";
  if (p.warn_badges.some((b) => b.toLowerCase().includes("alcohol"))) return "Contains drying alcohol";
  return "Unknown";
}

export function ProductComparisonTable({
  products,
  onClose,
}: ProductComparisonTableProps) {
  const summary = buildSummary(products);

  const handleClose = () => {
    track("comparison_viewed", { slugs: products.map((p) => p.slug) });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-ink-200 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
        <h2 className="text-base font-medium text-ink-900">
          Comparing {products.length} products
        </h2>
        <button
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-ink-100 transition-colors"
          aria-label="Close comparison"
        >
          <X size={18} className="text-ink-600" />
        </button>
      </div>

      {/* Scrollable area */}
      <div className="overflow-auto flex-1 bg-ink-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

          {/* ── Desktop table ── */}
          <div className="hidden md:block">
            <table className="w-full border-collapse bg-white rounded-2xl overflow-hidden shadow-sm">
              <thead>
                <tr className="border-b border-ink-100">
                  <th className="text-left text-xs font-medium text-ink-500 px-5 py-4 w-40">
                    Criteria
                  </th>
                  {products.map((p) => (
                    <th
                      key={p.slug}
                      className="px-4 py-4 text-center"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-xl bg-ink-50 border border-ink-100 flex items-center justify-center overflow-hidden">
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt={p.productName}
                              width={56}
                              height={56}
                              className="object-contain p-1"
                            />
                          ) : (
                            <span className="text-2xl">🧴</span>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] text-ink-400 uppercase tracking-wider">{p.brand}</p>
                          <p className="text-xs font-medium text-ink-900 max-w-[140px] leading-snug">
                            {p.productName}
                          </p>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renderTableRows(products)}
              </tbody>
            </table>
          </div>

          {/* ── Mobile stacked cards ── */}
          <div className="md:hidden space-y-4">
            {products.map((p) => (
              <MobileProductCard key={p.slug} product={p} />
            ))}
          </div>

          {/* ── Decision summary ── */}
          {summary.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl border border-teal-100 p-5 shadow-sm">
              <h3 className="text-sm font-medium text-teal-800 mb-3">Decision summary</h3>
              <ul className="space-y-2">
                {summary.map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-700">
                    <span className="text-teal-400 mt-0.5 flex-shrink-0">→</span>
                    {line}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[11px] text-ink-400 italic">
                These summaries are computed from scorecard data only. They are not medical recommendations.
              </p>
            </div>
          )}

          {/* CTAs */}
          <div className="mt-4 flex flex-wrap gap-3">
            {products.map((p) => (
              <Link
                key={p.slug}
                href={`/brands/${p.brandSlug}/${p.slug}`}
                className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors"
                onClick={handleClose}
              >
                View {p.brand} scorecard <ArrowRight size={11} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Table row renderer ────────────────────────────────────────────────────────
function renderTableRows(products: ProductScorecard[]) {
  const rows: { label: string; render: (p: ProductScorecard) => CellValue }[] = [
    {
      label: "Price",
      render: (p) => p.priceRange,
    },
    {
      label: "Category",
      render: (p) => p.category ?? p.productType,
    },
    {
      label: "Key actives",
      render: (p) => (
        <div className="flex flex-wrap gap-1 justify-center">
          {p.keyActives.slice(0, 4).map((a) => (
            <span key={a.name} className="text-[10px] bg-teal-50 text-teal-700 border border-teal-100 px-1.5 py-0.5 rounded-md">
              {a.name.split("(")[0].trim()}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: "Fragrance",
      render: (p) => inferFragrance(p),
    },
    {
      label: "Alcohol",
      render: (p) => inferAlcohol(p),
    },
    {
      label: "Safety score",
      render: (p) => {
        const pillar = p.pillars[0];
        return pillar ? `${pillar.score}/${pillar.max}` : "-";
      },
    },
    {
      label: "Formulation score",
      render: (p) => {
        const pillar = p.pillars[1];
        return pillar ? `${pillar.score}/${pillar.max}` : "-";
      },
    },
    {
      label: "Claims score",
      render: (p) => {
        const pillar = p.pillars[2];
        return pillar ? `${pillar.score}/${pillar.max}` : "-";
      },
    },
    {
      label: "Ethics score",
      render: (p) => {
        const pillar = p.pillars[3];
        return pillar ? `${pillar.score}/${pillar.max}` : "-";
      },
    },
    {
      label: "Overall score",
      render: (p) => (
        <div className="flex justify-center">
          <ScoreRing score={p.score} size={48} />
        </div>
      ),
    },
    {
      label: "Score label",
      render: (p) => {
        const c = scoreColors(p.score);
        return (
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
            {p.scoreLabel}
          </span>
        );
      },
    },
    {
      label: "Good for",
      render: (p) => (
        <div className="flex flex-wrap gap-1 justify-center">
          {p.pass_badges.slice(0, 4).map((b) => (
            <span key={b} className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-md">
              {b}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: "Use caution if",
      render: (p) =>
        p.warn_badges.length > 0 ? (
          <div className="flex flex-wrap gap-1 justify-center">
            {p.warn_badges.map((b) => (
              <span key={b} className="text-[10px] bg-coral-50 text-coral-600 border border-coral-100 px-1.5 py-0.5 rounded-md">
                {b}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[11px] text-teal-600">No cautions</span>
        ),
    },
    {
      label: "Concern",
      render: (p) => <span className="text-xs text-ink-600">{p.concern}</span>,
    },
  ];

  return rows.map(({ label, render }) => (
    <tr key={label} className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors">
      <td className="text-xs font-medium text-ink-500 px-5 py-3.5 align-top">{label}</td>
      {products.map((p) => (
        <td key={p.slug} className="px-4 py-3.5 text-center align-middle text-xs text-ink-700">
          {render(p)}
        </td>
      ))}
    </tr>
  ));
}

// ── Mobile product card ───────────────────────────────────────────────────────
function MobileProductCard({ product: p }: { product: ProductScorecard }) {
  const c = scoreColors(p.score);
  return (
    <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 p-4 border-b border-ink-100">
        <div className="w-14 h-14 rounded-xl bg-ink-50 border border-ink-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {p.image ? (
            <Image src={p.image} alt={p.productName} width={48} height={48} className="object-contain p-1" />
          ) : (
            <span className="text-2xl">🧴</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-ink-400 uppercase tracking-wider">{p.brand}</p>
          <p className="text-sm font-medium text-ink-900 leading-snug">{p.productName}</p>
        </div>
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <ScoreRing score={p.score} size={44} />
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${c.bg} ${c.text}`}>
            {p.scoreLabel}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-3 text-xs">
        <Row label="Price" value={p.priceRange} />
        <Row label="Category" value={p.category ?? p.productType} />
        <Row label="Fragrance" value={inferFragrance(p)} />
        <Row label="Alcohol" value={inferAlcohol(p)} />
        <Row
          label="Safety"
          value={p.pillars[0] ? `${p.pillars[0].score}/${p.pillars[0].max}` : "-"}
        />
        <Row
          label="Formulation"
          value={p.pillars[1] ? `${p.pillars[1].score}/${p.pillars[1].max}` : "-"}
        />
        <Row
          label="Claims"
          value={p.pillars[2] ? `${p.pillars[2].score}/${p.pillars[2].max}` : "-"}
        />
        <Row
          label="Ethics"
          value={p.pillars[3] ? `${p.pillars[3].score}/${p.pillars[3].max}` : "-"}
        />
        {p.warn_badges.length > 0 && (
          <div>
            <span className="text-ink-500 font-medium">Cautions: </span>
            <span className="text-coral-600">{p.warn_badges.join(", ")}</span>
          </div>
        )}
        <Link
          href={`/brands/${p.brandSlug}/${p.slug}`}
          className="mt-2 inline-flex items-center gap-1 text-teal-700 font-medium"
        >
          View full scorecard <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-ink-500 font-medium flex-shrink-0 w-24">{label}</span>
      <span className="text-ink-700">{value}</span>
    </div>
  );
}

