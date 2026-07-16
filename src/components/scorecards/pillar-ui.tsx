/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Shared pillar UI primitives
   Extracted from the brand product page so live reviews render in
   the exact same visual language. Qualitative only — no numerics.
──────────────────────────────────────────────────────────────── */

export function pillarColor(pct: number) {
  return pct >= 90 ? "#248179" : pct >= 75 ? "#3b82f6" : pct >= 60 ? "#f59e0b" : "#fd6158";
}

export function pillarNameColor(pct: number) {
  return pct >= 90 ? "#0f766e" : pct >= 75 ? "#1d4ed8" : pct >= 60 ? "#b45309" : "#dc2626";
}

export function pillarRatingLabel(pct: number) {
  return pct >= 90 ? "Excellent" : pct >= 75 ? "Strong" : pct >= 60 ? "Good" : pct >= 45 ? "Fair" : "Concern";
}

export function PillarDots({ score, max }: { score: number; max: number }) {
  const pct = score / max;
  const filled = Math.round(pct * 4);
  const dotColor = pct >= 0.8 ? "#248179" : pct >= 0.55 ? "#D4A843" : "#fd6158";
  return (
    <div className="flex items-center gap-[6px] flex-shrink-0">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="block w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: i < filled ? dotColor : "#E4E2E0" }}
        />
      ))}
    </div>
  );
}

/* ─── Tier badge (replaces every numeric score) ─── */

import type { ReviewTier } from "@/lib/product-review-types";

export const TIER_STYLES: Record<ReviewTier, { label: string; bg: string; fg: string; border: string }> = {
  "approved":     { label: "Clean Sheet Approved", bg: "rgba(210,255,52,0.16)", fg: "#3f6212", border: "#a3c614" },
  "mostly-clean": { label: "Mostly Clean",         bg: "rgba(36,129,121,0.10)", fg: "#248179", border: "rgba(36,129,121,0.35)" },
  "needs-proof":  { label: "Needs Proof",          bg: "rgba(201,162,39,0.12)", fg: "#8a6d14", border: "rgba(201,162,39,0.45)" },
  "misleading":   { label: "Misleading Claims",    bg: "rgba(253,97,88,0.10)",  fg: "#c2362f", border: "rgba(253,97,88,0.4)" },
};

export function scoreToTier(score: number): ReviewTier {
  return score >= 75 ? "approved" : score >= 60 ? "mostly-clean" : "needs-proof";
}

/* Tile corner mark: Approved products carry the official branded seal;
   other tiers show the compact pill so cautions stay visible. */
export function TileTierMark({ tier }: { tier: ReviewTier }) {
  if (tier === "approved") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/images/Logos/Approved Logo for website.png"
        alt="Clean Sheet Approved"
        width={52}
        height={52}
        className="w-[52px] h-[52px] object-contain drop-shadow-md"
      />
    );
  }
  return (
    <span
      className="inline-block rounded-full"
      style={{ background: "rgba(255,255,255,0.96)", padding: "2px 3px", boxShadow: "0 1px 6px rgba(0,0,0,0.10)", lineHeight: 1 }}
    >
      <TierBadge tier={tier} size="sm" />
    </span>
  );
}

export function TierBadge({ tier, size = "md" }: { tier: ReviewTier; size?: "sm" | "md" | "lg" }) {
  const t = TIER_STYLES[tier];
  const cls =
    size === "lg" ? "text-[13px] px-4 py-2" : size === "sm" ? "text-[10px] px-2 py-0.5" : "text-[11px] px-3 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${cls}`}
      style={{ background: t.bg, color: t.fg, border: `1px solid ${t.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: t.fg }} />
      {t.label}
    </span>
  );
}
