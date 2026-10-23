import type { Metadata } from "next";
import { ALL_BRANDS } from "@/data/brands";
import { HeroReveal } from "@/components/motion/Motion";
import HeroSearch from "@/components/home/HeroSearch";
import BrandsMarketplace from "@/components/registry/BrandsMarketplace";
import { listRepositoryCatalogueProducts, listReviewIndex } from "@/lib/product-review-engine";
import { getSiteStats } from "@/lib/site-stats";
import { CrawlableIndex, type IndexGroup } from "@/components/seo/CrawlableIndex";

/* The live-review repository grows continuously — refresh the page every 5 min. */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Product Analyses · India's Independent Clean Beauty Registry",
  description:
    "Independent, science-backed analyses of India's beauty products. Marketing claims graded against real evidence, full ingredient analysis, regulatory checks, zero brand bias.",
  keywords: [
    "clean beauty brands India", "Minimalist analysis India", "best clean skincare brands India",
    "brand ingredient safety score", "skincare brand ranking India", "clean beauty certification India",
  ],
  alternates: { canonical: "https://thecleansheet.in/brands" },
  openGraph: {
    title: "Product Analyses | The Clean Sheet™",
    description: "Independent analyses of Indian beauty products. Claims checked against proof, formulas read ingredient by ingredient.",
    url: "https://thecleansheet.in/brands",
    type: "website",
  },
};

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Clean Beauty Brand Directory, The Clean Sheet™",
  description: "Science-backed scorecards for Indian beauty brands. Every product analysed for ingredient safety, regulatory compliance, and formulation quality.",
  url: "https://thecleansheet.in/brands",
  publisher: { "@type": "Organization", name: "The Clean Sheet", url: "https://thecleansheet.in" },
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Kept outside the component: the render-purity lint rule (correctly) flags a
// Date.now() call inside a component body, and this server page is revalidated
// every 5 minutes so "new in the last 30 days" is evaluated per revalidation.
function isWithinThirtyDays(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < THIRTY_DAYS_MS;
}

const norm = (brand: string, name: string) => `${brand} ${name}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export default async function BrandsPage() {
  // Live repository products join the catalogue in the same tile format,
  // newest first, skipping any product the curated catalogue already covers.
  // Stats are fetched separately (uncapped) so "products analysed" keeps
  // climbing past the number of products listed on the page.
  const [repoProducts, siteStats, reviewIndex] = await Promise.all([
    listRepositoryCatalogueProducts(200),
    getSiteStats(),
    listReviewIndex(),
  ]);
  const staticProducts = ALL_BRANDS.flatMap((b) => b.products);
  const known = new Set(staticProducts.map((p) => norm(p.brand, p.productName)));
  const freshProducts = repoProducts
    .filter((p) => !known.has(norm(p.brand, p.productName)))
    // NEW badge: only the latest 5 arrivals actually visible in the list (30-day cap)
    .map((p, idx) => ({
      ...p,
      newArrival: idx < 5 && isWithinThirtyDays(p.analyzedAt),
    }));
  const allProducts = [...freshProducts, ...staticProducts];

  // Crawlable link index (the marketplace is client-rendered past its first cards, so its
  // server HTML links to little): every catalogue brand and product, then every
  // repository review grouped by brand. A brand that is in both lists appears once.
  const groups = new Map<string, IndexGroup>();
  for (const b of ALL_BRANDS) {
    groups.set(b.name.toLowerCase(), {
      label: b.name,
      href: `/brands/${b.slug}`,
      links: b.products.map((p) => ({ href: `/brands/${b.slug}/${p.slug}`, text: p.productName })),
    });
  }
  const catalogueKeys = new Set(groups.keys());
  for (const r of reviewIndex) {
    if (!r.productName || known.has(norm(r.brand, r.productName))) continue;
    const label = r.brand || "Other brands";
    const key = label.toLowerCase();
    const g = groups.get(key) ?? { label, links: [] };
    g.links.push({ href: `/analysis/${r.slug}`, text: r.productName });
    groups.set(key, g);
  }
  const indexGroups: IndexGroup[] = [
    ...[...groups.entries()].filter(([k]) => catalogueKeys.has(k)).map(([, g]) => g),
    ...[...groups.entries()].filter(([k]) => !catalogueKeys.has(k)).map(([, g]) => g).sort((a, b) => a.label.localeCompare(b.label)),
  ];

  // Live counts come from one shared helper so every page quotes the same numbers.
  const stats = [
    { label: "Products analysed", value: siteStats.products.toLocaleString("en-IN") },
    { label: "Brands scored", value: siteStats.brands.toLocaleString("en-IN") },
    { label: "Ingredients in directory", value: siteStats.ingredients.toLocaleString("en-IN") },
  ];

  return (
    <div className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />

      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pt-8 sm:pt-14 lg:pt-[72px] pb-8 sm:pb-10 lg:pb-12 grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8 lg:gap-16 lg:items-end">
        <div className="flex flex-col gap-4 md:gap-6">
          <HeroReveal>
            <p className="text-[10px] md:text-[12px] font-bold tracking-[0.18em] text-[#248179] uppercase">Product analyses</p>
          </HeroReveal>
          <HeroReveal delay={0.05}>
            <h1 className="font-display font-light text-[clamp(38px,4.6vw,60px)] leading-[1.05] tracking-[-0.02em] text-[#282828] text-balance">
              Find products worth
              <br />
              <span className="text-[#248179]">a closer look.</span>
            </h1>
          </HeroReveal>
          <HeroReveal delay={0.1}>
            <p className="text-[15px] md:text-[17px] leading-[1.55] md:leading-[1.6] text-[#4a4a4a] max-w-[520px] text-pretty">
              Every marketing claim graded against real evidence, every formula read ingredient by ingredient. Search,
              filter and compare the products we have analysed.
            </p>
          </HeroReveal>
          <HeroReveal delay={0.15}>
            <dl className="flex flex-wrap gap-x-8 gap-y-3 pt-1">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <dd className="font-display font-light text-[28px] md:text-[34px] leading-none text-[#282828] tabular-nums">{s.value}</dd>
                  <dt className="text-[12px] md:text-[13px] text-[#4a4a4a] mt-1.5">{s.label}</dt>
                </div>
              ))}
            </dl>
          </HeroReveal>
        </div>

        <HeroReveal delay={0.15}>
          <div className="rounded-[18px] border border-[#e5dfd6] bg-[#f4faf9] p-5 md:p-7 flex flex-col gap-3 md:gap-4">
            <span className="text-[10px] md:text-[11px] font-bold tracking-[0.18em] text-[#248179] uppercase">Not listed yet?</span>
            <h2 className="font-display font-light text-[26px] md:text-[30px] leading-[1.1] text-[#282828]">Analyse any product, free.</h2>
            <p className="text-[14px] leading-[1.55] text-[#4a4a4a]">
              Paste a product name or link. If we have not analysed it yet, we will check it now and open the result.
            </p>
            <HeroSearch stacked />
          </div>
        </HeroReveal>
      </section>

      <BrandsMarketplace products={allProducts} />

      <CrawlableIndex
        id="all-reviews"
        heading="All analysed brands and products"
        intro="Every product The Clean Sheet has analysed, listed by brand."
        groups={indexGroups}
      />
    </div>
  );
}
