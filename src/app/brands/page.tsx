import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2, ArrowRight, Award, Shield, FlaskConical, Eye, Leaf,
  QrCode, FileText, RefreshCw, Users, Star, Zap
} from "lucide-react";

function GraphicWhyItMatters() {
  const bars = [
    { year: "2021", h: 38, active: false },
    { year: "2022", h: 52, active: false },
    { year: "2023", h: 68, active: false },
    { year: "2024", h: 84, active: false },
    { year: "2025", h: 100, active: true  },
  ];
  return (
    <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl shadow-teal-900/20 flex flex-col"
      style={{ background: "linear-gradient(140deg, #0a1f1c 0%, #0f3d38 55%, #0a2420 100%)" }}>
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(#5eead4 1px, transparent 1px), linear-gradient(90deg, #5eead4 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      {/* Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #14b8a6, transparent)" }} />

      {/* Top label */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-5 pb-2">
        <div>
          <div className="text-teal-300/60 text-[9px] font-bold uppercase tracking-[0.2em]">India Beauty Market</div>
          <div className="text-white text-base font-black mt-0.5">
            18<span className="text-teal-400">%</span>
            <span className="text-teal-300/70 text-[11px] font-semibold ml-1.5">annual growth</span>
          </div>
        </div>
        <div className="bg-teal-400/10 border border-teal-400/20 rounded-xl px-3 py-1.5">
          <div className="text-teal-300 text-[9px] font-bold uppercase tracking-widest">Trust Gap ↑</div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="relative z-10 flex items-end justify-center gap-3 px-6 flex-1 pb-4">
        {bars.map(({ year, h, active }) => (
          <div key={year} className="flex flex-col items-center gap-1.5 flex-1">
            <div className="w-full rounded-t-lg transition-all relative"
              style={{
                height: `${h * 0.72}px`,
                background: active
                  ? "linear-gradient(180deg, #2dd4bf 0%, #0d9488 100%)"
                  : "linear-gradient(180deg, #134e4a 0%, #0f3d38 100%)",
                border: active ? "1px solid #2dd4bf55" : "1px solid #1a5c5640",
              }}>
              {active && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-teal-400 text-ink-950 text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                  18% ↑
                </div>
              )}
            </div>
            <div className="text-[9px] font-semibold" style={{ color: active ? "#5eead4" : "#4d7c78" }}>{year}</div>
          </div>
        ))}
      </div>

      {/* Bottom row — claim vs proof */}
      <div className="relative z-10 flex items-center gap-3 px-5 pb-5">
        <div className="flex-1 bg-red-950/40 border border-red-500/20 rounded-xl px-3 py-2.5">
          <div className="text-red-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">Without proof</div>
          <div className="text-red-300/70 text-[10px] font-medium">"Natural™" claims backfiring</div>
        </div>
        <div className="text-teal-400/50 font-black text-sm flex-shrink-0">→</div>
        <div className="flex-1 bg-teal-400/10 border border-teal-400/25 rounded-xl px-3 py-2.5">
          <div className="text-teal-300 text-[9px] font-bold uppercase tracking-widest mb-0.5">With proof</div>
          <div className="text-teal-200/80 text-[10px] font-medium">Score 91 · CERTIFIED ✦</div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "For Brands, The Clean Sheet™",
  description: "Get your beauty products certified by India's most rigorous clean beauty standard.",
};

const PROCESS_STEPS = [
  {
    step: "01",
    icon: FileText,
    title: "Submit Documentation",
    description:
      "Provide complete INCI lists, technical datasheets (TDS), safety data sheets (MSDS), certificates of analysis (COA), and independent lab test results.",
  },
  {
    step: "02",
    icon: Shield,
    title: "Ingredient-Level Evaluation",
    description:
      "Every ingredient is assessed for toxicity, exposure risk, regulatory compliance (EU, FDA, India), sensitization, and formaldehyde-releasing potential.",
  },
  {
    step: "03",
    icon: Star,
    title: "Efficacy & Transparency Review",
    description:
      "We verify that marketing claims are supported by evidence, INCI disclosure is complete, and there are no misleading 'clean beauty' marketing terms.",
  },
  {
    step: "04",
    icon: Award,
    title: "Score Assignment & Certification",
    description:
      "Products receive a Clean Sheet Score (0–100), a certification tier, a public scorecard, and a QR code for packaging integration.",
  },
];

const TIERS = [
  {
    icon: "✦",
    name: "Excellent",
    range: "90–100",
    textColor: "text-safe-600",
    bg: "bg-safe-100",
    border: "border-safe-600/30",
    highlight: true,
    perks: [
      "Premium certification badge",
      "Priority listing in directory",
      "Press release support",
      "Marketing toolkit",
    ],
  },
  {
    icon: "✓",
    name: "Good",
    range: "75–89",
    textColor: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
    highlight: false,
    perks: [
      "Standard certification badge",
      "Directory listing",
      "QR scorecard link",
      "Annual re-evaluation",
    ],
  },
  {
    icon: "⚠",
    name: "Fair",
    range: "60–74",
    textColor: "text-caution-600",
    bg: "bg-caution-100",
    border: "border-caution-600/30",
    highlight: false,
    perks: [
      "Conditional badge (Fair tier)",
      "Improvement roadmap",
      "Re-submission after improvements",
      "Formulation guidance",
    ],
  },
];

const WHY_ITEMS = [
  {
    icon: Users,
    title: "Consumers are reading labels",
    description:
      "74% of Indian beauty consumers now check ingredients before buying. Clean Sheet certification gives them instant, verified proof.",
  },
  {
    icon: QrCode,
    title: "QR code on every pack",
    description:
      "A QR code links directly to your product's public scorecard. Scan it at the store, full transparency at the point of sale.",
  },
  {
    icon: Zap,
    title: "Product-level, not brand-level",
    description:
      "We certify individual products, not entire brands. That means your certifications are specific, credible, and not blanket statements.",
  },
  {
    icon: RefreshCw,
    title: "Continuous validation",
    description:
      "Annual re-certification ensures your scores stay current. Reformulations trigger a new review, no dormant badges.",
  },
];

export default function BrandsPage() {
  return (
    <div className="bg-white">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-[640px] flex items-center overflow-hidden">
        {/* Background image */}
        <Image
          src="/images/cierra-henderson-LWIQp-0_b98-unsplash.jpg"
          alt="Clean beauty product"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark teal gradient overlay */}
        <div className="absolute inset-0 bg-teal-950/90" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-teal-200 text-xs sm:text-sm font-medium px-3 py-1 sm:px-4 sm:py-1.5 rounded-full mb-6 sm:mb-8 backdrop-blur-sm">
              <Users size={13} />
              For Brands &amp; Manufacturers
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight mb-4 sm:mb-6" style={{ color: '#ffffff' }}>
              Certify what
              <br />
              <span style={{ color: '#5eead4' }}>you&apos;ve built.</span>
            </h1>
            <p className="text-teal-200 text-base sm:text-xl leading-relaxed mb-7 sm:mb-10 max-w-xl">
              The Clean Sheet™ certification is India's most rigorous product-level safety
              standard. If your formulation is clean, prove it, not with a claim, with a score.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                href="#get-certified"
                className="flex items-center justify-center gap-2 bg-coral-500 hover:bg-coral-600 text-white font-semibold px-6 py-3.5 sm:px-7 sm:py-4 rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-coral-500/30 active:scale-[0.98] text-sm sm:text-base"
              >
                Apply for Certification
                <ArrowRight size={15} />
              </a>
              <a
                href="#process"
                className="flex items-center justify-center gap-2 border border-white/30 hover:border-white/60 text-white font-medium px-6 py-3.5 sm:px-7 sm:py-4 rounded-2xl transition-all duration-200 backdrop-blur-sm text-sm sm:text-base"
              >
                See the Process
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────── */}
      <div className="bg-teal-900 py-4 sm:py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-16">
            {[
              { value: "0–100", label: "Transparent scoring" },
              { value: "4 pillars", label: "Safety · Efficacy · Transparency · Sustainability" },
              { value: "EU / FDA / India", label: "Multi-regulatory reference" },
              { value: "QR verified", label: "Consumer-facing scorecards" },
            ].map(({ value, label }) => (
              <div key={value} className="text-center">
                <div className="text-teal-300 font-bold text-sm sm:text-lg">{value}</div>
                <div className="text-teal-500 text-[10px] sm:text-xs mt-0.5 leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Why it matters ────────────────────────────────── */}
      <section className="py-14 sm:py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-12 sm:mb-20">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-950 tracking-tight mb-4 sm:mb-6">
                Why it matters now.
              </h2>
              <p className="text-ink-600 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                The Indian beauty market is growing at 18% annually. But consumer trust is the
                new battleground, and "clean" claims without evidence are backfiring.
              </p>
              <p className="text-ink-600 text-base sm:text-lg leading-relaxed">
                Clean Sheet certification is not a marketing tool. It's a technical standard.
                Brands that earn it stand apart in a crowded market with proof, not promises.
              </p>
            </div>
            <GraphicWhyItMatters />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_ITEMS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-3xl p-6 border border-teal-100 hover:shadow-lg hover:shadow-teal-100 transition-all duration-300 hover:-translate-y-1">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-teal-600" />
                </div>
                <h3 className="font-bold text-ink-950 mb-2">{title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────── */}
      <section id="process" className="py-14 sm:py-24 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-ink-950 tracking-tight mb-4">
              The certification process.
            </h2>
            <p className="text-ink-600 text-lg max-w-xl mx-auto">
              Four stages. Every product goes through all of them. No shortcuts.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map(({ step, icon: Icon, title, description }) => (
              <div key={step} className="relative group">
                <div className="bg-white rounded-3xl p-6 h-full border border-transparent hover:border-teal-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-teal-800 flex items-center justify-center">
                      <Icon size={20} className="text-teal-200" />
                    </div>
                    <span className="text-4xl font-bold text-teal-50 group-hover:text-teal-100 transition-colors">
                      {step}
                    </span>
                  </div>
                  <h3 className="font-bold text-ink-950 mb-2">{title}</h3>
                  <p className="text-ink-500 text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tiers ─────────────────────────────────────────── */}
      <section id="tiers" className="relative py-14 sm:py-24 lg:py-28 overflow-hidden">
        {/* Subtle bg image */}
        <Image
          src="/images/valeriia-miller-_42NKYROG7g-unsplash.jpg"
          alt=""
          fill
          className="object-cover opacity-5"
          aria-hidden
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-ink-950 tracking-tight mb-4">
              Certification tiers.
            </h2>
            <p className="text-ink-600 text-lg max-w-xl mx-auto">
              Your score determines your tier. The tier reflects the real safety and transparency
              of your formulation, not your marketing budget.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TIERS.map(({ icon, name, range, textColor, bg, border, highlight, perks }) => (
              <div
                key={name}
                className={`rounded-3xl p-8 border-2 ${border} ${bg} ${highlight ? "ring-2 ring-teal-500 ring-offset-4 ring-offset-cream-50" : ""} relative`}
              >
                {highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-teal-800 text-white text-xs font-bold px-4 py-1 rounded-full tracking-wide">
                    MOST SOUGHT AFTER
                  </div>
                )}
                <div className={`text-4xl mb-3 ${textColor}`}>{icon}</div>
                <div className={`text-2xl font-bold mb-1 ${textColor}`}>{name}</div>
                <div className={`text-sm font-mono ${textColor} opacity-70 mb-6`}>{range} points</div>
                <ul className="space-y-3">
                  {perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2.5 text-ink-700 text-sm">
                      <CheckCircle2 size={15} className="text-teal-500 flex-shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / Apply ───────────────────────────────── */}
      <section id="contact" className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-xl">
              <Image
                src="/images/reuben-mansell-nwOip8AOZz0-unsplash.jpg"
                alt="Product packaging quality"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-teal-950/60 to-transparent" />
              <div className="absolute top-6 left-6">
                <div className="bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm font-semibold px-4 py-2 rounded-xl">
                  Founding Cohort, Open
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-ink-950 tracking-tight mb-4">
                Ready to get certified?
              </h2>
              <p className="text-ink-600 text-lg leading-relaxed mb-8">
                We're accepting applications for India's founding cohort of Clean Sheet™
                certified brands. Fill out the form and we'll be in touch within 48 hours.
              </p>
              <div className="space-y-4">
                <a
                  id="apply"
                  href="#get-certified"
                  className="flex items-center justify-center gap-2.5 bg-coral-500 hover:bg-coral-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-coral-500/30 active:scale-[0.98] text-lg w-full sm:w-auto sm:inline-flex"
                >
                  Apply Now
                  <ArrowRight size={18} />
                </a>
                <p className="text-ink-400 text-sm">
                  Or email us at{" "}
                  <a href="mailto:hello@thecleansheet.in" className="text-teal-600 hover:underline">
                    hello@thecleansheet.in
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
