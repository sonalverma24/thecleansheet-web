import { describe, expect, it } from "vitest";
import { inciKey, normaliseIngredient } from "@/lib/inci-normalise";

describe("normaliseIngredient: display synonyms map, never penalise", () => {
  it.each(["Aqua (Water)", "Water (Aqua) (Eau)", "Aqua", "Eau", "aqua / water", "Aqua (Purified Water)"])(
    "%s is Water with no flag",
    (raw) => {
      const n = normaliseIngredient(raw);
      expect(n.canonical).toBe("Water");
      expect(n.quantityUnspecified).toBe(false);
      expect(n.catchAll).toBeNull();
      expect(n.suggestions).toEqual([]);
    },
  );

  it("folds Parfum and Fragrance (Parfum) to Fragrance", () => {
    expect(normaliseIngredient("Parfum").canonical).toBe("Fragrance");
    expect(normaliseIngredient("Fragrance (Parfum)").canonical).toBe("Fragrance");
  });

  it("does not fold a name that merely contains water", () => {
    expect(normaliseIngredient("Rose Water").canonical).toBe("Rose Water");
    expect(normaliseIngredient("Aqua Silica").canonical).toBe("Aqua Silica");
  });
});

describe("normaliseIngredient: q.s. is a quantity note on a NAMED ingredient", () => {
  it("Sodium Benzoate- Q.S.", () => {
    const n = normaliseIngredient("Sodium Benzoate- Q.S.");
    expect([n.canonical, n.quantityUnspecified, n.catchAll]).toEqual(["Sodium Benzoate", true, null]);
  });

  it("Water Q.S. is a named-water quantity, never a catch-all", () => {
    const n = normaliseIngredient("Water Q.S.");
    expect([n.canonical, n.quantityUnspecified, n.catchAll]).toEqual(["Water", true, null]);
  });

  it.each(["Aqua (q.s.)", "Aqua q.s. to 100%"])("%s", (raw) => {
    const n = normaliseIngredient(raw);
    expect([n.canonical, n.quantityUnspecified, n.catchAll]).toEqual(["Water", true, null]);
  });

  it("a bare QS names nothing, so it is a catch-all", () => {
    const n = normaliseIngredient("QS");
    expect(n.quantityUnspecified).toBe(true);
    expect(n.catchAll).toBe("qs");
  });

  it("does not read letters inside a word as q.s.", () => {
    expect(normaliseIngredient("Tocopherols").quantityUnspecified).toBe(false);
    expect(normaliseIngredient("Quillaja Saponaria Extract").quantityUnspecified).toBe(false);
    expect(normaliseIngredient("Quartzqs").quantityUnspecified).toBe(false);
  });
});

describe("normaliseIngredient: catch-alls and fragrance declarations", () => {
  it("Sugandhit Dravya and Parfum are both fragrance declarations, and neither is a catch-all", () => {
    for (const raw of ["Sugandhit Dravya", "Parfum", "Fragrance (Parfum)", "Fragrance"]) {
      const n = normaliseIngredient(raw);
      expect([raw, n.fragranceDeclaration, n.catchAll]).toEqual([raw, true, null]);
    }
  });

  it("only the Hindi wording gets a wording suggestion, like Vit E, and it is not applied", () => {
    expect(normaliseIngredient("Sugandhit Dravya").suggestions).toEqual(["possible INCI: Parfum - confirm against source"]);
    expect(normaliseIngredient("Sugandhit Dravya").canonical).toBe("Sugandhit Dravya");
    expect(normaliseIngredient("Parfum").suggestions).toEqual([]);
  });

  it("an ordinary ingredient is not a fragrance declaration", () => {
    expect(normaliseIngredient("Glycerin").fragranceDeclaration).toBe(false);
  });

  it("defers to the rubric's definition for bases and blends", () => {
    expect(normaliseIngredient("Soap Base").catchAll).toBe("base");
    expect(normaliseIngredient("Proprietary Herbal Blend").catchAll).toBe("blend");
  });

  it("a blend that names its contents is disclosed", () => {
    expect(normaliseIngredient("Herbal Complex (Neem, Tulsi, Aloe Vera)").catchAll).toBeNull();
  });
});

describe("normaliseIngredient: shorthand and reversed names are suggestions, not corrections", () => {
  it.each(["Vit E", "Vit -E", "vit-e", "Vitamin E"])("%s suggests Tocopherol and is not a defect", (raw) => {
    const n = normaliseIngredient(raw);
    expect(n.suggestions[0]).toMatch(/Tocopherol/);
    expect(n.canonical).toBe(raw.replace(/\s+/g, " ").trim());
    expect(n.catchAll).toBeNull();
  });

  it("Edta Disodium suggests Disodium EDTA without rewriting it", () => {
    const n = normaliseIngredient("Edta Disodium");
    expect(n.suggestions[0]).toMatch(/Disodium EDTA/);
    expect(n.canonical).toBe("Edta Disodium");
  });

  it("Disodium EDTA itself gets no suggestion", () => {
    expect(normaliseIngredient("Disodium EDTA").suggestions).toEqual([]);
  });
});

describe("inciKey", () => {
  it("treats Water, Aqua and Water (Aqua) (Eau) as one ingredient", () => {
    expect(new Set(["Water", "Aqua", "Water (Aqua) (Eau)", "AQUA (WATER)"].map(inciKey)).size).toBe(1);
  });

  it("reduces 'X / common name' to X", () => {
    expect(inciKey("Butyrospermum Parkii Butter / Shea Butter")).toBe(inciKey("Butyrospermum Parkii Butter"));
  });

  it("ignores case, spacing and punctuation", () => {
    expect(inciKey("Poly-Sorbate 80")).toBe(inciKey("polysorbate 80"));
  });
});
