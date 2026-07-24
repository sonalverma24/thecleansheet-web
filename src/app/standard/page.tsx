import Link from "next/link";
import { Reveal, Stagger, Item, TitleReveal } from "@/components/motion/Motion";
import StatusBanner from "@/components/standard/StatusBanner";
import { AccreditationLine } from "@/components/standard/Disclosures";
import { CertifiedSeal } from "@/components/standard/CertifiedSeal";
import {
  FRAMEWORK, WHAT_WE_CERTIFY, WHAT_IT_DOES_NOT_MEAN, SYSTEM_STACK,
  GATE_FAMILIES, PRODUCT_MODULES,
} from "@/data/standard";

/* ────────────────────────────────────────────────────────────────
   THE STANDARD · the public authority hub (Standards Centre).
   Checks that must pass. Clear scope and limits on everything.
──────────────────────────────────────────────────────────────── */

export const metadata = {
  title: "The Standard",
  description:
    "The Clean Sheet Product Standards Framework 2026: the checks every product must pass, the rules for each kind of product, what every claim has to prove, and a live list of the standards we use.",
};

const INK = "#282828";
const CREAM = "#fcf9f8";
const TEAL_SOFT = "#80d5cc";
const CORAL = "#fd6158";
const LIME = "#d2ff34";
const WARM = "#b0a8a4";
const HAIR_DARK = "rgba(252,249,248,0.14)";
const HAIR_LIGHT = "rgba(40,40,40,0.15)";

export default function StandardPage() {
  return (
    <div className="bg-white">
      {/* ═══ Hero ═══ */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 pt-8 md:pt-12 pb-10 md:pb-14">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">
          <div>
            <Reveal>
              <p className="text-[12px] uppercase text-[var(--color-primary)]" style={{ letterSpacing: "0.14em" }}>
                The Standard · How it works
              </p>
            </Reveal>
            <h1 className="font-display mt-6 text-[44px] md:text-[60px] leading-[1.05] tracking-[-0.02em] text-[var(--color-charcoal)]">
              <TitleReveal lines={["The standard,", "in the open."]} />
            </h1>
            <Reveal delay={0.3}>
              <p className="mt-7 text-[18px] leading-[1.7] text-[var(--color-warm-gray)] max-w-xl">
                We check a product against one clear, published standard: what&apos;s in it, how it&apos;s
                made, how it&apos;s tested, what&apos;s on the label, and every claim it makes. This page
                shows exactly what we look at, how we decide, and where each rule comes from.
              </p>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link href="/standard/claims" className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] text-white bg-[var(--color-primary)] hover:opacity-90 transition-opacity">
                  Public Claims Library <span aria-hidden>→</span>
                </Link>
                <Link href="/standard/register" className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]" style={{ border: `1px solid ${INK}`, color: INK }}>
                  Live Standards Register
                </Link>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <CertifiedSeal />
          </Reveal>
        </div>
        <div className="mt-10 max-w-3xl">
          <Reveal delay={0.45}><StatusBanner /></Reveal>
          <Reveal delay={0.5}><AccreditationLine className="mt-4" /></Reveal>
        </div>
        <Stagger className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8 max-w-3xl" gap={0.1}>
          {[
            { n: FRAMEWORK.counts.gates, label: "Core gates" },
            { n: FRAMEWORK.counts.productModules, label: "Product modules" },
            { n: FRAMEWORK.counts.claimModules, label: "Claim modules" },
            { n: FRAMEWORK.counts.standards, label: "Standards referenced" },
          ].map(({ n, label }) => (
            <Item key={label} className="pt-5" style={{ borderTop: `1px solid ${HAIR_LIGHT}` }}>
              <p className="font-display text-[40px] md:text-[48px] leading-none text-[var(--color-primary)]">{n}</p>
              <p className="mt-3 text-[13px] leading-snug text-[var(--color-warm-gray)]">{label}</p>
            </Item>
          ))}
        </Stagger>
      </section>

      {/* ═══ What we certify / what it doesn't mean ═══ */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 py-10 md:py-14">
        <div className="grid lg:grid-cols-2 gap-x-16 gap-y-12">
          <Reveal>
            <h2 className="font-display text-[28px] md:text-[36px] leading-[1.12] text-[var(--color-charcoal)]">
              What The Clean Sheet certifies.
            </h2>
            <div className="mt-7 flex flex-col">
              {WHAT_WE_CERTIFY.map((line) => (
                <p key={line} className="flex gap-3 py-4 text-[15px] leading-[1.7] text-[var(--color-charcoal)]" style={{ borderTop: `1px solid ${HAIR_LIGHT}` }}>
                  <span className="mt-2 inline-block w-[6px] h-[6px] rounded-full bg-[var(--color-primary)] flex-shrink-0" />
                  {line}
                </p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <h2 className="font-display text-[28px] md:text-[36px] leading-[1.12] text-[var(--color-charcoal)]">
              What certification does <span style={{ color: CORAL }}>not</span> mean.
            </h2>
            <div className="mt-7 flex flex-col">
              {WHAT_IT_DOES_NOT_MEAN.map((line) => (
                <p key={line} className="flex gap-3 py-4 text-[15px] leading-[1.7] text-[var(--color-charcoal)]" style={{ borderTop: `1px solid ${HAIR_LIGHT}` }}>
                  <span className="mt-1.5 text-[var(--color-coral)] flex-shrink-0" aria-hidden>✗</span>
                  {line}
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ The modular system ═══ */}
      <section style={{ background: INK }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-12 md:py-16">
          <Reveal>
            <p className="text-[12px] uppercase" style={{ letterSpacing: "0.14em", color: TEAL_SOFT }}>How the standard is applied</p>
            <h2 className="font-display mt-6 text-[32px] md:text-[44px] leading-[1.12]" style={{ color: CREAM }}>
              One product. One stack of rules.
            </h2>
            <p className="mt-5 text-[16px] leading-[1.7] max-w-2xl pb-12" style={{ color: WARM }}>
              Every product goes through the same six steps. Keeping them separate means a rule
              written for sunscreen never gets misapplied to a face wash.
            </p>
          </Reveal>
          <Stagger className="grid md:grid-cols-2 gap-x-14" gap={0.08}>
            {SYSTEM_STACK.map(({ n, label, body }) => (
              <Item key={n} className="py-6 grid grid-cols-[54px_1fr] gap-4 items-start" style={{ borderTop: `1px solid ${HAIR_DARK}` }}>
                <p className="font-display text-[30px] leading-none" style={{ color: LIME }}>{n}</p>
                <div>
                  <p className="text-[17px] leading-snug pb-1.5" style={{ color: CREAM }}>{label}</p>
                  <p className="text-[14px] leading-[1.65]" style={{ color: WARM }}>{body}</p>
                </div>
              </Item>
            ))}
          </Stagger>
          <Reveal delay={0.1}>
            <p className="mt-12 text-[15px] md:text-[16px] leading-[1.7] max-w-2xl px-5 py-4 rounded-xl" style={{ color: CREAM, background: "rgba(210,255,52,0.08)", border: `1px solid ${HAIR_DARK}` }}>
              The rule that holds it all together: every safety, legal, quality and claim check has
              to pass on its own. Doing well on one can never make up for failing another.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ Core requirements: 20 gates in 5 families ═══ */}
      <section id="gates" className="max-w-[1200px] mx-auto px-4 md:px-16 py-12 md:py-16 scroll-mt-24">
        <Reveal>
          <p className="text-[12px] uppercase text-[var(--color-coral)]" style={{ letterSpacing: "0.14em" }}>Core requirements</p>
          <h2 className="font-display mt-6 text-[32px] md:text-[44px] leading-[1.12] text-[var(--color-charcoal)]">
            Twenty gates. All must pass.
          </h2>
          <p className="mt-5 text-[16px] leading-[1.7] text-[var(--color-warm-gray)] max-w-2xl">
            These checks apply to every product, whatever it is. For each one, you can see what we
            look at, when it applies, how we decide, and the standard behind it.
          </p>
        </Reveal>

        <div className="mt-14 flex flex-col gap-16">
          {GATE_FAMILIES.map((fam, fi) => (
            <div key={fam.key}>
              <Reveal>
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-[22px] text-[var(--color-primary)]">{String(fi + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-[24px] md:text-[28px] leading-tight text-[var(--color-charcoal)]">{fam.title}</h3>
                    <p className="mt-1.5 text-[14px] italic text-[var(--color-warm-gray)]">{fam.blurb}</p>
                  </div>
                </div>
              </Reveal>
              <Stagger className="mt-6 grid md:grid-cols-2 gap-5" gap={0.06}>
                {fam.gates.map((g) => (
                  <Item key={g.id} className="rounded-2xl p-5 md:p-6" style={{ border: `1px solid ${HAIR_LIGHT}`, background: CREAM }}>
                    <div className="flex items-center gap-3 pb-3">
                      <span className="font-mono text-[12px] px-2 py-0.5 rounded" style={{ background: "#eef0ee", color: INK }}>{g.id}</span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full" style={{ letterSpacing: "0.08em", background: g.gateType === "Safety" ? "var(--color-coral)" : g.gateType === "Legal" ? INK : "var(--color-primary)", color: "#fff" }}>{g.gateType} gate</span>
                    </div>
                    <h4 className="font-display text-[19px] leading-tight text-[var(--color-charcoal)]">{g.title}</h4>
                    <p className="mt-2.5 text-[14px] leading-[1.65] text-[var(--color-charcoal)]/85">
                      <span className="text-[var(--color-warm-gray)]">Checks:</span> {g.whatChecked}
                    </p>
                    <p className="mt-2.5 text-[14px] leading-[1.65]" style={{ color: "#2f6f6a" }}>
                      <span className="text-[var(--color-warm-gray)]">Decision:</span> {g.decisionPrinciple}
                    </p>
                    <div className="mt-3.5 pt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-[var(--color-warm-gray)]" style={{ borderTop: `1px solid ${HAIR_LIGHT}` }}>
                      <span><span className="uppercase" style={{ letterSpacing: "0.06em" }}>Applies</span> · {g.appliesWhen}</span>
                    </div>
                    <p className="mt-1 text-[12px] text-[var(--color-warm-gray)]"><span className="uppercase" style={{ letterSpacing: "0.06em" }}>Reference</span> · {g.reference}</p>
                  </Item>
                ))}
              </Stagger>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Product modules ═══ */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 pb-20 md:pb-28">
        <Reveal>
          <p className="text-[12px] uppercase text-[var(--color-primary)]" style={{ letterSpacing: "0.14em" }}>Product standards</p>
          <h2 className="font-display mt-6 text-[32px] md:text-[44px] leading-[1.12] text-[var(--color-charcoal)]">
            Rules built for each product.
          </h2>
          <p className="mt-5 text-[16px] leading-[1.7] text-[var(--color-warm-gray)] max-w-2xl pb-10">
            On top of the core checks, each kind of product has its own rules. Our launch modules
            are active now. Others are marked clearly as coming later.
          </p>
        </Reveal>
        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" gap={0.05}>
          {PRODUCT_MODULES.map((m) => {
            const open = m.status === "Active";
            return (
              <Item key={m.id} className="rounded-2xl p-5" style={{ border: `1px solid ${HAIR_LIGHT}`, background: open ? "#fff" : "#faf9f8", opacity: open ? 1 : 0.7 }}>
                <div className="flex items-center justify-between gap-3 pb-2">
                  <span className="font-mono text-[12px] text-[var(--color-warm-gray)]">{m.id}</span>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full" style={{ letterSpacing: "0.06em", background: open ? "#dcfce7" : "#eef0ee", color: open ? "#166534" : "#8a8785", border: open ? "1px solid #bbf7d0" : "1px solid #ddd" }}>
                    {open ? "Active" : "Coming later"}
                  </span>
                </div>
                <h4 className="font-display text-[19px] leading-tight text-[var(--color-charcoal)]">{m.name}</h4>
                <p className="mt-2 text-[13px] leading-[1.6] text-[var(--color-warm-gray)]">{m.examples}</p>
                <p className="mt-3 text-[12px] text-[var(--color-warm-gray)]"><span className="uppercase" style={{ letterSpacing: "0.06em" }}>Risk</span> · {m.risk}</p>
              </Item>
            );
          })}
        </Stagger>
      </section>

      {/* ═══ Explore + validation note ═══ */}
      <section style={{ background: "var(--color-primary)" }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-x-16 gap-y-12 items-start">
            <Reveal>
              <h2 className="font-display text-[30px] md:text-[42px] leading-[1.12]" style={{ color: CREAM }}>
                Explore the evidence.
              </h2>
              <p className="mt-5 text-[16px] leading-[1.7] max-w-md" style={{ color: "rgba(252,249,248,0.85)" }}>
                Two of the most useful parts are open to anyone: the exact proof every marketing
                claim needs, and the full list of standards we rely on.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/standard/claims" className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] hover:opacity-90 transition-opacity" style={{ background: CREAM, color: INK }}>
                  Claims Library <span aria-hidden>→</span>
                </Link>
                <Link href="/standard/register" className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] transition-colors" style={{ border: "1px solid rgba(252,249,248,0.5)", color: CREAM }}>
                  Standards Register
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="pt-6" style={{ borderTop: "1px solid rgba(252,249,248,0.3)" }}>
                <h3 className="font-display text-[22px] pb-3" style={{ color: CREAM }}>For brands</h3>
                <p className="text-[15px] leading-[1.75] pb-4" style={{ color: "rgba(252,249,248,0.8)" }}>
                  Certification assesses your product against this standard, with an independent
                  decision and a public proof page. It is voluntary and independent, and it is not a
                  regulatory approval.
                </p>
                <Link href="/for-brands" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] hover:opacity-90 transition-opacity" style={{ background: CREAM, color: INK }}>
                  Apply for certification <span aria-hidden>→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
