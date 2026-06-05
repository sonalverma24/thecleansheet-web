"use client";

import type { LucideIcon } from "lucide-react";
import { BADGE_COLOR_CLASSES, type BadgeFamily } from "@/data/badges/taxonomy";

interface ScorecardBadgeProps {
  family: BadgeFamily;
  label: string;
  icon: LucideIcon;
  tooltip?: string;
  /** "sm" = compact card pill (default); "md" = slightly larger detail-page pill */
  size?: "sm" | "md";
}

export function ScorecardBadge({
  family,
  label,
  icon: Icon,
  tooltip,
  size = "sm",
}: ScorecardBadgeProps) {
  // Derive color variant from family
  const colorVariant =
    family === "caution"  ? "caution"  :
    family === "active"   ? "active"   :
    family === "free_from"? "free_from":
    family === "value"    ? "value"    :
    family === "verification" ? "verified" :
    "neutral";

  const colorClasses = BADGE_COLOR_CLASSES[colorVariant];

  const sizeClasses =
    size === "md"
      ? "text-[11px] px-2.5 py-1 gap-1.5"
      : "text-[10px] px-2 py-0.5 gap-1";

  const iconSize = size === "md" ? 11 : 10;

  return (
    <span
      title={tooltip}
      className={`inline-flex items-center rounded-full border font-normal whitespace-nowrap ${colorClasses} ${sizeClasses}`}
    >
      <Icon size={iconSize} strokeWidth={2} aria-hidden />
      {label}
    </span>
  );
}
