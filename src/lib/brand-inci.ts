/** Deterministic fallback for retailer/name inputs. Search discovers pages; a matching product page on a recognisable brand domain, an INKEE/INCI Decoder
 * product page, or a Nykaa product page supplies INCI. The three are searched together as equals (owner decision, 2026-10-30): every one that passes the same
 * checks is read, and the most complete list wins, with the other lists recorded so the choice is visible. Other retailers (Amazon, Flipkart...) never supply it. */
import { fetchInciFromProductPage, type InciAlternative, type PageINCI } from "./inci-from-page";
import { fetchIncidecoderProduct, incidecoderProductSlug } from "./inci-fetch";
import { generateResilientWithMeta } from "./gemini";
import { fetchPageMarkdown } from "./scrape";
import { inciSimilarity, pageTitleNamesProduct, sanitizeInciList } from "./product-identity";
import { isNykaaProductUrl, readNykaaPage, searchNykaaPages } from "./nykaa-inci";

const compact = (s: string) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const SUFFIXES = new Set(["", "life", "beauty", "skincare", "skin", "cosmetics", "care", "naturals", "india", "official", "labs", "science", "wellness"]);

/** Conservative discovery filter: unknown domain spellings stay unverified. */
export function isBrandIngredientUrl(raw: string, brand: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" || u.username || u.password || u.port || u.hostname.endsWith(".local")) return false;
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    const labels = host.split(".");
    if (!(labels.length === 2 || (labels.length === 3 && labels[1] === "co" && labels[2] === "in")) || /^\d+(\.\d+)*$/.test(host)) return false;
    const domain = compact(labels[0]);
    const b = compact(brand);
    return b.length >= 3 && domain.startsWith(b) && SUFFIXES.has(domain.slice(b.length)) && u.pathname !== "/";
  } catch { return false; }
}

/** Firecrawl web search, URLs only (no page content, so one credit). Empty when the key is unset or the call fails. */
async function firecrawlPages(query: string): Promise<string[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ query: `${query} official ingredients`, limit: 5 }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { data?: { url?: string }[] };
    return (data.data ?? []).flatMap((x) => x.url ? [x.url] : []);
  } catch { return []; }
}

/** Where candidate pages come from. Firecrawl first. Google's Custom Search API is next, but it answers 403 for this project
 *  (it has no access to the API), so it is a fallback that works only if access is restored. */
export async function searchBrandPages(query: string): Promise<string[]> {
  const found = await firecrawlPages(query);
  if (found.length) return found;
  const key = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_CX;
  if (key && cx) {
    try {
      const params = new URLSearchParams({ key, cx, q: `${query} official ingredients`, num: "5" });
      const res = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`, { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        const data = await res.json() as { items?: { link?: string }[] };
        const links = (data.items ?? []).flatMap((x) => x.link ? [x.link] : []);
        if (links.length) return links;
      }
    } catch { /* Try the public search reader next. */ }
  }
  const page = await fetchPageMarkdown(`https://www.google.com/search?q=${encodeURIComponent(`${query} official ingredients`)}`, 20000);
  return [...(page ?? "").matchAll(/\]\((https:\/\/[^\s)]+)\)/g)].map((m) => m[1]);
}

export interface Dependencies {
  search: (query: string) => Promise<string[]>;
  read: (url: string) => Promise<PageINCI | null>;
  /** A Decoder product page that a search surfaced. Optional so a caller can supply only search and read. */
  readDecoder?: (url: string) => Promise<PageINCI | null>;
  /** Candidate page URLs from a web-grounded model, asked only when nothing found so far gave a list. */
  askModel?: (query: string) => Promise<string[]>;
  /** Nykaa product pages for the query, and a reader for one (the page is rendered and its Ingredients tab opened). Optional: without them Nykaa is not consulted. */
  searchNykaa?: (query: string) => Promise<string[]>;
  readNykaa?: (url: string) => Promise<PageINCI | null>;
}

/** Read a Decoder product page with the parser the engine already uses. A quote that was cut short is refused:
 *  this path does not carry the truncation flag on, so a partial list must not look complete. */
async function readDecoderPage(url: string): Promise<PageINCI | null> {
  const page = await fetchIncidecoderProduct(url);
  if (page.status !== "ok" || page.result.sourceQuoteTruncated || !page.result.sourceQuote?.trim()) return null;
  const r = page.result;
  return { ingredients: r.ingredients, source: r.source, quote: r.sourceQuote, pageTitles: [r.productName, ...(r.pageTitle ? [r.pageTitle] : [])], siteName: "INKEE Decoder", trust: 3, origin: "decoder" };
}

/** The only thing the model is asked for is where a page is. The list is never taken from the model: the code fetches the page and reads
 *  it, and a URL is used only if it is on a brand's own domain or is a Decoder product page, and the page names the product. */
export const PAGE_FINDER_SYSTEM_PROMPT = [
  "You locate one web page for a skincare or beauty product. Use Google Search and read the results.",
  'Reply with ONLY a JSON object: {"url": "https://..."} or {"url": null}.',
  "The URL must be a page that appeared in your search results, and must be either (a) this product's own page on the brand's official website, or (b) this product's page on inkeedecoder.com (formerly incidecoder.com).",
  "It must NOT be a retailer, marketplace, quick-commerce, blog, review, news or social page.",
  "Never write a URL from memory and never guess one from the brand's URL pattern. If the search did not return the page, answer {\"url\": null}.",
  "Return only the page URL. Do not write an ingredient list or any other text.",
].join("\n");

const GROUNDING_REDIRECT = /^https:\/\/vertexaisearch\.cloud\.google\.com\/grounding-api-redirect\//;

/** The search tool shows the model its results as Google redirect links, so that is what it answers with. Follow one by hand (never
 *  anything else), at most three hops, to the page it points to. A link the search did not issue does not resolve. */
async function resolveSearchRedirect(raw: string): Promise<string | null> {
  let current = raw;
  for (let hop = 0; hop < 3 && GROUNDING_REDIRECT.test(current); hop++) {
    const res = await fetch(current, { redirect: "manual", signal: AbortSignal.timeout(8000) });
    const next = res.headers.get("location");
    if (!next) return null;
    current = new URL(next, current).href;
  }
  return GROUNDING_REDIRECT.test(current) ? null : current;
}

/** Ask a web-grounded model where the product's own page is. Returns at most one https URL, and only when the call really searched
 *  (no grounding means it may have answered from memory). The URL is only a lead: the page behind it still has to be a brand page or
 *  a Decoder page, name the product and carry a list with its quote before anything is taken from it. */
export async function askModelForProductPage(query: string): Promise<string[]> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const gen = await Promise.race([
      generateResilientWithMeta(PAGE_FINDER_SYSTEM_PROMPT, `Find the page for this product: ${query}`),
      new Promise<null>((resolve) => { timer = setTimeout(() => resolve(null), 30000); }),
    ]);
    if (!gen?.groundingMetadata) return [];
    const json = /\{[\s\S]*\}/.exec(gen.text)?.[0];
    const raw = json ? (JSON.parse(json) as { url?: unknown }).url : null;
    if (typeof raw !== "string" || raw.length > 2000) return [];
    const given = new URL(raw.trim());
    if (given.protocol !== "https:") return [];
    const real = GROUNDING_REDIRECT.test(given.href) ? await resolveSearchRedirect(given.href) : given.href;
    if (!real) return [];
    const page = new URL(real);
    return page.protocol === "https:" ? [page.href] : [];
  } catch { return []; }
  finally { if (timer) clearTimeout(timer); }
}

/** What the engine uses when it passes nothing: Firecrawl and Google search, Decoder pages, brand pages, Nykaa pages, then the grounded model. */
export const defaultBrandInciDeps: Dependencies = { search: searchBrandPages, read: fetchInciFromProductPage, readDecoder: readDecoderPage, askModel: askModelForProductPage, searchNykaa: searchNykaaPages, readNykaa: readNykaaPage };

/** Wrap a lookup's dependencies so every URL it was shown (search results and the model's proposals) is remembered in `seen`.
 *  A search typed as a name can only guess the brand from the first word the shopper wrote, and a brand page such as
 *  juicychemistry.com fails the brand check for "Juicy". Once the brand is known the same URLs can be judged again with
 *  `withKnownCandidates`, at no extra search or model cost. */
export function recordCandidates(deps: Dependencies): { deps: Dependencies; seen: Set<string> } {
  const seen = new Set<string>();
  const note = (urls: string[]) => { for (const u of urls) seen.add(u); return urls; };
  return {
    seen,
    deps: {
      ...deps,
      search: async (q) => note(await deps.search(q)),
      askModel: deps.askModel ? async (q) => note(await deps.askModel!(q)) : undefined,
      searchNykaa: deps.searchNykaa ? async (q) => note(await deps.searchNykaa!(q)) : undefined,
    },
  };
}

/** `deps` that also offers the URLs an earlier lookup was shown, ahead of whatever its own search returns. Every candidate
 *  still has to pass the same brand-domain, product-title, captured-quote and list checks. */
export function withKnownCandidates(deps: Dependencies, known: Iterable<string>): Dependencies {
  const urls = [...known];
  return { ...deps, search: async (q) => [...urls, ...(await deps.search(q).catch(() => [] as string[]))] };
}

interface Read { page: PageINCI; supplied: boolean }

/** The list as components: a premix printed "A (And) B" is two ingredients, as INKEE Decoder lists it. Counting and comparing components keeps a source that joins a
    premix from looking shorter, or different, than one that splits it. */
const components = (page: PageINCI): string[] =>
  sanitizeInciList(page.ingredients).list.flatMap((item) => item.split(/\s*\(\s*and\s*\)\s*/i)).map((c) => c.trim()).filter(Boolean);
const listCount = (page: PageINCI): number => new Set(components(page).map((c) => c.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, ""))).size;
/** Two lists this alike are the same formula written two ways; only a list below this is recorded as a different one. */
const SAME_FORMULA = 0.85;

/** Find the product's ingredient list. Decoder pages, the brand's own pages and Nykaa product pages (the pasted one, and what search finds) are read together;
    each must name the product, carry a captured quote and be an ingredient list. The most complete list wins; a tie goes to the better-captured source (a brand's
    page over Decoder or Nykaa), then to the page the shopper pasted. Sources whose list differs are recorded on the winner as `alternatives`.
    `known` holds a list already found elsewhere (the Decoder page the engine resolved by name), which competes on the same terms. */
export async function findBrandInci(query: string, brand: string, suppliedUrl?: string, deps: Dependencies = defaultBrandInciDeps, known: PageINCI[] = []): Promise<PageINCI | null> {
  const tried = new Set<string>();
  const readDecoder = deps.readDecoder ?? readDecoderPage;
  const usable = (page: PageINCI | null): page is PageINCI =>
    !!page?.quote?.trim() && !!page.pageTitles?.some((title) => pageTitleNamesProduct(title, brand, query)) && sanitizeInciList(page.ingredients).ok;

  const readAll = async (candidates: string[]): Promise<Read[]> => {
    const fresh = [...new Set(candidates)].filter((u) => !tried.has(u));
    const decoderUrls = fresh.filter((u) => incidecoderProductSlug(u)).slice(0, 2);
    const brandUrls = fresh.filter((u) => isBrandIngredientUrl(u, brand)).slice(0, 3);
    const nykaaUrls = deps.readNykaa ? fresh.filter(isNykaaProductUrl).slice(0, 2) : [];
    for (const u of [...decoderUrls, ...brandUrls, ...nykaaUrls]) tried.add(u);
    const reads = await Promise.all([
      ...decoderUrls.map(async (url) => ({ url, page: await readDecoder(url).catch(() => null), origin: "decoder" as const })),
      ...brandUrls.map(async (url) => ({ url, page: await deps.read(url).catch(() => null), origin: "brand-page" as const })),
      ...nykaaUrls.map(async (url) => ({ url, page: await deps.readNykaa!(url).catch(() => null), origin: "nykaa" as const })),
    ]);
    return reads.flatMap((r) => (usable(r.page)
      ? [{ page: { ...r.page, origin: r.page.origin ?? r.origin, trust: r.page.trust ?? (r.origin === "brand-page" ? 4 as const : 3 as const) }, supplied: r.url === suppliedUrl }]
      : []));
  };

  const choose = (reads: Read[]): PageINCI | null => {
    if (!reads.length) return null;
    const best = [...reads].sort((a, b) => listCount(b.page) - listCount(a.page) || (b.page.trust ?? 3) - (a.page.trust ?? 3) || Number(b.supplied) - Number(a.supplied))[0];
    const alternatives: InciAlternative[] = reads
      .filter((r) => r !== best && inciSimilarity(components(r.page), components(best.page)) < SAME_FORMULA)
      .map((r) => ({ source: r.page.source, origin: r.page.origin ?? "decoder", count: listCount(r.page) }));
    return alternatives.length ? { ...best.page, alternatives } : best.page;
  };

  const knownReads: Read[] = known.filter((k) => !!k.quote?.trim() && sanitizeInciList(k.ingredients).ok).map((page) => ({ page, supplied: false }));
  for (const k of known) tried.add(k.source);

  let discovered: string[] = [];
  try {
    const [general, nykaa] = await Promise.all([
      deps.search(query).catch(() => [] as string[]),
      deps.searchNykaa ? deps.searchNykaa(query).catch(() => [] as string[]) : Promise.resolve([] as string[]),
    ]);
    discovered = [...general, ...nykaa];
  } catch { /* No source is safer than a failed analysis. */ }
  const found = choose([...knownReads, ...(await readAll([...(suppliedUrl ? [suppliedUrl] : []), ...discovered]))]);
  if (found || !deps.askModel) return found;

  // Nothing found so far gave a list: ask the web-grounded model where the page is, then read that page ourselves.
  let asked: string[] = [];
  try { asked = await deps.askModel(query); } catch { /* The model is a last resort, never a reason to fail. */ }
  return choose(await readAll(asked));
}
