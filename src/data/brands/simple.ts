/**
 * Simple Skincare brand data
 *
 * Ingredient lists sourced from simpleskincare.in product pages, incidecoder.com,
 * and Amazon India / Nykaa listings (verified May 2026).
 * INCI order is descending by concentration (cosmetics labelling law, globally standard).
 * Concentration inferences marked as "position-based" are analytical deductions, not brand claims.
 * Only percentages stated explicitly by the brand are asserted as fact.
 * Brand founded 1960 (UK), part of Unilever since 2010.
 *
 * Scoring framework updated 2026-05-20: 4-pillar system
 *   Safety & Toxicity: max 40
 *   Formulation Quality & Efficacy: max 25
 *   Ingredient Disclosure & Transparency: max 25
 *   Ethics & Sustainability: max 10
 */

import type { Brand, ProductScorecard } from "./types";

const BRAND_SLUG = "simple";
const BRAND_NAME = "Simple Skincare";

const products: ProductScorecard[] = [

  /* -------------------------------------------------
     1. Kind to Skin Moisturising Facial Wash
     Source: simpleskincare.in/products/moisturising-facial-wash
  ------------------------------------------------- */
  {
    productName: "Kind to Skin Moisturising Facial Wash",
    slug: "moisturising-facial-wash",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "Rs. 378 - Rs. 420",
    productType: "rinse-off",
    concern: "Daily cleansing, makeup removal, sensitive skin, barrier-gentle wash",
    summary: "Simple's bestselling facial wash leads with Sodium Laureth Sulfate (SLES) as the primary surfactant - effective but undercuts the brand's 'no harsh chemicals' positioning. SLES, an ethoxylated sulfate, is associated with potential 1,4-dioxane manufacturing impurity and can disrupt the skin barrier with repeated use, particularly in sensitive and eczema-prone skin. Three PEG-derived ingredients compound the ethoxylation impurity concern. Cocamide MEA raises a nitrosamine precursor concern (CIR advisory). Decyl Glucoside and Cocamidopropyl Betaine as co-surfactants moderate harshness somewhat. Panthenol, Bisabolol, and Allantoin are well-evidenced soothing actives that earn their place in a sensitive-skin formula. No artificial fragrance or colour are verified from the INCI - the brand's headline claims hold. Indian users with hard water should note that sulfate surfactants interact with calcium ions to form insoluble soap scum, reducing lather performance and leaving a film.",
    score: 61,
    scoreLabel: "Fair",
    image: "https://www.simpleskincare.in/cdn/shop/files/Module1_1000x1000.jpg?v=1769513376",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 22, max: 40,
        note: "Sodium Laureth Sulfate (SLES) is the primary surfactant, appearing at position 2. SLES is an ethoxylated sulfate: the ethoxylation process introduces a risk of 1,4-dioxane as a manufacturing impurity. While finished-product levels are typically low, the presence of three additional PEG-derived compounds (PEG-55 Propylene Glycol Oleate, PEG-7 Glyceryl Cocoate, Laureth-10) each carrying the same impurity pathway compounds the cumulative concern. SLES is also a recognised barrier disruptor with repeated use, particularly for sensitive and eczema-prone skin. Cocamide MEA at position 20 is a nitrosamine precursor; the CIR (the US industry cosmetics safety body) advises formulators to verify that no nitrosating agents are present in such formulas. No fragrance, no parabens, no artificial colour — these are genuine commitments for a mass-market product. Rinse-off use limits systemic exposure considerably compared to leave-on products.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 19, max: 25,
        note: "SLES is an effective cleanser, but it sits at odds with a 'kind to skin' brand positioning — milder alternatives such as Sodium Cocoyl Glutamate or Sodium Lauroyl Methyl Isethionate are available and widely used in sensitive-skin formulations. Decyl Glucoside, a sugar-derived surfactant, and Cocamidopropyl Betaine, an amphoteric co-surfactant, meaningfully reduce the harshness of the SLES system. Bisabolol, derived from German Chamomile, is a well-evidenced anti-inflammatory active that reduces post-cleanse redness. Allantoin supports skin repair. Panthenol (Pro-Vitamin B5) aids post-cleanse hydration. Glycol Distearate creates the pearlescent visual texture but contributes no skin function.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 13, max: 25,
        note: "The brand's 'no artificial perfume, no artificial colour' claims are verified from the INCI list — a meaningful and genuine commitment for a mass-market cleanser. However, the 'no harsh chemicals' claim is directly contradicted by SLES at position 2: SLES is classified as a barrier disruptor in dermatology literature and is widely considered a harsh surfactant for sensitive skin. The full INCI is published on the brand website. PETA cruelty-free certification is independently verified. 'Dermatologically tested' is stated without a published citation or study reference.",
      },
      {
        name: "Ethics & Sustainability",
        score: 7, max: 10,
        note: "PETA cruelty-free certification is independently verified — this is particularly relevant given that Simple's parent company Unilever has different animal testing policies for its China-sold products. SLES production generates 1,4-dioxane as a waste byproduct requiring active remediation. PEG ethoxylation chemistry is energy- and solvent-intensive. Simple is a UK brand distributed in India. No sustainability reporting specific to the India supply chain is publicly available.",
      },
    ],
    keyActives: [
      { name: "Decyl Glucoside",      function: "Sugar-derived non-ionic co-surfactant; very mild, low sensitisation potential" },
      { name: "Cocamidopropyl Betaine", function: "Amphoteric co-surfactant; moderates harshness of SLES primary surfactant" },
      { name: "Panthenol",            function: "Pro-Vitamin B5; post-cleanse hydration and barrier support" },
      { name: "Bisabolol",            function: "Anti-inflammatory chamomile-derived active; soothes post-cleanse sensitivity" },
      { name: "Allantoin",            function: "Keratolytic and skin-repair; supports tolerance in sensitized skin" },
    ],
    ingredients: [
      { name: "Aqua",                       note: "Solvent base",                                                                                            flag: "ok"   },
      { name: "Sodium Laureth Sulfate",     note: "SLES: primary surfactant at position 2. Ethoxylated sulfate with 1,4-dioxane manufacturing impurity risk; barrier disruption with repeated use in sensitive skin. Milder than SLS but not mild for a sensitive skin claim.", flag: "warn" },
      { name: "Decyl Glucoside",            note: "Sugar-based non-ionic surfactant; very mild, food-grade-derived, low sensitisation profile",              flag: "ok"   },
      { name: "Cocamidopropyl Betaine",     note: "Amphoteric co-surfactant; moderates SLES harshness. Trace sensitization in a small subset, usually co-formulant impurities", flag: "ok"   },
      { name: "Propylene Glycol",           note: "Humectant and solvent; position 5 suggests moderate concentration. In a rinse-off product, penetration enhancement concern is reduced", flag: "info" },
      { name: "PEG-55 Propylene Glycol Oleate", note: "Emulsifier/surfactant; ethoxylated compound with potential 1,4-dioxane impurity risk from manufacturing process. One of three PEG-derived ingredients present.", flag: "warn" },
      { name: "Sodium Chloride",            note: "Salt thickener; viscosity adjustment",                                                                    flag: "ok"   },
      { name: "PEG-7 Glyceryl Cocoate",    note: "Emollient/emulsifier; ethoxylated compound, additional 1,4-dioxane impurity concern. Second of three PEG-derived ingredients.", flag: "warn" },
      { name: "Panthenol",                  note: "Pro-Vitamin B5; post-cleanse hydration and barrier restoration",                                          flag: "ok"   },
      { name: "Tocopheryl Acetate",         note: "Vitamin E ester; antioxidant protection in formula",                                                      flag: "ok"   },
      { name: "Allantoin",                  note: "Skin-repair, mild keratolytic; supports soothing claim for sensitive skin",                               flag: "ok"   },
      { name: "Bisabolol",                  note: "German Chamomile-derived anti-inflammatory; reduces post-cleanse redness",                                flag: "ok"   },
      { name: "Glycol Distearate",          note: "Opacifier; provides pearlescent aesthetic, no functional skin benefit",                                   flag: "ok"   },
      { name: "Phenoxyethanol",             note: "Primary preservative; EU/India 1% maximum, standard for leave-on and rinse-off",                          flag: "ok"   },
      { name: "Sodium Benzoate",            note: "Co-preservative; generally well-tolerated at cosmetic use levels",                                         flag: "ok"   },
      { name: "Potassium Sorbate",          note: "Natural-origin preservative (sorbic acid salt); low sensitisation risk",                                  flag: "ok"   },
      { name: "Citric Acid",               note: "pH adjuster; maintains formula stability",                                                                 flag: "ok"   },
      { name: "Polyquaternium-39",          note: "Cationic conditioning polymer; improves post-rinse skin feel",                                            flag: "ok"   },
      { name: "Laureth-10",                note: "Ethoxylated fatty alcohol; third of three PEG-derived compounds. Additional 1,4-dioxane impurity concern.",  flag: "warn" },
      { name: "Cocamide MEA",              note: "Foam booster; potential nitrosamine formation with nitrosating agents in aqueous formulas. CIR advises manufacturers to verify no nitrosating agents present.", flag: "warn" },
      { name: "Disodium EDTA",             note: "Chelating agent; improves preservative efficacy and formula stability",                                    flag: "ok"   },
    ],
    pass_badges: ["Paraben-Free", "Fragrance-Free", "No Artificial Colour"],
    warn_badges: ["SLES Primary Surfactant", "Multiple PEG Compounds", "Nitrosamine Precursor (Cocamide MEA)"],
    info_badges: ["PETA Cruelty-Free", "Dermatologically Tested"],
    indiaContext: "India's hard water (high Ca2+/Mg2+ content) reacts with SLES to form insoluble soap films, reducing lather and leaving a dulling residue on skin. Users in Delhi, Bengaluru, and Mumbai with hard water may find rinsing incomplete. Bisabolol and Allantoin are well-suited to Fitzpatrick III-V skin types prone to post-inflammatory hyperpigmentation. The product is widely available at pharmacy chains (Apollo, Medplus) and modern trade - strong value for a fragrance-free option.",
    analyzedAt: "2026-05-20",
  },

  /* -------------------------------------------------
     2. Kind to Skin Micellar Cleansing Water
     Source: simpleskincare.in/products/micellar-cleansing-water
  ------------------------------------------------- */
  {
    productName: "Kind to Skin Micellar Cleansing Water",
    slug: "micellar-cleansing-water",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "Rs. 364 - Rs. 405",
    productType: "rinse-off",
    concern: "Makeup removal, gentle cleansing, no-rinse cleansing, sensitive skin",
    summary: "Simple's Micellar Water has an unusual formulation profile for the category. Hexylene Glycol appears at position 2 - the second most concentrated ingredient after water - which is exceptionally high for a facial micellar product. Hexylene Glycol is classified as a fragrance allergen under EU Cosmetics Regulation (requires disclosure on leave-on products >0.001%, on rinse-off products >0.01%), and it's typically used in much smaller concentrations as a penetration modifier. The product also contains dual quaternary ammonium compounds: Cetrimonium Chloride and Cetylpyridinium Chloride. In practical use, micellar waters are often applied and not rinsed, making leave-on allergen exposure the relevant risk framework. Niacinamide and Sodium Ascorbyl Phosphate appear at positions 12-13, well below 1% (both actives appear after phenoxyethanol) - meaningful active delivery is unlikely at these concentrations.",
    score: 61,
    scoreLabel: "Fair",
    image: "https://www.simpleskincare.in/cdn/shop/files/micellar_water_7f13c1cf-c0e2-481f-bce6-929cfd7de5f0_1000x1000.png?v=1721646731",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 27, max: 40,
        note: "Hexylene Glycol appears at position 2, immediately after water, indicating it is the second most concentrated ingredient in the formula. This is an unusually high level for a facial product. Hexylene Glycol is classified as a fragrance allergen under EU Cosmetics Regulation and requires disclosure on leave-on products above 0.001% and on rinse-off products above 0.01%. Critically, micellar waters are routinely applied and not rinsed in everyday use, which means this product should be considered a leave-on product in practice — and Hexylene Glycol at a high concentration in a leave-on context is a meaningful allergen concern for people with reactive or sensitive skin. Two quaternary ammonium compounds are also present: Cetrimonium Chloride (position 6) and Cetylpyridinium Chloride (position 10). Both can cause sensitisation with repeated daily use. Cetylpyridinium Chloride is an antimicrobial agent not typically found in micellar waters, and its presence alongside Cetrimonium Chloride adds to the cumulative sensitisation burden. PEG-6 Caprylic/Capric Glycerides carries a low risk of 1,4-dioxane manufacturing impurity. No parabens, no synthetic fragrance, no artificial colour.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 14, max: 25,
        note: "Glycerin and PEG-6 Caprylic/Capric Glycerides form the micellar system that lifts makeup and impurities — the core cleansing function works. Hexylene Glycol at position 2 is present at a concentration far higher than typical solvent use; it is acting more as a penetration modifier than a trace solvent, which raises questions about its role in a facial product intended for leave-on use. Niacinamide and Sodium Ascorbyl Phosphate are marketed as active skin benefits, but both appear after phenoxyethanol in the INCI list, which places them below 1% concentration. Below 1%, neither ingredient is likely to deliver the anti-PIH or antioxidant effects associated with meaningful doses of each. Panthenol provides post-cleanse conditioning. 'Triple Purified Water' is a brand marketing claim with no regulatory or ISO definition.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 13, max: 25,
        note: "'Triple Purified Water' is a brand differentiator with no independently defined technical meaning — it is not a regulated standard. The product is marketed 'with Vitamin B3 and Vitamin C', which is technically accurate, but both ingredients appear after phenoxyethanol in the INCI list, confirming concentrations below 1%. At these trace levels, meaningful active skin benefit is unlikely, and this is not communicated to consumers who may be purchasing specifically for those benefits. No fragrance or artificial colour — verified. PETA certified. 'Dermatologically tested' stated without a published citation.",
      },
      {
        name: "Ethics & Sustainability",
        score: 7, max: 10,
        note: "PETA cruelty-free certification is independently verified. Both quaternary ammonium compounds in this formula — Cetrimonium Chloride and Cetylpyridinium Chloride — are not readily biodegradable and are toxic to aquatic organisms at elevated concentrations, which is a concern for wastewater impact. No sustainability reporting specific to the India supply chain is publicly available.",
      },
    ],
    keyActives: [
      { name: "Glycerin",                    function: "Humectant; skin hydration during cleansing process" },
      { name: "PEG-6 Caprylic/Capric Glycerides", function: "Micellar surfactant; forms micelles to trap and lift oil-based makeup" },
      { name: "Niacinamide",                 function: "Vitamin B3; anti-inflammatory (trace concentration below 1% - limited active effect)" },
      { name: "Sodium Ascorbyl Phosphate",   function: "Stable Vitamin C derivative; antioxidant (trace concentration below 1% - limited effect)" },
      { name: "Panthenol",                   function: "Pro-Vitamin B5; post-cleanse barrier hydration" },
    ],
    ingredients: [
      { name: "Aqua",                         note: "Base; 'Triple Purified Water' per brand",                                                             flag: "ok"   },
      { name: "Hexylene Glycol",              note: "Co-solvent at position 2, indicating high concentration. EU-classified fragrance allergen requiring disclosure when >0.001% in leave-on products. Often used without rinsing in practice, elevating leave-on allergen concern for sensitized individuals.", flag: "warn" },
      { name: "Glycerin",                     note: "Humectant; skin-identical moisturising factor",                                                        flag: "ok"   },
      { name: "PEG-6 Caprylic/Capric Glycerides", note: "Non-ionic micellar surfactant; PEG-derived with potential 1,4-dioxane impurity (low level for short-chain PEGs)", flag: "info" },
      { name: "Phenoxyethanol",               note: "Primary preservative; within EU/India 1% limit",                                                       flag: "ok"   },
      { name: "Cetrimonium Chloride",         note: "Cationic quaternary ammonium compound; conditioning and mild antimicrobial. Sensitization risk in repeated daily leave-on use", flag: "info" },
      { name: "Tetrasodium EDTA",             note: "Chelating agent; enhances preservative efficacy",                                                      flag: "ok"   },
      { name: "Propylene Glycol",             note: "Co-solvent/humectant; at position 8, concentration lower than in products where it appears earlier",   flag: "ok"   },
      { name: "Citric Acid",                  note: "pH adjuster",                                                                                          flag: "ok"   },
      { name: "Cetylpyridinium Chloride",     note: "Quaternary ammonium antimicrobial; unusual in facial cleansing water. Adds to cumulative quat sensitization burden. Not commonly found in micellar waters", flag: "info" },
      { name: "Sodium Chloride",              note: "Ionic strength modifier",                                                                              flag: "ok"   },
      { name: "Niacinamide",                  note: "Position 12 (below 1%, after phenoxyethanol): anti-inflammatory Vitamin B3; trace concentration limits active efficacy.", flag: "warn" },
      { name: "Sodium Ascorbyl Phosphate",    note: "Position 13 (below 1%, after phenoxyethanol): stable Vitamin C derivative; trace concentration limits brightening efficacy. Both actives are sub-threshold for the claimed effects.", flag: "warn" },
      { name: "Potassium Chloride",           note: "Ionic strength modifier",                                                                              flag: "ok"   },
      { name: "Panthenol",                    note: "Pro-Vitamin B5; post-cleanse skin conditioning",                                                        flag: "ok"   },
    ],
    pass_badges: ["Paraben-Free", "Fragrance-Free", "No Artificial Colour"],
    warn_badges: ["Hexylene Glycol (High Concentration, Fragrance Allergen)", "Low Active Concentration (Niacinamide + Vitamin C Below 1%)"],
    info_badges: ["PETA Cruelty-Free", "Dual Quaternary Ammonium System"],
    indiaContext: "Micellar waters are popular in Indian markets for quick makeup removal in humid conditions where double-cleansing is less practical. The leave-on application method (wiping without rinsing) elevates the significance of Hexylene Glycol's allergen risk for Indian users with barrier-compromised or sensitized skin - common in polluted urban environments (Delhi, Mumbai). Niacinamide at trace levels adds no meaningful anti-PIH benefit relevant to Fitzpatrick III-V skin types.",
    analyzedAt: "2026-05-20",
  },

  /* -------------------------------------------------
     3. Kind to Skin Hydrating Light Moisturiser
     Source: simpleskincare.in/products/kind-to-skin-hydrating-light-moisturiser
     Note: Partial INCI - complete list not publicly indexed
  ------------------------------------------------- */
  {
    productName: "Kind to Skin Hydrating Light Moisturiser",
    slug: "hydrating-light-moisturiser",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "Rs. 424 - Rs. 499",
    productType: "leave-on",
    concern: "Daily moisturising, lightweight hydration, sensitive skin, normal to combination skin",
    summary: "Simple's Hydrating Light Moisturiser has a clean, no-fragrance core built around Glycerin as the primary humectant and Paraffinum Liquidum (mineral oil / liquid paraffin) as the primary occlusive. Mineral oil is one of the most tested and non-allergenic occlusives in cosmetics, but it is petroleum-derived and can be problematic for acne-prone or oily skin types by trapping sebum. Dimethicone provides silky texture without pore occlusion. Bisabolol, Tocopheryl Acetate, and Panthenol all appear after Phenoxyethanol (position 9), meaning all three soothing actives are below 1% - the formula's therapeutic depth is limited. Lactic Acid at a trace position provides negligible AHA efficacy. No artificial fragrance or colour is a genuine formulation commitment.",
    score: 73,
    scoreLabel: "Good",
    image: "https://www.simpleskincare.in/cdn/shop/files/Module00_1000x1000.jpg?v=1769511700",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 34, max: 40,
        note: "This is a very clean safety profile for a leave-on moisturiser. Paraffinum Liquidum (mineral oil) is used at cosmetic grade, which is highly purified, non-irritating, and non-allergenic. It is extensively tested and considered safe by all major regulatory bodies. Dimethicone is an inert silicone with very low sensitisation potential and is non-comedogenic. Phenoxyethanol is the sole identified preservative and is within EU and India regulatory limits. No parabens, no fragrance, no artificial colour. Potassium Hydroxide is used at trace amounts as a pH adjuster for formula stability and poses no safety concern at these levels. Note: the complete INCI for this product has not been fully confirmed from available public sources, so this analysis is based on the partial ingredient list available.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 18, max: 25,
        note: "Paraffinum Liquidum (mineral oil) is the third ingredient, making it the dominant occlusive in this formula. Mineral oil creates an effective moisture-sealing barrier but is non-breathable, which means it can trap sebum and heat beneath the skin surface — a concern for oily, acne-prone, or combination skin types. It is better suited to dry skin. Glycerin as the primary humectant is strongly evidence-based for long-term barrier improvement. Polyglyceryl-3 Methylglucose Distearate is a naturally derived, non-PEG emulsifier — a clean choice. Dimethicone provides a silky skin feel without the occlusion of mineral oil. The soothing actives — Panthenol, Tocopheryl Acetate, and Bisabolol — and Lactic Acid all appear below phenoxyethanol in the INCI, placing them below 1% concentration; their therapeutic contribution at these levels is limited. The '12-hour hydration' claim is likely supported by the occlusive-humectant combination but is not backed by a published clinical trial for this specific formula.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 15, max: 25,
        note: "No fragrance and no artificial colour — verified from the INCI. Paraben-free verified. PETA cruelty-free. 'Dermatologically tested' is stated without a published citation. The '12-hour hydration' claim is unsubstantiated by any published clinical study. Note: the complete INCI list has not been fully confirmed from available public sources, so this analysis is based on a partial ingredient list — consumers should check the product packaging directly for the full declaration.",
      },
      {
        name: "Ethics & Sustainability",
        score: 6, max: 10,
        note: "PETA cruelty-free certification is independently verified. Paraffinum Liquidum is a petroleum-derived ingredient used as the dominant occlusive in a leave-on product — its petrochemical origin is worth noting for consumers who prioritise renewable ingredients. Dimethicone is a synthetic silicone that is not biodegradable. Polyglyceryl-3 Methylglucose Distearate, derived from renewable glycerol sources, is a positive choice. No sustainability reporting specific to the India supply chain is publicly available.",
      },
    ],
    keyActives: [
      { name: "Glycerin",            function: "Humectant; draws water to skin surface, long-term barrier improvement with repeated use" },
      { name: "Paraffinum Liquidum", function: "Primary occlusive (mineral oil); seals in moisture, non-allergenic but petroleum-derived and not ideal for acne-prone skin" },
      { name: "Dimethicone",         function: "Silicone emollient; smooth skin feel, non-comedogenic film-forming" },
      { name: "Panthenol",           function: "Pro-Vitamin B5; barrier restoration (below 1% concentration)" },
      { name: "Bisabolol",           function: "Anti-inflammatory; soothes sensitized skin (below 1% concentration)" },
    ],
    ingredients: [
      { name: "Aqua",                          note: "Solvent base",                                                                                           flag: "ok"   },
      { name: "Glycerin",                      note: "Humectant; evidence-based for barrier hydration and long-term skin improvement",                          flag: "ok"   },
      { name: "Paraffinum Liquidum",           note: "Mineral oil / liquid paraffin. Petroleum-derived occlusive; highly purified cosmetic grade is non-irritating. Can trap sebum under the skin surface in oily/acne-prone types", flag: "info" },
      { name: "Polyglyceryl-3 Methylglucose Distearate", note: "Natural-derived emulsifier (non-PEG); clean emulsifier from renewable glycerol and glucose", flag: "ok"   },
      { name: "Dimethicone",                   note: "Silicone emollient; non-comedogenic, non-irritating, provides silky skin feel",                           flag: "ok"   },
      { name: "Cetyl Palmitate",               note: "Fatty acid ester emollient; non-comedogenic, skin-compatible",                                            flag: "ok"   },
      { name: "Cetyl Alcohol",                 note: "Fatty alcohol emulsifier/thickener; non-irritating, non-comedogenic at standard levels",                  flag: "ok"   },
      { name: "Panthenol",                     note: "Position 8 (below 1%): Pro-Vitamin B5; barrier hydration. Concentration below typical therapeutic threshold", flag: "ok"   },
      { name: "Phenoxyethanol",                note: "Preservative; within EU/India 1% limit",                                                                  flag: "ok"   },
      { name: "Caprylyl Glycol",               note: "Co-preservative and humectant; enhances phenoxyethanol efficacy",                                         flag: "ok"   },
      { name: "Carbomer",                      note: "Synthetic polymer thickener/emulsion stabiliser; low sensitisation risk",                                  flag: "ok"   },
      { name: "Potassium Hydroxide",           note: "Alkali pH adjuster for Carbomer neutralisation; trace quantity, no safety concern",                        flag: "ok"   },
      { name: "Tocopheryl Acetate",            note: "Vitamin E ester; antioxidant (below 1% position)",                                                        flag: "ok"   },
      { name: "Bisabolol",                     note: "Anti-inflammatory; reduces post-application sensitivity (below 1% position)",                              flag: "ok"   },
      { name: "Lactic Acid",                   note: "AHA at trace concentration (last position before finish). No meaningful exfoliant effect at this level; functions as pH buffer", flag: "ok"   },
    ],
    pass_badges: ["Paraben-Free", "Fragrance-Free", "No Artificial Colour", "Non-Comedogenic"],
    warn_badges: [],
    info_badges: ["PETA Cruelty-Free", "Dermatologically Tested", "Partial INCI Confirmed"],
    indiaContext: "Mineral oil is a widely used ingredient in Indian skincare due to its low cost and high stability in humid conditions. For Indian climate conditions (high humidity in Mumbai, Chennai, and Bengaluru), the occlusive nature of Paraffinum Liquidum at position 3 may feel heavy and contribute to miliaria (heat rash) in summer months. Fitzpatrick III-V skin types with oily or combination skin are best served by the Refreshing Facial Wash + a lighter water-based moisturiser. The Hydrating Light Moisturiser is better suited to dry skin types and air-conditioned environments.",
    analyzedAt: "2026-05-20",
  },

  /* -------------------------------------------------
     4. Kind to Skin Replenishing Rich Moisturiser
     Source: simpleskincare.in/products/kind-to-skin-replenishing-rich-moisturiser
  ------------------------------------------------- */
  {
    productName: "Kind to Skin Replenishing Rich Moisturiser",
    slug: "replenishing-rich-moisturiser",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "Rs. 350 - Rs. 475",
    productType: "leave-on",
    concern: "Intensive moisturising, dry and dehydrated skin, overnight hydration, barrier repair",
    summary: "Simple's Rich Moisturiser contains two UV filters - Ethylhexyl Methoxycinnamate (Octinoxate) at position 5 and Butyl Methoxydibenzoylmethane (Avobenzone) at position 8 - in a product not marketed for sun protection. Octinoxate is under active EU and FDA endocrine disruptor review; its presence as a daily leave-on ingredient is a concern. Avobenzone without a photostabiliser (no Octocrylene present in this formula) degrades rapidly on UV exposure into potentially irritating breakdown products. On the positive side: Coco-Caprylate/Caprate is a superior leave-on emollient vs mineral oil; Niacinamide at position 6 should deliver meaningful anti-inflammatory benefit; and the NMF complex (Urea, Lactic Acid, Sodium Lactate, Serine, Sorbitol) mirrors skin's own moisturising factors. Polyacrylamide contains residual acrylamide monomer, a carcinogen limited to 0.1 ppm in EU cosmetics.",
    score: 59,
    scoreLabel: "Fair",
    image: "https://www.simpleskincare.in/cdn/shop/files/00_1000x1000.jpg?v=1769514200",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 23, max: 40,
        note: "Ethylhexyl Methoxycinnamate (Octinoxate) is present at position 5 in a daily leave-on moisturiser — not a sunscreen, but a product applied every day without rinsing. The EU SCCS published a preliminary opinion in 2021 raising concern about Octinoxate's potential for endocrine disruption; the FDA is independently reassessing it as well. It has not been banned, but regulatory direction is toward stricter limits, and daily chronic exposure in a leave-on format is the scenario regulators are most concerned about. Butyl Methoxydibenzoylmethane (Avobenzone) is present at position 8 without a photostabiliser — no Octocrylene is present in this formula. Without photostabilisation, Avobenzone degrades on UV exposure and releases benzophenone-type breakdown products into the skin. Polyacrylamide is used as a thickener; the EU limits residual acrylamide monomer (a carcinogen) to 0.1 ppm in leave-on products, and reputable manufacturers stay within this. BHT shows weak endocrine signals in very high-dose animal studies, but these are not relevant at cosmetic concentrations. No parabens, no fragrance.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 16, max: 25,
        note: "Coco-Caprylate/Caprate at position 3 is a dry-touch, non-comedogenic ester emollient derived from coconut — a better choice for leave-on use than mineral oil. Polyglyceryl-3 Methylglucose Distearate is a naturally derived, non-PEG emulsifier. Niacinamide at position 6 is likely present at a concentration that delivers meaningful anti-inflammatory and anti-PIH benefit. The NMF (Natural Moisturising Factor) complex — Urea, Lactic Acid, Sodium Lactate, Serine, and Sorbitol — mirrors the skin's own moisturising factors; these are scientifically well-evidenced humectants for deep, sustained hydration. The key formulation problem is Avobenzone without a photostabiliser: in UV light this product is used in, Avobenzone degrades and its breakdown products absorb into the skin. Allantoin and Panthenol contribute repair and soothing support.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 13, max: 25,
        note: "This is a moisturiser, not an SPF product, yet it contains two UV filters — Octinoxate and Avobenzone. This is not communicated to consumers anywhere on the product. For shoppers who are actively avoiding Octinoxate because of its endocrine disruptor status, this is an undisclosed exposure that could affect their purchasing decision. The '24-hour hydration' claim is unsubstantiated by any published clinical study for this specific formula. No artificial fragrance, no artificial colour — verified from INCI. PETA certified. 'Dermatologically tested' stated without a published citation.",
      },
      {
        name: "Ethics & Sustainability",
        score: 7, max: 10,
        note: "PETA cruelty-free certification is independently verified. Octinoxate and Avobenzone are both recognised aquatic pollutants — their presence in a daily rinse-off moisturiser (during face washing and hand-washing) adds a UV filter load to wastewater. Coco-Caprylate/Caprate is derived from renewable coconut sources, which is a positive. No parabens.",
      },
    ],
    keyActives: [
      { name: "Niacinamide",              function: "Anti-inflammatory, anti-PIH; position 6 suggests meaningful concentration for sensitive skin benefit" },
      { name: "Coco-Caprylate/Caprate",  function: "Dry-touch ester emollient; non-comedogenic, skin-identical feel" },
      { name: "Urea",                     function: "NMF component; humectant and mild keratolytic for dry/thickened skin" },
      { name: "Lactic Acid + Sodium Lactate", function: "AHA humectant pair; NMF components for skin-native moisture retention" },
      { name: "Allantoin",                function: "Skin-repair keratolytic; supports barrier recovery" },
    ],
    ingredients: [
      { name: "Aqua",                          note: "Solvent base",                                                                                              flag: "ok"   },
      { name: "Glycerin",                      note: "Humectant",                                                                                                  flag: "ok"   },
      { name: "Coco-Caprylate/Caprate",        note: "Dry-touch ester emollient; renewable coconut-derived, non-comedogenic",                                      flag: "ok"   },
      { name: "Polyglyceryl-3 Methylglucose Distearate", note: "Natural-derived non-PEG emulsifier",                                                              flag: "ok"   },
      { name: "Ethylhexyl Methoxycinnamate",   note: "Octinoxate: UVB filter at position 5 in a leave-on non-SPF moisturiser. Under active SCCS/FDA endocrine disruptor review (2021-2024). Not yet banned but regulatory direction is toward stricter limits. Daily chronic leave-on exposure is a relevant concern.", flag: "warn" },
      { name: "Niacinamide",                   note: "Position 6 - meaningful concentration likely. Anti-inflammatory, anti-PIH, barrier support",                 flag: "ok"   },
      { name: "Stearyl Alcohol",               note: "Fatty alcohol thickener/emulsifier; non-sensitising, non-comedogenic",                                       flag: "ok"   },
      { name: "Butyl Methoxydibenzoylmethane", note: "Avobenzone: UVA filter at position 8 without a photostabiliser (no Octocrylene present in this formula). Photodegrades on UV exposure, forming benzophenone-type breakdown products.", flag: "warn" },
      { name: "Polyacrylamide",                note: "Synthetic polymer thickener; EU limits residual acrylamide monomer (carcinogen) to 0.1 ppm in leave-on. Compliant manufacturers stay well within this", flag: "info" },
      { name: "Phenoxyethanol",                note: "Preservative; within EU/India 1% limit",                                                                     flag: "ok"   },
      { name: "Stearic Acid",                  note: "Fatty acid emollient/thickener; skin-identical",                                                             flag: "ok"   },
      { name: "Panthenol",                     note: "Below 1%: Pro-Vitamin B5; barrier restoration",                                                              flag: "ok"   },
      { name: "Caprylyl Glycol",               note: "Co-preservative; enhances phenoxyethanol efficacy",                                                          flag: "ok"   },
      { name: "C13-14 Isoparaffin",            note: "Synthetic hydrocarbon emollient; petroleum-derived, non-comedogenic",                                        flag: "ok"   },
      { name: "Laureth-7",                     note: "Ethoxylated emulsifier; potential 1,4-dioxane manufacturing impurity (low level for short-chain ethoxylate)", flag: "info" },
      { name: "Disodium EDTA",                 note: "Chelating agent; formula stability",                                                                          flag: "ok"   },
      { name: "Sodium Hydroxide",              note: "pH adjuster (trace)",                                                                                         flag: "ok"   },
      { name: "Tocopheryl Acetate",            note: "Vitamin E ester; antioxidant",                                                                               flag: "ok"   },
      { name: "BHT",                           note: "Butylated Hydroxytoluene: antioxidant preservative. Weak ED signal in animal studies at very high doses not replicated at cosmetic concentrations. EU permitted", flag: "info" },
      { name: "Bisabolol",                     note: "Anti-inflammatory; skin soothing",                                                                           flag: "ok"   },
      { name: "Urea",                          note: "NMF component and humectant; mild keratolytic at higher doses, pure humectant at trace levels",               flag: "ok"   },
      { name: "Lactic Acid",                   note: "AHA NMF component; skin-native moisture retention",                                                          flag: "ok"   },
      { name: "Sodium Lactate",               note: "NMF component; sodium salt of lactic acid, humectant",                                                        flag: "ok"   },
      { name: "Serine",                        note: "Amino acid NMF component; skin-native moisturising factor",                                                   flag: "ok"   },
      { name: "Sorbitol",                      note: "Polyol NMF humectant; sugar alcohol, renewable",                                                              flag: "ok"   },
      { name: "Allantoin",                     note: "Skin-repair active; barrier recovery and mild keratolytic",                                                   flag: "ok"   },
    ],
    pass_badges: ["Paraben-Free", "Fragrance-Free", "No Artificial Colour", "NMF Complex"],
    warn_badges: ["Octinoxate (Under ED Review)", "Unstabilised Avobenzone"],
    info_badges: ["PETA Cruelty-Free", "Niacinamide Included"],
    indiaContext: "Octinoxate's ED status is of particular concern for Indian users who apply this product daily year-round (vs. seasonal use in colder climates). For Indian skin (Fitzpatrick III-V), Niacinamide at a meaningful position is a genuine benefit - anti-PIH action is particularly relevant. The NMF complex (Urea, Lactic Acid, Serine, Sorbitol) is excellent for dry, dehydrated skin in air-conditioned environments common in Indian offices and malls. For India's outdoor UV conditions, this product does not provide adequate UV protection despite containing UV filters.",
    analyzedAt: "2026-05-20",
  },

  /* -------------------------------------------------
     5. Kind to Skin Protecting Light Moisturiser SPF 15
     Source: simpleskincare.in/products/kind-to-skin-protecting-light-moisturiser-spf-15
  ------------------------------------------------- */
  {
    productName: "Kind to Skin Protecting Light Moisturiser SPF 15",
    slug: "protecting-light-moisturiser-spf-15",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "Rs. 266 - Rs. 499",
    productType: "sunscreen",
    concern: "Daily UV protection, moisturising, sensitive skin, urban daily use",
    summary: "Simple's SPF moisturiser uses a 4-filter UV system: Octisalate (position 2), Avobenzone (position 5), Ensulizole (position 6), and Octocrylene (position 8). Crucially, Octocrylene IS present to photostabilise Avobenzone, resolving the photodegradation concern seen in the Rich Moisturiser. The formula avoids Oxybenzone and Octinoxate. Octocrylene received a SCCS opinion in 2021 noting concern for cumulative exposure (especially in children) and potential benzophenone accumulation; adult use at EU-permitted concentrations is considered acceptable but a mandatory safety deduction applies. No SPF test report is published by the brand, triggering a transparency deduction. SPF 15 blocks approximately 93% of UVB radiation - adequate for indoor or urban commute exposure but insufficient for Indian outdoor UV conditions (UV Index 8-11+) where SPF 30+ is the clinical minimum recommendation.",
    score: 64,
    scoreLabel: "Fair",
    image: "https://www.simpleskincare.in/cdn/shop/files/Module01_75f5ebcc-ee09-4c47-906e-48b612f8472d_1000x1000.jpg?v=1769513932",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 27, max: 40,
        note: "Ethylhexyl Salicylate (Octisalate) at position 2: UVB filter, mild endocrine activity noted in some studies but at a lower concern level than Oxybenzone or Octinoxate; EU/India permitted. Butyl Methoxydibenzoylmethane (Avobenzone) at position 5 with Octocrylene at position 8: photostabilised, resolving the photodegradation concern present in the Rich Moisturiser. Octocrylene: SCCS 2021 opinion flags concern for cumulative benzophenone metabolite exposure; adult use at EU-permitted concentrations is considered acceptable. No Oxybenzone (ECHA Category 1 ED), no Octinoxate (under ED review) - avoids the most concerning UV filters. Phenylbenzimidazole Sulfonic Acid (Ensulizole): excellent safety profile. No parabens, no fragrance.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 19, max: 25,
        note: "SPF 15 is below WHO and Indian dermatology guidance for photoprotection in high-UV environments (minimum SPF 30 recommended). The Avobenzone + Octocrylene photostabilisation is a correct formulation approach. Ensulizole covers UVB with good water solubility. Glycerin as primary humectant. Dimethicone for skin feel. All botanical soothing actives (Allantoin, Bisabolol, Panthenol) appear after phenoxyethanol (below 1%). Carbomer + Xanthan Gum provide elegant emulsion texture. No PA rating stated.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 11, max: 25,
        note: "'Broad spectrum' claim is supportable: Avobenzone covers UVA1/UVA2, Octisalate + Ensulizole cover UVB, Octocrylene covers UVB/UVA2. No PA+++ or UVA protection factor (PF) rating stated. No SPF test report is published by the brand. No artificial fragrance or colour verified. PETA certified. 'Dermatologically tested' stated without published citation.",
      },
      {
        name: "Ethics & Sustainability",
        score: 7, max: 10,
        note: "PETA cruelty-free. Octocrylene has documented aquatic toxicity concerns at high concentrations - reef safe designation is uncertain. No Oxybenzone or Octinoxate, which are among the worst reef-damaging UV filters, is a positive. No sustainability data for India.",
      },
    ],
    keyActives: [
      { name: "Ethylhexyl Salicylate (Octisalate)", function: "UVB filter; water-soluble with reasonable safety profile" },
      { name: "Butyl Methoxydibenzoylmethane",       function: "Avobenzone: UVA filter; photostabilised by Octocrylene" },
      { name: "Phenylbenzimidazole Sulfonic Acid",   function: "Ensulizole: UVB filter with excellent safety and water solubility" },
      { name: "Octocrylene",                         function: "UVB/UVA2 filter; photostabilises Avobenzone" },
      { name: "Glycerin",                             function: "Humectant; moisturising" },
    ],
    ingredients: [
      { name: "Aqua",                          note: "Solvent base",                                                                                              flag: "ok"   },
      { name: "Ethylhexyl Salicylate",         note: "Octisalate: UVB filter at position 2, indicating meaningful concentration. Mild ED concern in some studies but significantly lower risk profile than Oxybenzone or Octinoxate; EU/India permitted", flag: "info" },
      { name: "Glycerin",                      note: "Humectant",                                                                                                  flag: "ok"   },
      { name: "Stearic Acid",                  note: "Fatty acid emollient/emulsifier",                                                                            flag: "ok"   },
      { name: "Butyl Methoxydibenzoylmethane", note: "Avobenzone: UVA1/UVA2 filter. Photostabilised here by Octocrylene (position 8) - resolves photodegradation concern present in the Rich Moisturiser",         flag: "ok"   },
      { name: "Phenylbenzimidazole Sulfonic Acid", note: "Ensulizole: water-soluble UVB filter; excellent safety and photostability profile",                     flag: "ok"   },
      { name: "Glycol Stearate",               note: "Opacifier/emulsifier; non-irritating",                                                                       flag: "ok"   },
      { name: "Octocrylene",                   note: "UVB/UVA2 filter; photostabilises Avobenzone. SCCS 2021 notes concern for cumulative benzophenone metabolite exposure; adult use at EU-permitted concentrations is considered acceptable.", flag: "warn" },
      { name: "PEG-100 Stearate",              note: "Emulsifier; PEG-derived with potential 1,4-dioxane manufacturing impurity (low level for PEG-100)",           flag: "info" },
      { name: "Dimethicone",                   note: "Silicone emollient; skin feel, non-comedogenic",                                                              flag: "ok"   },
      { name: "Allantoin",                     note: "Below 1%: skin-repair, anti-inflammatory",                                                                   flag: "ok"   },
      { name: "BHT",                           note: "Antioxidant preservative; mild ED concern in high-dose animal studies at non-cosmetic concentrations",        flag: "info" },
      { name: "Bisabolol",                     note: "Below 1%: anti-inflammatory",                                                                               flag: "ok"   },
      { name: "Caprylyl Glycol",               note: "Co-preservative",                                                                                            flag: "ok"   },
      { name: "Carbomer",                      note: "Synthetic thickener/emulsion stabiliser",                                                                     flag: "ok"   },
      { name: "Cetyl Alcohol",                 note: "Fatty alcohol emulsifier",                                                                                    flag: "ok"   },
      { name: "Disodium EDTA",                 note: "Chelating agent",                                                                                             flag: "ok"   },
      { name: "Glyceryl Stearate",             note: "Emulsifier; non-irritating, non-comedogenic",                                                                flag: "ok"   },
      { name: "Panthenol",                     note: "Below 1%: Pro-Vitamin B5 barrier support",                                                                   flag: "ok"   },
      { name: "Xanthan Gum",                   note: "Natural polysaccharide thickener; non-irritating",                                                           flag: "ok"   },
    ],
    pass_badges: ["Paraben-Free", "Fragrance-Free", "No Oxybenzone", "No Octinoxate", "Avobenzone Photostabilised"],
    warn_badges: ["SPF 15 Insufficient for Indian UV Conditions", "Octocrylene (Benzophenone Concern)", "No Published SPF Test Report"],
    info_badges: ["PETA Cruelty-Free", "Broad Spectrum UVA+UVB"],
    indiaContext: "SPF 15 is wholly inadequate for India's outdoor UV environment. India's UV Index routinely reaches 8-11 (very high to extreme) from March to October across most of the country, and dermatology guidelines recommend a minimum of SPF 30 with PA+++ for daily Indian outdoor use. This product is suitable only for largely indoor days or as a base under SPF 30+ sunscreen. Indian users who rely on this for daily outdoor protection are significantly under-protected. Broad-spectrum coverage (UVA + UVB) is technically correct but the low SPF negates the benefit.",
    analyzedAt: "2026-05-20",
  },

  /* -------------------------------------------------
     6. Kind to Skin Refreshing Facial Wash
     Source: simpleskincare.in/products/refreshing-facial-wash
  ------------------------------------------------- */
  {
    productName: "Kind to Skin Refreshing Facial Wash",
    slug: "refreshing-facial-wash",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "Rs. 378 - Rs. 420",
    productType: "rinse-off",
    concern: "Gentle daily cleansing, oily and combination skin, minimal-ingredient cleansing",
    summary: "Simple's Refreshing Facial Wash is the cleaner of their two facial washes - no SLES, no PEG compounds. Cocamidopropyl Betaine as the sole surfactant is a mild amphoteric with low sensitisation potential, making this genuinely appropriate for sensitive skin. Iodopropynyl Butylcarbamate (IPBC) appears at position 8 as a co-preservative. IPBC is an EU-restricted biocide permitted in rinse-off products at a maximum 0.02%, and the SCCS has flagged it as a potential sensitizer, particularly in products with prolonged contact. At 0.02% in a rinse-off wash with brief skin contact, regulatory risk is low and only a minor safety note deduction applies. With only 12 ingredients, this is one of the most transparent and minimal formulas in the Simple range.",
    score: 73,
    scoreLabel: "Good",
    image: "https://www.simpleskincare.in/cdn/shop/files/27278-H_8909106061781_1080x1440.jpg?v=1769510079",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 32, max: 40,
        note: "No SLES, no SLS, no PEG compounds - the safest surfactant profile in the Simple cleanser range. Cocamidopropyl Betaine: mild amphoteric surfactant; rare sensitisation is typically attributable to manufacturing impurities (DMDM Hydantoin, amidoamine) that reputable producers control. Iodopropynyl Butylcarbamate (IPBC) at position 8: EU maximum 0.02% in rinse-off cosmetics; SCCS has flagged sensitization potential in leave-on use. At permitted concentrations in a rinse-off wash, regulatory risk is low. Propylene Glycol at position 3: brief contact time reduces penetration concern. No parabens, no fragrance, no artificial colour.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 18, max: 25,
        note: "Single amphoteric surfactant makes this a very gentle but limited cleanser - may not fully remove heavy makeup or oil-based SPF without double cleansing. Hydroxypropyl Methylcellulose provides gel texture with no functional skin benefit. Panthenol, Tocopheryl Acetate, and Glycerin provide post-cleanse conditioning and hydration. The 12-ingredient INCI demonstrates genuine formulation restraint. For everyday use on non-makeup days, this is an ideal cleanser. Citric Acid maintains acidic pH compatible with skin's natural 4.5-5.5 pH range.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 16, max: 25,
        note: "Extremely transparent INCI - 12 ingredients, all identifiable, no trade name ingredients. No fragrance, no colour - verified. Paraben-free verified. PETA certified. 'Soap-free' verifiable (no sodium salts of fatty acids). IPBC is disclosed in the INCI. 'Dermatologically tested' stated without published citation.",
      },
      {
        name: "Ethics & Sustainability",
        score: 7, max: 10,
        note: "PETA cruelty-free. Short ingredient list means simpler supply chain and lower chemical processing. Propylene Glycol is petroleum-derived. IPBC as a biocide has some environmental toxicity to aquatic organisms at higher concentrations.",
      },
    ],
    keyActives: [
      { name: "Cocamidopropyl Betaine", function: "Primary (sole) surfactant; amphoteric, very gentle, low sensitisation potential" },
      { name: "Glycerin",              function: "Humectant; post-cleanse skin feel" },
      { name: "Panthenol",             function: "Pro-Vitamin B5; post-cleanse barrier hydration" },
      { name: "Tocopheryl Acetate",    function: "Vitamin E; antioxidant" },
    ],
    ingredients: [
      { name: "Aqua",                          note: "Solvent base",                                                                                              flag: "ok"   },
      { name: "Cocamidopropyl Betaine",        note: "Sole surfactant; amphoteric, mild, appropriate for sensitive skin. Trace sensitisation risk from DMDM and amidoamine manufacturing impurities in lower-quality grades", flag: "ok"   },
      { name: "Propylene Glycol",              note: "Co-solvent/humectant; position 3 in a rinse-off cleanser is less concerning than leave-on use",            flag: "info" },
      { name: "Hydroxypropyl Methylcellulose", note: "Cellulose-derived thickener; provides gel texture, no therapeutic benefit",                                flag: "ok"   },
      { name: "Panthenol",                     note: "Pro-Vitamin B5; post-rinse skin conditioning",                                                             flag: "ok"   },
      { name: "Disodium EDTA",                 note: "Chelating agent; improves formula stability and hard water performance",                                   flag: "ok"   },
      { name: "Glycerin",                      note: "Humectant; post-rinse skin feel",                                                                          flag: "ok"   },
      { name: "Iodopropynyl Butylcarbamate",   note: "IPBC: EU-restricted biocide, maximum 0.02% in rinse-off. SCCS notes sensitization potential in prolonged contact; at permitted concentrations in a rinse-off wash, regulatory risk is low.", flag: "info" },
      { name: "Phenoxyethanol",                note: "Primary preservative; within EU/India 1% limit",                                                           flag: "ok"   },
      { name: "Sodium Hydroxide",              note: "pH adjuster (trace)",                                                                                       flag: "ok"   },
      { name: "Tocopheryl Acetate",            note: "Vitamin E ester; antioxidant",                                                                             flag: "ok"   },
      { name: "Citric Acid",                   note: "pH adjuster; maintains mildly acidic pH compatible with skin microbiome",                                   flag: "ok"   },
    ],
    pass_badges: ["Paraben-Free", "Fragrance-Free", "No Artificial Colour", "SLS-Free", "SLES-Free", "INCI Verified"],
    warn_badges: [],
    info_badges: ["PETA Cruelty-Free", "12-Ingredient Formula", "Dermatologically Tested", "IPBC (Rinse-Off, Minor Sensitizer Note)"],
    indiaContext: "The SLES-free, minimal-ingredient formula is well-suited to Indian consumers with sensitive, reactive, or eczema-prone skin - a significant demographic across all Fitzpatrick types. Hard water performance: Cocamidopropyl Betaine is an amphoteric, not an anionic sulfate, so it does not form soap scum with calcium ions the way SLES does - an advantage in India's hard water cities. The single-surfactant formula may require double-cleansing to remove oil-based sunscreens common in the Indian market (SPF 30-50 formulations).",
    analyzedAt: "2026-05-20",
  },

  /* -------------------------------------------------
     7. 10% Niacinamide Booster Serum
     Source: simpleskincare.in/products/10-niacinamide-booster-serum
  ------------------------------------------------- */
  {
    productName: "10% Niacinamide Booster Serum",
    slug: "10-percent-niacinamide-booster-serum",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "Rs. 359 - Rs. 548",
    productType: "treatment",
    concern: "Pore refinement, sebum control, uneven skin tone, anti-PIH, brightening, sensitive skin",
    summary: "This is the standout product in the Simple range from a formulation quality perspective. Niacinamide is stated at 10% - the clinical threshold for meaningful anti-inflammatory, anti-PIH, pore-minimising, and sebum-normalisation effects. The serum base uses Propanediol (often bio-derived from corn fermentation) rather than Propylene Glycol, and Polyglyceryl-6 Distearate + Polyglyceryl-10 Stearate as non-PEG emulsifiers - a notably clean emulsifier system for a mass-market product. Helianthus Annuus (Sunflower) Seed Oil provides linoleic acid for barrier support. Sclerotium Gum from renewable fungal fermentation thickens without synthetic polymers. The '95% naturally derived' claim is credible from this INCI composition. This is one of the most transparent, clean-formulation Niacinamide serums available in India at this price point.",
    score: 85,
    scoreLabel: "Excellent",
    image: "https://www.simpleskincare.in/cdn/shop/files/niacinamide_serum_1000x1000.jpg?v=1721647404",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 37, max: 40,
        note: "Exceptionally clean safety profile. Niacinamide at 10%: well-established safety even in sensitive skin; rare niacin flush (transient redness) in a small percentage of users. Propanediol: safer and often bio-derived vs propylene glycol; very low sensitisation potential. Polyglyceryl emulsifiers: natural-derived, non-PEG, excellent safety profile. Helianthus Annuus Seed Oil: low sensitisation potential (lower allergenicity than many other plant oils). Phenoxyethanol within EU/India 1% limit. Tocopherol (natural Vitamin E, not acetate ester): directly antioxidant-active. No parabens, no fragrance, no artificial colour, no PEG compounds. Niacinamide is at position 2 (stated 10%), confirming it is above phenoxyethanol and at a meaningful concentration.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 23, max: 25,
        note: "Niacinamide at 10% (stated by brand) delivers clinically proven reduction in sebum production, trans-epidermal water loss, pore appearance, PIH melanin transfer inhibition, and anti-inflammatory action on acne lesions. Propanediol is a superior glycol choice - better skin-feel and often from renewable sources. Caprylic/Capric Triglyceride is a premium emollient derived from coconut. Helianthus Annuus Seed Oil provides linoleic acid (ceramide precursor) for barrier repair. Sclerotium Gum provides elegant hydrogel texture from natural fermentation. Tapioca Starch provides matte finish relevant for oily skin. Pantolactone + Panthenol combination: synergistic pair for barrier bioavailability.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 17, max: 25,
        note: "10% Niacinamide concentration is explicitly stated - exemplary transparency rare in mass-market products. '95% naturally derived' claim is credible and supportable from INCI composition. PETA certified. 'Dermatologically tested' stated without published citation. No 'clinical study' references are published by the brand despite the 10% concentration claim.",
      },
      {
        name: "Ethics & Sustainability",
        score: 8, max: 10,
        note: "PETA cruelty-free. 95% naturally derived is credible (Propanediol often bio-fermented, Sclerotium Gum from fungal fermentation, Polyglyceryl emulsifiers from glycerol + fatty acids, Sunflower Oil renewable). No PEG compounds - no ethoxylation chemistry and associated waste. Tocopherol from plant sources. Lowest synthetic/petrochemical footprint in the Simple range. No parabens.",
      },
    ],
    keyActives: [
      { name: "Niacinamide 10%",             function: "At clinical threshold: reduces sebum, PIH, pore appearance, TEWL; anti-inflammatory on acne lesions" },
      { name: "Propanediol",                 function: "Bio-derived glycol solvent; enhances niacinamide penetration, superior to propylene glycol" },
      { name: "Caprylic/Capric Triglyceride", function: "Premium coconut-derived emollient; non-comedogenic skin feel" },
      { name: "Helianthus Annuus Seed Oil",  function: "Sunflower Seed Oil; linoleic acid for barrier repair and ceramide support" },
      { name: "Panthenol + Pantolactone",    function: "Synergistic pair; Pantolactone stabilises and enhances Panthenol bioavailability" },
    ],
    ingredients: [
      { name: "Aqua",                        note: "Solvent base",                                                                                               flag: "ok"   },
      { name: "Niacinamide",                 note: "10% concentration (stated by brand): anti-inflammatory, anti-PIH, sebum-normalising, pore-refining. Clinically validated at 10% for multiple endpoints. Position 2 confirms above 1%.", flag: "ok"   },
      { name: "Propanediol",                 note: "1,3-Propanediol: often bio-derived from corn fermentation. Humectant and co-solvent; superior to Propylene Glycol in sensitisation profile", flag: "ok"   },
      { name: "Caprylic/Capric Triglyceride", note: "Coconut-derived premium emollient; non-comedogenic, skin-identical feel",                                  flag: "ok"   },
      { name: "Glycerin",                    note: "Humectant",                                                                                                  flag: "ok"   },
      { name: "Panthenol",                   note: "Pro-Vitamin B5; barrier restoration. Works synergistically with Pantolactone",                               flag: "ok"   },
      { name: "Tapioca Starch",              note: "Cassava-derived natural thickener; matte finish, sebum absorption relevant for oily skin types",             flag: "ok"   },
      { name: "Coco-Caprylate",              note: "Coconut-derived light emollient; non-comedogenic, dry-touch feel",                                           flag: "ok"   },
      { name: "Polyglyceryl-6 Distearate",   note: "Natural-derived non-PEG emulsifier from glycerol + fatty acids; clean alternative to PEG compounds",       flag: "ok"   },
      { name: "Dicaprylyl Ether",            note: "Lightweight emollient; low occlusion, non-comedogenic",                                                     flag: "ok"   },
      { name: "Caprylyl Glycol",             note: "Co-preservative and humectant",                                                                             flag: "ok"   },
      { name: "Helianthus Annuus Seed Oil",  note: "Sunflower Seed Oil: linoleic acid-rich; supports ceramide synthesis and barrier function",                  flag: "ok"   },
      { name: "Sclerotium Gum",              note: "Biopolymer from fungal fermentation (Sclerotium rolfsii); natural hydrogel texture agent, renewable",       flag: "ok"   },
      { name: "Phenoxyethanol",              note: "Preservative; within EU/India 1% limit",                                                                    flag: "ok"   },
      { name: "Citric Acid",                 note: "pH adjuster; maintains acidic pH optimal for Niacinamide stability",                                        flag: "ok"   },
      { name: "Polyglyceryl-10 Stearate",    note: "Natural-derived non-PEG emulsifier; clean emulsifier system with Polyglyceryl-6 Distearate",               flag: "ok"   },
      { name: "Sodium Hydroxide",            note: "pH adjuster (trace)",                                                                                        flag: "ok"   },
      { name: "Pantolactone",                note: "Panthenol precursor/stabiliser; enhances Panthenol stability and skin bioavailability",                     flag: "ok"   },
      { name: "Tocopherol",                  note: "Natural Vitamin E (not esterified); directly antioxidant-active, more bioavailable than Tocopheryl Acetate", flag: "ok"   },
    ],
    pass_badges: ["Paraben-Free", "Fragrance-Free", "No Artificial Colour", "SLS-Free", "INCI Verified", "Vegan-Friendly", "10% Niacinamide (Stated)", "No PEG Compounds"],
    warn_badges: [],
    info_badges: ["PETA Cruelty-Free", "95% Naturally Derived", "Ayurveda-Aligned"],
    indiaContext: "10% Niacinamide is one of the most evidence-based actives for Indian skin concerns: post-inflammatory hyperpigmentation (PIH) from acne is prevalent in Fitzpatrick III-V types; sebum production is elevated in India's hot-humid climate; enlarged pores from UV damage and congestion are common. This serum addresses all three simultaneously. At Rs. 359-548, it is competitively priced against The Ordinary 10% Niacinamide and is more widely available offline. The matte, Tapioca Starch-aided finish is well-suited to oily skin types across India's humid regions. No Zinc which some Niacinamide serums use - avoids potential zinc purging in sensitive skin types.",
    analyzedAt: "2026-05-20",
  },

];

export const simpleBrand: Brand = {
  name: "Simple Skincare",
  slug: BRAND_SLUG,
  logo: "https://www.simpleskincare.in/cdn/shop/files/Simple_Logo_400x160_f1ca9ee2-b98c-484f-ae93-15897ffabcc0_200x80.png",
  tagline: "Kind to Skin. No harsh chemicals. Since 1960.",
  description: "Simple Skincare is a British brand founded in 1960 to address sensitive skin needs - among the first to formulate without artificial fragrances, colours, or harsh preservatives. Now part of Unilever and PETA certified cruelty-free, Simple occupies a rare space in mass-market beauty: transparent INCI lists, genuine fragrance-free formulation, and dermatologist validation. Their range spans facial cleansers, moisturisers, micellar waters, and boosters. The 10% Niacinamide Booster Serum stands out as a clean-formula, clearly-dosed active serum competitive with specialist brands. Trade-offs include SLES, multiple PEG compounds, and Cocamide MEA in the Moisturising Facial Wash; controversial UV filters in the Rich Moisturiser (Octinoxate under ED review, unstabilised Avobenzone); Hexylene Glycol at high concentration in the Micellar Water; and an SPF 15 sunscreen moisturiser inadequate for Indian UV conditions with no published test report. Overall a mixed-to-good choice for fragrance-intolerant sensitive skin - the Refreshing Facial Wash and Niacinamide Serum are the cleanest picks in the range.",
  founded: "1960",
  headquarters: "London, United Kingdom",
  website: "https://www.simpleskincare.in",
  instagramHandle: "@simpleskincarein",
  nykaaUrl: "https://www.nykaa.com/brands/simple/c/8649",
  avgScore: 68,
  verdict: "Fair",
  products,
};
