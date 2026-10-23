'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { BRAND_MENU, CONSUMER_MENU } from './nav-menus';
import type { NavMenuItem } from './NavMenu';

/* Phone header, following the mobile design: a sticky 64px bar (logo, name,
   one-line tagline, hamburger) and a drawer under it. The drawer has the same two
   collapsible groups as the desktop bar (For consumers, For brands, one open at a
   time) and one green Log in button (Sign out once signed in). */

function Group({
  label, items, open, onToggle, onNavigate,
}: {
  label: string;
  items: NavMenuItem[];
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className="border-b border-[#e5dfd6]">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="w-full flex items-center justify-between min-h-[52px] text-left"
      >
        <span className={`font-display font-light text-[24px] ${open ? 'text-[#248179]' : 'text-[#282828]'}`}>{label}</span>
        <ChevronDown size={18} aria-hidden className={`text-[#248179] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="pb-2">
          {items.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                onClick={onNavigate}
                className="flex items-center justify-between min-h-[48px] pl-1 text-[15px] text-[#282828] active:bg-[#e3f1ef]"
              >
                {it.label}
                <span aria-hidden className="text-[#248179]">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MobileHeader() {
  const pathname = usePathname();
  const { user, loading, signOut, openLoginModal } = useAuth();
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<'consumers' | 'brands' | null>(null);
  const close = useCallback(() => { setOpen(false); setGroup(null); }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  const login = () => {
    close();
    openLoginModal({
      returnPath: pathname,
      title: 'Sign in to your account',
      subtitle: 'Save products, compare formulations, build routines, and share feedback.',
    });
  };

  return (
    <div className="md:hidden sticky top-0 z-50 bg-white border-b border-[#e5dfd6] pt-safe">
      <div className="flex items-center gap-2.5 h-16 px-4">
        <Link href="/" onClick={close} aria-label="The Clean Sheet home" className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={38} height={38} className="w-[38px] h-[38px] rounded-full flex-none" />
          <span className="flex flex-col gap-0.5 min-w-0">
            <span className="font-display font-light text-[19px] leading-none tracking-[-0.01em] text-[#282828] whitespace-nowrap">The Clean Sheet</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#248179] whitespace-nowrap">Independent standard &amp; verification</span>
          </span>
        </Link>
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => (open ? close() : setOpen(true))}
          className="flex-none w-11 h-11 border border-[#e5dfd6] rounded-lg bg-white flex items-center justify-center text-[#282828]"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <>
          <div aria-hidden onClick={close} className="absolute left-0 right-0 top-full h-[100dvh] bg-black/30" />
          <nav
            aria-label="Menu"
            className="absolute left-0 right-0 top-full bg-white border-b border-[#e5dfd6] shadow-[0_2px_4px_rgba(40,40,40,0.08),0_18px_40px_rgba(40,40,40,0.10)] px-4 pt-2 pb-5 flex flex-col max-h-[calc(100dvh-4rem)] overflow-y-auto"
          >
            <Group
              label="For consumers"
              items={CONSUMER_MENU}
              open={group === 'consumers'}
              onToggle={() => setGroup(group === 'consumers' ? null : 'consumers')}
              onNavigate={close}
            />
            <Group
              label="For brands"
              items={BRAND_MENU}
              open={group === 'brands'}
              onToggle={() => setGroup(group === 'brands' ? null : 'brands')}
              onNavigate={close}
            />
            {!loading && (
              <button
                type="button"
                onClick={user ? () => { close(); void signOut(); } : login}
                className="mt-5 h-[52px] rounded-lg bg-[#248179] active:scale-[0.98] text-white text-[16px] font-bold transition-transform"
              >
                {user ? 'Sign out' : 'Log in'}
              </button>
            )}
          </nav>
        </>
      )}
    </div>
  );
}
