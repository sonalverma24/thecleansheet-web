/* Local preview of the listing cards (the /brands grid) with the pills page on and off, side by side, from fixtures: no database, no keys.
   /analysis-preview/cards. Internal design preview, never exposed in production. */

import { notFound } from "next/navigation";
import { ALL_BRANDS } from "@/data/brands";
import { SAMPLE_EXAMPLE_MEDICINAL, SAMPLE_EXAMPLE_MINERAL_SUNSCREEN, SAMPLE_EXAMPLE_PROHIBITED, SAMPLE_EXAMPLE_SUNSCREEN, SAMPLE_MINIMALIST_B5 } from "@/data/analysis/sample-reviews";
import type { ProductScorecard } from "@/data/brands/types";
import { CardGrid } from "./CardGrid";
import { listingPill } from "@/lib/listing-pill";
import { deriveVerdict } from "@/lib/product-review-engine";
import { reviewToScorecard } from "@/lib/review-to-scorecard";

export const dynamic = "force-dynamic";

const REVIEWS = [SAMPLE_MINIMALIST_B5, SAMPLE_EXAMPLE_SUNSCREEN, SAMPLE_EXAMPLE_MINERAL_SUNSCREEN, SAMPLE_EXAMPLE_PROHIBITED, SAMPLE_EXAMPLE_MEDICINAL];

export default function CardsPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const tiles = REVIEWS.map((review) => {
    const verdict = deriveVerdict(review);
    const { product } = reviewToScorecard(review, verdict);
    const tile: ProductScorecard = { ...product, freshReview: true, reviewTier: verdict.tier };
    return { today: tile, pills: { ...tile, ...(listingPill(review, verdict) ?? {}) } as ProductScorecard };
  });
  const catalogue = ALL_BRANDS[0]?.products[0];
  return (
    <div className="max-w-[920px] mx-auto px-4 py-8 space-y-10">
      <section>
        <h2 className="text-sm text-[#6b6764] mb-3">With the pills page on, then a catalogue product (it has no stored review, so it keeps its standing)</h2>
        <CardGrid products={[...tiles.map((t) => t.pills), ...(catalogue ? [catalogue] : [])]} />
      </section>
      <section>
        <h2 className="text-sm text-[#6b6764] mb-3">Today (flag off)</h2>
        <CardGrid products={tiles.map((t) => t.today)} />
      </section>
    </div>
  );
}
