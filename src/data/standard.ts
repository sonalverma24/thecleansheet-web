/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET · PRODUCT STANDARDS FRAMEWORK 2026
   Public data source for the Standards Centre.

   Derived from: The_Clean_Sheet_Product_Standards_Framework_2026.xlsx
   (2026 edition). This file holds ONLY the
   public-facing content: objective requirements, accepted evidence,
   and decision principles. Confidential thresholds, internal risk
   scores and raw evidence packages are NOT stored here.

   Decision model: GATES, not scores. Every applicable legal, safety,
   quality and material-claim gate must pass. No score compensates
   for a failed gate.
──────────────────────────────────────────────────────────────── */

export const FRAMEWORK = {
  name: "The Clean Sheet Standard",
  edition: "2026",
  updated: "2026",
  banner:
    "The Clean Sheet is a voluntary private certification scheme for beauty and personal care. It is not currently accredited, and it does not replace regulatory approval, legal compliance obligations or professional medical advice.",
  counts: { gates: 20, productModules: 10, claimModules: 30, standards: 47, markets: 7 },
} as const;

/* The regulations, safety science and ISO standards the certification standard
   applies. This is the public "built on global standards" list. */
export const GLOBAL_STANDARDS: { group: string; items: string[] }[] = [
  { group: "Regulation", items: ["EU Cosmetics Regulation 1223/2009", "India Cosmetics Rules 2020", "US MoCRA 2022", "UK Cosmetics Regulation", "Canada Cosmetic Regulations"] },
  { group: "Safety science", items: ["SCCS Notes of Guidance", "IFRA Standards", "OECD Test Guidelines"] },
  { group: "Manufacturing & quality", items: ["ISO 22716 (GMP)", "ISO 11930 (preservation)", "ISO 17516 (microbiology)", "ISO/TR 18811 (stability)"] },
  { group: "Testing", items: ["ISO 24444 (SPF)", "ISO 24443 (UVA)", "ISO 16128 (natural & organic)"] },
  { group: "Toxicology", items: ["ECHA SVHC list", "IARC classifications"] },
  { group: "Conformity & governance", items: ["ISO/IEC 17065", "ISO/IEC 17067", "ISO/IEC 17025"] },
];

/* What certification is, and is not. A trust asset, not fine print. */
export const WHAT_WE_CERTIFY = [
  "That one specific product, a named SKU and variant, meets a published standard written for that kind of product.",
  "In the markets the brand declares, against the law and evidence rules of each of those markets.",
  "Based on the confidential dossier: quantitative formula, safety assessment, test reports, manufacturing records and claims evidence.",
  "With an independent certification decision, and a live public proof page listing exactly what was verified.",
];

export const WHAT_IT_DOES_NOT_MEAN = [
  "It is not a guarantee that no individual will ever experience irritation or an allergic reaction.",
  "It is not regulatory approval, and never substitutes for legal registration or notification.",
  "It does not cover products, variants or claims outside the certified scope.",
  "It is not a blanket “safe” or “clean” verdict. It only covers the specific things listed on the proof page.",
];

/* The modular system: how every certification is assembled. */
export const SYSTEM_STACK = [
  { n: "01", label: "Twenty mandatory core gates", body: "Applied to every product, in every category and market." },
  { n: "02", label: "The applicable product module", body: "Sunscreen, leave-on, rinse-off, hair, colour and other category rules." },
  { n: "03", label: "Population & format overlays", body: "Baby and child, eye, lip, intimate, aerosol, powder. Added on top based on how the product is used." },
  { n: "04", label: "Relevant claim modules", body: "Exact evidence rules for every voluntary marketing claim made." },
  { n: "05", label: "Declared market requirements", body: "India first, then EU, US, Australia, Canada, UK and ASEAN as declared." },
  { n: "06", label: "Optional environmental verification", body: "The Sustainability Evidence Code, applied only to claims actually made." },
];

/* ── The 20 core gates, grouped into five plain-language families ── */

export type Gate = {
  id: string;
  title: string;
  gateType: "Legal" | "Safety" | "Quality" | "Claims" | "Governance";
  whatChecked: string;
  appliesWhen: string;
  minEvidence: string;
  decisionPrinciple: string;
  publicProof: string;
  reference: string;
};

export type GateFamily = { key: string; title: string; blurb: string; gates: Gate[] };

export const GATE_FAMILIES: GateFamily[] = [
  {
    key: "legal",
    title: "Legal status & market classification",
    blurb: "Is the product lawfully what it says it is, in every market it is sold?",
    gates: [
      {
        id: "C01", title: "Product & market classification", gateType: "Legal",
        whatChecked: "That the product sits in the right legal category (cosmetic, drug, therapeutic good, medical device, biocide, food or AYUSH) and holds every registration or licence it needs.",
        appliesWhen: "All products and every declared market.",
        minEvidence: "A classification memo covering the relevant product boundaries, plus registrations and licences.",
        decisionPrinciple: "Correct classification and all required permissions must be in place before review. The Clean Sheet never substitutes for regulatory approval.",
        publicProof: "Market and scope shown on the certificate.",
        reference: "India Cosmetics Rules 2020 plus each target-market rule.",
      },
      {
        id: "C02", title: "Complete formula & ingredient legality", gateType: "Legal",
        whatChecked: "That every ingredient, impurity and intended use is legal in each declared market.",
        appliesWhen: "All products.",
        minEvidence: "Qualitative and quantitative formula, INCI, functions, grade, supplier, specifications, and restricted-substance / positive-list checks.",
        decisionPrinciple: "Every ingredient, impurity and intended use complies in each declared market.",
        publicProof: "Full INCI, and active percentages where legally required.",
        reference: "Target-market annexes and schedules; live regulatory register.",
      },
    ],
  },
  {
    key: "safety",
    title: "Formula & finished-product safety",
    blurb: "Is the finished product safe for the people who will actually use it?",
    gates: [
      {
        id: "C03", title: "Finished-product safety assessment", gateType: "Safety",
        whatChecked: "A signed safety assessment of the finished product, covering exposure, toxicology, effects on skin, impurities, ingredient interactions, who uses it and likely misuse.",
        appliesWhen: "All products.",
        minEvidence: "Assessment by a competent cosmetic safety assessor.",
        decisionPrinciple: "The assessor concludes the product is safe for intended and reasonably foreseeable use. Open data gaps are closed, or the product is not certified.",
        publicProof: "Assessor role and review date.",
        reference: "SCCS Notes of Guidance, current revision.",
      },
      {
        id: "C04", title: "Impurity & contaminant control", gateType: "Safety",
        whatChecked: "That impurities and contaminants are identified and controlled by real risk, not a blanket rule.",
        appliesWhen: "All products.",
        minEvidence: "A risk-ranked analyte list by raw material, process, package and geography; validated methods; batch or periodic results.",
        decisionPrinciple: "Limits are substance-specific and exposure-based. There is no universal 0.01% threshold.",
        publicProof: "Test families and result status.",
        reference: "Risk-based toxicological limits and applicable law.",
      },
      {
        id: "C09", title: "Microbiological quality", gateType: "Safety",
        whatChecked: "That microbial limits and specified organisms are within acceptable limits.",
        appliesWhen: "All products unless justified as low-risk.",
        minEvidence: "Microbial limits and specified organisms selected by risk, product area and population.",
        decisionPrinciple: "Meets applicable limits and absence criteria.",
        publicProof: "Microbiology pass status.",
        reference: "ISO 17516:2014 and related methods (replacement edition tracked).",
      },
      {
        id: "C10", title: "Preservation effectiveness", gateType: "Safety",
        whatChecked: "That the product resists microbial contamination in its actual package and use.",
        appliesWhen: "Water-containing or contamination-susceptible products.",
        minEvidence: "A preservative efficacy test on the final package, or a documented low-microbiological-risk assessment.",
        decisionPrinciple: "Passes the chosen acceptance criteria, or has a robust low-risk justification. Jars and high-contact formats receive extra scrutiny.",
        publicProof: "PET or low-risk route stated.",
        reference: "ISO 11930:2019 + Amd 1:2022; ISO 29621:2017.",
      },
      {
        id: "C11", title: "Local tolerance strategy", gateType: "Safety",
        whatChecked: "That skin, eye and related tolerance is addressed proportionally to exposure and uncertainty.",
        appliesWhen: "All products, proportional to exposure and uncertainty.",
        minEvidence: "A weight of evidence from ingredients, formula, validated non-animal methods, and ethically reviewed human compatibility where justified.",
        decisionPrinciple: "The method must match the endpoint, formulation domain and decision context. Medical-device ISO 10993 methods are not default cosmetic methods.",
        publicProof: "Methods and population summary.",
        reference: "OECD TG 439, 442C/D/E, 492/492B, 432/498 where applicable.",
      },
      {
        id: "C15", title: "Population & exposure overlay", gateType: "Safety",
        whatChecked: "That safety is assessed for the specific population marketed to.",
        appliesWhen: "Products for babies, children, pregnancy, sensitive skin, intimate area, lips, eyes or damaged skin.",
        minEvidence: "Age- and use-specific exposure: anatomy, frequency, body area, ingestion, inhalation, occlusion and misuse.",
        decisionPrinciple: "The safety conclusion covers the marketed population. No arbitrary universal 10× margin is used.",
        publicProof: "Population scope stated precisely.",
        reference: "SCCS current guidance and applicable law.",
      },
      {
        id: "C16", title: "Nanomaterial & particle assessment", gateType: "Safety",
        whatChecked: "That nanoforms and inhalable particles are identified, permitted and safety-assessed.",
        appliesWhen: "Nanoforms, inhalable particles, pigments and powders.",
        minEvidence: "Identity, size distribution, coating, solubility, agglomeration, exposure route and legal status.",
        decisionPrinciple: "The exact form and route are legally permitted and assessed. Spray and powder inhalation are assessed separately from dermal use.",
        publicProof: "Nano or particle scope disclosed where required.",
        reference: "Applicable cosmetic annexes and inhalation assessment.",
      },
    ],
  },
  {
    key: "quality",
    title: "Manufacturing quality & traceability",
    blurb: "Was it made properly, and can each batch be traced?",
    gates: [
      {
        id: "C05", title: "Cosmetic GMP", gateType: "Quality",
        whatChecked: "That the manufacturing site operates a functioning Good Manufacturing Practice system.",
        appliesWhen: "All manufacturers and critical contract sites.",
        minEvidence: "Current GMP evidence, site audit, deviations and CAPA, sanitation, personnel, storage and transport controls.",
        decisionPrinciple: "The GMP system operates effectively. ISO 22716 does not prove product sustainability.",
        publicProof: "Manufacturing sites and audit window.",
        reference: "ISO 22716:2007 and applicable law.",
      },
      {
        id: "C06", title: "Batch identity & release", gateType: "Quality",
        whatChecked: "That every commercial batch is traceable and meets its specifications.",
        appliesWhen: "All products.",
        minEvidence: "Master formula, batch record, raw-material traceability, in-process controls, finished specifications, COA and release authority.",
        decisionPrinciple: "Each commercial batch is traceable and meets justified specifications.",
        publicProof: "Lot traceability available by QR or support request.",
        reference: "ISO 22716:2007.",
      },
      {
        id: "C07", title: "Stability programme", gateType: "Quality",
        whatChecked: "That shelf life and period-after-opening are supported by real data.",
        appliesWhen: "All products.",
        minEvidence: "A protocol reflecting formulation, package, climate, shipping and in-use conditions, with physical, chemical, microbiological and functional endpoints.",
        decisionPrinciple: "Shelf life and PAO are supported. ISO/TR 18811 does not prescribe one universal protocol.",
        publicProof: "Shelf life and storage statement.",
        reference: "ISO/TR 18811:2018 as guidance.",
      },
      {
        id: "C08", title: "Packaging compatibility", gateType: "Quality",
        whatChecked: "That the package protects the formula through shelf life and use without unsafe interaction.",
        appliesWhen: "All products.",
        minEvidence: "Container-closure integrity, migration/sorption risk, pump and valve performance, dose delivery, light and oxygen protection, transport testing.",
        decisionPrinciple: "The package protects the formula through shelf life and use without unsafe interaction.",
        publicProof: "Package type and recyclability claim scope.",
        reference: "Risk-based protocol; applicable packaging law.",
      },
      {
        id: "C14", title: "Label & consumer information", gateType: "Quality",
        whatChecked: "That all mandatory label information is present, legible and accurate.",
        appliesWhen: "All products.",
        minEvidence: "Artwork review for identity, net contents, INCI, warnings, batch, dates, responsible entity, use and market-specific statements.",
        decisionPrinciple: "All mandatory information is legible, accurate and consistent with the dossier.",
        publicProof: "Label version and languages.",
        reference: "ISO 22715:2006 plus applicable law.",
      },
      {
        id: "C17", title: "Supplier & change control", gateType: "Quality",
        whatChecked: "That changes to formula, supplier, process, package, claim, population or market trigger review.",
        appliesWhen: "All products.",
        minEvidence: "Approved supplier list, specifications, change-notification agreements, equivalence criteria and revalidation triggers.",
        decisionPrinciple: "Any real change triggers a fresh review. Certification is not carried over automatically.",
        publicProof: "Certificate version links to the formula and package version.",
        reference: "ISO 22716:2007.",
      },
    ],
  },
  {
    key: "claims",
    title: "Claims & consumer information",
    blurb: "Does every claim, on every channel, match the evidence?",
    gates: [
      {
        id: "C12", title: "Claim-to-evidence matrix", gateType: "Claims",
        whatChecked: "That every material claim is truthful, relevant, understandable and supported at finished-product level.",
        appliesWhen: "Every label, website, marketplace, advertisement and influencer claim.",
        minEvidence: "Exact wording, implied meaning, endpoint, method, population, comparator, statistics, limitations and evidence owner.",
        decisionPrinciple: "Each material claim is truthful and supported at finished-product level where the claim is about the product. Unsupported claims are corrected or removed before certification.",
        publicProof: "Verified claims listed; unverified claims removed.",
        reference: "EU 655/2013; India Rule 36; ASCI and consumer law.",
      },
      {
        id: "C13", title: "Digital & physical label parity", gateType: "Claims",
        whatChecked: "That no channel makes a stronger or different claim than the reviewed dossier.",
        appliesWhen: "All products.",
        minEvidence: "Approved artwork and current copies of website, marketplaces, social scripts and seller listings.",
        decisionPrinciple: "No channel makes a stronger or different claim than the reviewed dossier.",
        publicProof: "Current approved claim set.",
        reference: "India Rule 36 and target-market advertising law.",
      },
    ],
  },
  {
    key: "governance",
    title: "Evidence provenance & certification governance",
    blurb: "Is the evidence sound, and the decision independent and maintained?",
    gates: [
      {
        id: "C18", title: "Post-market surveillance", gateType: "Governance",
        whatChecked: "That an active system catches complaints and adverse events after certification.",
        appliesWhen: "All certified products.",
        minEvidence: "Complaint coding, adverse-event triage, trend limits, serious-event escalation, CAPA, recall and regulator-reporting procedures.",
        decisionPrinciple: "The system is active and trends are reviewed. Serious risks can suspend certification immediately.",
        publicProof: "Certificate status and material safety notices.",
        reference: "India and target-market reporting duties; MoCRA where applicable.",
      },
      {
        id: "C19", title: "Evidence provenance & laboratory competence", gateType: "Governance",
        whatChecked: "That critical tests come from competent laboratories within their accredited scope.",
        appliesWhen: "External and internal tests.",
        minEvidence: "Full reports, raw-data availability, method validation/verification, deviations, sample traceability, conflicts and laboratory scope.",
        decisionPrinciple: "Critical tests use competent laboratories within scope. Brand summaries alone are insufficient.",
        publicProof: "Laboratory type and accreditation status stated accurately.",
        reference: "ISO/IEC 17025:2017 for laboratory competence.",
      },
      {
        id: "C20", title: "Certification decision & surveillance", gateType: "Governance",
        whatChecked: "That an independent decision is made, scoped, time-limited and kept under surveillance.",
        appliesWhen: "All applicants and certified products.",
        minEvidence: "Independent technical review, decision record, certificate scope, expiry, surveillance, complaints, appeals, suspension and withdrawal controls.",
        decisionPrinciple: "All applicable gates pass. Weighted points cannot compensate for a failed legal, safety, quality or material-claim gate.",
        publicProof: "Public registry with SKU, scope, status and validity.",
        reference: "ISO/IEC 17065:2012 and ISO/IEC 17067:2013.",
      },
    ],
  },
];

/* ── Product modules ── */
export type ProductModule = {
  id: string; name: string; examples: string; risk: string;
  rollout: "Launch scope" | "Phase 2" | "Future"; status: string;
};

export const PRODUCT_MODULES: ProductModule[] = [
  { id: "P01", name: "Sunscreen & SPF products", examples: "Primary sunscreen, SPF moisturiser, tinted sunscreen, lip SPF, stick, spray", risk: "Highest", rollout: "Launch scope", status: "Active" },
  { id: "P02", name: "Leave-on skincare", examples: "Serum, moisturiser, toner, mask, facial oil, eye cream, body lotion", risk: "High", rollout: "Launch scope", status: "Active" },
  { id: "P03", name: "Rinse-off skin & body", examples: "Face cleanser, body wash, scrub, rinse-off mask, hand wash", risk: "Medium", rollout: "Launch scope", status: "Active" },
  { id: "P04", name: "Baby & child", examples: "Baby lotion, wash, shampoo, diaper cream, powder, child sunscreen", risk: "Highest", rollout: "Launch scope", status: "Active" },
  { id: "P05", name: "Hair & scalp", examples: "Shampoo, conditioner, hair oil, serum, mask, scalp treatment, colour, smoothing", risk: "High", rollout: "Launch scope", status: "Active" },
  { id: "P06", name: "Colour cosmetics", examples: "Foundation, lipstick, balm, mascara, kajal, eye shadow, blush, powder", risk: "High", rollout: "Launch scope", status: "Active" },
  { id: "P07", name: "Deodorant, antiperspirant & aerosol", examples: "Roll-on, stick, cream, aerosol deodorant, antiperspirant", risk: "High", rollout: "Phase 2", status: "Coming later" },
  { id: "P08", name: "Intimate external-use products", examples: "External wash, wipe, deodorising product", risk: "Highest", rollout: "Phase 2", status: "Coming later" },
  { id: "P09", name: "Nail products", examples: "Polish, remover, gel, adhesive, treatment", risk: "Highest", rollout: "Future", status: "Coming later" },
  { id: "P10", name: "Oral care", examples: "Toothpaste, mouthwash, whitening", risk: "Highest", rollout: "Future", status: "Coming later" },
];

/* ── Public Claims Library ──
   The claim as consumers understand it controls the evidence burden.
   Ingredient presence alone rarely proves a finished-product benefit. */

export type Claim = {
  id: string;
  claim: string;
  group: string;
  communicates: string;      // what the claim tells a consumer
  minEvidence: string;       // minimum acceptable evidence
  finishedProduct: "Yes" | "No" | "Depends" | "Prohibited"; // finished-product evidence required?
  doesNotQualify: string;    // evidence that does not qualify
  acceptableWording: string; // acceptable qualified wording
  published: string;         // what The Clean Sheet publishes if verified
};

export const CLAIM_GROUPS = [
  "Efficacy & performance",
  "Testing & oversight",
  "Safety & population",
  "Composition & free-from",
  "Disease boundary",
  "Origin & ethics",
  "Environmental",
] as const;

export const CLAIMS: Claim[] = [
  {
    id: "CL01", claim: "Clinically proven", group: "Efficacy & performance",
    communicates: "That a measured human study demonstrated the stated result.",
    minEvidence: "A controlled finished-product clinical study with a pre-specified endpoint, population, comparator and statistics.",
    finishedProduct: "Yes",
    doesNotQualify: "Ingredient-category literature; consumer-perception surveys.",
    acceptableWording: "“Clinically shown to [exact endpoint] in [population] over [duration].”",
    published: "The endpoint, population and duration tested.",
  },
  {
    id: "CL06", claim: "Non-comedogenic", group: "Efficacy & performance",
    communicates: "That the product is unlikely to clog pores or trigger breakouts.",
    minEvidence: "A controlled finished-product human-use study with defined lesion grading.",
    finishedProduct: "Yes",
    doesNotQualify: "An ingredient database check or comedogenicity index.",
    acceptableWording: "“Non-comedogenic in a [n]-participant study over [duration].”",
    published: "Tested population and duration.",
  },
  {
    id: "CL14", claim: "Hydrates for X hours", group: "Efficacy & performance",
    communicates: "That measured hydration lasts for the stated duration.",
    minEvidence: "Corneometry or a suitable clinical instrumental study through the claimed duration.",
    finishedProduct: "Yes",
    doesNotQualify: "A single timepoint, or humectant presence in the formula.",
    acceptableWording: "“[X]-hour hydration measured by corneometry in [n] participants.”",
    published: "The duration, method and result.",
  },
  {
    id: "CL15", claim: "Repairs / strengthens skin barrier", group: "Efficacy & performance",
    communicates: "That the product improves the skin's barrier function.",
    minEvidence: "TEWL plus suitable corroborating clinical or biomarker endpoints.",
    finishedProduct: "Yes",
    doesNotQualify: "Ingredient theory alone; wording implying treatment of disease.",
    acceptableWording: "“Supports the skin barrier (measured by reduced TEWL over [duration]).”",
    published: "The barrier endpoint and wording verified.",
  },
  {
    id: "CL16", claim: "Reduces wrinkles or pigmentation", group: "Efficacy & performance",
    communicates: "A visible reduction in wrinkles or pigmentation.",
    minEvidence: "Validated imaging or clinical grading with predefined analysis and appropriate duration.",
    finishedProduct: "Yes",
    doesNotQualify: "Before/after photos without controls; drug-level wording.",
    acceptableWording: "“Appearance of [wrinkles/pigmentation] reduced in [n] over [duration].”",
    published: "The appearance endpoint measured.",
  },
  {
    id: "CL18", claim: "Blue-light / HEV / infrared protection", group: "Efficacy & performance",
    communicates: "That the product protects against blue light, HEV or infrared.",
    minEvidence: "Wavelength-relevant spectral data plus a product-relevant biological or clinical endpoint.",
    finishedProduct: "Yes",
    doesNotQualify: "UV-visible absorbance alone.",
    acceptableWording: "“Shown to reduce [specific effect] from [wavelength band].”",
    published: "The spectral range and biological endpoint.",
  },
  {
    id: "CL19", claim: "Anti-pollution", group: "Efficacy & performance",
    communicates: "That the product defends skin against pollution.",
    minEvidence: "A defined pollutant, mechanism and endpoint via a controlled deposition, cleansing, barrier or biomarker study.",
    finishedProduct: "Yes",
    doesNotQualify: "A generic urban-dust cell assay used for every benefit.",
    acceptableWording: "“Helps remove / protect against [defined pollutant] (measured by [endpoint]).”",
    published: "The pollutant, mechanism and endpoint.",
  },
  {
    id: "CL20", claim: "Microbiome-friendly", group: "Efficacy & performance",
    communicates: "That the product supports the skin microbiome.",
    minEvidence: "A defined taxa or functional endpoint with sampling method, controls and clinical relevance.",
    finishedProduct: "Yes",
    doesNotQualify: "pH or preservative choice alone.",
    acceptableWording: "“Shown not to disrupt [defined microbiome measure] over [duration].”",
    published: "The microbiome endpoint measured.",
  },
  {
    id: "CL25", claim: "Waterproof / water-resistant", group: "Efficacy & performance",
    communicates: "That performance survives water exposure for a stated time.",
    minEvidence: "A product-specific accepted test and the legally allowed wording for the category.",
    finishedProduct: "Yes",
    doesNotQualify: "Wording (“waterproof”) not permitted in the market; untested durations.",
    acceptableWording: "“Water-resistant ([40/80] minutes)” per the applicable method.",
    published: "The tested duration and method.",
  },
  {
    id: "CL02", claim: "Dermatologist tested", group: "Testing & oversight",
    communicates: "That a dermatologist was involved in testing the product.",
    minEvidence: "A statement of what the dermatologist actually did: the protocol, the people tested, the product version, and any reactions.",
    finishedProduct: "Yes",
    doesNotQualify: "A single private recommendation; implied endorsement or superior efficacy.",
    acceptableWording: "“Dermatologist tested: [what was done] in [n] over [duration].”",
    published: "What was tested, by whom, and the outcome.",
  },
  {
    id: "CL03", claim: "Ophthalmologist tested", group: "Testing & oversight",
    communicates: "That an eye-area study was conducted under ophthalmic oversight.",
    minEvidence: "Defined ophthalmic oversight and a product-use protocol.",
    finishedProduct: "Yes",
    doesNotQualify: "Any implication of no irritation or contact-lens compatibility on its own.",
    acceptableWording: "“Ophthalmologist tested for [defined use].”",
    published: "The eye-area study scope.",
  },
  {
    id: "CL04", claim: "Hypoallergenic", group: "Safety & population",
    communicates: "That the product is formulated to reduce the potential for allergy.",
    minEvidence: "A formula-wide allergen and sensitisation review, plus suitable product evidence and complaint history.",
    finishedProduct: "Yes",
    doesNotQualify: "Anything implying “allergy-free” or zero risk.",
    acceptableWording: "“Formulated to minimise known allergens; not a guarantee against reactions.”",
    published: "The population reviewed and the limitation.",
  },
  {
    id: "CL05", claim: "Sensitive skin", group: "Safety & population",
    communicates: "That the product is suitable for sensitive skin.",
    minEvidence: "A study in a defined sensitive-skin population plus a formula safety review.",
    finishedProduct: "Yes",
    doesNotQualify: "A generic patch test or a fragrance-free formula alone.",
    acceptableWording: "“Suitable for sensitive skin (tested in [n] with self-reported sensitive skin).”",
    published: "The sensitive-skin population tested.",
  },
  {
    id: "CL07", claim: "Tear-free", group: "Safety & population",
    communicates: "That the product will not sting the eyes in normal use.",
    minEvidence: "An ocular hazard assessment plus ethically reviewed finished-product use evidence suited to the age group.",
    finishedProduct: "Yes",
    doesNotQualify: "pH alone, or a single laboratory assay.",
    acceptableWording: "“Tear-free, assessed for [age group] in normal use.”",
    published: "The ocular assessment and population.",
  },
  {
    id: "CL08", claim: "Pregnancy safe", group: "Safety & population",
    communicates: "That the product has been reviewed for use during pregnancy.",
    minEvidence: "A formula-wide exposure and reproductive-safety assessment by competent experts, with precise use conditions.",
    finishedProduct: "Yes",
    doesNotQualify: "A single in-vitro teratogenicity test; any absolute guarantee.",
    acceptableWording: "“Reviewed for use during pregnancy under [defined conditions].” (Prefer this over “pregnancy safe”.)",
    published: "The reproductive-safety review and its scope.",
  },
  {
    id: "CL09", claim: "Baby safe / pediatrician approved", group: "Safety & population",
    communicates: "That the product is suitable for a defined infant or child age group.",
    minEvidence: "An age-specific safety assessment and a defined reviewer or study role.",
    finishedProduct: "Yes",
    doesNotQualify: "A universal-safety promise; unspecified age ranges.",
    acceptableWording: "“Assessed for [age group]; use as directed.”",
    published: "The assessed age group and reviewer role.",
  },
  {
    id: "CL10", claim: "Fragrance-free", group: "Composition & free-from",
    communicates: "That no perfume or masking fragrance was added.",
    minEvidence: "Documentary evidence of no intentionally added perfume or masking fragrance, with supplier review and a clear policy on aromatic extracts.",
    finishedProduct: "Depends",
    doesNotQualify: "Equating fragrance-free with hypoallergenic.",
    acceptableWording: "“Fragrance-free: no added perfume or masking fragrance.”",
    published: "The definition applied.",
  },
  {
    id: "CL11", claim: "Unscented", group: "Composition & free-from",
    communicates: "That the product has no perceptible scent.",
    minEvidence: "Finished-product sensory evidence and a formula review.",
    finishedProduct: "Yes",
    doesNotQualify: "Presenting “unscented” as identical to fragrance-free (it may contain masking ingredients).",
    acceptableWording: "“Unscented (may contain masking ingredients).”",
    published: "The sensory basis.",
  },
  {
    id: "CL12", claim: "Free-from [ingredient]", group: "Composition & free-from",
    communicates: "That a specific ingredient is not present.",
    minEvidence: "Full formula and supplier documentation; a validated assay only when contamination or carry-over risk warrants it.",
    finishedProduct: "Depends",
    doesNotQualify: "Highlighting the absence of a legally prohibited or irrelevant ingredient, or implying alternatives are automatically safer.",
    acceptableWording: "“Made without [ingredient]”, as long as the ingredient matters and is genuinely not in the product.",
    published: "The verified absence and its relevance.",
  },
  {
    id: "CL13", claim: "Chemical-free / toxin-free", group: "Composition & free-from",
    communicates: "Implies the product contains no chemicals or “toxins”.",
    minEvidence: "Not scientifically supportable as written.",
    finishedProduct: "Prohibited",
    doesNotQualify: "No evidence can support it. The wording itself is rejected: every cosmetic is made of chemicals, and “toxin” means nothing without a dose.",
    acceptableWording: "Replace with a specific, substantiated claim (e.g. “made without [named substance]”).",
    published: "Nothing. The claim is not certified.",
  },
  {
    id: "CL17", claim: "Anti-acne / treats dandruff", group: "Disease boundary",
    communicates: "That the product treats or prevents a skin condition.",
    minEvidence: "Market classification and the regulatory evidence required for a drug/therapeutic claim.",
    finishedProduct: "Yes",
    doesNotQualify: "Cosmetic-only evidence for a disease claim.",
    acceptableWording: "Cosmetic appearance wording only, unless the product uses the correct drug/therapeutic pathway.",
    published: "The classification and permitted wording.",
  },
  {
    id: "CL22", claim: "Natural / organic", group: "Origin & ethics",
    communicates: "That the product is natural or organic.",
    minEvidence: "ISO 16128 may support a content calculation; certification and claim rules are reviewed separately.",
    finishedProduct: "No",
    doesNotQualify: "ISO 16128 on its own. It does not cover claims, safety, the environment, fair trade, packaging or regulation.",
    acceptableWording: "“[X]% natural origin (ISO 16128)”, or a recognised organic certification.",
    published: "The natural-origin figure or certification.",
  },
  {
    id: "CL23", claim: "Vegan", group: "Origin & ethics",
    communicates: "That the product contains no animal-derived inputs.",
    minEvidence: "Formula, processing aids, raw materials and supplier-chain evidence.",
    finishedProduct: "No",
    doesNotQualify: "A vegan claim used to imply cruelty-free, safe, natural or sustainable.",
    acceptableWording: "“Vegan: no animal-derived ingredients or processing aids.”",
    published: "The chain-of-custody basis.",
  },
  {
    id: "CL24", claim: "Cruelty-free / not tested on animals", group: "Origin & ethics",
    communicates: "That the product and its ingredients were not tested on animals.",
    minEvidence: "A defined policy scope, legal exceptions, supplier declarations and monitoring.",
    finishedProduct: "No",
    doesNotQualify: "An unscoped claim that hides required legal testing in some markets.",
    acceptableWording: "“Not tested on animals”, with the scope named: finished product, ingredients or company, and which markets.",
    published: "The scope of the claim.",
  },
  {
    id: "CL21", claim: "Reef-safe / ocean-friendly", group: "Environmental",
    communicates: "That the product is safe for reefs or oceans.",
    minEvidence: "A defined receiving environment, formula-wide fate/hazard/exposure evidence and a relevant life-cycle scope.",
    finishedProduct: "Yes",
    doesNotQualify: "Ingredient exclusions (e.g. “no oxybenzone”) alone.",
    acceptableWording: "A narrower factual claim, e.g. “does not contain oxybenzone or octinoxate.”",
    published: "The narrow, factual claim only.",
  },
  {
    id: "CL26", claim: "Sustainable / green / eco-friendly", group: "Environmental",
    communicates: "A broad environmental benefit.",
    minEvidence: "Full life-cycle evidence, or a narrowly defined claim with a stated boundary and materiality.",
    finishedProduct: "Depends",
    doesNotQualify: "Vague absolute claims without robust, accessible data.",
    acceptableWording: "A specific, limited claim. Never the bare word “sustainable”.",
    published: "The specific verified claim and its boundary.",
  },
  {
    id: "CL27", claim: "Recyclable", group: "Environmental",
    communicates: "That the packaging can be recycled.",
    minEvidence: "A material and component assessment plus actual collection, sorting and reprocessing availability in the target geography.",
    finishedProduct: "No",
    doesNotQualify: "Technical resin recyclability alone.",
    acceptableWording: "“[Component] recyclable where [geography] facilities exist.”",
    published: "The component, percentage and geography.",
  },
  {
    id: "CL28", claim: "Biodegradable / compostable", group: "Environmental",
    communicates: "That the product or package breaks down naturally.",
    minEvidence: "The matrix, environment, timeframe, percentage and a claim-specific test, with disposal infrastructure.",
    finishedProduct: "Depends",
    doesNotQualify: "Undefined conditions; generalising industrial to home composting.",
    acceptableWording: "“Compostable under [industrial/home] conditions per [standard].”",
    published: "The conditions and standard.",
  },
  {
    id: "CL29", claim: "Carbon neutral", group: "Environmental",
    communicates: "That the product's carbon emissions are net zero.",
    minEvidence: "A product carbon footprint, a reduction plan, residual-emissions treatment and transparent communication.",
    finishedProduct: "No",
    doesNotQualify: "Offsets presented as a replacement for reductions.",
    acceptableWording: "“Carbon neutral for [subject], [year]; [reductions] then [residual treatment].”",
    published: "The subject, boundary, year and role of offsets.",
  },
  {
    id: "CL30", claim: "PCR content / plastic-free", group: "Environmental",
    communicates: "A recycled-content or plastic-free packaging claim.",
    minEvidence: "A bill of materials, supplier proof, mass balance or chain of custody, exclusions and a calculation rule.",
    finishedProduct: "No",
    doesNotQualify: "A figure that silently excludes pumps, labels, liners or secondary packaging.",
    acceptableWording: "“Contains [X]% post-consumer recycled [material] (bottle only).”",
    published: "The components included and the percentage.",
  },
];

/* ── Live Standards Register ──
   Status checked for the research draft on 21 July 2026.
   Confirm the official source before every certification decision. */

export type RegisterEntry = {
  topic: string; standard: string; status: string; scope: string;
  tcsUse: string; limit: string; source: string;
};

export const STANDARDS_REGISTER: RegisterEntry[] = [
  { topic: "Cosmetic GMP", standard: "ISO 22716:2007", status: "Current", scope: "Manufacturing, control, storage and shipment", tcsUse: "Normative reference", limit: "Does not cover environmental protection", source: "https://www.iso.org/standard/36437.html" },
  { topic: "Cosmetic labelling", standard: "ISO 22715:2006", status: "Current", scope: "Packaging and labelling", tcsUse: "Reference plus law", limit: "Market law remains controlling", source: "https://www.iso.org/standard/36436.html" },
  { topic: "Preservative efficacy", standard: "ISO 11930:2019 + Amd 1:2022", status: "Current", scope: "Antimicrobial protection evaluation", tcsUse: "Accepted method", limit: "Use with risk assessment and final package", source: "https://www.iso.org/standard/75058.html" },
  { topic: "Low microbiological risk", standard: "ISO 29621:2017", status: "Current", scope: "Identification of low-risk products", tcsUse: "Justification route", limit: "Not a blanket exemption", source: "https://www.iso.org/standard/68310.html" },
  { topic: "Microbial limits", standard: "ISO 17516:2014", status: "Current; replacement FDIS under approval", scope: "Microbiological limits", tcsUse: "Accepted reference", limit: "Maintain transition watch", source: "https://www.iso.org/standard/59938.html" },
  { topic: "Aerobic count", standard: "ISO 21149:2017", status: "Current", scope: "Enumeration or detection of aerobic mesophilic bacteria", tcsUse: "Accepted method", limit: "Method suitability required", source: "https://www.iso.org/standard/72240.html" },
  { topic: "Yeast and mould", standard: "ISO 16212:2017 + Amd 1:2022", status: "Current", scope: "Enumeration of yeast and mould", tcsUse: "Accepted method", limit: "Method suitability required", source: "https://www.iso.org/standard/72241.html" },
  { topic: "Specified organisms", standard: "ISO 18415:2017 and organism-specific ISO methods", status: "Current", scope: "Detection of specified and non-specified microorganisms", tcsUse: "Accepted method family", limit: "Choose by product risk and local requirements", source: "https://www.iso.org/standard/72238.html" },
  { topic: "Stability guidance", standard: "ISO/TR 18811:2018", status: "Current", scope: "Cosmetic stability guidelines", tcsUse: "Guidance", limit: "Does not prescribe one protocol or acceptance criteria", source: "https://www.iso.org/standard/63465.html" },
  { topic: "SPF in vivo", standard: "ISO 24444:2019 + Amd 1:2022", status: "Current", scope: "Sun protection factor", tcsUse: "Accepted method where market permits", limit: "Market rule controls the label claim", source: "https://www.iso.org/standard/72250.html" },
  { topic: "UVA in vivo", standard: "ISO 24442:2022", status: "Current", scope: "UVA protection factor", tcsUse: "Accepted method", limit: "Use with market claim criterion", source: "https://www.iso.org/standard/75496.html" },
  { topic: "UVA in vitro", standard: "ISO 24443:2021 + Amd 1:2026", status: "Current", scope: "In vitro UVA photoprotection", tcsUse: "Accepted method", limit: "Amendment published in 2026", source: "https://www.iso.org/standard/91166.html" },
  { topic: "SPF in vitro", standard: "ISO 23675:2024", status: "Current", scope: "In vitro SPF", tcsUse: "Alternative method", limit: "Static only; excludes loose or pressed powders and sticks", source: "https://www.iso.org/standard/76616.html" },
  { topic: "Diffuse reflectance sunscreen", standard: "ISO 23698:2024", status: "Current", scope: "SPF, UVA-PF and critical wavelength by hybrid diffuse reflectance", tcsUse: "Alternative method", limit: "Formulation domain and market acceptance must be checked", source: "https://www.iso.org/standard/76699.html" },
  { topic: "Water immersion", standard: "ISO 16217:2020", status: "Current", scope: "Water immersion procedure", tcsUse: "Method component", limit: "Pair with claim rule and ISO 18861", source: "https://www.iso.org/standard/61437.html" },
  { topic: "Water resistance percentage", standard: "ISO 18861:2020", status: "Current", scope: "Percentage of water resistance", tcsUse: "Method component", limit: "Does not by itself define market label duration", source: "https://www.iso.org/standard/63659.html" },
  { topic: "Skin irritation", standard: "OECD TG 439", status: "Current edition", scope: "In vitro skin irritation using reconstructed epidermis", tcsUse: "Endpoint tool", limit: "Not a universal finished-cosmetic requirement", source: "https://www.oecd.org/en/publications/test-no-439-in-vitro-skin-irritation-reconstructed-human-epidermis-test-method_9789264242845-en.html" },
  { topic: "Skin sensitisation", standard: "OECD TG 442C/442D/442E and defined approaches", status: "Current editions", scope: "Non-animal sensitisation key events", tcsUse: "Endpoint tools", limit: "Use an integrated approach and domain check", source: "https://www.oecd.org/en/publications/test-no-442e-in-vitro-skin-sensitisation_9789264264359-en.html" },
  { topic: "Eye hazard", standard: "OECD TG 492 / 492B", status: "Current editions", scope: "Reconstructed human cornea-like epithelium", tcsUse: "Endpoint tool", limit: "A hazard result does not prove tear-free", source: "https://www.oecd.org/en/publications/test-no-492-reconstructed-human-cornea-like-epithelium-rhce-test-method-for-identifying-chemicals-not-requiring-classification-and-labelling-for-eye-irritation-or-serious-eye-damage_9789264242548-en.html" },
  { topic: "Phototoxicity", standard: "OECD TG 432 / TG 498", status: "Current editions", scope: "In vitro phototoxicity", tcsUse: "Endpoint tool", limit: "TG 498 was published July 2026", source: "https://www.oecd.org/en/publications/oecd-guidelines-for-the-testing-of-chemicals-section-4_20745788.html" },
  { topic: "Product certification body", standard: "ISO/IEC 17065:2012", status: "Current; replacement expected", scope: "Bodies certifying products, processes and services", tcsUse: "Scheme governance reference", limit: "Not a product test method", source: "https://www.iso.org/standard/46568.html" },
  { topic: "Product certification scheme", standard: "ISO/IEC 17067:2013", status: "Current; replacement expected", scope: "Fundamentals and scheme guidelines", tcsUse: "Scheme governance reference", limit: "Maintain transition watch", source: "https://www.iso.org/standard/55087.html" },
  { topic: "Testing laboratories", standard: "ISO/IEC 17025:2017", status: "Current", scope: "Laboratory competence, impartiality and consistent operation", tcsUse: "Competence reference", limit: "Check the exact accredited scope", source: "https://www.iso.org/standard/66912.html" },
  { topic: "Audit guidance", standard: "ISO 19011:2018", status: "Current", scope: "Audit programme and auditor competence guidance", tcsUse: "Guidance", limit: "Not product certification accreditation", source: "https://www.iso.org/standard/70017.html" },
  { topic: "Environmental management", standard: "ISO 14001:2026", status: "Current; published Apr 2026", scope: "Environmental management system", tcsUse: "Context evidence", limit: "Cannot prove one product is sustainable", source: "https://www.iso.org/standard/14001" },
  { topic: "Environmental statements", standard: "ISO 14020:2022", status: "Current", scope: "General principles for product environmental statements", tcsUse: "Umbrella reference", limit: "Use with claim-specific standards", source: "https://www.iso.org/standard/79479.html" },
  { topic: "Self-declared environmental claims", standard: "ISO 14021:2026", status: "Current; published Jun 2026", scope: "Words, symbols and graphics for self-declared claims", tcsUse: "Claim reference", limit: "Replaces the 2016 edition", source: "https://www.iso.org/standard/14021" },
  { topic: "Ecolabel programmes", standard: "ISO 14024:2026", status: "Current; published May 2026", scope: "Ecolabel programme and product certification criteria", tcsUse: "Scheme-design reference", limit: "Relevant to a future TCS environmental ecolabel", source: "https://www.iso.org/standard/14024" },
  { topic: "Environmental product declarations", standard: "ISO 14025:2026", status: "Current; published Jun 2026", scope: "EPDs and programme rules", tcsUse: "Declaration reference", limit: "Requires suitable programme rules or PCR", source: "https://www.iso.org/standard/14025" },
  { topic: "Life-cycle assessment framework", standard: "ISO 14040:2006", status: "Current", scope: "LCA principles and framework", tcsUse: "Primary evidence reference", limit: "Detailed requirements are in ISO 14044", source: "https://www.iso.org/standard/37456.html" },
  { topic: "Life-cycle assessment requirements", standard: "ISO 14044:2006", status: "Current", scope: "LCA requirements and guidelines", tcsUse: "Primary evidence reference", limit: "Critical review needed for some public comparisons", source: "https://www.iso.org/standard/38498.html" },
  { topic: "Water footprint", standard: "ISO 14046:2014", status: "Current", scope: "LCA-based water footprint", tcsUse: "Primary evidence reference", limit: "Geographic and impact context matter", source: "https://www.iso.org/standard/43263.html" },
  { topic: "Product carbon footprint", standard: "ISO 14067:2018", status: "Current; revision underway", scope: "Product carbon footprint", tcsUse: "Primary climate evidence", limit: "Climate only; excludes offsets and communication", source: "https://www.iso.org/standard/71206.html" },
  { topic: "Carbon neutrality", standard: "ISO 14068-1:2023", status: "Current", scope: "Achieving and demonstrating carbon neutrality", tcsUse: "Claim reference", limit: "Prioritises reductions before residual treatment", source: "https://www.iso.org/standard/43279.html" },
  { topic: "Circularity measurement", standard: "ISO 59020:2024", status: "Current; revision underway", scope: "Measure and assess circularity", tcsUse: "Primary circularity evidence", limit: "One indicator does not equal overall sustainability", source: "https://www.iso.org/standard/80650.html" },
  { topic: "Packaging environmental framework", standard: "ISO 18601:2013", status: "Current", scope: "Packaging and environment general requirements", tcsUse: "Packaging reference", limit: "Use with relevant parts", source: "https://www.iso.org/standard/55869.html" },
  { topic: "Packaging optimisation", standard: "ISO 18602:2013", status: "Current", scope: "Weight and volume optimisation", tcsUse: "Packaging evidence", limit: "Must preserve product function", source: "https://www.iso.org/standard/55870.html" },
  { topic: "Packaging material recycling", standard: "ISO 18604:2013", status: "Current", scope: "Material recycling requirements", tcsUse: "Packaging evidence", limit: "Add local infrastructure evidence", source: "https://www.iso.org/standard/55872.html" },
  { topic: "Packaging organic recycling", standard: "ISO 18606:2013", status: "Current", scope: "Organic recycling", tcsUse: "Packaging evidence", limit: "Do not generalise to home composting", source: "https://www.iso.org/standard/55874.html" },
  { topic: "Sustainable procurement", standard: "ISO 20400:2017", status: "Current", scope: "Sustainable procurement guidance", tcsUse: "System evidence", limit: "Not a product claim by itself", source: "https://www.iso.org/standard/63026.html" },
  { topic: "Chain of custody", standard: "ISO 22095:2020 + Amd 1:2026", status: "Current", scope: "Terminology and models for chain of custody", tcsUse: "Traceability reference", limit: "Cannot alone support sustainability claims", source: "https://www.iso.org/standard/72532.html" },
  { topic: "Social responsibility", standard: "ISO 26000:2010", status: "Current", scope: "Social responsibility guidance", tcsUse: "Guidance", limit: "Not certifiable. Never claim “ISO 26000 certified”.", source: "https://www.iso.org/standard/42546.html" },
  { topic: "Social LCA", standard: "ISO 14075:2024", status: "Current", scope: "Social life-cycle assessment", tcsUse: "Product social evidence", limit: "Use for material product-level social claims", source: "https://www.iso.org/standard/61118.html" },
  { topic: "Natural ingredient definitions", standard: "ISO 16128-1:2016", status: "Current; revision started 2026", scope: "Definitions for natural and organic cosmetic ingredients", tcsUse: "Content framework", limit: "Excludes claims, safety, environment, packaging and regulation", source: "https://www.iso.org/standard/62503.html" },
  { topic: "Natural and organic indexes", standard: "ISO 16128-2:2017 + Amd 1:2022", status: "Current; revision started 2026", scope: "Indexes and product content calculation", tcsUse: "Content framework", limit: "Does not certify natural, safe or sustainable", source: "https://www.iso.org/standard/65197.html" },
  { topic: "India greenwashing", standard: "CCPA Guidelines 2024", status: "Current", scope: "Prevention and regulation of greenwashing and misleading environmental claims", tcsUse: "Legal/advertising gate", limit: "Requires credible evidence and accessible qualification", source: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2064963" },
  { topic: "India advertising green claims", standard: "ASCI Guidelines (Feb 2024)", status: "Current", scope: "Environmental advertising claims", tcsUse: "Advertising reference", limit: "Full life-cycle or clearly limited claim; state product/package scope", source: "https://www.ascionline.in/wp-content/uploads/2024/01/Guidelines-for-Advertisements-Making-Environmental-Green-Claims.pdf" },
];

/* Markets covered by the framework's market overlays. */
export const MARKETS = ["India", "European Union", "United States", "Australia", "Canada", "United Kingdom", "ASEAN"] as const;

