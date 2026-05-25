"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2, XCircle, AlertCircle, Shield, Sun,
  FlaskConical, Leaf, Building2, Info, ChevronDown,
  Copy, Check, Download, QrCode, ExternalLink,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   SHARED UI PIECES
   ═══════════════════════════════════════════════════════════════ */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-1.5 text-[11px] text-teal-400 hover:text-teal-200 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

type ClaimStatus = "verified" | "verified-qualified" | "not-verified";
function ClaimRow({ claim, status, detail }: { claim: string; status: ClaimStatus; detail: string }) {
  const cfg = {
    verified: { icon: <CheckCircle2 size={16} className="text-teal-500 flex-shrink-0 mt-0.5" />, pill: "bg-teal-50 text-teal-700 border-teal-200", label: "Verified" },
    "verified-qualified": { icon: <CheckCircle2 size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />, pill: "bg-amber-50 text-amber-700 border-amber-200", label: "Verified with qualification" },
    "not-verified": { icon: <XCircle size={16} className="text-ink-300 flex-shrink-0 mt-0.5" />, pill: "bg-ink-50 text-ink-500 border-ink-200", label: "Not verified" },
  }[status];
  return (
    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 py-4 border-b border-teal-50/60 last:border-0 px-4">
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

function Row({ label, value, pass }: { label: string; value: string; pass?: boolean | null }) {
  const icon = pass === true
    ? <CheckCircle2 size={14} className="text-teal-500 flex-shrink-0" />
    : pass === false
    ? <XCircle size={14} className="text-rose-400 flex-shrink-0" />
    : <div className="w-3.5 h-3.5 rounded-full bg-teal-100 flex-shrink-0" />;
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-teal-50 last:border-0">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-ink-400 leading-none mb-1">{label}</p>
        <p className="text-sm text-ink-800">{value}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACCORDION SECTION
   ═══════════════════════════════════════════════════════════════ */

type SectionStatus = "passed" | "reviewed" | "info";

function AccordionSection({
  id, icon, title, subtitle, status, statusLabel, children, isOpen, onToggle, accentColor = "teal",
}: {
  id: string; icon: ReactNode; title: string; subtitle?: string;
  status: SectionStatus; statusLabel: string;
  children: ReactNode; isOpen: boolean; onToggle: () => void;
  accentColor?: string;
}) {
  const statusCfg = {
    passed: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", icon: <CheckCircle2 size={12} /> },
    reviewed: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", icon: <CheckCircle2 size={12} /> },
    info: { bg: "bg-ink-50", text: "text-ink-600", border: "border-ink-200", icon: <Info size={12} /> },
  }[status];

  return (
    <div
      id={id}
      className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 scroll-mt-24 ${
        isOpen ? "border border-teal-200 shadow-md shadow-teal-100/40" : "border border-teal-100 shadow-sm"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full border-b border-ink-100 px-6 py-4 flex items-center gap-3 text-left hover:bg-teal-50/30 transition-colors"
      >
        <div className={`flex-shrink-0 ${isOpen ? "text-teal-600" : "text-teal-500"}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-medium text-ink-900">{title}</h2>
          {subtitle && <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`flex items-center gap-1.5 ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} border text-xs font-medium px-3 py-1.5 rounded-full flex-shrink-0`}>
          {statusCfg.icon} {statusLabel}
        </div>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-ink-400 transition-transform duration-300 ml-1 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-350 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NAV SECTIONS DATA
   ═══════════════════════════════════════════════════════════════ */

const navSections = [
  { id: "legal", label: "Legal Compliance", status: "passed" as const },
  { id: "safety", label: "Ingredient Safety", status: "passed" as const },
  { id: "manufacturing", label: "Manufacturing", status: "passed" as const },
  { id: "claims", label: "Claims & Transparency", status: "passed" as const },
  { id: "sun", label: "PRISM Sun Verified", status: "passed" as const },
  { id: "ethics", label: "Ethics & Sustainability", status: "passed" as const },
  { id: "transparency", label: "Ingredient Transparency", status: "passed" as const },
  { id: "suitability", label: "Consumer Suitability", status: "info" as const },
  { id: "evidence", label: "Testing Evidence", status: "passed" as const },
  { id: "record", label: "Certification Record", status: "info" as const },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN CLIENT COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function RegistryClient() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["legal"]));
  const [activeSection, setActiveSection] = useState("legal");
  const [showNav, setShowNav] = useState(false);

  function toggleSection(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /* Scroll spy */
  useEffect(() => {
    const els = navSections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* Show side nav after scrolling past hero */
  useEffect(() => {
    const onScroll = () => setShowNav(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-white min-h-screen">

      {/* ── 1. Top registry bar ──────────────────────────────── */}
      <div className="bg-teal-950 border-b border-teal-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={24} height={24} className="object-contain" />
            <span className="text-teal-200 text-xs font-medium tracking-wide">THE CLEAN SHEET REGISTRY</span>
            <span className="hidden sm:block text-teal-700 text-xs">|</span>
            <span className="hidden sm:inline-flex items-center gap-2 text-teal-400 text-xs font-mono">
              TCS-IN-2026-048291
              <CopyButton text="TCS-IN-2026-048291" />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-amber-400 text-xs font-medium">Sample Data</span>
          </div>
        </div>
      </div>

      {/* ── 2. Hero ─────────────────────────────────────────── */}
      <div className="bg-teal-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10">

          {/* Sample notice */}
          <div className="mb-6 flex items-center gap-2 border-b border-amber-800/30 pb-3">
            <AlertCircle size={12} className="text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-400/80">
              Sample page: all data is illustrative. Not a real certification record.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

            {/* Left: Product image - larger, lighter background */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="relative w-40 h-52 sm:w-48 sm:h-60 rounded-2xl bg-white/95 border border-white/20 flex items-center justify-center overflow-hidden shadow-lg shadow-black/20">
                <Image
                  src="https://codeskin.in/cdn/shop/files/UltraLite_Fluid_Sunscreen_bottle_s.png?v=1768211190"
                  alt="CodeSkin UltraLite Fluid Sunscreen SPF 50+ PA++++"
                  width={160}
                  height={200}
                  className="object-contain w-full h-full p-3"
                  unoptimized
                />
                <div className="absolute top-2.5 right-2.5">
                  <Image src="/images/tcs-certified-badge.png" alt="Certified" width={32} height={32} className="object-contain drop-shadow-lg" />
                </div>
              </div>
              <div className="w-48 flex items-center gap-2 bg-white/8 border border-teal-800/40 rounded-xl px-3 py-2.5">
                <div className="w-6 h-6 rounded-md bg-teal-700 text-white text-[9px] font-medium flex items-center justify-center flex-shrink-0">CS</div>
                <div>
                  <p className="text-teal-200 text-xs font-medium leading-none">CodeSkin India</p>
                  <p className="text-teal-600 text-[11px]">Verified Brand</p>
                </div>
              </div>
            </div>

            {/* Center: Product info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { label: "PRISM Core", icon: <Shield size={11} /> },
                  { label: "PRISM Sun Verified", icon: <Sun size={11} /> },
                ].map(({ label, icon }) => (
                  <div key={label} className="flex items-center gap-1.5 bg-teal-900/60 border border-teal-700/40 text-teal-300 text-xs font-medium px-3 py-1.5 rounded-full">
                    {icon} {label}
                  </div>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl font-medium text-white leading-tight mb-1.5">
                UltraLite Fluid Sunscreen
              </h1>
              <p className="text-teal-400 text-lg mb-0.5">SPF 50+ PA++++</p>
              <p className="text-teal-600 text-sm mb-6">CodeSkin India</p>

              {/* Key stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                {[
                  { label: "SPF Tested", value: "59.92", sub: "Label: SPF 50+" },
                  { label: "UVAPF", value: "22.07", sub: "PA++++ confirmed" },
                  { label: "Water Resistance", value: "94%", sub: "After 80 min" },
                  { label: "Non-Comedogenic", value: "Tested", sub: "28-day clinical" },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="bg-white/6 border border-teal-700/30 rounded-xl p-3.5">
                    <p className="text-[11px] text-teal-500 uppercase tracking-widest mb-1.5">{label}</p>
                    <p className="text-white text-lg font-medium leading-none">{value}</p>
                    <p className="text-teal-500 text-[11px] mt-1.5">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Dates + download */}
              <div className="border-t border-teal-800 pt-3.5 flex flex-wrap items-end gap-6 justify-between">
                <div className="flex gap-6">
                  <div>
                    <p className="text-teal-600 text-[11px] uppercase tracking-widest mb-0.5">Certified</p>
                    <p className="text-teal-200 text-sm">15 May 2026 <span className="text-amber-500 italic text-xs">[SAMPLE]</span></p>
                  </div>
                  <div>
                    <p className="text-teal-600 text-[11px] uppercase tracking-widest mb-0.5">Valid Until</p>
                    <p className="text-teal-200 text-sm">14 May 2027 <span className="text-amber-500 italic text-xs">[SAMPLE]</span></p>
                  </div>
                </div>
                <button className="flex items-center gap-2 bg-teal-400/15 hover:bg-teal-400/25 border border-teal-400/30 text-teal-300 text-xs font-medium px-4 py-2 rounded-full transition-colors">
                  <Download size={13} /> Download Certificate
                </button>
              </div>
            </div>

            {/* Right: PRISM Score */}
            <div className="flex-shrink-0 hidden lg:flex flex-col items-center">
              <div className="w-36 bg-teal-900/60 border border-teal-700/40 rounded-2xl p-5 text-center">
                <p className="text-teal-500 text-[10px] uppercase tracking-widest mb-2">PRISM Score</p>
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg viewBox="0 0 80 80" className="w-full h-full">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(45,158,150,0.15)" strokeWidth="6" />
                    <circle
                      cx="40" cy="40" r="34" fill="none"
                      stroke="#2dd4bf" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${(88 / 100) * 213.6} 213.6`}
                      transform="rotate(-90 40 40)"
                    />
                    <text x="40" y="38" textAnchor="middle" fill="white" fontSize="22" fontWeight="700" fontFamily="system-ui">88</text>
                    <text x="40" y="52" textAnchor="middle" fill="#5eead4" fontSize="9" fontFamily="system-ui">/100</text>
                  </svg>
                </div>
                <p className="text-teal-300 text-xs font-medium">Excellent</p>
                <p className="text-teal-600 text-[10px] mt-1">5 of 5 pillars passed</p>
              </div>
              <p className="text-teal-700 text-[10px] mt-2 text-center max-w-[9rem] leading-relaxed">
                Based on evidence submitted &amp; verified [SAMPLE]
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Transition gradient ── */}
      <div className="h-2 bg-gradient-to-b from-teal-950 to-white" />

      {/* ── Mobile PRISM Score (visible below lg) ── */}
      <div className="lg:hidden max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center gap-4 bg-teal-50 border border-teal-100 rounded-2xl p-4">
          <div className="w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 80 80" className="w-full h-full">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(45,158,150,0.15)" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="#0d9488" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(88/100)*213.6} 213.6`} transform="rotate(-90 40 40)" />
              <text x="40" y="38" textAnchor="middle" fill="#134e4a" fontSize="22" fontWeight="700" fontFamily="system-ui">88</text>
              <text x="40" y="52" textAnchor="middle" fill="#0d9488" fontSize="9" fontFamily="system-ui">/100</text>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-teal-900">PRISM Score: 88/100, Excellent</p>
            <p className="text-xs text-teal-600 mt-0.5">5 of 5 pillars passed. Based on evidence submitted &amp; verified [SAMPLE]</p>
          </div>
        </div>
      </div>

      {/* ── 3. Content + side nav ────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">

          {/* Sticky side nav (desktop only) */}
          <aside
            className={`hidden xl:block w-56 flex-shrink-0 transition-opacity duration-300 ${
              showNav ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="sticky top-24 space-y-0.5">
              <p className="text-[10px] text-ink-400 uppercase tracking-widest mb-2 px-3">Sections</p>
              {navSections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    if (!openSections.has(s.id)) toggleSection(s.id);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                    activeSection === s.id
                      ? "bg-teal-50 text-teal-800 font-medium"
                      : "text-ink-500 hover:text-ink-700 hover:bg-ink-50"
                  }`}
                >
                  {s.status === "passed" ? (
                    <CheckCircle2 size={12} className={activeSection === s.id ? "text-teal-500" : "text-teal-300"} />
                  ) : (
                    <Info size={12} className="text-ink-300" />
                  )}
                  <span className="truncate">{s.label}</span>
                </a>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* ─ 1. Legal Compliance ─ */}
            <AccordionSection
              id="legal"
              icon={<Shield size={16} />}
              title="Requirement 1: Legal Compliance"
              subtitle="Gate check: mandatory pass to proceed"
              status="passed" statusLabel="PASSED"
              isOpen={openSections.has("legal")} onToggle={() => toggleSection("legal")}
            >
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-[11px] text-ink-400 uppercase tracking-widest mb-3">Markets assessed</p>
                  <div className="space-y-2.5">
                    {[
                      { market: "India (CDSCO / Cosmetics Rules 2020)", ok: true },
                      { market: "European Union (Regulation EC 1223/2009)", ok: true },
                      { market: "United States (FDA OTC)", ok: null },
                    ].map(({ market, ok }) => (
                      <div key={market} className="flex items-center gap-2.5 text-sm">
                        {ok === true && <CheckCircle2 size={14} className="text-teal-500 flex-shrink-0" />}
                        {ok === null && <Info size={14} className="text-ink-300 flex-shrink-0" />}
                        <span className={ok === null ? "text-ink-400" : "text-ink-700"}>{market}</span>
                        {ok === null && <span className="text-ink-300 text-xs">(not assessed)</span>}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-ink-400 mt-3 italic">UV filters used are not FDA-approved. Product is assessed for India and EU markets only.</p>
                </div>
                <div>
                  <p className="text-[11px] text-ink-400 uppercase tracking-widest mb-3">Key checks</p>
                  <div className="space-y-2.5">
                    {[
                      "No Schedule A (TCS Prohibited) substances",
                      "No formaldehyde releasers in formula",
                      "No 4-MBC or EU-banned UV filters",
                      "Full INCI list disclosed on label",
                      "Reapplication instructions present",
                      "No prohibited claims (waterproof, 100% protection)",
                    ].map((check) => (
                      <div key={check} className="flex items-center gap-2.5 text-sm text-ink-700">
                        <CheckCircle2 size={13} className="text-teal-500 flex-shrink-0" />
                        {check}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* UV filter table */}
              <div>
                <p className="text-[11px] text-ink-400 uppercase tracking-widest mb-3">UV filter legality</p>
                <div className="rounded-2xl border border-teal-100 overflow-x-auto">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead className="bg-teal-50 border-b border-teal-100">
                      <tr>
                        <th className="text-left px-4 py-2.5 font-medium text-ink-600 text-xs">UV Filter</th>
                        <th className="text-center px-3 py-2.5 font-medium text-ink-600 text-xs">India</th>
                        <th className="text-center px-3 py-2.5 font-medium text-ink-600 text-xs">EU</th>
                        <th className="text-left px-4 py-2.5 font-medium text-ink-600 text-xs">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { filter: "Tinosorb M (Methylene Bis-Benzotriazolyl Tetramethylbutylphenol)", india: true, eu: true, note: "Nano-form. Nano disclosure on label. EU max 10%. Non-spray format - permitted." },
                        { filter: "Uvinul A Plus (DHHB)", india: true, eu: true, note: "UVA filter. Photostable. EU max 10%." },
                        { filter: "Uvinul T 150 (Ethylhexyl Triazone)", india: true, eu: true, note: "UVB filter with photostabilising properties. EU max 5%." },
                      ].map(({ filter, india, eu, note }) => (
                        <tr key={filter} className="border-b border-teal-50 last:border-0">
                          <td className="px-4 py-3 font-medium text-ink-800 text-xs max-w-[200px]">{filter}</td>
                          <td className="px-3 py-3 text-center">{india && <CheckCircle2 size={14} className="text-teal-500 mx-auto" />}</td>
                          <td className="px-3 py-3 text-center">{eu && <CheckCircle2 size={14} className="text-teal-500 mx-auto" />}</td>
                          <td className="px-4 py-3 text-ink-500 text-xs">{note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </AccordionSection>

            {/* ─ 2. Ingredient Safety ─ */}
            <AccordionSection
              id="safety"
              icon={<FlaskConical size={16} />}
              title="Requirement 2: Ingredient Safety"
              subtitle="Every ingredient reviewed for known hazards"
              status="passed" statusLabel="PASSED"
              isOpen={openSections.has("safety")} onToggle={() => toggleSection("safety")}
            >
              <p className="text-[11px] text-ink-400 uppercase tracking-widest mb-3">Ingredients with noted concerns</p>
              <div className="space-y-3">
                {[
                  { name: "Tinosorb M - nano form", level: "warn" as const, detail: "Nano-particle UV filter. EU prohibits nano Tinosorb M in spray formats - this is a fluid product, which is permitted. Nano disclosure present on label. Minor score deduction for incomplete systemic absorption data (gap common with newer nano UV filters)." },
                  { name: "Benzyl Alcohol", level: "warn" as const, detail: "Present as part of preservative system (with Sodium Benzoate, Potassium Sorbate, 1,2-Hexanediol). Mild sensitizer potential. EU Annex III-listed for leave-on cosmetics. At assessed preservative-level concentration, no safety concern [SAMPLE], but a minor deduction applied under sensitisation sub-score." },
                  { name: "Propylene Glycol Dibenzoate", level: "info" as const, detail: "Film-forming ester. Limited long-term human data compared to more established cosmetic esters. No significant safety concern at assessed concentration [SAMPLE]. Noted for monitoring at renewal." },
                ].map(({ name, level, detail }) => (
                  <div key={name} className={`flex items-start gap-4 p-4 rounded-2xl border ${level === "warn" ? "bg-amber-50 border-amber-100" : "bg-sky-50 border-sky-100"}`}>
                    {level === "warn" ? <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" /> : <Info size={15} className="text-sky-500 flex-shrink-0 mt-0.5" />}
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
                    <p className="text-sm font-medium text-teal-800">Formaldehyde releasers: None present</p>
                    <p className="text-xs text-teal-600 mt-0.5">Preservative system: Benzyl Alcohol + Sodium Benzoate + Potassium Sorbate + 1,2-Hexanediol</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 bg-teal-50 rounded-2xl p-4 border border-teal-100">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={14} className="text-teal-600" />
                  <div>
                    <p className="text-sm font-medium text-teal-800">Phototoxic botanical screen: Clear</p>
                    <p className="text-xs text-teal-600 mt-0.5">Aloe Barbadensis, Chondrus Crispus, Olea Europaea Leaf - no furanocoumarins, hypericin, or psoralens identified</p>
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* ─ 3. Manufacturing ─ */}
            <AccordionSection
              id="manufacturing"
              icon={<Building2 size={16} />}
              title="Requirement 3: Manufacturing Quality"
              subtitle="Facility, process, and batch documentation reviewed"
              status="passed" statusLabel="PASSED"
              isOpen={openSections.has("manufacturing")} onToggle={() => toggleSection("manufacturing")}
            >
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
            </AccordionSection>

            {/* ─ 4. Claims ─ */}
            <AccordionSection
              id="claims"
              icon={<Shield size={16} />}
              title="Requirement 4: Claims and Transparency"
              subtitle="Every claim reviewed against submitted test evidence"
              status="passed" statusLabel="PASSED"
              isOpen={openSections.has("claims")} onToggle={() => toggleSection("claims")}
            >
              <p className="text-[11px] text-ink-400 uppercase tracking-widest mb-1">What was verified and what was not</p>
              <p className="text-xs text-ink-400 italic mb-4">Not verified does not mean a claim is false - it means sufficient evidence was not submitted for The Clean Sheet to confirm it against the standard.</p>
              <div className="rounded-2xl border border-teal-100 overflow-hidden">
                <ClaimRow claim="SPF 50+" status="verified" detail="Independent SPF test result: 59.92 (ISO 24444 method or validated equivalent). Tested SPF exceeds label claim. Lab: NABL-accredited [SAMPLE: Ref T-XXXX]. Label correctly states SPF 50+ - no inflation of claim." />
                <ClaimRow claim="PA++++ UVA protection" status="verified" detail="UVAPF: 22.07 (JCIA method). PA++++ tier requires UVA-PF of 16 or above - this result qualifies comfortably. Boots 3-star UVA rating consistent with the result and claim." />
                <ClaimRow claim="Water resistant (80 minutes)" status="verified" detail="94% of original SPF retained after 80 minutes of water immersion (ISO 16217 protocol). Specific claim wording is 'water resistant' with duration specified - not 'waterproof', which is a prohibited claim in India and EU." />
                <ClaimRow claim="Non-comedogenic" status="verified" detail="28-day clinical study. 33 adult participants with oily or mixed-oily skin. Zero new comedones observed. 61.5% reduction in inflammatory acne lesions. 16% reduction in total lesions. Dermatologist supervised. Sample size adequate for a consumer-facing claim." />
                <ClaimRow claim="Dermatologist-tested" status="verified" detail="24-hour primary irritation patch test conducted under dermatologist supervision. Zero irritation reported across participants. Protocol and adverse event summary reviewed [SAMPLE: study reference pending]." />
                <ClaimRow claim="Ophthalmologist-tested" status="verified" detail="3-day ocular safety study, twice-daily application, conducted under ophthalmologist supervision. No ocular irritation reported. Protocol reviewed [SAMPLE]." />
                <ClaimRow claim="Reef-safe" status="verified-qualified" detail="Product does not contain oxybenzone, octinoxate, or octisalate - the three UV filters banned under Hawaii SB 2571 and Palau reef protection standards. Claim substantiated on filter-absence basis. No product-specific ecotoxicology testing submitted. The term 'reef-safe' has no universal regulatory definition." />
                <ClaimRow claim="Vegan and cruelty-free" status="verified" detail="Full INCI reviewed - no animal-derived ingredients. Saccharomyces Ferment Lysate Filtrate is yeast fermentation origin (not animal). Cruelty-free supported by brand declaration [SAMPLE - third-party audit not submitted for this evaluation]." />
                <ClaimRow claim="Fragrance-free" status="verified" detail="No parfum, fragrance, or masking fragrance ingredient in INCI. No EU 26 fragrance allergens detected above 0.001% leave-on threshold in reviewed formula [SAMPLE]." />
                <ClaimRow claim="Hydration 65% at 8h / 38% at 24h" status="verified-qualified" detail="Consumer study data reviewed. Corneometer-based hydration measurement, dry skin panel. Results consistent with ingredient profile (Sodium Hyaluronate, Polyglutamic Acid, Ectoin, Aloe). Full protocol and sample size details are [SAMPLE] - pending final protocol review." />
                <ClaimRow claim="Blue light / visible light / IR protection" status="not-verified" detail="No peer-reviewed validated in vitro or clinical test for blue light, visible light, or IR protection in this specific formulation was submitted. Red Algae extract has published data on blue light defence, but a product-specific validated protocol was not available for review." />
                <ClaimRow claim="100% biodegradable" status="not-verified" detail="No third-party biodegradability certification or OECD 301-method test data submitted for the full formulation. Individual ingredients may be biodegradable but a whole-formulation test is required for the claim to be verified." />
              </div>
            </AccordionSection>

            {/* ─ 5. PRISM Sun Verified ─ */}
            <div id="sun" className="scroll-mt-24">
              <div className="bg-teal-950 rounded-2xl overflow-hidden border border-teal-800">
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
                      { label: "SPF Result", value: "59.92", context: "vs SPF 50+ label" },
                      { label: "UVAPF", value: "22.07", context: "PA++++ threshold: 16+" },
                      { label: "Boots UVA Rating", value: "3-star", context: "Good UVA/UVB ratio" },
                      { label: "Water Resistance", value: "94%", context: "After 80 min immersion" },
                    ].map(({ label, value, context }) => (
                      <div key={label} className="bg-teal-900/60 rounded-2xl p-4 border border-teal-800/50">
                        <p className="text-teal-600 text-[11px] uppercase tracking-widest mb-1.5">{label}</p>
                        <p className="text-2xl font-medium text-teal-300">{value}</p>
                        <p className="text-teal-500 text-xs mt-1.5">{context}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      "SPF test from NABL/ISO 17025-accredited lab",
                      "UVA / PA test evidence reviewed",
                      "Photostability reviewed - UV filter combination is photostable",
                      "Water resistance test with duration specified on label",
                      "All UV filters legal in assessed markets (India, EU)",
                      "No banned UV filters (no 4-MBC, no oxybenzone, no octinoxate)",
                      "No phototoxic botanicals in formula",
                      "Nano disclosure present (Tinosorb M is nano-form)",
                      "Non-spray format: nano TiO2 restriction (EU) - not applicable",
                      "Reapplication instructions on label",
                      "SPF label claim does not exceed tested SPF",
                    ].map((check) => (
                      <div key={check} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 size={13} className="text-teal-400 flex-shrink-0" />
                        <span className="text-teal-200">{check}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ─ 6. Ethics ─ */}
            <AccordionSection
              id="ethics"
              icon={<Leaf size={16} />}
              title="Requirement 5: Ethics and Sustainability"
              subtitle="Formula and ingredient origins reviewed"
              status="passed" statusLabel="PASSED"
              isOpen={openSections.has("ethics")} onToggle={() => toggleSection("ethics")}
            >
              <div className="divide-y divide-teal-50">
                <Row label="Vegan ingredients" value="Confirmed - no animal-derived INCI identified" pass={true} />
                <Row label="Cruelty-free" value="Brand declaration reviewed [SAMPLE - third-party audit not submitted]" pass={true} />
                <Row label="Palm / mica sourcing" value="No palm-derived or mica-containing ingredients in formula" pass={true} />
                <Row label="Natural origin index" value="Primarily synthetic UV filters - natural origin index not calculated for this evaluation [SAMPLE]" pass={null} />
                <Row label="Packaging sustainability" value="Packaging details not fully documented in dossier [SAMPLE]" pass={null} />
              </div>
            </AccordionSection>

            {/* ─ 7. Ingredient Transparency ─ */}
            <AccordionSection
              id="transparency"
              icon={<FlaskConical size={16} />}
              title="Ingredient Transparency"
              subtitle="Regulatory screening and formula review"
              status="passed" statusLabel="REVIEWED"
              isOpen={openSections.has("transparency")} onToggle={() => toggleSection("transparency")}
            >
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-[11px] text-ink-400 uppercase tracking-widest mb-3">Regulatory screen results</p>
                  <div className="space-y-2.5">
                    {[
                      { market: "India", status: "Passed" },
                      { market: "European Union", status: "Passed" },
                      { market: "IFRA fragrance standards", status: "Passed (fragrance-free)" },
                      { market: "ECHA SVHC candidate list", status: "No SVHC identified" },
                      { market: "TCS Schedule A (Prohibited)", status: "No prohibited substances" },
                      { market: "TCS Schedule B (Restricted limits)", status: "Within limits [SAMPLE]" },
                    ].map(({ market, status }) => (
                      <div key={market} className="flex items-center justify-between text-sm gap-3">
                        <span className="text-ink-600">{market}</span>
                        <span className="text-teal-600 font-medium flex-shrink-0 text-xs">{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-ink-400 uppercase tracking-widest mb-3">Formula review</p>
                  <div className="space-y-2.5">
                    {[
                      "Complete formula reviewed confidentially [SAMPLE]",
                      "Ingredient origin types disclosed to certifier",
                      "Key actives checked against formula and evidence",
                      "Fragrance and allergen review completed",
                      "Preservative system reviewed",
                      "UV filters and concentrations reviewed [SAMPLE]",
                      "Global restricted ingredient screening completed",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm text-ink-600">
                        <CheckCircle2 size={13} className="text-teal-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-ink-400 uppercase tracking-widest mb-2">Full INCI list (as disclosed on label)</p>
              <div className="bg-ink-50 rounded-2xl p-4 border border-ink-100">
                <p className="font-mono text-xs text-ink-600 leading-loose">
                  Aqua, Methylene Bis-Benzotriazolyl Tetramethylbutylphenol, C15-19 Alkane, Diethylamino Hydroxybenzoyl Hexyl Benzoate, Ethylhexyl Triazone, Niacinamide, Caprylyl Caprylate/Caprate, Aloe Barbadensis Leaf Juice, Saccharomyces Ferment Lysate Filtrate, Chondrus Crispus (Red Algae) Extract, Isododecane, Hexylene Glycol, Starch, Dioctyl Carbonate, Isoamyl Laurate, Erythritol, Polyglutamic Acid, Ectoin, Xylitol, Sodium Hyaluronate, Adenosine, Propylene Glycol Dibenzoate, Dipotassium Glycyrrhizate, Tocopheryl Acetate, Tocotrienols, Steareth-21, Pentaerythrityl Distearate, Sodium Polyacrylate, Sodium Stearoyl Glutamate, Sodium Levulinate, Silica, Polyacrylate Crosspolymer-6, Glyceryl Caprylate, Trisodium Dicarboxymethyl Alaninate, Allantoin, Phytosteryl/Octyldodecyl Lauroyl Glutamate, Benzyl Alcohol, Diethylhexyl Syringylidenemalonate, Caprylic/Capric Triglyceride, Olea Europaea (Olive) Leaf Extract, Panthenol, Potassium Sorbate, Citric Acid, Sodium Benzoate, 1,2-Hexanediol
                </p>
              </div>
              <p className="text-xs text-ink-400 mt-2">Source: codeskin.in product page.</p>
            </AccordionSection>

            {/* ─ 8. Consumer Suitability ─ */}
            <AccordionSection
              id="suitability"
              icon={<Sun size={16} />}
              title="Consumer Suitability Guidance"
              subtitle="Who this product may work for"
              status="info" statusLabel="GUIDANCE"
              isOpen={openSections.has("suitability")} onToggle={() => toggleSection("suitability")}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100">
                  <p className="text-[11px] text-teal-600 uppercase tracking-widest font-medium mb-3">May be suitable for</p>
                  <ul className="space-y-2.5">
                    {[
                      "Adults seeking daily UV protection (India and EU markets)",
                      "Dry to combination skin - multiple humectants and film-formers",
                      "Oily and mixed-oily skin - non-comedogenic tested (28-day clinical)",
                      "Users who want a fragrance-free daily sunscreen",
                      "Users seeking EU-grade next-generation UV filters without oxybenzone or octinoxate",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-ink-700">
                        <CheckCircle2 size={13} className="text-teal-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                  <p className="text-[11px] text-amber-700 uppercase tracking-widest font-medium mb-3">Use with caution if</p>
                  <ul className="space-y-2.5">
                    {[
                      "You have a known sensitivity to benzyl alcohol - check your reaction history",
                      "You are pregnant - not evaluated under PRISM Pregnancy Safe. Chemical UV filter system not assessed to pregnancy-specific safety margins. Consult your doctor.",
                      "You are applying to children under 3 years - not evaluated under PRISM Baby Safe criteria",
                      "You have broken or highly reactive skin - discontinue if irritation occurs",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-ink-700">
                        <AlertCircle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="text-xs text-ink-400 mt-4 leading-relaxed italic">
                Certification confirms this product met our review criteria based on submitted and verified evidence. It does not guarantee no person will ever experience an adverse reaction. Individual skin reactions are always possible. Discontinue use if a reaction occurs.
              </p>
            </AccordionSection>

            {/* ─ 9. Testing Evidence ─ */}
            <AccordionSection
              id="evidence"
              icon={<FlaskConical size={16} />}
              title="Testing Evidence on File"
              subtitle="Lab reports and clinical studies reviewed"
              status="passed" statusLabel="REVIEWED"
              isOpen={openSections.has("evidence")} onToggle={() => toggleSection("evidence")}
            >
              <div className="rounded-2xl border border-teal-100 overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead className="bg-teal-50 border-b border-teal-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-ink-600 text-xs">Test</th>
                      <th className="text-left px-4 py-3 font-medium text-ink-600 text-xs">Result</th>
                      <th className="text-left px-4 py-3 font-medium text-ink-600 text-xs hidden sm:table-cell">Lab</th>
                      <th className="text-center px-3 py-3 font-medium text-ink-600 text-xs">Status</th>
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
                        <td className="px-4 py-3 text-ink-800 font-medium text-xs">{test}</td>
                        <td className="px-4 py-3 text-teal-700 text-xs">{result}</td>
                        <td className="px-4 py-3 text-ink-400 italic text-xs hidden sm:table-cell">{lab}</td>
                        <td className="px-3 py-3 text-center">
                          {pass ? <CheckCircle2 size={14} className="text-teal-500 mx-auto" /> : <XCircle size={14} className="text-rose-400 mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionSection>

            {/* ─ 10. Certification Record ─ */}
            <div id="record" className="scroll-mt-24">
              <div className="bg-teal-950 rounded-2xl overflow-hidden border border-teal-800">
                <div className="px-6 py-5 border-b border-teal-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-medium text-white">Official Certification Record</h2>
                    <p className="text-teal-500 text-xs mt-0.5">All fields marked [SAMPLE] are illustrative</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <QrCode size={14} className="text-teal-500" />
                    <span className="text-teal-600 text-xs">Verification QR</span>
                  </div>
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
                        <span className="text-teal-200 text-sm">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-teal-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-teal-600 text-[11px] uppercase tracking-widest mb-3">Change history</p>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-teal-600">15 May 2026</span>
                        <span className="bg-teal-900 border border-teal-700 text-teal-300 text-[11px] px-2.5 py-1 rounded-full">Certification issued</span>
                        <span className="text-teal-400">Initial certification granted [SAMPLE]</span>
                      </div>
                      <p className="text-teal-700 text-xs mt-3 italic">No changes reported since initial certification [SAMPLE]</p>
                    </div>

                    {/* QR placeholder */}
                    <div className="hidden sm:flex flex-col items-center gap-2 flex-shrink-0">
                      <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center">
                        <QrCode size={48} className="text-teal-900" />
                      </div>
                      <p className="text-teal-600 text-[10px]">Scan to verify</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─ Footer ─ */}
            <div className="text-center pt-8 border-t border-teal-100">
              <div className="flex items-center justify-center gap-2.5 mb-3">
                <Image src="/images/tcs-certified-badge.png" alt="The Clean Sheet" width={36} height={36} className="object-contain" />
                <span className="text-base font-medium text-ink-800">The Clean Sheet</span>
              </div>
              <p className="text-sm text-ink-400 max-w-md mx-auto leading-relaxed mb-5">
                This certification was issued by The Clean Sheet. The Clean Sheet is an independent voluntary trust seal.
                Certification does not replace country-specific product registration, notification, or import requirements.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-teal-600 mb-4">
                <Link href="/" className="hover:underline">thecleansheet.in</Link>
                <span className="text-ink-200">|</span>
                <Link href="/methodology" className="hover:underline">How certification works</Link>
                <span className="text-ink-200">|</span>
                <a href="mailto:hello@thecleansheet.in" className="hover:underline">hello@thecleansheet.in</a>
              </div>
              <p className="text-xs text-ink-300">
                Certificate ID: TCS-IN-2026-048291{" "}
                <span className="text-amber-400 italic">[SAMPLE]</span> · Last verified: May 2026
              </p>
              <p className="text-xs text-ink-300 mt-1">
                Global regulations set the legal floor. The Clean Sheet sets the trust ceiling.
              </p>
              <p className="text-[11px] text-ink-200 mt-2">
                This page is private and not indexed by search engines.
              </p>
            </div>

          </div>{/* end main content */}
        </div>{/* end flex */}
      </div>{/* end max-w container */}
    </div>
  );
}
