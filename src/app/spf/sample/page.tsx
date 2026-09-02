import type { Metadata } from 'next';
import Link from 'next/link';
import { AccreditationLine } from '@/components/standard/Disclosures';

/* ────────────────────────────────────────────────────────────────
   SAMPLE PROOF PAGE · /spf/sample

   An illustrative example of the public page a brand receives after
   an SPF Proof Report. Follows CONSUMER_PROOF_PAGE_TEMPLATE.md.

   INTEGRITY RULES — do not relax any of these:
   · The product and brand are invented. No real product is shown.
   · The sample status bar appears at the top AND bottom, always amber,
     never hidden, never styled down.
   · The page is noindex. It must never appear in search results or be
     mistaken for a live verification.
   · Language is "verified", never "certified". Certification is not
     operational (see components/standard/Disclosures.tsx).
──────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: 'Sample proof page — SPF verification',
  description:
    'An illustrative example of the public proof page issued after an SPF Proof Report. The product shown is invented and no brand has been verified.',
  robots: { index: false, follow: false },
};

const TEAL = '#248179';
const CORAL = '#fd6158';
const INK = '#282828';
const WARM = '#b0a8a4';
const HAIR = 'rgba(40,40,40,0.12)';
const AMBER_BG = '#fffbeb';
const AMBER_LINE = '#f0c36d';
const AMBER_INK = '#8a5a09';

/* ── The invented product ─────────────────────────────────────── */
const SAMPLE = {
  brand: 'Meridian Skin',
  product: 'Daily Sun Fluid',
  variant: 'SPF 50 · PA++++ · 50 ml',
  reportId: 'TCS-SPF-SAMPLE-0000',
  assessed: '14 May 2026',
  expires: '14 May 2027',
  methodology: 'TCS SPF Protocol v1.0 (12 checkpoints)',
  batch: 'MSD-2604-B',
};

const EVIDENCE_STRIP = [
  { n: '58.4', label: 'Measured SPF', note: 'ISO 24444, in vivo, 10 valid subjects. Label claim is 50.' },
  { n: '18.2', label: 'Measured PPD', note: 'ISO 24442, in vivo. PA++++ requires 16 or above.' },
  { n: '378 nm', label: 'Critical wavelength', note: 'ISO 24443. Broad spectrum requires 370 nm or above.' },
  { n: '82%', label: 'SPF retained in water', note: 'ISO 16217, two 20-minute immersions. Threshold is 50%.' },
];

const VERIFIED = [
  {
    tone: 'hero',
    label: 'SPF',
    claim: 'SPF 50',
    result: 'Measured 58.4 (SD 12.1, n = 10)',
    body: 'Independently re-tested on a unit bought from open retail. The measured mean and its confidence interval support the labelled value. The label is conservative against the result, which is the correct direction.',
  },
  {
    tone: 'hero',
    label: 'UVA',
    claim: 'PA++++',
    result: 'Measured PPD 18.2',
    body: 'In-vivo persistent pigment darkening, ISO 24442. PA++++ requires a PPD of 16 or above. The UVA-PF to SPF ratio is 0.34, above the one-third minimum for broad spectrum.',
  },
  {
    tone: 'plain',
    label: 'Water resistance',
    claim: '“Water resistant”',
    result: '82% of initial SPF retained',
    body: 'ISO 16217, two 20-minute immersions. The claim printed on the pack matches the protocol that was actually run — which is not always the case.',
  },
  {
    tone: 'plain',
    label: 'Photostability',
    claim: 'Protection holds through the day',
    result: '94% SPF retained after UV dose',
    body: 'The filter system does not degrade meaningfully under sustained UV exposure. An SPF certificate on its own will never show you this.',
  },
  {
    tone: 'plain',
    label: 'Filter legality',
    claim: 'All filters lawful in India',
    result: '5 filters, all within permitted limits',
    body: 'Every UV filter and its concentration checked against the Cosmetics Rules 2020. Also cleared against EU Annex VI, because this brand declared an export market.',
  },
  {
    tone: 'plain',
    label: 'Sample identity',
    claim: 'The tested product is the shipping product',
    result: 'Formula version and batch matched',
    body: 'The formula tested is the formula on sale. This is the checkpoint products most often fail, and almost never for dishonest reasons.',
  },
  {
    tone: 'plain',
    label: 'Labelling',
    claim: 'Statutory label complete',
    result: 'All required particulars present',
    body: 'Cosmetics Rules 2020 and Legal Metrology requirements: licence number, batch, dates, net quantity, ingredient order, directions and warnings.',
  },
  {
    tone: 'plain',
    label: 'Claim language',
    claim: '14 live claims reviewed',
    result: '12 supported · 2 amended before publication',
    body: 'Every SPF-related claim across the website, pack, ads and marketplace listings. Two were amended by the brand before this page was issued. Both are named in the scope note below.',
  },
];

const FILTERS = [
  { name: 'Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine', pct: '3.0%', role: 'UVA and UVB, photostable' },
  { name: 'Ethylhexyl Triazone', pct: '3.0%', role: 'UVB, high efficiency' },
  { name: 'Diethylamino Hydroxybenzoyl Hexyl Benzoate', pct: '4.0%', role: 'UVA, photostable' },
  { name: 'Tris-Biphenyl Triazine', pct: '5.0%', role: 'Broad spectrum, particulate' },
  { name: 'Titanium Dioxide', pct: '2.5%', role: 'Broad spectrum, mineral' },
];

const HOW_TESTED = [
  {
    n: '01',
    title: 'The sample was bought, not supplied',
    body: 'A sealed unit purchased from open retail in Mumbai on 22 April 2026. The brand did not know which unit or which batch. Chain of custody documented from purchase to laboratory.',
  },
  {
    n: '02',
    title: 'The laboratory was chosen by us',
    body: 'A NABL-accredited laboratory, accreditation current at the date of testing, with each method inside its accredited scope. The Clean Sheet instructed the lab directly. The brand paid the laboratory at cost, with no margin to us.',
  },
  {
    n: '03',
    title: 'The brand saw the findings before publication',
    body: 'Draft findings were issued with five working days to submit further evidence or correct a factual error. The verdict itself was not open to negotiation, and this is written into the engagement.',
  },
  {
    n: '04',
    title: 'A second assessor reviewed the decision',
    body: 'The person who sold the engagement did not decide its outcome. Every verdict is reviewed independently before it is communicated or published.',
  },
];

const NOT_COVERED = [
  'Any claim not listed on this page. Two claims were amended before publication: a “12-hour protection” claim, withdrawn for want of supporting data, and “sweat-proof”, which is not a permitted claim in any case.',
  'Suitability for any individual person, skin type or condition. This is a verification of evidence, not medical advice.',
  'Batches other than the one tested, and any formulation change made after the assessment date.',
  'The brand’s other products. Verification is per product, never company-wide.',
  'Regulatory approval of any kind. This is a voluntary private assessment and does not replace licensing or compliance obligations.',
];

/* ── Reusable sample banner ───────────────────────────────────── */
function SampleBar() {
  return (
    <div
      className="rounded-lg px-5 py-4"
      style={{ background: AMBER_BG, border: `1px solid ${AMBER_LINE}` }}
    >
      <p className="text-[13px] leading-[1.6]" style={{ color: AMBER_INK }}>
        <strong>Sample page. Not a verification.</strong> Meridian Skin is an invented brand and this
        product does not exist. Every figure below is illustrative, shown so brands can see the format
        of the page they would receive. No product has been verified by The Clean Sheet on this page.
      </p>
    </div>
  );
}

export default function SampleProofPage() {
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-4xl mx-auto px-6 pt-8 space-y-12">

        <SampleBar />

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="space-y-3">
            <p className="text-[12px] uppercase" style={{ letterSpacing: '0.14em', color: TEAL }}>
              Independently verified by The Clean Sheet
            </p>
            <h1 className="font-display text-4xl md:text-5xl leading-tight" style={{ color: INK }}>
              {SAMPLE.product}
            </h1>
            <p className="text-lg" style={{ color: INK }}>{SAMPLE.variant}</p>
            <p className="text-[15px]" style={{ color: WARM }}>
              {SAMPLE.brand} <span style={{ color: CORAL }}>· invented brand, illustrative only</span>
            </p>
          </div>

          <p className="text-[15px] leading-relaxed max-w-2xl" style={{ color: WARM }}>
            The Clean Sheet is an independent assessor. {SAMPLE.brand} commissioned this verification
            and paid for it. The findings, and the decision to publish them, were ours alone. The fee
            covered the assessment and could not buy its outcome.
          </p>

          {/* Evidence strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {EVIDENCE_STRIP.map((e) => (
              <div key={e.label} className="rounded-lg p-5 space-y-1" style={{ border: `1px solid ${HAIR}` }}>
                <p className="font-display text-3xl" style={{ color: TEAL }}>{e.n}</p>
                <p className="text-[13px]" style={{ color: INK }}>{e.label}</p>
                <p className="text-[12px] leading-[1.5]" style={{ color: WARM }}>{e.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Verified claims ────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl" style={{ color: INK }}>What was verified</h2>
          <div className="space-y-3">
            {VERIFIED.map((v) => (
              <div
                key={v.label}
                className="rounded-lg p-6 space-y-2"
                style={{
                  border: v.tone === 'hero' ? `1.5px solid ${TEAL}` : `1px solid ${HAIR}`,
                  background: v.tone === 'hero' ? 'rgba(36,129,121,0.03)' : 'transparent',
                }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[12px] uppercase" style={{ letterSpacing: '0.12em', color: TEAL }}>
                    {v.label}
                  </p>
                  <p className="text-[13px]" style={{ color: WARM }}>{v.result}</p>
                </div>
                <h3 className="text-base" style={{ color: INK }}>{v.claim}</h3>
                <p className="text-sm leading-relaxed" style={{ color: WARM }}>{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Deep dive ──────────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl" style={{ color: INK }}>The filter system, in full</h2>
          <p className="text-[15px] leading-relaxed max-w-2xl" style={{ color: WARM }}>
            A sunscreen is only as good as the filters in it and their stability together. These are the
            five in this formula, each checked for legality and concentration, and the combination
            checked for whether it survives a day in the sun.
          </p>
          <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${HAIR}` }}>
            {FILTERS.map((f, i) => (
              <div
                key={f.name}
                className="px-6 py-4 flex flex-wrap gap-x-6 gap-y-1 items-baseline justify-between"
                style={{ borderTop: i === 0 ? 'none' : `1px solid ${HAIR}` }}
              >
                <p className="text-sm grow" style={{ color: INK }}>{f.name}</p>
                <p className="text-sm font-medium" style={{ color: TEAL }}>{f.pct}</p>
                <p className="text-[13px] w-full md:w-auto" style={{ color: WARM }}>{f.role}</p>
              </div>
            ))}
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: WARM }}>
            Concentrations are published here because the brand agreed to it. They are not required to,
            and a page without them is not a weaker verification.
          </p>
        </section>

        {/* ── How it was tested ──────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl" style={{ color: INK }}>How this was tested</h2>
          <div className="space-y-3">
            {HOW_TESTED.map((h) => (
              <div key={h.n} className="rounded-lg p-6 flex gap-6 items-start" style={{ border: `1px solid ${HAIR}` }}>
                <div className="font-display text-2xl shrink-0" style={{ color: TEAL }}>{h.n}</div>
                <div>
                  <h3 className="text-base mb-1" style={{ color: INK }}>{h.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: WARM }}>{h.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Scope and limits ───────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl" style={{ color: INK }}>What this does not cover</h2>
          <div className="rounded-lg p-6 space-y-4" style={{ border: `1px solid ${HAIR}` }}>
            <p className="text-[15px] leading-relaxed" style={{ color: INK }}>
              <span style={{ color: CORAL }}>Please note. </span>
              A verification that does not state its own limits is worth less, not more. These are ours.
            </p>
            <ul className="space-y-3">
              {NOT_COVERED.map((n, i) => (
                <li key={i} className="text-sm leading-relaxed flex gap-3" style={{ color: WARM }}>
                  <span className="shrink-0" style={{ color: TEAL }}>—</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Record ─────────────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl" style={{ color: INK }}>The record</h2>
          <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${HAIR}` }}>
            {[
              ['Report reference', SAMPLE.reportId],
              ['Product assessed', `${SAMPLE.brand} ${SAMPLE.product}, ${SAMPLE.variant}`],
              ['Batch tested', SAMPLE.batch],
              ['Date of assessment', SAMPLE.assessed],
              ['Valid until', SAMPLE.expires],
              ['Methodology', SAMPLE.methodology],
              ['Claims reviewed', '14 reviewed · 12 supported · 2 amended before publication'],
              ['Status', 'Sample. No verification in force.'],
            ].map(([k, v], i) => (
              <div
                key={k}
                className="px-6 py-4 flex flex-wrap gap-x-6 gap-y-1 justify-between"
                style={{ borderTop: i === 0 ? 'none' : `1px solid ${HAIR}` }}
              >
                <p className="text-[13px]" style={{ color: WARM }}>{k}</p>
                <p className="text-[13px] text-right" style={{ color: INK }}>{v}</p>
              </div>
            ))}
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: WARM }}>
            Verification is point-in-time. It voids automatically if the formulation, the manufacturing
            site or the claims change, and it can be withdrawn if a later market check contradicts this
            result. Withdrawals are published. On a live page, this panel is where you would confirm
            that a verification is still in force.
          </p>
        </section>

        <SampleBar />

        {/* ── Close ──────────────────────────────────────────── */}
        <section className="space-y-5 rounded-lg p-8" style={{ border: `1px solid ${HAIR}` }}>
          <h2 className="font-display text-2xl" style={{ color: INK }}>
            This is the page your product would get
          </h2>
          <p className="text-[15px] leading-relaxed max-w-2xl" style={{ color: WARM }}>
            Permanent, public, QR-linked from your pack, and written so a shopper can read it without
            knowing what ISO 24444 is.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/spf"
              className="rounded-full px-7 py-3 text-[15px] text-white transition-opacity hover:opacity-90"
              style={{ background: TEAL }}
            >
              See how SPF verification works
            </Link>
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

      </div>
    </div>
  );
}
