"use client";

import { useState } from "react";
import { ScorecardBadge } from "./ScorecardBadge";
import type { BadgeDefinition } from "@/data/badges/taxonomy";

interface BadgeGroupProps {
  title: string;
  badges: BadgeDefinition[];
  /** If set, only this many badges are shown initially; a +N chip reveals the rest. */
  maxVisible?: number;
}

export function BadgeGroup({ title, badges, maxVisible }: BadgeGroupProps) {
  const [expanded, setExpanded] = useState(false);

  if (!badges.length) return null;

  const visible =
    maxVisible && !expanded ? badges.slice(0, maxVisible) : badges;
  const hiddenCount = maxVisible ? Math.max(0, badges.length - maxVisible) : 0;

  return (
    <div>
      {title && (
        <p className="text-[10px] font-medium text-ink-400 uppercase tracking-wider mb-1.5">
          {title}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {visible.map((badge) => (
          <ScorecardBadge
            key={badge.id}
            family={badge.family}
            label={badge.label}
            icon={badge.icon}
            tooltip={badge.tooltip}
            size="md"
          />
        ))}
        {hiddenCount > 0 && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border bg-[#faf7f2] text-[#282828] border-[#e8e2d8] whitespace-nowrap hover:bg-ink-100 transition-colors"
          >
            +{hiddenCount} more
          </button>
        )}
      </div>
    </div>
  );
}
