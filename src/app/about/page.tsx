import Link from "next/link";
import FormModal from "@/components/FormModal";
import OpenFormButton from "@/components/OpenFormButton";
import { Reveal, Stagger, Item, TitleReveal } from "@/components/motion/Motion";
import { IngredientLattice } from "@/components/graphics/HeroArt";

/* ────────────────────────────────────────────────────────────────
   ABOUT — Evidence-First Editorial.
   Light → dark → light rhythm, brand colours, no chrome.
──────────────────────────────────────────────────────────────── */

export const metadata = {
  title: "About, The Clean Sheet™",
  description: "India's first science-backed clean beauty certification standard.",
};

const INK = "#282828";
const CREAM = "#fcf9f8";
const TEAL_SOFT = "#80d5cc";
const CORAL = "#fd6158";
const LIME = "#d2ff34";
const WARM = "#b0a8a4";
const HAIR_DARK = "rgba(252,249,248,0.14)";
const HAIR_LIGHT = "rgba(40,40,40,0.15)";

const BELIEFS = [
  { text: "Ingredient transparency is non-negotiable", tag: "Core", good: true },
  { text: "Science over marketing. Always.", tag: "Core", good: true },
  { text: "Panel experts have no brand conflicts", tag: "Core", good: true },
  { text: "Public scorecards. Free. Forever.", tag: "Open", good: true },
  { text: "Evidence before every claim", tag: "Verified", good: true },
  { text: "“Chemical-free” claims", tag: "Banned", good: false },
  { text: "Undisclosed INCI ingredients", tag: "Banned", good: false },
  { text: "Paid placements or brand bias", tag: "Banned", good: false },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <FormModal />

      {/* ═══ Hero ═══ */}
      <section className="relative max-w-[1200px] mx-auto px-4 md:px-16 pt-16 md:pt-24 pb-16 md:pb-20">
        {/* Hero art: floating ingredient lattice — desktop only */}
        <div className="hidden lg:block absolute right-16 top-20 w-[380px] h-[250px] rotate-2" aria-hidden>
          <IngredientLattice className="w-full h-full shadow-2xl" />
        </div>
        <Reveal>
          <p className="text-[12px] uppercase text-[var(--color-primary)]" style={{ letterSpacing: "0.14em" }}>
            Our mission
          </p>
        </Reveal>
        <h1 className="font-display mt-6 text-[44px] md:text-[64px] leading-[1.05] tracking-[-0.02em] text-[var(--color-charcoal)] max-w-3xl">
          <TitleReveal lines={["Evidence over", "marketing."]} />
        </h1>
        <Reveal delay={0.3}>
          <p className="mt-8 text-[18px] leading-[1.7] text-[var(--color-charcoal)] max-w-xl">
            The Indian beauty industry is worth $28 billion and growing. But clean beauty
            has no legal definition. Brands use &ldquo;natural&rdquo;, &ldquo;pure&rdquo;, &ldquo;chemical-free&rdquo; freely,
            with no accountability.
          </p>
          <p className="mt-4 text-[17px] leading-[1.7] text-[var(--color-warm-gray)] max-w-xl">
            The Clean Sheet was built to change that. India&apos;s first ingredient-level,
            science-backed certification that means something real.
          </p>
        </Reveal>
        <Reveal delay={0.45}>
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4">
            <OpenFormButton className="inline-flex items-center justify-center gap-3 rounded-full px-9 py-4 text-[16px] text-white bg-[var(--color-coral)] hover:opacity-90 transition-opacity">
              Certify your brand <span aria-hidden>→</span>
            </OpenFormButton>
            <Link
              href="/review"
              className="inline-flex items-center justify-center gap-2 rounded-full px-9 py-4 text-[16px] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              style={{ border: `1px solid ${INK}`, color: INK }}
            >
              Try the review tool
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Stats strip */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 pb-20 md:pb-28">
        <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-10" gap={0.1}>
          {[
            { v: "$28B", l: "Indian beauty market" },
            { v: "0", l: "Legal clean beauty definitions in India" },
            { v: "5", l: "Evaluation layers" },
            { v: "0", l: "Paid placements. Ever." },
          ].map(({ v, l }) => (
            <Item key={l} className="pt-5" style={{ borderTop: `1px solid ${HAIR_LIGHT}` }}>
              <p className="font-display text-[40px] md:text-[52px] leading-none text-[var(--color-primary)]">{v}</p>
              <p className="mt-3 text-[13px] leading-snug text-[var(--color-warm-gray)]">{l}</p>
            </Item>
          ))}
        </Stagger>
      </section>

      {/* ═══ Manifesto — dark sheet ═══ */}
      <section style={{ background: INK }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-x-20 gap-y-14 items-start">
            <Reveal>
              <p className="text-[12px] uppercase" style={{ letterSpacing: "0.14em", color: TEAL_SOFT }}>
                What we stand for
              </p>
              <h2 className="font-display mt-6 text-[34px] md:text-[44px] leading-[1.12]" style={{ color: CREAM }}>
                The belief system,<br />in writing.
              </h2>
              <p className="mt-6 text-[16px] leading-[1.7] max-w-md" style={{ color: WARM }}>
                Every evaluation we run answers to this list. What we hold as core,
                what we keep open, and what is permanently banned from the standard.
              </p>
            </Reveal>
            <Stagger gap={0.08}>
              {BELIEFS.map(({ text, tag, good }) => (
                <Item key={text} className="py-4 flex items-center justify-between gap-6" style={{ borderTop: `1px solid ${HAIR_DARK}` }}>
                  <span className="flex items-center gap-3 text-[15px]" style={{ color: good ? CREAM : "rgba(253,97,88,0.85)" }}>
                    <span className="inline-block w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: good ? LIME : CORAL }} />
                    {text}
                  </span>
                  <span className="flex-shrink-0 text-[10px] uppercase px-2.5 py-1 rounded-full" style={{ letterSpacing: "0.1em", border: `1px solid ${HAIR_DARK}`, color: good ? (tag === "Open" ? TEAL_SOFT : LIME) : CORAL }}>
                    {tag}
                  </span>
                </Item>
              ))}
              <Item><div style={{ borderTop: `1px solid ${HAIR_DARK}` }} /></Item>
            </Stagger>
          </div>
        </div>
      </section>

      {/* ═══ Three non-negotiables ═══ */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 py-24 md:py-32">
        <Reveal>
          <p className="text-[12px] uppercase text-[var(--color-coral)]" style={{ letterSpacing: "0.14em" }}>
            What we never compromise on
          </p>
          <h2 className="font-display mt-6 text-[32px] md:text-[44px] leading-[1.12] text-[var(--color-charcoal)] max-w-2xl pb-14">
            Three things, fixed.
          </h2>
        </Reveal>
        <Stagger className="grid md:grid-cols-3 gap-x-12 gap-y-10" gap={0.14}>
          {[
            { n: "01", tag: "50% of our score", title: "Safety is non-negotiable.", body: "Half of our score is safety. Because no amount of great packaging or clever marketing justifies a product that contains carcinogens or endocrine disruptors." },
            { n: "02", tag: "Documents on file", title: "Proof is the product.", body: "We don't accept brand declarations. We verify documents. Technical data sheets, lab results, safety tests, all on file before a single badge is issued." },
            { n: "03", tag: "Public forever", title: "Consumers deserve the truth.", body: "Our public scorecards are free, permanent, and linked via QR on packaging. Any consumer can verify any certified product, any time." },
          ].map(({ n, tag, title, body }) => (
            <Item key={n} className="pt-6" style={{ borderTop: `1px solid ${HAIR_LIGHT}` }}>
              <div className="flex items-baseline justify-between pb-4">
                <p className="text-[13px] text-[var(--color-primary)]">{n}</p>
                <p className="text-[11px] uppercase text-[var(--color-warm-gray)]" style={{ letterSpacing: "0.1em" }}>{tag}</p>
              </div>
              <h3 className="font-display text-[24px] text-[var(--color-charcoal)] pb-3">{title}</h3>
              <p className="text-[15px] leading-[1.7] text-[var(--color-warm-gray)]">{body}</p>
            </Item>
          ))}
        </Stagger>
      </section>

      {/* ═══ The gap — dark ═══ */}
      <section style={{ background: INK }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-x-20 gap-y-14 items-start">
            <Reveal>
              <p className="text-[12px] uppercase" style={{ letterSpacing: "0.14em", color: TEAL_SOFT }}>
                The market gap
              </p>
              <h2 className="font-display mt-6 text-[34px] md:text-[44px] leading-[1.12]" style={{ color: CREAM }}>
                A $28 billion market.<br />Zero definitions.
              </h2>
              <div className="mt-8 flex flex-col gap-5 text-[16px] leading-[1.75] max-w-lg" style={{ color: WARM }}>
                <p>
                  India follows the Drugs and Cosmetics Act, which has no specific provision
                  for &ldquo;clean&rdquo; or &ldquo;natural&rdquo; claims. A brand can print &ldquo;chemical-free&rdquo; on any
                  bottle and face no legal consequence.
                </p>
                <p>
                  Meanwhile, consumers are paying premium prices for products marketed as
                  &ldquo;safe&rdquo; and &ldquo;clean&rdquo; that contain parabens, formaldehyde releasers, and
                  endocrine disruptors.
                </p>
                <p>
                  The Clean Sheet fills this gap with a voluntary, science-driven certification
                  inspired by the EU&apos;s SCCS guidelines, IFRA standards, and EWG rigour,
                  built for India&apos;s market.
                </p>
              </div>
            </Reveal>
            <Stagger gap={0.12} className="pt-2">
              <Item>
                <p className="text-[12px] uppercase pb-8" style={{ letterSpacing: "0.14em", color: WARM }}>
                  The numbers
                </p>
              </Item>
              {[
                { label: "Products with misleading ‘clean’ claims", pct: 73, color: CORAL },
                { label: "Consumers who check ingredients", pct: 74, color: LIME },
                { label: "Brands that disclose full INCI lists", pct: 41, color: TEAL_SOFT },
                { label: "Growth in clean beauty demand (2024-25)", pct: 68, color: LIME },
              ].map(({ label, pct, color }) => (
                <Item key={label} className="py-4" style={{ borderTop: `1px solid ${HAIR_DARK}` }}>
                  <div className="flex justify-between items-baseline pb-3">
                    <span className="text-[14px]" style={{ color: CREAM }}>{label}</span>
                    <span className="text-[16px] tabular-nums" style={{ color }}>{pct}%</span>
                  </div>
                  <div className="h-px w-full" style={{ background: HAIR_DARK }}>
                    <div className="h-[3px] -translate-y-[1px]" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </Item>
              ))}
              <Item>
                <p className="pt-6 text-[12px]" style={{ color: WARM }}>
                  Source: Vogue India Beauty Report 2024, internal research
                </p>
              </Item>
            </Stagger>
          </div>
        </div>
      </section>

      {/* ═══ Independent panel ═══ */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-x-20 gap-y-14 items-start">
          <Reveal>
            <p className="text-[12px] uppercase text-[var(--color-coral)]" style={{ letterSpacing: "0.14em" }}>
              Credibility
            </p>
            <h2 className="font-display mt-6 text-[32px] md:text-[40px] leading-[1.15] text-[var(--color-charcoal)]">
              Our independent panel.
            </h2>
            <div className="mt-6 flex flex-col gap-4 text-[16px] leading-[1.75] text-[var(--color-warm-gray)] max-w-lg">
              <p>
                The Clean Sheet evaluations are reviewed by an independent panel of experts,
                including cosmetic scientists, toxicologists, and dermatologists.
              </p>
              <p>
                We deliberately keep the panel confidential. Anonymity shields each
                evaluation from lobbying, brand pressure and personal bias, so a verdict
                rests on the evidence and nothing else.
              </p>
              <p>
                No panel member holds a commercial relationship with the brands under
                review. Conflicts of interest are declared and managed, and evaluators
                never deal with a brand directly.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="pt-6" style={{ borderTop: `1px solid ${INK}` }}>
              <h3 className="font-display text-[24px] text-[var(--color-charcoal)] pb-4">Want to be on the panel?</h3>
              <p className="text-[15px] leading-[1.7] text-[var(--color-warm-gray)] max-w-md pb-6">
                If you are a cosmetic scientist, toxicologist, or dermatologist who wants to
                make a difference, we&apos;d love to hear from you. The composition of our panel
                is taken seriously.
              </p>
              <div className="flex flex-col gap-3 pb-8">
                {[
                  "No brand affiliation required",
                  "Conflict of interest protocols in place",
                  "Your identity kept strictly confidential",
                ].map((t) => (
                  <p key={t} className="flex items-center gap-3 text-[14px] text-[var(--color-charcoal)]">
                    <span className="inline-block w-[6px] h-[6px] rounded-full bg-[var(--color-primary)] flex-shrink-0" />
                    {t}
                  </p>
                ))}
              </div>
              <a
                href="mailto:hello@thecleansheet.in?subject=Panel%20Application%20%7C%20The%20Clean%20Sheet"
                className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-[15px] text-white bg-[var(--color-primary)] hover:opacity-90 transition-opacity"
              >
                hello@thecleansheet.in <span aria-hidden>→</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ Founding quote — teal ═══ */}
      <section style={{ background: "var(--color-primary)" }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-24 md:py-32">
          <Reveal>
            <p className="text-[12px] uppercase" style={{ letterSpacing: "0.18em", color: "rgba(252,249,248,0.7)" }}>
              Est. 2025 · India
            </p>
            <blockquote className="font-display mt-8 text-[30px] md:text-[44px] leading-[1.2] max-w-3xl" style={{ color: CREAM }}>
              &ldquo;Clean beauty isn&apos;t a legal category in India. It&apos;s a marketing term.
              We&apos;re building the standard that changes that.&rdquo;
            </blockquote>
            <p className="mt-8 text-[14px]" style={{ color: "rgba(252,249,248,0.7)" }}>The Clean Sheet™</p>
            <div className="mt-12 flex flex-col sm:flex-row sm:items-center gap-5">
              <Link
                href="/review"
                className="inline-flex items-center justify-center gap-3 rounded-full px-9 py-4 text-[16px] hover:opacity-90 transition-opacity"
                style={{ background: CREAM, color: INK }}
              >
                Review a product <span aria-hidden>→</span>
              </Link>
              <Link href="/certification" className="text-[15px] transition-opacity hover:opacity-80" style={{ color: CREAM }}>
                How certification works <span aria-hidden>›</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
