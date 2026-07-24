import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Shield, Sun, ArrowUpRight } from "lucide-react";
import CertBento from "./CertBento";

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
      <div style={{ background: "#081918", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto px-5 py-1.5 flex items-center justify-between">
          <span className="text-teal-600 text-[9px] tracking-[0.18em] uppercase">
            The Clean Sheet<span className="hidden sm:inline"> · Independent Certification</span>
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="hidden sm:inline text-amber-500/70 text-[9px]">Sample data</span>
          </div>
        </div>
      </div>

      {/* HERO - compact */}
      <section className="grain-overlay bg-teal-950 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto px-5 pt-7 pb-8">

          <div className="mb-6 animate-fade-in">
            <span className="inline-flex items-center gap-2 border rounded-full px-3 py-1"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
              <Image src="/images/certified-badge.png" alt="" width={10} height={10} className="object-contain opacity-80" />
              <span className="text-teal-300 text-[9px] tracking-[0.15em] uppercase">Independently Certified by The Clean Sheet</span>
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-14">

            <div className="flex-1 min-w-0">
              <p className="text-teal-600 text-[9px] tracking-widest uppercase mb-2 animate-fade-up">CodeSkin India</p>

              {/* Product name + inline image on mobile */}
              <div className="flex flex-row items-start justify-between gap-4 lg:block">
                <div className="flex-1 min-w-0">
                  <h1 className="font-medium text-white leading-none tracking-tight mb-2 animate-fade-up delay-100"
                    style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)" }}>
                    UltraLite Fluid Sunscreen
                  </h1>

                  <p className="text-xl font-medium animate-fade-up delay-200" style={{ color: "#D6FF3E" }}>
                    SPF 50+ PA++++
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-4 animate-fade-up delay-300">
                    <span className="flex items-center gap-1 text-[9px] text-teal-400 border border-teal-800 px-2 py-0.5 rounded-full">
                      <Shield size={7} /> PRISM Core
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-teal-400 border border-teal-800 px-2 py-0.5 rounded-full">
                      <Sun size={7} /> PRISM Sun Verified
                    </span>
                  </div>
                </div>

                {/* Product image - visible inline on mobile, hidden on lg (shown separately below) */}
                <div className="flex-shrink-0 lg:hidden animate-fade-up delay-200">
                  <div className="relative w-20 h-24 sm:w-28 sm:h-36 rounded-xl overflow-hidden"
                    style={{
                      background: "linear-gradient(160deg, #0F2C2A 0%, #174039 50%, #1D5550 100%)",
                      boxShadow: "0 24px 48px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)"
                    }}>
                    <Image
                      src="https://codeskin.in/cdn/shop/files/UltraLite_Fluid_Sunscreen_bottle_s.png?v=1768211190"
                      alt="CodeSkin UltraLite Fluid Sunscreen"
                      fill className="object-contain p-2" unoptimized
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-px rounded-lg overflow-hidden animate-fade-up delay-400"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  { n: "59.92", label: "SPF Tested",  sub: "Label claims 50+" },
                  { n: "22.07", label: "UVAPF",        sub: "PA++++ confirmed" },
                  { n: "94%",   label: "Retained",     sub: "After 80 min water" },
                  { n: "33",    label: "Participants",  sub: "Clinical study" },
                ].map(({ n, label, sub }) => (
                  <div key={label} className="px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-base font-medium leading-none mb-0.5" style={{ color: "#D6FF3E" }}>{n}</p>
                    <p className="text-teal-400 text-[9px] tracking-wide">{label}</p>
                    <p className="text-teal-700 text-[9px]">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Product image - visible only on lg+ */}
            <div className="hidden lg:block flex-shrink-0 animate-fade-up delay-200">
              <div className="animate-float relative">
                <div className="relative w-32 h-40 rounded-xl overflow-hidden"
                  style={{
                    background: "linear-gradient(160deg, #0F2C2A 0%, #174039 50%, #1D5550 100%)",
                    boxShadow: "0 24px 48px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)"
                  }}>
                  <Image
                    src="https://codeskin.in/cdn/shop/files/UltraLite_Fluid_Sunscreen_bottle_s.png?v=1768211190"
                    alt="CodeSkin UltraLite Fluid Sunscreen"
                    fill className="object-contain p-2" unoptimized
                  />
                </div>
                <div className="absolute -bottom-2.5 -right-2.5 drop-shadow-xl">
                  <Image src="/images/certified-badge.png" alt="TCS Certified" width={30} height={30} className="object-contain" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section intro */}
      <section className="bg-white pt-10 pb-3 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-1.5">Independently verified</p>
            <h2 className="text-2xl sm:text-3xl font-medium text-ink-950 tracking-tight leading-none">
              What the evidence shows
            </h2>
          </div>
          <p className="text-ink-400 text-xs max-w-xs leading-relaxed mt-1 sm:mt-0">
            Every item below is backed by a submitted lab report, clinical study, or verified ingredient list. Nothing else appears here.
          </p>
        </div>
      </section>

      <CertBento />

      {/* UV filters - light, authoritative */}
      <section className="bg-white border-t border-b border-ink-100 py-12 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10">

            <div className="lg:w-56 flex-shrink-0">
              <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-2">What protects your skin</p>
              <h2 className="text-2xl font-medium text-ink-950 tracking-tight leading-tight">UV filter verification</h2>
              <p className="text-ink-400 text-xs leading-relaxed mt-2">
                All three filters confirmed present, legally permitted in India and the EU, and on no global banned list.
              </p>
            </div>

            <div className="flex-1">
              <div className="grid sm:grid-cols-3 gap-2 mb-3">
                {[
                  {
                    name: "Tinosorb M",
                    inci: "Methylene Bis-Benzotriazolyl Tetramethylbutylphenol",
                    role: "Broad-spectrum UVA + UVB",
                    note: "Advanced photostable filter. Works across UV and visible light range.",
                  },
                  {
                    name: "Uvinul A Plus",
                    inci: "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
                    role: "Deep UVA protection",
                    note: "Photostable. Stays effective under sun exposure without degrading.",
                  },
                  {
                    name: "Uvinul T 150",
                    inci: "Ethylhexyl Triazone",
                    role: "UVB protection",
                    note: "Efficient UVB filter. Helps stabilise other UV filters in the formula.",
                  },
                ].map(({ name, inci, role, note }) => (
                  <div key={name} className="rounded-xl overflow-hidden border border-ink-100 bg-ink-50">
                    <div className="px-3.5 py-2.5 border-b border-ink-100 flex items-center justify-between bg-white">
                      <p className="text-ink-900 text-xs font-medium">{name}</p>
                      <CheckCircle2 size={10} className="text-teal-600" />
                    </div>
                    <div className="p-3.5">
                      <p className="text-ink-400 text-[9px] font-mono leading-relaxed mb-2">{inci}</p>
                      <p className="text-ink-700 text-xs mb-1">{role}</p>
                      <p className="text-ink-500 text-[11px] leading-relaxed">{note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-3.5 bg-ink-50 border border-ink-100">
                <p className="text-ink-400 text-[9px] tracking-widest uppercase mb-2">Not in this product</p>
                <div className="flex flex-wrap gap-1.5">
                  {["No oxybenzone", "No octinoxate", "No homosalate", "No parabens", "No phenoxyethanol", "No synthetic fragrance", "No formaldehyde releasers"].map((item) => (
                    <span key={item} className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-ink-200 text-ink-600">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Who this is for */}
      <section className="bg-ink-50 border-b border-ink-100 py-12 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="lg:w-56 flex-shrink-0">
              <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-2">Panel review</p>
              <h2 className="text-2xl font-medium text-ink-950 tracking-tight leading-tight">Who this is for</h2>
              <p className="text-ink-400 text-xs leading-relaxed mt-2">
                Suitability based on verified test data, not brand positioning.
              </p>
            </div>
            <div className="flex-1 grid sm:grid-cols-2 gap-2">
              {[
                { title: "Dry skin", detail: "Hyaluronic Acid, Polyglutamic Acid, and Ectoin deliver and sustain hydration. 65% increase at 8 hours on dry skin panel." },
                { title: "Oily and combination skin", detail: "Clinically tested on oily and mixed-oily skin. Zero new comedones in 28-day study." },
                { title: "Sensitive skin", detail: "Fragrance-free. No parabens, phenoxyethanol, or synthetic colours. Zero irritation in dermatologist testing." },
                { title: "Eye area", detail: "Ophthalmologist-tested. Confirmed safe for use around the eye area in a dedicated 3-day ocular safety study." },
                { title: "Daily wear", detail: "Non-greasy, breathable finish. Designed for all-day use." },
                { title: "Eco-conscious users", detail: "No oxybenzone or octinoxate. Vegan. Cruelty-free. No reef-toxic UV filters." },
              ].map(({ title, detail }) => (
                <div key={title} className="rounded-xl p-3.5 border border-ink-100 bg-white">
                  <p className="text-xs font-medium text-ink-900 tracking-tight mb-1">{title}</p>
                  <p className="text-xs text-ink-500 leading-relaxed">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How testing was conducted */}
      <section className="bg-white border-b border-ink-100 py-12 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="lg:w-56 flex-shrink-0">
              <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-2">Methodology</p>
              <h2 className="text-2xl font-medium text-ink-950 tracking-tight leading-tight">How testing was conducted</h2>
              <p className="text-ink-400 text-xs leading-relaxed mt-2">
                Independent. Randomised samples. No brand involvement in selection.
              </p>
            </div>
            <div className="flex-1 grid sm:grid-cols-3 gap-2">
              {[
                { n: "01", title: "SPF and UVA testing",  method: "ISO 24444 and JCIA in-vitro method",    result: "SPF 59.92. UVAPF 22.07." },
                { n: "02", title: "Water resistance",      method: "ISO 16217 water immersion protocol",    result: "94% SPF retained after 80 minutes." },
                { n: "03", title: "Non-comedogenic",       method: "28-day randomised clinical study",      result: "33 participants. Zero new comedones." },
              ].map(({ n, title, method, result }) => (
                <div key={n} className="bg-ink-50 rounded-xl p-4 border border-ink-100">
                  <p className="text-ink-300 text-xs font-medium mb-2.5">{n}</p>
                  <p className="text-sm font-medium text-ink-900 tracking-tight mb-1.5">{title}</p>
                  <p className="text-ink-400 text-[11px] leading-relaxed mb-2">{method}</p>
                  <p className="text-teal-600 text-[11px] leading-relaxed">{result}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What certification means */}
      <section className="bg-ink-50 border-b border-ink-100 py-12 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-10">
            <div className="flex-shrink-0 lg:w-56">
              <div className="relative w-10 h-10 mb-3">
                <div className="absolute inset-0 rounded-full ring-1 ring-teal-200 ring-offset-2" />
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                  <Image src="/images/certified-badge.png" alt="The Clean Sheet" width={28} height={28} className="object-contain" />
                </div>
              </div>
              <p className="text-sm font-medium text-ink-900 tracking-tight">The Clean Sheet</p>
              <p className="text-[10px] text-ink-400 mt-0.5">Independent Certification Body</p>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-medium text-ink-950 tracking-tight mb-3">What certification means</h2>
              <p className="text-ink-500 text-sm leading-relaxed mb-2">
                The Clean Sheet is an independent certification body. CodeSkin submitted to this certification.
                Our panel assessments are editorially independent. A panel of cosmetic scientists, toxicologists,
                regulatory specialists, a microbiologist, a claims evaluator, and a dermatologist reviewed the
                formula, lab reports, clinical studies, and label. Certified only what the evidence supports.
              </p>
              <p className="text-ink-500 text-sm leading-relaxed mb-6">
                Methodology built on EU cosmetic safety science, India&apos;s Cosmetics Rules 2020,
                ISO testing standards, and IFRA fragrance guidelines. We set the trust ceiling above what regulations require.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: "5",    label: "Evaluation layers" },
                  { value: "12",   label: "Claims assessed" },
                  { value: "9",    label: "Tests on file" },
                  { value: "1 yr", label: "Certification validity" },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center rounded-xl p-3.5 border border-ink-100 bg-white">
                    <p className="text-xl font-medium text-teal-600 tracking-tight leading-none mb-1">{value}</p>
                    <p className="text-[10px] text-ink-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-950 py-7 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Image src="/images/certified-badge.png" alt="The Clean Sheet" width={12} height={12} className="object-contain" />
                <span className="text-white text-xs font-medium">The Clean Sheet</span>
              </div>
              <p className="text-teal-800 text-[10px] truncate">TCS-IN-2026-048291 [SAMPLE] · Valid 15 May 2026 to 14 May 2027 [SAMPLE]</p>
            </div>
            <Link href="/verify/tcs-in-2026-048291-b7f2a9c1e5d3"
              className="inline-flex items-center gap-1.5 text-teal-500 hover:text-white text-[11px] border border-teal-900 hover:border-teal-700 px-3.5 py-1.5 rounded-lg transition-colors flex-shrink-0">
              View full technical certification <ArrowUpRight size={10} />
            </Link>
          </div>
          <div className="mt-5 pt-4 border-t border-teal-900 text-center">
            <p className="text-teal-800 text-[10px]">Global regulations set the legal floor. The Clean Sheet sets the trust ceiling.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
