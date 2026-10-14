/* Types for the private retailer pitch demo (src/app/x/[token]).
   Listing fields are a one-off snapshot of the retailer page, not a live feed. */

export interface PitchProduct {
  /** Retailer product id (the number after /p/ in its URL). */
  id: string;
  brand: string;
  name: string;
  retailerUrl: string;
  /** Retailer CDN image URL; the card swaps the size segment for a sharper one. */
  image: string;
  mrp: number;
  price: number;
  off: number;
  /** Whole stars, exactly as the retailer listing rounds them. */
  stars: number;
  ratingCount: number;
  sizes?: number;
  bestseller?: boolean;
  isNew?: boolean;
}

export interface PitchCheck {
  /** Short statement shown with a tick. */
  text: string;
  /** Optional second line (basis, source, scope). */
  note?: string;
}

/* What the popup shows for a verified product. Only a product that has one of
   these gets the stamp. Records marked source "sample" render a loud warning
   banner so placeholder content can never be mistaken for a real assessment. */
export interface PitchVerification {
  source: "engine" | "sample";
  /** e.g. "7 Sep 26" */
  updated: string;
  /** Detail chips under the product name: size, intended age, rinse-off, etc. */
  details: string[];
  ingredients: { screened: number; total: number; checks: PitchCheck[] };
  claims: { assessed: number; supported: number; checks: PitchCheck[] };
  /** Each line is shown only when the data exists; the section hides if none do. */
  reviews: {
    /** Total reviews analysed; adds a third headline number when set. */
    analysed?: number;
    indianMarketplaces?: string;
    globalMarketplaces?: string;
    communities?: string;
  };
  /** Optional extra sections (age and use, tests reviewed). Rendered only when present. */
  extra?: { title: string; checks: PitchCheck[] }[];
}
