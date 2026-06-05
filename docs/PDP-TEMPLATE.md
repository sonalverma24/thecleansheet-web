# The Clean Sheet — Product Detail Page (PDP) Template

## Guiding principle: MECE

Every piece of information appears **exactly once**. Sections are mutually exclusive (no overlap) and collectively exhaustive (every key decision factor is covered somewhere). The hero answers "should I buy this?". The body answers "how do I know?".

---

## Current duplication (to fix)

| Content | Hero | Body section 1 ("Should you buy it?") |
|---|---|---|
| Best for | CompactDecisionStrip | ✗ repeated |
| Think twice if | CompactDecisionStrip | ✗ repeated |
| Main reason to consider | verdict + "Why it scored well" chips | ✗ repeated |
| Main reason to be careful | OneThingToKnow | ✗ repeated |

**Fix:** Delete the "Should you buy it?" section from the body entirely. The hero already owns the decision layer. The body starts directly at evidence.

---

## MECE section map

```
HERO  ──────────────────────────────────────────────────────────────────────────
  WHO IS THIS FOR + VERDICT (decision)
  BEST FOR / THINK TWICE IF (compact strip)
  ONE THING TO KNOW (top caution — appears only here)
  WHY IT SCORED WELL (positive signals — appears only here)
  PRICE + DATE + CTAs

BODY  ──────────────────────────────────────────────────────────────────────────
  [strip]   METHODOLOGY (one-line, how we reviewed)
  #proof    WHAT WAS CHECKED (claim-by-claim evidence)
  #formula  HOW THE FORMULA IS BUILT (formula logic + expert view)
  #ingreds  INGREDIENTS THAT MATTER (highlights: warn → info → key actives)
             FULL INGREDIENT LIST (collapsible INCI table, same section)
  #score    SCORE BREAKDOWN (4 pillars, expandable)
  #india    INDIA CONTEXT
  —         MORE FROM [BRAND]
  #about    ABOUT THIS REVIEW
```

---

## Section-by-section spec

### HERO — Decision module

**Owns:** verdict, best for / think twice if, top caution, positive signals, price, CTAs.

| Element | Content source | Notes |
|---|---|---|
| Brand + category | `brand.name`, `product.category` | Tiny caps above h1 |
| Product name `<h1>` | `product.productName` | |
| Product image | `product.image` | Mobile: inline. Desktop: right card |
| Score + label | `product.score`, `product.scoreLabel` | Mobile: MobileScoreBlock. Desktop: DesktopScoreCard |
| Verdict | `generateVerdict(product)` | "Worth considering if... The main watch out is..." |
| Best for / Think twice if | `getQuickDecision(product)` | 2-col compact strip, teal / coral |
| One thing to know | `getOneThingToKnow(product)` | Coral callout. **Only place caution is explained in prose** |
| Why it scored well | `getHeroBadges(product)` + coral warn chip | Badge pills. **Only place positive signals listed** |
| Price + date | `product.price` / `product.priceRange`, `product.analyzedAt` | |
| CTAs | — | "See what was checked" → `#proof` · "View ingredient list" → `#ingredients` |
| Score meaning phrases | `generateScoreMeaning(product)` | Inside DesktopScoreCard only |
| Trust markers | Static copy | Inside DesktopScoreCard only |

**Does NOT contain:** methodology, proof cards, ingredient table, score pillar notes, India context.

---

### [strip] METHODOLOGY

**Owns:** review type label (one sentence).

- "How we reviewed this: ingredient list, public claims, available test evidence, formula logic, and suitability for the stated user group."
- "Web evidence review, not certification"
- No expand. No collapse. One line only.

---

### #proof — WHAT WAS CHECKED

**Owns:** claim-by-claim verification (SPF, UVA/PA, fragrance-free, mineral formula, vegan, non-comedogenic, dermatologist tested, water resistant).

- 2-col card grid. Each card: claim name, status badge (Verified / Supported / Needs context / Not verified), plain explanation, evidence type.
- Status legend at bottom.
- **Does NOT repeat:** the caution prose (that's in OneThingToKnow). Only states status + evidence type.

---

### #formula — HOW THE FORMULA IS BUILT

**Owns:** base structure of the formula (anhydrous vs water-based, filter type, key texture agents).

- Consumer paragraph (plain language). Max 3 sentences.
- Expandable "Expert view" `<details>` with full formulator note.
- **Does NOT repeat:** ingredient-level detail (that's in #ingredients).

---

### #ingredients — INGREDIENTS THAT MATTER + FULL LIST

**Owns:** ingredient-level detail. Two sub-sections, one anchor, no repetition between them.

**Sub-section A: Ingredients that matter**
- 6–8 cards. Priority: warn → info → key actives not already shown.
- Each card: name, status dot, note.
- **Does NOT repeat** the caution prose from OneThingToKnow — the note here is the ingredient function/context note, not the decision callout.

**Sub-section B: Full ingredient list**
- Collapsible `<details open>` table. Status legend above.
- Columns: Ingredient (always) / What it does (hidden mobile) / Status.
- Status labels: Low concern / Worth noting / Caution.
- `<p>` at bottom: "INCI order as declared on packaging."
- **Does NOT repeat** highlights — the table is the complete list, highlights are the curated shortlist.

---

### #score — SCORE BREAKDOWN

**Owns:** pillar-by-pillar scoring rationale.

- 4 rows (Ingredient Safety / Formula Design / Claims Evidence / Transparency).
- Each row: simplified name, rating label (Excellent / Strong / Good / Fair / Concern), score/max, consumer one-liner, progress bar.
- Expandable `<details>`: full pillar note.
- **Does NOT repeat:** proof cards or ingredient detail. The pillar notes give the reviewer's overall rationale, not repeated claim verdicts.

---

### #india — INDIA CONTEXT

**Owns:** India-specific purchasing or use context.

- Flag emoji + heading + `product.indiaContext` text.
- White card, no amber tint.
- Only appears if `product.indiaContext` is non-empty.
- **Does NOT repeat** any caution or formula content.

---

### MORE FROM [BRAND]

**Owns:** cross-sell / comparison.

- 2-col card grid. Each card: image, name, score, one-line reason to compare.
- "Reason to compare" derived from concern/productType, not repeated from current product's content.

---

### #about — ABOUT THIS REVIEW

**Owns:** methodology transparency.

- Dark charcoal card. ShieldCheck icon.
- 2-sentence summary of what the review covers.
- Trust markers inline (no bullet list).
- Expandable "Full methodology" `<details>`.
- **Does NOT repeat** score breakdown or claim evidence content.

---

## What lives where (single-truth table)

| Insight | Section | NOT in |
|---|---|---|
| Verdict / recommendation | Hero | Body |
| Best for / Think twice if | Hero | Body |
| Top caution (prose) | Hero: OneThingToKnow | Body (ingredient note ≠ caution callout) |
| Positive signals summary | Hero: "Why it scored well" | Body |
| Claim verification (yes/no/evidence) | Body: #proof | Hero |
| Formula base structure | Body: #formula | Hero, #score |
| Ingredient-level context | Body: #ingredients | Hero, #formula |
| Scoring rationale per pillar | Body: #score | Hero, #proof |
| India context | Body: #india | Hero |
| Review methodology | Body: #about | Hero, methodology strip |

---

## Implementation delta (from current state)

1. **Delete** the "Should you buy it?" section (`<section id="decision">`) from `page.tsx` — it is a subset of the hero.
2. **Renumber** the remaining sections (proof becomes section 1 in body, no content change).
3. No changes to `ProductHero.tsx`.
4. No data schema changes required.

---

## Quality checks

- [ ] Each piece of decision-relevant info appears exactly once across hero + body
- [ ] `grep -r "Best for"` returns hero only (not body)
- [ ] `grep -r "Think twice"` returns hero only (not body)
- [ ] `grep -r "Main reason"` returns zero (deleted with the section)
- [ ] Body starts at #proof after the methodology strip
- [ ] No em dashes anywhere in copy or code comments
- [ ] Template is fully data-driven (no product-specific hardcoding)
- [ ] All other brand product pages render without error
