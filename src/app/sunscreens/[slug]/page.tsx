import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSunscreenBySlug, getAllSunscreenSlugs } from "@/data/sunscreens";
import { EvidenceChecksheet } from "@/components/sunscreens/EvidenceChecksheet";
import { clipDescription } from "@/lib/seo";

export function generateStaticParams() {
  return getAllSunscreenSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const record = getSunscreenBySlug(slug);
  if (!record) return {};

  const title = `${record.brand} ${record.productName} SPF Evidence Record`;
  const description = clipDescription(
    `${record.tcsStatus}. ${record.statusSummary}`
  );

  return {
    title,
    description,
    keywords: [
      `${record.brand} ${record.productName} SPF test`,
      `${record.productName} evidence`,
      "sunscreen SPF proof India",
      "is this sunscreen SPF real",
    ],
    alternates: { canonical: `https://thecleansheet.in/sunscreens/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://thecleansheet.in/sunscreens/${slug}`,
      type: "article",
      images: [{ url: record.image, width: 800, height: 800, alt: record.productName }],
    },
  };
}

export default async function SunscreenEvidencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const record = getSunscreenBySlug(slug);
  if (!record) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Product",
      name: `${record.brand} ${record.productName}`,
      image: record.image,
      brand: { "@type": "Brand", name: record.brand },
    },
    author: { "@type": "Organization", name: "The Clean Sheet" },
    reviewBody: record.statusSummary,
    datePublished: record.dateCreated,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <EvidenceChecksheet record={record} />
    </>
  );
}
