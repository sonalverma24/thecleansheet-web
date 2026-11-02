import { describe, expect, it } from "vitest";
import { lookupIngredient } from "@/lib/ingredient-db";
import { buildVeganScreen } from "@/lib/review-to-scorecard";

/* The vegan screen shows an animal-origin cross only for an origin the reference states without an alternative. Owner decision, 2026-10-30
   (Aestura Atobarrier 365 Cream): "can we please verify claims like this first?" Cholesterol is listed as "Animal (lanolin) / Biotechnological",
   so which route a product's supplier uses is not stated, and a cross would be a claim nobody checked.
   Owner decision, 2026-11-01: an animal ingredient is drawn only when explicitly stated and verified; every other open question is a gap ("originToConfirm"). */
describe("the vegan ingredient-origin screen", () => {
  it("rests on the reference rows these cases name (a changed row should fail here, not on a live page)", () => {
    expect(lookupIngredient("Cholesterol")).toMatchObject({ Ingredient_Origin: "Animal (lanolin) / Biotechnological", Data_Confidence: "High" });
    expect(lookupIngredient("Shellac")).toMatchObject({ Ingredient_Origin: "Animal-derived (insect secretion)", Data_Confidence: "High" });
    expect(lookupIngredient("Milk Thistle Extract")).toMatchObject({ Ingredient_Origin: "Vegetable (milk thistle fruit)", Data_Confidence: "High" });
    expect(lookupIngredient("Beeswax")).toMatchObject({ Ingredient_Origin: "Animal (honeybee)", Vegan: "No", Data_Confidence: "High" });
    expect(lookupIngredient("Oleic Acid")).toMatchObject({ Ingredient_Origin: "Vegetable (olive oil) / Animal", Vegan: "Yes", Data_Confidence: "High" });
    expect(lookupIngredient("Snail Secretion Filtrate")).toMatchObject({ Ingredient_Origin: "Animal derived (snail secretion)", Data_Confidence: "Medium" });
    expect(lookupIngredient("Hyaluronic Acid")).toMatchObject({ Vegan: "Depends on source" });
  });

  it("does not call an ingredient animal-origin when the reference also lists a plant, synthetic or biotech route: its origin is still to confirm", () => {
    const s = buildVeganScreen(["Cholesterol"], true);
    expect(s.animalIngredients).toEqual([]);
    expect(s.originToConfirm).toEqual(["Cholesterol"]);
    expect(s.unknownIngredients).toEqual([]);
    expect(s.status).toBe("unknown");
  });

  it("reads 'Animal (…)' as an animal source, not only a few named materials: honeybee wax, sheep wool and cochineal are crosses", () => {
    expect(buildVeganScreen(["Beeswax", "Lanolin", "Carmine"], true)).toMatchObject({ status: "conflict", animalIngredients: ["Beeswax", "Lanolin", "Carmine"], originToConfirm: [] });
  });

  it("an animal route beside a plant one is to confirm, even when the vegan column says Yes (Oleic Acid): no tick, no cross", () => {
    expect(buildVeganScreen(["Oleic Acid"], true)).toMatchObject({ status: "unknown", animalIngredients: [], originToConfirm: ["Oleic Acid"] });
  });

  it("an animal route stated at lower confidence is to confirm, not a cross (Snail Secretion Filtrate is Medium)", () => {
    expect(buildVeganScreen(["Snail Secretion Filtrate"], true)).toMatchObject({ status: "unknown", animalIngredients: [], originToConfirm: ["Snail Secretion Filtrate"] });
  });

  it("a row whose own vegan column is not a plain Yes is to confirm (Hyaluronic Acid: 'Depends on source')", () => {
    expect(buildVeganScreen(["Hyaluronic Acid"], true).originToConfirm).toEqual(["Hyaluronic Acid"]);
  });

  it("an ingredient the reference does not cover, or says nothing about, raises no question: it is unknown, not a gap", () => {
    const s = buildVeganScreen(["Glycol Distearate", "Not A Real Ingredient Name"], true);
    expect(s.originToConfirm).toEqual([]);
    expect(s.unknownIngredients).toEqual(["Glycol Distearate", "Not A Real Ingredient Name"]);
  });

  it("still names an ingredient whose only stated origin is an animal", () => {
    const s = buildVeganScreen(["Aqua", "Shellac", "Propolis Extract"], true);
    expect(s.animalIngredients).toEqual(["Shellac", "Propolis Extract"]);
    expect(s.status).toBe("conflict");
  });

  it("an animal-only ingredient is a cross even beside an unresolved one", () => {
    expect(buildVeganScreen(["Cholesterol", "Shellac"], true)).toMatchObject({ status: "conflict", animalIngredients: ["Shellac"], originToConfirm: ["Cholesterol"] });
  });

  it("does not take 'milk' in 'milk thistle' for dairy", () => {
    expect(buildVeganScreen(["Milk Thistle Extract"], true).animalIngredients).toEqual([]);
  });

  it("is unknown for the whole list when the list is not source-backed", () => {
    expect(buildVeganScreen(["Shellac", "Aqua"], false)).toMatchObject({ status: "unknown", animalIngredients: [], originToConfirm: [], unknownIngredients: ["Shellac", "Aqua"] });
  });
});
