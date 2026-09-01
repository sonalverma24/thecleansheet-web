/* ────────────────────────────────────────────────────────────────
   Demo fixtures - real INCI, used to render the analysis layer on
   localhost without a live model/API call. Fixture 2 is a labelled
   EXAMPLE sunscreen (not a real brand) built to exercise the adverse /
   red-flag path (oxybenzone → endocrine screen; SPF evidence gap).
──────────────────────────────────────────────────────────────── */

import type { ProductReview } from "@/lib/product-review-types";

function makeReview(p: Partial<ProductReview>): ProductReview {
  return {
    type: "product-review",
    productName: "", brand: "", parentCompany: null, category: "", quantity: "",
    priceRange: "", pricePerMl: "", targetUser: "", heroPromise: "",
    priceAcrossPlatforms: [], lowestPrice: "", priceInsight: "",
    claimMap: [],
    claimSummary: { total: 0, byRisk: { low: 0, medium: 0, high: 0, veryHigh: 0, redFlag: 0 }, highestEvidenceLevel: 2, mostCommonType: "active", asciConcernCount: 0, drugBoundaryCount: 0 },
    ingredientTransparency: { score: 3, label: "Good consumer transparency", fullInciAvailable: true, inciSource: "Brand PDP", inciOrderCorrect: true, activePercentagesDisclosed: false, complexesExplained: false, preservativesVisible: true, fragranceDisclosed: true, phDisclosedWhereRelevant: false, usageWarningsClear: true, issues: [] },
    formulaLogic: { heroIngredientsMatchClaim: true, formatSuitableForClaim: true, activesLikelyMeaningful: true, baseFormulaAppropriate: true, claimOverreach: false, claimOverreachNote: null, irritancyConcerns: [], note: "" },
    consumerSuitability: { bestFor: [], avoidIf: [], routineFit: "", layeringNotes: "", sensitivityRisk: "", immediateExpectation: "", longTermExpectation: "", pregnancyOrTeenNote: null },
    platformParity: { consistent: true, issues: [], amplificationPattern: null, mostCautiousPlatform: "", packVsOnline: "", reelAngle: "" },
    scores: { priceFairness: 8, claimClarity: 12, claimEvidence: 12, ingredientTransparency: 15, formulaLogic: 12, consumerSuitability: 8, platformConsistency: 9, total: 76, label: "Mostly Transparent" },
    verdict: { bestThing: "", biggestConcern: "", claimRisk: "low", transparencyLevel: "good", whoItMaySuit: "", whoShouldBeCareful: "", cleanSheetTakeaway: "" },
    reelVersion: { costAcrossPlatforms: "", whatItClaims: "", whatProofIsVisible: "", whatFormulaSupports: "", whatConsumerShouldExpect: "" },
    dataSource: { inciFound: true, inciSource: "INCIDecoder", priceSource: "Nykaa", reviewPlatforms: [], rating: null, reviewCount: "", userSentiment: "" },
    cleanSheetNote: "",
    ...p,
  };
}

export const SAMPLE_MINIMALIST_B5: ProductReview = makeReview({
  productName: "Vitamin B5 10% Moisturizer",
  brand: "Minimalist",
  category: "Facial Moisturizer",
  quantity: "50g",
  heroPromise: "Boosted with Hyaluronic Acid & Betaine for multi-level hydration",
  inciSourceUrl: "https://incidecoder.com/products/be-minimalist-vitamin-b5-10-moisturizer",
  inciIngredients: ["Water/Aqua", "Cyclopentasiloxane", "Panthenol", "PEG/PPG-18/18 Dimethicone", "Glycerin", "Hydrogenated Polyisobutene", "Betaine", "Sodium Hyaluronate", "Allantoin", "Copper Gluconate", "Dimethicone Crosspolymer", "Xylitylglucoside", "Anhydroxylitol", "Xylitol", "Magnesium Aspartate", "Zinc Gluconate", "Pentylene Glycol", "Magnesium Sulphate Heptahydrate", "Phenoxyethanol", "Hydroxyethyl Acrylate/Sodium Acryloyldimethyl Taurate Copolymer", "Carbomer", "Ethylhexylglycerin"],
  ingredientTransparency: { score: 4, label: "Strong formula transparency", fullInciAvailable: true, inciSource: "Brand PDP", inciOrderCorrect: true, activePercentagesDisclosed: true, complexesExplained: true, preservativesVisible: true, fragranceDisclosed: true, phDisclosedWhereRelevant: true, usageWarningsClear: true, issues: [] },
  claimMap: [
    { text: "10% Panthenol (Vitamin B5)", source: "Brand Website", types: ["active"], primaryType: "active", riskLevel: "low", evidenceLevel: 3, evidenceNote: "Concentration disclosed and matches INCI position.", absoluteLanguage: false, asciConcern: false, asciNote: null, drugBoundaryRisk: false, drugBoundaryNote: null },
    { text: "Boosted with Hyaluronic Acid", source: "Amazon Title", types: ["active"], primaryType: "active", riskLevel: "red-flag", evidenceLevel: 1, evidenceNote: "Claiming an active not present, contradicted by the product's own INCI.", absoluteLanguage: false, asciConcern: true, asciNote: "misleading under ASCI 1.1", drugBoundaryRisk: false, drugBoundaryNote: null },
    { text: "Oil-free, lightweight moisturization", source: "Brand Website", types: ["functional"], primaryType: "functional", riskLevel: "low", evidenceLevel: 3, evidenceNote: "Consistent with a water/silicone base.", absoluteLanguage: false, asciConcern: false, asciNote: null, drugBoundaryRisk: false, drugBoundaryNote: null },
    { text: "Fragrance Free", source: "Brand Website", types: ["free-from"], primaryType: "free-from", riskLevel: "low", evidenceLevel: 3, evidenceNote: "No Parfum in the INCI - supported.", absoluteLanguage: true, asciConcern: false, asciNote: null, drugBoundaryRisk: false, drugBoundaryNote: null },
  ],
});

export const SAMPLE_EXAMPLE_SUNSCREEN: ProductReview = makeReview({
  productName: "Example SPF 50 Sunscreen (demo)",
  brand: "Sample Co.",
  category: "Recreational Sunscreens",
  quantity: "50ml",
  heroPromise: "Broad-spectrum SPF 50 PA++++ daily protection",
  inciIngredients: ["Aqua", "Homosalate", "Ethylhexyl Salicylate", "Benzophenone-3", "Octocrylene", "Butyl Methoxydibenzoylmethane", "Glycerin", "Butylene Glycol", "Cocos Nucifera Oil", "Parfum", "Limonene", "Linalool", "Phenoxyethanol", "Tocopherol"],
  ingredientTransparency: { score: 2, label: "Basic label transparency", fullInciAvailable: true, inciSource: "Amazon", inciOrderCorrect: true, activePercentagesDisclosed: false, complexesExplained: false, preservativesVisible: true, fragranceDisclosed: false, phDisclosedWhereRelevant: false, usageWarningsClear: false, issues: ["Fragrance not broken down", "No SPF test evidence"] },
  scores: { priceFairness: 7, claimClarity: 9, claimEvidence: 6, ingredientTransparency: 7, formulaLogic: 10, consumerSuitability: 6, platformConsistency: 8, total: 53, label: "High Claim Risk" },
  claimMap: [
    { text: "Broad-spectrum SPF 50 PA++++", source: "Brand Website", types: ["safety"], primaryType: "safety", riskLevel: "medium", evidenceLevel: 2, evidenceNote: "UV filters present; no ISO 24444 test published.", absoluteLanguage: false, asciConcern: false, asciNote: null, drugBoundaryRisk: false, drugBoundaryNote: null },
    { text: "No white cast, lightweight", source: "Amazon Title", types: ["appearance"], primaryType: "appearance", riskLevel: "low", evidenceLevel: 2, evidenceNote: "", absoluteLanguage: false, asciConcern: false, asciNote: null, drugBoundaryRisk: false, drugBoundaryNote: null },
  ],
});
