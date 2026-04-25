import Image from "next/image";
import Link from "next/link";
import { Sparkles, AlertTriangle, CheckCircle2, XCircle, BookOpen, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Learn, The Clean Sheet™",
  description: "Learn about cosmetic ingredients, INCI lists, scoring methodology, and how to read product labels.",
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
    term: "Clean Sheet Score",
    full: "The Clean Sheet™ proprietary 0–100 safety score",
    description: "A composite score based on Safety (50%), Efficacy (20%), Transparency (20%), and Sustainability (10%). Above 90 = Excellent, 75–89 = Good, 60–74 = Fair, Below 60 = Fail.",
    status: "safe",
  },
  {
    term: "Fragrance / Parfum",
    full: "Undisclosed fragrance mixture",
    description: "A catch-all ingredient that can contain up to 3,000 individual chemicals, many of which are allergens or sensitizers. Brands are not required to disclose individual fragrance components in most markets.",
    status: "caution",
  },
];

const PILLARS = [
  { label: "Safety & Toxicity", weight: "50%", desc: "Carcinogenicity, endocrine disruption, sensitization, exposure risk", color: "bg-teal-600" },
  { label: "Efficacy", weight: "20%", desc: "Claim substantiation, active ingredient stability, performance testing", color: "bg-teal-500" },
  { label: "Transparency", weight: "20%", desc: "Full INCI disclosure, allergen labeling, no misleading marketing", color: "bg-teal-400" },
  { label: "Sustainability", weight: "10%", desc: "Biodegradability, ethical sourcing, packaging recyclability", color: "bg-teal-300" },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    danger: "bg-danger-100 text-danger-700",
    caution: "bg-caution-100 text-caution-600",
    safe:   "bg-safe-100 text-safe-600",
    info:   "bg-teal-100 text-teal-700",
  };
  const icons: Record<string, React.ReactNode> = {
    danger: <XCircle size={12} />,
    caution: <AlertTriangle size={12} />,
    safe: <CheckCircle2 size={12} />,
    info: <BookOpen size={12} />,
  };
  const labels: Record<string, string> = {
    danger: "High concern",
    caution: "Moderate concern",
    safe: "Reference",
    info: "Term",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status]}`}>
      {icons[status]}
      {labels[status]}
    </span>
  );
}

export default function LearnPage() {
  return (
    <div className="bg-white">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-teal-600 bg-teal-50 border border-teal-200 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
                <BookOpen size={14} />
                Ingredient Education
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-ink-950 tracking-tight leading-tight mb-6">
                Know what's
                <br />
                in your products.
              </h1>
              <p className="text-xl text-ink-600 leading-relaxed mb-8">
                A glossary of key cosmetic ingredients, industry terms, and what they mean
                for your health. Bookmark this, it'll change how you shop.
              </p>
              <div className="flex gap-3">
                <a href="#scoring" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm">
                  How We Score <ArrowRight size={14} />
                </a>
                <a href="#skin-type-guides" className="flex items-center gap-2 border border-teal-200 hover:border-teal-400 text-teal-700 font-medium px-5 py-3 rounded-xl transition-colors text-sm">
                  Skin Type Guides
                </a>
              </div>
            </div>

            {/* Hero image, ingredient close-up */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl shadow-teal-900/15">
                <Image
                  src="/images/ingredient-transparency.jpg"
                  alt="Ingredient transparency — what each ingredient actually means"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-950/50 via-transparent to-transparent" />
              </div>
              {/* Floating label */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-teal-950/85 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3">
                  <div className="text-sm font-semibold text-white">Ingredient transparency.</div>
                  <div className="text-xs text-teal-300 mt-0.5">Every ingredient evaluated against EU SCCS standards</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Scoring explainer ─────────────────────────────── */}
      <section id="scoring" className="py-20 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-ink-950 tracking-tight mb-3">
              How the Clean Sheet Score works
            </h2>
            <p className="text-ink-600 text-lg">
              Every product is evaluated across four pillars and scored 0–100.
            </p>
          </div>

          {/* Visual pillar bars */}
          <div className="bg-white rounded-3xl border border-teal-100 p-8 mb-8 shadow-sm">
            <div className="space-y-5">
              {PILLARS.map(({ label, weight, desc, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-ink-950 text-sm">{label}</span>
                    <span className="font-bold text-teal-600">{weight}</span>
                  </div>
                  <div className="h-3 bg-teal-50 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: weight }}
                    />
                  </div>
                  <p className="text-ink-500 text-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Score tiers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { range: "90–100", label: "Excellent", color: "bg-safe-100 text-safe-600 border-safe-600/20" },
              { range: "75–89", label: "Good", color: "bg-teal-100 text-teal-700 border-teal-200" },
              { range: "60–74", label: "Fair", color: "bg-caution-100 text-caution-600 border-caution-600/20" },
              { range: "< 60", label: "Fail", color: "bg-danger-100 text-danger-700 border-danger-700/20" },
            ].map(({ range, label, color }) => (
              <div key={label} className={`rounded-2xl border p-4 text-center ${color}`}>
                <div className="text-xl font-bold font-mono">{range}</div>
                <div className="text-xs font-semibold mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-teal-900 text-white rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Sparkles size={20} className="text-teal-400 flex-shrink-0 mt-0.5" />
            <p className="text-teal-300 flex-1">
              <strong className="text-white">Try Ask Clean</strong>, paste any ingredient
              list and see how a real product scores across all four pillars in seconds.
            </p>
            <Link
              href="/analyzer"
              className="flex-shrink-0 flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Open Ask Clean <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── India regulations callout ─────────────────────── */}
      <section id="india" className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <Image
              src="/images/mona-jain-j24HPh0Q84g-unsplash.jpg"
              alt="Lab quality testing"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-teal-950/90" />
            <div className="relative z-10 p-10 lg:p-14">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4" id="inci" style={{ color: '#ffffff' }}>
                India Cosmetic Regulations
              </h2>
              <div className="grid sm:grid-cols-3 gap-6 text-sm">
                {[
                  { title: "Drugs & Cosmetics Act", desc: "India's primary regulation, governs manufacture, sale, and import. No legal definition of 'clean' or 'natural'." },
                  { title: "INCI Compliance", desc: "Products sold in India must list ingredients in INCI format. Many brands still don't comply fully with complete disclosure." },
                  { title: "EU Banned List", desc: "The Clean Sheet cross-references the EU's list of 1,328 banned cosmetic substances, India's regulation is far less restrictive." },
                ].map(({ title, desc }) => (
                  <div key={title} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4">
                    <div className="text-teal-300 font-bold mb-1.5">{title}</div>
                    <p className="text-teal-200/80 text-xs leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Skin Type Guides ──────────────────────────────── */}
      <section id="skin-type-guides" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 text-teal-600 bg-teal-50 border border-teal-200 text-sm font-medium px-4 py-1.5 rounded-full mb-5">
              <BookOpen size={14} />
              Skin Type Guides
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-ink-950 tracking-tight mb-3">
              Guides for every skin type
            </h2>
            <p className="text-ink-600 text-lg">
              Science-backed routines and ingredient checklists tailored to your skin type.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                type: "Oily Skin",
                desc: "Manage excess sebum, minimise pores, and pick non-comedogenic actives.",
                href: "/learn/guides/oily-skin",
                accent: "from-teal-600 to-teal-800",
              },
              {
                type: "Dry Skin",
                desc: "Restore the moisture barrier, lock in hydration, and avoid stripping ingredients.",
                href: "/learn/guides/dry-skin",
                accent: "from-teal-400 to-teal-600",
              },
              {
                type: "Combination Skin",
                desc: "Balance an oily T-zone and dry cheeks without compromising either area.",
                href: "/learn/guides/combination-skin",
                accent: "from-teal-500 to-teal-800",
              },
              {
                type: "Normal Skin",
                desc: "Maintain your skin's natural balance and protect it from environmental stress.",
                href: "/learn/guides/normal-skin",
                accent: "from-teal-300 to-teal-600",
              },
            ].map(({ type, desc, href, accent }) => (
              <Link
                key={type}
                href={href}
                className="group bg-white rounded-3xl border border-teal-100 overflow-hidden hover:shadow-lg hover:shadow-teal-900/10 transition-all duration-200 flex flex-col"
              >
                <div className={`h-1.5 bg-gradient-to-r ${accent}`} />
                <div className="p-5 flex flex-col flex-1">
                  <span className="inline-flex items-center self-start text-xs font-semibold px-2.5 py-1 rounded-full border mb-3 bg-teal-100 text-teal-700 border-teal-200">
                    {type}
                  </span>
                  <p className="text-ink-600 text-sm leading-relaxed flex-1">{desc}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-teal-600 group-hover:text-teal-800 text-sm font-semibold transition-colors">
                    Read guide <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Glossary ──────────────────────────────────────── */}
      <section id="glossary" className="py-16 pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-ink-950 tracking-tight mb-3">
              Ingredient glossary
            </h2>
            <p className="text-ink-600 text-lg">
              The terms you need to know when reading a label.
            </p>
          </div>
          <div className="space-y-4">
            {GLOSSARY.map(({ term, full, description, status, examples }) => (
              <div
                key={term}
                className="bg-white rounded-3xl border border-teal-100 p-6 hover:shadow-md hover:shadow-teal-100 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-ink-950">{term}</h3>
                    <p className="text-ink-400 text-sm">{full}</p>
                  </div>
                  <StatusBadge status={status} />
                </div>
                <p className="text-ink-600 leading-relaxed">{description}</p>
                {examples && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {examples.map((ex) => (
                      <span
                        key={ex}
                        className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-full font-mono"
                      >
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
