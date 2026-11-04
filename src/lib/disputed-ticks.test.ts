import { describe, expect, it } from "vitest";
import { deriveVerdict } from "@/lib/product-review-engine";
import { reviewToScorecard } from "@/lib/review-to-scorecard";
import { decideReview } from "@/lib/analyser-x";
import { BASE, NOW, REVIEWED, rv } from "@/lib/analyser-x/test-helpers";
import { makeInciEvidence } from "@/lib/review-verifier";
import { buildAtAGlance, fragranceFromCompleteInci } from "@/lib/at-a-glance";
import { resolveBadges } from "@/data/badges/resolver";
import { compareFactsOf } from "@/lib/compare-facts";
import type { ProductReview } from "@/lib/product-review-types";
import { buildPillsPage } from "./pills-page";
import { disputedTicksOf, freeFromKeys } from "./disputed-ticks";
import { claimKey } from "@/lib/claim-ontology";

/* Live case, 2026-11-04: Garnier Skin Naturals Micellar Oil-Infused Cleansing Water ticked "Fragrance free" and "Alcohol free" (worked out from the list we hold)
   under a summary saying its fragrance-free claim is misleading and a concern saying the claim is contradicted. A page must not tick what its own words dispute. */

const GARNIER_TEXT = {
  biggestConcern: "The 'fragrance-free' claim is directly contradicted by the ingredient list, which contains multiple fragrance components and allergens.",
  platformIssue: "Some retailers (e.g., Desertcart, Myntra) explicitly state 'fragrance-free' and 'alcohol-free' claims, which are contradicted by the INCI.",
  takeaway: "While effective for makeup removal, this product's 'fragrance-free' claim is misleading, and consumers should be aware of the actual ingredient list.",
};

function disputed(over: Partial<ProductReview> = {}): ProductReview {
  const base = rv({ inciIngredients: BASE });
  return {
    ...base,
    verdict: { ...base.verdict, biggestConcern: GARNIER_TEXT.biggestConcern, cleanSheetTakeaway: GARNIER_TEXT.takeaway },
    platformParity: { ...(base.platformParity ?? {}), issues: [GARNIER_TEXT.platformIssue] } as ProductReview["platformParity"],
    ...over,
  };
}

const page = (review: ProductReview) => {
  const { product } = reviewToScorecard(review, deriveVerdict(review));
  return { model: buildPillsPage(review, product, NOW, decideReview(review, NOW)), product };
};
const chips = (review: ProductReview) => Object.fromEntries(page(review).model.highlights.map((h) => [h.label, h.state]));

describe("which claims the analysis's own text disputes", () => {
  it("reads a quoted claim next to 'contradicted', in the concern and in the retailer notes", () => {
    expect(disputedTicksOf(disputed())).toEqual(["alcohol free", "fragrance free"]);
  });

  it("finds nothing in an analysis that disputes nothing", () => {
    expect(disputedTicksOf(rv({ inciIngredients: BASE }))).toEqual([]);
  });

  it("honours a negation bound to the claim: 'X' is supported by the absence of contradictory evidence", () => {
    const base = rv({ inciIngredients: BASE });
    const review = { ...base, verdict: { ...base.verdict, biggestConcern: "'Fragrance free' is supported by the absence of contradictory evidence in the list." } };
    expect(disputedTicksOf(review)).toEqual([]);
  });

  it.each([
    ["no alcohol, no perfume", ["alcohol free", "fragrance free"]],
    ["perfume free", ["fragrance free"]],
    ["free from parabens", ["paraben free"]],
    ["0% alcohol", ["alcohol free"]],
    ["no added fragrance", ["fragrance free"]],
    ["sulphate and paraben free", ["paraben free", "sulfate free"]],
    ["alcohol, paraben & silicone free", ["alcohol free", "paraben free", "silicone free"]],
    ["alcohol free", ["alcohol free"]],
    ["benzyl alcohol", []],
    ["free from", []],
    ["no white cast", ["white cast free"]],
    ["free from harsh chemicals that strip the skin", []],
  ])("a disputed claim worded '%s' covers %j", (claim, keys) => {
    expect(freeFromKeys(claimKey(claim))).toEqual(keys);
  });

  it("the Garnier re-run's wording: 'no alcohol, no perfume' disputes Alcohol free and Fragrance free", () => {
    const base = rv({ inciIngredients: BASE });
    const review = { ...base, verdict: { ...base.verdict, biggestConcern: "A marketplace claim of 'no alcohol, no perfume' is directly contradicted by the ingredient list, which contains both, raising significant trust and ASCI concerns." } };
    expect(disputedTicksOf(review)).toEqual(["alcohol free", "fragrance free", "no alcohol, no perfume"]);
    const by = chips(review);
    expect(by["Alcohol free"]).toBeUndefined();
    expect(by["Fragrance free"]).toBeUndefined();
    expect(by["Paraben free"]).toBe("yes");
  });

  it("a two-part claim disputed for one part covers that part only (Scalpe Pro, live): Paraben free, which the text supports, stays", () => {
    const base = rv({ inciIngredients: BASE });
    const issue = "Flipkart listings for the 100ml variant claim 'Sulphate/Paraben Free', which is directly contradicted by the presence of Sodium Lauryl Ether Sulphate in the INCI. The INCI does not list parabens, so 'paraben free' is supported, but 'sulphate free' is not.";
    const review = { ...base, platformParity: { ...(base.platformParity ?? {}), issues: [issue] } as ProductReview["platformParity"] };
    expect(disputedTicksOf(review)).toEqual(["sulfate free", "sulfate/paraben free"]);
    expect(chips(review)["Paraben free"]).toBe("yes");
  });

  it("given the disputing sentence, a two-part claim covers the parts it names, or all when it says 'both'", () => {
    expect(freeFromKeys("no alcohol, no perfume", "A marketplace claim of 'no alcohol, no perfume' is directly contradicted by the ingredient list, which contains both.")).toEqual(["alcohol free", "fragrance free"]);
    expect(freeFromKeys("no alcohol, no perfume", "The 'no alcohol, no perfume' claim is contradicted: the list names Parfum.")).toEqual(["fragrance free"]);
    expect(freeFromKeys("perfume free", "The 'perfume-free' claim is contradicted.")).toEqual(["fragrance free"]);
  });

  it("reads the fit lists too: they are on the page", () => {
    const base = rv({ inciIngredients: BASE });
    const review = { ...base, consumerSuitability: { ...base.consumerSuitability, avoidIf: ["Anyone relying on the 'paraben-free' claim, which the list contradicts"] } };
    expect(disputedTicksOf(review)).toEqual(["paraben free"]);
  });
});

describe("the page never ticks what its own text disputes", () => {
  it("control: the same list with no disputing text ticks Fragrance free, Alcohol free and Paraben free", () => {
    const by = chips(rv({ inciIngredients: BASE }));
    expect(by["Fragrance free"]).toBe("yes");
    expect(by["Alcohol free"]).toBe("yes");
    expect(by["Paraben free"]).toBe("yes");
  });

  it("the Garnier case: Fragrance free and Alcohol free are not drawn; Paraben free, which nothing disputes, stays", () => {
    const by = chips(disputed());
    expect(by["Fragrance free"]).toBeUndefined();
    expect(by["Alcohol free"]).toBeUndefined();
    expect(by["Paraben free"]).toBe("yes");
  });

  it("the FAQ does not answer 'Is it fragrance free?' from the withheld tick", () => {
    const { model } = page(disputed());
    expect(model.faq.some((f) => /fragrance free\?$/.test(f.q))).toBe(false);
    expect(page(rv({ inciIngredients: BASE })).model.faq.some((f) => /fragrance free\?$/.test(f.q))).toBe(true);
  });

  it("a cross the text agrees with stays a cross: a list that names Parfum still shows Fragrance free as not met", () => {
    const list = ["Aqua", "Glycerin", "Parfum", "Phenoxyethanol"];
    const review = disputed({ inciIngredients: list, inciEvidence: makeInciEvidence("https://incidecoder.com/products/test-product", list.join(", "), REVIEWED, "Test Face Wash") });
    expect(chips(review)["Fragrance free"]).toBe("no");
  });

  it("the older scorecard page, its badges and the compare view hold to the same rule", () => {
    const { product } = page(disputed());
    expect(fragranceFromCompleteInci(product)).toBe("unknown");
    const ticks = buildAtAGlance(product).filter((t) => t.value).map((t) => t.label);
    expect(ticks).not.toContain("Fragrance free");
    expect(ticks).not.toContain("Essential oil free");
    expect(ticks).not.toContain("Alcohol free");
    expect(resolveBadges(product).map((b) => b.id)).not.toContain("FRAGRANCE_FREE");
    const control = page(rv({ inciIngredients: BASE })).product;
    expect(resolveBadges(control).map((b) => b.id)).toContain("FRAGRANCE_FREE");
    const facts = (review: ProductReview) => JSON.stringify(compareFactsOf("test-product", { type: "product-review", review, verdict: deriveVerdict(review) }));
    expect(facts(disputed())).not.toMatch(/Fragrance free/);
    expect(facts(rv({ inciIngredients: BASE }))).toMatch(/Fragrance free/);
  });
});
