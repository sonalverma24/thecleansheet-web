/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Claim Check Meter
   A bottom-edge meter stamped on the product image. The line fills
   left-to-right and travels the spectrum (red → orange → yellow →
   blue → green) as the claims score rises. No number is shown -
   longer and greener is always better, and two products compare at
   a glance because the spectrum is pinned to the full track width.
──────────────────────────────────────────────────────────────── */

import { TIER_STYLES } from "@/components/scorecards/pillar-ui";
import type { ReviewTier } from "@/lib/product-review-types";

const SPECTRUM =
  "linear-gradient(90deg,#E24B4A 0%,#D85A30 25%,#EFA827 50%,#378ADD 75%,#639922 100%)";

interface ClaimCheckMeterProps {
  /** 0-100 claims score driving the fill length and colour. */
  score: number;
  /** Optional tier, used only for the accessible label so no number leaks. */
  tier?: ReviewTier;
  /** Track height in px. Thinner on dense grids, chunkier on hero shots. */
  height?: number;
}

export function ClaimCheckMeter({ score, tier, height = 6 }: ClaimCheckMeterProps) {
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  const label = tier ? TIER_STYLES[tier].label : undefined;

  return (
    <div
      className="absolute left-0 right-0 bottom-0"
      style={{ height, background: "rgba(0,0,0,0.06)", zIndex: 10 }}
      role="img"
      aria-label={label ? `Claim check: ${label}` : "Claim check meter"}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          backgroundImage: SPECTRUM,
          backgroundSize: `${pct > 0 ? (100 / pct) * 100 : 100}% 100%`,
          backgroundPosition: "left center",
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}

interface ClaimCheckMeterInlineProps {
  /** 0-100 claims score driving the fill length and colour. */
  score: number;
  /** Track width in px. */
  width?: number;
  /** Track height in px. */
  height?: number;
}

/** Inline (non-overlay) variant: a small rounded bar to sit beside or below a
    tier label in comparison tables and related-product lists, where there is
    no product image to stamp on. */
export function ClaimCheckMeterInline({ score, width = 56, height = 5 }: ClaimCheckMeterInlineProps) {
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <div
      style={{ width, height, borderRadius: 999, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}
      role="img"
      aria-label="Claim check meter"
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          backgroundImage: SPECTRUM,
          backgroundSize: `${pct > 0 ? (100 / pct) * 100 : 100}% 100%`,
          backgroundPosition: "left center",
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
