/**
 * Himalaya brand data
 *
 * Ingredient list sourced from incidecoder.com (verified June 2026).
 * Himalaya Wellness Company is a Bangalore-based Indian brand founded in 1930.
 * The Rich Cocoa Butter Body Cream is among their most popular affordable body care products.
 * Sold in India across Nykaa, pharmacies, and supermarkets.
 */

import type { Brand, ProductScorecard } from "./types";

const BRAND_SLUG = "himalaya";
const BRAND_NAME = "Himalaya";

const products: ProductScorecard[] = [

  /* -------------------------------------------------
     1. Rich Cocoa Butter Body Cream (200ml)
     Source: himalayawellness.in + incidecoder.com
     Nykaa: ₹299
  ------------------------------------------------- */
  {
    productName: "Rich Cocoa Butter Body Cream",
    slug: "rich-cocoa-butter-body-cream",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹299",
    productType: "leave-on",
    concern: "Dry skin, intense moisturisation, dullness",
    summary: "Himalaya's Rich Cocoa Butter Body Cream is an affordable ester-based moisturiser for dry skin, available at ₹299 for 200ml across Indian pharmacies and online platforms. The ingredient list is largely clean with a functional Olivem 1000 emulsifier system and a plausible preservative pair, but Theobroma Cacao Seed Butter appears relatively low in the formula despite being the named hero ingredient, and an unspecified fragrance with no allergen declarations is a transparency concern for sensitive-skin users. Consumer reviews on Nykaa and Amazon India note good value for money and adequate moisturisation, but those with fragrance sensitivities or acne-prone body skin should exercise caution.",
    score: 67,
    scoreLabel: "Fair",
    publicDecisionLabel: "Needs proof",
    image: "https://himalayawellness.in/cdn/shop/products/rich-cocoa-butter-body-cream.jpg?v=1622097540",
    pillars: [
      {
        name: "Public INCI Safety Screen",
        score: 25,
        max: 30,
        note: "No parabens, no drying alcohols, no formaldehyde releasers, and no prohibited substances were identified across EU, India, US FDA, Health Canada, MFDS Korea, or ECHA SVHC lists. The preservative system uses Phenoxyethanol and Ethylhexylglycerin, both permitted under EU Annex V at standard concentrations. Isopropyl Myristate is not a regulatory concern but carries a well-known comedogenicity note, which is worth flagging for users applying the cream on the chest or upper back. The main transparency concern is the generic Fragrance listing with no individual allergen declarations. For a leave-on product, EU Annex III requires disclosure of any of the 82 listed fragrance allergens above 0.001% in leave-on products, and that information is absent from any public source. This does not make the product unsafe, but it means consumers with fragrance sensitivities cannot independently assess their risk.",
      },
      {
        name: "Formula Logic Inference",
        score: 20,
        max: 25,
        note: "The overall formula logic is coherent for a budget body cream. Aqua forms the base, followed by a blend of ester emollients including Isopropyl Myristate, Cetearyl Ethylhexanoate, and Octyldodecyl Myristate, which are listed high and suggest this is primarily an ester-driven moisturiser. Glycerin provides humectancy. Cetearyl Olivate and Sorbitan Olivate form the Olivem 1000 emulsifier system, which is a premium and gentle choice at this price point. Theobroma Cacao Seed Butter is listed well into the formula, appearing after several other emollients, which means the functional concentration of cocoa butter is likely lower than its prominent role in the product name would suggest. The preservative strategy using Phenoxyethanol and Ethylhexylglycerin is identifiable and plausible for this formula type. No pH-dependent actives are present, so the absence of a pH disclosure does not raise a compatibility concern here.",
      },
      {
        name: "Public Claim Support",
        score: 12,
        max: 25,
        note: "The product name 'Rich Cocoa Butter Body Cream' and the associated 'intense moisturisation' claims present a mixed picture. The general moisturisation claim is plausible at ingredient level, with glycerin providing humectancy and the ester base providing surface emolliency. However, the 'Rich Cocoa Butter' framing implies cocoa butter as a dominant or defining ingredient, which the publicly available INCI order does not support. Cocoa butter appears after multiple other emollients, suggesting it is not at a leading concentration. No clinical study, dermatologist test report, or consumer trial is publicly linked on the brand page or any accessible source. The INCI list itself was found only on InciDecoder and not on the Himalaya brand product page, which means even basic ingredient transparency is not brand-led. No published evidence supports the 'eliminates dryness and dullness' framing beyond general ingredient-level plausibility.",
      },
      {
        name: "Test Result Transparency",
        score: 7,
        max: 15,
        evidenceGrade: "C",
        note: "No published test reports, safety assessments, preservative efficacy data, or clinical study documentation were found for this product through public search. The brand does not link any lab certificates or third-party test results from its product page. There is no SPF claim requiring ISO 24444 testing, which keeps this simpler, but the absence of any published preservation efficacy test is a gap for a water-based leave-on product. The INCI list itself is not hosted on the brand website and was sourced from InciDecoder. This is typical for mass-market Indian personal care brands at this price tier. The grade reflects that the brand has not made meaningful test transparency information publicly accessible, even in summary form.",
      },
      {
        name: "Consumer Clarity",
        score: 3,
        max: 5,
        note: "The product page provides basic application instructions and mentions suitability for dry skin. However, there is no explicit frequency guidance, no allergen or fragrance sensitivity warning, and no patch test recommendation despite the unspecified fragrance listing. A note advising users with acne-prone body skin to consider the comedogenic potential of the ester base would improve the clarity picture. Two of the five consumer clarity criteria are adequately met; three are absent or insufficient.",
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
      flags: ["INCI not found on himalayawellness.in product page; sourced from incidecoder.com"],
    },
    keyActives: [
      {
        name: "Theobroma Cacao (Cocoa) Seed Butter",
        function: "Emollient butter with oleic and stearic fatty acids; softens and conditions dry skin",
        concentrationConfidence: "Low",
      },
      {
        name: "Glycerin",
        function: "Humectant; draws moisture to the skin surface",
        concentrationConfidence: "Medium",
      },
      {
        name: "Cetearyl Olivate / Sorbitan Olivate",
        function: "Olivem 1000 emulsifier system derived from olive oil; gentle and biologically compatible",
        concentrationConfidence: "Medium",
      },
      {
        name: "Tocopheryl Acetate",
        function: "Vitamin E ester; antioxidant and skin-conditioning",
        concentrationConfidence: "Low",
      },
    ],
    ingredients: [
      { name: "Aqua",                                 note: "Solvent base",                                                                                                           flag: "ok"   },
      { name: "Isopropyl Myristate",                  note: "Ester emollient and solvent; listed high in the formula indicating a leading concentration; carries a known comedogenicity note for acne-prone body skin",  flag: "info" },
      { name: "Glycerin",                             note: "Humectant",                                                                                                             flag: "ok"   },
      { name: "Cetearyl Ethylhexanoate",              note: "Ester emollient; lightweight and non-greasy",                                                                           flag: "ok"   },
      { name: "Octyldodecyl Myristate",               note: "Ester emollient; skin conditioning",                                                                                   flag: "ok"   },
      { name: "Cetyl Alcohol",                        note: "Fatty alcohol; contributes to texture and emulsification",                                                              flag: "ok"   },
      { name: "Glyceryl Stearate SE",                 note: "Self-emulsifying glyceryl stearate; emulsifier",                                                                       flag: "ok"   },
      { name: "Stearic Acid",                         note: "Fatty acid; emollient and emulsifier",                                                                                 flag: "ok"   },
      { name: "Theobroma Cacao (Cocoa) Seed Butter",  note: "Emollient butter; the named hero ingredient, but appears relatively low in the formula after several other emollients", flag: "ok"   },
      { name: "Cetearyl Olivate",                     note: "Olive-derived emulsifier, part of the Olivem 1000 system; very gentle",                                               flag: "ok"   },
      { name: "Sorbitan Olivate",                     note: "Olive-derived co-emulsifier, part of the Olivem 1000 system",                                                         flag: "ok"   },
      { name: "Phenoxyethanol",                       note: "Permitted preservative; within standard limits under EU Annex V",                                                      flag: "info" },
      { name: "Ethylhexylglycerin",                   note: "Preservative booster; works in combination with phenoxyethanol",                                                       flag: "ok"   },
      { name: "Fragrance",                            note: "Unspecified fragrance with no individual allergen declarations; sensitisation risk cannot be independently assessed for leave-on use",  flag: "warn" },
      { name: "Carbomer",                             note: "Polymer thickener",                                                                                                    flag: "ok"   },
      { name: "Sodium Benzoate",                      note: "Mild preservative",                                                                                                    flag: "ok"   },
      { name: "Xanthan Gum",                          note: "Natural thickener",                                                                                                    flag: "ok"   },
      { name: "Sodium Hydroxide",                     note: "pH adjuster",                                                                                                          flag: "ok"   },
      { name: "Tocopheryl Acetate",                   note: "Vitamin E ester; antioxidant and skin-conditioning",                                                                   flag: "ok"   },
      { name: "Disodium EDTA",                        note: "Chelating agent; standard ingredient in water-based formulas",                                                         flag: "ok"   },
      { name: "Caramel",                              note: "Natural brown colorant; cosmetic use only",                                                                            flag: "ok"   },
    ],
    claimsCheck: [
      {
        claim: "Rich Cocoa Butter",
        evidenceStatus: "Missing",
        decision: "Not publicly supported",
        note: "Theobroma Cacao Seed Butter appears after several other emollients in the publicly available INCI, which does not support a 'rich' or dominant cocoa butter concentration.",
      },
      {
        claim: "Intense moisturisation",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "Glycerin and the ester base provide plausible surface moisturisation at ingredient level, but no clinical study, consumer trial, or corneometry data is publicly accessible to substantiate 'intense' moisturisation.",
      },
      {
        claim: "Eliminates dryness and dullness",
        evidenceStatus: "Missing",
        decision: "Not publicly supported",
        note: "No finished-product test, consumer panel result, or published evidence supports this specific outcome claim from any publicly accessible source.",
      },
    ],
    missingProof: [
      "The full INCI list is not published on the Himalaya brand product page. Making the ingredient list directly available on himalayawellness.in would be the single most impactful transparency step.",
      "No fragrance allergen disclosure is provided for the 'Fragrance' entry. Publishing the specific fragrance components or confirming that no EU Annex III allergens are present above threshold would allow consumers with sensitivities to assess their risk.",
      "No preservative efficacy test result is publicly accessible. An ISO 11930-compliant challenge test result would confirm the Phenoxyethanol and Ethylhexylglycerin system is adequate for this water-based leave-on formula.",
      "No clinical or consumer-panel data supporting the 'intense moisturisation' or 'eliminates dryness' claims is linked from the product page. Even a basic corneometry result with sample size and method would substantiate the core moisturisation claim.",
      "The concentration of Theobroma Cacao Seed Butter is not publicly stated. Disclosing the percentage would allow the 'Rich Cocoa Butter' product name to be independently assessed.",
    ],
    pass_badges: ["Paraben-Free", "No Drying Alcohols", "Vegan", "Cruelty Free", "Preservative System Identified"],
    warn_badges: ["Synthetic Fragrance", "INCI Not on Brand Website"],
    info_badges: ["Isopropyl Myristate listed early in the formula; comedogenic note for acne-prone body skin", "Cocoa butter appears near the end of the emollient section despite the product name"],
    indiaContext: "At ₹299 for 200ml, this is one of the most accessible body creams available in India with a publicly verifiable INCI, making it a strong value option for normal to dry skin on the arms and legs. Isopropyl Myristate is listed high in the formula, which is worth noting for users in India's tropical climate who apply body cream to the chest, upper back, or shoulders, where heat-induced sweat and occlusion can exacerbate follicular congestion. The Olivem 1000 emulsifier system is a better-quality choice than is typical at this price tier. The unspecified fragrance is a concern for the Fitzpatrick III-V skin types that make up most of India's population, as these skin tones can be more reactive to fragrance-induced sensitisation. No CDSCO recall or ban was identified for this product.",
    analyzedAt: "2026-06-09",
    category: "Body Care",
    subCategory: "Body Cream",
    price: 299,
    sizeValue: 200,
    sizeUnit: "ml",
    pricePerUnit: 1.50,
    skinTypeTags: ["normal", "dry"],
    concernTags: ["Dry Skin", "Moisturisation"],
    suitabilityTags: ["Normal Skin", "Dry Skin", "Skincare Beginners"],
    cautionTags: ["May be Comedogenic (Isopropyl Myristate)", "Unspecified Fragrance"],
    routineSlot: "AM+PM",
    fragranceStatus: "synthetic",
    alcoholStatus: "free",
    certificationStatus: "not-certified",
    claimsMade: ["Intense moisturisation", "Eliminates dryness and dullness", "Rich cocoa butter"],
    claimsVerified: ["Moisturisation at ingredient level: glycerin and ester base provide surface hydration"],
    claimsNotVerified: ["'Rich Cocoa Butter' naming: cocoa butter does not appear at a dominant concentration in the publicly available INCI", "'Eliminates dryness and dullness': no published clinical or consumer-panel evidence found"],
    availabilitySources: ["Nykaa", "Amazon India", "Pharmacies"],
    cleanSheetNote: "This assessment is based only on publicly available INCI, claims, and test evidence. It is not a full Clean Sheet certification. Full certification requires confidential formula review, exact concentrations, supplier documentation, manufacturing records, packaging compatibility, preservative efficacy, stability, and complete claim validation.",
  },

];

export const himalayaBrand: Brand = {
  name: BRAND_NAME,
  slug: BRAND_SLUG,
  logo: "https://himalayawellness.in/cdn/shop/products/rich-cocoa-butter-body-cream.jpg?v=1622097540",
  tagline: "Health and happiness through nature",
  description: "Himalaya Wellness Company was founded in 1930 by Mohammed Manal in Bangalore, India. It is one of India's oldest and most trusted wellness brands, originally focused on Ayurvedic herbal formulations. The brand has expanded across pharmaceuticals, supplements, personal care, and animal health. Himalaya is PETA India certified cruelty-free and vegan. Products are manufactured in India and distributed nationwide through pharmacies, supermarkets, and online channels.",
  founded: "1930",
  headquarters: "Bangalore, India",
  website: "https://himalayawellness.in",
  instagramHandle: "@himalayawellnesscompany",
  nykaaUrl: "https://www.nykaa.com/brands/himalaya/c/1259",
  avgScore: Math.round(products.reduce((sum, p) => sum + p.score, 0) / products.length),
  verdict: "Himalaya's Rich Cocoa Butter Body Cream is a functional, budget-friendly moisturiser with a plausible ester-and-glycerin base and a premium Olivem 1000 emulsifier system for its price tier. The main concerns are a generic fragrance listing with no allergen breakdown, an INCI that is not hosted on the brand website, and a product name that overstates the cocoa butter concentration visible in the publicly available ingredient order.",
  products,
};
