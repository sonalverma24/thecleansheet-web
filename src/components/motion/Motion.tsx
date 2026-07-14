"use client";

/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ — Motion primitives
   Quiet, purposeful animation. 0.5–0.9s, one easing curve,
   nothing decorative. Used across home, review, reads, about,
   certification so the whole site moves as one product.
──────────────────────────────────────────────────────────────── */

import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const EASE = [0.25, 0.1, 0.25, 1] as const;

/* Fade-rise on scroll into view */
export function Reveal({
  children, delay = 0, y = 24, className, style,
}: { children: ReactNode; delay?: number; y?: number; className?: string; style?: CSSProperties }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* Stagger container + items */
export function Stagger({
  children, className, gap = 0.09,
}: { children: ReactNode; className?: string; gap?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function Item({
  children, className, style, y = 24,
}: { children: ReactNode; className?: string; style?: CSSProperties; y?: number }) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* Masked line-by-line headline reveal (on load) */
export function TitleReveal({
  lines, className, delay = 0.1,
}: { lines: string[]; className?: string; delay?: number }) {
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className="block"
            initial={{ y: "112%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: delay + i * 0.13, ease: EASE }}
          >
            {line}
          </motion.span>
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
