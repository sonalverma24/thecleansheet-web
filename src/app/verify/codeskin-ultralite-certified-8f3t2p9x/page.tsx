import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2, Shield, Sun, Leaf, Droplets, Eye,
  FlaskConical, Sparkles, Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++ | Independently Certified | The Clean Sheet",
  description:
    "CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++ is independently certified by The Clean Sheet. Every claim on this page has been verified against scientific evidence.",
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
    teal:   { bg: "bg-teal-50",   border: "border-teal-200",   icon: "bg-teal-600 text-white",   dot: "bg-teal-400" },
    coral:  { bg: "bg-coral-50",  border: "border-coral-200",  icon: "bg-coral-500 text-white",  dot: "bg-coral-400" },
    gold:   { bg: "bg-gold-50",   border: "border-gold-100",   icon: "bg-gold-500 text-white",   dot: "bg-gold-400" },
    sky:    { bg: "bg-sky-50",    border: "border-sky-200",    icon: "bg-sky-500 text-white",    dot: "bg-sky-400" },
    violet: { bg: "bg-violet-50", border: "border-violet-200", icon: "bg-violet-500 text-white", dot: "bg-violet-400" },
  }[accent];
  return (
    <div className={`relative flex items-start gap-4 p-5 rounded-2xl border ${styles.bg} ${styles.border}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${styles.icon}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <p className="text-sm font-semibold text-ink-900">{title}</p>
          <CheckCircle2 size={13} className="text-teal-600 flex-shrink-0" />
        </div>
        <p className="text-xs text-ink-500 leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function ConsumerCertPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* ── 1. Top bar ───────────────────────────────────────── */}
      <div className="bg-teal-600 border-b border-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={18} height={18} className="object-contain" />
            <span className="text-white text-xs font-medium tracking-wide">THE CLEAN SHEET</span>
            <span className="text-teal-200 text-xs hidden sm:block">Independent Certification</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />
            <span className="text-amber-200 text-xs font-medium">Sample Data: Verification Not Complete</span>
          </div>
        </div>
      </div>

      {/* ── 2. Hero ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white">

        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.07] blur-3xl"
          style={{ background: "radial-gradient(circle, #248179, transparent)" }} aria-hidden />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-[0.06] blur-3xl"
          style={{ background: "radial-gradient(circle, #FD6158, transparent)" }} aria-hidden />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-14">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10">

            {/* Product visual */}
            <div className="flex-shrink-0 relative">
              {/* Colourful ring */}
              <div className="absolute -inset-3 rounded-full opacity-20"
                style={{ background: "conic-gradient(from 0deg, #248179, #FD6158, #D4A843, #248179)" }}
                aria-hidden />
              <div className="relative w-44 h-56 sm:w-48 sm:h-60 rounded-3xl overflow-hidden"
                style={{ background: "linear-gradient(145deg, #EDF8F7 0%, #D4F2EF 100%)" }}>
                <Image
                  src="https://codeskin.in/cdn/shop/files/UltraLite_Fluid_Sunscreen_bottle_s.png?v=1768211190"
                  alt="CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++"
                  fill
                  className="object-contain p-3"
                  unoptimized
                />
              </div>
              {/* TCS badge */}
              <div className="absolute -bottom-3 -right-3 w-14 h-14 drop-shadow-xl">
                <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet Certified" width={56} height={56} className="object-contain" />
              </div>
            </div>

            {/* Text block */}
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
                <Sparkles size={11} className="text-teal-600" />
                Independently Certified by The Clean Sheet
              </div>

              <h1 className="text-4xl sm:text-5xl font-medium text-ink-950 leading-tight mb-2">
                UltraLite Fluid<br />Sunscreen
              </h1>
              <p className="text-teal-600 text-xl font-medium mb-1">SPF 50+ PA++++</p>
              <p className="text-ink-400 text-sm mb-7">CodeSkin India</p>

              {/* PRISM badges */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-7">
                {[
                  { label: "PRISM Core Certified", icon: <Shield size={10} />, cls: "bg-teal-600 text-white border-teal-700" },
                  { label: "PRISM Sun Verified", icon: <Sun size={10} />, cls: "bg-coral-500 text-white border-coral-600" },
                ].map(({ label, icon, cls }) => (
                  <div key={label} className={`flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full border ${cls}`}>
                    {icon} {label}
                  </div>
                ))}
              </div>

              <p className="text-ink-500 text-sm leading-relaxed max-w-md mx-auto sm:mx-0">
                Every claim on this page was reviewed by an independent panel of cosmetic scientists,
                toxicologists, regulatory specialists, and dermatologists. Each one evaluated against
                submitted laboratory evidence. No exceptions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Stats strip ───────────────────────────────────── */}
      <div className="bg-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-teal-500">
            {[
              { value: "59.92", label: "SPF Tested", sub: "Label: SPF 50+" },
              { value: "22.07", label: "UVAPF", sub: "PA++++ confirmed" },
              { value: "94%",   label: "SPF Retained", sub: "After 80 min in water" },
              { value: "33",    label: "Participants", sub: "Non-comedogenic study" },
            ].map(({ value, label, sub }) => (
              <div key={label} className="text-center py-6 px-4">
                <p className="text-3xl sm:text-4xl font-medium text-white mb-1">{value}</p>
                <p className="text-teal-100 text-[10px] font-semibold uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-teal-200 text-[11px]">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Section headline ──────────────────────────────── */}
      <div className="bg-white py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-coral-50 border border-coral-200 text-coral-600 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
            <Star size={10} />
            What was independently verified
          </div>
          <h2 className="text-4xl sm:text-5xl font-medium text-ink-950 leading-tight mb-5">
            Every claim,<br />backed by science.
          </h2>
          <p className="text-ink-500 text-base leading-relaxed">
            The Clean Sheet reviewed the formula, the lab reports, the clinical studies, and the label.
            What you see below is only what passed.
          </p>
        </div>
      </div>

      {/* ── 5. Hero claims ────────────────────────────────────── */}
      <div className="px-4 pb-6">
        <div className="max-w-4xl mx-auto">

          {/* SPF + PA top cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {/* SPF card */}
            <div className="relative overflow-hidden rounded-3xl p-7"
              style={{ background: "linear-gradient(135deg, #248179 0%, #2E9E96 60%, #45B8B0 100%)" }}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 -translate-y-8 translate-x-8"
                style={{ background: "radial-gradient(circle, white, transparent)" }} aria-hidden />
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sun size={14} className="text-white" />
                </div>
                <span className="text-teal-100 text-xs font-semibold uppercase tracking-widest">SPF Performance</span>
                <CheckCircle2 size={14} className="text-teal-200 ml-auto" />
              </div>
              <p className="text-7xl font-medium text-white mb-1 leading-none">50+</p>
              <p className="text-teal-100 text-sm mb-4">Tested at SPF 59.92</p>
              <p className="text-teal-100/80 text-xs leading-relaxed">
                Independent lab test confirmed SPF of 59.92 against the label claim of SPF 50+.
                The product delivers more protection than it promises.
              </p>
            </div>

            {/* PA card */}
            <div className="relative overflow-hidden rounded-3xl p-7"
              style={{ background: "linear-gradient(135deg, #E84940 0%, #FD6158 60%, #FE7F78 100%)" }}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 -translate-y-8 translate-x-8"
                style={{ background: "radial-gradient(circle, white, transparent)" }} aria-hidden />
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <Shield size={14} className="text-white" />
                </div>
                <span className="text-red-100 text-xs font-semibold uppercase tracking-widest">UVA Protection</span>
                <CheckCircle2 size={14} className="text-red-200 ml-auto" />
              </div>
              <p className="text-5xl font-medium text-white mb-1 leading-none">PA++++</p>
              <p className="text-red-100 text-sm mb-4">UVAPF tested at 22.07</p>
              <p className="text-red-100/80 text-xs leading-relaxed">
                PA++++ is the highest UVA protection tier. A UVAPF of 16 or above is required.
                This product tested at 22.07. Comfortably verified.
              </p>
            </div>
          </div>

          {/* Water resistance - full width */}
          <div className="relative overflow-hidden rounded-3xl p-6 mb-4"
            style={{ background: "linear-gradient(135deg, #FDF4DC 0%, #FEF9EE 100%)" }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ background: "linear-gradient(135deg, #D4A843, #E8C56A)" }}>
                <Droplets size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-base font-semibold text-ink-900">Water Resistant for 80 Minutes</h3>
                  <CheckCircle2 size={14} className="text-teal-600" />
                </div>
                <p className="text-xs text-ink-500 leading-relaxed max-w-xl">
                  After 80 minutes of water immersion, this sunscreen retained 94% of its original SPF.
                  Tested to ISO 16217 standard. The label says &quot;water resistant&quot; and the test proves it.
                </p>
              </div>
              <div className="flex-shrink-0 text-center bg-white rounded-2xl px-5 py-3 border border-gold-100 shadow-sm">
                <p className="text-3xl font-medium text-gold-500">94%</p>
                <p className="text-ink-400 text-xs mt-0.5">SPF after 80 min</p>
              </div>
            </div>
          </div>

          {/* Claims grid */}
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <ClaimCard
              accent="teal"
              icon={<FlaskConical size={16} />}
              title="Non-Comedogenic"
              detail="28-day clinical study on 33 adults with oily and mixed-oily skin. Zero new comedones observed. 61.5% reduction in inflammatory acne lesions."
            />
            <ClaimCard
              accent="coral"
              icon={<Shield size={16} />}
              title="Dermatologist-Tested"
              detail="Primary irritation patch test conducted under dermatologist supervision. Zero irritation reported across all participants."
            />
            <ClaimCard
              accent="sky"
              icon={<Eye size={16} />}
              title="Ophthalmologist-Tested"
              detail="3-day ocular safety study with twice-daily application under ophthalmologist supervision. No eye irritation reported."
            />
            <ClaimCard
              accent="gold"
              icon={<Droplets size={16} />}
              title="Deeply Hydrating"
              detail="65% increase in skin hydration at 8 hours. 38% increase sustained at 24 hours. Measured on a dry skin panel."
            />
            <ClaimCard
              accent="violet"
              icon={<Leaf size={16} />}
              title="Reef-Safe"
              detail="Contains no oxybenzone, octinoxate, or octisalate: the UV filters banned under Hawaii and Palau reef protection laws."
            />
            <ClaimCard
              accent="teal"
              icon={<Leaf size={16} />}
              title="Vegan and Cruelty-Free"
              detail="Full ingredient list reviewed. No animal-derived ingredients present. No animal testing."
            />
          </div>

          {/* Fragrance-free banner */}
          <div className="flex items-center gap-4 bg-teal-600 rounded-2xl px-6 py-4">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Fragrance-Free: Independently Confirmed</p>
              <p className="text-teal-100 text-xs mt-0.5">No fragrance, parfum, or masking fragrance in the formula. No EU fragrance allergens above the safety threshold.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. Who this is for ───────────────────────────────── */}
      <div className="py-16 px-4" style={{ background: "linear-gradient(180deg, #F7F6F6 0%, #FFFFFF 100%)" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-teal-600 text-xs font-semibold uppercase tracking-widest text-center mb-2">Formula reviewed by our panel</p>
          <h2 className="text-3xl sm:text-4xl font-medium text-ink-950 text-center mb-10">Who this is for</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Dry skin", detail: "Multiple humectants including Hyaluronic Acid, Polyglutamic Acid, and Ectoin deliver and lock in hydration all day.", color: "border-l-teal-600" },
              { title: "Oily and combination skin", detail: "Clinically tested on oily and mixed-oily skin. Lightweight fluid texture. Zero new comedones in the 28-day study.", color: "border-l-coral-500" },
              { title: "Sensitive skin", detail: "Fragrance-free formula. No parabens, phenoxyethanol, or synthetic colours. Dermatologist-tested with zero irritation.", color: "border-l-sky-500" },
              { title: "Daily wear", detail: "Designed for all-day use. Breathable, non-greasy finish. Pairs with your existing routine.", color: "border-l-gold-500" },
              { title: "Eye area", detail: "Ophthalmologist-tested. Safe for use around the eye area, confirmed in a dedicated 3-day ocular safety study.", color: "border-l-violet-500" },
              { title: "Eco-conscious users", detail: "No oxybenzone or octinoxate. Vegan formula. Cruelty-free. No reef-toxic UV filters.", color: "border-l-teal-600" },
            ].map(({ title, detail, color }) => (
              <div key={title} className={`bg-white rounded-2xl p-5 border border-ink-100 border-l-4 shadow-sm ${color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={13} className="text-teal-600 flex-shrink-0" />
                  <p className="text-sm font-semibold text-ink-900">{title}</p>
                </div>
                <p className="text-xs text-ink-500 leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 7. UV filters ────────────────────────────────────── */}
      <div className="py-16 px-4 bg-teal-600">
        <div className="max-w-4xl mx-auto">
          <p className="text-teal-100 text-xs font-semibold uppercase tracking-widest text-center mb-2">What protects your skin</p>
          <h2 className="text-3xl sm:text-4xl font-medium text-white text-center mb-3">Next-generation UV filters</h2>
          <p className="text-teal-100 text-sm text-center mb-10 max-w-lg mx-auto">
            All three UV filters were verified as legally permitted in India and the EU,
            and confirmed present in the formula. None are on any global banned list.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              {
                name: "Tinosorb M",
                tech: "Methylene Bis-Benzotriazolyl Tetramethylbutylphenol",
                role: "Broad-spectrum UVA + UVB",
                note: "One of the most advanced UV filters available. Works in both UV and visible light range. Photostable.",
                accent: "bg-white/10 border-white/20",
              },
              {
                name: "Uvinul A Plus",
                tech: "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
                role: "Deep UVA protection",
                note: "Highly photostable UVA filter that stays effective under sun exposure without degrading.",
                accent: "bg-white/10 border-white/20",
              },
              {
                name: "Uvinul T 150",
                tech: "Ethylhexyl Triazone",
                role: "UVB protection",
                note: "Efficient, photostable UVB filter. Also helps stabilise other UV filters in the formula.",
                accent: "bg-white/10 border-white/20",
              },
            ].map(({ name, tech, role, note, accent }) => (
              <div key={name} className={`rounded-2xl p-5 border ${accent}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                </div>
                <p className="text-teal-200 text-[10px] font-mono mb-2 leading-relaxed">{tech}</p>
                <p className="text-teal-100 text-xs font-semibold mb-2">{role}</p>
                <p className="text-teal-100/80 text-xs leading-relaxed">{note}</p>
              </div>
            ))}
          </div>

          {/* What's not in it */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
            <p className="text-teal-100 text-xs font-semibold uppercase tracking-widest mb-3">What&apos;s not in this product</p>
            <div className="flex flex-wrap gap-2">
              {["No oxybenzone", "No octinoxate", "No homosalate", "No parabens", "No phenoxyethanol", "No synthetic fragrance", "No formaldehyde releasers"].map((item) => (
                <div key={item} className="flex items-center gap-1.5 bg-white/10 border border-white/15 text-white text-[11px] px-3 py-1.5 rounded-full">
                  <CheckCircle2 size={10} className="text-teal-200" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 8. What certification means ──────────────────────── */}
      <div className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-10 mb-12">
            <div className="flex-shrink-0 text-center">
              {/* Decorative ring around badge */}
              <div className="relative w-28 h-28 mx-auto mb-3">
                <div className="absolute inset-0 rounded-full opacity-15 animate-pulse-ring"
                  style={{ background: "conic-gradient(from 0deg, #248179, #FD6158, #D4A843, #248179)" }} />
                <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                  <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet Certified" width={80} height={80} className="object-contain" />
                </div>
              </div>
              <p className="text-xs text-ink-700 font-semibold">The Clean Sheet</p>
              <p className="text-[10px] text-ink-400">Independent Certification</p>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-medium text-ink-950 mb-4">What certification means</h2>
              <p className="text-ink-500 text-sm leading-relaxed mb-3">
                The Clean Sheet is an independent certification body. We have no commercial relationship
                with CodeSkin. A panel of cosmetic scientists, toxicologists, regulatory specialists,
                a microbiologist, a claims evaluator, and a dermatologist reviewed the formula,
                lab reports, clinical studies, and label. Certified only what the evidence supports.
              </p>
              <p className="text-ink-500 text-sm leading-relaxed">
                Our methodology is built on EU cosmetic safety science, India&apos;s Cosmetics Rules 2020,
                ISO testing standards, and IFRA fragrance guidelines. We set the trust ceiling above
                what regulations require.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: "5", label: "Evaluation layers", accent: "border-teal-200 bg-teal-50", val: "text-teal-600" },
              { value: "12", label: "Claims assessed", accent: "border-coral-200 bg-coral-50", val: "text-coral-500" },
              { value: "9", label: "Tests on file", accent: "border-gold-100 bg-gold-50", val: "text-gold-500" },
              { value: "1 yr", label: "Certification validity", accent: "border-teal-200 bg-teal-50", val: "text-teal-600" },
            ].map(({ value, label, accent, val }) => (
              <div key={label} className={`text-center rounded-2xl p-5 border ${accent}`}>
                <p className={`text-3xl font-medium mb-1 ${val}`}>{value}</p>
                <p className="text-xs text-ink-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 9. Footer ─────────────────────────────────────────── */}
      <div className="bg-teal-600 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={28} height={28} className="object-contain" />
            <span className="text-white text-sm font-semibold">The Clean Sheet</span>
          </div>
          <p className="text-teal-100 text-xs mb-1">Certificate ID: TCS-IN-2026-048291 [SAMPLE]</p>
          <p className="text-teal-200 text-xs mb-6">Valid: 15 May 2026 to 14 May 2027 [SAMPLE]</p>
          <Link
            href="/verify/tcs-in-2026-048291-b7f2a9c1e5d3"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs px-5 py-2.5 rounded-full transition-colors"
          >
            View full technical certification
          </Link>
          <p className="text-teal-100/60 text-[11px] mt-8">
            Global regulations set the legal floor. The Clean Sheet sets the trust ceiling.
          </p>
          <p className="text-teal-100/40 text-[10px] mt-1">© The Clean Sheet 2026</p>
        </div>
      </div>

    </div>
  );
}
