import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CERTIFICATES, getCertificate } from "@/data/certificates";

/* ────────────────────────────────────────────────────────────────
   PUBLIC PROOF PAGE · one certified product, sixteen fields.
   One outcome: Certified, always shown with its scope and limits.
──────────────────────────────────────────────────────────────── */

const INK = "#282828";
const CREAM = "#fcf9f8";
const HAIR = "rgba(40,40,40,0.12)";

export function generateStaticParams() {
  return CERTIFICATES.map((c) => ({ certificate: c.certificateNo }));
}

export async function generateMetadata({ params }: { params: Promise<{ certificate: string }> }): Promise<Metadata> {
  const { certificate } = await params;
  const c = getCertificate(certificate);
  if (!c) return { title: "Certificate not found" };
  return {
    title: `${c.productName} · ${c.certificateNo}`,
    description: `Public proof page for ${c.productName} by ${c.brand}. Certified by The Clean Sheet for ${c.markets.join(", ")}.`,
    robots: { index: false, follow: false }, // example proof page, not a real certificate
  };
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid sm:grid-cols-[220px_1fr] gap-1 sm:gap-6 py-4" style={{ borderTop: `1px solid ${HAIR}` }}>
      <p className="text-[12px] uppercase text-[var(--color-warm-gray)]" style={{ letterSpacing: "0.06em" }}>{label}</p>
      <div className="text-[15px] leading-[1.65] text-[var(--color-charcoal)]/90">{children}</div>
    </div>
  );
}

export default async function ProofPage({ params }: { params: Promise<{ certificate: string }> }) {
  const { certificate } = await params;
  const c = getCertificate(certificate);
  if (!c) notFound();

  return (
    <div className="bg-white">
      {/* Example notice */}
      {c.isExample && (
        <div className="w-full" style={{ background: "#fdf4dc", borderBottom: "1px solid #e8c56a" }}>
          <div className="max-w-[1000px] mx-auto px-4 md:px-10 py-3 text-[13px] text-[#7a5a08]">
            <strong>Example proof page.</strong> This shows the layout of a real certificate. It is an illustration, not a certification of this product.
          </div>
        </div>
      )}

      <div className="max-w-[1000px] mx-auto px-4 md:px-10 pt-8 md:pt-10 pb-24">
        {/* Breadcrumb */}
        <p className="text-[12px] uppercase text-[var(--color-primary)]" style={{ letterSpacing: "0.12em" }}>
          <Link href="/verify" className="hover:underline">Certified Product Registry</Link>
        </p>

        {/* Header */}
        <div className="mt-5 grid md:grid-cols-[1fr_240px] gap-8 items-start">
          <div>
            <p className="text-[13px] uppercase text-[var(--color-warm-gray)]" style={{ letterSpacing: "0.08em" }}>{c.brand}</p>
            <h1 className="font-display mt-2 text-[32px] md:text-[44px] leading-[1.08] tracking-[-0.02em] text-[var(--color-charcoal)]">{c.productName}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 text-[14px] px-3.5 py-1.5 rounded-full" style={{ background: "#dcfce7", color: "#166534" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "#16a34a" }} /> {c.status}
              </span>
              <span className="font-mono text-[13px] text-[var(--color-warm-gray)]">{c.certificateNo}</span>
            </div>
          </div>

          {/* Certificate / QR card */}
          <div className="rounded-2xl p-5" style={{ border: `1px solid ${HAIR}`, background: CREAM }}>
            <div className="aspect-square w-full rounded-xl grid place-items-center" style={{ background: "#fff", border: `1px solid ${HAIR}` }}>
              <div className="text-center px-4">
                <div className="mx-auto mb-2 grid grid-cols-4 gap-1 w-16 h-16" aria-hidden>
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span key={i} className="rounded-[2px]" style={{ background: [0, 1, 3, 4, 6, 9, 11, 12, 13, 15].includes(i) ? INK : "transparent" }} />
                  ))}
                </div>
                <p className="text-[11px] uppercase text-[var(--color-warm-gray)]" style={{ letterSpacing: "0.1em" }}>Scan to verify</p>
              </div>
            </div>
            <p className="mt-3 text-[12px] leading-[1.5] text-[var(--color-warm-gray)] break-words">
              thecleansheet.in/verify/{c.certificateNo}
            </p>
          </div>
        </div>

        {/* What this covers / does not cover */}
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl p-5" style={{ border: `1px solid ${HAIR}` }}>
            <p className="text-[12px] uppercase text-[var(--color-primary)] pb-2" style={{ letterSpacing: "0.08em" }}>What this covers</p>
            <p className="text-[14px] leading-[1.65] text-[var(--color-charcoal)]/90">
              This exact product, in {c.markets.join(", ")}, for the formula and package version below. Only the claims listed as verified are covered.
            </p>
          </div>
          <div className="rounded-2xl p-5" style={{ border: `1px solid ${HAIR}` }}>
            <p className="text-[12px] uppercase pb-2" style={{ letterSpacing: "0.08em", color: "#b04a44" }}>What it does not mean</p>
            <p className="text-[14px] leading-[1.65] text-[var(--color-charcoal)]/90">{c.limitations}</p>
          </div>
        </div>

        {/* Verified claims */}
        <section className="mt-12">
          <h2 className="font-display text-[24px] md:text-[28px] text-[var(--color-charcoal)]">Verified claims</h2>
          <p className="mt-2 text-[14px] text-[var(--color-warm-gray)]">These are the only claims this certificate covers. Anything else the product says is not part of it.</p>
          <div className="mt-5 flex flex-col">
            {c.verifiedClaims.map((v) => (
              <div key={v.claim} className="grid sm:grid-cols-[220px_1fr] gap-1 sm:gap-6 py-4" style={{ borderTop: `1px solid ${HAIR}` }}>
                <p className="flex items-start gap-2 text-[15px] text-[var(--color-charcoal)]">
                  <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#16a34a" }} />
                  <span className="font-medium">{v.claim}</span>
                </p>
                <p className="text-[14px] leading-[1.65] text-[var(--color-charcoal)]/85">
                  {v.basis}{" "}
                  <Link href="/standard/claims" className="text-[var(--color-primary)] hover:underline whitespace-nowrap">see the rule</Link>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* The details, all 16 fields */}
        <section className="mt-12">
          <h2 className="font-display text-[24px] md:text-[28px] text-[var(--color-charcoal)] pb-2">Certificate details</h2>
          <div className="mt-3">
            <FieldRow label="Responsible company">{c.legalEntity}</FieldRow>
            <FieldRow label="Category, SKU, variant">{c.category} · {c.sku} · {c.variant}</FieldRow>
            <FieldRow label="Certificate number">{c.certificateNo}</FieldRow>
            <FieldRow label="Standard version">{c.standardVersion}</FieldRow>
            <FieldRow label="Formula & package version">{c.formulaVersion} · {c.packageVersion}</FieldRow>
            <FieldRow label="Certified for">{c.markets.join(", ")}</FieldRow>
            <FieldRow label="Modules assessed">
              <div className="flex flex-wrap gap-2">
                {c.modules.map((m) => (
                  <span key={m} className="text-[13px] px-2.5 py-1 rounded-full" style={{ background: "#eef0ee", color: INK }}>{m}</span>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Tests">
              <div className="flex flex-col gap-3">
                {c.tests.map((t) => (
                  <div key={t.method}>
                    <p className="text-[14px] text-[var(--color-charcoal)]">{t.method}: <span style={{ color: "#166534" }}>{t.result}</span></p>
                    <p className="text-[12px] text-[var(--color-warm-gray)]">{t.labType} · {t.date}</p>
                  </div>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Manufacturing">{c.manufacturingStatus}</FieldRow>
            <FieldRow label="How to use">{c.directions}</FieldRow>
            <FieldRow label="Issued / expires">{c.issueDate} to {c.expiryDate}</FieldRow>
            <FieldRow label="Status">{c.status}</FieldRow>
            <FieldRow label="Changes & surveillance">
              <div className="flex flex-col gap-2">
                {c.surveillance.map((s) => (
                  <p key={s.date} className="text-[14px]"><span className="text-[var(--color-warm-gray)]">{s.date}:</span> {s.note}</p>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Report a concern">
              <a href={c.reportLink} className="text-[var(--color-primary)] hover:underline">Report a safety concern about this product</a>
            </FieldRow>
          </div>
        </section>

        {/* Footer nav */}
        <div className="mt-14 pt-8 flex flex-wrap gap-4" style={{ borderTop: `1px solid ${INK}` }}>
          <Link href="/verify" className="text-[15px] text-[var(--color-primary)] hover:underline">← Back to the registry</Link>
          <Link href="/standard" className="text-[15px] text-[var(--color-warm-gray)] hover:text-[var(--color-primary)]">Read the standard behind this</Link>
        </div>
      </div>
    </div>
  );
}
