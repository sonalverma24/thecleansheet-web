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

describe("sanitizeInciList refuses a list of concentration claims", () => {
  // 2026-11-03: WishCare's Nykaa panel gave "0.1% Retinal, Tetrapeptide, 3% Caffeine, Niacinamide & Ginseng Pdrn", the key actives, and a re-run took them for the whole ingredient list.
  it("refuses the key actives a Nykaa panel gave for WishCare, so they are never taken for the INCI", () => {
    const r = sanitizeInciList(["0.1% Retinal", "Tetrapeptide", "3% Caffeine", "Niacinamide & Ginseng Pdrn"]);
    expect(r.ok).toBe(false);
    expect(r.issues.filter((x) => x.startsWith("concentration claim"))).toHaveLength(2);
    expect(r.list).not.toContain("0.1% Retinal");
  });

  it("refuses a full-length list too when most of its entries carry a concentration", () => {
    expect(sanitizeInciList(["10% Niacinamide", "5% Panthenol", "2% Salicylic Acid", "1% Allantoin", "Aqua", "Glycerin"]).ok).toBe(false);
  });

  it("keeps every real INCI name that starts with a digit or has a number in it", () => {
    const r = sanitizeInciList(["Aqua", "1,2-Hexanediol", "3-O-Ethyl Ascorbic Acid", "4-Methylbenzylidene Camphor", "2-Bromo-2-Nitropropane-1,3-Diol", "PEG-40 Hydrogenated Castor Oil", "C12-15 Alkyl Benzoate", "CI 77891"]);
    expect(r.ok).toBe(true);
    expect(r.issues).toEqual([]);
    expect(r.list).toHaveLength(8);
  });

  it("tolerates one stray claim in a real list, as it tolerates one stray non-ingredient", () => {
    expect(sanitizeInciList(["Aqua", "Glycerin", "Niacinamide", "Panthenol", "Tocopherol", "Phenoxyethanol", "Allantoin", "Xanthan Gum", "Sodium Hyaluronate", "Carbomer", "2% Ceramide"]).ok).toBe(true);
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

import { pageTitleNamesProduct } from "./product-identity";

describe("pageTitleNamesProduct: does a candidate ingredient page name the shopper's product (owner decision, 2026-10-30)", () => {
  const AQUA = "Aqualogica Glow Hydra Gel Moisturizer With Papaya Vitamin C For 24 Hour Intense Hydration";

  it("accepts a page whose whole name sits inside the shopper's longer retailer name", () => {
    expect(pageTitleNamesProduct("Aqualogica Glow+ Hydra Gel Moisturizer", "Aqualogica", AQUA)).toBe(true);
    expect(pageTitleNamesProduct("Aqualogica Glow+ Hydra Gel Moisturizer With Papaya & Vitamin C For 24 Hour Intense Hydration(100g)", "Aqualogica", AQUA)).toBe(true);
  });

  it("the old rule is not what accepts it: the stricter titleIdentifiesProduct still refuses the short title", () => {
    expect(titleIdentifiesProduct("Aqualogica Glow+ Hydra Gel Moisturizer", "Aqualogica", AQUA)).toBe(false);
  });

  it("refuses a different product with a similar name: another type, another variant, another brand", () => {
    for (const title of ["Aqualogica Glow+ Oil Free Moisturizer With Papaya & Vitamin C", "Aqualogica Glow+ Jello Moisturizer", "Aqualogica Glow+ Hydra Gel Cleanser", "Aqualogica Glow+ Hydra Gel Sunscreen SPF 50", "Plix Glow Hydra Gel Moisturizer"])
      expect(pageTitleNamesProduct(title, "Aqualogica", AQUA), title).toBe(false);
  });

  it("refuses a short generic title, which could match many products", () => {
    expect(pageTitleNamesProduct("Aqualogica Gel Moisturizer", "Aqualogica", AQUA)).toBe(false);
    expect(pageTitleNamesProduct("Minimalist Niacinamide Serum", "Minimalist", "Minimalist 10% Niacinamide Serum 30ml")).toBe(false);
  });

  it("refuses a missing title", () => {
    expect(pageTitleNamesProduct(null, "Aqualogica", AQUA)).toBe(false);
    expect(pageTitleNamesProduct("", "Aqualogica", AQUA)).toBe(false);
  });
});
