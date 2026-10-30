import { describe, expect, it } from "vitest";
import { lookupIngredient } from "@/lib/ingredient-db";
import { buildVeganScreen } from "@/lib/review-to-scorecard";

/* The vegan screen shows an animal-origin cross only for an origin the reference states without an alternative. Owner decision, 2026-10-30
   (Aestura Atobarrier 365 Cream): "can we please verify claims like this first?" Cholesterol is listed as "Animal (lanolin) / Biotechnological",
   so which route a product's supplier uses is not stated, and a cross would be a claim nobody checked. */
describe("the vegan ingredient-origin screen", () => {
  it("rests on the reference rows these cases name (a changed row should fail here, not on a live page)", () => {
    expect(lookupIngredient("Cholesterol")).toMatchObject({ Ingredient_Origin: "Animal (lanolin) / Biotechnological", Data_Confidence: "High" });
    expect(lookupIngredient("Shellac")).toMatchObject({ Ingredient_Origin: "Animal-derived (insect secretion)", Data_Confidence: "High" });
    expect(lookupIngredient("Milk Thistle Extract")).toMatchObject({ Ingredient_Origin: "Vegetable (milk thistle fruit)", Data_Confidence: "High" });
  });

  it("does not call an ingredient animal-origin when the reference also lists a plant, synthetic or biotech route: its origin is unresolved", () => {
    const s = buildVeganScreen(["Cholesterol"], true);
    expect(s.animalIngredients).toEqual([]);
    expect(s.unknownIngredients).toEqual(["Cholesterol"]);
    expect(s.status).toBe("unknown");
  });

  it("still names an ingredient whose only stated origin is an animal", () => {
    const s = buildVeganScreen(["Aqua", "Shellac", "Propolis Extract"], true);
    expect(s.animalIngredients).toEqual(["Shellac", "Propolis Extract"]);
    expect(s.status).toBe("conflict");
  });

  it("an animal-only ingredient is a cross even beside an unresolved one", () => {
    expect(buildVeganScreen(["Cholesterol", "Shellac"], true)).toMatchObject({ status: "conflict", animalIngredients: ["Shellac"], unknownIngredients: ["Cholesterol"] });
  });

  it("does not take 'milk' in 'milk thistle' for dairy", () => {
    expect(buildVeganScreen(["Milk Thistle Extract"], true).animalIngredients).toEqual([]);
  });

  it("is unknown for the whole list when the list is not source-backed", () => {
    expect(buildVeganScreen(["Shellac", "Aqua"], false)).toMatchObject({ status: "unknown", animalIngredients: [], unknownIngredients: ["Shellac", "Aqua"] });
  });
});
