import Image from "next/image";
import Link from "next/link";
import {
  Shield, FlaskConical, Eye, Leaf, Scale,
  ArrowRight, CheckCircle2, FileText, Microscope,
  Award, AlertTriangle, BookOpen,
} from "lucide-react";

export const metadata = {
  title: "Our Methodology — How We Score Beauty Products",
  description:
    "Science-backed. Independently assessed. Publicly documented. Learn exactly how The Clean Sheet evaluates beauty products across 5 pillars: ingredient safety, legal compliance, manufacturing, claims, and ethics.",
  keywords: [
    "clean beauty scoring methodology", "cosmetic safety assessment India",
    "ingredient risk rating", "how to check skincare safety", "beauty product evaluation criteria",
  ],
  alternates: { canonical: "https://thecleansheet.in/methodology" },
  openGraph: {
    title: "Our Methodology — How We Score Beauty Products | The Clean Sheet™",
    description:
      "Five scoring pillars. Zero brand bias. See exactly how we evaluate every product from ingredient safety to manufacturing standards.",
    url: "https://thecleansheet.in/methodology",
    type: "website",
  },
};

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-teal-600 bg-teal-50 border border-teal-200 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
              <Microscope size={14} />
              Our Methodology
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium text-ink-950 tracking-tight leading-tight mb-8">
              Science-backed.
              <br />
              <span className="text-gradient-teal">Publicly documented.</span>
            </h1>
            <p className="text-xl text-ink-600 leading-relaxed max-w-xl">
              The Clean Sheet evaluation is based on established international safety
              science, EU SCCS opinions, CIR reviews, IFRA standards, ISO testing
              standards, and India&apos;s Cosmetics Rules 2020. We don&apos;t invent our own
              safety thresholds. We apply the best available evidence from recognised
              regulatory and scientific bodies.
            </p>
          </div>

          {/* Visual, scoring breakdown */}
          <div className="relative">
            <div className="bg-white rounded-3xl border border-teal-100 shadow-2xl shadow-teal-900/10 p-8">
              <div className="text-xs font-medium text-ink-400 uppercase tracking-widest mb-6">
                Scoring Weight Distribution
              </div>
              {[
                { label: "Ingredient Safety", pct: 50, color: "bg-coral-500", icon: Shield },
                { label: "Manufacturing & Quality", pct: 20, color: "bg-teal-500", icon: FlaskConical },
                { label: "Claims & Evidence", pct: 20, color: "bg-gold-500", icon: Eye },
                { label: "Ethics & Sustainability", pct: 10, color: "bg-safe-500", icon: Leaf },
              ].map(({ label, pct, color, icon: Icon }) => (
                <div key={label} className="mb-5 last:mb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-ink-400" />
                      <span className="text-sm font-medium text-ink-700">{label}</span>
                    </div>
                    <span className="text-sm font-medium text-ink-950">{pct}%</span>
                  </div>
                  <div className="h-2.5 bg-ink-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-6 pt-5 border-t border-ink-100 flex items-center justify-between">
                <span className="text-xs text-ink-400">Layer 1: Legal Compliance</span>
                <span className="text-xs font-medium text-coral-600 bg-coral-50 border border-coral-100 px-3 py-1 rounded-full">
                  PASS / FAIL GATE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   DECISION FLOW
───────────────────────────────────────────── */
function DecisionFlow() {
  return (
    <section className="py-16 sm:py-20 bg-white border-t border-ink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-medium text-ink-950 tracking-tight mb-3">
            How a score is produced.
          </h2>
          <p className="text-ink-600 text-lg max-w-2xl mx-auto">
            Every product follows the same path. Layer 1 is a gate, fail it and the
            evaluation stops. Pass it, and Layers 2-5 are scored to produce the final
            certification decision.
          </p>
        </div>

        {/* Flow steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { n: "L1", label: "Legal Compliance", sub: "Pass / Fail gate", color: "bg-coral-500", textColor: "text-white" },
            { n: "L2", label: "Ingredient Safety", sub: "50 points", color: "bg-teal-600", textColor: "text-white" },
            { n: "L3", label: "Manufacturing & Quality", sub: "20 points", color: "bg-teal-600", textColor: "text-white" },
            { n: "L4", label: "Claims & Evidence", sub: "20 points", color: "bg-teal-600", textColor: "text-white" },
            { n: "L5", label: "Ethics & Sustainability", sub: "10 points", color: "bg-teal-600", textColor: "text-white" },
          ].map(({ n, label, sub, color, textColor }, i) => (
            <div key={n} className="flex items-center gap-3 lg:flex-col lg:gap-0">
              <div className={`${color} ${textColor} rounded-2xl p-5 w-full text-center`}>
                <div className="text-xs font-medium uppercase tracking-widest opacity-70 mb-1">{n}</div>
                <div className="font-medium text-sm leading-tight">{label}</div>
                <div className="text-xs mt-1 opacity-80">{sub}</div>
              </div>
              {i < 4 && (
                <div className="hidden lg:flex items-center justify-center w-full py-2">
                  <ArrowRight size={16} className="text-ink-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-2xl px-6 py-3">
            <span className="text-ink-600 text-sm">Total possible score:</span>
            <span className="text-2xl font-medium text-teal-700">100</span>
            <span className="text-ink-400 text-sm">points</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   THE FIVE LAYERS (expanded)
───────────────────────────────────────────── */
const LAYERS = [
  {
    id: "legal-compliance",
    icon: Scale,
    number: "01",
    title: "Legal Compliance",
    role: "Pass / Fail gate, must pass before proceeding",
    weight: "Gate",
    color: "text-coral-500",
    bg: "bg-coral-50",
    borderColor: "border-coral-200",
    description:
      "We check every ingredient against the relevant prohibited and restricted substance lists for your target markets, India, EU, US, Korea, or all of them. If anything fails here, we tell you exactly what and why before proceeding.",
    details: [
      "Cross-reference all ingredients against banned/restricted lists for each declared target market",
      "Verify label compliance, INCI format, required disclosures, allergen declarations",
      "Confirm notification and registration requirements are met or achievable",
      "Document the legal basis for clearance in each jurisdiction",
    ],
    jurisdictions: [
      "EU Cosmetics Regulation (EC) No 1223/2009",
      "India Cosmetics Rules 2020 (Drugs & Cosmetics Act)",
      "US MoCRA + FDA cosmetic rules",
      "South Korea Cosmetics Act (MFDS)",
      "Japan PMD Act",
      "China CSAR 2021",
      "ASEAN Cosmetic Directive",
      "UK GB Cosmetics Regulation",
      "Canada Cosmetic Regulations",
      "Australia ICNA + TGA",
    ],
  },
  {
    id: "ingredient-safety",
    icon: Shield,
    number: "02",
    title: "Ingredient Safety",
    role: "The core of our evaluation, drives 50% of the final score",
    weight: "50 pts",
    color: "text-coral-500",
    bg: "bg-coral-50",
    borderColor: "border-coral-200",
    description:
      "We assess every ingredient with a concern, toxicology, endocrine activity, carcinogenicity, sensitization potential, systemic exposure. Not in isolation: in the context of your specific formula, product type, and consumer.",
    details: [
      "Ingredient Hazard Assessment (25 pts), carcinogenicity, mutagenicity, reproductive toxicity, endocrine disruption, organ/systemic toxicity",
      "Exposure Assessment (15 pts), leave-on vs rinse-off, concentration compliance, aggregate daily exposure vs NOAEL margin of safety",
      "Sensitization & Irritation (10 pts), skin sensitization (HRIPT/LLNA), eye irritation, respiratory irritation for spray products",
    ],
    autoFails: [
      "Any substance from EU Annex II (prohibited list)",
      "Any ECHA SVHC at or above 0.1% w/w without regulatory exemption",
      "Undisclosed fragrance allergens above EU thresholds",
      "IFRA-restricted fragrance materials above category limits",
      "Formaldehyde-releasing preservatives in baby products",
    ],
  },
  {
    id: "manufacturing-quality",
    icon: FlaskConical,
    number: "03",
    title: "Manufacturing & Quality",
    role: "How the product is made and controlled, 20% of score",
    weight: "20 pts",
    color: "text-teal-600",
    bg: "bg-teal-50",
    borderColor: "border-teal-200",
    description:
      "We review your GMP certification, preservative efficacy data, stability data, and active ingredient assays. A safe formula in a poorly manufactured product is still a problem.",
    details: [
      "Facility & Quality System (8 pts), GMP certification (ISO 22716 preferred), quality management documentation, Qualified Person designation, recall procedures",
      "Batch Control & Testing (7 pts), Certificate of Analysis per batch, in-process and finished product testing, stability data (accelerated + real-time), Preservative Efficacy Test",
      "Supplier & Ingredient Control (5 pts), approved supplier list, ingredient COAs with spec matching, raw material sourcing audit trail",
    ],
    standards: ["ISO 22716:2007", "Indian GMP (Schedule M-II)", "Korean CGMP", "ASEAN GMP", "US MoCRA GMP expectations"],
  },
  {
    id: "claims-evidence",
    icon: Eye,
    number: "04",
    title: "Claims & Evidence",
    role: "Whether marketing claims are truthful and substantiated, 20% of score",
    weight: "20 pts",
    color: "text-gold-600",
    bg: "bg-gold-50",
    borderColor: "border-gold-200",
    description:
      "Every claim on your label and marketing is assessed against the evidence in your dossier. \"Clinically proven\" has to mean a clinical study. \"SPF 50\" has to match a test result. \"Organic\" has to be certified. We verify all of it.",
    details: [
      "Claim Substantiation (10 pts), evidence exists for each material claim, from credible independent source, product-specific not generic ingredient data",
      "Label & Marketing Accuracy (6 pts), no prohibited terms, accurate free-from claims, compliant functional cosmetic language, environmental claims follow FTC Green Guides",
      "INCI Disclosure Completeness (4 pts), all ingredients listed in INCI format, concentration ranges for actives, fragrance components disclosed",
    ],
    autoFails: [
      "Drug claims without regulatory drug approval",
      "\"Chemical-free\" or equivalent scientifically incoherent claims",
      "SPF or UV protection claims without validated test data",
      "Organic/natural/vegan claims without supporting certification or evidence",
    ],
  },
  {
    id: "ethics-sustainability",
    icon: Leaf,
    number: "05",
    title: "Ethics & Sustainability",
    role: "Environmental impact and ethical considerations, 10% of score",
    weight: "10 pts",
    color: "text-safe-600",
    bg: "bg-safe-100",
    borderColor: "border-safe-200",
    description:
      "Cruelty-free status, vegan ingredients, palm oil and mica sourcing, packaging sustainability, and environmental claims. All independently assessed as part of the evaluation.",
    details: [
      "Cruelty-Free Status (3 pts), no animal testing at finished product or ingredient level, Leaping Bunny supply chain traceability",
      "Natural / Organic / Clean Ingredients (3 pts), natural origin index (ISO 16128), COSMOS/NATRUE prohibited list compliance",
      "Ethical Sourcing (2 pts), responsible palm oil (RSPO), verified mica sourcing (RMI), no conflict minerals",
      "Packaging Sustainability (2 pts), recyclable or refillable primary packaging, post-consumer recycled content, minimal secondary packaging",
    ],
    standards: ["COSMOS Standard", "ECOCERT", "NATRUE", "ISO 16128", "Leaping Bunny", "RSPO", "FSC"],
  },
];

function FiveLayers() {
  return (
    <section className="py-16 sm:py-24 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-teal-600 text-sm font-normal mb-4 uppercase tracking-wide">
            <BookOpen size={14} /> The Five Layers
          </div>
          <h2 className="text-4xl lg:text-5xl font-medium text-ink-950 tracking-tight mb-4">
            What we evaluate.
          </h2>
          <p className="text-ink-600 text-lg max-w-2xl mx-auto">
            Every product is evaluated across five structured layers, each benchmarked
            against internationally recognised standards.
          </p>
        </div>

        <div className="space-y-8">
          {LAYERS.map((layer) => {
            const Icon = layer.icon;
            return (
              <div
                key={layer.id}
                id={layer.id}
                className={`rounded-3xl border ${layer.borderColor} overflow-hidden`}
              >
                {/* Header */}
                <div className={`${layer.bg} px-8 py-6 flex flex-col sm:flex-row sm:items-center gap-4`}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                      <Icon size={22} className={layer.color} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-ink-400 uppercase tracking-widest">
                          Layer {layer.number}
                        </span>
                        <span className={`text-xs font-medium ${layer.color} ${layer.bg} border ${layer.borderColor} px-2.5 py-0.5 rounded-full`}>
                          {layer.weight}
                        </span>
                      </div>
                      <h3 className="text-xl font-medium text-ink-950 mt-0.5">{layer.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-ink-500 sm:max-w-xs sm:text-right">{layer.role}</p>
                </div>

                {/* Body */}
                <div className="bg-white px-8 py-7">
                  <p className="text-ink-600 leading-relaxed mb-6">{layer.description}</p>

                  {/* Scoring sub-components or evaluation checklist */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-ink-950 uppercase tracking-wider mb-3">
                      {layer.id === "legal-compliance" ? "How we evaluate" : "Scoring sub-components"}
                    </h4>
                    <div className="space-y-2.5">
                      {layer.details.map((d) => (
                        <div key={d} className="flex items-start gap-3">
                          <CheckCircle2 size={16} className="text-teal-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-ink-600 leading-relaxed">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Auto-fails if present */}
                  {"autoFails" in layer && layer.autoFails && (
                    <div className="bg-coral-50 border border-coral-100 rounded-2xl p-5">
                      <h4 className="flex items-center gap-2 text-sm font-medium text-coral-700 mb-3">
                        <AlertTriangle size={14} />
                        Automatic fail conditions
                      </h4>
                      <div className="space-y-2">
                        {layer.autoFails.map((f) => (
                          <div key={f} className="flex items-start gap-2.5 text-sm text-coral-700">
                            <span className="text-coral-400 mt-0.5 flex-shrink-0">×</span>
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Jurisdictions for Layer 1 */}
                  {"jurisdictions" in layer && layer.jurisdictions && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-ink-950 uppercase tracking-wider mb-3">
                        Jurisdictions covered
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {layer.jurisdictions.map((j) => (
                          <div key={j} className="flex items-center gap-2 text-sm text-ink-600">
                            <CheckCircle2 size={13} className="text-teal-500 flex-shrink-0" />
                            {j}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Standards for Layers 3, 5 */}
                  {"standards" in layer && layer.standards && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-ink-950 uppercase tracking-wider mb-3">
                        Standards referenced
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {layer.standards.map((s) => (
                          <span
                            key={s}
                            className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   CERTIFICATION TIERS
───────────────────────────────────────────── */
function Tiers() {
  const tiers = [
    { icon: "✦", label: "Excellent", range: "90-100", color: "text-ink-950", bg: "bg-yellow-500/90", border: "border-yellow-400", desc: "Exceptional across all pillars." },
    { icon: "✓", label: "Good", range: "75-89", color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200", desc: "Strong safety profile with minor areas for improvement." },
    { icon: "⚠", label: "Fair", range: "60-74", color: "text-caution-600", bg: "bg-caution-100", border: "border-caution-600/30", desc: "Passes the threshold but has notable concerns." },
    { icon: "✗", label: "Not Certified", range: "<60", color: "text-coral-600", bg: "bg-coral-50", border: "border-coral-200", desc: "Does not meet the standard." },
  ];

  return (
    <section className="py-16 sm:py-24 lg:py-28 relative overflow-hidden">
      <Image
        src="/images/kitera-dent-hHsn1Pjrw58-unsplash.jpg"
        alt=""
        fill
        className="object-cover"
        aria-hidden
      />
      <div className="absolute inset-0 bg-teal-950/92" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-yellow-500 text-sm font-medium mb-4 uppercase tracking-wide">
            <Award size={14} /> Certification Tiers
          </div>
          <h2 className="text-4xl lg:text-5xl font-medium tracking-tight mb-4" style={{ color: "#ffffff" }}>
            Products earn their tier.
          </h2>
          <p className="text-teal-300 text-lg max-w-lg mx-auto">
            The score determines the tier. The tier reflects the real safety and transparency of the formulation.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map(({ icon, label, range, color, bg, border, desc }) => (
            <div key={label} className={`rounded-3xl p-7 border ${border} ${bg} backdrop-blur-sm`}>
              <div className={`text-4xl mb-3 ${color}`}>{icon}</div>
              <div className={`text-xl font-medium mb-0.5 ${color}`}>{label}</div>
              <div className={`text-sm font-mono ${color} opacity-70 mb-4`}>{range} pts</div>
              <p className={`text-sm leading-relaxed ${color} opacity-80`}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   WHO EVALUATES
───────────────────────────────────────────── */
function WhoEvaluates() {
  return (
    <section className="py-16 sm:py-24 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-4xl lg:text-5xl font-medium text-ink-950 tracking-tight mb-6">
              Who evaluates.
            </h2>
            <div className="space-y-4 text-ink-600 text-lg leading-relaxed">
              <p>
                Our evaluations are conducted by an independent panel of cosmetic scientists,
                toxicologists, and dermatologists. Panel members have no commercial relationship
                with brands applying for certification.
              </p>
              <p>
                Conflicts of interest are declared and managed. Panel members are named on
                our website as they are appointed, because transparency about who evaluates
                is part of what makes the standard credible.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* What we publish */}
            <div className="bg-white rounded-3xl border border-teal-100 p-7 shadow-sm">
              <h3 className="flex items-center gap-2 font-medium text-ink-950 text-lg mb-5">
                <FileText size={18} className="text-teal-600" />
                What we publish
              </h3>
              <p className="text-ink-600 text-sm leading-relaxed mb-5">
                For every certified product, we publish:
              </p>
              <div className="space-y-2.5">
                {[
                  "Product name, brand name, category",
                  "Certification tier and total score",
                  "Score breakdown by layer (not sub-score detail)",
                  "PRISM modules assessed",
                  "Target markets evaluated for",
                  "Verified claims list",
                  "Issue date and expiry date",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 size={14} className="text-teal-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-ink-700">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-400 mt-5 pt-4 border-t border-ink-100">
                We do not publish formula concentrations, supplier information, or any other
                commercially sensitive information from the brand&apos;s dossier.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   STANDARDS REFERENCED
───────────────────────────────────────────── */
function StandardsReferenced() {
  const standards = [
    { name: "EU Cosmetics Regulation (EC) No 1223/2009", sub: "and current Annexes II-VI" },
    { name: "India Cosmetics Rules 2020", sub: "Drugs & Cosmetics Act 1940" },
    { name: "SCCS Notes of Guidance", sub: "SCCS/1602/18 and updates" },
    { name: "CIR Safety Assessments", sub: "Cosmetic Ingredient Review" },
    { name: "IFRA 49th Amendment (2022)", sub: "International Fragrance Association" },
    { name: "ISO 22716:2007", sub: "GMP for cosmetics" },
    { name: "ISO 11930:2019", sub: "Preservative Efficacy Testing" },
    { name: "ISO 24444:2010 revised 2019", sub: "SPF in vivo testing" },
    { name: "ISO 16128", sub: "Natural and organic ingredients" },
    { name: "ECHA SVHC Candidate List", sub: "Substances of Very High Concern" },
    { name: "IARC Carcinogen Classifications", sub: "International Agency for Research on Cancer" },
  ];

  return (
    <section className="py-16 sm:py-24 lg:py-28 border-t border-ink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-medium text-ink-950 tracking-tight mb-3">
            Standards we reference.
          </h2>
          <p className="text-ink-600 text-lg max-w-2xl mx-auto">
            Our evaluation framework is anchored to the world&apos;s leading regulatory and
            scientific bodies. We don&apos;t create our own thresholds, we apply theirs.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {standards.map(({ name, sub }) => (
            <div
              key={name}
              className="bg-white rounded-2xl border border-ink-100 px-5 py-4 hover:border-teal-200 hover:shadow-sm transition-all"
            >
              <div className="font-normal text-ink-950 text-sm leading-snug">{name}</div>
              <div className="text-xs text-ink-400 mt-1">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   CTA
───────────────────────────────────────────── */
function CTA() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-4xl lg:text-5xl font-medium text-ink-950 tracking-tight mb-5">
          Ready to prove your product?
        </h2>
        <p className="text-ink-600 text-lg mb-10 max-w-xl mx-auto">
          Brands that certify with The Clean Sheet are showing their work. The methodology
          is public. The standard is real. The proof is permanent.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/brands"
            className="flex items-center gap-2.5 bg-coral-500 hover:bg-coral-600 text-white font-normal px-8 py-4 rounded-2xl transition-all hover:shadow-xl hover:shadow-coral-500/30 active:scale-[0.98] text-lg"
          >
            Apply for Certification
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/analyzer"
            className="flex items-center gap-2 text-ink-700 hover:text-ink-950 font-medium text-base transition-colors"
          >
            Or try Ask Clean, free →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function MethodologyPage() {
  return (
    <div className="bg-white">
      <Hero />
      <DecisionFlow />
      <FiveLayers />
      <Tiers />
      <WhoEvaluates />
      <StandardsReferenced />
      <CTA />
    </div>
  );
}
