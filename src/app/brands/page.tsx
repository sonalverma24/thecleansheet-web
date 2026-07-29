import type { Metadata } from "next";
import { Microscope } from "lucide-react";
import { getAllBrandSummaries, ALL_BRANDS } from "@/data/brands";
import BackButton from "@/components/BackButton";
import { ScorecardDiscovery } from "@/components/scorecards/ScorecardDiscovery";
import { HeroReviewBar } from "@/components/scorecards/HeroReviewBar";
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

export default async function BrandsPage() {
  // Live repository products join the catalogue in the same tile format,
  // newest first, skipping any product the curated catalogue already covers.
  const repoProducts = await listRepositoryCatalogueProducts(60);
  const brands = getAllBrandSummaries();
  const staticProducts = ALL_BRANDS.flatMap((b) => b.products);
  const known = new Set(staticProducts.map((p) => `${p.brand} ${p.productName}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()));
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const freshProducts = repoProducts
    .filter((p) => !known.has(`${p.brand} ${p.productName}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()))
    // NEW badge: only the latest 5 arrivals actually visible in the grid (30-day cap)
    .map((p, idx) => ({
      ...p,
      newArrival: idx < 5 && Date.now() - new Date(p.analyzedAt).getTime() < THIRTY_DAYS,
    }));
  const allProducts = [...freshProducts, ...staticProducts];

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
      <div className="bg-teal-950 pt-6 pb-5 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="absolute -left-24 bottom-0 opacity-[0.04] pointer-events-none">
          <svg width={280} height={280} viewBox="0 0 280 280">
            <circle cx={140} cy={140} r={128} fill="none" stroke="#fff" strokeWidth={16} />
          </svg>
        </div>

        {/* Skincare loop bleeding in from the right, fading into the teal canvas */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[42%] overflow-hidden" aria-hidden>
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/creatives/dropper-drop.jpg"
            className="w-full h-full object-cover"
            style={{ animation: "hero-video-in 1.8s ease-out both, hero-drift 26s ease-in-out infinite alternate" }}
          >
            <source src="/Videos/review-hero-web.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #081918 0%, rgba(8,25,24,0.82) 38%, rgba(8,25,24,0.15) 82%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #081918 0%, rgba(8,25,24,0) 24%)" }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="relative max-w-xl anim-fade-up" style={{ animationDelay: "0.05s" }}>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-teal-300 text-xs px-3 py-1.5 rounded-full mb-4">
              <Microscope size={12} /> India&apos;s Independent Product Review Registry
            </div>
            <h1 className="text-3xl sm:text-4xl font-medium text-white tracking-tight mb-3 leading-[1.1]">
              Every claim.<br />
              Every ingredient.<br />
              <span className="text-teal-400">Checked against proof.</span>
            </h1>
            <p className="text-teal-300/75 text-[15px] leading-relaxed mb-4 max-w-md">
              Independent reviews of India&apos;s beauty products: every marketing claim graded against
              real evidence, formulas read ingredient by ingredient.
            </p>

            <HeroReviewBar />
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
