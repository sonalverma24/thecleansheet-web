/* Product identity + INCI sanity helpers.

   Two searches for the same product must land on the same stored review even when
   the model words the product name differently ("… SPF 50 PA++++ Ultra Light
   Fluid" vs "… Ultra Light Fluid SPF 50 PA++++"). A slug built from the raw name is
   order-sensitive, so identity is decided here instead: brand + order-insensitive
   name tokens, backed by the ingredient list when one name is a subset of the
   other. Pure functions only, so the same logic serves the engine and the merge
   script. */

import { canonicalizeBrand } from "@/lib/verified-store";

const FILLER = new Set(["the", "and", "with", "for", "by", "of", "a", "an", "new", "pa", "plus"]);

const words = (s: string) =>
  s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean);

/** Order-insensitive identity tokens for a product name. The brand's own words
    are dropped (a name that repeats the brand must equal one that doesn't) along
    with filler and the "PA++++" rating, which carry no product identity. */
export function nameTokens(productName: string, brand: string): Set<string> {
  const brandWords = new Set(words(canonicalizeBrand(brand)));
  return new Set(words(productName).filter((w) => !brandWords.has(w) && !FILLER.has(w)));
}

export function brandKey(brand: string): string {
  return words(canonicalizeBrand(brand)).join(" ");
}

const normInci = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, "");

/** Share of ingredients in common (Jaccard) between two INCI lists, 0 to 1. */
export function inciSimilarity(a: string[], b: string[]): number {
  const A = new Set(a.map(normInci).filter(Boolean));
  const B = new Set(b.map(normInci).filter(Boolean));
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const x of A) if (B.has(x)) shared++;
  return shared / (A.size + B.size - shared);
}

const isSubset = (a: Set<string>, b: Set<string>) => [...a].every((x) => b.has(x));

export interface IdentityCandidate {
  productName: string;
  brand: string;
  inci?: string[] | null;
}

/** True when two records describe the same product: same brand, and either the
    same name tokens in any order, or one name containing the other with a
    near-identical ingredient list (the "same formula, longer name" case). */
export function isSameProduct(a: IdentityCandidate, b: IdentityCandidate): boolean {
  if (brandKey(a.brand) !== brandKey(b.brand)) return false;
  const ta = nameTokens(a.productName, a.brand);
  const tb = nameTokens(b.productName, b.brand);
  if (!ta.size || !tb.size) return false;
  if (ta.size === tb.size && isSubset(ta, tb)) return true;
  if (!isSubset(ta, tb) && !isSubset(tb, ta)) return false;
  return !!a.inci?.length && !!b.inci?.length && inciSimilarity(a.inci, b.inci) >= 0.95;
}

/** Does a marketplace page title name THIS product? Used before a scraped listing is
    allowed to corroborate a claim: "Cetaphil Gentle Skin Cleanser …" must not stand
    in for "Cetaphil Facial Cleanser". At least 75% of the product's own name words
    (brand, filler and a trailing plural "s" ignored) must appear in the title. */
export function titleIdentifiesProduct(title: string | null | undefined, brand: string, productName: string): boolean {
  if (!title) return false;
  const stem = (w: string) => (w.length > 3 ? w.replace(/s$/, "") : w);
  const want = [...nameTokens(productName, brand)].map(stem);
  if (!want.length) return false;
  const have = new Set([...nameTokens(title, brand)].map(stem));
  return want.filter((w) => have.has(w)).length / want.length >= 0.75;
}

/* ── INCI sanity ─────────────────────────────────────────────── */

export interface InciCheck {
  list: string[];
  /** Human-readable problems found; empty means the list is clean. */
  issues: string[];
  /** False when the list is still unusable after repair and must not be scored. */
  ok: boolean;
}

const MAX_ITEM_LEN = 80;

/** Repair what can be repaired deterministically, flag the rest. An INCI list is
    comma-separated single names, so an item joined with " and " is a transcription
    slip: it is split back into its parts. Sentences, bullet fragments and empty
    or numeric tokens mean the text was not an ingredient list at all. */
export function sanitizeInciList(raw: string[]): InciCheck {
  const issues: string[] = [];
  const out: string[] = [];
  for (const item of raw) {
    const t = item.replace(/\s+/g, " ").trim();
    if (!t) continue;
    if (t.length > MAX_ITEM_LEN || t.split(" ").length > 9 || /^(free from|without|no|with|contains|made)\b/i.test(t)) { issues.push(`not an ingredient name: "${t.slice(0, 40)}…"`); continue; }
    const parts = /\s(?:and|&)\s/i.test(t) ? t.split(/\s+(?:and|&)\s+/i).map((s) => s.trim()).filter(Boolean) : [t];
    if (parts.length > 1) issues.push(`joined items split: "${t}"`);
    for (const p of parts) {
      if (p.length > MAX_ITEM_LEN || p.split(" ").length > 9) { issues.push(`not an ingredient name: "${p.slice(0, 40)}…"`); continue; }
      if (/^[\d\s.%]+$/.test(p) || !/[a-z]/i.test(p)) { issues.push(`non-INCI token: "${p}"`); continue; }
      out.push(p);
    }
  }
  const seen = new Set<string>();
  const list = out.filter((x) => { const k = normInci(x); if (seen.has(k)) return false; seen.add(k); return true; });
  const rejected = issues.filter((i) => !i.startsWith("joined")).length;
  return { list, issues, ok: list.length >= 3 && rejected <= Math.max(1, Math.floor(raw.length * 0.1)) };
}
