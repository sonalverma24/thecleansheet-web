/* Local preview of the LIVE product page (ProductScorecardView) with the new
   category + safety screen + flags and no scores. Renders from fixtures so it
   works on localhost with no API keys / DB.
   /analysis-preview  (or ?p=sunscreen for the adverse-path demo). */

import Link from "next/link";
import { notFound } from "next/navigation";
import { runAnalysis } from "@/lib/analysis-engine";
import { deriveVerdict } from "@/lib/product-review-engine";
import { reviewToScorecard } from "@/lib/review-to-scorecard";
import { ProductScorecardView } from "@/components/scorecards/ProductScorecardView";
import { SAMPLE_MINIMALIST_B5, SAMPLE_EXAMPLE_SUNSCREEN } from "@/data/analysis/sample-reviews";

export const dynamic = "force-dynamic";

export default async function AnalysisPreview({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  // Internal design preview with demo fixtures - never exposed in production.
  if (process.env.NODE_ENV === "production") notFound();
  const { p } = await searchParams;
  const review = p === "sunscreen" ? SAMPLE_EXAMPLE_SUNSCREEN : SAMPLE_MINIMALIST_B5;
  const verdict = deriveVerdict(review);
  const { product, brand, brandSlug } = reviewToScorecard(review, verdict);
  const analysis = runAnalysis(review);

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-6 flex gap-2">
        <Link href="/analysis-preview" className="text-[12px] px-3 py-1.5 rounded-full" style={{ border: "1px solid #efe9e0", color: p === "sunscreen" ? "#6b6764" : "#248179", background: p === "sunscreen" ? "#fff" : "rgba(36,129,121,0.08)" }}>
          Minimalist B5 (clean)
        </Link>
        <Link href="/analysis-preview?p=sunscreen" className="text-[12px] px-3 py-1.5 rounded-full" style={{ border: "1px solid #efe9e0", color: p === "sunscreen" ? "#248179" : "#6b6764", background: p === "sunscreen" ? "rgba(36,129,121,0.08)" : "#fff" }}>
          Example Sunscreen (adverse path)
        </Link>
      </div>
      <ProductScorecardView product={product} brand={brand} brandSlug={brandSlug} analysis={analysis} />
    </div>
  );
}
