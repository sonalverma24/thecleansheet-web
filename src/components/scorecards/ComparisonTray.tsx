"use client";
import Image from "next/image";
import { X, GitCompare } from "lucide-react";
import type { ProductScorecard } from "@/data/brands/types";
import { track } from "@/lib/analytics";

interface ComparisonTrayProps {
  products: ProductScorecard[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onCompare: () => void;
}

export function ComparisonTray({
  products,
  onRemove,
  onClearAll,
  onCompare,
}: ComparisonTrayProps) {
  if (products.length === 0) return null;

  const handleCompare = () => {
    track("compare_started", { slugs: products.map((p) => p.slug) });
    onCompare();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-ink-200 shadow-2xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4">
        {/* Selected products */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 overflow-x-auto">
          <span className="text-xs text-ink-500 whitespace-nowrap flex-shrink-0">
            {products.length}/4
          </span>
          <div className="flex items-center gap-2">
            {products.map((p) => (
              <div
                key={`${p.brandSlug}/${p.slug}`}
                className="relative flex-shrink-0 group"
              >
                <div className="w-11 h-11 rounded-xl bg-ink-50 border border-ink-100 overflow-hidden flex items-center justify-center">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.productName}
                      width={36}
                      height={36}
                      className="object-contain p-1"
                    />
                  ) : (
                    <span className="text-base">🧴</span>
                  )}
                </div>
                {/* Remove button: always visible on mobile, hover on desktop */}
                <button
                  onClick={() => onRemove(`${p.brandSlug}/${p.slug}`)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ink-800 text-white flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove ${p.productName}`}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            {/* Empty slots — hide on very small screens */}
            {Array.from({ length: Math.max(0, 2 - products.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="hidden sm:flex w-11 h-11 rounded-xl border-2 border-dashed border-ink-200 items-center justify-center flex-shrink-0"
              >
                <span className="text-ink-300 text-base">+</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onClearAll}
            className="text-sm text-ink-400 hover:text-ink-700 transition-colors whitespace-nowrap"
            style={{ minHeight: 44, padding: "0 4px" }}
          >
            Clear
          </button>
          <button
            onClick={handleCompare}
            disabled={products.length < 2}
            className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 disabled:bg-ink-200 disabled:text-ink-400 text-white text-sm font-medium px-4 rounded-xl transition-colors whitespace-nowrap"
            style={{ minHeight: 44 }}
          >
            <GitCompare size={14} />
            <span className="hidden sm:inline">Compare now</span>
            <span className="sm:hidden">Compare</span>
          </button>
        </div>
      </div>
    </div>
  );
}
