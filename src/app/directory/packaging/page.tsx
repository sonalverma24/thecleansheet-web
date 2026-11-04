import type { Metadata } from "next";
import Link from "next/link";
import { PACKAGING_CATALOGUE } from "@/data/packaging";
import { FAMILY_GROUPS, PACKAGING_FAMILIES, getFamilyById } from "@/data/packaging/families";
import type { FamilyGroup } from "@/data/packaging/types";
import { PILOT_TARGETS, familyCoverage, pilotProgress } from "@/lib/packaging-catalogue";
import { selfCanonical } from "@/lib/seo";
import ShortlistBuilder from "@/components/directory/ShortlistBuilder";
import {
  COMPATIBILITY_NOTE, Callout, CoverageBadge, DISPLAY_FONT, EPR_NOTE, PageHeader, SectionHeading,
} from "@/components/directory/ui";

export const metadata: Metadata = {
  title: "Packaging Suppliers for Beauty Brands in India",
  description:
    "Twenty packaging families for skincare, hair, colour and fragrance brands, from glass dropper bottles to waterproof labels. Filter by product, quantity, material and branding.",
  alternates: selfCanonical("/directory/packaging"),
  openGraph: {
    title: "Packaging Suppliers for Beauty Brands in India | The Clean Sheet™",
    description: "Find packaging by what you are making and how many you need per SKU.",
    url: "https://thecleansheet.in/directory/packaging",
    type: "website",
  },
};

const GROUP_ORDER: FamilyGroup[] = ["skincare", "hair", "colour", "fragrance-body", "secondary"];

/* Illustrative profile. Built from the airless family's own checks so the
   example cannot drift from the real list. It is not a supplier. */
function IllustrativeProfile() {
  const checks = getFamilyById("airless-serum-pumps")?.checks.slice(0, 4) ?? [];
  const rows: [string, string][] = [
    ["Capacity", "30 ml"],
    ["Container material", "Supplier specified"],
    ["Dispensing", "Airless pump"],
    ["MOQ for stock", "Supplier specific"],
    ["Custom branding", "Confirm separately"],
    ["Formula compatibility", "Not assessed"],
  ];
  return (
    <section aria-labelledby="profile-h">
      <SectionHeading id="profile-h">What a variant profile looks like</SectionHeading>
      <div className="mt-5 grid gap-6 rounded-3xl border border-ink-200 p-5 sm:p-8 md:grid-cols-2">
        <div>
          <p className="text-[11px] font-medium uppercase text-teal-700" style={{ letterSpacing: "0.12em" }}>Proposed profile format</p>
          <h3 className="mt-1 text-xl text-ink-950" style={{ fontFamily: DISPLAY_FONT }}>30 ml airless pump bottle</h3>
          <p className="text-sm text-ink-600">Skincare | Serums | Moisturisers</p>
          <dl className="mt-4 divide-y divide-ink-100">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2 text-sm">
                <dt className="text-ink-600">{k}</dt>
                <dd className="text-right text-ink-950">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase text-teal-700" style={{ letterSpacing: "0.12em" }}>TCS checks before recommending</p>
          <ul className="mt-3 space-y-2">
            {checks.map((c) => (
              <li key={c} className="flex gap-2 text-sm text-ink-800">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[12px] text-ink-500">Illustrative template. No supplier has been independently assessed for this example.</p>
        </div>
      </div>
    </section>
  );
}

export default function PackagingDirectoryPage() {
  const progress = pilotProgress(PACKAGING_CATALOGUE);

  return (
    <div>
      <PageHeader
        eyebrow="Packaging · Pilot"
        title="Packaging suppliers for beauty brands"
        trail={[{ href: "/directory", label: "Sourcing Directory" }, { label: "Packaging" }]}
      >
        <p>
          {progress.families} packaging families, with at least {PILOT_TARGETS.suppliersPerFamily} supplier options for each where possible. Where we have fewer, we say so.
        </p>
      </PageHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-14">
        <ShortlistBuilder catalogue={PACKAGING_CATALOGUE} />

        <section aria-labelledby="families-h">
          <SectionHeading id="families-h">All {PACKAGING_FAMILIES.length} packaging families</SectionHeading>
          <p className="mt-2 text-sm text-ink-700">
            {progress.familiesWithSupplier} of {progress.families} have at least one supplier on record. Pick a format to see its variants, suppliers and what to check.
          </p>

          <div className="mt-8 space-y-10">
            {GROUP_ORDER.map((g) => (
              <div key={g}>
                <h3 className="text-lg text-ink-950" style={{ fontFamily: DISPLAY_FONT }}>{FAMILY_GROUPS[g].label}</h3>
                <p className="text-sm text-ink-600">{FAMILY_GROUPS[g].blurb}</p>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {PACKAGING_FAMILIES.filter((f) => f.group === g).map((f) => {
                    const cov = familyCoverage(PACKAGING_CATALOGUE, f.id);
                    return (
                      <li key={f.id}>
                        <Link
                          href={`/directory/packaging/${f.id}`}
                          className="flex h-full flex-col rounded-2xl border border-ink-200 bg-white p-4 transition-colors hover:border-teal-600"
                        >
                          <span className="text-base text-ink-950" style={{ fontFamily: DISPLAY_FONT }}>{f.name}</span>
                          <span className="mt-1 flex-1 text-[13px] text-ink-700">{f.summary}</span>
                          <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <CoverageBadge level={cov.level} />
                            {cov.variantCount > 0 && <span className="text-[12px] text-ink-600">{cov.variantCount} {cov.variantCount === 1 ? "variant" : "variants"}</span>}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <IllustrativeProfile />

        <div className="grid gap-4 md:grid-cols-2">
          <Callout title="Compatibility needs your formula">
            <p>{COMPATIBILITY_NOTE}</p>
          </Callout>
          <Callout title="Plastic packaging and EPR">
            <p>{EPR_NOTE}</p>
            <p className="mt-2">
              <a className="text-teal-700 underline underline-offset-2" href="https://eprplastic.cpcb.gov.in" target="_blank" rel="noopener noreferrer">
                CPCB plastic packaging EPR portal
              </a>
            </p>
          </Callout>
        </div>
      </div>
    </div>
  );
}
