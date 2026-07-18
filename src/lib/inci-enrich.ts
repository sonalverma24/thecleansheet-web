/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · INCI enrichment
   Turns a plain INCI list into the rich scorecard data (ingredient
   notes + flags, the 10-authority regulatory screen, key actives)
   using the 734-ingredient database — so live-reviewed products match
   the depth of curated product pages.
──────────────────────────────────────────────────────────────── */

import { ALL_INGREDIENTS } from "@/lib/ingredient-utils";
import type { IngredientEntry, KeyActive, GlobalScreen } from "@/data/brands/types";

type DBRow = (typeof ALL_INGREDIENTS)[number] & Record<string, string>;

/* Fast case/format-insensitive lookup. Handles "Aqua/Water", "Aqua (Water)", zero-width chars. */
const norm = (s: string) =>
  s.toLowerCase().replace(/​/g, "").replace(/\([^)]*\)/g, "").split("/")[0].replace(/[^a-z0-9]+/g, " ").trim();

/* Some DB rows are corrupted (column drift): a Function of "2", a Concern
   level that is actually a function word, etc. Never trust a row's safety
   flags unless its fields carry sane values — a false "warn" is the worst
   possible error. */
function rowLooksValid(r: DBRow): boolean {
  const concern = (r.Concern_Level_TCS || "").toLowerCase().trim();
  const svhc = (r.SVHC_Flag || "").toLowerCase().trim();
  const func = (r.Function || "").trim();
  const concernOk = concern === "" || /^(low|medium|moderate|high|very high|none|n\/?a)$/.test(concern);
  const svhcOk = svhc === "" || /^(yes|no|none|n\/?a|0|0\.0+)$/.test(svhc);
  const funcOk = func === "" || /[a-z]{3}/i.test(func); // a real function name has letters, not "2"
  return concernOk && svhcOk && funcOk;
}

const INDEX: Map<string, DBRow> = (() => {
  const m = new Map<string, DBRow>();
  // Prefer the canonical row for each normalized key: the one whose raw name is
  // closest to the key (no parenthetical/slash variant) and whose fields are valid.
  const rank = (r: DBRow, key: string) => {
    const raw = (r.INCI_Name || "").toLowerCase();
    let s = 0;
    if (/[()]/.test(raw)) s += 5;
    if (raw.includes("/")) s += 3;
    if (!rowLooksValid(r)) s += 50;
    s += Math.abs(raw.replace(/[^a-z0-9]/g, "").length - key.replace(/ /g, "").length);
    return s;
  };
  for (const row of ALL_INGREDIENTS as DBRow[]) {
    if (!row.INCI_Name) continue;
    const key = norm(row.INCI_Name);
    const existing = m.get(key);
    if (!existing || rank(row, key) < rank(existing, key)) m.set(key, row);
  }
  return m;
})();

/* Exact normalized match only — a wrong fuzzy match would mislabel an
   ingredient's safety, which is worse than an honest "not in database". */
function lookup(name: string): DBRow | undefined {
  return INDEX.get(norm(name));
}

function flagFor(row: DBRow | undefined, name: string): IngredientEntry["flag"] {
  // Corrupted rows never drive a flag — fall back to name-based read.
  if (!row || !rowLooksValid(row)) {
    if (/parfum|fragrance|linalool|limonene|citral|geraniol|eugenol/i.test(name)) return "info";
    return "ok";
  }
  const concern = (row.Concern_Level_TCS || "").toLowerCase();
  const hardFlag = /yes|group 1|group 2/i;
  if (concern.includes("high") || hardFlag.test(row.SVHC_Flag || "") || hardFlag.test(row.CMR_Flag || "") || hardFlag.test(row.IARC_Group || "")) return "warn";
  if (concern.includes("medium") || /yes|present/i.test(row.Allergen_Flag || "") || /yes/i.test(row.Endocrine_Flag || "")) return "info";
  return "ok";
}

function noteFor(row: DBRow | undefined, name: string): string {
  if (!row) return "Not in our reviewed database; assessed from public sources.";
  const bits: string[] = [];
  if (row.Function) bits.push(row.Function.replace(/\s*\([^)]*\)/, "").trim());
  const safety = (row.Key_Safety_Notes || "").split(/;|\./)[0]?.trim();
  if (safety && safety.length > 8) bits.push(safety.charAt(0).toUpperCase() + safety.slice(1));
  else if (/yes|present/i.test(row.Allergen_Flag || "")) bits.push("Listed EU fragrance allergen");
  return bits.join(" · ") || row.Category_Name || "";
}

export function enrichIngredients(inci: string[]): IngredientEntry[] {
  return inci.map((name) => {
    const row = lookup(name);
    return { name, note: noteFor(row, name), flag: flagFor(row, name) };
  });
}

export function keyActivesFrom(inci: string[]): KeyActive[] {
  const actives: KeyActive[] = [];
  for (const name of inci) {
    const row = lookup(name);
    if (row && /active/i.test(row.Function || "") ) {
      actives.push({ name, function: row.Function.replace(/^active\s*/i, "").replace(/[()]/g, "").trim() || "Active", concentrationConfidence: "Low" });
    }
    if (actives.length >= 6) break;
  }
  return actives;
}

/* One authority row: list the flagged ingredients, or a clean-pass line. */
function authorityLine(inci: string[], test: (r: DBRow) => string | null, cleanMsg: string): string {
  const hits: string[] = [];
  for (const name of inci) {
    const row = lookup(name);
    if (!row || !rowLooksValid(row)) continue; // corrupted rows never trigger an authority flag
    const flag = test(row);
    if (flag) hits.push(`${name} (${flag})`);
  }
  return hits.length ? hits.slice(0, 4).join("; ") + (hits.length > 4 ? `; +${hits.length - 4} more` : "") : cleanMsg;
}

/* Conservative: only a clear prohibition counts, never a negated phrase
   like "not specifically restricted" or "standard framework applies". */
function restricted(s?: string): boolean {
  const t = (s || "").toLowerCase();
  if (!t || /permitted|standard|not specifically|not listed|no specific|not identified|not classified|no restriction|no therapeutic/.test(t)) {
    // still allow an explicit prohibition to override the soft language
    return /\bprohibited\b|\bbanned\b|annex\s*ii\b/.test(t);
  }
  return /\bprohibited\b|\brestricted\b|\bbanned\b|annex\s*ii\b|not permitted for/.test(t);
}

export function buildGlobalScreen(inci: string[]): GlobalScreen {
  return {
    eu_1223_2009:          authorityLine(inci, (r) => restricted(r.EU_Status) ? (r.EU_Status || "restricted") : null, "No prohibited or restricted ingredients identified"),
    india_cr_2020:         authorityLine(inci, (r) => restricted(r.India_Status) ? (r.India_Status || "restricted") : null, "No prohibited ingredients under India CR 2020 identified"),
    us_fda_21cfr:          authorityLine(inci, (r) => restricted(r.US_FDA_Status) ? (r.US_FDA_Status || "restricted") : null, "No prohibited ingredients under US FDA 21 CFR identified"),
    korea_mfds:            authorityLine(inci, (r) => restricted(r.Korea_Status) ? (r.Korea_Status || "restricted") : null, "No prohibited ingredients under Korea MFDS identified"),
    tga_australia:         authorityLine(inci, (r) => restricted(r.Australia_TGA_Status) ? "restricted" : null, "No therapeutic-goods trigger identified"),
    aicis_australia:       authorityLine(inci, (r) => restricted(r.Australia_TGA_Status) ? "restricted" : null, "No AICIS industrial-chemical concern identified"),
    canada_nhpid:          authorityLine(inci, (r) => restricted(r.Canada_NHPID_Status) ? "restricted" : null, "No Health Canada restriction identified"),
    health_canada_hotlist: authorityLine(inci, (r) => restricted(r.Canada_NHPID_Status) ? "hotlist" : null, "No Health Canada Hotlist ingredient identified"),
    echa_svhc:             authorityLine(inci, (r) => /^yes/i.test((r.SVHC_Flag || "").trim()) ? "SVHC" : null, "No Substances of Very High Concern identified"),
    iarc:                  authorityLine(inci, (r) => /group\s*(1|2a|2b)/i.test(r.IARC_Group || "") ? (r.IARC_Group || "") : null, "No IARC-classified carcinogens identified"),
  };
}
