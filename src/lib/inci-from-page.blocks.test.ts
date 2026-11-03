import { afterEach, describe, expect, it, vi } from "vitest";
import { extendFromBlocks, extractInciFromBlocks, extractInciFromHtml, fetchInciFromProductPage, type InciExtraction } from "@/lib/inci-from-page";

/* 2026-11-03: Chemist at Play's Oil Control Face Moisturizer on innovist.com. The page prints its list in
   <div class="ingredient-content"> right after the "Brands That Lead" section. With the tags stripped the text runs on:
   "... ahead in innovation. Clinically Tested Brands That Lead Aqua, Niacinamide, Glycerin, ...". Nothing separates "Lead" from
   "Aqua", so the first comma-piece is eleven words of page copy, is rejected as too long, and the list came back from
   Niacinamide: 24 entries, water missing, the order misstated. The markup below is trimmed from the live page and keeps
   the real run-on (a badge span, a heading, brand cards, then the tab that holds the list). */
const URL = "https://innovist.com/products/oil-control-face-moisturizer";
const LIST = [
  "Aqua", "Niacinamide", "Glycerin", "Phytosqualane", "Lactobacillus Ferment", "Bacillus Ferment", "Pentylene Glycol",
  "Pyrus Malus (Apple) Fruit Extract", "Sodium Acrylates Copolymer", "Lecithin", "Cetyl Alcohol", "D-panthenol", "Phenoxyethanol",
  "Triethylene Glycol", "Allantoin", "Microcrystalline Cellulose", "Silica", "Tocopherol Acetate", "Sodium Hyaluronate",
  "Ceramide NP", "Ceramide AS", "Ceramide EOP", "Ceramide NS", "Ceramide NG", "Sodium Gluconate",
];
const LIST_TEXT = LIST.join(", ");

const page = (list: string, before = "") => `<!doctype html><html><head>
<title>Oil Control Face Moisturizer with Niacinamide | Chemist at Play</title>
<meta property="og:site_name" content="Innovist">
</head><body>
<section class="lab-brand-pillars"><article class="lab-brand-pillar"><h3>Science-First Innovation</h3>
  <p>From lab ideation to clinical trials, every formula is tested and refined. Our in-house R&amp;D team ensures we stay effective, safe, and ahead in innovation. </p>
  <span class="lab-brand-pillar__badge"> Clinically Tested </span>
</article></section>
<!-- Portfolio -->
<div class="lab-brand-portfolio">
  <div class="lab-brand-section-heading"><h2 class="lab-brand-section-heading__title"> Brands That Lead </h2></div>
  <div class="lab-brand-portfolio__list">
    <a class="lab-brand-portfolio__card" href="https://innovist.com/pages/chemist-at-play-store" aria-label="Explore Chemist at Play"><img src="https://innovist.com/cdn/shop/files/CAP.jpg" alt="Chemist at Play" width="800" height="420"></a>
  </div>
</div>${before}<div class="tab-content " id="ingredients">
  <div class="custom-all-ingredients ">
    <div class="ingredient-content">
      ${list}

    </div>
  </div>
<style>.ingredient-content { font-size: 16px; text-align: center; }</style>
</div><div class="tab-content " id="info">
  <div class="metafield-rich_text_field"><p><strong>Best Before:</strong></p><p>36 Months</p><p><strong>Net Content:</strong></p><p>100 gm</p></div>
</div>
<script type="application/ld+json">{"@type":"Product","name":"Oil Control Face Moisturizer","url":"${URL}"}</script>
</body></html>`;

afterEach(() => vi.unstubAllGlobals());
const serve = (html: string) => vi.stubGlobal("fetch", vi.fn(async () => new Response(html, { status: 200 })));

describe("a list that follows unpunctuated page copy keeps its first entry", () => {
  it("returns all 25 Innovist entries, Aqua first and Sodium Gluconate last, from the page's HTML", async () => {
    serve(page(LIST_TEXT));
    const read = await fetchInciFromProductPage(URL);
    expect(read?.ingredients).toEqual(LIST);
    expect(read?.ingredients[0]).toBe("Aqua");
    expect(read?.ingredients.at(-1)).toBe("Sodium Gluconate");
    expect(read?.source).toBe(URL);
    expect(read?.pageTitles?.[0]).toBe("Oil Control Face Moisturizer with Niacinamide | Chemist at Play");
  });

  it("quotes the list alone: no page copy rides along at either end", async () => {
    serve(page(LIST_TEXT));
    const quote = (await fetchInciFromProductPage(URL))?.quote ?? "";
    expect(quote.startsWith("Aqua, Niacinamide, Glycerin")).toBe(true);
    expect(quote.endsWith("Ceramide NG, Sodium Gluconate")).toBe(true);
    expect(quote).not.toMatch(/Brands That Lead|Clinically Tested|Best Before/);
  });

  it("reads the list out of its own block", () => {
    const ex = extractInciFromBlocks(page(LIST_TEXT));
    expect(ex?.ingredients).toEqual(LIST);
    expect(ex?.quote).toBe(LIST_TEXT);
  });
});

describe("what the block reading will not do", () => {
  it("does not make a list out of page copy: a comma-rich claims paragraph, a link menu or a sentence is not one", () => {
    const copy = `<body>
      <p>Hydrating, Soothing, Nourishing, Brightening, Water resistant, Non-comedogenic, Dermatologically tested, Suitable for all skin types</p>
      <ul><li>Face Wash</li><li>Moisturizer</li><li>Sunscreen</li><li>Serum</li><li>Water Gel</li><li>Lip Balm</li><li>Body Lotion</li></ul>
      <p>We say no to parabens, sulphates, mineral oil, silicones and phthalates, because your skin deserves better than that.</p>
    </body>`;
    expect(extractInciFromBlocks(copy)).toBeNull();
  });

  it("does not join a list that a block boundary cuts in two; the whole visible list stands", async () => {
    const split = "<p>Ingredients: Aqua, Glycerin, Niacinamide, Panthenol, Tocopherol, Allantoin,</p><p>Sodium Benzoate, Citric Acid, Phenoxyethanol, Parfum, Carbomer, Xanthan Gum</p><h2>How to use</h2>";
    expect(extractInciFromBlocks(split)?.ingredients.length ?? 0).toBeLessThan(extractInciFromHtml(split).length);
    serve(`<html><head><title>Plix Night Cream</title></head><body>${split}</body></html>`);
    expect((await fetchInciFromProductPage("https://plixlife.com/products/night-cream-x"))?.ingredients).toHaveLength(12);
  });

  it("never supplies a list the visible reading refused: the longer half of a list cut by a gap stays refused", () => {
    const cut = "<p>Aqua, Glycerin, Niacinamide, Panthenol, Allantoin,</p><p>, Sodium Benzoate, Citric Acid, Phenoxyethanol, Parfum, Carbomer, Xanthan Gum, Tocopherol</p>";
    expect(extractInciFromHtml(cut)).toEqual([]); // the visible reading refuses it...
    expect(extractInciFromBlocks(cut)?.ingredients).toHaveLength(7); // ...a block on its own would have published the half
    expect(extendFromBlocks(null, cut)).toBeNull();
  });

  it("never replaces, reorders or shortens the visible list: it only adds entries the run-on hid", () => {
    const visible = (ingredients: string[]): InciExtraction => ({ ingredients, quote: ingredients.join(", ") });
    const html = page(LIST_TEXT);
    // The visible list as the page run-on left it (first entry lost): the block reading puts "Aqua" back.
    expect(extendFromBlocks(visible(LIST.slice(1)), html)?.ingredients).toEqual(LIST);
    // A last entry lost is put back the same way.
    expect(extendFromBlocks(visible(LIST.slice(0, -1)), html)?.ingredients).toEqual(LIST);
    // A different list, the same list in another order, or one the block does not hold whole is left exactly as read.
    for (const other of [["Glycerin", "Squalane", "Panthenol", "Allantoin", "Tocopherol"], [...LIST].reverse(), [LIST[1], LIST[3], LIST[4], LIST[5], LIST[6]]]) {
      const read = visible(other);
      expect(extendFromBlocks(read, html)).toBe(read);
    }
    // An equal list is left as read, not swapped for its twin.
    const same = visible(LIST);
    expect(extendFromBlocks(same, html)).toBe(same);
  });

  it("does not replace an ordinary single-block list that the visible text already reads whole", async () => {
    const body = `<html><head><title>Plix Night Cream</title></head><body><p>Ingredients: ${LIST_TEXT}</p><h2>How to use</h2></body></html>`;
    serve(body);
    const read = await fetchInciFromProductPage("https://plixlife.com/products/night-cream-x");
    expect(read?.ingredients).toEqual(LIST);
    expect(read?.quote).toBe(LIST_TEXT);
  });

  it("ignores a list that sits inside a script or style block", () => {
    expect(extractInciFromBlocks(`<div><script>var a = "<div>${LIST_TEXT}</div>";</script><style>/* ${LIST_TEXT} */</style></div>`)).toBeNull();
  });
});
