/* Site wording an admin has edited on the live site.

   Every editable line is wrapped in <T k="some.key">wording in the code</T>. When public.site_copy has a row for
   that key, the row's text shows instead; with no row (or when the table cannot be read) the code's wording shows.
   A failed read never breaks a page: it only means the original wording shows. */

import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

export type SiteCopy = Record<string, string>;

export const SITE_COPY_TAG = "site-copy";
export const COPY_KEY_RE = /^[a-z0-9][a-z0-9._-]{0,119}$/;
export const COPY_MAX_LENGTH = 5000;

async function readSiteCopy(): Promise<SiteCopy> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return {};
  try {
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await db.from("site_copy").select("key, value").limit(5000);
    if (error || !data) return {};
    return Object.fromEntries(data.map((r) => [r.key as string, r.value as string]));
  } catch {
    return {};
  }
}

/** The edited wording, cached across requests and refreshed when an admin saves (tag SITE_COPY_TAG). */
export const getSiteCopy = unstable_cache(readSiteCopy, ["site-copy-v1"], { tags: [SITE_COPY_TAG], revalidate: 600 });

/** Why a submitted edit cannot be saved, or null when it can. */
export function copyEditProblem(key: unknown, value: unknown): string | null {
  if (typeof key !== "string" || !COPY_KEY_RE.test(key)) return "invalid key";
  if (typeof value !== "string") return "text required";
  if (!value.trim()) return "text cannot be empty (use Reset to put the original back)";
  if (value.length > COPY_MAX_LENGTH) return `text is longer than ${COPY_MAX_LENGTH} characters`;
  return null;
}
