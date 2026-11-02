/* ────────────────────────────────────────────────────────────────
   Analyser Version X1 · the decision

   Precedence is fixed:  Medicinal  >  Look elsewhere  >  Not enough info
                         >  Buy with caution  >  Good choice.

   Settling comes first. A finding that is only trustworthy when the ingredient list is
   reliable (a prohibited ingredient, a contradicted claim) is converted into a gap when
   the list is not reliable: an apparent problem in an unverified list is something to
   verify, never something to publish.

   Then the sections are consulted (owner decision, 2026-10-30): when all five sections of
   the product page are green and the only cautions are ones those sections already measure
   (a claim without a test on this product; a formula that may not deliver), the product is
   a Good choice, and those cautions stay on the page as notes and under Gaps. Every other
   caution is a flag and still holds a product at Buy with caution.
──────────────────────────────────────────────────────────────── */

import { evaluate } from "./rules";
import { MIN_SCREEN_COVERAGE } from "./kb";
import { AUTHORITIES } from "./regulatory";
import { PILLS, render } from "./copy";
import { NAME_SEP, tagOf } from "./tags";
import { safetyMarker } from "./sections";
import type { BenchmarkValue, Decision, DecisionKey, DecisionReason, Finding, RuleContext } from "./types";
import { ANALYSER_METHOD_VERSION } from "./version";

/** Convert list-dependent findings into gaps when the list is not reliable. Pure. */
export function settle(findings: Finding[], ctx: RuleContext): Finding[] {
  if (ctx.list.reliable) return findings;
  const out: Finding[] = [];
  let blocked = false;
  let possibleMedicinal = false;
  for (const f of findings) {
    if (f.needsReliableList && f.severity === "block") { blocked = true; continue; }
    if (f.needsReliableList && f.severity === "medicinal") { possibleMedicinal = true; continue; }
    if (f.needsReliableList && f.severity === "support") continue; // a support that needs a reliable list is void without one
    out.push(f);
  }
  if (blocked) out.push({ ruleId: "gap.list_blocked", severity: "gap", origin: "code", needsReliableList: false, params: {}, derivedFrom: [], gapKind: "disclosure" });
  if (possibleMedicinal) out.push({ ruleId: "gap.possible_medicinal", severity: "gap", origin: "code", needsReliableList: false, params: {}, derivedFrom: [], gapKind: "disclosure" });
  return out;
}

/** Cautions the five sections already measure: a claim without a test on this product (Claims evidence and Test transparency) and a formula that may
    not deliver what the claims promise (Formula logic). Every other caution is a flag the sections do not measure. */
const SECTION_COVERED = new Set(["caution.claim_gap", "caution.formula"]);

/** When all five sections are green, a caution the sections already measure does not hold the product at Buy with caution. The caution becomes a note (the
    page still lists it under Gaps), and "all five sections are Strong" stands in for "the claims are proportionate" as the third support. Nothing else
    changes: a flag (any other caution), a block, a gap or a medicine decides exactly as before, and a context built without sections is untouched. Pure. */
export function agreeWithSections(settled: Finding[], ctx: RuleContext): Finding[] {
  const sections = ctx.sections;
  if (!sections) return settled;
  const cautions = settled.filter((f) => f.severity === "caution");
  if (!cautions.length || !cautions.every((c) => SECTION_COVERED.has(c.ruleId))) return settled;
  if (settled.some((f) => f.severity === "medicinal" || f.severity === "gap" || (f.severity === "block" && f.origin === "code"))) return settled;
  const have = new Set(settled.filter((f) => f.severity === "support").map((f) => f.ruleId));
  if (!have.has("support.list_verified") || !have.has("support.safety_clear")) return settled;
  const safety = safetyMarker({ key: "buy-with-caution", settled: new Set(settled.map((f) => f.ruleId)), screenCoverage: ctx.screen?.coverage ?? 0 });
  if (![safety, sections.formula, sections.claims, sections.tests, sections.clarity].every((m) => m === "green")) return settled;
  return [
    ...settled.map((f) => (f.severity === "caution" ? { ...f, severity: "note" as const } : f)),
    { ruleId: "support.sections_green", severity: "support", origin: "code", needsReliableList: true, params: {}, derivedFrom: [] },
  ];
}

function summarise(b: BenchmarkValue): NonNullable<Decision["basis"]["benchmark"]> {
  return Object.fromEntries(AUTHORITIES.map((a) => {
    const r = b.authorities[a];
    return [a, { verdict: r.verdict, prohibited: r.prohibited.length, exceeded: r.exceeded.length, unverifiable: r.unverifiable.length, notCovered: r.notCovered.length, lowConfidence: r.lowConfidence.length }];
  })) as NonNullable<Decision["basis"]["benchmark"]>;
}

const sev = (fs: Finding[], s: Finding["severity"]) => fs.filter((f) => f.severity === s);

/** A failing pillar only restates the specific finding behind it; show it only when nothing more specific exists. */
function shown(blocks: Finding[]): Finding[] {
  const specific = blocks.filter((b) => b.ruleId !== "block.pillars");
  return specific.length ? specific : blocks;
}

/** When the product page itself could not be read, the missing list and the unjudged claims follow from that: say it once. */
function shownGaps(gaps: Finding[]): Finding[] {
  return gaps.some((g) => g.ruleId === "gap.acquisition") ? gaps.filter((g) => g.ruleId === "gap.acquisition") : gaps;
}

/** The order supports are shown in: the list first, then the screen, then the claims, then the formula. */
const SUPPORT_ORDER = ["support.list_verified", "support.safety_clear", "support.claims_proportionate", "support.sections_green", "support.formula_sound"];

function reasonOf(f: Finding, extra: Record<string, unknown> = {}): DecisionReason {
  const p = f.params;
  const evidence: DecisionReason["evidence"] = {};
  if (typeof p.ingredient === "string") evidence.ingredient = p.ingredient;
  if (typeof p.claim === "string") evidence.claim = p.claim;
  if (typeof p.source === "string") evidence.source = p.source;
  if (typeof p.capturedAt === "string") evidence.capturedAt = p.capturedAt;
  // The ingredients a finding names: the several a soft check matched, the one entry an unnamed-entry finding is about, or the one ingredient it states.
  const named = typeof p.ingredients === "string" ? p.ingredients.split(NAME_SEP) : typeof p.entry === "string" ? [p.entry] : typeof p.ingredient === "string" ? [p.ingredient] : [];
  if (named.length) {
    evidence.ingredients = named.filter(Boolean);
    const tag = tagOf(f);
    if (tag) evidence.tag = tag;
  }
  return {
    ruleId: f.ruleId, kind: f.severity, origin: f.origin,
    text: render(f, extra),
    ...(Object.keys(evidence).length ? { evidence } : {}),
  };
}

function confidence(ctx: RuleContext, key: DecisionKey): Decision["confidence"] {
  if (key === "not-enough-info") return "low";
  const ageDays = (Date.parse(ctx.now) - Date.parse(ctx.profile.analysedAt)) / 86_400_000;
  const cs = ctx.claims.map((c) => c.value);
  const share = cs.length ? cs.filter((c) => c.corroborated === true).length / cs.length : 1;
  const grounded = ctx.acquisition ? ctx.acquisition.grounded !== false || ctx.acquisition.pageFetched === true : true;
  const screenComplete = !!ctx.screen && ctx.screen.total > 0 && ctx.screen.unresolved.length === 0;
  if (key === "medicinal-product") return ctx.list.reliable || ctx.profile.family === "OTC (Eczema)" ? "high" : "medium";
  if (ctx.list.trust <= 2) return "low";
  // Coverage is how sure we are, not what the product is (decision X42): fewer than half the ingredients checked is Low, whatever the pill.
  if (ctx.screen && ctx.screen.coverage < MIN_SCREEN_COVERAGE) return "low";
  if (ctx.list.reliable && ctx.list.anchored && screenComplete && share >= 0.8 && grounded && ageDays <= 180) return "high";
  return "medium";
}

export interface DecideOutput { decision: Decision; findings: Finding[]; settled: Finding[] }

export function decide(ctx: RuleContext): DecideOutput {
  const findings = evaluate(ctx);
  const settled = agreeWithSections(settle(findings, ctx), ctx);
  const medicinal = sev(settled, "medicinal");
  const blocks = sev(settled, "block").filter((b) => b.origin === "code");
  const gaps = sev(settled, "gap");
  const cautions = sev(settled, "caution");
  const supports = sev(settled, "support");
  const notes = sev(settled, "note");

  let key: DecisionKey;
  let driving: Finding[];
  if (medicinal.length) { key = "medicinal-product"; driving = medicinal; }
  else if (blocks.length) { key = "look-elsewhere"; driving = shown(blocks); }
  else if (gaps.length) { key = "not-enough-info"; driving = shownGaps(gaps); }
  else if (cautions.length) { key = "buy-with-caution"; driving = cautions; }
  else {
    // Good choice needs positive support: a verified list, a clean screen and proportionate claims (or, standing in for the claims, all five
    // sections green: see agreeWithSections). A formula that is known to be sound adds a fourth; an unknown formula does not stop it.
    const have = new Set(supports.map((s) => s.ruleId));
    const core = ["support.list_verified", "support.safety_clear", "support.claims_proportionate"];
    if (core.every((id) => have.has(id) || (id === "support.claims_proportionate" && have.has("support.sections_green")))) { key = "good-choice"; driving = [...supports].sort((a, b) => SUPPORT_ORDER.indexOf(a.ruleId) - SUPPORT_ORDER.indexOf(b.ruleId)); }
    else {
      key = "not-enough-info";
      driving = [{ ruleId: "gap.support_insufficient", severity: "gap", origin: "code", needsReliableList: false, params: {}, derivedFrom: [], gapKind: "disclosure" }];
    }
  }

  const acqFailure = driving.some((f) => f.ruleId === "gap.no_list" && f.gapKind === "acquisition");
  const reasons = driving.map((f) => reasonOf(f, f.ruleId === "gap.no_list" ? { __acq: acqFailure } : {}));
  // Notes that matter to a buyer ride along under any outcome except Not enough info.
  // A "regulated differently elsewhere" note says we assessed it as a cosmetic: untrue of a product assessed as a medicine.
  if (key !== "not-enough-info") for (const n of notes) if (!(key === "medicinal-product" && n.ruleId === "note.framework_differs")) reasons.push(reasonOf(n));

  const gapKind = key === "not-enough-info"
    ? (driving.some((f) => f.gapKind === "acquisition") ? "acquisition" : "disclosure")
    : undefined;

  const cs = ctx.claims.map((c) => c.value);
  const decision: Decision = {
    key,
    label: PILLS[key].label,
    meaning: PILLS[key].meaning,
    reasons,
    confidence: confidence(ctx, key),
    ...(gapKind ? { gapKind } : {}),
    basis: {
      listSource: ctx.list.source,
      listTrust: ctx.list.trust,
      listAnchored: ctx.list.anchored,
      claimsChecked: cs.length,
      claimsCorroborated: cs.filter((c) => c.corroborated === true).length,
      grounded: ctx.acquisition ? ctx.acquisition.grounded : null,
      screenCoverage: ctx.screen?.coverage ?? 0,
      analysedAt: ctx.profile.analysedAt,
      benchmark: ctx.benchmark ? summarise(ctx.benchmark) : null,
    },
    version: ANALYSER_METHOD_VERSION,
  };
  return { decision, findings, settled };
}
