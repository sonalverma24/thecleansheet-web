import { describe, expect, it } from "vitest";
import type { ProductScorecard } from "@/data/brands/types";
import { HOME_PICK_SLUGS } from "@/data/home-picks";
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

const FACE = (n: number) => tile({ slug: `face-${n}`, brand: "Brand", productName: `Face Wash ${n}`, category: "Face Wash", reviewTier: "mostly-clean" });
const HAIR = tile({ slug: "hair-1", brand: "Bare Anatomy", productName: "Ultra Smoothing Hair Serum", category: "Hair Serum", reviewTier: "can-do-better" });

describe("buildShelf", () => {
  it("shows the newest analyses, in the order given, when no products are picked", () => {
    const cards = buildShelf([FACE(1), HAIR, FACE(2)], { picks: [] });
    expect(cards.map((c) => c.slug)).toEqual(["face-1", "hair-1", "face-2"]);
    expect(cards[0].href).toBe("/analysis/face-1");
    expect(cards.map((c) => c.category)).toEqual(["Cleansers", "Other", "Cleansers"]);
  });

  it("never shows more than five, and the default is five", () => {
    const many = Array.from({ length: 9 }, (_, i) => FACE(i + 1));
    expect(buildShelf(many, { picks: [] })).toHaveLength(5);
    expect(buildShelf(many, { picks: [], max: 3 })).toHaveLength(3);
  });

  it("shows the owner's picks, in the order chosen, in place of the newest", () => {
    const tiles = [FACE(1), FACE(2), FACE(3), FACE(4)];
    expect(buildShelf(tiles, { picks: ["face-3", "face-1"] }).map((c) => c.slug)).toEqual(["face-3", "face-1"]);
  });

  it("skips a picked slug that has no analysis yet, shows a product once, and falls back to the newest when no pick exists", () => {
    const tiles = [FACE(1), FACE(2)];
    expect(buildShelf(tiles, { picks: ["not-analysed-yet", "face-2", "face-2"] }).map((c) => c.slug)).toEqual(["face-2"]);
    expect(buildShelf(tiles, { picks: ["not-analysed-yet"] }).map((c) => c.slug)).toEqual(["face-1", "face-2"]);
  });

  it("shows the real rating for each product, as a circle: green, yellow, red", () => {
    const cards = buildShelf([ANUA_OIL, ANUA_FOAM, COSRX_BHA], { picks: [] });
    const marker = (slug: string) => cards.find((c) => c.slug === slug)!.marker;
    expect(marker(ANUA_OIL.slug)).toBe("green");
    expect(marker(ANUA_FOAM.slug)).toBe("yellow");
    expect(marker(COSRX_BHA.slug)).toBe("red");
    for (const c of cards) expect(Object.keys(c)).not.toContain("standing");
  });

  it("never shows a certified status, even when the stored tile says certified", () => {
    const certified = { ...ANUA_OIL, certificationStatus: "tcs-certified" as const };
    for (const c of buildShelf([certified, ANUA_FOAM], { picks: [] })) expect(JSON.stringify(c).toLowerCase()).not.toContain("certif");
  });

  it("uses the clean pack shot kept for a known product and the stored photo for any other", () => {
    const cards = buildShelf([ANUA_OIL, FACE(1)], { picks: [] });
    expect(cards[0].image).toBe("/images/home/products/anua-heartleaf-oil.webp");
    expect(cards[0].seedKey).toBe("anua-heartleaf-oil");
    expect(cards[1].image).toBe("https://img.example/p.jpg");
    expect(cards[1].seedKey).toBeNull();
  });

  it("returns an empty shelf when there are no analyses", () => {
    expect(buildShelf([], { picks: [] })).toEqual([]);
    expect(buildShelf([], { picks: ["anything"] })).toEqual([]);
  });

  it("starts with no products picked, so every new analysis appears on its own", () => {
    expect(HOME_PICK_SLUGS).toEqual([]);
    expect(buildShelf([FACE(1)]).map((c) => c.slug)).toEqual(["face-1"]);
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
    const cards = buildShelf([COSRX_BHA, TONER, ANUA_OIL, ANUA_FOAM], { picks: [] });
    expect(shelfCategories(cards)).toEqual(["Cleansers", "Toners", "Exfoliants"]);
  });
});

describe("popularChecks", () => {
  it("links only to analyses that exist, with the short label", () => {
    const patch = tile({ slug: "cosrx-master-patch-original-fit", brand: "COSRX", productName: "Master Patch Original Fit" });
    const cards = buildShelf([COSRX_BHA, patch, ANUA_OIL, TONER], { picks: [] });
    expect(popularChecks(cards)).toEqual([
      { label: "Cleansing oil", href: `/analysis/${ANUA_OIL.slug}` },
      { label: "BHA liquid", href: `/analysis/${COSRX_BHA.slug}` },
      { label: "Pimple patches", href: "/analysis/cosrx-master-patch-original-fit" },
    ]);
  });

  it("is empty when none of the labelled products have been analysed", () => {
    expect(popularChecks(buildShelf([TONER], { picks: [] }))).toEqual([]);
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

describe("the pills page: a shelf card of a stored review shows its circle", () => {
  const CAUTION = { ...ANUA_OIL, pill: { key: "buy-with-caution", marker: "yellow" as const } };

  it("shows the page's circle and no words, and keeps everything else the card had", () => {
    const [card] = buildShelf([CAUTION], { picks: [] });
    const [before] = buildShelf([ANUA_OIL], { picks: [] });
    expect(card.marker).toBe("yellow");
    expect(JSON.stringify(card)).not.toMatch(/Buy with caution|Good choice|Look elsewhere|Not enough info|Medicinal product/);
    expect({ ...card, marker: null }).toEqual({ ...before, marker: null });
  });

  it("a tile with no pill shows the circle of today's standing", () => {
    const [card] = buildShelf([ANUA_OIL], { picks: [] });
    expect(card.marker).toBe("green");
  });

  it("a grey pill (not enough info, a medicine) is a grey circle", () => {
    const [card] = buildShelf([{ ...ANUA_OIL, pill: { key: "not-enough-info", marker: null } }], { picks: [] });
    expect(card.marker).toBeNull();
  });
});

