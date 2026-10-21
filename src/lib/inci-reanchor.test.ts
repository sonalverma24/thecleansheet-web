import { describe, expect, it, vi } from "vitest";
import {
  classifySource, compareInciSequences, decideReanchor, guardedWrite, quoteHoldsList, reanchorRows, snapshotFromIncidecoder,
  proseLikeEntries, snapshotFromPage, splitVariants, summarise, withInciEvidence,
  type ReviewTable, type SnapshotFetch, type SourceSnapshot, type StoredIdentity,
} from "@/lib/inci-reanchor";
import { fetchIncidecoderProduct, incidecoderProductSlug, parseProductPage } from "@/lib/inci-fetch";
import { evidenceForReview, isAnchored } from "@/lib/review-verifier";
import type { ProductReview } from "@/lib/product-review-types";

const LIST = ["Aqua", "Glycerin", "Niacinamide", "Cetearyl Alcohol", "Phenoxyethanol", "Tocopherol"];
const quoteOf = (items: string[]) => items.map((i) => `[${i}]`).join(", ");

const stored = (over: Partial<StoredIdentity> = {}): StoredIdentity => ({
  brand: "AntiNorm", productName: "AntiNorm Facial In A Flash", inci: LIST, ...over,
});

const incidecoder = (over: Partial<SourceSnapshot> = {}): SourceSnapshot => ({
  kind: "incidecoder", url: "https://incidecoder.com/products/antinorm-facial-in-a-flash",
  titles: ["AntiNorm Facial In A Flash"], brandNames: ["AntiNorm"], brandRule: "equal",
  ingredients: LIST, quote: quoteOf(LIST), quoteComplete: true, ...over,
});

const codes = (s: StoredIdentity, t: SourceSnapshot) => decideReanchor(s, t).failures.map((f) => f.code);

describe("splitVariants", () => {
  it("treats spacing and case of a size or rating as the same variant", () => {
    expect(splitVariants("Gel 30 ml").variants).toEqual(splitVariants("Gel 30ML").variants);
    expect(splitVariants("Sunscreen SPF 50 Pa ++++").variants).toEqual(splitVariants("Sunscreen SPF50 PA++++").variants);
  });

  it("keeps different sizes, ratings and plus signs apart", () => {
    expect(splitVariants("Gel 30ml").variants).not.toEqual(splitVariants("Gel 50ml").variants);
    expect(splitVariants("Sunscreen SPF 50").variants).not.toEqual(splitVariants("Sunscreen SPF 50+").variants);
    expect(splitVariants("Sunscreen PA+++").variants).not.toEqual(splitVariants("Sunscreen PA++++").variants);
    expect(splitVariants("Serum 5%").variants).not.toEqual(splitVariants("Serum 10%").variants);
  });

  it("takes shade and variant numbers out of the name words", () => {
    const a = splitVariants("Matte Lipstick Shade 03");
    expect(a.variants).toEqual(["03"]);
    expect(a.rest).not.toMatch(/03/);
    expect(splitVariants("Matte Lipstick Shade 3").variants).toEqual(["3"]);
  });

  it("normalises unit spellings", () => {
    expect(splitVariants("Balm 50 gm").variants).toEqual(splitVariants("Balm 50g").variants);
    expect(splitVariants("Bottle 1.5 fl oz").variants).toEqual(splitVariants("Bottle 1.5 FL.OZ").variants);
  });
});

describe("compareInciSequences", () => {
  it("is exact when the ordered inciKey sequence is the same, including display synonyms", () => {
    const d = compareInciSequences(["Aqua (Water)", "Glycerin", "Parfum"], ["Water", "Glycerin", "Fragrance"]);
    expect(d.exact).toBe(true);
    expect(d.kind).toBe("identical");
    expect(d.firstDivergence).toBeNull();
  });

  it("calls the same entries in another order reordered, with the first difference", () => {
    const d = compareInciSequences(LIST, [LIST[0], LIST[2], LIST[1], ...LIST.slice(3)]);
    expect(d.exact).toBe(false);
    expect(d.kind).toBe("reordered");
    expect(d.firstDivergence).toEqual({ index: 1, stored: "Glycerin", source: "Niacinamide" });
    expect(d.onlyInStored).toEqual([]);
    expect(d.onlyInSource).toEqual([]);
  });

  it("reports an entry the source added or removed", () => {
    const added = compareInciSequences(LIST, [...LIST, "Citric Acid"]);
    expect(added.kind).toBe("changed");
    expect(added.onlyInSource).toEqual(["Citric Acid"]);
    const removed = compareInciSequences(LIST, LIST.slice(0, -1));
    expect(removed.kind).toBe("changed");
    expect(removed.onlyInStored).toEqual(["Tocopherol"]);
  });

  it("counts duplicates", () => {
    const d = compareInciSequences([...LIST, "Glycerin"], LIST);
    expect(d.exact).toBe(false);
    expect(d.kind).toBe("changed");
    expect(d.onlyInStored).toEqual(["Glycerin"]);
    expect(d.repeatedDifferently).toEqual(["Glycerin"]);
    expect(compareInciSequences(["Aqua", "Aqua", "Glycerin"], ["Aqua", "Glycerin", "Glycerin"]).exact).toBe(false);
  });

  it("will not call a list exact when an entry has no comparable name", () => {
    const d = compareInciSequences(["Aqua", "...", "Glycerin"], ["Aqua", "...", "Glycerin"]);
    expect(d.exact).toBe(false);
    expect(d.kind).toBe("unkeyed");
  });

  it("does not use similarity: one entry out of sixty is still not exact", () => {
    const sixty = Array.from({ length: 60 }, (_, i) => `Ingredient ${String.fromCharCode(97 + (i % 26))}${i}`);
    expect(compareInciSequences(sixty, sixty.slice(1)).exact).toBe(false);
    expect(compareInciSequences(sixty, sixty).exact).toBe(true);
  });
});

describe("decideReanchor: an exact match is anchorable", () => {
  it("anchors the same list for the same product and records the page's own title", () => {
    const d = decideReanchor(stored(), incidecoder());
    expect(d.anchorable).toBe(true);
    expect(d.failures).toEqual([]);
    expect(d.matchedTitle).toBe("AntiNorm Facial In A Flash");
  });

  it("accepts the brand repeated in the name, a name-only title and different casing", () => {
    expect(decideReanchor(stored({ productName: "Facial In A Flash" }), incidecoder()).anchorable).toBe(true);
    expect(decideReanchor(stored(), incidecoder({ titles: ["Facial In A Flash"] })).anchorable).toBe(true);
    expect(decideReanchor(stored({ productName: "ANTINORM facial in a flash" }), incidecoder()).anchorable).toBe(true);
  });

  it("accepts a re-ordering of words in the name, as the live identity does", () => {
    const s = stored({ brand: "Aclaris", productName: "Aclaris Photon ZIO Sunscreen Gel SPF 50 Pa ++++" });
    const t = incidecoder({ titles: ["Aclaris Photon ZIO Sunscreen Gel SPF 50 PA++++"], brandNames: ["Aclaris"] });
    expect(decideReanchor(s, t).anchorable).toBe(true);
  });
});

describe("decideReanchor: anything short of exact is queued, never approved", () => {
  it("queues a different brand", () => {
    expect(codes(stored(), incidecoder({ brandNames: ["AntiNorm Labs"] }))).toEqual(["BRAND"]);
    expect(codes(stored(), incidecoder({ brandNames: [] }))).toEqual(["BRAND"]);
  });

  it("queues name tokens that are a subset in either direction", () => {
    const pageHasMore = codes(stored(), incidecoder({ titles: ["AntiNorm Facial In A Flash Mini"] }));
    expect(pageHasMore).toEqual(["NAME"]);
    const reviewHasMore = codes(stored({ productName: "AntiNorm Facial In A Flash Mini" }), incidecoder());
    expect(reviewHasMore).toEqual(["NAME"]);
    const detail = decideReanchor(stored(), incidecoder({ titles: ["AntiNorm Facial In A Flash Mini"] })).failures[0].detail;
    expect(detail).toContain("only on the page: mini");
  });

  it("queues a page with no title of its own", () => {
    const f = codes(stored(), incidecoder({ titles: [] }));
    expect(f).toContain("NO_TITLE");
    expect(decideReanchor(stored(), incidecoder({ titles: [] })).anchorable).toBe(false);
  });

  it("queues different variants even when every name word matches", () => {
    const s = stored({ brand: "Aclaris", productName: "Aclaris Sunscreen Gel SPF 50" });
    const t = (title: string) => incidecoder({ titles: [title], brandNames: ["Aclaris"] });
    expect(codes(s, t("Aclaris Sunscreen Gel SPF 50+"))).toEqual(["VARIANT"]);
    expect(codes(s, t("Aclaris Sunscreen Gel SPF 30"))).toEqual(["VARIANT"]);
    expect(codes(s, t("Aclaris Sunscreen Gel"))).toEqual(["VARIANT"]);
    expect(codes(stored({ productName: "AntiNorm Cleanser 100ml" }), incidecoder({ titles: ["AntiNorm Cleanser 50ml"] }))).toEqual(["VARIANT"]);
    expect(codes(stored({ productName: "AntiNorm Serum 2" }), incidecoder({ titles: ["AntiNorm Serum"] }))).toEqual(["VARIANT"]);
  });

  it.each([
    ["reordered", [LIST[0], LIST[2], LIST[1], ...LIST.slice(3)]],
    ["added", [...LIST, "Citric Acid"]],
    ["removed", LIST.slice(1)],
    ["duplicated", [...LIST, "Glycerin"]],
  ])("queues a list with entries %s", (_label, source) => {
    const d = decideReanchor(stored(), incidecoder({ ingredients: source, quote: quoteOf(source) }));
    expect(d.anchorable).toBe(false);
    expect(d.failures.map((f) => f.code)).toEqual(["LIST"]);
    expect(d.matchedTitle).toBeNull();
    expect(d.diff.exact).toBe(false);
  });

  it("queues a missing, truncated or inconsistent quote", () => {
    expect(codes(stored(), incidecoder({ quote: "  " }))).toEqual(["NO_QUOTE"]);
    expect(codes(stored(), incidecoder({ quoteComplete: false }))).toEqual(["QUOTE_TRUNCATED"]);
    expect(codes(stored(), incidecoder({ quote: quoteOf(LIST.slice(0, 3)) }))).toEqual(["QUOTE_MISMATCH"]);
  });

  it("advises, without blocking, when a stored entry reads like page prose", () => {
    const prose = [...LIST, "Tocopherol Acetate. Care Instructions Store in a cool"];
    const d = decideReanchor(stored({ inci: prose }), incidecoder({ ingredients: prose, quote: quoteOf(prose) }));
    expect(d.anchorable).toBe(true);
    expect(d.advisories).toEqual(["Tocopherol Acetate. Care Instructions Store in a cool"]);
    expect(decideReanchor(stored(), incidecoder()).advisories).toEqual([]);
    expect(proseLikeEntries(["Vaccinum Sect. Cyanococcus (Blueberry) Fruit Extract", "Aqua", "x".repeat(71)])).toHaveLength(2);
  });

  it("queues an empty stored list", () => {
    expect(codes(stored({ inci: [] }), incidecoder())).toContain("NO_STORED_LIST");
  });

  it("reports every failing rule, not just the first", () => {
    const f = codes(stored(), incidecoder({ brandNames: ["Other"], titles: ["Other Thing"], ingredients: LIST.slice(1), quote: quoteOf(LIST.slice(1)) }));
    expect(f).toEqual(expect.arrayContaining(["LIST", "BRAND", "NAME"]));
  });
});

describe("decideReanchor: a brand's own page", () => {
  const page = (over: Partial<SourceSnapshot> = {}): SourceSnapshot => ({
    kind: "brand_page", url: "https://mamaearth.in/product/ubtan-face-wash",
    titles: ["Ubtan Face Wash | Mamaearth"], brandNames: [], brandRule: "named",
    ingredients: LIST, quote: "Ingredients: " + LIST.join(", "), quoteComplete: true, ...over,
  });
  const s = stored({ brand: "Mamaearth", productName: "Mamaearth Ubtan Face Wash" });

  it("anchors when the brand is named in the title and the name part matches", () => {
    const d = decideReanchor(s, page());
    expect(d.failures).toEqual([]);
    expect(d.matchedTitle).toBe("Ubtan Face Wash | Mamaearth");
  });

  it("strips storefront wording only at the edges of a title", () => {
    expect(decideReanchor(s, page({ titles: ["Buy Mamaearth Ubtan Face Wash Online"] })).anchorable).toBe(true);
    expect(decideReanchor(s, page({ titles: ["Buy Ubtan Face Wash Online at Best Price | Mamaearth"] })).anchorable).toBe(true);
  });

  it("takes the brand from the site name when the title has none", () => {
    expect(codes(s, page({ titles: ["Ubtan Face Wash"] }))).toEqual(["BRAND"]);
    expect(decideReanchor(s, page({ titles: ["Ubtan Face Wash"], brandNames: ["Mamaearth"] })).anchorable).toBe(true);
  });

  it("queues another brand, a different product and a page with no title", () => {
    expect(codes(s, page({ titles: ["Ubtan Face Wash | Plum"] }))).toEqual(["BRAND"]);
    expect(codes(s, page({ titles: ["Ubtan Face Scrub | Mamaearth"] }))).toEqual(["NAME"]);
    expect(codes(s, page({ titles: ["Ubtan Face Wash Combo | Mamaearth"] }))).toEqual(["NAME"]);
    expect(codes(s, page({ titles: [] }))).toEqual(expect.arrayContaining(["NO_TITLE", "BRAND"]));
  });

  it("does not match a brand that is only part of a longer word", () => {
    expect(codes(stored({ brand: "Dot", productName: "Dot Face Wash" }), page({ titles: ["Face Wash | Dotty"] }))).toContain("BRAND");
  });

  it("matches any of the page's own titles but records the one that matched", () => {
    const d = decideReanchor(s, page({ titles: ["Welcome | Mamaearth", "Mamaearth Ubtan Face Wash"] }));
    expect(d.anchorable).toBe(true);
    expect(d.matchedTitle).toBe("Mamaearth Ubtan Face Wash");
  });
});

describe("quoteHoldsList", () => {
  it("ignores case, spacing, brackets and zero-width characters", () => {
    expect(quoteHoldsList("[Aqua], [Caprylic/​Capric Triglyceride], [more][Glycerin]", ["Aqua", "Caprylic/Capric Triglyceride", "Glycerin"])).toBe(true);
  });
  it("needs the entries in order", () => {
    expect(quoteHoldsList("Glycerin, Aqua", ["Aqua", "Glycerin"])).toBe(false);
  });
});

describe("classifySource", () => {
  it.each([
    ["https://incidecoder.com/products/x-y", "incidecoder"],
    ["https://www.incidecoder.com/products/x-y/", "incidecoder"],
    ["https://incidecoder.com/search?query=x", "unsupported"],
    ["https://mamaearth.in/product/x", "brand_page"],
    ["https://www.amazon.in/dp/B0X", "retailer"],
    ["https://www.nykaa.com/p/x", "retailer"],
    ["", "none"],
    [undefined, "none"],
    ["not a url", "none"],
  ])("%s is %s", (url, expected) => expect(classifySource(url as string | undefined)).toBe(expected));
});

/* ── The real page layout, through the real parser ─────────────── */

const PAGE = `Title: AntiNorm Facial In A Flash ingredients (Explained)

URL Source: https://incidecoder.com/products/antinorm-facial-in-a-flash

Markdown Content:
# [AntiNorm](https://incidecoder.com/brands/antinorm)

Facial In A Flash

## Ingredients overview

[Carica Papaya (Papaya) Fruit Extract](https://incidecoder.com/ingredients/carica-papaya-fruit-extract), [Niacinamide](https://incidecoder.com/ingredients/niacinamide), [more][Caprylic/​Capric Triglyceride](https://incidecoder.com/ingredients/caprylic-capric-triglyceride), [Panthenol](https://incidecoder.com/ingredients/panthenol), [Aqua](https://incidecoder.com/ingredients/aqua)

[less]

## Highlights
`;

describe("INCIDecoder page, parse to decision", () => {
  const parsed = parseProductPage(PAGE, "antinorm-facial-in-a-flash")!;
  const url = "https://incidecoder.com/products/antinorm-facial-in-a-flash";

  it("exposes the page's own title and brand and a complete quote", () => {
    expect(parsed.pageTitle).toBe("AntiNorm Facial In A Flash");
    expect(parsed.pageBrand).toBe("AntiNorm");
    expect(parsed.sourceQuoteTruncated).toBe(false);
    expect(parsed.ingredients).toEqual(["Carica Papaya (Papaya) Fruit Extract", "Niacinamide", "Caprylic/Capric Triglyceride", "Panthenol", "Aqua"]);
  });

  it("anchors a stored copy of that list", () => {
    const d = decideReanchor(
      { brand: "AntiNorm", productName: "AntiNorm Facial In A Flash", inci: ["Carica Papaya (Papaya) Fruit Extract", "Niacinamide", "Caprylic/Capric Triglyceride", "Panthenol", "Water"] },
      snapshotFromIncidecoder(parsed, url),
    );
    expect(d.failures).toEqual([]);
    expect(d.anchorable).toBe(true);
  });

  it("falls back to no title, not the slug, when the page has none", () => {
    const noTitle = parseProductPage(PAGE.replace(/^Title:.*\n/, ""), "antinorm-facial-in-a-flash")!;
    expect(noTitle.pageTitle).toBeNull();
    expect(noTitle.productName).toBe("antinorm facial in a flash");
    const d = decideReanchor({ brand: "AntiNorm", productName: "AntiNorm Facial In A Flash", inci: parsed.ingredients }, snapshotFromIncidecoder(noTitle, url));
    expect(d.anchorable).toBe(false);
    expect(d.failures.map((f) => f.code)).toContain("NO_TITLE");
  });

  const longPage = (names: string[]) =>
    `Title: Big Brand Long List ingredients\n\n# [Big Brand](https://incidecoder.com/brands/big-brand)\n\n## Ingredients overview\n\n${names.map((n, i) => `[${n}](https://incidecoder.com/ingredients/i-${i})`).join(", ")}\n\n## Highlights\n\n${"filler ".repeat(1200)}\n`;
  const decideLong = (names: string[]) => {
    const r = parseProductPage(longPage(names), "big-brand-long-list")!;
    const d = decideReanchor({ brand: "Big Brand", productName: "Big Brand Long List", inci: r.ingredients }, snapshotFromIncidecoder(r, "https://incidecoder.com/products/big-brand-long-list"));
    return { r, d };
  };

  it("marks a quote cut at the quote cap as truncated and refuses to anchor it", () => {
    const names = Array.from({ length: 60 }, (_, i) => `Ingredient With A Rather Long Name Number ${i}`);
    const { r, d } = decideLong(names);
    expect(r.ingredients).toHaveLength(60);
    expect(r.sourceQuote!.length).toBe(2000);
    expect(r.sourceQuoteTruncated).toBe(true);
    expect(d.anchorable).toBe(false);
    expect(d.failures.map((f) => f.code)).toContain("QUOTE_TRUNCATED");
  });

  it("marks a list cut by the parser's read window as truncated, even though a copy of it would compare equal", () => {
    const names = Array.from({ length: 140 }, (_, i) => `Ingredient ${i}`);
    const { r, d } = decideLong(names);
    expect(r.ingredients.length).toBeLessThan(140);
    expect(r.sourceQuoteTruncated).toBe(true);
    expect(d.diff.exact).toBe(true);
    expect(d.anchorable).toBe(false);
    expect(d.failures.map((f) => f.code)).toContain("QUOTE_TRUNCATED");
  });

  it("flags a list cut by the read window even when its quote is short", () => {
    // Long link targets fill the 8000 character window while the quote stays far below its cap.
    const names = Array.from({ length: 90 }, (_, i) => `Item ${i}`);
    const page = `Title: Wide Brand Wide List ingredients\n\n# [Wide Brand](https://incidecoder.com/brands/wide-brand)\n\n## Ingredients overview\n\n${names.map((n, i) => `[${n}](https://incidecoder.com/ingredients/${"long-slug-".repeat(9)}${i})`).join(", ")}\n\n## Highlights\n\n${"filler ".repeat(1200)}\n`;
    const r = parseProductPage(page, "wide-brand-wide-list")!;
    expect(r.ingredients.length).toBeLessThan(90);
    expect(r.sourceQuote!.length).toBeLessThan(2000);
    expect(r.sourceQuoteTruncated).toBe(true);
    // A page whose list ends well inside the window is not flagged, however long its link targets.
    const short = parseProductPage(page.replace(/(\[Item \d+\]\([^)]*\), ){70}/, ""), "wide-brand-wide-list")!;
    expect(short.sourceQuoteTruncated).toBe(false);
  });

  it("does not mark an ordinary list truncated", () => {
    const names = Array.from({ length: 45 }, (_, i) => `Ingredient ${i}`);
    const { r, d } = decideLong(names);
    expect(r.sourceQuoteTruncated).toBe(false);
    expect(d.anchorable).toBe(true);
  });

  it("fetchIncidecoderProduct separates a failed fetch from a page with no list", async () => {
    expect(incidecoderProductSlug(url)).toBe("antinorm-facial-in-a-flash");
    expect(incidecoderProductSlug("https://example.com/products/x")).toBeNull();
    expect((await fetchIncidecoderProduct(url, async () => PAGE)).status).toBe("ok");
    expect((await fetchIncidecoderProduct(url, async () => null)).status).toBe("fetch_failed");
    expect((await fetchIncidecoderProduct(url, async () => "Title: x\n\nnothing here")).status).toBe("no_list");
    expect((await fetchIncidecoderProduct("https://example.com/x", async () => PAGE)).status).toBe("no_list");
  });
});

describe("snapshotFromPage", () => {
  it("carries the quote, titles and site name of a brand page", () => {
    const snap = snapshotFromPage({ ingredients: LIST, source: "https://b.example/p", quote: "Ingredients: " + LIST.join(", "), pageTitles: ["T"], siteName: "B" });
    expect(snap).toMatchObject({ kind: "brand_page", titles: ["T"], brandNames: ["B"], brandRule: "named", quoteComplete: true });
    expect(snapshotFromPage({ ingredients: LIST, source: "https://b.example/p" }).quoteComplete).toBe(false);
  });
});

/* ── Rows: dry run, apply, and what is never touched ───────────── */

const reviewOf = (over: Partial<ProductReview> = {}): ProductReview =>
  ({
    type: "product-review", productName: "AntiNorm Facial In A Flash", brand: "AntiNorm",
    inciIngredients: LIST, inciSourceUrl: "https://incidecoder.com/products/antinorm-facial-in-a-flash",
    scores: { total: 77, label: "Mostly Transparent" }, verdict: { cleanSheetTakeaway: "keep" },
    ...over,
  }) as unknown as ProductReview;

const rowOf = (slug: string, review: ProductReview, extra: Record<string, unknown> = {}) => ({
  product_slug: slug,
  result: { type: "product-review", review, verdict: { tier: "approved", tierLabel: "Good Standing", gates: [1, 2] }, ...extra },
});

const okFetch = (snapshot: SourceSnapshot): SnapshotFetch => ({ status: "ok", snapshot, retrievedAt: "2026-10-21T10:00:00.000Z" });

const fakeTable = (rows: Record<string, unknown>) => {
  const writes: { slug: string; result: unknown }[] = [];
  const table: ReviewTable = {
    readResult: async (slug) => (slug in rows ? { result: rows[slug] } : { error: "not found" }),
    writeResult: async (slug, result) => { writes.push({ slug, result }); rows[slug] = result; return {}; },
  };
  return { table, writes };
};

const ALL = new Set(["incidecoder", "brand_page"] as const);

describe("reanchorRows", () => {
  it("a dry run reads and decides but never writes, even with a table supplied", async () => {
    const row = rowOf("a", reviewOf());
    const { table, writes } = fakeTable({ a: row.result });
    const readSpy = vi.spyOn(table, "readResult");
    const res = await reanchorRows([row], { fetchSnapshot: async () => okFetch(incidecoder()), table }, { apply: false, sources: ALL });
    expect(res).toHaveLength(1);
    expect(res[0].status).toBe("anchorable");
    expect(writes).toEqual([]);
    expect(readSpy).not.toHaveBeenCalled();
    expect((res[0] as { applied?: unknown }).applied).toBeUndefined();
  });

  it("apply writes the evidence into result and changes nothing else", async () => {
    const row = rowOf("a", reviewOf());
    const before = JSON.parse(JSON.stringify(row.result));
    const { table, writes } = fakeTable({ a: row.result });
    const res = await reanchorRows([row], { fetchSnapshot: async () => okFetch(incidecoder()), table }, { apply: true, sources: ALL });
    expect(res[0]).toMatchObject({ status: "anchorable", applied: "written" });
    expect(writes).toHaveLength(1);
    const next = writes[0].result as { review: ProductReview } & Record<string, unknown>;
    expect(next.review.inciEvidence).toEqual({
      sourceUrl: "https://incidecoder.com/products/antinorm-facial-in-a-flash", captureTrust: 3,
      quote: quoteOf(LIST), retrievedAt: "2026-10-21T10:00:00.000Z", matchedTitle: "AntiNorm Facial In A Flash",
    });
    // Remove the one new field and the stored result is exactly what it was.
    const { inciEvidence: _gone, ...reviewRest } = next.review;
    void _gone;
    expect({ ...next, review: reviewRest }).toEqual(before);
    expect(next.verdict).toEqual(before.verdict);
    expect(row.result).toEqual(before);
  });

  it("an anchored review is then reported as anchored by the verifier", async () => {
    const row = rowOf("a", reviewOf());
    const { table, writes } = fakeTable({ a: row.result });
    await reanchorRows([row], { fetchSnapshot: async () => okFetch(incidecoder()), table }, { apply: true, sources: ALL });
    const review = (writes[0].result as { review: ProductReview }).review;
    expect(isAnchored(evidenceForReview(review))).toBe(true);
    expect(isAnchored(evidenceForReview(reviewOf()))).toBe(false);
  });

  it("queues a non-exact row with its diff and writes nothing for it, even with apply", async () => {
    const row = rowOf("a", reviewOf());
    const { table, writes } = fakeTable({ a: row.result });
    const swapped = [LIST[1], LIST[0], ...LIST.slice(2)];
    const res = await reanchorRows([row], { fetchSnapshot: async () => okFetch(incidecoder({ ingredients: swapped, quote: quoteOf(swapped) })), table }, { apply: true, sources: ALL });
    expect(res[0].status).toBe("queued");
    if (res[0].status === "queued") expect(res[0].decision.diff.kind).toBe("reordered");
    expect(writes).toEqual([]);
  });

  it("leaves a row alone if it changed after it was read", async () => {
    const row = rowOf("a", reviewOf());
    const { table, writes } = fakeTable({ a: { ...row.result, verdict: { tier: "can-do-better" } } });
    const res = await reanchorRows([row], { fetchSnapshot: async () => okFetch(incidecoder()), table }, { apply: true, sources: ALL });
    expect(res[0]).toMatchObject({ status: "anchorable", applied: { skipped: expect.stringContaining("changed") } });
    expect(writes).toEqual([]);
    expect(summarise(res)).toMatchObject({ anchorable: 1, written: 0, writeSkipped: 1 });
  });

  it("skips what it must not fetch: non-reviews, retracted, retailer pages, anchored rows, other sources", async () => {
    const fetchSnapshot = vi.fn(async () => okFetch(incidecoder()));
    const anchoredReview = reviewOf({ inciEvidence: { sourceUrl: "https://incidecoder.com/products/x", captureTrust: 3, quote: "[Aqua]", retrievedAt: "2026-01-01T00:00:00.000Z" } });
    const rows = [
      { product_slug: "not-review", result: { type: "other" } },
      rowOf("retracted", reviewOf()),
      rowOf("retailer", reviewOf({ inciSourceUrl: "https://www.amazon.in/dp/B0X" })),
      rowOf("nourl", reviewOf({ inciSourceUrl: undefined })),
      rowOf("search", reviewOf({ inciSourceUrl: "https://incidecoder.com/search?query=x" })),
      rowOf("anchored", anchoredReview),
      rowOf("brand", reviewOf({ inciSourceUrl: "https://mamaearth.in/p/x" })),
    ];
    const res = await reanchorRows(rows, { fetchSnapshot }, { apply: false, sources: new Set(["incidecoder"] as const), isRetracted: (s) => s === "retracted" });
    expect(res.map((r) => (r.status === "skipped" ? r.reason : r.status))).toEqual([
      "not_a_review", "retracted", "retailer_source", "no_source_url", "unsupported_source", "already_anchored", "not_selected",
    ]);
    expect(fetchSnapshot).not.toHaveBeenCalled();
  });

  it("re-anchors a row whose evidence exists but holds no quote", async () => {
    const unanchored = reviewOf({ inciEvidence: { sourceUrl: "https://incidecoder.com/products/x", captureTrust: 3, quote: "", retrievedAt: "2026-01-01T00:00:00.000Z" } });
    const res = await reanchorRows([rowOf("a", unanchored)], { fetchSnapshot: async () => okFetch(incidecoder()) }, { apply: false, sources: ALL });
    expect(res[0].status).toBe("anchorable");
  });

  it("honours --slug and --limit, and counts fetch failures separately from queued rows", async () => {
    const fetchSnapshot = vi.fn(async (): Promise<SnapshotFetch> => ({ status: "fetch_failed", detail: "HTTP 429" }));
    const rows = ["a", "b", "c"].map((s) => rowOf(s, reviewOf()));
    const one = await reanchorRows(rows, { fetchSnapshot }, { apply: false, sources: ALL, slug: "b" });
    expect(one.filter((r) => r.status !== "skipped")).toHaveLength(1);
    fetchSnapshot.mockClear();
    const two = await reanchorRows(rows, { fetchSnapshot }, { apply: false, sources: ALL, limit: 2 });
    expect(fetchSnapshot).toHaveBeenCalledTimes(2);
    expect(summarise(two)).toMatchObject({ fetchFailures: 2, fetchFailed: 2, anchorable: 0, queued: 0, skipped: { not_selected: 1 } });
  });

  it("counts anchorable, queued with reasons, and failures", async () => {
    const rows = [rowOf("ok", reviewOf()), rowOf("bad", reviewOf({ brand: "Other" })), rowOf("gone", reviewOf())];
    let n = 0;
    const res = await reanchorRows(rows, {
      fetchSnapshot: async () => (++n === 3 ? { status: "no_list", detail: "no list" } : okFetch(incidecoder())),
    }, { apply: false, sources: ALL });
    expect(summarise(res)).toMatchObject({ anchorable: 1, queued: 1, fetchFailures: 1, noList: 1, queuedByReason: { BRAND: 1 } });
  });
});

describe("the write path can only replace result", () => {
  it("withInciEvidence keeps every other field and does not mutate its input", () => {
    const row = rowOf("a", reviewOf(), { tier: "approved", rubric_rev: "r8" });
    const frozen = JSON.parse(JSON.stringify(row.result));
    const out = withInciEvidence(row.result as never, { sourceUrl: "u", captureTrust: 3, quote: "q", retrievedAt: "t" });
    expect(row.result).toEqual(frozen);
    expect(out).toMatchObject({ tier: "approved", rubric_rev: "r8", verdict: frozen.verdict });
    expect((out as { review: ProductReview }).review.scores).toEqual(frozen.review.scores);
  });

  it("guardedWrite writes through writeResult alone, once, and only when unchanged", async () => {
    const prev = { a: 1 };
    const { table, writes } = fakeTable({ s: prev });
    expect(await guardedWrite(table, "s", { a: 2 }, prev)).toEqual({ ok: true });
    expect(writes).toEqual([{ slug: "s", result: { a: 2 } }]);
    expect(await guardedWrite(table, "s", { a: 3 }, prev)).toMatchObject({ ok: false });
    expect(await guardedWrite(table, "missing", { a: 3 }, prev)).toMatchObject({ ok: false });
    expect(writes).toHaveLength(1);
  });

  it("reports a failed write instead of claiming success", async () => {
    const table: ReviewTable = { readResult: async () => ({ result: 1 }), writeResult: async () => ({ error: "boom" }) };
    expect(await guardedWrite(table, "s", 2, 1)).toEqual({ ok: false, reason: "write failed: boom" });
  });
});
