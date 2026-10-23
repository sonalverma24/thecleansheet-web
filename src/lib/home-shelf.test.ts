import { describe, expect, it } from "vitest";
import type { ProductScorecard } from "@/data/brands/types";
import { buildShelf, categoryFor, matchSeed, popularChecks, SHELF_SEEDS, shelfCategories, shelfNote } from "./home-shelf";

function tile(over: Partial<ProductScorecard> & { slug: string; brand: string; productName: string }): ProductScorecard {
  return { score: 70, image: "https://img.example/p.jpg", summary: "A clear one-line takeaway.", category: "Skincare", ...over } as ProductScorecard;
}

const ANUA_OIL = tile({ slug: "anua-heartleaf-pore-control-cleansing-oil", brand: "Anua", productName: "Anua Heartleaf Pore Control Cleansing Oil", reviewTier: "mostly-clean" });
const ANUA_FOAM = tile({ slug: "anua-heartleaf-quercetinol-pore-deep-cleansing-foam", brand: "Anua", productName: "Heartleaf Quercetinol Pore Deep Cleansing Foam", reviewTier: "can-do-better" });
const COSRX_BHA = tile({ slug: "cosrx-bha-blackhead-power-liquid", brand: "COSRX", productName: "BHA Blackhead Power Liquid", reviewTier: "not-recommended" });
const TONER = tile({ slug: "skin1004-tea-trica-purifying-toner", brand: "SKIN1004", productName: "Madagascar Centella Tea-Trica Purifying Toner", reviewTier: "mostly-clean" });

describe("matchSeed", () => {
  const seed = (key: string) => SHELF_SEEDS.find((s) => s.key === key)!;

  it("tells the two Anua heartleaf cleansers apart", () => {
    expect(matchSeed(seed("anua-heartleaf-oil"), ANUA_OIL)).toBe(true);
    expect(matchSeed(seed("anua-heartleaf-oil"), ANUA_FOAM)).toBe(false);
    expect(matchSeed(seed("anua-heartleaf-foam"), ANUA_FOAM)).toBe(true);
  });

  it("tells the two SKIN1004 Tea-Trica products apart", () => {
    const ampoule = tile({ slug: "s-a", brand: "SKIN1004", productName: "Madagascar Centella Tea-Trica Relief Ampoule" });
    expect(matchSeed(seed("skin1004-centella-toner"), TONER)).toBe(true);
    expect(matchSeed(seed("skin1004-centella-toner"), ampoule)).toBe(false);
    expect(matchSeed(seed("skin1004-centella-ampoule"), ampoule)).toBe(true);
  });

  it("does not match another brand's similarly named product", () => {
    const other = tile({ slug: "x", brand: "Minimalist", productName: "Heartleaf Cleansing Oil" });
    expect(matchSeed(seed("anua-heartleaf-oil"), other)).toBe(false);
  });
});

describe("buildShelf", () => {
  it("returns the seeded products in design order with the clean local pack shot", () => {
    const cards = buildShelf([COSRX_BHA, TONER, ANUA_FOAM, ANUA_OIL], 4);
    expect(cards.map((c) => c.slug)).toEqual([ANUA_OIL.slug, TONER.slug, COSRX_BHA.slug, ANUA_FOAM.slug]);
    expect(cards[0].image).toBe("/images/home/products/anua-heartleaf-oil.webp");
    expect(cards[0].href).toBe("/analysis/anua-heartleaf-pore-control-cleansing-oil");
    expect(cards.map((c) => c.category)).toEqual(["Cleansers", "Toners", "Exfoliants", "Cleansers"]);
  });

  it("shows the real standing for each product", () => {
    const cards = buildShelf([ANUA_OIL, ANUA_FOAM, COSRX_BHA, TONER], 4);
    const label = (slug: string) => cards.find((c) => c.slug === slug)!.standing;
    expect(label(ANUA_OIL.slug)).toBe("Good Standing");
    expect(label(ANUA_FOAM.slug)).toBe("Room to Improve");
    expect(label(COSRX_BHA.slug)).toBe("Not Recommended");
  });

  it("never shows a certified status, even when the stored tile says certified", () => {
    const certified = { ...ANUA_OIL, certificationStatus: "tcs-certified" as const };
    const cards = buildShelf([certified, ANUA_FOAM, COSRX_BHA, TONER], 4);
    for (const c of cards) {
      expect(JSON.stringify(c).toLowerCase()).not.toContain("certif");
    }
  });

  it("tops up with the newest skincare reviews when too few seeded products are reviewed", () => {
    const hair = tile({ slug: "hair-1", brand: "Bare Anatomy", productName: "Ultra Smoothing Hair Serum", category: "Hair Serum" });
    const face = (n: number) => tile({ slug: `face-${n}`, brand: "Brand", productName: `Face Wash ${n}`, category: "Face Wash" });
    const cards = buildShelf([hair, face(1), face(2), face(3), ANUA_OIL], 4);
    // The seeded product leads; the hair serum is skipped because enough skincare reviews exist.
    expect(cards.map((c) => c.slug)).toEqual([ANUA_OIL.slug, "face-1", "face-2", "face-3"]);
    expect(cards[1].category).toBe("Cleansers");
    expect(cards[1].image).toBe("https://img.example/p.jpg");
  });

  it("does not top up once enough seeded products exist, and never repeats a product", () => {
    const extra = tile({ slug: "extra", brand: "Other", productName: "Another Serum", category: "Serum" });
    const cards = buildShelf([extra, ANUA_OIL, ANUA_FOAM, COSRX_BHA, TONER], 4);
    expect(cards.map((c) => c.slug)).not.toContain("extra");
    expect(new Set(cards.map((c) => c.slug)).size).toBe(cards.length);
  });

  it("returns an empty shelf when the repository is empty", () => {
    expect(buildShelf([], 4)).toEqual([]);
  });
});

describe("categoryFor and shelfCategories", () => {
  it("groups real review types into the design's filter chips", () => {
    expect(categoryFor({ category: "Face Wash", productName: "x" })).toBe("Cleansers");
    expect(categoryFor({ category: "Serum", productName: "x" })).toBe("Serums");
    expect(categoryFor({ category: "Pimple Patch", productName: "x" })).toBe("Spot care");
    expect(categoryFor({ category: "Hair Oil", productName: "Hair Elixir" })).toBeNull();
  });

  it("only lists chips that have a card, in display order", () => {
    const cards = buildShelf([COSRX_BHA, TONER, ANUA_OIL, ANUA_FOAM], 4);
    expect(shelfCategories(cards)).toEqual(["Cleansers", "Toners", "Exfoliants"]);
  });
});

describe("popularChecks", () => {
  it("links only to reviews that exist, with the short label", () => {
    const patch = tile({ slug: "cosrx-master-patch-original-fit", brand: "COSRX", productName: "Master Patch Original Fit" });
    const cards = buildShelf([COSRX_BHA, patch, ANUA_OIL, TONER], 4);
    expect(popularChecks(cards)).toEqual([
      { label: "Cleansing oil", href: `/analysis/${ANUA_OIL.slug}` },
      { label: "BHA liquid", href: `/analysis/${COSRX_BHA.slug}` },
      { label: "Pimple patches", href: "/analysis/cosrx-master-patch-original-fit" },
    ]);
  });

  it("is empty when none of the labelled products have been reviewed", () => {
    expect(popularChecks(buildShelf([TONER], 4))).toEqual([]);
  });
});

describe("shelfNote", () => {
  it("passes a short takeaway through", () => {
    expect(shelfNote("Short and clear.")).toBe("Short and clear.");
  });

  it("clips a long takeaway at a word boundary with an ellipsis", () => {
    const long = "This serum delivers on its core promise of smoothing and frizz control through a well-formulated silicone base, but its most ambitious quantified claims lack visible, specific clinical backing.";
    const out = shelfNote(long);
    expect(out.length).toBeLessThanOrEqual(152);
    expect(out.endsWith("…")).toBe(true);
    expect(long.startsWith(out.slice(0, -1))).toBe(true);
  });

  it("falls back to a neutral line when there is no takeaway", () => {
    expect(shelfNote(undefined)).toBe("Every claim graded against the evidence.");
  });
});
