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
import { PILL } from "@/components/scorecards/pills-ui";
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
const AFTER_INGREDIENTS = ['id="details"', 'id="gaps"', 'id="how-to-use"', 'id="faq"'];

describe.each(FIXTURES)("the pills page, %s", (_name, review) => {
  const { product, model, html } = page(review);

  it("the summary line is today's logic, unchanged: not a sentence written for the pills page", () => {
    const sentence = [model.take.summary, model.take.recommendation].filter(Boolean).join(" ");
    expect(sentence.length).toBeGreaterThan(20);
    expect(html.split(esc(OLD_SUMMARY)).length - 1, "today's summary line, once").toBe(1);
    expect(html, "the pills page's own sentence is not used as the summary").not.toContain(esc(sentence));
  });

  it("At a glance shows keywords only: none of the model's explainer lines is printed there", () => {
    const section = between(html, 'id="at-a-glance"', 'id="fit"', 'id="where-to-buy"');
    expect(model.highlights.length).toBeGreaterThan(0);
    for (const h of model.highlights) {
      expect(section, h.label).toContain(esc(h.label));
      if (h.detail) expect(section, `explainer for ${h.label}`).not.toContain(esc(h.detail));
    }
  });

  it("the Regulatory check says nothing about our reference data", () => {
    const block = between(html, 'id="regulatory-check"', 'id="ingredients"');
    expect(block).not.toMatch(/reference (data|database)|not covered|not in our|Not fully checked/i);
    expect(html).not.toMatch(/not covered by our reference/i);
  });

  it("the take shows the pill and its confidence, and nowhere shows an old standing", () => {
    expect(html.split('aria-label="The Clean Sheet take"').length - 1, "one take on the page").toBe(1);
    const take = between(html, 'aria-label="The Clean Sheet take"', 'id="at-a-glance"', 'id="fit"', 'id="where-to-buy"');
    expect(take).toContain(model.pill.label);
    expect(take).toContain(`Confidence: ${model.take.confidence.label}`);
    for (const old of OLD_STANDINGS) expect(html, old).not.toContain(old);
  });

  it("the ring's three arcs and the meter's three bars fill with the confidence, in the pill's own colours", () => {
    const take = between(html, 'aria-label="The Clean Sheet take"', 'id="at-a-glance"', 'id="fit"', 'id="where-to-buy"');
    const on = { high: 3, medium: 2, low: 1 }[model.take.confidence.level];
    const p = PILL[model.pill.tone];
    // The pill's own icon may be drawn with circles too, so count the ring's arcs (radius 35) only.
    expect(take.match(/<circle [^>]*r="35"/g)?.length).toBe(3);
    expect(take.split(`stroke="${p.ring}"`).length - 1, "filled arcs").toBe(on);
    expect(take.split(`stroke="${p.off}"`).length - 1, "empty arcs").toBe(3 - on);
    expect(take.split("data-on=").length - 1, "filled bars").toBe(on);
    expect(take.match(/class="cs-conf__bar"/g)?.length ?? 0, "all three bars are drawn").toBe(3);
  });

  it("lists every retailer the model holds, as a link when it holds an address, and says to check the brand site when it holds none", () => {
    const where = between(html, 'id="where-to-buy"', 'id="in-india"', 'id="key-ingredients"', 'id="claim-check"');
    const amp = (u: string) => u.replace(/&/g, "&amp;");
    if (model.buyLinks.length) {
      for (const b of model.buyLinks) {
        expect(where).toContain(b.name);
        if (b.url) expect(where.split(`href="${amp(b.url)}"`).length - 1, `${b.name} link, once`).toBe(1);
      }
      expect(where.split("<a ").length - 1, "one link per address").toBe(model.buyLinks.filter((b) => b.url).length);
    } else expect(where).toContain("Check brand website");
  });

  it("has one heading, no feedback block and the independence note, and does not draw today's hero", () => {
    expect(html.match(/<h1[ >]/g)?.length).toBe(1);
    expect(html).not.toContain("data-hero-actions=");
    expect(html).not.toContain("Add feedback");
    expect(html.split("Independent and free").length - 1).toBe(1);
  });

  it("'How it fits you and the Indian market' stands beside At a glance, in place of Best for, Avoid if, the price line and India Context", () => {
    const { suits, careful, india } = model.fit;
    const top = html.slice(0, html.indexOf('id="claim-check"'));
    for (const gone of ["Best for", "Avoid if", "India Context", "• Analysed"]) expect(top, gone).not.toContain(gone);
    if (suits.length || careful.length) {
      expect(html.split("How it fits you and the Indian market").length - 1, "once, not repeated further down").toBe(1);
      expect(html.indexOf("How it fits you and the Indian market")).toBeLessThan(html.indexOf('id="where-to-buy"'));
      for (const item of [...suits, ...careful]) expect(top, item).toContain(esc(item));
    } else expect(html).not.toContain("How it fits you and the Indian market");
    if (india) expect(between(html, 'id="in-india"', 'id="key-ingredients"')).toContain(esc(india));
    else expect(html).not.toContain('id="in-india"');
  });

  it("shows 'Analysed <date>' once, as a small caption beside the category, between the title and the summary", () => {
    const top = between(html, "<h1", 'id="where-to-buy"');
    expect(top.match(/Analysed \d{1,2} \w+ \d{4}/g)?.length).toBe(1);
    expect(top.indexOf("Analysed"), "after the title").toBeGreaterThan(top.indexOf("</h1>"));
    expect(html.indexOf("Analysed"), "before the summary line").toBeLessThan(html.indexOf(esc(OLD_SUMMARY)));
    expect(top).not.toContain("• Analysed");
  });

  it("has no separate take card and no reason note", () => {
    expect(html).not.toContain('id="take"');
    expect(html).not.toContain("Worth knowing");
    if (model.take.reason) expect(html.slice(0, html.indexOf('id="claim-check"')), "the reason is not repeated under the summary").not.toContain(esc(model.take.reason));
  });

  it("the Ingredients list never prints the generic 'not in our database' note", () => {
    const block = between(html, 'id="ingredients"', ...AFTER_INGREDIENTS);
    expect(block).not.toMatch(/not in our|analysed database|assessed from public sources/i);
  });

  it("the Ingredients list holds every ingredient, once, in label order", () => {
    const list = between(html, 'data-list="ingredients"', "</ul>");
    expect(list.match(/<li /g)?.length ?? 0).toBe(product.ingredients.length);
    let at = -1;
    for (const i of product.ingredients) { const found = list.indexOf(`>${esc(i.name)}<`, at + 1); expect(found, i.name).toBeGreaterThan(at); at = found; }
  });

  it("The detail block says nothing about our reference data", () => {
    if (!model.details) return expect(html, "a medicine, or a page we could not read, has no detail block").not.toContain('id="details"');
    const block = between(html, 'id="details"', 'id="gaps"', 'id="how-to-use"', 'id="faq"');
    expect(block.length).toBeGreaterThan(200);
    expect(block).not.toMatch(/reference (data|database)|not covered|not in our/i);
  });

  it("The detail lists its rows in order, each with its rating word and tone, and opens the first", () => {
    if (!model.details) return;
    const block = between(html, 'id="details"', 'id="gaps"', 'id="how-to-use"', 'id="faq"');
    let at = -1;
    for (const d of model.details) {
      const i = block.indexOf(esc(d.title), at + 1);
      expect(i, d.title).toBeGreaterThan(at);
      at = i;
      expect(block, `${d.title} rating`).toContain(`data-tone="${d.rating.tone}">${esc(d.rating.word)}</span>`);
    }
    expect(block.match(/<details/g)?.length).toBe(model.details.length);
    if (model.details[0].body.length) expect(block.indexOf("<details open"), "the first row starts open").toBe(block.indexOf("<details"));
  });

  it("the claim bar has one segment per claim, filled in the same count as the one-liner says", () => {
    const claims = product.claimsCheck ?? [];
    const card = between(html, 'id="claim-check"', 'id="regulatory-check"');
    if (!claims.length) return expect(card).toContain("We found no marketing claims to check.");
    const bar = between(card, 'role="img"', "</div>");
    const supported = claims.filter((c) => c.decision === "Publicly supported").length;
    expect(bar.match(/class="pp-seg"/g)?.length, "one segment per claim").toBe(claims.length);
    expect(bar.split('data-k="y"').length - 1, "supported").toBe(supported);
    expect(model.claimCheck.oneLiner).toContain(`${supported} of ${claims.length}`);
    expect(card, "the one-liner heads the card").toContain(esc(model.claimCheck.oneLiner));
    for (const c of claims) expect(card, c.claim).toContain(esc(c.claim));
  });

  it("the Regulatory check has a chip for every authority and a line for each, with its result", () => {
    const panel = model.regulatoryCheck.panel;
    const card = between(html, 'id="regulatory-check"', 'id="ingredients"');
    expect(card).toContain(esc(model.regulatoryCheck.oneLiner));
    if (!panel) return;
    expect(card.match(/class="pp-chip"/g)?.length).toBe(panel.authorities.length);
    for (const a of panel.authorities) {
      expect(card, a.label).toContain(esc(a.label));
      expect(card, `${a.label} result`).toContain(`· ${a.result}.`);
    }
    expect(card.split('data-tone="no"').length - 1, "a chip is red only when an authority is failed").toBe(panel.authorities.filter((a) => a.result === "Falls short").length);
  });

  it("opens the claim check; the other two cards start closed; every row is a native <details>", () => {
    expect(between(html, 'id="claim-check"', 'id="regulatory-check"').indexOf("<details open")).toBeGreaterThan(0);
    expect(between(html, 'id="regulatory-check"', 'id="ingredients"')).not.toContain("<details open");
    expect(between(html, 'id="ingredients"', ...AFTER_INGREDIENTS)).not.toContain("<details open");
    expect(html).not.toContain("<script");
  });

  it("carries the design from the take to the questions, in order", () => {
    const ids = ["at-a-glance", "where-to-buy", "key-ingredients", "claim-check", "regulatory-check", "ingredients", ...(model.details ? ["details"] : []), "gaps", ...(model.howToUse ? ["how-to-use"] : []), "faq"];
    let at = html.indexOf('aria-label="The Clean Sheet take"');
    expect(at).toBeGreaterThan(0);
    for (const id of ids) { const i = html.indexOf(`id="${id}"`, at + 1); expect(i, id).toBeGreaterThan(at); at = i; }
  });

  it("the questions run in two columns, the first open, and every question is there", () => {
    const faq = between(html, 'id="faq"', "</section>");
    expect(faq.match(/flex-\[1_1_480px\]/g)?.length).toBe(model.faq.length > 1 ? 2 : 1);
    expect(faq.indexOf("<details open")).toBe(faq.indexOf("<details"));
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
    for (const kept of ['id="at-a-glance"', 'id="where-to-buy"', 'id="key-ingredients"', 'aria-label="The Clean Sheet take"']) expect(html, kept).toContain(kept);
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

  it("no retailer: the block says to check the brand site; one with no address is a plain chip, not a link; a price is shown only when we hold one", () => {
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
    expect(where).toContain("Rs.499");
    expect(where).toContain("Rs.350");
    expect(where, "no price text where we hold none").not.toMatch(/Price not available|Rs\.\s*<|null|undefined/);
    expect(where, "no search note when every link is the product's own page").not.toContain("links search the retailer");
    expect(where, "prices are labelled as last seen").toContain("prices as last seen");
  });

  it("Where to buy sits beside the overview and takes only the height of its chips: no tall cards, no empty space", () => {
    const html = render(built, { model: { buyLinks: [
      { name: "Flipkart", url: "https://www.flipkart.com/search?q=x", price: "Rs.1690", direct: false },
      { name: "Nykaa", url: "https://www.nykaa.com/search/result/?q=x", price: "Rs.1950", direct: false },
      { name: "Ubuy India", url: null, price: "Rs.3944", direct: false },
      { name: "Apollo Pharmacy", url: null, price: "Rs.1288", direct: false },
    ] } });
    const band = between(html, 'class="min-w-0 lg:flex-1', 'id="in-india"', 'id="key-ingredients"');
    // one row on a wide screen: the overview takes the room left over, Where to buy a fixed share, both from the top
    const row = html.slice(html.lastIndexOf("<section", html.indexOf('class="min-w-0 lg:flex-1')), html.indexOf('id="where-to-buy"'));
    expect(row).toContain("lg:flex-row");
    expect(row).toContain("lg:items-center");
    expect(band).toContain("lg:w-[44%]");
    // chips as small as their words
    const where = between(html, 'id="where-to-buy"', 'id="in-india"', 'id="key-ingredients"');
    expect(where).toContain("rounded-full");
    expect(where, "the old two-by-two cards are gone").not.toMatch(/grid-cols-2|min-h-\[72px\]|h-full/);
    expect(where.match(/<li/g)?.length).toBe(4);
    // each retailer's name, price and (for a link) arrow is in its own chip, and the link says it searches
    for (const [n, p] of [["Flipkart", "Rs.1690"], ["Nykaa", "Rs.1950"], ["Ubuy India", "Rs.3944"], ["Apollo Pharmacy", "Rs.1288"]]) {
      const chip = where.slice(where.indexOf(`>${n}<`), where.indexOf("</li>", where.indexOf(`>${n}<`)));
      expect(chip, n).toContain(p);
    }
    expect(where).toContain("links search the retailer, prices as last seen");
  });

  it("an analysis date we cannot read shows no caption, and never 'Invalid Date'", () => {
    const html = render(built, { product: { analyzedAt: "not a date" } });
    expect(between(html, "<h1", 'id="where-to-buy"')).not.toContain("Analysed ");
    expect(html).not.toContain("Invalid Date");
  });
});
