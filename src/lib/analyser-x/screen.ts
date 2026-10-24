/* ────────────────────────────────────────────────────────────────
   Analyser vX · the safety and compliance screen, as facts

   Calls the existing deterministic engines (runAnalysis, pillarStanding, the
   ingredient database) and reduces them to the values the rules read. It is the
   bridge that lets vX reuse the 41-check screen unchanged. Phase 3 refactors
   runAnalysis to take facts directly and removes the review-shaped shell.
──────────────────────────────────────────────────────────────── */

import { runAnalysis } from "@/lib/analysis-engine";
import { pillarStanding } from "@/lib/pillar-standing";
import { bannedIngredientsInInci, endocrineFlaggedInInci, ingredientSafety } from "@/lib/ingredient-db";
import { findCatchAllIngredients } from "@/lib/inci-catchall";
import { productScopeOf } from "@/lib/product-scope";
import type { ProductReview } from "@/lib/product-review-types";
import type { ClaimFlags } from "./claimflags";
import { prohibitingAuthorities, regulationOf } from "./regulatory";
import type { ScreenValue } from "./types";

const CODE_PILLARS = ["Ingredient Safety & Toxicity", "Irritation & Allergen Risk"];

/** The four-pillar grader runs here only to say which pillars fail (for block.pillars). Its standing label (Good Standing and
    the rest) is not carried: the shopper-facing output is the buying decision alone. */
export function computeScreen(review: ProductReview, inci: string[], flags: ClaimFlags): ScreenValue {
  // A ban we cannot attribute to an authority (a database row graded low confidence) is not a prohibition; the
  // benchmark shows it as unverified. A name the database lacks (the backstop list) is attributed from its note.
  const scope = productScopeOf(review.productName, review.category ?? "");
  const prohibited = bannedIngredientsInInci(inci, scope)
    .map((p) => ({ ...p, authorities: prohibitingAuthorities(p.name, p.note, scope) }))
    .filter((p) => p.authorities.length > 0 || !regulationOf(p.name, "").resolved);
  const endocrine = endocrineFlaggedInInci(inci);
  const resolvedNow = (n: string) => { const s = ingredientSafety(n); return s.found && s.valid; };
  const recognised = inci.filter(resolvedNow).length;

  const softAdverse = runAnalysis(review).checks
    .filter((c) => c.state === "adverse" && !c.hard && CODE_PILLARS.includes(c.pillar))
    .map((c) => ({ label: c.label, pillar: c.pillar, detail: c.detail }));

  const hardOverride = prohibited.length > 0 || flags.contradicted.length > 0 || flags.fairness.length > 0;
  const standing = pillarStanding({
    review, inci,
    bannedCount: prohibited.length,
    claimsOutcome: flags.contradicted.length > 0 || flags.fairness.length > 0 ? "hard" : flags.boundary.length > 0 ? "boundary" : "none",
    hardOverride,
    boundaryOnly: !hardOverride && flags.boundary.length > 0,
  });

  return {
    prohibited,
    endocrine,
    softAdverse,
    coverage: inci.length ? recognised / inci.length : 0,
    recognised,
    total: inci.length,
    unresolved: inci.filter((n) => !resolvedNow(n)),
    catchAll: findCatchAllIngredients(inci).map((h) => h.name),
    failingPillars: standing.pillars.filter((p) => p.status === "failing").map((p) => ({ pillar: p.pillar, score: p.score, hardFail: p.hardFail })),
  };
}

/** A minimal review-shaped object, so the existing 41-check screen and the pillar grader can run over facts. The
    screen reads only the fields set here. Phase 3 refactors runAnalysis to take facts directly and removes this. */
export function reviewShell(
  p: { name: string; brand: string; category: string; targetUser: string },
  inci: string[],
  claims: { text: string; platforms: string[]; types: string[]; primaryType: string; asciConcern: boolean; drugBoundary: boolean; corroborated?: boolean; evidenceLevel: number }[],
  sourceUrl?: string,
): ProductReview {
  return {
    type: "product-review", productName: p.name, brand: p.brand, parentCompany: null, category: p.category, quantity: "", priceRange: "",
    pricePerMl: "", targetUser: p.targetUser, heroPromise: "", priceAcrossPlatforms: [], lowestPrice: "", priceInsight: "",
    claimMap: claims.map((c) => ({
      text: c.text, source: c.platforms[0] ?? "", types: c.types, primaryType: c.primaryType, riskLevel: "low", evidenceLevel: c.evidenceLevel,
      evidenceNote: "", absoluteLanguage: false, asciConcern: c.asciConcern, asciNote: null, drugBoundaryRisk: c.drugBoundary, drugBoundaryNote: null, corroborated: c.corroborated,
    })),
    ingredientTransparency: { score: 3, fullInciAvailable: inci.length > 0, usageWarningsClear: false, issues: [] },
    formulaLogic: { claimOverreach: false, claimOverreachNote: null, note: "", irritancyConcerns: [] },
    consumerSuitability: { bestFor: [], avoidIf: [] },
    platformParity: { consistent: true, issues: [] },
    verdict: { bestThing: "", biggestConcern: "", cleanSheetTakeaway: "" },
    scores: { priceFairness: 0, claimClarity: 0, claimEvidence: 0, ingredientTransparency: 0, formulaLogic: 0, consumerSuitability: 0, platformConsistency: 0, total: 0, label: "Consumer Confusion Risk" },
    inciIngredients: inci,
    ...(sourceUrl ? { inciSourceUrl: sourceUrl } : {}),
  } as unknown as ProductReview;
}
