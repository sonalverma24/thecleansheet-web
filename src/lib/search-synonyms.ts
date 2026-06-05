/**
 * Synonym-based search expansion.
 *
 * This module wraps the taxonomy-driven synonym engine and adds a
 * legacy SEARCH_SYNONYMS map for backward compatibility.
 * The primary expansion function is now taxonomy-aware.
 */

export { expandTaxonomyQuery as expandQuery } from "@/data/taxonomy";

/**
 * Legacy synonym map - kept for explicit overrides not covered by taxonomy.
 * Consumer-language phrases that map to search intents beyond single ingredients.
 */
export const SEARCH_SYNONYMS: Record<string, string[]> = {

  // Vitamin C family
  "vitamin c": [
    "vit c", "ascorbic acid", "l-ascorbic acid", "ethyl ascorbic acid",
    "3-o-ethyl ascorbic acid", "eaa", "ascorbyl glucoside", "sap",
    "map", "magnesium ascorbyl phosphate", "sodium ascorbyl phosphate",
    "glow serum", "brightening serum", "vitamin c serum",
  ],

  // Retinoids
  "retinoid": [
    "retinol", "retinal", "retinaldehyde", "retinyl palmitate",
    "0.3% retinol", "0.2% retinol", "bakuchiol",
    "anti ageing serum", "wrinkle serum", "anti-aging",
  ],

  // Niacinamide
  "niacinamide": [
    "niacin", "vitamin b3", "nicotinamide", "b3",
    "pore serum", "oil control serum", "barrier serum",
  ],

  // Sunscreen
  "sunscreen": [
    "spf", "sunblock", "uv protection", "broad spectrum",
    "pa++++", "pa+++", "uv filter", "sun protection",
    "gel sunscreen", "mineral sunscreen", "chemical sunscreen",
    "hybrid sunscreen", "tinted sunscreen",
  ],

  // Acne
  "acne": [
    "pimples", "breakouts", "acne prone", "acne-prone",
    "blemishes", "spot treatment", "bha", "salicylic",
    "spots", "zits", "blackheads",
  ],

  // Pigmentation
  "pigmentation": [
    "dark spots", "tanning", "melasma", "uneven tone",
    "hyperpigmentation", "brightening", "dullness",
    "dark spot", "pih", "post-inflammatory", "acne marks",
    "post acne marks", "uneven skin tone",
  ],

  // Barrier
  "barrier": [
    "damaged barrier", "barrier repair", "redness",
    "irritation", "sensitive skin", "ceramide",
    "over exfoliated", "skin burning", "reactive skin",
  ],

  // Baby
  "baby": [
    "infant", "toddler", "kids", "child safe", "baby safe",
    "baby care", "newborn",
  ],

  // Dandruff
  "dandruff": [
    "flaking", "itchy scalp", "scalp flakes", "anti dandruff",
    "seborrheic dermatitis", "flaky scalp",
  ],

  // Hair fall
  "hair fall": [
    "hair loss", "hair thinning", "hair shedding", "thinning hair",
    "hair growth", "scalp serum",
  ],

  // Hyaluronic acid
  "hyaluronic acid": [
    "ha", "sodium hyaluronate", "hyaluron", "hyaluronan",
    "hydrating serum", "moisture serum", "plumping serum",
  ],

  // Salicylic acid
  "salicylic acid": [
    "bha", "salicylate", "2% bha", "sa", "beta hydroxy",
    "acne serum", "exfoliating serum",
  ],

  // Glycolic acid
  "glycolic acid": [
    "aha", "alpha hydroxy", "alpha-hydroxy", "exfoliant", "peel",
    "aha toner", "aha serum", "texture serum",
  ],

  // Azelaic acid
  "azelaic acid": ["azelaic", "azelic acid", "azelaic serum"],

  // Tranexamic acid
  "tranexamic acid": ["tranexamic", "txa", "txa serum"],

  // Peptides
  "peptide": ["peptides", "matrixyl", "argireline", "palmitoyl", "firming serum"],

  // Ceramides
  "ceramide": [
    "ceramides", "barrier lipid", "sphingosine",
    "barrier cream", "ceramide cream",
  ],

  // Centella asiatica / Cica
  "centella asiatica": [
    "cica", "gotu kola", "tiger grass", "centella", "madecassoside",
    "cica cream", "cica serum",
  ],

  // Pregnancy safe
  "pregnancy safe": [
    "safe during pregnancy", "pregnancy reviewed",
    "maternity safe", "suitable for pregnancy",
  ],

  // Fragrance free
  "fragrance free": [
    "no fragrance", "parfum free", "unscented", "fragrance-free",
    "no parfum", "no scent",
  ],

  // Sensitive skin
  "sensitive skin": [
    "for sensitive skin", "gentle formula", "hypoallergenic",
    "fragrance free", "no fragrance", "barrier repair",
  ],

  // Exfoliant
  "exfoliant": [
    "aha toner", "bha exfoliant", "chemical exfoliant", "acid toner",
    "peeling solution", "exfoliating serum", "exfoliating pads",
  ],

  // Moisturizer
  "moisturizer": [
    "face cream", "moisturiser", "day cream", "hydrating cream",
    "gel moisturizer", "barrier cream", "ceramide cream",
  ],

  // Cleanser
  "cleanser": [
    "face wash", "facial cleanser", "gel cleanser", "cream cleanser",
    "foaming cleanser", "micellar water", "cleansing balm",
  ],

  // Tanning / tan
  "tan": [
    "tanning", "sun tan", "uv darkening", "dark skin from sun",
    "de-tan", "anti tan",
  ],
};
