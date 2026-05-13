import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2, ArrowRight, Award, Shield, FlaskConical, Eye, Leaf,
  QrCode, FileText, RefreshCw, Users, Star, Zap, ChevronDown, Baby,
  Sun, FlaskRound, Flower2, Globe
} from "lucide-react";

function GraphicWhyItMatters() {
  const bars = [
    { year: "2021", h: 38, active: false },
    { year: "2022", h: 52, active: false },
    { year: "2023", h: 68, active: false },
    { year: "2024", h: 84, active: false },
    { year: "2025", h: 100, active: true  },
  ];
  return (
    <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl shadow-teal-900/20 flex flex-col"
      style={{ background: "linear-gradient(140deg, #0a1f1c 0%, #0f3d38 55%, #0a2420 100%)" }}>
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(#5eead4 1px, transparent 1px), linear-gradient(90deg, #5eead4 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #14b8a6, transparent)" }} />
      <div className="relative z-10 flex items-center justify-between px-6 pt-5 pb-2">
        <div>
          <div className="text-teal-300/60 text-[9px] font-medium uppercase tracking-[0.2em]">India Beauty Market</div>
          <div className="text-white text-base font-semibold mt-0.5">
            18<span className="text-teal-400">%</span>
            <span className="text-teal-300/70 text-[11px] font-normal ml-1.5">annual growth</span>
          </div>
        </div>
        <div className="bg-teal-400/10 border border-teal-400/20 rounded-xl px-3 py-1.5">
          <div className="text-teal-300 text-[9px] font-medium uppercase tracking-widest">Trust Gap ↑</div>
        </div>
      </div>
      <div className="relative z-10 flex items-end justify-center gap-3 px-6 flex-1 pb-4">
        {bars.map(({ year, h, active }) => (
          <div key={year} className="flex flex-col items-center gap-1.5 flex-1">
            <div className="w-full rounded-t-lg transition-all relative"
              style={{
                height: `${h * 0.72}px`,
                background: active
                  ? "linear-gradient(180deg, #2dd4bf 0%, #0d9488 100%)"
                  : "linear-gradient(180deg, #134e4a 0%, #0f3d38 100%)",
                border: active ? "1px solid #2dd4bf55" : "1px solid #1a5c5640",
              }}>
              {active && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-teal-400 text-ink-950 text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                  18% ↑
                </div>
              )}
            </div>
            <div className="text-[9px] font-normal" style={{ color: active ? "#5eead4" : "#4d7c78" }}>{year}</div>
          </div>
        ))}
      </div>
      <div className="relative z-10 flex items-center gap-3 px-5 pb-5">
        <div className="flex-1 bg-red-950/40 border border-red-500/20 rounded-xl px-3 py-2.5">
          <div className="text-red-400 text-[9px] font-medium uppercase tracking-widest mb-0.5">Without proof</div>
          <div className="text-red-300/70 text-[10px] font-medium">&ldquo;Natural™&rdquo; claims backfiring</div>
        </div>
        <div className="text-teal-400/50 font-semibold text-sm flex-shrink-0">→</div>
        <div className="flex-1 bg-teal-400/10 border border-teal-400/25 rounded-xl px-3 py-2.5">
          <div className="text-teal-300 text-[9px] font-medium uppercase tracking-widest mb-0.5">With proof</div>
          <div className="text-teal-200/80 text-[10px] font-medium">Score 91 · GOLD ✦</div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "For Brands | The Clean Sheet™",
  description: "Get your beauty products independently certified by India's first science-backed certification body.",
};

const WHY_ITEMS = [
  {
    icon: Zap,
    title: "Differentiate where it matters most",
    description:
      "Every brand claims 'clean'. Almost none can prove it. TCS certification is the signal that separates serious brands from marketing-led ones. In a crowded D2C market, it's a moat.",
  },
  {
    icon: QrCode,
    title: "Build consumer trust permanently",
    description:
      "A TCS QR code on your product gives every consumer access to your full evaluation, instantly, at point of purchase. Trust doesn't have to be earned again with every new customer. The proof does it for you.",
  },
  {
    icon: FileText,
    title: "Get retail-ready",
    description:
      "Organised retail is increasingly asking brands for claim substantiation documentation. A TCS evaluation report and certificate is the most comprehensive response you can give a buyer.",
  },
  {
    icon: Globe,
    title: "Export with confidence",
    description:
      "TCS evaluations cover India, EU, US, and Korean regulatory standards simultaneously. When you're ready to expand, you already have a documented compliance assessment for each market.",
  },
];

const LAYERS = [
  {
    num: "01",
    icon: Shield,
    name: "Legal Compliance",
    badge: "Pass/Fail gate",
    badgeColor: "text-coral-600 bg-coral-50 border-coral-200",
    description:
      "We check every ingredient against the relevant prohibited and restricted substance lists for your target markets, India, EU, US, Korea, or all of them. If anything fails here, we tell you exactly what and why before proceeding.",
    points: null,
  },
  {
    num: "02",
    icon: FlaskConical,
    name: "Ingredient Safety",
    badge: "50 points",
    badgeColor: "text-teal-700 bg-teal-50 border-teal-200",
    description:
      "This is the core of our evaluation. We assess every ingredient with a concern, toxicology, endocrine activity, carcinogenicity, sensitization potential, systemic exposure. Not in isolation: in the context of your specific formula, product type, and consumer.",
    points: 50,
  },
  {
    num: "03",
    icon: Award,
    name: "Manufacturing and Quality",
    badge: "20 points",
    badgeColor: "text-teal-700 bg-teal-50 border-teal-200",
    description:
      "We review your GMP certification, preservative efficacy data, stability data, and active ingredient assays. A safe formula in a poorly manufactured product is still a problem.",
    points: 20,
  },
  {
    num: "04",
    icon: Eye,
    name: "Claims",
    badge: "20 points",
    badgeColor: "text-teal-700 bg-teal-50 border-teal-200",
    description:
      "'Clinically proven' has to mean a clinical study. 'SPF 50' has to match a test result. 'Organic' has to be certified. Every claim on your label and marketing is assessed against the evidence in your dossier. We verify all of it.",
    points: 20,
  },
  {
    num: "05",
    icon: Leaf,
    name: "Ethics and Sustainability",
    badge: "10 points",
    badgeColor: "text-safe-600 bg-safe-50 border-safe-200",
    description:
      "Cruelty-free status, vegan ingredients, palm oil and mica sourcing, packaging sustainability, and environmental claims. Not the whole score, but an important part of it.",
    points: 10,
  },
];

const PRISM_MODULES = [
  { icon: Baby,       name: "Baby Safe",         desc: "Paediatric safety margins and mandatory testing for products intended for infants." },
  { icon: Sun,        name: "Sun Verified",       desc: "SPF and UVA verification, phototoxic botanical screen, UV filter legality." },
  { icon: FlaskRound, name: "Active Verified",    desc: "Concentration verification and evidence review for clinical actives." },
  { icon: Flower2,    name: "Sensitive Skin",     desc: "Tolerability assessment for sensitised and reactive skin claims." },
  { icon: Shield,     name: "Pregnancy Safe",     desc: "Teratogen screen, ingredient restriction for pregnancy-positioned products." },
  { icon: Leaf,       name: "Natural & Organic",  desc: "ISO 16128 natural origin index, COSMOS-alignment assessment." },
  { icon: CheckCircle2, name: "Vegan Verified",   desc: "Full supply chain vegan assessment." },
];

const PROCESS_STEPS = [
  {
    step: "Week 1",
    title: "Application",
    description:
      "Submit your application and NDA. We agree scope, which products, which markets, which PRISM modules. You receive a dossier checklist specific to your product categories.",
  },
  {
    step: "Weeks 1-3",
    title: "Dossier Submission",
    description:
      "You submit your formula, test data, manufacturing documentation, and marketing materials. We review for completeness and request any missing items. Your formula is protected by NDA, only the scientific panel sees it.",
  },
  {
    step: "Weeks 3-9",
    title: "Evaluation",
    description:
      "Our panel evaluates your product across all five layers. If we have questions, we route them through your account contact, evaluators never communicate directly with brands. No informal conversations about scores.",
  },
  {
    step: "Weeks 9-10",
    title: "Result",
    description:
      "You receive a full written evaluation report with your score breakdown, layer by layer. If certified, you receive your certificate, badge files, QR code, and consumer proof page. If not certified, you receive a specific gap analysis and path to re-application.",
  },
  {
    step: "Ongoing",
    title: "Post-Certification",
    description:
      "We monitor regulatory developments affecting your certified products and alert you to anything that requires action. You notify us of formula or label changes. Your certificate is valid for two years.",
  },
];

const TIERS = [
  {
    icon: "✦",
    name: "Gold",
    range: "90-100",
    textColor: "text-ink-950",
    bg: "bg-yellow-400",
    border: "border-yellow-400",
    highlight: true,
    desc: "Best-in-class across every dimension. Exceptional safety profile, strong clinical evidence, excellent manufacturing, and meaningful ethics commitments.",
    perks: ["Premium Gold badge", "Priority listing in registry", "Press release support", "Marketing toolkit"],
  },
  {
    icon: "✓",
    name: "Silver",
    range: "75-89",
    textColor: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
    highlight: false,
    desc: "A strong product with solid documentation. Meets a high standard with minor gaps in one or two areas.",
    perks: ["Silver certification badge", "Directory listing", "QR scorecard link", "Annual re-evaluation"],
  },
  {
    icon: "◎",
    name: "Certified",
    range: "60-74",
    textColor: "text-caution-600",
    bg: "bg-caution-50",
    border: "border-caution-200",
    highlight: false,
    desc: "Meets The Clean Sheet standard. Safe, compliant, honest claims, adequate manufacturing quality.",
    perks: ["Certified badge", "Improvement roadmap", "Re-submission path", "Formulation guidance"],
  },
];

const FAQS = [
  {
    q: "Is our formula kept confidential?",
    a: "Yes. All formula information is covered by the NDA signed before your dossier is submitted. Your formula concentrations are never published, only your score, tier, and verified claims are public.",
  },
  {
    q: "What if we don't pass?",
    a: "You receive a full evaluation report regardless. Most brands that don't pass the first time re-apply after addressing specific gaps, usually documentation issues, not fundamental formulation problems.",
  },
  {
    q: "How long does it take?",
    a: "6-10 weeks from complete dossier submission to certification decision. Expedited assessment (3-4 weeks) is available for an additional fee.",
  },
  {
    q: "Can we certify a single product?",
    a: "Yes. There is no minimum. Some brands certify one hero product first and expand from there.",
  },
];

export default function BrandsPage() {
  return (
    <div className="bg-white">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-[640px] flex items-center overflow-hidden">
        <Image
          src="/images/cierra-henderson-LWIQp-0_b98-unsplash.jpg"
          alt="Clean beauty product"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-teal-950/90" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-teal-200 text-xs sm:text-sm font-medium px-3 py-1 sm:px-4 sm:py-1.5 rounded-full mb-6 sm:mb-8 backdrop-blur-sm">
              <Users size={13} />
              For Brands &amp; Manufacturers
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-medium tracking-tight leading-tight mb-4 sm:mb-6" style={{ color: '#ffffff' }}>
              Independent proof that your
              <br />
              <span style={{ color: '#5eead4' }}>product is what it claims to be.</span>
            </h1>
            <p className="text-teal-200 text-base sm:text-xl leading-relaxed mb-7 sm:mb-10 max-w-xl">
              The Clean Sheet evaluates your formula, your claims, and your manufacturing, and publishes the results. Brands that certify aren&apos;t just safe. They&apos;re proven.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                href="#get-certified"
                className="flex items-center justify-center gap-2 bg-coral-500 hover:bg-coral-600 text-white font-normal px-6 py-3.5 sm:px-7 sm:py-4 rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-coral-500/30 active:scale-[0.98] text-sm sm:text-base"
              >
                Apply for Certification
                <ArrowRight size={15} />
              </a>
              <a
                href="#process"
                className="flex items-center justify-center gap-2 border border-white/30 hover:border-white/60 text-white font-medium px-6 py-3.5 sm:px-7 sm:py-4 rounded-2xl transition-all duration-200 backdrop-blur-sm text-sm sm:text-base"
              >
                See the Process
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────── */}
      <div className="bg-teal-900 py-4 sm:py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-16">
            {[
              { value: "0-100", label: "Transparent scoring" },
              { value: "5 layers", label: "Legal · Safety · Manufacturing · Claims · Ethics" },
              { value: "EU / US / India / Korea", label: "Multi-regulatory reference" },
              { value: "QR verified", label: "Consumer-facing proof pages" },
            ].map(({ value, label }) => (
              <div key={value} className="text-center">
                <div className="text-teal-300 font-medium text-sm sm:text-lg">{value}</div>
                <div className="text-teal-500 text-[10px] sm:text-xs mt-0.5 leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Why certify ───────────────────────────────────── */}
      <section className="py-14 sm:py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-12 sm:mb-20">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-ink-950 tracking-tight mb-4 sm:mb-6">
                Why certify?
              </h2>
              <p className="text-ink-600 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                The Indian beauty market is growing at 18% annually. But consumer trust is the
                new battleground, and &ldquo;clean&rdquo; claims without evidence are backfiring.
              </p>
              <p className="text-ink-600 text-base sm:text-lg leading-relaxed">
                TCS certification is not a marketing tool. It&apos;s a technical standard. Brands that
                earn it stand apart in a crowded market with proof, not promises.
              </p>
            </div>
            <GraphicWhyItMatters />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_ITEMS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-3xl p-6 border border-teal-100 hover:shadow-lg hover:shadow-teal-100 transition-all duration-300 hover:-translate-y-1">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-teal-600" />
                </div>
                <h3 className="font-medium text-ink-950 mb-2">{title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What We Evaluate (5 layers) ───────────────────── */}
      <section className="py-14 sm:py-24 lg:py-28 bg-ink-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-yellow-400 text-sm font-medium mb-4 uppercase tracking-wide">
              <Star size={14} /> What We Evaluate
            </div>
            <h2 className="text-4xl lg:text-5xl font-medium tracking-tight mb-4 text-white">
              Five layers of evaluation.
            </h2>
            <p className="text-teal-300 text-lg max-w-xl mx-auto">
              Every product goes through all five. There are no shortcuts.
            </p>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {LAYERS.map(({ num, icon: Icon, name, badge, badgeColor, description, points }) => (
              <div key={name} className="group bg-white/5 border border-white/10 hover:border-teal-400/30 rounded-3xl p-6 sm:p-8 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="text-4xl font-semibold text-white/10 leading-none flex-shrink-0 w-12">{num}</div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-600/20 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon size={17} className="text-teal-400" />
                      </div>
                      <h3 className="text-white font-medium text-lg">{name}</h3>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${badgeColor}`}>
                        {badge}
                      </span>
                    </div>
                    <p className="text-teal-200/70 text-sm leading-relaxed">{description}</p>
                    {points !== null && (
                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-teal-500" style={{ width: `${points}%` }} />
                        </div>
                        <span className="text-teal-400 text-xs font-medium">{points} pts</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRISM Modules ─────────────────────────────────── */}
      <section className="py-14 sm:py-24 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 text-teal-600 text-sm font-normal mb-4 uppercase tracking-wide">
                Specialist Certification
              </div>
              <h2 className="text-4xl lg:text-5xl font-medium text-ink-950 tracking-tight mb-6">
                PRISM Modules.
              </h2>
              <p className="text-ink-600 text-lg leading-relaxed mb-6">
                Some products, baby care, sunscreens, clinical actives, products for sensitive skin, carry higher consumer trust stakes. Our PRISM modules are specialist add-ons to Core certification that apply a deeper evaluation in the areas that matter most.
              </p>
              <p className="text-ink-500 text-base leading-relaxed">
                PRISM modules are assessed alongside Core certification and appear as additional verified badges on your proof page.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {PRISM_MODULES.map(({ icon: Icon, name, desc }) => (
                <div key={name} className="bg-teal-50 border border-teal-100 rounded-2xl p-5 hover:border-teal-300 hover:shadow-md transition-all duration-200">
                  <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center mb-3">
                    <Icon size={16} className="text-white" />
                  </div>
                  <h3 className="font-medium text-ink-900 text-sm mb-1.5">{name}</h3>
                  <p className="text-ink-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────── */}
      <section id="process" className="py-14 sm:py-24 lg:py-28 bg-ink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-medium text-ink-950 tracking-tight mb-4">
              The certification process.
            </h2>
            <p className="text-ink-600 text-lg max-w-xl mx-auto">
              Five stages. Every product goes through all of them. No shortcuts.
            </p>
          </div>
          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-teal-100 hidden sm:block" />
            <div className="space-y-6">
              {PROCESS_STEPS.map(({ step, title, description }, i) => (
                <div key={step} className="relative flex gap-6 sm:gap-8">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-600 border-4 border-white text-white font-medium text-xs flex items-center justify-center z-10 shadow-lg">
                    {i + 1}
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-ink-100 hover:border-teal-200 hover:shadow-md transition-all duration-200 flex-1">
                    <div className="text-teal-600 text-xs font-medium uppercase tracking-widest mb-1">{step}</div>
                    <h3 className="font-medium text-ink-950 text-lg mb-2">{title}</h3>
                    <p className="text-ink-500 text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tiers ─────────────────────────────────────────── */}
      <section id="tiers" className="relative py-14 sm:py-24 lg:py-28 overflow-hidden bg-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-medium text-ink-950 tracking-tight mb-4">
              Certification tiers.
            </h2>
            <p className="text-ink-600 text-lg max-w-xl mx-auto">
              Your score determines your tier. The tier reflects the real safety and transparency
              of your formulation, not your marketing budget.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {TIERS.map(({ icon, name, range, textColor, bg, border, highlight, desc, perks }) => (
              <div
                key={name}
                className={`rounded-3xl p-8 border-2 ${border} ${bg} ${highlight ? "ring-2 ring-yellow-400 ring-offset-4" : ""} relative`}
              >
                {highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-500 text-ink-950 text-xs font-semibold px-4 py-1 rounded-full tracking-wide">
                    MOST SOUGHT AFTER
                  </div>
                )}
                <div className={`text-4xl mb-3 ${textColor}`}>{icon}</div>
                <div className={`text-2xl font-medium mb-0.5 ${textColor}`}>{name}</div>
                <div className={`text-sm font-mono ${textColor} opacity-70 mb-3`}>{range} points</div>
                <p className="text-ink-600 text-sm leading-relaxed mb-6">{desc}</p>
                <ul className="space-y-3">
                  {perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2.5 text-ink-700 text-sm">
                      <CheckCircle2 size={15} className="text-teal-500 flex-shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="max-w-3xl mx-auto bg-ink-50 border border-ink-100 rounded-2xl p-6 text-center">
            <div className="text-ink-950 font-medium mb-1">Not Certified, Below 60</div>
            <p className="text-ink-500 text-sm">Did not meet the standard. We tell brands exactly why, and exactly what would need to change. You receive a full evaluation report regardless.</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-ink-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-medium text-white tracking-tight mb-3">
              Common questions.
            </h2>
          </div>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-medium mb-3">{q}</h3>
                <p className="text-teal-200/70 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / Apply ───────────────────────────────── */}
      <section id="contact" className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-xl">
              <Image
                src="/images/reuben-mansell-nwOip8AOZz0-unsplash.jpg"
                alt="Product packaging quality"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-teal-950/60 to-transparent" />
              <div className="absolute top-6 left-6">
                <div className="bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm font-normal px-4 py-2 rounded-xl">
                  Founding Cohort, Open
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-4xl lg:text-5xl font-medium text-ink-950 tracking-tight mb-4">
                Start the conversation.
              </h2>
              <p className="text-ink-600 text-lg leading-relaxed mb-8">
                Tell us about your brand and the products you want to certify. We&apos;ll follow up within 2 business days to discuss scope, timeline, and fees.
              </p>
              <div className="space-y-4">
                <a
                  id="apply"
                  href="#get-certified"
                  className="flex items-center justify-center gap-2.5 bg-coral-500 hover:bg-coral-600 text-white font-normal px-8 py-4 rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-coral-500/30 active:scale-[0.98] text-lg w-full sm:w-auto sm:inline-flex"
                >
                  Apply for Certification
                  <ArrowRight size={18} />
                </a>
                <p className="text-ink-400 text-sm">
                  Or email us at{" "}
                  <a href="mailto:hello@thecleansheet.in" className="text-teal-600 hover:underline">
                    hello@thecleansheet.in
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
