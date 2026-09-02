import Link from "next/link";
import Image from "next/image";
import {
  Sparkles, ArrowRight,
  CheckCircle2, XCircle, ChevronRight,
  Users, Star,
} from "lucide-react";
import { Reveal, TitleReveal, HeroReveal } from "@/components/motion/Motion";
import OpenFormButton from "@/components/OpenFormButton";
import { ApprovedStamp } from "@/components/scorecards/pillar-ui";

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero() {
  const scorecard = (
    <div className="rounded-2xl bg-white/90 backdrop-blur-md border border-white/70 shadow-2xl shadow-ink-900/15 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9.5px] uppercase tracking-[0.14em] text-ink-400">Clean Sheet standing</span>
        <span className="text-[9.5px] font-medium text-teal-700 inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-teal-500" />Verified</span>
      </div>
      <div className="flex items-center gap-2 mb-3.5">
        <ApprovedStamp size={32} />
        <span className="font-display text-[17px] text-ink-900 leading-[1.1]">Clean Sheet Approved</span>
      </div>
      <div className="space-y-2.5">
        {[["Claims evidence", "Excellent", "95%"], ["Formula logic", "Strong", "88%"], ["Transparency", "Strong", "92%"]].map(([l, rating, w]) => (
          <div key={l}>
            <div className="flex justify-between items-center text-[10px] mb-1">
              <span className="text-ink-500">{l}</span>
              <span className="text-ink-700 font-medium">{rating}</span>
            </div>
            <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden"><div className="h-full rounded-full bg-teal-500" style={{ width: w }} /></div>
          </div>
        ))}
      </div>
    </div>
  );

  const molecule = (
    <svg width="102" height="86" viewBox="0 0 102 86" fill="none" aria-hidden>
      <path d="M22 30 L52 44 M52 44 L42 74 M52 44 L82 27" stroke="#3f8f86" strokeWidth="3" strokeLinecap="round" />
      <circle cx="22" cy="30" r="12" fill="#fd6158" />
      <circle cx="52" cy="44" r="15" fill="#248179" />
      <circle cx="42" cy="74" r="10" fill="#f2a94e" />
      <circle cx="82" cy="27" r="11" fill="#80d5cc" />
    </svg>
  );

  return (
    <header className="relative overflow-hidden grain-overlay md:-mt-[80px]" style={{ background: "linear-gradient(158deg, #fbf7f4 0%, #ffffff 52%, #f4faf8 100%)" }}>
      <div className="pointer-events-none absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full opacity-50 animate-blob" style={{ background: "radial-gradient(circle at 42% 42%, #d4f2ef, transparent 70%)" }} aria-hidden />

      {/* DESKTOP · DNA video, bleeding to the right edge and melting into the canvas.
         The video is masked (not overlaid) so its left and bottom edges fade to
         transparent and the real page background shows through — this dissolves
         seamlessly into the diagonal canvas gradient, with no visible seam
         from a mismatched fade colour. */}
      <div className="hidden lg:block absolute top-0 bottom-0 right-0 w-[52%] overflow-hidden" aria-hidden>
        <video
          autoPlay muted loop playsInline preload="metadata"
          poster="/images/creatives/dna-skincare-poster.jpg"
          className="w-full h-full object-cover"
          style={{
            animation: "hero-drift 26s ease-in-out infinite alternate",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 34%, #000 62%), linear-gradient(to top, transparent 0%, #000 26%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 34%, #000 62%), linear-gradient(to top, transparent 0%, #000 26%)",
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        >
          <source src="/Videos/dna-skincare-web720.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="relative max-w-[1200px] mx-auto px-4 md:px-16 pt-10 md:pt-[120px] pb-12 lg:pb-20 lg:min-h-[600px]">
        {/* LEFT · copy */}
        <div className="lg:max-w-[50%]">
          <HeroReveal>
            <p className="text-[12px] uppercase text-[var(--color-primary)] leading-[1.7]" style={{ letterSpacing: "0.14em" }}>
              Independent standard &amp; verification platform<br />for beauty and personal care
            </p>
          </HeroReveal>
          <h1 className="font-display mt-5 md:mt-6 text-[46px] md:text-[60px] xl:text-[68px] leading-[1.0] tracking-[-0.025em] text-[var(--color-charcoal)]">
            <TitleReveal lines={["Proof,", "not promises."]} />
          </h1>
          <HeroReveal delay={0.15}>
            <p className="mt-6 text-[17px] md:text-[18px] leading-[1.6] text-[var(--color-warm-gray)] max-w-md">
              We help <strong className="text-[var(--color-charcoal)] font-normal">brands</strong> prove their quality with
              independent verification, and help <strong className="text-[var(--color-charcoal)] font-normal">consumers</strong> see
              the evidence behind a product, not just the marketing.
            </p>
          </HeroReveal>

          <HeroReveal delay={0.3}>
            <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3">
              <Link
                href="/review"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-[15px] whitespace-nowrap text-white bg-[var(--color-coral)] hover:opacity-95 transition-all hover:shadow-xl hover:shadow-coral-500/25 active:scale-[0.99]"
              >
                Review a product for free
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </Link>
              <OpenFormButton
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-[15px] whitespace-nowrap text-[var(--color-charcoal)] border border-[var(--color-charcoal)]/15 bg-white/70 backdrop-blur-sm hover:border-[var(--color-charcoal)]/40 transition-colors"
              >
                Get your claims verified
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </OpenFormButton>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-[var(--color-warm-gray)]">
              {["Independent", "No paid placements", "Free for shoppers"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />{t}
                </span>
              ))}
            </div>
            <Link
              href="/brands"
              className="mt-6 inline-flex items-center gap-2 text-[15px] text-[var(--color-charcoal)] hover:text-[var(--color-primary)] transition-colors w-fit"
            >
              Browse reviewed products <span aria-hidden>›</span>
            </Link>
          </HeroReveal>
        </div>

        {/* DESKTOP · graphics composed over the video */}
        <HeroReveal delay={0.2}>
          <div className="hidden lg:block absolute z-10 top-[124px] right-3 xl:right-1 w-[124px] xl:w-[138px]" style={{ filter: "drop-shadow(0 14px 32px rgba(36,129,121,0.28))" }}>
            <Image src="/images/certified-badge.png" alt="The Clean Sheet Certified seal" width={140} height={140} className="w-full h-auto" />
          </div>
        </HeroReveal>
        <div className="hidden lg:block absolute z-10 top-[46%] right-[34%]">{molecule}</div>
        <HeroReveal delay={0.35}>
          <div className="hidden lg:block absolute z-10 bottom-12 right-2 w-[266px]">{scorecard}</div>
        </HeroReveal>
      </div>

      {/* MOBILE · video with the seal and standing card */}
      <div className="lg:hidden px-4 pb-9">
        <div className="relative">
          <div className="relative aspect-[16/13] rounded-3xl overflow-hidden shadow-xl shadow-ink-900/10 ring-1 ring-black/[0.06]">
            <video autoPlay muted loop playsInline preload="metadata" poster="/images/creatives/dna-skincare-poster.jpg" className="absolute inset-0 w-full h-full object-cover">
              <source src="/Videos/dna-skincare-web720.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 58%, rgba(40,40,40,0.14) 100%)" }} />
          </div>
          <div className="absolute -top-4 right-4 w-[76px]" style={{ filter: "drop-shadow(0 10px 22px rgba(36,129,121,0.28))" }}>
            <Image src="/images/certified-badge.png" alt="" width={90} height={90} className="w-full h-auto" />
          </div>
          <div className="absolute -bottom-5 left-4 right-4">{scorecard}</div>
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────
   CREDIBILITY BAND · real testing, real standard
───────────────────────────────────────────── */
function CredibilityBand() {
  const marks = ["EU 1223/2009", "US MoCRA", "India BIS & CDSCO", "Korea MFDS", "ISO 22716 GMP"];
  return (
    <section className="relative overflow-hidden grain-overlay">
      <div className="absolute inset-0">
        <Image
          src="/images/creatives/dropper-drop/3.png"
          alt="Formulation scientists assessing product samples and data in a laboratory"
          fill
          className="object-cover"
          style={{ objectPosition: "82% center" }}
          sizes="100vw"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(8,25,24,0.95) 0%, rgba(8,25,24,0.82) 40%, rgba(8,25,24,0.42) 72%, rgba(8,25,24,0.12) 100%)" }} />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-xl">
          <p className="text-teal-300 text-[12px] uppercase" style={{ letterSpacing: "0.16em" }}>The standard</p>
          <h2 className="font-display text-white text-3xl sm:text-4xl lg:text-[44px] leading-[1.12] mt-4">
            A real standard, backed<br className="hidden sm:block" /> by real testing.
          </h2>
          <p className="text-teal-50/85 text-[15px] sm:text-base leading-relaxed mt-5 max-w-lg">
            Every claim is judged on finished-product evidence, read against the real ingredient list, and benchmarked to the regulations that govern beauty worldwide. Not marketing language. Documented proof.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {marks.map((s) => (
              <span key={s} className="text-[12px] text-white/90 border border-white/25 bg-white/[0.06] backdrop-blur-sm rounded-full px-3.5 py-1.5">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   THE PROBLEM
───────────────────────────────────────────── */
function TheProblem() {
  const rows = [
    { claim: '"Clinically proven"', reality: 'No study on file', bad: true },
    { claim: '"Dermatologist tested"', reality: 'No panel, no protocol', bad: true },
    { claim: '"100% natural"', reality: 'No origin verification', bad: true },
    { claim: 'Clean Sheet Approved', reality: 'Independent review. Public proof.', bad: false },
  ];
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24 grain-overlay" style={{ background: "linear-gradient(155deg, #131315 0%, #0b0b0c 52%, #0d211f 100%)" }}>
      <div className="pointer-events-none absolute -top-20 right-4 w-[420px] h-[420px] rounded-full opacity-20 animate-blob" style={{ background: "radial-gradient(circle at 50% 50%, #2E9E96, transparent 70%)" }} aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 -left-16 w-[360px] h-[360px] rounded-full opacity-[0.12] animate-blob" style={{ background: "radial-gradient(circle at 50% 50%, #fd6158, transparent 70%)", animationDelay: "3s" }} aria-hidden />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-teal-300 text-[12px] uppercase mb-5" style={{ letterSpacing: "0.16em" }}>The gap</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.08] text-white mb-6">
              Clean claims are easy.
              <br />
              <span className="text-yellow-400">Clean proof isn&apos;t.</span>
            </h2>
            <p className="text-teal-100/80 text-lg leading-relaxed max-w-md">
              Every brand says its product is &ldquo;clinically proven&rdquo;, &ldquo;dermatologist tested&rdquo;, or &ldquo;100% natural&rdquo;. Almost none of it is independently verified.
            </p>
            <p className="text-teal-300/70 text-lg leading-relaxed mt-4">Until now.</p>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {rows.map(({ claim, reality, bad }) => (
              <div key={claim} className={`rounded-2xl p-5 border backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 ${bad ? 'border-coral-500/25 bg-coral-500/[0.06]' : 'border-teal-400/40 bg-teal-500/[0.12] shadow-lg shadow-teal-900/40'}`}>
                <div className={`text-[11px] font-medium uppercase tracking-wide mb-2 ${bad ? 'text-coral-400' : 'text-teal-300'}`}>
                  {bad ? '✗ Unverified' : '✓ Verified'}
                </div>
                <div className="text-white font-normal text-sm mb-1">{claim}</div>
                <div className={`text-xs leading-snug ${bad ? 'text-coral-300/60' : 'text-teal-200'}`}>{reality}</div>
              </div>
            ))}
          </div>
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
        <div className="text-5xl font-semibold text-white tracking-tight leading-none">25k<span className="text-teal-400">+</span></div>
        <div className="text-teal-300/70 text-[10px] font-normal uppercase tracking-[0.2em] mt-1">Ingredients scored</div>
      </div>
      {/* Pill cloud */}
      <div className="relative z-10 flex flex-wrap justify-center gap-1.5 max-w-[280px]">
        {pills.map(({ label, color }) => (
          <span key={label} className="text-[9px] font-normal px-2 py-0.5 rounded-full border"
            style={{ color, borderColor: color + "55", background: color + "18" }}>
            {label}
          </span>
        ))}
      </div>
      {/* Tag */}
      <span className="absolute bottom-4 left-4 text-xs font-medium text-ink-950 bg-yellow-400 px-3 py-1 rounded-full uppercase tracking-wide">Science-backed</span>
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

      {/* Left, Natural */}
      <div className="absolute left-0 inset-y-0 w-1/2 flex flex-col items-center justify-center gap-2 px-4">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="19" fill="#dcfce7" stroke="#86efac" strokeWidth="1.5"/>
          <path d="M20 32 C20 32 10 24 10 16 C10 11 14.5 8 20 8 C25.5 8 30 11 30 16 C30 24 20 32 20 32Z" fill="#4ade80" opacity="0.6"/>
          <path d="M20 32 L20 14" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M20 22 Q25 19 28 21" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
          <path d="M20 18 Q15 15 12 17" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        </svg>
        <span className="text-[11px] font-medium text-green-700 uppercase tracking-widest">Natural</span>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"/><span className="text-[9px] text-ink-500">Coconut Oil</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"/><span className="text-[9px] text-ink-500">Tea Tree (neat)</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"/><span className="text-[9px] text-ink-500">Essential Oils</span></div>
        </div>
      </div>

      {/* Right, Synthetic */}
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
        <span className="text-[11px] font-medium text-blue-700 uppercase tracking-widest">Synthetic</span>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"/><span className="text-[9px] text-ink-500">Niacinamide</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"/><span className="text-[9px] text-ink-500">Hyaluronic Acid</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"/><span className="text-[9px] text-ink-500">Formaldehyde</span></div>
        </div>
      </div>

      {/* VS badge */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-2 border-ink-100 flex items-center justify-center z-10 shadow-sm">
        <span className="text-[9px] font-semibold text-ink-400">VS</span>
      </div>

      {/* Tag */}
      <span className="absolute bottom-4 left-4 text-xs font-medium text-ink-950 bg-yellow-400 px-3 py-1 rounded-full uppercase tracking-wide z-10">Ingredient transparency</span>
    </div>
  );
}

/* ── Card graphic 3: QR / Scorecard ── */
function GraphicCertification() {
  /* 7×7 QR-like pattern, purely decorative */
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

      {/* Tier seal — the standing, not a number */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <ApprovedStamp size={96} />
        <div className="bg-teal-600 text-white rounded-xl px-3 py-1.5 text-center">
          <div className="text-[9px] font-medium uppercase tracking-widest">Public review page</div>
        </div>
      </div>

      {/* Tag */}
      <span className="absolute bottom-4 left-4 text-xs font-medium text-ink-950 bg-yellow-400 px-3 py-1 rounded-full uppercase tracking-wide z-10">Real proof</span>
    </div>
  );
}

function VisualProof() {
  const cards = [
    {
      graphic: <GraphicDatabase />,
      heading: "25,000+ ingredients. Read, not marketed.",
      body: "We pull the product's real INCI and read it against 25,000+ ingredients cross-referenced to EU, India, US & Korea, so 'fragrance-free' and 'contains actives' claims are checked against fact.",
    },
    {
      graphic: <GraphicNaturalSynthetic />,
      heading: "Not all natural is safe. Not all synthetic is harmful.",
      body: "We cut through the marketing noise. Every claim is judged on the actual chemistry and the evidence behind it, not buzzwords like 'clean', 'green', or 'pure'.",
    },
    {
      graphic: <GraphicCertification />,
      heading: "One clear standing. Backed by proof.",
      body: "Every reviewed product gets a public page: its Clean Sheet standing, the claims, and the evidence behind each one. Approved means the claims genuinely hold up.",
    },
  ];

  return (
    <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f7faf9 100%)" }}>
      <div className="pointer-events-none absolute top-10 -right-24 w-[380px] h-[380px] rounded-full opacity-40 animate-blob" style={{ background: "radial-gradient(circle at 50% 50%, #d4f2ef, transparent 70%)" }} aria-hidden />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <div className="text-coral-500 text-sm font-normal uppercase tracking-wider mb-3">Under the hood</div>
          <h2 className="font-display text-4xl lg:text-5xl tracking-tight leading-[1.08]">
            What the review
            <br />
            <span className="text-teal-600">actually checks.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map(({ graphic, heading, body }) => (
            <div key={heading} className="group rounded-3xl overflow-hidden border border-ink-100 ring-1 ring-black/[0.02] hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-500 hover:-translate-y-1.5 bg-white">
              {graphic}
              <div className="p-6">
                <h3 className="font-medium text-ink-900 text-lg mb-2 leading-snug">{heading}</h3>
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
   ANALYZER PREVIEW
───────────────────────────────────────────── */
function AnalyzerPreview() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24" style={{ background: "linear-gradient(180deg, #f7faf9 0%, #ffffff 60%)" }}>
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-[420px] h-[420px] rounded-full opacity-40 animate-blob" style={{ background: "radial-gradient(circle at 50% 50%, #fee3e1, transparent 70%)" }} aria-hidden />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Left copy */}
          <div>
            <div className="inline-flex items-center gap-2 text-coral-500 text-sm font-normal mb-4 sm:mb-5 uppercase tracking-wide">
              <Sparkles size={14} /> The Clean Sheet Review Engine
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.06] mb-4 sm:mb-6">
              Paste a link.
              <br />Get the truth.
            </h2>
            <p className="text-ink-600 text-lg leading-relaxed mb-8">
              Drop a product name or URL. The review engine finds every marketing claim the
              product makes, digs up the evidence behind each one, reads the real ingredient
              list, and hands you one clear Clean Sheet standing.
            </p>
            <ul className="space-y-3.5 mb-10">
              {[
                "Finds every claim, then grades it on a 1-7 evidence ladder: from 'no proof publicly visible' to published clinical studies",
                "Reads the actual INCI, so 'fragrance-free' and 'contains actives' claims can't lie",
                "Checks ASCI advertising rules and the India drug-cosmetic boundary",
                "Compares price and claims across Nykaa, Amazon, Flipkart & quick commerce",
              ].map(t => (
                <li key={t} className="flex items-start gap-3 text-ink-700">
                  <CheckCircle2 size={18} className="text-teal-500 flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/review"
              className="inline-flex items-center gap-2.5 bg-coral-500 hover:bg-coral-600 text-white font-normal px-6 py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-coral-500/25 active:scale-[0.98]">
              <Sparkles size={16} /> Review a product free
            </Link>
          </div>

          {/* Right mock UI, the review engine result */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] opacity-70 blur-2xl" style={{ background: "radial-gradient(60% 60% at 62% 38%, rgba(45,158,150,0.20), transparent 70%)" }} aria-hidden />
            <div className="absolute -top-5 -right-5 z-20 bg-yellow-500 text-ink-950 text-xs font-medium px-4 py-2 rounded-full shadow-lg">LIVE ✦</div>
            <div className="relative bg-white rounded-[2rem] border border-ink-100 shadow-2xl shadow-teal-900/10 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 bg-teal-50 border-b border-teal-100">
                <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-normal text-ink-900">Product Review</div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-safe-500 animate-pulse" />
                    <span className="text-xs text-ink-500">Powered by The Clean Sheet Review Engine</span>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-end">
                  <div className="bg-teal-600 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[88%]">
                    <p className="text-sm">La Roche-Posay Mela B3 Serum</p>
                  </div>
                </div>
                <div className="bg-teal-50 border border-teal-100 rounded-2xl rounded-bl-sm px-4 py-4">
                  <p className="text-ink-700 text-sm mb-3"><strong>26 claims found.</strong> Checked against studies, the INCI, and 8 platforms:</p>
                  <div className="flex items-center gap-3 bg-white border border-ink-100 rounded-xl px-3 py-2.5 mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="" className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-medium text-teal-700 uppercase tracking-wide">Clean Sheet Approved</div>
                      <div className="text-xs text-ink-400">Claims hold up to the evidence</div>
                    </div>
                    <CheckCircle2 size={18} className="ml-auto text-teal-600" />
                  </div>
                  <div className="flex items-start gap-2 text-xs text-teal-800 bg-white border border-teal-100 rounded-xl px-3 py-2.5 mb-2">
                    <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5 text-teal-600" />
                    <span><strong>&ldquo;Corrects dark spots&rdquo;</strong>: clinical study, 41 women, 8 weeks. Well supported.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-coral-700 bg-coral-50 border border-coral-100 rounded-xl px-3 py-2.5">
                    <XCircle size={13} className="flex-shrink-0 mt-0.5" />
                    <span><strong>&ldquo;Fragrance-free&rdquo;</strong> on a marketplace listing, contradicted by the INCI.</span>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="flex items-center gap-2 bg-ink-50 border border-ink-100 rounded-2xl px-4 py-3">
                  <span className="text-ink-400 text-sm flex-1 select-none">Paste a product name or URL...</span>
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
    <div className="relative overflow-hidden bg-yellow-500 py-4 select-none" style={{ WebkitMaskImage: "linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)", maskImage: "linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)" }}>
      <div className="flex gap-10 whitespace-nowrap" style={{ animation: "marquee 30s linear infinite" }}>
        {[...terms,...terms].map((t,i)=>(
          <span key={i} className="text-ink-950 text-sm font-medium flex-shrink-0">
            {t} <span className="text-ink-800/40 mx-2">·</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FOR BRANDS
───────────────────────────────────────────── */
function ForBrands() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24" style={{ background: "linear-gradient(180deg, #ffffff 0%, #faf7f4 100%)" }}>
      <div className="pointer-events-none absolute -top-20 -left-24 w-[400px] h-[400px] rounded-full opacity-40 animate-blob" style={{ background: "radial-gradient(circle at 50% 50%, #d4f2ef, transparent 70%)" }} aria-hidden />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left, image with overlay card */}
          <div className="relative order-2 lg:order-1">
            <div className="relative h-[360px] sm:h-[460px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl shadow-ink-900/15 ring-1 ring-black/[0.06]">
              <Image
                src="/images/reuben-mansell-nwOip8AOZz0-unsplash.jpg"
                alt="Premium certified skincare product lineup"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 600px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-950/50 via-transparent to-transparent" />
            </div>
            {/* Floating standing card */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl border border-ink-100 shadow-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-ink-400 uppercase tracking-wider mb-1">Clean Sheet Standing</div>
                  <div className="text-2xl font-medium text-ink-900 leading-tight" style={{ fontFamily: "'Cooper BT', serif" }}>Clean Sheet<br />Approved</div>
                </div>
                <ApprovedStamp size={64} />
              </div>
              <div className="space-y-2">
                {[["Claims Evidence","bg-teal-500","Strong"],["Formula Logic","bg-teal-400","Strong"],["Transparency","bg-gold-400","Excellent"]].map(([l,c,label])=>(
                  <div key={l as string}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-ink-500">{l as string}</span>
                      <span className="text-ink-700 font-normal">{label as string}</span>
                    </div>
                    <div className="h-1 bg-ink-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${c as string}`} style={{width:"88%"}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right copy */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 text-teal-600 text-sm font-normal mb-5 uppercase tracking-wide">
              <Users size={14} /> For Brands & Manufacturers
            </div>
            <h2 className="font-display text-4xl lg:text-5xl tracking-tight leading-[1.08] mb-6">
              Certification is the new
              <br />competitive advantage.
            </h2>
            <p className="text-ink-600 text-lg leading-relaxed mb-8">
              Indian consumers are getting smarter. They&apos;re reading ingredient lists, questioning claims, and choosing brands that show their work. The Clean Sheet gives you a way to do that, credibly, independently, and permanently on the public record.
            </p>
            <div className="space-y-3.5 mb-10">
              {[
                "Differentiate from brands that only claim, not prove",
                "Public proof page with QR code on every certified product",
                "Get retail-ready with comprehensive claim substantiation",
                "Export with confidence: India, EU, US, Korean standards assessed",
              ].map(t=>(
                <div key={t} className="flex items-center gap-3 text-ink-700">
                  <CheckCircle2 size={18} className="text-teal-500 flex-shrink-0" />
                  {t}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6 mb-10">
              <div>
                <div className="font-display text-3xl text-teal-700 leading-none">30%</div>
                <div className="text-ink-500 text-xs mt-1.5 max-w-[9rem] leading-snug">higher revenue for products with independent trust badges</div>
              </div>
              <div className="w-px h-12 bg-ink-100" />
              <div>
                <div className="font-display text-3xl text-teal-700 leading-none">80%</div>
                <div className="text-ink-500 text-xs mt-1.5 max-w-[9rem] leading-snug">of shoppers will pay more for verified products</div>
              </div>
            </div>
            <a href="#get-certified"
              className="inline-flex items-center gap-2.5 bg-coral-500 hover:bg-coral-600 text-white font-normal px-6 py-3.5 rounded-2xl transition-all hover:shadow-xl hover:shadow-coral-500/25 active:scale-[0.98]">
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
      <div className="absolute top-4 left-4 text-5xl font-semibold leading-none select-none" style={{ color: "#0d948822" }}>01</div>
      {/* Portal card */}
      <div className="relative z-10 bg-white rounded-xl shadow-md border border-teal-100 w-full max-w-[220px] p-3">
        <div className="text-[9px] font-medium uppercase tracking-widest text-teal-600 mb-2">Verification Portal</div>
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
        <div className="mt-2.5 w-full bg-teal-600 rounded-lg py-1.5 text-center text-white text-[9px] font-medium tracking-wide">
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
      <div className="absolute top-4 left-4 text-5xl font-semibold leading-none select-none" style={{ color: "#ffffff08" }}>02</div>
      {/* Header */}
      <div className="relative z-10 flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        <span className="text-teal-300 text-[9px] font-medium uppercase tracking-widest">Analyzing ingredients…</span>
      </div>
      {/* Rows */}
      <div className="relative z-10 space-y-1.5">
        {rows.map(({ name, risk, color, bar }) => (
          <div key={name} className="flex items-center gap-2">
            <span className="text-[9px] text-white/70 w-[108px] truncate font-mono">{name}</span>
            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${bar}%`, background: color }} />
            </div>
            <span className="text-[9px] font-medium w-10 text-right" style={{ color }}>{risk}</span>
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
      <div className="absolute top-4 left-4 text-5xl font-semibold leading-none select-none" style={{ color: "#0d948818" }}>03</div>
      {/* QR code block */}
      <div className="relative z-10 bg-white rounded-xl p-2.5 shadow-md border border-teal-100 flex-shrink-0">
        <div className="grid gap-[2px]" style={{ gridTemplateColumns: "repeat(6,10px)" }}>
          {qr.flat().map((cell, i) => (
            <div key={i} className="w-[10px] h-[10px] rounded-[1px]"
              style={{ background: cell === "empty" ? "#f1f5f9" : "#0f3d38" }} />
          ))}
        </div>
        <div className="mt-1.5 text-center text-[7px] font-medium text-teal-700 tracking-wider">SCAN TO VERIFY</div>
      </div>
      {/* Standing card */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <ApprovedStamp size={72} />
        <div className="bg-teal-700 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="0.8"/>
            <path d="M3.5 6l1.8 1.8L8.5 4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span className="text-[9px] font-medium text-white tracking-wide">CERTIFIED ✦</span>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { n:"01", title:"Submit your formulation",    body:"Complete INCI lists, TDS, MSDS, COA, and independent lab results through our verification portal.", graphic: <StepGraphicSubmit /> },
    { n:"02", title:"We analyze every ingredient", body:"Each ingredient evaluated for toxicity, exposure risk, sensitization, and regulatory compliance across EU, India, US & Korean standards.", graphic: <StepGraphicAnalysis /> },
    { n:"03", title:"Rate. Certify. Publish.",    body:"Products earn a Clean Sheet standing and, if they clear the bar, certification. A QR code links to the public review page for real-time consumer verification.", graphic: <StepGraphicPublish /> },
  ];
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-teal-600 text-sm font-normal mb-4 uppercase tracking-wide">
            <Star size={14} /> The Certification Process
          </div>
          <h2 className="text-4xl lg:text-5xl font-medium tracking-tight mb-4">How certification works.</h2>
          <p className="text-ink-600 text-lg max-w-lg mx-auto">Three steps, every one backed by verified documents. No exceptions.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({n,title,body,graphic})=>(
            <div key={n} className="group">
              <div className="mb-6">{graphic}</div>
              <h3 className="text-xl font-medium text-ink-900 mb-2">{title}</h3>
              <p className="text-ink-500 leading-relaxed text-sm">{body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 max-w-3xl mx-auto text-center rounded-2xl border border-ink-100 bg-ink-50 px-6 py-5">
          <p className="text-ink-600 text-sm leading-relaxed">
            No middle ground: a product is Certified or it is not. Banned substances, undisclosed allergens, or formaldehyde releasers are an automatic fail, whatever else the formula gets right.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FAQ SECTION, SEO / featured snippets
───────────────────────────────────────────── */
const HOME_FAQS = [
  {
    q: "How do I check if a beauty product is safe in India?",
    a: "The easiest way is The Clean Sheet's free Product Review tool. Paste a product name or URL and it finds every marketing claim, grades each against real evidence and the actual ingredient list, checks India's advertising and drug-boundary rules, and gives you one clear Clean Sheet standing.",
  },
  {
    q: "What is The Clean Sheet?",
    a: "The Clean Sheet is India's first independent, science-backed clean beauty platform. We provide an AI-powered Product Review tool that checks marketing claims against evidence, a reviewed product registry, a database of 25,000+ cosmetic ingredients, and a rigorous product certification for beauty brands. Everything is free for consumers.",
  },
  {
    q: "Is The Clean Sheet's ingredient analysis free?",
    a: "Yes. The Product Review tool is completely free to use. Paste any product name or URL (Nykaa, Amazon, brand website) and you get a full review: every claim graded against evidence, the real ingredient list, price parity, and a clear Clean Sheet standing.",
  },
  {
    q: "What does the Clean Sheet standing mean?",
    a: "Every reviewed product gets one of four standings. Clean Sheet Approved: every headline claim holds up, proven on the finished product. Mostly Clean: a well-made, transparent product, but some claims lean on ingredient research rather than finished-product proof. Can Do Better: nothing wrong with it, but the proof and transparency don't yet match the claims. Not Recommended: the product makes a claim that isn't permitted in India, or one its own ingredient list contradicts.",
  },
  {
    q: "Which beauty products are reviewed by The Clean Sheet in India?",
    a: "You can browse every reviewed product at thecleansheet.in/brands. Each has a public page showing its Clean Sheet standing, every marketing claim graded against evidence, the real ingredient list, and price parity across platforms. Brands can also apply for certification at thecleansheet.in/brands.",
  },
  {
    q: "Is niacinamide safe for Indian skin?",
    a: "Yes, niacinamide (Vitamin B3) is considered safe and is rated Low concern by The Clean Sheet. It is permitted under Indian, EU, US & Korean cosmetic regulations with no concentration limit. It is commonly used in serums and moisturisers for its brightening, pore-minimising, and anti-inflammatory properties.",
  },
  {
    q: "Are parabens banned in India?",
    a: "Parabens are not fully banned in India but are restricted. Short-chain parabens like methylparaben and propylparaben are permitted up to 0.4% (individual) or 0.8% (mixed) under Indian cosmetics regulations. However, they are classified as Medium concern by The Clean Sheet due to potential endocrine effects at high concentrations.",
  },
];

function HomeFAQ() {
  return (
    <section className="py-12 sm:py-16 bg-teal-50/40 border-t border-teal-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-xs font-normal text-ink-400 uppercase tracking-widest mb-3 text-center">Common Questions</div>
        <h2 className="text-2xl sm:text-3xl font-medium text-ink-950 tracking-tight mb-10 text-center">
          Everything you wanted to know about clean beauty in India
        </h2>
        <div className="space-y-0 divide-y divide-teal-100 border border-teal-100 rounded-2xl overflow-hidden bg-white">
          {HOME_FAQS.map(({ q, a }) => (
            <details key={q} className="group">
              <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none hover:bg-teal-50/60 transition-colors">
                <span className="font-medium text-ink-900 text-sm sm:text-base">{q}</span>
                <ChevronRight size={16} className="text-teal-500 flex-shrink-0 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-5 text-ink-600 leading-relaxed text-sm sm:text-base border-t border-teal-50">
                {a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

const homeFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   CONSUMER HAS CHANGED · the proof-demand data
───────────────────────────────────────────── */
function ConsumerHasChanged() {
  const stats = [
    { persona: "The researcher", value: "~72%", body: "of Indian consumers actively research ingredients and reviews before they buy." },
    { persona: "The value-driven buyer", value: ">65%", body: "will pay a premium for products with verified safe or transparent claims." },
    { persona: "The skeptic", value: "8 in 10", body: "say they feel confused or skeptical about clean and natural marketing." },
  ];
  return (
    <section className="relative overflow-hidden bg-teal-600 py-16 sm:py-24 grain-overlay">
      {/* soft depth: floating light forms */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full opacity-20 animate-blob" style={{ background: "radial-gradient(circle at 30% 30%, #d6ff3e, transparent 70%)" }} aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 -left-20 w-[360px] h-[360px] rounded-full opacity-[0.12] animate-blob" style={{ background: "radial-gradient(circle at 50% 50%, #ffffff, transparent 70%)", animationDelay: "3s" }} aria-hidden />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-teal-100 text-[12px] uppercase" style={{ letterSpacing: "0.16em" }}>The shift</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.1] mt-4 max-w-2xl">
            Your consumer has changed.
            <br />
            <span className="text-yellow-400">They now demand proof.</span>
          </h2>
        </Reveal>
        <div className="mt-12 sm:mt-16 grid md:grid-cols-3 gap-10 lg:gap-14">
          {stats.map(({ persona, value, body }, i) => (
            <Reveal key={persona} delay={0.1 + i * 0.12}>
              <div className="pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.22)" }}>
                <p className="text-teal-100 text-[12px] uppercase" style={{ letterSpacing: "0.12em" }}>{persona}</p>
                <p className="font-display text-white leading-none mt-3" style={{ fontSize: "clamp(52px, 7.5vw, 84px)" }}>{value}</p>
                <p className="text-teal-50/90 text-[15px] leading-relaxed mt-4 max-w-xs">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <p className="mt-14 sm:mt-16 font-display text-2xl sm:text-[32px] text-white leading-[1.2] max-w-3xl">
            When every brand claims quality, only <span className="text-yellow-400">verified</span> products win.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   SENSORY VIDEO BAND · serum drop
───────────────────────────────────────────── */
function SensoryBand() {
  return (
    <section className="relative overflow-hidden grain-overlay h-[60vh] min-h-[420px] max-h-[600px]">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/creatives/serum-drop-poster.jpg"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/Videos/serum-drop-web.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0" style={{ background: "linear-gradient(96deg, rgba(26,20,16,0.78) 0%, rgba(26,20,16,0.45) 44%, rgba(26,20,16,0.06) 78%)" }} />
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <Reveal>
          <div className="max-w-lg">
            <p className="text-white/70 text-[12px] uppercase" style={{ letterSpacing: "0.18em" }}>Down to the last drop</p>
            <h2 className="font-display text-white text-4xl sm:text-5xl lg:text-[56px] leading-[1.04] mt-4">
              Every drop, held
              <br />to the standard.
            </h2>
            <p className="text-white/80 text-[15px] sm:text-base leading-relaxed mt-5 max-w-md">
              The serum in the bottle should match the story on the label. We read the evidence, so the two always line up.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqJsonLd) }}
      />
      <Hero />
      <CredibilityBand />
      <TheProblem />
      <ConsumerHasChanged />
      <SensoryBand />
      <AnalyzerPreview />
      <VisualProof />
      <IngredientStrip />
      <ForBrands />
      <HomeFAQ />
    </>
  );
}
