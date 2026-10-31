import { describe, expect, it } from "vitest";
import { looksLikeInciList } from "@/lib/inci-paste";
import { mockProducts } from "@/data/mockProducts";

/* looksLikeInciList decides whether the input is a pasted ingredient list, which identifies no product and so is never saved.
   The two failures to avoid: a list saved under a name the model made up, and a typed product name that is not saved. */

const LIST = ["Aqua", "Glycerin", "Niacinamide", "Sodium Hyaluronate", "Panthenol", "Allantoin", "Phenoxyethanol", "Ethylhexylglycerin"];

describe("looksLikeInciList: a pasted list, whatever separates its items", () => {
  const forms: Record<string, string> = {
    comma: LIST.join(", "),
    semicolon: LIST.join("; "),
    "new line": LIST.join("\n"),
    "bullet": LIST.map((x) => `• ${x}`).join(" "),
    "middle dot": LIST.join(" · "),
    pipe: LIST.join(" | "),
    slash: LIST.join(" / "),
    "full stop": `${LIST.join(". ")}.`,
    "spaced dash": LIST.join(" - "),
    "plain space": LIST.join(" "),
    "capitals": LIST.join(", ").toUpperCase(),
    "tab (spreadsheet)": LIST.join("\t"),
  };
  for (const [name, text] of Object.entries(forms)) {
    it(`is a list when separated by ${name}`, () => expect(looksLikeInciList(text)).toBe(true));
  }

  it("is a list with a label in front, however few items follow", () => {
    expect(looksLikeInciList("Ingredients: Aqua, Glycerin, Niacinamide, Panthenol")).toBe(true);
    expect(looksLikeInciList("INCI: Aqua, Glycerin")).toBe(true);
    expect(looksLikeInciList("Active ingredients: Salicylic Acid 2%")).toBe(true);
    expect(looksLikeInciList("Ingredient list - Aqua Glycerin Niacinamide")).toBe(true);
    expect(looksLikeInciList("Ingredients\nAqua, Glycerin, Niacinamide")).toBe(true);
  });

  it("is a list when only four, three or two items are pasted and they read as ingredient names", () => {
    expect(looksLikeInciList("Aqua, Glycerin, Niacinamide, Panthenol")).toBe(true);
    expect(looksLikeInciList("Aqua, Glycerin, Niacinamide")).toBe(true);
    expect(looksLikeInciList("Sodium Hyaluronate, Zinc Oxide")).toBe(true);
    expect(looksLikeInciList("Aqua\nCaprylic/Capric Triglyceride\nCamellia Sinensis Leaf Extract\nParfum")).toBe(true);
  });

  it("is a list with five or more items of any kind, as before", () => {
    expect(looksLikeInciList("a, b, c, d, e")).toBe(true);
  });

  it("recognises every product's own ingredient list in each separator, and a short slice of it", () => {
    for (const p of mockProducts) {
      const items = p.ingredient_list.split(",").map((s) => s.trim()).filter(Boolean);
      for (const joiner of [", ", "; ", "\n", " • ", " | ", " / ", ". ", " "]) {
        expect(looksLikeInciList(items.join(joiner)), `${p.name} joined by ${JSON.stringify(joiner)}`).toBe(true);
      }
      expect(looksLikeInciList(items.slice(0, 4).join(", ")), `${p.name} first four`).toBe(true);
      expect(looksLikeInciList(`Ingredients: ${items.slice(0, 4).join(", ")}`), `${p.name} labelled`).toBe(true);
    }
  });
});

describe("looksLikeInciList: a typed product name is not a list", () => {
  const names = [
    "Cetaphil Gentle Skin Cleanser", "Cetaphil Gentle Skin Cleanser 250 ml", "Cetaphil Gentle Skin Cleanser (Face Wash)", "Cetaphil, Gentle Skin Cleanser",
    "The Ordinary Niacinamide 10% + Zinc 1%", "Neutrogena Hydro Boost Water Gel SPF 50", "Dot & Key Vitamin C + E Super Bright Moisturizer SPF 50",
    "Minimalist 10% Niacinamide Face Serum", "Mamaearth Onion Hair Oil", "L'Oreal Paris Revitalift Hyaluronic Acid Serum", "e.l.f. Hydrating Camo Concealer",
    "Dr. Sheth's Cica Sunscreen", "Plum 15% Vitamin C Face Serum", "Bioderma Sensibio H2O Micellar Water", "CeraVe Hydrating Facial Cleanser",
    "La Roche-Posay Effaclar Duo+", "Pond's Super Light Gel Oil-Free Moisturiser", "Biotique Bio Papaya Revitalizing Tan-Removal Scrub",
    "Hyaluronic Acid Serum", "Salicylic Acid Face Wash", "Glycolic Acid Toner 7%", "Zinc Oxide Sunscreen", "Sodium Hyaluronate Hydrating Serum",
    "Hyaluronic Acid Zinc Serum", "Vitamin C Hyaluronic Acid Serum", "Salicylic Acid Glycolic Acid Face Wash", "Coconut Oil Hair Mask", "Shea Butter Body Lotion",
    "Tea Tree Oil Face Wash", "Rose Water Toner", "Aloe Vera Gel", "Argan Oil", "Avocado Oil Shampoo, 300 ml", "Aqua Glycerin Cleanser",
    "Neutrogena Ultimate Moisture Cream", "Nivea Oil Control Face Wash", "Garnier Organic Argan Hair Oil", "Daily Routine Sunscreen SPF 30",
    "Mamaearth Ubtan Face Wash, Turmeric & Saffron", "Cetaphil Gentle Skin Cleanser – Dry to Normal Skin", "Simple Kind to Skin Refreshing Facial Wash Gel",
    ...mockProducts.map((p) => `${p.brand} ${p.name}`),
  ];
  for (const name of names) {
    it(`keeps "${name}" a product`, () => expect(looksLikeInciList(name)).toBe(false));
  }

  it("never treats a URL as a list, however many commas it holds", () => {
    expect(looksLikeInciList("https://brand.example.test/products/aqua,glycerin,niacinamide,panthenol,allantoin")).toBe(false);
  });

  it("is not a list when nothing is typed", () => {
    expect(looksLikeInciList("")).toBe(false);
    expect(looksLikeInciList("   ")).toBe(false);
  });
});
