import { afterEach, describe, expect, it, vi } from "vitest";
import { SAMPLE_EXAMPLE_MINERAL_SUNSCREEN } from "@/data/analysis/sample-reviews";
import { deriveVerdict } from "@/lib/product-review-engine";
import { TIER_STYLES, tierToRating } from "@/components/scorecards/pillar-ui";
import { ANALYSER_FLAGS } from "@/lib/analyser-flags";
import { BASE, evidence, rv } from "@/lib/analyser-x/test-helpers";
import type { ProductReview } from "@/lib/product-review-types";

const stored = vi.hoisted(() => ({ current: null as null | { type: "product-review"; review: unknown; verdict: unknown } }));
vi.mock("@/lib/product-review-engine", async (orig) => ({ ...(await orig<typeof import("@/lib/product-review-engine")>()), getStoredReview: async () => stored.current }));

import StoredReviewPage, { generateMetadata } from "@/app/analysis/[slug]/page";

const serve = (review: ProductReview) => { stored.current = { type: "product-review", review, verdict: deriveVerdict(review) }; };
const params = { params: Promise.resolve({ slug: "example" }) };
const FLAG = ANALYSER_FLAGS.pillsPage;
afterEach(() => { delete process.env[FLAG]; });

type El = { type?: { name?: string }; props?: Record<string, unknown> };
const kids = (el: unknown): El[] => { const c = (el as El).props?.children; return (Array.isArray(c) ? c : [c]).filter(Boolean) as El[]; };
const jsonLd = (tree: unknown) => JSON.parse(String(((kids(tree)[0].props?.dangerouslySetInnerHTML) as { __html: string }).__html));
const reviewNode = (ld: { "@graph": { "@type": string; review?: { reviewRating: unknown } }[] }) => ld["@graph"].find((n) => n["@type"] === "Product")?.review;

describe("the stored-review page, flag off: exactly today's page", () => {
  it("title, rating and layout follow the old standing", async () => {
    serve(SAMPLE_EXAMPLE_MINERAL_SUNSCREEN);
    const verdict = deriveVerdict(SAMPLE_EXAMPLE_MINERAL_SUNSCREEN);
    const meta = await generateMetadata(params);
    expect(meta.title).toBe(`${SAMPLE_EXAMPLE_MINERAL_SUNSCREEN.productName} Analysis · ${TIER_STYLES[verdict.tier].label}`);
    expect(meta.robots).toBeUndefined();
    const tree = await StoredReviewPage(params);
    expect(kids(tree)[1].type?.name).toBe("ProductScorecardView");
    expect(reviewNode(jsonLd(tree))?.reviewRating).toEqual(tierToRating(verdict.tier));
  });
});

describe("the stored-review page, flag on: pills only", () => {
  it("a Good choice: the title carries the pill, the rating is 5, the pills page renders", async () => {
    process.env[FLAG] = "1";
    serve(SAMPLE_EXAMPLE_MINERAL_SUNSCREEN);
    const meta = await generateMetadata(params);
    expect(meta.title).toMatch(/ Analysis · Good choice$/);
    expect(String(meta.description)).toContain("Good choice");
    expect(meta.robots).toBeUndefined();
    const tree = await StoredReviewPage(params);
    expect(kids(tree)[1].type?.name).toBe("PillsPage");
    expect(reviewNode(jsonLd(tree))?.reviewRating).toMatchObject({ ratingValue: 5, bestRating: 5, worstRating: 1, alternateName: "Good choice" });
    for (const old of ["Good Standing", "Room to Improve", "Not Recommended", "Licensed Drug"]) {
      expect(JSON.stringify(meta)).not.toContain(old);
      expect(JSON.stringify(jsonLd(tree))).not.toContain(old);
    }
  });

  it("Not enough info is kept out of search and carries no rating", async () => {
    process.env[FLAG] = "1";
    serve(rv({ productName: "Face Cream", category: "Moisturizer", inciIngredients: [], ingredientReads: [], claimMap: [] }, evidence.model()));
    const meta = await generateMetadata(params);
    expect(meta.title).toMatch(/ Analysis · Not enough info$/);
    expect(meta.robots).toEqual({ index: false, follow: true });
    expect(reviewNode(jsonLd(await StoredReviewPage(params)))).toBeUndefined();
  });

  it("a medicine carries no rating, and Look elsewhere is 1.5", async () => {
    process.env[FLAG] = "1";
    serve(rv({ productName: "Anti Dandruff Shampoo", category: "Shampoo", inciIngredients: [...BASE, "Ketoconazole"] }));
    expect(reviewNode(jsonLd(await StoredReviewPage(params)))).toBeUndefined();
    serve(rv({ productName: "Preserved Cream", category: "Moisturizer", inciIngredients: [...BASE, "Formaldehyde"] }));
    expect(reviewNode(jsonLd(await StoredReviewPage(params)))?.reviewRating).toMatchObject({ ratingValue: 1.5, alternateName: "Look elsewhere" });
  });
});

describe("the stored-review page, new layout only (ANALYSER_NEW_LAYOUT): the new page, today's decisions", () => {
  const LAYOUT = ANALYSER_FLAGS.newLayout;
  afterEach(() => { delete process.env[LAYOUT]; });

  it("draws the new layout, and the title, description, rating and indexing are exactly today's", async () => {
    process.env[LAYOUT] = "1";
    serve(SAMPLE_EXAMPLE_MINERAL_SUNSCREEN);
    const verdict = deriveVerdict(SAMPLE_EXAMPLE_MINERAL_SUNSCREEN);
    const meta = await generateMetadata(params);
    expect(meta.title).toBe(`${SAMPLE_EXAMPLE_MINERAL_SUNSCREEN.productName} Analysis · ${TIER_STYLES[verdict.tier].label}`);
    expect(String(meta.description)).toContain(TIER_STYLES[verdict.tier].label);
    expect(meta.robots).toBeUndefined();
    const tree = await StoredReviewPage(params);
    expect(kids(tree)[1].type?.name).toBe("PillsPage");
    expect((kids(tree)[1].props as { model: { mode: string } }).model.mode).toBe("standing");
    expect(reviewNode(jsonLd(tree))?.reviewRating).toEqual(tierToRating(verdict.tier));
    for (const pill of ["Good choice", "Buy with caution", "Look elsewhere", "Not enough info", "Medicinal product"]) {
      expect(JSON.stringify(meta), pill).not.toContain(pill);
      expect(JSON.stringify(jsonLd(tree)), pill).not.toContain(pill);
    }
  });

  it("a page with no ingredient list is NOT kept out of search by the new layout, and keeps its old rating", async () => {
    process.env[LAYOUT] = "1";
    const review = rv({ productName: "Face Cream", category: "Moisturizer", inciIngredients: [], ingredientReads: [], claimMap: [] }, evidence.model());
    serve(review);
    const meta = await generateMetadata(params);
    expect(meta.robots).toBeUndefined();
    expect(meta.title).toBe(`Face Cream Analysis · ${TIER_STYLES[deriveVerdict(review).tier].label}`);
    expect(reviewNode(jsonLd(await StoredReviewPage(params)))?.reviewRating).toEqual(tierToRating(deriveVerdict(review).tier));
  });

  it("a stored Licensed Drug keeps no rating, as today", async () => {
    process.env[LAYOUT] = "1";
    const review = rv({ productName: "Anti Dandruff Shampoo", category: "Shampoo", inciIngredients: [...BASE, "Ketoconazole"] });
    serve(review);
    const verdict = deriveVerdict(review);
    expect(verdict.tier, "the fixture is a stored Licensed Drug").toBe("not-assessed");
    expect(tierToRating(verdict.tier)).toBeNull();
    expect(reviewNode(jsonLd(await StoredReviewPage(params)))).toBeUndefined();
    expect((kids(await StoredReviewPage(params))[1].props as { model: { pill: { label: string } } }).model.pill.label).toBe("Licensed Drug");
  });

  it("with both flags on, the pills page wins: the decisions are the pill's", async () => {
    process.env[LAYOUT] = "1";
    process.env[FLAG] = "1";
    serve(SAMPLE_EXAMPLE_MINERAL_SUNSCREEN);
    expect((await generateMetadata(params)).title).toMatch(/ Analysis · Good choice$/);
    const tree = await StoredReviewPage(params);
    expect((kids(tree)[1].props as { model: { mode: string } }).model.mode).toBe("pills");
  });

  it("with both flags off, it is exactly today's page", async () => {
    serve(SAMPLE_EXAMPLE_MINERAL_SUNSCREEN);
    expect(kids(await StoredReviewPage(params))[1].type?.name).toBe("ProductScorecardView");
  });
});
