import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ProductScorecard } from "@/data/brands/types";
import { PILL_COLOURS } from "@/components/scorecards/pill-palette";
import MarketCard, { cardGlanceText } from "./MarketCard";

const BASE = {
  productName: "Fluid SPF 50", slug: "fluid-spf-50", brand: "Example Co", brandSlug: "example-co", priceRange: "", concern: "", summary: "A one-line takeaway from the analysis.",
  score: 70, scoreLabel: "Good", image: "", pillars: [], keyActives: [], ingredients: [], pass_badges: [], warn_badges: [], info_badges: [], indiaContext: "",
  analyzedAt: "2026-10-20", category: "Sunscreen", productType: "sunscreen", freshReview: true, reviewTier: "mostly-clean", price: 649,
} as ProductScorecard;
const GLANCE: NonNullable<ProductScorecard["glance"]> = [
  { label: "Pregnancy caution: Homosalate and Benzophenone-3", state: "no" }, { label: "Paraben free", state: "yes" }, { label: "Dermatologist tested", state: "yes" },
  { label: "Fragrance free", state: "no" }, { label: "Alcohol free", state: "unknown" },
];
const PILLED: ProductScorecard = { ...BASE, pill: { key: "buy-with-caution", label: "Buy with caution", tone: "caution" }, glance: GLANCE };
const draw = (p: ProductScorecard) => renderToStaticMarkup(<MarketCard product={p} comparing={false} compareFull={false} onCompare={() => {}} />);
/** The classes of the summary paragraph (the product name above it is clamped too, so look at this one only). */
const summaryClasses = (html: string) => html.match(/<p class="(hidden md:block[^"]*)"/)![1];
const badge = (html: string) => html.match(/<span class="(self-start[^"]*rounded-full[^"]*)" style="([^"]*)">([^<]*)<\/span>/)!;

describe("a listing card with the pills page on", () => {
  const html = draw(PILLED);

  it("shows the pill in place of the standing, in the pill's own colours", () => {
    const [, , style, text] = badge(html);
    expect(text).toBe("Buy with caution");
    expect(html).not.toContain("Good Standing");
    const c = PILL_COLOURS.caution;
    expect(style).toContain(`background:${c.soft}`);
    expect(style).toContain(`color:${c.ink}`);
    expect(style).toContain(`border-color:${c.line}`);
  });

  it("keeps the badge's shape and size: the very same classes as today's card", () => {
    expect(badge(html)[1]).toBe(badge(draw(BASE))[1]);
  });

  it("keeps the card's own frame, the image box and the price row exactly as today's", () => {
    const frame = (s: string) => [s.match(/<article class="([^"]*)"/)![1], s.match(/<div class="relative aspect-square[^"]*"/)![0], s.match(/<div class="mt-auto[^"]*"/)![0]];
    expect(frame(html)).toEqual(frame(draw(BASE)));
  });

  it("lists the ticks in the page's order, each read out with its answer", () => {
    const list = html.slice(html.indexOf('aria-label="At a glance"'), html.indexOf("</ul>", html.indexOf('aria-label="At a glance"')));
    let at = -1;
    for (const label of ["Pregnancy caution", "Paraben free", "Dermatologist tested", "Fragrance free", "Alcohol free"]) {
      const i = list.indexOf(`>${label}<`, at + 1);
      expect(i, label).toBeGreaterThan(at);
      at = i;
    }
    expect(list).toContain("(yes)");
    expect(list).toContain("(no)");
    expect(list).toContain("(not known)");
  });

  it("shortens only the long pregnancy line, and keeps its full words as the tooltip", () => {
    expect(html).toContain(">Pregnancy caution<");
    expect(html).not.toContain(">Pregnancy caution: Homosalate");
    expect(html).toContain('title="Pregnancy caution: Homosalate and Benzophenone-3"');
    expect(cardGlanceText("Pregnancy: not fully checked")).toBe("Pregnancy: not fully checked");
    expect(cardGlanceText("No pregnancy-caution ingredients")).toBe("No pregnancy-caution ingredients");
    expect(cardGlanceText("Pregnancy caution: Formaldehyde")).toBe("Pregnancy caution");
  });

  it("holds the ticks to one line on a phone and two on a larger screen, so the card keeps its size however many a product has", () => {
    expect(html).toMatch(/<ul aria-label="At a glance" class="[^"]*overflow-hidden h-\[22px\] md:h-\[48px\]"/);
    expect(html).toMatch(/h-\[22px\] max-w-full/); // a chip is one line tall, so a second line is cut off whole
  });

  it("trims the summary to two lines to make room", () => {
    expect(summaryClasses(html)).toContain("line-clamp-2");
    expect(summaryClasses(html)).not.toContain("line-clamp-3");
  });
});

describe("a listing card without a pill is exactly today's", () => {
  it("keeps the standing, has no ticks row and keeps the three-line summary", () => {
    const html = draw(BASE);
    expect(badge(html)[3]).toBe("Good Standing");
    expect(html).not.toContain('aria-label="At a glance"');
    expect(summaryClasses(html)).toContain("line-clamp-3");
    expect(summaryClasses(html)).not.toContain("line-clamp-2");
  });

  it("a pill with no ticks shows the pill and no empty row", () => {
    const html = draw({ ...PILLED, glance: [] });
    expect(badge(html)[3]).toBe("Buy with caution");
    expect(html).not.toContain('aria-label="At a glance"');
    expect(summaryClasses(html)).toContain("line-clamp-3");
  });

  it("ticks on a product with no pill are ignored: the pill decides whether the card is a pills card", () => {
    const html = draw({ ...BASE, glance: GLANCE });
    expect(badge(html)[3]).toBe("Good Standing");
    expect(html).not.toContain('aria-label="At a glance"');
  });
});

describe("each of the five pills", () => {
  it.each([["good", "Good choice"], ["caution", "Buy with caution"], ["look", "Look elsewhere"], ["info", "Not enough info"], ["med", "Medicinal product"]] as const)(
    "%s: its words in its colours, and no old standing",
    (tone, label) => {
      const html = draw({ ...BASE, pill: { key: label, label, tone }, glance: [] });
      const [, , style, text] = badge(html);
      expect(text).toBe(label);
      expect(style).toContain(`color:${PILL_COLOURS[tone].ink}`);
      for (const old of ["Good Standing", "Room to Improve", "Not Recommended", "Licensed Drug"]) expect(html, old).not.toContain(old);
    },
  );
});
