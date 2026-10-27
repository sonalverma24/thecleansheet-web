import { describe, expect, it } from "vitest";
import { ALL_BRANDS } from "@/data/brands";
import { isRated, unratedKindOf } from "./unrated-kind";

const kind = (productName: string, category = "", inci: string[] = []) => unratedKindOf({ productName, category, inci });

describe("a nutraceutical", () => {
  it("is named by its category: the model's own 'Oral Supplement / Beauty Drink Mix'", () => {
    expect(kind("H2Glow Beauty Hydration Electrolyte Drink Mix with HydraCollagen + Hyaluronic Acid", "Oral Supplement / Beauty Drink Mix")).toBe("nutraceutical");
  });

  it("is named by an explicit word in the product name", () => {
    expect(kind("Glow Collagen Beauty Drink Mix", "")).toBe("nutraceutical");
    expect(kind("Daily Nutraceutical Shot", "Drink")).toBe("nutraceutical");
    expect(kind("Whey Protein Powder 1kg", "")).toBe("nutraceutical");
  });

  it("is named by a swallowed format when the category is not a cosmetic type", () => {
    expect(kind("Biotin Hair Gummies", "Hair Gummies")).toBe("nutraceutical");
    expect(kind("Ashwagandha 60 Capsules", "")).toBe("nutraceutical");
    expect(kind("Marine Collagen Tablets", "Beauty Supplement")).toBe("nutraceutical");
  });
});

describe("cosmetics that look like nutraceuticals stay rated", () => {
  it.each([
    ["Encapsulated 10% Vitamin C Face Serum with 1% B5 & 0.5% HPPA", "serum"],
    ["Vitamin C Capsule Serum, 30 capsules", "Face Serum"],
    ["Niacinamide 5% + Alpha Arbutin Multivitamin Serum", "Serum"],
    ["Probiotic Gentle Cleanser", "Face Wash"],
    ["Omega-3 Barrier Repair Moisturizer", "Moisturizer"],
    ["Skin Supplement Booster Serum", "Face Serum"],
    ["Cleansing Tablets for Face", "Face Wash"],
    ["Biotin Shampoo for Hair Fall", "Shampoo"],
    ["Q+A Collagen Face Cream", "Face Moisturizer & Day Cream"],
    ["Foaming Powder Facewash", "Face Wash"],
    ["Bare To Perfect Translucent Powder", "Translucent Powder"],
    ["Glutathione Soap", "Soap"],
    ["Sunscreen Gel SPF 50", "Sunscreen"],
    ["Effervescent Bath Bomb", "Bath Soak"],
  ])("%s (%s)", (name, category) => {
    expect(kind(name, category)).toBeNull();
    expect(isRated({ productName: name, category })).toBe(true);
  });
});

describe("a prescription drug", () => {
  it("is named by explicit prescription wording", () => {
    expect(kind("Tretinoin Cream 0.025% (Rx only)", "Topical")).toBe("prescription-drug");
    expect(kind("Clindamycin Gel", "Prescription acne treatment")).toBe("prescription-drug");
    expect(kind("Some Gel Schedule H1 drug", "")).toBe("prescription-drug");
  });

  it("is named by an active listed at prescription strength: azelaic acid at 15% or more, as the engine already gates it", () => {
    const inci = ["Azelaic Acid", "Benzoic Acid", "Propylene Glycol", "Cetearyl Octanoate", "Purified Water"];
    expect(kind("Aziderm 20% Cream", "Topical Acne Treatment / Dermaceutical", inci)).toBe("prescription-drug");
    expect(kind("Finacea 15% Gel", "", inci)).toBe("prescription-drug");
  });

  it("is not claimed for an active below prescription strength, or one whose strength we cannot read", () => {
    const inci = ["Aqua", "Azelaic Acid"];
    expect(kind("Azelaic Acid 10% Serum", "Face Serum", inci)).toBeNull();
    expect(kind("Azelaic Acid Serum", "Face Serum", inci)).toBeNull();
  });

  it("is not claimed for a medicine we cannot call prescription-only: a ketoconazole shampoo keeps the Medicinal product page", () => {
    expect(kind("Scalpe Plus Expert Anti-Dandruff Shampoo", "Medicated Anti-Dandruff Shampoo", ["Aqua", "Ketoconazole IP (2.0% w/v)"])).toBeNull();
  });
});

describe("the static catalogue", () => {
  it("has nothing we would stop rating", () => {
    const hits = ALL_BRANDS.flatMap((b) => b.products.filter((p) => unratedKindOf({ productName: p.productName, category: p.category, inci: p.ingredients.map((i) => i.name) })).map((p) => `${b.slug}/${p.slug}`));
    expect(hits).toEqual([]);
  });
});
