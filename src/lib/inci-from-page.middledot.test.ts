import { afterEach, describe, expect, it, vi } from "vitest";
import { extendFromParagraphs, extractInciWithQuote, fetchInciFromProductPage } from "@/lib/inci-from-page";

/* 2026-11-11: 3TENX Ultimate Revitalize Shampoo. The brand's own page prints its full list with a middle dot between entries and no comma anywhere,
   under a short bulleted "All Ingredients" highlight. Read on commas alone the list was one piece, nothing was found, and the analysis stayed grey.
   The text is trimmed from the page as the Jina reader returns it (line breaks and the glued "KERATIN·GLYCOL" kept). */
const PAGE = `### All Ingredients

• Keratin & Collagen
 • Salicylic Acid
 • Hydrolysed silk
 • Wheat Protein

 Full Ingredients List

 WATER· SODIUM LAUROYL SARCOSINATE· COCAMIDOPROPYL HYDROXYSULTAINE· SODIUM LAURYL SULFOACETATE· COCAMIDOPROPYL BETAINE·
 DIMETHICONE· COLLAGEN· KERATIN·GLYCOL DISTEARATE· COCAMIDE DEA· BETAINE· COCAMIDE MEA· TEA-DODECYLBENZENESULFONATE· PARFUM·
 HYDROLYZED SILK· DIHYDROGENATED TALLOW PHTHALIC ACID AMIDE· GUAR HYDROXYPROPYLTRIMONIUM CHLORIDE· ALLANTOIN· SALICYLIC ACID· PIROCTONE OLAMINE·
 COCODIMONIUM HYDROXYPROPYL HYDROLYZED WHEAT PROTEIN· BEHENAMIDOPROPYL DIMETHYLAMINE· ZINCCHLORIDE· CITRIC ACID·
 HEXAMIDINE DIISETHIONATE·
 METHYLISOTHIAZOLINONE

### Legal Information`;

const FULL = [
  "WATER", "SODIUM LAUROYL SARCOSINATE", "COCAMIDOPROPYL HYDROXYSULTAINE", "SODIUM LAURYL SULFOACETATE", "COCAMIDOPROPYL BETAINE", "DIMETHICONE", "COLLAGEN", "KERATIN",
  "GLYCOL DISTEARATE", "COCAMIDE DEA", "BETAINE", "COCAMIDE MEA", "TEA-DODECYLBENZENESULFONATE", "PARFUM", "HYDROLYZED SILK", "DIHYDROGENATED TALLOW PHTHALIC ACID AMIDE",
  "GUAR HYDROXYPROPYLTRIMONIUM CHLORIDE", "ALLANTOIN", "SALICYLIC ACID", "PIROCTONE OLAMINE", "COCODIMONIUM HYDROXYPROPYL HYDROLYZED WHEAT PROTEIN",
  "BEHENAMIDOPROPYL DIMETHYLAMINE", "ZINCCHLORIDE", "CITRIC ACID", "HEXAMIDINE DIISETHIONATE", "METHYLISOTHIAZOLINONE",
];

afterEach(() => vi.unstubAllGlobals());

describe("a list printed with middle dots between entries is read", () => {
  it("splits at the middle dots: the 24 entries between the label and the next heading", () => {
    expect(extractInciWithQuote(PAGE)?.ingredients).toEqual(FULL.slice(1, -1));
  });

  it("reads the list's own paragraph whole, Water to Methylisothiazolinone, quoting the page's text", () => {
    const read = extendFromParagraphs(extractInciWithQuote(PAGE), PAGE);
    expect(read?.ingredients).toEqual(FULL);
    expect(read?.quote).toMatch(/^WATER· SODIUM LAUROYL SARCOSINATE·/);
    expect(read?.quote).toMatch(/HEXAMIDINE DIISETHIONATE· METHYLISOTHIAZOLINONE$/);
  });

  it("returns all 26 from the brand page when a plain fetch is refused and the reader's markdown is used", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => String(url).startsWith("https://r.jina.ai/")
      ? new Response(`Title: Ultimate Revitalize Shampoo for Damaged Hair\n\n${PAGE}`, { status: 200 })
      : new Response("Forbidden", { status: 403 })));
    const read = await fetchInciFromProductPage("https://3tenx.com/products/3tenx-ultimate-revitalize-shampoo");
    expect(read?.ingredients).toEqual(FULL);
  });

  it("returns all 26 from the brand page's HTML, where <br> lines glue the label to Water ('List WATER')", async () => {
    const lines = PAGE.split("Full Ingredients List")[1].split("### Legal")[0].trim().split("\n").map((l) => l.trim()).join("<br />\n");
    const html = `<!doctype html><html><head><title>Ultimate Revitalize Shampoo for Damaged Hair | 3TENX</title></head><body><h1>Ultimate Revitalize Shampoo</h1>
      <p><span class="metafield-multi_line_text_field">• Keratin &amp; Collagen<br />\n• Salicylic Acid<br />\n• Hydrolysed silk<br />\n• Wheat Protein<br />\n<br />\nFull Ingredients List<br />\n<br />\n${lines}</span></p>
      <h3>Legal Information</h3></body></html>`;
    vi.stubGlobal("fetch", vi.fn(async () => new Response(html, { status: 200 })));
    const read = await fetchInciFromProductPage("https://3tenx.com/products/3tenx-ultimate-revitalize-shampoo");
    expect(read?.ingredients).toEqual(FULL);
    expect(read?.quote).toMatch(/^WATER·/);
  });

  it("the same text with commas gives the same list", () => {
    const commas = PAGE.replace(/·/g, ",");
    expect(extendFromParagraphs(extractInciWithQuote(commas), commas)?.ingredients).toEqual(FULL);
  });
});

describe("paragraph reading never replaces a list it does not contain", () => {
  it("keeps the visible list when no single paragraph holds it whole", () => {
    const text = "Ingredients: Aqua, Glycerin, Niacinamide, Phenoxyethanol, Ethylhexylglycerin\n\nAlso try: Aqua, Glycerin, Panthenol, Allantoin, Betaine, Urea";
    const visible = extractInciWithQuote(text);
    expect(extendFromParagraphs(visible, text)).toBe(visible);
  });

  it("reads a comma list exactly as before", () => {
    expect(extractInciWithQuote("Ingredients: Aqua, Glycerin, Niacinamide, Phenoxyethanol, Ethylhexylglycerin")?.ingredients)
      .toEqual(["Aqua", "Glycerin", "Niacinamide", "Phenoxyethanol", "Ethylhexylglycerin"]);
  });
});
