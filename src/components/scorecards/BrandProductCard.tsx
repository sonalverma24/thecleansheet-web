"use client";

import Image from "next/image";
import Link from "next/link";
import { TileChip } from "./TileChip";
import { scoreColors } from "@/data/brands";
import type { ProductScorecard } from "@/data/brands/types";
import { getTileChips } from "@/data/badges/resolver";
import { getProductCategoryLabel } from "@/lib/product-card-helpers";

interface BrandProductCardProps {
  product: ProductScorecard;
  brandSlug: string;
}

export function BrandProductCard({ product, brandSlug }: BrandProductCardProps) {
  const pc = scoreColors(product.score);
  const chips = getTileChips(product);
  const categoryLabel = getProductCategoryLabel(product);
  const isPending = categoryLabel === "Category Pending";

  return (
    <Link href={`/brands/${brandSlug}/${product.slug}`} className="block group">
      <article className="border border-ink-100 hover:border-teal-200 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-teal-900/8 transition-all duration-300 hover:-translate-y-0.5 bg-white h-full flex flex-col">

        {/* Product image */}
        <div className="relative aspect-square bg-ink-50 overflow-hidden">
          <Image
            src={product.image}
            alt={product.productName}
            fill
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Score badge — top right */}
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
                color: pc.ring,
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
          <h3 className="text-xs font-medium text-ink-950 group-hover:text-teal-700 transition-colors leading-snug line-clamp-2 mb-2">
            {product.productName}
          </h3>

          {/* Tile chips: skin type / routine / red flag */}
          {chips.length > 0 && (
            <div className="flex gap-1 mb-2 overflow-hidden">
              {chips.map((chip) => (
                <TileChip key={chip.variant} label={chip.label} variant={chip.variant} />
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-ink-50 mt-auto">
            <span className="font-semibold text-ink-900 tabular-nums text-sm leading-tight">{product.priceRange}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
