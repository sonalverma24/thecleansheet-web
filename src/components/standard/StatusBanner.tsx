import { FRAMEWORK } from "@/data/standard";

/* ────────────────────────────────────────────────────────────────
   FRAMEWORK NOTE · a calm, confident line for the Standard pages.
   Names the standard and carries the one honest disclosure
   (voluntary private scheme, not accredited). No version hedging.
──────────────────────────────────────────────────────────────── */

export default function StatusBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-2xl px-5 py-4 md:px-7 md:py-5" style={{ background: "#fff", border: "1px solid rgba(40,40,40,0.12)" }}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span
          className="text-[11px] uppercase px-2.5 py-1 rounded-full"
          style={{ letterSpacing: "0.1em", background: "#248179", color: "#fff" }}
        >
          {FRAMEWORK.name}
        </span>
        <span className="text-[13px] md:text-[14px] text-[var(--color-charcoal)]">
          {FRAMEWORK.edition} edition
        </span>
      </div>
      {!compact && (
        <p className="mt-2.5 text-[13px] leading-[1.65] text-[var(--color-charcoal)]/75">
          {FRAMEWORK.banner}
        </p>
      )}
    </div>
  );
}
