/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Is this product a drug? What a listing or a label says

   A product is a drug here only when the product itself says so. Three signs, and nothing inferred from its ingredients:
     1. a prescription notice: "Rx", "Prescription Required", "Rx only", "Schedule H";
     2. a "Drug Facts" panel on the label, or in the page text;
     3. a manufacturer named on the page that the owner has signed off as drug-only, never cosmetic (DRUG_ONLY_MANUFACTURERS).
   A prescription notice makes it a prescription drug. The other two make it a drug (an OTC product carries a Drug Facts panel without needing a prescription), so
   they never say "prescription".

   Pure. The text comes from where we read it: the product's name and category and the retailers' listing notes (all that a stored review keeps), and, while a new
   analysis runs, the product page and the label artwork.

   Precision first: a cosmetic taken for a drug disappears from the lists. So a prescription phrase is accepted only as a whole phrase, and not when it is negated ("not a
   prescription drug", "no prescription needed") or is another sentence ("most prescribed", "IMS Prescription Audit"). A bare "Rx" is accepted only in a short field
   (a name, a category, a listing note): on a whole page it turns up in menus.
──────────────────────────────────────────────────────────────── */

import { DRUG_ONLY_MANUFACTURERS } from "@/lib/analyser-x/kb";

export interface DrugNotice {
  kind: "prescription-drug" | "drug";
  why: "rx" | "drug-facts" | "drug-manufacturer";
  /** The words that gave it away, as printed, for the record. */
  text: string;
}

export interface DrugSignalInput {
  /** Short fields: the product's name and category, and the retailers' listing notes. */
  productName?: string | null;
  category?: string | null;
  listingNotes?: readonly string[] | null;
  /** Long text: the product page, and what was read off the label artwork. */
  pageText?: string | null;
  labelText?: string | null;
}

const RX_PHRASE_RE = /\bprescription[\s-]+(?:required|only|needed|medicine|medication|drug)\b|\brx[\s-]+only\b|\bschedule[\s-]+(?:h1?|x)\b|\b(?:requires?|needs?)\s+(?:a\s+)?(?:valid\s+)?prescription\b|\bon\s+the\s+advice\s+of\s+a\s+registered\s+medical\s+practitioner\b/gi;
const RX_TOKEN_RE = /\brx\b/i;
const DRUG_FACTS_RE = /\bdrug\s+facts\b/i;
/** A negation shortly before a phrase, in the same sentence: "is not a ", "No ", "does not require a ". */
const NEGATED_BEFORE_RE = /\b(?:no|not|non|without|never|neither|nor|doesn['’]?t|don['’]?t|isn['’]?t|aren['’]?t)\b[^.\n;!?]{0,30}$/i;

/** The first prescription phrase in the text that is not negated, as printed. */
export function rxPhraseIn(text: string): string | null {
  for (const m of text.matchAll(RX_PHRASE_RE)) {
    if (!NEGATED_BEFORE_RE.test(text.slice(Math.max(0, (m.index ?? 0) - 40), m.index ?? 0))) return m[0];
  }
  return null;
}

/** Manufacturer names a page prints: "Manufactured by: X", "Marketed by X", "Manufacturer: X". */
const MAKER_BY_RE = /\b(?:manufactured|marketed|mfd\.?|mfg\.?|distributed)\s*(?:&\s*marketed\s*)?by\s*:?\s*([^\n|•]{3,90}?)(?=\s*(?:[,.|•\n]|$))/gi;
const MAKER_LABEL_RE = /\bmanufacturer(?:\s+name)?\s*:\s*([^\n|•]{3,90}?)(?=\s*(?:[,.|•\n]|$))/gi;
export function manufacturersIn(text: string): string[] {
  const out = new Set<string>();
  for (const re of [MAKER_BY_RE, MAKER_LABEL_RE]) for (const m of text.matchAll(re)) out.add(m[1].trim());
  return [...out];
}

export function drugNoticeOf(p: DrugSignalInput): DrugNotice | null {
  const short = [p.productName, p.category, ...(p.listingNotes ?? [])].filter((t): t is string => !!t && !!t.trim());
  const long = [p.pageText, p.labelText].filter((t): t is string => !!t && !!t.trim());

  for (const t of short) {
    const phrase = rxPhraseIn(t);
    if (phrase) return { kind: "prescription-drug", why: "rx", text: phrase };
    const token = t.match(RX_TOKEN_RE);
    if (token) return { kind: "prescription-drug", why: "rx", text: token[0] };
  }
  for (const t of long) {
    const phrase = rxPhraseIn(t);
    if (phrase) return { kind: "prescription-drug", why: "rx", text: phrase };
  }
  for (const t of [...short, ...long]) {
    const facts = t.match(DRUG_FACTS_RE);
    if (facts) return { kind: "drug", why: "drug-facts", text: facts[0] };
  }
  const signed = DRUG_ONLY_MANUFACTURERS.filter((m) => m.reviewed && m.source.trim());
  if (signed.length) {
    for (const t of long) {
      for (const maker of manufacturersIn(t)) {
        const hit = signed.find((m) => { m.re.lastIndex = 0; return m.re.test(maker); });
        if (hit) return { kind: "drug", why: "drug-manufacturer", text: maker };
      }
    }
  }
  return null;
}
