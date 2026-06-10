/**
 * Mamaearth brand data
 *
 * Review type:    Web Evidence Review (public information only)
 * Engine:         The Clean Sheet Web Evidence Review Engine v2.0
 * Scoring:        5-Pillar Public Evidence Score (100 pts)
 * Review date:    June 2026
 *
 * Pillar weights (5-pillar public evidence framework):
 *   Pillar 1: Public INCI Safety Screen        max 30 pts
 *   Pillar 2: Formula Logic Inference          max 25 pts
 *   Pillar 3: Public Claim Support             max 25 pts
 *   Pillar 4: Test Result Transparency         max 15 pts
 *   Pillar 5: Consumer Clarity                 max  5 pts
 *   Total:                                         100 pts
 *
 * Sources verified:
 *   Brand website:   https://mamaearth.in
 *   Nykaa:           https://www.nykaa.com/brands/mamaearth/c/1799
 *   Amazon India:    amazon.in (verified listings)
 *   INCI sourced from mamaearth.in product pages and packaging.
 */

import type { Brand, ProductScorecard } from "./types";

const BRAND_SLUG = "mamaearth";
const BRAND_NAME = "Mamaearth";

const products: ProductScorecard[] = [

  /* -------------------------------------------------
     1. Vitamin C Daily Glow Serum with Turmeric
     Source: mamaearth.in
     Web Evidence Review - June 2026
  ------------------------------------------------- */
  {
    productName: "Vitamin C Daily Glow Serum with Turmeric",
    slug: "vitamin-c-daily-glow-serum",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹399-499",
    productType: "leave-on",
    concern: "Dullness, dark spots, uneven skin tone, brightening",
    summary: "A brightening serum using Sodium Ascorbyl Phosphate as its Vitamin C source, a stable derivative that converts to active Vitamin C on skin at a partial yield. Turmeric root extract and Niacinamide are positioned high in the formula, confirming both are present at functional concentrations. The main visible concern is Parfum listed as a single undisclosed ingredient in a daily leave-on face serum, without any individual allergen components named. No published test reports are publicly accessible for key claims.",
    score: 67,
    scoreLabel: "Fair",
    publicDecisionLabel: "Needs proof",
    image: "https://images.mamaearth.in/catalog/product/1/0/10_-vit-c-essence-serum_white_bg.jpg?format=auto&height=600",
    pillars: [
      {
        name: "Public INCI Safety Screen",
        score: 22,
        max: 30,
        note: "Full INCI is publicly available on mamaearth.in. No EU Annex II prohibited substances, no restricted parabens, no formaldehyde releasers, and no sulfates were found. Sodium Ascorbyl Phosphate has a well-established safety record. The main concern from the public ingredient list is Parfum, present in a daily leave-on face serum as a single undisclosed entry. Fragrance blends can contain dozens of individual chemical compounds, including common sensitisers such as limonene, linalool, citral, and geraniol. Under the expanded EU fragrance allergen framework, brands are expected to name individual allergens above threshold concentrations, but no fragrance components are named in this product. For a serum with all-day skin contact, the allergen identity of the fragrance blend cannot be confirmed from public data. This is a meaningful gap for consumers with sensitive or atopic skin, and it sits awkwardly alongside the brand's toxin-free positioning.",
      },
      {
        name: "Formula Logic Inference",
        score: 19,
        max: 25,
        note: "Aqua first, Sodium Ascorbyl Phosphate appearing very early in the list is consistent with it being the dominant active. Turmeric root extract and Niacinamide both appear well above the preservative system, suggesting functional concentrations. Glycerin, Sodium Hyaluronate, Aloe, and Panthenol fill a supporting hydration and barrier role. The preservation system uses Phenoxyethanol with Ethylhexylglycerin, which is a standard and adequate approach for an aqueous leave-on formula. Parfum appears after the preservative system, indicating a trace concentration, which is typical for added scent. SAP is a stable form in aqueous systems, unlike L-Ascorbic Acid, so no packaging-related stability concern arises here. Formula pH is not disclosed publicly, and pH affects how well Niacinamide and the preservation system perform.",
      },
      {
        name: "Public Claim Support",
        score: 14,
        max: 25,
        note: "The full ingredient list is publicly available. Active concentrations are not disclosed. No published test reports for dermatologist-tested, clinically proven, or hypoallergenic claims are accessible on the brand website or product page. The brand's MADE SAFE certification is real and excludes a defined list of harmful chemicals, but MADE SAFE does not substantiate efficacy claims. The 10% Vitamin C marketing claim likely refers to Sodium Ascorbyl Phosphate, but SAP requires conversion on skin and the effective brightening yield reaching skin cells is a fraction of what the label implies. This partial bioavailability compared to 3-O-Ethyl Ascorbic Acid or L-Ascorbic Acid is not communicated to consumers. Niacinamide is present but its concentration is not confirmed. The Turmeric brightening claim is heritage-based and not substantiated by clinical evidence at leave-on serum concentrations from public sources. Toxin-free is not a defined regulatory term and adds no verifiable consumer protection.",
      },
      {
        name: "Test Result Transparency",
        score: 8,
        max: 15,
        evidenceGrade: "C",
        note: "Full INCI is on mamaearth.in and is largely consistent across Nykaa and Amazon listings, which confirms basic ingredient transparency. MADE SAFE certification is real and publicly verifiable. No published test reports for product-level claims such as dermatologist tested, clinically proven, or hypoallergenic are accessible. Parfum is listed without any individual fragrance compound names, which is a transparency gap. Active concentrations for Vitamin C and Niacinamide are not publicly disclosed. No batch or expiry traceability information is visible. The brand earns a Grade C: some transparency through INCI disclosure and third-party certification, but no method, lab name, or clinical result is publicly visible.",
      },
      {
        name: "Consumer Clarity",
        score: 3,
        max: 5,
        note: "Application instructions and frequency guidance are present on the product page. Suitability for skin types is communicated. However, no explicit warning about fragrance allergen risk is present, no caveat about SAP bioavailability versus L-Ascorbic Acid appears on pack, and no layering guidance for consumers using this alongside other actives is provided.",
      },
    ],
    globalScreen: {
      eu_1223_2009: "No obvious public red flag found",
      india_cr_2020: "No obvious public red flag found. Mamaearth is a CDSCO-registered brand under Honasa Consumer Ltd.",
      health_canada_hotlist: "No obvious public red flag found",
      canada_nhpid: "Triggered. Curcuma Longa Root Extract is an Ayurvedic botanical relevant to NHPID review.",
      tga_australia: "Not triggered",
      us_fda_21cfr: "No obvious public red flag found",
      korea_mfds: "No obvious public red flag found",
      aicis_australia: "No obvious public red flag found",
      echa_svhc: "No obvious public red flag found",
      iarc: "No obvious carcinogenicity flag found",
    },
    inciCompleteness: {
      status: "Full INCI on brand PDP",
      flags: ["Parfum listed without individual allergen component names"],
    },
    keyActives: [
      {
        name: "Sodium Ascorbyl Phosphate",
        function: "Stable Vitamin C derivative, brightening and antioxidant. Requires conversion to L-Ascorbic Acid on skin at partial yield. Confirmed as the dominant active by position in the formula.",
        concentrationConfidence: "Medium",
      },
      {
        name: "Curcuma Longa Root Extract",
        function: "Turmeric extract, anti-inflammatory and antioxidant. Heritage brightening ingredient. Appears high in the formula suggesting a meaningful concentration.",
        concentrationConfidence: "Medium",
      },
      {
        name: "Niacinamide",
        function: "Vitamin B3. Inhibits melanosome transfer, reduces post-inflammatory hyperpigmentation, regulates sebum. Appears above the preservative system, indicating a functional level.",
        concentrationConfidence: "Medium",
      },
      {
        name: "Sodium Hyaluronate",
        function: "Surface hydration and skin plumping. Molecular weight not publicly disclosed.",
        concentrationConfidence: "Medium",
      },
      {
        name: "Panthenol",
        function: "Vitamin B5, barrier repair and moisture retention.",
        concentrationConfidence: "Low",
      },
    ],
    ingredients: [
      { name: "Aqua",                          note: "Solvent base",                                                                                                                                                                    flag: "ok"   },
      { name: "Sodium Ascorbyl Phosphate",     note: "Stable Vitamin C derivative. Appears very early in the formula, consistent with the hero active claim. Converts to L-Ascorbic Acid on skin at partial yield.",                    flag: "ok"   },
      { name: "Curcuma Longa Root Extract",    note: "Turmeric extract, anti-inflammatory and antioxidant. Appears high in the formula indicating meaningful inclusion.",                                                                flag: "ok"   },
      { name: "Niacinamide",                   note: "Vitamin B3. Appears above the preservative system, suggesting a functional concentration. Melanosome inhibitor and sebum regulator.",                                             flag: "ok"   },
      { name: "Glycerin",                      note: "Humectant, moisture retention.",                                                                                                                                                  flag: "ok"   },
      { name: "Sodium Hyaluronate",            note: "Hyaluronic acid salt. Surface hydration and skin-plumping. Molecular weight not disclosed.",                                                                                      flag: "ok"   },
      { name: "Aloe Barbadensis Leaf Extract", note: "Aloe vera, soothing and anti-inflammatory.",                                                                                                                                      flag: "ok"   },
      { name: "Panthenol",                     note: "Vitamin B5, barrier repair and hydration.",                                                                                                                                       flag: "ok"   },
      { name: "Allantoin",                     note: "Soothing and skin-repairing. Low sensitisation risk.",                                                                                                                            flag: "ok"   },
      { name: "Carbomer",                      note: "Polymer gelling agent. Safe at cosmetic use levels.",                                                                                                                             flag: "ok"   },
      { name: "Xanthan Gum",                   note: "Natural fermentation-derived thickener.",                                                                                                                                         flag: "ok"   },
      { name: "Phenoxyethanol",                note: "Preservative. Within the EU and India permitted 1% limit. Marks the likely threshold below which subsequent ingredients appear at low concentrations.",                            flag: "info" },
      { name: "Ethylhexylglycerin",            note: "Preservative booster. Low concern.",                                                                                                                                             flag: "ok"   },
      { name: "Parfum",                        note: "Undisclosed fragrance blend. Listed after the preservative system, suggesting a trace concentration, but allergen identity cannot be confirmed from the public ingredient list. No individual fragrance allergen components are named. This is the highest concern ingredient in this formula for daily leave-on face use.", flag: "warn" },
      { name: "Sodium Hydroxide",              note: "pH adjuster. Fully neutralised in the finished formula.",                                                                                                                         flag: "ok"   },
      { name: "Citric Acid",                   note: "pH buffer. At this position in the formula, it is not functioning as a chemical exfoliant.",                                                                                      flag: "ok"   },
    ],
    claimsCheck: [
      {
        claim: "10% Vitamin C",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "The brand states 10% Vitamin C but uses Sodium Ascorbyl Phosphate, a pro-vitamin that converts to active Vitamin C on skin at partial yield. The implied potency comparison with L-Ascorbic Acid or EAA is not publicly substantiated.",
      },
      {
        claim: "MADE SAFE Certified",
        evidenceStatus: "Evidence visible",
        decision: "Publicly supported",
        note: "MADE SAFE certification is real, publicly verifiable, and excludes a defined list of harmful chemicals. It does not substantiate efficacy claims.",
      },
      {
        claim: "Dermatologist Tested",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "No test report with lab name, method, sample size, or result is publicly accessible. The badge alone does not meet the standard for Evidence visible.",
      },
      {
        claim: "Fragrance Free / Toxin Free",
        evidenceStatus: "Missing",
        decision: "Not publicly supported",
        note: "Parfum is present in the ingredient list. Toxin-free has no regulatory definition and does not constitute a verifiable safety claim.",
      },
    ],
    missingProof: [
      "Formula pH is not publicly disclosed. This matters because Niacinamide stability and preservative efficacy both depend on pH, and SAP conversion rate is also pH-dependent.",
      "Active concentrations for Sodium Ascorbyl Phosphate and Niacinamide are not stated publicly. Without confirmed percentages, the strength of brightening claims cannot be independently verified.",
      "No individual fragrance allergen components are named in the ingredient list. EU Regulation 2023/1545 expects named allergens above threshold concentrations in leave-on products. Publishing the full fragrance breakdown would close this transparency gap.",
      "No published test report is publicly accessible for the dermatologist tested or clinically proven claims. A report with lab name, method, sample size, and result would allow these claims to be independently assessed.",
    ],
    pass_badges: ["INCI Verified", "MADE SAFE Certified", "Paraben-Free", "Sulfate-Free", "Cruelty-Free"],
    warn_badges: ["Synthetic Fragrance", "Claim Not Publicly Substantiated"],
    info_badges: ["Ayurveda-Aligned", "Canada NHPID Relevant", "Dermatologically Tested (Citation Absent)"],
    indiaContext: "Sodium Ascorbyl Phosphate is more heat-stable than L-Ascorbic Acid, which is a genuine advantage in India's warm climate where pure Vitamin C oxidises rapidly. The conversion step means results build more slowly than serums using 3-O-Ethyl Ascorbic Acid. Particularly useful for Fitzpatrick III-V skin for mild post-inflammatory hyperpigmentation reduction. Fragrance sensitivity can be heightened in hot weather when skin is flushed and more permeable. Consumers with reactive or atopic skin should consider patch testing before daily use.",
    cleanSheetNote: "This assessment is based only on publicly available INCI, claims, and test evidence. It is not a full Clean Sheet certification. Full certification requires confidential formula review, exact concentrations, supplier documentation, manufacturing records, packaging compatibility, preservative efficacy, stability, and complete claim validation.",
    analyzedAt: "2026-06-10",
    category: "Serums",
    subCategory: "Vitamin C Serum",
    concernTags: ["Dullness", "Pigmentation", "Tanning", "Post Acne Marks"],
    suitabilityTags: ["Dark Spots and Pigmentation", "Daily Use", "Melanin Rich Skin"],
    cautionTags: ["Contains Fragrance", "Fragrance Allergen Flag", "Active % Not Verified", "Clinical Claim Not Verified"],
    fragranceStatus: "synthetic",
    routineSlot: "AM+PM",
  },

  /* -------------------------------------------------
     2. Ubtan Natural Face Wash with Turmeric & Saffron
     Source: mamaearth.in
     Web Evidence Review - June 2026
  ------------------------------------------------- */
  {
    productName: "Ubtan Natural Face Wash with Turmeric & Saffron",
    slug: "ubtan-natural-face-wash",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹199-249",
    productType: "rinse-off",
    concern: "Dull skin, uneven tone, gentle brightening, cleansing",
    summary: "A rinse-off gel cleanser built around a mild, sulfate-free surfactant system with Cocamidopropyl Betaine and Sodium Lauryl Sulfoacetate, supported by traditional Indian brightening botanicals including Chickpea flour, Turmeric, and Saffron. As a rinse-off product, contact time is brief, which limits how much the botanical actives can contribute to visible brightening. The sulfate-free surfactant system is a genuine formulation advantage over SLS-based alternatives for daily use. Parfum is present, with a meaningfully lower concern profile in a rinse-off cleanser than in a leave-on product.",
    score: 74,
    scoreLabel: "Good",
    publicDecisionLabel: "Mostly credible with gaps",
    image: "https://images.mamaearth.in/catalog/product/u/b/ubtan_fw_100ml_.jpg?format=auto&height=600",
    pillars: [
      {
        name: "Public INCI Safety Screen",
        score: 26,
        max: 30,
        note: "Full INCI publicly available. No banned substances, no restricted parabens, no formaldehyde releasers. Sodium Lauryl Sulfoacetate is a milder surfactant than Sodium Lauryl Sulfate, with lower irritation potential for most skin types, though it can cause dryness with daily use on very sensitive or eczema-prone skin. Cocamidopropyl Betaine is widely tolerated with only rare sensitisation in certain individuals. Parfum is present, but in a rinse-off cleanser the sensitisation concern is considerably lower than in a leave-on product, because the formula is washed away and cumulative exposure is short. No individual fragrance allergens are named, which remains a transparency gap even in a rinse-off context. Chickpea flour, Turmeric, and Saffron extracts are all well-tolerated botanicals with no significant safety flags at cosmetic use levels.",
      },
      {
        name: "Formula Logic Inference",
        score: 20,
        max: 25,
        note: "Formula structure is appropriate for a rinse-off gel cleanser. Cocamidopropyl Betaine and Sodium Lauryl Sulfoacetate together establish a mild surfactant system. Chickpea flour appearing well up in the formula suggests a meaningful inclusion for mild physical exfoliation. Turmeric and Saffron extracts appear at moderate positions. Their anti-inflammatory and antioxidant properties are genuine, but effective brightening from these actives requires prolonged topical contact that a rinse-off format cannot provide. The sulfate-free surfactant system preserves the skin's acid mantle better than SLS-based cleansers. Phenoxyethanol and Ethylhexylglycerin provide adequate preservation for the rinse-off vehicle. No stability concerns are visible from the public formula.",
      },
      {
        name: "Public Claim Support",
        score: 16,
        max: 25,
        note: "Full INCI available. Active concentrations are not disclosed. No published test reports found for brightening efficacy, dermatologist testing, or clinical studies. MADE SAFE certified. The brightening claim rests on traditional ubtan heritage and ingredient associations rather than clinical evidence at rinse-off contact times. The real ubtan tradition used concentrated pastes left on skin for extended contact periods, which a face wash does not replicate. SLSA is described in brand materials as coconut-derived, which is accurate but understates the degree of industrial processing involved. Toxin-free has no regulatory definition and does not add verifiable consumer protection. None of the performance claims are substantiated by publicly available clinical or test evidence.",
      },
      {
        name: "Test Result Transparency",
        score: 8,
        max: 15,
        evidenceGrade: "C",
        note: "Full INCI on mamaearth.in is consistent across Nykaa and Amazon. MADE SAFE certification is publicly verifiable. No published test reports for any of the product claims. Parfum listed without individual fragrance compound names. Active concentrations not disclosed. The rinse-off format reduces the practical concern of some of these gaps relative to leave-on products. Grade C: some basic transparency through INCI disclosure and third-party certification, but no clinical method, lab name, or result is publicly visible.",
      },
      {
        name: "Consumer Clarity",
        score: 4,
        max: 5,
        note: "Application instructions, frequency guidance for daily cleansing, and skin type suitability are clearly communicated. A note that brightening botanicals in a rinse-off product work differently than in a leave-on treatment would be a valuable honest caveat for consumer decision-making.",
      },
    ],
    globalScreen: {
      eu_1223_2009: "No obvious public red flag found",
      india_cr_2020: "No obvious public red flag found. Mamaearth is a CDSCO-registered brand under Honasa Consumer Ltd.",
      health_canada_hotlist: "No obvious public red flag found",
      canada_nhpid: "Triggered. Curcuma Longa Root Extract and Crocus Sativus Extract are botanicals relevant to NHPID review.",
      tga_australia: "Not triggered",
      us_fda_21cfr: "No obvious public red flag found",
      korea_mfds: "No obvious public red flag found",
      aicis_australia: "No obvious public red flag found",
      echa_svhc: "No obvious public red flag found",
      iarc: "No obvious carcinogenicity flag found",
    },
    inciCompleteness: {
      status: "Full INCI on brand PDP",
      flags: ["Parfum listed without individual allergen component names"],
    },
    keyActives: [
      {
        name: "Cicer Arietinum (Chickpea) Flour",
        function: "Mild physical exfoliant and smoothing agent. Traditional ubtan component. Appears well up in the formula, suggesting a meaningful inclusion.",
        concentrationConfidence: "Medium",
      },
      {
        name: "Curcuma Longa Root Extract",
        function: "Turmeric, anti-inflammatory and antioxidant. Heritage brightening ingredient. Rinse-off contact time limits functional brightening contribution.",
        concentrationConfidence: "Medium",
      },
      {
        name: "Crocus Sativus (Saffron) Extract",
        function: "Antioxidant. Cultural heritage ingredient. Rinse-off use at trace concentration provides minimal active benefit.",
        concentrationConfidence: "Low",
      },
      {
        name: "Cocamidopropyl Betaine",
        function: "Mild amphoteric surfactant and foam booster. Low irritation potential for most users.",
        concentrationConfidence: "High",
      },
    ],
    ingredients: [
      { name: "Aqua",                             note: "Solvent base.",                                                                                                                              flag: "ok"   },
      { name: "Cocamidopropyl Betaine",           note: "Mild amphoteric surfactant. Rare sensitisation in a small number of individuals with confirmed CAPB allergy.",                               flag: "ok"   },
      { name: "Sodium Lauryl Sulfoacetate",       note: "SLSA. Milder than SLS and sulfate-free by classification. Confirmed as a main cleansing agent by its position in the formula.",            flag: "ok"   },
      { name: "Cicer Arietinum (Chickpea) Flour", note: "Traditional exfoliant. Mild physical buffing. Position in the formula indicates meaningful inclusion.",                                     flag: "ok"   },
      { name: "Curcuma Longa Root Extract",       note: "Turmeric extract. Anti-inflammatory and antioxidant. Rinse-off contact time limits any brightening clinical effect.",                      flag: "ok"   },
      { name: "Crocus Sativus (Saffron) Extract", note: "Saffron, antioxidant. Rinse-off use at trace concentration provides minimal functional active effect.",                                    flag: "ok"   },
      { name: "Glycerin",                         note: "Humectant. Offsets the mild drying effect of surfactants during cleansing.",                                                                flag: "ok"   },
      { name: "Allantoin",                        note: "Soothing. Buffers any cleansing-related irritation.",                                                                                       flag: "ok"   },
      { name: "Carbomer",                         note: "Polymer thickener.",                                                                                                                        flag: "ok"   },
      { name: "Xanthan Gum",                      note: "Natural thickener.",                                                                                                                        flag: "ok"   },
      { name: "Phenoxyethanol",                   note: "Preservative. Within the EU and India permitted 1% limit.",                                                                                 flag: "info" },
      { name: "Ethylhexylglycerin",               note: "Preservative booster.",                                                                                                                     flag: "ok"   },
      { name: "Parfum",                           note: "Fragrance blend. Sensitisation concern is substantially lower in a rinse-off format than in a leave-on product. Individual allergen components are not named in the public ingredient list.", flag: "info" },
      { name: "Sodium Hydroxide",                 note: "pH adjuster.",                                                                                                                              flag: "ok"   },
      { name: "Citric Acid",                      note: "pH buffer.",                                                                                                                                flag: "ok"   },
    ],
    claimsCheck: [
      {
        claim: "Brightening with Turmeric and Saffron",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "Both botanicals are present in the ingredient list, but their brightening effect in a rinse-off formula with brief skin contact has not been substantiated by published clinical evidence.",
      },
      {
        claim: "MADE SAFE Certified",
        evidenceStatus: "Evidence visible",
        decision: "Publicly supported",
        note: "MADE SAFE certification is real, publicly verifiable, and excludes a defined list of harmful chemicals. It does not substantiate efficacy claims.",
      },
      {
        claim: "Sulfate-Free",
        evidenceStatus: "Evidence visible",
        decision: "Publicly supported",
        note: "The ingredient list confirms the absence of Sodium Lauryl Sulfate and Sodium Laureth Sulfate. SLSA is present but is classified as sulfate-free.",
      },
      {
        claim: "Dermatologist Tested",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "No test report with lab name, method, sample size, or result is publicly accessible.",
      },
    ],
    missingProof: [
      "No published clinical or test evidence supports the brightening claim at rinse-off contact times. A patch test or clinical efficacy study with the finished product, lab name, method, and result would substantiate this.",
      "Active concentrations for Turmeric and Saffron extracts are not publicly disclosed. Without confirmed percentages, the functional contribution of these ingredients cannot be assessed from public data.",
      "Parfum is listed without individual fragrance allergen components named. A full fragrance breakdown would allow consumers with known sensitivities to make an informed decision.",
    ],
    pass_badges: ["INCI Verified", "MADE SAFE Certified", "Sulfate-Free", "Paraben-Free", "Cruelty-Free"],
    warn_badges: ["Claim Not Publicly Substantiated"],
    info_badges: ["Ayurveda-Aligned", "Canada NHPID Relevant"],
    indiaContext: "The ubtan ritual traditionally used freshly prepared pastes left on skin for extended contact time, providing significantly more active exposure than a rinse-off face wash. This product captures the cultural identity and ingredient heritage without replicating the traditional application method. As a daily gentle cleanser with a pleasant skin feel, it performs well for Indian skin in humid conditions. Use it for cleansing quality and mild exfoliation rather than expecting the brightening results of a targeted leave-on treatment.",
    cleanSheetNote: "This assessment is based only on publicly available INCI, claims, and test evidence. It is not a full Clean Sheet certification. Full certification requires confidential formula review, exact concentrations, supplier documentation, manufacturing records, packaging compatibility, preservative efficacy, stability, and complete claim validation.",
    analyzedAt: "2026-06-10",
    category: "Face Cleansers",
    subCategory: "Foaming Cleanser",
    concernTags: ["Dullness", "Texture"],
    suitabilityTags: ["Skincare Beginners", "Daily Use", "Combination Skin"],
    cautionTags: ["Clinical Claim Not Verified"],
    fragranceStatus: "synthetic",
    routineSlot: "AM+PM",
  },

  /* -------------------------------------------------
     3. Aqua Glow Gel Moisturizer with Hyaluronic Acid
     Source: mamaearth.in
     Web Evidence Review - June 2026
  ------------------------------------------------- */
  {
    productName: "Aqua Glow Gel Moisturizer with Hyaluronic Acid",
    slug: "aqua-glow-gel-moisturizer",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹299-399",
    productType: "leave-on",
    concern: "Lightweight hydration, dewy finish, oily and combination skin",
    summary: "A lightweight gel moisturizer with a Glycerin and Sodium Hyaluronate humectant base, Niacinamide at a functional position in the formula, and Centella Asiatica for anti-inflammatory support. The formula is well-suited to its purpose as a daily hydrator for oily and combination skin. Parfum is present in this daily leave-on product. Daily repeated exposure is the primary route by which fragrance sensitisation develops over time, making the undisclosed allergen identity a persistent concern for this product category. No published test reports are publicly accessible.",
    score: 68,
    scoreLabel: "Fair",
    publicDecisionLabel: "Needs proof",
    image: "https://images.mamaearth.in/catalog/product/a/q/aqua-glow-gel-face-moisturizer-1_1.jpg?format=auto&height=600",
    pillars: [
      {
        name: "Public INCI Safety Screen",
        score: 22,
        max: 30,
        note: "Full INCI publicly available. No banned substances, no restricted parabens, no formaldehyde releasers, no AHAs, no retinoids. Glycerin, Sodium Hyaluronate, Niacinamide, Centella Asiatica, and Panthenol all have excellent safety profiles. Carbomer is a synthetic polymer that is safe at cosmetic concentrations. The primary concern from the public ingredient list is Parfum, an undisclosed fragrance blend in a product designed for daily leave-on use on the face. Unlike a rinse-off product, a moisturizer maintains contact with skin throughout the day, and this daily repeated exposure is the primary mechanism by which fragrance sensitisation develops over time. No individual fragrance allergen components are named, which is a persistent transparency gap across this brand's leave-on range.",
      },
      {
        name: "Formula Logic Inference",
        score: 20,
        max: 25,
        note: "Aqua first. Glycerin appearing very early in the formula is a well-designed choice for a gel moisturizer targeting oily skin. Sodium Hyaluronate and Niacinamide both appear above the preservative system, which is consistent with functional concentrations. Centella Asiatica and Panthenol appear at moderate positions, contributing anti-inflammatory and barrier support. The gel texture is achieved with Carbomer and Xanthan Gum, which are standard and safe gelling agents. Phenoxyethanol and Ethylhexylglycerin provide adequate preservation. Formula pH is not disclosed publicly. No penetration enhancers are present, which means active delivery is at the skin surface level. No significant stability concerns from the public formula.",
      },
      {
        name: "Public Claim Support",
        score: 14,
        max: 25,
        note: "Full INCI available. Active concentrations are not publicly disclosed. No published test reports for the glow, hydration, dermatologist tested, or non-comedogenic claims are found on the product page or brand website. MADE SAFE certified. Sodium Hyaluronate appears at a functional position in the formula, making the hydration claim plausible from public INCI evidence. Niacinamide appears at a functional position, and its sebum-regulating and barrier-supporting benefit is plausible. The Aqua Glow branding implies a luminosity mechanism that is not mechanistically linked to any ingredient in the formula at a disclosed concentration. This is aspirational marketing language rather than a claim verified by public evidence. Toxin-free has no regulatory definition.",
      },
      {
        name: "Test Result Transparency",
        score: 8,
        max: 15,
        evidenceGrade: "C",
        note: "Full INCI on mamaearth.in, consistent across Nykaa and Amazon. MADE SAFE certification publicly verifiable. No published test reports for any product claims. Parfum listed without individual compound names. Active concentrations not disclosed. Hyaluronic acid molecular weight, which determines surface versus deeper hydration, is not communicated. Grade C: basic transparency through INCI and third-party certification, but no lab name, method, or clinical result is publicly accessible.",
      },
      {
        name: "Consumer Clarity",
        score: 3,
        max: 5,
        note: "Application instructions, frequency guidance for daily use, and skin type suitability for oily and combination skin are communicated. No explicit warning about fragrance allergen risk is present, and no layering guidance for consumers using this alongside actives such as Vitamin C or retinol serums is provided.",
      },
    ],
    globalScreen: {
      eu_1223_2009: "No obvious public red flag found",
      india_cr_2020: "No obvious public red flag found. Mamaearth is a CDSCO-registered brand under Honasa Consumer Ltd.",
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
      flags: ["Parfum listed without individual allergen component names", "Active concentrations not disclosed"],
    },
    keyActives: [
      {
        name: "Sodium Hyaluronate",
        function: "Hyaluronic acid salt. Surface hydration and skin plumping. Appears above the preservative system, consistent with a functional concentration. Molecular weight not disclosed.",
        concentrationConfidence: "Medium",
      },
      {
        name: "Niacinamide",
        function: "Vitamin B3. Sebum regulation, pore appearance reduction, and skin barrier strengthening. Appears above the preservative system, consistent with a functional level.",
        concentrationConfidence: "Medium",
      },
      {
        name: "Centella Asiatica Extract",
        function: "Anti-inflammatory and skin barrier support. Relevant for post-blemish or reactive skin.",
        concentrationConfidence: "Medium",
      },
      {
        name: "Glycerin",
        function: "Humectant. Dominant moisture-binding agent, appearing very early in the formula.",
        concentrationConfidence: "High",
      },
    ],
    ingredients: [
      { name: "Aqua",                           note: "Solvent base.",                                                                                                                          flag: "ok"   },
      { name: "Glycerin",                       note: "Humectant. Dominant moisture-binding agent, listed very early in the formula.",                                                          flag: "ok"   },
      { name: "Sodium Hyaluronate",             note: "Hyaluronic acid salt. Surface hydration. Appears above the preservative system, suggesting a functional concentration. Molecular weight not disclosed.", flag: "ok" },
      { name: "Niacinamide",                    note: "Vitamin B3. Appears above the preservative system, suggesting a functional concentration. Sebum regulator and barrier-strengthening active.", flag: "ok"   },
      { name: "Aloe Barbadensis Leaf Extract",  note: "Aloe vera, soothing and anti-inflammatory.",                                                                                             flag: "ok"   },
      { name: "Centella Asiatica Extract",      note: "Anti-inflammatory and barrier repair support. Functional at cosmetic use levels.",                                                      flag: "ok"   },
      { name: "Panthenol",                      note: "Vitamin B5, barrier repair and moisture retention.",                                                                                     flag: "ok"   },
      { name: "Allantoin",                      note: "Soothing agent. Low sensitisation risk.",                                                                                                flag: "ok"   },
      { name: "Carbomer",                       note: "Synthetic polymer gelling agent. Safe at cosmetic concentrations.",                                                                      flag: "ok"   },
      { name: "Xanthan Gum",                    note: "Natural thickener.",                                                                                                                     flag: "ok"   },
      { name: "Phenoxyethanol",                 note: "Preservative. Within the EU and India permitted 1% limit. Marks the likely threshold below which subsequent ingredients appear at low concentrations.", flag: "info" },
      { name: "Ethylhexylglycerin",             note: "Preservative booster.",                                                                                                                  flag: "ok"   },
      { name: "Parfum",                         note: "Undisclosed fragrance blend. Daily leave-on use on face means repeated exposure accumulates over months. No individual allergen components are named in the public ingredient list.", flag: "warn" },
      { name: "Sodium Hydroxide",               note: "pH adjuster. Fully neutralised in the finished formula.",                                                                                flag: "ok"   },
      { name: "Citric Acid",                    note: "pH buffer. At this position in the formula, not functioning as a chemical exfoliant.",                                                   flag: "ok"   },
    ],
    claimsCheck: [
      {
        claim: "Hydration with Hyaluronic Acid",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "Sodium Hyaluronate appears at a functional position in the formula and its humectant mechanism is well-established, but no published test result or clinical data confirms the hydration magnitude claimed for the finished product.",
      },
      {
        claim: "MADE SAFE Certified",
        evidenceStatus: "Evidence visible",
        decision: "Publicly supported",
        note: "MADE SAFE certification is real and publicly verifiable. It excludes a defined list of harmful chemicals but does not validate efficacy claims.",
      },
      {
        claim: "Dermatologist Tested",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "No test report with lab name, method, sample size, or result is publicly accessible.",
      },
      {
        claim: "Non-Comedogenic",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "No finished product non-comedogenic test result is publicly published. The gel format and absence of heavy oils makes a non-comedogenic profile plausible, but the claim is not substantiated by publicly visible evidence.",
      },
    ],
    missingProof: [
      "Formula pH is not publicly disclosed. This matters because Niacinamide stability and preservative efficacy both depend on pH.",
      "Active concentrations for Niacinamide and Sodium Hyaluronate are not publicly stated. Without confirmed percentages, the functional dose cannot be independently verified.",
      "No published test report is publicly accessible for dermatologist tested, non-comedogenic, or hydration claims. A report with lab name, method, sample size, and result would allow these to be assessed.",
      "Parfum is listed without individual fragrance allergen components. Publishing the fragrance breakdown would allow consumers with known sensitivities to make an informed choice.",
    ],
    pass_badges: ["INCI Verified", "MADE SAFE Certified", "Paraben-Free", "Sulfate-Free", "Cruelty-Free"],
    warn_badges: ["Synthetic Fragrance", "Claim Not Publicly Substantiated"],
    info_badges: ["India Climate Optimized", "Dermatologically Tested (Citation Absent)"],
    indiaContext: "A gel moisturizer is the right format for India's humid climate. The absence of heavy emollients prevents the greasy, pore-blocking feel that cream moisturisers cause in high humidity. Niacinamide at a functional concentration helps regulate sebum, particularly relevant during summer and monsoon months. Use under SPF during the day. For consumers with a history of fragrance sensitivity or atopic dermatitis, the undisclosed Parfum in this formula warrants a patch test before committing to daily use.",
    cleanSheetNote: "This assessment is based only on publicly available INCI, claims, and test evidence. It is not a full Clean Sheet certification. Full certification requires confidential formula review, exact concentrations, supplier documentation, manufacturing records, packaging compatibility, preservative efficacy, stability, and complete claim validation.",
    analyzedAt: "2026-06-10",
    category: "Moisturizers",
    subCategory: "Gel Moisturizer",
    concernTags: ["Dehydrated Skin", "Oily Skin", "Dullness"],
    suitabilityTags: ["Oily Skin", "Combination Skin", "Skincare Beginners"],
    cautionTags: ["Contains Fragrance", "Fragrance Allergen Flag"],
    fragranceStatus: "synthetic",
    routineSlot: "AM+PM",
  },

  /* -------------------------------------------------
     4. Retinol & Bakuchiol Youth Boost Night Cream
     Source: mamaearth.in
     Web Evidence Review - June 2026
  ------------------------------------------------- */
  {
    productName: "Retinol & Bakuchiol Youth Boost Night Cream",
    slug: "retinol-bakuchiol-night-cream",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹499-599",
    productType: "leave-on",
    concern: "Anti-ageing, fine lines, skin texture, firmness",
    summary: "A night cream combining Retinol and Bakuchiol with Shea Butter and Glycerin in an aqueous cream base. Both actives are present in the ingredient list and are supported by clinical literature at appropriate concentrations. Neither Retinol nor Bakuchiol concentration is publicly disclosed, which is a critical gap for a retinol product where the percentage determines how to introduce it and what to expect. Parfum is present in this leave-on retinol night cream, and since Retinol accelerates skin cell turnover and can temporarily thin the outer skin layer during the adjustment phase, combining it with an undisclosed fragrance blend increases the potential for sensitisation. Not suitable for use during pregnancy.",
    score: 60,
    scoreLabel: "Fair",
    publicDecisionLabel: "Needs proof",
    image: "https://images.mamaearth.in/catalog/product/r/e/retinol-night-cream-1_1_bf3clpgk1y3nzzr9.jpg?format=auto&height=600",
    pillars: [
      {
        name: "Public INCI Safety Screen",
        score: 19,
        max: 30,
        note: "Retinol and Bakuchiol are both present in the ingredient list. All Vitamin A derivatives, including Retinol, carry a mandatory pregnancy contraindication and should not be used during pregnancy or when trying to conceive. This must be clearly communicated on packaging. The aqueous cream base introduces water, which accelerates Retinol degradation compared to a water-free formula, reducing active potency over the product's shelf life. The most significant concern from the public ingredient list is the combination of Retinol and Parfum in a daily leave-on product. Retinol speeds up cell turnover and gradually thins the outer skin layer during the adjustment phase, which can make the skin temporarily more permeable. Applying an undisclosed fragrance blend to skin in this state carries a higher sensitisation risk than fragrance in a standard moisturiser. No individual fragrance allergen components are named. No banned substances, no restricted parabens, no formaldehyde releasers.",
      },
      {
        name: "Formula Logic Inference",
        score: 17,
        max: 25,
        note: "Retinol and Bakuchiol together have published clinical support. A 2019 study in the British Journal of Dermatology found Bakuchiol comparable to Retinol for fine line reduction with fewer side effects. Their combination may offer a complementary benefit. The cream vehicle makes this more accessible for cautious users than a high-potency serum, which suits a mainstream accessible brand. However, the aqueous base reduces Retinol stability compared to a water-free formulation. If the cream is packaged in a jar, repeated air exposure on opening would introduce additional oxidation risk. Tocopheryl Acetate provides some antioxidant stabilisation in the formula, but this does not fully compensate for the water-based vehicle. Phenoxyethanol and Ethylhexylglycerin provide adequate preservation. Retinol and Bakuchiol concentrations are both undisclosed, which means active plausibility cannot be confirmed from public data alone.",
      },
      {
        name: "Public Claim Support",
        score: 13,
        max: 25,
        note: "Retinol and Bakuchiol are confirmed present in the ingredient list. Neither concentration is disclosed, which is the primary evidence gap in this product. For a Retinol product, the concentration determines how to introduce it, how quickly to expect results, and how severe the adjustment period may be. Without a disclosed concentration, the Youth Boost claim cannot be calibrated or verified from public evidence. No published test reports for anti-ageing efficacy, dermatologist testing, or clinical results are publicly accessible. MADE SAFE certified. The combination of Retinol with undisclosed Parfum is a consumer information gap that the brand's toxin-free positioning does not address.",
      },
      {
        name: "Test Result Transparency",
        score: 7,
        max: 15,
        evidenceGrade: "C",
        note: "Full INCI on mamaearth.in, consistent across Nykaa. The pregnancy contraindication for Retinol should be prominently communicated as a safety requirement. Retinol concentration is not disclosed, which is the single most important piece of consumer information for a retinol product. Bakuchiol concentration is also not disclosed. Parfum listed without individual compound names. No published test reports. Grade C: some transparency through INCI disclosure and third-party certification, but no lab name, method, or clinical result for any claim is publicly visible.",
      },
      {
        name: "Consumer Clarity",
        score: 4,
        max: 5,
        note: "Night-use-only guidance is present. Application frequency and skin type guidance are communicated. The pregnancy contraindication for Retinol is required and should be prominently displayed. A note about gradually introducing the product and using SPF the following morning is important for consumers unfamiliar with retinoids and would strengthen consumer clarity.",
      },
    ],
    globalScreen: {
      eu_1223_2009: "No obvious public red flag found",
      india_cr_2020: "No obvious public red flag found. Mamaearth is a CDSCO-registered brand under Honasa Consumer Ltd.",
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
        "Retinol concentration not publicly disclosed",
        "Bakuchiol concentration not publicly disclosed",
        "Parfum listed without individual allergen component names",
      ],
    },
    keyActives: [
      {
        name: "Retinol",
        function: "Vitamin A. Clinically proven for fine line reduction, cell turnover acceleration, and collagen support. Pregnancy contraindicated. Concentration not publicly disclosed, which limits introduction guidance for new users.",
        concentrationConfidence: "Low",
      },
      {
        name: "Bakuchiol",
        function: "Plant-derived Retinol synergist from Psoralea corylifolia. 2019 British Journal of Dermatology clinical study showed comparable fine line reduction to Retinol with fewer side effects. May buffer Retinol irritation. Concentration not publicly disclosed.",
        concentrationConfidence: "Low",
      },
      {
        name: "Butyrospermum Parkii (Shea Butter)",
        function: "Occlusive emollient. Locks in moisture overnight and supports the skin barrier during the Retinol adjustment period.",
        concentrationConfidence: "High",
      },
      {
        name: "Tocopheryl Acetate",
        function: "Vitamin E. Antioxidant that helps stabilise Retinol within the formula.",
        concentrationConfidence: "Medium",
      },
      {
        name: "Sodium Hyaluronate",
        function: "Hyaluronic acid salt. Hydration support, helps maintain barrier integrity during the Retinol adjustment phase.",
        concentrationConfidence: "Medium",
      },
    ],
    ingredients: [
      { name: "Aqua",                                note: "Solvent base. Water presence in a Retinol cream reduces Retinol stability compared to water-free formulas.",                                                                                                                                                flag: "ok"   },
      { name: "Glycerin",                            note: "Humectant, moisture retention.",                                                                                                                                                                                                                            flag: "ok"   },
      { name: "Butyrospermum Parkii (Shea Butter)",  note: "Occlusive emollient. Appears well up in the formula, indicating it is a dominant ingredient. Supports the barrier during retinol adjustment. Well-suited to a night cream vehicle.",                                                                        flag: "ok"   },
      { name: "Retinol",                             note: "Vitamin A. Concentration not disclosed, which is a critical gap for a Retinol product. Pregnancy contraindicated. Gradual introduction is essential. Night use only.",                                                                                       flag: "warn" },
      { name: "Bakuchiol",                           note: "Plant-derived Retinol synergist. Concentration not disclosed. Clinically studied for fine lines. May reduce early irritation from the Retinol adjustment period.",                                                                                          flag: "ok"   },
      { name: "Sodium Hyaluronate",                  note: "Hyaluronic acid salt. Hydration and barrier support during Retinol adjustment.",                                                                                                                                                                            flag: "ok"   },
      { name: "Niacinamide",                         note: "Vitamin B3. Anti-inflammatory support. May help buffer irritation during the Retinol adjustment phase.",                                                                                                                                                    flag: "ok"   },
      { name: "Tocopheryl Acetate",                  note: "Vitamin E. Antioxidant. Helps stabilise Retinol in the formula.",                                                                                                                                                                                          flag: "ok"   },
      { name: "Allantoin",                           note: "Soothing. Buffers irritation during the Retinol adjustment period.",                                                                                                                                                                                        flag: "ok"   },
      { name: "Panthenol",                           note: "Vitamin B5, barrier repair.",                                                                                                                                                                                                                              flag: "ok"   },
      { name: "Carbomer",                            note: "Polymer thickener.",                                                                                                                                                                                                                                       flag: "ok"   },
      { name: "Xanthan Gum",                         note: "Natural thickener.",                                                                                                                                                                                                                                       flag: "ok"   },
      { name: "Phenoxyethanol",                      note: "Preservative. Within the EU and India permitted 1% limit. Marks the likely threshold below which subsequent ingredients appear at low concentrations.",                                                                                                      flag: "info" },
      { name: "Ethylhexylglycerin",                  note: "Preservative booster.",                                                                                                                                                                                                                                    flag: "ok"   },
      { name: "Parfum",                              note: "Undisclosed fragrance blend in a leave-on Retinol night cream. Retinol temporarily thins the outer skin layer during the adjustment phase, which can increase permeability. An undisclosed fragrance blend applied under these conditions carries a higher sensitisation risk than fragrance in a standard moisturiser. No individual allergen components named.", flag: "warn" },
      { name: "Sodium Hydroxide",                    note: "pH adjuster. Fully neutralised in the finished formula.",                                                                                                                                                                                                   flag: "ok"   },
    ],
    claimsCheck: [
      {
        claim: "Youth Boost / Anti-Ageing with Retinol and Bakuchiol",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "Both actives are present in the ingredient list, but neither concentration is disclosed. Without knowing the Retinol percentage, the expected efficacy timeline and adjustment severity cannot be verified from public data.",
      },
      {
        claim: "MADE SAFE Certified",
        evidenceStatus: "Evidence visible",
        decision: "Publicly supported",
        note: "MADE SAFE certification is real and publicly verifiable. It excludes a defined list of harmful chemicals but does not validate efficacy claims.",
      },
      {
        claim: "Dermatologist Tested",
        evidenceStatus: "Mentioned only",
        decision: "Needs proof",
        note: "No test report with lab name, method, sample size, or result is publicly accessible.",
      },
      {
        claim: "Safe for Use (Toxin-Free branding)",
        evidenceStatus: "Missing",
        decision: "Not publicly supported",
        note: "The combination of undisclosed Parfum with a Retinol active in a leave-on product is a consumer information gap that the toxin-free positioning does not resolve. The fragrance allergen status cannot be confirmed from the public ingredient list.",
      },
    ],
    missingProof: [
      "Retinol concentration is not publicly disclosed. For a Retinol product, the percentage is the single most important piece of consumer information. It determines how to introduce the product, how quickly to expect results, and how severe the adjustment period may be.",
      "Bakuchiol concentration is not publicly disclosed. Without this, the complementary contribution of Bakuchiol alongside Retinol cannot be assessed from public data.",
      "No published test report is publicly accessible for anti-ageing efficacy, dermatologist tested, or clinical claims. A finished product clinical study with method, lab name, sample size, and result would substantiate these.",
      "Parfum is listed without individual fragrance allergen components. Publishing the fragrance ingredient breakdown would allow consumers to assess allergen risk, particularly important given Retinol's effect on skin barrier permeability during the adjustment phase.",
    ],
    pass_badges: ["INCI Verified", "MADE SAFE Certified", "Paraben-Free", "Cruelty-Free"],
    warn_badges: ["Not for Use During Pregnancy", "Synthetic Fragrance", "Claim Not Publicly Substantiated", "Mandatory SPF After Use"],
    info_badges: ["Dermatologically Tested (Citation Absent)", "pH-Sensitive Formula"],
    indiaContext: "Retinol cream is an accessible entry point for Indian consumers new to retinoids. The cream vehicle is gentler than a concentrated serum, and Bakuchiol may reduce the adjustment period. Start 2 to 3 times per week and apply SPF 30 or higher every morning. Retinol increases photosensitivity, and unprotected post-retinol sun exposure in India's UV-intense conditions is a direct trigger for post-inflammatory hyperpigmentation in Fitzpatrick III-V skin. Store in a cool, dark place. If you experience unexpected redness or itching after starting use, fragrance sensitivity during the adjustment phase is one possible contributing factor.",
    cleanSheetNote: "This assessment is based only on publicly available INCI, claims, and test evidence. It is not a full Clean Sheet certification. Full certification requires confidential formula review, exact concentrations, supplier documentation, manufacturing records, packaging compatibility, preservative efficacy, stability, and complete claim validation.",
    analyzedAt: "2026-06-10",
    category: "Moisturizers",
    subCategory: "Night Cream",
    concernTags: ["Fine Lines", "Wrinkles", "Texture", "Skin Renewal", "Collagen Support"],
    suitabilityTags: ["Dark Spots and Pigmentation", "Dry Skin", "Combination Skin"],
    cautionTags: ["Contains Fragrance", "Fragrance Allergen Flag", "Retinoid Flag", "Pregnancy Not Reviewed", "Active % Not Verified"],
    fragranceStatus: "synthetic",
    routineSlot: "PM",
  },

];

export const mamaearthBrand: Brand = {
  name: "Mamaearth",
  slug: "mamaearth",
  logo: "https://images.mamaearth.in/wysiwyg/mamaearth-logo.png?format=auto&fit=scale",
  tagline: "Toxin-free, MADE SAFE certified skincare for the modern Indian consumer",
  description: "Mamaearth is a Gurugram-based direct-to-consumer skincare brand founded in 2016 by Varun and Ghazal Alagh under Honasa Consumer Ltd, publicly listed on the NSE and BSE in 2023. The brand markets products as toxin-free and holds MADE SAFE certification, which excludes a defined list of harmful chemicals. Formulations blend traditional Indian botanicals with modern actives. The pattern across the range reviewed is consistent: full INCI is publicly available, MADE SAFE certification is genuine, but no published test reports for claims are accessible, active concentrations are not disclosed, and most leave-on products contain Parfum as an undisclosed fragrance blend. This recurring transparency gap sits alongside a toxin-free positioning that promises more than it delivers. The Retinol night cream, which combines an undisclosed fragrance blend with an active known to temporarily increase skin permeability, carries the most significant concern found in this review. Rescored under the 5-Pillar Public Evidence Score framework, June 2026.",
  founded: "2016",
  headquarters: "Gurugram, India",
  website: "https://mamaearth.in",
  instagramHandle: "@mamaearth.in",
  nykaaUrl: "https://www.nykaa.com/brands/mamaearth/c/1799",
  avgScore: 67,
  verdict: "Needs proof",
  products,
};
