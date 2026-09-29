import Link from "next/link";
import { ExternalLink, ArrowUpRight } from "lucide-react";
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
      <div className="border border-ink-100 rounded-lg overflow-hidden">
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
    <div className="border border-ink-100 rounded-lg overflow-x-auto">
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
        <div className="max-w-4xl mx-auto px-5 py-2 flex items-center justify-between">
          <span className="text-teal-600 text-[9px] tracking-[0.18em] uppercase">
            The Clean Sheet<span className="hidden sm:inline"> &middot; Public Evidence Registry</span>
          </span>
          <Link href="/sunscreens" className="text-teal-400 hover:text-white text-[10px] transition-colors">
            All sunscreen records
          </Link>
        </div>
      </div>

      {/* Document header */}
      <header className="border-b border-ink-100 px-5 pt-10 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
            <div>
              <p className="text-teal-600 text-[10px] tracking-[0.2em] uppercase mb-2 font-medium">
                TCS Evidence Record
              </p>
              <h1 className="font-display text-ink-950 leading-[1.05] tracking-tight" style={{ fontSize: "clamp(1.9rem, 4.2vw, 2.7rem)" }}>
                {record.productName}
              </h1>
              <p className="text-ink-500 text-sm mt-2">
                <span className="text-ink-800 font-medium">{record.brand}</span> &middot; {record.variant} &middot; {record.productType}
              </p>
            </div>

            <div
              className="flex-shrink-0 rounded-lg px-4 py-3 min-w-[220px]"
              style={{ border: `1.5px solid ${stampBorder}`, background: tone.bg }}
            >
              <p className="text-[9px] tracking-[0.14em] uppercase mb-1" style={{ color: tone.text, opacity: 0.75 }}>
                TCS status
              </p>
              <p className="text-sm font-semibold leading-snug" style={{ color: tone.text }}>
                {record.tcsStatus}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-ink-100 text-xs">
            <div>
              <p className="text-ink-400 mb-0.5">Record created</p>
              <p className="text-ink-900 font-medium">{record.dateCreated}</p>
            </div>
            <div>
              <p className="text-ink-400 mb-0.5">Last checked</p>
              <p className="text-ink-900 font-medium">{record.dateChecked}</p>
            </div>
            <div>
              <p className="text-ink-400 mb-0.5">Claims reviewed</p>
              <p className="text-ink-900 font-medium">{record.claimsReviewed}</p>
            </div>
            <div>
              <p className="text-ink-400 mb-0.5">Price</p>
              <p className="text-ink-900 font-medium">{record.priceRange}</p>
            </div>
          </div>

          <p className="text-ink-400 text-xs leading-relaxed mt-6 max-w-2xl">{record.researchDisclosure}</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-10 flex flex-col lg:flex-row gap-10">
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
              <li><a href="#sources" className="text-ink-600 hover:text-teal-700 transition-colors">Source register</a></li>
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
              className="rounded-lg px-5 py-4 inline-block"
              style={{ border: `1.5px solid ${stampBorder}`, background: tone.bg }}
            >
              <p className="text-base font-semibold" style={{ color: tone.text }}>{record.overallStatus}</p>
            </div>
          </section>

          {/* P. Source register */}
          <section id="sources">
            <SectionHeading id="P" title="Source register" />
            <div className="border border-ink-100 rounded-lg overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse min-w-[560px]">
                <thead>
                  <tr className="bg-ink-950">
                    <th className="text-left text-[10px] tracking-[0.08em] uppercase text-teal-300 font-medium px-4 py-2.5">Information</th>
                    <th className="text-left text-[10px] tracking-[0.08em] uppercase text-teal-300 font-medium px-4 py-2.5">Source</th>
                    <th className="text-left text-[10px] tracking-[0.08em] uppercase text-teal-300 font-medium px-4 py-2.5">Type</th>
                    <th className="text-left text-[10px] tracking-[0.08em] uppercase text-teal-300 font-medium px-4 py-2.5">Reliability</th>
                  </tr>
                </thead>
                <tbody>
                  {record.sources.map((src, i) => (
                    <tr key={i} className={i % 2 === 1 ? "bg-ink-50/60" : "bg-white"}>
                      <td className="px-4 py-3 align-top text-ink-800 leading-relaxed border-t border-ink-100">{src.info}</td>
                      <td className="px-4 py-3 align-top border-t border-ink-100">
                        <a
                          href={src.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 transition-colors"
                        >
                          {src.sourceLabel}
                          <ExternalLink size={11} />
                        </a>
                      </td>
                      <td className="px-4 py-3 align-top text-ink-600 border-t border-ink-100 whitespace-nowrap">{src.type}</td>
                      <td className="px-4 py-3 align-top text-ink-600 border-t border-ink-100 whitespace-nowrap">{src.reliability}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {record.sourcesNote && <p className="text-xs text-ink-500 leading-relaxed mb-2">{record.sourcesNote}</p>}
            {record.notAccessible && (
              <p className="text-xs text-ink-400 leading-relaxed">Not accessible: {record.notAccessible}</p>
            )}
          </section>
        </div>
      </div>

      {/* Cross link to the scored review, and footer disclosure */}
      <section className="bg-ink-950 px-5 py-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
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
      <span
        className="font-display text-teal-600 flex-shrink-0"
        style={{ fontSize: "1.1rem" }}
      >
        {id}
      </span>
      <h2 className="font-display text-ink-950 tracking-tight" style={{ fontSize: "1.3rem" }}>
        {displayTitle}
      </h2>
    </div>
  );
}
