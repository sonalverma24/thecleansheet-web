import React from 'react';
import Link from 'next/link';
import FormModal from '@/components/FormModal';
import OpenFormButton from '@/components/OpenFormButton';
import { BLOG_POSTS } from '@/lib/blog-posts';
import { Reveal, Stagger, Item, TitleReveal, KenBurns, Marquee } from '@/components/motion/Motion';

const TICKER = [
  'Niacinamide', 'Retinol', 'Hyaluronic Acid', 'DMDM Hydantoin', 'Oxybenzone',
  'Ceramide NP', 'Salicylic Acid', 'Parfum', 'Phenoxyethanol', 'Squalane',
  'Methylparaben', 'Centella Asiatica', 'Bakuchiol', 'SLS', 'Glycerin', 'Triclosan',
];

/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ — Home
   One scroll story: promise → how it works → the dark proof band
   → learn → closing invitation. Evidence-First Editorial.
──────────────────────────────────────────────────────────────── */

const INK = '#282828';
const CREAM = '#fcf9f8';
const TEAL_SOFT = '#80d5cc';
const HAIR_DARK = 'rgba(252,249,248,0.14)';
const HAIR_LIGHT = 'rgba(40,40,40,0.15)';

export default function HomePage() {
  return (
    <div>
      {/* ═══ Hero — the promise ═══ */}
      <header className="relative overflow-hidden">
        {/* Creative — settles in slowly, fades into the cream canvas */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[46%]" aria-hidden>
          <KenBurns src="/images/creatives/hero-flatlay.jpg" className="w-full h-full" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #ffffff 0%, rgba(255,255,255,0.72) 30%, rgba(255,255,255,0.08) 72%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0) 22%)' }} />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-4 md:px-16 pt-20 md:pt-28 pb-20 md:pb-28">
        <Reveal delay={0}>
          <p className="text-[12px] uppercase text-[var(--color-primary)]" style={{ letterSpacing: '0.14em' }}>
            India&apos;s first independent beauty certification
          </p>
        </Reveal>
        <h1 className="font-display mt-8 text-[44px] md:text-[64px] leading-[1.08] tracking-[-0.02em] text-[var(--color-charcoal)] max-w-3xl">
          <TitleReveal lines={['Proof,', 'not promises.']} />
        </h1>
        <Reveal delay={0.35}>
          <p className="mt-6 text-[18px] leading-[28px] text-[var(--color-warm-gray)] max-w-xl">
            The Clean Sheet checks what beauty products claim against what they can
            actually prove. Built on science, not marketing.
          </p>
        </Reveal>

        {/* CTAs — pill shapes */}
        <Reveal delay={0.5}>
          <div className="mt-12 flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              href="/review"
              className="inline-flex items-center justify-center gap-3 rounded-full px-9 py-4 text-[16px] text-white bg-[var(--color-coral)] hover:opacity-90 transition-opacity"
            >
              Review a product for free <span aria-hidden>→</span>
            </Link>
            <OpenFormButton
              className="inline-flex items-center justify-center gap-3 rounded-full px-9 py-4 text-[16px] text-white bg-[var(--color-primary)] hover:opacity-90 transition-opacity"
            >
              Get your claims verified today <span aria-hidden>→</span>
            </OpenFormButton>
          </div>
          <Link
            href="/verified"
            className="mt-8 inline-flex items-center gap-2 text-[15px] text-[var(--color-charcoal)] hover:text-[var(--color-primary)] transition-colors w-fit"
          >
            View verified products <span aria-hidden>›</span>
          </Link>
        </Reveal>

        {/* Mobile creative */}
        <div className="lg:hidden mt-12 -mx-4" aria-hidden>
          <img src="/images/creatives/hero-flatlay.jpg" alt="" className="w-full h-60 object-cover" />
        </div>
        </div>
      </header>

      {/* ═══ Ingredient ticker — the lab ledger ═══ */}
      <div className="py-5" style={{ borderTop: `1px solid ${HAIR_LIGHT}`, borderBottom: `1px solid ${HAIR_LIGHT}` }}>
        <Marquee
          items={TICKER}
          itemClassName="text-[13px] uppercase text-[var(--color-warm-gray)]"
          duration={52}
        />
      </div>

      {/* Claims-verification form popup (teal CTA, or #get-certified) */}
      <FormModal />

      {/* ═══ How it works — three steps, thin rules ═══ */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 py-24 md:py-32">
        <Stagger className="grid md:grid-cols-3 gap-x-12 gap-y-10" gap={0.14}>
          {[
            { n: '01', title: 'Claims, extracted', desc: '“Clinically proven.” “Dermatologist tested.” “Chemical-free.” We pull every claim a product makes, in the brand’s own words.' },
            { n: '02', title: 'Evidence, hunted', desc: 'Studies, certificates, registries, the full INCI list. Each claim is graded against our published evidence standards. Nothing is assumed true.' },
            { n: '03', title: 'Verdict, delivered', desc: 'Clean Sheet Verified, or Not Verified. One clear mark, with plain-language reasons behind it. The same product always gets the same verdict.' },
          ].map(({ n, title, desc }) => (
            <Item key={n} className="pt-6" style={{ borderTop: `1px solid ${HAIR_LIGHT}` }}>
              <p className="text-[13px] pb-4 text-[var(--color-primary)]">{n}</p>
              <h3 className="font-display text-[24px] text-[var(--color-charcoal)] pb-3">{title}</h3>
              <p className="text-[15px] leading-[1.7] text-[var(--color-warm-gray)]">{desc}</p>
            </Item>
          ))}
        </Stagger>
      </section>

      {/* ═══ Dark proof band — the claim sheet, previewed ═══ */}
      <section style={{ background: INK }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-x-20 gap-y-16 items-start">
            <Reveal>
              <p className="text-[12px] uppercase" style={{ letterSpacing: '0.14em', color: TEAL_SOFT }}>
                The Claim Sheet
              </p>
              <h2 className="font-display mt-6 text-[36px] md:text-[48px] leading-[1.12]" style={{ color: CREAM }}>
                Marketing says a lot.<br />Evidence says more.
              </h2>
              <p className="mt-6 text-[17px] leading-[1.7] max-w-md" style={{ color: '#b0a8a4' }}>
                Paste any product link. Every claim on the label is checked against
                what the brand can actually show, graded in the open.
              </p>
              <Link
                href="/review"
                className="mt-10 inline-flex items-center gap-3 rounded-full px-9 py-4 text-[16px] hover:opacity-90 transition-opacity"
                style={{ background: 'var(--color-lime)', color: INK }}
              >
                Try it on your shelf <span aria-hidden>→</span>
              </Link>
            </Reveal>

            {/* Creative + floating claim-sheet preview */}
            <div className="relative min-h-[540px] flex flex-col justify-end">
              {/* Photo — black background merges into the charcoal via screen blend */}
              <img
                src="/images/creatives/hands-dark.jpg"
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover object-top"
                style={{ mixBlendMode: 'screen' }}
              />
              {/* Readability gradient behind the rows */}
              <div className="absolute inset-x-0 bottom-0 h-[75%]" style={{ background: `linear-gradient(to top, ${INK} 42%, rgba(40,40,40,0) 100%)` }} aria-hidden />

              <Stagger className="relative" gap={0.12}>
                {[
                  { claim: '“Clinically proven to brighten in 7 days”', verdict: 'No evidence found', color: 'var(--color-coral)', solid: false },
                  { claim: '“Dermatologist tested”', verdict: 'Verified · Level B', color: 'var(--color-lime)', solid: false },
                  { claim: '“100% chemical-free”', verdict: 'Not permitted', color: 'var(--color-coral)', solid: true },
                  { claim: '“Fragrance-free”', verdict: 'Verified · INCI check', color: 'var(--color-lime)', solid: false },
                ].map(({ claim, verdict, color, solid }) => (
                  <Item key={claim} className="py-5 flex items-start justify-between gap-6" style={{ borderTop: `1px solid ${HAIR_DARK}` }}>
                    <p className="text-[16px] leading-relaxed" style={{ color: CREAM }}>{claim}</p>
                    {solid ? (
                      <span className="flex-shrink-0 text-[11px] uppercase px-3 py-1 rounded-full" style={{ letterSpacing: '0.1em', background: color, color: INK }}>
                        {verdict}
                      </span>
                    ) : (
                      <span className="flex-shrink-0 text-[11px] uppercase pt-1" style={{ letterSpacing: '0.1em', color }}>
                        {verdict}
                      </span>
                    )}
                  </Item>
                ))}
                <Item>
                  <div style={{ borderTop: `1px solid ${HAIR_DARK}` }} />
                  <p className="pt-5 text-[12px]" style={{ color: '#b0a8a4' }}>
                    Sample verdicts · every review is computed from public evidence
                  </p>
                </Item>
              </Stagger>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Reads — real articles from the blog ═══ */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 py-24 md:py-32">
        <Reveal>
          <div className="flex justify-between items-baseline pb-10" style={{ borderBottom: `1px solid ${HAIR_LIGHT}` }}>
            <h2 className="font-display text-[32px] md:text-[40px] text-[var(--color-charcoal)]">Reads</h2>
            <Link href="/blog" className="text-[12px] uppercase text-[var(--color-primary)] hover:underline flex-shrink-0 pl-6" style={{ letterSpacing: '0.1em' }}>
              All reads
            </Link>
          </div>
        </Reveal>
        <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-x-12 pt-2" gap={0.12}>
          {BLOG_POSTS.slice(0, 2).map((post, i) => (
            <Item key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group py-10 flex flex-col items-start gap-4" style={{ borderBottom: `1px solid ${HAIR_LIGHT}` }}>
                <span
                  className="px-3 py-1 text-[10px] uppercase"
                  style={{ letterSpacing: '0.12em', background: i % 2 === 0 ? 'var(--color-coral)' : 'var(--color-lime)', color: i % 2 === 0 ? '#fff' : INK }}
                >
                  {post.category}
                </span>
                <h3 className="font-display text-[26px] leading-[1.25] text-[var(--color-charcoal)] group-hover:text-[var(--color-primary)] transition-colors">{post.title}</h3>
                <p className="text-[15px] leading-[1.7] text-[var(--color-warm-gray)]">{post.subtitle}</p>
                <p className="text-[12px] uppercase text-[var(--color-warm-gray)]" style={{ letterSpacing: '0.1em' }}>{post.date} · {post.readTime}</p>
              </Link>
            </Item>
          ))}
        </Stagger>
      </section>

      {/* ═══ Closing invitation — teal band ═══ */}
      <section style={{ background: 'var(--color-primary)' }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-24 md:py-28">
          <Reveal>
          <p className="text-[12px] uppercase" style={{ letterSpacing: '0.14em', color: 'rgba(252,249,248,0.7)' }}>
            For brands
          </p>
          <h2 className="font-display mt-6 text-[36px] md:text-[48px] leading-[1.12] max-w-2xl" style={{ color: CREAM }}>
            If your product can prove it, we&apos;ll certify it.
          </h2>
          </Reveal>
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-6">
            <OpenFormButton
              className="inline-flex items-center justify-center gap-3 rounded-full px-9 py-4 text-[16px] hover:opacity-90 transition-opacity"
              style={{ background: CREAM, color: INK }}
            >
              Get your claims verified today <span aria-hidden>→</span>
            </OpenFormButton>
            <Link href="/certification" className="text-[15px] transition-opacity hover:opacity-80" style={{ color: CREAM }}>
              How certification works <span aria-hidden>›</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
