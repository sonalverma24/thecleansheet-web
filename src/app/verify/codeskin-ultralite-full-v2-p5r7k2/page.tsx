import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Shield, Sun, ArrowUpRight, CheckCircle2 } from "lucide-react";
import PillarDrilldown from "../codeskin-ultralite-proof-q3w5e7r2/PillarDrilldown";
import ScrollReveal from "./ScrollReveal";
import CollapsibleCert from "./CollapsibleCert";

export const metadata: Metadata = {
  title: "CodeSkin UltraLite Sunscreen | Verified | The Clean Sheet",
  description:
    "Official certification record and full independent review for CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++.",
  robots: { index: false, follow: false },
};

const certFields = [
  { label: "Certification ID",    value: "TCS-IN-2026-048291",                   mono: true },
  { label: "Certification body",  value: "The Clean Sheet" },
  { label: "PRISM modules",       value: "PRISM Core + PRISM Sun Verified" },
  { label: "Product category",    value: "Sunscreen - SPF Face" },
  { label: "Formula version",     value: "FV-2026-01 [SAMPLE]",                  mono: true },
  { label: "Certificate version", value: "1.0",                                  mono: true },
  { label: "Certification date",  value: "15 May 2026" },
  { label: "Expiry date",         value: "14 May 2027" },
  { label: "Markets assessed",    value: "India · European Union" },
  { label: "Evaluator",           value: "Dr. Priya Sharma, PhD Toxicology [SAMPLE]" },
];

const credentialTicker = [
  "PRISM Core Verified",
  "SPF 59.92 Tested",
  "PA++++ Confirmed",
  "Water Resistant 80 Min",
  "Fragrance Free",
  "Vegan & Cruelty Free",
  "Reef Safe",
  "Non-Comedogenic",
  "Dermatologist Tested",
  "Ophthalmologist Tested",
  "ISO 22716 Manufacturing",
  "PRISM Sun Verified",
];

const validityItems = [
  { label: "Valid until",   value: "14 May 2027" },
  { label: "Last verified", value: "10 May 2026" },
  { label: "Certified on",  value: "15 May 2026" },
  { label: "Status",        value: "Active", dot: true },
];

export default function VerifiedPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="px-5 pt-5 pb-5 border-b border-ink-100">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-row items-stretch gap-6 lg:gap-10">

            {/* Left — stretches to match image height, content pushed to top + bottom */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-3">

              {/* TOP GROUP */}
              <div>
                {/* Brand */}
                <div className="flex items-center gap-2 mb-4 animate-fade-in">
                  <Image
                    src="https://codeskin.in/cdn/shop/files/TransparentBackground.svg?v=1766131037"
                    alt="CodeSkin"
                    width={80}
                    height={18}
                    className="object-contain"
                    unoptimized
                  />
                  <span className="text-[9px] tracking-[0.28em] uppercase text-ink-300">India</span>
                  <span className="text-ink-200 text-[9px] mx-1">·</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-amber-500/70 text-[9px]">Sample</span>
                  </div>
                </div>

                {/* Product name */}
                <h1
                  className="font-medium text-ink-950 mb-2 animate-fade-up delay-100"
                  style={{ fontSize: "clamp(1.7rem, 3.2vw, 2.6rem)", lineHeight: 1.0, letterSpacing: "-0.025em" }}
                >
                  UltraLite Fluid Sunscreen
                </h1>

                {/* SPF */}
                <p
                  className="font-medium mb-3 animate-fade-up delay-200"
                  style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)", color: "#248179" }}
                >
                  SPF 50+ PA++++
                </p>

                {/* PRISM pills */}
                <div className="flex flex-wrap gap-1.5 mb-4 animate-fade-up delay-300">
                  <span className="flex items-center gap-1 text-[10px] text-teal-600 border border-teal-200 bg-teal-50 px-2.5 py-0.5 rounded-full">
                    <Shield size={8} /> PRISM Core
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-teal-600 border border-teal-200 bg-teal-50 px-2.5 py-0.5 rounded-full">
                    <Sun size={8} /> PRISM Sun Verified
                  </span>
                </div>

                {/* Description */}
                <p className="text-ink-400 text-xs leading-relaxed animate-fade-up delay-400 hidden sm:block" style={{ maxWidth: "26rem" }}>
                  Independently reviewed across formula safety, UV performance,
                  manufacturing quality, claims evidence, and legal compliance.
                </p>
              </div>

              {/* BOTTOM GROUP — anchored to image bottom */}
              <div className="animate-fade-up delay-500 pt-4 border-t border-ink-100">
                {/* Cert heading */}
                <p className="text-[9px] tracking-[0.2em] uppercase mb-1.5" style={{ color: "#248179" }}>
                  Official record
                </p>
                <h2
                  className="font-medium text-ink-950 tracking-tight leading-none mb-3"
                  style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.7rem)" }}
                >
                  Certification record
                </h2>

                {/* Validity items — 2×2 compact grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {validityItems.map(({ label, value, dot }) => (
                    <div key={label}>
                      <p className="text-[9px] text-ink-300 uppercase tracking-[0.12em] mb-0.5">{label}</p>
                      <p className="text-xs text-ink-800 font-medium flex items-center gap-1.5">
                        {dot && <span className="w-1 h-1 rounded-full bg-teal-500 inline-block" />}
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: product image + stamp */}
            <div
              className="hidden sm:block flex-shrink-0 animate-slide-right pt-3"
              style={{ width: "clamp(180px, 28vw, 320px)" }}
            >
              <div className="relative animate-float">
                {/* Image frame */}
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    height: "clamp(240px, 38vw, 420px)",
                    background: "radial-gradient(ellipse at 50% 80%, #cee8e5 0%, #edf8f7 45%, #f8fafb 100%)",
                    boxShadow: "0 12px 48px -8px rgba(36,129,121,0.2), 0 2px 10px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    className="absolute left-0 right-0 h-[2px] animate-cert-scan pointer-events-none z-20"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(36,129,121,0.5), rgba(45,200,190,0.9), rgba(36,129,121,0.5), transparent)",
                    }}
                  />
                  <Image
                    src="https://codeskin.in/cdn/shop/files/UltraLite_Fluid_Sunscreen_bottle_s.png?v=1768211190"
                    alt="CodeSkin UltraLite Fluid Sunscreen"
                    fill
                    className="object-contain p-5 sm:p-8"
                    unoptimized
                  />
                </div>

                {/* TCS stamp */}
                <div
                  className="absolute animate-badge-entrance z-30"
                  style={{
                    width: "clamp(80px, 14vw, 140px)",
                    height: "clamp(80px, 14vw, 140px)",
                    top: "-18px",
                    right: "-16px",
                    filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.16))",
                  }}
                >
                  <Image
                    src="/images/tcs-certified-stamp.png"
                    alt="The Clean Sheet Certified"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Scrolling credential strip ───────────────────────── */}
      <div className="border-b border-ink-100 overflow-hidden">
        <div
          className="flex items-center whitespace-nowrap py-2.5"
          style={{ animation: "marquee 48s linear infinite" }}
        >
          {[...credentialTicker, ...credentialTicker].map((item, i) => (
            <span key={i} className="flex items-center gap-3 mx-5 flex-shrink-0">
              <CheckCircle2 size={9} className="text-teal-500 flex-shrink-0" />
              <span className="text-[10px] tracking-[0.18em] uppercase text-ink-400">{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── Certification record (collapsible) ──────────────── */}
      <CollapsibleCert certFields={certFields} />

      {/* ─── Independent Review ───────────────────────────────── */}
      <section className="px-5 pt-12 pb-2">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <ScrollReveal>
            <div>
              <p className="text-[9px] tracking-[0.22em] uppercase mb-2" style={{ color: "#248179" }}>
                5 pillars · every check passed
              </p>
              <h2
                className="font-medium text-ink-950 tracking-tight leading-none"
                style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}
              >
                Independent review
              </h2>
            </div>
          </ScrollReveal>
          <p className="text-ink-400 text-sm max-w-xs leading-relaxed hidden sm:block">
            Click any pillar to see every check. Click a check to see the evidence.
          </p>
        </div>
      </section>

      <PillarDrilldown />

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-ink-100 px-5 py-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-ink-300">
            Global regulations set the legal floor. The Clean Sheet sets the trust ceiling.
          </p>
          <Link
            href="/verify/tcs-in-2026-048291-b7f2a9c1e5d3"
            className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-500 text-xs border border-ink-200 hover:border-teal-300 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            Full technical record <ArrowUpRight size={11} />
          </Link>
        </div>
      </footer>

    </div>
  );
}
