'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export function Navigation() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  if (pathname?.startsWith('/app')) {
    return null;
  }

  return (
    <>
      {/* Desktop Top Nav — sticky, blurs over content when scrolling */}
      <nav className="hidden md:block sticky top-0 z-50 border-b border-[var(--color-surface-subtle)] bg-white/90 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex-shrink-0">
            <img src="/images/logo.png" alt="The Clean Sheet" className="w-16 h-16 object-contain" />
          </Link>
          <div className="flex items-center gap-6 text-[var(--color-charcoal)] text-[14px] tracking-[0.05em] uppercase">
            <Link href="/review" className="hover:text-[var(--color-primary)] transition-colors">Product Review</Link>
            <Link href="/certification" className="hover:text-[var(--color-primary)] transition-colors">Certification</Link>
            <Link href="/learn" className="hover:text-[var(--color-primary)] transition-colors">Learn</Link>
            <Link href="/blog" className="hover:text-[var(--color-primary)] transition-colors">Reads</Link>
            <Link href="/about" className="hover:text-[var(--color-primary)] transition-colors">About</Link>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[14px] tracking-[0.05em] uppercase">
          <Link href="/for-brands" className="py-2 px-5 border border-[var(--color-charcoal)] rounded-full hover:bg-[var(--color-charcoal)] hover:text-white transition-colors">Get Certified</Link>
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
        <Link href="/review" className="flex flex-col items-center gap-1 hover:text-[var(--color-primary)]">
          <span>Review</span>
        </Link>
        <Link href="/certification" className="flex flex-col items-center gap-1 hover:text-[var(--color-primary)]">
          <span>Certify</span>
        </Link>
        <Link href="/learn" className="flex flex-col items-center gap-1 hover:text-[var(--color-primary)]">
          <span>Learn</span>
        </Link>
        <Link href="/blog" className="flex flex-col items-center gap-1 hover:text-[var(--color-primary)]">
          <span>Reads</span>
        </Link>
      </nav>
    </>
  );
}
