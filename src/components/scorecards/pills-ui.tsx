/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Pill UI pieces shared by the top of the pills page and its body

   Display only. The rating colour is handed in from the page model (src/lib/pills-page.ts, built from the decision core). Nothing in this file decides,
   scores or looks anything up.
──────────────────────────────────────────────────────────────── */

import type { CSSProperties, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { MARKER_COLOURS, NEUTRAL_COLOURS, ratingKeyOf, type MarkerName } from "./pill-palette";
import { RatingDot } from "./RatingDot";
import "./pills-badge.css";
import "./pills-page.css";

/** The take: one rating circle (green, yellow, red, or grey when we could not rate it), its colour's name and what that colour means, in the owner's words
    (RATING_KEY). No pill name, no old standing and no confidence meter: the colour is the whole of the decision. A screen reader hears the colour once, from
    the circle. */
export function PillTake({ marker, className }: { marker: MarkerName | null; className?: string }) {
  const p = marker ? MARKER_COLOURS[marker] : NEUTRAL_COLOURS;
  const vars = { "--cs-ink": p.ink, "--cs-soft": p.soft, "--cs-line": p.line, "--cs-eyebrow": p.eyebrow, "--cs-shadow": p.shadow } as CSSProperties;
  const rating = ratingKeyOf(marker);
  return (
    <aside aria-label="The Clean Sheet rating" className={`cs-verdict-wrap${className ? ` ${className}` : ""}`}>
      <div className="cs-verdict cs-shine" style={vars} data-marker={marker ?? "none"}>
        <RatingDot marker={marker} size={34} className="cs-verdict__dot" />
        <span className="cs-verdict__body">
          <span className="cs-verdict__eyebrow">The Clean Sheet rating</span>
          <span aria-hidden className="cs-verdict__name">{rating.name}</span>
          <span className="cs-verdict__key">{rating.meaning}</span>
        </span>
      </div>
    </aside>
  );
}

/** The page's column: 1120px wide, 16px from the screen edge on a phone and 40px on a larger screen, as in the design. */
export const WRAP = "max-w-[1120px] mx-auto";
export function Band({ id, className = "", innerClassName = "", children }: { id?: string; className?: string; innerClassName?: string; children: ReactNode }) {
  return <section id={id} className={`px-4 sm:px-10 ${className}`}><div className={`${WRAP} ${innerClassName}`}>{children}</div></section>;
}

/** The round chevron at the end of an opening row. It turns when the <details> it sits in is open (see pills-page.css). */
export function Chev({ size = 34 }: { size?: 30 | 34 }) {
  return <span aria-hidden className="pp-chev" data-size={size}><ChevronDown size={size === 30 ? 15 : 16} strokeWidth={1.9} /></span>;
}
