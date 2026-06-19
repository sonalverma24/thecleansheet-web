import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// One-time bootstrap: grants admin role to emails listed in ADMIN_EMAILS env var.
// Call once after migration: POST /api/admin/set-admin
// Protected by a secret token to prevent misuse.

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}));
  const expected   = process.env.ADMIN_BOOTSTRAP_TOKEN;

  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const emails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(e => e.trim())
    .filter(Boolean);

  const results: { email: string; status: string }[] = [];

  for (const email of emails) {
    // Find user by email in auth.users via admin API
    const { data: { users }, error: listErr } = await adminClient.auth.admin.listUsers();
    if (listErr) { results.push({ email, status: `list error: ${listErr.message}` }); continue; }

    const user = users.find(u => u.email === email);
    if (!user) { results.push({ email, status: "user not found - must sign in first" }); continue; }

    const { error: upsertErr } = await adminClient
      .from("profiles")
      .upsert({ id: user.id, role: "admin" }, { onConflict: "id" });

    results.push({ email, status: upsertErr ? `error: ${upsertErr.message}` : "admin role granted" });
  }

  return NextResponse.json({ success: true, results });
}
