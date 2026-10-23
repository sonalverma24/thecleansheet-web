import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Motion";

/* "How the analyser reads a claim". The card on the right is a SAMPLE: the pack
   image is a pre-blurred file (the original never ships) and no brand is named
   anywhere in it. */

const QUESTIONS = [
  "Is the study relevant to the claim being made?",
  "Was the finished product tested, or just an ingredient?",
  "Do the results apply to the people it’s marketed to?",
  "Is the evidence still current for this formula?",
];

export default function ClaimSample() {
  return (
    <section className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pb-14 sm:pb-[120px] grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
      <Reveal>
        <div className="flex flex-col gap-4 md:gap-[22px]">
          <span className="text-[10px] md:text-[12px] font-bold tracking-[0.18em] text-[#248179]">HOW THE ANALYSER READS A CLAIM</span>
          <h2 className="font-display font-light text-[clamp(36px,4.6vw,60px)] leading-[1.02] tracking-[-0.02em] text-[#282828]">
            A lab report is a start.
            <br />
            <span className="text-[#248179]">Not the whole story.</span>
          </h2>
          <p className="text-[16px] leading-[1.6] text-[#4a4a4a] max-w-[480px]">
            Brands may already invest in legitimate testing. Our role is to independently assess the evidence, explain its
            limits, and translate the result into something you can actually use.
          </p>
          <ul className="flex flex-col max-w-[480px]">
            {QUESTIONS.map((q) => (
              <li key={q} className="flex gap-3.5 py-[13px] border-b border-[#e5dfd6] text-[14px] text-[#282828]">
                <span aria-hidden className="text-[#248179]">✓</span>
                {q}
              </li>
            ))}
          </ul>
          <Link href="/standard" className="self-start text-[14px] font-bold text-[#248179] hover:underline underline-offset-[3px]">
            See how we assess evidence
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="border border-[#e5dfd6] rounded-[22px] overflow-hidden bg-white shadow-[0_1px_2px_rgba(40,40,40,0.06),0_8px_24px_rgba(40,40,40,0.06)]">
          <div className="bg-[#248179] text-white px-4 sm:px-6 py-3.5 md:py-[18px] flex flex-wrap justify-between items-center gap-x-4 gap-y-1">
            <span className="text-[10px] font-bold tracking-[0.18em]">SAMPLE CLAIM ANALYSIS</span>
            <span className="hidden sm:inline font-display font-light text-[22px]">What the proof really says</span>
          </div>
          <div className="flex gap-3 md:gap-5 p-4 sm:p-6 border-b border-[#e5dfd6] items-center">
            <div className="relative w-[60px] h-[60px] md:w-[88px] md:h-[88px] flex-none overflow-hidden rounded-lg border border-[#e5dfd6] bg-white">
              <Image
                src="/images/home/sample-product-blurred.webp"
                alt="A sample product pack, blurred on purpose"
                fill
                sizes="88px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold tracking-[0.18em] text-[#b0a8a4]">THE PRODUCT LABEL SAYS</span>
              <span className="font-bold text-[16px] text-[#282828]">“Makes the pores appear smaller.”</span>
              <span className="text-[13px] text-[#4a4a4a] leading-[1.5]">
                A visual promise that sounds measurable, but depends on how and when it was measured.
              </span>
            </div>
          </div>
          <div className="p-4 sm:p-6 border-b border-[#e5dfd6] flex flex-col gap-1.5">
            <span className="text-[10px] font-bold tracking-[0.18em] text-[#b0a8a4]">THE EVIDENCE SUPPLIED IN THIS EXAMPLE</span>
            <span className="font-bold text-[16px] text-[#282828]">4 week self assessment, 30 adults</span>
            <span className="text-[13px] text-[#4a4a4a] leading-[1.5]">
              Shows people felt their pores looked smaller. It does not measure pore size, and no control group was used.
            </span>
          </div>
          <div className="px-4 sm:px-6 py-3.5 md:py-5 bg-[#ffe6e4] flex gap-3.5 items-start">
            <span aria-hidden className="text-[#fd6158] font-bold text-[18px] leading-none">✗</span>
            <div className="flex flex-col gap-1">
              <span className="font-bold text-[14px] text-[#c23d35]">Perception only, not measured</span>
              <span className="text-[12px] text-[#4a4a4a]">
                Instrument measurement against a control is needed under the TCCS framework.
              </span>
            </div>
          </div>
          <p className="px-4 sm:px-6 py-3 text-[11px] text-[#4a4a4a] bg-white border-t border-[#e5dfd6]">
            <span className="font-bold tracking-[0.12em] text-[#282828]">SAMPLE</span> · An illustrative example, not an
            analysis of any real product.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
