"use client";

import Image from "next/image";
import Link from "next/link";
import { GitCompare, X } from "lucide-react";
import { COMPARE_MAX } from "@/lib/compare-group";
import { track } from "@/lib/analytics";

/* The bar at the foot of /brands while products are picked for a comparison. It names the type being compared (the first product picked sets it) and says
   what to do next. "Compare" is a link to /compare, so the comparison has its own address. */

export interface TrayItem { id: string; slug: string; name: string; image: string | null }

export function CompareTray({ items, type, onRemove, onClearAll }: {
  items: TrayItem[];
  type: string | null;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}) {
  if (items.length === 0) return null;
  const ready = items.length >= 2;
  const href = `/compare?items=${items.map((i) => encodeURIComponent(i.slug)).join(",")}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-[#e5dfd6] bg-white shadow-[0_-8px_30px_rgba(40,40,40,0.10)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <ul className="flex flex-none items-center gap-2" aria-label="Products to compare">
            {items.map((p) => (
              <li key={p.id} className="relative flex-none">
                <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-[#e5dfd6] bg-white">
                  {p.image ? <Image src={p.image} alt="" fill sizes="44px" className="object-contain p-1" /> : <span className="absolute inset-0 flex items-center justify-center text-base">🧴</span>}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#282828] text-white"
                >
                  <X size={10} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-[#282828]">
              {type ? `Comparing ${type}` : "Comparing"} <span className="font-normal text-[#6f6a66]">· {items.length}/{COMPARE_MAX}</span>
            </p>
            <p className="text-[12px] leading-[1.35] text-[#4a4a4a] line-clamp-2 sm:line-clamp-none">
              {ready ? `Only ${type ?? "products of the same type"} can be added.` : `Add another ${type ?? "product of the same type"} to compare.`}
            </p>
          </div>
        </div>

        <div className="flex flex-none items-center gap-2">
          <button type="button" onClick={onClearAll} className="min-h-[44px] px-1 text-[14px] text-[#4a4a4a] transition-colors hover:text-[#282828]">Clear</button>
          {ready ? (
            <Link
              href={href}
              onClick={() => track("compare_started", { slugs: items.map((i) => i.slug), type })}
              className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#248179] px-4 text-[14px] font-bold text-white transition-colors hover:bg-[#1d6b64]"
            >
              <GitCompare size={15} aria-hidden /> Compare
            </Link>
          ) : (
            <span aria-disabled="true" className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#e5dfd6] px-4 text-[14px] font-bold text-[#6f6a66]">
              <GitCompare size={15} aria-hidden /> Compare
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
