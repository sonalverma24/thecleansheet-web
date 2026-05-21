import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Shield, Sun, Leaf, Droplets, Eye, FlaskConical, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++ | Independently Certified | The Clean Sheet",
  description:
    "CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++ is independently certified by The Clean Sheet. Every claim on this page has been verified against scientific evidence.",
  robots: { index: false, follow: false },
};

/* ── Verified claim card ─────────────────────────────────────── */
function VerifiedClaim({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return (
    <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-teal-100 shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-ink-900">{title}</p>
          <CheckCircle2 size={13} className="text-teal-500 flex-shrink-0" />
        </div>
        <p className="text-xs text-ink-500 leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

/* ── Stat block ──────────────────────────────────────────────── */
function Stat({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <div className="text-center py-6 px-4 border-r border-teal-800/50 last:border-0">
      <p className="text-3xl sm:text-4xl font-medium text-white mb-1">{value}</p>
      <p className="text-teal-300 text-xs font-medium uppercase tracking-widest mb-1">{label}</p>
      <p className="text-teal-600 text-[11px]">{sub}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function ConsumerCertPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* ── 1. Top bar ───────────────────────────────────────── */}
      <div className="bg-teal-950 border-b border-teal-800/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={20} height={20} className="object-contain" />
            <span className="text-teal-300 text-xs font-medium tracking-wide">THE CLEAN SHEET</span>
            <span className="text-teal-700 text-xs hidden sm:block">Independent Certification</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-amber-400 text-xs font-medium">Sample Data — Verification Not Complete</span>
          </div>
        </div>
      </div>

      {/* ── 2. Hero ──────────────────────────────────────────── */}
      <div className="bg-teal-950 pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-16">

          {/* Product identity */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">

            {/* Product image */}
            <div className="flex-shrink-0 relative">
              <div className="w-40 h-52 sm:w-44 sm:h-56 rounded-3xl bg-teal-900/50 border border-teal-700/30 flex items-center justify-center overflow-hidden">
                <Image
                  src="https://codeskin.in/cdn/shop/files/UltraLite_Fluid_Sunscreen_bottle_s.png?v=1768211190"
                  alt="CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++"
                  width={140}
                  height={190}
                  className="object-contain w-full h-full p-3"
                  unoptimized
                />
              </div>
              {/* Certified badge */}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 drop-shadow-2xl">
                <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet Certified" width={64} height={64} className="object-contain" />
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 bg-teal-400/15 border border-teal-400/30 text-teal-300 text-[11px] font-medium px-3 py-1.5 rounded-full mb-4">
                <Sparkles size={10} />
                Independently Certified by The Clean Sheet
              </div>
              <h1 className="text-3xl sm:text-4xl font-medium text-white leading-tight mb-2">
                UltraLite Fluid<br className="sm:hidden" /> Sunscreen
              </h1>
              <p className="text-teal-400 text-lg mb-1">SPF 50+ PA++++</p>
              <p className="text-teal-600 text-sm mb-6">CodeSkin India</p>

              {/* PRISM modules */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-6">
                {[
                  { label: "PRISM Core Certified", icon: <Shield size={10} /> },
                  { label: "PRISM Sun Verified", icon: <Sun size={10} /> },
                ].map(({ label, icon }) => (
                  <div key={label} className="flex items-center gap-1.5 bg-teal-900/60 border border-teal-700/40 text-teal-300 text-[11px] font-medium px-3 py-1.5 rounded-full">
                    {icon} {label}
                  </div>
                ))}
              </div>

              <p className="text-teal-300 text-sm leading-relaxed max-w-md mx-auto sm:mx-0">
                Every claim on this page was reviewed by an independent panel of cosmetic scientists,
                toxicologists, regulatory specialists, and dermatologists — evaluated against
                submitted laboratory evidence. No exceptions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Test results strip ─────────────────────────────── */}
      <div className="bg-teal-900 border-y border-teal-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            <Stat value="59.92" label="SPF Tested" sub="Label claims SPF 50+" />
            <Stat value="22.07" label="UVAPF" sub="PA++++ confirmed" />
            <Stat value="94%" label="SPF Retained" sub="After 80 min in water" />
            <Stat value="33" label="Participants" sub="Non-comedogenic clinical study" />
          </div>
        </div>
      </div>

      {/* ── 4. The big headline ───────────────────────────────── */}
      <div className="bg-white py-14 px-4 text-center border-b border-teal-50">
        <div className="max-w-2xl mx-auto">
          <p className="text-teal-600 text-xs font-medium uppercase tracking-widest mb-4">What was independently verified</p>
          <h2 className="text-3xl sm:text-4xl font-medium text-ink-950 leading-tight mb-4">
            Every claim, backed<br />by science.
          </h2>
          <p className="text-ink-500 text-base leading-relaxed">
            The Clean Sheet reviewed the formula, the lab reports, the clinical studies, and the label.
            What you see below is only what passed.
          </p>
        </div>
      </div>

      {/* ── 5. Verified claims grid ───────────────────────────── */}
      <div className="bg-teal-50/40 py-14 px-4">
        <div className="max-w-4xl mx-auto">

          {/* SPF + UVA highlight */}
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-teal-950 rounded-3xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Sun size={16} className="text-teal-400" />
                <span className="text-teal-400 text-xs font-medium uppercase tracking-widest">SPF Performance</span>
                <CheckCircle2 size={14} className="text-teal-400 ml-auto" />
              </div>
              <p className="text-5xl font-medium text-white mb-1">50+</p>
              <p className="text-teal-300 text-sm mb-3">Tested at SPF 59.92</p>
              <p className="text-teal-500 text-xs leading-relaxed">
                Independent lab test confirmed SPF of 59.92 against the label claim of SPF 50+.
                The product delivers more protection than it promises.
              </p>
            </div>

            <div className="bg-teal-950 rounded-3xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-teal-400" />
                <span className="text-teal-400 text-xs font-medium uppercase tracking-widest">UVA Protection</span>
                <CheckCircle2 size={14} className="text-teal-400 ml-auto" />
              </div>
              <p className="text-5xl font-medium text-white mb-1">PA++++</p>
              <p className="text-teal-300 text-sm mb-3">UVAPF tested at 22.07</p>
              <p className="text-teal-500 text-xs leading-relaxed">
                PA++++ is the highest UVA protection tier. A UVAPF of 16 or above is required.
                This product tested at 22.07 - comfortably verified.
              </p>
            </div>
          </div>

          {/* Water resistance full-width */}
          <div className="bg-white rounded-3xl border border-teal-100 p-6 mb-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center flex-shrink-0">
                <Droplets size={20} className="text-teal-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-ink-900">Water Resistant for 80 Minutes</h3>
                  <CheckCircle2 size={14} className="text-teal-500" />
                </div>
                <p className="text-xs text-ink-500 leading-relaxed max-w-xl">
                  After 80 minutes of water immersion, this sunscreen retained 94% of its original SPF.
                  Tested to ISO 16217 standard. The label says "water resistant" - the test proves it.
                </p>
              </div>
              <div className="flex-shrink-0 text-center">
                <p className="text-3xl font-medium text-teal-600">94%</p>
                <p className="text-ink-400 text-xs">SPF after 80 min</p>
              </div>
            </div>
          </div>

          {/* Claims grid */}
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <VerifiedClaim
              icon={<FlaskConical size={16} />}
              title="Non-Comedogenic"
              detail="28-day clinical study on 33 adults with oily and mixed-oily skin. Zero new comedones observed. 61.5% reduction in inflammatory acne lesions."
            />
            <VerifiedClaim
              icon={<Shield size={16} />}
              title="Dermatologist-Tested"
              detail="Primary irritation patch test conducted under dermatologist supervision. Zero irritation reported across all participants."
            />
            <VerifiedClaim
              icon={<Eye size={16} />}
              title="Ophthalmologist-Tested"
              detail="3-day ocular safety study with twice-daily application under ophthalmologist supervision. No eye irritation reported."
            />
            <VerifiedClaim
              icon={<Droplets size={16} />}
              title="Deeply Hydrating"
              detail="65% increase in skin hydration at 8 hours. 38% increase sustained at 24 hours. Measured on a dry skin panel."
            />
            <VerifiedClaim
              icon={<Leaf size={16} />}
              title="Reef-Safe"
              detail="Contains no oxybenzone, octinoxate, or octisalate - the UV filters banned under Hawaii and Palau reef protection laws."
            />
            <VerifiedClaim
              icon={<Leaf size={16} />}
              title="Vegan and Cruelty-Free"
              detail="Full ingredient list reviewed. No animal-derived ingredients present. No animal testing."
            />
          </div>

          {/* Fragrance-free full width */}
          <div className="bg-white rounded-3xl border border-teal-100 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-teal-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-ink-900">Fragrance-Free - Independently Confirmed</p>
                <p className="text-xs text-ink-500 mt-0.5">No fragrance, parfum, or masking fragrance ingredient found in the formula. No EU fragrance allergens above the safety threshold.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. Skin suitability ───────────────────────────────── */}
      <div className="bg-white py-14 px-4 border-t border-teal-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-teal-600 text-xs font-medium uppercase tracking-widest text-center mb-2">Formula reviewed by our panel</p>
          <h2 className="text-2xl sm:text-3xl font-medium text-ink-950 text-center mb-10">Who this is for</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Dry skin", detail: "Multiple humectants including Hyaluronic Acid, Polyglutamic Acid, and Ectoin deliver and lock in hydration all day." },
              { title: "Oily and combination skin", detail: "Clinically tested on oily and mixed-oily skin. Lightweight fluid texture. Zero new comedones in the 28-day study." },
              { title: "Sensitive skin", detail: "Fragrance-free formula. No parabens, phenoxyethanol, or synthetic colours. Dermatologist-tested with zero irritation." },
              { title: "Daily wear", detail: "Designed for all-day use. Breathable, non-greasy finish. Pairs with your existing routine." },
              { title: "Eye area", detail: "Ophthalmologist-tested. Safe for use around the eye area - confirmed in a dedicated 3-day ocular safety study." },
              { title: "Eco-conscious users", detail: "No oxybenzone or octinoxate. Vegan formula. Cruelty-free. No reef-toxic UV filters." },
            ].map(({ title, detail }) => (
              <div key={title} className="bg-teal-50 rounded-2xl p-5 border border-teal-100">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={14} className="text-teal-600 flex-shrink-0" />
                  <p className="text-sm font-semibold text-ink-900">{title}</p>
                </div>
                <p className="text-xs text-ink-500 leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 7. UV filters - consumer angle ───────────────────── */}
      <div className="bg-teal-950 py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-teal-500 text-xs font-medium uppercase tracking-widest text-center mb-2">What protects your skin</p>
          <h2 className="text-2xl sm:text-3xl font-medium text-white text-center mb-3">Next-generation UV filters</h2>
          <p className="text-teal-400 text-sm text-center mb-10 max-w-lg mx-auto">
            All three UV filters were verified as legally permitted in India and the EU,
            and confirmed present in the formula. None are on any global banned list.
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                name: "Tinosorb M",
                tech: "Methylene Bis-Benzotriazolyl Tetramethylbutylphenol",
                role: "Broad-spectrum UVA + UVB",
                note: "One of the most advanced UV filters available. Works in both UV and visible light range. Photostable.",
              },
              {
                name: "Uvinul A Plus",
                tech: "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
                role: "Deep UVA protection",
                note: "Highly photostable UVA filter that stays effective under sun exposure without degrading.",
              },
              {
                name: "Uvinul T 150",
                tech: "Ethylhexyl Triazone",
                role: "UVB protection",
                note: "Efficient, photostable UVB filter. Also helps stabilise other UV filters in the formula.",
              },
            ].map(({ name, tech, role, note }) => (
              <div key={name} className="bg-teal-900/50 rounded-2xl p-5 border border-teal-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={13} className="text-teal-400 flex-shrink-0" />
                  <p className="text-sm font-semibold text-white">{name}</p>
                </div>
                <p className="text-teal-500 text-[10px] font-mono mb-2 leading-relaxed">{tech}</p>
                <p className="text-teal-300 text-xs font-medium mb-2">{role}</p>
                <p className="text-teal-500 text-xs leading-relaxed">{note}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {["No oxybenzone", "No octinoxate", "No homosalate", "No parabens", "No phenoxyethanol", "No synthetic fragrance", "No formaldehyde releasers"].map((item) => (
              <div key={item} className="flex items-center gap-1.5 bg-teal-950 border border-teal-800 text-teal-400 text-[11px] px-3 py-1.5 rounded-full">
                <CheckCircle2 size={10} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 8. Trust section ─────────────────────────────────── */}
      <div className="bg-white py-14 px-4 border-t border-teal-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-10">
            <div className="flex-shrink-0 text-center">
              <div className="w-24 h-24 mx-auto mb-3">
                <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet Certified" width={96} height={96} className="object-contain" />
              </div>
              <p className="text-xs text-ink-500 font-medium">The Clean Sheet</p>
              <p className="text-[10px] text-ink-400">Independent Certification</p>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-medium text-ink-950 mb-3">What certification means</h2>
              <p className="text-ink-500 text-sm leading-relaxed mb-4">
                The Clean Sheet is an independent certification body. We have no commercial relationship
                with CodeSkin. A panel of cosmetic scientists, toxicologists, regulatory specialists,
                a microbiologist, a claims evaluator, and a dermatologist reviewed the formula,
                lab reports, clinical studies, and label — and certified only what the evidence supports.
              </p>
              <p className="text-ink-500 text-sm leading-relaxed">
                Our methodology is built on EU cosmetic safety science, India&apos;s Cosmetics Rules 2020,
                ISO testing standards, and IFRA fragrance guidelines. We set the trust ceiling above
                what regulations require.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            {[
              { value: "5", label: "Evaluation layers" },
              { value: "12", label: "Claims assessed" },
              { value: "9", label: "Tests on file" },
              { value: "1 yr", label: "Certification validity" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center bg-teal-50 rounded-2xl p-4 border border-teal-100">
                <p className="text-2xl font-medium text-teal-700 mb-1">{value}</p>
                <p className="text-xs text-ink-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 9. Certification ID footer ────────────────────────── */}
      <div className="bg-teal-950 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={28} height={28} className="object-contain" />
            <span className="text-teal-200 text-sm font-medium">The Clean Sheet</span>
          </div>
          <p className="text-teal-500 text-xs mb-2">Certificate ID: TCS-IN-2026-048291 [SAMPLE]</p>
          <p className="text-teal-600 text-xs mb-6">Valid: 15 May 2026 to 14 May 2027 [SAMPLE]</p>
          <Link
            href="/verify/tcs-in-2026-048291-b7f2a9c1e5d3"
            className="inline-flex items-center gap-2 border border-teal-700 text-teal-300 hover:text-white hover:border-teal-500 text-xs px-5 py-2.5 rounded-full transition-colors"
          >
            View full technical certification
          </Link>
          <p className="text-teal-800 text-[11px] mt-8">
            Global regulations set the legal floor. The Clean Sheet sets the trust ceiling.
          </p>
          <p className="text-teal-900 text-[10px] mt-1">© The Clean Sheet 2026</p>
        </div>
      </div>

    </div>
  );
}
