# Build Prompt — Product Detail Page (PDP) Hero + Sections

Build a single Product Detail Page that exactly reproduces the reference hero design, then the ingredient list, then the score breakdown, then a "similar products" strip. Stack is the existing repo: **Next.js 16 (App Router) + React 19 + Tailwind 4 + framer-motion + lucide-react**. Route: `app/brands/[brand]/[product]/page.tsx`. Build interactive pieces as client components.

Everything below describes the look pixel-for-pixel and every click target. Match it exactly.

---

## 1. Design tokens (use these, no improvising)

**Colors** (already in `globals.css` as CSS vars):
- Teal / primary: `#248179` (`--color-teal-600`) — headings, "Best for" check icons, section labels, CTA fill, score ring text
- Coral / accent: `#fd6158` (`--color-coral-500`) — "Avoid if" icons, star, "Buy Now" + "View more" links
- Ink / text: `#262525` (`--color-ink-950`) body; `#767373` muted captions
- Cream bg: page `#FFFFFF`; soft section cards `#F7F7F5`
- Lime accent: `#d6ff3e` — only the decorative blob top-right
- Tier colors for pillar dots: **teal `#248179`** (good), **amber `#D4A843`** (mid), **coral `#fd6158`** (low), empty/track `#E4E2E0`

**Fonts — Cooper BT and Helvetica ONLY. No other font (no Geist Mono, no system-ui fallback in the design).**
- Headings (product name, section headers "Best for", "Avoid if", "Key Ingredients", "Expert Summary", "Buy Now"): **Cooper BT** (`font-family:'Cooper BT'`), weight 700 for the H1, 700 for sub-labels in teal.
- Everything else — body, descriptions, bullets, captions, price line, INCI / ingredient names, badges, button labels, scores: **Helvetica** (`font-family: Helvetica, 'Helvetica Neue', Arial, sans-serif`). Use weight + size for hierarchy, not a different family. INCI/ingredient names: Helvetica (regular, can be slightly tracked-out for the technical look). Price line: Helvetica italic.

---

## 2. Hero layout (reproduce Image 1 exactly)

Two-column hero on a white background. Left column ~62% width, right column ~38%. Generous padding (~64px). A soft lime/teal organic blob bleeds off the top-right corner and a coral quarter-circle bleeds off the bottom-right (decorative SVG, `position:absolute`, `pointer-events:none`, behind content).

### Left column (top → bottom)
1. **Eyebrow:** `CODESKIN • Sunscreen` — uppercase, letter-spaced, muted gray `#b0a8a4`, small. "CODESKIN" slightly bolder than the category. The brand text links to the brand page `/brands/[brand]`.
2. **H1 product name:** "UltraMatte Mineral Gel Sunscreen SPF 50+ PA++++" — Cooper BT bold, ink, ~40px, tight leading.
3. **Subhead:** two short sentences in ink, ~20px:
   > "A mineral only, fragrance free sunscreen with strong public SPF evidence. The main watch out is Isostearic Acid, which may not suit every acne prone user."
4. **Thin teal divider rule** (1px, `--color-teal-100`), full width of the left column.
5. **Two-up: "Best for" / "Avoid if"** side by side.
   - "Best for" header in teal Cooper BT. Three rows, each with a teal filled circular check icon (lucide `CheckCircle2` / custom filled circle + check) then label: "Oily and acne prone skin", "Mineral UV filter preference", "Fragrance free routines".
   - "Avoid if" header in coral Cooper BT. Three rows, each with a coral "no/ban" icon (lucide `Ban`): "Skin clogs easily", "Want no white cast", "Looking for new age filters".
6. **Thin teal divider rule.**
7. **Price line:** `₹1,100 • Analysed 2 June 2026` — small, italic, muted gray.
8. **Thin teal divider rule.**
9. **Expert Summary** — label in muted/gray Cooper BT, then a paragraph of body text (the long summary about 100% mineral, Zinc Oxide sole filter, water-free elastomer gel, published INCI + test reports, Isostearic Acid caveat, ZnO at position 3). Keep the exact reference copy.
10. **Key Ingredients** — teal Cooper BT header. One line: `Zinc Oxide • Hinokitiol • Ectoin` then **`View all ingredients`** as a teal bold italic link.

### Right column (top → bottom)
1. **Product photo** of the two tubes/box, centered.
2. **Score badge** overlapping the top-right of the photo: a double-ring circular badge with **"88"** large in teal, plus the small circular "THE CLEAN SHEET / EST 2025" seal stamp beside it. Use the existing `ScoreRing` component styling for the 88 ring.
3. **Two buttons:** **`Add Review`** (filled teal, white text, rounded-full) and **`Compare`** (outline, teal text, rounded-full).
4. **Rating block:** a coral filled star, big number **`2.67`** below it, caption `from 3 reviews` (muted italic). The star + number is a click target.
5. **`Buy Now`** label in coral Cooper BT, with a row of retailer icons (Cult, Nykaa/ULT, YesStyle, Amazon) below it as outbound links.
6. **Pillar mini-summary** (right rail version): four rows — `Ingredient & Safety`, `Formula Logic`, `Claims Evidence`, `Transparency` — each teal Cooper BT label followed by the 4-dot tier indicator (see §5). Then **`View more`** coral italic link that scrolls to / expands the full Score breakdown section.

### Footer disclaimer (full width, below hero)
Small muted text:
> "This is a web evidence review, not a Clean Sheet certification. We checked the ingredient list, publicly available test reports, marketing claims, and formula logic using only public information available at the time of review."

---

## 3. Every clickable element (wire these up)

| Element | Action |
|---|---|
| `CODESKIN` eyebrow | link → `/brands/[brand]` |
| **Add Review** button | open a Review modal/drawer (form: stars, title, body, submit). On submit, POST to existing reviews API or local state, then the new review appears in the Reviews list (§6). |
| **Compare** button | add product to comparison tray (reuse `ComparisonTray`) → `/compare` |
| **Star + 2.67 rating** | smooth-scroll to a **Reviews** section rendered below the score breakdown, and expand it. Clicking again is idempotent. |
| **View all ingredients** | smooth-scroll to the Ingredient list section (Image 2) and expand it fully (the "Show all 31 ingredients" already open). |
| **Key Ingredients chips** (Zinc Oxide, Hinokitiol, Ectoin) | each links to `/ingredients/[slug]` and opens that ingredient's study/detail. |
| Any ingredient row in the list | links to `/ingredients/[slug]` (opens the ingredient study). |
| **Buy Now** retailer icons | outbound `target="_blank" rel="nofollow noopener"` to each retailer URL. |
| **View more** (pillars, right rail) | smooth-scroll to **Score breakdown** section and expand the relevant pillar row. |
| Each **pillar row** in Score breakdown | accordion — click to expand full rationale text. |
| Badges (§7) | each badge is a click target → tooltip/popover explaining what was verified + link to the relevant evidence (test report / verify page). |

Use `scrollIntoView({behavior:'smooth'})` with section refs/ids, and shared expand state (React state or URL hash like `#ingredients`, `#reviews`, `#score`).

---

## 4. Ingredient list section (Image 2 — keep as-is)

Reuse the existing ingredient-list block exactly as shown in Image 2: a `Ingredient list` header with `31 ingredients · INCI order` subline, a legend (Safe / Note / Caution colored dots), then a two-column table (INGREDIENT | WHAT IT DOES) with a colored status dot per row, and a **`Show all 31 ingredients`** expander at the bottom. Footer caption: "INCI order as declared on packaging. Position reflects approximate concentration (high to low)." Ingredient names in Helvetica (regular). Each row links to its ingredient study page. No changes needed beyond making rows clickable.

---

## 5. Score breakdown — Pillar dots (replace the empty ring)

Render the four pillars (`Ingredient Safety` 32/35, `Formula Design` 22/25, `Claims Evidence` 26/30, `Transparency` 8/10) as accordion rows. **Do NOT use the empty/spinner circle from Image 3.** Replace the leading circle with a **4-dot tier indicator**:

- Exactly **4 dots** per pillar, in a horizontal row.
- Convert the pillar's score to a 0–4 fill: `filled = round(score/max * 4)`.
- **Fill color by tier** (based on percentage `score/max`):
  - `>= 0.80` → teal `#248179`
  - `0.55–0.79` → amber `#D4A843`
  - `< 0.55` → coral `#fd6158`
- Filled dots use the tier color; remaining dots use track gray `#E4E2E0`.
- Example: Ingredient Safety 32/35 = 91% → teal, 4/4 filled. Transparency 8/10 = 80% → teal, 3/4 (round(3.2)=3) filled. Claims 26/30 = 87% → teal, 3/4. Formula 22/25 = 88% → teal, 4/4.
- Dot size ~10px, gap ~6px, rounded-full.

Keep the rest of each row: pillar name (teal/blue Cooper BT), one-line summary under it, a tier word (Excellent / Strong) + `xx/xx` on the right, and a chevron. Clicking the row expands the full rationale. Header for the section: **Score breakdown** + subline "How this product was rated across four areas. Open any row for the full rationale."

---

## 6. Reviews section (new, below score breakdown)

Triggered/scrolled-to by the star rating and Add Review. Show: average `2.67` with 3 stars rendered, count, then the list of individual reviews (stars, title, body, author, date). Add Review writes into this list.

---

## 7. Badges

Add a small horizontal row of verification badges in the hero (under the buttons or beside the price). Pill-shaped, teal outline, small icon + label, each clickable (tooltip + link to evidence):
- **SPF Verified** (published SPF test report)
- **Non-Comedogenic** (tested)
- **Fragrance-Free**
- **Mineral / 100% Mineral Filter**
- **Dermatologist Tested**
- **Vegan**

Only show badges that the product's data actually supports; drive them from the product data file, not hardcoded.

---

## 8. Out of scope
Nothing else on this page beyond: hero, ingredient list, score breakdown (with pillar dots), reviews, badges, and a **2–3 card "Similar products" strip** at the bottom (reuse `ScorecardResultCard`, link each to its PDP). No extra marketing sections.

---

## 9. Acceptance checklist
- [ ] Hero matches Image 1 layout, colors, fonts, copy, blobs, score badge, rating, retailer icons.
- [ ] All click targets in §3 work (scroll + expand + links + modal).
- [ ] Pillar dots render with correct tier colors and fill counts; no empty ring.
- [ ] Ingredient rows and Key Ingredient chips link to ingredient studies.
- [ ] Add Review writes a review that shows in the Reviews list.
- [ ] Badges are data-driven and clickable.
- [ ] 2–3 similar products at the bottom.
- [ ] Responsive: hero stacks to single column on mobile.
