import Link from "next/link";
import {
  Shield, FlaskConical, Award, Eye, Leaf, CheckCircle2,
  ArrowRight, Baby, Sun, Globe, Zap,
} from "lucide-react";

export const metadata = {
  title: "Get Your Beauty Product Certified in India",
  description:
    "India's first science-backed beauty product certification. The Clean Sheet evaluates products across 5 pillars — ingredients, compliance, manufacturing, claims, and ethics. Apply for certification now.",
  keywords: [
    "beauty product certification India", "clean beauty certification", "cosmetic safety certification India",
    "ingredient compliance India", "beauty brand certification", "certified skincare India",
  ],
  alternates: { canonical: "https://thecleansheet.in/certification" },
  openGraph: {
    title: "Get Your Beauty Product Certified | The Clean Sheet™",
    description:
      "India's science-backed cosmetic certification. A rigorous five-pillar evaluation covering ingredients, claims, manufacturing, compliance, and ethics.",
    url: "https://thecleansheet.in/certification",
    type: "website",
  },
};

const SECTIONS = [
  { id: "methodology", label: "Methodology"        },
  { id: "standards",   label: "Standards"          },
  { id: "process",     label: "Process"            },
  { id: "prism",       label: "PRISM"              },
  { id: "registry",    label: "Registry"           },
  { id: "apply",       label: "Apply"              },
];

const LAYERS = [
  {
    num: "01", icon: Shield, color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)",
    name: "Legal Compliance", badge: "Pass / Fail gate", points: null,
    body: "Every ingredient is checked against prohibited and restricted substance lists for your target markets — India, EU, US, Korea, or all of them. If anything fails here, we tell you exactly what and why before proceeding.",
  },
  {
    num: "02", icon: FlaskConical, color: "#14b8a6", bg: "rgba(20,184,166,0.06)", border: "rgba(20,184,166,0.2)",
    name: "Ingredient Safety", badge: "Primary evaluation", points: 50,
    body: "Every ingredient with a concern is assessed for toxicology, endocrine activity, carcinogenicity, and sensitization potential in the context of your specific formula, product type, and consumer profile. Not in isolation.",
  },
  {
    num: "03", icon: Award, color: "#3b82f6", bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.2)",
    name: "Manufacturing & Quality", badge: "Scored dimension", points: 20,
    body: "We review your GMP certification, preservative efficacy data, stability data, and active ingredient assays. A safe formula in a poorly manufactured product is still a problem.",
  },
  {
    num: "04", icon: Eye, color: "#a855f7", bg: "rgba(168,85,247,0.06)", border: "rgba(168,85,247,0.2)",
    name: "Claims", badge: "Scored dimension", points: 20,
    body: "'Clinically proven' has to mean a clinical study. 'SPF 50' has to match a test result. Every claim on your label and in your marketing is assessed against the evidence in your dossier.",
  },
  {
    num: "05", icon: Leaf, color: "#22c55e", bg: "rgba(34,197,94,0.06)", border: "rgba(34,197,94,0.2)",
    name: "Ethics & Sustainability", badge: "Scored dimension", points: 10,
    body: "Cruelty-free status, vegan ingredients, palm oil and mica sourcing, packaging sustainability, and environmental claims. We verify — not just ask.",
  },
];

const STANDARDS = [
  { code: "EU 1223/2009",  full: "EU Cosmetics Regulation (EC) No 1223/2009 and current Annexes II-VI", cat: "Regulation" },
  { code: "India CR 2020", full: "India Cosmetics Rules 2020 (Drugs & Cosmetics Act 1940)", cat: "Regulation" },
  { code: "SCCS/1602/18",  full: "SCCS Notes of Guidance for the Testing of Cosmetic Ingredients", cat: "Safety Science" },
  { code: "CIR",           full: "Cosmetic Ingredient Review, safety assessments database", cat: "Safety Science" },
  { code: "IFRA 49th",     full: "IFRA 49th Amendment (2022), fragrance standards", cat: "Safety Science" },
  { code: "ISO 22716",     full: "ISO 22716:2007, Good Manufacturing Practice for cosmetics", cat: "Manufacturing" },
  { code: "ISO 11930",     full: "ISO 11930:2019, Preservative Efficacy Testing", cat: "Manufacturing" },
  { code: "ISO 24444",     full: "ISO 24444:2010 rev. 2019, SPF in vivo testing", cat: "Testing" },
  { code: "ISO 16128",     full: "ISO 16128, Natural and organic ingredients index", cat: "Testing" },
  { code: "ECHA SVHC",     full: "ECHA Candidate List of Substances of Very High Concern", cat: "Toxicology" },
  { code: "IARC",          full: "IARC carcinogen classifications (Groups 1, 2A, 2B)", cat: "Toxicology" },
  { code: "US FDA 21 CFR", full: "US FDA 21 CFR, cosmetic regulations and prohibited substances", cat: "Regulation" },
  { code: "MFDS Korea",    full: "Korea Ministry of Food and Drug Safety, cosmetic standards", cat: "Regulation" },
];

const PROCESS_STEPS = [
  { step: "Week 1",    title: "Application & NDA",     body: "Submit your application. We agree scope — which products, which markets, which PRISM modules. An NDA is signed. You receive a dossier checklist specific to your product categories.", color: "#14b8a6" },
  { step: "Wks 1-3",  title: "Dossier Submission",    body: "You submit your formula, test data, manufacturing documentation, and marketing materials. We review for completeness. Your formula concentrations are seen only by the scientific panel.", color: "#3b82f6" },
  { step: "Wks 3-9",  title: "Scientific Evaluation", body: "Our independent panel evaluates across all five layers. Questions are routed through your account contact. Evaluators never communicate directly with brands. No informal score discussions.", color: "#a855f7" },
  { step: "Wks 9-10", title: "Result & Certificate",  body: "You receive a full written evaluation report with score breakdown layer by layer. If certified: certificate, badge files, QR code, and public proof page. If not: specific gap analysis.", color: "#f59e0b" },
  { step: "Ongoing",  title: "Post-Certification",    body: "We monitor regulatory developments affecting your certified products. Certificates are valid for two years. Formula or label changes trigger a review.", color: "#22c55e" },
];

const PRISM_MODULES = [
  { icon: Baby,          name: "Baby Safe",         desc: "Paediatric safety margins and mandatory testing for products intended for infants and young children.", color: "#3b82f6" },
  { icon: Sun,           name: "Sun Verified",      desc: "SPF and UVA verification, phototoxic botanical screen, UV filter legality across markets.", color: "#f59e0b" },
  { icon: FlaskConical,  name: "Active Verified",   desc: "Concentration verification and clinical evidence review for products making active ingredient claims.", color: "#14b8a6" },
  { icon: Leaf,          name: "Sensitive Skin",    desc: "Tolerability assessment and patch testing review for products positioned for reactive or sensitised skin.", color: "#22c55e" },
  { icon: Shield,        name: "Pregnancy Safe",    desc: "Teratogen screen and ingredient restriction for products positioned for use during pregnancy.", color: "#a855f7" },
  { icon: CheckCircle2,  name: "Natural & Organic", desc: "ISO 16128 natural origin index calculation and COSMOS-alignment assessment.", color: "#10b981" },
  { icon: Globe,         name: "Vegan Verified",    desc: "Full supply chain vegan assessment — ingredients, processing aids, and testing methodology.", color: "#6366f1" },
];


function ScoreGraphic() {
  const layers = [
    { name: "Legal Compliance",  result: "✓ Pass",  pct: 100, color: "#4ade80" },
    { name: "Ingredient Safety", result: "✓ Clear", pct: 92,  color: "#14b8a6" },
    { name: "Manufacturing",     result: "✓ Clear", pct: 90,  color: "#3b82f6" },
    { name: "Claims",            result: "✓ Clear", pct: 85,  color: "#a855f7" },
    { name: "Ethics",            result: "✓ Clear", pct: 90,  color: "#22c55e" },
  ];
  return (
    <>
      <style>{`
        @keyframes tcs-fadeUp  { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes tcs-barIn   { from { width:0 } to { width: var(--tw) }  }
        @keyframes tcs-glow    { 0%,100% { box-shadow:0 0 18px rgba(250,204,21,0.25) } 50% { box-shadow:0 0 36px rgba(250,204,21,0.5) } }
        @keyframes tcs-ping    { 0%,100% { opacity:1 } 50% { opacity:0.35 } }
        .tcs-bar   { animation: tcs-barIn  1.4s cubic-bezier(.4,0,.2,1) forwards; }
        .tcs-row   { animation: tcs-fadeUp 0.55s ease both; }
        .tcs-gold  { animation: tcs-glow   2.4s ease infinite; }
        .tcs-pulse { animation: tcs-ping   1.4s ease infinite; }
      `}</style>
      <div className="w-full max-w-[500px] mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-black/50 select-none"
        style={{ background:"linear-gradient(155deg,#07201e 0%,#0e2f2b 55%,#081a18 100%)", border:"1px solid rgba(255,255,255,0.07)", fontFamily:"'Geist Mono',ui-monospace,monospace" }}>

        {/* Title bar */}
        <div className="flex items-center px-4 py-3 border-b" style={{ borderColor:"rgba(255,255,255,0.05)", background:"rgba(255,255,255,0.025)" }}>
          <div className="flex gap-1.5">
            {["#ff5f57","#ffbd2e","#28c840"].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background:c }} />)}
          </div>
          <span className="text-[11px] mx-auto" style={{ color:"rgba(255,255,255,0.22)" }}>TCS Certification Engine · v2.1</span>
          <div className="flex items-center gap-1.5">
            <span className="tcs-pulse w-1.5 h-1.5 rounded-full block" style={{ background:"#4ade80" }} />
            <span className="text-[10px]" style={{ color:"rgba(74,222,128,0.7)" }}>live</span>
          </div>
        </div>

        {/* Product */}
        <div className="px-4 py-3 border-b" style={{ borderColor:"rgba(255,255,255,0.04)" }}>
          <div className="text-[9px] uppercase tracking-[0.2em] mb-1" style={{ color:"rgba(255,255,255,0.2)" }}>Certification Run · TCS-2025-00089</div>
          <div className="text-sm" style={{ color:"#5eead4" }}>Daily Hydrating Moisturiser SPF 30</div>
          <div className="text-[10px] mt-0.5" style={{ color:"rgba(255,255,255,0.18)" }}>Leave-on · Face · India + EU markets · 5 layers</div>
        </div>

        {/* Layer bars */}
        <div className="px-4 py-4 space-y-3.5">
          {layers.map(({ name, result, pct, color }, i) => (
            <div key={name} className="tcs-row" style={{ animationDelay:`${i * 0.18}s` }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px]" style={{ color:"rgba(255,255,255,0.42)" }}>{name}</span>
                <span className="text-[10px]" style={{ color }}>{result}</span>
              </div>
              <div className="h-[3px] rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full tcs-bar"
                  style={{ "--tw":`${pct}%`, background:`linear-gradient(90deg,${color}60,${color})`, animationDelay:`${i * 0.18 + 0.4}s` } as React.CSSProperties} />
              </div>
            </div>
          ))}
        </div>

        {/* Certified status */}
        <div className="mx-4 mb-4 rounded-2xl p-4 tcs-row" style={{ animationDelay:"1.1s", background:"rgba(74,222,128,0.06)", border:"1px solid rgba(74,222,128,0.22)" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color:"rgba(74,222,128,0.45)" }}>Certification Outcome</div>
              <div className="flex items-center gap-2">
                <span className="text-xl" style={{ color:"#4ade80" }}>✓</span>
                <span className="text-lg" style={{ color:"#4ade80" }}>CERTIFIED</span>
              </div>
              <div className="text-[10px] mt-1" style={{ color:"rgba(255,255,255,0.25)" }}>Certificate No. TCS-2025-00089</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-widest mb-2" style={{ color:"rgba(255,255,255,0.2)" }}>Valid Until</div>
              <div className="text-sm" style={{ color:"rgba(255,255,255,0.5)" }}>12 Jan 2027</div>
              <div className="text-[9px] mt-1" style={{ color:"rgba(255,255,255,0.2)" }}>QR · Public proof page</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CertificationPage() {
  const catColors: Record<string, { bg: string; text: string; border: string }> = {
    "Regulation":     { bg:"rgba(20,184,166,0.08)",  text:"#5eead4", border:"rgba(20,184,166,0.2)"  },
    "Safety Science": { bg:"rgba(168,85,247,0.08)",  text:"#d8b4fe", border:"rgba(168,85,247,0.2)"  },
    "Manufacturing":  { bg:"rgba(59,130,246,0.08)",  text:"#93c5fd", border:"rgba(59,130,246,0.2)"  },
    "Testing":        { bg:"rgba(245,158,11,0.08)",  text:"#fcd34d", border:"rgba(245,158,11,0.2)"  },
    "Toxicology":     { bg:"rgba(239,68,68,0.08)",   text:"#fca5a5", border:"rgba(239,68,68,0.2)"   },
  };

  return (
    <div className="bg-white">
      <style>{`
        @keyframes cert-fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes cert-lineGrow { from { height:0 } to { height:100% } }
        .cert-reveal  { animation: cert-fadeUp  0.6s ease both; }
        .cert-line    { animation: cert-lineGrow 1.2s ease forwards; }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background:"linear-gradient(135deg,#07201e 0%,#0e3330 45%,#0a1f1d 100%)", minHeight:"100svh", display:"flex", alignItems:"center" }}>
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage:"radial-gradient(#5eead4 1px,transparent 1px)", backgroundSize:"26px 26px" }} />
        {/* Glow accents */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(20,184,166,0.12) 0%,transparent 65%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(168,85,247,0.08) 0%,transparent 65%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left */}
            <div className="cert-reveal" style={{ animationDelay:"0.1s" }}>
              <div className="inline-flex items-center gap-2 text-teal-400 text-xs font-normal mb-8 uppercase tracking-[0.2em]">
                <Zap size={12} /> Science-backed · Independently assessed · Publicly documented
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.04] text-white mb-6">
                Our Certification
                <br />
                <span style={{ background:"linear-gradient(90deg,#5eead4,#99f6e4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Methodology.</span>
              </h1>
              <p className="text-teal-200/70 text-lg sm:text-xl leading-relaxed max-w-xl mb-10">
                The Clean Sheet evaluation is based on established international safety science. We don&apos;t invent our own safety thresholds. We apply the best available evidence from recognised regulatory and scientific bodies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#methodology"
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-normal px-7 py-3.5 rounded-2xl transition-all text-sm hover:shadow-lg hover:shadow-teal-500/25">
                  Read the methodology <ArrowRight size={15} />
                </a>
                <a href="#get-certified"
                  className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white font-normal px-7 py-3.5 rounded-2xl transition-all text-sm">
                  Apply for certification
                </a>
              </div>

              {/* Quick stats */}
              <div className="mt-12 grid grid-cols-3 gap-4">
                {[
                  { n: "5",   label: "Evaluation layers" },
                  { n: "13",  label: "Standards referenced" },
                  { n: "7",   label: "PRISM modules" },
                ].map(({ n, label }) => (
                  <div key={label} className="border rounded-2xl p-4 text-center" style={{ borderColor:"rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.03)" }}>
                    <div className="text-3xl text-teal-300 mb-1">{n}</div>
                    <div className="text-[11px] text-teal-400/60 leading-tight">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — graphic */}
            <div className="cert-reveal" style={{ animationDelay:"0.35s" }}>
              <ScoreGraphic />
            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky section nav ───────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            {SECTIONS.map(({ id, label }) => (
              <a key={id} href={`#${id}`}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-normal text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-all">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Methodology ──────────────────────────────────────── */}
      <section id="methodology" className="py-24 lg:py-32 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <div className="text-teal-600 text-xs font-normal uppercase tracking-widest mb-4">Five Evaluation Layers</div>
            <h2 className="text-4xl lg:text-5xl font-medium text-ink-950 tracking-tight mb-5">
              What we evaluate.
            </h2>
            <p className="text-ink-600 text-lg leading-relaxed">
              Every product is assessed across five layers. The first is a pass/fail gate. The remaining four contribute to your 0-100 score. No exceptions.
            </p>
          </div>

          <div className="space-y-4 max-w-4xl">
            {LAYERS.map(({ num, icon: Icon, color, bg, border, name, badge, points, body }) => (
              <div key={name}
                className="group relative flex gap-6 rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:shadow-xl"
                style={{ background: bg, border:`1px solid ${border}` }}>
                {/* Big number watermark */}
                <div className="absolute right-8 top-4 text-8xl select-none pointer-events-none"
                  style={{ color, opacity:0.06, fontFamily:"ui-monospace,monospace", lineHeight:1 }}>{num}</div>

                <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${color}18`, border:`1px solid ${color}30` }}>
                  <Icon size={22} style={{ color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="font-medium text-ink-950 text-lg">{name}</h3>
                    <span className="text-xs font-normal px-2.5 py-1 rounded-full"
                      style={points === null
                        ? { background:"rgba(239,68,68,0.12)", color:"#ef4444", border:"1px solid rgba(239,68,68,0.25)" }
                        : { background:"rgba(34,197,94,0.12)", color:"#16a34a", border:"1px solid rgba(34,197,94,0.25)" }}>
                      {badge}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{body}</p>
                  {points !== null && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(0,0,0,0.08)" }}>
                        <div className="h-full rounded-full" style={{ width:`${points}%`, background:color }} />
                      </div>
                      <span className="text-xs font-normal" style={{ color }}>{points} pts</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Outcome */}
          <div className="mt-20 max-w-4xl">
            <h3 className="text-2xl font-medium text-ink-950 mb-8">Certification outcomes.</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl p-6 flex items-start gap-4" style={{ background:"rgba(74,222,128,0.06)", border:"1px solid rgba(74,222,128,0.2)" }}>
                <span className="text-3xl text-green-500 flex-shrink-0">✓</span>
                <div>
                  <div className="font-medium text-ink-950 text-lg mb-1">Certified</div>
                  <p className="text-slate-600 text-sm leading-relaxed">The product meets The Clean Sheet standard. You receive a certificate, badge, QR code, and public proof page with full evaluation details.</p>
                </div>
              </div>
              <div className="rounded-2xl p-6 flex items-start gap-4" style={{ background:"rgba(239,68,68,0.04)", border:"1px solid rgba(239,68,68,0.15)" }}>
                <span className="text-3xl text-red-400 flex-shrink-0">✗</span>
                <div>
                  <div className="font-medium text-ink-950 text-lg mb-1">Not Certified</div>
                  <p className="text-slate-600 text-sm leading-relaxed">The product does not meet the standard. You receive a full written evaluation report with specific gaps identified and a clear re-application path.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Standards ────────────────────────────────────────── */}
      <section id="standards" className="py-24 lg:py-28 scroll-mt-28" style={{ background:"linear-gradient(135deg,#07201e 0%,#0a2a28 100%)" }}>
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage:"radial-gradient(#5eead4 1px,transparent 1px)", backgroundSize:"24px 24px", pointerEvents:"none" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <div className="text-teal-400 text-xs font-normal uppercase tracking-widest mb-4">Reference Standards</div>
            <h2 className="text-4xl font-medium text-white tracking-tight mb-5">
              Standards we reference.
            </h2>
            <p className="text-teal-200/60 text-lg leading-relaxed">
              We don&apos;t set our own safety thresholds. We apply the best available evidence from the world&apos;s leading cosmetic safety bodies. Every standard is documented and publicly accessible.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {STANDARDS.map(({ code, full, cat }) => {
              const cs = catColors[cat];
              return (
                <div key={code} className="rounded-2xl p-4 flex items-start gap-3 hover:scale-[1.01] transition-transform duration-200"
                  style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex-shrink-0">
                    <span className="block text-[10px] font-normal px-2 py-1 rounded-lg font-mono"
                      style={{ background:cs.bg, color:cs.text, border:`1px solid ${cs.border}` }}>
                      {code}
                    </span>
                  </div>
                  <p className="text-teal-200/50 text-xs leading-relaxed pt-0.5">{full}</p>
                </div>
              );
            })}
          </div>

          {/* Who evaluates */}
          <div className="mt-14 rounded-3xl p-8 max-w-3xl" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)" }}>
            <h3 className="font-medium text-white text-xl mb-4">Who evaluates.</h3>
            <p className="text-teal-200/60 leading-relaxed mb-4">
              Evaluations are conducted by an independent panel of experts, including cosmetic scientists, toxicologists, and dermatologists. Panel members have no commercial relationship with applying brands. Conflicts of interest are declared and managed.
            </p>
            <p className="text-teal-200/60 leading-relaxed">
              Panel members are named on our About page because transparency about who evaluates is part of what makes the standard credible.
            </p>
          </div>
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────────── */}
      <section id="process" className="py-24 lg:py-32 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <div className="text-teal-600 text-xs font-normal uppercase tracking-widest mb-4">Timeline</div>
            <h2 className="text-4xl font-medium text-ink-950 tracking-tight mb-5">The process.</h2>
            <p className="text-ink-600 text-lg leading-relaxed">
              Six to ten weeks from complete dossier submission to certification decision. Five stages. Every product goes through all of them.
            </p>
          </div>

          <div className="relative max-w-3xl">
            {/* Animated connector line */}
            <div className="absolute left-[23px] top-12 bottom-12 w-[2px] hidden sm:block overflow-hidden" style={{ background:"rgba(0,0,0,0.06)" }}>
              <div className="cert-line w-full" style={{ background:"linear-gradient(to bottom,#14b8a6,#a855f7)", opacity:0.5 }} />
            </div>

            <div className="space-y-5">
              {PROCESS_STEPS.map(({ step, title, body, color }, i) => (
                <div key={step} className="flex gap-5 sm:gap-8 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full text-white text-sm font-normal flex items-center justify-center z-10 shadow-lg transition-all duration-300 group-hover:scale-110"
                    style={{ background:`linear-gradient(135deg,${color}cc,${color})`, boxShadow:`0 4px 16px ${color}40` }}>
                    {i + 1}
                  </div>
                  <div className="rounded-3xl p-6 flex-1 border border-slate-100 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50 transition-all duration-300 bg-white">
                    <div className="text-[10px] font-normal uppercase tracking-widest mb-1" style={{ color }}>{step}</div>
                    <h3 className="font-medium text-ink-950 text-base mb-2">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRISM Modules ────────────────────────────────────── */}
      <section id="prism" className="py-24 lg:py-28 scroll-mt-28 relative overflow-hidden" style={{ background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)" }}>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage:"radial-gradient(#818cf8 1px,transparent 1px)", backgroundSize:"32px 32px" }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 65%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="text-indigo-400 text-xs font-normal uppercase tracking-widest mb-4">Specialist Certification</div>
              <div className="inline-flex flex-col mb-5">
                <span className="text-3xl font-medium text-white tracking-tight">PRISM Standard™</span>
                <span className="text-indigo-300/50 text-sm mt-1">Product Review for Ingredient Safety and Marketing Integrity</span>
              </div>
              <p className="text-indigo-200/70 text-lg leading-relaxed mb-6">
                Baby care, sunscreens, clinical actives, products for sensitive skin — these categories carry higher consumer trust stakes. PRISM modules are specialist add-ons to Core certification that apply a deeper evaluation where it matters most.
              </p>
              <p className="text-indigo-300/40 text-base leading-relaxed mb-8">
                PRISM modules appear as additional verified badges on your public proof page, alongside your Core certification status.
              </p>
              <a href="#apply" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-normal px-6 py-3 rounded-2xl transition-all text-sm">
                Apply with PRISM add-ons <ArrowRight size={14} />
              </a>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {PRISM_MODULES.map(({ icon: Icon, name, desc, color }) => (
                <div key={name}
                  className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-default"
                  style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", backdropFilter:"blur(4px)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background:`${color}18`, border:`1px solid ${color}30` }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <h3 className="font-medium text-white text-sm mb-1.5">{name}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Certified Registry ───────────────────────────────── */}
      <section id="registry" className="py-24 lg:py-32 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <div className="text-teal-600 text-xs font-normal uppercase tracking-widest mb-4">Public Registry</div>
            <h2 className="text-4xl font-medium text-ink-950 tracking-tight mb-5">Certified products.</h2>
            <p className="text-ink-600 text-lg leading-relaxed">
              Every certified product has a public proof page — score, tier, verified claims, certificate details. Anyone can verify any certified product at any time, via QR code or search.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl">
            {/* Coming soon card */}
            <div className="rounded-3xl p-12 text-center flex flex-col items-center justify-center"
              style={{ background:"linear-gradient(135deg,#f0fdfa,#e6fffa)", border:"2px dashed #99f6e4" }}>
              <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center mx-auto mb-6">
                <Award size={28} className="text-teal-600" />
              </div>
              <h3 className="text-xl font-medium text-ink-950 mb-3">Registry launching soon.</h3>
              <p className="text-ink-500 text-sm leading-relaxed max-w-xs mx-auto mb-6">
                We are currently evaluating our founding cohort of brands. Certified products will appear here once the first certifications are issued.
              </p>
              <Link href="/certified"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-normal px-6 py-3 rounded-2xl transition-all text-sm">
                Go to Verify Page <ArrowRight size={14} />
              </Link>
            </div>

            {/* What every proof page shows */}
            <div className="rounded-3xl p-8 border border-slate-100 bg-white shadow-sm">
              <h3 className="font-medium text-ink-950 text-lg mb-6">What every proof page publishes.</h3>
              <div className="space-y-3">
                {[
                  "Product name, brand, and category",
                  "Certification tier and total score (0-100)",
                  "Score breakdown by layer",
                  "PRISM modules assessed",
                  "Target markets evaluated for",
                  "Verified claims list",
                  "Certificate number, issue date, and expiry",
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={15} className="text-teal-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600 text-sm">{item}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 pt-2 border-t border-slate-100 mt-2">
                  <div className="w-4 h-4 flex-shrink-0 mt-0.5 rounded-full border-2 border-slate-200" />
                  <span className="text-slate-400 text-sm">Formula concentrations and commercially sensitive dossier content are never published.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Apply ────────────────────────────────────────────── */}
      <section id="apply" className="py-24 lg:py-28 scroll-mt-28 relative overflow-hidden" style={{ background:"linear-gradient(135deg,#0c1f1d 0%,#0f2e2b 100%)" }}>
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(20,184,166,0.1) 0%,transparent 60%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-medium text-white tracking-tight mb-6">
                Start the conversation.
              </h2>
              <p className="text-teal-200/70 text-lg leading-relaxed mb-4">
                Tell us about your brand and the products you want to certify. We&apos;ll follow up within 2 business days to discuss scope, timeline, and fees.
              </p>
              <p className="text-teal-300/40 text-base leading-relaxed mb-8">
                There is no minimum. Some brands certify one hero product first and expand from there.
              </p>
              <a href="#get-certified"
                className="inline-flex items-center justify-center gap-2 bg-coral-500 hover:bg-coral-600 text-white font-normal px-8 py-4 rounded-2xl transition-all hover:shadow-xl hover:shadow-coral-500/30 active:scale-[0.98] text-lg">
                Apply for Certification <ArrowRight size={18} />
              </a>
              <p className="text-teal-400/50 text-sm mt-5">
                Or email{" "}
                <a href="mailto:hello@thecleansheet.in" className="text-teal-400 hover:text-teal-200 underline">
                  hello@thecleansheet.in
                </a>
              </p>
            </div>

            <div className="space-y-4">
              {[
                { q: "Is our formula kept confidential?", a: "Yes. All formula information is covered by the NDA signed before dossier submission. Concentrations are never published." },
                { q: "What if we don't pass?", a: "You receive a full evaluation report regardless. Most brands that don't pass re-apply after addressing documentation gaps, not fundamental formulation problems." },
                { q: "How long does it take?", a: "6-10 weeks from complete dossier submission. Expedited assessment (3-4 weeks) is available at an additional fee." },
                { q: "Can we certify a single product?", a: "Yes. There is no minimum number of products." },
              ].map(({ q, a }) => (
                <div key={q} className="rounded-2xl p-5 transition-all hover:scale-[1.01] duration-200"
                  style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)" }}>
                  <h4 className="text-white font-normal text-sm mb-2">{q}</h4>
                  <p className="text-teal-200/50 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
