/**
 * The Clean Sheet - Badge Taxonomy
 *
 * Single source of truth for all scorecard badges.
 * No badge may be created outside this taxonomy.
 * Badge IDs are SCREAMING_SNAKE_CASE strings.
 *
 * Rules enforced here:
 * - Labels are max 22 characters for card display
 * - Caution badges carry a tooltip explaining the reason
 * - Ingredient presence does not imply efficacy
 * - Verification badges require evidence review
 */

import type { LucideIcon } from "lucide-react";
import {
  Award,
  Clock,
  ShieldCheck,
  FlaskConical,
  Sun,
  Microscope,
  Zap,
  XCircle,
  AlertTriangle,
  Heart,
  Droplet,
  Star,
  Leaf,
  Users,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type BadgeFamily =
  | "verification"
  | "active"
  | "free_from"
  | "caution"
  | "suitability"
  | "ethics"
  | "value";

export type BadgeColorVariant =
  | "verified"
  | "active"
  | "free_from"
  | "caution"
  | "neutral"
  | "value";

export interface BadgeDefinition {
  id: string;
  /** Max 22 characters. If source text is longer, full text goes in tooltip. */
  label: string;
  family: BadgeFamily;
  color_variant: BadgeColorVariant;
  icon: LucideIcon;
  /** Lower number = shown first on cards. */
  priority: number;
  /** When this badge is eligible to be shown. */
  display_rule: string;
  tooltip: string;
  /** Whether this badge can appear on product cards (max 6 per card). */
  max_card_visibility: boolean;
  /** Primary ProductScorecard field that drives this badge. */
  source_field: string;
  /** Whether a human evidence review is required before showing this badge. */
  requires_verification: boolean;
}

// ── Color variant Tailwind classes ────────────────────────────────────────────
// verified/active/free_from: teal #248179 on tint #e3f1ef
// caution: coral #fd6158 on tint #ffe6e4
// neutral: charcoal #282828 on paper #faf7f2
// value: charcoal #282828 on lime #d2ff34

export const BADGE_COLOR_CLASSES: Record<BadgeColorVariant, string> = {
  verified:  "bg-[#e3f1ef] text-[#248179] border-[#c0ddd9]",
  active:    "bg-[#e3f1ef] text-[#248179] border-[#c0ddd9]",
  free_from: "bg-[#e3f1ef] text-[#248179] border-[#c0ddd9]",
  caution:   "bg-[#ffe6e4] text-[#fd6158] border-[#ffd0cc]",
  neutral:   "bg-[#faf7f2] text-[#282828] border-[#e8e2d8]",
  value:     "bg-[#d2ff34] text-[#282828] border-[#b8e820]",
};

// ── Badge Taxonomy ────────────────────────────────────────────────────────────

export const BADGE_TAXONOMY: Record<string, BadgeDefinition> = {

  // ── Verification ─────────────────────────────────────────────────────────

  TCS_CERTIFIED: {
    id: "TCS_CERTIFIED",
    label: "TCS Certified",
    family: "verification",
    color_variant: "verified",
    icon: Award,
    priority: 10,
    display_rule: "certificationStatus === tcs-certified",
    tooltip: "Reviewed and certified by The Clean Sheet. Formula, claims, and safety evidence meet TCS standards.",
    max_card_visibility: true,
    source_field: "certificationStatus",
    requires_verification: true,
  },

  UNDER_REVIEW: {
    id: "UNDER_REVIEW",
    label: "Under Review",
    family: "verification",
    color_variant: "neutral",
    icon: Clock,
    priority: 11,
    display_rule: "certificationStatus === under-review",
    tooltip: "This product is currently being reviewed by The Clean Sheet. Certification pending.",
    max_card_visibility: true,
    source_field: "certificationStatus",
    requires_verification: false,
  },

  INCI_VERIFIED: {
    id: "INCI_VERIFIED",
    label: "INCI Verified",
    family: "verification",
    color_variant: "verified",
    icon: ShieldCheck,
    priority: 12,
    display_rule: "pass_badges contains INCI Verified",
    tooltip: "Ingredient list is confirmed INCI-compliant and matches the product label reviewed by TCS.",
    max_card_visibility: true,
    source_field: "pass_badges",
    requires_verification: true,
  },

  CLAIMS_VERIFIED: {
    id: "CLAIMS_VERIFIED",
    label: "Claims Verified",
    family: "verification",
    color_variant: "verified",
    icon: ShieldCheck,
    priority: 13,
    display_rule: "pass_badges contains Claims Verified",
    tooltip: "Marketing claims reviewed against available evidence. Key claims are substantiated.",
    max_card_visibility: true,
    source_field: "pass_badges",
    requires_verification: true,
  },

  CLAIMS_REVIEWED: {
    id: "CLAIMS_REVIEWED",
    label: "Claims Reviewed",
    family: "verification",
    color_variant: "verified",
    icon: ShieldCheck,
    priority: 14,
    display_rule: "pass_badges contains Claims Reviewed",
    tooltip: "Marketing claims have been reviewed by TCS. See scorecard for detail on each claim.",
    max_card_visibility: true,
    source_field: "pass_badges",
    requires_verification: true,
  },

  ACTIVE_VERIFIED: {
    id: "ACTIVE_VERIFIED",
    label: "Active Verified",
    family: "verification",
    color_variant: "verified",
    icon: FlaskConical,
    priority: 15,
    display_rule: "Active concentration reviewed against brand-stated or publicly available evidence",
    tooltip: "Active ingredient concentration has been reviewed from brand disclosure or lab evidence. Concentration meets an effective range.",
    max_card_visibility: true,
    source_field: "pass_badges",
    requires_verification: true,
  },

  SPF_VERIFIED: {
    id: "SPF_VERIFIED",
    label: "SPF Verified",
    family: "verification",
    color_variant: "verified",
    icon: Sun,
    priority: 16,
    display_rule: "Validated SPF test evidence reviewed (published test report or regulatory approval)",
    tooltip: "SPF value has been validated from a published test report or regulatory filing reviewed by TCS.",
    max_card_visibility: true,
    source_field: "pass_badges",
    requires_verification: true,
  },

  UVA_VERIFIED: {
    id: "UVA_VERIFIED",
    label: "UVA Verified",
    family: "verification",
    color_variant: "verified",
    icon: Sun,
    priority: 17,
    display_rule: "UVA protection verified from PA rating evidence or in-vitro test data",
    tooltip: "UVA protection claim verified from PA rating evidence or critical wavelength test data reviewed by TCS.",
    max_card_visibility: true,
    source_field: "pass_badges",
    requires_verification: true,
  },

  PH_VERIFIED: {
    id: "PH_VERIFIED",
    label: "pH Verified",
    family: "verification",
    color_variant: "verified",
    icon: FlaskConical,
    priority: 18,
    display_rule: "pH level reviewed from brand disclosure or measured reference",
    tooltip: "Product pH has been reviewed and is appropriate for the active ingredients and intended use.",
    max_card_visibility: false,
    source_field: "pass_badges",
    requires_verification: true,
  },

  STABILITY_REVIEWED: {
    id: "STABILITY_REVIEWED",
    label: "Stability Reviewed",
    family: "verification",
    color_variant: "verified",
    icon: FlaskConical,
    priority: 19,
    display_rule: "Formulation stability evidence or brand-disclosed shelf life reviewed",
    tooltip: "Stability of active ingredients in this formula has been reviewed. Packaging and storage claims are supported.",
    max_card_visibility: false,
    source_field: "pass_badges",
    requires_verification: true,
  },

  MICROBIOLOGY_REVIEWED: {
    id: "MICROBIOLOGY_REVIEWED",
    label: "Microbio Reviewed",
    family: "verification",
    color_variant: "verified",
    icon: Microscope,
    priority: 20,
    display_rule: "Preservative system reviewed; microbiological safety evidence available",
    tooltip: "Preservative system and microbiological safety evidence have been reviewed by TCS.",
    max_card_visibility: false,
    source_field: "pass_badges",
    requires_verification: true,
  },

  FORMULA_REVIEWED: {
    id: "FORMULA_REVIEWED",
    label: "Formula Reviewed",
    family: "verification",
    color_variant: "verified",
    icon: FlaskConical,
    priority: 21,
    display_rule: "Full formula reviewed including GMP or manufacturing quality indicators",
    tooltip: "Formula quality has been reviewed including manufacturing standard indicators (e.g. GMP certification).",
    max_card_visibility: false,
    source_field: "pass_badges",
    requires_verification: true,
  },

  // ── Active Ingredients ────────────────────────────────────────────────────

  NIACINAMIDE: {
    id: "NIACINAMIDE",
    label: "Niacinamide",
    family: "active",
    color_variant: "active",
    icon: Zap,
    priority: 30,
    display_rule: "Niacinamide present in keyActives",
    tooltip: "Contains Niacinamide (Vitamin B3). Presence confirmed in ingredient list. Concentration not asserted unless Active Verified badge is shown.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  L_ASCORBIC_ACID: {
    id: "L_ASCORBIC_ACID",
    label: "L-Ascorbic Acid",
    family: "active",
    color_variant: "active",
    icon: Zap,
    priority: 31,
    display_rule: "L-Ascorbic Acid (pure Vitamin C) present in keyActives",
    tooltip: "Contains L-Ascorbic Acid, the pure and most-studied form of Vitamin C. Requires careful pH and packaging for stability.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  ETHYL_ASCORBIC_ACID: {
    id: "ETHYL_ASCORBIC_ACID",
    label: "Ethyl Ascorbic Acid",
    family: "active",
    color_variant: "active",
    icon: Zap,
    priority: 32,
    display_rule: "Ethyl Ascorbic Acid (3-O-Ethyl Ascorbic Acid) present in keyActives",
    tooltip: "Contains Ethyl Ascorbic Acid, a stable Vitamin C derivative that converts to ascorbic acid in skin.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  ASCORBYL_GLUCOSIDE: {
    id: "ASCORBYL_GLUCOSIDE",
    label: "Ascorbyl Glucoside",
    family: "active",
    color_variant: "active",
    icon: Zap,
    priority: 33,
    display_rule: "Ascorbyl Glucoside present in keyActives",
    tooltip: "Contains Ascorbyl Glucoside, a water-soluble and stable Vitamin C derivative.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  SODIUM_ASCORBYL_PHOSPHATE: {
    id: "SODIUM_ASCORBYL_PHOSPHATE",
    label: "Sodium Ascorbyl P.",
    family: "active",
    color_variant: "active",
    icon: Zap,
    priority: 34,
    display_rule: "Sodium Ascorbyl Phosphate present in keyActives",
    tooltip: "Contains Sodium Ascorbyl Phosphate (SAP), a stable Vitamin C derivative effective for brightening and acne.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  MAGNESIUM_ASCORBYL_PHOSPHATE: {
    id: "MAGNESIUM_ASCORBYL_PHOSPHATE",
    label: "Magnesium Asc. P.",
    family: "active",
    color_variant: "active",
    icon: Zap,
    priority: 35,
    display_rule: "Magnesium Ascorbyl Phosphate present in keyActives",
    tooltip: "Contains Magnesium Ascorbyl Phosphate (MAP), a gentle and stable Vitamin C derivative.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  RETINOL: {
    id: "RETINOL",
    label: "Retinol",
    family: "active",
    color_variant: "active",
    icon: Zap,
    priority: 36,
    display_rule: "Retinol or retinyl ester present in keyActives",
    tooltip: "Contains Retinol (Vitamin A). Ingredient presence confirmed. Not suitable for daytime use without SPF. See caution badges if applicable.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  RETINAL: {
    id: "RETINAL",
    label: "Retinal",
    family: "active",
    color_variant: "active",
    icon: Zap,
    priority: 37,
    display_rule: "Retinaldehyde present in keyActives",
    tooltip: "Contains Retinal (Retinaldehyde), a potent Vitamin A form closer in activity to retinoic acid than retinol.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  SALICYLIC_ACID: {
    id: "SALICYLIC_ACID",
    label: "Salicylic Acid",
    family: "active",
    color_variant: "active",
    icon: Zap,
    priority: 38,
    display_rule: "Salicylic Acid present in keyActives",
    tooltip: "Contains Salicylic Acid (BHA), an exfoliant that penetrates pores and helps with acne and congestion.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  GLYCOLIC_ACID: {
    id: "GLYCOLIC_ACID",
    label: "Glycolic Acid",
    family: "active",
    color_variant: "active",
    icon: Zap,
    priority: 39,
    display_rule: "Glycolic Acid present in keyActives",
    tooltip: "Contains Glycolic Acid (AHA), a chemical exfoliant that improves texture and tone. Increases photosensitivity.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  LACTIC_ACID: {
    id: "LACTIC_ACID",
    label: "Lactic Acid",
    family: "active",
    color_variant: "active",
    icon: Zap,
    priority: 40,
    display_rule: "Lactic Acid present in keyActives",
    tooltip: "Contains Lactic Acid (AHA), a gentler exfoliant compared to glycolic acid. Also a humectant.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  AZELAIC_ACID: {
    id: "AZELAIC_ACID",
    label: "Azelaic Acid",
    family: "active",
    color_variant: "active",
    icon: Zap,
    priority: 41,
    display_rule: "Azelaic Acid present in keyActives",
    tooltip: "Contains Azelaic Acid, effective for hyperpigmentation, rosacea, and acne with a well-tolerated safety profile.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  TRANEXAMIC_ACID: {
    id: "TRANEXAMIC_ACID",
    label: "Tranexamic Acid",
    family: "active",
    color_variant: "active",
    icon: Zap,
    priority: 42,
    display_rule: "Tranexamic Acid present in keyActives",
    tooltip: "Contains Tranexamic Acid, used for pigmentation and melasma. Generally well-tolerated in topical use.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  CERAMIDES: {
    id: "CERAMIDES",
    label: "Ceramides",
    family: "active",
    color_variant: "active",
    icon: Zap,
    priority: 43,
    display_rule: "Ceramides present in keyActives",
    tooltip: "Contains Ceramides, lipids that restore and maintain the skin barrier.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  PEPTIDES: {
    id: "PEPTIDES",
    label: "Peptides",
    family: "active",
    color_variant: "active",
    icon: Zap,
    priority: 44,
    display_rule: "Peptide ingredient(s) present in keyActives",
    tooltip: "Contains Peptides, amino acid chains that can support collagen synthesis and skin repair.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  HYALURONIC_ACID: {
    id: "HYALURONIC_ACID",
    label: "Hyaluronic Acid",
    family: "active",
    color_variant: "active",
    icon: Zap,
    priority: 45,
    display_rule: "Hyaluronic Acid present in keyActives",
    tooltip: "Contains Hyaluronic Acid, a humectant that attracts and retains moisture in the skin.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  SODIUM_HYALURONATE: {
    id: "SODIUM_HYALURONATE",
    label: "Sodium Hyaluronate",
    family: "active",
    color_variant: "active",
    icon: Zap,
    priority: 46,
    display_rule: "Sodium Hyaluronate present in keyActives",
    tooltip: "Contains Sodium Hyaluronate, the salt form of Hyaluronic Acid with smaller molecular weight for deeper penetration.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  ZINC_OXIDE: {
    id: "ZINC_OXIDE",
    label: "Zinc Oxide",
    family: "active",
    color_variant: "active",
    icon: Sun,
    priority: 47,
    display_rule: "Zinc Oxide present in keyActives (sunscreen)",
    tooltip: "Contains Zinc Oxide, a mineral UV filter providing broad-spectrum UVA and UVB protection.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  TITANIUM_DIOXIDE: {
    id: "TITANIUM_DIOXIDE",
    label: "Titanium Dioxide",
    family: "active",
    color_variant: "active",
    icon: Sun,
    priority: 48,
    display_rule: "Titanium Dioxide present in keyActives (sunscreen)",
    tooltip: "Contains Titanium Dioxide, a mineral UV filter providing primarily UVB and short UVA protection.",
    max_card_visibility: true,
    source_field: "keyActives",
    requires_verification: false,
  },

  // ── Free From ─────────────────────────────────────────────────────────────

  FRAGRANCE_FREE: {
    id: "FRAGRANCE_FREE",
    label: "Fragrance Free",
    family: "free_from",
    color_variant: "free_from",
    icon: XCircle,
    priority: 60,
    display_rule: "No fragrance, parfum, aroma, essential oil, or masking fragrance declared in INCI",
    tooltip: "No fragrance, parfum, aroma, essential oil, or masking fragrance detected in the declared ingredient list.",
    max_card_visibility: true,
    source_field: "fragranceStatus",
    requires_verification: true,
  },

  ESSENTIAL_OIL_FREE: {
    id: "ESSENTIAL_OIL_FREE",
    label: "Essential Oil Free",
    family: "free_from",
    color_variant: "free_from",
    icon: XCircle,
    priority: 61,
    display_rule: "No essential oils present in INCI",
    tooltip: "No essential oils detected in the ingredient list. Suitable for those reactive to botanical aromatic compounds.",
    max_card_visibility: true,
    source_field: "pass_badges",
    requires_verification: true,
  },

  DRYING_ALCOHOL_FREE: {
    id: "DRYING_ALCOHOL_FREE",
    label: "Alcohol Free",
    family: "free_from",
    color_variant: "free_from",
    icon: XCircle,
    priority: 62,
    display_rule: "No drying alcohols (Alcohol Denat., Ethanol, SD Alcohol) present in INCI",
    tooltip: "No drying alcohols (e.g. Alcohol Denat., Ethanol, SD Alcohol) detected. Fatty alcohols are not excluded as they are non-drying.",
    max_card_visibility: true,
    source_field: "alcoholStatus",
    requires_verification: true,
  },

  RETINOID_FREE: {
    id: "RETINOID_FREE",
    label: "Retinoid Free",
    family: "free_from",
    color_variant: "free_from",
    icon: XCircle,
    priority: 63,
    display_rule: "No retinol, retinyl esters, retinal, or retinoic acid in INCI",
    tooltip: "No retinoids detected. Safe to use in pregnancy (from a retinoid perspective) and suitable for those avoiding Vitamin A derivatives.",
    max_card_visibility: true,
    source_field: "pass_badges",
    requires_verification: true,
  },

  SILICONE_FREE: {
    id: "SILICONE_FREE",
    label: "Silicone Free",
    family: "free_from",
    color_variant: "free_from",
    icon: XCircle,
    priority: 64,
    display_rule: "No silicone or siloxane ingredients present in INCI",
    tooltip: "No silicones or siloxanes detected in the ingredient list.",
    max_card_visibility: true,
    source_field: "pass_badges",
    requires_verification: true,
  },

  NO_AZO_DYES: {
    id: "NO_AZO_DYES",
    label: "No Azo Dyes",
    family: "free_from",
    color_variant: "free_from",
    icon: XCircle,
    priority: 65,
    display_rule: "No azo-based colorants present in INCI",
    tooltip: "No azo dyes detected. Relevant for individuals with aspirin sensitivity or those avoiding synthetic colorants.",
    max_card_visibility: false,
    source_field: "pass_badges",
    requires_verification: true,
  },

  MINERAL_OIL_FREE: {
    id: "MINERAL_OIL_FREE",
    label: "Mineral Oil Free",
    family: "free_from",
    color_variant: "free_from",
    icon: XCircle,
    priority: 66,
    display_rule: "No mineral oil or paraffinum liquidum present in INCI",
    tooltip: "No mineral oil (Paraffinum Liquidum) or petroleum-derived occlusive oils detected.",
    max_card_visibility: false,
    source_field: "pass_badges",
    requires_verification: true,
  },

  // ── Caution ───────────────────────────────────────────────────────────────

  FRAGRANCE_ALLERGEN_FLAG: {
    id: "FRAGRANCE_ALLERGEN_FLAG",
    label: "Fragrance Allergens",
    family: "caution",
    color_variant: "caution",
    icon: AlertTriangle,
    priority: 100,
    display_rule: "EU-listed fragrance allergens detected in leave-on product INCI",
    tooltip: "Caution: One or more EU-listed fragrance allergens detected (e.g. linalool, geraniol, citronellol, farnesol, benzyl alcohol). May cause reactions in sensitive individuals. Check scorecard for specific allergens.",
    max_card_visibility: true,
    source_field: "warn_badges",
    requires_verification: false,
  },

  CONTAINS_FRAGRANCE: {
    id: "CONTAINS_FRAGRANCE",
    label: "Contains Fragrance",
    family: "caution",
    color_variant: "caution",
    icon: AlertTriangle,
    priority: 101,
    display_rule: "Fragrance, parfum, or aroma ingredient present in INCI",
    tooltip: "Caution: Contains fragrance (parfum, aroma, or named fragrance compound). Fragrance is a common cause of skin sensitisation and contact dermatitis.",
    max_card_visibility: true,
    source_field: "fragranceStatus",
    requires_verification: false,
  },

  BOTANICAL_FRAGRANCE_FLAG: {
    id: "BOTANICAL_FRAGRANCE_FLAG",
    label: "Botanical Fragrance",
    family: "caution",
    color_variant: "caution",
    icon: AlertTriangle,
    priority: 102,
    display_rule: "Natural botanical extract contains known fragrance allergen compounds",
    tooltip: "Caution: A botanical extract in this formula contains natural fragrance compounds (e.g. Rose, Lavender, Jasmine) that can cause the same sensitisation reactions as synthetic fragrance.",
    max_card_visibility: true,
    source_field: "warn_badges",
    requires_verification: false,
  },

  ESSENTIAL_OIL_FLAG: {
    id: "ESSENTIAL_OIL_FLAG",
    label: "Essential Oil",
    family: "caution",
    color_variant: "caution",
    icon: AlertTriangle,
    priority: 103,
    display_rule: "Essential oil present in a leave-on formula",
    tooltip: "Caution: Essential oil(s) detected. These can be potent sensitisers in leave-on products, particularly for those with reactive or sensitised skin.",
    max_card_visibility: true,
    source_field: "warn_badges",
    requires_verification: false,
  },

  DRYING_ALCOHOL_FLAG: {
    id: "DRYING_ALCOHOL_FLAG",
    label: "Drying Alcohol",
    family: "caution",
    color_variant: "caution",
    icon: AlertTriangle,
    priority: 104,
    display_rule: "Drying alcohol (Alcohol Denat., SD Alcohol, Ethanol) present",
    tooltip: "Caution: Contains a drying alcohol (Alcohol Denat., Ethanol, or SD Alcohol). At meaningful concentrations, these can disrupt the skin barrier, especially in dry or sensitive skin types.",
    max_card_visibility: true,
    source_field: "alcoholStatus",
    requires_verification: false,
  },

  RETINOID_FLAG: {
    id: "RETINOID_FLAG",
    label: "Contains Retinoid",
    family: "caution",
    color_variant: "caution",
    icon: AlertTriangle,
    priority: 105,
    display_rule: "Retinoid detected and caution context relevant (e.g. pregnancy, day use)",
    tooltip: "Caution: Contains a Vitamin A derivative (retinol, retinal, or retinyl ester). Avoid during pregnancy. Use at night. Apply SPF in the morning.",
    max_card_visibility: true,
    source_field: "warn_badges",
    requires_verification: false,
  },

  ACID_ACTIVE_FLAG: {
    id: "ACID_ACTIVE_FLAG",
    label: "Acid Active",
    family: "caution",
    color_variant: "caution",
    icon: AlertTriangle,
    priority: 106,
    display_rule: "AHA or BHA present at levels requiring photosensitivity caution",
    tooltip: "Caution: Contains an acid active (AHA or BHA) that increases photosensitivity. Use SPF daily and introduce slowly if new to acids.",
    max_card_visibility: true,
    source_field: "warn_badges",
    requires_verification: false,
  },

  SPF_NOT_VERIFIED: {
    id: "SPF_NOT_VERIFIED",
    label: "SPF Not Verified",
    family: "caution",
    color_variant: "caution",
    icon: AlertTriangle,
    priority: 107,
    display_rule: "SPF claim present but no validated test evidence reviewed",
    tooltip: "Caution: SPF claim could not be verified from publicly available test evidence or regulatory filing. Treat the SPF value as unconfirmed.",
    max_card_visibility: true,
    source_field: "warn_badges",
    requires_verification: false,
  },

  ACTIVE_PCT_NOT_VERIFIED: {
    id: "ACTIVE_PCT_NOT_VERIFIED",
    label: "Active % Not Verified",
    family: "caution",
    color_variant: "caution",
    icon: AlertTriangle,
    priority: 108,
    display_rule: "Active ingredient concentration claimed but not verifiable from public evidence",
    tooltip: "Caution: Active ingredient percentage is claimed by the brand but could not be verified from public evidence. Effective dosing is not confirmed.",
    max_card_visibility: true,
    source_field: "warn_badges",
    requires_verification: false,
  },

  ALLERGEN_FLAG: {
    id: "ALLERGEN_FLAG",
    label: "Allergen Present",
    family: "caution",
    color_variant: "caution",
    icon: AlertTriangle,
    priority: 109,
    display_rule: "A known allergen (non-fragrance) detected in INCI",
    tooltip: "Caution: A known allergen has been detected in the ingredient list. Check the full scorecard for details.",
    max_card_visibility: true,
    source_field: "warn_badges",
    requires_verification: false,
  },

  SOLVENT_FLAG: {
    id: "SOLVENT_FLAG",
    label: "Penetration Enhancer",
    family: "caution",
    color_variant: "caution",
    icon: AlertTriangle,
    priority: 110,
    display_rule: "Chemical penetration enhancer or strong solvent present",
    tooltip: "Caution: Contains a chemical penetration enhancer (e.g. Ethoxydiglycol/Transcutol) or strong solvent that increases systemic absorption of co-formulated actives.",
    max_card_visibility: false,
    source_field: "warn_badges",
    requires_verification: false,
  },

  PREGNANCY_NOT_REVIEWED: {
    id: "PREGNANCY_NOT_REVIEWED",
    label: "Pregnancy Not Reviewed",
    family: "caution",
    color_variant: "caution",
    icon: AlertTriangle,
    priority: 111,
    display_rule: "Product contains ingredients with pregnancy caution and has not been reviewed for pregnancy safety",
    tooltip: "Caution: This product has not been reviewed for pregnancy safety. It may contain ingredients (retinoids, acids, etc.) that require medical advice before use during pregnancy.",
    max_card_visibility: false,
    source_field: "warn_badges",
    requires_verification: false,
  },

  BABY_NOT_REVIEWED: {
    id: "BABY_NOT_REVIEWED",
    label: "Baby Not Reviewed",
    family: "caution",
    color_variant: "caution",
    icon: AlertTriangle,
    priority: 112,
    display_rule: "Product has not been reviewed for safety on infant skin",
    tooltip: "Caution: This product has not been reviewed for use on infant or baby skin. Do not use on infants without medical advice.",
    max_card_visibility: false,
    source_field: "warn_badges",
    requires_verification: false,
  },

  // ── Suitability ───────────────────────────────────────────────────────────

  OILY_SKIN: {
    id: "OILY_SKIN",
    label: "Oily Skin",
    family: "suitability",
    color_variant: "neutral",
    icon: Droplet,
    priority: 70,
    display_rule: "Product reviewed as suitable for oily skin types",
    tooltip: "Reviewed as suitable for oily skin. Non-comedogenic or mattifying properties noted.",
    max_card_visibility: true,
    source_field: "suitabilityTags",
    requires_verification: false,
  },

  DRY_SKIN: {
    id: "DRY_SKIN",
    label: "Dry Skin",
    family: "suitability",
    color_variant: "neutral",
    icon: Droplet,
    priority: 71,
    display_rule: "Product reviewed as suitable for dry skin types",
    tooltip: "Reviewed as suitable for dry skin. Contains hydrating or occluding ingredients appropriate for dry skin needs.",
    max_card_visibility: true,
    source_field: "suitabilityTags",
    requires_verification: false,
  },

  COMBINATION_SKIN: {
    id: "COMBINATION_SKIN",
    label: "Combination Skin",
    family: "suitability",
    color_variant: "neutral",
    icon: Users,
    priority: 72,
    display_rule: "Product reviewed as suitable for combination skin",
    tooltip: "Reviewed as suitable for combination skin. Balanced formulation that addresses both dry and oily zones.",
    max_card_visibility: true,
    source_field: "suitabilityTags",
    requires_verification: false,
  },

  SENSITIVE_SKIN: {
    id: "SENSITIVE_SKIN",
    label: "Sensitive Skin",
    family: "suitability",
    color_variant: "neutral",
    icon: Heart,
    priority: 73,
    display_rule: "Product reviewed as suitable for sensitive skin, absent common sensitisers",
    tooltip: "Reviewed as suitable for sensitive skin. Free from the major sensitisers identified for this product type.",
    max_card_visibility: true,
    source_field: "suitabilityTags",
    requires_verification: false,
  },

  ACNE_PRONE: {
    id: "ACNE_PRONE",
    label: "Acne Prone",
    family: "suitability",
    color_variant: "neutral",
    icon: Droplet,
    priority: 74,
    display_rule: "Product reviewed as non-comedogenic and suitable for acne-prone skin",
    tooltip: "Reviewed as suitable for acne-prone skin. Non-comedogenic ingredients and formula composition noted.",
    max_card_visibility: true,
    source_field: "suitabilityTags",
    requires_verification: false,
  },

  BEGINNER_FRIENDLY: {
    id: "BEGINNER_FRIENDLY",
    label: "Beginner Friendly",
    family: "suitability",
    color_variant: "neutral",
    icon: Star,
    priority: 75,
    display_rule: "Low irritation risk, straightforward usage, suitable for skincare beginners",
    tooltip: "Low irritation risk with straightforward usage. A good starting point for those new to this product type or active.",
    max_card_visibility: true,
    source_field: "suitabilityTags",
    requires_verification: false,
  },

  PREGNANCY_REVIEWED: {
    id: "PREGNANCY_REVIEWED",
    label: "Pregnancy Reviewed",
    family: "suitability",
    color_variant: "neutral",
    icon: ShieldCheck,
    priority: 76,
    display_rule: "Product formula reviewed for pregnancy safety; major concerns absent",
    tooltip: "Formula reviewed for pregnancy safety. Major pregnancy contraindications (retinoids, high-dose salicylic acid) are absent. Always consult your doctor.",
    max_card_visibility: true,
    source_field: "suitabilityTags",
    requires_verification: true,
  },

  BABY_REVIEWED: {
    id: "BABY_REVIEWED",
    label: "Baby Reviewed",
    family: "suitability",
    color_variant: "neutral",
    icon: Heart,
    priority: 77,
    display_rule: "Product formula reviewed for safety on infant skin",
    tooltip: "Formula reviewed for infant skin safety. Free from the main irritants and sensitisers flagged for baby use.",
    max_card_visibility: true,
    source_field: "suitabilityTags",
    requires_verification: true,
  },

  TEEN_REVIEWED: {
    id: "TEEN_REVIEWED",
    label: "Teen Reviewed",
    family: "suitability",
    color_variant: "neutral",
    icon: Star,
    priority: 78,
    display_rule: "Product reviewed as appropriate for teenage skin concerns",
    tooltip: "Reviewed as appropriate for teenage skin. Addresses common teen concerns (acne, oiliness) with an appropriate safety profile.",
    max_card_visibility: true,
    source_field: "suitabilityTags",
    requires_verification: false,
  },

  // ── Ethics ────────────────────────────────────────────────────────────────

  VEGAN: {
    id: "VEGAN",
    label: "Vegan",
    family: "ethics",
    color_variant: "neutral",
    icon: Leaf,
    priority: 80,
    display_rule: "Brand declaration or evidence of vegan formulation reviewed",
    tooltip: "Brand has declared or provided evidence that this product contains no animal-derived ingredients.",
    max_card_visibility: true,
    source_field: "pass_badges",
    requires_verification: true,
  },

  CRUELTY_FREE: {
    id: "CRUELTY_FREE",
    label: "Cruelty Free",
    family: "ethics",
    color_variant: "neutral",
    icon: Heart,
    priority: 81,
    display_rule: "PETA, Leaping Bunny, or equivalent cruelty-free certification reviewed",
    tooltip: "Brand has declared or holds a recognised cruelty-free certification. Product is not tested on animals.",
    max_card_visibility: true,
    source_field: "pass_badges",
    requires_verification: true,
  },

  CERTIFIED_ORGANIC: {
    id: "CERTIFIED_ORGANIC",
    label: "Certified Organic",
    family: "ethics",
    color_variant: "neutral",
    icon: Leaf,
    priority: 82,
    display_rule: "Organic certification (USDA, ECOCERT, COSMOS) reviewed",
    tooltip: "Holds a recognised organic certification (e.g. USDA Organic, ECOCERT, COSMOS). Key ingredients are organically sourced.",
    max_card_visibility: true,
    source_field: "pass_badges",
    requires_verification: true,
  },

  RSPO_CLAIMED: {
    id: "RSPO_CLAIMED",
    label: "RSPO Claimed",
    family: "ethics",
    color_variant: "neutral",
    icon: Leaf,
    priority: 83,
    display_rule: "Brand claims RSPO membership or certified sustainable palm",
    tooltip: "Brand claims RSPO membership or use of certified sustainable palm oil. This is a brand claim and has not been independently audited by TCS.",
    max_card_visibility: false,
    source_field: "pass_badges",
    requires_verification: false,
  },

  RECYCLABLE_PACK: {
    id: "RECYCLABLE_PACK",
    label: "Recyclable Pack",
    family: "ethics",
    color_variant: "neutral",
    icon: Leaf,
    priority: 84,
    display_rule: "Brand claims recyclable or recycled packaging reviewed",
    tooltip: "Brand claims recyclable or partially recycled packaging. Check local recycling facilities as availability varies.",
    max_card_visibility: false,
    source_field: "pass_badges",
    requires_verification: false,
  },

  // ── Value ─────────────────────────────────────────────────────────────────

  BEST_VALUE: {
    id: "BEST_VALUE",
    label: "Best Value",
    family: "value",
    color_variant: "value",
    icon: Star,
    priority: 85,
    display_rule: "Product scores well relative to price in its category",
    tooltip: "Offers strong score-to-price ratio within its category. Good clinical value for the cost.",
    max_card_visibility: true,
    source_field: "pass_badges",
    requires_verification: false,
  },

  BEST_EVIDENCE: {
    id: "BEST_EVIDENCE",
    label: "Best Evidence",
    family: "value",
    color_variant: "value",
    icon: Star,
    priority: 86,
    display_rule: "Product has the strongest evidence base in its category",
    tooltip: "Among the best-evidenced products in its category. Claims are well-supported by available data.",
    max_card_visibility: true,
    source_field: "pass_badges",
    requires_verification: false,
  },

  LOW_CAUTION: {
    id: "LOW_CAUTION",
    label: "Low Caution",
    family: "value",
    color_variant: "value",
    icon: ShieldCheck,
    priority: 87,
    display_rule: "Product has few or no caution-level flags",
    tooltip: "Few or no caution-level flags identified in this formula. Low concern ingredient profile.",
    max_card_visibility: true,
    source_field: "pass_badges",
    requires_verification: false,
  },

  HIGH_TRANSPARENCY: {
    id: "HIGH_TRANSPARENCY",
    label: "High Transparency",
    family: "value",
    color_variant: "value",
    icon: ShieldCheck,
    priority: 88,
    display_rule: "Brand has published unusually detailed formula or evidence disclosures",
    tooltip: "Brand has disclosed concentrations, test reports, or evidence well beyond average market standards.",
    max_card_visibility: true,
    source_field: "pass_badges",
    requires_verification: false,
  },
};

// ── Convenience helpers ───────────────────────────────────────────────────────

/** All defined badge IDs for type-safe reference. */
export const BADGE_IDS = Object.fromEntries(
  Object.keys(BADGE_TAXONOMY).map((id) => [id, id])
) as Record<keyof typeof BADGE_TAXONOMY, string>;

/** Get all badges for a given family, sorted by priority. */
export function getBadgesForFamily(family: BadgeFamily): BadgeDefinition[] {
  return Object.values(BADGE_TAXONOMY)
    .filter((b) => b.family === family)
    .sort((a, b) => a.priority - b.priority);
}

/** Human-readable family labels. */
export const FAMILY_LABELS: Record<BadgeFamily, string> = {
  verification: "Verification",
  active:       "Key Actives",
  free_from:    "Free From",
  caution:      "Caution",
  suitability:  "Suitability",
  ethics:       "Ethics",
  value:        "Value",
};
