/* ────────────────────────────────────────────────────────────────
   Demo fixtures - real INCI, used to render the analysis layer on
   localhost without a live model/API call. Fixture 2 is a labelled
   EXAMPLE sunscreen (not a real brand) built to exercise the adverse /
   red-flag path (oxybenzone → endocrine screen; SPF evidence gap).
──────────────────────────────────────────────────────────────── */

import type { ProductReview } from "@/lib/product-review-types";
import { makeInciEvidence } from "@/lib/review-verifier";

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

/* Fixture 3 is a labelled EXAMPLE mineral sunscreen (not a real brand or product), filled in every field the pills page
   reads, with an ingredient list anchored to INCIDecoder so it reaches a Good choice. It exists to render the 13-block page
   on localhost and to test the page model. */
const MINERAL_LIST = ["Dimethicone", "Zinc Oxide", "Titanium Dioxide", "Isododecane", "Caprylic/Capric Triglyceride", "Silica", "Dimethicone Crosspolymer", "Triethoxycaprylylsilane", "Caprylyl Glycol", "Tocopherol"];
export const SAMPLE_EXAMPLE_MINERAL_SUNSCREEN: ProductReview = makeReview({
  productName: "Example Mineral Sunscreen SPF 50 PA++++ (demo)",
  brand: "Sample Co.",
  category: "Sunscreen",
  quantity: "50 g",
  priceRange: "₹649 to ₹699",
  lowestPrice: "₹649",
  pricePerMl: "₹13/g",
  priceInsight: "Priced in the middle of Indian mineral sunscreens; the cheapest listing is on Amazon.",
  targetUser: "Oily and sensitive skin; daily outdoor use",
  heroPromise: "Mineral-only broad-spectrum protection in a fragrance-free silicone gel",
  priceAcrossPlatforms: [
    { platform: "Nykaa", price: "₹699", pricePerMl: "₹14/g", note: null },
    { platform: "Amazon", price: "₹649", pricePerMl: "₹13/g", note: null },
    { platform: "Brand Website", price: "₹699", pricePerMl: "₹14/g", note: null },
  ],
  reviewedAt: "2026-10-20T00:00:00.000Z",
  inciIngredients: MINERAL_LIST,
  inciSourceUrl: "https://incidecoder.com/products/example-mineral-sunscreen",
  inciEvidence: makeInciEvidence("https://incidecoder.com/products/example-mineral-sunscreen", MINERAL_LIST.join(", "), "2026-10-20T00:00:00.000Z", "Example Mineral Sunscreen SPF 50 PA++++"),
  ingredientTransparency: { score: 4, label: "Strong formula transparency", fullInciAvailable: true, inciSource: "INCIDecoder", inciOrderCorrect: true, activePercentagesDisclosed: true, complexesExplained: true, preservativesVisible: true, fragranceDisclosed: true, phDisclosedWhereRelevant: true, usageWarningsClear: false, issues: ["The pack gives no amount per application"] },
  formulaLogic: { heroIngredientsMatchClaim: true, formatSuitableForClaim: true, activesLikelyMeaningful: true, baseFormulaAppropriate: true, claimOverreach: false, claimOverreachNote: null, irritancyConcerns: [], note: "Anhydrous silicone gel. The right vehicle for a mineral filter." },
  consumerSuitability: {
    bestFor: ["Oily and combination skin", "Daily outdoor use through an Indian summer", "Skin that reacts to fragrance"],
    avoidIf: ["You want a fully invisible finish on a deep skin tone: mineral filters can leave a slight cast"],
    routineFit: "The last step of the morning routine, after moisturiser.",
    layeringNotes: "Wait a minute after moisturiser, then apply. Make-up can go on once it has set.",
    sensitivityRisk: "Low: no fragrance and no chemical filters.",
    immediateExpectation: "A matte, silky finish with a slight cast on deeper skin tones.",
    longTermExpectation: "Daily use lowers cumulative sun exposure. It does not treat pigmentation that is already there.",
    pregnancyOrTeenNote: null,
  },
  indiaContext: "India's UV index stays high through most of the year, so a daily broad-spectrum sunscreen matters here more than the SPF number alone. A silicone gel base wears comfortably in heat and humidity.",
  scores: { priceFairness: 7, claimClarity: 11, claimEvidence: 15, ingredientTransparency: 16, formulaLogic: 14, consumerSuitability: 8, platformConsistency: 9, total: 80, label: "Clean Sheet Strong" },
  claimSummary: { total: 4, byRisk: { low: 3, medium: 1, high: 0, veryHigh: 0, redFlag: 0 }, highestEvidenceLevel: 5, mostCommonType: "safety", asciConcernCount: 0, drugBoundaryCount: 0 },
  verdict: { bestThing: "A published SPF test and a short, fragrance-free mineral formula.", biggestConcern: "The cast on deeper skin tones.", claimRisk: "low", transparencyLevel: "strong", whoItMaySuit: "Oily and sensitive skin", whoShouldBeCareful: "Deep skin tones that dislike any cast", cleanSheetTakeaway: "A short, fragrance-free mineral sunscreen with a published SPF test." },
  claimMap: [
    { text: "Broad-spectrum SPF 50 PA++++", source: "Brand Website", types: ["safety"], primaryType: "functional", riskLevel: "low", evidenceLevel: 5, evidenceNote: "A named third-party lab SPF report is published; the full method is not.", absoluteLanguage: false, asciConcern: false, asciNote: null, drugBoundaryRisk: false, drugBoundaryNote: null, corroborated: true },
    { text: "Fragrance free", source: "Brand Website", types: ["free-from"], primaryType: "free-from", riskLevel: "low", evidenceLevel: 3, evidenceNote: "No fragrance in the ingredient list.", absoluteLanguage: false, asciConcern: false, asciNote: null, drugBoundaryRisk: false, drugBoundaryNote: null, corroborated: true },
    { text: "Mineral filters only", source: "Brand Website", types: ["active"], primaryType: "active", riskLevel: "low", evidenceLevel: 3, evidenceNote: "Zinc oxide and titanium dioxide are the only filters listed.", absoluteLanguage: false, asciConcern: false, asciNote: null, drugBoundaryRisk: false, drugBoundaryNote: null, corroborated: true },
    { text: "No white cast", source: "Amazon Title", types: ["appearance"], primaryType: "appearance", riskLevel: "medium", evidenceLevel: 2, evidenceNote: "Mineral filters can leave a cast on deeper skin tones; no test is shown.", absoluteLanguage: false, asciConcern: false, asciNote: null, drugBoundaryRisk: false, drugBoundaryNote: null, corroborated: true },
  ],
});

/* Fixtures 4 and 5 are labelled EXAMPLES (not real brands or products) that reach the other two pills, so all five can be previewed
   at /analysis-preview?pills=1: a cream with a prohibited preservative (Look elsewhere) and a shampoo with a licensed medicine
   active (Medicinal product). Both carry an ingredient list anchored to INCIDecoder. */
const PROHIBITED_LIST = ["Aqua", "Glycerin", "Niacinamide", "Phenoxyethanol", "Formaldehyde"];
export const SAMPLE_EXAMPLE_PROHIBITED: ProductReview = makeReview({
  productName: "Example Preserved Cream (demo)",
  brand: "Sample Co.",
  category: "Moisturizer",
  quantity: "50 g",
  lowestPrice: "₹399",
  priceRange: "₹399",
  reviewedAt: "2026-10-20T00:00:00.000Z",
  inciIngredients: PROHIBITED_LIST,
  inciEvidence: makeInciEvidence("https://incidecoder.com/products/example-preserved-cream", PROHIBITED_LIST.join(", "), "2026-10-20T00:00:00.000Z", "Example Preserved Cream"),
  claimMap: [{ text: "Hydrates for 24 hours", source: "Brand Website", types: ["functional"], primaryType: "functional", riskLevel: "low", evidenceLevel: 3, evidenceNote: "Glycerin is a humectant.", absoluteLanguage: false, asciConcern: false, asciNote: null, drugBoundaryRisk: false, drugBoundaryNote: null, corroborated: true }],
});

const MEDICINAL_LIST = ["Aqua", "Sodium Laureth Sulfate", "Glycerin", "Ketoconazole"];
export const SAMPLE_EXAMPLE_MEDICINAL: ProductReview = makeReview({
  productName: "Example Anti Dandruff Shampoo (demo)",
  brand: "Sample Co.",
  category: "Shampoo",
  quantity: "100 ml",
  lowestPrice: "₹349",
  priceRange: "₹349",
  reviewedAt: "2026-10-20T00:00:00.000Z",
  inciIngredients: MEDICINAL_LIST,
  inciEvidence: makeInciEvidence("https://incidecoder.com/products/example-anti-dandruff-shampoo", MEDICINAL_LIST.join(", "), "2026-10-20T00:00:00.000Z", "Example Anti Dandruff Shampoo"),
});
