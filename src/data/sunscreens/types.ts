/**
 * TCS Evidence Record types.
 *
 * A structured, sectioned public-evidence audit for a single sunscreen SKU.
 * Distinct from the 5-pillar ProductScorecard system in src/data/brands: an
 * evidence record does not score the product, it audits each on-pack and
 * online claim against what is publicly documented and states the gaps.
 */

export interface KVRow {
  label: string;
  value: string;
}

export interface KVTable {
  kind: "kv";
  rows: KVRow[];
}

export interface GridTable {
  kind: "grid";
  columns: string[];
  rows: string[][];
}

export interface BulletList {
  kind: "list";
  items: string[];
}

export interface Paragraph {
  kind: "paragraph";
  text: string;
}

export type SectionBlock = KVTable | GridTable | BulletList | Paragraph;

export interface EvidenceSection {
  id: string;
  title: string;
  blocks: SectionBlock[];
}

export interface SourceRow {
  info: string;
  sourceLabel: string;
  sourceUrl: string;
  type: string;
  reliability: string;
}

export type EvidenceStatusTone = "partial" | "available" | "unavailable";

export interface BuyLink {
  retailer: string;
  url: string;
}

export interface HeroStat {
  value: string;
  unit: string;
  label: string;
  context: string;
}

export interface SunscreenEvidenceRecord {
  slug: string;
  productName: string;
  brand: string;
  brandSlug: string;
  brandProductSlug?: string;
  variant: string;
  image: string;
  priceRange: string;
  productType: string;
  tcsStatus: string;
  statusTone: EvidenceStatusTone;
  statusSummary: string;
  dateCreated: string;
  dateChecked: string;
  claimsReviewed: number;
  claimsVerified: number;
  claimsGap: number;
  /** Brand product page, and marketplace links a shopper can actually buy from. */
  productPageUrl: string;
  buyLinks: BuyLink[];
  /** Headline figures shown in the hero, e.g. the two measured SPF values. */
  heroStats: HeroStat[];
  /** Section T, the consumer-facing summary shown at the top of the page. */
  summary: KVRow[];
  /** Sections A through R (and Q/S), in publication order. */
  sections: EvidenceSection[];
  overallStatus: string;
  /**
   * Section P, the source register. Kept for internal reference only.
   * The public checksheet does not render this — see EvidenceChecksheet.
   */
  sources: SourceRow[];
  sourcesNote?: string;
  notAccessible?: string;
  researchDisclosure: string;
}
