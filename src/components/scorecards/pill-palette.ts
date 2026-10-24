/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · The three colour markers

   Everything the page rates or badges is one of three colours: green, yellow or red. A marker is never alone: it always sits beside its words (and, for
   a pill, its icon), so a reader who cannot tell the colours apart loses nothing. There is no fourth colour; plain grey is the absence of a marker, not a
   marker: it is what "no data" wears, and what the two pills that give no verdict wear (Not enough info and Medicinal product).

   Plain data, no React and no icons, so a listing card (a client component) can use it without pulling in the page's styles. `ink` is the label, `ring`
   the filled arcs of the take, `off` the empty ones, `soft` and `line` the card (and, on a listing card, the pill's fill and edge), `eyebrow` and
   `meter` the small print, `shadow` the lift under the take. The same values are written in pills-page.css for the small markers; markers.test.tsx
   fails if the two drift. Display only.
──────────────────────────────────────────────────────────────── */

export type MarkerName = "green" | "yellow" | "red";

/** The five pills keep their own names, icons and meanings; only their colour is one of the three. */
export type PillToneName = "good" | "caution" | "look" | "info" | "med";

export interface PillColours { ink: string; ring: string; off: string; soft: string; line: string; eyebrow: string; meter: string; shadow: string }

export const MARKER_COLOURS: Record<MarkerName, PillColours> = {
  green: { ink: "#256b3e", ring: "#2f8a52", off: "#cde6d5", soft: "#f2f9f4", line: "#cde6d5", eyebrow: "#3d6b4b", meter: "#2a5039", shadow: "rgba(37, 107, 62, 0.5)" },
  yellow: { ink: "#7a5c0f", ring: "#d9a514", off: "#f1e4b8", soft: "#fdf9e9", line: "#eddfa9", eyebrow: "#6b5a2a", meter: "#5a4b1e", shadow: "rgba(154, 115, 10, 0.5)" },
  red: { ink: "#a3302a", ring: "#b83f37", off: "#f0cfcb", soft: "#fcf1ef", line: "#f0cfcb", eyebrow: "#7a3b36", meter: "#6b2f2a", shadow: "rgba(163, 48, 42, 0.5)" },
};

/** Plain grey: no marker. Not enough info and Medicinal product give no verdict on the product, so they are not coloured as one (the owner's call, X46). */
export const NEUTRAL_COLOURS: PillColours = { ink: "#57534e", ring: "#6f6a66", off: "#e1ddd8", soft: "#f6f4f1", line: "#e1ddd8", eyebrow: "#6b6560", meter: "#4a4745", shadow: "rgba(87, 83, 78, 0.45)" };

/** Which marker each pill wears, or null for grey. Good choice is green, Buy with caution yellow and Look elsewhere red; Not enough info and Medicinal product are grey. */
export const MARKER_OF_PILL: Record<PillToneName, MarkerName | null> = { good: "green", caution: "yellow", look: "red", info: null, med: null };

const coloursOf = (tone: PillToneName): PillColours => {
  const marker = MARKER_OF_PILL[tone];
  return marker ? MARKER_COLOURS[marker] : NEUTRAL_COLOURS;
};

export const PILL_COLOURS: Record<PillToneName, PillColours> = {
  good: coloursOf("good"), caution: coloursOf("caution"), look: coloursOf("look"), info: coloursOf("info"), med: coloursOf("med"),
};

/** Today's four standings, for a product that has no stored review (the static catalogue), as the same circle: Good Standing green, Room to Improve yellow,
    Not Recommended red, a Licensed Drug grey. */
export type TierName = "approved" | "mostly-clean" | "can-do-better" | "not-recommended" | "not-assessed";
export const MARKER_OF_TIER: Record<TierName, MarkerName | null> = { approved: "green", "mostly-clean": "green", "can-do-better": "yellow", "not-recommended": "red", "not-assessed": null };

/** The name a screen reader says for a circle. Never a verdict word: only the colour. */
export const ratingName = (marker: MarkerName | null): "green" | "yellow" | "red" | "grey" => marker ?? "grey";

/** The words beside a marker on a row of the detail (never the colour alone). */
export const MARKER_WORD: Record<MarkerName, string> = { green: "Strong", yellow: "Fair", red: "Concern" };
