# Scorecards Search, Filter, Sort & Compare — Build Prompt

## Context

The Clean Sheet (thecleansheet.in) is an evidence-first beauty and personal care product review platform. It evaluates products on ingredient safety, formulation logic, claims evidence, transparency, and suitability.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion. No database — all product data lives in static TypeScript files under `src/data/brands/`. The site is statically generated.

**Existing data model** (`src/data/brands/types.ts`):

```ts
type ProductScorecard = {
  productName: string;
  slug: string;
  brand: string;
  brandSlug: string;
  priceRange: string;         // e.g. "₹569-₹599"
  productType: "leave-on" | "rinse-off" | "treatment" | "sunscreen" | "toner";
  concern: string;            // comma-separated concerns
  summary: string;
  score: number;              // 0-100
  scoreLabel: "Excellent" | "Good" | "Fair" | "Concern";
  image: string;
  pillars: ScorePillar[];     // Safety, Formulation, Claims, Ethics — each with score/max/note
  keyActives: KeyActive[];    // { name, function }
  ingredients: IngredientEntry[]; // { name, note, flag: "ok"|"warn"|"info" }
  pass_badges: string[];
  warn_badges: string[];
  info_badges: string[];
  indiaContext: string;
  analyzedAt: string;
};
```

**Current brands:** Minimalist, Dot & Key, Kiehl's, Pilgrim, Hyphen, Plum, Antinorm, Simple, Mamaearth, Codeskin. Products are accessed via `ALL_BRANDS` from `src/data/brands/index.ts`.

**Routing:** The navbar "Scorecards" link points to `/brands`. Individual products live at `/brands/[brand]/[product]`.

**Brand identity:**
- Teal `#248179` — truth, verified, facts
- Coral `#fd6158` — caution, myth, red flags
- Lime `#d2ff34` — key takeaway, smart buying note
- Charcoal `#282828` — primary text
- Warm gray `#b0a8a4` — metadata
- Paper `#faf7f2` — background

---

## Goal

Transform the `/brands` page (Scorecards tab) from a simple brand grid into a searchable, filterable, sortable product discovery engine with side-by-side comparison. Think Nykaa's product discovery UX, but powered by TCS evidence-based review logic.

---

## Phase 1: Extend the data model

Before building UI, extend `ProductScorecard` with new optional fields. These must be optional so existing product files don't break. Add them to `types.ts`:

```ts
// New optional fields to add to ProductScorecard
category?: string;              // "Serum" | "Moisturizer" | "Sunscreen" | "Cleanser" | "Baby care" | "Hair care" | "Eye care" | "Body care"
subCategory?: string;           // "Vitamin C serum" | "Niacinamide serum" | "Retinol serum" | "Gel sunscreen" etc.
price?: number;                 // numeric price in INR (for sorting/filtering; priceRange stays for display)
sizeValue?: number;             // e.g. 30
sizeUnit?: string;              // "ml" | "g"
pricePerUnit?: number;          // computed: price / sizeValue
skinTypeTags?: string[];        // ["oily", "dry", "combination", "sensitive", "acne-prone"]
concernTags?: string[];         // ["pigmentation", "acne", "barrier-damage", "dryness", "ageing", ...]
suitabilityTags?: string[];     // ["pregnancy-safe", "baby-safe", "teen-safe", "fragrance-free", ...]
cautionTags?: string[];         // ["contains-fragrance", "contains-alcohol", "contains-essential-oils", ...]
fragranceStatus?: "free" | "synthetic" | "essential-oil" | "both" | "unknown";
alcoholStatus?: "free" | "contains-drying" | "contains-fatty-only" | "unknown";
certificationStatus?: "tcs-certified" | "under-review" | "not-certified";
claimsMade?: string[];
claimsVerified?: string[];
claimsNotVerified?: string[];
availabilitySources?: string[]; // ["nykaa", "amazon", "brand-website", ...]
```

**Important:** Do NOT remove or rename existing fields. Only add optional ones. Populate them gradually in the brand data files — start with Minimalist as the reference implementation.

---

## Phase 2: Search

### 2a. Search bar

Add a prominent, sticky search bar at the top of the `/brands` page.

Placeholder text (rotate or combine):
- "Search Vitamin C serum, sunscreen, baby lotion, niacinamide, fragrance free..."
- "Search by product, brand, active, claim, or concern"

### 2b. Search logic

Search is client-side (we have no backend). Flatten `ALL_BRANDS` into a single product array and search across these fields:
- `productName`
- `brand`
- `concern`
- `keyActives[].name`
- `ingredients[].name`
- `pass_badges`, `warn_badges`
- `category`, `subCategory` (new fields)
- `skinTypeTags`, `concernTags`, `suitabilityTags`, `cautionTags` (new fields)
- `claimsMade`, `claimsVerified` (new fields)

### 2c. Synonym map

Create `src/lib/search-synonyms.ts` with a synonym map for common beauty search terms:

| Canonical term | Synonyms |
|---|---|
| Vitamin C | vit c, ascorbic acid, l-ascorbic acid, ethyl ascorbic acid, SAP, MAP |
| Retinoid | retinol, retinal, retinaldehyde, retinyl palmitate |
| Niacinamide | niacin, vitamin b3, nicotinamide |
| Sunscreen | spf, sunblock, uv protection, broad spectrum, pa++++ |
| Acne | pimples, breakouts, acne prone, blemishes |
| Pigmentation | dark spots, tanning, melasma, uneven tone, hyperpigmentation |
| Barrier | damaged barrier, barrier repair, redness, irritation |
| Baby | infant, toddler, kids, child safe |
| Hyaluronic acid | HA, sodium hyaluronate, hyaluron |

Expand user query terms via this map before matching.

### 2d. Search behavior

- Debounce input (300ms).
- If exact product name matches, show it first.
- Rank results by relevance (name match > active match > ingredient match > tag match).
- If zero results, show: "We don't have this scorecard yet" with a "Request this product review" CTA (links to a simple form or modal).

---

## Phase 3: Filters

### 3a. Layout

- Desktop: collapsible left sidebar filter panel (240px wide).
- Mobile: filter icon button → opens a bottom sheet/drawer with the same filters.
- Active filters shown as dismissible chips above the results grid.

### 3b. Filter categories

All filters are multi-select checkboxes. Only show filter options that have matching products (hide empty options or show count).

**Product category** (derived from `category` field):
Face cleanser, Serum, Moisturizer, Sunscreen, Baby care, Hair care, Eye care, Body care

**Sub-category** (derived from `subCategory` field):
Vitamin C serum, Niacinamide serum, Retinol serum, AHA/BHA exfoliant, Barrier repair moisturizer, Gel sunscreen, Mineral sunscreen, Baby wash, Baby lotion, Shampoo, Scalp serum

**Active ingredient** (derived from `keyActives[].name` — extract the active name without concentration):
Vitamin C, Niacinamide, Retinol, Retinal, Peptides, Hyaluronic acid, Ceramides, Salicylic acid, Glycolic acid, Lactic acid, Azelaic acid, Tranexamic acid, Zinc oxide, Titanium dioxide

**Skin concern** (derived from `concernTags` or parsed from `concern` string):
Pigmentation, Acne, Barrier damage, Dryness, Dullness, Sensitive skin, Ageing, Sun protection, Baby safe, Pregnancy safe

**Score range:**
Excellent (90-100), Good (70-89), Fair (50-69), Concern (0-49)

**Suitability** (from `suitabilityTags`):
Oily skin, Dry skin, Combination skin, Sensitive skin, Acne-prone skin, Fragrance free, Essential oil free, Alcohol free

**Caution flags** (from `cautionTags` or `warn_badges`):
Contains fragrance, Contains drying alcohol, Contains essential oils, Contains exfoliating acids, Contains retinoids

**Price range** (from `price` field, only if populated):
Under ₹500, ₹500–₹1,000, ₹1,000–₹2,000, ₹2,000+

### 3c. URL sync

Serialize active filters and search query into URL query params so filtered views are shareable. Example: `/brands?q=vitamin+c&category=serum&score=excellent&fragrance=free`

---

## Phase 4: Sorting

Add a sort dropdown (right-aligned, above results grid). Options:

1. Best match (default when search is active)
2. Highest score
3. Lowest score
4. Best value (lowest `pricePerUnit`, only for products with price data)
5. Lowest price
6. Highest price
7. Fewest caution flags
8. Newest scorecard (by `analyzedAt`)

If no search is active, default sort is "Highest score."

---

## Phase 5: Result cards

Replace the current brand-level cards with product-level result cards. Each card shows:

1. Product image (from `image`)
2. Brand name
3. Product name
4. Category chip (if `category` exists)
5. Price range (from `priceRange`)
6. Price per ml/g (if `pricePerUnit` exists, else omit — do NOT show "Not available" for every missing optional field, just omit it)
7. Score ring (reuse existing `ScoreRing` component) with score label
8. Key actives (first 3 from `keyActives`, as small chips)
9. Suitability chips (from `pass_badges` or `suitabilityTags`, max 3, teal)
10. Caution chips (from `warn_badges` or `cautionTags`, max 2, coral)
11. "View Scorecard" button → links to `/brands/[brand]/[product]`
12. "Compare" checkbox

**Visual hierarchy:**
- Top: image + brand + product name
- Middle: score ring, category, actives
- Bottom: suitability/caution chips, CTAs

**Card size:** consistent height via flex layout. Grid: 1 col mobile, 2 col tablet, 3 col desktop.

### Missing data rule

If a field is not populated, simply omit it from the card. Do NOT show placeholder text like "Not available" for optional display fields. Only show "Not verified" for claims/evidence fields where the absence of verification is itself meaningful information.

---

## Phase 6: Comparison

### 6a. Comparison tray

When a user checks "Compare" on 2–4 products, a sticky bottom tray appears showing selected product thumbnails with a "Compare Now" button. Tray also has a clear-all button.

### 6b. Comparison table

Clicking "Compare Now" opens a comparison view (could be a modal, overlay, or separate route like `/brands/compare?products=slug1,slug2`).

Comparison table columns = selected products. Rows:

| Row | Source |
|---|---|
| Product image | `image` |
| Brand | `brand` |
| Product name | `productName` |
| Price | `priceRange` |
| Category | `category` or `productType` |
| Key actives | `keyActives` |
| Fragrance status | `fragranceStatus` or inferred from `warn_badges`/`ingredients` |
| Alcohol status | `alcoholStatus` or inferred |
| Safety & Toxicity score | `pillars[0].score` / `pillars[0].max` |
| Formulation Quality score | `pillars[1].score` / `pillars[1].max` |
| Claims & Transparency score | `pillars[2].score` / `pillars[2].max` |
| Ethics & Sustainability score | `pillars[3].score` / `pillars[3].max` |
| Overall score | `score` |
| Score label | `scoreLabel` |
| Good for | `pass_badges` |
| Use caution if | `warn_badges` |
| Concern | `concern` |

### 6c. Comparison decision summary

Below the table, generate a plain-language decision summary based on the data:
- "Choose [Product A] if you want [highest score / best value / fewest cautions]"
- "Choose [Product B] if you want [specific active / fragrance-free / better ethics score]"
- "Best value pick: [lowest pricePerUnit]"
- "Strongest evidence: [highest Claims & Transparency pillar score]"

This logic should be computed from the data, not hardcoded. Do NOT make medical recommendations. Keep language consumer-readable.

### 6d. Mobile comparison

On mobile, the comparison table becomes vertically stacked cards (one card per product) rather than a horizontal table, since horizontal scrolling tables are poor UX.

---

## Phase 7: Zero-results state

When search returns zero results, show a card with two paths:

1. **Primary CTA: "Analyse this product for free"** — links to the existing Product Analyser at `/analyzer`. This is the main action. The link should pass the search query as a URL param so the analyser can pre-fill it: `/analyzer?product=<search query>`.

2. **Secondary CTA: "Request a full scorecard review"** — a small form (inline or modal) with:
   - Product name (required)
   - Brand name (required)
   - Product URL (optional)
   - Why do you want this reviewed? (optional, textarea)

   On submit, send to an API endpoint (`/api/product-requests/route.ts`). For MVP, sending an email notification is fine.

The messaging should be: "We don't have a scorecard for this yet. You can analyse it instantly with our free Product Analyser, or request a full evidence-based scorecard review."

---

## Components to create

All under `src/components/scorecards/`:

| Component | Purpose |
|---|---|
| `ScorecardSearchBar` | Sticky search input with debounce, synonym expansion |
| `ScorecardFilterPanel` | Desktop sidebar + mobile bottom sheet filters |
| `FilterChips` | Active filter chips with dismiss |
| `SortDropdown` | Sort selector |
| `ScorecardResultCard` | Product card for search results |
| `CompareCheckbox` | Checkbox on each card, manages compare state |
| `ComparisonTray` | Sticky bottom bar when products selected |
| `ProductComparisonTable` | Side-by-side (desktop) / stacked (mobile) comparison |
| `ComparisonSummary` | Auto-generated decision text |
| `NoResultsCard` | Zero-results state — links to `/analyzer` + optional request form |
| `ProductRequestForm` | Modal/inline form for requesting a full scorecard review |

---

## Performance requirements

- Debounce search input (300ms)
- Memoize filtered/sorted results with `useMemo`
- Virtualize the product list if it exceeds 50 items (use a simple windowing approach or pagination — 12 per page)
- Preserve filters, sort, and search in URL query params
- All filtering/sorting/searching is client-side (no API calls needed)

---

## Analytics events

Fire these via a lightweight `track()` function (console.log for now, swap for real analytics later):

- `search_query_submitted` — query text
- `filter_applied` — filter name + values
- `sort_changed` — sort option
- `scorecard_opened` — product slug
- `compare_started` — product slugs
- `comparison_viewed` — product slugs
- `product_review_requested` — product name + brand

---

## What NOT to do

1. **Do not add a database.** All data stays in TypeScript files. Search/filter/sort is client-side.
2. **Do not break existing pages.** `/brands`, `/brands/[brand]`, and `/brands/[brand]/[product]` must continue working.
3. **Do not hallucinate data.** If a field is not populated on a product, omit it. Do not invent prices, claims, ingredients, or scores.
4. **Do not show "Not available" for every missing optional field.** Only show "Not verified" for claims/evidence fields where absence is meaningful.
5. **Do not remove the brand-level browsing.** Users should still be able to browse by brand. Consider tabs or a toggle: "Browse by brand" (current view) vs "Search all products" (new view).
6. **Do not add fields to the data model that require a database** (like `most_searched`, `data_confidence`, `last_verified_at` as live-updating fields). Keep it static.
7. **Do not make medical or safety recommendations** without evidence in the data.

---

## Acceptance criteria

1. User can type "vitamin c" in search and see all products with Vitamin C as a key active.
2. User can filter by score range, product type, and caution flags simultaneously.
3. User can sort results by score, price (when available), or caution count.
4. User can select 2–4 products and view a side-by-side comparison with decision summary.
5. Filters, search, and sort are reflected in the URL and shareable.
6. Zero-results state links to the Product Analyser (`/analyzer`) as the primary CTA, with an optional request form as secondary.
7. Mobile: search is sticky, filters open in bottom sheet, comparison is stacked cards.
8. All existing brand/product pages still work unchanged.
9. Design uses TCS brand colors and maintains the existing premium, clinical aesthetic.
10. No data is fabricated — only what exists in the TypeScript data files is displayed.
