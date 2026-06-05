# The Clean Sheet — PDP V2 Plan
## Skinsort learnings + TCS differentiation

---

## What Skinsort does well (and we should steal)

| Pattern | What Skinsort does | Why it works |
|---|---|---|
| **Minimal hero** | Image + name + 1-line summary + rating + Save/Compare | Nothing is repeated. User decides fast. |
| **Where to buy** | Retailer logos inline (Target, Walmart, Amazon) | Immediately actionable. First question after "is it good?" is "where do I get it?" |
| **"What's inside" grid** | ✓/✗ checkmarks for key properties (fragrance-free, sulphate-free etc.) | Instant yes/no. No prose needed. |
| **Benefits with count** | Icon + name + "10 ingredients contribute" + "Show all 10" | Scannable. Expandable. Data-backed. |
| **Concerns with count** | Same pattern as benefits, but red | Honest. Paired with benefits so it's not alarming. |
| **Ingredients list** | Coloured drops + name + function. First 5 shown, "Show all 41" button | Progressive disclosure. Drop colour = traffic light. |
| **Ingredients Explained** | Per-ingredient: name + functions + 2-3 para explanation + "Read more" | Deep for nerds, skippable for everyone else. |
| **Reviews with skin type** | User avatar + skin type tag + star + date + free text | Context makes reviews useful. "Oily skin loved it" means something. |

---

## What TCS has that Skinsort doesn't (keep and strengthen)

| TCS asset | Why it's a moat |
|---|---|
| **Evidence-based score** | Skinsort has community star ratings only. Our 0-100 with pillar breakdown is authoritative. |
| **Proof cards** | Nobody else checks claims against published test reports. This is our editorial differentiator. |
| **Verdict text** | "Worth considering if..." is a real editorial call. Skinsort never takes a position. |
| **India context** | No competitor does this. Relevant for pricing, availability, climate suitability. |
| **Formula snapshot** | Consumer paragraph + expert expandable. Skinsort lists ingredients but doesn't explain formula design. |

---

## New PDP section map (V2)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ HERO
  Score · Verdict · Best for / Think twice if
  One thing to know · Why it scored well
  CTAs: "See what was checked" + "View ingredient list"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ BODY
  [strip]  Methodology (one line)
  [NEW]    Where to buy         ← retailer links + logos
  [NEW]    At a glance          ← ✓/✗ property grid
  #proof   What was checked     ← proof cards (existing, keep)
  #formula How the formula is built (existing, keep)
  #ingreds Full ingredient list with Benefits/Concerns tabs (new pattern)
  #score   Score breakdown      ← existing, keep
  [NEW]    Reviews              ← user reviews with skin type (Phase 2)
  #india   India context        ← existing, keep
           More from brand      ← existing, keep
  #about   About this review    ← existing, keep
```

---

## New sections — detailed spec

### [NEW] Where to buy

**Position:** Immediately after methodology strip. First utility action.

**Design:** Horizontal card. Left: "Where to buy" label + retailer names in text. Right: retailer logo pills (favicon + name), clickable.

**Data source:** New optional field `availabilitySources` on `ProductScorecard` (already in the type, just not populated).

```ts
availabilitySources?: string[]; // ["nykaa", "amazon", "flipkart", "blinkit", "purplle", "myntra"]
```

**Retailer logo map** (hardcoded in component):
| Key | Display name | Color |
|---|---|---|
| nykaa | Nykaa | #fc2779 |
| amazon | Amazon | #ff9900 |
| flipkart | Flipkart | #2874f0 |
| blinkit | Blinkit | #f8d000 |
| purplle | Purplle | #6b21a8 |
| myntra | Myntra | #ff3e6c |
| smytten | Smytten | #1a1a2e |
| brand-site | Brand website | #248179 |

**Fallback:** If `availabilitySources` is empty, don't render the section.

---

### [NEW] At a glance

**Position:** After "Where to buy", before proof cards.

**Design:** White card. Heading "At a glance". 2×N grid of property rows.
Each row: ✓ (teal) or ✗ (coral/grey) + property label.

**Properties to show (derived from pass_badges + warn_badges, no new data needed):**

| Property | How derived |
|---|---|
| Fragrance free | pass_badges includes "fragrance-free" |
| Essential oil free | pass_badges includes "no essential oils" |
| Alcohol free | warn_badges has no "denatured alcohol"; alcoholStatus field |
| Sulphate free | pass_badges or ingredient scan |
| Paraben free | No paraben in ingredients |
| Non-comedogenic | pass_badges includes "non-comedogenic" |
| Dermatologist tested | pass_badges includes "dermatologist" |
| Vegan | pass_badges includes "vegan" (with caveat if contradicted) |
| Reef safe | pass_badges includes "reef-safe" (sunscreens) |
| SPF verified | pass_badges includes "published spf" |

**Show max 8 properties relevant to the product type.** Sunscreen shows SPF verified + Reef safe. Serum shows Fragrance free + Alcohol free + Paraben free. Don't show properties that can't be determined — only confirmed ✓ or confirmed ✗.

---

### [UPDATED] Full ingredient list → with Benefits + Concerns tabs

**Current:** One flat table, all ingredients, INCI order.

**New pattern (Skinsort-inspired):**

```
Full ingredient list     [Benefits]  [Concerns]     ← tab strip

[INCI table - existing]
```

Three tabs:

**Tab 1 — INCI List (default):**
Existing table, unchanged. Dots only (already implemented).
Show first 8, "Show all N ingredients" button → expands.

**Tab 2 — Benefits:**
Derived from `keyActives` + `pass_badges`.
2-col grid. Each card: icon (emoji or lucide) + benefit name + 1-line description + ingredient count.

Example:
```
💧 Deep hydration          3 ingredients
   Hyaluronic Acid, Glycerin, Ceramides

☀ SPF protection verified  1 ingredient
   Zinc Oxide
```

Show 4 by default. "Show all N benefits" expands.

**Tab 3 — Concerns:**
Derived from `warn_badges` + `ingredients[flag=warn]`.
Same 2-col grid pattern but in coral tint.

Example:
```
⚠ Comedogenic potential    1 ingredient
  Isostearic Acid may not suit acne-prone skin

ℹ Not vegan-certified      —
  No published vegan test report found
```

**Implementation note:** Tabs require a Client Component (`"use client"`). Alternative: use radio + CSS-only tabs (no JS). Prefer the CSS-only approach to keep it a server component.

---

### [NEW] Reviews (Phase 2 — not in V1)

**Why Phase 2:** Requires backend, auth, moderation. Not in scope for a static Next.js site without a DB.

**Plan for when ready:**
- Review schema: `{ userId, skinType, concernTags, rating, body, date, helpful_count }`
- Display: Star aggregate (left panel, bar chart) + individual reviews (right)
- Each review shows: skin type badge + concern tags + star + date + body
- Sort: Popular / Newest / Most helpful
- Write review: Modal with skin type selector + concern tags + star + body

**Short-term placeholder:** Static "Be the first to review" CTA linking to a Typeform or Google Form. Collects reviews manually until backend is built.

---

## Changes to existing sections

### Proof cards (#proof)
No structural change. Already strong. Add one improvement: if `availabilitySources` has "brand-site", add a subtle "Brand published this evidence" note on relevant cards.

### Formula snapshot (#formula)
No change. This is TCS-unique and good.

### Score breakdown (#score)
No change. MiniArc + coloured pillar names already implemented.

### India context (#india)
No change. Already differentiated.

---

## Data schema additions needed

```ts
// In ProductScorecard (types.ts) — fields already exist in schema, need populating:
availabilitySources?: string[];   // ["nykaa", "amazon", "flipkart"] — populate per product
benefitTags?: string[];           // optional: ["hydrating", "brightening"] if we want to override derived
```

No breaking changes. Both fields are already optional.

**Priority for populating `availabilitySources`:** Start with Minimalist (highest traffic), then CodeSkin, then others.

---

## Implementation phases

### Phase 1 (now)
- [ ] Hero: implement light variant (if approved from mockup)
- [ ] Add "Where to buy" section (populate data for 2-3 brands first)
- [ ] Add "At a glance" property grid (derived, no new data needed)
- [ ] Ingredient list: "Show first 8 / Show all" pattern + Benefits/Concerns tabs

### Phase 2 (next sprint)
- [ ] Reviews: static placeholder + Typeform integration
- [ ] Ingredients Explained: expand ingredient note into full explanation per ingredient (content work)
- [ ] Find dupes: cross-brand comparison (already have compare feature on /brands)

### Phase 3 (later)
- [ ] Reviews: proper backend (Supabase or PlanetScale + auth)
- [ ] Save to routine / shelf feature (requires accounts)
- [ ] Personalised "good for your skin type" overlay

---

## What we are NOT doing (and why)

| Skinsort feature | Why not |
|---|---|
| Community star ratings | Our evidence-based score is stronger. Don't dilute it with community 3.2/5 |
| "Find dupes" on PDP | We have /brands compare. Don't need it on PDP body. |
| "Save" to shelf | Needs accounts. Phase 3. |
| Ingredient community voting (0/0) | Too thin data. Not useful without large user base. |
| Generic ingredient explanations | Our notes are product-context-aware (concentration, formulation role). Better than generic. |
