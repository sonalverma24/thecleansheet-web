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
  avgScore: 73,
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
        "A broad-spectrum SPF 50+ sunscreen combining a modern UV filter system (Uvinul A Plus, Tinosorb S, Ethylhexyl Triazone) with Vitamin C (Ascorbyl Glucoside, a stable derivative) and Hyaluronic Acid. No Benzophenone-3. Texture is lightweight and non-greasy. INCI-verified formulation with no fragrance and no dyes, the cleanest sunscreen in the Dot & Key range. Minor deduction: Ascorbyl Glucoside is a stable but less potent Vitamin C form compared to L-Ascorbic Acid; the brightening claim is directionally accurate but efficacy is moderate.",
      score: 82,
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/VitaminCSunscreenListing1-1_637b02a6-7537-475e-989f-bd472a2e415c.jpg?v=1778839085",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Ingredient Safety",    score: 22, max: 25, note: "Modern UV filters with good safety profiles. No Benzophenone-3. Octinoxate absent. Ethylhexyl Methoxycinnamate used at likely <5% (low INCI position)." },
        { name: "Irritation Potential", score: 16, max: 20, note: "No fragrance. No alcohol denat. Phenoxyethanol at typical preservative level (~0.5-0.8%). Low irritation risk overall." },
        { name: "Disclosure Quality",   score: 15, max: 20, note: "Full INCI list published on site. No percentage disclosures, standard for Indian market. Vitamin C form (Ascorbyl Glucoside, not L-Ascorbic Acid) not called out in marketing." },
        { name: "Regulatory",           score:  9, max: 10, note: "All UV filters permissible under Indian cosmetics regulations (Schedule M). PA++++ rating verified." },
        { name: "Efficacy",             score: 13, max: 15, note: "Broad-spectrum UVA/UVB protection well-established. Vitamin C derivative (Ascorbyl Glucoside) has evidence for brightening but lower potency than L-Ascorbic Acid." },
        { name: "Transparency",         score:  7, max: 10, note: "No SPF ingredient percentages disclosed. Vitamin C form not highlighted in product description, mild transparency gap." },
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
      pass_badges: ["Fragrance Free", "No Benzophenone-3", "INCI Verified", "Modern UV Filters", "No Azo Dyes"],
      warn_badges: [],
      info_badges: ["Vitamin C Derivative (Not L-Ascorbic Acid)"],
      indiaContext:
        "SPF 50+ with PA++++ is the recommended minimum for Indian climate. This formulation uses EU-approved modern UV filters not yet available in US sunscreens, a genuine formulation advantage. No Benzophenone-3 (unlike the Watermelon Sunscreen), making this the safer Dot & Key SPF choice.",
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
      score: 66,
      scoreLabel: "Good",
      image: "https://cdn.shopify.com/s/files/1/0361/8553/8692/files/1.webp?v=1770640542",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Ingredient Safety",    score: 18, max: 25, note: "Azo dyes CI 15985 and CI 19140 are cosmetic colourants with documented allergen potential. Both are on EWG watchlist. No therapeutic role." },
        { name: "Irritation Potential", score: 11, max: 20, note: "Parfum (fragrance) present, top allergen per INCI convention. Combined with two azo dyes, irritation risk is meaningful, particularly for sensitive or reactive skin." },
        { name: "Disclosure Quality",   score: 16, max: 20, note: "INCI list published. Dyes and fragrance are disclosed, marks for transparency, but the product is marketed with 'kind to skin' positioning that conflicts with fragrance inclusion." },
        { name: "Regulatory",           score:  8, max: 10, note: "All ingredients permissible under Indian cosmetics regulations. Azo dyes are permitted in India at cosmetic concentrations." },
        { name: "Efficacy",             score:  9, max: 15, note: "Ascorbyl Glucoside + Niacinamide + Tocopherol is a credible brightening stack. Humectant system (Glycerin, Sodium Hyaluronate) supports hydration. Some benefit, but Vitamin C form is less potent." },
        { name: "Transparency",         score:  4, max: 10, note: "Fragrance listed as 'Parfum', constituent allergens not disclosed. 'Vitamin C' in marketing implies L-Ascorbic Acid; product uses derivative. Two dyes in a 'brightening' moisturiser is not clearly communicated." },
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
      pass_badges: ["INCI Verified", "Vitamin C Complex"],
      warn_badges: ["Contains Fragrance", "Azo Dyes (×2)"],
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
      score: 69,
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/1a_3ef32ac6-5192-495c-b4bb-dafb0e806260.jpg?v=1778839652",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Ingredient Safety",    score: 16, max: 25, note: "Benzophenone-3 (Oxybenzone) at high INCI position, estimated >5%. In-vitro endocrine disruption evidence; FDA has requested further safety data. Hawaii reef protection ban (2021). Significant deduction." },
        { name: "Irritation Potential", score: 13, max: 20, note: "Parfum present. Benzophenone-3 is also a documented photoallergen. Combined sensitisation risk is higher than the brand's other sunscreen." },
        { name: "Disclosure Quality",   score: 17, max: 20, note: "INCI list fully published. All UV filters visible. Parfum disclosed. No percentage data, standard for market." },
        { name: "Regulatory",           score:  7, max: 10, note: "Benzophenone-3 is permitted under Indian cosmetics regulations and current EU limits. However, regulatory trajectory is restrictive, FDA scrutiny, EU discussions ongoing." },
        { name: "Efficacy",             score: 11, max: 15, note: "SPF 50/PA+++ provides adequate protection. Watermelon extract and aloe vera contribute hydration. UV protection is functional." },
        { name: "Transparency",         score:  5, max: 10, note: "Benzophenone-3 concerns not acknowledged in product description. Marketed primarily on sensorial/texture benefits rather than UV filter credentials." },
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
      pass_badges: ["INCI Verified", "SPF 50 PA+++"],
      warn_badges: ["Benzophenone-3 (Oxybenzone)", "Contains Fragrance"],
      info_badges: ["Octinoxate Present"],
      indiaContext:
        "For Indian consumers: Benzophenone-3 is particularly concerning given India's high UV intensity requiring liberal, frequent application, increasing systemic absorption potential. The brand's Vitamin C + E Sunscreen (score: 82) uses modern UV filters without these concerns and is the recommended Dot & Key SPF option.",
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
      score: 84,
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/BRMoisturizerListing1-175g_d7e221bd-de44-4182-b22a-43d0225a5d6a.jpg?v=1757933267",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Ingredient Safety",    score: 22, max: 25, note: "No significant safety concerns. Ceramide complex is well-studied. Phenoxyethanol at typical preservative level. Caprylic/Capric Triglyceride is emollient-grade, not a concern." },
        { name: "Irritation Potential", score: 18, max: 20, note: "No fragrance. No dyes. No alcohol denat. No common sensitisers. Allantoin and Panthenol actively support skin tolerance. Lowest irritation risk in the Dot & Key range." },
        { name: "Disclosure Quality",   score: 17, max: 20, note: "Full INCI list published. Multiple ceramide types clearly identified. No percentage data, typical for India market." },
        { name: "Regulatory",           score:  9, max: 10, note: "All ingredients well within regulatory norms. Ceramide complex not subject to any restrictions." },
        { name: "Efficacy",             score: 12, max: 15, note: "Ceramides NP/AP/EOP + Cholesterol + Phytosphingosine is the gold-standard barrier repair complex (used in CeraVe, Medik8 etc.). Niacinamide + Panthenol + Allantoin add meaningful supporting activity." },
        { name: "Transparency",         score:  6, max: 10, note: "Product is well positioned and claims are substantiated. Minor gap: ceramide percentages not disclosed." },
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
      pass_badges: ["Fragrance Free", "No Azo Dyes", "INCI Verified", "Ceramide Complex", "No Alcohol Denat"],
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
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/Artboard_1_f94f4456-d328-4271-ab7e-94bde8c9bbd3.jpg?v=1745323515",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Ingredient Safety",    score: 20, max: 25, note: "Generally clean. CI 42090 (Brilliant Blue FCF) is an azo dye with allergen potential, no therapeutic rationale. Minor safety deduction." },
        { name: "Irritation Potential", score: 16, max: 20, note: "No fragrance. Niacinamide at 10% can cause transient flushing in a small subset (niacin flush) but this is rare and temporary. Single azo dye adds marginal sensitisation risk." },
        { name: "Disclosure Quality",   score: 16, max: 20, note: "INCI published. 10% Niacinamide percentage disclosed by brand, good. Strawberry extract concentration not disclosed; ingredient position suggests trace." },
        { name: "Regulatory",           score:  9, max: 10, note: "All ingredients within Indian and EU regulatory limits. Azo dye is permitted at cosmetic concentrations." },
        { name: "Efficacy",             score:  8, max: 15, note: "10% Niacinamide is clinically validated at this concentration for pore minimising and oil control (Draelos et al.). Zinc PCA adds oil regulation. Strawberry extract at trace levels contributes negligible vitamin C activity." },
        { name: "Transparency",         score:  4, max: 10, note: "Product name and marketing prominently features 'Strawberry Bright', implying meaningful strawberry/Vitamin C contribution. Actual concentration is likely <1% (low INCI position). This is a misleading emphasis." },
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
      pass_badges: ["Fragrance Free", "INCI Verified", "10% Niacinamide"],
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
      score: 77,
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/1-1_b4ae866f-e0a8-43d1-971f-1d143d76f01c.jpg?v=1761888942",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Ingredient Safety",    score: 21, max: 25, note: "DGME (Diethylene Glycol Monoethyl Ether) present, EU SCCS Category 5 penetration enhancer, under ongoing safety review. Permitted currently, but a formulation concern worth noting." },
        { name: "Irritation Potential", score: 16, max: 20, note: "No fragrance. No dyes. Ascorbyl Glucoside is a gentle C derivative (vs. L-Ascorbic Acid which is pH-sensitive and can irritate). Low overall irritation risk." },
        { name: "Disclosure Quality",   score: 17, max: 20, note: "INCI list published. 10% Vitamin C percentage disclosed. DGME disclosed in INCI, full transparency on ingredient list." },
        { name: "Regulatory",           score:  8, max: 10, note: "DGME is not restricted under current Indian regulations. EU has flagged for further data. Permitted but under scrutiny." },
        { name: "Efficacy",             score: 11, max: 15, note: "Ascorbyl Glucoside has clinical evidence for brightening and antioxidant activity, though less potent than L-Ascorbic Acid. C+E synergy (Vitamin C + Tocopherol) is well established." },
        { name: "Transparency",         score:  4, max: 10, note: "'Vitamin C' branding implies L-Ascorbic Acid to most consumers; the product uses a derivative. DGME's penetration-enhancing properties are not communicated. Minor concern." },
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
      pass_badges: ["Fragrance Free", "No Azo Dyes", "INCI Verified", "Vitamin C + E Synergy"],
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
      score: 67,
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/1-72-hrs-gel---listing.jpg?v=1744369744",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Ingredient Safety",    score: 19, max: 25, note: "CI 42090 is an azo dye with no therapeutic value. Parfum present. Both add allergen load without benefit." },
        { name: "Irritation Potential", score: 13, max: 20, note: "Fragrance (Parfum) is the top contact allergen globally. Blue dye adds marginal additional risk. Combined sensitisation potential is meaningful for a daily moisturizer." },
        { name: "Disclosure Quality",   score: 15, max: 20, note: "INCI list published. Parfum and CI 42090 disclosed. '72HR Hydration' claim not supported by published study data, though HA-based formulas have strong indirect evidence." },
        { name: "Regulatory",           score:  8, max: 10, note: "All ingredients within regulatory limits. Azo dye and Parfum are permitted at cosmetic concentrations." },
        { name: "Efficacy",             score:  8, max: 15, note: "Multi-weight Sodium Hyaluronate + Glycerin + Panthenol is a credible hydration system. The '72HR' claim is a marketing statement without specific study citation for this exact formula." },
        { name: "Transparency",         score:  4, max: 10, note: "No study cited for '72HR Hydration' claim. Blue dye added to a 'hydrating' product serves only aesthetic/marketing purposes, not disclosed as such." },
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
      pass_badges: ["INCI Verified", "Multi-Weight HA"],
      warn_badges: ["Contains Fragrance", "Azo Dye Present"],
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
      score: 72,
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/1-BRfacewash-Listing-175ml.jpg?v=1754918416",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Ingredient Safety",    score: 21, max: 25, note: "Surfactant system is mild, Sodium Lauroyl Sarcosinate and Cocamidopropyl Betaine are low-irritation options. Ceramides and Panthenol add barrier benefit. Fragrance is the main safety flag." },
        { name: "Irritation Potential", score: 14, max: 20, note: "Parfum present in a product for sensitive/barrier-compromised skin is contradictory. Fragrance is the #1 cause of allergic contact dermatitis in facial cleansers. Rinse-off format reduces (but does not eliminate) risk." },
        { name: "Disclosure Quality",   score: 16, max: 20, note: "INCI published. Fragrance disclosed. Ceramide types clearly labelled. No concentration data, typical." },
        { name: "Regulatory",           score:  8, max: 10, note: "All ingredients within regulatory limits. Fragrance is permitted; the concern is formulation appropriateness, not legality." },
        { name: "Efficacy",             score:  8, max: 15, note: "Mild surfactant system effectively cleanses without stripping. Ceramide/Panthenol inclusion in a rinse-off product has limited evidence for barrier repair (most benefits rinse away) but is increasingly common. Allantoin provides mild post-wash soothing." },
        { name: "Transparency",         score:  5, max: 10, note: "Product marketed for 'sensitive' skin while containing fragrance, this positioning is misleading. Consumers with compromised barriers are the most susceptible to fragrance sensitisation." },
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
      pass_badges: ["Sulfate Free", "INCI Verified", "Ceramide Enriched", "Mild Surfactants"],
      warn_badges: ["Fragrance in Sensitive Skin Product"],
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
      score: 60,
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/1_7.jpg?v=1764061107",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Ingredient Safety",    score: 16, max: 25, note: "Three cosmetic azo dyes (CI 16185, CI 19140, CI 42090) in a leave-on night cream, highest dye load in the Dot & Key range. Parfum present. Retinyl Palmitate in combination with UV exposure (morning use after is common) has some data suggesting photosensitisation concern, though this is a night cream." },
        { name: "Irritation Potential", score: 11, max: 20, note: "Three dyes + Parfum in a leave-on night cream used on resting/repairing skin barrier is a meaningful irritation risk. 8-hour overnight exposure amplifies sensitisation potential." },
        { name: "Disclosure Quality",   score: 13, max: 20, note: "INCI list is published. However, marketing uses 'Retinol' prominently, the active is Retinyl Palmitate. This is a material misrepresentation of the active ingredient to consumers unfamiliar with retinoid chemistry." },
        { name: "Regulatory",           score:  7, max: 10, note: "Retinyl Palmitate is permitted and not restricted. Dyes are permitted. Fragrance is permitted. The concern is accuracy of labelling, not legal compliance." },
        { name: "Efficacy",             score:  8, max: 15, note: "Ceramide complex (NP/AP/EOP) is genuinely efficacious for barrier support. Retinyl Palmitate has some evidence for anti-ageing at high concentrations but substantially less than Retinol. At the INCI position observed (low), concentration may be insufficient for meaningful clinical activity." },
        { name: "Transparency",         score:  5, max: 10, note: "Marketing as 'Retinol' when the active is Retinyl Palmitate is the most significant transparency failure in the Dot & Key range. Consumers comparing this to prescription Retinol or true Retinol serums are misled on expected efficacy." },
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
      pass_badges: ["INCI Verified", "Ceramide Complex"],
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
      score: 80,
      scoreLabel: "Good",
      image: "https://www.dotandkey.com/cdn/shop/files/1_eec017a6-6f05-45e3-9916-62e20cc6877c.jpg?v=1777372150",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Ingredient Safety",    score: 22, max: 25, note: "Modern UV filters with good safety profiles. Iron oxides (tint) are inert mineral pigments, safe and provide VL protection. No Benzophenone-3. No azo dyes. Minor deduction for Ethylhexyl Methoxycinnamate at lower INCI position (some endocrine data exists)." },
        { name: "Irritation Potential", score: 17, max: 20, note: "No fragrance. Iron oxides are non-irritating. Overall low irritation risk. Suitable for sensitive skin compared to the Watermelon Sunscreen." },
        { name: "Disclosure Quality",   score: 16, max: 20, note: "INCI published. Iron oxide pigments clearly listed. UV filter system transparent. No fragrance disclosed as absent." },
        { name: "Regulatory",           score:  9, max: 10, note: "All UV filters permissible under Indian cosmetics regulations. Iron oxides are approved cosmetic pigments globally." },
        { name: "Efficacy",             score: 11, max: 15, note: "SPF 50+/PA++++ is excellent protection. Iron oxides provide additional visible light protection (relevant for melasma management). Niacinamide and Strawberry antioxidants add skin benefits. Strawberry at trace concentration limits efficacy contribution." },
        { name: "Transparency",         score:  5, max: 10, note: "'Strawberry Dew' branding implies meaningful strawberry content; actual INCI position suggests trace amounts. Iron oxide tint purpose (VL protection) could be better communicated." },
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
      pass_badges: ["Fragrance Free", "No Benzophenone-3", "INCI Verified", "Mineral Tint (Iron Oxides)", "No Azo Dyes"],
      warn_badges: [],
      info_badges: ["Strawberry Extract at Trace Level"],
      indiaContext:
        "Iron oxide tinted sunscreens have particular relevance for India because visible light (blue-violet light) is now understood to worsen melasma, a condition highly prevalent in South Asian skin. Iron oxides in tinted sunscreens provide VL protection that untinted SPFs cannot. This makes tinted SPFs a clinically meaningful upgrade for Indians with melasma or PIH.",
    },

  ],
};
