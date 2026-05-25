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

function SampleBottle() {
  return (
    <svg
      viewBox="0 0 120 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      style={{ padding: "18px 22px 26px" }}
    >
      <defs>
        <linearGradient id="bottleGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f4faf9" />
          <stop offset="45%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#eef7f6" />
        </linearGradient>
        <linearGradient id="labelGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#edf8f7" />
          <stop offset="100%" stopColor="#dff2f0" />
        </linearGradient>
      </defs>

      {/* Pump neck */}
      <rect x="52" y="40" width="16" height="24" rx="4" fill="#edf8f7" stroke="#c2e8e4" strokeWidth="1.2" />

      {/* Pump head */}
      <rect x="36" y="26" width="48" height="16" rx="8" fill="#248179" />

      {/* Nozzle arm */}
      <rect x="84" y="29" width="22" height="10" rx="5" fill="#1d6b65" />
      <circle cx="107" cy="34" r="3.5" fill="#1d6b65" />
      <circle cx="107" cy="34" r="1.8" fill="#248179" />

      {/* Bottle body */}
      <rect x="10" y="60" width="100" height="182" rx="22" fill="url(#bottleGrad)" stroke="#daeee9" strokeWidth="1.5" />

      {/* Glass highlight sheen */}
      <rect x="16" y="70" width="18" height="162" rx="9" fill="rgba(255,255,255,0.55)" />

      {/* Label background */}
      <rect x="20" y="100" width="80" height="106" rx="9" fill="url(#labelGrad)" opacity="0.8" />

      {/* Top label rule */}
      <line x1="32" y1="113" x2="88" y2="113" stroke="#b8deda" strokeWidth="0.8" />

      {/* SPF 50+ */}
      <text x="60" y="137" textAnchor="middle" fontFamily="Georgia, serif" fontSize="17" fontWeight="bold" fill="#248179">SPF 50+</text>

      {/* PA++++ */}
      <text x="60" y="152" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8" fill="#5f8e8a" letterSpacing="2.5">PA++++</text>

      {/* Bottom label rule */}
      <line x1="32" y1="162" x2="88" y2="162" stroke="#b8deda" strokeWidth="0.8" />

      {/* Product name */}
      <text x="60" y="177" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="6" fill="#7eaaa6" letterSpacing="2.8">ULTRA LITE FLUID</text>

      {/* Bottom cap */}
      <rect x="10" y="230" width="100" height="7" rx="3.5" fill="#e0f0ee" />

      {/* Volume */}
      <text x="60" y="253" textAnchor="middle" fontFamily="monospace" fontSize="5.5" fill="#c0d8d5" letterSpacing="1.5">50 mL</text>
    </svg>
  );
}

export default function VerifiedPage() {
  return (
    <div className="bg-white min-h-screen overflow-x-hidden">

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-start gap-8 sm:gap-0 pt-10 sm:pt-14">

            {/* Left column — text content */}
            <div className="flex-1 min-w-0 sm:pr-12 lg:pr-20 py-2 sm:py-6">

              {/* Brand — blurred sample */}
              <div className="flex items-center gap-3 mb-8 animate-fade-in">
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                  <div style={{ filter: "blur(4px)", display: "flex", alignItems: "center", gap: 6, pointerEvents: "none", userSelect: "none" }}>
                    <span className="text-base leading-none">🍎</span>
                    <span className="text-sm font-semibold text-ink-900 tracking-tight">Apple</span>
                  </div>
                  <div style={{ position: "absolute", inset: "-4px -10px", background: "rgba(255,255,255,0.93)", border: "1px dashed #c2e8e4", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#5f8e8a", textTransform: "uppercase", letterSpacing: "0.1em" }}>&#128274; Brand</span>
                  </div>
                </div>
                <span className="text-ink-200 text-[11px]">·</span>
                <span className="text-[10px] tracking-[0.12em] uppercase text-ink-400">India</span>
                <span className="text-ink-200 text-[11px]">·</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-500/70 text-[11px]">Sample</span>
                </div>
              </div>

              {/* Product name — editorial large */}
              <h1
                className="font-medium text-ink-950 animate-fade-up delay-100"
                style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)", lineHeight: 1.02, letterSpacing: "-0.035em", marginBottom: "0.6em" }}
              >
                UltraLite Fluid<br />Sunscreen
              </h1>

              {/* SPF + PRISM row */}
              <div className="flex flex-wrap items-center gap-3 mb-8 animate-fade-up delay-200">
                <p className="font-medium" style={{ fontSize: "clamp(1rem, 1.6vw, 1.15rem)", color: "#248179" }}>
                  SPF 50+ PA++++
                </p>
                <span className="w-px h-4 bg-ink-200" />
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-teal-600 border border-teal-200 bg-teal-50 px-3 py-1.5 rounded-full">
                  <Shield size={10} /> PRISM Core
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-teal-600 border border-teal-200 bg-teal-50 px-3 py-1.5 rounded-full">
                  <Sun size={10} /> PRISM Sun Verified
                </span>
              </div>

              {/* Description */}
              <p className="animate-fade-up delay-300 mb-8" style={{ maxWidth: "30rem", color: "rgb(95,93,93)", fontSize: "14px", lineHeight: 1.75 }}>
                Independently reviewed across formula safety, UV performance,
                manufacturing quality, claims evidence, and legal compliance.
              </p>

              {/* Official Record section */}
              <div className="animate-fade-up delay-400 mb-6">
                <p className="text-[9px] tracking-[0.22em] uppercase mb-2" style={{ color: "#248179" }}>
                  Official record
                </p>
                <h2
                  className="font-medium text-ink-950 tracking-tight leading-none mb-4"
                  style={{ fontSize: "clamp(1.5rem, 2.8vw, 2rem)" }}
                >
                  Certification record
                </h2>

                {/* Status + Cert ID inline */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span className="text-sm text-ink-900 font-medium">Active</span>
                  <span className="text-ink-300 text-sm">·</span>
                  <span className="text-sm text-ink-500 font-mono tracking-wide">TCS-IN-2026-048291</span>
                </div>
              </div>

              {/* Dates — horizontal row with top border */}
              <div className="animate-fade-up delay-500 border-t border-ink-100 pt-5 flex flex-wrap gap-x-10 gap-y-3">
                {validityItems.filter(v => !v.dot).map(({ label, value }) => (
                  <div key={label} className="flex items-baseline gap-2">
                    <span className="text-[10px] text-ink-400 uppercase tracking-[0.12em]">{label}:</span>
                    <span className="text-sm text-ink-800 font-medium tabular-nums">{value}</span>
                  </div>
                ))}
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] text-ink-400 uppercase tracking-[0.12em]">Status:</span>
                  <span className="text-sm text-ink-800 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block animate-pulse" />
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Right column — product image, large and prominent */}
            <div
              className="flex-shrink-0 animate-slide-right mx-auto sm:mx-0 self-stretch flex items-center"
              style={{ flex: "0 0 auto", width: "min(320px, 42vw)" }}
            >
              <div className="w-full relative" style={{ padding: "20px 20px 20px 0" }}>
                <div className="relative animate-float">
                  {/* Image frame — taller, editorial */}
                  <div
                    className="relative rounded-3xl overflow-hidden"
                    style={{
                      height: "clamp(320px, 48vw, 520px)",
                      background: "radial-gradient(ellipse at 50% 75%, #cee8e5 0%, #edf8f7 40%, #f6faf9 100%)",
                      boxShadow: "0 20px 60px -12px rgba(36,129,121,0.18), 0 4px 16px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      className="absolute left-0 right-0 h-[2px] animate-cert-scan pointer-events-none z-20"
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(36,129,121,0.5), rgba(45,200,190,0.9), rgba(36,129,121,0.5), transparent)",
                      }}
                    />
                    <SampleBottle />
                    {/* Product detail strip */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
                      <span className="text-[8px] text-teal-700/40 tracking-[0.2em] uppercase">50 ml · Sample · FV-2026-01</span>
                    </div>
                  </div>

                  {/* TCS stamp — top right corner */}
                  <div
                    className="absolute animate-badge-entrance z-30"
                    style={{
                      width: "clamp(64px, 11vw, 100px)",
                      height: "clamp(64px, 11vw, 100px)",
                      top: "-12px",
                      right: "-12px",
                      filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.14))",
                    }}
                  >
                    <Image
                      src="/images/tcs-certified-stamp-v2.png"
                      alt="The Clean Sheet Certified"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Credential chips ───────────────────────────────── */}
      <div className="border-b border-ink-100 px-5 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-[9px] tracking-[0.22em] uppercase text-ink-400 mb-4 sm:mb-5">
            Verified credentials
          </p>
          <div className="flex flex-wrap gap-2.5">
            {credentialTicker.map((item) => (
              <span
                key={item}
                style={{ background: "rgb(237,248,247)", border: "1px solid rgba(36,129,121,0.25)", color: "rgb(36,129,121)", fontSize: "11px", fontWeight: 500 }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full cursor-default transition-colors hover:bg-teal-100/80 whitespace-nowrap"
              >
                <CheckCircle2 size={10} style={{ color: "rgb(36,129,121)" }} className="flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Certification record (collapsible) ──────────────── */}
      <CollapsibleCert certFields={certFields} />

      {/* ─── Section divider ─────────────────────────────────── */}
      <div className="h-px mx-5" style={{ background: "linear-gradient(90deg, transparent, #EEEDED 15%, #EEEDED 85%, transparent)" }} />

      {/* ─── Independent Review ───────────────────────────────── */}
      <section className="px-5 pt-14 sm:pt-16 pb-4">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div>
              <p className="text-[9px] tracking-[0.22em] uppercase mb-3" style={{ color: "#248179" }}>
                5 pillars · every check passed
              </p>
              <h2
                className="font-medium text-ink-950 tracking-tight leading-none mb-3"
                style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}
              >
                Independent review
              </h2>
              <p className="text-ink-400 text-sm leading-relaxed" style={{ maxWidth: "32rem" }}>
                Open any pillar to see every check. Open a check to read the evidence.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <PillarDrilldown />

      {/* ─── Footer CTA ──────────────────────────────────────── */}
      <div className="h-px mx-5" style={{ background: "linear-gradient(90deg, transparent, #EEEDED 15%, #EEEDED 85%, transparent)" }} />
      <footer className="px-5 py-10 sm:py-14" style={{ background: "rgb(248,252,251)" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-sm text-ink-400 text-center sm:text-left" style={{ maxWidth: "28rem", lineHeight: 1.6 }}>
            Global regulations set the legal floor. The Clean Sheet sets the trust ceiling.
          </p>
          <Link
            href="/verify/tcs-in-2026-048291-b7f2a9c1e5d3"
            className="inline-flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-xl flex-shrink-0 transition-all duration-200 hover:gap-2.5"
            style={{ color: "rgb(36,129,121)", border: "1.5px solid rgb(36,129,121)", background: "rgb(255,255,255)" }}
          >
            Full technical record <ArrowUpRight size={13} />
          </Link>
        </div>
      </footer>

    </div>
  );
}
