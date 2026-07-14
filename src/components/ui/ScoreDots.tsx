import React from 'react';

interface ScoreDotsProps {
  score: number; // 1 to 4
}

export function ScoreDots({ score }: ScoreDotsProps) {
  const getColor = (isActive: boolean) => {
    if (!isActive) return 'bg-[var(--color-warm-gray)] border-[var(--color-warm-gray)]';
    if (score === 4) return 'bg-[var(--color-primary)] border-[var(--color-primary)]';
    if (score === 3 || score === 2) return 'bg-[var(--color-lime)] border-[var(--color-lime)]';
    return 'bg-[var(--color-coral)] border-[var(--color-coral)]';
  };

  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4].map((dot) => (
        <div
          key={dot}
          className={`w-2 h-2 rounded-full border ${getColor(dot <= score)}`}
        />
      ))}
    </div>
  );
}
