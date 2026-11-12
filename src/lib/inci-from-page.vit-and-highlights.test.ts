import { describe, expect, it } from "vitest";
import { extractInciWithQuote, sentenceSpans, startAtListLabel } from "./inci-from-page";

/* 2026-11-04, two rows of the grey re-run. Prowl's page prints "Ascorbic Acid (Vit. C)" and "Niacinamide (Vit. B3)": the full stop after "Vit" was read as the end of a
   sentence, so the list began at "B3)" and stopped at "Tocopherol (Vit". Omeo's page prints a "Key Ingredients" panel (7 botanicals, no water, no cleansing base) which was
   published as the product's ingredient list. */

describe("a vitamin printed as \"Vit.\" is not the end of a sentence", () => {
  const prowl = "Ingredients Aqua (Water), Ascorbic Acid (Vit. C), Niacinamide (Vit. B3), Glycerin, Propylene Glycol, Propanediol, Phenoxyethanol, Ethylhexylglycerin, Xanthan Gum, Ferulic Acid, Parfum, Tocopherol (Vit. E) How to use Apply two drops on clean skin.";

  it("reads Prowl's whole list, first entry to last", () => {
    const out = startAtListLabel(extractInciWithQuote(prowl)); // as the engine reads a page: the glued "Ingredients" label is dropped from the first entry
    expect(out?.ingredients).toEqual([
      "Aqua (Water)", "Ascorbic Acid (Vit. C)", "Niacinamide (Vit. B3)", "Glycerin", "Propylene Glycol", "Propanediol",
      "Phenoxyethanol", "Ethylhexylglycerin", "Xanthan Gum", "Ferulic Acid", "Parfum", "Tocopherol (Vit. E)",
    ]);
  });

  it("does not split a sentence at \"Vit.\", but still splits at an ordinary full stop", () => {
    expect(sentenceSpans("Ascorbic Acid (Vit. C), Glycerin").length).toBe(1);
    expect(sentenceSpans("Apply daily. Store in a cool place").length).toBe(2);
  });
});

describe("a \"Key Ingredients\" panel is not the ingredient list", () => {
  const keyPanel = "Key Ingredients Arnica Montana Flower Extract, Calendula Officinalis Flower Extract, Thuja Occidentalis Leaf Oil, Melia Azadirachta Leaf (Neem) Extract, Zingiber Officinale (Ginger) Root Extract, Propanediol Caprylate, Lactic Acid. Manufacturer Details BJain Pharmaceuticals Pvt. Ltd. Address - Rajasthan.";

  it("refuses Omeo's seven highlights", () => {
    expect(extractInciWithQuote(keyPanel)).toBeNull();
  });

  it("refuses it in a markdown heading and with a colon too, and for \"Hero Ingredients\"", () => {
    expect(extractInciWithQuote(keyPanel.replace("Key Ingredients", "## Key Ingredients\n\n"))).toBeNull();
    expect(extractInciWithQuote(keyPanel.replace("Key Ingredients", "**Key Ingredients:**"))).toBeNull();
    expect(extractInciWithQuote(keyPanel.replace("Key Ingredients", "Hero Ingredients"))).toBeNull();
  });

  it("still reads the real list when the page also has one under its own label", () => {
    const both = `${keyPanel} Full Ingredients: Aqua, Cocamidopropyl Betaine, Sodium Lauroyl Sarcosinate, Glycerin, Arnica Montana Flower Extract, Calendula Officinalis Flower Extract, Thuja Occidentalis Leaf Oil, Melia Azadirachta Leaf (Neem) Extract, Zingiber Officinale (Ginger) Root Extract, Propanediol Caprylate, Lactic Acid, Phenoxyethanol. Shelf life 24 months.`;
    const out = extractInciWithQuote(both);
    expect(out?.ingredients[0]).toBe("Aqua");
    expect(out?.ingredients.length).toBe(12);
  });

  it("does not change how an ordinary \"Ingredients:\" list is read", () => {
    const plain = "Ingredients: Aqua, Glycerin, Niacinamide, Panthenol, Sodium Hyaluronate, Phenoxyethanol. How to use: apply daily.";
    expect(extractInciWithQuote(plain)?.ingredients).toEqual(["Aqua", "Glycerin", "Niacinamide", "Panthenol", "Sodium Hyaluronate", "Phenoxyethanol"]);
  });
});
