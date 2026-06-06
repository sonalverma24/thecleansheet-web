/**
 * The Clean Sheet - Badge Resolver
 *
 * Maps a ProductScorecard to an array of BadgeDefinition objects from the
 * controlled taxonomy. No badge may be invented here; every output ID must
 * exist in BADGE_TAXONOMY.
 *
 * Resolution order:
 *   1. certificationStatus (structured)
 *   2. fragranceStatus / alcoholStatus (structured)
 *   3. keyActives (structured - ingredient presence only)
 *   4. suitabilityTags (structured)
 *   5. cautionTags (structured)
 *   6. pass_badges (text matching)
 *   7. warn_badges (text matching)
 *
 * info_badges are intentionally not resolved - ambiguous data must not
 * produce a badge per taxonomy rule 13.
 */

import type { ProductScorecard } from "@/data/brands/types";
import { BADGE_TAXONOMY, type BadgeDefinition } from "./taxonomy";

// ── Text matching helpers ─────────────────────────────────────────────────────

/** Match a pass_badge free-text string to a taxonomy ID. Returns null if unknown. */
function matchPassBadge(raw: string): string | null {
  const s = raw.toLowerCase();

  // Verification
  if (s.includes("inci verified"))                                    return "INCI_VERIFIED";
  if (s.includes("tcs certified") || s.includes("tcs-certified"))    return "TCS_CERTIFIED";
  if (s.includes("claims verified"))                                  return "CLAIMS_VERIFIED";
  if (s.includes("claims reviewed"))                                  return "CLAIMS_REVIEWED";
  if (
    s.includes("spf verified") ||
    s.includes("spf test report") ||
    s.includes("published spf") ||
    s.includes("validated spf")
  ) return "SPF_VERIFIED";
  if (s.includes("uva verified") || s.includes("uva test"))          return "UVA_VERIFIED";
  if (s.includes("ph verified") || s.includes("ph tested"))          return "PH_VERIFIED";
  if (s.includes("stability reviewed") || s.includes("stability tested")) return "STABILITY_REVIEWED";
  if (s.includes("microbiology reviewed") || s.includes("microbiology tested")) return "MICROBIOLOGY_REVIEWED";
  if (
    s.includes("formula reviewed") ||
    s.includes("gmp certified") ||
    s.includes("gmp manufacturer")
  ) return "FORMULA_REVIEWED";
  if (s.includes("active verified"))                                  return "ACTIVE_VERIFIED";

  // Free from
  if (
    s.includes("fragrance-free") ||
    s.includes("fragrance free") ||
    s.includes("no fragrance") ||
    s.includes("parfum free")
  ) return "FRAGRANCE_FREE";
  if (s.includes("essential oil free") || s.includes("no essential oil")) return "ESSENTIAL_OIL_FREE";
  if (
    s.includes("drying alcohol free") ||
    s.includes("alcohol-free") ||
    s.includes("alcohol free") ||
    s.includes("no drying alcohol")
  ) return "DRYING_ALCOHOL_FREE";
  if (s.includes("silicone-free") || s.includes("silicone free") || s.includes("no silicone")) return "SILICONE_FREE";
  if (s.includes("mineral oil free") || s.includes("no mineral oil")) return "MINERAL_OIL_FREE";
  if (s.includes("no azo") || (s.includes("azo dye") && (s.includes("no ") || s.includes("free")))) return "NO_AZO_DYES";
  if (s.includes("retinoid free") || s.includes("retinol free"))     return "RETINOID_FREE";

  // Ethics
  if (s.includes("100% vegan") || s.includes("vegan certified") || s === "vegan") return "VEGAN";
  // "vegan" as standalone or with qualifier - check it's not part of "non-vegan"
  if (s.includes("vegan") && !s.includes("non-vegan"))               return "VEGAN";
  if (s.includes("cruelty-free") || s.includes("cruelty free"))      return "CRUELTY_FREE";
  if (s.includes("recyclable") || s.includes("recycled pack"))       return "RECYCLABLE_PACK";
  if (s.includes("rspo"))                                             return "RSPO_CLAIMED";
  if (
    s.includes("certified organic") ||
    s.includes("usda organic") ||
    s.includes("ecocert") ||
    s.includes("cosmos organic")
  ) return "CERTIFIED_ORGANIC";

  // Value
  if (s.includes("best value"))                                       return "BEST_VALUE";
  if (s.includes("best evidence"))                                    return "BEST_EVIDENCE";
  if (s.includes("low caution"))                                      return "LOW_CAUTION";
  if (s.includes("high transparency"))                                return "HIGH_TRANSPARENCY";

  return null;
}

/** Match a warn_badge free-text string to a caution taxonomy ID. Returns null if unknown. */
function matchWarnBadge(raw: string): string | null {
  const s = raw.toLowerCase();

  // Fragrance allergen must be checked before generic fragrance
  if (s.includes("fragrance allergen") || (s.includes("allergen") && s.includes("fragrance"))) return "FRAGRANCE_ALLERGEN_FLAG";
  if (
    s.includes("botanical fragrance") ||
    s.includes("natural fragrance") ||
    s.includes("natural perfume")
  ) return "BOTANICAL_FRAGRANCE_FLAG";
  if (s.includes("essential oil"))                                    return "ESSENTIAL_OIL_FLAG";
  if (s.includes("contains fragrance") || s.includes("fragrance present")) return "CONTAINS_FRAGRANCE";

  if (
    s.includes("drying alcohol") ||
    (s.includes("alcohol") && (s.includes("flag") || s.includes("caution") || s.includes("present")))
  ) return "DRYING_ALCOHOL_FLAG";

  if (s.includes("retinol") || s.includes("retinoid") || s.includes("retinoic")) return "RETINOID_FLAG";
  if (s.includes("acid active") || s.includes("acid flag") || s.includes("aha") || s.includes("bha")) return "ACID_ACTIVE_FLAG";

  // SPF caution - must check before generic "not verified"
  if (
    s.includes("spf not verified") ||
    s.includes("spf claim not") ||
    (s.includes("spf") && s.includes("unusual")) ||
    (s.includes("spf") && s.includes("not verified")) ||
    (s.includes("spf") && s.includes("unverified"))
  ) return "SPF_NOT_VERIFIED";

  if (s.includes("penetration enhancer") || (s.includes("solvent") && s.includes("flag"))) return "SOLVENT_FLAG";
  if (s.includes("transcutol") || s.includes("ethoxydiglycol"))      return "SOLVENT_FLAG";

  // Generic claim not verified - check after specific patterns
  if (
    s.includes("not verified") ||
    s.includes("claim not") ||
    s.includes("unverified claim") ||
    s.includes("% not verified")
  ) return "ACTIVE_PCT_NOT_VERIFIED";

  if (s.includes("pregnancy") && (s.includes("caution") || s.includes("consult") || s.includes("avoid"))) return "PREGNANCY_NOT_REVIEWED";
  if (s.includes("baby") && (s.includes("caution") || s.includes("avoid")))                                return "BABY_NOT_REVIEWED";

  // Generic allergen last (to avoid catching fragrance allergen already handled above)
  if (s.includes("allergen"))                                         return "ALLERGEN_FLAG";

  return null;
}

/** Match a keyActive name to an active ingredient taxonomy ID. Returns null if unrecognised. */
function matchActive(name: string): string | null {
  const s = name.toLowerCase();

  if (s.includes("niacinamide"))                                             return "NIACINAMIDE";
  // Ethyl ascorbic must be checked before plain ascorbic acid
  if (s.includes("ethyl ascorbic") || s.includes("3-o-ethyl"))              return "ETHYL_ASCORBIC_ACID";
  if (s.includes("ascorbyl glucoside"))                                      return "ASCORBYL_GLUCOSIDE";
  if (s.includes("sodium ascorbyl phosphate"))                               return "SODIUM_ASCORBYL_PHOSPHATE";
  if (s.includes("magnesium ascorbyl phosphate"))                            return "MAGNESIUM_ASCORBYL_PHOSPHATE";
  // L-ascorbic acid or plain ascorbic acid (after ethyl/derivative checks)
  if (s.includes("l-ascorbic acid") || (s.includes("ascorbic acid") && !s.includes("ascorbyl"))) return "L_ASCORBIC_ACID";

  // Retinal (retinaldehyde) must be checked before retinol
  if (s.includes("retinal") || s.includes("retinaldehyde"))                 return "RETINAL";
  if (s.includes("retinol") || s.includes("retinyl"))                       return "RETINOL";

  if (s.includes("peptide"))                                                 return "PEPTIDES";
  if (s.includes("ceramide"))                                                return "CERAMIDES";
  // Sodium hyaluronate before hyaluronic acid
  if (s.includes("sodium hyaluronate"))                                      return "SODIUM_HYALURONATE";
  if (s.includes("hyaluronic acid"))                                         return "HYALURONIC_ACID";

  if (s.includes("salicylic acid"))                                          return "SALICYLIC_ACID";
  if (s.includes("glycolic acid"))                                           return "GLYCOLIC_ACID";
  if (s.includes("lactic acid"))                                             return "LACTIC_ACID";
  if (s.includes("azelaic acid"))                                            return "AZELAIC_ACID";
  if (s.includes("tranexamic acid"))                                         return "TRANEXAMIC_ACID";

  if (s.includes("zinc oxide"))                                              return "ZINC_OXIDE";
  if (s.includes("titanium dioxide"))                                        return "TITANIUM_DIOXIDE";

  return null;
}

/** Match a suitabilityTag string to a suitability taxonomy ID. Returns null if unrecognised. */
function matchSuitabilityTag(tag: string): string | null {
  const s = tag.toLowerCase();

  if (s.includes("oily"))                                          return "OILY_SKIN";
  if (s.includes("dry"))                                           return "DRY_SKIN";
  if (s.includes("combination"))                                   return "COMBINATION_SKIN";
  if (s.includes("sensitive"))                                     return "SENSITIVE_SKIN";
  if (s.includes("acne") || s.includes("acne-prone"))             return "ACNE_PRONE";
  if (s.includes("beginner"))                                      return "BEGINNER_FRIENDLY";
  if (s.includes("pregnan") || s.includes("expectant"))           return "PREGNANCY_REVIEWED";
  if (s.includes("baby") || s.includes("infant"))                 return "BABY_REVIEWED";
  if (s.includes("teen"))                                          return "TEEN_REVIEWED";

  return null;
}

/** Match a cautionTag string to a caution taxonomy ID. Returns null if unrecognised. */
function matchCautionTag(tag: string): string | null {
  const s = tag.toLowerCase();

  if (s.includes("fragrance allergen"))                            return "FRAGRANCE_ALLERGEN_FLAG";
  if (s.includes("botanical fragrance") || s.includes("natural fragrance")) return "BOTANICAL_FRAGRANCE_FLAG";
  if (s.includes("essential oil"))                                 return "ESSENTIAL_OIL_FLAG";
  if (s.includes("fragrance"))                                     return "CONTAINS_FRAGRANCE";
  if (s.includes("drying alcohol") || s.includes("denat"))        return "DRYING_ALCOHOL_FLAG";
  if (s.includes("retinol") || s.includes("retinoid"))            return "RETINOID_FLAG";
  if (s.includes("acid") && (s.includes("aha") || s.includes("bha") || s.includes("active"))) return "ACID_ACTIVE_FLAG";
  if (s.includes("spf"))                                           return "SPF_NOT_VERIFIED";
  if (s.includes("penetration") || s.includes("solvent"))         return "SOLVENT_FLAG";
  if (s.includes("allergen"))                                      return "ALLERGEN_FLAG";
  if (s.includes("pregnan"))                                       return "PREGNANCY_NOT_REVIEWED";
  if (s.includes("baby") || s.includes("infant"))                 return "BABY_NOT_REVIEWED";

  return null;
}

// ── Main resolver ─────────────────────────────────────────────────────────────

/**
 * Resolve all applicable badges for a product.
 * Returns every matched BadgeDefinition sorted by priority (lowest first).
 * Duplicates are automatically excluded.
 */
export function resolveBadges(product: ProductScorecard): BadgeDefinition[] {
  const ids = new Set<string>();

  // 1. Certification status (structured)
  if (product.certificationStatus === "tcs-certified") ids.add("TCS_CERTIFIED");
  else if (product.certificationStatus === "under-review") ids.add("UNDER_REVIEW");

  // 2. Fragrance + alcohol status (structured)
  if (product.fragranceStatus === "free") {
    ids.add("FRAGRANCE_FREE");
  } else if (
    product.fragranceStatus === "synthetic" ||
    product.fragranceStatus === "both"
  ) {
    ids.add("CONTAINS_FRAGRANCE");
  } else if (product.fragranceStatus === "essential-oil") {
    ids.add("ESSENTIAL_OIL_FLAG");
  }

  if (product.alcoholStatus === "free") {
    ids.add("DRYING_ALCOHOL_FREE");
  } else if (product.alcoholStatus === "contains-drying") {
    ids.add("DRYING_ALCOHOL_FLAG");
  }

  // 3. Key actives (structured - presence only, not efficacy)
  for (const active of product.keyActives ?? []) {
    const id = matchActive(active.name);
    if (id) ids.add(id);
  }

  // 4. Suitability tags (structured)
  for (const tag of product.suitabilityTags ?? []) {
    const id = matchSuitabilityTag(tag);
    if (id) ids.add(id);
  }

  // 5. Caution tags (structured)
  for (const tag of product.cautionTags ?? []) {
    const id = matchCautionTag(tag);
    if (id) ids.add(id);
  }

  // 6. pass_badges (free text)
  for (const badge of product.pass_badges ?? []) {
    const id = matchPassBadge(badge);
    if (id) ids.add(id);
  }

  // 7. warn_badges (free text)
  for (const badge of product.warn_badges ?? []) {
    const id = matchWarnBadge(badge);
    if (id) ids.add(id);
  }

  // Map IDs to definitions, drop any that don't exist in taxonomy
  return Array.from(ids)
    .map((id) => BADGE_TAXONOMY[id])
    .filter((b): b is BadgeDefinition => b !== undefined)
    .sort((a, b) => a.priority - b.priority);
}

// ── Card selection ────────────────────────────────────────────────────────────

/**
 * Select up to 6 badges for a product card following the display priority spec:
 *   1. Best certification/verification badge
 *   2. Hero active badge
 *   3. Second active badge
 *   4. Best free_from or suitability badge
 *   5. Best ethics badge
 *   6. Highest-priority caution badge
 *
 * Slots are filled in order; if a family has no matching badge the slot is skipped.
 * Result is at most 6 badges, in the order above.
 */
export function getCardBadges(product: ProductScorecard): BadgeDefinition[] {
  const all = resolveBadges(product);

  const byFamily = (family: BadgeDefinition["family"]) =>
    all.filter((b) => b.family === family);

  // INCI_VERIFIED is present on almost every product and adds no differentiating
  // signal on a tile. Show it only on detail pages. More meaningful verification
  // badges (TCS_CERTIFIED, SPF_VERIFIED, etc.) are still surfaced.
  const verification = byFamily("verification").find((b) => b.id !== "INCI_VERIFIED");
  const actives      = byFamily("active").slice(0, 2);
  const freeFromOrSuit = [
    ...byFamily("free_from"),
    ...byFamily("suitability"),
  ].sort((a, b) => a.priority - b.priority)[0];
  const ethics   = byFamily("ethics")[0];
  const value    = byFamily("value")[0];
  const caution  = byFamily("caution")[0];

  const selected: BadgeDefinition[] = [
    ...actives,
    freeFromOrSuit,
    verification,
    ethics ?? value,
    caution,
  ].filter((b): b is BadgeDefinition => b !== undefined);

  // Deduplicate (same badge could appear in multiple slots edge case)
  const seen = new Set<string>();
  return selected.filter((b) => {
    if (seen.has(b.id)) return false;
    seen.add(b.id);
    return true;
  }).slice(0, 6);
}
