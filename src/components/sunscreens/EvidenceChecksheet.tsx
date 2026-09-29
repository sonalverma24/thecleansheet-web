"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, ShoppingBag, ChevronDown } from "lucide-react";
import type { SunscreenEvidenceRecord, SectionBlock } from "@/data/sunscreens/types";
import { STATUS_TONE_STYLES } from "./status";

/**
 * Whether sections should render fully open regardless of their `open`
 * attribute — true on any real desktop/tablet browser window (md and up),
 * false on a narrow phone. Defaults to true so server-rendered HTML (and a
 * no-JS reader) sees everything expanded; a mount-time media query narrows
 * it down for small screens once we're in the browser.
 */
function useAlwaysOpenSections() {
  const [alwaysOpen, setAlwaysOpen] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setAlwaysOpen(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return alwaysOpen;
}

const STAMP_BORDER: Record<string, string> = {
  partial: "#D69A1F",
  available: "var(--color-teal-600)",
  unavailable: "var(--color-coral-600)",
};

/**
 * A sidebar TOC row: a growing accent dot + a sliding highlight make it
 * obvious the row is clickable the moment the cursor lands on it, without
 * resorting to a letter code the reader has to decode first.
 */
function TocLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <a
        href={href}
        className="group relative flex items-center gap-2.5 py-1.5 pl-2.5 pr-2 -mx-2.5 rounded-lg text-ink-600 hover:text-teal-700 hover:bg-teal-50 transition-colors duration-150"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-ink-200 group-hover:bg-teal-500 group-hover:scale-125 transition-all duration-200 flex-shrink-0" />
        <span className="leading-snug">{children}</span>
      </a>
    </li>
  );
}

function Block({ block }: { block: SectionBlock }) {
  if (block.kind === "paragraph") {
    return <p className="text-sm text-ink-700 leading-relaxed">{block.text}</p>;
  }

  if (block.kind === "list") {
    return (
      <ul className="space-y-2">
        {block.items.map((item, i) => (
          <li key={i} className="text-sm text-ink-700 leading-relaxed flex gap-2.5">
            <span className="text-teal-600 mt-[3px] flex-shrink-0">&mdash;</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.kind === "kv") {
    return (
      <div className="border border-ink-100 rounded-xl overflow-hidden">
        {block.rows.map((row, i) => (
          <div
            key={row.label}
            className={`grid grid-cols-1 sm:grid-cols-[minmax(0,220px)_1fr] gap-x-6 gap-y-1 px-4 py-3 ${
              i % 2 === 1 ? "bg-ink-50/60" : "bg-white"
            } ${i > 0 ? "border-t border-ink-100" : ""}`}
          >
            <p className="text-[11px] tracking-[0.04em] uppercase text-ink-400 font-medium">{row.label}</p>
            <p className="text-sm text-ink-800 leading-relaxed">{row.value}</p>
          </div>
        ))}
      </div>
    );
  }

  /* grid */
  return (
    <div className="border border-ink-100 rounded-xl overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-[560px]">
        <thead>
          <tr className="bg-ink-950">
            {block.columns.map((col) => (
              <th
                key={col}
                className="text-left text-[10px] tracking-[0.08em] uppercase text-teal-300 font-medium px-4 py-2.5 whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 1 ? "bg-ink-50/60" : "bg-white"}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-4 py-3 align-top text-ink-800 leading-relaxed border-t border-ink-100 ${
                    ci === 0 ? "font-medium text-ink-900 whitespace-nowrap" : ""
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EvidenceChecksheet({ record }: { record: SunscreenEvidenceRecord }) {
  const tone = STATUS_TONE_STYLES[record.statusTone];
  const stampBorder = STAMP_BORDER[record.statusTone];
  const alwaysOpen = useAlwaysOpenSections();

  return (
    <div className="bg-white min-h-screen">
      {/* Registry status bar */}
      <div style={{ background: "#081918" }}>
        <div className="max-w-5xl mx-auto px-5 py-2 flex items-center justify-between">
          <span className="text-teal-600 text-[9px] tracking-[0.18em] uppercase">
            The Clean Sheet<span className="hidden sm:inline"> &middot; Public Evidence Registry</span>
          </span>
          <Link href="/sunscreens" className="text-teal-400 hover:text-white text-[10px] transition-colors">
            All sunscreen records
          </Link>
        </div>
      </div>

      {/* Hero — compact and centred on mobile, a larger side-by-side layout on desktop */}
      <section className="grain-overlay bg-teal-950 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto px-5 pt-6 pb-5 sm:pt-8 sm:pb-6 md:py-14">
          <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left gap-3 md:gap-14">
            {/* Identity */}
            <div className="min-w-0 md:flex-1 md:order-1">
              <p className="text-teal-600 text-[10px] tracking-[0.2em] uppercase mb-1.5 animate-fade-up font-medium">
                {record.brand} &middot; TCS Evidence Record
              </p>
              <h1
                className="font-medium text-white leading-[1.05] tracking-tight mb-1 animate-fade-up delay-100"
                style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}
              >
                {record.productName}
              </h1>
              <p className="text-teal-400 text-sm sm:text-base mb-2.5 animate-fade-up delay-200">{record.variant}</p>

              <div className="animate-fade-up delay-300 mb-3 flex justify-center md:justify-start">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
                  style={{ border: `1.5px solid ${stampBorder}`, background: "rgba(255,255,255,0.03)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: stampBorder }} />
                  <span className="text-xs font-medium" style={{ color: "#F3D889" }}>{record.tcsStatus}</span>
                </span>
              </div>
            </div>

            {/* Product image — desktop only here; mobile gets its own left/right row below */}
            <div className="hidden md:block flex-shrink-0 md:order-2 animate-fade-up delay-200">
              <div className="animate-float">
                <div
                  className="relative w-48 h-60 rounded-xl overflow-hidden mx-auto"
                  style={{
                    background: "linear-gradient(160deg, #0F2C2A 0%, #174039 50%, #1D5550 100%)",
                    boxShadow: "0 14px 32px -12px rgba(0,0,0,0.6)",
                  }}
                >
                  <Image
                    src={record.image}
                    alt={`${record.brand} ${record.productName}`}
                    fill
                    className="object-contain p-6"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile only — thumbnail on the left, buy links stacked on the right */}
          <div className="md:hidden flex items-center gap-4 mt-4 animate-fade-up delay-200">
            <div className="flex-shrink-0">
              <div
                className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, #0F2C2A 0%, #174039 50%, #1D5550 100%)",
                  boxShadow: "0 14px 32px -12px rgba(0,0,0,0.6)",
                }}
              >
                <Image
                  src={record.image}
                  alt={`${record.brand} ${record.productName}`}
                  fill
                  className="object-contain p-2.5"
                  unoptimized
                />
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              {record.buyLinks.map((link) => (
                <a
                  key={link.retailer}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-teal-950 bg-teal-300 hover:bg-teal-200 font-medium px-3 py-1.5 rounded-full transition-colors"
                >
                  <ShoppingBag size={11} className="flex-shrink-0" />
                  {link.retailer}
                </a>
              ))}
            </div>
          </div>

          {/* Buy links — desktop only, horizontal row under the text */}
          <div className="hidden md:flex gap-2 mt-6 animate-fade-up delay-400 justify-start">
            {record.buyLinks.map((link) => (
              <a
                key={link.retailer}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1.5 text-xs text-teal-950 bg-teal-300 hover:bg-teal-200 font-medium px-3.5 py-2 rounded-full transition-colors flex-shrink-0 whitespace-nowrap"
              >
                <ShoppingBag size={11} />
                {link.retailer}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Hero stats */}
      <section className="bg-white border-b border-ink-100 px-5 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-5">The numbers that hold up</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-100 rounded-2xl overflow-hidden">
            {record.heroStats.map(({ value, unit, label, context }) => (
              <div key={label} className="bg-white px-4 py-5 sm:px-6 sm:py-7">
                <div className="mb-2 leading-none">
                  <span className="font-medium text-ink-950" style={{ fontSize: "clamp(1.7rem, 4.5vw, 2.8rem)" }}>
                    {value}
                  </span>
                  <span className="text-teal-600 text-sm ml-1.5 align-middle">{unit}</span>
                </div>
                <p className="text-ink-800 text-sm font-medium mb-1">{label}</p>
                <p className="text-ink-400 text-xs leading-relaxed">{context}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-5 py-8 sm:py-12 flex flex-col md:flex-row gap-10">
        {/* Table of contents — desktop only, plain-English titles with a reactive hover state */}
        <nav className="hidden md:block md:w-56 flex-shrink-0">
          <div className="md:sticky md:top-6">
            <p className="text-[10px] tracking-[0.14em] uppercase text-ink-400 mb-3">On this record</p>
            <ul className="text-sm">
              <TocLink href="#summary">Consumer summary</TocLink>
              {record.sections.map((s) => (
                <TocLink key={s.id} href={`#section-${s.id}`}>
                  {s.title.replace(/^[A-Z]\d*\.\s*/, "")}
                </TocLink>
              ))}
            </ul>
          </div>
        </nav>

        {/* Body — a one-line-per-section accordion on mobile, a flowing document on desktop */}
        <div className="flex-1 min-w-0 space-y-0 md:space-y-14">
          {/* T. Consumer facing summary — open by default, it's the TL;DR */}
          <AccordionSection anchorId="summary" letter="T" title="Consumer facing summary" defaultOpen alwaysOpen={alwaysOpen}>
            <p className="text-sm text-ink-800 leading-relaxed mb-4">
              <span className="font-semibold">TCS status: {record.tcsStatus}.</span> {record.statusSummary}
            </p>
            <Block block={{ kind: "kv", rows: record.summary }} />
          </AccordionSection>

          {/* Lettered sections */}
          {record.sections.map((section) => (
            <AccordionSection
              key={section.id}
              anchorId={`section-${section.id}`}
              letter={section.id}
              title={section.title}
              alwaysOpen={alwaysOpen}
            >
              <div className="space-y-4">
                {section.blocks.map((block, i) => (
                  <Block block={block} key={i} />
                ))}
              </div>
            </AccordionSection>
          ))}

          {/* S. Overall status, restated as a stamp */}
          <AccordionSection anchorId="section-S" letter="S" title="Overall TCS status" alwaysOpen={alwaysOpen}>
            <div
              className="rounded-xl px-5 py-4 inline-block"
              style={{ border: `1.5px solid ${stampBorder}`, background: tone.bg }}
            >
              <p className="text-base font-semibold" style={{ color: tone.text }}>{record.overallStatus}</p>
            </div>
          </AccordionSection>
        </div>
      </div>

      {/* Cross link to the scored review, and footer disclosure */}
      <section className="bg-ink-950 px-5 py-12">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-teal-600 text-[10px] tracking-[0.2em] uppercase mb-2">Related</p>
            <p className="text-white text-sm max-w-md leading-relaxed">
              This evidence record audits public claims. For the full 5-pillar ingredient safety scorecard on this
              product, see the brand review.
            </p>
          </div>
          {record.brandProductSlug && (
            <Link
              href={`/brands/${record.brandSlug}/${record.brandProductSlug}`}
              className="inline-flex items-center gap-1.5 text-teal-950 bg-teal-300 hover:bg-teal-200 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors flex-shrink-0"
            >
              View scorecard <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      </section>

      {/* Brand outreach line */}
      <section className="bg-white border-t border-ink-100 px-5 py-8">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-ink-500 text-xs leading-relaxed">
            Want to verify your sunscreen to The Clean Sheet&rsquo;s standard? Reach out:{" "}
            <a href="mailto:hello@thecleansheet.in" className="text-teal-700 hover:text-teal-900 font-medium">
              hello@thecleansheet.in
            </a>
            {" "}&middot;{" "}
            <a
              href="https://instagram.com/thecleansheet.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 hover:text-teal-900 font-medium"
            >
              Instagram
            </a>
            {" "}&middot;{" "}
            <a
              href="https://www.linkedin.com/company/thecleansheet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 hover:text-teal-900 font-medium"
            >
              LinkedIn
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

/**
 * One record section. Below the `md` breakpoint (narrow phones) this is a
 * native <details> accordion — closed by default, tap the title to open it —
 * so the record reads as a compact one-line-per-section list instead of a
 * long scroll. From `md` up (768px+, any real desktop or tablet browser
 * window, not just wide ones) `alwaysOpen` is true, which genuinely sets the
 * `open` attribute rather than fighting the browser's rendering of a closed
 * <details> with CSS — a closed <details>' children are unpaintable no
 * matter what display value they compute to, so this has to be the real DOM
 * state, not an override. The `key` forces a clean remount whenever
 * `alwaysOpen` flips (e.g. the window crosses the breakpoint), and the
 * summary's click is swallowed while alwaysOpen so a stray click never
 * collapses a section that's meant to stay open. The letter id (T, A, B1…)
 * is md-and-up only, since on a narrow phone it reads as unexplained noise
 * next to the plain-English title.
 */
function AccordionSection({
  anchorId,
  letter,
  title,
  defaultOpen = false,
  alwaysOpen,
  children,
}: {
  anchorId: string;
  letter: string;
  title: string;
  defaultOpen?: boolean;
  alwaysOpen: boolean;
  children: ReactNode;
}) {
  const displayTitle = title.replace(/^[A-Z]\d*\.\s*/, "");
  const open = alwaysOpen || defaultOpen;
  return (
    <details
      key={alwaysOpen ? "open" : "closed"}
      id={anchorId}
      open={open}
      className="group scroll-mt-16 border-b border-ink-100 md:border-0"
    >
      <summary
        onClick={(e) => {
          if (alwaysOpen) e.preventDefault();
        }}
        className="flex items-start justify-between gap-3 py-3.5 md:py-0 md:mb-4 md:pb-2 md:border-b md:border-ink-100 cursor-pointer md:cursor-default list-none [&::-webkit-details-marker]:hidden"
      >
        <span className="flex items-baseline gap-3 min-w-0">
          <span className="hidden md:inline font-display text-teal-600 flex-shrink-0" style={{ fontSize: "1.1rem" }}>
            {letter}
          </span>
          <span className="font-display text-ink-950 tracking-tight" style={{ fontSize: "1.1rem" }}>
            {displayTitle}
          </span>
        </span>
        <ChevronDown size={18} className="text-ink-400 flex-shrink-0 mt-0.5 transition-transform duration-200 group-open:rotate-180 md:hidden" />
      </summary>
      <div className="pb-4 md:pb-0">{children}</div>
    </details>
  );
}
