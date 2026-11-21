import { describe, expect, it, vi } from "vitest";
import { findBrandInci, isBrandIngredientUrl, isPrimaryIngredientUrl } from "./brand-inci";
import type { PageINCI } from "./inci-from-page";
import { databaseProductUrl, isDatabaseProductUrl, readDatabaseMarkdown, readDatabasePage, unlinkMarkdown } from "./database-inci";
import { databaseNameForHost } from "./database-pages";
import { sourceName } from "./analyser-x/copy";

vi.mock("./scrape", async (orig) => ({ ...(await orig<typeof import("./scrape")>()), fetchPageMarkdown: vi.fn().mockResolvedValue(null) }));

/* 2026-11-21, owner rule: "any ingredient database that has the ingredients must always be accepted. Like skinsort or skincarisma". A database's list is taken when
   the brand's page, INKEE Decoder and Nykaa give none, and ahead of another retailer's. */

// Fixderma Dewrav Acne Control & Oil Free Face Moisturizer as SkinSort prints it: a line of links after "Show all 31 ingredients" (read live, 2026-11-21; shortened).
const SKINSORT_URL = "https://skinsort.com/products/fixderma-skincare/dewrav-acne-control-oil-free-face-moisturizer";
const LIST = ["Propanediol", "Niacinamide", "Water", "Salix Nigra Bark Extract", "Glycolic Acid", "Glycerin", "Sodium Benzoate", "Potassium Sorbate", "Tocopheryl Acetate",
  "Ceramide NP", "Cholesterol", "Carbomer", "Xanthan Gum", "Phenoxyethanol", "Ethylhexylglycerin"];
const SKINSORT_MD = [
  "# Fixderma Skincare Dewrav Acne Control & Oil Free Face Moisturizer",
  "",
  "## Ingredients list",
  "",
  "[1 Propanediol Solvent ![Image 84: Helps hydrate](https://assets.skinsort.com/x.svg)](https://skinsort.com/ingredients/propanediol)",
  "",
  "Show all 31 ingredients",
  "",
  LIST.map((x) => `[${x}](https://skinsort.com/ingredients/${x.toLowerCase().replace(/\s+/g, "-")})`).join(", "),
  "",
  "Copy",
].join("\n");
const QUERY = "Fixderma Dewrav Acne Control & Oil Free Face Moisturizer with Glycolic Acid";
const BRAND = "Fixderma";

describe("ingredient database product pages", () => {
  it.each([
    SKINSORT_URL,
    "https://www.skincarisma.com/products/fixderma-skincare/dewrav-acne-control-oil-free-face-moisturizer",
    "https://www.cosdna.com/eng/cosmetic_3b2e11631.html",
    "https://www.ewg.org/skindeep/products/1234567-some_hand_cream/",
  ])("recognises %s", (u) => expect(isDatabaseProductUrl(u)).toBe(true));

  it.each([
    "https://skinsort.com/compare/fixderma-a-vs-plum-b",
    "https://skinsort.com/products/fixderma-skincare-moisturizers",
    "https://skinsort.com/ingredients/niacinamide",
    "https://www.skincarisma.com/comparisons/a--vs--b",
    "http://skinsort.com/products/a/b",
    "https://example.com/products/a/b",
  ])("does not take %s for a product page", (u) => expect(isDatabaseProductUrl(u)).toBe(false));

  it("records the page without its query or fragment", () => {
    expect(databaseProductUrl(`${SKINSORT_URL}?ref=1#ingredients_list`)).toBe(SKINSORT_URL);
  });

  it("reads SkinSort's list of links as the names it shows, with its quote", () => {
    expect(unlinkMarkdown("[Water](https://x/water), [Glycerin](https://x/g)")).toBe("Water, Glycerin");
    const got = readDatabaseMarkdown(SKINSORT_MD, SKINSORT_URL, "SkinSort");
    expect(got?.ingredients).toEqual(LIST);
    expect(got).toMatchObject({ source: SKINSORT_URL, origin: "database", trust: 3, siteName: "SkinSort" });
    expect(got?.quote).toContain("Propanediol, Niacinamide, Water");
    expect(got?.pageTitles?.[0]).toBe("Fixderma Skincare Dewrav Acne Control & Oil Free Face Moisturizer");
  });

  it("renders the page only when the plain read found no list and a render is allowed", async () => {
    const readRendered = vi.fn().mockResolvedValue(SKINSORT_MD);
    expect(await readDatabasePage(SKINSORT_URL, true, { read: async () => null, readRendered })).toMatchObject({ origin: "database" });
    expect(await readDatabasePage(SKINSORT_URL, false, { read: async () => null, readRendered })).toBeNull();
    expect(readRendered).toHaveBeenCalledTimes(1);
  });

  it("refuses text the reference does not recognise as ingredients, and an address that is not a product page", async () => {
    const junk = "## Ingredients list\n\nAlpha Arbutin & Niacinamide Brightening Cream, Face & Neck Cream for Hyperpigmentation, Elbows, Knees & Underarms, Skin Tone Corrector, Best Sellers";
    expect(readDatabaseMarkdown(junk, SKINSORT_URL, "SkinSort")).toBeNull();
    expect(await readDatabasePage("https://skinsort.com/ingredients/niacinamide", true, { read: async () => SKINSORT_MD })).toBeNull();
  });

  it("names the database on the page, and counts it as a source an analysis can be saved from", () => {
    expect(sourceName(SKINSORT_URL)).toBe("SkinSort");
    expect(databaseNameForHost("www.skincarisma.com")).toBe("Skincarisma");
    expect(isPrimaryIngredientUrl(SKINSORT_URL, BRAND)).toBe(true);
    expect(isPrimaryIngredientUrl("https://skinsort.com/compare/a-vs-b", BRAND)).toBe(false);
  });
});

describe("the lookup takes a database list after the brand's page, Decoder and Nykaa, and before another retailer's", () => {
  const dbPage = readDatabaseMarkdown(SKINSORT_MD, SKINSORT_URL, "SkinSort")!;
  const base = { search: async () => [] as string[], read: async () => null };

  it("takes the database's list when no other source gives one", async () => {
    const found = await findBrandInci(QUERY, BRAND, undefined, { ...base, searchDatabases: async () => [SKINSORT_URL], readDatabase: async () => dbPage });
    expect(found).toMatchObject({ source: SKINSORT_URL, origin: "database" });
  });

  it("never wins over the brand's own page", async () => {
    const brandUrl = "https://www.fixderma.com/products/dewrav-acne-control-oil-free-face-moisturizer";
    const other = ["Water", "Glycerin", "Niacinamide", "Glycolic Acid", "Phenoxyethanol", "Xanthan Gum"];
    const brandPage: PageINCI = { ingredients: other, source: brandUrl, quote: other.join(", "), pageTitles: ["Dewrav Acne Control & Oil Free Face Moisturizer with Glycolic Acid | Fixderma"] };
    const found = await findBrandInci(QUERY, BRAND, undefined, { search: async () => [brandUrl], read: async (u) => (u === brandUrl ? brandPage : null), searchDatabases: async () => [SKINSORT_URL], readDatabase: async () => dbPage });
    expect(found?.source).toBe(brandUrl);
    expect(found?.alternatives).toBeUndefined();
  });

  it("wins over another retailer's list", async () => {
    const amazon = "https://www.amazon.in/dp/B0ABCDEFGH";
    const retailerPage: PageINCI = { ...dbPage, source: amazon, origin: "retailer", pageTitles: ["Fixderma Dewrav Acne Control & Oil Free Face Moisturizer : Amazon.in"] };
    const found = await findBrandInci(QUERY, BRAND, undefined, { ...base, searchRetailers: async () => [amazon], readRetailer: async () => retailerPage, searchDatabases: async () => [SKINSORT_URL], readDatabase: async () => dbPage });
    expect(found?.origin).toBe("database");
  });

  it("returns the database list in time when the last looks are slow, instead of overrunning the engine's wait", async () => {
    vi.useFakeTimers();
    try {
      const askModel = vi.fn(() => new Promise<string[]>(() => {})); // never answers
      const pending = findBrandInci(QUERY, BRAND, undefined, { ...base, askModel, searchDatabases: async () => [SKINSORT_URL], readDatabase: async () => dbPage });
      await vi.advanceTimersByTimeAsync(37_000);
      expect(await pending).toMatchObject({ origin: "database" });
      expect(askModel).toHaveBeenCalled();
    } finally { vi.useRealTimers(); }
  });

  it("refuses a database page whose title names another brand", async () => {
    const found = await findBrandInci(QUERY, BRAND, undefined, { ...base, searchDatabases: async () => [SKINSORT_URL], readDatabase: async () => ({ ...dbPage, pageTitles: ["Plum Dewrav Acne Control & Oil Free Face Moisturizer"] }) });
    expect(found).toBeNull();
  });
});

describe("a brand's regional or shop subdomain is its own site", () => {
  it.each([
    ["https://us.thebodyshop.com/products/frosted-cranberry-mint-leaves-hand-cream", "The Body Shop"],
    ["https://shop.minimalist.co/products/x", "Minimalist"],
    ["https://www.thebodyshop.in/hand-cream/p/1", "The Body Shop"],
  ])("counts %s", (u, b) => expect(isBrandIngredientUrl(u, b)).toBe(true));

  it.each([
    ["https://blog.thebodyshop.com/post", "The Body Shop"],
    ["https://us.othersite.com/products/x", "The Body Shop"],
    ["https://thebodyshop.example.com/products/x", "The Body Shop"],
  ])("does not count %s", (u, b) => expect(isBrandIngredientUrl(u, b)).toBe(false));
});
