/**
 * Kiehl's — Brand Scorecard Data
 *
 * SOURCING METHODOLOGY
 * --------------------
 * INCI ingredient lists: verified from INCIDecoder.com (sourced from brand's own published
 *   ingredient declarations), cross-checked where possible. May 2026.
 * Concentrations: inferred from INCI declaration order (descending by weight, per global
 *   cosmetics labelling law). No percentage stated unless published by the brand.
 * Image URLs: INCIDecoder product photography (storage.googleapis.com CDN).
 * Pillar scores: independently calculated; see inline notes.
 *
 * KEY CONCERNS IDENTIFIED
 * -----------------------
 * - Midnight Recovery Concentrate: 5+ declared IFRA allergens (Linalool, Limonene, Citral,
 *   Citronellol, Geraniol) in a leave-on facial oil. High fragrance load.
 * - Creamy Eye Treatment: 4 parabens (Methyl-, Ethyl-, Propyl-, Butylparaben). Butylparaben
 *   is the most scrutinised paraben; removed by most modern brands.
 * - Powerful-Strength Vitamin C: Cyclohexasiloxane (D6) — EU restricted for rinse-off
 *   products since 2020; in leave-on at restricted concentration. Acrylonitrile copolymer
 *   (microplastic concern). Citrus oils + Limonene/Citral in a daytime product.
 * - Clearly Corrective: Alcohol Denat at position 4 (drying, potential barrier disruption
 *   with extended use); Lavender oil (Linalool allergen) in a brightening spot treatment.
 * - Ultra Facial Cleanser: SLES at position 2; 3 parabens; Polyaminopropyl Biguanide
 *   (antimicrobial preservative with sensitisation data in some populations).
 *
 * Kiehl's is a heritage pharmacy brand (est. 1851) with a loyal following. Several
 * formulations date back decades and have not been updated to reflect modern ingredient
 * science. Newer products (Clearly Corrective, Rare Earth Masque) show cleaner formulation
 * logic. Overall brand scores in the Fair–Good range.
 */

import type { Brand } from "./types";

export const kiehlsBrand: Brand = {
  name: "Kiehl's",
  slug: "kiehls",
  logo: "/images/kiehls-logo.png",
  tagline: "Apothecary-inspired skincare since 1851",
  description:
    "Kiehl's is a New York–founded apothecary brand established in 1851, acquired by L'Oréal in 2000. Known for no-frills packaging, generous sampling, and loyal global following, Kiehl's occupies the prestige segment in India. Their formulations range from genuinely clean and well-structured (Rare Earth Masque, Calendula Toner) to heritage recipes that haven't been updated for modern ingredient standards (Creamy Eye Treatment with 4 parabens, Midnight Recovery Concentrate with high fragrance allergen load). India prices are premium relative to the formulation tier.",
  founded: "1851",
  headquarters: "New York, USA",
  website: "https://www.kiehls.com",
  instagramHandle: "@kiehls",
  nykaaUrl: "https://www.nykaa.com/brands/kiehl-s/c/3068",
  avgScore: 69,
  verdict: "Fair",

  products: [

    // ─── 1. Ultra Facial Cream ────────────────────────────────────────────────
    {
      productName: "Ultra Facial Cream",
      slug: "ultra-facial-cream",
      brand: "Kiehl's",
      brandSlug: "kiehls",
      priceRange: "₹4,500–₹5,500",
      productType: "leave-on",
      concern: "Daily moisturisation + barrier support",
      summary:
        "Kiehl's best-selling moisturiser — a fragrance-free, alcohol-free daily cream with a well-layered emollient base (Squalane, Apricot Kernel Oil, Avocado Oil, Sweet Almond Oil). The formula includes Hydroxypalmitoyl Sphinganine (a ceramide precursor), Pseudoalteromonas Ferment Extract (barrier conditioning), and Tocopherol. Salicylic Acid appears at the tail end — at this position, it functions as a preservative booster, not as an active exfoliant. Myristyl Myristate (position 10) has some comedogenicity data; those prone to milia or closed comedones should note this. No fragrance, no parabens, no dyes — the cleanest product in the Kiehl's range.",
      score: 79,
      scoreLabel: "Good",
      image: "https://incidecoder-content.storage.googleapis.com/1da656e9-998f-4ece-beac-b9daca507ced/products/kiehls-ultra-facial-cream-7/kiehls-ultra-facial-cream-7_front_photo_original.jpeg",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Ingredient Safety",    score: 22, max: 25, note: "No fragrance, no parabens. Myristyl Myristate at position 10 has reported comedogenicity in occlusion studies — minor deduction. Chlorphenesin not present. All ingredients within global regulatory limits." },
        { name: "Irritation Potential", score: 15, max: 20, note: "Fragrance-free and essential oil-free. Dimethicone forms an occlusive film — generally non-sensitising. Salicylic Acid at tail position is pH-adjuster/preservative level, not an irritation concern at this concentration." },
        { name: "Disclosure Quality",   score: 15, max: 20, note: "Full INCI published. No percentage disclosures for actives (Squalane, ceramide precursor concentrations not stated). Formula is positioned as a 'moisturiser' without specific active claims — appropriately modest." },
        { name: "Regulatory",           score:  9, max: 10, note: "Fully compliant across India, EU, and US. Salicylic Acid at tail position is well within limits for leave-on products." },
        { name: "Efficacy",             score: 11, max: 15, note: "Multi-oil emollient base is well-suited for dry skin types. Squalane is skin-identical and non-comedogenic. Ceramide precursor (Hydroxypalmitoyl Sphinganine) + Ferment Extract provide barrier support. No high-potency actives — this is a maintenance moisturiser, not a treatment." },
        { name: "Transparency",         score:  7, max: 10, note: "Marketed as the 'original' formula — heritage positioning. No ingredient concentrations disclosed. Myristyl Myristate comedogenicity risk not communicated. Otherwise honest positioning." },
      ],
      keyActives: [
        { name: "Squalane", function: "Skin-identical emollient — non-comedogenic, antioxidant, barrier-supportive" },
        { name: "Prunus Armeniaca (Apricot) Kernel Oil", function: "Lightweight emollient rich in oleic acid — skin-softening" },
        { name: "Hydroxypalmitoyl Sphinganine", function: "Ceramide precursor — supports natural barrier lipid synthesis" },
        { name: "Pseudoalteromonas Ferment Extract", function: "Marine bioferment — barrier conditioning, antioxidant" },
        { name: "Tocopherol (Vitamin E)", function: "Antioxidant — stabilises formula, skin conditioning" },
      ],
      ingredients: [
        { name: "Aqua/Water", note: "Solvent base", flag: "ok" },
        { name: "Glycerin", note: "Humectant — widely studied, safe", flag: "ok" },
        { name: "Dimethicone", note: "Silicone film-former — smooth application, occlusive, non-sensitising", flag: "ok" },
        { name: "Squalane", note: "Skin-identical emollient — non-comedogenic, excellent barrier support", flag: "ok" },
        { name: "Bis-PEG-18 Methyl Ether Dimethyl Silane", note: "Silicone-PEG emulsifier — low concern at cosmetic use", flag: "ok" },
        { name: "Sucrose Stearate", note: "Sugar-derived emulsifier — mild, skin-compatible", flag: "ok" },
        { name: "Stearyl Alcohol", note: "Fatty alcohol — emollient, emulsion stabiliser; not drying", flag: "ok" },
        { name: "Myristyl Myristate", note: "Fatty ester emollient — reported moderate comedogenicity in some occlusion studies; relevant for acne-prone skin", flag: "info" },
        { name: "Prunus Armeniaca Kernel Oil", note: "Apricot kernel oil — lightweight, high oleic acid, skin-softening", flag: "ok" },
        { name: "Persea Gratissima Oil", note: "Avocado oil — rich in oleic acid and vitamins, emollient", flag: "ok" },
        { name: "Oryza Sativa Bran Oil", note: "Rice bran oil — emollient, antioxidant (gamma-oryzanol)", flag: "ok" },
        { name: "Olea Europaea Fruit Oil", note: "Olive oil — emollient, antioxidant; high oleic acid", flag: "ok" },
        { name: "Prunus Amygdalus Dulcis Oil", note: "Sweet almond oil — emollient, skin-conditioning", flag: "ok" },
        { name: "Hydroxypalmitoyl Sphinganine", note: "Ceramide precursor — supports barrier lipid synthesis", flag: "ok" },
        { name: "Pseudoalteromonas Ferment Extract", note: "Marine bioferment — barrier conditioning and antioxidant", flag: "ok" },
        { name: "Salicylic Acid", note: "At tail INCI position — functions as preservative booster/pH adjuster, not as an active exfoliant at this concentration", flag: "ok" },
        { name: "Tocopherol", note: "Vitamin E — antioxidant", flag: "ok" },
        { name: "Phenoxyethanol", note: "Preservative at typical cosmetic level (~0.5–0.8%)", flag: "ok" },
        { name: "Chlorphenesin", note: "Co-preservative — halogenated; permitted at current concentration, low risk in leave-on at tail position", flag: "info" },
      ],
      pass_badges: ["Fragrance Free", "No Parabens", "INCI Verified", "Squalane Rich"],
      warn_badges: [],
      info_badges: ["Myristyl Myristate (Comedogenicity Note)"],
      indiaContext:
        "For Indian consumers: the multi-oil base is well-suited for dry to normal skin but may feel heavy in humid conditions. During monsoon and summer, a lighter gel moisturiser may be preferable. The fragrance-free formula is well-suited for sensitive skin types prevalent in India's pollution-exposed urban population.",
    },

    // ─── 2. Calendula Herbal Extract Alcohol-Free Toner ───────────────────────
    {
      productName: "Calendula Herbal Extract Alcohol-Free Toner",
      slug: "calendula-herbal-extract-toner",
      brand: "Kiehl's",
      brandSlug: "kiehls",
      priceRange: "₹3,200–₹4,000",
      productType: "toner",
      concern: "Soothing + prep toning",
      summary:
        "One of Kiehl's most iconic products — a botanical prep toner featuring Calendula Officinalis Flower Extract (anti-inflammatory, antioxidant), Burdock Root Extract (Arctium Lappa), and Allantoin (soothing). The formula is genuinely minimal and clean: no alcohol, no fragrance, no essential oils, no dyes. Propylene Glycol is the second ingredient (after water) — at this position it functions as humectant and vehicle for botanical actives, but high concentrations of PG can be drying for some. Chlorphenesin at position 6 (before Calendula extract at position 8) is a notable placement — higher than typical — but is within safe limits for a leave-on product.",
      score: 77,
      scoreLabel: "Good",
      image: "https://incidecoder-content.storage.googleapis.com/d6f9c688-1a23-4802-88da-c98f1b5d3002/products/kiehls-calendula-herbal-extract-alcohol-free-toner/kiehls-calendula-herbal-extract-alcohol-free-toner_front_photo_original.jpeg",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Ingredient Safety",    score: 21, max: 25, note: "No fragrance, no alcohol. Chlorphenesin at position 6 — higher position than usual for a preservative; within global limits but slightly elevated vs. industry norm. No parabens." },
        { name: "Irritation Potential", score: 17, max: 20, note: "Alcohol-free confirmed. No essential oils. No fragrance allergens. Allantoin actively buffers irritation. One of Kiehl's lowest-irritation formulations." },
        { name: "Disclosure Quality",   score: 15, max: 20, note: "INCI published. Calendula extract concentration not disclosed. Chlorphenesin's high position vs. botanical actives could suggest more preservative than calendula — transparency gap." },
        { name: "Regulatory",           score:  9, max: 10, note: "Fully compliant. All ingredients within Indian and EU regulations." },
        { name: "Efficacy",             score: 10, max: 15, note: "Calendula and Burdock Root are documented for anti-inflammatory and antioxidant activity. Allantoin is soothing. However, this is primarily a prep/conditioning toner — it does not deliver high-potency actives. Hydrolyzed Corn Starch adds skin feel." },
        { name: "Transparency",         score:  5, max: 10, note: "Marketed as a hero Calendula product, but Chlorphenesin appears before Calendula Extract in INCI order, suggesting the botanical is at relatively low concentration. No disclosure of this positioning." },
      ],
      keyActives: [
        { name: "Calendula Officinalis Flower Extract", function: "Anti-inflammatory, antioxidant — soothing for reactive skin" },
        { name: "Arctium Lappa Root Extract (Burdock)", function: "Antioxidant, anti-inflammatory; traditional herbal use for skin clarity" },
        { name: "Allantoin", function: "Soothing, anti-irritant — buffers post-cleanse sensitivity" },
        { name: "Althaea Officinalis Root Extract (Marshmallow)", function: "Mucilaginous — skin-conditioning, soothing" },
      ],
      ingredients: [
        { name: "Water", note: "Solvent base", flag: "ok" },
        { name: "Propylene Glycol", note: "Humectant/solvent — at position 2, high concentration. Can be mildly drying at elevated levels for some skin types", flag: "info" },
        { name: "Propanediol", note: "Plant-derived humectant/solvent — gentler alternative to PG", flag: "ok" },
        { name: "Phenoxyethanol", note: "Preservative at typical level", flag: "ok" },
        { name: "Chlorphenesin", note: "Co-preservative (halogenated) — at position 6, above Calendula extract. Effective preservative, within safe limits", flag: "info" },
        { name: "Arctium Lappa Root Extract", note: "Burdock root — antioxidant, anti-inflammatory", flag: "ok" },
        { name: "Disodium EDTA", note: "Chelating agent — stabilises formula", flag: "ok" },
        { name: "Calendula Officinalis Flower Extract", note: "Anti-inflammatory, antioxidant — hero ingredient; INCI position (8/16) suggests moderate concentration", flag: "ok" },
        { name: "Calendula Officinalis Flower", note: "Calendula petals — soothing, traditional botanical", flag: "ok" },
        { name: "Hydrolyzed Corn Starch", note: "Skin-conditioning, mild emollient effect", flag: "ok" },
        { name: "Allantoin", note: "Soothing, anti-irritant", flag: "ok" },
        { name: "Ivy Leaf Extract", note: "Astringent, antioxidant botanical", flag: "ok" },
        { name: "Glycerin", note: "Humectant — at position 13, secondary role", flag: "ok" },
        { name: "Althaea Officinalis Root Extract", note: "Marshmallow root — soothing, skin-conditioning", flag: "ok" },
      ],
      pass_badges: ["Alcohol Free", "Fragrance Free", "No Parabens", "INCI Verified"],
      warn_badges: [],
      info_badges: ["Propylene Glycol High in INCI", "Chlorphenesin above Calendula Extract"],
      indiaContext:
        "A prep toner without alcohol is particularly relevant in India where over-toning with astringent products is common and contributes to barrier damage. Calendula's anti-inflammatory properties are useful for post-sun soothing in India's high-UV environment. The price point (~₹3,500 for 250ml) is premium relative to comparable Indian toners.",
    },

    // ─── 3. Clearly Corrective Dark Spot Solution ─────────────────────────────
    {
      productName: "Clearly Corrective Dark Spot Solution",
      slug: "clearly-corrective-dark-spot-solution",
      brand: "Kiehl's",
      brandSlug: "kiehls",
      priceRange: "₹4,200–₹5,000",
      productType: "leave-on",
      concern: "Dark spots + brightening",
      summary:
        "Kiehl's flagship brightening serum using 3-O-Ethyl Ascorbic Acid (a stable Vitamin C ether derivative) alongside Hydroxypropyl Tetrahydropyrantriol (a Hyaluronic Acid analogue). The formula has notable concerns: Alcohol Denat appears at position 4 — a meaningful concentration that may contribute to barrier disruption with prolonged daily use on compromised skin. Lavender Oil (Lavandula Angustifolia) and its disclosed allergen Linalool appear in the formula — in a brightening leave-on product, this is a sensitisation concern given that fragrance allergy is the most common cause of contact dermatitis. Salicylic Acid at position 10 functions at brightening/exfoliant levels in this context, adding efficacy but also irritation potential when combined with alcohol.",
      score: 65,
      scoreLabel: "Good",
      image: "https://incidecoder-content.storage.googleapis.com/defb0b39-b173-4405-a3af-b0b16469e015/products/kiehls-kiehls-clearly-corrective-dark-spot-solution/kiehls-kiehls-clearly-corrective-dark-spot-solution_front_photo_original.jpeg",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Ingredient Safety",    score: 17, max: 25, note: "Alcohol Denat at position 4 — significant concern for leave-on daily serum. Lavender oil (fragrance) with declared Linalool allergen. Salicylic Acid may enhance alcohol penetration of other actives — compounds concern. No parabens." },
        { name: "Irritation Potential", score: 12, max: 20, note: "Alcohol Denat + Lavender oil + Linalool in a leave-on brightening serum = elevated irritation/sensitisation stack. Salicylic Acid adds mild exfoliation. Combined with daily use on dark-spot-prone skin (often post-inflammatory/sensitive), this is a meaningful concern." },
        { name: "Disclosure Quality",   score: 15, max: 20, note: "INCI published. Linalool disclosed (EU mandatory). 3-O-Ethyl Ascorbic Acid percentage not disclosed. Alcohol Denat presence is transparent but not called out in marketing." },
        { name: "Regulatory",           score:  8, max: 10, note: "All ingredients compliant. Linalool disclosed as required by EU Regulation 1223/2009. Alcohol Denat is unrestricted." },
        { name: "Efficacy",             score:  9, max: 15, note: "3-O-Ethyl Ascorbic Acid is a well-regarded stable Vitamin C derivative with brightening evidence. HA analogue adds hydration. Salicylic Acid provides mild exfoliation to accelerate cell turnover. Efficacy is real but the delivery vehicle (alcohol) may compromise skin integrity over time." },
        { name: "Transparency",         score:  4, max: 10, note: "The 'clearly corrective' positioning implies a clean/corrective formula but Alcohol Denat at position 4 and Lavender Oil are not consistent with this framing. No disclosure of alcohol as a sensitisation risk." },
      ],
      keyActives: [
        { name: "3-O-Ethyl Ascorbic Acid", function: "Stable Vitamin C ether derivative — brightening, antioxidant, PIH reduction" },
        { name: "Hydroxypropyl Tetrahydropyrantriol", function: "Hyaluronic acid analogue (THP) — hydration reservoir" },
        { name: "Salicylic Acid", function: "BHA exfoliant — accelerates cell turnover, assists pigment clearance" },
        { name: "Adenosine", function: "Purine derivative — anti-ageing, soothing, well-tolerated" },
      ],
      ingredients: [
        { name: "Aqua/Water", note: "Solvent base", flag: "ok" },
        { name: "Propylene Glycol", note: "Humectant/solvent — high in INCI", flag: "info" },
        { name: "Glycerin", note: "Humectant", flag: "ok" },
        { name: "Alcohol Denat", note: "Denatured alcohol at position 4 — meaningful concentration. Potential barrier disruption with daily leave-on use; solvent and penetration enhancer", flag: "warn" },
        { name: "3-O-Ethyl Ascorbic Acid", note: "Stable Vitamin C ether — effective brightening derivative, better stability than L-Ascorbic Acid", flag: "ok" },
        { name: "Hydroxypropyl Tetrahydropyrantriol", note: "HA analogue (THP) — hydrating, film-forming", flag: "ok" },
        { name: "Salicylic Acid", note: "BHA — at this position may function as mild exfoliant; adds to irritation potential in combination with Alcohol Denat", flag: "info" },
        { name: "Lavandula Angustifolia Oil", note: "Lavender essential oil — fragrance allergen. In a leave-on brightening serum, this is a sensitisation concern", flag: "warn" },
        { name: "Linalool", note: "Fragrance allergen (EU mandatory disclosure) — derived from Lavender oil. Potential contact sensitiser", flag: "warn" },
        { name: "Tocopheryl Acetate", note: "Vitamin E ester — antioxidant", flag: "ok" },
        { name: "Adenosine", note: "Anti-ageing, soothing — well studied", flag: "ok" },
        { name: "Tocopherol", note: "Vitamin E — antioxidant", flag: "ok" },
        { name: "Phenoxyethanol", note: "Preservative", flag: "ok" },
      ],
      pass_badges: ["INCI Verified", "Stable Vitamin C Derivative"],
      warn_badges: ["Alcohol Denat (Position 4)", "Lavender Oil + Linalool"],
      info_badges: ["Salicylic Acid (Exfoliant)"],
      indiaContext:
        "Dark spot treatment is one of the highest-demand skincare categories in India due to high UV exposure, post-acne PIH, and melasma. The active (3-O-Ethyl Ascorbic Acid) is effective, but the Alcohol Denat + fragrance combination is particularly concerning for Indian consumers with post-inflammatory hyperpigmentation, whose skin is typically reactive/sensitised. Better alternatives exist without alcohol and fragrance.",
    },

    // ─── 4. Midnight Recovery Concentrate ────────────────────────────────────
    {
      productName: "Midnight Recovery Concentrate",
      slug: "midnight-recovery-concentrate",
      brand: "Kiehl's",
      brandSlug: "kiehls",
      priceRange: "₹5,500–₹6,500",
      productType: "leave-on",
      concern: "Overnight skin recovery + barrier repair",
      summary:
        "A cult facial oil marketed for overnight skin recovery. The base is well-formulated: Rosehip Oil (Rosa Canina), Evening Primrose Oil (Oenothera Biennis), Jojoba Oil (Simmondsia Chinensis), and Squalane are all evidence-backed skin emollients with barrier-repair activity. However, the formula carries one of the highest fragrance allergen loads of any Kiehl's product: Lavender Oil, Geranium Oil, Rosemary Oil, Coriander Oil are all listed with their declared IFRA allergens — Linalool, Limonene, Citral, Citronellol, Geraniol. Five allergens declared in a single leave-on overnight product represents significant sensitisation risk, particularly on the skin's barrier recovery cycle during sleep. The fragrance serves no therapeutic role in skin recovery.",
      score: 57,
      scoreLabel: "Fair",
      image: "https://incidecoder-content.storage.googleapis.com/4a174042-a2a7-4a1e-bb71-63fa02bc330a/products/kiehls-midnight-recovery-concentrate/kiehls-midnight-recovery-concentrate_front_photo_original.jpeg",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Ingredient Safety",    score: 13, max: 25, note: "5 declared IFRA allergens (Linalool, Limonene, Citral, Citronellol, Geraniol) in a leave-on overnight concentrate. Lavender, Geranium, Rosemary, Coriander essential oils all present. Sclareolide (synthetic ambergris) — fragrance ingredient, mild concern. No parabens." },
        { name: "Irritation Potential", score:  9, max: 20, note: "Highest fragrance allergen burden of any product in this analysis. Five EU-declared allergens in a leave-on overnight product applied to skin undergoing barrier repair cycle. Sensitisation risk is meaningful and cumulative with daily use." },
        { name: "Disclosure Quality",   score: 14, max: 20, note: "All allergens declared as required by EU regulation. INCI is transparent. However, product is marketed as a 'recovery concentrate' — the recovery mechanism is the oil base, not the fragrance, which is not communicated." },
        { name: "Regulatory",           score:  7, max: 10, note: "All allergens disclosed as required. Permitted under current Indian and EU cosmetics regulations. The fragrance load is within legal limits but at the upper end for leave-on products." },
        { name: "Efficacy",             score: 10, max: 15, note: "Rosehip, Evening Primrose, Jojoba, and Squalane are genuinely effective skin oils with barrier support and antioxidant evidence. The oil base delivers real emollient benefits. Cucurmin (Curcuma Longa) and Cucumber Extract add minor antioxidant activity." },
        { name: "Transparency",         score:  4, max: 10, note: "'Recovery Concentrate' positioning implies active skin repair. The meaningful recovery work is done by the plant oils; the essential oil fragrance blend is not a recovery active — this distinction is not made. The price (~₹6,000) is high for a fragrant plant oil blend." },
      ],
      keyActives: [
        { name: "Rosa Canina Fruit Oil (Rosehip)", function: "Rich in linoleic acid, beta-carotene, Vitamin C — barrier repair, hyperpigmentation" },
        { name: "Oenothera Biennis Oil (Evening Primrose)", function: "High in GLA (gamma-linolenic acid) — anti-inflammatory, barrier repair" },
        { name: "Simmondsia Chinensis Oil (Jojoba)", function: "Liquid wax ester — skin-identical, non-comedogenic, emollient" },
        { name: "Squalane", function: "Skin-identical emollient — antioxidant, barrier-supportive" },
      ],
      ingredients: [
        { name: "Caprylic/Capric Triglyceride", note: "Derived from coconut oil — lightweight emollient, non-comedogenic carrier oil", flag: "ok" },
        { name: "Dicaprylyl Carbonate", note: "Lightweight emollient — skin-compatible, spreads well", flag: "ok" },
        { name: "Squalane", note: "Skin-identical emollient — antioxidant, barrier-supportive", flag: "ok" },
        { name: "Rosa Canina Fruit Oil", note: "Rosehip oil — rich in linoleic acid and beta-carotene; barrier repair and brightening evidence", flag: "ok" },
        { name: "Oenothera Biennis Oil", note: "Evening primrose oil — high GLA content; anti-inflammatory, barrier repair", flag: "ok" },
        { name: "Simmondsia Chinensis Oil", note: "Jojoba oil — liquid wax ester, non-comedogenic, excellent carrier", flag: "ok" },
        { name: "Lavandula Angustifolia Oil", note: "Lavender essential oil — fragrance ingredient with Linalool (allergen). No therapeutic skin-repair role", flag: "warn" },
        { name: "Pelargonium Graveolens Flower Oil", note: "Geranium essential oil — fragrance with Citronellol, Geraniol (allergens)", flag: "warn" },
        { name: "Coriandrum Sativum Oil", note: "Coriander seed oil — fragrance ingredient", flag: "warn" },
        { name: "Rosmarinus Officinalis Leaf Oil", note: "Rosemary essential oil — fragrance ingredient", flag: "warn" },
        { name: "Linalool", note: "Fragrance allergen (EU mandatory disclosure) — from Lavender oil", flag: "warn" },
        { name: "Limonene", note: "Fragrance allergen (EU mandatory disclosure)", flag: "warn" },
        { name: "Citral", note: "Fragrance allergen (EU mandatory disclosure)", flag: "warn" },
        { name: "Citronellol", note: "Fragrance allergen (EU mandatory disclosure) — from Geranium oil", flag: "warn" },
        { name: "Geraniol", note: "Fragrance allergen (EU mandatory disclosure) — from Geranium oil", flag: "warn" },
        { name: "Tocopherol", note: "Vitamin E — antioxidant", flag: "ok" },
        { name: "Helianthus Annuus Seed Oil", note: "Sunflower oil — lightweight emollient, high linoleic acid", flag: "ok" },
      ],
      pass_badges: ["INCI Verified", "Rosehip + Evening Primrose"],
      warn_badges: ["5 Declared Fragrance Allergens", "4 Essential Oils in Leave-On"],
      info_badges: [],
      indiaContext:
        "The overnight oil concept is growing in India, but 5 fragrance allergens in a leave-on overnight product is particularly concerning in India's humid climate where skin occlusion under fragrant products increases absorption and sensitisation risk. Indian skin types prone to PIH (very common) should avoid fragrant oils near hyperpigmented areas. The oil base itself is good — a fragrance-free equivalent would score significantly higher.",
    },

    // ─── 5. Powerful-Strength Line-Reducing Concentrate ───────────────────────
    {
      productName: "Powerful-Strength Line-Reducing Concentrate",
      slug: "powerful-strength-line-reducing-concentrate",
      brand: "Kiehl's",
      brandSlug: "kiehls",
      priceRange: "₹5,800–₹6,800",
      productType: "leave-on",
      concern: "Anti-ageing + brightening (Vitamin C)",
      summary:
        "Kiehl's vitamin C serum with a dual-form approach: 10.5% L-Ascorbic Acid (potent, low pH) + 2% Ascorbyl Glucoside (stable derivative). The dual-C system is genuinely well-designed for potency plus stability. However, significant formulation concerns exist: Cyclohexasiloxane (D6 silicone) is EU-restricted for rinse-off products (>0.1% banned since June 2020) — this is a leave-on product so technically still permitted at limited concentrations, but it's a silicone under increasing regulatory and environmental scrutiny. Acrylonitrile/Methyl Methacrylate/Vinylidene Chloride Copolymer is a synthetic polymer (microplastic concern) used as a mattifying agent. Citrus peel oils (Orange and Lemon) plus Limonene and Citral are fragrance ingredients in a product typically used in the morning — phototoxicity and UV sensitisation risk is real.",
      score: 64,
      scoreLabel: "Good",
      image: "https://incidecoder-content.storage.googleapis.com/8bed46ed-5200-4b48-9ada-2b1518fce0c1/products/kiehls-powerful-strength-line-reducing-concentrate/kiehls-powerful-strength-line-reducing-concentrate_front_photo_original.jpeg",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Ingredient Safety",    score: 15, max: 25, note: "Cyclohexasiloxane (D6) — EU-restricted for rinse-off since 2020; in leave-on at restricted levels. Acrylonitrile copolymer — microplastic concern per EU Microplastics Restriction 2023. Citrus oils with Limonene/Citral in a daytime serum — phototoxic potential." },
        { name: "Irritation Potential", score: 12, max: 20, note: "Citrus peel oils (Orange + Lemon) + Limonene + Citral in a daytime product. L-Ascorbic Acid at 10.5% requires low pH (3–3.5) — potential for transient stinging. Combined with citrus oils, irritation and sensitisation risk is elevated." },
        { name: "Disclosure Quality",   score: 15, max: 20, note: "Brand discloses 10.5% L-Ascorbic Acid and 2% Ascorbyl Glucoside — good active transparency. Cyclohexasiloxane and Acrylonitrile copolymer present without comment. Citrus oils disclosed." },
        { name: "Regulatory",           score:  7, max: 10, note: "D6 silicone technically permitted in leave-on at restricted concentration but under increasing EU restrictions. Acrylonitrile copolymer flagged under EU Microplastics Restriction. Otherwise compliant." },
        { name: "Efficacy",             score: 11, max: 15, note: "10.5% L-Ascorbic Acid is clinically potent — well-above threshold for collagen stimulation and antioxidant activity. 2% Ascorbyl Glucoside adds stability buffer. Hydrolyzed Hyaluronic Acid provides hydration. Adenosine adds anti-ageing benefit." },
        { name: "Transparency",         score:  4, max: 10, note: "Marketed as a premium anti-ageing serum without disclosure of D6 silicone regulatory trajectory, microplastic concern in the copolymer, or phototoxicity risk from citrus oils in a daytime product." },
      ],
      keyActives: [
        { name: "L-Ascorbic Acid (10.5%)", function: "Pure Vitamin C — most potent and clinically studied form. Collagen stimulation, antioxidant, brightening" },
        { name: "Ascorbyl Glucoside (2%)", function: "Stable Vitamin C derivative — stabilises and extends activity of L-Ascorbic Acid" },
        { name: "Hydrolyzed Hyaluronic Acid", function: "Low-MW hyaluronic acid — penetrates upper epidermis for hydration" },
        { name: "Adenosine", function: "Anti-ageing, soothing — well studied" },
      ],
      ingredients: [
        { name: "Propylene Glycol", note: "Humectant and solvent for L-Ascorbic Acid delivery", flag: "ok" },
        { name: "Dimethicone", note: "Silicone — texture modifier, film-former", flag: "ok" },
        { name: "Glycerin", note: "Humectant", flag: "ok" },
        { name: "Ascorbic Acid (L-Ascorbic Acid)", note: "Pure Vitamin C — 10.5% brand-confirmed. Most potent form; effective but pH-sensitive", flag: "ok" },
        { name: "Ascorbyl Glucoside", note: "Stable Vitamin C derivative — 2% brand-confirmed. Stabilises and extends activity", flag: "ok" },
        { name: "Cyclohexasiloxane (D6)", note: "Cyclic silicone — EU-restricted for rinse-off products since 2020. In leave-on: technically permitted at restricted levels but under environmental/regulatory scrutiny", flag: "warn" },
        { name: "Acrylonitrile/Methyl Methacrylate/Vinylidene Chloride Copolymer", note: "Synthetic polymer mattifying agent — potential microplastic concern per EU Microplastics Restriction 2023", flag: "warn" },
        { name: "Citrus Aurantium Dulcis Peel Oil", note: "Sweet orange peel oil — fragrance with phototoxic potential (Limonene) in daytime serum", flag: "warn" },
        { name: "Citrus Limon Peel Oil", note: "Lemon peel oil — phototoxic potential; Bergapten content varies by extraction method. In a daytime product, UV sensitisation risk", flag: "warn" },
        { name: "Limonene", note: "Fragrance allergen (EU mandatory disclosure) — from citrus oils. Phototoxic potential", flag: "warn" },
        { name: "Citral", note: "Fragrance allergen (EU mandatory disclosure) — from citrus oils", flag: "warn" },
        { name: "Hydrolyzed Hyaluronic Acid", note: "Low-MW HA — penetrates epidermis for hydration", flag: "ok" },
        { name: "Adenosine", note: "Anti-ageing, soothing", flag: "ok" },
        { name: "Phenoxyethanol", note: "Preservative", flag: "ok" },
      ],
      pass_badges: ["INCI Verified", "10.5% L-Ascorbic Acid", "Dual Vitamin C System"],
      warn_badges: ["D6 Silicone (EU Restricted)", "Citrus Oils in Daytime Product", "Microplastic Concern"],
      info_badges: [],
      indiaContext:
        "A high-potency Vitamin C serum is a high-relevance product for India — UV-induced oxidative stress, hyperpigmentation, and dull skin are among the most common skin concerns. However, using a citrus-oil fragrant daytime Vitamin C in India's intense UV environment compounds phototoxicity risk. Indian consumers using this should follow with broad-spectrum SPF 50+ and avoid applying to broken/reactive skin.",
    },

    // ─── 6. Rare Earth Deep Pore Cleansing Masque ─────────────────────────────
    {
      productName: "Rare Earth Deep Pore Cleansing Masque",
      slug: "rare-earth-deep-pore-cleansing-masque",
      brand: "Kiehl's",
      brandSlug: "kiehls",
      priceRange: "₹2,500–₹3,000",
      productType: "rinse-off",
      concern: "Pore cleansing + oil control",
      summary:
        "Kiehl's cleanest product by score. A kaolin and bentonite clay mask that's fragrance-free, alcohol-free, and paraben-free — with no dyes and no essential oils. Kaolin and Bentonite at positions 2 and 3 confirm high active clay concentrations (these are the product's core function). Glycerin at position 4 prevents the classic problem of clay masks over-drying the skin. Aloe Barbadensis Leaf Juice and Avena Sativa Flour (Oat) provide soothing and skin conditioning. Allantoin adds anti-irritant activity. This is a well-formulated, clean clay mask with appropriate ingredients at appropriate positions.",
      score: 83,
      scoreLabel: "Good",
      image: "https://incidecoder-content.storage.googleapis.com/3699a90a-653e-4e75-a483-51ae681e15ce/products/kiehls-rare-earth-deep-pore-cleansing-masque/kiehls-rare-earth-deep-pore-cleansing-masque_front_photo_original.jpeg",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Ingredient Safety",    score: 22, max: 25, note: "No fragrance, no parabens, no dyes, no essential oils. Ceteareth-20 is a PEG-derived emulsifier — mild concern re: ethylene oxide potential (industry standard issue). Titanium Dioxide (CI 77891) is a mineral pigment — safe, inert." },
        { name: "Irritation Potential", score: 18, max: 20, note: "Fragrance-free. No alcohol. Aloe + Oat + Allantoin actively buffer the clay's drying effect. Rinse-off format reduces contact time. Very low irritation risk for a clay mask." },
        { name: "Disclosure Quality",   score: 16, max: 20, note: "INCI published. Clay types (Kaolin and Bentonite — different mineral structures) both listed. No concentration disclosure." },
        { name: "Regulatory",           score:  9, max: 10, note: "Fully compliant. Clay minerals are unrestricted globally. All ingredients within Indian and EU regulations." },
        { name: "Efficacy",             score: 12, max: 15, note: "Kaolin and Bentonite are well-studied clay minerals with genuine oil-absorption and pore-cleansing evidence. High INCI positions confirm meaningful concentrations. Glycerin mitigates over-drying. This is a product that does what it says." },
        { name: "Transparency",         score:  6, max: 10, note: "'Rare Earth' branding — the 'rare earth' is Amazonian White Clay, which is essentially Kaolin. This is not a misleading claim but is a marketing embellishment of a common ingredient." },
      ],
      keyActives: [
        { name: "Kaolin", function: "Mineral clay — absorbs sebum, draws out impurities, mild physical exfoliant" },
        { name: "Bentonite", function: "Swelling clay — absorbs excess oil, antimicrobial, deep pore cleansing" },
        { name: "Aloe Barbadensis Leaf Juice", function: "Soothing, anti-inflammatory — mitigates clay mask dryness" },
        { name: "Avena Sativa Flour (Oat)", function: "Avenanthramides — anti-inflammatory, skin-conditioning" },
        { name: "Allantoin", function: "Anti-irritant, soothing, buffers clay irritation" },
      ],
      ingredients: [
        { name: "Water", note: "Solvent base", flag: "ok" },
        { name: "Kaolin", note: "White clay mineral — oil absorption, pore cleansing at position 2 confirms high concentration", flag: "ok" },
        { name: "Bentonite", note: "Swelling clay — deep oil absorption, antimicrobial; high concentration confirmed at position 3", flag: "ok" },
        { name: "Propanediol", note: "Plant-derived humectant/solvent", flag: "ok" },
        { name: "Glycerin", note: "Humectant — prevents excessive drying from clay", flag: "ok" },
        { name: "CI 77891 (Titanium Dioxide)", note: "Mineral pigment — inert, white colour. Not a photocatalytic concern at cosmetic use concentrations", flag: "ok" },
        { name: "Caprylic/Capric Triglyceride", note: "Emollient — skin conditioning, prevents over-stripping", flag: "ok" },
        { name: "Cetearyl Alcohol", note: "Fatty alcohol — emulsifier/thickener, non-drying", flag: "ok" },
        { name: "Zea Mays Starch (Corn Starch)", note: "Oil-absorbing powder — adds mattifying texture", flag: "ok" },
        { name: "Ceteareth-20", note: "PEG-derived emulsifier — standard use; trace ethylene oxide potential (industry-wide issue)", flag: "info" },
        { name: "Xanthan Gum", note: "Natural polysaccharide thickener", flag: "ok" },
        { name: "Aloe Barbadensis Leaf Juice", note: "Soothing, anti-inflammatory — buffers clay's astringency", flag: "ok" },
        { name: "Avena Sativa Flour", note: "Colloidal oat — anti-inflammatory, skin-conditioning", flag: "ok" },
        { name: "Allantoin", note: "Anti-irritant, soothing", flag: "ok" },
        { name: "Tocopherol", note: "Vitamin E — antioxidant", flag: "ok" },
        { name: "Lecithin", note: "Phospholipid emulsifier — skin-compatible, barrier-supportive", flag: "ok" },
        { name: "Phenoxyethanol", note: "Preservative", flag: "ok" },
        { name: "Caprylyl Glycol", note: "Humectant and co-preservative", flag: "ok" },
        { name: "Ethylhexylglycerin", note: "Co-preservative, skin conditioning", flag: "ok" },
      ],
      pass_badges: ["Fragrance Free", "No Parabens", "No Dyes", "INCI Verified", "Dual Clay Formula"],
      warn_badges: [],
      info_badges: ["Ceteareth-20 (PEG Emulsifier)"],
      indiaContext:
        "Oiliness, enlarged pores, and clogged pores are among the most common skin complaints in India due to heat and humidity. A clay mask 1–2× weekly is a well-evidenced approach. This is among the cleanest clay masks at the premium price point and a good Kiehl's recommendation for Indian consumers.",
    },

    // ─── 7. Creamy Eye Treatment with Avocado ─────────────────────────────────
    {
      productName: "Creamy Eye Treatment with Avocado",
      slug: "creamy-eye-treatment-with-avocado",
      brand: "Kiehl's",
      brandSlug: "kiehls",
      priceRange: "₹3,200–₹3,800",
      productType: "leave-on",
      concern: "Eye area hydration",
      summary:
        "One of Kiehl's most iconic and long-standing products — and the one most in need of a formula update. The Creamy Eye Treatment contains four parabens: Methylparaben, Ethylparaben, Propylparaben, and Butylparaben. Butylparaben is the most scrutinised of the paraben family — it has the highest lipophilicity, longest half-life, and the greatest endocrine disruption potential in in-vitro studies. While the EU SCCS concluded Butylparaben is safe at current cosmetic use levels (re-evaluated 2023), it has been removed from most modern eye cream formulations, and its presence in a product applied daily to the periocular area (thin, vascular skin) is worth flagging. The avocado oil and shea butter base is genuinely emollient for the eye area, but this is a heritage formula that hasn't been modernised.",
      score: 60,
      scoreLabel: "Good",
      image: "https://incidecoder-content.storage.googleapis.com/d8bf8e08-cb2c-483a-971e-764d7ebda411/products/kiehls-creamy-eye-treatment-with-avocado/kiehls-creamy-eye-treatment-with-avocado_front_photo_original.jpeg",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Ingredient Safety",    score: 14, max: 25, note: "Four parabens: Methylparaben, Ethylparaben, Propylparaben, and Butylparaben. Butylparaben has the highest endocrine disruption concern in the paraben family. Daily periocular application to thin, vascular skin warrants attention. EU SCCS approved at current levels (2023 re-evaluation) but industry trend is strongly away from Butylparaben." },
        { name: "Irritation Potential", score: 10, max: 20, note: "No fragrance, no essential oils — positives. Four parabens including Butylparaben are sensitisers in paraben-allergic individuals. Isopropyl Palmitate (position 20) has reported comedogenicity relevant to milia under eyes. Ozokerite (petroleum-derived wax) is occlusive." },
        { name: "Disclosure Quality",   score: 15, max: 20, note: "INCI fully published. All four parabens clearly listed. No attempt to obscure. Product is honest in disclosure even if the formula is dated." },
        { name: "Regulatory",           score:  8, max: 10, note: "All four parabens are currently permitted. Butylparaben is restricted in Europe for products on children <3yr and in the nappy area — not applicable here. EU SCCS 2023 re-evaluation deemed safe at current cosmetic use levels." },
        { name: "Efficacy",             score:  9, max: 15, note: "Butyrospermum Parkii (Shea Butter) + Persea Gratissima Oil (Avocado) provide genuine emolliency for the dry periocular area. Sodium PCA is a natural humectant. Copper PCA may contribute mild antioxidant activity. No peptides, retinoids, or other contemporary anti-ageing actives — this is primarily a moisturising eye cream." },
        { name: "Transparency",         score:  4, max: 10, note: "A legacy formula sold at premium price without acknowledging its dated preservative system. Many consumers purchasing this expect a modern, safe formulation for the delicate eye area." },
      ],
      keyActives: [
        { name: "Butyrospermum Parkii Butter (Shea)", function: "Rich emollient — skin barrier, anti-inflammatory, moisturising" },
        { name: "Persea Gratissima Oil (Avocado)", function: "Emollient — high in oleic acid and Vitamin E; skin-softening" },
        { name: "Sodium PCA", function: "Natural humectant (part of skin's NMF) — moisture retention" },
        { name: "Tocopheryl Acetate", function: "Vitamin E ester — antioxidant" },
      ],
      ingredients: [
        { name: "Water", note: "Solvent base", flag: "ok" },
        { name: "Butyrospermum Parkii Butter", note: "Shea butter — emollient, anti-inflammatory, excellent for dry skin", flag: "ok" },
        { name: "Butylene Glycol", note: "Humectant and solvent", flag: "ok" },
        { name: "Persea Gratissima Oil", note: "Avocado oil — emollient, high oleic acid", flag: "ok" },
        { name: "Sodium PCA", note: "Natural humectant (NMF component) — moisture retention", flag: "ok" },
        { name: "Copper PCA", note: "Trace mineral — antioxidant, potential wound-healing support", flag: "ok" },
        { name: "Ozokerite", note: "Petroleum-derived mineral wax — occlusive thickener. No safety concern at cosmetic use", flag: "info" },
        { name: "Methylparaben", note: "Paraben preservative — widely studied, safe at cosmetic use; lowest concern in paraben family", flag: "info" },
        { name: "Ethylparaben", note: "Paraben preservative — low concern, short half-life", flag: "info" },
        { name: "Propylparaben", note: "Paraben preservative — moderate concern; restricted in some applications; removed by most modern brands", flag: "warn" },
        { name: "Butylparaben", note: "Paraben preservative — highest endocrine disruption concern in paraben family. Lipophilic, long half-life. Daily periocular use warrants attention. EU SCCS approved (2023) but industry trend strongly away from this ingredient", flag: "warn" },
        { name: "Isopropyl Palmitate", note: "Ester emollient — some reported comedogenicity; relevant to milia under the eye", flag: "info" },
        { name: "Tocopheryl Acetate", note: "Vitamin E ester — antioxidant", flag: "ok" },
        { name: "Phenoxyethanol", note: "Preservative", flag: "ok" },
        { name: "Zea Mays Oil", note: "Corn oil — emollient", flag: "ok" },
        { name: "Beta-Carotene", note: "Pro-vitamin A antioxidant — minor antioxidant activity, adds colour", flag: "ok" },
      ],
      pass_badges: ["Fragrance Free", "INCI Verified"],
      warn_badges: ["4 Parabens Including Butylparaben"],
      info_badges: ["Heritage Formula — Not Updated"],
      indiaContext:
        "Eye creams are a high-purchase category in India, often bought as gifting items due to Kiehl's brand prestige. The paraben system in this formula — particularly Butylparaben — is worth flagging for consumers who are vigilant about their skincare. Modern alternatives with cleaner preservative systems exist at the same price point.",
    },

    // ─── 8. Ultra Facial Cleanser ─────────────────────────────────────────────
    {
      productName: "Ultra Facial Cleanser",
      slug: "ultra-facial-cleanser",
      brand: "Kiehl's",
      brandSlug: "kiehls",
      priceRange: "₹1,900–₹2,500",
      productType: "rinse-off",
      concern: "Daily face cleansing",
      summary:
        "The Ultra Facial Cleanser leads with Sodium Laureth Sulfate (SLES) at position 2 — a strong anionic surfactant that, while widely used, can strip the skin's natural barrier with daily use compared to gentler alternatives (Sodium Lauroyl Sarcosinate, Amino Acid surfactants). The formula also contains three parabens (Methylparaben, Propylparaben, Sodium Methylparaben) and Polyaminopropyl Biguanide (PHMB) — an antimicrobial preservative that has been restricted in EU rinse-off cosmetics at >0.1% since 2019. Positives: the formula includes squalane, sweet almond oil, and avocado oil for skin conditioning. But as a daily face wash for a premium brand, the SLES + parabens + PHMB combination reflects formulation choices that have been updated by most modern skincare brands.",
      score: 58,
      scoreLabel: "Fair",
      image: "https://incidecoder-content.storage.googleapis.com/f0524f41-1571-405d-9013-57debfdaf823/products/kiehls-ultra-facial-cleanser/kiehls-ultra-facial-cleanser_front_photo_original.jpeg",
      analyzedAt: "2026-05-18",
      pillars: [
        { name: "Ingredient Safety",    score: 14, max: 25, note: "Polyaminopropyl Biguanide (PHMB) — EU restricted in rinse-off cosmetics at >0.1% since 2019. 3 parabens including Propylparaben. SLES at position 2. Triethanolamine (potential nitrosamine formation at high concentration, though low risk in neutral pH). Multiple concerning ingredients in a single daily-use cleanser." },
        { name: "Irritation Potential", score: 10, max: 20, note: "SLES is significantly more irritating than amino acid surfactants or glucosides. Daily barrier disruption risk. PHMB has reported contact sensitisation data. Paraben combination adds allergen risk for sensitive individuals." },
        { name: "Disclosure Quality",   score: 14, max: 20, note: "INCI fully published. All ingredients visible. PHMB is disclosed but its EU restriction is not communicated. Parabens are named clearly." },
        { name: "Regulatory",           score:  6, max: 10, note: "PHMB in rinse-off products is restricted by EU since 2019 — this product may not be compliant for EU sale at current concentration. Indian regulations may not have this specific restriction. Needs verification on current market status." },
        { name: "Efficacy",             score: 10, max: 15, note: "SLES effectively cleanses. Decyl Glucoside and Cocamidopropyl Betaine add mildness. Conditioning oils (Squalane, Almond, Apricot, Avocado) provide post-wash skin feel. The cleanser does its primary job." },
        { name: "Transparency",         score:  4, max: 10, note: "Premium brand positioning without disclosure of PHMB's EU restriction status, paraben presence, or SLES as primary surfactant vs. gentler alternatives." },
      ],
      keyActives: [
        { name: "Squalane", function: "Skin-conditioning in rinse-off context — reduces post-wash tightness" },
        { name: "Prunus Amygdalus Dulcis Oil (Sweet Almond)", function: "Emollient — skin conditioning after cleanse" },
        { name: "Ascorbyl Glucoside", function: "Stable Vitamin C derivative — trace antioxidant activity in rinse-off" },
      ],
      ingredients: [
        { name: "Water", note: "Solvent base", flag: "ok" },
        { name: "Sodium Laureth Sulfate (SLES)", note: "Primary anionic surfactant — effective cleanser but stronger than amino acid alternatives. Daily use may disrupt skin barrier over time", flag: "warn" },
        { name: "Decyl Glucoside", note: "Mild non-ionic surfactant — gentles the SLES system", flag: "ok" },
        { name: "Glycerin", note: "Humectant", flag: "ok" },
        { name: "Cocamidopropyl Betaine", note: "Amphoteric surfactant — foam booster, mild, reduces irritation", flag: "ok" },
        { name: "Polyaminopropyl Biguanide (PHMB)", note: "Antimicrobial preservative — EU-restricted in rinse-off cosmetics at >0.1% since 2019. Documented contact sensitisation in some studies.", flag: "warn" },
        { name: "Methylparaben", note: "Paraben preservative — lowest concern in paraben family", flag: "info" },
        { name: "Propylparaben", note: "Paraben preservative — removed by most modern brands for leave-on; less concerning in rinse-off", flag: "info" },
        { name: "Sodium Methylparaben", note: "Sodium salt of Methylparaben — preservative", flag: "info" },
        { name: "Triethanolamine", note: "pH adjuster — potential nitrosamine formation concern at high concentration; low risk at neutral pH in this context", flag: "info" },
        { name: "Squalane", note: "Skin-conditioning emollient — reduces post-wash tightness", flag: "ok" },
        { name: "Prunus Amygdalus Dulcis Oil", note: "Sweet almond oil — conditioning", flag: "ok" },
        { name: "Prunus Armeniaca Kernel Oil", note: "Apricot kernel oil — conditioning", flag: "ok" },
        { name: "Tocopherol", note: "Vitamin E — antioxidant", flag: "ok" },
        { name: "Ascorbyl Glucoside", note: "Vitamin C derivative — trace concentration in rinse-off, limited efficacy contribution", flag: "ok" },
        { name: "Persea Gratissima Oil", note: "Avocado oil — conditioning", flag: "ok" },
        { name: "Phenoxyethanol", note: "Preservative", flag: "ok" },
        { name: "Ethylhexylglycerin", note: "Co-preservative", flag: "ok" },
      ],
      pass_badges: ["INCI Verified"],
      warn_badges: ["SLES Primary Surfactant", "PHMB (EU Restricted Preservative)", "3 Parabens"],
      info_badges: [],
      indiaContext:
        "Daily cleansing is a cornerstone of Indian skincare routines. SLES-based cleansers are widely used but strip the skin's acid mantle — particularly relevant in India's hard water conditions where lather-heavy cleansers are often overused. Indian consumers switching from SLES-based cleansers to amino acid or glucoside surfactant systems typically report significant improvement in skin texture and sensitivity. This cleanser does not represent the best formulation tier for its price point.",
    },
  ],
};
