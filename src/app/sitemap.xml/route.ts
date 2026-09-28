import { renderSitemapIndex } from "@/lib/sitemap-data";

// Sitemap index: /sitemap.xml -> /sitemaps/{pages,editorial,brands,reviews,ingredients}.xml
// Regenerates hourly so newly published reviews appear without a redeploy.
export const revalidate = 3600;

export async function GET() {
  return new Response(await renderSitemapIndex(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
