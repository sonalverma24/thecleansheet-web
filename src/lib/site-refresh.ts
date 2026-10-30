import { revalidatePath } from "next/cache";

/* ────────────────────────────────────────────────────────────────
   NEW ANALYSIS · refresh every page that shows analyses

   Those pages are cached for five minutes. When an analysis is saved, the pages it changes are refreshed straight away, so a new product appears on all of
   them on the next visit instead of after the window:

     the home page            up to five products (the owner's picks, else the newest)
     /products and /brands    the list, its filters on the left, and the "products analysed" figure at the top; /brands is also the brand directory
     every brand page         the brand's products and its standing
     every ingredient page    "products containing this ingredient"
     the product's own page   a re-analysis replaces the old one
     the reviews sitemap      so search engines hear about it

   Dynamic pages are refreshed by pattern ("page"): the cache entries are marked stale and each is rebuilt on its next visit, so nothing here fetches
   anything or fans out to a thousand pages at once. A path that does not exist (/products before that page ships) is ignored by Next.
──────────────────────────────────────────────────────────────── */

export const REFRESH_PATHS = ["/", "/products", "/brands", "/sitemaps/reviews.xml"] as const;
export const REFRESH_PATTERNS = ["/brands/[brand]", "/ingredients/[slug]"] as const;

export type RefreshTarget = { path: string; type?: "page" };

export function targetsAfterNewAnalysis(productSlug: string): RefreshTarget[] {
  return [
    ...REFRESH_PATHS.map((path) => ({ path })),
    { path: `/analysis/${productSlug}` },
    ...REFRESH_PATTERNS.map((path) => ({ path, type: "page" as const })),
  ];
}

/** Best effort: saving an analysis must never fail, or wait, because a page could not be refreshed. */
export function refreshAfterNewAnalysis(productSlug: string): void {
  for (const { path, type } of targetsAfterNewAnalysis(productSlug)) {
    try {
      if (type) revalidatePath(path, type);
      else revalidatePath(path);
    } catch { /* the next five-minute refresh will catch it */ }
  }
}
