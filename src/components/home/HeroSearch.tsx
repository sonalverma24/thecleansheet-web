"use client";

import { useState } from "react";
import ReviewRunStatus from "@/components/scorecards/ReviewRunStatus";
import { useReviewRunner } from "@/components/scorecards/useReviewRunner";

/* The hero search: runs the review right here and opens the product's review page,
   with no page in between. On a phone it stacks (input, then a full-width button). */

export default function HeroSearch({ stacked = false }: { /** Keep the phone layout (input, then a full-width button) at every width, for narrow cards. */ stacked?: boolean }) {
  const { state, run, busy } = useReviewRunner();
  const [query, setQuery] = useState("");

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          void run(query);
        }}
        className={`flex flex-col gap-2.5 ${stacked ? "" : "md:flex-row md:items-center md:gap-3 md:border md:border-[#248179] md:rounded-[14px] md:py-2 md:pl-[18px] md:pr-2 md:max-w-[540px] md:bg-white"}`}
      >
        <div className={`flex items-center gap-2.5 h-[52px] px-3.5 border border-[#248179] rounded-[14px] bg-white ${stacked ? "" : "md:flex-1 md:h-auto md:border-0 md:rounded-none md:px-0 md:bg-transparent"}`}>
          <span aria-hidden className="text-[#248179] text-[18px]">⌕</span>
          <input
            name="q"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={busy}
            aria-label="Search a product or paste a product link"
            placeholder="Search a product or paste a product link"
            className="flex-1 min-w-0 border-0 outline-none text-[16px] md:text-[15px] text-[#282828] bg-transparent placeholder:text-[#b0a8a4] disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={busy || !query.trim()}
          className={`h-[52px] w-full rounded-lg bg-[#248179] hover:bg-[#1d6b64] active:scale-[0.98] disabled:opacity-60 text-white text-[15px] font-bold whitespace-nowrap transition-[background-color,transform] ${stacked ? "" : "md:text-[14px] md:w-auto md:h-auto md:px-[18px] md:py-3"}`}
        >
          {busy ? "Analysing…" : "Check the evidence"}
        </button>
      </form>
      <ReviewRunStatus
        state={state}
        onPick={(name) => {
          setQuery(name);
          void run(name);
        }}
      />
    </div>
  );
}
