/* Other retailers' product-page addresses (Amazon, Flipkart, Purplle, Tira, Myntra, Meesho, FOY, 1mg), with no fetching, so pages and copy can name a source.
   The reader that takes a list from these pages is src/lib/retailer-inci.ts. */

export interface Retailer { name: string; host: RegExp; product: RegExp }

/** Each retailer's product-page address. Search and category pages, reviews and brand stores are not product pages, and are never read for a list. */
const RETAILERS: readonly Retailer[] = [
  { name: "Amazon", host: /^(?:www\.)?amazon\.in$/i, product: /\/(?:dp|gp\/product)\/[A-Z0-9]{10}(?:[/?]|$)/i },
  { name: "Flipkart", host: /^(?:www\.)?flipkart\.com$/i, product: /\/p\/itm[a-z0-9]+\/?$/i },
  { name: "Purplle", host: /^(?:www\.)?purplle\.com$/i, product: /^\/product\/[a-z0-9-]+\/?$/i },
  { name: "Tira", host: /^(?:www\.)?tirabeauty\.com$/i, product: /^\/product\/[a-z0-9-]+\/?$/i },
  { name: "Myntra", host: /^(?:www\.)?myntra\.com$/i, product: /\/\d+\/buy\/?$/i },
  { name: "Meesho", host: /^(?:www\.)?meesho\.com$/i, product: /\/p\/[a-z0-9]+\/?$/i },
  { name: "FOY", host: /^(?:www\.)?foyforyou\.com$/i, product: /^\/p\/[a-z0-9-]+\/FOY\d+\/?$/i },
  { name: "1mg", host: /^(?:www\.)?1mg\.com$/i, product: /^\/otc\/[a-z0-9-]+\/?$/i },
];

export function retailerFor(raw: string): Retailer | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" || u.username || u.password || u.port) return null;
    return RETAILERS.find((r) => r.host.test(u.hostname) && r.product.test(u.pathname)) ?? null;
  } catch { return null; }
}

/** A product page on one of the retailers above. Nykaa is not here: it has its own reader (nykaa-inci.ts) and is a source in its own right. */
export const isRetailerProductUrl = (raw: string): boolean => retailerFor(raw) !== null;

/** The retailer's name for a product-page address ("Flipkart"), or null. */
export const retailerName = (raw: string): string | null => retailerFor(raw)?.name ?? null;

/** The page without its tracking query, which is also how it is recorded as the source. An Amazon page is kept to its /dp/<ASIN>, the part that names the product. */
export function retailerProductUrl(raw: string): string {
  const u = new URL(raw);
  if (/amazon\.in$/i.test(u.hostname)) {
    const asin = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i.exec(u.pathname)?.[1];
    if (asin) return `${u.origin}/dp/${asin.toUpperCase()}`;
  }
  return `${u.origin}${u.pathname}`;
}

/** Amazon's sponsored-result links ("/sspa/click?...&url=%2F<name>%2Fdp%2F<ASIN>...", "/gp/slredirect/...?url=...") wrap the product page in a click tracker.
 *  Pasted as is, the analysis took its product name from the tracker's path ("click") and searched for ingredients under that name: La Roche-Posay's
 *  UVMUNE400 fluid was saved with no list though Nykaa, INKEE Decoder and SkinSort all print one (2026-11-25). This returns the product page inside, with its
 *  name segment kept (the name is read from it) and the tracking dropped. Any other address comes back unchanged. */
export function unwrapAdRedirect(raw: string): string {
  try {
    const u = new URL(raw.trim());
    if (!/(^|\.)amazon\.[a-z.]+$/i.test(u.hostname) || !/^\/(?:sspa\/click|gp\/slredirect\/)/i.test(u.pathname)) return raw;
    const inner = u.searchParams.get("url");
    if (!inner || !inner.startsWith("/") || inner.startsWith("//")) return raw;
    const target = new URL(inner, u.origin);
    const product = /^(.*?\/(?:dp|gp\/product)\/[A-Z0-9]{10})/i.exec(target.pathname)?.[1];
    return product ? `${u.origin}${product}` : raw;
  } catch { return raw; }
}

/** The retailer's name for any address on its site ("amazon.in" is "Amazon"), product page or not; null for another site. */
export function retailerNameForHost(host: string): string | null {
  const h = host.toLowerCase();
  return RETAILERS.find((r) => r.host.test(h))?.name ?? null;
}
