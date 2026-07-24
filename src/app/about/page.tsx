import Link from "next/link";
import { Reveal, Stagger, Item, TitleReveal } from "@/components/motion/Motion";
import { AccreditationLine } from "@/components/standard/Disclosures";

/* ────────────────────────────────────────────────────────────────
   ABOUT · who we are, why we exist, our principles, the founder,
   how we stay independent, and an honest accreditation status.
   Governance describes only what formally exists. No claimed panel.
──────────────────────────────────────────────────────────────── */

export const metadata = {
  title: "About",
  description:
    "The Clean Sheet is building independent evidence infrastructure for beauty and personal care, so shoppers can see the evidence behind a product, not just its marketing.",
};

const TEAL = "#248179";
const CORAL = "#fd6158";
const INK = "#282828";
const CREAM = "#fcf9f8";
const WARM = "#b0a8a4";
const HAIR = "rgba(40,40,40,0.12)";
const DISPLAY_LIGHT = { fontWeight: 300 } as const;

const PRINCIPLES = [
  { t: "Evidence over marketing language", b: "We judge a product by what the evidence shows, not by how it is described." },
  { t: "Formulation context over ingredient fear", b: "Safety comes from the whole formula and how it is used, not from a single scary-sounding ingredient." },
  { t: "Claim proof over vague assurance", b: "A claim has to be backed by real, product-specific evidence, or it is not a claim we accept." },
  { t: "Clear limits and qualifications", b: "We always state what was checked, in which market, and what it does not mean." },
  { t: "Consumer-readable proof", b: "The result should make sense to a shopper, not only to a chemist." },
  { t: "Fair and objective treatment of brands", b: "Every brand is judged on the same evidence, with a right to respond." },
  { t: "Corrections when new information appears", b: "If we get something wrong, or the evidence changes, we correct it in the open." },
];

const INDEPENDENCE = [
  "Certification decisions are made independently of any commercial relationship with the brand.",
  "Advice, evidence development and the certification decision are kept separate.",
  "Conflicts of interest are declared and managed.",
  "Public reviews carry corrections, a revision history and a right of reply.",
  "The Clean Sheet takes no paid placements, ever.",
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero · who we are */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 pt-8 md:pt-12 pb-10 md:pb-14">
        <Reveal>
          <p className="text-[12px] uppercase" style={{ letterSpacing: "0.14em", color: TEAL }}>About</p>
        </Reveal>
        <h1 className="font-display mt-6 text-[44px] md:text-[64px] leading-[1.05] tracking-[-0.02em] max-w-3xl" style={{ ...DISPLAY_LIGHT, color: INK }}>
          <TitleReveal lines={["Evidence over", "marketing."]} />
        </h1>
        <Reveal delay={0.3}>
          <p className="mt-8 text-[18px] leading-[1.7] max-w-2xl" style={{ color: WARM }}>
            The Clean Sheet is building independent evidence infrastructure for beauty and personal
            care. We publish a standard, we review products against the evidence, and we certify the
            ones that prove their claims, so a shopper can see what is really behind a product,
            not just how it is marketed.
          </p>
        </Reveal>
      </section>

      {/* Why we exist · dark */}
      <section style={{ background: INK }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-12 md:py-16">
          <Reveal>
            <p className="text-[12px] uppercase" style={{ letterSpacing: "0.14em", color: "#80d5cc" }}>Why we exist</p>
            <h2 className="font-display mt-6 text-3xl md:text-5xl leading-tight max-w-2xl" style={{ ...DISPLAY_LIGHT, color: CREAM }}>
              A wide gap between claims and proof.
            </h2>
            <div className="mt-6 flex flex-col gap-5 text-[16px] leading-[1.75] max-w-2xl" style={{ color: "#c9c6c4" }}>
              <p>
                Beauty marketing moves faster than its evidence. Terms like &ldquo;clinically proven&rdquo;,
                &ldquo;dermatologist tested&rdquo;, &ldquo;natural&rdquo; and &ldquo;clean&rdquo; are used freely, with little that
                a shopper can check for themselves.
              </p>
              <p>
                We close that gap with a published standard and public evidence, so the question
                stops being &ldquo;what does the label say&rdquo; and becomes &ldquo;what can the product actually
                show&rdquo;.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Principles */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 py-12 md:py-16">
        <Reveal>
          <p className="text-[12px] uppercase" style={{ letterSpacing: "0.14em", color: CORAL }}>Our approach</p>
          <h2 className="font-display mt-6 text-3xl md:text-5xl leading-tight max-w-2xl" style={{ ...DISPLAY_LIGHT, color: INK }}>
            The principles we hold to.
          </h2>
        </Reveal>
        <Stagger className="mt-12 grid md:grid-cols-2 gap-x-12 gap-y-8" gap={0.06}>
          {PRINCIPLES.map((p, i) => (
            <Item key={p.t} className="flex gap-5 pt-5" style={{ borderTop: `1px solid ${HAIR}` }}>
              <span className="font-display text-[18px] flex-shrink-0" style={{ color: TEAL }}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-[19px] leading-tight" style={{ ...DISPLAY_LIGHT, color: INK }}>{p.t}</h3>
                <p className="mt-1.5 text-[14px] leading-[1.65]" style={{ color: WARM }}>{p.b}</p>
              </div>
            </Item>
          ))}
        </Stagger>
      </section>

      {/* Founder */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 pb-20 md:pb-28">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-x-16 gap-y-8 items-start">
          <Reveal>
            <p className="text-[12px] uppercase" style={{ letterSpacing: "0.14em", color: TEAL }}>Founder</p>
            <div className="mt-5 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/founder-sonal.png"
                alt="Sonal Verma"
                className="w-14 h-14 rounded-full object-cover object-top flex-shrink-0"
                style={{ border: `1px solid ${HAIR}` }}
              />
              <div>
                <h2 className="font-display text-2xl md:text-3xl leading-tight" style={{ ...DISPLAY_LIGHT, color: INK }}>
                  Sonal Verma
                </h2>
                <a
                  href="https://www.linkedin.com/in/sonalverma24/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] hover:underline"
                  style={{ color: TEAL }}
                >
                  LinkedIn <span aria-hidden>↗</span>
                </a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="flex flex-col gap-4 text-[16px] leading-[1.75]" style={{ color: WARM }}>
              <p>
                The Clean Sheet was founded by Sonal Verma. She started it because the gap between
                what beauty products claim and what they can actually show had become impossible to
                ignore, and because shoppers deserve a straightforward way to see the evidence for
                themselves.
              </p>
              <p>
                The Clean Sheet is built on published standards and outside expertise, rather than
                on any one person&apos;s authority. Where specialist judgement is needed, it comes
                from qualified reviewers and named sources, not from opinion.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Governance & independence */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 pb-20 md:pb-28">
        <div className="rounded-2xl p-6 md:p-10" style={{ border: `1px solid ${HAIR}` }}>
          <Reveal>
            <p className="text-[12px] uppercase" style={{ letterSpacing: "0.14em", color: TEAL }}>Governance & independence</p>
            <h2 className="font-display mt-5 text-2xl md:text-3xl leading-tight max-w-2xl" style={{ ...DISPLAY_LIGHT, color: INK }}>
              How we keep it honest.
            </h2>
            <div className="mt-6 flex flex-col">
              {INDEPENDENCE.map((line) => (
                <p key={line} className="flex gap-3 py-3 text-[15px] leading-[1.6]" style={{ color: INK, borderTop: `1px solid ${HAIR}` }}>
                  <span className="mt-2 inline-block w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: TEAL }} />
                  {line}
                </p>
              ))}
            </div>
            <p className="mt-5 text-[14px] leading-[1.7] max-w-2xl" style={{ color: WARM }}>
              As we formally appoint specialist reviewers and governance roles, we will name them
              here with their responsibilities and declared conflicts. We do not claim a standing
              panel we have not appointed.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Accreditation status */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 pb-20 md:pb-28">
        <Reveal>
          <p className="text-[12px] uppercase pb-3" style={{ letterSpacing: "0.14em", color: TEAL }}>Accreditation status</p>
          <div className="rounded-2xl p-6" style={{ border: `1px solid ${HAIR}`, maxWidth: "48rem" }}>
            <AccreditationLine />
          </div>
        </Reveal>
      </section>

      {/* Contact · teal */}
      <section style={{ background: TEAL }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-12 md:py-16">
          <Reveal>
            <h2 className="font-display text-3xl md:text-4xl leading-tight" style={{ ...DISPLAY_LIGHT, color: CREAM }}>
              Get in touch.
            </h2>
            <p className="mt-4 text-[16px] leading-[1.7] max-w-lg" style={{ color: "rgba(252,249,248,0.85)" }}>
              Questions, corrections, or a product you want us to look at. We read everything.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <a href="mailto:hello@thecleansheet.in" className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[15px] transition-opacity hover:opacity-90" style={{ background: CREAM, color: INK }}>
                hello@thecleansheet.in <span aria-hidden>→</span>
              </a>
              <Link href="/review" className="text-[15px] transition-opacity hover:opacity-80" style={{ color: CREAM }}>
                Check a product <span aria-hidden>›</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
