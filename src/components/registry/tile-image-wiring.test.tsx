import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ProductScorecard } from "@/data/brands/types";
import MarketCard from "./MarketCard";

const BASE = {
  productName: "Fluid SPF 50", slug: "fluid-spf-50", brand: "Example Co", brandSlug: "example-co", priceRange: "", concern: "", summary: "A one-line takeaway.",
  score: 70, scoreLabel: "Good", image: "", pillars: [], keyActives: [], ingredients: [], pass_badges: [], warn_badges: [], info_badges: [], indiaContext: "",
  analyzedAt: "2026-10-20", category: "Sunscreen", productType: "sunscreen", freshReview: true, reviewTier: "mostly-clean", price: 649,
} as ProductScorecard;
const draw = (image: string) => renderToStaticMarkup(<MarketCard product={{ ...BASE, image }} comparing={false} compareBlock={null} onCompare={() => {}} />);

describe("a product tile's picture", () => {
  it("is drawn through the cleaned-up route for a remote picture, and not run through the page's image optimiser a second time", () => {
    const html = draw("https://images-static.nykaa.com/media/catalog/product/tr:w-220,h-220,cm-pad_resize/8/b/x.jpg");
    expect(html).toMatch(/<img[^>]+src="\/api\/tile\/fluid-spf-50\?v=[0-9a-z]+"/);
    expect(html).not.toContain("_next/image");
  });

  it("is a curated file this site serves exactly as it is, through the page's image optimiser", () => {
    const html = draw("/images/home/products/cosrx-bha-liquid.webp");
    expect(html).toContain("_next/image");
    expect(html).not.toContain("/api/tile/");
  });

  it("is a 'No photo' box when there is no picture", () => {
    expect(draw("")).toContain("No photo");
  });
});
