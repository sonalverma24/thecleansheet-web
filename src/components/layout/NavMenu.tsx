'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

/* A collapsible header menu: click the label to open or close it. It closes on
   Escape, on a click anywhere else, and when an item is chosen. */

export type NavMenuItem = { label: string; href: string };

export default function NavMenu({
  label, items, open, active, onToggle, onClose,
}: {
  label: string;
  items: NavMenuItem[];
  open: boolean;
  active?: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const itemClass = 'block px-4 py-2.5 text-[14px] text-[#282828] hover:bg-[#e3f1ef] hover:text-[#248179] transition-colors';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={`inline-flex items-center gap-1 text-[14px] transition-colors hover:text-[#248179] ${open || active ? 'text-[#248179]' : 'text-[#282828]'}`}
      >
        {label}
        <ChevronDown size={14} strokeWidth={2} aria-hidden className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="absolute left-0 top-full mt-4 min-w-[210px] bg-white border border-[#e5dfd6] rounded-[14px] py-2 z-50 shadow-[0_2px_4px_rgba(40,40,40,0.08),0_18px_40px_rgba(40,40,40,0.10)]">
          {items.map((it) => (
            <li key={it.href}>
              <Link href={it.href} onClick={onClose} className={itemClass}>
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
