import { afterEach, describe, expect, it, vi } from "vitest";
import { PAGE_FINDER_SYSTEM_PROMPT, READ_CAP_MS, askModelForProductPage, findBrandInci, isBrandIngredientUrl, isPrimaryIngredientUrl, recordCandidates, searchBrandPages, shortNameOnOwnPage, withKnownCandidates } from "./brand-inci";
import { generateResilientWithMeta } from "./gemini";
import { fetchIncidecoderProduct } from "./inci-fetch";
import { fetchPageMarkdown } from "./scrape";

vi.mock("./inci-fetch", async (orig) => ({ ...(await orig<typeof import("./inci-fetch")>()), fetchIncidecoderProduct: vi.fn() }));
vi.mock("./gemini", async (orig) => ({ ...(await orig<typeof import("./gemini")>()), generateResilientWithMeta: vi.fn() }));
vi.mock("./scrape", async (orig) => ({ ...(await orig<typeof import("./scrape")>()), fetchPageMarkdown: vi.fn().mockResolvedValue(null) }));
const url = "https://www.plixlife.com/product/pomegranate-youth-renewal-night-cream/602";
const list = { source: url, ingredients: ["Aqua", "Glycerin", "Niacinamide", "Panthenol", "Tocopherol"], quote: "Aqua, Glycerin, Niacinamide, Panthenol, Tocopherol", pageTitles: ["Plix Pomegranate Youth Renewal Night Cream"] };

describe("primary brand ingredient acquisition", () => {
  it("reads a matching brand product page and keeps its exact source and quotation", async () => {
    const deps = { search: vi.fn().mockResolvedValue([url]), read: vi.fn().mockResolvedValue(list) };
    expect(await findBrandInci("Plix Pomegranate Youth Renewal Night Cream", "Plix", undefined, deps)).toMatchObject(list);
  });
  it("never upgrades retailer, deceptive-domain, private-address or unrelated results to a brand source", () => {
    for (const u of ["https://www.nykaa.com/plix/p/123", "https://plixlife.com.evil.test/product/a", "http://plixlife.com/product/a", "https://127.0.0.1/product/a", "https://plixlife.local/product/a", "https://plixlife.com@evil.test/product/a"])
      expect(isBrandIngredientUrl(u, "Plix"), u).toBe(false);
  });
  it("rejects another product and a list without a captured quote", async () => {
    for (const page of [{ ...list, pageTitles: ["Plix Watermelon Sunscreen"] }, { ...list, quote: "" }]) {
      expect(await findBrandInci("Plix Pomegranate Youth Renewal Night Cream", "Plix", undefined, { search: async () => [url], read: async () => page })).toBeNull();
    }
  });
  it("does not read a retailer listing even when supplied by the user", async () => {
    const read = vi.fn();
    expect(await findBrandInci("Plix Pomegranate Cream", "Plix", "https://nykaa.com/plix/p/123", { search: async () => [], read })).toBeNull();
    expect(read).not.toHaveBeenCalled();
  });
});

const decoderUrl = "https://inkeedecoder.com/products/dot-key-10-niacinamide-strawberry-brightening-face-serum";
const decoderList = { source: decoderUrl, ingredients: ["Aqua", "Glycerin", "Niacinamide", "Panthenol", "Tocopherol"], quote: "Aqua, Glycerin, Niacinamide, Panthenol, Tocopherol", pageTitles: ["Dot & Key 10% Niacinamide Strawberry Brightening Face Serum"] };
const dkQuery = "Dot & Key Strawberry Bright 10% Niacinamide Face Serum";

describe("a Decoder product page that a search surfaces", () => {
  it("is a primary source: read, matched to the product, and used when it is the most complete list", async () => {
    const read = vi.fn();
    const deps = { search: async () => ["https://www.dotandkey.com/products/serum", decoderUrl], read, readDecoder: vi.fn().mockResolvedValue(decoderList) };
    expect(await findBrandInci(dkQuery, "Dot", undefined, deps)).toMatchObject(decoderList);
    expect(deps.readDecoder).toHaveBeenCalledWith(decoderUrl);
    expect(read).not.toHaveBeenCalled();
  });
  it("is refused when it is another product, or has no source quote, or the list is not an ingredient list", async () => {
    for (const page of [{ ...decoderList, pageTitles: ["Dot & Key Vitamin C Sunscreen SPF 50"] }, { ...decoderList, quote: "" }, { ...decoderList, ingredients: ["Contains no parabens", "Free from sulphates", "Made without fragrance"] }]) {
      expect(await findBrandInci(dkQuery, "Dot", undefined, { search: async () => [decoderUrl], read: vi.fn(), readDecoder: async () => page })).toBeNull();
    }
  });
  it("falls back to the brand's own page when the Decoder page does not match", async () => {
    const brand = { ...list, source: url };
    const deps = { search: async () => [decoderUrl, url], read: vi.fn().mockResolvedValue(brand), readDecoder: async () => null };
    expect(await findBrandInci("Plix Pomegranate Youth Renewal Night Cream", "Plix", undefined, deps)).toMatchObject(brand);
  });
  it("is read with the engine's Decoder parser, and a quote cut short is refused", async () => {
    const result = { productName: "Dot & Key Serum", slug: "dot-key-serum", ingredients: decoderList.ingredients, tags: [], source: decoderUrl, imageUrl: null, sourceQuote: decoderList.quote, pageTitle: "Dot & Key Serum | INKEE Decoder" };
    const fetchDecoder = vi.mocked(fetchIncidecoderProduct);
    fetchDecoder.mockResolvedValueOnce({ status: "ok", result });
    expect(await findBrandInci("Dot & Key Serum", "Dot", undefined, { search: async () => [decoderUrl], read: vi.fn() }))
      .toMatchObject({ source: decoderUrl, quote: decoderList.quote, ingredients: decoderList.ingredients, siteName: "INKEE Decoder" });
    fetchDecoder.mockResolvedValueOnce({ status: "ok", result: { ...result, sourceQuoteTruncated: true } });
    expect(await findBrandInci("Dot & Key Serum", "Dot", undefined, { search: async () => [decoderUrl], read: vi.fn() })).toBeNull();
    fetchDecoder.mockResolvedValueOnce({ status: "fetch_failed" });
    expect(await findBrandInci("Dot & Key Serum", "Dot", undefined, { search: async () => [decoderUrl], read: vi.fn() })).toBeNull();
  });
});

describe("where candidate pages are searched", () => {
  const env = { ...process.env };
  afterEach(() => { process.env = { ...env }; vi.unstubAllGlobals(); vi.mocked(fetchPageMarkdown).mockClear(); });
  const respond = (body: unknown, ok = true) => ({ ok, status: ok ? 200 : 403, json: async () => body });

  it("asks Firecrawl first, for URLs only, and uses what it returns", async () => {
    process.env.FIRECRAWL_API_KEY = "fc-test"; process.env.GOOGLE_CSE_API_KEY = "k"; process.env.GOOGLE_CSE_CX = "cx";
    const fetchMock = vi.fn().mockResolvedValue(respond({ data: [{ url: "https://amahvas.com/products/a" }, { url: decoderUrl }, {}] }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await searchBrandPages("Amahvas Ocean of Milk")).toEqual(["https://amahvas.com/products/a", decoderUrl]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, init] = fetchMock.mock.calls[0];
    expect(endpoint).toBe("https://api.firecrawl.dev/v1/search");
    expect(init.headers.Authorization).toBe("Bearer fc-test");
    expect(JSON.parse(init.body)).toEqual({ query: "Amahvas Ocean of Milk official ingredients", limit: 5 });
  });
  it("falls back to Google's Custom Search when Firecrawl fails or has no key", async () => {
    process.env.GOOGLE_CSE_API_KEY = "k"; process.env.GOOGLE_CSE_CX = "cx"; delete process.env.FIRECRAWL_API_KEY;
    const fetchMock = vi.fn().mockResolvedValue(respond({ items: [{ link: "https://plixlife.com/product/x" }] }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await searchBrandPages("Plix Night Cream")).toEqual(["https://plixlife.com/product/x"]);
    expect(String(fetchMock.mock.calls[0][0])).toContain("googleapis.com/customsearch");

    process.env.FIRECRAWL_API_KEY = "fc-test";
    const both = vi.fn().mockResolvedValueOnce(respond({}, false)).mockResolvedValueOnce(respond({ items: [{ link: "https://plixlife.com/product/y" }] }));
    vi.stubGlobal("fetch", both);
    expect(await searchBrandPages("Plix Night Cream")).toEqual(["https://plixlife.com/product/y"]);
    expect(both).toHaveBeenCalledTimes(2);
  });
});

describe("a web-grounded model asked where the page is", () => {
  const amahvasQuery = "Amahvas Ocean of Milk Nocturnal Renewal Concentrate";
  const amahvasUrl = "https://amahvas.com/products/ocean-of-milk-nocturnal-renewal-concentrate";
  const amahvasPage = { source: amahvasUrl, ingredients: ["Aqua", "Glycerin", "Niacinamide", "Panthenol", "Tocopherol"], quote: "Aqua, Glycerin, Niacinamide, Panthenol, Tocopherol", pageTitles: ["Ocean of Milk Nocturnal Renewal Concentrate | Amahvas"] };

  it("is asked only when nothing else gave a list, and the page it names is read by the code", async () => {
    const askModel = vi.fn().mockResolvedValue([amahvasUrl]);
    const read = vi.fn().mockResolvedValue(amahvasPage);
    expect(await findBrandInci(amahvasQuery, "Amahvas", undefined, { search: async () => [], read, askModel })).toMatchObject(amahvasPage);
    expect(askModel).toHaveBeenCalledWith(amahvasQuery);
    expect(read).toHaveBeenCalledWith(amahvasUrl);

    const found = vi.fn();
    expect(await findBrandInci(amahvasQuery, "Amahvas", undefined, { search: async () => [amahvasUrl], read: async () => amahvasPage, askModel: found })).toMatchObject(amahvasPage);
    expect(found).not.toHaveBeenCalled();
  });
  it("does not make a retailer, a marketplace or another brand's page a source, whatever the model says", async () => {
    const read = vi.fn();
    for (const u of ["https://www.nykaa.com/amahvas-ocean-of-milk/p/1", "https://www.amazon.in/dp/B0123", "https://amahvas.com.evil.test/products/a", "https://otherbrand.com/products/a"])
      expect(await findBrandInci(amahvasQuery, "Amahvas", undefined, { search: async () => [], read, askModel: async () => [u] }), u).toBeNull();
    expect(read).not.toHaveBeenCalled();
  });
  it("still has to be the right product with a quote, and a page already read is not read twice", async () => {
    const read = vi.fn().mockResolvedValue({ ...amahvasPage, pageTitles: ["Amahvas Rose Water Mist"] });
    expect(await findBrandInci(amahvasQuery, "Amahvas", undefined, { search: async () => [amahvasUrl], read, askModel: async () => [amahvasUrl] })).toBeNull();
    expect(read).toHaveBeenCalledTimes(1);
  });
  it("is optional and never a reason to fail", async () => {
    expect(await findBrandInci(amahvasQuery, "Amahvas", undefined, { search: async () => [], read: vi.fn() })).toBeNull();
    expect(await findBrandInci(amahvasQuery, "Amahvas", undefined, { search: async () => [], read: vi.fn(), askModel: async () => { throw new Error("model down"); } })).toBeNull();
  });
});

describe("askModelForProductPage", () => {
  const generate = vi.mocked(generateResilientWithMeta);
  const searched = { webSearchQueries: ["q"], sourceUris: [], sourceTitles: [] };
  const reply = (text: string, g: typeof searched | null = searched) => generate.mockResolvedValueOnce({ text, groundingMetadata: g });
  const url = "https://www.amahvas.com/products/ocean-of-milk";
  const redirect = "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFexample-token";
  const respondWith = (status: number, location?: string) => ({ status, headers: { get: (h: string) => (h.toLowerCase() === "location" ? (location ?? null) : null) } });
  afterEach(() => vi.unstubAllGlobals());

  it("asks for a page, never a list, and tells the model not to write one from memory", async () => {
    reply(`{"url": "${url}"}`);
    expect(await askModelForProductPage("Amahvas Ocean of Milk")).toEqual([url]);
    expect(generate).toHaveBeenLastCalledWith(PAGE_FINDER_SYSTEM_PROMPT, "Find the page for this product: Amahvas Ocean of Milk");
    expect(PAGE_FINDER_SYSTEM_PROMPT).toMatch(/Never write a URL from memory/);
    expect(PAGE_FINDER_SYSTEM_PROMPT).toMatch(/Do not write an ingredient list/);
  });
  it("accepts the JSON when the model wraps it in prose", async () => {
    reply(`Here you go:\n{"url": "${url}"}\nHope that helps.`);
    expect(await askModelForProductPage("x")).toEqual([url]);
  });
  it("follows the search tool's own redirect link, by hand, to the real page", async () => {
    const fetchMock = vi.fn().mockResolvedValue(respondWith(302, "https://amahvas.com/products/ocean-of-milk"));
    vi.stubGlobal("fetch", fetchMock);
    reply(`{"url": "${redirect}"}`);
    expect(await askModelForProductPage("x")).toEqual(["https://amahvas.com/products/ocean-of-milk"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(redirect);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ redirect: "manual" });
  });
  it("drops a redirect that does not resolve, loops, or leaves https", async () => {
    for (const make of [() => respondWith(404), () => respondWith(302, "http://amahvas.com/products/a"), () => respondWith(302, redirect)]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(make()));
      reply(`{"url": "${redirect}"}`);
      expect(await askModelForProductPage("x")).toEqual([]);
    }
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    reply(`{"url": "${redirect}"}`);
    expect(await askModelForProductPage("x")).toEqual([]);
  });
  it("fetches nothing else: a look-alike host or any other URL is returned as written, not followed", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    reply('{"url": "https://vertexaisearch.cloud.google.com.evil.test/grounding-api-redirect/x"}');
    expect(await askModelForProductPage("x")).toEqual(["https://vertexaisearch.cloud.google.com.evil.test/grounding-api-redirect/x"]);
    reply(`{"url": "${url}"}`);
    await askModelForProductPage("x");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("ignores an answer from a call that did not search: it could be from memory", async () => {
    reply(`{"url": "${url}"}`, null);
    expect(await askModelForProductPage("x")).toEqual([]);
  });
  it("ignores null, a non-https URL, an overlong URL, a non-URL and text that is not JSON", async () => {
    for (const text of ['{"url": null}', '{"url": "http://www.amahvas.com/products/a"}', `{"url": "https://www.amahvas.com/${"a".repeat(2100)}"}`, '{"url": "not a url"}', '{"url": 7}', "I could not find it.", "{broken"]) {
      reply(text);
      expect(await askModelForProductPage("x"), text.slice(0, 40)).toEqual([]);
    }
  });
  it("gives up quietly when the model errors or takes too long", async () => {
    generate.mockRejectedValueOnce(new Error("boom"));
    expect(await askModelForProductPage("x")).toEqual([]);
    vi.useFakeTimers();
    try {
      generate.mockReturnValueOnce(new Promise(() => undefined));
      const pending = askModelForProductPage("x");
      await vi.advanceTimersByTimeAsync(30001);
      expect(await pending).toEqual([]);
    } finally { vi.useRealTimers(); }
  });
});

/* 2026-10-29: a shopper typed "Juicy chemistry under eye cream". A name search guesses the brand from the first word ("Juicy"),
   and juicychemistry.com fails the brand check for "Juicy". The model found the right page, the engine threw it away, and the
   second lookup (brand now known as "Juicy Chemistry") had the model switched off and, in production, no working search. */
describe("a page the first lookup was shown is judged again once the brand is known", () => {
  const juicyUrl = "https://juicychemistry.com/products/damask-rose-coffee-organic-eye-cream";
  const juicyPage = {
    source: juicyUrl,
    ingredients: ["Theobroma Cacao Seed Butter (Cocoa Butter)*", "Haelianthus Annuus Seed Oil (Sunflower Oil)*", "Cera Alba (Bees Wax)*", "Tocopherol (Vitamin E Oil)*", "Rosa Damascena Flower Oil (Rose Oil)*"],
    quote: "Theobroma Cacao Seed Butter (Cocoa Butter)*, Haelianthus Annuus Seed Oil (Sunflower Oil)*, Cera Alba (Bees Wax)*, Tocopherol (Vitamin E Oil)*, Rosa Damascena Flower Oil (Rose Oil)*",
    pageTitles: ["Under Eye Cream for Dark Circles & Puffiness | Caffeine", "Organic Under Eye Repair Cream Fortified with Damask Rose + Coffee"],
    siteName: null,
  };
  const typed = "Juicy chemistry under eye cream";
  const identified = "Juicy Chemistry Organic Under Eye Repair Cream Fortified with Damask Rose + Coffee";

  it("the first word is not the brand, so the first lookup refuses the brand's own page (the bug)", async () => {
    const read = vi.fn(async () => juicyPage);
    expect(isBrandIngredientUrl(juicyUrl, "Juicy")).toBe(false);
    expect(await findBrandInci(typed, "Juicy", undefined, { search: async () => [], read, askModel: async () => [juicyUrl] })).toBeNull();
    expect(read).not.toHaveBeenCalled();
  });

  it("accepts it in the second lookup, from the first lookup's model proposal alone: no search and no second model call", async () => {
    const first = recordCandidates({ search: async () => [], read: vi.fn(async () => juicyPage), askModel: async () => [juicyUrl] });
    expect(await findBrandInci(typed, "Juicy", undefined, first.deps)).toBeNull();
    expect([...first.seen]).toEqual([juicyUrl]);
    const read = vi.fn(async () => juicyPage);
    const second = withKnownCandidates({ search: async () => [], read, askModel: undefined }, first.seen);
    expect(second.askModel).toBeUndefined(); // no second model call is made
    expect(await findBrandInci(identified, "Juicy Chemistry", undefined, second)).toMatchObject(juicyPage);
    expect(read).toHaveBeenCalledWith(juicyUrl);
  });

  it("also remembers the pages a search returned, and still runs the second lookup's own search", async () => {
    const first = recordCandidates({ search: async () => [juicyUrl, "https://www.amazon.in/dp/B01MYRU03Y"], read: vi.fn(async () => null) });
    await findBrandInci(typed, "Juicy", undefined, first.deps);
    expect([...first.seen]).toEqual([juicyUrl, "https://www.amazon.in/dp/B01MYRU03Y"]);
    const search = vi.fn(async () => ["https://juicychemistry.com/products/another-product"]);
    const offered = await withKnownCandidates({ search, read: vi.fn() }, first.seen).search(identified);
    expect(offered).toEqual([juicyUrl, "https://www.amazon.in/dp/B01MYRU03Y", "https://juicychemistry.com/products/another-product"]);
    expect(search).toHaveBeenCalledWith(identified);
  });

  it("does not loosen any check: a remembered page that is another brand's, another product, or has no quote is still refused", async () => {
    const known = [juicyUrl, "https://www.amazon.in/dp/B01MYRU03Y", "https://www.dermatocare.com/product/juicy-chemistry-damask-rose-coffee-under-eye-cream/"];
    const deps = (page: typeof juicyPage | null) => withKnownCandidates({ search: async () => [], read: async () => page }, known);
    expect(await findBrandInci(identified, "Juicy Chemistry", undefined, deps({ ...juicyPage, pageTitles: ["Juicy Chemistry Rose Water Toner"] }))).toBeNull(); // another product
    expect(await findBrandInci(identified, "Juicy Chemistry", undefined, deps({ ...juicyPage, quote: "" }))).toBeNull(); // nothing quoted
    expect(await findBrandInci(identified, "Juicy Chemistry", undefined, deps(null))).toBeNull(); // unreadable
    const read = vi.fn(async () => juicyPage);
    expect(await findBrandInci(identified, "Juicy Chemistry", undefined, withKnownCandidates({ search: async () => [], read }, known.slice(1)))).toBeNull(); // retailer pages are not brand pages
    expect(read).not.toHaveBeenCalled();
  });

  it("survives a failing search or model: it records nothing and the lookup is simply empty", async () => {
    const first = recordCandidates({ search: async () => { throw new Error("search down"); }, read: vi.fn(), askModel: async () => { throw new Error("model down"); } });
    expect(await findBrandInci(typed, "Juicy", undefined, first.deps)).toBeNull();
    expect(first.seen.size).toBe(0);
    expect(await withKnownCandidates({ search: async () => { throw new Error("down"); }, read: vi.fn() }, [juicyUrl]).search("x")).toEqual([juicyUrl]);
  });
});

/* Nykaa, INKEE Decoder and the brand's own site are searched together as equals (owner decision, 2026-10-30). */
describe("Nykaa, INKEE Decoder and the brand site searched together", () => {
  const nykaaUrl = "https://www.nykaa.com/lotus-herbals-whiteglow-skin-whitening-brightening-gel-creme-spf-25-pa/p/10787966";
  const lotusDecoderUrl = "https://inkeedecoder.com/products/lotus-herbals-whiteglow-skin-whitening-and-brighening-gel-creme";
  const lotusQuery = "Lotus Herbals Whiteglow Skin Whitening Brightening Gel Creme Spf 25 Pa";
  const names = (n: number, from = "A") => Array.from({ length: n }, (_, i) => `Ingredient ${from}${i}`);
  const decoderOlder = { source: lotusDecoderUrl, ingredients: names(29, "D"), quote: names(29, "D").join(", "), pageTitles: ["Lotus Herbals Whiteglow Skin Whitening Brightening Gel Creme"], trust: 3 as const, origin: "decoder" as const };
  const nykaaCurrent = { source: nykaaUrl, ingredients: names(30, "N"), quote: names(30, "N").join(", "), pageTitles: ["Lotus Herbals WhiteGlow Skin Whitening & Brightening Gel Cream SPF 25 PA+++|With Niacinamide"], siteName: "Nykaa", trust: 3 as const, origin: "nykaa" as const };
  const deps = (over: Record<string, unknown> = {}) => ({
    search: async () => [lotusDecoderUrl], read: vi.fn().mockResolvedValue(null), readDecoder: vi.fn().mockResolvedValue(decoderOlder),
    searchNykaa: async () => [nykaaUrl], readNykaa: vi.fn().mockResolvedValue(nykaaCurrent), ...over,
  });

  it("reads all three kinds of page and the most complete list wins, with the list that lost recorded on it (Lotus)", async () => {
    const d = deps();
    const r = await findBrandInci(lotusQuery, "Lotus Herbals", nykaaUrl, d);
    expect(d.readDecoder).toHaveBeenCalledWith(lotusDecoderUrl);
    expect(d.readNykaa).toHaveBeenCalledWith(nykaaUrl);
    expect(r).toMatchObject({ source: nykaaUrl, origin: "nykaa", trust: 3 });
    expect(r?.ingredients).toHaveLength(30);
    expect(r?.alternatives).toEqual([{ source: lotusDecoderUrl, origin: "decoder", count: 29 }]);
  });

  it("the longer list wins whichever source it comes from, and the shorter Nykaa list loses to a longer Decoder one", async () => {
    const short = { ...nykaaCurrent, ingredients: names(12, "N"), quote: names(12, "N").join(", ") };
    const r = await findBrandInci(lotusQuery, "Lotus Herbals", nykaaUrl, deps({ readNykaa: async () => short }));
    expect(r).toMatchObject({ source: lotusDecoderUrl, origin: "decoder" });
    expect(r?.alternatives).toEqual([{ source: nykaaUrl, origin: "nykaa", count: 12 }]);
  });

  it("on equal length the better-captured source wins: a brand page over Decoder and Nykaa", async () => {
    const brandUrl = "https://lotus.in/products/whiteglow-skin-brightening-gel-creme-spf-25";
    const brandPage = { source: brandUrl, ingredients: names(29, "B"), quote: names(29, "B").join(", "), pageTitles: ["Lotus Herbals Whiteglow Skin Whitening Brightening Gel Creme Spf 25 Pa"] };
    const same29 = { ...nykaaCurrent, ingredients: names(29, "N"), quote: names(29, "N").join(", ") };
    const r = await findBrandInci(lotusQuery, "Lotus", nykaaUrl, deps({ search: async () => [lotusDecoderUrl, brandUrl], read: async () => brandPage, readNykaa: async () => same29 }));
    expect(r).toMatchObject({ source: brandUrl, origin: "brand-page", trust: 4 });
    expect(r?.alternatives?.map((a) => a.origin).sort()).toEqual(["decoder", "nykaa"]);
  });

  it("on equal length and trust the page the shopper pasted wins", async () => {
    const same29 = { ...nykaaCurrent, ingredients: names(29, "N"), quote: names(29, "N").join(", ") };
    expect(await findBrandInci(lotusQuery, "Lotus Herbals", nykaaUrl, deps({ readNykaa: async () => same29 }))).toMatchObject({ origin: "nykaa" });
    expect(await findBrandInci(lotusQuery, "Lotus Herbals", lotusDecoderUrl, deps({ readNykaa: async () => same29 }))).toMatchObject({ origin: "decoder" });
  });

  it("records no alternative when the other source agrees (a list that is the same to within a few ingredients)", async () => {
    const agrees = { ...decoderOlder, ingredients: names(30, "N"), quote: names(30, "N").join(", ") };
    const r = await findBrandInci(lotusQuery, "Lotus Herbals", nykaaUrl, deps({ readDecoder: async () => agrees }));
    expect(r?.alternatives).toBeUndefined();
  });

  it("falls back to the other sources when Nykaa cannot be read, and Nykaa is not consulted without its dependencies", async () => {
    expect(await findBrandInci(lotusQuery, "Lotus Herbals", nykaaUrl, deps({ readNykaa: async () => null }))).toMatchObject({ source: lotusDecoderUrl });
    const d = deps();
    expect(await findBrandInci(lotusQuery, "Lotus Herbals", nykaaUrl, { search: d.search, read: d.read, readDecoder: d.readDecoder })).toMatchObject({ source: lotusDecoderUrl });
  });

  it("never lets a longer page win that is not the product, has no quote, or is not an ingredient list", async () => {
    for (const bad of [
      { ...nykaaCurrent, pageTitles: ["Lotus Herbals Whiteglow Night Face Cream"] },
      { ...nykaaCurrent, quote: "" },
      { ...nykaaCurrent, ingredients: Array.from({ length: 40 }, (_, i) => `Free from number ${i} of the many things we leave out`) },
    ]) expect(await findBrandInci(lotusQuery, "Lotus Herbals", nykaaUrl, deps({ readNykaa: async () => bad }))).toMatchObject({ source: lotusDecoderUrl });
  });

  it("still refuses every other retailer, and Nykaa pages that are not product pages", async () => {
    const d = deps({ search: async () => ["https://www.amazon.in/dp/B01MYRU03Y", "https://www.flipkart.com/p/x", "https://www.nykaa.com/lotus/reviews/10787966"], searchNykaa: async () => ["https://www.nykaa.com/brands/lotus/c/1"] });
    expect(await findBrandInci(lotusQuery, "Lotus Herbals", "https://www.amazon.in/dp/B01MYRU03Y", d)).toBeNull();
    expect(d.readNykaa).not.toHaveBeenCalled();
    expect(d.read).not.toHaveBeenCalled();
  });

  it("lets a list already found elsewhere (the Decoder page the engine resolved by name) compete on the same terms", async () => {
    const r = await findBrandInci(lotusQuery, "Lotus Herbals", nykaaUrl, deps({ search: async () => [], readDecoder: vi.fn() }), [decoderOlder]);
    expect(r).toMatchObject({ origin: "nykaa" });
    expect(r?.alternatives).toEqual([{ source: lotusDecoderUrl, origin: "decoder", count: 29 }]);
    // ...and it is the answer when nothing else gives a list.
    expect(await findBrandInci(lotusQuery, "Lotus Herbals", undefined, { search: async () => [], read: vi.fn() }, [decoderOlder])).toMatchObject({ source: lotusDecoderUrl });
  });

  it("finds the right Decoder and Nykaa pages for a long retailer name (Aqualogica): the pages name a shorter product", async () => {
    const q = "Aqualogica Glow Hydra Gel Moisturizer With Papaya Vitamin C For 24 Hour Intense Hydration";
    const decUrl = "https://inkeedecoder.com/products/aqualogica-glow-hydra-gel-moisturizer";
    const nyUrl = "https://www.nykaa.com/aqualogica-glow-hydra-gel-moisturizer-with-papaya-vitamin-c-for-24-hour-intense-hydration/p/30489182";
    const dec = { source: decUrl, ingredients: names(21, "D"), quote: names(21, "D").join(", "), pageTitles: ["Aqualogica Glow+ Hydra Gel Moisturizer"], trust: 3 as const, origin: "decoder" as const };
    const ny = { ...nykaaCurrent, source: nyUrl, ingredients: names(19, "N"), quote: names(19, "N").join(", "), pageTitles: ["Aqualogica Glow+ Hydra Gel Moisturizer With Papaya & Vitamin C For 24 Hour Intense Hydration"] };
    const r = await findBrandInci(q, "Aqualogica", nyUrl, { search: async () => [decUrl], read: vi.fn(), readDecoder: async () => dec, searchNykaa: async () => [], readNykaa: async () => ny });
    expect(r).toMatchObject({ source: decUrl });
    expect(r?.alternatives).toEqual([{ source: nyUrl, origin: "nykaa", count: 19 }]);
    // A different product with a similar name is not accepted, from any source.
    const oilFree = { ...dec, pageTitles: ["Aqualogica Glow+ Oil Free Moisturizer With Papaya & Vitamin C"] };
    expect(await findBrandInci(q, "Aqualogica", undefined, { search: async () => [decUrl], read: vi.fn(), readDecoder: async () => oilFree })).toBeNull();
  });

  it("compares components, so a source that joins a premix is neither shorter nor 'different' beside one that splits it (Aqualogica)", async () => {
    const split = ["Aqua", "Ethylhexylglycerin", "Phenoxyethanol", "Dimethicone", "Dimethicone Crosspolymer", "Xylitylglucoside", "Anhydroxylitol", "Xylitol", "Glycerin", "Niacinamide"];
    const joined = ["Aqua", "Ethylhexylglycerin (And) Phenoxyethanol", "Dimethicone (And) Dimethicone Crosspolymer", "Xylitylglucoside (And) Anhydroxylitol (And) Xylitol", "Glycerin", "Niacinamide"];
    const dec = { ...decoderOlder, ingredients: split, quote: split.join(", ") };
    const ny = { ...nykaaCurrent, ingredients: joined, quote: joined.join(", ") };
    const r = await findBrandInci(lotusQuery, "Lotus Herbals", nykaaUrl, deps({ readDecoder: async () => dec, readNykaa: async () => ny }));
    expect(r).toMatchObject({ origin: "nykaa" }); // the same 10 components, so the tie goes to the page the shopper pasted
    expect(r?.alternatives).toBeUndefined();
  });

  it("lists that are the same formula are decided by capture and the pasted page, not by length: a parser's stray pieces do not win (Aqualogica)", async () => {
    const common = names(20, "C"); // the real lists share 22 of about 25 components (0.86 alike)
    const clean = [...common, "Beheneth-25 Methacrylate Crosspolymer"];
    const glitchy = [...common, "Beheneth-25 Methacrylate", "Crosspolymer"];
    const dec = { ...decoderOlder, ingredients: glitchy, quote: glitchy.join(", ") };
    const ny = { ...nykaaCurrent, ingredients: clean, quote: clean.join(", ") };
    const r = await findBrandInci(lotusQuery, "Lotus Herbals", nykaaUrl, deps({ readDecoder: async () => dec, readNykaa: async () => ny }));
    expect(r).toMatchObject({ origin: "nykaa" });
    expect(r?.alternatives).toBeUndefined();
    // With no pasted page to break the tie, trust is equal and the longer of the two is used.
    expect(await findBrandInci(lotusQuery, "Lotus Herbals", undefined, deps({ readDecoder: async () => dec, readNykaa: async () => ny, search: async () => [lotusDecoderUrl], searchNykaa: async () => [nykaaUrl] }))).toMatchObject({ origin: "decoder" });
    // A brand page that is the same formula beats both, even when shorter.
    const brandUrl = "https://lotus.in/products/whiteglow-skin-brightening-gel-creme-spf-25";
    const brand = { source: brandUrl, ingredients: clean, quote: clean.join(", "), pageTitles: [lotusQuery] };
    expect(await findBrandInci(lotusQuery, "Lotus", nykaaUrl, deps({ search: async () => [lotusDecoderUrl, brandUrl], read: async () => brand, readDecoder: async () => dec, readNykaa: async () => ny }))).toMatchObject({ origin: "brand-page", trust: 4 });
  });

  it("a Nykaa read that takes too long is dropped: the Decoder list that was already read is still used, and the lookup does not wait on it", async () => {
    vi.useFakeTimers();
    try {
      const never = vi.fn(() => new Promise<null>(() => {}));
      const pending = findBrandInci(lotusQuery, "Lotus Herbals", nykaaUrl, deps({ readNykaa: never }));
      await vi.advanceTimersByTimeAsync(READ_CAP_MS.nykaa - 1000);
      let settled = false; void pending.then(() => { settled = true; });
      await Promise.resolve();
      expect(settled).toBe(false); // still inside the cap
      await vi.advanceTimersByTimeAsync(2000);
      expect(await pending).toMatchObject({ source: lotusDecoderUrl, origin: "decoder" });
    } finally { vi.useRealTimers(); }
  });

  it("asks Firecrawl for Nykaa pages as well, and the pages a first lookup was shown include them", async () => {
    const { deps: wrapped, seen } = recordCandidates(deps());
    await wrapped.searchNykaa!("x");
    expect([...seen]).toContain(nykaaUrl);
  });
});

describe("a brand that gives its product a name of its own", () => {
  const brandUrl = "https://humussbeauty.com/products/sun-sational-spf-50-sunscreen";
  const retailerTitle = "Humuss Beauty Sunscreen - SPF 50 PA+++ Lightweight D-Tan Sunscreen with Hyaluronic Acid, Vitamin - E | In-Vitro Tested";
  const ownName = ["Sun-sational - SPF 50 Hyaluronic Acid Sunscreen"];
  const page = (pageTitles: string[]) => ({ source: brandUrl, ingredients: ["Aqua", "Zinc Oxide", "Glycerin", "Sodium Hyaluronate", "Tocopheryl Acetate", "Xanthan Gum"], quote: "Aqua, Zinc Oxide, Glycerin, Sodium Hyaluronate, Tocopheryl Acetate, Xanthan Gum", pageTitles });

  it("is refused on its title alone (the brand's line name is not in the retailer's title)", async () => {
    const deps = { search: async () => [brandUrl], read: async () => page(ownName) };
    expect(await findBrandInci(retailerTitle, "Humuss Beauty", undefined, deps)).toBeNull();
  });

  it("is taken when the brand's catalogue shows the page is the one product that is clearly this one", async () => {
    const confirm = vi.fn().mockResolvedValue(true);
    const deps = { search: async () => [brandUrl], read: async () => page(ownName), confirmInBrandCatalogue: confirm };
    expect(await findBrandInci(retailerTitle, "Humuss Beauty", undefined, deps)).toMatchObject({ source: brandUrl, origin: "brand-page", trust: 4 });
    expect(confirm).toHaveBeenCalledWith(brandUrl, "Humuss Beauty", retailerTitle);
  });

  it("is refused when the catalogue does not confirm it", async () => {
    const deps = { search: async () => [brandUrl], read: async () => page(ownName), confirmInBrandCatalogue: async () => false };
    expect(await findBrandInci(retailerTitle, "Humuss Beauty", undefined, deps)).toBeNull();
  });

  it("is still refused when the catalogue confirms a page that has no quoted, sane list", async () => {
    const confirm = vi.fn().mockResolvedValue(true);
    for (const bad of [{ ...page(ownName), quote: "" }, { ...page(ownName), ingredients: ["Aqua"] }]) {
      expect(await findBrandInci(retailerTitle, "Humuss Beauty", undefined, { search: async () => [brandUrl], read: async () => bad, confirmInBrandCatalogue: confirm })).toBeNull();
    }
  });

  it("is not asked when the title already names the product, and never for a Decoder page", async () => {
    const confirm = vi.fn().mockResolvedValue(true);
    expect(await findBrandInci(retailerTitle, "Humuss Beauty", undefined, { search: async () => [brandUrl], read: async () => page([retailerTitle]), confirmInBrandCatalogue: confirm })).not.toBeNull();
    expect(confirm).not.toHaveBeenCalled();
    const decoder = "https://inkeedecoder.com/products/humuss-beauty-sun-sational";
    vi.mocked(fetchIncidecoderProduct).mockResolvedValue({ status: "ok", result: { productName: "Sun-sational", slug: "humuss-beauty-sun-sational", ingredients: page(ownName).ingredients, tags: [], source: decoder, imageUrl: null, sourceQuote: page(ownName).quote, pageTitle: "Sun-sational | INKEE Decoder" } } as never);
    expect(await findBrandInci(retailerTitle, "Humuss Beauty", undefined, { search: async () => [decoder], read: vi.fn(), confirmInBrandCatalogue: confirm })).toBeNull();
    expect(confirm).not.toHaveBeenCalled();
  });
});

/* 2026-11-03: Chemist at Play now sells on innovist.com (chemistatplay.in answers 301 to it). The brand-domain rule only knew
   domains that start with the brand's name, so the product page the search ranked first was discarded and the analysis went grey
   ("could not verify a complete ingredient list") although the page prints the full list. The `brands` table has no Chemist at
   Play row (16 brands in all), so a stored website cannot tell the engine: a small reviewed list of a brand's own shop does. */
describe("a brand whose own shop is not on a domain named after it", () => {
  const capUrl = "https://innovist.com/products/oil-control-face-moisturizer";
  const capQuery = "Chemist at Play Oil Control Face Moisturizer with 3% Niacinamide, 1% Postbiotics & 1% Vitamin B5";
  const capList = ["Aqua", "Niacinamide", "Glycerin", "Phytosqualane", "Pentylene Glycol", "Lecithin", "Cetyl Alcohol", "Phenoxyethanol", "Sodium Gluconate"];
  const capPage = { source: capUrl, ingredients: capList, quote: capList.join(", "), pageTitles: ["Oil Control Face Moisturizer with Niacinamide | Chemist at Play"], siteName: "Innovist" };

  it("accepts innovist.com for Chemist at Play, however the brand is spelled", () => {
    for (const brand of ["Chemist at Play", "Chemist At Play", "chemist at play", "Chemistatplay"]) {
      expect(isBrandIngredientUrl(capUrl, brand), brand).toBe(true);
      expect(isBrandIngredientUrl("https://www.innovist.com/products/oil-control-face-moisturizer", brand), brand).toBe(true);
    }
  });

  it("still accepts the old chemistatplay.in address, which keeps working for sources saved before the move", () => {
    expect(isBrandIngredientUrl("https://chemistatplay.in/products/oil-control-face-moisturizer", "Chemist at Play")).toBe(true);
  });

  it("is that brand's alone: innovist.com also sells other brands, and does not become a source for any brand", () => {
    for (const brand of ["Plix", "Anecdote", "Bare Anatomy", "SunScoop", "Chemist"]) expect(isBrandIngredientUrl(capUrl, brand), brand).toBe(false);
  });

  it("keeps the filter strict for Chemist at Play: retailers, marketplaces, blogs, social pages and look-alike domains stay out", () => {
    for (const u of [
      "https://www.nykaa.com/chemist-at-play-oil-control-face-moisturizer/p/123",
      "https://www.amazon.in/Chemist-at-Play-Oil-Control/dp/B0X",
      "https://www.flipkart.com/chemist-at-play-oil-control/p/itm1",
      "https://www.instagram.com/chemistatplay/",
      "https://chemistatplay.blogspot.com/2026/oil-control-review.html",
      "https://innovist.com.evil.test/products/oil-control-face-moisturizer",
      "https://evil-innovist.com/products/oil-control-face-moisturizer",
      "https://xinnovist.com/products/oil-control-face-moisturizer",
      "https://innovist.co/products/oil-control-face-moisturizer",
      "https://innovist.in/products/oil-control-face-moisturizer",
      "https://blog.innovist.com/products/oil-control-face-moisturizer",
      "https://innovist.com@evil.test/products/oil-control-face-moisturizer",
      "https://innovist.com:8443/products/oil-control-face-moisturizer",
      "http://innovist.com/products/oil-control-face-moisturizer",
      "https://innovist.com/",
      "https://innovist.local/products/oil-control-face-moisturizer",
    ]) expect(isBrandIngredientUrl(u, "Chemist at Play"), u).toBe(false);
  });

  it("reads the innovist.com page the search ranks first and returns its whole list, not a retailer's", async () => {
    const nykaa = "https://www.nykaa.com/chemist-at-play-oil-control-face-moisturizer/p/123";
    const read = vi.fn().mockResolvedValue(capPage);
    expect(await findBrandInci(capQuery, "Chemist at Play", undefined, { search: async () => [capUrl, nykaa], read })).toMatchObject({ source: capUrl, ingredients: capList, origin: "brand-page", trust: 4 });
    expect(read).toHaveBeenCalledTimes(1);
    expect(read).toHaveBeenCalledWith(capUrl);
  });

  it("still discards the page when the title does not name the product, even on the brand's own shop", async () => {
    const other = { ...capPage, pageTitles: ["SPF 50 Sunscreen | SunScoop"] };
    expect(await findBrandInci(capQuery, "Chemist at Play", undefined, { search: async () => [capUrl], read: async () => other })).toBeNull();
  });

  it("does not read innovist.com for a different brand", async () => {
    const read = vi.fn();
    expect(await findBrandInci("Plix Oil Control Face Moisturizer", "Plix", undefined, { search: async () => [capUrl], read })).toBeNull();
    expect(read).not.toHaveBeenCalled();
  });
});

/* 2026-11-03: Antinorm's High & Dry. The brand's page is titled just "High & Dry", which the title rule cannot accept (it wants three distinctive words of a
   title inside the shopper's longer name), so a page that carried the whole list was refused as "not this product". */
describe("a brand's own page for a product with a short name of its own", () => {
  const url = "https://antinorm.co/products/high-dry?variant=46510272839818&utm_source=google&gclid=abc";
  const name = "Antinorm High & Dry Everyday Oil-Absorbing Dry Shampoo + Refill";
  const list = ["Zea Mays (Corn) Starch", "Bentonite", "Oryza Sativa (Rice) Starch", "Magnesium Aluminum Silicate", "Kaolin Powder", "Maranta Arundinacea (Arrowroot) Root Powder", "Maize Starch"];
  const page = (over: Partial<{ source: string; pageTitles: string[] }> = {}) => ({ source: url, ingredients: list, quote: list.join(", "), pageTitles: ["High & Dry"], siteName: null, ...over });

  it("is taken when the title and the address say the same words and the shopper's whole name holds them", async () => {
    expect(shortNameOnOwnPage(url, ["High & Dry"], "Antinorm", name)).toBe(true);
    expect(await findBrandInci(name, "Antinorm", url, { search: async () => [], read: async () => page() })).toMatchObject({ origin: "brand-page", trust: 4, ingredients: list });
    expect(await findBrandInci(name, "Antinorm", undefined, { search: async () => ["https://antinorm.co/products/high-dry"], read: async () => page({ source: "https://antinorm.co/products/high-dry" }) })).toMatchObject({ ingredients: list });
  });

  it("is not taken when anything disagrees: another product's address, a word the name lacks, a kind of product only, one word, another domain", () => {
    expect(shortNameOnOwnPage("https://antinorm.co/products/bye-bye-blow-dry", ["High & Dry"], "Antinorm", name)).toBe(false); // address and title disagree
    expect(shortNameOnOwnPage(url, ["High & Dry"], "Antinorm", "Antinorm Bye Bye Blow Dry")).toBe(false); // the name lacks the title's words
    expect(shortNameOnOwnPage("https://antinorm.co/products/face-wash", ["Face Wash"], "Antinorm", "Antinorm Face Wash Gel")).toBe(false); // only a kind of product
    expect(shortNameOnOwnPage("https://antinorm.co/products/serum", ["Serum"], "Antinorm", "Antinorm Vitamin C Serum")).toBe(false); // one word
    expect(shortNameOnOwnPage("https://www.nykaa.com/high-dry/p/123", ["High & Dry"], "Antinorm", name)).toBe(false); // not the brand's own domain
    expect(shortNameOnOwnPage(url, ["High & Dry"], "Plix", name)).toBe(false); // not this brand's domain
    expect(shortNameOnOwnPage(url, [], "Antinorm", name)).toBe(false); // no title at all
  });

  it("does not let findBrandInci take a page it would still refuse: no quote, or another product's page", async () => {
    expect(await findBrandInci(name, "Antinorm", url, { search: async () => [], read: async () => ({ ...page(), quote: "" }) })).toBeNull();
    expect(await findBrandInci(name, "Antinorm", "https://antinorm.co/products/bye-bye-blow-dry", { search: async () => [], read: async () => page({ source: "https://antinorm.co/products/bye-bye-blow-dry" }) })).toBeNull();
  });
});

describe("what counts as a primary ingredient source", () => {
  it("is a Decoder product page, the brand's own product page or a Nykaa product page, and nothing else", () => {
    expect(isPrimaryIngredientUrl("https://inkeedecoder.com/products/plix-night-cream", "Plix")).toBe(true);
    expect(isPrimaryIngredientUrl("https://www.plixlife.com/product/night-cream/602", "Plix")).toBe(true);
    expect(isPrimaryIngredientUrl("https://www.nykaa.com/plix-night-cream/p/123", "Plix")).toBe(true);
    for (const u of ["https://www.nykaa.com/brands/plix/c/9999", "https://www.amazon.in/Plix/dp/B0X123", "https://www.flipkart.com/plix/p/itm1", "https://plixlife.com.evil.test/product/a", "", "not a url"])
      expect(isPrimaryIngredientUrl(u, "Plix"), u).toBe(false);
  });
});

/* 2026-11-03 (owner rule: "the brand's page must be the winner at all times"). The analysis of Be Minimalist's SPF 50 carried Retinol that the brand's own page does not
   list: it came from INKEE Decoder's page for the product (34 entries, a list 73% like the brand's 30), and the brand's page was never even a candidate, because the model
   named the brand "Minimalist" and beminimalist.co begins with "be". */
describe("the brand's own page wins whenever it passes the checks", () => {
  const brandUrl = "https://beminimalist.co/products/multi-vitamin-spf-50";
  const decoderUrl = "https://inkeedecoder.com/products/be-minimalist-spf-50-sunscreen-pa";
  const nykaaUrl = "https://www.nykaa.com/minimalist-spf-50-sunscreen/p/123456";
  const query = "Minimalist SPF 50 Sunscreen";
  const brandList = ["Water/Aqua", "Octocrylene", "Butyl Methoxydibenzoylmethane", "Isododecane", "Niacinamide", "Titanium Dioxide", "Allantoin", "Panthenol", "Sodium Hyaluronate", "Tocopheryl acetate", "Xanthan Gum", "Silica"];
  const decoderList = ["Aqua", "Octocrylene", "Butyl Methoxydibenzoylmethane", "Isododecane", "Niacinamide", "Titanium Dioxide", "Allantoin", "Panthenol", "Sodium Hyaluronate", "Tocopherol Acetate", "Retinol", "Polysorbate 20", "Polyacrylate Crosspolymer-6", "Trisodium Ethylenediamine Disuccinate", "Xanthan Gum", "Silica"];
  const brandPage = { source: brandUrl, ingredients: brandList, quote: brandList.join(", "), pageTitles: ["Multi-Vitamin SPF 50 | Minimalist", "SPF 50 Sunscreen"] };
  const decoderPage = { source: decoderUrl, ingredients: decoderList, quote: decoderList.join(", "), pageTitles: ["Minimalist SPF 50 Sunscreen"] };
  const nykaaPage = { source: nykaaUrl, ingredients: [...decoderList, "Parfum", "Citric Acid"], quote: "x", pageTitles: ["Minimalist SPF 50 Sunscreen"] };
  const deps = (over: Record<string, unknown> = {}) => ({ search: async () => [brandUrl, decoderUrl, nykaaUrl], read: async () => brandPage, readDecoder: async () => decoderPage, searchNykaa: async () => [], readNykaa: async () => nykaaPage, ...over });

  it("beats a longer Decoder list, and the list that lost is recorded, so the choice is visible", async () => {
    const r = await findBrandInci(query, "Be Minimalist", undefined, deps());
    expect(r).toMatchObject({ source: brandUrl, origin: "brand-page", trust: 4 });
    expect(r?.ingredients).toEqual(brandList);
    expect(r?.ingredients).not.toContain("Retinol");
    expect(r?.alternatives).toHaveLength(2); // both other sources differ from the brand's list
    expect(r?.alternatives).toContainEqual({ source: decoderUrl, origin: "decoder", count: decoderList.length });
    expect(r?.alternatives?.map((a) => a.origin).sort()).toEqual(["decoder", "nykaa"]);
  });

  it("beats a longer Nykaa list as well, and a Decoder list that is the same formula is not recorded as a rival", async () => {
    const sameAsBrand = { ...decoderPage, ingredients: [...brandList.slice(0, -1), "Silica"], quote: "y" };
    const r = await findBrandInci(query, "Be Minimalist", undefined, deps({ readDecoder: async () => sameAsBrand }));
    expect(r).toMatchObject({ source: brandUrl, origin: "brand-page" });
    expect(r?.alternatives?.map((a) => a.origin)).toEqual(["nykaa"]);
  });

  it("wins even when the brand's list is far shorter than another source's", async () => {
    const short = { ...brandPage, ingredients: brandList.slice(0, 6), quote: brandList.slice(0, 6).join(", ") };
    expect(await findBrandInci(query, "Be Minimalist", undefined, deps({ read: async () => short }))).toMatchObject({ source: brandUrl, origin: "brand-page" });
  });

  it("is found whichever way the brand is spelled: the model's 'Minimalist' is the brand 'Be Minimalist'", async () => {
    expect(isBrandIngredientUrl(brandUrl, "Minimalist")).toBe(true);
    expect(isBrandIngredientUrl(brandUrl, "Be Minimalist")).toBe(true);
    expect(await findBrandInci(query, "Minimalist", undefined, deps())).toMatchObject({ source: brandUrl, origin: "brand-page" });
  });

  it("is only a page that passes the same checks: one that does not name the product, has no quote or is not a list never wins, and the next source is used", async () => {
    for (const bad of [{ ...brandPage, pageTitles: ["Lip Balm SPF 30 | Minimalist"] }, { ...brandPage, quote: "" }, { ...brandPage, ingredients: ["Contains no parabens", "Free from sulphates", "Made without fragrance"] }])
      expect(await findBrandInci(query, "Be Minimalist", undefined, deps({ read: async () => bad, readNykaa: async () => null })), JSON.stringify(bad.pageTitles)).toMatchObject({ origin: "decoder", source: decoderUrl });
  });

  it("changes nothing when there is no brand page: the most complete list still wins", async () => {
    expect(await findBrandInci(query, "Be Minimalist", undefined, deps({ search: async () => [decoderUrl, nykaaUrl], read: vi.fn() }))).toMatchObject({ source: nykaaUrl, origin: "nykaa" });
  });
});

describe("a brand's own site is recognised from the owner's brands table", () => {
  it("accepts the sites that are not named with the brand's name alone, for that brand only", () => {
    for (const [brand, url] of [
      ["Deconstruct", "https://thedeconstruct.in/products/x"], ["Dot & Key", "https://www.dotandkey.com/products/x"], ["Hyphen", "https://letshyphen.com/products/x"],
      ["Pilgrim", "https://discoverpilgrim.com/products/x"], ["Plum", "https://plumgoodness.com/products/x"], ["Derma Co", "https://thedermaco.com/products/x"],
    ] as const) {
      expect(isBrandIngredientUrl(url, brand), brand).toBe(true);
      expect(isBrandIngredientUrl(url, "Plix"), `${brand} site for another brand`).toBe(false);
      expect(isBrandIngredientUrl(url.replace("https://", "https://evil."), brand), `${brand} look-alike`).toBe(false);
    }
  });
});
