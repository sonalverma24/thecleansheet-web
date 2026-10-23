import { describe, expect, it } from "vitest";
import type { ClaimAnalysis, ProductReview } from "@/lib/product-review-types";
import { decideReview } from "./adapter";
import { checkInvariants } from "./invariants";
import type { DecisionKey } from "./types";
import { BASE, NOW, claimOf, evidence, rv } from "./test-helpers";

/* Seeded generator so a failure is reproducible. */
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const POOL = ["Methylparaben", "Hydroquinone", "Parfum", "Sodium Lauryl Sulfate", "Soap Base", "Benzophenone-3", "Ketoconazole", "Retinol", "Cetearyl Alcohol", "Tocopherol", "Sodium Hyaluronate"];
const NAMES = [["Test Face Wash", "Face wash"], ["Daily Sunscreen SPF 20", "Sunscreen"], ["Baby Lotion", "Baby lotion"], ["Anti Dandruff Shampoo", "Shampoo"], ["Hydrating Serum", "Serum"]] as const;
const EV = ["incidecoder", "brandPage", "retailer", "model"] as const;

const CLAIMS: Partial<ClaimAnalysis>[] = [
  { text: "Paraben-Free", types: ["free-from"], primaryType: "free-from" },
  { text: "Reduces dark spots in 4 weeks", types: ["time-bound"], primaryType: "time-bound" },
  { text: "Skin whitening for fairness", primaryType: "appearance", types: ["appearance"] },
  { text: "Hydrates skin", primaryType: "functional", types: ["functional"] },
  { text: "Clinically proven 30% reduction in wrinkles", primaryType: "clinical", types: ["clinical"] },
  { text: "Eliminates dandruff", primaryType: "concern", types: ["concern"], drugBoundaryRisk: true },
  { text: "Dermatologist tested", primaryType: "safety", types: ["safety"] },
];

interface Spec { ev: (typeof EV)[number]; extra: string[]; claims: ClaimAnalysis[]; name: readonly [string, string]; formula: number; overreach: boolean; days: number; noList: boolean; pageFetched: boolean | null }

function spec(r: () => number): Spec {
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
  const extra = POOL.filter(() => r() < 0.18);
  const claims = CLAIMS.filter(() => r() < 0.35).map((c) =>
    claimOf({ ...c, evidenceLevel: (1 + Math.floor(r() * 7)) as ClaimAnalysis["evidenceLevel"], corroborated: pick([true, true, false, undefined]) }));
  return {
    ev: pick(EV), extra, claims, name: pick(NAMES), formula: Math.floor(r() * 16), overreach: r() < 0.2,
    days: Math.floor(r() * 400), noList: r() < 0.12, pageFetched: pick([null, true, false]),
  };
}

function build(s: Spec): { review: ProductReview; pageFetched: boolean | null } {
  const reviewedAt = new Date(Date.parse(NOW) - s.days * 86_400_000).toISOString();
  const review = rv({
    productName: s.name[0], category: s.name[1], reviewedAt, claimMap: s.claims,
    inciIngredients: s.noList ? [] : [...BASE, ...s.extra], ingredientReads: [],
    formulaLogic: { claimOverreach: s.overreach, claimOverreachNote: null, note: "", irritancyConcerns: [] } as unknown as ProductReview["formulaLogic"],
    scores: { ...rv().scores, formulaLogic: s.formula },
  }, evidence[s.ev]());
  return { review, pageFetched: s.pageFetched };
}

const RANK: Record<DecisionKey, number> = { "good-choice": 0, "buy-with-caution": 1, "not-enough-info": 2, "look-elsewhere": 3, "medicinal-product": 4 };
const run = (b: ReturnType<typeof build>) => decideReview(b.review, NOW, { acquisition: { pageFetched: b.pageFetched } });

describe("properties over 400 random analyses", () => {
  const specs = Array.from({ length: 400 }, (_, i) => spec(rng(1000 + i)));

  it("every decision satisfies the invariants", () => {
    for (const [i, s] of specs.entries()) {
      const r = run(build(s));
      const v = checkInvariants(r.decision, r.settled, r.ctx);
      expect(v, `case ${i} ${JSON.stringify({ ev: s.ev, extra: s.extra, name: s.name[0] })} -> ${r.decision.key}`).toEqual([]);
    }
  });

  it("a decision is idempotent: deciding twice gives the same answer", () => {
    for (const s of specs.slice(0, 150)) {
      const b = build(s);
      expect(JSON.stringify(run(b).decision)).toBe(JSON.stringify(run(b).decision));
    }
  });

  it("all five pills occur across the sample (the rules are reachable)", () => {
    const seen = new Set(specs.map((s) => run(build(s)).decision.key));
    expect([...seen].sort()).toEqual(["buy-with-caution", "good-choice", "look-elsewhere", "medicinal-product", "not-enough-info"]);
  });

  it("reliability gating: a model-transcribed list never yields Good choice, and Look elsewhere only through a fairness claim", () => {
    for (const s of specs) {
      const r = run(build({ ...s, ev: "model" }));
      expect(r.decision.key).not.toBe("good-choice");
      if (r.decision.key === "look-elsewhere") {
        expect(r.settled.filter((f) => f.severity === "block").every((f) => !f.needsReliableList), "an unreliable list produced a list-dependent block").toBe(true);
      }
    }
  });

  it("model-only signals never produce Look elsewhere: every Look elsewhere has a code-origin block", () => {
    for (const s of specs) {
      const r = run(build(s));
      if (r.decision.key === "look-elsewhere") expect(r.settled.some((f) => f.severity === "block" && f.origin === "code")).toBe(true);
    }
  });

  it("monotonic: adding a prohibited ingredient never improves the pill", () => {
    for (const s of specs.filter((x) => !x.noList)) {
      const before = run(build(s)).decision.key;
      const after = run(build({ ...s, extra: [...s.extra, "Hydroquinone"] })).decision.key;
      if (before === "medicinal-product") { expect(after).toBe("medicinal-product"); continue; }
      expect(RANK[after], `${before} -> ${after}`).toBeGreaterThanOrEqual(RANK[before]);
    }
  });

  it("monotonic: lowering every claim's evidence never improves the pill", () => {
    for (const s of specs) {
      const before = run(build(s)).decision.key;
      const lowered = { ...s, claims: s.claims.map((c) => ({ ...c, evidenceLevel: Math.max(1, c.evidenceLevel - 2) as ClaimAnalysis["evidenceLevel"] })) };
      const after = run(build(lowered)).decision.key;
      expect(RANK[after], `${before} -> ${after}`).toBeGreaterThanOrEqual(RANK[before]);
    }
  });

  it("monotonic: a failed page fetch never improves the pill", () => {
    for (const s of specs) {
      if (s.pageFetched === false) continue;
      const before = run(build(s)).decision.key;
      const after = run(build({ ...s, pageFetched: false })).decision.key;
      if (before === "medicinal-product" || before === "look-elsewhere") continue; // verified facts stay verified
      expect(RANK[after], `${before} -> ${after}`).toBeGreaterThanOrEqual(RANK[before]);
    }
  });

  it("an unreliable list can never yield an ingredient-based block, however many bad ingredients it holds", () => {
    const s: Spec = { ev: "model", extra: ["Hydroquinone", "Methylparaben", "Ketoconazole"], claims: [claimOf({ text: "Paraben-Free", types: ["free-from"], primaryType: "free-from" })], name: NAMES[0], formula: 12, overreach: false, days: 3, noList: false, pageFetched: true };
    const r = run(build(s));
    expect(r.decision.key).toBe("not-enough-info");
    expect(r.settled.some((f) => f.severity === "block" || f.severity === "medicinal")).toBe(false);
  });
});
