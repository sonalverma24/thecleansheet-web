"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Download } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { signInWithGoogle } from "@/lib/google-signin";
import { downloadSkinGuide, isGoogleUser } from "@/lib/skin-guide-downloads";

/* Download button for a skin-type guide page. The PDF is only served to someone
   signed in with Google, so signed out the button starts the Google sign-in
   (and brings them back to this page); signed in it downloads the guide. */

const BTN = "inline-flex items-center gap-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 font-normal text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60";

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

export default function GuideDownloadButton({ slug, label }: { slug: string; label: string }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const unlocked = isGoogleUser(user);

  async function signIn() {
    setBusy(true);
    setMessage("");
    const { error } = await signInWithGoogle(pathname || `/learn/guides/${slug}`);
    if (error) {
      setMessage(error);
      setBusy(false);
    }
  }

  async function download() {
    setBusy(true);
    setMessage("");
    const res = await downloadSkinGuide(slug, label);
    setBusy(false);
    if (res.ok) return;
    setMessage(
      res.reason === "error"
        ? "We couldn’t fetch the guide just now. Please try again."
        : "Please sign in with Google to download.",
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {unlocked ? (
        <button type="button" onClick={download} disabled={busy} className={BTN}>
          <Download size={14} />
          {busy ? "Preparing…" : "Download PDF"}
        </button>
      ) : (
        <button type="button" onClick={signIn} disabled={busy || loading} className={BTN}>
          <GoogleIcon />
          {busy ? "Opening Google…" : "Sign in with Google to download"}
        </button>
      )}
      {message && <p className="text-xs text-coral-600">{message}</p>}
    </div>
  );
}
