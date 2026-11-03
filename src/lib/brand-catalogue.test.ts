import { afterEach, describe, expect, it, vi } from "vitest";
import { catalogueConfirmsPage, fetchShopifyCatalogue, uniqueCatalogueHandle, type CatalogueProduct } from "./brand-catalogue";

/** The titles and handles in humussbeauty.com's own public product feed (read 2026-10-31), the brand whose sunscreen a retailer sells under another name. */
const HUMUSS: CatalogueProduct[] = [
  { handle: "barrier-boost-pumpkin-stem-cell-glycolic-acid-face-cleanser", title: "Barrier Boost – Pumpkin Stem Cell & Glycolic Acid Face Cleanser" },
  { handle: "tester-combo", title: "POCKET GLAM KIT" },
  { handle: "hello-hydration-ceramide-hyaluronic-acid-face-moisturiser-tester", title: "Hello Hydration - Ceramide & Hyaluronic Acid Face Moisturiser - Tester 20g" },
  { handle: "sun-sational-spf-50-hyaluronic-acid-sunscreen-tester", title: "Sun-Sational - SPF 50 Hyaluronic Acid Sunscreen - Tester 20g" },
  { handle: "acne-breakup-kit", title: "Acne Breakup Kit" },
  { handle: "moon-kissed-0-3-retinol-anti-aging-serum", title: "Moon Kissed - 0.3% Retinol Anti-Aging Serum" },
  { handle: "glow-o-clock-10-niacinamide-face-serum", title: "Glow'O Clock - 10% Niacinamide & Hyaluronic Acid Serum" },
  { handle: "hello-hydration-face-moisturiser", title: "Hello Hydration - Ceramide & Hyaluronic Acid Face Moisturizer" },
  { handle: "berry-breeze-face-wash", title: "Berry Breeze - Mulberry & Hyaluronic Acid Face Wash" },
  { handle: "sun-sational-spf-50-sunscreen", title: "Sun-sational - SPF 50 Hyaluronic Acid Sunscreen" },
];
const RETAILER = "Humuss Beauty Sunscreen - SPF 50 PA+++ Lightweight D-Tan Sunscreen with Hyaluronic Acid, Vitamin - E | In-Vitro Tested";

describe("uniqueCatalogueHandle", () => {
  it("finds the brand's own product behind a retailer's marketing title, and not its tester", () => {
    expect(uniqueCatalogueHandle(HUMUSS, "Humuss Beauty", RETAILER)).toBe("sun-sational-spf-50-sunscreen");
    expect(uniqueCatalogueHandle(HUMUSS, "Humuss", RETAILER)).toBe("sun-sational-spf-50-sunscreen");
  });
  it("finds nothing for another SPF, another form, or a sample the shopper did not name", () => {
    expect(uniqueCatalogueHandle(HUMUSS, "Humuss Beauty", RETAILER.replace("SPF 50", "SPF 30"))).toBeNull();
    expect(uniqueCatalogueHandle(HUMUSS, "Humuss Beauty", "Humuss Beauty Sunscreen SPF 50 Hyaluronic Acid Tinted")).toBeNull();
    expect(uniqueCatalogueHandle(HUMUSS.filter((p) => !p.handle.endsWith("-sunscreen")), "Humuss Beauty", RETAILER)).toBeNull(); // only the tester is left
  });
  it("finds nothing when the name shares too little with any product", () => {
    expect(uniqueCatalogueHandle(HUMUSS, "Humuss Beauty", "Humuss Beauty Hyaluronic Acid Face Serum")).toBeNull();
    expect(uniqueCatalogueHandle(HUMUSS, "Humuss Beauty", "")).toBeNull();
  });
  it("finds nothing when a rival is nearly as good a match, rather than guessing between them", () => {
    const rivals: CatalogueProduct[] = [
      { handle: "sun-a", title: "Sun-sational - SPF 50 Hyaluronic Acid Sunscreen" },
      { handle: "sun-b", title: "Sun-glow - SPF 50 Hyaluronic Acid Sunscreen" },
    ];
    expect(uniqueCatalogueHandle(rivals, "Humuss Beauty", RETAILER)).toBeNull();
  });
  it("keeps a product whose rival has a word the shopper did not use (a gel is not the cream)", () => {
    const two: CatalogueProduct[] = [
      { handle: "plain", title: "Shield - SPF 50 Hyaluronic Acid Sunscreen" },
      { handle: "gel", title: "Shield Aqua Gel - SPF 50 Hyaluronic Acid Sunscreen Gel" },
    ];
    expect(uniqueCatalogueHandle(two, "Brand", "Brand Shield SPF 50 Hyaluronic Acid Sunscreen")).toBe("plain");
  });
});

describe("catalogueConfirmsPage", () => {
  const load = async () => HUMUSS;
  it("confirms the one product's own page and no other page of the store", async () => {
    expect(await catalogueConfirmsPage("https://humussbeauty.com/products/sun-sational-spf-50-sunscreen", "Humuss Beauty", RETAILER, load)).toBe(true);
    expect(await catalogueConfirmsPage("https://humussbeauty.com/products/sun-sational-spf-50-sunscreen?variant=1", "Humuss Beauty", RETAILER, load)).toBe(true);
    expect(await catalogueConfirmsPage("https://humussbeauty.com/products/sun-sational-spf-50-hyaluronic-acid-sunscreen-tester", "Humuss Beauty", RETAILER, load)).toBe(false);
    expect(await catalogueConfirmsPage("https://humussbeauty.com/products/berry-breeze-face-wash", "Humuss Beauty", RETAILER, load)).toBe(false);
  });
  it("confirms nothing for a page that is not a product page, or when the catalogue could not be read", async () => {
    expect(await catalogueConfirmsPage("https://humussbeauty.com/pages/about", "Humuss Beauty", RETAILER, load)).toBe(false);
    expect(await catalogueConfirmsPage("https://humussbeauty.com/products/sun-sational-spf-50-sunscreen", "Humuss Beauty", RETAILER, async () => null)).toBe(false);
    expect(await catalogueConfirmsPage("https://humussbeauty.com/products/sun-sational-spf-50-sunscreen", "Humuss Beauty", RETAILER, async () => [])).toBe(false);
  });
});

describe("fetchShopifyCatalogue", () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => { globalThis.fetch = originalFetch; });
  const products = (n: number, from = 0) => Array.from({ length: n }, (_, i) => ({ title: `Product ${from + i}`, handle: `p-${from + i}` }));
  const answer = (pages: unknown[]) => { let i = 0; globalThis.fetch = vi.fn(async () => ({ ok: true, json: async () => pages[i++] })) as unknown as typeof fetch; };

  it("reads the store's own feed over https and returns every product of a catalogue that fits in one page", async () => {
    answer([{ products: products(20) }]);
    const all = await fetchShopifyCatalogue("https://humussbeauty.com/products/sun-sational-spf-50-sunscreen");
    expect(all).toHaveLength(20);
    expect(vi.mocked(globalThis.fetch).mock.calls[0][0]).toBe("https://humussbeauty.com/products.json?limit=250&page=1");
  });
  it("follows a catalogue across pages, and claims nothing for one it could not read in full", async () => {
    answer([{ products: products(250) }, { products: products(10, 250) }]);
    expect(await fetchShopifyCatalogue("https://shop.example.com/products/x")).toHaveLength(260);
    answer([{ products: products(250) }, { products: products(250, 250) }, { products: products(250, 500) }]);
    expect(await fetchShopifyCatalogue("https://shop.example.com/products/x")).toBeNull();
  });
  it("gives nothing for a store with no feed, a feed that is not a product list, a failed request or a non-https address", async () => {
    globalThis.fetch = vi.fn(async () => ({ ok: false, json: async () => ({}) })) as unknown as typeof fetch;
    expect(await fetchShopifyCatalogue("https://shop.example.com/products/x")).toBeNull();
    answer([{ nope: true }]);
    expect(await fetchShopifyCatalogue("https://shop.example.com/products/x")).toBeNull();
    globalThis.fetch = vi.fn(async () => { throw new Error("offline"); }) as unknown as typeof fetch;
    expect(await fetchShopifyCatalogue("https://shop.example.com/products/x")).toBeNull();
    answer([{ products: products(3) }]);
    expect(await fetchShopifyCatalogue("http://shop.example.com/products/x")).toBeNull();
    expect(vi.mocked(globalThis.fetch).mock.calls.length).toBe(0);
  });
});
