"use client";

/* ────────────────────────────────────────────────────────────────
   /verified — the public Verified Products registry
   Every product that scored 75+ in a full Clean Sheet review,
   with exact usage guidance. Publicly accessible, always.
──────────────────────────────────────────────────────────────── */

import { useEffect, useState } from "react";
import Link from "next/link";
import { VerifiedList } from "@/components/VerifiedList";
import { Reveal, TitleReveal } from "@/components/motion/Motion";
import type { VerifiedProduct } from "@/lib/types";

const INK = "#282828";
const CREAM = "#fcf9f8";
const LIME = "#d2ff34";
const WARM = "#b0a8a4";

export default function VerifiedPage() {
  const [products, setProducts] = useState<VerifiedProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/verified-products")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d?.products)) setProducts(d.products); })
      .catch(() => { /* empty state renders */ })
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div style={{ background: INK, minHeight: "70vh" }}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-20 md:py-28">
        <Reveal>
          <p className="text-[12px] uppercase" style={{ letterSpacing: "0.14em", color: LIME }}>
            Verified products
          </p>
        </Reveal>
        <h1 className="font-display mt-6 text-[40px] md:text-[56px] leading-[1.1] tracking-[-0.02em] max-w-3xl" style={{ color: CREAM }}>
          <TitleReveal lines={["Reviewed. Proven.", "Recommended."]} />
        </h1>
        <Reveal delay={0.3}>
          <p className="mt-6 text-[17px] leading-[1.7] max-w-xl" style={{ color: WARM }}>
            Every product here cleared The Clean Sheet bar: the claim check and the
            six-pillar deep scan. Open one for exact usage guidance: how long,
            how often, and what to pair it with.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-14">
          {loaded && <VerifiedList products={products} />}
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <Link
            href="/review"
            className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-[15px] hover:opacity-90 transition-opacity"
            style={{ background: LIME, color: INK }}
          >
            Review a product <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
