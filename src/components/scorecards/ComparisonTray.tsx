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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
        {/* Selected products */}
        <div className="flex items-center gap-3 flex-1 overflow-x-auto">
          <span className="text-xs text-ink-500 whitespace-nowrap flex-shrink-0">
            Comparing {products.length}/4
          </span>
          <div className="flex items-center gap-2">
            {products.map((p) => (
              <div
                key={`${p.brandSlug}/${p.slug}`}
                className="relative flex-shrink-0 group"
              >
                <div className="w-12 h-12 rounded-xl bg-ink-50 border border-ink-100 overflow-hidden flex items-center justify-center">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.productName}
                      width={40}
                      height={40}
                      className="object-contain p-1"
                    />
                  ) : (
                    <span className="text-lg">🧴</span>
                  )}
                </div>
                <button
                  onClick={() => onRemove(`${p.brandSlug}/${p.slug}`)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-ink-800 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove ${p.productName}`}
                >
                  <X size={9} />
                </button>
                <p className="text-[9px] text-ink-500 text-center mt-0.5 w-12 truncate">
                  {p.productName.split(" ").slice(0, 2).join(" ")}
                </p>
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 2 - products.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-12 h-12 rounded-xl border-2 border-dashed border-ink-200 flex items-center justify-center flex-shrink-0"
              >
                <span className="text-ink-300 text-lg">+</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onClearAll}
            className="text-xs text-ink-400 hover:text-ink-700 transition-colors whitespace-nowrap"
          >
            Clear
          </button>
          <button
            onClick={handleCompare}
            disabled={products.length < 2}
            className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 disabled:bg-ink-200 disabled:text-ink-400 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          >
            <GitCompare size={13} />
            Compare now
          </button>
        </div>
      </div>
    </div>
  );
}
