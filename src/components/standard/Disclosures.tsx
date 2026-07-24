/* ────────────────────────────────────────────────────────────────
   CENTRAL DISCLOSURES · single source of truth for the honesty lines
   used across the site. Keep the exact wording here so nothing drifts.

   Certification is not operational. The framework is under independent
   expert validation. No badge is issued during this phase.
──────────────────────────────────────────────────────────────── */

export const ACCREDITATION_FULL =
  "The Clean Sheet is an independent private certification scheme being designed in alignment with ISO/IEC 17065 and ISO/IEC 17067. It is not currently accredited.";

export const ACCREDITATION_COMPACT = "Private certification framework. Not currently accredited.";

export const PUBLIC_REVIEW_DISCLOSURE =
  "This review uses publicly available information. Confidential formulation data, manufacturing records and private laboratory reports were not assessed. It is not certification.";

export const FRAMEWORK_DISCLOSURE =
  "This framework describes the proposed requirements for The Clean Sheet certification scheme. The Clean Sheet is a voluntary private certification system. It does not replace legal registration, regulatory approval or professional medical advice.";

/* Factual, neutral. Teal marks official framework information. */
export function AccreditationLine({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <p className={`text-[13px] leading-[1.6] text-[var(--color-warm-gray)] ${className}`}>
      {compact ? ACCREDITATION_COMPACT : ACCREDITATION_FULL}
    </p>
  );
}

/* A limitation, so it leads with a calm coral marker. Never alarmist. */
export function PublicReviewDisclosure({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[13px] leading-[1.6] text-[var(--color-charcoal)]/80 ${className}`}>
      <span style={{ color: "#fd6158" }}>Please note. </span>
      {PUBLIC_REVIEW_DISCLOSURE}
    </p>
  );
}
