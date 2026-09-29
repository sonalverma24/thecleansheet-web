import type { SunscreenEvidenceRecord } from "./types";
import { minimalistMultiVitaminSpf50 } from "./minimalist-multi-vitamin-spf-50";

export const SUNSCREEN_EVIDENCE_RECORDS: SunscreenEvidenceRecord[] = [
  minimalistMultiVitaminSpf50,
];

export function getSunscreenBySlug(slug: string): SunscreenEvidenceRecord | undefined {
  return SUNSCREEN_EVIDENCE_RECORDS.find((r) => r.slug === slug);
}

export function getAllSunscreenSlugs(): string[] {
  return SUNSCREEN_EVIDENCE_RECORDS.map((r) => r.slug);
}

export type { SunscreenEvidenceRecord } from "./types";
