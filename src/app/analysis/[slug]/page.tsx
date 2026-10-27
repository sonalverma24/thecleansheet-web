/* Permanent product page for a repository (live-reviewed) product.
   Renders the STORED review by canonical slug in THE one product-page
   format (ProductScorecardView) - never re-runs the engine. */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoredReview } from "@/lib/product-review-engine";
import { getBrandBySlug } from "@/data/brands";
import { cataloguePathFor } from "@/lib/catalogue-dedupe";
import { reviewToScorecard } from "@/lib/review-to-scorecard";
import { runAnalysis } from "@/lib/analysis-engine";
import { ProductScorecardView } from "@/components/scorecards/ProductScorecardView";
import { PillsPage } from "@/components/scorecards/PillsPage";
import { UnratedProductPage } from "@/components/scorecards/UnratedProductPage";
import { unratedInputOf, unratedKindOf } from "@/lib/unrated-kind";
import { ANALYSER_FLAGS, isFlagOn } from "@/lib/analyser-flags";
import { keepOutOfSearch, layoutFor, pillsFor } from "@/lib/pills-for-review";
import { TIER_STYLES, tierToRating } from "@/components/scorecards/pillar-ui";
import { clipDescription } from "@/lib/seo";

export const revalidate = 300;

// Empty on purpose: no review is pre-rendered at build time (the set lives in the
// database and grows), but declaring generateStaticParams turns this route from
// fully dynamic (private, no-store, a Supabase render on EVERY request, including
// every Googlebot hit) into on-demand ISR, so `revalidate` actually applies:
// rendered on first request, then served from cache and refreshed every 5 minutes.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getStoredReview(slug, { strict: true });
  if (!result || result.type !== "product-review") return {};
  const { review, verdict } = result;
  // A nutraceutical or a drug has no review to describe, and stays out of search.
  if (unratedKindOf(unratedInputOf(review))) {
    return { title: `${review.productName} | The Clean Sheet`, robots: { index: false, follow: true } };
  }
  // The pills page (flag on): a rating is a coloured circle and nothing else, so the title, the description and the search listing carry no verdict word,
  // old or new. The page that stays out of search is the one we could not rate (keepOutOfSearch).
  const pills = isFlagOn(ANALYSER_FLAGS.pillsPage) ? pillsFor(review, verdict).model : null;
  const tierLabel = TIER_STYLES[verdict.tier].label;
  return {
    ...(pills && keepOutOfSearch(pills.pill.key) ? { robots: { index: false, follow: true } } : {}),
    title: pills ? `${review.productName} Analysis` : `${review.productName} Analysis · ${tierLabel}`,
    description: clipDescription(`${review.brand} ${review.productName}: ${pills ? "" : `${tierLabel}. `}${review.verdict?.cleanSheetTakeaway ?? "Every marketing claim checked against real evidence."}`),
    alternates: { canonical: `https://thecleansheet.in${cataloguePathFor(review.brand, review.productName) ?? `/analysis/${slug}`}` },
    openGraph: {
      title: pills ? `${review.productName} | The Clean Sheet` : `${review.productName} · ${tierLabel} | The Clean Sheet`,
      description: review.verdict?.cleanSheetTakeaway ?? "",
      images: review.imageUrl ? [{ url: review.imageUrl }] : undefined,
    },
  };
}

export default async function StoredReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getStoredReview(slug, { strict: true });
  if (!result || result.type !== "product-review") notFound();

  // A nutraceutical or a drug: no review, no rating, no structured data. Only the product and a popup saying why.
  const unrated = unratedKindOf(unratedInputOf(result.review));
  if (unrated) {
    return <UnratedProductPage slug={slug} kind={unrated} productName={result.review.productName} brand={result.review.brand ?? ""} category={result.review.category} image={result.review.imageUrl} />;
  }

  // Two flags. ANALYSER_PILLS_PAGE: the new layout AND the five pills (the title, the rating and what is indexed follow the pill). ANALYSER_NEW_LAYOUT: the
  // new layout only, with today's standing in the take card; the title, description, rating and indexing stay exactly today's.
  const pillsOn = isFlagOn(ANALYSER_FLAGS.pillsPage);
  const layoutOn = pillsOn || isFlagOn(ANALYSER_FLAGS.newLayout);
  const { product, brand, brandSlug, model } = pillsOn
    ? pillsFor(result.review, result.verdict)
    : layoutOn
      ? layoutFor(result.review, result.verdict)
      : { ...reviewToScorecard(result.review, result.verdict), model: null };
  // With the pills page the rating is a circle, not a number or a label, so no star rating is published in the structured data (a rating that is not on the
  // page must not be in it). The page without the flag keeps today's rating.
  const rating = pillsOn ? null : tierToRating(result.verdict.tier);

  const url = `https://thecleansheet.in/analysis/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://thecleansheet.in" },
          { "@type": "ListItem", position: 2, name: "Product Analyses", item: "https://thecleansheet.in/brands" },
          { "@type": "ListItem", position: 3, name: product.productName, item: url },
        ],
      },
      {
        "@type": "Product",
        name: product.productName,
        brand: { "@type": "Brand", name: brand.name },
        image: product.image,
        description: product.summary,
        // Licensed drugs carry no cosmetic rating, so they emit no Review node.
        ...(rating
          ? {
              review: {
                "@type": "Review",
                author: { "@type": "Organization", name: "The Clean Sheet" },
                reviewBody: product.summary,
                datePublished: product.analyzedAt,
                reviewRating: rating,
              },
            }
          : {}),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {model ? (
        <PillsPage product={product} brand={brand} model={model} />
      ) : (
        <ProductScorecardView product={product} brand={brand} brandSlug={brandSlug} brandPageExists={!!getBrandBySlug(brandSlug)} analysis={runAnalysis(result.review)} />
      )}
    </>
  );
}
