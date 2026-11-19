"use client";

// Animated article blocks in the "lab bench" look: graphite panels, one mint accent.
// Every block renders its final state for reduced-motion users and before hydration,
// so nothing depends on animation to be readable (or indexed).

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useInView, useReducedMotion, animate } from "framer-motion";

const MINT = "rgb(120,240,205)";
const BENCH = "bg-[linear-gradient(160deg,#0b0d0f_0%,#1a1f24_55%,#2a3036_100%)]";

// False on the server and during hydration; true once running in the browser. Elements are only
// hidden (waiting to animate) when armed, off screen, and motion is allowed.
const noopSubscribe = () => () => {};
function useArmed() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

// ─── Looping microscope video ────────────────────────────────────────────────
// Silent, autoplays only while on screen; reduced-motion users get the poster and controls.
// An optional portrait cut (mobileSrc) is shown below the `sm` breakpoint so on-screen labels stay legible.
function AutoVideo({ src, poster, label, className }: { src: string; poster: string; label: string; className: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const v = ref.current;
    if (!v || reduce) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduce]);
  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      controls={!!reduce}
      aria-label={label}
    />
  );
}

export function LoopVideo({ src, poster, mobileSrc, mobilePoster, label, caption }: { src: string; poster: string; mobileSrc?: string; mobilePoster?: string; label: string; caption?: string }) {
  return (
    <figure className="my-12 -mx-4 sm:mx-0">
      {mobileSrc && mobilePoster && (
        <div className={`sm:hidden relative w-full aspect-[4/5] overflow-hidden ${BENCH}`}>
          <AutoVideo src={mobileSrc} poster={mobilePoster} label={label} className="absolute inset-0 h-full w-full object-cover" />
        </div>
      )}
      <div className={`${mobileSrc ? "hidden sm:block " : ""}relative w-full aspect-[16/9] overflow-hidden sm:rounded-2xl ${BENCH} shadow-xl shadow-ink-950/10`}>
        <AutoVideo src={src} poster={poster} label={label} className="absolute inset-0 h-full w-full object-cover" />
      </div>
      {caption && (
        <figcaption className="mt-3 px-4 sm:px-0 text-sm text-ink-400 text-center italic leading-relaxed">{caption}</figcaption>
      )}
    </figure>
  );
}

// ─── Counting statistics ────────────────────────────────────────────────────
export type StatItem = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Shown instead of the counted number once it lands (e.g. a range). */
  display?: string;
  label: string;
};

function CountUp({ item, run }: { item: StatItem; run: boolean }) {
  const reduce = useReducedMotion();
  const armed = useArmed();
  const d = item.decimals ?? 0;
  const fmt = (v: number) => `${item.prefix ?? ""}${v.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d })}${item.suffix ?? ""}`;
  const final = item.display ?? fmt(item.value);
  const [v, setV] = useState<number | null>(null);      // set only from the animation's callbacks
  const [done, setDone] = useState(false);
  const animating = armed && !reduce;
  useEffect(() => {
    if (!animating || !run) return;
    const c = animate(0, item.value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (x) => setV(x),
      onComplete: () => setDone(true),
    });
    return () => c.stop();
  }, [animating, run, item.value]);
  if (!animating || done) return <>{final}</>;
  return <>{fmt(v ?? 0)}</>;
}

export function StatRow({ items, source }: { items: StatItem[]; source?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const wait = useArmed() && !inView && !reduce;
  return (
    <div ref={ref} className={`my-10 -mx-4 sm:mx-0 sm:rounded-2xl ${BENCH} px-5 py-7 sm:p-8`}>
      <div className={`grid gap-6 ${items.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {items.map((it, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={wait ? { opacity: 0.001, y: 12 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduce ? 0 : i * 0.15 }}
            className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-5"
          >
            <div className="font-light tabular-nums leading-none text-5xl sm:text-[3.4rem] tracking-tight" style={{ color: MINT }}>
              <CountUp item={it} run={inView} />
            </div>
            <p className="mt-3 text-[0.95rem] leading-snug text-white/75">{it.label}</p>
          </motion.div>
        ))}
      </div>
      {source && <p className="mt-5 text-xs font-mono tracking-tight text-white/45">{source}</p>}
    </div>
  );
}

// ─── Bar chart that draws itself ─────────────────────────────────────────────
export function BarChart({ title, rows, source, unit = "%" }: { title: string; rows: { label: string; value: number }[]; source?: string; unit?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const wait = useArmed() && !inView && !reduce;
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <figure ref={ref} className={`my-10 -mx-4 sm:mx-0 sm:rounded-2xl ${BENCH} px-5 py-7 sm:p-8`}>
      <figcaption className="text-white font-medium text-lg mb-6">{title}</figcaption>
      <ul className="space-y-4">
        {rows.map((r, i) => (
          <li key={r.label}>
            <div className="flex items-baseline justify-between gap-4 mb-1.5">
              <span className="text-white/80 text-[0.95rem]">{r.label}</span>
              <span className="tabular-nums font-light text-2xl" style={{ color: MINT }}>
                <CountUp item={{ value: r.value, decimals: r.value % 1 ? 1 : 0, suffix: unit, label: r.label }} run={inView} />
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-white/[0.07] overflow-hidden">
              <motion.div
                className="h-full rounded-full origin-left"
                style={{ background: MINT, width: `${(r.value / max) * 100}%` }}
                initial={false}
                animate={{ scaleX: wait ? 0 : 1 }}
                transition={{ duration: 1.1, delay: reduce ? 0 : 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </li>
        ))}
      </ul>
      {source && <p className="mt-6 text-xs font-mono tracking-tight text-white/45">{source}</p>}
    </figure>
  );
}

// ─── Steps that reveal as you scroll, with a mint line drawing down ──────────
function Step({ n, title, text, last }: { n: number; title: string; text: string[]; last: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const on = !(useArmed() && !inView && !reduce);
  return (
    <li ref={ref} className="relative pl-14 pb-8 last:pb-0">
      {!last && (
        <span className="absolute left-[19px] top-10 bottom-0 w-px bg-teal-100" aria-hidden>
          <motion.span
            className="absolute inset-0 origin-top bg-teal-500"
            initial={false}
            animate={{ scaleY: on ? 1 : 0 }}
            transition={{ duration: 0.8, delay: reduce ? 0 : 0.25, ease: "easeOut" }}
          />
        </span>
      )}
      <motion.span
        className="absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm border"
        initial={false}
        animate={on ? { backgroundColor: "#0d9488", color: "#ffffff", borderColor: "#0d9488", scale: 1 } : { backgroundColor: "#ffffff", color: "#0f766e", borderColor: "#99f6e4", scale: 0.85 }}
        transition={{ duration: 0.4 }}
      >
        {n}
      </motion.span>
      <motion.div
        initial={false}
        animate={on ? { opacity: 1, x: 0 } : { opacity: 0.35, x: 8 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-medium text-ink-900 pt-1.5 mb-2">{title}</h3>
        {text.map((t, i) => (
          <p key={i} className="text-ink-700 leading-relaxed text-lg mb-3 last:mb-0">{t}</p>
        ))}
      </motion.div>
    </li>
  );
}

export function Steps({ items }: { items: { title: string; text: string[] }[] }) {
  return (
    <ol className="my-10 list-none">
      {items.map((it, i) => (
        <Step key={i} n={i + 1} title={it.title} text={it.text} last={i === items.length - 1} />
      ))}
    </ol>
  );
}
