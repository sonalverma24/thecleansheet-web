import Link from "next/link";
import { Reveal } from "@/components/motion/Motion";
import StatusBanner from "@/components/standard/StatusBanner";
import ClaimsLibrary from "./ClaimsLibrary";
import { CLAIMS } from "@/data/standard";

export const metadata = {
  title: "Public Claims Library",
  description:
    "What every beauty marketing claim has to prove: clinically proven, dermatologist tested, fragrance-free, reef-safe, recyclable and more. The evidence we need, what doesn't count, and the wording that's actually allowed.",
};

export default function ClaimsPage() {
  return (
    <div className="bg-white">
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 pt-8 md:pt-12 pb-8">
        <Reveal>
          <p className="text-[12px] uppercase text-[var(--color-primary)]" style={{ letterSpacing: "0.14em" }}>
            <Link href="/standard" className="hover:underline">The Standard</Link> · Claims library
          </p>
          <h1 className="font-display mt-5 text-[40px] md:text-[56px] leading-[1.06] tracking-[-0.02em] text-[var(--color-charcoal)] max-w-3xl">
            What every claim must prove.
          </h1>
          <p className="mt-6 text-[17px] leading-[1.7] text-[var(--color-warm-gray)] max-w-2xl">
            What counts is what the claim means to a shopper. Having an ingredient in the bottle
            rarely proves the product actually does the thing. For each of {CLAIMS.length} claims,
            here&apos;s what it tells a buyer, the evidence we need to see, what doesn&apos;t count,
            the wording that&apos;s allowed, and what we publish once it checks out.
          </p>
        </Reveal>
        <div className="mt-8 max-w-3xl">
          <Reveal delay={0.1}><StatusBanner compact /></Reveal>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-16 pb-24">
        <ClaimsLibrary />
        <p className="mt-10 text-[13px] leading-[1.7] text-[var(--color-warm-gray)] max-w-2xl">
          A certified product page lists only the claims covered by its certificate, and states
          that no other claims are covered. Unsupported material claims are corrected or removed
          before certification.
        </p>
      </section>
    </div>
  );
}
