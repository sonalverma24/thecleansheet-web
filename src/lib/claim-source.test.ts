import { describe, expect, it } from "vitest";
import { decideReview } from "@/lib/analyser-x";
import { BASE, claimOf, rv } from "@/lib/analyser-x/test-helpers";
import type { ClaimAnalysis, ProductReview } from "./product-review-types";
import { citesBrandWebsite, withBrandWebsiteClaimsOnly } from "./claim-source";

const NOW = "2026-11-02T00:00:00.000Z";

describe("citesBrandWebsite: the brand's own website, named plainly, among the places a claim was seen", () => {
  it.each([
    ["Brand Website", "Be Minimalist"],
    ["Brand Website / Flipkart / Nykaa / Amazon", "Be Minimalist"],
    ["Nykaa / Brand Website", "Dot & Key"],
    ["Flipkart, Brand Website", "Dot & Key"],
    ["Nykaa Description / Brand Website / Flipkart", "Dot & Key"],
    ["Brand Website (Omeocare)", "Omeocare"],
    ["Official Website", "Cetaphil"],
    ["Aestura Website", "Aestura"],
    ["Minimalist.in Consumer Studies", "Minimalist"],
    ["Minimalist.in", "Minimalist"],
    ["Brand Website / Product Pack", "Cetaphil"],
  ])("counts %s", (source, brand) => expect(citesBrandWebsite(source, brand)).toBe(true));

  it.each([
    ["Nykaa Description", "Be Minimalist"],
    ["Nykaa Brand Info", "Re'equil"],
    ["Flipkart", "Re'equil"],
    ["Tira", "Re'equil"],
    ["Re'equil Brand Website (via Clinikally)", "Re'equil"],
    ["Siyara Beauty", "Re'equil"],
    ["Flipkart / Nykaa / Purplle", "Re'equil"],
    ["Brand Website (implied)", "Dot & Key"],
    ["Purplle / Zepto / Brand Website (implied)", "Dot & Key"],
    ["Brand Website (General) / Marketplace (General)", "Dot & Key"],
    ["Common Questions / Brand Website (Global)", "Dot & Key"],
    ["Mirai Skin Review", "Beauty of Joseon"],
    ["Product Pack", "Cetaphil"],
    ["INCIDecoder", "Cetaphil"],
    ["National Eczema Association", "Aestura"],
    ["", "Cetaphil"],
    [undefined, "Cetaphil"],
  ])("does not count %s", (source, brand) => expect(citesBrandWebsite(source as string | undefined, brand)).toBe(false));

  it("does not take another brand's name for the brand's own site", () => {
    expect(citesBrandWebsite("Minimalist Website", "Cetaphil")).toBe(false);
  });
});

describe("withBrandWebsiteClaimsOnly", () => {
  const claim = (text: string, source: string, over: Partial<ClaimAnalysis> = {}): ClaimAnalysis => ({ ...claimOf({ text, evidenceLevel: 3 }), source, ...over } as ClaimAnalysis);
  const review = (claims: ClaimAnalysis[]): ProductReview =>
    rv({ brand: "Re'equil", productName: "Retinol Night Cream", inciIngredients: [...BASE, "Retinol"], claimMap: claims, researchLog: { grounded: true, webSearchQueries: [], sourceUris: [], sourceTitles: [], recordedAt: NOW } });

  it("keeps the brand-website claims, drops the rest, and counts the claim summary again from what is kept", () => {
    const out = withBrandWebsiteClaimsOnly(review([
      claim("For all skin types", "Brand Website", { evidenceLevel: 6, riskLevel: "low" }),
      claim("clinically tested to suit every unique skin type", "Nykaa Brand Info", { riskLevel: "high", asciConcern: true }),
      claim("Treats fine lines & wrinkles", "Re'equil Brand Website (via Clinikally)", { riskLevel: "high", drugBoundaryRisk: true }),
      claim("All Skin Types", "Flipkart", { riskLevel: "high", asciConcern: true }),
    ]));
    expect(out.review.claimMap.map((c) => c.text)).toEqual(["For all skin types"]);
    expect(out.kept).toBe(1);
    expect(out.dropped).toBe(3);
    expect(out.review.claimSummary).toMatchObject({ total: 1, byRisk: { low: 1, medium: 0, high: 0, veryHigh: 0, redFlag: 0 }, highestEvidenceLevel: 6, asciConcernCount: 0, drugBoundaryCount: 0 });
    expect(out.review.researchLog).toMatchObject({ claimsKept: 1, claimsDropped: 3 });
  });

  it("does not change the review it was given", () => {
    const r = review([claim("a", "Brand Website"), claim("b", "Nykaa Description")]);
    withBrandWebsiteClaimsOnly(r);
    expect(r.claimMap).toHaveLength(2);
    expect(r.researchLog).not.toHaveProperty("claimsKept");
  });
});

describe("a product whose brand page gave no claims reads 'claims not examined', not 'no claims'", () => {
  const ruleIds = (r: ProductReview) => decideReview(r, NOW).decision.reasons.map((x) => x.ruleId);
  const log = (kept: number, dropped: number) => ({ grounded: true, webSearchQueries: [], sourceUris: [], sourceTitles: [], recordedAt: NOW, claimsKept: kept, claimsDropped: dropped });

  it("raises the acquisition gap when claims were dropped and none kept", () => {
    expect(ruleIds(rv({ claimMap: [], researchLog: log(0, 4) }))).toContain("gap.claims_unreliable");
  });

  it("also when none were kept and none dropped: with no readable brand page the model returns an empty list, which records exactly that (2026-11-04)", () => {
    expect(ruleIds(rv({ claimMap: [], researchLog: log(0, 0) }))).toContain("gap.claims_unreliable");
  });

  it("does not when some were kept, or on an analysis made before the rule", () => {
    expect(ruleIds(rv({ claimMap: [], researchLog: log(2, 4) }))).not.toContain("gap.claims_unreliable");
    expect(ruleIds(rv({ claimMap: [] }))).not.toContain("gap.claims_unreliable");
  });
});
