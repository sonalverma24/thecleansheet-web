/** A second way to tell that a brand's own product page is the product a shopper named, for a brand that gives its product a name of its own.
 *
 *  The title check refuses a page whose title has words the shopper's name lacks ("Oil Free", "Jello", another brand): that is what stops a wrong variant's list
 *  from being published, and it must stay. But a brand that renames its product ("Sun-sational - SPF 50 Hyaluronic Acid Sunscreen", which a retailer sells as
 *  "Humuss Beauty Sunscreen - SPF 50 PA+++ Lightweight D-Tan Sunscreen with Hyaluronic Acid, Vitamin - E | In-Vitro Tested") fails it on the brand's own line name
 *  alone. What tells a renamed product from a wrong variant is the brand's whole catalogue: if exactly one product there is clearly this one, and none is a
 *  rival, the page is the product. The catalogue is read from the Shopify feed every Shopify store serves (`/products.json`); a store that does not serve one,
 *  or whose catalogue we could not read in full, confirms nothing. */
import { nameTokens } from "./product-identity";

export interface CatalogueProduct { title: string; handle: string }

/** Words that make a catalogue product a different thing from the plain product: a sample, a set, a shade. One the shopper's name lacks rules the product out. */
const VARIANT_WORDS = new Set([
  "tester", "sample", "sachet", "trial", "mini", "travel", "kit", "combo", "pack", "set", "duo", "trio", "bundle", "hamper", "gift", "refill", "pouch",
  "tinted", "tint", "shade", "matte", "dewy", "gel", "cream", "lotion", "spray", "stick", "serum", "oil", "fluid", "milk", "powder", "balm", "mist",
]);
/** Distinctive words the catalogue product and the shopper's name must share, and the share of the catalogue product's own words they must make. */
const MIN_SHARED = 4;
const MIN_SHARE = 0.6;
/** The best match must lead the next-best by this many shared words, or it is a rival, not a match. */
const MIN_LEAD = 2;

const stem = (w: string): string => (w.length > 3 ? w.replace(/s$/, "") : w);
const stems = (name: string, brand: string): Set<string> => new Set([...nameTokens(name, brand)].map(stem));
/** The words with a digit in them (SPF 50, 30ml, 10%): they must be the same set on both sides, so another SPF or another size never matches. */
const numbersOf = (words: Set<string>): string => [...words].filter((w) => /\d/.test(w)).sort().join("|");

/** The handle of the one catalogue product that is clearly `productName`, or null when none is, or when more than one could be. */
export function uniqueCatalogueHandle(products: CatalogueProduct[], brand: string, productName: string): string | null {
  const want = stems(productName, brand);
  if (!want.size) return null;
  const candidates: { handle: string; shared: number }[] = [];
  for (const p of products) {
    const have = stems(p.title, brand);
    if (!have.size) continue;
    const shared = [...have].filter((w) => want.has(w)).length;
    if (shared < MIN_SHARED || shared / have.size < MIN_SHARE) continue;
    // A sample, set, shade or another form on one side only means a different product, whichever side names it: the catalogue's tester is not the shopper's
    // product, and the shopper's "tinted" is not the brand's plain one.
    if ([...have].some((w) => VARIANT_WORDS.has(w) && !want.has(w)) || [...want].some((w) => VARIANT_WORDS.has(w) && !have.has(w))) continue;
    if (numbersOf(have) !== numbersOf(want)) continue; // another SPF, strength or size
    candidates.push({ handle: p.handle, shared });
  }
  candidates.sort((a, b) => b.shared - a.shared);
  if (!candidates.length) return null;
  if (candidates.length > 1 && candidates[0].shared - candidates[1].shared < MIN_LEAD) return null;
  return candidates[0].handle;
}

const PAGE_SIZE = 250;
const MAX_PAGES = 3;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

/** The store's whole catalogue from its Shopify feed, or null when it has none or it could not be read in full (so "exactly one" can never be claimed on a part). */
export async function fetchShopifyCatalogue(pageUrl: string): Promise<CatalogueProduct[] | null> {
  let origin: string;
  try {
    const u = new URL(pageUrl);
    if (u.protocol !== "https:") return null;
    origin = u.origin;
  } catch { return null; }
  const all: CatalogueProduct[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const res = await fetch(`${origin}/products.json?limit=${PAGE_SIZE}&page=${page}`, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
      if (!res.ok) return null;
      const data = await res.json() as { products?: { title?: unknown; handle?: unknown }[] };
      if (!Array.isArray(data.products)) return null;
      for (const p of data.products) if (typeof p.title === "string" && typeof p.handle === "string") all.push({ title: p.title, handle: p.handle });
      if (data.products.length < PAGE_SIZE) return all;
    } catch { return null; }
  }
  return null; // still full after the last page we are willing to read
}

const handleOf = (pageUrl: string): string | null => {
  try { return /\/products\/([^/?#]+)/.exec(new URL(pageUrl).pathname)?.[1]?.toLowerCase() ?? null; } catch { return null; }
};

/** The page of the one product in the brand's catalogue that is clearly `productName`, found from any page of the brand's site, or null when the catalogue cannot be read
    in full, has no such product, or has more than one that could be it. For a product the brand names differently from the shopper or retailer, which no search for
    that name finds. */
export async function catalogueProductUrl(siteUrl: string, brand: string, productName: string, load: (url: string) => Promise<CatalogueProduct[] | null> = fetchShopifyCatalogue): Promise<string | null> {
  let origin: string;
  try { origin = new URL(siteUrl).origin; } catch { return null; }
  const products = await load(siteUrl);
  if (!products?.length) return null;
  const handle = uniqueCatalogueHandle(products, brand, productName);
  return handle ? `${origin}/products/${encodeURIComponent(handle)}` : null;
}

/** True when the brand's own catalogue has exactly one product that is clearly `productName` and `pageUrl` is that product's page. */
export async function catalogueConfirmsPage(pageUrl: string, brand: string, productName: string, load: (url: string) => Promise<CatalogueProduct[] | null> = fetchShopifyCatalogue): Promise<boolean> {
  const handle = handleOf(pageUrl);
  if (!handle) return false;
  const products = await load(pageUrl);
  if (!products?.length) return false;
  return uniqueCatalogueHandle(products, brand, productName)?.toLowerCase() === handle;
}
