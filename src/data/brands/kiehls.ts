/**
 * Kiehl's  -  Brand Scorecard Data
 *
 * SOURCING METHODOLOGY
 * --------------------
 * INCI ingredient lists: verified from INCIDecoder.com (sourced from brand's own published
 *   ingredient declarations), cross-checked where possible. May 2026.
 * Concentrations: inferred from INCI declaration order (descending by weight, per global
 *   cosmetics labelling law). No percentage stated unless published by the brand.
 * Image URLs: INCIDecoder product photography (storage.googleapis.com CDN).
 * Pillar scores: independently calculated under 4-pillar framework (v2); see inline notes.
 *
 * SCORING FRAMEWORK (v2, effective May 2026)
 * -------------------------------------------
 * Safety & Toxicity:                 max 40
 * Formulation Quality & Efficacy:    max 25
 * Ingredient Disclosure & Transparency: max 25
 * Ethics & Sustainability:           max 10
 *
 * KEY CONCERNS IDENTIFIED
 * -----------------------
 * - Midnight Recovery Concentrate: 5+ declared IFRA allergens (Linalool, Limonene, Citral,
 *   Citronellol, Geraniol) in a leave-on facial oil. High fragrance load.
 * - Creamy Eye Treatment: 4 parabens (Methyl-, Ethyl-, Propyl-, Butylparaben). Butylparaben
 *   and Propylparaben are the most scrutinised parabens in leave-on products.
 * - Powerful-Strength Vitamin C: Cyclohexasiloxane (D6)  -  EU restricted for rinse-off
 *   products since 2020; in leave-on at restricted concentration. Acrylonitrile copolymer
 *   (microplastic concern). Citrus oils + Limonene/Citral in a daytime product.
 * - Clearly Corrective: Alcohol Denat at position 4 (drying, potential barrier disruption
 *   with extended use); Lavender oil (Linalool allergen) in a brightening spot treatment.
 * - Ultra Facial Cleanser: SLES at position 2 (primary surfactant); 3 parabens;
 *   Polyaminopropyl Biguanide (antimicrobial preservative EU-restricted in rinse-off).
 *
 * Kiehl's is a heritage pharmacy brand (est. 1851) with a loyal following. Several
 * formulations date back decades and have not been updated to reflect modern ingredient
 * science. Newer products (Clearly Corrective, Rare Earth Masque) show cleaner formulation
 * logic. Overall brand scores in the Fair-Good range under the updated framework.
 */

import type { Brand } from "./types";

export const kiehlsBrand: Brand = {
  name: "Kiehl's",
  slug: "kiehls",
  logo: "/images/kiehls-logo.png",
  tagline: "Apothecary-inspired skincare since 1851",
  description:
    "Kiehl's is a New York-founded apothecary brand established in 1851, acquired by L'Oréal in 2000. Known for no-frills packaging, generous sampling, and loyal global following, Kiehl's occupies the prestige segment in India. Their formulations range from genuinely clean and well-structured (Rare Earth Masque, Calendula Toner) to heritage recipes that haven't been updated for modern ingredient standards (Creamy Eye Treatment with 4 parabens, Midnight Recovery Concentrate with high fragrance allergen load). India prices are premium relative to the formulation tier.",
  founded: "1851",
  headquarters: "New York, USA",
  website: "https://www.kiehls.com",
  instagramHandle: "@kiehls",
  nykaaUrl: "https://www.nykaa.com/brands/kiehl-s/c/3068",
  avgScore: 75,
  verdict: "Good",

  products: [

    // --- 1. Ultra Facial Cream -----------------------------------------------
    {
      productName: "Ultra Facial Cream",
      slug: "ultra-facial-cream",
      brand: "Kiehl's",
      brandSlug: "kiehls",
      priceRange: "₹4,500–₹5,500",
      productType: "leave-on",
      concern: "Daily moisturisation + barrier support",
      summary:
        "Kiehl's best-selling moisturiser: a fragrance-free, alcohol-free daily cream with a well-layered emollient base (Squalane, Apricot Kernel Oil, Avocado Oil, Sweet Almond Oil). The formula includes Hydroxypalmitoyl Sphinganine (a ceramide precursor), Pseudoalteromonas Ferment Extract (barrier conditioning), and Tocopherol. Salicylic Acid appears at the tail end; at this position, it functions as a preservative booster, not as an active exfoliant at this concentration. Myristyl Myristate (position 10) has some comedogenicity data; those prone to milia or closed comedones should note this. No fragrance, no parabens, no dyes: this is the cleanest product in the Kiehl's range.",
      score: 83,
      scoreLabel: "Good",
      image: "https://incidecoder-content.storage.googleapis.com/1da656e9-998f-4ece-beac-b9daca507ced/products/kiehls-ultra-facial-cream-7/kiehls-ultra-facial-cream-7_front_photo_original.jpeg",
      analyzedAt: "2026-05-20",
      pillars: [
        { name: "Safety & Toxicity",                      score: 38, max: 40, note: "This formula is fragrance-free, paraben-free, and free from Alcohol Denat, DMDM Hydantoin, and MIT — a clean safety profile for a daily leave-on moisturiser. One ingredient worth noting for acne-prone users: Myristyl Myristate (a fatty ester emollient) has moderate comedogenicity data in occlusion studies, meaning it can clog pores for some skin types. Chlorphenesin, a halogenated co-preservative, appears at a late position and is within safe limits for leave-on use." },
        { name: "Formulation Quality & Efficacy",          score: 20, max: 25, note: "The emollient base is well-layered — Squalane, Apricot Kernel Oil, Avocado Oil, and Sweet Almond Oil are all skin-compatible fats with good evidence for barrier conditioning. Hydroxypalmitoyl Sphinganine is a ceramide precursor that supports the skin's natural barrier lipid cycle. Pseudoalteromonas Ferment Extract is a marine bioferment with barrier-conditioning activity. This is a heritage formula — not cutting-edge, but the structure is sound and the ingredients are appropriate for the moisturising claim." },
        { name: "Ingredient Disclosure & Transparency",    score: 20, max: 25, note: "Full INCI is published on Kiehl's product page. The formula makes no inflated claims — there's no SPF, no 'clinically proven' language. That said, Kiehl's doesn't disclose the concentration of the ceramide precursor, and the comedogenicity concern from Myristyl Myristate is not mentioned anywhere in the product communication." },
        { name: "Ethics & Sustainability",                 score:  5, max: 10, note: "Kiehl's is owned by L'Oréal, which sells in mainland China where animal testing can be required by regulation. RSPO certification for palm-derived ingredients has not been independently verified. No PETA certification. Standard plastic and glass packaging." },
      ],
      keyActives: [
        { name: "Squalane", function: "A skin-identical emollient that is non-comedogenic, antioxidant, and barrier-supportive" },
        { name: "Prunus Armeniaca (Apricot) Kernel Oil", function: "A lightweight emollient rich in oleic acid with skin-softening properties" },
        { name: "Hydroxypalmitoyl Sphinganine", function: "A ceramide precursor that supports natural barrier lipid synthesis" },
        { name: "Pseudoalteromonas Ferment Extract", function: "A marine bioferment with barrier-conditioning and antioxidant activity" },
        { name: "Tocopherol (Vitamin E)", function: "An antioxidant that stabilises the formula and provides skin conditioning" },
      ],
      ingredients: [
        { name: "Aqua/Water", note: "Solvent base", flag: "ok" },
        { name: "Glycerin", note: "Humectant, widely studied and safe", flag: "ok" },
        { name: "Dimethicone", note: "Silicone film-former providing smooth application; occlusive and non-sensitising", flag: "ok" },
        { name: "Squalane", note: "Skin-identical emollient, non-comedogenic with excellent barrier support", flag: "ok" },
        { name: "Bis-PEG-18 Methyl Ether Dimethyl Silane", note: "Silicone-PEG emulsifier with low concern at cosmetic use levels", flag: "ok" },
        { name: "Sucrose Stearate", note: "Sugar-derived emulsifier that is mild and skin-compatible", flag: "ok" },
        { name: "Stearyl Alcohol", note: "Fatty alcohol used as emollient and emulsion stabiliser; not drying", flag: "ok" },
        { name: "Myristyl Myristate", note: "Fatty ester emollient with reported moderate comedogenicity in some occlusion studies; relevant for acne-prone skin", flag: "info" },
        { name: "Prunus Armeniaca Kernel Oil", note: "Apricot kernel oil, lightweight with high oleic acid content and skin-softening properties", flag: "ok" },
        { name: "Persea Gratissima Oil", note: "Avocado oil, rich in oleic acid and vitamins with emollient benefits", flag: "ok" },
        { name: "Oryza Sativa Bran Oil", note: "Rice bran oil, an emollient with antioxidant activity from gamma-oryzanol", flag: "ok" },
        { name: "Olea Europaea Fruit Oil", note: "Olive oil, an emollient and antioxidant with high oleic acid content", flag: "ok" },
        { name: "Prunus Amygdalus Dulcis Oil", note: "Sweet almond oil, an emollient with skin-conditioning properties", flag: "ok" },
        { name: "Hydroxypalmitoyl Sphinganine", note: "Ceramide precursor that supports barrier lipid synthesis", flag: "ok" },
        { name: "Pseudoalteromonas Ferment Extract", note: "Marine bioferment with barrier-conditioning and antioxidant properties", flag: "ok" },
        { name: "Salicylic Acid", note: "At tail INCI position, functions as a preservative booster and pH adjuster, not as an active exfoliant at this concentration", flag: "ok" },
        { name: "Tocopherol", note: "Vitamin E, an antioxidant", flag: "ok" },
        { name: "Phenoxyethanol", note: "Preservative at typical cosmetic level (~0.5–0.8%)", flag: "ok" },
        { name: "Chlorphenesin", note: "Co-preservative, halogenated; permitted at current concentration with low risk in leave-on at tail position", flag: "info" },
      ],
      pass_badges: ["Fragrance Free", "No Parabens", "INCI Verified", "Squalane Rich", "Sensitive Skin Friendly", "Dry Skin Friendly"],
      warn_badges: [],
      info_badges: ["Myristyl Myristate (Comedogenicity Note)"],
      indiaContext:
        "For Indian consumers: the multi-oil base is well-suited for dry to normal skin but may feel heavy in humid conditions. During monsoon and summer, a lighter gel moisturiser may be preferable. The fragrance-free formula is well-suited for sensitive skin types prevalent in India's pollution-exposed urban population.",
    },

    // --- 2. Calendula Herbal Extract Alcohol-Free Toner ----------------------
    {
      productName: "Calendula Herbal Extract Alcohol-Free Toner",
      slug: "calendula-herbal-extract-toner",
      brand: "Kiehl's",
      brandSlug: "kiehls",
      priceRange: "₹3,200–₹4,000",
      productType: "toner",
      concern: "Soothing + prep toning",
      summary:
        "One of Kiehl's most iconic products: a botanical prep toner featuring Calendula Officinalis Flower Extract (anti-inflammatory, antioxidant), Burdock Root Extract (Arctium Lappa), and Allantoin (soothing). The formula is genuinely minimal and clean: no alcohol, no fragrance, no essential oils, no dyes. Propylene Glycol is the second ingredient (after water), and at this position it functions as humectant and vehicle for botanical actives, though high concentrations of PG can be drying for some skin types. Chlorphenesin at position 6 (before Calendula extract at position 8) is a notable placement, higher than typical, but is within safe limits for a leave-on product.",
      score: 81,
      scoreLabel: "Good",
      image: "https://incidecoder-content.storage.googleapis.com/d6f9c688-1a23-4802-88da-c98f1b5d3002/products/kiehls-calendula-herbal-extract-alcohol-free-toner/kiehls-calendula-herbal-extract-alcohol-free-toner_front_photo_original.jpeg",
      analyzedAt: "2026-05-20",
      pillars: [
        { name: "Safety & Toxicity",                      score: 38, max: 40, note: "No fragrance, no alcohol, no parabens — a genuinely clean safety profile for a leave-on toner. Propylene Glycol is the second ingredient after water, which suggests a fairly high concentration. At elevated levels it can be mildly drying for some skin types, though it functions primarily as a humectant and carrier for the botanical actives here. Chlorphenesin, a co-preservative, appears at a relatively high position in the INCI — above the Calendula Extract — which means it may be present at a concentration exceeding the hero botanical. It is within safe limits but worth knowing for those with preservative sensitivities." },
        { name: "Formulation Quality & Efficacy",          score: 18, max: 25, note: "This is a prep toner, not a treatment — and it does that job well. Calendula Officinalis has anti-inflammatory and antioxidant properties. Burdock Root (Arctium Lappa) and Allantoin add further soothing support. Marshmallow Root (Althaea Officinalis) provides skin-conditioning mucilage. The formula is minimal and appropriate for its purpose. There are no high-potency actives here — this is about calming and conditioning post-cleanse, not addressing specific skin concerns." },
        { name: "Ingredient Disclosure & Transparency",    score: 20, max: 25, note: "Full INCI is published on Kiehl's product page, and the formula is honestly positioned around its botanical content. One thing ingredient-savvy consumers may notice: Chlorphenesin appears above Calendula Extract in the INCI order, which in standard cosmetics labelling means the preservative is present at a higher concentration than the featured botanical active. Calendula concentration is not disclosed — standard practice, but relevant to know." },
        { name: "Ethics & Sustainability",                 score:  5, max: 10, note: "Kiehl's is owned by L'Oréal, which sells in mainland China where animal testing can be required by regulation. No PETA certification. Standard packaging." },
      ],
      keyActives: [
        { name: "Calendula Officinalis Flower Extract", function: "Anti-inflammatory and antioxidant, soothing for reactive skin" },
        { name: "Arctium Lappa Root Extract (Burdock)", function: "Antioxidant, anti-inflammatory; traditional herbal use for skin clarity" },
        { name: "Allantoin", function: "Soothing and anti-irritant, buffering post-cleanse sensitivity" },
        { name: "Althaea Officinalis Root Extract (Marshmallow)", function: "Mucilaginous extract with skin-conditioning and soothing properties" },
      ],
      ingredients: [
        { name: "Water", note: "Solvent base", flag: "ok" },
        { name: "Propylene Glycol", note: "Humectant and solvent at position 2, indicating high concentration. Can be mildly drying at elevated levels for some skin types", flag: "info" },
        { name: "Propanediol", note: "Plant-derived humectant and solvent; a gentler alternative to PG", flag: "ok" },
        { name: "Phenoxyethanol", note: "Preservative at typical level", flag: "ok" },
        { name: "Chlorphenesin", note: "Co-preservative (halogenated) at position 6, above Calendula extract. Effective preservative within safe limits", flag: "info" },
        { name: "Arctium Lappa Root Extract", note: "Burdock root with antioxidant and anti-inflammatory properties", flag: "ok" },
        { name: "Disodium EDTA", note: "Chelating agent that stabilises the formula", flag: "ok" },
        { name: "Calendula Officinalis Flower Extract", note: "Anti-inflammatory and antioxidant hero ingredient; INCI position (8/16) suggests moderate concentration", flag: "ok" },
        { name: "Calendula Officinalis Flower", note: "Calendula petals with soothing and traditional botanical properties", flag: "ok" },
        { name: "Hydrolyzed Corn Starch", note: "Skin-conditioning with mild emollient effect", flag: "ok" },
        { name: "Allantoin", note: "Soothing and anti-irritant", flag: "ok" },
        { name: "Ivy Leaf Extract", note: "Astringent, antioxidant botanical", flag: "ok" },
        { name: "Glycerin", note: "Humectant at position 13, playing a secondary role", flag: "ok" },
        { name: "Althaea Officinalis Root Extract", note: "Marshmallow root with soothing and skin-conditioning properties", flag: "ok" },
      ],
      pass_badges: ["Alcohol Free", "Fragrance Free", "No Parabens", "INCI Verified", "Sensitive Skin Friendly", "All Skin Types"],
      warn_badges: [],
      info_badges: ["Propylene Glycol High in INCI", "Chlorphenesin above Calendula Extract"],
      indiaContext:
        "A prep toner without alcohol is particularly relevant in India where over-toning with astringent products is common and contributes to barrier damage. Calendula's anti-inflammatory properties are useful for post-sun soothing in India's high-UV environment. The price point (~₹3,500 for 250ml) is premium relative to comparable Indian toners.",
    },

    // --- 3. Clearly Corrective Dark Spot Solution ----------------------------
    {
      productName: "Clearly Corrective Dark Spot Solution",
      slug: "clearly-corrective-dark-spot-solution",
      brand: "Kiehl's",
      brandSlug: "kiehls",
      priceRange: "₹4,200–₹5,000",
      productType: "leave-on",
      concern: "Dark spots + brightening",
      summary:
        "Kiehl's flagship brightening serum using 3-O-Ethyl Ascorbic Acid (a stable Vitamin C ether derivative) alongside Hydroxypropyl Tetrahydropyrantriol (a Hyaluronic Acid analogue). The formula has notable concerns: Alcohol Denat appears at position 4, a meaningful concentration that may contribute to barrier disruption with prolonged daily use on compromised skin. Lavender Oil (Lavandula Angustifolia) and its disclosed allergen Linalool appear in the formula. In a brightening leave-on product, this is a sensitisation concern given that fragrance allergy is the most common cause of contact dermatitis. Salicylic Acid at position 10 functions at brightening/exfoliant levels in this context, adding efficacy but also irritation potential when combined with alcohol.",
      score: 74,
      scoreLabel: "Good",
      image: "https://incidecoder-content.storage.googleapis.com/defb0b39-b173-4405-a3af-b0b16469e015/products/kiehls-kiehls-clearly-corrective-dark-spot-solution/kiehls-kiehls-clearly-corrective-dark-spot-solution_front_photo_original.jpeg",
      analyzedAt: "2026-05-20",
      pillars: [
        { name: "Safety & Toxicity",                      score: 33, max: 40, note: "The formula doesn't list 'Parfum' or 'Fragrance' as a single ingredient — the essential oils are declared individually by botanical name, which is the more transparent approach. The key concern here is Alcohol Denat at position 4, indicating a meaningful concentration. Denatured alcohol in daily leave-on use is a documented barrier disruptor, and long-term use on compromised or sensitive skin can gradually degrade the stratum corneum. Lavandula Angustifolia Oil (Lavender essential oil) is present and contains Linalool, which EU regulation requires to be declared separately as a fragrance allergen. In a leave-on brightening serum typically used to treat post-inflammatory hyperpigmentation — where skin is already reactive — both the alcohol and the fragrance allergen deserve attention." },
        { name: "Formulation Quality & Efficacy",          score: 16, max: 25, note: "The brightening active, 3-O-Ethyl Ascorbic Acid, is a stable Vitamin C ether derivative with good evidence for brightening and antioxidant activity. Hydroxypropyl Tetrahydropyrantriol (a hyaluronic acid analogue) contributes hydration, and Adenosine adds a soothing, anti-ageing benefit. The actives are real and effective. However, using Alcohol Denat as a delivery vehicle introduces a long-term barrier integrity trade-off. Salicylic Acid at mid-formula adds exfoliant activity that can amplify irritation when combined with alcohol." },
        { name: "Ingredient Disclosure & Transparency",    score: 20, max: 25, note: "Full INCI is published and Linalool is declared as required under EU regulation. Active concentrations are not disclosed. Where this falls short is in the gap between the 'Clearly Corrective' branding — which implies a clean, corrective formula — and the actual presence of Alcohol Denat at a meaningful level and Lavender Oil. Neither of these is addressed or flagged in any of the product's marketing communication." },
        { name: "Ethics & Sustainability",                 score:  5, max: 10, note: "Kiehl's is owned by L'Oréal, which sells in mainland China where animal testing can be required by regulation. No PETA certification. Standard packaging." },
      ],
      keyActives: [
        { name: "3-O-Ethyl Ascorbic Acid", function: "Stable Vitamin C ether derivative for brightening, antioxidant activity, and PIH reduction" },
        { name: "Hydroxypropyl Tetrahydropyrantriol", function: "Hyaluronic acid analogue (THP) functioning as a hydration reservoir" },
        { name: "Salicylic Acid", function: "BHA exfoliant that accelerates cell turnover and assists pigment clearance" },
        { name: "Adenosine", function: "Purine derivative with anti-ageing, soothing, and well-tolerated properties" },
      ],
      ingredients: [
        { name: "Aqua/Water", note: "Solvent base", flag: "ok" },
        { name: "Propylene Glycol", note: "Humectant and solvent, high in INCI", flag: "info" },
        { name: "Glycerin", note: "Humectant", flag: "ok" },
        { name: "Alcohol Denat", note: "Denatured alcohol at position 4, indicating meaningful concentration. Potential for barrier disruption with daily leave-on use; acts as solvent and penetration enhancer", flag: "warn" },
        { name: "3-O-Ethyl Ascorbic Acid", note: "Stable Vitamin C ether, an effective brightening derivative with better stability than L-Ascorbic Acid", flag: "ok" },
        { name: "Hydroxypropyl Tetrahydropyrantriol", note: "HA analogue (THP) with hydrating and film-forming properties", flag: "ok" },
        { name: "Salicylic Acid", note: "BHA that at this position may function as mild exfoliant; adds to irritation potential in combination with Alcohol Denat", flag: "info" },
        { name: "Lavandula Angustifolia Oil", note: "Lavender essential oil, a fragrance allergen. In a leave-on brightening serum, this is a sensitisation concern", flag: "warn" },
        { name: "Linalool", note: "Fragrance allergen (EU mandatory disclosure), derived from Lavender oil. Potential contact sensitiser", flag: "warn" },
        { name: "Tocopheryl Acetate", note: "Vitamin E ester, an antioxidant", flag: "ok" },
        { name: "Adenosine", note: "Anti-ageing and soothing, well studied", flag: "ok" },
        { name: "Tocopherol", note: "Vitamin E, an antioxidant", flag: "ok" },
        { name: "Phenoxyethanol", note: "Preservative", flag: "ok" },
      ],
      pass_badges: ["INCI Verified", "Stable Vitamin C Derivative"],
      warn_badges: ["Alcohol Denat (Position 4)", "Lavender Oil + Linalool", "Caution: Sensitive Skin"],
      info_badges: ["Salicylic Acid (Exfoliant)"],
      indiaContext:
        "Dark spot treatment is one of the highest-demand skincare categories in India due to high UV exposure, post-acne PIH, and melasma. The active (3-O-Ethyl Ascorbic Acid) is effective for brightening. However, the Alcohol Denat and fragrance combination is worth noting for Indian consumers with post-inflammatory hyperpigmentation, whose skin is typically reactive or sensitised. Patch testing is recommended.",
    },

    // --- 4. Midnight Recovery Concentrate ------------------------------------
    {
      productName: "Midnight Recovery Concentrate",
      slug: "midnight-recovery-concentrate",
      brand: "Kiehl's",
      brandSlug: "kiehls",
      priceRange: "₹5,500–₹6,500",
      productType: "leave-on",
      concern: "Overnight skin recovery + barrier repair",
      summary:
        "A cult facial oil marketed for overnight skin recovery. The base is well-formulated: Rosehip Oil (Rosa Canina), Evening Primrose Oil (Oenothera Biennis), Jojoba Oil (Simmondsia Chinensis), and Squalane are all evidence-backed skin emollients with barrier-repair activity. However, the formula carries one of the highest fragrance allergen loads of any Kiehl's product: Lavender Oil, Geranium Oil, Rosemary Oil, and Coriander Oil are all listed with their declared IFRA allergens, namely Linalool, Limonene, Citral, Citronellol, and Geraniol. Five allergens declared in a single leave-on overnight product represents significant sensitisation risk, particularly on the skin's barrier recovery cycle during sleep. The fragrance serves no therapeutic role in skin recovery.",
      score: 72,
      scoreLabel: "Good",
      image: "https://incidecoder-content.storage.googleapis.com/4a174042-a2a7-4a1e-bb71-63fa02bc330a/products/kiehls-midnight-recovery-concentrate/kiehls-midnight-recovery-concentrate_front_photo_original.jpeg",
      analyzedAt: "2026-05-20",
      pillars: [
        { name: "Safety & Toxicity",                      score: 32, max: 40, note: "Each essential oil is declared by its botanical name rather than grouped under 'Parfum' or 'Fragrance' — the more transparent labelling approach. However, the cumulative fragrance allergen load in this product is significant. Five EU-declared allergens (Linalool, Limonene, Citral, Citronellol, Geraniol) come from four essential oils: Lavender, Geranium, Rosemary, and Coriander. This is an overnight leave-on product, meaning the skin is in contact with these allergens for 8 or more hours during its nightly repair cycle. Fragrance sensitisation is cumulative — repeated exposure over time increases the chance of developing a reaction, even without any immediate irritation at first use." },
        { name: "Formulation Quality & Efficacy",          score: 15, max: 25, note: "The oil base genuinely delivers on the emolliency and barrier-repair claim. Rosehip Oil (Rosa Canina) is rich in linoleic acid and beta-carotene. Evening Primrose Oil (Oenothera Biennis) has a high gamma-linolenic acid content with anti-inflammatory properties. Jojoba (Simmondsia Chinensis) is a liquid wax ester that is non-comedogenic and a well-proven carrier. Squalane provides additional barrier support. The skin recovery comes from this oil base, not from the essential oil blend — the fragrance serves an aesthetic purpose only and adds no therapeutic benefit to overnight skin repair." },
        { name: "Ingredient Disclosure & Transparency",    score: 20, max: 25, note: "All allergens are declared as required under EU regulation, and the full INCI is published on the Kiehl's product page. What isn't communicated is the distinction between what actually produces the recovery effect (the plant oil base) and what the essential oil blend contributes (fragrance only). At a price point around ₹6,000, a consumer reading the marketing would reasonably assume the essential oils are doing therapeutic work — they are not." },
        { name: "Ethics & Sustainability",                 score:  5, max: 10, note: "Kiehl's is owned by L'Oréal, which sells in mainland China where animal testing can be required by regulation. No PETA certification. Standard packaging." },
      ],
      keyActives: [
        { name: "Rosa Canina Fruit Oil (Rosehip)", function: "Rich in linoleic acid, beta-carotene, and Vitamin C, supporting barrier repair and hyperpigmentation" },
        { name: "Oenothera Biennis Oil (Evening Primrose)", function: "High in GLA (gamma-linolenic acid) with anti-inflammatory and barrier-repair properties" },
        { name: "Simmondsia Chinensis Oil (Jojoba)", function: "A liquid wax ester that is skin-identical, non-comedogenic, and emollient" },
        { name: "Squalane", function: "A skin-identical emollient with antioxidant and barrier-supportive activity" },
      ],
      ingredients: [
        { name: "Caprylic/Capric Triglyceride", note: "Derived from coconut oil; a lightweight, non-comedogenic carrier oil with emollient properties", flag: "ok" },
        { name: "Dicaprylyl Carbonate", note: "Lightweight emollient that is skin-compatible and spreads well", flag: "ok" },
        { name: "Squalane", note: "Skin-identical emollient with antioxidant and barrier-supportive properties", flag: "ok" },
        { name: "Rosa Canina Fruit Oil", note: "Rosehip oil, rich in linoleic acid and beta-carotene with barrier repair and brightening evidence", flag: "ok" },
        { name: "Oenothera Biennis Oil", note: "Evening primrose oil with high GLA content; anti-inflammatory with barrier repair properties", flag: "ok" },
        { name: "Simmondsia Chinensis Oil", note: "Jojoba oil, a liquid wax ester that is non-comedogenic and an excellent carrier", flag: "ok" },
        { name: "Lavandula Angustifolia Oil", note: "Lavender essential oil, a fragrance ingredient with Linalool (allergen) that has no therapeutic skin-repair role", flag: "warn" },
        { name: "Pelargonium Graveolens Flower Oil", note: "Geranium essential oil, a fragrance ingredient containing Citronellol and Geraniol (allergens)", flag: "warn" },
        { name: "Coriandrum Sativum Oil", note: "Coriander seed oil, a fragrance ingredient", flag: "warn" },
        { name: "Rosmarinus Officinalis Leaf Oil", note: "Rosemary essential oil, a fragrance ingredient", flag: "warn" },
        { name: "Linalool", note: "Fragrance allergen (EU mandatory disclosure), derived from Lavender oil", flag: "warn" },
        { name: "Limonene", note: "Fragrance allergen (EU mandatory disclosure)", flag: "warn" },
        { name: "Citral", note: "Fragrance allergen (EU mandatory disclosure)", flag: "warn" },
        { name: "Citronellol", note: "Fragrance allergen (EU mandatory disclosure), derived from Geranium oil", flag: "warn" },
        { name: "Geraniol", note: "Fragrance allergen (EU mandatory disclosure), derived from Geranium oil", flag: "warn" },
        { name: "Tocopherol", note: "Vitamin E, an antioxidant", flag: "ok" },
        { name: "Helianthus Annuus Seed Oil", note: "Sunflower oil, a lightweight emollient with high linoleic acid content", flag: "ok" },
      ],
      pass_badges: ["INCI Verified", "Rosehip + Evening Primrose", "Dry Skin Friendly"],
      warn_badges: ["5 Declared Fragrance Allergens", "4 Essential Oils in Leave-On", "Not Recommended for Sensitive Skin"],
      info_badges: [],
      indiaContext:
        "Overnight facial oils are popular in India for their skin recovery benefits. Those with sensitive skin or a history of fragrance reactions should be cautious: 5 declared EU allergens in a leave-on overnight product means extended skin contact and higher absorption. Those prone to PIH should avoid applying fragrant products near hyperpigmented areas.",
    },

    // --- 5. Powerful-Strength Line-Reducing Concentrate ----------------------
    {
      productName: "Powerful-Strength Line-Reducing Concentrate",
      slug: "powerful-strength-line-reducing-concentrate",
      brand: "Kiehl's",
      brandSlug: "kiehls",
      priceRange: "₹5,800–₹6,800",
      productType: "leave-on",
      concern: "Anti-ageing + brightening (Vitamin C)",
      summary:
        "Kiehl's vitamin C serum with a dual-form approach: 10.5% L-Ascorbic Acid (potent, low pH) combined with 2% Ascorbyl Glucoside (stable derivative). The dual-C system is genuinely well-designed for potency plus stability. However, significant formulation concerns exist: Cyclohexasiloxane (D6 silicone) is EU-restricted for rinse-off products (>0.1% banned since June 2020). This is a leave-on product, so it is technically still permitted at limited concentrations, but it is a silicone under increasing regulatory and environmental scrutiny. Acrylonitrile/Methyl Methacrylate/Vinylidene Chloride Copolymer is a synthetic polymer (microplastic concern) used as a mattifying agent. Citrus peel oils (Orange and Lemon) plus Limonene and Citral are fragrance ingredients in a product typically used in the morning, creating real phototoxicity and UV sensitisation risk.",
      score: 72,
      scoreLabel: "Good",
      image: "https://incidecoder-content.storage.googleapis.com/8bed46ed-5200-4b48-9ada-2b1518fce0c1/products/kiehls-powerful-strength-line-reducing-concentrate/kiehls-powerful-strength-line-reducing-concentrate_front_photo_original.jpeg",
      analyzedAt: "2026-05-20",
      pillars: [
        { name: "Safety & Toxicity",                      score: 32, max: 40, note: "Citrus oils are declared by their botanical names rather than grouped under 'Fragrance' — the more transparent approach. However, both Sweet Orange Peel Oil (Citrus Aurantium Dulcis) and Lemon Peel Oil (Citrus Limon) are present alongside their declared allergens Limonene and Citral. In a daytime leave-on serum, citrus peel oils carry documented phototoxic potential — they can increase the skin's sensitivity to UV radiation, which is especially worth considering in India's high-UV environment. Two additional ingredients are worth flagging: Cyclohexasiloxane (D6) is a cyclic silicone that has been restricted in EU rinse-off products since June 2020 due to aquatic environmental concerns; it remains technically permitted in leave-on products at restricted levels but faces increasing scrutiny. Acrylonitrile/Methyl Methacrylate/Vinylidene Chloride Copolymer is a synthetic polymer with a microplastic concern profile under the EU Microplastics Restriction 2023." },
        { name: "Formulation Quality & Efficacy",          score: 17, max: 25, note: "The dual Vitamin C approach here is genuinely well-designed. L-Ascorbic Acid at 10.5% is the most clinically studied form of Vitamin C for brightening and collagen stimulation — potent and effective at this level. Ascorbyl Glucoside at 2% is a stable derivative that helps extend and stabilise the formula's overall Vitamin C activity. Kiehl's discloses both concentrations, which is a positive transparency signal. Hydrolyzed Hyaluronic Acid and Adenosine add supporting benefits. The D6 silicone and the microplastic-associated copolymer are concerns that sit alongside otherwise strong actives." },
        { name: "Ingredient Disclosure & Transparency",    score: 19, max: 25, note: "Kiehl's discloses 10.5% L-Ascorbic Acid and 2% Ascorbyl Glucoside on the product page — an uncommon and positive level of active transparency. Full INCI is published. Where the gap exists: the phototoxic risk of the citrus oils in a daytime product, the D6 silicone's environmental regulatory status, and the microplastic concern from the copolymer are not mentioned anywhere in the product communication or marketing." },
        { name: "Ethics & Sustainability",                 score:  4, max: 10, note: "Kiehl's is owned by L'Oréal, which sells in mainland China where animal testing can be required by regulation. Cyclohexasiloxane (D6) is a persistent aquatic pollutant with documented aquatic toxicity. The synthetic polymer copolymer raises additional environmental concerns. No PETA certification." },
      ],
      keyActives: [
        { name: "L-Ascorbic Acid (10.5%)", function: "Pure Vitamin C in its most potent and clinically studied form, supporting collagen stimulation, antioxidant activity, and brightening" },
        { name: "Ascorbyl Glucoside (2%)", function: "Stable Vitamin C derivative that stabilises and extends the activity of L-Ascorbic Acid" },
        { name: "Hydrolyzed Hyaluronic Acid", function: "Low-MW hyaluronic acid that penetrates the upper epidermis to deliver hydration" },
        { name: "Adenosine", function: "Anti-ageing and soothing, well studied" },
      ],
      ingredients: [
        { name: "Propylene Glycol", note: "Humectant and solvent for L-Ascorbic Acid delivery", flag: "ok" },
        { name: "Dimethicone", note: "Silicone texture modifier and film-former", flag: "ok" },
        { name: "Glycerin", note: "Humectant", flag: "ok" },
        { name: "Ascorbic Acid (L-Ascorbic Acid)", note: "Pure Vitamin C at 10.5% brand-confirmed. Most potent form; effective but pH-sensitive", flag: "ok" },
        { name: "Ascorbyl Glucoside", note: "Stable Vitamin C derivative at 2% brand-confirmed. Stabilises and extends activity", flag: "ok" },
        { name: "Cyclohexasiloxane (D6)", note: "Cyclic silicone that is EU-restricted for rinse-off products since 2020. In leave-on format it is technically permitted at restricted levels but is under environmental and regulatory scrutiny", flag: "warn" },
        { name: "Acrylonitrile/Methyl Methacrylate/Vinylidene Chloride Copolymer", note: "Synthetic polymer mattifying agent with potential microplastic concern per EU Microplastics Restriction 2023", flag: "warn" },
        { name: "Citrus Aurantium Dulcis Peel Oil", note: "Sweet orange peel oil, a fragrance ingredient with phototoxic potential (from Limonene) in a daytime serum", flag: "warn" },
        { name: "Citrus Limon Peel Oil", note: "Lemon peel oil with phototoxic potential; Bergapten content varies by extraction method. In a daytime product, UV sensitisation risk is real", flag: "warn" },
        { name: "Limonene", note: "Fragrance allergen (EU mandatory disclosure), derived from citrus oils with phototoxic potential", flag: "warn" },
        { name: "Citral", note: "Fragrance allergen (EU mandatory disclosure), derived from citrus oils", flag: "warn" },
        { name: "Hydrolyzed Hyaluronic Acid", note: "Low-MW HA that penetrates the epidermis for hydration", flag: "ok" },
        { name: "Adenosine", note: "Anti-ageing and soothing", flag: "ok" },
        { name: "Phenoxyethanol", note: "Preservative", flag: "ok" },
      ],
      pass_badges: ["INCI Verified", "10.5% L-Ascorbic Acid", "Dual Vitamin C System"],
      warn_badges: ["D6 Silicone (EU Restricted)", "Citrus Oils in Daytime Product", "Microplastic Concern", "Caution: Sensitive or Reactive Skin"],
      info_badges: [],
      indiaContext:
        "A high-potency Vitamin C serum is highly relevant for India, where UV-induced oxidative stress, hyperpigmentation, and dull skin are among the most common skin concerns. However, using a citrus-oil fragrant daytime Vitamin C in India's intense UV environment compounds phototoxicity risk. Indian consumers using this should follow with broad-spectrum SPF 50+ and avoid applying to broken or reactive skin.",
    },

    // --- 6. Rare Earth Deep Pore Cleansing Masque ----------------------------
    {
      productName: "Rare Earth Deep Pore Cleansing Masque",
      slug: "rare-earth-deep-pore-cleansing-masque",
      brand: "Kiehl's",
      brandSlug: "kiehls",
      priceRange: "₹2,500–₹3,000",
      productType: "rinse-off",
      concern: "Pore cleansing + oil control",
      summary:
        "Kiehl's cleanest product by score. A kaolin and bentonite clay mask that is fragrance-free, alcohol-free, and paraben-free, with no dyes and no essential oils. Kaolin and Bentonite at positions 2 and 3 confirm high active clay concentrations, as these are the product's core function. Glycerin at position 4 prevents the classic problem of clay masks over-drying the skin. Aloe Barbadensis Leaf Juice and Avena Sativa Flour (Oat) provide soothing and skin conditioning. Allantoin adds anti-irritant activity. This is a well-formulated, clean clay mask with appropriate ingredients at appropriate positions.",
      score: 85,
      scoreLabel: "Excellent",
      image: "https://incidecoder-content.storage.googleapis.com/3699a90a-653e-4e75-a483-51ae681e15ce/products/kiehls-rare-earth-deep-pore-cleansing-masque/kiehls-rare-earth-deep-pore-cleansing-masque_front_photo_original.jpeg",
      analyzedAt: "2026-05-20",
      pillars: [
        { name: "Safety & Toxicity",                      score: 38, max: 40, note: "This is one of the cleanest formulas in the Kiehl's range: fragrance-free, paraben-free, no dyes, no essential oils. Kaolin and Bentonite are inert mineral clays with no systemic safety concerns. Ceteareth-20 is a PEG-derived emulsifier — a single PEG compound at low concern, though trace ethylene oxide potential is a general industry-wide issue with PEG derivatives. Being a rinse-off product also helps: limited skin contact time significantly reduces systemic absorption of any ingredients." },
        { name: "Formulation Quality & Efficacy",          score: 22, max: 25, note: "The two clays appear at INCI positions 2 and 3, confirming they are the dominant active ingredients — which is exactly what you want in a clay mask. Kaolin absorbs sebum and provides mild physical exfoliation. Bentonite swells in water to draw out impurities and has antimicrobial properties. Glycerin appears early enough in the formula to counteract the drying effect that clay masks can cause. Aloe Barbadensis, Colloidal Oat (Avena Sativa Flour), and Allantoin add further soothing and anti-inflammatory support. The formula is doing what it says at the right ingredient positions." },
        { name: "Ingredient Disclosure & Transparency",    score: 20, max: 25, note: "Full INCI is published and the clay types are clearly identified. The 'Rare Earth' branding refers to Amazonian White Clay — another name for Kaolin — which is not misleading, though it is a marketing flourish. No ingredient concentrations are disclosed, which is standard practice across the market." },
        { name: "Ethics & Sustainability",                 score:  5, max: 10, note: "Kiehl's is owned by L'Oréal, which sells in mainland China where animal testing can be required by regulation. No PETA certification. Standard packaging." },
      ],
      keyActives: [
        { name: "Kaolin", function: "Mineral clay that absorbs sebum, draws out impurities, and provides mild physical exfoliation" },
        { name: "Bentonite", function: "Swelling clay that absorbs excess oil, has antimicrobial properties, and deep-cleanses pores" },
        { name: "Aloe Barbadensis Leaf Juice", function: "Soothing and anti-inflammatory, mitigating the dryness typical of clay masks" },
        { name: "Avena Sativa Flour (Oat)", function: "Delivers avenanthramides with anti-inflammatory and skin-conditioning properties" },
        { name: "Allantoin", function: "Anti-irritant and soothing, buffering clay irritation" },
      ],
      ingredients: [
        { name: "Water", note: "Solvent base", flag: "ok" },
        { name: "Kaolin", note: "White clay mineral used for oil absorption and pore cleansing; at position 2 confirms high concentration", flag: "ok" },
        { name: "Bentonite", note: "Swelling clay for deep oil absorption and antimicrobial action; high concentration confirmed at position 3", flag: "ok" },
        { name: "Propanediol", note: "Plant-derived humectant and solvent", flag: "ok" },
        { name: "Glycerin", note: "Humectant that prevents excessive drying from clay", flag: "ok" },
        { name: "CI 77891 (Titanium Dioxide)", note: "Mineral pigment, inert and white in colour. Not a photocatalytic concern at cosmetic use concentrations", flag: "ok" },
        { name: "Caprylic/Capric Triglyceride", note: "Emollient that provides skin conditioning and prevents over-stripping", flag: "ok" },
        { name: "Cetearyl Alcohol", note: "Fatty alcohol used as emulsifier and thickener; non-drying", flag: "ok" },
        { name: "Zea Mays Starch (Corn Starch)", note: "Oil-absorbing powder that adds mattifying texture", flag: "ok" },
        { name: "Ceteareth-20", note: "PEG-derived emulsifier; standard use with trace ethylene oxide potential, an industry-wide issue", flag: "info" },
        { name: "Xanthan Gum", note: "Natural polysaccharide thickener", flag: "ok" },
        { name: "Aloe Barbadensis Leaf Juice", note: "Soothing and anti-inflammatory, buffering the clay's astringency", flag: "ok" },
        { name: "Avena Sativa Flour", note: "Colloidal oat with anti-inflammatory and skin-conditioning properties", flag: "ok" },
        { name: "Allantoin", note: "Anti-irritant and soothing", flag: "ok" },
        { name: "Tocopherol", note: "Vitamin E, an antioxidant", flag: "ok" },
        { name: "Lecithin", note: "Phospholipid emulsifier that is skin-compatible and barrier-supportive", flag: "ok" },
        { name: "Phenoxyethanol", note: "Preservative", flag: "ok" },
        { name: "Caprylyl Glycol", note: "Humectant and co-preservative", flag: "ok" },
        { name: "Ethylhexylglycerin", note: "Co-preservative and skin conditioning", flag: "ok" },
      ],
      pass_badges: ["Fragrance Free", "No Parabens", "No Dyes", "INCI Verified", "Dual Clay Formula", "Oily / Combination Skin", "All Skin Types"],
      warn_badges: [],
      info_badges: ["Ceteareth-20 (PEG Emulsifier)"],
      indiaContext:
        "Oiliness, enlarged pores, and clogged pores are among the most common skin complaints in India due to heat and humidity. A clay mask 1-2x weekly is a well-evidenced approach. This is among the cleanest clay masks at the premium price point and a good Kiehl's recommendation for Indian consumers.",
    },

    // --- 7. Creamy Eye Treatment with Avocado --------------------------------
    {
      productName: "Creamy Eye Treatment with Avocado",
      slug: "creamy-eye-treatment-with-avocado",
      brand: "Kiehl's",
      brandSlug: "kiehls",
      priceRange: "₹3,200–₹3,800",
      productType: "leave-on",
      concern: "Eye area hydration",
      summary:
        "One of Kiehl's most iconic and long-standing products, and the one most in need of a formula update. The Creamy Eye Treatment contains four parabens: Methylparaben, Ethylparaben, Propylparaben, and Butylparaben. Butylparaben is the most scrutinised of the paraben family: it has the highest lipophilicity, longest half-life, and the greatest endocrine disruption potential in in-vitro studies. While the EU SCCS concluded Butylparaben is safe at current cosmetic use levels (re-evaluated 2023), it has been removed from most modern eye cream formulations, and its presence in a product applied daily to the periocular area (thin, vascular skin) is worth flagging. The avocado oil and shea butter base is genuinely emollient for the eye area, but this is a heritage formula that hasn't been modernised.",
      score: 68,
      scoreLabel: "Fair",
      image: "https://incidecoder-content.storage.googleapis.com/d8bf8e08-cb2c-483a-971e-764d7ebda411/products/kiehls-creamy-eye-treatment-with-avocado/kiehls-creamy-eye-treatment-with-avocado_front_photo_original.jpeg",
      analyzedAt: "2026-05-20",
      pillars: [
        { name: "Safety & Toxicity",                      score: 30, max: 40, note: "This product contains four parabens: Methylparaben, Ethylparaben, Propylparaben, and Butylparaben. Methylparaben and Ethylparaben have the lowest concern profile in the paraben family. Propylparaben and Butylparaben are the ones that have attracted greater scrutiny — they have a higher lipophilicity (fat-solubility), meaning they accumulate more readily in tissue, and carry a greater endocrine disruption potential in in-vitro studies. Butylparaben in particular has the longest tissue half-life of any paraben. The EU SCCS conducted a safety re-evaluation in 2023 and concluded that Butylparaben is safe at current cosmetic use levels — but the ingredient has been voluntarily removed from the vast majority of modern leave-on eye products. The periocular area has thinner skin and higher vascularity than most of the face, which means greater absorption. Isopropyl Palmitate, present as an emollient, has some reported comedogenicity that is relevant to milia formation under the eye." },
        { name: "Formulation Quality & Efficacy",          score: 14, max: 25, note: "Shea Butter (Butyrospermum Parkii) and Avocado Oil (Persea Gratissima) are effective emollients that perform well in the dry periocular area. Sodium PCA is a natural humectant and part of the skin's own natural moisturising factor. The formula moisturises well — but it has no peptides, no retinoids, and no contemporary anti-ageing actives. The preservation system uses four parabens where modern formulations would typically use a single, more targeted option. This is essentially a well-executing but dated formula." },
        { name: "Ingredient Disclosure & Transparency",    score: 20, max: 25, note: "All four parabens are clearly named in the INCI, which is published on the Kiehl's product page. There is no obscuring of the ingredient list — the disclosure is honest. What is absent is any acknowledgment that this is a heritage formula that hasn't been updated, or that the preservation approach differs from modern industry standards for leave-on eye products." },
        { name: "Ethics & Sustainability",                 score:  4, max: 10, note: "Kiehl's is owned by L'Oréal, which sells in mainland China where animal testing can be required by regulation. This formula appears to have gone unchanged for many years, despite widely available modern preservation alternatives with better consumer acceptance. No PETA certification." },
      ],
      keyActives: [
        { name: "Butyrospermum Parkii Butter (Shea)", function: "Rich emollient with skin barrier, anti-inflammatory, and moisturising properties" },
        { name: "Persea Gratissima Oil (Avocado)", function: "Emollient high in oleic acid and Vitamin E with skin-softening benefits" },
        { name: "Sodium PCA", function: "Natural humectant (part of the skin's NMF) supporting moisture retention" },
        { name: "Tocopheryl Acetate", function: "Vitamin E ester, an antioxidant" },
      ],
      ingredients: [
        { name: "Water", note: "Solvent base", flag: "ok" },
        { name: "Butyrospermum Parkii Butter", note: "Shea butter, an emollient with anti-inflammatory properties and excellent results on dry skin", flag: "ok" },
        { name: "Butylene Glycol", note: "Humectant and solvent", flag: "ok" },
        { name: "Persea Gratissima Oil", note: "Avocado oil, an emollient with high oleic acid content", flag: "ok" },
        { name: "Sodium PCA", note: "Natural humectant (NMF component) supporting moisture retention", flag: "ok" },
        { name: "Copper PCA", note: "Trace mineral with antioxidant and potential wound-healing support", flag: "ok" },
        { name: "Ozokerite", note: "Petroleum-derived mineral wax used as an occlusive thickener. No safety concern at cosmetic use levels", flag: "info" },
        { name: "Methylparaben", note: "Paraben preservative, widely studied and safe at cosmetic use levels; lowest concern in the paraben family", flag: "info" },
        { name: "Ethylparaben", note: "Paraben preservative with low concern and short half-life", flag: "info" },
        { name: "Propylparaben", note: "Paraben preservative in leave-on product. Removed by most modern brands for leave-on use.", flag: "warn" },
        { name: "Butylparaben", note: "Paraben preservative in leave-on product. Highest endocrine disruption concern in the paraben family; most lipophilic with the longest half-life. Daily periocular use warrants attention. EU SCCS approved at current cosmetic use levels (2023), but industry trend is strongly away from this ingredient in leave-on formulations.", flag: "warn" },
        { name: "Isopropyl Palmitate", note: "Ester emollient with some reported comedogenicity; relevant to milia under the eye", flag: "info" },
        { name: "Tocopheryl Acetate", note: "Vitamin E ester, an antioxidant", flag: "ok" },
        { name: "Phenoxyethanol", note: "Preservative", flag: "ok" },
        { name: "Zea Mays Oil", note: "Corn oil, an emollient", flag: "ok" },
        { name: "Beta-Carotene", note: "Pro-vitamin A antioxidant with minor antioxidant activity and colour contribution", flag: "ok" },
      ],
      pass_badges: ["Fragrance Free", "INCI Verified", "Dry Skin"],
      warn_badges: ["Propylparaben in Leave-On", "Butylparaben in Leave-On", "4 Parabens Including Butylparaben"],
      info_badges: ["Heritage Formula - Not Updated"],
      indiaContext:
        "Eye creams are a high-purchase category in India. The periocular area has thinner skin than the rest of the face, so ingredient choices matter more here. Consumers who prefer to avoid parabens, particularly Butylparaben, should check this formula before purchasing.",
    },

    // --- 8. Ultra Facial Cleanser --------------------------------------------
    {
      productName: "Ultra Facial Cleanser",
      slug: "ultra-facial-cleanser",
      brand: "Kiehl's",
      brandSlug: "kiehls",
      priceRange: "₹1,900–₹2,500",
      productType: "rinse-off",
      concern: "Daily face cleansing",
      summary:
          "The Ultra Facial Cleanser has Sodium Laureth Sulfate (SLES) at position 2 as the primary surfactant. SLES effectively cleanses but can disrupt the skin's natural barrier with daily use, particularly on sensitive or compromised skin. The formula also contains three parabens (Methylparaben, Propylparaben, Sodium Methylparaben) and Polyaminopropyl Biguanide (PHMB), an antimicrobial preservative restricted in EU rinse-off cosmetics at >0.1% since 2019. The formula does include conditioning ingredients: Squalane, Sweet Almond Oil, and Avocado Oil help offset the drying effect of SLES post-wash.",
      score: 68,
      scoreLabel: "Fair",
      image: "https://incidecoder-content.storage.googleapis.com/f0524f41-1571-405d-9013-57debfdaf823/products/kiehls-ultra-facial-cleanser/kiehls-ultra-facial-cleanser_front_photo_original.jpeg",
      analyzedAt: "2026-05-20",
      pillars: [
        { name: "Safety & Toxicity",                      score: 33, max: 40, note: "Sodium Laureth Sulfate (SLES) is the primary cleanser. It's effective at removing dirt and oil but is stronger than gentler amino acid-based alternatives. Daily use on sensitive or dry skin can gradually disrupt the skin's moisture barrier, particularly in India's hard water conditions which raise the effective pH of sulphate-based cleansers. The formula also contains Polyaminopropyl Biguanide (PHMB), an antimicrobial preservative that has been EU-restricted in rinse-off cosmetics above 0.1% since 2019, with contact sensitisation documented in some post-market studies. Three parabens are present (Methylparaben, Propylparaben, Sodium Methylparaben). In a rinse-off product the systemic exposure concern is substantially lower than in a leave-on, but three parabens in a daily cleanser is a dated approach." },
        { name: "Formulation Quality & Efficacy",          score: 13, max: 25, note: "SLES cleans effectively. Decyl Glucoside and Cocamidopropyl Betaine are milder surfactants added to the system, which helps reduce irritation. Conditioning oils — Squalane, Sweet Almond Oil, and Avocado Oil — are included to soften the post-wash feel and offset some of the drying effect. The rinse-off format limits ingredient exposure time, which matters for the preservatives. That said, PHMB's EU regulatory status and a three-paraben preservation system both reflect a formula that hasn't been updated to modern standards." },
        { name: "Ingredient Disclosure & Transparency",    score: 17, max: 25, note: "Full INCI is published on the Kiehl's product page and all parabens are named clearly. What the product communication doesn't address: SLES as the primary surfactant is not flagged for consumers who monitor surfactant type, PHMB's EU-restricted status is not mentioned, and the preservation system is not acknowledged as differing from modern standards." },
        { name: "Ethics & Sustainability",                 score:  5, max: 10, note: "Kiehl's is owned by L'Oréal, which sells in mainland China where animal testing can be required by regulation. Standard packaging." },
      ],
      keyActives: [
        { name: "Squalane", function: "Skin-conditioning in rinse-off context, reducing post-wash tightness" },
        { name: "Prunus Amygdalus Dulcis Oil (Sweet Almond)", function: "Emollient that provides skin conditioning after cleanse" },
        { name: "Ascorbyl Glucoside", function: "Stable Vitamin C derivative with trace antioxidant activity in rinse-off" },
      ],
      ingredients: [
        { name: "Water", note: "Solvent base", flag: "ok" },
        { name: "Sodium Laureth Sulfate (SLES)", note: "Primary anionic surfactant at position 2. An effective cleanser but stronger than amino acid alternatives. Daily use may disrupt the skin barrier over time.", flag: "warn" },
        { name: "Decyl Glucoside", note: "Mild non-ionic surfactant that gentles the SLES system", flag: "ok" },
        { name: "Glycerin", note: "Humectant", flag: "ok" },
        { name: "Cocamidopropyl Betaine", note: "Amphoteric surfactant used as a foam booster; mild and reduces irritation", flag: "ok" },
        { name: "Polyaminopropyl Biguanide (PHMB)", note: "Antimicrobial preservative that is EU-restricted in rinse-off cosmetics at >0.1% since 2019. Documented contact sensitisation in some studies.", flag: "warn" },
        { name: "Methylparaben", note: "Paraben preservative with the lowest concern in the paraben family", flag: "info" },
        { name: "Propylparaben", note: "Paraben preservative; rinse-off format significantly reduces systemic exposure concern compared to leave-on use.", flag: "info" },
        { name: "Sodium Methylparaben", note: "Sodium salt of Methylparaben used as a preservative", flag: "info" },
        { name: "Triethanolamine", note: "pH adjuster with potential nitrosamine formation concern at high concentration; low risk at neutral pH in this context", flag: "info" },
        { name: "Squalane", note: "Skin-conditioning emollient that reduces post-wash tightness", flag: "ok" },
        { name: "Prunus Amygdalus Dulcis Oil", note: "Sweet almond oil for conditioning", flag: "ok" },
        { name: "Prunus Armeniaca Kernel Oil", note: "Apricot kernel oil for conditioning", flag: "ok" },
        { name: "Tocopherol", note: "Vitamin E, an antioxidant", flag: "ok" },
        { name: "Ascorbyl Glucoside", note: "Vitamin C derivative at trace concentration in rinse-off with limited efficacy contribution", flag: "ok" },
        { name: "Persea Gratissima Oil", note: "Avocado oil for conditioning", flag: "ok" },
        { name: "Phenoxyethanol", note: "Preservative", flag: "ok" },
        { name: "Ethylhexylglycerin", note: "Co-preservative", flag: "ok" },
      ],
      pass_badges: ["INCI Verified", "Oily Skin"],
      warn_badges: ["SLES Primary Surfactant", "PHMB (EU Restricted Preservative)", "3 Parabens"],
      info_badges: [],
      indiaContext:
        "Daily cleansing is a cornerstone of Indian skincare routines. SLES-based cleansers, while effective at removing dirt and oil, can disrupt the skin's natural acid mantle with repeated use, particularly relevant in India's hard water conditions. Consumers with sensitive or barrier-compromised skin may want to note the surfactant choice and the presence of PHMB, which is EU-restricted in rinse-off products.",
    },
  ],
};
