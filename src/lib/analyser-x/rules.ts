/* ────────────────────────────────────────────────────────────────
   Analyser vX · the rule registry

   One table of named rules. Each rule reads the context and returns findings; each
   finding names the rule, says whether it rests on code or on a model's judgement,
   and lists the facts it was derived from. The decision is built only from findings,
   so every pill can be explained rule by rule, and every rule can be counted, tested,
   mutated and audited by id.

   Strata run in order: medicinal, block, gap, caution, support, note.
──────────────────────────────────────────────────────────────── */

import { ambitionOf, residualRisk, type Residual } from "./ladder";
import { claimFlags } from "./claimflags";
import { AUDIENCE_RULES, BLOCKING_AUTHORITIES, DRUG_ACTIVES, FRAMEWORK_NOTES, MEDICINAL_FAMILIES, MIN_SCREEN_COVERAGE, REGISTER_NAMES, REGULATOR_HOST, RX_TEXT_RE, SPF_MINIMUM, STALE_DAYS } from "./kb";
import { AUTHORITIES, AUTHORITY_SHORT, shortList } from "./regulatory";
import type { ClaimValue, Finding, Rule, RuleContext, Severity } from "./types";

const DAY_MS = 86_400_000;

/* ── helpers ───────────────────────────────────────────────────── */

const onRegulatorSite = (url?: string): boolean => {
  try { return !!url && REGULATOR_HOST.test(new URL(url).hostname); } catch { return false; }
};

const claimValues = (ctx: RuleContext): ClaimValue[] => ctx.claims.map((c) => c.value);

const fact = (ctx: RuleContext, ...extra: (string | undefined)[]): string[] =>
  [ctx.list.factId, ...extra].filter((x): x is string => !!x);

/** Percentage read from the product name next to an active ("Azelaic acid 20%"). Unknown is null, never "high enough". */
function concentrationFromName(name: string, active: RegExp): number | null {
  const near = new RegExp(`${active.source}[^%\\d]{0,25}(\\d{1,2}(?:\\.\\d+)?)\\s*%`, "i");
  const before = new RegExp(`(\\d{1,2}(?:\\.\\d+)?)\\s*%[^%]{0,25}${active.source}`, "i");
  const m = name.match(near) ?? name.match(before) ?? name.match(/(\d{1,2}(?:\.\d+)?)\s*%/);
  return m ? parseFloat(m[1]) : null;
}

export function drugActivesIn(inci: string[], productName: string): string[] {
  if (!inci.length) return [];
  const joined = inci.join(" · ");
  return DRUG_ACTIVES.filter((d) => {
    if (!d.re.test(joined)) return false;
    if (d.minConcentration == null) return true;
    const pct = concentrationFromName(productName, d.re);
    return pct != null && pct >= d.minConcentration;
  }).map((d) => d.name);
}

/** A claim that needs proof on the finished product: performance or clinical wording that is not puffery. */
export function needsProof(c: ClaimValue): boolean {
  if (c.emotional || c.corroborated === false) return false;
  const a = ambitionOf(c.text, c.primaryType);
  return a === "performance" || a === "clinical";
}

export const residualOf = (c: ClaimValue): Residual => residualRisk(ambitionOf(c.text, c.primaryType), c.evidenceLevel);

const mk = (
  rule: Pick<Rule, "id" | "severity" | "origin" | "needsReliableList">,
  params: Finding["params"],
  derivedFrom: string[],
  extra: Partial<Finding> = {},
): Finding => ({
  ruleId: rule.id, severity: rule.severity, origin: rule.origin,
  needsReliableList: rule.needsReliableList === true, params, derivedFrom, ...extra,
});

function rule(def: Omit<Rule, "evaluate"> & { evaluate: (ctx: RuleContext, self: Rule) => Finding[] }): Rule {
  const r: Rule = { ...def, evaluate: (ctx) => def.evaluate(ctx, r) };
  return r;
}

/* ── medicinal ─────────────────────────────────────────────────── */

const medicinal: Rule[] = [
  rule({
    id: "med.drug_active", severity: "medicinal", origin: "code", needsReliableList: true, stratum: 10,
    evaluate: (ctx, self) => {
      const names = drugActivesIn(ctx.list.ingredients, ctx.profile.name);
      return names.length ? [mk(self, { active: names.join(", "), source: ctx.list.url, capturedAt: ctx.list.capturedAt }, fact(ctx))] : [];
    },
  }),
  rule({
    id: "med.family", severity: "medicinal", origin: "code", stratum: 10,
    evaluate: (ctx, self) =>
      (MEDICINAL_FAMILIES as readonly string[]).includes(ctx.profile.family) ? [mk(self, { family: ctx.profile.family }, [])] : [],
  }),
  rule({
    id: "med.rx_text", severity: "medicinal", origin: "code", stratum: 10,
    evaluate: (ctx, self) => (ctx.signals.rxText || RX_TEXT_RE.test(ctx.profile.name) ? [mk(self, {}, [])] : []),
  }),
  rule({
    // The only route that supports the word "licensed": an official register lists THIS product (matched by code).
    // The register's silence is never evidence, so there is no rule for absence.
    id: "med.register_listed", severity: "medicinal", origin: "code", stratum: 10,
    evaluate: (ctx, self) =>
      ctx.register.filter((r) => r.value.productMatches && r.trust >= 3 && onRegulatorSite(r.url)).slice(0, 1).map((r) =>
        mk(self, { register: REGISTER_NAMES[r.value.register] ?? r.value.register, identifier: r.value.identifier, product: r.value.productName, source: r.url, capturedAt: r.capturedAt }, [r.fact])),
  }),
];

/* ── blocks: verified problems only ────────────────────────────── */

const blocks: Rule[] = [
  rule({
    id: "block.prohibited", severity: "block", origin: "code", needsReliableList: true, stratum: 20,
    // Only an authority allowed to block can make this a block; an unattributed backstop name is kept, as today.
    evaluate: (ctx, self) =>
      (ctx.screen?.prohibited ?? [])
        .filter((p) => p.authorities.length === 0 || p.authorities.some((a) => (BLOCKING_AUTHORITIES as readonly string[]).includes(a)))
        .map((p) => mk(self, { ingredient: p.name, note: p.note, where: shortList(p.authorities), source: ctx.list.url, capturedAt: ctx.list.capturedAt }, fact(ctx))),
  }),
  rule({
    id: "block.contradicted", severity: "block", origin: "code", needsReliableList: true, stratum: 20,
    evaluate: (ctx, self) =>
      claimFlags(claimValues(ctx), ctx.list.ingredients).contradicted.map((c) =>
        mk(self, { claim: c.claim, ingredient: c.ingredient, source: ctx.list.url, capturedAt: ctx.list.capturedAt }, fact(ctx, ...ctx.claims.filter((x) => x.value.text === c.claim).map((x) => x.fact)))),
  }),
  rule({
    id: "block.fairness", severity: "block", origin: "code", stratum: 20,
    evaluate: (ctx, self) =>
      claimFlags(claimValues(ctx), ctx.list.ingredients).fairness.map((t) =>
        mk(self, { claim: t }, ctx.claims.filter((x) => x.value.text === t).map((x) => x.fact))),
  }),
  rule({
    id: "block.pillars", severity: "block", origin: "code", needsReliableList: true, stratum: 20,
    evaluate: (ctx, self) => {
      const failing = ctx.screen?.failingPillars ?? [];
      // Two failing pillars, at least one of which rests on a code-derived finding (not only the AI-set ASCI and regulatory text).
      const codeDerived = failing.some((p) => p.pillar !== "Standards & Compliance" || p.hardFail);
      return failing.length >= 2 && codeDerived
        ? [mk(self, { pillarA: failing[0].pillar, pillarB: failing[1].pillar }, fact(ctx))]
        : [];
    },
  }),
];

/* ── gaps: not enough to judge ─────────────────────────────────── */

const gaps: Rule[] = [
  rule({
    id: "gap.no_list", severity: "gap", origin: "code", stratum: 30,
    evaluate: (ctx, self) => {
      if (ctx.list.ingredients.length >= 3) return [];
      const acquisitionFailure = ctx.acquisition?.pageFetched === false || (ctx.acquisition?.errors ?? []).some((e) => /page_failed|incidecoder_failed|fetch_failed/.test(e));
      return [mk(self, {}, [], { gapKind: acquisitionFailure ? "acquisition" : "disclosure" })];
    },
  }),
  rule({
    id: "gap.list_unreliable", severity: "gap", origin: "code", stratum: 30,
    evaluate: (ctx, self) => {
      const n = ctx.list.ingredients.length;
      if (n < 3 || ctx.list.conflicting) return [];
      const l = ctx.list;
      // Trust 2 (a retailer page) is a caution, not a gap: see caution.list_trust_2.
      return l.trust <= 1 || (!l.reliable && l.trust >= 3) ? [mk(self, { source: l.source }, fact(ctx), { gapKind: "disclosure" })] : [];
    },
  }),
  rule({
    id: "gap.formula_conflict", severity: "gap", origin: "code", stratum: 30,
    evaluate: (ctx, self) => (ctx.list.conflicting ? [mk(self, {}, fact(ctx), { gapKind: "disclosure" })] : []),
  }),
  rule({
    id: "gap.identity", severity: "gap", origin: "code", stratum: 30,
    evaluate: (ctx, self) => (ctx.profile.identityFromTextOnly ? [mk(self, {}, [], { gapKind: "acquisition" })] : []),
  }),
  rule({
    id: "gap.acquisition", severity: "gap", origin: "code", stratum: 30,
    evaluate: (ctx, self) => {
      const a = ctx.acquisition;
      if (!a) return [];
      return a.pageFetched === false || (a.grounded === false && a.pageFetched !== true)
        ? [mk(self, { errors: a.errors.join(", ") }, [], { gapKind: "acquisition" })]
        : [];
    },
  }),
  rule({
    id: "gap.claims_unreliable", severity: "gap", origin: "code", stratum: 30,
    evaluate: (ctx, self) => {
      const cs = claimValues(ctx);
      const corroborated = cs.filter((c) => c.corroborated !== false).length;
      const unexamined = cs.length === 0 && (ctx.acquisition?.pageFetched === false || ctx.acquisition?.claimsSourceRead === false);
      const bad = (cs.length >= 2 && corroborated / cs.length < 0.5) || unexamined;
      return bad ? [mk(self, { claims: cs.length, corroborated }, [], { gapKind: "acquisition" })] : [];
    },
  }),
  rule({
    id: "gap.screen_incomplete", severity: "gap", origin: "code", stratum: 30,
    evaluate: (ctx, self) =>
      ctx.screen && ctx.list.ingredients.length >= 3 && ctx.screen.coverage < MIN_SCREEN_COVERAGE
        ? [mk(self, { recognised: ctx.screen.recognised, total: ctx.screen.total }, fact(ctx), { gapKind: "disclosure" })]
        : [],
  }),
];

/* ── cautions: meaningful considerations ───────────────────────── */

const cautions: Rule[] = [
  rule({
    id: "caution.soft_adverse", severity: "caution", origin: "code", needsReliableList: true, stratum: 40,
    evaluate: (ctx, self) =>
      (ctx.screen?.softAdverse ?? []).map((s) => mk(self, { label: s.label, detail: s.detail, pillar: s.pillar }, fact(ctx))),
  }),
  rule({
    id: "caution.audience", severity: "caution", origin: "code", stratum: 40,
    evaluate: (ctx, self) => {
      const out: Finding[] = [];
      for (const r of AUDIENCE_RULES) {
        if (!ctx.profile.audience.includes(r.audience)) continue;
        const hit = ctx.list.ingredients.find((n) => r.ingredient.test(n));
        if (hit) out.push(mk(self, { ingredient: hit, audience: r.audience, note: r.note, audienceRule: r.id, reviewed: r.reviewed }, fact(ctx)));
      }
      return out;
    },
  }),
  rule({
    id: "caution.catch_all", severity: "caution", origin: "code", stratum: 40,
    evaluate: (ctx, self) => (ctx.screen?.catchAll.length ? [mk(self, { entry: ctx.screen.catchAll[0], count: ctx.screen.catchAll.length }, fact(ctx))] : []),
  }),
  rule({
    id: "caution.claim_gap", severity: "caution", origin: "model", stratum: 40,
    evaluate: (ctx, self) => {
      const short = ctx.claims.filter((c) => needsProof(c.value) && residualOf(c.value) !== "low");
      if (!short.length) return [];
      const worst = short[0];
      // The finding is code-origin only when every short claim's level came from the ladder rather than a model.
      const fromLadder = short.every((c) => c.value.levelOrigin === "ladder");
      return [mk(self, { claim: worst.value.text, residual: residualOf(worst.value), count: short.length }, short.map((c) => c.fact), { origin: fromLadder ? "code" : "model" })];
    },
  }),
  rule({
    id: "caution.boundary", severity: "caution", origin: "model", stratum: 40,
    evaluate: (ctx, self) => {
      const b = claimFlags(claimValues(ctx), ctx.list.ingredients).boundary;
      return b.length ? [mk(self, { claim: b[0], count: b.length }, [])] : [];
    },
  }),
  rule({
    id: "caution.formula", severity: "caution", origin: "model", stratum: 40,
    evaluate: (ctx, self) => {
      const p = ctx.profile.formulaPoints;
      const weak = p !== null && (p < 8 || (ctx.profile.overreach && p < 11));
      return weak ? [mk(self, { points: p ?? undefined }, [])] : [];
    },
  }),
  rule({
    id: "caution.list_trust_2", severity: "caution", origin: "code", stratum: 40,
    evaluate: (ctx, self) => (ctx.list.ingredients.length >= 3 && ctx.list.trust === 2 && !ctx.list.conflicting ? [mk(self, {}, fact(ctx))] : []),
  }),
  rule({
    id: "caution.spf_low", severity: "caution", origin: "code", stratum: 40,
    evaluate: (ctx, self) =>
      ctx.profile.isSunscreen && ctx.profile.spf !== null && ctx.profile.spf < SPF_MINIMUM ? [mk(self, { spf: ctx.profile.spf }, [])] : [],
  }),
  rule({
    id: "caution.screen_partial", severity: "caution", origin: "code", stratum: 40,
    // Fewer than half recognised is a gap (gap.screen_incomplete). In between, the screen covers part of the list: it
    // can say what it found, never that the product is clear.
    evaluate: (ctx, self) => {
      const s = ctx.screen;
      if (!s || ctx.list.ingredients.length < 3 || s.coverage < MIN_SCREEN_COVERAGE || s.unresolved.length === 0) return [];
      return [mk(self, { n: s.unresolved.length, total: s.total, names: s.unresolved.slice(0, 3).join(", ") }, fact(ctx))];
    },
  }),
  rule({
    id: "caution.benchmark_gap", severity: "caution", origin: "code", needsReliableList: true, stratum: 40,
    // Another authority's prohibition (the EU and India already block), or a strength the product itself states above a limit.
    evaluate: (ctx, self) => {
      const b = ctx.benchmark;
      if (!b || !ctx.list.reliable) return [];
      const out: Finding[] = [];
      for (const a of AUTHORITIES) {
        const r = b.authorities[a];
        const blocks = (BLOCKING_AUTHORITIES as readonly string[]).includes(a);
        if (!blocks && r.prohibited.length) out.push(mk(self, { kind: "prohibited", authority: AUTHORITY_SHORT[a], ingredient: r.prohibited[0], count: r.prohibited.length }, fact(ctx)));
        if (r.exceeded.length) out.push(mk(self, { kind: "exceeded", authority: AUTHORITY_SHORT[a], ingredient: r.exceeded[0].name, limit: r.exceeded[0].limit, declared: r.exceeded[0].declared, count: r.exceeded.length }, fact(ctx)));
      }
      return out;
    },
  }),
];

/* ── supports: positive evidence ───────────────────────────────── */

const supports: Rule[] = [
  rule({
    id: "support.list_verified", severity: "support", origin: "code", stratum: 50,
    evaluate: (ctx, self) =>
      ctx.list.reliable ? [mk(self, { source: ctx.list.source, url: ctx.list.url, capturedAt: ctx.list.capturedAt }, fact(ctx))] : [],
  }),
  rule({
    id: "support.safety_clear", severity: "support", origin: "code", needsReliableList: true, stratum: 50,
    evaluate: (ctx, self) => {
      const s = ctx.screen;
      // "Clear" is a statement about every declared ingredient: each one must have a resolved status first.
      return ctx.list.reliable && s && s.total > 0 && s.unresolved.length === 0 && s.prohibited.length === 0 && s.softAdverse.length === 0
        ? [mk(self, { total: s.total }, fact(ctx))]
        : [];
    },
  }),
  rule({
    id: "support.claims_proportionate", severity: "support", origin: "code", stratum: 50,
    evaluate: (ctx, self) => {
      // Complementary to caution.claim_gap: every claim that needs proof has residual risk "low".
      // Not asserted when the claims themselves are unreliable (gap.claims_unreliable).
      const cs = claimValues(ctx);
      const share = cs.length ? cs.filter((c) => c.corroborated !== false).length / cs.length : 1;
      if (ctx.acquisition?.pageFetched === false || ctx.acquisition?.claimsSourceRead === false || (cs.length >= 2 && share < 0.5)) return [];
      const needing = ctx.claims.filter((c) => needsProof(c.value));
      const ok = needing.every((c) => residualOf(c.value) === "low");
      return ok ? [mk(self, { checked: needing.length }, needing.map((c) => c.fact))] : [];
    },
  }),
  rule({
    id: "support.formula_sound", severity: "support", origin: "model", stratum: 50,
    evaluate: (ctx, self) => {
      const p = ctx.profile.formulaPoints;
      return p !== null && p >= 8 && !(ctx.profile.overreach && p < 11) ? [mk(self, { points: p }, [])] : [];
    },
  }),
];

/* ── notes: shown, never downgrade ─────────────────────────────── */

const notes: Rule[] = [
  rule({
    id: "note.endocrine", severity: "note", origin: "code", needsReliableList: true, stratum: 60,
    evaluate: (ctx, self) => (ctx.screen?.endocrine ?? []).map((e) => mk(self, { ingredient: e.name, note: e.note }, fact(ctx))),
  }),
  rule({
    // Age never makes a product a worse buying choice; it makes the evidence older. We say when it was last checked.
    id: "note.freshness", severity: "note", origin: "code", stratum: 60,
    evaluate: (ctx, self) => {
      const age = (Date.parse(ctx.now) - Date.parse(ctx.profile.analysedAt)) / DAY_MS;
      return Number.isFinite(age) && age > STALE_DAYS ? [mk(self, { checkedAt: ctx.profile.analysedAt, days: Math.round(age) }, [])] : [];
    },
  }),
  rule({
    id: "note.restricted_unverified", severity: "note", origin: "code", stratum: 60,
    // Restricted is not a finding. It is a thing we could not check from public information.
    evaluate: (ctx, self) => {
      const b = ctx.benchmark;
      if (!b || !ctx.list.reliable) return [];
      for (const a of AUTHORITIES) {
        if (b.authorities[a].unverifiable.length) {
          const all = new Set(AUTHORITIES.flatMap((x) => b.authorities[x].unverifiable));
          return [mk(self, { why: "strength", authority: AUTHORITY_SHORT[a], ingredient: b.authorities[a].unverifiable[0], count: all.size }, fact(ctx))];
        }
      }
      for (const a of AUTHORITIES) {
        if (b.authorities[a].lowConfidence.length) return [mk(self, { why: "source", authority: AUTHORITY_SHORT[a], ingredient: b.authorities[a].lowConfidence[0], count: 1 }, fact(ctx))];
      }
      return [];
    },
  }),
  rule({
    id: "note.framework_differs", severity: "note", origin: "code", stratum: 60,
    // The same product type can be a cosmetic in one market and a drug in another (Part 16 of the specification).
    evaluate: (ctx, self) => {
      const text = `${ctx.profile.name} ${ctx.profile.category}`;
      const hit = FRAMEWORK_NOTES.find((f) => (f.id === "fw.sunscreen" && ctx.profile.isSunscreen) || f.test.test(text));
      if (!hit) return [];
      const detail = hit.elsewhere.map((e) => `in ${AUTHORITY_SHORT[e.authority]} it is regulated ${e.as}`).join("; ");
      return [mk(self, { detail, framework: hit.id, reviewed: hit.reviewed }, [])];
    },
  }),
  rule({
    id: "note.retinoid", severity: "note", origin: "code", stratum: 60,
    evaluate: (ctx, self) => {
      const hit = ctx.list.ingredients.find((n) => /\b(retinol|retinal|retinaldehyde|retinyl|tretinoin|adapalene)\b/i.test(n));
      return hit && !ctx.profile.isRinseOff && ctx.profile.isFacial ? [mk(self, { ingredient: hit }, fact(ctx))] : [];
    },
  }),
];

export const RULES: Rule[] = [...medicinal, ...blocks, ...gaps, ...cautions, ...supports, ...notes];

export const RULE_IDS: string[] = RULES.map((r) => r.id);

const ORDER: Record<Severity, number> = { medicinal: 0, block: 1, gap: 2, caution: 3, support: 4, note: 5 };

/** Run every rule. Output order is stable: severity, then rule id, then parameters. */
export function evaluate(ctx: RuleContext, rules: Rule[] = RULES): Finding[] {
  const out = [...rules].sort((a, b) => a.stratum - b.stratum || (a.id < b.id ? -1 : 1)).flatMap((r) => r.evaluate(ctx));
  return out.sort((a, b) => ORDER[a.severity] - ORDER[b.severity] || (a.ruleId < b.ruleId ? -1 : a.ruleId > b.ruleId ? 1 : JSON.stringify(a.params) < JSON.stringify(b.params) ? -1 : 1));
}
