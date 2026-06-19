"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Image from "next/image";
import Link from "next/link";
import {
  Heart, GitCompare, Layers, LogOut, Settings,
  ChevronRight, User, Shield
} from "lucide-react";

type Profile = {
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  role: string | null;
};

export default function AccountPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [profile, setProfile]         = useState<Profile | null>(null);
  const [loading, setLoading]         = useState(true);
  const [signingIn, setSigningIn]     = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootstrapMsg, setBootstrapMsg]   = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        // Try to fetch existing profile
        const { data: existing } = await supabase
          .from("profiles")
          .select("full_name,avatar_url,role")
          .eq("id", user.id)
          .single();

        if (existing) {
          setProfile({ ...existing, email: user.email ?? null });
        } else {
          // Profile doesn't exist yet (user signed up before migration) - create it now
          await supabase.from("profiles").upsert({
            id:         user.id,
            full_name:  user.user_metadata?.full_name ?? null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
            role:       "consumer",
          }, { onConflict: "id" });
          setProfile({
            full_name:  user.user_metadata?.full_name ?? null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
            email:      user.email ?? null,
            role:       "consumer",
          });
        }
      }
      setLoading(false);
    });
  }, [supabase]);

  const grantAdminAccess = async () => {
    setBootstrapping(true);
    setBootstrapMsg(null);
    try {
      const res  = await fetch("/api/admin/set-admin", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token: "tcs-bootstrap-2026" }),
      });
      const data = await res.json();
      const msg  = data.results
        ?.map((r: { email: string; status: string }) => r.status)
        .join(", ");
      setBootstrapMsg(msg ?? "Done");
      // Refresh profile to reflect new role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: updated } = await supabase
          .from("profiles").select("full_name,avatar_url,role").eq("id", user.id).single();
        if (updated) setProfile(p => ({ ...p!, ...updated }));
      }
    } catch {
      setBootstrapMsg("Failed - check console");
    } finally {
      setBootstrapping(false);
    }
  };

  const signInWithGoogle = async () => {
    setSigningIn(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-[#248179]/30 border-t-[#248179] animate-spin" />
      </div>
    );
  }

  // ── Guest / signed-out ────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#f7f6f6] flex items-center justify-center mb-6">
          <User size={28} strokeWidth={1} className="text-[#b0a8a4]" />
        </div>
        <h1
          className="text-[22px] text-[#282828] mb-2"
          style={{ fontFamily: "Cooper BT, Georgia, serif", fontWeight: 300 }}
        >
          Sign in to your account
        </h1>
        <p
          className="text-[14px] text-[#b0a8a4] mb-8 max-w-xs"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
          Save products, compare formulations, build routines, and write reviews.
        </p>

        <div className="w-full max-w-xs space-y-3">
          <button
            onClick={signInWithGoogle}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-full border border-[#b0a8a4]/30 text-[14px] text-[#282828] transition-all hover:border-[#282828]/30 hover:bg-[#f7f6f6]"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          >
            {signingIn ? (
              <div className="w-4 h-4 border-2 border-[#248179]/30 border-t-[#248179] rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-[#b0a8a4]/20" />
            <span className="text-[11px] text-[#b0a8a4]" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>or</span>
            <div className="flex-1 h-px bg-[#b0a8a4]/20" />
          </div>

          <Link
            href="/auth/login"
            className="w-full flex items-center justify-center py-3.5 rounded-full border border-[#b0a8a4]/30 text-[14px] text-[#282828] hover:border-[#248179]/40 transition-all"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          >
            Sign in with email
          </Link>
        </div>

        <p
          className="text-[11px] text-[#b0a8a4] mt-8 max-w-xs"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
          By signing in, you agree to our{" "}
          <Link href="/privacy-policy" className="text-[#248179] hover:underline">Privacy Policy</Link>{" "}
          and{" "}
          <Link href="/terms-of-use" className="text-[#248179] hover:underline">Terms of Use</Link>.
        </p>
      </div>
    );
  }

  // ── Signed-in ─────────────────────────────────────────────────────────────
  const isAdmin = profile.role === "admin";

  return (
    <div className="min-h-screen bg-white">
      {/* Profile header */}
      <div className="bg-[#f7f6f6] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name ?? "User"}
              width={56}
              height={56}
              className="rounded-full"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#248179]/10 flex items-center justify-center">
              <User size={22} strokeWidth={1.5} className="text-[#248179]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p
              className="text-[17px] text-[#282828] truncate"
              style={{ fontFamily: "Cooper BT, Georgia, serif", fontWeight: 300 }}
            >
              {profile.full_name ?? "Welcome back"}
            </p>
            <p
              className="text-[12px] text-[#b0a8a4] truncate"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              {profile.email}
            </p>
            {isAdmin && (
              <span
                className="inline-block mt-1 text-[10px] tracking-wide px-2 py-0.5 rounded-full"
                style={{
                  fontFamily: "Helvetica, Arial, sans-serif",
                  background: "rgba(36,129,121,0.08)",
                  color: "#248179",
                  border: "1px solid rgba(36,129,121,0.2)",
                }}
              >
                Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 space-y-2">
        {[
          { href: "/account/saved",   icon: Heart,       label: "Saved products"    },
          { href: "/account/compare", icon: GitCompare,  label: "My comparisons"    },
          { href: "/routine",         icon: Layers,      label: "My routine"        },
          { href: "/account/settings",icon: Settings,    label: "Settings"          },
        ].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between px-4 py-4 rounded-2xl bg-[#f7f6f6] hover:bg-[#248179]/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                <Icon size={16} strokeWidth={1.5} className="text-[#282828] group-hover:text-[#248179] transition-colors" />
              </div>
              <span
                className="text-[14px] text-[#282828]"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                {label}
              </span>
            </div>
            <ChevronRight size={16} strokeWidth={1.5} className="text-[#b0a8a4]" />
          </Link>
        ))}

        {isAdmin ? (
          <Link
            href="/admin"
            className="flex items-center justify-between px-4 py-4 rounded-2xl transition-colors group"
            style={{ background: "rgba(36,129,121,0.06)", border: "1px solid rgba(36,129,121,0.15)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                <Shield size={16} strokeWidth={1.5} className="text-[#248179]" />
              </div>
              <span
                className="text-[14px] text-[#248179]"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                Admin dashboard
              </span>
            </div>
            <ChevronRight size={16} strokeWidth={1.5} className="text-[#248179]" />
          </Link>
        ) : (
          <div className="px-4 py-4 rounded-2xl" style={{ background: "rgba(176,168,164,0.06)", border: "1px solid rgba(176,168,164,0.15)" }}>
            <button
              onClick={grantAdminAccess}
              disabled={bootstrapping}
              className="flex items-center gap-3 w-full"
            >
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                <Shield size={16} strokeWidth={1.5} className="text-[#b0a8a4]" />
              </div>
              <span
                className="text-[14px] text-[#b0a8a4]"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                {bootstrapping ? "Granting access…" : "Bootstrap admin access"}
              </span>
            </button>
            {bootstrapMsg && (
              <p className="text-[12px] text-[#248179] mt-2 pl-12" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                {bootstrapMsg}
              </p>
            )}
          </div>
        )}

        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-4 w-full rounded-2xl hover:bg-[#fd6158]/5 transition-colors group mt-4"
        >
          <div className="w-9 h-9 rounded-full bg-[#f7f6f6] flex items-center justify-center">
            <LogOut size={16} strokeWidth={1.5} className="text-[#b0a8a4] group-hover:text-[#fd6158] transition-colors" />
          </div>
          <span
            className="text-[14px] text-[#b0a8a4] group-hover:text-[#fd6158] transition-colors"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          >
            Sign out
          </span>
        </button>
      </div>
    </div>
  );
}
