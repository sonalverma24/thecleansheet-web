/**
 * mCaffeine brand data
 *
 * Ingredient list sourced from incidecoder.com (MCaffeine Naked & Rich Chocolate Body Butter,
 * corresponding to the current Choco Body Butter SKU — verified June 2026).
 * mCaffeine is an Indian D2C brand built around caffeine as the hero ingredient.
 * Sold primarily through mcaffeine.com, Nykaa, and Amazon India.
 */

import type { Brand, ProductScorecard } from "./types";

const BRAND_SLUG = "mcaffeine";
const BRAND_NAME = "mCaffeine";

const products: ProductScorecard[] = [

  /* -------------------------------------------------
     1. Choco Body Butter (250g)
     Source: mcaffeine.com + incidecoder.com
     Price: Rs. 645
  ------------------------------------------------- */
  {
    productName: "Choco Body Butter",
    slug: "choco-body-butter",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹645",
    productType: "leave-on",
    concern: "Intense moisturisation, dry skin, stretch marks, skin softening",
    summary: "mCaffeine's Choco Body Butter is a leave-on body moisturiser that positions caffeine, argan oil, and cocoa butter as its core identity. The ingredient list shows argan oil and caffeine appearing high in the formula, suggesting genuinely meaningful concentrations, while tocotrienols are an unusually premium antioxidant choice for this price bracket. Cocoa butter, despite driving the product name, appears near the very end of the ingredient list, indicating a trace-level presence, and an unspecified fragrance with no allergen breakdown is a transparency gap for sensitive users.",
    score: 65,
    scoreLabel: "Fair",
    publicDecisionLabel: "Needs proof",
    image: "https://www.mcaffeine.com/cdn/shop/files/Choco_Body_Butter_-_250g_ba042510-f01e-4aff-836c-a14ac2358368.jpg?v=1770974896",
    pillars: [
      {
        name: "Public INCI Safety Screen",
        score: 25,
        max: 30,
        note: "No parabens, no banned substances, and no prohibited ingredients under EU 1223/2009, India CR 2020, or Health Canada Hotlist are visible in this formula. Isopropyl Myristate is a high-comedogenicity ester worth noting for anyone using this on acne-prone body areas, though it carries no regulatory restriction. The preservative system uses caprylhydroxamic acid, caprylyl glycol, and ethylhexylglycerin, which is a recognised and well-tolerated combination. Triethanolamine is a standard pH adjuster; no safety concern at low concentrations. The single gap that reduces this score is the unspecified Fragrance entry with no individual allergen declarations. Under EU rules, leave-on products must declare the 26 notifiable fragrance allergens if present above threshold. Without that breakdown, consumers with fragrance sensitivities cannot assess their risk.",
      },
      {
        name: "Formula Logic Inference",
        score: 20,
        max: 25,
        note: "Argan oil and caffeine appear early in the ingredient list, suggesting concentrations high enough to perform their stated moisturising and antioxidant roles. This is a genuine differentiator for a body butter at this price. Tocotrienols also appear early in the formula, which is unusual and positive: tocotrienols are a more bioavailable form of vitamin E than the standard tocopherol found in most products. The preservative strategy is identifiable and coherent for a water-based leave-on formula. The notable formula logic gap is cocoa butter, which appears near the very end of the ingredient list despite being the central identity of the product name. At that concentration, its contribution is likely cosmetic or olfactory rather than functional. Soybean oil and caprylic/capric triglyceride are sensible emollient choices. No pH-dependent actives are present, so pH disclosure is not required for this formula type.",
      },
      {
        name: "Public Claim Support",
        score: 10,
        max: 25,
        note: "Three claims on the product listing carry the most weight and none is fully publicly supported. First, the product name implies cocoa butter as a meaningful ingredient, but cocoa butter appears near the very end of the ingredient list, indicating a trace concentration that does not match the marketing framing. Second, the '72-hour moisturization' claim is not backed by any published clinical study, protocol, or test result on this specific finished product. Third, the claim that this product 'reduces stretch marks' has no support in the visible ingredient list: no recognised stretch mark actives such as centella asiatica, Darutoside, or retinoids appear at any position in the formula. The moisturisation claim more broadly is plausible given argan oil, glycerin, and caprylic/capric triglyceride, but 72-hour duration requires specific occlusion or film-former evidence that is not publicly available. Multiple claims are stronger than the public evidence can support.",
      },
      {
        name: "Test Result Transparency",
        score: 7,
        max: 15,
        evidenceGrade: "C",
        note: "No published lab test reports, clinical study reports, ISO method references, or preservative efficacy test results are publicly accessible for this product. The brand carries a PETA India cruelty-free and vegan certification, which is a form of third-party validation, but it does not cover formula safety, efficacy, or claim substantiation. No dermatologist-tested report with method, sample size, and outcome is publicly linked. No ISO 11930 preservation test result is visible. The INCI is available via InciDecoder rather than prominently on the brand's own product page, which limits ingredient transparency at the point of purchase. A Grade C reflects that the brand maintains a public INCI and certification presence, but no test reports or clinical data are publicly accessible.",
      },
      {
        name: "Consumer Clarity",
        score: 3,
        max: 5,
        note: "Basic application instructions are present and the product format is self-explanatory. Some suitability guidance is available through the brand's general positioning. However, there is no explicit guidance on use frequency, no warning about the comedogenicity concern for body acne-prone users, and no caveat about the fragrance content for sensitive skin. The stretch mark claim on the product page is not accompanied by any honest limitation or clarification.",
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
      status: "Marketplace only",
      flags: ["INCI sourced from incidecoder.com, not prominently featured on the mCaffeine brand product page"],
    },
    keyActives: [
      {
        name: "Argania Spinosa (Argan) Oil",
        function: "Rich emollient with oleic acid, linoleic acid, tocopherols, and polyphenols; supports skin moisturisation and antioxidant protection",
        concentrationConfidence: "Medium",
      },
      {
        name: "Caffeine",
        function: "Antioxidant and anti-inflammatory; evidence for improving skin microcirculation at meaningful concentrations",
        concentrationConfidence: "Medium",
      },
      {
        name: "Tocotrienols",
        function: "A more bioavailable form of vitamin E than standard tocopherol, with stronger antioxidant activity; supports skin defence against oxidative stress",
        concentrationConfidence: "Medium",
      },
      {
        name: "Glycerin",
        function: "Humectant that draws moisture into the skin and supports barrier hydration",
        concentrationConfidence: "Medium",
      },
      {
        name: "Caprylic/Capric Triglyceride",
        function: "Coconut-derived emollient that leaves a lightweight, non-greasy skin feel",
        concentrationConfidence: "Medium",
      },
    ],
    ingredients: [
      { name: "Aqua",                                note: "Solvent base",                                                                                                  flag: "ok"   },
      { name: "Argania Spinosa (Argan) Oil",         note: "Emollient with oleic acid, linoleic acid, and tocopherols; appears early in the formula, suggesting a meaningful concentration",  flag: "ok"   },
      { name: "Caffeine",                            note: "Antioxidant and anti-inflammatory; appears early in the formula",                                                flag: "ok"   },
      { name: "Tocotrienols",                        note: "More bioavailable form of vitamin E; stronger antioxidant than standard tocopherol",                           flag: "ok"   },
      { name: "Caramel",                             note: "Natural brown colorant; gives the product its chocolate tone",                                                  flag: "ok"   },
      { name: "Sodium Gluconate",                    note: "Chelating agent; also mild skin-conditioning",                                                                  flag: "ok"   },
      { name: "Sorbitan Stearate",                   note: "Emulsifier",                                                                                                   flag: "ok"   },
      { name: "Carbomer",                            note: "Polymer thickener",                                                                                            flag: "ok"   },
      { name: "Triethanolamine",                     note: "pH adjuster; safe at low concentrations typical in finished formulas",                                          flag: "ok"   },
      { name: "Caprylhydroxamic Acid",               note: "Gentle, effective preservative with a good tolerability profile",                                               flag: "ok"   },
      { name: "Caprylyl Glycol",                     note: "Humectant and preservative booster",                                                                           flag: "ok"   },
      { name: "Glycerin",                            note: "Humectant",                                                                                                    flag: "ok"   },
      { name: "Hydrogenated Microcrystalline Wax",   note: "Petroleum-derived wax used as an emollient and thickener; no safety concern at typical use levels",            flag: "ok"   },
      { name: "Isopropyl Myristate",                 note: "Ester emollient with a high comedogenicity rating; worth avoiding on acne-prone body areas",                   flag: "info" },
      { name: "Stearic Acid",                        note: "Fatty acid used as emulsifier and emollient",                                                                  flag: "ok"   },
      { name: "Polysorbate 60",                      note: "Emulsifier",                                                                                                   flag: "ok"   },
      { name: "Glycerin (Glycerine)",                note: "Humectant; appears twice in this INCI, which may indicate a transcription duplication",                        flag: "ok"   },
      { name: "Cetostearyl Alcohol",                 note: "Fatty alcohol used as an emulsifier; non-drying and well tolerated",                                           flag: "ok"   },
      { name: "Glycine Max (Soybean) Oil",           note: "Emollient with isoflavones and phytosterols",                                                                  flag: "ok"   },
      { name: "Caprylic/Capric Triglyceride",        note: "Coconut-derived lightweight emollient",                                                                        flag: "ok"   },
      { name: "Ethylhexylglycerin",                  note: "Preservative booster; part of the identified preservation system",                                             flag: "ok"   },
      { name: "Theobroma Cacao (Cocoa) Seed Butter", note: "Emollient butter; appears near the end of the ingredient list, indicating a trace concentration despite being central to the product name",  flag: "ok"   },
      { name: "Fragrance",                           note: "Unspecified fragrance with no individual allergen declarations; consumers with fragrance sensitivities cannot assess their risk from this entry alone",  flag: "warn" },
    ],
    claimsCheck: [
      {
        claim: "Choco Body Butter (product name implies cocoa butter prominence)",
        evidenceStatus: "Missing",
        decision: "Not publicly supported",
        note: "Cocoa butter appears near the very end of the ingredient list, indicating a trace-level presence that does not match the central role implied by the product name.",
      },
      {
        claim: "72-hour moisturization",
        evidenceStatus: "Missing",
        decision: "Not publicly supported",
        note: "No published clinical study, durability test, or method reference supporting a specific 72-hour moisturisation duration is publicly accessible for this product.",
      },
      {
        claim: "Reduces stretch marks",
        evidenceStatus: "Missing",
        decision: "Not publicly supported",
        note: "No recognised stretch mark actives such as centella asiatica, madecassoside, Darutoside, or retinoids are present in the visible ingredient list at any level.",
      },
      {
        claim: "Heals dry skin",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "Argan oil and glycerin provide a plausible moisturising base, but no finished-product clinical data quantifying improvement in skin hydration or dryness is publicly visible.",
      },
    ],
    missingProof: [
      "No published lab test report or clinical study with a named lab, method, and result outcome is publicly accessible. This prevents any of the performance claims from being independently verified.",
      "The '72-hour moisturization' claim requires a finished-product corneometer or TEWL study with protocol details and outcome data to be considered publicly substantiated.",
      "The fragrance component uses a single unspecified 'Fragrance' entry with no allergen breakdown. Publishing the individual fragrance allergen status, as required for leave-on products under EU 1223/2009, would allow consumers to make an informed decision.",
      "Cocoa butter concentration is not disclosed. Given that the product name and marketing position cocoa butter as a hero ingredient, a stated percentage or evidence that cocoa butter appears meaningfully in the formula would resolve the formula logic gap.",
      "The stretch mark claim would require evidence of at least one recognised stretch mark active in the formula at a clinically relevant concentration, or a finished-product stretch mark study with a validated scale and sample size.",
    ],
    pass_badges: ["Paraben-Free", "Vegan", "Cruelty-Free (PETA)", "No Drying Alcohols", "Preservative System Identified"],
    warn_badges: ["Synthetic Fragrance", "Claim Not Publicly Substantiated"],
    info_badges: ["INCI Not on Brand Website", "Contains Penetration Enhancers"],
    indiaContext: "mCaffeine is one of the most widely distributed Indian D2C body care brands, sold prominently on Nykaa and Amazon India. The Choco Body Butter's chocolate scent and brown colour create a strong sensory identity at a mid-range price point. The argan oil and tocotrienol combination is a genuine differentiator in this category for India. Isopropyl Myristate at a late position in the formula is worth noting for users in hot, humid Indian climates where body acne is common. The product is best suited for dry, non-acne-prone areas such as legs and arms. The stretch mark claim is particularly common in Indian body care marketing but has no ingredient-level support in this formula. CDSCO registration status is not publicly confirmed on the brand's product page.",
    cleanSheetNote: "This assessment is based only on publicly available INCI, claims, and test evidence. It is not a full Clean Sheet certification. Full certification requires confidential formula review, exact concentrations, supplier documentation, manufacturing records, packaging compatibility, preservative efficacy, stability, and complete claim validation.",
    analyzedAt: "2026-06-09",
    category: "Body Care",
    subCategory: "Body Butter",
    price: 645,
    sizeValue: 250,
    sizeUnit: "g",
    pricePerUnit: 2.58,
    skinTypeTags: ["normal", "dry"],
    concernTags: ["Dry Skin", "Moisturisation"],
    suitabilityTags: ["Dry Skin", "Normal Skin", "Daily Use"],
    cautionTags: ["Unspecified Fragrance", "May be Comedogenic (Isopropyl Myristate)"],
    routineSlot: "AM+PM",
    fragranceStatus: "synthetic",
    alcoholStatus: "free",
    certificationStatus: "not-certified",
    claimsMade: ["72-hour moisturization", "Reduces stretch marks", "Heals dry skin"],
    claimsVerified: [],
    claimsNotVerified: ["72-hour moisturization — no clinical study cited", "Reduces stretch marks — no proven stretch mark actives in the INCI", "Heals dry skin — moisturisation plausible but no quantified study published"],
    availabilitySources: ["Nykaa", "mcaffeine.com", "Amazon India"],
  },

];

export const mcaffeineBrand: Brand = {
  name: BRAND_NAME,
  slug: BRAND_SLUG,
  logo: "https://www.mcaffeine.com/cdn/shop/files/Choco_Body_Butter_-_250g_ba042510-f01e-4aff-836c-a14ac2358368.jpg?v=1770974896",
  tagline: "Get addicted to good skin with caffeine",
  description: "mCaffeine is an Indian D2C personal care brand founded in 2016, built around caffeine as the hero active ingredient. The brand launched in 2016 and has grown significantly through Nykaa and Amazon India. mCaffeine is PETA India certified cruelty-free and vegan. The brand positions itself at the affordable-to-mid premium tier with a focus on sensory experience (chocolate, coffee, vanilla scents) and caffeine-forward formulations for skin and hair care.",
  founded: "2016",
  headquarters: "Mumbai, India",
  website: "https://www.mcaffeine.com",
  instagramHandle: "@mcaffeine",
  nykaaUrl: "https://www.nykaa.com/brands/mcaffeine/c/4505",
  avgScore: Math.round(products.reduce((sum, p) => sum + p.score, 0) / products.length),
  verdict: "The mCaffeine Choco Body Butter contains genuinely premium actives for its price bracket, with argan oil and caffeine appearing early in the formula and tocotrienols as an unusually strong antioxidant choice. However, cocoa butter appears near the very end of the ingredient list despite anchoring the product name, three key marketing claims lack publicly visible substantiation, and the unspecified fragrance entry offers no allergen transparency. Best suited for dry, non-acne-prone skin on the body.",
  products,
};
