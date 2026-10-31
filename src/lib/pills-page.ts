/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Version X1 product page model

   Turns a stored review, its scorecard and the buying decision into the 13 blocks of the pills page, in the order the page
   shows them:

     1 name, details and image     2 buy links                 3 The Clean Sheet take
     4 at a glance                 5 fit and the Indian market 6 claim check
     7 regulatory check            8 details (five rows)       9 gaps
    10 cheat code                 11 ingredients              12 how to use
    13 FAQ

   Pure: no network, no database, no model, no clock (the date is passed in). Nothing here is stored. Blocks 1 and 11 are the
   scorecard's own fields and are rendered from the product directly.

   Where a sentence states an outcome (the take, the confidence, the claim and regulatory one-liners, the gaps, the FAQ answers)
   it is built here from the decision and from facts, never written by a model. Descriptive notes that a review already carries
   (the formula note, who it suits, the India context, how to use) are shown as stored, as they are today.
──────────────────────────────────────────────────────────────── */

import type { ProductReview } from "@/lib/product-review-types";
import type { ProductScorecard, PregnancyScreen as ProductPregnancyScreen } from "@/data/brands/types";
import { MARKER_OF_PILL, MARKER_WORD, type MarkerName } from "@/components/scorecards/pill-palette";
import { buildAtAGlance } from "@/lib/at-a-glance";
import { reviewInciList } from "@/lib/review-inci";
import { ingredientConcerns, type IngredientConcern } from "@/lib/ingredient-concerns";

import { cheatCodeFor } from "@/data/analysis/cheat-codes";
import {
  ANALYSER_RELEASE, AUTHORITIES, GREEN_FROM, INGREDIENT_CAUTIONS, RED_UNDER, STALE_DAYS, benchmarkPanel, decideReview, reviewSections, safetyMarker, shortList, sourceName, testLevelOfClaims,
  type Authority, type BenchmarkPanel, type Decision, type DecisionKey,
} from "@/lib/analyser-x";

export type PillTone = "good" | "caution" | "look" | "info" | "med";
/** One of the three colour markers, or null when there is nothing to rate ("Not rated" is the absence of a marker, not a fourth colour). */
export type RowMarker = MarkerName | null;

export interface Highlight { label: string; state: "yes" | "no" | "unknown"; detail?: string }
export interface BuyLink { name: string; url: string | null; price: string | null; /** True when the address is the product's own page; false when it is a search for it. */ direct: boolean }
/** What the Regulatory check block shows for each authority. A search of its prohibited list ends one of three ways. */
export interface RegulatoryPanel {
  authorities: { id: Authority; label: string; result: "Meets" | "Falls short" | "None prohibited"; detail: string }[];
}
export interface DetailRow {
  n: string; title: string; oneLiner: string; rating: { word: string; marker: RowMarker }; body: string[];
  /** Ingredient safety only: the ingredients its line (and the findings behind its colour) name, so the page can show which ones the line is about. */
  named?: IngredientConcern[];
}

/** Today's standing, for the layout-only mode: the page is drawn in the new layout but the take card shows the standing the old page shows. `medicine` is a
    stored Licensed Drug, which the old page does not score; the page then hides what only makes sense for a cosmetic. */
export interface StandingView { label: string; tone: PillTone; medicine: boolean }

export interface PillsPageModel {
  /** The analyser release that produced this page model. */
  release: typeof ANALYSER_RELEASE;
  /** "pills": the pill and its confidence are the decision core's. "standing": the take card shows today's standing and no confidence (ANALYSER_NEW_LAYOUT). */
  mode: "pills" | "standing";
  decision: { key: DecisionKey; label: string; meaning: string; confidence: Decision["confidence"]; gapKind?: Decision["gapKind"]; reasons: { ruleId: string; kind: string; text: string }[] };
  /** `tone` picks the icon, `marker` the colour: green, yellow or red, or null for grey (Not enough info, Medicinal product). */
  pill: { key: DecisionKey; label: string; tone: PillTone; marker: MarkerName | null };
  /** Block 3 */
  take: {
    summary: string;
    recommendation: string;
    reason: string;
    confidence: { level: Decision["confidence"]; label: string; sentence: string };
    notes: string[];
  };
  /** Block 2 */
  buyLinks: BuyLink[];
  /** The key actives as the product page names them: the short name only, up to three. See shortActives. */
  keyActives: string[];
  /** Block 4 */
  highlights: Highlight[];
  /** Block 5 */
  fit: { suits: string[]; careful: string[]; india: string; price: string | null };
  /** Block 6: the expansion is the scorecard's claims list. */
  claimCheck: { oneLiner: string };
  /** Block 7 */
  regulatoryCheck: { oneLiner: string; panel: RegulatoryPanel | null };
  /** Block 8: null when there is nothing to rate (a medicine, or a page we could not read). */
  details: DetailRow[] | null;
  /** The rows of the ingredient list that the Ingredient safety findings name, each with the colour of its finding and a short label. Empty when none does. */
  ingredientConcerns: IngredientConcern[];
  /** Block 9 */
  gaps: string[];
  /** Block 10 */
  cheatCode: { title: string; text: string } | null;
  /** Block 12: null when the review carries none of it. */
  howToUse: { routine: string | null; layering: string | null; expect: string | null; later: string | null } | null;
  /** Block 13 */
  faq: { q: string; a: string }[];
  analysedAt: string;
  stale: boolean;
}

/* ── small helpers ───────────────────────────────────────────── */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const dayText = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
const joinAnd = (parts: string[]): string => (parts.length <= 1 ? parts.join("") : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`);
const cap = (t: string): string => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
/** The first one or two sentences, up to about 170 characters: enough for a one-liner that reads as a thought. */
const lead = (t: string | undefined | null): string => {
  const s = (t ?? "").trim();
  if (!s) return "";
  const sentences = s.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) ?? [s];
  let out = sentences[0].trim();
  if (sentences[1] && (out + " " + sentences[1].trim()).length <= 170) out = `${out} ${sentences[1].trim()}`;
  return out.length > 200 ? `${out.slice(0, 197).replace(/\s+\S*$/, "")}...` : out;
};
const firstSentence = (t: string | undefined | null): string => {
  const s = (t ?? "").trim();
  if (!s) return "";
  const m = s.match(/^.*?[.!?](?=\s|$)/);
  const out = (m ? m[0] : s).trim();
  return out.length > 200 ? `${out.slice(0, 197).replace(/\s+\S*$/, "")}...` : out;
};
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
/** "Recreational Sunscreens" is a category label; in a sentence about one product it is singular. */
const singular = (category: string): string => category.replace(/(?<=[a-z]{3})(?<!s)s$/i, "");

const TONE: Record<DecisionKey, PillTone> = {
  "good-choice": "good", "buy-with-caution": "caution", "look-elsewhere": "look", "not-enough-info": "info", "medicinal-product": "med",
};

/** What the pill means for a shopper who is about to buy, in plain words. */
const RECOMMENDATION: Record<DecisionKey, string> = {
  "good-choice": "Good choice: we recommend buying it.",
  "buy-with-caution": "Buy with caution: it may be worth buying, but read the points below first.",
  "look-elsewhere": "Look elsewhere: we would not buy this one.",
  "not-enough-info": "Not enough info: we cannot recommend it either way yet.",
  "medicinal-product": "Medicinal product: it is assessed as a medicine, so ask a pharmacist or doctor before using it.",
};

/* ── block 3: the take, and the confidence in words ──────────── */

const ageDays = (iso: string, now: string): number => (Date.parse(now) - Date.parse(iso)) / 86_400_000;

function confidenceOf(d: Decision, ingredientCount: number, now: string): PillsPageModel["take"]["confidence"] {
  const b = d.basis;
  const unresolved = Math.round((1 - b.screenCoverage) * ingredientCount);
  const limits: string[] = [];
  if (b.listSource !== "none" && (!b.listAnchored || b.listTrust < 3)) limits.push("the ingredient list is not tied to a source we could quote");
  if (b.screenCoverage < 1 && ingredientCount > 0 && unresolved > 0) limits.push(`${plural(unresolved, "ingredient is", "ingredients are")} not in our reference database`);
  if (b.claimsChecked > 0 && b.claimsCorroborated / b.claimsChecked < 0.8) limits.push(`only ${b.claimsCorroborated} of ${b.claimsChecked} ${b.claimsChecked === 1 ? "claim" : "claims"} could be checked against pages we read`);
  if (b.grounded === false) limits.push("this analysis was written without a web search");
  if (ageDays(b.analysedAt, now) > STALE_DAYS) limits.push(`the analysis is from ${dayText(b.analysedAt)}, over six months ago`);

  if (d.confidence === "high") {
    const parts = [`the ingredient list comes from ${sourceName(b.listSource)}`];
    if (ingredientCount > 0) parts.push(`all ${ingredientCount} ingredients were checked`);
    if (b.claimsChecked > 0) parts.push(`${b.claimsCorroborated} of ${b.claimsChecked} ${b.claimsChecked === 1 ? "claim was" : "claims were"} checked against pages we read`);
    return { level: "high", label: "High", sentence: `We are highly confident in this: ${joinAnd(parts)}.` };
  }
  if (d.confidence === "medium") {
    return { level: "medium", label: "Medium", sentence: limits.length ? `We are moderately confident. What holds it back: ${joinAnd(limits)}.` : "We are moderately confident. Some checks could not be completed." };
  }
  const why = d.gapKind === "acquisition" ? "we could not read the product page"
    : limits.length ? joinAnd(limits)
    : "there is not enough reliable evidence to judge this product";
  return { level: "low", label: "Low", sentence: `Our confidence is low: ${why}.` };
}

/* ── The key actives, named briefly ──
   The engine reads key actives as free text: "Mexoryl 400 (Methoxypropylamino Cyclohexenylidene Ethoxyethylcyanoacetate)" and
   "Multiple Broad-Spectrum UV Filters (e.g., Ethylhexyl Salicylate, ...)". On the product page an active is named by its short name. The chemical
   name and the filters a group stands for are already in the ingredient list below the fold and on each ingredient's own page, so nothing is lost. */

/** A group of ingredients rather than one: "Multiple ... Filters (e.g., ...)". Not named in the headline. */
const GROUP_ACTIVE_RE = /^(multiple|various|several|assorted|other)\b|\be\.g\./i;

/** Short names, in order, each once. Brackets and percentages go; "A & B" becomes two actives, so neither is lost and each can link to its own
    ingredient page. A group entry is left out; it is used only when nothing else is named, so the line is never empty. */
export function shortActives(names: readonly string[]): string[] {
  const seen = new Set<string>();
  const single: string[] = [];
  let group = "";
  const clean = (t: string) => t.replace(/\([^)]*\)/g, " ").replace(/\s+\d[\d.]*\s*%/g, " ").replace(/\s+/g, " ").trim();
  for (const raw of names) {
    const full = (raw ?? "").trim();
    const parts = clean(full).split(/\s+(?:&|and)\s+/i).map((p) => p.trim()).filter(Boolean);
    if (!parts.length) continue;
    if (GROUP_ACTIVE_RE.test(full)) { group ||= parts[0]; continue; }
    for (const part of parts) {
      const key = part.toLowerCase();
      if (!seen.has(key)) { seen.add(key); single.push(part); }
    }
  }
  return single.length ? single : group ? [group] : [];
}

/** In a sentence a chemical name is lower case, a trade name or a version is not: "zinc oxide", "Mexoryl 400", "Vitamin B5". The digit tells them apart. */
const inSentence = (name: string): string => (/\d/.test(name) ? name : name.toLowerCase());

function takeOf(d: Decision, review: ProductReview, product: ProductScorecard, inci: string[], now: string): PillsPageModel["take"] {
  const reasons = d.reasons.filter((r) => r.kind !== "note");
  const headline = d.key === "good-choice" ? (reasons.find((r) => r.ruleId === "support.safety_clear") ?? reasons[0]) : reasons[0];
  const category = singular((review.category ?? "").trim().toLowerCase()) || "product";
  const filters = product.productType === "sunscreen" ? inci.filter((i) => MINERAL_FILTER_RE.test(i.trim()) || CHEMICAL_FILTER_RE.test(i)) : [];
  const named = shortActives(product.keyActives.map((a) => a.name)).slice(0, 2);
  const actives = (named.length ? named : filters.slice(0, 3)).map((a) => inSentence(a.trim())).filter(Boolean);
  const summary = inci.length
    ? `This ${category}${actives.length ? `'s key ${actives.length === 1 ? "active is" : "actives are"} ${joinAnd(actives)}` : ` lists ${plural(inci.length, "ingredient", "ingredients")} on its label`}.`
    : "";
  return {
    summary,
    recommendation: RECOMMENDATION[d.key],
    reason: headline?.text ?? "",
    confidence: confidenceOf(d, inci.length, now),
    notes: d.reasons.filter((r) => r.kind === "note").map((r) => r.text),
  };
}

/* ── block 2: buy links ──────────────────────────────────────── */

/** Retailer search addresses. A search is honest where a product address is not known: it finds the product, and claims nothing. */
const RETAILER_SEARCH: { match: RegExp; url: (q: string) => string }[] = [
  { match: /nykaa/i, url: (q) => `https://www.nykaa.com/search/result/?q=${q}` },
  { match: /amazon/i, url: (q) => `https://www.amazon.in/s?k=${q}` },
  { match: /flipkart/i, url: (q) => `https://www.flipkart.com/search?q=${q}` },
  { match: /purplle/i, url: (q) => `https://www.purplle.com/search?q=${q}` },
  { match: /blinkit/i, url: (q) => `https://blinkit.com/s/?q=${q}` },
];

export function buyLinksOf(review: ProductReview, product: ProductScorecard): BuyLink[] {
  if (product.retailerLinks?.length) {
    return product.retailerLinks.map((r) => ({ name: r.name, url: r.url, price: null, direct: true }));
  }
  const q = encodeURIComponent(`${review.brand ?? ""} ${review.productName}`.trim());
  const seen = new Set<string>();
  const out: BuyLink[] = [];
  for (const p of review.priceAcrossPlatforms ?? []) {
    const name = (p.platform ?? "").trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    const search = RETAILER_SEARCH.find((r) => r.match.test(name));
    out.push({ name, url: search ? search.url(q) : null, price: p.price ?? null, direct: false });
  }
  return out;
}

/* ── block 4: at a glance ────────────────────────────────────── */

const MINERAL_FILTER_RE = /^(zinc oxide|titanium dioxide)$/i;
const CHEMICAL_FILTER_RE = /avobenzone|butyl methoxydibenzoylmethane|octocrylene|homosalate|octisalate|ethylhexyl salicylate|ethylhexyl methoxycinnamate|octinoxate|oxybenzone|benzophenone-3|tinosorb|bis-ethylhexyloxyphenol|methylene bis-benzotriazolyl|uvinul|diethylamino hydroxybenzoyl|ethylhexyl triazone|drometrizole|terephthalylidene|phenylbenzimidazole sulfonic/i;
const FRAGRANCE_RE = /\b(parfum|perfume|fragrance|aroma)\b/i;
const ESSENTIAL_OIL_RE = /\bessential\s+oil\b|\b(lavender|lavandula|rose|rosa|bergamot|citrus|rosemary|peppermint|eucalyptus|ylang ylang)\b.{0,35}\boil\b/i;
const AROMATIC_EXTRACT_RE = /\b(lavender|lavandula|rose|rosa|jasmine|jasminum|geranium|pelargonium|ylang|citrus|bergamot|rosemary|rosmarinus|peppermint|mentha|eucalyptus|eugenia|clove|cinnamon|cananga)\b/i;
const AROMATIC_FORM_RE = /\b(extract|water|distillate|hydrosol|oil|essence)\b/i;
const DRYING_ALCOHOL_RE = /^alcohol( denat\.?)?$|^sd alcohol/i;
const FULL_INCI_STATUSES = new Set(["Full INCI on brand PDP", "Full INCI in reference database"]);

/** The pregnancy chip shows only when the screen is sure, in one of two ways:
      a flagged ingredient       "Pregnancy ingredient flag: <names>", even when some other ingredient could not be checked (a caution is a caution);
      a complete screen, no flag "No pregnancy flags found".
    Anything in between (the ingredient list is not source-backed, or an ingredient could not be checked and nothing is flagged) shows no chip at all, neither a caution nor a
    reassurance; the FAQ still answers the question in words. Pregnancy flags describe ingredients and recorded exposure context: no flags found is not a product safety clearance. */
function pregnancyHighlight(p?: ProductPregnancyScreen): Highlight | null {
  if (!p || p.status !== "screened") return null;
  const exposure = p.exposure ? `Recorded exposure category: ${p.exposure}.` : "Exposure category is unknown.";
  if (p.flags.length) {
    const flags = p.flags.map((f) => `${f.ingredient}: ${f.restriction} Source: ${f.source} (confidence: ${f.confidence}).`).join(" ");
    const unknown = p.unknownIngredients.length ? ` Not checked: ${joinAnd(p.unknownIngredients)}.` : "";
    return { label: `Pregnancy ingredient flag${p.flags.length === 1 ? "" : "s"}: ${joinAnd(p.flags.map((f) => f.ingredient))}`, state: "no", detail: `${flags} ${exposure}${unknown} This is an ingredient screen, not a product safety conclusion.` };
  }
  if (p.unknownIngredients.length) return null;
  return { label: "No pregnancy flags found", state: "unknown", detail: `No sourced pregnancy flag was found for the ingredients screened. This is not proof that the product is safe during pregnancy. ${exposure} Ask a healthcare professional about individual use.` };
}

function claimEvidenceHighlights(product: ProductScorecard): Highlight[] {
  const categories = [
    { label: "SPF", pattern: /\bspf\b/i },
    { label: "Dermatologist-tested", pattern: /dermatolog(?:ist|ically)[ -]tested/i },
    { label: "Non-comedogenic", pattern: /non[- ]?comedogenic/i },
    { label: "Vegan claim", pattern: /\bvegan\b/i },
    { label: "Cruelty-free claim", pattern: /cruelty[- ]?free/i },
  ];
  const checks = product.claimsCheck ?? [];
  return categories.flatMap(({ label, pattern }) => {
    const check = checks.find((item) => pattern.test(item.claim));
    if (!check) return [];
    const reviewed = check.evidenceStatus === "Evidence visible" && check.decision === "Publicly supported";
    const contradicted = check.evidenceStatus === "Evidence visible" && check.decision === "Not publicly supported";
    // Short on purpose: the chip is a keyword. The note and the source stay in `detail`, and the Claim check block has the full story.
    const claimLabel = reviewed ? `${label}: supported` : contradicted ? `${label}: not supported` : `${label}: brand claim`;
    const detail = [check.note, check.sourceUrl ? `Source: ${check.sourceUrl}` : ""].filter(Boolean).join(" ");
    return [{ label: claimLabel, state: reviewed ? "yes" as const : contradicted ? "no" as const : "unknown" as const, ...(detail ? { detail } : {}) }];
  });
}

function veganOriginHighlight(product: ProductScorecard): Highlight | null {
  const screen = product.veganScreen;
  if (!screen) return null;
  const state = screen.status === "screened" ? "yes" : screen.status === "conflict" ? "no" : "unknown";
  const label = screen.status === "screened" ? "Vegan ingredient origin screened"
    : screen.status === "conflict" ? `Animal-origin ingredient: ${joinAnd(screen.animalIngredients)}`
    : "Vegan ingredient origin unknown";
  const sources = screen.sources.map((s) => `${s.ingredient}: ${s.source}`).join("; ");
  const unknown = screen.unknownIngredients.length ? ` Unresolved origin: ${joinAnd(screen.unknownIngredients)}.` : "";
  const detail = [sources ? `Ingredient-origin sources: ${sources}.` : "", unknown, "This screen is separate from cruelty-free certification."].filter(Boolean).join(" ");
  return { label, state, ...(detail ? { detail } : {}) };
}

/** The strip shows at most this many chips. */
export const GLANCE_MAX = 5;

/** Every check we can stand behind, a tick or a cross, ticks first and then the crosses (the order the strip shows them in).
    A check we could not make (state "unknown": the ingredient list is not source-backed, the claim is only the brand's, the origin screen is unresolved)
    is not drawn at all: a row of grey "not known" chips says nothing, and where each stands is still in the Claim check, Regulatory check and Gaps blocks.
    Not capped: the FAQ reads its answers from here, so the cap in `capGlance` can never cost one. */
export function verifiedChecks(product: ProductScorecard, inci: string[], preg?: ProductPregnancyScreen): Highlight[] {
  const have = FULL_INCI_STATUSES.has(product.inciCompleteness?.status ?? "") && inci.length > 0;
  const named = (re: RegExp) => inci.some((i) => re.test(i.trim()));
  const fragranceState = !have ? "unknown" : named(FRAGRANCE_RE) || named(ESSENTIAL_OIL_RE) ? "no"
    : inci.some((i) => AROMATIC_EXTRACT_RE.test(i) && AROMATIC_FORM_RE.test(i)) ? "unknown" : "yes";
  const pregnancy = pregnancyHighlight(preg);
  const out: Highlight[] = pregnancy ? [pregnancy] : [];
  out.push({ label: "Fragrance free", state: fragranceState, detail: fragranceState === "unknown"
    ? "A complete ingredient list is unavailable, or an aromatic botanical needs review; no fragrance-free conclusion is made."
    : fragranceState === "yes" ? "Derived from a complete ingredient list. Explicit fragrance declarations and essential oils are treated as not fragrance-free."
    : "The complete ingredient list contains an explicit fragrance declaration or an essential oil." });
  out.push({ label: "Paraben free", state: !have ? "unknown" : named(/paraben/i) ? "no" : "yes" });
  out.push({ label: "Alcohol free", state: !have ? "unknown" : named(DRYING_ALCOHOL_RE) ? "no" : "yes" });
  if (product.productType === "sunscreen") {
    const minerals = inci.filter((i) => MINERAL_FILTER_RE.test(i.trim()));
    if (minerals.length && !inci.some((i) => CHEMICAL_FILTER_RE.test(i))) out.push({ label: "Mineral filters only", state: "yes", detail: `The only UV filters listed are ${joinAnd(minerals.map((m) => m.toLowerCase()))}.` });
  }
  out.push(...claimEvidenceHighlights(product));
  const vegan = veganOriginHighlight(product);
  if (vegan) out.push(vegan);
  const handled = /^(fragrance free|alcohol free|paraben free|spf verified)$/i;
  for (const t of buildAtAGlance(product)) {
    if (handled.test(t.label)) continue;
    out.push({ label: t.label, state: t.value ? "yes" : "no" });
  }
  return [...out.filter((h) => h.state === "yes"), ...out.filter((h) => h.state === "no")];
}

/** At most GLANCE_MAX chips, shown ticks first and then crosses. When there are more checks than room, the crosses are kept before the ticks are:
    the strip never drops a concern to make room for a tick. Empty when nothing could be verified, and then the strip is not drawn. */
export function capGlance(checks: Highlight[]): Highlight[] {
  const crosses = checks.filter((h) => h.state === "no").slice(0, GLANCE_MAX);
  const ticks = checks.filter((h) => h.state === "yes").slice(0, GLANCE_MAX - crosses.length);
  return [...ticks, ...crosses];
}

/** The chips on the page for a product. */
export function highlightsOf(product: ProductScorecard, inci: string[], preg?: ProductPregnancyScreen): Highlight[] {
  return capGlance(verifiedChecks(product, inci, preg));
}

/* ── blocks 6 and 7: the one-liners ──────────────────────────── */

export function claimLine(product: ProductScorecard): string {
  const cs = product.claimsCheck ?? [];
  if (!cs.length) return "We found no marketing claims to check.";
  const supported = cs.filter((c) => c.decision === "Publicly supported").length;
  const unsupported = cs.filter((c) => c.decision === "Not publicly supported").length;
  const needProof = cs.length - supported - unsupported;
  const parts = [`${supported} of ${cs.length} ${cs.length === 1 ? "claim" : "claims"} ${supported === 1 ? "is" : "are"} publicly supported`];
  if (needProof) parts.push(`${needProof} ${needProof === 1 ? "needs" : "need"} proof`);
  if (unsupported) parts.push(`${unsupported} ${unsupported === 1 ? "is" : "are"} not publicly supported`);
  return `${cap(parts.join("; "))}.`;
}

/** The decision core's panel says more than the block shows: how many ingredients our reference data does not cover is counted there (it caps the pill, lowers
    the confidence and is listed under Gaps) but is not repeated on every authority line. Here each authority reads as the search it is of that authority's
    prohibited list: "Meets" when every declared ingredient was checked, "Falls short" when something is prohibited, otherwise "None prohibited". */
export function regulatoryPanel(panel: BenchmarkPanel | null): RegulatoryPanel | null {
  if (!panel) return null;
  const withoutCoverage = (detail: string) => detail.replace(/;\s*\d+ ingredients? (?:is|are) not covered by our reference data/g, "");
  return {
    authorities: panel.authorities.map((a) => ({
      id: a.id, label: a.label,
      result: a.result === "Not fully checked" ? "None prohibited" : a.result,
      detail: withoutCoverage(a.detail),
    })),
  };
}

export function regulatoryLine(d: Decision, panel: BenchmarkPanel | null, medicine: boolean = d.key === "medicinal-product"): string {
  if (medicine) return "Assessed as a medicine, so the cosmetic ingredient rules do not apply.";
  if (!panel) return "We cannot complete this check without a full ingredient list.";
  const by = (r: string) => panel.authorities.filter((a) => a.result === r).map((a) => a.id as Authority);
  const meets = by("Meets"), falls = by("Falls short"), partial = by("Not fully checked");
  if (meets.length === panel.authorities.length) return `Every declared ingredient meets the cosmetic rules of ${shortList(meets)}.`;
  if (!falls.length && !meets.length) {
    const unverifiable = Math.max(0, ...AUTHORITIES.map((a) => d.basis.benchmark?.[a].unverifiable ?? 0));
    const note = unverifiable ? `; ${plural(unverifiable, "restricted ingredient has", "restricted ingredients have")} no stated strength to check` : "";
    return `None prohibited in ${shortList(partial)}${note}.`;
  }
  const parts: string[] = [];
  if (falls.length) parts.push(`Falls short in ${shortList(falls)}`);
  if (meets.length) parts.push(`${falls.length ? "meets" : "Meets"} ${shortList(meets)}`);
  if (partial.length) parts.push(`${parts.length ? "none prohibited in" : "None prohibited in"} ${shortList(partial)}`);
  const lead = `${parts.join("; ")}.`;
  const block = d.reasons.find((r) => r.kind === "block" && r.ruleId !== "block.pillars");
  return block && falls.length ? `${lead} ${firstSentence(block.text)}` : lead;
}

/* ── block 8: the five detail rows ───────────────────────────── */

/** A row's marker from its percentage (the cut-offs and the rule are in analyser-x/sections.ts, which the decision reads too). */
export { GREEN_FROM, RED_UNDER };
const markerRow = (marker: MarkerName): { word: string; marker: RowMarker } => ({ word: MARKER_WORD[marker], marker });
const NOT_RATED: { word: string; marker: RowMarker } = { word: "Not rated", marker: null };

/** The public-evidence ladder, in the words a shopper reads. */
const LADDER_PLAIN: Record<number, string> = {
  1: "No supporting proof is publicly visible.",
  2: "Only general ingredient research supports the claims, not a test of this product.",
  3: "Ingredient percentages are disclosed; no test report is public.",
  4: "The brand says the finished product was tested; no report is public.",
  5: "A named third-party lab report is public; the full method may not be.",
  6: "A clinical study with sample size, duration and method is available.",
  7: "A published or registered study you can look up.",
};
/** The strongest public evidence among the claims that promise a result; failing that, among all claims. */
export function testLevelOf(review: ProductReview): number {
  return testLevelOfClaims(review.claimMap ?? []);
}

/** The generic note an ingredient gets when we hold no row for it, from inci-enrich.ts. Today's page still shows it; the pills page does not. */
const NOT_HELD_NOTE = /\bnot in our (analysed |reference )?(database|data)\b/i;
export const isNotHeldNote = (note?: string): boolean => Boolean(note && NOT_HELD_NOTE.test(note));

function detailsOf(d: Decision, settled: Set<string>, review: ProductReview, product: ProductScorecard, medicine: boolean = d.key === "medicinal-product", concerns: IngredientConcern[] = []): DetailRow[] | null {
  if (medicine || (d.key === "not-enough-info" && d.gapKind === "acquisition")) return null;
  const pillar = (re: RegExp) => product.pillars.find((p) => re.test(p.name))?.note ?? "";

  // 1. Ingredient safety: from the decision's own findings (analyser-x/sections.ts holds the rule, and the decision reads it too).
  const safetyReasons = d.reasons.filter((r) => r.ruleId.startsWith("block.") || INGREDIENT_CAUTIONS.has(r.ruleId) || r.ruleId === "note.screen_partial" || r.ruleId === "support.safety_clear");
  const safetyColour = safetyMarker({ key: d.key, settled, screenCoverage: d.basis.screenCoverage });
  const safety = safetyColour === null ? NOT_RATED : markerRow(safetyColour);
  // The row's words leave out the coverage gap ("N of M listed ingredients are not in our reference database"), as the Regulatory check does:
  // the gap lowers the confidence and is listed under Gaps. It sets this row's rating only when fewer than half the list was checked; it never moves the pill.
  const safetyTexts = safetyReasons.filter((r) => r.ruleId !== "note.screen_partial");
  const safetyLine = safety.marker === null ? "We could not complete the ingredient screen." : firstSentence(safetyTexts[0]?.text) || "Ingredient list screened for prohibited and flagged ingredients.";

  // The ingredients the reads singled out as worth a caution or a note, with the reason, for the row's detail. An ingredient we hold no row for
  // has no real note ("Not in our analysed database; ..."), so it is not listed here.
  const flagged = product.ingredients.filter((i) => i.flag !== "ok" && i.note && !isNotHeldNote(i.note)).slice(0, 4);

  // 2. Formula logic.
  const f = review.formulaLogic;
  const checks = [f?.heroIngredientsMatchClaim, f?.formatSuitableForClaim, f?.activesLikelyMeaningful, f?.baseFormulaAppropriate].filter((x) => x === true).length;
  const formulaLine = lead(f?.note) || (f?.claimOverreach ? "The claims promise more than the formula can deliver." : checks === 4 ? "The formula suits what it claims to do." : `${checks} of 4 formula checks pass.`);

  // Formula logic, Claims evidence, Test transparency and Consumer clarity take their colours from the same function the decision reads
  // (analyser-x/sections.ts), so a row on the page and the check the decision makes about it cannot disagree.
  const sec = reviewSections(review);
  const colour = (m: typeof sec.formula) => markerRow((m ?? "red") as MarkerName);

  // 3. Claims evidence: its colour is sec.claims.

  // 4. Test transparency.
  const level = testLevelOf(review);
  const evidenceNotes = [...(review.claimMap ?? [])].filter((c) => c.evidenceNote).sort((a, b) => b.evidenceLevel - a.evidenceLevel).slice(0, 3).map((c) => `${c.text}: ${c.evidenceNote}`);

  // 5. Consumer clarity.
  const it = review.ingredientTransparency;
  const gaps = [it && it.usageWarningsClear === false ? "usage warnings" : "", it && it.phDisclosedWhereRelevant === false ? "pH" : "", it && it.activePercentagesDisclosed === false ? "active strengths" : ""].filter(Boolean);

  return [
    { n: "01", title: "Ingredient safety", oneLiner: safetyLine, rating: safety, body: [...flagged.map((i) => `${i.name}: ${i.note}`), ...safetyTexts.slice(1).map((r) => r.text)].filter(Boolean), ...(concerns.length ? { named: concerns } : {}) },
    { n: "02", title: "Formula logic", oneLiner: formulaLine, rating: colour(sec.formula), body: [f?.note ?? "", f?.claimOverreachNote ?? "", f?.irritancyConcerns?.length ? `Worth knowing: ${joinAnd(f.irritancyConcerns)}.` : ""].filter(Boolean) },
    { n: "03", title: "Claims evidence", oneLiner: claimLine(product), rating: colour(sec.claims), body: [pillar(/claim support|claim/i)].filter(Boolean) },
    { n: "04", title: "Test transparency", oneLiner: LADDER_PLAIN[Math.min(7, Math.max(1, level))], rating: colour(sec.tests), body: evidenceNotes },
    { n: "05", title: "Consumer clarity", oneLiner: gaps.length ? `Clear overall, with ${plural(gaps.length, "gap", "gaps")} in guidance: ${joinAnd(gaps)}.` : "Clear claims, ingredients and instructions.", rating: colour(sec.clarity), body: [pillar(/clarity/i), ...(it?.issues ?? [])].filter(Boolean) },
  ];
}

/* ── block 9: gaps ───────────────────────────────────────────── */

const GAP_TEXT: Record<string, (r: { evidence?: { claim?: string; ingredient?: string } }, d: Decision) => string | null> = {
  "caution.claim_gap": (r) => (r.evidence?.claim ? `A test on the finished product for “${r.evidence.claim}”.` : "A test on the finished product for the main claim."),
  "caution.free_from_unverified": (r) => (r.evidence?.claim ? `Proof that “${r.evidence.claim}” holds${r.evidence.ingredient ? `, given the list shows ${r.evidence.ingredient}` : ""}.` : "Proof that the “free from” claims hold, given the ingredient list."),
  "note.screen_partial": () => "Reference data for every listed ingredient, so our screen covers them all.",
  "note.user_percentage": (r) => (r.evidence?.claim ? `The test details (sample size, duration, method) behind “${r.evidence.claim}”.` : "The test details behind the “% of users” figures."),
  "caution.list_trust_2": () => "The ingredient list confirmed against the pack or the brand's own page.",
  "caution.catch_all": () => "A full disclosure of the unnamed entry in the ingredient list.",
  "caution.formula": () => "Evidence that the formula delivers what the claims promise.",
  "caution.boundary": () => "Claim wording that stays within what a cosmetic can say in India.",
  "caution.spf_low": () => "An SPF of 30 or more for daily outdoor use.",
  "gap.no_list": () => "A full ingredient list published by the brand.",
  "gap.list_unreliable": () => "An ingredient list from a source we can verify: the brand's page, a pack photograph or INCIDecoder.",
  "gap.formula_conflict": () => "Agreement between the sources on which formula is current.",
  "gap.identity": () => "Confirmation of exactly which product this is.",
  "gap.acquisition": () => "A successful read of the product page. We are checking again.",
  "gap.claims_unreliable": () => "Claims we can confirm from text we read.",
  "note.freshness": (_r, d) => `A fresh check: this analysis is from ${dayText(d.basis.analysedAt)}.`,
};

const NEXT_RUNG: Record<number, string> = {
  1: "Any public test of the finished product.",
  2: "A named third-party lab report on the finished product.",
  3: "A named third-party lab report on the finished product.",
  4: "A named third-party lab report on the finished product.",
  5: "A clinical study with sample size, duration and method.",
  6: "A published or registered study you can look up.",
};

export function gapsOf(d: Decision, product: ProductScorecard, review: ProductReview, medicine: boolean = d.key === "medicinal-product"): string[] {
  const out: string[] = [];
  const claimsAlready = new Set<string>();
  for (const m of product.missingProof ?? []) { out.push(m); claimsAlready.add(m.toLowerCase()); }
  for (const r of d.reasons) {
    const t = GAP_TEXT[r.ruleId]?.(r, d);
    if (!t) continue;
    // A claim already listed from the claim analysis is not listed again from the decision.
    if ((r.ruleId === "caution.claim_gap" || r.ruleId === "note.user_percentage") && r.evidence?.claim && [...claimsAlready].some((m) => m.includes(r.evidence!.claim!.toLowerCase().slice(0, 30)))) continue;
    out.push(t);
  }
  if (!medicine && d.key !== "not-enough-info") {
    const next = NEXT_RUNG[Math.min(6, Math.max(1, testLevelOf(review)))];
    if (next && !out.length) out.push(next);
  }
  return out.length ? [...new Set(out)] : ["Nothing important is missing from the public information we found."];
}

/* ── block 12: how to use ────────────────────────────────────── */

/**
 * "Who should be careful" is a TCS product-fit summary, not a channel for
 * replaying a model-written pregnancy note or another publisher's caution label.
 * Pregnancy and teen context is rendered from the structured TCS ingredient
 * screen in the highlight and FAQ, where its flags, exposure and unknowns are explicit.
 */
const MEDICAL_AUDIENCE_NOTE_RE = /\b(?:pregnan(?:cy|t)|breast[\s-]?feed(?:ing)?|lactat(?:e|ed|ing|ion)|teen(?:s|ager)?|adolescen(?:t|ts|ce)|infants?|children?|minors?)\b/i;
const THIRD_PARTY_ATTRIBUTION_RE = /\b(?:according to|as (?:reported|stated|noted|flagged|reviewed) by|(?:review(?:er)?|site|website|report|publisher)\s+(?:flags?|notes?|states?|says?|warns?|advises?)|[a-z0-9-]+\.(?:com|org|net|in)\b|dermatocare|incidecoder|nykaa|(?:pregnancy|teens)caution)\b/i;

function fitCautionsOf(review: ProductReview): string[] {
  return (review.consumerSuitability?.avoidIf ?? [])
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && !MEDICAL_AUDIENCE_NOTE_RE.test(item) && !THIRD_PARTY_ATTRIBUTION_RE.test(item))
    .slice(0, 4);
}

function howToUseOf(review: ProductReview): PillsPageModel["howToUse"] {
  const c = review.consumerSuitability;
  const pick = (t: string | undefined) => (t && t.trim().length > 3 ? t.trim() : null);
  const out = { routine: pick(c?.routineFit), layering: pick(c?.layeringNotes), expect: pick(c?.immediateExpectation), later: pick(c?.longTermExpectation) };
  return Object.values(out).some(Boolean) ? out : null;
}

/* ── block 13: FAQ ───────────────────────────────────────────── */

function faqOf(m: Omit<PillsPageModel, "faq">, review: ProductReview, product: ProductScorecard, preg: ProductPregnancyScreen | undefined, medicine: boolean, checks: Highlight[]): PillsPageModel["faq"] {
  const name = product.productName;
  const out: PillsPageModel["faq"] = [];
  // From every verified check, not the chips on the page: the strip is capped and the answer must not depend on the cap.
  const frag = checks.find((h) => h.label === "Fragrance free");
  if (frag && frag.state !== "unknown") out.push({ q: `Is ${name} fragrance free?`, a: frag.state === "yes" ? "The complete ingredient list we reviewed contains no explicit fragrance declaration or essential oil." : "The complete ingredient list names an explicit fragrance declaration or essential oil." });
  const pregExposure = preg?.exposure ?? "unknown";
  const pregAnswer = !preg || preg.status !== "screened"
    ? `The ingredient screen is incomplete; unknown ingredients remain. Exposure category: ${pregExposure}. This is not a product safety conclusion. Ask a healthcare professional.`
    : preg.flags.length
      ? `Ingredient-level flags from our reference data: ${preg.flags.map((f) => `${f.ingredient}: ${f.restriction} (source: ${f.source})`).join("; ")}. Exposure category: ${pregExposure}. This is not a product safety conclusion. Ask a healthcare professional.`
      : `No sourced pregnancy flags were found for the ingredients screened. This is not proof that the product is safe during pregnancy. Exposure category: ${pregExposure}.${preg.unknownIngredients.length ? ` Ingredients not resolved: ${joinAnd(preg.unknownIngredients)}.` : ""} Ask a healthcare professional.`;
  if (!medicine) out.push({ q: "Can I use it during pregnancy?", a: pregAnswer });
  const india = m.regulatoryCheck.panel?.authorities.find((a) => a.id === "IN");
  if (india) out.push({ q: "Is it allowed in India?", a: india.result === "Meets" ? "We found no ingredient in the list we read that is prohibited or over a stated limit under India's Cosmetics Rules 2020." : india.detail });
  if (m.fit.price || m.buyLinks.length) {
    const where = m.buyLinks.filter((b) => b.price).map((b) => `${b.name} ${b.price}`);
    out.push({ q: "What does it cost, and where can I buy it?", a: [m.fit.price ? `${m.fit.price}.` : "", where.length ? `Seen at ${joinAnd(where)}.` : ""].filter(Boolean).join(" ") });
  }
  out.push({ q: "Does it do what it says?", a: m.claimCheck.oneLiner });
  if (m.fit.careful.length) out.push({ q: "Who should be careful with it?", a: `People to take care with: ${m.fit.careful.map((c) => c.replace(/[.\s]+$/, "")).join("; ")}.` });
  out.push({ q: "How recent is this analysis?", a: `Analysed on ${dayText(m.analysedAt)} from ${sourceName(review.inciEvidence?.sourceUrl ?? review.dataSource?.inciSource ?? "")}. We re-check analyses older than six months${m.stale ? "; this one is due a re-check" : ""}.` });
  return out;
}

/* ── the model ───────────────────────────────────────────────── */

const priceLineOf = (review: ProductReview): string | null => {
  const base = (review.lowestPrice || review.priceRange || "").trim();
  if (!base) return null;
  const size = (review.quantity ?? "").trim();
  const per = (review.pricePerMl ?? "").trim();
  return `${size ? `${size} · ` : ""}${review.lowestPrice ? "from " : ""}${base}${per ? ` (${per})` : ""}`;
};

export function buildPillsPage(review: ProductReview, product: ProductScorecard, now: string, out = decideReview(review, now), standing?: StandingView): PillsPageModel {
  const d = out.decision;
  // The layout-only mode shows today's standing, so "is it a medicine" is today's answer (a stored Licensed Drug), not the decision core's.
  const medicine = standing ? standing.medicine : d.key === "medicinal-product";
  const settled = new Set(out.settled.map((f) => f.ruleId));
  const inci = reviewInciList(review);
  const preg = product.pregnancyScreen;
  const checks = verifiedChecks(product, inci, preg);
  const panel = benchmarkPanel(d);
  const concerns = ingredientConcerns(product.ingredients, d.reasons);
  const base: Omit<PillsPageModel, "faq"> = {
    release: ANALYSER_RELEASE,
    mode: standing ? "standing" : "pills",
    decision: { key: d.key, label: d.label, meaning: d.meaning, confidence: d.confidence, ...(d.gapKind ? { gapKind: d.gapKind } : {}), reasons: d.reasons.map((r) => ({ ruleId: r.ruleId, kind: r.kind, text: r.text })) },
    pill: standing ? { key: d.key, label: standing.label, tone: standing.tone, marker: MARKER_OF_PILL[standing.tone] } : { key: d.key, label: d.label, tone: TONE[d.key], marker: MARKER_OF_PILL[TONE[d.key]] },
    take: takeOf(d, review, product, inci, now),
    buyLinks: buyLinksOf(review, product),
    keyActives: shortActives(product.keyActives.map((a) => a.name)).slice(0, 3),
    highlights: capGlance(checks),
    fit: {
      suits: [...(review.consumerSuitability?.bestFor ?? [])].filter(Boolean),
      careful: fitCautionsOf(review),
      india: product.indiaContext,
      price: priceLineOf(review),
    },
    claimCheck: { oneLiner: claimLine(product) },
    regulatoryCheck: { oneLiner: regulatoryLine(d, panel, medicine), panel: medicine ? null : regulatoryPanel(panel) },
    details: detailsOf(d, settled, review, product, medicine, concerns),
    ingredientConcerns: concerns,
    gaps: gapsOf(d, product, review, medicine),
    cheatCode: medicine ? null : (() => { const c = cheatCodeFor(product.productType, inci); return c ? { title: c.title, text: c.text } : null; })(),
    howToUse: medicine ? null : howToUseOf(review),
    analysedAt: d.basis.analysedAt,
    stale: ageDays(d.basis.analysedAt, now) > STALE_DAYS,
  };
  return { ...base, faq: faqOf(base, review, product, preg, medicine, checks) };
}
