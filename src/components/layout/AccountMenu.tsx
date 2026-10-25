'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

/* The signed-in header button: "Hi, <first name>" in the same green as Log in. Click
   it to open a small menu with Sign out. It closes on Escape, on a click anywhere
   else, and when Sign out is chosen. */

export default function AccountMenu({
  name, email, onSignOut,
}: {
  name: string;
  email?: string;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex-none">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen(!open)}
        title={email}
        className="inline-flex items-center gap-2 max-w-[220px] bg-[#248179] hover:bg-[#1d6b64] active:scale-[0.98] text-white rounded-lg px-[22px] py-[11px] text-[14px] font-bold whitespace-nowrap transition-[background-color,transform]"
      >
        <span className="truncate">Hi, {name}</span>
        <ChevronDown size={14} strokeWidth={2} aria-hidden className={`flex-none transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-3 min-w-full bg-white border border-[#e5dfd6] rounded-[14px] py-2 z-50 shadow-[0_2px_4px_rgba(40,40,40,0.08),0_18px_40px_rgba(40,40,40,0.10)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onSignOut(); }}
            className="block w-full text-left px-4 py-2.5 text-[14px] text-[#282828] hover:bg-[#e3f1ef] hover:text-[#248179] transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
