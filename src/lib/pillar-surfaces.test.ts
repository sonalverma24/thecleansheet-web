import { afterEach, describe, expect, it, vi } from "vitest";
import { deriveVerdict, reconcileReviewScores } from "@/lib/product-review-engine";
import { reviewToScorecard } from "@/lib/review-to-scorecard";
import { generateScoreMeaning } from "@/components/scorecards/ProductHero";
import { ANALYSER_FLAGS } from "@/lib/analyser-flags";
import { buildStanding, type StandingTarget } from "@/lib/review.fixtures";

/* The two surfaces that used the total out of 100 to describe a standing the total no longer decides:
   the verdict carries claim evidence as a percentage (only on the pillar path), the scorecard passes it to the
   hero, and with the flag off nothing is added at all. */
const FLAG = ANALYSER_FLAGS.pillarStanding;
afterEach(() => vi.unstubAllEnvs());
const TARGETS: StandingTarget[] = ["approved", "mostly-clean", "can-do-better", "not-recommended", "not-assessed"];

describe("flag off", () => {
  it.each(TARGETS)("%s: no claimEvidencePct on the verdict and none on the scorecard (no key at all)", (t) => {
    const review = buildStanding(t);
    const verdict = deriveVerdict(review);
    expect("claimEvidencePct" in verdict).toBe(false);
    const { product } = reviewToScorecard(review, verdict);
    expect("claimEvidencePct" in product).toBe(false);
  });
});

describe("flag on", () => {
  const on = () => vi.stubEnv(FLAG, "1");

  it.each(TARGETS)("%s: the verdict carries claim evidence as a percentage of the code-capped points", (t) => {
    on();
    const review = buildStanding(t);
    const verdict = deriveVerdict(review);
    const pts = reconcileReviewScores(review).scores.claimEvidence;
    expect(verdict.claimEvidencePct).toBe(Math.round((pts / 20) * 100));
    expect(verdict.claimEvidencePct).toBeGreaterThanOrEqual(0);
    expect(verdict.claimEvidencePct).toBeLessThanOrEqual(100);
  });

  it.each(TARGETS)("%s: the scorecard passes it on unchanged", (t) => {
    on();
    const review = buildStanding(t);
    const verdict = deriveVerdict(review);
    expect(reviewToScorecard(review, verdict).product.claimEvidencePct).toBe(verdict.claimEvidencePct);
  });

  it("the hero line is then decided by claim evidence, not by the total", () => {
    on();
    for (const t of TARGETS) {
      const review = buildStanding(t);
      const verdict = deriveVerdict(review);
      const { product } = reviewToScorecard(review, verdict);
      const goodStanding = product.scoreLabel === "Excellent" || product.scoreLabel === "Good";
      const expected = (p: number) =>
        p >= 85
          ? "Strong ingredient profile"
          : p >= 70
            ? "Good public evidence"
            : goodStanding
              ? "Claims rest on ingredient research, not finished-product tests"
              : p >= 50
                ? "Limited public evidence"
                : "Weak public evidence";
      // a product with no badges so the band rules decide
      const line = generateScoreMeaning({ ...product, pass_badges: [], warn_badges: [] })[0];
      expect(line, t).toBe(expected(verdict.claimEvidencePct!));
    }
  });

  it("end to end: Good Standing with thin claim evidence gets the calm line; Not Recommended keeps 'weak'", () => {
    on();
    const calm = "Claims rest on ingredient research, not finished-product tests";
    const hero = (t: StandingTarget) => {
      const review = buildStanding(t);
      const verdict = deriveVerdict(review);
      const { product } = reviewToScorecard(review, verdict);
      return { verdict, product, line: generateScoreMeaning({ ...product, pass_badges: [], warn_badges: [] })[0] };
    };
    const thin = hero("can-do-better"); // Good Standing on the pillars, claim evidence 25 percent
    expect(["Excellent", "Good"]).toContain(thin.product.scoreLabel);
    expect(thin.verdict.claimEvidencePct).toBeLessThan(70);
    expect(thin.line).toBe(calm);
    const bad = hero("not-recommended"); // 10 percent, but not Good Standing: wording unchanged
    expect(bad.product.scoreLabel).toBe("Concern");
    expect(bad.line).toBe("Weak public evidence");
    expect(hero("approved").line).toBe("Strong ingredient profile");
  });

  it("a Good Standing review with a low total is no longer described by that total", () => {
    on();
    const review = buildStanding("can-do-better"); // weak scored sections, strong pillars
    const verdict = deriveVerdict(review);
    expect(["approved", "mostly-clean"]).toContain(verdict.tier);
    const { product } = reviewToScorecard(review, verdict);
    expect(product.score).toBeLessThan(65);
    expect(product.claimEvidencePct).toBe(verdict.claimEvidencePct);
  });
});
