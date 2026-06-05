/**
 * The Clean Sheet - Taxonomy Seed Data
 *
 * Single source of truth for all controlled taxonomy items.
 * Do not add items without admin approval. Do not create free-text tags
 * from product data. Unknown data must not produce a taxonomy item.
 *
 * To add a new item: add it here with status: "draft", then promote to
 * status: "active" after admin review.
 */

import type { TaxonomyItem, TaxonomyFamily, TaxonomyStatus } from "./schema";

// ── Factory ───────────────────────────────────────────────────────────────────

function mk(
  id: string,
  family: TaxonomyFamily,
  label: string,
  display_order: number,
  opts: Partial<TaxonomyItem> = {}
): TaxonomyItem {
  const slug = label
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    id,
    family,
    parent_id: null,
    label,
    slug,
    synonyms: [],
    description: "",
    display_order,
    is_filterable: true,
    is_searchable: true,
    is_public: true,
    is_admin_only: false,
    status: "active" as TaxonomyStatus,
    ...opts,
  };
}

// ── 1. Product Categories ─────────────────────────────────────────────────────

export const PRODUCT_CATEGORIES: TaxonomyItem[] = [
  mk("cat_face_cleansers",    "product_category", "Face Cleansers",    1,  { synonyms: ["cleanser", "face wash", "facial cleanser", "makeup remover"] }),
  mk("cat_serums",            "product_category", "Serums",            2,  { synonyms: ["serum", "face serum", "active serum", "treatment serum"] }),
  mk("cat_moisturizers",      "product_category", "Moisturizers",      3,  { synonyms: ["moisturizer", "moisturiser", "face cream", "hydrating cream", "day cream"] }),
  mk("cat_sunscreens",        "product_category", "Sunscreens",        4,  { synonyms: ["sunscreen", "spf", "sunblock", "sun protection", "uv protection"] }),
  mk("cat_baby_care",         "product_category", "Baby Care",         5,  { synonyms: ["baby", "infant", "toddler", "child", "kids care"] }),
  mk("cat_hair_care",         "product_category", "Hair Care",         6,  { synonyms: ["hair", "shampoo", "conditioner", "scalp", "hair oil"] }),
  mk("cat_eye_care",          "product_category", "Eye Care",          7,  { synonyms: ["eye cream", "under eye", "lash serum", "eye care"] }),
  mk("cat_body_care",         "product_category", "Body Care",         8,  { synonyms: ["body lotion", "body wash", "body cream", "body care"] }),
  mk("cat_lip_care",          "product_category", "Lip Care",          9,  { synonyms: ["lip balm", "lip treatment", "lip mask"] }),
  mk("cat_exfoliants",        "product_category", "Exfoliants",        10, { synonyms: ["exfoliant", "aha", "bha", "pha", "peeling", "exfoliating toner"] }),
  mk("cat_face_oils",         "product_category", "Face Oils",         11, { synonyms: ["face oil", "facial oil", "squalane", "rosehip"] }),
  mk("cat_masks",             "product_category", "Masks",             12, { synonyms: ["face mask", "clay mask", "sleeping mask", "sheet mask"] }),
  mk("cat_makeup_skin_base",  "product_category", "Makeup Skin Base",  13, { synonyms: ["foundation", "bb cream", "cc cream", "skin tint", "primer", "concealer"] }),
  mk("cat_intimate_care",     "product_category", "Intimate Care",     14, { synonyms: ["intimate wash", "feminine wash", "ph balanced wash"] }),
  mk("cat_mens_grooming",     "product_category", "Men's Grooming",    15, { synonyms: ["beard oil", "shaving gel", "aftershave", "men skincare"] }),
];

// ── 2. Product Types ──────────────────────────────────────────────────────────

const pt = (
  id: string,
  label: string,
  parentId: string,
  order: number,
  opts: Partial<TaxonomyItem> = {}
) => mk(id, "product_type", label, order, { parent_id: parentId, ...opts });

export const PRODUCT_TYPES: TaxonomyItem[] = [

  // Face Cleansers
  pt("pt_gel_cleanser",        "Gel Cleanser",        "cat_face_cleansers", 1),
  pt("pt_cream_cleanser",      "Cream Cleanser",      "cat_face_cleansers", 2),
  pt("pt_foaming_cleanser",    "Foaming Cleanser",    "cat_face_cleansers", 3, { synonyms: ["foam cleanser", "foaming face wash"] }),
  pt("pt_micellar_water",      "Micellar Water",      "cat_face_cleansers", 4),
  pt("pt_cleansing_balm",      "Cleansing Balm",      "cat_face_cleansers", 5),
  pt("pt_cleansing_oil",       "Cleansing Oil",       "cat_face_cleansers", 6),
  pt("pt_powder_cleanser",     "Powder Cleanser",     "cat_face_cleansers", 7),
  pt("pt_makeup_remover",      "Makeup Remover",      "cat_face_cleansers", 8, { synonyms: ["eye makeup remover", "makeup removing wipes"] }),

  // Serums
  pt("pt_vitamin_c_serum",         "Vitamin C Serum",         "cat_serums", 1, { synonyms: ["glow serum", "brightening serum", "vit c serum", "ascorbic serum"] }),
  pt("pt_niacinamide_serum",       "Niacinamide Serum",       "cat_serums", 2, { synonyms: ["b3 serum", "pore serum", "oil control serum"] }),
  pt("pt_retinol_serum",           "Retinol Serum",           "cat_serums", 3, { synonyms: ["anti ageing serum", "wrinkle serum", "retinoid serum"] }),
  pt("pt_retinal_serum",           "Retinal Serum",           "cat_serums", 4, { synonyms: ["retinaldehyde serum"] }),
  pt("pt_peptide_serum",           "Peptide Serum",           "cat_serums", 5, { synonyms: ["firming serum", "collagen serum"] }),
  pt("pt_hyaluronic_acid_serum",   "Hyaluronic Acid Serum",   "cat_serums", 6, { synonyms: ["ha serum", "hydrating serum", "plumping serum"] }),
  pt("pt_tranexamic_acid_serum",   "Tranexamic Acid Serum",   "cat_serums", 7, { synonyms: ["txa serum", "pigmentation serum"] }),
  pt("pt_azelaic_acid_serum",      "Azelaic Acid Serum",      "cat_serums", 8),
  pt("pt_exfoliating_serum",       "Exfoliating Serum",       "cat_serums", 9, { synonyms: ["aha serum", "bha serum", "chemical exfoliant serum"] }),
  pt("pt_barrier_repair_serum",    "Barrier Repair Serum",    "cat_serums", 10, { synonyms: ["ceramide serum", "skin barrier serum"] }),
  pt("pt_antioxidant_serum",       "Antioxidant Serum",       "cat_serums", 11),
  pt("pt_pigmentation_serum",      "Pigmentation Serum",      "cat_serums", 12, { synonyms: ["dark spot serum", "uneven tone serum", "hyperpigmentation serum"] }),
  pt("pt_acne_serum",              "Acne Serum",              "cat_serums", 13, { synonyms: ["blemish serum", "spot serum", "salicylic serum"] }),

  // Moisturizers
  pt("pt_gel_moisturizer",             "Gel Moisturizer",             "cat_moisturizers", 1, { synonyms: ["oil free gel", "lightweight gel moisturizer"] }),
  pt("pt_barrier_repair_cream",        "Barrier Repair Cream",        "cat_moisturizers", 2, { synonyms: ["ceramide cream", "barrier cream", "repair cream"] }),
  pt("pt_night_cream",                 "Night Cream",                 "cat_moisturizers", 3, { synonyms: ["overnight cream", "sleeping cream"] }),
  pt("pt_oil_free_moisturizer",        "Oil Free Moisturizer",        "cat_moisturizers", 4, { synonyms: ["oil free cream", "non greasy moisturizer"] }),
  pt("pt_sensitive_skin_moisturizer",  "Sensitive Skin Moisturizer",  "cat_moisturizers", 5),
  pt("pt_occlusive_balm",             "Occlusive Balm",              "cat_moisturizers", 6, { synonyms: ["slug", "slugging balm", "skin slugging"] }),
  pt("pt_face_lotion",                 "Face Lotion",                 "cat_moisturizers", 7),
  pt("pt_ceramide_cream",              "Ceramide Cream",              "cat_moisturizers", 8),
  pt("pt_lightweight_moisturizer",     "Lightweight Moisturizer",     "cat_moisturizers", 9, { synonyms: ["fluid moisturizer", "water cream"] }),

  // Sunscreens
  pt("pt_mineral_sunscreen",        "Mineral Sunscreen",        "cat_sunscreens", 1, { synonyms: ["zinc sunscreen", "titanium sunscreen", "physical sunscreen"] }),
  pt("pt_chemical_sunscreen",       "Chemical Sunscreen",       "cat_sunscreens", 2, { synonyms: ["organic filter sunscreen", "chemical uv filter"] }),
  pt("pt_hybrid_sunscreen",         "Hybrid Sunscreen",         "cat_sunscreens", 3, { synonyms: ["combo sunscreen", "mineral chemical hybrid"] }),
  pt("pt_gel_sunscreen",            "Gel Sunscreen",            "cat_sunscreens", 4),
  pt("pt_cream_sunscreen",          "Cream Sunscreen",          "cat_sunscreens", 5),
  pt("pt_tinted_sunscreen",         "Tinted Sunscreen",         "cat_sunscreens", 6, { synonyms: ["spf with tint", "tinted spf"] }),
  pt("pt_water_resistant_sunscreen","Water Resistant Sunscreen","cat_sunscreens", 7),
  pt("pt_kids_sunscreen",           "Kids Sunscreen",           "cat_sunscreens", 8, { synonyms: ["children sunscreen", "child safe sunscreen", "baby sunscreen spf"] }),
  pt("pt_body_sunscreen",           "Body Sunscreen",           "cat_sunscreens", 9),
  pt("pt_sunscreen_stick",          "Sunscreen Stick",          "cat_sunscreens", 10),
  pt("pt_sunscreen_spray",          "Sunscreen Spray",          "cat_sunscreens", 11),

  // Baby Care
  pt("pt_baby_body_wash",    "Baby Body Wash",    "cat_baby_care", 1, { synonyms: ["baby wash", "infant body wash"] }),
  pt("pt_baby_shampoo",      "Baby Shampoo",      "cat_baby_care", 2, { synonyms: ["infant shampoo", "toddler shampoo"] }),
  pt("pt_baby_lotion",       "Baby Lotion",       "cat_baby_care", 3, { synonyms: ["infant lotion", "baby moisturizer"] }),
  pt("pt_baby_cream",        "Baby Cream",        "cat_baby_care", 4),
  pt("pt_diaper_rash_cream", "Diaper Rash Cream", "cat_baby_care", 5, { synonyms: ["nappy rash cream", "barrier cream baby"] }),
  pt("pt_baby_oil",          "Baby Oil",          "cat_baby_care", 6),
  pt("pt_baby_sunscreen",    "Baby Sunscreen",    "cat_baby_care", 7, { synonyms: ["infant spf", "kids sunscreen"] }),
  pt("pt_baby_balm",         "Baby Balm",         "cat_baby_care", 8),

  // Hair Care
  pt("pt_shampoo",              "Shampoo",              "cat_hair_care", 1),
  pt("pt_conditioner",          "Conditioner",          "cat_hair_care", 2),
  pt("pt_hair_mask",            "Hair Mask",            "cat_hair_care", 3, { synonyms: ["deep conditioning mask", "hair treatment mask"] }),
  pt("pt_scalp_serum",          "Scalp Serum",          "cat_hair_care", 4),
  pt("pt_hair_oil",             "Hair Oil",             "cat_hair_care", 5),
  pt("pt_anti_dandruff_shampoo","Anti Dandruff Shampoo","cat_hair_care", 6, { synonyms: ["anti-dandruff", "dandruff shampoo", "scalp shampoo"] }),
  pt("pt_hair_fall_serum",      "Hair Fall Serum",      "cat_hair_care", 7, { synonyms: ["hair growth serum", "hair loss serum"] }),
  pt("pt_leave_in_conditioner", "Leave In Conditioner", "cat_hair_care", 8),
  pt("pt_hair_styling_cream",   "Hair Styling Cream",   "cat_hair_care", 9),
  pt("pt_heat_protectant",      "Heat Protectant",      "cat_hair_care", 10),

  // Eye Care
  pt("pt_eye_cream",          "Eye Cream",          "cat_eye_care", 1, { synonyms: ["under eye cream", "eye area cream"] }),
  pt("pt_under_eye_serum",    "Under Eye Serum",    "cat_eye_care", 2, { synonyms: ["eye serum", "dark circle serum"] }),
  pt("pt_lash_serum",         "Lash Serum",         "cat_eye_care", 3, { synonyms: ["eyelash serum", "lash growth serum"] }),
  pt("pt_kajal",              "Kajal",              "cat_eye_care", 4, { synonyms: ["kohl", "eye kajal"] }),
  pt("pt_mascara",            "Mascara",            "cat_eye_care", 5),
  pt("pt_eye_makeup_remover", "Eye Makeup Remover", "cat_eye_care", 6),
  pt("pt_eyeliner",           "Eyeliner",           "cat_eye_care", 7),

  // Body Care
  pt("pt_body_lotion",   "Body Lotion",   "cat_body_care", 1),
  pt("pt_body_wash",     "Body Wash",     "cat_body_care", 2, { synonyms: ["shower gel", "body cleanser"] }),
  pt("pt_body_oil",      "Body Oil",      "cat_body_care", 3),
  pt("pt_body_butter",   "Body Butter",   "cat_body_care", 4),
  pt("pt_body_sunscreen_bt","Body Sunscreen","cat_body_care", 5),
  pt("pt_hand_cream",    "Hand Cream",    "cat_body_care", 6),
  pt("pt_foot_cream",    "Foot Cream",    "cat_body_care", 7),

  // Lip Care
  pt("pt_lip_balm",       "Lip Balm",       "cat_lip_care", 1),
  pt("pt_lip_mask",       "Lip Mask",       "cat_lip_care", 2, { synonyms: ["overnight lip mask", "sleeping lip mask"] }),
  pt("pt_spf_lip_balm",   "SPF Lip Balm",   "cat_lip_care", 3, { synonyms: ["spf lip balm", "lip sunscreen"] }),
  pt("pt_lip_treatment",  "Lip Treatment",  "cat_lip_care", 4),

  // Exfoliants
  pt("pt_aha_toner",        "AHA Toner",        "cat_exfoliants", 1, { synonyms: ["glycolic toner", "lactic acid toner", "alpha hydroxy toner"] }),
  pt("pt_bha_exfoliant",    "BHA Exfoliant",    "cat_exfoliants", 2, { synonyms: ["salicylic exfoliant", "beta hydroxy exfoliant"] }),
  pt("pt_pha_exfoliant",    "PHA Exfoliant",    "cat_exfoliants", 3, { synonyms: ["gluconolactone exfoliant", "polyhydroxy exfoliant"] }),
  pt("pt_peeling_solution", "Peeling Solution", "cat_exfoliants", 4, { synonyms: ["chemical peel", "acid peel", "aha bha peel"] }),
  pt("pt_exfoliating_pads", "Exfoliating Pads", "cat_exfoliants", 5, { synonyms: ["acid pads", "exfoliant pads"] }),
  pt("pt_enzyme_exfoliant", "Enzyme Exfoliant", "cat_exfoliants", 6, { synonyms: ["papain exfoliant", "bromelain exfoliant"] }),

  // Face Oils
  pt("pt_facial_oil",    "Facial Oil",    "cat_face_oils", 1),
  pt("pt_botanical_oil", "Botanical Oil", "cat_face_oils", 2, { synonyms: ["rosehip oil", "marula oil", "jojoba oil"] }),
  pt("pt_barrier_oil",   "Barrier Oil",   "cat_face_oils", 3),
  pt("pt_squalane_oil",  "Squalane Oil",  "cat_face_oils", 4, { synonyms: ["squalane", "olive squalane"] }),

  // Masks
  pt("pt_clay_mask",      "Clay Mask",      "cat_masks", 1, { synonyms: ["kaolin mask", "bentonite mask"] }),
  pt("pt_sleeping_mask",  "Sleeping Mask",  "cat_masks", 2, { synonyms: ["overnight mask", "sleep mask"] }),
  pt("pt_hydrating_mask", "Hydrating Mask", "cat_masks", 3),
  pt("pt_sheet_mask",     "Sheet Mask",     "cat_masks", 4),
  pt("pt_peel_off_mask",  "Peel Off Mask",  "cat_masks", 5),

  // Makeup Skin Base
  pt("pt_foundation", "Foundation",  "cat_makeup_skin_base", 1),
  pt("pt_skin_tint",  "Skin Tint",   "cat_makeup_skin_base", 2, { synonyms: ["tinted moisturizer", "sheer foundation"] }),
  pt("pt_primer",     "Primer",      "cat_makeup_skin_base", 3, { synonyms: ["face primer", "makeup primer"] }),
  pt("pt_concealer",  "Concealer",   "cat_makeup_skin_base", 4),
  pt("pt_bb_cream",   "BB Cream",    "cat_makeup_skin_base", 5, { synonyms: ["bb", "blemish balm"] }),
  pt("pt_cc_cream",   "CC Cream",    "cat_makeup_skin_base", 6, { synonyms: ["cc", "color correcting cream"] }),

  // Intimate Care
  pt("pt_intimate_wash",       "Intimate Wash",       "cat_intimate_care", 1, { synonyms: ["feminine wash", "vaginal wash", "ph balanced wash"] }),
  pt("pt_intimate_moisturizer","Intimate Moisturizer","cat_intimate_care", 2),
  pt("pt_intimate_wipes",      "Intimate Wipes",      "cat_intimate_care", 3),

  // Men's Grooming
  pt("pt_beard_oil",   "Beard Oil",   "cat_mens_grooming", 1),
  pt("pt_shaving_gel", "Shaving Gel", "cat_mens_grooming", 2, { synonyms: ["shave gel", "shaving cream"] }),
  pt("pt_aftershave",  "Aftershave",  "cat_mens_grooming", 3),
  pt("pt_beard_wash",  "Beard Wash",  "cat_mens_grooming", 4),
  pt("pt_beard_balm",  "Beard Balm",  "cat_mens_grooming", 5),
];

// ── 3. Active Ingredient Groups (parent nodes, not filterable) ────────────────

const aiGroup = (id: string, label: string, order: number) =>
  mk(id, "active_ingredient", label, order, { is_filterable: false, is_public: false, is_admin_only: true });

export const ACTIVE_INGREDIENT_GROUPS: TaxonomyItem[] = [
  aiGroup("ai_grp_brightening",  "Brightening & Pigmentation",  1),
  aiGroup("ai_grp_acne",         "Acne & Oil Control",          2),
  aiGroup("ai_grp_exfoliation",  "Exfoliation & Texture",       3),
  aiGroup("ai_grp_ageing",       "Ageing & Firmness",           4),
  aiGroup("ai_grp_hydration",    "Hydration & Barrier",         5),
  aiGroup("ai_grp_soothing",     "Soothing & Sensitive Skin",   6),
  aiGroup("ai_grp_sunscreen",    "Sunscreen Filters",           7),
  aiGroup("ai_grp_hair",         "Hair & Scalp",                8),
];

// ── 4. Active Ingredients ─────────────────────────────────────────────────────

const ai = (
  id: string,
  label: string,
  groupId: string,
  order: number,
  synonyms: string[] = [],
  desc = ""
) =>
  mk(id, "active_ingredient", label, order, {
    parent_id: groupId,
    synonyms,
    description: desc,
  });

export const ACTIVE_INGREDIENTS: TaxonomyItem[] = [

  // Brightening & Pigmentation
  ai("ai_vitamin_c",               "Vitamin C",               "ai_grp_brightening", 1,  ["vit c", "ascorbic acid", "l-ascorbic", "ascorbate"]),
  ai("ai_l_ascorbic_acid",         "L-Ascorbic Acid",         "ai_grp_brightening", 2,  ["laa", "pure vitamin c", "l ascorbic"]),
  ai("ai_ethyl_ascorbic_acid",     "Ethyl Ascorbic Acid",     "ai_grp_brightening", 3,  ["eaa", "3-o-ethyl ascorbic acid", "ethyl ascorbate"]),
  ai("ai_ascorbyl_glucoside",      "Ascorbyl Glucoside",      "ai_grp_brightening", 4,  ["aa2g", "glucoside vitamin c"]),
  ai("ai_sodium_ascorbyl_phosphate","Sodium Ascorbyl Phosphate","ai_grp_brightening",5, ["sap", "sodium ascorbate"]),
  ai("ai_magnesium_ascorbyl_phosphate","Magnesium Ascorbyl Phosphate","ai_grp_brightening",6,["map"]),
  ai("ai_niacinamide",             "Niacinamide",             "ai_grp_brightening", 7,  ["nicotinamide", "vitamin b3", "niacin", "b3"]),
  ai("ai_tranexamic_acid",         "Tranexamic Acid",         "ai_grp_brightening", 8,  ["txa", "tranexamic"]),
  ai("ai_alpha_arbutin",           "Alpha Arbutin",           "ai_grp_brightening", 9,  ["arbutin", "alpha-arbutin"]),
  ai("ai_kojic_acid",              "Kojic Acid",              "ai_grp_brightening", 10, []),
  ai("ai_azelaic_acid",            "Azelaic Acid",            "ai_grp_brightening", 11, ["azelaic", "azelic acid"]),
  ai("ai_licorice_extract",        "Licorice Extract",        "ai_grp_brightening", 12, ["glycyrrhiza extract", "licorice root"]),
  ai("ai_glabridin",               "Glabridin",               "ai_grp_brightening", 13, []),
  ai("ai_resorcinol_derivatives",  "Resorcinol Derivatives",  "ai_grp_brightening", 14, ["phenylethyl resorcinol"]),
  ai("ai_4_butylresorcinol",       "4-Butylresorcinol",       "ai_grp_brightening", 15, ["4 butylresorcinol", "4br"]),
  ai("ai_n_acetyl_glucosamine",    "N-Acetyl Glucosamine",    "ai_grp_brightening", 16, ["nag", "n acetyl glucosamine"]),
  ai("ai_glutathione",             "Glutathione",             "ai_grp_brightening", 17, []),

  // Acne & Oil Control
  ai("ai_salicylic_acid",          "Salicylic Acid",          "ai_grp_acne", 1,  ["bha", "beta hydroxy acid", "salicylate", "sa"]),
  ai("ai_benzoyl_peroxide",        "Benzoyl Peroxide",        "ai_grp_acne", 2,  ["bpo", "bp"]),
  ai("ai_zinc_pca",                "Zinc PCA",                "ai_grp_acne", 3,  []),
  ai("ai_sulfur",                  "Sulfur",                  "ai_grp_acne", 4,  ["sulphur"]),
  ai("ai_tea_tree_oil",            "Tea Tree Oil",            "ai_grp_acne", 5,  ["melaleuca", "tea tree extract"]),
  ai("ai_mandelic_acid",           "Mandelic Acid",           "ai_grp_acne", 6,  []),
  ai("ai_piroctone_olamine",       "Piroctone Olamine",       "ai_grp_acne", 7,  ["piroctone"]),

  // Exfoliation & Texture
  ai("ai_glycolic_acid",           "Glycolic Acid",           "ai_grp_exfoliation", 1, ["aha", "alpha hydroxy acid", "glycolic"]),
  ai("ai_lactic_acid",             "Lactic Acid",             "ai_grp_exfoliation", 2, ["lactic"]),
  ai("ai_gluconolactone",          "Gluconolactone",          "ai_grp_exfoliation", 3, ["pha", "polyhydroxy acid"]),
  ai("ai_lactobionic_acid",        "Lactobionic Acid",        "ai_grp_exfoliation", 4, []),
  ai("ai_papain",                  "Papain",                  "ai_grp_exfoliation", 5, ["papaya enzyme"]),
  ai("ai_bromelain",               "Bromelain",               "ai_grp_exfoliation", 6, ["pineapple enzyme"]),
  ai("ai_urea",                    "Urea",                    "ai_grp_exfoliation", 7, ["carbamide"]),

  // Ageing & Firmness
  ai("ai_retinol",                 "Retinol",                 "ai_grp_ageing", 1,  ["vitamin a", "retinoid", "0.3% retinol", "0.5% retinol", "1% retinol"]),
  ai("ai_retinal",                 "Retinal",                 "ai_grp_ageing", 2,  ["retinaldehyde", "retinaldehid"]),
  ai("ai_retinyl_palmitate",       "Retinyl Palmitate",       "ai_grp_ageing", 3,  ["vitamin a palmitate"]),
  ai("ai_bakuchiol",               "Bakuchiol",               "ai_grp_ageing", 4,  ["natural retinol alternative", "babchi"]),
  ai("ai_peptides",                "Peptides",                "ai_grp_ageing", 5,  ["matrixyl", "argireline", "palmitoyl", "tripeptide"]),
  ai("ai_copper_peptides",         "Copper Peptides",         "ai_grp_ageing", 6,  ["ghk-cu", "copper tripeptide"]),
  ai("ai_coenzyme_q10",            "Coenzyme Q10",            "ai_grp_ageing", 7,  ["coq10", "ubiquinone"]),
  ai("ai_adenosine",               "Adenosine",               "ai_grp_ageing", 8,  []),
  ai("ai_growth_factors",          "Growth Factors",          "ai_grp_ageing", 9,  ["egf", "epidermal growth factor"]),

  // Hydration & Barrier
  ai("ai_hyaluronic_acid",         "Hyaluronic Acid",         "ai_grp_hydration", 1,  ["ha", "sodium hyaluronate", "hyaluron", "hyaluronan"]),
  ai("ai_sodium_hyaluronate",      "Sodium Hyaluronate",      "ai_grp_hydration", 2,  ["sha", "sodium ha"]),
  ai("ai_glycerin",                "Glycerin",                "ai_grp_hydration", 3,  ["glycerol", "glycerine"]),
  ai("ai_panthenol",               "Panthenol",               "ai_grp_hydration", 4,  ["provitamin b5", "vitamin b5", "d-panthenol"]),
  ai("ai_ceramides",               "Ceramides",               "ai_grp_hydration", 5,  ["ceramide np", "ceramide ap", "ceramide eop", "skin lipids"]),
  ai("ai_ceramide_np",             "Ceramide NP",             "ai_grp_hydration", 6,  ["ceramide 3"]),
  ai("ai_ceramide_ap",             "Ceramide AP",             "ai_grp_hydration", 7,  ["ceramide 6"]),
  ai("ai_ceramide_eop",            "Ceramide EOP",            "ai_grp_hydration", 8,  ["ceramide 1"]),
  ai("ai_cholesterol",             "Cholesterol",             "ai_grp_hydration", 9,  []),
  ai("ai_linoleic_acid",           "Linoleic Acid",           "ai_grp_hydration", 10, ["omega 6", "vitamin f"]),
  ai("ai_squalane",                "Squalane",                "ai_grp_hydration", 11, ["olive squalane", "sugarcane squalane"]),
  ai("ai_beta_glucan",             "Beta Glucan",             "ai_grp_hydration", 12, ["oat beta glucan", "b-glucan"]),
  ai("ai_allantoin",               "Allantoin",               "ai_grp_hydration", 13, []),
  ai("ai_colloidal_oatmeal",       "Colloidal Oatmeal",       "ai_grp_hydration", 14, ["avena sativa oat", "oat extract"]),
  ai("ai_ectoin",                  "Ectoin",                  "ai_grp_hydration", 15, []),

  // Soothing & Sensitive Skin
  ai("ai_centella_asiatica",       "Centella Asiatica",       "ai_grp_soothing", 1,  ["cica", "gotu kola", "tiger grass"]),
  ai("ai_madecassoside",           "Madecassoside",           "ai_grp_soothing", 2,  []),
  ai("ai_asiaticoside",            "Asiaticoside",            "ai_grp_soothing", 3,  []),
  ai("ai_bisabolol",               "Bisabolol",               "ai_grp_soothing", 4,  ["alpha bisabolol"]),
  ai("ai_azulene",                 "Azulene",                 "ai_grp_soothing", 5,  []),
  ai("ai_guaiazulene",             "Guaiazulene",             "ai_grp_soothing", 6,  []),
  ai("ai_green_tea_extract",       "Green Tea Extract",       "ai_grp_soothing", 7,  ["egcg", "camellia sinensis", "epigallocatechin gallate"]),

  // Sunscreen Filters
  ai("ai_zinc_oxide",              "Zinc Oxide",              "ai_grp_sunscreen", 1,  ["zinc", "mineral filter"]),
  ai("ai_titanium_dioxide",        "Titanium Dioxide",        "ai_grp_sunscreen", 2,  ["titanium", "mineral spf"]),
  ai("ai_avobenzone",              "Avobenzone",              "ai_grp_sunscreen", 3,  ["butyl methoxydibenzoylmethane"]),
  ai("ai_octocrylene",             "Octocrylene",             "ai_grp_sunscreen", 4,  []),
  ai("ai_octinoxate",              "Octinoxate",              "ai_grp_sunscreen", 5,  ["ethylhexyl methoxycinnamate", "ehmc"]),
  ai("ai_oxybenzone",              "Oxybenzone",              "ai_grp_sunscreen", 6,  ["benzophenone-3"]),
  ai("ai_tinosorb_s",              "Tinosorb S",              "ai_grp_sunscreen", 7,  ["bemotrizinol", "bis-ethylhexyloxyphenol methoxyphenyl triazine"]),
  ai("ai_tinosorb_m",              "Tinosorb M",              "ai_grp_sunscreen", 8,  ["bisoctrizole", "methylene bis-benzotriazolyl tetramethylbutylphenol"]),
  ai("ai_uvinul_a_plus",           "Uvinul A Plus",           "ai_grp_sunscreen", 9,  ["diethylamino hydroxybenzoyl hexyl benzoate", "dhhb"]),
  ai("ai_uvinul_t150",             "Uvinul T 150",            "ai_grp_sunscreen", 10, ["ethylhexyl triazone"]),
  ai("ai_mexoryl_sx",              "Mexoryl SX",              "ai_grp_sunscreen", 11, ["ecamsule", "terephthalylidene dicamphor sulfonic acid"]),
  ai("ai_mexoryl_xl",              "Mexoryl XL",              "ai_grp_sunscreen", 12, ["drometrizole trisiloxane"]),
  ai("ai_ensulizole",              "Ensulizole",              "ai_grp_sunscreen", 13, ["phenylbenzimidazole sulfonic acid"]),

  // Hair & Scalp
  ai("ai_ketoconazole",            "Ketoconazole",            "ai_grp_hair", 1,  []),
  ai("ai_zinc_pyrithione",         "Zinc Pyrithione",         "ai_grp_hair", 2,  ["zpt"]),
  ai("ai_climbazole",              "Climbazole",              "ai_grp_hair", 3,  []),
  ai("ai_selenium_sulfide",        "Selenium Sulfide",        "ai_grp_hair", 4,  []),
  ai("ai_minoxidil",               "Minoxidil",               "ai_grp_hair", 5,  []),
  ai("ai_redensyl",                "Redensyl",                "ai_grp_hair", 6,  []),
  ai("ai_procapil",                "Procapil",                "ai_grp_hair", 7,  []),
  ai("ai_caffeine",                "Caffeine",                "ai_grp_hair", 8,  []),
  ai("ai_rosemary_oil",            "Rosemary Oil",            "ai_grp_hair", 9,  ["rosmarinus officinalis"]),
  ai("ai_biotin",                  "Biotin",                  "ai_grp_hair", 10, ["vitamin b7", "vitamin h"]),
  ai("ai_keratin",                 "Keratin",                 "ai_grp_hair", 11, []),
  ai("ai_amino_acids",             "Amino Acids",             "ai_grp_hair", 12, ["glutamine", "arginine", "cysteine"]),
];

// ── 5. Concerns ───────────────────────────────────────────────────────────────

const cn = (id: string, label: string, order: number, synonyms: string[] = []) =>
  mk(id, "concern", label, order, { synonyms });

export const CONCERNS: TaxonomyItem[] = [

  // Skin concerns
  cn("cn_acne",               "Acne",               1,  ["pimples", "breakouts", "spots", "zits", "acne prone"]),
  cn("cn_blackheads",         "Blackheads",         2,  ["open comedones", "clogged pores"]),
  cn("cn_whiteheads",         "Whiteheads",         3,  ["closed comedones", "milia"]),
  cn("cn_oily_skin",          "Oily Skin",          4,  ["excess sebum", "shine", "greasy skin"]),
  cn("cn_dry_skin",           "Dry Skin",           5,  ["dryness", "flaky skin", "tight skin"]),
  cn("cn_dehydrated_skin",    "Dehydrated Skin",    6,  ["lack of moisture", "thirsty skin"]),
  cn("cn_sensitive_skin",     "Sensitive Skin",     7,  ["reactive skin", "skin sensitivity"]),
  cn("cn_barrier_damage",     "Barrier Damage",     8,  ["compromised barrier", "damaged skin barrier", "barrier repair"]),
  cn("cn_pigmentation",       "Pigmentation",       9,  ["dark spots", "hyperpigmentation", "uneven tone", "acne marks", "post acne marks", "pih"]),
  cn("cn_melasma",            "Melasma",            10, ["hormonal pigmentation", "chloasma"]),
  cn("cn_tanning",            "Tanning",            11, ["sun tan", "uv darkening"]),
  cn("cn_dullness",           "Dullness",           12, ["dull skin", "lack of glow", "uneven radiance"]),
  cn("cn_texture",            "Texture",            13, ["rough texture", "uneven skin texture", "bumpy skin"]),
  cn("cn_fine_lines",         "Fine Lines",         14, ["fine lines and wrinkles", "early ageing"]),
  cn("cn_wrinkles",           "Wrinkles",           15, ["deep wrinkles", "expression lines", "anti ageing"]),
  cn("cn_loss_of_firmness",   "Loss of Firmness",   16, ["sagging", "skin laxity", "loss of elasticity"]),
  cn("cn_redness",            "Redness",            17, ["skin redness", "erythema", "flushing"]),
  cn("cn_rosacea_prone",      "Rosacea Prone",      18, ["rosacea", "couperose"]),
  cn("cn_eczema_prone",       "Eczema Prone",       19, ["eczema", "atopic dermatitis", "eczema prone"]),
  cn("cn_enlarged_pores",     "Enlarged Pores",     20, ["open pores", "large pores", "visible pores"]),
  cn("cn_comedogenicity",     "Comedogenicity",     21, ["pore clogging", "comedogenic", "non-comedogenic"]),
  cn("cn_post_acne_marks",    "Post Acne Marks",    22, ["acne scars", "pih", "post inflammatory hyperpigmentation"]),
  cn("cn_photoageing",        "Photoageing",        23, ["photoaging", "sun ageing", "sun aging", "uv damage", "uv ageing", "solar ageing"]),
  cn("cn_age_prevention",     "Age Prevention",     24, ["anti ageing", "anti-aging", "antiageing", "age repair", "age-fighting"]),
  cn("cn_collagen_support",   "Collagen Support",   25, ["collagen boosting", "pro collagen", "collagen building"]),
  cn("cn_elasticity",         "Elasticity",         26, ["skin bounce", "skin elasticity", "firmness and elasticity"]),
  cn("cn_skin_renewal",       "Skin Renewal",       27, ["cell turnover", "resurfacing", "skin resurfacing", "retinol glow"]),
  cn("cn_sun_protection",     "Sun Protection",     23, ["spf", "uv protection", "sunscreen need"]),
  cn("cn_photostability",     "Photostability",     24, ["uv stability", "light stable formula"]),
  cn("cn_white_cast",         "White Cast",         25, ["white cast spf", "cast", "grey cast"]),
  cn("cn_eye_irritation",     "Eye Irritation",     26, ["eye sting", "stinging eyes"]),
  cn("cn_pregnancy_suitability","Pregnancy Suitability",27,["pregnancy safe", "maternity use"]),
  cn("cn_baby_suitability",   "Baby Suitability",   28, ["baby safe", "infant safe"]),
  cn("cn_teen_suitability",   "Teen Suitability",   29, ["teen skin", "teenage skin"]),

  // Hair & scalp concerns
  cn("cn_dandruff",           "Dandruff",           30, ["flaking", "scalp flakes", "anti dandruff", "itchy scalp"]),
  cn("cn_oily_scalp",         "Oily Scalp",         31, ["greasy scalp", "excess scalp oil"]),
  cn("cn_dry_scalp",          "Dry Scalp",          32, ["scalp dryness", "scalp flakiness"]),
  cn("cn_hair_fall",          "Hair Fall",          33, ["hair loss", "thinning hair", "hair shedding"]),
  cn("cn_hair_thinning",      "Hair Thinning",      34, ["fine hair", "low density hair"]),
  cn("cn_frizz",              "Frizz",              35, ["frizzy hair", "flyaways"]),
  cn("cn_hair_damage",        "Hair Damage",        36, ["damaged hair", "porous hair"]),
  cn("cn_breakage",           "Breakage",           37, ["hair breakage", "brittle hair"]),
  cn("cn_split_ends",         "Split Ends",         38, []),
  cn("cn_color_protection",   "Color Protection",   39, ["colour protection", "dye treated hair"]),
  cn("cn_scalp_sensitivity",  "Scalp Sensitivity",  40, ["sensitive scalp"]),
  cn("cn_product_buildup",    "Product Buildup",    41, ["buildup", "residue"]),
  cn("cn_hair_growth_claims", "Hair Growth Claims", 42, ["hair growth", "regrowth"]),

  // Baby care concerns
  cn("cn_baby_safe",          "Baby Safe",          43, ["infant safe", "newborn safe"]),
  cn("cn_toddler_safe",       "Toddler Safe",       44, ["child safe", "kids safe"]),
  cn("cn_tear_free",          "Tear Free",          45, ["no tears formula"]),
  cn("cn_diaper_rash",        "Diaper Rash",        46, ["nappy rash", "diaper dermatitis"]),
  cn("cn_fragrance_sensitivity","Fragrance Sensitivity",47,["fragrance free baby", "fragrance reactive"]),
  cn("cn_mild_cleansing",     "Mild Cleansing",     48, ["gentle cleansing", "non-stripping"]),
  cn("cn_barrier_support",    "Barrier Support",    49, ["skin barrier support", "barrier function"]),
  cn("cn_pediatric_review",   "Pediatric Review",   50, ["paediatric review", "doctor reviewed"]),

  // Pregnancy concerns
  cn("cn_pregnancy_safe",         "Pregnancy Safe",         51, ["safe in pregnancy", "maternity safe"]),
  cn("cn_retinoid_free",          "Retinoid Free",          52, ["no retinol", "retinol free"]),
  cn("cn_low_systemic_absorption","Low Systemic Absorption", 53, []),
  cn("cn_essential_oil_caution",  "Essential Oil Caution",  54, []),
  cn("cn_endocrine_concern",      "Endocrine Concern",      55, ["endocrine disruption", "hormone disruption"]),

  // Sunscreen concerns
  cn("cn_spf_protection",     "SPF Protection",     56, ["spf", "sun protection factor"]),
  cn("cn_uva_protection",     "UVA Protection",     57, ["uva", "long wave uv"]),
  cn("cn_uvb_protection",     "UVB Protection",     58, ["uvb", "short wave uv"]),
  cn("cn_broad_spectrum",     "Broad Spectrum",     59, ["broad-spectrum uv"]),
  cn("cn_pa_rating",          "PA Rating",          60, ["pa++++", "pa+++", "pa++", "persistent pigment darkening"]),
  cn("cn_water_resistance",   "Water Resistance",   61, ["water resistant", "sweat proof"]),
  cn("cn_spf_reapplication",  "Reapplication",      62, ["reapply sunscreen"]),
  cn("cn_mineral_preference", "Mineral Filter Preference", 63, ["zinc only", "mineral only spf"]),
  cn("cn_tinted_protection",  "Tinted Protection",  64, ["tinted spf", "tinted sunscreen benefit"]),
];

// ── 6. Suitability ────────────────────────────────────────────────────────────

const su = (id: string, label: string, order: number, synonyms: string[] = []) =>
  mk(id, "suitability", label, order, { synonyms });

export const SUITABILITY: TaxonomyItem[] = [
  su("su_oily_skin",        "Oily Skin",         1,  ["good for oily skin", "suitable for oily"]),
  su("su_dry_skin",         "Dry Skin",          2,  ["good for dry skin", "suitable for dry"]),
  su("su_combination_skin", "Combination Skin",  3,  ["combo skin"]),
  su("su_normal_skin",      "Normal Skin",       4,  []),
  su("su_sensitive_skin",   "Sensitive Skin",    5,  ["suitable for sensitive", "gentle for sensitive"]),
  su("su_acne_prone",       "Acne Prone Skin",   6,  ["acne prone", "breakout prone"]),
  su("su_teen_skin",        "Teen Skin",         7,  ["teenage skin", "teen use"]),
  su("su_pregnancy_reviewed","Pregnancy Reviewed",8, ["pregnancy safe reviewed", "safe in pregnancy"]),
  su("su_baby_reviewed",    "Baby Reviewed",     9,  ["baby safe reviewed", "infant reviewed"]),
  su("su_toddler_reviewed", "Toddler Reviewed",  10, ["toddler safe reviewed"]),
  su("su_beginner_friendly","Beginner Friendly", 11, ["skincare beginner", "starter product"]),
  su("su_daily_use",        "Daily Use",         12, ["everyday use", "daily skincare"]),
  su("su_melanin_rich",     "Melanin Rich Skin", 13, ["darker skin", "melanin skin", "deep skin tones"]),
  su("su_humid_weather",    "Humid Weather",     14, ["humidity", "tropical climate"]),
  su("su_dry_weather",      "Dry Weather",       15, ["dry climate", "cold weather skin"]),
  su("su_fragrance_sensitive","Fragrance Sensitive Users",16,["fragrance reactive", "no fragrance preference"]),
  su("su_retinoid_beginner","Retinoid Beginners",17, ["new to retinol", "retinol starter"]),
  su("su_active_experienced","Active Experienced Users",18,["experienced actives user"]),
];

// ── 7. Caution ────────────────────────────────────────────────────────────────

const caut = (id: string, label: string, order: number, synonyms: string[] = []) =>
  mk(id, "caution", label, order, { synonyms });

export const CAUTION: TaxonomyItem[] = [
  caut("caut_contains_fragrance",         "Contains Fragrance",           1,  ["fragrance present", "parfum", "aroma"]),
  caut("caut_fragrance_allergen_flag",    "Fragrance Allergen Flag",      2,  ["allergen fragrance", "eu fragrance allergen"]),
  caut("caut_essential_oil_flag",         "Essential Oil Flag",           3,  ["essential oil", "eo flag"]),
  caut("caut_drying_alcohol_flag",        "Drying Alcohol Flag",          4,  ["alcohol denat", "ethanol", "sd alcohol"]),
  caut("caut_retinoid_flag",              "Retinoid Flag",                5,  ["retinol caution", "retinoid caution"]),
  caut("caut_acid_active_flag",           "Acid Active Flag",             6,  ["aha caution", "bha caution", "acid flag"]),
  caut("caut_spf_not_verified",           "SPF Not Verified",             7,  ["spf unverified", "spf claim not verified"]),
  caut("caut_active_pct_not_verified",    "Active % Not Verified",        8,  ["concentration not verified", "unverified percentage"]),
  caut("caut_pregnancy_not_reviewed",     "Pregnancy Not Reviewed",       9,  ["pregnancy review missing", "not assessed for pregnancy"]),
  caut("caut_baby_not_reviewed",          "Baby Not Reviewed",            10, ["baby safety not assessed"]),
  caut("caut_teen_not_reviewed",          "Teen Not Reviewed",            11, []),
  caut("caut_contains_essential_oils",    "Contains Essential Oils",      12, ["eo in formula"]),
  caut("caut_botanical_fragrance",        "Contains Botanical Fragrance", 13, ["natural fragrance", "botanical fragrance components"]),
  caut("caut_potential_allergen",         "Contains Potential Allergen",  14, ["allergen present"]),
  caut("caut_comedogenic_ingredients",    "Contains Comedogenic Ingredients",15,["pore clogging ingredients"]),
  caut("caut_strong_exfoliants",          "Contains Strong Exfoliants",   16, ["high strength exfoliant"]),
  caut("caut_high_irritation_potential",  "High Irritation Potential",    17, ["irritation risk", "high irritation active"]),
  caut("caut_drug_boundary_claim",        "Contains Drug Boundary Claim", 18, ["drug claim", "otc drug claim"]),
  caut("caut_clinical_claim_not_verified","Clinical Claim Not Verified",  19, ["unverified clinical claim"]),
  caut("caut_dermatologist_not_verified", "Derm Tested Not Verified",     20, ["dermatologist tested claim not verified"]),
  caut("caut_hypoallergenic_not_verified","Hypoallergenic Not Verified",  21, ["hypoallergenic claim not verified"]),
  caut("caut_non_comedogenic_not_verified","Non-Comedogenic Not Verified",22, ["non comedogenic claim not verified"]),
];

// ── 8. Certification Status ───────────────────────────────────────────────────

export const CERTIFICATION_STATUS: TaxonomyItem[] = [
  mk("cs_tcs_certified",  "certification_status", "TCS Certified",  1, { synonyms: ["certified", "tcs certified"] }),
  mk("cs_not_certified",  "certification_status", "Not Certified",  2, { synonyms: ["uncertified"] }),
  mk("cs_under_review",   "certification_status", "Under Review",   3, { synonyms: ["review in progress", "being reviewed"] }),
  mk("cs_expired",        "certification_status", "Expired",        4, { is_admin_only: true }),
  mk("cs_suspended",      "certification_status", "Suspended",      5, { is_admin_only: true }),
  mk("cs_revoked",        "certification_status", "Revoked",        6, { is_admin_only: true }),
  mk("cs_data_limited",   "certification_status", "Data Limited",   7, { synonyms: ["limited data", "data insufficient"] }),
  mk("cs_not_reviewed",   "certification_status", "Not Reviewed",   8, { synonyms: ["not yet reviewed"] }),
];

// ── 9. Evidence Status ────────────────────────────────────────────────────────

export const EVIDENCE_STATUS: TaxonomyItem[] = [
  mk("ev_inci_verified",          "evidence_status", "INCI Verified",                  1,  { synonyms: ["inci checked", "ingredient list verified"] }),
  mk("ev_claims_reviewed",        "evidence_status", "Claims Reviewed",                2,  { synonyms: ["claim review done"] }),
  mk("ev_claims_verified",        "evidence_status", "Claims Verified",                3,  { synonyms: ["claim verified"] }),
  mk("ev_active_verified",        "evidence_status", "Active Verified",                4,  { synonyms: ["active concentration verified"] }),
  mk("ev_spf_verified",           "evidence_status", "SPF Verified",                   5,  { synonyms: ["spf validated", "spf test verified"] }),
  mk("ev_uva_verified",           "evidence_status", "UVA Verified",                   6,  { synonyms: ["pa rating verified", "uva validated"] }),
  mk("ev_ph_verified",            "evidence_status", "pH Verified",                    7,  { synonyms: ["ph tested", "ph validated"] }),
  mk("ev_stability_reviewed",     "evidence_status", "Stability Reviewed",             8,  { synonyms: ["stability tested"] }),
  mk("ev_microbiology_reviewed",  "evidence_status", "Microbiology Reviewed",          9,  { synonyms: ["microbiological test reviewed"] }),
  mk("ev_formula_reviewed_conf",  "evidence_status", "Formula Reviewed Confidentially",10, { is_admin_only: true }),
  mk("ev_evidence_not_available", "evidence_status", "Evidence Not Available",         11, { synonyms: ["no evidence"] }),
  mk("ev_evidence_limited",       "evidence_status", "Evidence Limited",               12, { synonyms: ["limited evidence"] }),
  mk("ev_evidence_pending",       "evidence_status", "Evidence Pending",               13, { synonyms: ["evidence awaited"] }),
  mk("ev_not_verified",           "evidence_status", "Not Verified",                   14, { synonyms: ["unverified", "not yet verified"] }),
];

// ── 10. PRISM Modules ─────────────────────────────────────────────────────────

export const PRISM_MODULES: TaxonomyItem[] = [
  mk("prism_core",              "prism_module", "PRISM Core",                      1,  { description: "Base formula and ingredient safety review." }),
  mk("prism_active_verified",   "prism_module", "PRISM Active Verified",           2,  { description: "Active concentration reviewed and verified." }),
  mk("prism_sun_verified",      "prism_module", "PRISM Sun Verified",              3,  { description: "SPF and UVA claims verified from test data." }),
  mk("prism_baby_safe",         "prism_module", "PRISM Baby Safe",                 4,  { description: "Formula reviewed for infant and baby skin safety." }),
  mk("prism_pregnancy_safe",    "prism_module", "PRISM Pregnancy Safe",            5,  { description: "Formula reviewed for use during pregnancy." }),
  mk("prism_sensitive_skin",    "prism_module", "PRISM Sensitive Skin",            6,  { description: "Sensitiser and irritant profile reviewed." }),
  mk("prism_eye_safe",          "prism_module", "PRISM Eye Safe",                  7,  { description: "Formula reviewed for periocular safety." }),
  mk("prism_scalp_hair",        "prism_module", "PRISM Scalp and Hair",            8,  { description: "Scalp and hair-specific safety and efficacy reviewed." }),
  mk("prism_natural_organic",   "prism_module", "PRISM Natural and Organic",       9,  { description: "Natural and organic integrity claims reviewed." }),
  mk("prism_manufacturer",      "prism_module", "PRISM Manufacturer Verified",     10, { description: "Manufacturing quality indicators reviewed (GMP etc.)." }),
  mk("prism_registry",          "prism_module", "PRISM Registry",                  11, { description: "Product listed in TCS public certification registry." }),
];

// ── 11. Skin Types ────────────────────────────────────────────────────────────

export const SKIN_TYPES: TaxonomyItem[] = [
  mk("skt_oily",        "skin_type", "Oily",        1),
  mk("skt_dry",         "skin_type", "Dry",         2),
  mk("skt_combination", "skin_type", "Combination", 3),
  mk("skt_normal",      "skin_type", "Normal",      4),
  mk("skt_sensitive",   "skin_type", "Sensitive",   5),
];

// ── 12. Hair Types ────────────────────────────────────────────────────────────

export const HAIR_TYPES: TaxonomyItem[] = [
  mk("ht_straight",   "hair_type", "Straight",   1),
  mk("ht_wavy",       "hair_type", "Wavy",       2),
  mk("ht_curly",      "hair_type", "Curly",      3),
  mk("ht_coily",      "hair_type", "Coily",      4),
  mk("ht_color_treated","hair_type","Color Treated",5),
  mk("ht_chemically_treated","hair_type","Chemically Treated",6),
];

// ── 13. Format ────────────────────────────────────────────────────────────────

export const FORMAT: TaxonomyItem[] = [
  mk("fmt_gel",       "format", "Gel",       1),
  mk("fmt_cream",     "format", "Cream",     2),
  mk("fmt_serum",     "format", "Serum",     3),
  mk("fmt_lotion",    "format", "Lotion",    4),
  mk("fmt_oil",       "format", "Oil",       5),
  mk("fmt_balm",      "format", "Balm",      6),
  mk("fmt_powder",    "format", "Powder",    7),
  mk("fmt_spray",     "format", "Spray",     8),
  mk("fmt_stick",     "format", "Stick",     9),
  mk("fmt_sheet",     "format", "Sheet",     10),
  mk("fmt_pads",      "format", "Pads",      11),
  mk("fmt_wipes",     "format", "Wipes",     12),
  mk("fmt_mousse",    "format", "Mousse",    13),
];

// ── 14. Price Segments ────────────────────────────────────────────────────────

export const PRICE_SEGMENTS: TaxonomyItem[] = [
  mk("ps_budget",    "price_segment", "Budget",    1, { synonyms: ["affordable", "under 500", "cheap"], description: "Under ₹500" }),
  mk("ps_mid",       "price_segment", "Mid Range", 2, { synonyms: ["mid range", "moderate price"], description: "₹500 to ₹1,500" }),
  mk("ps_premium",   "price_segment", "Premium",   3, { synonyms: ["premium price", "high end"], description: "₹1,500 to ₹3,000" }),
  mk("ps_luxury",    "price_segment", "Luxury",    4, { synonyms: ["luxury", "high end", "expensive"], description: "Above ₹3,000" }),
];

// ── 15. Availability Sources ──────────────────────────────────────────────────

export const AVAILABILITY_SOURCES: TaxonomyItem[] = [
  mk("avail_nykaa",       "availability_source", "Nykaa",          1),
  mk("avail_amazon",      "availability_source", "Amazon",         2),
  mk("avail_flipkart",    "availability_source", "Flipkart",       3),
  mk("avail_myntra",      "availability_source", "Myntra",         4),
  mk("avail_brand_site",  "availability_source", "Brand Website",  5),
  mk("avail_blinkit",     "availability_source", "Blinkit",        6),
  mk("avail_zepto",       "availability_source", "Zepto",          7),
  mk("avail_tata_cliq",   "availability_source", "Tata CLiQ",      8),
  mk("avail_purplle",     "availability_source", "Purplle",        9),
];

// ── Flat seed array ───────────────────────────────────────────────────────────

export const ALL_TAXONOMY_ITEMS: TaxonomyItem[] = [
  ...PRODUCT_CATEGORIES,
  ...PRODUCT_TYPES,
  ...ACTIVE_INGREDIENT_GROUPS,
  ...ACTIVE_INGREDIENTS,
  ...CONCERNS,
  ...SUITABILITY,
  ...CAUTION,
  ...CERTIFICATION_STATUS,
  ...EVIDENCE_STATUS,
  ...PRISM_MODULES,
  ...SKIN_TYPES,
  ...HAIR_TYPES,
  ...FORMAT,
  ...PRICE_SEGMENTS,
  ...AVAILABILITY_SOURCES,
];
