"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

type CertField = { label: string; value: string; mono?: boolean };

export default function CollapsibleCert({ certFields }: { certFields: CertField[] }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="px-5 pb-10 border-b border-ink-100">
      <div className="max-w-5xl mx-auto">

        {/* Toggle header */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between py-3 border-b group transition-colors duration-200"
          style={{ borderColor: open ? "#c2e8e4" : "#EEEDED" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] tracking-[0.15em] uppercase font-medium transition-colors duration-200"
              style={{ color: open ? "#248179" : "#6b7280" }}
            >
              {open ? "Collapse record" : "View full record"}
            </span>
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full transition-all duration-200"
              style={{
                background: open ? "rgba(36,129,121,0.08)" : "rgb(243,244,246)",
                color: open ? "#248179" : "#6b7280",
              }}
            >
              {certFields.length + 1} fields
            </span>
          </div>
          <ChevronDown
            size={12}
            className="transition-all duration-300 group-hover:text-ink-600"
            style={{
              color: open ? "#248179" : "#9ca3af",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>

        {/* Collapsible rows */}
        <div
          className="grid"
          style={{
            gridTemplateRows: open ? "1fr" : "0fr",
            transition: "grid-template-rows 0.3s ease",
          }}
        >
          <div className="overflow-hidden">
            <div>
              {certFields.map(({ label, value, mono }, i) => (
                <ScrollReveal key={label} delay={i * 40} className="border-b border-ink-100 group">
                  <div className="flex items-baseline gap-6 sm:gap-16 py-3 transition-colors group-hover:bg-teal-50/30">
                    <p className="text-[9px] tracking-[0.18em] uppercase text-ink-400 w-32 sm:w-44 flex-shrink-0">
                      {label}
                    </p>
                    <p
                      className="flex-1 text-sm text-ink-900"
                      style={{
                        fontFamily: mono ? "var(--font-mono)" : "inherit",
                        letterSpacing: mono ? "0.03em" : "inherit",
                        fontSize: mono ? "0.8rem" : "0.875rem",
                      }}
                    >
                      {value}
                    </p>
                  </div>
                </ScrollReveal>
              ))}

              {/* Status row */}
              <ScrollReveal delay={certFields.length * 40} className="border-b border-ink-100 group">
                <div className="flex items-baseline gap-6 sm:gap-16 py-3 transition-colors group-hover:bg-teal-50/30">
                  <p className="text-[9px] tracking-[0.18em] uppercase text-ink-400 w-32 sm:w-44 flex-shrink-0">
                    Status
                  </p>
                  <p className="flex-1 text-sm text-ink-900 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0 animate-pulse" />
                    Active
                  </p>
                </div>
              </ScrollReveal>

              {/* Change history */}
              <ScrollReveal delay={80} className="mt-5 pt-4 border-t border-ink-100">
                <p className="text-[9px] tracking-[0.2em] uppercase text-ink-300 mb-3">Change history</p>
                <div className="flex items-start gap-6">
                  <span
                    className="text-[10px] text-ink-300 flex-shrink-0 w-24 pt-0.5"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    15 May 2026
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-0.5 rounded-full">
                      Certification issued
                    </span>
                    <span className="text-[10px] text-ink-500">Initial certification granted [SAMPLE]</span>
                  </div>
                </div>
                <div className="flex items-start gap-6 mt-2.5">
                  <span className="text-[10px] text-ink-200 flex-shrink-0 w-24" />
                  <span className="text-[12px] text-ink-400">No changes recorded since initial certification [SAMPLE]</span>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
