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
  return score >= 85 ? "approved" : score >= 65 ? "mostly-clean" : "needs-proof";
}

/* The TCS logo with an angled "APPROVED" rubber stamp across its lower third —
   overflowing the edge, never hiding the wordmark. Scales from tile corners
   (54px) to the product-page hero (120px+). */
export function ApprovedStamp({ size = 54, animate = false }: { size?: number; animate?: boolean }) {
  const s = size / 54; // proportional scale from the tile design
  return (
    <span
      className="relative inline-block"
      style={{ width: size, height: size, ...(animate ? { animation: "tcs-stamp 0.8s cubic-bezier(0.34, 1.4, 0.64, 1) 0.35s both" } : {}) }}
      aria-label="Clean Sheet Approved"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="object-cover rounded-full shadow-md bg-white"
      />
      <span
        className="absolute uppercase select-none"
        style={{
          bottom: 7 * s,
          left: -9 * s,
          transform: "rotate(-9deg)",
          fontSize: 8.5 * s,
          fontWeight: 800,
          letterSpacing: "0.12em",
          lineHeight: 1,
          color: "#1d6a5f",
          background: "rgba(255,255,255,0.94)",
          border: `${Math.max(1.5 * s, 1.5)}px solid #1d6a5f`,
          borderRadius: 3 * s,
          padding: `${2.5 * s}px ${5 * s}px`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.14)",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        Approved
      </span>
    </span>
  );
}

/* The rubber-stamp band on its own — same ink-stamp language as the "APPROVED"
   mark, but without the TCS logo disc. Used for Mostly Clean / Needs Proof /
   Misleading so every tier reads as one consistent stamp family. */
export function TierStamp({ tier, size = 116, animate = false }: { tier: Exclude<ReviewTier, "approved">; size?: number; animate?: boolean }) {
  const t = TIER_STYLES[tier];
  const s = size / 116;
  const words = t.label.replace(/^Clean Sheet\s+/i, "").toUpperCase().split(" ");
  return (
    <span
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size, ...(animate ? { animation: "tcs-stamp 0.8s cubic-bezier(0.34, 1.4, 0.64, 1) 0.35s both" } : {}) }}
      aria-label={t.label}
    >
      <span
        className="uppercase text-center select-none"
        style={{
          transform: "rotate(-8deg)",
          color: t.fg,
          background: "rgba(255,255,255,0.94)",
          border: `${Math.max(3 * s, 2)}px solid ${t.fg}`,
          borderRadius: 9 * s,
          padding: `${9 * s}px ${15 * s}px`,
          fontSize: 18 * s,
          fontWeight: 800,
          letterSpacing: "0.06em",
          lineHeight: 1.04,
          boxShadow: "0 4px 14px rgba(0,0,0,0.13)",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        {words.map((w) => (
          <span key={w} className="block">{w}</span>
        ))}
      </span>
    </span>
  );
}

/* Tile corner mark: Approved products carry the stamped logo;
   other tiers show the compact pill so cautions stay visible. */
export function TileTierMark({ tier }: { tier: ReviewTier }) {
  if (tier === "approved") return <ApprovedStamp size={54} />;
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
