import BrandsBand from "@/components/home/BrandsBand";
import ClaimSample from "@/components/home/ClaimSample";
import ClosingCta from "@/components/home/ClosingCta";
import CommunityIllustrative from "@/components/home/CommunityIllustrative";
import EducationSection from "@/components/home/EducationSection";
import HomeFAQ from "@/components/home/HomeFAQ";
import HomeHero from "@/components/home/HomeHero";
import MoreFromTcs from "@/components/home/MoreFromTcs";
import Shelf from "@/components/home/Shelf";
import ThreeWays from "@/components/home/ThreeWays";
import { buildHomeFaqJsonLd, buildHomeFaqs } from "@/components/home/home-faqs";
import { buildShelf, popularChecks } from "@/lib/home-shelf";
import { listRepositoryCatalogueProducts } from "@/lib/product-review-engine";
import { getSiteStats } from "@/lib/site-stats";

// The shelf and the FAQ quote live review / brand / ingredient data; refresh every 5 minutes.
export const revalidate = 300;

export const metadata = {
  alternates: { canonical: "https://thecleansheet.in" },
};

export default async function HomePage() {
  const [stats, tiles] = await Promise.all([getSiteStats(), listRepositoryCatalogueProducts(1000)]);
  const faqs = buildHomeFaqs(stats);
  const cards = buildShelf(tiles);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildHomeFaqJsonLd(faqs)) }}
      />
      <HomeHero popular={popularChecks(cards)} />
      <ThreeWays />
      {/* Up to five products (the owner's picks, else the newest), so there are no type chips to filter them by. */}
      <Shelf cards={cards} categories={[]} />
      <ClaimSample />
      <CommunityIllustrative />
      <EducationSection />
      <BrandsBand />
      <MoreFromTcs />
      <ClosingCta />
      <HomeFAQ faqs={faqs} />
    </>
  );
}
