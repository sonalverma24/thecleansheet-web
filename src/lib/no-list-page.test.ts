/* La Roche-Posay's Anthelios UVMUNE400 Invisible Fluid (stored 2026-11-25) was saved with no ingredient list, and its page contradicted itself: Formula logic "Strong"
   over "pending a verified ingredient list", claims supported by "the presence of" filters the page says it cannot see, "Netlock Technology" as a key ingredient,
   test notes about patents, a pH gap on a sunscreen, and "Analysed on ... from Not verified." The fixture is that stored row, trimmed. */
import { describe, expect, it } from "vitest";
import fixture from "./no-list-page.fixture.json";
import type { DerivedVerdict, ProductReview } from "./product-review-types";
import { pillsFor } from "./pills-for-review";
import { reviewToScorecard, restsOnFormula } from "./review-to-scorecard";
import { unwrapAdRedirect } from "./retailer-pages";
import { pageTitleNamesProduct } from "./product-identity";

const review = fixture.review as unknown as ProductReview;
const verdict = fixture.verdict as unknown as DerivedVerdict;
const NOW = "2026-11-27T10:00:00.000Z";

describe("a page with no verified ingredient list", () => {
  const { product } = reviewToScorecard(review, verdict);
  const { model } = pillsFor(review, verdict, NOW);
  const rows = model.details ?? [];

  it("does not rate the formula", () => {
    const formula = rows.find((r) => r.title === "Formula logic");
    expect(formula?.rating.marker).toBeNull();
    expect(formula?.rating.word).toBe("Not rated");
    expect(formula?.oneLiner).toMatch(/without a verified ingredient list/);
  });

  it("does not support a claim with what the formula contains", () => {
    const byClaim = (re: RegExp) => product.claimsCheck?.find((c) => re.test(c.claim));
    expect(byClaim(/^Ultimate protection \(UVB/)?.decision).toBe("Needs proof");
    expect(byClaim(/^Ultra-resistant/)?.decision).toBe("Needs proof");
    expect(byClaim(/^Invisible, light-weight/)?.decision).toBe("Needs proof");
    // A claim backed by the brand's own test is untouched.
    expect(byClaim(/^Tested on sensitive/)?.decision).toBe("Publicly supported");
  });

  it("names no key ingredients", () => {
    expect(model.keyActives).toEqual([]);
  });

  it("shows only test notes under Test transparency", () => {
    const tests = rows.find((r) => r.title === "Test transparency");
    expect(tests?.body.join(" ")).not.toMatch(/patent/i);
    expect(tests?.body.every((b) => /test|stud|users|clinical|report/i.test(b))).toBe(true);
  });

  it("does not ask a sunscreen for its pH", () => {
    expect(rows.find((r) => r.title === "Consumer clarity")?.oneLiner).not.toMatch(/\bpH\b/);
  });

  it("does not name 'Not verified' as the list's source", () => {
    const recent = model.faq.find((f) => /How recent/.test(f.q))?.a ?? "";
    expect(recent).not.toMatch(/Not verified/);
    expect(recent).toMatch(/without a verified ingredient list/);
  });
});

describe("restsOnFormula", () => {
  it("reads support from the formula's make-up", () => {
    expect(restsOnFormula("Supported by the presence of multiple broad-spectrum UV filters.")).toBe(true);
    expect(restsOnFormula("The formula contains silica and perlite for a matte finish.")).toBe(true);
    expect(restsOnFormula("The formula incorporates Netlock Technology.")).toBe(true);
    expect(restsOnFormula("The brand states the formula is tested on sensitive skin.")).toBe(false);
    expect(restsOnFormula(undefined)).toBe(false);
  });
});

describe("unwrapAdRedirect", () => {
  const ad = "https://www.amazon.in/sspa/click?ie=UTF8&spc=MTo&url=%2FRoche-Posay-Anthelios-UVMune-Invisible-Resistant%2Fdp%2FB09SLF5ZH8%2Fref%3Dsr_1_4_sspa%3Fkeywords%3Daqua%2Bgel&aref=6Vo";
  it("returns the product page a sponsored link wraps", () => {
    expect(unwrapAdRedirect(ad)).toBe("https://www.amazon.in/Roche-Posay-Anthelios-UVMune-Invisible-Resistant/dp/B09SLF5ZH8");
  });
  it("leaves every other address alone", () => {
    for (const u of [
      "https://www.amazon.in/dp/B09SLF5ZH8",
      "https://www.nykaa.com/x/p/123",
      "https://www.amazon.in/sspa/click?url=https%3A%2F%2Fevil.example%2Fdp%2FB09SLF5ZH8",
      "https://www.amazon.in/sspa/click?url=%2F%2Fevil.example%2Fdp%2FB09SLF5ZH8",
      "https://www.amazon.in/sspa/click?url=%2Fs%3Fk%3Dsunscreen",
      "La Roche-Posay sunscreen",
    ]) expect(unwrapAdRedirect(u)).toBe(u);
  });
});

describe("pageTitleNamesProduct with a name and number run together", () => {
  const name = "La Roche-Posay Anthelios UVMUNE400 Invisible Fluid SPF50+ Sunscreen, 50ml";
  it("matches the same words written apart", () => {
    expect(pageTitleNamesProduct("La Roche-Posay Anthelios Uvmune 400 Invisible Fluid SPF50+", "La Roche-Posay", name)).toBe(true);
  });
  it("still refuses another number", () => {
    expect(pageTitleNamesProduct("La Roche-Posay Anthelios Uvmune 300 Invisible Fluid SPF30", "La Roche-Posay", name)).toBe(false);
  });
});
