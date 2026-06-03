/**
 * Mamaearth brand data
 *
 * Review type:    Web Evidence Review (public information only)
 * Engine:         The Clean Sheet Web Evidence Review Engine v1.0
 * Scoring:        Public evidence confidence (not certification)
 * Review date:    June 2026 (rescored from May 2026 certification scores)
 *
 * Pillar weights (public evidence framework):
 *   Pillar 1: Public Ingredient & Safety Screen    35 pts
 *   Pillar 2: Public Formula Logic Review          25 pts
 *   Pillar 3: Public Claims Evidence Review        30 pts
 *   Pillar 4: Public Transparency Review           10 pts
 *   Total:                                        100 pts
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
    summary: "A brightening serum using Sodium Ascorbyl Phosphate (SAP) as its Vitamin C source - a stable derivative that must convert to L-Ascorbic Acid on skin before becoming active. SAP at position 2 confirms a high concentration, but the conversion yield is partial, meaning the effective brightening amount reaching your cells is a fraction of what the label implies. Turmeric root extract at position 3 contributes genuine anti-inflammatory and antioxidant support. Niacinamide and Sodium Hyaluronate are present at functional positions. The formula contains Parfum (fragrance) without named allergen components, which is the primary concern in a daily leave-on serum. No published test reports for key claims are publicly accessible. MADE SAFE certified. Web evidence review - not certification.",
    score: 71,
    scoreLabel: "Good",
    image: "https://images.mamaearth.in/catalog/product/1/0/10_-vit-c-essence-serum_white_bg.jpg?format=auto&height=600",
    pillars: [
      {
        name: "Public Ingredient & Safety Screen",
        score: 27, max: 35,
        note: "Full INCI is publicly available on mamaearth.in. No EU Annex II prohibited substances, no restricted parabens, no formaldehyde releasers, no sulfates. Sodium Ascorbyl Phosphate has a well-established safety record. The main concern from the public INCI is Parfum, listed as a single undisclosed ingredient in a daily leave-on face serum. Fragrance blends can contain dozens of individual compounds, including common allergens such as limonene, linalool, citral, and geraniol. Under EU Regulation 2023/1545, brands are required to name 80+ individual fragrance allergens on product labels when above threshold concentrations, but this product does not name any fragrance components. For a serum with all-day leave-on contact on the face, the allergen status of the fragrance blend cannot be confirmed from public evidence - which is a meaningful gap for sensitive or atopic skin consumers. The 'toxin-free' brand positioning does not resolve this: undisclosed fragrance is the leading cause of cosmetic contact sensitisation.",
      },
      {
        name: "Public Formula Logic Review",
        score: 20, max: 25,
        note: "Formula structure is reasonable for its purpose. Aqua first, SAP at position 2 confirms it is the dominant active ingredient. Turmeric root extract at position 3 and Niacinamide at position 4 are positioned above the standard 1% anchor (Phenoxyethanol at position 12), confirming both are present at functional concentrations. Glycerin, Sodium Hyaluronate, Aloe, and Panthenol fill a supporting hydration and barrier role. Preservation is Phenoxyethanol with Ethylhexylglycerin - a standard, adequate system for an aqueous leave-on. Carbomer and Xanthan Gum are used for texture. Parfum appears after the 1% anchor, suggesting a trace concentration, which is typical for added fragrance. No penetration enhancers, which means actives delivery is surface-level, but also limits any enhanced systemic exposure. No major stability concerns: SAP is stable in aqueous systems unlike L-Ascorbic Acid.",
      },
      {
        name: "Public Claims Evidence Review",
        score: 17, max: 30,
        note: "The full ingredient list is publicly available. Active concentrations are not disclosed. No published test reports for dermatologist tested, clinical proven, or hypoallergenic claims are accessible on the brand website or product page. The brand's MADE SAFE certification is real and excludes a defined list of harmful chemicals, but MADE SAFE does not require efficacy substantiation for product claims. The '10% Vitamin C' marketing claim likely refers to Sodium Ascorbyl Phosphate at 10%, but the lower effective yield of SAP versus 3-O-Ethyl Ascorbic Acid or L-Ascorbic Acid is not communicated, making the implied potency comparison not verified from public evidence. Niacinamide is present and listed but its concentration is not confirmed. The Turmeric brightening claim is heritage and traditional - not clinically substantiated at leave-on serum concentrations from publicly available evidence. 'Toxin-free' is not a defined regulatory term and does not add verifiable consumer protection.",
      },
      {
        name: "Public Transparency Review",
        score: 7, max: 10,
        note: "Full INCI on mamaearth.in and largely consistent across Nykaa and Amazon listings. MADE SAFE certification is real and publicly verifiable. No published test reports for product-level claims (dermatologist tested, clinically proven, hypoallergenic) are accessible. Parfum is listed without any individual fragrance compound names, which is a transparency gap under the expanded EU allergen declaration framework. Active concentrations (Vitamin C, Niacinamide) are not publicly disclosed. No batch or expiry traceability information is visible online. Use and warning information is adequate for a non-actives product but does not address fragrance allergen status.",
      },
    ],
    keyActives: [
      { name: "Sodium Ascorbyl Phosphate",     function: "Stable Vitamin C derivative, brightening and antioxidant; position 2 confirms dominant concentration; must convert to L-Ascorbic Acid on skin at partial yield" },
      { name: "Curcuma Longa Root Extract",    function: "Turmeric, anti-inflammatory and antioxidant; position 3 indicates meaningful concentration; traditional brightening, limited clinical serum evidence" },
      { name: "Niacinamide",                   function: "Vitamin B3, inhibits melanosome transfer, reduces PIH and sebum production; position 4 confirms functional level" },
      { name: "Sodium Hyaluronate",            function: "HA, surface hydration and plumping" },
      { name: "Panthenol",                     function: "Vitamin B5, barrier repair and moisture retention" },
    ],
    ingredients: [
      { name: "Aqua",                          note: "Solvent base",                                                                                                                flag: "ok"   },
      { name: "Sodium Ascorbyl Phosphate",     note: "Stable Vitamin C derivative, position 2 confirms high concentration; bioavailability is partial vs EAA or L-Ascorbic Acid; INCI position consistent with '10%' marketing claim",  flag: "ok"   },
      { name: "Curcuma Longa Root Extract",    note: "Turmeric extract, anti-inflammatory and antioxidant; position 3 indicates meaningful concentration",                          flag: "ok"   },
      { name: "Niacinamide",                   note: "Vitamin B3, position 4 above 1% anchor - functional concentration confirmed; melanosome inhibitor, sebum regulator",         flag: "ok"   },
      { name: "Glycerin",                      note: "Humectant, moisture retention",                                                                                               flag: "ok"   },
      { name: "Sodium Hyaluronate",            note: "HA, surface hydration; molecular weight not disclosed",                                                                       flag: "ok"   },
      { name: "Aloe Barbadensis Leaf Extract", note: "Aloe vera, soothing and anti-inflammatory",                                                                                   flag: "ok"   },
      { name: "Panthenol",                     note: "Vitamin B5, barrier repair and hydration",                                                                                    flag: "ok"   },
      { name: "Allantoin",                     note: "Soothing and skin-repairing, low sensitisation risk",                                                                         flag: "ok"   },
      { name: "Carbomer",                      note: "Polymer gelling agent, safe at cosmetic use levels",                                                                          flag: "ok"   },
      { name: "Xanthan Gum",                   note: "Natural fermentation-derived thickener",                                                                                      flag: "ok"   },
      { name: "Phenoxyethanol",                note: "Preservative and 1% anchor; position 12 - ingredients before this are likely above 1%, ingredients after are likely below",  flag: "info" },
      { name: "Ethylhexylglycerin",            note: "Preservative booster, low concern",                                                                                           flag: "ok"   },
      { name: "Parfum",                        note: "Undisclosed fragrance blend after the 1% anchor - trace concentration, but allergen identity not confirmed from public INCI. EU Regulation 2023/1545 requires named allergens above threshold; none are listed here. Highest concern in this formula for daily leave-on face use", flag: "warn" },
      { name: "Sodium Hydroxide",              note: "pH adjuster, fully neutralised in formula",                                                                                   flag: "ok"   },
      { name: "Citric Acid",                   note: "pH buffer at final position, not a functional exfoliant",                                                                     flag: "ok"   },
    ],
    pass_badges: ["INCI Available", "MADE SAFE Certified", "Paraben-Free", "Sulfate-Free", "Cruelty-Free", "Stable Vitamin C Form (SAP)", "All Skin Types"],
    warn_badges: ["Contains Fragrance (Parfum) - Allergen Status Not Confirmed from Public INCI", "Vitamin C Potency Lower Than Marketing Implies"],
    info_badges: ["No Published Test Reports Found", "Active Concentrations Not Disclosed"],
    indiaContext: "Sodium Ascorbyl Phosphate is more heat-stable than L-Ascorbic Acid, a genuine advantage in India's warm climate where pure Vitamin C oxidises rapidly. The conversion step means results build more slowly than serums using 3-O-Ethyl Ascorbic Acid. Particularly useful for Fitzpatrick III-V skin for mild PIH reduction. Fragrance sensitivity is heightened in hot weather when skin is flushed and more permeable - consider patch testing if you have reactive or atopic skin.",
    analyzedAt: "2026-06-02",
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
    summary: "A rinse-off gel cleanser built around a mild, sulfate-free surfactant system (Cocamidopropyl Betaine and Sodium Lauryl Sulfoacetate) with traditional Indian brightening botanicals - Chickpea flour, Turmeric, and Saffron. As a rinse-off product, contact time is brief, which inherently limits how much the brightening botanicals can achieve. Chickpea flour contributes mild physical exfoliation. The formula is among the safer Mamaearth products reviewed: rinse-off format reduces sensitisation risk from Parfum, and SLSA is a genuinely milder surfactant than SLS. The 'brightening' positioning is heritage-driven and culturally meaningful, but the clinical evidence for rinse-off brightening at these contact times is limited. No published test reports found publicly. Web evidence review - not certification.",
    score: 79,
    scoreLabel: "Good",
    image: "https://images.mamaearth.in/catalog/product/u/b/ubtan_fw_100ml_.jpg?format=auto&height=600",
    pillars: [
      {
        name: "Public Ingredient & Safety Screen",
        score: 31, max: 35,
        note: "Full INCI publicly available. No banned substances. Sodium Lauryl Sulfoacetate (SLSA) is a milder surfactant than Sodium Lauryl Sulfate, with lower irritation potential for most skin types, though it can cause dryness or irritation for very sensitive, eczema-prone skin with daily use. Cocamidopropyl Betaine is a widely tolerated mild surfactant with occasional sensitisation in rare individuals. Parfum is present, but in a rinse-off cleanser the sensitisation risk is considerably lower than in a leave-on product because exposure is brief and the formula is washed away. This meaningfully reduces the concern compared to the leave-on serum. No fragrance allergens are individually named - this remains a transparency gap even in rinse-off context. Chickpea flour, Turmeric, and Saffron are all well-tolerated botanicals with no significant safety flags at cosmetic use levels.",
      },
      {
        name: "Public Formula Logic Review",
        score: 21, max: 25,
        note: "Formula structure is appropriate for a rinse-off gel cleanser. Cocamidopropyl Betaine at position 2 and SLSA at position 3 establish the mild surfactant system. Chickpea flour at position 4 contributes gentle physical exfoliation. Turmeric and Saffron extracts appear at moderate positions - their anti-inflammatory and antioxidant properties are genuine, but effective brightening from these actives requires prolonged daily topical contact that a rinse-off cannot provide. The sulfate-free system preserves the skin's acid mantle and lipid barrier better than SLS-based cleansers. Phenoxyethanol and Ethylhexylglycerin provide adequate preservation for the rinse-off vehicle. Carbomer and Xanthan Gum thicken the gel base. No stability concerns for a rinse-off formula.",
      },
      {
        name: "Public Claims Evidence Review",
        score: 19, max: 30,
        note: "Full INCI available. Active concentrations not disclosed. No published test reports found on the product page or brand website for brightening efficacy, dermatologist testing, or clinical studies. MADE SAFE certified. The 'brightening' claim rests on traditional ubtan heritage and ingredient associations rather than clinical evidence at rinse-off contact times. The real Ubtan tradition used concentrated pastes left on skin for extended periods - a face wash does not replicate this. SLSA is described in brand materials as 'coconut-derived', which is technically accurate but elides the degree of industrial processing involved. 'Toxin-free' has no regulatory definition. Parfum listed without named allergen components. The rinse-off format reduces many claim concerns, but none of the performance claims are substantiated by publicly available clinical or test evidence.",
      },
      {
        name: "Public Transparency Review",
        score: 8, max: 10,
        note: "Full INCI on mamaearth.in and consistent across Nykaa and Amazon. MADE SAFE certification publicly verifiable. No published test reports for claims. Parfum listed without individual fragrance compounds. Active concentrations not disclosed. Rinse-off format reduces some of the sensitivity of these gaps relative to leave-on products. Usage and warning information is adequate for a basic cleanser.",
      },
    ],
    keyActives: [
      { name: "Cicer Arietinum (Chickpea) Flour", function: "Mild physical exfoliant and smoothing agent; traditional ubtan component; gentle buffing texture" },
      { name: "Curcuma Longa Root Extract",        function: "Turmeric, anti-inflammatory and antioxidant; heritage brightening association, limited clinical evidence for rinse-off contact times" },
      { name: "Crocus Sativus (Saffron) Extract", function: "Antioxidant; rinse-off concentration contributes limited active benefit; cultural heritage ingredient" },
      { name: "Cocamidopropyl Betaine",            function: "Mild amphoteric surfactant, foam booster; low irritation potential" },
    ],
    ingredients: [
      { name: "Aqua",                             note: "Solvent base",                                                                                                  flag: "ok"   },
      { name: "Cocamidopropyl Betaine",           note: "Mild amphoteric surfactant; rare CAPB sensitisation in a small number of individuals",                          flag: "ok"   },
      { name: "Sodium Lauryl Sulfoacetate",       note: "SLSA - milder than SLS; position 3 confirms main cleansing agent; sulfate-free by classification",             flag: "ok"   },
      { name: "Cicer Arietinum (Chickpea) Flour", note: "Traditional exfoliant, mild physical buffing; position 4 indicates meaningful inclusion",                      flag: "ok"   },
      { name: "Curcuma Longa Root Extract",       note: "Turmeric extract, anti-inflammatory and antioxidant; rinse-off contact time limits brightening clinical effect",flag: "ok"   },
      { name: "Crocus Sativus (Saffron) Extract", note: "Saffron, antioxidant; rinse-off use at trace concentration - minimal functional active effect",                flag: "ok"   },
      { name: "Glycerin",                         note: "Humectant, moisture retention during cleansing; offsets surfactant stripping",                                  flag: "ok"   },
      { name: "Allantoin",                        note: "Soothing, buffers any cleansing-related irritation",                                                            flag: "ok"   },
      { name: "Carbomer",                         note: "Polymer thickener",                                                                                             flag: "ok"   },
      { name: "Xanthan Gum",                      note: "Natural thickener",                                                                                             flag: "ok"   },
      { name: "Phenoxyethanol",                   note: "Preservative, within 1% limit",                                                                                 flag: "info" },
      { name: "Ethylhexylglycerin",               note: "Preservative booster",                                                                                          flag: "ok"   },
      { name: "Parfum",                           note: "Fragrance blend; sensitisation risk is substantially lower in rinse-off than leave-on; allergen identity not confirmed from public INCI", flag: "info" },
      { name: "Sodium Hydroxide",                 note: "pH adjuster",                                                                                                   flag: "ok"   },
      { name: "Citric Acid",                      note: "pH buffer",                                                                                                     flag: "ok"   },
    ],
    pass_badges: ["INCI Available", "MADE SAFE Certified", "Sulfate-Free (SLS-Free)", "Paraben-Free", "Cruelty-Free", "All Skin Types"],
    warn_badges: ["Brightening Claims Not Verified from Rinse-Off Clinical Evidence"],
    info_badges: ["Contains Fragrance (Parfum) - Lower Risk in Rinse-Off", "No Published Test Reports Found", "Traditional Ubtan Botanicals"],
    indiaContext: "The ubtan ritual traditionally used freshly prepared pastes left on skin for extended contact time - significantly more bioactive exposure than a rinse-off face wash. This product captures the cultural identity and the ingredient heritage without replicating the traditional application. As a daily gentle cleanser with a pleasant skin feel, it performs well for Indian skin. Use it for cleansing quality and mild exfoliation rather than expecting the brightening results of a targeted leave-on treatment.",
    analyzedAt: "2026-06-02",
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
    summary: "A lightweight gel moisturizer with a Glycerin and Sodium Hyaluronate humectant base, Niacinamide at a functional INCI position, and Centella Asiatica for anti-inflammatory support. The formula is honest in its design: it is a daily hydrator for oily and combination skin, and the ingredient list supports that purpose. The 'Aqua Glow' naming implies a radiance mechanism that is not directly linked to any specific ingredient in the formula at disclosed concentrations. Parfum is present in this daily leave-on product, which is the primary concern - daily face application over months builds cumulative sensitisation risk from undisclosed fragrance allergens. No published test reports found publicly. MADE SAFE certified. Web evidence review - not certification.",
    score: 72,
    scoreLabel: "Good",
    image: "https://images.mamaearth.in/catalog/product/a/q/aqua-glow-gel-face-moisturizer-1_1.jpg?format=auto&height=600",
    pillars: [
      {
        name: "Public Ingredient & Safety Screen",
        score: 27, max: 35,
        note: "Full INCI publicly available. No banned substances, no restricted parabens, no formaldehyde releasers, no AHAs, no retinoids. Glycerin, Sodium Hyaluronate, Niacinamide, Centella Asiatica, and Panthenol all have excellent safety profiles. Carbomer is a synthetic polymer, fully safe at cosmetic concentrations. The primary concern from the public INCI is Parfum - an undisclosed fragrance blend in a product designed for daily leave-on use on the face. Unlike a rinse-off product, a moisturizer stays in contact with skin all day, and daily repeated exposure is the primary route by which fragrance sensitisation develops over time. The fragrance allergen identity is not confirmed from the public INCI under EU Regulation 2023/1545, because no individual allergen components are named. This is a persistent transparency gap across Mamaearth's leave-on range. The formula itself is appropriate for its intended purpose.",
      },
      {
        name: "Public Formula Logic Review",
        score: 21, max: 25,
        note: "Aqua first. Glycerin at position 2 as the dominant humectant is a well-designed choice for a gel moisturizer. Sodium Hyaluronate at position 3 and Niacinamide at position 4 are both above the 1% anchor (Phenoxyethanol at position 11), confirming functional concentrations. Centella Asiatica and Panthenol appear at moderate positions, contributing anti-inflammatory and barrier support. The gel texture is achieved with Carbomer and Xanthan Gum, standard and safe gelling agents. Phenoxyethanol and Ethylhexylglycerin provide adequate preservation. No penetration enhancers - actives delivery is at the skin surface level. The formula logic is consistent with its claim of lightweight daily hydration for oily skin in a humid climate. No stability concerns from the public INCI.",
      },
      {
        name: "Public Claims Evidence Review",
        score: 17, max: 30,
        note: "Full INCI available. Active concentrations not publicly disclosed. No published test reports for the 'glow', 'hydration', 'dermatologist tested', or 'non-comedogenic' claims found on the product page or brand website. MADE SAFE certified. Sodium Hyaluronate is present and positioned functionally - the hydration claim is supported from public INCI position evidence. Niacinamide is present at a functional position - its sebum-regulating and barrier-supporting benefit is plausible. The 'Aqua Glow' branding implies a luminosity or radiance mechanism that is not mechanistically linked to any ingredient in the formula at disclosed concentrations - this is aspirational marketing language rather than a claim verified from public evidence. 'Toxin-free' has no regulatory definition and does not constitute verifiable evidence of ingredient safety superiority.",
      },
      {
        name: "Public Transparency Review",
        score: 7, max: 10,
        note: "Full INCI available on mamaearth.in, consistent across Nykaa and Amazon. MADE SAFE certification publicly verifiable. No published test reports for claims. Parfum listed without individual fragrance compound names - allergen identity not confirmed. Active concentrations (Niacinamide, HA) not disclosed. No batch or expiry traceability visible online. HA molecular weight, which determines surface vs deeper hydration, is not communicated to consumers. These gaps are consistent across Mamaearth's leave-on range.",
      },
    ],
    keyActives: [
      { name: "Sodium Hyaluronate",         function: "HA, surface and intermediate hydration; position 3 confirms functional concentration; molecular weight not disclosed" },
      { name: "Niacinamide",                function: "Vitamin B3, sebum regulation, pore minimisation, barrier strengthening; position 4 confirms functional level" },
      { name: "Centella Asiatica Extract",  function: "Cica, anti-inflammatory, barrier support, wound-healing; functional for post-blemish or reactive skin" },
      { name: "Glycerin",                   function: "Humectant, dominant moisture-binding agent at position 2" },
    ],
    ingredients: [
      { name: "Aqua",                           note: "Solvent base",                                                                                flag: "ok"   },
      { name: "Glycerin",                       note: "Humectant, position 2 - dominant moisture-binding agent",                                    flag: "ok"   },
      { name: "Sodium Hyaluronate",             note: "HA, surface hydration; position 3 above 1% anchor - functional concentration; MW not disclosed", flag: "ok" },
      { name: "Niacinamide",                    note: "Vitamin B3, position 4 above 1% anchor - functional concentration confirmed",                flag: "ok"   },
      { name: "Aloe Barbadensis Leaf Extract",  note: "Aloe vera, soothing, anti-inflammatory",                                                     flag: "ok"   },
      { name: "Centella Asiatica Extract",      note: "Cica, anti-inflammatory, skin barrier repair; functional at cosmetic use levels",            flag: "ok"   },
      { name: "Panthenol",                      note: "Vitamin B5, barrier repair and moisture retention",                                          flag: "ok"   },
      { name: "Allantoin",                      note: "Soothing agent, low sensitisation risk",                                                     flag: "ok"   },
      { name: "Carbomer",                       note: "Synthetic polymer gelling agent, safe at cosmetic concentrations",                           flag: "ok"   },
      { name: "Xanthan Gum",                    note: "Natural thickener",                                                                          flag: "ok"   },
      { name: "Phenoxyethanol",                 note: "Preservative and 1% anchor; ingredients before this are likely above 1%",                   flag: "info" },
      { name: "Ethylhexylglycerin",             note: "Preservative booster",                                                                       flag: "ok"   },
      { name: "Parfum",                         note: "Undisclosed fragrance blend; daily leave-on use on face - repeated exposure builds sensitisation risk over time; allergen identity not confirmed from public INCI", flag: "warn" },
      { name: "Sodium Hydroxide",               note: "pH adjuster",                                                                                flag: "ok"   },
      { name: "Citric Acid",                    note: "pH buffer",                                                                                  flag: "ok"   },
    ],
    pass_badges: ["INCI Available", "MADE SAFE Certified", "Paraben-Free", "Sulfate-Free", "Cruelty-Free", "Oily / Combination Skin", "All Skin Types"],
    warn_badges: ["Contains Fragrance (Parfum) - Allergen Status Not Confirmed from Public INCI"],
    info_badges: ["No Published Test Reports Found", "Active Concentrations Not Disclosed", "HA Molecular Weight Not Disclosed"],
    indiaContext: "A gel moisturizer is the right format for India's humid climate - the absence of heavy emollients prevents the greasy, pore-blocking feel that cream moisturisers cause in high humidity. Niacinamide at a functional concentration helps regulate sebum, particularly relevant during summer and monsoon when oiliness increases. Use under SPF during the day. For consumers with a history of fragrance sensitivity or atopic dermatitis, the undisclosed Parfum in this formula warrants a patch test before daily use.",
    analyzedAt: "2026-06-02",
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
    summary: "A night cream combining Retinol and Bakuchiol with Shea Butter and Glycerin in an aqueous cream base. Both actives are present in the INCI and are supported by clinical literature at the right concentrations. However, two compounded concerns are visible from the public ingredient list. First: neither Retinol nor Bakuchiol concentration is disclosed by Mamaearth - for a retinol product, this is a critical gap because the concentration determines the adjustment severity, the onset timeline, and how carefully a new user should introduce it. Second: Parfum is present in this leave-on retinol night cream. Retinol accelerates cell turnover and temporarily reduces the outer skin layer's thickness during the adjustment period, which can increase skin permeability to fragrance allergens - pairing an undisclosed fragrance blend with a known sensitising-phase active is a formulation choice that consumers deserve to know about explicitly. Cream vehicle reduces retinol stability versus anhydrous formulas. Web evidence review - not certification.",
    score: 64,
    scoreLabel: "Fair",
    image: "https://images.mamaearth.in/catalog/product/r/e/retinol-night-cream-1_1_bf3clpgk1y3nzzr9.jpg?format=auto&height=600",
    pillars: [
      {
        name: "Public Ingredient & Safety Screen",
        score: 23, max: 35,
        note: "Retinol and Bakuchiol are both present in the INCI. All vitamin A derivatives, including retinol, carry a pregnancy contraindication - they should not be used during pregnancy or when trying to conceive. This must be clearly communicated on packaging and is a regulatory requirement. The cream vehicle introduces water, which accelerates retinol degradation compared to a water-free formula - this is a stability concern that manifests as reduced active potency over the product's shelf life. The most significant clinical concern from the public INCI is the combination of Retinol and Parfum in a daily leave-on product. Retinol speeds up cell turnover and gradually thins the stratum corneum during the adjustment period, which is the mechanism behind both its anti-ageing benefits and its irritation side effects. A temporarily compromised stratum corneum is more permeable to fragrance allergens - the compounding risk of an undisclosed fragrance blend in a retinol formula is higher than fragrance in a standard moisturiser. No individual fragrance allergen components are named in the INCI. No banned substances, no restricted parabens, no formaldehyde releasers.",
      },
      {
        name: "Public Formula Logic Review",
        score: 18, max: 25,
        note: "Retinol and Bakuchiol together have published clinical support. A 2019 study (Dhaliwal et al., British Journal of Dermatology) showed Bakuchiol comparable to retinol for fine line reduction with fewer side effects - their combination may offer synergistic benefit. The cream vehicle makes this more accessible for beginners than a high-potency serum, which is a sensible formulation choice for a mainstream accessible brand. However, the aqueous base reduces retinol stability compared to an anhydrous (water-free) formula. The packaging type is not visible from public information - if the cream is in a jar, that would introduce further oxidation risk each time the jar is opened. Phenoxyethanol and Ethylhexylglycerin provide adequate preservation. Tocopheryl Acetate (Vitamin E) helps stabilise retinol in formula, but this is insufficient to match the stability of a water-free system. Parfum appears after the preservative anchor, suggesting trace concentration, but even trace amounts of fragrance allergens carry risk during retinol's adjustment phase.",
      },
      {
        name: "Public Claims Evidence Review",
        score: 16, max: 30,
        note: "Retinol and Bakuchiol are listed in the INCI - their presence is verified from public evidence. Neither concentration is disclosed, which is the primary claim evidence gap in this product. For a retinol product specifically, the concentration determines how the consumer should introduce it, how quickly to expect results, and how severe the adjustment period will be. Without a disclosed concentration, 'Youth Boost' is a claim that cannot be verified or calibrated from public evidence. No published test reports for anti-ageing efficacy, dermatologist testing, or clinical results are accessible. MADE SAFE certified. The pregnancy contraindication for retinol is required - whether this is clearly communicated on the current product page and packaging requires verification. The combination of retinol with undisclosed Parfum is a consumer information gap that the brand's 'toxin-free' positioning does not resolve.",
      },
      {
        name: "Public Transparency Review",
        score: 7, max: 10,
        note: "Full INCI on mamaearth.in, consistent across Nykaa. The pregnancy contraindication for retinol must be prominently communicated - this is a safety requirement, not a preference. Retinol concentration not disclosed - the single most important piece of consumer information for a retinol product. Bakuchiol concentration not disclosed. Parfum listed without individual compound names. No published test reports. No batch or expiry traceability visible. The combination of an undisclosed fragrance blend with a retinol-active in a leave-on product represents the most significant transparency gap in this brand review.",
      },
    ],
    keyActives: [
      { name: "Retinol",                                   function: "Vitamin A, clinically proven for fine lines, cell turnover, collagen support; pregnancy contraindication; concentration not disclosed - limits introduction guidance" },
      { name: "Bakuchiol",                                 function: "Plant-derived retinol synergist (Psoralea corylifolia); 2019 BJD clinical study comparable to retinol for fine lines; may buffer retinol irritation; concentration not disclosed" },
      { name: "Butyrospermum Parkii (Shea Butter)",        function: "Occlusive emollient, locks in moisture overnight, supports barrier during retinol adjustment period" },
      { name: "Tocopheryl Acetate",                        function: "Vitamin E, antioxidant, helps stabilise retinol in formula" },
      { name: "Sodium Hyaluronate",                        function: "HA, hydration; supports barrier integrity during retinol adjustment" },
    ],
    ingredients: [
      { name: "Aqua",                                note: "Solvent base; water presence in retinol cream reduces retinol stability vs anhydrous formulas",                flag: "ok"   },
      { name: "Glycerin",                            note: "Humectant, moisture retention",                                                                                flag: "ok"   },
      { name: "Butyrospermum Parkii (Shea Butter)",  note: "Occlusive emollient, barrier support; ideal in night cream vehicle; position 3 indicates dominant emollient",   flag: "ok"   },
      { name: "Retinol",                             note: "Vitamin A; concentration not disclosed - critical gap for a retinol product; pregnancy contraindication required; gradual introduction essential", flag: "warn" },
      { name: "Bakuchiol",                           note: "Plant-derived retinol synergist; concentration not disclosed; clinically studied for fine lines (Dhaliwal 2019, BJD)",  flag: "ok"   },
      { name: "Sodium Hyaluronate",                  note: "HA, hydration and barrier support during retinol adjustment",                                                   flag: "ok"   },
      { name: "Niacinamide",                         note: "Vitamin B3, anti-inflammatory support; may help buffer retinol adjustment irritation",                          flag: "ok"   },
      { name: "Tocopheryl Acetate",                  note: "Vitamin E, antioxidant, retinol stabiliser in formula",                                                        flag: "ok"   },
      { name: "Allantoin",                           note: "Soothing, buffers irritation during retinol adjustment period",                                                 flag: "ok"   },
      { name: "Panthenol",                           note: "Vitamin B5, barrier repair",                                                                                    flag: "ok"   },
      { name: "Carbomer",                            note: "Polymer thickener",                                                                                             flag: "ok"   },
      { name: "Xanthan Gum",                         note: "Natural thickener",                                                                                             flag: "ok"   },
      { name: "Phenoxyethanol",                      note: "Preservative, within 1% limit; 1% anchor in this formula",                                                     flag: "info" },
      { name: "Ethylhexylglycerin",                  note: "Preservative booster",                                                                                          flag: "ok"   },
      { name: "Parfum",                              note: "Undisclosed fragrance blend in a leave-on retinol night cream. Retinol thins the stratum corneum during adjustment, increasing skin permeability. Fragrance allergen exposure risk is compounded during this phase. Allergen identity not confirmed from public INCI. This is the most significant concern in this formula",  flag: "warn" },
      { name: "Sodium Hydroxide",                    note: "pH adjuster",                                                                                                   flag: "ok"   },
    ],
    pass_badges: ["INCI Available", "MADE SAFE Certified", "Paraben-Free", "Cruelty-Free", "Night Use Only"],
    warn_badges: ["Not for Use During Pregnancy or When Trying to Conceive", "Contains Fragrance (Parfum) with Retinol - Compounded Sensitisation Risk", "Retinol Concentration Not Disclosed"],
    info_badges: ["Retinol + Bakuchiol Combination", "Begin 2-3x Weekly, Build Gradually", "Aqueous Cream Vehicle (Lower Retinol Stability Than Anhydrous)"],
    indiaContext: "Retinol cream is an accessible entry point for Indian consumers new to retinoids: the cream vehicle is gentler than a concentrated serum, and Bakuchiol may reduce the adjustment period and buffer early irritation. Begin 2-3 times per week and wear SPF 30+ every morning - retinol increases photosensitivity, and unprotected post-retinol sun exposure in India's UV-intense conditions is a direct PIH trigger. Indian skin (Fitzpatrick III-V) has a higher post-inflammation hyperpigmentation risk if the retinol adjustment phase is combined with UV exposure. Store in a cool, dark place. The undisclosed fragrance in this product is worth noting: if you develop any unexpected redness or itching after starting use, fragrance sensitivity during the adjustment phase is one possible cause.",
    analyzedAt: "2026-06-02",
  },

];

export const mamaearthBrand: Brand = {
  name: "Mamaearth",
  slug: "mamaearth",
  logo: "https://images.mamaearth.in/wysiwyg/mamaearth-logo.png?format=auto&fit=scale",
  tagline: "Toxin-free, MADE SAFE certified skincare for the modern Indian consumer",
  description: "Mamaearth is a Gurugram-based direct-to-consumer skincare brand founded in 2016 by Varun and Ghazal Alagh under Honasa Consumer Ltd, publicly listed on the NSE and BSE in 2023. The brand markets products as 'toxin-free' and holds MADE SAFE certification, which excludes a defined list of harmful chemicals. Formulations blend traditional Indian botanicals with modern actives. The pattern across the range reviewed is consistent: full INCI is publicly available, MADE SAFE certification is genuine, but no published test reports for claims are accessible, active concentrations are not disclosed, and most leave-on products contain Parfum (undisclosed fragrance blend) - a recurring transparency gap that sits awkwardly alongside the 'toxin-free' positioning. The retinol night cream's combination of undisclosed fragrance with an active that temporarily increases skin permeability is the most significant concern found in this review. Rescored under the Web Evidence Review Engine (June 2026) - not certification.",
  founded: "2016",
  headquarters: "Gurugram, India",
  website: "https://mamaearth.in",
  instagramHandle: "@mamaearth.in",
  nykaaUrl: "https://www.nykaa.com/brands/mamaearth/c/1799",
  avgScore: 72,
  verdict: "Good",
  products,
};
