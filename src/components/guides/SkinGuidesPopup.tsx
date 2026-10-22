"use client";

import { useEffect, useState } from "react";
import { BookOpen, Download, Lock, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { signInWithGoogle } from "@/lib/google-signin";
import { downloadSkinGuide, GUIDES_OPEN_PARAM, isGoogleUser, SKIN_TYPE_GUIDES } from "@/lib/skin-guide-downloads";

/* The skin-type guides popup, opened from the site banner. The four guides are
   visible to everyone but locked: they only become clickable (and downloadable)
   once the person has signed in with Google. */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

export default function SkinGuidesPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, loading } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState("");
  const unlocked = isGoogleUser(user);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  async function continueWithGoogle() {
    setSigningIn(true);
    setError("");
    // Come back to the same page with the popup open, now signed in.
    const here = new URL(window.location.href);
    here.searchParams.set(GUIDES_OPEN_PARAM, "open");
    const { error: err } = await signInWithGoogle(`${here.pathname}${here.search}`);
    if (err) {
      setError(err);
      setSigningIn(false);
    }
  }

  async function download(slug: string, label: string) {
    setBusySlug(slug);
    setError("");
    const res = await downloadSkinGuide(slug, label);
    setBusySlug(null);
    if (res.ok) return;
    setError(
      res.reason === "signin" ? "Your sign-in has expired. Please continue with Google again."
        : res.reason === "google" ? "Downloads need a Google sign-in. Please continue with Google."
        : "We couldn’t fetch the guide just now. Please try again.",
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="guides-popup-title">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[1100px] max-h-[92vh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] text-white shadow-2xl shadow-black/40"
        style={{ background: "linear-gradient(135deg,#0f2e2b 0%,#134e4a 40%,#0e3d3a 100%)" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X size={18} />
        </button>

        <div className="px-5 sm:px-10 py-8 sm:py-12 flex flex-col gap-8">
          <div className="flex flex-col gap-5">
            <span className="self-start inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[13px] text-teal-200">
              <BookOpen size={14} /> Free · PDF Download
            </span>
            <div className="flex flex-wrap items-end justify-between gap-6 pr-10">
              <h2 id="guides-popup-title" className="font-display font-light text-[clamp(34px,5vw,56px)] leading-[1.02] tracking-[-0.02em] text-white">
                Find your skin type.
                <br />
                <span className="text-teal-300">Build your routine.</span>
              </h2>
              <p className="text-[15px] leading-[1.6] text-teal-100/70 max-w-[300px]">
                Science-backed guides for Indian skin. Practical, jargon-free, free to download.
              </p>
            </div>
          </div>

          {/* Sign-in gate */}
          {!unlocked && (
            <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Lock size={18} className="mt-0.5 text-teal-300 flex-shrink-0" />
                <div>
                  <p className="font-bold text-[15px] text-white">Sign in with Google to unlock the guides</p>
                  <p className="text-[13px] text-teal-100/70 mt-0.5">
                    {user ? "You’re signed in with email. Downloads need a Google sign-in." : "It’s free, and takes a few seconds."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={continueWithGoogle}
                disabled={signingIn || loading}
                className="inline-flex items-center gap-2.5 rounded-lg bg-white hover:bg-[#e3f1ef] disabled:opacity-60 text-[#282828] px-5 py-3 text-[14px] font-bold transition-colors"
              >
                <GoogleIcon />
                {signingIn ? "Opening Google…" : "Continue with Google"}
              </button>
            </div>
          )}
          {error && <p className="text-[13px] text-coral-300 -mt-4">{error}</p>}

          {/* The guides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SKIN_TYPE_GUIDES.map((g) => {
              const body = (
                <>
                  <span className="block h-0.5 w-12 rounded-full" style={{ background: g.accent }} />
                  <span className="font-display font-light text-[24px] leading-[1.1] text-white">{g.label}</span>
                  <span className="text-[14px] leading-[1.55] text-teal-100/65 flex-1">{g.desc}</span>
                </>
              );
              return unlocked ? (
                <div key={g.slug} className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 flex flex-col gap-3 min-h-[220px]">
                  {body}
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => download(g.slug, g.label)}
                      disabled={busySlug === g.slug}
                      className="inline-flex items-center gap-2 text-[14px] font-bold hover:underline underline-offset-[3px] disabled:opacity-60"
                      style={{ color: g.accent }}
                    >
                      <Download size={15} /> {busySlug === g.slug ? "Preparing…" : "Download guide"}
                    </button>
                    <a href={`/learn/guides/${g.slug}`} className="text-[13px] text-teal-100/70 hover:text-white underline underline-offset-[3px] transition-colors">
                      Read online
                    </a>
                  </div>
                </div>
              ) : (
                <div
                  key={g.slug}
                  aria-disabled="true"
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-3 min-h-[220px] opacity-55 cursor-not-allowed select-none"
                >
                  {body}
                  <span className="inline-flex items-center gap-2 text-[13px] font-bold text-teal-100/80 pt-1">
                    <Lock size={14} /> Sign in to unlock
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
