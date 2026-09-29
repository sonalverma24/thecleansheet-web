import type { Metadata } from "next";
import { SUNSCREEN_EVIDENCE_RECORDS } from "@/data/sunscreens";
import { SunscreenTile } from "@/components/sunscreens/SunscreenTile";

export const metadata: Metadata = {
  title: "Sunscreen Evidence Records · India's Public SPF Audit",
  description:
    "Every claim on an Indian sunscreen, checked against what is actually public: lab certificates, batch numbers, formula history and consumer reports. No scores, just documented evidence and the gaps that remain.",
  keywords: [
    "sunscreen SPF proof India", "is my sunscreen SPF real", "sunscreen evidence record",
    "SPF test report India", "Minimalist sunscreen SPF test", "sunscreen claims audit",
  ],
  alternates: { canonical: "https://thecleansheet.in/sunscreens" },
  openGraph: {
    title: "Sunscreen Evidence Records | The Clean Sheet™",
    description: "Every SPF, PA and broad-spectrum claim checked against public lab documents, batch numbers and formula history.",
    url: "https://thecleansheet.in/sunscreens",
    type: "website",
  },
};

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Sunscreen Evidence Records, The Clean Sheet™",
  description: "A public register auditing sunscreen SPF, PA and broad-spectrum claims against documented evidence.",
  url: "https://thecleansheet.in/sunscreens",
  publisher: { "@type": "Organization", name: "The Clean Sheet", url: "https://thecleansheet.in" },
};

export default function SunscreensPage() {
  return (
    <div className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />

      <section className="border-b border-ink-100 px-5 pt-14 pb-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-teal-600 text-[10px] tracking-[0.2em] uppercase mb-3 font-medium">
            Public Evidence Registry
          </p>
          <h1
            className="font-display text-ink-950 tracking-tight leading-[1.05] mb-4"
            style={{ fontSize: "clamp(2.1rem, 5vw, 3.2rem)" }}
          >
            Sunscreen evidence records
          </h1>
          <p className="text-ink-600 text-base leading-relaxed max-w-2xl">
            SPF, PA and broad spectrum are the claims most worth checking and hardest for a shopper to verify.
            Each record below audits one sunscreen against what is actually public: lab certificates, batch
            numbers, formula history and consumer reports, with the gaps stated plainly. Desk research from
            public sources only. This is not certification.
          </p>
        </div>
      </section>

      <section className="px-5 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SUNSCREEN_EVIDENCE_RECORDS.map((record) => (
              <SunscreenTile key={record.slug} record={record} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
