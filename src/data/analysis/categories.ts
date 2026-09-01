/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Product category taxonomy (step 4)
   The authoritative, closed list every live review is classified into.
   The model may PROPOSE a category; product-categorise.ts validates the
   proposal against this list so a review can never carry a free-text
   category the rest of the pipeline doesn't understand.
──────────────────────────────────────────────────────────────── */

export type CategoryFamily =
  | "Baby" | "Hair" | "Makeup" | "Nail" | "Skin"
  | "Oral Care" | "OTC (Eczema)" | "Other" | "Sunscreens";

export interface ProductCategory {
  id: string;            // stable slug id, e.g. "skin_facial_moisturizer"
  family: CategoryFamily;
  type: string;          // display label, e.g. "Facial Moisturizer"
  /** Words that map free-text / model output to this type (lower-case). */
  synonyms: string[];
}

const c = (family: CategoryFamily, type: string, synonyms: string[] = []): ProductCategory => ({
  id: `${family.toLowerCase().replace(/[^a-z]+/g, "_")}_${type.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`.replace(/_+/g, "_").replace(/^_|_$/g, ""),
  family, type, synonyms,
});

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  // ── Baby ──
  c("Baby", "Baby Bubble Bath", ["baby bath"]),
  c("Baby", "Baby Body Spray"),
  c("Baby", "Diaper Cream", ["nappy cream", "diaper rash"]),
  c("Baby", "Baby Lotion"),
  c("Baby", "Baby Oil"),
  c("Baby", "Baby Shampoo"),
  c("Baby", "Baby Soap"),
  c("Baby", "Baby Toothpaste"),
  c("Baby", "Baby Wipes", ["baby wet wipes"]),
  // ── Hair ──
  c("Hair", "Conditioner", ["hair conditioner"]),
  c("Hair", "Detangler"),
  c("Hair", "Hair Gel"),
  c("Hair", "Hair Color", ["hair colour", "hair dye"]),
  c("Hair", "Hair Spray", ["hairspray"]),
  c("Hair", "Hair Removal Wax", ["wax", "depilatory"]),
  c("Hair", "Hair Mousse", ["mousse"]),
  c("Hair", "Shampoo", ["anti-dandruff shampoo", "hair wash", "onion shampoo"]),
  // ── Makeup ──
  c("Makeup", "BB/CC Cream", ["bb cream", "cc cream"]),
  c("Makeup", "Blush", ["blusher"]),
  c("Makeup", "Bronzer/Highlighter", ["bronzer", "highlighter"]),
  c("Makeup", "Body Art"),
  c("Makeup", "Brow Liner", ["eyebrow pencil", "brow pencil"]),
  c("Makeup", "Concealer"),
  c("Makeup", "Eyeliner", ["kajal", "kohl"]),
  c("Makeup", "Eye Shadow", ["eyeshadow"]),
  c("Makeup", "Facial Powder", ["compact", "setting powder", "loose powder"]),
  c("Makeup", "Foundation"),
  c("Makeup", "Glitter (cosmetic)", ["glitter"]),
  c("Makeup", "Lip Balm", ["lip butter"]),
  c("Makeup", "Lip Balm with SPF", ["spf lip balm"]),
  c("Makeup", "Lip Gloss"),
  c("Makeup", "Lip Liner"),
  c("Makeup", "Lip Plumper"),
  c("Makeup", "Lipstick", ["liquid lipstick", "matte lipstick"]),
  c("Makeup", "Mascara"),
  c("Makeup", "Makeup Remover", ["micellar", "cleansing balm remover"]),
  c("Makeup", "Makeup Remover Wipes", ["makeup wipes"]),
  // ── Nail ──
  c("Nail", "Cuticle Products", ["cuticle oil"]),
  c("Nail", "Nail Polish", ["nail paint", "nail lacquer"]),
  c("Nail", "Nail Polish Remover", ["nail paint remover", "acetone"]),
  c("Nail", "Nail Products (General)", ["nail care"]),
  // ── Skin ──
  c("Skin", "Aftershave", ["after shave"]),
  c("Skin", "After-sun Products", ["after sun"]),
  c("Skin", "Antiperspirants & Deodorants", ["deodorant", "antiperspirant", "roll on", "deo"]),
  c("Skin", "Anti-aging Products", ["anti-ageing", "anti aging", "wrinkle"]),
  c("Skin", "Around-eye Creams", ["eye cream", "under eye", "around eye"]),
  c("Skin", "Bath Oils/Salts/Soaks", ["bath salt", "bath soak", "bath oil"]),
  c("Skin", "Body-cleansing Wipes", ["body wipes"]),
  c("Skin", "Body-firming Lotion", ["firming lotion"]),
  c("Skin", "Body Powder", ["talc", "dusting powder"]),
  c("Skin", "Body Oil"),
  c("Skin", "Body Wash/Cleanser", ["body wash", "shower gel", "bathing"]),
  c("Skin", "Bubble Bath"),
  c("Skin", "Callus Products", ["callus", "foot file"]),
  c("Skin", "Exfoliant/Scrub", ["scrub", "exfoliant", "exfoliator", "peel", "aha", "bha exfoliant"]),
  c("Skin", "Facial Cleanser", ["face wash", "facial cleanser", "cleanser", "face cleanser", "gel cleanser", "foaming cleanser"]),
  c("Skin", "Facial-cleansing Wipes", ["face wipes"]),
  c("Skin", "Facial Moisturizer", ["face moisturizer", "face moisturiser", "face cream", "gel moisturizer", "day cream", "night cream", "moisturizer", "moisturiser"]),
  // Serums / ampoules / face oils were missing from the base taxonomy though they
  // are the most-reviewed category on the platform; added so they classify.
  c("Skin", "Face Serum", ["serum", "face serum", "facial serum", "vitamin c serum", "niacinamide serum", "retinol serum", "hyaluronic acid serum", "peptide serum", "ampoule", "booster serum"]),
  c("Skin", "Face Oil", ["face oil", "facial oil", "facial oils"]),
  c("Skin", "Foot Cleanser", ["foot wash"]),
  c("Skin", "Hand Cream", ["hand lotion"]),
  c("Skin", "Hand Sanitizer", ["sanitiser", "sanitizer"]),
  c("Skin", "Liquid & Bar Soaps", ["soap", "bar soap", "hand wash"]),
  c("Skin", "Lotion", ["body lotion"]),
  c("Skin", "Masks", ["face mask", "sheet mask", "clay mask", "sleeping mask"]),
  c("Skin", "Moisturizer", ["body moisturizer"]),
  c("Skin", "Moisturizer with SPF", ["day cream spf", "moisturizer spf"]),
  c("Skin", "Oil Controller", ["oil control", "mattifying"]),
  c("Skin", "Redness Products", ["anti-redness", "cica", "centella"]),
  c("Skin", "Scar Products", ["scar gel", "scar cream"]),
  c("Skin", "Shaving Cream", ["shaving gel", "shave foam"]),
  c("Skin", "Toner/Astringent", ["toner", "astringent", "essence"]),
  // ── Oral Care ──
  c("Oral Care", "Breath Freshener", ["mouth spray"]),
  c("Oral Care", "Mouthwash", ["mouth rinse"]),
  c("Oral Care", "Toothpaste"),
  // ── OTC (Eczema) ──
  c("OTC (Eczema)", "OTC Eczema Topicals", ["eczema cream", "eczema"]),
  // ── Other ──
  c("Other", "Body Spray", ["deo spray", "body mist"]),
  c("Other", "Foot Odor Control", ["foot spray", "foot powder"]),
  c("Other", "Fragrance (Perfume/EDT/EDP)", ["perfume", "edt", "edp", "eau de", "fragrance"]),
  c("Other", "Muscle/Joint Rub", ["pain balm", "joint rub"]),
  c("Other", "Vapor Rub", ["vapour rub"]),
  // ── Sunscreens ──
  c("Sunscreens", "Baby/Kids Sunscreens", ["baby sunscreen", "kids sunscreen"]),
  c("Sunscreens", "Recreational Sunscreens", ["sunscreen", "sunblock", "spf", "sun cream", "sunscreen gel"]),
];

export const CATEGORY_BY_ID = new Map(PRODUCT_CATEGORIES.map((x) => [x.id, x]));

/** Fallback used when nothing matches - keeps the pipeline total, never crashes. */
export const UNCLASSIFIED: ProductCategory = { id: "other_unclassified", family: "Other", type: "Unclassified", synonyms: [] };
