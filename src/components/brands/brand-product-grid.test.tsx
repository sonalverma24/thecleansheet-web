import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ProductScorecard } from "@/data/brands/types";
import BrandProductGrid from "./BrandProductGrid";

const product = (over: Partial<ProductScorecard>): ProductScorecard => ({
  productName: "Barrier Cream", slug: "barrier-cream", brand: "Example Co", brandSlug: "example-co", priceRange: "", concern: "", summary: "A one-line takeaway from the analysis.",
  score: 70, scoreLabel: "Good", image: "", pillars: [], keyActives: [], ingredients: [], pass_badges: [], warn_badges: [], info_badges: [], indiaContext: "",
  analyzedAt: "2026-10-20", category: "Moisturizer", productType: "leave-on", freshReview: true, reviewTier: "mostly-clean", price: 649,
  pill: { key: "good-choice", marker: "green" }, glance: [{ label: "Paraben free", state: "yes" }],
  ...over,
}) as ProductScorecard;

describe("a brand profile's product list", () => {
  const html = renderToStaticMarkup(<BrandProductGrid products={[product({}), product({ productName: "Gel Cleanser", slug: "gel-cleanser", category: "Face Wash", productType: "rinse-off" })]} />);

  it("draws the /products card for each product: rating circle, ticks, price and a Compare button, linking to the analysis", () => {
    expect(html.match(/<article /g)).toHaveLength(2);
    expect(html).toContain('href="/analysis/barrier-cream"');
    expect(html).toContain('aria-label="Rating: green"');
    expect(html).toContain("Paraben free");
    expect(html).toContain("₹649");
    expect(html.match(/\+ Compare/g)).toHaveLength(2);
  });

  it("never prints a standing word", () => {
    for (const word of ["Good Standing", "Room to Improve", "Not Recommended"]) expect(html, word).not.toContain(word);
  });
});
