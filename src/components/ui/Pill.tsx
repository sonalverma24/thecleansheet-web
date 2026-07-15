import React from 'react';

interface PillProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Pill({ children, active, onClick, className = '' }: PillProps) {
  return (
    <button
      onClick={onClick}
      className={`min-h-[32px] md:min-h-[36px] rounded-full px-4 text-[14px] tracking-[0.05em] uppercase border transition-colors flex items-center justify-center whitespace-nowrap ${className}
        ${active 
          ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' 
          : 'bg-white border-[var(--color-warm-gray)] text-[var(--color-charcoal)] hover:border-[var(--color-primary)]'
        }
      `}
    >
      <span className="truncate">{children}</span>
    </button>
  );
}
