"use client";

import Image from "next/image";
import { useState } from "react";
import { fullSizeProductPhoto } from "@/lib/product-photo";

/** Retry the saved image directly if resizing or optimisation fails. */
export function AnalysisProductImage({ src, alt }: { src: string; alt: string }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const [directFailed, setDirectFailed] = useState<string | null>(null);
  const direct = failedSource === src;
  if (!src || directFailed === src) return (
    <span role="img" aria-label={`Photo unavailable: ${alt}`} className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center text-xs text-[#55504d]">
      <span aria-hidden className="text-2xl">🧴</span>Photo unavailable
    </span>
  );
  return <Image src={direct ? src : fullSizeProductPhoto(src)} alt={alt} fill
    sizes="(max-width: 639px) 104px, 144px" className="object-contain p-1.5" priority
    unoptimized={direct} onError={() => direct ? setDirectFailed(src) : setFailedSource(src)} />;
}
