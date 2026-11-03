import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { lint, MESSAGES } from "@/lib/analyser-x/copy";
import ReviewRunStatus from "./ReviewRunStatus";
import type { ReviewRunnerState } from "./useReviewRunner";

/* What the shopper sees when the search was a brand or a kind of product (see src/lib/specific-product.ts): a question, the way to answer it,
   and the analysed products of that brand when there are any. Never an error, never an analysis, and never the word "review" for our own work. */
const draw = (state: ReviewRunnerState, tone: "light" | "dark" = "light") => renderToStaticMarkup(<ReviewRunStatus state={state} onPick={() => undefined} tone={tone} />);
const SUGGESTIONS = [
  { name: "Dot & Key Strawberry Dew Brightening Moisturizer", slug: "dot-key-dot-key-strawberry-dew-brightening-moisturizer" },
  { name: "Dot & Key Watermelon Cooling Sunscreen", slug: "dot-key-watermelon-cooling-sunscreen" },
];

describe("the question for a brand alone", () => {
  const html = draw({ phase: "needs-product", query: "Dot and key", brand: "Dot & Key", suggestions: SUGGESTIONS });

  it("asks which of the brand's products is meant, and says how to answer", () => {
    expect(html).toContain("Which Dot &amp; Key product do you mean?");
    expect(html).toContain("Paste its name or link.");
  });

  it("offers each analysed product as a link to its own analysis page", () => {
    expect(html).toContain("Or open one of the Dot &amp; Key products we have already analysed:");
    for (const p of SUGGESTIONS) {
      expect(html).toContain(`href="/analysis/${p.slug}"`);
      expect(html).toContain(p.name.replace("&", "&amp;"));
    }
  });

  it("is announced politely and is not an alert", () => {
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain('role="alert"');
  });
});

describe("the question for a kind of product, or a brand with nothing analysed", () => {
  it("asks which product, naming no brand, and offers nothing to open", () => {
    const html = draw({ phase: "needs-product", query: "Sunscreen", brand: null, suggestions: [] });
    expect(html).toContain("Which product do you mean?");
    expect(html).toContain("Paste its name, with the brand, or its link.");
    expect(html).not.toContain("already analysed");
    expect(html).not.toContain("href=");
  });

  it("names the brand but offers nothing when it has no analysed product", () => {
    const html = draw({ phase: "needs-product", query: "CeraVe", brand: "CeraVe", suggestions: [] });
    expect(html).toContain("Which CeraVe product do you mean?");
    expect(html).not.toContain("already analysed");
  });
});

describe("the words", () => {
  const spoken = [MESSAGES.needsProduct("Cetaphil"), MESSAGES.needsProduct(null), MESSAGES.needsProductHint("Cetaphil"), MESSAGES.needsProductHint(null), MESSAGES.needsProductPick("Cetaphil"), MESSAGES.needsProductPick(null)];

  it("pass the shopper-copy lint", () => {
    for (const text of spoken) expect(lint(text), text).toEqual({ ok: true, problems: [] });
  });

  it('say "analyse" and never "review" for our own work, in any tone', () => {
    for (const text of [...spoken, draw({ phase: "needs-product", query: "x", brand: "Plum", suggestions: SUGGESTIONS }, "dark")]) expect(text, text).not.toMatch(/\breview/i);
  });

  it("are the owner's words for the question", () => {
    expect(`${MESSAGES.needsProduct("Cetaphil")} ${MESSAGES.needsProductHint("Cetaphil")}`).toBe("Which Cetaphil product do you mean? Paste its name or link.");
  });
});
