import { describe, expect, it } from "vitest";
import { hasUnnegatedMatch } from "@/lib/text-negation";

describe("hasUnnegatedMatch", () => {
  const bannedOrProhibited = /\b(banned|prohibited)\b/;

  it("the exact Moxie Beauty / Tripeptide-1 status does not trigger", () => {
    expect(hasUnnegatedMatch("Permitted; listed in EU CosIng; not restricted or prohibited", bannedOrProhibited)).toBe(false);
  });

  it("a bare, unnegated hit still triggers", () => {
    expect(hasUnnegatedMatch("Banned in leave-on cosmetics.", bannedOrProhibited)).toBe(true);
  });

  it("negation must be in the same clause to suppress a match", () => {
    expect(hasUnnegatedMatch("Not fragranced; banned in leave-on products", bannedOrProhibited)).toBe(true);
  });

  it("handles undefined and empty input", () => {
    expect(hasUnnegatedMatch(undefined, bannedOrProhibited)).toBe(false);
    expect(hasUnnegatedMatch("", bannedOrProhibited)).toBe(false);
  });
});
