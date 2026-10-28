/** Deterministic fallback for retailer/name inputs. Search discovers pages;
 * only a matching product page on a recognisable brand domain supplies INCI. */
import { fetchInciFromProductPage, type PageINCI } from "./inci-from-page";
import { fetchPageMarkdown } from "./scrape";
import { titleIdentifiesProduct, sanitizeInciList } from "./product-identity";

const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const SUFFIXES = new Set(["", "life", "beauty", "skincare", "skin", "cosmetics", "care", "naturals", "india", "official", "labs", "science", "wellness"]);

/** Conservative discovery filter: unknown domain spellings stay unverified. */
export function isBrandIngredientUrl(raw: string, brand: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" || u.username || u.password || u.port || u.hostname.endsWith(".local")) return false;
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    const labels = host.split(".");
    if (!(labels.length === 2 || (labels.length === 3 && labels[1] === "co" && labels[2] === "in")) || /^\d+(\.\d+)*$/.test(host)) return false;
    const domain = compact(labels[0]);
    const b = compact(brand);
    return b.length >= 3 && domain.startsWith(b) && SUFFIXES.has(domain.slice(b.length)) && u.pathname !== "/";
  } catch { return false; }
}

async function searchBrandPages(query: string): Promise<string[]> {
  const key = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_CX;
  if (key && cx) {
    try {
      const params = new URLSearchParams({ key, cx, q: `${query} official ingredients`, num: "5" });
      const res = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`, { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        const data = await res.json() as { items?: { link?: string }[] };
        const links = (data.items ?? []).flatMap((x) => x.link ? [x.link] : []);
        if (links.length) return links;
      }
    } catch { /* Try the public search reader next. */ }
  }
  const page = await fetchPageMarkdown(`https://www.google.com/search?q=${encodeURIComponent(`${query} official ingredients`)}`, 20000);
  return [...(page ?? "").matchAll(/\]\((https:\/\/[^\s)]+)\)/g)].map((m) => m[1]);
}

interface Dependencies {
  search: (query: string) => Promise<string[]>;
  read: (url: string) => Promise<PageINCI | null>;
}

export async function findBrandInci(query: string, brand: string, suppliedUrl?: string,
  deps: Dependencies = { search: searchBrandPages, read: fetchInciFromProductPage }): Promise<PageINCI | null> {
  let discovered: string[] = [];
  try { discovered = await deps.search(query); } catch { /* No source is safer than a failed analysis. */ }
  const urls = [...new Set([...(suppliedUrl ? [suppliedUrl] : []), ...discovered])]
    .filter((url) => isBrandIngredientUrl(url, brand)).slice(0, 3);
  for (const url of urls) {
    const page = await deps.read(url);
    if (!page?.quote?.trim() || !page.pageTitles?.some((title) => titleIdentifiesProduct(title, brand, query))) continue;
    if (!sanitizeInciList(page.ingredients).ok) continue;
    return page;
  }
  return null;
}
