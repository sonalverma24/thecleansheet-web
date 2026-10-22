import type { ReactNode } from "react";
import Link from "next/link";
import OpenFormButton from "@/components/OpenFormButton";
import { Reveal } from "@/components/motion/Motion";
import { WHATSAPP_FOUNDER_COMMUNITY_URL } from "@/lib/site-links";

/* For brands. Three offers, shown as three cards from tablet up and, as in the mobile
   design, as one card of tap-to-open rows on a phone. Same content in both. */

const BTN_BASE = "self-start rounded-lg border border-[#248179] px-[18px] py-3 text-[14px] font-bold transition-[transform,background-color] active:scale-[0.98]";
const BTN_LIGHT = `${BTN_BASE} bg-white text-[#248179] hover:bg-[#e3f1ef]`;
const BTN_SOLID = `${BTN_BASE} bg-[#248179] text-white hover:bg-[#1d6b64]`;

interface Offer {
  n: string;
  eyebrow: string;
  title: string;
  desc: string;
  points: string[];
  cta: (cls: string) => ReactNode;
}

const OFFERS: Offer[] = [
  {
    n: "01", eyebrow: "OUR STANDARD", title: "The TCCS framework",
    desc: "What certification requires, claim by claim. Public, versioned and free to read.",
    points: ["Claim level evidence rules", "Published conflict of interest policy", "Versioned with every update"],
    cta: (cls) => <Link href="/standard" className={`${cls} ${BTN_LIGHT}`}>Read the standard</Link>,
  },
  {
    n: "02", eyebrow: "GET CERTIFIED", title: "Turn your testing into proof",
    desc: "Submit your evidence. We assess it independently and publish a live proof record.",
    points: ["Apply and share your dossier", "Independent evidence review", "Public record with live status"],
    cta: (cls) => <OpenFormButton className={`${cls} ${BTN_SOLID}`}>Start an application</OpenFormButton>,
  },
  {
    n: "03", eyebrow: "FOUNDER COMMUNITY", title: "Build with founders who care",
    desc: "A private circle for founders making evidence-led personal care.",
    points: ["Monthly founder circles"],
    cta: (cls) => (
      <a href={WHATSAPP_FOUNDER_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className={`${cls} ${BTN_LIGHT}`}>
        Request an invite
      </a>
    ),
  },
];

export default function BrandsBand() {
  return (
    <section id="brands" className="scroll-mt-24 bg-[#248179] text-white">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-28 flex flex-col gap-5 md:gap-10">
        <div className="flex flex-wrap items-end justify-between gap-5 md:gap-8">
          <div className="flex flex-col gap-3 md:gap-4">
            <span className="text-[10px] md:text-[12px] font-bold tracking-[0.18em] text-white">FOR BRANDS</span>
            <h2 className="font-display font-light text-[clamp(36px,4.6vw,60px)] leading-[1.05] md:leading-[1.02] tracking-[-0.02em] text-white">
              You paid for testing.
              <br className="hidden md:block" /> Let shoppers see it.
            </h2>
          </div>
          <div className="flex flex-col gap-3 items-start max-w-[380px]">
            <p className="text-[14px] md:text-[15px] leading-[1.55] md:leading-[1.6] text-white">
              An independent standard, a public proof record, and a room full of founders who care about the same thing.
            </p>
            <Link href="/for-brands" className="text-[14px] font-bold text-white underline underline-offset-4 hover:text-[#d2ff34] transition-colors">
              Explore everything for brands
            </Link>
          </div>
        </div>

        {/* Phone: one card of tap-to-open rows */}
        <div className="md:hidden flex flex-col bg-white text-[#282828] rounded-[14px] overflow-hidden">
          {OFFERS.map((o, i) => (
            <details key={o.n} open={i === 0} className="group border-b border-[#e5dfd6] last:border-b-0">
              <summary className="flex items-center gap-3 p-[18px] cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="flex-1 flex flex-col gap-1">
                  <span className="text-[10px] font-bold tracking-[0.18em] text-[#248179]">{o.n} · {o.eyebrow}</span>
                  <span className="font-display font-light text-[22px] leading-[1.1]">{o.title}</span>
                </span>
                <span aria-hidden className="text-[22px] font-light text-[#b0a8a4] group-open:hidden">+</span>
                <span aria-hidden className="hidden text-[22px] font-light text-[#b0a8a4] group-open:inline">−</span>
              </summary>
              <div className="px-[18px] pb-[18px] flex flex-col gap-2.5">
                <p className="text-[13px] leading-[1.55] text-[#4a4a4a]">{o.desc}</p>
                <Points items={o.points} />
                {o.cta("h-[46px] w-full inline-flex items-center justify-center self-stretch")}
              </div>
            </details>
          ))}
        </div>

        {/* Tablet and up: three cards */}
        <div className="hidden md:grid grid-cols-2 gap-5 lg:grid-cols-3">
          {OFFERS.map((o, i) => (
            <Reveal key={o.n} delay={i * 0.08}>
              <article className="h-full bg-white text-[#282828] rounded-[14px] p-7 flex flex-col gap-3.5">
                <span className="text-[11px] font-bold tracking-[0.18em] text-[#248179]">{o.n} · {o.eyebrow}</span>
                <span className="font-display font-light text-[28px] leading-[1.1] tracking-[-0.01em]">{o.title}</span>
                <span className="text-[14px] leading-[1.6] text-[#4a4a4a]">{o.desc}</span>
                <Points items={o.points} />
                {o.cta("")}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Points({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col flex-1">
      {items.map((pt) => (
        <li key={pt} className="flex gap-2.5 py-2 md:py-[9px] border-t border-[#e5dfd6] text-[13px]">
          <span aria-hidden className="text-[#248179]">✓</span>
          {pt}
        </li>
      ))}
    </ul>
  );
}
