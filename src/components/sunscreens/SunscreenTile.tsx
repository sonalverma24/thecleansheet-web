import Image from "next/image";
import Link from "next/link";
import type { SunscreenEvidenceRecord } from "@/data/sunscreens/types";
import { STATUS_TONE_STYLES } from "./status";

export function SunscreenTile({ record }: { record: SunscreenEvidenceRecord }) {
  const tone = STATUS_TONE_STYLES[record.statusTone];

  return (
    <Link href={`/sunscreens/${record.slug}`} className="block group">
      <article className="border border-ink-100 hover:border-teal-200 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-teal-900/8 transition-all duration-300 hover:-translate-y-0.5 bg-white h-full flex flex-col">
        <div className="relative aspect-square bg-ink-50 overflow-hidden">
          <Image
            src={record.image}
            alt={`${record.brand} ${record.productName}`}
            fill
            className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        </div>

        <div className="p-4 flex flex-col flex-1">
          <p className="text-[10px] tracking-[0.14em] uppercase text-teal-600 mb-1">{record.brand}</p>
          <h3 className="text-sm font-medium text-ink-950 group-hover:text-teal-700 transition-colors leading-snug mb-2">
            {record.productName}
          </h3>
          <p className="text-xs text-ink-500 mb-3">{record.variant}</p>

          <span
            className="inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[10px] font-medium mb-3"
            style={{ background: tone.bg, color: tone.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: tone.dot }} />
            {record.tcsStatus}
          </span>

          <div className="pt-3 border-t border-ink-50 mt-auto flex items-center justify-between">
            <span className="text-ink-900 tabular-nums text-sm font-semibold">{record.priceRange.split("·")[0].trim()}</span>
            <span className="text-teal-600 text-xs font-medium">View evidence record</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
