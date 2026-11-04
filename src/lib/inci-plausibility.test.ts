import { describe, expect, it } from "vitest";
import { listPlausibleFor } from "@/lib/inci-plausibility";

const OMEO_KEY_ACTIVES = ["Arnica Montana Flower Extract", "Calendula Officinalis Flower Extract", "Thuja Occidentalis Leaf Oil", "Melia Azadirachta Leaf (Neem) Extract", "Zingiber Officinale (Ginger) Root Extract", "Propanediol Caprylate", "Lactic Acid"];
const B5_MENU = ["Back", "Vitamin C", "BHA / Salicylic Acid", "Retinoid / Retinol", "Niacinamide", "UV Filters", "Ceramide"];
const WISHCARE_ACTIVES = ["0.1% Retinal", "Tetrapeptide", "3% Caffeine", "Niacinamide & Ginseng Pdrn"];
const REAL = ["Water/Aqua", "Glycerin", "Niacinamide", "Panthenol", "Phenoxyethanol"];

describe("a water-based product's list must hold water", () => {
  it("refuses what 2026-11-04 wrote as lists: Omeo's key actives, Be Minimalist's menu, WishCare's actives", () => {
    expect(listPlausibleFor(OMEO_KEY_ACTIVES, "Omeo Anti Dandruff Shampoo with Neem, Ginger & Thuja")).toMatchObject({ ok: false });
    expect(listPlausibleFor(B5_MENU, "Be Minimalist Vitamin B5 10% Moisturizer")).toMatchObject({ ok: false });
    expect(listPlausibleFor(["Back", ...WISHCARE_ACTIVES], "WishCare Cellular Reset Retinal Shot Cream")).toMatchObject({ ok: false });
    expect(listPlausibleFor(OMEO_KEY_ACTIVES, "Omeo Anti Dandruff Shampoo").reason).toMatch(/shampoo is water-based/);
  });

  it("accepts any real list with a water entry, in any of the ways brands write it", () => {
    for (const water of ["Water", "Water/Aqua", "Aqua (Water)", "Purified Water", "Aqua", "Eau", "Rosa Damascena Flower Water", "Aloe Barbadensis Leaf Juice", "Rose Hydrosol"])
      expect(listPlausibleFor([water, "Glycerin", "Panthenol"], "Plum Moisturizer").ok, water).toBe(true);
  });

  it("covers the water-based categories: shampoo, conditioner, cleanser, face wash, moisturiser, cream, lotion, sunscreen, toner, mist, gel", () => {
    for (const name of ["Dandruff Shampoo", "Argan Conditioner", "Gentle Cleanser", "Salicylic Face Wash", "Barrier Moisturiser", "Night Cream", "Body Lotion", "SPF 50 Sunscreen", "Rose Toner", "Setting Mist", "Aloe Gel"])
      expect(listPlausibleFor(OMEO_KEY_ACTIVES, name).ok, name).toBe(false);
  });

  it("never judges a product that is not water-based: oils, balms, butters, sticks, powders, bars, serums, scrubs, soaps, lip products and dry shampoo", () => {
    for (const name of ["Antinorm High & Dry Dry Shampoo + Refill", "Face Oil", "Cleansing Balm", "Shea Butter", "Sunscreen Stick", "Setting Powder", "Shampoo Bar", "Bombae 2-in-1 Heat Protectant Hair Serum", "Sugar Scrub", "Neem Soap", "Lip Balm", "Oil Cleanser", "Cleansing Oil"])
      expect(listPlausibleFor(["Zea Mays (Corn) Starch", "Bentonite", "Kaolin Powder", "Magnesium Aluminum Silicate", "Maize Starch"], name).ok, name).toBe(true);
  });

  it("does not refuse a fat-based (anhydrous) formula: Juicy Chemistry's under-eye cream is butters, oils and wax with no water", () => {
    const juicy = ["Theobroma Cacao Seed Butter (Cocoa Butter)*", "Haelianthus Annuus Seed Oil (Sunflower Oil)*", "Cera Alba (Bees Wax)*", "Tocopherol (Vitamin E Oil)*", "Rosa Damascena Flower Oil (Rose Oil)*"];
    expect(listPlausibleFor(juicy, "Juicy Chemistry Organic Under Eye Repair Cream Fortified with Damask Rose + Coffee").ok).toBe(true);
    expect(listPlausibleFor(["Butyrospermum Parkii (Shea) Butter", "Cocos Nucifera (Coconut) Oil", "Panthenol"], "Intense Body Cream").ok).toBe(true);
    // ...but one botanical oil among extracts is not a fat-based formula
    expect(listPlausibleFor(OMEO_KEY_ACTIVES, "Omeo Anti Dandruff Shampoo").ok).toBe(false);
  });

  it("does not take 'oil-free' for an oil, and does not judge a name with no category word", () => {
    expect(listPlausibleFor(OMEO_KEY_ACTIVES, "Oil-Free Moisturizer").ok).toBe(false);
    expect(listPlausibleFor(OMEO_KEY_ACTIVES, "Omeo Homeopathy Formula 12").ok).toBe(true);
  });

  it("holds Be Minimalist's real list and every other list with water", () => {
    expect(listPlausibleFor(REAL, "Be Minimalist Oat Extract Gentle Cleanser").ok).toBe(true);
  });
});
