import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import BrandDirectoryClient from "./BrandDirectoryClient";
import BrandsMarketplace from "@/components/registry/BrandsMarketplace";
import { BLOG_POSTS } from "@/lib/blog-posts";

vi.mock("@/lib/brand-directory", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/brand-directory")>()),
  getBrandDirectory: async () => [],
}));

/* The owner may delete every stored analysis and rebuild them. While there are none, /brands and /products must say so, not show an empty search box
   with "No brands match" / "No products match", and /brands must not print "0 covered brands". */

describe("/brands with no analysed products", () => {
  it("says brands appear as products are analysed, and points to /products", () => {
    const html = renderToStaticMarkup(<BrandDirectoryClient brands={[]} />);
    expect(html).toContain("Brands appear here as we analyse their products");
    expect(html).toContain('href="/products"');
    expect(html).not.toContain("No brands match");
    expect(html).not.toContain('type="search"');
  });

  it("still shows the search and the cards once there is a brand", () => {
    const brand = {
      slug: "example", name: "Example", description: null, founded: null, logoUrl: null, countryOfOrigin: null, indiaPresence: null, globalPresence: null,
      counts: { green: 1, yellow: 0, red: 0, unrated: 0 }, ratedCount: 1, standing: "limited" as const, leadingColor: "green" as const,
    };
    const html = renderToStaticMarkup(<BrandDirectoryClient brands={[brand]} />);
    expect(html).toContain('type="search"');
    expect(html).toContain('href="/brands/example"');
    expect(html).not.toContain("Brands appear here");
  });

  it("does not print a zero count in the page's opening lines", async () => {
    const { default: BrandsPage } = await import("@/app/brands/page");
    const html = renderToStaticMarkup(await BrandsPage());
    expect(html).not.toMatch(/\b0<\/strong> covered/);
    expect(html).toContain("Brands appear here as we analyse their products");
  });
});

describe("/products with no analysed products", () => {
  it("says products appear as they are analysed, with no filters or empty-result message", () => {
    const html = renderToStaticMarkup(<BrandsMarketplace products={[]} />);
    expect(html).toContain("Products appear here as we analyse them");
    expect(html).not.toContain("No products match");
    expect(html).not.toContain("Filters");
  });
});

describe("the product list lives at /products", () => {
  it("has no blog call to action that sends a reader to the brand directory to analyse a product", () => {
    expect(JSON.stringify(BLOG_POSTS)).not.toContain('"href":"/brands"');
  });
});
