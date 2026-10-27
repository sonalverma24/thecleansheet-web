import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseSubscriber, recordSubscriber } from "@/lib/subscribers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";
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
