/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · The Clean Sheet Rating key

   The owner's design (shared 2026-10-29): a card that explains the four ratings a product can wear, each as its own tile (the colour circle, its name, what it means),
   a footnote that Grey is not a verdict, and a link onward. The owner then asked for it as small print at the very end of the page, so this is the same card set
   very small, not a section to read. Display only. The circles and tints are the same palette as the take card at the top of a product page (pill-palette.ts) and
   the words are the same RATING_KEY the take card prints, so this key and the badge it explains can never disagree.

   Server component. The page that places it supplies the band or section around it.
──────────────────────────────────────────────────────────────── */

import Link from "next/link";
import { ArrowUpRight, Info } from "lucide-react";
import { MARKER_COLOURS, NEUTRAL_COLOURS, RATING_KEY, RATING_KEY_FOOTNOTE } from "./pill-palette";
import { RatingDot } from "./RatingDot";

export function RatingKey({ id = "rating-key" }: { id?: string }) {
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className="rounded-2xl border border-[#e3e7e9] bg-white p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={titleId} className="text-[14px] font-bold leading-tight tracking-[-0.01em] text-[#101719]">The Clean Sheet Rating</h2>
          <p className="mt-0.5 text-[11.5px] leading-snug text-[#5f6870]">Understand what each product rating means.</p>
        </div>
        <Info aria-hidden="true" strokeWidth={1.6} className="h-3.5 w-3.5 shrink-0 text-[#6b747b]" />
      </div>

      <ul className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
        {RATING_KEY.map((r) => {
          const c = r.marker ? MARKER_COLOURS[r.marker] : NEUTRAL_COLOURS;
          return (
            <li key={r.key} className="rounded-lg px-2.5 py-2" style={{ backgroundColor: c.soft, boxShadow: `inset 0 0 0 1px ${c.line}` }}>
              <div className="flex items-center gap-1.5">
                <RatingDot marker={r.marker} size={9} decorative className="m-[2px]" />
                <h3 className="text-[12px] font-bold leading-none text-[#121719]">{r.name}</h3>
              </div>
              <p className="mt-1 text-[11px] leading-[1.4] text-[#4f585f]">{r.meaning}</p>
            </li>
          );
        })}
      </ul>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-[#e3e7e9] pt-2">
        <p className="text-[11px] leading-snug text-[#5f6870]">{RATING_KEY_FOOTNOTE}</p>
        <Link href="/standard" className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#1d6761] hover:underline">
          Want to read about our standard? <ArrowUpRight aria-hidden="true" size={12} />
        </Link>
      </div>
    </section>
  );
}
