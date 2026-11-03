import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchTileSource, processTile } from "@/lib/tile-processing";

/* GET /api/tile/<slug>?v=<fingerprint>: the product tile picture for a stored analysis, cleaned up (src/lib/tile-image.ts says why).

   The picture's address comes from the analysis's own row, never from the request, so this cannot be asked to fetch an address of the caller's choosing. `v` only changes the
   address of the cached copy when the product's picture changes, so the copy can be kept for a year. When the picture cannot be fetched or read, the browser is sent to the
   original address instead (cached for five minutes), so a tile is never blank because of this route. */

export const runtime = "nodejs";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,200}$/;
const KEEP = "public, max-age=31536000, s-maxage=31536000, immutable";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SLUG_RE.test(slug)) return new NextResponse(null, { status: 404 });

  let source: string | null = null;
  try {
    const { data } = await createAdminClient().from("product_reviews").select("image_url").eq("product_slug", slug).maybeSingle();
    source = (data?.image_url as string | null) ?? null;
  } catch { /* no row, or the database is unreachable: handled below */ }
  if (!source) return new NextResponse(null, { status: 404, headers: { "Cache-Control": "public, max-age=60" } });

  const bytes = await fetchTileSource(source);
  if (bytes) {
    try {
      const tile = await processTile(bytes);
      return new NextResponse(new Uint8Array(tile), { status: 200, headers: { "Content-Type": "image/webp", "Cache-Control": KEEP } });
    } catch { /* not a picture we can read: fall through to the original */ }
  }
  return NextResponse.redirect(source, { status: 302, headers: { "Cache-Control": "public, max-age=300" } });
}
