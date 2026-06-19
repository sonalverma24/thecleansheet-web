export interface Product {
  id: string;
  brand: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  size: string;
  mrp: number;
  price_min: number;
  price_max: number;
  price_per_ml: number;
  imageUrl: string;
  ingredient_list: string;
  claims: string[];
  directions?: string;
  warnings?: string;
  status: 'Certified Product' | 'Verified Scorecard' | 'Public Data Review' | 'User Submitted' | 'Awaiting Evidence';
  analysis_confidence: 'High' | 'Medium' | 'Low';
  scores: {
    total: number;
    safety: number;
    formulation: number;
    claims: number;
    ethics: number;
  };
  verdict: string;
  best_for: string[];
  avoid_if: string[];
  expert_summary: string;
  ingredients_breakdown: Array<{
    name: string;
    function: string;
    concern: 'low' | 'medium' | 'high' | 'restricted' | 'gap' | 'beneficial' | 'claim';
    why: string;
    matters: string;
  }>;
  claims_audit: Array<{
    claim: string;
    status: 'Supported by available data' | 'Plausible but not verified' | 'Not verifiable from label' | 'Potentially misleading' | 'Requires lab test' | 'Requires clinical evidence' | 'Contradicted by ingredient list';
    reason: string;
    evidence_needed: string;
  }>;
  retailer_links: Array<{
    retailer: string;
    url: string;
  }>;
  pills: string[];
}

export const mockProducts: Product[] = [
  {
    id: "1",
    brand: "Aura Skincare",
    name: "Aura Hydration Serum",
    slug: "aura-hydration-serum",
    category: "Serums",
    subcategory: "Hydrating Serums",
    size: "30ml",
    mrp: 950,
    price_min: 850,
    price_max: 950,
    price_per_ml: 31.6,
    imageUrl: "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=400&q=80",
    ingredient_list: "Aqua, Niacinamide, Glycerin, Sodium Hyaluronate, Ceramide NP, Squalane, Phenoxyethanol, Ethylhexylglycerin",
    claims: ["98% Hydration Boost", "Dermatologist Tested", "Fragrance Free", "Endocrine Disruptor Free"],
    directions: "Apply 2-3 drops to damp skin morning and night, followed by moisturizer.",
    warnings: "For external use only. Patch test before use.",
    status: "Certified Product",
    analysis_confidence: "High",
    scores: {
      total: 98,
      safety: 49,
      formulation: 19,
      claims: 20,
      ethics: 10
    },
    verdict: "Strong barrier support and low concern ingredient profile, backed by product-specific testing verifying all claims.",
    best_for: ["Sensitive skin barrier repair", "Dehydrated skin textures", "Fragrance-free clean routine setups"],
    avoid_if: ["No specific contradictions found for standard skin types"],
    expert_summary: "A outstanding formulation featuring high-grade Niacinamide and Ceramide NP. Glycerin and Sodium Hyaluronate provide clean, multi-depth hydration without sticky residue. Active ingredients are placed high in the INCI list, supporting efficacy claims.",
    ingredients_breakdown: [
      { name: "Aqua", function: "Solvent / Carrier", concern: "low", why: "Dissolves actives", matters: "Universal vehicle, no risk" },
      { name: "Niacinamide", function: "Skin Brightening / Barrier", concern: "beneficial", why: "Restores barrier, reduces redness", matters: "Highly active, clinically verified" },
      { name: "Glycerin", function: "Humectant", concern: "low", why: "Attracts hydration", matters: "Safe, natural skin constituent" },
      { name: "Sodium Hyaluronate", function: "Humectant", concern: "low", why: "Retains deep moisture", matters: "Hyaluronic acid derivative" },
      { name: "Ceramide NP", function: "Barrier Lipids", concern: "beneficial", why: "Plumps intercellular spaces", matters: "Crucial for sensitive skin types" },
      { name: "Squalane", function: "Emollient", concern: "low", why: "Locks in hydration", matters: "Highly stable oil mimic" },
      { name: "Phenoxyethanol", function: "Preservative", concern: "low", why: "Prevents bacterial growth", matters: "Safely capped under 1% threshold" }
    ],
    claims_audit: [
      { claim: "98% Hydration Boost", status: "Supported by available data", reason: "Product clinical study was submitted showing 98.2% moisture increase.", evidence_needed: "Verified dossier" },
      { claim: "Dermatologist Tested", status: "Supported by available data", reason: "Repeat Insult Patch Test reports were submitted.", evidence_needed: "Clinical RIPT documentation" },
      { claim: "Fragrance Free", status: "Supported by available data", reason: "No essential oils or synthetic fragrances found in INCI list.", evidence_needed: "INCI audit" }
    ],
    retailer_links: [
      { retailer: "Amazon", url: "https://amazon.com" },
      { retailer: "Nykaa", url: "https://nykaa.com" },
      { retailer: "Tira", url: "https://tira.com" }
    ],
    pills: ["Fragrance Free", "Barrier Support"]
  },
  {
    id: "2",
    brand: "CeraLab",
    name: "Cera-Barrier Recovery Cream",
    slug: "cera-barrier-cream",
    category: "Moisturisers",
    subcategory: "Barrier Creams",
    size: "50ml",
    mrp: 1200,
    price_min: 1050,
    price_max: 1200,
    price_per_ml: 24.0,
    imageUrl: "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=400&q=80",
    ingredient_list: "Aqua, Caprylic/Capric Triglyceride, Glycerin, Cetearyl Alcohol, Ceramide NP, Squalane, Stearic Acid, Tocopherol, Phenoxyethanol",
    claims: ["24hr Intense Hydration", "Hypoallergenic", "Sensitive Skin Approved"],
    directions: "Massage cream onto clean skin following serums.",
    status: "Verified Scorecard",
    analysis_confidence: "High",
    scores: {
      total: 94,
      safety: 47,
      formulation: 18,
      claims: 19,
      ethics: 10
    },
    verdict: "High-integrity barrier moisturizer. Very low concern rating, but lacks certified status.",
    best_for: ["Dry, flaky skin barriers", "Post-treatment repair", "Night routine recovery"],
    avoid_if: ["Extremely acne-prone skin due to Stearic Acid comedogenicity"],
    expert_summary: "An exceptional lipid barrier replenishment cream using a classic blend of Ceramides, Fatty Acids, and Cholesterol-mimicking Squalane. Highly stable and free from common sensitizers like essential oils.",
    ingredients_breakdown: [
      { name: "Aqua", function: "Solvent", concern: "low", why: "Carrier liquid", matters: "Standard solvent" },
      { name: "Caprylic/Capric Triglyceride", function: "Emollient", concern: "low", why: "Softens skin texture", matters: "Coconut oil derived fatty ester" },
      { name: "Glycerin", function: "Humectant", concern: "low", why: "Binds hydration", matters: "Universal safe humectant" },
      { name: "Ceramide NP", function: "Lipids", concern: "beneficial", why: "Restores barrier structure", matters: "Proven skin barrier builder" },
      { name: "Squalane", function: "Emollient", concern: "low", why: "Mimics natural sebum", matters: "Highly stable non-comedogenic lipid" }
    ],
    claims_audit: [
      { claim: "24hr Intense Hydration", status: "Plausible but not verified", reason: "Standard occlusion studies support this, but product-specific test data was not submitted.", evidence_needed: "Corneometry measurements" }
    ],
    retailer_links: [
      { retailer: "Nykaa", url: "https://nykaa.com" },
      { retailer: "Tira", url: "https://tira.com" }
    ],
    pills: ["Hypoallergenic", "Sensitive Skin"]
  },
  {
    id: "3",
    brand: "Glow & Guard",
    name: "Standard SPF 50 Chemical Sunscreen",
    slug: "glow-guard-spf50",
    category: "Sunscreens",
    subcategory: "Chemical Sunscreens",
    size: "50ml",
    mrp: 650,
    price_min: 590,
    price_max: 650,
    price_per_ml: 13.0,
    imageUrl: "https://images.unsplash.com/photo-1690368892771-566e77c3b352?w=400&q=80",
    ingredient_list: "Aqua, Oxybenzone, Octinoxate, Avobenzone, Glycerin, Dimethicone, Phenoxyethanol, Fragrance, Linalool",
    claims: ["Broad Spectrum UVA/UVB Protection", "Clean Beauty Approved", "Water Resistant 80 min"],
    directions: "Apply generously to face and neck 15 minutes before sun exposure.",
    warnings: "Do not apply on broken skin. Avoid eye contact.",
    status: "Public Data Review",
    analysis_confidence: "High",
    scores: {
      total: 54,
      safety: 22,
      formulation: 14,
      claims: 12,
      ethics: 6
    },
    verdict: "Effective UV filter system, but compromised by flags for systemic absorption and potential environmental toxicity.",
    best_for: ["Standard non-sensitive skin types needing budget protection"],
    avoid_if: ["Sensitive skin profile due to high fragrance and chemical filters", "Pregnant individuals due to Oxybenzone", "Reef-swimming due to eco-impact"],
    expert_summary: "Contains Oxybenzone and Octinoxate, which are known to trigger systemic absorption warnings and coral bleaching flags. Added synthetic fragrance (Linalool) presents a sensitizing risk for reactive skin barriers.",
    ingredients_breakdown: [
      { name: "Oxybenzone", function: "UV Filter", concern: "high", why: "Absorbs UVA/UVB rays", matters: "Associated with hormone disruption and reef toxicity" },
      { name: "Octinoxate", function: "UV Filter", concern: "medium", why: "Filters UVB radiation", matters: "Frequently flagged for eco-toxicity" },
      { name: "Avobenzone", function: "UVA Filter", concern: "medium", why: "Protects against UVA", matters: "Degrades rapidly without stabilization" },
      { name: "Fragrance", function: "Sensitizer", concern: "restricted", why: "Imparts pleasant aroma", matters: "High irritation rate for sensitive skin" }
    ],
    claims_audit: [
      { claim: "Clean Beauty Approved", status: "Potentially misleading", reason: "Oxybenzone and Octinoxate are widely banned by clean beauty registries.", evidence_needed: "Third-party certification" },
      { claim: "Broad Spectrum UVA/UVB Protection", status: "Supported by available data", reason: "Standard filters present in sufficient ratios.", evidence_needed: "In-vitro SPF reports" }
    ],
    retailer_links: [
      { retailer: "Amazon", url: "https://amazon.com" },
      { retailer: "Myntra", url: "https://myntra.com" }
    ],
    pills: ["Chemical UV Filters", "Fragrance Added"]
  },
  {
    id: "4",
    brand: "Purify Co.",
    name: "Stripping Gentle Charcoal Wash",
    slug: "purify-charcoal-wash",
    category: "Face Wash",
    subcategory: "Cleansers",
    size: "100ml",
    mrp: 450,
    price_min: 390,
    price_max: 450,
    price_per_ml: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
    ingredient_list: "Aqua, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Charcoal Powder, Glycerin, DMDM Hydantoin, Methylparaben, Fragrance",
    claims: ["Gentle for Daily Use", "Deep Detoxifying", "100% Organic Extracts"],
    directions: "Lather with water and massage onto wet face.",
    status: "Public Data Review",
    analysis_confidence: "High",
    scores: {
      total: 42,
      safety: 16,
      formulation: 10,
      claims: 10,
      ethics: 6
    },
    verdict: "High contradiction between claims and INCI profile. Contains harsh surfactants and formaldehyde-releasing preservatives.",
    best_for: ["Extremely oily non-sensitive skin requiring deep oil stripping"],
    avoid_if: ["Dry or compromised skin barriers due to SLS stripping", "Sensitive skin due to DMDM Hydantoin and Fragrance"],
    expert_summary: "Uses Sodium Laureth Sulfate (SLS) as the primary surfactant, which strips lipid layers. DMDM Hydantoin, a formaldehyde-releasing preservative, is used which poses sensitizing risks. 'Gentle' claim contradicts this composition.",
    ingredients_breakdown: [
      { name: "Sodium Laureth Sulfate", function: "Surfactant (Harsh)", concern: "medium", why: "Foams and cleanses", matters: "Can strip natural lipid barrier" },
      { name: "Cocamidopropyl Betaine", function: "Surfactant (Mild)", concern: "low", why: "Co-surfactant", matters: "Standard gentle foaming agent" },
      { name: "DMDM Hydantoin", function: "Preservative", concern: "high", why: "Releases formaldehyde to preserve", matters: "Classified allergen and sensitizer" },
      { name: "Methylparaben", function: "Preservative", concern: "medium", why: "Prevents mold", matters: "Paraben category, under scrutiny" }
    ],
    claims_audit: [
      { claim: "Gentle for Daily Use", status: "Contradicted by ingredient list", reason: "The presence of SLES and DMDM Hydantoin makes this formulation unsuitable for gentle daily cleansing.", evidence_needed: "Transepidermal Water Loss study" },
      { claim: "100% Organic Extracts", status: "Not verifiable from label", reason: "No certified organic ingredients are noted in the INCI list.", evidence_needed: "USDA/COSMOS certificates" }
    ],
    retailer_links: [
      { retailer: "Nykaa", url: "https://nykaa.com" }
    ],
    pills: ["Harsh Cleansing", "Formaldehyde Releaser"]
  },
  {
    id: "5",
    brand: "Youth Booster",
    name: "Questionable '15% Vitamin C' Serum",
    slug: "youth-booster-vitc-15",
    category: "Serums",
    subcategory: "Brightening Serums",
    size: "30ml",
    mrp: 890,
    price_min: 790,
    price_max: 890,
    price_per_ml: 29.6,
    imageUrl: "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=400&q=80",
    ingredient_list: "Aqua, Glycerin, Phenoxyethanol, Ascorbic Acid, Sodium Hyaluronate, Ethylhexylglycerin, Ferulic Acid",
    claims: ["15% Pure Vitamin C", "Dermatologist Approved", "Brightens and Firms"],
    directions: "Apply 4 drops to dry face after cleansing.",
    status: "Public Data Review",
    analysis_confidence: "High",
    scores: {
      total: 58,
      safety: 28,
      formulation: 12,
      claims: 10,
      ethics: 8
    },
    verdict: "Active Vitamin C is positioned after the preservative threshold (Phenoxyethanol), likely indicating a very low concentration.",
    best_for: ["Low potency hydration with minor antioxidant properties"],
    avoid_if: ["Users seeking therapeutic 15% high-potency Vitamin C effects"],
    expert_summary: "The Phenoxyethanol Rule is triggered. In standard cosmetics, Phenoxyethanol is restricted to 1% maximum. Because Ascorbic Acid is listed after Phenoxyethanol, its actual concentration is mathematically limited to below 1%, contradicting the 15% active ingredient claim.",
    ingredients_breakdown: [
      { name: "Aqua", function: "Solvent", concern: "low", why: "Carrier", matters: "Standard solvent" },
      { name: "Glycerin", function: "Humectant", concern: "low", why: "Binds hydration", matters: "Universal humectant" },
      { name: "Phenoxyethanol", function: "Preservative", concern: "low", why: "Preservative threshold (max 1%)", matters: "Limits concentration of subsequent ingredients" },
      { name: "Ascorbic Acid", function: "Vitamin C (Active)", concern: "claim", why: "Antioxidant listed after preservative", matters: "Concentration is likely under 1% despite 15% claim" }
    ],
    claims_audit: [
      { claim: "15% Pure Vitamin C", status: "Potentially misleading", reason: "INCI positioning after Phenoxyethanol contradicts the 15% concentration claim.", evidence_needed: "HPLC formulation assay" }
    ],
    retailer_links: [
      { retailer: "Tira", url: "https://tira.com" },
      { retailer: "Amazon", url: "https://amazon.com" }
    ],
    pills: ["Deceptive Active", "Preservative Threshold Flag"]
  },
  {
    id: "6",
    brand: "Baby Pure",
    name: "Authentic Mild Baby Hydrator",
    slug: "baby-pure-hydrator",
    category: "Moisturisers",
    subcategory: "Baby Lotions",
    size: "150ml",
    mrp: 750,
    price_min: 690,
    price_max: 750,
    price_per_ml: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&q=80",
    ingredient_list: "Aqua, Glycerin, Squalane, Caprylic/Capric Triglyceride, Ceramide NP, Xanthan Gum, Tocopherol, Citric Acid",
    claims: ["Pediatrician Tested", "Safe for Newborns", "100% Allergen Free"],
    directions: "Apply gently to baby's face and body after bath.",
    status: "Certified Product",
    analysis_confidence: "High",
    scores: {
      total: 96,
      safety: 48,
      formulation: 19,
      claims: 19,
      ethics: 10
    },
    verdict: "Superb baby-safe formula. Uses ultra-mild lipids with zero preservatives, fragrance, or active acids.",
    best_for: ["Infant and newborn skin care", "Highly sensitive skin flare-ups", "Eczema-prone skin profiles"],
    avoid_if: ["No contraindications - extremely mild formulation"],
    expert_summary: "An exemplary baby care hydrator. Avoids all common emulsifiers, synthetic preservatives, and essential oils. High ratios of plant Squalane and pure Ceramide NP support sensitive skin barriers.",
    ingredients_breakdown: [
      { name: "Aqua", function: "Solvent", concern: "low", why: "Carrier", matters: "Standard solvent" },
      { name: "Squalane", function: "Lipid emollient", concern: "low", why: "Moisturises skin gently", matters: "Excellent biocompatibility for baby skin" },
      { name: "Caprylic/Capric Triglyceride", function: "Emollient", concern: "low", why: "Gently conditions", matters: "Highly stable fatty acid ester" }
    ],
    claims_audit: [
      { claim: "Pediatrician Tested", status: "Supported by available data", reason: "Standard clinical evaluation records submitted.", evidence_needed: "Dossier review" },
      { claim: "Safe for Newborns", status: "Supported by available data", reason: "No restricted baby ingredients found in formulation.", evidence_needed: "Dossier review" }
    ],
    retailer_links: [
      { retailer: "Amazon", url: "https://amazon.com" },
      { retailer: "Nykaa", url: "https://nykaa.com" }
    ],
    pills: ["Baby Safe", "Pediatrician Approved"]
  }
];
