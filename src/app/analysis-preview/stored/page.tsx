/* Local preview: ten stored products as the decision core (vX) reads them, next to what the page says today. /analysis-preview/stored.
   Internal, never exposed in production. */

import Link from "next/link";
import { notFound } from "next/navigation";
import { deriveVerdict } from "@/lib/product-review-engine";
import { pillsFor, standingViewOf } from "@/lib/pills-for-review";
import { RatingDot } from "@/components/scorecards/RatingDot";
import { MARKER_OF_PILL } from "@/components/scorecards/pill-palette";
import { DEMO, storedReviews } from "./_data";

export const dynamic = "force-dynamic";

function Chip({ marker, text }: { marker: "green" | "yellow" | "red" | null; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11.5px] text-[#55504d]">
      <RatingDot marker={marker} size={12} />{text}
    </span>
  );
}

export default async function StoredPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const reviews = await storedReviews(DEMO);
  const rows = DEMO.map((slug) => {
    const review = reviews.get(slug);
    if (!review) return { slug, missing: true as const };
    const verdict = deriveVerdict(review);
    const today = standingViewOf(verdict.tier);
    const { model } = pillsFor(review, verdict);
    return { slug, missing: false as const, name: `${review.brand} ${review.productName}`, today, model };
  });
  return (
    <div className="max-w-[980px] mx-auto px-4 py-8 text-[#282828]">
      <h1 className="text-[26px] font-semibold">Ten stored products, read by the decision core</h1>
      <p className="mt-2 text-[14.5px] leading-[1.55] text-[#55504d]">
        Left: the standing the live page shows today. Right: the pill the vX decision core gives the same stored analysis, as a rating circle (green, yellow, red, or grey; the small grey word is the engine&apos;s internal key, not shown on the site). Nothing is
        written; the reviews are read from the database with the public key. Open a row for the full new page, or switch it to <em>Today&apos;s page</em> to see what the live page shows now.
      </p>
      <p className="mt-3 text-[13.5px]"><Link href="/analysis-preview/stored/all" className="font-medium underline underline-offset-4 text-[#256b3e]">See all of the stored analyses →</Link></p>
      <ol className="mt-6 flex flex-col gap-3">
        {rows.map((r, i) => (
          <li key={r.slug} className="rounded-2xl border border-[#e8e1d6] bg-white p-4">
            {r.missing ? (
              <p className="text-sm">Not found in the database: <code>{r.slug}</code></p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="text-[12px] font-medium text-[#55504d] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <Link href={`/analysis-preview/stored/${r.slug}`} className="flex-1 min-w-[220px] text-[16px] font-semibold underline-offset-4 hover:underline">{r.name}</Link>
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[12px] text-[#55504d]">Today</span><Chip marker={MARKER_OF_PILL[r.today.tone]} text={r.today.label} />
                    <span aria-hidden className="text-[#8b857f]">→</span>
                    <Chip marker={r.model.pill.marker} text={r.model.pill.key} />
                  </span>
                </div>
                <p className="mt-2 text-[13.5px] leading-[1.5] text-[#3f3b39]">{r.model.take.reason} <span className="text-[#55504d]">({r.model.take.confidence.label} confidence)</span></p>
                <p className="mt-1.5 flex flex-wrap gap-1.5">
                  {[...new Set(r.model.decision.reasons.map((x) => x.ruleId))].map((id) => <code key={id} className="rounded bg-[#f1ece3] px-1.5 py-0.5 text-[11.5px] text-[#55504d]">{id}</code>)}
                </p>
              </>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
