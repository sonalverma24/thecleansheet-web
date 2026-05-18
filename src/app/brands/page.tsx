import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, Award, FlaskConical, Shield, CheckCircle2 } from "lucide-react";
import { getAllBrandSummaries, scoreColors } from "@/data/brands";

export const metadata: Metadata = {
  title: "Clean Beauty Brand Scores — India's Scored Brand Directory",
  description:
    "Science-backed scorecards for India's top beauty brands. Real ingredient analysis, regulatory compliance checks, and Clean Sheet Scores — zero brand bias.",
  keywords: [
    "clean beauty brands India", "Minimalist review India", "best clean skincare brands India",
    "brand ingredient safety score", "skincare brand ranking India", "clean beauty certification India",
  ],
  alternates: { canonical: "https://thecleansheet.in/brands" },
  openGraph: {
    title: "Clean Beauty Brand Scores | The Clean Sheet™",
    description: "Real Clean Sheet Scores for Indian beauty brands. Ingredient safety, compliance, formulation logic — all scored.",
    url: "https://thecleansheet.in/brands",
    type: "website",
  },
};

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Clean Beauty Brand Directory — The Clean Sheet™",
  description: "Science-backed scorecards for Indian beauty brands. Every product analysed for ingredient safety, regulatory compliance, and formulation quality.",
  url: "https://thecleansheet.in/brands",
  publisher: { "@type": "Organization", name: "The Clean Sheet", url: "https://thecleansheet.in" },
};

function ScoreRing({ score, size = 68 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const c = scoreColors(score);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={7} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.ring} strokeWidth={7}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill="#1e293b" fontFamily="serif">
        {score}
      </text>
    </svg>
  );
}

export default function BrandsPage() {
  const brands = getAllBrandSummaries();

  return (
    <div className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />

      {/* ── Header ── */}
      <div className="bg-teal-950 pt-14 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-teal-300 text-xs px-3 py-1.5 rounded-full mb-6">
            <Award size={12} /> Brand Score Directory
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white tracking-tight mb-4 max-w-2xl leading-tight">
            Every brand. Every product.<br />
            <span className="text-teal-400">Scored by science.</span>
          </h1>
          <p className="text-teal-300/80 text-lg max-w-xl leading-relaxed">
            Real Clean Sheet Scores for India's beauty brands — based on ingredient safety, regulatory compliance, formulation logic, and transparency. Zero brand partnerships. Zero bias.
          </p>
        </div>
      </div>

      {/* ── Brand grid ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6">
        {/* Stats bar */}
        <div className="bg-white border border-ink-100 rounded-2xl shadow-sm p-4 mb-10 grid grid-cols-3 divide-x divide-ink-100">
          {[
            { label: "Brands scored",    value: brands.length.toString()  },
            { label: "Products analysed", value: brands.reduce((s, b) => s + b.productCount, 0).toString() },
            { label: "Ingredients checked", value: "25,000+"                },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 sm:px-6 text-center">
              <div className="text-xl sm:text-2xl font-medium text-ink-950">{value}</div>
              <div className="text-xs text-ink-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-ink-700 uppercase tracking-wider">Scored Brands</h2>
          <div className="text-xs text-ink-400 border border-ink-200 rounded-full px-3 py-1">Updated May 2026</div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {brands.map((brand) => {
            const c = scoreColors(brand.avgScore);
            return (
              <Link key={brand.slug} href={`/brands/${brand.slug}`} className="group">
                <article className="border border-ink-100 hover:border-teal-200 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-teal-900/8 transition-all duration-300 hover:-translate-y-1 bg-white h-full flex flex-col">
                  {/* Top accent */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 to-teal-300" />

                  <div className="p-6 flex flex-col flex-1">
                    {/* Logo + score */}
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <div className="w-[72px] h-[72px] rounded-2xl border border-ink-100 bg-white shadow-sm flex items-center justify-center overflow-hidden p-2 flex-shrink-0">
                        <Image
                          src={brand.logo}
                          alt={`${brand.name} logo`}
                          width={64}
                          height={64}
                          className="object-contain max-h-full"
                        />
                      </div>
                      <ScoreRing score={brand.avgScore} />
                    </div>

                    {/* Name + verdict */}
                    <div className="mb-3">
                      <h3 className="text-lg font-medium text-ink-950 group-hover:text-teal-700 transition-colors mb-1.5">
                        {brand.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
                          {brand.verdict}
                        </span>
                        <span className="text-xs text-ink-400">{brand.headquarters}</span>
                      </div>
                    </div>

                    <p className="text-ink-500 text-sm leading-relaxed flex-1 mb-5 line-clamp-2">{brand.tagline}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-ink-50">
                      <div className="flex items-center gap-1.5 text-xs text-ink-400">
                        <FlaskConical size={12} />
                        {brand.productCount} products scored
                      </div>
                      <span className="flex items-center gap-1 text-teal-600 text-xs font-medium group-hover:gap-2 transition-all">
                        View scorecards <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}

          {/* Coming soon */}
          <div className="border border-dashed border-ink-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center min-h-[260px]">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
              <FlaskConical size={20} className="text-teal-400" />
            </div>
            <p className="text-ink-600 text-sm font-medium mb-1.5">More brands coming soon</p>
            <p className="text-ink-400 text-xs leading-relaxed mb-4">
              Mamaearth · Cetaphil · Plum<br />Dot & Key · WOW · Neutrogena
            </p>
            <Link href="/analyzer" className="text-xs text-teal-600 hover:text-teal-800 underline underline-offset-2 transition-colors">
              Analyse a brand now →
            </Link>
          </div>
        </div>

        {/* ── For Brands CTA ── */}
        <div className="mt-16 grid lg:grid-cols-2 gap-6">
          {/* Brands: get certified */}
          <div className="bg-teal-950 rounded-3xl p-8">
            <div className="inline-flex items-center gap-1.5 bg-white/10 text-teal-300 text-xs px-2.5 py-1 rounded-full mb-4">
              <Shield size={11} /> For Brands
            </div>
            <h2 className="text-2xl font-medium text-white mb-3">Get your products scored.</h2>
            <p className="text-teal-300/80 text-sm leading-relaxed mb-6">
              Join India's growing registry of independently verified beauty products. A Clean Sheet Score is proof you stand behind your ingredients.
            </p>
            <div className="space-y-2 mb-6">
              {["Full ingredient safety evaluation", "Regulatory compliance across India, EU & US", "Public scorecard published on this directory"].map((pt) => (
                <div key={pt} className="flex items-center gap-2 text-teal-200 text-sm">
                  <CheckCircle2 size={14} className="text-teal-400 flex-shrink-0" />
                  {pt}
                </div>
              ))}
            </div>
            <Link href="/certification"
              className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-coral-500/30">
              Apply for certification <ArrowRight size={14} />
            </Link>
          </div>

          {/* Consumers: analyse any product */}
          <div className="bg-ink-50 border border-ink-100 rounded-3xl p-8">
            <div className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-700 text-xs px-2.5 py-1 rounded-full mb-4">
              <FlaskConical size={11} /> For Consumers
            </div>
            <h2 className="text-2xl font-medium text-ink-950 mb-3">Don't see your product?</h2>
            <p className="text-ink-600 text-sm leading-relaxed mb-6">
              Paste any product URL from Nykaa, Amazon, Myntra, or the brand website. Ask Clean analyses every ingredient and returns a full scorecard in under 30 seconds.
            </p>
            <div className="space-y-2 mb-6">
              {["Works with any Nykaa or Amazon URL", "Checks every ingredient against India regulations", "Free, instant, no sign-up"].map((pt) => (
                <div key={pt} className="flex items-center gap-2 text-ink-600 text-sm">
                  <CheckCircle2 size={14} className="text-teal-500 flex-shrink-0" />
                  {pt}
                </div>
              ))}
            </div>
            <Link href="/analyzer"
              className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all">
              Analyse any product <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
}
