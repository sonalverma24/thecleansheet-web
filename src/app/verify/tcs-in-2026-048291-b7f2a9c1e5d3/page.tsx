import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, XCircle, AlertCircle, Shield, Sun, FlaskConical, Leaf, Building2, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++ | TCS-IN-2026-048291 | The Clean Sheet",
  description:
    "Independent certification proof for CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++. Evaluated by The Clean Sheet under PRISM Core and PRISM Sun Verified modules.",
  robots: { index: false, follow: false },
};

/* ── Score Ring (SVG) ─────────────────────────────────────────── */
function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const sw = 10;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const logoSize = Math.round((r - sw / 2) * 2) - 4;
  const bx = +(size / 2 + r * Math.cos(-Math.PI / 4)).toFixed(1);
  const by = +(size / 2 + r * Math.sin(-Math.PI / 4)).toFixed(1);
  const br = Math.round(size * 0.135);
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" style={{ zIndex: 1 }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={sw} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
        <div className="rounded-full overflow-hidden bg-white/10 flex items-center justify-center" style={{ width: logoSize, height: logoSize }}>
          <Image src="/images/tcs-certified-badge.png" alt="TCS" width={logoSize} height={logoSize} className="object-contain p-1" />
        </div>
      </div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" style={{ zIndex: 3 }}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#2dd4bf" strokeWidth={sw}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <circle cx={bx} cy={by} r={br} fill="#2dd4bf" />
        <text x={bx} y={by + br * 0.4} textAnchor="middle" fontSize={br * 0.95} fontWeight={700} fill="#0f172a" fontFamily="monospace">
          {score}
        </text>
      </svg>
    </div>
  );
}

/* ── Claim row ────────────────────────────────────────────────── */
type ClaimStatus = "verified" | "verified-qualified" | "not-verified";
function ClaimRow({ claim, status, detail }: { claim: string; status: ClaimStatus; detail: string }) {
  const cfg = {
    verified: { icon: <CheckCircle2 size={16} className="text-teal-500 flex-shrink-0 mt-0.5" />, pill: "bg-teal-50 text-teal-700 border-teal-200", label: "Verified" },
    "verified-qualified": { icon: <CheckCircle2 size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />, pill: "bg-amber-50 text-amber-700 border-amber-200", label: "Verified with qualification" },
    "not-verified": { icon: <XCircle size={16} className="text-ink-300 flex-shrink-0 mt-0.5" />, pill: "bg-ink-50 text-ink-500 border-ink-200", label: "Not verified" },
  }[status];
  return (
    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 py-4 border-b border-teal-50/60 last:border-0">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {cfg.icon}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink-900 mb-1">{claim}</p>
          <p className="text-xs text-ink-500 leading-relaxed">{detail}</p>
        </div>
      </div>
      <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium self-start sm:flex-shrink-0 ${cfg.pill}`}>{cfg.label}</span>
    </div>
  );
}

/* ── Pillar bar ───────────────────────────────────────────────── */
function PillarBar({ name, score, max, note }: { name: string; score: number; max: number; note: string }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 85 ? "bg-teal-500" : pct >= 70 ? "bg-blue-500" : "bg-amber-500";
  const textColor = pct >= 85 ? "text-teal-600" : pct >= 70 ? "text-blue-600" : "text-amber-600";
  return (
    <div className="py-4 border-b border-teal-50 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-ink-800">{name}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-medium ${textColor}`}>{score}/{max}</span>
          <span className="text-amber-400 text-[10px] italic">[SAMPLE]</span>
        </div>
      </div>
      <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-ink-500 leading-relaxed">{note}</p>
    </div>
  );
}

/* ── Status table row ─────────────────────────────────────────── */
function Row({ label, value, pass }: { label: string; value: string; pass?: boolean | null }) {
  const icon = pass === true
    ? <CheckCircle2 size={13} className="text-teal-500 flex-shrink-0" />
    : pass === false
    ? <XCircle size={13} className="text-rose-400 flex-shrink-0" />
    : <div className="w-3 h-3 rounded-full bg-teal-100 flex-shrink-0" />;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-teal-50 last:border-0">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-ink-400 leading-none mb-0.5">{label}</p>
        <p className="text-xs text-ink-800">{value}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function CertificationProofPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* ── 1. Top registry bar ──────────────────────────────── */}
      <div className="bg-teal-950 border-b border-teal-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={24} height={24} className="object-contain" />
            <span className="text-teal-200 text-xs font-medium tracking-wide">THE CLEAN SHEET REGISTRY</span>
            <span className="hidden sm:block text-teal-700 text-xs">|</span>
            <span className="hidden sm:block text-teal-400 text-xs font-mono">TCS-IN-2026-048291</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-amber-400 text-xs font-medium">Sample Data</span>
          </div>
        </div>
      </div>

      {/* ── 2. Hero ────────────────────────────────────────────── */}
      <div className="bg-teal-950 pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-12">

          {/* Sample notice - thin strip */}
          <div className="mb-6 flex items-center gap-2 border-b border-amber-800/30 pb-3">
            <AlertCircle size={12} className="text-amber-400 flex-shrink-0" />
            <p className="text-[11px] text-amber-400/80">
              Sample page: all data is illustrative. Not a real certification record.
            </p>
          </div>

          {/* ── Hero: product card + cert info ── */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">

            {/* Product thumbnail card */}
            <div className="flex-shrink-0 flex sm:flex-col items-center gap-4">
              <div className="relative w-24 h-28 sm:w-36 sm:h-44 rounded-2xl bg-teal-900/40 border border-teal-800/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                <Image
                  src="https://codeskin.in/cdn/shop/files/UltraLite_Fluid_Sunscreen_bottle_s.png?v=1768211190"
                  alt="CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++"
                  width={120}
                  height={160}
                  className="object-contain w-full h-full p-2"
                  unoptimized
                />
                {/* TCS badge - corner */}
                <div className="absolute top-2 right-2">
                  <Image src="/images/tcs-certified-badge.png" alt="Certified" width={28} height={28} className="object-contain drop-shadow-lg" />
                </div>
              </div>
              {/* Brand label */}
              <div className="sm:w-36 flex items-center gap-2 bg-white/8 border border-teal-800/40 rounded-xl px-3 py-2">
                <div className="w-5 h-5 rounded bg-teal-700 text-white text-[8px] font-medium flex items-center justify-center flex-shrink-0">CS</div>
                <div>
                  <p className="text-teal-200 text-[11px] font-medium leading-none">CodeSkin India</p>
                  <p className="text-teal-600 text-[10px]">Verified Brand</p>
                </div>
              </div>
            </div>

            {/* Cert info */}
            <div className="flex-1 min-w-0">
              {/* PRISM badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { label: "PRISM Core", icon: <Shield size={10} /> },
                  { label: "PRISM Sun Verified", icon: <Sun size={10} /> },
                ].map(({ label, icon }) => (
                  <div key={label} className="flex items-center gap-1.5 bg-teal-900/60 border border-teal-700/40 text-teal-300 text-[11px] font-medium px-3 py-1.5 rounded-full">
                    {icon} {label}
                  </div>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl font-medium text-white leading-tight mb-1">
                UltraLite Fluid Sunscreen
              </h1>
              <p className="text-teal-400 text-base mb-0.5">SPF 50+ PA++++</p>
              <p className="text-teal-600 text-sm mb-5">CodeSkin India</p>

              {/* Score + tier */}
              <div className="flex items-center gap-5 mb-5">
                <ScoreRing score={86} size={72} />
                <div>
                  <p className="text-3xl font-medium text-white leading-none">86<span className="text-teal-600 text-base">/100</span></p>
                  <p className="text-teal-300 text-sm mt-1 font-medium">TCS Silver Certified</p>
                  <p className="text-teal-600 text-xs mt-0.5">Score range: 75-89</p>
                  <p className="text-amber-500 text-[10px] italic mt-1">[SAMPLE score]</p>
                </div>
              </div>

              {/* Key stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                  { label: "SPF Tested", value: "59.92", sub: "Label: SPF 50+" },
                  { label: "UVAPF", value: "22.07", sub: "PA++++ confirmed" },
                  { label: "Water Resistance", value: "94%", sub: "After 80 min" },
                  { label: "Non-Comedogenic", value: "Tested", sub: "28-day clinical" },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="bg-white/6 border border-teal-700/30 rounded-xl p-3">
                    <p className="text-[10px] text-teal-500 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-white text-base font-medium leading-none">{value}</p>
                    <p className="text-teal-500 text-[10px] mt-1">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Dates */}
              <div className="border-t border-teal-800 pt-3 flex gap-6">
                <div>
                  <p className="text-teal-600 text-[10px] uppercase tracking-widest mb-0.5">Certified</p>
                  <p className="text-teal-200 text-xs">15 May 2026 <span className="text-amber-500 italic">[SAMPLE]</span></p>
                </div>
                <div>
                  <p className="text-teal-600 text-[10px] uppercase tracking-widest mb-0.5">Valid Until</p>
                  <p className="text-teal-200 text-xs">14 May 2027 <span className="text-amber-500 italic">[SAMPLE]</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Pillar score tiles ─────────────────────────────── */}
      <div className="bg-ink-50 border-y border-ink-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "Ingredient Safety", score: 44, max: 50, icon: <FlaskConical size={14} className="text-teal-600" /> },
              { name: "Manufacturing", score: 16, max: 20, icon: <Building2 size={14} className="text-teal-600" /> },
              { name: "Claims", score: 18, max: 20, icon: <Shield size={14} className="text-teal-600" /> },
              { name: "Ethics", score: 8, max: 10, icon: <Leaf size={14} className="text-teal-600" /> },
            ].map(({ name, score, max, icon }) => {
              const pct = Math.round((score / max) * 100);
              return (
                <div key={name} className="bg-white border border-ink-100 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    {icon}
                    <span className="text-[10px] text-ink-500 uppercase tracking-wider">{name}</span>
                  </div>
                  <p className="text-ink-900 text-lg font-medium leading-none mb-0.5">
                    {score}<span className="text-ink-400 text-xs font-normal">/{max}</span>
                  </p>
                  <div className="h-1 bg-ink-100 rounded-full mt-2">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-ink-400 text-[10px] mt-1.5">{pct}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 4. Main content ──────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-6">

        {/* ─ Legal Gate ─ */}
        <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden shadow-sm">
          <div className="border-b border-ink-100 px-6 py-4 flex items-center gap-3">
            <Shield size={16} className="text-teal-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-medium text-ink-900">Requirement 1: Legal Compliance</h2>
              <p className="text-xs text-ink-400">Gate check - mandatory pass to proceed</p>
            </div>
            <div className="flex items-center gap-2 bg-teal-100 border border-teal-300 text-teal-800 text-xs font-medium px-3 py-1.5 rounded-full flex-shrink-0">
              <CheckCircle2 size={12} /> PASSED
            </div>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-[10px] text-ink-400 uppercase tracking-widest mb-3">Markets assessed</p>
                <div className="space-y-2">
                  {[
                    { market: "India (CDSCO / Cosmetics Rules 2020)", ok: true },
                    { market: "European Union (Regulation EC 1223/2009)", ok: true },
                    { market: "United States (FDA OTC)", ok: null },
                  ].map(({ market, ok }) => (
                    <div key={market} className="flex items-center gap-2.5 text-xs">
                      {ok === true && <CheckCircle2 size={13} className="text-teal-500 flex-shrink-0" />}
                      {ok === false && <XCircle size={13} className="text-rose-400 flex-shrink-0" />}
                      {ok === null && <Info size={13} className="text-ink-300 flex-shrink-0" />}
                      <span className={ok === null ? "text-ink-400" : "text-ink-700"}>{market}</span>
                      {ok === null && <span className="text-ink-300 text-[10px]">(not assessed)</span>}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-ink-400 mt-3 italic">UV filters used are not FDA-approved. Product is assessed for India and EU markets only.</p>
              </div>
              <div>
                <p className="text-[10px] text-ink-400 uppercase tracking-widest mb-3">Key checks</p>
                <div className="space-y-2">
                  {[
                    "No Schedule A (TCS Prohibited) substances",
                    "No formaldehyde releasers in formula",
                    "No 4-MBC or EU-banned UV filters",
                    "Full INCI list disclosed on label",
                    "Reapplication instructions present",
                    "No prohibited claims (waterproof, 100% protection)",
                  ].map((check) => (
                    <div key={check} className="flex items-center gap-2.5 text-xs text-ink-700">
                      <CheckCircle2 size={12} className="text-teal-500 flex-shrink-0" />
                      {check}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-ink-400 uppercase tracking-widest mb-3">UV filter legality</p>
              <div className="rounded-2xl border border-teal-100 overflow-x-auto">
                <table className="w-full text-xs min-w-[500px]">
                  <thead className="bg-teal-50 border-b border-teal-100">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-medium text-ink-600">UV Filter</th>
                      <th className="text-center px-3 py-2.5 font-medium text-ink-600">India</th>
                      <th className="text-center px-3 py-2.5 font-medium text-ink-600">EU</th>
                      <th className="text-left px-4 py-2.5 font-medium text-ink-600">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { filter: "Tinosorb M (Methylene Bis-Benzotriazolyl Tetramethylbutylphenol)", india: true, eu: true, note: "Nano-form. Nano disclosure on label. EU max 10%. Non-spray format - permitted." },
                      { filter: "Uvinul A Plus (DHHB)", india: true, eu: true, note: "UVA filter. Photostable. EU max 10%." },
                      { filter: "Uvinul T 150 (Ethylhexyl Triazone)", india: true, eu: true, note: "UVB filter with photostabilising properties. EU max 5%." },
                    ].map(({ filter, india, eu, note }) => (
                      <tr key={filter} className="border-b border-teal-50 last:border-0">
                        <td className="px-4 py-3 font-medium text-ink-800 max-w-[200px]">{filter}</td>
                        <td className="px-3 py-3 text-center">
                          {india && <CheckCircle2 size={14} className="text-teal-500 mx-auto" />}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {eu && <CheckCircle2 size={14} className="text-teal-500 mx-auto" />}
                        </td>
                        <td className="px-4 py-3 text-ink-500 text-[11px]">{note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ─ Ingredient Safety ─ */}
        <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden shadow-sm">
          <div className="border-b border-ink-100 px-6 py-4 flex items-center gap-3">
            <FlaskConical size={16} className="text-teal-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-medium text-ink-900">Requirement 2: Ingredient Safety</h2>
              <p className="text-xs text-ink-400">44/50 <span className="text-amber-500 italic">[SAMPLE]</span></p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Hazard Profile", score: 22, max: 25, note: "Minor deductions for nano UV filter data gaps and Propylene Glycol Dibenzoate limited long-term data." },
                { label: "Exposure Assessment", score: 13, max: 15, note: "Leave-on product with high skin contact. MoS calculations adequate. Minor gap on systemic absorption data for newer UV filters." },
                { label: "Sensitisation", score: 9, max: 10, note: "Benzyl Alcohol present at preservative levels - mild sensitizer potential at low concentrations. No significant allergens above threshold." },
              ].map(({ label, score, max, note }) => {
                const pct = Math.round((score / max) * 100);
                return (
                  <div key={label} className="bg-teal-50/60 rounded-2xl p-4">
                    <p className="text-[10px] text-ink-400 uppercase tracking-widest mb-1">{label}</p>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-2xl font-medium text-teal-700">{score}</span>
                      <span className="text-xs text-ink-400">/{max}</span>
                    </div>
                    <div className="h-1 bg-teal-100 rounded-full mb-3">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[11px] text-ink-500 leading-relaxed">{note}</p>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-ink-400 uppercase tracking-widest mb-3">Ingredients with noted concerns</p>
            <div className="space-y-3">
              {[
                {
                  name: "Tinosorb M - nano form",
                  level: "warn" as const,
                  detail: "Nano-particle UV filter. EU prohibits nano Tinosorb M in spray formats - this is a fluid product, which is permitted. Nano disclosure present on label. Minor score deduction for incomplete systemic absorption data (gap common with newer nano UV filters).",
                },
                {
                  name: "Benzyl Alcohol",
                  level: "warn" as const,
                  detail: "Present as part of preservative system (with Sodium Benzoate, Potassium Sorbate, 1,2-Hexanediol). Mild sensitizer potential. EU Annex III-listed for leave-on cosmetics. At assessed preservative-level concentration, no safety concern [SAMPLE], but a minor deduction applied under sensitisation sub-score.",
                },
                {
                  name: "Propylene Glycol Dibenzoate",
                  level: "info" as const,
                  detail: "Film-forming ester. Limited long-term human data compared to more established cosmetic esters. No significant safety concern at assessed concentration [SAMPLE]. Noted for monitoring at renewal.",
                },
              ].map(({ name, level, detail }) => (
                <div key={name} className={`flex items-start gap-4 p-4 rounded-2xl border ${level === "warn" ? "bg-amber-50 border-amber-100" : "bg-sky-50 border-sky-100"}`}>
                  {level === "warn"
                    ? <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    : <Info size={15} className="text-sky-500 flex-shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-sm font-medium text-ink-800 mb-1">{name}</p>
                    <p className="text-xs text-ink-500 leading-relaxed">{detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-teal-50 rounded-2xl p-4 border border-teal-100">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={14} className="text-teal-600" />
                <div>
                  <p className="text-xs font-medium text-teal-800">Formaldehyde releasers: None present</p>
                  <p className="text-[11px] text-teal-600 mt-0.5">Preservative system: Benzyl Alcohol + Sodium Benzoate + Potassium Sorbate + 1,2-Hexanediol</p>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-teal-50 rounded-2xl p-4 border border-teal-100">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={14} className="text-teal-600" />
                <div>
                  <p className="text-xs font-medium text-teal-800">Phototoxic botanical screen: Clear</p>
                  <p className="text-[11px] text-teal-600 mt-0.5">Aloe Barbadensis, Chondrus Crispus, Olea Europaea Leaf - no furanocoumarins, hypericin, or psoralens identified</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─ Manufacturing ─ */}
        <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden shadow-sm">
          <div className="border-b border-ink-100 px-6 py-4 flex items-center gap-3">
            <Building2 size={16} className="text-teal-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-medium text-ink-900">Requirement 3: Manufacturing Quality</h2>
              <p className="text-xs text-ink-400">16/20 <span className="text-amber-500 italic">[SAMPLE]</span></p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Facility / QMS", score: 7, max: 8 },
                { label: "Batch Testing", score: 6, max: 7 },
                { label: "Supplier / Ingredients", score: 3, max: 5 },
              ].map(({ label, score, max }) => {
                const pct = Math.round((score / max) * 100);
                return (
                  <div key={label} className="bg-teal-50/60 rounded-2xl p-4 text-center">
                    <p className="text-[10px] text-ink-400 uppercase tracking-widest mb-2">{label}</p>
                    <span className="text-2xl font-medium text-teal-700">{score}</span>
                    <span className="text-sm text-ink-400">/{max}</span>
                    <div className="h-1 bg-teal-100 rounded-full mt-2">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="divide-y divide-teal-50">
              <Row label="Manufacturer" value="Effeza Science Pvt Ltd" />
              <Row label="GMP certification" value="GMP-certified + FDA India-approved manufacturing facility" pass={true} />
              <Row label="ISO 22716 GMP" value="Confirmed [SAMPLE]" pass={true} />
              <Row label="Stability testing" value="Accelerated stability reviewed (40°C / 75% RH) [SAMPLE]" pass={true} />
              <Row label="Preservative efficacy" value="Passed, ISO 11930 [SAMPLE]" pass={true} />
              <Row label="Batch-level SPF protocol" value="Partially documented - minor deduction [SAMPLE]" pass={null} />
              <Row label="UV filter supplier COAs" value="BASF-sourced UV filters reviewed [SAMPLE]" pass={true} />
              <Row label="Heavy metal testing" value="Not independently submitted for this evaluation [SAMPLE]" pass={null} />
            </div>
          </div>
        </div>

        {/* ─ Claims ─ */}
        <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden shadow-sm">
          <div className="border-b border-ink-100 px-6 py-4 flex items-center gap-3">
            <Shield size={16} className="text-teal-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-medium text-ink-900">Requirement 4: Claims and Transparency</h2>
              <p className="text-xs text-ink-400">18/20 <span className="text-amber-500 italic">[SAMPLE]</span></p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Claim Substantiation", score: 9, max: 10 },
                { label: "Label / Marketing", score: 5, max: 6 },
                { label: "INCI Disclosure", score: 4, max: 4 },
              ].map(({ label, score, max }) => {
                const pct = Math.round((score / max) * 100);
                return (
                  <div key={label} className="bg-teal-50/60 rounded-2xl p-4 text-center">
                    <p className="text-[10px] text-ink-400 uppercase tracking-widest mb-2">{label}</p>
                    <span className="text-2xl font-medium text-teal-700">{score}</span>
                    <span className="text-sm text-ink-400">/{max}</span>
                    <div className="h-1 bg-teal-100 rounded-full mt-2">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-ink-400 uppercase tracking-widest mb-1">What was verified and what was not</p>
            <p className="text-xs text-ink-400 italic mb-4">Not verified does not mean a claim is false - it means sufficient evidence was not submitted for The Clean Sheet to confirm it against the standard.</p>

            <div className="rounded-2xl border border-teal-100 overflow-hidden">
              <ClaimRow
                claim="SPF 50+"
                status="verified"
                detail="Independent SPF test result: 59.92 (ISO 24444 method or validated equivalent). Tested SPF exceeds label claim. Lab: NABL-accredited [SAMPLE: Ref T-XXXX]. Label correctly states SPF 50+ - no inflation of claim."
              />
              <ClaimRow
                claim="PA++++ UVA protection"
                status="verified"
                detail="UVAPF: 22.07 (JCIA method). PA++++ tier requires UVA-PF of 16 or above - this result qualifies comfortably. Boots 3-star UVA rating consistent with the result and claim."
              />
              <ClaimRow
                claim="Water resistant (80 minutes)"
                status="verified"
                detail="94% of original SPF retained after 80 minutes of water immersion (ISO 16217 protocol). Specific claim wording is 'water resistant' with duration specified - not 'waterproof', which is a prohibited claim in India and EU."
              />
              <ClaimRow
                claim="Non-comedogenic"
                status="verified"
                detail="28-day clinical study. 33 adult participants with oily or mixed-oily skin. Zero new comedones observed. 61.5% reduction in inflammatory acne lesions. 16% reduction in total lesions. Dermatologist supervised. Sample size adequate for a consumer-facing claim."
              />
              <ClaimRow
                claim="Dermatologist-tested"
                status="verified"
                detail="24-hour primary irritation patch test conducted under dermatologist supervision. Zero irritation reported across participants. Protocol and adverse event summary reviewed [SAMPLE: study reference pending]."
              />
              <ClaimRow
                claim="Ophthalmologist-tested"
                status="verified"
                detail="3-day ocular safety study, twice-daily application, conducted under ophthalmologist supervision. No ocular irritation reported. Protocol reviewed [SAMPLE]."
              />
              <ClaimRow
                claim="Reef-safe"
                status="verified-qualified"
                detail="Product does not contain oxybenzone, octinoxate, or octisalate - the three UV filters banned under Hawaii SB 2571 and Palau reef protection standards. Claim substantiated on filter-absence basis. No product-specific ecotoxicology testing submitted. The term 'reef-safe' has no universal regulatory definition."
              />
              <ClaimRow
                claim="Vegan and cruelty-free"
                status="verified"
                detail="Full INCI reviewed - no animal-derived ingredients. Saccharomyces Ferment Lysate Filtrate is yeast fermentation origin (not animal). Cruelty-free supported by brand declaration [SAMPLE - third-party audit not submitted for this evaluation]."
              />
              <ClaimRow
                claim="Fragrance-free"
                status="verified"
                detail="No parfum, fragrance, or masking fragrance ingredient in INCI. No EU 26 fragrance allergens detected above 0.001% leave-on threshold in reviewed formula [SAMPLE]."
              />
              <ClaimRow
                claim="Hydration 65% at 8h / 38% at 24h"
                status="verified-qualified"
                detail="Consumer study data reviewed. Corneometer-based hydration measurement, dry skin panel. Results consistent with ingredient profile (Sodium Hyaluronate, Polyglutamic Acid, Ectoin, Aloe). Full protocol and sample size details are [SAMPLE] - pending final protocol review."
              />
              <ClaimRow
                claim="Blue light / visible light / IR protection"
                status="not-verified"
                detail="No peer-reviewed validated in vitro or clinical test for blue light, visible light, or IR protection in this specific formulation was submitted. Red Algae extract has published data on blue light defence, but a product-specific validated protocol was not available for review."
              />
              <ClaimRow
                claim="100% biodegradable"
                status="not-verified"
                detail="No third-party biodegradability certification or OECD 301-method test data submitted for the full formulation. Individual ingredients may be biodegradable but a whole-formulation test is required for the claim to be verified."
              />
            </div>
          </div>
        </div>

        {/* ─ PRISM Sun Verified deep-dive ─ */}
        <div className="bg-teal-950 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-teal-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-400/20 border border-teal-400/30 flex items-center justify-center">
              <Sun size={15} className="text-teal-300" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">PRISM Sun Verified</h2>
              <p className="text-teal-500 text-xs">Specialist sunscreen certification module</p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { label: "SPF Result", value: "59.92", context: "vs SPF 50+ label", color: "text-teal-300" },
                { label: "UVAPF", value: "22.07", context: "PA++++ threshold: 16+", color: "text-teal-300" },
                { label: "Boots UVA Rating", value: "3-star", context: "Good UVA/UVB ratio", color: "text-teal-300" },
                { label: "Water Resistance", value: "94%", context: "After 80 min immersion", color: "text-teal-300" },
              ].map(({ label, value, context, color }) => (
                <div key={label} className="bg-teal-900/60 rounded-2xl p-4 border border-teal-800/50">
                  <p className="text-teal-600 text-[10px] uppercase tracking-widest mb-1">{label}</p>
                  <p className={`text-2xl font-medium ${color}`}>{value}</p>
                  <p className="text-teal-500 text-[11px] mt-1">{context}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {[
                { check: "SPF test from NABL/ISO 17025-accredited lab", done: true },
                { check: "UVA / PA test evidence reviewed", done: true },
                { check: "Photostability reviewed - UV filter combination is photostable", done: true },
                { check: "Water resistance test with duration specified on label", done: true },
                { check: "All UV filters legal in assessed markets (India, EU)", done: true },
                { check: "No banned UV filters (no 4-MBC, no oxybenzone, no octinoxate)", done: true },
                { check: "No phototoxic botanicals in formula", done: true },
                { check: "Nano disclosure present (Tinosorb M is nano-form)", done: true },
                { check: "Non-spray format: nano TiO2 restriction (EU) - not applicable", done: true },
                { check: "Reapplication instructions on label", done: true },
                { check: "SPF label claim does not exceed tested SPF", done: true },
              ].map(({ check, done }) => (
                <div key={check} className="flex items-center gap-3 text-xs">
                  {done
                    ? <CheckCircle2 size={13} className="text-teal-400 flex-shrink-0" />
                    : <XCircle size={13} className="text-rose-400 flex-shrink-0" />}
                  <span className={done ? "text-teal-200" : "text-rose-300"}>{check}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─ Ethics ─ */}
        <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden shadow-sm">
          <div className="border-b border-ink-100 px-6 py-4 flex items-center gap-3">
            <Leaf size={16} className="text-teal-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-medium text-ink-900">Requirement 5: Ethics and Sustainability</h2>
              <p className="text-xs text-ink-400">8/10 <span className="text-amber-500 italic">[SAMPLE]</span></p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Animal Welfare", score: 3, max: 3 },
                { label: "Natural Origin", score: 2, max: 3 },
                { label: "Ethical Sourcing", score: 2, max: 2 },
                { label: "Packaging", score: 1, max: 2 },
              ].map(({ label, score, max }) => (
                <div key={label} className="bg-teal-50/60 rounded-2xl p-3 text-center">
                  <p className="text-[10px] text-ink-400 mb-1">{label}</p>
                  <span className="text-xl font-medium text-teal-700">{score}</span>
                  <span className="text-xs text-ink-400">/{max}</span>
                </div>
              ))}
            </div>
            <div className="divide-y divide-teal-50">
              <Row label="Vegan ingredients" value="Confirmed - no animal-derived INCI identified" pass={true} />
              <Row label="Cruelty-free" value="Brand declaration reviewed [SAMPLE - third-party audit not submitted]" pass={true} />
              <Row label="Palm / mica sourcing" value="No palm-derived or mica-containing ingredients in formula" pass={true} />
              <Row label="Natural origin index" value="Primarily synthetic UV filters - natural origin index not calculated for this evaluation [SAMPLE]" pass={null} />
              <Row label="Packaging sustainability" value="Packaging details not fully documented in dossier [SAMPLE]" pass={null} />
            </div>
          </div>
        </div>

        {/* ─ What was reviewed + INCI ─ */}
        <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden shadow-sm">
          <div className="border-b border-ink-100 px-6 py-4 flex items-center gap-3">
            <FlaskConical size={16} className="text-teal-600 flex-shrink-0" />
            <h2 className="text-sm font-medium text-ink-900">Ingredient Transparency</h2>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-[10px] text-ink-400 uppercase tracking-widest mb-3">Regulatory screen results</p>
                <div className="space-y-2">
                  {[
                    { market: "India", status: "Passed" },
                    { market: "European Union", status: "Passed" },
                    { market: "IFRA fragrance standards", status: "Passed (fragrance-free)" },
                    { market: "ECHA SVHC candidate list", status: "No SVHC identified" },
                    { market: "TCS Schedule A (Prohibited)", status: "No prohibited substances" },
                    { market: "TCS Schedule B (Restricted limits)", status: "Within limits [SAMPLE]" },
                  ].map(({ market, status }) => (
                    <div key={market} className="flex items-center justify-between text-xs gap-3">
                      <span className="text-ink-600">{market}</span>
                      <span className="text-teal-600 font-medium flex-shrink-0">{status}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-ink-400 uppercase tracking-widest mb-3">Formula review</p>
                <div className="space-y-2">
                  {[
                    "Complete formula reviewed confidentially [SAMPLE]",
                    "Ingredient origin types disclosed to certifier",
                    "Key actives checked against formula and evidence",
                    "Fragrance and allergen review completed",
                    "Preservative system reviewed",
                    "UV filters and concentrations reviewed [SAMPLE]",
                    "Global restricted ingredient screening completed",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-xs text-ink-600">
                      <CheckCircle2 size={12} className="text-teal-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-[10px] text-ink-400 uppercase tracking-widest mb-2">Full INCI list (as disclosed on label)</p>
            <div className="bg-ink-50 rounded-2xl p-4 border border-ink-100">
              <p className="font-mono text-xs text-ink-600 leading-loose">
                Aqua, Methylene Bis-Benzotriazolyl Tetramethylbutylphenol, C15-19 Alkane, Diethylamino Hydroxybenzoyl Hexyl Benzoate, Ethylhexyl Triazone, Niacinamide, Caprylyl Caprylate/Caprate, Aloe Barbadensis Leaf Juice, Saccharomyces Ferment Lysate Filtrate, Chondrus Crispus (Red Algae) Extract, Isododecane, Hexylene Glycol, Starch, Dioctyl Carbonate, Isoamyl Laurate, Erythritol, Polyglutamic Acid, Ectoin, Xylitol, Sodium Hyaluronate, Adenosine, Propylene Glycol Dibenzoate, Dipotassium Glycyrrhizate, Tocopheryl Acetate, Tocotrienols, Steareth-21, Pentaerythrityl Distearate, Sodium Polyacrylate, Sodium Stearoyl Glutamate, Sodium Levulinate, Silica, Polyacrylate Crosspolymer-6, Glyceryl Caprylate, Trisodium Dicarboxymethyl Alaninate, Allantoin, Phytosteryl/Octyldodecyl Lauroyl Glutamate, Benzyl Alcohol, Diethylhexyl Syringylidenemalonate, Caprylic/Capric Triglyceride, Olea Europaea (Olive) Leaf Extract, Panthenol, Potassium Sorbate, Citric Acid, Sodium Benzoate, 1,2-Hexanediol
              </p>
            </div>
            <p className="text-[11px] text-ink-400 mt-2">Source: codeskin.in product page.</p>
          </div>
        </div>

        {/* ─ Consumer suitability ─ */}
        <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden shadow-sm">
          <div className="border-b border-ink-100 px-6 py-4 flex items-center gap-3">
            <Sun size={16} className="text-teal-600 flex-shrink-0" />
            <h2 className="text-sm font-medium text-ink-900">Consumer Suitability Guidance</h2>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100">
                <p className="text-[10px] text-teal-600 uppercase tracking-widest font-medium mb-3">May be suitable for</p>
                <ul className="space-y-2.5">
                  {[
                    "Adults seeking daily UV protection (India and EU markets)",
                    "Dry to combination skin - multiple humectants and film-formers",
                    "Oily and mixed-oily skin - non-comedogenic tested (28-day clinical)",
                    "Users who want a fragrance-free daily sunscreen",
                    "Users seeking EU-grade next-generation UV filters without oxybenzone or octinoxate",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-xs text-ink-700">
                      <CheckCircle2 size={12} className="text-teal-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <p className="text-[10px] text-amber-700 uppercase tracking-widest font-medium mb-3">Use with caution if</p>
                <ul className="space-y-2.5">
                  {[
                    "You have a known sensitivity to benzyl alcohol - check your reaction history",
                    "You are pregnant - not evaluated under PRISM Pregnancy Safe. Chemical UV filter system not assessed to pregnancy-specific safety margins. Consult your doctor.",
                    "You are applying to children under 3 years - not evaluated under PRISM Baby Safe criteria",
                    "You have broken or highly reactive skin - discontinue if irritation occurs",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-xs text-ink-700">
                      <AlertCircle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-xs text-ink-400 mt-4 leading-relaxed italic">
              Certification confirms this product met our review criteria based on submitted and verified evidence. It does not guarantee no person will ever experience an adverse reaction. Individual skin reactions are always possible. Discontinue use if a reaction occurs.
            </p>
          </div>
        </div>

        {/* ─ Testing evidence ─ */}
        <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden shadow-sm">
          <div className="border-b border-ink-100 px-6 py-4 flex items-center gap-3">
            <FlaskConical size={16} className="text-teal-600 flex-shrink-0" />
            <h2 className="text-sm font-medium text-ink-900">Testing Evidence on File</h2>
          </div>
          <div className="p-6">
            <div className="rounded-2xl border border-teal-100 overflow-x-auto">
              <table className="w-full text-xs min-w-[480px]">
                <thead className="bg-teal-50 border-b border-teal-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-ink-600">Test</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-600">Result</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-600 hidden sm:table-cell">Lab</th>
                    <th className="text-center px-3 py-3 font-medium text-ink-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { test: "SPF testing (ISO 24444)", result: "59.92", lab: "NABL-accredited [SAMPLE T-XXXX]", pass: true },
                    { test: "UVAPF / PA rating", result: "22.07 / PA++++", lab: "NABL-accredited [SAMPLE]", pass: true },
                    { test: "Water resistance (ISO 16217)", result: "94% after 80 min", lab: "NABL-accredited [SAMPLE]", pass: true },
                    { test: "Non-comedogenicity (clinical)", result: "0 new comedones / 33 participants / 28 days", lab: "Dermatologist supervised [SAMPLE]", pass: true },
                    { test: "Primary irritation patch test", result: "Non-irritant", lab: "Dermatologist supervised [SAMPLE]", pass: true },
                    { test: "Ocular safety", result: "No irritation / 3-day study", lab: "Ophthalmologist supervised [SAMPLE]", pass: true },
                    { test: "Preservative efficacy (ISO 11930)", result: "Passed [SAMPLE]", lab: "ISO 17025 accredited [SAMPLE]", pass: true },
                    { test: "Accelerated stability (40°C/75% RH)", result: "Reviewed [SAMPLE]", lab: "In-house, validated [SAMPLE]", pass: true },
                    { test: "Microbial count", result: "Within limits [SAMPLE]", lab: "ISO 17025 accredited [SAMPLE]", pass: true },
                  ].map(({ test, result, lab, pass }) => (
                    <tr key={test} className="border-b border-teal-50 last:border-0">
                      <td className="px-4 py-3 text-ink-800 font-medium">{test}</td>
                      <td className="px-4 py-3 text-teal-700">{result}</td>
                      <td className="px-4 py-3 text-ink-400 italic hidden sm:table-cell">{lab}</td>
                      <td className="px-3 py-3 text-center">
                        {pass ? <CheckCircle2 size={14} className="text-teal-500 mx-auto" /> : <XCircle size={14} className="text-rose-400 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ─ Certification record ─ */}
        <div className="bg-teal-950 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-teal-800">
            <h2 className="text-sm font-medium text-white">Official Certification Record</h2>
            <p className="text-teal-500 text-xs mt-0.5">All fields marked [SAMPLE] are illustrative</p>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-0">
              {[
                { label: "Certification ID", value: "TCS-IN-2026-048291 [SAMPLE]" },
                { label: "Certification body", value: "The Clean Sheet" },
                { label: "PRISM modules", value: "PRISM Core + PRISM Sun Verified" },
                { label: "Product category", value: "Sunscreen - SPF Face" },
                { label: "Formula version", value: "FV-2026-01 [SAMPLE]" },
                { label: "Certificate version", value: "1.0 [SAMPLE]" },
                { label: "Certification date", value: "15 May 2026 [SAMPLE]" },
                { label: "Expiry date", value: "14 May 2027 [SAMPLE]" },
                { label: "Status", value: "Active" },
                { label: "Evaluator", value: "Dr. Priya Sharma, PhD Toxicology [SAMPLE]" },
              ].map(({ label, value }) => (
                <div key={label} className="py-3 border-b border-teal-900 flex items-start gap-4">
                  <span className="text-teal-600 text-xs w-28 flex-shrink-0">{label}</span>
                  <span className="text-teal-200 text-xs">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-teal-900">
              <p className="text-teal-600 text-[10px] uppercase tracking-widest mb-3">Change history</p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-teal-600">15 May 2026</span>
                <span className="bg-teal-900 border border-teal-700 text-teal-300 text-[10px] px-2.5 py-1 rounded-full">Certification issued</span>
                <span className="text-teal-400">Initial certification granted [SAMPLE]</span>
              </div>
              <p className="text-teal-700 text-[11px] mt-3 italic">No changes reported since initial certification [SAMPLE]</p>
            </div>
          </div>
        </div>

        {/* ─ Footer ─ */}
        <div className="text-center pt-6 border-t border-teal-100">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={32} height={32} className="object-contain" />
            <span className="text-sm font-medium text-ink-800">The Clean Sheet</span>
          </div>
          <p className="text-xs text-ink-400 max-w-md mx-auto leading-relaxed mb-5">
            This certification was issued by The Clean Sheet. The Clean Sheet is an independent voluntary trust seal.
            Certification does not replace country-specific product registration, notification, or import requirements.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-teal-600 mb-4">
            <Link href="/" className="hover:underline">thecleansheet.in</Link>
            <span className="text-ink-200">|</span>
            <Link href="/methodology" className="hover:underline">How certification works</Link>
            <span className="text-ink-200">|</span>
            <a href="mailto:hello@thecleansheet.in" className="hover:underline">hello@thecleansheet.in</a>
          </div>
          <p className="text-[11px] text-ink-300">
            Certificate ID: TCS-IN-2026-048291{" "}
            <span className="text-amber-400 italic">[SAMPLE]</span> · Last verified: May 2026
          </p>
          <p className="text-[11px] text-ink-300 mt-1">
            Global regulations set the legal floor. The Clean Sheet sets the trust ceiling.
          </p>
          <p className="text-[10px] text-ink-200 mt-2">
            This page is private and not indexed by search engines.
            URL: thecleansheet.in/verify/tcs-in-2026-048291-b7f2a9c1e5d3
          </p>
        </div>
      </div>
    </div>
  );
}
