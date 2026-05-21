import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Shield, Leaf, FlaskConical, AlertCircle, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Ace Blend Women's Methylated Multivitamin | Independently Certified | The Clean Sheet",
  description:
    "Ace Blend Women's Methylated Multivitamin independently certified by The Clean Sheet. Label accuracy, heavy metals, and active methylated forms verified against submitted laboratory evidence.",
  robots: { index: false, follow: false },
};

/* ═══════════════════════════════════════════════════════════════ */
export default function AceBlendCertPage() {
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
            <span className="text-amber-300 text-[11px] font-medium">Sample Data — Verification Not Complete</span>
          </div>
        </div>
      </div>

      {/* ── HERO — dark, full bleed ───────────────────────────── */}
      <section className="grain-overlay bg-teal-950 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto px-5 pt-16 pb-20">

          {/* Top label */}
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
                Women&apos;s<br />
                <span style={{ color: "#D6FF3E" }}>Methylated</span><br />
                Multivitamin
              </h1>

              <p className="text-teal-400 text-sm font-medium tracking-wide mb-2 animate-fade-up delay-100">Ace Blend</p>

              {/* PRISM modules */}
              <div className="flex flex-wrap gap-2 mt-6 animate-fade-up delay-200">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide bg-teal-600 text-white px-3 py-1.5 rounded-full">
                  <Shield size={9} /> PRISM Core Certified
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide bg-violet-600 text-white px-3 py-1.5 rounded-full">
                  <Leaf size={9} /> PRISM Purity Verified
                </span>
              </div>

              <p className="text-teal-500 text-sm leading-relaxed max-w-sm mt-8 animate-fade-up delay-300">
                Every claim below was reviewed by an independent panel against submitted laboratory evidence.
                Randomised sample selection. No brand involvement.
              </p>
            </div>

            {/* Product visual */}
            <div className="flex-shrink-0 animate-fade-up delay-200">
              <div className="animate-float relative">
                {/* Outer glow ring */}
                <div className="absolute -inset-4 rounded-3xl opacity-20"
                  style={{ background: "radial-gradient(circle, #248179, transparent)" }} />
                {/* Card */}
                <div className="relative w-52 h-64 rounded-3xl overflow-hidden flex flex-col items-center justify-center gap-4"
                  style={{ background: "linear-gradient(145deg, #0F2C2A 0%, #174039 50%, #1D5550 100%)" }}>
                  <div className="absolute inset-0 border border-teal-700/50 rounded-3xl" />
                  {/* Decorative circle */}
                  <div className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #248179, #45B8B0)" }}>
                    <span className="font-bold text-4xl text-white" style={{ fontFamily: "var(--font-display)" }}>A</span>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-white text-xs font-bold tracking-wider uppercase">Ace Blend</p>
                    <p className="text-teal-300 text-[10px] font-medium leading-snug mt-1">Women&apos;s Methylated<br />Multivitamin</p>
                  </div>
                  {/* Neon accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: "linear-gradient(90deg, transparent, #D6FF3E, transparent)" }} />
                </div>
                {/* TCS badge */}
                <div className="absolute -bottom-3 -right-3 drop-shadow-2xl">
                  <Image src="/images/tcs-certified-badge.png" alt="TCS Certified" width={52} height={52} className="object-contain" />
                </div>
              </div>
            </div>
          </div>

          {/* Hero stat row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px mt-16 border border-teal-800 rounded-2xl overflow-hidden animate-fade-up delay-400">
            {[
              { n: "2", label: "Methylated forms", sub: "Methylcobalamin + L-5-MTHF" },
              { n: "4", label: "Heavy metals cleared", sub: "Lead · Arsenic · Mercury · Cadmium" },
              { n: "2", label: "Pathogens screened", sub: "Salmonella + Listeria" },
              { n: "0", label: "Artificial additives", sub: "No colors. No flavors." },
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
                "Label Accuracy Verified",
                "Heavy Metals Cleared",
                "Active Methylated Forms Confirmed",
                "Microbiologically Safe",
                "No Artificial Additives",
                "Randomised Independent Testing",
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
            Pure formula.<br />
            <span className="text-ink-400">Active ingredients.</span>
          </h2>
        </div>
      </section>

      {/* ── BENTO CLAIMS GRID ─────────────────────────────────── */}
      <section className="px-5 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

            {/* Methylcobalamin — large teal card, col-span-2 */}
            <div className="lg:col-span-2 rounded-2xl p-8 overflow-hidden relative"
              style={{ background: "linear-gradient(135deg, #248179 0%, #2E9E96 70%, #45B8B0 100%)" }}>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-teal-100 text-[10px] font-bold tracking-[0.2em] uppercase">Vitamin B12</span>
                  <CheckCircle2 size={16} className="text-white/50" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-none mb-3">
                  Methylco&shy;balamin
                </h3>
                <p className="text-teal-100 text-[10px] font-bold tracking-widest uppercase mb-4">Active form — confirmed present</p>
                <p className="text-white/70 text-xs leading-relaxed">
                  The form your body uses directly. No enzyme conversion required.
                  Standard multivitamins use cyanocobalamin, which must be converted
                  — a step some people cannot complete efficiently.
                </p>
              </div>
            </div>

            {/* L-5-MTHF — large violet card, col-span-2 */}
            <div className="lg:col-span-2 rounded-2xl p-8 overflow-hidden relative"
              style={{ background: "linear-gradient(135deg, #5B21B6 0%, #7C3AED 60%, #8B5CF6 100%)" }}>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-violet-200 text-[10px] font-bold tracking-[0.2em] uppercase">Folate</span>
                  <CheckCircle2 size={16} className="text-white/50" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-none mb-3">
                  L-5-MTHF
                </h3>
                <p className="text-violet-200 text-[10px] font-bold tracking-widest uppercase mb-4">Active form — confirmed present</p>
                <p className="text-white/70 text-xs leading-relaxed">
                  Bypasses the MTHFR enzyme step entirely. Folic acid (the standard form)
                  requires MTHFR conversion — people with MTHFR gene variants cannot
                  do this efficiently. This form works for everyone.
                </p>
              </div>
            </div>

            {/* Heavy metals — wide dark card, col-span-3 */}
            <div className="lg:col-span-3 rounded-2xl p-7 bg-teal-950 relative overflow-hidden">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <span className="text-teal-500 text-[10px] font-bold tracking-[0.2em] uppercase block mb-2">Purity Testing</span>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Heavy Metals Cleared</h3>
                </div>
                <CheckCircle2 size={18} className="text-teal-600 mt-1" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["Lead", "Arsenic", "Mercury", "Cadmium"].map((metal) => (
                  <div key={metal} className="bg-teal-900/60 border border-teal-800 rounded-xl px-4 py-3 text-center">
                    <CheckCircle2 size={12} className="text-teal-400 mx-auto mb-1.5" />
                    <p className="text-white text-xs font-semibold tracking-tight">{metal}</p>
                    <p className="text-teal-500 text-[10px] mt-0.5">Within limits</p>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5 pointer-events-none"
                style={{ background: "radial-gradient(circle, #D6FF3E, transparent)" }} />
            </div>

            {/* Microbial — narrow card, col-span-1 */}
            <div className="lg:col-span-1 rounded-2xl p-6 bg-ink-50 border border-ink-100 flex flex-col justify-between">
              <div>
                <span className="text-ink-400 text-[10px] font-bold tracking-[0.2em] uppercase block mb-2">Microbial</span>
                <h3 className="text-xl font-bold text-ink-950 tracking-tight leading-snug mb-3">Micro&shy;bio&shy;logically Safe</h3>
                <p className="text-ink-500 text-xs leading-relaxed">No Salmonella. No Listeria monocytogenes. Tested on randomised samples.</p>
              </div>
              <div className="mt-4 flex gap-2">
                <span className="text-[10px] font-semibold bg-teal-100 text-teal-700 px-2.5 py-1 rounded-md">No Salmonella</span>
                <span className="text-[10px] font-semibold bg-teal-100 text-teal-700 px-2.5 py-1 rounded-md">No Listeria</span>
              </div>
            </div>

            {/* Label accuracy — col-span-2 */}
            <div className="lg:col-span-2 rounded-2xl p-6 bg-ink-50 border border-ink-100">
              <div className="flex items-start justify-between mb-3">
                <span className="text-ink-400 text-[10px] font-bold tracking-[0.2em] uppercase">Label Accuracy</span>
                <CheckCircle2 size={14} className="text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-ink-950 tracking-tight mb-3">What it says is what&apos;s in it.</h3>
              <p className="text-ink-500 text-xs leading-relaxed">
                Nutritional composition tested against declared label values.
                Vitamin profile and mineral content — including Calcium — both verified
                within acceptable deviations by an independent laboratory.
              </p>
            </div>

            {/* Mineral content — col-span-2 */}
            <div className="lg:col-span-2 rounded-2xl p-6 bg-teal-50 border border-teal-100">
              <div className="flex items-start justify-between mb-3">
                <span className="text-teal-600 text-[10px] font-bold tracking-[0.2em] uppercase">Minerals</span>
                <CheckCircle2 size={14} className="text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-ink-950 tracking-tight mb-3">Mineral content verified.</h3>
              <p className="text-ink-500 text-xs leading-relaxed">
                Mineral composition, including Calcium, tested against label declarations.
                Confirmed to match stated values within accepted industry deviations.
              </p>
            </div>

            {/* Clean formula — full width banner */}
            <div className="lg:col-span-4 rounded-2xl overflow-hidden" style={{ background: "#0F2C2A" }}>
              <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(214, 255, 62, 0.1)", border: "1px solid rgba(214, 255, 62, 0.2)" }}>
                    <Leaf size={16} style={{ color: "#D6FF3E" }} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">No Artificial Colors. No Artificial Flavors.</h3>
                    <p className="text-teal-400 text-xs mt-0.5">Ingredient list independently reviewed and confirmed.</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span className="text-[11px] font-semibold px-3 py-1.5 rounded-md" style={{ background: "rgba(214, 255, 62, 0.1)", color: "#D6FF3E", border: "1px solid rgba(214, 255, 62, 0.2)" }}>
                    No artificial colors
                  </span>
                  <span className="text-[11px] font-semibold px-3 py-1.5 rounded-md" style={{ background: "rgba(214, 255, 62, 0.1)", color: "#D6FF3E", border: "1px solid rgba(214, 255, 62, 0.2)" }}>
                    No artificial flavors
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── METHYLATION EXPLAINER — dark editorial ────────────── */}
      <section className="grain-overlay bg-teal-950 py-20 px-5 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto">
          <p className="text-teal-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-6">Why the form matters</p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-none mb-4">
            Most multivitamins<br />use the cheap form.
          </h2>
          <p className="text-teal-400 text-base leading-relaxed max-w-lg mb-14">
            An estimated 10-15% of people carry MTHFR gene variants that reduce their ability
            to convert synthetic vitamin forms. Methylated forms are already active.
            They work for everyone.
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                nutrient: "Vitamin B12",
                standard: "Cyanocobalamin",
                methylated: "Methylcobalamin",
                why: "Cyanocobalamin must be converted to methylcobalamin before the body can use it. If conversion is inefficient, the vitamin passes through unused.",
                color: "#248179",
              },
              {
                nutrient: "Folate",
                standard: "Folic Acid",
                methylated: "L-5-MTHF",
                why: "Folic acid requires the MTHFR enzyme to convert to the active form. People with MTHFR variants accumulate unconverted folic acid instead of absorbing folate.",
                color: "#7C3AED",
              },
            ].map(({ nutrient, standard, methylated, why, color }) => (
              <div key={nutrient} className="rounded-2xl overflow-hidden border border-teal-800">
                <div className="px-6 py-4 border-b border-teal-800" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-teal-500 text-[10px] font-bold tracking-widest uppercase">{nutrient}</p>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 rounded-xl border border-teal-800 px-4 py-3 text-center bg-teal-900/30">
                      <p className="text-teal-600 text-[9px] font-bold tracking-widest uppercase mb-1">Standard</p>
                      <p className="text-teal-400 text-sm font-semibold line-through opacity-60">{standard}</p>
                    </div>
                    <span className="text-teal-700 font-bold text-xs">vs</span>
                    <div className="flex-1 rounded-xl px-4 py-3 text-center" style={{ background: `${color}22`, border: `1px solid ${color}40` }}>
                      <p className="text-[9px] font-bold tracking-widest uppercase mb-1" style={{ color: `${color}` }}>This formula</p>
                      <p className="text-white text-sm font-bold">{methylated}</p>
                    </div>
                  </div>
                  <p className="text-teal-500 text-xs leading-relaxed">{why}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TESTING WORKS ────────────────────────────────── */}
      <section className="bg-ink-50 border-y border-ink-100 py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="lg:w-1/3">
              <p className="text-teal-600 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">How verification was conducted</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-ink-950 tracking-tight leading-tight">
                Independent.<br />Randomised.<br />No brand involvement.
              </h2>
            </div>
            <div className="lg:w-2/3 grid sm:grid-cols-3 gap-3">
              {[
                {
                  num: "01",
                  name: "Nutritional Accuracy",
                  note: "Composition tested against declared label values. Vitamin profile and mineral content both verified.",
                  icon: <FlaskConical size={15} className="text-teal-600" />,
                },
                {
                  num: "02",
                  name: "Heavy Metal Screening",
                  note: "Lead, Arsenic, Mercury, and Cadmium all tested by an independent third-party lab. All four cleared.",
                  icon: <Shield size={15} className="text-teal-600" />,
                },
                {
                  num: "03",
                  name: "Microbial Safety",
                  note: "Screened for Salmonella and Listeria monocytogenes on randomised samples. Neither detected.",
                  icon: <AlertCircle size={15} className="text-teal-600" />,
                },
              ].map(({ num, name, note, icon }) => (
                <div key={num} className="bg-white rounded-2xl p-6 border border-ink-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-ink-300 text-xs font-bold">{num}</span>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                      {icon}
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-ink-950 tracking-tight mb-2">{name}</h3>
                  <p className="text-ink-500 text-xs leading-relaxed">{note}</p>
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
                with Ace Blend. Our panel reviewed the lab reports, the ingredient forms, and the label.
                We certified only what the evidence supports. Nothing else appears on this page.
              </p>
              <p className="text-ink-500 text-sm leading-relaxed mb-10">
                Our evaluation covers label accuracy, ingredient form verification, purity testing,
                and formula composition review. We set the trust ceiling above what regulations require.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: "4", label: "Evaluation layers", color: "text-teal-600", bg: "bg-teal-50 border-teal-100" },
                  { value: "10", label: "Claims assessed", color: "text-coral-500", bg: "bg-coral-50 border-coral-100" },
                  { value: "5", label: "Tests on file", color: "text-violet-600", bg: "bg-violet-50 border-violet-100" },
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
              <p className="text-teal-600 text-[11px]">TCS-IN-2026-071834 [SAMPLE] · Valid 15 May 2026 to 14 May 2027 [SAMPLE]</p>
            </div>

            <Link
              href="/verify/tcs-in-2026-071834-d9a3f6c2b8e1"
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
