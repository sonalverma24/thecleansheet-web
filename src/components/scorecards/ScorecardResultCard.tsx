"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScoreRing } from "./ScoreRing";
import { scoreColors } from "@/data/brands";
import type { ProductScorecard } from "@/data/brands/types";
import { track } from "@/lib/analytics";

interface ScorecardResultCardProps {
  product: ProductScorecard;
  isComparing: boolean;
  onCompareToggle: (id: string) => void;
  compareCount: number;
}

// ── Badge text normaliser ─────────────────────────────────────────────────────
// Strips noise, converts to Title Case, truncates to maxLen with word boundary.
function shortBadge(raw: string, maxLen = 24): string {
  let text = raw
    // strip parenthetical notes: (Zinc Oxide Only), (Daily SPF), etc.
    .replace(/\s*\([^)]+\)/g, "")
    // strip sentence continuations after " - " or " – " e.g.
    // "Isostearic Acid - Comedogenic Potential..." → "Isostearic Acid"
    .replace(/\s+[-–]\s+.*/g, "")
    // strip everything after ", " (comma-separated qualifiers)
    .replace(/,\s+.*/g, "")
    // hyphen-between-letters to space: "fragrance-free" → "fragrance free"
    // preserves "2-3x", "SPF50+"
    .replace(/([a-zA-Z])-([a-zA-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  // Title Case
  text = text.replace(/\b\w/g, (c) => c.toUpperCase());

  if (text.length <= maxLen) return text;

  // Word-boundary truncate
  const words = text.split(" ");
  let result = "";
  for (const word of words) {
    const candidate = result ? `${result} ${word}` : word;
    if (candidate.length > maxLen - 1) break;
    result = candidate;
  }
  return result + "…";
}

// ── Active ingredient display name (strips concentration) ────────────────────
function shortActive(name: string): string {
  // "Niacinamide (10%)" → "Niacinamide"
  // "Retinol 0.3%" → "Retinol"
  return name
    .replace(/\s*\([^)]+\)/g, "")
    .replace(/\s+\d[\d.]*%.*/, "")
    .trim();
}

export function ScorecardResultCard({
  product,
  isComparing,
  onCompareToggle,
  compareCount,
}: ScorecardResultCardProps) {
  const c = scoreColors(product.score);
  const productId = `${product.brandSlug}/${product.slug}`;
  const canCompare = isComparing || compareCount < 4;

  const topActives = product.keyActives.slice(0, 3);

  // Prefer structured tags; fall back to badge arrays
  const rawPass = (product.suitabilityTags ?? product.pass_badges).slice(0, 3);
  const rawWarn = (product.cautionTags ?? product.warn_badges).slice(0, 2);

  return (
    <article className="bg-white border border-ink-100 rounded-3xl overflow-hidden hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/8 transition-all duration-300 flex flex-col">

      {/* Image + score overlay */}
      <div className="relative bg-ink-50 aspect-square overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.productName}
            fill
            className="object-contain p-4"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">🧴</span>
          </div>
        )}
        {/* Score label badge */}
        <div className="absolute top-3 right-3">
          <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${c.bg} ${c.text} ${c.border}`}>
            {product.scoreLabel}
          </div>
        </div>
        {/* Category chip */}
        {product.category && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border border-white/60 text-ink-600 text-[10px] px-2 py-0.5 rounded-full">
            {product.category}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">

        {/* Brand + product name */}
        <div className="mb-3">
          <p className="text-[11px] text-ink-400 uppercase tracking-wider mb-0.5">{product.brand}</p>
          <h3 className="text-sm font-medium text-ink-950 leading-snug line-clamp-2">
            {product.productName}
          </h3>
        </div>

        {/* Score ring + price */}
        <div className="flex items-center justify-between mb-3">
          <ScoreRing score={product.score} size={48} />
          <div className="text-right">
            <p className="text-sm font-medium text-ink-900">{product.priceRange}</p>
            {product.pricePerUnit && product.sizeUnit && (
              <p className="text-[10px] text-ink-400 font-sans">
                ₹{product.pricePerUnit.toFixed(0)}/{product.sizeUnit}
              </p>
            )}
          </div>
        </div>

        {/* Key actives */}
        {topActives.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {topActives.map((a) => (
              <span
                key={a.name}
                title={a.name}
                className="text-[10px] bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full whitespace-nowrap"
              >
                {shortActive(a.name)}
              </span>
            ))}
          </div>
        )}

        {/* Pass + caution chips — fixed height, no stretch */}
        <div className="flex flex-wrap gap-1 mb-4">
          {rawPass.map((b) => (
            <span
              key={b}
              title={b}
              className="text-[10px] bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full whitespace-nowrap"
            >
              {shortBadge(b)}
            </span>
          ))}
          {rawWarn.map((b) => (
            <span
              key={b}
              title={b}
              className="text-[10px] bg-coral-50 text-coral-600 border border-coral-100 px-2 py-0.5 rounded-full whitespace-nowrap"
            >
              {shortBadge(b)}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-2 mt-auto">
          <Link
            href={`/brands/${product.brandSlug}/${product.slug}`}
            onClick={() => track("scorecard_opened", { slug: product.slug })}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors"
          >
            View scorecard <ArrowRight size={11} />
          </Link>

          <button
            onClick={() => { if (canCompare) onCompareToggle(productId); }}
            disabled={!canCompare}
            title={
              !canCompare
                ? "Max 4 products for comparison"
                : isComparing
                ? "Remove from comparison"
                : "Add to comparison"
            }
            className={`px-3 py-2 rounded-xl text-xs border transition-colors ${
              isComparing
                ? "bg-teal-700 border-teal-700 text-white"
                : !canCompare
                ? "border-ink-200 text-ink-300 cursor-not-allowed"
                : "border-ink-200 text-ink-500 hover:border-teal-300 hover:text-teal-700"
            }`}
          >
            {isComparing ? "✓" : "Compare"}
          </button>
        </div>
      </div>
    </article>
  );
}
