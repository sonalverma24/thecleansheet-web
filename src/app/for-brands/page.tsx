'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { AccreditationLine, ACCREDITATION_FULL, PUBLIC_REVIEW_DISCLOSURE } from '@/components/standard/Disclosures';
import OpenFormButton from '@/components/OpenFormButton';
import { CertifiedSeal } from '@/components/standard/CertifiedSeal';

/* ────────────────────────────────────────────────────────────────
   FOR BRANDS · apply for certification.
   Certification assesses a product against The Clean Sheet Standard,
   with an independent decision and a public proof page. Voluntary,
   independent, and not a regulatory approval.
──────────────────────────────────────────────────────────────── */

const TEAL = '#248179';
const CORAL = '#fd6158';
const INK = '#282828';
const WARM = '#b0a8a4';
const HAIR = 'rgba(40,40,40,0.12)';

const ASSESSED = [
  { title: 'Legal status and market classification', body: 'The product is lawfully classified and holds the registrations it needs in each declared market.' },
  { title: 'Formula and finished-product safety', body: 'A finished-product safety assessment, impurities, preservation, microbiology and tolerance, judged by real exposure.' },
  { title: 'Manufacturing quality and traceability', body: 'GMP, batch identity, stability, packaging and change control, so each batch matches the reviewed product.' },
  { title: 'Claims and consumer information', body: 'Every material claim on every channel checked against the evidence, at finished-product level.' },
  { title: 'Evidence provenance and decision', body: 'Where the evidence came from, whether the lab was independent, and an independent certification decision.' },
];

const STEPS = [
  { n: '01', title: 'Apply', body: 'Tell us about your product and the markets you sell in. We confirm which parts of the standard apply and give you a dossier checklist.' },
  { n: '02', title: 'Submit your dossier', body: 'Share your formula, safety data, test reports, manufacturing records and claims evidence through a secure channel, under NDA.' },
  { n: '03', title: 'Independent review', body: 'We assess the product against the standard. Every applicable legal, safety, quality and claim gate must pass. No score can make up for a failed gate.' },
  { n: '04', title: 'Decision and proof page', body: 'If it meets the standard, it is certified and gets a live public proof page you can verify. If not, you receive a clear report of exactly what to address.' },
];

const FAQ = [
  { q: 'Is my formula kept confidential?', a: 'Yes. Everything you submit is covered by an NDA and is never published. The public proof page only shows what is authorised, and never the quantitative formula.' },
  { q: 'What if not all my claims can be verified?', a: 'The proof page lists the claims covered by the certificate and states that no other claims are covered. Unsupported material claims are corrected or removed before certification.' },
  { q: 'Is The Clean Sheet accredited?', a: ACCREDITATION_FULL + ' Certification does not replace regulatory approval or legal compliance obligations.' },
  { q: 'How is this different from a public review?', a: PUBLIC_REVIEW_DISCLOSURE + ' Certification, by contrast, assesses the confidential dossier under NDA and reaches an independent decision.' },
];

export default function ForBrandsPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const toggleFaq = (i: number) => setActiveFaq(activeFaq === i ? null : i);

  return (
    <div className="min-h-screen bg-white pb-24">
      <main className="max-w-4xl mx-auto px-6 pt-8 space-y-12">

        {/* Header */}
        <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="space-y-6">
            <p className="text-[12px] uppercase" style={{ letterSpacing: '0.14em', color: TEAL }}>For brands</p>
            <h1 className="font-display text-4xl md:text-5xl leading-tight" style={{ color: INK }}>
              Certify your product against the standard
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: WARM }}>
              Certification assesses your product against The Clean Sheet Standard: its formula,
              testing, manufacturing, label and claims. Every certified product gets an independent
              decision and a live public proof page that shoppers and retailers can verify.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <OpenFormButton className="rounded-full px-7 py-3 text-[15px] text-white transition-opacity hover:opacity-90" style={{ background: TEAL }}>
                Apply for certification
              </OpenFormButton>
              <Link href="/standard" className="rounded-full px-7 py-3 text-[15px] transition-colors" style={{ border: `1px solid ${INK}`, color: INK }}>
                Read the standard
              </Link>
            </div>
          </div>
          <CertifiedSeal className="max-w-[340px]" />
        </section>

        {/* What certification assesses */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl" style={{ color: INK }}>What certification assesses</h2>
          <div className="space-y-3">
            {ASSESSED.map((a, i) => (
              <div key={a.title} className="rounded-lg p-6 flex gap-6 items-start" style={{ border: `1px solid ${HAIR}` }}>
                <div className="font-display text-2xl" style={{ color: TEAL }}>{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <h3 className="text-base mb-1" style={{ color: INK }}>{a.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: WARM }}>{a.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[15px] leading-relaxed" style={{ color: TEAL }}>
            <Link href="/standard" className="hover:underline">See the full standard and the twenty core gates</Link>
          </p>
        </section>

        {/* Process */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl" style={{ color: INK }}>How it works</h2>
          <div className="space-y-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-lg p-6 flex gap-6 items-start" style={{ border: `1px solid ${HAIR}` }}>
                <div className="font-display text-2xl" style={{ color: TEAL }}>{s.n}</div>
                <div>
                  <h3 className="text-base mb-1" style={{ color: INK }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: WARM }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg p-5" style={{ border: `1px solid ${HAIR}` }}>
            <p className="text-[14px] leading-relaxed" style={{ color: INK }}>
              <span style={{ color: CORAL }}>Please note. </span>
              One outcome: Certified, always shown with its exact scope and limits. There are no
              public Gold or Silver tiers and no numerical score.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl" style={{ color: INK }}>Common questions</h2>
          <div className="space-y-3">
            {FAQ.map((faq, i) => (
              <div key={i} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${HAIR}` }}>
                <button onClick={() => toggleFaq(i)} className="w-full px-6 py-4 flex justify-between items-center text-left focus-ring">
                  <span className="text-[15px]" style={{ color: INK }}>{faq.q}</span>
                  <ChevronDown className={`transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} size={20} style={{ color: WARM }} />
                </button>
                <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-64 pb-5' : 'max-h-0'}`}>
                  <p className="text-sm leading-relaxed" style={{ color: WARM }}>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Accreditation + apply */}
        <section className="space-y-6">
          <div className="rounded-lg p-6" style={{ border: `1px solid ${HAIR}` }}>
            <AccreditationLine />
          </div>
          <div className="rounded-lg p-8 text-center" style={{ border: `1px solid ${HAIR}` }}>
            <h2 className="font-display text-2xl mb-4" style={{ color: INK }}>Ready to apply?</h2>
            <p className="text-[15px] leading-relaxed max-w-xl mx-auto mb-6" style={{ color: WARM }}>
              Tell us about your brand and the product you want to certify. We will follow up to
              confirm scope, confidentiality and next steps.
            </p>
            <OpenFormButton className="inline-block rounded-full px-8 py-3 text-white text-[15px] transition-opacity hover:opacity-90" style={{ background: TEAL }}>
              Apply for certification
            </OpenFormButton>
          </div>
        </section>

      </main>
    </div>
  );
}
