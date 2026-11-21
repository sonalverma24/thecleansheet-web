/* Ingredient databases' product-page addresses (SkinSort, Skincarisma, CosDNA, INCI Beauty, EWG Skin Deep, Cosmily), with no fetching, so pages and copy can name
   a source. The reader that takes a list from these pages is src/lib/database-inci.ts. INKEE Decoder is not here: it has its own reader (inci-fetch.ts). */

export interface IngredientDatabase { name: string; host: RegExp; product: RegExp }

/** Each database's product-page address. Comparison, category, brand and ingredient pages are not a product's page, and are never read for a list. */
const DATABASES: readonly IngredientDatabase[] = [
  { name: "SkinSort", host: /^(?:www\.)?skinsort\.com$/i, product: /^\/products\/[a-z0-9-]+\/[a-z0-9-]+\/?$/i },
  { name: "Skincarisma", host: /^(?:www\.)?skincarisma\.com$/i, product: /^\/products\/[a-z0-9-]+\/[a-z0-9-]+\/?$/i },
  { name: "CosDNA", host: /^(?:www\.)?cosdna\.com$/i, product: /^\/[a-z]{3}\/cosmetic_[a-z0-9]+\.html$/i },
  { name: "INCI Beauty", host: /^(?:www\.)?incibeauty\.com$/i, product: /^\/(?:[a-z]{2}\/)?(?:produit|product)\/[a-z0-9-]+\/?$/i },
  { name: "EWG Skin Deep", host: /^(?:www\.)?ewg\.org$/i, product: /^\/skindeep\/products\/\d+-[a-z0-9_-]+\/?$/i },
  { name: "Cosmily", host: /^(?:www\.)?cosmily\.com$/i, product: /^\/product\/[a-z0-9-]+\/?$/i },
];

export function databaseFor(raw: string): IngredientDatabase | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" || u.username || u.password || u.port) return null;
    return DATABASES.find((d) => d.host.test(u.hostname) && d.product.test(u.pathname)) ?? null;
  } catch { return null; }
}

/** A product's page on one of the ingredient databases above. */
export const isDatabaseProductUrl = (raw: string): boolean => databaseFor(raw) !== null;

/** The database's name for any address on its site ("skinsort.com" is "SkinSort"), product page or not; null for another site. */
export function databaseNameForHost(host: string): string | null {
  const h = host.toLowerCase();
  return DATABASES.find((d) => d.host.test(h))?.name ?? null;
}

/** The page without its query or fragment, which is also how it is recorded as the source. */
export function databaseProductUrl(raw: string): string {
  const u = new URL(raw);
  return `${u.origin}${u.pathname}`;
}
