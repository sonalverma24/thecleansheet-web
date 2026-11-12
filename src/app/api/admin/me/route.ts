/* Whether the signed-in visitor is an admin (ADMIN_EMAILS). The site calls this only when someone is signed in, to
   decide whether to show the "Edit text" button. */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  return NextResponse.json({ admin: auth.ok }, { headers: { "Cache-Control": "private, no-store" } });
}
