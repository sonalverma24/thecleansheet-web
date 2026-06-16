/**
 * Nat Habit brand data
 *
 * Ingredient lists sourced from nathabit.in (verified June 2026).
 * Nat Habit uses common ingredient names (not INCI) on their website - this is a transparency limitation.
 * INCI translations are provided below each common-name ingredient.
 * Nat Habit is an Indian D2C brand founded by an IIT-IIM alumna, focused on fresh,
 * Ayurveda-inspired formulations with Ecocert-certified preservation.
 *
 * NOTE: Multi Nut Shea Omega-3 Malai contains Clove (Syzygium Aromaticum), an essential oil with
 * approximately 70-85% Eugenol content. Eugenol is among the strongest documented contact sensitisers in the
 * SCCNFP/SCCS databases and a major fragrance allergen. This is a significant risk for sensitive skin.
 */

import type { Brand, ProductScorecard } from "./types";

const BRAND_SLUG = "nat-habit";
const BRAND_NAME = "Nat Habit";

const products: ProductScorecard[] = [

  /* -------------------------------------------------
     1. Double Cocoa Intense DermaCare Body Malai (120ml)
     Source: nathabit.in/body-care/fresh-whipped-skin-malai/double-cocoa-malai
     Price: Rs.365-Rs.504
  ------------------------------------------------- */
  {
    productName: "Double Cocoa Intense DermaCare Body Malai",
    slug: "double-cocoa-intense-dermacare-body-malai",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "Rs.365-Rs.504",
    productType: "leave-on",
    concern: "Extreme dryness, barrier repair, nourishment",
    summary: "Nat Habit's Double Cocoa Body Malai is a fresh-formulated body butter using Lac (raw milk) as its base, with Cocoa Butter, Shea Butter, and a multi-oil complex including Walnut, Almond, Coconut, Sesame, and Sunflower Seed Oil alongside a pineapple bromelain enzyme for gentle surface exfoliation. The formula uses common ingredient names rather than INCI nomenclature, which means allergens such as Benzyl Alcohol in the Ecocert preservative system and Limonene in the Orange Peel Oil are not declared to the standard required under India CR 2020 or EU 1223/2009, and the undisclosed Lac (milk) allergen risk is a notable consumer transparency gap. Buyers on Nykaa and the brand's own website rate the product highly for its richness and fragrance, though some users with sensitive skin report reactions to the essential oil blend.",
    score: 61,
    scoreLabel: "Fair",
    publicDecisionLabel: "Needs proof",
    image: "https://nathabit.in/_nat/images/Double_Cocoa_KC_120_ML_9b9640ddea.jpg?format=auto&width=1920&quality=75",
    pillars: [
      {
        name: "Public INCI Safety Screen",
        score: 22,
        max: 30,
        note: "No parabens, no drying alcohols, no synthetic preservatives, and no prohibited ingredients were identified in the publicly listed formula. The Ecocert-certified preservation system (Benzyl Alcohol, Salicylic Acid, Glycerin, Sorbic Acid) is a thoughtful choice, though Benzyl Alcohol is a declared EU fragrance allergen and that is not communicated to consumers. Orange Peel Oil is high in Limonene, an EU-listed contact allergen, and Patchouli Oil carries moderate sensitisation potential. The brand does not disclose individual fragrance allergen components, which is a transparency gap for leave-on products under EU 1223/2009. Lac (raw milk) is the lead ingredient and is allergenic for milk-protein-sensitive individuals, yet no prominent milk allergen warning appears on the product listing. The formula uses common ingredient names rather than INCI throughout, which means consumers cannot independently cross-reference ingredients against safety databases."
      },
      {
        name: "Formula Logic Inference",
        score: 20,
        max: 25,
        note: "The emollient base is well-constructed for its stated purpose. Cocoa Butter and Shea Butter together form an occlusive-emollient matrix suited to extreme dryness. The multi-oil complex covers a useful range of fatty acids: linoleic acid from Walnut and Sunflower Seed Oils supports barrier function, lauric acid from Coconut Oil provides mild antimicrobial activity, and oleic acid from Almond and Sesame Oils adds skin-softening properties. Pineapple extract is a genuine source of bromelain, a proteolytic enzyme with mild exfoliation activity appropriate for a leave-on body product. The Ecocert preservative system is identifiable and appropriate for the formula type. The use of common names throughout, rather than INCI, makes it harder to confirm the exact preservation blend, though the Geogard/Nipaguard combination is widely recognised. No obvious formula logic conflicts were found."
      },
      {
        name: "Public Claim Support",
        score: 10,
        max: 25,
        note: "The 48-hour moisture claim is plausible given the occlusive and emollient base, but no published clinical or consumer study supports the specific duration. The term DermaCare in the product name is an unregulated marketing descriptor with no regulatory definition in India; it implies a dermatological endorsement that has not been publicly substantiated. The brand uses common ingredient names rather than INCI across the entire product listing, which means consumers cannot independently verify what they are applying. The Lac (milk) allergen is not prominently disclosed. No published clinical data, patch test study, preservative efficacy result, or third-party lab report was found publicly accessible."
      },
      {
        name: "Test Result Transparency",
        score: 6,
        max: 15,
        evidenceGrade: "C",
        note: "No published clinical data, lab test report, dermatologist study, or preservative efficacy result was found in any publicly accessible location, including the brand website, Nykaa listing, or third-party databases. The brand mentions fresh-batch production and Ecocert-certified preservation, which indicates some quality process thinking, but these are process claims rather than published test outcomes. Without a lab name, method, test date, or result summary, the transparency grade is C. The missing proof list below details what public evidence would move this score higher."
      },
      {
        name: "Consumer Clarity",
        score: 3,
        max: 5,
        note: "Application instructions and a frequency guidance note (daily use) are present on the product page. However, there is no milk allergen warning for consumers with dairy sensitivity, no guidance on patch testing for individuals with fragrance or essential oil sensitivity, and no honest caveat about the Benzyl Alcohol or Limonene allergen content of the preservative and fragrance system. The absence of these warnings on a leave-on body product with multiple known allergens is a meaningful clarity gap."
      },
    ],
    globalScreen: {
      eu_1223_2009: "Potential concern found - Orange Peel Oil (Limonene, EU allergen undisclosed); Benzyl Alcohol in preservative (EU allergen undisclosed); fragrance allergen breakdown absent for leave-on product",
      india_cr_2020: "Potential concern found - brand uses common ingredient names instead of INCI nomenclature; does not meet India CR 2020 labelling standards",
      health_canada_hotlist: "No obvious public red flag found",
      canada_nhpid: "Triggered - botanical and essential oil ingredients present (Walnut Oil, Almond Oil, Coconut Oil, Sesame Oil, Sunflower Oil, Patchouli Oil, Orange Peel Oil)",
      tga_australia: "Not triggered",
      us_fda_21cfr: "No obvious public red flag found",
      korea_mfds: "No obvious public red flag found",
      aicis_australia: "No obvious public red flag found",
      echa_svhc: "No obvious public red flag found",
      iarc: "No obvious carcinogenicity flag found"
    },
    inciCompleteness: {
      status: "Partial",
      flags: [
        "Brand uses common ingredient names instead of INCI nomenclature - does not meet India CR 2020 or EU 1223/2009 labelling standards"
      ]
    },
    keyActives: [
      {
        name: "Lac (Raw Milk)",
        function: "Milk proteins, lactic acid for mild exfoliation, and fats; skin nourishing and softening base with Ayurvedic tradition",
        concentrationConfidence: "High"
      },
      {
        name: "Theobroma Cacao Seed Butter",
        function: "Occlusive emollient; oleic and stearic esters for barrier repair and moisturisation",
        concentrationConfidence: "Medium"
      },
      {
        name: "Butyrospermum Parkii (Shea) Butter",
        function: "Emollient; barrier-supportive oleic and stearic acids",
        concentrationConfidence: "Medium"
      },
      {
        name: "Ananas Comosus (Pineapple) Fruit Extract",
        function: "Bromelain enzyme source; provides gentle proteolytic surface exfoliation appropriate for a leave-on body product",
        concentrationConfidence: "Low"
      },
      {
        name: "Juglans Regia (Walnut) Oil",
        function: "High omega-3 (alpha-linolenic acid) and linoleic acid; supports skin barrier function",
        concentrationConfidence: "Medium"
      },
    ],
    ingredients: [
      { name: "Lac (Raw Milk)",                              note: "Milk proteins, lactic acid, and fats. Allergenic for milk-protein-sensitive individuals. Not vegan.",    flag: "warn" },
      { name: "Theobroma Cacao (Cocoa) Powder",             note: "Ground cocoa with mild antioxidant and natural colorant properties.",                                   flag: "ok"   },
      { name: "Theobroma Cacao (Cocoa) Seed Butter",        note: "Occlusive emollient butter for barrier repair.",                                                        flag: "ok"   },
      { name: "Butyrospermum Parkii (Shea) Butter",         note: "Emollient rich in oleic and stearic esters.",                                                          flag: "ok"   },
      { name: "Coffea Arabica (Coffee) Seed Extract",       note: "Caffeine antioxidant with mild stimulant properties.",                                                  flag: "ok"   },
      { name: "Juglans Regia (Walnut) Seed Oil",            note: "High omega-3 and linoleic acid; supports barrier function.",                                            flag: "ok"   },
      { name: "Prunus Amygdalus Dulcis (Sweet Almond) Oil", note: "High oleic acid emollient.",                                                                            flag: "ok"   },
      { name: "Cocos Nucifera (Coconut) Oil",               note: "Lauric acid emollient with mild antimicrobial activity.",                                               flag: "ok"   },
      { name: "Sesamum Indicum (Sesame) Seed Oil",          note: "Emollient with sesamol antioxidant content.",                                                           flag: "ok"   },
      { name: "Helianthus Annuus (Sunflower) Seed Oil",     note: "High linoleic acid; supports skin barrier.",                                                            flag: "ok"   },
      { name: "Sesamum Indicum (Sesame) Seed Paste",        note: "Concentrated sesame for additional emolliency.",                                                        flag: "ok"   },
      { name: "Caprylic/Capric Triglyceride (CCTG)",        note: "Coconut-derived lightweight emollient. Listed on pack as 'CCTG (coconut derived)'.",                   flag: "ok"   },
      { name: "Ananas Comosus (Pineapple) Fruit Extract",   note: "Bromelain enzyme source; gentle proteolytic exfoliation.",                                             flag: "ok"   },
      { name: "Citrus Sinensis (Orange) Peel Oil",          note: "Fragrance ingredient. High in Limonene, an EU-listed contact allergen. Moderate sensitisation potential in leave-on products.", flag: "warn" },
      { name: "Rosmarinus Officinalis (Rosemary) Leaf Extract", note: "Natural antioxidant used as a formula stabiliser.",                                                flag: "ok"   },
      { name: "Cera Alba (Beeswax)",                        note: "Wax emollient and structuring agent. Not vegan.",                                                       flag: "info" },
      { name: "Stearyl Alcohol (Stearyl Wax)",              note: "Fatty alcohol used as emollient and thickener.",                                                        flag: "ok"   },
      { name: "Geogard/Nipaguard (Ecocert)",                note: "Ecocert-certified preservation system containing Benzyl Alcohol, Salicylic Acid, Glycerin, and Sorbic Acid. Benzyl Alcohol is an EU-listed fragrance allergen, not separately declared on the label.", flag: "info" },
      { name: "Vanilla Planifolia (Vanilla) Fruit Extract", note: "Fragrance and antioxidant; generally well-tolerated.",                                                  flag: "ok"   },
      { name: "Pogostemon Cablin (Patchouli) Leaf Oil",     note: "Essential oil used for fragrance. Sesquiterpene content carries moderate sensitisation potential for sensitive skin.", flag: "warn" },
      { name: "Nelumbo Nucifera (Lotus) Flower Extract",    note: "Antioxidant and soothing botanical.",                                                                   flag: "ok"   },
      { name: "Aqua",                                       note: "Water base.",                                                                                           flag: "ok"   },
    ],
    claimsCheck: [
      {
        claim: "48-hour moisture",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "The occlusive and emollient base makes the moisture claim plausible, but no published clinical or consumer study confirming the 48-hour duration was found in any publicly accessible location."
      },
      {
        claim: "DermaCare (in product name)",
        evidenceStatus: "Missing",
        decision: "Not publicly supported",
        note: "DermaCare is an unregulated marketing descriptor; it implies a dermatological standard or endorsement that has not been publicly defined or substantiated by any test report or certification."
      },
      {
        claim: "Fresh formulation with Ecocert-certified preservation",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "The Ecocert certification for the Geogard/Nipaguard preservative system is credible, but no publicly accessible batch freshness data, production date range, or third-party Ecocert certificate was found on the brand website."
      },
      {
        claim: "Suitable for extreme dryness and barrier repair",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "The ingredient profile of Cocoa Butter, Shea Butter, and a multi-oil complex is consistent with an emollient barrier-support formula, but no finished product clinical evidence for this specific benefit was publicly published."
      }
    ],
    missingProof: [
      "No published preservative efficacy test result (ISO 11930:2019) is publicly accessible. Independent challenge testing would confirm the Ecocert preservation system is adequate for the formula's water-containing base.",
      "No milk allergen warning appears on the product listing or packaging photography on the brand website, despite Lac (raw milk) being the lead ingredient. A prominent allergen declaration would protect milk-sensitive consumers.",
      "The fragrance allergen breakdown for Orange Peel Oil (Limonene) and Benzyl Alcohol from the preservative system is not disclosed on the product page. Under EU 1223/2009, these must be declared by name in leave-on products above threshold concentrations.",
      "No clinical or consumer study supporting the specific '48-hour moisture' duration claim is publicly available. A published study with method, sample size, and result would substantiate this specific claim.",
      "INCI nomenclature is absent throughout the ingredient list. Publishing the full INCI list alongside common names would bring the product into alignment with India CR 2020 and EU 1223/2009 labelling standards."
    ],
    pass_badges: ["Ecocert Preserved", "No Parabens", "No Drying Alcohols", "No Synthetic Preservatives"],
    warn_badges: ["Fragrance Allergens Present", "Contains Milk (Lac) - allergen not prominently declared", "Patchouli Essential Oil (sensitisation risk)", "Claim Not Publicly Substantiated"],
    info_badges: ["Not vegan - contains Lac (raw milk) and Cera Alba (beeswax)", "Ingredient list uses common names, not INCI - regulatory transparency gap", "Canada NHPID Relevant", "Ayurveda-Aligned"],
    indiaContext: "Nat Habit occupies a premium-natural niche in Indian body care, and the Double Cocoa formula is particularly suited to Indian winters in North India (Delhi, Punjab, Rajasthan) where extreme seasonal dryness is a common concern. The Lac (raw milk) base aligns with long-standing Ayurvedic skincare traditions of malai and milk application, which gives this product cultural resonance. However, India CR 2020 requires INCI nomenclature on cosmetic labels, and the brand's use of common names does not meet this standard, which limits the ability of Indian consumers to cross-reference ingredients against safety databases or allergy records. For Fitzpatrick III-V skin types prevalent in India, the essential oil blend carries sensitisation risk that warrants a patch test before first use.",
    cleanSheetNote: "This assessment is based only on publicly available INCI, claims, and test evidence. It is not a full Clean Sheet certification. Full certification requires confidential formula review, exact concentrations, supplier documentation, manufacturing records, packaging compatibility, preservative efficacy, stability, and complete claim validation.",
    analyzedAt: "2026-06-10",
    category: "Body Care",
    subCategory: "Body Butter",
    price: 365,
    sizeValue: 120,
    sizeUnit: "ml",
    pricePerUnit: 3.04,
    skinTypeTags: ["dry", "normal"],
    concernTags: ["Extreme Dryness", "Moisturisation", "Barrier Repair"],
    suitabilityTags: ["Dry Skin", "Normal Skin", "Skincare Beginners"],
    cautionTags: ["Contains Milk (Lac) - avoid if milk-allergic", "Patchouli Oil - sensitiser risk", "Orange Peel Oil - Limonene allergen"],
    routineSlot: "PM",
    fragranceStatus: "essential-oil",
    alcoholStatus: "free",
    certificationStatus: "not-certified",
    claimsMade: ["48-hour moisture", "Extreme dryness relief", "DermaCare"],
    claimsVerified: ["Deep moisturisation - cocoa butter, shea butter, and multi-oil base is consistent with extreme dryness relief"],
    claimsNotVerified: ["DermaCare - unregulated marketing descriptor without substantiation", "48-hour moisture duration - plausible but not publicly tested"],
    availabilitySources: ["nathabit.in", "Nykaa"],
  },

  /* -------------------------------------------------
     2. Multi Nut Shea Omega-3 Body Malai (120ml)
     Source: nathabit.in/body-care/fresh-whipped-skin-malai/multi-nut-shea-omega-3-malai
     Price: Rs.345-Rs.669
  ------------------------------------------------- */
  {
    productName: "Multi Nut Shea Omega-3 Body Malai",
    slug: "multi-nut-shea-omega-3-body-malai",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "Rs.345-Rs.669",
    productType: "leave-on",
    concern: "Moisturisation, dry skin, body acne",
    summary: "Nat Habit's Multi Nut Shea Omega-3 Body Malai is a fresh-formulated body butter combining Shea Butter, Walnut, Almond, Coconut, Sesame, and Sunflower Seed Oil with a Lac (raw milk) base, where the omega-3 claim is tied to the alpha-linolenic acid in walnut oil. The formula contains Clove Oil (Syzygium Aromaticum), an essential oil with approximately 70 to 85 percent Eugenol content; Eugenol is among the strongest documented contact sensitisers in SCCNFP and SCCS scientific databases and a declared EU priority fragrance allergen, yet this risk is not disclosed on the Nat Habit product listing for a leave-on body product applied to large skin surface areas. The brand uses common ingredient names rather than INCI nomenclature throughout, which means consumers cannot independently verify ingredients against safety databases, and the body acne benefit claim is in tension with the presence of Coconut Oil, which carries a moderate comedogenic rating.",
    score: 53,
    scoreLabel: "Fair",
    publicDecisionLabel: "Needs proof",
    image: "https://nathabit.in/_nat/images/multi_nut_1_e39abd3b48.jpg?format=auto&width=1920&quality=75",
    pillars: [
      {
        name: "Public INCI Safety Screen",
        score: 19,
        max: 30,
        note: "Significant sensitisation concern: Clove Oil (Syzygium Aromaticum) contains approximately 70 to 85 percent Eugenol. Eugenol is classified as a priority fragrance allergen by the EU under Regulation 1223/2009 and must be declared by name in leave-on products above threshold concentrations. Repeated leave-on application to large body surface areas, as intended for a body butter, meaningfully increases sensitisation risk. Sensitisation to Eugenol, once established, is permanent. The Nat Habit product listing does not disclose this risk or flag Clove Oil as a sensitiser. Rose Oil (Rosa Damascena) additionally contains Citronellol and Geraniol, both EU-listed fragrance allergens. The Ecocert preservative system contributes Benzyl Alcohol, another EU allergen, also undisclosed separately. Lac (raw milk) is the lead ingredient and is allergenic for milk-sensitive individuals, with no prominent allergen warning on the product page. The formula uses common ingredient names rather than INCI, preventing independent ingredient cross-referencing. No prohibited ingredients, no parabens, and no drying alcohols were identified."
      },
      {
        name: "Formula Logic Inference",
        score: 18,
        max: 25,
        note: "The multi-oil base is well-constructed for a moisturising body product. Shea Butter provides oleic and stearic acid for barrier repair. Walnut Oil is a genuine source of alpha-linolenic acid (ALA, omega-3) and linoleic acid, with documented relevance for skin barrier support and anti-inflammatory properties, making the omega-3 positioning credible at the formula level. Almond Oil adds oleic acid emolliency, Sesame Oil provides antioxidant sesamol, and Sunflower Seed Oil contributes high linoleic acid for barrier function. Coconut Oil adds lauric acid with mild antimicrobial activity, which is cited in support of the body acne claim. However, Coconut Oil carries a moderate comedogenic rating, which is a formula logic conflict for a product making a body acne benefit claim. The Ecocert preservation system is identifiable and appropriate for the formula type."
      },
      {
        name: "Public Claim Support",
        score: 9,
        max: 25,
        note: "The omega-3 claim is credible at the ingredient level, as walnut oil is a documented source of ALA. The 48-hour moisture claim is plausible for a Shea Butter and multi-oil base but is not supported by any published clinical or consumer study in a publicly accessible location. The body acne benefit claim is partially supported by coconut oil's lauric acid antimicrobial properties, but Coconut Oil is also comedogenic, which creates a direct contradiction within the formula for acne-prone skin. The Clove Oil sensitisation risk is not disclosed on the product page, which is a consumer safety gap in the claims and transparency picture. Common ingredient names are used throughout rather than INCI, limiting independent verification."
      },
      {
        name: "Test Result Transparency",
        score: 5,
        max: 15,
        evidenceGrade: "D",
        note: "No published clinical data, dermatologist study, patch test result, preservative efficacy test, or lab report was found in any publicly accessible source, including the brand website, Nykaa listing, or third-party databases. The brand references natural formulation and Ecocert-certified preservation, which indicates process quality thinking, but these are process descriptors rather than test outcomes. The absence of any supporting study or report for the body acne claim, omega-3 skin benefit claim, or moisture duration claim means there is a test claim implied by the product positioning but nothing supporting it visible publicly. The transparency grade is D."
      },
      {
        name: "Consumer Clarity",
        score: 2,
        max: 5,
        note: "Application instructions are present. However, the Clove Oil sensitisation risk is not flagged anywhere on the product listing, which is a significant failure of consumer clarity for a leave-on product applied to large skin surface areas. No milk allergen warning is provided despite Lac being the lead ingredient. No patch test guidance is given. No skin type caveat or warning for eczema-prone or fragrance-sensitive individuals is included. The absence of these communications on a product with multiple known allergens and a high-Eugenol essential oil is a meaningful consumer clarity gap."
      },
    ],
    globalScreen: {
      eu_1223_2009: "Potential concern found - Clove Oil (Eugenol, EU priority allergen, undisclosed in leave-on product); Rose Oil (Citronellol, Geraniol, EU allergens undisclosed); Benzyl Alcohol in preservative (EU allergen undisclosed); fragrance allergen breakdown absent",
      india_cr_2020: "Potential concern found - brand uses common ingredient names instead of INCI nomenclature; does not meet India CR 2020 labelling standards",
      health_canada_hotlist: "No obvious public red flag found",
      canada_nhpid: "Triggered - botanical and essential oil ingredients present (Walnut Oil, Almond Oil, Coconut Oil, Sesame Oil, Sunflower Oil, Clove Oil, Rose Oil)",
      tga_australia: "Not triggered",
      us_fda_21cfr: "No obvious public red flag found",
      korea_mfds: "No obvious public red flag found",
      aicis_australia: "No obvious public red flag found",
      echa_svhc: "No obvious public red flag found",
      iarc: "No obvious carcinogenicity flag found"
    },
    inciCompleteness: {
      status: "Partial",
      flags: [
        "Brand uses common ingredient names instead of INCI nomenclature - does not meet India CR 2020 or EU 1223/2009 labelling standards"
      ]
    },
    keyActives: [
      {
        name: "Lac (Raw Milk)",
        function: "Milk proteins, lactic acid for mild exfoliation, and lipids; skin nourishing base with Ayurvedic alignment",
        concentrationConfidence: "High"
      },
      {
        name: "Butyrospermum Parkii (Shea) Butter",
        function: "Dominant emollient; oleic and stearic esters for barrier repair and moisturisation",
        concentrationConfidence: "High"
      },
      {
        name: "Juglans Regia (Walnut) Oil",
        function: "High ALA omega-3 and linoleic acid; supports skin barrier function and has documented anti-inflammatory relevance",
        concentrationConfidence: "Medium"
      },
      {
        name: "Cocos Nucifera (Coconut) Oil",
        function: "Lauric acid with mild antimicrobial activity; cited in support of body acne claim, though comedogenic rating is a noted formula conflict",
        concentrationConfidence: "Medium"
      },
      {
        name: "Helianthus Annuus (Sunflower) Seed Oil",
        function: "High linoleic acid; supports skin barrier",
        concentrationConfidence: "Medium"
      },
    ],
    ingredients: [
      { name: "Lac (Raw Milk)",                              note: "Milk base with lactic acid, proteins, and lipids. Allergenic for milk-sensitive individuals. Not vegan.",       flag: "warn" },
      { name: "Butyrospermum Parkii (Shea) Butter",         note: "Dominant emollient rich in oleic and stearic esters.",                                                           flag: "ok"   },
      { name: "Juglans Regia (Walnut) Seed Oil",            note: "High omega-3 (ALA) and linoleic acid; supports barrier function.",                                               flag: "ok"   },
      { name: "Prunus Amygdalus Dulcis (Sweet Almond) Oil", note: "Oleic acid emollient.",                                                                                          flag: "ok"   },
      { name: "Cocos Nucifera (Coconut) Oil",               note: "Lauric acid with mild antimicrobial activity. Moderate comedogenic rating is a noted concern for acne-prone skin.", flag: "ok" },
      { name: "Sesamum Indicum (Sesame) Seed Oil",          note: "Emollient with sesamol antioxidant content.",                                                                     flag: "ok"   },
      { name: "Helianthus Annuus (Sunflower) Seed Oil",     note: "High linoleic acid; supports skin barrier.",                                                                      flag: "ok"   },
      { name: "Sesamum Indicum (Sesame) Seed Paste",        note: "Concentrated sesame for additional emolliency.",                                                                  flag: "ok"   },
      { name: "Caprylic/Capric Triglyceride (CCTG)",        note: "Coconut-derived lightweight emollient.",                                                                          flag: "ok"   },
      { name: "Syzygium Aromaticum (Clove) Bud/Leaf Oil",  note: "Essential oil containing approximately 70 to 85 percent Eugenol. Eugenol is a documented EU priority fragrance allergen and among the strongest contact sensitisers in the SCCS database. Sensitisation risk is elevated in leave-on products applied to large body surface areas. Not disclosed as a sensitiser on the product page.", flag: "warn" },
      { name: "Rosmarinus Officinalis (Rosemary) Leaf Extract", note: "Natural antioxidant used as a formula stabiliser.",                                                          flag: "ok"   },
      { name: "Cera Alba (Beeswax)",                        note: "Wax emollient and structuring agent. Not vegan.",                                                                 flag: "info" },
      { name: "Stearyl Alcohol (Stearyl Wax)",              note: "Fatty alcohol used as emollient and thickener.",                                                                  flag: "ok"   },
      { name: "Geogard/Nipaguard (Ecocert)",                note: "Ecocert-certified preservation system containing Benzyl Alcohol, Salicylic Acid, Glycerin, and Sorbic Acid. Benzyl Alcohol is an EU-listed fragrance allergen, not separately declared on the label.", flag: "info" },
      { name: "Vanilla Planifolia (Vanilla) Fruit Extract", note: "Fragrance ingredient; generally well-tolerated.",                                                                 flag: "ok"   },
      { name: "Rosa Damascena (Rose) Flower Oil",           note: "Fragrance and antioxidant botanical. Contains Citronellol and Geraniol, both EU-listed fragrance allergens, not separately declared.", flag: "warn" },
      { name: "Aqua",                                       note: "Water base.",                                                                                                     flag: "ok"   },
    ],
    claimsCheck: [
      {
        claim: "Omega-3 for skin",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "Walnut oil is a credible source of ALA omega-3 at the ingredient level, but no published finished product study confirming the omega-3 skin benefit at the concentration used in this formula was found publicly."
      },
      {
        claim: "48-hour moisture lock",
        evidenceStatus: "Missing",
        decision: "Not publicly supported",
        note: "The emollient base makes long-duration moisturisation plausible, but no clinical or consumer study confirming the specific 48-hour claim was found in any publicly accessible location."
      },
      {
        claim: "Body acne benefit",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "Coconut oil's lauric acid has mild antimicrobial properties relevant to acne, but Coconut Oil also carries a moderate comedogenic rating, which directly contradicts an acne benefit claim, and no finished product test supporting this benefit was found."
      },
      {
        claim: "Safe for daily use on large body surface areas",
        evidenceStatus: "Missing",
        decision: "Not publicly supported",
        note: "Clove Oil's high Eugenol content is a known sensitisation risk for leave-on products on large skin areas, and this risk is not disclosed, meaning the implicit safety claim for daily leave-on body use is not publicly supported."
      }
    ],
    missingProof: [
      "The Clove Oil sensitisation risk (approximately 70 to 85 percent Eugenol) is not disclosed anywhere on the product listing. A consumer-facing fragrance allergen warning is needed before this product can be considered adequately transparent for leave-on body use.",
      "No published preservative efficacy test result (ISO 11930:2019) is publicly accessible. Challenge testing would confirm the Ecocert system is adequate for a water-containing leave-on body butter.",
      "No milk allergen declaration appears on the product page despite Lac being the lead ingredient. A prominent allergen warning is required for consumers with milk protein sensitivity.",
      "The fragrance allergen components from Clove Oil (Eugenol), Rose Oil (Citronellol, Geraniol), and the preservative system (Benzyl Alcohol) are not individually declared. Under EU 1223/2009, these must be named in leave-on products above threshold concentrations.",
      "No clinical, patch test, or consumer study supporting the body acne benefit claim is publicly available. Given the presence of a comedogenic ingredient (Coconut Oil), this claim requires visible supporting evidence to be credible.",
      "INCI nomenclature is absent throughout. Publishing a full INCI list alongside common names would bring the product into alignment with India CR 2020 and EU 1223/2009 labelling standards."
    ],
    pass_badges: ["Ecocert Preserved", "No Parabens", "No Drying Alcohols", "No Synthetic Preservatives"],
    warn_badges: ["Fragrance Allergens Present", "Irritant Risk", "Contains Milk (Lac) - allergen not declared", "Claim Not Publicly Substantiated"],
    info_badges: ["Not vegan - contains Lac (raw milk) and Cera Alba (beeswax)", "Ingredient list uses common names, not INCI - regulatory transparency gap", "Canada NHPID Relevant", "Ayurveda-Aligned"],
    indiaContext: "The Multi Nut Shea Malai is popular on nathabit.in for its naturally-sourced multi-oil profile and omega-3 positioning, and walnut, almond, and sunflower oils are familiar and trusted in Indian skincare traditions. However, Clove Oil is a significant sensitisation concern for Indian consumers: Fitzpatrick III-V skin types, which are most prevalent in India, can be more reactive to contact sensitisers, and the application of a high-Eugenol essential oil to large body surface areas (arms, legs, torso) substantially increases cumulative exposure. Consumers with any history of eczema, atopic dermatitis, or fragrance sensitivity should not use this product without medical advice. The lack of INCI naming makes it difficult for Indian consumers to research individual ingredients independently, which is not aligned with India CR 2020 labelling standards.",
    cleanSheetNote: "This assessment is based only on publicly available INCI, claims, and test evidence. It is not a full Clean Sheet certification. Full certification requires confidential formula review, exact concentrations, supplier documentation, manufacturing records, packaging compatibility, preservative efficacy, stability, and complete claim validation.",
    analyzedAt: "2026-06-10",
    category: "Body Care",
    subCategory: "Body Butter",
    price: 345,
    sizeValue: 120,
    sizeUnit: "ml",
    pricePerUnit: 2.88,
    skinTypeTags: ["normal", "dry"],
    concernTags: ["Dry Skin", "Moisturisation"],
    suitabilityTags: ["Dry Skin", "Normal Skin", "Skincare Beginners"],
    cautionTags: ["Clove Oil - major sensitiser (Eugenol)", "Contains Milk (Lac) - avoid if milk-allergic", "Rose Oil - Citronellol and Geraniol allergens"],
    routineSlot: "PM",
    fragranceStatus: "essential-oil",
    alcoholStatus: "free",
    certificationStatus: "not-certified",
    claimsMade: ["48-hour moisture lock", "Omega-3 for skin barrier", "Body acne benefit"],
    claimsVerified: ["Moisturisation - shea butter and multi-oil base is consistent with a moisturising body product", "Omega-3 content at ingredient level - walnut oil contains credible ALA levels"],
    claimsNotVerified: ["Body acne benefit - Coconut Oil comedogenicity contradicts this claim", "48-hour moisture duration - plausible but not publicly tested"],
    availabilitySources: ["nathabit.in", "Nykaa"],
  },

];

export const natHabitBrand: Brand = {
  name: BRAND_NAME,
  slug: BRAND_SLUG,
  logo: "https://nathabit.in/_nat/images/Double_Cocoa_KC_120_ML_9b9640ddea.jpg?format=auto&width=1920&quality=75",
  tagline: "Fresh from nature, made for you",
  description: "Nat Habit is an Indian D2C skincare brand founded by Swagatika Das (IIT Delhi, IIM Calcutta alumna) with a focus on fresh, Ayurveda-inspired formulations. The brand makes products in small batches and uses an Ecocert-certified preservation system (Geogard/Nipaguard) instead of synthetic preservatives. Nat Habit uses common ingredient names rather than INCI nomenclature on its packaging and website. Products are sold through nathabit.in and Nykaa. The brand has a loyal following among Indian consumers seeking natural alternatives to mainstream body care.",
  founded: "2019",
  headquarters: "Delhi, India",
  website: "https://nathabit.in",
  instagramHandle: "@nathabit.in",
  nykaaUrl: "https://www.nykaa.com/brands/nat-habit/c/10075",
  avgScore: Math.round(products.reduce((sum, p) => sum + p.score, 0) / products.length),
  verdict: "Nat Habit's body malai formulas use genuinely natural, multi-oil emollient bases with Ecocert preservation, which is a thoughtful approach for consumers seeking to avoid synthetic ingredients. The Double Cocoa formula is the stronger choice: rich emolliency with no major sensitisation concerns beyond Patchouli Oil and Orange Peel Oil. The Multi Nut Shea formula has a significant safety concern with Clove Oil containing approximately 70 to 85 percent Eugenol, a major sensitiser in a leave-on product applied to large body areas. Neither formula uses INCI nomenclature, which limits consumer transparency and does not meet India CR 2020 labelling standards.",
  products,
};
