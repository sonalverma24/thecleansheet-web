import type { MarkerName, PillToneName } from "@/components/scorecards/pill-palette";

/* ────────────────────────────────────────────────────────────────
   COMPARE · the side-by-side and the pick

   Everything here is read from what each product's own analysis page already says: its pill (Good choice, Buy with caution, Look elsewhere, Not enough
   info, Medicinal product), its five rated rows, its At a glance checks, its price and its gaps. Nothing is re-scored. The pick is a plain ordering of
   those facts, and every sentence that explains it names the fact it came from, so a shopper can find it on the product's page.

   The order, first difference wins:
     1. the pill            Good choice, then Buy with caution, then Look elsewhere
     2. ingredient safety   the first of the five rows, the one a shopper cares about most
     3. the five rows       green 2, yellow 1, red or not rated 0
     4. the checks          ticks minus crosses
     5. confidence          high, medium, low
     6. price               the lower price per ml or g, when every product has one in the same unit
   A product with Not enough info or a Medicinal product pill is never picked and never ranked: there is nothing fair to rank it on.
   Pure.
──────────────────────────────────────────────────────────────── */

export type Marker = MarkerName | null;

export const ROW_IDS = ["safety", "formula", "claims", "tests", "clarity"] as const;
export type RowId = (typeof ROW_IDS)[number];

export interface CompareRow { id: RowId; title: string; marker: Marker; word: string; line: string }
/** One At a glance check by its canonical name: a tick (yes) or a cross (no). A check we could not make is left out, not carried as a third state. */
export interface CompareCheck { label: string; state: "yes" | "no"; detail?: string }
export interface ComparePrice {
  /** The lowest price seen, in rupees. */
  total: number | null;
  /** The pack size as the analysis states it ("50 ml"). */
  pack: string | null;
  /** Rupees per ml or per g, worked out here from the lowest price and the pack size; null when either is missing or the pack is not a single size. */
  perUnit: number | null;
  unit: "ml" | "g" | null;
  /** The page's own price line, used when the figures above cannot be worked out. */
  line: string | null;
}

export interface CompareFacts {
  slug: string;
  href: string;
  name: string;
  brand: string;
  image: string | null;
  type: string;
  pill: { label: string; tone: PillToneName; marker: Marker };
  confidence: "high" | "medium" | "low";
  /** The five rated rows; null for a medicine or a page we could not read. */
  rows: CompareRow[] | null;
  checks: CompareCheck[];
  keyActives: string[];
  price: ComparePrice;
  suits: string[];
  careful: string[];
  gaps: string[];
  analysedAt: string;
  /** Sunscreens only, read from the product name. */
  sun?: { spf: string | null; pa: string | null };
}

export interface PickLine { slug: string; text: string }
export interface ComparePick {
  /** "pick": one product leads. "close": two or more are level, and the first of them is named. "only": one product could be rated. "none": every rated product is Look elsewhere. "unrated": nothing here could be rated. */
  kind: "pick" | "close" | "only" | "none" | "unrated";
  winner: string | null;
  headline: string;
  summary: string;
  reasons: string[];
  /** The other rated products, best first: why they are behind, and what they still have going for them. */
  others: PickLine[];
  /** A cheaper product of the same pill as the pick, when there is one. */
  value: PickLine | null;
  /** Products left out of the pick, and why. */
  left: PickLine[];
  caveats: string[];
}

export interface Comparison {
  type: string;
  pick: ComparePick;
  /** For each rated row, the slugs that lead it (empty when everyone is level). Used to mark the best cell. */
  leaders: Record<RowId, string[]>;
  /** The slug with the lowest price per unit, when every product has one in the same unit. */
  cheapest: string | null;
}

/* ── small helpers ───────────────────────────────────────────── */

const TONE_RANK: Partial<Record<PillToneName, number>> = { good: 3, caution: 2, look: 1 };
const CONFIDENCE_RANK = { high: 2, medium: 1, low: 0 } as const;
const pts = (m: Marker): number => (m === "green" ? 2 : m === "yellow" ? 1 : 0);
const rowOf = (f: CompareFacts, id: RowId): CompareRow | undefined => f.rows?.find((r) => r.id === id);
const rowPts = (f: CompareFacts, id: RowId): number => pts(rowOf(f, id)?.marker ?? null);
const isRated = (f: CompareFacts): boolean => TONE_RANK[f.pill.tone] !== undefined;
const perUnitText = (n: number, unit: string): string => `₹${n.toFixed(2)}/${unit}`;
const lower = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1);
const join = (items: string[]): string => (items.length < 3 ? items.join(" and ") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);

/** A rated row's one-liner for a narrow cell: a run of the same sentence repeated (the safety line can name one ingredient three times) is said once, and the
    rest is cut at a word, with an ellipsis, after `max` characters. */
export function tidyLine(text: string, max = 150): string {
  let t = text.replace(/\s+/g, " ").trim();
  for (let prev = ""; prev !== t; ) { prev = t; t = t.replace(/(.{20,}?)(?:\s+\1)+/g, "$1"); }
  // The source sometimes cuts its last repeat off ("... bioaccumulates in..."): a tail that only repeats what was already said is dropped.
  if (/(?:\.{3}|…)$/.test(t)) {
    const body = t.replace(/(?:\.{3}|…)$/, "");
    for (let i = body.indexOf(" "); i !== -1; i = body.indexOf(" ", i + 1)) {
      const tail = body.slice(i + 1);
      if (tail.length >= 10 && body.slice(0, i).includes(tail)) { t = body.slice(0, i); break; }
    }
  }
  if (t.length <= max) return t;
  const cut = t.slice(0, max).replace(/\s+\S*$/, "").replace(/[\s,:;.]+$/, "");
  return `${cut}…`;
}

/** A product's name as a shopper says it: without the brand repeated when the name already starts with it. */
export function displayName(f: Pick<CompareFacts, "name" | "brand">): string {
  const brand = f.brand.trim();
  return brand && !f.name.toLowerCase().startsWith(brand.toLowerCase()) ? `${brand} ${f.name}` : f.name;
}

/* ── price ───────────────────────────────────────────────────── */

const UNIT_RE = /(\d+(?:\.\d+)?)\s*(ml|millilitres?|milliliters?|g|gm|gms|grams?|l|ltr|litres?|liters?|kg)\b/gi;
const MULTI_PACK_RE = /\bx\b|×|\bpack\b|\bset\b|\bcombo\b|\bkit\b|\+|&|\bof\s+\d/i;

/** A pack size such as "50 ml" or "120 g", worked into ml or g. A multipack ("2 x 50 ml") or a text with two sizes is not one size, so it gives null. */
export function parsePack(text: string | undefined | null): { size: number; unit: "ml" | "g"; label: string } | null {
  const t = (text ?? "").trim();
  if (!t || MULTI_PACK_RE.test(t)) return null;
  const found = [...t.matchAll(UNIT_RE)];
  if (found.length !== 1) return null;
  const n = parseFloat(found[0][1]);
  const u = found[0][2].toLowerCase();
  if (!(n > 0)) return null;
  if (/^(ml|milli)/.test(u)) return { size: n, unit: "ml", label: `${n} ml` };
  if (/^(l|ltr|litre|liter)/.test(u)) return { size: n * 1000, unit: "ml", label: `${n} L` };
  if (u === "kg") return { size: n * 1000, unit: "g", label: `${n} kg` };
  return { size: n, unit: "g", label: `${n} g` };
}

/** The first rupee amount in a price text ("Rs.298 on Zepto, Blinkit" gives 298). A text with no rupee sign gives null: a bare number could be a size. */
export function parseRupees(text: string | undefined | null): number | null {
  const m = String(text ?? "").replace(/,/g, "").match(/(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)/i);
  return m ? parseFloat(m[1]) : null;
}

export function priceFacts(input: { lowestPrice?: string; priceRange?: string; quantity?: string; line?: string | null }): ComparePrice {
  const total = parseRupees(input.lowestPrice) ?? parseRupees(input.priceRange);
  const pack = parsePack(input.quantity);
  return {
    total,
    pack: pack?.label ?? ((input.quantity ?? "").trim() || null),
    perUnit: total !== null && pack ? Math.round((total / pack.size) * 100) / 100 : null,
    unit: pack?.unit ?? null,
    line: input.line ?? null,
  };
}

/* ── the checks ──────────────────────────────────────────────── */

/* A check's label changes with its answer ("SPF: supported" or "SPF: not supported"; "Pregnancy ingredient flags: X" when there are flags), so the grid files
   each by one name that reads as a yes/no question. The colon and what follows it become the cell's detail. */
export function canonicalCheck(label: string, state: "yes" | "no"): CompareCheck {
  const [head, ...rest] = label.split(":");
  const detail = rest.join(":").trim() || undefined;
  const h = head.trim();
  let name = h;
  if (/^pregnancy ingredient flags?$/i.test(h)) name = "No pregnancy ingredient flags";
  else if (/^(vegan ingredient origin screened|animal-origin ingredient)$/i.test(h)) name = "Vegan ingredient origin";
  else if (/^dermatologist-tested$/i.test(h)) name = "Dermatologist-tested claim supported";
  else if (/^(spf|non-comedogenic|vegan claim|cruelty-free claim)$/i.test(h)) name = /claim$/i.test(h) ? `${h}${/supported$/i.test(h) ? "" : " supported"}` : `${h} claim supported`;
  return { label: name, state, ...(detail ? { detail } : {}) };
}

/** Sunscreens: the SPF and PA the product's own name states. */
export function sunFactsOf(productName: string): { spf: string | null; pa: string | null } {
  const spf = productName.match(/\bSPF\s*(\d{2,3})\s*(\+)?/i);
  const pa = productName.match(/\bPA\s*(\+{1,4})/i);
  return { spf: spf ? `SPF ${spf[1]}${spf[2] ?? ""}` : null, pa: pa ? `PA${pa[1]}` : null };
}

/* ── ranking ─────────────────────────────────────────────────── */

const net = (f: CompareFacts): number => f.checks.reduce((n, c) => n + (c.state === "yes" ? 1 : -1), 0);
const total = (f: CompareFacts): number => ROW_IDS.reduce((n, id) => n + rowPts(f, id), 0);

function samePriceBasis(items: CompareFacts[]): string | null {
  const units = new Set(items.map((f) => (f.price.perUnit !== null ? f.price.unit : null)));
  return units.size === 1 && !units.has(null) ? [...units][0] : null;
}

/** Negative when `a` ranks ahead of `b`. Price only decides when both have a price per unit in the same unit. */
function byRank(a: CompareFacts, b: CompareFacts): number {
  const key = (f: CompareFacts) => [
    TONE_RANK[f.pill.tone] ?? 0, rowPts(f, "safety"), total(f), net(f), CONFIDENCE_RANK[f.confidence],
  ];
  const ka = key(a);
  const kb = key(b);
  for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return kb[i] - ka[i];
  if (a.price.perUnit !== null && b.price.perUnit !== null && a.price.unit === b.price.unit && a.price.perUnit !== b.price.perUnit) return a.price.perUnit - b.price.perUnit;
  return 0;
}

/** Level on everything the pick turns on before price: same pill, same safety row, rows within one point. */
function level(a: CompareFacts, b: CompareFacts): boolean {
  return TONE_RANK[a.pill.tone] === TONE_RANK[b.pill.tone] && rowPts(a, "safety") === rowPts(b, "safety") && Math.abs(total(a) - total(b)) <= 1;
}

const cheaperBy = (a: CompareFacts, b: CompareFacts): number | null =>
  a.price.perUnit !== null && b.price.perUnit !== null && a.price.unit === b.price.unit && b.price.perUnit > 0 ? (b.price.perUnit - a.price.perUnit) / b.price.perUnit : null;

const priceCompareText = (a: CompareFacts, b: CompareFacts): string => `${perUnitText(a.price.perUnit!, a.price.unit!)} against ${perUnitText(b.price.perUnit!, b.price.unit!)}`;

/** The rows `a` is ahead of `b` on, as the row names. */
const rowsAhead = (a: CompareFacts, b: CompareFacts): string[] =>
  ROW_IDS.filter((id) => rowPts(a, id) > rowPts(b, id)).map((id) => lower(rowOf(a, id)?.title ?? id));

/** The checks `a` ticks where `b` has a cross. */
const checksAhead = (a: CompareFacts, b: CompareFacts): string[] =>
  a.checks.filter((c) => c.state === "yes" && b.checks.some((o) => o.label === c.label && o.state === "no")).map((c) => c.label);

function leadersOf(items: CompareFacts[]): Record<RowId, string[]> {
  const out = {} as Record<RowId, string[]>;
  for (const id of ROW_IDS) {
    const rated = items.filter((f) => rowOf(f, id));
    const top = Math.max(0, ...rated.map((f) => rowPts(f, id)));
    const lead = rated.filter((f) => rowPts(f, id) === top);
    // A row where everyone is level has no leader, and a row nobody scores on has none either.
    out[id] = top > 0 && lead.length < rated.length ? lead.map((f) => f.slug) : [];
  }
  return out;
}

/* ── the pick ────────────────────────────────────────────────── */

function otherLine(w: CompareFacts, o: CompareFacts): PickLine {
  const behind: string[] = [];
  if ((TONE_RANK[o.pill.tone] ?? 0) < (TONE_RANK[w.pill.tone] ?? 0)) behind.push(`Rated ${o.pill.label}, against ${w.pill.label} for ${displayName(w)}.`);
  const rows = rowsAhead(w, o);
  if (rows.length) behind.push(`Behind on ${join(rows.slice(0, 3))}.`);
  const missed = checksAhead(w, o);
  if (missed.length) behind.push(`Crosses ${join(missed.slice(0, 2))}, which the pick ticks.`);
  const better: string[] = [];
  const cheaper = cheaperBy(o, w);
  if (cheaper !== null && cheaper >= 0.1) better.push(`costs less per ${o.price.unit} (${priceCompareText(o, w)})`);
  const ticks = checksAhead(o, w);
  if (ticks.length) better.push(`ticks ${join(ticks.slice(0, 2))}, which the pick does not`);
  const ahead = rowsAhead(o, w);
  if (ahead.length) better.push(`is stronger on ${join(ahead.slice(0, 2))}`);
  const still = better.length ? `It ${join(better)}.` : "";
  const text = [...behind, still].filter(Boolean).join(" ");
  return { slug: o.slug, text: text || "Level with the pick on everything the analysis rates." };
}

function reasonsFor(w: CompareFacts, others: CompareFacts[]): string[] {
  const out: string[] = [];
  const lowerTone = others.filter((o) => (TONE_RANK[o.pill.tone] ?? 0) < (TONE_RANK[w.pill.tone] ?? 0));
  if (lowerTone.length) out.push(`Rated ${w.pill.label}. ${join(lowerTone.map((o) => `${displayName(o)} is ${o.pill.label}`))}.`);
  const next = others[0];
  const rows = rowsAhead(w, next);
  if (rows.length) out.push(`Stronger than ${displayName(next)} on ${join(rows.slice(0, 3))}.`);
  const ticks = checksAhead(w, next);
  if (ticks.length) out.push(`Ticks ${join(ticks.slice(0, 2))} where ${displayName(next)} has a cross.`);
  const cheaper = cheaperBy(w, next);
  if (cheaper !== null && cheaper >= 0.1) out.push(`Also costs less per ${w.price.unit}: ${priceCompareText(w, next)}.`);
  return out;
}

function leftOut(f: CompareFacts): PickLine {
  return f.pill.tone === "med"
    ? { slug: f.slug, text: `${displayName(f)} is a medicinal product. It is not rated as a cosmetic, so it is left out of the pick.` }
    : { slug: f.slug, text: `${displayName(f)} does not have enough reliable information to rate yet${f.gaps[0] && !/^nothing important/i.test(f.gaps[0]) ? ` (${lower(f.gaps[0]).replace(/\.$/, "")})` : ""}. It is left out of the pick.` };
}

export function pickFor(items: CompareFacts[]): ComparePick {
  const rated = items.filter(isRated).sort(byRank);
  const left = items.filter((f) => !isRated(f)).map(leftOut);
  const empty = { winner: null, reasons: [], others: [], value: null, left, caveats: [] } satisfies Partial<ComparePick>;

  if (rated.length === 0) {
    return { ...empty, kind: "unrated", headline: "No pick yet", summary: "None of these could be rated: there is not enough reliable information, or they are medicines. Check back after the next analysis." };
  }
  if (rated[0].pill.tone === "look") {
    return { ...empty, kind: "none", headline: "We would not pick any of these", summary: `Every product we could rate here is Look elsewhere. Browse the other ${items[0].type.toLowerCase()} we have analysed instead.`, others: rated.slice(1).map((o) => otherLine(rated[0], o)) };
  }

  const w = rated[0];
  const rest = rated.slice(1);
  const caveats: string[] = [];
  if (w.pill.tone === "caution") caveats.push(`${displayName(w)} is rated ${w.pill.label}, so it is the better of these, not an all-clear. Its page lists the considerations.`);
  if (w.confidence !== "high") caveats.push(`We have ${w.confidence} confidence in the analysis of ${displayName(w)}. Its page says what would raise it.`);
  if (left.length) caveats.push("Products without a rating were left out of the pick.");

  if (rest.length === 0) {
    return { kind: "only", winner: w.slug, headline: `Only ${displayName(w)} could be rated`, summary: `This is not a head-to-head: ${displayName(w)} is the one product here with a rating (${w.pill.label}).`, reasons: [], others: [], value: null, left, caveats };
  }

  const tied = rest.filter((o) => level(w, o));
  const reasons = reasonsFor(w, rest);
  const others = rest.map((o) => otherLine(w, o));

  // A cheaper product with the same pill as the pick is the value choice. One with a lower pill is not: it is simply cheaper, and its line says so.
  const sameTone = rest.filter((o) => o.pill.tone === w.pill.tone);
  const cheapest = [w, ...sameTone].sort((a, b) => (a.price.perUnit ?? Infinity) - (b.price.perUnit ?? Infinity))[0];
  const basis = samePriceBasis([w, ...sameTone]);
  const value = basis && cheapest.slug !== w.slug && (cheaperBy(cheapest, w) ?? 0) >= 0.1
    ? { slug: cheapest.slug, text: `${displayName(cheapest)} has the same ${w.pill.label} rating for ${priceCompareText(cheapest, w)}.` }
    : null;

  if (tied.length) {
    const names = join([w, ...tied].map(displayName));
    const decided = reasons.length ? "" : " The analysis does not separate them; the order here comes down to price and confidence.";
    return {
      kind: "close",
      winner: w.slug,
      headline: `A close call: ${displayName(w)} edges it`,
      summary: `${names} are level on the pill and ingredient safety, and within a point on the other rows.${decided}`,
      reasons, others, value, left, caveats,
    };
  }

  return {
    kind: "pick",
    winner: w.slug,
    headline: `Our pick: ${displayName(w)}`,
    summary: `${displayName(w)} comes out ahead of ${join(rest.map(displayName))} on what the analyses found.`,
    reasons, others, value, left, caveats,
  };
}

export function buildComparison(items: CompareFacts[]): Comparison {
  const basis = samePriceBasis(items);
  const cheapest = basis ? [...items].sort((a, b) => (a.price.perUnit ?? Infinity) - (b.price.perUnit ?? Infinity))[0] : null;
  const allEqual = cheapest ? items.every((f) => f.price.perUnit === cheapest.price.perUnit) : true;
  return {
    type: items[0]?.type ?? "",
    pick: pickFor(items),
    leaders: leadersOf(items.filter(isRated)),
    cheapest: cheapest && !allEqual ? cheapest.slug : null,
  };
}
