import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { COVERAGE_LABELS, type CoverageLevel } from "@/lib/packaging-catalogue";

/* Small shared pieces for the sourcing directory pages. */

/** Headings use Cooper BT with a sans fallback, never a serif. */
export const DISPLAY_FONT = "'Cooper BT', sans-serif";

const CONTACT_EMAIL = "hello@thecleansheet.in";

export function mailto(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export function Breadcrumbs({ trail }: { trail: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-[12px] text-teal-200/70">
        {trail.map((t, i) => (
          <li key={t.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={12} aria-hidden />}
            {t.href ? <Link href={t.href} className="hover:text-white underline-offset-2 hover:underline">{t.label}</Link> : <span aria-current="page" className="text-white">{t.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  eyebrow, title, children, trail,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  trail?: { href?: string; label: string }[];
}) {
  return (
    <header className="bg-ink-950 pt-10 pb-12 sm:pt-14 sm:pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {trail && <Breadcrumbs trail={trail} />}
        <p className="inline-block rounded-full bg-yellow-500 px-3 py-1 text-[11px] font-medium uppercase text-ink-950" style={{ letterSpacing: "0.12em" }}>
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl sm:text-5xl text-white" style={{ fontFamily: DISPLAY_FONT, color: "#fff" }}>
          {title}
        </h1>
        {children && <div className="mt-4 max-w-2xl text-base leading-relaxed text-teal-200/80">{children}</div>}
      </div>
    </header>
  );
}

const COVERAGE_STYLES: Record<CoverageLevel, string> = {
  none: "bg-coral-50 text-coral-800 border-coral-200",
  "single-source": "bg-caution-100 text-ink-900 border-caution-500/40",
  limited: "bg-caution-100 text-ink-900 border-caution-500/40",
  covered: "bg-safe-100 text-ink-900 border-safe-500/40",
};

/** Gaps are shown openly: "No qualified supplier yet" is a feature, not a flaw. */
export function CoverageBadge({ level }: { level: CoverageLevel }) {
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${COVERAGE_STYLES[level]}`}>
      {COVERAGE_LABELS[level]}
    </span>
  );
}

export function Callout({ title, children, tone = "neutral" }: { title: string; children: ReactNode; tone?: "neutral" | "gap" }) {
  const styles = tone === "gap" ? "border-coral-200 bg-coral-50" : "border-teal-100 bg-teal-50";
  return (
    <aside className={`rounded-2xl border p-5 ${styles}`}>
      <h2 className="text-base text-ink-950" style={{ fontFamily: DISPLAY_FONT }}>{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-ink-800">{children}</div>
    </aside>
  );
}

export function SectionHeading({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="text-2xl text-ink-950" style={{ fontFamily: DISPLAY_FONT }}>
      {children}
    </h2>
  );
}

/** The point that matters most when someone reads a container's spec sheet. */
export const COMPATIBILITY_NOTE =
  "A manufacturer saying a container is suitable for cosmetics does not show it is compatible with every formulation. Final suitability needs testing with your own formula, the complete component system and your expected storage and use conditions.";

export const EPR_NOTE =
  "Plastic packaging carries EPR obligations in India, but they vary by entity and by exemption. We record the EPR information a supplier provides and what we checked. We do not assume every small supplier has the same registration requirements.";
