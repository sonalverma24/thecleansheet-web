import type { Metadata } from "next";
import BrandDirectoryClient from "@/components/brands/BrandDirectoryClient";
import { getBrandDirectory } from "@/lib/brand-directory";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Browse Beauty Brands · The Clean Sheet",
  description: "Explore independent product reviews by beauty brand. See the distribution of product standings and published brand facts, manufacturing disclosures and community sentiment.",
  alternates: { canonical: "https://thecleansheet.in/brands" },
  openGraph: {
    title: "Browse Beauty Brands | The Clean Sheet",
    description: "What do we know about the products, company and evidence behind a beauty brand?",
    url: "https://thecleansheet.in/brands",
    type: "website",
  },
};

export default async function BrandsPage() {
  const brands = await getBrandDirectory();
  const cards = brands.map((brand) => ({
    slug: brand.slug,
    name: brand.name,
    description: brand.description,
    founded: brand.founded,
    logoUrl: brand.logoUrl,
    countryOfOrigin: brand.countryOfOrigin,
    indiaPresence: brand.indiaPresence,
    globalPresence: brand.globalPresence,
    counts: brand.counts,
    ratedCount: brand.ratedCount,
    standing: brand.standing,
    leadingColor: brand.leadingColor,
  }));

  return (
    <div className="min-h-screen bg-white">
      <section className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12 pt-12 pb-10 sm:pt-20 sm:pb-14">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#248179] mb-4">For consumers / Browse brands</p>
        <h1 className="font-display font-light text-[clamp(42px,5.4vw,70px)] leading-[1.05] text-[#282828] max-w-[770px]">
          Know the brand behind the product.
        </h1>
        <p className="mt-6 text-[16px] leading-[1.7] text-[#555] max-w-[720px]">
          Explore every brand with a product analysed by The Clean Sheet. Compare product standings,
          find the company and manufacturers where disclosed, and see what community evidence is available.
        </p>
        <div className="mt-7 flex flex-wrap gap-5 text-[14px] text-[#4a4a4a]">
          <span><strong className="text-[#282828]">{brands.length}</strong> covered brands</span>
          <span>Portfolio standing reflects the most common colour among rated products.</span>
        </div>
      </section>
      <BrandDirectoryClient brands={cards} />
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12 pb-14">
        <p className="border-t border-[#e5dfd6] pt-5 text-[12px] leading-relaxed text-[#837d78]">
          Portfolio standing summarises reviewed products only. It does not certify every product a brand makes.
          Brands with fewer than three rated products are marked Limited coverage. Missing manufacturer or
          community information is reported as unavailable, not treated as a negative verdict.
        </p>
      </div>
    </div>
  );
}
