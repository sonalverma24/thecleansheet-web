/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™, Type Definitions
   Transparency Scorecard + Analyzer Chat
──────────────────────────────────────────────────────────────── */

export interface ScorecardPillar {
  name: string;
  score: number;
  max: number;
  note: string;
}

export interface KeyActive {
  name: string;
  function: string;
}

export interface IngredientDetail {
  name: string;
  note: string;
  flag: "ok" | "warn" | "info";
}

export interface DataSource {
  inciFound: boolean;
  inciSource: string;
  priceSource: string;
  reviewPlatforms: string[];
  rating: number | null;
  reviewCount: string;
  userSentiment: string;
}

export interface Scorecard {
  productName: string;
  brand: string;
  priceRange: string;
  productType: string;
  summary: string;
  score: number;
  scoreLabel: "Excellent" | "Good" | "Fair" | "Concern";
  pillars: ScorecardPillar[];
  keyActives: KeyActive[];
  ingredients: IngredientDetail[];
  pass_badges: string[];
  warn_badges: string[];
  info_badges: string[];
  indiaContext: string;
  chatOpener: string;
  dataSource: DataSource;
  provisional?: boolean;
}

export interface ExpertAnswer {
  type: "answer";
  question: string;
  verdict: "safe" | "caution" | "avoid" | "info";
  verdictLabel: string;
  text: string;
  keyPoints: string[];
  indiaContext: string;
  chatOpener: string;
}

export interface ComparisonResult {
  type: "comparison";
  skinConcern: string;
  winner: "productA" | "productB" | "tie";
  verdict: string;
  productA: Scorecard;
  productB: Scorecard;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  scorecard?: Scorecard;
  timestamp: Date;
  isStreaming?: boolean;
}

/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ — Product Review Framework Types
   Claim Credibility · Platform Parity · Consumer Truth
──────────────────────────────────────────────────────────────── */

export type ClaimType =
  | "functional"
  | "appearance"
  | "active"
  | "concern"
  | "time-bound"
  | "clinical"
  | "safety"
  | "free-from"
  | "emotional";

export type ClaimRiskLevel = "low" | "medium" | "high" | "very-high" | "red-flag";

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
    byRisk: {
      low: number;
      medium: number;
      high: number;
      veryHigh: number;
      redFlag: number;
    };
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

  dataSource: {
    inciFound: boolean;
    inciSource: string;
    priceSource: string;
    reviewPlatforms: string[];
    rating: number | null;
    reviewCount: string;
    userSentiment: string;
  };

  cleanSheetNote: string;
}
