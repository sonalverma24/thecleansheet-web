import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, ChevronDown, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { ProductScorecard, ScorePillar } from "@/data/brands/types";
import { ProductHero } from "@/components/scorecards/ProductHero";

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = await createClient();
  const { data } = await db
    .from("scorecard_cache")
    .select("product_name, brand_name, scorecard")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return {};
  const sc = data.scorecard as any;

  return {
    title: `${data.product_name} Review, Clean Sheet Score ${sc.score ?? 0}/100`,
    description: `Is ${data.product_name} safe? AI-analyzed ingredient scorecard: ${sc.score ?? 0}/100 (${sc.scoreLabel ?? "Fair"}). Full INCI review, regulatory compliance, and India-specific skin context.`,
    keywords: [
      `${data.product_name} review`,
      `${data.product_name} India`,
      `is ${data.product_name} safe`,
      `${data.brand_name} ingredients safe`,
      "clean beauty India",
      "ingredient checker India",
    ],
    alternates: {
      canonical: `https://thecleansheet.in/analyzed/${slug}`,
    },
    openGraph: {
      title: `${data.product_name}, Score ${sc.score ?? 0}/100 | The Clean Sheet`,
      description: `${sc.scoreLabel ?? "Fair"} rating. ${(sc.summary ?? "").slice(0, 150)}...`,
      url: `https://thecleansheet.in/analyzed/${slug}`,
      type: "article",
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ProofStatus =
  | "verified"
  | "supported"
  | "not-found"
  | "not-verified"
  | "needs-context";

interface ProofCard {
  claim: string;
  status: ProofStatus;
  explanation: string;
  evidenceType: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Style helpers
// ─────────────────────────────────────────────────────────────────────────────

function proofStatusStyles(status: ProofStatus) {
  switch (status) {
    case "verified":
      return { dot: "bg-[#248179]", accent: "#248179", label: "Verified", labelCls: "text-[#248179]" };
    case "supported":
      return { dot: "bg-blue-500", accent: "#3b82f6", label: "Supported", labelCls: "text-blue-600" };
    case "needs-context":
      return { dot: "bg-amber-500", accent: "#f59e0b", label: "Needs context", labelCls: "text-amber-700" };
    case "not-verified":
      return { dot: "bg-[#fd6158]", accent: "#fd6158", label: "Not verified", labelCls: "text-[#fd6158]" };
    case "not-found":
      return { dot: "bg-[#b0a8a4]", accent: "#b0a8a4", label: "Not found", labelCls: "text-[#b0a8a4]" };
  }
}

function ingredientFlagStyles(flag: "ok" | "warn" | "info") {
  switch (flag) {
    case "ok":
      return { dot: "bg-[#248179]", label: "Low concern", labelCls: "text-[#248179]", rowBg: "" };
    case "info":
      return { dot: "bg-blue-400", label: "Worth noting", labelCls: "text-blue-600", rowBg: "bg-blue-50/30" };
    case "warn":
      return { dot: "bg-[#fd6158]", label: "Caution", labelCls: "text-[#fd6158]", rowBg: "bg-[#fd6158]/[0.04]" };
  }
}

function pillarColor(pct: number) {
  return pct >= 90 ? "#248179" : pct >= 75 ? "#3b82f6" : pct >= 60 ? "#f59e0b" : "#fd6158";
}

function pillarNameColor(pct: number) {
  return pct >= 90 ? "#0f766e" : pct >= 75 ? "#1d4ed8" : pct >= 60 ? "#b45309" : "#dc2626";
}

function pillarRatingLabel(pct: number) {
  return pct >= 90 ? "Excellent" : pct >= 75 ? "Strong" : pct >= 60 ? "Good" : pct >= 45 ? "Fair" : "Concern";
}

function PillarDots({ score, max }: { score: number; max: number }) {
  const pct = score / max;
  const filled = Math.round(pct * 4);
  const dotColor = pct >= 0.80 ? "#248179" : pct >= 0.55 ? "#D4A843" : "#fd6158";
  return (
    <div className="flex items-center gap-[6px] flex-shrink-0">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="block w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: i < filled ? dotColor : "#E4E2E0" }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Data helpers
// ─────────────────────────────────────────────────────────────────────────────

function simplifyPillarName(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("inci safety") || n.includes("public inci")) return "Ingredient Safety";
  if (n.includes("formula logic") || n.includes("formula inference")) return "Formula Logic";
  if (n.includes("claim support") || n.includes("public claim")) return "Claims Evidence";
  if (n.includes("test result") || n.includes("transparency")) return "Test Transparency";
  if (n.includes("consumer clarity") || n.includes("clarity")) return "Consumer Clarity";
  if (n.includes("ingredient") || n.includes("safety") || n.includes("toxicity")) return "Ingredient Safety";
  if (n.includes("formula") || n.includes("formulation") || n.includes("quality")) return "Formula Design";
  if (n.includes("claims") || n.includes("disclosure")) return "Claims Evidence";
  if (n.includes("ethics") || n.includes("sustain")) return "Ethics";
  return name;
}

function getPillarOneLiner(note: string): string {
  const sentence = note.split(/\.\s+/)[0];
  return sentence.length > 180
    ? sentence.slice(0, 180).replace(/\s+\S+$/, "") + "..."
    : sentence + ".";
}

function generatePillarSummary(pillar: ScorePillar, product: ProductScorecard): string {
  const displayName = simplifyPillarName(pillar.name);
  const pass = product.pass_badges.map((b) => b.toLowerCase());
  const pct = Math.round((pillar.score / pillar.max) * 100);

  if (displayName === "Ingredient Safety") {
    const isMineral = pass.some(
      (b) => b.includes("100% mineral") || (b.includes("mineral") && b.includes("zinc"))
    );
    const isFragFree = pass.some(
      (b) => b.includes("fragrance-free") || b.includes("fragrance free")
    );
    const isEOFree = pass.some(
      (b) => b.includes("no essential oils") || b.includes("essential oil free")
    );
    if (isMineral && isFragFree && isEOFree) return "Mineral only UV filter, fragrance free, and no essential oils.";
    if (isMineral && isFragFree) return "Mineral only UV filter with a fragrance free formula.";
    if (isMineral) return "Mineral only UV filter (Zinc Oxide) with no chemical filter concerns.";
    if (isFragFree && pct >= 80) return "Clean allergen profile with a fragrance free formula.";
    return getPillarOneLiner(pillar.note);
  }

  if (displayName === "Formula Design") {
    return getPillarOneLiner(pillar.note);
  }

  if (displayName === "Claims Evidence") {
    const hasSPFEvidence = pass.some(
      (b) => b.includes("published spf") || (b.includes("spf") && b.includes("test"))
    );
    if (hasSPFEvidence && pct >= 65) return "Published SPF test report available. Some claims need more context.";
    if (hasSPFEvidence) return "SPF test report available, but some supporting claims are weaker.";
    if (pct >= 75) return "Good evidence for stated claims based on public information.";
    return getPillarOneLiner(pillar.note);
  }

  if (displayName === "Transparency") {
    const hasInci = pass.some((b) => b.includes("inci verified"));
    if (hasInci && pct >= 75) return "Full ingredient list is publicly available on the brand website.";
    if (hasInci) return "Ingredient list is available, but some transparency gaps were noted.";
    return getPillarOneLiner(pillar.note);
  }

  return getPillarOneLiner(pillar.note);
}

function claimsCheckToProofCards(product: ProductScorecard): ProofCard[] {
  if (!product.claimsCheck?.length) return [];
  return product.claimsCheck.slice(0, 8).map((c) => {
    let status: ProofStatus;
    if (c.decision === "Publicly supported" && c.evidenceStatus === "Evidence visible") status = "verified";
    else if (c.decision === "Publicly supported") status = "supported";
    else if (c.decision === "Needs proof") status = "needs-context";
    else if (c.evidenceStatus === "Missing") status = "not-found";
    else status = "not-verified";

    const evidenceType =
      c.evidenceStatus === "Evidence visible" ? "Published evidence" :
      c.evidenceStatus === "Mentioned only" ? "Brand claim" :
      "Not found";

    return { claim: c.claim, status, explanation: c.note, evidenceType };
  });
}

function buildProofCards(product: ProductScorecard): ProofCard[] {
  const fromData = claimsCheckToProofCards(product);
  if (fromData.length > 0) return fromData;

  const pass = product.pass_badges.map((b) => b.toLowerCase());
  const warn = product.warn_badges.map((b) => b.toLowerCase());
  const cards: ProofCard[] = [];

  if (product.productType === "sunscreen") {
    if (pass.some((b) => b.includes("published spf") || (b.includes("spf") && b.includes("test")))) {
      cards.push({
        claim: "SPF Rating",
        status: "verified",
        explanation: "A published SPF test report is available from the brand. This is more public evidence than most Indian sunscreens provide.",
        evidenceType: "Published test report",
      });
    } else if (warn.some((b) => b.includes("spf") && (b.includes("not verified") || b.includes("unusual") || b.includes("unverified")))) {
      cards.push({
        claim: "SPF Rating",
        status: "not-verified",
        explanation: "The SPF claim could not be verified from publicly available test evidence.",
        evidenceType: "Not found",
      });
    } else {
      cards.push({
        claim: "SPF Rating",
        status: "supported",
        explanation: "SPF is stated on packaging. No independently published test report found.",
        evidenceType: "Brand claim",
      });
    }
  }

  if (pass.some((b) => b.includes("fragrance-free") || b.includes("fragrance free"))) {
    cards.push({
      claim: "Fragrance Free",
      status: "verified",
      explanation: "No fragrance of any kind found in the INCI. No parfum, no essential oils, no Benzyl Alcohol.",
      evidenceType: "INCI check",
    });
  } else if (warn.some((b) => b.includes("fragrance allergen") || b.includes("lemongrass") || b.includes("citral") || b.includes("benzyl alcohol"))) {
    cards.push({
      claim: "Fragrance Free",
      status: "not-verified",
      explanation: "Brand does not claim fragrance-free. Fragrance allergens are present in the formula.",
      evidenceType: "INCI check",
    });
  }

  if (pass.some((b) => b.includes("no essential oils") || b.includes("essential oil free"))) {
    cards.push({
      claim: "Essential Oil Free",
      status: "verified",
      explanation: "No essential oils found in the ingredient list.",
      evidenceType: "INCI check",
    });
  }

  if (pass.some((b) => b.includes("non-comedogenic"))) {
    const hasWarn = warn.some((b) => b.includes("comedogenic") || b.includes("isostearic"));
    cards.push({
      claim: "Non-Comedogenic",
      status: hasWarn ? "needs-context" : "supported",
      explanation: hasWarn
        ? "A published non-comedogenic test report exists, but some ingredients may have comedogenic potential."
        : "A published non-comedogenic test report is available from the brand.",
      evidenceType: "Published test report",
    });
  }

  if (pass.some((b) => b.includes("vegan"))) {
    const hasVeganContradiction = warn.some(
      (b) => (b.includes("vegan") && b.includes("whey")) || (b.includes("dairy") && b.includes("vegan"))
    );
    cards.push({
      claim: "Vegan",
      status: hasVeganContradiction ? "not-verified" : "supported",
      explanation: hasVeganContradiction
        ? "Brand claims vegan, but animal-derived ingredients appear in the ingredient list."
        : "Vegan claim is consistent with the INCI. No animal-derived ingredients found.",
      evidenceType: hasVeganContradiction ? "INCI check vs brand claim" : "INCI check",
    });
  }

  if (pass.some((b) => b.includes("dermatologist"))) {
    cards.push({
      claim: "Dermatologist Tested",
      status: "supported",
      explanation: "A published dermatologist test report is available from the brand.",
      evidenceType: "Published test report",
    });
  }

  return cards.slice(0, 8);
}

function buildAtAGlance(product: ProductScorecard): { label: string; value: boolean }[] {
  const pass = product.pass_badges.map((b) => b.toLowerCase());
  const warn = product.warn_badges.map((b) => b.toLowerCase());
  const items: { label: string; value: boolean }[] = [];

  const fragFree = pass.some((b) => b.includes("fragrance-free") || b.includes("fragrance free"));
  const hasFragAllergen = warn.some((b) =>
    b.includes("fragrance allergen") || b.includes("lemongrass") || b.includes("citral") ||
    b.includes("benzyl alcohol") || b.includes("parfum")
  );
  if (fragFree) items.push({ label: "Fragrance free", value: true });
  else if (hasFragAllergen) items.push({ label: "Fragrance free", value: false });

  const eoFree = pass.some((b) => b.includes("no essential oils") || b.includes("essential oil free"));
  if (eoFree) items.push({ label: "Essential oil free", value: true });

  const hasAlcohol = product.ingredients.some((i) => {
    const n = i.name.toLowerCase();
    return n === "alcohol" || n.includes("alcohol denat");
  });
  const alcoholWarn = warn.some((b) => b.includes("denatured alcohol") || b.includes("alcohol denat"));
  if (hasAlcohol || alcoholWarn) items.push({ label: "Alcohol free", value: false });
  else items.push({ label: "Alcohol free", value: true });

  const hasParaben = product.ingredients.some((i) => i.name.toLowerCase().includes("paraben"));
  items.push({ label: "Paraben free", value: !hasParaben });

  if (pass.some((b) => b.includes("non-comedogenic"))) {
    items.push({ label: "Non-comedogenic", value: true });
  }

  if (pass.some((b) => b.includes("dermatologist"))) {
    items.push({ label: "Dermatologist tested", value: true });
  }

  const isVegan = pass.some((b) => b.includes("vegan"));
  const hasVeganContradiction = warn.some((b) => b.includes("vegan") && (b.includes("whey") || b.includes("dairy")));
  if (isVegan && !hasVeganContradiction) items.push({ label: "Vegan", value: true });
  else if (hasVeganContradiction) items.push({ label: "Vegan", value: false });

  if (product.productType === "sunscreen") {
    const spfVerified = pass.some((b) => b.includes("published spf") || (b.includes("spf") && b.includes("test")));
    items.push({ label: "SPF verified", value: spfVerified });
  }

  return items.slice(0, 8);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default async function AnalyzedProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const db = await createClient();
  const { data } = await db
    .from("scorecard_cache")
    .select("scorecard, brand_name, product_name")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) notFound();

  const sc = data.scorecard as any;

  const product: ProductScorecard = {
    productName: sc.productName ?? "Unknown Product",
    slug,
    brand: sc.brand ?? "Unknown Brand",
    brandSlug: "analyzed",
    priceRange: sc.priceRange ?? "Price not available",
    productType: (sc.productType ?? "leave-on") as ProductScorecard["productType"],
    concern: sc.concern ?? "",
    summary: sc.summary ?? "",
    score: sc.score ?? 0,
    scoreLabel: (sc.scoreLabel ?? "Fair") as ProductScorecard["scoreLabel"],
    publicDecisionLabel: sc.publicDecisionLabel,
    image: sc.image ?? "",
    pillars: sc.pillars ?? [],
    keyActives: sc.keyActives ?? [],
    ingredients: sc.ingredients ?? [],
    globalScreen: sc.globalScreen,
    inciCompleteness: sc.inciCompleteness,
    claimsCheck: sc.claimsCheck,
    missingProof: sc.missingProof ?? [],
    pass_badges: sc.pass_badges ?? [],
    warn_badges: sc.warn_badges ?? [],
    info_badges: sc.info_badges ?? [],
    indiaContext: sc.indiaContext ?? "",
    analyzedAt: sc.analyzedAt ?? new Date().toISOString().split("T")[0],
    cleanSheetNote: sc.cleanSheetNote,
    targetUser: sc.targetUser,
    skinTypeTags: sc.skinTypeTags ?? [],
    concernTags: sc.concernTags ?? [],
    suitabilityTags: sc.suitabilityTags ?? [],
    cautionTags: sc.cautionTags ?? [],
    fragranceStatus: sc.fragranceStatus,
    alcoholStatus: sc.alcoholStatus,
    retailerLinks: sc.retailerLinks ?? [],
    availabilitySources: sc.availabilitySources ?? [],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const brand = { name: sc.brand ?? "Unknown Brand", slug: "analyzed" } as any;

  const okCount = product.ingredients.filter((i) => i.flag === "ok").length;
  const warnCount = product.ingredients.filter((i) => i.flag === "warn").length;
  const infoCount = product.ingredients.filter((i) => i.flag === "info").length;

  const proofCards = buildProofCards(product);
  const atAGlance = buildAtAGlance(product);

  return (
    <div className="bg-white min-h-screen">
      {/* ── Hero ── */}
      <ProductHero
        product={product}
        brand={brand}
        okCount={okCount}
        warnCount={warnCount}
        infoCount={infoCount}
        brandSlug="analyzed"
      />

      {/* ── AI Banner ── */}
      <div className="bg-[#f7f7f5] border-b border-[#efe9e0] px-5 py-2.5 text-center">
        <span className="text-[11px] text-[#b0a8a4]">
          AI-analyzed from public data · Not a certification ·{" "}
          <Link href="/methodology" className="underline hover:text-[#248179]">
            Learn about our methodology
          </Link>
        </span>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 space-y-8">

        {/* 1. At a glance */}
        {atAGlance.length > 0 && (
          <section id="at-a-glance">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-[3px] h-[18px] rounded-full bg-[#248179] flex-shrink-0" />
              <h2 className="text-sm text-[#282828]" style={{ fontFamily: "'Cooper BT', sans-serif" }}>At a glance</h2>
            </div>
            <div className="bg-white rounded-2xl border border-[#efe9e0] p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {atAGlance.map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span
                      className="text-sm flex-shrink-0 w-4 text-center"
                      style={{ color: value ? "#248179" : "#fd6158" }}
                    >
                      {value ? "✓" : "✗"}
                    </span>
                    <span className="text-xs text-[#282828]/75">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 2. What was checked */}
        <section id="proof">
          <div className="mb-4">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-[3px] h-[18px] rounded-full bg-[#248179] flex-shrink-0" />
              <h2 className="text-sm text-[#282828]" style={{ fontFamily: "'Cooper BT', sans-serif" }}>What was checked</h2>
            </div>
            <p className="text-xs text-[#b0a8a4] pl-[19px]">
              Each claim checked against publicly available evidence: published test reports, the ingredient list, and regulatory data.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {proofCards.map((card) => {
              const s = proofStatusStyles(card.status);
              return (
                <div key={card.claim} className="relative rounded-xl border border-[#efe9e0] bg-white p-4 pl-5 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl" style={{ backgroundColor: s.accent }} />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#282828]">{card.claim}</span>
                    <span className={`text-[10px] flex-shrink-0 ml-3 ${s.labelCls}`}>{s.label}</span>
                  </div>
                  <p className="text-xs text-[#282828]/70 leading-relaxed mb-2">{card.explanation}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                    <span className="text-[10px] text-[#b0a8a4]">{card.evidenceType}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            {(
              [
                { dot: "bg-[#248179]", label: "Verified: confirmed from public evidence" },
                { dot: "bg-blue-500", label: "Supported: consistent with available evidence" },
                { dot: "bg-amber-500", label: "Needs context: relevant for some users" },
                { dot: "bg-[#fd6158]", label: "Not verified: could not be confirmed" },
              ] as const
            ).map(({ dot, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-[10px] text-[#b0a8a4]">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* 3. Score breakdown */}
        <section id="score-rationale">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <span className="w-[3px] h-[18px] rounded-full bg-[#248179] flex-shrink-0" />
                <h2 className="text-sm text-[#282828]" style={{ fontFamily: "'Cooper BT', sans-serif" }}>Score breakdown</h2>
              </div>
              {product.publicDecisionLabel && (
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#248179]/10 text-[#248179] border border-[#248179]/20">
                  {product.publicDecisionLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-[#b0a8a4] pl-[19px]" style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>
              {product.publicDecisionLabel
                ? `Public Evidence Score across ${product.pillars.length} pillars. Open any row for the full rationale.`
                : `How this product was rated across ${product.pillars.length} areas. Open any row for the full rationale.`}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#efe9e0] overflow-hidden divide-y divide-[#efe9e0]">
            {product.pillars.map((pillar) => {
              const displayName = simplifyPillarName(pillar.name);
              const pct = Math.round((pillar.score / pillar.max) * 100);
              const color = pillarColor(pct);
              const nameColor = pillarNameColor(pct);
              const ratingLabel = pillarRatingLabel(pct);
              const summary = generatePillarSummary(pillar, product);

              return (
                <details key={pillar.name} className="group">
                  <summary className="px-4 py-3.5 cursor-pointer list-none select-none">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <PillarDots score={pillar.score} max={pillar.max} />
                        <span className="text-sm" style={{ color: nameColor, fontFamily: "'Cooper BT', sans-serif" }}>{displayName}</span>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0 ml-4">
                        {pillar.evidenceGrade && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded border text-[#b0a8a4] border-[#efe9e0]">
                            Grade {pillar.evidenceGrade}
                          </span>
                        )}
                        <span className="text-xs" style={{ color, fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>{ratingLabel}</span>
                        <span className="text-[10px] text-[#b0a8a4]">{pillar.score}/{pillar.max}</span>
                        <ChevronDown size={12} className="text-[#b0a8a4] transition-transform group-open:rotate-180 flex-shrink-0" />
                      </div>
                    </div>
                    <p className="text-xs text-[#282828]/60 leading-relaxed pl-[46px]" style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>{summary}</p>
                  </summary>
                  <div className="px-4 pb-4 pt-0 bg-[#f7f7f5] border-t border-[#efe9e0]">
                    <p className="text-xs text-[#282828]/65 leading-relaxed pt-4 pl-[46px]" style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>{pillar.note}</p>
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        {/* 4. Full ingredient list */}
        <section id="ingredients">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-[3px] h-[18px] rounded-full bg-[#248179] flex-shrink-0" />
            <div>
              <h2 className="text-sm text-[#282828]" style={{ fontFamily: "'Cooper BT', sans-serif" }}>Ingredient list</h2>
              <p className="text-xs text-[#b0a8a4] mt-0.5">
                {product.ingredients.length} ingredients · INCI order
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-2.5">
            {(
              [
                { dot: "bg-[#248179]", label: "Safe" },
                { dot: "bg-blue-400", label: "Note" },
                { dot: "bg-[#fd6158]", label: "Caution" },
              ] as const
            ).map(({ dot, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-[10px] text-[#b0a8a4]">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                {label}
              </span>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-[#efe9e0] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#faf7f2] border-b border-[#efe9e0]">
                  <th className="py-2 px-3 sm:px-4 text-[10px] font-medium text-[#b0a8a4] uppercase tracking-wider w-[52%] sm:w-auto">Ingredient</th>
                  <th className="py-2 px-3 sm:px-4 text-[10px] font-medium text-[#b0a8a4] uppercase tracking-wider hidden sm:table-cell">What it does</th>
                </tr>
              </thead>
              <tbody>
                {product.ingredients.slice(0, 8).map((ing) => {
                  const s = ingredientFlagStyles(ing.flag);
                  return (
                    <tr key={ing.name} className={`${s.rowBg} border-b border-[#efe9e0]`}>
                      <td className="py-1.5 px-3 sm:px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                          <span className="text-xs sm:text-sm font-medium text-[#282828] break-words min-w-0">{ing.name}</span>
                        </div>
                      </td>
                      <td className="py-1.5 px-3 sm:px-4 text-xs text-[#b0a8a4] leading-relaxed hidden sm:table-cell">{ing.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {product.ingredients.length > 8 && (
              <details className="group">
                <summary className="flex items-center justify-center gap-1.5 px-4 py-2.5 cursor-pointer list-none text-xs font-medium text-[#248179] hover:bg-[#faf7f2] border-t border-[#efe9e0] transition-colors select-none">
                  <span className="group-open:hidden">Show all {product.ingredients.length} ingredients</span>
                  <span className="hidden group-open:inline">Show fewer</span>
                  <ChevronDown size={12} className="transition-transform group-open:rotate-180 flex-shrink-0" />
                </summary>
                <table className="w-full text-left border-t border-[#efe9e0]">
                  <tbody>
                    {product.ingredients.slice(8).map((ing) => {
                      const s = ingredientFlagStyles(ing.flag);
                      return (
                        <tr key={ing.name} className={`${s.rowBg} border-b border-[#efe9e0] last:border-0`}>
                          <td className="py-1.5 px-3 sm:px-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                              <span className="text-xs sm:text-sm font-medium text-[#282828] break-words min-w-0">{ing.name}</span>
                            </div>
                          </td>
                          <td className="py-1.5 px-3 sm:px-4 text-xs text-[#b0a8a4] leading-relaxed hidden sm:table-cell">{ing.note}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </details>
            )}
          </div>
          <p className="text-[10px] text-[#b0a8a4] mt-2">
            INCI order as declared on packaging. Position reflects approximate concentration (high to low).
          </p>
        </section>

        {/* 5. Regulatory screen */}
        {product.globalScreen && (
          <section id="regulatory-screen">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-[3px] h-[18px] rounded-full bg-[#248179] flex-shrink-0" />
              <div>
                <h2 className="text-sm text-[#282828]" style={{ fontFamily: "'Cooper BT', sans-serif" }}>Regulatory screen</h2>
                <p className="text-xs text-[#b0a8a4] mt-0.5">Each ingredient mapped against 10 global regulatory authorities</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[#efe9e0] overflow-hidden divide-y divide-[#efe9e0]">
              {(
                [
                  { key: "eu_1223_2009",        label: "EU 1223/2009",          desc: "EU Cosmetics Regulation - Annexes II–VI" },
                  { key: "india_cr_2020",        label: "India CR 2020",         desc: "India Cosmetics Rules, CDSCO" },
                  { key: "health_canada_hotlist", label: "Health Canada Hotlist", desc: "Canada prohibited & restricted ingredients" },
                  { key: "us_fda_21cfr",         label: "US FDA 21 CFR",         desc: "US FDA Parts 700–740" },
                  { key: "korea_mfds",           label: "MFDS Korea",            desc: "Korea Cosmetics Act" },
                  { key: "echa_svhc",            label: "ECHA SVHC",             desc: "Substances of Very High Concern" },
                  { key: "iarc",                 label: "IARC",                  desc: "Carcinogen classifications Groups 1/2A/2B" },
                  { key: "aicis_australia",      label: "AICIS Australia",       desc: "Australian industrial chemical safety" },
                  { key: "tga_australia",        label: "TGA Australia",         desc: "Therapeutic claims (if applicable)" },
                  { key: "canada_nhpid",         label: "Canada NHPID",          desc: "Natural health product ingredients" },
                ] as const
              ).map(({ key, label, desc }) => {
                const val = (product.globalScreen as any)[key] ?? "";
                const isClear = val.toLowerCase().includes("no obvious") || val.toLowerCase().includes("not triggered");
                return (
                  <div key={key} className="flex items-start gap-3 px-4 py-3">
                    <span className={`mt-0.5 flex-shrink-0 w-3.5 h-3.5 rounded-full ${isClear ? "bg-[#248179]/15 text-[#248179]" : "bg-[#fd6158]/15 text-[#fd6158]"}`} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span className={`block w-1.5 h-1.5 rounded-full ${isClear ? "bg-[#248179]" : "bg-[#fd6158]"}`} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-[#282828]">{label}</span>
                        <span className="text-[10px] text-[#b0a8a4]">{desc}</span>
                      </div>
                      <p className="text-xs text-[#282828]/60 mt-0.5">{val}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-[#b0a8a4] mt-2">Flags are based on publicly available INCI only. Not a substitute for full regulatory compliance review.</p>
          </section>
        )}

        {/* 6. Claims check */}
        {product.claimsCheck && product.claimsCheck.length > 0 && (
          <section id="claims-check">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-[3px] h-[18px] rounded-full bg-[#248179] flex-shrink-0" />
              <div>
                <h2 className="text-sm text-[#282828]" style={{ fontFamily: "'Cooper BT', sans-serif" }}>Claims check</h2>
                <p className="text-xs text-[#b0a8a4] mt-0.5">Each marketing claim assessed against publicly available evidence</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {product.claimsCheck.map((c) => {
                const isSupported  = c.decision === "Publicly supported";
                const isNeedsProof = c.decision === "Needs proof";
                const accent  = isSupported ? "#248179" : isNeedsProof ? "#f59e0b" : "#fd6158";
                const bgClass = isSupported ? "bg-[#248179]/[0.04]" : isNeedsProof ? "bg-amber-50/60" : "bg-[#fd6158]/[0.04]";
                const Icon    = isSupported ? CheckCircle2 : isNeedsProof ? HelpCircle : AlertCircle;
                return (
                  <div key={c.claim} className={`rounded-xl border border-[#efe9e0] p-4 ${bgClass}`}>
                    <div className="flex items-start gap-3">
                      <Icon size={15} className="flex-shrink-0 mt-0.5" style={{ color: accent }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-1">
                          <span className="text-xs text-[#282828]">{c.claim}</span>
                          <span className="text-[10px]" style={{ color: accent }}>{c.decision}</span>
                        </div>
                        <p className="text-xs text-[#282828]/65 leading-relaxed">{c.note}</p>
                        <p className="text-[10px] text-[#b0a8a4] mt-1">{c.evidenceStatus}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 7. Missing proof */}
        {product.missingProof && product.missingProof.length > 0 && (
          <section id="missing-proof">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-[3px] h-[18px] rounded-full bg-[#b0a8a4] flex-shrink-0" />
              <div>
                <h2 className="text-sm text-[#282828]" style={{ fontFamily: "'Cooper BT', sans-serif" }}>What would improve this score</h2>
                <p className="text-xs text-[#b0a8a4] mt-0.5">Public evidence the brand could provide to close verification gaps</p>
              </div>
            </div>
            <div className="bg-[#faf7f2] rounded-2xl border border-[#efe9e0] p-4 sm:p-5">
              <ul className="space-y-2.5">
                {product.missingProof.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-[#b0a8a4] flex-shrink-0 mt-0.5 text-xs">○</span>
                    <span className="text-xs text-[#282828]/70 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 8. About this review */}
        <section id="methodology">
          <div className="bg-[#282828] rounded-2xl p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <ShieldCheck size={20} className="text-[#248179] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-white mb-2">About this review</div>
                <p className="text-white/60 text-sm leading-relaxed mb-1.5">
                  {product.cleanSheetNote ??
                    "This is an AI-generated web evidence review. We checked the ingredient list, publicly available test reports, marketing claims, and formula logic using only public information available at the time of analysis."}
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-1 mb-4">
                  {["AI-powered analysis", "Public evidence only", "Not a certification"].map((m) => (
                    <span key={m} className="text-[11px] text-white/35">{m}</span>
                  ))}
                </div>
                <details className="group">
                  <summary className="flex items-center gap-1.5 cursor-pointer list-none text-xs text-[#248179] hover:text-[#248179]/80 transition-colors select-none">
                    <ChevronDown size={11} className="transition-transform group-open:rotate-180 flex-shrink-0" />
                    Full methodology
                  </summary>
                  <ul className="mt-3 space-y-1.5 text-xs text-white/35 leading-relaxed">
                    <li>What global regulations say about each ingredient</li>
                    <li>What toxicology evidence shows at cosmetic concentrations</li>
                    <li>What formula concentration context changes</li>
                    <li>What the product format and leave-on contact time changes</li>
                    <li>What the stated user group needs</li>
                    <li>What published test evidence confirms</li>
                    <li>What the brand is claiming vs what evidence supports</li>
                  </ul>
                </details>
                {product.indiaContext && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-2.5">
                    <span className="text-base flex-shrink-0 leading-none mt-0.5">🇮🇳</span>
                    <p className="text-xs text-white/50 leading-relaxed">{product.indiaContext}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Back link */}
        <Link
          href="/analyzer"
          className="inline-flex items-center gap-2 text-sm text-[#b0a8a4] hover:text-[#282828] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Analyser
        </Link>
      </div>
    </div>
  );
}
