import { describe, expect, it, vi } from "vitest";
import { findBrandInci, isPrimaryIngredientUrl } from "./brand-inci";
import type { PageINCI } from "./inci-from-page";
import { isRetailerProductUrl, readRetailerPage, retailerListLooksLikeInci, retailerProductUrl, withoutLeadIn } from "./retailer-inci";
import { retailerNameForHost } from "./retailer-pages";
import { sourceName } from "./analyser-x/copy";

vi.mock("./scrape", async (orig) => ({ ...(await orig<typeof import("./scrape")>()), fetchPageMarkdown: vi.fn().mockResolvedValue(null) }));

/* 2026-11-19, owner decision "Allow retailer lists": another retailer's product page supplies a list only when the brand's page, INKEE Decoder and Nykaa give none. */

// Minimalist SPF 50's list as Amazon prints it (read live, 2026-11-19).
const AMAZON_LIST = ["Aqua", "Octocrylene", "Diisopropyl Adipate", "Propylene Glycol Dicaprylate/Dicaprate", "C12-15 Alkyl Benzoate", "Diisopropyl Sebacate",
  "Butyl Methoxydibenzoylmethane", "Isododecane", "Niacinamide", "Arachidyl Alcohol", "Behenyl Alcohol", "Arachidyl Glucoside", "Caprylic/Capric Triglyceride",
  "Titanium Dioxide", "Ethylhexyl Triazone", "PEG-100 Stearate", "Glyceryl Stearate", "Butylene Glycol", "Linoleic Acid", "Panthenol", "Sodium Hyaluronate",
  "Allantoin", "Tocopheryl Acetate", "Polysorbate 20", "Xanthan Gum", "Silica", "Phenoxyethanol", "Ethylhexylglycerin"];
// What the reader once took for a list on Aqueria's Amazon page: other products' names from the page (2026-11-19).
const AQUERIA_JUNK = ["Alpha Arbutin & Niacinamide Brightening Cream", "Face & Neck Cream for Hyperpigmentation", "Elbows", "Knees & Underarms", "Skin Tone Corrector"];

const QUERY = "Minimalist Multi Vitamin SPF 50 Sunscreen";
const BRAND = "Minimalist";
const AMAZON = "https://www.amazon.in/Minimalist-Sunscreen-Multi-Vitamins-Cream/dp/B09FPS9D5T?ref_=xyz&th=1";
const AMAZON_CLEAN = "https://www.amazon.in/dp/B09FPS9D5T";
const page = (over: Partial<PageINCI> = {}): PageINCI => ({
  ingredients: AMAZON_LIST, source: AMAZON_CLEAN, quote: AMAZON_LIST.join(", "), pageTitles: ["Minimalist Multi Vitamin SPF 50 Sunscreen Cream : Amazon.in: Beauty"], ...over,
});

describe("retailer product pages", () => {
  it("knows each retailer's product page, and not its search, brand or category pages", () => {
    for (const u of [
      AMAZON, "https://www.amazon.in/gp/product/B09FPS9D5T",
      "https://www.flipkart.com/humuss-beauty-sunscreen-spf-50/p/itm933882e3d15f1?pid=SNRHHN2B9FUENQRF",
      "https://www.purplle.com/product/good-vibes-shea-butter-deep-moisturizing-body-lotion",
      "https://www.tirabeauty.com/product/plum-2-niacinamide-sunscreen-8850340",
      "https://www.myntra.com/face-wash/minimalist/minimalist-salicylic-face-wash/25034678/buy",
      "https://www.meesho.com/minimalist-sunscreen/p/4x1y2z",
      "https://www.foyforyou.com/p/minimalist-alpha-arbutin-02-face-serum/FOY001135",
      "https://www.1mg.com/otc/moiz-syndet-bar-soap-otc867982",
    ]) expect(isRetailerProductUrl(u), u).toBe(true);
    for (const u of [
      "https://www.amazon.in/s?k=minimalist", "https://www.flipkart.com/search?q=minimalist", "https://www.tirabeauty.com/brand/minimalist",
      "https://www.myntra.com/minimalist-sunscreen", "https://www.foyforyou.com/brand/minimalist", "https://www.foyforyou.com/search?q=minimalist", "https://www.nykaa.com/minimalist-spf/p/2812174", "http://www.amazon.in/dp/B09FPS9D5T", "https://beminimalist.co/products/spf-50",
    ]) expect(isRetailerProductUrl(u), u).toBe(false);
  });

  it("records the page without its tracking, and an Amazon page as its /dp/ address", () => {
    expect(retailerProductUrl(AMAZON)).toBe(AMAZON_CLEAN);
    expect(retailerProductUrl("https://www.flipkart.com/x-y/p/itm1a2b?pid=1&lid=2")).toBe("https://www.flipkart.com/x-y/p/itm1a2b");
  });

  it("refuses text that is not an ingredient list, and takes a real one", () => {
    expect(retailerListLooksLikeInci(AQUERIA_JUNK)).toBe(false);
    expect(retailerListLooksLikeInci(AMAZON_LIST)).toBe(true);
    expect(retailerListLooksLikeInci(AMAZON_LIST.slice(0, 4))).toBe(false); // too short to be a whole list
  });

  it("reads plainly first, renders only when allowed and the plain read gave no list, and marks the list as a retailer's", async () => {
    const read = vi.fn().mockResolvedValue(null);
    const readRendered = vi.fn().mockResolvedValue(page());
    const got = await readRetailerPage(AMAZON, true, { read, readRendered });
    expect(read).toHaveBeenCalledWith(AMAZON_CLEAN);
    expect(readRendered).toHaveBeenCalledWith(AMAZON_CLEAN);
    expect(got).toMatchObject({ source: AMAZON_CLEAN, origin: "retailer", trust: 3, siteName: "Amazon" });

    const noRender = vi.fn();
    expect(await readRetailerPage(AMAZON, false, { read, readRendered: noRender })).toBeNull();
    expect(noRender).not.toHaveBeenCalled();
    // A plain read that gave junk is not the answer: the rendered page is tried.
    expect(await readRetailerPage(AMAZON, true, { read: async () => page({ ingredients: AQUERIA_JUNK }), readRendered })).toMatchObject({ origin: "retailer" });
    expect(await readRetailerPage(AMAZON, true, { read: async () => page({ ingredients: AQUERIA_JUNK }), readRendered: async () => null })).toBeNull();
    expect(await readRetailerPage("https://www.amazon.in/s?k=minimalist", true, { read, readRendered })).toBeNull();
  });

  it("drops a lead-in glued to the first entry (FOY prints \"Made with Aqua, ...\")", () => {
    expect(withoutLeadIn(["Made with Aqua", "Glycerin"])).toEqual(["Aqua", "Glycerin"]);
    expect(withoutLeadIn(["Ingredients: Water", "Glycerin"])).toEqual(["Water", "Glycerin"]);
    expect(withoutLeadIn(["Aqua", "Made with love"])).toEqual(["Aqua", "Made with love"]); // only the first entry
  });

  it("names the retailer on the page, not its address", () => {
    expect(sourceName(AMAZON_CLEAN)).toBe("Amazon");
    expect(sourceName("https://www.flipkart.com/x/p/itm1")).toBe("Flipkart");
    expect(retailerNameForHost("www.1mg.com")).toBe("1mg");
    expect(sourceName("https://www.foyforyou.com/p/minimalist-alpha-arbutin-02-face-serum/FOY001135")).toBe("FOY");
    expect(sourceName("https://www.nykaa.com/x/p/1")).toBe("Nykaa");
  });

  it("counts as a source the analysis can be saved from", () => {
    expect(isPrimaryIngredientUrl(AMAZON_CLEAN, BRAND)).toBe(true);
    expect(isPrimaryIngredientUrl("https://www.amazon.in/s?k=minimalist", BRAND)).toBe(false);
  });
});

describe("the lookup uses a retailer list only as a last resort", () => {
  const retailerPage = { ...page(), origin: "retailer" as const, trust: 3 as const };
  const base = { search: async () => [] as string[], read: async () => null };

  it("takes the retailer's list when no other source gives one, read from the pasted page", async () => {
    const readRetailer = vi.fn().mockResolvedValue(retailerPage);
    const found = await findBrandInci(QUERY, BRAND, AMAZON, { ...base, readRetailer });
    expect(readRetailer).toHaveBeenCalledWith(AMAZON_CLEAN, true);
    expect(found).toMatchObject({ source: AMAZON_CLEAN, origin: "retailer" });
  });

  it("finds retailer pages by search when none was pasted", async () => {
    const found = await findBrandInci(QUERY, BRAND, undefined, { ...base, searchRetailers: async () => [AMAZON_CLEAN], readRetailer: async () => retailerPage });
    expect(found?.origin).toBe("retailer");
  });

  it("never wins over a brand page, Decoder or Nykaa list, and is not recorded as an alternative to one", async () => {
    const brandUrl = "https://beminimalist.co/products/multi-vitamin-spf-50";
    const other = ["Water", "Glycerin", "Niacinamide", "Zinc Oxide", "Phenoxyethanol", "Xanthan Gum"];
    const brandPage: PageINCI = { ingredients: other, source: brandUrl, quote: other.join(", "), pageTitles: ["Minimalist Multi Vitamin SPF 50 Sunscreen"] };
    const found = await findBrandInci(QUERY, BRAND, AMAZON, { search: async () => [brandUrl], read: async (u) => (u === brandUrl ? brandPage : null), readRetailer: async () => retailerPage });
    expect(found?.source).toBe(brandUrl);
    expect(found?.alternatives).toBeUndefined();
  });

  it("refuses a retailer page whose title does not name the brand", async () => {
    const found = await findBrandInci(QUERY, BRAND, AMAZON, { ...base, readRetailer: async () => ({ ...retailerPage, pageTitles: ["Multi Vitamin SPF 50 Sunscreen by Another Label"] }) });
    expect(found).toBeNull();
  });

  it("renders at most one retailer page a lookup", async () => {
    const urls = ["https://www.flipkart.com/minimalist-spf-50/p/itm1", "https://www.purplle.com/product/minimalist-spf-50"];
    const readRetailer = vi.fn().mockResolvedValue(null);
    await findBrandInci(QUERY, BRAND, undefined, { ...base, searchRetailers: async () => urls, readRetailer });
    expect(readRetailer.mock.calls.filter(([, mayRender]) => mayRender)).toHaveLength(1);
  });
});
