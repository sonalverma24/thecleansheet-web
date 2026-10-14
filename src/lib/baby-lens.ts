/* ────────────────────────────────────────────────────────────────
   Baby lens: a deterministic, code-only check of a product's INCI list and
   labelled age against ingredients that are restricted or avoided in products
   for babies and young children. Like deriveVerdict, it never asks a model.

   It only answers "does anything on this INCI list conflict with the rules
   below for the age on the label". It cannot see concentrations, so rules that
   depend on a limit (e.g. phenoxyethanol) are notes, not blocks.

   THE RULE LIST NEEDS OWNER SIGN-OFF before the result is relied on for a public
   claim. Each rule carries its reason so it can be reviewed line by line.
──────────────────────────────────────────────────────────────── */

export interface BabyFlag {
  ingredient: string;
  /** "block" fails the lens; "note" is shown to reviewers but does not fail. */
  severity: "block" | "note";
  why: string;
}

export interface BabyLensResult {
  /** True when no blocking flag applies for the labelled age. */
  pass: boolean;
  /** Human text for the popup chips, e.g. "From birth" or "Ages 3 to 15". */
  ageText: string | null;
  /** Youngest age the label implies, in months; null when no age is stated. */
  minAgeMonths: number | null;
  flags: BabyFlag[];
  fragranceFree: boolean;
}

interface Rule {
  test: RegExp;
  severity: BabyFlag["severity"];
  /** Rule applies only when the youngest labelled age is below this many months. */
  underMonths?: number;
  why: string;
}

const RULES: Rule[] = [
  { test: /\b(methylisothiazolinone|methylchloroisothiazolinone)\b/, severity: "block",
    why: "Strong skin sensitiser, avoided in products for infant skin." },
  { test: /\b(propylparaben|butylparaben|isopropylparaben|isobutylparaben|phenylparaben|benzylparaben|pentylparaben)\b/, severity: "block",
    why: "Restricted under EU rules in leave-on baby products for the nappy area; avoided across baby products." },
  { test: /\b(camphor|menthol|mentha piperita|peppermint|eucalyptus)\b/, severity: "block", underMonths: 36,
    why: "Can affect breathing in children under 3; not suitable for the youngest ages." },
  { test: /\bsalicylic acid\b/, severity: "block", underMonths: 36,
    why: "Not for use in preparations for children under 3 (EU cosmetics rules), except shampoos." },
  { test: /\b(triclosan|triclocarban|formaldehyde|hydroquinone)\b/, severity: "block",
    why: "Not acceptable in a baby product." },
  { test: /\bphenoxyethanol\b/, severity: "note",
    why: "Preservative with a lower recommended limit for nappy-area products for under 3s; concentration not visible from the INCI." },
  { test: /\b(dmdm hydantoin|quaternium-15|imidazolidinyl urea|diazolidinyl urea)\b/, severity: "note",
    why: "Formaldehyde-releasing preservative, a known sensitiser." },
  { test: /\b(alcohol denat|sd alcohol|isopropyl alcohol)\b/, severity: "note",
    why: "Drying alcohol; check suitability for leave-on use on infant skin." },
];

const FRAGRANCE = /\b(parfum|fragrance|aroma)\b/;

function norm(s: string): string {
  return s.toLowerCase().replace(/\(.*?\)/g, " ").replace(/[^a-z0-9\- ]+/g, " ").replace(/\s+/g, " ").trim();
}

/** Youngest age the product name or target text implies. Conservative: a plain
    "baby" product is treated as "from birth" so the strictest rules apply. */
export function parseLabelAge(...texts: (string | undefined | null)[]): { ageText: string | null; minAgeMonths: number | null } {
  const t = texts.filter(Boolean).join(" | ").toLowerCase();

  const months = t.match(/\b(\d{1,2})\s*(?:\+|-|to|–)?\s*(?:\d{1,2})?\s*months?\b/);
  if (months) return { ageText: `From ${months[1]} months`, minAgeMonths: Number(months[1]) };

  const range = t.match(/\bages?\s*(\d{1,2})\s*(?:-|to|–)\s*(\d{1,2})\b/) ?? t.match(/\b(\d{1,2})\s*(?:-|to|–)\s*(\d{1,2})\s*years?\b/);
  if (range) return { ageText: `Ages ${range[1]} to ${range[2]}`, minAgeMonths: Number(range[1]) * 12 };

  const plus = t.match(/\b(\d{1,2})\s*\+\s*(?:years?|yrs?)\b/) ?? t.match(/\b(?:above|over|from)\s*(\d{1,2})\s*years?\b/);
  if (plus) return { ageText: `Ages ${plus[1]} and above`, minAgeMonths: Number(plus[1]) * 12 };

  if (/\b(newborn|new born|from birth|0\s*\+)\b/.test(t)) return { ageText: "From birth", minAgeMonths: 0 };
  if (/\b(baby|babies|infant|toddler)\b/.test(t)) return { ageText: "Baby", minAgeMonths: 0 };
  if (/\b(kids?|child|children|junior)\b/.test(t)) return { ageText: "Kids", minAgeMonths: null };
  return { ageText: null, minAgeMonths: null };
}

export function babyLens(input: { productName: string; targetUser?: string; inci: string[] }): BabyLensResult {
  const { ageText, minAgeMonths } = parseLabelAge(input.productName, input.targetUser);
  // No stated age (or a vague "kids") is judged as if for the youngest users.
  const effectiveMin = minAgeMonths ?? 0;

  const flags: BabyFlag[] = [];
  let fragrance = false;
  for (const raw of input.inci) {
    const name = norm(raw);
    if (FRAGRANCE.test(name)) fragrance = true;
    for (const r of RULES) {
      if (!r.test.test(name)) continue;
      if (r.underMonths != null && effectiveMin >= r.underMonths) continue;
      flags.push({ ingredient: raw.trim(), severity: r.severity, why: r.why });
    }
  }

  return {
    pass: input.inci.length > 0 && !flags.some((f) => f.severity === "block"),
    ageText,
    minAgeMonths,
    flags,
    fragranceFree: input.inci.length > 0 && !fragrance,
  };
}
