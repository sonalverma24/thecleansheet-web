import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SAMPLE_EXAMPLE_MEDICINAL, SAMPLE_EXAMPLE_MINERAL_SUNSCREEN, SAMPLE_EXAMPLE_PROHIBITED, SAMPLE_EXAMPLE_SUNSCREEN, SAMPLE_MINIMALIST_B5 } from "@/data/analysis/sample-reviews";
import { deriveVerdict } from "@/lib/product-review-engine";
import { layoutFor, pillsFor, standingViewOf } from "@/lib/pills-for-review";
import { TIER_STYLES } from "@/components/scorecards/pillar-ui";
import { PillsPage } from "@/components/scorecards/PillsPage";
import { PILL } from "@/components/scorecards/pills-ui";
import type { ProductReview } from "@/lib/product-review-types";

/* ANALYSER_NEW_LAYOUT: the new page, with today's standing in the take card. Nothing about what the page decides may change. */

const NEW_PILLS = ["Good choice", "Buy with caution", "Look elsewhere", "Not enough info", "Medicinal product"];
const FIXTURES: [string, ProductReview][] = [
  ["clean moisturiser", SAMPLE_MINIMALIST_B5], ["adverse sunscreen", SAMPLE_EXAMPLE_SUNSCREEN], ["mineral sunscreen", SAMPLE_EXAMPLE_MINERAL_SUNSCREEN],
  ["prohibited ingredient", SAMPLE_EXAMPLE_PROHIBITED], ["medicinal shampoo", SAMPLE_EXAMPLE_MEDICINAL],
];
const draw = (v: ReturnType<typeof pillsFor>) => renderToStaticMarkup(<PillsPage product={v.product} brand={v.brand} model={v.model} />);
const take = (html: string) => html.slice(html.indexOf('aria-label="The Clean Sheet take"'), html.indexOf('id="at-a-glance"'));

describe("the standing as the take card shows it", () => {
  it.each([
    ["approved", "Good Standing", "good", false], ["mostly-clean", "Good Standing", "good", false], ["can-do-better", "Room to Improve", "caution", false],
    ["not-recommended", "Not Recommended", "look", false], ["not-assessed", "Licensed Drug", "med", true],
  ] as const)("%s reads %s, in the %s colours", (tier, label, tone, medicine) => {
    expect(standingViewOf(tier)).toEqual({ label, tone, medicine });
    expect(label).toBe(TIER_STYLES[tier].label);
  });
});

describe.each(FIXTURES)("the new layout with today's standing, %s", (_name, review) => {
  const verdict = deriveVerdict(review);
  const layout = layoutFor(review, verdict);
  const pills = pillsFor(review, verdict);
  const html = draw(layout);
  const standing = TIER_STYLES[verdict.tier].label;

  it("the take card shows today's standing, and none of the five pills", () => {
    expect(layout.model.mode).toBe("standing");
    expect(take(html)).toContain(standing);
    for (const p of NEW_PILLS) expect(take(html), p).not.toContain(p);
    expect(layout.model.pill.label).toBe(standing);
  });

  it("says nothing about confidence: no meter, no words, a whole ring in the standing's own colour", () => {
    expect(html).not.toContain("Confidence");
    expect(html).not.toContain("cs-conf");
    const ring = PILL[layout.model.pill.tone].ring;
    expect(take(html).match(/<circle [^>]*r="35"/g)?.length).toBe(3);
    expect(take(html).split(`stroke="${ring}"`).length - 1, "every arc filled").toBe(3);
  });

  it("names no rule of the decision core: the standing is not theirs", () => {
    const footer = html.slice(html.indexOf("<footer"));
    expect(footer).toContain("quote this page&#x27;s address");
    expect(footer).not.toMatch(/\b(block|gap|caution|support|med|note)\.[a-z_]+/);
  });

  it("changes nothing else: every block below the take is the pills page's own", () => {
    const body = (h: string) => h.slice(h.indexOf('id="claim-check"'), h.indexOf("<footer"));
    expect(body(html)).toBe(body(draw(pills)));
    expect(layout.model.decision).toEqual(pills.model.decision);
    expect(layout.model.highlights).toEqual(pills.model.highlights);
    expect(layout.model.buyLinks).toEqual(pills.model.buyLinks);
  });
});

describe("a stored Licensed Drug", () => {
  // The old page does not score a medicine. Whatever the decision core says, the layout-only page treats a stored Licensed Drug as one.
  const verdict = { ...deriveVerdict(SAMPLE_MINIMALIST_B5), tier: "not-assessed" as const };
  const v = layoutFor(SAMPLE_MINIMALIST_B5, verdict);
  const html = draw(v);

  it("shows Licensed Drug and hides what only makes sense for a cosmetic", () => {
    expect(take(html)).toContain("Licensed Drug");
    expect(v.model.details).toBeNull();
    expect(v.model.cheatCode).toBeNull();
    expect(v.model.howToUse).toBeNull();
    expect(v.model.regulatoryCheck.panel).toBeNull();
    expect(v.model.regulatoryCheck.oneLiner).toBe("Assessed as a medicine, so the cosmetic ingredient rules do not apply.");
    expect(html).not.toContain('id="details"');
    expect(html).not.toContain('id="cheat-code"');
    expect(html).not.toContain('id="how-to-use"');
    expect(v.model.faq.some((f) => f.q === "Can I use it during pregnancy?")).toBe(false);
  });

  it("a cosmetic with the very same review keeps all of them", () => {
    const cosmetic = layoutFor(SAMPLE_MINIMALIST_B5, deriveVerdict(SAMPLE_MINIMALIST_B5));
    expect(cosmetic.model.details).not.toBeNull();
    expect(cosmetic.model.faq.some((f) => f.q === "Can I use it during pregnancy?")).toBe(true);
  });
});

describe("the pills page itself is unchanged by the new mode", () => {
  it.each(FIXTURES)("%s: the pill and its confidence are the decision core's, and the footer names its rules", (_n, review) => {
    const v = pillsFor(review, deriveVerdict(review));
    const html = draw(v);
    expect(v.model.mode).toBe("pills");
    expect(take(html)).toContain(v.model.pill.label);
    expect(html).toContain(`Confidence: ${v.model.take.confidence.label}`);
    for (const old of ["Good Standing", "Room to Improve", "Not Recommended", "Licensed Drug"]) expect(html, old).not.toContain(old);
  });
});
