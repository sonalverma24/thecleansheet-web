'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const { user, loading, signOut } = useAuth();
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
              <Link
                href="/auth/login"
                className="py-2 px-5 rounded-full bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
              >
                Login
              </Link>
            )
          )}
        </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-surface-subtle)] z-50 flex items-center justify-around p-4 text-[12px] tracking-[0.08em] uppercase">
        <Link href="/" className="flex flex-col items-center gap-1 hover:text-[var(--color-primary)]">
          <span>Home</span>
        </Link>
        <Link href="/standard" className="flex flex-col items-center gap-1 hover:text-[var(--color-primary)]">
          <span>Standard</span>
        </Link>
        <Link href="/education" className="flex flex-col items-center gap-1 hover:text-[var(--color-primary)]">
          <span>Education</span>
        </Link>
        <Link href="/verify" className="flex flex-col items-center gap-1 hover:text-[var(--color-primary)]">
          <span>Verify</span>
        </Link>
        <Link href="/about" className="flex flex-col items-center gap-1 hover:text-[var(--color-primary)]">
          <span>About</span>
        </Link>
      </nav>
    </>
  );
}
