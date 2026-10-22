import Image from "next/image";
import Link from "next/link";
import { HeroReveal } from "@/components/motion/Motion";
import HeroSearch from "./HeroSearch";

/* Hero: the promise, a search that runs the review in place, and the flatlay.
   Phone layout follows the mobile design: stacked, a swipeable row of popular
   checks, and one "what shoppers can see" card sitting inside the photo. */

const CHECKS: [string, string][] = [
  ["Ingredients evaluated", "✓ Explained"],
  ["Claims mapped to tests", "✓ Explained"],
  ["Who should use caution", "✓ Visible"],
];

export default function HomeHero({ popular }: { popular: { label: string; href: string }[] }) {
  return (
    <section className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pt-8 sm:pt-16 lg:pt-[88px] pb-10 sm:pb-12 lg:pb-[72px] grid grid-cols-1 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] gap-8 sm:gap-12 lg:gap-16 items-center">
      <div className="flex flex-col gap-5 md:gap-7">
        <HeroReveal>
          <p className="flex items-center gap-2 text-[10px] md:text-[12px] font-bold tracking-[0.18em] text-[#248179] uppercase">
            <span aria-hidden className="md:hidden flex-none w-[7px] h-[7px] rounded-full border-2 border-[#248179]" />
            Evidence led personal care &amp; beauty, made simple
          </p>
        </HeroReveal>
        <HeroReveal delay={0.05}>
          <h1 className="font-display font-light text-[clamp(46px,5.2vw,74px)] leading-none tracking-[-0.025em] text-[#282828] text-balance">
            Before you buy,
            <br />
            <span className="text-[#248179]">see the proof.</span>
          </h1>
        </HeroReveal>
        <HeroReveal delay={0.1}>
          <p className="text-[16px] md:text-[18px] leading-[1.55] md:leading-[1.6] text-[#4a4a4a] max-w-[500px] text-pretty">
            Find out what a skincare product claims, what the evidence actually supports, and whether it meets an
            independent standard. Less guesswork. Better buying decisions.
          </p>
        </HeroReveal>
        <HeroReveal delay={0.15}>
          <HeroSearch />
          {popular.length > 0 && (
            <div className="mt-3 md:mt-4 flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap md:items-center md:gap-x-4 md:gap-y-1 text-[13px] text-[#4a4a4a]">
              <span className="hidden md:inline">Popular checks:</span>
              {popular.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="flex-none whitespace-nowrap border border-[#e5dfd6] rounded-full px-3.5 py-[9px] font-bold text-[#248179] md:border-0 md:rounded-none md:p-0 md:font-normal md:underline md:underline-offset-[3px]"
                >
                  {p.label}
                </Link>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-[#4a4a4a]">
            <span><span className="text-[#248179]">✓</span> Free public product reviews</span>
            <span><span className="text-[#248179]">✓</span> Independent certification is separate from reviews</span>
          </div>
        </HeroReveal>
      </div>

      <HeroReveal delay={0.1}>
        <div className="relative lg:pb-10">
          <div className="relative rounded-[22px] overflow-hidden aspect-[4/3.6] lg:aspect-[4/3.4] bg-[#248179]">
            <Image
              src="/images/home/photos/flatlay-teal.webp"
              alt="Skincare and makeup products laid flat"
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="hidden lg:flex absolute top-6 -right-3 w-[220px] bg-white rounded-[14px] p-[18px] shadow-[0_2px_4px_rgba(40,40,40,0.08),0_18px_40px_rgba(40,40,40,0.10)] flex-col gap-2.5">
            <span className="self-start bg-[#e3f1ef] text-[#248179] text-[10px] font-bold tracking-[0.12em] px-2.5 py-1 rounded-full">
              ✓ PROOF PREVIEW
            </span>
            <span className="font-display font-light text-[24px] leading-[1.1] text-[#282828]">Clarity, not just claims.</span>
            <span className="text-[12px] text-[#4a4a4a] leading-[1.5]">
              Every claim on the pack, checked against what was actually tested.
            </span>
          </div>
          <div className="absolute inset-x-3 bottom-3 lg:inset-x-auto lg:-left-3 lg:bottom-0 lg:w-[280px] bg-white rounded-[14px] px-4 py-3.5 lg:px-5 lg:py-[18px] shadow-[0_2px_4px_rgba(40,40,40,0.08),0_18px_40px_rgba(40,40,40,0.10)] text-[13px] text-[#282828]">
            <div className="hidden lg:block font-bold pb-2.5 border-b border-[#e5dfd6]">What shoppers can see</div>
            {CHECKS.map(([label, value], i) => (
              <div
                key={label}
                className={`flex justify-between gap-3 py-[7px] lg:pt-[9px] lg:pb-0 ${i < CHECKS.length - 1 ? "border-b border-[#e5dfd6] lg:pb-[9px]" : ""} ${i === 0 ? "pt-0 lg:pt-[9px]" : ""} ${i === CHECKS.length - 1 ? "pb-0" : ""}`}
              >
                <span>{label}</span>
                <span className="text-[#248179] font-bold whitespace-nowrap">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </HeroReveal>
    </section>
  );
}
