import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ProductScorecard } from "@/data/brands/types";
import { MARKER_COLOURS, NEUTRAL_COLOURS } from "@/components/scorecards/pill-palette";
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
const PILLED: ProductScorecard = { ...BASE, pill: { key: "buy-with-caution", marker: "yellow" }, glance: GLANCE };
const draw = (p: ProductScorecard) => renderToStaticMarkup(<MarketCard product={p} comparing={false} compareBlock={null} onCompare={() => {}} />);
/** The classes of the summary paragraph (the product name above it is clamped too, so look at this one only). */
const summaryClasses = (html: string) => html.match(/<p class="(hidden md:block[^"]*)"/)![1];
/** The rating circle of a card: its colour name, its background, and nothing else (no text, no label). */
const dot = (html: string) => {
  const m = html.match(/<span role="img" aria-label="Rating: ([a-z]+)" data-marker="([a-z]+)" class="[^"]*" style="([^"]*)"><\/span>/)!;
  return { name: m[1], marker: m[2], style: m[3] };
};

describe("a listing card with the pills page on", () => {
  const html = draw(PILLED);

  it("shows a rating circle in place of the standing: its colour, and no words", () => {
    const d = dot(html);
    expect(d.name).toBe("yellow");
    expect(d.style).toContain(`background:${MARKER_COLOURS.yellow.ring}`);
    for (const word of ["Good Standing", "Room to Improve", "Not Recommended", "Licensed Drug", "Buy with caution", "Good choice", "Look elsewhere", "Not enough info", "Medicinal product"]) expect(html, word).not.toContain(word);
  });

  it("is the same circle, the same size, as a card of today's standing", () => {
    expect(dot(html).style.replace(/background:[^;]*;?/, "").replace(/box-shadow:[^;]*;?/, "")).toBe(dot(draw(BASE)).style.replace(/background:[^;]*;?/, "").replace(/box-shadow:[^;]*;?/, ""));
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
    expect(cardGlanceText("No pregnancy flags found")).toBe("No pregnancy flags found");
    expect(cardGlanceText("Pregnancy ingredient flag: Retinol")).toBe("Pregnancy ingredient flag");
    expect(cardGlanceText("Pregnancy ingredient flags: Homosalate and Benzophenone-3")).toBe("Pregnancy ingredient flags");
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
  it("keeps the standing as a circle, has no ticks row and keeps the three-line summary", () => {
    const html = draw(BASE);
    expect(dot(html).name).toBe("green");
    expect(html).not.toContain("Good Standing");
    expect(html).not.toContain('aria-label="At a glance"');
    expect(summaryClasses(html)).toContain("line-clamp-3");
    expect(summaryClasses(html)).not.toContain("line-clamp-2");
  });

  it("a pill with no ticks shows the pill and no empty row", () => {
    const html = draw({ ...PILLED, glance: [] });
    expect(dot(html).name).toBe("yellow");
    expect(html).not.toContain('aria-label="At a glance"');
    expect(summaryClasses(html)).toContain("line-clamp-3");
  });

  it("ticks on a product with no pill are ignored: the pill decides whether the card is a pills card", () => {
    const html = draw({ ...BASE, glance: GLANCE });
    expect(dot(html).name).toBe("green");
    expect(html).not.toContain('aria-label="At a glance"');
  });
});

describe("each rating", () => {
  it.each([["green", "green"], ["yellow", "yellow"], ["red", "red"], [null, "grey"]] as const)(
    "%s: a circle named %s, in the palette's colour, with no words and no old standing",
    (marker, name) => {
      const html = draw({ ...BASE, pill: { key: "x", marker }, glance: [] });
      const d = dot(html);
      expect(d.name).toBe(name);
      expect(d.style).toContain(`background:${(marker ? MARKER_COLOURS[marker] : NEUTRAL_COLOURS).ring}`);
      for (const old of ["Good Standing", "Room to Improve", "Not Recommended", "Licensed Drug"]) expect(html, old).not.toContain(old);
    },
  );

  it("a catalogue product's standing is a circle too: Room to Improve yellow, Not Recommended red, a Licensed Drug grey", () => {
    expect(dot(draw({ ...BASE, reviewTier: "can-do-better" })).name).toBe("yellow");
    expect(dot(draw({ ...BASE, reviewTier: "not-recommended" })).name).toBe("red");
    expect(dot(draw({ ...BASE, reviewTier: "not-assessed" })).name).toBe("grey");
  });
});
