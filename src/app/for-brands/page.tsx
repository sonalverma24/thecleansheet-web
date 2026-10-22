import Image from "next/image";
import Link from "next/link";
import BrandsFaq from "@/components/brands/BrandsFaq";
import SwipeRow from "@/components/brands/SwipeRow";
import OpenFormButton from "@/components/OpenFormButton";
import { Reveal } from "@/components/motion/Motion";
import { ACCREDITATION_FULL, AccreditationLine, PUBLIC_REVIEW_DISCLOSURE } from "@/components/standard/Disclosures";
import { PACKAGING_VENDOR_FORM_URL, WHATSAPP_FOUNDER_COMMUNITY_URL } from "@/lib/site-links";

/* ────────────────────────────────────────────────────────────────
   FOR BRANDS · certification, the founder community and the packaging
   directory. Certification is a voluntary private scheme that is not
   yet accredited: the disclosures from Disclosures.tsx stay on the page.
   Every "request an invite" goes straight to the founder WhatsApp group.

   Layout is mobile-first, following the mobile design: stacked full-width
   buttons, swipeable cards with dots, numbered rows, a chat card for the
   community, and a sticky "Get certified / Join community" bar. From tablet
   up it is the desktop design.
──────────────────────────────────────────────────────────────── */

const WRAP = "max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12";
const EYEBROW = "text-[11px] md:text-[12px] font-bold tracking-[0.18em] uppercase text-[#248179]";
const H2 = "font-display font-light text-[clamp(34px,4vw,56px)] leading-[1.1] md:leading-[1.08] tracking-[-0.02em] text-[#282828]";
const BTN = "inline-flex items-center justify-center w-full h-[52px] md:w-auto md:h-auto rounded-lg px-[22px] md:py-[15px] text-[16px] md:text-[15px] font-bold whitespace-nowrap transition-[background-color,transform] active:scale-[0.98] md:active:scale-100";
const BTN_SOLID = `${BTN} bg-[#248179] hover:bg-[#1b6860] text-white`;
const BTN_OUTLINE = `${BTN} border border-[#282828] text-[#282828] hover:bg-[#e3f1ef]`;
const BTN_DARK = `${BTN} bg-[#282828] hover:bg-[#3a3a3a] text-white`;
const CARD_LINK = "mt-auto pt-3.5 md:pt-3 text-[15px] md:text-[14px] font-bold text-[#282828] underline underline-offset-4 hover:text-[#248179]";
const SWIPE_CARD = "flex-none w-[85%] snap-start md:w-auto";

const PROOF_ROWS: [string, string, boolean][] = [
  ["Aqua, Glycerin", "Low concern", true],
  ["Avena sativa kernel flour 1%", "Supports claim", true],
  ["Butyrospermum parkii butter", "Low concern", true],
  ["Phenoxyethanol 0.8%", "Within limits", true],
  ["“Clinically proven 48h hydration”", "Evidence gap", false],
];

const WHY = [
  { n: "01", t: "An independent expert panel", d: "Every product is reviewed by specialists in global regulation, toxicology, formulation and industry practice." },
  { n: "02", t: "Credibility that stands apart", d: "Brands and marketplaces are about to drown in self-declared proof. Independence is what makes yours believable." },
  { n: "03", t: "Discovery and global reach", d: "Certified products are easier to find on The Clean Sheet, with a record built to global benchmarks that opens doors to new markets." },
];

const OUTPUTS = [
  "A product-specific certification decision",
  "A readable summary of claims and testing",
  "A live, QR-linked registry status",
  "Suitability, cautions and scope of review",
];

const STEPS = [
  { t: "Tell us about your product", d: "Category, intended users, target markets, claims and current testing." },
  { t: "Share your evidence confidentially", d: "Formula, label, test reports and manufacturing documents, under NDA." },
  { t: "Expert panel review", d: "Assessed against TCCS. Existing reports count where they qualify; gaps are flagged." },
  { t: "Decision and public record", d: "Qualifying products go live with their proof record and stay under review." },
];

const FAQ = [
  { q: "Do we need to repeat our existing lab tests?", a: "Not necessarily. Relevant reports are assessed for method, lab competence, product version and recency. Extra testing is only requested where evidence falls short." },
  { q: "Does paying the fee guarantee certification?", a: "No. The fee covers the assessment, not the outcome. Only qualifying products are certified." },
  { q: "Is certification per brand or per product?", a: "Per product. Each certification covers a specific formulation and documented scope." },
  { q: "Is the founder community tied to certification?", a: "No. They are separate, and membership has no influence on outcomes." },
  { q: "Is the packaging directory live?", a: "Not yet. Recommend vendors through the form and we will review every submission before listing." },
  { q: "Is The Clean Sheet accredited?", a: `${ACCREDITATION_FULL} Certification does not replace regulatory approval or legal compliance obligations.` },
  { q: "How is this different from a public review?", a: `${PUBLIC_REVIEW_DISCLOSURE} Certification, by contrast, assesses the confidential dossier under NDA and reaches an independent decision.` },
];

const CHAT = [
  { who: "Ananya · Baby care", color: "#fd6158", text: "Anyone found a pump bottle vendor in Gujarat with MOQs under 5k?", time: "10:02" },
  { who: "Rohan · Haircare", color: "#248179", text: "We use one in Vapi. 3k MOQ, ask for compatibility testing upfront. Will DM you.", time: "10:06" },
];

const TOPICS = ["Packaging and MOQs", "Testing and claims", "Retail and marketplaces"];

export default function ForBrandsPage() {
  return (
    <div className="bg-white text-[#282828]">
      {/* ═══ Hero ═══ */}
      <section className="pt-10 pb-12 md:py-[clamp(64px,8vw,112px)]">
        <div className={`${WRAP} grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-[clamp(40px,6vw,88px)] items-center`}>
          <div className="flex flex-col gap-5 md:gap-6 items-start">
            <span className={EYEBROW}>The Clean Sheet for brands</span>
            <h1 className="font-display font-light text-[clamp(44px,5vw,72px)] leading-[1.04] md:leading-[1.03] tracking-[-0.025em] text-balance">
              Build a brand <span className="text-[#248179]">worth believing in.</span>
            </h1>
            <p className="text-[17px] md:text-[18px] leading-[1.55] md:leading-[1.6] text-[#4a4a4a] max-w-[520px] text-pretty">
              Independent product certification, an invite-only founder community and the industry contacts that make building
              easier. All in one place.
            </p>
            <div className="flex flex-col md:flex-row md:flex-wrap gap-2.5 md:gap-3 mt-1 md:mt-2 w-full md:w-auto">
              <OpenFormButton className={BTN_SOLID}>Request an eligibility review</OpenFormButton>
              <Link href="/standard" className={BTN_OUTLINE}>Read the standard</Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:gap-4 mt-3 md:mt-0">
            <div className="relative rounded-[22px] overflow-hidden border border-[#e5dfd6] bg-white">
              <div aria-hidden className="blur-[2.4px] md:blur-[2.6px] scale-[1.02] p-[22px] md:p-7 flex flex-col gap-4 md:gap-[18px] select-none">
                <div className="flex gap-3.5 md:gap-4 items-center pt-9 md:pt-0">
                  <div className="w-14 h-[72px] md:w-[72px] md:h-[92px] rounded-xl md:rounded-[14px] bg-[#e3f1ef] flex items-end justify-center pb-2 md:pb-2.5 flex-none">
                    <div className="w-7 h-[46px] md:w-9 md:h-[58px] rounded-[8px_8px_5px_5px] md:rounded-[10px_10px_6px_6px] bg-white border-2 border-[#248179]" />
                  </div>
                  <div className="flex flex-col gap-1 md:gap-1.5 min-w-0">
                    <span className="text-[10px] md:text-[11px] tracking-[0.16em] font-bold text-[#8a8380]">BABY CARE · 200 ML</span>
                    <span className="font-display text-[21px] md:text-[26px] leading-[1.1]">Daily Baby Moisturiser</span>
                    <span className="hidden md:block text-[13px] text-[#4a4a4a]">Gentle lotion with oat and shea</span>
                  </div>
                  <div className="ml-auto flex-none w-14 h-14 md:w-[72px] md:h-[72px] rounded-full border-[5px] md:border-[6px] border-[#248179] flex items-center justify-center font-display text-[24px] md:text-[28px] text-[#248179]">✓</div>
                </div>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  <span className="bg-[#e3f1ef] text-[#248179] rounded-full px-2.5 md:px-3 py-[5px] md:py-1.5 text-[11px] md:text-[12px] font-bold">✓ Fragrance free</span>
                  <span className="bg-[#e3f1ef] text-[#248179] rounded-full px-2.5 md:px-3 py-[5px] md:py-1.5 text-[11px] md:text-[12px] font-bold">✓ Paediatric tested</span>
                  <span className="bg-[#ffe6e4] text-[#c8433b] rounded-full px-2.5 md:px-3 py-[5px] md:py-1.5 text-[11px] md:text-[12px] font-bold">✗ 1 claim unsupported</span>
                </div>
                <div className="border-t border-[#e5dfd6] text-[13px] md:text-[14px]">
                  {PROOF_ROWS.map(([name, verdict, ok], i) => (
                    <div key={name} className={`flex justify-between gap-2 py-2.5 md:py-3 ${i < PROOF_ROWS.length - 1 ? "border-b border-[#e5dfd6]" : ""} ${i === 1 ? "hidden md:flex" : ""}`}>
                      <span>{name}</span>
                      <span className="font-bold whitespace-nowrap" style={{ color: ok ? "#248179" : "#fd6158" }}>{verdict}</span>
                    </div>
                  ))}
                </div>
                <div className="hidden md:flex justify-between text-[12px] text-[#8a8380]"><span>Sample record · TCCS 1.0</span><span>Illustrative</span></div>
              </div>
              <div className="absolute left-4 top-4 md:left-5 md:top-5 bg-[#282828] text-white rounded-full px-3 md:px-3.5 py-[7px] md:py-2 text-[10px] md:text-[11px] font-bold tracking-[0.16em] whitespace-nowrap">
                THE PRODUCT PROOF EXPERIENCE
              </div>
            </div>
            <p className="text-[13px] text-[#8a8380]">A sample proof record, blurred. Not a real product.</p>
          </div>
        </div>
      </section>

      {/* ═══ Three ways ═══ */}
      <section id="pathways" className="scroll-mt-24 py-12 md:py-[clamp(72px,9vw,120px)] border-t border-[#e5dfd6]">
        <div className={`${WRAP} flex flex-col gap-6 md:gap-12`}>
          <div className="flex flex-col gap-3 md:gap-4 max-w-[640px]">
            <span className={EYEBROW}>For the people building beauty</span>
            <h2 className={H2}>Three ways we can help you build.</h2>
          </div>
          <SwipeRow>
            <Reveal className={SWIPE_CARD}>
              <article className="h-full border border-[#e5dfd6] rounded-[14px] overflow-hidden flex flex-col">
                <div className="h-[180px] md:h-[240px] flex items-center justify-center bg-[#e3f1ef]">
                  <Image src="/images/brands/certification-seal.webp" alt="The Clean Sheet certification seal (sample)" width={226} height={226} className="h-[150px] md:h-[226px] w-auto object-contain" />
                </div>
                <div className="p-[22px] md:p-7 flex flex-col gap-2.5 md:gap-3 flex-1">
                  <span className="text-[10px] md:text-[11px] font-bold tracking-[0.18em] text-[#248179]">01 · TCCS CERTIFICATION</span>
                  <h3 className="font-display font-light text-[23px] md:text-[26px] leading-[1.15]">Make your product evidence count.</h3>
                  <p className="text-[15px] leading-[1.55] md:leading-[1.6] text-[#4a4a4a]">Independent review of your formula, testing and claims, turned into a public record shoppers can read.</p>
                  <a href="#certification" className={CARD_LINK}>Explore certification</a>
                </div>
              </article>
            </Reveal>
            <Reveal className={SWIPE_CARD} delay={0.08}>
              <article className="h-full border border-[#e5dfd6] rounded-[14px] overflow-hidden flex flex-col">
                <div className="relative h-[180px] md:h-[240px] overflow-hidden">
                  <Image src="/images/brands/founders-blurred.webp" alt="Founders in the community, faces blurred" fill sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 85vw" className="object-cover scale-[1.12]" />
                  <a
                    href={WHATSAPP_FOUNDER_COMMUNITY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center h-11 md:h-auto bg-white hover:bg-[#e3f1ef] text-[#282828] rounded-full px-5 md:py-3 text-[14px] font-bold whitespace-nowrap shadow-[0_1px_2px_rgba(40,40,40,0.06),0_8px_24px_rgba(40,40,40,0.06)] transition-colors"
                  >
                    Request invite
                  </a>
                </div>
                <div className="p-[22px] md:p-7 flex flex-col gap-2.5 md:gap-3 flex-1">
                  <span className="text-[10px] md:text-[11px] font-bold tracking-[0.18em] text-[#248179]">02 · FOUNDER COMMUNITY</span>
                  <h3 className="font-display font-light text-[23px] md:text-[26px] leading-[1.15]">Build alongside people who get it.</h3>
                  <p className="text-[15px] leading-[1.55] md:leading-[1.6] text-[#4a4a4a]">A private circle of founders trading honest lessons on formulation, claims, testing and distribution.</p>
                  <a href="#community" className={CARD_LINK}>See the community</a>
                </div>
              </article>
            </Reveal>
            <Reveal className={SWIPE_CARD} delay={0.16}>
              <article className="h-full border border-[#e5dfd6] rounded-[14px] overflow-hidden flex flex-col">
                <div className="relative h-[180px] md:h-[240px] overflow-hidden">
                  <Image src="/images/brands/manufacturing-line.webp" alt="Cosmetics manufacturing line" fill sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 85vw" className="object-cover" />
                </div>
                <div className="p-[22px] md:p-7 flex flex-col gap-2.5 md:gap-3 flex-1">
                  <span className="text-[10px] md:text-[11px] font-bold tracking-[0.18em] text-[#248179]">03 · FOUNDER NETWORK</span>
                  <h3 className="font-display font-light text-[23px] md:text-[26px] leading-[1.15]">Good vendors shouldn’t be hard to find.</h3>
                  <p className="text-[15px] leading-[1.55] md:leading-[1.6] text-[#4a4a4a]">A founder-recommended directory of manufacturers, packaging and industry partners. Starting with packaging.</p>
                  <a href="#directory" className={CARD_LINK}>Explore the directory</a>
                </div>
              </article>
            </Reveal>
          </SwipeRow>
        </div>
      </section>

      {/* ═══ Why independent proof ═══ */}
      <section id="why" className="scroll-mt-24 bg-[#282828] text-white py-14 md:py-[clamp(80px,10vw,136px)]">
        <div className={`${WRAP} flex flex-col gap-9 md:gap-16`}>
          <div className="flex flex-col gap-3 md:gap-4 max-w-[760px]">
            <span className="text-[11px] md:text-[12px] font-bold tracking-[0.18em] uppercase text-[#b0a8a4]">Why independent proof</span>
            <h2 className="font-display font-light text-[clamp(38px,4.6vw,64px)] leading-[1.06] md:leading-[1.05] tracking-[-0.02em] text-white">
              Anyone can claim it. Few can <span className="text-[#d2ff34]">prove</span> it.
            </h2>
          </div>
          <div className="flex flex-col md:grid md:grid-cols-3 md:gap-12">
            {WHY.map((w, i) => (
              <Reveal key={w.n} delay={i * 0.08}>
                <div className="grid grid-cols-[40px_1fr] gap-3 border-t border-white/[0.22] py-[22px] md:flex md:flex-col md:gap-3.5 md:pt-7 md:pb-0 max-md:last:border-b">
                  <span className="font-display text-[26px] md:text-[40px] leading-none text-white">{w.n}</span>
                  <div className="flex flex-col gap-1.5 md:gap-3.5">
                    <h3 className="font-sans font-bold text-[17px] md:text-[19px] leading-[1.35] text-white tracking-normal">{w.t}</h3>
                    <p className="text-[15px] md:text-[16px] leading-[1.55] md:leading-[1.6] text-[#d6d1cf]">{w.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="text-[13px] md:text-[14px] leading-[1.6] text-[#b0a8a4] max-w-[640px]">
            Brands fund the assessment. They never buy the verdict. Status can be suspended or revoked when evidence changes.
          </p>
        </div>
      </section>

      {/* ═══ Certification ═══ */}
      <section id="certification" className="scroll-mt-24 py-14 md:py-[clamp(80px,10vw,136px)]">
        <div className={`${WRAP} grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-[clamp(48px,7vw,104px)] items-start`}>
          <div className="flex flex-col gap-5 items-start">
            <span className={EYEBROW}>TCCS certification</span>
            <h2 className={H2}>The output isn’t a logo. It’s a proof record.</h2>
            <p className="text-[16px] md:text-[17px] leading-[1.55] md:leading-[1.6] text-[#4a4a4a] max-w-[480px]">
              Qualifying products get a public page that shows what was checked, what the evidence supports and what shoppers should know.
            </p>
            <ul className="flex flex-col w-full max-w-[480px] border-t border-[#e5dfd6] md:mt-2">
              {OUTPUTS.map((o) => (
                <li key={o} className="flex gap-3 md:gap-3.5 py-3.5 border-b border-[#e5dfd6] text-[15px]">
                  <span aria-hidden className="text-[#248179] font-bold">✓</span>
                  {o}
                </li>
              ))}
            </ul>
            <AccreditationLine className="max-w-[480px]" />
          </div>

          <div className="flex flex-col gap-5 md:gap-8">
            <span className="text-[11px] md:text-[12px] font-bold tracking-[0.18em] uppercase text-[#8a8380]">How the review works</span>
            <ol className="flex flex-col gap-5 md:gap-7">
              {STEPS.map((s, i) => (
                <li key={s.t} className="grid grid-cols-[36px_1fr] md:grid-cols-[48px_1fr] gap-3 md:gap-4">
                  <span className="font-display text-[26px] md:text-[28px] text-[#248179] leading-none">{i + 1}</span>
                  <div className="flex flex-col gap-1 md:gap-1.5">
                    <h3 className="font-sans font-bold text-[16px] md:text-[17px] tracking-normal text-[#282828]">{s.t}</h3>
                    <p className="text-[15px] leading-[1.55] md:leading-[1.6] text-[#4a4a4a]">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="flex flex-col md:flex-row md:flex-wrap gap-1.5 md:gap-3 md:items-center mt-2 md:mt-0">
              <OpenFormButton className={BTN_SOLID}>Request an eligibility review</OpenFormButton>
              <Link href="/standard" className="flex items-center justify-center h-12 md:h-auto text-[15px] font-bold text-[#282828] underline underline-offset-4 md:px-2.5 hover:text-[#248179]">
                Read the standard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Founder community ═══ */}
      <section id="community" className="scroll-mt-24 py-14 md:py-[clamp(80px,10vw,136px)] border-t border-[#e5dfd6]">
        <div className={`${WRAP} grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-[clamp(48px,7vw,104px)] items-center`}>
          <div className="flex flex-col gap-5 items-start">
            <span className={EYEBROW}>Founder community</span>
            <h2 className={H2}>Ask founders who’ve actually built it.</h2>
            <p className="text-[16px] md:text-[17px] leading-[1.55] md:leading-[1.6] text-[#4a4a4a] max-w-[480px]">
              A private, invite-only group for beauty founders. Real questions, quick answers, and people who’ve made the same decisions before you.
            </p>

            {/* Phone: a compact chat card */}
            <div aria-hidden className="md:hidden w-full rounded-[22px] overflow-hidden border border-[#e5dfd6] my-1">
              <div className="flex items-center gap-2.5 px-3.5 py-3 bg-[#248179]">
                <Image src="/logo.png" alt="" width={34} height={34} className="w-[34px] h-[34px] rounded-full bg-white" />
                <div className="flex flex-col gap-px min-w-0">
                  <span className="text-[15px] font-bold text-white">TCS Founder Circle</span>
                  <span className="text-[11px] text-[#d9eee9] truncate">Beauty and personal care founders</span>
                </div>
              </div>
              <div className="bg-[#e3f1ef] px-3 py-3.5 flex flex-col gap-2">
                <span className="self-center bg-white rounded-md px-2.5 py-1 text-[10px] font-bold text-[#8a8380]">TODAY</span>
                {CHAT.map((m) => (
                  <div key={m.who} className="self-start max-w-[84%] bg-white rounded-[4px_12px_12px_12px] px-2.5 py-2 flex flex-col gap-[3px]">
                    <span className="text-[11px] font-bold" style={{ color: m.color }}>{m.who}</span>
                    <span className="text-[14px] leading-[1.4]">{m.text}</span>
                    <span className="text-[9px] text-[#8a8380] self-end">{m.time}</span>
                  </div>
                ))}
                <div className="self-end max-w-[84%] bg-[#d9eee9] rounded-[12px_4px_12px_12px] px-2.5 py-2 flex flex-col gap-[3px]">
                  <span className="text-[14px] leading-[1.4]">That saves me weeks. Thank you!</span>
                  <span className="text-[9px] text-[#8a8380] self-end">10:07 ✓✓</span>
                </div>
                <div className="self-start max-w-[84%] bg-white rounded-[4px_12px_12px_12px] px-2.5 py-2 flex flex-col gap-[3px] blur-[1.5px]">
                  <span className="text-[11px] font-bold text-[#7a6a2a]">Meera · Sunscreen</span>
                  <span className="text-[14px] leading-[1.4]">Can we say “dermatologist tested” with a 20-person HRIPT?</span>
                </div>
              </div>
            </div>

            <ul className="hidden md:flex flex-col gap-2.5 text-[15px] my-1">
              {["Packaging, sourcing and MOQs", "Testing budgets and claim wording", "Distribution, retail and marketplaces"].map((t) => (
                <li key={t} className="flex gap-3"><span aria-hidden className="text-[#248179] font-bold">✓</span>{t}</li>
              ))}
            </ul>
            <div className="md:hidden flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <span key={t} className="border border-[#e5dfd6] rounded-full px-3.5 py-2 text-[13px]">{t}</span>
              ))}
            </div>

            <a href={WHATSAPP_FOUNDER_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className={BTN_DARK}>
              Request an invite
            </a>
            <p className="text-[13px] leading-[1.55] md:leading-[1.6] text-[#8a8380] max-w-[440px]">
              Membership is separate from certification and has no influence on TCCS outcomes.
            </p>
          </div>

          {/* Tablet and up: the phone mock */}
          <div className="hidden md:flex bg-[#248179] rounded-[22px] py-[clamp(28px,5vw,56px)] px-5 justify-center">
            <div aria-hidden className="w-full max-w-[330px] bg-[#282828] rounded-[44px] p-2.5 shadow-[0_2px_4px_rgba(40,40,40,0.08),0_18px_40px_rgba(40,40,40,0.10)]">
              <div className="bg-white rounded-[35px] overflow-hidden flex flex-col h-[580px]">
                <div className="flex justify-between px-6 pt-3 pb-1.5 text-[12px] font-bold"><span>9:41</span><span>5G</span></div>
                <div className="flex items-center gap-2.5 px-4 pt-2 pb-3 border-b border-[#e5dfd6]">
                  <Image src="/logo.png" alt="" width={36} height={36} className="w-9 h-9 rounded-full bg-[#e3f1ef]" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-bold">TCS Founder Circle</span>
                    <span className="text-[11px] text-[#8a8380]">Beauty and personal care founders</span>
                  </div>
                </div>
                <div className="flex-1 bg-[#e3f1ef] px-3 py-3.5 flex flex-col gap-2.5 overflow-hidden">
                  <span className="self-center bg-white rounded-md px-2.5 py-1 text-[10px] font-bold text-[#8a8380]">TODAY</span>
                  {CHAT.map((m) => (
                    <div key={m.who} className="self-start max-w-[82%] bg-white rounded-[4px_12px_12px_12px] px-2.5 py-2 flex flex-col gap-[3px]">
                      <span className="text-[11px] font-bold" style={{ color: m.color }}>{m.who}</span>
                      <span className="text-[13px] leading-[1.4]">{m.text}</span>
                      <span className="text-[9px] text-[#8a8380] self-end">{m.time}</span>
                    </div>
                  ))}
                  <div className="self-end max-w-[82%] bg-[#d9eee9] rounded-[12px_4px_12px_12px] px-2.5 py-2 flex flex-col gap-[3px]">
                    <span className="text-[13px] leading-[1.4]">Thank you! That saves me weeks.</span>
                    <span className="text-[9px] text-[#8a8380] self-end">10:07 ✓✓</span>
                  </div>
                  <div className="self-start max-w-[82%] bg-white rounded-[4px_12px_12px_12px] px-2.5 py-2 flex flex-col gap-[3px]">
                    <span className="text-[11px] font-bold text-[#7a6a2a]">Meera · Sunscreen</span>
                    <span className="text-[13px] leading-[1.4]">Quick one: can we say “dermatologist tested” with a 20-person HRIPT?</span>
                    <span className="text-[9px] text-[#8a8380] self-end">11:31</span>
                  </div>
                  <div className="self-start max-w-[82%] bg-white rounded-[4px_12px_12px_12px] px-2.5 py-2 flex flex-col gap-[3px] blur-[1.5px]">
                    <span className="text-[11px] font-bold text-[#248179]">Kabir · Skincare</span>
                    <span className="text-[13px] leading-[1.4]">Depends on who supervised it. Check the claims library first, it covers this exact case.</span>
                    <span className="text-[9px] text-[#8a8380] self-end">11:40</span>
                  </div>
                </div>
                <div className="flex gap-2 items-center px-3 pt-2.5 pb-[18px] bg-white">
                  <div className="flex-1 border border-[#e5dfd6] rounded-full px-3.5 py-[9px] text-[13px] text-[#b0a8a4]">Message</div>
                  <div className="w-9 h-9 rounded-full bg-[#248179]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Packaging directory ═══ */}
      <section id="directory" className="scroll-mt-24 py-14 md:py-[clamp(80px,10vw,136px)] border-t border-[#e5dfd6]">
        <div className={`${WRAP} grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-[clamp(48px,7vw,104px)] items-center`}>
          <div className="hidden lg:block relative rounded-[22px] overflow-hidden aspect-[4/3]">
            <Image src="/images/brands/packaging-directory.webp" alt="A page of a printed business directory" fill sizes="540px" className="object-cover" />
            <span className="absolute left-5 bottom-5 bg-[#282828] text-[#d2ff34] rounded-full px-3.5 py-2 text-[11px] font-bold tracking-[0.16em]">COMING SOON</span>
          </div>
          <div className="flex flex-col gap-5 items-start">
            <span className={EYEBROW}>Founder network · Packaging directory</span>
            <h2 className={H2}>The yellow pages for beauty packaging.</h2>
            <div className="lg:hidden relative w-full rounded-[22px] overflow-hidden aspect-[4/3]">
              <Image src="/images/brands/packaging-directory.webp" alt="A page of a printed business directory" fill sizes="(min-width: 768px) 90vw, 100vw" className="object-cover" />
              <span className="absolute left-3.5 bottom-3.5 bg-[#282828] text-[#d2ff34] rounded-full px-3 py-[7px] text-[10px] font-bold tracking-[0.16em]">COMING SOON</span>
            </div>
            <p className="text-[16px] md:text-[17px] leading-[1.55] md:leading-[1.6] text-[#4a4a4a] max-w-[480px]">
              Bottles, pumps, jars, tubes, cartons and sustainable options. A directory built from founder recommendations, reviewed before anything is listed.
            </p>
            <p className="hidden md:block text-[15px] leading-[1.6] font-bold mt-2">Know a packaging vendor who does good work?</p>
            <a href={PACKAGING_VENDOR_FORM_URL} target="_blank" rel="noopener noreferrer" className={BTN_SOLID}>Recommend a vendor</a>
            <p className="text-[13px] leading-[1.55] md:leading-[1.6] text-[#8a8380]">No vendors are currently endorsed.</p>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="scroll-mt-24 py-14 md:py-[clamp(80px,10vw,136px)] border-t border-[#e5dfd6]">
        <div className={`${WRAP} grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-[clamp(40px,6vw,96px)]`}>
          <div className="flex flex-col gap-3 md:gap-4">
            <span className={EYEBROW}>Good to know</span>
            <h2 className={H2}>Questions founders actually ask.</h2>
          </div>
          <BrandsFaq items={FAQ} />
        </div>
      </section>

      {/* Phone: the sticky bar from the mobile design */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-[#e5dfd6] px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] flex gap-2">
        <OpenFormButton className="flex-1 h-12 rounded-lg bg-[#248179] active:scale-[0.98] text-white text-[15px] font-bold whitespace-nowrap transition-transform">
          Get certified
        </OpenFormButton>
        <a
          href={WHATSAPP_FOUNDER_COMMUNITY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 h-12 inline-flex items-center justify-center rounded-lg border border-[#282828] text-[#282828] text-[15px] font-bold whitespace-nowrap"
        >
          Join community
        </a>
      </div>
    </div>
  );
}
