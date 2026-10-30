import { describe, expect, it } from "vitest";
import { COMPARE_MAX, compareBlock, compareBlockReason, compareSubjectOfReview, compareTypeOf } from "./compare-group";

/** A stored analysis, as the /compare page files it: free-text category plus the product's name. */
const typeOf = (productName: string, category: string) => compareTypeOf(compareSubjectOfReview({ productName, category }));

describe("what a product is compared within", () => {
  it("files sunscreens together however the category is worded", () => {
    const a = typeOf("Fluid SPF 50 PA++++", "Sunscreen");
    expect(a).toBe("Sunscreens");
    expect(typeOf("Aqua Gel SPF 50", "sunscreen")).toBe(a);
    expect(typeOf("Daily Shield", "Face Sunscreen")).toBe(a);
  });

  it("keeps a sunscreen apart from a moisturiser, even a moisturiser with SPF in its category", () => {
    expect(typeOf("Day Cream", "Face Moisturizer")).not.toBe(typeOf("Fluid SPF 50", "Sunscreen"));
    expect(typeOf("Sheer Day Cream SPF 30", "Face Moisturizer & Day Cream with SPF")).toBe(typeOf("Day Cream", "Face Moisturizer"));
  });

  it("splits hair care: a shampoo is not compared with a serum, a mask or a conditioner", () => {
    const types = [
      typeOf("Anti-dandruff Shampoo", "Shampoo"),
      typeOf("Rosemary Shampoo Bar", "Shampoo Bar"),
      typeOf("Frizz Control Serum", "Hair Serum"),
      typeOf("Argan Oil", "Hair Oil"),
      typeOf("Repair Mask", "Hair Mask"),
      typeOf("Smooth Conditioner", "Conditioner"),
    ];
    expect(types).toEqual(["Shampoos", "Shampoos", "Hair serums & oils", "Hair serums & oils", "Hair masks", "Conditioners"]);
    expect(typeOf("Leave-in Cream", "Hair Serum / Leave-in Conditioner")).toBe("Hair serums & oils");
  });

  it("splits body & bath: soap, body wash, lotion, scrub and deodorant are different things", () => {
    expect(typeOf("Citrus Blast Repairing Bathing Soap", "Bathing Soap")).toBe("Soaps & bars");
    expect(typeOf("Guava De-tan Body Wash", "Body Wash")).toBe("Body washes");
    expect(typeOf("Rich Nourishing Body Lotion", "Body Lotion")).toBe("Body lotions & creams");
    expect(typeOf("Petal Soft Moisturizing Body Cream", "body cream")).toBe("Body lotions & creams");
    expect(typeOf("Whipped Foaming Sugar Scrub", "Body Scrub")).toBe("Body scrubs");
    expect(typeOf("Explorer Deo Stick", "Deodorant Stick")).toBe("Deodorants");
    expect(typeOf("Relaxing Bath Salt", "Bath Salt")).toBe("Bath salts & soaks");
  });

  it("splits makeup into lips, eyes and face, and keeps eye makeup apart from eye cream", () => {
    expect(typeOf("Hydra Creme Lipstick", "Lipstick")).toBe("Lip colour");
    expect(typeOf("Lash Lift", "Mascara")).toBe("Eye makeup");
    expect(typeOf("Smudge-proof Kajal", "Kajal / Eyeliner")).toBe("Eye makeup");
    expect(typeOf("Caffeine Under Eye Cream", "Under Eye Cream")).toBe("Eye creams & serums");
    expect(typeOf("Cover Rangers Creamy Concealer", "Concealer, Corrector, Contour Palette")).toBe("Face makeup");
    expect(typeOf("Skin Paradise Tinted Moisturizer", "Tinted Moisturizer")).toBe("Face makeup");
  });

  it("falls back to the product name when the category says nothing, and to the whole group when no split matches", () => {
    expect(typeOf("Strengthening Shampoo", "Hair Care")).toBe("Shampoos");
    expect(typeOf("Styling Cream", "Hair Cream")).toBe("Hair care");
  });

  it("has no type for a product we have not filed, so it can never be compared", () => {
    expect(typeOf("Mint Toothpaste", "Toothpaste")).toBeNull();
    expect(typeOf("Bare To Perfect", "Translucent Powder")).toBeNull();
  });

  it("gives the same type to a listing card and to the stored analysis behind it", () => {
    // A card carries the taxonomy-normalised category and sub-category; the page derives them from the stored text with the same lookup.
    const fromReview = compareSubjectOfReview({ productName: "Anti-dandruff Shampoo", category: "Shampoo" });
    expect(compareTypeOf({ ...fromReview })).toBe(compareTypeOf({ productName: "Anti-dandruff Shampoo", productType: "leave-on", category: fromReview.category, subCategory: fromReview.subCategory }));
  });
});

describe("who may join a comparison", () => {
  it("lets the first product of any filed type in", () => {
    expect(compareBlockReason({ picked: [], alreadyIn: false, candidateType: "Sunscreens" })).toBeNull();
  });

  it("lets a product of the same type in, and refuses a different type with the reason in words", () => {
    expect(compareBlockReason({ picked: ["Sunscreens"], alreadyIn: false, candidateType: "Sunscreens" })).toBeNull();
    const reason = compareBlockReason({ picked: ["Sunscreens"], alreadyIn: false, candidateType: "Shampoos" });
    expect(reason).toContain("Sunscreens");
    expect(reason).toMatch(/only sunscreens can be added/i);
  });

  it("always lets a product already in the list be taken out again", () => {
    expect(compareBlockReason({ picked: ["Sunscreens", "Sunscreens"], alreadyIn: true, candidateType: "Sunscreens" })).toBeNull();
  });

  it("stops at the limit, and never lets an unfiled product in", () => {
    const full = Array.from({ length: COMPARE_MAX }, () => "Sunscreens");
    expect(compareBlockReason({ picked: full, alreadyIn: false, candidateType: "Sunscreens" })).toMatch(/up to 4/);
    expect(compareBlockReason({ picked: [], alreadyIn: false, candidateType: null })).toMatch(/cannot be compared/);
  });
});

describe("what stopped a product joining", () => {
  it("says which rule it was, so only a different type offers the filter button", () => {
    expect(compareBlock({ picked: ["Sunscreens"], alreadyIn: false, candidateType: "Shampoos" })?.kind).toBe("type");
    expect(compareBlock({ picked: Array(COMPARE_MAX).fill("Sunscreens"), alreadyIn: false, candidateType: "Sunscreens" })?.kind).toBe("full");
    expect(compareBlock({ picked: [], alreadyIn: false, candidateType: null })?.kind).toBe("unfiled");
    expect(compareBlock({ picked: ["Sunscreens"], alreadyIn: false, candidateType: "Sunscreens" })).toBeNull();
  });

  it("tells the shopper to choose another from the same category, in words", () => {
    const m = compareBlock({ picked: ["Sunscreens"], alreadyIn: false, candidateType: "Shampoos" })!.message;
    expect(m).toMatch(/only Sunscreens can be added/);
    expect(m).toMatch(/another one from the same category/);
    expect(compareBlockReason({ picked: ["Sunscreens"], alreadyIn: false, candidateType: "Shampoos" })).toBe(m);
  });
});
