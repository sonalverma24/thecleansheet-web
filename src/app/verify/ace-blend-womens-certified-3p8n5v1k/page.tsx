import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Shield, Leaf, FlaskConical, AlertCircle, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Ace Blend Women's Methylated Multivitamin | Independently Certified | The Clean Sheet",
  description:
    "Ace Blend Women's Methylated Multivitamin independently certified by The Clean Sheet. Label accuracy, heavy metals, and active methylated forms verified.",
  robots: { index: false, follow: false },
};

export default function AceBlendCertPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* Status bar */}
      <div className="bg-teal-950 border-b border-teal-800">
        <div className="max-w-5xl mx-auto px-5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={14} height={14} className="object-contain opacity-90" />
            <span className="text-teal-200 text-[10px] font-semibold tracking-[0.15em] uppercase">The Clean Sheet</span>
            <span className="text-teal-700 text-[10px] hidden sm:block">Independent Certification</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-amber-300 text-[10px] font-medium">Sample Data: Verification Not Complete</span>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="grain-overlay bg-teal-950 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto px-5 pt-10 pb-12">

          {/* TCS identity — who is certifying this */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-teal-800 animate-fade-in">
            <div className="flex items-center gap-3">
              <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={32} height={32} className="object-contain" />
              <div>
                <p className="text-white text-sm font-bold tracking-tight">The Clean Sheet</p>
                <p className="text-teal-400 text-xs">Independent third-party certification body</p>
              </div>
            </div>
            <p className="text-teal-500 text-xs leading-relaxed max-w-xs">
              No commercial relationship with Ace Blend. We reviewed their lab reports,
              ingredient forms, and label. This page shows only what the evidence supports.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8 lg:gap-12">
            <div className="flex-1">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-none tracking-tight mb-4 animate-fade-up">
                Women&apos;s<br />
                <span style={{ color: "#D6FF3E" }}>Methylated</span><br />
                Multivitamin
              </h1>
              <p className="text-teal-500 text-xs font-medium tracking-wide mb-4 animate-fade-up delay-100">Ace Blend</p>

              <div className="flex flex-wrap gap-2 animate-fade-up delay-200">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold bg-teal-600 text-white px-2.5 py-1 rounded-full">
                  <Shield size={8} /> PRISM Core Certified
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold bg-violet-600 text-white px-2.5 py-1 rounded-full">
                  <Leaf size={8} /> PRISM Purity Verified
                </span>
              </div>

              <p className="text-teal-500 text-xs leading-relaxed max-w-sm mt-5 animate-fade-up delay-300">
                Every claim reviewed by an independent panel against submitted laboratory evidence.
                Randomised sample selection. No brand involvement.
              </p>
            </div>

            <div className="flex-shrink-0 animate-fade-up delay-200">
              <div className="animate-float relative">
                <div className="absolute -inset-3 rounded-3xl opacity-20"
                  style={{ background: "radial-gradient(circle, #248179, transparent)" }} />
                <div className="relative w-36 h-48 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-3"
                  style={{ background: "linear-gradient(145deg, #0F2C2A 0%, #1D5550 100%)" }}>
                  <div className="absolute inset-0 border border-teal-700/50 rounded-2xl" />
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #248179, #45B8B0)" }}>
                    <span className="font-bold text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>A</span>
                  </div>
                  <div className="text-center px-3">
                    <p className="text-white text-[10px] font-bold tracking-wider uppercase">Ace Blend</p>
                    <p className="text-teal-300 text-[9px] font-medium leading-snug mt-0.5">Women&apos;s Methylated<br />Multivitamin</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, #D6FF3E, transparent)" }} />
                </div>
                <div className="absolute -bottom-2 -right-2 drop-shadow-xl">
                  <Image src="/images/tcs-certified-badge.png" alt="TCS Certified" width={40} height={40} className="object-contain" />
                </div>
              </div>
            </div>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px mt-10 border border-teal-800 rounded-xl overflow-hidden animate-fade-up delay-400">
            {[
              { n: "2",  label: "Methylated forms",      sub: "Methylcobalamin + L-5-MTHF" },
              { n: "4",  label: "Heavy metals cleared",  sub: "Lead · Arsenic · Mercury · Cadmium" },
              { n: "2",  label: "Pathogens screened",    sub: "Salmonella + Listeria" },
              { n: "0",  label: "Artificial additives",  sub: "No colors. No flavors." },
            ].map(({ n, label, sub }) => (
              <div key={label} className="bg-teal-900/60 px-4 py-4 text-center">
                <p className="font-bold leading-none mb-1.5 text-3xl sm:text-4xl" style={{ color: "#D6FF3E" }}>{n}</p>
                <p className="text-teal-200 text-[9px] font-bold uppercase tracking-widest mb-0.5">{label}</p>
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
              {["Label Accuracy Verified", "Heavy Metals Cleared", "Active Methylated Forms Confirmed", "Microbiologically Safe", "No Artificial Additives", "Randomised Independent Testing"].map((item) => (
                <span key={item} className="flex items-center">
                  <span className="text-white text-[10px] font-semibold tracking-widest uppercase px-5">{item}</span>
                  <span className="text-yellow-300 text-xs">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Section headline */}
      <section className="bg-white pt-12 pb-3 px-5">
        <div className="max-w-5xl mx-auto">
          <p className="text-teal-600 text-[9px] font-bold tracking-[0.2em] uppercase mb-3">What was independently verified</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-ink-950 tracking-tight leading-none">
            Pure formula.<br /><span className="text-ink-400">Active ingredients.</span>
          </h2>
        </div>
      </section>

      {/* Bento grid */}
      <section className="px-5 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">

            {/* Methylcobalamin */}
            <div className="lg:col-span-2 rounded-2xl p-6 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #248179 0%, #2E9E96 70%, #45B8B0 100%)" }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-teal-100 text-[9px] font-bold tracking-[0.2em] uppercase">Vitamin B12</span>
                <CheckCircle2 size={13} className="text-white/50" />
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1.5">Methylcobalamin</h3>
              <p className="text-teal-100 text-[9px] font-bold tracking-widest uppercase mb-3">Active form — confirmed present</p>
              <p className="text-white/70 text-xs leading-relaxed">
                The form your body uses directly. No enzyme conversion required.
                Standard multivitamins use cyanocobalamin, which must be converted —
                a step some people cannot complete efficiently.
              </p>
            </div>

            {/* L-5-MTHF */}
            <div className="lg:col-span-2 rounded-2xl p-6 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #5B21B6 0%, #7C3AED 60%, #8B5CF6 100%)" }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-violet-200 text-[9px] font-bold tracking-[0.2em] uppercase">Folate</span>
                <CheckCircle2 size={13} className="text-white/50" />
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1.5">L-5-MTHF</h3>
              <p className="text-violet-200 text-[9px] font-bold tracking-widest uppercase mb-3">Active form — confirmed present</p>
              <p className="text-white/70 text-xs leading-relaxed">
                Bypasses the MTHFR enzyme step entirely. Unlike folic acid, it works
                regardless of MTHFR gene variant status. Active for everyone.
              </p>
            </div>

            {/* Heavy metals */}
            <div className="lg:col-span-3 rounded-2xl p-5 bg-teal-950 relative overflow-hidden">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-teal-500 text-[9px] font-bold tracking-[0.2em] uppercase block mb-1">Purity Testing</span>
                  <h3 className="text-xl font-bold text-white tracking-tight">Heavy Metals Cleared</h3>
                </div>
                <CheckCircle2 size={14} className="text-teal-600 mt-1" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["Lead", "Arsenic", "Mercury", "Cadmium"].map((metal) => (
                  <div key={metal} className="bg-teal-900/60 border border-teal-800 rounded-lg px-3 py-2.5 text-center">
                    <CheckCircle2 size={10} className="text-teal-400 mx-auto mb-1" />
                    <p className="text-white text-xs font-semibold">{metal}</p>
                    <p className="text-teal-500 text-[9px] mt-0.5">Within limits</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Microbial */}
            <div className="lg:col-span-1 rounded-2xl p-5 bg-ink-50 border border-ink-100 flex flex-col justify-between">
              <div>
                <span className="text-ink-400 text-[9px] font-bold tracking-[0.2em] uppercase block mb-1.5">Microbial</span>
                <h3 className="text-base font-bold text-ink-950 tracking-tight mb-2">Microbiologically Safe</h3>
                <p className="text-ink-500 text-xs leading-relaxed">No Salmonella. No Listeria. Randomised sample testing.</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-[9px] font-semibold bg-teal-100 text-teal-700 px-2 py-1 rounded-md">No Salmonella</span>
                <span className="text-[9px] font-semibold bg-teal-100 text-teal-700 px-2 py-1 rounded-md">No Listeria</span>
              </div>
            </div>

            {/* Label accuracy */}
            <div className="lg:col-span-2 rounded-2xl p-5 bg-ink-50 border border-ink-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-ink-400 text-[9px] font-bold tracking-[0.2em] uppercase">Label Accuracy</span>
                <CheckCircle2 size={12} className="text-teal-600" />
              </div>
              <h3 className="text-base font-bold text-ink-950 tracking-tight mb-2">What it says is what&apos;s in it.</h3>
              <p className="text-ink-500 text-xs leading-relaxed">
                Nutritional composition tested against declared label values. Vitamin profile
                and mineral content — including Calcium — both verified within acceptable deviations.
              </p>
            </div>

            {/* Mineral content */}
            <div className="lg:col-span-2 rounded-2xl p-5 bg-teal-50 border border-teal-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-teal-600 text-[9px] font-bold tracking-[0.2em] uppercase">Minerals</span>
                <CheckCircle2 size={12} className="text-teal-600" />
              </div>
              <h3 className="text-base font-bold text-ink-950 tracking-tight mb-2">Mineral content verified.</h3>
              <p className="text-ink-500 text-xs leading-relaxed">
                Mineral composition, including Calcium, confirmed to match stated label values
                within accepted industry deviations.
              </p>
            </div>

            {/* Clean formula banner */}
            <div className="lg:col-span-4 rounded-xl overflow-hidden" style={{ background: "#0F2C2A" }}>
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(214,255,62,0.1)", border: "1px solid rgba(214,255,62,0.2)" }}>
                    <Leaf size={14} style={{ color: "#D6FF3E" }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white tracking-tight">No Artificial Colors. No Artificial Flavors.</p>
                    <p className="text-teal-400 text-xs">Ingredient list independently reviewed and confirmed.</p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {["No artificial colors", "No artificial flavors"].map((t) => (
                    <span key={t} className="text-[10px] font-semibold px-2.5 py-1 rounded-md"
                      style={{ background: "rgba(214,255,62,0.1)", color: "#D6FF3E", border: "1px solid rgba(214,255,62,0.2)" }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Methylation explainer — dark */}
      <section className="grain-overlay bg-teal-950 py-14 px-5 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto">
          <p className="text-teal-500 text-[9px] font-bold tracking-[0.2em] uppercase mb-4">Why the form matters</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-none mb-3">
            Most multivitamins use the cheap form.
          </h2>
          <p className="text-teal-400 text-sm leading-relaxed max-w-lg mb-8">
            An estimated 10-15% of people carry MTHFR variants that reduce their ability to convert
            synthetic vitamin forms. Methylated forms are already active — they work for everyone.
          </p>

          <div className="grid sm:grid-cols-2 gap-2.5">
            {[
              { nutrient: "Vitamin B12", standard: "Cyanocobalamin", methylated: "Methylcobalamin", why: "Cyanocobalamin must be converted before the body can use it. If conversion is inefficient, the vitamin passes through unused.", color: "#248179" },
              { nutrient: "Folate", standard: "Folic Acid", methylated: "L-5-MTHF", why: "Folic acid requires the MTHFR enzyme to convert. People with MTHFR variants accumulate unconverted folic acid instead of absorbing folate.", color: "#7C3AED" },
            ].map(({ nutrient, standard, methylated, why, color }) => (
              <div key={nutrient} className="rounded-xl overflow-hidden border border-teal-800">
                <div className="px-5 py-2.5 border-b border-teal-800" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-teal-500 text-[9px] font-bold tracking-widest uppercase">{nutrient}</p>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="flex-1 rounded-lg border border-teal-800 px-3 py-2 text-center bg-teal-900/30">
                      <p className="text-teal-600 text-[8px] font-bold tracking-widest uppercase mb-0.5">Standard</p>
                      <p className="text-teal-400 text-xs font-semibold line-through opacity-60">{standard}</p>
                    </div>
                    <span className="text-teal-700 font-bold text-xs">vs</span>
                    <div className="flex-1 rounded-lg px-3 py-2 text-center" style={{ background: `${color}22`, border: `1px solid ${color}40` }}>
                      <p className="text-[8px] font-bold tracking-widest uppercase mb-0.5" style={{ color }}>This formula</p>
                      <p className="text-white text-xs font-bold">{methylated}</p>
                    </div>
                  </div>
                  <p className="text-teal-500 text-xs leading-relaxed">{why}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testing */}
      <section className="bg-ink-50 border-y border-ink-100 py-14 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="lg:w-1/3">
              <p className="text-teal-600 text-[9px] font-bold tracking-[0.2em] uppercase mb-3">How verification was conducted</p>
              <h2 className="text-3xl font-bold text-ink-950 tracking-tight leading-tight">
                Independent.<br />Randomised.<br />No brand involvement.
              </h2>
            </div>
            <div className="lg:w-2/3 grid sm:grid-cols-3 gap-2.5">
              {[
                { num: "01", name: "Nutritional Accuracy", note: "Composition tested against declared values. Vitamin and mineral profiles both verified.", icon: <FlaskConical size={13} className="text-teal-600" /> },
                { num: "02", name: "Heavy Metal Screening", note: "Lead, Arsenic, Mercury, and Cadmium tested by independent lab. All four cleared.", icon: <Shield size={13} className="text-teal-600" /> },
                { num: "03", name: "Microbial Safety", note: "Screened for Salmonella and Listeria on randomised samples. Neither detected.", icon: <AlertCircle size={13} className="text-teal-600" /> },
              ].map(({ num, name, note, icon }) => (
                <div key={num} className="bg-white rounded-xl p-5 border border-ink-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-ink-300 text-xs font-bold">{num}</span>
                    <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">{icon}</div>
                  </div>
                  <p className="text-xs font-bold text-ink-950 tracking-tight mb-1.5">{name}</p>
                  <p className="text-ink-500 text-xs leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certification */}
      <section className="bg-white py-14 px-5 border-b border-ink-100">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-10">
            <div className="flex-shrink-0 text-center lg:text-left">
              <div className="relative w-16 h-16 mx-auto lg:mx-0 mb-3">
                <div className="absolute inset-0 rounded-full ring-1 ring-teal-200 ring-offset-3" />
                <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
                  <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={48} height={48} className="object-contain" />
                </div>
              </div>
              <p className="text-xs font-bold text-ink-900 tracking-tight">The Clean Sheet</p>
              <p className="text-[10px] text-ink-400">Independent Certification</p>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-ink-950 tracking-tight mb-3">What certification means</h2>
              <p className="text-ink-500 text-sm leading-relaxed mb-2">
                The Clean Sheet is an independent certification body with no commercial relationship with Ace Blend.
                Our panel reviewed the lab reports, the ingredient forms, and the label. Certified only what the evidence supports.
              </p>
              <p className="text-ink-500 text-sm leading-relaxed mb-7">
                Our evaluation covers label accuracy, ingredient form verification, purity testing,
                and formula composition review. We set the trust ceiling above what regulations require.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { value: "4",    label: "Evaluation layers",    color: "text-teal-600",   bg: "bg-teal-50 border-teal-100" },
                  { value: "10",   label: "Claims assessed",      color: "text-coral-500",  bg: "bg-coral-50 border-coral-100" },
                  { value: "5",    label: "Tests on file",        color: "text-violet-600", bg: "bg-violet-50 border-violet-100" },
                  { value: "1 yr", label: "Certification validity", color: "text-teal-600", bg: "bg-teal-50 border-teal-100" },
                ].map(({ value, label, color, bg }) => (
                  <div key={label} className={`text-center rounded-xl p-4 border ${bg}`}>
                    <p className={`text-2xl font-bold tracking-tight leading-none mb-1.5 ${color}`}>{value}</p>
                    <p className="text-xs text-ink-500">{label}</p>
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
                <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={16} height={16} className="object-contain" />
                <span className="text-white text-xs font-bold tracking-tight">The Clean Sheet</span>
              </div>
              <p className="text-teal-600 text-[10px]">TCS-IN-2026-071834 [SAMPLE] · Valid 15 May 2026 to 14 May 2027 [SAMPLE]</p>
            </div>
            <Link href="/verify/tcs-in-2026-071834-d9a3f6c2b8e1"
              className="inline-flex items-center gap-1.5 text-teal-300 hover:text-white text-[11px] font-semibold border border-teal-700 hover:border-teal-500 px-4 py-2 rounded-lg transition-colors">
              View full technical certification <ArrowUpRight size={11} />
            </Link>
          </div>
          <div className="mt-6 pt-5 border-t border-teal-900 text-center">
            <p className="text-teal-700 text-[10px]">Global regulations set the legal floor. The Clean Sheet sets the trust ceiling.</p>
            <p className="text-teal-800 text-[10px] mt-0.5">© The Clean Sheet 2026</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
