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

/** The retailer's name for any address on its site ("amazon.in" is "Amazon"), product page or not; null for another site. */
export function retailerNameForHost(host: string): string | null {
  const h = host.toLowerCase();
  return RETAILERS.find((r) => r.host.test(h))?.name ?? null;
}

/** The product's name as a retailer's product-page address spells it, in words, or null when the address carries none (an Amazon /dp/<ASIN> link alone).
    Each retailer puts it in its own place: Myntra's address is /<category>/<brand>/<name>/<id>/buy, so the first long segment is the category, not the product;
    1mg and Tira end the name with their own number ("-otc867982", "-8850340"). */
export function retailerProductSlug(raw: string): string | null {
  const retailer = retailerFor(raw);
  if (!retailer) return null;
  const segs = new URL(raw).pathname.split("/").filter(Boolean).map((s) => decodeURIComponent(s));
  let slug: string | undefined;
  switch (retailer.name) {
    case "Amazon": { const at = segs.findIndex((s) => /^(?:dp|gp)$/i.test(s)); slug = at > 0 ? segs[at - 1] : undefined; break; }
    case "Flipkart": case "Meesho": slug = segs[segs.indexOf("p") - 1]; break;
    case "Myntra": { const id = segs.findIndex((s) => /^\d+$/.test(s)); slug = id > 0 ? segs[id - 1] : undefined; break; }
    case "FOY": slug = segs[1]; break;
    case "1mg": slug = segs[1]?.replace(/-otc\d+$/i, ""); break;
    case "Tira": slug = segs[1]?.replace(/-\d+$/, ""); break;
    default: slug = segs.at(-1);
  }
  const name = (slug ?? "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return (name.toLowerCase().match(/[a-z]{2,}/g) ?? []).length >= 2 ? name : null;
}
