/* Nykaa as an ingredient source, searched alongside INKEE Decoder and the brand's own site (owner decision, 2026-10-30).

   A Nykaa product page keeps its ingredient list behind a client-rendered "Ingredients" tab. A plain fetch is refused (403) and the Jina reader
   gets the tab's heading but not its text, so the page is rendered (src/lib/scrape.ts `fetchRenderedPage`), the tab is opened, and this file reads
   the opened panel. Only the panel is read, and only as a list: the general extractor in inci-from-page.ts is built for brand pages and, fed this
   text, drops the first entry and stops at the first stray character in a retailer's typo, which would publish a partial list as the whole one.
   Nothing here writes an ingredient the page does not print. */

import { fetchRenderedPage, type RenderAction } from "./scrape";
import { sanitizeInciList } from "./product-identity";
import type { PageINCI } from "./inci-from-page";

/** A Nykaa product page: https, nykaa.com, /p/<id>. Not its reviews, brand or category pages, which search results also carry. */
export function isNykaaProductUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" || u.username || u.password || u.port) return false;
    return /^(?:www\.)?nykaa\.com$/i.test(u.hostname) && /\/p\/\d+\/?$/.test(u.pathname);
  } catch { return false; }
}

/** The page without its tracking query, which is also how it is recorded as the source. */
export const nykaaProductUrl = (raw: string): string => { const u = new URL(raw); return `${u.origin}${u.pathname}`; };

/** Open "Product Details", then its "Ingredients" tab. Each script is its own function so two of them can run in the same page. */
const clickLeaf = (label: string): RenderAction => ({
  type: "executeJavascript",
  script: `(function(){var els=[].slice.call(document.querySelectorAll('*')).filter(function(e){return e.children.length===0&&/^\\s*${label}\\s*$/i.test(e.textContent)});if(els[0]){els[0].scrollIntoView({block:'center'});els[0].click();}return els.length;})()`,
});
export const NYKAA_TAB_ACTIONS: RenderAction[] = [
  { type: "wait", milliseconds: 2500 }, clickLeaf("Product Details"), { type: "wait", milliseconds: 1800 }, clickLeaf("Ingredients"), { type: "wait", milliseconds: 1800 },
];

/** How long the renderer may take for a Nykaa page. It normally needs 13 to 15 s; the lookup caps the whole read at 30 s. */
export const NYKAA_RENDER_MS = 25_000;

const TAB_HEADING = /^###\s*(?:Description|Ingredients|How To Use)\s*$/i;
const PANEL_END = /^(?:##\s|Read More)/i;
const LABEL = /full\s+ingredients?\s+list\s*:?\s*/i;

/** Markdown escapes and emphasis that the renderer adds around plain text. */
const plain = (t: string): string => t.replace(/\\([|*_[\]()#>~`-])/g, "$1").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

/** The ingredient list in the opened "Ingredients" panel of a rendered Nykaa page, with the text it was read from, or null.
    The panel follows the three tab headings. It is either the list alone or, for some brands, a "Key Ingredients" blurb and then "Full Ingredient List:".
    When the tab did not open, the panel is the product description: prose, which does not pass as a list. */
export function extractNykaaInci(markdown: string): { ingredients: string[]; quote: string } | null {
  const lines = markdown.split("\n");
  const at = lines.findIndex((l) => /^###\s*Ingredients\s*$/i.test(l.trim()));
  if (at < 0) return null;
  let i = at + 1;
  while (i < lines.length && (!lines[i].trim() || TAB_HEADING.test(lines[i].trim()))) i++;
  const panel: string[] = [];
  for (; i < lines.length && !PANEL_END.test(lines[i].trim()) && panel.join("\n").length < 6000; i++) panel.push(lines[i]);
  const text = panel.join("\n");
  const labelled = LABEL.exec(text);
  const body = plain(labelled ? text.slice(labelled.index + labelled[0].length).split(/\n\s*\n/)[0] : text.split(/\n\s*\n/)[0]);
  if (!body.includes(",")) return null;
  const quote = body.replace(/\.$/, "").trim();
  const raw = quote.split(",").map((t) => t.trim()).filter(Boolean);
  const checked = sanitizeInciList(raw);
  // A list is short items, not sentences: prose that happens to contain commas (the description) is refused.
  const proseLike = raw.filter((t) => t.split(/\s+/).length > 9).length > raw.length * 0.1;
  if (!checked.ok || proseLike || checked.list.length < 5) return null;
  return { ingredients: raw, quote };
}

/** The title Nykaa gives the page ("Buy X Online"), as the product's name, and the page's first heading. */
function pageTitles(markdown: string, title: string | null): string[] {
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  const tidy = (t: string) => plain(t).replace(/^buy\s+/i, "").replace(/\s+online.*$/i, "").replace(/\s*\(\s*\d+\s*(?:g|gm|ml)\s*\)\s*$/i, "").trim();
  return [...new Set([title, heading].map((t) => (t ? tidy(t) : "")).filter(Boolean))];
}

/** Read a Nykaa product page's ingredient list: rendered, the tab opened, the panel read. Null when the page cannot be rendered or holds no list. */
export async function readNykaaPage(url: string): Promise<PageINCI | null> {
  if (!isNykaaProductUrl(url)) return null;
  const source = nykaaProductUrl(url);
  const page = await fetchRenderedPage(source, NYKAA_TAB_ACTIONS, NYKAA_RENDER_MS);
  if (!page) return null;
  const found = extractNykaaInci(page.markdown);
  if (!found) return null;
  return { ingredients: found.ingredients, source, quote: found.quote, pageTitles: pageTitles(page.markdown, page.title), siteName: "Nykaa", trust: 3, origin: "nykaa" };
}

/** Firecrawl search for the product's Nykaa page. URLs only (one credit); Nykaa's own product pages are kept, so a reviews or category page is not read. */
export async function searchNykaaPages(query: string): Promise<string[]> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ query: `${query} nykaa`, limit: 6 }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { data?: { url?: string }[] };
    return [...new Set((data.data ?? []).flatMap((x) => (x.url && isNykaaProductUrl(x.url) ? [nykaaProductUrl(x.url)] : [])))];
  } catch { return []; }
}
