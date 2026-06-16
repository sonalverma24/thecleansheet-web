import type { ProductScorecard } from "@/data/brands/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ConcernType = "Low concern" | "Moderate concern" | "High concern" | "Not enough data";

export type FormulationQuality = "Excellent" | "Good" | "Average" | "Weak" | "Not enough data";

export interface ComparisonRow {
  concernType: ConcernType;
  formulationQuality: FormulationQuality;
  ingredientsOfConcern: string;
  pricePerMl: string;
}

export interface DecisionSummary {
  bestOverall: ProductScorecard;
  bestOverallReason: string;
  bestValue: ProductScorecard;
  useCaution: ProductScorecard | null;
  useCautionReason: string | null;
}

// ── Pillar helpers ────────────────────────────────────────────────────────────

function pillarPct(score: number, max: number): number {
  if (!max) return 0;
  return Math.round((score / max) * 100);
}

export function getFormulationPct(p: ProductScorecard): number {
  return p.pillars[1] ? pillarPct(p.pillars[1].score, p.pillars[1].max) : 0;
}

// ── Concern type ──────────────────────────────────────────────────────────────

export function getConcernType(p: ProductScorecard): ConcernType {
  if (!p.score) return "Not enough data";
  const hasFragranceInLeaveOn =
    p.fragranceStatus && p.fragranceStatus !== "free" && p.fragranceStatus !== "unknown" &&
    p.productType === "leave-on";
  const warnCount = p.warn_badges.length + (p.cautionTags?.length ?? 0);

  if (p.score >= 80 && warnCount === 0 && !hasFragranceInLeaveOn) return "Low concern";
  if (p.score >= 65 || (p.score >= 55 && warnCount <= 1)) return "Moderate concern";
  return "High concern";
}

// ── Formulation quality ───────────────────────────────────────────────────────

export function getFormulationQuality(p: ProductScorecard): FormulationQuality {
  const pct = getFormulationPct(p);
  if (!p.pillars[1]) return "Not enough data";
  if (pct >= 85) return "Excellent";
  if (pct >= 70) return "Good";
  if (pct >= 55) return "Average";
  if (pct >= 40) return "Weak";
  return "Not enough data";
}

// ── Ingredients of concern ────────────────────────────────────────────────────

export function getIngredientsOfConcern(p: ProductScorecard): string {
  const parts: string[] = [];

  if (p.fragranceStatus === "synthetic" || p.fragranceStatus === "both") {
    parts.push("Fragrance");
  } else if (p.fragranceStatus === "essential-oil") {
    parts.push("Essential oils");
  } else if (
    !p.fragranceStatus &&
    (p.warn_badges.some((b) => b.toLowerCase().includes("fragrance")) ||
      p.ingredients.some((i) => ["fragrance", "parfum"].includes(i.name.toLowerCase())))
  ) {
    parts.push("Fragrance");
  }

  if (p.alcoholStatus === "contains-drying") {
    parts.push("Drying alcohol");
  }

  if (
    p.warn_badges.some((b) => /sensitisat|sensitizat/i.test(b)) ||
    p.cautionTags?.some((t) => /sensitisat|sensitizat/i.test(t))
  ) {
    parts.push("High sensitisation potential");
  }

  // Check for undisclosed actives: key actives with no % in name and no verified claim
  const hasUndisclosed = p.keyActives.some(
    (a) => !/\d+(\.\d+)?%/.test(a.name) && a.function.toLowerCase().includes("active")
  );
  if (hasUndisclosed && getFormulationPct(p) < 70) {
    parts.push("Undisclosed actives");
  }

  if (parts.length === 0) return "None major";
  return parts.join(" / ");
}

// ── Price per ml display ──────────────────────────────────────────────────────

export function getPricePerMlDisplay(p: ProductScorecard): string {
  if (p.pricePerUnit && p.sizeUnit) {
    return `₹${p.pricePerUnit.toFixed(2)}/${p.sizeUnit}`;
  }
  return " - ";
}

// ── Build comparison row ──────────────────────────────────────────────────────

export function buildComparisonRow(p: ProductScorecard): ComparisonRow {
  return {
    concernType: getConcernType(p),
    formulationQuality: getFormulationQuality(p),
    ingredientsOfConcern: getIngredientsOfConcern(p),
    pricePerMl: getPricePerMlDisplay(p),
  };
}

// ── Top pick reason ───────────────────────────────────────────────────────────

function buildTopPickReason(p: ProductScorecard, allProducts: ProductScorecard[]): string {
  const parts: string[] = [];
  const concern = getConcernType(p);
  const quality = getFormulationQuality(p);

  if (concern === "Low concern") parts.push("low concern profile");
  if (quality === "Excellent") parts.push("strong formulation quality");
  else if (quality === "Good") parts.push("good formulation quality");

  const hasLowestPricePerUnit =
    p.pricePerUnit &&
    allProducts.every((other) => !other.pricePerUnit || other.pricePerUnit >= p.pricePerUnit!);
  if (hasLowestPricePerUnit) parts.push("fair price per ml");

  const isHighestScore = allProducts.every((other) => other.score <= p.score);
  if (isHighestScore) parts.push("highest Clean Sheet score");

  if (p.fragranceStatus === "free") parts.push("fragrance-free formula");

  if (parts.length === 0) parts.push("strongest overall score and formula quality");

  // Join: "A, B, C, and D"
  if (parts.length === 1) return `Best ${parts[0]}.`;
  const last = parts.pop()!;
  return `Best balance of ${parts.join(", ")}, and ${last}.`;
}

// ── Use caution reason ────────────────────────────────────────────────────────

function buildCautionReason(p: ProductScorecard): string {
  const reasons: string[] = [];
  const hasFragranceLeaveOn =
    p.fragranceStatus && p.fragranceStatus !== "free" && p.fragranceStatus !== "unknown" &&
    p.productType === "leave-on";

  if (hasFragranceLeaveOn) reasons.push("fragrance in a leave-on formula");
  if (p.warn_badges.some((b) => /sensitiv|react/i.test(b))) reasons.push("may not suit sensitive or reactive skin");
  if (p.warn_badges.some((b) => /pregnan|breastfeed/i.test(b))) reasons.push("not recommended during pregnancy");
  if (p.score < 65) reasons.push("lower overall formula score");

  if (reasons.length === 0) reasons.push("lower overall score and more caution flags than alternatives");
  return reasons.slice(0, 2).join(" and ");
}

// ── Decision summary ──────────────────────────────────────────────────────────

export function buildDecision(products: ProductScorecard[]): DecisionSummary {
  // Best overall: highest score, tiebreak fewest warn_badges
  const bestOverall = [...products].sort(
    (a, b) => b.score - a.score || a.warn_badges.length - b.warn_badges.length
  )[0];

  // Best value: best price per ml given score >= 65; fallback to lowest price
  const withPrice = products.filter((p) => !!p.pricePerUnit);
  const bestValue =
    withPrice.length >= 2
      ? [...withPrice].sort((a, b) => (a.pricePerUnit ?? 99999) - (b.pricePerUnit ?? 99999))[0]
      : [...products].sort((a, b) => (a.price ?? 99999) - (b.price ?? 99999))[0];

  // Use caution: lowest score with at least one concern flag, must not be best overall
  const cautionCandidates = products.filter(
    (p) =>
      p !== bestOverall &&
      (p.warn_badges.length > 0 ||
        p.score < 70 ||
        (p.fragranceStatus && p.fragranceStatus !== "free" && p.fragranceStatus !== "unknown" && p.productType === "leave-on"))
  );
  const useCaution = cautionCandidates.length > 0
    ? [...cautionCandidates].sort((a, b) => a.score - b.score)[0]
    : null;

  return {
    bestOverall,
    bestOverallReason: buildTopPickReason(bestOverall, products),
    bestValue,
    useCaution,
    useCautionReason: useCaution ? buildCautionReason(useCaution) : null,
  };
}
