import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2, Shield, Leaf, Sparkles, Star,
  FlaskConical, Pill, AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Ace Blend Women's Methylated Multivitamin | Independently Certified | The Clean Sheet",
  description:
    "Ace Blend Women's Methylated Multivitamin is independently certified by The Clean Sheet. Label accuracy, heavy metals, and active ingredient forms verified against submitted laboratory evidence.",
  robots: { index: false, follow: false },
};

/* ── Verified claim card ─────────────────────────────────────── */
function ClaimCard({
  icon, title, detail, accent = "teal",
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  accent?: "teal" | "coral" | "gold" | "sky" | "violet";
}) {
  const styles = {
    teal:   { bg: "bg-teal-50",   border: "border-teal-200",   icon: "bg-teal-600 text-white" },
    coral:  { bg: "bg-coral-50",  border: "border-coral-200",  icon: "bg-coral-500 text-white" },
    gold:   { bg: "bg-gold-50",   border: "border-gold-100",   icon: "bg-gold-500 text-white" },
    sky:    { bg: "bg-sky-50",    border: "border-sky-200",    icon: "bg-sky-500 text-white" },
    violet: { bg: "bg-violet-50", border: "border-violet-200", icon: "bg-violet-500 text-white" },
  }[accent];
  return (
    <div className={`flex items-start gap-4 p-5 rounded-xl border ${styles.bg} ${styles.border}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <p className="text-sm font-semibold text-ink-900 tracking-tight">{title}</p>
          <CheckCircle2 size={13} className="text-teal-600 flex-shrink-0" />
        </div>
        <p className="text-xs text-ink-500 leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function AceBlendCertPage() {
  return (
    <div className="bg-white min-h-screen font-sans">

      {/* ── 1. Top bar ───────────────────────────────────────── */}
      <div className="bg-teal-600 border-b border-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={18} height={18} className="object-contain" />
            <span className="text-white text-xs font-semibold tracking-widest uppercase">The Clean Sheet</span>
            <span className="text-teal-300 text-xs hidden sm:block">Independent Certification</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />
            <span className="text-amber-200 text-xs font-medium">Sample Data: Verification Not Complete</span>
          </div>
        </div>
      </div>

      {/* ── 2. Hero ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-ink-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-14">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10">

            {/* Product visual */}
            <div className="flex-shrink-0 relative">
              <div className="relative w-44 h-56 sm:w-48 sm:h-60 rounded-2xl overflow-hidden ring-1 ring-teal-200 flex flex-col items-center justify-center gap-3"
                style={{ background: "linear-gradient(145deg, #EDF8F7 0%, #D4F2EF 100%)" }}>
                <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center">
                  <Pill size={30} className="text-white" />
                </div>
                <div className="text-center px-3">
                  <p className="text-teal-700 text-xs font-bold tracking-tight leading-tight">Ace Blend</p>
                  <p className="text-teal-600 text-[10px] font-medium leading-snug mt-0.5">Women&apos;s Methylated<br />Multivitamin</p>
                </div>
              </div>
              {/* TCS badge */}
              <div className="absolute -bottom-3 -right-3 w-14 h-14 drop-shadow-lg">
                <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet Certified" width={56} height={56} className="object-contain" />
              </div>
            </div>

            {/* Text block */}
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 tracking-wide">
                <Sparkles size={11} />
                Independently Certified by The Clean Sheet
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-ink-950 leading-none tracking-tight mb-2">
                Women&apos;s Methylated<br />Multivitamin
              </h1>
              <p className="text-teal-600 text-lg font-semibold tracking-tight mb-1">Active Bioavailable Forms</p>
              <p className="text-ink-400 text-sm mb-7">Ace Blend</p>

              {/* PRISM badges */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-7">
                {[
                  { label: "PRISM Core Certified", icon: <Shield size={10} />, cls: "bg-teal-600 text-white border-teal-700" },
                  { label: "PRISM Purity Verified", icon: <Leaf size={10} />, cls: "bg-violet-500 text-white border-violet-600" },
                ].map(({ label, icon, cls }) => (
                  <div key={label} className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border tracking-wide ${cls}`}>
                    {icon} {label}
                  </div>
                ))}
              </div>

              <p className="text-ink-500 text-sm leading-relaxed max-w-md mx-auto sm:mx-0">
                Every claim on this page was reviewed by an independent panel against submitted
                laboratory evidence. Independent testing was conducted on randomised samples
                without brand involvement. Only what the evidence supports appears here.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Verification strip ────────────────────────────── */}
      <div className="bg-teal-600 border-b border-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-teal-500">
            {[
              { value: "2", label: "Methylated forms", sub: "Methylcobalamin + L-5-MTHF" },
              { value: "4", label: "Heavy metals cleared", sub: "Lead, Arsenic, Mercury, Cadmium" },
              { value: "2", label: "Pathogens screened", sub: "Salmonella + Listeria" },
              { value: "0", label: "Artificial additives", sub: "No colors, no flavors" },
            ].map(({ value, label, sub }) => (
              <div key={label} className="text-center py-7 px-4">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1 tracking-tight leading-none">{value}</p>
                <p className="text-teal-200 text-[10px] font-semibold uppercase tracking-widest mb-0.5 mt-2">{label}</p>
                <p className="text-teal-300 text-[11px]">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Section headline ──────────────────────────────── */}
      <div className="bg-white py-16 px-4 text-center border-b border-ink-100">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-coral-50 border border-coral-200 text-coral-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 tracking-wide">
            <Star size={10} />
            What was independently verified
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-ink-950 leading-none tracking-tight mb-5">
            Pure formula.<br />Active ingredients.
          </h2>
          <p className="text-ink-500 text-base leading-relaxed">
            The Clean Sheet reviewed the lab testing, the ingredient forms, and the label.
            What you see below is only what passed.
          </p>
        </div>
      </div>

      {/* ── 5. Methylated forms — the lead story ─────────────── */}
      <div className="px-4 py-10">
        <div className="max-w-4xl mx-auto">

          {/* B12 + Folate top cards */}
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            {/* B12 card */}
            <div className="relative overflow-hidden rounded-2xl p-7"
              style={{ background: "linear-gradient(135deg, #248179 0%, #2E9E96 60%, #45B8B0 100%)" }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center">
                  <Pill size={14} className="text-white" />
                </div>
                <span className="text-teal-100 text-[10px] font-bold uppercase tracking-widest">Vitamin B12</span>
                <CheckCircle2 size={14} className="text-white/60 ml-auto" />
              </div>
              <p className="text-4xl font-bold text-white mb-1 leading-none tracking-tight">Methylcobalamin</p>
              <p className="text-teal-200 text-xs font-semibold mb-4 tracking-wide uppercase">Active form — confirmed present</p>
              <p className="text-white/70 text-xs leading-relaxed">
                Methylcobalamin is the active, bioavailable form of B12 — the form your body uses
                directly, without conversion. Standard multivitamins commonly use cyanocobalamin,
                which requires conversion steps the body may not complete efficiently.
              </p>
            </div>

            {/* Folate card */}
            <div className="relative overflow-hidden rounded-2xl p-7"
              style={{ background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 60%, #8B5CF6 100%)" }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center">
                  <FlaskConical size={14} className="text-white" />
                </div>
                <span className="text-violet-200 text-[10px] font-bold uppercase tracking-widest">Folate</span>
                <CheckCircle2 size={14} className="text-white/60 ml-auto" />
              </div>
              <p className="text-4xl font-bold text-white mb-1 leading-none tracking-tight">L-5-MTHF</p>
              <p className="text-violet-200 text-xs font-semibold mb-4 tracking-wide uppercase">Active form — confirmed present</p>
              <p className="text-white/70 text-xs leading-relaxed">
                L-5-MTHF is the active form of folate. Unlike folic acid, it does not require
                conversion by the MTHFR enzyme. People with MTHFR gene variants cannot efficiently
                convert standard folic acid — this form bypasses that barrier entirely.
              </p>
            </div>
          </div>

          {/* MTHFR explanation banner */}
          <div className="rounded-2xl p-6 mb-3 border border-violet-200"
            style={{ background: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)" }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-violet-600">
                <AlertCircle size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-sm font-bold text-ink-900 tracking-tight">Why the form matters</h3>
                </div>
                <p className="text-xs text-ink-500 leading-relaxed max-w-xl">
                  An estimated 10-15% of people carry MTHFR gene variants that reduce their ability
                  to convert standard synthetic vitamins into forms the body can use. Methylated forms
                  are already in their active state. This formula uses both — and both were independently confirmed present.
                </p>
              </div>
              <div className="flex-shrink-0 text-center bg-white rounded-xl px-5 py-3 border border-violet-200">
                <p className="text-2xl font-bold text-violet-600 tracking-tight leading-none">Active</p>
                <p className="text-ink-400 text-[10px] mt-1 font-medium uppercase tracking-wide">Both forms</p>
              </div>
            </div>
          </div>

          {/* Purity claims grid */}
          <div className="grid sm:grid-cols-2 gap-2 mb-2">
            <ClaimCard
              accent="teal"
              icon={<Shield size={15} />}
              title="Label Accuracy Verified"
              detail="Nutritional composition tested against declared label values. Vitamin profile and mineral content both align with what is stated on the label."
            />
            <ClaimCard
              accent="coral"
              icon={<AlertCircle size={15} />}
              title="Heavy Metals Safe"
              detail="Lead, Arsenic, Mercury, and Cadmium all tested within safe limits by an independent third-party laboratory."
            />
            <ClaimCard
              accent="sky"
              icon={<FlaskConical size={15} />}
              title="Microbiologically Safe"
              detail="No Salmonella and no Listeria monocytogenes detected. Microbial screening conducted on randomised samples without brand involvement."
            />
            <ClaimCard
              accent="gold"
              icon={<CheckCircle2 size={15} />}
              title="Mineral Content Verified"
              detail="Mineral composition, including Calcium, tested and confirmed to match declared label values within acceptable deviations."
            />
          </div>

          {/* Clean formula banner */}
          <div className="flex items-center gap-4 bg-teal-600 rounded-xl px-6 py-4">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <Leaf size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">No Artificial Colors or Flavors: Independently Confirmed</p>
              <p className="text-teal-200 text-xs mt-0.5">Ingredient list reviewed. No artificial colors, no artificial flavors present in the formula.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. Standard vs methylated comparison ─────────────── */}
      <div className="py-16 px-4 bg-ink-50 border-y border-ink-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-teal-600 text-[10px] font-bold uppercase tracking-widest text-center mb-2">Why methylated forms are different</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-950 tracking-tight text-center mb-10">Most multivitamins use the cheap form.</h2>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                standard: "Cyanocobalamin",
                methylated: "Methylcobalamin",
                nutrient: "Vitamin B12",
                why: "Methylcobalamin is the active form your cells use. Cyanocobalamin must be converted, a step some people cannot complete efficiently.",
                borderColor: "border-l-teal-600",
              },
              {
                standard: "Folic Acid",
                methylated: "L-5-MTHF",
                nutrient: "Folate",
                why: "L-5-MTHF bypasses the MTHFR enzyme conversion step. People with MTHFR variants may accumulate unconverted folic acid instead of absorbing folate.",
                borderColor: "border-l-violet-500",
              },
            ].map(({ standard, methylated, nutrient, why, borderColor }) => (
              <div key={nutrient} className={`bg-white rounded-xl p-5 border border-ink-200 border-l-4 ${borderColor}`}>
                <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-3">{nutrient}</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 text-center bg-ink-50 border border-ink-200 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-wide mb-0.5">Standard form</p>
                    <p className="text-sm font-semibold text-ink-500 line-through">{standard}</p>
                  </div>
                  <div className="text-ink-300 text-xs font-bold">vs</div>
                  <div className="flex-1 text-center bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wide mb-0.5">This formula</p>
                    <p className="text-sm font-bold text-teal-700">{methylated}</p>
                  </div>
                </div>
                <p className="text-xs text-ink-500 leading-relaxed">{why}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 7. Testing methodology ────────────────────────────── */}
      <div className="py-16 px-4 bg-teal-600 border-b border-teal-700">
        <div className="max-w-4xl mx-auto">
          <p className="text-teal-300 text-[10px] font-bold uppercase tracking-widest text-center mb-2">How verification was conducted</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight text-center mb-3">Independent. Randomised. Without brand involvement.</h2>
          <p className="text-teal-200 text-sm text-center mb-10 max-w-lg mx-auto">
            Testing was conducted by an independent third-party laboratory.
            Samples were selected randomly — without any input from Ace Blend.
          </p>

          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            {[
              {
                name: "Nutritional Accuracy",
                note: "Composition tested against declared label values. Both vitamin profile and mineral content verified within acceptable deviations.",
              },
              {
                name: "Heavy Metal Screening",
                note: "Lead, Arsenic, Mercury, and Cadmium all tested. All four within established safe limits.",
              },
              {
                name: "Microbial Safety",
                note: "Screened for Salmonella and Listeria monocytogenes. Neither detected.",
              },
            ].map(({ name, note }) => (
              <div key={name} className="rounded-xl p-5 bg-white/10 border border-white/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
                    <CheckCircle2 size={11} className="text-white" />
                  </div>
                  <p className="text-sm font-bold text-white tracking-tight">{name}</p>
                </div>
                <p className="text-teal-200 text-xs leading-relaxed">{note}</p>
              </div>
            ))}
          </div>

          {/* What's not in it */}
          <div className="bg-white/10 border border-white/20 rounded-xl p-5">
            <p className="text-teal-200 text-[10px] font-bold uppercase tracking-widest mb-3">What&apos;s not in this formula</p>
            <div className="flex flex-wrap gap-2">
              {[
                "No artificial colors",
                "No artificial flavors",
                "No excess heavy metals",
                "No Salmonella",
                "No Listeria",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-[11px] font-medium px-3 py-1.5 rounded-md">
                  <CheckCircle2 size={10} className="text-teal-300" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 8. What certification means ──────────────────────── */}
      <div className="py-16 px-4 bg-white border-b border-ink-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-10 mb-12">
            <div className="flex-shrink-0 text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <div className="absolute inset-0 rounded-full ring-2 ring-teal-200 ring-offset-2" />
                <div className="absolute inset-0 rounded-full bg-teal-50 flex items-center justify-center">
                  <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet Certified" width={72} height={72} className="object-contain" />
                </div>
              </div>
              <p className="text-xs text-ink-900 font-bold tracking-tight">The Clean Sheet</p>
              <p className="text-[10px] text-ink-400 font-medium">Independent Certification</p>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-ink-950 tracking-tight mb-4">What certification means</h2>
              <p className="text-ink-500 text-sm leading-relaxed mb-3">
                The Clean Sheet is an independent certification body. We have no commercial relationship
                with Ace Blend. Our panel reviewed the lab reports, the ingredient forms, and the label.
                Certified only what the evidence supports.
              </p>
              <p className="text-ink-500 text-sm leading-relaxed">
                Our evaluation covers label accuracy, ingredient form verification, purity testing, and
                formula composition review. We set the trust ceiling above what regulations require.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: "4", label: "Evaluation layers", accent: "border-teal-200 bg-teal-50", val: "text-teal-600" },
              { value: "10", label: "Claims assessed", accent: "border-coral-200 bg-coral-50", val: "text-coral-500" },
              { value: "5", label: "Tests on file", accent: "border-gold-200 bg-gold-50", val: "text-gold-500" },
              { value: "1 yr", label: "Certification validity", accent: "border-teal-200 bg-teal-50", val: "text-teal-600" },
            ].map(({ value, label, accent, val }) => (
              <div key={label} className={`text-center rounded-xl p-5 border ${accent}`}>
                <p className={`text-3xl font-bold tracking-tight leading-none mb-1 ${val}`}>{value}</p>
                <p className="text-xs text-ink-500 mt-2">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 9. Footer ─────────────────────────────────────────── */}
      <div className="bg-teal-600 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={24} height={24} className="object-contain" />
            <span className="text-white text-sm font-bold tracking-tight">The Clean Sheet</span>
          </div>
          <p className="text-teal-200 text-xs mb-1">Certificate ID: TCS-IN-2026-071834 [SAMPLE]</p>
          <p className="text-teal-300 text-xs mb-6">Valid: 15 May 2026 to 14 May 2027 [SAMPLE]</p>
          <Link
            href="/verify/tcs-in-2026-071834-d9a3f6c2b8e1"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            View full technical certification
          </Link>
          <p className="text-teal-300 text-[11px] mt-8">
            Global regulations set the legal floor. The Clean Sheet sets the trust ceiling.
          </p>
          <p className="text-teal-400 text-[10px] mt-1">© The Clean Sheet 2026</p>
        </div>
      </div>

    </div>
  );
}
