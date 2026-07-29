"use client";

/* ────────────────────────────────────────────────────────────────
   Hero review bar for /brands.
   Lightweight search that hands off to the /review page (via ?q=),
   which auto-runs the review on arrival. Distinct from the registry
   filter lower down: this reviews ANY product, not just the ones
   already scored.
──────────────────────────────────────────────────────────────── */

import { useState } from "react";
import { useRouter } from "next/navigation";

const SUGGESTIONS = [
  "La Roche-Posay Mela B3 Serum",
  "Minimalist 10% Niacinamide Serum",
];

export function HeroReviewBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const review = (q?: string) => {
    const text = (q ?? query).trim();
    if (!text) return;
    router.push(`/review?q=${encodeURIComponent(text)}`);
  };

  return (
    <div className="mb-1">
      <p className="text-teal-300 text-xs uppercase tracking-wider mb-2">
        Review any product
      </p>
      <div className="flex flex-col sm:flex-row gap-2.5 max-w-lg">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") review(); }}
          placeholder="Paste any product name or link to review it"
          className="flex-1 rounded-full px-5 py-3.5 text-[15px] text-[#282828] bg-white outline-none placeholder:text-[#b0a8a4] focus:ring-2 focus:ring-teal-400"
        />
        <button
          onClick={() => review()}
          disabled={!query.trim()}
          className="rounded-full px-7 py-3.5 text-[15px] text-white bg-[#fd6158] hover:bg-[#e8564e] transition-all duration-200 disabled:opacity-50"
        >
          Review
        </button>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setQuery(s); review(s); }}
            className="text-[12px] px-3 py-1.5 rounded-full text-white/70 border border-white/15 hover:bg-white/10 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
