"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Minus, X } from "lucide-react";
import type { ProductScorecard } from "@/data/brands/types";
import { resolveTier } from "@/components/scorecards/pillar-ui";
import { MARKER_OF_TIER } from "@/components/scorecards/pill-palette";
import { RatingDot } from "@/components/scorecards/RatingDot";
import { getDisplayPrice } from "@/lib/product-card-helpers";
import { productGroup } from "@/lib/registry-filters";
import { seedImageFor, shelfNote } from "@/lib/home-shelf";
import { track } from "@/lib/analytics";

/* One product in the /brands marketplace. Same card as the home shelf: a clean pack
   shot on white, brand, name, the real standing, one line from the analysis itself.
   The whole card opens the analysis (the title link is stretched over it); the compare
   button sits above that link so it does not navigate. */

export function productId(p: Pick<ProductScorecard, "brandSlug" | "slug">): string {
  return `${p.brandSlug}/${p.slug}`;
}

export function productHref(p: ProductScorecard): string {
  return p.freshReview ? `/analysis/${p.slug}` : `/brands/${p.brandSlug}/${p.slug}`;
}

/* The ticks on a card (pills page only). Each is a small chip: a tick, a cross or a dash in a round badge, then the words. The row is one line tall on a
   phone and two on a larger screen, and a chip that does not fit on those lines is not drawn at all (the lines below the box are cut off whole, never
   through the middle of a chip), so the card keeps its size however many ticks the product has. */
const GLANCE_TONE = {
  yes: { bg: "#f0f6f6", border: "#cae1df", dot: "#1d6761", Icon: Check, sr: " (yes)" },
  no: { bg: "#fcf1ef", border: "#f0cfcb", dot: "#b83f37", Icon: X, sr: " (no)" },
  unknown: { bg: "#f1ece3", border: "#e8e1d6", dot: "#6f6a66", Icon: Minus, sr: " (not known)" },
} as const;

/** On a card, "Pregnancy ingredient flags: Homosalate and Benzophenone-3" reads as "Pregnancy ingredient flags": the names would be cut off mid-word, and the page lists them. */
export const cardGlanceText = (label: string): string => label.replace(/^(Pregnancy (?:caution|ingredient flags?)): .+$/, "$1");

function GlanceRow({ items }: { items: NonNullable<ProductScorecard["glance"]> }) {
  return (
    <ul aria-label="At a glance" className="flex flex-wrap content-start gap-x-1 gap-y-1 overflow-hidden h-[22px] md:h-[48px]">
      {items.map((g) => {
        const t = GLANCE_TONE[g.state];
        return (
          <li
            key={g.label}
            title={g.label}
            className="inline-flex items-center gap-1 h-[22px] max-w-full rounded-full border pl-[3px] pr-2 text-[10.5px] md:text-[11px] font-medium leading-none text-[#282828]"
            style={{ background: t.bg, borderColor: t.border }}
          >
            <span aria-hidden className="flex-none inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-white" style={{ background: t.dot }}>
              <t.Icon size={9} strokeWidth={3.5} />
            </span>
            <span className="truncate">{cardGlanceText(g.label)}</span>
            <span className="sr-only">{t.sr}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function MarketCard({
  product,
  comparing,
  compareBlock,
  onCompare,
}: {
  product: ProductScorecard;
  comparing: boolean;
  /** Why this product cannot join the comparison now (another type is being compared, the list is full, or its type is not filed), or null. */
  compareBlock: string | null;
  onCompare: (id: string) => void;
}) {
  // The rating is one circle: green, yellow, red, or grey (not rated). A card of a stored review (the pills page) shows the circle its page shows; a catalogue
  // product with no stored review shows the circle of its standing. No label either way.
  const marker = product.pill ? product.pill.marker : MARKER_OF_TIER[resolveTier({ reviewTier: product.reviewTier, score: product.score })];
  const glance = product.pill && product.glance?.length ? product.glance : null;
  const image = seedImageFor(product) ?? product.image ?? null;
  const category = productGroup(product);
  // Some catalogue prices are free text ("Rs.150–340 (for 100ml)"): show the rupee sign, not "Rs.".
  const price = getDisplayPrice(product).replace(/Rs\.?\s*/gi, "₹");
  const hasPrice = price !== "Price unavailable";
  const id = productId(product);
  const blocked = !comparing && !!compareBlock;

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
        <span className="self-start py-0.5 pl-0.5"><RatingDot marker={marker} size={14} /></span>
        {glance && <GlanceRow items={glance} />}
        <p className={`hidden md:block text-[13px] text-[#4a4a4a] leading-[1.5] flex-1 ${glance ? "line-clamp-2" : "line-clamp-3"}`}>{shelfNote(product.summary)}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5 border-t border-[#e5dfd6]">
          <span title={hasPrice ? price : undefined} className={`min-w-0 truncate text-[13px] tabular-nums ${hasPrice ? "font-bold text-[#282828]" : "text-[#b0a8a4]"}`}>{hasPrice ? price : "Price n/a"}</span>
          <button
            type="button"
            aria-pressed={comparing}
            // Not `disabled`: a refused click still has to reach the page, which says why in the tray.
            aria-disabled={blocked || undefined}
            title={blocked ? (compareBlock ?? undefined) : comparing ? "Remove from comparison" : "Add to comparison"}
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
            {blocked && <span className="sr-only">. {compareBlock}</span>}
          </button>
        </div>
      </div>
    </article>
  );
}
