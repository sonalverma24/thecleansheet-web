/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ - Product Review types (the original "v3.0" engine)
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
  /* ─── Engine-set guardrail fields (never authored by the LLM) ───
     corroborated: false when the engine had a text corpus (a scraped page /
     evidence doc) and could NOT find this claim's wording in it - i.e. the
     claim may have been fabricated by the model and must not push a product
     down a tier. undefined = not checked (assume made). See deriveVerdict. */
  corroborated?: boolean;
  /* inciFlagVoided: the model marked this claim contradicted/red-flag, but the
     code re-checked it against the retrieved INCI (with synonym mapping) and
     found the flag unjustified - so it is not counted as a hard flag. */
  inciFlagVoided?: boolean;
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

/** Provenance of a review's ingredient list: the evidence envelope. `captureTrust`
    says how reliably the source TEXT is captured (1 unanchored model output, 2 retailer,
    3 reference database, 4 brand page, 5 physical pack). It is not authority over the
    formula: a quote proves the text was captured as stated, not that the formula is
    true, current for this SKU, or valid for this region or version. An empty `quote`
    means the list cannot be audited. `matchedTitle` is the source's own product title. */
export interface InciEvidence {
  sourceUrl: string;
  captureTrust: 1 | 2 | 3 | 4 | 5;
  quote: string;
  retrievedAt: string;
  matchedTitle?: string;
  quoteTruncated?: boolean;
}

/** What the model searched and cited while producing a review (Google Search grounding).
    A record of the research behind the review, not evidence that anything it found is
    true. `grounded: false` means the call that produced the review did no search, so an
    empty list is never "searched and found nothing". `sourceUris` are usually Google
    redirect links; the domain is in `sourceTitles`. */
export interface ResearchLog {
  grounded: boolean;
  webSearchQueries: string[];
  sourceUris: string[];
  sourceTitles: string[];
  recordedAt: string;
}

/** Which strategy resolved a product image, best-trust first. "manual" = an
    admin pinned it via /admin/repository. */
export type ProductImageSource = "inci" | "page" | "amazon" | "nykaa" | "cse" | "search" | "manual";

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
  /** Which resolver produced imageUrl (audit trail for wrong-image debugging). */
  imageSource?: ProductImageSource;
  /** Match confidence 0-1 for imageUrl, when the resolver scored it (null = trusted source). */
  imageConfidence?: number | null;
  /** True when an admin pinned the image: a fresh re-review must not overwrite it. */
  imageLocked?: boolean;
  methodologyVersion?: string;
  reviewedAt?: string;
  /** Resolved INCI (ground truth used for grading), for display. */
  inciIngredients?: string[];
  /** Plum-depth detail authored by the engine from the real INCI. */
  ingredientReads?: IngredientRead[];
  keyActivesRead?: KeyActiveRead[];
  regulatoryScreen?: RegulatoryScreen;
  inciSourceUrl?: string;
  /** Where the ingredient list came from, the source text it was read from, and when.
      Absent on reviews stored before evidence capture (see review-verifier.ts). */
  inciEvidence?: InciEvidence;
  /** Independent page checks from the explicit product URL; never affect outcome dots. */
  productPageChecks?: import("@/lib/web-shopper-checks").ProductPageCheck[];
  /** The searches the model ran and the sources it cited for this review. Set by the
      engine from the grounding metadata, never authored by the model. Absent on older reviews. */
  researchLog?: ResearchLog;
  /** India-specific read (climate, price positioning, ASCI/CDSCO posture). */
  indiaContext?: string;
  /** Canonical product key for the review repository. */
  productSlug?: string;
}

/* ─── Derived approved / not-approved verdict (computed in code) ─── */

export interface ReviewGate {
  id: "claims" | "evidence" | "formula" | "safety";
  label: string;
  passed: boolean;
  detail: string;
}

/* The four Clean Sheet standings, best → worst. "can-do-better" and
   "not-recommended" replace the former "needs-proof" / "misleading" keys.
   Definitions live in STAMPS.md and are enforced in deriveVerdict. */
export type ReviewTier =
  | "approved"
  | "mostly-clean"
  | "can-do-better"
  | "not-recommended"
  | "not-assessed";

export interface DerivedVerdict {
  /** Kept for registry back-compat; derived from tier. */
  status: "approved" | "not_approved";
  tier: ReviewTier;
  tierLabel: string;
  headline: string;
  gates: ReviewGate[];
  standard: string;
  /** Set only when the product is a licensed drug, not a cosmetic. */
  isDrug?: boolean;
  /** The drug active(s) that make it a medicine (e.g. Ketoconazole). */
  drugActives?: string[];
  /** The four pillar results behind the standing. Present only when the pillar standing flag is on. */
  pillars?: PillarOutcome[];
  /** Claim evidence as a percentage (0 to 100) of the code-capped claim-evidence points. Present only with
      `pillars`. Surfaces that used the total out of 100 to describe evidence read this instead, because the
      standing no longer follows the total. */
  claimEvidencePct?: number;
}

/** One pillar's result: its graded score (0 to 100) and where it sits against the thresholds. */
export interface PillarOutcome {
  pillar: string;
  score: number;
  /** "well" at or above the well cutoff; "failing" only when below the floor with an adverse finding (or a hard failure); otherwise "middle". */
  status: "well" | "middle" | "failing";
  hardFail: boolean;
}
