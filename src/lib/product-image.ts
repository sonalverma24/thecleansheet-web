/* ────────────────────────────────────────────────────────────────
   Product image resolver — precision first.
   A wrong product photo damages credibility more than no photo,
   so every strategy filters aggressively and we return null over
   guessing. Strategy order:
     1. og:image / twitter:image meta (server-rendered on most stores)
     2. JSON-LD Product "image"
     3. Amazon-specific hiRes/landingImage
     4. Caller may fall back to scraped-markdown images (Jina)
──────────────────────────────────────────────────────────────── */

import type { ProductImageSource } from "@/lib/product-review-types";

/** A resolved image plus its provenance, so the engine can store which strategy
    won and how confident the match was (see /admin/repository audit column). */
export interface ImagePick {
  url: string;
  source: ProductImageSource;
  /** 0-1 match score when the resolver scored it; null for trusted sources. */
  confidence: number | null;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

export const IMAGE_URL_BLOCKLIST = /logo|icon|sprite|favicon|banner|payment|whatsapp|instagram|facebook|youtube|twitter|pixel|badge|flag|arrow|star|rating|cart|search|menu|avatar|placeholder|loader|spinner|51HCHFclmmL|\.svg|\.gif/i;
// ^ 51HCHFclmmL = Amazon.in's generic share placeholder, served as og:image on
//   product pages when it bot-walls a scraper. It is NOT a product photo, so it
//   must never win (several unrelated products otherwise resolve to it).

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

/** Test the blocklist against the URL's PATH + query only, not the hostname —
    otherwise a CDN host like rukminim2.flixcart.com trips on "cart" and every
    real Flipkart product image is wrongly rejected. */
function isBlockedImage(rawUrl: string): boolean {
  let s = rawUrl;
  try { const u = new URL(rawUrl); s = `${u.pathname}${u.search}`; } catch { /* keep raw */ }
  return IMAGE_URL_BLOCKLIST.test(s);
}

function clean(url: string | undefined | null): string | null {
  if (!url) return null;
  const u = url.replace(/\\\//g, "/").replace(/&amp;/g, "&").trim();
  if (!/^https?:\/\//i.test(u)) return null;
  if (isBlockedImage(u)) return null;
  return u;
}

function fromMeta(html: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    const url = clean(m?.[1]);
    if (url) return url;
  }
  return null;
}

function fromJsonLd(html: string): string | null {
  const blocks = html.match(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  for (const block of blocks) {
    const body = block.replace(/<script[^>]*>/i, "").replace(/<\/script>/i, "").trim();
    try {
      const parsed = JSON.parse(body);
      const found = findProductImage(parsed);
      if (found) return found;
    } catch { /* malformed block — skip */ }
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findProductImage(node: any): string | null {
  if (Array.isArray(node)) {
    for (const n of node) {
      const r = findProductImage(n);
      if (r) return r;
    }
    return null;
  }
  if (node && typeof node === "object") {
    const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    if (types.includes("Product")) {
      const img = node.image;
      const candidate = typeof img === "string" ? img
        : Array.isArray(img) ? (typeof img[0] === "string" ? img[0] : img[0]?.url)
        : img?.url;
      const url = clean(candidate);
      if (url) return url;
    }
    for (const v of Object.values(node)) {
      const r = findProductImage(v);
      if (r) return r;
    }
  }
  return null;
}

function fromAmazon(html: string): string | null {
  const hiRes = html.match(/"hiRes"\s*:\s*"(https:[^"]+)"/);
  if (hiRes) { const u = clean(hiRes[1]); if (u) return u; }
  const landing = html.match(/id=["']landingImage["'][^>]+src=["']([^"']+)["']/);
  if (landing) { const u = clean(landing[1]); if (u) return u; }
  return null;
}

/** Fetch a product page directly and extract its canonical product image. */
export async function resolveProductImage(pageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(pageUrl, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const html = (await res.text()).slice(0, 500_000);
    return fromMeta(html) ?? fromJsonLd(html) ?? fromAmazon(html);
  } catch {
    return null;
  }
}

/* ── Google Programmable Search (image mode) ──
   Activates when GOOGLE_CSE_API_KEY + GOOGLE_CSE_CX are set; no-op otherwise.
   Trusted marketplaces first — the goal is the RIGHT product, not any image. */

const TRUSTED_IMAGE_DOMAINS = [
  "nykaa.com", "amazon.in", "purplle.com", "flipkart.com",
  "myntra.com", "tirabeauty.com", "sephora.nnnow.com", "smytten.com",
];

interface CseItem {
  link?: string;
  displayLink?: string;
  title?: string;
  image?: { contextLink?: string };
}

export async function searchProductImage(query: string, brand = ""): Promise<ImagePick | null> {
  const key = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_CX;
  if (!key || !cx || !query.trim()) return null;

  try {
    const params = new URLSearchParams({
      key, cx,
      q: query.trim(),
      searchType: "image",
      num: "8",
      safe: "active",
      imgSize: "large",
    });
    const res = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const items: CseItem[] = Array.isArray(data?.items) ? data.items : [];

    let candidates = items
      .map((it) => ({
        url: clean(it.link),
        context: `${it.displayLink ?? ""} ${it.image?.contextLink ?? ""} ${it.title ?? ""}`.toLowerCase(),
      }))
      .filter((c): c is { url: string; context: string } => !!c.url);

    // Brand gate: when we know the brand, keep only results whose context mentions it.
    const brandTok = tokens(brand);
    if (brandTok.length) {
      const branded = candidates.filter((c) => brandTok.some((t) => c.context.includes(t)));
      if (!branded.length) return null; // no brand-matching image is better than a wrong one
      candidates = branded;
    }

    // Product gate: the context/title must mention the product itself, not just the
    // brand — otherwise a right-brand, wrong-variant photo wins on brand alone.
    // Score each survivor by how many product-specific tokens (query minus brand)
    // its context covers, and drop anything under half. Precision over recall: no
    // context-confirmed match is better than a plausible-but-wrong variant.
    const productTok = tokens(query).filter((t) => !brandTok.includes(t));
    if (productTok.length) {
      const scored = candidates
        .map((c) => ({ ...c, score: productTok.filter((t) => c.context.includes(t)).length / productTok.length }))
        .filter((c) => c.score >= 0.5)
        .sort((a, b) => b.score - a.score);
      if (!scored.length) return null;
      // Among the best-matching results, still prefer a trusted marketplace listing.
      const top = scored[0].score;
      const best = scored.filter((c) => c.score === top);
      const chosen = best.find((c) => TRUSTED_IMAGE_DOMAINS.some((d) => c.context.includes(d))) ?? best[0];
      return { url: chosen.url, source: "cse", confidence: round2(chosen.score) };
    }

    // Brand-only query (no product-specific tokens): fall back to trusted-first.
    const trusted = candidates.find((c) => TRUSTED_IMAGE_DOMAINS.some((d) => c.context.includes(d)));
    const chosen = trusted ?? candidates[0];
    return chosen ? { url: chosen.url, source: "cse", confidence: null } : null;
  } catch {
    return null;
  }
}

/** Extract the most plausible product image from scraped markdown (fallback). */
export function imageFromMarkdown(markdown: string): string | null {
  const matches = [...markdown.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g)];
  const urls = matches.map((m) => clean(m[1])).filter((u): u is string => !!u);
  // Prefer URLs with an explicit raster-image extension; otherwise first survivor
  return urls.find((u) => /\.(jpe?g|png|webp)([?#]|$)/i.test(u)) ?? urls[0] ?? null;
}

/* ─── Keyless product-image search (no Google CSE) ───
   Scrapes retailer search results and lifts the best-matching product photo.
   Fetch order per source: Firecrawl (renders JS + gets past bot walls) then the
   Jina reader as a free fallback. Nykaa is the reliable source — its search page
   lazy-loads images that only a JS-rendering fetch (Firecrawl) exposes; Amazon.in
   is bot-walled to both readers today, so it is a cheap best-effort first try. */

const JINA = "https://r.jina.ai/";
const FIRECRAWL = "https://api.firecrawl.dev/v1/scrape";

/** JS-rendered scrape via Firecrawl. No-op (null) when FIRECRAWL_API_KEY is unset. */
async function firecrawlMarkdown(url: string): Promise<string | null> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(FIRECRAWL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: false }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const md = data?.data?.markdown;
    return typeof md === "string" && md.length ? md : null;
  } catch {
    return null;
  }
}

async function jinaText(url: string): Promise<string | null> {
  try {
    const res = await fetch(JINA + url, {
      headers: { Accept: "text/plain", "X-Return-Format": "markdown" },
      signal: AbortSignal.timeout(20000),
    });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

/** Amazon thumbnails carry size modifiers (…._AC_SR250,250_QL65_.jpg). Strip
    them back to the base id for a full-resolution image. */
function amazonFullRes(url: string): string {
  return url.replace(/(\/images\/I\/[A-Za-z0-9%+_-]+)\.[^/]*(\.(?:jpe?g|png|webp))(?:$|[?#])/i, "$1$2");
}

/** Confirm a URL really is a servable image (guards against stale/404 links). */
export async function isLiveImage(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "GET", headers: { "User-Agent": UA, Range: "bytes=0-2048" }, signal: AbortSignal.timeout(8000) });
    if (!res.ok && res.status !== 206) return false;
    return (res.headers.get("content-type") || "").startsWith("image/");
  } catch {
    return false;
  }
}

/** Build a clean search query, avoiding "Brand Brand Product" duplication. The
    product name is trimmed to its CORE (everything before the first pipe, comma
    or paren) so a long marketing string like "…Face Wash, Salicylic & Green Tea,
    Acne & Oil Control" doesn't starve the ≥50%-token-overlap gate in the matcher. */
function imageQuery(brand: string, productName: string): string {
  const b = (brand || "").trim();
  const full = (productName || "").trim();
  const core = full.split(/[|(]/)[0].split(",")[0].trim() || full;
  if (!b) return core;
  return core.toLowerCase().startsWith(b.toLowerCase()) ? core : `${b} ${core}`;
}

const STOP = new Set(["the", "and", "with", "for", "of", "ml", "gm", "gr", "pack", "oz", "kind", "to"]);
function tokens(s: string): string[] {
  return (s.toLowerCase().match(/[a-z0-9]+/g) || []).filter((t) => t.length > 1 && !STOP.has(t));
}

/** Shared per-image matcher for scraped retailer search markdown. Walks every
    ![alt](url) pair, keeps only URLs the `accept` predicate normalises (host +
    extension gate), and scores each by how much of the query its ALT text covers.
    Never returns the first image on a page: results pages lead with banners and
    sponsored neighbours, so a photo only wins on real alt-text evidence.
    A wrong-brand photo (e.g. Dot & Key for a Uriage query) is worse than none,
    so the alt text MUST contain the brand before token overlap is even scored. */
function bestMarkdownMatch(
  md: string,
  query: string,
  brand: string,
  accept: (rawUrl: string) => string | null,
): { url: string; score: number } | null {
  const qTok = tokens(query);
  if (!qTok.length) return null;
  const brandTok = tokens(brand);
  let best: { url: string; score: number } | null = null;
  for (const m of md.matchAll(/!\[[^\]]*?:?\s*([^\]]{4,120})\]\((https?:\/\/[^)\s]+)\)/gi)) {
    const raw = m[2].replace(/\\\//g, "/").replace(/&amp;/g, "&");
    const url = accept(raw);
    if (!url || isBlockedImage(url)) continue;
    const aTok = new Set(tokens(m[1]));
    // Brand gate: when we know the brand, at least one brand token must appear.
    if (brandTok.length && !brandTok.some((t) => aTok.has(t))) continue;
    const overlap = qTok.filter((t) => aTok.has(t)).length / qTok.length;
    if (overlap >= 0.5 && (!best || overlap > best.score)) best = { url, score: overlap };
  }
  return best;
}

const acceptAmazon = (u: string): string | null =>
  /^https:\/\/m\.media-amazon\.com\/images\/I\/[^)\s]+\.(?:jpe?g|png|webp)/i.test(u) ? amazonFullRes(u) : null;

const acceptNykaa = (u: string): string | null =>
  /^https:\/\/[^)\s]*(?:nykaa|adn-static|images-static)[^)\s]*\.(?:jpe?g|png|webp)/i.test(u) ? u : null;

/** From Amazon search markdown, pick the ![alt](image) whose ALT best matches
    the query — never the first image (Amazon injects sponsored items there). */
export function bestAmazonMatch(md: string, query: string, brand: string): string | null {
  return bestMarkdownMatch(md, query, brand, acceptAmazon)?.url ?? null;
}

/** From Nykaa search markdown, pick the ![alt](image) whose ALT best matches the
    query. Same brand + token-overlap discipline as Amazon: matching the specific
    product beats grabbing the first CDN image the results page happens to expose. */
export function bestNykaaMatch(md: string, query: string, brand: string): string | null {
  return bestMarkdownMatch(md, query, brand, acceptNykaa)?.url ?? null;
}

export async function findProductImageKeyless(brand: string, productName: string): Promise<ImagePick | null> {
  const q = imageQuery(brand, productName);
  if (!q) return null;
  const enc = encodeURIComponent(q);

  // 1 — Amazon.in search via the free Jina reader (bot-walled today, but cheap to
  //     try in case it recovers). Match the image whose alt-title carries the brand
  //     AND the product (guards against same-category, wrong-brand photos).
  const amazon = await jinaText(`https://www.amazon.in/s?k=${enc}`);
  if (amazon) {
    const pick = bestMarkdownMatch(amazon, q, brand, acceptAmazon);
    if (pick && (await isLiveImage(pick.url))) return { url: pick.url, source: "amazon", confidence: round2(pick.score) };
  }

  // 2 — Nykaa search via Firecrawl (Jina drops Nykaa's lazy-loaded images; the
  //     JS-rendered fetch exposes the catalog CDN photos). Match the specific
  //     product by ALT text (brand + token overlap), never the first image — the
  //     results page leads with brand logos and sponsored neighbours.
  const nykaa = await firecrawlMarkdown(`https://www.nykaa.com/search/result/?q=${enc}`)
    ?? await jinaText(`https://www.nykaa.com/search/result/?q=${enc}`);
  if (nykaa) {
    const pick = bestMarkdownMatch(nykaa, q, brand, acceptNykaa);
    if (pick && (await isLiveImage(pick.url))) return { url: pick.url, source: "nykaa", confidence: round2(pick.score) };
  }

  // 3 — Web search via Firecrawl: finds the product on ANY Indian retailer
  //     (Amazon.in, Flipkart, Meesho…) and lifts its og:image. This is the catch-all
  //     for niche, Amazon-only brands that Nykaa doesn't carry and Amazon bot-walls.
  const viaSearch = await findProductImageViaSearch(brand, productName);
  if (viaSearch) return viaSearch;

  return null;
}

/* Retailer domains we trust for a web-search og:image result. Kept to Indian
   storefronts (+ common marketplaces) so a US/wrong-country listing can't win.
   Amazon.in is deliberately EXCLUDED: it bot-walls scrapers and serves a generic
   placeholder as og:image, so its listings never yield a real product photo. */
const SEARCH_RETAILERS = [
  "flipkart.com", "nykaa.com", "myntra.com", "purplle.com",
  "meesho.com", "tirabeauty.com", "tatacliq.com", "ajio.com", "shopsy.in",
];

interface FcSearchItem {
  url?: string;
  title?: string;
  metadata?: { ogImage?: string; "og:image"?: string };
}

/** Firecrawl web search; returns scraped results (with og:image metadata). No-op
    ([]) when FIRECRAWL_API_KEY is unset. */
async function firecrawlSearch(query: string): Promise<FcSearchItem[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ query, limit: 8, scrapeOptions: { formats: ["markdown"] } }),
      signal: AbortSignal.timeout(90000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.data) ? (data.data as FcSearchItem[]) : [];
  } catch {
    return [];
  }
}

/** Resolve a product image by web-searching trusted Indian retailers and taking
    the best-matching listing's og:image. Same brand + token discipline as the
    markdown matchers: the listing title/URL must carry the brand and clear the
    ≥50% product-token bar, so a same-category neighbour can't win. */
export async function findProductImageViaSearch(brand: string, productName: string): Promise<ImagePick | null> {
  const q = imageQuery(brand, productName);
  if (!q) return null;
  const items = await firecrawlSearch(`${q} buy online`);
  if (!items.length) return null;

  const brandTok = tokens(brand);
  const prodTok = tokens(q);
  if (!prodTok.length) return null;

  let best: { url: string; score: number } | null = null;
  for (const it of items) {
    const url = (it.url ?? "").toLowerCase();
    if (!SEARCH_RETAILERS.some((d) => url.includes(d))) continue; // trusted storefronts only
    // Prefer https so the image renders on the https site; upgrade http CDNs.
    const rawOg = it.metadata?.ogImage ?? it.metadata?.["og:image"];
    const og = clean(rawOg)?.replace(/^http:\/\//i, "https://");
    if (!og || isBlockedImage(og)) continue;
    const hay = `${it.title ?? ""} ${url}`.toLowerCase();
    if (brandTok.length && !brandTok.some((t) => hay.includes(t))) continue; // brand gate
    const overlap = prodTok.filter((t) => hay.includes(t)).length / prodTok.length;
    if (overlap >= 0.5 && (!best || overlap > best.score)) best = { url: og, score: overlap };
  }
  if (best && (await isLiveImage(best.url))) {
    return { url: best.url, source: "search", confidence: round2(best.score) };
  }
  return null;
}
