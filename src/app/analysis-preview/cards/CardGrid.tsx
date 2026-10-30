"use client";

/* The /brands grid's classes and cards, with the compare button doing nothing: a preview, not the marketplace. */
import type { ProductScorecard } from "@/data/brands/types";
import MarketCard from "@/components/registry/MarketCard";

export function CardGrid({ products }: { products: ProductScorecard[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
      {products.map((p) => <MarketCard key={p.slug} product={p} comparing={false} compareBlock={null} onCompare={() => {}} />)}
    </div>
  );
}
