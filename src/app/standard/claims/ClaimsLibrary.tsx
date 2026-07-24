"use client";

import { useMemo, useState } from "react";
import { CLAIMS, CLAIM_GROUPS, type Claim } from "@/data/standard";

const INK = "#282828";
const HAIR = "rgba(40,40,40,0.12)";

const FP_STYLE: Record<Claim["finishedProduct"], { bg: string; fg: string; label: string }> = {
  Yes: { bg: "#dcfce7", fg: "#166534", label: "Needs proof from the finished product" },
  No: { bg: "#eef0ee", fg: "#4a4848", label: "Needs paperwork and supply-chain proof" },
  Depends: { bg: "#fef3c7", fg: "#92620a", label: "Depends on the exact wording" },
  Prohibited: { bg: "#fee3e1", fg: "#b02a22", label: "Not allowed, never certified" },
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-2.5" style={{ borderTop: `1px solid ${HAIR}` }}>
      <p className="text-[11px] uppercase text-[var(--color-warm-gray)]" style={{ letterSpacing: "0.07em" }}>{label}</p>
      <p className="mt-1 text-[14px] leading-[1.6] text-[var(--color-charcoal)]/90">{children}</p>
    </div>
  );
}

export default function ClaimsLibrary() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<string>("All");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return CLAIMS.filter((c) => {
      if (group !== "All" && c.group !== group) return false;
      if (!s) return true;
      return [c.claim, c.communicates, c.minEvidence, c.doesNotQualify, c.acceptableWording].join(" ").toLowerCase().includes(s);
    });
  }, [q, group]);

  return (
    <div>
      {/* Controls */}
      <div className="sticky top-[64px] z-10 bg-white/95 backdrop-blur-sm py-4 -mx-4 px-4 md:mx-0 md:px-0">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search claims, like clinically proven, fragrance-free, recyclable…"
          className="w-full md:max-w-lg rounded-full border px-5 py-3 text-[15px] focus-ring outline-none"
          style={{ borderColor: HAIR, color: INK }}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {["All", ...CLAIM_GROUPS].map((g) => {
            const active = group === g;
            return (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className="text-[12px] px-3.5 py-1.5 rounded-full transition-colors"
                style={{
                  background: active ? "var(--color-primary)" : "#f4f3f2",
                  color: active ? "#fff" : "#5f5d5d",
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-[13px] text-[var(--color-warm-gray)]">{rows.length} of {CLAIMS.length} claims</p>

      {/* Cards */}
      <div className="mt-4 grid md:grid-cols-2 gap-5">
        {rows.map((c) => {
          const fp = FP_STYLE[c.finishedProduct];
          const prohibited = c.finishedProduct === "Prohibited";
          return (
            <div
              key={c.id}
              className="rounded-2xl p-5 md:p-6"
              style={{ border: `1px solid ${prohibited ? "#f6c9c5" : HAIR}`, background: prohibited ? "#fff7f6" : "#fff" }}
            >
              <div className="flex items-center gap-2 pb-1">
                <span className="font-mono text-[11px] text-[var(--color-warm-gray)]">{c.id}</span>
                <span className="text-[11px] text-[var(--color-warm-gray)]">· {c.group}</span>
              </div>
              <h3 className="font-display text-[22px] leading-tight text-[var(--color-charcoal)]">“{c.claim}”</h3>
              <span className="mt-3 inline-block text-[11px] px-2.5 py-1 rounded-full" style={{ background: fp.bg, color: fp.fg }}>{fp.label}</span>

              <p className="mt-4 text-[14px] leading-[1.65] text-[var(--color-charcoal)]/90">{c.communicates}</p>

              <div className="mt-3">
                <Field label="Evidence we need">{c.minEvidence}</Field>
                <Field label="What doesn’t count">{c.doesNotQualify}</Field>
                <Field label={prohibited ? "Use this instead" : "Wording that’s allowed"}>{c.acceptableWording}</Field>
                <Field label="What we publish if it checks out">{c.published}</Field>
              </div>
            </div>
          );
        })}
      </div>

      {rows.length === 0 && (
        <p className="mt-10 text-center text-[15px] text-[var(--color-warm-gray)]">No claims match your search.</p>
      )}
    </div>
  );
}
