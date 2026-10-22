import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@/lib/supabase/server";
import { findSkinGuide, isGoogleUser } from "@/lib/skin-guide-downloads";

/* The skin-type guide PDFs live in /private/guides, outside /public, so this route
   is the only way to get them. It serves the file only to someone signed in with
   Google: 401 when nobody is signed in, 403 when the sign-in is not Google. */

const GUIDES_DIR = path.join(process.cwd(), "private", "guides");

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Only the four known slugs map to a file, so no path ever comes from the request.
  const guide = findSkinGuide(slug);
  if (!guide) return Response.json({ error: "not_found" }, { status: 404 });

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return Response.json({ error: "signin_required" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  if (!isGoogleUser(data.user)) return Response.json({ error: "google_required" }, { status: 403, headers: { "Cache-Control": "private, no-store" } });

  let file: Buffer;
  try {
    file = await readFile(path.join(GUIDES_DIR, guide.pdf));
  } catch {
    return Response.json({ error: "unavailable" }, { status: 500 });
  }

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="The Clean Sheet - ${guide.label} Guide.pdf"`,
      "Content-Length": String(file.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}
