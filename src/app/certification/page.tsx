import Link from "next/link";
import FormModal from "@/components/FormModal";
import OpenFormButton from "@/components/OpenFormButton";
import { Reveal, Stagger, Item, TitleReveal } from "@/components/motion/Motion";

/* ────────────────────────────────────────────────────────────────
   CERTIFICATION — Evidence-First Editorial.
   Five layers, thirteen standards, one honest process.
──────────────────────────────────────────────────────────────── */

export const metadata = {
  title: "Certification | The Clean Sheet™",
  description: "Our evaluation methodology, scientific standards, and certified product registry.",
};

const INK = "#282828";
const CREAM = "#fcf9f8";
const TEAL_SOFT = "#80d5cc";
const CORAL = "#fd6158";
const LIME = "#d2ff34";
const WARM = "#b0a8a4";
const HAIR_DARK = "rgba(252,249,248,0.14)";
const HAIR_LIGHT = "rgba(40,40,40,0.15)";

const LAYERS = [
  { num: "01", name: "Legal Compliance", badge: "Pass / fail gate", points: null, body: "Every ingredient is checked against prohibited and restricted substance lists for your target markets — India, EU, US, Korea, or all of them. If anything fails here, we tell you exactly what and why before proceeding." },
  { num: "02", name: "Ingredient Safety", badge: "Primary evaluation", points: 50, body: "Every ingredient with a concern is assessed for toxicology, endocrine activity, carcinogenicity, and sensitization potential in the context of your specific formula, product type, and consumer profile. Not in isolation." },
  { num: "03", name: "Manufacturing & Quality", badge: "Scored dimension", points: 20, body: "We review your GMP certification, preservative efficacy data, stability data, and active ingredient assays. A safe formula in a poorly manufactured product is still a problem." },
  { num: "04", name: "Claims", badge: "Scored dimension", points: 20, body: "'Clinically proven' has to mean a clinical study. 'SPF 50' has to match a test result. Every claim on your label and in your marketing is assessed against the evidence in your dossier." },
  { num: "05", name: "Ethics & Sustainability", badge: "Scored dimension", points: 10, body: "Cruelty-free status, vegan ingredients, palm oil and mica sourcing, packaging sustainability, and environmental claims. We verify — not just ask." },
];

const STANDARDS = [
  { code: "EU 1223/2009", full: "EU Cosmetics Regulation (EC) No 1223/2009 and current Annexes II-VI", cat: "Regulation" },
  { code: "India CR 2020", full: "India Cosmetics Rules 2020 (Drugs & Cosmetics Act 1940)", cat: "Regulation" },
  { code: "SCCS/1602/18", full: "SCCS Notes of Guidance for the Testing of Cosmetic Ingredients", cat: "Safety Science" },
  { code: "CIR", full: "Cosmetic Ingredient Review, safety assessments database", cat: "Safety Science" },
  { code: "IFRA 49th", full: "IFRA 49th Amendment (2022), fragrance standards", cat: "Safety Science" },
  { code: "ISO 22716", full: "ISO 22716:2007, Good Manufacturing Practice for cosmetics", cat: "Manufacturing" },
  { code: "ISO 11930", full: "ISO 11930:2019, Preservative Efficacy Testing", cat: "Manufacturing" },
  { code: "ISO 24444", full: "ISO 24444:2010 rev. 2019, SPF in vivo testing", cat: "Testing" },
  { code: "ISO 16128", full: "ISO 16128, Natural and organic ingredients index", cat: "Testing" },
  { code: "ECHA SVHC", full: "ECHA Candidate List of Substances of Very High Concern", cat: "Toxicology" },
  { code: "IARC", full: "IARC carcinogen classifications (Groups 1, 2A, 2B)", cat: "Toxicology" },
  { code: "US FDA 21 CFR", full: "US FDA 21 CFR, cosmetic regulations and prohibited substances", cat: "Regulation" },
  { code: "MFDS Korea", full: "Korea Ministry of Food and Drug Safety, cosmetic standards", cat: "Regulation" },
];

const PROCESS_STEPS = [
  { step: "Week 1", title: "Application & NDA", body: "Submit your application. We agree scope — which products, which markets, which PRISM modules. An NDA is signed. You receive a dossier checklist specific to your product categories." },
  { step: "Weeks 1-3", title: "Dossier Submission", body: "You submit your formula, test data, manufacturing documentation, and marketing materials. We review for completeness. Your formula concentrations are seen only by the scientific panel." },
  { step: "Weeks 3-9", title: "Scientific Evaluation", body: "Our independent panel evaluates across all five layers. Questions are routed through your account contact. Evaluators never communicate directly with brands. No informal score discussions." },
  { step: "Weeks 9-10", title: "Result & Certificate", body: "You receive a full written evaluation report with score breakdown layer by layer. If certified: certificate, badge files, QR code, and public proof page. If not: specific gap analysis." },
  { step: "Ongoing", title: "Post-Certification", body: "We monitor regulatory developments affecting your certified products. Certificates are valid for two years. Formula or label changes trigger a review." },
];

const PRISM_MODULES = [
  { name: "Baby Safe", desc: "Paediatric safety margins and mandatory testing for products intended for infants and young children." },
  { name: "Sun Verified", desc: "SPF and UVA verification, phototoxic botanical screen, UV filter legality across markets." },
  { name: "Active Verified", desc: "Concentration verification and clinical evidence review for products making active ingredient claims." },
  { name: "Sensitive Skin", desc: "Tolerability assessment and patch testing review for products positioned for reactive or sensitised skin." },
  { name: "Pregnancy Safe", desc: "Teratogen screen and ingredient restriction for products positioned for use during pregnancy." },
  { name: "Natural & Organic", desc: "ISO 16128 natural origin index calculation and COSMOS-alignment assessment." },
  { name: "Vegan Verified", desc: "Full supply chain vegan assessment — ingredients, processing aids, and testing methodology." },
];

const FAQ = [
  { q: "Is our formula kept confidential?", a: "Yes. All formula information is covered by the NDA signed before dossier submission. Concentrations are never published." },
  { q: "What if we don't pass?", a: "You receive a full evaluation report regardless. Most brands that don't pass re-apply after addressing documentation gaps, not fundamental formulation problems." },
  { q: "How long does it take?", a: "6-10 weeks from complete dossier submission. Expedited assessment (3-4 weeks) is available at an additional fee." },
  { q: "Can we certify a single product?", a: "Yes. There is no minimum number of products." },
];

export default function CertificationPage() {
  return (
    <div className="bg-white">
      <FormModal />

      {/* ═══ Hero ═══ */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 pt-16 md:pt-24 pb-16 md:pb-24">
        <Reveal>
          <p className="text-[12px] uppercase text-[var(--color-primary)]" style={{ letterSpacing: "0.14em" }}>
            Science-backed · Independently assessed · Publicly documented
          </p>
        </Reveal>
        <h1 className="font-display mt-6 text-[44px] md:text-[64px] leading-[1.05] tracking-[-0.02em] text-[var(--color-charcoal)] max-w-3xl">
          <TitleReveal lines={["The certification", "methodology."]} />
        </h1>
        <Reveal delay={0.3}>
          <p className="mt-7 text-[18px] leading-[1.7] text-[var(--color-warm-gray)] max-w-xl">
            The Clean Sheet evaluation is based on established international safety science.
            We don&apos;t invent our own safety thresholds. We apply the best available evidence
            from recognised regulatory and scientific bodies.
          </p>
        </Reveal>
        <Reveal delay={0.45}>
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4">
            <OpenFormButton className="inline-flex items-center justify-center gap-3 rounded-full px-9 py-4 text-[16px] text-white bg-[var(--color-coral)] hover:opacity-90 transition-opacity">
              Apply for certification <span aria-hidden>→</span>
            </OpenFormButton>
            <a
              href="#methodology"
              className="inline-flex items-center justify-center gap-2 rounded-full px-9 py-4 text-[16px] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              style={{ border: `1px solid ${INK}`, color: INK }}
            >
              Read the methodology
            </a>
          </div>
        </Reveal>
        <Stagger className="mt-16 grid grid-cols-3 gap-x-10 max-w-xl" gap={0.12}>
          {[
            { n: "5", label: "Evaluation layers" },
            { n: "13", label: "Standards referenced" },
            { n: "7", label: "PRISM modules" },
          ].map(({ n, label }) => (
            <Item key={label} className="pt-5" style={{ borderTop: `1px solid ${HAIR_LIGHT}` }}>
              <p className="font-display text-[40px] md:text-[52px] leading-none text-[var(--color-primary)]">{n}</p>
              <p className="mt-3 text-[13px] leading-snug text-[var(--color-warm-gray)]">{label}</p>
            </Item>
          ))}
        </Stagger>
      </section>

      {/* ═══ Five layers ═══ */}
      <section id="methodology" className="max-w-[1200px] mx-auto px-4 md:px-16 pb-24 md:pb-32 scroll-mt-24">
        <Reveal>
          <p className="text-[12px] uppercase text-[var(--color-coral)]" style={{ letterSpacing: "0.14em" }}>
            Five evaluation layers
          </p>
          <h2 className="font-display mt-6 text-[32px] md:text-[44px] leading-[1.12] text-[var(--color-charcoal)]">
            What we evaluate.
          </h2>
          <p className="mt-5 text-[16px] leading-[1.7] text-[var(--color-warm-gray)] max-w-xl pb-12">
            Every product is assessed across five layers. The first is a pass/fail gate.
            The remaining four contribute to your 0-100 score. No exceptions.
          </p>
        </Reveal>
        <Stagger gap={0.1}>
          {LAYERS.map(({ num, name, badge, points, body }) => (
            <Item key={name} className="py-8 grid md:grid-cols-[80px_1fr_180px] gap-6 md:gap-10 items-start" style={{ borderTop: `1px solid ${HAIR_LIGHT}` }}>
              <p className="font-display text-[32px] leading-none text-[var(--color-primary)]">{num}</p>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-4 pb-3">
                  <h3 className="font-display text-[24px] leading-tight text-[var(--color-charcoal)]">{name}</h3>
                  <span
                    className="text-[10px] uppercase px-3 py-1 rounded-full"
                    style={{
                      letterSpacing: "0.1em",
                      background: points === null ? "var(--color-coral)" : "var(--color-lime)",
                      color: points === null ? "#fff" : INK,
                    }}
                  >
                    {badge}
                  </span>
                </div>
                <p className="text-[15px] leading-[1.7] text-[var(--color-warm-gray)] max-w-2xl">{body}</p>
              </div>
              <div className="md:text-right">
                {points !== null ? (
                  <>
                    <p className="font-display text-[36px] leading-none text-[var(--color-charcoal)]">{points}<span className="text-[16px] text-[var(--color-warm-gray)]"> pts</span></p>
                    <div className="mt-3 h-px w-full" style={{ background: HAIR_LIGHT }}>
                      <div className="h-[3px] -translate-y-[1px] md:ml-auto" style={{ width: `${points * 2}%`, background: "var(--color-primary)" }} />
                    </div>
                  </>
                ) : (
                  <p className="text-[12px] uppercase text-[var(--color-coral)]" style={{ letterSpacing: "0.1em" }}>Gate</p>
                )}
              </div>
            </Item>
          ))}
          <Item><div style={{ borderTop: `1px solid ${HAIR_LIGHT}` }} /></Item>
        </Stagger>

        {/* Outcomes */}
        <Stagger className="mt-16 grid sm:grid-cols-2 gap-x-12 gap-y-10" gap={0.12}>
          <Item className="pt-6" style={{ borderTop: `2px solid var(--color-lime)` }}>
            <h3 className="font-display text-[26px] text-[var(--color-charcoal)] pb-3">✓ Certified</h3>
            <p className="text-[15px] leading-[1.7] text-[var(--color-warm-gray)]">
              The product meets The Clean Sheet standard. You receive a certificate, badge,
              QR code, and public proof page with full evaluation details.
            </p>
          </Item>
          <Item className="pt-6" style={{ borderTop: `2px solid var(--color-coral)` }}>
            <h3 className="font-display text-[26px] text-[var(--color-charcoal)] pb-3">✗ Not Certified</h3>
            <p className="text-[15px] leading-[1.7] text-[var(--color-warm-gray)]">
              The product does not meet the standard. You receive a full written evaluation
              report with specific gaps identified and a clear re-application path.
            </p>
          </Item>
        </Stagger>
      </section>

      {/* ═══ Standards — dark sheet ═══ */}
      <section id="standards" style={{ background: INK }} className="scroll-mt-24">
        <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-20 md:py-28">
          <Reveal>
            <p className="text-[12px] uppercase" style={{ letterSpacing: "0.14em", color: TEAL_SOFT }}>
              Reference standards
            </p>
            <h2 className="font-display mt-6 text-[32px] md:text-[44px] leading-[1.12]" style={{ color: CREAM }}>
              We don&apos;t set thresholds.<br />We apply them.
            </h2>
            <p className="mt-5 text-[16px] leading-[1.7] max-w-xl pb-12" style={{ color: WARM }}>
              The best available evidence from the world&apos;s leading cosmetic safety bodies.
              Every standard is documented and publicly accessible.
            </p>
          </Reveal>
          <Stagger gap={0.05}>
            {STANDARDS.map(({ code, full, cat }) => (
              <Item key={code} className="py-4 grid md:grid-cols-[170px_1fr_130px] gap-3 md:gap-8 items-baseline" style={{ borderTop: `1px solid ${HAIR_DARK}` }}>
                <p className="text-[14px]" style={{ color: LIME }}>{code}</p>
                <p className="text-[14px] leading-relaxed" style={{ color: CREAM }}>{full}</p>
                <p className="text-[11px] uppercase md:text-right" style={{ letterSpacing: "0.1em", color: WARM }}>{cat}</p>
              </Item>
            ))}
            <Item><div style={{ borderTop: `1px solid ${HAIR_DARK}` }} /></Item>
          </Stagger>
          <Reveal delay={0.1}>
            <div className="mt-14 max-w-2xl">
              <h3 className="font-display text-[24px] pb-4" style={{ color: CREAM }}>Who evaluates.</h3>
              <p className="text-[15px] leading-[1.75] pb-3" style={{ color: WARM }}>
                Evaluations are conducted by an independent panel of experts, including cosmetic
                scientists, toxicologists, and dermatologists. Panel members have no commercial
                relationship with applying brands. Conflicts of interest are declared and managed.
              </p>
              <p className="text-[15px] leading-[1.75]" style={{ color: WARM }}>
                Panel members are named on our About page because transparency about who
                evaluates is part of what makes the standard credible.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ Process ═══ */}
      <section id="process" className="max-w-[1200px] mx-auto px-4 md:px-16 py-24 md:py-32 scroll-mt-24">
        <Reveal>
          <p className="text-[12px] uppercase text-[var(--color-primary)]" style={{ letterSpacing: "0.14em" }}>
            Timeline
          </p>
          <h2 className="font-display mt-6 text-[32px] md:text-[44px] leading-[1.12] text-[var(--color-charcoal)]">
            The process.
          </h2>
          <p className="mt-5 text-[16px] leading-[1.7] text-[var(--color-warm-gray)] max-w-xl pb-12">
            Six to ten weeks from complete dossier submission to certification decision.
            Five stages. Every product goes through all of them.
          </p>
        </Reveal>
        <Stagger gap={0.1} className="max-w-3xl">
          {PROCESS_STEPS.map(({ step, title, body }, i) => (
            <Item key={step} className="py-7 grid md:grid-cols-[120px_1fr] gap-3 md:gap-10" style={{ borderTop: `1px solid ${HAIR_LIGHT}` }}>
              <div>
                <p className="font-display text-[22px] leading-none text-[var(--color-primary)]">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-2 text-[11px] uppercase text-[var(--color-warm-gray)]" style={{ letterSpacing: "0.1em" }}>{step}</p>
              </div>
              <div>
                <h3 className="font-display text-[22px] text-[var(--color-charcoal)] pb-2">{title}</h3>
                <p className="text-[15px] leading-[1.7] text-[var(--color-warm-gray)]">{body}</p>
              </div>
            </Item>
          ))}
          <Item><div style={{ borderTop: `1px solid ${HAIR_LIGHT}` }} /></Item>
        </Stagger>
      </section>

      {/* ═══ PRISM — dark sheet ═══ */}
      <section id="prism" style={{ background: INK }} className="scroll-mt-24">
        <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-x-20 gap-y-14 items-start">
            <Reveal>
              <p className="text-[12px] uppercase" style={{ letterSpacing: "0.14em", color: LIME }}>
                Specialist certification
              </p>
              <h2 className="font-display mt-6 text-[34px] md:text-[44px] leading-[1.12]" style={{ color: CREAM }}>
                PRISM Standard™
              </h2>
              <p className="mt-3 text-[13px] uppercase" style={{ letterSpacing: "0.1em", color: WARM }}>
                Product Review for Ingredient Safety and Marketing Integrity
              </p>
              <p className="mt-7 text-[16px] leading-[1.75] max-w-md" style={{ color: WARM }}>
                Baby care, sunscreens, clinical actives, products for sensitive skin — these
                categories carry higher consumer trust stakes. PRISM modules are specialist
                add-ons to Core certification that apply a deeper evaluation where it matters most.
              </p>
              <p className="mt-4 text-[15px] leading-[1.75] max-w-md" style={{ color: WARM }}>
                PRISM modules appear as additional verified badges on your public proof page,
                alongside your Core certification status.
              </p>
              <OpenFormButton
                className="mt-10 inline-flex items-center gap-3 rounded-full px-8 py-4 text-[15px] hover:opacity-90 transition-opacity"
                style={{ background: LIME, color: INK }}
              >
                Apply with PRISM add-ons <span aria-hidden>→</span>
              </OpenFormButton>
            </Reveal>
            <Stagger gap={0.08}>
              {PRISM_MODULES.map(({ name, desc }) => (
                <Item key={name} className="py-5" style={{ borderTop: `1px solid ${HAIR_DARK}` }}>
                  <p className="flex items-center gap-3 text-[17px] pb-2" style={{ color: CREAM }}>
                    <span className="inline-block w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: LIME }} />
                    {name}
                  </p>
                  <p className="pl-[18px] text-[14px] leading-[1.7]" style={{ color: WARM }}>{desc}</p>
                </Item>
              ))}
              <Item><div style={{ borderTop: `1px solid ${HAIR_DARK}` }} /></Item>
            </Stagger>
          </div>
        </div>
      </section>

      {/* ═══ Registry ═══ */}
      <section id="registry" className="max-w-[1200px] mx-auto px-4 md:px-16 py-24 md:py-32 scroll-mt-24">
        <div className="grid lg:grid-cols-2 gap-x-20 gap-y-14 items-start">
          <Reveal>
            <p className="text-[12px] uppercase text-[var(--color-primary)]" style={{ letterSpacing: "0.14em" }}>
              Public registry
            </p>
            <h2 className="font-display mt-6 text-[32px] md:text-[40px] leading-[1.15] text-[var(--color-charcoal)]">
              Certified products.
            </h2>
            <p className="mt-5 text-[16px] leading-[1.7] text-[var(--color-warm-gray)] max-w-lg">
              Every certified product has a public proof page — score, tier, verified claims,
              certificate details. Anyone can verify any certified product at any time, via
              QR code or search.
            </p>
            <p className="mt-4 text-[15px] leading-[1.7] text-[var(--color-warm-gray)] max-w-lg">
              We are currently evaluating our founding cohort of brands. Certified products
              will appear as the first certifications are issued. Meanwhile, products that
              pass our public review sit in the Verified Products registry.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/verified"
                className="inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 text-[15px] text-white bg-[var(--color-primary)] hover:opacity-90 transition-opacity"
              >
                View verified products <span aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="pt-6" style={{ borderTop: `1px solid ${INK}` }}>
              <h3 className="font-display text-[24px] text-[var(--color-charcoal)] pb-6">What every proof page publishes.</h3>
              <div className="flex flex-col">
                {[
                  "Product name, brand, and category",
                  "Certification tier and total score (0-100)",
                  "Score breakdown by layer",
                  "PRISM modules assessed",
                  "Target markets evaluated for",
                  "Verified claims list",
                  "Certificate number, issue date, and expiry",
                ].map((item) => (
                  <p key={item} className="flex items-center gap-3 py-3 text-[15px] text-[var(--color-charcoal)]" style={{ borderTop: `1px solid ${HAIR_LIGHT}` }}>
                    <span className="inline-block w-[6px] h-[6px] rounded-full bg-[var(--color-primary)] flex-shrink-0" />
                    {item}
                  </p>
                ))}
                <p className="flex items-center gap-3 py-3 text-[14px] text-[var(--color-warm-gray)]" style={{ borderTop: `1px solid ${HAIR_LIGHT}`, borderBottom: `1px solid ${HAIR_LIGHT}` }}>
                  <span className="inline-block w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ border: `1px solid ${WARM}` }} />
                  Formula concentrations and commercially sensitive dossier content are never published.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ Apply — teal band ═══ */}
      <section id="apply" style={{ background: "var(--color-primary)" }} className="scroll-mt-24">
        <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-24 md:py-28">
          <div className="grid lg:grid-cols-2 gap-x-20 gap-y-14 items-start">
            <Reveal>
              <h2 className="font-display text-[34px] md:text-[48px] leading-[1.12]" style={{ color: CREAM }}>
                Start the conversation.
              </h2>
              <p className="mt-6 text-[17px] leading-[1.7] max-w-md" style={{ color: "rgba(252,249,248,0.85)" }}>
                Tell us about your brand and the products you want to certify. We&apos;ll follow up
                within 2 business days to discuss scope, timeline, and fees.
              </p>
              <p className="mt-3 text-[15px] leading-[1.7] max-w-md" style={{ color: "rgba(252,249,248,0.6)" }}>
                There is no minimum. Some brands certify one hero product first and expand from there.
              </p>
              <OpenFormButton
                className="mt-10 inline-flex items-center gap-3 rounded-full px-9 py-4 text-[16px] hover:opacity-90 transition-opacity"
                style={{ background: CREAM, color: INK }}
              >
                Apply for certification <span aria-hidden>→</span>
              </OpenFormButton>
              <p className="mt-6 text-[14px]" style={{ color: "rgba(252,249,248,0.7)" }}>
                Or email <a href="mailto:hello@thecleansheet.in" className="underline" style={{ color: CREAM }}>hello@thecleansheet.in</a>
              </p>
            </Reveal>
            <Stagger gap={0.1}>
              {FAQ.map(({ q, a }) => (
                <Item key={q} className="py-6" style={{ borderTop: "1px solid rgba(252,249,248,0.25)" }}>
                  <h4 className="text-[16px] pb-2" style={{ color: CREAM }}>{q}</h4>
                  <p className="text-[14px] leading-[1.7]" style={{ color: "rgba(252,249,248,0.7)" }}>{a}</p>
                </Item>
              ))}
              <Item><div style={{ borderTop: "1px solid rgba(252,249,248,0.25)" }} /></Item>
            </Stagger>
          </div>
        </div>
      </section>
    </div>
  );
}
