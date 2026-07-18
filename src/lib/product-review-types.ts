/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ — Product Review types (the original "v3.0" engine)
   Self-contained so it never clashes with the claim_check types in
   types.ts (which redefine EvidenceLevel as A–D). Here EvidenceLevel is
   the original 1–7 ladder.
──────────────────────────────────────────────────────────────── */

export type ClaimType =
  | "functional" | "appearance" | "active" | "concern" | "time-bound"
  | "clinical" | "safety" | "free-from" | "emotional";

export type ClaimRiskLevel = "low" | "medium" | "high" | "very-high" | "red-flag";

/** Original evidence ladder, 1 (no proof) → 7 (published/registered study). */
export type EvidenceLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface ClaimAnalysis {
  text: string;
  source: string;
  types: ClaimType[];
  primaryType: ClaimType;
  riskLevel: ClaimRiskLevel;
  evidenceLevel: EvidenceLevel;
  evidenceNote: string;
  absoluteLanguage: boolean;
  asciConcern: boolean;
  asciNote: string | null;
  drugBoundaryRisk: boolean;
  drugBoundaryNote: string | null;
}

export interface PlatformPrice {
  platform: string;
  price: string | null;
  pricePerMl: string | null;
  note: string | null;
}

/** Per-ingredient read, engine-authored from the real INCI (Plum-page depth). */
export interface IngredientRead {
  name: string;
  role: string;                 // "Solvent", "Active", "Preservative", "Emollient", "Fragrance", …
  note: string;                 // one-line consumer explanation of what it does / why noted
  flag: "ok" | "info" | "warn"; // green / worth-noting / caution
}

/** A hero active the product is built around, with a plausibility read. */
export interface KeyActiveRead {
  name: string;
  function: string;             // what it does for the user ("Brightening / pore refining")
  concentrationConfidence: "High" | "Medium" | "Low"; // how confident we are it's at a working level
}

/** Regulatory screen across the 10 authorities the curated pages use. */
export interface RegulatoryScreen {
  eu_1223_2009: string;
  india_cr_2020: string;
  us_fda_21cfr: string;
  korea_mfds: string;
  health_canada_hotlist: string;
  canada_nhpid: string;
  tga_australia: string;
  aicis_australia: string;
  echa_svhc: string;
  iarc: string;
}

export interface IngredientTransparencyReview {
  score: 1 | 2 | 3 | 4 | 5;
  label:
    | "Ingredient theatre"
    | "Basic label transparency"
    | "Good consumer transparency"
    | "Strong formula transparency"
    | "Evidence backed transparency";
  fullInciAvailable: boolean;
  inciSource: string;
  inciOrderCorrect: boolean;
  activePercentagesDisclosed: boolean;
  complexesExplained: boolean;
  preservativesVisible: boolean;
  fragranceDisclosed: boolean;
  phDisclosedWhereRelevant: boolean;
  usageWarningsClear: boolean;
  issues: string[];
}

export interface FormulaLogicReview {
  heroIngredientsMatchClaim: boolean;
  formatSuitableForClaim: boolean;
  activesLikelyMeaningful: boolean;
  baseFormulaAppropriate: boolean;
  claimOverreach: boolean;
  claimOverreachNote: string | null;
  irritancyConcerns: string[];
  note: string;
}

export interface ConsumerSuitabilityReview {
  bestFor: string[];
  avoidIf: string[];
  routineFit: string;
  layeringNotes: string;
  sensitivityRisk: string;
  immediateExpectation: string;
  longTermExpectation: string;
  pregnancyOrTeenNote: string | null;
}

export interface PlatformParity {
  consistent: boolean;
  issues: string[];
  amplificationPattern: string | null;
  mostCautiousPlatform: string;
  packVsOnline: string;
  reelAngle: string;
}

export interface ProductReviewScores {
  priceFairness: number;
  claimClarity: number;
  claimEvidence: number;
  ingredientTransparency: number;
  formulaLogic: number;
  consumerSuitability: number;
  platformConsistency: number;
  total: number;
  label:
    | "Clean Sheet Strong"
    | "Mostly Transparent"
    | "Needs More Clarity"
    | "High Claim Risk"
    | "Consumer Confusion Risk";
}

export interface ProductReviewVerdict {
  bestThing: string;
  biggestConcern: string;
  claimRisk: "low" | "medium" | "high" | "red-flag";
  transparencyLevel: "poor" | "basic" | "good" | "strong";
  whoItMaySuit: string;
  whoShouldBeCareful: string;
  cleanSheetTakeaway: string;
}

export interface ProductReviewReelVersion {
  costAcrossPlatforms: string;
  whatItClaims: string;
  whatProofIsVisible: string;
  whatFormulaSupports: string;
  whatConsumerShouldExpect: string;
}

export interface ProductReviewDataSource {
  inciFound: boolean;
  inciSource: string;
  priceSource: string;
  reviewPlatforms: string[];
  rating: number | null;
  reviewCount: string;
  userSentiment: string;
}

export interface ProductReview {
  type: "product-review";
  productName: string;
  brand: string;
  parentCompany: string | null;
  category: string;
  quantity: string;
  priceRange: string;
  pricePerMl: string;
  targetUser: string;
  heroPromise: string;

  priceAcrossPlatforms: PlatformPrice[];
  lowestPrice: string;
  priceInsight: string;

  claimMap: ClaimAnalysis[];
  claimSummary: {
    total: number;
    byRisk: { low: number; medium: number; high: number; veryHigh: number; redFlag: number };
    highestEvidenceLevel: EvidenceLevel;
    mostCommonType: string;
    asciConcernCount: number;
    drugBoundaryCount: number;
  };

  ingredientTransparency: IngredientTransparencyReview;
  formulaLogic: FormulaLogicReview;
  consumerSuitability: ConsumerSuitabilityReview;
  platformParity: PlatformParity;
  scores: ProductReviewScores;
  verdict: ProductReviewVerdict;
  reelVersion: ProductReviewReelVersion;
  dataSource: ProductReviewDataSource;

  cleanSheetNote: string;

  /* Added by the engine, not the LLM */
  imageUrl?: string | null;
  methodologyVersion?: string;
  reviewedAt?: string;
  /** Resolved INCI (ground truth used for grading), for display. */
  inciIngredients?: string[];
  /** Plum-depth detail authored by the engine from the real INCI. */
  ingredientReads?: IngredientRead[];
  keyActivesRead?: KeyActiveRead[];
  regulatoryScreen?: RegulatoryScreen;
  inciSourceUrl?: string;
  /** Canonical product key for the review repository. */
  productSlug?: string;
}

/* ─── Derived approved / not-approved verdict (computed in code) ─── */

export interface ReviewGate {
  id: "claims" | "evidence" | "formula";
  label: string;
  passed: boolean;
  detail: string;
}

export type ReviewTier = "approved" | "mostly-clean" | "needs-proof" | "misleading";

export interface DerivedVerdict {
  /** Kept for registry back-compat; derived from tier. */
  status: "approved" | "not_approved";
  tier: ReviewTier;
  tierLabel: string;
  headline: string;
  gates: ReviewGate[];
  standard: string;
}
