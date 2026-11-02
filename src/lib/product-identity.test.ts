import { describe, expect, it } from "vitest";
import { IDENTITY_PLACEHOLDER, isSameProduct, sanitizeInciList, titleIdentifiesProduct } from "@/lib/product-identity";

const B = "Conscious Chemist";
const full = ["Aqua", "Zinc Oxide", "Glycerin", "Niacinamide", "Squalane", "Bisabolol", "Allantoin", "Phenoxyethanol", "Carnauba Wax", "Resveratrol"];

describe("isSameProduct", () => {
  it("ignores word order, PA rating and a repeated brand", () => {
    const a = { productName: "100% Mineral Sunscreen SPF 50 PA++++ Ultra Light Fluid", brand: B };
    const b = { productName: "100% Mineral Sunscreen Ultra Light Fluid SPF 50 PA++++", brand: B };
    const c = { productName: "Conscious Chemist 100% Mineral Sunscreen SPF 50 PA++++ Ultra Light Fluid", brand: B };
    expect(isSameProduct(a, b)).toBe(true);
    expect(isSameProduct(a, c)).toBe(true);
  });
  it("treats a shorter name as the same product only when the formula matches", () => {
    const short = { productName: "100% Mineral Sunscreen SPF 50 PA++++", brand: B, inci: full };
    const long = { productName: "100% Mineral Sunscreen SPF 50 PA++++ Ultra Light Fluid", brand: B, inci: full };
    expect(isSameProduct(short, long)).toBe(true);
    expect(isSameProduct(short, { ...long, inci: ["Aqua", "Iron Oxides", "Mica", "Dimethicone"] })).toBe(false);
    expect(isSameProduct({ ...short, inci: undefined }, long)).toBe(false);
  });
  it("keeps different SPF or brand apart", () => {
    expect(isSameProduct({ productName: "Sunscreen SPF 30", brand: B }, { productName: "Sunscreen SPF 50", brand: B })).toBe(false);
    expect(isSameProduct({ productName: "Sunscreen SPF 50", brand: B }, { productName: "Sunscreen SPF 50", brand: "Other" })).toBe(false);
  });
});

describe("titleIdentifiesProduct", () => {
  const C = "Cetaphil";
  it("accepts a storefront title that carries the product's own name", () => {
    expect(titleIdentifiesProduct("Cetaphil Gentle Skin Cleanser For Normal, Dry Skin Hydrates 125ml", C, "Cetaphil Gentle Skin Cleanser")).toBe(true);
    expect(titleIdentifiesProduct("Buy Gentle Skin Cleansers Online", C, "Gentle Skin Cleanser")).toBe(true);
  });
  it("rejects a sibling product of the same brand", () => {
    expect(titleIdentifiesProduct("Cetaphil Gentle Skin Cleanser For Normal, Dry Skin 125ml", C, "Cetaphil Facial Cleanser")).toBe(false);
  });
  it("rejects a search page, a missing title and an empty product name", () => {
    expect(titleIdentifiesProduct("Buy Cosmetics Products & Beauty Products Online in India at Best Price | Nykaa", C, "Cetaphil Facial Cleanser")).toBe(false);
    expect(titleIdentifiesProduct(null, C, "Cetaphil Facial Cleanser")).toBe(false);
    expect(titleIdentifiesProduct("Cetaphil", C, "Cetaphil")).toBe(false);
  });
});

describe("sanitizeInciList", () => {
  it("passes a clean list through", () => {
    const r = sanitizeInciList(full);
    expect(r.ok).toBe(true);
    expect(r.issues).toEqual([]);
  });
  it("splits and-joined items", () => {
    const r = sanitizeInciList(["Aqua", "Zinc Oxide and Coco-Caprylate/Caprate", "Glycerin", "Niacinamide"]);
    expect(r.list).toContain("Coco-Caprylate/Caprate");
    expect(r.list).toContain("Zinc Oxide");
    expect(r.issues.length).toBe(1);
  });
  it("rejects marketing sentences", () => {
    const r = sanitizeInciList(["Aqua", "Lightweight formula that absorbs instantly without any white cast on skin", "Free from parabens and sulphates and alcohol and fragrance"]);
    expect(r.ok).toBe(false);
  });
});

describe("IDENTITY_PLACEHOLDER", () => {
  it("matches the wording a page, a scraper or the model puts where a name should be", () => {
    for (const text of [
      "Page Not Found", "404", "Service Unavailable", "N/A", "Not available", "Unknown product", "Product not identified from partial INCI",
      // what the model wrote for a pasted list on 2026-09-02, and its likely variants
      "Not Identified Product", "Not Identified (Based on provided INCI)", "not identified product not identified based on provided inci",
      "Unidentified Product", "Unknown Formulation", "Unknown Brand Serum", "Unnamed Formulation", "Not specified",
      "Product based on the provided ingredient list", "Based on pasted INCI", "Provided INCI Analysis", "Pasted Ingredient List", "User-provided ingredients",
      "INCI Analysis", "Ingredient List Analysis", "Ingredients only analysis",
    ]) expect(IDENTITY_PLACEHOLDER.test(text), text).toBe(true);
  });

  it("does not match a real product or brand name", () => {
    for (const text of [
      "Cetaphil Gentle Skin Cleanser", "Cetaphil", "The Ordinary Niacinamide 10% + Zinc 1%", "Minimalist", "Dot & Key", "Not Your Mother's Clean Freak",
      "Hydro Boost Water Gel", "Inci Skin Lab", "Ingredient Brew Hair Oil", "Skin Barrier Cream", "Identity Foundation", "Unseen Sunscreen",
    ]) expect(IDENTITY_PLACEHOLDER.test(text), text).toBe(false);
  });
});
