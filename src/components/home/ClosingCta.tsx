import Link from "next/link";

export default function ClosingCta() {
  return (
    <section className="bg-[#282828] text-white">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 py-12 md:py-[72px] flex flex-col items-stretch md:flex-row md:flex-wrap md:items-center md:justify-between gap-4 md:gap-8">
        <div className="flex flex-col gap-3">
          <span className="font-display font-light text-[clamp(32px,4vw,48px)] leading-[1.08] tracking-[-0.01em]">
            Proof is the new beauty <span className="text-[#d2ff34]">essential.</span>
          </span>
          <span className="text-[14px] md:text-[15px] text-[#b0a8a4]">Start with the product you’ve been thinking about buying.</span>
        </div>
        <Link
          href="/brands"
          className="bg-white hover:bg-[#e3f1ef] text-[#282828] rounded-lg h-[50px] md:h-auto inline-flex items-center justify-center px-[22px] md:py-3.5 text-[15px] md:text-[14px] font-bold transition-colors"
        >
          Check a product
        </Link>
      </div>
    </section>
  );
}
