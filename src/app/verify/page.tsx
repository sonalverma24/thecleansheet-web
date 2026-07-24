import Link from "next/link";
import { Reveal, Stagger, Item } from "@/components/motion/Motion";
import { VerifyArt } from "@/components/illustrations/PageArt";
import StatusBanner from "@/components/standard/StatusBanner";
import { AccreditationLine } from "@/components/standard/Disclosures";
import { PROOF_FIELDS } from "@/data/certificates";

export const metadata = {
  title: "Verify a Certificate",
  description:
    "The Clean Sheet Certified Product Registry. Only certified products appear here. Each one has a public proof page showing exactly what was checked, in which market, and what the certificate does and does not cover.",
};

const INK = "#282828";
const CREAM = "#fcf9f8";
const WARM = "#b0a8a4";
const HAIR_LIGHT = "rgba(40,40,40,0.12)";

export default function VerifyPage() {
  return (
    <div className="bg-white">
      {/* ═══ Hero ═══ */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 pt-8 md:pt-12 pb-10">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
          <div>
            <Reveal>
              <p className="text-[12px] uppercase text-[var(--color-primary)]" style={{ letterSpacing: "0.14em" }}>
                Verify · Certified Product Registry
              </p>
              <h1 className="font-display mt-5 text-[40px] md:text-[56px] leading-[1.06] tracking-[-0.02em] text-[var(--color-charcoal)]">
                Verify a certificate.
              </h1>
              <p className="mt-6 text-[17px] leading-[1.7] text-[var(--color-warm-gray)] max-w-xl">
                Check a Clean Sheet certificate here. Certification is open to brands, and certified
                products will appear in the registry as certificates are issued. Our free{" "}
                <Link href="/review" className="text-[var(--color-primary)] hover:underline">product reviews</Link>,
                which use only public information, are available now too.
              </p>
            </Reveal>
            <div className="mt-8 max-w-xl">
              <Reveal delay={0.1}><StatusBanner compact /></Reveal>
            </div>
          </div>
          <Reveal delay={0.2}>
            <VerifyArt className="w-full max-w-[440px] mx-auto" />
          </Reveal>
        </div>
      </section>

      {/* ═══ Two products, kept separate ═══ */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 pb-6">
        <Reveal>
          <div className="rounded-2xl p-5 md:p-6" style={{ background: "#f9f8f7", border: `1px solid ${HAIR_LIGHT}` }}>
            <p className="text-[14px] leading-[1.7] text-[var(--color-charcoal)]/90">
              <strong>This is not the same as a product review.</strong> Certification is based on
              a brand&apos;s confidential formula, test reports and manufacturing records, and an
              independent decision. Our free <Link href="/review" className="text-[var(--color-primary)] hover:underline">product reviews</Link> are
              different: they only use information anyone can see, and they are not certification.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ═══ Certified Product Registry (coming soon) ═══ */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 py-10">
        <Reveal>
          <div className="flex flex-wrap items-center gap-3 pb-2">
            <h2 className="font-display text-[26px] md:text-[32px] leading-tight text-[var(--color-charcoal)]">
              Certified Product Registry
            </h2>
            <span className="text-[11px] uppercase px-3 py-1 rounded-full" style={{ letterSpacing: "0.08em", background: "#fdf4dc", color: "#a87c0a", border: "1px solid #e8c56a" }}>Coming soon</span>
          </div>
          <p className="text-[15px] leading-[1.7] text-[var(--color-warm-gray)] max-w-2xl">
            Certification is open to brands, and certified products will appear here as certificates
            are issued. You will be able to search by certificate number, product or brand, confirm a
            certificate is active, and see its exact scope and verified claims.
          </p>
          <p className="mt-4 text-[14px] text-[var(--color-warm-gray)]">
            Want to see what a proof page will look like? <Link href="/verify/TCS-IN-2026-000142" className="text-[var(--color-primary)] hover:underline">Preview an example proof page</Link>. It is an illustration, not a real certificate.
          </p>
          <div className="mt-5"><AccreditationLine compact /></div>
        </Reveal>
      </section>

      {/* ═══ What every proof page shows ═══ */}
      <section style={{ background: INK }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-16 py-12 md:py-16">
          <Reveal>
            <p className="text-[12px] uppercase" style={{ letterSpacing: "0.14em", color: "#80d5cc" }}>On every proof page</p>
            <h2 className="font-display mt-6 text-[30px] md:text-[42px] leading-[1.12]" style={{ color: CREAM }}>
              Sixteen things, in plain sight.
            </h2>
            <p className="mt-5 text-[16px] leading-[1.7] max-w-2xl pb-10" style={{ color: WARM }}>
              A certificate is only worth something if you can see what is behind it. Every proof
              page publishes all of this. What stays private is the confidential formula and the
              commercial detail behind it.
            </p>
          </Reveal>
          <Stagger className="grid md:grid-cols-2 gap-x-12 gap-y-1" gap={0.04}>
            {PROOF_FIELDS.map((f, i) => (
              <Item key={f} className="flex gap-4 py-3" style={{ borderTop: `1px solid rgba(252,249,248,0.12)` }}>
                <span className="font-display text-[15px] w-6 flex-shrink-0" style={{ color: "#d2ff34" }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[14px] leading-[1.6]" style={{ color: CREAM }}>{f}</span>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ═══ For brands ═══ */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 py-10 md:py-14">
        <Reveal>
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-x-14 gap-y-8 items-center">
            <div>
              <h2 className="font-display text-[26px] md:text-[34px] leading-[1.14] text-[var(--color-charcoal)]">
                Want your product in here?
              </h2>
              <p className="mt-4 text-[16px] leading-[1.7] text-[var(--color-warm-gray)] max-w-xl">
                Certification puts your proof on the public record, where shoppers and retailers can
                check it for themselves. It assesses your product against the standard and, if it
                meets the bar, gives it a live public proof page.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link href="/for-brands" className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] text-white bg-[var(--color-primary)] hover:opacity-90 transition-opacity">
                Apply for certification <span aria-hidden>→</span>
              </Link>
              <Link href="/standard" className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]" style={{ border: `1px solid ${INK}`, color: INK }}>
                Read the standard
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
