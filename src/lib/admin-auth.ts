import { createClient } from "@/lib/supabase/server";

/** True when `email` is on the ADMIN_EMAILS allowlist (comma-separated, case-insensitive). */
export function isAdminEmail(
  email: string | null | undefined,
  allowlist: string | undefined = process.env.ADMIN_EMAILS,
): boolean {
  if (!email) return false;
  const admins = (allowlist ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return admins.includes(email.toLowerCase());
}

/** For server routes: the signed-in admin, or the HTTP status to refuse with. */
export async function requireAdmin(): Promise<{ ok: true; email: string } | { ok: false; status: 401 | 403 }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, status: 401 };
  if (!isAdminEmail(user.email)) return { ok: false, status: 403 };
  return { ok: true, email: user.email };
}
