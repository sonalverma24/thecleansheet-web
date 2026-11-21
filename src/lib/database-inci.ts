/* Ingredient databases as a source of a product's list (owner rule, 2026-11-21: "any ingredient database that has the ingredients must always be accepted. Like
   skinsort or skincarisma").

   INKEE Decoder has been a source from the start and keeps its own reader (inci-fetch.ts). The others below are read here: the product's page on the database,
   read by code, with the quote captured, and recorded as `origin: "database"` at capture trust 3, like a Nykaa list. A list from them is taken only when the
   brand's own page, Decoder and Nykaa give none that passes, and before any other retailer's page: the brand states what is in its product now, while a database
   copies it and can hold an older formula. Every check a list must pass still applies (the page's title names the brand and the product, the text is an
   ingredient list, the list is possible for this product), plus the share of entries our reference must recognise that retailer lists must pass, since a
   database page also carries other products' names. Nothing here writes an ingredient the page does not print. */

import { extractMarkdownTitles, readMarkdownList, type PageINCI } from "./inci-from-page";
import { fetchPageMarkdown, fetchRenderedPage } from "./scrape";
import { retailerListLooksLikeInci } from "./retailer-inci";
import { databaseFor, databaseProductUrl, isDatabaseProductUrl } from "./database-pages";

export { databaseNameForHost, isDatabaseProductUrl, databaseProductUrl } from "./database-pages";

/** Markdown links and images as the plain names they show. SkinSort prints its list as links ("[Propanediol](…/propanediol), [Niacinamide](…)"), which the
    list reader would otherwise read as addresses. */
export const unlinkMarkdown = (md: string): string => md.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");

/** The list on a database page read as markdown, or null when it holds none, or one our reference does not recognise as ingredients. */
export function readDatabaseMarkdown(markdown: string, url: string, siteName: string): PageINCI | null {
  const md = unlinkMarkdown(markdown);
  const ex = readMarkdownList(md);
  if (!ex || !retailerListLooksLikeInci(ex.ingredients)) return null;
  return { ingredients: ex.ingredients, source: url, quote: ex.quote, pageTitles: extractMarkdownTitles(md), siteName, trust: 3, origin: "database" };
}

export interface DatabaseReadDeps {
  read: (url: string) => Promise<string | null>;
  /** A rendered read (paid), tried only when the plain read found no list and `mayRender` allows it (Skincarisma resets a plain reader's connection). */
  readRendered?: (url: string) => Promise<string | null>;
}

const defaultDeps: DatabaseReadDeps = {
  read: (url) => fetchPageMarkdown(url),
  readRendered: async (url) => (await fetchRenderedPage(url, [], 20_000))?.markdown ?? null,
};

/** Read a database product page's list: the plain read first (free), then, when allowed, the page rendered in a browser. Null for an address that is not a
    database product page. */
export async function readDatabasePage(raw: string, mayRender = true, deps: DatabaseReadDeps = defaultDeps): Promise<PageINCI | null> {
  const db = databaseFor(raw);
  if (!db) return null;
  const url = databaseProductUrl(raw);
  const plain = await deps.read(url).catch(() => null);
  const fromPlain = plain ? readDatabaseMarkdown(plain, url, db.name) : null;
  if (fromPlain || !mayRender || !deps.readRendered) return fromPlain;
  const rendered = await deps.readRendered(url).catch(() => null);
  return rendered ? readDatabaseMarkdown(rendered, url, db.name) : null;
}

/** Database product pages for the query, from one Firecrawl web search (one credit). Empty when the key is unset or the call fails. */
export async function searchDatabasePages(query: string): Promise<string[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ query: `${query} ingredients skinsort OR skincarisma OR cosdna`, limit: 10 }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { data?: { url?: string }[] };
    return [...new Set((data.data ?? []).flatMap((x) => (x.url && isDatabaseProductUrl(x.url) ? [databaseProductUrl(x.url)] : [])))];
  } catch { return []; }
}
