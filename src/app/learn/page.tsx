import Link from "next/link";
import { AlertTriangle, CheckCircle2, XCircle, BookOpen, ArrowRight, FlaskConical, Shield, Microscope } from "lucide-react";
import BackButton from "@/components/BackButton";

export const metadata = {
  title: "Learn | The Clean Sheet™",
  description: "Ingredient education, skin type guides, and courses, everything you need to make smarter decisions about your skincare.",
};

const GLOSSARY = [
  {
    term: "INCI",
    full: "International Nomenclature of Cosmetic Ingredients",
    description: "The standardized system for naming cosmetic ingredients used globally. By law in India and the EU, all ingredients must be listed in INCI format.",
    status: "info",
  },
  {
    term: "Endocrine Disruptors",
    full: "Chemicals that interfere with hormonal systems",
    description: "Chemicals that mimic or block hormones in the body. Common examples in cosmetics include parabens, oxybenzone, and triclosan. Linked to reproductive issues and developmental problems.",
    status: "danger",
    examples: ["Parabens", "Oxybenzone", "Triclosan", "Phthalates"],
  },
  {
    term: "Formaldehyde Releasers",
    full: "Preservatives that slowly release formaldehyde",
    description: "Preservatives used in cosmetics that release small amounts of formaldehyde over time. Formaldehyde is an IARC Group 1 carcinogen. Commonly found in hair products and moisturizers.",
    status: "danger",
    examples: ["DMDM Hydantoin", "Quaternium-15", "Diazolidinyl Urea", "Imidazolidinyl Urea"],
  },
  {
    term: "Leave-on vs Rinse-off",
    full: "Product usage type that affects safety assessment",
    description: "Leave-on products (serums, moisturizers, sunscreens) have prolonged skin contact and carry higher exposure risk. Rinse-off products (cleansers, shampoos) are evaluated more leniently.",
    status: "info",
  },
  {
    term: "SCCS",
    full: "Scientific Committee on Consumer Safety",
    description: "The EU body that provides scientific opinions on the safety of cosmetic ingredients. The Clean Sheet uses SCCS guidelines as a primary reference.",
    status: "safe",
  },
  {
    term: "Parabens",
    full: "Methylparaben, Propylparaben, Butylparaben, etc.",
    description: "Synthetic preservatives widely used in cosmetics. Linked to estrogen mimicry. The EU has restricted several parabens. Common in moisturizers, shampoos, and makeup.",
    status: "danger",
    examples: ["Methylparaben", "Ethylparaben", "Propylparaben", "Butylparaben"],
  },
  {
    term: "SLS / SLES",
    full: "Sodium Lauryl Sulfate / Sodium Laureth Sulfate",
    description: "Common surfactants (lathering agents). SLS is a known skin and eye irritant that can disrupt the skin barrier. SLES is milder but may be contaminated with 1,4-dioxane, a probable carcinogen.",
    status: "caution",
  },
  {
    term: "Oxybenzone",
    full: "Benzophenone-3",
    description: "A chemical UV filter found in sunscreens. Acts as an endocrine disruptor and accumulates in the body. Banned in Hawaii and Palau due to coral reef toxicity.",
    status: "danger",
  },
  {
    term: "Fragrance / Parfum",
    full: "Undisclosed fragrance mixture",
    description: "A catch-all ingredient that can contain up to 3,000 individual chemicals, many of which are allergens or sensitizers. Brands are not required to disclose individual fragrance components in most markets.",
    status: "caution",
  },
];

function ScanGraphic() {
  const rows = [
    { name: "Niacinamide",        fn: "Active",      concern: "low",    flag: "" },
    { name: "Glycerin",           fn: "Humectant",   concern: "low",    flag: "" },
    { name: "Retinol",            fn: "Active",      concern: "medium", flag: "Baby" },
    { name: "Phenoxyethanol",     fn: "Preservative",concern: "medium", flag: "" },
    { name: "DMDM Hydantoin",     fn: "Preservative",concern: "high",   flag: "CMR" },
    { name: "Fragrance / Parfum", fn: "Fragrance",   concern: "medium", flag: "Allergen" },
  ];
  const C = { low: "#4ade80", medium: "#fbbf24", high: "#f87171" } as const;
  const L = { low: "Safe", medium: "Caution", high: "Flagged" } as const;
  const flagColors: Record<string, string> = { CMR:"#f87171", Baby:"#93c5fd", Allergen:"#fbbf24" };

  return (
    <>
      <style>{`
        @keyframes learn-slideIn  { from { opacity:0; transform:translateX(12px) } to { opacity:1; transform:translateX(0) } }
        @keyframes learn-blink    { 0%,100% { opacity:1 } 50% { opacity:0 } }
        @keyframes learn-ping     { 0%,100% { opacity:1; transform:scale(1) } 50% { opacity:0.4; transform:scale(1.2) } }
        @keyframes learn-scanLine { 0% { top:0 } 100% { top:100% } }
        .learn-row   { animation: learn-slideIn 0.5s ease both; }
        .learn-blink { animation: learn-blink   1.1s step-start infinite; }
        .learn-ping  { animation: learn-ping    1.5s ease infinite; }
      `}</style>
      <div className="w-full max-w-[480px] mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-black/50 select-none"
        style={{ background:"linear-gradient(155deg,#07201e 0%,#0d2b27 55%,#081a18 100%)", border:"1px solid rgba(255,255,255,0.07)", fontFamily:"'Geist Mono',ui-monospace,monospace" }}>

        {/* Title bar */}
        <div className="flex items-center px-4 py-3 border-b" style={{ borderColor:"rgba(255,255,255,0.05)", background:"rgba(255,255,255,0.025)" }}>
          <div className="flex gap-1.5">
            {["#ff5f57","#ffbd2e","#28c840"].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background:c }} />)}
          </div>
          <span className="text-[11px] mx-auto" style={{ color:"rgba(255,255,255,0.22)" }}>Ingredient Scanner</span>
          <div className="flex items-center gap-1.5">
            <span className="learn-ping w-1.5 h-1.5 rounded-full block" style={{ background:"#4ade80" }} />
            <span className="text-[10px]" style={{ color:"rgba(74,222,128,0.7)" }}>live</span>
          </div>
        </div>

        {/* Fake search */}
        <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor:"rgba(255,255,255,0.05)", background:"rgba(255,255,255,0.02)" }}>
          <span className="text-[10px]" style={{ color:"rgba(255,255,255,0.3)" }}>$</span>
          <span className="text-[11px]" style={{ color:"rgba(255,255,255,0.55)" }}>scan --product &quot;Daily Moisturiser&quot; --market IN+EU</span>
          <span className="learn-blink text-[11px]" style={{ color:"#5eead4" }}>|</span>
        </div>

        {/* Header row */}
        <div className="px-4 py-2 flex items-center gap-3 border-b" style={{ borderColor:"rgba(255,255,255,0.04)" }}>
          <span className="text-[9px] uppercase tracking-[0.2em] flex-1" style={{ color:"rgba(255,255,255,0.2)" }}>Ingredient</span>
          <span className="text-[9px] uppercase tracking-[0.2em] w-24 hidden sm:block" style={{ color:"rgba(255,255,255,0.2)" }}>Function</span>
          <span className="text-[9px] uppercase tracking-[0.2em] w-16" style={{ color:"rgba(255,255,255,0.2)" }}>Status</span>
        </div>

        {/* Ingredient rows */}
        {rows.map(({ name, fn, concern, flag }, i) => (
          <div key={name}
            className="learn-row flex items-center gap-3 px-4 py-2.5 border-b"
            style={{ borderColor:"rgba(255,255,255,0.03)", animationDelay:`${i * 0.16}s`, background: concern === "high" ? "rgba(248,113,113,0.04)" : "transparent" }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:C[concern as keyof typeof C], boxShadow: concern === "high" ? `0 0 8px ${C[concern as keyof typeof C]}80` : "none" }} />
            <span className="text-[11px] flex-1 truncate" style={{ color:"rgba(255,255,255,0.72)" }}>{name}</span>
            <span className="text-[10px] w-24 hidden sm:block truncate" style={{ color:"rgba(255,255,255,0.25)" }}>{fn}</span>
            <div className="flex items-center gap-1.5 w-24 justify-end">
              <span className="text-[10px]" style={{ color:C[concern as keyof typeof C] }}>{L[concern as keyof typeof L]}</span>
              {flag && (
                <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background:`${flagColors[flag]}20`, color:flagColors[flag], border:`1px solid ${flagColors[flag]}40` }}>
                  {flag}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="learn-row px-4 py-3 flex items-center justify-between" style={{ animationDelay:"1.1s", background:"rgba(248,113,113,0.05)", borderTop:"1px solid rgba(248,113,113,0.1)" }}>
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color:"rgba(255,255,255,0.3)" }}>Result</span>
          </div>
          <span className="text-[11px]" style={{ color:"#f87171" }}>3 ingredients flagged · review recommended</span>
        </div>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    danger:  { bg:"bg-danger-100",  text:"text-danger-700",  icon:<XCircle size={11} />,       label:"High concern" },
    caution: { bg:"bg-caution-100", text:"text-caution-600", icon:<AlertTriangle size={11} />, label:"Moderate concern" },
    safe:    { bg:"bg-safe-100",    text:"text-safe-600",    icon:<CheckCircle2 size={11} />,  label:"Reference" },
    info:    { bg:"bg-teal-100",    text:"text-teal-700",    icon:<BookOpen size={11} />,      label:"Term" },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-normal px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
      {s.icon} {s.label}
    </span>
  );
}

export default function LearnPage() {
  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <BackButton />
      </div>
      <style>{`
        @keyframes learn-fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .learn-reveal { animation: learn-fadeUp 0.6s ease both; }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background:"linear-gradient(135deg,#07201e 0%,#0e3330 50%,#081a18 100%)", minHeight:"100svh", display:"flex", alignItems:"center" }}>
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage:"radial-gradient(#5eead4 1px,transparent 1px)", backgroundSize:"26px 26px" }} />
        {/* Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(20,184,166,0.12) 0%,transparent 65%)" }} />
        <div className="absolute bottom-0 left-20 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(99,102,241,0.08) 0%,transparent 65%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left */}
            <div className="learn-reveal" style={{ animationDelay:"0.1s" }}>
              <div className="inline-flex items-center gap-2 text-teal-400 text-xs font-normal mb-8 uppercase tracking-[0.2em]">
                <BookOpen size={12} /> Education &amp; Resources
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium text-white tracking-tight leading-[1.04] mb-6">
                Know what&apos;s in
                <br />
                <span style={{ background:"linear-gradient(90deg,#5eead4,#99f6e4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>your skincare.</span>
              </h1>
              <p className="text-teal-200/70 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl">
                Ingredient education, skin type guides, and expert-led courses. Everything you need to make smarter decisions about what you put on your skin.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#ingredients" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-normal px-5 py-3 rounded-xl transition-all text-sm hover:shadow-lg hover:shadow-teal-500/25">
                  Ingredient Directory <ArrowRight size={14} />
                </a>
                <a href="#skin-type-guides" className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-white font-normal px-5 py-3 rounded-xl transition-all text-sm">
                  Skin Type Guides
                </a>
                <a href="#courses" className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-white font-normal px-5 py-3 rounded-xl transition-all text-sm">
                  Courses
                </a>
              </div>

              {/* Stats */}
              <div className="mt-12 flex flex-wrap gap-6">
                {[
                  { n: "25k+", label: "Ingredients evaluated" },
                  { n: "4",    label: "Regulatory markets" },
                  { n: "Free", label: "Skin guides" },
                ].map(({ n, label }) => (
                  <div key={label}>
                    <div className="text-2xl text-teal-300 mb-0.5">{n}</div>
                    <div className="text-[11px] text-teal-400/50 uppercase tracking-widest">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right, scan graphic */}
            <div className="learn-reveal" style={{ animationDelay:"0.3s" }}>
              <ScanGraphic />
            </div>
          </div>
        </div>
      </section>

      {/* ── Ingredient Directory ──────────────────────────────── */}
      <section id="ingredients" className="py-24 lg:py-32 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="text-teal-600 text-xs font-normal uppercase tracking-widest mb-4">25,000+ Ingredients &amp; growing</div>
              <h2 className="text-4xl lg:text-5xl font-medium text-ink-950 tracking-tight mb-5">
                Ingredient Directory.
              </h2>
              <p className="text-ink-600 text-lg leading-relaxed mb-8">
                Our complete ingredient database, searchable by INCI name, CAS number, or function. Each entry shows concern level, regulatory status across EU, India, US, and Korea, key safety notes, allergen flags, CMR status, and more.
              </p>
              <Link href="/ingredients"
                className="inline-flex items-center gap-2 bg-ink-950 hover:bg-ink-800 text-white font-normal px-7 py-4 rounded-2xl transition-all text-sm hover:shadow-xl hover:shadow-ink-900/20">
                Open Ingredient Directory <ArrowRight size={15} />
              </Link>

              <div className="mt-10 grid grid-cols-3 gap-4">
                {[
                  { icon: Shield,      label: "Regulatory cross-check", sub: "EU, India, US, Korea" },
                  { icon: FlaskConical, label: "Safety flags",           sub: "CMR, SVHC, Allergen, Endocrine" },
                  { icon: Microscope,  label: "Science-backed",         sub: "SCCS, CIR, IARC" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                    <Icon size={16} className="text-teal-600 mb-2" />
                    <div className="text-xs font-normal text-ink-800 mb-0.5">{label}</div>
                    <div className="text-[10px] text-ink-400 leading-tight">{sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini-table preview */}
            <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-900/5">
              <div className="bg-ink-950 px-5 py-4 flex items-center gap-3">
                <div className="flex gap-1.5">
                  {["#ff5f57","#ffbd2e","#28c840"].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background:c }} />)}
                </div>
                <span className="text-[11px] text-white/30 font-mono flex-1 text-center">Ingredient Directory · Updated daily</span>
              </div>
              <div className="bg-white">
                <div className="px-5 py-3 border-b border-slate-50 flex items-center gap-3 text-[10px] font-normal text-slate-400 uppercase tracking-widest">
                  <span className="flex-1">INCI Name</span>
                  <span className="w-24 hidden sm:block">Function</span>
                  <span className="w-20">Concern</span>
                </div>
                {[
                  { name:"Niacinamide",     fn:"Active",      c:"low",    flag:"" },
                  { name:"Retinol",          fn:"Active",      c:"medium", flag:"Baby" },
                  { name:"DMDM Hydantoin",  fn:"Preservative",c:"high",   flag:"CMR" },
                  { name:"Oxybenzone",       fn:"UV Filter",   c:"high",   flag:"Endocrine" },
                  { name:"Glycerin",         fn:"Humectant",   c:"low",    flag:"" },
                  { name:"Phenoxyethanol",   fn:"Preservative",c:"medium", flag:"" },
                ].map(({ name, fn, c, flag }) => {
                  const dotColor = c === "low" ? "#4ade80" : c === "medium" ? "#fbbf24" : "#f87171";
                  const flagBg = flag === "CMR" ? "#fef2f2" : flag === "Baby" ? "#eff6ff" : flag === "Endocrine" ? "#faf5ff" : "";
                  const flagText = flag === "CMR" ? "#dc2626" : flag === "Baby" ? "#2563eb" : "#9333ea";
                  return (
                    <div key={name} className="px-5 py-3 border-b border-slate-50 last:border-0 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-default">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:dotColor }} />
                      <span className="text-sm text-slate-800 flex-1 truncate">{name}</span>
                      <span className="text-xs text-slate-400 w-24 hidden sm:block truncate">{fn}</span>
                      <div className="w-20 flex justify-end">
                        {flag
                          ? <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background:flagBg, color:flagText, border:`1px solid ${flagText}30` }}>{flag}</span>
                          : <span className="text-[10px] text-slate-300">-</span>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Browse the full directory</span>
                <Link href="/ingredients" className="text-xs text-teal-600 hover:text-teal-800 font-normal flex items-center gap-1 transition-colors">
                  View all <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Skin Type Guides ─────────────────────────────────── */}
      <section id="skin-type-guides" className="relative py-24 lg:py-28 overflow-hidden scroll-mt-16" style={{ background:"linear-gradient(135deg,#0f2e2b 0%,#134e4a 40%,#0e3d3a 100%)" }}>
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage:"radial-gradient(#5eead4 1px,transparent 1px)", backgroundSize:"24px 24px" }} />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(20,184,166,0.15) 0%,transparent 65%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <div className="inline-flex items-center gap-2 text-teal-300 bg-teal-800/60 border border-teal-700 text-xs font-normal px-3 py-1.5 rounded-full mb-5">
              <BookOpen size={12} /> Free · PDF Download
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-2">
              <h2 className="text-4xl lg:text-5xl font-medium text-white tracking-tight">
                Find your skin type.
                <br />
                <span className="text-teal-300">Build your routine.</span>
              </h2>
              <p className="text-teal-200/60 text-base leading-relaxed lg:max-w-xs">
                Science-backed guides for Indian skin. Practical, jargon-free, free to download.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type:"Oily Skin",       desc:"Manage sebum, minimise pores, pick non-comedogenic actives.", href:"/learn/guides/oily-skin",       accent:"#14b8a6" },
              { type:"Dry Skin",        desc:"Restore the moisture barrier and lock in lasting hydration.",  href:"/learn/guides/dry-skin",        accent:"#3b82f6" },
              { type:"Combination",     desc:"Balance an oily T-zone and dry cheeks without compromise.",    href:"/learn/guides/combination-skin", accent:"#a855f7" },
              { type:"Normal Skin",     desc:"Maintain your skin's natural balance and protect from ageing.", href:"/learn/guides/normal-skin",     accent:"#22c55e" },
            ].map(({ type, desc, href, accent }) => (
              <Link key={type} href={href}
                className="group flex flex-col rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(4px)" }}>
                <div className="h-0.5 w-10 rounded-full mb-5" style={{ background:accent }} />
                <h3 className="text-lg font-normal text-white mb-2">{type}</h3>
                <p className="text-teal-200/50 text-sm leading-relaxed flex-1">{desc}</p>
                <div className="mt-5 flex items-center gap-1.5 text-sm font-normal transition-all duration-200 group-hover:gap-2.5" style={{ color:accent }}>
                  Download guide <ArrowRight size={13} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Courses ──────────────────────────────────────────── */}
      <section id="courses" className="py-24 lg:py-28 border-b border-slate-100 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <div className="text-teal-600 text-xs font-normal uppercase tracking-widest mb-4">Courses</div>
            <h2 className="text-4xl lg:text-5xl font-medium text-ink-950 tracking-tight mb-4">Expert-led sessions.</h2>
            <p className="text-ink-600 text-lg max-w-xl">Science-backed sessions to help you understand your skin and make smarter choices.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
            {/* Skincare 101, ended */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-100 opacity-60" style={{ background:"linear-gradient(135deg,#f8fafc,#f1f5f9)" }}>
              <div className="absolute top-5 right-5 flex items-center gap-1 bg-yellow-400 text-ink-900 text-xs font-normal px-2.5 py-1 rounded-full z-10">
                ★ 4.75/5
              </div>
              <div className="absolute top-5 left-5 bg-slate-500 text-white text-[10px] font-normal uppercase tracking-widest px-2.5 py-1 rounded-full z-10">Ended</div>
              <div className="p-8 pt-16">
                <h3 className="text-xl font-normal text-ink-800 mb-1">Skincare 101</h3>
                <p className="text-ink-400 text-xs mb-4">The Science Session · Rs. 299 · 26 April 2026</p>
                <p className="text-ink-400 text-sm leading-relaxed">Stop guessing. Learn the science behind your skin: ingredients, routines, and what actually works.</p>
              </div>
            </div>

            {/* Coming soon */}
            <div className="rounded-3xl flex flex-col items-center justify-center text-center p-10 min-h-[220px]"
              style={{ background:"linear-gradient(135deg,#f0fdfa,#e6fffa)", border:"2px dashed #99f6e4" }}>
              <p className="text-xs font-normal text-teal-500 uppercase tracking-widest mb-3">Next Course</p>
              <h3 className="text-xl font-normal text-ink-800 mb-2">Coming Soon</h3>
              <p className="text-sm text-ink-400 max-w-xs leading-relaxed">Something new is in the works. Stay tuned.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── India Regulations Callout ─────────────────────────── */}
      <section className="py-24 lg:py-28 relative overflow-hidden" style={{ background:"linear-gradient(160deg,#091c1a 0%,#0d2b27 60%,#091e1c 100%)" }}>
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage:"radial-gradient(#5eead4 1px,transparent 1px)", backgroundSize:"28px 28px" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <div className="text-teal-400 text-xs font-normal uppercase tracking-widest mb-4">Regulatory Context</div>
            <h2 className="text-4xl font-medium text-white tracking-tight mb-5">India Cosmetic Regulations</h2>
            <p className="text-teal-200/50 text-lg leading-relaxed">The landscape is tightening. Here is what you need to know.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title:"Drugs & Cosmetics Act", desc:"India's primary regulation, governs manufacture, sale, and import. No legal definition of 'clean' or 'natural'.", color:"#5eead4" },
              { title:"INCI Compliance",       desc:"Products sold in India must list ingredients in INCI format. Many brands still don't comply fully.", color:"#4ade80" },
              { title:"EU Banned List",        desc:"The Clean Sheet cross-references the EU's list of 1,328 banned cosmetic substances. India's regulation is far less restrictive.", color:"#fbbf24" },
            ].map(({ title, desc, color }) => (
              <div key={title} className="rounded-2xl p-6" style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${color}25` }}>
                <div className="w-1 h-6 rounded-full mb-4" style={{ background:color }} />
                <h3 className="font-normal text-white text-base mb-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Glossary ─────────────────────────────────────────── */}
      <section id="glossary" className="py-24 pb-32 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <div className="text-teal-600 text-xs font-normal uppercase tracking-widest mb-4">Reference</div>
            <h2 className="text-4xl lg:text-5xl font-medium text-ink-950 tracking-tight mb-4">
              Ingredient glossary
            </h2>
            <p className="text-ink-600 text-lg">
              The terms you need to know when reading a skincare label.
            </p>
          </div>

          <div className="space-y-4">
            {GLOSSARY.map(({ term, full, description, status, examples }) => (
              <div key={term}
                className="bg-white rounded-3xl border border-slate-100 p-7 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 group">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-xl font-normal text-ink-950 group-hover:text-teal-700 transition-colors">{term}</h3>
                    <p className="text-ink-400 text-sm mt-0.5">{full}</p>
                  </div>
                  <StatusBadge status={status} />
                </div>
                <p className="text-ink-600 leading-relaxed text-sm">{description}</p>
                {examples && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {examples.map((ex) => (
                      <span key={ex} className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-full font-mono">
                        {ex}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
