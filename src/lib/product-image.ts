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
  image?: { contextLink?: string };
}

export async function searchProductImage(query: string): Promise<string | null> {
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

    const candidates = items
      .map((it) => ({ url: clean(it.link), context: `${it.displayLink ?? ""} ${it.image?.contextLink ?? ""}`.toLowerCase() }))
      .filter((c): c is { url: string; context: string } => !!c.url);

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
