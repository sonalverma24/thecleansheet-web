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

describe("a tool, an appliance or an accessory", () => {
  it("is named by the model's category: Skince's Volumizer Hot Air Brush, stored 2026-10-30", () => {
    expect(kind("Volumizer Hot Air Brush", "Hot Air Brush / Hair Styling Appliance")).toBe("tool");
    expect(unratedKindOf(unratedInputOf({ productName: "Volumizer Hot Air Brush", category: "Hot Air Brush / Hair Styling Appliance" }))).toBe("tool");
  });

  it("is named by a generic word in the category: appliance, device, gadget, tool, accessory", () => {
    for (const category of ["Hair Styling Tool", "Beauty Device", "Skincare Tools", "Personal Care Appliance", "Hair Accessory", "Grooming Gadget"]) {
      expect(kind("Pro 2200", category), category).toBe("tool");
    }
  });

  it("is named by a tool phrase in the name when the category does not say", () => {
    for (const name of ["Pro Hair Dryer 2200W", "Ceramic Flat Iron", "Ionic Hair Straightener", "Volumizer Hot Air Brush", "Beard Trimmer", "Rose Quartz Face Roller", "Jade Gua Sha", "12 Piece Makeup Brush Set",
      "Beauty Blender Sponge", "Detangling Hair Brush", "Wide Tooth Comb", "Eyelash Curler", "Facial Cleansing Brush", "Derma Roller 0.5mm", "Stainless Steel Tweezers", "5 Blade Razor"]) {
      expect(kind(name), name).toBe("tool");
    }
  });

  it("is named by a tool phrase in the category", () => {
    for (const category of ["Makeup Brush", "Hair Dryer", "Hair Straightener", "Face Massager", "Epilator", "Nail Clipper", "LED Light Therapy Mask"]) expect(kind("Pro", category), category).toBe("tool");
  });

  it("leans toward rated: with no category, a name the category list reads as a cosmetic is not called a tool (LED Face Mask reads as a mask); the category decides when there is one", () => {
    expect(kind("LED Face Mask")).toBeNull();
    expect(kind("LED Face Mask", "Beauty Device")).toBe("tool");
  });

  it("is not a cosmetic named after a tool it protects against or works with", () => {
    for (const [name, category] of [
      ["2-in-1 Heat Protectant", "Hair Serum / Heat Protectant"],
      ["Heat Protectant for Flat Irons and Hair Dryers", "Heat Protectant Spray"],
      ["Smoothing Serum for Straighteners", "Hair Serum"],
      ["Brush On Mascara", "Mascara"],
      ["Brush-on SPF 50 Powder Sunscreen", "Sunscreen"],
      ["Shaving Cream for Razor Burn", "Shaving Cream"],
      ["Razor Bump Relief Lotion", ""],
      ["Comb Through Conditioner", "Conditioner"],
      ["Blow Dry Cream", ""],
      ["Hair Clip In Volume Powder", ""],
      ["Microneedle Patch for Dark Spots", "Pimple Patch"],
      ["Hair Mask", "Hair Mask"],
      ["Sheet Mask", "Sheet Mask"],
      ["Curl Defining Cream", "Hair Cream"],
      ["Tweezerman After Care Gel", ""],
      ["Brow Gel", "Brow Gel"],
      ["Lip Brush Primer", "Lip Primer"],
      ["High & Dry Everyday Dry Shampoo", "Dry Shampoo"],
      ["Straightening Serum", "Hair Serum"],
    ] as const) {
      expect(kind(name, category), `${name} / ${category}`).toBeNull();
    }
  });

  it("is not named by a generic word in the NAME alone", () => {
    expect(kind("Device Free Skin Cream", "")).toBeNull();
    expect(kind("The Tool Kit Face Wash", "Face Wash")).toBeNull();
    expect(kind("Hair Accessory Care Oil", "")).toBeNull();
  });

  it("is not named when the category is a cosmetic type, whatever the name holds", () => {
    expect(kind("Heated Straightener Cream", "Hair Straightening Cream")).toBeNull();
    expect(kind("Pro Hair Dryer Shampoo", "Shampoo")).toBeNull();
  });

  it("a nutraceutical or a drug is still that, not a tool", () => {
    expect(kind("Hair Gummies Device", "Oral Supplement / Beauty Drink Mix")).toBe("nutraceutical");
    expect(kind("Hair Dryer Rx", "Prescription Required")).toBe("prescription-drug");
  });

  it("is not rated: no review, no place in a list", () => {
    expect(isRated({ productName: "Volumizer Hot Air Brush", category: "Hot Air Brush / Hair Styling Appliance" })).toBe(false);
    expect(isRated({ productName: "2-in-1 Heat Protectant", category: "Hair Serum / Heat Protectant" })).toBe(true);
  });
});

describe("the static catalogue", () => {
  it("has nothing we would stop rating", () => {
    const hits = ALL_BRANDS.flatMap((b) => b.products.filter((p) => unratedKindOf({ productName: p.productName, category: p.category })).map((p) => `${b.slug}/${p.slug}`));
    expect(hits).toEqual([]);
  });
});
