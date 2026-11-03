import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";

// First-time admin setup: writes profiles.role = 'admin' for the emails in the ADMIN_EMAILS env var.
//
// The caller must be signed in with an email that is itself on ADMIN_EMAILS (requireAdmin).
// The request carries no token and no email: the people who get the role are only ever the
// ones the server's own allowlist names, so a signed-in shopper, or a script holding anything
// that ships in the browser bundle, cannot make anyone an admin.
//
// profiles.role is the flag the admin screens read to decide what to show. What actually
// protects the admin APIs is the ADMIN_EMAILS check, not this column.

// auth.admin.listUsers returns one page (50 by default), and the site has more users than that,
// so page through until every listed email is found.
const PER_PAGE = 1000;
const MAX_PAGES = 50;

async function lookupUserIds(
  adminClient: ReturnType<typeof createAdminClient>,
  emails: string[],
): Promise<{ ids: Map<string, string>; error?: string }> {
  const wanted = new Set(emails.map(e => e.toLowerCase()));
  const ids = new Map<string, string>(); // lower-cased email -> auth user id
  for (let page = 1; page <= MAX_PAGES && ids.size < wanted.size; page++) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: PER_PAGE });
    if (error) return { ids, error: error.message };
    for (const u of data.users) {
      const email = u.email?.toLowerCase();
      if (email && wanted.has(email)) ids.set(email, u.id);
    }
    if (data.users.length < PER_PAGE) break;
  }
  return { ids };
}

export async function POST() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? "Unauthorized" : "Forbidden" }, { status: auth.status });
  }

  const adminClient = createAdminClient();

  const emails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(e => e.trim())
    .filter(Boolean);

  const results: { email: string; status: string }[] = [];

  // Find the users by email in auth.users via the admin API. The allowlist check is
  // case-insensitive, so this lookup is too.
  const { ids, error: listError } = await lookupUserIds(adminClient, emails);

  for (const email of emails) {
    const userId = ids.get(email.toLowerCase());
    if (!userId) {
      results.push({ email, status: listError ? `list error: ${listError}` : "user not found - must sign in first" });
      continue;
    }

    const { error: upsertErr } = await adminClient
      .from("profiles")
      .upsert({ id: userId, role: "admin" }, { onConflict: "id" });

    results.push({ email, status: upsertErr ? `error: ${upsertErr.message}` : "admin role granted" });
  }

  console.info(`[Admin Set-Admin] ${auth.email} ran the grant for ${emails.length} allowlisted email(s)`);
  return NextResponse.json({ success: true, results });
}
