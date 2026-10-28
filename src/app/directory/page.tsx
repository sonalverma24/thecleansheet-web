import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PACKAGING_CATALOGUE } from "@/data/packaging";
import { ASSESSMENT_DIMENSIONS } from "@/data/packaging/assessment";
import { PILOT_TARGETS, pilotProgress } from "@/lib/packaging-catalogue";
import { selfCanonical } from "@/lib/seo";
import { COMPATIBILITY_NOTE, Callout, DISPLAY_FONT, PageHeader, SectionHeading, mailto } from "@/components/directory/ui";

export const metadata: Metadata = {
  title: "Sourcing Directory for Indian Beauty Founders",
  description:
    "A sourcing directory for beauty and personal care founders in India. Packaging suppliers, with the exact variant, the supplier's terms and the evidence we checked kept apart.",
  alternates: selfCanonical("/directory"),
  openGraph: {
    title: "Sourcing Directory for Indian Beauty Founders | The Clean Sheet™",
    description: "Find packaging suppliers by what you are making and how many you need.",
    url: "https://thecleansheet.in/directory",
    type: "website",
  },
};

const RECORDS = [
  { name: "Supplier", body: "Who the company is: identity, location, business type, credentials and contacts." },
  { name: "Packaging product", body: "One specific variant: its capacity, material, container style and closure." },
  { name: "Supplier offering", body: "Which supplier sells which variant, at what MOQ, price and terms, and what that MOQ covers." },
  { name: "Verification record", body: "What evidence we checked, where it came from, when, what it covers and what it does not." },
];

export default function DirectoryPage() {
  const progress = pilotProgress(PACKAGING_CATALOGUE);

  return (
    <div>
      <PageHeader eyebrow="Sourcing Directory · Pilot" title="The yellow pages for Indian beauty founders">
        <p>
          Find suppliers by what you are making and how many you need. We list a supplier only when we can say what we checked, and we mark the gaps openly.
        </p>
      </PageHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-14">
        {/* Live directory */}
        <section aria-labelledby="live-h">
          <SectionHeading id="live-h">Live now</SectionHeading>
          <Link
            href="/directory/packaging"
            className="mt-5 block rounded-3xl border border-ink-200 bg-white p-6 sm:p-8 transition-colors hover:border-teal-600"
          >
            <p className="text-[11px] font-medium uppercase text-teal-700" style={{ letterSpacing: "0.12em" }}>Pilot directory</p>
            <h3 className="mt-2 text-2xl text-ink-950" style={{ fontFamily: DISPLAY_FONT }}>Packaging</h3>
            <p className="mt-2 max-w-xl text-sm text-ink-700">
              Twenty packaging families, from glass dropper bottles to waterproof labels. For each, at least three supplier options where possible, and a clear note where there are fewer.
            </p>
            <dl className="mt-6 grid grid-cols-3 gap-4 max-w-xl">
              <div>
                <dt className="text-[11px] uppercase text-ink-500" style={{ letterSpacing: "0.08em" }}>Families</dt>
                <dd className="mt-0.5 text-2xl text-ink-950" style={{ fontFamily: DISPLAY_FONT }}>{progress.families}</dd>
                <dd className="text-[12px] text-ink-600">{progress.familiesWithSupplier} with a supplier</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase text-ink-500" style={{ letterSpacing: "0.08em" }}>Variants</dt>
                <dd className="mt-0.5 text-2xl text-ink-950" style={{ fontFamily: DISPLAY_FONT }}>{progress.variants}</dd>
                <dd className="text-[12px] text-ink-600">target {PILOT_TARGETS.variants}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase text-ink-500" style={{ letterSpacing: "0.08em" }}>Suppliers</dt>
                <dd className="mt-0.5 text-2xl text-ink-950" style={{ fontFamily: DISPLAY_FONT }}>{progress.suppliers}</dd>
                <dd className="text-[12px] text-ink-600">target {PILOT_TARGETS.suppliersMin} to {PILOT_TARGETS.suppliersMax}</dd>
              </div>
            </dl>
            <p className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-teal-700">
              Open the packaging directory <ArrowRight size={14} aria-hidden />
            </p>
          </Link>
        </section>

        {/* Four record types */}
        <section aria-labelledby="records-h">
          <SectionHeading id="records-h">How a listing is built</SectionHeading>
          <p className="mt-2 max-w-2xl text-sm text-ink-700">
            Four kinds of record, kept separate. A company profile never carries one fixed MOQ, because the MOQ depends on which variant you want and what the quote covers.
          </p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {RECORDS.map((r, i) => (
              <li key={r.name} className="rounded-2xl bg-cream-100 p-5">
                <p className="text-[11px] font-medium text-teal-700" style={{ letterSpacing: "0.12em" }}>0{i + 1}</p>
                <h3 className="mt-1 text-lg text-ink-950" style={{ fontFamily: DISPLAY_FONT }}>{r.name}</h3>
                <p className="mt-1 text-sm text-ink-700">{r.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* What we look at */}
        <section aria-labelledby="assess-h">
          <SectionHeading id="assess-h">What we look at</SectionHeading>
          <p className="mt-2 max-w-2xl text-sm text-ink-700">
            The TCS Packaging Supplier Assessment is separate from TCCS certification and from any product level packaging compatibility review. Each supplier page shows the evidence on file against these five areas. We do not publish scores until the records are verified and our reviewers reach comparable conclusions.
          </p>
          <ul className="mt-6 space-y-3">
            {ASSESSMENT_DIMENSIONS.map((d) => (
              <li key={d.id} className="rounded-2xl border border-ink-100 p-4">
                <p className="text-sm font-medium text-ink-950">{d.label}</p>
                <p className="mt-0.5 text-sm text-ink-700">{d.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <Callout title="Suitable for cosmetics is not the same as compatible with your formula">
          <p>{COMPATIBILITY_NOTE}</p>
        </Callout>

        {/* Contact */}
        <section aria-labelledby="join-h" className="rounded-3xl bg-ink-950 p-6 sm:p-8">
          <h2 id="join-h" className="text-2xl text-white" style={{ fontFamily: DISPLAY_FONT, color: "#fff" }}>Supply packaging, or need something we do not list?</h2>
          <p className="mt-2 max-w-xl text-sm text-teal-200/80">
            Suppliers: tell us what you make and we will tell you what evidence we would ask for. Founders: tell us the format you are stuck on and we will prioritise it.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={mailto("Sourcing Directory: list my company")} className="rounded-full bg-yellow-500 px-5 py-2.5 text-sm font-medium text-ink-950 hover:bg-yellow-400">
              List my company
            </a>
            <a href={mailto("Sourcing Directory: request a format")} className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10">
              Request a format
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
