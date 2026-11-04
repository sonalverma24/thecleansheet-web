/* Admin-only: change the site's wording (public.site_copy). Gated to ADMIN_EMAILS.
     GET                         → every edited line
     POST { key, value }         → save the new wording for one line
     POST { key, reset: true }   → remove the edit, so the wording in the code shows again
   Saving refreshes the cached wording and every page, so the change is live straight away. */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { COPY_KEY_RE, SITE_COPY_TAG, copyEditProblem } from "@/lib/site-copy";

export const dynamic = "force-dynamic";

function refresh() {
  revalidateTag(SITE_COPY_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: auth.status });
  const { data, error } = await createAdminClient()
    .from("site_copy").select("key, value, updated_by, updated_at").order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: auth.status });

  const body = (await req.json().catch(() => ({}))) as { key?: unknown; value?: unknown; reset?: unknown };
  const db = createAdminClient();

  if (body.reset === true) {
    if (typeof body.key !== "string" || !COPY_KEY_RE.test(body.key)) {
      return NextResponse.json({ error: "invalid key" }, { status: 400 });
    }
    const { error } = await db.from("site_copy").delete().eq("key", body.key);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    refresh();
    return NextResponse.json({ ok: true, key: body.key, reset: true });
  }

  const problem = copyEditProblem(body.key, body.value);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  const key = body.key as string;
  const value = body.value as string;

  const { error } = await db.from("site_copy")
    .upsert({ key, value, updated_by: auth.email, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  refresh();
  return NextResponse.json({ ok: true, key, value });
}
