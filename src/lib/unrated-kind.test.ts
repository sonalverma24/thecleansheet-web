import { describe, expect, it } from "vitest";
import { ALL_BRANDS } from "@/data/brands";
import { isRated, unratedInputOf, unratedKindOf } from "./unrated-kind";

const kind = (productName: string, category = "") => unratedKindOf({ productName, category });

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

describe("a prescription drug is one that says so", () => {
  it("is named by an Rx or prescription notice in its name or category", () => {
    expect(kind("Tretinoin Cream 0.025% (Rx only)", "Topical")).toBe("prescription-drug");
    expect(kind("Clindamycin Gel", "Prescription medicine")).toBe("prescription-drug");
    expect(kind("Some Gel Schedule H1 drug", "")).toBe("prescription-drug");
    expect(kind("Aziderm Rx Cream", "")).toBe("prescription-drug");
  });

  it("is named by what a retailer's listing says: the note a stored review keeps for each retailer", () => {
    const review = { productName: "Aziderm 20% Cream", category: "Topical Acne Treatment / Dermaceutical", priceAcrossPlatforms: [
      { platform: "Nykaa", note: "Listed at the brand price." },
      { platform: "Flipkart", note: "Price appears to be an error or placeholder; product listed as 'Prescription Required'." },
    ] };
    expect(unratedKindOf(unratedInputOf(review))).toBe("prescription-drug");
  });

  it("is NOT named by its ingredients: azelaic acid at 20%, or a ketoconazole shampoo, with no notice, is still reviewed", () => {
    expect(kind("Aziderm 20% Cream", "Topical Acne Treatment / Dermaceutical")).toBeNull();
    expect(kind("Finacea 15% Gel", "")).toBeNull();
    expect(kind("Scalpe Plus Expert Anti-Dandruff Shampoo", "Medicated Anti-Dandruff Shampoo")).toBeNull();
  });

  it("is not claimed for a cosmetic whose copy merely mentions prescriptions", () => {
    const review = { productName: "Scalpe Plus Expert Anti-Dandruff Shampoo", category: "Medicated Anti-Dandruff Shampoo", priceAcrossPlatforms: [
      { platform: "Nykaa", note: "Cited 'IMS Prescription Audit MAT (Mar 20)' as the basis for 'most prescribed'." },
      { platform: "Amazon", note: "Not a prescription drug; sold over the counter. No prescription needed." },
    ] };
    expect(unratedKindOf(unratedInputOf(review))).toBeNull();
  });
});

describe("a drug that is not marked as prescription", () => {
  it("is named by a Drug Facts label read off the artwork, or the page", () => {
    expect(unratedKindOf({ productName: "Daily Shield SPF 30", category: "Sunscreen", labelText: "Drug Facts Active ingredient Purpose Zinc oxide 8% Sunscreen" })).toBe("drug");
    expect(unratedKindOf({ productName: "Daily Shield SPF 30", category: "Sunscreen", pageText: "## Details\nDrug Facts: active ingredient zinc oxide" })).toBe("drug");
  });

  it("a prescription notice wins: it is a prescription drug, not just a drug", () => {
    expect(unratedKindOf({ productName: "X", pageText: "Drug Facts ... Rx only" })).toBe("prescription-drug");
  });

  it("is not claimed for a sunscreen with no such label", () => {
    expect(unratedKindOf({ productName: "Daily Shield SPF 30", category: "Sunscreen", pageText: "Broad spectrum SPF 30. Dermatologist tested. Apply generously." })).toBeNull();
  });
});

describe("the static catalogue", () => {
  it("has nothing we would stop rating", () => {
    const hits = ALL_BRANDS.flatMap((b) => b.products.filter((p) => unratedKindOf({ productName: p.productName, category: p.category })).map((p) => `${b.slug}/${p.slug}`));
    expect(hits).toEqual([]);
  });
});
