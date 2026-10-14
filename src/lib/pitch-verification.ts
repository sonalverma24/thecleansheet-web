import type { ClaimAnalysis, DerivedVerdict, ProductReview } from "@/lib/product-review-types";
import type { BabyLensResult } from "@/lib/baby-lens";
import type { PitchCheck, PitchVerification } from "@/data/pitch/types";

/* Turns a stored review into the popup record for the retailer pitch demo.

   The stamp is EARNED, never placed: a product qualifies only when the engine's
   verdict is the strict `approved` tier (no hard flags, total >= 85, claim
   evidence >= 15, INCI retrieved) AND the baby lens passes. Anything else returns
   null and the product shows no stamp and no popup. */

export function qualifiesForStamp(verdict: Pick<DerivedVerdict, "tier">, lens: Pick<BabyLensResult, "pass">): boolean {
  return verdict.tier === "approved" && lens.pass;
}

export function formatUpdated(d: Date): string {
  const day = d.getDate();
  const mon = d.toLocaleString("en-GB", { month: "short" });
  return `${day} ${mon} ${String(d.getFullYear()).slice(2)}`;
}

/** A claim counts as supported only with finished-product evidence (level 4+),
    that the page actually makes (not fabricated) and that is not a red flag. */
function isSubstantive(c: ClaimAnalysis): boolean {
  return c.primaryType !== "emotional" && c.corroborated !== false;
}
function isSupported(c: ClaimAnalysis): boolean {
  return isSubstantive(c) && c.evidenceLevel >= 4 && c.riskLevel !== "red-flag";
}

function toCount(raw: string | undefined): number | undefined {
  const n = Number((raw ?? "").replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

const INDIAN_MARKETPLACE = /nykaa|amazon\.in|flipkart|tira|purplle|myntra|firstcry|blinkit|zepto|swiggy|bigbasket/i;

export function buildVerification(
  review: ProductReview,
  verdict: DerivedVerdict,
  lens: BabyLensResult,
  updated: string,
): PitchVerification | null {
  if (!qualifiesForStamp(verdict, lens)) return null;

  const inci = review.inciIngredients ?? [];
  const substantive = review.claimMap.filter(isSubstantive);
  const supported = substantive.filter(isSupported);

  const ingredientChecks: PitchCheck[] = [
    {
      text: "No restricted or prohibited ingredients found",
      note: "Every ingredient on the label checked against The Clean Sheet restricted-ingredient screen",
    },
    {
      text: "No ingredients restricted in baby products",
      note: lens.ageText ? `Checked for the age on the label: ${lens.ageText}` : "Checked as if for the youngest users",
    },
  ];
  if (lens.fragranceFree) ingredientChecks.push({ text: "Fragrance-free" });

  const ds = review.dataSource;
  const platforms = ds?.reviewPlatforms ?? [];
  const indian = platforms.filter((p) => INDIAN_MARKETPLACE.test(p));
  const ratingText = ds?.rating != null ? `${ds.rating.toFixed(1)} out of 5` : null;
  const countText = ds?.reviewCount ? `${ds.reviewCount} ratings` : null;
  const indianLine = indian.length
    ? [ratingText, countText, indian.join(", ")].filter(Boolean).join(" · ")
    : undefined;

  return {
    source: "engine",
    updated,
    details: [lens.ageText, review.quantity, review.category].filter((d): d is string => !!d),
    ingredients: { screened: inci.length, total: inci.length, checks: ingredientChecks },
    claims: {
      assessed: substantive.length,
      supported: supported.length,
      checks: supported.slice(0, 4).map((c) => ({
        text: c.text,
        note: c.evidenceNote ? c.evidenceNote.trim() : undefined,
      })),
    },
    reviews: {
      analysed: toCount(ds?.reviewCount),
      indianMarketplaces: indianLine,
    },
  };
}
