/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Free-from claim ontology (data)
   For each "X-free" claim class: which ingredient identities defeat it, and how
   firmly. Logic lives in src/lib/claim-ontology.ts.

   Two strengths, and the difference matters:
     definitive  the ingredient IS a member of the class (ethylparaben is a paraben).
     qualified   whether it defeats the claim is a formulation or claim-meaning call
                 for a person (an essential oil against "fragrance-free", benzyl
                 alcohol against "alcohol-free").

   An entry declared `definitive` only COUNTS as definitive when ALL of these hold
   (checked in code by provenanceProblems, src/lib/claim-ontology.ts), otherwise it is
   treated as `qualified`:
     - `source` is a valid CAS Registry Number (check digit verified) or an https URL on
       a host in AUTHORITATIVE_SOURCE_HOSTS below;
     - `reviewRef` is an opaque reference of the form TCS-P-014 to a reviewer on the TCS
       Panel. The reviewer's NAME is never stored here or shown anywhere on the site: it
       lives in a private register outside this repository, and the public line is the
       fixed text PANEL_ATTRIBUTION. scripts/audit-reviewer-register.mts checks each
       reference against that register (it exists, is active, is not the site owner);
     - `reviewedAt` is a real calendar date, not in the future.
   A string that merely exists does not pass. The owner's approval sets which classes are
   tracked and what free-from means for the site; it does not validate chemical
   equivalence, and the host list below is itself an owner policy that a qualified
   reviewer should confirm.

   Every entry below is seeded from forms the engine already uses in concepts.ts
   (plus the cases found in the verifier census) and is UNREVIEWED, so today every
   relation is effectively `qualified`. Do not enable ANALYSER_ONTOLOGY_TICKS until a
   qualified reviewer has filled in the review fields: with none reviewed, a product
   that lists methylparaben would lose its "Paraben free" cross rather than keep it.
──────────────────────────────────────────────────────────────── */

export type DeclaredStrength = "definitive" | "qualified";

/** Hosts accepted as an authoritative classification source. Matched on the host or any
    subdomain of it. Extending this list is a policy decision, not a chemistry one. */
export const AUTHORITATIVE_SOURCE_HOSTS: readonly string[] = [
  "ec.europa.eu",                  // CosIng and the EU cosmetics regulation pages
  "single-market-economy.ec.europa.eu",
  "eur-lex.europa.eu",
  "echa.europa.eu",
  "pubchem.ncbi.nlm.nih.gov",
  "commonchemistry.cas.org",
  "cir-safety.org",                // Cosmetic Ingredient Review
  "fda.gov",
];

/** Hazard context for an ingredient. Shown only when it carries its own authoritative
    source, and always followed by the fixed hazard-versus-risk disclaimer. */
export interface HazardNote { text: string; source: string }

export interface OntologyEntry {
  /** Ingredient form to match, compared after normalisation. */
  form: string;
  /** `word`: the form appears as whole words inside an INCI item. `exact`: the whole
      item equals the form (so "Alcohol" matches, "Cetyl Alcohol" does not). */
  match?: "word" | "exact";
  strength: DeclaredStrength;
  source?: string;
  /** Opaque reference to a TCS Panel reviewer (TCS-P-014). Never a name. */
  reviewRef?: string;
  reviewedAt?: string;
  hazard?: HazardNote;
  note?: string;
}

export interface ClaimClass {
  id: string;
  label: string;
  /** Labels the "At a glance" strip uses for this claim. */
  tickLabels: string[];
  entries: OntologyEntry[];
}

const D = (form: string, match?: "word" | "exact", note?: string): OntologyEntry => ({ form, match, strength: "definitive", note });
const Q = (form: string, note: string, match?: "word" | "exact"): OntologyEntry => ({ form, match, strength: "qualified", note });

export const CLAIM_CLASSES: ClaimClass[] = [
  {
    id: "paraben", label: "Parabens", tickLabels: ["Paraben free"],
    entries: ["methylparaben", "ethylparaben", "propylparaben", "butylparaben", "isobutylparaben", "paraben"].map((f) => D(f)),
  },
  {
    id: "sulfate", label: "Sulphate surfactants", tickLabels: ["Sulfate free", "Sulphate free"],
    entries: [
      "sodium lauryl sulfate", "sodium laureth sulfate", "ammonium lauryl sulfate", "ammonium laureth sulfate",
      "sodium coco sulfate", "sodium myreth sulfate", "tea lauryl sulfate",
    ].map((f) => D(f, "word", "Sulphate SURFACTANTS only, not mineral salts such as magnesium sulfate.")),
  },
  {
    id: "drying-alcohol", label: "Drying alcohol", tickLabels: ["Alcohol free"],
    entries: [
      D("alcohol", "exact", "A bare 'Alcohol' entry. Fatty alcohols (cetyl, cetearyl) are not members."),
      ...["alcohol denat", "sd alcohol", "denatured alcohol", "ethanol", "isopropyl alcohol"].map((f) => D(f)),
      Q("benzyl alcohol", "An aromatic alcohol used as a preservative or fragrance component. Whether it defeats 'alcohol-free' depends on what the brand means by the claim."),
    ],
  },
  {
    id: "fragrance", label: "Fragrance", tickLabels: ["Fragrance free"],
    entries: [
      ...["parfum", "fragrance", "aroma"].map((f) => D(f)),
      Q("sugandhit dravya", "Hindi wording for a fragrance declaration. Classification pending alias review; treated like Parfum once reviewed."),
      Q("essential oil", "Fragrant, but not a fragrance declaration. Whether it defeats 'fragrance-free' is a formulation question."),
      ...["lavender oil", "peppermint oil", "tea tree oil", "eucalyptus oil", "citrus oil", "lemongrass oil", "cymbopogon"]
        .map((f) => Q(f, "A fragrant botanical. Whether it defeats 'fragrance-free' is a formulation question.")),
    ],
  },
  {
    id: "silicone", label: "Silicones", tickLabels: ["Silicone free"],
    entries: [
      "dimethicone", "cyclopentasiloxane", "cyclohexasiloxane", "cyclomethicone", "siloxane", "silsesquioxane",
      "dimethiconol", "trimethicone", "silanetriol", "silicone",
    ].map((f) => D(f)),
  },
];
