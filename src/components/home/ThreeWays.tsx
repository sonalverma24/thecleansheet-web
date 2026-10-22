import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Motion";
import { WHATSAPP_COMMUNITY_URL } from "@/lib/site-links";

/* Three doors into the site. On a phone they are compact rows (a small picture, a
   one-line promise and an arrow), as in the mobile design; from tablet up they are
   the larger picture cards. `external` cards open another site in a new tab: the
   Community card goes straight to the consumer WhatsApp group. */
const WAYS = [
  {
    n: "01", eyebrow: "ANALYSER", title: "Check any product",
    short: "Every claim next to what was tested.",
    desc: "Search a product or paste a link. See every claim on the pack next to what was actually tested.",
    cta: "Try the analyser", href: "/brands", external: false,
    img: "/images/home/products/cosrx-bha-liquid.webp", fit: "contain" as const,
  },
  {
    n: "02", eyebrow: "COMMUNITY", title: "Ask people who use it",
    short: "Honest reviews, evidence marked.",
    desc: "Real routines and honest reviews, with answers that match the evidence clearly marked.",
    cta: "Join the conversation", href: WHATSAPP_COMMUNITY_URL, external: true,
    img: "/images/home/photos/flatlay-pink.webp", fit: "cover" as const,
  },
  {
    n: "03", eyebrow: "EDUCATION", title: "Learn to read a label",
    short: "Myths, ingredients, cheat codes.",
    desc: "Myths busted, ingredients explained, and cheat codes you will actually remember at the shelf.",
    cta: "Start learning", href: "/education", external: false,
    img: "/images/home/photos/flatlay-teal.webp", fit: "cover" as const,
  },
];

const CARD =
  "group h-full flex flex-row items-center gap-3.5 p-3 bg-white border border-[#e5dfd6] rounded-[14px] active:scale-[0.98] transition-[box-shadow,transform] duration-[240ms] " +
  "md:flex-col md:items-stretch md:gap-0 md:p-0 md:overflow-hidden md:active:scale-100 md:hover:shadow-[0_2px_4px_rgba(40,40,40,0.08),0_18px_40px_rgba(40,40,40,0.10)]";

export default function ThreeWays() {
  return (
    <section className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pb-12 sm:pb-28 flex flex-col gap-3 md:gap-6">
      <span className="text-[10px] md:text-[12px] font-bold tracking-[0.18em] text-[#4a4a4a]">THREE WAYS WE HELP YOU BUY BETTER</span>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {WAYS.map((w, i) => {
          const body = (
            <>
              <div className="relative flex-none w-[84px] h-[84px] rounded-lg overflow-hidden border border-[#e5dfd6] bg-white md:w-full md:h-auto md:aspect-[16/9] md:rounded-none md:border-0 md:border-b">
                <Image
                  src={w.img}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 84px"
                  className={w.fit === "contain" ? "object-contain" : "object-cover"}
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-1 md:p-6 md:gap-2.5">
                <span className="text-[10px] md:text-[11px] font-bold tracking-[0.18em] text-[#248179]">{w.n} · {w.eyebrow}</span>
                <span className="font-display font-light text-[21px] md:text-[28px] leading-[1.1] tracking-[-0.01em] text-[#282828]">{w.title}</span>
                <span className="md:hidden text-[12px] leading-[1.45] text-[#4a4a4a]">{w.short}</span>
                <span className="hidden md:block text-[14px] leading-[1.6] text-[#4a4a4a] flex-1">{w.desc}</span>
                <span className="hidden md:flex justify-between pt-3.5 border-t border-[#e5dfd6] text-[13px] font-bold text-[#248179]">
                  <span>{w.cta}</span>
                  <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </span>
              </div>
              <span aria-hidden className="md:hidden flex-none text-[16px] text-[#248179]">→</span>
            </>
          );
          return (
            <Reveal key={w.n} delay={i * 0.08}>
              {w.external ? (
                <a href={w.href} target="_blank" rel="noopener noreferrer" className={CARD}>{body}</a>
              ) : (
                <Link href={w.href} className={CARD}>{body}</Link>
              )}
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
