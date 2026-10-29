import type { Metadata } from "next";
import Link from "next/link";
import { getStoredReview } from "@/lib/product-review-engine";
import { compareFactsOf } from "@/lib/compare-facts";
import { COMPARE_MAX } from "@/lib/compare-group";
import { buildComparison, displayName, type CompareFacts } from "@/lib/compare-products";
import CompareView from "@/components/compare/CompareView";
import TrackView from "@/components/compare/TrackView";

/* /compare?items=slug-one,slug-two — two to four stored analyses of the same product type, side by side, with a pick.
   The address is the whole state, so a comparison can be shared. It is checked here, not trusted: an unknown product, a product we have not filed a
   type for, or a mix of types is turned away with the reason in words. Read-only; nothing is written. */

export const metadata: Metadata = {
  title: "Compare products",
  description: "Two to four products of the same type, side by side, read from their analyses, with a pick.",
  robots: { index: false, follow: true },
};

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,140}$/;

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white min-h-[60vh]">
      <div className="max-w-[720px] mx-auto px-5 sm:px-8 pt-10 pb-20">
        <p className="text-[10px] md:text-[12px] font-bold tracking-[0.18em] text-[#248179] uppercase">Compare</p>
        <h1 className="mt-2 font-display font-light text-[clamp(30px,4vw,44px)] leading-[1.08] tracking-[-0.02em] text-[#282828] text-balance">{title}</h1>
        <div className="mt-4 flex flex-col gap-3 text-[15px] md:text-[16px] leading-[1.55] text-[#4a4a4a]">{children}</div>
        <Link href="/brands#registry" className="mt-8 inline-flex h-11 items-center rounded-lg bg-[#248179] px-5 text-[14px] font-bold text-white transition-colors hover:bg-[#1d6b64]">
          Back to product analyses
        </Link>
      </div>
    </div>
  );
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ items?: string | string[] }> }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.items) ? sp.items.join(",") : (sp.items ?? "");
  const slugs = [...new Set(raw.split(",").map((s) => s.trim().toLowerCase()).filter((s) => SLUG_RE.test(s)))].slice(0, COMPARE_MAX);

  if (slugs.length < 2) {
    return (
      <Message title="Pick at least two products to compare">
        <p>Choose two to four products of the same type on the product analyses page, then press Compare. A sunscreen is compared with sunscreens, a shampoo with shampoos.</p>
      </Message>
    );
  }

  const outcomes = await Promise.all(slugs.map(async (slug) => compareFactsOf(slug, await getStoredReview(slug))));
  const items = outcomes.flatMap((o) => (o.ok ? [o.facts] : []));
  const failed = outcomes.flatMap((o) => (o.ok ? [] : [o]));

  if (items.length < 2) {
    return (
      <Message title="We could not compare these">
        <ul className="list-disc pl-5">
          {failed.map((f) => (
            <li key={f.name}>
              {f.reason === "unfiled" ? `${f.name}: we have not filed this product's type yet, so it cannot be compared.`
                : f.reason === "unrated" ? `${f.name}: this is not rated as a cosmetic, so it cannot be compared.`
                : `${f.name}: we have no analysis of this product.`}
            </li>
          ))}
        </ul>
        <p>A comparison needs at least two products with an analysis.</p>
      </Message>
    );
  }

  const types = [...new Set(items.map((f) => f.type))];
  if (types.length > 1) {
    return (
      <Message title="These are different kinds of product">
        <p>We compare like with like, so a sunscreen is only ever put next to another sunscreen. These are:</p>
        <ul className="list-disc pl-5">
          {items.map((f: CompareFacts) => (
            <li key={f.slug}><strong className="font-bold text-[#282828]">{f.type}:</strong> {displayName(f)}</li>
          ))}
        </ul>
        <p>Start again with products of one type.</p>
      </Message>
    );
  }

  return (
    <>
      <TrackView slugs={items.map((f) => f.slug)} />
      {failed.length > 0 && (
        <p role="status" className="max-w-[1100px] mx-auto px-5 sm:px-8 lg:px-12 pt-4 text-[13px] text-[#8a5a00]">
          Left out: {failed.map((f) => f.name).join(", ")} (no analysis we can compare).
        </p>
      )}
      <CompareView items={items} comparison={buildComparison(items)} />
    </>
  );
}
