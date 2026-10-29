/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · The rating circle

   A rating is a coloured circle and nothing else: green, yellow, red, or grey when we could not rate the product. No label, no verdict word. A screen reader
   says only the colour ("Rating: green"), unless it sits beside its own name (`decorative`). Pure; no hooks, so a listing card (a client component) can use it. The colours are in pill-palette.ts.
──────────────────────────────────────────────────────────────── */

import { MARKER_COLOURS, NEUTRAL_COLOURS, ratingName, type MarkerName } from "./pill-palette";

export function RatingDot({ marker, size = 16, className, decorative = false }: { marker: MarkerName | null; size?: number; className?: string; decorative?: boolean }) {
  const c = marker ? MARKER_COLOURS[marker] : NEUTRAL_COLOURS;
  return (
    <span
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": `Rating: ${ratingName(marker)}` })}
      data-marker={marker ?? "none"}
      className={`inline-block flex-none rounded-full${className ? ` ${className}` : ""}`}
      style={{ width: size, height: size, background: c.ring, boxShadow: `0 0 0 ${Math.max(2, Math.round(size / 5))}px ${c.off}` }}
    />
  );
}
