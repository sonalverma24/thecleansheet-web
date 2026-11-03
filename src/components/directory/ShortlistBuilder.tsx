"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { BrandingOption, MaterialGroup, PackagingCatalogue, ProductUseId } from "@/data/packaging/types";
import { PRODUCT_USES, MATERIAL_LABELS } from "@/data/packaging/families";
import { BRANDING_LABELS, MOQ_SCOPE_LABELS } from "@/data/packaging/labels";
import { familyCoverage } from "@/lib/packaging-catalogue";
import {
  EMPTY_QUERY, QUANTITY_BANDS, buildShortlist, type QuantityBandId, type ShortlistQuery, type ShortlistRow,
} from "@/lib/packaging-shortlist";
import { CoverageBadge, DISPLAY_FONT, mailto } from "@/components/directory/ui";

const MATERIAL_OPTIONS = Object.keys(MATERIAL_LABELS) as MaterialGroup[];
const BRANDING_OPTIONS = Object.keys(BRANDING_LABELS) as BrandingOption[];

const FIELD = "mt-1.5 block w-full min-h-[44px] rounded-xl border border-ink-200 bg-white px-3 text-base text-ink-950 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200";

function MatchRow({ item }: { item: ShortlistRow }) {
  const { row, fit } = item;
  const { offering, product, supplier } = row;
  return (
    <li className="rounded-xl border border-ink-100 bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-sm font-medium text-ink-950">{product.name}</p>
        <Link href={`/directory/packaging/suppliers/${supplier.slug}`} className="text-sm text-teal-700 underline-offset-2 hover:underline">
          {supplier.name}
        </Link>
      </div>
      <p className="mt-1 text-[13px] text-ink-700">
        {offering.moqPieces === null
          ? "MOQ to confirm with the supplier"
          : `MOQ ${offering.moqPieces.toLocaleString("en-IN")} pieces, ${MOQ_SCOPE_LABELS[offering.moqScope]}`}
        {fit === "stretch" && " (above the lowest quantity you entered)"}
      </p>
      <p className="mt-2 flex flex-wrap gap-1">
        {offering.branding.map((b) => (
          <span key={b} className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] text-teal-800">{BRANDING_LABELS[b]}</span>
        ))}
      </p>
    </li>
  );
}

export default function ShortlistBuilder({ catalogue }: { catalogue: PackagingCatalogue }) {
  const [query, setQuery] = useState<ShortlistQuery>(EMPTY_QUERY);
  const set = <K extends keyof ShortlistQuery>(key: K, value: ShortlistQuery[K]) => setQuery((q) => ({ ...q, [key]: value }));

  const results = useMemo(() => buildShortlist(catalogue, query), [catalogue, query]);
  const withOptions = results.filter((r) => r.matches.length + r.toConfirm.length > 0);
  const withoutOptions = results.filter((r) => r.matches.length + r.toConfirm.length === 0);
  const matchCount = results.reduce((n, r) => n + r.matches.length, 0);
  const confirmCount = results.reduce((n, r) => n + r.toConfirm.length, 0);
  const touched = Object.values(query).some((v) => v !== null);
  const useLabel = PRODUCT_USES.find((u) => u.id === query.use)?.label;

  return (
    <section aria-labelledby="shortlist-h" className="rounded-3xl bg-cream-100 p-5 sm:p-8">
      <h2 id="shortlist-h" className="text-2xl text-ink-950" style={{ fontFamily: DISPLAY_FONT }}>Build your sourcing shortlist</h2>
      <p className="mt-1 max-w-xl text-sm text-ink-700">
        Tell us what you are packaging and how many you need per SKU. We show the formats that fit and the supplier options we have on record.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium text-ink-900">
          What product are you packaging?
          <select className={FIELD} value={query.use ?? ""} onChange={(e) => set("use", (e.target.value || null) as ProductUseId | null)}>
            <option value="">Any product</option>
            {PRODUCT_USES.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select>
        </label>

        <label className="block text-sm font-medium text-ink-900">
          Preferred material
          <select className={FIELD} value={query.material ?? ""} onChange={(e) => set("material", (e.target.value || null) as MaterialGroup | null)}>
            <option value="">Any</option>
            {MATERIAL_OPTIONS.map((m) => <option key={m} value={m}>{MATERIAL_LABELS[m]}</option>)}
          </select>
        </label>

        <label className="block text-sm font-medium text-ink-900">
          Branding requirement
          <select className={FIELD} value={query.branding ?? ""} onChange={(e) => set("branding", (e.target.value || null) as BrandingOption | null)}>
            <option value="">Any</option>
            {BRANDING_OPTIONS.map((b) => <option key={b} value={b}>{BRANDING_LABELS[b]}</option>)}
          </select>
        </label>

        <fieldset className="md:col-span-2">
          <legend className="text-sm font-medium text-ink-900">Your required quantity per SKU</legend>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {QUANTITY_BANDS.map((b) => {
              const on = query.band === b.id;
              return (
                <label
                  key={b.id}
                  className={`cursor-pointer select-none rounded-full border px-4 py-2.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal-300 ${on ? "border-ink-950 bg-ink-950 text-white" : "border-ink-200 bg-white text-ink-800 hover:border-ink-400"}`}
                >
                  <input
                    type="radio" name="quantity" className="sr-only" checked={on}
                    onChange={() => set("band", b.id as QuantityBandId)}
                  />
                  {b.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      {touched && (
        <button type="button" onClick={() => setQuery(EMPTY_QUERY)} className="mt-4 text-sm text-teal-700 underline underline-offset-2">
          Clear filters
        </button>
      )}

      <div className="mt-8" aria-live="polite">
        <p className="text-sm font-medium text-ink-900">
          {matchCount + confirmCount === 0
            ? `${results.length} ${results.length === 1 ? "format fits" : "formats fit"}${useLabel ? ` ${useLabel.toLowerCase()}` : ""}, but no supplier option is on record yet.`
            : `${matchCount} supplier ${matchCount === 1 ? "option matches" : "options match"} your filters${confirmCount ? `, and ${confirmCount} more ${confirmCount === 1 ? "needs its" : "need their"} MOQ confirmed` : ""}.`}
        </p>

        {withOptions.length > 0 && (
          <div className="mt-5 space-y-6">
            {withOptions.map((r) => (
              <div key={r.family.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/directory/packaging/${r.family.id}`} className="text-lg text-ink-950 underline-offset-2 hover:underline" style={{ fontFamily: DISPLAY_FONT }}>
                    {r.family.name}
                  </Link>
                  <CoverageBadge level={familyCoverage(catalogue, r.family.id).level} />
                </div>
                {r.matches.length > 0 && <ul className="mt-3 space-y-2">{r.matches.map((m) => <MatchRow key={m.row.offering.id} item={m} />)}</ul>}
                {r.toConfirm.length > 0 && (
                  <>
                    <p className="mt-4 text-[12px] font-medium uppercase text-ink-600" style={{ letterSpacing: "0.08em" }}>MOQ to confirm</p>
                    <ul className="mt-2 space-y-2">{r.toConfirm.map((m) => <MatchRow key={m.row.offering.id} item={m} />)}</ul>
                  </>
                )}
                {r.overQuantity > 0 && (
                  <p className="mt-2 text-[12px] text-ink-600">
                    {r.overQuantity} more {r.overQuantity === 1 ? "option needs" : "options need"} a higher quantity than you entered.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {withoutOptions.length > 0 && (
          <div className="mt-6">
            {withOptions.length > 0 && (
              <p className="text-[12px] font-medium uppercase text-ink-600" style={{ letterSpacing: "0.08em" }}>No supplier option on record for these</p>
            )}
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {withoutOptions.map((r) => (
                <li key={r.family.id}>
                  <Link
                    href={`/directory/packaging/${r.family.id}`}
                    className="flex h-full items-center justify-between gap-3 rounded-xl border border-ink-100 bg-white px-4 py-3 hover:border-teal-600"
                  >
                    <span className="text-sm text-ink-950">{r.family.name}</span>
                    <CoverageBadge level={familyCoverage(catalogue, r.family.id).level} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {matchCount + confirmCount === 0 && (
          <p className="mt-5 text-sm text-ink-700">
            Each format page lists what TCS checks before recommending a supplier, so you can ask the same questions of any supplier you speak to.{" "}
            <a
              className="text-teal-700 underline underline-offset-2"
              href={mailto(`Packaging sourcing request${useLabel ? `: ${useLabel}` : ""}`)}
            >
              Tell us what you need
            </a>{" "}
            and we will prioritise it.
          </p>
        )}
      </div>
    </section>
  );
}
