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

export interface UsageGuidance {
  howToUse: string[];
  frequency: string;
  pairWith: string[];
  avoidWith: string[];
  proTip: string;
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
  usageGuidance?: UsageGuidance;
}

/* ─── The Clean Sheet Standard — one verdict, three gates ─── */

export interface VerdictGateResult {
  id: "formula" | "lawful_claims" | "honest_claims";
  label: string;
  passed: boolean | null; // null = gate could not be assessed this run
  detail: string;
}

export interface FinalVerdict {
  status: "verified" | "not_verified" | "provisional";
  gates: VerdictGateResult[];
  standard: string;
}

export interface VerifiedProduct {
  slug: string;
  productName: string;
  brand: string;
  score: number;
  scoreLabel: string;
  integrityScore: number | null;
  imageUrl: string | null;
  summary: string;
  usageGuidance: UsageGuidance | null;
  verifiedAt: string;
  methodologyVersion: string;
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

/* ─── Claim Check (primary layer) ─── */

export type ClaimVerdict = "verified" | "qualified" | "unverified" | "not_permitted";
export type EvidenceLevel = "A" | "B" | "C" | "D" | "none";
export type ClaimCategory =
  | "efficacy" | "safety" | "concentration" | "origin"
  | "sun_protection" | "regulated" | "superlative";

export interface CheckedClaim {
  claim: string;
  category: ClaimCategory;
  verdict: ClaimVerdict;
  evidenceLevel: EvidenceLevel;
  requiredLevel: EvidenceLevel;
  evidence: string;
  source: string;
  explanation: string;
  regulatoryNote: string;
}

export interface ClaimCheckResult {
  type: "claim_check";
  productName: string;
  brand: string;
  sourceUrl: string;
  productFound: boolean;
  claims: CheckedClaim[];
  summary: string;
  redFlags: string[];
  chatOpener: string;
  /* Computed in code, deterministic — never by the LLM */
  integrityScore: number;
  integrityLabel: "Clean" | "Mostly Clean" | "Mixed" | "Misleading";
  verdictCounts: Record<ClaimVerdict, number>;
  methodologyVersion: string;
  checkedAt: string;
  /* Product image pulled from the scraped page, when available */
  imageUrl?: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  scorecard?: Scorecard;
  timestamp: Date;
  isStreaming?: boolean;
}
