"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function LoginPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs">
        <Link href="/account" className="flex items-center gap-1.5 text-[12px] text-[#b0a8a4] mb-8 hover:text-[#282828] transition-colors"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#248179]/8 flex items-center justify-center mx-auto mb-5">
              <Mail size={24} strokeWidth={1} className="text-[#248179]" />
            </div>
            <h1 className="text-[20px] text-[#282828] mb-2"
              style={{ fontFamily: "Cooper BT, Georgia, serif", fontWeight: 300 }}>
              Check your email
            </h1>
            <p className="text-[13px] text-[#b0a8a4]"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              We sent a magic link to <strong className="font-normal text-[#282828]">{email}</strong>.
              Click it to sign in.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-[22px] text-[#282828] mb-2"
              style={{ fontFamily: "Cooper BT, Georgia, serif", fontWeight: 300 }}>
              Sign in with email
            </h1>
            <p className="text-[13px] text-[#b0a8a4] mb-8"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              We'll send a magic link - no password needed.
            </p>
            <form onSubmit={handleMagicLink} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3.5 rounded-full border border-[#b0a8a4]/30 text-[14px] text-[#282828] focus:outline-none focus:border-[#248179]/50 placeholder-[#b0a8a4]"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              />
              {error && (
                <p className="text-[12px] text-[#fd6158]" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3.5 rounded-full text-[14px] text-white transition-all disabled:opacity-50"
                style={{ background: "#248179", fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                {loading ? "Sending…" : "Send magic link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
