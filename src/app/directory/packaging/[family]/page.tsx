import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PACKAGING_CATALOGUE } from "@/data/packaging";
import { FAMILY_GROUPS, MATERIAL_LABELS, PACKAGING_FAMILIES, getFamilyById } from "@/data/packaging/families";
import {
  COVERAGE_LABELS, PILOT_TARGETS, familyCoverage, isFamilyIndexable, rowsForFamily, verificationSummary,
} from "@/lib/packaging-catalogue";
import { NOINDEX, clipDescription, selfCanonical } from "@/lib/seo";
import OfferingCard from "@/components/directory/OfferingCard";
import {
  COMPATIBILITY_NOTE, Callout, CoverageBadge, DISPLAY_FONT, EPR_NOTE, PageHeader, SectionHeading, mailto,
} from "@/components/directory/ui";

export const dynamicParams = false;

export function generateStaticParams() {
  return PACKAGING_FAMILIES.map((f) => ({ family: f.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ family: string }> }): Promise<Metadata> {
  const { family: id } = await params;
  const family = getFamilyById(id);
  if (!family) return {};
  const cov = familyCoverage(PACKAGING_CATALOGUE, id);
  const title = `${family.name} in India: Suppliers and MOQs`;
  return {
    title,
    description: clipDescription(
      `${family.summary} See supplier options, MOQs and what to check before you order. ${COVERAGE_LABELS[cov.level]}.`,
    ),
    alternates: selfCanonical(`/directory/packaging/${id}`),
    // Every family has a page, but one with no supplier content is thin: keep it
    // out of the index until it lists at least one real offering.
    ...(isFamilyIndexable(PACKAGING_CATALOGUE, id) ? {} : { robots: NOINDEX }),
    openGraph: {
      title: `${title} | The Clean Sheet™`,
      description: family.summary,
      url: `https://thecleansheet.in/directory/packaging/${id}`,
      type: "website",
    },
  };
}

export default async function FamilyPage({ params }: { params: Promise<{ family: string }> }) {
  const { family: id } = await params;
  const family = getFamilyById(id);
  if (!family) notFound();

  const cov = familyCoverage(PACKAGING_CATALOGUE, id);
  const rows = rowsForFamily(PACKAGING_CATALOGUE, id).sort(
    (a, b) => a.supplier.name.localeCompare(b.supplier.name) || a.product.name.localeCompare(b.product.name),
  );
  const idx = PACKAGING_FAMILIES.findIndex((f) => f.id === id);
  const prev = PACKAGING_FAMILIES[idx - 1];
  const next = PACKAGING_FAMILIES[idx + 1];
  const involvesPlastic = family.materials.includes("plastic");

  return (
    <div>
      <PageHeader
        eyebrow={FAMILY_GROUPS[family.group].label}
        title={family.name}
        trail={[
          { href: "/directory", label: "Sourcing Directory" },
          { href: "/directory/packaging", label: "Packaging" },
          { label: family.name },
        ]}
      >
        <p>{family.summary}</p>
        <p className="mt-3 flex flex-wrap items-center gap-3">
          <CoverageBadge level={cov.level} />
          <span className="text-[13px] text-teal-200/80">
            {cov.supplierCount} {cov.supplierCount === 1 ? "supplier" : "suppliers"}, {cov.variantCount} {cov.variantCount === 1 ? "variant" : "variants"}
            {" | "}
            {family.materials.map((m) => MATERIAL_LABELS[m]).join(", ")}
          </span>
        </p>
      </PageHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-12">
          <section aria-labelledby="suppliers-h">
            <SectionHeading id="suppliers-h">Suppliers and variants</SectionHeading>

            {cov.level !== "covered" && (
              <div className="mt-4">
                <Callout tone="gap" title={cov.level === "none" ? "No qualified supplier yet" : "A thin part of the catalogue"}>
                  <p>
                    {cov.level === "none"
                      ? "We have not listed a supplier for this format yet. We list a supplier only when we can say what we checked, so this stays empty until then."
                      : `We have ${cov.supplierCount === 1 ? "one supplier" : "two suppliers"} on record for this format, against a goal of ${PILOT_TARGETS.suppliersPerFamily} where possible. Treat these as a starting point and ask for alternatives.`}
                  </p>
                  <p className="mt-2">
                    <a className="text-teal-700 underline underline-offset-2" href={mailto(`Packaging directory: ${family.name}`)}>
                      Suggest a supplier or tell us what you need
                    </a>
                  </p>
                </Callout>
              </div>
            )}

            {rows.length > 0 && (
              <div className="mt-6 space-y-4">
                {rows.map(({ offering, product, supplier }) => (
                  <OfferingCard
                    key={offering.id}
                    product={product}
                    offering={offering}
                    supplierName={supplier.name}
                    supplierHref={`/directory/packaging/suppliers/${supplier.slug}`}
                    verification={verificationSummary(PACKAGING_CATALOGUE, supplier.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="variant-h">
            <SectionHeading id="variant-h">What makes one variant different from another</SectionHeading>
            <p className="mt-2 text-sm text-ink-700">
              A variant is a specific combination of capacity, material, container style and closure. A supplier offering three sizes of one bottle contributes three variants, each with its own MOQ. For this format we record:
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {family.variantAttributes.map((a) => (
                <li key={a} className="rounded-full bg-cream-100 px-3 py-1.5 text-sm text-ink-800">{a}</li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-ink-200 bg-white p-5">
            <h2 className="text-lg text-ink-950" style={{ fontFamily: DISPLAY_FONT }}>TCS checks before recommending</h2>
            <ul className="mt-3 space-y-3">
              {family.checks.map((c) => (
                <li key={c} className="flex gap-2 text-sm text-ink-800">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12px] text-ink-500">Ask these of any supplier, listed here or not.</p>
          </div>
          <Callout title="Compatibility needs your formula"><p>{COMPATIBILITY_NOTE}</p></Callout>
          {involvesPlastic && <Callout title="Plastic packaging and EPR"><p>{EPR_NOTE}</p></Callout>}
        </aside>
      </div>

      <nav aria-label="Other packaging families" className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 flex flex-wrap justify-between gap-3">
        {prev ? (
          <Link href={`/directory/packaging/${prev.id}`} className="inline-flex items-center gap-1.5 text-sm text-teal-700 hover:underline">
            <ArrowLeft size={14} aria-hidden /> {prev.name}
          </Link>
        ) : <span />}
        {next && (
          <Link href={`/directory/packaging/${next.id}`} className="inline-flex items-center gap-1.5 text-sm text-teal-700 hover:underline">
            {next.name} <ArrowRight size={14} aria-hidden />
          </Link>
        )}
      </nav>
    </div>
  );
}
