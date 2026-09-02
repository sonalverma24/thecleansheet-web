"use client";

/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ — Motion primitives
   Quiet, purposeful animation. 0.5–0.9s, one easing curve,
   nothing decorative. Used across home, review, reads, about,
   certification so the whole site moves as one product.
──────────────────────────────────────────────────────────────── */

import {
  Children, cloneElement, isValidElement, useEffect, useRef, useState,
  type ReactNode, type CSSProperties,
} from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const EASE = [0.25, 0.1, 0.25, 1] as const;
const REVEAL_TRANSITION = "opacity 0.6s var(--ease-smooth), transform 0.6s var(--ease-smooth)";

/* Resilient scroll-reveal core.

   Content is VISIBLE by default — on the server, on first paint, and if
   JavaScript never runs. Only after mount, and only for elements that are still
   below the fold, do we hide-then-reveal them on scroll (an invisible swap,
   since below-fold content isn't on screen yet). This means a slow bundle,
   a hydration hiccup, a misfiring observer, or reduced-motion can never leave
   content stranded at opacity 0 — the failure mode is "shown", not "blank". */
function useReveal(disabled = false) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (disabled) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    if (inView) return; // already on screen: leave it shown, don't replay

    setShown(false); // below the fold: hide now (nothing visible flashes) …
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) { setShown(true); io.disconnect(); }
      },
      { rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [disabled]);

  return { ref, shown };
}

function revealStyle(shown: boolean, y: number, delay: number, style?: CSSProperties): CSSProperties {
  return {
    ...style,
    transition: REVEAL_TRANSITION,
    transitionDelay: delay ? `${delay}s` : undefined,
    opacity: shown ? 1 : 0,
    transform: shown ? undefined : `translateY(${y}px)`,
    willChange: "opacity, transform",
  };
}

/* Fade-rise on scroll into view */
export function Reveal({
  children, delay = 0, y = 24, className, style,
}: { children: ReactNode; delay?: number; y?: number; className?: string; style?: CSSProperties }) {
  const { ref, shown } = useReveal();
  return (
    <div ref={ref} className={className} style={revealStyle(shown, y, delay, style)}>
      {children}
    </div>
  );
}

/* Fade-rise on mount (fires on load, not scroll) — for above-the-fold hero
   content that must never sit stuck at opacity 0 on mobile.

   Driven by a CSS animation (not the JS motion engine) so it is painted and
   animated straight from the server-rendered markup: if hydration is slow,
   blocked, or never happens, the content still ends fully visible instead of
   stranded at opacity 0. `y` is kept in the signature for call-site
   compatibility; the CSS keyframe supplies the rise. */
export function HeroReveal({
  children, delay = 0, className,
}: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <div
      className={`animate-fade-up ${className ?? ""}`}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

/* Stagger container + items. The container observes itself; when it enters view
   its Items reveal in sequence (delay = index × gap). Same visible-by-default
   guarantee as Reveal — the whole group is painted unless/until JS decides to
   sequence it in from below the fold. */
export function Stagger({
  children, className, gap = 0.09,
}: { children: ReactNode; className?: string; gap?: number }) {
  const { ref, shown } = useReveal();
  let i = 0;
  const mapped = Children.map(children, (child) => {
    if (isValidElement(child) && child.type === Item) {
      const idx = i++;
      return cloneElement(child as React.ReactElement<ItemProps>, { _shown: shown, _delay: idx * gap });
    }
    return child;
  });
  return (
    <div ref={ref} className={className}>
      {mapped}
    </div>
  );
}

interface ItemProps {
  children: ReactNode; className?: string; style?: CSSProperties; y?: number;
  /** Injected by Stagger. When present, the parent controls reveal timing. */
  _shown?: boolean; _delay?: number;
}

export function Item({ children, className, style, y = 24, _shown, _delay = 0 }: ItemProps) {
  const controlled = _shown !== undefined;
  const { ref, shown: selfShown } = useReveal(controlled);
  const shown = controlled ? (_shown as boolean) : selfShown;
  return (
    <div ref={ref} className={className} style={revealStyle(shown, y, _delay, style)}>
      {children}
    </div>
  );
}

/* Masked line-by-line headline reveal (on load).
   CSS-driven for the same reason as HeroReveal: an above-the-fold headline must
   never be left translated out of its overflow-hidden mask if the JS motion
   engine is slow or absent. The keyframe ends at translateY(0), so with or
   without hydration each line settles fully in view. */
export function TitleReveal({
  lines, className, delay = 0.1,
}: { lines: string[]; className?: string; delay?: number }) {
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <span
            className="block animate-title-rise"
            style={{ animationDelay: `${delay + i * 0.13}s` }}
          >
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}

/* Subtle scroll parallax */
export function Parallax({
  children, offset = 36, className,
}: { children: ReactNode; offset?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/* Slow settle-in for hero imagery */
export function KenBurns({
  src, alt = "", className, imgClassName = "",
}: { src: string; alt?: string; className?: string; imgClassName?: string }) {
  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <motion.img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${imgClassName}`}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.6, ease: EASE }}
      />
    </div>
  );
}

/* Infinite ticker — the lab-ledger strip */
export function Marquee({
  items, className, itemClassName = "", duration = 46,
}: { items: string[]; className?: string; itemClassName?: string; duration?: number }) {
  const row = (
    <span className={`inline-block ${itemClassName}`}>
      {items.map((it) => (
        <span key={it} className="inline-block">
          {it}
          <span className="inline-block px-6" aria-hidden>·</span>
        </span>
      ))}
    </span>
  );
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className ?? ""}`} aria-hidden>
      <motion.div
        className="inline-block"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        {row}
        {row}
      </motion.div>
    </div>
  );
}
