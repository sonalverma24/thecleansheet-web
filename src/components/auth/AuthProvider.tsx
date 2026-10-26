"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import LoginModal from "./LoginModal";
import { captureAcquisition, getSignupPath, clearAuthIntent } from "@/lib/acquisition";
import { track } from "@/lib/analytics";

interface LoginModalOptions {
  returnPath?: string;
  openReviewOnReturn?: boolean;
  /** Override the modal heading + subtext for the action being gated. */
  title?: string;
  subtitle?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  openLoginModal: (options?: LoginModalOptions) => void;
  closeLoginModal: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<LoginModalOptions>({});

  useEffect(() => {
    let disposed = false;
    let attemptedUserId: string | null = null;

    async function captureNewRegistration(currentUser: User) {
      // Older accounts have no trustworthy first-visit history. Never label
      // a routine returning login as a newly attributed registration.
      const age = Date.now() - Date.parse(currentUser.created_at);
      if (!Number.isFinite(age) || age < 0 || age > 60 * 60 * 1000) return;
      if (attemptedUserId === currentUser.id) return;
      attemptedUserId = currentUser.id;

      const attribution = captureAcquisition();
      if (!attribution) return;
      const first = attribution.first;
      const last = attribution.last;

      const { error } = await supabase.from("user_attribution").insert({
        user_id: currentUser.id,
        first_seen_at: first.seenAt,
        first_source: first.source,
        first_medium: first.medium,
        first_campaign: first.campaign,
        first_referrer_host: first.referrerHost,
        first_landing_path: first.landingPath,
        last_source: last.source,
        last_medium: last.medium,
        last_campaign: last.campaign,
        signup_path: getSignupPath(),
      });

      // The user_id primary key is an extra safeguard against duplicate
      // signup events from auth callbacks, refreshes, or reopened tabs.
      if (!error) {
        const method = currentUser.app_metadata?.provider === "google" ? "google" : "email";
        track("sign_up", { method });
        clearAuthIntent();
      } else if (error.code !== "23505") {
        console.warn("[TCS acquisition] Could not save attribution:", error.message);
      }
    }

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (disposed) return;
      setUser(user);
      setLoading(false);
      if (user) void captureNewRegistration(user);
    }).catch(() => {
      if (!disposed) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (disposed) return;
      setUser(session?.user ?? null);
      setLoading(false);
      // Avoid making Supabase queries synchronously from an auth callback.
      if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        setTimeout(() => {
          if (!disposed) void captureNewRegistration(session.user);
        }, 0);
      }
    });

    return () => {
      disposed = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const openLoginModal = useCallback((options: LoginModalOptions = {}) => {
    setModalOptions(options);
    setModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{ user, loading, openLoginModal, closeLoginModal, signOut }}
    >
      {children}
      {modalOpen && (
        <LoginModal
          onClose={closeLoginModal}
          returnPath={modalOptions.returnPath}
          openReviewOnReturn={modalOptions.openReviewOnReturn}
          title={modalOptions.title}
          subtitle={modalOptions.subtitle}
        />
      )}
    </AuthContext.Provider>
  );
}
