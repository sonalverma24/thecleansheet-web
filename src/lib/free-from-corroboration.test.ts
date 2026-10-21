import { describe, expect, it } from "vitest";
import { deriveVerdict, markClaimCorroboration } from "@/lib/product-review-engine";
import type { ClaimAnalysis, ProductReview } from "@/lib/product-review-types";

/* Regressions for two holes in the "free-from" hard flag (Not Recommended).

   1. "Cetaphil Facial Cleanser" was stored as Not Recommended because "Fragrance-free"
      (cetaphil.in copy for a different product) was set against an INCIDecoder list for
      another formula that contains Parfum. The claim had been "corroborated" by a Nykaa
      search page. A free-from contradiction may only stand when a page about THIS
      product was read, so uncorroborated it must not count.
   2. Da Membrane's product page names "Fragrance" once - as an ingredient - and makes no
      fragrance-free claim, yet the claim was marked corroborated by the bare word. The
      contradicting ingredient must not vouch for the claim it contradicts. */

const claim: ClaimAnalysis = {
  text: "Clinically tested on 40 people", source: "brand site", types: ["clinical"], primaryType: "clinical",
  riskLevel: "low", evidenceLevel: 4, evidenceNote: "", absoluteLanguage: false, asciConcern: false,
  asciNote: null, drugBoundaryRisk: false, drugBoundaryNote: null, corroborated: true,
};

function makeReview(over: Partial<ProductReview> = {}): ProductReview {
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
    inciIngredients: ["Aqua", "Glycerin", "Niacinamide", "Phenoxyethanol"],
    ...over,
  } as unknown as ProductReview;
}

const fragranceFree = (corroborated: boolean | undefined): ClaimAnalysis => ({
  ...claim, text: "Fragrance-free", types: ["free-from"], primaryType: "free-from", riskLevel: "red-flag",
  evidenceLevel: 1, evidenceNote: "The retrieved INCI lists Parfum, which contradicts the claim.", corroborated,
});

const withParfum = (corroborated: boolean | undefined) =>
  makeReview({ claimMap: [fragranceFree(corroborated)], inciIngredients: ["Aqua", "Glycerin", "Sodium Laureth Sulfate", "Parfum", "Phenoxyethanol"] });

describe("free-from contradiction needs a corroborating page about this product", () => {
  it("stands when the claim was found on the product's own page", () => {
    expect(deriveVerdict(withParfum(true)).tier).toBe("not-recommended");
  });
  it("does not count when no page about this product was read", () => {
    expect(deriveVerdict(withParfum(undefined)).tier).not.toBe("not-recommended");
  });
  it("does not count when the claim was not found in the page that was read", () => {
    expect(deriveVerdict(withParfum(false)).tier).not.toBe("not-recommended");
  });
});

const PAD = "Hydrates skin, soothes irritation and supports the barrier. Suitable for everyday use morning and night. ".repeat(6);
const corroboratedBy = (text: string) => {
  const r = makeReview({ claimMap: [fragranceFree(undefined)] });
  markClaimCorroboration(r, text);
  return r.claimMap[0].corroborated;
};

describe("markClaimCorroboration on a free-from claim", () => {
  it("is not corroborated by the ingredient it contradicts", () => {
    expect(corroboratedBy(`${PAD} Alcohol Free. Paraben Free. Ingredients: Purified Water, Niacinamide, Panthenol, Fragrance, Sodium Benzoate. Product Benefits`)).toBe(false);
  });
  it("is corroborated when the page asserts it", () => {
    expect(corroboratedBy(`${PAD} Suitable for all skin types, this fragrance-free and paraben-free cleanser cleans gently.`)).toBe(true);
    expect(corroboratedBy(`${PAD} Free from parabens, sulphates and fragrance.`)).toBe(true);
    expect(corroboratedBy(`${PAD} Made without added fragrance.`)).toBe(true);
  });
  it("leaves a non-free-from claim on the simple word match", () => {
    const r = makeReview({ claimMap: [{ ...claim, text: "Cures dandruff", riskLevel: "red-flag", drugBoundaryRisk: true, corroborated: undefined }] });
    markClaimCorroboration(r, `${PAD} This shampoo helps with dandruff.`);
    expect(r.claimMap[0].corroborated).toBe(true);
  });
});
