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
import { SAMPLE_MINIMALIST_B5, SAMPLE_EXAMPLE_SUNSCREEN, SAMPLE_EXAMPLE_MINERAL_SUNSCREEN, SAMPLE_EXAMPLE_PROHIBITED, SAMPLE_EXAMPLE_MEDICINAL } from "@/data/analysis/sample-reviews";
import { PillsPage } from "@/components/scorecards/PillsPage";
import { layoutFor, pillsFor } from "@/lib/pills-for-review";

export const dynamic = "force-dynamic";

export default async function AnalysisPreview({ searchParams }: { searchParams: Promise<{ p?: string; pills?: string; layout?: string }> }) {
  // Internal design preview with demo fixtures - never exposed in production.
  if (process.env.NODE_ENV === "production") notFound();
  const { p, pills, layout } = await searchParams;
  const review = p === "mineral" ? SAMPLE_EXAMPLE_MINERAL_SUNSCREEN : p === "prohibited" ? SAMPLE_EXAMPLE_PROHIBITED : p === "medicinal" ? SAMPLE_EXAMPLE_MEDICINAL : p === "sunscreen" ? SAMPLE_EXAMPLE_SUNSCREEN : SAMPLE_MINIMALIST_B5;
  const verdict = deriveVerdict(review);
  const { product, brand, brandSlug } = reviewToScorecard(review, verdict);
  const analysis = runAnalysis(review);
  const link = (q: string, label: string, active: boolean) => (
    <Link href={q} className="text-[12px] px-3 py-1.5 rounded-full" style={{ border: "1px solid #efe9e0", color: active ? "#248179" : "#6b6764", background: active ? "rgba(36,129,121,0.08)" : "#fff" }}>{label}</Link>
  );
  // ?pills=1 shows the 13-block pills page for any fixture, whatever the flag says (preview only; production 404s above).
  const usePills = pills === "1";
  // ?layout=1 shows the new layout with today's standing (ANALYSER_NEW_LAYOUT), for any fixture.
  const useLayout = !usePills && layout === "1";
  const suffix = usePills ? "&pills=1" : useLayout ? "&layout=1" : "";

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-6 flex flex-wrap gap-2">
        {link(`/analysis-preview${usePills ? "?pills=1" : useLayout ? "?layout=1" : ""}`, "Minimalist B5 (clean)", !p)}
        {link(`/analysis-preview?p=sunscreen${suffix}`, "Example Sunscreen (adverse path)", p === "sunscreen")}
        {link(`/analysis-preview?p=mineral${suffix}`, "Example Mineral Sunscreen (Good choice)", p === "mineral")}
        {link(`/analysis-preview?p=prohibited${suffix}`, "Example Cream (Look elsewhere)", p === "prohibited")}
        {link(`/analysis-preview?p=medicinal${suffix}`, "Example Shampoo (Medicinal product)", p === "medicinal")}
        <span className="w-px bg-[#efe9e0] mx-1" />
        {link(`/analysis-preview${p ? `?p=${p}` : ""}`, "Today's page", !usePills && !useLayout)}
        {link(`/analysis-preview?${p ? `p=${p}&` : ""}layout=1`, "New layout, today's standing", useLayout)}
        {link(`/analysis-preview?${p ? `p=${p}&` : ""}pills=1`, "Pills page", usePills)}
      </div>
      {usePills || useLayout ? (
        <PillsPage product={product} brand={brand} model={(usePills ? pillsFor(review, verdict) : layoutFor(review, verdict)).model} />
      ) : (
        <ProductScorecardView product={product} brand={brand} brandSlug={brandSlug} analysis={analysis} />
      )}
    </div>
  );
}
