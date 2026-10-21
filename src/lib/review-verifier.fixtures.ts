/* Golden fixtures for the review verifier and identity resolver.

   Every list comes from the 21 Oct 2026 audit of thecleansheet.in, copied verbatim
   from the reference implementation's golden_set.py. They are regression fixtures with
   reviewed, constructed expectations: they are not expert-labelled ground truth, and
   passing them says nothing about catalogue-wide precision or recall. */

import { CaptureTrust, type Evidence } from "@/lib/review-verifier";

/** Patanjali Aloe Vera Gel Face Wash as stored on the site. */
export const PATANJALI_STORED = [
  "Aloe Vera (Aloe Barbadensis)", "Mentha Spicata", "Aqua", "Glycerin", "Decyl Glucoside",
  "Propylene Glycol", "Glycerin", "Glyceryl Glucoside", "Sugandhit Dravya", "Carbomer", "Vit E",
  "Edta Disodium", "Phenoxyethanol", "Chlorphenesin", "Ethylhexylglycerin", "Sodium Benzoate",
];

/** Verbatim from the brand's web panel (fetched 21 Oct). May not match the current pack. */
export const PATANJALI_OFFICIAL_BASE = [
  "Aqua", "Glycerin", "Decyle glucoside", "Propylene glycol", "Glycerin & Glyceyl glucoside",
  "Sugandhit Dravya", "Carbomer", "Vit -E", "EDTA Disodium phenoxyethanol", "Chlorphenesin",
  "Ethylhexyglycerin", "Sodium Benzoate- Q.S.",
];

export const PONDS_HYDRA = [
  "Water", "Dimethicone", "Glycerin", "Butylene Glycol", "Niacinamide",
  "Ammonium Acryloyldimethyltaurate/VP Copolymer", "Linoleamidopropyl Pg-Dimonium Chloride Phosphate",
  "Phenoxyethanol", "Ammonium Acryloyldimethyltaurate/Beheneth-25 Methacrylate Crosspolymer",
  "Dimethicone", "Fragrance", "Disodium EDTA", "Palmitic Acid", "Capric/Caprylic Triglyceride",
  "Tocopheryl Acetate", "Triethanolamine", "BHT", "Salicylic Acid",
];

export const PONDS_SUPERLIGHT = [
  "WATER (AQUA)", "DIMETHICONE", "GLYCERIN", "BUTYLENE GLYCOL",
  "AMMONIUM ACRYLOYLDIMETHYLTAURATE/VP COPOLYMER", "NIACINAMIDE", "PHENOXYETHANOL",
  "AMMONIUM ACRYLOYLDIMETHYLTAURATE/BEHENETH-25 METHACRYLATE CROSSPOLYMER", "FRAGRANCE (PARFUM)",
  "LINOLEAMIDOPROPYL PG-DIMONIUM CHLORIDE PHOSPHATE", "PROPYLENE GLYCOL", "TOCOPHERYL ACETATE",
  "STEARIC ACID", "DISODIUM EDTA", "CAPRYLIC/CAPRIC TRIGLYCERIDE", "TRIETHANOLAMINE", "BHT", "SODIUM PCA",
];

export const DERMA_CO_A = [
  "Aqua", "Propylene Glycol", "Butyl Methoxydibenzoylmethane", "Terephthalylidene Dicamphor Sulfonic Acid",
  "Phenylbenzimidazole Sulfonic Acid", "Glycerin", "Ethylhexyl Methoxycinnamate",
  "Caprylic/Caprylic Triglyceride", "Triethanolamine", "Tapioca Starch",
  "Ammonium Acryloyldimethyltaurate/VP Copolymer", "Ethylhexyl Salicylate",
  "Methylene Bis-Benzotriazolyl Tetramethylbutylphenol", "Decyl Glucoside", "Xanthan Gum",
  "Isododecane", "Sodium Hyaluronate", "Niacinamide",
];

export const DERMA_CO_B = [
  "Aqua", "C12-15 Alkyl Benzoate", "Ethylhexyl Methoxycinnamate", "Dimethicone",
  "Sodium Acrylates Copolymer", "Butyl Methoxydibenzoylmethane", "Hyaluronic Acid", "Glycerin",
  "Benzophenone-3", "1,3 Butylene glycol", "Phenoxyethanol", "Lecithin",
  "Aloe Barbadensis (Aloe Vera) Leaf Juice", "Xylitol", "Glucose", "Sodium Levulinate",
  "Phospholipids", "Propylene Glycol",
];

export const CICAPLAST_A = [
  "Water", "Hydrogenated Polyisobutene", "Dimethicone", "Glycerin", "Butyrospermum Parkii Butter",
  "Panthenol", "Aluminum Starch Octenylsuccinate", "Butylene Glycol", "Propanediol",
  "Cetyl PEG/PPG-10/1 Dimethicone", "Trihydroxystearin", "Zinc Gluconate", "Madecassoside",
  "Manganese Gluconate", "Silica", "Aluminum Hydroxide",
];

export const CICAPLAST_B = [
  "Aqua", "Hydrogenated Polyisobutene", "Dimethicone", "Glycerin", "Butyrospermum Parkii Butter / Shea Butter",
  "Panthenol", "Propanediol", "Butylene Glycol", "Aluminum Starch Octenylsuccinate",
  "Cetyl PEG/PPG-10/1 Dimethicone", "Trihydroxystearin", "Zinc Gluconate", "Madecassoside", "Tribioma",
  "Manganese Gluconate", "Silica",
];

/** A reference-database list with a quoted source: anchored. */
export const EV_REFDB: Evidence = {
  value: "inci", sourceUrl: "https://incidecoder.com/example",
  quote: "full ingredient list as shown", captureTrust: CaptureTrust.REFERENCE_DB,
};

/** A retailer list with no quote: unanchored on purpose. */
export const EV_RETAILER: Evidence = {
  value: "inci", sourceUrl: "https://retailer.example/p", quote: "", captureTrust: CaptureTrust.RETAILER,
};

/** The brand's own web panel, quoted. */
export const EV_OFFICIAL: Evidence = {
  value: "inci",
  sourceUrl: "https://patanjaliayurved.net/product/natural-personal-care/skin-care/face-wash/patanjali-aloevera-gel-face-wash/3866",
  quote: "Base Material: Aqua, Glycerin, ... Sodium Benzoate- Q.S.",
  captureTrust: CaptureTrust.OFFICIAL_PAGE,
};
