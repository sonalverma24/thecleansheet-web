/* ────────────────────────────────────────────────────────────────
   Sitemap data, split into sections behind a sitemap index so Search
   Console reports indexing coverage per page type (reviews vs
   ingredients vs brand pages ...), which is how you find out WHICH
   kind of page Google is choosing not to index.

   ADMISSION RULE: a URL is listed only if it returns 200, is indexable
   and is its own canonical. No redirects, no noindex pages, no
   duplicates. lastmod is emitted only when we have a real date; a
   made-up "now" teaches Google to ignore lastmod for the whole site.

   To add a public page: add it to PAGES below (and give it a
   self-canonical). To add a new dynamic page type: add a section.
──────────────────────────────────────────────────────────────── */

import { SITE_URL, absoluteUrl } from "@/lib/seo";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { getAllGuideSlugs } from "@/lib/skin-guides";
import { toSlug } from "@/lib/ingredient-utils";
import { getDirectoryIngredients, isPlaceholderIngredient } from "@/lib/ingredient-directory";
import { getAllBrandSummaries, getBrandBySlug } from "@/data/brands";
import { listReviewIndex } from "@/lib/product-review-engine";
import { cataloguePathFor } from "@/lib/catalogue-dedupe";

export const SITEMAP_SECTIONS = ["pages", "editorial", "brands", "reviews", "ingredients"] as const;
export type SitemapSection = (typeof SITEMAP_SECTIONS)[number];

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
}

/** Real, indexable, non-redirecting top-level pages. (Legacy /analyzer,
    /certified, /certification, /consumers and /methodology 308 to the pages
    below and must NOT be listed.) */
const PAGES = [
  "/", "/review", "/brands", "/ingredients", "/standard", "/standard/claims",
  "/standard/register", "/verify", "/education", "/learn", "/courses",
  "/for-brands", "/spf", "/sunscreens", "/sunscreens/minimalist-multi-vitamin-spf-50",
  "/blog", "/about", "/contact",
  "/disclaimer", "/privacy-policy", "/terms-of-use",
];

function validDate(input: string | undefined): Date | undefined {
  if (!input) return undefined;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function newest(dates: (Date | undefined)[]): Date | undefined {
  const ds = dates.filter((d): d is Date => !!d);
  return ds.length ? new Date(Math.max(...ds.map((d) => d.getTime()))) : undefined;
}

export async function getSitemapEntries(section: SitemapSection): Promise<SitemapEntry[]> {
  switch (section) {
    case "pages":
      return PAGES.map((p) => ({ url: absoluteUrl(p) }));

    case "editorial":
      return [
        ...BLOG_POSTS.map((p) => ({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: validDate(p.date) })),
        ...getAllGuideSlugs().map((slug) => ({ url: absoluteUrl(`/learn/guides/${slug}`) })),
      ];

    case "brands": {
      const entries: SitemapEntry[] = [];
      for (const b of getAllBrandSummaries()) {
        const products = getBrandBySlug(b.slug)?.products ?? [];
        const productDates = products.map((p) => validDate(p.analyzedAt));
        entries.push({ url: absoluteUrl(`/brands/${b.slug}`), lastModified: newest(productDates) });
        for (const [i, p] of products.entries()) {
          entries.push({ url: absoluteUrl(`/brands/${b.slug}/${p.slug}`), lastModified: productDates[i] });
        }
      }
      return entries;
    }

    case "reviews":
      // Reviews of products that also have a catalogue page canonicalise to that
      // page, so they are not their own canonical and must not be listed.
      return (await listReviewIndex())
        .filter((r) => !cataloguePathFor(r.brand, r.productName))
        .map((r) => ({ url: absoluteUrl(`/reviews/${r.slug}`), lastModified: validDate(r.reviewedAt) }));

    case "ingredients": {
      // Every indexable profile: the curated core plus discovered ingredients that
      // have been enriched. Stubs ("Profile being compiled") are noindex and left
      // out. ingredients.json repeats some INCI rows, so list each slug once.
      const seen = new Map<string, Date | undefined>();
      for (const i of await getDirectoryIngredients()) {
        if (isPlaceholderIngredient(i)) continue;
        const slug = toSlug(i.INCI_Name);
        if (slug && !seen.has(slug)) seen.set(slug, validDate(i.Last_Updated));
      }
      return [...seen].map(([slug, lastModified]) => ({ url: absoluteUrl(`/ingredients/${slug}`), lastModified }));
    }
  }
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const iso = (d?: Date) => (d ? `\n    <lastmod>${d.toISOString()}</lastmod>` : "");

export function renderUrlset(entries: SitemapEntry[]): string {
  const body = entries.map((e) => `  <url>\n    <loc>${esc(e.url)}</loc>${iso(e.lastModified)}\n  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export async function renderSitemapIndex(): Promise<string> {
  const rows = await Promise.all(
    SITEMAP_SECTIONS.map(async (section) => {
      const entries = await getSitemapEntries(section);
      return { section, lastModified: newest(entries.map((e) => e.lastModified)) };
    }),
  );
  const body = rows
    .map((r) => `  <sitemap>\n    <loc>${SITE_URL}/sitemaps/${r.section}.xml</loc>${iso(r.lastModified)}\n  </sitemap>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}
