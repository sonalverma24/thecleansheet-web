import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, FlaskConical, Shield, CheckCircle2, Microscope } from "lucide-react";
import { getAllBrandSummaries, scoreColors } from "@/data/brands";
import BackButton from "@/components/BackButton";

export const metadata: Metadata = {
  title: "Clean Beauty Brand Scores, India's Scored Brand Directory",
  description:
    "Science-backed scorecards for India's top beauty brands. Real ingredient analysis, regulatory compliance checks, and Clean Sheet Scores, zero brand bias.",
  keywords: [
    "clean beauty brands India", "Minimalist review India", "best clean skincare brands India",
    "brand ingredient safety score", "skincare brand ranking India", "clean beauty certification India",
  ],
  alternates: { canonical: "https://thecleansheet.in/brands" },
  openGraph: {
    title: "Clean Beauty Brand Scores | The Clean Sheet™",
    description: "Real Clean Sheet Scores for Indian beauty brands. Ingredient safety, compliance, formulation logic, all scored.",
    url: "https://thecleansheet.in/brands",
    type: "website",
  },
};

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Clean Beauty Brand Directory, The Clean Sheet™",
  description: "Science-backed scorecards for Indian beauty brands. Every product analysed for ingredient safety, regulatory compliance, and formulation quality.",
  url: "https://thecleansheet.in/brands",
  publisher: { "@type": "Organization", name: "The Clean Sheet", url: "https://thecleansheet.in" },
};

// Clean Meter, horizontal scale showing where the brand sits across the 0-100 spectrum
function CleanMeter({ score }: { score: number }) {
  const c = scoreColors(score);
  // Zones: Concern 0-50 (50%), Fair 50-70 (20%), Good 70-90 (20%), Excellent 90-100 (10%)
  return (
    <div className="w-full mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-ink-400 uppercase tracking-wider font-sans">Clean Meter</span>
        <span className={`text-xs font-medium ${c.text}`}>{score}/100</span>
      </div>
      {/* Track */}
      <div className="relative h-2 rounded-full flex overflow-hidden">
        <div className="flex-none bg-red-200"   style={{ width: "50%" }} />
        <div className="flex-none bg-amber-200" style={{ width: "20%" }} />
        <div className="flex-none bg-blue-200"  style={{ width: "20%" }} />
        <div className="flex-none bg-teal-200"  style={{ width: "10%" }} />
        {/* Marker dot, positioned at score% along the track */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md ${c.text.replace("text-", "bg-")}`}
          style={{ left: `calc(${score}% - 7px)` }}
        />
      </div>
      {/* Scale labels */}
      <div className="flex justify-between mt-1.5">
        <span className="text-[9px] text-ink-300 font-sans">0</span>
        <span className="text-[9px] text-ink-300 font-sans" style={{ marginLeft: "calc(50% - 8px)" }}>50</span>
        <span className="text-[9px] text-ink-300 font-sans" style={{ marginLeft: "calc(20% - 6px)" }}>70</span>
        <span className="text-[9px] text-ink-300 font-sans" style={{ marginLeft: "calc(20% - 6px)" }}>90</span>
        <span className="text-[9px] text-ink-300 font-sans">100</span>
      </div>
    </div>
  );
}

// Decorative hero ring, large, dark background version
function HeroRing({ score, size }: { score: number; size: number }) {
  const sw = 10;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const c = scoreColors(score);
  const logoSize = Math.round((r - sw / 2) * 2) - 2;
  const bx = +(size / 2 + r * Math.cos(-Math.PI / 4)).toFixed(1);
  const by = +(size / 2 + r * Math.sin(-Math.PI / 4)).toFixed(1);
  const br = Math.round(size * 0.1);
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" style={{ zIndex: 1 }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={sw} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
        <Image src="/logo.png" alt="The Clean Sheet" width={logoSize} height={logoSize} className="rounded-full" />
      </div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" style={{ zIndex: 3 }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.ring} strokeWidth={sw}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ animation: "drawArc 1.4s cubic-bezier(0.4,0,0.2,1) forwards" }}
        />
        <circle cx={bx} cy={by} r={br} fill={c.ring} />
        <text x={bx} y={by + br * 0.38} textAnchor="middle" fontSize={br * 1.0} fontWeight={700} fill="#fff" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif">
          {score}
        </text>
      </svg>
    </div>
  );
}

const SCORE_LEGEND = [
  { label: "Excellent",   range: "90-100", color: "bg-teal-500",  text: "text-teal-700",  border: "border-teal-200",  bg: "bg-teal-50"  },
  { label: "Good",        range: "70-89",  color: "bg-blue-500",  text: "text-blue-700",  border: "border-blue-200",  bg: "bg-blue-50"  },
  { label: "Fair",        range: "50-69",  color: "bg-amber-500", text: "text-amber-700", border: "border-amber-200", bg: "bg-amber-50" },
  { label: "Concern",     range: "0-49",   color: "bg-red-500",   text: "text-red-700",   border: "border-red-200",   bg: "bg-red-50"   },
];

export default function BrandsPage() {
  const brands = getAllBrandSummaries().sort((a, b) => b.avgScore - a.avgScore);
  const totalProducts = brands.reduce((s, b) => s + b.productCount, 0);

  // Representative ring for hero (use top brand score)
  const heroScore = brands[0]?.avgScore ?? 86;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <BackButton />
      </div>
      <style>{`
        @keyframes drawArc {
          from { stroke-dashoffset: 1000; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        .anim-fade-up   { animation: fadeUp  0.6s ease-out both; }
        .anim-fade-in   { animation: fadeIn  0.5s ease-out both; }
        .anim-scale-in  { animation: scaleIn 0.5s ease-out both; }
        .brand-card { animation: fadeUp 0.5s ease-out both; }
      `}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="bg-teal-950 pt-14 pb-24 relative overflow-hidden">
        {/* Background grid texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Floating decorative rings in bg */}
        <div className="absolute -right-16 -top-16 opacity-[0.06] pointer-events-none">
          <svg width={340} height={340} viewBox="0 0 340 340">
            <circle cx={170} cy={170} r={158} fill="none" stroke="#fff" strokeWidth={20} />
          </svg>
        </div>
        <div className="absolute -left-24 bottom-0 opacity-[0.04] pointer-events-none">
          <svg width={280} height={280} viewBox="0 0 280 280">
            <circle cx={140} cy={140} r={128} fill="none" stroke="#fff" strokeWidth={16} />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left, copy */}
            <div className="anim-fade-up" style={{ animationDelay: "0.05s" }}>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-teal-300 text-xs px-3 py-1.5 rounded-full mb-6">
                <Microscope size={12} /> India's First Clean Beauty Scorecard Directory
              </div>
              <h1 className="text-4xl sm:text-5xl font-medium text-white tracking-tight mb-5 leading-[1.1]">
                Every brand.<br />
                Every product.<br />
                <span className="text-teal-400">Scored by science.</span>
              </h1>
              <p className="text-teal-300/75 text-lg leading-relaxed mb-8 max-w-lg">
                Clean Sheet Scores for India's beauty brands, built on ingredient safety, regulatory compliance, formulation logic, and transparency. Zero brand partnerships. Zero bias.
              </p>

              {/* Score legend */}
              <div className="flex flex-wrap gap-2">
                {SCORE_LEGEND.map(({ label, range, color }) => (
                  <div key={label} className="flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-full px-3 py-1.5">
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-white/70 text-xs">{label}</span>
                    <span className="text-white/35 text-xs font-sans">{range}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right, decorative score ring */}
            <div className="hidden lg:flex justify-center items-center anim-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="relative">
                {/* Outer glow */}
                <div className="absolute inset-0 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)", transform: "scale(1.4)" }} />
                <HeroRing score={heroScore} size={220} />
                {/* Floating score chips */}
                <div className="absolute -top-3 -left-8 bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl px-3 py-2 text-center"
                  style={{ animation: "fadeUp 0.7s 0.6s ease-out both" }}>
                  <div className="text-teal-300 text-[10px] uppercase tracking-wider mb-0.5">Products</div>
                  <div className="text-white text-lg font-medium font-sans">{totalProducts}</div>
                </div>
                <div className="absolute -bottom-2 -right-6 bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl px-3 py-2 text-center"
                  style={{ animation: "fadeUp 0.7s 0.8s ease-out both" }}>
                  <div className="text-teal-300 text-[10px] uppercase tracking-wider mb-0.5">Brands</div>
                  <div className="text-white text-lg font-medium font-sans">{brands.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Stats strip */}
        <div className="bg-white border border-ink-100 rounded-2xl shadow-sm -mt-6 mb-12 grid grid-cols-3 divide-x divide-ink-100 anim-scale-in" style={{ animationDelay: "0.35s" }}>
          {[
            { label: "Brands scored",      value: brands.length.toString() },
            { label: "Products analysed",  value: totalProducts.toString()  },
            { label: "Ingredients checked", value: "25,000+"               },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 sm:px-8 py-4 text-center">
              <div className="text-2xl sm:text-3xl font-medium text-ink-950 tracking-tight">{value}</div>
              <div className="text-xs text-ink-400 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-xl font-medium text-ink-950">Scored Brands</h2>
            <p className="text-xs text-ink-400 mt-0.5">Ranked by average Clean Sheet Score</p>
          </div>
          <div className="text-xs text-ink-400 border border-ink-200 rounded-full px-3 py-1 font-sans">Updated May 2026</div>
        </div>

        {/* Brand grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {brands.map((brand, i) => {
            const c = scoreColors(brand.avgScore);
            return (
              <Link key={brand.slug} href={`/brands/${brand.slug}`} className="group brand-card" style={{ animationDelay: `${0.05 * i}s` }}>
                <article className="border border-ink-100 hover:border-teal-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-300 hover:-translate-y-1.5 bg-white h-full flex flex-col">

                  {/* Card body */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Header: logo + rank + verdict */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-ink-50 border border-ink-100 flex items-center justify-center overflow-hidden p-2 flex-shrink-0">
                        <Image
                          src={brand.logo}
                          alt={`${brand.name} logo`}
                          width={48}
                          height={48}
                          className="object-contain max-h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-sans text-[9px] text-ink-400 bg-ink-100 px-1.5 py-0.5 rounded">#{i + 1}</span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
                            {brand.verdict}
                          </span>
                        </div>
                        <h3 className="text-base font-medium text-ink-950 group-hover:text-teal-700 transition-colors leading-snug">
                          {brand.name}
                        </h3>
                        <span className="text-xs text-ink-400">{brand.headquarters}</span>
                      </div>
                    </div>

                    <p className="text-ink-500 text-sm leading-relaxed flex-1 mb-4 line-clamp-2">{brand.tagline}</p>

                    {/* Clean Meter */}
                    <CleanMeter score={brand.avgScore} />

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-ink-50">
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
          <div className="border border-dashed border-ink-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center min-h-[280px] brand-card" style={{ animationDelay: `${0.05 * brands.length}s` }}>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-4">
              <FlaskConical size={20} className="text-teal-400" />
            </div>
            <p className="text-ink-700 text-sm font-medium mb-1.5">More brands coming soon</p>
            <p className="text-ink-400 text-xs leading-relaxed mb-5">
              Mamaearth · Cetaphil · Plum<br />WOW · Neutrogena · L'Oréal
            </p>
            <Link href="/analyzer" className="inline-flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-800 border border-teal-200 hover:border-teal-400 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-full transition-all">
              Analyse a brand now <ArrowRight size={10} />
            </Link>
          </div>
        </div>

        {/* ── Methodology strip ── */}
        <div className="mt-14 mb-12 grid sm:grid-cols-3 gap-4">
          {[
            { icon: "🔬", title: "4 Scored Pillars", desc: "Safety & Toxicity · Formulation Quality · Claims & Transparency · Ethics & Sustainability" },
            { icon: "📋", title: "INCI-First Analysis", desc: "Every ingredient verified against the declared INCI list from the brand's own website" },
            { icon: "🇮🇳", title: "India Context", desc: "Scores account for Indian climate, skin concerns, and CDSCO regulatory framework" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-ink-50 border border-ink-100 rounded-2xl p-5">
              <div className="text-2xl mb-3">{icon}</div>
              <div className="text-sm font-medium text-ink-900 mb-1">{title}</div>
              <div className="text-xs text-ink-500 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>

        {/* ── CTAs ── */}
        <div className="grid lg:grid-cols-2 gap-6 mb-20">
          <div className="bg-teal-950 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 opacity-[0.07] pointer-events-none">
              <svg width={160} height={160} viewBox="0 0 160 160">
                <circle cx={80} cy={80} r={70} fill="none" stroke="#fff" strokeWidth={14} />
              </svg>
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 bg-white/10 text-teal-300 text-xs px-2.5 py-1 rounded-full mb-4">
                <Shield size={11} /> For Brands
              </div>
              <h2 className="text-2xl font-medium text-white mb-3">Get your products scored.</h2>
              <p className="text-teal-300/75 text-sm leading-relaxed mb-6">
                Join India's growing registry of independently verified beauty products. A Clean Sheet Score is proof you stand behind your ingredients.
              </p>
              <div className="space-y-2 mb-6">
                {["Full ingredient safety evaluation", "Compliance checked across India, EU, US, Korea & Japan", "Public scorecard published on this directory"].map((pt) => (
                  <div key={pt} className="flex items-center gap-2 text-teal-200 text-sm">
                    <CheckCircle2 size={14} className="text-teal-400 flex-shrink-0" />
                    {pt}
                  </div>
                ))}
              </div>
              <p className="text-teal-300/60 text-xs leading-relaxed mb-4">
                Scored well? Take your transparency and trust to the next level - get certified.
              </p>
              <Link href="/certification"
                className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-coral-500/30">
                Get certified <ArrowRight size={14} />
              </Link>
            </div>
          </div>

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
    </div>
  );
}
