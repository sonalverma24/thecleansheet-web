import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { UnratedKind } from "@/lib/unrated-kind";
import UnratedNotice, { UNRATED_COPY } from "./UnratedNotice";
import { UnratedProductPage } from "./UnratedProductPage";

const NAME = "H2Glow Beauty Hydration Electrolyte Drink Mix";
const draw = (kind: UnratedKind, name = NAME) => renderToStaticMarkup(<UnratedNotice kind={kind} productName={name} brand="H2Glow" productSlug="h2glow-drink-mix" />);

describe("the popup for a nutraceutical", () => {
  const html = draw("nutraceutical");

  it("is a modal dialog that says we can't rate nutraceuticals yet", () => {
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain("We can&#x27;t rate nutraceuticals yet");
    expect(html).toContain(NAME);
  });

  it("asks for an email to write to when we can, with a labelled field and a button", () => {
    expect(html).toContain("Leave your email");
    expect(html).toMatch(/<label[^>]*class="sr-only">Your email<\/label>/);
    expect(html).toContain('type="email"');
    expect(html).toMatch(/autocomplete="email"/i);
    expect(html).toContain("Notify me");
  });

  it("can be closed", () => {
    expect(html).toContain('aria-label="Close"');
  });

  it("gives no rating, no verdict and no review", () => {
    for (const word of ["Good choice", "Buy with caution", "Look elsewhere", "Not enough info", "Analysed", "Rating", "Strong", "At a glance"]) expect(html, word).not.toContain(word);
  });
});

describe("the popup for a prescription drug", () => {
  const html = draw("prescription-drug", "Aziderm 20% Cream");

  it("says it is a prescription drug and that we do not rate it", () => {
    expect(html).toContain("This is a prescription drug");
    expect(html).toContain("Aziderm 20% Cream is a prescription medicine, not a cosmetic, so we don&#x27;t rate it");
  });

  it("has nothing to sign up for", () => {
    expect(html).not.toContain('type="email"');
    expect(html).not.toContain("Notify me");
    expect(UNRATED_COPY["prescription-drug"].ask).toBeUndefined();
  });
});

describe("the popup for a drug that is not marked as prescription", () => {
  const html = draw("drug", "Daily Shield SPF 30");

  it("says it is a drug, not a cosmetic, and never says prescription", () => {
    expect(html).toContain("This is a drug, not a cosmetic");
    expect(html).toContain("Daily Shield SPF 30 is sold as a drug, not a cosmetic, so we don&#x27;t rate it");
    expect(html).not.toMatch(/prescription/i);
  });

  it("has nothing to sign up for", () => {
    expect(html).not.toContain('type="email"');
    expect(UNRATED_COPY.drug.ask).toBeUndefined();
  });
});

describe("the page of a product we do not rate", () => {
  const html = renderToStaticMarkup(<UnratedProductPage slug="h2glow-drink-mix" kind="nutraceutical" productName={NAME} brand="H2Glow" category="Oral Supplement / Beauty Drink Mix" image={null} />);

  it("shows who the product is and the popup, and nothing of a review", () => {
    expect(html).toContain(`<h1`);
    expect(html).toContain(NAME);
    expect(html).toContain("Oral Supplement / Beauty Drink Mix");
    expect(html).toContain("We can&#x27;t rate nutraceuticals yet");
    for (const word of ["THE CLEAN SHEET RATING", "At a glance", "Who it suits", "Who should be careful", "Where to buy", "Ingredients", "Regulatory check"]) expect(html, word).not.toContain(word);
  });

  it("links back to the products we have analysed", () => {
    expect(html).toContain('href="/products"');
  });
});
