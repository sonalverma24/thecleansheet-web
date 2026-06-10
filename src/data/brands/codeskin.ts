/**
 * CodeSkin brand data
 *
 * Review type:    Web Evidence Review (public information only)
 * Engine:         The Clean Sheet 5-Pillar Public Evidence Score
 * Scoring:        Public evidence confidence (not certification)
 * Review date:    June 2026
 *
 * Pillar weights (standard 5-pillar framework):
 *   Pillar 1: Public INCI Safety Screen    30 pts
 *   Pillar 2: Formula Logic Inference      25 pts
 *   Pillar 3: Public Claim Support         25 pts
 *   Pillar 4: Test Result Transparency     15 pts
 *   Pillar 5: Consumer Clarity              5 pts
 *   Total:                                100 pts
 *
 * Evidence bands:
 *   85-100  Strong public evidence
 *   70-84   Mostly credible with gaps
 *   50-69   Needs proof
 *   30-49   Weak public evidence
 *   Below 30  High opacity or concern
 *
 * Disclaimer: This review uses only publicly available information:
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
     Scored under: 5-Pillar Public Evidence Score (June 2026)
  ------------------------------------------------- */
  {
    productName: "UltraProtect Fluid Sunscreen SPF 100 PA++++",
    slug: "ultraprotect-fluid-sunscreen-spf100",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹500-₹1,000",
    productType: "sunscreen",
    concern: "Broad-spectrum sun protection, pigmentation, outdoor use",
    summary: "A penta-filter chemical sunscreen using five EU-approved next-generation UV filters (Tinosorb M, Tinosorb S, Uvinul A Plus, Uvinul T150, Neo Heliopan AP), none of which are Oxybenzone, Octinoxate, Homosalate, or Octocrylene. The SPF 100 and PA++++ values are backed by published test reports on the brand website, which is meaningfully more public evidence than most Indian sunscreens provide. Two ingredients in this leave-on daily formula carry fragrance allergen flags: Benzyl Alcohol is an EU-listed fragrance allergen under EU Regulation 2023/1545, and Cymbopogon Flexuosus Leaf Oil (lemongrass) is a natural fragrance source containing Citral, also a recognised allergen. The brand accurately states it uses no synthetic fragrances, but this product is not fragrance-free. The 12-hour protection claim references a French clinical study that is not publicly accessible.",
    score: 76,
    scoreLabel: "Good",
    publicDecisionLabel: "Mostly credible with gaps",
    image: "https://cdn.shopify.com/s/files/1/0649/1403/0635/files/white_bg_protect_21662db3-8cbb-4597-b6ae-fcdf816a8208.png?v=1768222951",
    pillars: [
      {
        name: "Public INCI Safety Screen",
        score: 24, max: 30,
        note: "The full ingredient list is publicly available on codeskin.in. All five UV filters are newer-generation, photostable, and approved under EU and Indian cosmetics regulations. None of the problematic filters found in many Indian sunscreens are present: no Oxybenzone, no Octinoxate, no Homosalate, no Octocrylene. This filter selection is genuinely better than most Indian sunscreens on the market. Two fragrance-related concerns are visible from the public ingredient list. Benzyl Alcohol is used here as a preservation booster but is also an EU-listed fragrance allergen under EU Regulation 2023/1545. In a daily leave-on sunscreen applied across the full face, this allergen status warrants disclosure for fragrance-sensitive consumers. Cymbopogon Flexuosus Leaf Oil (lemongrass essential oil) contains Citral, a recognised fragrance allergen and potential photosensitiser on a leave-on formula exposed to sunlight. The brand's claim of no synthetic fragrances is technically accurate, but natural fragrance sources carry the same sensitisation risk as synthetic ones. These are not disqualifying concerns at normal sunscreen concentrations, but they are not apparent from the brand's own claims alone.",
      },
      {
        name: "Formula Logic Inference",
        score: 21, max: 25,
        note: "The formula structure is consistent with a high-performance multi-filter chemical sunscreen. Five UV filters covering different wavelength ranges provide broad-spectrum coverage with photostability built in. Tinosorb M and Tinosorb S are among the most photostable UV filters available globally and are not available in the US market. Niacinamide appears fairly early in the ingredient list, before several minor emollients and botanicals, suggesting a meaningful concentration relevant for its anti-inflammatory and anti-pigmentation benefit. The preservation system uses Sodium Levulinate, Potassium Sorbate, Sodium Benzoate, Benzyl Alcohol, and Glyceryl Caprylate, a phenoxyethanol-free system consistent with the brand's declared formulation charter. One formulation note: Potassium Sorbate and Sodium Benzoate are most effective at a pH below 5, and sunscreen formulas are typically formulated at higher pH values. The multi-component preservation system likely compensates, but pH is not publicly disclosed. The formula's packaging (described as a fluid) is appropriate for sunscreen.",
      },
      {
        name: "Public Claim Support",
        score: 17, max: 25,
        note: "CodeSkin publishes more public test evidence than most Indian brands. The SPF 100 and PA++++ values are supported by a published SPF test report. Non-comedogenic, dermatologist tested, ophthalmologist tested, water and sweat resistance, and moisturisation all have corresponding test reports in the brand's Proof of the Code section. These represent a substantially stronger evidence base than the unsubstantiated badge claims that are standard in the Indian market. Two claims remain unverified from public evidence. The 12-hour protection claim references a French clinical study, but the full study details including method, subject count, setting, and scope are not publicly accessible and cannot be verified. The SPF 100 claim is also unusual: no standardised ISO or BIS method has been publicly confirmed for SPF values this high, and the FDA caps SPF claims at 50+ in the US market (though India and EU do not impose the same cap). The brand's no synthetic fragrances positioning is accurate, but Benzyl Alcohol and lemongrass essential oil are fragrance allergens that consumers may not expect in a product marketed with that language.",
      },
      {
        name: "Test Result Transparency",
        score: 11, max: 15,
        evidenceGrade: "B",
        note: "The full ingredient list is publicly accessible on the brand website. CodeSkin publishes individual test report images for SPF, non-comedogenic, dermatologist tested, ophthalmologist tested, and sweat resistance, which is an unusually high level of public evidence for an Indian brand of this scale. The brand also makes its GMP manufacturing certificate publicly accessible. This earns a Grade B: test results and lab outputs are visible, but full study documentation including method details, subject counts, batch identifiers, and dates is not fully accessible for all reported tests. No specific allergen warnings are published for Benzyl Alcohol or lemongrass oil despite their presence in a daily leave-on product. No batch or expiry traceability is publicly visible.",
      },
      {
        name: "Consumer Clarity",
        score: 3, max: 5,
        note: "Basic application instructions are provided on the product page. The brand gives clear guidance on the product's purpose and SPF level. However, reapplication frequency guidance (every two hours in active sun, regardless of the 12-hour claim) is not clearly communicated, which is a meaningful gap for a sunscreen. No specific fragrance allergen warning is given despite Benzyl Alcohol and lemongrass oil being present in a daily leave-on formula. No skin type suitability guidance is provided to help consumers with fragrance sensitivity or atopic skin understand whether this product is appropriate for them.",
      },
    ],
    globalScreen: {
      eu_1223_2009: "No obvious public red flag found",
      india_cr_2020: "No obvious public red flag found",
      health_canada_hotlist: "No obvious public red flag found",
      canada_nhpid: "Not triggered",
      tga_australia: "Not triggered",
      us_fda_21cfr: "No obvious public red flag found",
      korea_mfds: "No obvious public red flag found",
      aicis_australia: "No obvious public red flag found",
      echa_svhc: "No obvious public red flag found",
      iarc: "No obvious carcinogenicity flag found",
    },
    inciCompleteness: {
      status: "Full INCI on brand PDP",
      flags: [
        "Benzyl Alcohol listed as preservative booster but also an EU-listed fragrance allergen (EU Reg 2023/1545) not separately disclosed",
        "Cymbopogon Flexuosus Leaf Oil (lemongrass) contains Citral, an EU-listed fragrance allergen, not separately flagged on the PDP",
        "Formula pH not publicly disclosed",
        "Niacinamide concentration not explicitly stated (brand states position-inferred)",
      ],
    },
    claimsCheck: [
      {
        claim: "SPF 100 PA++++",
        evidenceStatus: "Evidence visible",
        decision: "Publicly supported",
        note: "A published SPF test report is accessible on the brand website, which confirms testing was conducted. The SPF 100 value is unusually high and no standardised ISO method above SPF 50+ is publicly confirmed, but the test report is more evidence than most Indian sunscreens provide.",
      },
      {
        claim: "12-hour protection",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "The brand references a French clinical study for this claim, but the full study including method, subject count, setting, and result scope is not publicly accessible and cannot be verified from available public evidence.",
      },
      {
        claim: "No synthetic fragrances",
        evidenceStatus: "Evidence visible",
        decision: "Publicly supported",
        note: "The brand's claim is technically accurate: no Parfum or synthetic fragrance compounds are in the ingredient list. However, Benzyl Alcohol and lemongrass essential oil are natural fragrance allergens present in the formula, which consumers may not distinguish from synthetic fragrance when assessing sensitivities.",
      },
      {
        claim: "Non-comedogenic, dermatologist tested, ophthalmologist tested",
        evidenceStatus: "Evidence visible",
        decision: "Publicly supported",
        note: "Individual test report images for these claims are published in the brand's Proof of the Code section, which is substantially more evidence than badge-only claims.",
      },
      {
        claim: "Water and sweat resistant",
        evidenceStatus: "Evidence visible",
        decision: "Publicly supported",
        note: "A published test report for sweat resistance is available on the brand website.",
      },
    ],
    missingProof: [
      "The full French clinical study behind the 12-hour protection claim is not publicly accessible. Publishing the method, subject count, setting, and result scope would allow this claim to be independently verified.",
      "Formula pH is not publicly disclosed. This matters because Potassium Sorbate and Sodium Benzoate in the preservation system are most effective below pH 5, and knowing the pH would allow consumers and reviewers to evaluate preservation adequacy.",
      "Niacinamide concentration is not explicitly confirmed by the brand. Stating the percentage on the product page or packaging would verify the anti-pigmentation benefit claim.",
      "No allergen declaration is provided for Benzyl Alcohol or Citral (from lemongrass oil) in consumer-facing materials, despite both being EU-listed fragrance allergens in a daily leave-on product.",
    ],
    keyActives: [
      { name: "Methylene Bis-Benzotriazolyl Tetramethylbutylphenol (Tinosorb M)", function: "Broad-spectrum UV filter, hybrid organic and inorganic, photostable; covers UVB and long UVA", concentrationConfidence: "Medium" },
      { name: "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine (Tinosorb S)",        function: "Broad-spectrum UVB and UVA filter, highly photostable; not available in the US market", concentrationConfidence: "Medium" },
      { name: "Diethylamino Hydroxybenzoyl Hexyl Benzoate (Uvinul A Plus)",         function: "UVA filter, high photostability and skin affinity", concentrationConfidence: "Medium" },
      { name: "Ethylhexyl Triazone (Uvinul T150)",                                  function: "UVB filter, photostable, efficient at low concentrations", concentrationConfidence: "Medium" },
      { name: "Diethylhexyl Butamido Triazone (Neo Heliopan AP)",                   function: "Broad-spectrum filter covering UVB and short UVA; photostable", concentrationConfidence: "Medium" },
      { name: "Niacinamide",                                                         function: "Vitamin B3, anti-inflammatory, reduces UV-triggered pigmentation; appears early in the list suggesting a working concentration", concentrationConfidence: "Medium" },
    ],
    ingredients: [
      { name: "Aqua",                                      note: "Solvent base",                                                                                                                    flag: "ok"   },
      { name: "Dibutyl Adipate",                           note: "Emollient ester for spreadability and texture",                                                                                   flag: "ok"   },
      { name: "Methylene Bis-Benzotriazolyl Tetramethylbutylphenol", note: "Tinosorb M: broad-spectrum UV filter covering UVB and long UVA, photostable, no photodegradation concern",            flag: "ok"   },
      { name: "C15-19 Alkane",                             note: "Sustainable bio-based isoalkane emollient, lightweight and non-greasy",                                                          flag: "ok"   },
      { name: "Caprylyl Caprylate/Caprate",                note: "Emollient ester, skin conditioning",                                                                                             flag: "ok"   },
      { name: "Ethylhexyl Triazone",                       note: "Uvinul T150: UVB filter, photostable",                                                                                          flag: "ok"   },
      { name: "Diethylamino Hydroxybenzoyl Hexyl Benzoate",note: "Uvinul A Plus: UVA filter, photostable",                                                                                        flag: "ok"   },
      { name: "Polyglyceryl-6 Laurate",                    note: "Natural-derived polyglyceryl ester emulsifier",                                                                                  flag: "ok"   },
      { name: "Niacinamide",                               note: "Vitamin B3, anti-inflammatory and brightening; appears before minor botanicals in the list, suggesting a functionally meaningful concentration", flag: "ok" },
      { name: "Chondrus Crispus Extract",                  note: "Carrageenan-based marine algae extract, skin conditioning and film-former",                                                      flag: "ok"   },
      { name: "Dicaprylyl Carbonate",                      note: "Emollient, improves skin feel and spreadability",                                                                                flag: "ok"   },
      { name: "Isododecane",                               note: "Lightweight volatile emollient, non-greasy finish",                                                                              flag: "ok"   },
      { name: "Tetrahexyldecyl Ascorbate",                 note: "Oil-soluble stable Vitamin C form, antioxidant and brightening; concentration not publicly disclosed",                          flag: "info" },
      { name: "Adenosine",                                 note: "Purine nucleoside, skin conditioning and mild anti-inflammatory",                                                                flag: "ok"   },
      { name: "Sodium Hyaluronate",                        note: "Hyaluronic acid salt for surface hydration",                                                                                    flag: "ok"   },
      { name: "Hexylene Glycol",                           note: "Humectant and solubiliser",                                                                                                     flag: "ok"   },
      { name: "Aloe Barbadensis Leaf Juice",               note: "Soothing and hydrating botanical",                                                                                              flag: "ok"   },
      { name: "Saccharomyces Ferment Lysate Filtrate",     note: "Yeast ferment, antioxidant and skin conditioning",                                                                              flag: "ok"   },
      { name: "Glycerin",                                  note: "Humectant",                                                                                                                      flag: "ok"   },
      { name: "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine", note: "Tinosorb S: broad-spectrum UV filter, highly photostable; not approved in the US market",                                flag: "ok"   },
      { name: "Starch",                                    note: "Natural mattifying and oil-absorbing powder",                                                                                    flag: "ok"   },
      { name: "Polymethylsilsesquioxane",                  note: "Silicone microspheres for skin feel and soft-focus effect",                                                                     flag: "ok"   },
      { name: "Isoamyl Laurate",                           note: "Plant-derived emollient ester with elegant skin texture",                                                                        flag: "ok"   },
      { name: "Diethylhexyl Butamido Triazone",            note: "Neo Heliopan AP: broad-spectrum UV filter, photostable",                                                                        flag: "ok"   },
      { name: "Xylitol",                                   note: "Humectant and prebiotic, skin conditioning",                                                                                    flag: "ok"   },
      { name: "Steareth-21",                               note: "PEG-based emulsifier (ethoxylated stearyl alcohol); 1,4-dioxane impurity risk is managed through refining, but worth noting as a single ethoxylated compound", flag: "info" },
      { name: "Pentaerythrityl Distearate",                note: "Emollient and texturiser",                                                                                                      flag: "ok"   },
      { name: "Sodium Polyacrylate",                       note: "Polymer thickener and emulsion stabiliser",                                                                                     flag: "ok"   },
      { name: "Erythritol",                                note: "Humectant and skin protectant",                                                                                                  flag: "ok"   },
      { name: "Sodium Stearoyl Glutamate",                 note: "Mild amino acid-based emulsifier",                                                                                              flag: "ok"   },
      { name: "Silica",                                    note: "Oil-absorbing mineral powder, mattifying effect",                                                                                flag: "ok"   },
      { name: "Polyglutamic Acid",                         note: "Moisture-binding polymer; appears late in the list, suggesting a low concentration where it functions as a conditioning agent", flag: "info" },
      { name: "Magnesium Aluminum Silicate",               note: "Mineral suspension stabiliser",                                                                                                  flag: "ok"   },
      { name: "Polyacrylate Crosspolymer-6",               note: "Polymer emulsion stabiliser and thickener",                                                                                     flag: "ok"   },
      { name: "Brassica Oleracea Italica Extract",         note: "Broccoli extract, antioxidant sulforaphane source",                                                                             flag: "ok"   },
      { name: "Glyceryl Caprylate",                        note: "Natural-derived multifunctional ingredient: emollient and mild antimicrobial contribution to the preservation system",          flag: "ok"   },
      { name: "Trisodium Dicarboxymethyl Alaninate",       note: "Biodegradable chelating agent replacing EDTA, supports preservation system performance",                                       flag: "ok"   },
      { name: "Tocopheryl Acetate",                        note: "Vitamin E derivative, antioxidant",                                                                                             flag: "ok"   },
      { name: "Tocotrienols",                              note: "More potent Vitamin E isomers, antioxidant and anti-inflammatory",                                                              flag: "ok"   },
      { name: "Phytosteryl/Octyldodecyl Lauroyl Glutamate",note: "Skin barrier lipid, emollient",                                                                                                flag: "ok"   },
      { name: "Diethylhexyl Syringylidenemalonate",        note: "UV-absorbing antioxidant, added photostability contribution",                                                                   flag: "ok"   },
      { name: "Benzyl Alcohol",                            note: "Multifunctional ingredient used as a preservation booster. Also an EU-listed fragrance allergen (EU Reg 2023/1545). In a daily leave-on product applied across the full face, fragrance-sensitive or atopic consumers should be aware of its allergen classification",  flag: "warn" },
      { name: "Olea Europaea Leaf Extract",                note: "Olive leaf extract, antioxidant polyphenols",                                                                                   flag: "ok"   },
      { name: "Dipotassium Glycyrrhizate",                 note: "Licorice root derivative, anti-inflammatory and brightening",                                                                   flag: "ok"   },
      { name: "Ectoin",                                    note: "Extremolyte, environmental stress protection and skin barrier reinforcement",                                                    flag: "ok"   },
      { name: "Sodium Levulinate",                         note: "Preservative booster, part of the phenoxyethanol-free preservation system",                                                     flag: "ok"   },
      { name: "Panthenol",                                 note: "Vitamin B5, skin barrier repair",                                                                                               flag: "ok"   },
      { name: "Caprylyl/Capryl Glucoside",                 note: "Mild glucoside surfactant with antimicrobial contribution to the preservation system",                                          flag: "ok"   },
      { name: "Decyl Glucoside",                           note: "Mild sugar-derived surfactant",                                                                                                  flag: "ok"   },
      { name: "Xanthan Gum",                               note: "Natural thickener",                                                                                                             flag: "ok"   },
      { name: "Myristyl Glucoside",                        note: "Mild fatty glucoside surfactant",                                                                                               flag: "ok"   },
      { name: "Citric Acid",                               note: "pH adjuster",                                                                                                                    flag: "ok"   },
      { name: "Cymbopogon Flexuosus Leaf Oil",             note: "Lemongrass essential oil: natural fragrance source containing Citral, a recognised EU fragrance allergen (EU Reg 2023/1545) and potential photosensitiser in a leave-on sunscreen. The brand claims no synthetic fragrances, which is accurate, but this is not a fragrance-free product",  flag: "warn" },
      { name: "Potassium Sorbate",                         note: "Preservative; most effective below pH 5, part of the phenoxyethanol-free system",                                              flag: "ok"   },
      { name: "Sodium Benzoate",                           note: "Preservative; most effective below pH 5, part of the phenoxyethanol-free system",                                              flag: "ok"   },
    ],
    pass_badges: ["INCI Verified", "Reef-Safe UV Filters", "No Oxybenzone", "No Octinoxate", "No Homosalate", "No Octocrylene", "No Phenoxyethanol", "Paraben-Free", "Published SPF Test Report", "GMP Certified Manufacturer"],
    warn_badges: ["Fragrance Allergens Present", "12-Hour Claim Not Verified from Public Evidence"],
    info_badges: ["Penta-Filter Photostable Technology", "Published Non-Comedogenic and Dermatologist Test Reports", "Natural Fragrance Present (Not Fragrance-Free)"],
    indiaContext: "The filter selection here is well-suited to Indian conditions: all five UV filters are photostable, meaning their UVA and UVB protection does not degrade under the intense UV exposure typical of India's climate the way older filter systems can. Niacinamide in the formula helps reduce post-UV darkening, which is relevant for Fitzpatrick III-VI skin tones. Fragrance-sensitive or atopic individuals should note Benzyl Alcohol and lemongrass essential oil, both EU-listed allergens. Reapply every two hours in direct sun regardless of the 12-hour claim, as physical removal from sweat and activity reduces effective filter coverage.",
    cleanSheetNote: "This assessment is based only on publicly available INCI, claims, and test evidence. It is not a full Clean Sheet certification. Full certification requires confidential formula review, exact concentrations, supplier documentation, manufacturing records, packaging compatibility, preservative efficacy, stability, and complete claim validation.",
    analyzedAt: "2026-06-10",
    category: "Sunscreens",
    subCategory: "Chemical Sunscreen",
    concernTags: ["Photoageing", "Tanning", "Pigmentation", "Sun Protection"],
    suitabilityTags: ["Daily Use", "Active Outdoors", "Experienced Sunscreen Users"],
    cautionTags: ["Contains Fragrance", "Fragrance Allergen Flag", "Essential Oil Flag", "Clinical Claim Not Verified"],
  },

  /* -------------------------------------------------
     2. UltraMatte Mineral Gel Sunscreen SPF 50+ PA++++
     Source: codeskin.in/products/ultramatte-mineral-gel-sunscreen
     Scored under: 5-Pillar Public Evidence Score (June 2026)
  ------------------------------------------------- */
  {
    productName: "UltraMatte Mineral Gel Sunscreen SPF 50+ PA++++",
    slug: "ultramatte-mineral-gel-sunscreen-spf50",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹1,100",
    productType: "sunscreen",
    concern: "Sun protection, oil control, acne-prone skin, mineral preference",
    summary: "A 100% mineral (Zinc Oxide only) anhydrous elastomer gel sunscreen designed for oily and acne-prone skin. The water-free formulation eliminates microbial preservation challenges and UV filter photodegradation concerns. The full ingredient list and multiple published test reports (SPF, non-comedogenic, dermatologist, ophthalmologist, water resistant, blue light, vegan) are publicly available on the brand website. Of all CodeSkin products reviewed, this has the cleanest allergen profile: no fragrance of any kind, no essential oils, no Benzyl Alcohol. One formulation note for acne-prone users is that Isostearic Acid appears in the ingredient list and carries higher comedogenic ratings on standard scales, which is worth knowing given the product's target audience.",
    score: 86,
    scoreLabel: "Good",
    publicDecisionLabel: "Strong public evidence",
    image: "https://cdn.shopify.com/s/files/1/0649/1403/0635/files/Ultramatte_mineral_gel_sunscreen_df477313-531c-4bca-88ce-b1fc769b58ab.png?v=1765100436",
    pillars: [
      {
        name: "Public INCI Safety Screen",
        score: 28, max: 30,
        note: "Anhydrous mineral formula with Zinc Oxide as the sole UV filter. No chemical UV filters: no Oxybenzone, no Octinoxate, no Homosalate, no Octocrylene. Zinc Oxide is photostable, broadly accepted in pregnancy and paediatric contexts, and carries no known endocrine disruption signal at cosmetic topical concentrations. No fragrance of any kind: no essential oils, no Parfum, no Benzyl Alcohol. This is the cleanest allergen profile of any product in this brand review. Hinokitiol, sourced from Japanese cypress, appears as an anti-acne ingredient with documented antimicrobial properties, but concentration is not publicly disclosed and long-term leave-on safety data at cosmetic concentrations is less extensive than conventional actives. Isostearic Acid appears as an emollient and aids Zinc Oxide suspension. It carries higher comedogenic ratings on standard scales, which is a formulation note worth flagging for the acne-prone target audience of this product.",
      },
      {
        name: "Formula Logic Inference",
        score: 22, max: 25,
        note: "Dimethicone listed first establishes this as an anhydrous silicone gel, the correct vehicle choice for an elastomer gel mineral sunscreen. Zinc Oxide appears third in an anhydrous system, confirming it is a significant component by weight, consistent with its sole UV filter role. Silicone elastomer technology (Dimethicone Crosspolymer) provides the smooth, blendable texture that makes mineral sunscreens wearable for daily use. No water means no microbial growth risk and no need for conventional water-phase preservatives. Glyceryl Caprylate, Caprylyl/Capryl Glucoside, and Propanediol provide adequate antimicrobial coverage in the anhydrous system. Hydroxyapatite and Boron Nitride contribute to the matte, complexion-evening finish. A light tint from CI 77492 (yellow iron oxide) reduces the white cast typical of mineral-only sunscreens. The only formulation concern flagged is the inclusion of Isostearic Acid for a product positioned at acne-prone skin.",
      },
      {
        name: "Public Claim Support",
        score: 22, max: 25,
        note: "This product has the strongest public evidence base in this brand review. Published test reports cover SPF, non-comedogenic, dermatologist tested, ophthalmologist tested, water resistant, blue light, vegan, and clean beauty. The 100% mineral claim is directly verified from the ingredient list: Zinc Oxide is the only UV filter present. The vegan claim is supported by a published vegan test report and the ingredient list, which contains no animal-derived ingredients in this specific product. PA++++ is stated on packaging, and PPD testing supporting it is consistent with what the brand shows on other products. Hinokitiol is used as an anti-acne ingredient and its antimicrobial properties are documented in published literature, but no finished product clinical study for the acne claim was found publicly and the concentration is not disclosed. Moisturisation tested is stated for an anhydrous formula, which is a claim where consumer expectation and formula design may not fully align.",
      },
      {
        name: "Test Result Transparency",
        score: 11, max: 15,
        evidenceGrade: "B",
        note: "Full ingredient list is publicly accessible on the brand website. Test reports are published for SPF, non-comedogenic, dermatologist tested, ophthalmologist tested, water resistance, blue light protection, and vegan status. The GMP manufacturing certificate is publicly linked. This earns Grade B: multiple test results are visible but full study documentation including method details, subject counts, batch identifiers, and result dates is not fully accessible for all reported tests. Isostearic Acid is not flagged in consumer-facing materials despite its comedogenicity association and the product's acne-prone market positioning, which is a transparency gap. Batch and expiry traceability is not publicly visible.",
      },
      {
        name: "Consumer Clarity",
        score: 4, max: 5,
        note: "Clear application instructions are provided. The brand specifies the product is designed for oily and acne-prone skin types, and the mineral-only UV filter story is communicated clearly for consumers who want to avoid chemical filters. Reapplication guidance is present on the product page. One gap: the brand does not flag Isostearic Acid as a potential comedogenicity concern in consumer-facing materials despite targeting acne-prone skin, and no specific guidance is offered for very deep skin tones where the light tint may not fully neutralise white cast at recommended application amounts.",
      },
    ],
    globalScreen: {
      eu_1223_2009: "No obvious public red flag found",
      india_cr_2020: "No obvious public red flag found",
      health_canada_hotlist: "No obvious public red flag found",
      canada_nhpid: "Not triggered",
      tga_australia: "Not triggered",
      us_fda_21cfr: "No obvious public red flag found",
      korea_mfds: "No obvious public red flag found",
      aicis_australia: "No obvious public red flag found",
      echa_svhc: "No obvious public red flag found",
      iarc: "No obvious carcinogenicity flag found",
    },
    inciCompleteness: {
      status: "Full INCI on brand PDP",
      flags: [
        "Zinc Oxide concentration not publicly stated",
        "Hinokitiol concentration not publicly disclosed",
        "Isostearic Acid not flagged in consumer-facing materials despite comedogenicity association",
      ],
    },
    claimsCheck: [
      {
        claim: "100% Mineral UV Filter (Zinc Oxide only)",
        evidenceStatus: "Evidence visible",
        decision: "Publicly supported",
        note: "Zinc Oxide is the only UV filter in the ingredient list; no chemical UV filters are present. This is directly verifiable from the public INCI.",
      },
      {
        claim: "Non-comedogenic, dermatologist tested, ophthalmologist tested",
        evidenceStatus: "Evidence visible",
        decision: "Publicly supported",
        note: "Individual test report images for these claims are published in the brand's Proof of the Code section.",
      },
      {
        claim: "Suitable for acne-prone skin",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "The mineral-only filter and no-fragrance profile support this claim directionally, but Isostearic Acid in the formula carries higher comedogenic ratings and no finished-product acne-prone tolerability study is publicly available.",
      },
      {
        claim: "Vegan",
        evidenceStatus: "Evidence visible",
        decision: "Publicly supported",
        note: "A published vegan test report is available and the ingredient list contains no animal-derived ingredients. This product's vegan claim is confirmed from public evidence.",
      },
      {
        claim: "Water and sweat resistant",
        evidenceStatus: "Evidence visible",
        decision: "Publicly supported",
        note: "A published water resistance test report is available on the brand website.",
      },
    ],
    missingProof: [
      "Zinc Oxide concentration is not publicly stated. Confirming the percentage would allow independent verification of SPF performance at the stated level and reassurance for consumers comparing mineral sunscreens.",
      "Hinokitiol concentration is not disclosed. For an ingredient being used to support an anti-acne claim, publishing the concentration would allow the claim to be evaluated against available safety and efficacy data.",
      "No finished-product clinical study for the acne-prone suitability claim is publicly available. A non-comedogenicity or tolerability study in acne-prone subjects would strengthen this claim.",
      "No preservative efficacy test result (ISO 11930) is publicly accessible. While the anhydrous formula significantly reduces microbial risk, independent challenge testing would be a complete transparency measure.",
    ],
    keyActives: [
      { name: "Zinc Oxide",                function: "Sole UV filter: broad-spectrum physical filter covering UVA and UVB, photostable, non-penetrating; appears third in the anhydrous ingredient list suggesting a meaningful concentration", concentrationConfidence: "Medium" },
      { name: "Hinokitiol",                function: "Natural antimicrobial from Japanese cypress, anti-acne; concentration not publicly disclosed", concentrationConfidence: "Low" },
      { name: "Ectoin",                    function: "Extremolyte, environmental stress protection and skin barrier reinforcement", concentrationConfidence: "Low" },
      { name: "Pongamia Pinnata Seed Extract", function: "Anti-inflammatory, claimed to support Zinc Oxide UV performance; appears late in the list suggesting a trace or low concentration", concentrationConfidence: "Low" },
      { name: "Hydroxyapatite",            function: "Calcium phosphate mineral, optical skin-tone evening and contributes to the matte finish", concentrationConfidence: "Medium" },
      { name: "Ethyl Linoleate / Linolenate / Oleate", function: "Vitamin F (fatty acid esters), support skin barrier and sebum rebalancing for oily skin", concentrationConfidence: "Medium" },
    ],
    ingredients: [
      { name: "Dimethicone",               note: "Silicone listed first: primary vehicle for the anhydrous elastomer gel formula; photostable, generally non-comedogenic",                         flag: "ok"   },
      { name: "Dimethicone Crosspolymer",  note: "Silicone elastomer creating smooth skin-like texture and blendability for the mineral sunscreen",                                              flag: "ok"   },
      { name: "Zinc Oxide",                note: "Sole UV filter: photostable broad-spectrum physical filter; listed third in the anhydrous system confirms a functional concentration; no penetration concern with the micronised form coated with silica and polyhydroxystearic acid", flag: "ok" },
      { name: "Isododecane",               note: "Lightweight volatile emollient",                                                                                                                 flag: "ok"   },
      { name: "C13-15 Alkane",             note: "Sustainable bio-based isoalkane emollient",                                                                                                     flag: "ok"   },
      { name: "Disteardimonium Hectorite", note: "Mineral clay for Zinc Oxide suspension in the anhydrous system",                                                                                flag: "ok"   },
      { name: "Isoamyl Laurate",           note: "Plant-derived emollient ester",                                                                                                                  flag: "ok"   },
      { name: "Coco-Caprylate/Caprate",    note: "Lightweight emollient derived from coconut oil",                                                                                                flag: "ok"   },
      { name: "Isostearic Acid",           note: "Emollient fatty acid that aids Zinc Oxide suspension. Note: carries higher comedogenic ratings on standard ingredient scales, which is worth knowing for the acne-prone target audience", flag: "info" },
      { name: "Trihydroxystearin",         note: "Natural-origin thickener and emollient",                                                                                                        flag: "ok"   },
      { name: "Caprylic/Capric Triglyceride", note: "Lightweight emollient carrier derived from coconut and palm kernel",                                                                        flag: "ok"   },
      { name: "Polyhydroxystearic Acid",   note: "Dispersant and wetting agent for Zinc Oxide in silicone systems",                                                                               flag: "ok"   },
      { name: "Lecithin",                  note: "Phospholipid emulsifier, biomimetic skin conditioning",                                                                                         flag: "ok"   },
      { name: "Polyglyceryl-3 Polyricinoleate", note: "Emulsifier suited to water-in-oil systems",                                                                                               flag: "ok"   },
      { name: "Ethyl Linoleate",           note: "Linoleic acid ester, Vitamin F component for skin barrier and sebum rebalancing",                                                              flag: "ok"   },
      { name: "Ethyl Linolenate",          note: "Linolenic acid ester, Vitamin F component with anti-inflammatory omega-3 character",                                                            flag: "ok"   },
      { name: "Ethyl Oleate",              note: "Oleic acid ester, Vitamin F component emollient; mild penetration-enhancing potential at high concentrations",                                  flag: "ok"   },
      { name: "Hydroxyapatite",            note: "Calcium phosphate mineral for optical skin-tone correction and matte finish contribution",                                                      flag: "ok"   },
      { name: "Caprylyl Methicone",        note: "Lightweight volatile silicone for skin feel",                                                                                                   flag: "ok"   },
      { name: "Silica",                    note: "Oil-absorbing mineral powder, mattifying",                                                                                                       flag: "ok"   },
      { name: "Boron Nitride",             note: "Mineral powder for soft-focus optical effect and matte finish",                                                                                 flag: "ok"   },
      { name: "Glyceryl Caprylate",        note: "Natural-derived multifunctional ingredient: emollient and mild antimicrobial as part of the phenoxyethanol-free system",                       flag: "ok"   },
      { name: "Lauroyl Lysine",            note: "Amino acid-based powder improving texture and spreadability",                                                                                   flag: "ok"   },
      { name: "Pongamia Pinnata Seed Extract", note: "Karanja oil extract, anti-inflammatory; claimed to support UV filter performance; appears late in the list suggesting a low to trace concentration", flag: "ok" },
      { name: "Tocopheryl Acetate",        note: "Vitamin E antioxidant",                                                                                                                         flag: "ok"   },
      { name: "Hinokitiol",                note: "Natural antimicrobial tropolone from Japanese cypress, used for anti-acne benefit; concentration not publicly disclosed",                      flag: "info" },
      { name: "Caprylyl/Capryl Glucoside", note: "Mild glucoside with antimicrobial contribution in the anhydrous system",                                                                       flag: "ok"   },
      { name: "Propanediol",               note: "Humectant and solubiliser, mild antimicrobial booster in an anhydrous context",                                                                flag: "ok"   },
      { name: "Ectoin",                    note: "Extremolyte, environmental stress protection and skin barrier reinforcement",                                                                    flag: "ok"   },
      { name: "Hyaluronic Acid",           note: "Hydration polymer; in an anhydrous formula this requires water contact to form a film; appears late in the list",                             flag: "info" },
      { name: "CI 77492",                  note: "Yellow iron oxide mineral tint for skin-tone correction and white-cast reduction",                                                              flag: "ok"   },
    ],
    pass_badges: ["INCI Verified", "100% Mineral UV Filter", "Reef-Safe UV Filters", "No Oxybenzone", "No Octinoxate", "No Homosalate", "No Octocrylene", "No Phenoxyethanol", "Fragrance-Free", "Paraben-Free", "Published SPF Test Report", "Non-Comedogenic Tested", "Vegan Tested", "GMP Certified Manufacturer"],
    warn_badges: ["Isostearic Acid: Comedogenic Potential Flagged for Acne-Prone Users"],
    info_badges: ["Anhydrous Elastomer Gel Technology", "Lightly Tinted (Iron Oxide)", "Published Blue Light Test Report"],
    indiaContext: "Mineral-only sunscreens suit consumers who want to avoid all chemical UV filters, particularly those with rosacea, sensitive skin, or pregnancy, where zinc oxide's photostability and safety profile are well established. The elastomer gel vehicle reduces the white cast and heavy feel typical of mineral sunscreens, making it viable for daily use in India's humid climate. For deeper skin tones (Fitzpatrick V-VI), the light tint may not fully neutralise white cast at higher application quantities. For best SPF performance, apply the recommended 2 mg per cm2 and reapply every two hours.",
    cleanSheetNote: "This assessment is based only on publicly available INCI, claims, and test evidence. It is not a full Clean Sheet certification. Full certification requires confidential formula review, exact concentrations, supplier documentation, manufacturing records, packaging compatibility, preservative efficacy, stability, and complete claim validation.",
    analyzedAt: "2026-06-10",
    category: "Sunscreens",
    subCategory: "Mineral Sunscreen",
    concernTags: ["Photoageing", "Tanning", "Oily Skin", "Acne", "Sun Protection"],
    suitabilityTags: ["Oily Skin", "Acne Prone Skin", "Fragrance Sensitive Users", "Daily Use"],
    cautionTags: ["Contains Comedogenic Ingredients"],
  },

  /* -------------------------------------------------
     3. Hyaluronic 7+ Serum
     Source: codeskin.in/products/hyaluronic-7
     Scored under: 5-Pillar Public Evidence Score (June 2026)
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
    summary: "A multi-weight hyaluronic acid serum with several advanced hydration and barrier actives. The public ingredient list shows four distinct forms of hyaluronic acid, though the brand's claim of seven types cannot be fully confirmed from the published list as it stands. More significantly, the ingredient list includes Whey Protein, which is derived from dairy, while the product page states 100% vegan. This is a direct contradiction between two publicly available pieces of information from the same brand website, and consumers relying on the vegan claim should be aware of it. The formula also contains a penetration enhancer (Diethylene Glycol Monoethyl Ether) that increases how deeply all co-formulated ingredients absorb, which is not disclosed on the product page.",
    score: 69,
    scoreLabel: "Fair",
    publicDecisionLabel: "Needs proof",
    image: "https://cdn.shopify.com/s/files/1/0649/1403/0635/files/Hyaluronic_7_Serum_-_CodeSkin-4870725_28680c52-390b-47c6-a0b4-e92be22651a5.jpg?v=1765100449",
    pillars: [
      {
        name: "Public INCI Safety Screen",
        score: 23, max: 30,
        note: "The full ingredient list is publicly available. No banned substances are identified under EU cosmetics law, India's cosmetic regulations, Health Canada's restricted list, the Korean MFDS database, or the EU's list of substances of very high concern. The formula uses a phenoxyethanol-free preservation system of Caprylhydroxamic Acid, 1,2-Hexanediol, Sodium Benzoate, Potassium Sorbate, Sodium Levulinate, and Levulinic Acid, which is consistent with the brand's declared ingredient charter. Two ingredients require consumer awareness. Diethylene Glycol Monoethyl Ether (also known as Transcutol) is a penetration enhancer that significantly increases how deeply all co-formulated ingredients absorb into the skin. This amplifies both the efficacy and the systemic exposure of the whole formula. Consumers stacking other active serums should factor this in. Phenethyl Alcohol is used as a preservation booster and has mild sensitisation potential at higher concentrations, with a rose-like scent profile that some consumers may experience as fragrance. Whey Protein is present in the ingredient list and is dairy-derived, which contradicts the 100% vegan claim on the product page.",
      },
      {
        name: "Formula Logic Inference",
        score: 19, max: 25,
        note: "Water is listed first. Propanediol appears second, indicating a significant solvent load. This is common in high-performance serums and helps solubilise actives, but it also means the formula is solvent-heavy before the actives begin. Caprylhydroxamic Acid and 1,2-Hexanediol appear unusually early in the list for preservation-system ingredients. This INCI positioning may reflect a formula design where these multifunctional ingredients serve both a humectant and preservation role. Niacinamide appears fifth, likely above the 1% threshold, consistent with the brand's stated 5% concentration. Diethylene Glycol Monoethyl Ether (Transcutol) appears later in the list as a penetration enhancer that increases absorption of all co-formulated actives. Ceramide NP appears very late in the list, suggesting a trace concentration. Without published concentration data, barrier repair claims based on Ceramide NP alone are difficult to verify from the ingredient list. Linolenic Acid near the end of the list is oxidation-sensitive and may need robust preservation in this water-based vehicle.",
      },
      {
        name: "Public Claim Support",
        score: 14, max: 25,
        note: "Three public evidence issues are identified. First, the 100% vegan claim on the product page is directly contradicted by Whey Protein (dairy-derived) in the ingredient list. Both pieces of information come from the same brand website. This is a publicly visible contradiction and consumers with dairy concerns or ethical veganism should be aware of it. The brand should clarify and reconcile this publicly. Second, Tripeptide-85 for firmness appears in marketing copy on the product page but Tripeptide-85 does not appear in the published ingredient list. A cosmetic claim based on an ingredient that is not listed is not supported from public evidence. Third, the 7 types of Hyaluronic Acid claim: four distinct HA forms are clearly identifiable in the ingredient list (Sodium Hyaluronate Crosspolymer, Sodium Hyaluronate, Hydrolyzed Hyaluronic Acid, Sodium Acetylated Hyaluronate). Additional HA types may be present within marine algae extracts or Glycogen, but this cannot be confirmed without brand disclosure. The dermatologist test report is published, which is a positive. The 5% niacinamide concentration is plausible from ingredient list order but not formally confirmed.",
      },
      {
        name: "Test Result Transparency",
        score: 10, max: 15,
        evidenceGrade: "B",
        note: "The full ingredient list is publicly accessible on the brand website. A dermatologist test report is published, which earns partial Grade B credit. However, the vegan certification and the ingredient list contain directly conflicting information that the brand has not publicly resolved. This reduces overall transparency significantly. The Tripeptide-85 marketing claim without a corresponding INCI entry is a further transparency gap. No disclosure is given to consumers about the penetration enhancer (Diethylene Glycol Monoethyl Ether) and its effect on absorption depth. No batch or expiry traceability is publicly visible. No preservative efficacy test result is publicly accessible.",
      },
      {
        name: "Consumer Clarity",
        score: 3, max: 5,
        note: "Basic application instructions are provided on the product page. Hydration and plumping suitability guidance is communicated. However, consumers are not told about the penetration enhancer in the formula and its effect on how deeply all actives are absorbed. This is a meaningful gap, particularly for consumers layering multiple active serums. No allergy or dairy-sensitivity warning is provided despite Whey Protein being present in a formula marketed as vegan. No guidance is given on managing layering with exfoliant or retinoid serums.",
      },
    ],
    globalScreen: {
      eu_1223_2009: "No obvious public red flag found",
      india_cr_2020: "No obvious public red flag found",
      health_canada_hotlist: "No obvious public red flag found",
      canada_nhpid: "Not triggered",
      tga_australia: "Not triggered",
      us_fda_21cfr: "No obvious public red flag found",
      korea_mfds: "No obvious public red flag found",
      aicis_australia: "No obvious public red flag found",
      echa_svhc: "No obvious public red flag found",
      iarc: "No obvious carcinogenicity flag found",
    },
    inciCompleteness: {
      status: "Full INCI on brand PDP",
      flags: [
        "Whey Protein (dairy-derived) present in INCI while product page states 100% vegan: public evidence contradiction, not resolved by brand",
        "Tripeptide-85 referenced in marketing copy but not found in published ingredient list",
        "7 types of HA claimed: four distinct HA forms confirmed in INCI, remaining three not independently verifiable from public data",
        "Niacinamide concentration stated as 5% by brand but not explicitly confirmed on product page",
        "Penetration enhancer (Diethylene Glycol Monoethyl Ether) present but not disclosed to consumers",
      ],
    },
    claimsCheck: [
      {
        claim: "100% vegan",
        evidenceStatus: "Missing",
        decision: "Not publicly supported",
        note: "Whey Protein, a dairy-derived ingredient, is listed in the public ingredient list on the same brand website that carries the 100% vegan claim. This is a direct public evidence contradiction. Consumers with dairy allergies or ethical vegan requirements should be aware.",
      },
      {
        claim: "7 types of Hyaluronic Acid",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "Four distinct HA forms are clearly identifiable in the ingredient list. The remaining three types claimed cannot be independently confirmed from the public ingredient list without additional brand disclosure.",
      },
      {
        claim: "5% Niacinamide",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "The brand states 5% niacinamide and the ingredient list position is consistent with a working concentration, but the percentage is not confirmed on the main product page in a way that is independently verifiable.",
      },
      {
        claim: "Tripeptide-85 for firmness",
        evidenceStatus: "Missing",
        decision: "Not publicly supported",
        note: "Tripeptide-85 appears in the marketing copy on the product page but is not present in the published ingredient list. A claim referencing an ingredient that is not listed cannot be verified from public evidence.",
      },
      {
        claim: "Dermatologist tested",
        evidenceStatus: "Evidence visible",
        decision: "Publicly supported",
        note: "A dermatologist test report is published on the brand website, which is more evidence than badge-only claims.",
      },
    ],
    missingProof: [
      "The brand should publicly resolve the contradiction between Whey Protein in the ingredient list and the 100% vegan claim on the product page. This affects consumers with dairy allergies and those purchasing on ethical grounds.",
      "Tripeptide-85 appears in marketing copy but not in the published ingredient list. The brand should either add it to the INCI if present, or remove the marketing claim.",
      "Niacinamide concentration should be confirmed explicitly on the product page rather than inferred from ingredient list order.",
      "The presence of Diethylene Glycol Monoethyl Ether (a penetration enhancer that increases absorption depth of all co-formulated actives) should be disclosed clearly to consumers who are stacking active serums.",
      "No preservative efficacy test result (ISO 11930) is publicly accessible. Challenge test data would confirm the multi-component preservation system is adequate for this water-based formula.",
      "Ceramide NP concentration is not disclosed. Given its late position in the ingredient list, the functional barrier repair dose cannot be verified from public information alone.",
    ],
    keyActives: [
      { name: "Sodium Hyaluronate Crosspolymer",   function: "High molecular weight cross-linked HA, surface hydration and long-lasting moisture film", concentrationConfidence: "Medium" },
      { name: "Sodium Hyaluronate",                function: "Standard HA for surface hydration", concentrationConfidence: "Medium" },
      { name: "Hydrolyzed Hyaluronic Acid",        function: "Low molecular weight HA fragments that penetrate deeper into the stratum corneum", concentrationConfidence: "Medium" },
      { name: "Sodium Acetylated Hyaluronate",     function: "Lipid-modified HA with enhanced skin adhesion and prolonged moisture retention compared to standard HA", concentrationConfidence: "Medium" },
      { name: "Niacinamide",                       function: "Vitamin B3, listed fifth in the ingredient order suggesting a working concentration; brightening, barrier support, sebum regulation", concentrationConfidence: "Medium" },
      { name: "Diethylene Glycol Monoethyl Ether", function: "Transcutol: penetration enhancer that increases absorption depth of all co-formulated actives; both efficacy benefit and systemic exposure consideration", concentrationConfidence: "Medium" },
      { name: "Ceramide NP",                       function: "Skin barrier lipid; appears very late in the ingredient list suggesting a trace concentration, functional barrier repair claim not independently verifiable from INCI evidence alone", concentrationConfidence: "Low" },
      { name: "Ectoin",                            function: "Extremolyte, environmental stress protection and barrier reinforcement", concentrationConfidence: "Low" },
    ],
    ingredients: [
      { name: "Aqua",                              note: "Solvent base",                                                                                                                      flag: "ok"   },
      { name: "Propanediol",                       note: "Listed second: major solvent and humectant component; plant-derived, low sensitisation risk",                                       flag: "ok"   },
      { name: "Caprylhydroxamic Acid",             note: "Multifunctional preservative and chelator; appears unusually early, likely serving dual humectant and antimicrobial roles",        flag: "info" },
      { name: "1,2-Hexanediol",                    note: "Multifunctional humectant and antimicrobial preservative booster",                                                                  flag: "ok"   },
      { name: "Niacinamide",                       note: "Vitamin B3; listed fifth, suggesting above 1% concentration; brand states 5%, which is plausible but not formally confirmed",    flag: "ok"   },
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
      { name: "Sodium Hyaluronate Crosspolymer",   note: "High molecular weight cross-linked HA, surface hydration film and moisturisation",                                                 flag: "ok"   },
      { name: "Glycogen",                          note: "Skin-identical polysaccharide for moisturisation and skin conditioning",                                                            flag: "ok"   },
      { name: "Panthenol",                         note: "Vitamin B5, barrier repair",                                                                                                        flag: "ok"   },
      { name: "Butylene Glycol",                   note: "Humectant",                                                                                                                          flag: "ok"   },
      { name: "Polyglutamic Acid",                 note: "High molecular weight moisture-binding polymer; appears late in the list suggesting a low to trace concentration",                flag: "info" },
      { name: "Phenethyl Alcohol",                 note: "Preservative booster with mild sensitisation potential at higher concentrations; has a rose-like scent that some consumers may perceive as fragrance", flag: "info" },
      { name: "Sodium Carrageenan",                note: "Marine polysaccharide thickener and skin conditioner",                                                                              flag: "ok"   },
      { name: "Jania Rubens Extract",              note: "Calcareous red algae extract, skin conditioning",                                                                                   flag: "ok"   },
      { name: "Sclerotium Gum",                    note: "Biopolymer thickener",                                                                                                              flag: "ok"   },
      { name: "Hydroxypropyl Tetrahydropyrantriol",note: "Pro-Xylane (BASF), skin structure and firmness ingredient; concentration not publicly disclosed",                                  flag: "info" },
      { name: "Pentylene Glycol",                  note: "Humectant and mild preservative booster",                                                                                           flag: "ok"   },
      { name: "Zinc Ricinoleate",                  note: "Zinc salt of ricinoleic acid, odour neutraliser and mild antimicrobial",                                                           flag: "ok"   },
      { name: "Tetrasodium Glutamate Diacetate",   note: "Biodegradable chelating agent replacing EDTA, supports preservation system",                                                       flag: "ok"   },
      { name: "Levulinic Acid",                    note: "Organic acid preservative booster as part of the phenoxyethanol-free system",                                                      flag: "ok"   },
      { name: "Caprylic/Capric Triglyceride",      note: "Emollient and solubiliser for lipophilic actives",                                                                                 flag: "ok"   },
      { name: "Hydrogenated Lecithin",             note: "Phospholipid emulsifier and skin barrier support; appears late in the list suggesting a trace concentration",                     flag: "ok"   },
      { name: "Phytosteryl/Octyldodecyl Lauroyl Glutamate", note: "Skin barrier lipid, emollient",                                                                                          flag: "ok"   },
      { name: "Ceramide NP",                       note: "Key skin barrier lipid; appears very late in the ingredient list suggesting a trace concentration. Functional barrier repair from Ceramide NP at this level cannot be confirmed from the ingredient list alone", flag: "info" },
      { name: "Sodium Hyaluronate",                note: "Standard molecular weight HA for surface hydration",                                                                               flag: "ok"   },
      { name: "Aminomethyl Propanol",              note: "pH adjuster",                                                                                                                        flag: "ok"   },
      { name: "Trisodium Dicarboxymethyl Alaninate", note: "Biodegradable chelating agent",                                                                                                  flag: "ok"   },
      { name: "Allantoin",                         note: "Soothing and skin-repairing",                                                                                                       flag: "ok"   },
      { name: "Whey Protein",                      note: "Milk-derived protein (animal origin). The product page states 100% vegan. Whey Protein is derived from dairy and is not vegan. This is a contradiction between two publicly available sources on the same brand website. Consumers with dairy sensitivities or purchasing on vegan grounds should be aware", flag: "warn" },
      { name: "Ectoin",                            note: "Extremolyte, environmental stress protection and barrier reinforcement",                                                             flag: "ok"   },
      { name: "Maltodextrin",                      note: "Polysaccharide encapsulant and thickener",                                                                                          flag: "ok"   },
      { name: "Biosaccharide Gum-1",               note: "Fermentation-derived biopolymer, skin conditioning and soothing",                                                                  flag: "ok"   },
      { name: "Xanthan Gum",                       note: "Natural thickener",                                                                                                                 flag: "ok"   },
      { name: "Hydrolyzed Hyaluronic Acid",        note: "Low molecular weight HA fragments that penetrate past the stratum corneum for deeper layer hydration",                            flag: "ok"   },
      { name: "Magnesium Carboxymethyl Beta-Glucan", note: "Beta-glucan derivative, immune-modulatory and skin conditioning",                                                                flag: "ok"   },
      { name: "Sodium Acetylated Hyaluronate",     note: "Lipid-modified HA with enhanced skin adhesion and prolonged moisture retention versus standard HA",                               flag: "ok"   },
      { name: "Diethylene Glycol Monoethyl Ether", note: "Transcutol: a strong penetration enhancer that increases how deeply all co-formulated actives absorb into the skin. This amplifies both efficacy and systemic absorption of the full formula. The brand does not communicate this on the product page", flag: "warn" },
      { name: "Linolenic Acid",                    note: "Omega-3 fatty acid, anti-inflammatory and barrier lipid; oxidation-sensitive and at the tail end of the ingredient list in a water-based formula, so long-term stability should be considered", flag: "info" },
    ],
    pass_badges: ["INCI Verified", "No Phenoxyethanol", "Paraben-Free", "No Synthetic Fragrance", "Published Dermatologist Test Report", "Multiple HA Forms", "GMP Certified Manufacturer"],
    warn_badges: ["Vegan Claim Contradicted by Whey Protein (Dairy-Derived) in INCI", "Tripeptide-85 Marketing Claim Not Found in Published Ingredient List", "Contains Penetration Enhancer (Transcutol): Not Disclosed to Consumers"],
    info_badges: ["Contains Penetration Enhancer (Transcutol / Diethylene Glycol Monoethyl Ether)", "Four Distinct HA Forms Confirmed (Seven Claimed)", "Ceramide NP Likely at Trace Concentration"],
    indiaContext: "Multi-weight HA serums perform differently in humid versus dry climates. In India's humid monsoon conditions, lighter lower-molecular-weight HA forms work better for texture and feel. The Transcutol (penetration enhancer) in this formula increases absorption of niacinamide and other actives, which is an efficacy benefit but is especially relevant for consumers stacking other active serums. The Whey Protein ingredient and vegan claim contradiction should be resolved by the brand before purchase decisions are made by consumers with dairy allergies or ethical vegan requirements.",
    cleanSheetNote: "This assessment is based only on publicly available INCI, claims, and test evidence. It is not a full Clean Sheet certification. Full certification requires confidential formula review, exact concentrations, supplier documentation, manufacturing records, packaging compatibility, preservative efficacy, stability, and complete claim validation.",
    analyzedAt: "2026-06-10",
    category: "Serums",
    subCategory: "Hyaluronic Acid Serum",
    concernTags: ["Dehydrated Skin", "Dry Skin", "Fine Lines", "Barrier Damage"],
    suitabilityTags: ["Dry Skin", "Dehydrated Skin", "Combination Skin", "Daily Use"],
    cautionTags: ["Clinical Claim Not Verified", "Active % Not Verified"],
  },

];

export const codeskinBrand: Brand = {
  name: "CodeSkin",
  slug: "codeskin",
  logo: "https://codeskin.in/cdn/shop/files/f_codeskin_icon-01.png?v=1770368822",
  tagline: "India's clean beauty innovator with 1,600+ restricted ingredients and in-house GMP formulation",
  description: "CodeSkin is a Mumbai-based brand founded by Oscar Pereira, who previously built Cheryl's Cosmeceutical (acquired by L'Oreal India in 2013). All products are formulated and manufactured in-house at Effeza Science Pvt Ltd, a GMP-certified, CDSCO-compliant facility in Mumbai. The brand positions itself around a publicly declared ingredient charter restricting more than 1,600 ingredients, more than EU cosmetics regulation requires. Their UV filter selection (next-generation photostable filters, no oxybenzone, no octocrylene, no homosalate) is technically ahead of most Indian competitors. Published test reports for multiple claims per product are an unusual and commendable transparency practice. Key gaps identified in this review: the Hyaluronic 7+ Serum's 100% vegan claim is directly contradicted by Whey Protein in the published ingredient list; Benzyl Alcohol and lemongrass essential oil in the SPF 100 sunscreen are fragrance allergens that the no synthetic fragrances positioning does not fully disclose; and Transcutol (a penetration enhancer) appears in the serum without consumer disclosure. Reviewed under the 5-Pillar Public Evidence Score framework. Scores reflect public evidence confidence, not certification.",
  founded: "2022",
  headquarters: "Mumbai, India",
  website: "https://codeskin.in",
  instagramHandle: "@codeskinofficial",
  nykaaUrl: "",
  avgScore: 77,
  verdict: "Good",
  products,
};
