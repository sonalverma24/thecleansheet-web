import { afterEach, describe, expect, it, vi } from "vitest";
import { extractInciFromListItems, extractInciFromHtml, fetchInciFromProductPage } from "@/lib/inci-from-page";

/* 2026-11-03: Lakme's Peach Milk 2% Pro-Ceramide + Peptide Creme. The brand's own page prints all 40 ingredients, twice (a tab for each screen size), as <ul id="custom_ingredients">
   with one <li> per ingredient and no comma anywhere. The list reader splits on commas, so it found none and the analysis stayed grey ("could not verify a complete ingredient list").
   The markup is trimmed from the live page. */
const URL = "https://www.lakmeindia.com/products/lakme-peach-ceramide-moisturizer-with-hyaluronic-for-dry-skin-normal-skin-sensitive-skin-50g";
const LIST = [
  "Water", "Paraffinum Liquidum", "Propylene Glycol", "Glyceryl Stearate", "Cetyl Palmitate", "Octyl Hydroxystearate", "Cetyl Alcohol", "Cyclopentasiloxane", "Perfume", "Isohexadecane",
  "Potassium Lactate", "Glycerin", "PEG-40 Hydrogenated Castor Oil", "Trideceth-9", "Pentylene Glycol", "Nonfat Dry Milk (Sine Adipe Lac)", "Prunus Persica (Peach) Kernel Oil",
  "Disodium Laureth Sulfosuccinate", "Dimethicone", "Sodium Hydroxide", "Carbomer", "Acrylates/C10-C30 Alkyl Acrylate Crosspolymer", "Lactic Acid", "Tocopheryl Acetate",
  "Ethylhexyl Methoxycinnamate", "Disodium EDTA", "Panthenol", "Sodium PCA", "Sodium Ascorbyl Phosphate", "Tocopherol", "Phenoxyethanol", "Methylparaben", "Butylparaben",
  "Ethylparaben", "Propylparaben", "Butylphenyl Methylpropional", "Linalool", "Alpha-Isomethyl Ionone", "Citronellol", "CI 17200",
];
const items = (list: string[]) => list.map((x) => `<li class="custom-accordion-paragraph"> ${x} </li>`).join("\n");
const tab = (list: string[], id = "custom_ingredients") =>
  `<div class="Collapsible ProductMeta__Description ingredients"><button class="Collapsible__Button Heading u-h6" aria-expanded="false">Ingredients<span class="Collapsible__Plus"></span></button>
   <div class="Collapsible__Inner"><div class="Collapsible__Content"><div id="ingredients_productss" class="Rte"><ul id="${id}" class="custom-ingredients">${items(list)}</ul></div></div></div></div>`;
const page = (body: string) => `<!doctype html><html><head><title>Lakme Peach Milk 2% Pro-Ceramide + Peptide Crème | Barrier Repair &ndash; Lakmē</title></head><body>
<h1>Lakme Peach Milk 2% Pro-Ceramide + Peptide Crème | Barrier Repair + Pollution Defence | 50g</h1>${body}
<div class="Collapsible"><button>How to use</button><div>Apply on clean skin morning and night.</div></div></body></html>`;

afterEach(() => vi.unstubAllGlobals());
const serve = (html: string) => vi.stubGlobal("fetch", vi.fn(async () => new Response(html, { status: 200 })));

describe("a list the page labels as its ingredients is read when it is printed one to a bullet", () => {
  it("returns all 40 of Lakme's ingredients, Water first and CI 17200 last, from the page's HTML", async () => {
    serve(page(tab(LIST) + tab(LIST)));
    const read = await fetchInciFromProductPage(URL);
    expect(read?.ingredients).toEqual(LIST);
    expect(read?.source).toBe(URL);
    expect(read?.pageTitles?.[0]).toMatch(/^Lakme Peach Milk 2% Pro-Ceramide/);
  });

  it("quotes the list as the page prints it, item by item, with no markup and nothing else", async () => {
    serve(page(tab(LIST)));
    const quote = (await fetchInciFromProductPage(URL))?.quote ?? "";
    expect(quote).toBe(LIST.join(", "));
    expect(quote).not.toMatch(/<|Apply on clean skin|How to use/);
  });

  it("reads a list that appears twice (one tab per screen size) as one list, not two", () => {
    expect(extractInciFromListItems(page(tab(LIST) + tab(LIST)))?.ingredients).toHaveLength(LIST.length);
  });

  it("is what the comma reader cannot do: it finds nothing on this page", () => {
    expect(extractInciFromHtml(page(tab(LIST)))).toEqual([]);
  });
});

describe("what the bullet reading will not do", () => {
  it("does not read a list the page does not label as ingredients, however much it looks like one", () => {
    expect(extractInciFromListItems(page(`<ul class="menu">${items(LIST.slice(0, 12))}</ul>`))).toBeNull();
  });

  it("does not read bullets that carry only the key ingredients (under five)", () => {
    expect(extractInciFromListItems(page(`<ul class="key-ingredients">${items(["Niacinamide", "Panthenol", "Glycerin", "Ceramide NP"])}</ul>`))).toBeNull();
  });

  it("leaves a comma list inside a bullet to the comma reader, which already reads it", async () => {
    const commaItem = `<ul class="ingredients"><li>Water, Glycerin, Niacinamide, Panthenol, Tocopherol, Phenoxyethanol</li></ul>`;
    expect(extractInciFromListItems(page(commaItem))).toBeNull();
    serve(page(commaItem));
    expect((await fetchInciFromProductPage(URL))?.ingredients).toEqual(["Water", "Glycerin", "Niacinamide", "Panthenol", "Tocopherol", "Phenoxyethanol"]);
  });

  it("refuses the whole list when something that is not an ingredient sits among the items, rather than reading part of it", () => {
    const mixed = [...LIST.slice(0, 6), "Free from parabens and sulphates.", ...LIST.slice(6, 12)];
    expect(extractInciFromListItems(page(tab(mixed)))).toBeNull();
  });

  it("ignores a labelled list that sits inside a script", () => {
    expect(extractInciFromListItems(`<div><script>var html = '<ul id="ingredients">${items(LIST.slice(0, 10))}</ul>';</script></div>`)).toBeNull();
  });

  it("does not replace a visible list that is as long or longer, and is replaced only by a longer one", async () => {
    const visible = "<p>Ingredients: Water, Glycerin, Niacinamide, Panthenol, Tocopherol, Phenoxyethanol</p><h2>How to use</h2>";
    serve(page(visible + tab(["Water", "Glycerin", "Niacinamide", "Panthenol", "Tocopherol", "Allantoin"])));
    expect((await fetchInciFromProductPage(URL))?.quote).toBe("Water, Glycerin, Niacinamide, Panthenol, Tocopherol, Phenoxyethanol"); // equal length: the visible list stays
    serve(page(visible + tab(LIST.slice(0, 10))));
    expect((await fetchInciFromProductPage(URL))?.ingredients).toEqual(LIST.slice(0, 10)); // longer: the labelled list wins
  });
});

/* 2026-11-04: Be Minimalist's B5 moisturiser. Its header holds <ul id="SiteNavLabel-shop-by-ingredients-sidebar"> (a menu of ingredient categories) and the first version of the bullet reading
   took it for the product's ingredients: "Back, Vitamin C, BHA / Salicylic Acid, Retinoid / Retinol, Niacinamide, UV Filters, Ceramide". The markup below is trimmed from the live page. */
describe("a menu that says 'ingredients' is not an ingredient list", () => {
  const link = (text: string) => `<li><a href="/collections/${text.toLowerCase().replace(/\W+/g, "-")}" class="site-nav__link">${text}</a></li>`;
  const menu = `<div class="babymenu"><ul id="SiteNavLabel-shop-by-ingredients-classic">${["Vitamin C", "BHA / Salicylic Acid", "Retinoid / Retinol", "Niacinamide", "UV Filters", "Ceramide"].map(link).join("")}</ul></div>
    <div class="babymenu"><ul id="SiteNavLabel-shop-by-ingredients-sidebar"><li><button class="site-nav__back">Back</button></li>${["Vitamin C", "BHA / Salicylic Acid", "Retinoid / Retinol", "Niacinamide", "UV Filters", "Ceramide"].map(link).join("")}</ul></div>`;
  const real = "Water/Aqua, Glycerin, Niacinamide, Panthenol, Tocopherol";

  it("reads nothing from the header menus of Be Minimalist's page", () => {
    expect(extractInciFromListItems(page(menu))).toBeNull();
  });

  it("does not let a menu longer than the page's own visible list replace it", async () => {
    serve(page(`<p>Ingredients: ${real}</p><h2>How to use</h2>` + menu));
    expect((await fetchInciFromProductPage("https://beminimalist.co/products/vitamin-b5-10-moisturizer-30g"))?.ingredients).toEqual(real.split(", "));
  });

  it("refuses a list whose own tag marks it as navigation, filters or a dropdown, even with plain-text items", () => {
    for (const id of ["main-nav-ingredients", "ingredients-menu", "filter-ingredients", "ingredient-facets", "shop-by-ingredients", "ingredients-dropdown"])
      expect(extractInciFromListItems(page(`<ul id="${id}">${items(LIST.slice(0, 8))}</ul>`)), id).toBeNull();
  });

  it("refuses a list that holds a menu control among the items, or whose items are mostly links", () => {
    expect(extractInciFromListItems(page(`<ul class="ingredients"><li>Back</li>${items(LIST.slice(0, 8))}</ul>`))).toBeNull();
    const linked = LIST.slice(0, 8).map((x) => `<li><a href="/pages/glossary/${x}">${x}</a></li>`).join("");
    expect(extractInciFromListItems(page(`<ul class="ingredients">${linked}</ul>`))).toBeNull();
  });

  it("still reads a real list that carries one glossary link among plain items", () => {
    const some = LIST.slice(0, 8).map((x, i) => (i === 3 ? `<li><a href="/pages/glossary">${x}</a></li>` : `<li>${x}</li>`)).join("");
    expect(extractInciFromListItems(page(`<ul class="ingredients">${some}</ul>`))?.ingredients).toEqual(LIST.slice(0, 8));
  });
});
