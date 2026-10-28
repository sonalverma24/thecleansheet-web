# The Clean Sheet analyser: reference

> **Generated file. Do not edit it by hand.** It is built from the code by `npm run docs:analyser`, and `npm test` fails when it is out of date.
> The only hand-written part is the decision log at the end (`docs/analyser-decisions.md`).
> It states how the analyser works as the code stands. It holds no product counts, dates or commit hashes: those change without the code changing.

## 1. Versions

| What | Value | Note |
|---|---|---|
| Release line | X1 | |
| Approved baseline | X1-approved-2026-10-28 | Owner-approved local and production behaviour. |
| Stored decision method | TCS-X 1.0 | |
| Copy templates | copy-1 | Every reason sentence is built from a template; the maximum reason length is 220 characters. |
| Rubric revision | r7 | r7: total code-summed from sections + claimEvidence capped to the finished-product evidence actually in claimMap + approval requires a retrieved INCI; r6: 4-tier stamp rename + code-verified hard-flag guardrails |
| Pillar rubric revision | r9 | r9: standing from the four pillars (well 70, floor 50), see STAMPS.md |

A new analysis is stamped with the rubric revision above, or with the pillar revision when `ANALYSER_PILLAR_STANDING` is on. The site shows analyses stamped with either.

## 2. Flags

Each behaviour that changes what a shopper sees has its own flag, read from the server environment, off unless set to `1` or `true`.

| Environment variable | What it does |
|---|---|
| `ANALYSER_ONTOLOGY_TICKS` | 5a. At a glance ticks read the claim ontology instead of the substring logic. Needs reviewed aliases first. |
| `ANALYSER_SUPPRESS_DISPUTED_TICKS` | 5b. Suppress a disputed tick and show "This claim is being checked." (not built yet) |
| `ANALYSER_UNDER_REVIEW_ENDORSEMENT` | 5c. A Good Standing review with an unresolved dispute shows Provisional (not built yet) |
| `ANALYSER_HOLD_NEW_CONTRADICTIONS` | 5d. Hold NEW reviews on a definitive match or a source conflict (not built yet) |
| `ANALYSER_POLICY_CATCHALL_GATE` | 5e. A catch-all caps the total at 64, RUBRIC_REV r9 (not built yet) |
| `ANALYSER_POLICY_ANCHOR_REQUIRED` | 5f. Good Standing needs an anchored ingredient list, else Provisional (not built yet) |
| `ANALYSER_STRICT_IDENTITY` | 5g. Only confirmed identity serves an existing review (not built yet) |
| `ANALYSER_PILLAR_STANDING` | Standing from the four pillars (well 70, floor 50) instead of the 7-section total; stamps rows r9. See STAMPS.md. |
| `ANALYSER_PILLS_PAGE` | Version X1's pills page: the five buying decisions (Good choice, Buy with caution, Look elsewhere, Not enough info, Medicinal product) replace the four standings, and the stored-review product page uses the 13-block layout (src/lib/pills-page.ts). The decision is computed at render time from the stored review; nothing is written. Static catalogue pages have no review and are unchanged. |
| `ANALYSER_NEW_LAYOUT` | The new product page layout (the 13-block design) for a stored review, with TODAY'S standing in the take card and no confidence. Nothing about what the page decides changes: the standing, the search title and description, the star rating and what is indexed are today's. The pills page above implies this layout and also changes the decision. Static catalogue pages have no stored review and are unchanged. |
| `ANALYSER_INGREDIENT_ALIASES` | Ingredient alias table (src/data/ingredient-aliases.ts): a label name that is another name for a row we already hold ("Water" for Aqua) resolves to that row instead of "not in our reference database". Applies only to entries the owner has signed off, so with this on and nothing signed off, nothing changes. Adds no ingredient and no regulatory fact. |

## 3. The decisions a shopper sees

| Key | Label | Meaning |
|---|---|---|
| `good-choice` | Good choice | Evidence supports buying this product for the intended user. |
| `buy-with-caution` | Buy with caution | Potentially worthwhile, but there are meaningful considerations. |
| `look-elsewhere` | Look elsewhere | Material concerns or poor suitability make alternatives preferable. |
| `not-enough-info` | Not enough info | Insufficient reliable evidence for a buying recommendation. |
| `medicinal-product` | Medicinal product | Requires assessment under the appropriate medicine framework. |

## 4. How a decision is made

From `src/lib/analyser-x/decision.ts`:

~~~~text
Analyser Version X1 · the decision

   Precedence is fixed:  Medicinal  >  Look elsewhere  >  Not enough info
                         >  Buy with caution  >  Good choice.

   Settling comes first. A finding that is only trustworthy when the ingredient list is
   reliable (a prohibited ingredient, a contradicted claim) is converted into a gap when
   the list is not reliable: an apparent problem in an unverified list is something to
   verify, never something to publish.
~~~~

Good choice needs all of these supports: `support.list_verified`, `support.safety_clear`, `support.claims_proportionate`. Without them the decision is Not enough info (`gap.support_insufficient`).

## 5. Reasons

A decision is built only from findings. Each finding has a rule id, the facts it used, and a sentence made from a fixed template; no model text appears in a reason.
The prefix of a rule id says what kind of reason it is:

- `med.*`: severity medicinal: the decision is Medicinal product (highest precedence)
- `block.*`: severity block: the decision is Look elsewhere (only a finding made by code counts, never one resting on the model's judgement)
- `gap.*`: severity gap: the decision is Not enough info
- `caution.*`: severity caution: the decision is Buy with caution
- `support.*`: severity support: positive evidence; Good choice needs the three core supports listed below
- `note.*`: severity note: rides along under any outcome except Not enough info

The templates, exactly as written in `src/lib/analyser-x/copy.ts` (`p` holds the finding's parameters):

~~~~ts
med.drug_active: (p) => `Contains ${s(p.active)}, a licensed medicine active in India. It is assessed as a medicine, not a cosmetic.`
med.family: () => "This product type is a medicine class in India, so it is assessed as a medicine, not a cosmetic."
med.register_listed: (p) => `Listed on the ${s(p.register)} as ${clip(p.product)} (${s(p.identifier)})${p.source ? `, read ${from(p)}` : ""}. It is assessed as a medicine, not a cosmetic.`
med.rx_text: () => "The product describes itself as a prescription medicine, so it is assessed as a medicine, not a cosmetic."
block.prohibited: (p) => `${s(p.ingredient)} is prohibited in cosmetics${p.where ? ` in ${s(p.where)}` : ""}. Found in the ingredient list read ${from(p) || "from the product page"}.`
block.contradicted: (p) => `The product says “${s(p.claim)}”, but its ingredient list includes ${s(p.ingredient)} (${from(p) || "from the product page"}).`
block.fairness: () => "The product makes a skin-whitening or fairness claim, which India's advertising code treats as misleading."
block.pillars: (p) => `Two areas of our checks fall short: ${s(p.pillarA)} and ${s(p.pillarB)}. Details are below.`
gap.no_list: (p) => (p.__acq ? "We could not read the ingredient list when we analysed this. We are checking again." : "We could not find a full ingredient list for this product, so we cannot complete our safety check.")
gap.list_unreliable: () => "The only ingredient list we found is not from a source we can verify."
gap.formula_conflict: () => "Two sources list different ingredients for this product. We are checking which is current."
gap.identity: () => "We could not confirm exactly which product this is, so we have not judged it."
gap.acquisition: () => "We could not read the product page when we analysed it. We are checking again."
gap.claims_unreliable: () => "We could not confirm the product's claims from text we read, so we have not judged them."
gap.list_blocked: () => "One of our checks flagged something we are still verifying. We will update this page."
gap.possible_medicinal: () => "This may be a medicine rather than a cosmetic. We are verifying before we say more."
gap.support_insufficient: () => "Nothing we checked is a problem, but there is not enough verified evidence to recommend it."
caution.soft_adverse: (p) => `${s(p.label)}: ${s(p.detail)}`
caution.audience: (p) => `${s(p.ingredient)} is ${s(p.note)}. This matters most for ${s(p.audience)} use.`
caution.catch_all: (p) => `The list includes an unnamed entry (${s(p.entry)}), so part of the formula is not disclosed.`
caution.claim_gap: (p) => Number(p.count) > 1
caution.boundary: () => "Some wording goes further than a cosmetic can say in India. Treat it as a cosmetic benefit, not a treatment."
caution.formula: () => "The formula may not deliver everything the claims promise."
caution.spf_low: (p) => `SPF ${s(p.spf)} is below the SPF 30 that The Clean Sheet treats as the minimum for daily outdoor use in India.`
caution.benchmark_gap: (p) =>
support.list_verified: (p) => `The ingredient list was read ${from(p) || "from a source we can verify"} and matches the product name.`
support.safety_clear: (p) => Number(p.recognised) >= Number(p.total) ? `No prohibited or flagged ingredient in our screen (all ${s(p.total)} listed ingredients checked).` : `No prohibited or flagged ingredient among the ${s(p.recognised)} of ${s(p.total)} listed ingredients our screen checked.`
support.claims_proportionate: () => "The claims are modest, or the main claims are backed by a test on this product."
support.formula_sound: () => "The formula and format plausibly deliver the claims."
note.endocrine: (p) => `${s(p.ingredient)}: ${s(p.note)}. Legal at its permitted level.`
note.screen_partial: (p) => `${s(p.n)} of ${s(p.total)} listed ingredients ${Number(p.n) === 1 ? "is" : "are"} not in our reference database (${s(p.names)}), so our screen did not check ${Number(p.n) === 1 ? "it" : "them"}.`
note.freshness: (p) => `Evidence last checked${on(p.checkedAt)}. We re-check older analyses.`
note.restricted_unverified: (p) =>
note.framework_differs: (p) => `${s(p.detail)}. We assessed it as a cosmetic.`
note.retinoid: (p) => `${s(p.ingredient)} is a retinoid. If you are pregnant or planning a pregnancy, ask your doctor before using it.`
~~~~

## 6. Thresholds and reference lists

Four-pillar standing (`src/lib/pillar-standing.ts`):

~~~~json
{
  "well": 70,
  "floor": 50,
  "params": {
    "deductSoft": 1,
    "deductDisclosed": 0.2,
    "deductNotDisclosed": {
      "public": 0.6,
      "brand": 0.35,
      "private": 0.15
    }
  }
}
~~~~

Independent testing houses (`src/lib/analyser-x/ladder.ts`). A lab not on this list is "named" but not "independent", which caps the evidence level at 4. Changing this list changes brands' evidence levels:

`intertek`, `sgs`, `eurofins`, `bureau veritas`, `tuv`, `tüv`, `dermscan`

## 7. The model prompt, exactly as sent

`PRODUCT_REVIEW_SYSTEM_PROMPT` in `src/lib/product-review-context.ts`. The model reads and proposes; the verdict, the evidence level and the decision are computed in code (sections 3 to 5).

~~~~text
You are the claims intelligence engine for The Clean Sheet™, India's first independent beauty and personal care transparency platform.

Your job is NOT to assess ingredient safety (that is the Analyzer's role). Your job is to evaluate one specific question:

  "Does what this brand claims match what this product can realistically do?"

You are building The Clean Sheet Product Review - a structured, repeatable framework that works for any product category: moisturizer, serum, sunscreen, shampoo, conditioner, body wash, hair serum, deodorant, face wash, toner, eye cream, and more.

THE CORE QUESTION YOU ANSWER:
  Is the claim proven on this exact product, or only borrowed from the ingredient story?
  This is the Clean Sheet signature question. Return to it after every claim you analyze.

---

EVIDENCE INTEGRITY - NO FABRICATION (highest priority, overrides everything):
  - NEVER state that a product contains a specific ingredient (e.g. "Parfum/Fragrance", "Alcohol") unless that ingredient appears VERBATIM in an INCI list you actually retrieved. Do not infer presence from the product type, brand, or a similar product.
  - Every source you name must actually contain what you attribute to it. Do not attribute a finding to INCIDecoder, a brand site, or a marketplace unless that source truly shows it. Misquoting a source is fabrication and is worse than saying "not found".
  - For a "free from X" / "X-free" claim (fragrance-free, alcohol-free, paraben-free): if the retrieved INCI does NOT list X, the claim is SUPPORTED. A clean INCI proves the claim true, do not invent a contradiction. Only flag a conflict when you can QUOTE X in the retrieved INCI. If you could not retrieve the INCI, say so and do not assume X is present.
  - For a "contains [active] X" claim: FIRST map the marketing name to its INCI name, THEN check the retrieved INCI. Common maps: Pro-Vitamin B5 = Panthenol / D-Panthenol; Black Seed / Black Cumin Oil = Nigella Sativa Seed Oil; Onion = Allium Cepa; Hyaluronic Acid = Sodium Hyaluronate; Vitamin C = Ascorbic Acid / Sodium Ascorbyl Phosphate / Ethyl Ascorbic Acid; Vitamin E = Tocopherol; Vitamin B3 = Niacinamide; Aloe = Aloe Barbadensis. If the mapped ingredient is present, the claim is SUPPORTED.
  - If a claimed active is genuinely absent from the retrieved INCI even after name-mapping, mark it UNVERIFIED (could not confirm), NOT contradicted. A retrieved INCI can be the wrong variant/size, truncated, or outdated, so its absence is not proof of absence. NEVER call a brand's advertising "misleading" or an ASCI violation solely because a claimed ingredient is missing from a scraped INCI. Only a claim that is affirmatively disproven (e.g. "fragrance-free" while Parfum is listed) may be called contradicted.
  - DO NOT INVENT CLAIMS. Every entry in claimMap must be a claim you actually saw in a brand or marketplace source - quote the wording, don't paraphrase into a claim the brand never made. This is critical for "free from X" / "X-free" claims: only list one if those exact words appear in a source. Never manufacture a "silicone-free", "sulphate-free", etc. claim just because the product could have made it. A fabricated claim that is then flagged as contradicted is the worst possible error.
  - ONE PRODUCT ONLY - never import another SKU's claims. Every claim in claimMap must be about the EXACT product under review (this variant, this format). A brand's homepage, "collections" pages, bundles, and marketplace listings routinely show OTHER products from the same brand right next to this one. Do NOT harvest a claim unless the source page is clearly about THIS product. A cross-CATEGORY mismatch is the tell-tale sign of misattribution and is forbidden: a body moisturizer / body wash / lotion must NOT carry hair, scalp, hair-fall, dandruff, frizz, or shine claims; a hair product must not carry skin/face claims; a face serum must not carry oral-care claims. If a striking claim (e.g. "50% less hair fall in 28 days") belongs to a different product type than the one you are reviewing, it is another SKU's claim - drop it. When unsure whether a claim is for this exact product, leave it out.

---

RESEARCH PROTOCOL (execute in this order before scoring):

Step 1 - Identify the product completely.
  Search: "[brand] [product name]" to find the brand's official product page.
  Capture: Full product name, exact quantity (ml or g), MRP.

Step 2 - Map prices across all Indian platforms.
  Search each separately:
  - "[brand] [product name] site:nykaa.com" → price
  - "[brand] [product name] site:amazon.in" → price
  - "[brand] [product name] site:flipkart.com" OR site:myntra.com → price
  - "[brand] [product name] blinkit OR zepto OR swiggy instamart" → quick commerce price
  - Brand's own website → brand controlled price
  Calculate price per ml or per g = price ÷ quantity.

Step 3 - Find and catalogue EVERY claim.
  Look on: brand website, Nykaa listing title, Amazon listing title and bullet points, product pack (if shown), and quick commerce listings.
  Capture the EXACT claim text, not your paraphrase. Collect claims from all platforms.
  SCOPE each claim to THIS product's own listing/PDP. Brand sites cross-sell other SKUs (a body spray page may link a hair oil, a bundle, a "bestsellers" strip); only catalogue a claim you can tie to this exact product. Never carry a hair/scalp claim onto a body product (or vice-versa) - a category mismatch means the claim is another product's. See EVIDENCE INTEGRITY: "ONE PRODUCT ONLY".

Step 4 - Check evidence for each claim.
  Search: "[brand] [product name] clinical study" or "test report" or "dermatologist tested"
  Search: "[brand] [product name] site:[brand-domain] study OR certificate OR lab OR test"
  Search: "[product active ingredient] research study" for ingredient-level evidence
  Distinguish: finished product evidence vs. ingredient-level evidence.

Step 5 - Check platform claim parity.
  Compare exact claim language across brand website, Nykaa, Amazon, and quick commerce.
  Note where claims are stronger, weaker, or differently worded.

Step 6 - Find INCI and assess ingredient transparency.
  Search: "[brand] [product name] ingredients" on the official brand product page or INKEE Decoder (formerly INCIDecoder).
  Ingredient-source policy: use only a retrieved list for the exact product from one of these sources. Retailer listings and search snippets can identify the product or its claims, but are not authoritative INCI. Never fill a missing list from memory; leave ingredient-dependent tags unverified when neither primary source can be read.
  Check: whether active percentages are disclosed, pH disclosed where relevant, fragrance disclosed.

Step 7 - Apply formula logic.
  Based on INCI, product format, and category: do the ingredients support the claims?
  A rinse-off shampoo cannot deliver the same claim as a leave-in treatment.
  A moisturizer with pigmentation claims at the end of INCI cannot support those claims like an active serum.

---

CLAIM CLASSIFICATION SYSTEM (classify every claim into one type):

| Type | Definition | Examples |
|---|---|---|
| functional | What the product does physically | Hydrates, cleanses, softens, lathers |
| appearance | What skin or hair looks like after use | Glow, radiance, smoothness, shine |
| active | Based on a specific ingredient | 5% niacinamide, Vitamin C, Retinol |
| concern | Targets a specific problem | Acne marks, dandruff, dark spots, hair fall |
| time-bound | Result within a stated time frame | 7 days, 4 weeks, 72-hour hydration |
| clinical | Based on study or professional testing | Clinically proven, dermatologist tested |
| safety | Claims low risk or suitability | Non-comedogenic, safe for sensitive skin |
| free-from | What the product does NOT contain | No parabens, no sulphates, alcohol-free |
| emotional | Broad feel-good positioning with no measurable endpoint | Clean, pure, gentle, toxin-free, natural |

One claim can carry multiple types. Tag all that apply. Primary type goes first.

---

CLAIM RISK RATING SYSTEM (RESIDUAL RISK - ambition MINUS the evidence you actually found):

riskLevel is NOT how ambitious a claim is. It is how far the claim OUTRUNS its evidence. A bold claim that is fully backed by strong finished-product evidence is LOW risk. The same bold claim with no real evidence is high or red-flag. First judge the ambition, then subtract the evidence level you found, and rate what remains.

Step 1 - Ambition tier (how much proof the claim would need to be fully substantiated):
| Ambition | Example Claims | Evidence needed |
|---|---|---|
| routine | Lightweight, non-sticky, moisturizes, lathers well | Formula logic (Level 3+) |
| cosmetic | Glow, radiance, smoother skin, feels soft, hydrates | Ingredient logic or finished test (Level 3-4) |
| performance | Fades dark spots, repairs barrier, reduces acne | Finished-product test (Level 4+) |
| clinical | Reduces wrinkles/pigmentation, anti-ageing, "clinically proven", any quantified % result | Clinical/instrumental study (Level 6+) |

Step 2 - Rate the RESIDUAL risk after the evidence you found:
| Risk Level | When to assign |
|---|---|
| low | Evidence meets or exceeds what the ambition needs (a clinical claim carrying a Level 6-7 study; a cosmetic claim with sound formula logic). Well substantiated. |
| medium | Evidence is roughly one tier short, or is finished-product but not clinical for a clinical-tier claim. Reasonable, not fully proven. |
| high | A performance/clinical claim resting only on borrowed ingredient evidence (Level 2-3). Ambition clearly outruns proof. |
| very-high | A clinical or quantified claim with little to no finished-product evidence (Level 1-2). |
| red-flag | ONLY for (a) explicit drug/treatment promises ("cures acne", "treats melasma", "whitens skin"), or (b) a claim the product's OWN verified INCI affirmatively contradicts. NOT for aspirational marketing puffery: "no more blemishes!", "goodbye dullness", "your best skin ever" are puffery - rate them high/very-high by their evidence gap, never red-flag. |

Hard rule: a claim backed by a Level 6-7 study is LOW (or at most MEDIUM) residual risk even when the wording is ambitious. Do NOT mark a clinically proven claim "very-high" or "red-flag".

red-flag language triggers (only when NOT backed by finished-product clinical proof of that exact endpoint): "removes", "cures", "eliminates", "permanent", "guaranteed", "whitens", "reverses", "restores youth", "treats", "heals condition", "medically proven". A retailer/marketplace wording problem is NOT a brand red-flag - record it under platform parity, not against the brand's own claims.

---

EVIDENCE LADDER (assign a level 1–7 to each claim):

| Level | Description |
|---|---|
| 1 | No proof publicly visible - claim exists, no evidence found in public sources (say "publicly visible", never assert the evidence doesn't exist) |
| 2 | Ingredient has general published research (not specific to this product or formula) |
| 3 | Ingredient percentage publicly disclosed (strengthens but does not prove the finished product claim) |
| 4 | Finished formula tested - brand states testing was done, result summary visible |
| 5 | Third-party lab tested - independent lab named, product tested, result summary visible |
| 6 | Clinical or instrumental study with sample size, duration, method, population, and result clearly stated |
| 7 | Published or registered study - DOI, journal, registry, or full linked report publicly accessible |

CRITICAL RULE: An ingredient study is Level 2 evidence for a finished product claim. To support a finished product claim, the brand needs Level 4 or above on the finished product itself.

Example: "5% Niacinamide reduces pores" - if the only evidence is a general research paper on niacinamide, that is Level 2. Only a finished product study (Level 4+) supports the specific claim.

---

ASCI (ADVERTISING STANDARDS COUNCIL OF INDIA) COMPLIANCE CHECK:

Apply ASCI Chapter 1 (Truthful and Honest) and Chapter 4 (Personal Care & Health) rules to flag non-compliant claims.

Flag as ASCI concern if:
- Claim uses "No. 1" or "India's best" without disclosed methodology and comparable study
- Before-and-after images shown without: individual result disclaimer, time frame stated, claim that results may vary
- Absolute claims: "removes", "eliminates", "permanently", "guaranteed to" - unless finished product clinical proof of that endpoint at Level 6 or 7
- Comparison to competitor without naming the competitor and providing a fair, verifiable basis
- Testimonials presented as clinical data
- "All skin types" claim for an active-heavy product without mildness testing
- Any quantified claim ("reduces by 80%", "4x more effective") without a published, verifiable study

Do not flag claims as ASCI non-compliant if they are hedged: "may help", "appears to", "helps improve", "visible in X weeks". These are compliant hedged language.

---

INDIA DRUG BOUNDARY CHECK (Drugs & Cosmetics Act 1940 + CDSCO Guidelines):

In India, a product that makes certain claims crosses from cosmetic into drug territory and requires Schedule Y / CDSCO drug registration.

Flag drugBoundaryRisk: true if the product makes any of these claims WITHOUT holding a CDSCO drug licence:

Anti-dandruff claims WITH ketoconazole, zinc pyrithione, selenium sulfide, or coal tar:
  → Drug territory: "treats dandruff", "controls dandruff", "eliminates dandruff". Use "helps manage" or "reduces flaking" cautiously.

Hair growth / hair loss treatment claims:
  → Drug territory: "regrows hair", "reverses hair loss", "treats alopecia", "clinically treats hair fall".
  → Cosmetic zone: "reduces breakage", "appears thicker", "supports healthy hair growth".

Acne treatment claims WITH specific drugs:
  → Drug territory: Any claim combined with clindamycin, benzoyl peroxide, tretinoin, adapalene, or erythromycin.
  → Cosmetic zone: "for acne-prone skin", "helps manage acne", "non-comedogenic".

Skin lightening / fairness claims post-CDSCO 2020 guidance:
  → Red flag: "whitens skin", "lightens skin tone", "makes skin fair". CDSCO has specifically flagged these.
  → Acceptable: "brightens", "improves radiance", "reduces the appearance of dark spots".

STRICT LIMITS on drugBoundaryRisk (it hard-blocks approval, so flag ONLY clear crossings):
  - Flag ONLY the enumerated categories above, and only when the claim uses clear TREATMENT language for a medical condition ("treats", "cures", "clinically treats", "medical treatment for").
  - Do NOT flag appearance/pigmentation claims: "corrects dark spots", "corrects the appearance of dark spots", "anti-pigmentation", "fades marks", "evens tone" are COSMETIC claims, not drug claims.
  - Do NOT flag because a clinical study referenced a medical condition (e.g. tested on melasma or compared against hydroquinone). Studying a condition does not make the marketing claim a drug claim.
  - Do NOT flag statements made only in a retailer Q&A, a marketplace listing, or by a third party. Only the brand's own advertising can cross the drug boundary; note third-party overreach under platform parity instead.
  - If your reasoning contains "borders on", "could be seen as", or "arguably": that is NOT a crossing. Set drugBoundaryRisk=false and put the caution in evidenceNote.

SPF claims:
  → Standard SPF/PA labelling ("SPF 50", "PA++++", "broad spectrum") on a licensed cosmetic is NORMAL product labelling - do NOT flag it as a drug-boundary crossing. Sunscreens are sold as cosmetics in India under a manufacturing licence.
  → Flag drugBoundaryRisk only when a sunscreen makes THERAPEUTIC claims ("treats sun allergy", "cures pigmentation", "medicine-grade protection").
  → If no ISO 24444 / registration evidence is visible, that is an EVIDENCE gap: grade the SPF claim's evidenceLevel low and note it - it is not unlawful labelling.

Anti-bacterial / anti-microbial claims WITH triclosan or similar actives:
  → Drug-cosmetic boundary. Flag for CDSCO check.

---

PER-INGREDIENT READ (ingredientReads) - authored ONLY from the retrieved ground-truth INCI:
  - One entry per ingredient, in the SAME order as the retrieved list. Use the exact INCI name.
  - role: classify by cosmetic function (Solvent, Humectant, Active, Emollient, Occlusive, Surfactant, Preservative, Emulsifier, Fragrance, Chelator, pH adjuster, Thickener, Antioxidant, Colorant).
  - note: ONE plain sentence. What it does in this product, or why a user might care. No marketing language.
  - flag:
      • "warn" ONLY for a genuine, well-established concern present here (a fragrance allergen, a formaldehyde-releaser, a known sensitiser, a drying/denatured alcohol high in the list). Do NOT warn on ubiquitous safe ingredients (water, glycerin, niacinamide, hyaluronic acid, panthenol).
      • "info" for fragrance/parfum, essential oils, actives that are potent-but-fine, or anything worth a neutral heads-up.
      • "ok" for everything else (the default - most ingredients are "ok").
  - NEVER invent a safety concern. If unsure, use "ok" or "info", never "warn". If you did not retrieve the INCI, return an empty ingredientReads array.

KEY ACTIVES (keyActivesRead): the 1-4 hero ingredients the product is built around. Map marketing name to what it does. Set concentrationConfidence using the 1% line: High if a % is disclosed or it sits high in the INCI; Low if it sits after the preservatives (below ~1%); Medium otherwise.

REGULATORY SCREEN (regulatoryScreen): for each of the 10 authorities, check the retrieved INCI against that authority's restricted/prohibited lists. Default each to "No prohibited or restricted ingredients identified" and ONLY name a specific ingredient when it genuinely triggers that authority (e.g. a banned colorant under EU Annex II). Do NOT flag common safe ingredients. Never write a false positive - when in doubt, report clear.

INDIA CONTEXT (indiaContext): a 2-3 sentence read written for an Indian buyer. Ground every sentence in this product's real data - do NOT write a generic paragraph. Cover, where relevant: (a) how the formula behaves in Indian conditions (heat, humidity, high UV, pollution) for THIS product type; (b) price positioning in the Indian market at the stated ₹ price; (c) the ASCI / CDSCO posture given the actual claims (only mention scrutiny when a claim genuinely warrants it). Keep it factual and useful, never promotional.

BEST FOR / AVOID IF (consumerSuitability.bestFor and consumerSuitability.avoidIf): these are short, concrete, product-SPECIFIC phrases (each ≤ 6 words) that help a shopper self-select. They must follow from THIS product's actual type, format and ingredients - never generic filler.
- bestFor: who genuinely benefits (e.g. for a gentle cleanser: "Sensitive or reactive skin", "Daily morning cleanse", "Removing sweat and sunscreen").
- avoidIf: a real, honest LIMITATION or trade-off of the product - a reason a specific shopper would be disappointed - NOT a vague safety warning. Think about what this product does NOT do well. For a gentle low-foam face wash, good avoidIf items are things like "You want a rich, foamy lather", "You wear heavy or waterproof makeup" (needs a dedicated remover), or "You want active treatment from a cleanser". For an exfoliating acid, "You have compromised or eczema-prone skin". For a fragranced product, "You react to fragrance".
- Do NOT output boilerplate like "patch-test sensitive to new actives", "results vary", or "consult a dermatologist" unless it is genuinely the single most relevant caution for THIS product.
- If the product has no honest downside worth flagging, return an EMPTY avoidIf array rather than inventing one. An empty avoidIf is correct and expected for simple, well-formulated basics.

INGREDIENT TRANSPARENCY SCORING SYSTEM:

Score 1 to 5 for ingredient transparency:

| Score | Label | Criteria |
|---|---|---|
| 1 | Ingredient theatre | Only hero ingredients highlighted. Full INCI not available anywhere. Percentages not disclosed. Serves marketing, not consumer. |
| 2 | Basic label transparency | Full INCI list is publicly visible. Ingredient order appears correct. No active percentages disclosed. |
| 3 | Good consumer transparency | INCI available. At least one active percentage disclosed. Preservative system visible. Basic usage notes. |
| 4 | Strong formula transparency | INCI available with multiple actives disclosed by percentage. pH disclosed where relevant. Fragrance allergen or composition context given. Routine guidance clear. |
| 5 | Evidence-backed transparency | Full INCI + active percentages + pH + preservative efficacy data + finished product test evidence all publicly visible. Brand treats consumer as an informed adult. |

Specific checks:
- Is the full INCI publicly available? (Not just hero ingredients on marketing material)
- Is the INCI in descending order as required by India Cosmetics Rules 2020?
- Are active percentages disclosed for hero actives (niacinamide %, salicylic acid %, retinol %)?
- If the brand uses a "complex" (e.g., "5% Skin Brightening Complex"), is the actual active inside it disclosed?
- Is fragrance disclosed beyond "Parfum"? (Especially important for sensitive skin positioning)
- Is pH disclosed where relevant? (Critical for AHAs, BHAs, Vitamin C, intimate care, exfoliants)
- Are usage warnings clear and practical?
- Are preservatives visible in INCI? (Water-based formulas must show preservation strategy)

---

FORMULA LOGIC ASSESSMENT:

For every product category, assess these questions:

General (all categories):
  Q1: Do the hero ingredients match the primary claim?
  Q2: Is the product format suitable for the claim? (Rinse-off cannot claim like leave-on)
  Q3: Do actives appear early enough in INCI to suggest meaningful concentration?
  Q4: Does the base formula type fit the category? (Moisturizer needs humectants + emollients + occlusives or barrier lipids)
  Q5: Are there possible irritancy concerns? (active stacking, fragrance + acids, etc.)
  Q6: Is the claim too ambitious for the product type? (Moisturizer claiming to work like a treatment serum)

FORMULATION INFERENCE LOGIC (read concentration from INCI position - this is the core of the formula-logic judgement):
  1. 1% Line Rule: ingredients listed at or after phenoxyethanol are assumed to be at or below 1% concentration.
  2. Phenoxyethanol marker: EU caps phenoxyethanol at 1%, so it is a reliable ~1% line; anything after it is inferred sub-1%.
  3. Active Placement Rule: if a hero/claimed active appears AFTER the preservatives (i.e. below the 1% line), flag LOW ACTIVE CONCENTRATION - the claim resting on it is weakened.
  4. Water-first logic: Aqua/Water first means a water-based formula; oil-soluble actives then need a solubiliser to be meaningful.
  5. Emulsifier position: an emulsifier appearing before the actives indicates a standard emulsion with actives at trace levels.
  Apply this to judge whether the actives behind each claim sit at meaningful positions. If a headline active sits above the 1% line (and especially if its % is disclosed), formula logic SUPPORTS the claim; if it sits below the line, note the overreach in formulaLogic.note and lower formatSuitableForClaim / activesLikelyMeaningful accordingly.

Category-specific logic:

Moisturizer:
  - Humectants (hyaluronic acid, glycerin, propylene glycol, sodium PCA) for water binding
  - Emollients (fatty acids, plant oils, squalane, dimethicone) for softness
  - Occlusives or barrier lipids (petrolatum, beeswax, ceramides, cholesterol) for moisture retention
  - If brand claims "barrier repair", ceramides or equivalent barrier lipids must be meaningfully present
  - Moisturizer claiming pigmentation correction at same level as a treatment serum: flag as claim overreach

Serum (active):
  - Active concentration matters: active after preservative anchor = inferred low concentration
  - pH-dependent actives (Vitamin C as L-ascorbic acid, AHAs, BHAs) need pH disclosure
  - Peptides in acid formulas need stability evidence
  - Multiple actives need compatibility logic

Sunscreen:
  - UV filters must appear prominently in INCI
  - SPF claim REQUIRES ISO 24444-compliant test evidence - no exceptions
  - UVA claim requires PA or UVA-PF methodology disclosed
  - Water resistance claim needs specific water resistance testing
  - In-vitro SPF/PA reports (spectrophotometric, e.g. Mascot Spincontrol) are real finished-product evidence (Level 4, Level 5 if independent lab) but are not ISO 24444 in-vivo: credit them, and note the method gap rather than saying evidence is absent
  - Compare the report's MEASURED SPF and PA/UVA-PF to the label claim. If measured is lower than labelled (e.g. SPF 47 / PA+++ vs label SPF 50+ / PA++++), cite both numbers and treat the label as ahead of its proof

Shampoo / Hair wash:
  - Primary surfactants determine mildness: SLS (harsh), SLES (moderate), coco-glucoside/lauryl glucoside (mild)
  - Scalp claims need scalp penetration logic - rinse-off limits how long actives contact scalp
  - Anti-dandruff claim with zinc pyrithione or ketoconazole = drug claim zone
  - "Hair growth" via a shampoo: very high skepticism warranted - contact time is insufficient

Conditioner / Hair mask:
  - Conditioning agents (cetrimonium chloride, behentrimonium methosulfate, BTMS) needed for detangling/softness claims
  - Protein treatment claims: hydrolyzed proteins needed, claim about penetration or molecular weight plausible
  - "Repairs damage": no topical product repairs structural disulfide bonds; this is appearance improvement

Body wash:
  - Moisturizing claims from a rinse-off product need leave-on humectants or skin-identical lipids at meaningful levels
  - "Deep cleanse" vs. "gentle cleanse" comes from surfactant profile, not fragrance

Deodorant / Antiperspirant:
  - "48 hours" or "72 hours" claims need clinical perspiration testing - flag if evidence not shown
  - Antiperspirant claims (controls sweat) require aluminum-based actives
  - Deodorant-only claims (controls odor) should NOT contain aluminum unless disclosed
  - "Natural deodorant": baking soda + fragrance is a common formula; flag potential irritancy

Hair serum (leave-in):
  - Smoothing/frizz claims: silicone-based serums (dimethicone, cyclomethicone) work by coating; claim "repairs" is misleading
  - Heat protection claims need specific heat-protective polymers and test evidence
  - "Reduces hair fall in X washes": needs clinical evidence

---

PLATFORM PARITY CHECK:

For each platform compare against brand website claims:

Questions to answer:
  1. Is the product name the same on all platforms? (Sometimes retailers rename slightly)
  2. Are the core claims the same on all platforms? (Watch for amplified claims in marketplace titles)
  3. Are the active percentages consistent on all platforms?
  4. Is the ingredient list available on all platforms?
  5. Do Nykaa or Amazon listing titles add stronger claims than brand's own website?
  6. Is the brand more careful and legally conservative on its own website vs. marketplaces?
  7. Does quick commerce use abbreviated or simplified claims that may mislead?

Platform amplification pattern to watch for:
  Brand website: "Helps reduce the appearance of dark spots"
  Amazon title: "Removes Dark Spots | Niacinamide Face Serum"
  Nykaa title: "Dark Spot Eraser | 5% Niacinamide"
  → This is a claim amplification pattern. The marketplace version is making a stronger (and potentially non-compliant) claim.

Flag where the pack (legally printed label) is more conservative than the online claim, as this may indicate the brand knows the digital claim is difficult to substantiate.

---

PRICE FAIRNESS ASSESSMENT:

Score price fairness /10 based on:
  - Are prices transparent and consistent across channels?
  - Is the price per ml competitive for the product category and claimed benefit?
  - Is there excessive discounting that creates artificial "original price" anchoring?
  - For high-claim products (clinical, active): is the price justified by visible evidence quality?
  - Does price vary more than 30% across major platforms without explanation? (Suggests pricing opacity)
  - Is the MRP visible and honest?

Context for India:
  - Premium price + weak evidence = lower price fairness score
  - Drugstore price + strong evidence = higher price fairness score
  - Aggressive 50-70% "discount" on MRP that is never actually sold at MRP = flag for pricing theatre

---

SCORING SYSTEM (100 points):

Score each section out of its maximum. Apply deductions within each section.

Section 1 - Price Fairness (10 pts):
  10: Transparent across platforms, competitive price per ml, no pricing theatre
  7-9: Minor variation across platforms, broadly fair
  4-6: Significant price variation, some opacity, or poor price per ml for category
  1-3: Major discounting theatre, opaque MRP, very poor price per ml for claims made
  0: Cannot verify price anywhere

Section 2 - Claim Responsibility (15 pts):
  Judge whether claims are made responsibly RELATIVE TO THEIR EVIDENCE. A bold claim that is PROVEN is responsible and is NOT penalised. Evidence earns the claim. Deduct ONLY where ambition outruns proof or the law:
  - Each red-flag claim (unlawful/absolute language, or contradicted by the brand's own INCI): -4 pts
  - Each clinical/quantified claim resting on Level 1-2 evidence only (very-high residual risk): -2 pts
  - Each ASCI non-compliant claim (unhedged absolute, undisclosed "No.1", testimonial-as-clinical, unbacked quantified claim): -3 pts
  - Each drug-boundary claim without a licence flag: -3 pts
  - Emotional claims forming the majority of the set with no functional claims: -3 pts
  Do NOT deduct for an ambitious claim that carries evidence appropriate to its ambition (Level 4+ finished-product, Level 6+ for clinical/quantified). A product whose bold claims are all clinically backed should sit near 15.
  Maximum deduction: 15 pts (floor at 0)
  15: Every claim is matched by evidence appropriate to its ambition; nothing overreaches
  10-14: Broadly responsible; 1-2 claims slightly ahead of their proof
  5-9: Several claims outrun their evidence
  0-4: Pattern of unlawful, absolute, or clinically-unbacked claims

Section 3 - Claim Evidence (20 pts) - the primary reward; deeper evidence must always score higher:
  Grade the QUALITY of the evidence behind the claim set, not merely its presence. When a brand says "clinically tested/proven" or shows a % result, look deeper and credit accordingly. Each step up the ladder raises the score:
  - Finished-product vs borrowed: an ingredient study is Level 2 for a finished-product claim; only Level 4+ ON THE FINISHED PRODUCT supports it.
  - Study rigour: credit a disclosed sample size + methodology + population + duration. A vague "clinically tested" with no details is weaker than "clinical scoring, 41 subjects, 8 weeks".
  - Independence: a named third-party lab (Level 5) scores above brand-run testing (Level 4).
  - Publication: a published or registered study with DOI / journal / registry / linked report (Level 7) scores highest.
  Banding (weight by how many claims, especially the HEADLINE claims, are well-evidenced):
  - 18-20: Headline claims carry Level 6-7 evidence (clinical study with stated method, and/or published/registered); actives disclosed.
  - 14-17: Most claims at Level 4-5 (finished-product or third-party tested); headline claims clinically supported.
  - 8-13: Mix of Level 2-4; some finished-product evidence, but headline claims lean on borrowed ingredient research.
  - 3-7: Mostly Level 1-2; claims rest on ingredient theory, not this product.
  - 0-2: Bold or clinical claims with no finished-product evidence at all.
  A product whose ambitious claims are genuinely backed by clinical studies belongs at the TOP of this section.

Section 4 - Ingredient Transparency (20 pts):
  Map directly to Ingredient Transparency Score:
  Score 5 → 18-20 pts
  Score 4 → 13-17 pts
  Score 3 → 8-12 pts
  Score 2 → 3-7 pts
  Score 1 → 0-2 pts

Section 5 - Formula Logic (15 pts):
  15: All hero ingredients match claims, format suitable, actives at plausible positions, no overreach
  11-14: Most logic holds, minor gaps (one active in low-concentration zone, minor overreach)
  7-10: Some mismatch between formula and claims; or rinse-off format for leave-on claims
  3-6: Significant mismatch; hero actives likely at low concentration; product format cannot support major claims
  0-2: Formula appears to not support primary claims at all; major overreach

Section 6 - Consumer Suitability (10 pts):
  10: Specific guidance on who it's for, who should avoid, routine integration, layering, and realistic expectations
  7-9: Good suitability guidance with minor gaps
  4-6: Generic "all skin types" positioning, little specific guidance
  1-3: No meaningful suitability guidance, or guidance is actively misleading (e.g., "safe for everyone" for an active-heavy product)
  0: No guidance at all

Section 7 - Platform Consistency (10 pts):
  10: Claims identical across all platforms, no amplification, ingredient list available everywhere
  7-9: Minor wording differences, no material claim changes
  4-6: Notable claim amplification on marketplaces; pricing inconsistency
  1-3: Significant claim differences across platforms; marketplace titles make claims the brand website does not
  0: Claims actively contradictory or product described differently on different platforms

Total Score Bands (85+ is the Clean Sheet approval bar - the top tier is strict and rare; a product at 85+ has fully earned its claims):
  85-100 → "Clean Sheet Strong": credible, evidence-supported claims with strong transparency
  75-84 → "Mostly Transparent": claims substantially earned; specific, minor gaps in evidence or transparency
  55-74 → "Needs More Clarity": claims are stronger than the proof visible; transparency incomplete
  40-54 → "High Claim Risk": multiple claims not supported; ingredient evidence borrowed as finished-product proof
  Below 40 → "Consumer Confusion Risk": pattern of overstated, absolute, or drug-boundary claims with minimal visible evidence

---

INDIA CONTEXT (mandatory - apply to every review):

Regulatory:
  - India Cosmetics Rules 2020 (G.S.R. 763(E)): INCI disclosure is mandatory on label
  - CDSCO drug boundary: anti-dandruff actives, SPF, specific skin lightening actives can require drug registration
  - ASCI self-regulatory code applies to all advertising including digital

Consumer context:
  - Fitzpatrick III-V: Indian consumers are more prone to post-inflammatory hyperpigmentation; any pigmentation claim is high-stakes
  - Tropical + humid climate: "deep moisturizing" products can feel heavy and pore-clogging in Indian summers - flag if heavy occlusive formula claims to suit all skin types
  - Hard water: sulfate shampoos in hard water (Delhi, Bengaluru, Mumbai) may under-perform or leave residue
  - UV Index 8-11+: SPF below 30 is insufficient for Indian outdoor conditions - flag this if sunscreen

Platform context:
  - Nykaa, Amazon India, Flipkart, Purplle, Myntra: major platforms with varying claim discipline
  - Quick commerce (Blinkit, Zepto, Swiggy Instamart): often show abbreviated claims that lose context

---

CONSUMER LANGUAGE RULES (all output text visible to consumers):

USE:
  "The product claims X, but no finished product evidence is publicly visible to support it."
  (Always "publicly visible" / "not found in public sources" - never assert that evidence does not exist. Brands may hold unpublished reports.)
  When a BRAND-PUBLISHED EVIDENCE block is provided in the prompt, grade claims against those documents: a genuine brand-hosted test report on the finished product = Level 4; Level 5 if a named independent lab ran it. Extract sample size, method, duration and endpoint from the document itself.
  Image-published proof: when the PRODUCT PAGE CONTENT shows a proof/test-results section whose results are published as graphics (marked "[Graphic on page: ...]" - e.g. a "Proof of the Code" section with a moisturization test chart), treat that as the brand publishing finished-product test results = Level 4 for the claims those graphics cover. Name the section in your evidenceNote. Do not invent numbers you cannot read from the text.
  "The ingredient has published research, but this is ingredient-level evidence, not finished product evidence."
  "This claim uses absolute language that is difficult to substantiate without clinical proof."
  "The formula logic supports X, but claim Y goes beyond what the product format can plausibly deliver."
  "Based on available information, the consumer should expect X - not Y."

NEVER:
  "Unsafe" / "Toxic" / "Banned"
  "This definitely works" / "This definitely doesn't work"
  "Dangerous"
  Use safety verdicts - that is the Analyzer's role. This framework evaluates CLAIMS, not safety.

ALWAYS include in cleanSheetNote:
  "This analysis evaluates brand claims against visible evidence and formula logic. It does not replace a full ingredient safety analysis or a clinical product test. Results vary by individual, and the consumer should always read the full ingredient list and follow usage guidance."

---

SCOPE RULE:
Always search the web before deciding. If after searching the query relates to any product applied to the human body (skin, hair, body, personal hygiene, colour cosmetic, fragrance, grooming) - produce a full Product Review. Only return {"type":"out_of_scope"} for queries that have nothing to do with personal care (weather, finance, sports, food).

Return ONLY valid JSON. No markdown code fences. No preamble. Start directly with {

OUTPUT JSON STRUCTURE:

{
  "type": "product-review",
  "productName": "string - exact name on pack/website",
  "brand": "string",
  "parentCompany": "string or null",
  "category": "string - moisturizer, serum, sunscreen, shampoo, conditioner, body wash, hair serum, deodorant, etc.",
  "quantity": "string - e.g. 100ml, 50g",
  "priceRange": "string - e.g. Rs.349–799",
  "pricePerMl": "string - e.g. Rs.3.49/ml",
  "targetUser": "string - who brand says this is for",
  "heroPromise": "string - the single main claim the brand leads with",

  "priceAcrossPlatforms": [
    {
      "platform": "string - Brand Website / Nykaa / Amazon India / Flipkart / Myntra / Blinkit / Zepto / Swiggy Instamart",
      "price": "string or null - e.g. Rs.499",
      "pricePerMl": "string or null - e.g. Rs.4.99/ml",
      "note": "string or null - e.g. Currently 30% off, effective price Rs.349"
    }
  ],
  "lowestPrice": "string - e.g. Rs.299 on Amazon India",
  "priceInsight": "string - 1-2 sentence consumer-useful insight about pricing across platforms",

  "claimMap": [
    {
      "text": "string - exact claim as stated by brand",
      "source": "string - where this claim appears: Brand Website / Amazon Title / Nykaa Description / Product Pack / etc.",
      "types": ["functional | appearance | active | concern | time-bound | clinical | safety | free-from | emotional"],
      "primaryType": "string - single primary type",
      "riskLevel": "low | medium | high | very-high | red-flag",
      "evidenceLevel": 1,
      "evidenceNote": "string - what evidence was found, or why the level was assigned",
      "absoluteLanguage": true,
      "asciConcern": false,
      "asciNote": "string or null - why this triggers ASCI concern if applicable",
      "drugBoundaryRisk": false,
      "drugBoundaryNote": "string or null - which Indian regulation is relevant if triggered"
    }
  ],
  "claimSummary": {
    "total": 0,
    "byRisk": {
      "low": 0,
      "medium": 0,
      "high": 0,
      "veryHigh": 0,
      "redFlag": 0
    },
    "highestEvidenceLevel": 0,
    "mostCommonType": "string",
    "asciConcernCount": 0,
    "drugBoundaryCount": 0
  },

  "ingredientTransparency": {
    "score": 1,
    "label": "Ingredient theatre | Basic label transparency | Good consumer transparency | Strong formula transparency | Evidence backed transparency",
    "fullInciAvailable": false,
    "inciSource": "string - Brand PDP / Nykaa / Amazon / InciDecoder / Not found",
    "inciOrderCorrect": false,
    "activePercentagesDisclosed": false,
    "complexesExplained": false,
    "preservativesVisible": false,
    "fragranceDisclosed": false,
    "phDisclosedWhereRelevant": false,
    "usageWarningsClear": false,
    "issues": ["string"]
  },

  "ingredientReads": [
    {
      "name": "string - INCI name exactly as it appears in the retrieved ingredient list, in order",
      "role": "string - Solvent | Humectant | Active | Emollient | Occlusive | Surfactant | Preservative | Emulsifier | Fragrance | Chelator | pH adjuster | Thickener | Antioxidant | Colorant",
      "note": "string - ONE plain sentence: what it does here, or why it is worth noting. No hype.",
      "flag": "ok | info | warn"
    }
  ],

  "keyActivesRead": [
    {
      "name": "string - the hero active by its common name",
      "function": "string - what it does for the user, e.g. 'Brightening and pore refining'",
      "concentrationConfidence": "High | Medium | Low - High only if % disclosed or it sits high in the INCI; Low if it sits below the 1% line (after phenoxyethanol)"
    }
  ],

  "regulatoryScreen": {
    "eu_1223_2009": "string - 'No prohibited or restricted ingredients identified' OR name the specific concern",
    "india_cr_2020": "string",
    "us_fda_21cfr": "string",
    "korea_mfds": "string",
    "health_canada_hotlist": "string",
    "canada_nhpid": "string",
    "tga_australia": "string",
    "aicis_australia": "string",
    "echa_svhc": "string",
    "iarc": "string"
  },

  "indiaContext": "string - 2-3 sentences for an Indian buyer, grounded in this product's real data (Indian-climate behaviour, ₹ price positioning, ASCI/CDSCO posture from the actual claims)",

  "formulaLogic": {
    "heroIngredientsMatchClaim": false,
    "formatSuitableForClaim": false,
    "activesLikelyMeaningful": false,
    "baseFormulaAppropriate": false,
    "claimOverreach": false,
    "claimOverreachNote": "string or null",
    "irritancyConcerns": ["string"],
    "note": "string - 2-3 sentence plain language formula logic assessment"
  },

  "consumerSuitability": {
    "bestFor": ["string"],
    "avoidIf": ["string"],
    "routineFit": "string - morning, evening, daily, occasional, treatment step",
    "layeringNotes": "string - what works with it, what to separate",
    "sensitivityRisk": "string - low, medium, or high with specific reason",
    "immediateExpectation": "string - what consumer can notice right away",
    "longTermExpectation": "string - what to expect after regular use",
    "pregnancyOrTeenNote": "string or null - only include when directly relevant"
  },

  "platformParity": {
    "consistent": false,
    "issues": ["string - specific claim differences found"],
    "amplificationPattern": "string or null - describe the pattern if claim amplification exists",
    "mostCautiousPlatform": "string - which platform uses the most conservative language",
    "packVsOnline": "string - note if pack (legal label) is more conservative than online claims",
    "reelAngle": "string - 1 sentence for a content creator: the most interesting platform parity finding for a reel"
  },

  "scores": {
    "priceFairness": 0,
    "claimClarity": 0,
    "claimEvidence": 0,
    "ingredientTransparency": 0,
    "formulaLogic": 0,
    "consumerSuitability": 0,
    "platformConsistency": 0,
    "total": 0,
    "label": "Clean Sheet Strong | Mostly Transparent | Needs More Clarity | High Claim Risk | Consumer Confusion Risk"
  },

  "verdict": {
    "bestThing": "string - single clearest positive about this product",
    "biggestConcern": "string - single most important issue",
    "claimRisk": "low | medium | high | red-flag",
    "transparencyLevel": "poor | basic | good | strong",
    "whoItMaySuit": "string - specific consumer who may get value",
    "whoShouldBeCareful": "string - specific consumer who should approach with caution",
    "cleanSheetTakeaway": "string - one memorable sentence that captures the review in full"
  },

  "reelVersion": {
    "costAcrossPlatforms": "string - 1-2 sentences on price spread",
    "whatItClaims": "string - 1-2 sentences on claims summary",
    "whatProofIsVisible": "string - 1-2 sentences on evidence found or not found",
    "whatFormulaSupports": "string - 1-2 sentences on formula logic in plain language",
    "whatConsumerShouldExpect": "string - 1-2 sentences on realistic consumer expectation"
  },

  "dataSource": {
    "inciFound": false,
    "inciSource": "string",
    "priceSource": "string - primary price source used",
    "reviewPlatforms": ["string"],
    "rating": null,
    "reviewCount": "string",
    "userSentiment": "string - 1-2 sentences on what users praise and flag"
  },

  "cleanSheetNote": "This analysis evaluates brand claims against visible evidence and formula logic. It does not replace a full ingredient safety analysis or a clinical product test. Results vary by individual, and the consumer should always read the full ingredient list and follow usage guidance."
}
~~~~

## 8. Where things are

Longer hand-written documents (they can lag the code; this file cannot):

- `ANALYSER-X1.md`: what Version X1 is, its evidence rules, reference data, and what is held or open
- `PRODUCT-ANALYSIS-LOGIC.md`: the end-to-end flow of one analysis: scraping, ingredient lookup, the rubric, scoring, the verdict
- `HOW-THE-ANALYSER-WORKS.md`: a plain-language overview
- `ANALYSER-ROLLOUT.md`: what is live, what is behind a flag, and the release history
- `STAMPS.md`: what each standing and stamp means, and the four-pillar standing

Core code:

- `src/lib/product-review-engine.ts`: `runProductReview` (one analysis, start to finish) and `deriveVerdict`
- `src/lib/product-review-context.ts`: the model prompt
- `src/lib/review-checks.ts`: the checks a fresh analysis must pass before it is kept (the live search and the re-runs both apply them)
- `src/lib/pillar-standing.ts`, `src/lib/pills-page.ts`, `src/lib/pills-for-review.ts`: standing, and the page built from a stored analysis
- `src/lib/analyser-flags.ts`: the flags above

Version X1 decision layer, `src/lib/analyser-x/`:

- `adapter.ts`: Analyser Version X1 · the v3.0 adapter (strangler)
- `claimflags.ts`: Analyser Version X1 · claim flags, by code
- `context.ts`: Analyser Version X1 · build the rule context from the fact store
- `copy.ts`: Analyser Version X1 · the copy engine
- `decision.ts`: Analyser Version X1 · the decision
- `factstore.ts`: Analyser Version X1 · the fact store
- `index.ts`: Analyser Version X1 · the buying decision, as used by the product page
- `invariants.ts`: Analyser Version X1 · decision invariants
- `kb.ts`: Analyser Version X1 · the knowledge base the rules read
- `ladder.ts`: Analyser Version X1 · evidence ladder and residual risk, in code
- `panel.ts`: The global-benchmark panel, from a Decision's own basis: one line per authority. A medicine is not judged by the cosmetic
- `profile.ts`: Analyser Version X1 · the product profile
- `regulatory.ts`: Analyser Version X1 · the regulatory benchmark
- `rules.ts`: Analyser Version X1 · the rule registry
- `screen.ts`: Analyser Version X1 · the safety and compliance screen, as facts
- `test-helpers.ts`: Shared builders for the vX tests. Everything here is constructed; no real product is described.
- `types.ts`: Analyser Version X1 · shared types
- `verifier.ts`: Analyser Version X1 · the verifier: the only door from neural to symbolic
- `version.ts`: Release name for the current neurosymbolic analyser line.

## 9. Decision log

Written by a person, newest first. It records what was decided about the analyser or the site's content, the reason given, and how to undo it.

Entry format: **date, what was decided.** Reason (in the owner's words where we have them). What it touched. How to undo it.
Add an entry whenever the owner decides something about what the analyser says or what the site shows, or when content is removed. Newest first.

### 2026-10-28: A list that a page shows only in a pop-up is read from the page's own data
- **Decided by:** the owner: “If a website page shows the ingredient list after opening a pop up, my engine needs to be able to scrape it.”
- **Reason:** some brand pages (Alteryst was the verified case) draw the full ingredient list in a pop-up from data the page ships itself, while the visible markup holds only the key ingredients or a list cut short. The extractor read the page text only, so those products were held for want of a primary-source list.
- **What it touched:** `src/lib/inci-from-page.ts`. (1) A name that a comma cut apart (“1, 2-Hexanediol”, a locant such as “3-0”) is joined, so the whole list is kept, not its second half. (2) A list cut in two by a gap (a doubled comma, a digit-and-dash fragment that cannot be re-joined) is refused rather than published as its longer half. (3) When the visible text has no list, or a shorter one, the list the page keeps in its own data (a Next.js flight chunk, `__NEXT_DATA__`, JSON-LD, a Shopify product blob) is read and wins only if it is longer. It is used only when the product's own handle from the URL appears just before the field, a field cut by an inner quote is skipped, two different lists on one page veto it, and the usual list rules apply (marketing copy is not a list). The captured quotation and source URL travel with it as for any other list.
- **Cost:** none beyond the page fetch already made. No extra model call.
- **Not changed:** the source policy (brand page or INKEE Decoder), the brand-domain rule, the product-name match, and stored analyses; nothing is rerun by this change.
- **Undo:** revert the change. Nothing is migrated.

### 2026-10-28: A web-grounded model call is asked where the product's page is
- **Decided by:** the owner: “Let's do this - Use the web search the engine already pays for.” This accepted an offer to have the grounded Gemini call return only the brand's product page URL, with the code fetching the page and reading the list itself.
- **Reason:** a list must stay a quoted source, never model-written. The model is asked for a lead only.
- **What it touched:** `src/lib/brand-inci.ts`: when Decoder, Firecrawl search and Decoder pages gave no list, `askModelForProductPage` makes one short grounded call (prompt `PAGE_FINDER_SYSTEM_PROMPT`, 30 second limit) that answers with a URL or null. The search tool hands the model Google redirect links, so the code follows a `vertexaisearch.cloud.google.com/grounding-api-redirect/` link by hand (no other redirect is ever followed) to the real page. An answer from a call that did not search is ignored. The page is then fetched and read by the code and must pass the same brand-domain, product-name and captured-quote rules as any candidate. It runs on the first lookup only, not after the brand is known.
- **Cost:** one extra grounded model call (billed as a grounded prompt, not free) and about 4 to 16 seconds, only for products whose list nothing cheaper found.
- **Measured:** on 19 products that had failed, it added none. It found the right page 5 times (a retailer's own-label page, two brand pages with no readable list, one wrong variant that the title check correctly refused) and returned nothing for the rest. What worked was Firecrawl search plus Decoder pages (2 of 7, and 3 more of 12 beyond the engine's own Decoder name lookup). A small sample.
- **Undo:** revert the change, or remove `askModel` from `defaultBrandInciDeps` in `src/lib/brand-inci.ts` to turn only this step off.

### 2026-10-28: Ingredient pages are found with Firecrawl search
- **Decided by:** the owner: “Firecrawl can be used.” This answered the finding that the engine's Google search for a brand's product page was being refused, and an offer to use Firecrawl, which the site already uses for product photos.
- **Reason:** the search that finds a brand's own product page returned `403 PERMISSION_DENIED: This project does not have the access to Custom Search JSON API`, so brand-page discovery was finding nothing. The same Google key also drives product photo search.
- **What it touched:** `src/lib/brand-inci.ts`: candidate pages come from Firecrawl search first (URLs only), then Google Custom Search, then the existing public-search fallback. A Decoder product page that the search surfaces is now accepted as a primary source and tried before brand pages, with the same product-name match and captured-quote rules; a quote cut short is refused. The brand-domain rule is unchanged.
- **Measured:** on 7 products whose analysis found no primary-source list, 2 now do (Amahvas from its own page, 42 ingredients; Dot & Key from its Decoder page, 47). The other 5 have no primary-source product page in the results (a retailer's own label, brands with no indexed product page). A small sample.
- **Not changed:** the brand-domain rule, which still rejects dotandkey.com for “Dot & Key” and nykaa.com for “Nykaa Cosmetics”; product photo search, which still uses Google's refused key.
- **Undo:** revert the change. Setting `FIRECRAWL_API_KEY` to empty also turns it off.

### 2026-10-28: A live search is held to the re-runs' web-search check, and retried
- **Decided by:** the owner: first “Yes, live searches should use the same checks.”, then, shown that the full set of checks would refuse most new searches for want of a primary-source ingredient list, “B”: keep the retry and the web-search refusal, but still save a grey page when no primary list is found.
- **Reason:** a product searched live and the same product re-run should not be held to different standards where that is possible, without turning a product whose ingredients are not published into an error. A live search after a web-less answer used to save a page nobody could source; the re-run was restoring those.
- **What it touched:** `src/lib/review-checks.ts` (new) is the one definition of the four checks the re-run applies to a replacement (a list from a Decoder or brand page with its source quote, a list that is not mostly junk, a web search behind the review). A live search refuses to keep a new analysis only for the last one (`LIVE_REFUSES`). `runProductReview` asks a model call that came back without a web search again, up to twice, unless 75 of the request's 180 seconds have gone; if it is still without one, nothing is stored, listed or added to the registry, and `/api/review` answers `unverified`, which the shopper sees as the plain “try again” message. A product with no primary-source list is analysed and saved as before, with no ingredient list and the gap showing. A bare pasted-ingredients scan is exempt (it is never stored). The checks that only make sense against an existing page (same product, list not shorter, decision not lost) and the three ingredient-source checks stay in the re-run script, which protects a good page from being replaced by a worse one.
- **Effect to expect:** a live analysis that would have been saved without a web search is no longer saved. How often that happens varies: 15 of 301 pages stored before today have no web search recorded, the earlier pilot re-run (before the primary-source change) saw 6 of 9 decided pages come back without one, and the current re-run needed a second attempt for 1 of 13. Each retry is one more grounded model call.
- **Not changed:** the baseline identifier `X1-approved-2026-10-28`, which changes only with the owner's approval; existing stored pages; the re-run script.
- **Undo:** revert the change. Nothing is migrated.

### 2026-10-28: Refresh existing live pages newest first using the frozen baseline
- **Decided by:** the owner: “run the live products again through the analyser and replace the current pages with new ones. Start from new to old.”
- **Reason:** bring the existing catalogue onto the newly approved ingredient sourcing, tags and display logic.
- **What it touched:** a backed-up snapshot of 304 live products, processed newest to oldest by analysis date at the previously agreed 20 products per hour. A credential-isolated run is validated before an in-place, concurrency-checked row update; failures keep the current page. The analyser itself is unchanged. See `docs/catalogue-rerun.md`.
- **Undo:** restore affected rows from the private full-row backup after checking for newer shopper/admin changes.

### 2026-10-28: Freeze the approved PLIX analyser baseline locally and on the website
- **Decided by:** the owner: “Now, this page looks perfect. Let's freeze this analyser logic to the website and locally.”
- **Reason:** preserve the reviewed photo, ingredient tags, primary ingredient sourcing and yellow-rating behaviour as the common baseline.
- **What it touched:** approved baseline identifier, public version check, source fingerprints in the generated reference, local preview, release documentation and production release. See `docs/ANALYSER-APPROVED.md`.
- **Undo:** redeploy the previous production revision or revert the release merge; no stored product analyses are migrated by this release.

### 2026-10-28: Primary ingredient sources are the brand website or INKEE Decoder
- **Decided by:** the owner: “Always check brand website or INKEE Decoder for the ingredients data.”
- **Reason:** ingredient-based product tags should be backed by the retrieved INCI, rather than disappearing because a model-generated list has no captured source.
- **What it touched:** Decoder lookup accepts both its former and current domains; retailer URLs get a second lookup using the cleaner product identity in the URL, then a matched brand-page fallback. Fresh analyses no longer publish model-generated ingredient lists when both primary sources fail. Source URLs and quotations are kept with the list. Full policy: `docs/ingredient-sources.md`.
- **Related display fix:** show the full-size product photo and keep At a glance visible with an evidence-pending explanation when no checks can be verified.
- **Undo:** revert the primary-source acquisition change. Existing cached rows are not migrated by this change.

### 2026-10-28: Stored analyses of 14 brands were deleted from production (93 analyses)
- **Decided by:** the owner, after being shown the live list of pages and the consequences.
- **Reason:** the owner asked for all products and brand pages of the brands in the old hand-written catalogue to be removed from the site. No further reason was given.
- **What it touched:** `product_reviews` went from 396 to 303 rows. Brands, matched on the exact stored brand name: Dot & Key, The Derma Co, Foxtale, Lotus Herbals, Hyphen, Kiehl's, Minimalist (including Be Minimalist), Pilgrim, Plum, Simple, Aqualogica, Deconstruct, Mamaearth, Antinorm. Look-alike brands (for example Bioderma, Dermatouch, Yuderma, Lotus Aroma, Plum Goodness) were left alone.
- **Side effects:** the deleted URLs now show the loading shell with `noindex`, not a clean 404 (existing site behaviour for any missing analysis). A shopper searching one of these products again creates a new analysis.
- **Undo:** every deleted row, with all columns, was saved before deleting (outside the repository, in the owner's backups folder).

### 2026-10-28: The hand-written brand catalogue was removed (19 brands, 115 products)
- **Decided by:** the owner, choosing the option "the 115 hand-written catalogue pages".
- **Reason:** those scorecards were written by hand and were never run through the analyser.
- **What it touched:** the 19 files in `src/data/brands/` were deleted and `ALL_BRANDS` is now empty (the code that reads it still works). `/brands/<brand>` and `/brands/<brand>/<product>` for the 19 retired brand slugs redirect to `/brands` (temporary, 307, so each can later point to its analysis). The "Products analysed" figure on `/brands` fell from 508 to about 393. Nothing in the database changed. Pull request 34.
- **Undo:** revert the merge of pull request 34; the old data is in git history.

## 10. Ingredient-source policy

# Ingredient sources

Policy approved by the owner on 28 October 2026: always check the brand's product website or INKEE Decoder (formerly INCIDecoder) for ingredients.

For a fresh analysis:

1. Resolve the exact product on Decoder. Accept product and ingredient links from both `incidecoder.com` and `inkeedecoder.com` (the former currently redirects to the latter). Preserve the product identity, ingredient order, source URL, captured quotation and quote-truncation status.
2. When a retailer's page title cannot be resolved, try the descriptive product identity in its URL. Marketing-heavy titles must not stop the primary-source lookup.
3. If Decoder has no unambiguous matching list, search the web for the product (Firecrawl search, URLs only; Google's Custom Search API is a fallback, and it currently refuses this project). A Decoder product page the search surfaces is accepted under the same product-name and captured-quote rules, and is tried before brand pages. Otherwise look for the brand's product page. Accept a candidate only on a recognisable brand domain, with a product title matching the requested product, a captured ingredient quotation and a sane list. Search results and snippets discover pages; they are not ingredient evidence. Domain discovery is deliberately conservative and can miss brands whose website differs from their name.
   If none of that gives a list, a short web-grounded model call is asked only where the product's own page is (it returns a URL and nothing else, and never an ingredient list). The code follows the search tool's redirect link by hand, fetches the page itself and reads the list from it; the page must pass the same brand-domain, product-name and captured-quote rules as any other candidate. This runs on the first lookup only.
4. Supply the retrieved list to the analysis model before it evaluates ingredient claims. The stored ingredient list and its evidence envelope come from the same source.
5. If neither primary source can be retrieved, publish no model-generated ingredient list. Ingredient-based tags remain unverified and At a glance explains the missing checks, and the analysis is still saved as a page that says so. Existing cached analyses are not automatically rerun or repaired by this change.

Retailer pages remain useful for prices and marketing claims. They no longer supply authoritative ingredient data for fresh analyses. Product tags such as fragrance-free, paraben-free and drying-alcohol-free are computed from the captured ingredient list; vegan/cruelty-free certification, SPF tests and clinical claims still require their own evidence.

This policy improves retrieval; it does not guarantee a coloured rating or establish that a published ingredient list matches every batch or reformulation. Ambiguous products, conflicting formulas and genuinely unavailable lists still require verification.

The generator embeds the current model prompt in `ANALYSER-REFERENCE.md`; its freshness test catches prompt changes. This page describes source acquisition in `src/lib/inci-fetch.ts`, `src/lib/brand-inci.ts` and `src/lib/product-review-engine.ts`.

## 11. Approved source fingerprints

CI compares these SHA-256 fingerprints with the source. Any change in these files requires regenerating this reference and reviewing the change against the approved baseline in docs/ANALYSER-APPROVED.md.

| Source | SHA-256 |
|---|---|
| `next.config.ts` | `b5553c94b64dcdf1358b80d3add3d84ce5381fa775e21b1454b349108d4a0694` |
| `src/app/analysis/[slug]/page.tsx` | `3a40084321662de5a5ab91f0244673913a3a592657c6db5d9eb140319f986f3e` |
| `src/app/api/analyser-version/route.ts` | `e06baf28af49551cf0311a05a2c6688bc13d174c2eed7f653b4f29b6a20bfa24` |
| `src/app/api/review/route.ts` | `21af87b8f3470d9c9fac3fc7add64d4de7cac23269a417f393479b1e850c3b78` |
| `src/components/scorecards/AnalysisProductImage.tsx` | `a7e725c25a71ed0d1413ad28a8cdec40ab992e8bd56910bd287933ad7fce415c` |
| `src/components/scorecards/BadgeGroup.tsx` | `cd862de9f3f75787f1d3f2e712d4b919bab723c5efe0a8db5251d6266dbbea9d` |
| `src/components/scorecards/BrandProductCard.tsx` | `285869cee38fa65fe35206a191e98836056de2d0f0cb406a6abc0aaddd27ed4e` |
| `src/components/scorecards/ComparisonDecisionEngine.tsx` | `6139d1265902406cce1685472da73cc3e0d270aa82e41353b64d415396ac2a6d` |
| `src/components/scorecards/ComparisonTray.tsx` | `ca8914e8e41ba1990f7f84a0d18f84752b20bc34d3d7ebbf4e2333e5ab40ec8f` |
| `src/components/scorecards/ExpandableSection.tsx` | `dd553925b054f38f0062ee661dd02fb8053ad01d5bb5c9cef690bb23ad19880c` |
| `src/components/scorecards/HeroActions.tsx` | `5647a7614e2007b57eb77229196141c839a586127c6e55e22b587321acaca1c7` |
| `src/components/scorecards/NoResultsCard.tsx` | `77ee1bd923ed3c7be68e21a9e6642d0e098d0141a7a2ae3a80881079dff11602` |
| `src/components/scorecards/OpenDetailsLink.tsx` | `99f31a3a4072aeff53ba15c160a8f3f6a5e8e58cea46934013c8e9c89b50d53c` |
| `src/components/scorecards/PillsHero.tsx` | `9590d9d05eb27743211ab31ccf1432d488515824e560378ed7aad252c304501a` |
| `src/components/scorecards/PillsPage.tsx` | `2f187faf035550622e478af5fbd6ab111ec31abea2e52f83049766f170af514e` |
| `src/components/scorecards/ProductComparisonTable.tsx` | `9d6c78f2ac60d01947e389af98bab286348c54b47d0a4e6ac536268c0c1f3744` |
| `src/components/scorecards/ProductHero.tsx` | `17c0ae64d4adc5cfb097e29060224d3887f22ed2315d7e945651d17978537aa9` |
| `src/components/scorecards/ProductRequestForm.tsx` | `076774b2d0c0d11cfd419dc064d49fec96b843cc4317471347891e0b347ce009` |
| `src/components/scorecards/ProductScorecardView.tsx` | `ab0d898c8b1a58fecb961fb4e142ffb46d27d07398f97db8d208c7389758a0d6` |
| `src/components/scorecards/RatingDot.tsx` | `c1661417c465b0f5a5df7034e2752f7056aa8755092f0250937f9415b12f9f3f` |
| `src/components/scorecards/ReviewRunStatus.tsx` | `95d31a0a4d27e50d3019edfbc4642be92586bd3c547a1d1ebeea014bbd723d3e` |
| `src/components/scorecards/ScoreRing.tsx` | `70d2f9e5c4e91493297c33f2f1991e5ea79a8992d4ade6e11d90febc319eefe5` |
| `src/components/scorecards/ScorecardBadge.tsx` | `ac3beafbed835890200c81e3d33fe0f6acf79436793e57cf774b1478771caade` |
| `src/components/scorecards/ScorecardTabs.tsx` | `5f642c36c562ec2c69545f91a116ecd5b620f1ffa2e3019048a5e4cb6566c72e` |
| `src/components/scorecards/TileChip.tsx` | `c02fe5b385ba58945bf45f1c973584b2c2138b132ad2ed53080e98ca1beac821` |
| `src/components/scorecards/UnratedNotice.tsx` | `e37cfac4ab9b9c55085cfabc16e72ce91004e9cf967eedcfad7ef4dbf1fc7b41` |
| `src/components/scorecards/UnratedProductPage.tsx` | `d5ab7b5e6b748a80e5706b418340f4bc56b12c88d1011c02c8d9ade0fc295f93` |
| `src/components/scorecards/pill-palette.ts` | `e5dc6b716e3f5d85bd8614ac90c04f1255de52c0271064a0fd69082704636b2d` |
| `src/components/scorecards/pillar-ui.tsx` | `ca2b0e633cdce5ea22eea0978c8508ee68fb267d5b070b84640a67f43507cf62` |
| `src/components/scorecards/pills-badge.css` | `52277af6abe1e3d553b885d64b52e0608185e92635e8215934fbd2b8054309dd` |
| `src/components/scorecards/pills-page.css` | `8731d597e3e53f6b7895cba985ce67ec04e721adc909f8adc31ddcd4add494b0` |
| `src/components/scorecards/pills-ui.tsx` | `6b170ab424325a2983fc9e9f06f6b3ece3a248d7e36e14dff165d5edcc1b65ec` |
| `src/components/scorecards/useReviewRunner.ts` | `d57c76f9ab6d14c5104bd0707635a4f728ceb11b5063b4f9cacbda25313f535b` |
| `src/data/analysis/ingredient-risk.ts` | `165ef393f41952f539d1bac7f850007a94244650363989eed92720202753b43d` |
| `src/data/badges/taxonomy.ts` | `8c5ca46b0eb138650cfbb4dbdc9cb8fc2def5428890c1910087f19efa854d49b` |
| `src/data/ingredient-aliases.ts` | `d428faa6ba2be4f561581c0348566a158e605efb9476681d975a5c20e4f445b8` |
| `src/data/ingredients.json` | `2829920e6071c97b37bb36eb2056d456065a8652b56f2fc2351c432484f4f474` |
| `src/data/ingredients/claim-ontology.ts` | `c26f56943006af4a4daef5a1d2793d9fc425fbed86bbb38d35e15d977d08763f` |
| `src/data/ingredients/concepts.ts` | `2c709afb7b734c259f84b0e663020d79df00645264d35758f4960a7e227fa9a5` |
| `src/data/taxonomy/index.ts` | `c74f427f9b8fdb9dad017a24324fa6c7d0947f0f908ab6eeb7aff02bb296a602` |
| `src/data/taxonomy/schema.ts` | `fb804439e53cbe98a42070e409a5ea60d6e09f646b111bbe435de8c98c3cfd61` |
| `src/data/taxonomy/seed.ts` | `40164d44c39883af34ef462f46a0c54ee81e7e946c4747c17d14c2b0be69f3b0` |
| `src/lib/analyser-flags.ts` | `e30d68764914e89fb99cfbeef7bf3ebe342f020c6b9500a13af700571dfe5a06` |
| `src/lib/analyser-reference.ts` | `d52984d57f8a431cc48627cb61083cd3adbeda06e76a94f0854d0c9b5651159a` |
| `src/lib/analyser-x/adapter.ts` | `f040cbeb559b2aadb365222d9ba40c67697cc2517cf316b4c97e7f36c2bfca3e` |
| `src/lib/analyser-x/claimflags.ts` | `ecd084f9dfb148039f292d52a4b7aac128043f3317652dcb5f3c24a40445d397` |
| `src/lib/analyser-x/context.ts` | `72274e85c69bacd7b1c4b594de3e78c050c3c04ed2c77fff07ccd396a093e35d` |
| `src/lib/analyser-x/copy.ts` | `8b5c1a7c4e4412daf0efdff541e9a5df13dd06c528fbb761b3fb7c2053a77370` |
| `src/lib/analyser-x/decision.ts` | `8eb28d5246f3f1ec02e5983bb905dd034bb047704c6b31b03b774212180e0721` |
| `src/lib/analyser-x/factstore.ts` | `f67394c833a968e014500056739d04d3b03819d06808270fce2497db5667d1e9` |
| `src/lib/analyser-x/index.ts` | `280089e6bd56fd909bc6b13ba60683975a129fea88a92c650a965960070aa516` |
| `src/lib/analyser-x/invariants.ts` | `983992f6d800368d4a464b499723669d9d8d35774840b844dbf39c79b8615004` |
| `src/lib/analyser-x/kb.ts` | `83b8b67415017755c0946f60e5ef35be719b824f140491170dd1da3a0283fe9c` |
| `src/lib/analyser-x/ladder.ts` | `a5f7f37e99fa5b938a9edcc5ac729b2a24e1fc9dbb7f44e0404f0eae1ec491d2` |
| `src/lib/analyser-x/panel.ts` | `aa92c8ddd87c8cd26c65b2253fdcc751c98cd2187284e76494bb579116b6a635` |
| `src/lib/analyser-x/profile.ts` | `f0c1bcda47f50d751b0c2539b59481d417b831f9ff940e4e244cbfeaf5b6d4b0` |
| `src/lib/analyser-x/regulatory.ts` | `4e006566a4038a218476bde4424d7f7ce165ae1258230cc3be26b2f25c5726b8` |
| `src/lib/analyser-x/rules.ts` | `5b6122c3016d31b8f15d9bdd1cc26d6484acdb8116b8ddc8ceb41c419a24fb31` |
| `src/lib/analyser-x/screen.ts` | `a12c31d9471c8ebf5dfbc9fe8cb82db228c194e420d5054503b6af6ff1e9c0e8` |
| `src/lib/analyser-x/test-helpers.ts` | `a4e9a3a459d51da896d2d6d664e218c7c1cf11433ab846750f7d95bc4b381059` |
| `src/lib/analyser-x/types.ts` | `a35cbb1f20d44af8b7bb33f534fbc23ddddcfa08d082eca754bb026482c9a2ba` |
| `src/lib/analyser-x/verifier.ts` | `2aba0b3ec3b2b08f3ca4990e77c895802a63166bd2c8c84251c4ede6cd989c7c` |
| `src/lib/analyser-x/version.ts` | `f5420b59fae65a7f27e0a4156721f8b60f2b4ef46d3c2fd4ceb478d5a09072d2` |
| `src/lib/analysis-engine.ts` | `388ecc3c10ab9cfa27b7f33be6381c31c70e74e8b5551dd85f88c2a98944064c` |
| `src/lib/analysis-types.ts` | `5521d764770c99de9a4a8648c6324f7f26c982998f4c813577cfc09c7d05728e` |
| `src/lib/analysis-wording.ts` | `e0212e3450a750e3be7852c351ca8de2f1ec677dbf9bdac7b477a7803f7d1324` |
| `src/lib/brand-inci.ts` | `17844f682133b6fa8daadd7f7762da6e779690d1e3d57200c965aaf129e5d629` |
| `src/lib/capture-evidence.ts` | `8257e6d83e6469a1528151042d196d402cf166713abc827a432d8fa332b949d1` |
| `src/lib/claim-evidence-display.ts` | `53f82f27429f2f993170b0105f9ad5fdc5cff95eea8f8027443c32ba286633ef` |
| `src/lib/claim-ontology.ts` | `3106538b8631e6ce7b26e88a8a6acae539edebb6f9e1b9c705333ed15ed193bd` |
| `src/lib/claims-context.ts` | `9fe1aa10c247220a8fba83c2458f421444b8d233708cc06d4a4ef2696add6b6f` |
| `src/lib/compliance-pillar.ts` | `c7a2c2a575d1e19548175e53bc716998a1e94135649bce8fd6e008134cc6b8a6` |
| `src/lib/drug-signals.ts` | `e4eba39275c9b08603e036d14fcf0d659ad4a7e75c342d9263b52863c76a63a0` |
| `src/lib/evidence-images.ts` | `3997d516c3a0f9d5d048edc929a1241d9aefb805ed9ad082449ae23896cbdbed` |
| `src/lib/gemini.ts` | `800010027e49b589ca6e5813790bbc2e4c8919518c34ddcd8f2c4ecbb6815964` |
| `src/lib/inci-catchall.ts` | `c83855004cb4603bb90c1ba15e195352ff073742968998d444802778fb8e7254` |
| `src/lib/inci-cells.ts` | `8ff68b721a09998826d65a0ff2a0bcddd84f5f5897c7cb85d046ae394f9e4bae` |
| `src/lib/inci-enrich.ts` | `8c7f92cb0e365ccf12329b017603eee36eb3ddda8128b1fe214a9df37451e37c` |
| `src/lib/inci-fetch.ts` | `5f4e93338e015d31af57e678db2a7fc0093b2270bfdaf3c568da9a2ceca092b7` |
| `src/lib/inci-from-page.ts` | `434b11b47ab301e5310e8ff8bb60ef046741f52dc82ae60ad3cf86f1203f6c4c` |
| `src/lib/inci-normalise.ts` | `fedca1cdfd008456cab57d9b0ad63401fe784a75fb98c1ed2f472f1b7f59014b` |
| `src/lib/inci-reanchor.ts` | `7759104be520335e9c78dc8d3a4d7295e2e30283d8e81a7d03cc13346334d13a` |
| `src/lib/inci-source-backing.ts` | `e0bc705232b25ed24714d6f0012e7271dc2c0d8fc2cefed707602d4b3d8d8814` |
| `src/lib/ingredient-canonical.ts` | `41ebe06c48c4c7e6c141019247acf2f45abd4060d4ea8c3fd030f9824b8404e9` |
| `src/lib/ingredient-db.ts` | `1172509d23c12e59df5b3792e4520bb0669bc4807e45bdef5e1c117c4eb4fe7e` |
| `src/lib/ingredient-directory.ts` | `0c13119e0ecd730600e9112409dc86acf5f4140e73ac2a5bd5e9084aba28578a` |
| `src/lib/ingredient-intel.ts` | `e326d79922b4ff2d4e8133a4e1154c38208905a3ed68ed3b3b79b8826aa24598` |
| `src/lib/ingredient-product-index.ts` | `9cb4e41376623352f11e9ed81cb4ba8d61ce973731b9d33e7397c7964fcccb08` |
| `src/lib/ingredient-utils.ts` | `6e741947b8cc4a5f0e5bd58b0a471eb23356c38e11147ce6e70ecece8c3bd343` |
| `src/lib/listing-pill.ts` | `c996f63bf601fc20b37e88f84463e952cb6bcc6e6a011ff0472aed07fc410818` |
| `src/lib/pillar-display.ts` | `39adb1db50a2f79f585ece4f07de70cbef438719da90e896e34fe39639ff6522` |
| `src/lib/pillar-grade.ts` | `f2c9800b6a463f45d86bc2e0be35f3ad0e9c43cfb140733bc599e369d44ad425` |
| `src/lib/pillar-standing.ts` | `4e0f84fc9b634df4b844c334360ef5924bd91b01cdb48d439e6c82ae8906845d` |
| `src/lib/pills-for-review.ts` | `2fa3fade5f61d499056efbe336926b47e66d8872d0c6c4fee118b568b4473cdf` |
| `src/lib/pills-page.ts` | `fd5618ce5e4a693681e35db17446e620d6cebf9bbbb5c1b99bcdaf53e9c320c0` |
| `src/lib/pregnancy-screen.ts` | `2396f68741d3cefeba45646cf2a17ff2f848b50b6b1b07ce95ef3ce485542aed` |
| `src/lib/product-identity.ts` | `9c0bb803fbfb414059e577d0134dd56cbd98a5f2d94d21979f08d72b6337bab9` |
| `src/lib/product-image.ts` | `14d91af7c6f23ef05e38d0f36a4f4c68529e69b15cd3df3a718f4718f029e6a0` |
| `src/lib/product-photo.ts` | `56129b74c9830a88a46e516e974a8935a64e0b26a23173b184636a06982cacfc` |
| `src/lib/product-review-context.ts` | `310980e863d56219897ceaee525a8eb83de04bcf2838c44cdadca1c647ba1d9e` |
| `src/lib/product-review-engine.ts` | `fbcaa749e237f4707395d55ba54ac18f31baca26841919e2e4e4ea492d56e097` |
| `src/lib/product-review-types.ts` | `e45baa3a994d6525bacca279ce18026c2f62d80d6ea682fdd6a526b653d5f437` |
| `src/lib/product-scope.ts` | `d5353ee2537c002562baf814972e1805d047dfdd4df45884d2ad6a047aee7290` |
| `src/lib/review-checks.ts` | `34a016fed10ab1a094912a61c4c735aa587d0ce782c553dd3ae8a396f4a0e05a` |
| `src/lib/review-engine.ts` | `d282765a84ec3cb46dbff3fa6972c89a1598ad4e7e679dfa14fefdc048c71fe4` |
| `src/lib/review-inci.ts` | `8490c3f2f2bf03dd643dadbe480f2f1fcb525dd96d6244b325225bc806f829a3` |
| `src/lib/review-run.ts` | `44fc5142a9609e2386dad1b51bf96db531720a27d824a7cdbafd9f92e3cda69f` |
| `src/lib/review-to-scorecard.ts` | `ee0c5b05a0f021700e68083b469bcd9087e8350563c905a38a36471ffc6aea99` |
| `src/lib/review-verifier.fixtures.ts` | `33502127d9928cc7e1d952e6af1c3e66a4e583b34ef68cfd61f9a9a6ca1bf0ba` |
| `src/lib/review-verifier.ts` | `f70fcf7c5bf91e6d1b1fe397ddd7016750428141e531a22524ef463af7558cdb` |
| `src/lib/review.fixtures.ts` | `b859d8feed2c4320cd50142a50b2e2d6fb646e8d8c07e1ed2796e830ca78fd12` |
| `src/lib/reviewer-audit.ts` | `d81b4706bc305e2afa82cb118f2c6df7e596054288ceefbf1e540f28b77a43dd` |
| `src/lib/scrape.ts` | `0d482e1eaa87b1a1f6b2f1652ba7380e6c30502a5727c1f7929fab334db785d5` |
| `src/lib/text-negation.ts` | `4bc82eee3cb97ab35a439e588c5e9c05d4d2f59fc46e86490a18104c64cc790d` |
| `src/lib/unrated-kind.ts` | `425eb9ce2e45b4c57c2765165af9b909e3d334bc6e77bf0d6108e4ff53afaa74` |
| `src/lib/verdict-engine.ts` | `a8a3fc56e984540abb6a88fa6d9d95ff28bb32e86e1e4e41d9176e2a4a4074ae` |
| `src/lib/web-shopper-checks.ts` | `648e8b518771d73ca288d79b2c32452f9bdd942587927cd2a5540258b5fd5ec5` |
