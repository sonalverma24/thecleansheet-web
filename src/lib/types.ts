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
