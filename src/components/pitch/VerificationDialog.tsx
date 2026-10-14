"use client";

import { useEffect, useRef } from "react";
import { Check, X, ArrowUpRight } from "lucide-react";
import type { PitchCheck, PitchProduct, PitchVerification } from "@/data/pitch/types";

export const STAMP_SRC = "/tcs-verified-stamp.webp";

function Checks({ items }: { items: PitchCheck[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((c) => (
        <li key={c.text} className="flex items-start gap-2.5">
          <span className="mt-[2px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-teal-600">
            <Check className="h-3 w-3 text-white" strokeWidth={3} aria-hidden />
          </span>
          <span className="text-[14px] leading-snug text-ink-950">
            {c.text}
            {c.note && <span className="mt-0.5 block text-[12.5px] text-ink-600">{c.note}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink-100 px-5 py-4 sm:px-6">
      <h3 className="mb-3 text-[15px] text-ink-950">{title}</h3>
      {children}
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 rounded-xl bg-teal-50 px-3 py-2.5">
      <div className="text-[20px] leading-none text-teal-700" style={{ fontFamily: "var(--font-display)" }}>{value}</div>
      <div className="mt-1 text-[11.5px] leading-tight text-ink-700">{label}</div>
    </div>
  );
}

/* The verification popup. Native <dialog> gives focus trapping, Esc to close and
   inert background for free. Desktop: centred card. Phones: bottom sheet. */
export default function VerificationDialog({
  product,
  verification: v,
  retailer,
  onClose,
}: {
  product: PitchProduct;
  verification: PitchVerification;
  retailer: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const reviewRows: [string, string][] = [];
  if (v.reviews.indianMarketplaces) reviewRows.push(["Indian marketplaces", v.reviews.indianMarketplaces]);
  if (v.reviews.globalMarketplaces) reviewRows.push(["Global marketplaces", v.reviews.globalMarketplaces]);
  if (v.reviews.communities) reviewRows.push(["Consumer communities", v.reviews.communities]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!el.open) el.showModal();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="tcs-dlg-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
      className="m-auto max-h-[88dvh] w-[min(560px,calc(100%-2rem))] overflow-hidden rounded-2xl bg-white p-0 text-ink-950 shadow-2xl backdrop:bg-black/55 max-sm:m-0 max-sm:mt-auto max-sm:max-h-[92dvh] max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none"
      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
    >
      <div className="flex max-h-[inherit] flex-col" style={{ maxHeight: "inherit" }}>
        {/* Header */}
        <div className="relative flex items-start gap-4 px-5 pb-4 pt-5 sm:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={STAMP_SRC} alt="The Clean Sheet Verified" width={72} height={72} className="h-[72px] w-[72px] shrink-0" />
          <div className="min-w-0 flex-1 pr-8">
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink-600">{product.brand}</p>
            <h2 id="tcs-dlg-title" className="mt-0.5 text-[17px] leading-snug text-ink-950">{product.name}</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {v.details.map((d) => (
                <span key={d} className="rounded-full bg-ink-50 px-2.5 py-1 text-[11.5px] text-ink-700">{d}</span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-ink-700 hover:bg-ink-50"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="px-5 pb-4 sm:px-6">
            <p className="text-[13px] text-ink-950">
              <span className="font-bold">Verified on The Clean Sheet Standard</span>
              <span className="text-ink-600"> · Last updated {v.updated}</span>
            </p>
            {v.source === "sample" && (
              <p role="alert" className="mt-3 rounded-lg bg-coral-50 px-3 py-2 text-[12px] font-bold text-coral-800">
                SAMPLE DATA. Placeholder content, not a real assessment. Replace before presenting.
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <Stat value={`${v.ingredients.screened}/${v.ingredients.total}`} label="ingredients screened" />
              <Stat value={`${v.claims.supported}/${v.claims.assessed}`} label="claims supported" />
              {v.reviews.analysed != null && (
                <Stat value={v.reviews.analysed.toLocaleString("en-IN")} label="reviews analysed" />
              )}
            </div>
          </div>

          <Section title="Ingredients verified">
            <Checks items={v.ingredients.checks} />
          </Section>

          <Section title="Claims verified">
            <Checks items={v.claims.checks} />
          </Section>

          {v.extra?.map((s) => (
            <Section key={s.title} title={s.title}>
              <Checks items={s.checks} />
            </Section>
          ))}

          {reviewRows.length > 0 && (
            <Section title="Consumer reviews verified">
              <dl className="space-y-2.5 text-[14px]">
                {reviewRows.map(([k, val]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4">
                    <dt className="shrink-0 text-ink-700">{k}</dt>
                    <dd className="text-right text-ink-950">{val}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-2.5 border-t border-ink-100 bg-white px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-6">
          <a
            href={product.retailerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#001325] px-4 py-3 text-[14px] font-medium text-white"
          >
            View on {retailer}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="rounded-lg border border-ink-200 px-5 py-3 text-[14px] text-ink-950"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
