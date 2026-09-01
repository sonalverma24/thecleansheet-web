/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Ingredient database accessor (canonical)
   One robust, validity-guarded lookup over the 734-ingredient
   reference database (src/data/ingredients.json). Every consumer -
   the ingredient list display, the 10-authority screen, the category
   safety screen, and the stamp's banned-ingredient gate - reads real
   regulatory status, hazard flags, restrictions and dose limits from
   HERE, instead of scattered hand-kept stem lists.

   A wrong safety flag is the worst possible error, so a row is only
   trusted when its fields are sane (rowLooksValid) and matching is
   exact on a normalised name - never a fuzzy guess.
──────────────────────────────────────────────────────────────── */

import { ALL_INGREDIENTS, type Ingredient } from "@/lib/ingredient-utils";

/* Case/format-insensitive key. Handles "Aqua/Water", "Aqua (Water)",
   zero-width chars, punctuation. */
export function normIngredient(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/​/g, "")
    .replace(/\([^)]*\)/g, "")
    .split("/")[0]
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/* Some rows suffer column drift (a Function of "2", a Concern level that is
   actually a function word). Never trust such a row's safety flags. */
export function rowLooksValid(r: Ingredient): boolean {
  const concern = (r.Concern_Level_TCS || "").toLowerCase().trim();
  const svhc = (r.SVHC_Flag || "").toLowerCase().trim();
  const func = (r.Function || "").trim();
  const concernOk = concern === "" || /^(low|medium|moderate|high|very high|none|n\/?a)$/.test(concern);
  const svhcOk = svhc === "" || /^(yes|no|none|n\/?a|0|0\.0+)$/.test(svhc);
  const funcOk = func === "" || /[a-z]{3}/i.test(func);
  return concernOk && svhcOk && funcOk;
}

const INDEX: Map<string, Ingredient> = (() => {
  const m = new Map<string, Ingredient>();
  const rank = (r: Ingredient, key: string) => {
    const raw = (r.INCI_Name || "").toLowerCase();
    let s = 0;
    if (/[()]/.test(raw)) s += 5;
    if (raw.includes("/")) s += 3;
    if (!rowLooksValid(r)) s += 50;
    s += Math.abs(raw.replace(/[^a-z0-9]/g, "").length - key.replace(/ /g, "").length);
    return s;
  };
  for (const row of ALL_INGREDIENTS) {
    if (!row.INCI_Name) continue;
    const key = normIngredient(row.INCI_Name);
    const existing = m.get(key);
    if (!existing || rank(row, key) < rank(existing, key)) m.set(key, row);
  }
  return m;
})();

/** Exact normalised lookup. Returns the canonical DB row or undefined. */
export function lookupIngredient(name: string): Ingredient | undefined {
  return INDEX.get(normIngredient(name));
}

/* ─── Field parsers ─── */
const isYes = (s?: string) => /^(yes|present|group\s*(1|2a|2b))/i.test((s || "").trim());
const iarcGroup = (s?: string) => (/(group\s*(1|2a|2b))/i.exec(s || "")?.[1] ?? null);

/** A concentration field ("1%", "0.3 %", "No limit") -> percent number or null
    (null = no numeric cap, e.g. "No limit" or absent). */
export function parseMaxPct(s?: string): number | null {
  const t = (s || "").trim();
  if (!t || /no limit|no specific|not specified|not identified|standard/i.test(t)) return null;
  const m = /(\d+(?:\.\d+)?)\s*%/.exec(t);
  return m ? parseFloat(m[1]) : null;
}

/* Prohibition detection: EU Annex II (prohibited list) or an explicit
   prohibited status. Deliberately conservative and negation-aware. */
function statusProhibited(s?: string): boolean {
  const t = (s || "").toLowerCase();
  if (!t) return false;
  if (/permitted|not specifically|not listed|no specific|no restriction|standard/.test(t) && !/\bprohibited\b|\bbanned\b/.test(t)) return false;
  return /\bprohibited\b|\bbanned\b/.test(t);
}
export function isProhibited(r: Ingredient): boolean {
  if (!rowLooksValid(r)) return false;
  const annex = (r.EU_Annex || "").trim();
  if (/\bII\b/.test(annex)) return true;                 // EU Annex II = prohibited
  return statusProhibited(r.EU_Status) || statusProhibited(r.India_Status);
}

export interface IngredientSafety {
  found: boolean;
  valid: boolean;
  functions: string;
  allergen: boolean;
  endocrine: boolean;
  cmr: boolean;
  iarc: string | null;
  prohibited: boolean;
  maxPctEU: number | null;
  maxPctIndia: number | null;
  ifra: string | null;
  babyRestriction: string | null;
  pregnancyRestriction: string | null;
  concern: string;
  note: string;
  source: string;
  confidence: string;
}

/** The safety read for one ingredient name, straight from the DB. Absence or an
    untrustworthy row yields all-false (unknown), never a fabricated concern. */
export function ingredientSafety(name: string): IngredientSafety {
  const r = lookupIngredient(name);
  const blank: IngredientSafety = {
    found: false, valid: false, functions: "", allergen: false, endocrine: false, cmr: false,
    iarc: null, prohibited: false, maxPctEU: null, maxPctIndia: null, ifra: null,
    babyRestriction: null, pregnancyRestriction: null, concern: "", note: "", source: "", confidence: "",
  };
  if (!r) return blank;
  const valid = rowLooksValid(r);
  if (!valid) return { ...blank, found: true, valid: false, functions: (r.Function || "").trim() };
  const clean = (s?: string) => { const t = (s || "").trim(); return t && !/^(no|none|n\/?a|not\b)/i.test(t) ? t : null; };
  return {
    found: true,
    valid: true,
    functions: (r.Function || "").trim(),
    allergen: isYes(r.Allergen_Flag),
    endocrine: /^yes/i.test((r.Endocrine_Flag || "").trim()),
    cmr: /group\s*1|group\s*2|^yes/i.test((r.CMR_Flag || "").trim()),
    iarc: iarcGroup(r.IARC_Group),
    prohibited: isProhibited(r),
    maxPctEU: parseMaxPct(r.Max_Concentration_EU),
    maxPctIndia: parseMaxPct(r.Max_Concentration_India),
    ifra: clean(r.IFRA_Restriction),
    babyRestriction: clean(r.Baby_Restriction),
    pregnancyRestriction: clean(r.Pregnancy_Restriction),
    concern: (r.Concern_Level_TCS || "").trim(),
    note: ((r.Key_Safety_Notes || "").split(/;|\./)[0] || "").trim(),
    source: (r.Source_Reference || "").trim(),
    confidence: (r.Data_Confidence || "").trim(),
  };
}

/** Prohibited-in-cosmetics ingredients present in an INCI list, from the DB
    (union with a small always-on backstop for names the DB may miss). Powers
    the stamp's hard safety gate. */
const BACKSTOP_BANNED: { stem: string; note: string }[] = [
  { stem: "hydroquinone", note: "Prohibited in cosmetics (EU Annex II); permitted only as a regulated drug." },
  { stem: "butylphenyl methylpropional", note: "Lilial - prohibited in EU cosmetics since 2022." },
  { stem: "hydroxyisohexyl 3-cyclohexene carboxaldehyde", note: "Lyral (HICC) - prohibited in EU cosmetics since 2021." },
  { stem: "mercury", note: "Mercury compounds are prohibited in cosmetics (EU Annex II)." },
  { stem: "lead acetate", note: "Lead acetate is prohibited in cosmetics (EU Annex II)." },
];

export function bannedIngredientsInInci(inci: string[]): { name: string; note: string }[] {
  const out: { name: string; note: string }[] = [];
  const seen = new Set<string>();
  for (const name of inci) {
    const r = lookupIngredient(name);
    if (r && isProhibited(r)) {
      const key = normIngredient(name);
      if (!seen.has(key)) { seen.add(key); out.push({ name: r.INCI_Name || name, note: (r.Key_Safety_Notes || "Prohibited in cosmetics.").split(/;|\./)[0].trim() }); }
    }
  }
  // Backstop by normalised token for prohibited names the DB may not carry.
  const joined = " " + inci.map(normIngredient).join(" | ") + " ";
  for (const b of BACKSTOP_BANNED) {
    if (joined.includes(` ${b.stem} `) || joined.includes(b.stem)) {
      if (!seen.has(b.stem)) { seen.add(b.stem); out.push({ name: b.stem, note: b.note }); }
    }
  }
  return out;
}
