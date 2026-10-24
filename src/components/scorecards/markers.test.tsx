/* The three colour markers: every rating and badge on the page is green, yellow or red, the colours in the stylesheet are the palette's, and the old
   rating scale (five tones, letter grades) is gone. */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SAMPLE_EXAMPLE_MEDICINAL, SAMPLE_EXAMPLE_MINERAL_SUNSCREEN, SAMPLE_EXAMPLE_PROHIBITED, SAMPLE_EXAMPLE_SUNSCREEN, SAMPLE_MINIMALIST_B5 } from "@/data/analysis/sample-reviews";
import { deriveVerdict } from "@/lib/product-review-engine";
import { pillsFor } from "@/lib/pills-for-review";
import { PillsPage } from "@/components/scorecards/PillsPage";
import { MARKER_COLOURS, MARKER_OF_PILL, MARKER_WORD, NEUTRAL_COLOURS, PILL_COLOURS, type MarkerName, type PillToneName } from "@/components/scorecards/pill-palette";

vi.mock("./HeroActions", () => ({ HeroActions: ({ productId }: { productId: string }) => <div data-hero-actions={productId} /> }));

const css = (name: string) => readFileSync(fileURLToPath(new URL(name, import.meta.url)), "utf8");
const MARKERS: MarkerName[] = ["green", "yellow", "red"];
const FIXTURES = [SAMPLE_MINIMALIST_B5, SAMPLE_EXAMPLE_SUNSCREEN, SAMPLE_EXAMPLE_MINERAL_SUNSCREEN, SAMPLE_EXAMPLE_PROHIBITED, SAMPLE_EXAMPLE_MEDICINAL];
const htmlOf = (review: (typeof FIXTURES)[number]) => {
  const built = pillsFor(review, deriveVerdict(review));
  return { built, html: renderToStaticMarkup(<PillsPage product={built.product} brand={built.brand} model={built.model} />) };
};

describe("the three colour markers", () => {
  it("there are exactly three markers; three pills wear one and the two that give no verdict are plain grey", () => {
    expect(Object.keys(MARKER_COLOURS).sort()).toEqual(["green", "red", "yellow"]);
    const pills: PillToneName[] = ["good", "caution", "look", "info", "med"];
    expect(MARKER_OF_PILL).toEqual({ good: "green", caution: "yellow", look: "red", info: null, med: null });
    for (const p of pills) {
      const m = MARKER_OF_PILL[p];
      expect(PILL_COLOURS[p]).toBe(m ? MARKER_COLOURS[m] : NEUTRAL_COLOURS);
    }
    // Grey is not one of the three: no marker colour is the grey.
    for (const m of MARKERS) expect(MARKER_COLOURS[m].ring).not.toBe(NEUTRAL_COLOURS.ring);
  });

  it("the three are told apart by their words as well as their colour", () => {
    expect(MARKERS.map((m) => MARKER_WORD[m])).toEqual(["Strong", "Fair", "Concern"]);
  });

  it("the small markers in pills-page.css use the palette's own colours", () => {
    const sheet = css("./pills-page.css");
    const rate = (m: string) => sheet.match(new RegExp(`\\.pp-rate\\[data-marker="${m}"\\]\\s*\\{([^}]*)\\}`))?.[1] ?? "";
    for (const m of MARKERS) {
      const c = MARKER_COLOURS[m];
      const rule = rate(m);
      expect(rule, `${m} rating`).toContain(`color: ${c.ink}`);
      expect(rule, `${m} rating`).toContain(`background: ${c.soft}`);
      expect(rule, `${m} rating`).toContain(`border-color: ${c.line}`);
    }
    expect(sheet).toContain(`.pp-seg[data-k="y"] { background: ${MARKER_COLOURS.green.ring}; }`);
    expect(sheet).toContain(`.pp-chip[data-tone="ok"] .pp-chip__ic { background: ${MARKER_COLOURS.green.ring}; }`);
  });

  it("the old five-tone rating scale is gone from the stylesheet", () => {
    const sheet = css("./pills-page.css");
    for (const old of ["excellent", "strong", "good", "fair", "concern"]) expect(sheet).not.toContain(`data-tone="${old}"`);
  });

  for (const review of FIXTURES) {
    it(`${review.productName}: the take, every detail row and every claim wear a marker, and no verdict word, letter grade or old rating word is shown`, () => {
      const { built, html } = htmlOf(review);
      expect(built.model.pill.marker).toBe(MARKER_OF_PILL[built.model.pill.tone]);
      expect(html).toContain(`data-marker="${built.model.pill.marker ?? "none"}"`);
      for (const d of built.model.details ?? []) {
        expect(d.rating.marker === null || MARKERS.includes(d.rating.marker), `${d.title}`).toBe(true);
        expect(["Strong", "Fair", "Concern", "Not rated"]).toContain(d.rating.word);
      }
      for (const word of ["Good choice", "Buy with caution", "Look elsewhere", "Not enough info", "Medicinal product", "Confidence:"]) expect(html, `${word} is not drawn`).not.toContain(word);
      expect(html).not.toMatch(/Grade [A-F]\b/);
      expect(html).not.toMatch(/class="pp-rate"[^>]*>(Excellent|Good)</);
      expect(html).not.toMatch(/data-tone="(excellent|strong|good|fair|concern)"/);
    });
  }

  it("Not rated is the absence of a marker, never a fourth colour", () => {
    const { html } = htmlOf(SAMPLE_EXAMPLE_PROHIBITED);
    expect(html).not.toMatch(/data-marker="(?!green|yellow|red|none)[a-z]+"/);
  });

  it("the footer names a rule once, however many ingredients fire it", () => {
    const built = pillsFor(SAMPLE_EXAMPLE_SUNSCREEN, deriveVerdict(SAMPLE_EXAMPLE_SUNSCREEN));
    const dup = { ruleId: "caution.soft_adverse", kind: "caution", text: "x" };
    const model = { ...built.model, mode: "pills" as const, decision: { ...built.model.decision, reasons: [dup, dup, dup] } };
    const errors: unknown[][] = [];
    const spy = vi.spyOn(console, "error").mockImplementation((...a) => { errors.push(a); });
    const html = renderToStaticMarkup(<PillsPage product={built.product} brand={built.brand} model={model} />);
    spy.mockRestore();
    expect(html.match(/<code[^>]*>caution\.soft_adverse<\/code>/g)).toHaveLength(1);
    expect(errors.filter((e) => String(e[0]).includes("same key"))).toEqual([]);
  });
});
