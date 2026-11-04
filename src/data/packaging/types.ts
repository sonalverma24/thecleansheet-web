/* Types for the BPC sourcing directory (packaging pilot).

   Four interconnected record types, deliberately kept apart so a fixed MOQ is
   never stored on a company profile:

     Supplier         who they are: identity, location, business type, credentials
     PackagingProduct one specific variant: capacity + material + style + closure
     SupplierOffering which supplier sells which variant, at what MOQ, price, terms
     Verification     what evidence was checked, from where, when, scope, limits

   Everything here is data entered by hand and reviewed in git. Nothing may be
   invented: an unknown value is `null` or absent and renders as "to confirm". */

/* ── Taxonomy ─────────────────────────────────────────────── */

export type FamilyGroup = "skincare" | "hair" | "colour" | "fragrance-body" | "secondary";

/** What the founder is packaging. Used to match a founder's product to families. */
export type ProductUseId =
  | "serum" | "face-oil" | "face-cream" | "balm-butter" | "body-lotion" | "sunscreen"
  | "face-wash" | "shampoo" | "hair-oil" | "toner-mist" | "perfume"
  | "lip-balm" | "lip-gloss" | "lipstick" | "mascara" | "deodorant";

export type MaterialGroup = "glass" | "plastic" | "metal" | "paperboard" | "other";

/** What the supplier can do to the stock pack. */
export type BrandingOption =
  | "plain-stock"          // sold as is, unbranded
  | "label-ready"          // surface suits your own label or sticker
  | "printed-decorated"    // screen print, hot stamp, etc. on stock shapes
  | "custom-mould-colour"; // bespoke colour, mould or shape

/* ── Packaging family ─────────────────────────────────────── */

export interface PackagingFamily {
  /** URL slug, e.g. "glass-dropper-bottles". */
  id: string;
  /** Position in the pilot list (1 to 20). */
  order: number;
  name: string;
  group: FamilyGroup;
  /** One or two plain sentences on what this format is. */
  summary: string;
  /** Which products founders typically pack in it. Empty with appliesToAllProducts. */
  uses: ProductUseId[];
  /** Secondary packaging (cartons, labels) fits any product. */
  appliesToAllProducts?: boolean;
  /** Materials this format is commonly supplied in. */
  materials: MaterialGroup[];
  /** The attributes that make two variants of this family different, so the
      people filling the catalogue know what to capture. */
  variantAttributes: string[];
  /** TCS checks before recommending a supplier for this family. */
  checks: string[];
}

/* ── Supplier ─────────────────────────────────────────────── */

export type BusinessType = "manufacturer" | "decorator-converter" | "distributor" | "trader";

export type CredentialKind = "iso-9001" | "iso-22716" | "gmp" | "fssc-22000" | "other";

export interface Credential {
  kind: CredentialKind;
  /** Free text for kind "other", or the issuing body. */
  label?: string;
  /** True only when a TCS reviewer has seen the certificate and checked it. */
  verified: boolean;
  /** Certificate number or reference, when the supplier has shared one. */
  reference?: string;
}

/** EPR information for plastic packaging. We record what the supplier provides
    and what we checked. Obligations differ by entity and exemption, so absence
    of a registration is not by itself a finding. */
export type EprStatus = "registered" | "exempt-claimed" | "not-provided" | "not-applicable";

export interface EprInfo {
  status: EprStatus;
  /** Registration or exemption reference as supplied. */
  reference?: string;
  /** ISO date a reviewer last looked at the evidence. Absent = not checked. */
  checkedOn?: string;
  note?: string;
}

export interface Supplier {
  id: string;
  /** URL slug. */
  slug: string;
  name: string;
  businessType: BusinessType;
  city: string;
  state: string;
  website?: string;
  yearEstablished?: number;
  /** Short factual description in our words. No marketing copy. */
  about?: string;
  credentials: Credential[];
  /** Only set when the supplier has agreed to a public contact. */
  contact?: { email?: string; phone?: string; person?: string };
  epr?: EprInfo;
  /** ISO date the record was first added. */
  listedOn: string;
}

/* ── Packaging product (a variant) ────────────────────────── */

export interface PackagingProduct {
  id: string;
  familyId: string;
  /** e.g. "30 ml airless pump bottle". */
  name: string;
  capacity?: { value: number; unit: "ml" | "g" };
  material: MaterialGroup;
  /** e.g. "PP", "PET", "Type III soda-lime", "Aluminium". */
  materialDetail?: string;
  /** e.g. "Round straight wall", "Boston round". */
  containerStyle: string;
  /** e.g. "Dropper with rubber bulb", "Airless pump with overcap". */
  closure: string;
  shape?: string;
  /** e.g. "18/415", "DIN 18". */
  neckFinish?: string;
  pumpOutputMl?: number;
  childResistant?: boolean;
  tamperEvident?: boolean;
  /** Post-consumer recycled content, 0 to 100. */
  pcrPercent?: number;
  dimensionsMm?: { length: number; width: number; height: number };
}

/* ── Supplier offering ────────────────────────────────────── */

/** What the quoted MOQ actually covers. The question TCS asks first. */
export type MoqScope = "complete-assembly" | "container-only" | "closure-only" | "unconfirmed";

export type StockStatus = "ex-stock" | "made-to-order" | "both" | "unconfirmed";

export type SampleAvailability = "free" | "paid" | "on-request" | "none" | "unconfirmed";

export interface SupplierOffering {
  id: string;
  supplierId: string;
  productId: string;
  /** Minimum order in pieces for stock supply. null = not yet confirmed. */
  moqPieces: number | null;
  moqScope: MoqScope;
  branding: BrandingOption[];
  stock: StockStatus;
  leadTimeDays?: { min: number; max: number };
  samples: SampleAvailability;
  /** Is the exact same component set available for repeat production?
      null = not asked yet. Never default this to true. */
  repeatSupplyConfirmed: boolean | null;
  /** A quote at a stated quantity on a stated date. Prices go stale. */
  price?: {
    perPieceInr: { min: number; max?: number };
    atQuantity: number;
    quotedOn: string;
    gstIncluded: boolean;
  };
  paymentTerms?: string;
  note?: string;
  /** ISO date the commercial terms were last confirmed with the supplier. */
  termsConfirmedOn?: string;
}

/* ── Verification record ──────────────────────────────────── */

export type AssessmentDimensionId =
  | "specifications" | "commercial" | "fulfilment" | "quality" | "client-experience";

export interface AssessmentDimension {
  id: AssessmentDimensionId;
  label: string;
  /** Percentage weight in the internal model. All five sum to 100. */
  weight: number;
  description: string;
}

export type EvidenceType =
  | "material-identification" | "technical-drawing" | "closure-specification"
  | "certificate" | "tolerance-data" | "compatibility-documentation"
  | "price-quote" | "moq-confirmation"
  | "repeat-supply-confirmation" | "lead-time-confirmation"
  | "leak-test-protocol" | "batch-consistency-controls" | "sample-tested"
  | "complaints-procedure" | "client-reference" | "epr-information";

export type EvidenceSource = "supplier-provided" | "public-register" | "tcs-tested" | "client-reported";

export type VerificationOutcome = "confirmed" | "partly-confirmed" | "not-provided" | "contradicted";

export interface VerificationRecord {
  id: string;
  supplierId: string;
  /** Set when the evidence is about one offering rather than the company. */
  offeringId?: string;
  evidence: EvidenceType;
  source: EvidenceSource;
  outcome: VerificationOutcome;
  /** ISO date the evidence was checked. */
  checkedOn: string;
  /** Exactly what was covered, e.g. "30 ml airless bottle and pump, drawing rev C". */
  scope: string;
  /** What this check does NOT show. Required: a check without limits over-claims. */
  limitations: string;
  /** Who at TCS reviewed it. */
  reviewer: string;
  /** ISO date after which the evidence should be re-checked. */
  validUntil?: string;
}

/* ── The whole catalogue ──────────────────────────────────── */

export interface PackagingCatalogue {
  families: PackagingFamily[];
  suppliers: Supplier[];
  products: PackagingProduct[];
  offerings: SupplierOffering[];
  verifications: VerificationRecord[];
}
