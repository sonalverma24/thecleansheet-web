/* The page a shopper pasted, read so the analyser sees the product and not a block page (2026-11-19).

   The free reader (Jina) is sent a block or error page by several retailers: Amazon "Amazon.in", Flipkart its home page, Myntra "Site Maintenance", Meesho "Access
   Denied", 1mg an empty page (measured 2026-11-19). Taken as the product page, such a title became the product's name and its text was given to the model. Here a
   page that looks blocked is read once more in a browser (Firecrawl, one credit), which opened all five in 1 to 7 s that day; if that is blocked too, there is no
   page, and the analyser falls back on the product's name in the address, as it already did when the reader failed. */

import { fetchPageMarkdown, fetchRenderedPage, type RenderedPage } from "./scrape";
import { retailerProductSlug } from "./retailer-pages";

/** Titles that name a block, error or store-front page, never a product. */
const BLOCK_TITLE = new RegExp(
  "^(?:" + [
    "access denied", "site maintenance", "robot check", "are you a robot", "captcha", "just a moment", "attention required", "verify you are human",
    "page not found", "404\\b", "403\\b", "forbidden", "something went wrong", "oops", "error\\b", "sorry\\b", "service unavailable", "too many requests",
    "online shopping india", "online shopping site", "amazon\\.in$", "amazon\\.in:\\s*online shopping", "flipkart\\.com$", "myntra$", "meesho$", "tira$", "1mg$",
  ].join("|") + ")",
  "i",
);
/** Fewer characters than this is not a product page: 1mg's empty page was 354. The longer block pages (to 789) are told by their titles, so a small real page is kept. */
const MIN_PAGE_CHARS = 400;
const STOP = new Set(["the", "and", "for", "with", "buy", "online", "best", "price", "india", "pack", "set", "free", "new"]);
const words = (t: string): Set<string> => new Set((t.normalize("NFKC").toLowerCase().match(/[a-z]{3,}/g) ?? []).filter((w) => !STOP.has(w)));

/** The page's own title, from a reader's "Title:" line. */
const rawTitle = (markdown: string): string => /^Title:\s*(.+)$/m.exec(markdown)?.[1]?.trim() ?? "";

/** Whether a page read for `url` is a block, error or home page instead of the product. A retailer product page must also share a word with the product name in
    its own address, which a store's home page or a "something went wrong" page does not. */
export function looksBlocked(markdown: string, title: string, url: string): boolean {
  if (markdown.trim().length < MIN_PAGE_CHARS) return true;
  const t = title.normalize("NFKC").trim();
  if (t && BLOCK_TITLE.test(t)) return true;
  const slug = retailerProductSlug(url);
  if (slug) {
    const want = words(slug);
    if (want.size >= 2 && ![...words(t)].some((w) => want.has(w))) return true;
  }
  return false;
}

export interface ProductPageDeps {
  plain: (url: string) => Promise<string | null>;
  rendered: (url: string) => Promise<RenderedPage | null>;
}

/** The pasted page as markdown with a "Title:" line (the reader's format, which the engine reads), or null when every read was blocked or failed. `via` says how it
    was read, for the research log. */
export async function fetchProductPage(url: string, deps: ProductPageDeps = { plain: (u) => fetchPageMarkdown(u), rendered: (u) => fetchRenderedPage(u) }): Promise<{ markdown: string; via: "reader" | "rendered" } | null> {
  const plain = await deps.plain(url).catch(() => null);
  if (plain && !looksBlocked(plain, rawTitle(plain), url)) return { markdown: plain, via: "reader" };
  const page = await deps.rendered(url).catch(() => null);
  if (!page) return null;
  const title = (page.title ?? "").trim();
  const markdown = `Title: ${title}\n\n${page.markdown}`;
  return looksBlocked(page.markdown, title, url) ? null : { markdown, via: "rendered" };
}
