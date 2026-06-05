/**
 * The Clean Sheet - Controlled Taxonomy Schema
 *
 * TypeScript types for the taxonomy system.
 * All filters, badges, product cards, comparison tables, and admin inputs
 * must use this controlled taxonomy. No free-text taxonomy creation is allowed.
 */

// ── Taxonomy families ─────────────────────────────────────────────────────────

export type TaxonomyFamily =
  | "product_category"
  | "product_type"
  | "active_ingredient"
  | "concern"
  | "suitability"
  | "caution"
  | "certification_status"
  | "evidence_status"
  | "prism_module"
  | "skin_type"
  | "hair_type"
  | "format"
  | "price_segment"
  | "availability_source";

export type TaxonomyStatus = "active" | "draft" | "deprecated";

// ── Taxonomy item ─────────────────────────────────────────────────────────────

export interface TaxonomyItem {
  /** Stable, unique identifier. Prefix convention: cat_ pt_ ai_ cn_ su_ caut_ cs_ ev_ prism_ */
  id: string;
  family: TaxonomyFamily;
  /** For product types: parent category ID. For active ingredient groups: group ID. Otherwise null. */
  parent_id: string | null;
  /** Human-readable display label shown in UI. */
  label: string;
  /** URL-safe slug derived from label. */
  slug: string;
  /** Alternate terms that map to this item for search purposes. */
  synonyms: string[];
  /** Brief description shown in admin or tooltip contexts. */
  description: string;
  /** Controls order within family for filter and admin display. */
  display_order: number;
  /** Whether this item appears as a filter option in the Scorecards search. */
  is_filterable: boolean;
  /** Whether this item is indexed in the full-text search synonym map. */
  is_searchable: boolean;
  /** Whether this item is shown on public-facing product cards and pages. */
  is_public: boolean;
  /** If true, only shown in admin views, never in consumer-facing UI. */
  is_admin_only: boolean;
  status: TaxonomyStatus;
}

// ── Product-taxonomy mapping ──────────────────────────────────────────────────

export type TaxonomyRelationshipType =
  | "primary_category"
  | "primary_product_type"
  | "active_ingredient"
  | "concern"
  | "suitability"
  | "caution"
  | "certification_status"
  | "evidence_status"
  | "prism_module"
  | "skin_type"
  | "hair_type"
  | "format"
  | "price_segment"
  | "availability_source";

export type TaxonomySource = "manual" | "auto" | "inference";

export interface ProductTaxonomyMap {
  id: string;
  product_id: string;
  taxonomy_item_id: string;
  relationship_type: TaxonomyRelationshipType;
  /** How this mapping was created. */
  source: TaxonomySource;
  /** 0-100. Manual = 100, auto-matched = varies, inference = lower. */
  confidence: number;
  /** True for the single primary_category and primary_product_type per product. */
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// ── Admin operations ──────────────────────────────────────────────────────────

export type AdminAction =
  | "approve"
  | "reject"
  | "deprecate"
  | "merge"
  | "add_synonym"
  | "reorder"
  | "toggle_public";

export interface TaxonomyAdminEvent {
  action: AdminAction;
  taxonomy_item_id: string;
  metadata?: Record<string, unknown>;
  performed_by: string;
  performed_at: string;
}

// ── Validation ────────────────────────────────────────────────────────────────

export interface ProductValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  dataLimitedReasons: string[];
}

export type ValidationSeverity = "error" | "warning" | "data_limited";

export interface ValidationRule {
  id: string;
  description: string;
  severity: ValidationSeverity;
  check: (product: Record<string, unknown>) => boolean;
}
