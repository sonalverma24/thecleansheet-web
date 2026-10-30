"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

/* The message shown when someone presses Compare on a product that cannot join the comparison (a different type, a full list, a type we have not filed).
   It sits above the comparison bar, stays until it is closed (the X, the Close button or Escape) or until the list changes, and, when the cause is a
   different type, offers one button that filters the list to the type being compared. */

export function CompareNotice({ title, message, actionLabel, onAction, onClose }: {
  title: string;
  message: string;
  /** The button that fixes the problem, when there is one ("Show only Sunscreens"). */
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed left-1/2 z-[70] w-[min(520px,calc(100vw-24px))] -translate-x-1/2 bottom-[calc(96px+env(safe-area-inset-bottom))]">
      <div role="alert" className="relative rounded-2xl border border-[#e8c9a0] bg-[#fff8ee] p-4 pr-11 shadow-[0_12px_40px_rgba(40,40,40,0.18)]">
        <button type="button" onClick={onClose} aria-label="Close this message" className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full text-[#4a4a4a] transition-colors hover:bg-[#f3e3cc]">
          <X size={16} aria-hidden />
        </button>
        <p className="text-[14px] font-bold text-[#282828]">{title}</p>
        <p className="mt-1 text-[14px] leading-[1.5] text-[#4a4a4a]">{message}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {actionLabel && onAction && (
            <button type="button" onClick={onAction} className="min-h-[40px] rounded-lg bg-[#248179] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#1d6b64]">{actionLabel}</button>
          )}
          <button type="button" onClick={onClose} className="min-h-[40px] rounded-lg border border-[#d9c7ad] bg-white px-4 text-[13px] font-bold text-[#282828] transition-colors hover:border-[#248179]">Close</button>
        </div>
      </div>
    </div>
  );
}
