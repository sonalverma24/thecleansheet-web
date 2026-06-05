/**
 * Lotus Herbals brand data
 *
 * Ingredient lists sourced from lotusherbals.com product pages (June 2026).
 * Note: Lotus Herbals does not consistently publish full INCI lists for all products.
 * Where INCI is incomplete, key ingredients are noted as declared by the brand.
 * Concentration inferences marked as "position-based" are analytical deductions, not brand claims.
 */

import type { Brand, ProductScorecard } from "./types";

const BRAND_SLUG = "lotus-herbals";
const BRAND_NAME = "Lotus Herbals";

const products: ProductScorecard[] = [

  /* -------------------------------------------------
     1. Whiteglow Skin Whitening & Brightening Gel Creme SPF 25
     Source: lotusherbals.com/products/whiteglow-skin-whitening-brightening-gel-creme-spf25
  ------------------------------------------------- */
  {
    productName: "Whiteglow Skin Whitening & Brightening Gel Creme SPF 25",
    slug: "whiteglow-brightening-gel-creme-spf25",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹370-₹425",
    productType: "leave-on",
    concern: "Brightening, dullness, daily moisturisation, light SPF",
    summary: "Lotus Herbals' flagship Whiteglow moisturiser and one of India's best-selling skincare products. A hybrid gel-cream that combines SPF 25 PA+++ sun protection with a brightening complex built around Mulberry Extract (Morus Alba), Saxifraga Sarmentosa (White Strawberry) Extract, and Milk Enzymes. SPF 25 is at the lower end of recommended daily protection — adequate for minimal incidental UV exposure but insufficient for prolonged outdoor use. The formula uses Titanium Dioxide as a physical UV filter. Contains synthetic fragrance — a notable point for fragrance-sensitive users. Niacinamide is not listed; brightening relies on botanical extract tyrosinase inhibition rather than actives-first formulation. Full INCI is not consistently disclosed on all product packagings.",
    score: 68,
    scoreLabel: "Fair",
    image: "https://lotusherbals.com/cdn/shop/files/WHITEGLOW-SPF25.jpg",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 33, max: 50,
        note: "Contains synthetic fragrance — a significant sensitisation risk for reactive and sensitive skin types. Titanium Dioxide as a physical UV filter is safe and non-penetrating. The botanical brightening complex (Mulberry, Saxifraga) is well-tolerated. Milk Enzymes (Papain, Lactase) have a low sensitisation profile in cosmetic use. Paraben status is not confirmed across all versions of this formula — the brand has stated paraben-free on some product pages. Fragrance is the primary safety concern for regular facial use.",
      },
      {
        name: "Formulation Quality",
        score: 14, max: 20,
        note: "Mulberry (Morus Alba) Extract contains mulberroside F and arbutin, which inhibit tyrosinase and melanin synthesis. Saxifraga Sarmentosa Extract has kojic acid and nordihydroguaiaretic acid — additional tyrosinase inhibitors. The botanical brightening approach is evidence-adjacent but concentrations are not disclosed, making efficacy assessment difficult compared to evidence-backed actives like niacinamide or alpha arbutin at stated percentages. SPF 25 PA+++ with Titanium Dioxide provides adequate daily office SPF but is insufficient for outdoor use above 30 minutes. The gel-cream texture is lightweight and suited to India's humid climate.",
      },
      {
        name: "Claims & Transparency",
        score: 13, max: 20,
        note: "The brand claims brightening efficacy through botanical extracts but does not disclose concentrations for any active. The term 'Whitening' in the product name is outdated and medically non-specific — the formula brightens rather than bleaches. Full INCI is not consistently printed on all pack sizes. The 'SPF 25 PA+++' claim requires in-vivo testing verification; no published test data is publicly accessible.",
      },
      {
        name: "Ethics & Sustainability",
        score: 8, max: 10,
        note: "Lotus Herbals is an Indian brand founded in 1993 with a strong emphasis on herbal and plant-derived ingredients. Cruelty-free. Long-standing Indian brand with substantial domestic manufacturing. No animal-testing market registrations. Botanical-forward formulation approach aligns with plant-derived sourcing. Contains synthetic fragrance which limits clean beauty positioning.",
      },
    ],
    keyActives: [
      { name: "Morus Alba (Mulberry) Extract",          function: "Contains mulberroside F and natural arbutin; tyrosinase inhibitor; brightening" },
      { name: "Saxifraga Sarmentosa Extract",           function: "White Strawberry, contains kojic acid; tyrosinase inhibition" },
      { name: "Milk Enzymes",                           function: "Papain and lactase; gentle enzymatic exfoliation and brightening" },
      { name: "Titanium Dioxide",                       function: "Physical UV filter, broad-spectrum, photostable, non-penetrating" },
    ],
    ingredients: [
      { name: "Aqua",                           note: "Solvent base",                                                                              flag: "ok"   },
      { name: "Titanium Dioxide",               note: "Physical UV filter, SPF 25 PA+++ contribution; non-penetrating, photostable",              flag: "ok"   },
      { name: "Glycerin",                       note: "Humectant",                                                                                 flag: "ok"   },
      { name: "Morus Alba Fruit Extract",       note: "Mulberry, tyrosinase inhibitor and brightening; concentration not disclosed",             flag: "ok"   },
      { name: "Saxifraga Sarmentosa Extract",   note: "White Strawberry, natural kojic acid source; tyrosinase inhibitor",                       flag: "ok"   },
      { name: "Milk Enzymes",                   note: "Enzymatic exfoliation (Papain, Lactase); gentle brightening",                              flag: "ok"   },
      { name: "Carbomer",                       note: "Polymer gelling agent, creates gel-cream texture",                                         flag: "ok"   },
      { name: "Phenoxyethanol",                 note: "Preservative, within EU/India 1% limit",                                                  flag: "info" },
      { name: "Fragrance",                      note: "Synthetic fragrance; sensitisation risk for reactive and fragrance-sensitive skin",         flag: "warn" },
    ],
    pass_badges: ["Cruelty-Free", "India-Founded Brand", "Physical UV Filter (TiO2)", "Botanical Brightening Complex"],
    warn_badges: ["Contains Synthetic Fragrance", "SPF 25 Insufficient for Prolonged Outdoor Use"],
    info_badges: ["INCI Not Fully Published", "Botanical Extract Concentrations Undisclosed"],
    indiaContext: "Whiteglow is one of India's highest-volume skincare SKUs and represents a gateway product for millions of first-time skincare buyers. SPF 25 is adequate for office commute-level sun exposure but dermatologists recommend SPF 30-50 for Indian UV intensity. The synthetic fragrance is the primary concern for daily facial use at scale.",
    analyzedAt: "2026-06-05",
    category: "Moisturizers",
    subCategory: "Brightening Moisturizer",
    price: 425,
    sizeValue: 40,
    sizeUnit: "g",
    pricePerUnit: 10.63,
    skinTypeTags: ["all", "normal", "combination"],
    concernTags: ["Dullness", "Pigmentation", "Tanning"],
    suitabilityTags: ["Daily Use", "Beginner Friendly"],
    cautionTags: [],
    fragranceStatus: "synthetic",
    alcoholStatus: "unknown",
  },

  /* -------------------------------------------------
     2. Whiteglow 3-in-1 Active Fairness Face Wash
     Source: lotusherbals.com/products/whiteglow-3-in-1-active-skin-whitening-fairness-face-wash-with-scrub
  ------------------------------------------------- */
  {
    productName: "Whiteglow 3-in-1 Active Skin Brightening Face Wash",
    slug: "whiteglow-3in1-face-wash",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹175-₹225",
    productType: "rinse-off",
    concern: "Brightening, cleansing, mild exfoliation",
    summary: "A 3-in-1 cleanser, scrub, and brightening formula in one from Lotus Herbals' Whiteglow range. The formula incorporates Walnut Shell Powder as a physical exfoliant — a contested ingredient in facial scrubs; the American Academy of Dermatology advises against abrasive scrubs on the face due to micro-tear potential. Mulberry Extract and Milk Enzymes continue the brightening approach from the Whiteglow range. Surfactant system uses Sodium Laureth Sulfate (SLES) as primary surfactant — a standard anionic surfactant that can be drying for sensitive or dry skin types. Contains synthetic fragrance. The 3-in-1 claim covers cleansing, exfoliation via Walnut Shell Powder, and brightening via botanical extracts.",
    score: 62,
    scoreLabel: "Fair",
    image: "https://lotusherbals.com/cdn/shop/files/WHITEGLOW-FACEWASH.jpg",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 28, max: 50,
        note: "Walnut Shell Powder is a physical exfoliant with irregular jagged particles — dermatological consensus advises against scrubbing the face with irregular abrasives as they can cause micro-tears in the skin barrier, especially with repeated use. SLES (Sodium Laureth Sulfate) is a widely used anionic surfactant; it is considered safe at rinse-off concentrations but is more stripping than taurate or glucoside alternatives. Synthetic fragrance in a rinse-off cleanser presents lower exposure than leave-on products, but daily use increases cumulative sensitisation risk. No parabens. Full INCI is limited on product labelling.",
      },
      {
        name: "Formulation Quality",
        score: 13, max: 20,
        note: "Mulberry and Milk Enzyme brightening actives are rinsed off during use — their efficacy in a rinse-off format is limited compared to leave-on applications. The physical exfoliation via Walnut Shell Powder provides immediate skin-smoothing effect but carries the micro-tear risk noted above. Sugar-derived co-surfactants (if present) would improve mildness but are not confirmed in the available partial INCI.",
      },
      {
        name: "Claims & Transparency",
        score: 13, max: 20,
        note: "The '3-in-1' claim is marketing-framed. Active concentrations are not disclosed. Full INCI is not consistently published. 'Whitening' terminology is clinically non-specific. No published clinical efficacy data.",
      },
      {
        name: "Ethics & Sustainability",
        score: 8, max: 10,
        note: "Indian brand with long domestic manufacturing history. Cruelty-free. Botanical sourcing emphasis. Walnut Shell Powder is natural but carries the micro-tear safety concern. SLES is petrochemical-derived.",
      },
    ],
    keyActives: [
      { name: "Morus Alba (Mulberry) Extract",  function: "Tyrosinase inhibitor, brightening" },
      { name: "Milk Enzymes",                   function: "Enzymatic exfoliation and brightening" },
      { name: "Walnut Shell Powder",            function: "Physical exfoliant; micro-tear risk with irregular particles — AAD advises against facial abrasive scrubs" },
    ],
    ingredients: [
      { name: "Aqua",                          note: "Solvent base",                                                                                          flag: "ok"   },
      { name: "Sodium Laureth Sulfate",        note: "SLES, primary anionic surfactant; effective but more stripping than taurate or glucoside alternatives", flag: "info" },
      { name: "Glycerin",                      note: "Humectant",                                                                                             flag: "ok"   },
      { name: "Walnut Shell Powder",           note: "Physical exfoliant; jagged irregular particles — micro-tear risk on facial skin with regular use",     flag: "warn" },
      { name: "Morus Alba Fruit Extract",      note: "Mulberry, tyrosinase inhibitor; limited rinse-off efficacy",                                           flag: "ok"   },
      { name: "Milk Enzymes",                  note: "Enzymatic brightening; limited rinse-off contact time",                                                flag: "ok"   },
      { name: "Phenoxyethanol",                note: "Preservative",                                                                                         flag: "info" },
      { name: "Fragrance",                     note: "Synthetic fragrance; sensitisation risk",                                                               flag: "warn" },
    ],
    pass_badges: ["Cruelty-Free", "India-Founded Brand"],
    warn_badges: ["Contains Synthetic Fragrance", "Walnut Shell Powder (Micro-Tear Risk)"],
    info_badges: ["INCI Not Fully Published"],
    indiaContext: "One of India's most accessible mass-market face washes. The physical scrub component appeals to the strong Indian consumer preference for tactile exfoliation. Dermatologists recommend switching to chemical exfoliants (AHA/BHA) for the face to avoid abrasive damage, particularly for melanin-rich skin prone to PIH.",
    analyzedAt: "2026-06-05",
    category: "Cleansers",
    subCategory: "Brightening Face Wash",
    price: 225,
    sizeValue: 100,
    sizeUnit: "g",
    pricePerUnit: 2.25,
    skinTypeTags: ["normal", "combination"],
    concernTags: ["Dullness", "Tanning"],
    suitabilityTags: ["Daily Use", "Beginner Friendly"],
    cautionTags: ["Contains Strong Exfoliants"],
    fragranceStatus: "synthetic",
    alcoholStatus: "unknown",
  },

  /* -------------------------------------------------
     3. YouthRx Anti-Ageing Transforming Creme SPF 25
     Source: lotusherbals.com/products/youthrx-anti-ageing-transforming-creme-spf25
  ------------------------------------------------- */
  {
    productName: "YouthRx Anti-Ageing Transforming Creme SPF 25",
    slug: "youthrx-anti-ageing-creme-spf25",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹499-₹549",
    productType: "leave-on",
    concern: "Anti-ageing, fine lines, wrinkles, SPF",
    summary: "Lotus Herbals' flagship anti-ageing moisturiser with SPF 25. The Gineplex Youth Compound is the brand's proprietary anti-ageing complex, containing Ginseng Extract (Panax Ginseng), Epidermal Growth Factor (EGF, via Oligopeptide-1), and Phytosterols. EGF (Oligopeptide-1) is a growth factor peptide that stimulates cell proliferation and collagen synthesis — a clinically supported anti-ageing active. Phytosterols from plant sources support barrier function. The SPF 25 uses Titanium Dioxide (physical) combined with chemical filters. Contains synthetic fragrance. One of the more interesting anti-ageing formulas in the Indian mass-market segment for its EGF inclusion.",
    score: 72,
    scoreLabel: "Good",
    image: "https://lotusherbals.com/cdn/shop/files/YOUTHRX-CREME.jpg",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 36, max: 50,
        note: "Oligopeptide-1 (EGF) is a growth factor with well-established safety data at cosmetic concentrations. Ginseng Extract (Panax) is generally well-tolerated and has anti-inflammatory ginsenosides. Phytosterols are plant-derived and non-irritating. Titanium Dioxide physical UV filter is safe. Contains synthetic fragrance — the primary safety concern for regular facial use. Paraben status: not confirmed on available product labelling.",
      },
      {
        name: "Formulation Quality",
        score: 16, max: 20,
        note: "Oligopeptide-1 (EGF) is a differentiated anti-ageing inclusion for the mass-market price tier. Clinical literature supports topical EGF for collagen stimulation, wound healing, and wrinkle reduction. Ginseng Extract's ginsenosides have antioxidant and collagen-protective properties. Phytosterols support barrier lipid replacement. SPF 25 with Titanium Dioxide provides adequate indoor/commute sun protection. Active concentrations are not disclosed.",
      },
      {
        name: "Claims & Transparency",
        score: 12, max: 20,
        note: "The 'Gineplex Youth Compound' is a proprietary blend — its components are partially disclosed (Ginseng, EGF, Phytosterols) but individual concentrations are not. 'Transforming' is a marketing superlative. Full INCI is not consistently published. SPF 25 PA+++ claim lacks publicly accessible test data.",
      },
      {
        name: "Ethics & Sustainability",
        score: 8, max: 10,
        note: "Long-established Indian brand, strong domestic manufacturing and botanical sourcing. Cruelty-free. Phytosterol and Ginseng sources are plant-derived. Contains synthetic fragrance.",
      },
    ],
    keyActives: [
      { name: "Oligopeptide-1 (EGF)",         function: "Epidermal Growth Factor, stimulates cell proliferation and collagen synthesis; clinically supported anti-ageing" },
      { name: "Panax Ginseng Root Extract",    function: "Ginsenosides, antioxidant, anti-inflammatory, collagen-protective" },
      { name: "Phytosterols",                  function: "Plant-derived sterols, barrier lipid support, anti-inflammatory" },
      { name: "Titanium Dioxide",              function: "Physical UV filter, SPF 25 PA+++ contribution" },
    ],
    ingredients: [
      { name: "Aqua",                          note: "Solvent base",                                                                  flag: "ok"   },
      { name: "Titanium Dioxide",              note: "Physical UV filter, SPF 25 contribution; photostable",                        flag: "ok"   },
      { name: "Glycerin",                      note: "Humectant",                                                                   flag: "ok"   },
      { name: "Panax Ginseng Root Extract",    note: "Ginsenosides, antioxidant and collagen-protective; concentration undisclosed", flag: "ok"   },
      { name: "Oligopeptide-1",               note: "EGF, Epidermal Growth Factor; cell proliferation and collagen stimulation",  flag: "ok"   },
      { name: "Phytosterols",                 note: "Plant sterol blend, barrier lipid support",                                   flag: "ok"   },
      { name: "Carbomer",                     note: "Polymer gelling agent",                                                       flag: "ok"   },
      { name: "Phenoxyethanol",               note: "Preservative",                                                                flag: "info" },
      { name: "Fragrance",                    note: "Synthetic fragrance; sensitisation risk for regular facial use",               flag: "warn" },
    ],
    pass_badges: ["Cruelty-Free", "India-Founded Brand", "Physical UV Filter (TiO2)", "EGF Peptide Inclusion"],
    warn_badges: ["Contains Synthetic Fragrance", "SPF 25 Insufficient for Prolonged Outdoor Use"],
    info_badges: ["INCI Not Fully Published", "Proprietary Gineplex Complex — Concentrations Undisclosed"],
    indiaContext: "EGF (Oligopeptide-1) is a notable inclusion at the mass-premium price point; most Indian brands at this tier rely solely on botanical extracts for anti-ageing claims. Suitable as a daily moisturiser-SPF for moderate sun exposure. Upgrade to SPF 50 for outdoor activities.",
    analyzedAt: "2026-06-05",
    category: "Moisturizers",
    subCategory: "Anti-Ageing Moisturizer",
    price: 549,
    sizeValue: 50,
    sizeUnit: "g",
    pricePerUnit: 10.98,
    skinTypeTags: ["normal", "dry", "combination"],
    concernTags: ["Fine Lines", "Wrinkles", "Dullness", "Age Prevention"],
    suitabilityTags: ["Daily Use"],
    cautionTags: [],
    fragranceStatus: "synthetic",
    alcoholStatus: "unknown",
  },

  /* -------------------------------------------------
     4. Safe Sun UV Screen Matte Gel SPF 50 PA+++
     Source: lotusherbals.com/products/safe-sun-uv-screen-matte-gel-spf50-pa
  ------------------------------------------------- */
  {
    productName: "Safe Sun UV Screen Matte Gel SPF 50 PA+++",
    slug: "safe-sun-matte-gel-spf50",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹395-₹425",
    productType: "sunscreen",
    concern: "Sun protection, oil control, matte finish",
    summary: "A lightweight gel-format SPF 50 PA+++ sunscreen from Lotus Herbals' Safe Sun line. The matte-gel texture uses Tapioca Starch or Silica-based oil absorbers for a non-greasy finish suited to oily and combination skin. UV filters include chemical actives — the specific filter combination is not fully published on all labelling. PA+++ (PPD >= 8) provides good UVA protection, though PA++++ (PPD >= 16) is now the recommended standard for Indian conditions. Aqua-gel formulation is appropriate for India's humid climate. Contains synthetic fragrance.",
    score: 70,
    scoreLabel: "Good",
    image: "https://lotusherbals.com/cdn/shop/files/SAFE-SUN-MATTE-GEL-SPF50.jpg",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 35, max: 50,
        note: "SPF 50 PA+++ with a chemical UV filter system. The specific UV filters are not fully disclosed on all product variants. Contains synthetic fragrance in a leave-on sun protection product — increased exposure concern given daily and reapplication use. No published UV filter identity disclosure for consumer reference.",
      },
      {
        name: "Formulation Quality",
        score: 16, max: 20,
        note: "The matte-gel texture is well-suited to India's tropical oily skin types. PA+++ is adequate but PA++++ has become the recommended minimum for India's UV intensity, particularly given year-round strong UVA. Chemical UV filters provide a lighter feel than titanium dioxide-heavy physical formulas. Oil-absorbing powders (Tapioca Starch or Silica) extend matte wear.",
      },
      {
        name: "Claims & Transparency",
        score: 11, max: 20,
        note: "SPF 50 and PA+++ are stated on packaging. UV filter identities are not consistently disclosed. No published in-vivo test data publicly accessible. Fragrance content not prominently disclosed.",
      },
      {
        name: "Ethics & Sustainability",
        score: 8, max: 10,
        note: "Indian brand, cruelty-free, strong domestic manufacturing. Chemical UV filter marine toxicity profiles are unknown without filter identity disclosure. Contains synthetic fragrance.",
      },
    ],
    keyActives: [
      { name: "Chemical UV Filters",  function: "UVA + UVB broad-spectrum protection, SPF 50; specific filters not fully disclosed" },
      { name: "Oil-Absorbing Agents", function: "Matte finish and sebum control throughout wear" },
    ],
    ingredients: [
      { name: "Aqua",             note: "Solvent base",                                                      flag: "ok"   },
      { name: "Chemical UV Filters", note: "SPF 50 PA+++ UVA+UVB coverage; specific identities not consistently disclosed on all variants", flag: "info" },
      { name: "Glycerin",         note: "Humectant",                                                         flag: "ok"   },
      { name: "Carbomer",         note: "Gel-forming polymer",                                               flag: "ok"   },
      { name: "Phenoxyethanol",   note: "Preservative",                                                      flag: "info" },
      { name: "Fragrance",        note: "Synthetic fragrance; sensitisation risk in daily leave-on SPF",     flag: "warn" },
    ],
    pass_badges: ["Cruelty-Free", "India-Founded Brand", "SPF 50", "Matte Finish"],
    warn_badges: ["Contains Synthetic Fragrance", "UV Filters Not Fully Disclosed", "PA+++ (PA++++ Now Recommended for India)"],
    info_badges: ["INCI Not Fully Published"],
    indiaContext: "SPF 50 PA+++ is a functional daily sunscreen for Indian conditions. The transition to PA++++ as the recommended minimum (PPD >= 16 vs PA+++ PPD >= 8) reflects updated understanding of UVA's role in PIH — worth upgrading if spending extended time outdoors. The matte gel texture is one of Lotus's strengths for Indian oily skin users.",
    analyzedAt: "2026-06-05",
    category: "Sunscreens",
    subCategory: "Matte Sunscreen",
    price: 425,
    sizeValue: 50,
    sizeUnit: "g",
    pricePerUnit: 8.50,
    skinTypeTags: ["oily", "combination"],
    concernTags: ["Photoageing", "Tanning", "Oily Skin"],
    suitabilityTags: ["Daily Use", "Humid Weather"],
    cautionTags: ["SPF Not Verified"],
    fragranceStatus: "synthetic",
    alcoholStatus: "unknown",
  },

  /* -------------------------------------------------
     5. Radiant Choice Vitamin C Face Serum
     Source: lotusherbals.com/products/radiant-choice-vitamin-c-face-serum
  ------------------------------------------------- */
  {
    productName: "Radiant Choice Vitamin C Face Serum",
    slug: "radiant-choice-vitamin-c-serum",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹549-₹599",
    productType: "leave-on",
    concern: "Brightening, dullness, pigmentation, antioxidant",
    summary: "Lotus Herbals' entry into the Vitamin C serum category, part of the Radiant Choice range. The Vitamin C form used is not confirmed on public-facing product pages — key information for assessing formula stability in India's heat. The brightening complex combines Vitamin C with Turmeric Extract (Curcuma Longa), Saffron Extract, and Hyaluronic Acid. Curcumin in Turmeric has published brightening and anti-inflammatory data. Saffron Extract contains safranal and crocin with antioxidant and mild brightening properties. Fragrance is present. Full INCI is not published on the product page reviewed — active concentrations are not disclosed.",
    score: 65,
    scoreLabel: "Fair",
    image: "https://lotusherbals.com/cdn/shop/files/RADIANT-CHOICE-VIT-C-SERUM.jpg",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 33, max: 50,
        note: "The Vitamin C form is unspecified — if L-ascorbic acid, it degrades rapidly in India's heat and can cause irritation at higher concentrations. If a stable derivative (EAA, Ascorbyl Glucoside), stability is less concerning. Turmeric (Curcumin) can stain and may cause photosensitivity at high concentrations in some individuals. Contains synthetic fragrance in a leave-on serum — elevated sensitisation concern for regular facial use. Full INCI not published.",
      },
      {
        name: "Formulation Quality",
        score: 13, max: 20,
        note: "Without knowing the Vitamin C form and concentration, formulation quality is difficult to assess. Turmeric Extract and Saffron Extract have traditional Ayurvedic brightening use and emerging published evidence. Hyaluronic Acid supports hydration alongside the brightening actives. The formulation approach is botanical-first rather than actives-first.",
      },
      {
        name: "Claims & Transparency",
        score: 11, max: 20,
        note: "Vitamin C form and concentration not disclosed. Full INCI not publicly available. Active concentrations not stated. Brightening claims rely on botanical ingredient narrative without clinical substantiation for this specific formula.",
      },
      {
        name: "Ethics & Sustainability",
        score: 8, max: 10,
        note: "Indian brand with domestic botanical sourcing emphasis. Cruelty-free. Saffron and Turmeric are cultivated in India supporting local agriculture. Contains synthetic fragrance.",
      },
    ],
    keyActives: [
      { name: "Vitamin C",                     function: "Antioxidant and brightening; form and concentration not disclosed" },
      { name: "Curcuma Longa (Turmeric) Extract", function: "Curcumin, anti-inflammatory and antioxidant brightening; traditional Ayurvedic active" },
      { name: "Saffron Extract",               function: "Safranal and crocin, antioxidant; mild brightening from traditional use" },
      { name: "Sodium Hyaluronate",             function: "HA, surface hydration" },
    ],
    ingredients: [
      { name: "Aqua",                           note: "Solvent base",                                                                                          flag: "ok"   },
      { name: "Vitamin C",                      note: "Form not specified on available product labelling — stability and efficacy depend critically on which form", flag: "info" },
      { name: "Curcuma Longa Root Extract",     note: "Turmeric, curcumin; antioxidant and brightening; traditional Ayurvedic active",                       flag: "ok"   },
      { name: "Crocus Sativus (Saffron) Extract", note: "Safranal and crocin antioxidants; mild brightening",                                               flag: "ok"   },
      { name: "Sodium Hyaluronate",             note: "HA salt, surface hydration",                                                                           flag: "ok"   },
      { name: "Phenoxyethanol",                 note: "Preservative",                                                                                         flag: "info" },
      { name: "Fragrance",                      note: "Synthetic fragrance; sensitisation risk in leave-on serum",                                            flag: "warn" },
    ],
    pass_badges: ["Cruelty-Free", "India-Founded Brand", "Ayurvedic Botanical Complex"],
    warn_badges: ["Contains Synthetic Fragrance", "Vitamin C Form Not Disclosed"],
    info_badges: ["INCI Not Fully Published", "Active Concentrations Undisclosed"],
    indiaContext: "Turmeric's brightening and anti-inflammatory properties are well-aligned with Indian skin concerns and have strong cultural familiarity. The lack of disclosed Vitamin C form is a material gap — for India's climate, only heat-stable derivatives (EAA, Ascorbyl Glucoside) are appropriate. Users who react to fragrance should be cautious with leave-on serums.",
    analyzedAt: "2026-06-05",
    category: "Serums",
    subCategory: "Vitamin C Serum",
    price: 599,
    sizeValue: 30,
    sizeUnit: "ml",
    pricePerUnit: 19.97,
    skinTypeTags: ["all", "dull"],
    concernTags: ["Dullness", "Pigmentation", "Tanning"],
    suitabilityTags: ["Daily Use"],
    cautionTags: [],
    fragranceStatus: "synthetic",
    alcoholStatus: "unknown",
  },

  /* -------------------------------------------------
     6. Matte Magic Face Wash with Salicylic Acid
     Source: lotusherbals.com/products/matte-magic-face-wash
  ------------------------------------------------- */
  {
    productName: "Matte Magic Face Wash with Salicylic Acid",
    slug: "matte-magic-face-wash",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹175-₹225",
    productType: "rinse-off",
    concern: "Oiliness, acne, matte skin, daily cleansing",
    summary: "An oil-control face wash with Salicylic Acid and Kaolin Clay. Salicylic Acid in a rinse-off format provides BHA pore-clearing action with reduced contact time vs leave-on. Kaolin Clay is a naturally occurring mineral that absorbs excess sebum during cleansing. Tea Tree Oil (Melaleuca Alternifolia) has published antimicrobial activity against C. acnes. The surfactant system and SLES presence are noted below. Contains synthetic fragrance. Active concentrations not disclosed.",
    score: 65,
    scoreLabel: "Fair",
    image: "https://lotusherbals.com/cdn/shop/files/MATTE-MAGIC-FACEWASH.jpg",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 30, max: 50,
        note: "Salicylic Acid in a rinse-off format is safe. Kaolin is an inert mineral with no known safety concerns. Tea Tree Oil has established antimicrobial activity but can cause contact sensitisation in some individuals — IFRA limits apply. SLES as a primary surfactant is more stripping than milder taurate alternatives; combined with SA, daily use may cause cumulative dryness. Contains synthetic fragrance. Active concentrations not disclosed on packaging reviewed.",
      },
      {
        name: "Formulation Quality",
        score: 14, max: 20,
        note: "Salicylic Acid + Kaolin Clay + Tea Tree Oil addresses acne via three mechanisms (BHA exfoliation, sebum absorption, antimicrobial). The combination is effective for oily acne-prone skin but the rinse-off format limits SA contact time. SLES surfactant is effective but strips natural oils alongside sebum.",
      },
      {
        name: "Claims & Transparency",
        score: 13, max: 20,
        note: "Salicylic Acid, Kaolin, and Tea Tree Oil are named on the product. Concentrations not disclosed. Full INCI not published. 'Matte Magic' is experiential marketing language.",
      },
      {
        name: "Ethics & Sustainability",
        score: 8, max: 10,
        note: "Indian brand, cruelty-free, botanical ingredient emphasis. Kaolin is a naturally mined mineral. Tea Tree Oil is plant-derived. Contains synthetic fragrance.",
      },
    ],
    keyActives: [
      { name: "Salicylic Acid",        function: "BHA, pore-clearing, anti-acne; concentration not disclosed" },
      { name: "Kaolin Clay",           function: "Mineral sebum absorber, purifying during cleansing" },
      { name: "Tea Tree Oil",          function: "Melaleuca Alternifolia, antimicrobial against C. acnes" },
    ],
    ingredients: [
      { name: "Aqua",                         note: "Solvent base",                                                                              flag: "ok"   },
      { name: "Sodium Laureth Sulfate",        note: "SLES, primary anionic surfactant; more stripping than taurate alternatives",              flag: "info" },
      { name: "Glycerin",                      note: "Humectant",                                                                               flag: "ok"   },
      { name: "Kaolin",                        note: "Mineral clay, sebum absorption and pore purification during cleansing",                  flag: "ok"   },
      { name: "Salicylic Acid",                note: "BHA pore-clearing; concentration not disclosed",                                         flag: "ok"   },
      { name: "Melaleuca Alternifolia Oil",    note: "Tea Tree Oil, antimicrobial; sensitisation risk in some individuals",                    flag: "info" },
      { name: "Phenoxyethanol",                note: "Preservative",                                                                           flag: "info" },
      { name: "Fragrance",                     note: "Synthetic fragrance",                                                                    flag: "warn" },
    ],
    pass_badges: ["Cruelty-Free", "India-Founded Brand", "Tea Tree Antimicrobial"],
    warn_badges: ["Contains Synthetic Fragrance"],
    info_badges: ["INCI Not Fully Published", "Active Concentrations Undisclosed"],
    indiaContext: "Kaolin Clay is particularly effective during India's summer months when sebum production is at its highest. SA + Kaolin + Tea Tree is a practical acne-trio approach. For users wanting a more sophisticated daily cleanser, actives-first brands with disclosed BHA concentrations offer better transparency.",
    analyzedAt: "2026-06-05",
    category: "Cleansers",
    subCategory: "Acne Face Wash",
    price: 225,
    sizeValue: 100,
    sizeUnit: "g",
    pricePerUnit: 2.25,
    skinTypeTags: ["oily", "combination", "acne-prone"],
    concernTags: ["Acne", "Oily Skin"],
    suitabilityTags: ["Daily Use", "Beginner Friendly"],
    cautionTags: [],
    fragranceStatus: "synthetic",
    alcoholStatus: "unknown",
  },

  /* -------------------------------------------------
     7. Safe Sun UV Screen Sunblock SPF 70 PA+++
     Source: lotusherbals.com/products/safe-sun-uv-screen-sunblock-spf-70-pa
  ------------------------------------------------- */
  {
    productName: "Safe Sun UV Screen Sunblock SPF 70 PA+++",
    slug: "safe-sun-sunblock-spf70",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹449-₹499",
    productType: "sunscreen",
    concern: "High sun protection, outdoor activities",
    summary: "Lotus Herbals' highest SPF offering in the Safe Sun range at SPF 70 PA+++. The higher SPF is achieved through a higher UV filter concentration or additional filters versus the SPF 50 formula. PA+++ (PPD >= 8) remains below the PA++++ standard increasingly recommended for Indian conditions. UV filter identities are not fully disclosed on reviewed product labelling. Contains synthetic fragrance in a leave-on sun protection product. Limited transparency overall but strong SPF claim for outdoor protection.",
    score: 66,
    scoreLabel: "Fair",
    image: "https://lotusherbals.com/cdn/shop/files/SAFE-SUN-SPF70.jpg",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 32, max: 50,
        note: "SPF 70 PA+++ with chemical UV filters — filter identities not disclosed, preventing full safety assessment. Contains synthetic fragrance in a leave-on SPF product that may be applied multiple times daily (reapplication). This increases cumulative fragrance exposure significantly. No oxybenzone noted in brand communications but cannot be confirmed without full filter disclosure.",
      },
      {
        name: "Formulation Quality",
        score: 16, max: 20,
        note: "SPF 70 delivers more complete UVB protection than SPF 50, with meaningful differences in practical protection (SPF 50 blocks ~98%, SPF 70 blocks ~98.6% of UVB). The PA+++ UVA protection is adequate but not at the PA++++ standard increasingly recommended for Indian UV intensity. Full UV filter profile needed to assess photostability and UVA coverage quality.",
      },
      {
        name: "Claims & Transparency",
        score: 10, max: 20,
        note: "SPF 70 and PA+++ stated on packaging. UV filter identities not disclosed. No published in-vivo test certificate publicly accessible. Synthetic fragrance not prominently disclosed. INCI not fully published.",
      },
      {
        name: "Ethics & Sustainability",
        score: 8, max: 10,
        note: "Indian brand, cruelty-free. UV filter marine toxicity cannot be assessed without filter disclosure. Contains synthetic fragrance.",
      },
    ],
    keyActives: [
      { name: "Chemical UV Filters", function: "SPF 70 UVB + PA+++ UVA protection; specific identities not disclosed" },
    ],
    ingredients: [
      { name: "Aqua",              note: "Solvent base",                                                                            flag: "ok"   },
      { name: "Chemical UV Filters", note: "SPF 70 PA+++ coverage; filter identities not consistently disclosed on labelling",    flag: "info" },
      { name: "Glycerin",          note: "Humectant",                                                                              flag: "ok"   },
      { name: "Phenoxyethanol",    note: "Preservative",                                                                          flag: "info" },
      { name: "Fragrance",         note: "Synthetic fragrance in leave-on reapplied sunscreen — elevated daily exposure",         flag: "warn" },
    ],
    pass_badges: ["Cruelty-Free", "India-Founded Brand", "SPF 70"],
    warn_badges: ["Contains Synthetic Fragrance", "UV Filters Not Disclosed", "PA+++ (PA++++ Now Recommended)"],
    info_badges: ["INCI Not Fully Published"],
    indiaContext: "SPF 70 is appropriate for extended outdoor use — beach, trekking, sport, and fieldwork. The PA+++ UVA protection is less ideal for India's strong year-round UVA; PA++++ is increasingly the recommendation for melanin-rich skin at risk of PIH. Reapply every 2 hours in direct sun regardless of SPF value.",
    analyzedAt: "2026-06-05",
    category: "Sunscreens",
    subCategory: "High SPF Sunscreen",
    price: 499,
    sizeValue: 50,
    sizeUnit: "g",
    pricePerUnit: 9.98,
    skinTypeTags: ["all"],
    concernTags: ["Photoageing", "Tanning"],
    suitabilityTags: ["Daily Use"],
    cautionTags: ["SPF Not Verified"],
    fragranceStatus: "synthetic",
    alcoholStatus: "unknown",
  },

  /* -------------------------------------------------
     8. Skin Perfect Anti-Ageing & Brightening Serum
     Source: lotusherbals.com/products/skin-perfect-anti-ageing-brightening-serum
  ------------------------------------------------- */
  {
    productName: "Skin Perfect Anti-Ageing & Brightening Serum",
    slug: "skin-perfect-anti-ageing-serum",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹695-₹799",
    productType: "leave-on",
    concern: "Anti-ageing, brightening, fine lines, pigmentation",
    summary: "A dual-action brightening and anti-ageing serum combining Vitamin C, Hyaluronic Acid, Niacinamide, and Retinol in a single product. The multi-active approach is ambitious — combining retinol and Vitamin C in one formula presents formulation stability challenges unless specific pH stabilisation strategies are employed. Full INCI and active concentrations are not disclosed. If the formula pH is calibrated for retinol stability (~5.5-6), it may not be optimal for Vitamin C efficacy (typically <3.5 for L-ascorbic acid). Without knowing the Vitamin C form, stability assessment is not possible. Contains synthetic fragrance.",
    score: 63,
    scoreLabel: "Fair",
    image: "https://lotusherbals.com/cdn/shop/files/SKIN-PERFECT-SERUM.jpg",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 31, max: 50,
        note: "Retinol carries a pregnancy contraindication — not communicated consistently in marketing. Vitamin C and retinol at high concentrations in a single formula can cause irritation synergy for sensitive skin. Contains synthetic fragrance in a leave-on serum. Without full INCI, complete safety assessment is not possible.",
      },
      {
        name: "Formulation Quality",
        score: 13, max: 20,
        note: "Combining Vitamin C, Retinol, Niacinamide, and HA in one formula is technically challenging — each active has different stability pH optima. Without knowing the Vitamin C form and formula pH, it is not possible to assess whether the actives are formulated for optimal efficacy. The concept is sound but execution requires specific technical choices that are not disclosed.",
      },
      {
        name: "Claims & Transparency",
        score: 11, max: 20,
        note: "Active concentrations and forms are not disclosed. Full INCI not published. Retinol pregnancy contraindication not consistently communicated. Limited transparency for a multi-active serum.",
      },
      {
        name: "Ethics & Sustainability",
        score: 8, max: 10,
        note: "Indian brand, cruelty-free. Botanical sourcing emphasis. Contains synthetic fragrance. Retinol is synthetically derived.",
      },
    ],
    keyActives: [
      { name: "Vitamin C",          function: "Antioxidant and brightening; form not disclosed" },
      { name: "Retinol",            function: "Anti-ageing, cell turnover; concentration not disclosed; pregnancy contraindicated" },
      { name: "Niacinamide",        function: "Vitamin B3, brightening and anti-inflammatory" },
      { name: "Sodium Hyaluronate", function: "HA, hydration" },
    ],
    ingredients: [
      { name: "Aqua",                note: "Solvent base",                                                                                                   flag: "ok"   },
      { name: "Vitamin C",           note: "Form not specified; stability pH optima (< 3.5 for L-AA) may conflict with retinol requirements",               flag: "info" },
      { name: "Retinol",             note: "Concentration not disclosed; pregnancy contraindicated; pH optimum (~5.5-6) may conflict with Vitamin C",       flag: "info" },
      { name: "Niacinamide",         note: "Brightening; concentration not disclosed",                                                                      flag: "ok"   },
      { name: "Sodium Hyaluronate",  note: "HA, hydration",                                                                                                flag: "ok"   },
      { name: "Phenoxyethanol",      note: "Preservative",                                                                                                  flag: "info" },
      { name: "Fragrance",           note: "Synthetic fragrance in leave-on serum",                                                                         flag: "warn" },
    ],
    pass_badges: ["Cruelty-Free", "India-Founded Brand"],
    warn_badges: ["Contains Synthetic Fragrance", "Not for Use During Pregnancy (Retinol Present)", "Active Forms and Concentrations Undisclosed"],
    info_badges: ["INCI Not Fully Published", "Multi-Active Stability Concerns Without pH Disclosure"],
    indiaContext: "Multi-active serums that combine retinol and Vitamin C appeal to consumers wanting a simplified routine. The formulation stability challenge is real — always patch test first. For those who prefer separate actives, using Vitamin C AM and retinol PM is the evidence-backed approach.",
    analyzedAt: "2026-06-05",
    category: "Serums",
    subCategory: "Anti-Ageing Serum",
    price: 799,
    sizeValue: 30,
    sizeUnit: "ml",
    pricePerUnit: 26.63,
    skinTypeTags: ["normal", "combination", "dull"],
    concernTags: ["Fine Lines", "Pigmentation", "Dullness"],
    suitabilityTags: ["Active Experienced Users"],
    cautionTags: ["Retinoid Flag", "Pregnancy Not Reviewed"],
    fragranceStatus: "synthetic",
    alcoholStatus: "unknown",
  },

  /* -------------------------------------------------
     9. Whiteglow Insta Glow Sleep Mask
     Source: lotusherbals.com/products/whiteglow-overnight-gelcreme-sleeping-mask
  ------------------------------------------------- */
  {
    productName: "Whiteglow Insta Glow Overnight Sleep Mask",
    slug: "whiteglow-overnight-sleep-mask",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹449-₹499",
    productType: "leave-on",
    concern: "Overnight brightening, hydration, dullness",
    summary: "An overnight sleep mask from the Whiteglow range combining the brand's Mulberry Extract and Milk Enzyme brightening complex with a gel-creme texture designed for overnight use. Higher contact time versus daytime moisturisers allows better absorption of botanical actives. Hyaluronic Acid is included for overnight hydration. The product uses the same Whiteglow botanical brightening complex. Contains synthetic fragrance. Full INCI not published on reviewed labelling. Suitable as an occasional-use overnight treatment or a daily overnight step.",
    score: 66,
    scoreLabel: "Fair",
    image: "https://lotusherbals.com/cdn/shop/files/WHITEGLOW-SLEEP-MASK.jpg",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 32, max: 50,
        note: "Overnight leave-on products have higher exposure contact time — synthetic fragrance in an overnight treatment is a more significant sensitisation concern than the same fragrance in a rinse-off product. Mulberry Extract and Milk Enzymes are well-tolerated. Hyaluronic Acid is safe. Full INCI not published.",
      },
      {
        name: "Formulation Quality",
        score: 14, max: 20,
        note: "Overnight contact time improves the efficacy of botanical brightening actives versus daytime application. The gel-creme texture is appropriate for overnight use — not too occlusive. HA overnight hydration is effective for skin that loses moisture during sleep. Botanical extract concentrations not disclosed.",
      },
      {
        name: "Claims & Transparency",
        score: 12, max: 20,
        note: "'Insta Glow' is experiential marketing language without clinical substantiation. Active concentrations not disclosed. Full INCI not consistently published. Fragrance content not prominently disclosed for an overnight leave-on product.",
      },
      {
        name: "Ethics & Sustainability",
        score: 8, max: 10,
        note: "Indian brand, cruelty-free, botanical ingredient emphasis. Contains synthetic fragrance in an overnight product. No independent sustainability sourcing verification.",
      },
    ],
    keyActives: [
      { name: "Morus Alba (Mulberry) Extract",  function: "Tyrosinase inhibitor; extended overnight contact time improves efficacy" },
      { name: "Milk Enzymes",                   function: "Enzymatic brightening with overnight contact time" },
      { name: "Sodium Hyaluronate",             function: "Overnight hydration" },
    ],
    ingredients: [
      { name: "Aqua",                        note: "Solvent base",                                                                            flag: "ok"   },
      { name: "Glycerin",                    note: "Humectant",                                                                               flag: "ok"   },
      { name: "Morus Alba Fruit Extract",    note: "Mulberry, tyrosinase inhibitor; overnight contact improves absorption",                  flag: "ok"   },
      { name: "Milk Enzymes",               note: "Enzymatic brightening",                                                                  flag: "ok"   },
      { name: "Sodium Hyaluronate",         note: "HA, overnight hydration",                                                                flag: "ok"   },
      { name: "Carbomer",                   note: "Gel polymer",                                                                            flag: "ok"   },
      { name: "Phenoxyethanol",             note: "Preservative",                                                                          flag: "info" },
      { name: "Fragrance",                  note: "Synthetic fragrance in an overnight leave-on product — elevated sensitisation concern",  flag: "warn" },
    ],
    pass_badges: ["Cruelty-Free", "India-Founded Brand", "Overnight Treatment"],
    warn_badges: ["Contains Synthetic Fragrance (Overnight Leave-On)"],
    info_badges: ["INCI Not Fully Published", "Botanical Concentrations Undisclosed"],
    indiaContext: "Overnight skin treatments are effective in India's cooler winter months when skin moisture loss during sleep is higher. The botanical brightening complex with overnight contact time is more effective than the same formula as a daytime product. Fragrance sensitivity is heightened during overnight use — consider an alternative if fragrance-reactive.",
    analyzedAt: "2026-06-05",
    category: "Moisturizers",
    subCategory: "Overnight Mask",
    price: 499,
    sizeValue: 80,
    sizeUnit: "g",
    pricePerUnit: 6.24,
    skinTypeTags: ["all", "dull", "normal"],
    concernTags: ["Dullness", "Pigmentation", "Dehydrated Skin"],
    suitabilityTags: ["Daily Use (Night)", "Beginner Friendly"],
    cautionTags: [],
    fragranceStatus: "synthetic",
    alcoholStatus: "unknown",
  },

  /* -------------------------------------------------
     10. Radiant Choice Vitamin C + Turmeric Face Wash
     Source: lotusherbals.com/products/radiant-choice-vitamin-c-turmeric-face-wash
  ------------------------------------------------- */
  {
    productName: "Radiant Choice Vitamin C + Turmeric Face Wash",
    slug: "radiant-choice-vitamin-c-turmeric-face-wash",
    brand: BRAND_NAME,
    brandSlug: BRAND_SLUG,
    priceRange: "₹249-₹295",
    productType: "rinse-off",
    concern: "Brightening, dullness, daily cleansing",
    summary: "A brightening face wash from the Radiant Choice line combining Vitamin C and Turmeric (Curcuma Longa) as the primary actives. Both are rinsed off during cleansing — their brightening efficacy in a wash-off format is limited compared to leave-on products. The formula includes Glycerin for moisture and a surfactant system. Turmeric's curcumin has mild brightening, anti-inflammatory, and antioxidant properties but staining risk at high concentrations in rinse-off is minimal due to the short contact time. Contains synthetic fragrance. Full INCI not published.",
    score: 64,
    scoreLabel: "Fair",
    image: "https://lotusherbals.com/cdn/shop/files/RADIANT-CHOICE-VIT-C-FACEWASH.jpg",
    pillars: [
      {
        name: "Safety & Toxicity",
        score: 31, max: 50,
        note: "Vitamin C form not disclosed — if L-ascorbic acid at high concentration, can cause irritation. Turmeric Extract at rinse-off concentrations is safe. SLES (if present as primary surfactant) is more stripping than taurate alternatives. Contains synthetic fragrance in a rinse-off cleanser — lower exposure than leave-on but cumulative daily use adds up.",
      },
      {
        name: "Formulation Quality",
        score: 14, max: 20,
        note: "Vitamin C and Turmeric in a wash-off format have limited brightening efficacy due to short contact time and rinsing. Their primary contribution in this format is through the surfactant system's cleansing of surface pigmentation and sebum, with minor residual benefit. The formula works better as a pleasant daily cleanser than as a primary brightening treatment.",
      },
      {
        name: "Claims & Transparency",
        score: 11, max: 20,
        note: "Vitamin C form not disclosed. Concentrations not disclosed. Full INCI not published. Brightening claims are difficult to substantiate in a rinse-off format. No published clinical data.",
      },
      {
        name: "Ethics & Sustainability",
        score: 8, max: 10,
        note: "Indian brand, cruelty-free. Turmeric is domestically sourced (India is the world's largest Turmeric producer). Botanical sourcing aligns with the brand's herbal identity. Contains synthetic fragrance.",
      },
    ],
    keyActives: [
      { name: "Vitamin C",                      function: "Antioxidant brightening; limited efficacy in rinse-off format; form not disclosed" },
      { name: "Curcuma Longa (Turmeric) Extract", function: "Curcumin, antioxidant and anti-inflammatory; limited rinse-off brightening contact time" },
    ],
    ingredients: [
      { name: "Aqua",                           note: "Solvent base",                                                                                        flag: "ok"   },
      { name: "Surfactant system",              note: "Primary surfactant not confirmed from available labelling; full INCI not published",                   flag: "info" },
      { name: "Glycerin",                       note: "Humectant",                                                                                           flag: "ok"   },
      { name: "Vitamin C",                      note: "Brightening active; form not disclosed; rinse-off contact time limits efficacy",                     flag: "info" },
      { name: "Curcuma Longa Root Extract",     note: "Turmeric, curcumin; antioxidant; limited efficacy in rinse-off",                                    flag: "ok"   },
      { name: "Phenoxyethanol",                 note: "Preservative",                                                                                       flag: "info" },
      { name: "Fragrance",                      note: "Synthetic fragrance",                                                                                flag: "warn" },
    ],
    pass_badges: ["Cruelty-Free", "India-Founded Brand", "Turmeric (India-Sourced)"],
    warn_badges: ["Contains Synthetic Fragrance"],
    info_badges: ["INCI Not Fully Published", "Brightening Actives in Rinse-Off Format — Limited Efficacy"],
    indiaContext: "Turmeric in a face wash resonates strongly with Indian skincare tradition (Haldi) and the ingredient has genuine antioxidant and anti-inflammatory data. For brightening results, a leave-on Vitamin C + Turmeric product will be significantly more effective than a rinse-off wash. Use this as a pleasant daily cleanser, not a primary brightening treatment.",
    analyzedAt: "2026-06-05",
    category: "Cleansers",
    subCategory: "Brightening Face Wash",
    price: 295,
    sizeValue: 100,
    sizeUnit: "ml",
    pricePerUnit: 2.95,
    skinTypeTags: ["all", "normal", "dull"],
    concernTags: ["Dullness", "Tanning"],
    suitabilityTags: ["Daily Use", "Beginner Friendly"],
    cautionTags: [],
    fragranceStatus: "synthetic",
    alcoholStatus: "unknown",
  },

];

export const lotusHerbalsBrand: Brand = {
  name: "Lotus Herbals",
  slug: "lotus-herbals",
  logo: "https://lotusherbals.com/cdn/shop/files/lotus-herbals-logo.png",
  tagline: "India's original herbal beauty brand since 1993",
  description: "Lotus Herbals is one of India's oldest and largest herbal skincare brands, founded in 1993 by Kamal Passi in New Delhi. With over three decades of presence across pharmacies, supermarkets, and beauty counters, Lotus is a household name built on botanical and plant-derived formulations. The brand's product range spans skincare, sun protection, and colour cosmetics. Lotus products are widely accessible at mass-market price points. Note: Lotus Herbals does not consistently publish full INCI ingredient lists across all product formats — transparency is an area where the brand trails newer actives-first Indian labels. Most formulas contain synthetic fragrance.",
  founded: "1993",
  headquarters: "New Delhi, India",
  website: "https://lotusherbals.com",
  instagramHandle: "@lotusherbalsofficial",
  nykaaUrl: "https://www.nykaa.com/brands/lotus-herbals/c/1388",
  avgScore: 66,
  verdict: "Fair",
  products,
};
