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
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
