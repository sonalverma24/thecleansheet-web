import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import type { SunscreenEvidenceRecord, SectionBlock } from "@/data/sunscreens/types";
import { STATUS_TONE_STYLES } from "./status";

const STAMP_BORDER: Record<string, string> = {
  partial: "#D69A1F",
  available: "var(--color-teal-600)",
  unavailable: "var(--color-coral-600)",
};

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

      {/* Hero */}
      <section className="grain-overlay bg-teal-950 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto px-5 pt-12 pb-0">
          <div className="flex flex-col lg:flex-row items-end gap-8 lg:gap-14">
            {/* Identity */}
            <div className="flex-1 min-w-0 pb-10 lg:pb-14">
              <p className="text-teal-600 text-[10px] tracking-[0.2em] uppercase mb-3 animate-fade-up font-medium">
                TCS Evidence Record &middot; {record.brand}
              </p>
              <h1
                className="font-medium text-white leading-[1.05] tracking-tight mb-3 animate-fade-up delay-100"
                style={{ fontSize: "clamp(2rem, 5vw, 3.1rem)" }}
              >
                {record.productName}
              </h1>
              <p className="text-teal-400 text-lg mb-5 animate-fade-up delay-200">{record.variant}</p>

              <div className="animate-fade-up delay-300 mb-6">
                <span
                  className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2"
                  style={{ border: `1.5px solid ${stampBorder}`, background: "rgba(255,255,255,0.03)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: stampBorder }} />
                  <span className="text-sm font-medium" style={{ color: "#F3D889" }}>{record.tcsStatus}</span>
                </span>
              </div>

              <p className="text-teal-300 text-sm leading-relaxed max-w-md mb-7 animate-fade-up delay-400">
                {record.statusSummary}
              </p>

              {/* Buy links */}
              <div className="flex flex-wrap gap-2 animate-fade-up delay-400">
                {record.buyLinks.map((link) => (
                  <a
                    key={link.retailer}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1.5 text-xs text-teal-950 bg-teal-300 hover:bg-teal-200 font-medium px-3.5 py-2 rounded-full transition-colors"
                  >
                    <ShoppingBag size={11} />
                    {link.retailer}
                  </a>
                ))}
              </div>
            </div>

            {/* Product image */}
            <div className="hidden lg:block flex-shrink-0 self-end animate-fade-up delay-200">
              <div className="animate-float">
                <div
                  className="relative w-52 h-64 rounded-t-2xl overflow-hidden"
                  style={{
                    background: "linear-gradient(160deg, #0F2C2A 0%, #174039 50%, #1D5550 100%)",
                    boxShadow: "0 -16px 48px -8px rgba(36,129,121,0.15), 0 40px 80px -20px rgba(0,0,0,0.9)",
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

            {/* Mobile image */}
            <div className="lg:hidden flex-shrink-0 self-start animate-fade-up delay-200">
              <div
                className="relative w-28 h-36 rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, #0F2C2A 0%, #174039 50%, #1D5550 100%)",
                  boxShadow: "0 24px 48px -12px rgba(0,0,0,0.6)",
                }}
              >
                <Image
                  src={record.image}
                  alt={`${record.brand} ${record.productName}`}
                  fill
                  className="object-contain p-3"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero stats */}
      <section className="bg-white border-b border-ink-100 px-5 py-12">
        <div className="max-w-5xl mx-auto">
          <p className="text-teal-600 text-[9px] tracking-[0.2em] uppercase mb-8">The numbers that hold up</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink-100 rounded-2xl overflow-hidden">
            {record.heroStats.map(({ value, unit, label, context }) => (
              <div key={label} className="bg-white px-5 py-7 sm:px-6">
                <div className="mb-2.5 leading-none">
                  <span className="font-medium text-ink-950" style={{ fontSize: "clamp(2rem, 4.5vw, 2.8rem)" }}>
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

      <div className="max-w-5xl mx-auto px-5 py-12 flex flex-col lg:flex-row gap-10">
        {/* Table of contents */}
        <nav className="lg:w-48 flex-shrink-0 order-2 lg:order-1">
          <div className="lg:sticky lg:top-6">
            <p className="text-[10px] tracking-[0.14em] uppercase text-ink-400 mb-3">On this record</p>
            <ul className="space-y-1.5 text-xs">
              <li><a href="#summary" className="text-ink-600 hover:text-teal-700 transition-colors">Consumer summary</a></li>
              {record.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#section-${s.id}`} className="text-ink-600 hover:text-teal-700 transition-colors">
                    {s.id}. {s.title.replace(/^[A-Z]\d*\.\s*/, "")}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Body */}
        <div className="flex-1 min-w-0 order-1 lg:order-2 space-y-14">
          {/* T. Consumer facing summary */}
          <section id="summary">
            <SectionHeading id="T" title="Consumer facing summary" />
            <p className="text-sm text-ink-800 leading-relaxed mb-4">
              <span className="font-semibold">TCS status: {record.tcsStatus}.</span> {record.statusSummary}
            </p>
            <Block block={{ kind: "kv", rows: record.summary }} />
          </section>

          {/* Lettered sections */}
          {record.sections.map((section) => (
            <section id={`section-${section.id}`} key={section.id}>
              <SectionHeading id={section.id} title={section.title} />
              <div className="space-y-4">
                {section.blocks.map((block, i) => (
                  <Block block={block} key={i} />
                ))}
              </div>
            </section>
          ))}

          {/* S. Overall status, restated as a stamp */}
          <section>
            <SectionHeading id="S" title="Overall TCS status" />
            <div
              className="rounded-xl px-5 py-4 inline-block"
              style={{ border: `1.5px solid ${stampBorder}`, background: tone.bg }}
            >
              <p className="text-base font-semibold" style={{ color: tone.text }}>{record.overallStatus}</p>
            </div>
          </section>
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
    </div>
  );
}

function SectionHeading({ id, title }: { id: string; title: string }) {
  const displayTitle = title.replace(/^[A-Z]\d*\.\s*/, "");
  return (
    <div className="flex items-baseline gap-3 mb-4 pb-2 border-b border-ink-100">
      <span className="font-display text-teal-600 flex-shrink-0" style={{ fontSize: "1.1rem" }}>
        {id}
      </span>
      <h2 className="font-display text-ink-950 tracking-tight" style={{ fontSize: "1.3rem" }}>
        {displayTitle}
      </h2>
    </div>
  );
}
