# The Clean Sheet — Complete Reference: Scoring, PDP & Data System
*Last updated: June 2026 | Proprietary & Confidential*

---

## ABOUT THIS DOCUMENT

This is the single source of truth for how The Clean Sheet scores products, builds PDPs, and sources data. It covers:

1. What the system does and why
2. Regulatory databases used
3. How product pages are scraped
4. The 5-step research protocol
5. The 5-pillar Public Evidence Score — rules, deductions, and scoring mechanics
6. Scoring bands and public decision labels
7. Category-specific triggers
8. Badges
9. Public language rules
10. The complete PDP template — every field and what it drives
11. Step-by-step scoring guide for analysts
12. Data sourcing methodology
13. Routing and store/redirect system
14. AI model configuration and output JSON structure
15. TypeScript and database types
16. Scope rules

---

## PART 1: THE SYSTEM

### What it does

Every product on The Clean Sheet goes through a 4-stage pipeline:

1. **Input** — URL or product name submitted via Analyser
2. **Scrape** — Page content extracted (Jina AI Reader)
3. **Research + Score** — Gemini 2.5 Flash searches the web, finds INCI, scores across 5 pillars
4. **Output** — Structured JSON rendered as a Product Detail Page (PDP), stored in Supabase

The scoring is a **Public Evidence Score** — it assesses only what is publicly visible. It separates three things at all times:

- **Visible evidence** — what the brand has publicly shown
- **Reasonable inference** — what can be cautiously inferred from INCI order, product type, and claim language
- **Missing proof** — what cannot be verified without private formula or test documents

The score answers one question: **Can this product publicly prove what it claims?**

Scoring is deterministic (temperature = 0), cached per product, and mapped against 13 regulatory authorities and 4 ISO standards simultaneously.

---

## PART 2: REGULATORY REFERENCE DATABASES

Every INCI ingredient is mapped against ALL of the following before a score is issued:

### European Union

| Standard | Full Name | What It Covers |
|---|---|---|
| **EU 1223/2009** | EU Cosmetics Regulation (EC) No 1223/2009 | Annex II — 1,628 prohibited substances; Annex III — restricted with concentration limits; Annex IV — permitted colorants; Annex V — permitted preservatives with max %; Annex VI — permitted UV filters with max % |
| **SCCS/1602/18** | SCCS Notes of Guidance for Testing of Cosmetic Ingredients (9th revision) | Testing methodology and data quality standards for cosmetic safety assessments |
| **ECHA SVHC** | ECHA Candidate List of Substances of Very High Concern | Carcinogenic, mutagenic, reprotoxic (CMR), endocrine-disrupting, and persistent/bioaccumulative substances; any SVHC in a leave-on triggers deduction |
| **IFRA 49th** | IFRA 49th Amendment (2022) | Fragrance ingredient concentration limits by product category; violations trigger mandatory deduction |

### India

| Standard | Full Name | What It Covers |
|---|---|---|
| **India CR 2020** | India Cosmetics Rules 2020 (G.S.R. 763(E)) | Prohibited and restricted substances for Indian market; labelling requirements; CDSCO registration obligations |

### United States

| Standard | Full Name | What It Covers |
|---|---|---|
| **US FDA 21 CFR** | US FDA 21 CFR Parts 700–740 | Prohibited and restricted ingredients; colour additive regulations; labelling |
| **CIR** | Cosmetic Ingredient Review | Independent safety assessment database; "Unsafe" or "Insufficient Data" conclusions trigger flagging |

### Korea

| Standard | Full Name | What It Covers |
|---|---|---|
| **MFDS Korea** | Korea Ministry of Food and Drug Safety — Cosmetics Act | Prohibited/restricted ingredient lists; functional cosmetics standards; stricter than EU on several categories |

### Australia

| Standard | Full Name | What It Covers |
|---|---|---|
| **AICIS** | Australian Industrial Chemicals Introduction Scheme | Industrial chemical safety assessments for ingredients introduced into Australia |
| **TGA** | Therapeutic Goods Administration | If a product makes therapeutic claims (e.g. "treats acne"), TGA listing is required; unregistered therapeutic claims flagged |

### Canada

| Standard | Full Name | What It Covers |
|---|---|---|
| **Health Canada Hotlist** | Health Canada Cosmetic Ingredient Hotlist | Continuously updated list of prohibited and restricted cosmetic ingredients; stricter than FDA on several preservatives and dyes |
| **Canada NHPID** | Canada Natural Health Products Ingredients Database | Applies when product contains botanicals, vitamins, minerals, essential oils, or Ayurvedic ingredients marketed as natural health products |

### International

| Standard | Full Name | What It Covers |
|---|---|---|
| **IARC** | IARC Monographs on the Identification of Carcinogenic Hazards | Group 1 (confirmed), Group 2A (probable), Group 2B (possible); any Group 1 triggers hard FAIL |

### ISO Standards

| Standard | Full Name | Applied When |
|---|---|---|
| **ISO 22716:2007** | Good Manufacturing Practice for cosmetics | Referenced when evaluating manufacturing quality or GMP claims |
| **ISO 11930:2019** | Preservation Efficacy Testing | Applied when evaluating adequacy of preservation system for product type |
| **ISO 24444:2010 rev. 2019** | In vivo SPF testing methodology | Required standard for any SPF claim; SPF stated without ISO 24444-compliant test report = deduction |
| **ISO 16128** | Natural and Organic Ingredient Index | Applied when brand claims a natural % or organic % to verify methodology alignment |

---

## PART 3: WHAT GETS SCRAPED (INPUT STAGE)

### URL Inputs

- **Scraper**: Jina AI Reader (`https://r.jina.ai/{url}`)
- **Timeout**: 20 seconds
- **Output format**: Markdown
- **Content truncated to**: 6,000 characters
- **Tracking params stripped**: utm_*, gclid, fbclid, msclkid, ttclid, and 15 others
- **Bot-block detection**: If 403 / Cloudflare / "JavaScript required" detected, falls back to AI web search only

### What is extracted from the scraped page

- Product name (from "Title:" line in Jina output, or from URL slug)
- Brand hint (from domain, e.g. discoverpilgrim.com becomes "pilgrim")
- Full page markdown (passed as context to Gemini)
- InciDecoder pre-fetch if URL identified

### Known e-commerce platforms

URL slug is treated as the product name for: Nykaa, Myntra, Amazon.in, Flipkart, Purplle, Tata Cliq, Ajio, JioMart, Meesho, Bewakoof.

### Text/Name Inputs

No scraping — Gemini researches the product entirely via Google Search grounding.

### Result Cache

- **Supabase**: `scorecard_cache` table — persistent across deployments, keyed by normalised `cache_key`
- **In-memory**: Module-level Map — fast path within the same server process, prevents API call on repeat visits
- Cache is checked in order: in-memory first, then Supabase, then Gemini
- On new analysis: result is saved to both Supabase and in-memory cache

---

## PART 4: RESEARCH PROTOCOL (5 MANDATORY STEPS)

Before scoring, Gemini executes ALL of these in order:

**Step 1 — Find the INCI list**

Search priority:
1. Brand's own PDP: `"[brand] [product] ingredients site:[brand-domain]"`
2. Brand's own website general: `"[product name] ingredients"`
3. Third-party: InciDecoder, OpenBeautyFacts, Nykaa, Amazon.in

Record where INCI was found — affects Pillar 3 (Public Claim Support) and the `inciCompleteness` field.

**Step 2 — Find the price in India**

Search: `"[product name] [brand] price India"`
Pull from Nykaa, Amazon.in, Flipkart, or brand website. Report as INR range.

**Step 3 — Find reviews and ratings**

Search: `"[product name] reviews India"`
Pull rating (out of 5) and volume. Summarise praise and complaints.
Priority: Nykaa, Amazon India, Flipkart, Purplle.

**Step 4 — Check for flags and controversies across ALL regulatory bodies**

- `"[product name] India controversy banned ingredient recall"`
- `"[brand] India CDSCO recall"`
- `"[ingredient name] Health Canada Hotlist"`
- `"[ingredient name] MFDS Korea prohibited"`
- `"[ingredient name] ECHA SVHC"`
- `"[ingredient name] IARC classification"`

Hard rule penalties applied if confirmed.

**Step 5 — Check transparency documentation**

- `"[brand] lab test certificate"`
- `"[brand] clinical study"`
- `"[brand] dermatologist tested"`
- `site:[brand-domain] lab OR test OR certificate OR study OR patch tested`
- For SPF products: check specifically for ISO 24444-compliant SPF test report
- For "natural"/"organic" claims: check if ISO 16128 methodology is referenced

---

## PART 5: THE 5-PILLAR PUBLIC EVIDENCE SCORE (100 POINTS)

### Overview

| Pillar | Max Points | What It Measures |
|---|---|---|
| 1. Public INCI Safety Screen | 30 | Regulatory red flags, irritants, exposure risk, special populations |
| 2. Formula Logic Inference | 25 | Active plausibility, pH logic, preservative strategy, compatibility |
| 3. Public Claim Support | 25 | Whether marketing claims are backed by visible public evidence |
| 4. Test Result Transparency | 15 | Quality and completeness of published test disclosures |
| 5. Consumer Clarity | 5 | How-to-use guidance, warnings, honest caveats |

---

### PILLAR 1: Public INCI Safety Screen — Max 30 pts

**Start at 30. Deduct.**

#### Sub-pillars

| Sub-pillar | Max | What is assessed |
|---|---|---|
| a. Regulatory red flags | 8 pts | Map every visible INCI against all regulatory databases. Banned, restricted, SVHC, IARC, colorant, preservative, UV filter, Hotlist concerns. |
| b. Irritation and sensitization | 7 pts | Fragrance allergens, essential oils, harsh surfactants, acids at likely meaningful concentrations, MIT/MCI, sensitizing preservatives. |
| c. Exposure context | 5 pts | Leave-on vs rinse-off, eye area, lip, baby, sunscreen, scalp, aerosol, daily use. Higher deductions for leave-on, eye area, baby, pregnancy-positioned products. |
| d. Special population concern | 5 pts | Baby, pregnancy, lactation, sensitive skin, acne-prone, compromised barrier. Flag retinoids, high-dose acids, essential oils, sensitizers in these contexts. |
| e. Transparency of high-concern ingredients | 5 pts | Whether allergens, actives, nano materials, fragrance components, and UV filters are clearly disclosed. |

#### Hard Safety Rules (override the final total)

| Trigger | Effect | Authority |
|---|---|---|
| EU Annex II / India CR 2020 / Health Canada Hotlist / MFDS Korea confirmed prohibited ingredient | Total capped at 30 (HARD FAIL) | EU, India, Canada, Korea |
| IARC Group 1 confirmed carcinogen in formula | Total capped at 25 (HARD FAIL) | IARC |
| Mercury compound confirmed | Total capped at 10 (HARD FAIL) | EU Annex II, US FDA, Health Canada |
| ECHA SVHC substance in leave-on product | −5 pts per substance; total capped at 40 | ECHA SVHC |
| MIT in leave-on product | Total capped at 55 | EU Annex V (banned) |
| Baby or eye-area product with formaldehyde releaser, MIT, or CMIT | Total capped at 50 | EU Annex V, Health Canada |
| No INCI publicly available at all | Total capped at 45; note "INCI not publicly available" | India CR 2020, EU 1223/2009 |

#### Mandatory Safety Deductions

| Ingredient / Pattern | Deduction | Regulatory Authority |
|---|---|---|
| Benzophenone-3 (Oxybenzone) | −10 pts | ECHA Category 1 ED (2025), EU Annex VI restricted, MFDS restricted |
| Butylparaben in leave-on | −5 pts | EU Annex V restricted, ED concerns, MFDS restricted |
| Propylparaben in leave-on | −5 pts | EU Annex V restricted, ED concerns |
| Ethylhexyl Methoxycinnamate (Octinoxate) in leave-on | −6 pts | EU Annex VI restricted, ECHA SVHC candidate, MFDS max 7.5% |
| Octocrylene in leave-on (daily use) | −3 pts | EU under SCCS review, AICIS flagged |
| Homosalate in leave-on | −3 pts | EU Annex VI restricted (max 7.34%) |
| DMDM Hydantoin | −6 pts | Formaldehyde releaser, EU Annex V restricted, Health Canada Hotlist |
| Quaternium-15 | −6 pts | Formaldehyde releaser, EU Annex V restricted, Health Canada Hotlist |
| Diazolidinyl Urea | −6 pts | Formaldehyde releaser, EU Annex V restricted |
| Imidazolidinyl Urea | −6 pts | Formaldehyde releaser, EU Annex V restricted |
| Sodium Hydroxymethylglycinate | −6 pts | Formaldehyde releaser, EU Annex V restricted |
| MIT (Methylisothiazolinone) in leave-on | −8 pts | EU Annex V banned (Entry 57), MFDS prohibited in leave-on |
| MIT in rinse-off | −3 pts | EU Annex V max 0.0015%, regulatory scrutiny |
| CMIT/MIT blend in leave-on | −8 pts | EU Annex V banned |
| IPBC (Iodopropynyl Butylcarbamate) in leave-on | −4 pts | EU Annex V restricted, Health Canada Hotlist flagged |
| Parabens (any) in products for children under 3 or nappy area | −6 pts | EU Annex V banned for this use |
| IFRA 49th Amendment concentration limit exceeded | −4 pts per violation | IFRA 49th Amendment (2022) |
| EU Annex III extended fragrance allergens undisclosed in leave-on | −3 pts | EU 1223/2009 Annex III (82 allergen list) |
| Synthetic Fragrance (Parfum) in leave-on | −5 pts | Hidden chemical complex; IFRA/SCCS concern |
| Alcohol Denat / SD Alcohol in top-3 INCI position (leave-on, non-sunscreen) | −4 pts | SC disruption; SCCS flagged in high concentrations |
| SLES as primary surfactant (position 1–3) | −3 pts | 1,4-dioxane risk (WHO, FDA concern) |
| 3+ PEG / Laureth / Steareth / Oleth compounds | −4 pts | Cumulative 1,4-dioxane impurity risk (WHO/FDA) |
| DEA or MEA fatty acid condensates (Cocamide DEA, MEA, TEA as primary) | −3 pts | Nitrosamine precursors, Health Canada Hotlist flagged |
| Coal tar dyes (CI colourant in leave-on) | −4 pts each (max −8) | IARC Group 1/2A, EU Annex IV restricted, US FDA prohibited |
| BHA (Butylated Hydroxyanisole) in leave-on | −3 pts | IARC Group 2B, EU Annex III restricted |
| Hydroquinone in OTC cosmetic | −8 pts | EU Annex II banned OTC, Health Canada Hotlist, India prescription-only |
| Resorcinol | −4 pts | EU Annex III restricted (max 0.5% rinse-off) |
| Triclosan in non-toothpaste | −4 pts | EU Annex V restricted, MFDS restricted, Health Canada restricted |
| Toluene | −6 pts | EU Annex III restricted, US FDA prohibited in cosmetics, IARC Group 3 |
| Styrene (nail products) | −4 pts | IARC Group 2A probable carcinogen |
| Formaldehyde free (above 0.2%) | −6 pts | EU Annex III max 0.2%, Health Canada Hotlist max 0.2% |

#### Scoring for Analysts — Pillar 1

Work through the INCI ingredient by ingredient. For each ingredient, ask:
- Is it on any prohibited list? (EU Annex II, India CR 2020, Health Canada Hotlist, MFDS Korea)
- Is it restricted with a concentration limit? (EU Annex III, V, VI)
- Is it an ECHA SVHC candidate?
- Is it classified by IARC as Group 1, 2A, or 2B?
- Is it a fragrance allergen (EU Annex III extended list)?
- Is it a formaldehyde releaser?
- Is it a sensitizer, endocrine disruptor, or high-concern ingredient for the product type?

Exposure context matters: leave-on products score harder than rinse-off. Eye area, baby, and pregnancy-positioned products score harder still.

**What to write in the pillar note:**
- Start with what was NOT found (fragrance, parabens, specific prohibited substances)
- Then flag anything worth noting (penetration enhancers, preservatives with profile context, restricted ingredients that passed)
- Use plain language — no INCI position numbers, no regulatory shorthand as jargon
- End with any special population note if relevant

**Score anchors:**
- All clean, no fragrance, no preservative concerns = 28–30
- All clean, minor note ingredients = 25–28
- One caution ingredient (not prohibited, just worth flagging) = 22–25
- Synthetic fragrance present = deduct 5 (note in warn_badges)

---

### PILLAR 2: Formula Logic Inference — Max 25 pts

**Start at 25. Deduct based on what cannot be verified.**

This pillar uses **inference, not certainty.** The INCI list is ordered from highest to lowest concentration by law — that is the only public tool available here.

#### INCI Order Inference — Three Confidence Levels

| Confidence | When to apply | What to write |
|---|---|---|
| **HIGH** | Brand publicly discloses percentage, pH, test result, or method | "The brand confirms X%. This is consistent with its position in the ingredient list." |
| **MEDIUM** | Ingredient appears early in INCI and formula context supports the claim | "Appears well up in the ingredient list, consistent with a working concentration, though the exact amount is not published." |
| **LOW** | Ingredient appears after common preservative anchors or near end | "Listed in the lower portion of the formula. Without a published concentration, the functional level cannot be verified from public data." |

**Preservative anchors for inferring low-concentration zones:** phenoxyethanol, potassium sorbate, sodium benzoate, ethylhexylglycerin, caprylyl glycol, chlorphenesin, benzyl alcohol, fragrance/parfum.

CORRECT: "This active appears after a likely low-percentage preservative anchor. Without public concentration disclosure, the strength of this claim cannot be verified."

INCORRECT: "This ingredient is definitely below 1 percent."

#### Active Compatibility Rules

| Combination | Verdict | What to say |
|---|---|---|
| Niacinamide + AHAs/BHAs | Not automatic fail | "Niacinamide and exfoliating acids can coexist in some formulas, but comfort depends on pH, concentration, and total acid load. Since those are not publicly disclosed, treat this as a caution rather than a rejection." |
| Retinoids + AHAs/BHAs | Caution to high caution | "Retinoids and exfoliating acids can increase irritation risk in leave-on products. Public tolerability testing or clear usage guidance is needed." |
| Vitamin C + Niacinamide | Not automatic fail | "This combination is not automatically problematic. If the vitamin C system is low pH, pH and stability data would be needed to judge performance and comfort." |
| Peptides + strong acids | Needs proof | "Peptide claims in low pH acid formulas need stability evidence because formula conditions can affect peptide performance." |
| Multiple exfoliants | Caution | "The formula contains multiple exfoliating ingredients. This does not make it unsafe by default, but it increases the need for pH, concentration, and irritation testing." |

#### Formula Logic Deductions

| Failure | Deduction |
|---|---|
| Key active (Vit C, retinol, AHA, niacinamide, SPF filters) listed after preservative anchor in a treatment claiming that active as hero | −5 pts |
| Avobenzone present without photostabiliser (Octocrylene, Tinosorb S/M, Bemotrizinol) | −4 pts |
| UV filter present but not on EU Annex VI permitted list | −5 pts |
| Trade name used instead of INCI (e.g. "Geogard ECT") | −2 pts each (max −4) |
| Non-INCI ingredient name used (e.g. "Vegetable Oil", "Colloidal Oatmeal") | −2 pts each (max −4) |
| Claimed % on label mismatches INCI order or ingredient form | −5 pts |
| Parfum listed without allergen breakdown in leave-on | −3 pts (on top of Pillar 1 deduction) |
| Preservation system absent or inadequate for a water-based formula | −3 pts (ISO 11930:2019 concern) |

#### Sub-pillars

| Sub-pillar | Max | What is assessed |
|---|---|---|
| a. Active plausibility | 6 pts | Claimed actives appear at plausible position OR percentages are publicly disclosed |
| b. pH-dependent logic | 5 pts | AHAs, BHAs, L-ascorbic acid, niacinamide comfort, preservative efficacy require pH disclosure to fully support claims |
| c. Preservative plausibility | 5 pts | Water-based formulas must show an identifiable preservation strategy |
| d. Compatibility logic | 5 pts | Active conflicts, irritation stacking, claim contradictions |
| e. Product format logic | 4 pts | Packaging, use type, and formula appear aligned (jar + vitamin C = concern; water-based + no preservative = concern) |

#### Scoring for Analysts — Pillar 2

pH matters and is often missing. For niacinamide, AHAs, BHAs, vitamin C, and retinoids — pH affects how active they are. If the brand has not disclosed pH, that is a deduction here (typically 3–4 pts). Write it in the note and the missingProof list.

**Score anchors:**
- Brand-confirmed concentration, plausible position, no logical gaps = 22–25
- Plausible placement, no pH disclosure for pH-dependent formula = 19–22
- Hero active appears after preservative, or multiple missing concentration gaps = 15–19

---

### PILLAR 3: Public Claim Support — Max 25 pts

**Score each claim individually. Sum to a total.**

#### Sub-pillars

| Sub-pillar | Max | What is assessed |
|---|---|---|
| a. Claim specificity | 5 pts | Specific measurable claims score better than vague claims |
| b. Evidence visibility | 7 pts | Report, method, lab name, date, and results are publicly visible |
| c. Finished product relevance | 5 pts | Finished product evidence scores higher than ingredient-only evidence |
| d. Claim-to-evidence match | 5 pts | The test endpoint matches the marketing claim |
| e. Responsible caveats | 3 pts | Brand gives clear warnings, limitations, or use guidance |

#### Evidence Status Definitions

**"Evidence visible" (fully credited):** The brand has publicly shown a test report, with: lab name, method used, product or batch tested, and result summary. All four elements must be present.

**"Mentioned only" (partial credit):** Brand says "dermatologist tested" or "clinically proven" but no test report, no lab name, no method, no outcome.

**"Missing" (no credit):** Claim is not mentioned, or the claim is contradicted by INCI (e.g., "fragrance-free" when parfum is in the INCI).

#### Claim Verification Matrix

| Claim | Required to be "Publicly supported" |
|---|---|
| X% active (e.g. 10% niacinamide) | Brand states it explicitly on product page or packaging |
| Fragrance-free | No parfum, fragrance, or scent-use essential oils in INCI confirmed |
| Sebum control / pore minimising | Published literature for the active at the stated % is sufficient for ingredient-level support. Finished-product trial = stronger. |
| Dermatologist tested | Published report with method, sample size, result, date. Not just a badge. |
| Clinically proven | Finished product trial, not just ingredient supplier data. |
| Non-comedogenic | Finished product non-comedogenic test result published |
| Hypoallergenic | HRIPT or repeat insult patch test, sample size, fragrance and allergen review |
| Pregnancy safe | Pregnancy-specific safety review; retinoid, hydroquinone, SA absence confirmed; essential oil review; systemic exposure rationale; healthcare caveat |
| Baby safe | Baby-specific safety review; pediatric dermatologist review; tear-free testing; fragrance and allergen policy; mildness data |
| SPF / PA / UVA / broad spectrum | SPF test report, ISO 24444 or accepted equivalent, lab name, test date, result summary |
| Natural / organic / Ayurvedic | Certification visible, natural origin calculation provided, ISO 16128 referenced |

#### Not Accepted as Strong Proof

- "Dermatologist tested" badge only (no study design, sample size, result, or doctor role)
- "Clinically proven" with no report
- Ingredient supplier study (does not prove finished product performance)
- "Lab tested" without lab name
- "Tested in Europe" (vague geography is not a method)
- Before/after images only
- Influencer reviews or consumer ratings
- "Clean," "non-toxic," or "chemical-free" (undefined or scientifically weak)
- "Ayurvedic," "natural," or "organic" without certificate

#### Score Anchors

- Hero concentration confirmed, no inflated claims, fragrance-free confirmed = 21–25
- Hero concentration confirmed, some efficacy claims not substantiated = 17–21
- Multiple unsubstantiated claims = 12–17

---

### PILLAR 4: Test Result Transparency — Max 15 pts

**Apply a letter grade. That grade maps to a score range.**

| Grade | Points | Criteria |
|---|---|---|
| **A** | 13–15 | Full or substantial report visible, independent lab named, method named, date visible, product or batch identifiable, result visible |
| **B** | 10–12 | Lab or method visible, result summary visible, but full report or batch details missing |
| **C** | 6–9 | Brand mentions testing, but method, lab, or specific details are weak or absent |
| **D** | 1–5 | Test claim exists but nothing supporting it is visible |
| **F** | 0 | Evidence is misleading, mismatched, or used incorrectly |

**Grade F examples (assign 0 pts and flag explicitly):**
- Ingredient study used as proof of finished product claim
- Consumer survey presented as clinical proof
- In vitro result used as human performance proof
- SPF claim without SPF test report
- "Chemical free" or "toxin free" used as a scientific claim

**For most Indian skincare brands without published test reports:** Grade C is the typical honest assignment. The brand may confirm concentrations (some transparency) but no lab test reports, clinical data, or method documentation is publicly accessible.

**What to write in the pillar note:**
- What IS visible (concentrations stated, INCI published)
- What is NOT visible (lab names, test reports, ISO methods, safety assessments, PET results)
- Whether any preservative efficacy test result is publicly accessible
- Grade assigned, plainly stated in a sentence (not as a shorthand)

---

### PILLAR 5: Consumer Clarity — Max 5 pts

**One point per criterion. These are binary — the information is there or it is not.**

| Point | Criterion |
|---|---|
| 1 | Clear use instructions (how to apply, when, how much) |
| 1 | Frequency guidance (daily / 2–3x weekly / weekly only) |
| 1 | Warnings present (actives, pregnancy, sun sensitivity, patch test) |
| 1 | Suitability guidance by skin type or use case |
| 1 | Honest caveats about results or individual reactions |

**Common deduction:** Most brands lose 1 pt for not providing layering guidance when selling multiple actives (niacinamide + retinol + vitamin C). This gap is common and worth noting in the note.

---

## PART 6: SCORING BANDS AND PUBLIC DECISION LABELS

### Scoring Bands

| Range | Label | Meaning |
|---|---|---|
| 85–100 | Strong public evidence | Brand has made a strong amount of evidence publicly visible |
| 70–84 | Mostly credible with gaps | Product looks broadly credible, but some proof is missing |
| 50–69 | Needs proof | INCI may be acceptable, but claims are stronger than public evidence |
| 30–49 | Weak public evidence | Product relies heavily on marketing with limited visible proof |
| Below 30 | High opacity or concern | Public evidence is insufficient or visible red flags exist |

**Calibration rule:** A product with no banned ingredients, no parabens, and a published INCI should score mid-60s to mid-70s as a baseline. It must earn its way to Good or Excellent through actively clean chemistry and genuine transparency — not by default. A product with no published test reports cannot score above approximately 84.

### Public Decision Labels

| Label | When assigned |
|---|---|
| "Strong public evidence" | INCI complete, claims specific and supported, at least one test report visible with method and lab, no major visible concern |
| "Mostly credible with gaps" | INCI coherent, no obvious red flags, but pH/active assay/PET/clinical data is missing |
| "Needs proof" | Strong claims made, but public proof is weak, mentioned-only, or absent |
| "Weak public evidence" | INCI incomplete, claims vague, or evidence contradicted |
| "High concern from public evidence" | Visible ingredients, claims, or missing test evidence create meaningful concern for the target user |
| "Not enough public data" | INCI missing, partial, hidden, or too vague to assess |

Pick the label that matches the full picture, not just the number.

---

## PART 7: CATEGORY TRIGGERS (Extra Scrutiny)

When a product matches one of these types, extra evidence is required before claims are supported:

| Category | Detection signals | Extra evidence required |
|---|---|---|
| **Active serum** | Niacinamide, vitamin C, retinol/retinal/HPR, AHAs, BHAs, PHAs, tranexamic acid, azelaic acid, alpha arbutin, peptides, exosomes | Active %, pH where relevant, stability data, irritation/patch testing, packaging suitability |
| **Sunscreen** | SPF, PA, UVA, UVB, broad spectrum, water resistance, sun protection, blue light, reef safe | SPF test (ISO 24444), UVA/PA test, photostability, water resistance test if claimed, UV filter compliance |
| **Baby care** | Baby, toddler, newborn, kids, family safe, pediatrician tested, tear free, gentle enough for babies | Baby mildness data, tear-free test, pediatric dermatologist review, fragrance and allergen review |
| **Pregnancy safe** | Pregnancy safe, maternity, breastfeeding safe, stretch mark, belly oil, nipple care | Pregnancy toxicology review, retinoid screen, hydroquinone screen, salicylic acid exposure review, essential oil review |
| **Sensitive skin** | Hypoallergenic, barrier repair, eczema prone, redness reducing, calming, non-irritating | HRIPT or patch test, fragrance-free verification, allergen review, pH disclosure, irritation assessment |
| **Eye area** | Eye cream, under-eye serum, lash serum, mascara, kajal, eyeliner, eyeshadow, brow serum | Ocular safety assessment, preservative safety near eyes, heavy metal testing for colour cosmetics |
| **Hair and scalp** | Shampoo, conditioner, scalp serum, hair oil, anti-dandruff, hair fall, hair growth, leave-on scalp treatment | Scalp irritation testing, preservation adequacy, drug boundary check for anti-dandruff or growth claims |

---

## PART 8: INDIA CONTEXT LAYER (Mandatory on Every Analysis)

Every scorecard must evaluate:

- **Fitzpatrick III–V skin types**: Most prevalent in India. Flag hyperpigmentation, sun sensitivity, and barrier concerns specifically for these skin tones.
- **Tropical + humid climate**: Flag heavy occlusives (Paraffinum Liquidum, mineral oil, heavy silicones) for Indian summers.
- **Hard water**: Sulfate surfactants react with Ca²⁺/Mg²⁺ ions; flag for Delhi, Bengaluru, Mumbai.
- **UV Index 8–11+ year-round**: SPF 15 is insufficient; flag any SPF below 30 for outdoor use.
- **Ayurvedic ingredients**: Identify and explain recognised Ayurvedic botanicals in INCI (neem, turmeric, ashwagandha, brahmi).
- **India regulatory status**: Note CDSCO registration where available.
- **Canada NHPID**: Apply for botanical, vitamin, mineral, essential oil, Ayurvedic terminology.

---

## PART 9: BADGES

### Pass Badges (require positive confirmation — never assumed)

| Badge | Criteria |
|---|---|
| INCI Verified | Full INCI on brand PDP, no trade names, no catch-alls |
| Fragrance-Free | No Parfum, Fragrance, or scent-use essential oils in INCI, confirmed |
| Sulfate-Free | No SLS, SLES, Ammonium Lauryl Sulfate confirmed |
| Paraben-Free | No methylparaben, propylparaben, butylparaben, ethylparaben confirmed |
| No PEG Compounds | No PEG-, Laureth-, Steareth-, or Oleth- ingredients |
| Reef-Safe UV Filters | Oxybenzone and Octinoxate confirmed absent |
| Vegan-Friendly | No animal-derived ingredients confirmed |
| Cruelty-Free (PETA) | Confirmed PETA certification only |
| Cruelty-Free (Leaping Bunny) | Confirmed Leaping Bunny certification only |
| SPF Verified (ISO 24444) | ISO 24444-compliant test report publicly visible |
| Preservative System Identified | Recognisable Annex V preservation strategy visible in INCI |
| Baby-Safe | Rinse-off, free from MIT/CMIT, formaldehyde releasers, fragrance — baby-specific review confirmed |
| Pregnancy-Safe | Free from retinoids, SA >2%, hydroquinone, formaldehyde releasers — specific review confirmed |

### Warn Badges (applied whenever ingredient/pattern is present or claim is unsupported)

| Badge | Trigger |
|---|---|
| Unverified SPF Claim | SPF stated, no ISO 24444-compliant test report publicly found |
| Synthetic Fragrance | Parfum/Fragrance listed without allergen breakdown |
| Fragrance Allergens Present | EU Annex III allergens identified in INCI |
| Formaldehyde Releaser | DMDM Hydantoin, Quaternium-15, or related compound present |
| Endocrine Disruptor Concern | Oxybenzone, Octinoxate, Butylparaben, or Propylparaben present |
| Low Active Concentration (Inferred) | Hero active appears after likely low-% preservative anchor |
| Irritant Risk | Known sensitiser confirmed in INCI |
| SLES Primary Surfactant | SLES at position 1–3 |
| Multiple PEG Compounds | 3+ ethoxylated ingredients present |
| Nitrosamine Precursor | Cocamide DEA/MEA, TEA present |
| Claim Not Publicly Substantiated | Strong claim with no visible supporting evidence |
| Preservative Concern | Water-based formula with high-scrutiny preservative or inadequate system |
| INCI Not on Brand Website | INCI found only on third-party sources |
| Not for Use During Pregnancy | Retinoids or restricted actives confirmed |
| Patch Test First | High-acid or sensitising formula |
| Mandatory SPF After Use | AHA/BHA/retinol — photosensitising actives present |

### Info Badges (informational, neutral)

| Badge | Trigger |
|---|---|
| India Climate Optimized | Lightweight, non-occlusive, suitable for humid conditions |
| Ayurveda-Aligned | Contains recognised Ayurvedic actives (neem, turmeric, ashwagandha, brahmi) |
| Contains Penetration Enhancers | Dimethyl Isosorbide, DMSO, or similar present |
| pH-Sensitive Formula | Performance or safety depends on pH not publicly disclosed |
| TGA Relevant | Product makes sun protection or therapeutic claims relevant to Australia TGA |
| Canada NHPID Relevant | Botanical, vitamin, mineral, or Ayurvedic terminology flagged for NHPID check |
| Dermatologically Tested (Citation Absent) | Claim exists on packaging but no linked study found |
| Professional-Strength Formula | High-acid or high-active product |

---

## PART 10: PUBLIC LANGUAGE RULES

**Always use:**
- "Based on public INCI..."
- "No obvious public red flag identified."
- "Appears plausible, but unverified."
- "Claim not publicly substantiated."
- "Needs proof."
- "Cannot be verified from INCI alone."
- "Likely low-concentration zone."
- "Evidence visible." / "Evidence mentioned only." / "Public evidence insufficient."

**Never use (unless fully proven):**
- "Safe" / "Unsafe" / "Certified" / "Compliant" / "Non-toxic"
- "Pregnancy safe" / "Baby safe" / "Clinically proven" / "Dermatologist approved" / "Hypoallergenic"

**Never include in output text:**
- Point amounts or deduction arithmetic ("−6 pts", "pillar score")
- Scoring mechanics ("mandatory deduction", "hard rule triggered")
- Internal references ("per the deduction table")
- INCI position numbers ("INCI position 2", "position 14")
- Technical jargon meant for internal use ("preservative anchor", "Confidence: High")
- Em-dashes (—) in consumer-facing text

**Standard disclaimer (include on every analysis):**
> "This assessment is based only on publicly available INCI, claims, and test evidence. It is not a full Clean Sheet certification. Full certification requires confidential formula review, exact concentrations, supplier documentation, manufacturing records, packaging compatibility, preservative efficacy, stability, and complete claim validation."

---

## PART 11: THE PDP TEMPLATE — EVERY FIELD

### Field reference table

```
FIELD                       TYPE            REQUIRED    DRIVES PDP SECTION
─────────────────────────────────────────────────────────────────────────────
productName                 string          ✅           Hero title
slug                        string          ✅           URL (/brands/[brand]/[slug])
brand                       string          ✅           Hero subtitle
brandSlug                   string          ✅           Navigation links
priceRange                  string          ✅           Hero ("₹569–₹599")
price                       number          optional    Price-per-ml calculation
sizeValue / sizeUnit        number/string   optional    Price-per-ml calculation
pricePerUnit                number          optional    Display only
productType                 enum            ✅           Scoring logic triggers
targetUser                  string          optional    Internal routing logic
category / subCategory      string          optional    Shop filtering
concern                     string          ✅           Hero subtext + "Best for" fallback
summary                     string          ✅           Hero summary (3 sentences)
score                       number          ✅           Score circle (0–100)
scoreLabel                  string          ✅           Legacy — keep for backward compat
publicDecisionLabel         string          ✅           Pill badge next to score breakdown
image                       string          ✅           Hero product image
pillars[]                   array           ✅           Score breakdown accordion (5 rows)
globalScreen                object          ✅           Regulatory screen (10 rows)
inciCompleteness            object          optional    Shown within regulatory screen
keyActives[]                array           ✅           Key actives list in hero
ingredients[]               array           ✅           Ingredient table (first 8 + expand)
claimsCheck[]               array           ✅           Claims check section
missingProof[]              array           ✅           "What would improve this score"
pass_badges[]               string[]        ✅           At-a-glance + proof cards
warn_badges[]               string[]        ✅           Proof cards + badge row
info_badges[]               string[]        ✅           Badge row
indiaContext                string          ✅           About this review > India note
cleanSheetNote              string          ✅           About this review disclaimer
analyzedAt                  string          ✅           Date display
skinTypeTags[]              string[]        ✅           "Best for" logic in hero
concernTags[]               string[]        ✅           Shop filtering
suitabilityTags[]           string[]        ✅           "Best for" first 3 items
cautionTags[]               string[]        ✅           "Avoid if" items
fragranceStatus             enum            optional    Internal filtering
alcoholStatus               enum            optional    Internal filtering
routineSlot                 enum            optional    AM/PM display
availabilitySources[]       string[]        optional    Buy icons (fallback)
retailerLinks[]             array           optional    Buy now rows (preferred)
```

### Pillars array

The 5 exact pillar names (copy precisely):

1. `"Public INCI Safety Screen"` — max 30
2. `"Formula Logic Inference"` — max 25
3. `"Public Claim Support"` — max 25
4. `"Test Result Transparency"` — max 15
5. `"Consumer Clarity"` — max 5

Each pillar entry:
```
pillars[].name           Must be one of the 5 exact names above
pillars[].score          Integer
pillars[].max            30, 25, 25, 15, 5 in that order
pillars[].note           Consumer-friendly paragraph — no em-dashes, no scoring
                         mechanics, no INCI position numbers
pillars[].evidenceGrade  Only on Pillar 4: "A" | "B" | "C" | "D" | "F"
```

### Ingredients array

```
ingredients[].name    INCI name exactly as on packaging
ingredients[].note    Plain English function + any relevant flag context (no em-dashes)
ingredients[].flag    "ok" | "info" | "warn"
```

Flag rules:
- `warn` — EU/India prohibited/restricted, IARC, formaldehyde releasers, oxybenzone, anything that triggers a deduction
- `info` — penetration enhancers, preservatives, silicones, single-concern ingredients worth noting but not harmful
- `ok` — everything else

### Regulatory screen

Each `globalScreen` field must be one of:
- `"No obvious public red flag found"` (green dot)
- `"Not triggered"` (green dot — use for NHPID/TGA when product type does not trigger them)
- `"Potential concern found — [ingredient name]"` (red dot)

Fields: `eu_1223_2009`, `india_cr_2020`, `health_canada_hotlist`, `canada_nhpid`, `tga_australia`, `us_fda_21cfr`, `korea_mfds`, `aicis_australia`, `echa_svhc`, `iarc`

### Claims check

```
claimsCheck[].claim           The exact claim as it appears on pack / website
claimsCheck[].evidenceStatus  "Evidence visible" | "Mentioned only" | "Missing"
claimsCheck[].decision        "Publicly supported" | "Needs proof" | "Not publicly supported"
claimsCheck[].note            1 plain sentence explaining the verdict
```

Minimum 3 claims. Include the hero concentration claim (e.g., "10% Niacinamide"), 1–2 efficacy claims, and at least one negative claim if present (e.g., "Fragrance-free").

### Missing proof

Good examples:
- "Formula pH is not publicly disclosed. This matters because niacinamide stability and preservative efficacy both depend on pH."
- "No preservative efficacy test result is publicly accessible. Independent challenge testing would verify the preservation system is adequate."
- "Zinc PCA and Zinc Glycinate concentrations are not stated, so the functional dose cannot be independently verified."

Bad examples (too vague):
- "More transparency needed"
- "Should publish studies"
- "pH missing"

### Suitability tags (drives "Best for")

The first 3 items in `suitabilityTags[]` are matched against these keywords:

| Tag value | "Best for" output |
|---|---|
| "Oily Skin" | "Oily and acne prone skin" |
| "Dry Skin" | "Dry skin" |
| "Combination Skin" | "Combination skin" |
| "Sensitive Skin" | "Sensitive skin types" |
| "Dark Spots and Pigmentation" | "Post-acne marks and dark spots" |
| "Pore Concern" | "Visible pores" |
| "Acne Prone Skin" | "Acne prone skin" (skipped if oily already matched) |
| "Skincare Beginners" | "Skincare beginners" |

Rule: Put the 3 most useful, distinct tags first. Never put "Oily Skin" and "Acne Prone Skin" both in the first 3 — they produce duplicate output.

### Caution tags (drives "Avoid if")

| Tag keyword | "Avoid if" output |
|---|---|
| "niacin" | "You have a known niacin sensitivity (niacin flush risk)" |
| "penetration enhancer" | "Stacking multiple penetration enhancer-based actives" |
| "ph not disclosed" | "Your skin barrier is already compromised or irritated" |
| "dual-acid" / "strong exfoliant" | "You have sensitive or eczema-prone skin" |
| "high irritation" | "You are new to active skincare — patch test first" |

---

## PART 12: STEP-BY-STEP SCORING GUIDE FOR ANALYSTS

### Before scoring anything

1. Find the INCI (see Part 13)
2. Find the price in India
3. Find any reviews/ratings
4. Check for controversies or recalls
5. Check for published test documentation

Only once you have all 5 of these should you open the scoring framework.

### Scoring Pillar 1 (Safety)

Start at 30. Apply each mandatory deduction from the deduction table where the ingredient is present. Apply hard rule caps if triggered. Record findings in the pillar note.

### Scoring Pillar 2 (Formula Logic)

Start at 25. Examine INCI order. Assess active placement relative to preservative anchors. Apply deductions for pH-dependent actives with no pH disclosure, trade names, missing preservation strategy, or hero actives appearing after the likely low-concentration zone.

### Scoring Pillar 3 (Claim Support)

List every claim. Assess each as "Evidence visible," "Mentioned only," or "Missing." Use the claim verification matrix. Sum sub-scores to a total.

### Scoring Pillar 4 (Transparency)

Assign a letter grade (A–F) based on what test documentation is publicly visible. That grade maps directly to a points range. Document grade rationale in the note.

### Scoring Pillar 5 (Consumer Clarity)

Check the brand's product page for each of the 5 binary criteria. Award 1 pt per criterion met.

### Final calibration

Add all 5 pillars. Check against the scoring bands. Assign `publicDecisionLabel` based on the full picture. Verify: score total equals pillar sum; label matches score range AND overall picture.

---

## PART 13: DATA SOURCING METHODOLOGY

### Step 1 — Find the INCI

Priority order (stop when you find it):
1. Brand's own product page
2. Brand's Indian site if different
3. Nykaa product listing (usually in "More Information" or "Ingredients" tab)
4. Amazon.in product listing
5. InciDecoder — `incidecoder.com/products/[brand]/[product]`
6. OpenBeautyFacts

Record where you found it. This affects the `inciCompleteness.status` field:
- `"Full INCI on brand PDP"` — found on the brand's own website
- `"Marketplace only"` — only found on Nykaa/Amazon, not the brand site
- `"Partial"` — some ingredients listed but list appears incomplete
- `"Missing"` — could not be located anywhere

Verify the INCI is complete: cross-check across 2–3 sources. If sources disagree, note the discrepancy.

### Step 2 — Find the price

Sources: Nykaa.com (most reliable for Indian market), Amazon.in, brand's own website.

Record as a range (₹569–₹599 if there are size variants or platform differences).

Calculate price per ml: `price (MRP) / sizeValue in ml = pricePerUnit`

### Step 3 — Find ratings and reviews

Priority: Nykaa, Amazon.in, Flipkart, Purplle.

Record:
- Overall rating (out of 5)
- Number of ratings/reviews
- Top praise themes (2–3 things users highlight positively)
- Top complaint themes (2–3 things users flag)

These go into `indiaContext` and inform the `summary` field's third sentence.

### Step 4 — Check for regulatory flags and controversies

Run these searches:
- `"[product name]" India "banned ingredient" OR recall OR controversy`
- `"[brand name]" CDSCO recall`
- For each flagged or unfamiliar ingredient: `"[ingredient name]" ECHA SVHC`
- For each flagged ingredient: `"[ingredient name]" Health Canada Hotlist`
- For preservatives: `"[ingredient name]" leave-on banned OR restricted`
- For UV filters: `"[UV filter name]" EU Annex VI OR MFDS Korea`

If you find a CDSCO recall, document it in `indiaContext`. If you find a confirmed regulatory flag, apply the mandatory deduction and record in `globalScreen`.

### Step 5 — Check for published test documentation

Run these searches:
- `site:[brand-domain] "lab test" OR "certificate" OR "clinical" OR "dermatologist"`
- `"[brand name]" "SPF test" OR "ISO 24444"` (sunscreens)
- `"[brand name]" "patch test" OR "HRIPT"` (sensitive skin claims)
- `"[brand name]" "non-comedogenic test"`
- `"[brand name]" "preservative efficacy" OR "ISO 11930"`

What you are looking for: an actual report (PDF or linked page) with lab name, method, date, and result. Not just a badge on the website. Not just "we tested it" in an FAQ.

### Filling in specific fields

**summary (3 sentences):**
1. What the product is and what it is designed to do
2. Key public INCI finding — what the ingredient list tells you, in plain language
3. What real users report and any India-specific context

**indiaContext:**
Cover at least 2 of: Fitzpatrick III–V relevance, climate suitability (humid climate, hard water), CDSCO status, India-specific use notes, UV Index relevance.

**keyActives (3–5 entries):**
Pick the ingredients doing the actual work, not base carriers. Each entry:
- `name`: INCI name + common name if different (e.g., "Niacinamide (10%)" or "3-O-Ethyl Ascorbic Acid")
- `function`: what it does mechanistically, in plain language — not marketing language
- `concentrationConfidence`: High (brand confirmed), Medium (position-inferred), Low (position ambiguous or after preservative)

**ingredients (full list in INCI order):**
Every ingredient from the label, in the exact order it appears. For the `note` field: state the primary function first, add any relevant context without position numbers, flag any ingredient carrying a regulatory or consumer note. Use "info" flag sparingly — only when the ingredient genuinely warrants a note.

---

## PART 14: STORE AND REDIRECT SYSTEM

### How it works

Every product analysis is stored in the `scorecard_cache` Supabase table. The system checks in this order:

1. **In-memory cache** (Map, server process lifetime) — fastest path
2. **Supabase `scorecard_cache`** (persistent across deployments) — keyed by normalised `cache_key`
3. **Gemini** — only called if not found in either cache

On a successful new analysis: result is saved to both Supabase and in-memory cache. The analyser redirects to `/analyzed/[slug]` where the stored scorecard is rendered as a full PDP.

### Supabase table structure

```sql
create table public.scorecard_cache (
  id          uuid default gen_random_uuid() primary key,
  cache_key   text not null unique,   -- normalised URL or product name string
  source_url  text,                   -- original URL if submitted
  slug        text not null unique,   -- URL-safe slug for /analyzed/[slug]
  product_name text not null,
  brand_name  text not null,
  scorecard   jsonb not null,         -- full Gemini output stored as JSONB
  hit_count   integer default 1,
  created_at  timestamptz default now(),
  last_hit_at timestamptz default now()
);
```

Row Level Security: enabled. Read policy: public (anyone can read). Write: service role only (via `createAdminClient()`).

### Routing logic for known products

The analyser has hardcoded redirect maps that bypass the AI engine for already-scored products in the static brand files:

- **URL-based redirects**: If a pasted URL matches a known brand domain + product slug pattern, redirect directly to the static PDP without triggering Gemini
- **Name-based redirects**: If the user types a brand name + product descriptor matching a known product, redirect directly

Dynamic (AI-generated) scorecards live at `/analyzed/[slug]`. Static (curated) scorecards live at `/brands/[brand]/[product]`.

### The `/analyzed/[slug]` page

Renders AI-generated scorecards from the Supabase cache as full PDPs. Differences from curated PDPs:
- AI banner shown: "AI-analyzed from public data. Not a certification."
- "More from brand" section is not shown
- Back link goes to `/analyzer`

---

## PART 15: DATA QUALITY CHECKLIST

Before publishing or marking an analysis complete, verify each item:

- [ ] INCI source confirmed and recorded in `inciCompleteness`
- [ ] Every INCI ingredient has an entry in `ingredients[]`
- [ ] Ingredients are in the same order as the INCI on the packaging
- [ ] Score total equals sum of all 5 pillar scores
- [ ] `publicDecisionLabel` matches the score range and overall picture
- [ ] `pass_badges` are only included if confirmed (never assumed)
- [ ] `warn_badges` are included for every confirmed concern
- [ ] `globalScreen` has an entry for all 10 authorities
- [ ] `claimsCheck` covers the hero concentration claim and at least 2–3 efficacy claims
- [ ] `missingProof` is specific and actionable (not generic)
- [ ] Pillar notes contain no em-dashes, no scoring mechanics, no INCI position numbers, no "Confidence: High"
- [ ] `summary` reads as 3 complete sentences in plain language
- [ ] `suitabilityTags` first 3 items produce distinct, non-overlapping "Best for" items
- [ ] `analyzedAt` is set to today's date (ISO format: YYYY-MM-DD)
- [ ] TypeScript type check passes: `npx tsc --noEmit`

---

## PART 16: COMMON MISTAKES AND FIXES

**"Oily and acne prone skin" appearing twice in Best for:**
Cause: Both "Oily Skin" and "Acne Prone Skin" in the first 3 suitabilityTags.
Fix: Move "Acne Prone Skin" to position 4 or later, and replace with a more distinct 3rd tag.

**Pillar note containing "INCI position 2" or "preservative anchor":**
Fix: Replace with plain language. "Listed second after water" not "INCI position 2". "Listed high enough in the formula to suggest a working concentration" not "before the preservative anchor".

**Score is 91 for a product with no published test reports:**
Fix: Re-check Pillar 4. No published test reports = Grade C = maximum 9 pts. A product with no test reports cannot score above approximately 84 without extraordinary transparency in other pillars.

**Regulatory screen showing red dots for irrelevant authorities:**
Fix: Use "Not triggered" for Canada NHPID (use only if product has botanicals/naturals/Ayurvedic ingredients) and TGA Australia (use only if product makes therapeutic claims). These should not be "No obvious public red flag found" — that implies active screening when they simply do not apply.

**`warn_badges` being empty when known issues exist:**
Fix: If `cautionTags` has "High Irritation Potential", "Strong Exfoliants", or similar, there should be a corresponding `warn_badges` entry. Badges and tags should be consistent.

**Em-dashes appearing in pillar notes, ingredient notes, or summary:**
Fix: Replace with: period (to start a new sentence), comma (for apposition), colon (for cause/consequence), or a relative clause ("that", "which", "with", "for").

**`cleanSheetNote` missing or generic:**
Always include the standard disclaimer exactly:
> "This assessment is based only on publicly available INCI, claims, and test evidence. It is not a full Clean Sheet certification. Full certification requires confidential formula review, exact concentrations, supplier documentation, manufacturing records, packaging compatibility, preservative efficacy, stability, and complete claim validation."

---

## PART 17: AI MODEL CONFIGURATION

| Setting | Value |
|---|---|
| Model | Google Gemini 2.5 Flash |
| Temperature | 0 (fully deterministic) |
| Tools | Google Search grounding enabled |
| Max duration | 120 seconds |
| Execution | Serverless (Next.js API route) |

Four system prompt modes:
1. **CLEAN_SHEET_SYSTEM_PROMPT** — Single product analysis (URL or name); returns 5-pillar Public Evidence Score
2. **COMPARISON_SYSTEM_PROMPT** — Two products compared head-to-head for a specific concern
3. **EXPERT_ANSWER_SYSTEM_PROMPT** — Ingredient safety / skin concern questions
4. **CHAT_SYSTEM_PROMPT** — Follow-up questions after a scorecard is shown

---

## PART 18: COMPLETE OUTPUT JSON STRUCTURE

What Gemini returns and what gets stored in `scorecard_cache.scorecard`:

```json
{
  "productName": "Niacinamide 10% Face Serum",
  "brand": "Minimalist",
  "priceRange": "Rs.569–599",
  "productType": "leave-on | rinse-off | baby | eye-area | sunscreen | hair",
  "targetUser": "general adult | sensitive skin | baby | pregnancy | eye area",
  "summary": "3 sentences: (1) what it is and does, (2) key public INCI finding, (3) what real users report",
  "score": 91,
  "publicDecisionLabel": "Strong public evidence | Mostly credible with gaps | Needs proof | Weak public evidence | High concern from public evidence | Not enough public data",
  "pillars": [
    {
      "name": "Public INCI Safety Screen",
      "score": 27,
      "max": 30,
      "note": "Factual findings from visible INCI: ingredient names, regulatory flags, sensitizers, allergens, special population concerns. No scoring arithmetic."
    },
    {
      "name": "Formula Logic Inference",
      "score": 22,
      "max": 25,
      "note": "What can be cautiously inferred: active placement, preservative strategy, pH-dependent logic, compatibility. Use confidence language: appears plausible, cannot be verified, likely low concentration. No certainty without public data."
    },
    {
      "name": "Public Claim Support",
      "score": 21,
      "max": 25,
      "note": "Whether each claim has visible public evidence (report, lab, method, result) or is only mentioned, or is not supported. No scoring arithmetic."
    },
    {
      "name": "Test Result Transparency",
      "score": 13,
      "max": 15,
      "evidenceGrade": "A | B | C | D | F",
      "note": "What test evidence is publicly visible, what method and lab are named, what is missing, and whether any evidence is mismatched or misused."
    },
    {
      "name": "Consumer Clarity",
      "score": 4,
      "max": 5,
      "note": "Whether use instructions, warnings, frequency guidance, and suitability caveats are clear and honest."
    }
  ],
  "globalScreen": {
    "eu_1223_2009": "No obvious public red flag found | Potential concern found — [ingredient name]",
    "india_cr_2020": "No obvious public red flag found | Potential concern found",
    "health_canada_hotlist": "No obvious public red flag found | Potential concern found",
    "canada_nhpid": "Not triggered | Triggered — [reason]",
    "tga_australia": "Not triggered | Triggered — [reason]",
    "us_fda_21cfr": "No obvious public red flag found | Potential concern found",
    "korea_mfds": "No obvious public red flag found | Potential concern found",
    "aicis_australia": "No obvious public red flag found | Potential concern found",
    "echa_svhc": "No obvious public red flag found | Potential concern found",
    "iarc": "No obvious carcinogenicity flag found | Potential concern found — [ingredient, group]"
  },
  "inciCompleteness": {
    "status": "Full INCI on brand PDP | Marketplace only | Partial | Missing",
    "flags": ["list any INCI completeness flags that apply"]
  },
  "keyActives": [
    {
      "name": "Niacinamide (INCI) / Vitamin B3 (common)",
      "function": "Reduces sebum, fades PIH, minimises pore appearance, anti-inflammatory",
      "concentrationConfidence": "High | Medium | Low"
    }
  ],
  "ingredients": [
    {
      "name": "Water/Aqua",
      "note": "Solvent base — function plus any regulatory or safety flag in plain language",
      "flag": "ok | warn | info"
    }
  ],
  "claimsCheck": [
    {
      "claim": "10% Niacinamide",
      "evidenceStatus": "Evidence visible | Mentioned only | Missing",
      "decision": "Publicly supported | Needs proof | Not publicly supported",
      "note": "1 sentence plain explanation"
    }
  ],
  "missingProof": [
    "List what public evidence the brand would need to show to improve the score"
  ],
  "pass_badges": ["Paraben-Free", "Fragrance-Free", "INCI Verified"],
  "warn_badges": [],
  "info_badges": ["India Climate Optimized"],
  "indiaContext": "Specific note on India climate, skin type (Fitzpatrick III–V), or CDSCO regulatory relevance",
  "chatOpener": "1–2 sentences opening follow-up conversation, product-specific, does not repeat the score",
  "cleanSheetNote": "This assessment is based only on publicly available INCI, claims, and test evidence. It is not a full Clean Sheet certification. Full certification requires confidential formula review, exact concentrations, supplier documentation, manufacturing records, packaging compatibility, preservative efficacy, stability, and complete claim validation.",
  "dataSource": {
    "inciFound": true,
    "inciSource": "brand PDP | InciDecoder | Nykaa | Amazon | Not publicly available",
    "inciOnBrandPDP": true,
    "priceSource": "Nykaa, Amazon",
    "reviewPlatforms": ["Nykaa", "Amazon India"],
    "rating": 4.6,
    "reviewCount": "2400+ ratings",
    "userSentiment": "2 sentences: what users praise and what they flag"
  }
}
```

---

## PART 19: TYPESCRIPT AND DATABASE TYPES

### TypeScript type (static brand files)

```typescript
ProductScorecard {
  productName: string
  slug: string
  brand: string
  brandSlug: string
  priceRange: string          // "₹569–₹599"
  price?: number              // MRP in INR
  sizeValue?: number
  sizeUnit?: string           // "ml", "g"
  pricePerUnit?: number       // price per ml
  productType: "leave-on" | "rinse-off" | "treatment" | "sunscreen" | "toner" | "baby" | "eye-area" | "hair"
  targetUser?: "general adult" | "sensitive skin" | "baby" | "pregnancy" | "eye area"
  category?: string           // "Serums", "Sunscreens"
  subCategory?: string        // "Niacinamide Serum"
  concern: string             // "Acne, oiliness, dark spots"
  summary: string
  score: number               // 0–100
  publicDecisionLabel: "Strong public evidence" | "Mostly credible with gaps" | "Needs proof" | "Weak public evidence" | "High concern from public evidence" | "Not enough public data"
  image: string               // CDN URL
  pillars: Pillar[]           // 5 pillars
  keyActives: KeyActive[]     // includes concentrationConfidence
  ingredients: Ingredient[]   // each has name, note, flag
  globalScreen: Record<string, string>  // per-authority verdict
  inciCompleteness: { status: string; flags: string[] }
  claimsCheck: ClaimsCheckItem[]
  missingProof: string[]
  pass_badges: string[]
  warn_badges: string[]
  info_badges: string[]
  indiaContext: string
  cleanSheetNote: string
  analyzedAt: string          // ISO date
  skinTypeTags?: string[]     // ["oily", "combination", "acne-prone"]
  concernTags?: string[]      // ["Acne", "Pigmentation"]
  suitabilityTags?: string[]  // ["Daily Use", "Oily Skin"]
  cautionTags?: string[]      // ["Acid Active", "Pregnancy Not Reviewed"]
  routineSlot?: "AM" | "PM" | "AM+PM"
  fragranceStatus?: "free" | "synthetic" | "essential-oil" | "both" | "unknown"
  certificationStatus?: "tcs-certified" | "under-review" | "not-certified"
  claimsMade?: string[]
  claimsVerified?: string[]
  claimsNotVerified?: string[]
  availabilitySources?: string[]
}
```

### Supabase database tables

**products table** (core product data)
```
id, brand_id, brand_name, brand_slug, product_name, slug,
category, subcategory, product_type,
size_value, size_unit, mrp, price_min, price_max, price_per_ml,
product_image_url, ingredient_list, claims[],
fragrance_free, skin_type_tags[], concern_tags[],
suitability_tags[], caution_tags[],
status, analysis_confidence, analyzed_at, is_published
```

**product_scores table** (scoring data, separate from product)
```
product_id (FK → products.id, UNIQUE),
total_score, safety_score (max 30), formula_score (max 25),
claims_score (max 25), transparency_score (max 15), clarity_score (max 5),
public_decision_label, verdict, best_for[], avoid_if[],
expert_summary,
pass_badges[], warn_badges[], info_badges[],
score_breakdown_json   -- stores globalScreen, inciCompleteness, claimsCheck, missingProof
```

**scorecard_cache table** (AI-generated dynamic scorecards)
```
id, cache_key (unique), source_url, slug (unique),
product_name, brand_name,
scorecard (jsonb),
hit_count, created_at, last_hit_at
```

---

## PART 20: SCOPE RULES

**Always IN SCOPE:**
Skincare, haircare, body care, personal hygiene, color cosmetics (lipstick, foundation, concealer, blush, eyeshadow, mascara, eyeliner, nail polish, BB/CC cream, tinted moisturiser, glitter), sunscreen, deodorant, perfume/fragrance, soap, shampoo, conditioner, hair colour, hair oil — anything applied to the human body for hygiene, grooming, or aesthetic purposes.

**OUT OF SCOPE:**
Finance, sports, food, technology, clothing. When in doubt, treat as IN SCOPE.

---

*File location: /Users/sonalverma/Desktop/TCS_Complete_Reference.md*
*Supersedes: TCS_Scoring_System_Documentation.md + TCS_PDP_Template_Guide.md*
*Generated from live codebase: /Users/sonalverma/Desktop/thecleansheet-web*
*Regulatory standards: EU 1223/2009, SCCS/1602/18, ECHA SVHC, IFRA 49th, India CR 2020, US FDA 21 CFR, CIR, MFDS Korea, Health Canada Hotlist, Canada NHPID, AICIS Australia, TGA Australia, IARC, ISO 22716, ISO 11930, ISO 24444, ISO 16128*
*Last updated: June 2026*
