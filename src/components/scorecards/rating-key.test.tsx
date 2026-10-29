import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SAMPLE_EXAMPLE_MEDICINAL, SAMPLE_EXAMPLE_MINERAL_SUNSCREEN, SAMPLE_EXAMPLE_PROHIBITED, SAMPLE_EXAMPLE_SUNSCREEN, SAMPLE_MINIMALIST_B5 } from "@/data/analysis/sample-reviews";
import { deriveVerdict } from "@/lib/product-review-engine";
import { pillsFor } from "@/lib/pills-for-review";
import type { ProductReview } from "@/lib/product-review-types";
import { PillsPage } from "@/components/scorecards/PillsPage";
import { RatingKey } from "@/components/scorecards/RatingKey";
import { MARKER_COLOURS, NEUTRAL_COLOURS, RATING_KEY, RATING_KEY_FOOTNOTE, ratingKeyOf } from "@/components/scorecards/pill-palette";

/** How React writes an apostrophe into markup. */
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

const FIXTURES: [string, ProductReview][] = [
  ["clean moisturiser", SAMPLE_MINIMALIST_B5], ["adverse sunscreen", SAMPLE_EXAMPLE_SUNSCREEN], ["mineral sunscreen", SAMPLE_EXAMPLE_MINERAL_SUNSCREEN],
  ["prohibited ingredient", SAMPLE_EXAMPLE_PROHIBITED], ["medicinal shampoo", SAMPLE_EXAMPLE_MEDICINAL],
];
const draw = (review: ProductReview) => {
  const built = pillsFor(review, deriveVerdict(review));
  return { built, html: renderToStaticMarkup(<PillsPage product={built.product} brand={built.brand} model={built.model} />) };
};

describe("the owner's four-rating key", () => {
  it("is Green, Yellow, Red and Grey, in the owner's words", () => {
    expect(RATING_KEY.map((r) => [r.name, r.meaning])).toEqual([
      ["Green", "Meets our standards with no major concerns."],
      ["Yellow", "Some concerns found. Review findings before purchase."],
      ["Red", "Major concerns identified. Not recommended."],
      ["Grey", "Not rated. We haven’t assigned a rating yet."],
    ]);
    expect(RATING_KEY_FOOTNOTE).toBe("Grey means we haven’t assigned a rating. It does not mean the product is unsafe.");
  });

  it("grey is the absence of a marker, not a fourth colour", () => {
    expect(RATING_KEY.map((r) => r.marker)).toEqual(["green", "yellow", "red", null]);
    expect(ratingKeyOf(null).name).toBe("Grey");
  });

  it("the card prints all four tiles, the footnote and the link, with each circle in the palette's own colour", () => {
    const html = renderToStaticMarkup(<RatingKey />);
    expect(html).toContain("The Clean Sheet Rating");
    expect(html).toContain("Understand what each product rating means.");
    for (const r of RATING_KEY) {
      expect(html, r.name).toContain(`>${r.name}</h3>`);
      expect(html, r.name).toContain(esc(r.meaning));
      const c = r.marker ? MARKER_COLOURS[r.marker] : NEUTRAL_COLOURS;
      expect(html, `${r.name} circle`).toContain(`data-marker="${r.marker ?? "none"}"`);
      expect(html, `${r.name} circle`).toContain(`background:${c.ring}`);
    }
    expect(html).toContain(esc(RATING_KEY_FOOTNOTE));
    expect(html).toMatch(/href="\/standard"[^>]*>Want to read about our standard\?/);
    expect(html).not.toContain("How our ratings work");
  });

  it("each tile's circle is decorative: the name beside it is what a screen reader reads, so the colour is not read twice", () => {
    const html = renderToStaticMarkup(<RatingKey />);
    expect(html).not.toContain('aria-label="Rating:');
    expect(html.match(/aria-hidden="true" data-marker=/g)?.length).toBe(4);
  });

  it("is set very small: small print, two by two on a phone, nothing larger than a 14px heading", () => {
    const html = renderToStaticMarkup(<RatingKey />);
    expect(html).toContain("grid-cols-2");
    const sizes = [...html.matchAll(/text-\[(\d+(?:\.\d+)?)px\]/g)].map((m) => Number(m[1]));
    expect(sizes.length).toBeGreaterThan(5);
    expect(Math.max(...sizes)).toBeLessThanOrEqual(14);
    expect(html).not.toMatch(/sm:text-\[(?:1[5-9]|[2-9]\d)px\]/);
  });
});

describe.each(FIXTURES)("the product page, %s", (_name, review) => {
  const { built, html } = draw(review);
  const marker = built.model.pill.marker;
  const rating = ratingKeyOf(marker);
  const take = html.slice(html.indexOf('aria-label="The Clean Sheet rating"'), html.indexOf('id="at-a-glance"') > 0 ? html.indexOf('id="at-a-glance"') : html.indexOf('id="fit"'));

  it("the take card names its colour and says what the colour means, in the key's own words", () => {
    expect(take).toContain(`>${rating.name}</span>`);
    expect(take).toContain(esc(rating.meaning));
    for (const other of RATING_KEY.filter((r) => r.key !== rating.key)) expect(take, `${other.name} is not this product's rating`).not.toContain(`>${other.name}</span>`);
  });

  it("the circle is read once, as the colour, and the printed name is hidden from a screen reader", () => {
    expect(take).toContain(`aria-label="Rating: ${marker ?? "grey"}"`);
    expect(take).toContain(`<span aria-hidden="true" class="cs-verdict__name">${rating.name}</span>`);
  });

  it("the page carries the key once, at the very end: after the last section and just above the closing note", () => {
    expect(html.split('id="rating-key"').length - 1).toBe(1);
    const at = (needle: string) => html.indexOf(needle);
    const key = at('id="rating-key"');
    expect(key).toBeGreaterThan(at('aria-label="The Clean Sheet rating"'));
    for (const id of ["claim-check", "regulatory-check", "ingredients", "gaps", "faq"]) if (at(`id="${id}"`) > 0) expect(key, id).toBeGreaterThan(at(`id="${id}"`));
    expect(key).toBeLessThan(at("<footer"));
  });
});
