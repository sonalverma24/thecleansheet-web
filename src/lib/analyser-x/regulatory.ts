/* ────────────────────────────────────────────────────────────────
   Analyser vX · the regulatory benchmark

   "Is this product up to the standards of the EU, Australia, and the other major markets?"
   For every declared ingredient and every authority, the existing ingredient database says
   what that authority says. This module reads those words conservatively into a small
   vocabulary, so that "appears on a list" and "is a problem" are never confused:

     prohibited            the authority prohibits it (from a row we trust)
     restricted_exceeded   permitted up to a limit, and the product itself states more
     restricted_ok         permitted up to a limit, and the stated strength is within it
     restricted_unverifiable  permitted under conditions we cannot check from public information
     permitted             listed as permitted, or not restricted
     not_covered           not in the database, or the authority's field says "not listed"
     low_confidence        the row is graded low confidence, so it can never block

   A watchlist is not a verdict. The statuses are data; the rules decide what they may drive.
──────────────────────────────────────────────────────────────── */

import { hasUnnegatedMatch, lookupIngredient, parseMaxPct, readsAsBan, rowLooksValid } from "@/lib/ingredient-db";
import { statusAppliesTo, type ProductScope } from "@/lib/product-scope";
import type { Ingredient } from "@/lib/ingredient-utils";
import type { Authority, AuthorityResult, BenchmarkValue, RegStatus } from "./types";

export const AUTHORITIES: Authority[] = ["EU", "IN", "US", "KR", "AU", "CA"];

export const AUTHORITY_LABEL: Record<Authority, string> = {
  EU: "EU Cosmetics Regulation (EC) 1223/2009",
  IN: "India Cosmetics Rules 2020",
  US: "US FDA (21 CFR)",
  KR: "South Korea MFDS",
  AU: "Australia (AICIS and TGA)",
  CA: "Canada (Health Canada)",
};

/** How an authority reads inside a sentence. */
export const AUTHORITY_SHORT: Record<Authority, string> = {
  EU: "the EU", IN: "India", US: "the US", KR: "South Korea", AU: "Australia", CA: "Canada",
};

export const shortList = (a: Authority[]): string => {
  const names = a.map((x) => AUTHORITY_SHORT[x]);
  return names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
};

/** Which fields of a database row carry each authority's words and numeric limit. */
const FIELDS: Record<Authority, { status: (r: Ingredient) => string; max?: (r: Ingredient) => string }> = {
  EU: { status: (r) => r.EU_Status, max: (r) => r.Max_Concentration_EU },
  IN: { status: (r) => r.India_Status, max: (r) => r.Max_Concentration_India },
  US: { status: (r) => r.US_FDA_Status, max: (r) => r.Max_Concentration_US ?? "" },
  KR: { status: (r) => r.Korea_Status, max: (r) => r.Max_Concentration_Korea ?? "" },
  AU: { status: (r) => r.Australia_TGA_Status ?? "" },
  CA: { status: (r) => r.Canada_NHPID_Status ?? "" },
};

export type WordClass = "prohibited" | "restricted" | "permitted" | "not_covered";

/** Read one authority's free-text status, for a product of this kind. Order matters: a ban outranks a restriction outranks a permission. A ban or a
    restriction that names a kind of product ("EU BANNED in rinse-off products", "restricted in rinse-off", "regulated as a primary sunscreen active
    when SPF claims are made") speaks only to that kind: for any other product it is read as permitted. With no product given, it speaks to all. */
export function classifyWords(text: string | undefined, scope?: ProductScope): WordClass {
  const c = classifyAll(text);
  return (c === "prohibited" || c === "restricted") && !statusAppliesTo(text, scope) ? "permitted" : c;
}

function classifyAll(text: string | undefined): WordClass {
  const t = (text ?? "").trim();
  if (!t) return "not_covered";
  if (readsAsBan(t)) return "prohibited";
  // Restricted: listed with conditions, or a medicine framework applies (prescription, over-the-counter, registration).
  if (hasUnnegatedMatch(t, /\brestricted\b|\bwith restrictions?\b|\bannex\s*(?:iii|iv|v|vi)\b|\bprimary sunscreen\b|\bartg\b|\bnpn\b|\bschedule h\b|\bprescription\b|\brx only\b|\botc\b|\bfunctional cosmetic\b/)) return "restricted";
  // "Not specifically listed as restricted", "no Annex restriction identified": the words appear, negated.
  if (/\b(?:not|no)\b[^.;]*\b(?:restricted|restriction|prohibited|banned)\b/i.test(t)) return "permitted";
  // "Cosmetic preservative; TGA cosmetic use acceptable", "Cosmetic humectant; no TGA relevance": a cosmetic ingredient.
  if (/^cosmetic\b/i.test(t) || /\b(permitted|standard (?:tga )?cosmetic|cosmetic ingredient|exempt|gras|certifiable)\b/i.test(t)) return "permitted";
  return "not_covered";
}

const isLowConfidence = (r: Ingredient): boolean => /^low/i.test((r.Data_Confidence ?? "").trim());

/** A strength stated in the product name right next to the ingredient ("10% Niacinamide Serum"). Unknown is null:
    a bare percentage elsewhere in a multi-active name is never assigned to an ingredient. */
export function declaredStrength(productName: string, ingredient: string): number | null {
  const name = ingredient.toLowerCase().replace(/\([^)]*\)/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
  if (name.length < 4) return null;
  const esc = name.split(" ").map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+");
  // Adjacent only: "10% Niacinamide" or "Niacinamide 10%". A percentage elsewhere in the name belongs to something else.
  const before = new RegExp(`(\\d{1,2}(?:\\.\\d+)?)\\s*%\\s*(?:pure\\s+)?${esc}\\b`, "i").exec(productName);
  const after = new RegExp(`\\b${esc}\\s*[-(:]?\\s*(\\d{1,2}(?:\\.\\d+)?)\\s*%`, "i").exec(productName);
  const m = before ?? after;
  return m ? parseFloat(m[1]) : null;
}

/** A limit we can compare with a product name: ONE number and no condition on where, on whom or how it is used. In the
    current database only 1 of the 44 EU-restricted rows is this simple; the rest read like "1% face max; 0.5% hands max",
    where the limit depends on the product's use. Those stay unverifiable until the database holds structured conditions. */
export function limitIsSimple(text: string | undefined): boolean {
  const t = (text ?? "").trim();
  if (!t || /\//.test(t)) return false;
  if ((t.match(/\d+(?:\.\d+)?\s*%/g) ?? []).length !== 1) return false;
  return !/\b(leave|rinse|face|facial|body|hair|nappy|baby|infant|eye|lip|oral|spray|aerosol|nail|professional|children|hands?|combined|mixture|single)\b/i.test(t);
}

export type Lookup = (name: string) => Ingredient | undefined;

export interface IngredientStatus { status: RegStatus; limit?: number; declared?: number }

export interface IngredientRegulation {
  name: string;
  /** Found in the database with a row that passes its own validity check. */
  resolved: boolean;
  perAuthority: Record<Authority, IngredientStatus>;
}

const none = (): Record<Authority, IngredientStatus> =>
  Object.fromEntries(AUTHORITIES.map((a) => [a, { status: "not_covered" as RegStatus }])) as Record<Authority, IngredientStatus>;

export function regulationOf(name: string, productName: string, lookup: Lookup = lookupIngredient, scope?: ProductScope): IngredientRegulation {
  const row = lookup(name);
  if (!row || !rowLooksValid(row)) return { name, resolved: false, perAuthority: none() };

  const per = none();
  for (const a of AUTHORITIES) {
    const f = FIELDS[a];
    let cls = classifyWords(f.status(row), scope);
    // Annex II is the prohibited list, but a field that says "Not listed in Annex II to VI" names it to say the ingredient is NOT on it.
    if (a === "EU" && hasUnnegatedMatch((row.EU_Annex ?? "").trim(), /\bii\b/)) cls = "prohibited";
    if ((cls === "prohibited" || cls === "restricted") && isLowConfidence(row)) { per[a] = { status: "low_confidence" }; continue; }
    if (cls === "restricted") {
      const limitText = f.max ? f.max(row) : "";
      const limit = limitIsSimple(limitText) ? parseMaxPct(limitText) : null;
      const declared = declaredStrength(productName, row.INCI_Name || name);
      per[a] = limit != null && declared != null
        ? { status: declared > limit ? "restricted_exceeded" : "restricted_ok", limit, declared }
        : { status: "restricted_unverifiable", ...(limit != null ? { limit } : {}) };
    } else {
      per[a] = { status: cls };
    }
  }
  return { name: row.INCI_Name || name, resolved: true, perAuthority: per };
}

const emptyResult = (): AuthorityResult => ({ verdict: "unverified", prohibited: [], exceeded: [], unverifiable: [], notCovered: [], lowConfidence: [] });

/** Every declared ingredient against every authority. Pure; reads only the existing database. */
export function computeBenchmark(
  inci: string[], productName: string, lookup: Lookup = lookupIngredient,
  /** Prohibitions the screen found that the database does not hold (the backstop list), with who prohibits them. The panel
      must not say "not fully checked" about an ingredient the reasons call prohibited. */
  backstop: { name: string; authorities: Authority[] }[] = [],
  /** What kind of product it is, so a status that names a kind of product is read only for that kind. */
  scope?: ProductScope,
): BenchmarkValue {
  const regs = inci.map((n) => regulationOf(n, productName, lookup, scope));
  const authorities = Object.fromEntries(AUTHORITIES.map((a) => [a, emptyResult()])) as Record<Authority, AuthorityResult>;
  for (const reg of regs) {
    for (const a of AUTHORITIES) {
      const s = reg.perAuthority[a];
      const r = authorities[a];
      if (s.status === "prohibited") r.prohibited.push(reg.name);
      else if (s.status === "restricted_exceeded") r.exceeded.push({ name: reg.name, limit: s.limit as number, declared: s.declared as number });
      else if (s.status === "restricted_unverifiable") r.unverifiable.push(reg.name);
      else if (s.status === "not_covered") r.notCovered.push(reg.name);
      else if (s.status === "low_confidence") r.lowConfidence.push(reg.name);
    }
  }
  for (const b of backstop) {
    for (const a of b.authorities) {
      const r = authorities[a];
      r.notCovered = r.notCovered.filter((n) => n.toLowerCase() !== b.name.toLowerCase());
      if (!r.prohibited.some((n) => n.toLowerCase() === b.name.toLowerCase())) r.prohibited.push(b.name);
    }
  }
  for (const a of AUTHORITIES) {
    const r = authorities[a];
    r.verdict = inci.length === 0 ? "unverified"
      : r.prohibited.length || r.exceeded.length ? "falls_short"
      : r.unverifiable.length || r.notCovered.length || r.lowConfidence.length ? "unverified"
      : "meets";
  }
  return { authorities, resolved: regs.filter((r) => r.resolved).length, total: regs.length };
}

/** The authorities whose own words prohibit an ingredient, for the sentence that names the jurisdiction. Reads the
    database row; for a name the database lacks (the backstop list) it reads the note. */
export function prohibitingAuthorities(name: string, note: string, scope?: ProductScope): Authority[] {
  const reg = regulationOf(name, "", lookupIngredient, scope);
  const fromRow = AUTHORITIES.filter((a) => reg.perAuthority[a].status === "prohibited");
  if (fromRow.length) return fromRow;
  const out: Authority[] = [];
  if (/\bEU\b/.test(note)) out.push("EU");
  if (/\bIndia\b/i.test(note)) out.push("IN");
  return out;
}

/** The ingredients the database cannot resolve, for the screen. */
export const unresolvedIn = (inci: string[]): string[] => inci.filter((n) => !regulationOf(n, "").resolved);
