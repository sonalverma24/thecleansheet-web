import { notFound } from "next/navigation";
import { getBrandBySlug, getProductBySlug, getAllBrandSummaries } from "@/data/brands";
import type { Brand, ProductScorecard } from "@/data/brands";
import { resolveTier, TIER_STYLES, tierToRating } from "@/components/scorecards/pillar-ui";
import { ProductScorecardView } from "@/components/scorecards/ProductScorecardView";

// ─────────────────────────────────────────────────────────────────────────────
// FAQ builder — phrased as the questions people actually ask an AI assistant
// ("is <product> clean?", "do the claims hold up?"). Answers are drawn from the
// same review fields the page renders, so the visible FAQ and the FAQPage
// schema always agree. Returns [] entries filtered of anything we can't answer.
// ─────────────────────────────────────────────────────────────────────────────
function buildProductFaqs(product: ProductScorecard, brand: Brand): { q: string; a: string }[] {
  const tier = resolveTier(product);
  const label = TIER_STYLES[tier].label;
  const name = product.productName;

  const approvedLead: Record<typeof tier, string> = {
    "approved": `Yes. ${name} is Clean Sheet Recommended — it passes our independent checks on ingredient safety, regulatory compliance and claim substantiation.`,
    "mostly-clean": `${name} is in Good Standing with The Clean Sheet: broadly sound, with only minor gaps such as a claim that is plausible but not publicly proven.`,
    "can-do-better": `Not quite. ${name} is rated "Room to Improve" by The Clean Sheet — we found real concerns a buyer should weigh, such as unproven claims or transparency gaps.`,
    "not-recommended": `No. ${name} is Not Recommended by The Clean Sheet, based on issues with safety, regulatory compliance or claim honesty.`,
  } as const;

  const faqs: ({ q: string; a: string } | null)[] = [
    {
      q: `Is ${name} Clean Sheet Recommended?`,
      a: `${approvedLead[tier]} ${product.summary}`.trim(),
    },
    product.cleanSheetNote
      ? {
          q: `What does The Clean Sheet say about ${name}?`,
          a: `Our verdict is "${label}". ${product.cleanSheetNote}`,
        }
      : null,
  ];

  // Claims-check summary — how many of the brand's on-pack claims stood up.
  if (product.claimsCheck?.length) {
    const total = product.claimsCheck.length;
    const supported = product.claimsCheck.filter((c) => c.decision === "Publicly supported").length;
    const needsProof = product.claimsCheck.filter((c) => c.decision === "Needs proof").length;
    const notSupported = product.claimsCheck.filter((c) => c.decision === "Not publicly supported").length;
    const parts = [`${supported} of ${total} ${supported === 1 ? "is" : "are"} publicly supported`];
    if (needsProof) parts.push(`${needsProof} ${needsProof === 1 ? "needs" : "need"} more proof`);
    if (notSupported) parts.push(`${notSupported} ${notSupported === 1 ? "is" : "are"} not publicly supported`);
    const example = product.claimsCheck[0];
    faqs.push({
      q: `Do ${brand.name}'s claims about ${name} hold up?`,
      a: `We checked ${total} on-pack claim${total === 1 ? "" : "s"}: ${parts.join(", ")}. For example, "${example.claim}" — ${example.decision.toLowerCase()}.`,
    });
  }

  // Fragrance status — a top question for sensitive / acne-prone skin.
  if (product.fragranceStatus && product.fragranceStatus !== "unknown") {
    const fragranceAnswer: Record<string, string> = {
      "free": `Yes. Our review of the published INCI list found no synthetic fragrance (Parfum) or scent-use essential oils in ${name}.`,
      "synthetic": `No. ${name} contains synthetic fragrance (Parfum) in its ingredient list — worth noting if you have sensitive or fragrance-reactive skin.`,
      "essential-oil": `${name} is scented with essential oils rather than synthetic fragrance. Essential oils can still trigger reactions in sensitive skin, so patch-test first.`,
      "both": `${name} contains both synthetic fragrance and essential oils. If you are fragrance-sensitive, patch-test before regular use.`,
    };
    const a = fragranceAnswer[product.fragranceStatus];
    if (a) faqs.push({ q: `Is ${name} fragrance-free?`, a });
  }

  if (product.priceRange) {
    faqs.push({
      q: `How much does ${name} cost in India?`,
      a: `${name} retails for ${product.priceRange} in India${product.concern ? `. It targets ${product.concern.toLowerCase()}` : ""}.`,
    });
  }

  return faqs.filter(Boolean) as { q: string; a: string }[];
}

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

  const tierLabel = TIER_STYLES[resolveTier(product)].label;
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

  const reviewRating = tierToRating(resolveTier(product));
  const faqs = buildProductFaqs(product, brand);

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
          reviewRating,
        },
      },
      ...(faqs.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: faqs.map(({ q, a }) => ({
                "@type": "Question",
                name: q,
                acceptedAnswer: { "@type": "Answer", text: a },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductScorecardView product={product} brand={brand} brandSlug={brandSlug} relatedProducts={relatedProducts} />

      {faqs.length > 0 && (
        <section className="bg-white pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="border border-ink-100 rounded-2xl p-6">
              <h2 className="text-lg font-medium text-ink-900 mb-5">Frequently Asked Questions</h2>
              <div className="space-y-5">
                {faqs.map(({ q, a }, i) => (
                  <div key={i} className="border-b border-ink-50 last:border-0 pb-5 last:pb-0">
                    <h3 className="font-medium text-ink-900 mb-2">{q}</h3>
                    <p className="text-ink-600 leading-relaxed text-sm">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
