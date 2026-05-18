import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, FlaskConical } from "lucide-react";
import { getBrandBySlug, getAllBrandSummaries, scoreColors } from "@/data/brands";

export function generateStaticParams() {
  return getAllBrandSummaries().map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) return {};
  return {
    title: `${brand.name} Skincare Review — Clean Sheet Score ${brand.avgScore}/100`,
    description: `Is ${brand.name} clean beauty? See science-backed scores for all ${brand.products.length} ${brand.name} products — ingredient safety, regulatory compliance, and formulation analysis. Average score: ${brand.avgScore}/100.`,
    keywords: [
      `${brand.name} review India`, `is ${brand.name} clean beauty`, `${brand.name} ingredients safe`,
      `${brand.name} products score`, `${brand.name} skincare India`, `${brand.name} ingredient analysis`,
    ],
    alternates: { canonical: `https://thecleansheet.in/brands/${slug}` },
    openGraph: {
      title: `${brand.name} — Clean Sheet Score ${brand.avgScore}/100`,
      description: `Science-backed ingredient analysis for all ${brand.name} products. Average score: ${brand.avgScore}/100 (${brand.verdict}).`,
      url: `https://thecleansheet.in/brands/${slug}`,
      type: "website",
      images: [{ url: brand.logo, width: 512, height: 512, alt: `${brand.name} logo` }],
    },
  };
}

function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const c = scoreColors(score);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={7} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.ring} strokeWidth={7}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff" fontFamily="serif">
        {score}
      </text>
    </svg>
  );
}

function ProductScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const c = scoreColors(score);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.ring} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1e293b" fontFamily="serif">
        {score}
      </text>
    </svg>
  );
}

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) notFound();

  const c = scoreColors(brand.avgScore);
  const highestScore = Math.max(...brand.products.map((p) => p.score));
  const highestProduct = brand.products.find((p) => p.score === highestScore);

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
        sameAs: [`https://www.instagram.com/${brand.instagramHandle.replace("@", "")}`, brand.nykaaUrl],
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

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
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
                <a href={brand.nykaaUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-sm px-4 py-2 rounded-xl transition-all">
                  <ExternalLink size={13} /> Buy on Nykaa
                </a>
              </div>
            </div>

            {/* Right — score card */}
            <div className="bg-white/8 border border-white/12 rounded-3xl p-7 backdrop-blur-sm">
              <div className="flex items-center gap-5 mb-6">
                <ScoreRing score={brand.avgScore} size={80} />
                <div>
                  <div className="text-white/50 text-xs uppercase tracking-widest mb-1">Avg. Clean Sheet Score</div>
                  <div className="text-3xl font-medium text-white">{brand.avgScore}<span className="text-white/40 text-lg">/100</span></div>
                  <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border mt-1.5 ${c.bg} ${c.text} ${c.border}`}>
                    {brand.verdict}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Products scored", value: brand.products.length },
                  { label: "Highest score",   value: highestScore },
                  { label: "Excellent rated", value: brand.products.filter((p) => p.score >= 90).length },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/6 rounded-xl p-3">
                    <div className="text-xl font-medium text-white">{value}</div>
                    <div className="text-teal-400/70 text-[10px] mt-0.5 leading-tight">{label}</div>
                  </div>
                ))}
              </div>
              {highestProduct && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Top scorer</div>
                  <Link href={`/brands/${slug}/${highestProduct.slug}`}
                    className="text-teal-300 hover:text-teal-100 text-sm font-medium transition-colors line-clamp-1">
                    {highestProduct.productName} ({highestScore}/100) →
                  </Link>
                </div>
              )}
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
            <span className="text-xs text-ink-400 font-mono">{brand.products.length} products</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {brand.products
              .sort((a, b) => b.score - a.score)
              .map((product) => {
                const pc = scoreColors(product.score);
                return (
                  <Link key={product.slug} href={`/brands/${slug}/${product.slug}`} className="group">
                    <article className="border border-ink-100 hover:border-teal-200 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-teal-900/8 transition-all duration-300 hover:-translate-y-0.5 bg-white h-full flex flex-col">
                      {/* Product image */}
                      <div className="relative aspect-square bg-ink-50 overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.productName}
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        {/* Score badge */}
                        <div className="absolute top-2.5 right-2.5">
                          <ProductScoreRing score={product.score} />
                        </div>
                        {/* Verdict badge */}
                        <div className="absolute top-2.5 left-2.5">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${pc.bg} ${pc.text} ${pc.border}`}>
                            {product.scoreLabel}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-sm font-medium text-ink-900 group-hover:text-teal-700 transition-colors leading-snug mb-1.5 line-clamp-2">
                          {product.productName}
                        </h3>
                        <p className="text-xs text-ink-400 mb-3 line-clamp-1">{product.concern}</p>

                        {/* Badges — show max 3 */}
                        <div className="flex flex-wrap gap-1 mb-3 flex-1">
                          {product.pass_badges.slice(0, 2).map((b) => (
                            <span key={b} className="font-mono text-[9px] uppercase tracking-wider bg-teal-50 text-teal-600 border border-teal-200 px-1.5 py-0.5 rounded">
                              {b}
                            </span>
                          ))}
                          {product.warn_badges.slice(0, 1).map((b) => (
                            <span key={b} className="font-mono text-[9px] uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded">
                              {b}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-ink-50 mt-auto">
                          <span className="text-xs text-ink-500">{product.priceRange}</span>
                          <span className="text-teal-600 text-xs font-medium flex items-center gap-0.5 group-hover:gap-1 transition-all">
                            Details <ArrowRight size={11} />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
          </div>
        </div>

        {/* ── Analyse another product from this brand ── */}
        <div className="mt-12 bg-teal-50 border border-teal-100 rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center flex-shrink-0">
            <FlaskConical size={22} className="text-white" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-medium text-ink-950 mb-1">Don't see a {brand.name} product?</h3>
            <p className="text-ink-500 text-sm">Paste any {brand.name} product URL from Nykaa or their website and get a full scorecard in seconds.</p>
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
