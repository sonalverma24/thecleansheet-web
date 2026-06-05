"use client";

import { useState } from "react";

interface Props {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

const SIZES = { sm: 14, md: 20, lg: 28 };

export function StarRating({ value, onChange, size = "md", readonly = false }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;
  const px = SIZES[size];
  const interactive = !readonly && !!onChange;

  return (
    <div className="flex items-center" style={{ gap: size === "lg" ? 6 : 3 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(null)}
          className={interactive ? "cursor-pointer" : "cursor-default pointer-events-none"}
          // Ensure 44px touch targets on interactive stars
          style={{
            width: interactive ? Math.max(px + 8, 28) : px,
            height: interactive ? Math.max(px + 8, 28) : px,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            padding: 0,
          }}
          aria-label={interactive ? `${star} star${star !== 1 ? "s" : ""}` : undefined}
        >
          <svg width={px} height={px} viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M9 1.5l2.09 4.24 4.67.68-3.38 3.29.8 4.65L9 11.9l-4.18 2.46.8-4.65L2.24 6.42l4.67-.68z"
              fill={display >= star ? "#fd6158" : "#d1cac7"}
            />
          </svg>
        </button>
      ))}
    </div>
  );
}
