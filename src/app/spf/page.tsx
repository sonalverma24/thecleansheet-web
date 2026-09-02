'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { AccreditationLine, ACCREDITATION_FULL } from '@/components/standard/Disclosures';
import OpenFormButton from '@/components/OpenFormButton';

/* ────────────────────────────────────────────────────────────────
   SPF VERIFICATION · /spf
   Landing page for the SPF Proof Report — the first commercial
   programme. Sells independent verification of SPF, UVA and
   water-resistance claims, ending in a public proof page.

   LANGUAGE RULE: this page says "verified", never "certified".
   Certification is not operational (see components/standard/
   Disclosures.tsx). Everything claimed here is deliverable today.
──────────────────────────────────────────────────────────────── */

const TEAL = '#248179';
const CORAL = '#fd6158';
const INK = '#282828';
const WARM = '#b0a8a4';
const HAIR = 'rgba(40,40,40,0.12)';

const PROBLEM = [
  {
    stat: 'The claim',
    body: 'SPF is the only number on a beauty product where under-delivery causes actual harm. It is also the easiest number to inflate, and the hardest for a shopper to check.',
  },
  {
    stat: 'The fallout',
    body: 'Independent testing controversies have made Indian shoppers assume every SPF number is inflated until proven otherwise — which punishes the brands doing it properly just as hard as the ones who are not.',
  },
  {
    stat: 'The gap',
    body: 'If your sunscreen genuinely tests where you say it does, you currently have no way to prove it. A lab PDF nobody has heard of is not proof. It is another thing to be sceptical about.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'We buy your product off the shelf',
    body: 'Not a sample you send us. The same unit a customer buys, from open retail, with the chain of custody documented. This is the part that makes everything after it worth reading.',
  },
  {
    n: '02',
    title: 'We audit the evidence you already hold',
    body: 'Your SPF and UVA reports, the lab that ran them, the formula version they describe, your artwork, and every live claim across your site, pack, ads and marketplace listings. Twelve checkpoints, listed below.',
  },
  {
    n: '03',
    title: 'We commission confirmatory testing',
    body: 'At a NABL or ISO/IEC 17025 accredited laboratory that we select and instruct, on the unit we bought. The lab invoices at cost, with no margin to us — you see the invoice.',
  },
  {
    n: '04',
    title: 'If it holds, we publish the proof',
    body: 'A permanent public page showing what was tested, what was measured and what is verified, with a QR code for your pack and cleared wording your marketing team can use. If it does not hold, you get a private report and nothing is published.',
  },
];

const CHECKS = [
  { g: 'The measurement', items: [
    'Sample identity — does the tested sample match the product you actually ship, at the current formula version and batch?',
    'Laboratory competence — NABL or ISO/IEC 17025, valid at the date of test, with the method inside the accredited scope.',
    'In-vivo SPF (ISO 24444) — panel validity, standard deviation and confidence interval, and whether the labelled number is supported rather than rounded up to.',
    'UVA protection (ISO 24442 or ISO 24443) — PA rating derivation, UVA-PF to SPF ratio, critical wavelength where broad spectrum is claimed.',
  ]},
  { g: 'The formulation', items: [
    'Label value against measured value, under the labelling convention that currently applies in India.',
    'Water and sweat resistance (ISO 16217 / ISO 18861) — whether the protocol that was run matches the claim that is printed.',
    'UV filter legality — every filter and concentration against the Cosmetics Rules 2020, and against EU Annex VI where you export.',
    'Photostability — whether the filter system still protects in the sixth hour, which an SPF certificate will never show you.',
    'Stability, packaging and preservation — the SPF a customer gets at the end of shelf life, not on the day of testing.',
  ]},
  { g: 'The marketing', items: [
    'Claim language — broad spectrum, blue light, pollution, dermatologically tested, non-comedogenic, and any prohibited absolute such as sunblock, waterproof or sweat-proof.',
    'Statutory labelling — Cosmetics Rules 2020 and Legal Metrology requirements, from licence number to ingredient order.',
    'Live asset sweep — your website, pack, performance ads, marketplace and quick-commerce listings and influencer briefs, against the evidence actually held. Evidence in a folder is worth nothing if the ad running today says something else.',
  ]},
];

const DELIVERABLES = [
  'Evidence dossier assessment against all twelve checkpoints',
  'Claim register — every claim marked supported, partially supported, unsupported or not permitted, with the specific gap named',
  'Independent test results, and a like-for-like comparison against your own report and your label',
  'Remediation plan — every gap with a named fix, an owner and a sequence',
  'Rewritten claim language for anything you cannot currently support, written so it still sells',
  'A permanent public proof page, hosted here, that you can link from your PDP',
  'Print-ready QR code and verification mark in three formats, with a written usage licence',
  'Entry in the public register, with methodology version and expiry shown',
  'Pre-cleared wording your marketing team may use, so nobody overclaims by accident',
  'A findings call with you, and with your manufacturer if you want them there',
];

const TIERS = [
  {
    name: 'Claim Screen',
    price: '₹15,000',
    meta: '72 hours · private',
    body: 'A fast look at every SPF claim you have live, rated against the evidence visible to us, with your three biggest exposures ranked by commercial consequence. Credited in full against either tier below if you proceed within 30 days.',
    cta: false,
  },
  {
    name: 'Evidence Review',
    price: '₹45,000',
    meta: '7 working days · private',
    body: 'The full twelve-point audit of the evidence you already hold, with a remediation plan and rewritten claim language. No public output. Built for the six weeks before a launch, when artwork can still change.',
    cta: false,
  },
  {
    name: 'SPF Proof Report',
    price: '₹75,000',
    meta: '4–6 weeks · public proof page',
    body: 'Everything in the Evidence Review, plus an off-the-shelf sample, confirmatory testing at an accredited lab, and — if it holds — a permanent public proof page, QR code and register entry. Laboratory costs are additional and passed through at cost.',
    cta: true,
    note: 'Founding cohort rate. ₹95,000 thereafter.',
  },
];

const TRIGGERS = [
  'You are launching an SPF product in the next 90 days',
  'A competitor’s SPF claim was publicly challenged and yours is next',
  'Someone has already questioned your number in public',
  'A marketplace or quick-commerce listing was flagged over claim copy',
  'You are entering retail, or exporting, and need a defensible claim file',
  'You have reformulated, or changed manufacturer, since your last test',
  'You are raising, and someone is about to read your claim file properly',
];

const FAQ = [
  {
    q: 'Is this certification?',
    a: ACCREDITATION_FULL + ' The SPF Proof Report is a point-in-time verification of specific named claims — not a certificate, not a badge for your whole product, and not a regulatory approval. The proof page states exactly what was verified and exactly what was not.',
  },
  {
    q: 'What happens if our product does not pass?',
    a: 'Nothing is published. There is no public page, no register entry, and we do not disclose the result to anyone. You receive a private remediation report telling you what failed, why, and precisely how to fix it — and you can re-submit at half price once you have. Finding out privately from us is most of what you are buying.',
  },
  {
    q: 'We already have an SPF test report. Why would we need this?',
    a: 'Two reasons. Your customer has never seen it and would not know how to read it, so it does you no commercial good. And in most engagements the report turns out to be genuine but to describe a formula from before the last reformulation. Worth knowing which of those you are.',
  },
  {
    q: 'Can we pay for a pass?',
    a: 'No. The fee buys the assessment, not the outcome, and this is written into the engagement letter. The person who sells does not decide, every verdict is reviewed by a second assessor, and we publish annual figures for how many products were assessed against how many were verified — with no brand named. Without that denominator the mark would mean nothing.',
  },
  {
    q: 'Do you make money on the laboratory testing?',
    a: 'No. Laboratory costs are passed through at cost and you see the invoice. Taking a margin on testing would give us a reason to over-test, and you would be right not to trust us.',
  },
  {
    q: 'Is our formula kept confidential?',
    a: 'Yes. Everything you submit is covered by a mutual NDA and is never published. The proof page shows measured results and verified claims only, never the quantitative formula.',
  },
  {
    q: 'How long does the verification last?',
    a: 'Twelve months. It voids automatically if the formulation, the manufacturing site or the claims change, and you agree to tell us within 30 days if any of those happen. We can also withdraw a verification and remove the register entry if a later market check contradicts the original result.',
  },
  {
    q: 'Do we get to approve the proof page?',
    a: 'You review it for factual accuracy, and you get five working days with the draft findings to submit further evidence or correct an error. You do not get to change the verdict, and that is stated in the engagement letter.',
  },
];

export default function SpfPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const toggleFaq = (i: number) => setActiveFaq(activeFaq === i ? null : i);

  return (
    <div className="min-h-screen bg-white pb-24">
      <main className="max-w-4xl mx-auto px-6 pt-8 space-y-14">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="space-y-6">
          <p className="text-[12px] uppercase" style={{ letterSpacing: '0.14em', color: TEAL }}>
            Sunscreen · Founding cohort, six brands
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight max-w-3xl" style={{ color: INK }}>
            Your SPF 50 is probably real.<br />Nobody believes you.
          </h1>
          <p className="text-lg leading-relaxed max-w-2xl" style={{ color: WARM }}>
            We buy your sunscreen off the shelf, audit the evidence behind every claim on it, and
            commission confirmatory testing at an accredited laboratory. If the number holds, you get a
            permanent public page you can point every sceptical customer to.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <OpenFormButton
              className="rounded-full px-7 py-3 text-[15px] text-white transition-opacity hover:opacity-90"
              style={{ background: TEAL }}
            >
              Apply to the founding cohort
            </OpenFormButton>
            <Link
              href="/spf/sample"
              className="rounded-full px-7 py-3 text-[15px] transition-colors"
              style={{ border: `1px solid ${INK}`, color: INK }}
            >
              See a sample proof page
            </Link>
          </div>
          <p className="text-[13px]" style={{ color: WARM }}>
            Or jump to <Link href="#how" className="underline" style={{ color: TEAL }}>the twelve things we check</Link>.
          </p>
        </section>

        {/* ── The problem ──────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl" style={{ color: INK }}>
            Why an honest sunscreen brand has a problem
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {PROBLEM.map((p) => (
              <div key={p.stat} className="rounded-lg p-6 space-y-2" style={{ border: `1px solid ${HAIR}` }}>
                <h3 className="text-[15px]" style={{ color: TEAL }}>{p.stat}</h3>
                <p className="text-sm leading-relaxed" style={{ color: WARM }}>{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────── */}
        <section id="how" className="space-y-6 scroll-mt-24">
          <h2 className="font-display text-2xl" style={{ color: INK }}>How it works</h2>
          <div className="space-y-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-lg p-6 flex gap-6 items-start" style={{ border: `1px solid ${HAIR}` }}>
                <div className="font-display text-2xl shrink-0" style={{ color: TEAL }}>{s.n}</div>
                <div>
                  <h3 className="text-base mb-1" style={{ color: INK }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: WARM }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── The twelve checkpoints ───────────────────────── */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl" style={{ color: INK }}>The twelve checkpoints</h2>
          <p className="text-[15px] leading-relaxed max-w-2xl" style={{ color: WARM }}>
            Nothing here is secret. It is published deliberately, because a standard nobody can inspect
            is not a standard. What is difficult is reading your own evidence adversarially — which is
            something no one inside a brand is ever rewarded for doing.
          </p>
          <div className="space-y-3">
            {CHECKS.map((group) => (
              <div key={group.g} className="rounded-lg p-6 space-y-4" style={{ border: `1px solid ${HAIR}` }}>
                <h3 className="text-[12px] uppercase" style={{ letterSpacing: '0.12em', color: TEAL }}>{group.g}</h3>
                <ul className="space-y-3">
                  {group.items.map((item, i) => (
                    <li key={i} className="text-sm leading-relaxed flex gap-3" style={{ color: WARM }}>
                      <span className="shrink-0" style={{ color: TEAL }}>—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── What you get ─────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl" style={{ color: INK }}>What you receive</h2>
          <div className="rounded-lg p-6" style={{ border: `1px solid ${HAIR}` }}>
            <ul className="space-y-3">
              {DELIVERABLES.map((d, i) => (
                <li key={i} className="text-sm leading-relaxed flex gap-3" style={{ color: WARM }}>
                  <span className="font-display shrink-0 w-6" style={{ color: TEAL }}>{String(i + 1).padStart(2, '0')}</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[15px] leading-relaxed" style={{ color: TEAL }}>
            <Link href="/spf/sample" className="hover:underline">
              See a sample proof page, built on an invented product →
            </Link>
          </p>
        </section>

        {/* ── Pricing ──────────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl" style={{ color: INK }}>What it costs</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className="rounded-lg p-6 space-y-3 flex flex-col"
                style={{ border: t.cta ? `1.5px solid ${TEAL}` : `1px solid ${HAIR}` }}
              >
                <h3 className="text-[15px]" style={{ color: INK }}>{t.name}</h3>
                <p className="font-display text-3xl" style={{ color: TEAL }}>{t.price}</p>
                <p className="text-[12px] uppercase" style={{ letterSpacing: '0.1em', color: WARM }}>{t.meta}</p>
                <p className="text-sm leading-relaxed grow" style={{ color: WARM }}>{t.body}</p>
                {t.note && <p className="text-[13px]" style={{ color: CORAL }}>{t.note}</p>}
              </div>
            ))}
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: WARM }}>
            All prices exclude GST. Fifty percent to commence, fifty percent on final report. Laboratory
            testing is invoiced separately, at cost, before testing begins. A second SKU submitted in the
            same round is charged at 25% less.
          </p>
        </section>

        {/* ── Integrity ────────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl" style={{ color: INK }}>If it does not pass</h2>
          <div className="rounded-lg p-6 space-y-4" style={{ border: `1px solid ${HAIR}` }}>
            <p className="text-[15px] leading-relaxed" style={{ color: INK }}>
              <span style={{ color: CORAL }}>Read this before you apply. </span>
              The fee buys the assessment, not the outcome. No amount of money buys a particular answer,
              and anyone who asks to buy the mark directly is refused.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: WARM }}>
              If your product does not meet the criteria, nothing is published and nothing is disclosed.
              You receive a private remediation report and a route back — re-assessment at half price once
              you have fixed it. Failure is never public. Withdrawal of an existing verification is,
              because that one is a promise made to shoppers.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: WARM }}>
              Each year we publish how many products were assessed and how many were verified, with no
              brand named. It is the only thing that stops a verification from quietly coming to mean
              nothing more than having paid for one.
            </p>
          </div>
        </section>

        {/* ── Who this is for ──────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl" style={{ color: INK }}>When brands come to us</h2>
          <div className="rounded-lg p-6" style={{ border: `1px solid ${HAIR}` }}>
            <ul className="space-y-3">
              {TRIGGERS.map((t, i) => (
                <li key={i} className="text-sm leading-relaxed flex gap-3" style={{ color: WARM }}>
                  <span className="shrink-0" style={{ color: TEAL }}>—</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[15px] leading-relaxed max-w-2xl" style={{ color: WARM }}>
            The founding cohort is six brands. They are named permanently on the register, they shape the
            sunscreen criteria before the standard is fixed, and their pricing is locked for their next
            two products. When the six are taken, it closes.
          </p>
        </section>

        {/* ── FAQ ──────────────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl" style={{ color: INK }}>Common questions</h2>
          <div className="space-y-3">
            {FAQ.map((faq, i) => (
              <div key={i} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${HAIR}` }}>
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left focus-ring gap-4"
                >
                  <span className="text-[15px]" style={{ color: INK }}>{faq.q}</span>
                  <ChevronDown
                    className={`shrink-0 transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`}
                    size={20}
                    style={{ color: WARM }}
                  />
                </button>
                <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-96 pb-5' : 'max-h-0'}`}>
                  <p className="text-sm leading-relaxed" style={{ color: WARM }}>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Close ────────────────────────────────────────── */}
        <section className="space-y-6 rounded-lg p-8" style={{ border: `1px solid ${HAIR}` }}>
          <h2 className="font-display text-2xl" style={{ color: INK }}>
            Find out before your customers do
          </h2>
          <p className="text-[15px] leading-relaxed max-w-2xl" style={{ color: WARM }}>
            Tell us which SPF product matters most to you commercially. We will tell you what we would
            check, what it would cost, and whether it is worth doing at all — before you pay anything.
          </p>
          <div className="flex flex-wrap gap-4">
            <OpenFormButton
              className="rounded-full px-7 py-3 text-[15px] text-white transition-opacity hover:opacity-90"
              style={{ background: TEAL }}
            >
              Apply to the founding cohort
            </OpenFormButton>
            <Link
              href="/standard"
              className="rounded-full px-7 py-3 text-[15px] transition-colors"
              style={{ border: `1px solid ${INK}`, color: INK }}
            >
              Read the standard
            </Link>
          </div>
          <AccreditationLine className="pt-2" />
        </section>

      </main>
    </div>
  );
}
