import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PACKAGING_CATALOGUE } from "@/data/packaging";
import { EVIDENCE_SOURCE_LABELS, EVIDENCE_TYPES, OUTCOME_LABELS } from "@/data/packaging/assessment";
import { BUSINESS_TYPE_LABELS, CREDENTIAL_LABELS, EPR_LABELS } from "@/data/packaging/labels";
import { clipDescription, selfCanonical } from "@/lib/seo";
import {
  evidenceCoverage, familiesOfSupplier, rowsForSupplier, supplierHandlesPlastic, verificationSummary,
} from "@/lib/packaging-catalogue";
import OfferingCard from "@/components/directory/OfferingCard";
import { Callout, DISPLAY_FONT, EPR_NOTE, PageHeader, SectionHeading, mailto } from "@/components/directory/ui";

export const dynamicParams = false;

export function generateStaticParams() {
  return PACKAGING_CATALOGUE.suppliers.map((s) => ({ slug: s.slug }));
}

const findSupplier = (slug: string) => PACKAGING_CATALOGUE.suppliers.find((s) => s.slug === slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = findSupplier(slug);
  if (!s) return {};
  const families = familiesOfSupplier(PACKAGING_CATALOGUE, s.id).map((f) => f.name.toLowerCase());
  return {
    title: `${s.name}, ${s.city}`,
    description: clipDescription(
      `${BUSINESS_TYPE_LABELS[s.businessType]} in ${s.city}, ${s.state}.${families.length ? ` Offers ${families.join(", ")}.` : ""} ${verificationSummary(PACKAGING_CATALOGUE, s.id)}.`,
    ),
    alternates: selfCanonical(`/directory/packaging/suppliers/${s.slug}`),
  };
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default async function SupplierPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supplier = findSupplier(slug);
  if (!supplier) notFound();

  const cat = PACKAGING_CATALOGUE;
  const rows = rowsForSupplier(cat, supplier.id);
  const families = familiesOfSupplier(cat, supplier.id);
  const coverage = evidenceCoverage(cat, supplier.id);
  const summary = verificationSummary(cat, supplier.id);
  const showEpr = !!supplier.epr || supplierHandlesPlastic(cat, supplier.id);

  return (
    <div>
      <PageHeader
        eyebrow={BUSINESS_TYPE_LABELS[supplier.businessType]}
        title={supplier.name}
        trail={[
          { href: "/directory", label: "Sourcing Directory" },
          { href: "/directory/packaging", label: "Packaging" },
          { label: supplier.name },
        ]}
      >
        <p>
          {supplier.city}, {supplier.state}
          {supplier.yearEstablished ? ` | Established ${supplier.yearEstablished}` : ""}
        </p>
        <p className="mt-2 text-[13px] text-teal-200/80">{summary}</p>
        {supplier.website && (
          <p className="mt-3">
            <a href={supplier.website} target="_blank" rel="noopener noreferrer nofollow" className="text-sm text-yellow-400 underline underline-offset-2">
              Supplier website
            </a>
          </p>
        )}
      </PageHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-14">
        {supplier.about && (
          <section aria-labelledby="about-h">
            <SectionHeading id="about-h">About</SectionHeading>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-800">{supplier.about}</p>
          </section>
        )}

        <section aria-labelledby="offers-h">
          <SectionHeading id="offers-h">Variants offered</SectionHeading>
          <p className="mt-2 max-w-2xl text-sm text-ink-700">
            MOQ, price and terms belong to each variant, not the company. Check what each MOQ covers before you compare suppliers.
          </p>
          {families.length === 0 ? (
            <p className="mt-4 text-sm text-ink-700">No variants are listed for this supplier yet.</p>
          ) : (
            <div className="mt-6 space-y-8">
              {families.map((f) => (
                <div key={f.id}>
                  <h3 className="text-lg text-ink-950" style={{ fontFamily: DISPLAY_FONT }}>{f.name}</h3>
                  <div className="mt-3 space-y-4">
                    {rows.filter((r) => r.product.familyId === f.id).map((r) => (
                      <OfferingCard key={r.offering.id} product={r.product} offering={r.offering} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="creds-h">
          <SectionHeading id="creds-h">Credentials</SectionHeading>
          {supplier.credentials.length === 0 ? (
            <p className="mt-3 text-sm text-ink-700">No credentials recorded.</p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {supplier.credentials.map((c) => (
                <li key={`${c.kind}-${c.label ?? ""}`} className="rounded-2xl border border-ink-200 p-4">
                  <p className="text-sm font-medium text-ink-950">{c.kind === "other" ? c.label : CREDENTIAL_LABELS[c.kind]}</p>
                  <p className="mt-0.5 text-[13px] text-ink-700">
                    {c.verified ? "Certificate checked by TCS" : "Claimed by the supplier, not yet verified"}
                    {c.reference ? ` | Ref ${c.reference}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {showEpr && (
          <section aria-labelledby="epr-h">
            <SectionHeading id="epr-h">EPR information</SectionHeading>
            <div className="mt-4 rounded-2xl border border-ink-200 p-5">
              <p className="text-sm font-medium text-ink-950">{supplier.epr ? EPR_LABELS[supplier.epr.status] : EPR_LABELS["not-provided"]}</p>
              {supplier.epr?.reference && <p className="mt-0.5 text-[13px] text-ink-700">Reference: {supplier.epr.reference}</p>}
              <p className="mt-0.5 text-[13px] text-ink-700">
                {supplier.epr?.checkedOn ? `Checked by TCS on ${fmtDate(supplier.epr.checkedOn)}` : "Not yet checked by TCS"}
              </p>
              {supplier.epr?.note && <p className="mt-2 text-sm text-ink-800">{supplier.epr.note}</p>}
              <p className="mt-3 text-[12px] text-ink-500">{EPR_NOTE}</p>
            </div>
          </section>
        )}

        <section aria-labelledby="evidence-h">
          <SectionHeading id="evidence-h">Evidence on file</SectionHeading>
          <p className="mt-2 max-w-2xl text-sm text-ink-700">
            What we checked, where it came from and what it does not show. There is no public score yet: we will publish scores only after the records are verified and our reviewers reach comparable conclusions.
          </p>
          <div className="mt-6 space-y-6">
            {coverage.map((d) => (
              <div key={d.dimension}>
                <h3 className="text-base text-ink-950" style={{ fontFamily: DISPLAY_FONT }}>{d.label}</h3>
                {d.records.length === 0 ? (
                  <p className="mt-1 text-sm text-ink-600">Nothing checked yet.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {d.records.map((v) => (
                      <li key={v.id} className="rounded-2xl bg-cream-100 p-4">
                        <p className="text-sm font-medium text-ink-950">
                          {EVIDENCE_TYPES[v.evidence].label}: {OUTCOME_LABELS[v.outcome]}
                        </p>
                        <p className="mt-0.5 text-[13px] text-ink-700">
                          {EVIDENCE_SOURCE_LABELS[v.source]} | Checked {fmtDate(v.checkedOn)}{v.validUntil ? ` | Re-check by ${fmtDate(v.validUntil)}` : ""} | Reviewer: {v.reviewer}
                        </p>
                        <p className="mt-2 text-sm text-ink-800"><span className="font-medium">Covers:</span> {v.scope}</p>
                        <p className="mt-1 text-sm text-ink-800"><span className="font-medium">Does not show:</span> {v.limitations}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        <Callout title="Contact">
          {supplier.contact && (supplier.contact.email || supplier.contact.phone) ? (
            <p>
              {supplier.contact.person ? `${supplier.contact.person}. ` : ""}
              {supplier.contact.email && <a className="text-teal-700 underline underline-offset-2" href={`mailto:${supplier.contact.email}`}>{supplier.contact.email}</a>}
              {supplier.contact.email && supplier.contact.phone ? " | " : ""}
              {supplier.contact.phone}
            </p>
          ) : (
            <p>
              This supplier has not shared a public contact.{" "}
              <a className="text-teal-700 underline underline-offset-2" href={mailto(`Introduction to ${supplier.name}`)}>Ask us for an introduction</a>.
            </p>
          )}
        </Callout>
      </div>
    </div>
  );
}
