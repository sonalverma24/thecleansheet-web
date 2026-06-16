# Ask Clean - Analyser Tool: How It Works

```
ASK CLEAN ANALYSER
│
├── INPUT (what the user types)
│   ├── Product URL           → "https://nykaa.com/..."  or  "https://juicychemistry.com/..."
│   ├── Product name          → "Minimalist Niacinamide 10% Serum"
│   ├── Ingredient list       → paste INCI directly
│   ├── Comparison query      → "Minimalist vs Pilgrim niacinamide"
│   └── Ingredient question   → "Is DMDM Hydantoin safe?"
│
├── STEP 1: SMART ROUTING (frontend + backend)
│   │
│   ├── [Frontend] Known product redirect?
│   │   ├── YES → skip AI, redirect to /brands/[brand]/[product] instantly
│   │   └── NO  → proceed to AI pipeline
│   │
│   └── [Backend] What kind of query is this?
│       ├── URL?         → Product scorecard path
│       ├── "vs" / "compare" / "better than" → Comparison path
│       ├── "is X safe?" / "what is X?" → Expert answer path
│       └── Everything else → Product scorecard path
│
├── STEP 2: DATA GATHERING (parallel, backend only)
│   │
│   ├── [URL input only] Three parallel fetches:
│   │   ├── Jina AI scrape of brand page (HTML → markdown, 8000 chars)
│   │   │   └── Strips: blob: URLs, tracking params
│   │   │   └── Extracts: page title as product hint
│   │   ├── Shopify JSON endpoint (url + ".json")
│   │   │   └── Gets: brand name, product title, price, description
│   │   │   └── Only works for Shopify stores (/products/ in URL path)
│   │   └── InciDecoder search (brand + product slug)
│   │       └── Gets: INCI list if product listed on InciDecoder
│   │
│   ├── [Text input] No pre-fetching
│   │   └── Gemini does all research via Google Search grounding
│   │
│   └── Cache check (before calling Gemini)
│       ├── In-memory (RESULT_CACHE Map) - same server process only
│       └── Supabase (scorecard_cache table) - persistent across deploys
│           └── Validates cached scorecard uses 5-pillar format before returning
│               └── If stale format → deletes it, falls through to Gemini
│
├── STEP 3: AI ANALYSIS (Gemini 2.5 Flash + Google Search grounding)
│   │
│   ├── System prompt: CLEAN_SHEET_SYSTEM_PROMPT (for scorecards)
│   │   └── 700+ lines covering:
│   │       ├── Regulatory databases to check (EU, India, USA, Korea, Canada, Australia)
│   │       ├── Research protocol (8 mandatory search steps)
│   │       ├── Mandatory deduction table (banned ingredients, ED concerns, sensitizers)
│   │       └── 5-pillar scoring framework (100 pts total)
│   │
│   ├── 5-PILLAR PUBLIC EVIDENCE SCORE
│   │   ├── P1: Public INCI Safety Screen    (30 pts)
│   │   │   ├── Regulatory red flags
│   │   │   ├── Irritation and sensitization
│   │   │   ├── Exposure context (leave-on vs rinse-off)
│   │   │   ├── Special population concern (baby, pregnancy)
│   │   │   └── Transparency of high-concern ingredients
│   │   ├── P2: Formula Logic Inference      (25 pts)
│   │   │   ├── Active plausibility (INCI order)
│   │   │   ├── pH-dependent logic
│   │   │   ├── Preservative plausibility
│   │   │   ├── Compatibility logic
│   │   │   └── Product format logic
│   │   ├── P3: Public Claim Support         (25 pts)
│   │   │   ├── Claim specificity
│   │   │   ├── Evidence visibility
│   │   │   ├── Finished product relevance
│   │   │   ├── Claim-to-evidence match
│   │   │   └── Responsible caveats
│   │   ├── P4: Test Result Transparency     (15 pts)
│   │   │   └── Grade A/B/C/D/F (lab named? method? date? batch? results?)
│   │   └── P5: Consumer Clarity             (5 pts)
│   │       └── Instructions, frequency, warnings, suitability, caveats
│   │
│   ├── Gemini searches the web via Google Search grounding for:
│   │   ├── Full INCI list (brand PDP → InciDecoder → Nykaa/Amazon)
│   │   ├── Price in India (Nykaa, Amazon.in, Flipkart)
│   │   ├── Reviews and ratings
│   │   ├── Lab/clinical test certifications
│   │   └── Recalls, controversies, CDSCO notices
│   │
│   └── Output JSON → validated against 5-pillar schema
│       └── If invalid → retry up to 3 times, then return no_data_found
│
├── STEP 4: RESPONSE TYPES (what comes back to frontend)
│   │
│   ├── type: "single"     → Product scorecard
│   │   └── Contains: score, publicDecisionLabel, 5 pillars, ingredients list,
│   │                  claimsCheck, badges (pass/warn/info), indiaContext,
│   │                  keyActives, globalScreen (10 reg databases),
│   │                  priceRange, dataSource, cleanSheetNote, chatOpener
│   │
│   ├── type: "comparison" → Side-by-side two products
│   │   └── Contains: winner, verdict, productA{...}, productB{...}
│   │
│   ├── type: "answer"     → Expert ingredient/safety question
│   │   └── Contains: verdict (safe/caution/avoid/info), text, keyPoints, indiaContext
│   │
│   ├── type: "no_data_found" → Beauty product but INCI unavailable
│   │   └── Frontend shows: "Couldn't analyse this product" + ingredient paste suggestion
│   │
│   └── type: "out_of_scope" → Not a beauty/personal care product
│       └── Frontend shows: "This one's outside my lane"
│
├── STEP 5: FRONTEND DISPLAY
│   │
│   ├── Loading states (timed step indicators, 4s per step)
│   │   ├── "Hunting down the ingredient list..."
│   │   ├── "Ignoring the marketing copy, reading the actual science..."
│   │   ├── "Checking what EU, India, US & Korea regulators say..."
│   │   ├── "Running the 5-pillar Clean Sheet framework..."
│   │   └── "Almost done, putting your verdict together..."
│   │
│   ├── Scorecard view (ScorecardView component)
│   │   ├── ScoreGauge (animated SVG circle, 0-100)
│   │   ├── Brand + product name + price + product type
│   │   ├── 3-sentence summary
│   │   ├── Badges (pass/warn/info chips)
│   │   ├── Pillar breakdown (5 animated bars + notes)
│   │   ├── Key actives (grid cards)
│   │   ├── Full ingredient list (expandable, colour-coded: green/amber/teal)
│   │   ├── India context panel
│   │   └── Research sources (INCI source, rating, price source)
│   │
│   ├── Expert answer view (AnswerView component)
│   │   └── Verdict badge + text + key points + India context
│   │
│   ├── Comparison view (ComparisonView component)
│   │   └── Winner card + side-by-side score + expandable pillar breakdown
│   │
│   └── Follow-up chat (Ask the Ingredient Expert)
│       └── Calls /api/chat with scorecard context + conversation history
│
├── STEP 6: CACHING & PERSISTENCE
│   │
│   ├── On successful scorecard: saved to Supabase scorecard_cache
│   │   └── Accessible later at /analyzed/[slug] page
│   ├── Same product: same scorecard (cache key = normalized URL or query)
│   └── Slug format: brand-productname (used for /analyzed/ URL)
│
└── WHAT THE TOOL DOES NOT DO
    ├── Does NOT add analysed products to /brands Scorecards directory
    │   └── Scorecards = hand-curated brand data files (src/data/brands/*.ts)
    │   └── Analyser results live at /analyzed/[slug] only
    ├── Does NOT store user sessions or history
    ├── Does NOT work for non-beauty products
    └── Does NOT replace full Clean Sheet certification
        └── Certification = confidential formula review + lab docs + exact concentrations
```

---

## Score Bands

| Score   | Label                      | What it means                                                         |
|---------|----------------------------|-----------------------------------------------------------------------|
| 85-100  | Strong public evidence     | INCI complete, claims specific, tests visible, no major red flags     |
| 70-84   | Mostly credible with gaps  | Broadly credible, but pH / active assay / SPF / PET missing           |
| 50-69   | Needs proof                | Strong claims, weak or missing public evidence                        |
| 30-49   | Weak public evidence       | INCI incomplete or claims largely unsubstantiated                     |
| 0-29    | High concern / opacity     | Visible flags or critical evidence missing                            |

---

## Supported Input Formats

| Input type              | Example                                                   | Routes to         |
|-------------------------|-----------------------------------------------------------|-------------------|
| Brand website URL       | `https://discoverpilgrim.com/products/...`               | Scorecard         |
| Nykaa / Amazon URL      | `https://nykaa.com/p/minimalist-...`                     | Scorecard         |
| Product name            | `Foxtale Ceramide Moisturiser`                            | Scorecard         |
| Ingredient list (paste) | `Aqua, Niacinamide, Zinc PCA, Pentylene Glycol...`       | Scorecard         |
| Comparison              | `Minimalist vs Pilgrim for dark spots`                    | Comparison        |
| Ingredient question     | `Is phenoxyethanol safe for daily use?`                   | Expert answer     |
| Safety question         | `Is hyaluronic acid safe during pregnancy?`               | Expert answer     |

---

## Key Limitations (known as of June 2026)

- Sites that block scrapers (Cloudflare-protected) return no scraped content; Gemini relies entirely on its web search
- Shopify JSON endpoint works for Shopify stores only; custom-built brand sites get HTML scrape only
- INCI not publicly listed = score capped, cannot verify claims
- Gemini grounding search occasionally misses niche Indian brands with low SEO visibility
- 120-second function timeout; complex products with 3 retries can approach the limit
