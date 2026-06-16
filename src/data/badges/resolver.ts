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
import type { TileChipVariant } from "@/components/scorecards/TileChip";

// ── Tile chip system (product tiles only) ─────────────────────────────────────

export type TileChip = { label: string; variant: TileChipVariant };

/** Map the most specific skin type tag to a short display label. */
function deriveSkinLabel(tags: string[]): string | null {
  const priority = ["acne-prone", "sensitive", "oily", "dry", "combination", "normal", "all"];
  const display: Record<string, string> = {
    "acne-prone":  "Acne-prone",
    "sensitive":   "Sensitive",
    "oily":        "Oily skin",
    "dry":         "Dry skin",
    "combination": "Combo skin",
    "normal":      "Normal skin",
    "all":         "All skin",
  };
  for (const p of priority) {
    if (tags.includes(p)) return display[p] ?? null;
  }
  return null;
}

/**
 * Derive the routine slot (AM / PM / AM+PM).
 * Uses the explicit `routineSlot` field when set; otherwise infers from
 * category, subCategory, and cautionTags.
 */
function deriveRoutineLabel(product: ProductScorecard): string | null {
  if (product.routineSlot) return product.routineSlot;

  const cat     = (product.category    ?? "").toLowerCase();
  const subCat  = (product.subCategory ?? "").toLowerCase();
  const cautions = (product.cautionTags ?? []).map((c) => c.toLowerCase());

  if (cat === "sunscreens") return "AM";
  if (cautions.some((c) => c.includes("retinoid"))) return "PM";
  if (
    subCat.includes("peel") ||
    cautions.some((c) => c.includes("acid active") || c.includes("strong exfoliant"))
  ) return "PM";

  return "AM+PM";
}

/**
 * Pick the single most important consumer-facing red flag.
 * Routine-slot concerns (e.g. retinoid = PM) are intentionally excluded here
 * since the routine chip already communicates that.
 */
function deriveFlagLabel(product: ProductScorecard): string | null {
  const cautions      = (product.cautionTags  ?? []).map((c) => c.toLowerCase());
  const warnBadges    = (product.warn_badges   ?? []).map((w) => w.toLowerCase());
  const all           = [...cautions, ...warnBadges];
  const fragrance     = product.fragranceStatus;
  const alcohol       = product.alcoholStatus;

  if (all.some((c) => c.includes("allergen")))                           return "Allergen risk";
  if (all.some((c) => c.includes("spf not verified") || (c.includes("spf") && c.includes("unverified")))) return "SPF unverified";
  if (alcohol === "contains-drying" || all.some((c) => c.includes("drying alcohol"))) return "Has alcohol";
  if (fragrance === "synthetic" || fragrance === "both" || all.some((c) => c.includes("contains fragrance"))) return "Has fragrance";
  if (fragrance === "essential-oil" || all.some((c) => c.includes("essential oil")))  return "Essential oils";
  if (all.some((c) => c.includes("acid active")))                        return "Contains acids";
  if (all.some((c) => c.includes("pregnancy")))                          return "Pregnancy caution";

  return null;
}

/**
 * Return up to 3 tile chips for a product card:
 *   1. Skin type - who it is for
 *   2. Routine   - AM / PM / AM+PM
 *   3. Red flag  - top consumer-facing caution (if any)
 */
export function getTileChips(product: ProductScorecard): TileChip[] {
  const chips: TileChip[] = [];

  const skin    = deriveSkinLabel(product.skinTypeTags ?? []);
  const routine = deriveRoutineLabel(product);
  const flag    = deriveFlagLabel(product);

  if (skin)    chips.push({ label: skin,    variant: "skin"    });
  if (routine) chips.push({ label: routine, variant: "routine" });
  if (flag)    chips.push({ label: flag,    variant: "flag"    });

  return chips;
}

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
 * Select exactly up to 3 badges for a product card - ingredient actives are
 * omitted (the product name already carries that signal). Slots are:
 *
 *   Slot 1 - FOR:    Best free_from or suitability signal (who it is for /
 *                    what it doesn't contain)
 *   Slot 2 - WATCH:  Most important caution flag
 *   Slot 3 - TRUST:  Premium verification (TCS Certified, SPF Verified, etc.)
 *                    or ethics/value badge; INCI_VERIFIED excluded (too generic)
 *
 * Empty slots are skipped. No overflow count - the selection is complete.
 */
export function getCardBadges(product: ProductScorecard): BadgeDefinition[] {
  const all = resolveBadges(product);

  const byFamily = (family: BadgeDefinition["family"]) =>
    all.filter((b) => b.family === family);

  // Slot 1: best free_from or suitability
  const freeFromOrSuit = [
    ...byFamily("free_from"),
    ...byFamily("suitability"),
  ].sort((a, b) => a.priority - b.priority)[0];

  // Slot 2: most important caution
  const caution = byFamily("caution")[0];

  // Slot 3: meaningful verification or ethics/value (not INCI_VERIFIED)
  const verification = byFamily("verification").find((b) => b.id !== "INCI_VERIFIED");
  const ethics       = byFamily("ethics")[0];
  const value        = byFamily("value")[0];
  const slot3        = verification ?? ethics ?? value;

  const selected: BadgeDefinition[] = [freeFromOrSuit, caution, slot3]
    .filter((b): b is BadgeDefinition => b !== undefined);

  // Deduplicate
  const seen = new Set<string>();
  return selected.filter((b) => {
    if (seen.has(b.id)) return false;
    seen.add(b.id);
    return true;
  });
}
