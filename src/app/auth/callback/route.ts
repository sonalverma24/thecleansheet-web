import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-next-path";
import { parseSubscriber, recordSubscriber } from "@/lib/subscribers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // A path on this site only: `next` comes from the address, so it is checked before it is used.
  const next = safeNextPath(searchParams.get("next"), origin);
  const openReview = searchParams.get("openReview");
  const subscribe = searchParams.get("subscribe") === "true";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (subscribe) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          const subscriber = parseSubscriber(
            user?.email,
            user?.app_metadata?.provider === "google" ? "Google sign-in" : "Email sign-in",
          );
          if (subscriber) await recordSubscriber(subscriber);
        } catch (err) {
          console.error("[auth/callback] subscribe", err);
        }
      }
      // Append openReview flag so the product page can auto-open the review form
      const destination = openReview
        ? `${next}${next.includes("?") ? "&" : "?"}openReview=true`
        : next;
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
