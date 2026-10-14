import { describe, expect, it } from "vitest";
import type { ClaimAnalysis, DerivedVerdict, ProductReview } from "@/lib/product-review-types";
import { babyLens } from "./baby-lens";
import { buildVerification, formatUpdated, qualifiesForStamp } from "./pitch-verification";

const claim = (over: Partial<ClaimAnalysis>): ClaimAnalysis =>
  ({
    text: "Hydration for 24 hours",
    source: "brand page",
    types: ["functional"],
    primaryType: "functional",
    riskLevel: "low",
    evidenceLevel: 5,
    evidenceNote: "Finished-product hydration study.",
    absoluteLanguage: false,
    asciConcern: false,
    asciNote: null,
    drugBoundaryRisk: false,
    drugBoundaryNote: null,
    ...over,
  }) as ClaimAnalysis;

const INCI = ["Aqua", "Glycerin", "Avena Sativa (Oat) Kernel Flour", "Cetyl Alcohol", "Allantoin"];

const review = (over: Partial<ProductReview> = {}): ProductReview =>
  ({
    productName: "Example Baby Moisturising Lotion",
    brand: "Example",
    category: "Baby Care",
    quantity: "200 ml",
    targetUser: "babies",
    inciIngredients: INCI,
    claimMap: [
      claim({}),
      claim({ text: "Soothes dry skin", evidenceLevel: 2, evidenceNote: "Ingredient evidence only." }),
      claim({ text: "Loved by mums", primaryType: "emotional", evidenceLevel: 1 }),
    ],
    dataSource: { inciFound: true, inciSource: "brand", priceSource: "", reviewPlatforms: ["Nykaa", "Amazon.in"], rating: 4.6, reviewCount: "5,382", userSentiment: "" },
    ...over,
  }) as unknown as ProductReview;

const verdict = (tier: DerivedVerdict["tier"]) => ({ tier }) as DerivedVerdict;
const lens = (inci = INCI) => babyLens({ productName: "Example Baby Moisturising Lotion", inci });

describe("qualifiesForStamp", () => {
  it("needs the strict approved tier AND a passing baby lens", () => {
    expect(qualifiesForStamp(verdict("approved"), lens())).toBe(true);
    expect(qualifiesForStamp(verdict("mostly-clean"), lens())).toBe(false);
    expect(qualifiesForStamp(verdict("approved"), lens([...INCI, "Methylisothiazolinone"]))).toBe(false);
  });
});

describe("buildVerification", () => {
  it("returns null for a product that has not earned the stamp", () => {
    expect(buildVerification(review(), verdict("mostly-clean"), lens(), "14 Oct 26")).toBeNull();
    expect(buildVerification(review(), verdict("can-do-better"), lens(), "14 Oct 26")).toBeNull();
  });

  it("counts only finished-product claims as supported and ignores emotional ones", () => {
    const v = buildVerification(review(), verdict("approved"), lens(), "14 Oct 26")!;
    expect(v.source).toBe("engine");
    expect(v.claims.assessed).toBe(2);
    expect(v.claims.supported).toBe(1);
    expect(v.claims.checks.map((c) => c.text)).toEqual(["Hydration for 24 hours"]);
  });

  it("does not count a claim the page never made", () => {
    const r = review({ claimMap: [claim({}), claim({ text: "Invented claim", corroborated: false })] });
    const v = buildVerification(r, verdict("approved"), lens(), "14 Oct 26")!;
    expect(v.claims.assessed).toBe(1);
  });

  it("reports ingredient counts, fragrance-free and detail chips from the data", () => {
    const v = buildVerification(review(), verdict("approved"), lens(), "14 Oct 26")!;
    expect(v.ingredients).toMatchObject({ screened: 5, total: 5 });
    expect(v.ingredients.checks.map((c) => c.text)).toContain("Fragrance-free");
    expect(v.details).toEqual(["Baby", "200 ml", "Baby Care"]);
  });

  it("only shows review lines it has data for", () => {
    const v = buildVerification(review(), verdict("approved"), lens(), "14 Oct 26")!;
    expect(v.reviews.analysed).toBe(5382);
    expect(v.reviews.indianMarketplaces).toBe("4.6 out of 5 · 5,382 ratings · Nykaa, Amazon.in");
    expect(v.reviews.globalMarketplaces).toBeUndefined();
    expect(v.reviews.communities).toBeUndefined();
  });
});

describe("formatUpdated", () => {
  it("formats like the popup line", () => {
    expect(formatUpdated(new Date(2026, 9, 14))).toBe("14 Oct 26");
  });
});
