/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · the "Watch for" line on a nearly-Green Yellow badge

   Owner rule (2026-11-23): a Yellow product that is Strong almost everywhere and is held back by one or two small things (added fragrance on a
   sensitive-skin product, one untested claim, wording a cosmetic cannot use in India) says what those things are, in one line, inside the Yellow badge.
   Every other Yellow keeps the plain Yellow wording.

   "Nearly Green" means:
     - the page is Yellow (Buy with caution);
     - no row is Concern or Not rated, and at most one row is short of the Green set (Test transparency at Fair is part of the Green set);
     - at most two cautions settled, each one a thing a shopper can act on (a row that is simply not Strong yet is not).
   The words come from the rule ids and their fixed parameters, never from a model. Pure.
──────────────────────────────────────────────────────────────── */

import type { Finding } from "@/lib/analyser-x/types";
import type { DecisionKey } from "@/lib/analyser-x";
import { NAME_SEP } from "@/lib/analyser-x/tags";

/** The most cautions a Yellow may carry and still say what they are. */
export const WATCH_MAX = 2;

/** A page row as the line needs it: its title, its colour, and its one-line summary. */
export interface WatchRow { title: string; marker: "green" | "yellow" | "red" | null; oneLiner: string }

const TEST_ROW = "Test transparency";

const str = (v: unknown): string => (v === undefined || v === null ? "" : String(v).trim());
/** A claim as the line quotes it: no closing full stop, and cut at a word when it is long. */
const clip = (t: string, n = 44): string => {
  const c = t.replace(/[.!\s]+$/, "");
  if (c.length <= n) return c;
  const cut = c.slice(0, n);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 20 ? cut.lastIndexOf(" ") : n).replace(/[\s,;:/&-]+$/, "")}…`;
};
const names = (v: unknown): string => str(v).split(NAME_SEP).map((s) => s.trim()).filter(Boolean).slice(0, 2).join(" and ");
const forWhom = (audience: unknown): string => (audience === "baby" ? "for a baby's skin" : "if your skin is sensitive");

/** The rows that keep the page from Green: anything not Strong, except a Fair Test transparency. */
const shortRows = (rows: readonly WatchRow[]): WatchRow[] =>
  rows.filter((r) => (r.title === TEST_ROW ? r.marker !== "green" && r.marker !== "yellow" : r.marker !== "green"));

/** A few words for one caution, or null when there is nothing short and true to say. */
function phraseOf(f: Finding, short: boolean): string | null {
  const p = f.params;
  switch (f.ruleId) {
    case "caution.audience": {
      const id = str(p.audienceRule);
      if (/fragrance/.test(id)) return `added fragrance, ${forWhom(p.audience)}`;
      if (/sulphate/.test(id)) return `a sulphate cleanser (${str(p.ingredient)}), ${forWhom(p.audience)}`;
      if (/isothiazolinone/.test(id)) return `a sensitising preservative (${str(p.ingredient)}), ${forWhom(p.audience)}`;
      return str(p.ingredient) ? `${str(p.ingredient)}, ${forWhom(p.audience)}` : null;
    }
    case "caution.soft_adverse": {
      const label = str(p.label);
      const who = names(p.ingredients);
      if (/comedogen/i.test(label)) return who ? `${who}, which may not suit very acne-prone skin` : "ingredients that may not suit very acne-prone skin";
      if (/endocrine/i.test(label)) return who ? `${who}, a silicone of environmental concern` : "a silicone of environmental concern";
      if (/preservative/i.test(label)) return who ? `${who}, a preservative that can sensitise skin` : "a preservative that can sensitise skin";
      return label ? (who ? `${label.toLowerCase()} (${who})` : label.toLowerCase()) : null;
    }
    case "caution.claim_gap": {
      // Beside another caution the example is left out, so the line stays one line.
      if (Number(p.count) > 1) return short ? `${str(p.count)} claims with no public test` : `${str(p.count)} claims with no public test, such as “${clip(str(p.claim))}”`;
      return short ? "one claim with no public test" : `“${clip(str(p.claim))}”, a claim with no public test`;
    }
    case "caution.boundary":
      return "some wording goes further than a cosmetic may claim in India";
    case "caution.free_from_unverified":
      return `the “${clip(str(p.claim), 32)}” claim beside ${str(p.ingredient)} in the list`;
    case "caution.catch_all":
      return `an unnamed entry in the list (${str(p.entry)})`;
    case "caution.spf_low":
      return `SPF ${str(p.spf)}, too low for daily outdoor use in India`;
    case "caution.formula":
      return "the formula may not deliver every claim";
    case "caution.list_trust_2":
      return "the ingredient list is from a retailer only, so check the pack";
    case "caution.benchmark_gap":
      return str(p.authority) ? `an ingredient another market (${str(p.authority)}) restricts` : null;
    // caution.rows (one row simply not Strong yet, nothing found) has no phrase: there is nothing for a shopper to watch for.
    default:
      return null;
  }
}

/** Ingredient cautions lead: they are what a shopper acts on. */
const ORDER = ["caution.audience", "caution.soft_adverse", "caution.spf_low", "caution.free_from_unverified", "caution.catch_all", "caution.benchmark_gap", "caution.boundary", "caution.claim_gap", "caution.formula", "caution.list_trust_2"];
const rank = (id: string): number => { const i = ORDER.indexOf(id); return i < 0 ? ORDER.length : i; };

/** The one line, starting "Watch for:", or null when the page is not a nearly-Green Yellow. */
export function watchLineOf(key: DecisionKey, settled: readonly Finding[], rows: readonly WatchRow[] | null): string | null {
  if (key !== "buy-with-caution" || !rows?.length) return null;
  if (rows.some((r) => r.marker === "red" || r.marker === null)) return null;
  if (shortRows(rows).length > 1) return null;
  const cautions = settled.filter((f) => f.severity === "caution");
  if (!cautions.length || cautions.length > WATCH_MAX) return null;
  const phrases = [...cautions].sort((a, b) => rank(a.ruleId) - rank(b.ruleId)).map((f) => phraseOf(f, cautions.length > 1));
  // Every caution must be said: a line that names one of two things would read as the whole story.
  if (phrases.some((x) => !x)) return null;
  const unique = [...new Set(phrases as string[])];
  const body = unique.length === 2 ? `${unique[0]}; and ${unique[1]}` : unique[0];
  return `Watch for: ${body}.`;
}
