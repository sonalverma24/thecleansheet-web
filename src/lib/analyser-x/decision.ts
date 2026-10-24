/* ────────────────────────────────────────────────────────────────
   Analyser vX · the decision

   Precedence is fixed:  Medicinal  >  Look elsewhere  >  Not enough info
                         >  Buy with caution  >  Good choice.

   Settling comes first. A finding that is only trustworthy when the ingredient list is
   reliable (a prohibited ingredient, a contradicted claim) is converted into a gap when
   the list is not reliable: an apparent problem in an unverified list is something to
   verify, never something to publish.
──────────────────────────────────────────────────────────────── */

import { evaluate } from "./rules";
import { MIN_SCREEN_COVERAGE } from "./kb";
import { AUTHORITIES } from "./regulatory";
import { PILLS, render } from "./copy";
import type { BenchmarkValue, Decision, DecisionKey, DecisionReason, Finding, RuleContext } from "./types";

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
const SUPPORT_ORDER = ["support.list_verified", "support.safety_clear", "support.claims_proportionate", "support.formula_sound"];

function reasonOf(f: Finding, extra: Record<string, unknown> = {}): DecisionReason {
  const p = f.params;
  const evidence: DecisionReason["evidence"] = {};
  if (typeof p.ingredient === "string") evidence.ingredient = p.ingredient;
  if (typeof p.claim === "string") evidence.claim = p.claim;
  if (typeof p.source === "string") evidence.source = p.source;
  if (typeof p.capturedAt === "string") evidence.capturedAt = p.capturedAt;
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
  const settled = settle(findings, ctx);
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
    // Good choice needs positive support: a verified list, a clean screen and proportionate claims. A formula that is
    // known to be sound adds a fourth; an unknown formula does not stop it.
    const have = new Set(supports.map((s) => s.ruleId));
    const core = ["support.list_verified", "support.safety_clear", "support.claims_proportionate"];
    if (core.every((id) => have.has(id))) { key = "good-choice"; driving = [...supports].sort((a, b) => SUPPORT_ORDER.indexOf(a.ruleId) - SUPPORT_ORDER.indexOf(b.ruleId)); }
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
    version: "TCS-X 1.0",
  };
  return { decision, findings, settled };
}
