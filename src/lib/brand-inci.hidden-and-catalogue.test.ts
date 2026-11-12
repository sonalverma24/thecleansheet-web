import { describe, expect, it, vi } from "vitest";
import { brandsOwnName, findBrandInci } from "./brand-inci";
import { catalogueProductUrl } from "./brand-catalogue";
import { fetchInciFromRenderedPage, INGREDIENT_TAB_ACTIONS, readMarkdownList, unescapeMarkdown } from "./inci-from-page";
import { validateReplacement, type RerunRow } from "../../scripts/approved-rerun-policy";
import { makeReview } from "./review.fixtures";
import { makeInciEvidence } from "./review-verifier";

vi.mock("./scrape", async (orig) => ({ ...(await orig<typeof import("./scrape")>()), fetchPageMarkdown: vi.fn().mockResolvedValue(null) }));

/* 2026-11-12: Estée Lauder Double Wear Stay-in-Place Longwear Matte Foundation. The brand's page prints its list only in an "Ingredients" panel that loads when the tab
   is clicked: a plain fetch and the Jina reader see no list, so the analysis stayed grey. Trimmed from the page as a browser shows it once the tab is open (the
   renderer's markdown, escapes kept). */
const EL_URL = "https://www.esteelauder.com/product/643/141225/product-catalog/makeup/face/foundation/double-wear/stay-in-place-longwear-matte-foundation";
const EL_RENDERED = `# Double Wear Stay-in-Place Longwear Matte Foundation

- **Brown Algae Extract:** Helps reduce oil production over time.

## Ingredients

Ingredients: Water\\\\Aqua\\\\Eau, Methyl Trimethicone, Dimethicone, Trimethylsiloxysilicate, Niacinamide, Peg-10 Dimethicone, Glycerin, Peg-9 Polydimethylsiloxyethyl Dimethicone, Sodium Chloride, Titanium Dioxide, Silica, Sodium Hyaluronate, Laminaria Saccharina Extract, Lactobacillus Ferment, Butylene Glycol, Triethyl Citrate, Alumina, Disteardimonium Hectorite, Dimethicone/Peg-10/15 Crosspolymer, Triethoxycaprylylsilane, Tocopheryl Acetate, Resveratrol, Sodium Citrate, Phenoxyethanol, Chlorphenesin, Sorbic Acid, Potassium Sorbate, \\[+/- Mica, Titanium Dioxide (Ci 77891), Iron Oxides (Ci 77491), Iron Oxides (Ci 77492), Iron Oxides (Ci 77499)\\]  <ILN53323>

# Double WearStay-in-Place Longwear Matte Foundation`;
const EL_NAME = "Estée Lauder Double Wear Stay-in-Place Longwear Matte Foundation";

describe("a list behind an Ingredients tab", () => {
  it("reads the page's own characters, not the reader's escapes: Water\\Aqua\\Eau is one entry", () => {
    expect(unescapeMarkdown("Water\\\\Aqua\\\\Eau, \\[+/- Mica")).toBe("Water\\Aqua\\Eau, [+/- Mica");
    const ex = readMarkdownList(EL_RENDERED);
    expect(ex?.ingredients[0]).toBe("Water/Aqua/Eau");
    expect(ex?.ingredients).toContain("Niacinamide");
    expect(ex?.ingredients.at(-1)).toBe("Potassium Sorbate");
    expect(ex?.quote).toMatch(/^Water\\Aqua\\Eau, Methyl Trimethicone/);
  });

  it("opens the tab in a browser and reads the opened panel, with the page's title", async () => {
    const render = vi.fn().mockResolvedValue({ markdown: EL_RENDERED, title: "Double Wear Stay-in-Place Longwear Matte Foundation | Estée Lauder" });
    const page = await fetchInciFromRenderedPage(EL_URL, render);
    expect(render).toHaveBeenCalledWith(EL_URL, INGREDIENT_TAB_ACTIONS, expect.any(Number));
    expect(page?.ingredients.length).toBe(27);
    expect(page?.pageTitles?.[0]).toBe("Double Wear Stay-in-Place Longwear Matte Foundation | Estée Lauder");
  });

  it("the tab script clicks only the panel's own control, never a link to another page", () => {
    const script = (INGREDIENT_TAB_ACTIONS.find((a) => a.type === "executeJavascript") as { script: string }).script;
    expect(script).toContain("charAt(0)!=='#'");
    expect(script).toMatch(/closest\('button,summary/);
  });

  it("is used by the lookup only after the plain read of the brand's page found no list", async () => {
    const listed = await fetchInciFromRenderedPage(EL_URL, async () => ({ markdown: EL_RENDERED, title: "Double Wear Stay-in-Place Longwear Matte Foundation | Estée Lauder" }));
    const read = vi.fn().mockResolvedValue(null);
    const readRendered = vi.fn().mockResolvedValue(listed);
    const found = await findBrandInci(EL_NAME, "Estée Lauder", undefined, { search: async () => [EL_URL], read, readRendered });
    expect(read).toHaveBeenCalledWith(EL_URL);
    expect(readRendered).toHaveBeenCalledWith(EL_URL);
    expect(found?.source).toBe(EL_URL);
    expect(found?.origin).toBe("brand-page");
    expect(found?.identity).toBeUndefined(); // the title names the product
  });

  it("is not used when the plain read already found the list", async () => {
    const readRendered = vi.fn();
    const plain = { source: EL_URL, ingredients: ["Water", "Glycerin", "Niacinamide", "Dimethicone", "Silica"], quote: "Water, Glycerin, Niacinamide, Dimethicone, Silica", pageTitles: [EL_NAME] };
    await findBrandInci(EL_NAME, "Estée Lauder", undefined, { search: async () => [EL_URL], read: async () => plain, readRendered });
    expect(readRendered).not.toHaveBeenCalled();
  });

  it("does not render a page of another product the search also found, and renders at most two pages", async () => {
    const readRendered = vi.fn().mockResolvedValue(null);
    const urls = [
      "https://www.esteelauder.com/product/643/1/advanced-night-repair-serum",
      "https://www.esteelauder.com/product/643/2/double-wear-stay-in-place-foundation-original",
      "https://www.esteelauder.com/product/643/3/double-wear-matte-powder-foundation",
      "https://www.esteelauder.com/product/643/4/double-wear-longwear-matte-foundation-mini",
    ];
    await findBrandInci(EL_NAME, "Estée Lauder", undefined, { search: async () => urls, read: async () => null, readRendered });
    expect(readRendered).toHaveBeenCalledTimes(2);
    expect(readRendered).not.toHaveBeenCalledWith(urls[0]);
  });
});

/* A brand that names its product differently from the retailer (Foxtale's "Super Glow Moisturizer" sold as "Brightening Moisturiser with Vitamin C & Niacinamide"). */
const FOX_QUERY = "Foxtale Brightening Moisturiser with Vitamin C & Niacinamide";
const FOX_PAGE = "https://foxtale.in/products/super-glow-moisturizer";
const FOX_LIST = { source: FOX_PAGE, ingredients: ["Aqua", "Glycerin", "Niacinamide", "Propanediol", "Cetyl Alcohol", "Ascorbyl Glucoside"], quote: "Aqua, Glycerin, Niacinamide, Propanediol, Cetyl Alcohol, Ascorbyl Glucoside", pageTitles: ["Super Glow Moisturizer With Niacinamide & Vitamin C | Foxtale"] };

describe("the brand's catalogue finds and names a product the brand names differently", () => {
  it("finds the product's page in the catalogue when the search only reached the brand's site, and marks it as the brand's name", async () => {
    const findInCatalogue = vi.fn().mockResolvedValue(FOX_PAGE);
    const read = vi.fn(async (u: string) => (u === FOX_PAGE ? FOX_LIST : null));
    const found = await findBrandInci(FOX_QUERY, "Foxtale", undefined, { search: async () => ["https://foxtale.in/collections/moisturizers"], read, findInCatalogue });
    expect(findInCatalogue).toHaveBeenCalledWith("https://foxtale.in/collections/moisturizers", "Foxtale", FOX_QUERY);
    expect(found?.source).toBe(FOX_PAGE);
    expect(found?.identity).toBe("brand-catalogue");
    expect(found?.trust).toBe(4);
  });

  it("finds nothing when the catalogue has no single clear match", async () => {
    const found = await findBrandInci(FOX_QUERY, "Foxtale", undefined, { search: async () => ["https://foxtale.in/collections/moisturizers"], read: async () => FOX_LIST, findInCatalogue: async () => null });
    expect(found).toBeNull();
  });

  it("marks a page the catalogue confirmed (its title did not name the product)", async () => {
    const found = await findBrandInci(FOX_QUERY, "Foxtale", undefined, { search: async () => [FOX_PAGE], read: async () => FOX_LIST, confirmInBrandCatalogue: async () => true });
    expect(found?.identity).toBe("brand-catalogue");
  });

  it("names the product as the brand's page does, with the brand in front and the shop's name dropped", () => {
    expect(brandsOwnName(FOX_LIST.pageTitles, "Foxtale")).toBe("Foxtale Super Glow Moisturizer With Niacinamide & Vitamin C");
    expect(brandsOwnName(["Ultimate Revitalize Shampoo for Damaged Hair | 3TENX"], "3TENX")).toBe("3TENX Ultimate Revitalize Shampoo for Damaged Hair");
    expect(brandsOwnName(["Glamveda Sunscreen - SPF 50 PA+++ Body Lotion"], "Glamveda")).toBe("Glamveda Sunscreen - SPF 50 PA+++ Body Lotion");
    expect(brandsOwnName(["Peach Milk Creme - Lakme"], "Lakme")).toBe("Lakme Peach Milk Creme");
    expect(brandsOwnName(["Foxtale"], "Foxtale")).toBeNull();
  });

  it("the catalogue gives the product's page from any page of the site, only for one clear match", async () => {
    const load = async () => [{ title: "Super Glow Moisturizer With Niacinamide & Vitamin C", handle: "super-glow-moisturizer" }, { title: "Dewy Sunscreen SPF 50", handle: "dewy-sunscreen" }];
    expect(await catalogueProductUrl("https://foxtale.in/collections/all", "Foxtale", "Foxtale Glow Moisturizer Niacinamide Vitamin C", load)).toBe("https://foxtale.in/products/super-glow-moisturizer");
    expect(await catalogueProductUrl("https://foxtale.in/", "Foxtale", "Foxtale Night Cream", load)).toBeNull();
    expect(await catalogueProductUrl("https://foxtale.in/", "Foxtale", "Foxtale Glow Moisturizer Niacinamide Vitamin C", async () => null)).toBeNull();
  });

  it("a re-run accepts the brand's name for a list the catalogue identified, and still holds another product's", () => {
    const old = makeReview({ productName: "Brightening Moisturiser with Vitamin C & Niacinamide", brand: "Foxtale" });
    const row: RerunRow = { product_slug: "foxtale-brightening", product_name: old.productName, brand: "Foxtale", reviewed_at: "2026-11-01", result: { type: "product-review", review: old }, rubric_rev: "r7", tier: null, image_url: null };
    const fresh = makeReview({ productName: "Foxtale Super Glow Moisturizer With Niacinamide & Vitamin C", brand: "Foxtale", inciIngredients: FOX_LIST.ingredients, researchLog: { grounded: true, webSearchQueries: ["x"], sourceUris: [], sourceTitles: [], recordedAt: "2026-11-12" } });
    fresh.inciEvidence = makeInciEvidence(FOX_PAGE, FOX_LIST.quote, "2026-11-12", undefined, false, { trust: 4, origin: "brand-page", identity: "brand-catalogue" });
    expect(validateReplacement(row, fresh, "not-enough-info", "buy-with-caution")).not.toContain("product-identity-changed");
    const unflagged = { ...fresh, inciEvidence: makeInciEvidence(FOX_PAGE, FOX_LIST.quote, "2026-11-12", undefined, false, { trust: 4, origin: "brand-page" }) };
    expect(validateReplacement(row, unflagged, "not-enough-info", "buy-with-caution")).toContain("product-identity-changed");
  });
});

describe("a browser read never makes the lookup overrun", () => {
  it("is not started when too little of the lookup's time is left", async () => {
    vi.useFakeTimers();
    try {
      const readRendered = vi.fn().mockResolvedValue(null);
      // The search takes 10 s and the plain read 19.9 s (under its 20 s cap): about 6 s of the lookup's time is left, too little for a browser read.
      const slowSearch = () => new Promise<string[]>((resolve) => setTimeout(() => resolve([EL_URL]), 10_000));
      const slowPlain = () => new Promise<null>((resolve) => setTimeout(() => resolve(null), 19_900));
      const run = findBrandInci(EL_NAME, "Estée Lauder", undefined, { search: slowSearch, read: slowPlain, readRendered });
      await vi.advanceTimersByTimeAsync(40_000);
      await run;
      expect(readRendered).not.toHaveBeenCalled();
    } finally { vi.useRealTimers(); }
  });
});
