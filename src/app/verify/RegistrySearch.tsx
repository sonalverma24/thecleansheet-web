"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CERTIFICATES } from "@/data/certificates";

const HAIR = "rgba(40,40,40,0.12)";
const INK = "#282828";

export default function RegistrySearch() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return CERTIFICATES;
    return CERTIFICATES.filter((c) =>
      [c.productName, c.brand, c.certificateNo, c.category, c.markets.join(" ")].join(" ").toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by product, brand or certificate number…"
        className="w-full md:max-w-md rounded-full border px-5 py-3 text-[15px] focus-ring outline-none"
        style={{ borderColor: HAIR, color: INK }}
      />

      <div className="mt-6 flex flex-col gap-4">
        {rows.map((c) => (
          <Link
            key={c.certificateNo}
            href={`/verify/${c.certificateNo}`}
            className="group rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors hover:border-[var(--color-primary)]"
            style={{ border: `1px solid ${HAIR}`, background: "#fff" }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase px-2.5 py-1 rounded-full" style={{ letterSpacing: "0.06em", background: "#dcfce7", color: "#166534" }}>Certified</span>
                {c.isExample && (
                  <span className="text-[11px] uppercase px-2.5 py-1 rounded-full" style={{ letterSpacing: "0.06em", background: "#fdf4dc", color: "#a87c0a", border: "1px solid #e8c56a" }}>Example</span>
                )}
                <span className="font-mono text-[12px] text-[var(--color-warm-gray)]">{c.certificateNo}</span>
              </div>
              <p className="mt-2 text-[12px] uppercase text-[var(--color-warm-gray)]" style={{ letterSpacing: "0.06em" }}>{c.brand}</p>
              <h3 className="font-display text-[20px] leading-tight text-[var(--color-charcoal)]">{c.productName}</h3>
              <p className="mt-1 text-[13px] text-[var(--color-warm-gray)]">{c.category} · Certified for {c.markets.join(", ")}</p>
            </div>
            <span className="text-[14px] text-[var(--color-primary)] whitespace-nowrap">See the proof <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
          </Link>
        ))}
      </div>

      {rows.length === 0 && (
        <p className="mt-8 text-[15px] text-[var(--color-warm-gray)]">Nothing matches “{q}”.</p>
      )}
    </div>
  );
}
