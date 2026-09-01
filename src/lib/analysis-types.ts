/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Category-driven analysis layer (types)
   The deterministic audit that sits on top of a ProductReview:
   a category, a checklist scoped to that category, and TWO axes -
   Safety & Compliance and Proof & Transparency - plus a coverage
   meter. "Not disclosed" is never "zero": it lowers proof, not safety.
──────────────────────────────────────────────────────────────── */

/** The five audit pillars (from the Clean Sheet check framework). */
export type AuditPillar =
  | "Ingredient Safety & Toxicity"
  | "Irritation & Allergen Risk"
  | "Ingredient Transparency"
  | "Standards & Compliance"
  | "Sustainability & Ethics";

/** The state of a single check. The whole design turns on keeping these
    apart - collapsing "not-disclosed" into a failing zero is the bug we are
    engineering away. */
export type CheckState =
  | "verified"       // evidence found and it supports the product (a pass)
  | "disclosed"      // brand discloses / claims it, not independently confirmed
  | "not-disclosed"  // applies, but no public evidence found (neutral on safety)
  | "not-applicable" // does not apply to this category (excluded from denominators)
  | "adverse";       // a real, confirmed problem (the only state that hurts safety)

/** Which axis a check informs. */
export type CheckAxis = "safety" | "proof";

/** How obtainable this check's data realistically is from public sources -
    used to explain WHY so much of a real audit is "not disclosed". */
export type Obtainability =
  | "public"        // derivable from INCI + public reference data (we can decide it)
  | "brand"         // only if the brand publishes it (a test report, a certificate)
  | "private";      // essentially never public (CoA, GMP cert, LCA, batch records)

export interface CheckResult {
  id: string;
  pillar: AuditPillar;
  subCategory: string;
  label: string;
  axis: CheckAxis;
  obtainability: Obtainability;
  state: CheckState;
  /** One plain sentence: what we found / why this state. */
  detail: string;
  /** Where the finding came from, when there is a concrete source. */
  source?: string;
}

export interface AnalysisReport {
  category: string;        // canonical category, e.g. "Skin · Facial Moisturizer"
  categoryId: string;      // stable id from the taxonomy
  checks: CheckResult[];
  /** The headline problems (adverse states), surfaced for the top of the page. */
  redFlags: CheckResult[];
  methodologyVersion: string;
}
