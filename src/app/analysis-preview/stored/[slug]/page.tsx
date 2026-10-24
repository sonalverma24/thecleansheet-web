/* Local preview: one stored product as the pills page draws it (default) or as the live page draws it today (?view=today). Internal, never exposed in production. */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getBrandBySlug } from "@/data/brands";
import { runAnalysis } from "@/lib/analysis-engine";
import { deriveVerdict } from "@/lib/product-review-engine";
import { reviewToScorecard } from "@/lib/review-to-scorecard";
import { pillsFor } from "@/lib/pills-for-review";
import { PillsPage } from "@/components/scorecards/PillsPage";
import { ProductScorecardView } from "@/components/scorecards/ProductScorecardView";
import { storedReviews } from "../_data";

export const dynamic = "force-dynamic";

export default async function StoredPreviewPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ view?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { slug } = await params;
  const { view } = await searchParams;
  const review = (await storedReviews([slug])).get(slug);
  if (!review) notFound();
  const verdict = deriveVerdict(review);
  const today = view === "today";
  const bar = (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-10 pt-4 flex flex-wrap items-center gap-2 text-[12.5px]">
      <Link href="/analysis-preview/stored" className="underline underline-offset-4 text-[#55504d]">All ten</Link>
      <span className="text-[#c9c2b8]">·</span>
      <Link href={`/analysis-preview/stored/${slug}`} className="px-3 py-1 rounded-full border" style={{ borderColor: today ? "#e8e1d6" : "#2f8a52", color: today ? "#55504d" : "#256b3e" }}>New (decision core)</Link>
      <Link href={`/analysis-preview/stored/${slug}?view=today`} className="px-3 py-1 rounded-full border" style={{ borderColor: today ? "#2f8a52" : "#e8e1d6", color: today ? "#256b3e" : "#55504d" }}>Today&apos;s page</Link>
    </div>
  );
  if (today) {
    const { product, brand, brandSlug } = reviewToScorecard(review, verdict);
    return <>{bar}<ProductScorecardView product={product} brand={brand} brandSlug={brandSlug} brandPageExists={!!getBrandBySlug(brandSlug)} analysis={runAnalysis(review)} /></>;
  }
  const { product, brand, model } = pillsFor(review, verdict);
  return <>{bar}<PillsPage product={product} brand={brand} model={model} /></>;
}
