"use client";

import type { ReactNode } from "react";

/** A link to a block on the page that also opens the <details> inside it, so "View all ingredients" lands on the list, not on a closed row.
    Without script it is an ordinary link to the block. */
export function OpenDetailsLink({ targetId, className, children }: { targetId: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={`#${targetId}`}
      className={className}
      onClick={() => {
        const details = document.querySelector<HTMLDetailsElement>(`#${targetId} details`);
        if (details) details.open = true;
      }}
    >
      {children}
    </a>
  );
}
