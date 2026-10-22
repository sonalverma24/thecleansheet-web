/* Re-anchoring: give an already stored ingredient list the quoted source text it never
   kept, but only when a fresh read of the source page is the SAME list for the SAME
   product. Anchored means one thing: a quote was captured from a real source for a
   named product. It does not mean the formula is true, current for this SKU, or valid
   for a region or version, and nothing here calls a list correct.

   The rules are exact. There is no similarity score and no threshold that approves:
     1. same brand;
     2. equal name tokens (a subset is not equal);
     3. the source page's own title is the product's name (recorded as matchedTitle);
     4. equal variant tokens (size, SPF and PA rating, percentage, shade or variant number);
     5. the ordered sequence of inciKey(...) is identical, duplicates counted.
   Anything else, reordered or added or removed or duplicated entries, a title that does
   not match, a truncated quote, is queued with its diff for a person. Nothing here
   writes to a database: the caller decides, and the only write path (`guardedWrite`)
   can set the `result` column alone, so tier, rubric_rev and verdict are out of reach. */

import { inciKey } from "@/lib/inci-normalise";
import { brandKey, nameTokens } from "@/lib/product-identity";
import { incidecoderProductSlug, type INCIResult } from "@/lib/inci-fetch";
import type { PageINCI } from "@/lib/inci-from-page";
import { reviewInciList } from "@/lib/review-inci";
import { captureTrustForUrl, CaptureTrust, evidenceForReview, isAnchored, makeInciEvidence } from "@/lib/review-verifier";
import type { InciEvidence, ProductReview } from "@/lib/product-review-types";

/* ── Variant tokens ───────────────────────────────────────────── */

/* Size, sun-protection rating, percentage and variant numbers are part of WHICH product
   this is. They are pulled out of the name before the word comparison so that "30 ml" and
   "30ml", or "SPF 50 Pa ++++" and "SPF 50 PA++++", compare equal, while "SPF 50" and
   "SPF 50+", or "30ml" and "50ml", stay different. */
const UNIT: Record<string, string> = { gm: "g", gms: "g", gram: "g", grams: "g", pcs: "pc", piece: "pc", pieces: "pc", sheets: "sheet" };
const num = (s: string) => s.replace(",", ".");

const VARIANT_RULES: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/\bspf\s*[-:]?\s*(\d{1,3})\s*(\+)?/g, (m) => `spf${m[1]}${m[2] ? "+" : ""}`],
  [/\bpa\s*(\+{1,4})/g, (m) => `pa${m[1].length}`],
  [/(\d+(?:[.,]\d+)?)\s*%/g, (m) => `${num(m[1])}%`],
  [
    /\b(\d+(?:[.,]\d+)?)\s*(fl\.?\s*oz|ml|kg|mg|oz|gms|gm|grams|gram|pcs|pc|pieces|piece|sheets|sheet|ct|count|l|g)\b/g,
    (m) => {
      const unit = m[2].replace(/[\s.]/g, "");
      return `${num(m[1])}${UNIT[unit] ?? unit}`;
    },
  ],
];
const DIGIT_WORD_RE = /[a-z]*\d[a-z0-9]*/g;

export function splitVariants(name: string): { rest: string; variants: string[] } {
  let rest = name.toLowerCase().replace(/&/g, " and ");
  const variants: string[] = [];
  for (const [re, fmt] of VARIANT_RULES) {
    for (const m of rest.matchAll(re)) variants.push(fmt(m));
    rest = rest.replace(re, " ");
  }
  // Any word still carrying a digit ("02", "n20", "b5") is a variant or shade number.
  for (const m of rest.matchAll(DIGIT_WORD_RE)) variants.push(m[0]);
  rest = rest.replace(DIGIT_WORD_RE, " ");
  return { rest, variants: [...new Set(variants)].sort() };
}

/* ── Sequence comparison ──────────────────────────────────────── */

export interface SequenceDiff {
  /** identical: same inciKey sequence. reordered: same entries, different order.
      changed: entries added, removed or repeated differently. unkeyed: an entry has no
      comparable name, so no exact claim can be made. */
  kind: "identical" | "reordered" | "changed" | "unkeyed";
  exact: boolean;
  storedLength: number;
  sourceLength: number;
  /** Entries (in the stored spelling) the source does not have, counting duplicates. */
  onlyInStored: string[];
  /** Entries (in the source spelling) the stored list does not have, counting duplicates. */
  onlyInSource: string[];
  /** Entries present on both sides a different number of times (stored spelling). */
  repeatedDifferently: string[];
  firstDivergence: { index: number; stored: string | null; source: string | null } | null;
}

export function compareInciSequences(stored: string[], source: string[]): SequenceDiff {
  const sk = stored.map(inciKey);
  const tk = source.map(inciKey);
  const base = { storedLength: stored.length, sourceLength: source.length };
  if (sk.some((k) => !k) || tk.some((k) => !k)) {
    return { ...base, kind: "unkeyed", exact: false, onlyInStored: [], onlyInSource: [], repeatedDifferently: [], firstDivergence: null };
  }
  const count = (keys: string[]) => keys.reduce((m, k) => m.set(k, (m.get(k) ?? 0) + 1), new Map<string, number>());
  const sc = count(sk), tc = count(tk);
  const surplus = (raw: string[], keys: string[], other: Map<string, number>) => {
    const seen = new Map<string, number>();
    return raw.filter((_, i) => {
      const n = (seen.get(keys[i]) ?? 0) + 1;
      seen.set(keys[i], n);
      return n > (other.get(keys[i]) ?? 0);
    });
  };
  const onlyInStored = surplus(stored, sk, tc);
  const onlyInSource = surplus(source, tk, sc);
  const repeatedDifferently = [...new Set(stored.filter((_, i) => tc.has(sk[i]) && tc.get(sk[i]) !== sc.get(sk[i])))];
  let at = 0;
  while (at < sk.length && at < tk.length && sk[at] === tk[at]) at++;
  const exact = at === sk.length && at === tk.length;
  const firstDivergence = exact ? null : { index: at, stored: stored[at] ?? null, source: source[at] ?? null };
  const kind = exact ? "identical" : !onlyInStored.length && !onlyInSource.length ? "reordered" : "changed";
  return { ...base, kind, exact, onlyInStored, onlyInSource, repeatedDifferently, firstDivergence };
}

/* ── The decision ─────────────────────────────────────────────── */

export interface StoredIdentity { brand: string; productName: string; inci: string[] }

export interface SourceSnapshot {
  kind: "incidecoder" | "brand_page";
  url: string;
  /** The page's own titles, best first. Empty when the page gave none. */
  titles: string[];
  /** What the page says the brand is. */
  brandNames: string[];
  /** equal: a structured brand field must equal the review's brand (INCIDecoder).
      named: a brand page only names its brand inside a title or site name, so the
      review's brand must appear there as whole words. */
  brandRule: "equal" | "named";
  ingredients: string[];
  quote: string;
  quoteComplete: boolean;
}

export type FailureCode =
  | "NO_STORED_LIST" | "NO_SOURCE_LIST" | "NO_TITLE" | "BRAND" | "NAME" | "VARIANT"
  | "LIST" | "NO_QUOTE" | "QUOTE_TRUNCATED" | "QUOTE_MISMATCH";

export interface Failure { code: FailureCode; detail: string }

export interface Decision {
  anchorable: boolean;
  failures: Failure[];
  /** Advisory only, never a rule: stored entries that read like page prose, not an
      ingredient name. An exact match can still be an exact match of a badly parsed
      list; this lets a person look before the anchor is written. */
  advisories: string[];
  /** The page's own title that matched the review's product name. Null unless anchorable. */
  matchedTitle: string | null;
  diff: SequenceDiff;
}

// Title separators: | - en dash, em dash, middle dot, colon. Built from code points so no dash glyph sits in the source.
const SEGMENT_SPLIT = new RegExp(`\\s+[|\\-${String.fromCharCode(0x2013, 0x2014, 0xb7)}:]\\s+|\\s*\\|\\s*`);
const cleanStorefront = (t: string) => t.replace(/^buy\s+/i, "").replace(/\s*(?:online\b.*|at best price.*)$/i, "").trim();

/** The forms of one page title a name can be matched against. INCIDecoder's title is the
    product title as it stands; a brand page's "Name | Brand" or "Buy Name Online" is also
    tried as its separate parts. The recorded matchedTitle is always the whole title. */
function titleForms(raw: string, kind: SourceSnapshot["kind"]): string[] {
  if (kind === "incidecoder") return [raw];
  return [...new Set([raw, cleanStorefront(raw), ...raw.split(SEGMENT_SPLIT).map(cleanStorefront)].filter(Boolean))];
}

const wordList = (s: string) => s.toLowerCase().replace(/&/g, " and ").split(/[^a-z0-9]+/).filter(Boolean);

function containsRun(hay: string[], needle: string[]): boolean {
  if (!needle.length) return false;
  for (let i = 0; i + needle.length <= hay.length; i++) if (needle.every((w, k) => hay[i + k] === w)) return true;
  return false;
}

const sameSet = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every((x) => b.has(x));
const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);
const minus = (a: Iterable<string>, b: Set<string>) => [...a].filter((x) => !b.has(x));

/** True when every list entry occurs in the quote, in order, ignoring case, spacing and
    punctuation. A guard that the quote really holds the list it is meant to anchor. */
export function quoteHoldsList(quote: string, ingredients: string[]): boolean {
  const q = quote.toLowerCase().replace(/[^a-z0-9]+/g, "");
  let from = 0;
  for (const item of ingredients) {
    const s = item.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (!s) continue;
    const at = q.indexOf(s, from);
    if (at < 0) return false;
    from = at + s.length;
  }
  return true;
}

/** Entries with a full stop followed by more text, or an unusually long entry. Some real
    names trip it ("Vaccinum Sect. Cyanococcus"), which is why it only advises. */
export function proseLikeEntries(list: string[]): string[] {
  return list.filter((x) => /\.\s+\S/.test(x) || x.length > 70);
}

export function decideReanchor(stored: StoredIdentity, source: SourceSnapshot): Decision {
  const failures: Failure[] = [];
  const fail = (code: FailureCode, detail: string) => failures.push({ code, detail });

  if (!stored.inci.length) fail("NO_STORED_LIST", "the review has no stored ingredient list");
  if (!source.ingredients.length) fail("NO_SOURCE_LIST", "the source page gave no ingredient list");
  const diff = compareInciSequences(stored.inci, source.ingredients);
  if (stored.inci.length && source.ingredients.length && !diff.exact) fail("LIST", describeDiff(diff));

  // Rule 1: same brand.
  const wantBrand = brandKey(stored.brand);
  const brandOk =
    !!wantBrand &&
    (source.brandRule === "equal"
      ? source.brandNames.some((b) => brandKey(b) === wantBrand)
      : [...source.brandNames, ...source.titles].some((t) => containsRun(wordList(t), wantBrand.split(" "))));
  if (!brandOk) {
    fail("BRAND", `the review's brand is "${stored.brand}"; the page says ${source.brandNames.length ? source.brandNames.map((b) => `"${b}"`).join(", ") : "nothing about a brand"}`);
  }

  // Rules 2 to 4: the page's own title against the review's product name.
  if (!source.titles.length) {
    fail("NO_TITLE", "the page gave no title of its own to match the product name against");
  }
  const want = splitVariants(stored.productName);
  const wantWords = nameTokens(want.rest, stored.brand);
  let matchedTitle: string | null = null;
  let closest: { raw: string; words: Set<string>; variants: string[]; distance: number } | null = null;
  for (const raw of source.titles) {
    for (const form of titleForms(raw, source.kind)) {
      const got = splitVariants(form);
      const words = nameTokens(got.rest, stored.brand);
      const wordsEqual = words.size > 0 && sameSet(words, wantWords);
      const variantsEqual = sameList(got.variants, want.variants);
      if (wordsEqual && variantsEqual) { matchedTitle = matchedTitle ?? raw; continue; }
      const distance = minus(words, wantWords).length + minus(wantWords, words).length +
        got.variants.filter((v) => !want.variants.includes(v)).length + want.variants.filter((v) => !got.variants.includes(v)).length;
      if (!closest || distance < closest.distance) closest = { raw, words, variants: got.variants, distance };
    }
  }
  if (!matchedTitle && closest) {
    const extra = minus(closest.words, wantWords), missing = minus(wantWords, closest.words);
    if (extra.length || missing.length || !wantWords.size) {
      fail("NAME", `name tokens differ from the page title "${closest.raw}": ${extra.length ? `only on the page: ${extra.join(", ")}` : ""}${extra.length && missing.length ? "; " : ""}${missing.length ? `only in the review: ${missing.join(", ")}` : ""}`.trim());
    }
    if (!sameList(closest.variants, want.variants)) {
      fail("VARIANT", `variant tokens differ from the page title "${closest.raw}": page [${closest.variants.join(", ")}], review [${want.variants.join(", ")}]`);
    }
    if (!failures.some((f) => f.code === "NAME" || f.code === "VARIANT")) fail("NAME", `no page title equals the product name ("${closest.raw}" is closest)`);
  }

  // The quote must exist, be complete, and actually contain the list.
  if (!source.quote.trim()) fail("NO_QUOTE", "no source text was captured");
  else if (!source.quoteComplete) fail("QUOTE_TRUNCATED", "the captured source text stops short of the full list");
  else if (!quoteHoldsList(source.quote, source.ingredients)) fail("QUOTE_MISMATCH", "the captured source text does not contain the parsed list in order");

  return { anchorable: failures.length === 0, failures, advisories: proseLikeEntries(stored.inci), matchedTitle: failures.length === 0 ? matchedTitle : null, diff };
}

const SHOWN = 8;
const clip = (xs: string[]) => (xs.length > SHOWN ? `${xs.slice(0, SHOWN).join(", ")} (+${xs.length - SHOWN} more)` : xs.join(", "));

export function describeDiff(d: SequenceDiff): string {
  if (d.kind === "unkeyed") return "an entry has no comparable name, so the lists cannot be compared exactly";
  const parts = [`${d.kind}: review has ${d.storedLength} entries, source has ${d.sourceLength}`];
  if (d.firstDivergence) parts.push(`first difference at position ${d.firstDivergence.index + 1}: review "${d.firstDivergence.stored ?? "(end)"}", source "${d.firstDivergence.source ?? "(end)"}"`);
  if (d.onlyInStored.length) parts.push(`only in the review: ${clip(d.onlyInStored)}`);
  if (d.onlyInSource.length) parts.push(`only in the source: ${clip(d.onlyInSource)}`);
  if (d.repeatedDifferently.length) parts.push(`repeated a different number of times: ${clip(d.repeatedDifferently)}`);
  return parts.join("; ");
}

/* ── Snapshots from the two fetchers ──────────────────────────── */

export function snapshotFromIncidecoder(r: INCIResult, url: string): SourceSnapshot {
  return {
    kind: "incidecoder", url,
    titles: r.pageTitle ? [r.pageTitle] : [],
    brandNames: r.pageBrand ? [r.pageBrand] : [],
    brandRule: "equal",
    ingredients: r.ingredients,
    quote: r.sourceQuote ?? "",
    quoteComplete: !r.sourceQuoteTruncated,
  };
}

export function snapshotFromPage(p: PageINCI): SourceSnapshot {
  return {
    kind: "brand_page", url: p.source,
    titles: p.pageTitles ?? [],
    brandNames: p.siteName ? [p.siteName] : [],
    brandRule: "named",
    ingredients: p.ingredients,
    quote: p.quote ?? "",
    quoteComplete: !!p.quote,
  };
}

/* ── Rows ─────────────────────────────────────────────────────── */

export type SourceClass = "incidecoder" | "brand_page" | "retailer" | "unsupported" | "none";

/** Which kind of source a stored URL is. Only an INCIDecoder product page and a brand's
    own page can be re-anchored; a retailer listing is marketing-adjacent text and an
    INCIDecoder URL that is not a product page has no list to read. */
export function classifySource(url: string | null | undefined): SourceClass {
  const u = (url ?? "").trim();
  if (!u) return "none";
  if (incidecoderProductSlug(u)) return "incidecoder";
  switch (captureTrustForUrl(u)) {
    case CaptureTrust.OFFICIAL_PAGE: return "brand_page";
    case CaptureTrust.RETAILER: return "retailer";
    case CaptureTrust.AI_TRANSCRIPTION: return "none";
    default: return "unsupported";
  }
}

export interface ReviewRowLike { product_slug: string; result: unknown }

interface StoredResult { type?: string; review?: ProductReview; [k: string]: unknown }

/** A copy of the stored result with `inciEvidence` set and every other field untouched. */
export function withInciEvidence<T extends StoredResult>(result: T, evidence: InciEvidence): T {
  return { ...result, review: { ...(result.review as ProductReview), inciEvidence: evidence } };
}

export type SnapshotFetch =
  | { status: "ok"; snapshot: SourceSnapshot; retrievedAt: string }
  | { status: "fetch_failed"; detail: string }
  | { status: "no_list"; detail: string };

/** The only door to the database. It can read a row's `result` and replace it. It cannot
    name any other column, so tier, rubric_rev and verdict are out of reach by construction. */
export interface ReviewTable {
  readResult(slug: string): Promise<{ result: unknown } | { error: string }>;
  writeResult(slug: string, result: unknown): Promise<{ error?: string }>;
}

/** Replace a row's `result` only if it is still exactly what was read. */
export async function guardedWrite(table: ReviewTable, slug: string, next: unknown, previous: unknown): Promise<{ ok: true } | { ok: false; reason: string }> {
  const now = await table.readResult(slug);
  if ("error" in now) return { ok: false, reason: `re-read failed: ${now.error}` };
  if (JSON.stringify(now.result) !== JSON.stringify(previous)) return { ok: false, reason: "the row changed after it was read; left alone" };
  const written = await table.writeResult(slug, next);
  return written.error ? { ok: false, reason: `write failed: ${written.error}` } : { ok: true };
}

export type SkipReason = "not_a_review" | "retracted" | "no_source_url" | "retailer_source" | "unsupported_source" | "already_anchored" | "not_selected";

export type RowResult =
  | { slug: string; status: "skipped"; reason: SkipReason }
  | { slug: string; source: SourceClass; url: string; status: "fetch_failed" | "no_list"; detail: string }
  | { slug: string; source: SourceClass; url: string; status: "anchorable"; decision: Decision; evidence: InciEvidence; applied?: "written" | { skipped: string } }
  | { slug: string; source: SourceClass; url: string; status: "queued"; decision: Decision };

export interface ReanchorDeps {
  fetchSnapshot(url: string, source: "incidecoder" | "brand_page"): Promise<SnapshotFetch>;
  /** Only consulted when `apply` is true. */
  table?: ReviewTable;
}

export interface ReanchorOptions {
  /** Without it nothing is written, whatever `deps.table` is. */
  apply: boolean;
  sources: ReadonlySet<"incidecoder" | "brand_page">;
  slug?: string;
  limit?: number;
  isRetracted?: (slug: string) => boolean;
  onResult?: (r: RowResult) => void;
}

export async function reanchorRows(rows: ReviewRowLike[], deps: ReanchorDeps, opts: ReanchorOptions): Promise<RowResult[]> {
  const out: RowResult[] = [];
  const emit = (r: RowResult) => { out.push(r); opts.onResult?.(r); };
  let fetched = 0;
  for (const row of rows) {
    const slug = row.product_slug;
    const result = row.result as StoredResult | null;
    const review = result?.review;
    if (!review || result?.type !== "product-review") { emit({ slug, status: "skipped", reason: "not_a_review" }); continue; }
    if (opts.isRetracted?.(slug)) { emit({ slug, status: "skipped", reason: "retracted" }); continue; }
    const url = (review.inciSourceUrl ?? "").trim();
    const source = classifySource(url);
    if (source === "none") { emit({ slug, status: "skipped", reason: "no_source_url" }); continue; }
    if (source === "retailer") { emit({ slug, status: "skipped", reason: "retailer_source" }); continue; }
    if (source === "unsupported") { emit({ slug, status: "skipped", reason: "unsupported_source" }); continue; }
    if (!opts.sources.has(source) || (opts.slug && opts.slug !== slug) || (opts.limit !== undefined && fetched >= opts.limit)) {
      emit({ slug, status: "skipped", reason: "not_selected" });
      continue;
    }
    if (isAnchored(evidenceForReview(review))) { emit({ slug, status: "skipped", reason: "already_anchored" }); continue; }

    fetched++;
    const got = await deps.fetchSnapshot(url, source);
    if (got.status !== "ok") { emit({ slug, source, url, status: got.status, detail: got.detail }); continue; }

    const decision = decideReanchor({ brand: review.brand, productName: review.productName, inci: reviewInciList(review) }, got.snapshot);
    if (!decision.anchorable) { emit({ slug, source, url, status: "queued", decision }); continue; }

    const evidence = makeInciEvidence(url, got.snapshot.quote, got.retrievedAt, decision.matchedTitle ?? undefined);
    const entry: Extract<RowResult, { status: "anchorable" }> = { slug, source, url, status: "anchorable", decision, evidence };
    if (opts.apply) {
      if (!deps.table) entry.applied = { skipped: "no database table supplied" };
      else {
        const w = await guardedWrite(deps.table, slug, withInciEvidence(result as StoredResult, evidence), row.result);
        entry.applied = w.ok ? "written" : { skipped: w.reason };
      }
    }
    emit(entry);
  }
  return out;
}

export interface Summary {
  anchorable: number;
  /** Anchorable rows whose stored list has entries that read like page prose (advisory). */
  anchorableWithProse: number;
  queued: number;
  fetchFailures: number;
  fetchFailed: number;
  noList: number;
  skipped: Record<string, number>;
  written: number;
  writeSkipped: number;
  queuedByReason: Record<string, number>;
}

export function summarise(results: RowResult[]): Summary {
  const s: Summary = { anchorable: 0, anchorableWithProse: 0, queued: 0, fetchFailures: 0, fetchFailed: 0, noList: 0, skipped: {}, written: 0, writeSkipped: 0, queuedByReason: {} };
  for (const r of results) {
    if (r.status === "skipped") s.skipped[r.reason] = (s.skipped[r.reason] ?? 0) + 1;
    else if (r.status === "fetch_failed") { s.fetchFailures++; s.fetchFailed++; }
    else if (r.status === "no_list") { s.fetchFailures++; s.noList++; }
    else if (r.status === "queued") {
      s.queued++;
      for (const f of new Set(r.decision.failures.map((x) => x.code))) s.queuedByReason[f] = (s.queuedByReason[f] ?? 0) + 1;
    } else if (r.status === "anchorable") {
      s.anchorable++;
      if (r.decision.advisories.length) s.anchorableWithProse++;
      if (r.applied === "written") s.written++;
      else if (r.applied) s.writeSkipped++;
    }
  }
  return s;
}
