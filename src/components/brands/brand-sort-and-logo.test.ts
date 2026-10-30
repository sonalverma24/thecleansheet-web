import { describe, expect, it } from "vitest";
import { productCountOf, sortBrands } from "./BrandDirectoryClient";
import { brandInitials } from "./BrandLogo";
import { safeLogoUrl } from "@/lib/brand-directory";

const brand = (name: string, green: number, yellow: number, red: number, unrated: number) => ({
  name, counts: { green, yellow, red, unrated }, ratedCount: green + yellow + red,
});

describe("sorting brands by products", () => {
  const list = [brand("Alpha", 1, 0, 0, 0), brand("Zeta", 3, 2, 0, 4), brand("Mid", 0, 2, 0, 1), brand("Beta", 2, 1, 0, 0)];

  it("puts the brand with the most products first, counting products with no rating yet", () => {
    expect(productCountOf(list[1])).toBe(9);
    expect(sortBrands(list, "products").map((b) => b.name)).toEqual(["Zeta", "Beta", "Mid", "Alpha"]);
  });

  it("breaks a tie on products by the most rated, then by name", () => {
    const tied = [brand("Bee", 0, 1, 0, 2), brand("Ant", 0, 1, 0, 2), brand("Cat", 1, 1, 0, 1)];
    expect(sortBrands(tied, "products").map((b) => b.name)).toEqual(["Cat", "Ant", "Bee"]);
  });

  it("can still sort A to Z, and never reorders the list it is given", () => {
    const before = list.map((b) => b.name);
    expect(sortBrands(list, "name").map((b) => b.name)).toEqual(["Alpha", "Beta", "Mid", "Zeta"]);
    expect(list.map((b) => b.name)).toEqual(before);
  });
});

describe("a brand's initials", () => {
  it("takes the first letter of up to two words and skips filler words", () => {
    expect(brandInitials("Clean & Conscious Care")).toBe("CC");
    expect(brandInitials("The Derma Co")).toBe("DC");
    expect(brandInitials("Minimalist")).toBe("M");
    expect(brandInitials("L'Oréal Paris")).toBe("LP");
    expect(brandInitials("Pond's")).toBe("P");
    expect(brandInitials("Dr. Sheth's")).toBe("DS");
  });

  it("never returns nothing", () => {
    expect(brandInitials("")).toBe("?");
    expect(brandInitials("&")).toBe("?");
  });
});

describe("which logo addresses are shown", () => {
  it("accepts a file this site serves and an https address", () => {
    expect(safeLogoUrl("/images/kiehls-logo.png")).toBe("/images/kiehls-logo.png");
    expect(safeLogoUrl("https://beminimalist.co/cdn/shop/files/Minimalist-Logo-PNG.png?v=1")).toBe("https://beminimalist.co/cdn/shop/files/Minimalist-Logo-PNG.png?v=1");
  });

  it("drops anything else: http, a protocol-relative address, a script, a data address, empty", () => {
    for (const bad of ["http://example.com/a.png", "//example.com/a.png", "javascript:alert(1)", "data:image/png;base64,AAAA", "", "   ", null, undefined, 42]) {
      expect(safeLogoUrl(bad), String(bad)).toBeNull();
    }
  });
});
