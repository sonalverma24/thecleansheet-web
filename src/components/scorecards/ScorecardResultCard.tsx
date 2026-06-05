"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScoreRing } from "./ScoreRing";
import { ScorecardBadge } from "./ScorecardBadge";
import { scoreColors } from "@/data/brands";
import type { ProductScorecard } from "@/data/brands/types";
import { getCardBadges } from "@/data/badges/resolver";
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

  const allBadges = getCardBadges(product);
  const MAX_BADGES = 2;
  const cardBadges = allBadges.slice(0, MAX_BADGES);
  const extraBadgeCount = allBadges.length - MAX_BADGES;
  const categoryLabel = getProductCategoryLabel(product);
  const displayPrice = getDisplayPrice(product);
  const isPending = categoryLabel === "Category Pending";

  return (
    <article className="bg-white border border-ink-100 rounded-2xl overflow-hidden hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/8 transition-all duration-200 flex flex-col">

      {/* Image + overlays */}
      <div className="relative bg-ink-50 aspect-square overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.productName}
            fill
            className="object-contain p-2"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🧴</span>
          </div>
        )}

        {/* Score label — top right */}
        <div className="absolute top-2 right-2">
          <div className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium border ${c.bg} ${c.text} ${c.border}`}>
            {product.scoreLabel}
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
          <h3 className="text-xs font-medium text-ink-950 leading-snug line-clamp-2">
            {product.productName}
          </h3>
        </div>

        {/* Score ring + price block */}
        <div className="flex items-center justify-between mb-2">
          <ScoreRing score={product.score} size={36} />
          <div className="text-right flex-shrink-0">
            <p className="font-semibold text-ink-900 tabular-nums text-sm leading-tight">
              {displayPrice}
            </p>
          </div>
        </div>

        {/* Taxonomy badges (max 2; remainder shown as +N) */}
        {cardBadges.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {cardBadges.map((badge) => (
              <ScorecardBadge
                key={badge.id}
                family={badge.family}
                label={badge.label}
                icon={badge.icon}
                tooltip={badge.tooltip}
              />
            ))}
            {extraBadgeCount > 0 && (
              <span
                className="inline-flex items-center self-center"
                style={{ fontSize: 10, color: "#b0a8a4" }}
              >
                +{extraBadgeCount}
              </span>
            )}
          </div>
        )}

        {/* CTAs */}
        <div className="flex items-center gap-1.5 mt-auto">
          <Link
            href={`/brands/${product.brandSlug}/${product.slug}`}
            onClick={() => track("scorecard_opened", { slug: product.slug })}
            className="flex-1 inline-flex items-center justify-center hover:opacity-90 active:opacity-80 transition-opacity"
            style={{
              height: 36,
              borderRadius: 10,
              padding: "0 10px",
              whiteSpace: "nowrap",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1,
              background: "#1f5f55",
              color: "#fff",
            }}
          >
            View <ArrowRight size={11} />
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
            className="flex-shrink-0 flex items-center justify-center transition-colors"
            style={{
              height: 36,
              width: 36,
              borderRadius: 10,
              padding: 0,
              fontSize: 16,
              fontWeight: 500,
              flexShrink: 0,
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
  );
}
