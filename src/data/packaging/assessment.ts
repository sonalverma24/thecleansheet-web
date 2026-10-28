import type { AssessmentDimension, AssessmentDimensionId, EvidenceSource, EvidenceType, VerificationOutcome } from "./types";

/* TCS Packaging Supplier Assessment: the internal evaluation model for the pilot.
   Separate from TCCS certification and from any product level packaging
   compatibility review. The weights are for internal calibration only. */
export const ASSESSMENT_DIMENSIONS: AssessmentDimension[] = [
  {
    id: "specifications",
    label: "Product specifications and technical documentation",
    weight: 25,
    description: "Material identification, drawings, closure specifications and tolerances.",
  },
  {
    id: "commercial",
    label: "MOQ, pricing and commercial transparency",
    weight: 20,
    description: "A stated MOQ with its scope, dated prices and clear terms.",
  },
  {
    id: "fulfilment",
    label: "Order fulfilment and repeat supply reliability",
    weight: 20,
    description: "Lead times, and whether the same components are available for the next batch.",
  },
  {
    id: "quality",
    label: "Quality controls and available test evidence",
    weight: 20,
    description: "Certificates, leak test protocols, batch consistency controls and samples.",
  },
  {
    id: "client-experience",
    label: "Verified client experience and issue resolution",
    weight: 15,
    description: "References from real buyers and a working complaints procedure.",
  },
];

/* Public scores stay off until verified records exist and reviewers have been
   tested for reaching comparable conclusions. The site shows evidence coverage
   instead of a number. */
export const PUBLIC_SCORES_ENABLED = false;

export const EVIDENCE_TYPES: Record<EvidenceType, { label: string; dimension: AssessmentDimensionId }> = {
  "material-identification": { label: "Material identification", dimension: "specifications" },
  "technical-drawing": { label: "Technical drawing", dimension: "specifications" },
  "closure-specification": { label: "Closure specification", dimension: "specifications" },
  "tolerance-data": { label: "Tolerance information", dimension: "specifications" },
  "compatibility-documentation": { label: "Compatibility documentation", dimension: "specifications" },
  "price-quote": { label: "Dated price quote", dimension: "commercial" },
  "moq-confirmation": { label: "MOQ and its scope confirmed", dimension: "commercial" },
  "repeat-supply-confirmation": { label: "Repeat supply confirmed", dimension: "fulfilment" },
  "lead-time-confirmation": { label: "Lead time confirmed", dimension: "fulfilment" },
  certificate: { label: "Certificate", dimension: "quality" },
  "leak-test-protocol": { label: "Leak test protocol", dimension: "quality" },
  "batch-consistency-controls": { label: "Batch consistency controls", dimension: "quality" },
  "sample-tested": { label: "Sample checked", dimension: "quality" },
  "epr-information": { label: "EPR information", dimension: "quality" },
  "complaints-procedure": { label: "Complaints procedure", dimension: "client-experience" },
  "client-reference": { label: "Client reference", dimension: "client-experience" },
};

export const EVIDENCE_SOURCE_LABELS: Record<EvidenceSource, string> = {
  "supplier-provided": "Provided by the supplier",
  "public-register": "Public register",
  "tcs-tested": "Checked by TCS",
  "client-reported": "Reported by a client",
};

export const OUTCOME_LABELS: Record<VerificationOutcome, string> = {
  confirmed: "Confirmed",
  "partly-confirmed": "Partly confirmed",
  "not-provided": "Not provided",
  contradicted: "Contradicted",
};
