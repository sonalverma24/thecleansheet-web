import type { User } from "@supabase/supabase-js";

/* The name in the header greeting ("Hi, Sonal"): the first word of the Google
   profile name, else the part of the email before the @, else "there". */
export function greetingName(user: Pick<User, "email" | "user_metadata">): string {
  const meta = user.user_metadata ?? {};
  for (const v of [meta.given_name, meta.full_name, meta.name]) {
    const first = typeof v === "string" ? v.trim().split(/\s+/)[0] : "";
    if (first) return first;
  }
  return user.email?.split("@")[0]?.trim() || "there";
}
