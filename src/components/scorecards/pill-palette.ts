/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · The colours of the five pills

   Plain data, no React and no icons, so a listing card (a client component) can use it without pulling in the page's styles. `caution` is the
   design's own gold; the others are the same recipe in the brand teal, a muted red, slate and warm grey. `ink` is the label, `ring` the filled
   arcs of the take, `off` the empty ones, `soft` and `line` the card (and, on a listing card, the pill's fill and edge), `eyebrow` and `meter` the
   small print, `shadow` the lift under the take. Display only.
──────────────────────────────────────────────────────────────── */

export type PillToneName = "good" | "caution" | "look" | "info" | "med";

export interface PillColours { ink: string; ring: string; off: string; soft: string; line: string; eyebrow: string; meter: string; shadow: string }

export const PILL_COLOURS: Record<PillToneName, PillColours> = {
  good: { ink: "#1f6f68", ring: "#248179", off: "#cfe6e2", soft: "#f3f9f8", line: "#cfe6e2", eyebrow: "#3d6b66", meter: "#2c504c", shadow: "rgba(31, 111, 104, 0.5)" },
  caution: { ink: "#7a5c0f", ring: "#a87d0e", off: "#e8ddba", soft: "#fcf8ec", line: "#e9ddb5", eyebrow: "#6b5a2a", meter: "#5a4b1e", shadow: "rgba(122, 92, 15, 0.55)" },
  look: { ink: "#a3302a", ring: "#b83f37", off: "#f0cfcb", soft: "#fcf1ef", line: "#f0cfcb", eyebrow: "#7a3b36", meter: "#6b2f2a", shadow: "rgba(163, 48, 42, 0.5)" },
  info: { ink: "#3d4a5e", ring: "#5a6b84", off: "#d5dae3", soft: "#f4f6f9", line: "#d5dae3", eyebrow: "#55627a", meter: "#3b4558", shadow: "rgba(61, 74, 94, 0.5)" },
  med: { ink: "#57534e", ring: "#6f6a66", off: "#e1ddd8", soft: "#f6f4f1", line: "#e1ddd8", eyebrow: "#6b6560", meter: "#4a4745", shadow: "rgba(87, 83, 78, 0.45)" },
};
