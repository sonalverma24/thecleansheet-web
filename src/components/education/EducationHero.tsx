import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Motion";

/* The Education hero ("The answer is on the label."), shared by the /education
   page and the home page so the two can never drift apart. The caller supplies
   the surrounding container; `heading` lets a page that already has an h1 use h2. */

const DISPLAY_LIGHT = { fontWeight: 300 } as const;

export default function EducationHero({ heading = "h1", priority = false }: { heading?: "h1" | "h2"; priority?: boolean }) {
  const Heading = heading;
  return (
    <Reveal>
      <div className="relative rounded-[2rem] overflow-hidden min-h-[440px] md:min-h-[520px] flex items-center">
        <Image
          src="/images/maria-lupan-9PnU-U7V6YE-unsplash.jpg"
          alt="A lineup of serums with their ingredient labels"
          fill
          priority={priority}
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 1120px"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(11,36,34,0.94) 0%, rgba(11,36,34,0.66) 38%, rgba(11,36,34,0.18) 66%, rgba(11,36,34,0) 100%)" }} />
        <div className="relative px-7 md:px-16 py-14 max-w-2xl">
          <p className="text-[12px] uppercase" style={{ letterSpacing: "0.16em", color: "#80d5cc" }}>Education · Read the label</p>
          <Heading className="font-display text-white text-[38px] md:text-[58px] leading-[1.04] tracking-[-0.02em] mt-5" style={DISPLAY_LIGHT}>
            The answer is
            <br />on the label.
          </Heading>
          <p className="text-white/85 text-[16px] md:text-[17px] leading-[1.7] mt-6 max-w-lg">
            The front of the pack sells a story. The back tells the truth. We teach you to read it,
            ingredient by ingredient and claim by claim, so no marketing line goes unchecked.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/ingredients" className="rounded-full px-7 py-3.5 text-[15px] text-[#0b2422] bg-white hover:opacity-90 transition-opacity">Explore ingredients →</Link>
            <Link href="/standard/claims" className="rounded-full px-7 py-3.5 text-[15px] text-white border border-white/40 hover:bg-white/10 transition-colors">What claims must prove</Link>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
