'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import SkinGuidesPopup from '@/components/guides/SkinGuidesPopup';
import MobileHeader from '@/components/layout/MobileHeader';
import NavMenu from '@/components/layout/NavMenu';
import { BRAND_MENU, CONSUMER_MENU } from '@/components/layout/nav-menus';
import { GUIDES_OPEN_PARAM } from '@/lib/skin-guide-downloads';

/* Site header: a dark guide banner, then a white sticky bar with two collapsible
   menus (For consumers, For brands) and one green Log in button; on a phone, a
   hamburger drawer with the same two groups (MobileHeader). Each menu's Community
   item scrolls to that page's community write-up; the WhatsApp join buttons live
   inside those write-ups. Reviews, Standard, Verify and About live in the footer,
   the mobile tab bar and the "More from The Clean Sheet" row on the home page. */

export function Navigation() {
  const pathname = usePathname();
  const { user, loading, signOut, openLoginModal } = useAuth();
  const [guidesOpen, setGuidesOpen] = useState(false);
  const [menu, setMenu] = useState<'consumers' | 'brands' | null>(null);
  const closeMenu = useCallback(() => setMenu(null), []);

  // Coming back from the Google sign-in: reopen the guides popup, then tidy the URL.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get(GUIDES_OPEN_PARAM) !== 'open') return;
    const id = window.setTimeout(() => {
      setGuidesOpen(true);
      url.searchParams.delete(GUIDES_OPEN_PARAM);
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  if (pathname?.startsWith('/app')) {
    return null;
  }

  const isUnder = (prefixes: string[]) => prefixes.some((p) => pathname === p || pathname?.startsWith(`${p}/`));
  const login = () =>
    openLoginModal({
      returnPath: pathname,
      title: 'Sign in to your account',
      subtitle: 'Save products, compare formulations, build routines, and write reviews.',
    });

  return (
    <>
      {/* Banner · opens the skin-type guides popup (guides unlock after a Google sign-in) */}
      <button
        type="button"
        onClick={() => setGuidesOpen(true)}
        className="block w-full bg-[#282828] hover:bg-[#1f1f1f] transition-colors text-white text-center text-[11px] font-bold uppercase tracking-[0.18em] px-4 py-2.5 leading-relaxed"
      >
        Free guide <span className="text-[#b0a8a4]">·</span> Download your skin type guide{' '}
        <span className="text-[#d2ff34] underline underline-offset-[3px]">here</span>
      </button>
      <SkinGuidesPopup open={guidesOpen} onClose={() => setGuidesOpen(false)} />

      {/* Desktop header */}
      <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-[#e5dfd6]">
        <div className="max-w-[1200px] mx-auto px-8 lg:px-12 py-4 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 flex-none" aria-label="The Clean Sheet home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={48} height={48} className="w-12 h-12 rounded-full" />
            <span className="flex flex-col gap-0.5">
              <span className="font-display font-light text-[22px] leading-none tracking-[-0.01em] text-[#282828] whitespace-nowrap">
                The Clean Sheet
              </span>
              <span className="hidden lg:block text-[10px] font-normal uppercase tracking-[0.14em] text-[#248179] whitespace-nowrap">
                Independent standard &amp; verification
              </span>
            </span>
          </Link>

          <nav aria-label="Main" className="ml-auto flex items-center gap-[clamp(18px,2vw,32px)] text-[14px] text-[#282828] whitespace-nowrap">
            <NavMenu
              label="For consumers"
              items={CONSUMER_MENU}
              open={menu === 'consumers'}
              active={isUnder(['/brands', '/education'])}
              onToggle={() => setMenu(menu === 'consumers' ? null : 'consumers')}
              onClose={closeMenu}
            />
            <span aria-hidden className="w-px self-stretch bg-[#e5dfd6]" />
            <NavMenu
              label="For brands"
              items={BRAND_MENU}
              open={menu === 'brands'}
              active={isUnder(['/for-brands'])}
              onToggle={() => setMenu(menu === 'brands' ? null : 'brands')}
              onClose={closeMenu}
            />
          </nav>

          {/* The one green button: Log in (Sign out once signed in). Nothing else lives here. */}
          {!loading && (
            <button
              type="button"
              onClick={user ? () => signOut() : login}
              title={user?.email ?? undefined}
              className="flex-none inline-flex items-center bg-[#248179] hover:bg-[#1d6b64] active:scale-[0.98] text-white rounded-lg px-[22px] py-[11px] text-[14px] font-bold whitespace-nowrap transition-[background-color,transform]"
            >
              {user ? 'Sign out' : 'Log in'}
            </button>
          )}
        </div>
      </header>

      <MobileHeader />
    </>
  );
}
