import { describe, expect, it } from "vitest";
import { identityDecision, normalisedInciSimilarity } from "@/lib/identity-resolution";
import { inciSimilarity } from "@/lib/product-identity";
import * as G from "@/lib/review-verifier.fixtures";

describe("golden: identity decisions on audited pairs", () => {
  it("the two Pond's light gels are DISTINCT products", () => {
    const r = identityDecision(
      { productName: "Pond's Hydra Miracle Super Light Gel", brand: "Pond's", inci: G.PONDS_HYDRA },
      { productName: "Pond's Super Light Gel Oil Free Moisturiser", brand: "Pond's", inci: G.PONDS_SUPERLIGHT },
    );
    expect(r.verdict).toBe("DISTINCT");
  });

  it("the Derma Co pair has the same name and disagreeing formulas: quarantine, never a silent merge", () => {
    const name = "The Derma Co 1% Hyaluronic Sunscreen Aqua Gel SPF 50 PA++++";
    const r = identityDecision(
      { productName: name, brand: "The Derma Co", inci: G.DERMA_CO_A },
      { productName: name, brand: "The Derma Co", inci: G.DERMA_CO_B },
    );
    expect(r.verdict).toBe("CONFLICT_QUARANTINE");
    expect(r.nameJaccard).toBe(1);
    expect(r.inciJaccard).toBeLessThan(0.5);
  });

  it("the two Cicaplast pages are a probable duplicate (dry-run before any merge)", () => {
    const name = "La Roche-Posay Cicaplast Baume B5+";
    const r = identityDecision(
      { productName: name, brand: "La Roche-Posay", inci: G.CICAPLAST_A },
      { productName: name, brand: "La Roche-Posay", inci: G.CICAPLAST_B },
    );
    expect(r.verdict).toBe("PROBABLE_DUPLICATE");
    expect(r.inciJaccard).toBeGreaterThanOrEqual(0.75);
  });
});

describe("identityDecision: rules the reference implementation left open", () => {
  const name = "Daily Gel Moisturiser";
  const base = ["Water", "Glycerin", "Niacinamide", "Dimethicone", "Panthenol", "Carbomer", "Phenoxyethanol", "Allantoin", "Squalane", "Tocopherol"];

  it("Water and Aqua do not split an identical formula (the bug the harness caught first)", () => {
    const aqua = ["Aqua", ...base.slice(1)];
    expect(inciSimilarity(base, aqua)).toBeLessThan(0.9); // the live comparer sees a difference
    expect(normalisedInciSimilarity(base, aqua)).toBe(1);
    const r = identityDecision({ productName: name, brand: "Acme", inci: base }, { productName: name, brand: "Acme", inci: aqua });
    expect(r.verdict).toBe("PROBABLE_DUPLICATE");
  });

  it("a same-name pair whose formulas half-agree goes to quarantine, not DISTINCT", () => {
    const other = [...base.slice(0, 7), "Urea", "Lactic Acid", "Dimethicol"]; // 7 shared, 3 each unique: Jaccard 0.54
    const r = identityDecision({ productName: name, brand: "Acme", inci: base }, { productName: name, brand: "Acme", inci: other });
    expect(r.inciJaccard).toBeGreaterThanOrEqual(0.5);
    expect(r.inciJaccard).toBeLessThan(0.75);
    expect(r.verdict).toBe("CONFLICT_QUARANTINE");
  });

  it("a same-name pair with no formula on one side cannot be called a duplicate", () => {
    const r = identityDecision({ productName: name, brand: "Acme", inci: base }, { productName: name, brand: "Acme", inci: [] });
    expect([r.verdict, r.inciJaccard]).toEqual(["CONFLICT_QUARANTINE", null]);
  });

  it("different brands are always DISTINCT, even with the same name and formula", () => {
    const r = identityDecision({ productName: name, brand: "Acme", inci: base }, { productName: name, brand: "Other Co", inci: base });
    expect(r.verdict).toBe("DISTINCT");
  });

  it("word order does not matter", () => {
    const r = identityDecision(
      { productName: "Ultra Light Fluid SPF 50", brand: "Acme", inci: base },
      { productName: "SPF 50 Ultra Light Fluid", brand: "Acme", inci: base },
    );
    expect(r.verdict).toBe("PROBABLE_DUPLICATE");
  });

  it("one differing word on each side is a different product, not a quarantine (Jaccard alone says 0.71)", () => {
    const r = identityDecision(
      { productName: "Kind to Skin Moisturising Facial Wash", brand: "Simple", inci: base },
      { productName: "Kind to Skin Refreshing Facial Wash", brand: "Simple", inci: ["Water", "Urea", "Lactic Acid"] },
    );
    expect(r.nameJaccard).toBeGreaterThanOrEqual(0.6);
    expect(r.verdict).toBe("DISTINCT");
  });

  it("a name that contains the other with a different formula (a 10% variant) is quarantined for a person", () => {
    const r = identityDecision(
      { productName: "Vitamin B5 10% Moisturizer", brand: "Be Minimalist", inci: base },
      { productName: "Vitamin B5 Moisturizer", brand: "Be Minimalist", inci: ["Water", "Urea", "Lactic Acid", "Glycerin"] },
    );
    expect(r.verdict).toBe("CONFLICT_QUARANTINE");
  });

  it("a short name nested inside a long one is not the same name (Jaccard floor)", () => {
    const r = identityDecision(
      { productName: "Gel", brand: "Acme", inci: base },
      { productName: "Super Light Gel Oil Free Moisturiser", brand: "Acme", inci: ["Water", "Urea"] },
    );
    expect(r.nameJaccard).toBeLessThan(0.6);
    expect(r.verdict).toBe("DISTINCT");
  });
});
