import type { ClaimAnalysis, EvidenceLevel, ProductReview } from "./product-review-types";

/* The claims we check are the ones on the brand's own website page for the exact product, or on that product's page at Nykaa or Tira. (Owner rule, 2026-11-02: "brand
   website is the best source. nothing else"; widened 2026-11-21: "If claims are available on the brand website or big retailers like nykaa/tira accept it.") Nothing else
   counts: not another retailer (Flipkart, Amazon, Purplle, a quick-commerce app), not a reseller that copies the brand's page ("via Clinikally"), not a reviewer, not a
   brand-level blurb on a retailer ("Nykaa Brand Info"), not the pack.

   The model writes the `source` label itself, as free text, and often lists several places ("Brand Website / Flipkart / Nykaa"). A claim seen on an accepted page and
   copied elsewhere still counts, so a label counts when ANY place it names is accepted. A place counts only when it says so plainly: "Brand Website", "Official
   Website", "<Brand> Website", "<brand>.in", "Nykaa", "Nykaa Description", "Tira", "Tira Beauty". "(implied)", "(via X)", "(General)" and "(Global)" do not count: the
   first two say it was not read there, the last two say it is the site in general, not this product's page. */

const DOES_NOT_COUNT = /\b(?:implied|inferred|via|general|global|marketplace|review|reviews)\b/i;
const OWN_SITE = /^(?:the\s+)?(?:brand(?:'s|’s)?|official|company)\s+(?:website|site|page|pdp|product page|store)\b/i;

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Whether one named place is the brand's own website. */
function isOwnSite(place: string, brand: string): boolean {
  const p = place.trim();
  if (!p || DOES_NOT_COUNT.test(p)) return false;
  if (OWN_SITE.test(p)) return true;
  const name = brand.trim();
  if (!name) return false;
  const b = escapeRe(name);
  // "Aestura Website", "Minimalist official site", "Minimalist.in", "Minimalist.in Consumer Studies"
  return new RegExp(`^${b}(?:\\.[a-z]{2,3})(?:\\s|$)`, "i").test(p)
    || new RegExp(`^${b}\\s+(?:brand\\s+|official\\s+)?(?:website|site|store|page)\\b`, "i").test(p)
    || new RegExp(`^${b}\\s*\\((?:website|site)\\)`, "i").test(p);
}

/* Nykaa or Tira, the product's own page there: "Nykaa", "Nykaa Description", "Nykaa PDP", "Nykaa Product Page", "Tira", "Tira Beauty", "tirabeauty.com". A brand-level
   blurb ("Nykaa Brand Info", "About the brand") is about the brand, not this product, so it does not count. */
const ACCEPTED_RETAILER = /^(?:nykaa(?:\.com)?|tira(?:\s*beauty)?|tirabeauty(?:\.com)?)(?:\s+(?:description|product\s+(?:page|description|details)|pdp|listing|page|title|details))?$/i;

/** Whether one named place is the product's page at Nykaa or Tira. */
function isAcceptedRetailer(place: string): boolean {
  const p = place.trim();
  return !!p && !DOES_NOT_COUNT.test(p) && ACCEPTED_RETAILER.test(p);
}

/** Whether a claim's `source` label names the brand's own website among the places it was seen. */
export function citesBrandWebsite(source: string | undefined | null, brand: string): boolean {
  return placesOf(source).some((place) => isOwnSite(place, brand));
}

/** Whether a claim's `source` label names an accepted place: the brand's own website, or the product's page at Nykaa or Tira. */
export function citesAcceptedSource(source: string | undefined | null, brand: string): boolean {
  return placesOf(source).some((place) => isOwnSite(place, brand) || isAcceptedRetailer(place));
}

// "Brand Website / Nykaa", "Nykaa, Brand Website", "Brand Website (Omeocare)": split on the separators, but keep a bracket with its place.
const placesOf = (source: string | undefined | null): string[] => (source ? source.split(/\s*(?:\/|;|\+|&|\band\b|,(?![^(]*\)))\s*/i) : []);

export interface BrandWebsiteClaims {
  review: ProductReview;
  kept: number;
  dropped: number;
}

/** A new analysis with only the claims from accepted places (the brand's website, Nykaa, Tira), and the claim summary counted again from them (the model counted all the claims it listed).
    `researchLog.claimsKept` and `claimsDropped` record what happened, so the decision can say "claims not examined" when the brand's page gave none, instead of
    reading an empty list as "this product makes no claims". Used when an analysis is made; stored analyses are not changed. */
export function withBrandWebsiteClaimsOnly(review: ProductReview): BrandWebsiteClaims {
  const all: ClaimAnalysis[] = Array.isArray(review.claimMap) ? review.claimMap : [];
  const kept = all.filter((c) => citesAcceptedSource(c.source, review.brand ?? ""));
  const dropped = all.length - kept.length;
  const byRisk = { low: 0, medium: 0, high: 0, veryHigh: 0, redFlag: 0 };
  const types = new Map<string, number>();
  let highest = 0;
  for (const c of kept) {
    if (c.riskLevel === "low") byRisk.low++;
    else if (c.riskLevel === "medium") byRisk.medium++;
    else if (c.riskLevel === "high") byRisk.high++;
    else if (c.riskLevel === "very-high") byRisk.veryHigh++;
    else if (c.riskLevel === "red-flag") byRisk.redFlag++;
    types.set(c.primaryType, (types.get(c.primaryType) ?? 0) + 1);
    if (typeof c.evidenceLevel === "number" && c.evidenceLevel > highest) highest = c.evidenceLevel;
  }
  const mostCommonType = [...types.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? review.claimSummary?.mostCommonType ?? "";
  const level = Math.min(7, Math.max(1, Math.round(highest) || 1)) as EvidenceLevel;
  return {
    kept: kept.length,
    dropped,
    review: {
      ...review,
      claimMap: kept,
      claimSummary: {
        total: kept.length,
        byRisk,
        highestEvidenceLevel: level,
        mostCommonType,
        asciConcernCount: kept.filter((c) => c.asciConcern).length,
        drugBoundaryCount: kept.filter((c) => c.drugBoundaryRisk).length,
      },
      ...(review.researchLog ? { researchLog: { ...review.researchLog, claimsKept: kept.length, claimsDropped: dropped } } : {}),
    },
  };
}
