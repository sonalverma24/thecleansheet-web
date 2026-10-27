/* ────────────────────────────────────────────────────────────────
   Analyser Version X1 · the knowledge base the rules read

   Data, not logic. Each table carries the owner who must review it. Changing a
   table is a rule change: it needs a preview and a sign-off, like any other.
──────────────────────────────────────────────────────────────── */

/** Mirrors LICENSED_DRUG_ACTIVES in src/lib/product-review-engine.ts (14 named actives plus azelaic acid at
    15% or more). Export that constant from the engine and import it here so there is one list. */
export const DRUG_ACTIVES: { re: RegExp; name: string; minConcentration?: number }[] = [
  { re: /ketoconazole/i, name: "Ketoconazole" },
  { re: /\bminoxidil\b/i, name: "Minoxidil" },
  { re: /selenium\s+sul(f|ph)ide/i, name: "Selenium sulfide" },
  { re: /coal\s+tar/i, name: "Coal tar" },
  { re: /\bclindamycin\b/i, name: "Clindamycin" },
  { re: /\berythromycin\b/i, name: "Erythromycin" },
  { re: /benzoyl\s+peroxide/i, name: "Benzoyl peroxide" },
  { re: /\btretinoin\b|retinoic\s+acid/i, name: "Tretinoin" },
  { re: /\badapalene\b/i, name: "Adapalene" },
  { re: /\bciclopirox\b/i, name: "Ciclopirox" },
  { re: /\bmupirocin\b/i, name: "Mupirocin" },
  { re: /\bterbinafine\b/i, name: "Terbinafine" },
  { re: /\bfluconazole\b/i, name: "Fluconazole" },
  { re: /\bpermethrin\b/i, name: "Permethrin" },
  { re: /azelaic\s+acid/i, name: "Azelaic acid", minConcentration: 15 },
];

/** Wording that marks a product as a prescription medicine. Read from the product name and page text. */
export const RX_TEXT_RE = /\bprescription\b|\brx\s+only\b|\bschedule\s+(?:h1?|x)\b|\bon\s+the\s+advice\s+of\s+a\s+registered\s+medical\s+practitioner\b/i;

/** Manufacturers licensed to make drugs only, never cosmetics. A product page or label that names one as its maker marks the product as a drug (src/lib/drug-signals.ts).
    OWNER-SIGNED, LIKE EVERY TABLE HERE: an entry counts only with `reviewed: true` and a `source` that shows the maker holds a drug licence and no cosmetic one (a licensing
    register entry, the maker's own statement). A group that also sells cosmetics under the same name does not belong here. Empty until the owner supplies the list. */
export interface DrugOnlyManufacturer { name: string; re: RegExp; source: string; reviewed: boolean }
export const DRUG_ONLY_MANUFACTURERS: DrugOnlyManufacturer[] = [];

/** Category family that is itself a medicine class in the closed category list. */
export const MEDICINAL_FAMILIES = ["OTC (Eczema)"] as const;

/** Days after which an analysis is shown as possibly out of date. Owner decision D10. */
export const STALE_DAYS = 180;

/** SPF below this is treated as thin for daily outdoor use in India. Matches the prompt's own rule. */
export const SPF_MINIMUM = 30;

/** Fewer than this share of ingredients recognised by the database means the safety screen is incomplete. */
export const MIN_SCREEN_COVERAGE = 0.5;

/** Independent-lab and ladder tables live in ladder.ts. */

/* ── Audience rules ───────────────────────────────────────────────
   STARTER TABLE. Every entry is `reviewed: false` until a qualified reviewer signs it, and an unreviewed rule
   can only raise a caution. It can never produce Look elsewhere. See Part 6 of the master file. */
export interface AudienceRule {
  id: string;
  audience: "baby" | "sensitive";
  /** Matches an ingredient name in the list. */
  ingredient: RegExp;
  note: string;
  /** Citation the reviewer attached. Empty until reviewed. */
  source: string;
  reviewed: boolean;
}

export const AUDIENCE_RULES: AudienceRule[] = [
  { id: "aud.baby.isothiazolinone", audience: "baby", ingredient: /\b(?:methyl)?(?:chloro)?isothiazolinone\b/i, note: "a preservative with a recognised record of skin sensitisation", source: "", reviewed: false },
  { id: "aud.baby.fragrance", audience: "baby", ingredient: /^(?:parfum|fragrance|aroma)\b/i, note: "added fragrance, a common contact allergen", source: "", reviewed: false },
  { id: "aud.sensitive.sulphate", audience: "sensitive", ingredient: /\bsodium (?:lauryl|laureth) sulf(?:ate|ates)\b|\bsodium lauryl sulphate\b/i, note: "a sulphate surfactant that can be drying or irritating for some people", source: "", reviewed: false },
  { id: "aud.sensitive.fragrance", audience: "sensitive", ingredient: /^(?:parfum|fragrance|aroma)\b/i, note: "added fragrance, a common contact allergen", source: "", reviewed: false },
];

export const BABY_RE = /\b(baby|babies|infant|newborn|toddler|kids?|child(?:ren)?)\b/i;
export const SENSITIVE_RE = /\b(sensitive|gentle|dermatolog\w*|hypoallergenic|reactive)\b/i;

/* ── Global benchmark ─────────────────────────────────────────────
   Which authorities' prohibitions may drive Look elsewhere. Today's engine blocks on the EU and India only; the other
   authorities are shown on the page and, here, can raise a caution. Owner decision X19. */
export const BLOCKING_AUTHORITIES = ["EU", "IN"] as const;

/* ── How the same product type is regulated elsewhere ─────────────
   STARTER TABLE, from the regulators' own pages (see Part 16 of the specification). Every row is `reviewed: false` until
   a regulatory reviewer signs it. A row only produces a NOTE: it never changes the buying decision. */
export interface FrameworkNote {
  id: string;
  /** Matches the product's name and category. */
  test: RegExp;
  /** How the product type is treated elsewhere, in a phrase that follows "it is regulated". */
  elsewhere: { authority: "US" | "AU" | "CA" | "EU"; as: string }[];
  source: string;
  reviewed: boolean;
}

export const FRAMEWORK_NOTES: FrameworkNote[] = [
  {
    id: "fw.sunscreen", test: /\b(?:sunscreen|sun\s?block|spf\s?\d)/i,
    elsewhere: [
      { authority: "US", as: "as an over-the-counter drug" },
      { authority: "AU", as: "as a therapeutic good when sun protection is its main purpose" },
    ],
    source: "https://www.fda.gov/cosmetics/laws-regulations/it-cosmetic-drug-or-both-or-it-soap ; https://www.tga.gov.au/resources/resource/reference-material/australian-regulatory-guidelines-sunscreens-args",
    reviewed: false,
  },
  {
    id: "fw.anti_dandruff", test: /\b(?:anti[\s-]?dandruff|dandruff)\b/i,
    elsewhere: [{ authority: "US", as: "as both a cosmetic and an over-the-counter drug" }],
    source: "https://www.fda.gov/cosmetics/laws-regulations/it-cosmetic-drug-or-both-or-it-soap",
    reviewed: false,
  },
];

/** Hosts of official registers. A brand page that says "we are on the register" is not the register: only a page on a
    regulator's own site can support "listed on". STARTER pattern, reviewed with the regulatory reviewer. */
export const REGULATOR_HOST = /(^|\.)(gov\.au|nih\.gov|fda\.gov|canada\.ca|gc\.ca|europa\.eu|gov\.in|nic\.in|gov\.uk)$/i;

/** What a medicine register is called in a sentence. */
export const REGISTER_NAMES: Record<string, string> = {
  ARTG: "Australian Register of Therapeutic Goods",
  DailyMed: "US DailyMed",
  "Drugs@FDA": "US Drugs@FDA",
  DPD: "Health Canada Drug Product Database",
  LNHPD: "Health Canada Licensed Natural Health Products Database",
  "Union Register": "Union Register of medicinal products",
};
