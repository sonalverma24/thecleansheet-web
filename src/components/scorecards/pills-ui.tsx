/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Pill UI pieces shared by the top of the pills page and its body

   Display only. Every value here (the pill, the confidence) is handed in from the page model (src/lib/pills-page.ts, built from the decision
   core). Nothing in this file decides, scores or looks anything up.
──────────────────────────────────────────────────────────────── */

import type { CSSProperties, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, HelpCircle, Pill, XCircle } from "lucide-react";
import type { PillsPageModel, PillTone } from "@/lib/pills-page";
import { PILL_COLOURS, type PillColours } from "./pill-palette";
import "./pills-badge.css";
import "./pills-page.css";

/** The five pills. Colour never carries the pill alone: every one has its own icon and its words. The colours are in pill-palette.ts (plain data,
    so a listing card can use them too); this adds each pill's icon. */
export interface PillPalette extends PillColours { Icon: typeof CheckCircle2 }
export const PILL: Record<PillTone, PillPalette> = {
  good: { ...PILL_COLOURS.good, Icon: CheckCircle2 },
  caution: { ...PILL_COLOURS.caution, Icon: AlertTriangle },
  look: { ...PILL_COLOURS.look, Icon: XCircle },
  info: { ...PILL_COLOURS.info, Icon: HelpCircle },
  med: { ...PILL_COLOURS.med, Icon: Pill },
};

type Confidence = PillsPageModel["take"]["confidence"];
const onOf = (level: Confidence["level"]): number => (level === "high" ? 3 : level === "medium" ? 2 : 1);

/** Three segments that fill with the confidence, and the words. The segments are decoration; the words say it. */
export function ConfidenceMeter({ level, label }: { level: Confidence["level"]; label: string }) {
  const on = onOf(level);
  return (
    <span className="cs-conf">
      <span aria-hidden className="cs-conf__bars">
        {[0, 1, 2].map((i) => <span key={i} className="cs-conf__bar" data-on={i < on ? "true" : undefined} />)}
      </span>
      <span className="cs-conf__text">Confidence: {label}</span>
    </span>
  );
}

/** The take: the pill with its confidence. The ring's three arcs fill with the confidence, the icon sits in the middle. With no confidence (the layout-only
    mode, which shows today's standing) the ring is whole and there is no meter: nothing is said about how sure we are. */
export function PillTake({ tone, label, confidence, className }: { tone: PillTone; label: string; confidence: Confidence | null; className?: string }) {
  const p = PILL[tone];
  const on = confidence ? onOf(confidence.level) : 3;
  const vars = {
    "--cs-ink": p.ink, "--cs-ring": p.ring, "--cs-off": p.off, "--cs-soft": p.soft, "--cs-line": p.line,
    "--cs-eyebrow": p.eyebrow, "--cs-meter": p.meter, "--cs-shadow": p.shadow,
  } as CSSProperties;
  return (
    <aside aria-label="The Clean Sheet take" className={`cs-verdict-wrap${className ? ` ${className}` : ""}`}>
      <div className="cs-verdict cs-shine" style={vars}>
        <span aria-hidden className="cs-verdict__ring">
          <svg viewBox="0 0 84 84">
            <g fill="none" strokeWidth="7" strokeLinecap="round">
              {[-84, 36, 156].map((rotation, i) => (
                <circle key={rotation} cx="42" cy="42" r="35" stroke={i < on ? p.ring : p.off} strokeDasharray="62 158" transform={`rotate(${rotation} 42 42)`} />
              ))}
            </g>
            {/* The icon lives in the ring's own coordinates (the design's: a 24 box at 30,30 of 84), so it is always the same share of the ring and scales with it. */}
            <p.Icon x={31} y={31} size={22} strokeWidth={1.9} />
          </svg>
        </span>
        <span className="cs-verdict__body">
          <span className="cs-verdict__eyebrow">The Clean Sheet take</span>
          <span className="cs-verdict__label">{label}</span>
          {confidence && <ConfidenceMeter level={confidence.level} label={confidence.label} />}
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
