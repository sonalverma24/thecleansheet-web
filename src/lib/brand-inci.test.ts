import { describe, expect, it, vi } from "vitest";
import { findBrandInci, isBrandIngredientUrl } from "./brand-inci";
const url = "https://www.plixlife.com/product/pomegranate-youth-renewal-night-cream/602";
const list = { source: url, ingredients: ["Aqua", "Glycerin", "Niacinamide", "Panthenol", "Tocopherol"], quote: "Aqua, Glycerin, Niacinamide, Panthenol, Tocopherol", pageTitles: ["Plix Pomegranate Youth Renewal Night Cream"] };

describe("primary brand ingredient acquisition", () => {
  it("reads a matching brand product page and keeps its exact source and quotation", async () => {
    const deps = { search: vi.fn().mockResolvedValue([url]), read: vi.fn().mockResolvedValue(list) };
    expect(await findBrandInci("Plix Pomegranate Youth Renewal Night Cream", "Plix", undefined, deps)).toEqual(list);
  });
  it("never upgrades retailer, deceptive-domain, private-address or unrelated results to a brand source", () => {
    for (const u of ["https://www.nykaa.com/plix/p/123", "https://plixlife.com.evil.test/product/a", "http://plixlife.com/product/a", "https://127.0.0.1/product/a", "https://plixlife.local/product/a", "https://plixlife.com@evil.test/product/a"])
      expect(isBrandIngredientUrl(u, "Plix"), u).toBe(false);
  });
  it("rejects another product and a list without a captured quote", async () => {
    for (const page of [{ ...list, pageTitles: ["Plix Watermelon Sunscreen"] }, { ...list, quote: "" }]) {
      expect(await findBrandInci("Plix Pomegranate Youth Renewal Night Cream", "Plix", undefined, { search: async () => [url], read: async () => page })).toBeNull();
    }
  });
  it("does not read a retailer listing even when supplied by the user", async () => {
    const read = vi.fn();
    expect(await findBrandInci("Plix Pomegranate Cream", "Plix", "https://nykaa.com/plix/p/123", { search: async () => [], read })).toBeNull();
    expect(read).not.toHaveBeenCalled();
  });
});
