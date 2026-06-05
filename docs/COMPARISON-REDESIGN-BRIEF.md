# Comparison Tracker Redesign — Implementation Brief
**The Clean Sheet / June 2026**
**Status: Built and shipped**

---

## 0. Problem Statement

The current `ProductComparisonTable` is a data dump: raw fraction scores (47/50), dense badge lists, and a basic summary appended at the bottom. Consumers have to do all the interpretive work themselves. The redesign inverts this — the engine makes the decision, the consumer confirms it.

**Design principle:** A buying decision engine, not a prettier spreadsheet.

---

## 1. Architecture Overview

### Files created
| File | Purpose |
|---|---|
| `src/lib/comparison-engine.ts` | All verdict, confidence, tradeoff, and red flag logic |
| `src/components/scorecards/ComparisonDecisionEngine.tsx` | Full-screen comparison experience (replaces ProductComparisonTable) |
| `src/components/scorecards/VerdictCard.tsx` | Best pick / alt / caution cards |
| `src/components/scorecards/ConfidenceMeter.tsx` | Per-product confidence display |
| `src/components/scorecards/BestForCards.tsx` | Persona-based recommendation grid |
| `src/components/scorecards/RedFlagGroup.tsx` | Tiered caution display |
| `src/components/scorecards/ScoreBar.tsx` | Normalized 100% bar with label, no fractions |
| `src/components/scorecards/ExpandableSection.tsx` | Collapsible section wrapper |

### Files updated
| File | Change |
|---|---|
| `src/components/scorecards/ScorecardDiscovery.tsx` | Import swapped to ComparisonDecisionEngine |

### Files preserved (not deleted)
| File | Why kept |
|---|---|
| `src/components/scorecards/ProductComparisonTable.tsx` | Kept as reference; no longer imported |

---

## 2. Data Contracts

No new data fields needed. All logic derives from existing `ProductScorecard` fields.

---

## 3. `comparison-engine.ts` — Full Logic Spec

### 3.1 Pillar Normalisation

```ts
pillarPct(pillar) = Math.round((pillar.score / pillar.max) * 100)
```

Named pillar accessors (order: Safety, Formulation, Claims, Ethics).

### 3.2 Pillar Label (replaces raw fractions everywhere consumer-facing)

```
>= 85  → "Excellent"
>= 70  → "Good"
>= 55  → "Acceptable"
>= 40  → "Weak"
<  40  → "Concern"
```

### 3.3 Confidence Score (0-100)

```
Weights:
  safetyPct      × 0.30
  formulationPct × 0.25
  claimsPct      × 0.25
  ethicsPct      × 0.05
  baseScore      × 0.15

Modifiers:
  fragranceStatus !== "free" AND leave-on  → -12
  alcoholStatus === "contains-drying"      → -8
  warn_badges.length >= 3                  → -10
  warn_badges.length 1-2                   → -5
  claimsNotVerified?.length > 0            → -8
  pass_badges includes "INCI Verified"     → +5
  fragranceStatus === "free"               → +5
  claimsVerified?.length > 0              → +3
```

### 3.4 Confidence Labels

```
>= 80 → "High confidence"     (teal)
>= 60 → "Moderate confidence" (amber)
>= 40 → "Low confidence"      (coral)
<  40 → "Not enough proof"    (ink-300)
```

### 3.5 Verdict Generation

- **Best Pick:** Highest confidence score. Tiebreak: highest overall score.
- **Alternative:** Second-highest confidence.
- **Use Caution:** Lowest confidence if score < 60, or >= 2 warn_badges, or >= 2 unverified claims, or overall score < 65. Null if none qualify.

### 3.6 Best For You Personas (up to 6 shown)

Personas: sensitive skin, beginners, fragrance avoiders, budget buyers, strong actives, oily skin, acne-prone, lowest irritation risk.

Only render a card when winner's score for that persona is meaningfully higher than alternatives (delta > 10). Cap at 6 cards.

### 3.7 Tradeoff Logic

For each non-winning product, one plain-English statement. Priority:
1. Price saving + score loss
2. Better formula but weaker proof
3. Fragrance risk vs. fragrance-free winner
4. More caution flags
5. Unverified claims
6. Ethics gap
7. Default fallback

### 3.8 Red Flag Classification

Three severity tiers:
- **Routine** (amber): patch test, SPF reminder, pregnancy, active stacking
- **Formula Concern** (coral): fragrance in leave-on, drying alcohol, weak formulation score, high irritation
- **Proof Gap** (deep red/coral): weak claims score, unverified claims, no verified claims, low overall score

---

## 4. Page Structure

### Always visible
- Sticky product header (thumbnails, names, confidence badge, View scorecard CTA)
- The Verdict (Best Pick, Best Alternative, Use Caution cards)
- Buying Confidence (per-product meter with pillar labels)
- Best For You (persona card grid)
- Key Differences (score bars, labels not fractions)
- Red Flags (tiered by severity)
- What You Give Up (tradeoff statements)
- Buy CTAs

### Expandable (collapsed by default)
- Full Score Breakdown (bars + pillar notes)
- Ingredient Logic (key actives + full INCI)
- Claims and Proof (verified / not verified)
- Ethics and Sustainability
- Technical Notes (India context + analysed date)

---

## 5. Brand Tokens Used

```
--color-teal-*     verified, positive, best pick
--color-coral-*    cautions, concerns, proof gaps
--color-ink-*      text and borders
#efe9e0            cream card backgrounds (BestForCards)
#faf7f2            page background (inside modal)
```

---

## 6. Mobile Layout

Single column. Sticky header with product strip. All sections stacked vertically. Score bars replace the wide table. Expandable sections for deep data. All tap targets >= 44px.

## 7. Desktop Layout

Sticky header with label column + per-product columns. Key Differences section uses CSS grid with label column. Winner column has subtle teal-50/40 background and teal-200 border. Confidence meters and Best For You in grid layouts.

---

## 8. Empty States

| Situation | Behaviour |
|---|---|
| No caution flags | Green "No concerns" row with checkmark |
| useCaution verdict null | Use Caution card not rendered |
| No Best For You winners | Section not rendered |
| Only one product | Tradeoffs section not rendered |
| No claims data | "No claims data available" text |
| No ethics pillar | "Ethics data not available" text |
| Pillar missing | "Data not available" in row |

---

## 9. Disclaimer

"Scores are based on publicly available ingredient lists and verified brand disclosures. They are not medical advice. Consult a dermatologist for skin conditions."
