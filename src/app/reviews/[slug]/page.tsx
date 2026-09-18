/* Permanent product page for a repository (live-reviewed) product.
   Renders the STORED review by canonical slug in THE one product-page
   format (ProductScorecardView) - never re-runs the engine. */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoredReview } from "@/lib/product-review-engine";
import { reviewToScorecard } from "@/lib/review-to-scorecard";
import { runAnalysis } from "@/lib/analysis-engine";
import { ProductScorecardView } from "@/components/scorecards/ProductScorecardView";
import { TIER_STYLES, tierToRating } from "@/components/scorecards/pillar-ui";

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

  const { product, brand, brandSlug } = reviewToScorecard(result.review, result.verdict);

  const url = `https://thecleansheet.in/reviews/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://thecleansheet.in" },
          { "@type": "ListItem", position: 2, name: "Reviews", item: "https://thecleansheet.in/reviews" },
          { "@type": "ListItem", position: 3, name: product.productName, item: url },
        ],
      },
      {
        "@type": "Product",
        name: product.productName,
        brand: { "@type": "Brand", name: brand.name },
        image: product.image,
        description: product.summary,
        review: {
          "@type": "Review",
          author: { "@type": "Organization", name: "The Clean Sheet" },
          reviewBody: product.summary,
          datePublished: product.analyzedAt,
          reviewRating: tierToRating(result.verdict.tier),
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductScorecardView product={product} brand={brand} brandSlug={brandSlug} analysis={runAnalysis(result.review)} />
    </>
  );
}
