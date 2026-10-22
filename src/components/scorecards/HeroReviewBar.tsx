"use client";

/* ───────────────────────────────────────────────────────
   Hero review bar for /brands.
   Reviews ANY product, not just the ones already scored: it runs the review
   right here and opens the product's review page when it is ready (existing
   reviews open instantly). There is no page in between.
─────────────────────────────────────────────────────── */

import { useState } from "react";
import ReviewRunStatus from "./ReviewRunStatus";
import { useReviewRunner } from "./useReviewRunner";

const SUGGESTIONS = [
  "La Roche-Posay Mela B3 Serum",
  "Minimalist 10% Niacinamide Serum",
];

export function HeroReviewBar() {
  const { state, run, busy } = useReviewRunner();
  const [query, setQuery] = useState("");

  const review = (q?: string) => {
    const text = (q ?? query).trim();
    if (!text) return;
    void run(text);
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
          disabled={busy}
          placeholder="Paste any product name or link to review it"
          className="flex-1 rounded-full px-5 py-3.5 text-[16px] sm:text-[15px] text-[#282828] bg-white outline-none placeholder:text-[#b0a8a4] focus:ring-2 focus:ring-teal-400 disabled:opacity-70"
        />
        <button
          onClick={() => review()}
          disabled={busy || !query.trim()}
          className="rounded-full px-7 py-3.5 text-[15px] text-white bg-[#fd6158] hover:bg-[#e8564e] transition-all duration-200 disabled:opacity-50"
        >
          {busy ? "Reviewing…" : "Review"}
        </button>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            disabled={busy}
            onClick={() => { setQuery(s); review(s); }}
            className="text-[12px] px-3 py-1.5 rounded-full text-white/70 border border-white/15 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
      <ReviewRunStatus
        tone="dark"
        state={state}
        onPick={(name) => { setQuery(name); review(name); }}
      />
    </div>
  );
}
