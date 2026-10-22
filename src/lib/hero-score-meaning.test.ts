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

type Label = ProductScorecard["scoreLabel"];
const LABELS: Label[] = ["Excellent", "Good", "Fair", "Concern"];
const CALM = "Claims rest on ingredient research, not finished-product tests";

const product = (over: { score: number; pass?: string[]; warn?: string[]; claimEvidencePct?: number; label?: Label }) =>
  ({
    score: over.score,
    pass_badges: over.pass ?? [],
    warn_badges: over.warn ?? [],
    ...(over.label ? { scoreLabel: over.label } : {}),
    ...(over.claimEvidencePct !== undefined ? { claimEvidencePct: over.claimEvidencePct } : {}),
  }) as unknown as ProductScorecard;

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
  it("matches the original logic for every score from 0 to 100, every badge combination and every score label", () => {
    for (const pass of BADGE_SETS) {
      for (const label of [undefined, ...LABELS]) {
        for (let score = 0; score <= 100; score++) {
          expect(generateScoreMeaning(product({ score, pass, label }))[0], `${JSON.stringify(pass)} ${label} @ ${score}`).toBe(legacyEvidence(pass, score));
        }
      }
    }
  });

  it("never shows the calm line, even for a Good Standing label with a low total", () => {
    for (const label of ["Excellent", "Good"] as Label[]) {
      for (let score = 0; score < 70; score++) {
        expect(generateScoreMeaning(product({ score, label }))[0], `${label} @ ${score}`).not.toBe(CALM);
      }
    }
  });

  it("does not read claimEvidencePct when it is absent, even if other fields are odd", () => {
    expect(generateScoreMeaning(product({ score: 90 }))[0]).toBe("Strong ingredient profile");
    expect(generateScoreMeaning(product({ score: 10 }))[0]).toBe("Weak public evidence");
  });
});

describe("with claimEvidencePct (the pillar standing): the line follows claim evidence, not the total", () => {
  // Fair and Concern are the Room to Improve and Not Recommended labels: they keep the four original bands.
  const line = (pct: number, score = 95, pass: string[] = [], label: Label = "Fair") =>
    generateScoreMeaning(product({ score, pass, label, claimEvidencePct: pct }))[0];

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

  it("keeps the badge rules ahead of the calm line for Good Standing too", () => {
    for (const label of ["Excellent", "Good"] as Label[]) {
      expect(line(10, 10, ["Published SPF test report"], label)).toBe("Strong public evidence");
      expect(line(10, 10, ["Dermatologist tested", "Published test report"], label)).toBe("Good public evidence");
    }
  });

  it("leaves the second line (the caution note) untouched", () => {
    const warn = ["Contains fragrance allergen: Limonene"];
    expect(generateScoreMeaning(product({ score: 90, warn }))[1]).toBe(generateScoreMeaning(product({ score: 90, warn, claimEvidencePct: 10 }))[1]);
  });
});

describe("Good Standing with thin claim evidence: a calm line instead of 'limited' or 'weak'", () => {
  const GOOD: Label[] = ["Excellent", "Good"];
  const line = (pct: number | undefined, label: Label | undefined, score = 80, pass: string[] = []) =>
    generateScoreMeaning(product({ score, pass, label, claimEvidencePct: pct }))[0];

  it("says exactly the agreed wording, with no em dash", () => {
    expect(CALM).toBe("Claims rest on ingredient research, not finished-product tests");
    expect(CALM).not.toMatch(/[\u2014\u2013]/);
    for (const label of GOOD) expect(line(60, label)).toBe(CALM);
  });

  it("applies below 70 percent at every level down to 0, and not at 70 or above", () => {
    for (const label of GOOD) {
      for (let pct = 0; pct < 70; pct++) expect(line(pct, label), `${label} @ ${pct}`).toBe(CALM);
      expect(line(70, label)).toBe("Good public evidence");
      expect(line(84, label)).toBe("Good public evidence");
      expect(line(85, label)).toBe("Strong ingredient profile");
      expect(line(100, label)).toBe("Strong ingredient profile");
    }
  });

  it("replaces both 'limited' and 'weak': neither is shown for Good Standing on the pillar path", () => {
    for (const label of GOOD) {
      for (let pct = 0; pct <= 100; pct++) {
        expect(["Limited public evidence", "Weak public evidence"], `${label} @ ${pct}`).not.toContain(line(pct, label));
      }
    }
  });

  it("is decided by claim evidence, not by the total", () => {
    for (const label of GOOD) {
      expect(line(40, label, 99)).toBe(CALM);
      expect(line(90, label, 20)).toBe("Strong ingredient profile");
    }
  });

  it("does not apply to Room to Improve or Not Recommended (Fair, Concern) or to a missing label", () => {
    for (const label of ["Fair", "Concern", undefined] as (Label | undefined)[]) {
      expect(line(60, label)).toBe("Limited public evidence");
      expect(line(49, label)).toBe("Weak public evidence");
      expect(line(0, label)).toBe("Weak public evidence");
    }
  });

  it("does not apply without claimEvidencePct, whatever the label", () => {
    for (const label of GOOD) expect(line(undefined, label, 60)).toBe("Limited public evidence");
  });

  it("leaves the second line untouched", () => {
    const warn = ["Contains fragrance allergen: Limonene"];
    const base = generateScoreMeaning(product({ score: 80, label: "Good", warn }))[1];
    expect(generateScoreMeaning(product({ score: 80, label: "Good", warn, claimEvidencePct: 10 }))[1]).toBe(base);
  });
});
