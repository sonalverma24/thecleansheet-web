# The Clean Sheet™ Review Standard — TCS v3.1

This is the single reference for how the review tool classifies queries, produces
output, and issues verdicts. If behaviour and this document disagree, one of them
is a bug. The enforcing code is `src/lib/verdict-engine.ts`; the pipeline is
`src/lib/review-engine.ts`; the only endpoint the review tool calls is `/api/review`.

---

## 1. One pipeline

Every query takes exactly one route, decided once, on the server:

```
query → classify → [Layer 1: claim check] → [Layer 2: deep scan] → verdict (computed in code)
```

| Query looks like | Classified as | Layers run |
|---|---|---|
| `https://…` product link | `url` | Claim check → deep scan → verdict |
| Product name ("Minimalist 10% Niacinamide") | `product` | Claim check → deep scan → verdict |
| "X vs Y", "which is better…" | `comparison` | Comparison scan only (no claim layer) |
| "Is retinol safe?", ingredient questions | `question` | Expert answer only (no claim layer) |

Classification rules live in `classifyQuery()` in `src/lib/review-engine.ts` and
nowhere else. The client performs no routing decisions.

## 2. Consistency policy

- **One cache, whole results.** A completed review is cached as a single unit,
  keyed by normalized query. The same query returns the identical review within a
  server session. (Persistence across deployments is the planned Supabase upgrade.)
- **Temperature 0** on all model calls; retries and search-grounding fallbacks are
  deterministic in order (`src/lib/gemini.ts`).
- **The model researches; the code decides.** Model output is treated as research
  notes. All scores, caps, and verdicts are recomputed in TypeScript:
  - pillar scores clamped to their maxima; the total is the sum of pillars
    (the model's own total is discarded);
  - hard-rule caps applied in code (no INCI → cap 50; confirmed banned
    ingredient → cap 40; "chemical-free"/"toxin-free" → −5);
  - prohibited claims force-flagged by regex even if the model graded them leniently.

## 3. Layer 1 — the Claim Sheet

Prompt: `src/lib/claims-context.ts`, built on the TCS Claims Evidence Guide.

Each extracted marketing claim receives exactly one verdict:

| Verdict | Meaning | Deduction |
|---|---|---|
| `verified` | Evidence found at or above the required level (A/B/C per claim type) | 0 |
| `qualified` | Genuine evidence, but below the required level | −6 |
| `unverified` | No public evidence found (the default when searches come up empty) | −14 |
| `not_permitted` | Prohibited claim: drug claims, "chemical-free", "toxin-free", guarantees | −25 |

**Claim integrity** starts at 100, applies the deductions above, floors at 0
(`computeClaimIntegrity()`). Labels: ≥90 Clean · ≥70 Mostly Clean · ≥45 Mixed ·
<45 Misleading. The integrity label is a layer output, not the verdict — it feeds
Gates 2 and 3.

## 4. Layer 2 — the deep scan

Prompt: `src/lib/scoring-context.ts`. Six pillars, 100 points total: Ingredient
Safety & Toxicity 25 · Irritation & Allergen Risk 20 · Full Ingredient Disclosure
20 · Regulatory Compliance 10 · Efficacy & Formulation Logic 15 · Transparency
Practices 10. Claim-check verdicts are injected and bind the Regulatory and
Transparency pillars (non-permitted claims −3 each on Regulatory; unverified
claims up to −4 on Transparency — applied in code).

The numeric score is **internal**. Public UI shows pillar status words only
(≥80% Strong · ≥50% Adequate · <50% Weak).

## 5. The verdict — one standard, three gates, all required

`computeVerdict()` in `src/lib/verdict-engine.ts`:

| Gate | Passes when |
|---|---|
| 1. Formula safety | Six-pillar total ≥ **75** (`FORMULA_BAR`) |
| 2. Lawful claims | Zero `not_permitted` claims |
| 3. Honest marketing | Claim integrity ≥ **45** (`HONESTY_BAR`) |

- All three pass → **Verified** (product enters the public registry with usage guidance)
- Any gate fails → **Not Verified** (the failing gate is named publicly)
- Claim layer unavailable → **Pending** — nothing is ever Verified without its
  claims checked; formula-only runs cannot enter the registry.

## 6. Output contract (`POST /api/review`)

```jsonc
// kind: "product"
{
  "kind": "product",
  "claimCheck": { /* ClaimCheckResult — see src/lib/types.ts */ },
  "claimLayerDown": false,
  "scorecard": { /* Scorecard */ },
  "verdict": { "status": "verified|not_verified|provisional", "gates": [...], "standard": "TCS v3.1 · three gates, all required" }
}
// kind: "comparison" → { comparison: ComparisonResult }
// kind: "answer"     → { answer: ExpertAnswer }
// kind: "out_of_scope"
// HTTP 503 + { error: "busy" } → engine congestion, retry; never shown as out-of-scope
```

All shapes are defined in `src/lib/types.ts`. Verified products persist via
`src/lib/verified-store.ts` and are served by `GET /api/verified-products`.

## 7. Versioning

The standard is versioned as `METHODOLOGY_VERSION` in `src/lib/verdict-engine.ts`
(currently **TCS v3.1**) and stamped on every claim sheet and registry entry.
Changing any bar, deduction, gate, or pillar weight requires bumping the version
and updating this document in the same commit.

Legacy endpoints `/api/analyze` (used by admin product intake) and
`/api/claim-check` are thin wrappers over the same engine — they can never
disagree with `/api/review`.
