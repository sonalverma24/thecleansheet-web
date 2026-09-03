import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, FlaskConical } from "lucide-react";
import { getBrandBySlug, getAllBrandSummaries } from "@/data/brands";
import { BrandProductCard } from "@/components/scorecards/BrandProductCard";
import { scoreToTier, TIER_STYLES } from "@/components/scorecards/pillar-ui";

export function generateStaticParams() {
  return getAllBrandSummaries().map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) return {};
  const tierLabel = TIER_STYLES[scoreToTier(brand.avgScore)].label;
  return {
    title: `${brand.name} Skincare Review · ${tierLabel}`,
    description: `Is ${brand.name} clean beauty? Science-backed reviews for all ${brand.products.length} ${brand.name} products: ingredient safety, regulatory compliance, and formulation analysis.`,
    keywords: [
      `${brand.name} review India`, `is ${brand.name} clean beauty`, `${brand.name} ingredients safe`,
      `${brand.name} products score`, `${brand.name} skincare India`, `${brand.name} ingredient analysis`,
    ],
    alternates: { canonical: `https://thecleansheet.in/brands/${slug}` },
    openGraph: {
      title: `${brand.name} · ${tierLabel}`,
      description: `Science-backed ingredient analysis for all ${brand.name} products (${brand.verdict}).`,
      url: `https://thecleansheet.in/brands/${slug}`,
      type: "website",
      images: [{ url: brand.logo, width: 512, height: 512, alt: `${brand.name} logo` }],
    },
  };
}

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://thecleansheet.in" },
          { "@type": "ListItem", position: 2, name: "Brands", item: "https://thecleansheet.in/brands" },
          { "@type": "ListItem", position: 3, name: brand.name, item: `https://thecleansheet.in/brands/${slug}` },
        ],
      },
      {
        "@type": "Brand",
        name: brand.name,
        url: brand.website,
        logo: brand.logo,
        description: brand.description,
        foundingDate: brand.founded,
        foundingLocation: { "@type": "Place", name: brand.headquarters },
        sameAs: [`https://www.instagram.com/${brand.instagramHandle.replace("@", "")}`],
      },
    ],
  };

  return (
    <div className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Brand Hero ── */}
      <div className="bg-teal-950 pt-10 pb-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-teal-400 mb-6">
            <Link href="/" className="hover:text-teal-200 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/brands" className="hover:text-teal-200 transition-colors">Brands</Link>
            <span>/</span>
            <span className="text-teal-200">{brand.name}</span>
          </nav>

          <div className="max-w-2xl">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center p-2.5 mb-6 shadow-lg">
              <Image src={brand.logo} alt={`${brand.name} logo`} width={64} height={64} className="object-contain" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-medium text-white tracking-tight mb-2">{brand.name}</h1>
            <p className="text-teal-300 text-base mb-5">{brand.tagline}</p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-teal-400 mb-6">
              <span>Founded {brand.founded}</span>
              <span className="w-1 h-1 rounded-full bg-teal-600" />
              <span>{brand.headquarters}</span>
              <span className="w-1 h-1 rounded-full bg-teal-600" />
              <a href={brand.instagramHandle ? `https://instagram.com/${brand.instagramHandle.replace("@", "")}` : "#"}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-teal-200 transition-colors">
                {brand.instagramHandle}
              </a>
            </div>

            <div className="flex flex-wrap gap-3">
              <a href={brand.website} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-sm px-4 py-2 rounded-xl transition-all">
                <ExternalLink size={13} /> Brand website
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Brand description ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="max-w-2xl">
          <div className="text-xs font-medium text-ink-400 uppercase tracking-widest mb-3">About {brand.name}</div>
          <p className="text-ink-600 leading-relaxed">{brand.description}</p>
        </div>

        {/* ── Product grid ── */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-ink-950">Scored Products</h2>
            <span className="text-xs text-ink-400 font-sans">{brand.products.length} products</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
            {brand.products
              .sort((a, b) => b.score - a.score)
              .map((product) => (
                <BrandProductCard key={product.slug} product={product} brandSlug={slug} />
              ))}
          </div>
        </div>

        {/* ── Analyse another product from this brand ── */}
        <div className="mt-12 bg-teal-50 border border-teal-100 rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center flex-shrink-0">
            <FlaskConical size={22} className="text-white" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-medium text-ink-950 mb-1">Don't see a {brand.name} product?</h3>
            <p className="text-ink-500 text-sm">Paste any {brand.name} product URL or ingredient list and get a full scorecard in seconds.</p>
          </div>
          <Link href="/analyzer"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all whitespace-nowrap">
            Analyse a product <ArrowRight size={14} />
          </Link>
        </div>

        {/* ── Back link ── */}
        <div className="mt-10">
          <Link href="/brands" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink-800 transition-colors">
            <ArrowLeft size={14} /> All scored brands
          </Link>
        </div>
      </div>
    </div>
  );
}
