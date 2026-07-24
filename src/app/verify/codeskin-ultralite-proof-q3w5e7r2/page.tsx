import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Shield, Sun, ArrowUpRight } from "lucide-react";
import PillarDrilldown from "./PillarDrilldown";

export const metadata: Metadata = {
  title: "CodeSkin UltraLite Fluid Sunscreen | Full Independent Review | The Clean Sheet",
  description:
    "Every check, every pillar, every piece of evidence. Full independent certification review for CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++.",
  robots: { index: false, follow: false },
};

export default function ProofPage() {
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
        <div className="relative z-10 max-w-5xl mx-auto px-5 pt-7 pb-8">

          <div className="mb-6 animate-fade-in">
            <span
              className="inline-flex items-center gap-2 border rounded-full px-3 py-1"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}
            >
              <Image src="/images/certified-badge.png" alt="" width={10} height={10} className="object-contain opacity-80" />
              <span className="text-teal-300 text-[9px] tracking-[0.15em] uppercase">Independently Certified by The Clean Sheet</span>
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-14">

            <div className="flex-1 min-w-0">
              <p className="text-teal-600 text-[9px] tracking-widest uppercase mb-2 animate-fade-up">CodeSkin India</p>

              <div className="flex flex-row items-start justify-between gap-4 lg:block">
                <div className="flex-1 min-w-0">
                  <h1
                    className="font-medium text-white leading-none tracking-tight mb-2 animate-fade-up delay-100"
                    style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)" }}
                  >
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

                {/* Inline image on mobile */}
                <div className="flex-shrink-0 lg:hidden animate-fade-up delay-200">
                  <div
                    className="relative w-24 h-32 sm:w-32 sm:h-40 rounded-xl overflow-hidden"
                    style={{
                      background: "linear-gradient(160deg, #0F2C2A 0%, #174039 50%, #1D5550 100%)",
                      boxShadow: "0 24px 48px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
                    }}
                  >
                    <Image
                      src="https://codeskin.in/cdn/shop/files/UltraLite_Fluid_Sunscreen_bottle_s.png?v=1768211190"
                      alt="CodeSkin UltraLite Fluid Sunscreen"
                      fill className="object-contain p-2" unoptimized
                    />
                    <div className="absolute -bottom-2 -right-2 drop-shadow-xl">
                      <Image src="/images/certified-badge.png" alt="TCS Certified" width={24} height={24} className="object-contain" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat grid */}
              <div
                className="mt-6 grid grid-cols-2 gap-px rounded-lg overflow-hidden animate-fade-up delay-400"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {[
                  { n: "59.92", label: "SPF Tested",    sub: "Label claims 50+" },
                  { n: "22.07", label: "UVAPF",          sub: "PA++++ confirmed" },
                  { n: "94%",   label: "SPF Retained",   sub: "After 80 min water" },
                  { n: "33",    label: "Participants",    sub: "28-day clinical" },
                ].map(({ n, label, sub }) => (
                  <div key={label} className="px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-base font-medium leading-none mb-0.5" style={{ color: "#D6FF3E" }}>{n}</p>
                    <p className="text-teal-400 text-[9px] tracking-wide">{label}</p>
                    <p className="text-teal-700 text-[9px]">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating image on desktop */}
            <div className="hidden lg:block flex-shrink-0 animate-fade-up delay-200">
              <div className="animate-float relative">
                <div
                  className="relative w-36 h-48 rounded-xl overflow-hidden"
                  style={{
                    background: "linear-gradient(160deg, #0F2C2A 0%, #174039 50%, #1D5550 100%)",
                    boxShadow: "0 24px 48px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  <Image
                    src="https://codeskin.in/cdn/shop/files/UltraLite_Fluid_Sunscreen_bottle_s.png?v=1768211190"
                    alt="CodeSkin UltraLite Fluid Sunscreen"
                    fill className="object-contain p-3" unoptimized
                  />
                </div>
                <div className="absolute -bottom-2.5 -right-2.5 drop-shadow-xl">
                  <Image src="/images/certified-badge.png" alt="TCS Certified" width={32} height={32} className="object-contain" />
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
            <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-1.5">
              5 pillars · every check passed
            </p>
            <h2 className="text-2xl sm:text-3xl font-medium text-ink-950 tracking-tight leading-none">
              The full independent review
            </h2>
          </div>
          <p className="text-ink-400 text-sm max-w-xs leading-relaxed">
            Click any pillar to see every check. Click a check to see the evidence behind it.
          </p>
        </div>
      </section>

      {/* Pillar drilldown */}
      <PillarDrilldown />

      {/* Certification note */}
      <section className="bg-ink-50 border-t border-ink-100 py-10 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-full ring-1 ring-teal-200 ring-offset-2" />
              <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center">
                <Image src="/images/certified-badge.png" alt="The Clean Sheet" width={26} height={26} className="object-contain" />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-900 tracking-tight">The Clean Sheet</p>
              <p className="text-[10px] text-ink-400">Independent Certification Body</p>
            </div>
          </div>
          <p className="text-ink-500 text-sm leading-relaxed flex-1">
            The Clean Sheet is an independent certification body. CodeSkin submitted to this certification.
            Our panel assessments are editorially independent. We set the trust ceiling above what regulations require.
          </p>
          <Link
            href="/verify/tcs-in-2026-048291-b7f2a9c1e5d3"
            className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-400 text-sm border border-ink-200 hover:border-teal-600 px-4 py-2 rounded-lg transition-colors flex-shrink-0"
          >
            Full technical record <ArrowUpRight size={12} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-teal-950 py-6 px-5">
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
