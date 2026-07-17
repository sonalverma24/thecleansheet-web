import { notFound } from "next/navigation";
import { getBrandBySlug, getProductBySlug, getAllBrandSummaries } from "@/data/brands";
import { scoreToTier, TIER_STYLES } from "@/components/scorecards/pillar-ui";
import { ProductScorecardView } from "@/components/scorecards/ProductScorecardView";

// ─────────────────────────────────────────────────────────────────────────────
// Static params + metadata
// ─────────────────────────────────────────────────────────────────────────────

export function generateStaticParams() {
  const params: { brand: string; product: string }[] = [];
  getAllBrandSummaries().forEach((b) => {
    const brand = getBrandBySlug(b.slug);
    brand?.products.forEach((p) => {
      params.push({ brand: b.slug, product: p.slug });
    });
  });
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; product: string }>;
}) {
  const { brand: brandSlug, product: productSlug } = await params;
  const product = getProductBySlug(brandSlug, productSlug);
  const brand = getBrandBySlug(brandSlug);
  if (!product || !brand) return {};

  const tierLabel = TIER_STYLES[scoreToTier(product.score)].label;
  return {
    title: `${product.productName} Review · ${tierLabel}`,
    description: `Is ${product.productName} safe? Science-backed ingredient analysis: ${tierLabel}. Full INCI review, regulatory compliance, and India-specific skin context. ${product.concern}.`,
    keywords: [
      `${product.productName} review`,
      `${product.productName} India`,
      `is ${product.productName} safe`,
      `${brand.name} ingredients safe`,
      `${product.productName} ingredients`,
      "clean beauty India",
      "ingredient checker India",
    ],
    alternates: {
      canonical: `https://thecleansheet.in/brands/${brandSlug}/${productSlug}`,
    },
    openGraph: {
      title: `${product.productName} · ${tierLabel}`,
      description: `${tierLabel}. ${product.summary.slice(0, 150)}...`,
      url: `https://thecleansheet.in/brands/${brandSlug}/${productSlug}`,
      type: "article",
      images: [{ url: product.image, width: 800, height: 800, alt: product.productName }],
    },
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// Page — renders the shared scorecard view (THE one review format)
// ─────────────────────────────────────────────────────────────────────────────

export default async function ProductPage({
  params,
}: {
  params: Promise<{ brand: string; product: string }>;
}) {
  const { brand: brandSlug, product: productSlug } = await params;
  const brand = getBrandBySlug(brandSlug);
  const product = getProductBySlug(brandSlug, productSlug);
  if (!brand || !product) notFound();

  const relatedProducts = brand.products.filter((p) => p.slug !== productSlug).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://thecleansheet.in" },
          { "@type": "ListItem", position: 2, name: "Brands", item: "https://thecleansheet.in/brands" },
          { "@type": "ListItem", position: 3, name: brand.name, item: `https://thecleansheet.in/brands/${brandSlug}` },
          { "@type": "ListItem", position: 4, name: product.productName, item: `https://thecleansheet.in/brands/${brandSlug}/${productSlug}` },
        ],
      },
      {
        "@type": "Product",
        name: product.productName,
        brand: { "@type": "Brand", name: brand.name },
        image: product.image,
        description: product.summary,
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "INR",
          lowPrice: product.priceRange.split("-")[0].replace(/[^0-9]/g, ""),
        },
        review: {
          "@type": "Review",
          author: { "@type": "Organization", name: "The Clean Sheet" },
          reviewBody: product.summary,
          datePublished: product.analyzedAt,
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductScorecardView product={product} brand={brand} brandSlug={brandSlug} relatedProducts={relatedProducts} />
    </>
  );
}
