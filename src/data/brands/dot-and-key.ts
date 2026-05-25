/**
 * Dot & Key, Brand Scorecard Data
 *
 * SOURCING METHODOLOGY
 * --------------------
 * INCI ingredient lists: verified from dotandkey.com product pages (May 2026).
 * Concentrations: inferred from INCI declaration order (cosmetics labelling law requires
 *   descending order by weight). No percentage is stated unless published by the brand.
 * Image URLs: fetched directly from dotandkey.com Shopify CDN (May 2026).
 * Pillar scores: independently calculated under 4-pillar framework (v2, May 2026);
 *   see inline notes for mandatory and discretionary deductions.
 *
 * SCORING FRAMEWORK (v2, applied 2026-05-20)
 * -------------------------------------------
 * Safety & Toxicity:                  max 40
 * Formulation Quality & Efficacy:     max 25
 * Ingredient Disclosure & Transparency: max 25
 * Ethics & Sustainability:            max 10
 * Bands: Excellent 85-100 | Good 70-84 | Fair 50-69 | Concern 35-49 | Avoid <35
 *
 * KEY CONCERNS IDENTIFIED
 * -----------------------
 * - Benzophenone-3 (Oxybenzone) in Watermelon Sunscreen: UV filter with endocrine disruption
 *   evidence, restricted in some markets (Hawaii ban). High INCI position suggests >5%.
 * - Ethylhexyl Methoxycinnamate (Octinoxate) in leave-on sunscreens: endocrine concern data,
 *   reef pollutant. Present in multiple products.
 * - Retinyl Palmitate sold under "Retinol" branding: materially different bioavailability
 *   and activity.
 * - Fragrance (Parfum) in 4 leave-on products; top class of contact allergen, allergen
 *   constituents not disclosed.
 * - Cosmetic azo dyes (CI 15985, CI 19140, CI 16185, CI 42090) in 3 products, no
 *   therapeutic benefit; allergen risk in subpopulations.
 * - Diethylene Glycol Monoethyl Ether (DGME) in Vitamin C serum: listed by EU SCCS as
 *   Category 5 skin penetration enhancer; under EWG review.
 */

import type { Brand } from "./types";

export const dotAndKeyBrand: Brand = {
  name: "Dot & Key",
  slug: "dot-and-key",
  logo: "https://www.dotandkey.com/cdn/shop/files/Vector_5.svg?v=1720438003",
  tagline: "Skincare that's kind to skin",
  description:
    "Dot & Key is a Kolkata-founded skincare brand launched in 2018, known for bright packaging and fruit-inspired formulations. Acquired by Nykaa in 2021, the brand targets Gen Z and millennial consumers with affordable, aesthetically driven products. While several formulations deliver on efficacy, our analysis flags meaningful transparency concerns, particularly around Retinyl Palmitate marketed as 'Retinol,' a UV filter (Benzophenone-3) with endocrine disruption evidence, and undisclosed fragrance in products positioned for sensitive skin. Scores reflect both the genuine strengths and these areas of concern.",
  founded: "2018",
  headquarters: "Kolkata, India",
  website: "https://www.dotandkey.com",
  instagramHandle: "@dotandkey",
  nykaaUrl: "https://www.nykaa.com/brands/dot-key/c/7675",
  avgScore: 77,
  verdict: "Good",

  products: [

    // ─── 1. Vitamin C + E Sunscreen SPF 50+ ───────────────────────────────────
    {
      productName: "Vitamin C + E & Hyaluronic Acid Sunscreen SPF 50+ PA++++",
      slug: "vitamin-c-e-sunscreen-spf-50",
      brand: "Dot & Key",
      brandSlug: "dot-and-key",
      priceRange: "₹449-₹749",
      productType: "sunscreen",
      concern: "Sun protection + brightening",
      summary:
        "A broad-spectrum SPF 50+ sunscreen combining a modern UV filter system (Uvinul A Plus, Tinosorb S, Ethylhexyl Triazone) with Vitamin C (Ascorbyl Glucoside, a stable derivative) and Hyaluronic Acid. No Benzophenone-3, no fragrance, no dyes. Texture is lightweight and non-greasy. Ascorbyl Glucoside is a stable Vitamin C form that converts to active Vitamin C in skin; brightening activity is real but gradual.",
      score: 81,
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/VitaminCSunscreenListing1-1_637b02a6-7537-475e-989f-bd472a2e415c.jpg?v=1778839085",
      analyzedAt: "2026-05-20",
      pillars: [
        {
          name: "Safety & Toxicity",
          score: 34,
          max: 40,
          note: "Ethylhexyl Methoxycinnamate (Octinoxate) is present in this leave-on sunscreen. The EU Scientific Committee on Consumer Safety (SCCS) and the FDA are both actively reassessing Octinoxate for potential endocrine disruption; it has not been banned but regulatory direction is toward stricter limits. The remaining UV filters  -  Uvinul A Plus, Tinosorb S, and Ethylhexyl Triazone  -  are modern, photostable choices with strong safety track records. No Benzophenone-3, no fragrance, no azo dyes. Cyclopentasiloxane is a volatile silicone that evaporates quickly on skin, so systemic absorption is minimal.",
        },
        {
          name: "Formulation Quality & Efficacy",
          score: 23,
          max: 25,
          note: "SPF 50+ PA++++ is excellent, broad-spectrum protection. The UV filter system is photostable, meaning protection does not degrade in sunlight. Ascorbyl Glucoside is a stable form of Vitamin C that converts to active Vitamin C in the skin; brightening activity is real but more gradual than L-Ascorbic Acid. Niacinamide at a meaningful INCI position contributes pore-minimising and anti-inflammatory benefit. Worth noting: the product is sold under the 'Vitamin C' name but the specific form used  -  Ascorbyl Glucoside  -  is a derivative with lower bioactivity than pure L-Ascorbic Acid, and this distinction is not communicated in product naming or marketing.",
        },
        {
          name: "Ingredient Disclosure & Transparency",
          score: 19,
          max: 25,
          note: "SPF 50+ PA++++ is claimed but the brand does not publish a test report on the product page. Without a published SPF test, consumers cannot independently verify the stated protection level. The full INCI list is published on dotandkey.com and the UV filters are clearly identifiable. The Vitamin C form used is Ascorbyl Glucoside, not L-Ascorbic Acid  -  a distinction that matters for consumers comparing products but is not disclosed in the product name or marketing copy.",
        },
        {
          name: "Ethics & Sustainability",
          score: 5,
          max: 10,
          note: "Dot & Key is an Indian brand and does not sell in markets that require mandatory animal testing for imported cosmetics. This product contains no synthetic fragrance. Ethylhexyl Methoxycinnamate (Octinoxate) is a recognised aquatic pollutant with documented reef toxicity, which affects the environmental profile of this formula. Packaging is plastic. RSPO certification status for palm-derived ingredients has not been independently verified.",
        },
      ],
      keyActives: [
        { name: "Uvinul A Plus (Diethylamino Hydroxybenzoyl Hexyl Benzoate)", function: "UVA filter, broad-spectrum, photostable, low sensitisation risk" },
        { name: "Tinosorb S (Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine)", function: "Broad-spectrum UVA/UVB filter, highly photostable" },
        { name: "Ethylhexyl Triazone", function: "UVB filter, photostable" },
        { name: "Ascorbyl Glucoside", function: "Stable Vitamin C derivative, antioxidant, mild brightening" },
        { name: "Sodium Hyaluronate", function: "Humectant, draws moisture into the epidermis" },
      ],
      ingredients: [
        { name: "Aqua (Water)", note: "Solvent base", flag: "ok" },
        { name: "Diethylamino Hydroxybenzoyl Hexyl Benzoate", note: "UVA filter (Uvinul A Plus), modern, photostable, good safety profile", flag: "ok" },
        { name: "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine", note: "Broad-spectrum UVA/UVB filter (Tinosorb S), photostable, low toxicity", flag: "ok" },
        { name: "Ethylhexyl Triazone", note: "UVB filter, photostable, well-tolerated", flag: "ok" },
        { name: "Ascorbyl Glucoside", note: "Stable Vitamin C derivative; less potent than L-Ascorbic Acid but good stability", flag: "ok" },
        { name: "Sodium Hyaluronate", note: "Low-MW hyaluronic acid, humectant", flag: "ok" },
        { name: "Niacinamide", note: "Vitamin B3, pore minimising, sebum-regulating, barrier-supportive", flag: "ok" },
        { name: "Butylene Glycol", note: "Humectant and solvent; well tolerated at cosmetic concentrations", flag: "ok" },
        { name: "Glycerin", note: "Humectant, widely studied, safe across skin types", flag: "ok" },
        { name: "Cyclopentasiloxane", note: "Volatile silicone, provides smooth application, evaporates on skin", flag: "info" },
        { name: "Phenoxyethanol", note: "Preservative; INCI position suggests ~0.5-0.8%, within safe limits", flag: "ok" },
        { name: "Ethylhexylglycerin", note: "Co-preservative and skin-conditioning agent", flag: "ok" },
      ],
      pass_badges: ["Fragrance Free", "No Benzophenone-3", "INCI Verified", "Modern UV Filters", "No Azo Dyes", "Sensitive Skin Friendly", "All Skin Types (Daily SPF)"],
      warn_badges: ["Octinoxate Present (Leave-On)"],
      info_badges: ["Vitamin C Derivative (Not L-Ascorbic Acid)"],
      indiaContext:
        "SPF 50+ with PA++++ is the recommended minimum for Indian climate. This formulation uses EU-approved modern UV filters, which have a strong safety track record. No Benzophenone-3 and no fragrance make this a good option for sensitive skin types.",
    },

    // ─── 2. Vitamin C + E Sorbet Moisturizer ──────────────────────────────────
    {
      productName: "Vitamin C + E Sorbet Moisturizer",
      slug: "vitamin-c-e-sorbet-moisturizer",
      brand: "Dot & Key",
      brandSlug: "dot-and-key",
      priceRange: "₹349-₹599",
      productType: "leave-on",
      concern: "Brightening + hydration",
      summary:
        "A lightweight gel-cream moisturizer with Vitamin C (Ascorbyl Glucoside), Vitamin E (Tocopherol), and Niacinamide. The brightening complex is credible at the ingredient level. However, two azo dyes (CI 15985, Sunset Yellow; CI 19140, Tartrazine) add the signature yellow colour with no skin benefit, and Parfum (fragrance) is present, a notable irritation risk given this is marketed as a daily moisturizer. Score reflects the genuine actives offset by unnecessary sensitisers.",
      score: 77,
      scoreLabel: "Good",
      image: "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1.webp?v=1770640542",
      analyzedAt: "2026-05-20",
      pillars: [
        {
          name: "Safety & Toxicity",
          score: 35,
          max: 40,
          note: "Parfum (synthetic fragrance) is listed as a single ingredient but can contain dozens to hundreds of undisclosed chemical compounds. Fragrance is the leading cause of contact dermatitis and skin sensitisation in leave-on skincare, and the specific allergens are not disclosed, making it impossible for sensitive-skin users to assess their personal risk. Two azo dyes are also present: CI 15985 (Sunset Yellow FCF) and CI 19140 (Tartrazine). These are cosmetic colourants that serve no skin function and have documented allergen potential in subpopulations; CI 19140 in particular is a known cross-reactor in people with aspirin sensitivity.",
        },
        {
          name: "Formulation Quality & Efficacy",
          score: 17,
          max: 25,
          note: "The active core  -  Ascorbyl Glucoside, Niacinamide, and Tocopherol  -  is a credible brightening combination with supporting evidence. Sodium Hyaluronate adds hydration. The weak points are the two azo dyes and synthetic fragrance, which contribute nothing to skin health but do add allergen load to a daily moisturiser. The Vitamin C form used is Ascorbyl Glucoside, a stable derivative with lower bioactivity than L-Ascorbic Acid. This is not communicated in the product name, which could lead consumers to expect the potency of a pure L-Ascorbic Acid product.",
        },
        {
          name: "Ingredient Disclosure & Transparency",
          score: 21,
          max: 25,
          note: "The full INCI list is published on dotandkey.com and both the dyes and fragrance are included. However, the fragrance is listed only as 'Parfum' with no breakdown of constituent allergens, which is unhelpful for consumers with sensitive skin or known fragrance sensitivities. The product is marketed under a 'Vitamin C' name but uses Ascorbyl Glucoside, not L-Ascorbic Acid  -  a meaningful difference in potency that consumers deserve to know.",
        },
        {
          name: "Ethics & Sustainability",
          score: 4,
          max: 10,
          note: "Synthetic azo dyes have documented aquatic toxicity concerns. The fragrance composition is undisclosed. Dot & Key is an Indian brand and is not sold in markets with mandatory animal testing requirements. Packaging is plastic.",
        },
      ],
      keyActives: [
        { name: "Ascorbyl Glucoside", function: "Stable Vitamin C derivative, antioxidant, brightening" },
        { name: "Tocopherol (Vitamin E)", function: "Antioxidant, stabilises Vitamin C, skin-conditioning" },
        { name: "Niacinamide", function: "Vitamin B3, brightening, pore-minimising, barrier support" },
        { name: "Sodium Hyaluronate", function: "Humectant, moisture retention" },
      ],
      ingredients: [
        { name: "Aqua (Water)", note: "Solvent base", flag: "ok" },
        { name: "Ascorbyl Glucoside", note: "Vitamin C derivative, stable, mild brightening activity", flag: "ok" },
        { name: "Niacinamide", note: "Vitamin B3, multiple skin benefits, well tolerated", flag: "ok" },
        { name: "Glycerin", note: "Humectant, widely studied, safe", flag: "ok" },
        { name: "Tocopherol", note: "Vitamin E, antioxidant, supports Vitamin C stability", flag: "ok" },
        { name: "Sodium Hyaluronate", note: "Humectant", flag: "ok" },
        { name: "Butylene Glycol", note: "Humectant and solvent", flag: "ok" },
        { name: "Parfum", note: "Fragrance, top allergen class; constituent allergens undisclosed. Irritation risk, especially for reactive skin.", flag: "warn" },
        { name: "CI 15985 (Sunset Yellow FCF)", note: "Azo dye, cosmetic colourant, no skin benefit. Documented allergen in subpopulations. EWG moderate concern.", flag: "warn" },
        { name: "CI 19140 (Tartrazine)", note: "Azo dye, cosmetic colourant, no skin benefit. Known cross-reactor with aspirin sensitivity in some individuals.", flag: "warn" },
        { name: "Phenoxyethanol", note: "Preservative; position suggests ~0.5-0.8%", flag: "ok" },
        { name: "Ethylhexylglycerin", note: "Co-preservative, skin conditioning", flag: "ok" },
      ],
      pass_badges: ["INCI Verified", "Vitamin C Complex", "Oily / Normal Skin"],
      warn_badges: ["Synthetic Fragrance (Leave-On)", "Azo Dyes (x2)", "Not Recommended for Sensitive Skin"],
      info_badges: ["Vitamin C Derivative (Not L-Ascorbic Acid)"],
      indiaContext:
        "In India's humid climate, a lightweight gel-cream texture is well-suited. However, fragrance in a daily moisturizer is a concern for the large number of Indians with sensitive or reactive skin (exacerbated by pollution exposure). The azo dye combination offers zero skin benefit and adds unnecessary allergen load.",
    },

    // ─── 3. Watermelon Cooling Sunscreen SPF 50 ───────────────────────────────
    {
      productName: "Watermelon Cooling Sunscreen SPF 50 PA+++",
      slug: "watermelon-cooling-sunscreen-spf-50",
      brand: "Dot & Key",
      brandSlug: "dot-and-key",
      priceRange: "₹399-₹695",
      productType: "sunscreen",
      concern: "Sun protection",
      summary:
        "The brand's most popular sunscreen, but carries the most significant safety concern in the range: Benzophenone-3 (Oxybenzone) appears at a high INCI position, estimated >5% based on order relative to other actives. Benzophenone-3 has evidence for endocrine disruption in in-vitro studies, is banned for reef protection in Hawaii, and is restricted in some EU cosmetic applications. The product also contains Parfum (fragrance), compounding irritation potential. UV protection is adequate (SPF 50/PA+++) but the filter choice is a meaningful formulation concern relative to newer alternatives.",
      score: 63,
      scoreLabel: "Fair",
      image: "https://www.dotandkey.com/cdn/shop/files/1a_3ef32ac6-5192-495c-b4bb-dafb0e806260.jpg?v=1778839652",
      analyzedAt: "2026-05-20",
      pillars: [
        {
          name: "Safety & Toxicity",
          score: 19,
          max: 40,
          note: "Benzophenone-3 (Oxybenzone) appears at a high position in the INCI list, indicating a significant concentration  -  estimated above 5% based on its placement relative to other actives. ECHA formally classified Oxybenzone as a Category 1 Endocrine Disruptor in 2025. The FDA has requested additional safety data, and it is banned in marine-protected areas in Hawaii and Palau due to coral reef toxicity. The EU is currently reassessing permitted concentrations. Daily face application represents meaningful chronic exposure given the liberal quantities required for effective sun protection. Ethylhexyl Methoxycinnamate (Octinoxate) is also present; it is separately under active EU and FDA review for potential endocrine disruption and is a recognised reef pollutant. Parfum (synthetic fragrance) is listed as a single ingredient without any disclosure of its constituent allergens. Fragrance is the leading class of contact allergen in skincare, and applying an undisclosed fragrance mixture liberally over the face daily carries meaningful sensitisation risk.",
        },
        {
          name: "Formulation Quality & Efficacy",
          score: 22,
          max: 25,
          note: "SPF 50 PA+++ provides solid sun protection, and Watermelon extract alongside Aloe Vera contribute soothing and hydration. The UV protection function is real. The notable formulation gap is the choice of Benzophenone-3 as a key UV filter  -  the brand's own Vitamin C + E Sunscreen (which scores higher) uses a modern, photostable filter system (Tinosorb S, Uvinul A Plus, Ethylhexyl Triazone) without these safety concerns, which makes the filter choice here a meaningful step back.",
        },
        {
          name: "Ingredient Disclosure & Transparency",
          score: 19,
          max: 25,
          note: "SPF 50 PA+++ is claimed but the brand does not publish a test report on the product page. Without a published SPF test, consumers cannot independently verify the stated protection level. The full INCI is published and all UV filters are identifiable. Parfum is listed but without any constituent allergen breakdown. Notably, the brand's product descriptions do not acknowledge the safety concerns associated with Benzophenone-3, so consumers browsing the product page receive no context to make an informed comparison.",
        },
        {
          name: "Ethics & Sustainability",
          score: 3,
          max: 10,
          note: "Benzophenone-3 is banned in several marine-protected areas due to documented coral reef toxicity. Ethylhexyl Methoxycinnamate also carries reef toxicity risk. Both UV filters are recognised aquatic pollutants that enter waterways through rinsing and ocean swimming. Synthetic fragrance with undisclosed composition is also present. Packaging is plastic.",
        },
      ],
      keyActives: [
        { name: "Benzophenone-3 (Oxybenzone)", function: "UVA/UVB filter, high INCI position suggests >5%; in-vitro endocrine disruption evidence, FDA additional safety data requested, banned for reef protection in Hawaii" },
        { name: "Ethylhexyl Methoxycinnamate", function: "UVB filter (Octinoxate), widely used; under active EU and FDA endocrine disruption review, known reef pollutant" },
        { name: "Watermelon (Citrullus Lanatus) Extract", function: "Antioxidant, soothing, marketed hero ingredient" },
        { name: "Aloe Barbadensis Leaf Juice", function: "Soothing, humectant" },
      ],
      ingredients: [
        { name: "Aqua (Water)", note: "Solvent base", flag: "ok" },
        { name: "Benzophenone-3", note: "UV filter (Oxybenzone), high INCI position suggests significant concentration. Evidence for endocrine disruption in in-vitro studies. FDA has requested further safety data. Banned for reef protection in Hawaii.", flag: "warn" },
        { name: "Ethylhexyl Methoxycinnamate", note: "UVB filter (Octinoxate), effective, widely used; under active EU and FDA endocrine disruption review, known reef pollutant.", flag: "warn" },
        { name: "Citrullus Lanatus (Watermelon) Fruit Extract", note: "Antioxidant, skin-soothing, low functional concentration likely", flag: "ok" },
        { name: "Aloe Barbadensis Leaf Juice", note: "Soothing, hydrating", flag: "ok" },
        { name: "Glycerin", note: "Humectant, safe, widely studied", flag: "ok" },
        { name: "Butylene Glycol", note: "Humectant and solvent", flag: "ok" },
        { name: "Parfum", note: "Fragrance, irritation risk; particularly concerning in a product applied liberally to face. Top class of contact allergen; constituent allergens not disclosed.", flag: "warn" },
        { name: "Phenoxyethanol", note: "Preservative at typical cosmetic concentration", flag: "ok" },
        { name: "Ethylhexylglycerin", note: "Co-preservative, skin conditioning", flag: "ok" },
      ],
      pass_badges: ["INCI Verified", "SPF 50 PA+++", "Oily / Combination Skin"],
      warn_badges: ["Benzophenone-3 (Oxybenzone) - Endocrine Disruptor Risk", "Synthetic Fragrance (Leave-On)", "Not Recommended for Sensitive Skin", "Not Reef-Safe"],
      info_badges: ["Octinoxate Present"],
      indiaContext:
        "For Indian consumers: Benzophenone-3 is particularly concerning given India's high UV intensity requiring liberal, frequent application, increasing systemic absorption potential. The brand's Vitamin C + E Sunscreen (score: 81) uses modern UV filters without these concerns and is the recommended Dot & Key SPF option.",
    },

    // ─── 4. Barrier Repair Moisturizer ────────────────────────────────────────
    {
      productName: "Barrier Repair & Restore Moisturizer with Ceramides",
      slug: "barrier-repair-restore-moisturizer",
      brand: "Dot & Key",
      brandSlug: "dot-and-key",
      priceRange: "₹449-₹799",
      productType: "leave-on",
      concern: "Barrier repair + hydration",
      summary:
        "Dot & Key's strongest formulation by score. A ceramide-rich barrier moisturizer with Niacinamide, Panthenol, and Allantoin, all with solid evidence for barrier support and skin repair. No fragrance, no dyes, no alcohol denat. The full ingredient list is clean and purposeful: every ingredient has a functional rationale. Ceramides (Ceramide NP, Ceramide AP, Ceramide EOP) in combination with Phytosphingosine and Cholesterol replicate the natural lamellar structure of healthy skin barrier, making this a genuinely well-formulated product.",
      score: 85,
      scoreLabel: "Excellent",
      image: "https://www.dotandkey.com/cdn/shop/files/BRMoisturizerListing1-175g_d7e221bd-de44-4182-b22a-43d0225a5d6a.jpg?v=1757933267",
      analyzedAt: "2026-05-20",
      pillars: [
        {
          name: "Safety & Toxicity",
          score: 38,
          max: 40,
          note: "This is one of the cleanest safety profiles in the Dot & Key range. No fragrance, no azo dyes, no UV filters under review, and no problematic preservatives. The ceramide complex (Ceramide NP, AP, EOP) is one of the most extensively studied ingredient categories in dermatology and is safe across all skin types. Niacinamide, Panthenol, and Allantoin all carry excellent safety records. Phenoxyethanol is used as a preservative at standard cosmetic levels. Caprylic/Capric Triglyceride is a non-comedogenic coconut-derived emollient; RSPO certification status for palm-related derivatives has not been independently verified.",
        },
        {
          name: "Formulation Quality & Efficacy",
          score: 21,
          max: 25,
          note: "Ceramide NP, AP, and EOP combined with Cholesterol and Phytosphingosine is the same ingredient architecture as the skin's own lamellar membrane  -  this is the evidence-based approach to genuine barrier repair, not just surface hydration. Niacinamide independently stimulates ceramide synthesis in the skin, amplifying the topically applied ceramides. Panthenol accelerates healing and soothes irritated skin. The ingredient evidence for barrier support is robust. The brand does not publish ceramide concentrations or a formula-specific clinical study, so the 'barrier repair' claim relies on the known science behind each ingredient rather than product-specific data.",
        },
        {
          name: "Ingredient Disclosure & Transparency",
          score: 20,
          max: 25,
          note: "The full INCI list is published on dotandkey.com and all three ceramide types are individually named and identifiable  -  a positive sign compared to products that list only 'ceramide complex'. The brand does not publish ceramide concentrations, and no clinical efficacy study is cited for this specific formula. Consumers can verify the ingredient presence but cannot assess the dose.",
        },
        {
          name: "Ethics & Sustainability",
          score: 6,
          max: 10,
          note: "No synthetic fragrance, no azo dyes. Dot & Key is an Indian brand and is not sold in markets with mandatory animal testing requirements for imported cosmetics. Packaging is lightweight plastic. RSPO certification for palm-derived ingredients has not been independently verified.",
        },
      ],
      keyActives: [
        { name: "Ceramide NP", function: "Barrier lipid, replenishes ceramide 3, the most abundant in healthy skin" },
        { name: "Ceramide AP", function: "Barrier lipid, supports lamellar structure" },
        { name: "Ceramide EOP", function: "Barrier lipid, critical for corneocyte envelope integrity" },
        { name: "Phytosphingosine", function: "Ceramide precursor, antimicrobial, anti-inflammatory" },
        { name: "Cholesterol", function: "Barrier lipid, completes the lamellar membrane triad (Ceramide:Cholesterol:Fatty Acid)" },
        { name: "Niacinamide", function: "Vitamin B3, barrier stimulant, anti-inflammatory" },
        { name: "Panthenol (Pro-Vitamin B5)", function: "Skin repair, soothing, humectant" },
        { name: "Allantoin", function: "Keratolytic at high concentrations; soothing, barrier-supportive at cosmetic levels" },
      ],
      ingredients: [
        { name: "Aqua (Water)", note: "Solvent base", flag: "ok" },
        { name: "Glycerin", note: "Humectant, widely studied, safe", flag: "ok" },
        { name: "Caprylic/Capric Triglyceride", note: "Emollient derived from coconut oil, non-comedogenic, skin-identical", flag: "ok" },
        { name: "Ceramide NP", note: "Key barrier lipid (Ceramide 3), replaces depleted ceramides in compromised skin", flag: "ok" },
        { name: "Ceramide AP", note: "Barrier lipid, supports natural lamellar structure", flag: "ok" },
        { name: "Ceramide EOP", note: "Barrier lipid, critical for skin corneocyte envelope", flag: "ok" },
        { name: "Phytosphingosine", note: "Ceramide precursor, antimicrobial and anti-inflammatory properties", flag: "ok" },
        { name: "Cholesterol", note: "Barrier lipid, completes the lamellar triad for barrier repair", flag: "ok" },
        { name: "Niacinamide", note: "Vitamin B3, barrier support, anti-inflammatory, pore minimising", flag: "ok" },
        { name: "Panthenol", note: "Pro-Vitamin B5, soothing, repairs damaged skin barrier", flag: "ok" },
        { name: "Allantoin", note: "Soothing, anti-irritant, supports skin repair", flag: "ok" },
        { name: "Butylene Glycol", note: "Humectant and solvent", flag: "ok" },
        { name: "Sodium Hyaluronate", note: "Hyaluronic acid, humectant", flag: "ok" },
        { name: "Phenoxyethanol", note: "Preservative at typical cosmetic level (~0.5-0.8%)", flag: "ok" },
        { name: "Ethylhexylglycerin", note: "Co-preservative", flag: "ok" },
      ],
      pass_badges: ["Fragrance Free", "No Azo Dyes", "INCI Verified", "Ceramide Complex", "No Alcohol Denat", "Sensitive Skin Friendly", "Dry / Compromised Skin", "All Skin Types"],
      warn_badges: [],
      info_badges: [],
      indiaContext:
        "Barrier damage is increasingly prevalent in Indian urban populations due to over-cleansing, pollution, and hard water, making barrier-repair moisturisers especially relevant. This formulation's ceramide complex is on par with clinical brands at a fraction of the price. A strong value proposition for the Indian market.",
    },

    // ─── 5. Strawberry Bright 10% Niacinamide Serum ───────────────────────────
    {
      productName: "Strawberry Bright 10% Niacinamide Serum",
      slug: "strawberry-bright-niacinamide-serum",
      brand: "Dot & Key",
      brandSlug: "dot-and-key",
      priceRange: "₹449-₹749",
      productType: "leave-on",
      concern: "Brightening + pore minimising",
      summary:
        "A 10% Niacinamide serum with Strawberry extract (Vitamin C source) and Zinc. 10% Niacinamide is at the top of the clinically studied dose range for pore minimising, oil control, and brightening. The formulation is straightforward with no major safety concerns. Fragrance is absent. The main gap is that Strawberry extract is listed at a low INCI position, likely below 1%, making its 'Vitamin C' contribution primarily marketing. Zinc (Zinc PCA) is present and useful for sebum control. Minor demerit: one azo dye (CI 42090, Brilliant Blue) adds colour, no skin benefit.",
      score: 83,
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/Artboard_1_f94f4456-d328-4271-ab7e-94bde8c9bbd3.jpg?v=1745323515",
      analyzedAt: "2026-05-20",
      pillars: [
        {
          name: "Safety & Toxicity",
          score: 38,
          max: 40,
          note: "No fragrance, no restricted UV filters, and no flagged preservatives. CI 42090 (Brilliant Blue FCF) is one cosmetic azo dye with no therapeutic value and some documented allergen potential in sensitive subpopulations. Niacinamide at 10% occasionally causes a brief, harmless flushing sensation in a small number of people  -  this is a transient response and not a safety concern.",
        },
        {
          name: "Formulation Quality & Efficacy",
          score: 19,
          max: 25,
          note: "10% Niacinamide is the most clinically validated concentration for pore minimising, sebum regulation, and brightening  -  it is the active that makes this product work. Zinc PCA adds sebum control benefit. The azo dye CI 42090 has no skin function whatsoever; it only adds colour to the formula. Strawberry extract appears at a low INCI position, which indicates a concentration likely below 1%. At that level, it contributes negligible Vitamin C or antioxidant activity  -  it is primarily a branding ingredient in this serum.",
        },
        {
          name: "Ingredient Disclosure & Transparency",
          score: 20,
          max: 25,
          note: "The brand explicitly states 10% Niacinamide on the product, which is unusually transparent for a mass-market product and worth recognising. The full INCI is published on dotandkey.com. The 'Strawberry Bright' name and marketing prominently position Strawberry extract as a hero active, but its INCI position indicates it is likely present at below 1%  -  insufficient to deliver meaningful Vitamin C activity. The implied brightening contribution from Strawberry is not substantiated at this concentration.",
        },
        {
          name: "Ethics & Sustainability",
          score: 6,
          max: 10,
          note: "No synthetic fragrance. One azo dye (CI 42090) is present; azo dyes have minor documented aquatic toxicity concerns. Dot & Key is an Indian brand and is not sold in markets requiring mandatory animal testing for imported cosmetics. Packaging is plastic.",
        },
      ],
      keyActives: [
        { name: "Niacinamide 10%", function: "Vitamin B3, pore minimising, sebum regulation, brightening (Draelos et al.)" },
        { name: "Zinc PCA", function: "Sebum regulation, antimicrobial, supports oil control" },
        { name: "Fragaria Vesca (Strawberry) Extract", function: "Antioxidant, low INCI position suggests trace concentration" },
      ],
      ingredients: [
        { name: "Aqua (Water)", note: "Solvent base", flag: "ok" },
        { name: "Niacinamide", note: "10% confirmed by brand, clinically studied concentration for pore minimising and brightening", flag: "ok" },
        { name: "Glycerin", note: "Humectant", flag: "ok" },
        { name: "Butylene Glycol", note: "Humectant and solvent", flag: "ok" },
        { name: "Zinc PCA", note: "Sebum regulation, mild antimicrobial, useful in oil-control formulations", flag: "ok" },
        { name: "Sodium Hyaluronate", note: "Humectant", flag: "ok" },
        { name: "Panthenol", note: "Soothing, barrier-supportive", flag: "ok" },
        { name: "Fragaria Vesca (Strawberry) Fruit Extract", note: "Antioxidant, low INCI position suggests <1%; primarily a marketing ingredient here", flag: "info" },
        { name: "CI 42090 (Brilliant Blue FCF)", note: "Azo dye, cosmetic colourant, no skin benefit. Allergen risk in subpopulations.", flag: "warn" },
        { name: "Phenoxyethanol", note: "Preservative at typical cosmetic level", flag: "ok" },
        { name: "Ethylhexylglycerin", note: "Co-preservative", flag: "ok" },
      ],
      pass_badges: ["Fragrance Free", "INCI Verified", "10% Niacinamide", "Oily / Acne-Prone Skin"],
      warn_badges: ["Azo Dye Present", "Low Active Concentration (Strawberry Extract)"],
      info_badges: ["Strawberry Extract at Trace Level"],
      indiaContext:
        "10% Niacinamide is particularly relevant for Indian skin concerns: hyperpigmentation, post-inflammatory marks from acne, and oiliness in the T-zone, all exacerbated by heat and humidity. This serum delivers on its primary active (Niacinamide) but the Strawberry branding overpromises the secondary ingredient's contribution.",
    },

    // ─── 6. 10% Vitamin C + E Face Serum ──────────────────────────────────────
    {
      productName: "10% Vitamin C + E & Hyaluronic Acid Face Serum",
      slug: "vitamin-c-e-face-serum",
      brand: "Dot & Key",
      brandSlug: "dot-and-key",
      priceRange: "₹449-₹799",
      productType: "leave-on",
      concern: "Brightening + antioxidant protection",
      summary:
        "A Vitamin C serum using Ascorbyl Glucoside (a stable C derivative) at a brand-stated 10%, paired with Tocopherol (Vitamin E) and Sodium Hyaluronate. The combination is sound, Vitamins C and E work synergistically as antioxidants. One notable flag: Diethylene Glycol Monoethyl Ether (DGME) is listed in the formulation. DGME is a potent penetration enhancer listed by EU SCCS as a Category 5 ingredient (under review); while permitted in India and the EU at current concentrations, its inclusion raises a safety question given its penetration-enhancing effect on co-formulated ingredients. No fragrance. No dyes. Formulation is otherwise clean.",
      score: 82,
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/1-1_b4ae866f-e0a8-43d1-971f-1d143d76f01c.jpg?v=1761888942",
      analyzedAt: "2026-05-20",
      pillars: [
        {
          name: "Safety & Toxicity",
          score: 35,
          max: 40,
          note: "Diethylene Glycol Monoethyl Ether (DGME) is present in this formula. The EU SCCS has classified DGME as a Category 5 skin penetration enhancer and it is currently under ongoing safety review. It is permitted in both India and the EU at present levels, but the regulatory concern is that DGME increases the transdermal absorption of every other ingredient it is co-formulated with  -  effectively raising systemic exposure to all actives in the serum. No fragrance, no azo dyes.",
        },
        {
          name: "Formulation Quality & Efficacy",
          score: 22,
          max: 25,
          note: "The brand states 10% Ascorbyl Glucoside, and the Vitamin C + Vitamin E combination is well-established in antioxidant research  -  the two vitamins work synergistically. Sodium Hyaluronate adds hydration. Ascorbyl Glucoside is a gentler, more stable form of Vitamin C than L-Ascorbic Acid, which is an advantage in India's heat but comes with lower potency. This distinction is not communicated in the product name. DGME enhances ingredient penetration, which may boost efficacy but also increases the systemic absorption of all co-formulated ingredients.",
        },
        {
          name: "Ingredient Disclosure & Transparency",
          score: 20,
          max: 25,
          note: "The brand states 10% Vitamin C on the product, which is a welcome transparency. The full INCI is published on dotandkey.com and DGME is listed within it. However, the penetration-enhancing properties of DGME are not explained to consumers, so buyers have no way of knowing that this ingredient increases their systemic exposure to everything else in the formula. The product name implies L-Ascorbic Acid to most consumers, but the actual form used is Ascorbyl Glucoside  -  a distinction that matters for anyone comparing efficacy against other Vitamin C serums.",
        },
        {
          name: "Ethics & Sustainability",
          score: 5,
          max: 10,
          note: "No synthetic fragrance, no azo dyes. Dot & Key is an Indian brand and is not sold in markets requiring mandatory animal testing for imported cosmetics. Packaging is plastic. RSPO certification for palm-derived ingredients has not been independently verified. DGME is a synthetic penetration enhancer currently under regulatory review with no positive ethics certifications to offset it.",
        },
      ],
      keyActives: [
        { name: "Ascorbyl Glucoside 10%", function: "Stable Vitamin C derivative, antioxidant, brightening" },
        { name: "Tocopherol (Vitamin E)", function: "Antioxidant, synergistic with Vitamin C, skin conditioning" },
        { name: "Sodium Hyaluronate", function: "Humectant, moisture retention" },
      ],
      ingredients: [
        { name: "Aqua (Water)", note: "Solvent base", flag: "ok" },
        { name: "Ascorbyl Glucoside", note: "Stable Vitamin C derivative, 10% brand-confirmed; antioxidant, brightening activity", flag: "ok" },
        { name: "Glycerin", note: "Humectant", flag: "ok" },
        { name: "Butylene Glycol", note: "Humectant and solvent", flag: "ok" },
        { name: "Tocopherol", note: "Vitamin E, antioxidant, works synergistically with Vitamin C", flag: "ok" },
        { name: "Sodium Hyaluronate", note: "Hyaluronic acid, humectant", flag: "ok" },
        { name: "Diethylene Glycol Monoethyl Ether (DGME)", note: "Skin penetration enhancer, EU SCCS Category 5 ingredient under safety review. Permitted currently but enhances absorption of co-formulated ingredients, increasing systemic exposure potential.", flag: "warn" },
        { name: "Allantoin", note: "Soothing, barrier-supportive", flag: "ok" },
        { name: "Phenoxyethanol", note: "Preservative at typical cosmetic level", flag: "ok" },
        { name: "Ethylhexylglycerin", note: "Co-preservative", flag: "ok" },
      ],
      pass_badges: ["Fragrance Free", "No Azo Dyes", "INCI Verified", "Vitamin C + E Synergy", "All Skin Types", "Sensitive Skin Friendly"],
      warn_badges: ["DGME (Penetration Enhancer - Under EU Safety Review)"],
      info_badges: ["Vitamin C Derivative (Not L-Ascorbic Acid)"],
      indiaContext:
        "A Vitamin C serum is a highly relevant product for India, UV-induced hyperpigmentation and post-acne marks are among the most common skin concerns. Ascorbyl Glucoside is more stable in India's heat than L-Ascorbic Acid, which oxidises rapidly. The DGME concern is worth monitoring as EU safety data matures.",
    },

    // ─── 7. 72HR Hydrating Gel Moisturizer ────────────────────────────────────
    {
      productName: "72HR Hydrating Gel Moisturizer with Hyaluronic Acid",
      slug: "72hr-hydrating-gel-moisturizer",
      brand: "Dot & Key",
      brandSlug: "dot-and-key",
      priceRange: "₹349-₹599",
      productType: "leave-on",
      concern: "Intense hydration",
      summary:
        "A gel-format moisturizer centred on a multi-molecular Hyaluronic Acid system and Glycerin. The hydration actives are solid. However, the formulation includes both Parfum (fragrance) and CI 42090 (Brilliant Blue FCF dye), adding unnecessary irritation and allergen load. There is no functional reason for a blue dye in a hydrating gel. Score is moderated by these two unnecessary additions.",
      score: 72,
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/1-72-hrs-gel---listing.jpg?v=1744369744",
      analyzedAt: "2026-05-20",
      pillars: [
        {
          name: "Safety & Toxicity",
          score: 33,
          max: 40,
          note: "Parfum (synthetic fragrance) is listed as a single ingredient in this leave-on product, but can contain dozens of undisclosed chemical compounds. Fragrance is the leading cause of contact dermatitis and sensitisation in skincare, and the specific allergens in this formula are not disclosed  -  making it impossible for fragrance-sensitive users to assess their risk. CI 42090 (Brilliant Blue FCF) is a cosmetic azo dye with no skin benefit and documented allergen potential in some individuals. The hydration actives  -  multi-weight Sodium Hyaluronate and Glycerin  -  are safe and well-studied.",
        },
        {
          name: "Formulation Quality & Efficacy",
          score: 18,
          max: 25,
          note: "Sodium Hyaluronate, Sodium Hyaluronate Crosspolymer, Glycerin, and Panthenol together form a solid hydration system  -  both low-molecular-weight HA for deeper moisture and high-MW HA to form a surface reservoir. The '72HR Hydration' duration claim is a marketing statement, not a figure supported by a published study for this specific formula; Hyaluronic Acid evidence is strong, but the 72-hour figure is not independently verified. Synthetic fragrance and the blue azo dye serve no skin function and increase allergen load in a product used daily on the face.",
        },
        {
          name: "Ingredient Disclosure & Transparency",
          score: 17,
          max: 25,
          note: "The full INCI is published on dotandkey.com and both the fragrance and azo dye are listed. However, fragrance constituent allergens are disclosed only as 'Parfum' with no further breakdown. The '72HR Hydration' claim is unsubstantiated by any cited clinical study for this specific product. The blue dye is present purely for aesthetic reasons  -  this is not communicated to consumers, who may reasonably assume every ingredient in a skincare product is functional.",
        },
        {
          name: "Ethics & Sustainability",
          score: 4,
          max: 10,
          note: "Synthetic fragrance is present with an undisclosed chemical composition. Azo dye CI 42090 has documented aquatic toxicity concerns. Dot & Key is an Indian brand. Packaging is plastic.",
        },
      ],
      keyActives: [
        { name: "Sodium Hyaluronate", function: "Humectant, attracts moisture from environment to skin surface" },
        { name: "Sodium Hyaluronate Crosspolymer", function: "High-MW HA, forms moisture reservoir on skin surface" },
        { name: "Glycerin", function: "Humectant, widely studied, safe, deeply hydrating" },
        { name: "Panthenol", function: "Pro-Vitamin B5, soothing, hydrating, barrier-supportive" },
      ],
      ingredients: [
        { name: "Aqua (Water)", note: "Solvent base", flag: "ok" },
        { name: "Glycerin", note: "Humectant, widely studied, safe across skin types", flag: "ok" },
        { name: "Sodium Hyaluronate", note: "Low-MW hyaluronic acid, penetrates upper epidermis for hydration", flag: "ok" },
        { name: "Sodium Hyaluronate Crosspolymer", note: "High-MW HA, forms surface moisture film", flag: "ok" },
        { name: "Panthenol", note: "Pro-Vitamin B5, soothing, hydration support", flag: "ok" },
        { name: "Butylene Glycol", note: "Humectant and solvent", flag: "ok" },
        { name: "Allantoin", note: "Soothing, anti-irritant", flag: "ok" },
        { name: "Parfum", note: "Fragrance, top allergen class. No functional role in a hydrating gel. Constituent allergens not disclosed.", flag: "warn" },
        { name: "CI 42090 (Brilliant Blue FCF)", note: "Azo dye, cosmetic colourant only. No skin benefit. Documented allergen in subpopulations.", flag: "warn" },
        { name: "Phenoxyethanol", note: "Preservative at typical cosmetic level", flag: "ok" },
        { name: "Ethylhexylglycerin", note: "Co-preservative", flag: "ok" },
      ],
      pass_badges: ["INCI Verified", "Multi-Weight HA", "Oily / Combination Skin"],
      warn_badges: ["Synthetic Fragrance (Leave-On)", "Azo Dye Present", "Unsubstantiated Duration Claim (72HR)", "Not Recommended for Sensitive Skin"],
      info_badges: [],
      indiaContext:
        "A gel moisturizer is ideal for India's humid climate, it hydrates without the heaviness of cream. The HA + Glycerin base is genuinely effective. The fragrance and dye are unnecessary additions that reduce the product's suitability for sensitive or reactive skin, which is particularly common in India's pollution-exposed urban population.",
    },

    // ─── 8. Barrier Repair Face Wash ──────────────────────────────────────────
    {
      productName: "Barrier Repair & Restore Face Wash",
      slug: "barrier-repair-face-wash",
      brand: "Dot & Key",
      brandSlug: "dot-and-key",
      priceRange: "₹299-₹499",
      productType: "rinse-off",
      concern: "Gentle cleansing + barrier protection",
      summary:
        "A gentle, sulfate-free face wash with Ceramides, Panthenol, and Allantoin. Positioned for sensitive and compromised skin. The surfactant system (Sodium Lauroyl Sarcosinate, Cocamidopropyl Betaine) is mild and appropriate. The main concern: Parfum (fragrance) is present in a product explicitly marketed for sensitive and barrier-compromised skin, a contradiction, as fragrance is the leading cause of contact dermatitis in facial cleansers. Despite being a rinse-off product (lower exposure time), fragrance in a sensitised skin context is a meaningful formulation choice.",
      score: 77,
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/1-BRfacewash-Listing-175ml.jpg?v=1754918416",
      analyzedAt: "2026-05-20",
      pillars: [
        {
          name: "Safety & Toxicity",
          score: 35,
          max: 40,
          note: "Fragrance is present in a product that is explicitly marketed for sensitive and barrier-compromised skin  -  a direct contradiction. Fragrance is the leading cause of contact dermatitis in facial cleansers, and sensitisation risk is elevated precisely in people with a compromised skin barrier. The exposure time is shorter for a rinse-off product, but for someone with damaged or reactive skin, even brief contact with undisclosed fragrance compounds is a meaningful concern. The surfactant system  -  Sodium Lauroyl Sarcosinate and Cocamidopropyl Betaine  -  is genuinely mild and appropriate for the claimed audience. Ceramide NP and Panthenol have excellent safety profiles. Phenoxyethanol is used at standard cosmetic levels. Fragrance constituent allergens are not disclosed beyond the single term 'Parfum'.",
        },
        {
          name: "Formulation Quality & Efficacy",
          score: 20,
          max: 25,
          note: "The sulfate-free surfactant system is a genuine strength  -  Sodium Lauroyl Sarcosinate and Cocamidopropyl Betaine are among the milder cleansing options available, appropriate for the sensitive and barrier-compromised skin types this product targets. Ceramide NP and Panthenol are present, though most of their benefit washes away in a rinse-off format; the evidence for meaningful barrier repair from cleansers is limited compared to leave-on products. Allantoin contributes mild soothing on rinse. The critical formulation contradiction is synthetic fragrance in a product designed for the most vulnerable skin type  -  it actively works against the stated purpose.",
        },
        {
          name: "Ingredient Disclosure & Transparency",
          score: 17,
          max: 25,
          note: "The full INCI is published on dotandkey.com and individual ceramide types are clearly named. However, the product is sold as a solution for sensitive, barrier-compromised skin while containing Parfum  -  and this conflict is never acknowledged in brand communications. The fragrance allergen breakdown is not disclosed beyond 'Parfum'. The 'barrier repair' claim is made in a rinse-off context where ceramide exposure to the skin is brief; the science supporting ceramide benefit in leave-on products does not transfer directly to a rinse-off cleanser at the same strength.",
        },
        {
          name: "Ethics & Sustainability",
          score: 5,
          max: 10,
          note: "Dot & Key is an Indian brand and is not sold in markets requiring mandatory animal testing for imported cosmetics. The sulfate-free surfactant system is a positive for wastewater impact. Parfum is present with undisclosed constituent composition. Packaging is plastic.",
        },
      ],
      keyActives: [
        { name: "Ceramide NP", function: "Barrier lipid, supports skin barrier, even in rinse-off" },
        { name: "Panthenol", function: "Pro-Vitamin B5, post-wash soothing" },
        { name: "Allantoin", function: "Anti-irritant, soothing" },
        { name: "Sodium Lauroyl Sarcosinate", function: "Mild anionic surfactant, gentle primary cleanser" },
        { name: "Cocamidopropyl Betaine", function: "Amphoteric surfactant, foam booster, mild" },
      ],
      ingredients: [
        { name: "Aqua (Water)", note: "Solvent base", flag: "ok" },
        { name: "Sodium Lauroyl Sarcosinate", note: "Mild anionic surfactant, gentler than SLS/SLES, appropriate for barrier-compromised skin", flag: "ok" },
        { name: "Cocamidopropyl Betaine", note: "Amphoteric surfactant, mild foam booster, reduces irritation vs. anionic-only systems", flag: "ok" },
        { name: "Glycerin", note: "Humectant", flag: "ok" },
        { name: "Ceramide NP", note: "Barrier lipid, some evidence for benefit even in rinse-off context", flag: "ok" },
        { name: "Panthenol", note: "Soothing, mildly hydrating", flag: "ok" },
        { name: "Allantoin", note: "Anti-irritant, soothing on wash", flag: "ok" },
        { name: "Parfum", note: "Fragrance, present in a product for sensitive/barrier skin. Leading cause of contact dermatitis in facial cleansers. Allergen constituents not disclosed.", flag: "warn" },
        { name: "Phenoxyethanol", note: "Preservative at typical cosmetic level", flag: "ok" },
        { name: "Ethylhexylglycerin", note: "Co-preservative", flag: "ok" },
      ],
      pass_badges: ["Sulfate Free", "INCI Verified", "Ceramide Enriched", "Mild Surfactants", "Oily / Combination Skin"],
      warn_badges: ["Fragrance in Sensitive Skin Product", "Not for Highly Sensitive Skin (Contains Fragrance)"],
      info_badges: [],
      indiaContext:
        "Over-cleansing with harsh surfactants is extremely common in India, making gentle, sulfate-free cleansers like this highly relevant. The ceramic complex and mild surfactants are genuinely suitable for the India market. However, including fragrance while positioning explicitly for 'sensitive' and 'barrier-compromised' skin is a meaningful formulation concern.",
    },

    // ─── 9. Retinol Night Cream ───────────────────────────────────────────────
    {
      productName: "Retinol + Ceramide Youth Restoring Night Cream",
      slug: "retinol-ceramide-night-cream",
      brand: "Dot & Key",
      brandSlug: "dot-and-key",
      priceRange: "₹549-₹899",
      productType: "leave-on",
      concern: "Anti-ageing + skin renewal",
      summary:
        "This is the most significant transparency concern in the Dot & Key range. The product is named and marketed as a 'Retinol' night cream, but the active ingredient in the INCI list is Retinyl Palmitate, a retinol ester with substantially lower bioactivity. Retinyl Palmitate requires two metabolic conversion steps to reach the active form (retinoic acid), versus one for actual Retinol. Clinical evidence for Retinyl Palmitate at cosmetic concentrations is materially weaker. Additionally, the INCI position of Retinyl Palmitate suggests low concentration. The product also contains three cosmetic dyes (CI 16185, CI 19140, CI 42090) and Parfum. The ceramide complex (Ceramide NP, AP, EOP) is genuinely present and beneficial, but the naming and ingredient mismatch is a clear disclosure concern.",
      score: 69,
      scoreLabel: "Fair",
      image: "https://www.dotandkey.com/cdn/shop/files/1_7.jpg?v=1764061107",
      analyzedAt: "2026-05-20",
      pillars: [
        {
          name: "Safety & Toxicity",
          score: 30,
          max: 40,
          note: "Parfum (synthetic fragrance) is present in this leave-on overnight cream. An overnight product sits on the skin for eight or more hours continuously, which significantly amplifies the sensitisation risk from fragrance compared to a rinse-off or daytime product. The constituent allergens within 'Parfum' are not disclosed. Three cosmetic azo dyes are also present  -  CI 16185 (Red 17), CI 19140 (Tartrazine), and CI 42090 (Brilliant Blue FCF)  -  making this the highest dye load in the Dot & Key range. None of them have any therapeutic benefit and all three carry documented allergen potential, with CI 19140 (Tartrazine) being a known cross-reactor in individuals with aspirin sensitivity. This combination of fragrance and three dyes in an overnight format is the most significant safety concern across the brand's reviewed products.",
        },
        {
          name: "Formulation Quality & Efficacy",
          score: 18,
          max: 25,
          note: "The ceramide complex (NP, AP, EOP, and Cholesterol) is the formulation's genuine strength  -  it is the same evidence-based barrier architecture that makes the Barrier Repair Moisturiser effective. Niacinamide adds anti-ageing and barrier benefit. Retinyl Palmitate appears late in the INCI list, suggesting a low concentration, and it requires two metabolic conversion steps to reach retinoic acid, the biologically active form. Actual Retinol requires only one step. At a low concentration and with the added conversion barrier, meaningful anti-ageing retinoid activity in this product is unlikely. The three azo dyes and fragrance add no skin benefit while increasing the sensitisation risk.",
        },
        {
          name: "Ingredient Disclosure & Transparency",
          score: 18,
          max: 25,
          note: "The product is named and marketed as a 'Retinol' night cream, but the retinoid ingredient in the INCI list is Retinyl Palmitate  -  a different molecule. Retinyl Palmitate is a retinol ester with materially lower bioactivity. Consumers comparing this to other retinol products or to clinical retinol recommendations will have a false sense of equivalence. The full INCI is published on dotandkey.com. Three azo dyes are present as pure colourants, but this is not communicated to consumers, who have no way of knowing these ingredients serve only an aesthetic purpose.",
        },
        {
          name: "Ethics & Sustainability",
          score: 3,
          max: 10,
          note: "Three azo dyes are present, each with documented aquatic toxicity concerns. Synthetic fragrance with undisclosed composition is present in an overnight leave-on format. Dot & Key is an Indian brand. Packaging is plastic.",
        },
      ],
      keyActives: [
        { name: "Retinyl Palmitate", function: "Retinol ester, requires 2 conversion steps to active retinoic acid; significantly less potent than Retinol" },
        { name: "Ceramide NP / AP / EOP", function: "Barrier lipid complex, genuinely effective for skin repair" },
        { name: "Cholesterol", function: "Barrier lipid, completes lamellar membrane structure" },
        { name: "Niacinamide", function: "Vitamin B3, anti-ageing, barrier support" },
      ],
      ingredients: [
        { name: "Aqua (Water)", note: "Solvent base", flag: "ok" },
        { name: "Glycerin", note: "Humectant", flag: "ok" },
        { name: "Caprylic/Capric Triglyceride", note: "Emollient, skin-identical, non-comedogenic", flag: "ok" },
        { name: "Ceramide NP", note: "Barrier lipid, well-studied, effective", flag: "ok" },
        { name: "Ceramide AP", note: "Barrier lipid", flag: "ok" },
        { name: "Ceramide EOP", note: "Barrier lipid, critical for corneocyte envelope", flag: "ok" },
        { name: "Cholesterol", note: "Barrier lipid, completes the natural lamellar triad", flag: "ok" },
        { name: "Niacinamide", note: "Vitamin B3, anti-ageing, barrier stimulant", flag: "ok" },
        { name: "Retinyl Palmitate", note: "Retinol ester, marketed as 'Retinol' but requires two conversion steps to reach active form. Substantially less potent than actual Retinol at comparable concentrations.", flag: "warn" },
        { name: "Parfum", note: "Fragrance, present in a leave-on overnight product. 8+ hours of exposure amplifies sensitisation risk. Top class of contact allergen; constituent allergens not disclosed.", flag: "warn" },
        { name: "CI 16185 (Red 17)", note: "Azo dye, cosmetic colourant, no therapeutic benefit. Allergen in subpopulations.", flag: "warn" },
        { name: "CI 19140 (Tartrazine)", note: "Azo dye, cosmetic colourant. Cross-reactor with aspirin sensitivity.", flag: "warn" },
        { name: "CI 42090 (Brilliant Blue FCF)", note: "Azo dye, cosmetic colourant. No therapeutic benefit.", flag: "warn" },
        { name: "Phenoxyethanol", note: "Preservative", flag: "ok" },
        { name: "Ethylhexylglycerin", note: "Co-preservative", flag: "ok" },
      ],
      pass_badges: ["INCI Verified", "Ceramide Complex", "Dry / Normal Skin"],
      warn_badges: ["Retinyl Palmitate Listed as Retinol (Label Mismatch)", "Synthetic Fragrance (Leave-On)", "3 Azo Dyes (Overnight Exposure)", "Low Active Concentration (Retinoid)"],
      info_badges: [],
      indiaContext:
        "Anti-ageing actives are a growing segment in India, with consumers increasingly researching ingredients. The 'Retinol' naming creates a false equivalence with clinical retinol products. Indian consumers comparing this to The Ordinary Retinol or prescription Tretinoin will have misaligned expectations. The ceramide base is genuinely good, but the retinoid claim requires clear correction.",
    },

    // ─── 10. Strawberry Dew Tinted Sunscreen SPF 50+ ──────────────────────────
    {
      productName: "Strawberry Dew Tinted Sunscreen SPF 50+ PA++++",
      slug: "strawberry-dew-tinted-sunscreen",
      brand: "Dot & Key",
      brandSlug: "dot-and-key",
      priceRange: "₹449-₹749",
      productType: "sunscreen",
      concern: "Sun protection + light coverage",
      summary:
        "A tinted SPF 50+/PA++++ sunscreen with a modern UV filter system. No Benzophenone-3, instead using Uvinul A Plus, Tinosorb S, and Ethylhexyl Triazone. Strawberry extract (Fragaria Vesca) and Niacinamide round out the skin benefits. Cosmetic tint is achieved with iron oxides (CI 77492, CI 77491), these are inert mineral pigments, not azo dyes, and provide the additional benefit of visible light (VL) protection. This is a technically strong tinted sunscreen. The main note: Strawberry extract is likely at trace concentration (low INCI position), so the 'Strawberry' branding is primarily aesthetic. No fragrance.",
      score: 82,
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/1_eec017a6-6f05-45e3-9916-62e20cc6877c.jpg?v=1777372150",
      analyzedAt: "2026-05-20",
      pillars: [
        {
          name: "Safety & Toxicity",
          score: 34,
          max: 40,
          note: "Ethylhexyl Methoxycinnamate (Octinoxate) is present in this leave-on sunscreen. The EU SCCS and FDA are both actively reassessing Octinoxate for potential endocrine disruption; it has not been banned but is under regulatory scrutiny and is a recognised aquatic pollutant. The remaining UV filters  -  Uvinul A Plus, Tinosorb S, and Ethylhexyl Triazone  -  are modern, photostable choices with strong safety records. No Benzophenone-3, no synthetic fragrance, no azo dyes. The tint is delivered by iron oxides (CI 77492, CI 77491), which are inert mineral pigments with no allergen risk  -  a meaningfully cleaner colourant choice than synthetic dyes.",
        },
        {
          name: "Formulation Quality & Efficacy",
          score: 23,
          max: 25,
          note: "SPF 50+ PA++++ is excellent protection and the UV filter system is photostable. Iron oxides provide a meaningful bonus: they block visible light, particularly blue-violet wavelengths, which is clinically relevant for managing melasma and post-inflammatory hyperpigmentation  -  conditions that worsen with both UV and visible light. Untinted sunscreens offer no visible light protection, making this tinted formula a genuine upgrade for anyone with melasma or PIH. Niacinamide adds brightening and anti-inflammatory benefit. Strawberry extract appears late in the INCI list, indicating a concentration likely below 1%; it contributes negligible antioxidant activity and is primarily a branding ingredient.",
        },
        {
          name: "Ingredient Disclosure & Transparency",
          score: 19,
          max: 25,
          note: "SPF 50+ PA++++ is claimed but the brand does not publish a test report on the product page. Without a published SPF test, consumers cannot independently verify the stated protection level. The full INCI is published on dotandkey.com, the iron oxide pigments are clearly listed, and the UV filter system is identifiable. The 'Strawberry Dew' name implies that strawberry extract plays a meaningful functional role, but its INCI position suggests only trace concentration. The visible light protection benefit of iron oxides  -  one of this product's genuine clinical advantages  -  is not explained to consumers.",
        },
        {
          name: "Ethics & Sustainability",
          score: 6,
          max: 10,
          note: "No synthetic fragrance. Iron oxide mineral pigments are used instead of azo dyes  -  a cleaner choice. Ethylhexyl Methoxycinnamate (Octinoxate) is a recognised aquatic pollutant with documented reef toxicity. Dot & Key is an Indian brand and is not sold in markets requiring mandatory animal testing for imported cosmetics. Packaging is plastic.",
        },
      ],
      keyActives: [
        { name: "Uvinul A Plus (Diethylamino Hydroxybenzoyl Hexyl Benzoate)", function: "UVA filter, broad-spectrum, photostable" },
        { name: "Tinosorb S (Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine)", function: "Broad-spectrum UVA/UVB filter, highly photostable" },
        { name: "Ethylhexyl Triazone", function: "UVB filter, photostable" },
        { name: "CI 77492 / CI 77491 (Iron Oxides)", function: "Mineral tint, inert, safe. Also provides visible light (VL) protection relevant for melasma" },
        { name: "Niacinamide", function: "Vitamin B3, brightening, barrier support" },
      ],
      ingredients: [
        { name: "Aqua (Water)", note: "Solvent base", flag: "ok" },
        { name: "Diethylamino Hydroxybenzoyl Hexyl Benzoate", note: "UVA filter (Uvinul A Plus), modern, photostable, good safety profile", flag: "ok" },
        { name: "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine", note: "Broad-spectrum UVA/UVB filter (Tinosorb S), photostable", flag: "ok" },
        { name: "Ethylhexyl Triazone", note: "UVB filter, photostable, well-tolerated", flag: "ok" },
        { name: "Niacinamide", note: "Vitamin B3, brightening, sebum regulation", flag: "ok" },
        { name: "Glycerin", note: "Humectant", flag: "ok" },
        { name: "Fragaria Vesca (Strawberry) Fruit Extract", note: "Antioxidant, low INCI position suggests trace concentration; primarily a marketing ingredient", flag: "info" },
        { name: "CI 77492 (Iron Oxide Yellow)", note: "Mineral tint pigment, inert, safe. Provides VL protection (melasma management benefit).", flag: "ok" },
        { name: "CI 77491 (Iron Oxide Red)", note: "Mineral tint pigment, inert, safe", flag: "ok" },
        { name: "Butylene Glycol", note: "Humectant and solvent", flag: "ok" },
        { name: "Phenoxyethanol", note: "Preservative", flag: "ok" },
        { name: "Ethylhexylglycerin", note: "Co-preservative", flag: "ok" },
      ],
      pass_badges: ["Fragrance Free", "No Benzophenone-3", "INCI Verified", "Mineral Tint (Iron Oxides)", "No Azo Dyes", "Sensitive Skin Friendly", "Melasma-Prone Skin", "All Skin Types (Daily SPF)"],
      warn_badges: ["Octinoxate Present (Leave-On)", "Low Active Concentration (Strawberry Extract)"],
      info_badges: ["Strawberry Extract at Trace Level"],
      indiaContext:
        "Iron oxide tinted sunscreens have particular relevance for India because visible light (blue-violet light) is now understood to worsen melasma, a condition highly prevalent in South Asian skin. Iron oxides in tinted sunscreens provide VL protection that untinted SPFs cannot. This makes tinted SPFs a clinically meaningful upgrade for Indians with melasma or PIH.",
    },

  ],
};
