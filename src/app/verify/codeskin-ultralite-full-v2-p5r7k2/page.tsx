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

/* Credentials grouped by category for the card layout */
const credentialGroups = [
  {
    category: "UV Protection",
    color: "#fd6158",
    badge: "VERIFIED",
    items: [
      "SPF 59.92 Tested",
      "PA++++ Confirmed",
      "Water Resistant 80 Min",
    ],
  },
  {
    category: "Safety & Skin",
    color: "#248179",
    badge: "VERIFIED",
    items: [
      "Fragrance Free",
      "Non-Comedogenic",
      "Dermatologist Tested",
      "Ophthalmologist Tested",
    ],
  },
  {
    category: "Ethics & Sourcing",
    color: "#b0a8a4",
    badge: "VERIFIED",
    items: [
      "Vegan & Cruelty Free",
      "Reef Safe",
    ],
  },
  {
    category: "Standards",
    color: "#248179",
    badge: "VERIFIED",
    items: [
      "PRISM Core Verified",
      "PRISM Sun Verified",
      "ISO 22716 Manufacturing",
    ],
  },
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
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#fbf9f7" }}>

      {/* ─── Dark Header Strip ────────────────────────────────── */}
      <div style={{ background: "#282828" }} className="px-5 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-[10px] tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
            Product Certification Record · The Clean Sheet
          </span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[10px] text-teal-300">Active</span>
          </div>
        </div>
      </div>

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section style={{ background: "#ffffff" }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-0 pt-8 sm:pt-10 pb-8 sm:pb-10">

            {/* Left column — text */}
            <div className="flex-1 min-w-0 sm:pr-10 lg:pr-16 py-2 sm:py-4">

              {/* Brand — blurred sample */}
              <div className="flex items-center gap-3 mb-6">
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                  <div style={{ filter: "blur(4px)", display: "flex", alignItems: "center", gap: 6, pointerEvents: "none", userSelect: "none" }}>
                    <span className="text-base leading-none">🍎</span>
                    <span className="text-sm text-ink-900 tracking-tight">Apple</span>
                  </div>
                  <div style={{ position: "absolute", inset: "-4px -10px", background: "rgba(255,255,255,0.93)", border: "1px dashed #c2e8e4", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <span style={{ fontSize: 8, fontWeight: 500, color: "#5f8e8a", textTransform: "uppercase", letterSpacing: "0.1em" }}>&#128274; Brand</span>
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

              {/* Product name */}
              <h1
                className="tracking-tight"
                style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", lineHeight: 1.08, color: "#282828", marginBottom: "0.5em", fontWeight: 400 }}
              >
                UltraLite Fluid<br />Sunscreen
              </h1>

              {/* SPF + PRISM pills */}
              <div className="flex flex-wrap items-center gap-2.5 mb-6">
                <span
                  className="text-[12px] font-medium px-3 py-1.5 rounded-md"
                  style={{ background: "#248179", color: "#ffffff" }}
                >
                  SPF 50+ PA++++
                </span>
                <span
                  className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-md"
                  style={{ background: "rgba(36,129,121,0.08)", color: "#248179", border: "1px solid rgba(36,129,121,0.15)" }}
                >
                  <Shield size={10} /> PRISM Core
                </span>
                <span
                  className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-md"
                  style={{ background: "rgba(36,129,121,0.08)", color: "#248179", border: "1px solid rgba(36,129,121,0.15)" }}
                >
                  <Sun size={10} /> Sun Verified
                </span>
              </div>

              {/* Short description */}
              <p style={{ maxWidth: "28rem", color: "#6b6868", fontSize: "13.5px", lineHeight: 1.7 }} className="mb-6">
                Independently reviewed across formula safety, UV performance,
                manufacturing quality, claims evidence, and legal compliance.
              </p>

              {/* Compact cert info row */}
              <div
                className="rounded-lg px-4 py-3 flex flex-wrap gap-x-6 gap-y-2"
                style={{ background: "#fbf9f7", border: "1px solid #eee" }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span className="text-xs" style={{ color: "#282828" }}>Active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: "#b0a8a4" }}>ID:</span>
                  <span className="text-xs font-mono" style={{ color: "#282828" }}>TCS-IN-2026-048291</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: "#b0a8a4" }}>Valid:</span>
                  <span className="text-xs" style={{ color: "#282828" }}>15 May 2026 — 14 May 2027</span>
                </div>
              </div>
            </div>

            {/* Right column — product image */}
            <div
              className="flex-shrink-0 mx-auto sm:mx-0 self-stretch flex items-center"
              style={{ flex: "0 0 auto", width: "min(280px, 38vw)" }}
            >
              <div className="w-full relative" style={{ padding: "12px 12px 12px 0" }}>
                <div className="relative">
                  <div
                    className="relative rounded-2xl overflow-hidden"
                    style={{
                      height: "clamp(280px, 42vw, 440px)",
                      background: "radial-gradient(ellipse at 50% 75%, #cee8e5 0%, #edf8f7 40%, #f6faf9 100%)",
                      boxShadow: "0 12px 40px -8px rgba(36,129,121,0.15), 0 2px 12px rgba(0,0,0,0.03)",
                    }}
                  >
                    <SampleBottle />
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center z-10">
                      <span className="text-[8px] text-teal-700/40 tracking-[0.2em] uppercase">50 ml · Sample</span>
                    </div>
                  </div>

                  {/* TCS stamp */}
                  <div
                    className="absolute z-30"
                    style={{
                      width: "clamp(56px, 9vw, 80px)",
                      height: "clamp(56px, 9vw, 80px)",
                      top: "-8px",
                      right: "-8px",
                      filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.12))",
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

      {/* ─── Verified Credentials — card layout ──────────────── */}
      <section className="px-5 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto">

          {/* Section header — numbered like the PDF */}
          <div className="flex items-center gap-3 mb-5">
            <span
              className="text-[10px] font-medium text-white w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "#282828" }}
            >
              01
            </span>
            <h2 className="text-lg tracking-tight" style={{ color: "#248179" }}>
              Verified Credentials
            </h2>
          </div>

          {/* Credential cards — left-border style */}
          <div className="space-y-3">
            {credentialGroups.map((group) => (
              <div
                key={group.category}
                className="bg-white rounded-lg overflow-hidden"
                style={{
                  borderLeft: `4px solid ${group.color}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-[15px] font-medium" style={{ color: "#282828" }}>
                      {group.category}
                    </h3>
                    <span
                      className="text-[10px] font-medium tracking-wider uppercase px-3 py-1 rounded"
                      style={{
                        background: "#248179",
                        color: "#ffffff",
                      }}
                    >
                      {group.badge}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded"
                        style={{
                          background: "#fbf9f7",
                          color: "#4a4747",
                          border: "1px solid #eee",
                        }}
                      >
                        <CheckCircle2 size={11} style={{ color: group.color }} className="flex-shrink-0" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── Certification record (collapsible) ──────────────── */}
      <CollapsibleCert certFields={certFields} />

      {/* ─── Section divider ─────────────────────────────────── */}
      <div className="h-px mx-5 max-w-5xl sm:mx-auto" style={{ background: "linear-gradient(90deg, transparent, #e0dede 15%, #e0dede 85%, transparent)" }} />

      {/* ─── Independent Review ───────────────────────────────── */}
      <section className="px-5 pt-10 sm:pt-12 pb-4">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-3">
              <span
                className="text-[10px] font-medium text-white w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "#282828" }}
              >
                02
              </span>
              <h2 className="text-lg tracking-tight" style={{ color: "#248179" }}>
                Independent Review
              </h2>
            </div>
            <p className="text-[13px] leading-relaxed ml-9" style={{ color: "#6b6868", maxWidth: "30rem" }}>
              Open any pillar to see every check. Open a check to read the evidence.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <PillarDrilldown />

      {/* ─── Lime callout quote ───────────────────────────────── */}
      <section className="px-5 pb-8">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-xl px-6 py-5"
            style={{
              background: "linear-gradient(135deg, #e8ff8a 0%, #d2ff34 100%)",
            }}
          >
            <p className="text-[15px] leading-relaxed text-center" style={{ color: "#282828", maxWidth: "36rem", margin: "0 auto" }}>
              &ldquo;Global regulations set the legal floor. The Clean Sheet sets the trust ceiling.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ─── Footer CTA ──────────────────────────────────────── */}
      <footer className="px-5 py-8 sm:py-10">
        <div
          className="max-w-5xl mx-auto rounded-xl overflow-hidden flex flex-col sm:flex-row"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          {/* Left — dark teal */}
          <div className="flex-1 px-6 py-6" style={{ background: "#248179" }}>
            <p className="text-[10px] tracking-[0.18em] uppercase mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>
              thecleansheet.in
            </p>
            <p className="text-white text-[15px] leading-snug">
              Check your product&apos;s<br />safety now.
            </p>
          </div>
          {/* Right — dark */}
          <div className="flex-1 px-6 py-6 flex flex-col justify-center" style={{ background: "#282828" }}>
            <p className="text-white text-[14px] mb-2">
              View full technical record
            </p>
            <p className="text-[12px] mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
              55 parameters reviewed across 5 independent pillars.
            </p>
            <Link
              href="/verify/tcs-in-2026-048291-b7f2a9c1e5d3"
              className="inline-flex items-center gap-2 text-[12px] font-medium px-4 py-2 rounded-lg w-fit transition-all hover:gap-2.5"
              style={{ background: "#fd6158", color: "#ffffff" }}
            >
              Full record <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="max-w-5xl mx-auto mt-4 flex items-center justify-between px-1">
          <p className="text-[10px]" style={{ color: "#b0a8a4" }}>
            &copy; The Clean Sheet 2026 · thecleansheet.in · Not medical advice.
          </p>
          <p className="text-[10px]" style={{ color: "#b0a8a4" }}>
            1 / 1
          </p>
        </div>
      </footer>

    </div>
  );
}
