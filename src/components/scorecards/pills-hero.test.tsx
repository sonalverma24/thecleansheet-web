import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SAMPLE_EXAMPLE_MEDICINAL, SAMPLE_EXAMPLE_MINERAL_SUNSCREEN, SAMPLE_EXAMPLE_PROHIBITED, SAMPLE_EXAMPLE_SUNSCREEN, SAMPLE_MINIMALIST_B5 } from "@/data/analysis/sample-reviews";
import { deriveVerdict } from "@/lib/product-review-engine";
import { BASE, rv } from "@/lib/analyser-x/test-helpers";
import { pillsFor } from "@/lib/pills-for-review";
import { reviewToScorecard } from "@/lib/review-to-scorecard";
import type { BuyLink, PillsPageModel } from "@/lib/pills-page";
import { TIER_STYLES, resolveTier } from "@/components/scorecards/pillar-ui";
import { PillsPage } from "@/components/scorecards/PillsPage";
import { MARKER_COLOURS, NEUTRAL_COLOURS } from "@/components/scorecards/pill-palette";
import { ProductHero } from "@/components/scorecards/ProductHero";
import type { ProductReview } from "@/lib/product-review-types";

// Today's hero (checked below, to prove it is untouched) draws the real feedback button, which needs the site's sign-in provider.
vi.mock("./HeroActions", () => ({ HeroActions: ({ productId }: { productId: string }) => <div data-hero-actions={productId} /> }));

const OLD_STANDINGS = ["Good Standing", "Room to Improve", "Not Recommended", "Licensed Drug"];
const FIXTURES: [string, ProductReview][] = [
  ["clean moisturiser", SAMPLE_MINIMALIST_B5], ["adverse sunscreen", SAMPLE_EXAMPLE_SUNSCREEN], ["mineral sunscreen", SAMPLE_EXAMPLE_MINERAL_SUNSCREEN],
  ["prohibited ingredient", SAMPLE_EXAMPLE_PROHIBITED], ["medicinal shampoo", SAMPLE_EXAMPLE_MEDICINAL],
];
/** How React writes text into markup. */
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
/** The fixtures carry no summary of their own, so give the product one we can look for: the old model-written line. */
const OLD_SUMMARY = "An old model-written summary line that must not sit beside a code-decided pill.";

type Built = ReturnType<typeof pillsFor>;
const render = (built: Built, over?: { product?: Partial<Built["product"]>; model?: Partial<PillsPageModel> }) => {
  const product = { ...built.product, ...over?.product };
  const model = { ...built.model, ...over?.model };
  return renderToStaticMarkup(<PillsPage product={product} brand={built.brand} model={model} />);
};
const page = (review: ProductReview) => {
  const built = pillsFor(review, deriveVerdict(review));
  const product = { ...built.product, summary: OLD_SUMMARY, suitabilityTags: ["Oily skin"] };
  return { product, model: built.model, html: render(built, { product }) };
};
/** The markup from the first marker to the nearest of the later ones. Fails loudly when the first marker is not on the page. */
const between = (html: string, from: string, ...to: string[]): string => {
  const start = html.indexOf(from);
  expect(start, `${from} is on the page`).toBeGreaterThanOrEqual(0);
  const ends = to.map((m) => html.indexOf(m, start + from.length)).filter((i) => i > 0);
  return html.slice(start, ends.length ? Math.min(...ends) : undefined);
};

describe.each(FIXTURES)("the pills page, %s", (_name, review) => {
  const { model, html } = page(review);

  it("the summary line is today's logic, unchanged: not a sentence written for the pills page", () => {
    const sentence = [model.take.summary, model.take.recommendation].filter(Boolean).join(" ");
    expect(sentence.length).toBeGreaterThan(20);
    expect(html.split(esc(OLD_SUMMARY)).length - 1, "today's summary line, once").toBe(1);
    expect(html, "the pills page's own sentence is not used as the summary").not.toContain(esc(sentence));
  });

  it("At a glance shows keywords only: none of the model's explainer lines is printed there", () => {
    // Nothing verified, nothing drawn: the strip is left out rather than shown as a row of grey chips (checked below).
    if (model.highlights.length === 0) return;
    const section = between(html, 'id="at-a-glance"', 'id="fit"', 'id="where-to-buy"');
    for (const h of model.highlights) {
      expect(section, h.label).toContain(esc(h.label));
      if (h.detail) expect(section, `explainer for ${h.label}`).not.toContain(esc(h.detail));
    }
  });

  it("At a glance stays visible and explains missing evidence without inventing verified checks", () => {
    expect(html).toContain('id="at-a-glance"');
    if (model.highlights.length === 0) {
      expect(html).toContain('No verified checks to show yet.');
      expect(html).toContain('href="#claim-check"');
      expect(html).toContain('href="#gaps"');
    } else expect(html).not.toContain('No verified checks to show yet.');
    expect(html).not.toContain("(not known)");
    expect(html).not.toContain('data-tone="na"');
  });

  it("the Regulatory check says nothing about our reference data", () => {
    const block = between(html, 'id="regulatory-check"', 'id="ingredients"');
    expect(block).not.toMatch(/reference (data|database)|not covered|not in our|Not fully checked/i);
    expect(html).not.toMatch(/not covered by our reference/i);
  });

  it("the take is one rating circle in the decision's colour, with no verdict word and no confidence, and nowhere shows an old standing", () => {
    expect(html.split('aria-label="The Clean Sheet rating"').length - 1, "one take on the page").toBe(1);
    const take = between(html, 'aria-label="The Clean Sheet rating"', 'id="at-a-glance"', 'id="fit"', 'id="where-to-buy"');
    expect(take).toContain(`data-marker="${model.pill.marker ?? "none"}"`);
    expect(take).toContain(`aria-label="Rating: ${model.pill.marker ?? "grey"}"`);
    for (const word of [model.pill.label, "Good choice", "Buy with caution", "Look elsewhere", "Not enough info", "Medicinal product", "Confidence"]) expect(take, word).not.toContain(word);
    for (const old of OLD_STANDINGS) expect(html, old).not.toContain(old);
  });

  it("the circle is filled with its own colour: no arcs, no meter, no script", () => {
    const take = between(html, 'aria-label="The Clean Sheet rating"', 'id="at-a-glance"', 'id="fit"', 'id="where-to-buy"');
    const c = model.pill.marker ? MARKER_COLOURS[model.pill.marker] : NEUTRAL_COLOURS;
    expect(take).toContain(`background:${c.ring}`);
    expect(take).not.toContain("<circle");
    expect(take).not.toContain("cs-conf");
    expect(html).not.toContain("<script");
  });

  it("carries the design from the take to the questions, in order", () => {
    const ids = [...(model.highlights.length ? ["at-a-glance"] : []), "where-to-buy", "key-ingredients", "claim-check", "regulatory-check", "ingredients", ...(model.details ? ["details"] : []), "gaps", ...(model.howToUse ? ["how-to-use"] : []), "faq"];
    let at = html.indexOf('aria-label="The Clean Sheet rating"');
    expect(at).toBeGreaterThan(0);
    for (const id of ids) { const i = html.indexOf(`id="${id}"`, at + 1); expect(i, id).toBeGreaterThan(at); at = i; }
  });

  it("the questions run in two columns, all closed, and every question is there", () => {
    const faq = between(html, 'id="faq"', "</section>");
    expect(faq.match(/flex-\[1_1_480px\]/g)?.length).toBe(model.faq.length > 1 ? 2 : 1);
    expect(faq).not.toMatch(/<details[^>]*\sopen/);
    expect(faq.match(/<details/g)?.length).toBe(model.faq.length);
    for (const f of model.faq) { expect(faq, f.q).toContain(esc(f.q)); expect(faq, f.q).toContain(esc(f.a)); }
  });
});

describe("today's hero is untouched by the pills page", () => {
  const review = SAMPLE_MINIMALIST_B5;
  const mapped = reviewToScorecard(review, deriveVerdict(review));
  const { brand, brandSlug } = mapped;
  const product = { ...mapped.product, summary: OLD_SUMMARY, suitabilityTags: ["Oily skin"], indiaContext: "An India paragraph that today's hero shows." };
  const html = renderToStaticMarkup(<ProductHero product={product} brand={brand} brandSlug={brandSlug} okCount={0} warnCount={0} infoCount={0} />);

  it("the file knows nothing of the pills page: it is exactly the page flag-off visitors see", () => {
    const source = readFileSync(fileURLToPath(new URL("./ProductHero.tsx", import.meta.url)), "utf8");
    expect(source).not.toMatch(/pills/i);
  });

  it("has no caption under the title: the date is only in the price line, once", () => {
    expect(html.split("Analysed").length - 1).toBe(1);
    expect(html).toContain("• Analysed");
  });

  it("still has Best for, Avoid if, the price and date line and India Context, and no fit block", () => {
    for (const kept of ["Best for", "Analysed", "India Context", "An India paragraph that today&#x27;s hero shows."]) expect(html, kept).toContain(kept);
    expect(html).not.toContain("How it fits you and the Indian market");
  });

  it("still shows the old summary line", () => {
    expect(html).toContain(esc(OLD_SUMMARY));
  });

  it("still draws the standing stamp and no pill", () => {
    expect(html).not.toContain("cs-verdict");
    expect(html).not.toContain("Confidence:");
    const label = TIER_STYLES[resolveTier(product)].label.replace(/^Clean Sheet\s+/i, "").toUpperCase().split(" ")[0];
    expect(html.toUpperCase()).toContain(label);
  });
});

describe("key actives on the pills page: the short name at the top, the full detail further down", () => {
  const MEXORYL = "Mexoryl 400 (Methoxypropylamino Cyclohexenylidene Ethoxyethylcyanoacetate)";
  const GROUP = "Multiple Broad-Spectrum UV Filters (e.g., Ethylhexyl Salicylate, Butyl Methoxydibenzoylmethane)";
  const review = rv({
    productName: "Fluid SPF 50", category: "Sunscreen",
    keyActivesRead: [{ name: MEXORYL, function: "UV filter", concentrationConfidence: "Low" }, { name: GROUP, function: "UV filters", concentrationConfidence: "Low" }],
    inciIngredients: [...BASE, "Methoxypropylamino Cyclohexenylidene Ethoxyethylcyanoacetate", "Ethylhexyl Salicylate", "Butyl Methoxydibenzoylmethane"],
  });
  const { html } = page(review);

  it("the summary line and the Key Ingredients row name Mexoryl 400 and nothing longer", () => {
    expect(html).not.toContain("Mexoryl 400 (");
    expect(html).not.toContain("Multiple Broad-Spectrum UV Filters");
    expect(html).not.toContain("e.g.,");
    const row = between(html, 'id="key-ingredients"', "View all ingredients");
    expect(row).toContain("Mexoryl 400");
  });

  it("nothing is lost: the chemical name and the filters are in the ingredient list below", () => {
    for (const n of ["Methoxypropylamino Cyclohexenylidene Ethoxyethylcyanoacetate", "Ethylhexyl Salicylate", "Butyl Methoxydibenzoylmethane"]) expect(html, n).toContain(n);
  });

  it("'View all ingredients' links to the Ingredients card and is a link a script can also use to open it", () => {
    expect(html.split('href="#ingredients"').length - 1).toBe(1);
    expect(html).toContain('id="ingredients"');
  });

  it("the Regulatory check reads None prohibited here, and the coverage gap is still listed under Gaps", () => {
    const block = between(html, 'id="regulatory-check"', 'id="ingredients"');
    expect(block).toContain("None prohibited");
    expect(block).not.toMatch(/reference (data|database)/i);
    expect(html).toContain("Reference data for every listed ingredient");
  });

  it("The detail block says nothing about our reference data here either, while Gaps still lists the gap", () => {
    const block = between(html, 'id="details"', 'id="gaps"');
    expect(block).toContain("Ingredient safety");
    expect(block).not.toMatch(/reference (data|database)|not covered|not in our/i);
    expect(between(html, 'id="gaps"', 'id="how-to-use"', 'id="faq"')).toContain("Reference data for every listed ingredient");
  });
});

describe("the Ingredients list shows just the name for an ingredient we hold no row for", () => {
  const review = rv({ productName: "Gel Cream", category: "Moisturizer", inciIngredients: [...BASE, "Zorbaflux Glycoside", "Quillian Extract", "Parfum"] });
  const { html } = page(review);
  const block = between(html, 'data-list="ingredients"', "</ul>");
  const row = (name: string) => block.slice(block.indexOf(`>${name}<`), block.indexOf("</li>", block.indexOf(`>${name}<`)));

  it("the name is there, the note is not", () => {
    for (const n of ["Zorbaflux Glycoside", "Quillian Extract", "Parfum"]) expect(block, n).toContain(`>${n}<`);
    expect(html).not.toMatch(/not in our|analysed database|assessed from public sources/i);
  });

  it("with no flag on it the dot is neutral and read out as 'not rated', never green and 'no concern'", () => {
    for (const n of ["Zorbaflux Glycoside", "Quillian Extract"]) {
      expect(row(n), n).toContain("(not rated)");
      expect(row(n), n).not.toContain("(no concern)");
    }
    expect(block.split("background-color:#d9d4cc").length - 1).toBeGreaterThanOrEqual(2);
  });

  it("a flag the name itself earns is kept: Parfum is still worth noting, and stands out in the pills above the list", () => {
    expect(row("Parfum")).toContain("(worth noting)");
    expect(row("Parfum")).not.toContain("#d9d4cc");
    expect(between(html, 'aria-label="Key and flagged ingredients"', "</ul>")).toMatch(/data-tone="amber">Parfum</);
  });

  it("an ingredient we do hold keeps its green dot", () => {
    const water = row("Aqua");
    expect(water.length).toBeGreaterThan(0);
    expect(water).toContain("(no concern)");
    expect(water).not.toContain("#d9d4cc");
  });
});

describe("when a part of the model is empty, that part is left out and the rest stands", () => {
  const base = SAMPLE_MINIMALIST_B5;
  const built = pillsFor(base, deriveVerdict(base));
  const withProduct = { suitabilityTags: ["Oily skin"], indiaContext: "" };

  it("nothing to put in the fit block: no fit cards and no India card, and today's Best for list does not come back", () => {
    const html = render(built, { product: withProduct, model: { fit: { ...built.model.fit, suits: [], careful: [], india: "" } } });
    for (const gone of ['id="fit"', "How it fits you and the Indian market", 'id="in-india"', "Best for", "Avoid if"]) expect(html, gone).not.toContain(gone);
    for (const kept of ['id="where-to-buy"', 'id="key-ingredients"', 'aria-label="The Clean Sheet rating"']) expect(html, kept).toContain(kept);
  });

  it("nothing verified for At a glance: explain the gap and keep the fit cards and other sections", () => {
    const html = render(built, { model: { highlights: [], fit: { ...built.model.fit, suits: ["High UV protection"], careful: [] } } });
    for (const kept of ['id="at-a-glance"', '>At a glance<', 'No verified checks to show yet.']) expect(html, kept).toContain(kept);
    for (const kept of ['id="fit"', "Who it suits", 'id="where-to-buy"', 'aria-label="The Clean Sheet rating"']) expect(html, kept).toContain(kept);
  });

  it("a strip with ticks and a cross draws each as a keyword, ticks before the cross, and nothing grey", () => {
    const html = render(built, { model: { highlights: [{ label: "Fragrance free", state: "yes" }, { label: "Paraben free", state: "yes" }, { label: "Alcohol free", state: "no" }] } });
    const section = between(html, 'id="at-a-glance"', 'id="fit"', 'id="where-to-buy"');
    expect(section.indexOf("Fragrance free")).toBeLessThan(section.indexOf("Alcohol free"));
    expect(section.indexOf("Paraben free")).toBeLessThan(section.indexOf("Alcohol free"));
    expect(section).toContain('data-tone="ok"');
    expect(section).toContain('data-tone="no"');
    expect(section).not.toContain('data-tone="na"');
    expect(section).not.toContain("(not known)");
  });

  it("only one of the two fit lists: the other card is not drawn", () => {
    const html = render(built, { model: { fit: { ...built.model.fit, suits: ["High UV protection"], careful: [] } } });
    expect(html).toContain("Who it suits");
    expect(html).not.toContain("Who should be careful");
  });

  it("no key actives: the card keeps its title and the link to the full list", () => {
    const html = render(built, { model: { keyActives: [] } });
    const row = between(html, 'id="key-ingredients"', "View all ingredients");
    expect(row).toContain("Key Ingredients");
    expect(html).toContain("View all ingredients");
  });

  it("no cheat code: the gaps stand alone; no gaps and no cheat code: the section is gone", () => {
    const alone = render(built, { model: { cheatCode: null, gaps: ["A gap we can name."] } });
    expect(alone).toContain("A gap we can name.");
    expect(alone).not.toContain('id="cheat-code"');
    const none = render(built, { model: { cheatCode: null, gaps: [] } });
    expect(none).not.toContain('id="gaps"');
    expect(none).not.toContain("Gaps, and what would strengthen this analysis");
  });

  it("no retailer: the block says to check the brand site; one with no address is a plain chip, not a link; the price we last saw is in the tooltip and read out, never drawn on the chip", () => {
    expect(render(built, { model: { buyLinks: [] } })).toContain("Check brand website");
    const links: BuyLink[] = [
      { name: "Shop One", url: "https://example.com/p?a=1&b=2", price: "Rs.499", direct: true },
      { name: "Shop Two", url: null, price: null, direct: false },
      { name: "Shop Three", url: null, price: "Rs.350", direct: false },
    ];
    const where = between(render(built, { model: { buyLinks: links } }), 'id="where-to-buy"', 'id="in-india"', 'id="key-ingredients"');
    expect(where.split("<a ").length - 1, "only the one with an address is a link").toBe(1);
    expect(where).toContain('href="https://example.com/p?a=1&amp;b=2"');
    expect(where.split("border-dashed").length - 1, "the two with no address are plain chips").toBe(2);
    expect(where).toContain('title="Shop One, last seen at Rs.499"');
    expect(where).toContain('title="Shop Three, last seen at Rs.350"');
    expect(where, "no price drawn on a chip").not.toMatch(/>Rs\.\d/);
    expect(where, "nothing about a price where we hold none").toContain('title="Shop Two"');
    expect(where, "no price text where we hold none").not.toMatch(/Price not available|Rs\.\s*<|null|undefined/);
    expect(where, "no search note when every link is the product's own page").not.toContain("links search the retailer");
  });

  it("Where to buy is one small row beside the overview: no tall cards, no wrapping, no empty space", () => {
    const html = render(built, { model: { buyLinks: [
      { name: "Flipkart", url: "https://www.flipkart.com/search?q=x", price: "Rs.1690", direct: false },
      { name: "Nykaa", url: "https://www.nykaa.com/search/result/?q=x", price: "Rs.1950", direct: false },
      { name: "Ubuy India", url: null, price: "Rs.3944", direct: false },
      { name: "Apollo Pharmacy", url: null, price: "Rs.1288", direct: false },
    ] } });
    const band = between(html, 'class="min-w-0 lg:flex-1', 'id="in-india"', 'id="key-ingredients"');
    // one row on a wide screen: the overview takes the room left over, Where to buy is as wide as its chips (up to 58% of the row), both centred
    const row = html.slice(html.lastIndexOf("<section", html.indexOf('class="min-w-0 lg:flex-1')), html.indexOf('id="where-to-buy"'));
    expect(row).toContain("lg:flex-row");
    expect(row).toContain("lg:items-center");
    expect(band).toContain("lg:max-w-[58%]");
    // chips as small as their words, on one line that never wraps (it scrolls sideways on a phone)
    const where = between(html, 'id="where-to-buy"', 'id="in-india"', 'id="key-ingredients"');
    expect(where).toContain("rounded-full");
    expect(where, "the old two-by-two cards are gone").not.toMatch(/grid-cols-2|min-h-\[72px\]|h-full/);
    expect(where.match(/<li/g)?.length).toBe(4);
    expect(where, "one line").toContain("flex-nowrap");
    expect(where, "one line").not.toContain("flex-wrap gap-2");
    expect(where, "small type").toContain("text-[11px]");
    expect(where, "no per-chip 'search' word").not.toContain("· search");
    // each retailer is its own chip, named; its price is in the tooltip; the heading says once that the links search
    for (const [n, p] of [["Flipkart", "Rs.1690"], ["Nykaa", "Rs.1950"], ["Ubuy India", "Rs.3944"], ["Apollo Pharmacy", "Rs.1288"]]) {
      const chip = where.slice(where.indexOf(`>${n}`), where.indexOf("</li>", where.indexOf(`>${n}`)));
      expect(chip, n).toContain(`last seen at ${p}`);
    }
    expect(where).toContain("links search the retailer");
    expect(where, "no prices line beside the heading").not.toContain("prices as last seen");
  });

  it("an analysis date we cannot read shows no caption, and never 'Invalid Date'", () => {
    const html = render(built, { product: { analyzedAt: "not a date" } });
    expect(between(html, "<h1", 'id="where-to-buy"')).not.toContain("Analysed ");
    expect(html).not.toContain("Invalid Date");
  });
});
