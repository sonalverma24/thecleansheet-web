import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, Building2, MessageSquareText } from "lucide-react";
import BrandLogo from "@/components/brands/BrandLogo";
import { getBrandDirectory, standingForProduct, type StandingColor, type PortfolioStanding } from "@/lib/brand-directory";

export const revalidate = 300;

const COLORS: Record<StandingColor, string> = {
  green: "#248179", yellow: "#D2A63C", red: "#FD6158", unrated: "#B0A8A4",
};
const COLOR_LABELS: Record<StandingColor, string> = {
  green: "Green · Good Standing", yellow: "Yellow · Room to Improve",
  red: "Red · Not Recommended", unrated: "Not rated",
};
const STANDING_LABELS: Record<PortfolioStanding, string> = {
  green: "Mostly Green", yellow: "Mostly Yellow", red: "Mostly Red",
  mixed: "Mixed", limited: "Limited coverage", unrated: "Not rated",
};

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = (await getBrandDirectory()).find((item) => item.slug === slug);
  if (!brand) return {};
  return {
    title: brand.name + " Brand Profile · The Clean Sheet",
    description: "See all " + brand.products.length + " analysed products from " + brand.name + ", their standings, published company information, manufacturer disclosures and Reddit discussion analysis.",
    alternates: { canonical: "https://thecleansheet.in/brands/" + brand.slug },
  };
}

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: slug } = await params;
  const brand = (await getBrandDirectory()).find((item) => item.slug === slug);
  if (!brand) notFound();

  const total = brand.products.length;
  const foundedYear = Number.parseInt(brand.founded ?? "", 10);
  const years = Number.isFinite(foundedYear) && foundedYear > 1800 && foundedYear <= new Date().getFullYear()
    ? new Date().getFullYear() - foundedYear : null;

  return (
    <div className="min-h-screen bg-white text-[#282828]">
      <div className="mx-auto max-w-[1150px] px-5 sm:px-8 lg:px-12 pt-8 pb-24">
        <nav className="flex flex-wrap items-center gap-2 text-[13px] text-[#6c6865] mb-12" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#248179]">Home</Link>
          <span>/</span>
          <Link href="/brands" className="hover:text-[#248179]">Browse brands</Link>
          <span>/</span>
          <span className="text-[#282828]">{brand.name}</span>
        </nav>

        <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-14 items-start pb-12 border-b border-[#e5dfd6]">
          <div>
            <p className="uppercase text-[11px] tracking-[0.18em] text-[#248179] mb-3">Independent brand profile</p>
            <div className="flex items-center gap-4 sm:gap-5">
              <BrandLogo name={brand.name} logoUrl={brand.logoUrl} size={88} />
              <h1 className="min-w-0 font-display font-light text-[clamp(42px,5vw,70px)] leading-[1.05]">{brand.name}</h1>
            </div>
            <p className="mt-5 max-w-[660px] text-[16px] leading-[1.7] text-[#4a4a4a]">
              {brand.description ?? "This brand is included because we have analysed at least one of its products. Company background is being verified."}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#6c6865] mt-5">
              <span>{brand.founded ? "Founded " + brand.founded + (years !== null ? " · " + years + " years in market" : "") : "Founding year not verified"}</span>
              {brand.countryOfOrigin && <span>Origin: {brand.countryOfOrigin}</span>}
              {brand.website && <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-[#248179] inline-flex items-center gap-1">Official website <ArrowUpRight size={13} /></a>}
            </div>
          </div>
          <aside className="rounded-2xl bg-[#f4faf9] border border-[#dfeae8] p-6">
            <p className="uppercase tracking-[0.14em] text-[11px] text-[#248179]">Product portfolio standing</p>
            <h2 className="font-display font-light text-[34px] mt-2">{STANDING_LABELS[brand.standing]}</h2>
            {brand.standing === "limited" && brand.leadingColor && <p className="text-[13px] text-[#4a4a4a] mt-1">Current leading colour: {brand.leadingColor}</p>}
            <p className="text-[13px] text-[#555] mt-1">{brand.ratedCount} of {total} analysed products rated</p>
            <div className="flex h-3 mt-5 overflow-hidden rounded-full bg-[#ebe9e6]" role="img"
              aria-label={String(brand.counts.green) + " green, " + String(brand.counts.yellow) + " yellow, " + String(brand.counts.red) + " red, " + String(brand.counts.unrated) + " unrated"}>
              {(["green", "yellow", "red", "unrated"] as const).map((color) => (
                brand.counts[color] > 0 ? (
                  <span key={color} style={{ width: String(brand.counts[color] / total * 100) + "%", backgroundColor: COLORS[color] }} />
                ) : null
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[13px]">
              {(["green", "yellow", "red", "unrated"] as const).map((color) => (
                <div key={color} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[color] }} />
                  <span className="capitalize">{color}: {brand.counts[color]}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 pt-4 border-t border-[#dfeae8] text-[12px] leading-[1.6] text-[#6c6865]">
              The most frequent colour among rated products determines standing. Fewer than three rated products means Limited coverage. This is not a certification of the brand.
            </p>
          </aside>
        </header>

        <section className="pt-12" aria-labelledby="products-heading">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <p className="uppercase tracking-[0.14em] text-[11px] text-[#248179] mb-2">What we have checked</p>
              <h2 id="products-heading" className="font-display font-light text-[34px]">Products reviewed</h2>
            </div>
            <Link href="/products" className="text-[14px] text-[#248179] hover:underline">Browse all products</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {brand.products.map((product) => {
              const color = standingForProduct(product);
              return (
                <Link key={product.slug} href={"/analysis/" + product.slug}
                  className="group rounded-2xl border border-[#e5dfd6] p-5 hover:border-[#248179] transition-colors flex flex-col gap-3">
                  <span className="uppercase text-[11px] tracking-[0.08em] inline-flex items-center gap-2"
                    style={{ color: COLORS[color] }}>
                    <span className="h-2 w-2 rounded-full" style={{ background: COLORS[color] }} />
                    {COLOR_LABELS[color]}
                  </span>
                  <h3 className="font-display font-light text-[21px] leading-snug group-hover:text-[#248179]">{product.productName}</h3>
                  {product.summary && <p className="text-[13px] leading-[1.55] text-[#6c6865] line-clamp-2">{product.summary}</p>}
                  <span className="mt-auto pt-3 text-[13px] text-[#248179]">Read the analysis →</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 mt-14" aria-label="Brand background">
          <article className="rounded-2xl border border-[#e5dfd6] p-6 sm:p-7">
            <h2 className="font-display font-light text-[27px]">Brand background</h2>
            <dl className="mt-6 space-y-5">
              <div><dt className="text-[12px] text-[#77716d]">Country of origin</dt><dd className="text-[15px] mt-1">{brand.countryOfOrigin ?? "Not yet verified"}</dd></div>
              <div><dt className="text-[12px] text-[#77716d]">Headquarters</dt><dd className="text-[15px] mt-1">{brand.headquarters ?? "Not yet verified"}</dd></div>
              <div><dt className="text-[12px] text-[#77716d]">Presence in India</dt><dd className="text-[15px] mt-1">{brand.indiaPresence ?? "Not yet verified"}</dd></div>
              <div><dt className="text-[12px] text-[#77716d]">Global presence</dt><dd className="text-[15px] mt-1">{brand.globalPresence ?? "Not yet verified"}</dd></div>
            </dl>
            {brand.sourceUrl && <a className="mt-6 inline-flex items-center gap-1 text-[13px] text-[#248179]" href={brand.sourceUrl} target="_blank" rel="noopener noreferrer">Brand facts source <ArrowUpRight size={13} /></a>}
          </article>
          <article className="rounded-2xl border border-[#e5dfd6] p-6 sm:p-7">
            <div className="flex gap-2 items-center"><Building2 size={19} className="text-[#248179]" /><h2 className="font-display font-light text-[27px]">Who makes the products?</h2></div>
            {brand.manufacturers.length ? (
              <div className="mt-5 space-y-4">
                {brand.manufacturers.map((manufacturer) => (
                  <div key={manufacturer.id} className="border-b border-[#e5dfd6] pb-4 last:border-none">
                    <p className="text-[15px] font-medium">{manufacturer.manufacturerName}</p>
                    <p className="text-[13px] text-[#6c6865] mt-1">{manufacturer.location ?? "Location not published"}</p>
                    <p className="text-[12px] text-[#6c6865] mt-1">
                      {manufacturer.productSlug
                        ? "Product: " + (brand.products.find((p) => p.slug === manufacturer.productSlug)?.productName ?? manufacturer.productSlug)
                        : "Brand disclosure · product scope not specified"}
                    </p>
                    {manufacturer.sourceUrl && <a className="inline-flex items-center gap-1 mt-2 text-[13px] text-[#248179]" href={manufacturer.sourceUrl} target="_blank" rel="noopener noreferrer">Source <ArrowUpRight size={12} /></a>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[14px] leading-[1.65] text-[#6c6865] mt-5">
                We have not yet published source verified manufacturer information for these products. Absence of a record does not imply noncompliance.
              </p>
            )}
          </article>
        </section>

        <section className="mt-5 rounded-2xl border border-[#e5dfd6] p-6 sm:p-8" aria-labelledby="sentiment-heading">
          <div className="flex gap-3 items-center"><MessageSquareText size={21} className="text-[#248179]" /><h2 id="sentiment-heading" className="font-display font-light text-[29px]">What Reddit users are saying</h2></div>
          {brand.sentiment ? (
            <div className="mt-5">
              <p className="text-[14px]">Published sentiment: <strong className="capitalize">{brand.sentiment.standing}</strong> · {brand.sentiment.discussionCount} discussions examined</p>
              <p className="mt-1 text-[12px] text-[#77716d]">
                {brand.sentiment.periodStart && brand.sentiment.periodEnd ? "Observation period: " + brand.sentiment.periodStart + " to " + brand.sentiment.periodEnd : "Observation period not supplied"}
                {brand.sentiment.checkedAt ? " · Last checked " + brand.sentiment.checkedAt.slice(0, 10) : ""}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 mt-6">
                <div><h3 className="text-[14px] font-medium">Frequently appreciated</h3><ul className="mt-2 space-y-2 text-[14px] text-[#555]">{brand.sentiment.praise.length ? brand.sentiment.praise.map((theme) => <li key={theme}>{theme}</li>) : <li>Not enough consistent evidence</li>}</ul></div>
                <div><h3 className="text-[14px] font-medium">Recurring complaints</h3><ul className="mt-2 space-y-2 text-[14px] text-[#555]">{brand.sentiment.complaints.length ? brand.sentiment.complaints.map((theme) => <li key={theme}>{theme}</li>) : <li>Not enough consistent evidence</li>}</ul></div>
              </div>
              {brand.sentiment.sourceUrls.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-5">
                  {brand.sentiment.sourceUrls.map((url, i) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#248179]">Reddit discussion {i + 1} ↗</a>)}
                </div>
              )}
            </div>
          ) : <p className="text-[14px] text-[#6c6865] leading-[1.7] mt-4">A source checked Reddit sentiment assessment has not been published for this brand yet.</p>}
          <p className="text-[12px] text-[#837d78] leading-[1.6] mt-6 pt-4 border-t border-[#e5dfd6]">
            Reddit themes reflect selected public discussions, not a representative consumer survey. Comments and author experiences are not independently verified. Community sentiment does not affect product standings.
          </p>
        </section>
        <Link href="/brands" className="inline-flex items-center gap-2 text-[14px] text-[#248179] mt-10"><ArrowLeft size={16} /> Back to brands</Link>
      </div>
    </div>
  );
}
