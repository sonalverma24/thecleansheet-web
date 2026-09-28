import type { Metadata } from "next";

/* ────────────────────────────────────────────────────────────────
   SEO foundation. Single source of truth for the site origin and the
   robots presets used by non-public pages.

   RULES (also in SEO.md):
   1. There is NO global canonical in the root layout. Every indexable page
      declares its own self-referencing `alternates.canonical`.
   2. A page that must stay out of the index exports `robots: NOINDEX`
      (never a robots.txt Disallow alone: Google cannot see noindex on a
      blocked URL and may index it URL-only).
   3. A URL only belongs in the sitemap if it returns 200, is indexable and
      is its own canonical (see src/lib/sitemap-data.ts).
──────────────────────────────────────────────────────────────── */

export const SITE_URL = "https://thecleansheet.in";

/** Absolute URL for a site path. "/" and "" both resolve to the bare origin. */
export function absoluteUrl(path = "/"): string {
  return path === "/" || path === "" ? SITE_URL : `${SITE_URL}${path}`;
}

/** Keep the page out of search results but let crawlers follow its links. */
export const NOINDEX: NonNullable<Metadata["robots"]> = { index: false, follow: true };

/** Keep the page out of search results and do not follow its links. */
export const NOINDEX_NOFOLLOW: NonNullable<Metadata["robots"]> = { index: false, follow: false };

/** Convenience for `alternates` on a self-canonical page. */
export function selfCanonical(path: string): NonNullable<Metadata["alternates"]> {
  return { canonical: absoluteUrl(path) };
}

/** Google shows roughly 155-160 characters of a meta description. For descriptions
    built from templates and data (brand, product, ingredient, review pages), clip at
    a sentence end when one falls late enough, else at a word boundary, so the snippet
    never ends mid-word. Hand-written descriptions should simply be written short. */
export function clipDescription(text: string, max = 158): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sentenceEnd = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  if (sentenceEnd >= max * 0.6) return cut.slice(0, sentenceEnd + 1);
  const space = cut.lastIndexOf(" ");
  return `${cut.slice(0, space > 0 ? space : cut.length).replace(/[,;:.\s]+$/, "")}…`;
}
