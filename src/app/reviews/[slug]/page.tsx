/* Permanent product page for a repository (live-reviewed) product.
   Renders the STORED review by canonical slug — never re-runs the engine. */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoredReview } from "@/lib/product-review-engine";
import ReviewResult from "@/components/review/ReviewResult";
import { TIER_STYLES } from "@/components/scorecards/pillar-ui";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getStoredReview(slug);
  if (!result || result.type !== "product-review") return {};
  const { review, verdict } = result;
  const tierLabel = TIER_STYLES[verdict.tier].label;
  return {
    title: `${review.productName} Review · ${tierLabel}`,
    description: `${review.brand} ${review.productName}: ${tierLabel}. ${review.verdict?.cleanSheetTakeaway ?? "Every marketing claim checked against real evidence."}`.slice(0, 300),
    alternates: { canonical: `https://thecleansheet.in/reviews/${slug}` },
    openGraph: {
      title: `${review.productName} · ${tierLabel} | The Clean Sheet`,
      description: review.verdict?.cleanSheetTakeaway ?? "",
      images: review.imageUrl ? [{ url: review.imageUrl }] : undefined,
    },
  };
}

export default async function StoredReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getStoredReview(slug);
  if (!result || result.type !== "product-review") notFound();
  return <ReviewResult review={result.review} verdict={result.verdict} />;
}
