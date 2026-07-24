"use client";

import { useMemo, useState } from "react";
import { STANDARDS_REGISTER } from "@/data/standard";

const INK = "#282828";
const HAIR = "rgba(40,40,40,0.12)";

export default function RegisterTable() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return STANDARDS_REGISTER;
    return STANDARDS_REGISTER.filter((r) =>
      [r.topic, r.standard, r.scope, r.tcsUse, r.limit, r.status].join(" ").toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <div>
      {/* Search */}
      <div className="sticky top-[64px] z-10 bg-white/95 backdrop-blur-sm py-4 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search standards, methods, scope…"
            className="w-full sm:max-w-md rounded-full border px-5 py-3 text-[15px] focus-ring outline-none"
            style={{ borderColor: HAIR, color: INK }}
          />
          <p className="text-[13px] text-[var(--color-warm-gray)]">
            {rows.length} of {STANDARDS_REGISTER.length} entries
          </p>
        </div>
      </div>

      {/* Table: desktop */}
      <div className="hidden md:block mt-4">
        <div className="grid grid-cols-[1.1fr_1.3fr_1.5fr_1.4fr_100px] gap-4 px-4 py-3 text-[11px] uppercase text-[var(--color-warm-gray)]" style={{ letterSpacing: "0.08em", borderBottom: `1px solid ${INK}` }}>
          <span>Standard / rule</span>
          <span>Scope</span>
          <span>How TCS uses it</span>
          <span>Important limit</span>
          <span className="text-right">Source</span>
        </div>
        {rows.map((r) => (
          <div key={r.standard} className="grid grid-cols-[1.1fr_1.3fr_1.5fr_1.4fr_100px] gap-4 px-4 py-4 items-start" style={{ borderBottom: `1px solid ${HAIR}` }}>
            <div>
              <p className="text-[14px] font-medium text-[var(--color-charcoal)]">{r.standard}</p>
              <p className="mt-1 text-[12px] text-[var(--color-warm-gray)]">{r.topic}</p>
              <p className="mt-1.5 text-[11px] inline-block px-2 py-0.5 rounded-full" style={{ background: r.status.toLowerCase().includes("current") ? "#dcfce7" : "#fef3c7", color: r.status.toLowerCase().includes("current") ? "#166534" : "#92620a" }}>{r.status}</p>
            </div>
            <p className="text-[13px] leading-[1.6] text-[var(--color-charcoal)]/85">{r.scope}</p>
            <p className="text-[13px] leading-[1.6] text-[var(--color-charcoal)]/85">{r.tcsUse}</p>
            <p className="text-[13px] leading-[1.6]" style={{ color: "#b04a44" }}>{r.limit}</p>
            <a href={r.source} target="_blank" rel="noopener noreferrer" className="text-right text-[13px] text-[var(--color-primary)] hover:underline">Source ↗</a>
          </div>
        ))}
      </div>

      {/* Cards: mobile */}
      <div className="md:hidden mt-4 flex flex-col gap-4">
        {rows.map((r) => (
          <div key={r.standard} className="rounded-2xl p-5" style={{ border: `1px solid ${HAIR}` }}>
            <p className="text-[14px] font-medium text-[var(--color-charcoal)]">{r.standard}</p>
            <p className="mt-1 text-[12px] text-[var(--color-warm-gray)]">{r.topic}</p>
            <p className="mt-2 text-[11px] inline-block px-2 py-0.5 rounded-full" style={{ background: r.status.toLowerCase().includes("current") ? "#dcfce7" : "#fef3c7", color: r.status.toLowerCase().includes("current") ? "#166534" : "#92620a" }}>{r.status}</p>
            <p className="mt-3 text-[13px] leading-[1.6] text-[var(--color-charcoal)]/85"><span className="text-[var(--color-warm-gray)]">Scope:</span> {r.scope}</p>
            <p className="mt-2 text-[13px] leading-[1.6] text-[var(--color-charcoal)]/85"><span className="text-[var(--color-warm-gray)]">TCS use:</span> {r.tcsUse}</p>
            <p className="mt-2 text-[13px] leading-[1.6]" style={{ color: "#b04a44" }}><span className="text-[var(--color-warm-gray)]">Limit:</span> {r.limit}</p>
            <a href={r.source} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-[13px] text-[var(--color-primary)]">Official source ↗</a>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <p className="mt-10 text-center text-[15px] text-[var(--color-warm-gray)]">No entries match “{q}”.</p>
      )}
    </div>
  );
}
