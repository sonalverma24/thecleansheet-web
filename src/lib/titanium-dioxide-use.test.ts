import { afterEach, describe, expect, it, vi } from "vitest";
import { decideReview } from "@/lib/analyser-x";
import { AUTHORITIES, regulationOf } from "@/lib/analyser-x/regulatory";
import { BASE, NOW, rv } from "@/lib/analyser-x/test-helpers";
import { lookupIngredient } from "@/lib/ingredient-db";
import { productScopeOf } from "@/lib/product-scope";

/* Titanium dioxide is ONE entry with limits by use (reviewer TCS-P-024, 2026-10-27): its sunscreen limits apply when it is a UV filter,
   not when it is only a colourant (CI 77891). Before the US status named its product type, a vitamin C serum that used it as a colourant
   was told "Titanium Dioxide is restricted in the US" with no strength to check. */

const LABEL = "Titanium Dioxide (Ci 77891)";
const serum = productScopeOf("Vitamin C Serum", "Serum");
const sunscreen = productScopeOf("Mineral Sunscreen SPF 50", "Sunscreen");
const noteIds = (r: ReturnType<typeof decideReview>) => r.findings.map((f) => f.ruleId);

afterEach(() => vi.unstubAllEnvs());

describe("titanium dioxide: one entry, limits by use", () => {
  it("as a colourant in a serum, no authority reads it as restricted", () => {
    const reg = regulationOf(LABEL, "Vitamin C Serum", lookupIngredient, serum);
    expect(reg.resolved).toBe(true);
    for (const a of AUTHORITIES) expect(reg.perAuthority[a].status, a).toBe("permitted");
  });

  it("in a sunscreen the US still reads it as an OTC sunscreen active with a 25% limit it cannot verify", () => {
    const reg = regulationOf("Titanium Dioxide", "Mineral Sunscreen SPF 50", lookupIngredient, sunscreen);
    expect(reg.perAuthority.US).toEqual({ status: "restricted_unverifiable", limit: 25 });
  });

  it("with no product given every status applies, exactly as before", () => {
    expect(regulationOf("Titanium Dioxide", "").perAuthority.US.status).toBe("restricted_unverifiable");
  });

  it("the page no longer notes a restriction it cannot check on a serum, and still does on a sunscreen", () => {
    const serumReview = rv({ productName: "Vitamin C Serum", category: "Serum", inciIngredients: [...BASE, LABEL] });
    const sunscreenReview = rv({ productName: "Mineral Sunscreen SPF 50", category: "Sunscreen", inciIngredients: [...BASE, "Titanium Dioxide"] });
    expect(noteIds(decideReview(serumReview, NOW))).not.toContain("note.restricted_unverified");
    expect(noteIds(decideReview(sunscreenReview, NOW))).toContain("note.restricted_unverified");
  });

  it("a bare 'CI 77891' label reaches this entry only when the alias flag is on, and then reads as a colourant in a serum", () => {
    vi.stubEnv("ANALYSER_INGREDIENT_ALIASES", "0");
    expect(lookupIngredient("CI 77891")).toBeUndefined();
    vi.stubEnv("ANALYSER_INGREDIENT_ALIASES", "1");
    expect(lookupIngredient("CI 77891")?.INCI_Name).toBe("Titanium Dioxide");
    const reg = regulationOf("CI 77891", "Vitamin C Serum", lookupIngredient, serum);
    for (const a of AUTHORITIES) expect(reg.perAuthority[a].status, a).toBe("permitted");
  });
});
