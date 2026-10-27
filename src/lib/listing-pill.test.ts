import { afterEach, describe, expect, it, vi } from "vitest";
import { SAMPLE_EXAMPLE_MEDICINAL, SAMPLE_EXAMPLE_MINERAL_SUNSCREEN, SAMPLE_EXAMPLE_PROHIBITED, SAMPLE_EXAMPLE_SUNSCREEN, SAMPLE_MINIMALIST_B5 } from "@/data/analysis/sample-reviews";
import { ANALYSER_FLAGS } from "@/lib/analyser-flags";
import { listingPill } from "@/lib/listing-pill";
import { GLANCE_MAX } from "@/lib/pills-page";
import { pillsFor } from "@/lib/pills-for-review";
import { deriveVerdict } from "@/lib/product-review-engine";
import type { ProductReview } from "@/lib/product-review-types";

const FIXTURES: [string, ProductReview][] = [
  ["clean moisturiser", SAMPLE_MINIMALIST_B5], ["adverse sunscreen", SAMPLE_EXAMPLE_SUNSCREEN], ["mineral sunscreen", SAMPLE_EXAMPLE_MINERAL_SUNSCREEN],
  ["prohibited ingredient", SAMPLE_EXAMPLE_PROHIBITED], ["medicinal shampoo", SAMPLE_EXAMPLE_MEDICINAL],
];

describe.each(FIXTURES)("the card's pill and ticks, %s", (_name, review) => {
  const verdict = deriveVerdict(review);
  const { model } = pillsFor(review, verdict);
  const card = listingPill(review, verdict)!;

  it("are the page's own: the same pill, the same ticks, in the same order", () => {
    expect(card.pill).toEqual({ key: model.pill.key, marker: model.pill.marker });
    expect(card.glance).toEqual(model.highlights.map((h) => ({ label: h.label, state: h.state })));
    // Only checks we can stand behind, at most five; a product whose list is not source-backed has none, and its card shows the pill alone.
    expect(card.glance!.length).toBeLessThanOrEqual(GLANCE_MAX);
    for (const g of card.glance!) expect(g.state, g.label).not.toBe("unknown");
  });

  it("carry no verdict word at all: a card gets a colour, never a label", () => {
    for (const word of ["Good choice", "Buy with caution", "Look elsewhere", "Not enough info", "Medicinal product"]) expect(JSON.stringify(card)).not.toContain(word);
  });

  it("never carry an old standing, and carry no explainer line", () => {
    for (const old of ["Good Standing", "Room to Improve", "Not Recommended", "Licensed Drug"]) expect(JSON.stringify(card)).not.toContain(old);
    for (const g of card.glance!) expect(Object.keys(g).sort()).toEqual(["label", "state"]);
  });
});

describe("a review that cannot be read", () => {
  it("gives no pill rather than throwing, so a card is never dropped for it", () => {
    expect(listingPill(null as unknown as ProductReview, deriveVerdict(SAMPLE_MINIMALIST_B5))).toBeNull();
  });
});

afterEach(() => vi.unstubAllEnvs());
describe("the flag", () => {
  it("is the pills page's own flag, so one switch turns the page and the cards together", () => {
    expect(ANALYSER_FLAGS.pillsPage).toBe("ANALYSER_PILLS_PAGE");
  });
});
