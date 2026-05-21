/**
 * Pilgrim brand data
 *
 * Ingredient lists sourced directly from discoverpilgrim.com product pages (verified May 2026).
 * INCI order is descending by concentration (cosmetics labelling law, globally standard).
 * Concentration inferences marked as "position-based" are analytical deductions, not brand claims.
 * Only percentages stated explicitly by the brand are asserted as fact.
 *
 * Rescored 2026-05-20 under 4-pillar framework:
 *   Safety & Toxicity (max 40) | Formulation Quality & Efficacy (max 25)
 *   Ingredient Disclosure & Transparency (max 25) | Ethics & Sustainability (max 10)
 */

import type { Brand, ProductScorecard } from "./types";

const BRAND_SLUG = "pilgrim";
const BRAND_NAME = "Pilgrim";

const products: ProductScorecard[] = [

  /* -------------------------------------------------
     1. 2% Hyaluronic Acid Serum
     Source: discoverpilgrim.com/products/hyaluronic-acid-serum
  ------------------------------------------------- */
  {
    productName: "2% Hyaluronic Acid Serum",
    slug: "2-percent-hyaluronic-acid-serum",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "Rs. 449 - Rs. 699",
    productType: "leave-on",
    concern: "Dehydration, fine lines, dullness, all skin types",
    summary: "A multi-weight hyaluronic acid serum combining low, medium, and high molecular weight HA (Sodium Hyaluronate at position 2, Hydrolyzed Hyaluronic Acid, and Sodium Acetylated Hyaluronate) for layered hydration at the surface and upper dermis. Glycerin and Panthenol provide humectant support. Centella Asiatica Extract and Allantoin add soothing benefit for barrier-compromised skin. No fragrance, no dyes, no parabens. Pilgrim is PETA-certified cruelty-free and not sold in mandatory-testing markets.",
    score: 90,
    scoreLabel: "Excellent",
    image: "https://discoverpilgrim.com/cdn/shop/files/1.3Whitebackgroundcopy.jpg?v=1776846613",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 40, max: 40,
        note: "Every ingredient in this serum is compliant under India (CDSCO), EU Regulation 1223/2009, and US FDA 21 CFR. There is no synthetic fragrance, no parabens, and no UV filters with active regulatory concerns. Sodium Hydroxide appears at the very end of the INCI list, which means it is present only in trace amounts as a pH adjuster. Phenoxyethanol is a standard preservative permitted up to 1% under both EU and Indian regulations. Carbomer is a widely used polymer gel-former with a well-established safety record at cosmetic concentrations.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 23, max: 25,
        note: "Using three forms of hyaluronic acid together is a well-thought-out hydration strategy. High-molecular-weight Sodium Hyaluronate sits at the surface and forms a film that locks in moisture immediately. Low-molecular-weight Hydrolyzed Hyaluronic Acid is small enough to reach the upper dermis, providing deeper hydration. Sodium Acetylated Hyaluronate is a third-generation HA with a lipid modification that gives it superior affinity for skin and helps it stay there longer. Glycerin appears early in the INCI list, meaning it is present at a meaningful hydrating concentration. Panthenol (pro-vitamin B5) helps repair the skin barrier. Centella Asiatica Extract contributes soothing compounds that benefit barrier-compromised skin. The brand does not publish the individual proportions of each HA fraction beyond the total 2% figure.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 19, max: 25,
        note: "The full ingredient list is published on the brand's product page. Pilgrim confirms 2% Hyaluronic Acid, which is a meaningful and well-dosed concentration for hydration. The individual molecular weight fractions of the three HA types are not broken out separately, and the concentrations of supporting ingredients such as Centella Asiatica, Panthenol, and Allantoin are not disclosed. No clinical study data has been published for this specific formula.",
      },
      {
        name: "Ethics & Sustainability",
        score: 8, max: 10,
        note: "Pilgrim is PETA-certified cruelty-free and the formula is vegan. The brand does not sell into markets that require mandatory animal testing. There is no synthetic fragrance and no azo dyes. Carbomer and Hydroxyethylcellulose are synthetic-origin polymers, which means they cannot qualify for natural certifications such as COSMOS. Palm derivative sourcing is not independently verified against standards such as RSPO.",
      },
    ],
    keyActives: [
      { name: "Sodium Hyaluronate (2%)",            function: "High-MW hyaluronic acid salt, surface-level film for immediate plumping and moisture retention" },
      { name: "Hydrolyzed Hyaluronic Acid",          function: "Low-MW fragmented HA, penetrates upper dermis for deeper hydration" },
      { name: "Sodium Acetylated Hyaluronate",       function: "Third-gen lipophilic HA derivative, superior skin affinity and sustained moisture" },
      { name: "Centella Asiatica Extract",           function: "Asiaticoside and madecassoside, barrier repair and anti-inflammatory" },
      { name: "Panthenol",                           function: "Pro-vitamin B5, humectant, barrier restoration and wound-healing support" },
    ],
    ingredients: [
      { name: "Aqua",                                note: "Solvent base",                                                                                                         flag: "ok"   },
      { name: "Sodium Hyaluronate",                  note: "High-MW HA, position 2 confirms dominant active; brand-stated at 2%",                                                 flag: "ok"   },
      { name: "Propanediol",                         note: "Plant-derived humectant and solvent, low sensitisation risk",                                                           flag: "ok"   },
      { name: "Glycerin",                            note: "Humectant, position 4 indicates meaningful hydration support concentration",                                           flag: "ok"   },
      { name: "Hydrolyzed Hyaluronic Acid",          note: "Low-MW HA fragment, penetrates upper dermis for deeper hydration layer",                                              flag: "ok"   },
      { name: "Sodium Acetylated Hyaluronate",       note: "Third-generation HA with lipophilic modification, superior skin affinity and sustained moisture retention",           flag: "ok"   },
      { name: "Aloe Barbadensis Leaf Juice",         note: "Soothing and anti-inflammatory, supports barrier integrity",                                                           flag: "ok"   },
      { name: "Centella Asiatica Extract",           note: "Asiaticoside and madecassoside content, barrier repair and anti-inflammatory",                                        flag: "ok"   },
      { name: "Pentylene Glycol",                    note: "Humectant and mild preservative booster, skin-compatible, low sensitisation risk",                                    flag: "ok"   },
      { name: "Allantoin",                           note: "Skin-soothing and repairing, buffers any irritation from pH-adjusting agents",                                        flag: "ok"   },
      { name: "Panthenol",                           note: "Pro-vitamin B5, barrier restoration and moisture-binding humectant",                                                   flag: "ok"   },
      { name: "Hydroxyethylcellulose",               note: "Natural-derived polymer thickener for texture and application feel",                                                   flag: "ok"   },
      { name: "Carbomer",                            note: "Synthetic polymer gel-former, well-tolerated at cosmetic concentrations",                                              flag: "ok"   },
      { name: "Phenoxyethanol",                      note: "Preservative, position indicates ~0.5-0.8% concentration, within EU/India 1% limit",                                 flag: "info" },
      { name: "Ethylhexylglycerin",                  note: "Preservative booster, very low concern at cosmetic concentrations",                                                    flag: "ok"   },
      { name: "Sodium Hydroxide",                    note: "pH adjuster only, final INCI position confirms trace quantity for pH calibration",                                    flag: "ok"   },
    ],
    pass_badges: ["INCI Verified", "Fragrance-Free", "Paraben-Free", "Cruelty-Free (PETA)", "Sensitive Skin Friendly", "All Skin Types"],
    warn_badges: [],
    info_badges: ["Multi-Weight HA Formula", "India Climate Optimized"],
    indiaContext: "Multi-weight hyaluronic acid is particularly effective in India's variable climate: the high-MW HA surface film prevents transepidermal water loss (TEWL) in dry, air-conditioned environments while Aloe Juice and Centella support barrier recovery after sun exposure common to Fitzpatrick III-V skin tones. Apply to damp skin immediately after cleansing to maximise moisture capture. Layering under a lightweight moisturiser is recommended in low-humidity environments (Delhi winters, high-altitude cities).",
    analyzedAt: "2026-05-20",
  },

  /* -------------------------------------------------
     2. 10% Niacinamide + Kojic Acid Serum
     Source: discoverpilgrim.com/products/niacinamide-kojic-acid-serum
  ------------------------------------------------- */
  {
    productName: "10% Niacinamide + Kojic Acid Serum",
    slug: "10-percent-niacinamide-kojic-acid-serum",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "Rs. 449 - Rs. 699",
    productType: "leave-on",
    concern: "Hyperpigmentation, dark spots, uneven tone, melasma",
    summary: "A dual-brightening serum combining 10% Niacinamide (vitamin B3) with Kojic Acid for a two-mechanism approach to melanin reduction. Niacinamide inhibits melanosome transfer at the keratinocyte junction; Kojic Acid inhibits tyrosinase at the enzyme level. Alpha Arbutin and Sodium Ascorbyl Phosphate (stable vitamin C precursor) provide additional brightening synergy. Sodium Hyaluronate adds hydration. No fragrance, no parabens. PETA-certified cruelty-free.",
    score: 87,
    scoreLabel: "Excellent",
    image: "https://discoverpilgrim.com/cdn/shop/files/1.1_30a00794-6a3d-4b32-ab0c-6ee1392aaa18.jpg?v=1776666674",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 38, max: 40,
        note: "All ingredients are compliant under Indian, EU, and US regulations. Kojic Acid is a tyrosinase inhibitor permitted in face care products in the EU at up to 1% (SCCS 2021 opinion). Alpha Arbutin is the glycosylated form of hydroquinone, but unlike hydroquinone it does not carry the same regulatory restrictions at cosmetic use concentrations. Sodium Ascorbyl Phosphate is a stable vitamin C precursor with a well-established tolerability record. Kojic Acid can cause irritation on reactive or compromised skin, particularly at undisclosed concentrations. The EU SCCS has noted its irritation potential, but Pilgrim does not explicitly advise sensitive-skin users to patch test.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 22, max: 25,
        note: "This formula attacks hyperpigmentation from four different directions, which is a sound approach because it reduces the likelihood that skin will adapt to any single ingredient. Niacinamide (brand-confirmed at 10%) blocks the transfer of melanin from pigment-producing cells into skin cells. Kojic Acid suppresses melanin production at the enzyme level by inhibiting tyrosinase. Alpha Arbutin also inhibits tyrosinase but via a different binding mechanism, providing complementary coverage. Sodium Ascorbyl Phosphate helps reduce melanin that has already formed. Ferulic Acid provides antioxidant support. The concentrations of Kojic Acid and Tranexamic Acid are not published; if either is at a sub-functional level, the multi-mechanism claim would be weaker in practice than it appears on paper.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 19, max: 25,
        note: "The full INCI list is published on the product page, and Niacinamide is confirmed at 10%. Kojic Acid concentration is not disclosed - this matters because the EU caps Kojic Acid in leave-on face products at 1% (SCCS 2021), and knowing the concentration helps consumers gauge both safety and efficacy. Alpha Arbutin, Ferulic Acid, and Tranexamic Acid concentrations are also not disclosed. No third-party clinical study data has been published for this formula.",
      },
      {
        name: "Ethics & Sustainability",
        score: 8, max: 10,
        note: "Pilgrim is PETA-certified cruelty-free and the formula is vegan. The brand does not sell into markets that require mandatory animal testing. There is no synthetic fragrance and no azo dyes. Kojic Acid is produced through fermentation by Aspergillus flavus, giving it a naturally derived origin. Carbomer is a synthetic polymer. Palm derivative sourcing has not been independently verified against RSPO or equivalent standards.",
      },
    ],
    keyActives: [
      { name: "Niacinamide (10%)",                  function: "Inhibits melanosome transfer from melanocytes to keratinocytes, reduces PIH and dark spots, anti-inflammatory" },
      { name: "Kojic Acid",                          function: "Tyrosinase enzyme inhibitor, directly suppresses melanin synthesis at its production step" },
      { name: "Alpha Arbutin",                       function: "Glycosylated hydroquinone precursor, secondary tyrosinase inhibition without hydroquinone regulatory restrictions" },
      { name: "Sodium Ascorbyl Phosphate",           function: "Stable vitamin C phosphate ester, reduces already-formed melanin and provides antioxidant protection" },
      { name: "Ferulic Acid",                        function: "Phenolic antioxidant, stabilises vitamin C and provides independent UV-induced pigmentation protection" },
    ],
    ingredients: [
      { name: "Aqua",                                note: "Solvent base",                                                                                                         flag: "ok"   },
      { name: "Niacinamide",                         note: "Vitamin B3, position 2 confirms dominant concentration; brand-confirmed at 10%",                                      flag: "ok"   },
      { name: "Propanediol",                         note: "Plant-derived humectant and solvent",                                                                                   flag: "ok"   },
      { name: "Glycerin",                            note: "Humectant, functional hydration support",                                                                               flag: "ok"   },
      { name: "Kojic Acid",                          note: "Tyrosinase inhibitor, EU-permitted at up to 1% in face care; position indicates meaningful brightening concentration", flag: "info" },
      { name: "Pentylene Glycol",                    note: "Humectant and mild preservative booster",                                                                              flag: "ok"   },
      { name: "Sodium Ascorbyl Phosphate",           note: "Stable vitamin C phosphate ester; does not require anhydrous packaging unlike L-Ascorbic Acid",                      flag: "ok"   },
      { name: "Alpha Arbutin",                       note: "Glycosylated hydroquinone, tyrosinase inhibition without hydroquinone restrictions at cosmetic concentrations",       flag: "ok"   },
      { name: "Tranexamic Acid",                     note: "Inhibits UV-induced plasminogen activator, anti-melasma activity at functional positions",                            flag: "ok"   },
      { name: "Allantoin",                           note: "Soothing and skin-repairing, buffers potential irritation from Kojic Acid",                                           flag: "ok"   },
      { name: "Ferulic Acid",                        note: "Antioxidant, stabilises vitamin C derivatives and provides independent pigmentation protection",                      flag: "ok"   },
      { name: "Sodium Hyaluronate",                  note: "HA salt for hydration, functional humectant support",                                                                  flag: "ok"   },
      { name: "Hydroxyethylcellulose",               note: "Natural-derived polymer thickener",                                                                                    flag: "ok"   },
      { name: "Carbomer",                            note: "Synthetic polymer gel-former, well-tolerated at cosmetic concentrations",                                              flag: "ok"   },
      { name: "Sodium Hydroxide",                    note: "pH adjuster, trace quantity for pH calibration",                                                                       flag: "ok"   },
      { name: "Phenoxyethanol",                      note: "Preservative within EU/India 1% limit",                                                                               flag: "info" },
      { name: "Ethylhexylglycerin",                  note: "Preservative booster, very low concern",                                                                              flag: "ok"   },
    ],
    pass_badges: ["INCI Verified", "Fragrance-Free", "Paraben-Free", "Cruelty-Free (PETA)", "Oily / Acne-Prone Skin", "Combination Skin"],
    warn_badges: [],
    info_badges: ["Multi-Mechanism Brightening", "Kojic Acid - Patch Test Recommended for Sensitive Skin"],
    indiaContext: "Hyperpigmentation and post-inflammatory hyperpigmentation (PIH) are the most common skin concerns across Fitzpatrick III-V skin tones in India. This serum's four-mechanism approach - covering melanosome transfer inhibition (niacinamide), tyrosinase inhibition (Kojic Acid + Alpha Arbutin), and melanin reduction (SAP) - is better suited to persistent PIH than single-active brighteners. Particularly effective for sun-induced dark spots in India's high UV index environment. Use SPF daily to prevent re-darkening. If you have sensitive or disrupted skin, patch test for 48 hours before full application - Kojic Acid can cause temporary flushing on reactive skin.",
    analyzedAt: "2026-05-20",
  },

  /* -------------------------------------------------
     3. Salicylic Acid 2% + Niacinamide 3% Oil Control Serum
     Source: discoverpilgrim.com/products/salicylic-acid-niacinamide-serum
  ------------------------------------------------- */
  {
    productName: "Salicylic Acid 2% + Niacinamide 3% Oil Control Serum",
    slug: "salicylic-acid-2-niacinamide-3-oil-control-serum",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "Rs. 449 - Rs. 699",
    productType: "leave-on",
    concern: "Acne, oiliness, clogged pores, blackheads",
    summary: "An oil-control serum pairing 2% Salicylic Acid (a BHA that is lipid-soluble, penetrates sebaceous follicles, and exfoliates inside pore walls) with 3% Niacinamide for sebum regulation and anti-inflammatory support. Tea Tree Leaf Oil is included as an antimicrobial active. Key concern: Tea Tree Oil in a leave-on serum at an undisclosed concentration introduces sensitisation risk, particularly for reactive or eczema-prone skin. The EU SCCS recommends caution for leave-on use. Zinc PCA reinforces sebum regulation. Fragrance-free base reduces inflammatory load.",
    score: 73,
    scoreLabel: "Good",
    image: "https://discoverpilgrim.com/cdn/shop/products/Salicylic-Acid-_-Niacinamide-Oil-Control-Serum.jpg?v=1683283948",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 34, max: 40,
        note: "There is no synthetic fragrance, no banned UV filters, and no parabens. Salicylic Acid at 2% is the EU maximum permitted for leave-on cosmetics (Annex III), requiring the formula to be carefully pH-calibrated to avoid over-exfoliation. Tea Tree Leaf Oil (Melaleuca Alternifolia) is the ingredient requiring most attention here: a 2015 SCCS opinion identified a sensitisation risk from oxidised terpene byproducts that form when the oil is exposed to air. EU guidance recommends either rinse-off use or strict concentration limits for leave-on formats. Pilgrim does not disclose the Tea Tree Oil concentration, which makes it impossible to assess this risk independently.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 21, max: 25,
        note: "Salicylic Acid at 2% is the globally validated concentration for dissolving comedones and exfoliating inside pore walls, making it the right dose for an oil-control serum. Niacinamide at 3% adds anti-inflammatory benefit and mild sebum regulation, though the strongest evidence for sebum control sits in the 5-10% range. Zinc PCA is a well-evidenced antimicrobial and sebum-regulating zinc compound. Tea Tree Oil brings an antimicrobial dimension, but without a disclosed concentration it is not possible to confirm whether it sits within a safe and effective range for leave-on use. Centella Asiatica Extract supports barrier integrity in the aftermath of BHA exfoliation.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 18, max: 25,
        note: "The full INCI list is published on the product page. Salicylic Acid is confirmed at 2% and Niacinamide at 3%. Tea Tree Oil concentration is not disclosed - this is a meaningful gap because the sensitisation risk from oxidised terpenes in a leave-on format is concentration-dependent; consumers with reactive skin cannot assess their personal risk without this information. Zinc PCA and Centella Asiatica concentrations are also not disclosed. No clinical study data has been published for this formula.",
      },
      {
        name: "Ethics & Sustainability",
        score: 7, max: 10,
        note: "Pilgrim is PETA-certified cruelty-free and the formula is vegan. The brand does not sell into markets that require mandatory animal testing. There is no synthetic fragrance and no azo dyes. Tea Tree Oil is naturally derived but oxidises over time if packaging is not airtight, forming the terpene compounds responsible for sensitisation. Palm derivative sourcing has not been independently verified against RSPO or equivalent standards.",
      },
    ],
    keyActives: [
      { name: "Salicylic Acid (2%)",                function: "Beta-hydroxy acid, lipid-soluble, penetrates sebaceous follicles to dissolve comedones and exfoliate inside pore walls" },
      { name: "Niacinamide (3%)",                   function: "Vitamin B3, anti-inflammatory, mild sebum regulation, reduces redness from active lesions" },
      { name: "Tea Tree Leaf Oil",                   function: "Antimicrobial terpene oil (Melaleuca Alternifolia), active against Cutibacterium acnes; sensitisation risk in leave-on at undisclosed concentration" },
      { name: "Zinc PCA",                            function: "Zinc pyrrolidone carboxylate, sebum-regulating and antimicrobial" },
      { name: "Centella Asiatica Extract",           function: "Barrier repair and anti-inflammatory, supports post-exfoliation skin recovery" },
    ],
    ingredients: [
      { name: "Aqua",                                note: "Solvent base",                                                                                                         flag: "ok"   },
      { name: "Salicylic Acid",                      note: "2% BHA, EU Annex III maximum for leave-on cosmetics; pH-dependent efficacy (optimal pH 3.0-4.0)",                    flag: "info" },
      { name: "Niacinamide",                         note: "Brand-confirmed at 3%; anti-inflammatory and mild sebum regulation; below the 5-10% range for strongest evidence",    flag: "ok"   },
      { name: "Propanediol",                         note: "Plant-derived humectant and solvent",                                                                                   flag: "ok"   },
      { name: "Glycerin",                            note: "Humectant, functional hydration support",                                                                               flag: "ok"   },
      { name: "Tea Tree Leaf Oil",                   note: "Melaleuca Alternifolia, antimicrobial in leave-on; SCCS flagged sensitisation from oxidised terpenes; concentration undisclosed", flag: "warn" },
      { name: "Zinc PCA",                            note: "Antimicrobial zinc salt, sebum regulation at functional INCI position",                                                flag: "ok"   },
      { name: "Centella Asiatica Extract",           note: "Barrier repair and soothing, supports post-exfoliation skin integrity",                                               flag: "ok"   },
      { name: "Panthenol",                           note: "Pro-vitamin B5, barrier restoration",                                                                                  flag: "ok"   },
      { name: "Allantoin",                           note: "Soothing and repairing, buffers BHA-related irritation",                                                               flag: "ok"   },
      { name: "Sodium Hyaluronate",                  note: "HA salt for hydration",                                                                                                flag: "ok"   },
      { name: "Hydroxyethylcellulose",               note: "Natural-derived polymer thickener",                                                                                    flag: "ok"   },
      { name: "Carbomer",                            note: "Synthetic polymer gel-former, well-tolerated at cosmetic concentrations",                                              flag: "ok"   },
      { name: "Sodium Hydroxide",                    note: "pH adjuster critical for Salicylic Acid efficacy; final INCI position confirms trace quantity",                       flag: "ok"   },
      { name: "Phenoxyethanol",                      note: "Preservative within EU/India 1% limit",                                                                               flag: "info" },
      { name: "Ethylhexylglycerin",                  note: "Preservative booster, very low concern",                                                                              flag: "ok"   },
    ],
    pass_badges: ["INCI Verified", "Fragrance-Free", "Paraben-Free", "Cruelty-Free (PETA)", "Oily / Acne-Prone Skin"],
    warn_badges: ["Tea Tree Oil (Leave-On, Concentration Undisclosed)"],
    info_badges: ["Salicylic Acid at EU Maximum (2%)", "Not Recommended for Sensitive Skin"],
    indiaContext: "Salicylic Acid is the first-line topical for acne and blackheads in high-humidity Indian climates where sebum overproduction is common. The 2% concentration is the regulatory maximum for leave-on use. Users with sensitive or eczema-prone skin should patch test for 72 hours before full application given Tea Tree Oil's sensitisation profile. Start with every-other-day use, building to daily if well tolerated. Do not layer with other BHA or AHA products on the same application. Always apply SPF the following morning, as BHA increases photosensitivity.",
    analyzedAt: "2026-05-20",
  },

  /* -------------------------------------------------
     4. 15% Vitamin C (EAA) Serum
     Source: discoverpilgrim.com/products/vitamin-c-serum
  ------------------------------------------------- */
  {
    productName: "15% Vitamin C (EAA) Serum",
    slug: "15-percent-vitamin-c-eaa-serum",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "Rs. 499 - Rs. 799",
    productType: "leave-on",
    concern: "Dullness, hyperpigmentation, antioxidant protection, brightening",
    summary: "A 15% Ethyl Ascorbic Acid (3-O-Ethyl Ascorbic Acid) serum using a stable, anhydrous-friendly vitamin C derivative rather than pure L-Ascorbic Acid. EAA converts to ascorbic acid after skin absorption and does not require the low pH that makes L-Ascorbic Acid formulas unstable and irritating. Ferulic Acid and Tocopherol provide antioxidant stabilisation. Key concern: Citrus Aurantium Bergamia (Bergamot) and Citrus Limon Peel Oil are included - both contain furanocoumarins (notably bergapten) that are phototoxic on UV-exposed skin. Brand does not explicitly flag sun exposure caution for a brightening serum marketed for daytime use.",
    score: 68,
    scoreLabel: "Fair",
    image: "https://discoverpilgrim.com/cdn/shop/files/1.2_13f34e78-2e87-4f0e-9f34-b1c8f3c0818e.jpg?v=1762944223",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 28, max: 40,
        note: "The primary safety concern with this serum is the inclusion of Citrus Aurantium Bergamia Fruit Oil (Bergamot) and Citrus Limon Peel Oil. Bergamot oil contains bergapten, a furanocoumarin that is phototoxic when skin is subsequently exposed to UV light - it can cause burns, blistering, and lasting hyperpigmentation. The EU limits bergapten to 0.0015% in leave-on products used on sun-exposed skin (Annex III). A bergapten-free (FCF) version of Bergamot oil exists, but Pilgrim does not state whether they use it. Lemon Peel Oil carries similar furanocoumarin content, compounding the risk. Neither the sun-avoidance guidance nor the FCF status is communicated on the product page.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 21, max: 25,
        note: "Ethyl Ascorbic Acid (EAA) at 15% is a good choice for a stable vitamin C serum. Unlike L-Ascorbic Acid, it does not require low-pH or anhydrous packaging to remain active - it converts to ascorbic acid after skin absorption. Ferulic Acid enhances antioxidant activity and helps stabilise EAA. Tocopherol (vitamin E) adds further free-radical protection. Sodium Hyaluronate and Panthenol provide hydration support. Niacinamide contributes additional brightening. The formulation concern is the citrus oils: furanocoumarins in Bergamot and Lemon Peel Oil can trigger pigmentation under UV exposure, which directly works against the serum's brightening purpose.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 19, max: 25,
        note: "The full INCI list is published on the product page. Ethyl Ascorbic Acid is confirmed at 15%. The brand does not state whether Bergamot Oil is in its bergapten-free (FCF) form - this is a meaningful gap, because without that confirmation consumers cannot know whether the oil has been processed to remove the phototoxic furanocoumarin. No clinical study data has been published for this formula. Ferulic Acid and Tocopherol concentrations are not disclosed.",
      },
      {
        name: "Ethics & Sustainability",
        score: 7, max: 10,
        note: "Pilgrim is PETA-certified cruelty-free and the formula is vegan. The brand does not sell into markets that require mandatory animal testing. The citrus essential oils are natural-origin but they introduce the phototoxicity concern described above - natural origin does not equal safe in every context. No synthetic fragrance compounds are added beyond the citrus oils themselves. Palm derivative sourcing has not been independently verified against RSPO or equivalent standards.",
      },
    ],
    keyActives: [
      { name: "3-O-Ethyl Ascorbic Acid (15%)",      function: "Stable vitamin C ether, converts to ascorbic acid post-absorption; inhibits tyrosinase, brightens and antioxidant protection without pH instability of L-Ascorbic Acid" },
      { name: "Ferulic Acid",                        function: "Phenolic antioxidant, stabilises vitamin C and provides independent UV-induced pigmentation protection" },
      { name: "Tocopherol",                          function: "Vitamin E, lipid-soluble antioxidant synergistic with vitamin C" },
      { name: "Citrus Aurantium Bergamia Fruit Oil", function: "Bergamot essential oil, fragrance and antioxidant; contains furanocoumarins (bergapten) that are phototoxic on UV-exposed skin unless bergapten-free (FCF)" },
    ],
    ingredients: [
      { name: "Aqua",                                note: "Solvent base",                                                                                                         flag: "ok"   },
      { name: "3-O-Ethyl Ascorbic Acid",             note: "Ethyl Ascorbic Acid, brand-confirmed at 15%; stable vitamin C derivative, converts to ascorbic acid post-absorption", flag: "ok"   },
      { name: "Propanediol",                         note: "Plant-derived humectant and solvent",                                                                                   flag: "ok"   },
      { name: "Glycerin",                            note: "Humectant",                                                                                                             flag: "ok"   },
      { name: "Niacinamide",                         note: "Brightening synergy with vitamin C; note: Niacinamide + L-Ascorbic Acid interaction (niacinamine flush) is not applicable with EAA form", flag: "ok" },
      { name: "Ferulic Acid",                        note: "Antioxidant, stabilises EAA and provides independent photoprotection signalling",                                     flag: "ok"   },
      { name: "Tocopherol",                          note: "Vitamin E, synergistic antioxidant, lipid-phase free radical quencher",                                               flag: "ok"   },
      { name: "Sodium Hyaluronate",                  note: "HA salt for hydration",                                                                                                flag: "ok"   },
      { name: "Citrus Aurantium Bergamia Fruit Oil", note: "Bergamot oil: contains bergapten (furanocoumarin), phototoxic on UV-exposed skin; EU restricts bergapten to 0.0015% in leave-on sun-exposed products; brand does not confirm FCF (bergapten-free) variant", flag: "warn" },
      { name: "Citrus Limon Peel Oil",               note: "Lemon peel oil: contains furanocoumarins including limonene and phototoxic compounds; sensitisation and phototoxicity risk in leave-on products without UV avoidance", flag: "warn" },
      { name: "Panthenol",                           note: "Pro-vitamin B5, barrier restoration and humectant",                                                                    flag: "ok"   },
      { name: "Allantoin",                           note: "Soothing and repairing",                                                                                               flag: "ok"   },
      { name: "Hydroxyethylcellulose",               note: "Natural-derived polymer thickener",                                                                                    flag: "ok"   },
      { name: "Citric Acid",                         note: "pH adjuster and mild AHA at final INCI position; used for formula pH calibration, not as a functional exfoliant",    flag: "ok"   },
      { name: "Phenoxyethanol",                      note: "Preservative within EU/India 1% limit",                                                                               flag: "info" },
      { name: "Ethylhexylglycerin",                  note: "Preservative booster, very low concern",                                                                              flag: "ok"   },
    ],
    pass_badges: ["INCI Verified", "Paraben-Free", "Cruelty-Free (PETA)"],
    warn_badges: ["Phototoxic Citrus Oils (FCF Status Unknown)"],
    info_badges: ["Stable Vitamin C (EAA)", "Apply at Night or Use SPF 50+ After Application"],
    indiaContext: "Vitamin C is among the most in-demand serums in India's brightening market, but formulation quality varies enormously. EAA is a better choice for Indian consumers than L-Ascorbic Acid serums because it is stable at higher pH, does not oxidise as rapidly in India's heat and humidity, and does not require the acidic pH that causes stinging on reactive skin. Critical note: apply this serum at night or indoors only. The Bergamot and Lemon Peel Oils introduce phototoxicity risk that significantly counteracts the brightening intent in India's high UV environment. If you use this product, apply SPF 50 every morning without exception.",
    analyzedAt: "2026-05-20",
  },

  /* -------------------------------------------------
     5. Red Vine Anti-Ageing Serum
     Source: discoverpilgrim.com/products/red-vine-anti-ageing-serum
  ------------------------------------------------- */
  {
    productName: "Red Vine Anti-Ageing Serum",
    slug: "red-vine-anti-ageing-serum",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "Rs. 499 - Rs. 799",
    productType: "leave-on",
    concern: "Anti-ageing, fine lines, wrinkles, dullness",
    summary: "An anti-ageing serum built around Vitis Vinifera (Grape) Seed Extract and Resveratrol (a polyphenol from grape skin) as the hero antioxidants, combined with Niacinamide for barrier support and Retinyl Palmitate as a mild retinoid. Key concern: CI 16035 (Allura Red AC / Red 40) is an azo dye with a sensitisation profile. In a leave-on anti-ageing serum, a cosmetic dye adds no functional benefit and introduces unnecessary allergen exposure, particularly for reactive skin. The red colour is purely aesthetic.",
    score: 74,
    scoreLabel: "Good",
    image: "https://discoverpilgrim.com/cdn/shop/files/1.5Whitebackground_carton.jpg?v=1774866794",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 36, max: 40,
        note: "There is no synthetic fragrance in this serum. CI 16035 (Allura Red AC / Red 40) is an azo dye approved for cosmetic use in the EU, but it is a known contact allergen for some individuals. In a leave-on anti-ageing serum it serves only as a colourant with no skin benefit - its inclusion increases sensitisation risk without adding anything useful. Retinyl Palmitate is a mild retinoid ester that carries a much lower irritation risk than retinol, but it is also considerably less effective because it must undergo two enzymatic conversions before reaching its active retinoic acid form. There is also a recognised concern about Retinyl Palmitate generating reactive oxygen species when skin is exposed to UV light, which Pilgrim does not address in product communications.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 19, max: 25,
        note: "Resveratrol is a polyphenol with in-vitro evidence for antioxidant activity and anti-ageing signalling via the SIRT1 pathway. Vitis Vinifera Seed Extract provides proanthocyanidin antioxidant support from grape seeds. Niacinamide contributes barrier repair and anti-inflammatory benefit at a supporting concentration. Retinyl Palmitate is the weakest form of vitamin A used in skincare - it must be converted by enzymes in the skin through two intermediate steps before reaching the active retinoic acid form, which makes it substantially less effective than retinol at an equivalent position in the formula. For a product marketed as an anti-ageing serum, this is a meaningful efficacy gap. CI 16035 adds colour and nothing else.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 19, max: 25,
        note: "The full INCI list is published on the product page. Active concentrations for Resveratrol, Grape Seed Extract, Niacinamide, and Retinyl Palmitate are not disclosed. CI 16035 is not identified on the product page as a cosmetic dye serving no skin function. The marketing does not distinguish between Retinyl Palmitate (a retinoid ester) and Retinol - these are not the same ingredient and do not deliver the same results, but a consumer reading the product description would not know that. No clinical study data has been published for this formula.",
      },
      {
        name: "Ethics & Sustainability",
        score: 7, max: 10,
        note: "Pilgrim is PETA-certified cruelty-free and the formula is vegan. The brand does not sell into markets that require mandatory animal testing. There is no synthetic fragrance. CI 16035 is a synthetic azo dye with no natural origin. Grape-derived ingredients (Vitis Vinifera Seed Extract, Resveratrol) raise the natural origin proportion of the formula meaningfully. Palm derivative sourcing has not been independently verified against RSPO or equivalent standards.",
      },
    ],
    keyActives: [
      { name: "Vitis Vinifera (Grape) Seed Extract", function: "Proanthocyanidin polyphenols, antioxidant and free radical quenching, mild collagen support" },
      { name: "Resveratrol",                          function: "Stilbenoid polyphenol from grape skin, SIRT1 pathway antioxidant, in-vitro anti-ageing signalling" },
      { name: "Niacinamide",                          function: "Vitamin B3, barrier support, anti-inflammatory, mild brightening at supporting concentration" },
      { name: "Retinyl Palmitate",                    function: "Mild retinoid ester, requires two enzymatic conversions to reach active retinoic acid; low irritation risk but significantly less potent than retinol" },
    ],
    ingredients: [
      { name: "Aqua",                                note: "Solvent base",                                                                                                         flag: "ok"   },
      { name: "Propanediol",                         note: "Plant-derived humectant and solvent",                                                                                   flag: "ok"   },
      { name: "Glycerin",                            note: "Humectant",                                                                                                             flag: "ok"   },
      { name: "Vitis Vinifera (Grape) Seed Extract", note: "Proanthocyanidin antioxidant, free radical quenching, mild collagen support",                                         flag: "ok"   },
      { name: "Resveratrol",                         note: "Polyphenol from grape skin; SIRT1 pathway antioxidant; position indicates functional but not dominant concentration", flag: "ok"   },
      { name: "Niacinamide",                         note: "Vitamin B3, barrier and anti-inflammatory support at secondary position",                                              flag: "ok"   },
      { name: "Sodium Hyaluronate",                  note: "HA salt for hydration",                                                                                                flag: "ok"   },
      { name: "Retinyl Palmitate",                   note: "Mild retinoid ester; requires two enzymatic conversions to reach active retinoic acid; significantly less potent than retinol at cosmetic positions", flag: "info" },
      { name: "Tocopherol",                          note: "Vitamin E, lipid-phase antioxidant synergistic with resveratrol",                                                     flag: "ok"   },
      { name: "Panthenol",                           note: "Pro-vitamin B5, barrier restoration and humectant",                                                                    flag: "ok"   },
      { name: "Allantoin",                           note: "Soothing and skin-repairing",                                                                                          flag: "ok"   },
      { name: "CI 16035",                            note: "Allura Red AC (Red 40), azo dye; no functional role in a leave-on serum; contact allergen in sensitised individuals; purely aesthetic colourant", flag: "warn" },
      { name: "Hydroxyethylcellulose",               note: "Natural-derived polymer thickener",                                                                                    flag: "ok"   },
      { name: "Carbomer",                            note: "Synthetic polymer gel-former",                                                                                         flag: "ok"   },
      { name: "Sodium Hydroxide",                    note: "pH adjuster, trace quantity",                                                                                          flag: "ok"   },
      { name: "Phenoxyethanol",                      note: "Preservative within EU/India 1% limit",                                                                               flag: "info" },
      { name: "Ethylhexylglycerin",                  note: "Preservative booster, very low concern",                                                                              flag: "ok"   },
    ],
    pass_badges: ["INCI Verified", "Fragrance-Free", "Paraben-Free", "Cruelty-Free (PETA)", "Combination Skin"],
    warn_badges: ["Azo Dye (CI 16035) - No Functional Benefit"],
    info_badges: ["Retinyl Palmitate is Milder Than Retinol", "Polyphenol Antioxidant Formula"],
    indiaContext: "Resveratrol and grape polyphenols are a credible antioxidant platform for anti-ageing, particularly relevant in India where chronic UV exposure accelerates extrinsic ageing across Fitzpatrick III-V tones. The formula's Retinyl Palmitate is too mild to deliver meaningful retinoid anti-ageing benefit but avoids the retinol irritation and pregnancy contraindication. If primary concern is anti-ageing, consider a product with Retinol or Bakuchiol for stronger retinoid-class activity. The synthetic red dye serves no skin benefit - if you have reactive or sensitive skin, this product's azo dye may be an unnecessary irritation risk.",
    analyzedAt: "2026-05-20",
  },

  /* -------------------------------------------------
     6. Red Vine + Retinol Night Gel Creme
     Source: discoverpilgrim.com/products/retinol-night-cream
  ------------------------------------------------- */
  {
    productName: "Red Vine + Retinol Night Gel Creme",
    slug: "red-vine-retinol-night-gel-creme",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "Rs. 599 - Rs. 999",
    productType: "leave-on",
    concern: "Anti-ageing, fine lines, overnight renewal",
    summary: "A retinol-positioning night cream combining Vitis Vinifera extracts with Retinol as the active retinoid. Significant concerns: Parfum (synthetic fragrance compound mixture) is present in a leave-on retinol product - retinol already increases skin sensitivity and inflammation risk, and fragrance allergens compound that over 8+ hours of overnight contact. Additionally, two azo dyes (CI 16035 and CI 45380) are present as cosmetic colourants with no functional benefit, adding unnecessary allergen load to a leave-on night treatment. Retinol concentration is undisclosed. The combination of Parfum, dual azo dyes, and undisclosed-concentration retinol in an overnight leave-on format represents a significant formulation concern.",
    score: 46,
    scoreLabel: "Concern",
    image: "https://discoverpilgrim.com/cdn/shop/files/1_4e843425-9b60-45c3-aacf-04349e6c1653.jpg?v=1769668721",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 22, max: 40,
        note: "Parfum (synthetic fragrance blend) is present in a leave-on retinol product that sits on skin for 8 or more hours overnight. Retinol increases skin permeability, which means fragrance allergens penetrate more deeply and remain in contact with skin longer than in a rinse-off or fragrance-free product. Parfum is a single entry that can contain hundreds of individual compounds; EU Regulation 1223/2009 Annex III requires that individual fragrance allergens present above 0.001% in leave-on products be named separately. Listing only 'Parfum' does not meet that disclosure standard. CI 16035 (Allura Red azo dye) and CI 45380 (a fluorescein derivative dye) are both contact allergens with no therapeutic function in a retinol night treatment. The retinol concentration is not disclosed; below about 0.025%, retinol is generally considered sub-functional, which would make the retinoid claim difficult to substantiate. Dimethicone and Cetearyl Alcohol are well-tolerated emollients with no safety concerns.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 13, max: 25,
        note: "Retinol is the most robustly evidenced retinoid for stimulating collagen, reducing fine lines, and accelerating cell turnover. The gel-creme base with Cetearyl Alcohol, Cetearyl Glucoside, and Dimethicone provides suitable emollient and occlusive support for overnight use. The undisclosed retinol concentration is a significant gap: without knowing the dose, there is no way to assess whether the retinoid is present at a level that can deliver the anti-ageing results the product claims. Parfum introduces an inflammatory risk that compounds over the full overnight contact period, working against the skin renewal retinol is intended to support. The two azo dyes add no formulation benefit.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 9, max: 25,
        note: "The full INCI list is published on the product page. Retinol concentration is not disclosed - this is the most important number in this product, and without it consumers cannot judge whether the retinoid is present at a dose that does anything meaningful. Parfum is listed as a single entry without a breakdown of individual allergen components, which does not meet the EU Regulation 1223/2009 Annex III requirement for named allergen disclosure in leave-on products. The two azo dyes are present with no explanation of their role in product marketing. The product does not carry a pregnancy warning, despite containing a retinoid ingredient - retinoids are universally contraindicated during pregnancy. No clinical study data has been published for this formula.",
      },
      {
        name: "Ethics & Sustainability",
        score: 5, max: 10,
        note: "Pilgrim is PETA-certified cruelty-free. The brand does not sell into markets that require mandatory animal testing. Parfum and two synthetic azo dyes all appear on the COSMOS prohibited ingredients list, meaning this product would not qualify for any natural cosmetics certification. Dimethicone (silicone) is similarly COSMOS-prohibited. The formula has not been verified as vegan due to ingredient complexity.",
      },
    ],
    keyActives: [
      { name: "Retinol",                             function: "Vitamin A alcohol, stimulates collagen synthesis, accelerates cell turnover, reduces fine lines and wrinkles; concentration undisclosed" },
      { name: "Vitis Vinifera (Grape) Seed Extract", function: "Proanthocyanidin antioxidant, free radical quenching, collagen-protective" },
      { name: "Resveratrol",                         function: "Polyphenol antioxidant from grape, SIRT1 pathway signalling" },
    ],
    ingredients: [
      { name: "Aqua",                                note: "Solvent base",                                                                                                         flag: "ok"   },
      { name: "Glycerin",                            note: "Humectant",                                                                                                             flag: "ok"   },
      { name: "Propanediol",                         note: "Plant-derived humectant and solvent",                                                                                   flag: "ok"   },
      { name: "Vitis Vinifera (Grape) Seed Extract", note: "Proanthocyanidin antioxidant",                                                                                        flag: "ok"   },
      { name: "Retinol",                             note: "Vitamin A alcohol, effective retinoid; concentration undisclosed by brand - sub-0.025% concentration would be sub-functional", flag: "info" },
      { name: "Resveratrol",                         note: "Polyphenol from grape skin, antioxidant",                                                                              flag: "ok"   },
      { name: "Niacinamide",                         note: "Vitamin B3, barrier support and anti-inflammatory; helps offset retinol-induced sensitivity",                         flag: "ok"   },
      { name: "Sodium Hyaluronate",                  note: "HA salt for overnight hydration",                                                                                      flag: "ok"   },
      { name: "Butylene Glycol",                     note: "Humectant and solvent, low concern",                                                                                   flag: "ok"   },
      { name: "Cetearyl Alcohol",                    note: "Fatty alcohol emollient, emulsifier component; appropriate for night cream vehicle",                                  flag: "ok"   },
      { name: "Cetearyl Glucoside",                  note: "Sugar-derived emulsifier, well-tolerated",                                                                             flag: "ok"   },
      { name: "Dimethicone",                         note: "Silicone occlusive, supports overnight moisture retention; COSMOS-prohibited but not a safety concern",               flag: "ok"   },
      { name: "Parfum",                              note: "Synthetic fragrance mixture in a leave-on retinol night product; retinol increases skin permeability, amplifying allergen exposure over 8+ hour contact; EU Annex III individual allergen disclosure requirement not met by a single 'Parfum' entry", flag: "warn" },
      { name: "CI 16035",                            note: "Allura Red AC azo dye, no functional benefit in a leave-on product, contact allergen in sensitised individuals",      flag: "warn" },
      { name: "CI 45380",                            note: "Fluorescein derivative dye, no functional benefit in leave-on, additional allergen load compounding retinol sensitisation risk", flag: "warn" },
      { name: "Phenoxyethanol",                      note: "Preservative within EU/India 1% limit",                                                                               flag: "info" },
      { name: "Ethylhexylglycerin",                  note: "Preservative booster, very low concern",                                                                              flag: "ok"   },
    ],
    pass_badges: ["Paraben-Free", "Cruelty-Free (PETA)"],
    warn_badges: ["Parfum in Leave-On Retinol Product", "Dual Azo Dyes (No Functional Benefit)", "Retinol % Undisclosed"],
    info_badges: ["Avoid During Pregnancy", "Not Recommended for Sensitive Skin"],
    indiaContext: "Retinol is the gold standard topical for anti-ageing across all skin tones and is particularly valuable for Fitzpatrick III-V tones in India where photodamage, melasma, and PIH co-exist. However, retinol already increases skin sensitivity - adding synthetic fragrance and two cosmetic dyes to a night treatment that remains on skin for 8+ hours creates a cumulative sensitisation environment that works against the product's own goals. Indian consumers seeking a reliable retinol night product should look for fragrance-free, dye-free formulas with disclosed retinol concentrations. Not recommended during pregnancy or breastfeeding. Avoid if you have sensitive, eczema-prone, or rosacea-affected skin.",
    analyzedAt: "2026-05-20",
  },

  /* -------------------------------------------------
     7. 25% AHA + 2% BHA + 5% PHA Peeling Solution
     Source: discoverpilgrim.com/products/aha-bha-peeling-solution
  ------------------------------------------------- */
  {
    productName: "25% AHA + 2% BHA + 5% PHA Peeling Solution",
    slug: "25-aha-2-bha-5-pha-peeling-solution",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "Rs. 549 - Rs. 849",
    productType: "treatment",
    concern: "Exfoliation, texture, dullness, pores, mild acne, hyperpigmentation",
    summary: "A multi-acid peel combining 25% AHA (Glycolic Acid and Lactic Acid), 2% BHA (Salicylic Acid), and 5% PHA (Gluconolactone) for layered chemical exfoliation. The AHA component at 25% is a professional-grade concentration requiring careful pH calibration and short contact time (10-15 minutes, not leave-on). Gluconolactone (PHA) has a larger molecular weight than AHAs and acts more gently at the surface, soothing post-peel. Key concern: pH of the formula is not publicly disclosed by Pilgrim. At 25% AHA, pH critically determines whether this is a cosmetic exfoliant or approaches a clinical peel concentration - pH below 3.0 at this AHA level could cause significant barrier disruption.",
    score: 68,
    scoreLabel: "Fair",
    image: "https://discoverpilgrim.com/cdn/shop/files/1_e6841aa2-67fa-4993-aa5a-1eb2e69234bf.jpg?v=1770799215",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 33, max: 40,
        note: "There is no synthetic fragrance, no endocrine-disrupting UV filters, and no restricted preservatives. This product is a rinse-off treatment, not a leave-on. Glycolic Acid at 25% is a high concentration: the EU permits up to 10% AHA in leave-on cosmetics and up to 30% in professional-grade rinse-off products with appropriate safety controls. The critical number that determines whether this product behaves as a cosmetic exfoliant or approaches a clinical peel is the pH - and Pilgrim does not publish it. At 25% AHA, a very low pH (below 3.0) can cause significant barrier disruption. Salicylic Acid at 2% is compliant for rinse-off treatment use. Gluconolactone at 5% is gentle and well-tolerated. Niacinamide and Panthenol help moderate post-peel inflammation. Without a disclosed pH and recommended contact time, users have limited information to calibrate safe use.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 20, max: 25,
        note: "The combination of three acid types is well-designed. Glycolic Acid has the smallest molecule of all AHAs and penetrates deepest, stimulating collagen and renewing the surface. Lactic Acid is larger and gentler, with the added benefit of drawing moisture into the skin alongside exfoliation. Salicylic Acid is oil-soluble, so it works inside the pore rather than just at the surface. Gluconolactone is the mildest of the group - a polyhydroxy acid that exfoliates at the surface while also providing soothing and humectant properties. Niacinamide reduces post-peel redness. Aloe and Panthenol support barrier recovery. The formula pH is not disclosed, which is a meaningful gap at this AHA concentration - pH is what determines how aggressively the acids behave on skin. The individual proportions of Glycolic and Lactic Acid within the 25% AHA total are also not specified.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 15, max: 25,
        note: "The full INCI list is published on the product page. AHA (25%), BHA (2%), and PHA (5%) percentages are confirmed by the brand. However, the formula pH is not disclosed - this is the single most important safety parameter for any product with AHA above 10%, and its absence makes independent risk assessment impossible for consumers. The individual split between Glycolic and Lactic Acid within the 25% AHA total is not specified. A recommended maximum contact time is not stated on the product page. No clinical study data has been published for this formula.",
      },
      {
        name: "Ethics & Sustainability",
        score: 6, max: 10,
        note: "Pilgrim is PETA-certified cruelty-free. The brand does not sell into markets that require mandatory animal testing. There is no fragrance and no synthetic dyes, which is the right choice for a high-acid treatment targeting compromised skin. Dipropylene Glycol is a synthetic solvent. Palm derivative sourcing has not been independently verified, and packaging sustainability is not disclosed.",
      },
    ],
    keyActives: [
      { name: "Glycolic Acid (AHA, 25% blend)",     function: "Smallest AHA molecule, deepest penetration, collagen stimulation, surface exfoliation and renewal" },
      { name: "Lactic Acid (AHA)",                  function: "Larger AHA molecule than glycolic, gentler, hydrating AHA, pigmentation reduction" },
      { name: "Salicylic Acid (BHA, 2%)",           function: "Lipid-soluble beta-hydroxy acid, penetrates follicles, comedolytic, anti-acne" },
      { name: "Gluconolactone (PHA, 5%)",           function: "Polyhydroxy acid, largest molecular weight, surface-level gentle exfoliant with humectant and soothing properties" },
      { name: "Niacinamide",                        function: "Vitamin B3, anti-inflammatory, reduces post-peel redness" },
    ],
    ingredients: [
      { name: "Aqua",                                note: "Solvent base",                                                                                                         flag: "ok"   },
      { name: "Glycolic Acid",                       note: "Primary AHA in 25% blend; smallest molecule, deepest penetration, collagen stimulation; pH-dependent potency - pH not disclosed", flag: "info" },
      { name: "Lactic Acid",                         note: "Secondary AHA component; larger molecule than glycolic, gentler, provides hydration alongside exfoliation",           flag: "ok"   },
      { name: "Salicylic Acid",                      note: "2% BHA, EU-compliant for rinse-off/treatment use; lipid-soluble, penetrates sebaceous follicles",                    flag: "ok"   },
      { name: "Gluconolactone",                      note: "5% PHA; large molecular weight, surface exfoliation with soothing and humectant properties; gentlest acid in this formula", flag: "ok" },
      { name: "Niacinamide",                         note: "Vitamin B3, anti-inflammatory, reduces post-peel redness",                                                             flag: "ok"   },
      { name: "Panthenol",                           note: "Pro-vitamin B5, barrier restoration post-exfoliation",                                                                 flag: "ok"   },
      { name: "Allantoin",                           note: "Soothing and repairing, buffers post-peel barrier disruption",                                                         flag: "ok"   },
      { name: "Sodium Hyaluronate",                  note: "HA salt, hydration support post-peel",                                                                                 flag: "ok"   },
      { name: "Aloe Barbadensis Leaf Juice",         note: "Soothing and anti-inflammatory, post-peel barrier support",                                                           flag: "ok"   },
      { name: "Dipropylene Glycol",                  note: "Synthetic solvent and humectant, low concern at cosmetic concentrations",                                              flag: "ok"   },
      { name: "Phenoxyethanol",                      note: "Preservative within EU/India 1% limit",                                                                               flag: "info" },
      { name: "Ethylhexylglycerin",                  note: "Preservative booster, very low concern",                                                                              flag: "ok"   },
    ],
    pass_badges: ["INCI Verified", "Fragrance-Free", "Paraben-Free", "Cruelty-Free (PETA)"],
    warn_badges: ["pH Not Disclosed at 25% AHA Concentration"],
    info_badges: ["Treatment Use Only (Not Leave-On)", "25% AHA - Start Weekly, Max 10-15 Minutes"],
    indiaContext: "Multi-acid peels are effective for India's most common skin concerns: hyperpigmentation, uneven texture, and acne scarring, which are prevalent across Fitzpatrick III-V skin tones. At 25% AHA this is a high-potency formula. Start with weekly use, 10-minute contact time maximum. Do not use on broken, sunburned, or sensitised skin. Critical: apply broad-spectrum SPF 50 every morning for at least 7 days after each use - chemical exfoliation significantly increases photosensitivity. Not suitable for beginners to acid exfoliation. If you experience significant stinging, burning, or visible redness after rinsing, reduce frequency to biweekly. Avoid during pregnancy.",
    analyzedAt: "2026-05-20",
  },

  /* -------------------------------------------------
     8. 2% Niacinamide Glow Sunscreen SPF 50+ PA+++
     Source: discoverpilgrim.com/products/niacinamide-sunscreen-spf50
  ------------------------------------------------- */
  {
    productName: "2% Niacinamide Glow Sunscreen SPF 50+ PA+++",
    slug: "2-percent-niacinamide-glow-sunscreen-spf-50",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "Rs. 499 - Rs. 849",
    productType: "sunscreen",
    concern: "Sun protection, daily SPF, brightening, anti-pollution",
    summary: "A hybrid chemical-physical sunscreen combining Ethylhexyl Methoxycinnamate (Octinoxate), Octocrylene, and Butyl Methoxydibenzoylmethane (Avobenzone) as chemical UV filters with Titanium Dioxide as the physical mineral component. Niacinamide at 2% provides brightening support. Key concern: Octinoxate (Ethylhexyl Methoxycinnamate) is an endocrine disruptor flagged by FDA's 2019 proposed order requiring further safety data before GRASE status. It is also banned in Hawaii and several US states due to coral reef toxicity. It remains EU and India-permitted, but FDA's active safety review is a meaningful scientific signal. SPF 50+ claim requires validated SPF testing - brand references testing in product marketing but does not publish testing methodology or data.",
    score: 60,
    scoreLabel: "Fair",
    image: "https://discoverpilgrim.com/cdn/shop/files/1_0e2e8ce9-ed80-41c5-963f-7b0b4734f775.jpg?v=1751374674",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 31, max: 40,
        note: "Ethylhexyl Methoxycinnamate (Octinoxate) is the dominant UV filter in this sunscreen. In 2019, the FDA proposed that Octinoxate be classified as Category III (insufficient safety data) following studies showing measurable systemic absorption and estrogenic activity in in-vitro and in-vivo models. The EU SCCS re-confirmed its safety at current permitted concentrations, but the FDA's ongoing safety review is a legitimate scientific signal that many consumers may wish to take into account. Octinoxate is also banned in Hawaii and several marine-protected zones due to coral reef toxicity. Octocrylene is a well-characterised UV filter and photostabiliser for Avobenzone; it has a minor concern from benzophenone degradation products under prolonged UV exposure, and is also flagged for aquatic toxicity. Titanium Dioxide is the safest and most environmentally neutral filter in this formula. Cyclopentasiloxane, a volatile silicone, is under EU environmental review for aquatic persistence.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 22, max: 25,
        note: "The hybrid chemical-mineral filter system provides broad-spectrum coverage. Octocrylene photostabilises Avobenzone, preventing the UVA filter from degrading in sunlight over the course of the day - this is an important formulation feature. Titanium Dioxide adds a physical scatter component. Niacinamide at 2% provides anti-inflammatory and mild brightening support in a daily SPF context; the 5-10% range has stronger evidence for significant brightening, so 2% is a supportive rather than transformative dose. Sodium Hyaluronate and Tocopheryl Acetate add hydration and antioxidant support. The silicone base (Dimethicone and Cyclopentasiloxane) gives the texture its lightweight, non-greasy feel - a practical advantage for daily wear. SPF 50+ PA+++ indicates adequate UVA protection testing has been performed.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 18, max: 25,
        note: "The full INCI list is published on the product page. Niacinamide at 2% is disclosed. SPF 50+ PA+++ is claimed, but no published test report or ISO 24444/24443 testing data is accessible on the brand website - without a publicly available SPF test, consumers cannot independently verify the stated sun protection level. Octinoxate concentration is not disclosed despite being the primary UV filter in the formula. The FDA's ongoing endocrine safety review for Octinoxate is not mentioned in any product communications.",
      },
      {
        name: "Ethics & Sustainability",
        score: 6, max: 10,
        note: "Pilgrim is PETA-certified cruelty-free. The brand does not sell into markets that require mandatory animal testing. There is no synthetic fragrance and no azo dyes. Cyclopentasiloxane is a volatile silicone currently under EU environmental review for aquatic persistence. Octinoxate is a documented marine ecosystem toxin - it has been banned from sunscreens in Hawaii, Palau, and other marine-protected jurisdictions specifically for its role in coral reef damage. This product cannot be described as reef-safe. Titanium Dioxide is the most environmentally neutral filter in the formula. Palm derivative sourcing has not been independently verified.",
      },
    ],
    keyActives: [
      { name: "Ethylhexyl Methoxycinnamate (Octinoxate)", function: "Chemical UVB filter, dominant UV protection; FDA safety review ongoing for systemic absorption and estrogenic activity" },
      { name: "Octocrylene",                              function: "Chemical UV filter and Avobenzone photostabiliser, prevents UVA filter degradation in sunlight" },
      { name: "Butyl Methoxydibenzoylmethane (Avobenzone)", function: "Broad-spectrum UVA chemical filter, photostabilised by Octocrylene in this formula" },
      { name: "Titanium Dioxide",                         function: "Mineral physical UV scatterer, broad-spectrum physical block, adds to hybrid filter system" },
      { name: "Niacinamide (2%)",                         function: "Vitamin B3, anti-inflammatory and mild brightening support in daily SPF context" },
    ],
    ingredients: [
      { name: "Aqua",                                note: "Solvent base",                                                                                                         flag: "ok"   },
      { name: "Ethylhexyl Methoxycinnamate",         note: "Octinoxate, UVB chemical filter; FDA 2019 proposed rule found insufficient GRASE evidence due to systemic absorption and estrogenic activity in-vitro; EU SCCS confirmed safety at current limits; banned in Hawaii/Palau for coral reef toxicity", flag: "warn" },
      { name: "Octocrylene",                         note: "UV filter and photostabiliser for Avobenzone; minor benzophenone degradation product concern under prolonged UV", flag: "warn" },
      { name: "Butyl Methoxydibenzoylmethane",       note: "Avobenzone, broad-spectrum UVA chemical filter; photostabilised by Octocrylene in this formula",                     flag: "ok"   },
      { name: "Niacinamide",                         note: "Brand-confirmed at 2%; anti-inflammatory and mild brightening support",                                                flag: "ok"   },
      { name: "Glycerin",                            note: "Humectant",                                                                                                             flag: "ok"   },
      { name: "Titanium Dioxide",                    note: "Mineral physical UV scatterer, safe at cosmetic use concentrations including nano-grade",                             flag: "ok"   },
      { name: "Dimethicone",                         note: "Silicone, emollient and skin-feel enhancer for lightweight texture",                                                   flag: "ok"   },
      { name: "Cyclopentasiloxane",                  note: "Volatile silicone, improves spreadability and reduces greasy feel; under EU environmental review for aquatic persistence", flag: "info" },
      { name: "Sodium Hyaluronate",                  note: "HA salt for hydration",                                                                                                flag: "ok"   },
      { name: "Tocopheryl Acetate",                  note: "Vitamin E ester, antioxidant and skin conditioning",                                                                   flag: "ok"   },
      { name: "Panthenol",                           note: "Pro-vitamin B5, barrier restoration",                                                                                  flag: "ok"   },
      { name: "Carbomer",                            note: "Synthetic polymer gel-former, well-tolerated",                                                                         flag: "ok"   },
      { name: "Triethanolamine",                     note: "pH adjuster for Carbomer activation; at final-position trace quantities, safety concern is minimal",                 flag: "ok"   },
      { name: "Phenoxyethanol",                      note: "Preservative within EU/India 1% limit",                                                                               flag: "info" },
      { name: "Ethylhexylglycerin",                  note: "Preservative booster, very low concern",                                                                              flag: "ok"   },
    ],
    pass_badges: ["INCI Verified", "Fragrance-Free", "Paraben-Free", "Cruelty-Free (PETA)", "All Skin Types"],
    warn_badges: ["Octinoxate (FDA Safety Review, Marine Toxin)", "Octocrylene (Leave-On)"],
    info_badges: ["Hybrid Chemical-Mineral Formula", "SPF 50+ PA+++", "Cyclopentasiloxane Under EU Environmental Review"],
    indiaContext: "Daily SPF is the single most important step in a skincare routine for Indian skin - UV exposure is India's dominant driver of premature ageing, hyperpigmentation, and skin cancer risk across all Fitzpatrick types. This hybrid formula is well-suited to India's climate: the silicone base spreads easily without the chalky white cast of purely mineral sunscreens, and the lightweight texture works in humid conditions. The Octinoxate concern is a regulatory divergence between FDA and EU (both India and EU permit it); the risk is real but proportionate - EU toxicology review reconfirmed safety at current cosmetic concentrations. If you prefer to avoid Octinoxate pending FDA resolution, choose a mineral-only or non-Octinoxate hybrid SPF. Apply as the last step in your routine, reapply every 2-3 hours in direct sunlight.",
    analyzedAt: "2026-05-20",
  },

];

export const pilgrimBrand: Brand = {
  name: BRAND_NAME,
  slug: BRAND_SLUG,
  logo: "https://discoverpilgrim.com/cdn/shop/files/Pilgrim-New-Logo-Without-Tagline_a9de71c3-9c1c-4a33-b4eb-95830dab01db.png",
  tagline: "Korean Beauty. Indian Skin.",
  description: "Pilgrim is a Mumbai-based clean beauty brand founded in 2019 with a focus on Korean and Spanish beauty-inspired formulations adapted for Indian skin and climate. PETA-certified cruelty-free, not sold in mandatory animal-testing markets. Products are manufactured in India and South Korea. The brand targets Fitzpatrick III-V skin with targeted actives at disclosed concentrations. Positioned in the affordable-premium segment. The serum range is largely fragrance-free with strong INCI disclosure; however, the retinol night cream contains Parfum and dual synthetic dyes in a leave-on overnight format, and the sunscreen relies on Octinoxate (under FDA safety review) and Octocrylene, which pull the brand average down despite clean serums.",
  founded: "2019",
  headquarters: "Mumbai, India",
  website: "https://discoverpilgrim.com",
  instagramHandle: "@discoverpilgrim",
  nykaaUrl: "https://www.nykaa.com/brands/pilgrim",
  avgScore: 70,
  verdict: "Fair",
  products,
};
