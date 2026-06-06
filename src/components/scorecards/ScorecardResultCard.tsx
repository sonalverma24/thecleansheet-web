"use client";
import Image from "next/image";
import Link from "next/link";
import { TileChip } from "./TileChip";
import { scoreColors } from "@/data/brands";
import type { ProductScorecard } from "@/data/brands/types";
import { getTileChips } from "@/data/badges/resolver";
import { track } from "@/lib/analytics";
import {
  getProductCategoryLabel,
  getDisplayPrice,
} from "@/lib/product-card-helpers";

interface ScorecardResultCardProps {
  product: ProductScorecard;
  isComparing: boolean;
  onCompareToggle: (id: string) => void;
  compareCount: number;
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

  const chips = getTileChips(product);
  const categoryLabel = getProductCategoryLabel(product);
  const displayPrice = getDisplayPrice(product);
  const isPending = categoryLabel === "Category Pending";

  return (
    <Link
      href={`/brands/${product.brandSlug}/${product.slug}`}
      onClick={() => track("scorecard_opened", { slug: product.slug })}
      className="block group"
    >
      <article className="bg-white border border-ink-100 rounded-2xl overflow-hidden hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/8 transition-all duration-200 flex flex-col h-full">

        {/* Image + overlays */}
        <div className="relative bg-ink-50 aspect-square overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.productName}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🧴</span>
            </div>
          )}

          {/* Score number — top right, overlapping image */}
          <div className="absolute top-2 right-2" style={{ zIndex: 10 }}>
            <div style={{
              background: "rgba(255,255,255,0.96)",
              borderRadius: 8,
              padding: "3px 6px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.10)",
              lineHeight: 1,
            }}>
              <span style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 24,
                color: c.ring,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}>
                {product.score}
              </span>
            </div>
          </div>

          {/* Category pill — bottom left */}
          <div
            className="absolute bottom-2 left-2 max-w-[calc(100%-16px)] overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              borderRadius: 999,
              padding: "3px 8px",
              fontSize: 10,
              color: isPending ? "#b0a8a4" : "#282828",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              lineHeight: 1.3,
            }}
          >
            {categoryLabel}
          </div>
        </div>

        {/* Card body */}
        <div className="p-3 flex flex-col flex-1">

          {/* Brand + product name */}
          <div className="mb-2">
            <p className="text-[9px] text-ink-400 uppercase tracking-wider mb-0.5 truncate">
              {product.brand}
            </p>
            <h3 className="text-xs font-medium text-ink-950 group-hover:text-teal-700 transition-colors leading-snug line-clamp-2">
              {product.productName}
            </h3>
          </div>

          {/* Tile chips: skin type / routine / red flag */}
          {chips.length > 0 && (
            <div className="flex gap-1 mb-2 overflow-hidden">
              {chips.map((chip) => (
                <TileChip key={chip.variant} label={chip.label} variant={chip.variant} />
              ))}
            </div>
          )}

          {/* Price + compare */}
          <div className="flex items-center justify-between pt-2 border-t border-ink-50 mt-auto">
            <span className="font-semibold text-ink-900 tabular-nums text-sm leading-tight">
              {displayPrice}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (canCompare) onCompareToggle(productId);
              }}
              disabled={!canCompare}
              title={
                !canCompare
                  ? "Max 4 products for comparison"
                  : isComparing
                  ? "Remove from comparison"
                  : "Add to comparison"
              }
              className="flex-shrink-0 flex items-center justify-center transition-colors"
              style={{
                height: 28,
                width: 28,
                borderRadius: 8,
                padding: 0,
                fontSize: 14,
                fontWeight: 500,
                border: isComparing
                  ? "1px solid #1f5f55"
                  : !canCompare
                  ? "1px solid rgba(176,168,164,0.3)"
                  : "1px solid rgba(176,168,164,0.45)",
                background: isComparing ? "#1f5f55" : "#fff",
                color: isComparing ? "#fff" : !canCompare ? "#d0c8c4" : "#9f9994",
                cursor: !canCompare ? "not-allowed" : "pointer",
              }}
            >
              {isComparing ? "✓" : "+"}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
