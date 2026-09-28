import { SITEMAP_SECTIONS, getSitemapEntries, renderUrlset, type SitemapSection } from "@/lib/sitemap-data";

export const revalidate = 3600;
export const dynamicParams = false; // anything but the listed sections is a 404

export function generateStaticParams() {
  return SITEMAP_SECTIONS.map((s) => ({ section: `${s}.xml` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const name = section.replace(/\.xml$/, "") as SitemapSection;
  if (!SITEMAP_SECTIONS.includes(name)) return new Response("Not found", { status: 404 });
  return new Response(renderUrlset(await getSitemapEntries(name)), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
