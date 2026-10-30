"use client";

import { useState } from "react";

/* A brand's logo in a square tile, on the directory card and at the top of the brand's profile. When a brand has no logo on file, or its logo fails to
   load (a brand's own site moved or blocks outside use), the tile shows the brand's initials instead, so a card never has a broken picture or a gap. */

const SKIP = new Set(["the", "a", "an", "of", "by", "and", "&"]);

/** One or two capital letters for a brand's name: "Clean & Conscious Care" gives "CC", "Pond's" gives "P", "The Derma Co" gives "DC". */
export function brandInitials(name: string): string {
  const words = name.normalize("NFKD").replace(/[̀-ͯ]/g, "").split(/[\s\-_/]+/).map((w) => w.replace(/[^A-Za-z0-9]/g, "")).filter((w) => w && !SKIP.has(w.toLowerCase()));
  const letters = words.slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  return letters || "?";
}

export default function BrandLogo({ name, logoUrl, size = 48 }: { name: string; logoUrl: string | null; size?: number }) {
  const [failed, setFailed] = useState(false);

  // An image can fail before this component has hydrated, and React then never sees the error event: look at the finished image as it is attached.
  const check = (el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  };

  const box = { width: size, height: size, borderRadius: Math.round(size / 4) };
  if (!logoUrl || failed) {
    return (
      <span aria-hidden className="flex-none inline-flex items-center justify-center border border-[#e5dfd6] bg-[#f1ece3] font-bold text-[#4a4a4a] select-none" style={{ ...box, fontSize: Math.round(size * 0.34), letterSpacing: "0.02em" }}>
        {brandInitials(name)}
      </span>
    );
  }
  return (
    <span aria-hidden className="flex-none inline-flex items-center justify-center overflow-hidden border border-[#e5dfd6] bg-white" style={box}>
      {/* A plain img on purpose: the logo is the brand's own file, shown as it is, and a failed load falls back to the initials above. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={check} src={logoUrl} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="max-h-full max-w-full object-contain" style={{ padding: Math.round(size / 8) }} />
    </span>
  );
}
