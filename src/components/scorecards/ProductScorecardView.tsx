/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Product scorecard view
   THE one review format (extracted from the brand product page).
   Renders a ProductScorecard + Brand - used by static catalogue pages,
   stored repository reviews (/reviews/[slug]) and live /review results.
──────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ShieldCheck, ChevronDown, CheckCircle2, AlertCircle, HelpCircle, MapPin } from "lucide-react";
import type { ProductScorecard, ScorePillar, Brand } from "@/data/brands/types";
import type { AnalysisReport, CheckResult } from "@/lib/analysis-types";
import { ProductHero } from "@/components/scorecards/ProductHero";
import { resolveTier, TierBadge } from "@/components/scorecards/pillar-ui";
import { simplifyPillarName } from "@/lib/pillar-display";

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

/** Single source of truth for the pillar standing scale, so the bar colour,
    the name colour, the rating word and the dots always agree. The ramp runs
    teal (top) to green to gold to amber, with coral reserved for genuine
    concern, so "Fair" no longer reads as a failure. */
function pillarTone(pct: number) {
  if (pct >= 90) return { color: "#248179", name: "#0f766e", label: "Excellent" };
  if (pct >= 75) return { color: "#4C9E6A", name: "#3B7A50", label: "Strong" };
  if (pct >= 60) return { color: "#C99A2E", name: "#8A6A16", label: "Good" };
  if (pct >= 45) return { color: "#E08A3C", name: "#A85D1C", label: "Fair" };
  return { color: "#fd6158", name: "#C2453D", label: "Concern" };
}
function pillarColor(pct: number) { return pillarTone(pct).color; }
function pillarRatingLabel(pct: number) { return pillarTone(pct).label; }

function PillarDots({ score, max }: { score: number; max: number }) {
  const frac = max > 0 ? score / max : 0;
  const filled = Math.round(frac * 4);
  const dotColor = pillarTone(Math.round(frac * 100)).color;
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

/** Dots + rating word, the shared "standing" mark shown in every section header
    (no numbers - honours the tier-not-scores design). */
function SectionRating({ score, max }: { score: number; max: number }) {
  const pct = Math.round((score / Math.max(max, 1)) * 100);
  return (
    <span className="flex items-center gap-2.5">
      <PillarDots score={score} max={max} />
      <span className="text-xs" style={{ color: pillarColor(pct), fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>
        {pillarRatingLabel(pct)}
      </span>
    </span>
  );
}

/** A collapsed analysis section: the header shows the title + a standing mark
    (dots + rating word); the detailed breakdown is revealed on click. Native
    <details> so it stays interactive inside this server component. */
function CollapsibleSection({
  id, title, subtitle, headerRight, children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id}>
      <details className="group bg-white rounded-2xl border border-[#efe9e0] overflow-hidden">
        <summary className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer list-none select-none">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-[3px] h-[18px] rounded-full bg-[#248179] flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm text-[#282828]" style={{ fontFamily: "'Cooper BT', sans-serif" }}>{title}</h2>
              {subtitle && <p className="text-xs text-[#b0a8a4] mt-0.5 hidden sm:block">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {headerRight}
            <ChevronDown size={13} className="text-[#b0a8a4] transition-transform group-open:rotate-180 flex-shrink-0" />
          </div>
        </summary>
        <div className="border-t border-[#efe9e0]">{children}</div>
      </details>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Data helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Find the pillar whose name matches, to borrow its standing for a related
    section header (e.g. the ingredient list borrows Ingredient Transparency). */
function findPillar(pillars: ScorePillar[], re: RegExp): ScorePillar | undefined {
  return pillars.find((p) => re.test(p.name));
}

function getPillarOneLiner(note: string): string {
  const sentence = note.split(/\.\s+/)[0];
  return sentence.length > 180
    ? sentence.slice(0, 180).replace(/\s+\S+$/, "") + "..."
    : sentence + ".";
}

/** The 1-to-7 public-evidence ladder in plain shopper language. */
const EVIDENCE_LADDER_PLAIN: Record<number, string> = {
  1: "no supporting proof is publicly visible",
  2: "general ingredient research, not a test of this product",
  3: "the ingredient percentage is disclosed",
  4: "the brand states the finished formula was tested",
  5: "a named third-party lab tested the finished product",
  6: "a clinical study with sample size, duration and method",
  7: "a published or registered study you can look up",
};

/** Rewrite raw "level N of 7" phrasing into plain language so shoppers read
    what the level means, not a bare number. Applied at render time, so it also
    fixes cards that were reviewed before this change. */
function translateLadder(text: string): string {
  if (!text) return text;
  return text.replace(/level\s+(\d)\s+of\s+7/gi, (m, n) => {
    const plain = EVIDENCE_LADDER_PLAIN[Number(n)];
    return plain ? `${plain} (evidence level ${n} of 7)` : m;
  });
}

/** Consumer-friendly one-liner per pillar, derived from product context. */
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
    const isAnhydrous =
      product.productType === "sunscreen" &&
      product.ingredients.length > 0 &&
      product.ingredients[0].name.toLowerCase().includes("dimethicone");
    const isMineral = pass.some(
      (b) => b.includes("100% mineral") || (b.includes("mineral") && b.includes("zinc"))
    );
    if (isAnhydrous && isMineral) return "Water free silicone gel base designed for a lighter, matte finish.";
    if (isAnhydrous) return "Anhydrous silicone gel base for a smooth, non-greasy wear.";
    if (product.productType === "sunscreen" && pass.some((b) => b.includes("filter"))) {
      return "Multi-filter formula designed for broad-spectrum coverage and photostability.";
    }
    return getPillarOneLiner(pillar.note);
  }

  if (displayName === "Claims Evidence") {
    const hasSPFEvidence = pass.some(
      (b) => b.includes("published spf") || (b.includes("spf") && b.includes("test"))
    );
    const hasMultipleReports = pass.filter(
      (b) => b.includes("published") || b.includes("test report") || b.includes("dermatologist")
    ).length >= 2;
    if (hasSPFEvidence && hasMultipleReports && pct >= 80) {
      return "Strong public evidence compared with most sunscreen product pages.";
    }
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
  // Prefer per-product claimsCheck when available - it is accurate and product-specific
  const fromData = claimsCheckToProofCards(product);
  if (fromData.length > 0) return fromData;

  // Fallback: generate from badges for products without claimsCheck
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

    cards.push({
      claim: "UVA / PA Protection",
      status: "supported",
      explanation: "PA rating is stated on packaging. The brand's pattern of publishing test reports supports this claim.",
      evidenceType: "Brand claim + test report pattern",
    });

    if (pass.some((b) => b.includes("100% mineral") || (b.includes("mineral") && (b.includes("zinc") || b.includes("only"))))) {
      cards.push({
        claim: "100% Mineral Formula",
        status: "verified",
        explanation: "Zinc Oxide is the only UV filter in the ingredient list. No chemical filters present. Confirmed directly from the INCI.",
        evidenceType: "INCI check",
      });
    }

    if (pass.some((b) => b.includes("water resist"))) {
      cards.push({
        claim: "Water Resistant",
        status: "supported",
        explanation: "A published water resistance test report is available from the brand.",
        evidenceType: "Published test report",
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
        ? "A published non-comedogenic test report exists, but Isostearic Acid is in the formula and has comedogenic potential on some rating scales."
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
        ? "Brand claims vegan, but Whey Protein (dairy-derived) appears in the ingredient list. This is a direct public evidence contradiction."
        : "A published vegan test report is available. No animal-derived ingredients found in the INCI.",
      evidenceType: hasVeganContradiction ? "INCI check vs brand claim" : "Published test report",
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

  // Fragrance free
  const fragFree = pass.some((b) => b.includes("fragrance-free") || b.includes("fragrance free"));
  const hasFragAllergen = warn.some((b) =>
    b.includes("fragrance allergen") || b.includes("lemongrass") || b.includes("citral") ||
    b.includes("benzyl alcohol") || b.includes("parfum")
  );
  if (fragFree) items.push({ label: "Fragrance free", value: true });
  else if (hasFragAllergen) items.push({ label: "Fragrance free", value: false });

  // Essential oil free
  const eoFree = pass.some((b) => b.includes("no essential oils") || b.includes("essential oil free"));
  if (eoFree) items.push({ label: "Essential oil free", value: true });

  // Alcohol free (check ingredient list)
  const hasAlcohol = product.ingredients.some((i) => {
    const n = i.name.toLowerCase();
    return n === "alcohol" || n.includes("alcohol denat");
  });
  const alcoholWarn = warn.some((b) => b.includes("denatured alcohol") || b.includes("alcohol denat"));
  if (hasAlcohol || alcoholWarn) items.push({ label: "Alcohol free", value: false });
  else items.push({ label: "Alcohol free", value: true });

  // Paraben free
  const hasParaben = product.ingredients.some((i) => i.name.toLowerCase().includes("paraben"));
  items.push({ label: "Paraben free", value: !hasParaben });

  // Non-comedogenic
  if (pass.some((b) => b.includes("non-comedogenic"))) {
    items.push({ label: "Non-comedogenic", value: true });
  }

  // Dermatologist tested
  if (pass.some((b) => b.includes("dermatologist"))) {
    items.push({ label: "Dermatologist tested", value: true });
  }

  // Vegan
  const isVegan = pass.some((b) => b.includes("vegan"));
  const hasVeganContradiction = warn.some((b) => b.includes("vegan") && (b.includes("whey") || b.includes("dairy")));
  if (isVegan && !hasVeganContradiction) items.push({ label: "Vegan", value: true });
  else if (hasVeganContradiction) items.push({ label: "Vegan", value: false });

  // Sunscreen-specific
  if (product.productType === "sunscreen") {
    const spfVerified = pass.some((b) => b.includes("published spf") || (b.includes("spf") && b.includes("test")));
    items.push({ label: "SPF verified", value: spfVerified });

    const reefSafe = pass.some((b) => b.includes("reef-safe") || b.includes("reef safe"));
    if (reefSafe) items.push({ label: "Reef safe", value: true });
  }

  return items.slice(0, 8);
}

// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// View
// ─────────────────────────────────────────────────────────────────────────────

/* A product from a brand not sold in India. The review engine has no ₹ price to
   show and sets priceRange to a "Not found in India" style string. When that's
   the case we can't run India-specific checks (price parity, platform claims,
   CDSCO/ASCI posture), so the detailed body is masked. */
export function isUnavailableInIndia(product: ProductScorecard): boolean {
  const pr = (product.priceRange ?? "").toLowerCase();
  if (!pr.includes("india")) return false;
  return /\bnot\b|unavailable|\bn\/?a\b|no listing|not listed/.test(pr);
}

/* Replaces the full analysis for products not sold in India: keeps the hero
   (verdict, best/avoid, ingredient list, India context) and masks the rest. */
function IndiaUnavailableBody({ product }: { product: ProductScorecard }) {
  const brandName = product.brand?.trim() || "This brand";
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
      <div className="rounded-2xl border border-[#efe9e0] bg-[#faf7f2] p-7 sm:p-10 text-center">
        <div className="w-12 h-12 rounded-full bg-[#248179]/10 flex items-center justify-center mx-auto mb-5">
          <MapPin size={22} className="text-[#248179]" />
        </div>
        <h2 className="text-lg sm:text-xl text-[#282828] mb-2.5" style={{ fontFamily: "'Cooper BT', Georgia, serif" }}>
          Not on sale in India yet
        </h2>
        <p className="text-sm text-[#282828]/70 leading-relaxed max-w-lg mx-auto">
          {brandName}{" "}isn&apos;t available on Indian platforms, so a full India-specific review
          (price parity across Nykaa, Amazon and Flipkart, platform claim checks, and the
          CDSCO / ASCI read) isn&apos;t possible. The verdict above is based on the brand&apos;s
          published ingredient list and its global claims.
        </p>
        <p className="text-xs text-[#b0a8a4] mt-5 max-w-md mx-auto leading-relaxed">
          We&apos;ll run the complete Clean Sheet review the day it lands in the Indian market.
        </p>
      </div>
    </div>
  );
}

/* ── Category-driven qualitative screen (no scores) ── */
const SCREEN_META: Record<string, { label: string; dot: string; fg: string }> = {
  verified:  { label: "Clear",        dot: "#248179", fg: "#7fb0a6" },
  disclosed: { label: "Brand-stated", dot: "#caa53a", fg: "#b79a52" },
  adverse:   { label: "Note",         dot: "#fd6158", fg: "#d1897f" },
};
const SCREEN_PILLARS = [
  "Ingredient Safety & Toxicity",
  "Irritation & Allergen Risk",
  "Ingredient Transparency",
  "Standards & Compliance",
  "Sustainability & Ethics",
] as const;
/* The screen shows only what we confirmed or the brand states. Adverse findings
   are NOT repeated here - they lead the page in the "Worth knowing" callout. */
const isShownFinding = (c: CheckResult) => c.state === "verified" || c.state === "disclosed";

/** "What to know before you buy" - only real flags. Calm, not alarmist:
    a warm hairline card, a quiet eyebrow, one clean line per flag. */
function BeforeYouBuy({ flags }: { flags: CheckResult[] }) {
  if (!flags.length) return null;
  return (
    <section id="before-you-buy">
      <div className="rounded-[20px] border border-[#f0d9d4] bg-[#fdf6f4] px-5 py-5 sm:px-6 sm:py-6">
        <p className="text-[10.5px] uppercase tracking-[0.16em] text-[#c2362f]/90 mb-4">Worth knowing before you buy</p>
        <div className="space-y-4">
          {flags.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <span className="w-[7px] h-[7px] rounded-full flex-shrink-0 mt-[7px] bg-[#fd6158]" />
              <p className="text-[13.5px] sm:text-[14.5px] text-[#282828] leading-[1.55]" style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>
                <span className="font-medium">{c.label}.</span>{" "}
                <span className="text-[#282828]/80">{c.detail}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The category-scoped safety & compliance screen - findings only (no scores,
    undisclosed checks hidden). Airy rows, hairline group rules, quiet chips. */
function SafetyScreen({ analysis }: { analysis: AnalysisReport }) {
  const shown = analysis.checks.filter(isShownFinding);
  if (!shown.length) return null;
  return (
    <section id="safety-screen">
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className="w-[3px] h-[18px] rounded-full bg-[#248179] flex-shrink-0" />
        <h2 className="text-sm text-[#282828]" style={{ fontFamily: "'Cooper BT', sans-serif" }}>Safety &amp; compliance screen</h2>
      </div>
      <p className="text-xs text-[#b0a8a4] pl-[19px] mb-4" style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>
        What we could confirm from public sources and the verified ingredient list.
      </p>
      <div className="bg-white rounded-[20px] border border-[#efe9e0] overflow-hidden">
        {SCREEN_PILLARS.map((pillar) => {
          const rows = shown.filter((c) => c.pillar === pillar);
          if (!rows.length) return null;
          return (
            <div key={pillar} className="border-b border-[#f1ece4] last:border-0 px-5 sm:px-6 py-5">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#c3bbb2] mb-3.5">{pillar}</p>
              <div className="space-y-4">
                {rows.map((c) => {
                  const m = SCREEN_META[c.state];
                  return (
                    <div key={c.id} className="flex items-start gap-3">
                      <span className="w-[7px] h-[7px] rounded-full flex-shrink-0 mt-[7px]" style={{ background: m.dot }} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-[13.5px] sm:text-[14.5px] text-[#282828] leading-snug" style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>{c.label}</span>
                          <span className="text-[9.5px] uppercase tracking-[0.1em] flex-shrink-0" style={{ color: m.fg }}>{m.label}</span>
                        </div>
                        <p className="mt-1 text-[12.5px] text-[#282828]/55 leading-[1.55]" style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>{c.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] text-[#c3bbb2] leading-[1.6] pl-[1px]" style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>
        Screened against a curated reference set that we are continuing to verify and expand, so &ldquo;clear&rdquo; means no flag from that set, not a guarantee. Not a substitute for a full toxicological or clinical assessment.
      </p>
    </section>
  );
}

export function ProductScorecardView({
  product,
  brand,
  brandSlug,
  relatedProducts = [],
  analysis,
}: {
  product: ProductScorecard;
  brand: Brand;
  brandSlug: string;
  relatedProducts?: ProductScorecard[];
  /** Category-driven qualitative screen (live reviews only; undefined for
      static catalogue products). Adds the safety screen + flags, no scores. */
  analysis?: AnalysisReport;
}) {
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
        brandSlug={brandSlug}
      />

      {/* ── Body ── (masked when the product isn't sold in India) */}
      {isUnavailableInIndia(product) ? (
        <IndiaUnavailableBody product={product} />
      ) : (
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 space-y-8">

        {/* 0. What to know before you buy (live reviews only). Category already
             lives in the hero eyebrow, so it is not repeated here. */}
        {analysis && <BeforeYouBuy flags={analysis.redFlags} />}

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

        {/* 2. What was checked - collapsible */}
        {proofCards.length > 0 && (() => {
          return (
            <CollapsibleSection
              id="proof"
              title="What was checked"
              subtitle={`${product.claimsCheck?.length ?? proofCards.length} claims checked against public evidence`}
            >
              <div className="p-4">
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
              </div>
            </CollapsibleSection>
          );
        })()}

        {/* 2b. Category-driven safety & compliance screen (live reviews) */}
        {analysis && <SafetyScreen analysis={analysis} />}

        {/* 3. The detail - per-area rationale (no scores).
             Live reviews lead with the Safety & compliance screen above, so this
             second audit block is shown only for static catalogue products
             (which have no analysis) to avoid two parallel audits on one page. */}
        {!analysis && (
        <section id="score-rationale">
          <div className="mb-4">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-[3px] h-[18px] rounded-full bg-[#248179] flex-shrink-0" />
              <h2 className="text-sm text-[#282828]" style={{ fontFamily: "'Cooper BT', sans-serif" }}>The detail</h2>
            </div>
            <p className="text-xs text-[#b0a8a4] pl-[19px]" style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>
              How we read this product across {product.pillars.length} areas. Open any row for the full rationale.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#efe9e0] overflow-hidden divide-y divide-[#efe9e0]">
            {product.pillars.map((pillar) => {
              const displayName = simplifyPillarName(pillar.name);
              const rawSummary = translateLadder(generatePillarSummary(pillar, product));
              const detail = translateLadder(pillar.note ?? "");
              // Drop the summary when it is just the opening of the detailed note (the old duplication).
              const summaryIsPrefix = !!detail && !!rawSummary && detail.toLowerCase().startsWith(rawSummary.replace(/\.$/, "").toLowerCase());
              const summary = summaryIsPrefix ? "" : rawSummary;
              const showDetail = !!detail && detail !== rawSummary;
              const claimRows = displayName === "Claims Evidence" ? (product.claimsCheck ?? []).slice(0, 3) : [];

              return (
                <details key={pillar.name} className="group">
                  <summary className="px-4 py-3.5 cursor-pointer list-none select-none">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm text-[#282828]" style={{ fontFamily: "'Cooper BT', sans-serif" }}>{displayName}</span>
                      </div>
                      <ChevronDown size={12} className="text-[#b0a8a4] transition-transform group-open:rotate-180 flex-shrink-0 ml-4" />
                    </div>
                  </summary>
                  <div className="px-4 pb-4 pt-4 bg-[#f7f7f5] border-t border-[#efe9e0] space-y-2">
                    {summary && <p className="text-xs text-[#282828]/80 leading-relaxed pl-[46px]" style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>{summary}</p>}
                    {showDetail && <p className="text-xs text-[#282828]/65 leading-relaxed pl-[46px]" style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>{detail}</p>}
                    {claimRows.length > 0 && (
                      <div className="pl-[46px] pt-1 space-y-1.5">
                        {claimRows.map((c, i) => {
                          const ok = c.decision === "Publicly supported";
                          const needs = c.decision === "Needs proof";
                          const dot = ok ? "#248179" : needs ? "#E08A3C" : "#fd6158";
                          return (
                            <div key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: dot }} />
                              <p className="text-xs text-[#282828]/70 leading-relaxed" style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>
                                <span className="text-[#282828]">&ldquo;{c.claim}&rdquo;</span>{" "}
                                {translateLadder(c.note || (ok ? "Supported by public evidence." : needs ? "Needs more public proof." : "Not verified from public evidence."))}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </section>
        )}

        {/* 4. Full ingredient list - collapsible */}
        {(() => {
          return (
            <CollapsibleSection
              id="ingredients"
              title="Ingredient list"
              subtitle={`${product.ingredients.length} ingredients · INCI order`}
            >
              <div className="p-4">
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
                <div className="rounded-xl border border-[#efe9e0] overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#faf7f2] border-b border-[#efe9e0]">
                        <th className="py-2 px-3 sm:px-4 text-[10px] font-medium text-[#b0a8a4] uppercase tracking-wider w-[52%] sm:w-auto">Ingredient</th>
                        <th className="py-2 px-3 sm:px-4 text-[10px] font-medium text-[#b0a8a4] uppercase tracking-wider hidden sm:table-cell">What it does</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.ingredients.map((ing) => {
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
                </div>
                <p className="text-[10px] text-[#b0a8a4] mt-2">
                  INCI order as declared on packaging. Position reflects approximate concentration (high to low).
                </p>
              </div>
            </CollapsibleSection>
          );
        })()}

        {/* 5. Regulatory screen - collapsible */}
        {product.globalScreen && (() => {
          const authorities = [
            { key: "eu_1223_2009",        label: "EU 1223/2009",         desc: "EU Cosmetics Regulation - Annexes II–VI" },
            { key: "india_cr_2020",        label: "India CR 2020",        desc: "India Cosmetics Rules, CDSCO" },
            { key: "health_canada_hotlist",label: "Health Canada Hotlist", desc: "Canada prohibited & restricted ingredients" },
            { key: "us_fda_21cfr",         label: "US FDA 21 CFR",        desc: "US FDA Parts 700–740" },
            { key: "korea_mfds",           label: "MFDS Korea",           desc: "Korea Cosmetics Act" },
            { key: "echa_svhc",            label: "ECHA SVHC",            desc: "Substances of Very High Concern" },
            { key: "iarc",                 label: "IARC",                 desc: "Carcinogen classifications Groups 1/2A/2B" },
            { key: "aicis_australia",      label: "AICIS Australia",      desc: "Australian industrial chemical safety" },
            { key: "tga_australia",        label: "TGA Australia",        desc: "Therapeutic claims (if applicable)" },
            { key: "canada_nhpid",         label: "Canada NHPID",         desc: "Natural health product ingredients" },
          ] as const;
          const regClear = (v: string) => {
            const t = v.toLowerCase().trim();
            return t === "" || /^no\b/.test(t) || t.includes("no obvious") || t.includes("not triggered");
          };
          const flagged = authorities.filter(({ key }) => !regClear(product.globalScreen![key as keyof typeof product.globalScreen] ?? "")).length;
          const allClear = flagged === 0;
          return (
            <CollapsibleSection
              id="regulatory-screen"
              title="Regulatory screen"
              subtitle="Each ingredient mapped against 10 global regulatory authorities"
              headerRight={
                <span className="flex items-center gap-2.5">
                  <PillarDots score={10 - flagged} max={10} />
                  <span className="text-xs" style={{ color: allClear ? "#248179" : "#b45309", fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>
                    {allClear ? "Clear" : "Review"}
                  </span>
                </span>
              }
            >
              <div className="divide-y divide-[#efe9e0]">
                {authorities.map(({ key, label, desc }) => {
                  const val = product.globalScreen![key as keyof typeof product.globalScreen] ?? "";
                  const isClear = regClear(val);
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
              <p className="text-[10px] text-[#b0a8a4] px-4 py-2.5 border-t border-[#efe9e0]">Flags are based on publicly available INCI only. Not a substitute for full regulatory compliance review.</p>
            </CollapsibleSection>
          );
        })()}

        {/* 5b. Regulatory screen - claim level (ASCI + India drug-cosmetic boundary) - collapsible */}
        {product.regulatoryFlags && product.regulatoryFlags.length > 0 && (
          <CollapsibleSection
            id="regulatory-claims"
            title="Regulatory screen - claims"
            subtitle="ASCI advertising code and the India drug-cosmetic boundary."
            headerRight={
              <span className="flex items-center gap-2.5">
                <PillarDots score={0} max={4} />
                <span className="text-xs" style={{ color: "#c2362f", fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>
                  {product.regulatoryFlags.length} flag{product.regulatoryFlags.length > 1 ? "s" : ""}
                </span>
              </span>
            }
          >
            <div className="divide-y divide-[#efe9e0]">
              {product.regulatoryFlags.map((f, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3.5">
                  <span className="mt-1.5 block w-1.5 h-1.5 rounded-full bg-[#fd6158] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-[#282828]">&ldquo;{f.claim}&rdquo;</p>
                    {f.note && <p className="text-xs text-[#282828]/55 leading-relaxed mt-0.5">{f.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* 6. Claims check - collapsible */}
        {product.claimsCheck && product.claimsCheck.length > 0 && (() => {
          const claimPillar = findPillar(product.pillars, /claim/i);
          const supported = product.claimsCheck.filter((c) => c.decision === "Publicly supported").length;
          return (
            <CollapsibleSection
              id="claims-check"
              title="Claims checked"
              subtitle={`${supported} of ${product.claimsCheck.length} publicly supported`}
              headerRight={claimPillar ? <SectionRating score={claimPillar.score} max={claimPillar.max} /> : undefined}
            >
              <div className="p-4 space-y-2.5">
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
            </CollapsibleSection>
          );
        })()}

        {/* 7. Missing proof */}
        {product.missingProof && product.missingProof.length > 0 && (
          <section id="missing-proof">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-[3px] h-[18px] rounded-full bg-[#b0a8a4] flex-shrink-0" />
              <div>
                <h2 className="text-sm text-[#282828]" style={{ fontFamily: "'Cooper BT', sans-serif" }}>What would strengthen this review</h2>
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

        {/* 9. About this review - absorbs methodology + India context */}
        <section id="methodology">
          <div className="bg-[#282828] rounded-2xl p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <ShieldCheck size={20} className="text-[#248179] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-white mb-2">About this review</div>
                <p className="text-white/60 text-sm leading-relaxed mb-3">
                  {product.cleanSheetNote ??
                    "This is a web evidence review, not a Clean Sheet certification. We checked the ingredient list, publicly available test reports, marketing claims, and formula logic using only public information available at the time of review."}
                </p>
                <p className="text-white/45 text-xs leading-relaxed mb-4">
                  Are you the brand? If you have published test data or want to request a re-review, write to us at{" "}
                  <a
                    href={`mailto:hello@thecleansheet.in?subject=${encodeURIComponent(`Re-review request · ${product.brand} ${product.productName}`)}`}
                    className="text-[#248179] hover:underline"
                  >
                    hello@thecleansheet.in
                  </a>
                  .
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-1 mb-4">
                  {["Independent review", "Public evidence only"].map((m) => (
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
              </div>
            </div>
          </div>
        </section>

        {/* 7. More from brand - horizontal scrollable strip */}
        {relatedProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-[3px] h-[18px] rounded-full bg-[#248179] flex-shrink-0" />
                <h2 className="text-sm text-[#282828]" style={{ fontFamily: "'Cooper BT', sans-serif" }}>More from {brand.name}</h2>
              </div>
              <Link href={`/brands/${brandSlug}`} className="text-xs text-[#248179] hover:underline flex items-center gap-1">
                See all <ArrowRight size={11} />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2">
              {relatedProducts.map((p) => {
                return (
                  <Link
                    key={p.slug}
                    href={`/brands/${brandSlug}/${p.slug}`}
                    className="group flex-shrink-0 flex items-center gap-2.5 p-3 rounded-xl border border-[#efe9e0] hover:border-[#248179]/30 hover:shadow-sm transition-all bg-white w-[200px] sm:w-auto"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#faf7f2] overflow-hidden flex-shrink-0">
                      <Image
                        src={p.image}
                        alt={p.productName}
                        width={40}
                        height={40}
                        className="object-contain p-1 w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-[#282828] group-hover:text-[#248179] transition-colors line-clamp-2 leading-snug">
                        {p.productName}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <TierBadge tier={resolveTier(p)} size="sm" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Back link */}
        <Link
          href={`/brands/${brandSlug}`}
          className="inline-flex items-center gap-2 text-sm text-[#b0a8a4] hover:text-[#282828] transition-colors"
        >
          <ArrowLeft size={14} /> Back to {brand.name}
        </Link>
      </div>
      )}
    </div>
  );
}
