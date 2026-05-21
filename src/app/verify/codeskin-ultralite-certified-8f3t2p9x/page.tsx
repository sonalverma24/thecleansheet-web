import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Shield, Sun, Leaf, Droplets, Eye, FlaskConical, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++ | Independently Certified | The Clean Sheet",
  description:
    "CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++ independently certified by The Clean Sheet. Every claim verified against scientific evidence.",
  robots: { index: false, follow: false },
};

/* ═══════════════════════════════════════════════════════════════ */
export default function ConsumerCertPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* ── Status bar ───────────────────────────────────────── */}
      <div className="bg-teal-950 border-b border-teal-800">
        <div className="max-w-5xl mx-auto px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={16} height={16} className="object-contain opacity-90" />
            <span className="text-teal-200 text-[11px] font-semibold tracking-[0.15em] uppercase">The Clean Sheet</span>
            <span className="text-teal-700 text-[11px] hidden sm:block">Independent Certification</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-amber-300 text-[11px] font-medium">Sample Data: Verification Not Complete</span>
          </div>
        </div>
      </div>

      {/* ── HERO — dark, full bleed ───────────────────────────── */}
      <section className="grain-overlay bg-teal-950 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto px-5 pt-16 pb-20">

          <div className="animate-fade-in mb-10">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-teal-400 border border-teal-700 px-4 py-2 rounded-full">
              <span className="w-1 h-1 rounded-full bg-teal-400" />
              Independently Certified · The Clean Sheet
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-12 lg:gap-16">

            {/* Heading block */}
            <div className="flex-1">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white leading-none tracking-tight mb-6 animate-fade-up">
                UltraLite<br />
                <span style={{ color: "#D6FF3E" }}>Fluid</span><br />
                Sunscreen
              </h1>
              <p className="text-teal-300 text-lg font-semibold tracking-tight mb-1 animate-fade-up delay-100">SPF 50+ PA++++</p>
              <p className="text-teal-500 text-sm font-medium tracking-wide mb-6 animate-fade-up delay-100">CodeSkin India</p>

              <div className="flex flex-wrap gap-2 animate-fade-up delay-200">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide bg-teal-600 text-white px-3 py-1.5 rounded-full">
                  <Shield size={9} /> PRISM Core Certified
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide bg-coral-500 text-white px-3 py-1.5 rounded-full">
                  <Sun size={9} /> PRISM Sun Verified
                </span>
              </div>

              <p className="text-teal-500 text-sm leading-relaxed max-w-sm mt-8 animate-fade-up delay-300">
                Every claim below was reviewed by an independent panel of cosmetic scientists,
                toxicologists, regulatory specialists, and dermatologists against submitted laboratory evidence.
              </p>
            </div>

            {/* Product visual */}
            <div className="flex-shrink-0 animate-fade-up delay-200">
              <div className="animate-float relative">
                <div className="absolute -inset-4 rounded-3xl opacity-20"
                  style={{ background: "radial-gradient(circle, #FD6158, transparent)" }} />
                <div className="relative w-44 h-56 sm:w-48 sm:h-60 rounded-3xl overflow-hidden ring-1 ring-teal-700"
                  style={{ background: "linear-gradient(145deg, #0F2C2A 0%, #1D5550 100%)" }}>
                  <Image
                    src="https://codeskin.in/cdn/shop/files/UltraLite_Fluid_Sunscreen_bottle_s.png?v=1768211190"
                    alt="CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++"
                    fill
                    className="object-contain p-3"
                    unoptimized
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: "linear-gradient(90deg, transparent, #D6FF3E, transparent)" }} />
                </div>
                <div className="absolute -bottom-3 -right-3 drop-shadow-2xl">
                  <Image src="/images/tcs-certified-badge.png" alt="TCS Certified" width={52} height={52} className="object-contain" />
                </div>
              </div>
            </div>
          </div>

          {/* Hero stat row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px mt-16 border border-teal-800 rounded-2xl overflow-hidden animate-fade-up delay-400">
            {[
              { n: "59.92", label: "SPF Tested", sub: "Label claims SPF 50+" },
              { n: "22.07", label: "UVAPF", sub: "PA++++ confirmed" },
              { n: "94%", label: "SPF Retained", sub: "After 80 min in water" },
              { n: "33", label: "Participants", sub: "Non-comedogenic study" },
            ].map(({ n, label, sub }) => (
              <div key={label} className="bg-teal-900/60 px-5 py-5 text-center">
                <p className="font-bold leading-none mb-2" style={{ fontSize: "2.5rem", color: "#D6FF3E" }}>{n}</p>
                <p className="text-teal-200 text-[10px] font-bold uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-teal-500 text-[10px]">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE TICKER ────────────────────────────────────── */}
      <div className="bg-teal-600 py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-0 flex-shrink-0">
              {[
                "SPF 50+ Verified",
                "PA++++ Confirmed",
                "Water Resistant 80 Min",
                "Non-Comedogenic Tested",
                "Dermatologist Tested",
                "Reef-Safe Formula",
                "Fragrance-Free Confirmed",
                "Vegan and Cruelty-Free",
              ].map((item) => (
                <span key={item} className="flex items-center">
                  <span className="text-white text-xs font-semibold tracking-widest uppercase px-6">{item}</span>
                  <span className="text-yellow-300 text-xs">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION HEADLINE ─────────────────────────────────── */}
      <section className="bg-white pt-20 pb-4 px-5">
        <div className="max-w-5xl mx-auto">
          <p className="text-teal-600 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">What was independently verified</p>
          <h2 className="text-5xl sm:text-6xl font-bold text-ink-950 tracking-tight leading-none">
            Every claim,<br />
            <span className="text-ink-400">backed by science.</span>
          </h2>
        </div>
      </section>

      {/* ── BENTO CLAIMS GRID ─────────────────────────────────── */}
      <section className="px-5 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

            {/* SPF — large teal card, col-span-2 */}
            <div className="lg:col-span-2 rounded-2xl p-8 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #248179 0%, #2E9E96 70%, #45B8B0 100%)" }}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-teal-100 text-[10px] font-bold tracking-[0.2em] uppercase">SPF Performance</span>
                <CheckCircle2 size={16} className="text-white/50" />
              </div>
              <p className="text-8xl font-bold text-white tracking-tight leading-none mb-2">50+</p>
              <p className="text-teal-100 text-[10px] font-bold tracking-widest uppercase mb-4">Tested at SPF 59.92</p>
              <p className="text-white/70 text-xs leading-relaxed">
                Independent lab confirmed SPF 59.92 against the label claim of SPF 50+.
                The product delivers more protection than it promises.
              </p>
            </div>

            {/* PA++++ — large coral card, col-span-2 */}
            <div className="lg:col-span-2 rounded-2xl p-8 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #E84940 0%, #FD6158 60%, #FE7F78 100%)" }}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-red-100 text-[10px] font-bold tracking-[0.2em] uppercase">UVA Protection</span>
                <CheckCircle2 size={16} className="text-white/50" />
              </div>
              <p className="text-6xl font-bold text-white tracking-tight leading-none mb-2">PA++++</p>
              <p className="text-red-100 text-[10px] font-bold tracking-widest uppercase mb-4">UVAPF tested at 22.07</p>
              <p className="text-white/70 text-xs leading-relaxed">
                PA++++ is the highest UVA protection tier. UVAPF of 16 or above required.
                This product tested at 22.07. Comfortably verified.
              </p>
            </div>

            {/* Water resistance — wide dark card, col-span-3 */}
            <div className="lg:col-span-3 rounded-2xl p-7 bg-teal-950 relative overflow-hidden">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <span className="text-teal-500 text-[10px] font-bold tracking-[0.2em] uppercase block mb-2">Water Resistance</span>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Water Resistant for 80 Minutes</h3>
                </div>
                <div className="text-center flex-shrink-0 ml-4">
                  <p className="font-bold leading-none" style={{ fontSize: "2.5rem", color: "#D6FF3E" }}>94%</p>
                  <p className="text-teal-500 text-[10px] mt-1">SPF after 80 min</p>
                </div>
              </div>
              <p className="text-teal-400 text-xs leading-relaxed max-w-lg">
                After 80 minutes of water immersion, this sunscreen retained 94% of its original SPF.
                Tested to ISO 16217 standard. The label says water resistant and the test proves it.
              </p>
            </div>

            {/* Non-comedogenic — col-span-1 */}
            <div className="lg:col-span-1 rounded-2xl p-6 bg-ink-50 border border-ink-100 flex flex-col justify-between">
              <div>
                <span className="text-ink-400 text-[10px] font-bold tracking-[0.2em] uppercase block mb-2">Skin Compatibility</span>
                <h3 className="text-xl font-bold text-ink-950 tracking-tight leading-snug mb-3">Non-Comedogenic</h3>
                <p className="text-ink-500 text-xs leading-relaxed">28-day study, 33 adults. Zero new comedones. 61.5% reduction in inflammatory acne lesions.</p>
              </div>
              <div className="mt-4">
                <span className="text-[10px] font-semibold bg-teal-100 text-teal-700 px-2.5 py-1 rounded-md">33 participants</span>
              </div>
            </div>

            {/* Dermatologist + Ophthalmologist — col-span-2 */}
            <div className="lg:col-span-2 rounded-2xl p-6 bg-ink-50 border border-ink-100">
              <span className="text-ink-400 text-[10px] font-bold tracking-[0.2em] uppercase block mb-3">Clinical Testing</span>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={13} className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-ink-900 tracking-tight">Dermatologist-Tested</p>
                    <p className="text-ink-500 text-xs leading-relaxed mt-0.5">Patch test under dermatologist supervision. Zero irritation reported across all participants.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={13} className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-ink-900 tracking-tight">Ophthalmologist-Tested</p>
                    <p className="text-ink-500 text-xs leading-relaxed mt-0.5">3-day ocular safety study with twice-daily application. No eye irritation reported.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hydration — col-span-2 */}
            <div className="lg:col-span-2 rounded-2xl p-6 bg-teal-50 border border-teal-100">
              <div className="flex items-start justify-between mb-3">
                <span className="text-teal-600 text-[10px] font-bold tracking-[0.2em] uppercase">Hydration</span>
                <CheckCircle2 size={14} className="text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-ink-950 tracking-tight mb-3">Deeply Hydrating</h3>
              <div className="flex gap-4 mb-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-teal-600 tracking-tight leading-none">65%</p>
                  <p className="text-ink-400 text-[10px] mt-1">at 8 hours</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-teal-600 tracking-tight leading-none">38%</p>
                  <p className="text-ink-400 text-[10px] mt-1">at 24 hours</p>
                </div>
              </div>
              <p className="text-ink-500 text-xs leading-relaxed">Hydration increase measured on a dry skin panel.</p>
            </div>

            {/* Reef-safe + vegan row */}
            <div className="lg:col-span-2 rounded-2xl p-6 bg-ink-50 border border-ink-100">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Leaf size={13} className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-ink-900 tracking-tight">Reef-Safe</p>
                    <p className="text-ink-500 text-xs leading-relaxed mt-0.5">No oxybenzone, octinoxate, or octisalate: the UV filters banned under Hawaii and Palau reef protection laws.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Leaf size={13} className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-ink-900 tracking-tight">Vegan and Cruelty-Free</p>
                    <p className="text-ink-500 text-xs leading-relaxed mt-0.5">Full ingredient list reviewed. No animal-derived ingredients. No animal testing.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fragrance-free — col-span-2 */}
            <div className="lg:col-span-2 rounded-2xl p-6 bg-ink-50 border border-ink-100">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={13} className="text-teal-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-ink-900 tracking-tight">Fragrance-Free: Independently Confirmed</p>
                  <p className="text-ink-500 text-xs leading-relaxed mt-1">No fragrance, parfum, or masking fragrance in the formula. No EU fragrance allergens above the safety threshold.</p>
                </div>
              </div>
            </div>

            {/* Clean formula banner — full width */}
            <div className="lg:col-span-4 rounded-2xl overflow-hidden" style={{ background: "#0F2C2A" }}>
              <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(214, 255, 62, 0.1)", border: "1px solid rgba(214, 255, 62, 0.2)" }}>
                    <Droplets size={16} style={{ color: "#D6FF3E" }} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">Next-Generation UV Filters</h3>
                    <p className="text-teal-400 text-xs mt-0.5">Tinosorb M · Uvinul A Plus · Uvinul T 150 — all three verified present and legally permitted in India and the EU.</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 flex-wrap justify-center">
                  {["Tinosorb M", "Uvinul A Plus", "Uvinul T 150"].map((f) => (
                    <span key={f} className="text-[11px] font-semibold px-3 py-1.5 rounded-md"
                      style={{ background: "rgba(214, 255, 62, 0.1)", color: "#D6FF3E", border: "1px solid rgba(214, 255, 62, 0.2)" }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── UV FILTERS DEEP DIVE — dark editorial ─────────────── */}
      <section className="grain-overlay bg-teal-950 py-20 px-5 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto">
          <p className="text-teal-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-6">What protects your skin</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-none mb-4">
            No oxybenzone.<br />No octinoxate.<br />
            <span style={{ color: "#D6FF3E" }}>No compromise.</span>
          </h2>
          <p className="text-teal-400 text-base leading-relaxed max-w-lg mb-14">
            All three UV filters were verified as legally permitted in India and the EU,
            and confirmed present in the formula. None are on any global banned list.
          </p>

          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            {[
              {
                name: "Tinosorb M",
                inci: "Methylene Bis-Benzotriazolyl Tetramethylbutylphenol",
                role: "Broad-spectrum UVA + UVB",
                note: "One of the most advanced UV filters available. Works in both UV and visible light range. Photostable.",
              },
              {
                name: "Uvinul A Plus",
                inci: "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
                role: "Deep UVA protection",
                note: "Highly photostable UVA filter that stays effective under sun exposure without degrading.",
              },
              {
                name: "Uvinul T 150",
                inci: "Ethylhexyl Triazone",
                role: "UVB protection",
                note: "Efficient, photostable UVB filter. Also helps stabilise other UV filters in the formula.",
              },
            ].map(({ name, inci, role, note }) => (
              <div key={name} className="rounded-2xl overflow-hidden border border-teal-800">
                <div className="px-5 py-3 border-b border-teal-800 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-white text-sm font-bold tracking-tight">{name}</p>
                  <CheckCircle2 size={13} className="text-teal-600" />
                </div>
                <div className="p-5">
                  <p className="text-teal-600 text-[9px] font-mono leading-relaxed mb-3">{inci}</p>
                  <p className="text-teal-200 text-xs font-semibold mb-2">{role}</p>
                  <p className="text-teal-500 text-xs leading-relaxed">{note}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border border-teal-800 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-teal-500 text-[10px] font-bold tracking-widest uppercase mb-3">What is not in this product</p>
            <div className="flex flex-wrap gap-2">
              {["No oxybenzone", "No octinoxate", "No homosalate", "No parabens", "No phenoxyethanol", "No synthetic fragrance", "No formaldehyde releasers"].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-md"
                  style={{ background: "rgba(214, 255, 62, 0.06)", color: "#D6FF3E", border: "1px solid rgba(214, 255, 62, 0.15)" }}>
                  <CheckCircle2 size={9} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO THIS IS FOR ───────────────────────────────────── */}
      <section className="bg-ink-50 border-y border-ink-100 py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="lg:w-1/3">
              <p className="text-teal-600 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Formula reviewed by our panel</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-ink-950 tracking-tight leading-tight">
                Who this<br />is for
              </h2>
            </div>
            <div className="lg:w-2/3 grid sm:grid-cols-2 gap-3">
              {[
                { title: "Dry skin", detail: "Multiple humectants including Hyaluronic Acid, Polyglutamic Acid, and Ectoin deliver and lock in hydration all day.", b: "border-l-teal-600" },
                { title: "Oily and combination skin", detail: "Clinically tested on oily and mixed-oily skin. Lightweight fluid texture. Zero new comedones in the 28-day study.", b: "border-l-coral-500" },
                { title: "Sensitive skin", detail: "Fragrance-free formula. No parabens, phenoxyethanol, or synthetic colours. Dermatologist-tested with zero irritation.", b: "border-l-sky-500" },
                { title: "Eye area", detail: "Ophthalmologist-tested. Safe for use around the eye area, confirmed in a dedicated 3-day ocular safety study.", b: "border-l-violet-500" },
                { title: "Daily wear", detail: "Designed for all-day use. Breathable, non-greasy finish. Pairs with your existing routine.", b: "border-l-gold-500" },
                { title: "Eco-conscious users", detail: "No oxybenzone or octinoxate. Vegan formula. Cruelty-free. No reef-toxic UV filters.", b: "border-l-teal-600" },
              ].map(({ title, detail, b }) => (
                <div key={title} className={`bg-white rounded-xl p-5 border border-ink-200 border-l-4 ${b}`}>
                  <p className="text-sm font-bold text-ink-900 tracking-tight mb-1.5">{title}</p>
                  <p className="text-xs text-ink-500 leading-relaxed">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT CERTIFICATION MEANS ─────────────────────────── */}
      <section className="bg-white py-20 px-5 border-b border-ink-100">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-14">
            <div className="flex-shrink-0 text-center lg:text-left">
              <div className="relative w-20 h-20 mx-auto lg:mx-0 mb-4">
                <div className="absolute inset-0 rounded-full ring-1 ring-teal-200 ring-offset-4" />
                <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center">
                  <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={60} height={60} className="object-contain" />
                </div>
              </div>
              <p className="text-xs font-bold text-ink-900 tracking-tight">The Clean Sheet</p>
              <p className="text-[10px] text-ink-400">Independent Certification</p>
            </div>

            <div className="flex-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-ink-950 tracking-tight mb-5">What certification means</h2>
              <p className="text-ink-500 text-sm leading-relaxed mb-4">
                The Clean Sheet is an independent certification body. We have no commercial relationship
                with CodeSkin. A panel of cosmetic scientists, toxicologists, regulatory specialists,
                a microbiologist, a claims evaluator, and a dermatologist reviewed the formula,
                lab reports, clinical studies, and label. Certified only what the evidence supports.
              </p>
              <p className="text-ink-500 text-sm leading-relaxed mb-10">
                Our methodology is built on EU cosmetic safety science, India&apos;s Cosmetics Rules 2020,
                ISO testing standards, and IFRA fragrance guidelines. We set the trust ceiling above
                what regulations require.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: "5", label: "Evaluation layers", color: "text-teal-600", bg: "bg-teal-50 border-teal-100" },
                  { value: "12", label: "Claims assessed", color: "text-coral-500", bg: "bg-coral-50 border-coral-100" },
                  { value: "9", label: "Tests on file", color: "text-gold-500", bg: "bg-gold-50 border-gold-100" },
                  { value: "1 yr", label: "Certification validity", color: "text-teal-600", bg: "bg-teal-50 border-teal-100" },
                ].map(({ value, label, color, bg }) => (
                  <div key={label} className={`text-center rounded-xl p-5 border ${bg}`}>
                    <p className={`text-3xl font-bold tracking-tight leading-none mb-2 ${color}`}>{value}</p>
                    <p className="text-xs text-ink-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="bg-teal-950 py-14 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={20} height={20} className="object-contain" />
                <span className="text-white text-sm font-bold tracking-tight">The Clean Sheet</span>
              </div>
              <p className="text-teal-600 text-[11px]">TCS-IN-2026-048291 [SAMPLE] · Valid 15 May 2026 to 14 May 2027 [SAMPLE]</p>
            </div>

            <Link
              href="/verify/tcs-in-2026-048291-b7f2a9c1e5d3"
              className="inline-flex items-center gap-2 text-teal-300 hover:text-white text-xs font-semibold border border-teal-700 hover:border-teal-500 px-5 py-2.5 rounded-lg transition-colors"
            >
              View full technical certification
              <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-teal-900 text-center">
            <p className="text-teal-700 text-[11px]">
              Global regulations set the legal floor. The Clean Sheet sets the trust ceiling.
            </p>
            <p className="text-teal-800 text-[10px] mt-1">© The Clean Sheet 2026</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
