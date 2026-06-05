"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  onClose: () => void;
  returnPath?: string;
  openReviewOnReturn?: boolean;
}

type Screen = "options" | "email_login" | "email_signup" | "email_sent";

const FONT_DISPLAY = "var(--font-display)";
const FONT_SANS = "var(--font-sans)";

export default function LoginModal({ onClose, returnPath, openReviewOnReturn }: Props) {
  const supabase = createClient();
  const [screen, setScreen] = useState<Screen>("options");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Build the redirect URL that the auth callback will forward to
  const redirectTo = useCallback(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const next = returnPath ?? "/";
    const openReview = openReviewOnReturn ? "&openReview=true" : "";
    return `${base}/auth/callback?next=${encodeURIComponent(next)}${openReview}`;
  }, [returnPath, openReviewOnReturn]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function handleGoogle() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo() },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setScreen("email_sent");
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal - bottom sheet on mobile, centered on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-heading"
        className="fixed z-50 inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center pointer-events-none"
      >
        <div
          className="pointer-events-auto w-full sm:w-[420px] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl border border-[#b0a8a4]/20 p-8 pb-10 sm:pb-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-[#b0a8a4] hover:text-[#282828] hover:bg-[#faf7f2] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {screen === "email_sent" ? (
            <EmailSentScreen email={email} onClose={onClose} />
          ) : (
            <>
              {/* Heading */}
              <h2
                id="login-modal-heading"
                className="text-[22px] text-[#282828] leading-tight mb-2"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                Sign in to write a review
              </h2>
              <p
                className="text-sm text-[#b0a8a4] mb-7 leading-snug"
                style={{ fontFamily: FONT_SANS }}
              >
                Your review helps other consumers make better product decisions.
              </p>

              {/* Error */}
              {error && (
                <p
                  className="text-sm text-[#fd6158] mb-4 bg-[#ffe6e4] px-3 py-2 rounded-lg"
                  style={{ fontFamily: FONT_SANS }}
                >
                  {error}
                </p>
              )}

              {screen === "options" && (
                <OptionsScreen
                  onGoogle={handleGoogle}
                  onEmailLogin={() => setScreen("email_login")}
                  onEmailSignup={() => setScreen("email_signup")}
                  loading={loading}
                />
              )}

              {(screen === "email_login" || screen === "email_signup") && (
                <EmailScreen
                  mode={screen === "email_login" ? "login" : "signup"}
                  email={email}
                  onEmailChange={setEmail}
                  onSubmit={handleEmailSubmit}
                  onBack={() => setScreen("options")}
                  loading={loading}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Sub-screens ──────────────────────────────────────────────────────────── */

function OptionsScreen({
  onGoogle,
  onEmailLogin,
  onEmailSignup,
  loading,
}: {
  onGoogle: () => void;
  onEmailLogin: () => void;
  onEmailSignup: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-3" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Google button */}
      <button
        onClick={onGoogle}
        disabled={loading}
        className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl border border-[#b0a8a4]/40 bg-white text-[#282828] text-sm font-medium hover:bg-[#faf7f2] transition-colors disabled:opacity-50"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-[#b0a8a4]/30" />
        <span className="text-xs text-[#b0a8a4]">or</span>
        <div className="flex-1 h-px bg-[#b0a8a4]/30" />
      </div>

      {/* Email options */}
      <button
        onClick={onEmailSignup}
        disabled={loading}
        className="w-full px-4 py-3 rounded-xl bg-[#248179] text-white text-sm font-medium hover:bg-[#1d6e67] transition-colors disabled:opacity-50"
      >
        Sign up with email
      </button>
      <button
        onClick={onEmailLogin}
        disabled={loading}
        className="w-full px-4 py-3 rounded-xl border border-[#b0a8a4]/40 text-[#282828] text-sm font-medium hover:bg-[#faf7f2] transition-colors disabled:opacity-50"
      >
        Log in with email
      </button>

      <p className="text-[11px] text-[#b0a8a4] text-center mt-2 leading-relaxed">
        By continuing you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

function EmailScreen({
  mode,
  email,
  onEmailChange,
  onSubmit,
  onBack,
  loading,
}: {
  mode: "login" | "signup";
  email: string;
  onEmailChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  loading: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" style={{ fontFamily: "var(--font-sans)" }}>
      <div>
        <label
          htmlFor="modal-email"
          className="block text-xs text-[#282828] font-medium mb-1.5"
        >
          Email address
        </label>
        <input
          id="modal-email"
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-xl border border-[#b0a8a4]/40 text-sm text-[#282828] placeholder-[#b0a8a4] focus:outline-none focus:border-[#248179] focus:ring-1 focus:ring-[#248179] transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="w-full px-4 py-3 rounded-xl bg-[#248179] text-white text-sm font-medium hover:bg-[#1d6e67] transition-colors disabled:opacity-50"
      >
        {loading
          ? "Sending link..."
          : mode === "signup"
          ? "Send sign up link"
          : "Send login link"}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-[#b0a8a4] hover:text-[#282828] transition-colors text-center"
      >
        Back
      </button>

      <p className="text-[11px] text-[#b0a8a4] text-center leading-relaxed">
        We&apos;ll send a magic link to your email. No password needed.
      </p>
    </form>
  );
}

function EmailSentScreen({ email, onClose }: { email: string; onClose: () => void }) {
  return (
    <div className="text-center" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="w-12 h-12 rounded-full bg-[#e3f1ef] flex items-center justify-center mx-auto mb-5">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#248179" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>
      <h2
        className="text-[20px] text-[#282828] leading-tight mb-2"
        style={{ fontFamily: FONT_DISPLAY }}
      >
        Check your email
      </h2>
      <p className="text-sm text-[#b0a8a4] mb-1">
        We sent a sign-in link to
      </p>
      <p className="text-sm text-[#282828] font-medium mb-6">{email}</p>
      <p className="text-xs text-[#b0a8a4] mb-6 leading-relaxed">
        Click the link in the email to sign in. You can close this window.
      </p>
      <button
        onClick={onClose}
        className="w-full px-4 py-3 rounded-xl border border-[#b0a8a4]/40 text-[#282828] text-sm font-medium hover:bg-[#faf7f2] transition-colors"
      >
        Close
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
