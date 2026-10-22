"use client";

import { Children, useRef, useState, type ReactNode } from "react";

/* A row of cards that swipes sideways on a phone (each card snaps into place, with a
   dot under the row showing which one you are on) and becomes a grid from tablet up.
   Give each child `flex-none w-[85%] snap-start md:w-auto`. */

export default function SwipeRow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = Children.count(children);

  const onScroll = () => {
    const el = ref.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const step = first.offsetWidth + 14;
    setIndex(Math.min(count - 1, Math.max(0, Math.round(el.scrollLeft / step))));
  };

  return (
    <>
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-px-5 no-scrollbar -mx-5 px-5 pb-1 md:mx-0 md:px-0 md:pb-0 md:overflow-visible md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3"
      >
        {children}
      </div>
      <div aria-hidden className="md:hidden flex justify-center gap-1.5">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className={`h-1 rounded-sm transition-all duration-200 ${i === index ? "w-[18px] bg-[#282828]" : "w-1.5 bg-[#d9d3d0]"}`} />
        ))}
      </div>
    </>
  );
}
