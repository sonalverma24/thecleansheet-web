"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductScorecard } from "@/data/brands/types";
import { TIER_STYLES, resolveTier } from "@/components/scorecards/pillar-ui";
import { getDisplayPrice } from "@/lib/product-card-helpers";
import { productGroup } from "@/lib/registry-filters";
import { seedImageFor, shelfNote } from "@/lib/home-shelf";
import { track } from "@/lib/analytics";

/* One product in the /brands marketplace. Same card as the home shelf: a clean pack
   shot on white, brand, name, the real standing, one line from the review itself.
   The whole card opens the review (the title link is stretched over it); the compare
   button sits above that link so it does not navigate. */

export const MAX_COMPARE = 4;

export function productId(p: Pick<ProductScorecard, "brandSlug" | "slug">): string {
  return `${p.brandSlug}/${p.slug}`;
}

export function productHref(p: ProductScorecard): string {
  return p.freshReview ? `/reviews/${p.slug}` : `/brands/${p.brandSlug}/${p.slug}`;
}

export default function MarketCard({
  product,
  comparing,
  compareFull,
  onCompare,
}: {
  product: ProductScorecard;
  comparing: boolean;
  compareFull: boolean;
  onCompare: (id: string) => void;
}) {
  const style = TIER_STYLES[resolveTier({ reviewTier: product.reviewTier, score: product.score })];
  const image = seedImageFor(product) ?? product.image ?? null;
  const category = productGroup(product);
  // Some catalogue prices are free text ("Rs.150–340 (for 100ml)"): show the rupee sign, not "Rs.".
  const price = getDisplayPrice(product).replace(/Rs\.?\s*/gi, "₹");
  const hasPrice = price !== "Price unavailable";
  const id = productId(product);
  const blocked = !comparing && compareFull;

  return (
    <article className="group relative flex flex-col bg-white border border-[#e5dfd6] rounded-[14px] overflow-hidden transition-[box-shadow,transform] duration-[240ms] md:hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(40,40,40,0.08),0_18px_40px_rgba(40,40,40,0.10)]">
      <div className="relative aspect-square border-b border-[#e5dfd6] bg-white">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 260px, (min-width: 768px) 30vw, 46vw"
            className="object-contain p-3"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[11px] tracking-[0.12em] text-[#b0a8a4] uppercase">No photo</span>
        )}
        {category !== "Other" && (
          <span className="absolute top-2.5 left-2.5 max-w-[calc(100%-56px)] truncate text-[9px] md:text-[10px] tracking-[0.12em] text-[#4a4a4a] border border-[#e5dfd6] rounded-[4px] px-1.5 md:px-[7px] py-[3px] bg-white">
            {category}
          </span>
        )}
        {product.newArrival && (
          <span className="absolute top-2.5 right-2.5 text-[9px] md:text-[10px] font-bold tracking-[0.1em] uppercase rounded-full px-2 py-[3px] bg-[#d2ff34] text-[#282828]">
            New
          </span>
        )}
      </div>

      <div className="p-3 md:p-4 flex flex-col gap-1.5 md:gap-2 flex-1">
        <span className="text-[10px] md:text-[11px] font-bold tracking-[0.18em] text-[#4a4a4a] uppercase truncate">{product.brand}</span>
        <h3 className="font-sans font-bold text-[14px] md:text-[15px] leading-[1.3] text-[#282828] line-clamp-2">
          <Link
            href={productHref(product)}
            onClick={() => track("scorecard_opened", { slug: product.slug })}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[#248179] focus-visible:after:rounded-[14px]"
          >
            {product.productName}
          </Link>
        </h3>
        <span
          className="self-start text-[9px] md:text-[10px] font-bold tracking-[0.1em] px-[9px] md:px-2.5 py-1 rounded-full border uppercase"
          style={{ background: style.bg, color: style.fg, borderColor: style.border }}
        >
          {style.label}
        </span>
        <p className="hidden md:block text-[13px] text-[#4a4a4a] leading-[1.5] flex-1 line-clamp-3">{shelfNote(product.summary)}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5 border-t border-[#e5dfd6]">
          <span title={hasPrice ? price : undefined} className={`min-w-0 truncate text-[13px] tabular-nums ${hasPrice ? "font-bold text-[#282828]" : "text-[#b0a8a4]"}`}>{hasPrice ? price : "Price n/a"}</span>
          <button
            type="button"
            aria-pressed={comparing}
            disabled={blocked}
            title={blocked ? `You can compare up to ${MAX_COMPARE} products` : comparing ? "Remove from comparison" : "Add to comparison"}
            onClick={() => onCompare(id)}
            className={`relative z-10 flex-none inline-flex items-center gap-1 h-8 rounded-lg border px-2.5 text-[12px] font-bold whitespace-nowrap transition-colors ${
              comparing
                ? "bg-[#248179] border-[#248179] text-white"
                : blocked
                  ? "border-[#e5dfd6] text-[#d0c8c4] cursor-not-allowed"
                  : "border-[#e5dfd6] text-[#282828] hover:border-[#248179] hover:text-[#248179]"
            }`}
          >
            <span aria-hidden className="md:hidden text-[16px] leading-none">{comparing ? "✓" : "+"}</span>
            <span className="hidden md:inline">{comparing ? "✓ Added" : "+ Compare"}</span>
            <span className="sr-only md:hidden">{comparing ? "Remove from comparison" : "Add to comparison"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
