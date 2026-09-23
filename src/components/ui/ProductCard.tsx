import React from 'react';
import { Pill } from './Pill';
import { ClaimCheckMeter } from '@/components/scorecards/ClaimCheckMeter';
import { scoreToTier } from '@/components/scorecards/pillar-ui';

interface ProductCardProps {
  brand: string;
  name: string;
  category: string;
  score: number; // 0-100
  imageUrl: string;
  pills: string[];
  hasExternalLinks: boolean;
}

export function ProductCard({ brand, name, category, score, imageUrl, pills, hasExternalLinks }: ProductCardProps) {
  return (
    <div className="flex flex-col border border-[var(--color-warm-gray)] bg-white h-full">
      {/* Image Area */}
      <div className="relative aspect-square p-4 flex items-center justify-center border-b border-[var(--color-surface-subtle)]">
        <img src={imageUrl} alt={name} className="object-contain w-full h-full" />

        {/* Claim check meter - bottom edge of the square */}
        <ClaimCheckMeter score={score} tier={scoreToTier(score)} />

        {/* External Link Indicator */}
        {hasExternalLinks && (
          <div className="absolute top-4 left-4 bg-white/90 px-2 py-1 text-[10px] uppercase tracking-widest border border-[var(--color-warm-gray)]">
            Buy via Retailer
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1 gap-4">
        <div>
          <div className="text-[12px] tracking-[0.08em] uppercase text-[var(--color-warm-gray)] mb-1">{brand}</div>
          <h3 className="font-display text-xl leading-tight mb-2">{name}</h3>
          <div className="text-[14px] text-[var(--color-charcoal)]">{category}</div>
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          {pills.slice(0, 2).map((pill, idx) => (
            <Pill key={idx} active={false} className="text-[10px] min-h-[28px] md:min-h-[28px] px-3">{pill}</Pill>
          ))}
        </div>
      </div>
    </div>
  );
}
