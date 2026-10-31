"use client";

import type { ReactNode } from "react";

/** A link to a block on the page that also opens the <details> inside it, so "View all ingredients" lands on the list, not on a closed row.
    With `rowId` it lands on one row inside the block (an ingredient in the list), still opening the block first.
    Without script it is an ordinary link to the block (or the row). */
export function OpenDetailsLink({ targetId, rowId, className, children }: { targetId: string; rowId?: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={`#${rowId ?? targetId}`}
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
