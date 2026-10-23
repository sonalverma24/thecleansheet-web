/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Ingredient alias table (DRAFT, NOT SIGNED OFF, NOT IN USE)

   A label often names an ingredient we already hold under another spelling or name ("Water" for the row
   "Aqua", "Glycerine" for "Glycerin"). Today those fail the exact-name lookup, so the ingredient counts as
   "not in our reference database" even though its row exists. This table says, pair by pair, that the two
   names are the SAME substance, so the lookup may use the existing row.

   What it is not: it adds no ingredient and no regulatory fact. Every target below is a row that is already
   in src/data/ingredients.json, named exactly as that row names itself. An alias can only point at a row that exists.

   Two gates, both closed today:
     1. An entry applies only when it is signed off: both `signedOffBy` and `signedOffOn` are set on it.
     2. Signed-off entries apply only when the flag ANALYSER_INGREDIENT_ALIASES is on (off by default).
   To sign off: set those two fields on each entry you approve, then turn the flag on in its own deploy.
   An entry you do not approve stays inert, and a reviewer can edit or delete it freely.

   How each pair was checked (2026-10-23):
     pubchem   The alias name and the target row's own CAS number were each looked up in PubChem (NIH) and
               returned the SAME compound record (the CID below). A pair PubChem put on two different records
               was dropped (see NOT_ALIASED).
     row-name  The target row's own name already carries the alias in brackets, e.g. the row
               "Tea Tree Oil (Melaleuca Alternifolia Leaf Oil)" names the INCI form itself.
   A label may add a common name in brackets ("Prunus Armeniaca (Apricot) Kernel Oil"); brackets are ignored
   when names are compared, so the alias is written without them. A label with a slash is matched by its whole
   text or by its first part, never a later one: "Water/Aqua" is read as "Water", and so resolves through the
   Water entry; "Aqua/Water" already resolves, because its first part is the row itself.

   Rules for adding a pair: the target exists verbatim; the alias does not already resolve; the two agree on
   nano/non-nano, salt/acid and D/L form; one source; one line of reasoning. src/lib/ingredient-aliases.test.ts enforces these.
──────────────────────────────────────────────────────────────── */

export type AliasSource =
  | { kind: "pubchem"; label: string; url: string; cid: number; cas: string; checkedOn: string }
  | { kind: "row-name"; label: string; url: null; checkedOn: string };

export interface IngredientAlias {
  /** The name as a label may write it. Case, punctuation and bracketed common names do not matter. */
  alias: string;
  /** The INCI_Name of an existing row in src/data/ingredients.json, verbatim. */
  target: string;
  /** One line: why these two names are the same substance. */
  reason: string;
  source: AliasSource;
  /** Set both to put this pair into use (with the flag on). Absent means the pair does nothing. */
  signedOffBy?: string;
  signedOffOn?: string;
}

/** The key two names are compared by: lower case, brackets and punctuation removed. Keeps every part of a name, unlike the row index. */
export function aliasKey(name: string): string {
  return (name || "").toLowerCase().replace(/​/g, "").replace(/\([^)]*\)/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

export function isSignedOff(e: Pick<IngredientAlias, "signedOffBy" | "signedOffOn">): boolean {
  return Boolean(e.signedOffBy?.trim() && e.signedOffOn?.trim());
}

const CHECKED = "2026-10-23";
const pubchem = (cid: number, cas: string, what: string): AliasSource => ({
  kind: "pubchem", cid, cas, checkedOn: CHECKED,
  label: `PubChem compound ${cid} (${what}); the row's CAS ${cas} resolves to the same record`,
  url: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
});
const rowName = (row: string): AliasSource => ({ kind: "row-name", url: null, checkedOn: CHECKED, label: `Row name in src/data/ingredients.json: "${row}"` });

export const INGREDIENT_ALIASES: readonly IngredientAlias[] = [
  // ── Water, the most common miss ──
  { alias: "Water", target: "Aqua", source: pubchem(962, "7732-18-5", "water"),
    reason: "Aqua is the INCI name for water; the plain word on a label is the same compound." },
  { alias: "Purified Water", target: "Aqua", source: pubchem(962, "7732-18-5", "water"),
    reason: "A label wording for water: 'purified' names the grade, and PubChem holds it as the same compound." },

  // ── Spelling and punctuation variants of an INCI name ──
  { alias: "Glycerine", target: "Glycerin", source: pubchem(753, "56-81-5", "glycerol"),
    reason: "The British spelling of Glycerin; one compound." },
  { alias: "Magnesium Sulphate", target: "Magnesium Sulfate", source: pubchem(24083, "7487-88-9", "magnesium sulfate"),
    reason: "The British spelling of Magnesium Sulfate; one compound." },
  { alias: "Methyl Paraben", target: "Methylparaben", source: pubchem(7456, "99-76-3", "methylparaben"),
    reason: "The INCI name is one word; the spaced form names the same ester." },
  { alias: "Propyl Paraben", target: "Propylparaben", source: pubchem(7175, "94-13-3", "propylparaben"),
    reason: "The INCI name is one word; the spaced form names the same ester." },
  { alias: "Hydroxyethyl Cellulose", target: "Hydroxyethylcellulose", source: pubchem(4327536, "9004-62-0", "hydroxyethyl cellulose"),
    reason: "The INCI name is one word; the spaced form names the same polymer." },
  { alias: "Ethylenediaminetetraacetic Acid", target: "Ethylene Diamine Tetraacetic Acid", source: pubchem(6049, "60-00-4", "EDTA, the free acid"),
    reason: "The same free acid written without spaces; its salts (Disodium EDTA and the like) are separate rows and are not touched." },
  { alias: "Tocopherol Acetate", target: "Tocopheryl Acetate", source: pubchem(86472, "58-95-7", "tocopheryl acetate"),
    reason: "A common mis-spelling of the INCI name Tocopheryl Acetate; the acetate ester, not plain tocopherol." },

  // ── A systematic or chemical name beside the INCI name ──
  { alias: "2-Phenoxyethanol", target: "Phenoxyethanol", source: pubchem(31236, "122-99-6", "2-phenoxyethanol"),
    reason: "The systematic name of the same preservative." },
  { alias: "2-Ethylhexyl Salicylate", target: "Ethylhexyl Salicylate", source: pubchem(8364, "118-60-5", "2-ethylhexyl salicylate"),
    reason: "The systematic name of the same UV filter (octisalate)." },
  { alias: "L-Arginine", target: "Arginine", source: pubchem(6322, "74-79-3", "L-arginine"),
    reason: "The INCI name Arginine is the L amino acid; the 'L-' prefix is the same compound." },
  { alias: "L-Glutathione", target: "Glutathione", source: pubchem(124886, "70-18-8", "glutathione"),
    reason: "The INCI name Glutathione is the L-form tripeptide; the 'L-' prefix is the same compound." },
  { alias: "D-Panthenol", target: "Panthenol", source: pubchem(131204, "81-13-0", "dexpanthenol"),
    reason: "D-Panthenol is dexpanthenol, the D form this row records (CAS 81-13-0). DL-panthenol is deliberately not aliased." },
  { alias: "CI 77891", target: "Titanium Dioxide", source: pubchem(26042, "13463-67-7", "titanium dioxide"),
    reason: "CI 77891 is the colour-index number of titanium dioxide. It maps to the plain row, as 'Titanium Dioxide' already does, and says nothing about nano." },

  // ── The row already names the INCI form in brackets ──
  { alias: "Butylated Hydroxytoluene", target: "BHT (Butylated Hydroxytoluene)", source: rowName("BHT (Butylated Hydroxytoluene)"),
    reason: "The row is BHT and states the full name in brackets; a label that writes the full name means the same substance." },
  { alias: "Melaleuca Alternifolia Leaf Oil", target: "Tea Tree Oil (Melaleuca Alternifolia Leaf Oil)", source: rowName("Tea Tree Oil (Melaleuca Alternifolia Leaf Oil)"),
    reason: "The row is tea tree oil and gives the INCI name in brackets." },
  { alias: "Prunus Armeniaca Kernel Oil", target: "Apricot Kernel Oil (Prunus Armeniaca Kernel Oil)", source: rowName("Apricot Kernel Oil (Prunus Armeniaca Kernel Oil)"),
    reason: "The row is apricot kernel oil and gives the INCI name in brackets." },
  { alias: "Pelargonium Graveolens Flower Oil", target: "Geranium Oil (Pelargonium Graveolens Flower Oil)", source: rowName("Geranium Oil (Pelargonium Graveolens Flower Oil)"),
    reason: "The row is geranium oil and gives the INCI name in brackets." },
  { alias: "Rosa Damascena Flower Extract", target: "Rose Flower Extract (Rosa Damascena Flower Extract)", source: rowName("Rose Flower Extract (Rosa Damascena Flower Extract)"),
    reason: "The row is rose flower extract and gives the INCI name in brackets." },
  { alias: "Citrus Aurantium Dulcis Peel Oil", target: "Orange Peel Oil (Citrus Aurantium Dulcis Peel Oil)", source: rowName("Orange Peel Oil (Citrus Aurantium Dulcis Peel Oil)"),
    reason: "The row is orange peel oil and gives the INCI name in brackets." },
  { alias: "Chondrus Crispus Extract", target: "Irish Moss Extract (Chondrus Crispus Extract)", source: rowName("Irish Moss Extract (Chondrus Crispus Extract)"),
    reason: "The row is Irish moss extract and gives the INCI name in brackets." },
  { alias: "Phyllanthus Emblica Fruit Extract", target: "Amla Extract (Phyllanthus Emblica Fruit Extract)", source: rowName("Amla Extract (Phyllanthus Emblica Fruit Extract)"),
    reason: "The row is amla extract and gives the INCI name in brackets." },
  { alias: "Lactobacillus Ferment Lysate", target: "Probiotic Lysate (Lactobacillus Ferment Lysate)", source: rowName("Probiotic Lysate (Lactobacillus Ferment Lysate)"),
    reason: "The row is a probiotic lysate and gives the INCI name in brackets." },
];

/** Names that look like aliases and are NOT in the table, with the reason. Kept so a reviewer sees what was weighed and left out. */
export const NOT_ALIASED: readonly { name: string; why: string }[] = [
  { name: "Fragrance", why: "The file has no Parfum row at all, so there is nothing to point at. Adding the row is adding an ingredient, which was ruled out for this draft." },
  { name: "Perfume", why: "Same as Fragrance: no Parfum row to point at." },
  { name: "Parfum", why: "Same as Fragrance: it is the INCI name, and the file has no row for it." },
  { name: "Vitamin E", why: "Ambiguous: it can mean tocopherol or tocopheryl acetate, and the repo's own merge list (ingredient-canonical.ts) refuses to merge tocopherol forms." },
  { name: "Sodium Lauryl Sarcosinate", why: "PubChem holds it on a different record from Sodium Lauroyl Sarcosinate (the row), so the two are not shown to be the same. Needs a reviewer." },
  { name: "Cocamide MEA", why: "The nearest row is Cocamide DEA, a different substance. Spelling closeness is not identity." },
  { name: "Calamine", why: "The nearest row is Carmine, a different substance." },
  { name: "Aluminum Chlorohydrate", why: "Almost certainly the US spelling of the row 'Aluminium Chlorohydrate', but PubChem could not confirm the row's CAS, so it is unchecked. Needs a reviewer." },
  { name: "Cocoglucoside", why: "Probably Coco-Glucoside; PubChem has no record for either name, so it is unchecked. Needs a reviewer." },
  { name: "Ethylhexyl Glycerine", why: "Probably Ethylhexylglycerin; PubChem did not return the label spelling, so it is unchecked. Needs a reviewer." },
  { name: "Bees Wax", why: "Probably Beeswax; PubChem has no record for either name (a natural wax), so it is unchecked. Needs a reviewer." },
  { name: "Caprylic Capric Triglyceride", why: "A punctuation-only variant of the row 'Caprylic/Capric Triglyceride'. Better fixed by comparing '/' as a space in the matcher than by an alias; not drafted." },
  { name: "Dimethicone Vinyl Dimethicone Crosspolymer", why: "A punctuation-only variant of a row name containing '/'. Same remedy as above; not drafted." },
  { name: "Ceramide 1", why: "A different ceramide from the nearest row (Ceramide NP). Ceramides are distinct substances; each needs its own row, not an alias." },
];
