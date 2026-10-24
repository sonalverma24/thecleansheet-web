/* ────────────────────────────────────────────────────────────────
   Analyser vX · the copy engine

   Every sentence that states or explains an outcome is built here, from a rule id and
   fixed parameters. No model text appears in a reason. Templates use British spelling
   and the word "analyse"; the lint below enforces the language rules that today exist
   only in the prompt.
──────────────────────────────────────────────────────────────── */

import type { DecisionKey, Finding } from "./types";

export const COPY_VERSION = "copy-1";

export const PILLS: Record<DecisionKey, { label: string; meaning: string }> = {
  "good-choice": { label: "Good choice", meaning: "Evidence supports buying this product for the intended user." },
  "buy-with-caution": { label: "Buy with caution", meaning: "Potentially worthwhile, but there are meaningful considerations." },
  "look-elsewhere": { label: "Look elsewhere", meaning: "Material concerns or poor suitability make alternatives preferable." },
  "not-enough-info": { label: "Not enough info", meaning: "Insufficient reliable evidence for a buying recommendation." },
  "medicinal-product": { label: "Medicinal product", meaning: "Requires assessment under the appropriate medicine framework." },
};

type P = Finding["params"];
const s = (v: unknown, fallback = "the source"): string => (v === undefined || v === null || v === "" ? fallback : String(v));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = (v: unknown): string => {
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? "" : `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
const on = (v: unknown): string => (day(v) ? ` on ${day(v)}` : "");

/** A reader-friendly name for where a list came from: a source kind, or the address it was read at. */
const SOURCE_NAMES: Record<string, string> = {
  incidecoder: "INCIDecoder", brand_page: "the brand's product page", pack: "the pack", retailer: "a retailer page", model: "our own reading of the page",
};
export function sourceName(v: unknown): string {
  const t = String(v ?? "").trim();
  if (!t) return "the source";
  if (SOURCE_NAMES[t]) return SOURCE_NAMES[t];
  if (/^https?:\/\//i.test(t)) {
    try {
      const host = new URL(t).hostname.replace(/^www\./, "");
      return /incidecoder\.com$/.test(host) ? SOURCE_NAMES.incidecoder : host;
    } catch { return "the source"; }
  }
  return t;
}
const clip = (v: unknown): string => { const t = s(v, "this product"); return t.length > 60 ? `${t.slice(0, 57)}...` : t; };
const from = (p: P): string => (p.source ? `from ${sourceName(p.source)}${on(p.capturedAt)}` : "");

const T: Record<string, (p: P) => string> = {
  "med.drug_active": (p) => `Contains ${s(p.active)}, a licensed medicine active in India. It is assessed as a medicine, not a cosmetic.`,
  "med.family": () => "This product type is a medicine class in India, so it is assessed as a medicine, not a cosmetic.",
  "med.register_listed": (p) => `Listed on the ${s(p.register)} as ${clip(p.product)} (${s(p.identifier)})${p.source ? `, read ${from(p)}` : ""}. It is assessed as a medicine, not a cosmetic.`,
  "med.rx_text": () => "The product describes itself as a prescription medicine, so it is assessed as a medicine, not a cosmetic.",

  "block.prohibited": (p) => `${s(p.ingredient)} is prohibited in cosmetics${p.where ? ` in ${s(p.where)}` : ""}. Found in the ingredient list read ${from(p) || "from the product page"}.`,
  "block.contradicted": (p) => `The product says “${s(p.claim)}”, but its ingredient list includes ${s(p.ingredient)} (${from(p) || "from the product page"}).`,
  "block.fairness": () => "The product makes a skin-whitening or fairness claim, which India's advertising code treats as misleading.",
  "block.pillars": (p) => `Two areas of our checks fall short: ${s(p.pillarA)} and ${s(p.pillarB)}. Details are below.`,

  "gap.no_list": (p) => (p.__acq ? "We could not read the ingredient list when we analysed this. We are checking again." : "We could not find a full ingredient list for this product, so we cannot complete our safety check."),
  "gap.list_unreliable": () => "The only ingredient list we found is not from a source we can verify.",
  "gap.formula_conflict": () => "Two sources list different ingredients for this product. We are checking which is current.",
  "gap.identity": () => "We could not confirm exactly which product this is, so we have not judged it.",
  "gap.acquisition": () => "We could not read the product page when we analysed it. We are checking again.",
  "gap.claims_unreliable": () => "We could not confirm the product's claims from text we read, so we have not judged them.",
  "gap.list_blocked": () => "One of our checks flagged something we are still verifying. We will update this page.",
  "gap.possible_medicinal": () => "This may be a medicine rather than a cosmetic. We are verifying before we say more.",
  "gap.support_insufficient": () => "Nothing we checked is a problem, but there is not enough verified evidence to recommend it.",

  "caution.soft_adverse": (p) => `${s(p.label)}: ${s(p.detail)}`,
  "caution.audience": (p) => `${s(p.ingredient)} is ${s(p.note)}. This matters most for ${s(p.audience)} use.`,
  "caution.catch_all": (p) => `The list includes an unnamed entry (${s(p.entry)}), so part of the formula is not disclosed.`,
  "caution.claim_gap": (p) => `The main claim, “${s(p.claim)}”, is not backed by a test on this product that we could find publicly.`,
  "caution.boundary": () => "Some wording goes further than a cosmetic can say in India. Treat it as a cosmetic benefit, not a treatment.",
  "caution.formula": () => "The formula may not deliver everything the claims promise.",
  "caution.list_trust_2": () => "The ingredient list comes from a retailer page only, so check it against the pack.",
  "caution.spf_low": (p) => `SPF ${s(p.spf)} is below the SPF 30 that The Clean Sheet treats as the minimum for daily outdoor use in India.`,
  "caution.benchmark_gap": (p) =>
    p.kind === "exceeded"
      ? `${s(p.authority)} limits ${s(p.ingredient)} to ${s(p.limit)}%; this product states ${s(p.declared)}%.`
      : `${s(p.ingredient)} is not permitted in cosmetics in ${s(p.authority)}. It is not prohibited in the EU or India.`,

  "support.list_verified": (p) => `The ingredient list was read ${from(p) || "from a source we can verify"} and matches the product name.`,
  "support.safety_clear": (p) => Number(p.recognised) >= Number(p.total) ? `No prohibited or flagged ingredient in our screen (all ${s(p.total)} listed ingredients checked).` : `No prohibited or flagged ingredient among the ${s(p.recognised)} of ${s(p.total)} listed ingredients our screen checked.`,
  "support.claims_proportionate": () => "The claims are modest, or the main claims are backed by a test on this product.",
  "support.formula_sound": () => "The formula and format plausibly deliver the claims.",

  "note.endocrine": (p) => `${s(p.ingredient)}: ${s(p.note)}. Legal at its permitted level.`,
  "note.screen_partial": (p) => `${s(p.n)} of ${s(p.total)} listed ingredients ${Number(p.n) === 1 ? "is" : "are"} not in our reference database (${s(p.names)}), so our screen did not check ${Number(p.n) === 1 ? "it" : "them"}.`,
  "note.freshness": (p) => `Evidence last checked${on(p.checkedAt)}. We re-check older analyses.`,
  "note.restricted_unverified": (p) =>
    p.why === "source"
      ? `${s(p.ingredient)} appears as restricted or banned in ${s(p.authority)} in a source we grade as low confidence, so we have not treated it as a finding.`
      : `${s(p.ingredient)} is restricted in ${s(p.authority)}. The product page does not give the strength or conditions we would need to check it.`,
  "note.framework_differs": (p) => `${s(p.detail)}. We assessed it as a cosmetic.`,
  "note.retinoid": (p) => `${s(p.ingredient)} is a retinoid. If you are pregnant or planning a pregnancy, ask your doctor before using it.`,
};

export function render(f: Finding, extra: Record<string, unknown> = {}): string {
  const t = T[f.ruleId];
  if (!t) throw new Error(`no template for rule ${f.ruleId}`);
  const text = t({ ...f.params, ...extra } as P);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const TEMPLATE_IDS = Object.keys(T);

/* ── messages that are not reasons ─────────────────────────────── */

/** What the interface says when there is no analysis to show. Code-built and lint-checked, like the reasons. */
export const MESSAGES = {
  queued: (masked: string) => `We have reached today's analysis limit. We will email ${masked} when the analysis of this product is ready. You can close this page.`,
  queuedAlready: (masked: string) => `You are already on the list for this product. We will email ${masked} when it is ready.`,
  queueLimit: "You already have several analyses waiting. We will email you as each one is ready; please ask again after that.",
  capacitySignedOut: "We have reached today's analysis limit. Please sign in and ask again, and we will email you when the analysis is ready.",
  paused: "New analyses are paused for a short time. Analyses we have already published are still available.",
  unsafeUrl: "We cannot analyse that link. Please paste the product's own page, or type its name.",
  authRequired: "Please sign in to analyse a new product. Analyses we have already published are open to everyone.",
  held: "We are verifying this analysis and will publish it when that is done.",
  commitFailed: "We could not save this analysis. Please try again.",
  askUser: "We have a very similar product already analysed. Is it this one?",
} as const;

/* ── language lint ─────────────────────────────────────────────── */

const FORBIDDEN: { re: RegExp; why: string }[] = [
  { re: /\b(unsafe|toxic|dangerous|poison(?:ous)?|scam|fraud\w*|fake|liar|lying|lie)\b/i, why: "safety or accusation word" },
  { re: /\b(?:definitely|guaranteed?|cure[sd]?)\b|\b100\s*%/i, why: "absolute word" },
  { re: /\bdoes not exist\b|\bno evidence\b/i, why: "assert absence; say 'not publicly visible'" },
  { re: /\banaly[z]e[sd]?\b|\banaly[z]ing\b/i, why: "use British spelling: analyse" },
];

export const MAX_REASON = 220;

export interface LintResult { ok: boolean; problems: string[] }

export function lint(text: string, opts: { allowBanned?: boolean } = {}): LintResult {
  const problems: string[] = [];
  for (const f of FORBIDDEN) if (f.re.test(text)) problems.push(f.why);
  if (!opts.allowBanned && /\bbanned\b/i.test(text)) problems.push("say 'prohibited in cosmetics', built from the ingredient database");
  if (text.length > MAX_REASON) problems.push(`longer than ${MAX_REASON} characters`);
  return { ok: problems.length === 0, problems };
}
