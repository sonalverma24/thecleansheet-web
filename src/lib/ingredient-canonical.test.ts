import { describe, expect, it } from "vitest";
import { MERGES, canonicalIngredientSlug, isAliasSlug } from "@/lib/ingredient-canonical";
import { ALL_INGREDIENTS, toSlug } from "@/lib/ingredient-utils";

/* The invariants ingredient-canonical.ts states about its own MERGES list: every name is a
   curated profile, and no pair disagrees on the safety fields, so a merge never hides a
   more cautious profile's flags. */

const profile = (name: string) => ALL_INGREDIENTS.find((i) => i.INCI_Name === name);
const SAFETY_FIELDS = ["Concern_Level_TCS", "CMR_Flag", "SVHC_Flag", "Endocrine_Flag", "EU_Status", "Allergen_Flag"] as const;

describe("the almond oil merge", () => {
  const [preferred, alias] = ["Sweet Almond Oil (Prunus Amygdalus Dulcis Oil)", "Prunus Amygdalus Dulcis Oil"];

  it("is in the list and both names are curated profiles", () => {
    expect(MERGES.some(([p, ...a]) => p === preferred && a.includes(alias))).toBe(true);
    expect(profile(preferred)).toBeDefined();
    expect(profile(alias)).toBeDefined();
  });

  it("the two profiles agree on every safety field", () => {
    for (const f of SAFETY_FIELDS) expect(profile(alias)![f], f).toBe(profile(preferred)![f]);
  });

  it("the preferred profile keeps the stricter nut-allergy wording", () => {
    expect(profile(preferred)!.Baby_Restriction).toMatch(/caution/i);
    expect(profile(preferred)!.Key_Safety_Notes).toMatch(/patch test/i);
  });

  it("resolves the alias to the preferred slug, and only the alias is an alias", () => {
    expect(canonicalIngredientSlug(toSlug(alias))).toBe(toSlug(preferred));
    expect(isAliasSlug(toSlug(alias))).toBe(true);
    expect(isAliasSlug(toSlug(preferred))).toBe(false);
  });
});
