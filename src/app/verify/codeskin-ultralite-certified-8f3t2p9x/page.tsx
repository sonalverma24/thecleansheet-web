import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Shield, Sun, Leaf, Droplets, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++ | Independently Certified | The Clean Sheet",
  description:
    "CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++ independently certified by The Clean Sheet. Every claim verified against scientific evidence.",
  robots: { index: false, follow: false },
};

export default function ConsumerCertPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* Status bar */}
      <div className="bg-teal-950 border-b border-teal-800">
        <div className="max-w-5xl mx-auto px-5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={14} height={14} className="object-contain opacity-90" />
            <span className="text-teal-200 text-[10px] tracking-[0.15em] uppercase">The Clean Sheet</span>
            <span className="text-teal-700 text-[10px] hidden sm:block">Independent Certification</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-amber-300 text-[10px]">Sample Data: Verification Not Complete</span>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="grain-overlay bg-teal-950 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto px-5 pt-7 pb-8">

          {/* TCS identity */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 mb-5 border-b border-teal-800 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={26} height={26} className="object-contain" />
              <div>
                <p className="text-white text-xs font-medium tracking-tight">The Clean Sheet</p>
                <p className="text-teal-400 text-[10px]">Independent third-party certification body</p>
              </div>
            </div>
            <p className="text-teal-500 text-[10px] leading-relaxed max-w-xs">
              CodeSkin commissioned this certification. Our methodology and findings
              are independent. This page shows only what the evidence supports.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-medium text-white leading-tight tracking-tight mb-3 animate-fade-up">
                UltraLite Fluid Sunscreen<br />
                <span style={{ color: "#D6FF3E" }}>SPF 50+ PA++++</span>
              </h1>
              <p className="text-teal-400 text-xs mb-4 animate-fade-up delay-100">CodeSkin India</p>

              <div className="flex flex-wrap gap-1.5 mb-4 animate-fade-up delay-200">
                <span className="flex items-center gap-1 text-[10px] bg-teal-600 text-white px-2.5 py-1 rounded-full">
                  <Shield size={8} /> PRISM Core Certified
                </span>
                <span className="flex items-center gap-1 text-[10px] bg-coral-500 text-white px-2.5 py-1 rounded-full">
                  <Sun size={8} /> PRISM Sun Verified
                </span>
              </div>

              <p className="text-teal-500 text-[11px] leading-relaxed max-w-sm animate-fade-up delay-300">
                Reviewed by an independent panel of cosmetic scientists, toxicologists,
                regulatory specialists, and dermatologists against submitted laboratory evidence.
              </p>
            </div>

            <div className="flex-shrink-0 animate-fade-up delay-200">
              <div className="animate-float relative">
                <div className="relative w-28 h-36 rounded-xl overflow-hidden ring-1 ring-teal-700"
                  style={{ background: "linear-gradient(145deg, #0F2C2A 0%, #1D5550 100%)" }}>
                  <Image
                    src="https://codeskin.in/cdn/shop/files/UltraLite_Fluid_Sunscreen_bottle_s.png?v=1768211190"
                    alt="CodeSkin UltraLite Fluid Sunscreen"
                    fill className="object-contain p-2" unoptimized
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, #D6FF3E, transparent)" }} />
                </div>
                <div className="absolute -bottom-2 -right-2 drop-shadow-lg">
                  <Image src="/images/tcs-certified-badge.png" alt="TCS Certified" width={32} height={32} className="object-contain" />
                </div>
              </div>
            </div>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px mt-6 border border-teal-800 rounded-xl overflow-hidden animate-fade-up delay-400">
            {[
              { n: "59.92", label: "SPF Tested",    sub: "Label: SPF 50+" },
              { n: "22.07", label: "UVAPF",          sub: "PA++++ confirmed" },
              { n: "94%",   label: "SPF Retained",   sub: "After 80 min" },
              { n: "33",    label: "Participants",    sub: "Non-comedogenic" },
            ].map(({ n, label, sub }) => (
              <div key={label} className="bg-teal-900/60 px-3 py-3 text-center">
                <p className="text-2xl font-medium leading-none mb-1" style={{ color: "#D6FF3E" }}>{n}</p>
                <p className="text-teal-200 text-[9px] uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-teal-500 text-[9px]">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-teal-600 py-2.5 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center flex-shrink-0">
              {["SPF 50+ Verified", "PA++++ Confirmed", "Water Resistant 80 Min", "Non-Comedogenic Tested", "Dermatologist Tested", "Reef-Safe Formula", "Fragrance-Free Confirmed", "Vegan and Cruelty-Free"].map((item) => (
                <span key={item} className="flex items-center">
                  <span className="text-white text-[10px] tracking-widest uppercase px-5">{item}</span>
                  <span className="text-yellow-300 text-xs">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Section headline */}
      <section className="bg-white pt-10 pb-3 px-5">
        <div className="max-w-5xl mx-auto">
          <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-2">What was independently verified</p>
          <h2 className="text-3xl sm:text-4xl font-medium text-ink-950 tracking-tight leading-none">
            Every claim, <span className="text-ink-400">backed by science.</span>
          </h2>
        </div>
      </section>

      {/* Bento grid */}
      <section className="px-5 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">

            {/* SPF */}
            <div className="lg:col-span-2 rounded-2xl p-5 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #248179 0%, #2E9E96 70%, #45B8B0 100%)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-teal-100 text-[9px] tracking-[0.2em] uppercase">SPF Performance</span>
                <CheckCircle2 size={12} className="text-white/50" />
              </div>
              <p className="text-6xl font-medium text-white tracking-tight leading-none mb-1">50+</p>
              <p className="text-teal-100 text-[9px] tracking-widest uppercase mb-2.5">Tested at SPF 59.92</p>
              <p className="text-white/70 text-xs leading-relaxed">
                Independent lab confirmed SPF 59.92 against the label claim of SPF 50+.
                The product delivers more protection than it promises.
              </p>
            </div>

            {/* PA */}
            <div className="lg:col-span-2 rounded-2xl p-5 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #E84940 0%, #FD6158 60%, #FE7F78 100%)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-red-100 text-[9px] tracking-[0.2em] uppercase">UVA Protection</span>
                <CheckCircle2 size={12} className="text-white/50" />
              </div>
              <p className="text-4xl font-medium text-white tracking-tight leading-none mb-1">PA++++</p>
              <p className="text-red-100 text-[9px] tracking-widest uppercase mb-2.5">UVAPF tested at 22.07</p>
              <p className="text-white/70 text-xs leading-relaxed">
                PA++++ is the highest UVA tier. UVAPF of 16 or above required.
                This product tested at 22.07.
              </p>
            </div>

            {/* Water resistance */}
            <div className="lg:col-span-3 rounded-2xl p-5 bg-teal-950">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-teal-500 text-[9px] tracking-[0.2em] uppercase block mb-1">Water Resistance</span>
                  <h3 className="text-base font-medium text-white tracking-tight">Water Resistant for 80 Minutes</h3>
                </div>
                <div className="text-center flex-shrink-0 ml-4">
                  <p className="text-2xl font-medium leading-none" style={{ color: "#D6FF3E" }}>94%</p>
                  <p className="text-teal-500 text-[9px] mt-0.5">SPF after 80 min</p>
                </div>
              </div>
              <p className="text-teal-400 text-xs leading-relaxed">
                After 80 minutes of water immersion, 94% of original SPF retained. Tested to ISO 16217 standard.
              </p>
            </div>

            {/* Non-comedogenic */}
            <div className="lg:col-span-1 rounded-2xl p-4 bg-ink-50 border border-ink-100 flex flex-col justify-between">
              <div>
                <span className="text-ink-400 text-[9px] tracking-[0.2em] uppercase block mb-1">Skin</span>
                <h3 className="text-sm font-medium text-ink-950 tracking-tight mb-1.5">Non-Comedogenic</h3>
                <p className="text-ink-500 text-xs leading-relaxed">28-day study, 33 adults. Zero new comedones. 61.5% reduction in acne lesions.</p>
              </div>
              <span className="inline-block mt-2.5 text-[10px] bg-teal-100 text-teal-700 px-2 py-1 rounded-md">33 participants</span>
            </div>

            {/* Dermatologist + Ophthalmologist */}
            <div className="lg:col-span-2 rounded-2xl p-4 bg-ink-50 border border-ink-100">
              <span className="text-ink-400 text-[9px] tracking-[0.2em] uppercase block mb-2.5">Clinical Testing</span>
              <div className="space-y-2.5">
                {[
                  { title: "Dermatologist-Tested", body: "Patch test under dermatologist supervision. Zero irritation across all participants." },
                  { title: "Ophthalmologist-Tested", body: "3-day ocular safety study, twice-daily application. No eye irritation reported." },
                ].map(({ title, body }) => (
                  <div key={title} className="flex items-start gap-2">
                    <CheckCircle2 size={11} className="text-teal-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-ink-900 tracking-tight">{title}</p>
                      <p className="text-ink-500 text-xs leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hydration */}
            <div className="lg:col-span-2 rounded-2xl p-4 bg-teal-50 border border-teal-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-teal-600 text-[9px] tracking-[0.2em] uppercase">Hydration</span>
                <CheckCircle2 size={11} className="text-teal-600" />
              </div>
              <h3 className="text-sm font-medium text-ink-950 tracking-tight mb-2.5">Deeply Hydrating</h3>
              <div className="flex gap-5 mb-1.5">
                <div className="text-center">
                  <p className="text-xl font-medium text-teal-600 tracking-tight leading-none">65%</p>
                  <p className="text-ink-400 text-[10px] mt-0.5">at 8 hrs</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-medium text-teal-600 tracking-tight leading-none">38%</p>
                  <p className="text-ink-400 text-[10px] mt-0.5">at 24 hrs</p>
                </div>
              </div>
              <p className="text-ink-400 text-[10px]">Hydration increase on dry skin panel.</p>
            </div>

            {/* Reef + Vegan */}
            <div className="lg:col-span-2 rounded-2xl p-4 bg-ink-50 border border-ink-100">
              <div className="space-y-2.5">
                {[
                  { title: "Reef-Safe", body: "No oxybenzone, octinoxate, or octisalate: UV filters banned under Hawaii and Palau reef protection laws." },
                  { title: "Vegan and Cruelty-Free", body: "Full ingredient list reviewed. No animal-derived ingredients. No animal testing." },
                ].map(({ title, body }) => (
                  <div key={title} className="flex items-start gap-2">
                    <Leaf size={11} className="text-teal-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-ink-900 tracking-tight">{title}</p>
                      <p className="text-ink-500 text-xs leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fragrance */}
            <div className="lg:col-span-2 rounded-2xl p-4 bg-ink-50 border border-ink-100">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={11} className="text-teal-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-ink-900 tracking-tight">Fragrance-Free: Independently Confirmed</p>
                  <p className="text-ink-500 text-xs leading-relaxed mt-0.5">No fragrance, parfum, or masking fragrance. No EU fragrance allergens above the safety threshold.</p>
                </div>
              </div>
            </div>

            {/* UV filters banner */}
            <div className="lg:col-span-4 rounded-xl overflow-hidden" style={{ background: "#0F2C2A" }}>
              <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(214,255,62,0.1)", border: "1px solid rgba(214,255,62,0.2)" }}>
                    <Droplets size={13} style={{ color: "#D6FF3E" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white tracking-tight">Next-Generation UV Filters</p>
                    <p className="text-teal-400 text-xs">All three verified present and legally permitted in India and the EU.</p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {["Tinosorb M", "Uvinul A Plus", "Uvinul T 150"].map((f) => (
                    <span key={f} className="text-[10px] px-2.5 py-1 rounded-md"
                      style={{ background: "rgba(214,255,62,0.1)", color: "#D6FF3E", border: "1px solid rgba(214,255,62,0.2)" }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* UV filters dark section */}
      <section className="grain-overlay bg-teal-950 py-12 px-5 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto">
          <p className="text-teal-500 text-[9px] tracking-[0.2em] uppercase mb-3">What protects your skin</p>
          <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-tight leading-none mb-2">
            No oxybenzone. No octinoxate. <span style={{ color: "#D6FF3E" }}>No compromise.</span>
          </h2>
          <p className="text-teal-400 text-xs leading-relaxed max-w-lg mb-7">
            All three UV filters verified legally permitted in India and the EU, confirmed present in the formula. None on any global banned list.
          </p>

          <div className="grid sm:grid-cols-3 gap-2.5 mb-3">
            {[
              { name: "Tinosorb M", inci: "Methylene Bis-Benzotriazolyl Tetramethylbutylphenol", role: "Broad-spectrum UVA + UVB", note: "One of the most advanced filters available. Photostable." },
              { name: "Uvinul A Plus", inci: "Diethylamino Hydroxybenzoyl Hexyl Benzoate", role: "Deep UVA protection", note: "Highly photostable. Stays effective without degrading." },
              { name: "Uvinul T 150", inci: "Ethylhexyl Triazone", role: "UVB protection", note: "Efficient UVB filter. Helps stabilise other filters." },
            ].map(({ name, inci, role, note }) => (
              <div key={name} className="rounded-xl overflow-hidden border border-teal-800">
                <div className="px-4 py-2.5 border-b border-teal-800 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-white text-xs font-medium">{name}</p>
                  <CheckCircle2 size={11} className="text-teal-600" />
                </div>
                <div className="p-4">
                  <p className="text-teal-600 text-[9px] font-mono leading-relaxed mb-2">{inci}</p>
                  <p className="text-teal-200 text-xs mb-1.5">{role}</p>
                  <p className="text-teal-500 text-xs leading-relaxed">{note}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border border-teal-800 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-teal-500 text-[9px] tracking-widest uppercase mb-2">What is not in this product</p>
            <div className="flex flex-wrap gap-1.5">
              {["No oxybenzone", "No octinoxate", "No homosalate", "No parabens", "No phenoxyethanol", "No synthetic fragrance", "No formaldehyde releasers"].map((item) => (
                <span key={item} className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-md"
                  style={{ background: "rgba(214,255,62,0.06)", color: "#D6FF3E", border: "1px solid rgba(214,255,62,0.15)" }}>
                  <CheckCircle2 size={8} />{item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who this is for */}
      <section className="bg-ink-50 border-y border-ink-100 py-12 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="lg:w-1/3">
              <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-2">Formula reviewed by our panel</p>
              <h2 className="text-2xl font-medium text-ink-950 tracking-tight leading-tight">Who this is for</h2>
            </div>
            <div className="lg:w-2/3 grid sm:grid-cols-2 gap-2">
              {[
                { title: "Dry skin", detail: "Multiple humectants — Hyaluronic Acid, Polyglutamic Acid, Ectoin — deliver and lock in hydration all day.", b: "border-l-teal-600" },
                { title: "Oily and combination skin", detail: "Clinically tested on oily and mixed-oily skin. Zero new comedones in the 28-day study.", b: "border-l-coral-500" },
                { title: "Sensitive skin", detail: "Fragrance-free. No parabens, phenoxyethanol, or synthetic colours. Zero irritation in dermatologist testing.", b: "border-l-sky-500" },
                { title: "Eye area", detail: "Ophthalmologist-tested. Safe for use around the eye area, confirmed in a 3-day ocular safety study.", b: "border-l-violet-500" },
                { title: "Daily wear", detail: "Breathable, non-greasy finish. Designed for all-day use.", b: "border-l-gold-500" },
                { title: "Eco-conscious users", detail: "No oxybenzone or octinoxate. Vegan. Cruelty-free. No reef-toxic UV filters.", b: "border-l-teal-600" },
              ].map(({ title, detail, b }) => (
                <div key={title} className={`bg-white rounded-xl p-4 border border-ink-200 border-l-4 ${b}`}>
                  <p className="text-xs font-medium text-ink-900 tracking-tight mb-1">{title}</p>
                  <p className="text-xs text-ink-500 leading-relaxed">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certification */}
      <section className="bg-white py-12 px-5 border-b border-ink-100">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            <div className="flex-shrink-0 text-center lg:text-left">
              <div className="relative w-14 h-14 mx-auto lg:mx-0 mb-2">
                <div className="absolute inset-0 rounded-full ring-1 ring-teal-200 ring-offset-2" />
                <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
                  <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={42} height={42} className="object-contain" />
                </div>
              </div>
              <p className="text-xs font-medium text-ink-900 tracking-tight">The Clean Sheet</p>
              <p className="text-[10px] text-ink-400">Independent Certification</p>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-medium text-ink-950 tracking-tight mb-3">What certification means</h2>
              <p className="text-ink-500 text-sm leading-relaxed mb-2">
                The Clean Sheet is an independent certification body. CodeSkin commissioned this
                certification — our panel assessments are editorially independent. A panel of cosmetic
                scientists, toxicologists, regulatory specialists, a microbiologist, a claims evaluator,
                and a dermatologist reviewed the formula, lab reports, clinical studies, and label.
                Certified only what the evidence supports.
              </p>
              <p className="text-ink-500 text-sm leading-relaxed mb-6">
                Our methodology is built on EU cosmetic safety science, India&apos;s Cosmetics Rules 2020,
                ISO testing standards, and IFRA fragrance guidelines.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: "5",    label: "Evaluation layers",     color: "text-teal-600",  bg: "bg-teal-50 border-teal-100" },
                  { value: "12",   label: "Claims assessed",       color: "text-coral-500", bg: "bg-coral-50 border-coral-100" },
                  { value: "9",    label: "Tests on file",         color: "text-gold-500",  bg: "bg-gold-50 border-gold-100" },
                  { value: "1 yr", label: "Certification validity", color: "text-teal-600", bg: "bg-teal-50 border-teal-100" },
                ].map(({ value, label, color, bg }) => (
                  <div key={label} className={`text-center rounded-xl p-3.5 border ${bg}`}>
                    <p className={`text-xl font-medium tracking-tight leading-none mb-1 ${color}`}>{value}</p>
                    <p className="text-[10px] text-ink-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-950 py-8 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
                <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={14} height={14} className="object-contain" />
                <span className="text-white text-xs font-medium">The Clean Sheet</span>
              </div>
              <p className="text-teal-600 text-[10px]">TCS-IN-2026-048291 [SAMPLE] · Valid 15 May 2026 to 14 May 2027 [SAMPLE]</p>
            </div>
            <Link href="/verify/tcs-in-2026-048291-b7f2a9c1e5d3"
              className="inline-flex items-center gap-1.5 text-teal-300 hover:text-white text-[11px] border border-teal-700 hover:border-teal-500 px-4 py-2 rounded-lg transition-colors">
              View full technical certification <ArrowUpRight size={11} />
            </Link>
          </div>
          <div className="mt-5 pt-4 border-t border-teal-900 text-center">
            <p className="text-teal-700 text-[10px]">Global regulations set the legal floor. The Clean Sheet sets the trust ceiling.</p>
            <p className="text-teal-800 text-[10px] mt-0.5">© The Clean Sheet 2026</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
