import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, Star, Award, CheckCircle2 } from "lucide-react";
import BackButton from "@/components/BackButton";

export const metadata = {
  title: "Clean Beauty Certified Products in India",
  description:
    "Browse beauty and skincare products certified by The Clean Sheet™. Every product has a public scorecard covering ingredients, claims, manufacturing, and regulatory compliance.",
  keywords: [
    "clean beauty certified products India", "safe skincare products India",
    "clean beauty certification", "ingredient-safe products", "certified skincare India",
  ],
  alternates: { canonical: "https://thecleansheet.in/certified" },
  openGraph: {
    title: "Clean Beauty Certified Products | The Clean Sheet™",
    description:
      "Browse science-certified beauty and skincare products in India. Every product scored for safety, transparency, and regulatory compliance.",
    url: "https://thecleansheet.in/certified",
    type: "website",
  },
};

const PLACEHOLDER_PRODUCTS = [
  {
    name: "Ultra-Calm Barrier Serum",
    brand: "Example Brand Co.",
    score: 91,
    tier: "excellent",
    category: "Serum",
    image: "/images/mona-jain-j24HPh0Q84g-unsplash.jpg",
  },
  {
    name: "Gentle Foaming Face Wash",
    brand: "Pure Labs India",
    score: 84,
    tier: "good",
    category: "Face Cleanser",
    image: "/images/mathilde-langevin-2ObVEZxUDlc-unsplash.jpg",
  },
  {
    name: "SPF 50+ Tinted Sunscreen",
    brand: "DayShield Pro",
    score: 88,
    tier: "good",
    category: "Sunscreen",
    image: "/images/isaac-wolff-EVLP4ShgbjE-unsplash.jpg",
  },
  {
    name: "5% Niacinamide Daily Moisturiser",
    brand: "Skin Science Co.",
    score: 93,
    tier: "excellent",
    category: "Moisturizer",
    image: "/images/valeriia-miller-_42NKYROG7g-unsplash.jpg",
  },
  {
    name: "Scalp Care Shampoo",
    brand: "Root & Stem",
    score: 77,
    tier: "good",
    category: "Hair Care",
    image: "/images/toa-heftiba-GLl6_-L3fxM-unsplash.jpg",
  },
  {
    name: "Baby Wash & Shampoo",
    brand: "TinyClean",
    score: 95,
    tier: "excellent",
    category: "Baby Care",
    image: "/images/good-skin-club-kB0w9XDqGS0-unsplash.jpg",
  },
];

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; bar: string }> = {
  excellent: {
    label: "Excellent ✦",
    color: "text-safe-600",
    bg: "bg-safe-100 border-safe-600/25",
    bar: "bg-safe-500",
  },
  good: {
    label: "Good ✓",
    color: "text-teal-700",
    bg: "bg-teal-50 border-teal-200",
    bar: "bg-teal-500",
  },
  fair: {
    label: "Fair ⚠",
    color: "text-caution-600",
    bg: "bg-caution-100 border-caution-600/25",
    bar: "bg-caution-500",
  },
};

export default function CertifiedPage() {
  return (
    <div className="bg-white min-h-[80vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <BackButton />
      </div>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative bg-white border-b border-teal-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-teal-600 bg-teal-50 border border-teal-200 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
                <Award size={14} />
                Certified Products
              </div>
              <h1 className="text-5xl lg:text-6xl font-medium text-ink-950 tracking-tight leading-tight mb-6">
                Products that
                <br />
                earned it.
              </h1>
              <p className="text-xl text-ink-600 leading-relaxed mb-8 max-w-xl">
                Every product here has been independently evaluated, scored, and certified
                against The Clean Sheet™ framework. No paid placements. No shortcuts. Ever.
              </p>
              <div className="flex flex-wrap gap-4">
                {[
                  { value: "0 paid listings", label: "Independence" },
                  { value: "4 pillars", label: "Evaluation standard" },
                  { value: "Annual", label: "Re-certification" },
                ].map(({ value, label }) => (
                  <div key={value} className="bg-teal-50 border border-teal-200 rounded-2xl px-4 py-3">
                    <div className="font-medium text-teal-700 text-sm">{value}</div>
                    <div className="text-teal-500 text-xs">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero image */}
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl shadow-teal-900/20">
              <Image
                src="/images/reuben-mansell-nwOip8AOZz0-unsplash.jpg"
                alt="Certified clean beauty products"
                fill
                className="object-cover blur-sm scale-105"
                priority
              />
              <div className="absolute inset-0 bg-teal-950/40" />
              {/* Certified badge overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="relative w-28 h-28 drop-shadow-2xl">
                  <Image
                    src="/images/certified-badge.png"
                    alt="The Clean Sheet™ Certified"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="bg-white/15 backdrop-blur-md border border-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-xl">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Founding Cohort Banner ────────────────────────── */}
      <section className="py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            <Image
              src="/images/cierra-henderson-LWIQp-0_b98-unsplash.jpg"
              alt=""
              fill
              className="object-cover"
              aria-hidden
            />
            <div className="absolute inset-0 bg-teal-900/90" />
            <div className="relative z-10 px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                  <Star size={20} className="text-gold-400" />
                </div>
                <div>
                  <div className="text-white font-medium text-lg">Founding Cohort, Now Accepting Applications</div>
                  <div className="text-teal-300 text-sm mt-0.5">Be among India's first Clean Sheet™ certified products.</div>
                </div>
              </div>
              <a
                href="#get-certified"
                className="flex-shrink-0 flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white font-normal px-6 py-3 rounded-2xl transition-all hover:shadow-lg hover:shadow-coral-500/30 active:scale-95 whitespace-nowrap"
              >
                Apply for Certification
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product Grid ──────────────────────────────────── */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Coming Soon wrapper, blurs the grid and shows overlay */}
          <div className="relative">
            {/* Blurred product grid */}
            <div className="blur-sm pointer-events-none select-none">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {PLACEHOLDER_PRODUCTS.map(({ name, brand, score, tier, category, image }) => {
                  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.good;
                  return (
                    <div
                      key={name}
                      className="bg-white rounded-3xl border border-teal-100 overflow-hidden"
                    >
                      {/* Product image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={image}
                          alt={name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-950/30" />
                        <div className="absolute top-3 right-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-5">
                        <div className="mb-3">
                          <h3 className="font-medium text-ink-950 leading-tight">{name}</h3>
                          <p className="text-ink-400 text-sm mt-0.5">{brand}</p>
                        </div>
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-ink-500">Clean Sheet Score</span>
                            <span className={`text-lg font-medium ${cfg.color}`}>{score}</span>
                          </div>
                          <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${score}%` }} />
                          </div>
                        </div>
                        <div className="text-xs bg-teal-50 text-teal-600 border border-teal-100 px-3 py-1.5 rounded-full font-medium inline-block">
                          {category}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coming Soon overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className="bg-white/92 backdrop-blur-md border border-teal-100 rounded-3xl px-10 py-10 text-center shadow-2xl shadow-teal-900/10 max-w-sm mx-4">
                <div className="relative w-24 h-24 mx-auto mb-5">
                  <Image
                    src="/images/certified-badge.png"
                    alt="The Clean Sheet™ Certified"
                    fill
                    className="object-contain drop-shadow-lg"
                  />
                </div>
                <h3 className="text-2xl font-medium text-ink-950 mb-2">Coming Soon</h3>
                <p className="text-ink-500 text-sm leading-relaxed mb-6">
                  Certified products will appear here once the founding cohort is complete. Applications are open now.
                </p>
                <a
                  href="#get-certified"
                  className="inline-flex items-center gap-2 bg-teal-800 hover:bg-teal-700 text-white font-normal px-6 py-3 rounded-2xl transition-all text-sm"
                  style={{ color: '#ffffff' }}
                >
                  Apply for Certification
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <div className="inline-block bg-white border border-teal-100 rounded-3xl p-10 shadow-sm max-w-lg w-full">
              <Award size={36} className="text-teal-600 mx-auto mb-4" />
              <h2 className="text-2xl font-medium text-ink-950 mb-3">Is your product ready?</h2>
              <p className="text-ink-600 mb-8 text-sm leading-relaxed">
                Apply for certification and join India's cleanest product directory. We're
                currently accepting founding cohort applications.
              </p>
              <a
                href="#get-certified"
                className="inline-flex items-center gap-2.5 bg-teal-800 hover:bg-teal-700 text-white font-normal px-6 py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-teal-800/25 active:scale-[0.98]"
              >
                Apply for Certification
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
