'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface ScorecardTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

/* Mobile-only profile-style tabs for the verdict page.
   A sticky segmented rail + horizontally-swipeable panels, so the long
   scorecard becomes a few short screens (Overview · Ingredients · Claims ·
   Method). Tap a tab OR swipe left/right. Desktop never renders this — the
   caller shows the full stacked layout there instead.

   Panels are kept mounted (translated in a flex track) so switching is instant
   and in-tab scroll position is preserved. */
export function ScorecardTabs({
  tabs,
  className = '',
}: {
  tabs: ScorecardTab[];
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const go = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(tabs.length - 1, i));
      setActive(next);
      // Keep the active tab chip in view on the rail
      tabRefs.current[next]?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
      // Jump back to the top of the panel region on tab change
      window.scrollTo({ top: 0, behavior: 'auto' });
    },
    [tabs.length, reduced],
  );

  // ── Swipe detection ────────────────────────────────────────────────────────
  const touch = useRef<{ x: number; y: number; horizontal: boolean | null }>({ x: 0, y: 0, horizontal: null });
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, horizontal: null };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touch.current.horizontal !== null) return;
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - touch.current.x);
    const dy = Math.abs(t.clientY - touch.current.y);
    if (dx > 10 || dy > 10) touch.current.horizontal = dx > dy;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current.horizontal) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const THRESHOLD = 45;
    if (dx <= -THRESHOLD) go(active + 1);
    else if (dx >= THRESHOLD) go(active - 1);
  };

  return (
    <div className={className}>
      {/* Sticky segmented rail */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#efe9e0]">
        <div
          ref={railRef}
          role="tablist"
          aria-label="Scorecard sections"
          className="no-scrollbar flex gap-1 overflow-x-auto px-3"
        >
          {tabs.map((tab, i) => {
            const on = i === active;
            return (
              <button
                key={tab.id}
                ref={(el) => { tabRefs.current[i] = el; }}
                role="tab"
                aria-selected={on}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => go(i)}
                className="relative flex-shrink-0 px-4 py-3 text-[13px] whitespace-nowrap transition-colors"
                style={{
                  color: on ? '#248179' : '#8a827d',
                  fontWeight: on ? 600 : 400,
                }}
              >
                {tab.label}
                <span
                  className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full transition-opacity"
                  style={{ background: '#248179', opacity: on ? 1 : 0 }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Swipeable panel track */}
      <div className="overflow-hidden" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <div
          className="flex items-start"
          style={{
            transform: `translateX(-${active * 100}%)`,
            transition: reduced ? 'none' : 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {tabs.map((tab, i) => (
            <div
              key={tab.id}
              role="tabpanel"
              id={`panel-${tab.id}`}
              aria-labelledby={`tab-${tab.id}`}
              aria-hidden={i !== active}
              className="w-full flex-shrink-0 px-5 py-6"
              style={{ minWidth: '100%' }}
            >
              <div className="space-y-6">{tab.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
