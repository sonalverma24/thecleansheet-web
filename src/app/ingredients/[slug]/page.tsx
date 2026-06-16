import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, XCircle, FlaskConical, Shield, Globe } from "lucide-react";
import {
  getIngredientBySlug, getAllIngredientSlugs, toSlug,
  ALL_INGREDIENTS, concernColor, statusBadge, type Ingredient,
} from "@/lib/ingredient-utils";

export function generateStaticParams() {
  return getAllIngredientSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ing = getIngredientBySlug(slug);
  if (!ing) return {};

  const concern = ing.Concern_Level_TCS?.toLowerCase();
  const safetyLine =
    concern === "low"
      ? "Generally considered safe for cosmetic use."
      : concern === "medium"
      ? "Use with caution, some restrictions apply."
      : "High concern, flagged for safety review.";

  const title = `${ing.INCI_Name}, Safety, Uses & Regulatory Status`;
  const description = `Is ${ing.INCI_Name} safe? ${safetyLine} See TCS concern level, India/EU/US regulatory status, allergen flags, concentration limits, and safety notes, backed by science.`;

  return {
    title,
    description,
    keywords: [
      `${ing.INCI_Name} safe`, `${ing.INCI_Name} skincare`, `${ing.INCI_Name} India`,
      `is ${ing.INCI_Name} safe`, `${ing.INCI_Name} side effects`,
      ing.Chemical_Name, `${ing.Category_Name} ingredients`, "INCI ingredient safety",
      "cosmetic ingredient checker India",
    ].filter(Boolean),
    alternates: { canonical: `https://thecleansheet.in/ingredients/${slug}` },
    openGraph: {
      title: `${ing.INCI_Name}, Is it Safe? | The Clean Sheet™`,
      description,
      url: `https://thecleansheet.in/ingredients/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${ing.INCI_Name}, Is it Safe?`,
      description,
    },
  };
}

function StatusIcon({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === "permitted" || s === "approved")
    return <CheckCircle2 size={15} className="text-green-600 flex-shrink-0" />;
  if (s === "banned" || s === "prohibited")
    return <XCircle size={15} className="text-red-600 flex-shrink-0" />;
  return <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />;
}

function FlagBadge({ value, label }: { value: string; label: string }) {
  const flagged = value && value !== "No" && value !== "None" && value !== "" && value !== "0.00";
  if (!flagged) return null;
  return (
    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 text-xs font-medium px-2.5 py-1 rounded-full">
      <AlertTriangle size={11} /> {label}: {value}
    </span>
  );
}

export default async function IngredientDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ing = getIngredientBySlug(slug);
  if (!ing) notFound();

  const concern = concernColor(ing.Concern_Level_TCS);
  const concernLow = ing.Concern_Level_TCS?.toLowerCase();

  // Related: same category
  const related = ALL_INGREDIENTS
    .filter((i) => i.Category_Code === ing.Category_Code && i.INCI_Name !== ing.INCI_Name)
    .slice(0, 6);

  const faqs = [
    {
      q: `Is ${ing.INCI_Name} safe to use in skincare?`,
      a: concernLow === "low"
        ? `${ing.INCI_Name} has a Low concern rating from The Clean Sheet. ${ing.Key_Safety_Notes || "It is generally considered safe for cosmetic use at typical concentrations."}`
        : concernLow === "medium"
        ? `${ing.INCI_Name} has a Medium concern rating. ${ing.Key_Safety_Notes || "It may cause reactions in sensitive individuals. Check concentration and formulation context."}`
        : `${ing.INCI_Name} has a High concern rating. ${ing.Key_Safety_Notes || "We recommend avoiding products containing this ingredient at high concentrations."}`,
    },
    {
      q: `Is ${ing.INCI_Name} allowed in India?`,
      a: `${ing.INCI_Name} is currently classified as "${ing.India_Status || "not specified"}" under Indian cosmetics regulations. ${ing.Max_Concentration_India && ing.Max_Concentration_India !== "No limit" ? `The maximum permitted concentration is ${ing.Max_Concentration_India}.` : "No concentration limit is specified for India."}`,
    },
    {
      q: `What is ${ing.INCI_Name} used for in cosmetics?`,
      a: `${ing.INCI_Name} functions as: ${ing.Function}. It is commonly found in: ${ing.Common_Products || "various cosmetic formulations"}.`,
    },
    ing.Allergen_Flag && ing.Allergen_Flag !== "None"
      ? {
          q: `Can ${ing.INCI_Name} cause an allergic reaction?`,
          a: `Yes. ${ing.INCI_Name} has an allergen flag (${ing.Allergen_Flag}). If you have sensitive skin or known fragrance/contact allergies, patch-test products containing this ingredient before full use.`,
        }
      : null,
    ing.Baby_Restriction && ing.Baby_Restriction !== "None"
      ? {
          q: `Is ${ing.INCI_Name} safe for babies?`,
          a: `${ing.INCI_Name} has baby/child restrictions: ${ing.Baby_Restriction}. Avoid using products containing this ingredient on infants unless specifically formulated and labelled for baby use.`,
        }
      : null,
  ].filter(Boolean) as { q: string; a: string }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://thecleansheet.in" },
          { "@type": "ListItem", position: 2, name: "Ingredient Directory", item: "https://thecleansheet.in/ingredients" },
          { "@type": "ListItem", position: 3, name: ing.INCI_Name, item: `https://thecleansheet.in/ingredients/${slug}` },
        ],
      },
      {
        "@type": "ChemicalSubstance",
        name: ing.INCI_Name,
        alternateName: [ing.Chemical_Name, ing.CAS_Number].filter(Boolean),
        description: ing.Key_Safety_Notes,
        identifier: ing.CAS_Number,
        url: `https://thecleansheet.in/ingredients/${slug}`,
        mainEntityOfPage: `https://thecleansheet.in/ingredients/${slug}`,
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };

  return (
    <div className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Header band ── */}
      <div className="bg-teal-950 pt-10 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            href="/ingredients"
            className="inline-flex items-center gap-2 text-teal-300 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Ingredient Directory
          </Link>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-teal-400 mb-5">
            <Link href="/" className="hover:text-teal-200 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/ingredients" className="hover:text-teal-200 transition-colors">Ingredients</Link>
            <span>/</span>
            <span className="text-teal-200">{ing.INCI_Name}</span>
          </nav>

          <div className="flex flex-wrap items-start gap-4 mb-4">
            <span className={`inline-flex items-center gap-1.5 border text-sm font-medium px-3 py-1.5 rounded-full ${concern.badge}`}>
              <span className={`w-2 h-2 rounded-full ${concern.dot}`} />
              {concern.label}
            </span>
            {ing.Vegan === "Yes" && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 border border-green-200 text-xs px-2.5 py-1 rounded-full">
                Vegan
              </span>
            )}
            {ing.TCS_Evaluator_Flag === "Yes" && (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200 text-xs px-2.5 py-1 rounded-full">
                <AlertTriangle size={11} /> Evaluator Flag
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-medium text-white tracking-tight mb-2">
            {ing.INCI_Name}
          </h1>
          {ing.Chemical_Name && (
            <p className="text-teal-300 text-lg">{ing.Chemical_Name}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Main column ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Flags alert */}
            {(ing.CMR_Flag !== "None" || ing.Allergen_Flag !== "None" || ing.Endocrine_Flag === "Yes" || ing.SVHC_Flag === "Yes" || (ing.IARC_Group && ing.IARC_Group !== "Not classified" && !ing.IARC_Group.startsWith("Not classified"))) && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-red-700 font-medium mb-3">
                  <AlertTriangle size={16} /> Safety Flags
                </div>
                <div className="flex flex-wrap gap-2">
                  <FlagBadge value={ing.CMR_Flag} label="CMR" />
                  <FlagBadge value={ing.Allergen_Flag} label="Allergen" />
                  {ing.Endocrine_Flag === "Yes" && (
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 text-xs font-medium px-2.5 py-1 rounded-full">
                      <AlertTriangle size={11} /> Endocrine Disruptor
                    </span>
                  )}
                  {ing.SVHC_Flag === "Yes" && (
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 text-xs font-medium px-2.5 py-1 rounded-full">
                      <AlertTriangle size={11} /> SVHC (EU)
                    </span>
                  )}
                  {ing.IARC_Group && ing.IARC_Group !== "Not classified" && !ing.IARC_Group.startsWith("Not classified") && (
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 text-xs font-medium px-2.5 py-1 rounded-full">
                      <AlertTriangle size={11} /> IARC: {ing.IARC_Group}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Safety notes */}
            {ing.Key_Safety_Notes && (
              <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-teal-800 font-medium mb-3">
                  <Shield size={16} /> Safety Notes
                </div>
                <p className="text-ink-700 leading-relaxed">{ing.Key_Safety_Notes}</p>
              </div>
            )}

            {/* Function & use */}
            <div className="border border-ink-100 rounded-2xl p-6">
              <h2 className="text-lg font-medium text-ink-900 mb-4">Function & Common Use</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-ink-400 uppercase tracking-wider mb-1">Function</div>
                  <p className="text-ink-700">{ing.Function || "-"}</p>
                </div>
                <div>
                  <div className="text-xs text-ink-400 uppercase tracking-wider mb-1">Category</div>
                  <p className="text-ink-700">{ing.Category_Name || "-"}</p>
                </div>
                <div>
                  <div className="text-xs text-ink-400 uppercase tracking-wider mb-1">Common In</div>
                  <p className="text-ink-700">{ing.Common_Products || "-"}</p>
                </div>
                <div>
                  <div className="text-xs text-ink-400 uppercase tracking-wider mb-1">Origin</div>
                  <p className="text-ink-700">{ing.Ingredient_Origin || "-"}</p>
                </div>
              </div>
            </div>

            {/* Concentration limits */}
            {(ing.Max_Concentration_EU || ing.Max_Concentration_India || ing.Max_Concentration_US || ing.Max_Concentration_Korea) && (
              <div className="border border-ink-100 rounded-2xl p-6">
                <h2 className="text-lg font-medium text-ink-900 mb-4 flex items-center gap-2">
                  <FlaskConical size={18} className="text-teal-600" /> Concentration Limits
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-ink-50 rounded-xl p-4">
                    <div className="text-xs text-ink-400 uppercase tracking-wider mb-1">India (CDSCO)</div>
                    <p className="text-ink-800 font-medium">{ing.Max_Concentration_India || "Not specified"}</p>
                  </div>
                  <div className="bg-ink-50 rounded-xl p-4">
                    <div className="text-xs text-ink-400 uppercase tracking-wider mb-1">EU Cosmetics Reg.</div>
                    <p className="text-ink-800 font-medium">{ing.Max_Concentration_EU || "Not specified"}</p>
                  </div>
                  {ing.Max_Concentration_US && (
                    <div className="bg-ink-50 rounded-xl p-4">
                      <div className="text-xs text-ink-400 uppercase tracking-wider mb-1">US FDA (21 CFR)</div>
                      <p className="text-ink-800 font-medium">{ing.Max_Concentration_US}</p>
                    </div>
                  )}
                  {ing.Max_Concentration_Korea && (
                    <div className="bg-ink-50 rounded-xl p-4">
                      <div className="text-xs text-ink-400 uppercase tracking-wider mb-1">Korea (MFDS)</div>
                      <p className="text-ink-800 font-medium">{ing.Max_Concentration_Korea}</p>
                    </div>
                  )}
                </div>
                {ing.Format_Restriction && ing.Format_Restriction !== "Both" && (
                  <p className="text-sm text-ink-500 mt-3">
                    Format restriction: <span className="font-medium text-ink-700">{ing.Format_Restriction}</span>
                  </p>
                )}
                {ing.Baby_Restriction && ing.Baby_Restriction !== "None" && (
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">Baby restriction: {ing.Baby_Restriction}</p>
                  </div>
                )}
                {ing.Pregnancy_Restriction && ing.Pregnancy_Restriction !== "None" && (
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">Pregnancy: {ing.Pregnancy_Restriction}</p>
                  </div>
                )}
                {ing.IFRA_Restriction && ing.IFRA_Restriction !== "Not applicable" && !ing.IFRA_Restriction.startsWith("Not applicable") && (
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">IFRA: {ing.IFRA_Restriction}</p>
                  </div>
                )}
              </div>
            )}

            {/* FAQ section */}
            {faqs.length > 0 && (
              <div className="border border-ink-100 rounded-2xl p-6">
                <h2 className="text-lg font-medium text-ink-900 mb-5">Frequently Asked Questions</h2>
                <div className="space-y-5">
                  {faqs.map(({ q, a }, i) => (
                    <div key={i} className="border-b border-ink-50 last:border-0 pb-5 last:pb-0">
                      <h3 className="font-medium text-ink-900 mb-2">{q}</h3>
                      <p className="text-ink-600 leading-relaxed text-sm">{a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">

            {/* Quick stats card */}
            <div className="bg-teal-950 rounded-2xl p-5 text-white">
              <div className="text-xs text-teal-300 uppercase tracking-wider mb-4">TCS Assessment</div>
              <div className={`inline-flex items-center gap-2 border text-sm font-medium px-3 py-1.5 rounded-full mb-4 ${concern.badge}`}>
                <span className={`w-2 h-2 rounded-full ${concern.dot}`} />
                {concern.label}
              </div>
              {ing.Data_Confidence && (
                <div className="mt-3 border-t border-teal-800 pt-3">
                  <div className="text-xs text-teal-400 uppercase tracking-wider mb-1">Data Confidence</div>
                  <div className="text-sm text-teal-200 font-medium">{ing.Data_Confidence}</div>
                </div>
              )}
              <div className="text-xs text-teal-400 mt-3">
                Based on peer-reviewed safety data, regulatory status, and expert review by The Clean Sheet panel.
              </div>
            </div>

            {/* Regulatory grid */}
            <div className="border border-ink-100 rounded-2xl p-5">
              <h2 className="text-sm font-medium text-ink-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Globe size={14} /> Regulatory Status
              </h2>
              <div className="space-y-2.5">
                {[
                  { market: "India (CDSCO)", status: ing.India_Status },
                  { market: "EU", status: ing.EU_Status },
                  { market: "US FDA", status: ing.US_FDA_Status },
                  { market: "Korea (MFDS)", status: ing.Korea_Status },
                  ...(ing.Australia_TGA_Status ? [{ market: "Australia (TGA)", status: ing.Australia_TGA_Status }] : []),
                  ...(ing.Canada_NHPID_Status ? [{ market: "Canada (NHPID)", status: ing.Canada_NHPID_Status }] : []),
                ].map(({ market, status }) => (
                  <div key={market} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-ink-600">{market}</span>
                    <div className="flex items-center gap-1.5">
                      <StatusIcon status={status} />
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(status)}`}>
                        {status || "-"}
                      </span>
                    </div>
                  </div>
                ))}
                {ing.EU_Annex && (
                  <p className="text-xs text-ink-400 pt-1">EU Annex: {ing.EU_Annex}</p>
                )}
              </div>
            </div>

            {/* Identifiers */}
            <div className="border border-ink-100 rounded-2xl p-5">
              <h2 className="text-sm font-medium text-ink-700 uppercase tracking-wider mb-3">Identifiers</h2>
              <div className="space-y-2 text-sm">
                {ing.CAS_Number && (
                  <div className="flex justify-between">
                    <span className="text-ink-400">CAS</span>
                    <span className="font-mono text-ink-700">{ing.CAS_Number}</span>
                  </div>
                )}
                {ing.EC_Number && (
                  <div className="flex justify-between">
                    <span className="text-ink-400">EC</span>
                    <span className="font-mono text-ink-700">{ing.EC_Number}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5">
              <p className="text-sm text-teal-800 mb-3">
                Want to check if your product contains {ing.INCI_Name}?
              </p>
              <Link
                href="/analyzer"
                className="flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors w-full"
              >
                Analyse a Product <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Related ingredients */}
        {related.length > 0 && (
          <div className="mt-12 border-t border-ink-100 pt-10">
            <h2 className="text-xl font-medium text-ink-900 mb-5">
              More {ing.Category_Name} Ingredients
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {related.map((r) => {
                const rc = concernColor(r.Concern_Level_TCS);
                return (
                  <Link
                    key={r.INCI_Name}
                    href={`/ingredients/${toSlug(r.INCI_Name)}`}
                    className="border border-ink-100 hover:border-teal-200 rounded-xl p-4 flex items-center justify-between group transition-all hover:shadow-md"
                  >
                    <div>
                      <div className="text-sm font-medium text-ink-900 group-hover:text-teal-700 transition-colors">
                        {r.INCI_Name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
                        <span className="text-xs text-ink-400">{rc.label}</span>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-ink-300 group-hover:text-teal-500 transition-colors flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
