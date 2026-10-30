/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · The page of a product we do not rate

   A nutraceutical or a prescription drug that was analysed before we drew the line (or that someone has a link to). It carries no review, no rating, no take and
   no ingredient breakdown: only who the product is, and the notice (a popup that opens with the page; closed, it leaves the same words in the page).
   Server component; the notice is its own client component.
──────────────────────────────────────────────────────────────── */

import Image from "next/image";
import Link from "next/link";
import type { UnratedKind } from "@/lib/unrated-kind";
import { Band } from "./pills-ui";
import UnratedNotice from "./UnratedNotice";

export function UnratedProductPage({ slug, kind, productName, brand, category, image }: {
  slug: string;
  kind: UnratedKind;
  productName: string;
  brand: string;
  category?: string;
  image?: string | null;
}) {
  return (
    <main className="min-h-[70vh] pb-16">
      <Band>
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap gap-x-2 pt-3 text-[12.5px] leading-[1.6] text-[#55504d]">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/brands" className="hover:underline">Brands</Link></li>
            {brand && (<><li aria-hidden>/</li><li>{brand}</li></>)}
          </ol>
        </nav>
      </Band>

      <Band className="pt-4 sm:pt-6" innerClassName="flex items-start gap-3 sm:gap-5">
        <div className="relative flex-none w-[68px] h-[104px] sm:w-[92px] sm:h-[142px] bg-white border border-[#e8e1d6] rounded-2xl sm:rounded-[20px]">
          {image ? (
            <Image src={image} alt={productName} fill sizes="92px" className="object-contain p-2 sm:p-3" />
          ) : (
            <span aria-hidden className="absolute inset-0 flex items-center justify-center text-3xl text-[#d8d2cc] select-none">🧴</span>
          )}
        </div>
        <div className="min-w-0 flex flex-col gap-1.5">
          {brand && <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#1d6761]">{brand}</div>}
          <h1 className="text-[19px] sm:text-[30px] leading-[1.2] text-[#282828] text-balance" style={{ fontFamily: "var(--font-display)" }}>{productName}</h1>
          {category && <span className="self-start inline-flex items-center px-2.5 py-px border border-[#e8e1d6] rounded-full text-[11.5px] sm:text-xs font-medium text-[#282828]">{category}</span>}
        </div>
      </Band>

      <Band className="pt-8 sm:pt-10">
        <UnratedNotice mode="page" kind={kind} productName={productName} brand={brand} productSlug={slug} />
        <p className="mt-6 text-center text-sm text-[#55504d]">
          <Link href="/products" className="underline underline-offset-2 hover:text-[#282828]">Browse the products we have analysed</Link>
        </p>
      </Band>
    </main>
  );
}
