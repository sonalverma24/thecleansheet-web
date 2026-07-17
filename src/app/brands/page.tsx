import type { Metadata } from "next";
import { Microscope } from "lucide-react";
import { getAllBrandSummaries, ALL_BRANDS, scoreColors } from "@/data/brands";
import BackButton from "@/components/BackButton";
import { ScorecardDiscovery } from "@/components/scorecards/ScorecardDiscovery";
import { listRepositoryCatalogueProducts } from "@/lib/product-review-engine";

/* The live-review repository grows continuously — refresh the page every 5 min. */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Product Reviews · India's Independent Clean Beauty Registry",
  description:
    "Independent, science-backed reviews of India's beauty products. Marketing claims graded against real evidence, full ingredient analysis, regulatory checks, zero brand bias.",
  keywords: [
    "clean beauty brands India", "Minimalist review India", "best clean skincare brands India",
    "brand ingredient safety score", "skincare brand ranking India", "clean beauty certification India",
  ],
  alternates: { canonical: "https://thecleansheet.in/brands" },
  openGraph: {
    title: "Product Reviews | The Clean Sheet™",
    description: "Independent reviews of Indian beauty products. Claims checked against proof, formulas read ingredient by ingredient.",
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

// Score ring for hero (decorative, server-rendered)
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
        <img src="/logo.png" alt="The Clean Sheet" width={logoSize} height={logoSize} className="rounded-full" />
      </div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" style={{ zIndex: 3 }}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={c.ring} strokeWidth={sw}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ animation: "drawArc 1.4s cubic-bezier(0.4,0,0.2,1) forwards" }}
        />
        <circle cx={bx} cy={by} r={br} fill={c.ring} />
        <text x={bx} y={by + br * 0.34} textAnchor="middle" fontSize={br * 0.9} fontWeight={700} fill="#fff"
          fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif">
          ✓
        </text>
      </svg>
    </div>
  );
}

const TIER_LEGEND = [
  { label: "Clean Sheet Approved", note: "claims proven",        color: "bg-lime-400"  },
  { label: "Mostly Clean",         note: "minor gaps",           color: "bg-teal-400"  },
  { label: "Needs Proof",          note: "evidence not visible", color: "bg-amber-400" },
  { label: "Misleading",           note: "claims contradicted",  color: "bg-red-400"   },
];

export default async function BrandsPage() {
  // Live repository products join the catalogue in the same tile format,
  // newest first, skipping any product the curated catalogue already covers.
  const repoProducts = await listRepositoryCatalogueProducts(60);
  const brands = getAllBrandSummaries();
  const staticProducts = ALL_BRANDS.flatMap((b) => b.products);
  const known = new Set(staticProducts.map((p) => `${p.brand} ${p.productName}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()));
  const freshProducts = repoProducts.filter(
    (p) => !known.has(`${p.brand} ${p.productName}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()),
  );
  const allProducts = [...freshProducts, ...staticProducts];
  const heroScore = [...brands].sort((a, b) => b.avgScore - a.avgScore)[0]?.avgScore ?? 86;
  const totalProducts = brands.reduce((s, b) => s + b.productCount, 0);

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
        .anim-fade-up  { animation: fadeUp  0.6s ease-out both; }
        .anim-fade-in  { animation: fadeIn  0.5s ease-out both; }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      {/* ── Hero (server-rendered) ── */}
      <div className="bg-teal-950 pt-14 pb-10 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
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
            <div className="anim-fade-up" style={{ animationDelay: "0.05s" }}>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-teal-300 text-xs px-3 py-1.5 rounded-full mb-6">
                <Microscope size={12} /> India&apos;s Independent Product Review Registry
              </div>
              <h1 className="text-4xl sm:text-5xl font-medium text-white tracking-tight mb-5 leading-[1.1]">
                Every claim.<br />
                Every ingredient.<br />
                <span className="text-teal-400">Checked against proof.</span>
              </h1>
              <p className="text-teal-300/75 text-lg leading-relaxed mb-8 max-w-lg">
                Independent reviews of India&apos;s beauty products. Marketing claims graded against real
                evidence, formulas read ingredient by ingredient, and one clear Clean Sheet standing for each.
              </p>
              <div className="flex flex-wrap gap-2">
                {TIER_LEGEND.map(({ label, note, color }) => (
                  <div key={label} className="flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-full px-3 py-1.5">
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-white/70 text-xs">{label}</span>
                    <span className="text-white/35 text-xs font-sans">{note}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:flex justify-center items-center anim-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)", transform: "scale(1.4)" }}
                />
                <HeroRing score={heroScore} size={220} />
                <div
                  className="absolute -top-3 -left-8 bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl px-3 py-2 text-center"
                  style={{ animation: "fadeUp 0.7s 0.6s ease-out both" }}
                >
                  <div className="text-teal-300 text-[10px] uppercase tracking-wider mb-0.5">Products</div>
                  <div className="text-white text-lg font-medium font-sans">{totalProducts}</div>
                </div>
                <div
                  className="absolute -bottom-2 -right-6 bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl px-3 py-2 text-center"
                  style={{ animation: "fadeUp 0.7s 0.8s ease-out both" }}
                >
                  <div className="text-teal-300 text-[10px] uppercase tracking-wider mb-0.5">Brands</div>
                  <div className="text-white text-lg font-medium font-sans">{brands.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content (client interactive) — catalogue + live repository products merged ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ScorecardDiscovery brands={brands} products={allProducts} />
      </div>
    </div>
  );
}
