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
        note: "All ingredients compliant under India CDSCO, EU Regulation 1223/2009, and US FDA 21 CFR. No restricted or prohibited substances detected. No Parfum, no parabens, no UV filters of concern. Sodium Hydroxide at final INCI position is a pH adjuster only. Phenoxyethanol at position 14 is within EU/India 1% limit. Carbomer is a synthetic polymer with low concern at cosmetic use concentrations. Clean safety profile.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 23, max: 25,
        note: "Multi-weight HA strategy is well-evidenced: high-MW HA (Sodium Hyaluronate) forms a surface film for immediate plumping; low-MW (Hydrolyzed Hyaluronic Acid) penetrates to upper dermis; Sodium Acetylated Hyaluronate (third-generation HA) is lipophilically modified for superior skin affinity and prolonged retention. Glycerin at position 4 is a meaningful humectant concentration. Panthenol for barrier repair. Centella Asiatica Extract adds soothing actives at functional positions. Individual HA fractions and molecular weights are not independently published beyond the stated 2% total.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 19, max: 25,
        note: "INCI disclosed on brand PDP (discoverpilgrim.com). Brand states 2% Hyaluronic Acid, which is above effective hydration thresholds. Individual HA fractions and molecular weights not disclosed separately. No active concentration ranges for supporting ingredients (Centella, Panthenol, Allantoin) disclosed. No clinical study PDFs published for this formula. No 'dermatologist tested' or 'clinically proven' claims identified on PDP at time of analysis.",
      },
      {
        name: "Ethics & Sustainability",
        score: 8, max: 10,
        note: "PETA-certified cruelty-free (+2). Vegan formulation (+1). Not sold in China or other mandatory animal-testing markets. Indian brand. No synthetic fragrance, no azo dyes. Minor deduction: Carbomer and Hydroxyethylcellulose are synthetic-derived polymers with non-zero COSMOS concern. RSPO palm derivative sourcing not independently verified (-1).",
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
        note: "All ingredients compliant under India, EU, and US regulations. Kojic Acid is EU-permitted in face care at up to 1% (SCCS 2021). Alpha Arbutin is the glycosylated form of hydroquinone but does not share hydroquinone's regulatory restrictions at cosmetic concentrations. Sodium Ascorbyl Phosphate is a well-tolerated stable vitamin C derivative. Kojic Acid can cause irritation on compromised or reactive barriers at undisclosed concentrations; EU SCCS opinion notes irritation potential that brand does not explicitly flag for sensitive skin users.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 22, max: 25,
        note: "Four-mechanism brightening formula is well-evidenced. Niacinamide at position 2 (brand-confirmed 10%) inhibits melanosome transfer. Kojic Acid inhibits tyrosinase. Alpha Arbutin provides additional tyrosinase inhibition via a different binding pathway. Sodium Ascorbyl Phosphate reduces already-formed melanin. Ferulic Acid at mid-INCI position provides antioxidant stabilisation. Multi-mechanism approach reduces risk of tolerance to any single brightener. Kojic Acid and Tranexamic Acid concentrations are not published; if sub-functional, the multi-mechanism claim weakens.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 19, max: 25,
        note: "INCI disclosed on brand PDP. Brand confirms Niacinamide at 10%. Kojic Acid concentration not published despite its regulatory sensitivity (EU max 1%). Alpha Arbutin, Ferulic Acid, and Tranexamic Acid concentrations undisclosed. No third-party clinical study PDFs published for this formula. No 'dermatologist tested' or 'clinically proven' claims identified on PDP.",
      },
      {
        name: "Ethics & Sustainability",
        score: 8, max: 10,
        note: "PETA-certified cruelty-free (+2). Vegan formulation (+1). Indian brand, not sold in mandatory-testing markets. No fragrance or synthetic dyes. Kojic Acid is a fermentation byproduct (Aspergillus flavus), naturally derived origin. Synthetic polymer (Carbomer) present. RSPO sourcing unverified (-1).",
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
        note: "No Parfum, no banned UV filters, no parabens. Salicylic Acid at 2% is at the EU maximum for leave-on cosmetics (Annex III limit), requiring careful pH calibration to avoid over-exfoliation. Tea Tree Leaf Oil (Melaleuca Alternifolia) in a leave-on format: SCCS 2015 opinion flagged sensitisation potential from terpene oxidation products; EU industry guidance recommends rinse-off preference or concentration limits for leave-on use; no concentration disclosed by brand.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 21, max: 25,
        note: "Salicylic Acid at 2% is the globally validated concentration for comedolytic activity. Niacinamide provides anti-inflammatory benefit and mild sebum regulation. Zinc PCA is an evidence-backed antimicrobial and sebum-regulating zinc complex. Tea Tree Oil adds an antimicrobial dimension but INCI position analysis cannot confirm a safe and effective concentration. Centella Asiatica Extract aids barrier integrity post-exfoliation. Niacinamide at 3% is below the 5-10% range with the strongest sebum-regulation evidence.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 18, max: 25,
        note: "INCI disclosed on brand PDP. Salicylic Acid confirmed at 2%, Niacinamide at 3% by brand. Tea Tree Oil concentration not disclosed, a material gap given sensitisation concerns for leave-on use where risk is concentration-dependent. No clinical study data published. Zinc PCA and Centella concentrations undisclosed. No 'dermatologist tested' or 'clinically proven' claims identified on PDP.",
      },
      {
        name: "Ethics & Sustainability",
        score: 7, max: 10,
        note: "PETA-certified cruelty-free (+2). Vegan formulation (+1). Indian brand, not sold in mandatory-testing markets. No synthetic fragrance, no azo dyes. Tea Tree Oil is a natural-origin ingredient but can oxidise over time if packaging is not airtight. RSPO sourcing unverified (-1).",
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
        note: "Primary concern: Citrus Aurantium Bergamia Fruit Oil (Bergamot) contains bergapten, a furanocoumarin phototoxin. EU Annex III restricts bergapten to 0.0015% in leave-on sun-exposed products. Bergamot oil without documented bergapten removal (FCF) is a phototoxicity and sensitisation risk in a leave-on brightening serum marketed for skin illumination. Citrus Limon Peel Oil carries similar phototoxic furanocoumarin content, compounding the risk. Brand does not disclose whether FCF (bergapten-free) variants are used, nor flag any sun-avoidance requirement on PDP at time of analysis.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 21, max: 25,
        note: "EAA at 15% is a well-designed stable vitamin C format that does not require anhydrous or low-pH packaging. Ferulic Acid enhances antioxidant activity and stabilises EAA. Tocopherol (vitamin E) adds additional free-radical quenching. Sodium Hyaluronate and Panthenol provide hydration support. Niacinamide adds brightening synergy. The citrus oils are inconsistent with the brightening philosophy: furanocoumarins can induce pigmentation under UV exposure, counteracting the formula's primary goal.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 19, max: 25,
        note: "INCI disclosed on brand PDP. EAA confirmed at 15% by brand. Brand does not disclose whether Bergamot Oil is bergapten-free (FCF), a material transparency gap for a leave-on product containing a known photosensitiser. No clinical study data published. Ferulic Acid and Tocopherol concentrations undisclosed. No 'dermatologist tested' or 'clinically proven' claims identified.",
      },
      {
        name: "Ethics & Sustainability",
        score: 7, max: 10,
        note: "PETA-certified cruelty-free (+2). Vegan formulation (+1). Indian brand, not sold in mandatory-testing markets. Citrus essential oils are natural-origin but introduce a safety concern and are not COSMOS-certified quality. No synthetic fragrance compounds beyond citrus essential oils. RSPO sourcing unverified (-1).",
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
        note: "This serum contains no Parfum. CI 16035 (Allura Red, azo dye) is EU-approved for cosmetic use but is a known contact allergen in sensitised individuals. In a leave-on product with no functional role for the dye, inclusion increases sensitisation risk without benefit. Retinyl Palmitate is a mild retinoid ester; significantly less potent than retinol or retinoic acid, with correspondingly low irritation risk. Phenoxyethanol within 1% limit. Retinyl Palmitate photodegradation on UV-exposed skin is a recognised concern not flagged by brand.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 19, max: 25,
        note: "Resveratrol is a polyphenol with in-vitro evidence for antioxidant and anti-ageing signalling (SIRT1 pathway activation). Vitis Vinifera Seed Extract provides proanthocyanidin antioxidant support. Niacinamide at a supporting position adds barrier and anti-inflammatory benefit. Retinyl Palmitate must undergo two esterase conversions in skin before reaching active retinoic acid form, making it substantially less effective than retinol at equivalent position, a meaningful efficacy gap for an 'anti-ageing' product. CI 16035 has no formulation function.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 19, max: 25,
        note: "INCI disclosed on brand PDP. Active concentrations for Resveratrol, Grape Seed Extract, Niacinamide, and Retinyl Palmitate not disclosed. Brand does not identify CI 16035 as a cosmetic colourant serving no functional role. No distinction made between Retinyl Palmitate (ester) and Retinol in marketing, though these are not equivalent in efficacy. No clinical study data published. No 'dermatologist tested' or 'clinically proven' claims identified.",
      },
      {
        name: "Ethics & Sustainability",
        score: 7, max: 10,
        note: "PETA-certified cruelty-free (+2). Vegan formulation (+1). Indian brand, not sold in mandatory-testing markets. No synthetic Parfum. CI 16035 is a synthetic azo dye with no natural-origin path (-1). Grape-derived ingredients from Vitis Vinifera offer a high natural origin index contribution. RSPO sourcing unverified (-1).",
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
        note: "Parfum (synthetic fragrance) is present in a leave-on retinol night product with 8+ hours of skin contact. Undisclosed fragrance allergens amplify sensitisation and irritation risk, particularly compounded with retinol's effect on skin permeability. EU Annex III requires individual fragrance allergens above 0.001% to be named in leave-on products; 'Parfum' as a single entry is non-compliant with that disclosure requirement. CI 16035 (Allura Red azo dye) and CI 45380 (fluorescein derivative dye) are leave-on contact allergens with no functional benefit in a skin-treatment night product. Retinol concentration not disclosed; sub-functional retinol (<0.025%) would make the retinoid labelling misleading. Dimethicone and Cetearyl Alcohol are safe. Phenoxyethanol within 1% limit.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 13, max: 25,
        note: "Retinol is the most evidence-backed retinoid for collagen stimulation, wrinkle reduction, and epidermal turnover. The gel-creme vehicle with Cetearyl Alcohol and Cetearyl Glucoside provides appropriate emollient support for overnight use. Dimethicone adds occlusion. The undisclosed retinol concentration is a material quality gap: sub-functional retinol renders the retinoid labelling meaningless. Parfum introduces an inflammatory risk that counteracts retinol's benefit over overnight contact. Dual cosmetic dyes add no formulation function.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 9, max: 25,
        note: "INCI disclosed on brand PDP. Retinol concentration not disclosed, which is a critical gap as consumers cannot assess the dose of the central active. Parfum listed without breakdown of component allergens as required by EU Regulation 1223/2009 Annex III for leave-on products. Two azo dyes present with no functional explanation in product marketing. Brand does not flag pregnancy contraindication for a retinoid-containing product. No clinical study data published.",
      },
      {
        name: "Ethics & Sustainability",
        score: 5, max: 10,
        note: "PETA-certified cruelty-free. Indian brand, not sold in mandatory-testing markets. Parfum and two synthetic dyes reduce natural origin index significantly; all three are on the COSMOS prohibited ingredients list. Dimethicone (silicone) is COSMOS-prohibited for natural certifications. Not vegan-verified due to ingredient complexity.",
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
        note: "No Parfum, no endocrine-disrupting UV filters, no restricted preservatives. This product is a rinse-off treatment. Glycolic Acid at 25% is a high cosmetic concentration; EU Annex III permits up to 10% AHA in leave-on and up to 30% in professional-grade rinse-off products with appropriate pH and contact time instructions. Brand does not disclose pH, which is the critical safety parameter at this AHA concentration. Salicylic Acid at 2% is compliant for rinse-off treatment use. Gluconolactone at 5% is well-tolerated. Phenoxyethanol within 1% limit. Niacinamide and Panthenol help offset peel-related inflammation. Without disclosed pH and contact time, this product could approach clinical peel territory.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 20, max: 25,
        note: "Multi-acid strategy is well-designed: Glycolic Acid provides deep AHA exfoliation and collagen stimulation; Lactic Acid adds hydrating AHA benefit with slightly larger molecular weight; Salicylic Acid penetrates sebaceous follicles for pore-level exfoliation; Gluconolactone acts at the surface with soothing properties. Niacinamide at a supporting position reduces post-peel redness. Aloe Barbadensis Leaf Juice and Panthenol support barrier recovery. pH is undisclosed, a formulation quality gap at 25% AHA. Individual AHA components and their proportions are not quantified.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 15, max: 25,
        note: "INCI disclosed on brand PDP. AHA (25%), BHA (2%), and PHA (5%) percentages confirmed by brand. Formula pH not disclosed, a critical safety parameter for any product with AHA above 10% and the most material disclosure gap in this product. Individual AHA components (Glycolic vs Lactic split and respective percentages) not specified. Maximum contact time not stated on brand PDP at time of analysis. No clinical study data published.",
      },
      {
        name: "Ethics & Sustainability",
        score: 6, max: 10,
        note: "PETA-certified cruelty-free (+2). Indian brand, not sold in mandatory-testing markets. No fragrance or synthetic dyes - appropriate for a high-acid treatment. Dipropylene Glycol is a synthetic solvent. RSPO sourcing unverified (-1). Packaging sustainability not disclosed (-1).",
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
        note: "Ethylhexyl Methoxycinnamate (Octinoxate) in leave-on sunscreen: FDA 2019 proposed rule found insufficient GRASE evidence due to measurable systemic absorption and estrogenic activity in in-vitro and in-vivo studies. EU SCCS re-confirmed safety at current limits, but the FDA divergence is a legitimate scientific signal. Octocrylene in leave-on: well-characterised safety profile but minor benzophenone degradation product concern under prolonged UV and aquatic toxicity concern. Avobenzone is photostabilised by Octocrylene. Titanium Dioxide mineral component is safe. Cyclopentasiloxane (volatile silicone) is under EU environmental review. Phenoxyethanol within 1% limit.",
      },
      {
        name: "Formulation Quality & Efficacy",
        score: 22, max: 25,
        note: "Hybrid chemical-mineral UV filter system provides broad-spectrum coverage. Octocrylene photostabilises Avobenzone, preventing UVA filter degradation over sun exposure time. Titanium Dioxide adds a physical scatter component. Niacinamide at 2% provides anti-inflammatory and mild brightening support in a daily SPF context, though 2% is below the 5-10% range with the strongest brightening evidence. Sodium Hyaluronate and Tocopheryl Acetate provide hydration and antioxidant support. Dimethicone and Cyclopentasiloxane provide the lightweight, non-greasy texture appropriate for Indian daily SPF use. SPF 50+ PA+++ indicates adequate UVA protection testing performed.",
      },
      {
        name: "Ingredient Disclosure & Transparency",
        score: 18, max: 25,
        note: "INCI disclosed on brand PDP. Niacinamide at 2% disclosed by brand. SPF 50+ PA+++ claimed but no published test report or ISO 24444/24443 data available on brand website. Octinoxate concentration not disclosed despite being the primary UV filter. FDA endocrine safety concern for Octinoxate not acknowledged in product communications. No 'dermatologist tested' or 'clinically proven' claims identified on PDP.",
      },
      {
        name: "Ethics & Sustainability",
        score: 6, max: 10,
        note: "PETA-certified cruelty-free (+2). Indian brand, not sold in mandatory-testing markets. No synthetic Parfum or azo dyes. Cyclopentasiloxane is a volatile silicone under EU environmental review for aquatic persistence. Octinoxate is a documented marine ecosystem disruptor (Hawaii, Palau ban) - not reef-safe, no reef-safe ethics bonus. Titanium Dioxide is the most environmentally neutral UV filter. RSPO sourcing unverified (-1).",
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
