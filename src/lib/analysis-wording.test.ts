import { describe, expect, it } from "vitest";
import { analysisWording } from "./analysis-wording";

describe("analysisWording", () => {
  it("rewrites the stored boilerplate note", () => {
    expect(analysisWording("This review evaluates brand claims against visible evidence and formula logic.")).toBe(
      "This analysis evaluates brand claims against visible evidence and formula logic.",
    );
    expect(analysisWording("This is a web evidence review, not a Clean Sheet certification.")).toBe(
      "This is a web evidence analysis, not a Clean Sheet certification.",
    );
  });

  it("fixes the article in front of the new word", () => {
    expect(analysisWording("It is a review of the formula.")).toBe("It is an analysis of the formula.");
    expect(analysisWording("A review of the formula.")).toBe("An analysis of the formula.");
  });

  it("handles other forms and keeps capitals", () => {
    expect(analysisWording("Reviews are stored. Reviewed products. Reviewing claims. Review first.")).toBe(
      "Analyses are stored. Analysed products. Analysing claims. Analysis first.",
    );
    expect(analysisWording("Request a re-review.")).toBe("Request a re-analysis.");
  });

  it("leaves peer-reviewed and other compounds alone", () => {
    expect(analysisWording("Based on peer-reviewed studies.")).toBe("Based on peer-reviewed studies.");
  });

  it("leaves text without the word untouched", () => {
    expect(analysisWording("Nothing to change here.")).toBe("Nothing to change here.");
  });
});
