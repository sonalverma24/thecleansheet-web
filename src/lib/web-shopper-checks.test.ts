import { describe, expect, it } from "vitest";
import { buildProductPageChecks, type BuildProductPageChecksInput } from "@/lib/web-shopper-checks";

const base = (over: Partial<BuildProductPageChecksInput> = {}): BuildProductPageChecksInput => ({
  pageText: "Daily Face Serum. Pregnancy-safe. Ingredients: Aqua, Glycerin, Retinol.",
  pageTitle: "Daily Face Serum",
  productCategory: "Face serum",
  sourceUrl: "https://brand.example/products/serum",
  capturedAt: "2026-10-25T10:00:00.000Z",
  completeCapture: true,
  ingredients: ["Aqua", "Glycerin", "Retinol"],
  reliableIngredientList: true,
  ...over,
});

describe("captured product-page shopper checks", () => {
  it("derives a pregnancy caution from anchored page language and a reliable ingredient list", () => {
    const checks = buildProductPageChecks(base());
    expect(checks.some((check) => check.code === "pregnancy-retinol" && check.kind === "caution")).toBe(true);
    expect(checks.find((check) => check.code === "pregnancy-retinol")?.sourceQuote).toContain("Pregnancy-safe");
  });

  it("does not treat a negated pregnancy claim as positive marketing", () => {
    const checks = buildProductPageChecks(base({ pageText: "This product is not pregnancy-safe. Ingredients: Aqua, Glycerin, Retinol." }));
    expect(checks.map((check) => check.code)).not.toContain("pregnancy-retinol");
  });

  it("requires a reliable source-backed ingredient list for ingredient cautions", () => {
    const checks = buildProductPageChecks(base({ reliableIngredientList: false }));
    expect(checks.map((check) => check.code)).not.toContain("pregnancy-retinol");
    expect(checks.map((check) => check.code)).not.toContain("retinol-pregnancy-warning");
  });

  it("checks baby restrictions only when the page states an under-36-month age range", () => {
    const under36 = buildProductPageChecks(base({ pageText: "Baby lotion for children 0 to 3 years. Ingredients: Aqua, Glycerin, Propylparaben.", pageTitle: "Baby Lotion", ingredients: ["Aqua", "Glycerin", "Propylparaben"] }));
    expect(under36.some((check) => check.code === "baby-age-ingredient" && check.kind === "caution")).toBe(true);
    const older = buildProductPageChecks(base({ pageText: "Baby lotion for children ages 4 and up. Ingredients: Aqua, Glycerin, Propylparaben.", pageTitle: "Baby Lotion", ingredients: ["Aqua", "Glycerin", "Propylparaben"] }));
    expect(older.map((check) => check.code)).not.toContain("baby-age-ingredient");
    const underThreeYears = buildProductPageChecks(base({ pageText: "Baby lotion for children under 3 years. Ingredients: Aqua, Glycerin, Retinol.", pageTitle: "Baby Lotion", ingredients: ["Aqua", "Glycerin", "Retinol"] }));
    expect(underThreeYears.some((check) => check.code === "baby-age-ingredient")).toBe(true);
  });

  it("does not turn missing page text into a warning when the capture was clipped", () => {
    const checks = buildProductPageChecks(base({ pageText: "Retinol serum", completeCapture: false }));
    expect(checks.map((check) => check.code)).not.toContain("retinol-pregnancy-warning");
  });

  it("adds a sun warning note only for an explicitly named leave-on AHA strength of at least 3%", () => {
    const check = buildProductPageChecks(base({
      pageTitle: "Glycolic Acid 7% Serum",
      productCategory: "Face serum",
      pageText: "Glycolic Acid 7% Serum. Ingredients: Aqua, Glycerin, Glycolic Acid.",
      ingredients: ["Aqua", "Glycerin", "Glycolic Acid"],
    }));
    expect(check.some((item) => item.code === "aha-sun-warning" && item.kind === "page-note")).toBe(true);
    const unknownStrength = buildProductPageChecks(base({ pageTitle: "Glycolic Acid Serum", pageText: "Glycolic Acid serum. Ingredients: Aqua, Glycerin, Glycolic Acid.", ingredients: ["Aqua", "Glycerin", "Glycolic Acid"] }));
    expect(unknownStrength.map((item) => item.code)).not.toContain("aha-sun-warning");
  });

  it("records missing sunscreen directions as a page note, not a verdict change", () => {
    const checks = buildProductPageChecks(base({ pageTitle: "Daily Sunscreen SPF 50", productCategory: "Sunscreen", pageText: "Daily Sunscreen SPF 50. Ingredients: Aqua, Glycerin, Zinc Oxide." }));
    expect(checks.find((item) => item.code === "sunscreen-reapplication")?.kind).toBe("page-note");
  });

  it("anchors each finding to the source URL and capture time", () => {
    const check = buildProductPageChecks(base()).find((item) => item.code === "pregnancy-retinol");
    expect(check).toMatchObject({ sourceUrl: "https://brand.example/products/serum", capturedAt: "2026-10-25T10:00:00.000Z" });
  });
});
