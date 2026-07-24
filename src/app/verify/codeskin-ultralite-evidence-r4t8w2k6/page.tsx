import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ArrowUpRight, Shield, Sun } from "lucide-react";

export const metadata: Metadata = {
  title: "CodeSkin UltraLite Sunscreen | Certified Evidence | The Clean Sheet",
  description:
    "The certified facts on CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++. No scores. Just evidence.",
  robots: { index: false, follow: false },
};

/* ── Data ─────────────────────────────────────────────────── */

const claims = [
  { label: "SPF 50+",                       fact: "Tested at SPF 59.92. Exceeds the label claim." },
  { label: "PA++++ UVA protection",          fact: "UVAPF 22.07. PA++++ requires 16 or above." },
  { label: "Water resistant, 80 minutes",    fact: "94% SPF retained after 80 minutes of water immersion." },
  { label: "Non-comedogenic",               fact: "Zero new comedones. 33 adults, 28-day supervised study." },
  { label: "Dermatologist-tested",           fact: "Zero irritation across all participants in patch test." },
  { label: "Ophthalmologist-tested",         fact: "No eye irritation in 3-day periocular safety study." },
  { label: "Fragrance-free",                fact: "No parfum. No EU 26 fragrance allergens above threshold." },
  { label: "Vegan",                         fact: "No animal-derived ingredients in the full INCI list." },
  { label: "Cruelty-free",                  fact: "No animal testing on this product or its ingredients." },
  { label: "Reef-safe",                     fact: "No oxybenzone, octinoxate, or octisalate in the formula." },
  { label: "Hydration clinically measured", fact: "65% increase at 8 hours. 38% sustained at 24 hours." },
];

const reviewed = [
  {
    category: "Legal Compliance",
    items: [
      "Permitted in India",
      "Permitted in EU",
      "No prohibited substances",
      "No formaldehyde releasers",
      "No banned UV filters",
      "INCI fully disclosed",
      "No prohibited claims",
    ],
  },
  {
    category: "Ingredient Safety",
    items: [
      "Hazard profile completed",
      "Exposure assessed",
      "Sensitisation reviewed",
      "Phototoxic screen: clear",
      "No SVHC identified",
      "Preservative system clean",
    ],
  },
  {
    category: "Manufacturing Quality",
    items: [
      "GMP certified facility",
      "ISO 22716 confirmed",
      "Stability tested",
      "Preservative efficacy passed",
      "UV filter COAs reviewed",
    ],
  },
  {
    category: "Ethics and Sourcing",
    items: [
      "No animal ingredients",
      "Cruelty-free declaration",
      "No palm or mica",
      "No reef-toxic filters",
    ],
  },
];

const filters = [
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
];

/* ── Page ─────────────────────────────────────────────────── */

export default function EvidencePage() {
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

      {/* Hero */}
      <section className="grain-overlay bg-teal-950 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto px-5 pt-10 pb-0">
          <div className="flex flex-col lg:flex-row items-end gap-8 lg:gap-14">

            {/* Left: identity */}
            <div className="flex-1 min-w-0 pb-10 lg:pb-14">
              <div className="mb-5 animate-fade-in">
                <span
                  className="inline-flex items-center gap-2 border rounded-full px-3 py-1"
                  style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}
                >
                  <Image src="/images/certified-badge.png" alt="" width={10} height={10} className="object-contain opacity-80" />
                  <span className="text-teal-300 text-[9px] tracking-[0.15em] uppercase">Independently Certified by The Clean Sheet</span>
                </span>
              </div>

              <p className="text-teal-600 text-[9px] tracking-widest uppercase mb-2 animate-fade-up">
                CodeSkin India
              </p>
              <h1
                className="font-medium text-white leading-tight tracking-tight mb-3 animate-fade-up delay-100"
                style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}
              >
                UltraLite Fluid<br />Sunscreen
              </h1>
              <p className="text-2xl font-medium mb-6 animate-fade-up delay-200" style={{ color: "#D6FF3E" }}>
                SPF 50+ PA++++
              </p>

              <p className="text-teal-400 text-sm leading-relaxed max-w-sm mb-6 animate-fade-up delay-300">
                Reviewed by an independent panel for formula safety, UV performance,
                manufacturing quality, claims evidence, and legal compliance.
                Everything on this page is backed by submitted evidence.
              </p>

              <div className="flex flex-wrap gap-2 animate-fade-up delay-400">
                <span className="flex items-center gap-1.5 text-xs text-teal-400 border border-teal-800/60 px-3 py-1 rounded-full">
                  <Shield size={9} /> PRISM Core
                </span>
                <span className="flex items-center gap-1.5 text-xs text-teal-400 border border-teal-800/60 px-3 py-1 rounded-full">
                  <Sun size={9} /> PRISM Sun Verified
                </span>
              </div>
            </div>

            {/* Right: product image standing at the edge on desktop */}
            <div className="hidden lg:block flex-shrink-0 self-end animate-fade-up delay-200">
              <div className="animate-float">
                <div
                  className="relative w-48 h-72 rounded-t-2xl overflow-hidden"
                  style={{
                    background: "linear-gradient(160deg, #0F2C2A 0%, #174039 50%, #1D5550 100%)",
                    boxShadow: "0 -16px 48px -8px rgba(36,129,121,0.15), 0 40px 80px -20px rgba(0,0,0,0.9)",
                  }}
                >
                  <Image
                    src="https://codeskin.in/cdn/shop/files/UltraLite_Fluid_Sunscreen_bottle_s.png?v=1768211190"
                    alt="CodeSkin UltraLite Fluid Sunscreen"
                    fill className="object-contain p-6" unoptimized
                  />
                  <div className="absolute bottom-3 right-3 drop-shadow-xl">
                    <Image src="/images/certified-badge.png" alt="TCS Certified" width={28} height={28} className="object-contain" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile image - inline */}
            <div className="lg:hidden flex-shrink-0 self-start animate-fade-up delay-200">
              <div className="relative w-28 h-36 rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, #0F2C2A 0%, #174039 50%, #1D5550 100%)",
                  boxShadow: "0 24px 48px -12px rgba(0,0,0,0.6)",
                }}
              >
                <Image
                  src="https://codeskin.in/cdn/shop/files/UltraLite_Fluid_Sunscreen_bottle_s.png?v=1768211190"
                  alt="CodeSkin UltraLite Fluid Sunscreen"
                  fill className="object-contain p-3" unoptimized
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Big numbers */}
      <section className="bg-white border-b border-ink-100 px-5 py-14">
        <div className="max-w-5xl mx-auto">
          <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-10">The test results</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink-100 rounded-2xl overflow-hidden">
            {[
              {
                n: "59.92",
                unit: "SPF",
                label: "UV protection tested",
                context: "Label claims SPF 50+. The product delivered more.",
              },
              {
                n: "22.07",
                unit: "UVAPF",
                label: "UVA protection rating",
                context: "PA++++ requires 16 or above. Tested at 22.07.",
              },
              {
                n: "94%",
                unit: "retained",
                label: "Water resistance",
                context: "SPF retained after 80 minutes of water immersion.",
              },
              {
                n: "65%",
                unit: "at 8 hrs",
                label: "Hydration increase",
                context: "Measured by corneometer. 38% still sustained at 24 hours.",
              },
            ].map(({ n, unit, label, context }) => (
              <div key={label} className="bg-white px-5 py-8 sm:px-7">
                <div className="mb-3 leading-none">
                  <span
                    className="font-medium"
                    style={{ fontSize: "clamp(2.6rem, 5.5vw, 3.8rem)", color: "#D6FF3E" }}
                  >
                    {n}
                  </span>
                  <span className="text-teal-500 text-sm ml-2 align-middle">{unit}</span>
                </div>
                <p className="text-ink-800 text-sm font-medium mb-1">{label}</p>
                <p className="text-ink-400 text-xs leading-relaxed">{context}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Claims verified */}
      <section className="bg-ink-50 border-b border-ink-100 px-5 py-14">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-1.5">Every claim checked</p>
              <h2 className="text-2xl sm:text-3xl font-medium text-ink-950 tracking-tight leading-none">
                Claims verified
              </h2>
            </div>
            <p className="text-ink-400 text-sm max-w-xs leading-relaxed">
              Reviewed against submitted lab reports, clinical studies, and ingredient data.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {claims.map(({ label, fact }) => (
              <div
                key={label}
                className="bg-white rounded-xl px-4 py-4 border border-ink-100 flex items-start gap-3"
              >
                <CheckCircle2 size={15} className="flex-shrink-0 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-ink-900 tracking-tight">{label}</p>
                  <p className="text-xs text-ink-500 leading-relaxed mt-0.5">{fact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What was reviewed */}
      <section className="bg-white border-b border-ink-100 px-5 py-14">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-1.5">Scope of review</p>
            <h2 className="text-2xl sm:text-3xl font-medium text-ink-950 tracking-tight leading-none">
              What was reviewed
            </h2>
          </div>
          <div className="border border-ink-100 rounded-2xl overflow-hidden">
            {reviewed.map(({ category, items }, idx) => (
              <div
                key={category}
                className={`flex flex-col sm:flex-row gap-3 sm:gap-8 px-5 py-5 ${
                  idx < reviewed.length - 1 ? "border-b border-ink-100" : ""
                }`}
              >
                <div className="sm:w-48 flex-shrink-0 flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="text-teal-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-ink-900">{category}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item) => (
                    <span
                      key={item}
                      className="text-xs text-ink-600 bg-ink-50 border border-ink-100 px-2.5 py-1 rounded-lg"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UV Filters */}
      <section className="bg-ink-50 border-b border-ink-100 px-5 py-14">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-1.5">Confirmed and permitted</p>
            <h2 className="text-2xl sm:text-3xl font-medium text-ink-950 tracking-tight leading-none">
              The UV filter system
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            {filters.map(({ name, inci, role, note }) => (
              <div key={name} className="rounded-xl overflow-hidden border border-ink-100">
                <div className="bg-white px-4 py-3 border-b border-ink-100 flex items-center justify-between">
                  <p className="text-sm font-medium text-ink-900">{name}</p>
                  <CheckCircle2 size={12} className="text-teal-600 flex-shrink-0" />
                </div>
                <div className="bg-ink-50 p-4">
                  <p className="text-ink-400 text-[9px] font-mono leading-relaxed mb-3">{inci}</p>
                  <p className="text-ink-800 text-sm mb-1.5">{role}</p>
                  <p className="text-ink-500 text-xs leading-relaxed">{note}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-ink-400 text-xs leading-relaxed">
            All three filters sourced from BASF. Certificates of analysis reviewed. All confirmed permitted in India and EU markets. None on any global banned filter list.
          </p>
        </div>
      </section>

      {/* Certification record */}
      <section className="grain-overlay bg-teal-950 px-5 py-14">
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-14">

            {/* Cert data */}
            <div className="flex-1">
              <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-5">Certification record</p>
              <h2
                className="font-medium text-white tracking-tight leading-none mb-8"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}
              >
                Active certification
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
                {[
                  { label: "Product",           value: "UltraLite Fluid Sunscreen" },
                  { label: "Brand",             value: "CodeSkin India" },
                  { label: "Certification ID",  value: "TCS-IN-2026-048291" },
                  { label: "Status",            value: "Active" },
                  { label: "Certified on",      value: "15 March 2026" },
                  { label: "Valid until",       value: "14 May 2027" },
                  { label: "Last verified",     value: "10 May 2026" },
                  { label: "Markets assessed",  value: "India · European Union" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-teal-700 text-[10px] mb-0.5">{label}</p>
                    <p className="text-teal-200 text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* TCS panel card */}
            <div className="lg:w-72 flex-shrink-0 w-full">
              <div
                className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-teal-900/60 flex items-center justify-center flex-shrink-0">
                    <Image src="/images/certified-badge.png" alt="The Clean Sheet" width={22} height={22} className="object-contain" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">The Clean Sheet</p>
                    <p className="text-teal-600 text-xs">Independent Certification Body</p>
                  </div>
                </div>
                <p className="text-teal-400 text-sm leading-relaxed mb-5">
                  CodeSkin submitted to this certification. Our panel assessments are editorially independent.
                  We set the trust ceiling above what regulations require.
                </p>
                <Link
                  href="/verify/tcs-in-2026-048291-b7f2a9c1e5d3"
                  className="inline-flex items-center justify-center gap-1.5 text-teal-400 hover:text-white text-sm border border-teal-800 hover:border-teal-600 px-4 py-2.5 rounded-lg transition-colors w-full"
                >
                  Full technical record <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-950 border-t border-teal-900 py-6 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Image src="/images/certified-badge.png" alt="The Clean Sheet" width={11} height={11} className="object-contain" />
              <span className="text-white text-xs font-medium">The Clean Sheet</span>
            </div>
            <p className="text-teal-800 text-[10px]">
              TCS-IN-2026-048291 [SAMPLE] · Valid 15 May 2026 to 14 May 2027 [SAMPLE]
            </p>
          </div>
          <p className="text-teal-800 text-[10px]">
            Global regulations set the legal floor. The Clean Sheet sets the trust ceiling.
          </p>
        </div>
      </footer>

    </div>
  );
}
