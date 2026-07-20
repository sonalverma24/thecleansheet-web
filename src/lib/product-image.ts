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

export const IMAGE_URL_BLOCKLIST = /logo|icon|sprite|favicon|banner|payment|whatsapp|instagram|facebook|youtube|twitter|pixel|badge|flag|arrow|star|rating|cart|search|menu|avatar|placeholder|loader|spinner|\.svg|\.gif/i;

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

function clean(url: string | undefined | null): string | null {
  if (!url) return null;
  const u = url.replace(/\\\//g, "/").replace(/&amp;/g, "&").trim();
  if (!/^https?:\/\//i.test(u)) return null;
  if (IMAGE_URL_BLOCKLIST.test(u)) return null;
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

export async function searchProductImage(query: string, brand = ""): Promise<string | null> {
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

    // 1. Image hosted on / found via a trusted marketplace listing
    const trusted = candidates.find((c) => TRUSTED_IMAGE_DOMAINS.some((d) => c.context.includes(d)));
    if (trusted) return trusted.url;

    // 2. First clean survivor (Google image relevance for a specific product name is strong)
    return candidates[0]?.url ?? null;
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
   Scrapes retailer search results via the Jina reader and lifts the first
   real product photo. Amazon.in is the primary source (its search page is
   server-rendered enough for the /images/I/ product images to survive). */

const JINA = "https://r.jina.ai/";

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
async function isLiveImage(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "GET", headers: { "User-Agent": UA, Range: "bytes=0-2048" }, signal: AbortSignal.timeout(8000) });
    if (!res.ok && res.status !== 206) return false;
    return (res.headers.get("content-type") || "").startsWith("image/");
  } catch {
    return false;
  }
}

/** Build a clean search query, avoiding "Brand Brand Product" duplication. */
function imageQuery(brand: string, productName: string): string {
  const b = (brand || "").trim();
  const n = (productName || "").trim();
  if (!b) return n;
  return n.toLowerCase().startsWith(b.toLowerCase()) ? n : `${b} ${n}`;
}

const STOP = new Set(["the", "and", "with", "for", "of", "ml", "gm", "gr", "pack", "oz", "kind", "to"]);
function tokens(s: string): string[] {
  return (s.toLowerCase().match(/[a-z0-9]+/g) || []).filter((t) => t.length > 1 && !STOP.has(t));
}

/** From Amazon search markdown, pick the ![alt](image) whose ALT best matches
    the query — never the first image (Amazon injects sponsored items there).
    A wrong-brand photo (e.g. Dot & Key for a Uriage query) is worse than none,
    so the alt text MUST contain the brand before token overlap is even scored. */
export function bestAmazonMatch(md: string, query: string, brand: string): string | null {
  const qTok = tokens(query);
  if (!qTok.length) return null;
  const brandTok = tokens(brand);
  let best: { url: string; score: number } | null = null;
  for (const m of md.matchAll(/!\[[^\]]*?:?\s*([^\]]{4,120})\]\((https:\/\/m\.media-amazon\.com\/images\/I\/[^)\s]+\.(?:jpe?g|png|webp))\)/gi)) {
    const alt = m[1];
    const url = amazonFullRes(m[2]);
    if (IMAGE_URL_BLOCKLIST.test(url)) continue;
    const aTok = new Set(tokens(alt));
    // Brand gate: when we know the brand, at least one brand token must appear.
    if (brandTok.length && !brandTok.some((t) => aTok.has(t))) continue;
    const overlap = qTok.filter((t) => aTok.has(t)).length / qTok.length;
    if (overlap >= 0.5 && (!best || overlap > best.score)) best = { url, score: overlap };
  }
  return best?.url ?? null;
}

export async function findProductImageKeyless(brand: string, productName: string): Promise<string | null> {
  const q = imageQuery(brand, productName);
  if (!q) return null;
  const enc = encodeURIComponent(q);

  // 1 — Amazon.in search: match the image whose alt-title matches the product
  //     AND carries the brand (guards against same-category, wrong-brand photos).
  const amazon = await jinaText(`https://www.amazon.in/s?k=${enc}`);
  if (amazon) {
    const url = bestAmazonMatch(amazon, q, brand);
    if (url && (await isLiveImage(url))) return url;
  }

  // 2 — Nykaa search (fallback; sometimes exposes CDN images). Only trust it when
  //     the brand appears on the results page, so we don't grab a neighbour's image.
  const nykaa = await jinaText(`https://www.nykaa.com/search/result/?q=${enc}`);
  if (nykaa) {
    const brandTok = tokens(brand);
    const brandPresent = !brandTok.length || brandTok.some((t) => nykaa.toLowerCase().includes(t));
    const img = clean(imageFromMarkdown(nykaa));
    if (brandPresent && img && /nykaa|adn-static|images-static/i.test(img) && !IMAGE_URL_BLOCKLIST.test(img) && (await isLiveImage(img))) {
      return img;
    }
  }

  return null;
}
