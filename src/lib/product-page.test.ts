import { describe, expect, it, vi } from "vitest";
import { fetchProductPage, looksBlocked } from "./product-page";
import { retailerProductSlug } from "./retailer-pages";
import { titleFromMarkdown } from "./scrape";

/* Real links and what the free reader returned for them, 2026-11-19. */
const L = {
  amazon: "https://www.amazon.in/Minimalist-Sunscreen-Multi-Vitamins-Cream/dp/B09FPS9D5T",
  amazonBare: "https://www.amazon.in/dp/B09FPS9D5T",
  flipkart: "https://www.flipkart.com/humuss-beauty-sunscreen-spf-50-pa-lightweight-d-tan-hyaluronic-acid-vitamin-e-in-vitro-tested/p/itm933882e3d15f1?pid=SNRHHN2B9FUENQRF&marketplace=FLIPKART",
  myntra: "https://www.myntra.com/face-wash-and-cleanser/cetaphil/cetaphil-gentle-skin-cleanser-with--pro-vitamin-b5--b3---118-ml/16712624/buy",
  meesho: "https://www.meesho.com/minimalist-spf-50-pa-face-sunscreen-broad-spectrum-lightweight-no-white-cast-cream-sunscreen-50gm/p/bjugad",
  tira: "https://www.tirabeauty.com/product/plum-2-niacinamide-sunscreen-rice-water-spf-50-pa-sunscreen-30-g-8850340",
  foy: "https://www.foyforyou.com/p/minimalist-alpha-arbutin-02-face-serum/FOY001135",
  purplle: "https://www.purplle.com/product/minimalist-spf-50-sunscreen-with-niacinamide-vitamin-b5-vitamin-f-broad-spectrum-pa-for-all-skin-types-50g",
  oneMg: "https://www.1mg.com/otc/moiz-syndet-bar-soap-otc867982",
};
const body = "x ".repeat(2000);
const page = (title: string) => `Title: ${title}\n\nURL Source: ...\n\nMarkdown Content:\n${body}`;

describe("the product's name in a retailer's link", () => {
  it("is read from each retailer's own place in the address", () => {
    expect(retailerProductSlug(L.amazon)).toBe("Minimalist Sunscreen Multi Vitamins Cream");
    expect(retailerProductSlug(L.amazonBare)).toBeNull(); // the ASIN names no product
    expect(retailerProductSlug(L.flipkart)).toBe("humuss beauty sunscreen spf 50 pa lightweight d tan hyaluronic acid vitamin e in vitro tested");
    // Myntra: /<category>/<brand>/<name>/<id>/buy, not the category "face wash and cleanser".
    expect(retailerProductSlug(L.myntra)).toBe("cetaphil gentle skin cleanser with pro vitamin b5 b3 118 ml");
    expect(retailerProductSlug(L.meesho)).toMatch(/^minimalist spf 50 pa face sunscreen/);
    expect(retailerProductSlug(L.tira)).toBe("plum 2 niacinamide sunscreen rice water spf 50 pa sunscreen 30 g");
    expect(retailerProductSlug(L.foy)).toBe("minimalist alpha arbutin 02 face serum");
    expect(retailerProductSlug(L.oneMg)).toBe("moiz syndet bar soap");
    expect(retailerProductSlug("https://beminimalist.co/products/spf-50")).toBeNull(); // not a retailer
  });
});

describe("a block page is not the product page", () => {
  it("refuses the block, error and home pages the reader was sent", () => {
    for (const [url, title] of [
      [L.amazon, "Amazon.in"], [L.flipkart, "Online Shopping India | Buy Mobiles, Electronics, Appliances, Clothing and More Online at Flipkart.com"],
      [L.myntra, "Site Maintenance"], [L.meesho, "Access Denied"], [L.amazonBare, "Robot Check"], [L.tira, "Just a moment..."],
    ]) expect(looksBlocked(page(title), title, url), title).toBe(true);
    expect(looksBlocked(`Title: Moiz\n\n${"y".repeat(330)}`, "Moiz Syndet Bar Soap", L.oneMg)).toBe(true); // 1mg sent 354 characters
  });

  it("refuses a retailer page whose title shares no word with the product named in its link", () => {
    expect(looksBlocked(page("Top Offers On Electronics"), "Top Offers On Electronics", L.flipkart)).toBe(true);
  });

  it("takes the real product pages", () => {
    for (const [url, title] of [
      [L.foy, "Minimalist Alpha Arbutin 02% Face Serum — FOY"],
      [L.tira, "Buy Plum SPF 50 PA++++ Sunscreen with 2% Niacinamide, In-Vivo & In Vitro Tested, No White Cast (30g) Online"],
      [L.myntra, "Buy Cetaphil Gentle Skin Cleanser With & Pro Vitamin B5 & B3   118 Ml  - Face Wash And Cleanser for Unisex"],
      [L.amazonBare, "Minimalist Cream Sunscreen SPF 50 Broad Spectrum PA++++"],
      ["https://beminimalist.co/products/multi-vitamin-spf-50", "Multi Vitamin SPF 50 | Minimalist"],
    ]) expect(looksBlocked(page(title), title, url), title).toBe(false);
  });
});

describe("reading the pasted page", () => {
  it("keeps the free read when it is the product", async () => {
    const rendered = vi.fn();
    const got = await fetchProductPage(L.foy, { plain: async () => page("Minimalist Alpha Arbutin 02% Face Serum — FOY"), rendered });
    expect(got?.via).toBe("reader");
    expect(rendered).not.toHaveBeenCalled();
  });

  it("reads a blocked page again in a browser, in the reader's format", async () => {
    const got = await fetchProductPage(L.meesho, { plain: async () => page("Access Denied"), rendered: async () => ({ markdown: body, title: "Minimalist SPF 50 PA ++++ Face Sunscreen | Broad Spectrum" }) });
    expect(got?.via).toBe("rendered");
    expect(titleFromMarkdown(got!.markdown)).toBe("Minimalist SPF 50 PA ++++ Face Sunscreen");
  });

  it("gives no page when the browser is blocked too, or unavailable", async () => {
    expect(await fetchProductPage(L.myntra, { plain: async () => page("Site Maintenance"), rendered: async () => ({ markdown: body, title: "Site Maintenance" }) })).toBeNull();
    expect(await fetchProductPage(L.myntra, { plain: async () => null, rendered: async () => null })).toBeNull();
  });

  it("reads a title written in styled letters as plain text", () => {
    expect(titleFromMarkdown("Title: Moiz Syndet Bar Soap: Buy packet of 75.0 gm Soap at 𝗯𝗲𝘀𝘁 𝗽𝗿𝗶𝗰𝗲 in India | 1mg")).toBe("Moiz Syndet Bar Soap: Buy packet of 75.0 gm Soap");
  });
});
