"use client";

import { REVIEW_ERROR_MESSAGE, REVIEW_STEPS } from "@/lib/review-run";
import type { ReviewRunnerState } from "./useReviewRunner";

/* Progress, "which one did you mean?" and error states for useReviewRunner.
   `tone` picks the colours: "light" for white pages, "dark" for the teal /brands hero. */

const TONES = {
  light: { text: "#282828", muted: "#4a4a4a", accent: "#248179", track: "rgba(40,40,40,0.15)", option: "border-[#e5dfd6] hover:bg-[#e3f1ef]", err: "#c23d35" },
  dark: { text: "#ffffff", muted: "rgba(255,255,255,0.7)", accent: "#72cec8", track: "rgba(255,255,255,0.2)", option: "border-white/20 hover:bg-white/10", err: "#fec4c0" },
} as const;

export default function ReviewRunStatus({
  state,
  onPick,
  tone = "light",
}: {
  state: ReviewRunnerState;
  onPick: (name: string) => void;
  tone?: keyof typeof TONES;
}) {
  const t = TONES[tone];

  if (state.phase === "running") {
    return (
      <div className="mt-4" role="status" aria-live="polite">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full animate-pulse flex-none" style={{ background: t.accent }} />
          <p className="text-[14px]" style={{ color: t.text }}>{REVIEW_STEPS[state.stepIdx]}…</p>
        </div>
        <div className="mt-3 h-[2px] w-full overflow-hidden" style={{ background: t.track }}>
          <div className="h-full transition-all duration-700" style={{ width: `${((state.stepIdx + 1) / REVIEW_STEPS.length) * 100}%`, background: t.accent }} />
        </div>
        <p className="mt-2 text-[12px]" style={{ color: t.muted }}>
          A product we haven’t reviewed yet takes about a minute. We’ll open its review as soon as it’s ready.
        </p>
      </div>
    );
  }

  if (state.phase === "disambig") {
    return (
      <div className="mt-4">
        <p className="text-[12px] uppercase tracking-[0.12em]" style={{ color: t.accent }}>Which one did you mean?</p>
        <p className="mt-1.5 text-[14px]" style={{ color: t.text }}>
          “{state.query}” matches a few products. Pick the exact one so the review uses the right ingredient list.
        </p>
        <div className="mt-3 flex flex-col gap-2 max-w-xl">
          {state.options.map((o) => (
            <button
              key={o.name}
              type="button"
              onClick={() => onPick(o.name)}
              className={`text-left rounded-xl border px-4 py-3 text-[14px] transition-colors ${t.option}`}
              style={{ color: t.text }}
            >
              {o.name} <span aria-hidden style={{ color: t.accent }}>→</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <p className="mt-4 text-[14px]" style={{ color: t.err }} role="alert">
        {REVIEW_ERROR_MESSAGE[state.error]}
      </p>
    );
  }

  return null;
}
