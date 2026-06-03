export type ScorePillar = {
  name: string;
  score: number;
  max: number;
  note: string;
};

export type IngredientEntry = {
  name: string;
  note: string;
  flag: "ok" | "warn" | "info";
};

export type KeyActive = {
  name: string;
  function: string;
};

export type ProductScorecard = {
  productName: string;
  slug: string;
  brand: string;
  brandSlug: string;
  priceRange: string;
  productType: "leave-on" | "rinse-off" | "treatment" | "sunscreen" | "toner";
  concern: string;
  summary: string;
  score: number;
  scoreLabel: "Excellent" | "Good" | "Fair" | "Concern";
  image: string;
  pillars: ScorePillar[];
  keyActives: KeyActive[];
  ingredients: IngredientEntry[];
  pass_badges: string[];
  warn_badges: string[];
  info_badges: string[];
  indiaContext: string;
  analyzedAt: string;
  // Extended optional fields — populate gradually; start with Minimalist as reference
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
  fragranceStatus?: "free" | "synthetic" | "essential-oil" | "both" | "unknown";
  alcoholStatus?: "free" | "contains-drying" | "contains-fatty-only" | "unknown";
  certificationStatus?: "tcs-certified" | "under-review" | "not-certified";
  claimsMade?: string[];
  claimsVerified?: string[];
  claimsNotVerified?: string[];
  availabilitySources?: string[];
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
