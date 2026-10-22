import { createClient } from "@/lib/supabase/client";

/** Browser side: start the Google sign-in and come back to `next` (a path on this site). */
export async function signInWithGoogle(next: string): Promise<{ error: string | null }> {
  const { error } = await createClient().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  return { error: error ? error.message : null };
}
