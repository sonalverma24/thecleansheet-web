import { afterEach, describe, expect, it, vi } from "vitest";
import { PAGE_FINDER_SYSTEM_PROMPT, askModelForProductPage, findBrandInci, isBrandIngredientUrl, recordCandidates, searchBrandPages, withKnownCandidates } from "./brand-inci";
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
    expect(await findBrandInci("Plix Pomegranate Youth Renewal Night Cream", "Plix", undefined, deps)).toEqual(list);
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
  it("is a primary source: read, matched to the product and used before any brand page", async () => {
    const read = vi.fn();
    const deps = { search: async () => ["https://www.dotandkey.com/products/serum", decoderUrl], read, readDecoder: vi.fn().mockResolvedValue(decoderList) };
    expect(await findBrandInci(dkQuery, "Dot", undefined, deps)).toEqual(decoderList);
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
    expect(await findBrandInci("Plix Pomegranate Youth Renewal Night Cream", "Plix", undefined, deps)).toEqual(brand);
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
    expect(await findBrandInci(amahvasQuery, "Amahvas", undefined, { search: async () => [], read, askModel })).toEqual(amahvasPage);
    expect(askModel).toHaveBeenCalledWith(amahvasQuery);
    expect(read).toHaveBeenCalledWith(amahvasUrl);

    const found = vi.fn();
    expect(await findBrandInci(amahvasQuery, "Amahvas", undefined, { search: async () => [amahvasUrl], read: async () => amahvasPage, askModel: found })).toEqual(amahvasPage);
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
    expect(await findBrandInci(identified, "Juicy Chemistry", undefined, second)).toEqual(juicyPage);
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
