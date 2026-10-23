import Image from "next/image";
import { Reveal } from "@/components/motion/Motion";
import { WHATSAPP_COMMUNITY_URL, WHATSAPP_FOUNDER_COMMUNITY_URL } from "@/lib/site-links";

/* Community block: sample threads in the format of the real conversation,
   the shelfie-check card, and the two WhatsApp communities. */

const COMMUNITY_LINKS = [
  { href: WHATSAPP_COMMUNITY_URL, eyebrow: "CONSUMER COMMUNITY", title: "Ask, compare and learn together", note: "For shoppers checking products and building routines." },
  { href: WHATSAPP_FOUNDER_COMMUNITY_URL, eyebrow: "FOUNDER COMMUNITY", title: "Build with founders who care", note: "For brands making evidence-led personal care." },
];

const THREADS = [
  {
    q: "Is the BHA liquid purging me or breaking me out?",
    meta: "Exfoliants · 38 replies",
    a: "Purging shows up where you usually break out and clears in 4 to 6 weeks. New spots in new places usually mean it isn’t for you.",
    by: "Top answer · Riya, oily skin",
    img: "/images/home/products/cosrx-bha-liquid.webp",
  },
  {
    q: "Does heartleaf actually do anything in a rinse-off cleanser?",
    meta: "Cleansers · 21 replies",
    a: "Not much. It’s on your skin for under a minute. Buy the foam for how it cleans, not for the extract.",
    by: "Top answer · Kabir, sensitive skin",
    img: "/images/home/products/anua-heartleaf-foam.webp",
  },
  {
    q: "Do pimple patches work on the deep, painful ones?",
    meta: "Spot care · 54 replies",
    a: "They’re for whiteheads with fluid to absorb. For deep cysts, see a dermatologist instead.",
    by: "Top answer · Meera, acne-prone",
    img: "/images/home/products/cosrx-master-patch.webp",
  },
];

export default function CommunityIllustrative() {
  return (
    <section id="community" className="scroll-mt-24 max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pb-14 sm:pb-[120px] flex flex-col gap-5 md:gap-10">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div className="flex flex-col gap-4">
          <span className="text-[10px] md:text-[12px] font-bold tracking-[0.18em] text-[#248179]">02 · CONSUMER COMMUNITY</span>
          <h2 className="font-display font-light text-[clamp(36px,4.6vw,60px)] leading-[1.02] tracking-[-0.02em] text-[#282828]">
            Ask people who’ve
            <br />
            actually used it.
          </h2>
        </div>
        <p className="text-[15px] leading-[1.6] text-[#4a4a4a] max-w-[380px]">
          Real experiences, side by side with the evidence. Answers that match a proof record are marked, so opinion and
          fact never blur.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 items-start">
        <Reveal>
          <div className="flex flex-col border border-[#e5dfd6] rounded-[14px] overflow-hidden bg-white">
            {THREADS.map((t) => (
              <div key={t.q} className="px-4 sm:px-6 py-4 md:py-[22px] border-b border-[#e5dfd6] flex flex-col gap-3 md:gap-3.5 bg-white">
                <div className="flex gap-3.5 items-start">
                  <div className="relative w-11 h-11 md:w-14 md:h-14 flex-none rounded-lg border border-[#e5dfd6] bg-white overflow-hidden">
                    <Image src={t.img} alt="" fill sizes="56px" className="object-contain" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <span className="font-bold text-[15px] md:text-[16px] leading-[1.35] text-[#282828]">{t.q}</span>
                    <span className="text-[12px] text-[#4a4a4a]">{t.meta}</span>
                  </div>
                </div>
                <div className="ml-0 md:ml-[70px] border-l-2 border-[#248179] pl-3.5 flex flex-col gap-1.5">
                  <span className="text-[13px] md:text-[14px] leading-[1.55] text-[#282828]">{t.a}</span>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                    <span className="text-[12px] text-[#4a4a4a]">{t.by}</span>
                    <span className="bg-[#e3f1ef] text-[#248179] text-[10px] font-bold tracking-[0.1em] px-2 py-[3px] rounded-full">
                      ✓ MATCHES THE EVIDENCE
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 sm:px-6 py-4 text-[13px] font-bold text-[#248179] flex justify-between hover:bg-[#e3f1ef] transition-colors"
            >
              <span>See the real conversation on WhatsApp</span>
             
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative rounded-[22px] overflow-hidden bg-[#282828] aspect-[4/5] md:aspect-auto md:min-h-[460px]">
            <Image
              src="/images/home/photos/flatlay-pink.webp"
              alt="A vanity covered in beauty products"
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-x-3 bottom-3 md:inset-x-5 md:bottom-5 bg-white rounded-[14px] p-[18px] md:p-[22px] flex flex-col gap-2.5 md:gap-3 shadow-[0_2px_4px_rgba(40,40,40,0.08),0_18px_40px_rgba(40,40,40,0.10)]">
              <span className="text-[10px] font-bold tracking-[0.18em] text-[#248179]">SHELFIE CHECK</span>
              <span className="font-display font-light text-[24px] leading-[1.15] text-[#282828]">
                Post your shelf. We’ll tell you what’s doubling up.
              </span>
              <span className="text-[13px] text-[#4a4a4a] leading-[1.5]">
                Share a photo of your routine and the community, plus our analysts, flag overlaps and clashes.
              </span>
              <a
                href={WHATSAPP_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="self-stretch md:self-start text-center bg-[#248179] hover:bg-[#1d6b64] text-white rounded-lg px-[18px] py-3.5 md:py-3 text-[14px] font-bold transition-colors"
              >
                Join the community
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#e5dfd6] border border-[#e5dfd6] rounded-[14px] overflow-hidden">
        {COMMUNITY_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white p-6 flex flex-col gap-2 transition-colors hover:bg-[#e3f1ef]"
          >
            <span className="text-[11px] font-bold tracking-[0.18em] text-[#248179]">{l.eyebrow}</span>
            <span className="font-display font-light text-[22px] leading-[1.15] text-[#282828]">{l.title}</span>
            <span className="flex justify-between items-center gap-4 text-[13px] text-[#4a4a4a]">
              {l.note}
              <span className="font-bold text-[#248179] whitespace-nowrap">Join on WhatsApp</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
