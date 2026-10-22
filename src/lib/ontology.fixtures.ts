/* TEST FIXTURE ONLY. A copy of the shipped ontology in which every declared-definitive
   entry is given VALID-FORMAT provenance (a verified CAS number, a panel reference, a past
   date), so the definitive path can be exercised.

   It asserts nothing about chemistry and refers to no real reviewer. The shipped ontology has
   no reviewed entry; real aliases become definitive only when a qualified reviewer fills in
   real provenance. Never import this outside tests. */

import { DEFAULT_ONTOLOGY, type Ontology } from "@/lib/claim-ontology";

export const FIXTURE_PROVENANCE = {
  source: "CAS 64-17-5",
  reviewRef: "TCS-P-900",
  reviewedAt: "2026-01-15",
} as const;

export const reviewedForTest: Ontology = {
  classes: DEFAULT_ONTOLOGY.classes.map((c) => ({
    ...c,
    entries: c.entries.map((e) => (e.strength === "definitive" ? { ...e, ...FIXTURE_PROVENANCE } : e)),
  })),
};
