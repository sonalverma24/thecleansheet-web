"use client";
import { scoreColors } from "@/data/brands";

interface ScoreRingProps {
  score: number;
  size?: number;
}

export function ScoreRing({ score, size = 56 }: ScoreRingProps) {
  const sw = Math.max(4, Math.round(size * 0.09));
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const c = scoreColors(score);
  const fontSize = Math.round(size * 0.26);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={`Score: ${score}/100`}
        role="img"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={sw}
        />
        {/* Filled arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={c.ring}
          strokeWidth={sw}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Score label */}
        <text
          x={size / 2}
          y={size / 2 + fontSize * 0.38}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight={700}
          fill={c.ring}
          fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
        >
          {score}
        </text>
      </svg>
    </div>
  );
}
