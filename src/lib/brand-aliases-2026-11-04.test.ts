import { describe, expect, it } from "vitest";
import { brandNameVariants, canonicalizeBrand } from "./verified-store";
import { isBrandIngredientUrl } from "./brand-inci";

/* 2026-11-04, owner: "Plum and Plum Goodness are same, always merge". The model names the brand either way; the re-run held Plum's row as brand-changed. */
describe("Plum and Plum Goodness are one brand", () => {
  it("collapses either spelling to Plum", () => {
    expect(canonicalizeBrand("Plum Goodness")).toBe("Plum");
    expect(canonicalizeBrand("plum goodness")).toBe("Plum");
    expect(canonicalizeBrand("Plum")).toBe("Plum");
    expect(canonicalizeBrand("Plumeria Beauty")).toBe("Plumeria Beauty"); // another brand is left alone
  });
  it("matches a product stored under either spelling", () => {
    expect(brandNameVariants("Plum Goodness")).toEqual(["Plum", "Plum Goodness"]);
    expect(brandNameVariants("Plum")).toEqual(["Plum", "Plum Goodness"]);
  });
  it("still counts plumgoodness.com as the brand's own shop", () => {
    expect(isBrandIngredientUrl("https://plumgoodness.com/products/plum-cerasense-moisturizing-creme", "Plum Goodness")).toBe(true);
    expect(isBrandIngredientUrl("https://plumgoodness.com/products/plum-cerasense-moisturizing-creme", "Plum")).toBe(true);
  });
});

describe("prowl.life is Prowl by Tiger Shroff's own shop", () => {
  const page = "https://www.prowl.life/products/prowl-10-vitamin-c-brightening-daily-face-serum-all-skin-type-10ml-pack-of-1";
  it("accepts it for the brand's long name and its short one", () => {
    expect(isBrandIngredientUrl(page, "PROWL by Tiger Shroff")).toBe(true);
    expect(isBrandIngredientUrl(page, "Prowl")).toBe(true);
  });
  it("does not accept it for another brand", () => {
    expect(isBrandIngredientUrl(page, "Foxtale")).toBe(false);
  });
});
