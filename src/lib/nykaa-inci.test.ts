import { afterEach, describe, expect, it, vi } from "vitest";
import { NYKAA_RENDER_MS, NYKAA_TAB_ACTIONS, extractNykaaInci, isNykaaProductUrl, nykaaProductUrl, readNykaaPage, searchNykaaPages } from "./nykaa-inci";
import { fetchRenderedPage } from "./scrape";

vi.mock("./scrape", async (orig) => ({ ...(await orig<typeof import("./scrape")>()), fetchRenderedPage: vi.fn() }));
afterEach(() => { vi.mocked(fetchRenderedPage).mockReset(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

/* The two pages as the renderer returned them with the Ingredients tab opened (30 Oct 2026). Lotus prints its own typos ("Butyl Methcaydibenzoy| Methane",
   "Isononyl. Isononanoate", "Tocopheryl, Acetate,triethanolamine"); they are kept exactly as printed. */
const LOTUS_LIST = "Aqua (Om Water), Niacinamide, Caprylic Capric Triglyceride, Arctostaphylos Uva-ursi (Bearberry) Extract, Glycerin, Propylene Glycol, Saxifraga Sarmentosa Extract, Vitis Vinifera (Grape) Fruit Extract, Butylene Glycol, Morus Bombycis Root Extract, Scutellaria Baicalensis Root Extract, Cyclopentasiloxane, Butyl Methcaydibenzoy| Methane, Titanium Dioxide, Camellia Sinensis (Green Tea) Extract, Acrylamide/ Sodium Acrylate Copolymer, Paraffinum Liquidum, Trideceth-6, Isopropyl Myristate, Milk Enzymes (Whey Protein), Dimethicone, Isononyl. Isononanoate, Tocopheryl, Acetate,triethanolamine, Disodium Edta, Propyl Paraben Sodium, Methyl Paraben Sodium, 2-phenoxyethanol, Fragrance";
const lotusPage = `# Lotus Herbals WhiteGlow Skin Whitening & Brightening Gel Cream SPF 25 PA+++\\|With Niacinamide(75g)\n\nSold by :Nykaa E retail limited\n\n## Product Description\n\n### Description\n\n### Ingredients\n\n### How To Use\n\n${LOTUS_LIST.replace("Methcaydibenzoy|", "Methcaydibenzoy\\|")}.\n\n## Customers also Viewed\n\n[![x](https://images-static.nykaa.com/a.jpg)](https://www.nykaa.com/other/p/1)`;
const AQUA_LIST = "Aqua, Dimethicone, Glycerin, Butylene Glycol, Ammonium Acryloyldimethyltaurate/Vp Copolymer, Ethylhexylglycerin (And) Phenoxyethanol, Linoleamidopropyl Pg Dimonium Chloride Phosphate, Ammonium Acryloyldimethyltaurate Crosspolymer, Dimethicone (And) Dimethicone Crosspolymer, Capric Caprylic Triglyceride, Hyaluronic Acid, Niacinamide, Sodium Pca, Xylitylglucoside (And) Anhydroxylitol (And) Xylitol, Beheneth-25 Methacrylate Crosspolymer, Vitamin C, Papaya Extract, Ifra Certified Allergen Free Fragrance, Ci 19140";
const aquaPage = `# Aqualogica Glow+ Hydra Gel Moisturizer With Papaya & Vitamin C For 24 Hour Intense Hydration(100g)\n\n## Product Description\n\n### Description\n\n### Ingredients\n\n### How To Use\n\n**Key Ingredients:**\n\n- **Vitamin C:** Brightens the skin and helps reduce hyperpigmentation.\n- **Papaya:** Gently exfoliates to remove dead skin cells.\n\n**Full Ingredient List:** ${AQUA_LIST}.\n\nRead Moreright arrow\n\n## Product Details`;

describe("a Nykaa product page's opened Ingredients tab", () => {
  it("is read as a whole list, first entry (Aqua) included, with the quote it was read from", () => {
    const r = extractNykaaInci(lotusPage)!;
    expect(r.ingredients).toHaveLength(30);
    expect(r.ingredients[0]).toBe("Aqua (Om Water)");
    expect(r.ingredients.at(-1)).toBe("Fragrance");
    expect(r.quote).toBe(LOTUS_LIST);
  });

  it("keeps the retailer's own typos as printed instead of stopping at them or repairing them", () => {
    const items = extractNykaaInci(lotusPage)!.ingredients;
    expect(items).toContain("Butyl Methcaydibenzoy| Methane");
    expect(items).toContain("Isononyl. Isononanoate");
    expect(items.slice(22, 25)).toEqual(["Tocopheryl", "Acetate", "triethanolamine"]);
  });

  it("reads the list after a 'Full Ingredient List:' label and not the 'Key Ingredients' blurb before it", () => {
    const r = extractNykaaInci(aquaPage)!;
    expect(r.ingredients).toHaveLength(19);
    expect(r.ingredients[0]).toBe("Aqua");
    expect(r.ingredients.at(-1)).toBe("Ci 19140");
    expect(r.quote).toBe(AQUA_LIST);
    expect(r.ingredients.join(" ")).not.toMatch(/Brightens the skin/);
  });

  it("refuses the product description, which is what the panel holds when the tab did not open", () => {
    const prose = "### Description\n\n### Ingredients\n\n### How To Use\n\nThe Lotus Herbals Whiteglow Gel Cream is an apt product to help you fight the stern rays of the sun, thanks to its SPF 25 PA+++ formulation, and it has a one-of-a-kind base, which facilitates fast absorption, leaving you with youthful, supple skin.\n\n## Customers also Viewed";
    expect(extractNykaaInci(prose)).toBeNull();
  });

  it("is null for a page with no Ingredients heading, an empty panel, or a panel of too few entries", () => {
    expect(extractNykaaInci("# A page\n\nNo tabs here, Aqua, Glycerin")).toBeNull();
    expect(extractNykaaInci("### Ingredients\n\n### How To Use\n\n## Product Details")).toBeNull();
    expect(extractNykaaInci("### Ingredients\n\n### How To Use\n\nAqua, Glycerin, Niacinamide\n\n## Next")).toBeNull();
  });
});

describe("which Nykaa pages are product pages", () => {
  it("accepts the product page, with or without Nykaa's tracking query", () => {
    expect(isNykaaProductUrl("https://www.nykaa.com/lotus-herbals-whiteglow/p/10787966")).toBe(true);
    expect(isNykaaProductUrl("https://www.nykaa.com/lotus-herbals-whiteglow/p/10787966?productId=10787966&pps=8&skuId=17737661")).toBe(true);
    expect(nykaaProductUrl("https://www.nykaa.com/lotus-herbals-whiteglow/p/10787966?productId=1&pps=8")).toBe("https://www.nykaa.com/lotus-herbals-whiteglow/p/10787966");
  });
  it("refuses reviews, brand and category pages, other hosts, other retailers, and look-alike hosts", () => {
    for (const u of ["https://www.nykaa.com/lotus/reviews/10787966", "https://www.nykaa.com/brands/aqualogica/moisturizers/c/63978", "https://www.nykaa.com/", "http://www.nykaa.com/x/p/1",
      "https://www.amazon.in/dp/B01MYRU03Y", "https://nykaa.com.evil.test/x/p/1", "https://www.nykaafashion.com/x/p/1", "https://evil.test/nykaa.com/x/p/1", "https://user@www.nykaa.com/x/p/1", "not a url"])
      expect(isNykaaProductUrl(u), u).toBe(false);
  });
});

describe("reading a Nykaa product page", () => {
  const url = "https://www.nykaa.com/lotus-herbals-whiteglow/p/10787966?productId=10787966&pps=8";
  it("renders it with the tab opened and returns the list, the exact quote, the clean address and the page's names, as a trust-3 Nykaa source", async () => {
    vi.mocked(fetchRenderedPage).mockResolvedValue({ markdown: lotusPage, title: "Buy Lotus Herbals WhiteGlow Skin Whitening & Brightening Gel Cream|With Niacinamide|All Skin Types Online" });
    const page = await readNykaaPage(url);
    expect(fetchRenderedPage).toHaveBeenCalledWith("https://www.nykaa.com/lotus-herbals-whiteglow/p/10787966", NYKAA_TAB_ACTIONS, NYKAA_RENDER_MS);
    expect(page).toMatchObject({ source: "https://www.nykaa.com/lotus-herbals-whiteglow/p/10787966", quote: LOTUS_LIST, siteName: "Nykaa", trust: 3, origin: "nykaa" });
    expect(page?.ingredients).toHaveLength(30);
    expect(page?.pageTitles?.[0]).toMatch(/^Lotus Herbals WhiteGlow Skin Whitening & Brightening Gel Cream/);
  });
  it("is null when the page cannot be rendered, holds no list, or is not a Nykaa product page, and never renders the last", async () => {
    vi.mocked(fetchRenderedPage).mockResolvedValueOnce(null);
    expect(await readNykaaPage(url)).toBeNull();
    vi.mocked(fetchRenderedPage).mockResolvedValueOnce({ markdown: "# Page\n\nnothing", title: null });
    expect(await readNykaaPage(url)).toBeNull();
    vi.mocked(fetchRenderedPage).mockClear();
    expect(await readNykaaPage("https://www.amazon.in/dp/B01MYRU03Y")).toBeNull();
    expect(fetchRenderedPage).not.toHaveBeenCalled();
  });
});

describe("searching for the product's Nykaa page", () => {
  it("asks Firecrawl for URLs only and keeps only Nykaa product pages, without their tracking query and without duplicates", async () => {
    vi.stubEnv("FIRECRAWL_API_KEY", "fc-test");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [
      { url: "https://www.nykaa.com/lotus-herbals-whiteglow/p/10787966?pps=8" }, { url: "https://www.nykaa.com/lotus-herbals-whiteglow/reviews/10787966" },
      { url: "https://www.youtube.com/watch?v=x" }, { url: "https://www.nykaa.com/lotus-herbals-whiteglow/p/10787966" }, { url: "https://www.nykaa.com/lotus-herbals-pack-of-2/p/21068895" },
    ] }) });
    vi.stubGlobal("fetch", fetchMock);
    expect(await searchNykaaPages("Lotus Herbals WhiteGlow Gel Creme")).toEqual(["https://www.nykaa.com/lotus-herbals-whiteglow/p/10787966", "https://www.nykaa.com/lotus-herbals-pack-of-2/p/21068895"]);
    const [endpoint, init] = fetchMock.mock.calls[0];
    expect(endpoint).toBe("https://api.firecrawl.dev/v1/search");
    expect(JSON.parse(init.body)).toEqual({ query: "Lotus Herbals WhiteGlow Gel Creme nykaa", limit: 6 });
  });
  it("is empty without a key, and when the call fails", async () => {
    vi.stubEnv("FIRECRAWL_API_KEY", "");
    expect(await searchNykaaPages("x")).toEqual([]);
    vi.stubEnv("FIRECRAWL_API_KEY", "fc-test");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await searchNykaaPages("x")).toEqual([]);
  });
});

describe("a Nykaa panel that prints names in several languages and a shade range (Estée Lauder, 2026-11-12)", () => {
  // As the renderer returns it: each backslash escaped again, and the shade range's "may contain" brackets escaped.
  const panel = "### Description\n### Ingredients\n### How To Use\n\nIngredients: Water\\\\\\Aqua\\\\\\Eau, Methyl Trimethicone, Dimethicone, Niacinamide, Glycerin, Potassium Sorbate, \\[+/- Mica, Titanium Dioxide (Ci 77891), Iron Oxides (Ci 77499)\\]\n\n## Ratings";
  it("reads one entry per name, written with '/', with the panel's own label and the brackets off", () => {
    const read = extractNykaaInci(panel);
    expect(read?.ingredients).toEqual(["Water/Aqua/Eau", "Methyl Trimethicone", "Dimethicone", "Niacinamide", "Glycerin", "Potassium Sorbate", "Mica", "Titanium Dioxide (Ci 77891)", "Iron Oxides (Ci 77499)"]);
    expect(read?.quote).toMatch(/^Water/);
  });
});

describe("a Nykaa panel that runs a label's actives into the rest of its list (Bobbi Brown, 2026-11-12)", () => {
  const panel = "### Description\n### Ingredients\n### How To Use\n\nActive: Octinoxate 6.7%, Titanium Dioxide 1.6%Ingredients: Water\\\\\\Aqua\\\\\\Eau, Dimethicone, Glycerin, Trimethylsiloxysilicate, Butylene Glycol, Phenoxyethanol\n\n## Ratings";
  it("reads each active as an entry without its strength, and the entry glued to the next label as two", () => {
    expect(extractNykaaInci(panel)?.ingredients).toEqual(["Octinoxate", "Titanium Dioxide", "Water/Aqua/Eau", "Dimethicone", "Glycerin", "Trimethylsiloxysilicate", "Butylene Glycol", "Phenoxyethanol"]);
  });
  it("keeps the strengths in the quote, as the page prints them", () => {
    expect(extractNykaaInci(panel)?.quote).toMatch(/Octinoxate 6\.7%, Titanium Dioxide 1\.6%Ingredients: Water/);
  });
});
