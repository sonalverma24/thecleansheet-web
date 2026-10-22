import { describe, expect, it } from "vitest";
import { generateScoreMeaning } from "@/components/scorecards/ProductHero";
import type { ProductScorecard } from "@/data/brands/types";

/* The hero's "public evidence" line was chosen from the total out of 100. With the four-pillar standing the
   total no longer decides the standing, so the line reads claim evidence instead. Without that field the line
   must be exactly what it was: this file carries a copy of the ORIGINAL logic and pins the new code to it. */
function legacyEvidence(pass_badges: string[], score: number): string {
  const pass = pass_badges.map((b) => b.toLowerCase());
  if (pass.some((b) => b.includes("published spf") || (b.includes("spf") && b.includes("test")))) return "Strong public evidence";
  if (
    pass.filter((b) => b.includes("published") || b.includes("test report") || b.includes("dermatologist") || b.includes("non-comedogenic")).length >= 2
  ) return "Good public evidence";
  if (score >= 85) return "Strong ingredient profile";
  if (score >= 70) return "Good public evidence";
  if (score >= 50) return "Limited public evidence";
  return "Weak public evidence";
}

const product = (over: { score: number; pass?: string[]; warn?: string[]; claimEvidencePct?: number }) =>
  ({ score: over.score, pass_badges: over.pass ?? [], warn_badges: over.warn ?? [], ...(over.claimEvidencePct !== undefined ? { claimEvidencePct: over.claimEvidencePct } : {}) }) as unknown as ProductScorecard;

const BADGE_SETS: string[][] = [
  [],
  ["Published SPF test report"],
  ["Tested on skin: SPF test"],
  ["Dermatologist tested", "Published test report"],
  ["Non-comedogenic", "Dermatologist tested", "Fragrance free"],
  ["Dermatologist tested"],
  ["Fragrance free", "Paraben free"],
];

describe("flag off (no claimEvidencePct): exactly the original line", () => {
  it("matches the original logic for every score from 0 to 100 and every badge combination", () => {
    for (const pass of BADGE_SETS) {
      for (let score = 0; score <= 100; score++) {
        expect(generateScoreMeaning(product({ score, pass }))[0], `${JSON.stringify(pass)} @ ${score}`).toBe(legacyEvidence(pass, score));
      }
    }
  });

  it("does not read claimEvidencePct when it is absent, even if other fields are odd", () => {
    expect(generateScoreMeaning(product({ score: 90 }))[0]).toBe("Strong ingredient profile");
    expect(generateScoreMeaning(product({ score: 10 }))[0]).toBe("Weak public evidence");
  });
});

describe("with claimEvidencePct (the pillar standing): the line follows claim evidence, not the total", () => {
  const line = (pct: number, score = 95, pass: string[] = []) => generateScoreMeaning(product({ score, pass, claimEvidencePct: pct }))[0];

  it("uses the same four bands on the percentage, inclusive at the boundaries", () => {
    expect(line(100)).toBe("Strong ingredient profile");
    expect(line(85)).toBe("Strong ingredient profile");
    expect(line(84)).toBe("Good public evidence");
    expect(line(70)).toBe("Good public evidence");
    expect(line(69)).toBe("Limited public evidence");
    expect(line(50)).toBe("Limited public evidence");
    expect(line(49)).toBe("Weak public evidence");
  });

  it("ignores a high total when claim evidence is thin, and a low total when it is strong", () => {
    expect(line(20, 95)).toBe("Weak public evidence");
    expect(line(90, 20)).toBe("Strong ingredient profile");
  });

  it("treats 0 percent as a real value, not as missing", () => {
    expect(line(0, 99)).toBe("Weak public evidence");
  });

  it("still lets the badge rules win first, as before", () => {
    expect(line(10, 10, ["Published SPF test report"])).toBe("Strong public evidence");
    expect(line(10, 10, ["Dermatologist tested", "Published test report"])).toBe("Good public evidence");
  });

  it("leaves the second line (the caution note) untouched", () => {
    const warn = ["Contains fragrance allergen: Limonene"];
    expect(generateScoreMeaning(product({ score: 90, warn }))[1]).toBe(generateScoreMeaning(product({ score: 90, warn, claimEvidencePct: 10 }))[1]);
  });
});
