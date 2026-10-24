/* Local preview: every stored analysis (about 360) with today's standing beside the pill the decision core gives it. /analysis-preview/stored/all
   ?pill=good-choice | buy-with-caution | look-elsewhere | not-enough-info filters. Internal, never exposed in production. */

import Link from "next/link";
import { notFound } from "next/navigation";
import { deriveVerdict } from "@/lib/product-review-engine";
import { pillsFor, standingViewOf } from "@/lib/pills-for-review";
import { RatingDot } from "@/components/scorecards/RatingDot";
import { MARKER_OF_PILL } from "@/components/scorecards/pill-palette";
import { allStored } from "../_data";

export const dynamic = "force-dynamic";

function Chip({ marker, text }: { marker: "green" | "yellow" | "red" | null; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11.5px] text-[#55504d]">
      <RatingDot marker={marker} size={12} />{text}
    </span>
  );
}

const PILLS = [
  { key: "good-choice", label: "Good choice" }, { key: "buy-with-caution", label: "Buy with caution" },
  { key: "not-enough-info", label: "Not enough info" }, { key: "look-elsewhere", label: "Look elsewhere" },
] as const;

export default async function AllStored({ searchParams }: { searchParams: Promise<{ pill?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { pill } = await searchParams;
  const rows = (await allStored()).map(({ slug, review }) => {
    const verdict = deriveVerdict(review);
    const { model } = pillsFor(review, verdict);
    return { slug, name: `${review.brand ?? ""} ${review.productName}`.trim(), category: review.category ?? "", today: standingViewOf(verdict.tier), model };
  });
  const counts = Object.fromEntries(PILLS.map((p) => [p.key, rows.filter((r) => r.model.pill.key === p.key).length]));
  const shown = pill ? rows.filter((r) => r.model.pill.key === pill) : rows;
  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8 text-[#282828]">
      <Link href="/analysis-preview/stored" className="text-[12.5px] underline underline-offset-4 text-[#55504d]">The ten</Link>
      <h1 className="mt-1 text-[26px] font-semibold">All {rows.length} stored analyses, read by the decision core</h1>
      <p className="mt-2 text-[14px] leading-[1.55] text-[#55504d]">Today&apos;s standing, then the new pill. Nothing is written. Open a product for its new page.</p>
      <nav className="mt-4 flex flex-wrap gap-2 text-[12.5px]" aria-label="Filter by pill">
        <Link href="/analysis-preview/stored/all" className="rounded-full border px-3 py-1" style={{ borderColor: !pill ? "#2f8a52" : "#e8e1d6", color: !pill ? "#256b3e" : "#55504d" }}>All {rows.length}</Link>
        {PILLS.map((p) => (
          <Link key={p.key} href={`/analysis-preview/stored/all?pill=${p.key}`} className="rounded-full border px-3 py-1" style={{ borderColor: pill === p.key ? "#2f8a52" : "#e8e1d6", color: pill === p.key ? "#256b3e" : "#55504d" }}>
            {p.label} {counts[p.key]}
          </Link>
        ))}
      </nav>
      <ul className="mt-5 flex flex-col divide-y divide-[#f1ece3] rounded-2xl border border-[#e8e1d6] bg-white">
        {shown.map((r) => (
          <li key={r.slug} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-2.5">
            <Link href={`/analysis-preview/stored/${r.slug}`} className="flex-1 min-w-[230px] text-[14px] font-medium underline-offset-4 hover:underline">{r.name}</Link>
            <span className="hidden sm:inline text-[12px] text-[#8b857f] max-w-[140px] truncate">{r.category}</span>
            <Chip marker={MARKER_OF_PILL[r.today.tone]} text={r.today.label} />
            <span aria-hidden className="text-[#8b857f]">→</span>
            <Chip marker={r.model.pill.marker} text={r.model.pill.key} />
          </li>
        ))}
      </ul>
    </div>
  );
}
