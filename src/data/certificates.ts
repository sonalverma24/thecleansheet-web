/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET · CERTIFIED PRODUCT REGISTRY
   The registry lists only certified products. Each one has a public
   proof page with the 16 fields below.

   One outcome: Certified. Always shown with its exact scope and
   limits. No public Gold/Silver tiers, no 0-100 score.

   No real product is certified yet, so the single entry here is a
   clearly labelled example that shows what a live proof page looks like.
──────────────────────────────────────────────────────────────── */

export type CertStatus = "Certified" | "Suspended" | "Withdrawn" | "Expired";

export type VerifiedClaim = { claim: string; basis: string; claimId?: string };
export type CertTest = { method: string; lab: string; labType: string; date: string; result: string };
export type SurveillanceEvent = { date: string; note: string };

export type Certificate = {
  isExample: boolean;
  // 1. Product and brand
  productName: string;
  brand: string;
  // 2. Responsible legal entity
  legalEntity: string;
  // 3. Category, SKU and variant
  category: string;
  sku: string;
  variant: string;
  // 4. Certificate number
  certificateNo: string;
  // 5. Certified standard version
  standardVersion: string;
  // 6. Formula and package version
  formulaVersion: string;
  packageVersion: string;
  // 7. Declared market scope
  markets: string[];
  // 8. Product and population modules assessed
  modules: string[];
  // 9. Verified claims (nothing outside this list is covered)
  verifiedClaims: VerifiedClaim[];
  // 10. Tests: method, lab type, date, result
  tests: CertTest[];
  // 11. Manufacturing review status
  manufacturingStatus: string;
  // 12. Consumer directions and limitations
  directions: string;
  limitations: string;
  // 13. Issue and expiry dates
  issueDate: string;
  expiryDate: string;
  // 14. Current status
  status: CertStatus;
  // 15. Change and surveillance history
  surveillance: SurveillanceEvent[];
  // 16. Complaint / safety reporting link
  reportLink: string;
};

export const CERTIFICATES: Certificate[] = [
  {
    isExample: true,
    productName: "Fluid Sunscreen SPF 50+ PA++++",
    brand: "Example Brand",
    legalEntity: "Example Brand Pvt. Ltd., India",
    category: "Sunscreen (leave-on, SPF)",
    sku: "EX-SUN-50",
    variant: "50 ml fluid",
    certificateNo: "TCS-IN-2026-000142",
    standardVersion: "The Clean Sheet Standard, 2026 edition",
    formulaVersion: "F-2026.03",
    packageVersion: "PKG-2026.01",
    markets: ["India"],
    modules: ["Core gates (C01 to C20)", "P01 Sunscreen and SPF", "Leave-on overlay"],
    verifiedClaims: [
      { claim: "SPF 50+", basis: "In-vivo SPF test on the finished product (ISO 24444:2019), accredited lab, March 2026.", claimId: "CL25" },
      { claim: "PA++++ (UVA protection)", basis: "In-vivo persistent pigment darkening (ISO 24442:2022).", claimId: "CL25" },
      { claim: "Water-resistant (80 minutes)", basis: "Pre and post-immersion SPF (ISO 16217:2020 and ISO 18861:2020).", claimId: "CL25" },
      { claim: "Fragrance-free", basis: "Full formula and supplier review confirmed no added perfume or masking fragrance.", claimId: "CL10" },
    ],
    tests: [
      { method: "SPF, in vivo (ISO 24444:2019)", lab: "Accredited testing laboratory", labType: "ISO/IEC 17025 accredited, in scope", date: "March 2026", result: "Pass" },
      { method: "UVA PPD, in vivo (ISO 24442:2022)", lab: "Accredited testing laboratory", labType: "ISO/IEC 17025 accredited, in scope", date: "March 2026", result: "Pass" },
      { method: "Preservative efficacy (ISO 11930:2019)", lab: "Accredited testing laboratory", labType: "ISO/IEC 17025 accredited, in scope", date: "February 2026", result: "Pass" },
      { method: "Microbial limits (ISO 17516:2014)", lab: "Accredited testing laboratory", labType: "ISO/IEC 17025 accredited, in scope", date: "February 2026", result: "Pass" },
    ],
    manufacturingStatus: "GMP evidence reviewed against ISO 22716:2007. Batch release records, in-process controls and stability data are on file.",
    directions: "Apply generously 15 minutes before sun exposure. Reapply every two hours, and after swimming or towelling.",
    limitations: "Certified for sale in India only. Covers the SKU, formula version and package version shown above. It does not guarantee that no individual will experience irritation or an allergic reaction.",
    issueDate: "1 June 2026",
    expiryDate: "1 June 2027",
    status: "Certified",
    surveillance: [
      { date: "1 June 2026", note: "Certificate issued after independent technical review." },
    ],
    reportLink: "mailto:standards@thecleansheet.in?subject=Safety%20concern%20-%20TCS-IN-2026-000142",
  },
];

export function getCertificate(id: string): Certificate | undefined {
  return CERTIFICATES.find((c) => c.certificateNo.toLowerCase() === id.toLowerCase());
}

/* The 16 things every proof page publishes. Used on the registry index. */
export const PROOF_FIELDS: string[] = [
  "Product and brand name",
  "The company legally responsible for the product",
  "Category, SKU and variant",
  "Certificate number",
  "The standard version it was certified against",
  "Formula and package version",
  "Which markets it is certified for",
  "The product and population modules assessed",
  "The claims we verified (and a note that nothing else is covered)",
  "Test methods, lab type, test date and result",
  "Manufacturing review status",
  "How to use it, and the limits of the certificate",
  "Issue date and expiry date",
  "Current status: Certified, Suspended, Withdrawn or Expired",
  "Any changes and surveillance since it was issued",
  "A link to report a safety concern",
];
