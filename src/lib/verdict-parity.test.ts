import { describe, expect, it } from "vitest";
import { deriveVerdict, reconcileReviewScores } from "@/lib/product-review-engine";
import { reviewToScorecard } from "@/lib/review-to-scorecard";
import { buildAtAGlance, buildAtAGlanceAnalyzedPage } from "@/lib/at-a-glance";
import { tierToRating } from "@/components/scorecards/pillar-ui";
import { buildStanding, makeReview, type StandingTarget } from "@/lib/review.fixtures";
import { ANALYSER_FLAGS, isFlagOn } from "@/lib/analyser-flags";

/* PARITY: with every analyser flag off, verdicts, the At a glance ticks (both copies of
   the function) and the JSON-LD rating are identical to today. Pitch-stamp eligibility is
   pinned too once the pitch demo is on this branch's base.
   The snapshot below was recorded from the code as it stands BEFORE any policy change.
   A rollout step that alters it has changed what shoppers see, and the diff is the
   preview. Regenerating it is a deliberate act that belongs in the same commit as the
   flag that justifies it. */

const TARGETS: StandingTarget[] = ["approved", "mostly-clean", "can-do-better", "not-recommended", "not-assessed"];

function observe(r: ReturnType<typeof buildStanding>) {
  const v = deriveVerdict(r);
  const { product } = reviewToScorecard(r, v);
  return {
    tier: v.tier, tierLabel: v.tierLabel, status: v.status, headline: v.headline,
    gates: v.gates.map((g) => `${g.id}:${g.passed}`),
    total: reconcileReviewScores(r).scores.total,
    ticksMain: buildAtAGlance(product).map((t) => `${t.label}:${t.value}`),
    ticksAnalyzedPage: buildAtAGlanceAnalyzedPage(product).map((t) => `${t.label}:${t.value}`),
    jsonLdRating: tierToRating(v.tier) ?? null,
  };
}

const MATRIX = TARGETS.flatMap((target) =>
  [false, true].flatMap((catchAll) =>
    [false, true].map((noList) => ({ key: `${target} | catchAll=${catchAll} | list=${noList ? "absent" : "present"}`, target, catchAll, noList })),
  ),
);

describe("flags are off in the test environment", () => {
  it.each(Object.values(ANALYSER_FLAGS))("%s is off", (name) => {
    expect(isFlagOn(name)).toBe(false);
  });
});

describe("parity matrix: standing x catch-all x ingredient list", () => {
  it("lands each target on the internal tier it was built for (when a list is present)", () => {
    for (const target of TARGETS) {
      expect(observe(buildStanding(target)).tier).toBe(target);
    }
  });

  it("snapshot of current behaviour across the whole matrix", () => {
    const snapshot = Object.fromEntries(MATRIX.map((m) => [m.key, observe(buildStanding(m.target, { catchAll: m.catchAll, noList: m.noList }))]));
    expect(snapshot).toMatchSnapshot();
  });

  it("today's output ignores evidence status and disputes entirely", () => {
    for (const m of MATRIX) {
      const base = observe(buildStanding(m.target, { catchAll: m.catchAll, noList: m.noList }));
      for (const evidence of ["anchored", "unverified"] as const) {
        for (const dispute of [false, true]) {
          const variant = observe(buildStanding(m.target, { catchAll: m.catchAll, noList: m.noList, evidence, dispute }));
          expect(variant, `${m.key} evidence=${evidence} dispute=${dispute}`).toEqual(base);
        }
      }
    }
  });

  it("recompute is idempotent", () => {
    for (const m of MATRIX) {
      const r = buildStanding(m.target, { catchAll: m.catchAll, noList: m.noList });
      expect(deriveVerdict(r)).toEqual(deriveVerdict(r));
    }
  });
});

describe("invariants any later policy must keep", () => {
  it("only displayed Good Standing can ever be eligible for a Provisional state", () => {
    const eligible = TARGETS.filter((t) => ["Good Standing"].includes(deriveVerdict(buildStanding(t)).tierLabel));
    expect(eligible).toEqual(["approved", "mostly-clean"]);
  });

  it("Room to Improve, Not Recommended and Licensed Drug are distinct from Good Standing today", () => {
    const labels = Object.fromEntries(TARGETS.map((t) => [t, deriveVerdict(buildStanding(t)).tierLabel]));
    expect(labels).toEqual({
      approved: "Good Standing", "mostly-clean": "Good Standing", "can-do-better": "Room to Improve",
      "not-recommended": "Not Recommended", "not-assessed": "Licensed Drug",
    });
  });
});

/* The tick-diff preview for ANALYSER_ONTOLOGY_TICKS. The flag changes displayed ticks
   even though it never touches a verdict, so it gets its own record: legacy ticks next to
   what the ontology branch shows, for ingredient lists chosen to hit each rule. While the
   shipped aliases are unreviewed, every relation is "qualified", so a listed paraben makes
   the tick DISAPPEAR rather than turn red. That is why the flag must stay off until a
   qualified reviewer has signed the aliases. */
const PROBES: Record<string, string[]> = {
  clean: ["Aqua", "Glycerin", "Niacinamide", "Phenoxyethanol"],
  "alcohol denat": ["Aqua", "Alcohol Denat.", "Glycerin"],
  "bare Alcohol entry": ["Aqua", "Alcohol", "Glycerin"],
  "benzyl alcohol": ["Aqua", "Benzyl Alcohol", "Glycerin"],
  "fatty alcohols only": ["Aqua", "Cetyl Alcohol", "Cetearyl Alcohol", "Glycerin"],
  "methylparaben": ["Aqua", "Methylparaben", "Glycerin"],
  "ethyl hydroxybenzoate (not an alias)": ["Aqua", "Ethyl Hydroxybenzoate", "Glycerin"],
  "phenoxyethanol (contains the letters ethanol)": ["Aqua", "Phenoxyethanol", "Glycerin"],
};

describe("ontology ticks preview (flag ANALYSER_ONTOLOGY_TICKS)", () => {
  it("records legacy vs ontology ticks side by side", () => {
    const rows = Object.fromEntries(Object.entries(PROBES).map(([name, inci]) => {
      const review = makeReview({ inciIngredients: inci, ingredientReads: undefined });
      const { product } = reviewToScorecard(review, deriveVerdict(review));
      const show = (items: { label: string; value: boolean }[]) => items.filter((i) => /Alcohol|Paraben/.test(i.label)).map((i) => `${i.label}:${i.value}`);
      return [name, {
        legacyMain: show(buildAtAGlance(product)),
        ontologyMain: show(buildAtAGlance(product, { ontology: true })),
        legacyAnalyzedPage: show(buildAtAGlanceAnalyzedPage(product)),
        ontologyAnalyzedPage: show(buildAtAGlanceAnalyzedPage(product, { ontology: true })),
      }];
    }));
    expect(rows).toMatchSnapshot();
  });

  it("with the flag off the option is simply absent: legacy output is unchanged", () => {
    const review = makeReview({ inciIngredients: PROBES.methylparaben, ingredientReads: undefined });
    const { product } = reviewToScorecard(review, deriveVerdict(review));
    expect(buildAtAGlance(product, { ontology: false })).toEqual(buildAtAGlance(product));
    expect(buildAtAGlanceAnalyzedPage(product, { ontology: false })).toEqual(buildAtAGlanceAnalyzedPage(product));
  });
});
