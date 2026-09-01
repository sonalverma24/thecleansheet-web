# The Clean Sheet - Product Analysis Logic (End-to-End)

This document traces exactly what happens from the moment a user types a product name or pastes a link into the review box, through research, claim extraction, scoring, verdict, storage, and display. It is written from the actual code, not the marketing description.

The live tool lives at `/review`. There is an older, parallel engine (`/api/analyze`, `/api/claim-check`) kept only for the admin flow. This document covers the **real user path first**, then notes the legacy engine at the end so the two are not confused.

---

## 0. The two engines (so you never confuse them)

| Path | Endpoint | Engine file | Status |
|---|---|---|---|
| **User-facing review tool** (`/review`, `/brands` hero, deep links) | `POST /api/review` | `src/lib/product-review-engine.ts` → `PRODUCT_REVIEW_SYSTEM_PROMPT` | **Live. This is the one that matters.** |
| Legacy admin scorecard | `POST /api/analyze`, `POST /api/claim-check` | `src/lib/review-engine.ts` → `scoring-context.ts` / `claims-context.ts` | Legacy wrapper, admin product flow only |

Everything in sections 1-11 below is the **live** path. Section 12 covers the legacy engine.

Both engines share the same model wrapper (`src/lib/gemini.ts`), the same page scraper (`src/lib/scrape.ts`), and the same "the LLM researches, the code decides" philosophy: the language model does the web research and drafts findings, but the final numbers, gates, and verdict are recomputed deterministically in TypeScript.

---

## 1. Entry point - what the user does

Source: `src/app/review/page.tsx`

A single text box takes either:
- a **product name** ("La Roche-Posay Mela B3 Serum"), or
- a **URL** (a Nykaa / Amazon / brand product page link).

Three ways a query enters the pipeline, all funnelling into one `analyze()` function:
1. Typing and pressing Enter or clicking **Review**.
2. Clicking a **suggestion chip** (4 hard-coded example products).
3. A **deep link**: `/review?q=<product>` auto-runs on page load (`autoRan` guard ensures it fires once). This is how a shared or bookmarked search re-runs.

**Duplicate-submit guard:** a synchronous `inFlight` ref blocks a second POST while one is in flight (the `loading` state is async, so a fast double-click or chip+button could otherwise fire two identical `/api/review` calls). Every submission also fires an analytics event `review_search_submitted` with the raw query.

While it runs, the UI shows a fake 7-step progress ticker (advances every 6s, purely cosmetic - it does not reflect real backend stages):
```
Pulling the real ingredient list
Mapping price across Nykaa, Amazon, Flipkart
Extracting every marketing claim
Grading each claim on the 1-7 evidence ladder
Checking ASCI + India drug-boundary rules
Reading the formula logic
Writing your verdict
```

The request body is simply `{ query: text }`. Everything else happens server-side.

---

## 2. The API route

Source: `src/app/api/review/route.ts`

```
POST /api/review
```
- `maxDuration = 180` seconds (the research + model calls are slow).
- **Rate limit:** 6 requests per minute per IP (`rateLimit(req, "review", 6)`). Over the limit → HTTP 429. The limiter is a simple in-memory sliding window keyed by `route:IP` (`src/lib/rate-limit.ts`), using `x-forwarded-for`. It is per-server-instance, not shared across instances.
- Empty query → 400.
- Otherwise calls `runProductReview(query)` and returns the JSON result.

**Error contract (deliberate):**
- `TransientModelError` (model overloaded / quota) → HTTP 503 `{ error: "busy" }`. The UI shows "engine at capacity, try again".
- Any other thrown error → HTTP 500 `{ type: "error" }`. This is treated as an honest failure, **not** "out of scope" - the code is explicit that a scrape/parse/engine failure must never tell the user "this isn't a beauty product".
- A genuine non-beauty query returns `{ type: "out_of_scope" }` as a normal (200) engine result.

---

## 3. `runProductReview` - the orchestration

Source: `src/lib/product-review-engine.ts`, function `runProductReview`

This is the spine. Steps in order:

### 3.1 Resolve the product to ONE canonical identity

The single most important idea: **before any scoring, the product is pinned to one real ingredient list**, so the review is anchored to a specific product and two differently-worded searches for the same product resolve to the same review.

**Case A - the query is a URL** (`/^https?:\/\//i`):
1. `fetchPageMarkdown(q)` scrapes the page (see §4).
2. `productBodyExcerpt(page)` strips nav/menu boilerplate, keeps the body, and converts on-page images into `[Graphic on page: <alt>]` captions (brands often publish test-result charts as images).
3. `titleFromMarkdown(page)` pulls the product name from the page's `Title:` line and strips storefront boilerplate ("Buy X Online at Best Price | Store" → "X").
4. If a title was found, `resolveINCI(pageName)` looks that product up on INCIDecoder (see §5).
5. **Brand-published evidence:** `evidenceLinksFromMarkdown` scans the page for links whose text or href match `report|study|clinical|certificate|test|proof|evidence|dermat`, restricted to the same brand/store domain (socials, Google, Apple links excluded). It follows up to **2** such links, scrapes each (`fetchPageMarkdown(link, 20000)`), and bundles them into an `evidenceBlock`. A real test report reached this way is later graded as Level 4 finished-product evidence (Level 5 if a named independent lab).

**Case B - the query is a product name:**
1. `resolveINCI(q)` runs directly.
2. If it comes back **ambiguous** (two distinct products match about equally), the engine returns `{ type: "disambiguation", options: [...] }` **immediately** - no scoring, no model call. The UI renders a "Which one did you mean?" list; clicking an option re-runs `analyze()` with the exact product name (which then matches exactly and does not re-trigger the question). This is the "ask, don't guess" rule.

### 3.2 Repository check - same product ⇒ same stored review

A `slug` is computed: `inci?.slug` if INCI resolved, otherwise `slugify(name)`.

`getStored(slug)` looks up an existing review:
- **L1:** in-memory `REVIEW_CACHE` (Map).
- **L2:** Supabase `public.product_reviews`, matched on `product_slug` **and** `rubric_rev === RUBRIC_REV` (currently `"r5"`). Stale-rubric rows are ignored so old scoring never resurfaces.
- **Retracted slugs** (a hard-coded `RETRACTED_SLUGS` set) always return null - used to suppress known-wrong or duplicate reviews without deleting the row.

If a stored review is found, it is returned **with a freshly re-derived verdict** (`withFreshVerdict`): the stored model output is reused, but `deriveVerdict()` runs again against current code, so verdict-rule changes apply to old reviews without re-running the model. **A repository hit is instant and costs no model call.**

If nothing is stored, the engine proceeds to research.

### 3.3 Build the prompt

Three blocks are assembled and appended to the system prompt's instructions:

- **`anchor`** - if INCI resolved: *"The product under review is exactly: '<name>'. Use this exact identity... do NOT substitute a different size or variant."* This stops the model's product name from drifting away from the ingredient list actually used.
- **`pageBlock`** - the scraped product-page body (URL case only), labelled as the primary source of the product's claims.
- **`evidenceBlock`** - the brand-published evidence documents (URL case only).
- **`inciBlock`** - the ground-truth ingredient list (see §5.4), the anti-fabrication rules attached to it.

The user prompt tells the model to also search Nykaa, Amazon.in, Flipkart and the brand site for price, claims, and INCI.

### 3.4 Call the model (up to 3 attempts)

`generateResilient(PRODUCT_REVIEW_SYSTEM_PROMPT, prompt)` is called with three escalating prompts:
1. The full prompt.
2. Same + "Return ONLY the product-review JSON, starting with { ... no trailing commas."
3. Same + "Your previous output was not valid JSON. Return ONLY the complete, valid JSON."

After each, `parseJSON()` tolerantly extracts the object (strips code fences, slices from first `{` to last `}`, removes trailing commas). If the parse yields `type: "out_of_scope"`, it returns out-of-scope immediately. If it validates as a product review (`isValidProductReview`: has `type: "product-review"`, a non-empty `productName`, a `claimMap` array, and a numeric `scores.total`), the loop breaks. If all 3 fail validation → `{ type: "error" }`.

### 3.5 Canonical re-slug and de-dupe

Now that the model has returned a clean `brand` + `productName`, a **canonical slug** is recomputed: `inci?.slug ?? slugify(review.productName, review.brand)`. If this differs from the working slug (e.g. the original slug came from raw messy query text), it checks the repository again under the canonical slug - if a review already exists there, that existing one is returned. This is the second de-dupe layer: two differently-worded searches for the same product converge onto one stored review instead of creating duplicates.

### 3.6 Image resolution (see §7)

### 3.7 Finalise, derive verdict, store

- Stamp `imageUrl`, `methodologyVersion = "TCS v3.0"`, `reviewedAt`, `productSlug`, and (if INCI resolved) `inciIngredients` + `inciSourceUrl` onto the review object.
- `deriveVerdict(review)` computes the tier + gates in code (see §9).
- If the verdict is **approved**, the product is registered into the verified-products registry (`upsertVerifiedProduct`) so it appears as a tile on `/brands`.
- `store(canonicalSlug, result)` writes to both L1 (memory) and L2 (Supabase `product_reviews`, upsert on `product_slug`, tagged with the current `rubric_rev`).
- Return `{ type: "product-review", review, verdict }`.

---

## 4. Where the scraping happens

Source: `src/lib/scrape.ts`

There is **no headless browser**. All scraping goes through the **keyless Jina reader**: `https://r.jina.ai/<url>`, which converts any URL (including JS-heavy pages) into clean markdown.

- `fetchPageMarkdown(url, limit=60000)` - 15s timeout, returns markdown or null.
- Known limitation baked into the prompts: **JavaScript-rendered sections (ingredients, lab PDFs, test certificates) often do not survive scraping**, so the prompt repeatedly tells the model to treat scraped content as a *partial* snapshot and to search the web to complete it.
- `titleFromMarkdown` - extracts and de-boilerplates the product name.
- `productBodyExcerpt` - drops pure-link nav rows and caption-less images, keeps image captions as `[Graphic on page: ...]`, trims to ~9000 chars.
- `evidenceLinksFromMarkdown` - finds brand-hosted evidence links (see §3.1 Case A).

---

## 5. INCI resolution - the ground-truth engine

Source: `src/lib/inci-fetch.ts`, function `resolveINCI`

This is where the product is matched to a **real ingredient list from INCIDecoder**, so "free-from" and "contains active X" claims are graded against fact rather than the model's memory. Precision is favoured over coverage - anchoring to the wrong product is treated as worse than an honest "couldn't retrieve INCI".

### 5.1 Search
`https://incidecoder.com/search?query=<q>` is scraped (via Jina). Product links `[Name](/products/<slug>)` are extracted as candidates.

### 5.2 Token overlap + grouping
- Query and candidate names are tokenised (lowercased, accent-stripped, `VARIANT_WORDS` normalised so *baume→balm, creme→cream, huile→oil* etc. group correctly).
- Candidates are grouped by normalised name (collapsing "... Serum" and "... Serum 2"). Overlap = fraction of query tokens present in the candidate.
- Ranked by overlap; strong matches (≥0.5) preferred, else all.

### 5.3 Decisions
- **Exact name match** wins outright (this is what a "did you mean?" click sends back, so it must never re-ask).
- **Ambiguous** → if the top two distinct products are within 0.2 overlap of each other and there is no exact match, return `ambiguous: true` (triggers the disambiguation UI).
- **Confidence + brand guard** → if the best match is below `MIN_OVERLAP` (0.2), or does not carry the query's brand token (its first distinctive word), it returns **unresolved** rather than anchoring to the wrong brand (e.g. it won't review a "Dot & Key" product for a "Uriage ..." query).

### 5.4 Marker check - the anti-mislabel safeguard
INCIDecoder is user-editable, so a mislabelled duplicate can string-match a query perfectly while the *real* product sits under a different name. To catch this, the engine inspects the top entry plus any near-equal rival (up to 3 pages), pulls each ingredient list, and scores each by:
```
markerScore * 100  +  overlap * 10  +  min(list length, 40)/100
```
`markerScore` is: *of the actives the product's name promises, how many the ingredient list actually contains*. `NAME_MARKERS` maps name tokens to required INCI presence:
- `b5 / panthenol` → must contain panthenol
- `cica / centella` → madecassoside / centella asiatica / asiaticoside
- `b3 / niacinamide` → niacinamide
- `hyaluronic` → hyaluronic acid / hyaluronate
- `vitamin c / ascorbic` → ascorbic / ascorbyl / ascorbate
- `retinol`, `salicylic / bha`, `caffeine` similarly.

So a "Cicaplast B5" entry with no Panthenol loses to the entry that actually has it, even if the title matches worse. Whichever entry carries the promised actives wins and becomes `chosen`.

### 5.5 What's returned
`INCIResult`: `{ productName, slug, ingredients[], tags[], source (INCIDecoder URL), imageUrl }`. Tags are INCIDecoder's own labels like "alcohol-free", "fragrance & essential-oil free".

### 5.6 The ground-truth block
`inciGroundTruthBlock(inci)` formats the ingredient list into the prompt with strict rules attached:
- **Anti-fabrication:** don't claim an ingredient (Parfum, Alcohol) is present unless it's in this list.
- **"Free-from X":** if X is absent → claim SUPPORTED. Only flag a conflict if X can be quoted in the list.
- **"Contains active X":** map marketing name → INCI name first (Pro-Vitamin B5 = Panthenol, Vitamin C = Ascorbic Acid / SAP / EAA, Vitamin B3 = Niacinamide, etc.), then check.
- **Absence handling (critical):** a claimed active missing from the list is `UNVERIFIED`, never "contradicted" or "misleading" - because the retrieved list may be the wrong variant/size, truncated, or outdated. Missing actives must NOT lower any pillar; if several headline actives are all absent, treat the list as probably the wrong variant.
- If **no INCI retrieved** at all: the model is told not to assert presence/absence from memory and to mark ingredient-dependent claims unverified.

---

## 6. What the model does with the claims (the rubric)

Source: `src/lib/product-review-context.ts` (the `PRODUCT_REVIEW_SYSTEM_PROMPT`)

The prompt is the entire analytical framework. The model's *one job* is stated plainly:

> "Does what this brand claims match what this product can realistically do? Is the claim proven on this exact product, or only borrowed from the ingredient story?"

It explicitly does **not** do ingredient safety verdicts ("unsafe/toxic/banned" are forbidden words) - that is framed as the Analyzer's role. This engine judges **claims vs evidence**.

### 6.1 Research protocol (the model executes, in order)
1. Identify product completely (name, quantity, MRP).
2. Map prices across Nykaa, Amazon.in, Flipkart/Myntra, quick-commerce (Blinkit/Zepto/Instamart), brand site → compute price per ml/g.
3. Catalogue **every** claim, verbatim, from all platforms.
4. Check evidence per claim (clinical study, test report, dermatologist tested, brand-site certificates, ingredient research).
5. Platform parity - compare exact claim wording across platforms.
6. Find INCI + assess transparency.
7. Apply formula logic.

### 6.2 How claims are picked and classified
Every claim gets:
- **Claim type(s):** functional, appearance, active, concern, time-bound, clinical, safety, free-from, emotional (multiple allowed, primary first).
- **Evidence level 1-7** (the evidence ladder):
  - 1 = no public proof · 2 = ingredient has general research (not this product) · 3 = ingredient % disclosed · 4 = finished-product tested by brand · 5 = named third-party lab · 6 = clinical/instrumental study with sample size + duration + method + population · 7 = published/registered (DOI, journal, registry).
  - **Core rule:** an ingredient study is only **Level 2** for a finished-product claim. To support a finished-product claim you need Level 4+ on the finished product itself.
- **Risk level = residual risk = ambition MINUS evidence found.** First rate ambition tier (routine / cosmetic / performance / clinical), then subtract the evidence level, then rate what remains: `low / medium / high / very-high / red-flag`. A bold claim fully backed by a Level 6-7 study is LOW risk. A clinical claim on borrowed ingredient evidence is high/very-high.
- **`red-flag` is reserved** for (a) explicit drug/treatment promises ("cures acne", "whitens skin"), or (b) a claim the product's own verified INCI affirmatively contradicts. Aspirational puffery ("goodbye dullness", "your best skin ever") is NOT red-flag - it's rated by its evidence gap.
- **ASCI check** (Advertising Standards Council of India, Ch. 1 + Ch. 4): flags "No.1"/"India's best" without methodology, unhedged absolutes ("removes", "guaranteed"), unbacked quantified claims ("reduces 80%"), testimonials-as-clinical, etc. Hedged language ("may help", "helps improve", "visible in X weeks") is compliant and not flagged.
- **India drug-boundary check** (Drugs & Cosmetics Act 1940 + CDSCO): `drugBoundaryRisk = true` only for clear crossings - anti-dandruff/anti-acne/hair-regrowth **treatment** language with the relevant drug actives, or skin-whitening/fairness claims. **Strict limits:** standard SPF/PA labelling is normal cosmetic labelling (NOT flagged); appearance/pigmentation claims ("fades marks", "evens tone") are cosmetic; "borders on / could be seen as / arguably" means it is NOT a crossing. Third-party/marketplace overreach is logged under platform parity, not against the brand.

### 6.3 Ingredient reads, key actives, regulatory screen
- **`ingredientReads`** - one entry per ingredient, in INCI order, from the ground-truth list only: role (Humectant, Surfactant, Preservative...), one plain sentence, and a flag `ok / info / warn`. `warn` only for genuine established concerns; never invent one; empty array if no INCI retrieved.
- **`keyActivesRead`** - the 1-4 hero actives, with `concentrationConfidence` set by the **1% line rule**: High if a % is disclosed or the active sits high in the INCI; Low if it sits after the preservatives (below ~1%); Medium otherwise.
- **`regulatoryScreen`** - 10 authorities (EU 1223/2009, India CR 2020, US FDA, Korea MFDS, Health Canada Hotlist, Canada NHPID, TGA, AICIS, ECHA SVHC, IARC). Each defaults to "No prohibited or restricted ingredients identified"; a specific ingredient is named only on a genuine trigger. False positives are forbidden.

### 6.4 Formula logic
The model reads concentration from INCI position (the **1% line / phenoxyethanol marker**: anything at or after phenoxyethanol is inferred ≤1%; a hero active below that line = "low active concentration", weakening its claim). Plus category-specific logic (moisturiser needs humectant+emollient+occlusive; sunscreen SPF needs ISO 24444 evidence; rinse-off can't claim like leave-on; "48/72-hour" deo needs clinical perspiration testing; silicone hair serum "repairs" is really "appearance"; etc.). Output flags: `heroIngredientsMatchClaim`, `formatSuitableForClaim`, `activesLikelyMeaningful`, `baseFormulaAppropriate`, `claimOverreach` (+ note).

### 6.5 Consumer suitability, India context, platform parity, price fairness
- **`bestFor` / `avoidIf`** - short (≤6 words), product-specific. `avoidIf` must be a real trade-off ("You want a rich, foamy lather"), not boilerplate ("patch test", "consult a dermatologist"); empty array if the product has no honest downside.
- **`indiaContext`** - 2-3 sentences grounded in this product's real data (Indian-climate behaviour for its type, ₹ price positioning, ASCI/CDSCO posture from its actual claims).
- **`platformParity`** - flags claim amplification (brand site "helps reduce appearance of dark spots" vs Amazon title "Removes Dark Spots"), plus a `reelAngle` one-liner for content.
- **`priceAcrossPlatforms` / `priceInsight`** - per-platform price + per-ml, lowest price, discounting theatre flags.

---

## 7. Image resolution

Source: `src/lib/product-image.ts` (all keyless unless a Google CSE key is configured)

A wrong photo is considered worse than no photo, so every strategy filters hard and returns null over guessing. Order tried in `runProductReview`:
1. **INCIDecoder photo** (from the resolved INCI) - only if `isLiveImage()` confirms it serves a real image.
2. **Pasted-page og:image / twitter:image / JSON-LD Product image / Amazon hiRes** (URL case) via `resolveProductImage`.
3. **Keyless retailer search** (`findProductImageKeyless`): scrapes Amazon.in search markdown and picks the `![alt](image)` whose alt-text best matches the query **and contains the brand token** (never the first image - Amazon injects sponsored items). Falls back to Nykaa search, only trusting it when the brand appears on the results page.
4. **Google Programmable Search (CSE)** in image mode - only if `GOOGLE_CSE_API_KEY` + `GOOGLE_CSE_CX` are set; brand-gated, trusted marketplaces first.

Every candidate is liveness-checked (`isLiveImage` does a ranged GET and confirms `content-type: image/`) so a URL that resolves at review time but 404s or blocks hotlinking in the browser is rejected. There's also a `IMAGE_URL_BLOCKLIST` (logos, icons, banners, social buttons, svg/gif). If all fail, the UI shows a branded monogram (the brand's first letter) instead of a broken image.

---

## 8. The scoring math (100 points)

The model proposes seven section scores; they roll up to `scores.total`. Bands drive the label:

| Section | Max | What it measures |
|---|---|---|
| Price Fairness | 10 | Transparent, consistent, fair per-ml, no discount theatre |
| Claim Responsibility (`claimClarity`) | 15 | Claims responsible **relative to their evidence**; deductions for red-flag (-4), very-high-risk clinical claims (-2), ASCI breaches (-3), drug-boundary (-3) |
| **Claim Evidence** | **20** | Quality/depth of evidence behind the claim set (the primary reward) |
| Ingredient Transparency | 20 | Maps from a 1-5 transparency score (full INCI? % disclosed? pH? preservatives? fragrance?) |
| Formula Logic | 15 | Do the ingredients/format actually support the claims |
| Consumer Suitability | 10 | Specific who-it's-for / who-to-avoid / routine guidance |
| Platform Consistency | 10 | Same claims across platforms, no marketplace amplification |

**Total bands (label):**
- 85-100 → "Clean Sheet Strong"
- 75-84 → "Mostly Transparent"
- 55-74 → "Needs More Clarity"
- 40-54 → "High Claim Risk"
- below 40 → "Consumer Confusion Risk"

Key philosophy encoded in the rubric: **evidence earns the claim.** A bold claim that is proven is not penalised. Claim Evidence is the primary reward dimension and deeper evidence must always score higher.

---

## 9. The verdict - derived in code, not by the model

Source: `src/lib/product-review-engine.ts`, function `deriveVerdict`

The model's scores are inputs; the **badge is computed deterministically** so approval rules can change without re-running the model. Constants:
- `APPROVAL_BAR = 85` (total score)
- `CLAIM_EVIDENCE_BAR = 15` (out of 20) - the headline claims must carry finished-product/clinical proof.

### 9.1 Hard flags (judged claim-by-claim)
The code deliberately re-judges hard flags itself because the model historically over-flags two harmless patterns. A claim is a **hard flag** only if:
- `drugBoundaryRisk` is true **and** the claim text is NOT plain SPF/PA/UVA labelling (`SPF_LABEL_RE`), **or**
- `riskLevel === "red-flag"` **and** its context matches `HARD_RED_RE` (`cures/treats/heals/whitens/whitening/fairness/lightens skin/permanent/guaranteed`, or contradiction language like "not listed in / inci lists / own ingredient").

This means: plain SPF labelling and aspirational puffery never hard-block; only real drug-boundary crossings and INCI-contradicted claims do.

### 9.2 Three informational gates
- **Lawful claims** (`lawful`) - passes if `hardFlags === 0`. **This is the only gate that can block approval on its own.**
- **Honest evidence** (`honest`) - `claimEvidence >= 10` (half the evidence points).
- **Formula supports claims** (`soundFormula`) - `formulaLogic >= 8` and no *material* overreach. Material overreach = `claimOverreach` flagged AND `formulaLogic < 11`. A strong formula (11+/15) with one ambitious claim passes with a caveat.

### 9.3 The 4-tier ladder
```
hardFlags > 0                              → "misleading"      (Misleading Claims)
else total >= 85 AND claimEvidence >= 15   → "approved"        (Clean Sheet Approved)
else total >= 65                           → "mostly-clean"    (Mostly Clean)
else                                       → "needs-proof"     (Needs Proof)
```
- **Approved** is gated on *both* a high overall score *and* well-evidenced claims - so the badge never sits above a claim list full of "outruns proof".
- **Misleading** requires a hard trigger only. Missing proof is **never** "misleading" - just "needs-proof".
- `status` is `"approved"` only for the approved tier; everything else is `"not_approved"`.

Each tier carries a fixed label + headline (e.g. approved: "Claims hold up to the evidence."). The gates render as pass/fail rows with detail text.

---

## 10. Storage, caching, and permanence

- **Two-layer cache:** L1 in-memory Map (per server instance) + L2 Supabase `public.product_reviews`, keyed by canonical `product_slug`, tagged with `rubric_rev` (`"r5"`). Bumping `RUBRIC_REV` invalidates every stored review at once (stale rubric rows are treated as absent).
- **Verdict always re-derived on read** (`withFreshVerdict`) - verdict-logic changes apply to already-stored reviews without re-running the model.
- **Permanent shareable page:** after a successful review, `page.tsx` rewrites the address bar to `/reviews/<slug>` (`window.history.replaceState`). That route (`src/app/reviews/[slug]/page.tsx`) reads the same stored review via `getStoredReview(slug)` and server-renders it, so it can be shared, bookmarked, reloaded, and crawled.
- **Registry:** approved products are upserted into the verified-products store and surface as tiles on `/brands` and `/review`. `listRepositoryCatalogueProducts` maps stored reviews into the `/brands` grid tile format (re-deriving the tier each time), with a NEW badge on the latest 5 arrivals within 30 days.
- **Retraction:** `RETRACTED_SLUGS` suppresses specific reviews on every read path without deleting the row (used for known-wrong source data and duplicates).

---

## 11. What is displayed

Source: `src/app/review/page.tsx` + `src/lib/review-to-scorecard.ts` + `ProductScorecardView`

The stored `ProductReview` + `DerivedVerdict` are mapped by `reviewToScorecard()` into the same `ProductScorecard` + `Brand` shape used for curated products, so **live reviews render in the one canonical product-page layout** (`ProductScorecardView`) with:
- The **tier badge** (Approved / Mostly Clean / Needs Proof / Misleading) and headline - **no raw numeric scores are shown to the consumer** in this view.
- Each claim mapped to a check-item: `decision` = "Publicly supported" (risk low) / "Needs proof" / "Not publicly supported" (red-flag or drug-boundary); `evidenceStatus` = "Evidence visible" (level ≥4) / "Mentioned only" (≥2) / "Missing".
- Ingredient reads, key actives, India context (a category-level climate line is supplied by the mapper when the engine's per-product `indiaContext` is absent), consumer suitability, price spread, platform parity.
- Product image (or branded monogram fallback).

Three non-review outcomes:
- **Disambiguation** → "Which one did you mean?" list.
- **Out of scope** → "That doesn't look like a beauty or personal-care product."
- **Busy / fail** → retry message (busy = model overloaded; fail = suggests pasting the product link for a more reliable read).

---

## 12. The model wrapper (shared by both engines)

Source: `src/lib/gemini.ts`

- Model: **`gemini-2.5-flash`**, `temperature: 0` (deterministic).
- **Grounded web search** via Google Search tool.
- **Resilience plan:** grounded twice (0ms, then 1.5s delay), then **ungrounded** twice (0.8s, 2.5s) - the ungrounded fallback still reasons over the scraped content already in the prompt. Empty responses fall through to the next attempt.
- Transient errors (`503/429/UNAVAILABLE/overloaded/quota/fetch failed/timeout/ECONNRESET`) are retried; a real error is thrown immediately (not masked). If all attempts fail → `TransientModelError` → the route returns a 503 "busy", **never** a false "out of scope".
- Requires `GOOGLE_AI_API_KEY`.

---

## 13. The legacy engine (admin only - do not confuse with the live path)

Source: `src/lib/review-engine.ts`, `src/lib/verdict-engine.ts`, `scoring-context.ts`, `claims-context.ts`

Powers `POST /api/analyze` and `POST /api/claim-check` (kept for the admin product flow). Different design - a **two-layer pipeline**:

1. **Classification** (`classifyQuery`) decides once, on the server: `url` / `comparison` / `question` / `product`. Comparisons are detected by "vs / versus / compare / better than"; expert questions by question-starters ("is/are/does...") *unless* the text looks like a specific product (a `%`, ≥2 capitalised words, a product-type word, or a known brand from a hard-coded list).
2. **Layer 1 - Claim Check** (`runClaimCheck`, `CLAIM_CHECK_SYSTEM_PROMPT`): extracts and grades each claim into `verified / qualified / unverified / not_permitted` with an evidence level A-D.
3. **Layer 2 - Deep Scan** (`runDeepScan`, `CLEAN_SHEET_SYSTEM_PROMPT` / comparison / expert prompts): produces a **six-pillar scorecard** (Ingredient Safety 25, Irritation 20, Full Disclosure 20, Regulatory 10, Efficacy 15, Transparency 10 = 100).

The verdict here is different: **`computeVerdict` in `verdict-engine.ts`** applies **three gates, all required** for "Clean Sheet Verified":
- Formula safety - six-pillar score ≥ `FORMULA_BAR` (75).
- Lawful claims - zero `not_permitted` claims.
- Honest marketing - claim integrity ≥ `HONESTY_BAR` (45), i.e. not "Misleading".

If the claim layer couldn't run, the verdict is **PROVISIONAL** (nothing is Verified without its claims checked). Deterministic pieces:
- **Prohibited-claim safety net** - regex that force-downgrades "chemical-free / toxin-free / 100% safe / guaranteed results / cures acne / permanent whitening" to `not_permitted`, whatever the model said.
- **Claim Integrity Score** - starts at 100, weighted deductions per claim (qualified -6, unverified -14, not_permitted -25), floored at 0; label Clean/Mostly Clean/Mixed/Misleading. Zero-claim products score 100.
- **Scorecard validation** - clamps each pillar to its max, discards the model's total and re-sums, applies hard caps (no INCI → cap 50; confirmed banned ingredient → cap 40; chemical-free claim → -5), recomputes the label.

`METHODOLOGY_VERSION` here is `"TCS v3.1"`; the live product-review engine is `"TCS v3.0"`. They are separate methodologies with separate cache versions.

---

## 14. One-line summary of the whole flow (live path)

```
user types name or pastes URL
  → /api/review (rate-limited, in-flight-guarded)
  → runProductReview:
       resolve identity: scrape page (URL) + resolveINCI on INCIDecoder
         ├─ ambiguous?  → ask "which one?"  (stop)
         └─ resolved    → canonical slug
       repository hit on slug? → return stored review (re-derive verdict)  (stop)
       build prompt (anchor + page + brand-evidence + INCI ground truth)
       gemini-2.5-flash, grounded web search, temp 0, up to 3 JSON attempts
       re-slug canonically + de-dupe again
       resolve product image (keyless, liveness-checked)
       deriveVerdict in code → tier + 3 gates
       store (memory + Supabase), register if approved
  → map to ProductScorecard → render tier badge + claim map + ingredient reads
  → address bar becomes /reviews/<slug> (permanent, shareable, crawlable)
```

**The governing principle throughout: the language model researches and drafts; the TypeScript decides.** Identity resolution, de-duplication, image liveness, the verdict tier, the gates, and (in the legacy engine) the pillar math and integrity score are all recomputed in code so they are deterministic and can be changed without re-running the model.
