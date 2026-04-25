import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Heart, FlaskConical, Eye } from "lucide-react";

export const metadata = {
  title: "About, The Clean Sheet™",
  description: "India's first science-backed clean beauty certification standard.",
};

export default function AboutPage() {
  return (
    <div className="bg-white">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-teal-600 bg-teal-50 border border-teal-200 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
                <Heart size={14} />
                Our Mission
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-ink-950 tracking-tight leading-tight mb-8">
                Evidence over
                <br />
                <span className="text-gradient-teal">marketing.</span>
              </h1>
              <p className="text-xl text-ink-600 leading-relaxed mb-6 max-w-xl">
                The Indian beauty industry is worth $28 billion and growing. But clean beauty
                has no legal definition. Brands use "natural", "pure", "chemical-free" freely,
                with no accountability.
              </p>
              <p className="text-xl text-ink-600 leading-relaxed max-w-xl">
                The Clean Sheet™ was built to change that. We created India's first
                ingredient-level, science-backed certification that means something real.
              </p>
            </div>

            {/* Hero imagery */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden aspect-square shadow-2xl shadow-teal-900/20">
                <Image
                  src="/images/evidence-over-marketing.jpg"
                  alt="Scanning product ingredients, evidence over marketing"
                  fill
                  className="object-cover blur-[2px] scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-teal-950/60" />
                {/* Scanning magnifying glass overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Scan line animation */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl">
                    <div className="absolute left-0 right-0 h-[2px] bg-teal-400/60"
                      style={{ animation: "scanline 2.8s ease-in-out infinite", top: "20%" }} />
                  </div>
                  {/* Magnifying glass */}
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full border-4 border-white/90 shadow-2xl shadow-black/40 backdrop-blur-[1px] bg-white/10 flex items-center justify-center">
                      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}>
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                      </svg>
                    </div>
                    {/* Handle */}
                    <div className="absolute bottom-[-28px] right-[-28px] w-[4px] h-10 bg-white/80 rounded-full rotate-45 origin-top shadow-lg" />
                  </div>
                </div>
                <style>{`
                  @keyframes scanline {
                    0%   { top: 15%; opacity: 0; }
                    10%  { opacity: 1; }
                    85%  { opacity: 1; }
                    100% { top: 80%; opacity: 0; }
                  }
                `}</style>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 border border-teal-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0">
                    <Shield size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ink-950">Science-backed</div>
                    <div className="text-xs text-ink-500">EU SCCS · IFRA · EWG aligned</div>
                  </div>
                </div>
              </div>
              {/* Floating score pill */}
              <div className="absolute top-6 -right-4 bg-white rounded-2xl shadow-xl px-4 py-3 border border-teal-100">
                <div className="text-2xl font-bold text-teal-600">93</div>
                <div className="text-xs text-ink-400">Clean Sheet Score</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What we believe ───────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-ink-950 tracking-tight mb-3">
              What we stand for.
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Safety is non-negotiable.",
                description:
                  "50% of our score is safety. Because no amount of great packaging or clever marketing justifies a product that contains carcinogens or endocrine disruptors.",
                image: "/images/toa-heftiba-GLl6_-L3fxM-unsplash.jpg",
              },
              {
                icon: FlaskConical,
                title: "Proof is the product.",
                description:
                  "We don't accept brand declarations. We verify documents. Technical data sheets, lab results, safety tests, all on file before a single badge is issued.",
                image: "/images/maria-lupan-9PnU-U7V6YE-unsplash.jpg",
              },
              {
                icon: Heart,
                title: "Consumers deserve the truth.",
                description:
                  "Our public scorecards are free, permanent, and linked via QR on packaging. Any consumer can verify any certified product, any time.",
                image: "/images/good-skin-club-kB0w9XDqGS0-unsplash.jpg",
              },
            ].map(({ icon: Icon, title, description, image }) => (
              <div key={title} className="rounded-3xl overflow-hidden border border-teal-100 group">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-950/60" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                      <Icon size={18} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6">
                  <h3 className="text-xl font-bold text-ink-950 mb-3">{title}</h3>
                  <p className="text-ink-600 leading-relaxed text-sm">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The gap we fill ───────────────────────────────── */}
      <section id="mission" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-ink-950 tracking-tight mb-6">
                The gap in India's
                <br />
                beauty market.
              </h2>
              <div className="space-y-4 text-ink-600 text-lg leading-relaxed">
                <p>
                  India follows the Drugs and Cosmetics Act, which has no specific provision
                  for "clean" or "natural" claims. A brand can print "chemical-free" on any
                  bottle and face no legal consequence.
                </p>
                <p>
                  Meanwhile, consumers are paying premium prices for products marketed as
                  "safe" and "clean" that contain parabens, formaldehyde releasers, and
                  endocrine disruptors.
                </p>
                <p>
                  The Clean Sheet fills this gap with a voluntary, science-driven certification
                  inspired by the EU's SCCS guidelines, IFRA standards, and the EWG's rigour,
                  but built for India's market and consumer context.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-3xl border border-teal-100 p-8 shadow-lg shadow-teal-50">
              <h3 className="text-ink-950 font-bold text-lg mb-6">The numbers don't lie.</h3>
              <div className="space-y-5">
                {[
                  { label: "Products with misleading 'clean' claims", pct: 73, color: "bg-danger-500" },
                  { label: "Consumers who check ingredients", pct: 74, color: "bg-safe-500" },
                  { label: "Brands that disclose full INCI lists", pct: 41, color: "bg-caution-500" },
                  { label: "Growth in clean beauty demand (2024–25)", pct: 68, color: "bg-teal-500" },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-ink-700 font-medium">{label}</span>
                      <span className="text-ink-950 font-bold">{pct}%</span>
                    </div>
                    <div className="h-2.5 bg-ink-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-400 pt-4 border-t border-ink-100 mt-4">
                Source: Vogue India Beauty Report 2024, internal research
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ── Founding quote ────────────────────────────────── */}
      <section className="py-24 lg:py-28 relative overflow-hidden">
        <Image
          src="/images/cierra-henderson-LWIQp-0_b98-unsplash.jpg"
          alt=""
          fill
          className="object-cover"
          aria-hidden
        />
        <div className="absolute inset-0 bg-teal-950/88" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-teal-400 text-sm font-medium tracking-widest uppercase mb-6">Est. 2025 · India</div>
          <blockquote className="text-3xl lg:text-4xl font-bold text-white leading-snug mb-8 tracking-tight">
            "Clean beauty isn't a legal category in India.
            It's a marketing term. We're building the standard
            that changes that."
          </blockquote>
          <p className="text-teal-400 mb-10">The Clean Sheet™</p>
          <Link
            href="/analyzer"
            className="inline-flex items-center gap-2.5 bg-coral-500 hover:bg-coral-600 text-white font-semibold px-7 py-4 rounded-2xl transition-all hover:shadow-xl hover:shadow-coral-500/30 active:scale-[0.98]"
          >
            <Sparkles size={16} />
            Try Ask Clean
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
