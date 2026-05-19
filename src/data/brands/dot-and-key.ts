/**
 * Dot & Key, Brand Scorecard Data
 *
 * SOURCING METHODOLOGY
 * --------------------
 * INCI ingredient lists: verified from dotandkey.com product pages (May 2026).
 * Concentrations: inferred from INCI declaration order (cosmetics labelling law requires
 *   descending order by weight). No percentage is stated unless published by the brand.
 * Image URLs: fetched directly from dotandkey.com Shopify CDN (May 2026).
 * Pillar scores: independently calculated; see inline notes.
 *
 * KEY CONCERNS IDENTIFIED
 * -----------------------
 * - Benzophenone-3 (Oxybenzone) in Watermelon Sunscreen: UV filter with endocrine disruption
 *   evidence, restricted in some markets (Hawaii ban). High INCI position suggests >5%.
 * - Retinyl Palmitate sold under "Retinol" branding: materially different bioavailability
 *   and activity, a disclosure/transparency concern.
 * - Fragrance (parfum) in 4 products including face wash marketed for sensitive skin.
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
  avgScore: 70,
  verdict: "Fair",

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
      score: 79,
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/VitaminCSunscreenListing1-1_637b02a6-7537-475e-989f-bd472a2e415c.jpg?v=1778839085",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Safety & Toxicity",       score: 42, max: 50, note: "Modern UV filters (Uvinul A Plus, Tinosorb S, Ethylhexyl Triazone) with strong safety profiles. No Benzophenone-3. Ethylhexyl Methoxycinnamate at low INCI position, minimal endocrine concern at this concentration. No fragrance. No dyes. Cyclopentasiloxane is volatile and evaporates after application, minimal systemic absorption concern." },
        { name: "Formulation Quality",     score: 16, max: 20, note: "Broad-spectrum SPF 50+ PA++++ is well-validated. Ascorbyl Glucoside delivers stable Vitamin C with gradual brightening activity. Niacinamide at meaningful position adds pore-minimising and anti-inflammatory benefit. UV filter system is photostable." },
        { name: "Claims & Transparency",   score: 15, max: 20, note: "Full INCI published on brand website. PA++++ rating disclosed. No UV filter percentages (industry standard for India). Vitamin C form (Ascorbyl Glucoside, not L-Ascorbic Acid) is not highlighted in marketing  -  a minor transparency gap consumers should know about." },
        { name: "Ethics & Sustainability", score:  6, max: 10, note: "Indian brand, not sold in mandatory-testing markets. No synthetic fragrance in this product. Plastic tube packaging. RSPO palm derivative status not independently verified." },
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
      warn_badges: [],
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
      score: 61,
      scoreLabel: "Fair",
      image: "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1.webp?v=1770640542",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Safety & Toxicity",       score: 31, max: 50, note: "Two azo dyes: CI 15985 (Sunset Yellow FCF) and CI 19140 (Tartrazine)  -  both cosmetic colourants with no skin benefit and documented allergen potential in subpopulations. Parfum (fragrance) present with constituent allergens not disclosed. Fragrance is the leading class of contact allergen globally. Combined sensitisation load is meaningful for a daily leave-on moisturiser." },
        { name: "Formulation Quality",     score: 11, max: 20, note: "Ascorbyl Glucoside + Niacinamide + Tocopherol is a credible brightening stack with supporting evidence. Sodium Hyaluronate adds hydration. Efficacy is genuine but limited by derivative Vitamin C form. The two dyes and fragrance add no skin benefit." },
        { name: "Claims & Transparency",   score: 14, max: 20, note: "INCI list published. Dyes and fragrance are disclosed in INCI  -  marks for listing them. However, \"Vitamin C\" marketing implies L-Ascorbic Acid to most consumers; the product uses Ascorbyl Glucoside. Constituent fragrance allergens not disclosed beyond \"Parfum\". \"Kind to skin\" brand positioning conflicts with fragrance inclusion." },
        { name: "Ethics & Sustainability", score:  5, max: 10, note: "Synthetic azo dyes add aquatic toxicity concern. Fragrance of undisclosed composition. Indian brand, not in China market. Plastic jar packaging." },
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
      warn_badges: ["Contains Fragrance", "Azo Dyes (×2)", "Not Recommended for Sensitive Skin"],
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
      score: 62,
      scoreLabel: "Fair",
      image: "https://www.dotandkey.com/cdn/shop/files/1a_3ef32ac6-5192-495c-b4bb-dafb0e806260.jpg?v=1778839652",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Safety & Toxicity",       score: 30, max: 50, note: "Benzophenone-3 (Oxybenzone) at high INCI position, estimated >5% from order analysis. In-vitro endocrine disruption evidence exists; FDA has formally requested additional safety data. Hawaii banned it for reef protection (2021). Ethylhexyl Methoxycinnamate also present with minor endocrine concern data. Parfum (fragrance) adds sensitisation risk. This UV filter combination carries more concern than modern alternatives." },
        { name: "Formulation Quality",     score: 12, max: 20, note: "SPF 50 PA+++ provides adequate protection. Watermelon extract and Aloe Vera contribute soothing and hydration. UV protection is functional. The formulation choice of Benzophenone-3 when modern alternatives (Tinosorb S, Uvinul A Plus) are available is a quality signal." },
        { name: "Claims & Transparency",   score: 15, max: 20, note: "Full INCI published. All UV filters visible. Parfum disclosed. No percentage data (standard for market). Benzophenone-3 concerns are not acknowledged in product description  -  consumers are not guided toward any risk context." },
        { name: "Ethics & Sustainability", score:  5, max: 10, note: "Benzophenone-3 is a known aquatic pollutant. Synthetic fragrance present. Indian brand, not in China market. Plastic packaging." },
      ],
      keyActives: [
        { name: "Benzophenone-3 (Oxybenzone)", function: "UVA/UVB filter, high INCI position suggests >5%; endocrine disruption concern" },
        { name: "Ethylhexyl Methoxycinnamate", function: "UVB filter (Octinoxate), widely used; some endocrine concern at high concentrations" },
        { name: "Watermelon (Citrullus Lanatus) Extract", function: "Antioxidant, soothing, marketed hero ingredient" },
        { name: "Aloe Barbadensis Leaf Juice", function: "Soothing, humectant" },
      ],
      ingredients: [
        { name: "Aqua (Water)", note: "Solvent base", flag: "ok" },
        { name: "Benzophenone-3", note: "UV filter (Oxybenzone), high INCI position suggests significant concentration. Evidence for endocrine disruption in in-vitro studies. FDA has requested further safety data. Hawaii reef ban. Significant concern.", flag: "warn" },
        { name: "Ethylhexyl Methoxycinnamate", note: "UVB filter (Octinoxate), effective, widely used; some endocrine concern data exists", flag: "info" },
        { name: "Citrullus Lanatus (Watermelon) Fruit Extract", note: "Antioxidant, skin-soothing, low functional concentration likely", flag: "ok" },
        { name: "Aloe Barbadensis Leaf Juice", note: "Soothing, hydrating", flag: "ok" },
        { name: "Glycerin", note: "Humectant, safe, widely studied", flag: "ok" },
        { name: "Butylene Glycol", note: "Humectant and solvent", flag: "ok" },
        { name: "Parfum", note: "Fragrance, irritation risk; particularly concerning in a product applied liberally to face", flag: "warn" },
        { name: "Phenoxyethanol", note: "Preservative at typical cosmetic concentration", flag: "ok" },
        { name: "Ethylhexylglycerin", note: "Co-preservative, skin conditioning", flag: "ok" },
      ],
      pass_badges: ["INCI Verified", "SPF 50 PA+++", "Oily / Combination Skin"],
      warn_badges: ["Benzophenone-3 (Oxybenzone)", "Contains Fragrance", "Not Recommended for Sensitive Skin"],
      info_badges: ["Octinoxate Present"],
      indiaContext:
        "For Indian consumers: Benzophenone-3 is particularly concerning given India's high UV intensity requiring liberal, frequent application, increasing systemic absorption potential. The brand's Vitamin C + E Sunscreen (score: 79) uses modern UV filters without these concerns and is the recommended Dot & Key SPF option.",
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
      score: 83,
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/BRMoisturizerListing1-175g_d7e221bd-de44-4182-b22a-43d0225a5d6a.jpg?v=1757933267",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Safety & Toxicity",       score: 44, max: 50, note: "No fragrance, no dyes, no alcohol denat. Ceramide complex is extensively studied and safe. Phenoxyethanol at typical preservative level. Caprylic/Capric Triglyceride is non-comedogenic emollient-grade. Niacinamide, Panthenol, and Allantoin all have excellent safety records. Leave-on daily use with no significant concerns." },
        { name: "Formulation Quality",     score: 16, max: 20, note: "Ceramides NP/AP/EOP + Cholesterol + Phytosphingosine replicates the natural lamellar membrane structure  -  the gold-standard barrier repair complex. Niacinamide and Panthenol add independent barrier-stimulating and soothing benefits. Claims are fully substantiated. This is the strongest Dot & Key formulation by score." },
        { name: "Claims & Transparency",   score: 16, max: 20, note: "Full INCI published. Multiple ceramide types individually named and identifiable. No ceramide concentration disclosures  -  minor gap. Product claims match the ingredient profile accurately. No misleading marketing language." },
        { name: "Ethics & Sustainability", score:  7, max: 10, note: "No fragrance, no synthetic dyes in formula. Indian brand. Lightweight plastic packaging. Good formulation ethics. RSPO status unverified." },
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
      score: 73,
      scoreLabel: "Fair",
      image: "https://www.dotandkey.com/cdn/shop/files/Artboard_1_f94f4456-d328-4271-ab7e-94bde8c9bbd3.jpg?v=1745323515",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Safety & Toxicity",       score: 40, max: 50, note: "CI 42090 (Brilliant Blue FCF)  -  one azo dye with no therapeutic value and some allergen potential. No fragrance. Niacinamide at 10% can cause transient flushing in a small subset of individuals (rare, temporary). Otherwise clean safety profile with well-tolerated actives. Minor deduction for unnecessary dye with no functional role." },
        { name: "Formulation Quality",     score: 13, max: 20, note: "10% Niacinamide is clinically validated for pore minimising and oil control (Draelos et al.). Zinc PCA adds sebum regulation. Strawberry extract at low INCI position contributes negligible Vitamin C activity  -  it is primarily a marketing ingredient in this context." },
        { name: "Claims & Transparency",   score: 13, max: 20, note: "10% Niacinamide percentage disclosed  -  good. Strawberry extract appears at low INCI position, likely below 1%, yet product name and marketing prominently feature \"Strawberry Bright\" as a hero claim. The implied Vitamin C contribution from Strawberry is not at a meaningful concentration. Azo dye not called out in marketing as purely cosmetic." },
        { name: "Ethics & Sustainability", score:  7, max: 10, note: "No fragrance. One azo dye present (minor environmental concern). Indian brand, not in China market. Lightweight formulation. Plastic packaging." },
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
      warn_badges: ["Azo Dye Present"],
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
      score: 75,
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/1-1_b4ae866f-e0a8-43d1-971f-1d143d76f01c.jpg?v=1761888942",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Safety & Toxicity",       score: 40, max: 50, note: "No fragrance, no dyes. Diethylene Glycol Monoethyl Ether (DGME) is present  -  EU SCCS has classified it as a Category 5 skin penetration enhancer under ongoing safety review. Currently permitted in India and EU but flagged for further data. DGME enhances transdermal absorption of all co-formulated ingredients, increasing systemic exposure potential." },
        { name: "Formulation Quality",     score: 14, max: 20, note: "Ascorbyl Glucoside at 10% (brand-confirmed) in a Vitamin C + E synergy system with Sodium Hyaluronate. C+E synergy is well-established antioxidant literature. Gentler Vitamin C form than L-Ascorbic Acid, better suited to India's heat. DGME improves penetration but adds a safety consideration." },
        { name: "Claims & Transparency",   score: 15, max: 20, note: "Full INCI published. 10% Vitamin C concentration disclosed. DGME is listed in INCI (full disclosure) but its penetration-enhancing properties are not communicated to consumers. \"Vitamin C\" marketing implies L-Ascorbic Acid to most consumers; the product uses Ascorbyl Glucoside." },
        { name: "Ethics & Sustainability", score:  6, max: 10, note: "No fragrance, no dyes. Indian brand. Plastic packaging. RSPO status unverified." },
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
        { name: "Diethylene Glycol Monoethyl Ether (DGME)", note: "Skin penetration enhancer, EU SCCS Category 5 ingredient under safety review. Permitted currently but enhances absorption of co-formulated ingredients.", flag: "warn" },
        { name: "Allantoin", note: "Soothing, barrier-supportive", flag: "ok" },
        { name: "Phenoxyethanol", note: "Preservative at typical cosmetic level", flag: "ok" },
        { name: "Ethylhexylglycerin", note: "Co-preservative", flag: "ok" },
      ],
      pass_badges: ["Fragrance Free", "No Azo Dyes", "INCI Verified", "Vitamin C + E Synergy", "All Skin Types", "Sensitive Skin Friendly"],
      warn_badges: ["DGME (Penetration Enhancer)"],
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
      score: 63,
      scoreLabel: "Fair",
      image: "https://www.dotandkey.com/cdn/shop/files/1-72-hrs-gel---listing.jpg?v=1744369744",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Safety & Toxicity",       score: 33, max: 50, note: "Parfum (fragrance) present with constituent allergens not disclosed. CI 42090 (Brilliant Blue FCF azo dye) present with no skin benefit and documented allergen potential. For a daily leave-on hydrating gel, both represent unnecessary sensitisation risk. Multi-weight Sodium Hyaluronate and Glycerin are safe and effective." },
        { name: "Formulation Quality",     score: 12, max: 20, note: "Sodium Hyaluronate + Sodium Hyaluronate Crosspolymer + Glycerin + Panthenol is a credible hydration system. \"72HR Hydration\" claim is a marketing statement without a specific published study for this exact formula. Hydrating evidence for HA is well-established but the duration claim is not independently substantiated for this product." },
        { name: "Claims & Transparency",   score: 13, max: 20, note: "Full INCI published. Fragrance and azo dye disclosed. \"72HR Hydration\" claim not supported by a cited study for this specific product. Blue dye added purely for aesthetic/brand purposes  -  this is not communicated to consumers as such." },
        { name: "Ethics & Sustainability", score:  5, max: 10, note: "Synthetic fragrance present. Azo dye aquatic concern. Indian brand. Plastic packaging." },
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
        { name: "Parfum", note: "Fragrance, top allergen. No functional role in a hydrating gel.", flag: "warn" },
        { name: "CI 42090 (Brilliant Blue FCF)", note: "Azo dye, cosmetic colourant only. No skin benefit. Documented allergen in subpopulations.", flag: "warn" },
        { name: "Phenoxyethanol", note: "Preservative at typical cosmetic level", flag: "ok" },
        { name: "Ethylhexylglycerin", note: "Co-preservative", flag: "ok" },
      ],
      pass_badges: ["INCI Verified", "Multi-Weight HA", "Oily / Combination Skin"],
      warn_badges: ["Contains Fragrance", "Azo Dye Present", "Not Recommended for Sensitive Skin"],
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
      score: 70,
      scoreLabel: "Fair",
      image: "https://www.dotandkey.com/cdn/shop/files/1-BRfacewash-Listing-175ml.jpg?v=1754918416",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Safety & Toxicity",       score: 38, max: 50, note: "Surfactant system (Sodium Lauroyl Sarcosinate, Cocamidopropyl Betaine) is mild and appropriate for barrier-compromised skin. Ceramide NP and Panthenol add barrier benefit even in rinse-off. Parfum (fragrance) present in a product explicitly marketed for sensitive and barrier-compromised skin  -  fragrance is the leading cause of allergic contact dermatitis in facial cleansers. Rinse-off format reduces but does not eliminate sensitisation risk." },
        { name: "Formulation Quality",     score: 12, max: 20, note: "Mild sulfate-free surfactant system is appropriate for the claimed use case. Ceramide and Panthenol inclusion in rinse-off has limited barrier-repair evidence (most benefit rinses away) but is a positive signal. Allantoin adds mild post-wash soothing. Does not include any harsh stripping agents." },
        { name: "Claims & Transparency",   score: 14, max: 20, note: "Full INCI published. Ceramide types clearly named. Fragrance disclosed as \"Parfum\" without allergen breakdown. The explicit \"for sensitive and barrier-compromised skin\" positioning while containing fragrance is a meaningful and unacknowledged contradiction." },
        { name: "Ethics & Sustainability", score:  6, max: 10, note: "Indian brand. Sulfate-free formulation is a positive. Fragrance present. Plastic packaging." },
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
        { name: "Parfum", note: "Fragrance, present in a product for sensitive/barrier skin. Leading cause of contact dermatitis in facial cleansers.", flag: "warn" },
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
      score: 52,
      scoreLabel: "Concern",
      image: "https://www.dotandkey.com/cdn/shop/files/1_7.jpg?v=1764061107",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Safety & Toxicity",       score: 25, max: 50, note: "Three cosmetic azo dyes (CI 16185, CI 19140, CI 42090) in a leave-on overnight night cream  -  the highest dye load in the range. Parfum (fragrance) present with no allergen breakdown. Leave-on overnight means 8+ hours of sensitisation exposure on resting skin. Retinyl Palmitate in leave-on context: some data suggests photosensitisation risk if residual exposure occurs in morning." },
        { name: "Formulation Quality",     score: 11, max: 20, note: "Ceramide complex (NP/AP/EOP + Cholesterol) is genuinely efficacious for barrier support. Niacinamide adds barrier and anti-ageing benefit. Retinyl Palmitate at low INCI position is unlikely to deliver meaningful anti-ageing activity: it requires two metabolic conversion steps to reach retinoic acid, and concentration appears low from INCI position." },
        { name: "Claims & Transparency",   score: 11, max: 20, note: "INCI published. However, the product is named and marketed as a \"Retinol\" night cream while the INCI active is Retinyl Palmitate  -  a different molecule with materially lower bioactivity. This is the most significant transparency concern in the Dot & Key range. Consumers comparing this to actual Retinol serums will have misaligned efficacy expectations." },
        { name: "Ethics & Sustainability", score:  5, max: 10, note: "Three azo dyes with aquatic toxicity concern. Synthetic fragrance. Indian brand. Plastic packaging." },
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
        { name: "Parfum", note: "Fragrance, present in a leave-on overnight product. 8-hour exposure amplifies sensitisation risk.", flag: "warn" },
        { name: "CI 16185 (Red 17)", note: "Azo dye, cosmetic colourant, no therapeutic benefit. Allergen in subpopulations.", flag: "warn" },
        { name: "CI 19140 (Tartrazine)", note: "Azo dye, cosmetic colourant. Cross-reactor with aspirin sensitivity.", flag: "warn" },
        { name: "CI 42090 (Brilliant Blue FCF)", note: "Azo dye, cosmetic colourant. No therapeutic benefit.", flag: "warn" },
        { name: "Phenoxyethanol", note: "Preservative", flag: "ok" },
        { name: "Ethylhexylglycerin", note: "Co-preservative", flag: "ok" },
      ],
      pass_badges: ["INCI Verified", "Ceramide Complex", "Dry / Normal Skin"],
      warn_badges: ["Retinyl Palmitate ≠ Retinol", "Contains Fragrance", "3 Azo Dyes"],
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
      score: 77,
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/1_eec017a6-6f05-45e3-9916-62e20cc6877c.jpg?v=1777372150",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Safety & Toxicity",       score: 42, max: 50, note: "Modern UV filters (Uvinul A Plus, Tinosorb S, Ethylhexyl Triazone) with strong safety profiles. No Benzophenone-3. Iron oxides (CI 77492, CI 77491) are inert mineral pigments, non-allergenic, and provide visible light protection relevant for melasma. No fragrance. No azo dyes. Ethylhexyl Methoxycinnamate at low INCI position adds minor endocrine concern data  -  small deduction." },
        { name: "Formulation Quality",     score: 14, max: 20, note: "SPF 50+ PA++++ is excellent protection. Iron oxide tint provides additional visible light (VL) protection, particularly beneficial for melasma management. Niacinamide adds brightening and anti-inflammatory benefit. Strawberry extract at low INCI position contributes negligible antioxidant activity  -  primarily a marketing ingredient. Photostable UV filter system." },
        { name: "Claims & Transparency",   score: 15, max: 20, note: "Full INCI published. Iron oxide pigments clearly listed. UV filter system transparent. \"Strawberry Dew\" branding implies meaningful strawberry content; actual INCI position suggests trace amount. VL protection benefit of iron oxides not communicated clearly to consumers." },
        { name: "Ethics & Sustainability", score:  6, max: 10, note: "No synthetic fragrance in this product. No azo dyes. Mineral pigments. Indian brand. Plastic packaging. RSPO unverified." },
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
      warn_badges: [],
      info_badges: ["Strawberry Extract at Trace Level"],
      indiaContext:
        "Iron oxide tinted sunscreens have particular relevance for India because visible light (blue-violet light) is now understood to worsen melasma, a condition highly prevalent in South Asian skin. Iron oxides in tinted sunscreens provide VL protection that untinted SPFs cannot. This makes tinted SPFs a clinically meaningful upgrade for Indians with melasma or PIH.",
    },

  ],
};
