import type {
  AssessmentDimensionId, PackagingCatalogue, PackagingFamily, PackagingProduct,
  Supplier, SupplierOffering, VerificationRecord,
} from "@/data/packaging/types";
import { ASSESSMENT_DIMENSIONS, EVIDENCE_TYPES } from "@/data/packaging/assessment";

/* Joins and summaries over the packaging catalogue. Every function takes the
   catalogue as an argument so it can be tested with fixtures; the pages pass
   PACKAGING_CATALOGUE. */

/** Pilot coverage targets. A family with fewer than three suppliers is a gap
    and is shown as one. */
export const PILOT_TARGETS = {
  families: 20,
  variants: 100,
  suppliersMin: 15,
  suppliersMax: 20,
  suppliersPerFamily: 3,
} as const;

export interface OfferingRow {
  offering: SupplierOffering;
  product: PackagingProduct;
  supplier: Supplier;
}

export function joinOfferings(cat: PackagingCatalogue): OfferingRow[] {
  const products = new Map(cat.products.map((p) => [p.id, p]));
  const suppliers = new Map(cat.suppliers.map((s) => [s.id, s]));
  const rows: OfferingRow[] = [];
  for (const offering of cat.offerings) {
    const product = products.get(offering.productId);
    const supplier = suppliers.get(offering.supplierId);
    if (product && supplier) rows.push({ offering, product, supplier });
  }
  return rows;
}

export function rowsForFamily(cat: PackagingCatalogue, familyId: string): OfferingRow[] {
  return joinOfferings(cat).filter((r) => r.product.familyId === familyId);
}

export function rowsForSupplier(cat: PackagingCatalogue, supplierId: string): OfferingRow[] {
  return joinOfferings(cat).filter((r) => r.supplier.id === supplierId);
}

/* ── Coverage ─────────────────────────────────────────────── */

export type CoverageLevel = "none" | "single-source" | "limited" | "covered";

export interface FamilyCoverage {
  level: CoverageLevel;
  supplierCount: number;
  variantCount: number;
}

export function familyCoverage(cat: PackagingCatalogue, familyId: string): FamilyCoverage {
  const rows = rowsForFamily(cat, familyId);
  const supplierCount = new Set(rows.map((r) => r.supplier.id)).size;
  const variantCount = new Set(rows.map((r) => r.product.id)).size;
  const level: CoverageLevel =
    supplierCount === 0 ? "none"
    : supplierCount === 1 ? "single-source"
    : supplierCount < PILOT_TARGETS.suppliersPerFamily ? "limited"
    : "covered";
  return { level, supplierCount, variantCount };
}

export const COVERAGE_LABELS: Record<CoverageLevel, string> = {
  none: "No qualified supplier yet",
  "single-source": "One supplier so far",
  limited: "Two suppliers so far",
  covered: "Three or more suppliers",
};

export interface PilotProgress {
  families: number;
  familiesWithSupplier: number;
  familiesCovered: number;
  variants: number;
  suppliers: number;
}

export function pilotProgress(cat: PackagingCatalogue): PilotProgress {
  const rows = joinOfferings(cat);
  const levels = cat.families.map((f) => familyCoverage(cat, f.id).level);
  return {
    families: cat.families.length,
    familiesWithSupplier: levels.filter((l) => l !== "none").length,
    familiesCovered: levels.filter((l) => l === "covered").length,
    variants: new Set(rows.map((r) => r.product.id)).size,
    suppliers: cat.suppliers.length,
  };
}

/** Pages are only worth indexing once they carry real supplier content. */
export function isFamilyIndexable(cat: PackagingCatalogue, familyId: string): boolean {
  return rowsForFamily(cat, familyId).length > 0;
}

export function familiesOfSupplier(cat: PackagingCatalogue, supplierId: string): PackagingFamily[] {
  const ids = new Set(rowsForSupplier(cat, supplierId).map((r) => r.product.familyId));
  return cat.families.filter((f) => ids.has(f.id));
}

/* ── Verification ─────────────────────────────────────────── */

export interface DimensionEvidence {
  dimension: AssessmentDimensionId;
  label: string;
  weight: number;
  records: VerificationRecord[];
  /** Records whose outcome is confirmed or partly confirmed. */
  supportive: number;
}

/** Evidence on file for a supplier, grouped by assessment dimension. There is
    deliberately no score: public scores stay off until reviewers are calibrated. */
export function evidenceCoverage(cat: PackagingCatalogue, supplierId: string): DimensionEvidence[] {
  const mine = cat.verifications.filter((v) => v.supplierId === supplierId);
  return ASSESSMENT_DIMENSIONS.map((d) => {
    const records = mine.filter((v) => EVIDENCE_TYPES[v.evidence].dimension === d.id);
    return {
      dimension: d.id,
      label: d.label,
      weight: d.weight,
      records,
      supportive: records.filter((v) => v.outcome === "confirmed" || v.outcome === "partly-confirmed").length,
    };
  });
}

export function verificationSummary(cat: PackagingCatalogue, supplierId: string): string {
  const coverage = evidenceCoverage(cat, supplierId);
  const total = coverage.reduce((n, d) => n + d.records.length, 0);
  if (total === 0) return "Listed, not yet verified";
  const areas = coverage.filter((d) => d.records.length > 0).length;
  return `${total} evidence ${total === 1 ? "item" : "items"} checked across ${areas} of ${coverage.length} areas`;
}

/** Does the supplier's own plastic involvement mean the EPR field is relevant? */
export function supplierHandlesPlastic(cat: PackagingCatalogue, supplierId: string): boolean {
  return rowsForSupplier(cat, supplierId).some((r) => r.product.material === "plastic");
}

/* ── Integrity ────────────────────────────────────────────── */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isIsoDate = (s: string) => ISO_DATE.test(s) && !Number.isNaN(new Date(s).getTime());

/** Returns every integrity problem found, or an empty list when the catalogue is
    sound. Run by the test suite so bad data never ships. */
export function validateCatalogue(cat: PackagingCatalogue): string[] {
  const problems: string[] = [];
  const dupes = (label: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) problems.push(`Duplicate ${label} id: ${id}`);
      seen.add(id);
    }
  };

  dupes("family", cat.families.map((f) => f.id));
  dupes("supplier", cat.suppliers.map((s) => s.id));
  dupes("supplier slug", cat.suppliers.map((s) => s.slug));
  dupes("product", cat.products.map((p) => p.id));
  dupes("offering", cat.offerings.map((o) => o.id));
  dupes("verification", cat.verifications.map((v) => v.id));

  const families = new Set(cat.families.map((f) => f.id));
  const suppliers = new Map(cat.suppliers.map((s) => [s.id, s]));
  const products = new Map(cat.products.map((p) => [p.id, p]));
  const offerings = new Map(cat.offerings.map((o) => [o.id, o]));

  for (const f of cat.families) {
    if (!SLUG.test(f.id)) problems.push(`Family ${f.id}: id is not a slug`);
    if (!f.appliesToAllProducts && f.uses.length === 0) problems.push(`Family ${f.id}: has no product uses`);
    if (f.checks.length === 0) problems.push(`Family ${f.id}: has no TCS checks`);
  }

  for (const s of cat.suppliers) {
    if (!SLUG.test(s.slug)) problems.push(`Supplier ${s.id}: slug "${s.slug}" is not a slug`);
    if (!isIsoDate(s.listedOn)) problems.push(`Supplier ${s.id}: listedOn is not an ISO date`);
    if (s.epr?.checkedOn && !isIsoDate(s.epr.checkedOn)) problems.push(`Supplier ${s.id}: epr.checkedOn is not an ISO date`);
    for (const c of s.credentials) {
      if (c.verified && !cat.verifications.some((v) => v.supplierId === s.id && v.evidence === "certificate" && v.outcome === "confirmed")) {
        problems.push(`Supplier ${s.id}: credential ${c.kind} is marked verified without a confirmed certificate record`);
      }
    }
    if (s.epr?.checkedOn && !cat.verifications.some((v) => v.supplierId === s.id && v.evidence === "epr-information")) {
      problems.push(`Supplier ${s.id}: epr.checkedOn is set without an epr-information record`);
    }
  }

  for (const p of cat.products) {
    if (!families.has(p.familyId)) problems.push(`Product ${p.id}: unknown family ${p.familyId}`);
    if (p.pcrPercent !== undefined && (p.pcrPercent < 0 || p.pcrPercent > 100)) problems.push(`Product ${p.id}: pcrPercent out of range`);
    if (p.capacity && !(p.capacity.value > 0)) problems.push(`Product ${p.id}: capacity must be positive`);
  }

  const pairs = new Set<string>();
  for (const o of cat.offerings) {
    if (!suppliers.has(o.supplierId)) problems.push(`Offering ${o.id}: unknown supplier ${o.supplierId}`);
    if (!products.has(o.productId)) problems.push(`Offering ${o.id}: unknown product ${o.productId}`);
    const pair = `${o.supplierId}|${o.productId}`;
    if (pairs.has(pair)) problems.push(`Offering ${o.id}: supplier already offers this product`);
    pairs.add(pair);

    if (o.moqPieces === null && o.moqScope !== "unconfirmed") problems.push(`Offering ${o.id}: no MOQ but a scope is claimed`);
    if (o.moqPieces !== null && o.moqScope === "unconfirmed") problems.push(`Offering ${o.id}: MOQ given without saying what it covers`);
    if (o.moqPieces !== null && !(Number.isInteger(o.moqPieces) && o.moqPieces > 0)) problems.push(`Offering ${o.id}: MOQ must be a positive whole number`);
    if (o.branding.length === 0) problems.push(`Offering ${o.id}: no branding option listed`);
    if (o.price) {
      if (!(o.price.perPieceInr.min > 0)) problems.push(`Offering ${o.id}: price must be positive`);
      if (o.price.perPieceInr.max !== undefined && o.price.perPieceInr.max < o.price.perPieceInr.min) problems.push(`Offering ${o.id}: price max below min`);
      if (!isIsoDate(o.price.quotedOn)) problems.push(`Offering ${o.id}: price needs an ISO quotedOn date`);
    }
    if (o.leadTimeDays && o.leadTimeDays.max < o.leadTimeDays.min) problems.push(`Offering ${o.id}: lead time max below min`);
    if (o.termsConfirmedOn && !isIsoDate(o.termsConfirmedOn)) problems.push(`Offering ${o.id}: termsConfirmedOn is not an ISO date`);
  }

  for (const v of cat.verifications) {
    if (!suppliers.has(v.supplierId)) problems.push(`Verification ${v.id}: unknown supplier ${v.supplierId}`);
    if (v.offeringId) {
      const o = offerings.get(v.offeringId);
      if (!o) problems.push(`Verification ${v.id}: unknown offering ${v.offeringId}`);
      else if (o.supplierId !== v.supplierId) problems.push(`Verification ${v.id}: offering belongs to a different supplier`);
    }
    if (!isIsoDate(v.checkedOn)) problems.push(`Verification ${v.id}: checkedOn is not an ISO date`);
    if (v.validUntil && (!isIsoDate(v.validUntil) || v.validUntil < v.checkedOn)) problems.push(`Verification ${v.id}: validUntil is invalid or before checkedOn`);
    if (!v.scope.trim()) problems.push(`Verification ${v.id}: scope is empty`);
    if (!v.limitations.trim()) problems.push(`Verification ${v.id}: limitations is empty`);
    if (!v.reviewer.trim()) problems.push(`Verification ${v.id}: reviewer is empty`);
  }

  return problems;
}
