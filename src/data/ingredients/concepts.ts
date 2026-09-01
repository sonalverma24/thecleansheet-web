/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Ingredient concept dictionary (the "brain")
   The single source of truth for ingredient IDENTITY and EQUIVALENCE:
   what counts as the same thing under different names.

   A "concept" is one real thing a shopper or a brand talks about
   (Hyaluronic Acid, Silicones, Vitamin C…). It carries:
     • inci    - the INCI/label names whose PRESENCE means this concept
                 is in the product (salt forms, esters, derivatives).
     • aliases - the marketing / common names a CLAIM might use for it.

   So a claim that says "Hyaluronic Acid" (an alias) is satisfied when
   the INCI lists "Sodium Hyaluronate" (an inci form). One dictionary
   powers claim-checking, the free-from guardrail, and product matching.

   This is a curated, claim-relevant STARTER set - accurate for what it
   covers, meant to grow. Long-tail ingredients still fall back to the
   model's own web research; this is the deterministic backstop for the
   high-frequency cases where a wrong call does real damage.
──────────────────────────────────────────────────────────────── */

export type ConceptKind = "active" | "vitamin" | "humectant" | "botanical" | "family" | "basic";

export interface IngredientConcept {
  id: string;
  name: string;          // canonical display name
  kind: ConceptKind;
  /** INCI / label forms whose presence proves the concept is in the product. */
  inci: string[];
  /** Marketing / common names a claim may use (lower-case, normalised). */
  aliases: string[];
  /** Optional note surfaced in explanations. */
  note?: string;
}

const C = (
  id: string, name: string, kind: ConceptKind,
  inci: string[], aliases: string[] = [], note?: string,
): IngredientConcept => ({ id, name, kind, inci, aliases, note });

export const INGREDIENT_CONCEPTS: IngredientConcept[] = [
  // ── Actives & vitamins (for "contains X" claims) ──
  C("hyaluronic-acid", "Hyaluronic Acid", "humectant",
    ["hyaluronic acid", "sodium hyaluronate", "hydrolyzed hyaluronic acid", "sodium acetylated hyaluronate", "hydrolyzed sodium hyaluronate", "hyaluronate", "hyaluronan"],
    ["hyaluronic acid", "ha", "hyaluronan", "hyaluronic"],
    "Sodium Hyaluronate is the salt form of hyaluronic acid - the same active."),
  C("niacinamide", "Niacinamide (Vitamin B3)", "vitamin",
    ["niacinamide", "nicotinamide"],
    ["niacinamide", "vitamin b3", "b3", "nicotinamide"]),
  C("vitamin-c", "Vitamin C", "vitamin",
    ["ascorbic acid", "l-ascorbic acid", "sodium ascorbyl phosphate", "magnesium ascorbyl phosphate", "ethyl ascorbic acid", "3-o-ethyl ascorbic acid", "ascorbyl glucoside", "ascorbyl palmitate", "ascorbyl tetraisopalmitate", "tetrahexyldecyl ascorbate", "ascorbate", "ascorbyl"],
    ["vitamin c", "vit c", "ascorbic acid", "l ascorbic acid", "laa"]),
  C("vitamin-e", "Vitamin E", "vitamin",
    ["tocopherol", "tocopheryl acetate", "tocopheryl", "tocotrienol"],
    ["vitamin e", "vit e", "tocopherol"]),
  C("vitamin-b5", "Panthenol (Vitamin B5)", "vitamin",
    ["panthenol", "d-panthenol", "dl-panthenol", "panthenyl", "pantothenic acid"],
    ["panthenol", "pro-vitamin b5", "provitamin b5", "vitamin b5", "b5", "pro vitamin b5"]),
  C("retinol", "Retinol (Vitamin A)", "active",
    ["retinol", "retinyl palmitate", "retinyl acetate", "hydroxypinacolone retinoate", "retinal", "retinaldehyde"],
    ["retinol", "vitamin a", "retinal", "retinaldehyde"],
    "Retinyl esters are weaker than pure retinol - present, but not equivalent in potency."),
  C("salicylic-acid", "Salicylic Acid (BHA)", "active",
    ["salicylic acid", "sodium salicylate", "betaine salicylate", "capryloyl salicylic acid"],
    ["salicylic acid", "bha", "beta hydroxy acid"]),
  C("glycolic-acid", "Glycolic Acid (AHA)", "active",
    ["glycolic acid", "ammonium glycolate", "sodium glycolate"],
    ["glycolic acid", "aha", "alpha hydroxy acid"]),
  C("lactic-acid", "Lactic Acid (AHA)", "active",
    ["lactic acid", "sodium lactate", "ammonium lactate"],
    ["lactic acid"]),
  C("azelaic-acid", "Azelaic Acid", "active",
    ["azelaic acid", "potassium azeloyl diglycinate"],
    ["azelaic acid"]),
  C("alpha-arbutin", "Alpha Arbutin", "active",
    ["alpha-arbutin", "arbutin", "beta-arbutin"],
    ["alpha arbutin", "arbutin"]),
  C("tranexamic-acid", "Tranexamic Acid", "active",
    ["tranexamic acid", "cetyl tranexamate mesylate"],
    ["tranexamic acid"]),
  C("kojic-acid", "Kojic Acid", "active",
    ["kojic acid", "kojic dipalmitate"],
    ["kojic acid"]),
  C("bakuchiol", "Bakuchiol", "active",
    ["bakuchiol", "psoralea corylifolia"],
    ["bakuchiol"]),
  C("caffeine", "Caffeine", "active",
    ["caffeine"],
    ["caffeine"]),
  C("ceramides", "Ceramides", "active",
    ["ceramide np", "ceramide ap", "ceramide eop", "ceramide", "ceramides"],
    ["ceramide", "ceramides"]),
  C("centella", "Centella / Cica", "botanical",
    ["centella asiatica", "madecassoside", "asiaticoside", "madecassic acid", "asiatic acid"],
    ["cica", "centella", "gotu kola", "tiger grass"]),
  C("glycerin", "Glycerin", "humectant",
    ["glycerin", "glycerine", "glycerol"],
    ["glycerin", "glycerine", "glycerol"]),
  C("aloe", "Aloe Vera", "botanical",
    ["aloe barbadensis", "aloe vera", "aloe barbadensis leaf juice", "aloe barbadensis leaf extract"],
    ["aloe", "aloe vera"]),
  C("shea-butter", "Shea Butter", "botanical",
    ["butyrospermum parkii", "shea butter"],
    ["shea butter", "shea"]),
  C("coconut-oil", "Coconut Oil", "botanical",
    ["cocos nucifera oil", "cocos nucifera", "coconut oil"],
    ["coconut oil", "coconut"]),
  C("jojoba", "Jojoba Oil", "botanical",
    ["simmondsia chinensis", "jojoba"],
    ["jojoba", "jojoba oil"]),
  C("squalane", "Squalane", "active",
    ["squalane", "squalene"],
    ["squalane"]),
  C("allantoin", "Allantoin", "active",
    ["allantoin"],
    ["allantoin"]),
  C("zinc", "Zinc", "active",
    ["zinc oxide", "zinc pca", "zinc gluconate", "zinc pyrithione"],
    ["zinc"]),
  C("mandelic-acid", "Mandelic Acid (AHA)", "active", ["mandelic acid"], ["mandelic acid"]),
  C("pha", "Polyhydroxy Acid (PHA)", "active", ["gluconolactone", "lactobionic acid", "galactose"], ["pha", "polyhydroxy acid"]),
  C("ferulic-acid", "Ferulic Acid", "active", ["ferulic acid"], ["ferulic acid"]),
  C("peptides", "Peptides", "active", ["palmitoyl tripeptide", "palmitoyl pentapeptide", "acetyl hexapeptide", "copper tripeptide", "matrixyl", "argireline", "oligopeptide", "hexapeptide", "tripeptide"], ["peptide", "peptides", "matrixyl", "argireline"]),
  C("coenzyme-q10", "Coenzyme Q10", "active", ["ubiquinone", "coenzyme q10"], ["q10", "coenzyme q10", "ubiquinone", "coq10"]),
  C("adapalene", "Adapalene", "active", ["adapalene"], ["adapalene"]),
  C("benzoyl-peroxide", "Benzoyl Peroxide", "active", ["benzoyl peroxide"], ["benzoyl peroxide", "bpo"]),
  C("urea", "Urea", "humectant", ["urea"], ["urea"]),
  C("colloidal-oatmeal", "Colloidal Oatmeal", "botanical", ["avena sativa", "colloidal oatmeal", "oat"], ["oat", "oatmeal", "colloidal oatmeal"]),
  C("tea-tree", "Tea Tree", "botanical", ["melaleuca alternifolia", "tea tree"], ["tea tree"]),
  C("green-tea", "Green Tea", "botanical", ["camellia sinensis", "egcg", "epigallocatechin"], ["green tea", "matcha"]),
  C("licorice", "Licorice", "botanical", ["glycyrrhiza glabra", "glabridin", "licorice", "liquorice", "dipotassium glycyrrhizate"], ["licorice", "liquorice", "mulethi", "glabridin"]),
  C("snail-mucin", "Snail Mucin", "active", ["snail secretion filtrate", "snail mucin"], ["snail mucin", "snail"]),
  C("mugwort", "Mugwort", "botanical", ["artemisia", "mugwort"], ["mugwort", "artemisia"]),
  C("rosemary", "Rosemary", "botanical", ["rosmarinus officinalis", "rosemary"], ["rosemary"]),
  C("onion", "Onion", "botanical", ["allium cepa"], ["onion", "onion oil"]),
  C("argan", "Argan Oil", "botanical", ["argania spinosa", "argan"], ["argan", "argan oil"]),
  C("rosehip", "Rosehip", "botanical", ["rosa canina", "rosa moschata", "rosehip"], ["rosehip", "rosehip oil"]),
  C("marula", "Marula Oil", "botanical", ["sclerocarya birrea", "marula"], ["marula", "marula oil"]),
  C("collagen", "Collagen", "active", ["hydrolyzed collagen", "soluble collagen", "collagen"], ["collagen"]),
  C("bha-antioxidant", "BHT / BHA (antioxidant)", "family", ["bht", "bha", "butylated hydroxytoluene", "butylated hydroxyanisole"], []),

  // ── "Basic" equivalences ──
  C("water", "Water", "basic", ["water", "aqua", "eau"], ["water", "aqua"]),
  C("fragrance", "Fragrance", "family", ["parfum", "fragrance", "aroma"], ["fragrance", "parfum", "perfume"]),

  // ── Families (for "free-from X" claims). inci terms are deliberately precise
  //    so a claim isn't wrongly contradicted (e.g. "sulphate-free" must not trip
  //    on Magnesium Sulphate; "alcohol-free" must not trip on Cetyl Alcohol). ──
  C("silicones", "Silicones", "family",
    ["dimethicone", "cyclopentasiloxane", "cyclohexasiloxane", "cyclomethicone", "siloxane", "silsesquioxane", "dimethiconol", "trimethicone", "silanetriol", "silicone"],
    ["silicone", "silicones", "silicone-free", "silicon"]),
  C("parabens", "Parabens", "family",
    ["methylparaben", "ethylparaben", "propylparaben", "butylparaben", "isobutylparaben", "paraben"],
    ["paraben", "parabens"]),
  C("sulphates", "Sulphate surfactants", "family",
    ["sodium lauryl sulfate", "sodium laureth sulfate", "ammonium lauryl sulfate", "ammonium laureth sulfate", "sodium coco sulfate", "sodium myreth sulfate", "tea-lauryl sulfate"],
    ["sulphate", "sulfate", "sls", "sles", "sulphates", "sulfates"],
    "Refers to sulphate SURFACTANTS (SLS/SLES) - not mineral salts like Magnesium Sulphate."),
  C("drying-alcohol", "Drying alcohol", "family",
    ["alcohol denat", "sd alcohol", "denatured alcohol", "ethanol", "isopropyl alcohol"],
    ["alcohol", "alcohol-free", "no alcohol"],
    "Refers to volatile/denatured alcohols - not fatty alcohols like Cetyl or Cetearyl Alcohol."),
  C("mineral-oil", "Mineral oil", "family",
    ["paraffinum liquidum", "mineral oil", "petrolatum", "paraffin"],
    ["mineral oil", "petrolatum", "petroleum"]),
  C("formaldehyde-releasers", "Formaldehyde releasers", "family",
    ["dmdm hydantoin", "imidazolidinyl urea", "diazolidinyl urea", "quaternium-15", "formaldehyde"],
    ["formaldehyde"]),
  C("phthalates", "Phthalates", "family",
    ["phthalate", "diethyl phthalate", "dibutyl phthalate"],
    ["phthalate", "phthalates"]),
  C("essential-oils", "Essential oils", "family",
    ["essential oil", "peppermint oil", "lavender oil", "tea tree oil", "eucalyptus oil", "citrus oil"],
    ["essential oil", "essential oils", "essential-oil"]),
];

/* De-dupe the couple of alias-hook concepts that share an id space (panthenol). */
export const CONCEPTS: IngredientConcept[] = INGREDIENT_CONCEPTS.filter(
  (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i,
);
