/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ - Deterministic Verdict Engine
   The LLM researches; the code decides.
   - Claim Integrity Score: computed from verdicts, never by the LLM
   - Prohibited-claim safety net: regex catches what the LLM misses
   - Scorecard validation: pillar math + hard-rule caps enforced here
──────────────────────────────────────────────────────────────── */

import type {
  CheckedClaim, ClaimVerdict, ClaimCheckResult, Scorecard, ScorecardPillar, FinalVerdict,
} from "@/lib/types";

export const METHODOLOGY_VERSION = "TCS v3.1";

/* ═══════════════ The Clean Sheet Standard ═══════════════
   ONE verdict. THREE gates. ALL required. Computed in code.
   A product is Clean Sheet Verified only when:
     1. Formula safety   - six-pillar assessment ≥ FORMULA_BAR
     2. Lawful claims    - zero prohibited claims on the label
     3. Honest marketing - claim integrity ≥ HONESTY_BAR (not "Misleading")
   If the claim layer could not run, the verdict is PROVISIONAL -
   nothing is ever Verified without its claims checked. */

export const FORMULA_BAR = 75;
export const HONESTY_BAR = 45;

export function computeVerdict(
  card: Scorecard,
  cf: Pick<ClaimCheckResult, "verdictCounts" | "integrityScore"> | null | undefined,
): FinalVerdict {
  const formulaPass = card.score >= FORMULA_BAR;
  const notPermitted = cf ? (cf.verdictCounts?.not_permitted ?? 0) : null;
  const lawful = cf ? notPermitted === 0 : null;
  const honest = cf ? (cf.integrityScore ?? 0) >= HONESTY_BAR : null;

  const gates: FinalVerdict["gates"] = [
    {
      id: "formula",
      label: "Formula safety",
      passed: formulaPass,
      detail: formulaPass
        ? "Six-pillar assessment cleared The Clean Sheet bar"
        : "Six-pillar assessment fell below the bar - the pillar notes explain where",
    },
    {
      id: "lawful_claims",
      label: "Lawful claims",
      passed: lawful,
      detail: lawful === null
        ? "Claim check unavailable for this run"
        : lawful
          ? "No prohibited claims on the label"
          : `${notPermitted} prohibited claim${notPermitted === 1 ? "" : "s"} found (drug claims or banned marketing language)`,
    },
    {
      id: "honest_claims",
      label: "Honest marketing",
      passed: honest,
      detail: honest === null
        ? "Claim check unavailable for this run"
        : honest
          ? "Marketing claims are substantially supported by evidence"
          : "Most marketing claims could not be supported by public evidence",
    },
  ];

  const status: FinalVerdict["status"] =
    formulaPass && lawful === true && honest === true
      ? "verified"
      : (lawful === null || honest === null)
        ? (formulaPass ? "provisional" : "not_verified")
        : "not_verified";

  return { status, gates, standard: `${METHODOLOGY_VERSION} · three gates, all required` };
}

/* ═══════════════ Prohibited-claim safety net ═══════════════
   Even if the model grades these leniently, code overrides. */
const PROHIBITED_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /chemical[\s-]?free/i, reason: "\"Chemical-free\" is scientifically incoherent - every substance is a chemical. Non-compliant marketing language under TCS standards." },
  { pattern: /toxin[\s-]?free|non[\s-]?toxic/i, reason: "\"Toxin-free\" is meaningless as stated - toxicity depends on dose and exposure." },
  { pattern: /100%\s*safe|completely\s+safe|zero\s+side[\s-]?effects/i, reason: "No cosmetic can guarantee universal safety. Individual reactions always exist." },
  { pattern: /guaranteed\s+result/i, reason: "No cosmetic can guarantee results for all consumers." },
  { pattern: /\b(cures?|treats?|prevents?|heals?)\b.{0,40}\b(acne(?!\s*-?\s*prone)|eczema|psoriasis|dermatitis|rosacea|fungal|infection|disease|dandruff)\b/i, reason: "Drug claim - cosmetics cannot claim to treat, cure, or prevent disease under the Drugs & Cosmetics Act 1940 / CDSCO." },
  { pattern: /whitens?\s+(skin\s+)?permanently|permanent\s+(skin\s+)?(whitening|lightening|fairness)/i, reason: "Permanent skin-tone change claims are misleading and flagged under ASCI guidelines on fairness claims." },
];

function applyProhibitedSafetyNet(claims: CheckedClaim[]): CheckedClaim[] {
  return claims.map((c) => {
    if (c.verdict === "not_permitted") return c;
    const hit = PROHIBITED_PATTERNS.find(({ pattern }) => pattern.test(c.claim));
    if (!hit) return c;
    return {
      ...c,
      verdict: "not_permitted" as ClaimVerdict,
      evidenceLevel: "none" as const,
      requiredLevel: "none" as const,
      explanation: hit.reason,
      regulatoryNote: c.regulatoryNote || hit.reason,
    };
  });
}

/* ═══════════════ Claim Integrity Score ═══════════════
   Deterministic: same verdicts in → same score out.
   Starts at 100. Weighted deductions per claim, floored at 0.
   Products making zero claims score 100 (nothing to mislead about). */
const DEDUCTIONS: Record<ClaimVerdict, number> = {
  verified: 0,
  qualified: 6,
  unverified: 14,
  not_permitted: 25,
};

export function integrityLabelFor(score: number): ClaimCheckResult["integrityLabel"] {
  if (score >= 90) return "Clean";
  if (score >= 70) return "Mostly Clean";
  if (score >= 45) return "Mixed";
  return "Misleading";
}

export function computeClaimIntegrity(rawClaims: CheckedClaim[]): {
  claims: CheckedClaim[];
  integrityScore: number;
  integrityLabel: ClaimCheckResult["integrityLabel"];
  verdictCounts: Record<ClaimVerdict, number>;
} {
  const claims = applyProhibitedSafetyNet(rawClaims);

  const verdictCounts: Record<ClaimVerdict, number> = {
    verified: 0, qualified: 0, unverified: 0, not_permitted: 0,
  };
  let score = 100;
  for (const c of claims) {
    verdictCounts[c.verdict] = (verdictCounts[c.verdict] ?? 0) + 1;
    score -= DEDUCTIONS[c.verdict] ?? 0;
  }
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { claims, integrityScore: score, integrityLabel: integrityLabelFor(score), verdictCounts };
}

/* ═══════════════ Scorecard validation ═══════════════
   Enforces in code what the prompt can only request:
   - pillar scores clamped to [0, max]
   - total = sum of pillars (the LLM's total is discarded)
   - hard-rule caps applied
   - score label recomputed from bands */

const PILLAR_MAXES: Record<string, number> = {
  "Ingredient Safety & Toxicity": 25,
  "Irritation & Allergen Risk": 20,
  "Full Ingredient Disclosure": 20,
  "Regulatory Compliance": 10,
  "Efficacy & Formulation Logic": 15,
  "Transparency Practices": 10,
};

function scoreLabelFor(score: number): Scorecard["scoreLabel"] {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Concern";
}

export function validateScorecard(
  card: Scorecard,
  claimFindings?: Pick<ClaimCheckResult, "claims" | "verdictCounts"> | null,
): Scorecard {
  // 1. Clamp each pillar to its known max
  const pillars: ScorecardPillar[] = (card.pillars || []).map((p) => {
    const max = PILLAR_MAXES[p.name] ?? p.max ?? 0;
    const score = Math.max(0, Math.min(max, Math.round(p.score ?? 0)));
    return { ...p, score, max };
  });

  // 2. Claim layer feeds the scorecard: not_permitted claims hit Regulatory,
  //    unverified claims hit Transparency (bounded, deterministic)
  if (claimFindings) {
    const notPermitted = claimFindings.verdictCounts?.not_permitted ?? 0;
    const unverified = claimFindings.verdictCounts?.unverified ?? 0;
    if (notPermitted > 0) {
      const reg = pillars.find((p) => p.name === "Regulatory Compliance");
      if (reg) {
        const penalty = Math.min(reg.score, notPermitted * 3);
        if (penalty > 0) {
          reg.score -= penalty;
          reg.note = `${reg.note} Claim Check found ${notPermitted} non-compliant claim(s) (−${penalty}).`.trim();
        }
      }
    }
    if (unverified > 0) {
      const tr = pillars.find((p) => p.name === "Transparency Practices");
      if (tr) {
        const penalty = Math.min(tr.score, Math.min(4, unverified * 2));
        if (penalty > 0) {
          tr.score -= penalty;
          tr.note = `${tr.note} ${unverified} marketing claim(s) had no public evidence (−${penalty}).`.trim();
        }
      }
    }
  }

  // 3. Total is the sum of pillars - the LLM's own total is discarded
  let total = pillars.reduce((s, p) => s + p.score, 0);

  // 4. Hard-rule caps, enforced in code
  const disclosure = pillars.find((p) => p.name === "Full Ingredient Disclosure");
  const inciMissing = card.dataSource?.inciFound === false || (disclosure?.score ?? 20) === 0;
  if (inciMissing) total = Math.min(total, 50);

  const allText = [
    ...(card.warn_badges || []),
    ...pillars.map((p) => p.note || ""),
    card.summary || "",
  ].join(" ").toLowerCase();
  const bannedConfirmed = /banned ingredient (confirmed|present|found)|annex ii (violation|listed|banned)/.test(allText);
  if (bannedConfirmed) total = Math.min(total, 40);

  const chemicalFreeClaim = claimFindings?.claims?.some(
    (c) => c.verdict === "not_permitted" && /chemical[\s-]?free|toxin[\s-]?free/i.test(c.claim),
  ) ?? /chemical-free|toxin-free/.test(allText);
  if (chemicalFreeClaim) total = Math.max(0, total - 5);

  total = Math.max(0, Math.min(100, Math.round(total)));

  return { ...card, pillars, score: total, scoreLabel: scoreLabelFor(total) };
}
