'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

/* Reading-progress sweep across the bottom edge of the sticky header */
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setPct(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-transparent" aria-hidden>
      <div
        className="h-full"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #248179 0%, #80d5cc 60%, #d2ff34 100%)',
          transition: 'width 80ms linear',
          borderRadius: '0 2px 2px 0',
        }}
      />
    </div>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const { user, loading, signOut, openLoginModal } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (pathname?.startsWith('/app')) {
    return null;
  }

  return (
    <>
      {/* Desktop Top Nav · transparent at the top so the page gradient flows through, frosts on scroll */}
      <nav className={`hidden md:block sticky top-0 z-50 relative transition-all duration-300 ${scrolled ? "bg-white/85 backdrop-blur-md border-b border-[var(--color-surface-subtle)] shadow-[0_1px_2px_rgba(40,40,40,0.05)]" : "bg-transparent"}`}>
        <ScrollProgress />
        <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-2 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex-shrink-0">
            <img src="/images/logo.png" alt="The Clean Sheet" className="w-16 h-16 object-contain" />
          </Link>
          <div className="flex items-center gap-6 text-[var(--color-charcoal)] text-[14px] tracking-[0.05em] uppercase">
            <Link href="/brands" className="hover:text-[var(--color-primary)] transition-colors">Reviews</Link>
            <Link href="/standard" className="hover:text-[var(--color-primary)] transition-colors">Standard</Link>
            <Link href="/education" className="hover:text-[var(--color-primary)] transition-colors">Education</Link>
            <Link href="/verify" className="hover:text-[var(--color-primary)] transition-colors">Verify</Link>
            <Link href="/about" className="hover:text-[var(--color-primary)] transition-colors">About</Link>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[14px] tracking-[0.05em] uppercase">
          <Link href="/for-brands" className="py-2 px-5 border border-[var(--color-charcoal)] rounded-full hover:bg-[var(--color-charcoal)] hover:text-white transition-colors">For brands</Link>
          {!loading && (
            user ? (
              <button
                onClick={() => signOut()}
                title={user.email ?? undefined}
                className="py-2 px-5 rounded-full bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => openLoginModal({
                  returnPath: pathname,
                  title: "Sign in to your account",
                  subtitle: "Save products, compare formulations, build routines, and write reviews.",
                })}
                className="py-2 px-5 rounded-full bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
              >
                Login
              </button>
            )
          )}
        </div>
        </div>
      </nav>

      {/* Mobile Top Bar · minimal logo bar. Recedes on scroll so each page's own
          sticky chrome (search app-bar, verdict tabs) takes the top edge, while
          the fixed bottom tab bar (MobileBottomNav) handles primary nav. */}
      <div className="md:hidden pt-safe bg-white/90 backdrop-blur-md border-b border-[var(--color-surface-subtle)]">
        <div className="relative flex items-center justify-center h-[52px] px-4">
          <Link href="/" aria-label="The Clean Sheet home" className="flex items-center">
            <img src="/images/logo.png" alt="The Clean Sheet" className="w-9 h-9 object-contain" />
          </Link>
          {!loading && (
            <div className="absolute right-3">
              {user ? (
                <button
                  onClick={() => signOut()}
                  title={user.email ?? undefined}
                  aria-label="Sign out"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white text-[11px] uppercase tracking-wide"
                >
                  {(user.email?.[0] ?? 'U').toUpperCase()}
                </button>
              ) : (
                <button
                  onClick={() => openLoginModal({
                    returnPath: pathname,
                    title: 'Sign in to your account',
                    subtitle: 'Save products, compare formulations, build routines, and write reviews.',
                  })}
                  aria-label="Log in"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--color-charcoal)]/15 text-[var(--color-charcoal)]"
                >
                  <User size={18} strokeWidth={1.5} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
