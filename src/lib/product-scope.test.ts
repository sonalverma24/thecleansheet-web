import { describe, expect, it } from "vitest";
import { productScopeOf, scopesNamedIn, statusAppliesTo, type ProductScope } from "@/lib/product-scope";

const LEAVE_ON = productScopeOf("Hydra Creme Lipstick", "Lipstick");
const RINSE_OFF = productScopeOf("Gentle Face Wash", "Cleanser");
const SUNSCREEN = productScopeOf("Fluid SPF 50+ Sun Cream", "Sunscreen");
const SHAMPOO = productScopeOf("Anti Dandruff Shampoo", "Shampoo");

describe("what kind of product it is", () => {
  it("reads rinse-off, leave-on and sunscreen as the decision core's profile does", () => {
    expect(RINSE_OFF).toMatchObject({ rinseOff: true, leaveOn: false });
    expect(LEAVE_ON).toMatchObject({ rinseOff: false, leaveOn: true });
    expect(SUNSCREEN).toMatchObject({ sunscreen: true, leaveOn: true });
    expect(SHAMPOO).toMatchObject({ rinseOff: true, hair: true });
  });

  it("a product is rinse-off or leave-on, never both and never neither", () => {
    for (const [n, c] of [["Vitamin B5 Moisturizer", "Moisturizer"], ["Sulphate Free Facewash", "Face Wash"], ["Niacinamide Serum", "Serum"], ["Hair Serum", "Hair"], ["Lip Balm", "Lip care"], ["Kids Sunscreen", "Sunscreen"]]) {
      const s = productScopeOf(n, c);
      expect(s.rinseOff !== s.leaveOn, `${n}`).toBe(true);
    }
  });

  it("reads lip, eye, nail, oral, spray and baby from the words", () => {
    expect(productScopeOf("Matte Lipstick", "Makeup").lip).toBe(true);
    expect(productScopeOf("Kajal", "Eye makeup").eye).toBe(true);
    expect(productScopeOf("Quick Dry Nail Polish", "Nail").nail).toBe(true);
    expect(productScopeOf("Whitening Toothpaste", "Oral care").oral).toBe(true);
    expect(productScopeOf("Setting Spray", "Makeup").spray).toBe(true);
    expect(productScopeOf("Baby Lotion", "Baby care").baby).toBe(true);
    expect(productScopeOf("Gentle Face Wash", "Cleanser")).toMatchObject({ lip: false, eye: false, nail: false, oral: false, spray: false });
  });
});

describe("which product types a status names", () => {
  it.each([
    ["EU BANNED in rinse-off products (microplastic regulation)", { includes: ["rinseOff"], excludes: [] }],
    ["Banned in rinse-off (EU 2030 phase-out implementing)", { includes: ["rinseOff"], excludes: [] }],
    ["Permitted (restricted in rinse-off ≥0.1% from 2020)", { includes: ["rinseOff"], excludes: [] }],
    ["Restricted; Annex V (permitted preservatives) under EU Regulation 1223/2009; max 0.1% in leave-on and rinse-off products", { includes: ["rinseOff", "leaveOn"], excludes: [] }],
    ["Regulated as a primary sunscreen active under TGA ARTG requirements when SPF claims are made; cosmetic use (non-SPF) subject to standard cosmetic framework", { includes: ["sunscreen"], excludes: [] }],
    ["UV filter; may require Health Canada NPN registration if drug (sunscreen) claims are made; cosmetic use subject to Canada Consumer Product Safety", { includes: ["sunscreen"], excludes: [] }],
    ["Banned", { includes: [], excludes: [] }],
    ["Restricted - Annex III", { includes: [], excludes: [] }],
    ["Restricted in all cosmetic products except oral products", { includes: [], excludes: ["oral"] }],
    ["Not permitted in hair dyes", { includes: ["hair"], excludes: [] }],
    ["Allowed for externally applied self tanning use in source context; avoid eye area, lips, mucous membranes and inhalation exposure", { includes: [], excludes: ["eye"] }],
  ] as const)("%s", (text, want) => {
    const got = scopesNamedIn(text);
    expect([...got.includes].sort()).toEqual([...want.includes].sort());
    expect([...got.excludes].sort()).toEqual([...want.excludes].sort());
  });
});

describe("whether a status speaks to this product", () => {
  const applies = (text: string, scope: ProductScope | undefined) => statusAppliesTo(text, scope);

  it("a status that names no product type applies to every product", () => {
    for (const s of [LEAVE_ON, RINSE_OFF, SUNSCREEN, SHAMPOO]) {
      expect(applies("Banned", s)).toBe(true);
      expect(applies("Restricted - Annex III", s)).toBe(true);
      expect(applies("", s)).toBe(true);
    }
  });

  it("a rinse-off ban applies to a rinse-off product and not to a leave-on one (Polyethylene in a lipstick)", () => {
    const text = "EU BANNED in rinse-off products (microplastic regulation)";
    expect(applies(text, RINSE_OFF)).toBe(true);
    expect(applies(text, SHAMPOO)).toBe(true);
    expect(applies(text, LEAVE_ON)).toBe(false);
    expect(applies(text, SUNSCREEN)).toBe(false);
  });

  it("a restriction that names both rinse-off and leave-on applies to both", () => {
    const text = "Restricted; Annex V; max 0.1% in leave-on and rinse-off products";
    expect(applies(text, LEAVE_ON)).toBe(true);
    expect(applies(text, RINSE_OFF)).toBe(true);
  });

  it("the sunscreen framework wording applies to a sunscreen and not to a moisturiser", () => {
    const text = "Regulated as a primary sunscreen active under TGA ARTG requirements when SPF claims are made; cosmetic use (non-SPF) subject to standard cosmetic framework";
    expect(applies(text, SUNSCREEN)).toBe(true);
    expect(applies(text, productScopeOf("Vitamin B5 Moisturizer", "Moisturizer"))).toBe(false);
  });

  it("a type named after 'except' is an exclusion, not the scope", () => {
    const text = "Restricted in all cosmetic products except oral products";
    expect(applies(text, LEAVE_ON)).toBe(true);
    expect(applies(text, productScopeOf("Whitening Toothpaste", "Oral care"))).toBe(false);
  });

  it("when the product's type is not known, every status applies, as it does today", () => {
    expect(applies("EU BANNED in rinse-off products", undefined)).toBe(true);
    expect(applies("Regulated as a primary sunscreen active when SPF claims are made", undefined)).toBe(true);
  });

  it("every status in the reference file that names a type reads sensibly for each kind of product", async () => {
    const { ALL_INGREDIENTS } = await import("@/lib/ingredient-utils");
    const fields = ["EU_Status", "India_Status", "US_FDA_Status", "Korea_Status", "Australia_TGA_Status", "Canada_NHPID_Status"];
    let scoped = 0;
    for (const row of ALL_INGREDIENTS as unknown as Record<string, string>[]) {
      for (const f of fields) {
        const t = row[f] || "";
        const { includes, excludes } = scopesNamedIn(t);
        if (!includes.length && !excludes.length) continue;
        scoped++;
        // a status that names a type must apply to at least one of the kinds of product it names, and must not apply to a product that is none of them
        const kinds = [LEAVE_ON, RINSE_OFF, SUNSCREEN, SHAMPOO, productScopeOf("Quick Dry Nail Polish", "Nail"), productScopeOf("Whitening Toothpaste", "Oral care"),
          productScopeOf("Setting Spray", "Makeup"), productScopeOf("Baby Lotion", "Baby care"), productScopeOf("Kajal", "Eye makeup"), productScopeOf("Hair Colour", "Hair")];
        const hits = kinds.filter((s) => statusAppliesTo(t, s));
        expect(hits.length, `${row.INCI_Name} ${f}: ${t}`).toBeGreaterThan(0);
      }
    }
    expect(scoped).toBeGreaterThan(30);
  });
});
