/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · The top of the pills page

   From the breadcrumb to the "Independent and free" note, in the order of the design:
     the product (image, brand, name, category, analysed date) and The Clean Sheet take   at a glance, and who it suits and who should be careful
     the summary line and where to buy      In India      key ingredients and the independence note

   DESIGN ONLY: the pill, the confidence, the ticks, the fit lists, the retailers, the key actives and the India paragraph all come from the page
   model (src/lib/pills-page.ts, built from the decision core). The summary line is today's logic, unchanged: the product's own summary, or the
   line the product page has always written. Nothing here decides, scores or looks anything up.

   Server component. The one link that needs script ("View all ingredients" also opens the list) is its own small client component.
──────────────────────────────────────────────────────────────── */

import Image from "next/image";
import Link from "next/link";
import { Check, MapPin, Minus, ShieldCheck, X } from "lucide-react";
import type { Brand, ProductScorecard } from "@/data/brands/types";
import { hasIngredientPage, toSlug } from "@/lib/ingredient-utils";
import type { BuyLink, Highlight, PillsPageModel } from "@/lib/pills-page";
import { generateVerdict } from "./ProductHero";
import { OpenDetailsLink } from "./OpenDetailsLink";
import { Band, PillTake } from "./pills-ui";
import { MARKER_COLOURS } from "./pill-palette";

/** "23 October 2026", or nothing for a date we cannot read. */
function analysedOn(iso: string): string | null {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function categoryOf(product: ProductScorecard): string {
  if (product.category) return product.category;
  const byType: Record<string, string> = { sunscreen: "Sunscreen", "leave-on": "Serum", "rinse-off": "Cleanser", toner: "Toner", treatment: "Treatment" };
  return byType[product.productType] ?? product.productType;
}

function HighlightChip({ h }: { h: Highlight }) {
  const tone = h.state === "yes" ? "ok" : h.state === "no" ? "no" : "na";
  const Icon = h.state === "yes" ? Check : h.state === "no" ? X : Minus;
  return (
    <li className="pp-chip" data-tone={tone}>
      <span aria-hidden className="pp-chip__ic"><Icon size={h.state === "no" ? 11 : 12} strokeWidth={3} /></span>
      {h.label}
      <span className="sr-only">{h.state === "yes" ? " (yes)" : h.state === "no" ? " (no)" : " (not known)"}</span>
    </li>
  );
}

function FitCard({ title, items, tone }: { title: string; items: string[]; tone: "suits" | "careful" }) {
  const suits = tone === "suits";
  return (
    <div
      className="flex flex-col gap-1.5 sm:gap-2.5 rounded-2xl sm:rounded-[18px] border px-[11px] py-2.5 sm:p-4"
      style={suits ? { backgroundColor: MARKER_COLOURS.green.soft, borderColor: MARKER_COLOURS.green.line } : { backgroundColor: MARKER_COLOURS.red.soft, borderColor: MARKER_COLOURS.red.line }}
    >
      <h3 className="pp-serif text-[15.5px] sm:text-xl leading-[1.2] min-h-[37px] sm:min-h-0" style={{ color: suits ? MARKER_COLOURS.green.ink : MARKER_COLOURS.red.ink }}>{title}</h3>
      <ul className="flex flex-col gap-1 sm:gap-1.5 text-[13px] sm:text-[15px] leading-[1.35] sm:leading-[1.4] text-[#282828]">
        {items.map((s) => <li key={s}>{s}</li>)}
      </ul>
    </div>
  );
}

/** Where to buy: one row of small chips that sits beside the overview (the summary line) on a wide screen and under it on a phone. A chip is just the retailer's
    name, set small, so the whole row stays on one line (most products have five to seven retailers; the price we last saw is in the chip's tooltip and is read out by a
    screen reader, not drawn, because six prices do not fit beside the overview). The block is as wide as its chips, never wider than a share of the row, so the overview
    keeps the rest. A list too long for the row scrolls sideways, fading at the edge, rather than wrapping. A link that is a search for the product (not its own page)
    says so once, beside the heading, not on every chip; a retailer we hold no address for is a plain dashed chip. */
function WhereToBuy({ links }: { links: BuyLink[] }) {
  const searches = links.some((b) => b.url && !b.direct);
  return (
    <div id="where-to-buy" className="min-w-0 lg:flex-none lg:max-w-[58%] scroll-mt-28">
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 mb-1.5">
        <h2 className="pp-serif text-base sm:text-lg leading-none text-[#282828]">Where to buy</h2>
        {links.length > 0 && searches ? <span className="text-[11px] leading-none text-[#55504d]">links search the retailer</span> : null}
      </div>
      {links.length ? (
        <ul className="flex flex-nowrap items-center gap-1 overflow-x-auto pb-0.5 pr-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,#000_calc(100%-24px),transparent)]">
          {links.map((b) => {
            const chip = "inline-flex items-center whitespace-nowrap rounded-full bg-white px-2 py-[4px] text-[11px] font-semibold leading-none text-[#282828]";
            const last = b.price ? `, last seen at ${b.price}` : "";
            return (
              <li key={b.name} className="flex-none">
                {b.url ? (
                  <a href={b.url} target="_blank" rel="noopener noreferrer nofollow" title={`${b.name}${last}`} className={`${chip} pp-shop border border-[#e8e1d6] no-underline`}>
                    {b.name}<span className="sr-only">{last}{!b.direct ? " (a search for this product)" : ""} (opens in a new tab)</span>
                  </a>
                ) : (
                  <span title={`${b.name}${last}`} className={`${chip} border border-dashed border-[#cfc6b8]`}>{b.name}{last ? <span className="sr-only">{last}</span> : null}</span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-[#55504d]">Check brand website</p>
      )}
    </div>
  );
}

export function PillsHero({ product, brand, model }: { product: ProductScorecard; brand: Brand; model: PillsPageModel }) {
  const analysed = analysedOn(product.analyzedAt);
  const { suits, careful, india } = model.fit;
  const hasFitCards = suits.length > 0 || careful.length > 0;
  const summary = product.summary || generateVerdict(product);

  return (
    <>
      {/* Breadcrumb. The brand crumb is plain text: there is no brand page for a live analysis. The product's own name is left off on a phone. */}
      <Band>
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap gap-x-2 pt-3 text-[12.5px] leading-[1.6] text-[#55504d]">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/brands" className="hover:underline">Brands</Link></li>
            <li aria-hidden>/</li>
            <li>{brand.name}</li>
            <li aria-hidden className="hidden sm:block">/</li>
            <li aria-current="page" className="hidden sm:block text-[#282828]">{product.productName}</li>
          </ol>
        </nav>
      </Band>

      {/* The product, and the take */}
      <Band className="pt-2.5 sm:pt-3.5" innerClassName="flex flex-wrap items-center justify-between gap-x-9 gap-y-3 sm:gap-y-5">
        <div className="flex-[1_1_560px] min-w-0 flex items-start gap-3 sm:gap-5">
          <div className="relative flex-none w-[68px] h-[104px] sm:w-[92px] sm:h-[142px] bg-white border border-[#e8e1d6] rounded-2xl sm:rounded-[20px] shadow-[0_12px_24px_-18px_rgba(40,40,40,0.4)] sm:shadow-[0_14px_28px_-20px_rgba(40,40,40,0.4)]">
            {product.image ? (
              <Image src={product.image} alt={product.productName} fill sizes="92px" className="object-contain p-2 sm:p-3" />
            ) : (
              <span aria-hidden className="absolute inset-0 flex items-center justify-center text-3xl text-[#d8d2cc] select-none">🧴</span>
            )}
          </div>
          <div className="min-w-0 flex flex-col gap-[5px] sm:gap-1.5">
            <div className="pp-eyebrow text-[#1d6761]">{brand.name}</div>
            <h1 className="pp-serif text-[19px] sm:text-[32px] leading-[1.2] sm:leading-[1.15] text-[#282828] text-balance">{product.productName}</h1>
            <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-2.5 gap-y-1">
              <span className="inline-flex items-center px-2.5 sm:px-[11px] py-px sm:py-0.5 border border-[#e8e1d6] rounded-full text-[11.5px] sm:text-xs font-medium text-[#282828]">{categoryOf(product)}</span>
              {analysed && <span className="text-[12.5px] sm:text-[13.5px] italic text-[#55504d]">Analysed {analysed}</span>}
            </div>
          </div>
        </div>
        <PillTake marker={model.pill.marker} className="flex-[0_1_440px] min-w-[min(100%,320px)]" />
      </Band>

      {/* At a glance, and who it suits and who should be careful. On a phone the ticks stand free and the two fit lists sit side by side. */}
      {(model.highlights.length > 0 || hasFitCards) && (
        <Band className="pt-3 sm:pt-4" innerClassName="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] items-stretch">
          {model.highlights.length > 0 && (
            <div id="at-a-glance" className="flex flex-col gap-[7px] sm:gap-2.5 sm:bg-white sm:border sm:border-[#e8e1d6] sm:rounded-[18px] sm:p-4">
              <h2 className="pp-eyebrow text-[#55504d]">At a glance</h2>
              <ul className="flex flex-wrap gap-1.5 sm:gap-[7px]">{model.highlights.map((h) => <HighlightChip key={h.label} h={h} />)}</ul>
            </div>
          )}
          {hasFitCards && (
            <div id="fit" className="flex flex-col gap-[7px] sm:contents">
              <h2 className="pp-eyebrow text-[#55504d] sm:sr-only">How it fits you and the Indian market</h2>
              <div className={`grid gap-2 sm:contents ${suits.length > 0 && careful.length > 0 ? "grid-cols-2" : "grid-cols-1"}`}>
                {suits.length > 0 && <FitCard title="Who it suits" items={suits} tone="suits" />}
                {careful.length > 0 && <FitCard title="Who should be careful" items={careful} tone="careful" />}
              </div>
            </div>
          )}
        </Band>
      )}

      {/* The summary line (today's logic) and where to buy */}
      <Band className="pt-[18px] sm:pt-6" innerClassName="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <p className="min-w-0 lg:flex-1 text-[15.5px] sm:text-[17px] leading-[1.55] sm:leading-[1.6] text-[#282828] text-pretty">{summary}</p>
        <WhereToBuy links={model.buyLinks} />
      </Band>

      {/* In India */}
      {india && (
        <Band className="pt-7 sm:pt-8">
          <div id="in-india" className="flex flex-col gap-2.5 bg-[#fbfaf7] border border-[#e8e1d6] rounded-[18px] p-4 sm:px-[22px] sm:py-[18px]">
            <div className="flex items-center gap-2.5 text-[#1d6761]">
              <MapPin aria-hidden size={22} strokeWidth={1.7} />
              <h2 className="pp-serif text-xl sm:text-[21px] text-[#282828]">In India</h2>
            </div>
            <p className="text-sm sm:text-[15px] leading-[1.55] sm:leading-[1.6] text-[#282828] text-pretty [column-width:340px] [column-gap:40px]">{india}</p>
          </div>
        </Band>
      )}

      {/* Key ingredients, and the independence note */}
      <Band className="pt-3.5 sm:pt-3" innerClassName="grid gap-3.5 sm:gap-3 sm:grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))] items-stretch">
        <div id="key-ingredients" className="flex flex-col gap-2 sm:gap-2.5 sm:bg-white sm:border sm:border-[#e8e1d6] sm:rounded-[18px] sm:px-[22px] sm:py-[18px]">
          <h2 className="pp-serif text-lg sm:text-xl text-[#1d6761]">Key Ingredients</h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            {model.keyActives.map((name) => {
              // A key active can carry a concentration ("Niacinamide (10%)") that no ingredient page is keyed on: strip it before slugging,
              // and link only when a real ingredient page exists, so no chip ever points at a 404.
              const slug = toSlug(name.replace(/\s*\([^)]*\)\s*$/, "").trim());
              return hasIngredientPage(slug)
                ? <Link key={name} href={`/ingredients/${slug}`} className="pp-pill">{name}</Link>
                : <span key={name} className="pp-pill">{name}</span>;
            })}
            <OpenDetailsLink targetId="ingredients" className="inline-flex items-center min-h-11 px-1 sm:px-0 sm:ml-0 text-sm font-medium text-[#1d6761] underline underline-offset-4">
              View all ingredients
            </OpenDetailsLink>
          </div>
        </div>
        <div className="flex flex-col gap-2 bg-[#f0f6f6] border border-[#cae1df] rounded-[18px] px-4 py-3.5 sm:px-[22px] sm:py-[18px]">
          <div className="flex items-center gap-2 text-[#1d6761]">
            <ShieldCheck aria-hidden size={22} strokeWidth={1.7} />
            <strong className="font-semibold text-sm sm:text-[14.5px]">Independent and free.</strong>
          </div>
          <p className="text-[13.5px] leading-[1.55] sm:leading-[1.6] text-[#282828]">
            The Clean Sheet takes no money from brands to analyse, rank, or approve a product. This is a web evidence analysis, not a Clean Sheet certification. We checked the ingredient list, publicly available test reports, marketing claims, and formula logic using only public information available at the time of analysis.
          </p>
        </div>
      </Band>
    </>
  );
}
