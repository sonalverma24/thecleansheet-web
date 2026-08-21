/**
 * ProductHero - Light editorial design, V3.
 *
 * Desktop: 2-col layout - content left / image + score + actions right.
 * Mobile: name → image+badge → content → actions stacked.
 *
 * All exported helpers are stable.
 */

import Image from "next/image";
import Link from "next/link";
import type { ProductScorecard, Brand } from "@/data/brands/types";
import { resolveBadges } from "@/data/badges/resolver";
import type { BadgeDefinition } from "@/data/badges/taxonomy";
import { scoreColors } from "@/data/brands";
import { resolveTier, TierBadge, ApprovedStamp, TierStamp } from "@/components/scorecards/pillar-ui";
import type { ReviewTier } from "@/lib/product-review-types";
import { HeroActions } from "./HeroActions";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Consumer Fit Statement
// ─────────────────────────────────────────────────────────────────────────────

export function generateConsumerFitStatement(product: ProductScorecard): string {
  const concern = product.concern.toLowerCase();
  const isMineral = product.pass_badges.some((b) => b.toLowerCase().includes("mineral"));
  const hasFragranceFree = product.pass_badges.some(
    (b) =>
      b.toLowerCase().includes("fragrance-free") ||
      b.toLowerCase().includes("fragrance free")
  );

  if (product.skinTypeTags?.length) {
    const skinStr = product.skinTypeTags
      .slice(0, 2)
      .map((t) => t.replace("acne-prone", "acne prone").replace(/-/g, " "))
      .join(", ");

    if (product.productType === "sunscreen") {
      const filterType = isMineral ? "mineral" : "broad-spectrum";
      const finishNote =
        isMineral && product.skinTypeTags.some((t) => t.includes("oily") || t.includes("acne"))
          ? "without a greasy finish"
          : "for daily use";
      return `Built for ${skinStr} skin that wants ${filterType} sun protection ${finishNote}.`;
    }

    if (product.concernTags?.length) {
      const c0 = product.concernTags[0].toLowerCase();
      const c1 = product.concernTags[1]?.toLowerCase();
      const benefitPhrases: Record<string, string> = {
        acne: "acne control and pore refinement",
        pigmentation: "brightening and dark spot reduction",
        dullness: "brightening and an even skin tone",
        hydration: "deep hydration and barrier support",
        "dark-spots": "dark spot reduction and even tone",
        "dark spots": "dark spot reduction and even tone",
        ageing: "anti-ageing support and firming",
        redness: "redness reduction and soothing",
        texture: "smoother texture and refined pores",
      };
      const primaryBenefit = benefitPhrases[c0] ?? benefitPhrases[c1 ?? ""] ?? `${c0} care`;
      const ffNote = hasFragranceFree ? " without fragrance" : "";
      return `Built for ${skinStr} skin that wants ${primaryBenefit}${ffNote}.`;
    }

    if (product.skinTypeTags.some((t) => t.includes("dry") || t.includes("barrier"))) {
      return `Built for ${skinStr} skin that needs richer daily moisture${hasFragranceFree ? " without fragrance" : ""}.`;
    }
  }

  if (product.productType === "sunscreen") {
    const isOily = concern.includes("oil") || concern.includes("acne") || concern.includes("oily");
    const filterType = isMineral ? "mineral" : "broad-spectrum chemical";
    if (isOily) {
      const finishNote = isMineral ? "without a greasy finish" : "with a lightweight finish";
      return `Built for oily, acne prone skin that wants ${filterType} sun protection ${finishNote}.`;
    }
    if (concern.includes("dry") || concern.includes("sensitive")) {
      return `Built for dry or sensitive skin that wants ${filterType} sun protection with a gentle formula.`;
    }
    return `Built for daily sun protection with a ${filterType} formula designed for Indian skin and climate.`;
  }

  if (product.productType === "leave-on" || product.productType === "toner") {
    if (concern.includes("niacinamide") || (concern.includes("acne") && concern.includes("pore"))) {
      return "Built for oily and acne prone skin that wants evidence backed brightening and pore refinement.";
    }
    if (concern.includes("vitamin c") || concern.includes("brightening") || concern.includes("glow")) {
      return "Built for dull, uneven skin that wants antioxidant protection and a beginner friendly glow boost.";
    }
    if (concern.includes("hydrat") || concern.includes("hyaluronic") || concern.includes("moisture")) {
      return `Built for skin that needs multi-layer hydration and barrier support${hasFragranceFree ? " without fragrance" : ""}.`;
    }
    if (concern.includes("retinol") || concern.includes("anti-age") || concern.includes("firmness")) {
      return "Built for skin that wants clinically supported anti-ageing actives in a beginner-safe format.";
    }
    if (concern.includes("dark spot") || concern.includes("pigment") || concern.includes("uneven")) {
      return "Built for skin dealing with uneven tone and post-blemish marks that wants a targeted brightening treatment.";
    }
    if (concern.includes("salicylic") || concern.includes("bha") || concern.includes("exfoliat")) {
      return "Built for oily, congested skin that wants exfoliation and pore clearing without heavy irritation.";
    }
  }

  if (product.productType === "rinse-off") {
    if (concern.includes("baby") || concern.includes("infant")) {
      return "Built for parents looking for a mild rinse-off formula with fewer fragrance-related triggers.";
    }
    const category = product.category?.toLowerCase() ?? "cleanser";
    return `Built for daily use as a gentle ${category} reviewed for ingredient safety and formula quality.`;
  }

  if (product.productType === "treatment") {
    return "Built for targeted treatment use, reviewed for active concentration, safety signals, and claims evidence.";
  }

  const ptMap: Record<string, string> = { "leave-on": "serum", "rinse-off": "cleanser", "sunscreen": "sunscreen", "toner": "toner", "treatment": "treatment", "baby": "baby product", "eye-area": "eye-area product", "hair": "hair product" };
  const category = product.category ?? ptMap[product.productType] ?? product.productType.replace(/-/g, " ");
  return `A ${category.toLowerCase()} reviewed for formula signals, ingredient safety, claims evidence, and consumer suitability.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Verdict
// ─────────────────────────────────────────────────────────────────────────────

export function generateVerdict(product: ProductScorecard): string {
  const pass = product.pass_badges.map((b) => b.toLowerCase());
  const warn = product.warn_badges;
  const concern = product.concern.toLowerCase();

  let base = "";

  if (product.productType === "sunscreen") {
    const isMineral = pass.some(
      (b) => b.includes("100% mineral") || (b.includes("mineral") && b.includes("zinc"))
    );
    const isFragFree = pass.some(
      (b) => b.includes("fragrance-free") || b.includes("fragrance free")
    );
    const isEOFree = pass.some((b) => b.includes("no essential oils") || b.includes("essential oil free"));
    const hasSPFEvidence = pass.some(
      (b) => b.includes("published spf") || (b.includes("spf") && b.includes("test"))
    );
    const isPentaFilter = product.pass_badges.some(
      (b) => b.includes("5 Photostable") || b.includes("Penta") || b.includes("penta")
    );
    const isAnhydrous = product.ingredients[0]?.name.toLowerCase().includes("dimethicone");

    if (isMineral && isAnhydrous && isFragFree && isEOFree) {
      base = `A mineral only sunscreen using Zinc Oxide as the sole UV filter in a water-free gel base${hasSPFEvidence ? ", with published SPF test reports" : ""}`;
    } else if (isMineral && isFragFree) {
      base = `A mineral only, fragrance free sunscreen${hasSPFEvidence ? " with strong public SPF evidence" : ""}`;
    } else if (isPentaFilter) {
      const filterCount = "five";
      base = `A ${filterCount}-filter chemical sunscreen using next-generation EU-approved UV filters${hasSPFEvidence ? ", supported by published SPF test reports" : ""}`;
    } else if (isMineral) {
      base = `A mineral only sunscreen (Zinc Oxide)${hasSPFEvidence ? " with published SPF test reports" : ""}`;
    } else {
      base = `A broad-spectrum chemical sunscreen${hasSPFEvidence ? " with published SPF evidence" : ""}`;
    }
  } else if (product.productType === "leave-on" || product.productType === "toner") {
    const isFragFree = pass.some(
      (b) => b.includes("fragrance-free") || b.includes("fragrance free")
    );
    const activeNames = product.keyActives?.slice(0, 2).map((a) => a.name).join(" and ");

    if (concern.includes("hydrat") || concern.includes("hyaluronic")) {
      base = `A multi-weight hyaluronic acid serum${activeNames ? ` with ${activeNames}` : ""}${isFragFree ? ", fragrance free formula" : ""}`;
    } else if (concern.includes("niacinamide") || concern.includes("pore")) {
      base = `A niacinamide-based formula targeting pore refinement and oil control${isFragFree ? ", fragrance free" : ""}`;
    } else if (concern.includes("vitamin c") || concern.includes("brightening")) {
      base = `A Vitamin C brightening serum${isFragFree ? " in a fragrance free formula" : ""}`;
    } else if (concern.includes("retinol") || concern.includes("retinoid")) {
      base = `A retinoid formula${isFragFree ? " without fragrance" : ""} - not for daytime use`;
    } else if (concern.includes("dark spot") || concern.includes("pigment")) {
      base = `A targeted treatment for uneven tone and post-blemish marks${isFragFree ? ", fragrance free" : ""}`;
    } else {
      const cat = product.category ?? "leave-on formula";
      base = `A ${cat.toLowerCase()}${activeNames ? ` with ${activeNames}` : ""}${isFragFree ? ", fragrance free" : ""}`;
    }
  } else if (product.productType === "rinse-off") {
    const isFragFree = pass.some((b) => b.includes("fragrance-free") || b.includes("fragrance free"));
    const cat = product.category?.toLowerCase() ?? "cleanser";
    base = `A ${cat}${isFragFree ? " without fragrance or essential oils" : ""} reviewed for ingredient safety and formula logic`;
  } else {
    const cat = product.category ?? product.productType.replace(/-/g, " ");
    base = `A ${cat.toLowerCase()} reviewed for active safety, formula logic, and claims evidence`;
  }

  let watchOut = "";
  if (warn.length > 0) {
    const w = warn[0].toLowerCase();
    if (w.includes("isostearic") || w.includes("comedogenic")) {
      watchOut = " The main watch out is Isostearic Acid, which may not suit every acne prone user.";
    } else if (w.includes("whey") && w.includes("vegan")) {
      watchOut = " The main watch out is a vegan claim contradiction: Whey Protein appears in the ingredient list.";
    } else if (w.includes("transcutol") || w.includes("penetration")) {
      watchOut = " The main watch out is an undisclosed penetration enhancer in the formula.";
    } else if (
      w.includes("benzyl alcohol") ||
      (w.includes("fragrance allergen") && (w.includes("lemongrass") || w.includes("citral")))
    ) {
      watchOut = " The main watch out is fragrance allergens present despite the no synthetic fragrance claim.";
    } else if (w.includes("fragrance allergen")) {
      watchOut = " The main watch out is fragrance allergens present in the formula.";
    } else if (w.includes("spf") && (w.includes("not verified") || w.includes("unusual"))) {
      watchOut = " The main watch out is the SPF claim cannot be verified from public evidence.";
    } else if (w.includes("retinol") || w.includes("retinoid")) {
      watchOut = " The main watch out is retinoid use context: not for daytime or during pregnancy.";
    } else if (w.includes("oxybenzone") || w.includes("benzophenone")) {
      watchOut = " The main watch out is Oxybenzone, flagged for potential hormonal disruption.";
    } else if (w.includes("labelling") || w.includes("labeling")) {
      watchOut = " The main watch out is labelling issues identified in the public ingredient list.";
    }
  }

  return base + "." + watchOut;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Score Meaning
// ─────────────────────────────────────────────────────────────────────────────

export function generateScoreMeaning(product: ProductScorecard): [string, string] {
  const pass = product.pass_badges.map((b) => b.toLowerCase());
  const warn = product.warn_badges;

  let evidence: string;
  if (pass.some((b) => b.includes("published spf") || (b.includes("spf") && b.includes("test")))) {
    evidence = "Strong public evidence";
  } else if (
    pass.filter(
      (b) =>
        b.includes("published") ||
        b.includes("test report") ||
        b.includes("dermatologist") ||
        b.includes("non-comedogenic")
    ).length >= 2
  ) {
    evidence = "Good public evidence";
  } else if (product.score >= 85) {
    evidence = "Strong ingredient profile";
  } else if (product.score >= 70) {
    evidence = "Good public evidence";
  } else if (product.score >= 50) {
    evidence = "Limited public evidence";
  } else {
    evidence = "Weak public evidence";
  }

  let note: string;
  if (warn.length === 0) {
    note = "No major caution flags";
  } else {
    const w = warn[0].toLowerCase();
    if (w.includes("isostearic") || w.includes("comedogenic")) note = "One acne prone skin note";
    else if (w.includes("fragrance allergen") || w.includes("benzyl alcohol")) note = "Fragrance allergen note";
    else if (w.includes("whey") || (w.includes("vegan") && w.includes("contradiction"))) note = "Vegan claim contradiction";
    else if (w.includes("transcutol") || w.includes("penetration")) note = "Undisclosed penetration enhancer";
    else if (w.includes("spf") && (w.includes("not verified") || w.includes("unusual"))) note = "SPF not publicly verified";
    else if (w.includes("retinol") || w.includes("retinoid")) note = "Retinoid use context note";
    else if (w.includes("oxybenzone") || w.includes("benzophenone")) note = "UV filter caution";
    else note = "One formulation note";
  }

  return [evidence, note];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Hero Badges
// ─────────────────────────────────────────────────────────────────────────────

export function getHeroBadges(product: ProductScorecard): BadgeDefinition[] {
  const all = resolveBadges(product);
  const byFamily = (family: BadgeDefinition["family"]) => all.filter((b) => b.family === family);

  const verification = byFamily("verification");
  const actives = byFamily("active");
  const freeFrom = byFamily("free_from");
  const suitability = byFamily("suitability");

  let slot1: BadgeDefinition | undefined;
  let slot2: BadgeDefinition | undefined;

  if (product.productType === "sunscreen") {
    slot1 =
      verification.find((b) => b.id === "SPF_VERIFIED") ??
      verification.find((b) => b.id === "UVA_VERIFIED") ??
      verification.find((b) => b.id !== "INCI_VERIFIED" && b.id !== "FORMULA_REVIEWED") ??
      verification[0];
    slot2 =
      actives.find((b) => b.id === "ZINC_OXIDE") ??
      actives.find((b) => b.id === "TITANIUM_DIOXIDE") ??
      actives[0];
  } else {
    slot1 =
      verification.find(
        (b) => b.id !== "INCI_VERIFIED" && b.id !== "FORMULA_REVIEWED" && b.id !== "UNDER_REVIEW"
      ) ?? verification[0];
    slot2 = actives[0];
  }

  const slot3 = freeFrom.find((b) => b.id === "FRAGRANCE_FREE") ?? freeFrom[0];
  const usedIds = new Set([slot1?.id, slot2?.id, slot3?.id]);
  const slot4 = freeFrom.find((b) => !usedIds.has(b.id)) ?? suitability[0];
  usedIds.add(slot4?.id);
  const slot5 =
    verification.find(
      (b) =>
        !usedIds.has(b.id) && b.id !== "INCI_VERIFIED" && b.id !== "FORMULA_REVIEWED"
    ) ?? suitability.find((b) => !usedIds.has(b.id));

  const selected = [slot1, slot2, slot3, slot4, slot5].filter(
    (b): b is BadgeDefinition => b !== undefined
  );

  const seen = new Set<string>();
  return selected
    .filter((b) => {
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    })
    .slice(0, 5);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: One Thing To Know
// ─────────────────────────────────────────────────────────────────────────────

export interface OneThingToKnow {
  text: string;
  type: "caution" | "data-gap";
}

export function getOneThingToKnow(product: ProductScorecard): OneThingToKnow | null {
  if (!product.warn_badges?.length) return null;

  const raw = product.warn_badges[0];
  const s = raw.toLowerCase();

  if (s.includes("isostearic acid") || (s.includes("comedogenic") && s.includes("acne"))) {
    return { text: "Isostearic Acid is not a safety red flag, but it can matter if your skin clogs easily. Acne prone users should patch test and watch for congestion.", type: "caution" };
  }
  if ((s.includes("whey protein") || s.includes("dairy")) && s.includes("vegan")) {
    return { text: "The ingredient list includes Whey Protein, a dairy-derived ingredient. This directly contradicts the brand's 100% vegan claim.", type: "caution" };
  }
  if (s.includes("transcutol") || s.includes("ethoxydiglycol") || s.includes("diethylene glycol monoethyl")) {
    return { text: "Contains a penetration enhancer (Transcutol) that increases how deeply all co-formulated actives absorb into skin. Not disclosed by the brand.", type: "caution" };
  }
  if ((s.includes("propylene glycol") || s.includes("pgme")) && s.includes("penetration")) {
    return { text: "Contains Propylene Glycol acting as a penetration enhancer, increasing absorption of all co-formulated actives into the skin.", type: "caution" };
  }
  if (s.includes("denatured alcohol") || s.includes("alcohol denat")) {
    return { text: "Contains denatured alcohol, which can disrupt the skin barrier and cause dryness or irritation with repeated use on sensitive or dry skin.", type: "caution" };
  }
  if (s.includes("oxybenzone") || s.includes("benzophenone-3")) {
    return { text: "Contains Oxybenzone (Benzophenone-3), flagged for potential hormonal disruption in systemic absorption studies.", type: "caution" };
  }
  if (s.includes("octinoxate") && (s.includes("hormonal") || s.includes("leave-on") || s.includes("lip"))) {
    return { text: "Contains Octinoxate, which has raised hormonal disruption concerns in absorption studies, particularly relevant for lip products or leave-on formulas.", type: "caution" };
  }
  if (s.includes("octinoxate")) {
    return { text: "Contains Octinoxate. This UV filter is under regulatory review in several markets for potential hormonal disruption signals.", type: "caution" };
  }
  if (s.includes("homosalate")) {
    return { text: "Contains Homosalate, categorised as FDA Category III (insufficient safety data for daily use).", type: "caution" };
  }
  if (s.includes("octocrylene")) {
    return { text: "Contains Octocrylene, which can degrade to Benzophenone over time. Worth knowing for daily leave-on use.", type: "caution" };
  }
  if (s.includes("spf") && (s.includes("not published") || s.includes("no spf test") || s.includes("not verified") || s.includes("unusual") || s.includes("unverified") || s.includes("no standardised"))) {
    return { text: "The SPF claim could not be verified from publicly available test evidence. See the claims evidence section below.", type: "data-gap" };
  }
  if (s.includes("fragrance allergen") || (s.includes("allergen") && (s.includes("fragrance") || s.includes("parfum") || s.includes("oil")))) {
    return { text: "Contains one or more declared fragrance allergens. Sensitisation risk is higher in leave-on products.", type: "caution" };
  }
  if (s.includes("synthetic fragrance") && s.includes("leave-on")) {
    return { text: "Contains synthetic fragrance in a leave-on product. Allergen disclosure is limited unless the full allergen list is published by the brand.", type: "caution" };
  }
  if (s.includes("synthetic fragrance") || s.includes("contains fragrance")) {
    return { text: "Contains synthetic fragrance. Individual allergen components are not disclosed beyond what the brand publishes.", type: "caution" };
  }
  if (s.includes("phototoxic") || (s.includes("citrus") && s.includes("oil"))) {
    return { text: "Contains a citrus or phototoxic essential oil. Phototoxic reactions are possible after daytime application.", type: "caution" };
  }
  if (s.includes("phmb") || s.includes("polyhexamethylene biguanide")) {
    return { text: "Contains PHMB, a preservative restricted in rinse-off cosmetics in the EU.", type: "caution" };
  }
  if (s.includes("retinol") || s.includes("retinoid") || s.includes("retinyl") || s.includes("retinoic")) {
    const hasPregnancy = s.includes("pregnancy") || s.includes("pregnant") || s.includes("conceive");
    return {
      text: hasPregnancy
        ? "Contains a retinoid. Not recommended during pregnancy or when trying to conceive. Not suitable for daytime use without SPF."
        : "Contains a retinoid. Not suitable for daytime use without SPF. Introduce gradually and do not layer with other actives.",
      type: "caution",
    };
  }
  if (s.includes("labelling error") || s.includes("labeling error")) {
    return { text: "A labelling issue was identified in the public ingredient list. Cross-check the INCI on product packaging before purchasing.", type: "caution" };
  }
  if (s.includes("low active concentration") || s.includes("low concentration")) {
    const activeMatch = raw.match(/\(([^)]+)\)/)?.[1];
    return {
      text: activeMatch
        ? `The ${activeMatch} concentration appears low based on INCI position. The claimed benefit may be limited at the level present.`
        : "The key active appears at a low concentration based on INCI position. The claimed benefit may be limited.",
      type: "data-gap",
    };
  }
  if (s.includes("not verified") || s.includes("not published") || s.includes("unsubstantiated")) {
    return { text: "One or more marketing claims could not be verified from publicly available evidence. See the claims section for detail.", type: "data-gap" };
  }

  const cleaned = raw
    .replace(/^PUBLIC CONCERN:\s*/i, "")
    .replace(/^FLAG:\s*/i, "")
    .replace(/^CAUTION:\s*/i, "")
    .replace(/^WARNING:\s*/i, "")
    .trim();

  if (cleaned.length <= 120) {
    return { text: `${cleaned}. Check the ingredient breakdown below for context.`, type: "caution" };
  }

  const cut = cleaned.slice(0, 100).replace(/\s+\S+$/, "").replace(/[.,;-]+$/, "");
  return { text: `${cut}. Check the ingredient breakdown below for full context.`, type: "caution" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Score Rationale (preserved export)
// ─────────────────────────────────────────────────────────────────────────────

export function generateScoreRationale(product: ProductScorecard): string {
  const pass = product.pass_badges.map((b) => b.toLowerCase());
  const warn = product.warn_badges;
  const concern = product.concern.toLowerCase();

  const signals: string[] = [];

  if (pass.some((b) => b.includes("spf verified") || (b.includes("spf") && b.includes("test")))) signals.push("verified SPF test data");
  if (pass.some((b) => b.includes("100% mineral") || (b.includes("mineral") && b.includes("filter")) || b.includes("mineral"))) signals.push("a mineral-only UV formula");
  if (pass.some((b) => b.includes("fragrance-free") || b.includes("fragrance free"))) signals.push("a fragrance free formula");
  if (pass.some((b) => b.includes("inci verified"))) signals.push("a verified ingredient list");
  if (pass.some((b) => b.includes("claims verified") || b.includes("claims reviewed"))) signals.push("reviewed claims evidence");
  if (pass.some((b) => b.includes("active verified"))) signals.push("a verified active concentration");

  if (signals.length === 0) {
    if (concern.includes("retinol") || concern.includes("retinoid")) {
      signals.push("a straightforward active profile");
      signals.push("a fragrance free formula");
    } else if (concern.includes("niacinamide") || concern.includes("pore")) {
      signals.push("a well-positioned active combination");
    } else if (concern.includes("hydrat") || concern.includes("hyaluronic")) {
      signals.push("a sensible hydration ingredient stack");
    }
  }

  let rationale =
    signals.length >= 3
      ? `This scored well for ${signals[0]}, ${signals[1]}, and ${signals[2]}.`
      : signals.length === 2
      ? `This scored well for ${signals[0]} and ${signals[1]}.`
      : signals.length === 1
      ? `This scored well for ${signals[0]}.`
      : "This scored well across ingredient safety, formula logic, and evidence quality.";

  if (warn.length > 0) {
    const w = warn[0].toLowerCase();
    if (w.includes("isostearic acid") || (w.includes("comedogenic") && w.includes("acne"))) {
      rationale += " The main caution is an acne prone skin flag from Isostearic Acid.";
    } else if (w.includes("whey protein") && w.includes("vegan")) {
      rationale += " The main caution is a vegan claim contradiction: Whey Protein is in the list.";
    } else if (w.includes("transcutol") || w.includes("penetration enhancer")) {
      rationale += " The main caution is an undisclosed penetration enhancer in the formula.";
    } else if (w.includes("fragrance allergen")) {
      rationale += " The main caution is a fragrance allergen present in the formula.";
    } else if (w.includes("retinol") || w.includes("retinoid") || w.includes("retinyl")) {
      rationale += " The main caution is retinoid use context: not for daytime or during pregnancy.";
    } else if (w.includes("spf") && (w.includes("not verified") || w.includes("unverified"))) {
      rationale += " The main caution is the SPF claim could not be verified from public data.";
    } else {
      rationale += " Check the detailed scorecard for caution context.";
    }
  } else {
    rationale += " No major caution flags were identified.";
  }

  return rationale;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Quick Decision
// ─────────────────────────────────────────────────────────────────────────────

interface QuickDecision {
  bestFor: string[];
  cautionIf: Array<{ label: string; reason?: string }>;
}

/** Keep the engine's own phrasing when it doesn't map to a canned skin-type
    label — trimmed, sentence-cased, and only if it's a sane short phrase. */
function cleanTag(s: string): string {
  const t = s.trim().replace(/\s+/g, " ");
  if (t.length < 2 || t.length > 64) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Remove near-duplicate phrases: when a fuller phrase already covers a shorter
    one (e.g. "Post-acne marks" alongside "Post-acne marks and dark spots"),
    keep only the more descriptive wording. Order is preserved. */
function dedupePhrases(list: string[]): string[] {
  const norm = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  const out: string[] = [];
  for (const item of list) {
    const ni = norm(item);
    if (!ni) continue;
    if (out.some((o) => norm(o) === ni)) continue; // exact duplicate
    if (out.some((o) => norm(o).includes(ni))) continue; // already covered by a fuller phrase
    const subsetIdx = out.findIndex((o) => ni.includes(norm(o)));
    if (subsetIdx >= 0) {
      out[subsetIdx] = item; // this phrase is the fuller one — upgrade the kept entry
      continue;
    }
    out.push(item);
  }
  return out;
}

/** Ground an "Avoid if" flag in a concrete reason so it never reads as an
    unexplained warning. Prefers the reviewer's own stated reason carried in the
    raw caution text (e.g. "...(due to Retinyl Palmitate)"), then falls back to
    the actual INCI. Returns undefined when the tidy label already stands on its
    own (a preference, say). Never invents a reason. */
function getCautionReason(product: ProductScorecard, label: string): string | undefined {
  const l = label.toLowerCase();

  // The keyword the tidy label and its raw source string share.
  const keyword =
    /pregnan|conceive|breastfeed/.test(l) ? /pregnan|conceive|breastfeed/ :
    /fragrance|parfum|scent/.test(l) ? /fragrance|parfum|scent/ :
    /retino/.test(l) ? /retino/ :
    /spf/.test(l) ? /spf/ :
    /alcohol/.test(l) ? /alcohol/ :
    null;

  // 1) Preserve the reviewer's own reason from the raw caution / warning text.
  if (keyword) {
    const raw = [...(product.cautionTags ?? []), ...(product.warn_badges ?? [])].find(
      (s) => keyword.test(s.toLowerCase())
    );
    if (raw) {
      const paren = raw.match(/\(([^)]+)\)/)?.[1];
      if (paren) return paren.trim();
      const clause = raw.match(/\b(?:due to|because of|owing to)\b[^.,;()]+/i)?.[0];
      if (clause) return clause.trim();
    }
  }

  // 2) Fall back to grounding the flag in the actual INCI.
  const inci = (product.ingredients ?? []).map((i) => i.name);
  const find = (re: RegExp) => inci.find((n) => re.test(n.toLowerCase()));
  if (/pregnan|conceive|breastfeed/.test(l)) {
    const retinoid = find(/retinol|retinal|retinyl|retino(ic|ate)|tretinoin|adapalene/);
    if (retinoid) return `contains ${retinoid}`;
    const salicylate = find(/salicylic/);
    if (salicylate) return `contains ${salicylate}`;
  } else if (/fragrance|parfum|scent/.test(l)) {
    if (find(/\b(fragrance|parfum)\b/)) return "contains fragrance";
  }

  return undefined;
}

function getQuickDecision(product: ProductScorecard): QuickDecision {
  const bestFor: string[] = [];
  const cautionIf: string[] = [];
  const concern = product.concern.toLowerCase();

  if (product.suitabilityTags?.length) {
    for (const tag of product.suitabilityTags.slice(0, 3)) {
      const t = tag.toLowerCase();
      if (t.includes("oily")) { bestFor.push("Oily and acne prone skin"); continue; }
      if (t.includes("dry")) { bestFor.push("Dry skin"); continue; }
      if (t.includes("combination")) { bestFor.push("Combination skin"); continue; }
      if (t.includes("sensitive")) { bestFor.push("Sensitive skin types"); continue; }
      if (t.includes("acne") && !bestFor.some((b) => b.toLowerCase().includes("acne"))) { bestFor.push("Acne prone skin"); continue; }
      if (t.includes("dark spot") || t.includes("pigment")) { bestFor.push("Post-acne marks and dark spots"); continue; }
      if (t.includes("pore")) { bestFor.push("Visible pores"); continue; }
      if (t.includes("beginner")) { bestFor.push("Skincare beginners"); continue; }
      if (t.includes("pregnan")) { bestFor.push("Pregnancy-safe use"); continue; }
      if (t.includes("baby")) { bestFor.push("Baby and infant skin"); continue; }
      // No canned match — keep the engine's own product-specific phrasing.
      const c = cleanTag(tag); if (c) bestFor.push(c);
    }
  }

  if (bestFor.length === 0 && product.skinTypeTags?.length) {
    for (const tag of product.skinTypeTags.slice(0, 2)) {
      const t = tag.toLowerCase();
      if (t.includes("oily")) { bestFor.push("Oily and acne prone skin"); continue; }
      if (t.includes("dry")) { bestFor.push("Dry skin"); continue; }
      if (t.includes("combination")) { bestFor.push("Combination skin"); continue; }
      if (t.includes("sensitive")) { bestFor.push("Sensitive skin"); continue; }
      if (t.includes("acne")) { bestFor.push("Acne prone skin"); continue; }
    }
  }

  if (bestFor.length < 2) {
    const isMineral = product.pass_badges.some((b) => b.toLowerCase().includes("mineral"));
    const isFragFree = product.pass_badges.some(
      (b) => b.toLowerCase().includes("fragrance-free") || b.toLowerCase().includes("fragrance free")
    );
    if (product.productType === "sunscreen") {
      if (concern.includes("oily") || concern.includes("acne")) bestFor.push("Oily and acne prone skin");
      else if (concern.includes("dry") || concern.includes("sensitive")) bestFor.push("Dry or sensitive skin");
      else bestFor.push("Daily sun protection");
      if (isMineral && !bestFor.some((b) => b.toLowerCase().includes("mineral"))) bestFor.push("Mineral UV filter preference");
      if (isFragFree && bestFor.length < 3) bestFor.push("Fragrance free routines");
    } else if (concern.includes("retinol") || concern.includes("retinoid")) {
      if (!bestFor.some((b) => b.includes("beginner"))) bestFor.push("Beginners to retinoids");
      bestFor.push("Skin with early signs of ageing");
    } else if (concern.includes("niacinamide") || concern.includes("pore")) {
      bestFor.push("Enlarged pores and uneven texture");
    } else if (concern.includes("vitamin c") || concern.includes("brightening")) {
      bestFor.push("Dull or uneven skin tone");
    } else if (concern.includes("hydrat") || concern.includes("hyaluronic")) {
      bestFor.push("Dehydrated or barrier-compromised skin");
    }
  }

  if (product.cautionTags?.length) {
    for (const tag of product.cautionTags.slice(0, 3)) {
      const t = tag.toLowerCase();
      if (t.includes("pregnan")) { cautionIf.push("Pregnant or trying to conceive"); continue; }
      if (t.includes("fragrance allergen")) { cautionIf.push("You have fragrance sensitivities"); continue; }
      if (t.includes("retinoid") || t.includes("retinol")) { cautionIf.push("Using other actives or daytime without SPF"); continue; }
      if (t.includes("acid") || t.includes("aha") || t.includes("bha")) { cautionIf.push("You have reactive or sensitised skin"); continue; }
      if (t.includes("baby")) { cautionIf.push("Using on infants without paediatrician advice"); continue; }
      if (t.includes("spf")) { cautionIf.push("Relying on the SPF claim without independent evidence"); continue; }
      if (t.includes("niacin")) { cautionIf.push("You have a known niacin sensitivity (niacin flush risk)"); continue; }
      if (t.includes("penetration enhancer")) { cautionIf.push("Stacking multiple penetration enhancer-based actives"); continue; }
      if (t.includes("ph not disclosed")) { cautionIf.push("Your skin barrier is already compromised or irritated"); continue; }
      if (t.includes("dual-acid") || t.includes("strong exfoliant")) { cautionIf.push("You have sensitive or eczema-prone skin"); continue; }
      if (t.includes("high irritation")) { cautionIf.push("You are new to active skincare - patch test first"); continue; }
      // No canned match — keep the engine's own product-specific caution.
      const c = cleanTag(tag); if (c) cautionIf.push(c);
    }
  }

  if (cautionIf.length === 0 && product.warn_badges?.length) {
    for (const badge of product.warn_badges.slice(0, 2)) {
      const b = badge.toLowerCase();
      if (b.includes("retinol") || b.includes("retinoid")) {
        cautionIf.push("Pregnant or trying to conceive");
        cautionIf.push("Using in daytime without SPF");
        break;
      }
      if (b.includes("fragrance allergen")) { cautionIf.push("You have fragrance sensitivities"); break; }
      if (b.includes("isostearic acid") || b.includes("comedogenic")) { cautionIf.push("Skin clogs easily"); break; }
      if (b.includes("transcutol") || b.includes("penetration enhancer")) { cautionIf.push("You are using prescription actives alongside"); break; }
      if (b.includes("spf") && b.includes("not verified")) { cautionIf.push("Relying on this for UV protection"); break; }
      if (b.includes("denatured alcohol") || b.includes("alcohol denat")) { cautionIf.push("Your skin is dry or barrier-compromised"); break; }
      if (b.includes("oxybenzone") || b.includes("octinoxate") || b.includes("homosalate")) { cautionIf.push("You prefer hormone-safe UV filters"); break; }
      if (b.includes("whey") && b.includes("vegan")) { cautionIf.push("You are purchasing based on the vegan claim"); break; }
    }
  }

  // No genuine caution found — show nothing rather than inventing a generic one.
  // (The "Avoid if" column hides itself when this stays empty.)

  return {
    bestFor: dedupePhrases(bestFor).slice(0, 3),
    cautionIf: dedupePhrases(cautionIf)
      .slice(0, 3)
      .map((label) => ({ label, reason: getCautionReason(product, label) })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Key Ingredients for display
// ─────────────────────────────────────────────────────────────────────────────

function getKeyIngredients(product: ProductScorecard): string[] {
  // Prefer the engine-authored hero actives. These are the ingredients the
  // product is actually built around, not whatever sits at the top of the INCI
  // (which is almost always water and a silicone slip agent like Dimethicone).
  if (product.keyActives?.length) {
    const actives = dedupePhrases(
      product.keyActives.map((a) => a.name.trim()).filter(Boolean)
    );
    if (actives.length) return actives.slice(0, 3);
  }

  // Fallback: walk the INCI but skip solvents, bulking agents and silicones so
  // we never lead with "Aqua/Water/Eau" or "Dimethicone".
  const isBase = (raw: string): boolean => {
    const n = raw.toLowerCase();
    return (
      /\b(aqua|water|eau)\b/.test(n) ||
      n.startsWith("dimethicone") ||
      n.includes("siloxane") ||
      n.includes("silsesquioxane") ||
      n === "glycerin" ||
      n.startsWith("alcohol")
    );
  };
  const featured = product.ingredients.filter((i) => !isBase(i.name)).map((i) => i.name);
  const pool = featured.length >= 2 ? featured : product.ingredients.map((i) => i.name);
  return dedupePhrases(pool).slice(0, 3);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Pillar display name
// ─────────────────────────────────────────────────────────────────────────────

function pillarDisplayName(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("ingredient") || n.includes("safety")) return "Ingredient & Safety";
  if (n.includes("formula")) return "Formula Logic";
  if (n.includes("claims")) return "Claims Evidence";
  if (n.includes("transparency")) return "Transparency";
  return name;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Format price
// ─────────────────────────────────────────────────────────────────────────────

function formatPrice(product: ProductScorecard): string {
  if (product.price && product.pricePerUnit && product.sizeValue && product.sizeUnit) {
    return `₹${product.price.toLocaleString("en-IN")} · ₹${product.pricePerUnit.toFixed(0)}/${product.sizeUnit}`;
  }
  if (product.price) return `₹${product.price.toLocaleString("en-IN")}`;
  return product.priceRange || "Price unavailable";
}

function formatAnalysedDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Circular Score Badge
// ─────────────────────────────────────────────────────────────────────────────

function ScoreBadge({ tier, size = 116, animate = true }: { tier: ReviewTier; size?: number; animate?: boolean }) {
  // Approved: the stamped TCS logo (same mark as catalogue tiles), stamping down on entry.
  if (tier === "approved") {
    return (
      <div className="flex-shrink-0">
        <ApprovedStamp size={size} animate={animate} />
      </div>
    );
  }

  // Other tiers: the rubber-stamp band (same ink-stamp language, no logo disc).
  return (
    <div className="flex-shrink-0">
      <TierStamp tier={tier} size={size} animate={animate} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Pillar dots row
// ─────────────────────────────────────────────────────────────────────────────

function PillarDotsRow({
  name,
  score,
  max,
}: {
  name: string;
  score: number;
  max: number;
}) {
  const pct = score / max;
  const filled = Math.round(pct * 4);
  const p = pct * 100;
  const dotColor =
    p >= 90 ? "#248179" : p >= 75 ? "#4C9E6A" : p >= 60 ? "#C99A2E" : p >= 45 ? "#E08A3C" : "#fd6158";

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-[#248179] leading-none">{name}</span>
      <div className="flex items-center gap-[5px] flex-shrink-0">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: i < filled ? dotColor : "#e8e2da" }}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductHeroProps {
  product: ProductScorecard;
  brand: Brand;
  okCount: number;
  warnCount: number;
  infoCount: number;
  brandSlug: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProductHero({ product, brand, okCount, warnCount, infoCount, brandSlug }: ProductHeroProps) {
  const { bestFor, cautionIf } = getQuickDecision(product);
  const priceDisplay = formatPrice(product);
  const analysedDisplay = formatAnalysedDate(product.analyzedAt);
  const keyIngredients = getKeyIngredients(product);

  const categoryLabel =
    product.category ??
    (product.productType === "sunscreen"
      ? "Sunscreen"
      : product.productType === "leave-on"
      ? "Serum"
      : product.productType === "rinse-off"
      ? "Cleanser"
      : product.productType === "toner"
      ? "Toner"
      : product.productType === "treatment"
      ? "Treatment"
      : product.productType);

  return (
    <div className="bg-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-8 pb-0 relative z-10">

        {/* Breadcrumb — brand crumb is plain text (no brand page for live reviews). */}
        <nav className="flex items-center gap-1.5 text-[11px] text-[#b0a8a4] mb-6 flex-wrap">
          {[
            { label: "Home", href: "/" as string | null },
            { label: "Brands", href: "/brands" as string | null },
            { label: brand.name, href: null },
          ].map(({ label, href }) => (
            <span key={label} className="flex items-center gap-1.5">
              {href ? (
                <Link href={href} className="hover:text-[#248179] transition-colors">
                  {label}
                </Link>
              ) : (
                <span>{label}</span>
              )}
              <span>/</span>
            </span>
          ))}
          <span className="text-[#282828]/60 line-clamp-1">{product.productName}</span>
        </nav>

        {/* ── Main 2-col grid ── */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-8 lg:gap-12 items-start">

          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Brand + category — brand is intentionally NOT a link (brand pages
                don't exist for live-reviewed products). */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-medium text-[#248179] uppercase tracking-widest">
                {brand.name.toUpperCase()}
              </span>
              <span className="w-1 h-1 rounded-full bg-[#b0a8a4] flex-shrink-0" />
              <span className="text-[11px] text-[#b0a8a4]">{categoryLabel}</span>
            </div>

            {/* Product name */}
            <h1
              className="text-[1.75rem] sm:text-[2.1rem] text-[#282828] leading-tight tracking-tight mb-3"
              style={{ fontFamily: "'Cooper BT', Georgia, serif" }}
            >
              {product.productName}
            </h1>

            {/* Verdict / summary */}
            <p className="text-sm text-[#282828]/65 leading-relaxed mb-5 max-w-xl">
              {product.summary || generateVerdict(product)}
            </p>

            {/* Mobile only: image + badge.
                The image uses `fill` over an emoji placeholder, so a missing,
                slow or failed src never leaves an empty white box. The score
                stamp sits in a fixed-width, non-animating column so its entrance
                can never scale past the viewport's right edge. */}
            <div className="lg:hidden mb-5">
              <div className="flex items-stretch gap-4">
                <div className="relative flex-1 min-w-0 rounded-2xl bg-white border border-[#efe9e0] overflow-hidden" style={{ height: 160 }}>
                  <span aria-hidden className="absolute inset-0 flex items-center justify-center text-3xl text-[#d8d2cc] select-none">🧴</span>
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.productName}
                      fill
                      sizes="(max-width: 1024px) 60vw, 220px"
                      className="object-contain p-3"
                    />
                  )}
                </div>
                <div className="flex w-[100px] flex-shrink-0 flex-col items-center justify-center gap-3">
                  <ScoreBadge tier={resolveTier(product)} size={92} animate={false} />
                  <TierBadge tier={resolveTier(product)} size="sm" />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#efe9e0] mb-5" />

            {/* Best for / Avoid if */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              {bestFor.length > 0 && (
                <div>
                  <div className="text-sm text-[#248179] mb-2.5" style={{ fontFamily: "'Cooper BT', sans-serif" }}>Best for</div>
                  <ul className="space-y-2">
                    {bestFor.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#248179]/12 border border-[#248179]/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3l2 2 4-4" stroke="#248179" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="text-xs text-[#282828]/75 leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {cautionIf.length > 0 && (
                <div>
                  <div className="text-sm text-[#fd6158] mb-2.5" style={{ fontFamily: "'Cooper BT', sans-serif" }}>Avoid if</div>
                  <ul className="space-y-2">
                    {cautionIf.map((item) => (
                      <li key={item.label} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#fd6158]/10 border border-[#fd6158]/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <circle cx="4" cy="4" r="3.25" stroke="#fd6158" strokeWidth="1.25" />
                            <path d="M2.5 4h3" stroke="#fd6158" strokeWidth="1.25" strokeLinecap="round" />
                          </svg>
                        </span>
                        <span className="text-xs text-[#282828]/70 leading-snug">
                          {item.label}
                          {item.reason && (
                            <span className="text-[#282828]/45"> ({item.reason})</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Price + date */}
            <p className="text-[11px] text-[#b0a8a4] italic mb-5">
              {priceDisplay} &bull; Analysed {analysedDisplay}
            </p>

            {/* Divider */}
            <div className="border-t border-[#efe9e0] mb-5" />

            {/* India Context */}
            {product.indiaContext && (
              <div className="mb-5">
                <div className="text-sm text-[#248179] mb-2" style={{ fontFamily: "'Cooper BT', sans-serif" }}>India Context</div>
                <p className="text-sm text-[#282828]/70 leading-relaxed">{product.indiaContext}</p>
              </div>
            )}

            {/* Key Ingredients */}
            <div className="mb-8">
              <div className="text-sm text-[#248179] mb-2" style={{ fontFamily: "'Cooper BT', sans-serif" }}>Key Ingredients</div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {keyIngredients.map((name, i) => {
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                  return (
                    <span key={name} className="flex items-center gap-2">
                      {i > 0 && <span className="text-[#b0a8a4] text-sm select-none">&bull;</span>}
                      <Link
                        href={`/ingredients/${slug}`}
                        className="text-sm text-[#282828]/80 hover:text-[#248179] transition-colors"
                      >
                        {name}
                      </Link>
                    </span>
                  );
                })}
                <Link
                  href="#ingredients"
                  className="text-sm text-[#248179] hover:underline ml-1"
                >
                  View all ingredients
                </Link>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN (desktop) ── */}
          <div className="hidden lg:flex flex-col gap-4 relative">
            {/* Lime blob - top-right decorative */}
            <svg
              className="absolute -top-8 -right-8 pointer-events-none z-0"
              width="120" height="120" viewBox="0 0 120 120" fill="none"
              aria-hidden="true"
            >
              <ellipse cx="90" cy="30" rx="70" ry="60" fill="#d6ff3e" opacity="0.55" transform="rotate(-20 90 30)" />
            </svg>

            {/* Product image + score badge */}
            <div className="relative rounded-2xl bg-white border border-[#efe9e0] flex items-center justify-center overflow-visible" style={{ minHeight: 200 }}>
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.productName}
                  width={260}
                  height={200}
                  className="object-contain p-4"
                  style={{ maxHeight: 188 }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#b0a8a4] py-8">
                  <span className="text-3xl">🧴</span>
                  <span className="text-[10px]">Image pending</span>
                </div>
              )}
              {/* Score badge - overlapping bottom-right */}
              <div className="absolute -bottom-8 -right-6 z-10">
                <ScoreBadge tier={resolveTier(product)} />
              </div>
            </div>

            {/* Spacer for badge overlap */}
            <div className="h-8" />

            {/* Live review actions (Add Review button + rating display) */}
            <HeroActions productId={`${brandSlug}/${product.slug}`} />

            {/* Buy Now */}
            <div>
              <div className="text-sm text-[#fd6158] mb-2" style={{ fontFamily: "'Cooper BT', sans-serif" }}>Buy Now</div>
              {product.retailerLinks?.length ? (
                <div className="flex flex-col gap-1.5">
                  {product.retailerLinks.map((r) => (
                    <a
                      key={r.name}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 rounded-xl border border-[#efe9e0] hover:border-[#248179]/40 hover:bg-[#248179]/[0.03] transition-all group"
                    >
                      <span className="text-xs text-[#282828]/80 group-hover:text-[#248179] transition-colors">{r.name}</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#b0a8a4] group-hover:text-[#248179] transition-colors flex-shrink-0">
                        <path d="M2.5 9.5L9.5 2.5M9.5 2.5H5M9.5 2.5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  ))}
                </div>
              ) : (product as ProductScorecard & { availabilitySources?: string[] }).availabilitySources?.length ? (
                <div className="flex items-center gap-2 flex-wrap">
                  {(product as ProductScorecard & { availabilitySources?: string[] }).availabilitySources!.map((src) => {
                    const retailerMap: Record<string, { label: string; color: string; letter: string }> = {
                      nykaa: { label: "Nykaa", color: "#fc2779", letter: "N" },
                      amazon: { label: "Amazon", color: "#ff9900", letter: "a" },
                      flipkart: { label: "Flipkart", color: "#2874f0", letter: "F" },
                      blinkit: { label: "Blinkit", color: "#f8d000", letter: "B" },
                      purplle: { label: "Purplle", color: "#6b21a8", letter: "P" },
                      myntra: { label: "Myntra", color: "#ff3e6c", letter: "M" },
                    };
                    const r = retailerMap[src];
                    if (!r) return null;
                    return (
                      <span key={src} title={r.label} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] flex-shrink-0" style={{ backgroundColor: r.color }}>
                        {r.letter}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span className="text-xs text-[#b0a8a4]">Check brand website</span>
              )}
            </div>

            {/* Pillar dots */}
            <div className="border-t border-[#efe9e0] pt-4 space-y-3">
              {product.pillars.map((pillar) => (
                <PillarDotsRow
                  key={pillar.name}
                  name={pillarDisplayName(pillar.name)}
                  score={pillar.score}
                  max={pillar.max}
                />
              ))}
              <Link
                href="#score-rationale"
                className="block text-xs font-medium italic text-[#fd6158] hover:underline pt-1"
                style={{ fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}
              >
                View more
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Disclaimer bar ── */}
      <div className="mt-8 border-t border-[#efe9e0] relative z-10">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-3">
          <p className="text-[10px] text-[#b0a8a4] leading-relaxed">
            This is a web evidence review, not a Clean Sheet certification. We checked the ingredient list, publicly available test reports, marketing claims, and formula logic using only public information available at the time of review.
          </p>
        </div>
      </div>
    </div>
  );
}
