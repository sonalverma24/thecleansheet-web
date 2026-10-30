import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Minus, X } from "lucide-react";
import { RatingDot } from "@/components/scorecards/RatingDot";
import { PILL_COLOURS } from "@/components/scorecards/pill-palette";
import { dayText } from "@/lib/pills-page";
import { ROW_IDS, displayName, type CompareCheck, type CompareFacts, type Comparison, type RowId } from "@/lib/compare-products";

/* ────────────────────────────────────────────────────────────────
   COMPARE · the page body

   The pick first, then the products side by side. Every cell is a fact from the product's own analysis page, with the page one click away. A server
   component: it has no state, so the comparison is in the HTML the first time it loads and can be shared as a link.
──────────────────────────────────────────────────────────────── */

const INK = "text-[#282828]";
const SOFT = "text-[#4a4a4a]";
const LINE = "border-[#e5dfd6]";

const moneyText = (n: number): string => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

function PillChip({ f }: { f: CompareFacts }) {
  const c = PILL_COLOURS[f.pill.tone];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-bold leading-none" style={{ background: c.soft, borderColor: c.line, color: c.ink }}>
      <RatingDot marker={f.pill.marker} size={9} decorative />
      {f.pill.label}
    </span>
  );
}

function Pack({ f, size = 96 }: { f: CompareFacts; size?: number }) {
  return (
    <div className={`relative flex-none rounded-[12px] border ${LINE} bg-white`} style={{ width: size, height: size }}>
      {f.image ? (
        <Image src={f.image} alt="" fill sizes={`${size}px`} className="object-contain p-2" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-[0.12em] text-[#b0a8a4]">No photo</span>
      )}
    </div>
  );
}

/* ── the pick ────────────────────────────────────────────────── */

function PickCard({ items, c }: { items: CompareFacts[]; c: Comparison }) {
  const p = c.pick;
  const winner = items.find((f) => f.slug === p.winner) ?? null;
  const byslug = (slug: string) => items.find((f) => f.slug === slug);
  const eyebrow = p.kind === "pick" ? "Our pick" : p.kind === "close" ? "A close call" : p.kind === "only" ? "Only one could be rated" : "No pick";
  const decided = winner && (p.kind === "pick" || p.kind === "close" || p.kind === "only");

  return (
    <section aria-labelledby="pick-heading" className={`rounded-[18px] border p-5 md:p-8 ${decided ? "border-[#cae1df] bg-[#f0f6f6]" : `${LINE} bg-[#f7f4ee]`}`}>
      <div className="flex items-start gap-4 md:gap-6">
        {winner && decided && <Pack f={winner} size={104} />}
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[11px] md:text-[12px] font-bold uppercase tracking-[0.16em] text-[#248179]">
            {winner && decided && <RatingDot marker={winner.pill.marker} size={10} decorative />}
            {eyebrow}
          </p>
          <h2 id="pick-heading" className={`mt-2 font-display font-light text-[26px] md:text-[34px] leading-[1.1] tracking-[-0.01em] text-balance ${INK}`}>
            {decided && winner && p.kind !== "only" ? displayName(winner) : p.headline}
          </h2>
          {winner && decided && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <PillChip f={winner} />
              <span className={`text-[13px] ${SOFT}`}>{winner.confidence === "high" ? "High" : winner.confidence === "medium" ? "Medium" : "Low"} confidence</span>
            </div>
          )}
        </div>
      </div>

      <p className={`mt-4 text-[15px] md:text-[16px] leading-[1.55] max-w-[68ch] ${SOFT}`}>{p.summary}</p>

      {p.reasons.length > 0 && (
        <div className="mt-5">
          <h3 className={`text-[13px] font-bold uppercase tracking-[0.12em] ${INK}`}>Why</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {p.reasons.map((r) => (
              <li key={r} className={`flex gap-2.5 text-[14px] md:text-[15px] leading-[1.5] ${INK}`}>
                <Check size={16} strokeWidth={3} className="mt-[3px] flex-none text-[#1d6761]" aria-hidden />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {winner && decided && (
        <Link href={winner.href} className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-[#248179] px-5 text-[14px] font-bold text-white transition-colors hover:bg-[#1d6b64]">
          Read the full analysis <ArrowRight size={15} aria-hidden />
        </Link>
      )}

      {p.others.length > 0 && (
        <div className={`mt-6 border-t pt-5 ${LINE}`}>
          <h3 className={`text-[13px] font-bold uppercase tracking-[0.12em] ${INK}`}>How the others compare</h3>
          <ul className="mt-3 flex flex-col gap-3">
            {p.others.map((o) => {
              const f = byslug(o.slug);
              return f ? (
                <li key={o.slug} className="flex items-start gap-3">
                  <span className="mt-[5px]"><RatingDot marker={f.pill.marker} size={10} decorative /></span>
                  <p className={`text-[14px] leading-[1.5] ${SOFT}`}>
                    <Link href={f.href} className={`font-bold underline-offset-[3px] hover:underline ${INK}`}>{displayName(f)}</Link>
                    {" "}<span className="text-[#6f6a66]">({f.pill.label}).</span> {o.text}
                  </p>
                </li>
              ) : null;
            })}
          </ul>
        </div>
      )}

      {p.value && (
        <p className={`mt-5 rounded-[12px] border border-[#d6e6a0] bg-[#f7ffd6] px-4 py-3 text-[14px] leading-[1.5] ${INK}`}>
          <strong className="font-bold">Best value. </strong>{p.value.text}
        </p>
      )}

      {p.left.length > 0 && (
        <ul className="mt-5 flex flex-col gap-2">
          {p.left.map((l) => (
            <li key={l.slug} className={`flex gap-2.5 text-[14px] leading-[1.5] ${SOFT}`}>
              <Minus size={16} strokeWidth={3} className="mt-[3px] flex-none text-[#6f6a66]" aria-hidden />
              <span>{l.text}</span>
            </li>
          ))}
        </ul>
      )}

      {p.caveats.filter((x) => !p.left.length || !/without a rating/.test(x)).map((x) => (
        <p key={x} className="mt-3 text-[13px] leading-[1.5] text-[#6f6a66]">{x}</p>
      ))}
    </section>
  );
}

/* ── the table ───────────────────────────────────────────────── */

const MARK = {
  yes: { Icon: Check, bg: "#1d6761", sr: "Yes" },
  no: { Icon: X, bg: "#b83f37", sr: "No" },
} as const;

function CheckMark({ c }: { c: CompareCheck | undefined }) {
  if (!c) return <span className="inline-flex items-center gap-1 text-[#b0a8a4]"><Minus size={14} aria-hidden /><span className="sr-only">No verified answer</span></span>;
  const m = MARK[c.state];
  return (
    <span className="inline-flex flex-col items-center gap-1">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ background: m.bg }}><m.Icon size={12} strokeWidth={3.5} aria-hidden /></span>
      <span className="sr-only">{m.sr}</span>
      {c.detail && <span className="max-w-[150px] text-[11px] leading-[1.35] text-[#4a4a4a]">{c.detail}</span>}
    </span>
  );
}

function Group({ title, cols }: { title: string; cols: number }) {
  return (
    <tr>
      <th colSpan={cols + 1} scope="colgroup" className={`sticky left-0 bg-[#f7f4ee] px-3 md:px-4 py-2 text-left text-[11px] font-bold uppercase tracking-[0.14em] ${INK} border-y ${LINE}`}>{title}</th>
    </tr>
  );
}

function Row({ label, items, win, children }: { label: string; items: CompareFacts[]; win: string | null; children: (f: CompareFacts) => ReactNode }) {
  return (
    <tr className={`border-b ${LINE} align-top`}>
      <th scope="row" className={`sticky left-0 z-[1] w-[112px] min-w-[112px] md:w-[168px] md:min-w-[168px] bg-white px-3 md:px-4 py-3 text-left text-[12px] md:text-[13px] font-bold leading-[1.35] ${INK}`}>{label}</th>
      {items.map((f) => (
        <td key={f.slug} className={`px-3 md:px-4 py-3 text-[13px] leading-[1.45] ${SOFT} ${f.slug === win ? "bg-[#f7fbfa]" : ""}`}>{children(f)}</td>
      ))}
    </tr>
  );
}

function RatedCell({ f, id, leaders }: { f: CompareFacts; id: RowId; leaders: string[] }) {
  const row = f.rows?.find((r) => r.id === id);
  if (!row) return <span className="text-[#b0a8a4]">Not rated</span>;
  const best = leaders.includes(f.slug);
  return (
    <div className={`-mx-2 -my-1 rounded-[10px] px-2 py-1 ${best ? "bg-[#e3f1ef]" : ""}`}>
      <p className={`flex items-center gap-2 font-bold ${INK}`}>
        <RatingDot marker={row.marker} size={11} decorative />
        {row.word}
        {best && <span className="rounded-full bg-[#248179] px-1.5 py-[2px] text-[9px] font-bold uppercase tracking-[0.08em] text-white">Best</span>}
      </p>
      <p className="mt-1 text-[12px] leading-[1.4]">{row.line}</p>
    </div>
  );
}

function checkRows(items: CompareFacts[]): { label: string; answers: (CompareCheck | undefined)[]; differs: boolean }[] {
  const labels: string[] = [];
  for (const f of items) for (const c of f.checks) if (!labels.includes(c.label)) labels.push(c.label);
  const rows = labels.map((label) => {
    const answers = items.map((f) => f.checks.find((c) => c.label === label));
    const states = new Set(answers.map((a) => a?.state ?? "none"));
    return { label, answers, differs: states.size > 1 };
  });
  return [...rows.filter((r) => r.differs), ...rows.filter((r) => !r.differs)];
}

function Table({ items, c }: { items: CompareFacts[]; c: Comparison }) {
  const win = c.pick.kind === "none" || c.pick.kind === "unrated" ? null : c.pick.winner;
  const cols = items.length;
  const checks = checkRows(items);
  const sun = items.some((f) => f.sun);
  const anyActives = items.some((f) => f.keyActives.length);
  const anyFit = items.some((f) => f.suits.length || f.careful.length);

  return (
    <div className={`overflow-x-auto rounded-[18px] border ${LINE} bg-white`} tabIndex={0} role="region" aria-label="Products side by side">
      <table className="w-full border-collapse text-left" style={{ minWidth: 112 + cols * 190 }}>
        <caption className="sr-only">{c.type} compared side by side. Each row is a fact from the product&apos;s own analysis page.</caption>
        <thead>
          <tr className={`border-b ${LINE} align-bottom`}>
            <td className="sticky left-0 z-[1] bg-white" />
            {items.map((f) => (
              <th key={f.slug} scope="col" className={`px-3 md:px-4 py-4 align-top font-normal ${f.slug === win ? "bg-[#f7fbfa]" : ""}`}>
                {f.slug === win && <p className="mb-2 inline-block rounded-full bg-[#248179] px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.1em] text-white">{c.pick.kind === "close" ? "Edges it" : "Our pick"}</p>}
                <Pack f={f} size={72} />
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#4a4a4a]">{f.brand}</p>
                <Link href={f.href} className={`mt-0.5 block text-[14px] font-bold leading-[1.3] underline-offset-[3px] hover:underline ${INK}`}>{f.name}</Link>
                <div className="mt-2"><PillChip f={f} /></div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <Group title="How the analysis scores it" cols={cols} />
          <Row label="Confidence" items={items} win={win}>{(f) => <span className="capitalize">{f.confidence}</span>}</Row>
          {ROW_IDS.map((id) => {
            const title = items.find((f) => f.rows)?.rows?.find((r) => r.id === id)?.title ?? id;
            return <Row key={id} label={title} items={items} win={win}>{(f) => <RatedCell f={f} id={id} leaders={c.leaders[id]} />}</Row>;
          })}
        </tbody>

        {checks.length > 0 && (
          <tbody>
            <Group title="At a glance" cols={cols} />
            {checks.map((r) => (
              <tr key={r.label} className={`border-b ${LINE} align-top`}>
                <th scope="row" className={`sticky left-0 z-[1] w-[112px] min-w-[112px] md:w-[168px] md:min-w-[168px] bg-white px-3 md:px-4 py-3 text-left text-[12px] md:text-[13px] font-bold leading-[1.35] ${INK}`}>{r.label}</th>
                {items.map((f, i) => (
                  <td key={f.slug} className={`px-3 md:px-4 py-3 ${f.slug === win ? "bg-[#f7fbfa]" : ""}`}><CheckMark c={r.answers[i]} /></td>
                ))}
              </tr>
            ))}
            <tr><td colSpan={cols + 1} className={`px-3 md:px-4 py-2 text-[11px] text-[#6f6a66] border-b ${LINE}`}>A dash means we have no verified answer for that product, not that the answer is no.</td></tr>
          </tbody>
        )}

        {(sun || anyActives) && (
          <tbody>
            <Group title="What is in it" cols={cols} />
            {sun && <Row label="SPF and PA" items={items} win={win}>{(f) => (f.sun?.spf || f.sun?.pa ? [f.sun.spf, f.sun.pa].filter(Boolean).join(" · ") : <span className="text-[#b0a8a4]">Not in the name</span>)}</Row>}
            {anyActives && <Row label="Key actives" items={items} win={win}>{(f) => (f.keyActives.length ? f.keyActives.join(", ") : <span className="text-[#b0a8a4]">None named</span>)}</Row>}
          </tbody>
        )}

        <tbody>
          <Group title="Price" cols={cols} />
          <Row label="Pack" items={items} win={win}>{(f) => f.price.pack ?? <span className="text-[#b0a8a4]">Not stated</span>}</Row>
          <Row label="Lowest price seen" items={items} win={win}>
            {(f) => (f.price.total !== null ? <span className={`font-bold ${INK}`}>{moneyText(f.price.total)}</span> : (f.price.line ?? <span className="text-[#b0a8a4]">Not found</span>))}
          </Row>
          <Row label={items.every((f) => f.price.unit === "g") ? "Per gram" : items.every((f) => f.price.unit === "ml") ? "Per ml" : "Per ml or g"} items={items} win={win}>
            {(f) => f.price.perUnit !== null ? (
              <span className={`${c.cheapest === f.slug ? "-mx-2 rounded-[10px] bg-[#e3f1ef] px-2 py-1 font-bold" : ""} ${INK}`}>
                ₹{f.price.perUnit.toFixed(2)}/{f.price.unit}{c.cheapest === f.slug && <span className="ml-1.5 rounded-full bg-[#248179] px-1.5 py-[2px] text-[9px] font-bold uppercase tracking-[0.08em] text-white">Lowest</span>}
              </span>
            ) : <span className="text-[#b0a8a4]">Cannot work out</span>}
          </Row>
        </tbody>

        {anyFit && (
          <tbody>
            <Group title="Who it suits" cols={cols} />
            <Row label="Suits" items={items} win={win}>{(f) => (f.suits.length ? f.suits.join(", ") : <span className="text-[#b0a8a4]">Not stated</span>)}</Row>
            <Row label="Take care if" items={items} win={win}>{(f) => (f.careful.length ? <ul className="flex flex-col gap-1">{f.careful.map((x) => <li key={x}>{x}</li>)}</ul> : <span className="text-[#b0a8a4]">Nothing flagged</span>)}</Row>
          </tbody>
        )}

        <tbody>
          <Group title="What would make the analysis stronger" cols={cols} />
          <Row label="Still missing" items={items} win={win}>{(f) => (f.gaps.length ? <ul className="flex flex-col gap-1.5">{f.gaps.map((x) => <li key={x}>{x}</li>)}</ul> : "")}</Row>
          <Row label="Analysed" items={items} win={win}>{(f) => <><span>{dayText(f.analysedAt)}</span><br /><Link href={f.href} className="mt-1 inline-block font-bold text-[#248179] underline-offset-[3px] hover:underline">Full analysis</Link></>}</Row>
        </tbody>
      </table>
    </div>
  );
}

export default function CompareView({ items, comparison }: { items: CompareFacts[]; comparison: Comparison }) {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 lg:px-12 pt-4 sm:pt-6 lg:pt-8 pb-16 md:pb-24">
        <nav aria-label="Breadcrumb" className="text-[12px] text-[#6f6a66]">
          <Link href="/products" className="underline-offset-[3px] hover:underline">Product analyses</Link>
          <span aria-hidden className="mx-1.5">/</span>
          <span>Compare</span>
        </nav>
        <p className="mt-5 text-[10px] md:text-[12px] font-bold tracking-[0.18em] text-[#248179] uppercase">Compare</p>
        <h1 className={`mt-2 font-display font-light text-[clamp(34px,4.4vw,52px)] leading-[1.05] tracking-[-0.02em] text-balance ${INK}`}>
          {comparison.type}, <span className="text-[#248179]">side by side.</span>
        </h1>
        <p className={`mt-3 text-[15px] md:text-[16px] leading-[1.55] max-w-[60ch] ${SOFT}`}>
          {items.length} products of the same type, read from what each analysis page already says. Nothing here is a new score.
        </p>

        <div className="mt-8 flex flex-col gap-8">
          <PickCard items={items} c={comparison} />
          <Table items={items} c={comparison} />
        </div>

        <p className="mt-8 text-[12px] leading-[1.6] text-[#6f6a66] max-w-[70ch]">
          The pick follows one order: the rating first, then ingredient safety, then the other rows, then the checks, and price last. It is a reading of the
          analyses above, not a certification and not medical advice. An ingredient flag describes an ingredient, not how your skin will react.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-[14px] font-bold">
          <Link href="/products" className="text-[#248179] underline-offset-[3px] hover:underline">Compare something else</Link>
          <Link href="/methodology" className="text-[#248179] underline-offset-[3px] hover:underline">How we analyse</Link>
        </div>
      </div>
    </div>
  );
}
