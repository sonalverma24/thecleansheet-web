import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Info, FlaskConical, ShieldCheck } from "lucide-react";
import { getBrandBySlug, getProductBySlug, getAllBrandSummaries, scoreColors } from "@/data/brands";
import type { ProductScorecard } from "@/data/brands";

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

export async function generateMetadata({ params }: { params: Promise<{ brand: string; product: string }> }) {
  const { brand: brandSlug, product: productSlug } = await params;
  const product = getProductBySlug(brandSlug, productSlug);
  const brand = getBrandBySlug(brandSlug);
  if (!product || !brand) return {};

  return {
    title: `${product.productName} Review — Clean Sheet Score ${product.score}/100`,
    description: `Is ${product.productName} safe? Science-backed ingredient analysis: ${product.score}/100 (${product.scoreLabel}). Full INCI review, regulatory compliance, and India-specific skin context. ${product.concern}.`,
    keywords: [
      `${product.productName} review`, `${product.productName} India`, `is ${product.productName} safe`,
      `${brand.name} ${product.concern.split(",")[0].trim()} ${product.productType === "sunscreen" ? "sunscreen" : product.productType === "treatment" ? "peel" : product.productType === "toner" ? "toner" : "serum"} review`,
      `${brand.name} ingredients safe`, `${product.productName} ingredients`,
      "clean beauty India", "ingredient checker India",
    ],
    alternates: { canonical: `https://thecleansheet.in/brands/${brandSlug}/${productSlug}` },
    openGraph: {
      title: `${product.productName} — Score ${product.score}/100 | The Clean Sheet™`,
      description: `${product.scoreLabel} rating. ${product.summary.slice(0, 150)}...`,
      url: `https://thecleansheet.in/brands/${brandSlug}/${productSlug}`,
      type: "article",
      images: [{ url: product.image, width: 800, height: 800, alt: product.productName }],
    },
  };
}

function ScoreRing({ score, size = 88 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const c = scoreColors(score);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.ring} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 + 6} textAnchor="middle" fontSize={18} fontWeight={700} fill="#fff" fontFamily="serif">
        {score}
      </text>
    </svg>
  );
}

function PillarBar({ name, score, max, note }: { name: string; score: number; max: number; note: string }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 90 ? "bg-teal-500" : pct >= 70 ? "bg-blue-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="py-4 border-b border-ink-50 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-ink-800">{name}</span>
        <span className="text-sm font-mono text-ink-600 flex-shrink-0 ml-4">{score}/{max}</span>
      </div>
      <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-ink-500 leading-relaxed">{note}</p>
    </div>
  );
}

function IngredientRow({ name, note, flag }: { name: string; note: string; flag: "ok" | "warn" | "info" }) {
  const styles = {
    ok:   { dot: "bg-teal-500",  row: "",                      label: "Safe",    labelCls: "text-teal-600" },
    info: { dot: "bg-blue-400",  row: "bg-blue-50/40",         label: "Note",    labelCls: "text-blue-600" },
    warn: { dot: "bg-amber-500", row: "bg-amber-50/60",        label: "Caution", labelCls: "text-amber-700" },
  }[flag];
  return (
    <tr className={`${styles.row} border-b border-ink-50`}>
      <td className="py-2.5 px-4 text-sm font-medium text-ink-900 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
          {name}
        </div>
      </td>
      <td className="py-2.5 px-4 text-xs text-ink-500 leading-relaxed">{note}</td>
      <td className="py-2.5 px-4 text-xs font-medium text-right whitespace-nowrap">
        <span className={styles.labelCls}>{styles.label}</span>
      </td>
    </tr>
  );
}

function RelatedProductCard({ product, brandSlug }: { product: ProductScorecard; brandSlug: string }) {
  const c = scoreColors(product.score);
  const r = 21;
  const circ = 2 * Math.PI * r;
  const dash = (product.score / 100) * circ;
  return (
    <Link href={`/brands/${brandSlug}/${product.slug}`} className="group flex items-center gap-3 p-3 rounded-xl border border-ink-100 hover:border-teal-200 hover:shadow-sm transition-all bg-white">
      <div className="w-12 h-12 rounded-lg bg-ink-50 overflow-hidden flex-shrink-0">
        <Image src={product.image} alt={product.productName} width={48} height={48} className="object-contain p-1 w-full h-full" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-ink-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug">
          {product.productName}
        </div>
        <div className="text-[10px] text-ink-400 mt-0.5">{product.priceRange}</div>
      </div>
      <svg width={48} height={48} viewBox="0 0 48 48" className="flex-shrink-0">
        <circle cx={24} cy={24} r={r} fill="none" stroke="#f1f5f9" strokeWidth={5} />
        <circle cx={24} cy={24} r={r} fill="none" stroke={c.ring} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 24 24)" />
        <text x={24} y={28} textAnchor="middle" fontSize={10} fontWeight={700} fill="#1e293b" fontFamily="serif">{product.score}</text>
      </svg>
    </Link>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ brand: string; product: string }> }) {
  const { brand: brandSlug, product: productSlug } = await params;
  const brand = getBrandBySlug(brandSlug);
  const product = getProductBySlug(brandSlug, productSlug);
  if (!brand || !product) notFound();

  const c = scoreColors(product.score);
  const totalScore = product.pillars.reduce((s, p) => s + p.score, 0);
  const totalMax = product.pillars.reduce((s, p) => s + p.max, 0);
  const okCount = product.ingredients.filter((i) => i.flag === "ok").length;
  const warnCount = product.ingredients.filter((i) => i.flag === "warn").length;
  const infoCount = product.ingredients.filter((i) => i.flag === "info").length;
  const relatedProducts = brand.products.filter((p) => p.slug !== productSlug).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home",    item: "https://thecleansheet.in" },
          { "@type": "ListItem", position: 2, name: "Brands",  item: "https://thecleansheet.in/brands" },
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
        offers: { "@type": "AggregateOffer", priceCurrency: "INR", lowPrice: product.priceRange.split("–")[0].replace(/[₹,\s]/g, "") },
        review: {
          "@type": "Review",
          reviewRating: { "@type": "Rating", ratingValue: product.score, bestRating: 100, worstRating: 0 },
          author: { "@type": "Organization", name: "The Clean Sheet" },
          reviewBody: product.summary,
          datePublished: product.analyzedAt,
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.score,
          bestRating: 100,
          worstRating: 0,
          ratingCount: 1,
        },
      },
    ],
  };

  return (
    <div className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ── */}
      <div className="bg-teal-950 pt-10 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-teal-400 mb-6 flex-wrap">
            <Link href="/" className="hover:text-teal-200 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/brands" className="hover:text-teal-200 transition-colors">Brands</Link>
            <span>/</span>
            <Link href={`/brands/${brandSlug}`} className="hover:text-teal-200 transition-colors">{brand.name}</Link>
            <span>/</span>
            <span className="text-teal-200 line-clamp-1">{product.productName}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Left — product info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-teal-400 uppercase tracking-widest">{brand.name}</span>
                <span className="w-1 h-1 rounded-full bg-teal-600" />
                <span className="text-xs text-teal-500 capitalize">{product.productType.replace("-", " ")}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-medium text-white tracking-tight mb-3 leading-tight">
                {product.productName}
              </h1>
              <p className="text-teal-300/80 text-sm mb-5">{product.concern}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {product.pass_badges.map((b) => (
                  <span key={b} className="inline-flex items-center gap-1 text-xs bg-teal-900/60 border border-teal-700/40 text-teal-300 px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={10} /> {b}
                  </span>
                ))}
                {product.warn_badges.map((b) => (
                  <span key={b} className="inline-flex items-center gap-1 text-xs bg-amber-900/40 border border-amber-700/40 text-amber-300 px-2.5 py-1 rounded-full">
                    <AlertTriangle size={10} /> {b}
                  </span>
                ))}
                {product.info_badges.map((b) => (
                  <span key={b} className="inline-flex items-center gap-1 text-xs bg-blue-900/40 border border-blue-700/40 text-blue-300 px-2.5 py-1 rounded-full">
                    <Info size={10} /> {b}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 text-sm text-teal-400">
                <span>{product.priceRange}</span>
                <span className="w-1 h-1 rounded-full bg-teal-700" />
                <span>Analysed {new Date(product.analyzedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>

            {/* Right — score card */}
            <div className="bg-white/8 border border-white/12 rounded-3xl p-7 backdrop-blur-sm">
              <div className="flex items-center gap-5 mb-6">
                <ScoreRing score={product.score} size={88} />
                <div>
                  <div className="text-white/50 text-xs uppercase tracking-widest mb-1">Clean Sheet Score</div>
                  <div className="text-4xl font-medium text-white">{product.score}<span className="text-white/40 text-xl">/100</span></div>
                  <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border mt-1.5 ${c.bg} ${c.text} ${c.border}`}>
                    {product.scoreLabel}
                  </span>
                </div>
              </div>

              {/* Ingredient stats */}
              <div className="grid grid-cols-3 gap-3 text-center mb-5">
                {[
                  { label: "Safe",    value: okCount,   color: "text-teal-400" },
                  { label: "Note",    value: infoCount, color: "text-blue-400" },
                  { label: "Caution", value: warnCount, color: "text-amber-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white/6 rounded-xl p-3">
                    <div className={`text-xl font-medium ${color}`}>{value}</div>
                    <div className="text-white/40 text-[10px] mt-0.5">{label} ingredients</div>
                  </div>
                ))}
              </div>

              <p className="text-teal-200/70 text-xs leading-relaxed">{product.summary.slice(0, 180)}…</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Product image + summary ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Product image */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="aspect-square rounded-3xl bg-ink-50 border border-ink-100 overflow-hidden flex items-center justify-center p-8 mb-4">
                <Image
                  src={product.image}
                  alt={product.productName}
                  width={400}
                  height={400}
                  className="object-contain w-full h-full"
                />
              </div>

              {/* Key actives */}
              <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical size={14} className="text-teal-600" />
                  <span className="text-xs font-medium text-teal-800 uppercase tracking-wider">Key Actives</span>
                </div>
                <div className="space-y-3">
                  {product.keyActives.map((a) => (
                    <div key={a.name}>
                      <div className="text-sm font-medium text-ink-800 mb-0.5">{a.name}</div>
                      <div className="text-xs text-ink-500 leading-relaxed">{a.function}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">

            {/* Summary */}
            <div>
              <div className="text-xs font-medium text-ink-400 uppercase tracking-widest mb-3">Expert Summary</div>
              <p className="text-ink-700 leading-relaxed text-[15px]">{product.summary}</p>
            </div>

            {/* Score pillars */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-medium text-ink-400 uppercase tracking-widest">Score Breakdown</div>
                <span className="text-xs font-mono text-ink-500">{totalScore}/{totalMax} points</span>
              </div>
              <div className="border border-ink-100 rounded-2xl overflow-hidden divide-y divide-ink-50">
                {product.pillars.map((pillar) => (
                  <div key={pillar.name} className="px-5">
                    <PillarBar {...pillar} />
                  </div>
                ))}
              </div>
            </div>

            {/* India context */}
            {product.indiaContext && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="text-lg flex-shrink-0">🇮🇳</div>
                  <div>
                    <div className="text-xs font-medium text-amber-800 uppercase tracking-wider mb-1.5">India Skin Context</div>
                    <p className="text-sm text-amber-900 leading-relaxed">{product.indiaContext}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Ingredient table */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-xs font-medium text-ink-400 uppercase tracking-widest">Full Ingredient List</div>
                <div className="flex items-center gap-3 ml-auto text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" /> Safe</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" /> Note</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Caution</span>
                </div>
              </div>
              <div className="border border-ink-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-ink-50 border-b border-ink-100">
                      <th className="py-2.5 px-4 text-[10px] font-medium text-ink-500 uppercase tracking-wider">Ingredient (INCI)</th>
                      <th className="py-2.5 px-4 text-[10px] font-medium text-ink-500 uppercase tracking-wider">Note</th>
                      <th className="py-2.5 px-4 text-[10px] font-medium text-ink-500 uppercase tracking-wider text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.ingredients.map((ing) => (
                      <IngredientRow key={ing.name} {...ing} />
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-ink-400 mt-2">Ingredients listed in INCI order as declared on product packaging. Position reflects approximate concentration (high → low).</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Certification badge ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-teal-950 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-800 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={26} className="text-teal-300" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="text-white font-medium mb-1">About this scorecard</div>
            <p className="text-teal-300/80 text-sm leading-relaxed">
              Clean Sheet Scores are generated by analysing every ingredient against India, EU, and US safety regulations.
              No brand sponsorship. No affiliate relationships. Independent science-backed analysis only.
            </p>
          </div>
          <Link href="/analyzer"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all whitespace-nowrap">
            Analyse another product <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── More from this brand ── */}
      {relatedProducts.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-medium text-ink-950">More from {brand.name}</h2>
            <Link href={`/brands/${brandSlug}`} className="text-sm text-teal-600 hover:text-teal-800 transition-colors flex items-center gap-1">
              All {brand.name} products <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {relatedProducts.map((p) => (
              <RelatedProductCard key={p.slug} product={p} brandSlug={brandSlug} />
            ))}
          </div>
        </div>
      )}

      {/* ── Back link ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <Link href={`/brands/${brandSlug}`} className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink-800 transition-colors">
          <ArrowLeft size={14} /> Back to {brand.name}
        </Link>
      </div>
    </div>
  );
}
