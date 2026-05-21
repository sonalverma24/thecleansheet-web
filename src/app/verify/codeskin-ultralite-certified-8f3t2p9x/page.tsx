import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Shield, Sun, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++ | Independently Certified | The Clean Sheet",
  description:
    "CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++ independently certified by The Clean Sheet. Every claim verified against scientific evidence.",
  robots: { index: false, follow: false },
};

export default function ConsumerCertPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* Status bar — one line, no logo, no duplication */}
      <div style={{ background: "#081918", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto px-5 py-1.5 flex items-center justify-between">
          <span className="text-teal-600 text-[9px] tracking-[0.18em] uppercase">The Clean Sheet — Independent Certification</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-500/70 text-[9px]">Sample data</span>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="grain-overlay bg-teal-950 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto px-5 pt-12 pb-12">

          {/* TCS identity — once, clearly, as a pill at the top */}
          <div className="mb-10 animate-fade-in">
            <span className="inline-flex items-center gap-2 border rounded-full px-3.5 py-1.5"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
              <Image src="/images/tcs-certified-badge.png" alt="" width={12} height={12} className="object-contain opacity-80" />
              <span className="text-teal-300 text-[10px] tracking-[0.15em] uppercase">Independently Certified by The Clean Sheet</span>
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">

            {/* Left: product identity */}
            <div className="flex-1 min-w-0">
              <p className="text-teal-600 text-[10px] tracking-widest uppercase mb-3 animate-fade-up">CodeSkin India</p>

              <h1 className="font-medium text-white leading-none tracking-tight mb-3 animate-fade-up delay-100"
                style={{ fontSize: "clamp(2.2rem, 6vw, 3.5rem)" }}>
                UltraLite<br />Fluid Sunscreen
              </h1>

              <p className="text-2xl font-medium animate-fade-up delay-200" style={{ color: "#D6FF3E" }}>
                SPF 50+ PA++++
              </p>

              <div className="flex flex-wrap gap-1.5 mt-6 animate-fade-up delay-300">
                <span className="flex items-center gap-1 text-[9px] text-teal-400 border border-teal-800 px-2.5 py-1 rounded-full">
                  <Shield size={8} /> PRISM Core Certified
                </span>
                <span className="flex items-center gap-1 text-[9px] text-teal-400 border border-teal-800 px-2.5 py-1 rounded-full">
                  <Sun size={8} /> PRISM Sun Verified
                </span>
              </div>

              {/* Test numbers — data, not decoration */}
              <div className="mt-10 grid grid-cols-2 gap-px rounded-xl overflow-hidden animate-fade-up delay-400"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  { n: "59.92", label: "SPF Tested", sub: "Label claims 50+" },
                  { n: "22.07", label: "UVAPF",      sub: "PA++++ confirmed" },
                  { n: "94%",   label: "Retained",   sub: "After 80 min water" },
                  { n: "33",    label: "Participants", sub: "Clinical study" },
                ].map(({ n, label, sub }) => (
                  <div key={label} className="px-4 py-3.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-lg font-medium leading-none mb-0.5" style={{ color: "#D6FF3E" }}>{n}</p>
                    <p className="text-teal-400 text-[10px] tracking-wide">{label}</p>
                    <p className="text-teal-700 text-[9px]">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: product image — prominent, clean */}
            <div className="flex-shrink-0 animate-fade-up delay-200 self-center">
              <div className="animate-float relative">
                <div className="relative w-44 h-56 rounded-2xl overflow-hidden"
                  style={{
                    background: "linear-gradient(160deg, #0F2C2A 0%, #174039 50%, #1D5550 100%)",
                    boxShadow: "0 40px 80px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)"
                  }}>
                  <Image
                    src="https://codeskin.in/cdn/shop/files/UltraLite_Fluid_Sunscreen_bottle_s.png?v=1768211190"
                    alt="CodeSkin UltraLite Fluid Sunscreen"
                    fill className="object-contain p-3" unoptimized
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 drop-shadow-xl">
                  <Image src="/images/tcs-certified-badge.png" alt="TCS Certified" width={38} height={38} className="object-contain" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section intro */}
      <section className="bg-white pt-14 pb-4 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-2">Independently verified</p>
            <h2 className="text-3xl sm:text-4xl font-medium text-ink-950 tracking-tight leading-none">
              What the evidence shows
            </h2>
          </div>
          <p className="text-ink-400 text-xs max-w-xs leading-relaxed">
            Every item below is backed by a submitted lab report, clinical study, or verified ingredient list. Nothing else appears here.
          </p>
        </div>
      </section>

      {/* Bento grid */}
      <section className="px-5 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">

            {/* SPF hero tile */}
            <div className="lg:col-span-2 rounded-2xl p-7 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1D5550 0%, #248179 65%, #2E9E96 100%)" }}>
              <CheckCircle2 size={13} className="absolute top-5 right-5 text-white/25" />
              <p className="text-teal-200 text-[9px] tracking-[0.2em] uppercase mb-5">SPF Performance</p>
              <p className="font-medium text-white tracking-tight leading-none"
                style={{ fontSize: "clamp(3.5rem, 8vw, 5rem)" }}>
                59<span className="text-teal-300/70">.92</span>
              </p>
              <p className="text-teal-200 text-xs mt-1.5 mb-3">Tested SPF — label claims 50+</p>
              <p className="text-white/50 text-xs leading-relaxed max-w-xs">
                Independent lab test. The product delivers more protection than labelled.
              </p>
            </div>

            {/* PA++++ hero tile */}
            <div className="lg:col-span-2 rounded-2xl p-7 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #B83028 0%, #E84940 65%, #FD6158 100%)" }}>
              <CheckCircle2 size={13} className="absolute top-5 right-5 text-white/25" />
              <p className="text-red-200 text-[9px] tracking-[0.2em] uppercase mb-5">UVA Protection</p>
              <p className="text-5xl font-medium text-white tracking-tight leading-none mb-1.5">PA++++</p>
              <p className="text-red-200 text-xs mb-3">UVAPF tested at 22.07</p>
              <p className="text-white/50 text-xs leading-relaxed">
                Highest UVA protection tier. UVAPF 16+ required. Tested at 22.07.
              </p>
            </div>

            {/* Water resistance */}
            <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: "#081918" }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-teal-700 text-[9px] tracking-[0.2em] uppercase mb-2">Water Resistance</p>
                  <h3 className="text-sm font-medium text-white tracking-tight">80-Minute Water Resistant</h3>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-2xl font-medium leading-none" style={{ color: "#D6FF3E" }}>94%</p>
                  <p className="text-teal-700 text-[9px] mt-0.5">SPF retained</p>
                </div>
              </div>
              <p className="text-teal-600 text-xs leading-relaxed mt-3">
                After 80 minutes of water immersion. Tested to ISO 16217.
              </p>
            </div>

            {/* Non-comedogenic */}
            <div className="lg:col-span-1 rounded-2xl p-5 bg-ink-50 border border-ink-100">
              <p className="text-ink-400 text-[9px] tracking-[0.2em] uppercase mb-2.5">Skin safety</p>
              <h3 className="text-sm font-medium text-ink-950 tracking-tight mb-2">Non-Comedogenic</h3>
              <p className="text-ink-500 text-xs leading-relaxed">28-day study. 33 adults. Zero new comedones. 61.5% reduction in acne lesions.</p>
            </div>

            {/* Dermatologist + Ophthalmologist */}
            <div className="lg:col-span-1 rounded-2xl p-5 bg-ink-50 border border-ink-100">
              <p className="text-ink-400 text-[9px] tracking-[0.2em] uppercase mb-3">Clinical testing</p>
              <div className="space-y-3">
                {[
                  { title: "Dermatologist-Tested", body: "Patch test. Zero irritation across all participants." },
                  { title: "Ophthalmologist-Tested", body: "3-day ocular safety study. No eye irritation." },
                ].map(({ title, body }) => (
                  <div key={title} className="flex items-start gap-2">
                    <CheckCircle2 size={11} className="text-teal-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-ink-900 tracking-tight">{title}</p>
                      <p className="text-ink-500 text-[11px] leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hydration */}
            <div className="lg:col-span-2 rounded-2xl p-5 bg-teal-50 border border-teal-100">
              <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-3">Hydration</p>
              <h3 className="text-sm font-medium text-ink-950 tracking-tight mb-4">Clinically Measured Hydration Increase</h3>
              <div className="flex gap-8">
                <div>
                  <p className="text-2xl font-medium text-teal-600 tracking-tight leading-none">65%</p>
                  <p className="text-ink-400 text-[10px] mt-1">at 8 hours</p>
                </div>
                <div>
                  <p className="text-2xl font-medium text-teal-600 tracking-tight leading-none">38%</p>
                  <p className="text-ink-400 text-[10px] mt-1">at 24 hours</p>
                </div>
              </div>
              <p className="text-ink-400 text-[10px] mt-3">Measured on dry skin panel.</p>
            </div>

            {/* Formula verification - full width dark */}
            <div className="lg:col-span-4 rounded-2xl p-6" style={{ background: "#0F2C2A" }}>
              <p className="text-teal-700 text-[9px] tracking-[0.2em] uppercase mb-4">Formula verification</p>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { title: "Reef-Safe", body: "No oxybenzone, octinoxate, or octisalate. UV filters banned under Hawaii and Palau reef protection laws." },
                  { title: "Vegan and Cruelty-Free", body: "Full ingredient list reviewed. No animal-derived ingredients. No animal testing." },
                  { title: "Fragrance-Free", body: "No fragrance, parfum, or masking fragrance. No EU fragrance allergens above threshold." },
                ].map(({ title, body }) => (
                  <div key={title} className="flex items-start gap-3">
                    <CheckCircle2 size={12} className="text-teal-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-white tracking-tight mb-1">{title}</p>
                      <p className="text-teal-600 text-xs leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* UV filters — deep dive */}
      <section className="grain-overlay bg-teal-950 py-16 px-5 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto">
          <p className="text-teal-700 text-[9px] tracking-[0.2em] uppercase mb-3">What protects your skin</p>
          <h2 className="text-3xl font-medium text-white tracking-tight leading-none mb-3">
            Next-generation UV filters
          </h2>
          <p className="text-teal-500 text-xs leading-relaxed max-w-lg mb-10">
            All three filters verified legally permitted in India and the EU, and confirmed present in the formula. None on any global banned list.
          </p>

          <div className="grid sm:grid-cols-3 gap-2.5 mb-4">
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
              <div key={name} className="rounded-xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="px-4 py-3 flex items-center justify-between"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-white text-xs font-medium">{name}</p>
                  <CheckCircle2 size={10} className="text-teal-600" />
                </div>
                <div className="p-4">
                  <p className="text-teal-800 text-[9px] font-mono leading-relaxed mb-2.5">{inci}</p>
                  <p className="text-teal-300 text-xs mb-1.5">{role}</p>
                  <p className="text-teal-600 text-[11px] leading-relaxed">{note}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-teal-700 text-[9px] tracking-widest uppercase mb-3">Not in this product</p>
            <div className="flex flex-wrap gap-1.5">
              {["No oxybenzone", "No octinoxate", "No homosalate", "No parabens", "No phenoxyethanol", "No synthetic fragrance", "No formaldehyde releasers"].map((item) => (
                <span key={item} className="text-[10px] px-2.5 py-1 rounded-md"
                  style={{ background: "rgba(214,255,62,0.04)", color: "#D6FF3E", border: "1px solid rgba(214,255,62,0.1)" }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who this is for */}
      <section className="bg-white border-b border-ink-100 py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="lg:w-56 flex-shrink-0">
              <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-2">Panel review</p>
              <h2 className="text-2xl font-medium text-ink-950 tracking-tight leading-tight">Who this is for</h2>
              <p className="text-ink-400 text-xs leading-relaxed mt-2">
                Suitability based on verified test data, not brand positioning.
              </p>
            </div>
            <div className="flex-1 grid sm:grid-cols-2 gap-2">
              {[
                { title: "Dry skin", detail: "Hyaluronic Acid, Polyglutamic Acid, and Ectoin deliver and sustain hydration. 65% increase at 8 hours measured on dry skin panel." },
                { title: "Oily and combination skin", detail: "Clinically tested on oily and mixed-oily skin. Zero new comedones in 28-day study." },
                { title: "Sensitive skin", detail: "Fragrance-free. No parabens, phenoxyethanol, or synthetic colours. Zero irritation in dermatologist testing." },
                { title: "Eye area", detail: "Ophthalmologist-tested. Confirmed safe for use around the eye area in a dedicated 3-day ocular safety study." },
                { title: "Daily wear", detail: "Non-greasy, breathable finish. Designed for all-day use." },
                { title: "Eco-conscious users", detail: "No oxybenzone or octinoxate. Vegan. Cruelty-free. No reef-toxic UV filters." },
              ].map(({ title, detail }) => (
                <div key={title} className="rounded-xl p-4 border border-ink-100 bg-ink-50">
                  <p className="text-xs font-medium text-ink-900 tracking-tight mb-1">{title}</p>
                  <p className="text-xs text-ink-500 leading-relaxed">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How testing was conducted */}
      <section className="bg-ink-50 border-b border-ink-100 py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-56 flex-shrink-0">
              <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-2">Methodology</p>
              <h2 className="text-2xl font-medium text-ink-950 tracking-tight leading-tight">How testing was conducted</h2>
              <p className="text-ink-400 text-xs leading-relaxed mt-2">
                Independent. Randomised samples. No brand involvement in selection.
              </p>
            </div>
            <div className="flex-1 grid sm:grid-cols-3 gap-2.5">
              {[
                { n: "01", title: "SPF and UVA testing", method: "ISO 24444 and JCIA in-vitro method", result: "SPF 59.92. UVAPF 22.07." },
                { n: "02", title: "Water resistance", method: "ISO 16217 water immersion protocol", result: "94% SPF retained after 80 minutes." },
                { n: "03", title: "Non-comedogenic", method: "28-day randomised clinical study", result: "33 participants. Zero new comedones." },
              ].map(({ n, title, method, result }) => (
                <div key={n} className="bg-white rounded-xl p-4 border border-ink-100">
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
      <section className="bg-white py-16 px-5 border-b border-ink-100">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-12">
            <div className="flex-shrink-0 lg:w-56">
              <div className="relative w-11 h-11 mb-3">
                <div className="absolute inset-0 rounded-full ring-1 ring-teal-200 ring-offset-2" />
                <div className="w-11 h-11 rounded-full bg-teal-50 flex items-center justify-center">
                  <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={32} height={32} className="object-contain" />
                </div>
              </div>
              <p className="text-sm font-medium text-ink-900 tracking-tight">The Clean Sheet</p>
              <p className="text-[10px] text-ink-400 mt-0.5">Independent Certification Body</p>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-medium text-ink-950 tracking-tight mb-4">What certification means</h2>
              <p className="text-ink-500 text-sm leading-relaxed mb-2">
                The Clean Sheet is an independent certification body. CodeSkin submitted to this certification.
                Our panel assessments are editorially independent. A panel of cosmetic scientists, toxicologists,
                regulatory specialists, a microbiologist, a claims evaluator, and a dermatologist reviewed the
                formula, lab reports, clinical studies, and label. Certified only what the evidence supports.
              </p>
              <p className="text-ink-500 text-sm leading-relaxed mb-8">
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
                  <div key={label} className="text-center rounded-xl p-4 border border-ink-100 bg-ink-50">
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
      <footer className="bg-teal-950 py-10 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={13} height={13} className="object-contain" />
                <span className="text-white text-xs font-medium">The Clean Sheet</span>
              </div>
              <p className="text-teal-800 text-[10px]">TCS-IN-2026-048291 [SAMPLE]</p>
              <p className="text-teal-800 text-[10px]">Valid 15 May 2026 to 14 May 2027 [SAMPLE]</p>
            </div>
            <Link href="/verify/tcs-in-2026-048291-b7f2a9c1e5d3"
              className="inline-flex items-center gap-1.5 text-teal-500 hover:text-white text-[11px] border border-teal-900 hover:border-teal-700 px-4 py-2 rounded-lg transition-colors">
              View full technical certification <ArrowUpRight size={11} />
            </Link>
          </div>
          <div className="mt-8 pt-5 border-t border-teal-900 text-center">
            <p className="text-teal-800 text-[10px]">Global regulations set the legal floor. The Clean Sheet sets the trust ceiling.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
