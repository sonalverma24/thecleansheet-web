import type {
  BrandingOption, BusinessType, CredentialKind, EprStatus, MoqScope, SampleAvailability, StockStatus,
} from "./types";

/* Display labels for the packaging catalogue enums. */

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  manufacturer: "Manufacturer",
  "decorator-converter": "Decorator or converter",
  distributor: "Distributor",
  trader: "Trader",
};

export const BRANDING_LABELS: Record<BrandingOption, string> = {
  "plain-stock": "Plain stock",
  "label-ready": "Stock with your own label",
  "printed-decorated": "Printed or decorated stock",
  "custom-mould-colour": "Custom colour or mould",
};

export const MOQ_SCOPE_LABELS: Record<MoqScope, string> = {
  "complete-assembly": "complete assembly",
  "container-only": "container only",
  "closure-only": "closure only",
  unconfirmed: "scope to confirm",
};

export const STOCK_LABELS: Record<StockStatus, string> = {
  "ex-stock": "Ex-stock",
  "made-to-order": "Made to order",
  both: "Ex-stock or made to order",
  unconfirmed: "To confirm",
};

export const SAMPLE_LABELS: Record<SampleAvailability, string> = {
  free: "Free samples",
  paid: "Paid samples",
  "on-request": "Samples on request",
  none: "No samples",
  unconfirmed: "To confirm",
};

export const CREDENTIAL_LABELS: Record<CredentialKind, string> = {
  "iso-9001": "ISO 9001",
  "iso-22716": "ISO 22716",
  gmp: "GMP",
  "fssc-22000": "FSSC 22000",
  other: "Other",
};

export const EPR_LABELS: Record<EprStatus, string> = {
  registered: "Registration provided",
  "exempt-claimed": "Exemption claimed",
  "not-provided": "Not provided",
  "not-applicable": "Not applicable",
};
