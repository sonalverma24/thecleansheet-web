import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Shield, Sun, ArrowUpRight, CheckCircle2, QrCode } from "lucide-react";
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
      <section className="px-5 pt-5 pb-5">
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

              {/* MIDDLE: Registry verify CTA */}
              <div className="animate-fade-up delay-500 hidden sm:block">
                <Link
                  href="/verify/tcs-in-2026-048291-b7f2a9c1e5d3"
                  className="inline-flex items-center gap-1.5 text-[10px] rounded-lg px-3 py-1.5 transition-all duration-200 hover:gap-2"
                  style={{ color: "#248179", border: "1px solid #c2e8e4", background: "rgba(36,129,121,0.04)" }}
                >
                  <QrCode size={10} />
                  Verify on registry
                </Link>
              </div>

              {/* BOTTOM GROUP — anchored to image bottom */}
              <div className="animate-fade-up delay-500 pt-4 border-t border-ink-100">
                {/* Cert heading */}
                <p className="flex items-center gap-1.5 text-[9px] tracking-[0.2em] uppercase mb-1.5" style={{ color: "#248179" }}>
                  <span className="w-1 h-1 rounded-sm bg-teal-500 inline-block flex-shrink-0" />
                  Official record
                </p>
                <h2
                  className="font-medium text-ink-950 tracking-tight leading-none mb-4"
                  style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.7rem)" }}
                >
                  Certification record
                </h2>

                {/* Validity items — 2×2 compact grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {validityItems.map(({ label, value, dot }) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <p className="text-[8px] text-ink-300 uppercase tracking-[0.16em]">{label}</p>
                      <p className="text-[11px] text-ink-800 font-medium flex items-center gap-1.5 tabular-nums">
                        {dot && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block animate-pulse" />}
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

      {/* Gradient rule under hero */}
      <div className="h-px mx-5" style={{ background: "linear-gradient(90deg, transparent, #EEEDED 15%, #EEEDED 85%, transparent)" }} />

      {/* ─── Credential chips ───────────────────────────────── */}
      <div className="border-b border-ink-100 px-5 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {credentialTicker.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] text-ink-600 border border-ink-100 bg-ink-50 hover:border-teal-200 hover:bg-teal-50 transition-colors cursor-default"
              >
                <CheckCircle2 size={10} className="text-teal-500 flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Certification record (collapsible) ──────────────── */}
      <CollapsibleCert certFields={certFields} />

      {/* ─── Independent Review ───────────────────────────────── */}
      <section className="px-5 pt-12 pb-2">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div>
              <p className="text-[9px] tracking-[0.22em] uppercase mb-2" style={{ color: "#248179" }}>
                5 pillars · every check passed
              </p>
              <h2
                className="font-medium text-ink-950 tracking-tight leading-none mb-2"
                style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}
              >
                Independent review
              </h2>
              <p className="text-ink-400 text-xs leading-relaxed">
                Open any pillar to see every check. Open a check to read the evidence.
              </p>
            </div>
          </ScrollReveal>
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
            className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-lg flex-shrink-0 transition-all duration-200 hover:gap-2 tcs-footer-link"
          >
            Full technical record <ArrowUpRight size={11} />
          </Link>
        </div>
      </footer>

    </div>
  );
}
