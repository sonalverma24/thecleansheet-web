export type ScorePillar = {
  name: string;
  score: number;
  max: number;
  note: string;
  evidenceGrade?: "A" | "B" | "C" | "D" | "F"; // Pillar 4 (Test Result Transparency) only
};

export type IngredientEntry = {
  name: string;
  note: string;
  flag: "ok" | "warn" | "info";
};

export type KeyActive = {
  name: string;
  function: string;
  concentrationConfidence?: "High" | "Medium" | "Low";
};

export type ClaimsCheckItem = {
  claim: string;
  evidenceStatus: "Evidence visible" | "Mentioned only" | "Missing";
  decision: "Publicly supported" | "Needs proof" | "Not publicly supported";
  note: string;
};

export type GlobalScreen = {
  eu_1223_2009: string;
  india_cr_2020: string;
  health_canada_hotlist: string;
  canada_nhpid: string;
  tga_australia: string;
  us_fda_21cfr: string;
  korea_mfds: string;
  aicis_australia: string;
  echa_svhc: string;
  iarc: string;
};

export type InciCompleteness = {
  status: "Full INCI on brand PDP" | "Marketplace only" | "Partial" | "Missing";
  flags: string[];
};

export type ProductScorecard = {
  productName: string;
  slug: string;
  brand: string;
  brandSlug: string;
  priceRange: string;
  productType: "leave-on" | "rinse-off" | "treatment" | "sunscreen" | "toner" | "baby" | "eye-area" | "hair";
  concern: string;
  summary: string;
  score: number;
  scoreLabel: "Excellent" | "Good" | "Fair" | "Concern"; // legacy - keep for backward compat
  publicDecisionLabel?: string; // new 5-pillar framework label
  targetUser?: string;
  image: string;
  pillars: ScorePillar[];
  keyActives: KeyActive[];
  ingredients: IngredientEntry[];
  globalScreen?: GlobalScreen;
  inciCompleteness?: InciCompleteness;
  claimsCheck?: ClaimsCheckItem[];
  missingProof?: string[];
  cleanSheetNote?: string;
  pass_badges: string[];
  warn_badges: string[];
  info_badges: string[];
  indiaContext: string;
  analyzedAt: string;
  // Extended optional fields
  category?: string;
  subCategory?: string;
  price?: number;
  sizeValue?: number;
  sizeUnit?: string;
  pricePerUnit?: number;
  skinTypeTags?: string[];
  concernTags?: string[];
  suitabilityTags?: string[];
  cautionTags?: string[];
  routineSlot?: "AM" | "PM" | "AM+PM";
  fragranceStatus?: "free" | "synthetic" | "essential-oil" | "both" | "unknown";
  alcoholStatus?: "free" | "contains-drying" | "contains-fatty-only" | "unknown";
  certificationStatus?: "tcs-certified" | "under-review" | "not-certified";
  claimsMade?: string[];
  claimsVerified?: string[];
  claimsNotVerified?: string[];
  availabilitySources?: string[];
  retailerLinks?: { name: string; url: string }[];
  /** Product entered the catalogue via the live review repository (no static
      detail page — tiles link to the stored review; shows a NEW badge for 30 days). */
  freshReview?: boolean;
  /** True verdict tier for repository products (claim-gated, not score-only). */
  reviewTier?: "approved" | "mostly-clean" | "can-do-better" | "not-recommended";
  /** Claim-level regulatory screen (ASCI / India drug-cosmetic boundary) for
      live-reviewed products — rendered as its own section in the product view. */
  regulatoryFlags?: { claim: string; note: string }[];
  /** NEW tile badge — only the latest few repository arrivals carry it. */
  newArrival?: boolean;
};

export type Brand = {
  name: string;
  slug: string;
  logo: string;
  tagline: string;
  description: string;
  founded: string;
  headquarters: string;
  website: string;
  instagramHandle: string;
  nykaaUrl: string;
  avgScore: number;
  verdict: string;
  products: ProductScorecard[];
};

export type BrandSummary = Pick<
  Brand,
  "name" | "slug" | "logo" | "tagline" | "avgScore" | "verdict" | "founded" | "headquarters"
> & { productCount: number };
