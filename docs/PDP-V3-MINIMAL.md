# The Clean Sheet — PDP V3: Minimal, Compact, Clean
## With real user reviews

---

## The problem with the current page

Too many sections, too much prose, too much vertical scroll before a user reaches anything actionable. A product with a score of 63 currently renders the same wall of content as one scoring 92. The page doesn't breathe.

**Specific redundancies to cut:**
- Methodology strip (one line at top) duplicates what "About this review" already says
- "How the formula is built" duplicates what the Formula Design pillar note covers
- India context as a full section for 2-3 sentences is over-built
- "More from brand" takes up a full section when it could be a compact strip

---

## New section order (ruthless edit)

```
HERO
  ↓ score · verdict · best for / think twice if
  ↓ one thing to know · why it scored well
  ↓ CTAs

AT A GLANCE          ← new, compact property grid (✓/✗)
WHAT WAS CHECKED     ← proof cards, keep (renamed more clearly)
SCORE BREAKDOWN      ← existing MiniArc rows, keep
INGREDIENT LIST      ← dots only, show 8 → expand, keep
REVIEWS              ← new, full user review section
ABOUT THIS REVIEW    ← absorbs methodology + india note, single card
MORE FROM BRAND      ← compact horizontal strip, not 2-col grid
```

**Removed entirely:**
- Methodology strip (one-liner at top of body)
- "How the formula is built" section
- India context as a standalone section

---

## Section specs

### AT A GLANCE
Compact white card. Heading: "At a glance". 2-col grid of property rows.

Each row: icon · label · ✓ or ✗

Derived from existing data — no new fields needed:

| Property | Derived from | Show for |
|---|---|---|
| Fragrance free | pass_badges | All |
| Essential oil free | pass_badges | All |
| Alcohol free | ingredients scan / alcoholStatus | All |
| Sulphate free | ingredients scan | Cleansers, shampoos |
| Paraben free | ingredients scan | All |
| Non-comedogenic | pass_badges | All |
| Dermatologist tested | pass_badges | All |
| SPF verified | pass_badges | Sunscreens |
| Vegan | pass_badges | All |
| Reef safe | pass_badges | Sunscreens |

Only show ✗ if we can confirm the negative. Don't show "Unknown". Max 8 rows.

---

### WHAT WAS CHECKED (proof cards)
Keep exactly as is. Left-border accent cards. 2-col grid.
Minor copy tweak: heading "What we checked" → feels less formal.

---

### SCORE BREAKDOWN
Keep exactly as is. MiniArc + coloured pillar name + expandable note.
The formula note inside the Formula Design pillar already covers what "How the formula is built" was saying. Remove the standalone section, let the pillar do the job.

---

### INGREDIENT LIST
**Changes:**
- Show first 8 by default, "Show all N ingredients" button → inline expand
- No `<details>` wrapper needed — the show/hide is the progressive disclosure
- Keep dot-only status (green/blue/coral), no text labels
- "What it does" column stays on desktop

**Visual:** Slimmer row height. `py-2` not `py-2.5`. Tighter and more scannable.

---

### REVIEWS ← the main new section

**Philosophy:** Real people. Real skin types. No star inflation. Community layer on top of editorial score.

#### Display (read mode)
```
┌─────────────────────────────────────────────────────────────────┐
│ Reviews                                      [Write a review ↗] │
│                                                                  │
│  ★ 4.2   ████████░░  5 (3)                                       │
│  overall ███████░░░  4 (2)    What people say:                   │
│  7 reviews░░░░░░░░░  3 (1)    Hydrating 57%  · Non-greasy 43%    │
│           ░░░░░░░░░  2 (0)    Good for oily skin 43%             │
│           ░░░░░░░░░  1 (1)                                       │
├──────────────────────────────────────────────────────────────────┤
│  [Oily skin] ★★★★★  Priya S. · 3 months ago                     │
│  Works really well for acne prone skin. No breakouts after       │
│  switching to this. Finish is matte and doesn't pill.            │
│                                                      ♡ 4  💬 1   │
├──────────────────────────────────────────────────────────────────┤
│  [Dry skin] ★★★☆☆   Rahul M. · 1 month ago                      │
│  Good for office days, not for outdoor summers. The SPF feels    │
│  light but I top up anyway.                                      │
│                                                      ♡ 2  💬 0   │
└──────────────────────────────────────────────────────────────────┘
```

#### Write review form (inline, collapses after submit)
```
┌─────────────────────────────────────────────────────────────────┐
│ Your review                                                      │
│                                                                  │
│ Name (or leave blank for Anonymous)  [________________]          │
│                                                                  │
│ Skin type  [Oily ▾]   How long used  [3 months ▾]               │
│                                                                  │
│ Rating     ★ ★ ★ ★ ☆  (tap to set)                              │
│                                                                  │
│ Your experience                                                  │
│ [                                                    ]           │
│ [                                                    ]           │
│                                                                  │
│ Would you recommend this?   ● Yes  ○ No                          │
│                                                                  │
│                                        [Submit review]           │
└─────────────────────────────────────────────────────────────────┘
```

#### Review data schema
```ts
// New file: src/types/review.ts
interface ProductReview {
  id: string
  productSlug: string
  brandSlug: string
  displayName: string        // "Priya S." or "Anonymous"
  skinType: "oily" | "dry" | "combination" | "sensitive" | "normal"
  usedFor: "just-tried" | "1-month" | "3-months" | "6-months-plus"
  rating: 1 | 2 | 3 | 4 | 5
  body: string               // max 500 chars
  wouldRecommend: boolean
  createdAt: string          // ISO date
  approved: boolean          // manual moderation gate
}
```

#### Backend options (pick one)

**Option A — Supabase (recommended)**
- Free tier: 500MB, 2GB bandwidth, unlimited API calls
- Row-level security built in
- Setup: 1 table, 2 API calls (insert + select)
- Moderation: Supabase dashboard, flip `approved` to true
- No auth needed (anonymous submissions)
- `npm install @supabase/supabase-js`

**Option B — Next.js API route + JSON file**
- Zero cost, no external service
- Works for low volume
- Not suitable beyond ~200 reviews (file gets large, git bloat)
- Moderation: edit the JSON file manually

**Option C — Phase 1 placeholder (fastest)**
- "Write a review" links to a Typeform
- Typeform notifies you by email
- You manually paste approved reviews into a `reviews/[product].json` file
- No code complexity, fully controlled
- Can migrate to Supabase later with zero frontend changes

**Recommendation: Start with Option C (Typeform placeholder), ship Option A (Supabase) in the next sprint.**

---

### ABOUT THIS REVIEW (updated)
**Absorbs:** methodology + India context

Dark card, compact. Two parts:

**Part 1 — Review methodology** (existing, keep)
ShieldCheck icon + short copy + expandable full methodology list + 2 trust markers inline.

**Part 2 — India context** (moved here from standalone section)
Flag emoji + one sentence only (not a full paragraph). If `indiaContext` is longer than 120 chars, truncate with a "Read more" expand.

This removes one full section from the page.

---

### MORE FROM BRAND (updated)
**Current:** 2-col card grid, takes up a lot of space.
**New:** Horizontal scrollable strip. Each product: tiny image + name (truncated) + score badge. Compact. 1 row on mobile, 1 row on desktop. Max 4 products.

---

## "Nothing repeated" audit

| Content | Currently appears | In V3 |
|---|---|---|
| Best for / Think twice if | Hero + (deleted decision card) | Hero only ✓ |
| Caution | Hero oneThingToKnow | Hero only ✓ |
| Positive signals | Hero badges | Hero only ✓ |
| Formula description | "How the formula is built" + Formula pillar note | Pillar note only ✓ |
| Review methodology | Methodology strip + About card | About card only ✓ |
| India context | Standalone section | Inside About card ✓ |
| Claim evidence | Proof cards | Proof cards only ✓ |
| Score | Hero (ring) + score breakdown | Both, but different detail level ✓ |

---

## Compact visual rules (apply across all body sections)

| Element | Current | V3 |
|---|---|---|
| Section spacing | `space-y-12` | `space-y-8` |
| Card padding | `p-5 sm:p-6` | `p-4 sm:p-5` |
| Table row height | `py-2.5` | `py-2` |
| Body max width | `max-w-4xl` | `max-w-3xl` (narrower = more focused) |
| Section headings | `text-base font-semibold` | `text-sm font-semibold` (smaller) |
| Sub-labels | `text-[10px] uppercase tracking-widest` | keep |
| Ingredient rows | `py-2 px-3 sm:py-2.5 sm:px-4` | `py-1.5 px-3` |

**Max width change from `max-w-4xl` to `max-w-3xl`** is the single biggest visual compactness win — content feels more focused and intentional, less like a wall.

---

## Implementation order

1. **Remove** "How the formula is built" section from page.tsx
2. **Move** India context inside About card
3. **Remove** methodology strip
4. **Update** "More from brand" to horizontal strip
5. **Add** "At a glance" property grid section
6. **Update** ingredient list: show 8 / expand
7. **Shrink** spacing: `space-y-12` → `space-y-8`, `max-w-4xl` → `max-w-3xl`
8. **Add** Reviews section (Phase 1: Typeform placeholder card)
9. **Add** Reviews section (Phase 2: Supabase + form)

Steps 1-7 are pure page.tsx changes, no new dependencies.
Step 8 adds a static "Write a review" card.
Step 9 requires Supabase setup.

---

## What the page feels like after V3

A user lands on the page. They see the hero verdict in 2 seconds. They scroll.

First thing: "At a glance" — instant property scan. 8 checkmarks. Done.

Then: "What we checked" — 4-6 proof cards. Evidence layer. Takes 30 seconds.

Then: "Score breakdown" — 4 rows, collapsed. Open what you care about.

Then: "Ingredient list" — 8 visible. "Show all 32" if they want it.

Then: "Reviews" — real people, real skin types. 2-3 reviews visible.

Then: "About this review" — one dark card, trust anchors, India note, methodology if they want it.

Then: "More from brand" — horizontal strip, 4 products.

Total time to get what you need: under 2 minutes. Total scroll depth to reach reviews: reasonable. Nothing repeated. Nothing bloated.
