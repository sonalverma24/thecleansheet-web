import Link from "next/link";
import Image from "next/image";
import {
  Sparkles, ArrowRight, Shield, FlaskConical, Eye, Leaf,
  CheckCircle2, XCircle, ChevronRight, Microscope, Award,
  Users, TrendingUp, Star,
} from "lucide-react";

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-[100svh] sm:min-h-[96vh] flex items-center overflow-hidden bg-white">
      {/* Subtle background tint */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 60% at 10% 50%, rgba(36,129,121,0.05) 0%, transparent 70%)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center py-16 sm:py-20 lg:py-16">

          {/* Left, copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-500 text-ink-950 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-bold mb-6 sm:mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-ink-800 animate-pulse" />
              India&apos;s First Independent Beauty Safety Standard
            </div>

            <h1 className="text-[clamp(2rem,8vw,5rem)] font-bold tracking-tight leading-[1.06] text-ink-950 mb-4 sm:mb-6">
              You read the label.
              <br />
              <span className="text-teal-600">But can you trust it?</span>
            </h1>

            <p className="text-base sm:text-xl text-ink-500 max-w-xl leading-relaxed mb-7 sm:mb-10">
              India&apos;s first independent standard for beauty &amp; personal care.
              Because &ldquo;dermatologist tested&rdquo; isn&apos;t enough.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
              <Link href="/analyzer"
                className="group inline-flex items-center justify-center gap-2.5 bg-coral-500 hover:bg-coral-600 text-white font-bold px-6 py-3.5 sm:px-7 sm:py-4 rounded-2xl text-sm sm:text-base transition-all hover:shadow-2xl hover:shadow-coral-500/30 active:scale-[0.97]">
                <Sparkles size={17} />
                Analyze a Product, Free
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#get-certified"
                className="inline-flex items-center justify-center sm:justify-start gap-2 text-ink-600 hover:text-ink-950 font-medium text-sm sm:text-base transition-colors group sm:py-4">
                Get certified
                <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Sticker button — skin type guides */}
            <div className="mt-5 inline-block" style={{ transform: "rotate(-2deg)" }}>
              <Link
                href="/learn#skin-type-guides"
                className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-ink-950 font-bold text-sm px-4 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all active:scale-[0.96]"
              >
                ✦ Find your skin type guide
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-5 mt-7 sm:mt-10">
              {["25k+ Ingredients Scored", "EU · India · US Regulations", "No Paid Placements. Ever."].map(t => (
                <div key={t} className="flex items-center gap-2 text-ink-400 text-xs sm:text-sm">
                  <CheckCircle2 size={12} className="text-teal-500 flex-shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right, photo in a contained frame */}
          <div className="relative flex items-center justify-center mt-4 lg:mt-0">
            <div className="relative w-full max-w-[420px] sm:max-w-[520px] mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-ink-900/10 aspect-[4/5]">
              <Image
                src="/images/hero-illustration-2.jpg"
                alt="Woman holding a skincare product with a shelf of beauty products"
                fill
                className="object-cover object-center"
                priority
                quality={90}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Subtle vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/30 via-transparent to-transparent" />
            </div>

            {/* Score badge */}
            <div className="absolute bottom-4 sm:bottom-6 left-2 sm:-left-4 bg-white rounded-2xl shadow-xl shadow-ink-900/10 px-3 py-2.5 sm:px-5 sm:py-3.5 border border-ink-100">
              <div className="text-[10px] sm:text-xs text-ink-400 font-medium mb-0.5">Clean Sheet Score</div>
              <div className="text-2xl sm:text-3xl font-bold text-teal-600 leading-none">91</div>
              <div className="text-[10px] sm:text-xs font-bold text-ink-950 mt-1 bg-yellow-500 px-2 py-0.5 rounded-full inline-block">EXCELLENT ✦</div>
            </div>

            {/* Flag badge */}
            <div className="absolute top-4 sm:top-6 right-2 sm:-right-4 bg-white rounded-2xl shadow-xl shadow-ink-900/10 px-3 py-2.5 sm:px-4 sm:py-3 border border-coral-100 max-w-[155px] sm:max-w-[180px]">
              <div className="flex items-center gap-1.5 text-coral-600 text-[10px] sm:text-xs font-bold mb-1">
                <XCircle size={11} /> HIGH CONCERN
              </div>
              <div className="text-ink-700 text-[10px] sm:text-xs font-medium">DMDM Hydantoin</div>
              <div className="text-ink-400 text-[9px] sm:text-[11px]">Formaldehyde releaser</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   STATS BAR
───────────────────────────────────────────── */
function StatsBar() {
  return (
    <section className="bg-teal-600 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { v: "25k+", l: "Ingredients in database" },
            { v: "4",    l: "Certification tiers"     },
            { v: "6",    l: "Product categories"      },
            { v: "0",    l: "Paid placements. Ever."  },
          ].map(({ v, l }) => (
            <div key={l} className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">{v}</div>
              <div className="text-teal-200 text-xs sm:text-sm">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   VISUAL PROOF, 3 image cards
───────────────────────────────────────────── */
/* ── Card graphic 1: Ingredient database ── */
function GraphicDatabase() {
  const pills = [
    { label: "Parabens", color: "#ef4444" }, { label: "Retinol", color: "#10b981" },
    { label: "Niacinamide", color: "#10b981" }, { label: "DMDM Hydantoin", color: "#ef4444" },
    { label: "Glycerin", color: "#10b981" }, { label: "Oxybenzone", color: "#ef4444" },
    { label: "Squalane", color: "#10b981" }, { label: "MIT", color: "#ef4444" },
    { label: "Hyaluronic Acid", color: "#10b981" }, { label: "BHA", color: "#f59e0b" },
    { label: "Phenoxyethanol", color: "#f59e0b" }, { label: "Ceramides", color: "#10b981" },
  ];
  return (
    <div className="relative h-56 overflow-hidden flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0a2420 0%, #0f3d38 50%, #0e2d2a 100%)" }}>
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "linear-gradient(#5eead4 1px, transparent 1px), linear-gradient(90deg, #5eead4 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      {/* Floating dots */}
      {[[8,12],[88,8],[92,78],[5,82],[50,4],[50,92]].map(([x,y],i) => (
        <div key={i} className="absolute rounded-full bg-teal-400/20" style={{ width:6, height:6, left:`${x}%`, top:`${y}%` }} />
      ))}
      {/* Central counter */}
      <div className="relative z-10 text-center mb-3">
        <div className="text-5xl font-black text-white tracking-tight leading-none">25k<span className="text-teal-400">+</span></div>
        <div className="text-teal-300/70 text-[10px] font-semibold uppercase tracking-[0.2em] mt-1">Ingredients scored</div>
      </div>
      {/* Pill cloud */}
      <div className="relative z-10 flex flex-wrap justify-center gap-1.5 max-w-[280px]">
        {pills.map(({ label, color }) => (
          <span key={label} className="text-[9px] font-semibold px-2 py-0.5 rounded-full border"
            style={{ color, borderColor: color + "55", background: color + "18" }}>
            {label}
          </span>
        ))}
      </div>
      {/* Tag */}
      <span className="absolute bottom-4 left-4 text-xs font-bold text-ink-950 bg-yellow-400 px-3 py-1 rounded-full uppercase tracking-wide">Science-backed</span>
    </div>
  );
}

/* ── Card graphic 2: Natural vs Synthetic ── */
function GraphicNaturalSynthetic() {
  return (
    <div className="relative h-56 overflow-hidden"
      style={{ background: "linear-gradient(110deg, #f0fdf4 0%, #f8fafc 50%, #eff6ff 100%)" }}>
      {/* Divider */}
      <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-ink-200 to-transparent -translate-x-1/2" />

      {/* Left — Natural */}
      <div className="absolute left-0 inset-y-0 w-1/2 flex flex-col items-center justify-center gap-2 px-4">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="19" fill="#dcfce7" stroke="#86efac" strokeWidth="1.5"/>
          <path d="M20 32 C20 32 10 24 10 16 C10 11 14.5 8 20 8 C25.5 8 30 11 30 16 C30 24 20 32 20 32Z" fill="#4ade80" opacity="0.6"/>
          <path d="M20 32 L20 14" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M20 22 Q25 19 28 21" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
          <path d="M20 18 Q15 15 12 17" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        </svg>
        <span className="text-[11px] font-bold text-green-700 uppercase tracking-widest">Natural</span>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"/><span className="text-[9px] text-ink-500">Coconut Oil</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"/><span className="text-[9px] text-ink-500">Tea Tree (neat)</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"/><span className="text-[9px] text-ink-500">Essential Oils</span></div>
        </div>
      </div>

      {/* Right — Synthetic */}
      <div className="absolute right-0 inset-y-0 w-1/2 flex flex-col items-center justify-center gap-2 px-4">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="19" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.5"/>
          <circle cx="20" cy="20" r="5" fill="#3b82f6" opacity="0.7"/>
          <circle cx="20" cy="10" r="3" fill="#60a5fa" opacity="0.8"/>
          <circle cx="29" cy="25" r="3" fill="#60a5fa" opacity="0.8"/>
          <circle cx="11" cy="25" r="3" fill="#60a5fa" opacity="0.8"/>
          <line x1="20" y1="15" x2="20" y2="10" stroke="#93c5fd" strokeWidth="1.5"/>
          <line x1="24.3" y1="22.5" x2="29" y2="25" stroke="#93c5fd" strokeWidth="1.5"/>
          <line x1="15.7" y1="22.5" x2="11" y2="25" stroke="#93c5fd" strokeWidth="1.5"/>
        </svg>
        <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest">Synthetic</span>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"/><span className="text-[9px] text-ink-500">Niacinamide</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"/><span className="text-[9px] text-ink-500">Hyaluronic Acid</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"/><span className="text-[9px] text-ink-500">Formaldehyde</span></div>
        </div>
      </div>

      {/* VS badge */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-2 border-ink-100 flex items-center justify-center z-10 shadow-sm">
        <span className="text-[9px] font-black text-ink-400">VS</span>
      </div>

      {/* Tag */}
      <span className="absolute bottom-4 left-4 text-xs font-bold text-ink-950 bg-yellow-400 px-3 py-1 rounded-full uppercase tracking-wide z-10">Ingredient transparency</span>
    </div>
  );
}

/* ── Card graphic 3: QR / Scorecard ── */
function GraphicCertification() {
  /* 7×7 QR-like pattern — purely decorative */
  const qr = [
    [1,1,1,0,1,1,1],
    [1,0,1,0,1,0,1],
    [1,1,1,0,1,1,1],
    [0,0,0,0,0,1,0],
    [1,1,0,1,0,0,1],
    [1,0,1,0,1,0,0],
    [1,1,1,0,0,1,1],
  ];
  return (
    <div className="relative h-56 overflow-hidden flex items-center justify-center gap-7"
      style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f0fdfa 100%)" }}>
      {/* Subtle circles */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
        style={{ background: "radial-gradient(circle, #0d9488, transparent)" }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 translate-y-1/2 -translate-x-1/2"
        style={{ background: "radial-gradient(circle, #14b8a6, transparent)" }} />

      {/* QR code */}
      <div className="relative z-10 bg-white rounded-2xl p-3 shadow-lg border border-ink-100">
        <div className="grid gap-[2px]" style={{ gridTemplateColumns: "repeat(7, 10px)" }}>
          {qr.flat().map((cell, i) => (
            <div key={i} className="w-[10px] h-[10px] rounded-[2px]"
              style={{ background: cell ? "#0f2e2b" : "transparent" }} />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-md bg-teal-600 flex items-center justify-center shadow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
      </div>

      {/* Score card */}
      <div className="relative z-10 flex flex-col gap-2">
        <div className="bg-white rounded-2xl shadow-lg border border-ink-100 px-4 py-3 min-w-[110px]">
          <div className="text-[9px] font-semibold text-ink-400 uppercase tracking-widest mb-1">Clean Sheet Score</div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black text-teal-600 leading-none">87</span>
            <span className="text-ink-300 text-sm mb-0.5">/100</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-ink-100 overflow-hidden">
            <div className="h-full rounded-full bg-teal-500" style={{ width: "87%" }} />
          </div>
          <div className="mt-1.5 text-[9px] font-bold text-teal-600 uppercase tracking-wide">Good ✓</div>
        </div>
        <div className="bg-teal-600 text-white rounded-xl px-3 py-1.5 text-center">
          <div className="text-[9px] font-bold uppercase tracking-widest">Verified Certified</div>
        </div>
      </div>

      {/* Tag */}
      <span className="absolute bottom-4 left-4 text-xs font-bold text-ink-950 bg-yellow-400 px-3 py-1 rounded-full uppercase tracking-wide z-10">Real certification</span>
    </div>
  );
}

function VisualProof() {
  const cards = [
    {
      graphic: <GraphicDatabase />,
      heading: "25,000+ ingredients. Every one scored.",
      body: "Our database covers carcinogens, endocrine disruptors, sensitizers, and formaldehyde releasers, cross-referenced against EU, FDA, and Indian standards.",
    },
    {
      graphic: <GraphicNaturalSynthetic />,
      heading: "Not all natural is safe. Not all synthetic is harmful.",
      body: "We cut through the marketing noise. The analysis is based on the actual chemistry, not buzzwords like 'clean', 'green', or 'pure'.",
    },
    {
      graphic: <GraphicCertification />,
      heading: "A QR code that links to real proof.",
      body: "Every certified product gets a public scorecard. Scan the QR on the pack, see the score, the breakdown, the ingredients. Instantly.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <div className="text-coral-500 text-sm font-semibold uppercase tracking-wider mb-3">Why it matters</div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            The beauty industry runs on claims.
            <br />
            <span className="text-teal-600">We run on proof.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map(({ graphic, heading, body }) => (
            <div key={heading} className="group rounded-3xl overflow-hidden border border-ink-100 hover:shadow-2xl hover:shadow-ink-900/8 transition-all duration-500 hover:-translate-y-1 bg-white">
              {graphic}
              <div className="p-6">
                <h3 className="font-bold text-ink-900 text-lg mb-2 leading-snug">{heading}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   AI ANALYZER PREVIEW
───────────────────────────────────────────── */
function AnalyzerPreview() {
  return (
    <section className="py-16 sm:py-24 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Left copy */}
          <div>
            <div className="inline-flex items-center gap-2 text-coral-500 text-sm font-semibold mb-4 sm:mb-5 uppercase tracking-wide">
              <Sparkles size={14} /> AI-Powered Ingredient Analysis
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4 sm:mb-6">
              Paste a link.
              <br />Get the truth.
            </h2>
            <p className="text-ink-600 text-lg leading-relaxed mb-8">
              Drop any product URL from Nykaa, Amazon, or a brand website. Or paste the
              ingredient list. The AI reads every ingredient against our scientific database
              and returns a Clean Sheet Score with full breakdown.
            </p>
            <ul className="space-y-3.5 mb-10">
              {[
                "Detects banned & high-concern ingredients instantly",
                "Explains WHY each ingredient is flagged, in plain language",
                "Suggests science-backed safer alternatives",
                "Scores Safety, Efficacy, Transparency & Sustainability",
              ].map(t => (
                <li key={t} className="flex items-start gap-3 text-ink-700">
                  <CheckCircle2 size={18} className="text-teal-500 flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/analyzer"
              className="inline-flex items-center gap-2.5 bg-coral-500 hover:bg-coral-600 text-white font-semibold px-6 py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-coral-500/25 active:scale-[0.98]">
              <Sparkles size={16} /> Open Ask Clean
            </Link>
          </div>

          {/* Right mock UI */}
          <div className="relative">
            <div className="absolute -top-5 -right-5 z-20 bg-yellow-500 text-ink-950 text-xs font-bold px-4 py-2 rounded-full shadow-lg">LIVE AI ✦</div>
            <div className="bg-white rounded-[2rem] border border-ink-100 shadow-2xl shadow-ink-900/8 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 bg-teal-50 border-b border-teal-100">
                <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink-900">Ask Clean</div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-safe-500 animate-pulse" />
                    <span className="text-xs text-ink-500">Powered by Groq · Llama 3.3 70B</span>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="bg-teal-50 border border-teal-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[88%]">
                  <p className="text-ink-800 text-sm">Paste a product URL or ingredient list and I'll give you a full Clean Sheet analysis.</p>
                </div>
                <div className="flex justify-end">
                  <div className="bg-teal-600 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[88%]">
                    <p className="text-sm">https://nykaa.com/p/sunscreen-spf-50...</p>
                  </div>
                </div>
                <div className="bg-teal-50 border border-teal-100 rounded-2xl rounded-bl-sm px-4 py-4">
                  <p className="text-ink-700 text-sm mb-3">Analyzed! <strong className="text-coral-600">2 high-concern ingredients</strong> found:</p>
                  <div className="flex items-center gap-3 bg-white border border-ink-100 rounded-xl px-3 py-2.5 mb-3">
                    <div className="text-2xl font-bold text-ink-900">64</div>
                    <div>
                      <div className="text-xs font-bold text-caution-600 uppercase tracking-wide">FAIR</div>
                      <div className="text-xs text-ink-400">Clean Sheet Score</div>
                    </div>
                    <div className="ml-auto flex gap-1">
                      {[1,2,3,4].map(i => <div key={i} className={`w-5 h-1.5 rounded-full ${i<=2?'bg-caution-500':'bg-ink-100'}`} />)}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-coral-700 bg-coral-50 border border-coral-100 rounded-xl px-3 py-2.5">
                    <XCircle size={13} className="flex-shrink-0 mt-0.5" />
                    <span><strong>Oxybenzone</strong>, endocrine disruptor, coral reef toxin.</span>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="flex items-center gap-2 bg-ink-50 border border-ink-100 rounded-2xl px-4 py-3">
                  <span className="text-ink-400 text-sm flex-1 select-none">Paste URL or ingredient list...</span>
                  <div className="w-7 h-7 rounded-xl bg-coral-500 flex items-center justify-center">
                    <ArrowRight size={13} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FOUR PILLARS
───────────────────────────────────────────── */
function FourPillars() {
  const pillars = [
    { icon: Shield,      name: "Safety & Toxicity",     weight: "50%", color: "text-coral-500",    bg: "bg-coral-50"   },
    { icon: FlaskConical,name: "Efficacy & Formulation", weight: "20%", color: "text-teal-600",     bg: "bg-teal-50"    },
    { icon: Eye,         name: "Transparency",           weight: "20%", color: "text-gold-600",     bg: "bg-gold-50"    },
    { icon: Leaf,        name: "Sustainability & Ethics",weight: "10%", color: "text-safe-600",     bg: "bg-safe-100"   },
  ];
  const desc: Record<string,string> = {
    "Safety & Toxicity": "Carcinogenicity, endocrine disruption, reproductive toxicity, sensitization. The most weight, because safety is non-negotiable.",
    "Efficacy & Formulation": "Does the product do what it claims? Stability data, active ingredient concentrations, and performance testing.",
    "Transparency": "Complete INCI disclosure, no misleading marketing terms, fragrance allergen disclosure, honest labeling.",
    "Sustainability & Ethics": "Biodegradability, aquatic toxicity, ethical mica & palm oil sourcing, cruelty-free, packaging recyclability.",
  };

  return (
    <section className="py-16 sm:py-24 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section image banner */}
        <div className="relative h-56 lg:h-72 rounded-3xl overflow-hidden mb-16">
          <Image
            src="/images/cierra-henderson-LWIQp-0_b98-unsplash.jpg"
            alt="Clean beauty product"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-teal-950/90" />
          <div className="absolute inset-0 flex items-center px-10 lg:px-16">
            <div>
              <div className="inline-flex items-center gap-2 text-yellow-500 text-sm font-bold mb-3 uppercase tracking-wide">
                <Microscope size={14} /> The Scoring Framework
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight max-w-lg leading-tight">
                <span className="text-white">Four pillars. </span><span className="text-yellow-400">One honest score.</span>
              </h2>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map(({ icon: Icon, name, weight, color, bg }) => (
            <div key={name}
              className="group bg-white rounded-3xl p-7 border border-ink-100 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-100/50 transition-all duration-300 hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <Icon size={22} className={color} />
              </div>
              <div className={`text-3xl font-bold mb-1 ${color}`}>{weight}</div>
              <h3 className="font-semibold text-ink-900 mb-2">{name}</h3>
              <p className="text-ink-500 text-sm leading-relaxed">{desc[name]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   INGREDIENT MARQUEE
───────────────────────────────────────────── */
function IngredientStrip() {
  const terms = [
    "DMDM Hydantoin","Phenoxyethanol","Niacinamide","Oxybenzone",
    "Sodium Hyaluronate","Methylparaben","Ceramide NP","Triclosan",
    "Glycerin","Butylparaben","Squalane","Phthalates",
    "Centella Asiatica","Fragrance / Parfum","Bakuchiol","SLS",
  ];
  return (
    <div className="overflow-hidden bg-yellow-500 py-4 select-none">
      <div className="flex gap-10 whitespace-nowrap" style={{ animation: "marquee 30s linear infinite" }}>
        {[...terms,...terms].map((t,i)=>(
          <span key={i} className="text-ink-950 text-sm font-bold flex-shrink-0">
            {t} <span className="text-ink-800/40 mx-2">·</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CERTIFICATION TIERS
───────────────────────────────────────────── */
function CertificationTiers() {
  const tiers = [
    { s:"✦",l:"Excellent",r:"90–100",c:"text-ink-950",      bg:"bg-yellow-500/90", b:"border-yellow-400",    dc:"text-ink-800",    d:"Exceptional across all pillars. The gold standard for clean beauty."    },
    { s:"✓",l:"Good",      r:"75–89", c:"text-teal-200",    bg:"bg-teal-50/10",    b:"border-teal-300/60",  dc:"text-teal-200",   d:"Strong safety profile with minor areas for improvement."               },
    { s:"⚠",l:"Fair",      r:"60–74", c:"text-caution-100", bg:"bg-caution-600/10",b:"border-caution-500/50",dc:"text-caution-100",d:"Passes the threshold but has notable concerns worth watching."          },
    { s:"✗",l:"Fail",      r:"<60",   c:"text-coral-300",   bg:"bg-coral-500/10",  b:"border-coral-400/50", dc:"text-coral-200",  d:"Contains banned substances or fails critical safety criteria."         },
  ];
  return (
    <section className="relative py-16 sm:py-24 lg:py-28 overflow-hidden">
      {/* Full-bleed image */}
      <div className="absolute inset-0">
        <Image
          src="/images/kitera-dent-hHsn1Pjrw58-unsplash.jpg"
          alt="Premium face serum"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-teal-950/92" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-yellow-500 text-sm font-bold mb-4 uppercase tracking-wide">
            <Award size={14} /> Certification Tiers
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4" style={{ color: '#ffffff' }}>No middle ground.</h2>
          <p className="text-teal-300 text-lg max-w-lg mx-auto">Products earn their clean claim, or they don't.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map(({s,l,r,c,bg,b,d,dc})=>(
            <div key={l} className={`rounded-3xl p-7 border ${b} ${bg} backdrop-blur-sm hover:scale-[1.02] transition-transform cursor-default`}>
              <div className={`text-4xl mb-3 ${c}`}>{s}</div>
              <div className={`text-xl font-bold mb-0.5 ${c}`}>{l}</div>
              <div className={`text-sm font-mono ${c} opacity-70 mb-4`}>{r} pts</div>
              <p className={`text-sm leading-relaxed ${dc}`}>{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-teal-400 text-sm mb-5">Auto-fail if product contains banned substances, undisclosed allergens, or formaldehyde releasers.</p>
          <Link href="/learn#scoring" className="inline-flex items-center gap-2 text-teal-300 hover:text-white text-sm font-medium transition-colors">
            Read the full scoring methodology <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FOR BRANDS
───────────────────────────────────────────── */
function ForBrands() {
  return (
    <section className="py-16 sm:py-24 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left, image with overlay card */}
          <div className="relative order-2 lg:order-1">
            <div className="relative h-[500px] rounded-3xl overflow-hidden">
              <Image
                src="/images/reuben-mansell-nwOip8AOZz0-unsplash.jpg"
                alt="Premium certified skincare product lineup"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-950/50 via-transparent to-transparent" />
            </div>
            {/* Floating scorecard */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl border border-ink-100 shadow-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-ink-400 uppercase tracking-wider mb-1">Clean Sheet Score</div>
                  <div className="text-4xl font-bold text-ink-900 leading-none">84</div>
                  <div className="text-xs font-bold text-teal-600 mt-1 uppercase tracking-wide">Good ✓</div>
                </div>
                <svg width="72" height="72" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="28" fill="none" stroke="#D4F2EF" strokeWidth="7" />
                  <circle cx="36" cy="36" r="28" fill="none" stroke="#248179" strokeWidth="7"
                    strokeDasharray={`${(84/100)*176} 176`} strokeLinecap="round" transform="rotate(-90 36 36)" />
                  <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill="#262525" fontFamily="serif">84</text>
                </svg>
              </div>
              <div className="space-y-2">
                {[["Safety & Toxicity","bg-teal-500",84],["Efficacy","bg-teal-400",80],["Transparency","bg-gold-400",95]].map(([l,c,p])=>(
                  <div key={l as string}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-ink-500">{l as string}</span>
                      <span className="text-ink-700 font-semibold">{p as number}%</span>
                    </div>
                    <div className="h-1 bg-ink-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${c as string}`} style={{width:`${p as number}%`}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right copy */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 text-teal-600 text-sm font-semibold mb-5 uppercase tracking-wide">
              <Users size={14} /> For Brands & Manufacturers
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
              Build trust that
              <br />can't be faked.
            </h2>
            <p className="text-ink-600 text-lg leading-relaxed mb-8">
              Consumers are reading labels now. The Clean Sheet™ certification is proof,
              not a promise. Every certified product carries a public scorecard, not just a badge.
            </p>
            <div className="space-y-3.5 mb-10">
              {[
                "Product-level certification, not brand-level",
                "Public scorecard with full pillar breakdown",
                "QR code on packaging links directly to your score",
                "Annual re-certification keeps scores current",
              ].map(t=>(
                <div key={t} className="flex items-center gap-3 text-ink-700">
                  <CheckCircle2 size={18} className="text-teal-500 flex-shrink-0" />
                  {t}
                </div>
              ))}
            </div>
            <a href="#get-certified"
              className="inline-flex items-center gap-2.5 bg-coral-500 hover:bg-coral-600 text-white font-semibold px-6 py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-coral-500/25 active:scale-[0.98]">
              Apply for Certification <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────── */
function StepGraphicSubmit() {
  const docs = ["INCI List.pdf", "TDS.pdf", "MSDS.pdf", "COA.pdf", "Lab Report.pdf"];
  return (
    <div className="relative h-48 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-3 px-5"
      style={{ background: "linear-gradient(135deg, #f0fdf9 0%, #ccfbf1 60%, #e0f7f4 100%)" }}>
      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: "radial-gradient(#0d9488 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
      {/* Step number */}
      <div className="absolute top-4 left-4 text-5xl font-black leading-none select-none" style={{ color: "#0d948822" }}>01</div>
      {/* Portal card */}
      <div className="relative z-10 bg-white rounded-xl shadow-md border border-teal-100 w-full max-w-[220px] p-3">
        <div className="text-[9px] font-bold uppercase tracking-widest text-teal-600 mb-2">Verification Portal</div>
        <div className="space-y-1.5">
          {docs.map((doc, i) => (
            <div key={doc} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: i < 3 ? "#d1fae5" : "#fef3c7" }}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <rect x="1" y="0.5" width="8" height="11" rx="1.5" fill={i < 3 ? "#10b981" : "#f59e0b"} fillOpacity="0.3" stroke={i < 3 ? "#10b981" : "#f59e0b"} strokeWidth="0.8"/>
                  <line x1="3" y1="4" x2="7" y2="4" stroke={i < 3 ? "#10b981" : "#f59e0b"} strokeWidth="0.8"/>
                  <line x1="3" y1="6" x2="7" y2="6" stroke={i < 3 ? "#10b981" : "#f59e0b"} strokeWidth="0.8"/>
                </svg>
              </div>
              <span className="text-[10px] text-ink-600 font-medium flex-1">{doc}</span>
              {i < 3 && <svg width="10" height="10" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="#10b981"/><path d="M3.5 6l1.8 1.8L8.5 4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
            </div>
          ))}
        </div>
        <div className="mt-2.5 w-full bg-teal-600 rounded-lg py-1.5 text-center text-white text-[9px] font-bold tracking-wide">
          Submit for Review →
        </div>
      </div>
    </div>
  );
}

function StepGraphicAnalysis() {
  const rows = [
    { name: "Niacinamide",        risk: "Safe",     color: "#10b981", bar: 95 },
    { name: "Glycerin",           risk: "Safe",     color: "#10b981", bar: 98 },
    { name: "Phenoxyethanol",     risk: "Caution",  color: "#f59e0b", bar: 52 },
    { name: "DMDM Hydantoin",     risk: "Flag",     color: "#ef4444", bar: 18 },
    { name: "Hyaluronic Acid",    risk: "Safe",     color: "#10b981", bar: 97 },
  ];
  return (
    <div className="relative h-48 rounded-2xl overflow-hidden flex flex-col justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0f1a2e 0%, #0a2420 60%, #0f2d38 100%)" }}>
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: "linear-gradient(#5eead4 1px, transparent 1px), linear-gradient(90deg, #5eead4 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="absolute top-4 left-4 text-5xl font-black leading-none select-none" style={{ color: "#ffffff08" }}>02</div>
      {/* Header */}
      <div className="relative z-10 flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        <span className="text-teal-300 text-[9px] font-bold uppercase tracking-widest">Analyzing ingredients…</span>
      </div>
      {/* Rows */}
      <div className="relative z-10 space-y-1.5">
        {rows.map(({ name, risk, color, bar }) => (
          <div key={name} className="flex items-center gap-2">
            <span className="text-[9px] text-white/70 w-[108px] truncate font-mono">{name}</span>
            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${bar}%`, background: color }} />
            </div>
            <span className="text-[9px] font-bold w-10 text-right" style={{ color }}>{risk}</span>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="relative z-10 flex gap-3 mt-2.5">
        {[["#10b981","Safe"],["#f59e0b","Caution"],["#ef4444","Flag"]].map(([c,l])=>(
          <div key={l} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
            <span className="text-[8px] text-white/40">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepGraphicPublish() {
  const qr = Array.from({ length: 6 }, (_, r) =>
    Array.from({ length: 6 }, (_, c) => [0,1,3,4].includes(r) && [0,1,3,4].includes(c) ? "corner" :
      (r + c * 3 + r * c) % 3 === 0 ? "fill" : "empty")
  );
  return (
    <div className="relative h-48 rounded-2xl overflow-hidden flex items-center justify-center gap-5 px-5"
      style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef9ee 50%, #f0fdf9 100%)" }}>
      <div className="absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: "radial-gradient(#0d9488 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      <div className="absolute top-4 left-4 text-5xl font-black leading-none select-none" style={{ color: "#0d948818" }}>03</div>
      {/* QR code block */}
      <div className="relative z-10 bg-white rounded-xl p-2.5 shadow-md border border-teal-100 flex-shrink-0">
        <div className="grid gap-[2px]" style={{ gridTemplateColumns: "repeat(6,10px)" }}>
          {qr.flat().map((cell, i) => (
            <div key={i} className="w-[10px] h-[10px] rounded-[1px]"
              style={{ background: cell === "empty" ? "#f1f5f9" : "#0f3d38" }} />
          ))}
        </div>
        <div className="mt-1.5 text-center text-[7px] font-bold text-teal-700 tracking-wider">SCAN TO VERIFY</div>
      </div>
      {/* Score card */}
      <div className="relative z-10 flex flex-col gap-2">
        <div className="bg-white rounded-xl shadow-md border border-teal-100 px-3.5 py-2.5 min-w-[110px]">
          <div className="text-[8px] font-bold uppercase tracking-widest text-ink-400 mb-0.5">Clean Sheet Score</div>
          <div className="text-3xl font-black text-teal-700 leading-none">91</div>
          <div className="flex items-center gap-1 mt-1">
            <div className="h-1 flex-1 rounded-full bg-ink-100 overflow-hidden">
              <div className="h-full w-[91%] rounded-full bg-teal-500" />
            </div>
            <span className="text-[8px] font-bold text-teal-600">Excellent</span>
          </div>
        </div>
        <div className="bg-teal-700 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="0.8"/>
            <path d="M3.5 6l1.8 1.8L8.5 4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span className="text-[9px] font-bold text-white tracking-wide">CERTIFIED ✦</span>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { n:"01", title:"Submit your formulation",    body:"Complete INCI lists, TDS, MSDS, COA, and independent lab results through our verification portal.", graphic: <StepGraphicSubmit /> },
    { n:"02", title:"We analyze every ingredient", body:"Each ingredient evaluated for toxicity, exposure risk, sensitization, and regulatory compliance across EU, FDA, and Indian standards.", graphic: <StepGraphicAnalysis /> },
    { n:"03", title:"Score. Certify. Publish.",    body:"Products receive a Clean Sheet Score and tier. A QR code links to the public scorecard for real-time consumer verification.", graphic: <StepGraphicPublish /> },
  ];
  return (
    <section className="py-16 sm:py-24 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-teal-600 text-sm font-semibold mb-4 uppercase tracking-wide">
            <Star size={14} /> The Certification Process
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">Proof, not promises.</h2>
          <p className="text-ink-600 text-lg max-w-lg mx-auto">Every certification is backed by verified documents. No exceptions.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({n,title,body,graphic})=>(
            <div key={n} className="group">
              <div className="mb-6">{graphic}</div>
              <h3 className="text-xl font-bold text-ink-900 mb-2">{title}</h3>
              <p className="text-ink-500 leading-relaxed text-sm">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   CTA BANNER
───────────────────────────────────────────── */
function CTABanner() {
  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #f0fdf9 0%, #ccfbf1 40%, #fef9ee 100%)" }}>
        {/* Dot grid texture */}
        <div className="absolute inset-0 opacity-[0.15]"
          style={{ backgroundImage: "radial-gradient(#0d9488 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        {/* Radial glow center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[600px] rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, #5eead4 0%, transparent 70%)" }} />
        </div>
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-4xl lg:text-6xl font-bold tracking-tight mb-5 leading-tight">
          Ready to know what's really
          <br /><span className="text-gradient-coral">in your products?</span>
        </h2>
        <p className="text-ink-600 text-xl mb-12 max-w-lg mx-auto">
          Try Ask Clean free. No sign-up required. Just paste and get the truth.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/analyzer"
            className="flex items-center gap-2.5 bg-coral-500 hover:bg-coral-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all hover:shadow-2xl hover:shadow-coral-500/30 active:scale-[0.98] text-lg">
            <Sparkles size={18} /> Try Ask Clean, Free
          </Link>
          <a href="#get-certified"
            className="flex items-center gap-2 text-ink-700 hover:text-ink-950 font-medium text-base transition-colors">
            Get your product certified →
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <VisualProof />
      <AnalyzerPreview />
      <FourPillars />
      <IngredientStrip />
      <CertificationTiers />
      <ForBrands />
      <HowItWorks />
      <CTABanner />
    </>
  );
}
