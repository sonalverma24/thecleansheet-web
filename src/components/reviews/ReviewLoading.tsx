"use client";

/* ────────────────────────────────────────────────────────────────
   Serum-dropper loading state.
   Shown instantly (via route loading.tsx) while a stored review is
   fetched on the server, so mobile users get immediate feedback that
   something is happening instead of a frozen tap.
──────────────────────────────────────────────────────────────── */

import { useEffect, useState } from "react";

const TEAL = "#248179";
const TEAL_LIGHT = "#4fb3a6";
const CORAL = "#fd6158";
const INK = "#282828";
const CREAM = "#fcf9f8";

const SUBLINES = [
  "Reading every ingredient in the formula",
  "Checking each claim against real evidence",
  "Cross-checking India regulations",
  "Writing your verdict",
];

export function ReviewLoading() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SUBLINES.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center text-center px-6"
      style={{ minHeight: "70vh", background: CREAM }}
      role="status"
      aria-live="polite"
      aria-label="Loading the product review"
    >
      <style>{`
        @keyframes tcs-fill  { from { transform: translateY(140px); } to { transform: translateY(21px); } }
        @keyframes tcs-bob   { 0%,100% { transform: translateY(21px); } 50% { transform: translateY(14px); } }
        @keyframes tcs-drip  {
          0%   { transform: translateY(0)   scale(0.6); opacity: 0; }
          15%  { transform: translateY(0)   scale(1);   opacity: 1; }
          100% { transform: translateY(46px) scale(0.8); opacity: 0; }
        }
        @keyframes tcs-bar {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        .tcs-liquid { animation: tcs-fill 1.4s cubic-bezier(0.22,1,0.36,1) both, tcs-bob 2.6s ease-in-out 1.4s infinite; }
        .tcs-drip-a { animation: tcs-drip 1.5s ease-in infinite; }
        .tcs-drip-b { animation: tcs-drip 1.5s ease-in 0.75s infinite; }
        .tcs-bar    { animation: tcs-bar 1.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .tcs-liquid { animation: tcs-fill 0.6s ease-out both; }
          .tcs-drip-a, .tcs-drip-b, .tcs-bar { animation: none; }
        }
      `}</style>

      <svg width="132" height="208" viewBox="0 0 140 220" fill="none" aria-hidden>
        <defs>
          <linearGradient id="tcs-serum" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TEAL_LIGHT} />
            <stop offset="100%" stopColor={TEAL} />
          </linearGradient>
          {/* Interior of the glass column + tip, used to clip the liquid */}
          <clipPath id="tcs-tube">
            <path d="M64 64 H76 V180 L70 196 L64 180 Z" />
          </clipPath>
        </defs>

        {/* Rubber squeeze bulb */}
        <rect x="49" y="8" width="42" height="44" rx="16" fill={TEAL} />
        <rect x="61" y="47" width="18" height="12" rx="3" fill={TEAL} opacity="0.9" />
        {/* Glass collar */}
        <rect x="56" y="57" width="28" height="8" rx="3" fill="#e7e0dc" />

        {/* Liquid (clipped to the glass interior) */}
        <g clipPath="url(#tcs-tube)">
          <g className="tcs-liquid">
            <rect x="60" y="60" width="20" height="150" fill="url(#tcs-serum)" />
            <ellipse cx="70" cy="60" rx="10" ry="3" fill={TEAL_LIGHT} opacity="0.7" />
          </g>
        </g>

        {/* Glass outline over the liquid */}
        <path
          d="M64 64 H76 V180 L70 196 L64 180 Z"
          fill="none"
          stroke="rgba(40,40,40,0.22)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Highlight streak on the glass */}
        <rect x="66" y="70" width="2.5" height="96" rx="1.25" fill="#fff" opacity="0.5" />

        {/* Falling serum drops from the tip */}
        <path className="tcs-drip-a" d="M70 198 c 3 4 3 7 0 7 c -3 0 -3 -3 0 -7 Z" fill={CORAL} />
        <path className="tcs-drip-b" d="M70 198 c 3 4 3 7 0 7 c -3 0 -3 -3 0 -7 Z" fill={TEAL} />
      </svg>

      <h1
        className="font-display mt-8 text-[22px] sm:text-[26px] leading-snug"
        style={{ color: INK, maxWidth: 420 }}
      >
        Getting you a comprehensive review of the product
      </h1>

      <p
        className="mt-3 text-[14px] sm:text-[15px] transition-opacity duration-300"
        style={{ color: "#6b6764", minHeight: 22 }}
      >
        {SUBLINES[idx]}…
      </p>

      {/* Indeterminate progress bar */}
      <div
        className="mt-6 overflow-hidden rounded-full"
        style={{ width: 180, height: 3, background: "rgba(40,40,40,0.10)" }}
      >
        <div
          className="tcs-bar h-full rounded-full"
          style={{ width: "40%", background: TEAL }}
        />
      </div>
    </div>
  );
}
