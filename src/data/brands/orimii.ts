/**
 * Orimii brand data
 *
 * Ingredient list sourced from orimiiskincare.com (verified June 2026).
 * Orimii is a small Indian D2C skincare brand focused on pregnancy and postpartum skin care.
 * The Bump Hydrating Whipped Butter is designed for stretch mark hydration during pregnancy.
 * Sold in India through orimiiskincare.com and Nykaa.
 */

import type { Brand, ProductScorecard } from "./types";

const BRAND_SLUG = "orimii";
const BRAND_NAME = "Orimii";

const products: ProductScorecard[] = [

  /* -------------------------------------------------
     1. Bump Hydrating Whipped Butter (100ml)
     Source: orimiiskincare.com/products/bump-hydrating-whipped-butter
     Price: ₹695
  ------------------------------------------------- */
  {
    productName: "Bump Hydrating Whipped Butter",
    slug: "bump-hydrating-whipped-butter",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹695",
    productType: "leave-on",
    targetUser: "pregnancy",
    concern: "Stretch marks, pregnancy skin, deep moisturisation, body firming",
    summary: "Orimii's Bump Hydrating Whipped Butter is a pregnancy-positioned leave-on body butter built around a shea butter-led emollient base with targeted actives for stretch mark support. The INCI list is publicly available on the brand website and contains no retinoids, no parabens, and no restricted actives for pregnancy use, though the undisclosed 'Natural Perfume' is a transparency gap in a leave-on product intended for pregnant women. Stretch mark-related actives including Methylsilanol Hydroxyproline Aspartate, Centella Asiatica, and Pea Extract have published ingredient-level evidence, but no finished-product clinical trial is publicly cited.",
    score: 71,
    scoreLabel: "Good",
    publicDecisionLabel: "Mostly credible with gaps",
    image: "https://orimiiskincare.com/cdn/shop/files/orimii-bump-hydrating-shea-butter_1.webp?v=1756271567",
    pillars: [
      {
        name: "Public INCI Safety Screen",
        score: 24,
        max: 30,
        note: "No retinoids, no parabens, no hydroquinone, no formaldehyde releasers, and no ingredients prohibited under EU 1223/2009, India CR 2020, or the Health Canada Hotlist were identified in the publicly available INCI. This is a leave-on pregnancy product, which requires a higher standard of scrutiny. Cyclopentasiloxane (D5) is a cyclic volatile silicone permitted in leave-on products under current EU limits, though ongoing environmental persistence concerns mean it is worth noting for informed consumers. Benzyl Alcohol serves as part of the preservative system but is also a listed fragrance allergen under EU regulations. The listing of 'Natural Perfume' without any individual allergen declarations is a meaningful gap for a leave-on product used throughout pregnancy. Natural fragrance components can include potent contact sensitisers, and without an allergen breakdown, the sensitisation risk for pregnant women cannot be assessed from public data alone. No drying alcohols, no known reproductive toxicants, and no IARC-classified substances were identified.",
      },
      {
        name: "Formula Logic Inference",
        score: 22,
        max: 25,
        note: "Shea Butter appears high in the ingredient list, consistent with it being the dominant emollient, which is coherent for a body butter targeting dry, stretched pregnancy skin. The emollient matrix is well-constructed, combining Avocado Oil, Sweet Almond Oil, and Cocoa Butter for a rich but functional base. Methylsilanol Hydroxyproline Aspartate has published evidence for improving skin elasticity markers and is included at a position consistent with a functional concentration. Centella Asiatica Extract and Pisum Sativum (Pea) Extract appear in the lower portion of the ingredient list, which is typical for botanical extracts used at standard working concentrations. The preservation system is identifiable: Benzyl Alcohol and Ethylhexylglycerin are a recognised combination for this product type. No obvious formula logic conflicts were found. The 'Natural Perfume' listing without allergen detail adds a small gap in formula transparency, noted separately under Pillar 3.",
      },
      {
        name: "Public Claim Support",
        score: 14,
        max: 25,
        note: "The stretch mark positioning has ingredient-level support: Methylsilanol Hydroxyproline Aspartate has published studies on connective tissue support and stretch mark appearance, Centella Asiatica has strong evidence for collagen synthesis and wound healing, and Pisum Sativum (Pea) Extract has some clinical data on stretch mark appearance improvement. However, no finished-product trial is publicly cited for this specific formulation, so the stretch mark claim is supported at the ingredient level only. The '48-hour hydration' claim does not appear to have a publicly accessible test result with a named lab, method, or result summary. The cooling and soothing benefit from Menthol and Menthone Glycerin Acetal is well-evidenced at the ingredient level. The 'Natural Perfume' label creates a transparency gap: allergen profile cannot be assessed from public data, which matters both for claim verification and for the pregnancy context this product targets.",
      },
      {
        name: "Test Result Transparency",
        score: 7,
        max: 15,
        evidenceGrade: "C",
        note: "No finished-product clinical study, patch test report, or preservative efficacy test result is publicly accessible for this product. The brand publishes its full INCI on the product page, which reflects good basic transparency for a small Indian D2C brand. However, there is no lab name, no method documentation, and no result summary publicly visible for any of the product's efficacy or safety claims. For a pregnancy-positioned leave-on product, the absence of a finished-product tolerability or safety assessment in the public domain is a meaningful gap. Grade C reflects a brand that has achieved basic INCI transparency but has not yet published any test documentation.",
      },
      {
        name: "Consumer Clarity",
        score: 4,
        max: 5,
        note: "The product page provides clear application guidance and is honest about its pregnancy context. Use instructions and frequency guidance are present. A caution regarding the undisclosed fragrance components would strengthen guidance for pregnant consumers who may have heightened sensitivity. Suitability guidance by skin type is present and the pregnancy positioning is clearly stated.",
      },
    ],
    globalScreen: {
      eu_1223_2009: "No obvious public red flag found",
      india_cr_2020: "No obvious public red flag found",
      health_canada_hotlist: "No obvious public red flag found",
      canada_nhpid: "Triggered -- botanical and essential oil content warrants NHPID review",
      tga_australia: "Not triggered",
      us_fda_21cfr: "No obvious public red flag found",
      korea_mfds: "No obvious public red flag found",
      aicis_australia: "No obvious public red flag found",
      echa_svhc: "No obvious public red flag found",
      iarc: "No obvious carcinogenicity flag found",
    },
    inciCompleteness: {
      status: "Full INCI on brand PDP",
      flags: ["'Natural Perfume' listed without individual allergen declarations -- EU 1223/2009 requires disclosure of allergens above 0.001% in leave-on products"],
    },
    keyActives: [
      {
        name: "Butyrospermum Parkii (Shea) Butter",
        function: "Dominant emollient; barrier repair and deep moisturisation for stretched pregnancy skin",
        concentrationConfidence: "High",
      },
      {
        name: "Methylsilanol Hydroxyproline Aspartate",
        function: "Silanol-amino acid complex with published evidence for improving skin elasticity markers and reducing stretch mark appearance",
        concentrationConfidence: "Medium",
      },
      {
        name: "Centella Asiatica (Gotu Kola) Extract",
        function: "Supports wound healing, collagen synthesis, and skin repair",
        concentrationConfidence: "Medium",
      },
      {
        name: "Pisum Sativum (Pea) Extract",
        function: "Acetylcholinesterase inhibitor with some clinical data on stretch mark appearance improvement",
        concentrationConfidence: "Low",
      },
      {
        name: "Persea Gratissima (Avocado) Oil",
        function: "High oleic acid emollient with good skin penetration",
        concentrationConfidence: "Medium",
      },
      {
        name: "Menthone Glycerin Acetal / Menthol",
        function: "Cooling and soothing agents that alleviate the itching commonly associated with pregnancy skin stretching",
        concentrationConfidence: "Medium",
      },
      {
        name: "Hydrolyzed Jojoba Esters",
        function: "Film-former and emollient",
        concentrationConfidence: "Low",
      },
    ],
    ingredients: [
      { name: "Water",                                           note: "Solvent base",                                                                                                         flag: "ok"   },
      { name: "Butyrospermum Parkii (Shea) Butter",             note: "Dominant emollient; listed high in the formula, consistent with a working concentration for barrier and moisture support", flag: "ok"   },
      { name: "Dicaprylyl Ether",                               note: "Ester emollient; lightweight and non-greasy skin feel",                                                                 flag: "ok"   },
      { name: "Cyclopentasiloxane",                             note: "Cyclic silicone (D5); permitted in leave-on products under current EU limits; environmental persistence concerns are noted in ongoing regulatory review", flag: "info" },
      { name: "Cetearyl Olivate / Sorbitan Olivate",            note: "Olive-derived emulsification system; gentle and biologically compatible with skin",                                     flag: "ok"   },
      { name: "Stearyl Dimethicone / Octadecene",               note: "Silicone emollient; contributes smooth skin feel",                                                                      flag: "ok"   },
      { name: "Dimethicone",                                    note: "Silicone; provides slip and a protective skin barrier effect",                                                          flag: "ok"   },
      { name: "Isopropyl Myristate",                            note: "Ester emollient and solvent; mild comedogenic potential at higher concentrations",                                      flag: "info" },
      { name: "Propylene Glycol",                               note: "Humectant and solvent; safe at standard cosmetic concentrations",                                                       flag: "ok"   },
      { name: "Glyceryl Stearate / PEG-100 Stearate",          note: "Emulsifiers",                                                                                                           flag: "ok"   },
      { name: "Lauryl Laurate",                                 note: "Ester emollient",                                                                                                       flag: "ok"   },
      { name: "Methylsilanol Hydroxyproline Aspartate",         note: "Connective tissue supportive active; published evidence for improving stretch mark appearance",                         flag: "ok"   },
      { name: "Polysorbate 80",                                 note: "Emulsifier",                                                                                                            flag: "ok"   },
      { name: "Persea Gratissima (Avocado) Oil",               note: "High oleic acid emollient; penetrating and nourishing",                                                                 flag: "ok"   },
      { name: "Prunus Amygdalus Dulcis (Sweet Almond) Oil",    note: "Emollient; high in oleic and linoleic acids",                                                                           flag: "ok"   },
      { name: "Benzyl Alcohol / Ethylhexylglycerin / Tocopherol", note: "Preservative blend; Benzyl Alcohol is also an EU-listed fragrance allergen and worth noting in a leave-on pregnancy product", flag: "info" },
      { name: "Triethanolamine",                               note: "pH adjuster; safe at standard cosmetic concentrations",                                                                  flag: "ok"   },
      { name: "Theobroma Cacao (Cocoa) Seed Butter",           note: "Emollient; adds richness and texture",                                                                                  flag: "ok"   },
      { name: "Menthone Glycerin Acetal / Menthol",            note: "Cooling agents; help soothe pregnancy-related skin itching and discomfort",                                             flag: "ok"   },
      { name: "Tocopheryl Acetate",                            note: "Vitamin E ester; antioxidant",                                                                                          flag: "ok"   },
      { name: "Xanthan Gum",                                   note: "Natural thickener",                                                                                                     flag: "ok"   },
      { name: "Hydrolyzed Jojoba Esters",                      note: "Film-former and emollient",                                                                                             flag: "ok"   },
      { name: "Disodium EDTA",                                 note: "Chelating agent; standard formula stabiliser",                                                                          flag: "ok"   },
      { name: "Pentaerythrityl Tetra-di-t-butyl Hydroxyhydrocinnamate", note: "Advanced antioxidant; stabilises the formula from oxidative degradation",                                     flag: "ok"   },
      { name: "Diethylhexyl Syringylidenemalonate / Caprylic/Capric Triglyceride", note: "Advanced antioxidant complex",                                                                     flag: "ok"   },
      { name: "Acrylates/C10-30 Alkyl Acrylate Crosspolymer", note: "Polymer thickener",                                                                                                     flag: "ok"   },
      { name: "Centella Asiatica (Gotu Kola) Extract",         note: "Wound healing, collagen stimulation, and skin repair; well-evidenced botanical for stretch mark support",               flag: "ok"   },
      { name: "Pisum Sativum (Pea) Extract",                   note: "Some clinical data on stretch mark appearance improvement via acetylcholinesterase inhibition",                         flag: "ok"   },
      { name: "Rosa Canina (Rose) Flower Extract",             note: "Antioxidant botanical",                                                                                                 flag: "ok"   },
      { name: "Euterpe Oleracea (Acai Berry) Fruit Extract",   note: "Antioxidant-rich botanical",                                                                                            flag: "ok"   },
      { name: "Prunus Armeniaca (Apricot) Fruit Extract",      note: "Antioxidant botanical",                                                                                                 flag: "ok"   },
      { name: "Natural Perfume",                               note: "Undisclosed fragrance blend. Natural fragrances can contain potent contact allergens. No individual allergen declarations are provided, which is a transparency gap for a leave-on product used during pregnancy.", flag: "warn" },
    ],
    claimsCheck: [
      {
        claim: "Stretch mark prevention and appearance improvement",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "Ingredient-level evidence exists for Methylsilanol Hydroxyproline Aspartate, Centella Asiatica, and Pea Extract, but no finished-product clinical trial is publicly cited.",
      },
      {
        claim: "48-hour hydration",
        evidenceStatus: "Missing",
        decision: "Not publicly supported",
        note: "No test report with a named lab, method, or result summary is publicly accessible to support this specific duration claim.",
      },
      {
        claim: "Pregnancy-safe formula",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "The formula is free from retinoids, hydroquinone, and parabens, which is positive, but no published pregnancy-specific safety or toxicology review is publicly available, and the undisclosed 'Natural Perfume' leaves the allergen risk unassessed.",
      },
      {
        claim: "Cooling and soothing",
        evidenceStatus: "Evidence visible",
        decision: "Publicly supported",
        note: "Menthol and Menthone Glycerin Acetal are well-evidenced cooling and soothing agents; this functional claim is supported at the ingredient level.",
      },
    ],
    missingProof: [
      "No finished-product clinical study is publicly accessible. A completed trial with a named lab, tested batch, and result summary would directly support the stretch mark and hydration claims.",
      "The 'Natural Perfume' ingredient does not disclose individual allergen components. For a leave-on product used throughout pregnancy, a full fragrance allergen declaration would allow consumers and healthcare providers to assess sensitisation risk.",
      "No preservative efficacy test result is publicly accessible. An ISO 11930-compliant challenge test result would verify the preservation system is adequate for this water-based emulsion.",
      "Concentrations for key actives including Methylsilanol Hydroxyproline Aspartate, Centella Asiatica Extract, and Pisum Sativum Extract are not publicly stated. Disclosing these would allow the functional doses to be independently assessed.",
      "No pregnancy-specific safety or dermatologist review is publicly cited. Publishing a dermatologist-reviewed safety summary addressing the pregnancy context would strengthen consumer trust and the 'pregnancy-safe' positioning.",
    ],
    pass_badges: ["INCI Verified", "Paraben-Free", "No Drying Alcohols"],
    warn_badges: ["Fragrance Allergens Present", "Claim Not Publicly Substantiated"],
    info_badges: ["Canada NHPID Relevant", "Pregnancy-focused formula"],
    indiaContext: "Body butter during pregnancy is a key consumer category in India, where rapid weight changes and the physical demands of pregnancy create significant stretch mark risk. This product is thoughtfully designed for this need, with Methylsilanol Hydroxyproline Aspartate, Centella Asiatica, and Pea Extract as functional actives. The cooling effect of Menthol is especially relevant in India's hot and humid climate, where pregnancy-related skin itching is frequently amplified by heat. At Rs.695 for 100ml, the product is at the premium end for its size but the active ingredient profile offers more functional value than a basic shea butter at this price tier. The undisclosed 'Natural Perfume' is worth flagging for Indian consumers, particularly given the elevated Fitzpatrick III-V skin sensitisation profile and the pregnancy context.",
    cleanSheetNote: "This assessment is based only on publicly available INCI, claims, and test evidence. It is not a full Clean Sheet certification. Full certification requires confidential formula review, exact concentrations, supplier documentation, manufacturing records, packaging compatibility, preservative efficacy, stability, and complete claim validation.",
    analyzedAt: "2026-06-09",
    category: "Body Care",
    subCategory: "Body Butter",
    price: 695,
    sizeValue: 100,
    sizeUnit: "ml",
    pricePerUnit: 6.95,
    skinTypeTags: ["normal", "dry", "sensitive"],
    concernTags: ["Stretch Marks", "Pregnancy Skin", "Moisturisation", "Skin Elasticity"],
    suitabilityTags: ["Dry Skin", "Normal Skin", "Pregnancy"],
    cautionTags: ["Fragrance (Natural Perfume -- allergens undisclosed)"],
    routineSlot: "AM+PM",
    fragranceStatus: "essential-oil",
    alcoholStatus: "free",
    certificationStatus: "not-certified",
    claimsMade: ["Stretch mark prevention", "48-hour hydration", "Cooling and soothing"],
    claimsVerified: ["Cooling and soothing -- Menthol and Menthone Glycerin Acetal are well-evidenced"],
    claimsNotVerified: ["Stretch mark claim -- ingredient-level evidence only, no finished-product trial cited", "48-hour hydration -- no clinical study specific to this formula cited"],
    availabilitySources: ["Nykaa", "orimiiskincare.com"],
  },

];

export const orimiiBrand: Brand = {
  name: BRAND_NAME,
  slug: BRAND_SLUG,
  logo: "https://orimiiskincare.com/cdn/shop/files/orimii-bump-hydrating-shea-butter_1.webp?v=1756271567",
  tagline: "Designed for your bump and beyond",
  description: "Orimii is a small Indian D2C skincare brand specialising in pregnancy and postpartum skin care. The brand focuses on body care products formulated with functional actives specifically chosen to support the unique skin changes of pregnancy -- stretch marks, dryness, itching, and post-delivery recovery. Products are sold through their website and Nykaa. Orimii represents a niche but growing segment of Indian D2C beauty focused on maternal wellness.",
  founded: "2021",
  headquarters: "India",
  website: "https://orimiiskincare.com",
  instagramHandle: "@orimiiskincare",
  nykaaUrl: "https://www.nykaa.com/brands/orimii/c/10483",
  avgScore: Math.round(products.reduce((sum, p) => sum + p.score, 0) / products.length),
  verdict: "Orimii's Bump Hydrating Whipped Butter is one of the more credibly formulated pregnancy body butters in the Indian market. The combination of Methylsilanol Hydroxyproline Aspartate, Centella Asiatica, and Pea Extract provides a stretch-mark-focused active profile with ingredient-level published evidence. The shea butter-led emollient base is well-constructed for pregnancy skin. The main gap is the vague 'Natural Perfume' listing -- especially important for pregnant women who are more susceptible to skin sensitisation -- and the absence of a finished-product clinical study. Publishing fragrance allergen declarations and a product-level safety review would meaningfully strengthen the brand's transparency credentials.",
  products,
};
