/* The Standards & Compliance pillar, reduced to the four items the owner named:
     - Label compliance
     - Regulatory screen
     - ASCI screen
     - Claims screen
   Today that pillar holds eleven checks, nine of which ask a brand for documents it rarely publishes
   (stability, GMP, batch records, SPF test reports, ...). This builds the four items from data every
   review already carries, as the same CheckResult-shaped records the other pillars use, so they can be
   graded by src/lib/pillar-grade.ts. PREVIEW LOGIC: nothing here is wired into a page or a verdict.

   Mapping, and why:
     Label compliance   the existing analysis-engine check (usage warnings and directions clear on the label).
     Regulatory screen  the 10-authority screen the scorecard shows. A banned ingredient is a hard adverse;
                        any other authority that does not read as clear is a soft adverse; with no ingredient
                        list the screen could not run, which is "not disclosed", never "clear".
     ASCI screen        claims carrying an ASCI advertising-code concern (absolute language, unsupported
                        superlatives). Soft adverse: an advertising-code concern, not a safety problem.
     Claims screen      the India drug-cosmetic boundary and claims the product's own ingredient list contradicts.
                        A contradicted or fairness claim is a hard adverse (the same hard flags that already make
                        a product Not Recommended); drug-boundary treatment wording is a soft adverse. */

import type { CheckLike } from "@/lib/pillar-grade";

export const COMPLIANCE_PILLAR = "Standards & Compliance" as const;
export const COMPLIANCE_ITEMS = ["Label compliance", "Regulatory screen", "ASCI screen", "Claims screen"] as const;

export interface ComplianceInput {
  /** ingredientTransparency.usageWarningsClear, which the existing label-compliance check reads. */
  usageWarningsClear: boolean;
  hasInci: boolean;
  /** Ingredients prohibited in cosmetics found in the list. */
  bannedCount: number;
  /** The 10-authority screen as the scorecard displays it, or null when there is none. */
  globalScreen: Record<string, string | undefined> | null;
  /** Claims with an ASCI concern that were not shown to be fabricated (corroborated !== false). */
  asciConcernClaims: number;
  claimsAnalysed: number;
  /** "hard": a contradicted or fairness claim. "boundary": drug-cosmetic boundary wording only. */
  claimsOutcome: "none" | "boundary" | "hard";
}

/** Mirrors the scorecard's own test (ProductScorecardView regClear) so the count matches what visitors see. */
export function isRegulatoryClear(v: string | undefined): boolean {
  const t = (v ?? "").toLowerCase().trim();
  return t === "" || /^no\b/.test(t) || t.includes("no obvious") || t.includes("not triggered");
}

export function regulatoryFlagged(screen: Record<string, string | undefined> | null): number {
  if (!screen) return 0;
  return Object.values(screen).filter((v) => !isRegulatoryClear(v)).length;
}

export function complianceChecks(i: ComplianceInput): CheckLike[] {
  const mk = (label: string, state: CheckLike["state"], hard = false): CheckLike => ({
    pillar: COMPLIANCE_PILLAR, label, state, obtainability: "public", ...(hard ? { hard: true } : {}),
  });

  const label = mk("Label compliance", i.usageWarningsClear ? "verified" : "not-disclosed");

  const flagged = regulatoryFlagged(i.globalScreen);
  const regulatory =
    i.bannedCount > 0 ? mk("Regulatory screen", "adverse", true)
    : !i.hasInci || !i.globalScreen ? mk("Regulatory screen", "not-disclosed")
    : flagged > 0 ? mk("Regulatory screen", "adverse")
    : mk("Regulatory screen", "verified");

  const asci = i.claimsAnalysed === 0 ? mk("ASCI screen", "not-applicable")
    : i.asciConcernClaims > 0 ? mk("ASCI screen", "adverse")
    : mk("ASCI screen", "verified");

  const claims = i.claimsAnalysed === 0 ? mk("Claims screen", "not-applicable")
    : i.claimsOutcome === "hard" ? mk("Claims screen", "adverse", true)
    : i.claimsOutcome === "boundary" ? mk("Claims screen", "adverse")
    : mk("Claims screen", "verified");

  return [label, regulatory, asci, claims];
}
