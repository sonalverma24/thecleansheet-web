/* Synthetic review builders shared by the verifier and parity tests. Everything here is
   constructed: none of it is a real product, and it asserts nothing about chemistry. */

import { makeInciEvidence } from "@/lib/review-verifier";
import type { ClaimAnalysis, ProductReview } from "@/lib/product-review-types";

export const claim: ClaimAnalysis = {
  text: "Clinically tested on 40 people", source: "brand site", types: ["clinical"], primaryType: "clinical",
  riskLevel: "low", evidenceLevel: 4, evidenceNote: "", absoluteLanguage: false, asciConcern: false,
  asciNote: null, drugBoundaryRisk: false, drugBoundaryNote: null, corroborated: true,
};

const BASE_INCI = ["Aqua", "Glycerin", "Niacinamide", "Phenoxyethanol"];

export function makeReview(over: Partial<ProductReview> = {}): ProductReview {
  return {
    type: "product-review", productName: "Test Face Wash", brand: "Test", category: "Face wash",
    quantity: "100 ml", priceRange: "Rs 499", pricePerMl: "Rs 5", lowestPrice: "Rs 499", priceInsight: "",
    priceAcrossPlatforms: [], parentCompany: null, targetUser: "", heroPromise: "",
    claimMap: [{ ...claim }],
    formulaLogic: { claimOverreach: false, claimOverreachNote: null, note: "", irritancyConcerns: [] },
    ingredientTransparency: { score: 4, issues: [], fullInciAvailable: true, complexesExplained: true },
    consumerSuitability: { bestFor: [], avoidIf: [] },
    platformParity: { consistent: true, issues: [] },
    verdict: { bestThing: "", biggestConcern: "", cleanSheetTakeaway: "" },
    scores: {
      priceFairness: 9, claimClarity: 13, claimEvidence: 16, ingredientTransparency: 16,
      formulaLogic: 12, consumerSuitability: 8, platformConsistency: 8, total: 82, label: "Mostly Transparent",
    },
    inciIngredients: [...BASE_INCI],
    ...over,
  } as unknown as ProductReview;
}

/** One synthetic review per displayed-standing target, built so the CURRENT verdict code
    lands on that internal tier. The parity test asserts it does. */
export type StandingTarget = "approved" | "mostly-clean" | "can-do-better" | "not-recommended" | "not-assessed";

export interface BuildOptions {
  catchAll?: boolean;
  noList?: boolean;
  evidence?: "none" | "anchored" | "unverified";
  dispute?: boolean;
}

export function buildStanding(target: StandingTarget, o: BuildOptions = {}): ProductReview {
  let inci = [...BASE_INCI];
  const over: Partial<ProductReview> = {};

  switch (target) {
    case "approved":
      over.scores = { priceFairness: 10, claimClarity: 15, claimEvidence: 20, ingredientTransparency: 20, formulaLogic: 15, consumerSuitability: 10, platformConsistency: 10, total: 100, label: "Clean Sheet Strong" };
      over.claimMap = [{ ...claim, evidenceLevel: 6 }];
      break;
    case "can-do-better":
      over.scores = { priceFairness: 4, claimClarity: 8, claimEvidence: 5, ingredientTransparency: 8, formulaLogic: 7, consumerSuitability: 5, platformConsistency: 5, total: 42, label: "High Claim Risk" };
      break;
    case "not-recommended":
      inci = [...inci, "Methylparaben"];
      over.claimMap = [{
        ...claim, text: "Paraben-Free", types: ["free-from"], primaryType: "free-from", riskLevel: "red-flag", evidenceLevel: 1,
        evidenceNote: "The retrieved INCI lists Methylparaben, which contradicts the claim.",
      }];
      break;
    case "not-assessed":
      inci = [...inci, "Ketoconazole"];
      over.productName = "Anti Dandruff Shampoo";
      break;
    default:
      break; // mostly-clean is the default review
  }

  if (o.catchAll) inci = [...inci, "Soap Base"];
  if (o.noList) { over.inciIngredients = []; over.ingredientReads = []; } else { over.inciIngredients = inci; }

  if (o.evidence === "anchored") over.inciEvidence = makeInciEvidence("https://incidecoder.com/products/x", "Aqua, Glycerin", "2026-10-21T00:00:00.000Z", "Test Face Wash");
  if (o.evidence === "unverified") over.inciEvidence = makeInciEvidence("https://brand.example/p", "", "2026-10-21T00:00:00.000Z");
  if (o.dispute) {
    over.verdict = { bestThing: "", cleanSheetTakeaway: "", biggestConcern: "'Alcohol-free' and 'Oil-free' claims are contradicted by INCI." } as ProductReview["verdict"];
  }
  return makeReview(over);
}
