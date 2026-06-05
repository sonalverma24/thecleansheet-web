/**
 * CodeSkin brand data
 *
 * Review type:    Web Evidence Review (public information only)
 * Engine:         The Clean Sheet Web Evidence Review Engine v1.0
 * Scoring:        Public evidence confidence (not certification)
 * Review date:    June 2026
 *
 * Pillar weights (public evidence framework):
 *   Pillar 1: Public Ingredient & Safety Screen    35 pts
 *   Pillar 2: Public Formula Logic Review          25 pts
 *   Pillar 3: Public Claims Evidence Review        30 pts
 *   Pillar 4: Public Transparency Review           10 pts
 *   Total:                                        100 pts
 *
 * Evidence bands:
 *   85-100  Strong public evidence  (Excellent)
 *   70-84   Good public evidence    (Good)
 *   50-69   Limited public evidence (Fair)
 *   30-49   Weak public evidence    (Concern)
 *
 * Disclaimer: This review uses only publicly available information -
 * brand website, INCI lists, published test reports, packaging images,
 * and regulatory databases. It does not constitute certification.
 * Absence of public evidence does not mean a claim is false.
 *
 * Sources verified June 2026:
 *   Brand website:   https://codeskin.in
 *   Clinikally:      https://www.clinikally.com/collections/codeskin
 *   Amazon India:    https://www.amazon.in (CodeSkin seller listings)
 *   GMP certificate: publicly linked from codeskin.in (Effeza Science Pvt Ltd)
 */

import type { Brand, ProductScorecard } from "./types";

const BRAND_SLUG = "codeskin";
const BRAND_NAME = "CodeSkin";

const products: ProductScorecard[] = [

  /* -------------------------------------------------
     1. UltraProtect Fluid Sunscreen SPF 100 PA++++
     Source: codeskin.in/products/ultraprotect-fluid-sunscreen
     Web Evidence Review - June 2026
  ------------------------------------------------- */
  {
    productName: "UltraProtect Fluid Sunscreen SPF 100 PA++++",
    slug: "ultraprotect-fluid-sunscreen-spf100",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹500-₹1,000",
    productType: "sunscreen",
    concern: "Broad-spectrum sun protection, pigmentation, outdoor use",
    summary: "A penta-filter chemical sunscreen using five EU-approved next-generation UV filters (Tinosorb M, Tinosorb S, Uvinul A Plus, Uvinul T150, Neo Heliopan AP), none of which are Oxybenzone, Octinoxate, Homosalate, or Octocrylene. The SPF 100 and PA++++ claims are supported by published test reports on the brand website, which is more public evidence than most Indian sunscreens provide. However, two significant issues require consumer awareness: Benzyl Alcohol appears in this leave-on formula and is a fragrance allergen on the expanded EU regulatory list (EU Regulation 2023/1545); and Cymbopogon Flexuosus Leaf Oil (lemongrass essential oil, a source of Citral) is present in a daily-use sunscreen. The brand claims no synthetic fragrances, which is technically accurate, but natural fragrance ingredients still carry allergen and sensitisation risks. The extraordinary 12-hour protection claim is supported by a reference to a French clinical study, but the full study details are not publicly accessible. Web evidence review - not certification.",
    score: 77,
    scoreLabel: "Good",
    image: "https://cdn.shopify.com/s/files/1/0649/1403/0635/files/white_bg_protect_21662db3-8cbb-4597-b6ae-fcdf816a8208.png?v=1768222951",
    pillars: [
      {
        name: "Public Ingredient & Safety Screen",
        score: 26, max: 35,
        note: "Full INCI is publicly available and readable on codeskin.in. All five UV filters are newer-generation, photostable, and EU/India-approved. No oxybenzone, no octinoxate, no homosalate, no octocrylene - this filter selection is genuinely better than most Indian sunscreens on the market. However, two fragrance-related concerns are visible from the public INCI: Benzyl Alcohol, which appears as a preservation booster, is also listed as a fragrance allergen under EU cosmetics regulation (the expanded allergen declaration list, EU Regulation 2023/1545). In a daily leave-on sunscreen covering the entire face, this is worth knowing. Additionally, Cymbopogon Flexuosus Leaf Oil (lemongrass essential oil) contains Citral, a recognised fragrance allergen and potential photosensitiser. The brand markets this product as having no synthetic fragrances, which is true, but consumers with fragrance sensitivity or atopic skin should be aware that natural fragrance ingredients carry the same sensitisation risks as synthetic ones. These are not disqualifying concerns at normal sunscreen concentrations, but they are not visible from the brand's claims alone.",
      },
      {
        name: "Public Formula Logic Review",
        score: 21, max: 25,
        note: "The formula structure is consistent with a high-performance multi-filter chemical sunscreen. Five UV filters working across different wavelength ranges provide broad-spectrum coverage with photostability built in. Tinosorb M and Tinosorb S are among the most photostable UV filters available globally and are not available in the US market. Niacinamide appears at INCI position 9, before several minor emollients and botanicals, suggesting a meaningful concentration above 1% - relevant for its anti-inflammatory and anti-pigmentation benefit. The preservation system uses Sodium Levulinate, Potassium Sorbate, Sodium Benzoate, Benzyl Alcohol, and Glyceryl Caprylate - a phenoxyethanol-free system consistent with the brand's declared charter. One formulation note: Potassium Sorbate and Sodium Benzoate are most effective at pH below 5; sunscreen formulas are typically formulated at a higher pH, which may reduce their individual effectiveness, though the multi-component system likely compensates. Trisodium Dicarboxymethyl Alaninate functions as a chelator. Packaging is described as a fluid (likely pump or tube) - appropriate for sunscreen, but not visible from public images.",
      },
      {
        name: "Public Claims Evidence Review",
        score: 22, max: 30,
        note: "CodeSkin publishes more public test evidence than most Indian brands. The SPF 100 and PA++++ values are supported by a published SPF test report. Non-comedogenic, dermatologist tested, ophthalmologist tested, water and sweat resistance, and moisturisation - all have published test reports in the Proof of the Code section. These are more evidence than the industry norm of unsubstantiated claims. However, two claims require caution: the '12-hour protection' claim is attributed to a French clinical study, but the full study - including method, subject count, setting, and result scope - is not publicly accessible. It cannot be verified from public evidence. The SPF 100 claim is also unusual: the FDA caps SPF claims at 50+ in the US, and while Indian/EU regulations do not impose the same cap, there is no standardised ISO or BIS method publicly confirmed for SPF values this high. Finally, the brand describes itself as using no synthetic fragrances, but Benzyl Alcohol (a fragrance allergen) and Cymbopogon Flexuosus Leaf Oil (lemongrass) are present - consumers may reasonably interpret no synthetic fragrances as fragrance-free, which this product is not.",
      },
      {
        name: "Public Transparency Review",
        score: 8, max: 10,
        note: "Full INCI list is publicly accessible on codeskin.in. The brand publishes individual test report images for multiple claims - SPF, non-comedogenic, dermatologist tested, ophthalmologist, sweat resistance - which is an unusually high level of public evidence for an Indian brand of this size. The charter page lists restricted ingredients in detail, including a public GMP certificate for the manufacturing facility. Deductions: no specific pregnancy or fragrance-allergen warning is provided despite the presence of Benzyl Alcohol and lemongrass oil in a daily leave-on product; and no batch or expiry traceability information is publicly visible. The brand is not listed on Nykaa, limiting multi-source consistency checking.",
      },
    ],
    keyActives: [
      { name: "Methylene Bis-Benzotriazolyl Tetramethylbutylphenol (Tinosorb M)", function: "Broad-spectrum UV filter, hybrid organic/inorganic, photostable; covers UVB and long UVA" },
      { name: "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine (Tinosorb S)",        function: "Broad-spectrum UVB and UVA filter, highly photostable; not available in US market" },
      { name: "Diethylamino Hydroxybenzoyl Hexyl Benzoate (Uvinul A Plus)",         function: "UVA filter, high photostability and skin affinity" },
      { name: "Ethylhexyl Triazone (Uvinul T150)",                                  function: "UVB filter, photostable, efficient at low concentrations" },
      { name: "Diethylhexyl Butamido Triazone (Neo Heliopan AP)",                   function: "Broad-spectrum filter covering UVB and short UVA; photostable" },
      { name: "Niacinamide",                                                         function: "Vitamin B3, anti-inflammatory, reduces UV-triggered pigmentation; position 9 suggests functional concentration" },
    ],
    ingredients: [
      { name: "Aqua",                                      note: "Solvent base",                                                                                                                    flag: "ok"   },
      { name: "Dibutyl Adipate",                           note: "Emollient ester for spreadability and texture",                                                                                   flag: "ok"   },
      { name: "Methylene Bis-Benzotriazolyl Tetramethylbutylphenol", note: "Tinosorb M - broad-spectrum UV filter (UVB and long UVA), photostable, no photodegradation concern",                 flag: "ok"   },
      { name: "C15-19 Alkane",                             note: "Sustainable isoalkane emollient (bio-based), lightweight non-greasy texture modifier",                                           flag: "ok"   },
      { name: "Caprylyl Caprylate/Caprate",                note: "Emollient ester, skin conditioning",                                                                                             flag: "ok"   },
      { name: "Ethylhexyl Triazone",                       note: "Uvinul T150 - UVB filter, photostable",                                                                                         flag: "ok"   },
      { name: "Diethylamino Hydroxybenzoyl Hexyl Benzoate",note: "Uvinul A Plus - UVA filter, photostable",                                                                                       flag: "ok"   },
      { name: "Polyglyceryl-6 Laurate",                    note: "Natural-derived emulsifier (polyglyceryl ester)",                                                                                flag: "ok"   },
      { name: "Niacinamide",                               note: "Vitamin B3, position 9 - before minor botanicals, suggests functionally meaningful concentration; anti-inflammatory, brightening", flag: "ok"   },
      { name: "Chondrus Crispus Extract",                  note: "Carrageenan-based marine algae extract, skin conditioning and film-former",                                                      flag: "ok"   },
      { name: "Dicaprylyl Carbonate",                      note: "Emollient, improves skin feel and spreadability",                                                                                flag: "ok"   },
      { name: "Isododecane",                               note: "Lightweight volatile emollient, non-greasy finish",                                                                              flag: "ok"   },
      { name: "Tetrahexyldecyl Ascorbate",                 note: "Oil-soluble stable Vitamin C form, antioxidant and brightening; concentration not publicly disclosed",                          flag: "info" },
      { name: "Adenosine",                                 note: "Purine nucleoside, skin conditioning and mild anti-inflammatory",                                                                flag: "ok"   },
      { name: "Sodium Hyaluronate",                        note: "Hyaluronic acid salt for surface hydration",                                                                                    flag: "ok"   },
      { name: "Hexylene Glycol",                           note: "Humectant and solubiliser",                                                                                                     flag: "ok"   },
      { name: "Aloe Barbadensis Leaf Juice",               note: "Soothing and hydrating botanical",                                                                                              flag: "ok"   },
      { name: "Saccharomyces Ferment Lysate Filtrate",     note: "Yeast ferment, antioxidant and skin conditioning",                                                                               flag: "ok"   },
      { name: "Glycerin",                                  note: "Humectant",                                                                                                                      flag: "ok"   },
      { name: "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine", note: "Tinosorb S - broad-spectrum UV filter, highly photostable; not approved in US market",                                   flag: "ok"   },
      { name: "Starch",                                    note: "Natural mattifying and oil-absorbing powder",                                                                                    flag: "ok"   },
      { name: "Polymethylsilsesquioxane",                  note: "Silicone microspheres, skin feel and soft-focus effect",                                                                        flag: "ok"   },
      { name: "Isoamyl Laurate",                           note: "Plant-derived emollient ester (jojoba wax component), elegant texture",                                                         flag: "ok"   },
      { name: "Diethylhexyl Butamido Triazone",            note: "Neo Heliopan AP - broad-spectrum UV filter, photostable",                                                                       flag: "ok"   },
      { name: "Xylitol",                                   note: "Humectant and prebiotic, skin conditioning",                                                                                    flag: "ok"   },
      { name: "Steareth-21",                               note: "PEG-based emulsifier (ethoxylated stearyl alcohol); 1,4-dioxane impurity risk managed by brand claims",                        flag: "info" },
      { name: "Pentaerythrityl Distearate",                note: "Emollient and texturiser",                                                                                                      flag: "ok"   },
      { name: "Sodium Polyacrylate",                       note: "Polymer thickener and emulsion stabiliser",                                                                                     flag: "ok"   },
      { name: "Erythritol",                                note: "Humectant and skin protectant",                                                                                                  flag: "ok"   },
      { name: "Sodium Stearoyl Glutamate",                 note: "Mild amino acid-based emulsifier",                                                                                              flag: "ok"   },
      { name: "Silica",                                    note: "Oil-absorbing mineral powder, mattifying effect",                                                                                flag: "ok"   },
      { name: "Polyglutamic Acid",                         note: "Moisture-binding polymer (reportedly 4x HA capacity); late in list suggests trace or functional-at-low-level concentration",   flag: "info" },
      { name: "Magnesium Aluminum Silicate",               note: "Mineral suspension stabiliser",                                                                                                  flag: "ok"   },
      { name: "Polyacrylate Crosspolymer-6",               note: "Polymer emulsion stabiliser and thickener",                                                                                     flag: "ok"   },
      { name: "Brassica Oleracea Italica Extract",         note: "Broccoli extract, antioxidant sulforaphane source",                                                                             flag: "ok"   },
      { name: "Glyceryl Caprylate",                        note: "Natural-derived multifunctional ingredient - emollient and mild antimicrobial",                                                 flag: "ok"   },
      { name: "Trisodium Dicarboxymethyl Alaninate",       note: "Biodegradable chelating agent (replaces EDTA), supports preservation system",                                                   flag: "ok"   },
      { name: "Tocopheryl Acetate",                        note: "Vitamin E derivative, antioxidant",                                                                                             flag: "ok"   },
      { name: "Tocotrienols",                              note: "More potent vitamin E isomers, antioxidant and anti-inflammatory",                                                              flag: "ok"   },
      { name: "Phytosteryl/Octyldodecyl Lauroyl Glutamate",note: "Skin barrier lipid, emollient",                                                                                                flag: "ok"   },
      { name: "Diethylhexyl Syringylidenemalonate",        note: "UV-absorbing antioxidant, provides added photostability",                                                                       flag: "ok"   },
      { name: "Benzyl Alcohol",                            note: "Multifunctional: preservative booster AND EU-listed fragrance allergen (EU Reg 2023/1545). In a daily leave-on product, allergen status should be noted for fragrance-sensitive consumers",  flag: "warn" },
      { name: "Olea Europaea Leaf Extract",                note: "Olive leaf extract, antioxidant polyphenols",                                                                                   flag: "ok"   },
      { name: "Dipotassium Glycyrrhizate",                 note: "Licorice root derivative, anti-inflammatory and skin brightening",                                                              flag: "ok"   },
      { name: "Ectoin",                                    note: "Extremolyte, environmental stress protection and skin barrier reinforcement",                                                    flag: "ok"   },
      { name: "Sodium Levulinate",                         note: "Preservative booster (phenoxyethanol-free system component)",                                                                   flag: "ok"   },
      { name: "Panthenol",                                 note: "Vitamin B5, skin barrier repair",                                                                                               flag: "ok"   },
      { name: "Caprylyl/Capryl Glucoside",                 note: "Mild glucoside surfactant, antimicrobial contribution to preservation system",                                                  flag: "ok"   },
      { name: "Decyl Glucoside",                           note: "Mild sugar-derived surfactant",                                                                                                  flag: "ok"   },
      { name: "Xanthan Gum",                               note: "Natural thickener",                                                                                                             flag: "ok"   },
      { name: "Myristyl Glucoside",                        note: "Mild fatty glucoside surfactant",                                                                                               flag: "ok"   },
      { name: "Citric Acid",                               note: "pH adjuster",                                                                                                                    flag: "ok"   },
      { name: "Cymbopogon Flexuosus Leaf Oil",             note: "Lemongrass essential oil - natural fragrance source. Contains Citral, a known fragrance allergen (EU Regulation 2023/1545). In a daily leave-on sunscreen, sensitisation and potential photosensitisation risk should be noted. Brand claims no synthetic fragrances (accurate), but this is not fragrance-free",  flag: "warn" },
      { name: "Potassium Sorbate",                         note: "Preservative, most effective below pH 5; forms part of phenoxyethanol-free system",                                            flag: "ok"   },
      { name: "Sodium Benzoate",                           note: "Preservative, most effective below pH 5; part of phenoxyethanol-free system",                                                  flag: "ok"   },
    ],
    pass_badges: ["INCI Verified", "No Oxybenzone", "No Octinoxate", "No Homosalate", "No Octocrylene", "No Phenoxyethanol", "5 Photostable UV Filters", "Published SPF Test Report", "GMP Certified Manufacturer"],
    warn_badges: ["Contains Fragrance Allergens (Benzyl Alcohol, Citral via Lemongrass)", "12-Hour Claim Not Verified from Public Evidence", "SPF 100 Unusual - No Standardised Method Above SPF 50+"],
    info_badges: ["Penta-Filter Technology", "Published Non-Comedogenic & Dermatologist Test Reports", "Natural Fragrance Present"],
    indiaContext: "The filter selection here is well-suited to Indian conditions: all five UV filters are photostable, meaning their UVA and UVB protection does not degrade under intense UV exposure the way older filter systems can. Niacinamide in the formula helps reduce post-UV darkening, relevant for Fitzpatrick III-VI skin. Fragrance-sensitive or atopic individuals should note Benzyl Alcohol and lemongrass oil. Reapply every two hours in direct sun regardless of the 12-hour claim, as physical and sweat removal reduces effective filter coverage.",
    analyzedAt: "2026-06-02",
    category: "Sunscreens",
    subCategory: "Chemical Sunscreen",
    concernTags: ["Photoageing", "Tanning", "Pigmentation", "Sun Protection"],
    suitabilityTags: ["Daily Use", "Active Experienced Users"],
    cautionTags: ["Contains Fragrance", "Fragrance Allergen Flag", "Essential Oil Flag", "Active % Not Verified", "Clinical Claim Not Verified"],
  },

  /* -------------------------------------------------
     2. UltraMatte Mineral Gel Sunscreen SPF 50+ PA++++
     Source: codeskin.in/products/ultramatte-mineral-gel-sunscreen
     Web Evidence Review - June 2026
  ------------------------------------------------- */
  {
    productName: "UltraMatte Mineral Gel Sunscreen SPF 50+ PA++++",
    slug: "ultramatte-mineral-gel-sunscreen-spf50",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹1,100",
    productType: "sunscreen",
    concern: "Sun protection, oil control, acne-prone skin, mineral preference",
    summary: "A 100% mineral (Zinc Oxide only) anhydrous elastomer gel sunscreen designed for oily and acne-prone skin. The water-free formulation has excellent microbiological and photostability - no aqueous preservation challenge, no chemical filter photodegradation. The full INCI list and multiple published test reports (SPF, non-comedogenic, dermatologist, ophthalmologist, water resistant, blue light, vegan) are publicly available. Of all CodeSkin products reviewed, this has the cleanest allergen profile: no synthetic fragrance, no essential oils, no Benzyl Alcohol. One formulation note for acne-prone users: Isostearic Acid appears in the INCI and has some comedogenicity potential, which is worth noting given the product is specifically marketed for acne-prone skin. Zinc Oxide concentration is not publicly disclosed but its INCI position 3 in an anhydrous system suggests a meaningful functional amount. Web evidence review - not certification.",
    score: 88,
    scoreLabel: "Good",
    image: "https://cdn.shopify.com/s/files/1/0649/1403/0635/files/Ultramatte_mineral_gel_sunscreen_df477313-531c-4bca-88ce-b1fc769b58ab.png?v=1765100436",
    pillars: [
      {
        name: "Public Ingredient & Safety Screen",
        score: 32, max: 35,
        note: "Anhydrous mineral formula with Zinc Oxide as the sole UV filter. No chemical UV filters, no oxybenzone, no octinoxate, no homosalate, no octocrylene. Zinc Oxide is photostable, broadly accepted in pregnancy and paediatric contexts, and carries no known endocrine disruption signal at cosmetic topical concentrations. No fragrance of any kind - no essential oils, no parfum, no benzyl alcohol. This is the cleanest allergen profile of any product in this brand review. Hinokitiol, sourced from Japanese cypress, appears as an anti-acne ingredient - it has antimicrobial properties but concentration is not publicly disclosed and long-term leave-on safety data at cosmetic concentrations is less extensive than conventional actives. Isostearic Acid appears as an emollient: it has a higher comedogenic rating on some scales, which is a formulation note worth flagging for acne-prone skin given the product's target audience.",
      },
      {
        name: "Public Formula Logic Review",
        score: 22, max: 25,
        note: "Dimethicone at INCI position 1 establishes this as an anhydrous silicone gel - the correct vehicle choice for an elastomer gel mineral sunscreen. Zinc Oxide at position 3 in an anhydrous system confirms it is a significant component by weight. Silicone elastomer technology (Dimethicone Crosspolymer) provides the smooth, blendable texture that makes mineral sunscreens wearable for daily use. No water means no microbial growth risk and no need for conventional preservatives - Glyceryl Caprylate, Caprylyl/Capryl Glucoside, and Propanediol provide adequate antimicrobial protection in the anhydrous system. Hydroxyapatite and Boron Nitride contribute to the matte, complexion-evening finish. Tinted with CI 77492 (yellow iron oxide), providing a light tint that reduces the white cast typical of mineral-only sunscreens. The only formulation concern flagged is the inclusion of Isostearic Acid for a product positioned for acne-prone skin.",
      },
      {
        name: "Public Claims Evidence Review",
        score: 26, max: 30,
        note: "This product has the strongest public evidence base of any product in this brand review. Published test reports cover SPF, non-comedogenic, dermatologist tested, ophthalmologist tested, water resistant, blue light, vegan, and clean beauty. The '100% mineral' claim is directly verified from the INCI: Zinc Oxide is the only UV filter present. The vegan claim is supported both by a published vegan test report and by the INCI, which contains no animal-derived ingredients in this specific product. PA++++ is stated on packaging; the PPD testing supporting it is consistent with what the brand shows on other products. Hinokitiol (from Japan) is used as an anti-acne ingredient - the anti-acne claim is plausible given Hinokitiol's documented antimicrobial properties, but the concentration is not disclosed and no finished product clinical study was found publicly. The 'moisturisation tested' claim in an anhydrous formula is a minor area where consumer expectation and formula design may not fully align.",
      },
      {
        name: "Public Transparency Review",
        score: 8, max: 10,
        note: "Full INCI on the brand website. Multiple published test reports across categories. GMP manufacturing certificate publicly linked. Isostearic Acid is not flagged in consumer-facing materials despite its comedogenicity association and the product's acne-prone target market - this is a transparency gap. Batch and expiry traceability is not publicly visible. Brand is not listed on Nykaa, limiting multi-source INCI consistency checking.",
      },
    ],
    keyActives: [
      { name: "Zinc Oxide",                function: "Sole UV filter - broad-spectrum physical filter (UVA and UVB), photostable, non-penetrating; position 3 in anhydrous system confirms functional level" },
      { name: "Hinokitiol",                function: "Natural antimicrobial from Japanese cypress (Chamaecyparis obtusa), anti-acne; concentration not publicly disclosed" },
      { name: "Ectoin",                    function: "Extremolyte, environmental stress protection, skin barrier reinforcement" },
      { name: "Pongamia Pinnata Seed Extract", function: "Anti-inflammatory, claimed to boost Zinc Oxide UV protection; positioned late in INCI - functional concentration uncertain" },
      { name: "Hydroxyapatite",            function: "Calcium phosphate mineral, optical skin-tone evening, supports matte finish" },
      { name: "Ethyl Linoleate / Linolenate / Oleate", function: "Vitamin F (fatty acid esters), skin barrier and sebum rebalancing for oily skin" },
    ],
    ingredients: [
      { name: "Dimethicone",               note: "Silicone, position 1 - primary vehicle for anhydrous elastomer gel formula; photostable, non-comedogenic",                                       flag: "ok"   },
      { name: "Dimethicone Crosspolymer",  note: "Silicone elastomer, creates smooth skin-like texture and enables blendability of mineral sunscreen",                                            flag: "ok"   },
      { name: "Zinc Oxide",                note: "Sole UV filter - photostable broad-spectrum physical filter; position 3 confirms functional concentration; no penetration concern with micronised form coated with silica/polyhydroxystearic acid", flag: "ok" },
      { name: "Isododecane",               note: "Lightweight volatile emollient",                                                                                                                 flag: "ok"   },
      { name: "C13-15 Alkane",             note: "Sustainable isoalkane emollient (bio-based)",                                                                                                    flag: "ok"   },
      { name: "Disteardimonium Hectorite", note: "Mineral clay, suspension stabiliser for Zinc Oxide in anhydrous system",                                                                         flag: "ok"   },
      { name: "Isoamyl Laurate",           note: "Plant-derived emollient ester",                                                                                                                  flag: "ok"   },
      { name: "Coco-Caprylate/Caprate",    note: "Lightweight emollient derived from coconut oil",                                                                                                flag: "ok"   },
      { name: "Isostearic Acid",           note: "Emollient fatty acid; aids Zinc Oxide suspension. Note: carries higher comedogenic ratings on standard scales - relevant for acne-prone target audience", flag: "info" },
      { name: "Trihydroxystearin",         note: "Thickener and emollient, natural origin",                                                                                                       flag: "ok"   },
      { name: "Caprylic/Capric Triglyceride", note: "Lightweight emollient carrier from coconut/palm kernel",                                                                                    flag: "ok"   },
      { name: "Polyhydroxystearic Acid",   note: "Dispersant and wetting agent for Zinc Oxide pigment in silicone systems",                                                                       flag: "ok"   },
      { name: "Lecithin",                  note: "Phospholipid emulsifier, biomimetic skin conditioning",                                                                                         flag: "ok"   },
      { name: "Polyglyceryl-3 Polyricinoleate", note: "Emulsifier for water-in-oil systems",                                                                                                     flag: "ok"   },
      { name: "Ethyl Linoleate",           note: "Linoleic acid ester - Vitamin F component, skin barrier and sebum rebalancing",                                                                flag: "ok"   },
      { name: "Ethyl Linolenate",          note: "Linolenic acid ester - Vitamin F component, anti-inflammatory omega-3 source",                                                                  flag: "ok"   },
      { name: "Ethyl Oleate",             note: "Oleic acid ester - Vitamin F component, emollient; note mild CPE potential at high concentration",                                              flag: "ok"   },
      { name: "Hydroxyapatite",            note: "Calcium phosphate mineral, optical skin-tone correction, matte finish contribution",                                                            flag: "ok"   },
      { name: "Caprylyl Methicone",        note: "Silicone, lightweight volatile emollient for skin feel",                                                                                        flag: "ok"   },
      { name: "Silica",                    note: "Oil-absorbing mineral powder, mattifying",                                                                                                       flag: "ok"   },
      { name: "Boron Nitride",             note: "Mineral powder, soft-focus optical effect and matte finish",                                                                                    flag: "ok"   },
      { name: "Glyceryl Caprylate",        note: "Natural-derived multifunctional: emollient and mild antimicrobial (part of phenoxyethanol-free system)",                                       flag: "ok"   },
      { name: "Lauroyl Lysine",            note: "Amino acid-based powder, improves texture and spreadability",                                                                                   flag: "ok"   },
      { name: "Pongamia Pinnata Seed Extract", note: "Karanja oil extract, anti-inflammatory; claimed to enhance UV filter performance; late position suggests trace concentration",             flag: "ok"   },
      { name: "Tocopheryl Acetate",        note: "Vitamin E antioxidant",                                                                                                                         flag: "ok"   },
      { name: "Hinokitiol",                note: "Natural tropolone from Japanese cypress, antimicrobial (anti-acne); concentration not publicly disclosed",                                     flag: "info" },
      { name: "Caprylyl/Capryl Glucoside", note: "Mild glucoside, antimicrobial contribution in anhydrous system",                                                                               flag: "ok"   },
      { name: "Propanediol",               note: "Humectant and solubiliser, mild antimicrobial booster in anhydrous context",                                                                    flag: "ok"   },
      { name: "Ectoin",                    note: "Extremolyte, environmental stress protection and skin barrier reinforcement",                                                                    flag: "ok"   },
      { name: "Hyaluronic Acid",           note: "HA for hydration; note - in anhydrous formula, HA requires water contact for film-forming effect; late position",                             flag: "info" },
      { name: "CI 77492",                  note: "Yellow iron oxide - mineral tint for skin-tone correction and white-cast reduction",                                                            flag: "ok"   },
    ],
    pass_badges: ["INCI Verified", "100% Mineral UV Filter (Zinc Oxide Only)", "No Oxybenzone", "No Octinoxate", "No Homosalate", "No Octocrylene", "No Phenoxyethanol", "Fragrance-Free", "No Essential Oils", "Published SPF Test Report", "Non-Comedogenic Tested", "Vegan Tested", "GMP Certified Manufacturer"],
    warn_badges: ["Isostearic Acid - Comedogenic Potential Flagged for Acne-Prone Users"],
    info_badges: ["Anhydrous Elastomer Gel Technology", "Lightly Tinted (Iron Oxide)", "Published Blue Light Test Report"],
    indiaContext: "Mineral-only sunscreens suit consumers who want to avoid all chemical UV filters - particularly relevant for those with rosacea, sensitive skin, or pregnancy, where zinc oxide's photostability and safety profile are well established. The elastomer gel vehicle is designed to reduce the white cast and heavy feel typical of mineral sunscreens, making it viable for daily use in India's climate. For dark skin tones (Fitzpatrick V-VI), the light tint may not fully neutralise white cast at higher application quantities. For best SPF performance, apply the recommended 2 mg per cm2 and reapply every two hours.",
    analyzedAt: "2026-06-02",
    category: "Sunscreens",
    subCategory: "Mineral Sunscreen",
    concernTags: ["Photoageing", "Tanning", "Oily Skin", "Acne", "Sun Protection"],
    suitabilityTags: ["Daily Use", "Oily Skin", "Acne Prone Skin", "Fragrance Sensitive Users"],
    cautionTags: ["Contains Comedogenic Ingredients"],
  },

  /* -------------------------------------------------
     3. Hyaluronic 7+ Serum
     Source: codeskin.in/products/hyaluronic-7
     Web Evidence Review - June 2026
     PUBLIC RED FLAG: Whey Protein in INCI contradicts "100% vegan" claim on product page.
  ------------------------------------------------- */
  {
    productName: "Hyaluronic 7+ Serum",
    slug: "hyaluronic-7-serum",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹500-₹1,250",
    productType: "leave-on",
    concern: "Hydration, skin plumping, barrier repair, anti-ageing",
    summary: "A multi-weight hyaluronic acid serum with several advanced hydration and barrier actives. The public INCI shows four distinct forms of hyaluronic acid - Sodium Hyaluronate Crosspolymer, Sodium Hyaluronate, Hydrolyzed Hyaluronic Acid, and Sodium Acetylated Hyaluronate - though the brand's claim of '7 types of HA' cannot be fully verified from the public ingredient list as presented. More seriously, this product's INCI list includes Whey Protein, which is derived from milk (dairy), while the product page states '100% vegan.' This is a direct contradiction between two publicly available pieces of evidence from the same brand website. This is not a certification finding - it is a public evidence contradiction. The brand should clarify whether Whey Protein is present and reconcile the vegan claim. Additionally, Tripeptide-85 is referenced in marketing copy but does not appear in the INCI list. Diethylene Glycol Monoethyl Ether (Transcutol), a penetration enhancer that increases how deeply all co-formulated actives absorb, is present and worth noting. Web evidence review - not certification.",
    score: 71,
    scoreLabel: "Good",
    image: "https://cdn.shopify.com/s/files/1/0649/1403/0635/files/Hyaluronic_7_Serum_-_CodeSkin-4870725_28680c52-390b-47c6-a0b4-e92be22651a5.jpg?v=1765100449",
    pillars: [
      {
        name: "Public Ingredient & Safety Screen",
        score: 28, max: 35,
        note: "Full INCI publicly available. No banned substances identified. The formula uses a phenoxyethanol-free preservation system of Caprylhydroxamic Acid, 1,2-Hexanediol, Sodium Benzoate, Potassium Sorbate, Sodium Levulinate, and Levulinic Acid - consistent with the brand's declared ingredient charter. Two ingredients require consumer awareness: Diethylene Glycol Monoethyl Ether (also known as Transcutol) is a penetration enhancer that significantly increases how deeply all co-formulated ingredients absorb into skin - this amplifies both the efficacy and the systemic exposure of everything in the formula. Phenethyl Alcohol, used as a preservative booster, has mild sensitisation potential at higher concentrations and an unusual rose-like scent profile that some consumers associate with fragrance. Whey Protein appears in the INCI as a skin conditioning protein - it is animal-derived from milk. Combined with the vegan claim on the product page, this creates a public evidence contradiction that is flagged under the review framework.",
      },
      {
        name: "Public Formula Logic Review",
        score: 19, max: 25,
        note: "Aqua first. Propanediol at INCI position 2 indicates a high solvent load - this is common in performance serums and helps solubilise actives, but it also suggests the formula is solvent-heavy before the actives begin. Caprylhydroxamic Acid at position 3 and 1,2-Hexanediol at position 4 are preservation-system ingredients appearing unusually early; this INCI positioning is atypical and may reflect a formula design where these multifunctional ingredients serve both a humectant and preservation role. Niacinamide appears at position 5, likely above the 1% threshold, consistent with the brand's stated 5% concentration. Diethylene Glycol Monoethyl Ether (Transcutol) at position 11 acts as a penetration enhancer. Ceramide NP appears very late in the list (position 38+), suggesting a trace concentration - ceramide barrier repair claims at this level are difficult to support from INCI position evidence alone. Linolenic Acid at the end of the list is oxidation-sensitive and may need robust preservation in this water-based vehicle.",
      },
      {
        name: "Public Claims Evidence Review",
        score: 17, max: 30,
        note: "Three public evidence issues are identified. First: the '100% vegan' claim on the product page is directly contradicted by Whey Protein (dairy-derived) in the INCI list. Per the web evidence review framework, this is a public claim contradicted by public evidence - not a speculation or assumption. The brand should clarify. Second: 'Tripeptide-85 for firmness' appears in marketing copy on the product page but Tripeptide-85 does not appear in the published INCI list. A cosmetic claim based on an ingredient that is not in the INCI is not verified from public evidence. Third: '7 types of Hyaluronic Acid' - four distinct HA forms are clearly identifiable in the INCI (Sodium Hyaluronate Crosspolymer, Sodium Hyaluronate, Hydrolyzed Hyaluronic Acid, Sodium Acetylated Hyaluronate). Additional HA types may come from marine algae extracts or glycogen, but cannot be confirmed without brand disclosure. The 7-type claim is not verified from public evidence in its current form. The dermatologist tested report is published, which is a positive. The 5% Niacinamide claim is plausible from INCI position but not formally confirmed.",
      },
      {
        name: "Public Transparency Review",
        score: 7, max: 10,
        note: "Full INCI list is publicly accessible. The dermatologist test report is published. However, the vegan certification and the INCI list contain directly conflicting information that the brand has not publicly resolved. Claim transparency is significantly reduced by the vegan-vs-Whey Protein contradiction and by the Tripeptide-85 marketing claim without INCI support. Use and safety warnings for the penetration enhancer (Diethylene Glycol Monoethyl Ether) are not communicated to consumers. No batch or expiry traceability is publicly visible.",
      },
    ],
    keyActives: [
      { name: "Sodium Hyaluronate Crosspolymer",   function: "High molecular weight cross-linked HA, surface hydration and long-lasting moisture film" },
      { name: "Sodium Hyaluronate",                function: "Standard HA, surface hydration" },
      { name: "Hydrolyzed Hyaluronic Acid",        function: "Low molecular weight HA fragments, penetrate deeper into the stratum corneum" },
      { name: "Sodium Acetylated Hyaluronate",     function: "Lipid-modified HA (SkinMimics), enhanced skin adhesion and prolonged moisture retention" },
      { name: "Niacinamide",                       function: "Vitamin B5, position 5 suggests meaningful concentration (brand states 5%); brightening, barrier support, sebum regulation" },
      { name: "Diethylene Glycol Monoethyl Ether", function: "Transcutol - penetration enhancer; increases absorption depth of all co-formulated actives; both efficacy benefit and exposure consideration" },
      { name: "Ceramide NP",                       function: "Skin barrier lipid; late INCI position suggests trace concentration - functional barrier claim not verifiable from INCI position alone" },
      { name: "Ectoin",                            function: "Extremolyte, environmental stress protection and barrier reinforcement" },
    ],
    ingredients: [
      { name: "Aqua",                              note: "Solvent base",                                                                                                                      flag: "ok"   },
      { name: "Propanediol",                       note: "Position 2 - major solvent/humectant component; plant-derived, low sensitisation risk",                                            flag: "ok"   },
      { name: "Caprylhydroxamic Acid",             note: "Multifunctional preservative and chelator; position 3 is unusually early for a preservative - likely serving dual humectant/antimicrobial role", flag: "info" },
      { name: "1,2-Hexanediol",                    note: "Multifunctional humectant and antimicrobial preservative booster; position 4",                                                     flag: "ok"   },
      { name: "Niacinamide",                       note: "Vitamin B3, position 5 suggests above 1%; brand states 5% - plausible but not confirmed from INCI position alone",                flag: "ok"   },
      { name: "Hexylene Glycol",                   note: "Humectant and solubiliser",                                                                                                         flag: "ok"   },
      { name: "Glycerin",                          note: "Humectant",                                                                                                                          flag: "ok"   },
      { name: "Saccharide Isomerate",              note: "Carbohydrate-based skin-identical humectant (Pentavitin), provides long-lasting moisture binding",                                 flag: "ok"   },
      { name: "Citric Acid",                       note: "pH adjuster",                                                                                                                        flag: "ok"   },
      { name: "Sodium Citrate",                    note: "pH buffer",                                                                                                                          flag: "ok"   },
      { name: "Heptyl Glucoside",                  note: "Mild glucoside surfactant and solubiliser",                                                                                         flag: "ok"   },
      { name: "Hypnea Musciformis Extract",        note: "Marine red algae extract, antioxidant and skin conditioning",                                                                        flag: "ok"   },
      { name: "Sargassum Filipendula Extract",     note: "Marine brown algae extract, antioxidant and firming",                                                                               flag: "ok"   },
      { name: "Sodium Benzoate",                   note: "Preservative; most effective below pH 5",                                                                                           flag: "ok"   },
      { name: "Potassium Sorbate",                 note: "Preservative; most effective below pH 5",                                                                                           flag: "ok"   },
      { name: "Sodium Hyaluronate Crosspolymer",  note: "High MW cross-linked HA, surface hydration film, moisturisation",                                                                   flag: "ok"   },
      { name: "Glycogen",                          note: "Skin-identical polysaccharide, moisturisation and skin conditioning",                                                               flag: "ok"   },
      { name: "Panthenol",                         note: "Vitamin B5, barrier repair",                                                                                                        flag: "ok"   },
      { name: "Butylene Glycol",                   note: "Humectant",                                                                                                                          flag: "ok"   },
      { name: "Polyglutamic Acid",                 note: "High-MW moisture binding polymer; late INCI position suggests trace or functional-at-low-level amount",                            flag: "info" },
      { name: "Phenethyl Alcohol",                 note: "Preservative with mild sensitisation potential; rose-like scent profile - some consumers may experience as fragrance note",        flag: "info" },
      { name: "Sodium Carrageenan",                note: "Marine polysaccharide thickener and skin conditioner",                                                                              flag: "ok"   },
      { name: "Jania Rubens Extract",              note: "Calcareous red algae extract, skin conditioning",                                                                                   flag: "ok"   },
      { name: "Sclerotium Gum",                    note: "Biopolymer thickener",                                                                                                              flag: "ok"   },
      { name: "Hydroxypropyl Tetrahydropyrantriol",note: "Pro-Xylane (BASF), skin structure and firmness claim ingredient; concentration not publicly disclosed",                            flag: "info" },
      { name: "Pentylene Glycol",                  note: "Humectant and mild preservative booster",                                                                                           flag: "ok"   },
      { name: "Zinc Ricinoleate",                  note: "Zinc salt of ricinoleic acid, odour neutraliser and mild antimicrobial",                                                           flag: "ok"   },
      { name: "Tetrasodium Glutamate Diacetate",   note: "Biodegradable chelating agent (replaces EDTA), supports preservation system",                                                      flag: "ok"   },
      { name: "Levulinic Acid",                    note: "Organic acid preservative booster (part of phenoxyethanol-free system)",                                                           flag: "ok"   },
      { name: "Caprylic/Capric Triglyceride",      note: "Emollient, solubiliser for lipophilic actives",                                                                                    flag: "ok"   },
      { name: "Hydrogenated Lecithin",             note: "Phospholipid emulsifier and skin barrier support; late position suggests trace",                                                   flag: "ok"   },
      { name: "Phytosteryl/Octyldodecyl Lauroyl Glutamate", note: "Skin barrier lipid, emollient",                                                                                          flag: "ok"   },
      { name: "Ceramide NP",                       note: "Key skin barrier lipid; very late INCI position suggests trace concentration - functional barrier repair claim from Ceramide NP at this level not confirmed from INCI position evidence", flag: "info" },
      { name: "Sodium Hyaluronate",                note: "Standard molecular weight HA, surface hydration",                                                                                  flag: "ok"   },
      { name: "Aminomethyl Propanol",              note: "pH adjuster",                                                                                                                        flag: "ok"   },
      { name: "Trisodium Dicarboxymethyl Alaninate", note: "Biodegradable chelator",                                                                                                         flag: "ok"   },
      { name: "Allantoin",                         note: "Soothing and skin-repairing",                                                                                                       flag: "ok"   },
      { name: "Whey Protein",                      note: "Milk-derived protein (animal origin). Product page claims 100% vegan. Whey Protein is dairy-derived and is not vegan. This is a contradiction between two publicly available sources from the same brand website. Not a certification finding - a public evidence contradiction", flag: "warn" },
      { name: "Ectoin",                            note: "Extremolyte, environmental stress protection and barrier reinforcement",                                                             flag: "ok"   },
      { name: "Maltodextrin",                      note: "Polysaccharide encapsulant and thickener",                                                                                          flag: "ok"   },
      { name: "Biosaccharide Gum-1",               note: "Fermentation-derived biopolymer, skin conditioning and soothing",                                                                  flag: "ok"   },
      { name: "Xanthan Gum",                       note: "Natural thickener",                                                                                                                 flag: "ok"   },
      { name: "Hydrolyzed Hyaluronic Acid",        note: "Low molecular weight HA fragments, penetrate past stratum corneum for deeper layer hydration",                                    flag: "ok"   },
      { name: "Magnesium Carboxymethyl Beta-Glucan", note: "Beta-glucan derivative, immune-modulatory and skin conditioning",                                                                flag: "ok"   },
      { name: "Sodium Acetylated Hyaluronate",     note: "Lipid-modified HA (SkinMimics), enhanced skin adhesion and prolonged moisture vs standard HA",                                   flag: "ok"   },
      { name: "Diethylene Glycol Monoethyl Ether", note: "Transcutol - strong penetration enhancer; increases how deeply all co-formulated actives absorb into skin. Amplifies efficacy and increases systemic absorption of the entire formula. Brand does not communicate this on the product page", flag: "warn" },
      { name: "Linolenic Acid",                    note: "Omega-3 fatty acid, anti-inflammatory and barrier lipid; oxidation-sensitive - at final INCI position in a water-based formula, long-term stability should be considered", flag: "info" },
    ],
    pass_badges: ["INCI Verified", "No Phenoxyethanol", "No Synthetic Fragrance", "Published Dermatologist Test Report", "Multiple HA Forms", "GMP Certified Manufacturer"],
    warn_badges: ["PUBLIC CONCERN: Whey Protein (Dairy-Derived) in INCI vs '100% Vegan' Claim - Contradiction Not Resolved", "Tripeptide-85 Claim on Product Page: Not Found in Published INCI", "Contains Penetration Enhancer (Transcutol) - Not Disclosed to Consumers"],
    info_badges: ["Contains Penetration Enhancer (Transcutol / Diethylene Glycol Monoethyl Ether)", "4 Distinct HA Forms Found (7 Claimed)", "Ceramide NP Likely at Trace Concentration"],
    indiaContext: "Multi-weight HA serums work differently in humid vs dry climates. In India's humid monsoon conditions, lighter lower-MW HA performs better for texture. The Transcutol (penetration enhancer) in this formula increases absorption of niacinamide and other actives - this is an efficacy benefit but should be known to consumers stacking other active serums. The Whey Protein ingredient should be resolved by the brand before this product is used by consumers with dairy allergies or those purchasing it on ethical vegan grounds.",
    analyzedAt: "2026-06-02",
    category: "Serums",
    subCategory: "Hyaluronic Acid Serum",
    concernTags: ["Dehydrated Skin", "Dry Skin", "Fine Lines", "Barrier Damage"],
    suitabilityTags: ["Daily Use", "Fragrance Sensitive Users"],
    cautionTags: ["Clinical Claim Not Verified", "Active % Not Verified"],
  },

];

export const codeskinBrand: Brand = {
  name: "CodeSkin",
  slug: "codeskin",
  logo: "https://codeskin.in/cdn/shop/files/f_codeskin_icon-01.png?v=1770368822",
  tagline: "India's clean beauty innovator - 1,600+ restricted ingredients, in-house GMP formulation",
  description: "CodeSkin is a Mumbai-based brand founded by Oscar Pereira, who previously built Cheryl's Cosmeceutical (acquired by L'Oreal India in 2013). All products are formulated and manufactured in-house at Effeza Science Pvt Ltd, a GMP-certified, CDSCO-compliant facility in Mumbai. The brand positions itself around a publicly declared ingredient charter restricting more than 1,600 ingredients - more than EU cosmetics regulation requires. Their UV filter selection (next-generation photostable filters, no oxybenzone, no octocrylene, no homosalate) is technically ahead of most Indian competitors. Published test reports for multiple claims per product are an unusual and commendable transparency practice. Key gaps identified in this web review: the Hyaluronic 7+ Serum's '100% vegan' claim is directly contradicted by Whey Protein in the published INCI; Benzyl Alcohol and lemongrass essential oil in the SPF 100 sunscreen are fragrance allergens that the 'no synthetic fragrances' claim does not disclose; and Transcutol (a penetration enhancer) appears in the serum without consumer disclosure. Reviewed under the Web Evidence Review Engine - not certification. Scores reflect public evidence confidence.",
  founded: "2022",
  headquarters: "Mumbai, India",
  website: "https://codeskin.in",
  instagramHandle: "@codeskinofficial",
  nykaaUrl: "",
  avgScore: 79,
  verdict: "Good",
  products,
};
