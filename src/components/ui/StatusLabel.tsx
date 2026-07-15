import React from 'react';

interface StatusLabelProps {
  label: string;
  status: 'verified' | 'warning' | 'neutral';
}

export function StatusLabel({ label, status }: StatusLabelProps) {
  const getStatusColor = () => {
    switch(status) {
      case 'verified': return 'bg-[var(--color-primary)]';
      case 'warning': return 'bg-[var(--color-coral)]';
      case 'neutral': return 'bg-[var(--color-warm-gray)]';
      default: return 'bg-[var(--color-warm-gray)]';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-[6px] h-[6px] rounded-full ${getStatusColor()}`} />
      <span className="text-[12px] tracking-[0.08em] uppercase text-[var(--color-charcoal)]">{label}</span>
    </div>
  );
}
