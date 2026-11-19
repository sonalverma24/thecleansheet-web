/* Retailer product pages as a LAST-RESORT ingredient source (owner decision, 2026-11-19: "Allow retailer lists").

   The brand's own page, INKEE Decoder and Nykaa stay the sources a list is taken from. Only when none of them gives a list that passes every check is a list
   printed on another retailer's product page (Amazon, Flipkart, Purplle, Tira, Myntra, Meesho, FOY, 1mg) used, so a product that publishes its list only on a
   marketplace is analysed instead of left Grey. The list is read by code from the page itself, with the quote captured, and must pass the same checks as every
   other source: the page's title names the brand and the product, the text is an ingredient list, and the list is possible for this product. It is recorded
   as `origin: "retailer"` with the page's address, so the analysis names the retailer it came from. Nothing here writes an ingredient the page does not print. */

import { fetchInciFromProductPage, fetchInciFromRenderedPage, type PageINCI } from "./inci-from-page";
import { lookupIngredient } from "./ingredient-db";
import { sanitizeInciList } from "./product-identity";
import { isRetailerProductUrl, retailerFor, retailerProductUrl } from "./retailer-pages";

export { isRetailerProductUrl, retailerName, retailerProductUrl } from "./retailer-pages";

/** The share of a retailer list's entries our ingredient reference must recognise. A retailer page carries other products' names, offers and highlights, which the
    page reader can take for a list: Aqueria's Amazon page once gave "Alpha Arbutin & Niacinamide Brightening Cream, Face & Neck Cream for Hyperpigmentation, Elbows..."
    (13% recognised). Measured on the 75 live lists, 2026-11-19: median 71%, all but one at or above 29%; the one below (Biotique Winter Cherry, 0%, Ayurvedic names)
    came from the brand's page, which this check does not apply to. A retailer list written only in such names is refused. */
export const RETAILER_MIN_RECOGNISED = 0.25;

/** Whether a list read from a retailer page is an ingredient list and not other text from the page. */
export function retailerListLooksLikeInci(ingredients: string[]): boolean {
  const list = sanitizeInciList(ingredients).list;
  if (list.length < 5) return false;
  return list.filter((x) => !!lookupIngredient(x)).length / list.length >= RETAILER_MIN_RECOGNISED;
}

export interface RetailerReadDeps {
  read: (url: string) => Promise<PageINCI | null>;
  /** A rendered read (paid), tried only when the plain read found no list and `mayRender` allows it. */
  readRendered?: (url: string) => Promise<PageINCI | null>;
}

/** Read a retailer product page's ingredient list: the plain read first (free), then, when allowed, the page rendered in a browser with its Ingredients tab opened
    (Flipkart, Myntra and Meesho send a plain reader an empty page). The list is recorded at capture trust 3, like a Nykaa list: it is read by code from the page with
    its quote (owner decision for Nykaa, 2026-10-30, extended to these retailers 2026-11-19). Null for an address that is not a retailer product page. */
export async function readRetailerPage(raw: string, mayRender = true, deps: RetailerReadDeps = { read: fetchInciFromProductPage, readRendered: (u) => fetchInciFromRenderedPage(u) }): Promise<PageINCI | null> {
  const retailer = retailerFor(raw);
  if (!retailer) return null;
  const url = retailerProductUrl(raw);
  const usable = (p: PageINCI | null): p is PageINCI => !!p && retailerListLooksLikeInci(p.ingredients);
  const plain = await deps.read(url).catch(() => null);
  const page = usable(plain) ? plain : mayRender && deps.readRendered ? await deps.readRendered(url).catch(() => null) : null;
  if (!usable(page)) return null;
  return { ...page, ingredients: withoutLeadIn(page.ingredients), source: url, siteName: page.siteName ?? retailer.name, trust: 3, origin: "retailer" };
}

/** A retailer's lead-in glued to the first entry is not part of its name: FOY prints "Made with Aqua, Dimethyl Isosorbide, ..." (2026-11-19), and "Made with Aqua"
    would otherwise be dropped as not an ingredient, losing Aqua. Only the first entry, and only these words. */
export function withoutLeadIn(ingredients: string[]): string[] {
  if (!ingredients.length) return ingredients;
  const first = ingredients[0].replace(/^\s*(?:made\s+with|contains|ingredients?)\s*:?\s+/i, "").trim();
  return first ? [first, ...ingredients.slice(1)] : ingredients.slice(1);
}

/** Retailer product pages for the query, from one Firecrawl web search (one credit). Empty when the key is unset or the call fails. */
export async function searchRetailerPages(query: string): Promise<string[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ query: `${query} ingredients buy online`, limit: 10 }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { data?: { url?: string }[] };
    return [...new Set((data.data ?? []).flatMap((x) => (x.url && isRetailerProductUrl(x.url) ? [retailerProductUrl(x.url)] : [])))];
  } catch { return []; }
}
