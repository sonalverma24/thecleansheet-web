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

   Then the sections are consulted (owner decision, 2026-10-30): when all five sections of
   the product page are green and the only cautions are ones those sections already measure
   (a claim without a test on this product; a formula that may not deliver), the product is
   a Good choice, and those cautions stay on the page as notes and under Gaps. Every other
   caution is a flag and still holds a product at Buy with caution.
~~~~

Good choice needs all of these supports: `support.list_verified`, `support.safety_clear`, `support.claims_proportionate`. Without them the decision is Not enough info (`gap.support_insufficient`).
The third, `support.claims_proportionate`, can be replaced by `support.sections_green` (owner decision, 2026-10-30): all five sections of the product page are green (Ingredient safety, Formula logic, Claims evidence, Test transparency, Consumer clarity; `src/lib/analyser-x/sections.ts`), and the only cautions are ones those sections already measure, a claim without a test on this product (`caution.claim_gap`) or a formula that may not deliver (`caution.formula`). Those two then ride along as notes and are listed under Gaps. Any other caution is a flag and still decides Buy with caution.

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
caution.free_from_unverified: (p) => Number(p.count) > 1
caution.boundary: () => "Some wording goes further than a cosmetic can say in India. Treat it as a cosmetic benefit, not a treatment."
caution.formula: () => "The formula may not deliver everything the claims promise."
caution.spf_low: (p) => `SPF ${s(p.spf)} is below the SPF 30 that The Clean Sheet treats as the minimum for daily outdoor use in India.`
caution.benchmark_gap: (p) =>
support.list_verified: (p) => `The ingredient list was read ${from(p) || "from a source we can verify"} and matches the product name.`
support.safety_clear: (p) => Number(p.recognised) >= Number(p.total) ? `No prohibited or flagged ingredient in our screen (all ${s(p.total)} listed ingredients checked).` : `No prohibited or flagged ingredient among the ${s(p.recognised)} of ${s(p.total)} listed ingredients our screen checked.`
support.claims_proportionate: () => "The claims are modest, or the main claims are backed by a test on this product."
support.sections_green: () => "All five areas of our checks are Strong: ingredient safety, formula logic, claims evidence, test transparency and consumer clarity."
support.formula_sound: () => "The formula and format plausibly deliver the claims."
note.endocrine: (p) => `${s(p.ingredient)}: ${s(p.note)}. Legal at its permitted level.`
note.screen_partial: (p) => `${s(p.n)} of ${s(p.total)} listed ingredients ${Number(p.n) === 1 ? "is" : "are"} not in our reference database (${s(p.names)}), so our screen did not check ${Number(p.n) === 1 ? "it" : "them"}.`
note.user_percentage: (p) => Number(p.count) > 1
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
  - DO NOT INVENT CLAIMS. Every entry in claimMap must be a claim you actually saw on the brand's OWN website page for this exact product - quote the wording, don't paraphrase into a claim the brand never made. This is critical for "free from X" / "X-free" claims: only list one if those exact words appear in a source. Never manufacture a "silicone-free", "sulphate-free", etc. claim just because the product could have made it. A fabricated claim that is then flagged as contradicted is the worst possible error.
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
  Look ONLY on the brand's own website page for this exact product. That page is the one source of claims we hold the brand to. A claim that appears only on Nykaa, Amazon, Flipkart, Tira, a quick-commerce app, a reseller that copies the brand's text ("via Clinikally"), a review site or a retailer's brand-info blurb is NOT catalogued: do not list it in claimMap, even when it is a striking claim. If the brand's own page for this product cannot be found or read, return an EMPTY claimMap and say so in claimSummary and cleanSheetNote; never fill it from retailer listings.
  Capture the EXACT claim text, not your paraphrase.
  SCOPE each claim to THIS product's own listing/PDP. Brand sites cross-sell other SKUs (a body spray page may link a hair oil, a bundle, a "bestsellers" strip); only catalogue a claim you can tie to this exact product. Never carry a hair/scalp claim onto a body product (or vice-versa) - a category mismatch means the claim is another product's. See EVIDENCE INTEGRITY: "ONE PRODUCT ONLY".

Step 4 - Check evidence for each claim.
  Search: "[brand] [product name] clinical study" or "test report" or "dermatologist tested"
  Search: "[brand] [product name] site:[brand-domain] study OR certificate OR lab OR test"
  Search: "[product active ingredient] research study" for ingredient-level evidence
  Distinguish: finished product evidence vs. ingredient-level evidence.

Step 5 - Check platform claim parity.
  Compare exact claim language across brand website, Nykaa, Amazon, and quick commerce.
  Note where claims are stronger, weaker, or differently worded. This step is a comparison note for platformParity only: a marketplace-only claim never becomes an entry in claimMap.

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
- Never write an avoidIf line about fungal acne or Malassezia (we hold no sourced data on it), and never one about expecting a "clean" or "truly clean" formula (we do not define clean as an ingredient quality). The same goes for formulaLogic.irritancyConcerns. The site drops such lines.
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
      "source": "string - always "Brand Website" (the brand's own page for this product). A claim not on that page is not listed at all.",
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
- `sections.ts`: Analyser Version X1 · the five sections of a product page, and what colour each is
- `tags.ts`: Analyser Version X1 · the label a finding puts beside each ingredient it names
- `test-helpers.ts`: Shared builders for the vX tests. Everything here is constructed; no real product is described.
- `types.ts`: Analyser Version X1 · shared types
- `verifier.ts`: Analyser Version X1 · the verifier: the only door from neural to symbolic
- `version.ts`: Release name for the current neurosymbolic analyser line.

## 9. Decision log

Written by a person, newest first. It records what was decided about the analyser or the site's content, the reason given, and how to undo it.

Entry format: **date, what was decided.** Reason (in the owner's words where we have them). What it touched. How to undo it.
Add an entry whenever the owner decides something about what the analyser says or what the site shows, or when content is removed. Newest first.

### 2026-11-03: Chemist at Play's own shop on innovist.com counts as the brand's page, and a list that runs on from page copy keeps its first entry
- **Decided by:** not the owner in words. The owner asked for the fix after the analysis page for Chemist at Play's Oil Control Face Moisturizer showed Grey and "could not verify a complete ingredient list" although the brand's page prints the full list. The owner has not yet seen the change.
- **Reason:** no reason in the owner's words beyond the request above. Two faults, both measured on the live page (innovist.com/products/oil-control-face-moisturizer, 2026-11-03). (1) chemistatplay.in now answers 301 to innovist.com, and the brand-domain rule (`isBrandIngredientUrl`) only knew a domain that starts with the brand's name, so the page the search ranked first was discarded before it was read. (2) Once that page is read, the list comes back with 24 of 25 entries and without Aqua: the page prints the list straight after a heading with no punctuation between them, so the first piece is page copy plus "Aqua", is rejected as too long, and the list started at Niacinamide, which misstates the order.
- **What it touched:** `src/lib/brand-inci.ts` (`OWN_SHOP_HOSTS`, `isBrandIngredientUrl`): a short reviewed list of brands whose own shop is not on a domain named after them; today one entry, Chemist at Play = `innovist.com`, for that brand alone (innovist.com also sells Bare Anatomy, SunScoop and Anecdote). Every other rule is unchanged: https only, no port or credentials, a bare domain (or `.co.in`) with no subdomain, not the home page, and the page's title must still name the product. `isBrandIngredientUrl` is also what `review-checks.ts` and `scripts/approved-rerun-policy.ts` use to decide whether a stored list came from a primary source, so all three now agree. The `brands` table could not supply it: it holds 16 rows, none of them Chemist at Play. `src/lib/inci-from-page.ts` (`extractInciFromBlocks`, `extendFromBlocks`): the list is also read inside its own block (the text between two block tags) and that reading is used only when it holds the visible list whole and in order and has more entries, so it adds what the page copy swallowed and never replaces, reorders, shortens or originates a list.
- **Measured:** the Innovist page now gives 25 entries, Aqua first and Sodium Gluconate last, quoted from "Aqua, Niacinamide, ..." to "..., Sodium Gluconate" with no page copy; `findBrandInci` for the product (one Firecrawl search, nothing written) returns it as a trust 4 brand page. Tests: `brand-inci.test.ts`, `review-checks.test.ts` and the new `inci-from-page.blocks.test.ts` (fixture trimmed from the live markup; it gave 24 entries from Niacinamide before the change).
- **Not changed:** no stored analysis was re-run or overwritten, so the live Chemist at Play page stays Grey until it is re-analysed. A list that follows page copy inside the same block, and the Jina-reader fallback (`fetchPageMarkdown`), are not covered. Other brands that sell under a parent company's site need their own entry.
- **Undo:** revert the commit. To turn off only the shop alias, empty `OWN_SHOP_HOSTS`; to turn off only the block reading, make `extendFromBlocks` return `visible`.

### 2026-11-01: A list the owner types in from a product's pack is a last-resort source; a brand's renamed product is recognised by its catalogue
- **Decided by:** the owner, in chat on 2026-10-31, asked why the Humuss Beauty sunscreen shows no ingredient list when earlier analyses always did, and offered these fixes. Chosen: the title-gate fix, an owner-supplied list, and two retailers that agree. Not chosen: reading ingredient lists off pack images with a model.
- **Reason:** Humuss's own page prints only three key-ingredient icons and none of its 12 gallery images is an ingredient panel (front-of-pack shots, claim icons, a certificate of analysis, stability reports and a manufacturer's safety data sheet whose "composition" is raw-material trade names such as "Parsol-TX" and "Sepigel 305", not an INCI list), INKEE Decoder has no entry, and the brand's own name for the product ("Sun-sational - SPF 50 Hyaluronic Acid Sunscreen") shares too few words with the retailer title we analysed for the title check to accept it. Before X1 (26 Oct) and the 28 Oct primary-source rule the same gap was hidden: of 273 analyses stored before 26 Oct, 241 showed a list and 112 of those 241 had no source at all (the model had written them); none of the 35 stored after 28 Oct has a model-written list. The 2026-10-28 rule ("a list must stay a quoted source, never model-written") stays: nothing here lets a model write a list.
- **What it touched:** (1) `src/data/inci/owner-supplied.ts` and `src/lib/owner-supplied-inci.ts`: an entry holds the brand, the exact product names it is for, a brand-page or Decoder URL, the list verbatim as printed, a date and where it was read. The ingredients are parsed from the quote, so they cannot disagree with it. An entry is used only when Decoder, the brand's page and Nykaa found no list, after the reader has named the product, matched on brand and exact product name (any word order, never by containment, so another SPF, shade or size never borrows it). It is recorded at capture trust 3 with origin `owner-supplied`, and the page says the list was printed on the pack and typed in by The Clean Sheet. It lives in the repository, not the database, because the frozen re-run runner's child process cannot read the database and every entry is then a dated, reviewed change. A malformed entry fails the tests. The data file ships empty: the Humuss list must be copied from its pack. (2) `src/lib/brand-catalogue.ts`, used by `findBrandInci`: a brand's own page whose title fails the name check is still taken when the brand's Shopify product feed (`/products.json`) holds exactly one product that is clearly this one: at least 4 words and 60% of its own words shared, the same SPF/size/percentage numbers, no sample, set, shade or form on one side only, and a lead of 2 shared words over the next-best. A store without a feed, or one we could not read in full, confirms nothing. The page must still carry a captured quote and a sane list. Decoder and Nykaa pages are not affected. (3) The decision core names an owner-supplied list "the pack",; in `src/lib/analyser-x/adapter.ts`. (A Nykaa list had been named "our own reading of the page"; main fixed that separately in 3d11dd8, so it is not part of this change.)
- **Not done, and why:** accepting a retailer's list when two retailers agree was chosen but is not built, because the measurement said not to. Measured 2026-11-01 on the 26 distinct products the catalogue re-runs held (31 records) plus Humuss: today's pipeline (Decoder, the brand's page with the catalogue check, Nykaa; no model page-finder) found a list for 12 of the 26 (Nykaa 5, Decoder 5, the brand's own page 2). Of the 14 left, 2 had any brand-domain page in the search results and neither gave a list; the catalogue check rescued none; a non-Nykaa retailer page gave a list for 3, only 2 of them under a title that names the product, and **no product had two retailers with the same list**, so the rule would have resolved 0 of 14 (the plan's bar was 30%). For Humuss, Flipkart and Amazon gave no list text. Limit of the measurement: the retailer reads used the general page extractor on Firecrawl-rendered text for at most three retailer hosts each, so a retailer that keeps its list in a block the renderer does not return would be missed; it shows no evidence the rule would help, not proof that it could not. Cost: 69 searches and 58 renders in the clean run (about 24 searches and 8 renders more in a first run that rate-limiting made invalid, discarded). Nothing here reads a list off a pack image.
- **Known limits:** the catalogue check helps only Shopify brands, and only when the brand prints a list as page text; it does not fix Humuss on its own. A new entry is needed for each product, and a shopper's search worded so that the reader names the product differently needs that name added to the entry. A list typed from a pack is as current as the pack the owner read.
- **Not changed:** the colour or pill rules, the prompts, stored analyses (nothing is re-run by this change), the approved baseline id `X1-approved-2026-10-28`; a new baseline and tag are needed before any re-run uses this code.
- **Undo:** revert the change. Entries already used are recorded in `inciEvidence.origin`; older code ignores the value.
### 2026-11-02 (later): Every ingredient on the pregnancy audit lists shows a caution, and each says why in one line
- **Decided by:** the owner, on 2026-11-02, in chat, after being given the audit's lists (what would show a caution, and what the audit doubted): "All these can be flagged as caution but mention note saying why we have flagged them in one liner."
- **Reason:** in the owner's words above; no further reason was given. This **supersedes the removals in the entry below** for five rows (Propylparaben, Perillyl Alcohol, Benzophenone-4, Ethylhexyl Methoxycinnamate, Homosalate), which show a caution again. Methylparaben and Ethylparaben were not in the lists the owner answered and stay neutral; say so if they should be flagged too.
- **What it touched** (`src/data/ingredients.json`, `Pregnancy_Restriction` on 26 rows; `Verification_Notes` and `Last_Updated` on each; `Source_Reference` on four): every flagged row's text is now one sentence opening "Caution during pregnancy", and none is a bare "Yes". 32 ingredients now show a caution (27 before this change, plus the five restored).
  - **Shortened to one line (4):** Butylparaben, BHA, Eucalyptol, Benzophenone-3. Same sources and facts as the entry below.
  - **Restored (5), each saying plainly that the SCCS judged it safe at its limit:** Propylparaben (SCCS/1623/20), Benzophenone-4 (SCCS/1660/23), Ethylhexyl Methoxycinnamate (SCCS/1671/24), Homosalate (SCCS/1622/20); Perillyl Alcohol says "we found no pregnancy safety data for this fragrance terpene alcohol", because no source was found either way. The four opinions are added to their `Source_Reference`.
  - **Existing flags that read "Yes" (7), now with the reason the row's own notes give:** Retinol Acetate, Tretinoin, Adapalene, Tazarotene (teratogenic retinoids), Chlorobutanol, Thimerosal, 4-Methylbenzylidene Camphor.
  - **Existing flags the audit doubted (10):** Formaldehyde, Aminobenzoic Acid, Disperse Blue 1, Toluene-2,5-Diamine Sulfate, Ammonium Persulfate, Benzophenone-1 and Benzophenone-8 had "Yes" and no pregnancy wording anywhere in the row, so their line gives what the row does say (banned or restricted in the EU, carcinogen class, allergen, endocrine class) and ends "no pregnancy-specific finding is recorded". Resorcinol: the old text called it a "CMR Category 2 reproductive toxicant" although the row's own CMR flag is None, so that claim is dropped and the line keeps the thyroid finding in rodents and the row's "avoid in pregnancy and nursing". Salicylic Acid: same content, now opening as a caution instead of as reassurance. Neem seed oil: the old text said "not applicable… no restriction identified" yet the page flagged it (the page's check only skips text that opens "No", "None" or "Not"); it now says what the concern is and that it is thought not relevant to refined topical seed oil.
  - **Left as written:** Retinol, Retinyl Palmitate, Retinaldehyde, Hydroxypinacolone Retinoate, Retinyl Acetate and Cyclotetrasiloxane (D4) already say why in a sentence or two; D5 and D6 stay neutral.
- **What the lines do not claim:** the 18 lines taken from a row's own notes (the "Yes" rows, the doubted rows, Perillyl Alcohol) restate those notes and were **not checked against primary sources**; each row's `Verification_Notes` says so. Every line that cites an SCCS or EMA opinion rests on a document read in full in the entry below.
- **Trade-off the owner accepted:** pregnancy chips return on very common sunscreens (Ethylhexyl Methoxycinnamate, Homosalate, Benzophenone-3, Benzophenone-4) and parabens (Propylparaben, Butylparaben), and appear on neem seed oil, with lines that say the SCCS judged most of them safe. The wording "precautionary only" is deliberate so the chip does not read as a restriction.
- **Tests:** `pills-page.test.ts` (each of the 26 shows a flag with a one-sentence reason; Methylparaben and Ethylparaben do not) and `ingredient-pregnancy-audit.test.ts` (no row is a bare "Yes"; every cited opinion is in the row's source field; the rows with no pregnancy finding say so). Full suite green.
- **Undo:** revert this commit to return to the audit's result (seven rows neutral, four reworded). Nothing is migrated; stored analyses change when a page is next drawn.

### 2026-11-02: The templated pregnancy caution is removed from seven more rows and reworded on four, each checked against its primary source; D5 and D6 are no longer said to be in Annex III
- **Decided by:** not yet the owner. These are per-row calls made under the audit brief that followed the owner's question of 2026-10-30 about the Beauty of Joseon Dynasty Cream ("Why is it flagging these as pregnancy risk? What is the source data for this?"). The brief's rule was: keep a caution when unsure, and say what is unverified. The owner has not yet seen the per-row decisions, and no reason in the owner's words was given for this step.
- **Reason:** `src/data/ingredients.json` carried one templated sentence, "Caution during pregnancy; endocrine disruption data; precautionary avoidance of high-frequency leave-on use", on eleven rows (the Dimethicone-style neutral wording was already given to D5 and D6 on 2026-10-30). The pregnancy chip on a product page, and the text on the public ingredient page, read from it. None of the sources the rows cite says it: for the parabens the SCCS says the opposite, and on Eucalyptol and Perillyl Alcohol the row's own `Endocrine_Flag` is No. The rule applied: **a pregnancy flag stands only when a primary source we read records a concern about pregnancy or the unborn child, or an authority advises against use in pregnancy, and the committee does not itself dismiss it; the row then says what the source says and no more.** "Endocrine-active" or "precautionary", where the SCCS weighed exactly that and found the ingredient safe at the permitted level, is not a pregnancy flag.
- **What changed, row by row** (old text was the templated sentence unless stated; confidence is mine):
  - **Methylparaben, Ethylparaben: removed (neutral wording). Confidence high.** SCCS/1652/23 (final, corrigendum Feb 2024): methylparaben safe up to 0.4% (0.8% for mixtures) with endocrine activity weighed. SCCS/1348/10 section 5 and SCCP/1183/08: methylparaben and ethylparaben "not subject of concern", safe at the authorised maxima. SCCS/1514/13, quoting SCCS/1348/10: "With regard to pregnant women, the unborn foetus will be better protected than the neonate/newborn or early infant exposed dermally to parabens by the more efficient systemic parabens inactivation by the mother." No ethylparaben-specific opinion newer than 2013 was found (not an exhaustive search).
  - **Propylparaben: removed. Confidence medium-high.** SCCS/1623/20 (final, 2021): safe up to 0.14%; five good-quality GLP studies support a reproductive and developmental NOAEL of 1000 mg/kg/day (one OECD 414 prenatal study: no effect on females or foetuses); endocrine evidence "not sufficient to regard it as an endocrine disrupting substance". **Unverified:** the ECHA RAC opinion on propylparaben (March 2023) could not be read (ECHA blocks automated access, HTTP 403 and a bot check); a secondary summary says RAC found no reproductive classification warranted. If RAC classified it, this call changes.
  - **Perillyl Alcohol: removed. Confidence medium.** The sentence had no source at all; `Endocrine_Flag` is No; no SCCS opinion or CIR report on it exists that I could find. **Unverified:** CosIng, IFRA and RIFM were not read directly.
  - **Benzophenone-4: removed. Confidence medium-high.** SCCS/1660/23 (final, 27 March 2024): safe as a UV filter up to 5% (total dermal aggregate) with the endocrine concern weighed; its OECD 422 study (up to 1250 mg/kg/day, before mating through lactation) found no effect on pregnancy rate, litter size or pups, though the SCCS noted deviations from the guideline.
  - **Ethylhexyl Methoxycinnamate (old text: "...endocrine disruption data. Precautionary avoidance..."): removed. Confidence medium. Closest call.** SCCS/1671/24 (final, corrigendum 26 March 2026): safe up to 10% in sunscreen, face, hand and lip products, also for children; prenatal studies in rats and rabbits showed no increase in malformations. It does record that EHMC is endocrine-active (estrogenic, weakly anti-androgenic) and quotes an NTP study with "equivocal" evidence of developmental toxicity (postnatal weight, delayed puberty markers).
  - **Homosalate (old text: "Caution during pregnancy; systemic absorption demonstrated; precautionary avoidance."): removed. Confidence medium. Closest call.** SCCS/1622/20 (final, June 2021): safe up to 0.5%, not at 10%; endocrine evidence "inconclusive, and at best equivocal"; the only pregnancy-type findings (more post-implantation loss from 300 mg/kg/day in a screening study) "cannot be considered as conclusive and reliable" (constant-light error, few pregnancies). SCCS/1638/21 (Dec 2021): 7.34% safe in face cream and pump spray. "Systemic absorption" is a fact, not a pregnancy statement.
  - **Butylparaben: reworded, flag stands. Confidence medium.** New text: "Caution during pregnancy is precautionary only: in rat studies, butylparaben given to dams during pregnancy and nursing reduced anogenital distance and sperm count in male offspring, and the SCCS took its point of departure from the anogenital-distance effect. The SCCS judged butylparaben safe as a preservative up to 0.14% (as acid) (SCCS/1651/23); it is also on the EU REACH Candidate List for endocrine-disrupting properties affecting human health." Source: SCCS/1651/23 (final, 2023; its benchmark-dose modelling is on the male anogenital-distance decrease; "safety concerns cannot be excluded" for children without child-specific exposure data). **Unverified:** the Candidate List entry (25 June 2020) rests on several trade summaries and on SCCS/1651/23 mentioning ECHA's SVHC report; the ECHA page itself could not be read.
  - **BHA: reworded, flag stands. Confidence medium.** New text: "...older animal studies, mostly oral, found effects of BHA on fertility and development, with some indication of fetal malformations, and the SCCS judged them too weak to set a limit from. The SCCS considers BHA safe on skin up to 0.07% in leave-on and rinse-off products (SCCS/1682/25); that advice does not cover oral-care or inhaled products." Source: SCCS/1682/25 (final, adopted 26 March 2026). Its "EU Annex III" source citation is removed (see below).
  - **Eucalyptol: reworded, flag stands. Confidence medium.** New text: "...safety in pregnancy has not been established for eucalyptus oil, whose main constituent is eucalyptol (1,8-cineole), and animal studies show 1,8-cineole crosses the placenta. The EMA herbal committee (HMPC) advises against medicinal use of the oil in pregnancy for lack of data (EMA/HMPC/307782/2012); we found no cosmetic pregnancy restriction." This is a data-gap caution for herbal medicines, applied here to a fragrance component; it is the weakest of the four that stand. **Unverified:** the final HMPC monograph text (the 2013 assessment report is a draft; a 2022 addendum, EMA/HMPC/679833/2021, says pregnancy use is "already not recommended in the HMPC documents").
  - **Benzophenone-3 (old text: "...endocrine disruptor with documented absorption. Precautionary avoidance of high-dose leave-on application..."): reworded, flag stands. Confidence medium.** New text: "...absorbed through the skin and has been detected in placental tissue, and human studies of exposure in pregnancy report mixed birth-outcome associations. The SCCS judged the evidence that it is an endocrine disruptor inconclusive and advised lower limits for body products (SCCS/1625/20)." The old "endocrine disruptor" overstated an opinion that calls the evidence "inconclusive, and at best equivocal".
  - **Cyclopentasiloxane (D5), Cyclohexasiloxane (D6):** `EU_Annex` was "EU Annex III"; it now reads "Not in Annex III of the Cosmetics Regulation; restricted under REACH Annex XVII entry 70", and `Source_Reference` no longer cites Annex III. The D5/D6 pregnancy text is unchanged from 2026-10-30. The code that treats Annex II as a ban was checked: neither row is read as prohibited.
  - Every changed row has `Last_Updated` 2026-11-02 and a `Verification_Notes` sentence giving the date, the sources and what was not verified. `Data_Confidence` was not changed.
- **Measured:** this task made no database read, so the effect on the 32 analyses stored on 2026-11-01 is not counted. Pregnancy chips are worked out when a page is drawn, so stored analyses that list any of the seven removed ingredients lose that chip, and the four reworded ones show the new sentence, when this ships. Tests: the 7 removed rows raise no flag and no chip; the 4 reworded rows still do, with their source named; retinol, Retinyl Palmitate and D4 are untouched; no row carries the templated sentence; D5 and D6 are not read as prohibited. Full suite green.
- **Not verified, and why it matters:** ECHA (the propylparaben RAC opinion, the butylparaben Candidate List entry) and EUR-Lex (the text of Regulation (EU) 1004/2014, 2022/1176, 2024/1328) block automated access, so the legal texts themselves were not read. The SCCS opinions, the EMA reports and the SCCP/SCCS paraben opinions were read in full text from the European Commission and EMA sites.
- **Found, not changed (each needs its own decision):**
  - **Fourteen rows hold the bare value "Yes" as their pregnancy text**, which the page prints as, for example, "Formaldehyde: Yes. Source: ..." and counts as a flag: Chlorobutanol, Formaldehyde, Thimerosal, 4-Methylbenzylidene Camphor, Benzophenone-1, Benzophenone-8, Aminobenzoic Acid, Retinol Acetate, Tretinoin, Adapalene, Tazarotene, Toluene-2,5-Diamine Sulfate, Disperse Blue 1, Ammonium Persulfate. Some are banned or drug-only; the endocrine ones (4-MBC, Benzophenone-1, Benzophenone-8, Chlorobutanol) may carry the same unsupported template. Not audited.
  - **BHA:** `EU_Annex` ("EU Annex III") and `Max_Concentration_EU` ("max 0.02% leave-on face...") are contradicted by SCCS/1682/25, which says BHA "is currently not regulated under the Cosmetics Regulation". **The INCI name "Butylated Hydroxyanisole" does not resolve to the BHA row at all** (only "BHA" does), so a product listing the standard name is not screened for it.
  - **Butylparaben:** `SVHC_Flag` reads No while the REACH Candidate List lists it (unverified, above). **Homosalate:** `Max_Concentration_EU` says "0.5% max EU" with source "SCCS/1638/21", but that advice is 7.34% for face products; what the Commission adopted was not checked. **Benzophenone-3:** `Max_Concentration_EU` ("6% body; 0.5% face") differs from the SCCS figures (6% face, hand and lip; 2.2% body) and its source "SCCS/1593/17" was not found. **EHMC:** `Key_Safety_Notes` still says "SCCS reassessment ongoing"; it is final. **D5:** its source "EU Regulation 2018/675" may be a mis-citation of 2018/35 (not checked).
  - **Key_Safety_Notes on Methylparaben, Propylparaben and Butylparaben** still say "TCS precautionary avoidance / requires avoidance / automatic concern flag in baby and pregnancy submissions", and the public ingredient page prints them beside the new pregnancy text.
  - Other rows' pregnancy text (for example Salicylic Acid, Kojic Acid, Oligopeptide-1) was outside the brief and was not examined.
- **Undo:** revert the commit; nothing is migrated. The old text of each row is in git history; for the seven removals it is the templated sentence (EHMC, Homosalate and Benzophenone-3 had the variants shown above). To keep a caution on any removed row without reverting everything, restore that row's `Pregnancy_Restriction` with a source in `Source_Reference`.

### 2026-11-02: An analysis that is not saved is kept apart from the saved ones in the server's memory
- **Decided by:** the owner's rule that a pasted ingredient list is analysed for the person who pasted it and is never saved or listed (see the 2026-11-01 entry below). This change closes a leak of that rule found while testing that entry's change; the owner did not decide it separately and no quotation was kept, so none is given here.
- **Reason:** none given by the owner. The leak: `runProductReview` held an analysis it was not going to save in the same five-minute memory that saved analyses are read from, under the name the model chose for the pasted list. When a brand page had been found for that name, the list was not empty, so the saved-analysis reader treated the entry as a real stored analysis, and (1) a second, different paste that the model named the same way was answered with the first person's analysis; (2) a later typed query that spells that name was answered from it, without asking the model, and the missing-photo retry then wrote that analysis into `product_reviews`; (3) the `/analysis/<slug>` page for that name could show it. When no brand page was found the list was empty and nothing leaked. Found with a throwaway test while checking the 2026-11-01 change (the old five-item rule behaved the same).
- **What it touched (what is remembered and for whom; no rating, wording or prompt changes):** `src/lib/product-review-engine.ts`. An analysis that is returned but not saved now goes into its own memory, `UNSAVED_CACHE`, keyed on a hash of the text the person pasted (lower-cased, spaces collapsed), for the same five minutes, at most 50 entries (the oldest goes first). It is read at the top of `runProductReview` for text that is not a web address, and nowhere else: not by `getStoredReview`, not by the duplicate checks, not by the photo retry, so no product address can reach it and nothing in it can be written to the repository. Side effect: the same paste asked again within five minutes (same text up to case and spacing) is now answered without asking the model again, which is what the 2026-11-01 code comment always said; before, the entry sat under the model's name and a repeat paste did not find it. Tests: `src/lib/product-review-engine.unidentified.test.ts` (six new cases, all failing without the change).
- **Not changed:** how any analysis is made or rated, the rule for what is saved, `runDeepScan` (`src/lib/review-engine.ts`, which keeps its own memory keyed on the input and is not read by the saved-analysis reader). A paste that the model names as a product already in the repository is still answered with that saved analysis by the duplicate check, as before: that analysis is real, identified and was not made from anyone's paste. Rows an earlier paste may already have written through leak (2) are not checked or removed; that needs a read-only count first, then the owner's go-ahead, a dry run and a backup.
- **Undo:** revert the change. Nothing is migrated.

### 2026-11-01: A pasted ingredient list is analysed for the person who pasted it and is never saved or listed, in whatever format it arrives
- **Decided by:** the owner. The rule is older than this entry (commit f5893ea, "Keep INCI-only scans out of the review directory", added the first guard) and was restated in the brief for this change; no quotation was kept, so none is given here.
- **Reason:** a pasted ingredient list identifies no product: it has no brand and no name, so it must not become a row in `product_reviews` or a tile on `/products`. A read-only audit on 2026-11-01 found that production (main 56beba8) stopped only comma, semicolon and new-line lists of five or more items. A list separated by bullets, pipes, slashes, full stops or plain spaces, a list of four or fewer items, and an "Ingredients:" label with four items were each treated as a named product and saved under whatever name the model made up. The one real paste seen, on 2026-09-02, came back titled "Not Identified Product" (slug `not-identified-product-not-identified-based-on-provided-inci`). A URL already had a placeholder check; typed and pasted text had none.
- **What it touched (what is saved and listed; no rating or wording changes):** a new `src/lib/inci-paste.ts` decides whether the input is a pasted list. It splits on comma, semicolon, new line, tab, bullet, pipe, slash, a spaced dash or a full stop that ends a word. It says "list" for an "Ingredients:" / "INCI:" label, for five or more items, for two to four items of which at least three quarters read as ingredient names, and for four or more space-separated words of which at least three quarters read. A word reads as an ingredient name when it is in the reference database, is a word only ingredient names use (Sodium, Extract), or ends the way chemical names do; a word a product is called (Serum, Cleanser, Face Wash) rules a list out. `src/lib/product-identity.ts` now holds the one `IDENTITY_PLACEHOLDER` pattern and widens it to "not identified", "unidentified", "unnamed product", "unknown formulation", "not specified", "based on provided INCI" and "INCI analysis". `runProductReview` (`src/lib/product-review-engine.ts`) saves only when the result's name and brand are not placeholders and, for text, the input is not a list (an INCIDecoder match still counts as an identity, as before). `runDeepScan` (`src/lib/review-engine.ts`, behind `/api/analyze`, which needs no sign-in) registers a verified product under the same rule; before, its guard was the old five-item test only. The person who pasted still gets their analysis.
- **Measured** (read-only, no model call, by the tests in `src/lib/inci-paste.test.ts`): of 47 typed product names (the 7 sample products in `src/data/mockProducts.ts` and 40 written to be awkward, such as "Hyaluronic Acid Zinc Serum" and "Cetaphil, Gentle Skin Cleanser"), none is read as a list; each of the 7 sample products' own ingredient lists is read as a list in every separator above, as its first four items, and behind an "Ingredients:" label. Against `origin/main`'s guard, 11 of the list cases fail and with this change none does.
- **Not changed:** how any analysis is made or rated, the prompts, the decision core, the URL rule (a page or an address must still name the product), and every row already stored: this change neither checks nor removes them.
- **Known limits:** it is a heuristic. A paste of fewer than four space-separated words, or of names that neither the database nor the word lists know, can still read as a product; the placeholder check on the model's own title is the second line. A typed query that is nothing but ingredient names ("Zinc Oxide, Titanium Dioxide") reads as a list and is not saved. An unsaved analysis is still held in the server's memory for five minutes under the name the model gave it (separate follow-up).
- **Undo:** revert the change. Nothing is migrated.

### 2026-11-01: An animal-origin ingredient is shown on a chip only when it is explicitly stated and verified; every other open question goes under "Gaps"
- **Decided by:** the owner, on 2026-11-01, in chat, after the Aestura change below: "unless until exploicitly mentioned it's animal ingredient and verified, we shall enver show this under a pill.. it can go under gaps - to show whether it is animal or plant derived.."
- **Reason:** in the owner's words above. The first fix (2026-10-30) only stopped the cross where a word list happened to see a second route. It left two holes that the owner's rule closes: an ingredient the reference describes as "Vegetable (olive oil) / Animal" (Oleic Acid) still earned the vegan tick, and a clearly animal one described as "Animal (honeybee)" (Beeswax, Cera Alba, Lanolin, Carmine, Hydrolyzed Keratin) earned nothing because the word list did not read the word "Animal".
- **What it touched (display only):** `src/lib/review-to-scorecard.ts`, `buildVeganScreen`: a listed ingredient is now sorted into one of four places. **Cross** (`animalIngredients`): its reference row is high-confidence, has a source, names an animal source ("Animal", or a named animal material), names no plant, synthetic, microbial or biotech route, and its vegan column is not "Yes". **To confirm** (`originToConfirm`, new): it names an animal route beside another one (Cholesterol, Stearic Acid, Glycine, Squalene...), or names one at lower confidence (Snail Secretion Filtrate is Medium), or its own vegan column is not a plain "Yes" ("No", "Depends on source", "Yes, if ..."). **Resolved**: a sourced, high-confidence non-animal origin and a vegan "Yes". **Unknown**: no usable row or nothing in it that raises the question. `src/lib/pills-page.ts`: a to-confirm ingredient is never a chip and never earns the tick; `gapsOf` adds one line, "Confirmation from the brand of whether <names> is/are animal- or plant-derived." (at most five names, then "and N more"; silent for a medicine and when the ingredient list is not source-backed); the cross chip's note points to Gaps; the "Vegan claim: not supported" cross (`claimEvidenceHighlights`) is drawn only when the screen has a verified animal-only ingredient, otherwise it is the usual undrawn "brand claim". `src/components/scorecards/ProductScorecardView.tsx`: the older vegan-screen block says "Animal or plant source not established". `src/data/brands/types.ts`: `VeganScreen.originToConfirm`.
- **Measured** (read-only, offline, on the 322 analyses exported before the 2026-10-30 wipe, drawn with the new code; no network, no model, no database): crosses were 0 under the 2026-10-30 rule and are 2 now, both correct and both missed by the word list (Juicy Chemistry Organic Under Eye Repair Cream: Cera Alba; OUAI Detox Shampoo: Hydrolyzed Keratin). 23 pages (7%) now carry an origin line under Gaps; the names that cause it most are Stearic Acid (8), Glycine (5), Hyaluronic Acid (4), Hydrogenated Lecithin (4), Myristic Acid (4), Palmitic Acid (3), Lecithin, Cholesterol and Squalane (2 each). The vegan tick was on 0 pages before and is on 0 now; "Vegan claim: not supported" crosses were on 0 pages before and are on 0 now (26 of the 322 carry a vegan claim). Counts are from the old analyses, not from today's fresh runs.
- **Known limits:** "verified" means the reference row says so at high confidence with a source; it is not a statement about this product's supplier, which is why the open cases are asked of the brand. The reference's non-animal side includes synthetic and biotech routes, so "plant-derived" in the gap line is looser than the data (Retinyl Palmitate is "Synthetic / Animal-derived"). A few very common ingredients (Stearic Acid, Glycine, Myristic Acid) will put a line under Gaps on many pages; that is what the reference says today, not a verdict on those products. The tick, and the `VEGAN` badge that reads it (`src/data/badges/resolver.ts`), are now harder to earn: any listed ingredient with an animal route blocks them. **Not changed, and open:** sentences the model writes (the claim-by-claim notes in the Claim check block, and the stored take or "biggest concern" of a few analyses such as Belif The True Cream, which said its vegan claim was "contradicted by Cholesterol") are not checked against this rule; fixing that means changing the prompt and is the owner's call. This closes two limits listed in the 2026-10-30 entry below: the tick for a "Vegetable / Animal" ingredient, and the Medium-confidence snail row, which is now listed under Gaps.
- **Not changed:** the colour or pill any product gets (the decision core never reads the vegan screen), stored analyses, the prompts, and `ANALYSER_APPROVED_BASELINE` (X1-approved-2026-10-28).
- **Undo:** revert the change; nothing is migrated and no stored analysis is touched: the screen is worked out when a page is drawn.
### 2026-11-02: A pasted brand URL meets the Decoder list again once the brand is known, and a label glued to a page's list no longer starts it with page copy
- **Decided by:** a fault found while re-running the Beauty of Joseon Dynasty Cream on the new engine, which the owner had asked for ("Re-run - sure"). It follows the owner's rule of 2026-10-30 that the brand's own page, Nykaa and INKEE Decoder are searched together as equals, and her rule of 2026-11-02 that the brand website is the best source.
- **Reason:** for `https://beautyofjoseon.com/products/dynasty-cream` the first lookup takes the first word of the URL slug ("dynasty") as the brand, so the brand's own page (`beautyofjoseon.com`) was refused as not the brand's; a Decoder list then won without ever meeting it (here the first lookup's own search found INKEE's page and returned it as the winner), and the corrected-brand lookup ran only when no list had been taken from a page at all. Separately, that page prints "Full Ingredient List" with no line break after its copy, so the page reader's first two entries were "soothe" and "and address uneven texture Full Ingredient List Water".
- **What it touched:** `src/lib/product-review-engine.ts`: the second lookup, made with the brand the model names, now runs unless the first lookup already ended on the brand's own page, and whatever list the first lookup took (a Decoder list found by name or by the search, a Nykaa list, or none) competes in it. `src/lib/inci-from-page.ts`: `startAtListLabel`, applied to a page read (not to `extractInciWithQuote`, which must agree with the extractor it replaced), starts the list after a label that sits inside one of the first three entries.
- **Measured** (real network, no model): the brand page read gave 38 entries, the first two page copy; after the change, 37 ingredients starting "Water, Glycerin, Hydrogenated Polydecene", the quote starting at "Water". The Decoder entry the first run chose, "Beauty of Joseon Dynasty Cream [2021]", also has no silicone, so the wrong-formula problem seen on the stored page was the older Decoder entry (`beauty-of-joseon-dynasty-cream`, with Cyclopentasiloxane and Fragrance).
- **Not changed:** how lists are compared, the order of trust, stored analyses.
- **Undo:** revert the change; nothing is migrated.

### 2026-11-02: Only claims on the brand's own website are checked
- **Decided by:** the owner, on 2026-11-02, in chat, after asking where three Re'equil claims came from ("I don't find these claims on the brand website, where are these coming from?"). Asked whether claims seen only on retailer listings should count against the brand: "yes brand website is the best source. nothing else".
- **Reason:** the three Re'equil claims were labelled "Nykaa Brand Info" ("clinically tested to suit every unique skin type"), "Re'equil Brand Website (via Clinikally)" (a reseller; "Treats fine lines & wrinkles") and "Flipkart" ("All Skin Types"). None is on reequil.com except "For all skin types". The prompt told the model to collect claims "from all platforms", and the model wrote the `source` label as free text, with no link or quote kept, so a retailer's wording could be flagged against the brand as an ASCI or drug-boundary concern.
- **What it touched:** (1) the prompt (`product-review-context.ts`): claims only from the brand's own page for the exact product; a marketplace-only claim never enters `claimMap`; with no readable brand page the model returns an empty list; the platform-parity step stays, as a comparison note. (2) `src/lib/claim-source.ts` (new), run when an analysis is made, right after the brand name is fixed: a claim is kept when its source label names the brand's own site among the places it was seen ("Brand Website", "Brand Website / Flipkart / Nykaa", "Official Website", "<Brand> Website", "<brand>.in"); "(implied)", "(via X)", "(General)", "(Global)", reviews, retailers and the pack do not count. The claim summary is counted again from what is kept. (3) `ResearchLog.claimsKept` and `claimsDropped` record the result; when some were dropped and none kept, the decision's `claimsSourceRead` is false and `gap.claims_unreliable` (a gap, "claims not examined") applies instead of reading an empty list as "no claims".
- **Measured** (read-only, the 40 analyses stored on 2026-11-02, labels only): 37 of 40 hold at least one claim whose label names no brand site; 11 of 40 hold no claim at all that names one. Those would end with few or no claims if re-run on this rule, so the colour of some products will move when they are re-run. Stored analyses are NOT changed: no read-time filter was built, because it would shift the colour of a third of the products at once and the model's own scores were made with the retailer claims in view.
- **Known limits:** the label is the model's own words, so the rule trusts it. A claim the model wrongly labels "Brand Website" is kept; a claim it labels only "Brand Website (implied)" is dropped. The real fix is to keep the page text and a quote for each claim and check the wording appears in it (the verifier work on `feat/analyser-verifier`), which is not on main. A product whose brand page cannot be read now shows as claims not examined (a gap), not as a clean claim check. On-pack claims are not counted unless the brand's page also shows them; say if they should be.
- **Not changed:** the platform-parity score and text, stored analyses, the pill rules, `ANALYSER_APPROVED_BASELINE`.
- **Undo:** revert the change; analyses made under it carry `claimsKept` and `claimsDropped`, which older code ignores.

### 2026-10-30: The brand profile page draws its products with the /products card, and the words "Good Standing" and "Room to Improve" are not shown
- **Decided by:** the owner, on 2026-10-30, in chat (issues list, round 2): "The products inside the brands page should show the same thumbnails style that is present on the /products page & don't mention good standing/room to improve tags anywhere across the website - even on compare."
- **Reason:** `/brands/<brand>` listed each product as a text card headed "Green · Good Standing" / "Yellow · Room to Improve" (no picture, no rating circle, no ticks), and the public `llms-full.txt` still defined those words. The filters, the cards and the compare page already show colours only.
- **What it touched:** `src/components/brands/BrandProductGrid.tsx` (new): the same `MarketCard` as /products, with the same compare rules, tray and message (no "Show only" button, as there is no filter to switch); `src/app/brands/[brand]/page.tsx` uses it; `src/app/llms-full.txt/route.ts` now says what Green, Yellow and Red mean.
- **Checked live before the change** (HTML of `/`, `/brands`, `/brands/cetaphil`, `/products`, `/compare?items=...`, `/standard`, `/about`): the two phrases appeared only on the brand profile page and in `llms-full.txt`. The compare page shows the five pills ("Buy with caution" and so on), not those words.
- **Not changed:** the internal names in code (`Standing`, `TIER_STYLES` labels), which are reached only by routes that no longer serve (the hand-written catalogue pages redirect) and by tests that use them as markers; the "Product portfolio standing: Mostly Green" panel on the brand page, which is a count of colours; the rating key wording ("Red: ... Not recommended").
- **Seen, not changed:** the Cetaphil profile lists a row named just "Cetaphil" (slug `cetaphil-`, summary about the Gentle Skin Cleanser): a stored analysis whose product name was only the brand. Fixing it means renaming or re-running that row.
- **Undo:** revert the change; no migration.

### 2026-10-30: "Who should be careful" and "Worth knowing" never carry a "clean formula" line or an unsourced fungal-acne line
- **Decided by:** the owner, on 2026-10-30, in chat (issues list, round 2): about the Beauty of Joseon Dynasty Cream, "you prefer a truly clean formula - to be never mentioned under who should be careful ok?"; about the Be Minimalist Vitamin B5 10% Moisturizer, "How is it saying under who should be careful - if you're prone to fungal acne? What is this supported by?"
- **Reason:** the fungal-acne line came from one sentence the model wrote in `formulaLogic.irritancyConcerns` ("some sources suggest may feed Malassezia") with no source named, and the page repeated it as a caution. The reference database has no fungal-acne field, so nothing we hold supports it. "Expect a truly 'clean' formula" is not a finding: the site does not define clean as an ingredient quality.
- **What it touched (display only):** `src/lib/fit-claims.ts` (new, `withoutUnsupportedFitLines`), applied at the start of `buildPillsPage` and `reviewToScorecard`, so the product page, its FAQ, the compare page and the cards read the same lists; the prompt (`product-review-context.ts`) tells the model not to write such lines. The lines are dropped, not reworded.
- **Measured** (read-only, the 32 analyses stored on 2026-11-01): 3 have a fungal-acne line under avoidIf, 2 in irritancyConcerns, 2 have a "clean" line. Their pages change when this ships; nothing is re-run and no stored row is touched.
- **Not decided:** a sourced, code-owned fungal-acne list (like the comedogenic one) would be a separate decision; the lines come back only if the owner approves a source for it.
- **Undo:** revert the change; nothing is migrated.

### 2026-10-30: A decimal point no longer cuts a sentence on the product page ("0.3% Retinol" was shown as "3% Retinol")
- **Decided by:** found while checking the Re'equil Retinol Night Cream 0.3% page the owner questioned: its Formula logic row read "3% Retinol high in the INCI" for a 0.3% product. A fault, not a rule change.
- **Reason:** `lead()` in `src/lib/pills-page.ts` split text at every full stop with a regex that skipped a stop followed by a digit, so a sentence containing a decimal lost everything before it and the page showed the rest. A tenfold misstatement on a retinol product.
- **What it touched:** the sentence pattern in `lead()`: a stop ends a sentence only when a space or the end follows it. Used by the Formula logic one-liner only.
- **Measured** (read-only, stored analyses with a decimal in the first 260 characters of the formula note): 1 of 32 (Re'equil). Any new analysis with a decimal early in the note was exposed.
- **Undo:** revert the change; nothing is migrated.

### 2026-10-30: Cyclopentasiloxane (D5) and Cyclohexasiloxane (D6) are not a pregnancy flag
- **Decided by:** the owner asked, on 2026-10-30, in chat (issues list, round 2), about the Beauty of Joseon Dynasty Cream: "Why is it flagging these as pregnancy risk? What is the source data for this?" The change itself is the correction of a data row, made on the evidence below; the owner has not yet been asked to approve the audit of the other rows.
- **Reason:** the flag came from our own reference file (`src/data/ingredients.json`): both rows carried "Caution during pregnancy; endocrine disruption data; precautionary avoidance of high-frequency leave-on use", with the sources "EU Annex III; SCCS opinion SCCS/1241/10 amended; EU Regulation 2018/675" (D5) and "EU Annex III" (D6). The rows' own notes say the concern is aquatic ("D5 bioaccumulates in aquatic environment"; "environmental bioaccumulation concern") and that leave-on use is permitted. The SCCS final opinion on D5 (SCCS/1549/15) concluded D5 is safe in cosmetics at the reported concentrations, except in hair-styling aerosols and sun-care sprays; its reproductive point is D4 present as an impurity. The EU limit is REACH Annex XVII entry 70 (rinse-off products; leave-on limits from 6 June 2027 under Regulation (EU) 2024/1328), an environmental restriction.
- **What it touched:** the two rows: `Pregnancy_Restriction` is now the neutral "No specific restriction identified in source checked; standard cosmetic use" (the wording the Dimethicone row uses); `Verification_Notes` records why; `Last_Updated` 2026-10-30. Nothing else in the rows. D4 (Cyclotetrasiloxane, Repr. 1B) and Cyclomethicone (may contain D4) keep their flags: their sources support them.
- **Measured** (read-only): 5 of 32 stored analyses list D5 or D6; their pregnancy chip changes when this ships (the flag is worked out when a page is drawn). 
- **Found, not changed:** 8 other rows carry the same boilerplate sentence ("Caution during pregnancy; endocrine disruption data; precautionary avoidance of high-frequency leave-on use."): Methylparaben, Ethylparaben, Propylparaben, Butylparaben, BHA, Eucalyptol, Perillyl Alcohol, Benzophenone-4 (and Ethylhexyl Methoxycinnamate with a near-identical line). Some may be right and some not; each needs its source read before it is kept or removed. The `EU_Annex` value "EU Annex III" on the D5 and D6 rows is also wrong (they are not in Annex III of the Cosmetics Regulation) and was left for the same audit.
- **Undo:** revert the change; nothing is migrated.

### 2026-10-30: Nykaa is searched for ingredients alongside INKEE Decoder and the brand's own site, and the most complete list wins
- **Decided by:** the owner, on 2026-10-30, in chat, about the Lotus Herbals WhiteGlow Gel Creme and the Aqualogica Glow+ Hydra Gel Moisturizer, whose full ingredient lists are on Nykaa. Asked whether Nykaa should be a normal source for every analysis: "Make Nykaa's Ingredients tab a normal source for every analysis". Asked how to settle sources that disagree: "Prefer the most complete list". The owner's correction of the first plan: "The nykaa ingredient search should be along with inkee and brand website." On Aqualogica: "I need a solution that can be scaled, not for this one particular case."
- **Reason:** in the owner's words above. Lotus showed an older formula from INKEE Decoder (no Niacinamide, Cyclopentasiloxane or Isopropyl Myristate; Almond Oil and Alpha-Arbutin instead) while the Nykaa page the shopper pasted listed the current one, because the engine never consulted the pasted retailer page for ingredients. Aqualogica showed no ingredient list at all although INKEE Decoder and the brand's own page both had it: the page-title check wanted 75% of the shopper's name words in the page title, and Nykaa's marketing-length name ("... For 24 Hour Intense Hydration") fails that for the shorter titles those pages use.
- **What it touched:** `src/lib/brand-inci.ts` (`findBrandInci`): INKEE Decoder pages, the brand's own pages and Nykaa product pages (the pasted one and what a Firecrawl search for "<product> nykaa" finds) are read together, each under the same checks (code-extracted, page names the product, quote captured, an ingredient list). The most complete list wins, counted as components so a premix printed "A (And) B" is two; a tie goes to the better-captured source (brand page 4, Decoder and Nykaa 3), then to the page the shopper pasted. Lists that are the same formula written two ways (85% alike or more) are one candidate and length does not choose between them, because a source that splits a premix or a parser that cuts a name into pieces would win on count alone: capture decides, then the pasted page. A list that is a different formula (under 85% alike) is recorded on the winner as `alternatives` and the FAQ answer "How recent is this analysis?" says so. Each read is capped (Decoder 15 s, brand page 20 s, Nykaa 30 s) so one slow source cannot discard the others, and the whole lookup is capped at 40 s. `src/lib/nykaa-inci.ts` (new): renders the page, opens its Ingredients tab and reads the panel as a whole list, keeping Nykaa's own typos as printed; it refuses the product description that shows when the tab did not open. `src/lib/scrape.ts` (`fetchRenderedPage`, new): Firecrawl rendering with one retry. `src/lib/product-identity.ts` (`pageTitleNamesProduct`, new): a candidate page also names the product when its whole name sits inside the shopper's longer name (every distinctive word of the title is in the name, at least three of them, so a different type or variant such as "Cleanser", "Oil Free" or "Jello" never matches); `titleIdentifiesProduct` is unchanged because it also guards which listings may corroborate a claim. `src/lib/product-review-engine.ts`: the lookup now always runs, even when INKEE Decoder resolved by name, with that Decoder list as one candidate, bounded at 50 s; the winner's trust, origin and alternatives go into `inciEvidence`. `makeInciEvidence` takes a recorded trust (a Nykaa list is trust 3, as Decoder is; it was 2 as a retailer address, which would have switched every tick and the regulatory screen off). `sourceName` names INKEE Decoder and Nykaa instead of showing the host.
- **Source label, corrected before release:** `src/lib/analyser-x/adapter.ts` (`sourceOf`) labelled a Nykaa list (read by code with its quote captured, trust 3) as "our own reading of the page", which is the model's transcription at trust 1. A list from any address other than a Decoder at trust 2 or 3 is now "a retailer page"; the other labels are unchanged (Decoder address: INCIDecoder, trust 4: the brand's product page, trust 5: the pack, trust 1: our own reading). The label changes wording only where a sentence names the source; no rule reads it, so no pill or confidence moves.
- **Measured** (real network, no model call, no database): Lotus: Decoder by name 29 ingredients; Nykaa 30 entries (one extra only because Nykaa prints "Tocopheryl, Acetate" with a comma); Nykaa wins, Decoder recorded as the alternative. Aqualogica: no list before; the Decoder page is now found (24 entries, of which "*xylitylglucoside", "\"vitamin c" and a stray "Crosspolymer" are Decoder parse artefacts) and Nykaa is read (19 entries, the same formula with premixes joined and no artefacts): the same formula, so the pasted Nykaa page is used and no alternative is recorded.
- **Measured later the same day on the Beauty of Joseon Dynasty Cream** (search only, no model): the stored analysis used INKEE Decoder's 2021 entry (with Cyclopentasiloxane, Dimethicone and Fragrance), so it said the brand's "silicone-free" and "fragrance-free" were contradicted. The brand's own page today lists 38 ingredients with no silicone and no fragrance, and Nykaa's list (37) agrees with it. With this change the brand page wins (trust 4) and the Decoder list is not used. Brinton Acmist Moisturizing Cream Gel: no list from the brand site or Decoder by name; the Nykaa page gives 17 ingredients. Both need a re-run to change.
- **Known limits:** a longer list is not always the current one, which is why the lists that lost are always recorded; in the Lotus case the pick rests on Nykaa being longer by one entry that is a comma typo, so it should be read as "the pasted page's list", not as a proof of completeness. Nykaa's typos ("Butyl Methcaydibenzoy| Methane", "Isononyl. Isononanoate", "Tocopheryl, Acetate,triethanolamine") are kept as printed and will show as not in our reference database until the owner signs off aliases. Rendering a Nykaa page takes 13 to 15 s when it works, sometimes much longer or times out (HTTP 408), and costs Firecrawl credits (one search more per analysis, up to two page renders); a render that overruns its cap is dropped and the other sources are used, so Nykaa can be absent on a slow day. Other retailers (Amazon, Flipkart, Purplle...) still never supply a list.
- **Not done, and why:** the owner also approved reading the brand's own page with a JavaScript-rendering fetch on every analysis, to catch tests such as COSRX's study. The spike showed it would not have fixed COSRX: its results block (+74.46% skin barrier strength, +87.30% skin density, 20 adults) appears only to a real browser session in India, and Firecrawl did not get it even with an Indian location, cookie, variant parameter and stealth proxy. It was not built; a decision on that is open.
- **Not changed:** the colour or pill rules, the prompts, stored analyses (nothing is re-run by this change), the approved baseline id `X1-approved-2026-10-28`.
- **Undo:** revert the change. Analyses made after it carry the new `origin` and `alternatives` fields in `inciEvidence`, which older code ignores.

### 2026-10-30: An animal-origin cross needs an origin with no other route; commonly comedogenic ingredients are named under "Who should be careful"
- **Decided by:** the owner, on 2026-10-30, in chat, about the Aestura Atobarrier 365 Cream: "Aestura's review says - animal derived ingredients, can we please verify claims like this first? A simple google search got me that this is not animal derived. Also, Comedogenicity risk should be mentioned under who should be careful, right? Fix this and fix the logic behind it".
- **Reason:** in the owner's words above. The page drew "Animal-origin ingredient: Cholesterol" with a cross because the reference row for Cholesterol reads "Animal (lanolin) / Biotechnological": the ingredient can come from either, and nothing we hold says which route this product's supplier uses. A web check found no statement of the source from the brand, no vegan certification, and retailers that disagree (one lists the cream as vegan, another as not), so neither a tick nor a cross can be shown. Separately, the same page said "Acne-prone skin (non-comedogenic)" for a formula that contains Oleic Acid and Ethylhexyl Palmitate, both on the repository's own comedogenic list (commonly rated 3 or more); that rule lived only in the old engine and never reached this page.
- **What it touched (display only):** `src/lib/review-to-scorecard.ts`, `buildVeganScreen` (now exported): an ingredient is listed as animal-origin only when its reference origin names an animal source and no plant, synthetic, microbial, fermentation, biotech or yeast route; otherwise its origin is unresolved, which the At a glance strip does not draw. The word "milk" no longer counts inside "milk thistle". `src/lib/pills-page.ts`, `comedogenicIngredientsOf` and `buildPillsPage`: for a leave-on face product whose whole ingredient list is source-backed, the ingredients on the comedogenic list lead "Who should be careful" ("Acne-prone or breakout-prone skin: contains X and Y, commonly rated comedogenic."), the model's own acne or "non-comedogenic" lines are dropped so the page never says both, and the FAQ answer follows.
- **Measured** (read-only): in the 839-row reference file, 10 rows were flagged animal-origin at High confidence; 3 still are (Hydrolyzed Silk, Shellac, Propolis Extract), 6 are now unresolved (Cholesterol, Retinyl Palmitate, Acetyl Glucosamine, Carnosine, Acetyl Carnitine, Oleyl Alcohol) and 1 is no longer flagged at all (Milk Thistle Extract, which was caught only by the word "milk" in a plant's name). Run offline on the stored Aestura analysis, the cross is gone and the comedogenic line leads the cautions.
- **Known limits:** the comedogenic list is short (17 names) and its scale is a laboratory rating, not a result on skin, so no match is never shown as "non-comedogenic". The vegan **tick** is still given to an ingredient whose reference says "Vegan: Yes" while also naming an animal route (Oleic Acid, Hydrogenated Lecithin); a snail product shows "unresolved" rather than a cross because Snail Secretion Filtrate is Medium confidence. Neither was changed; both want the owner's call.
- **Not changed:** the colour or pill any product gets, the decision core, stored analyses, the prompts, and `ANALYSER_APPROVED_BASELINE` (X1-approved-2026-10-28).
- **Undo:** revert the change; nothing is migrated and no stored analysis is touched: both are worked out when a page is drawn.

### 2026-10-30: When all five sections of a product page are green, the product is a Good choice, except for flags
- **Decided by:** the owner, on 2026-10-30, in chat, about the Cetaphil Moisturising Cream whose five sections were all Strong while the colour was yellow: "if all sections are green - the end result should be green except for flags in my opinion." Then, asked to confirm the exact rule: "Yes, build it and make it live. No need to test it on the old products. From now on, any new analysis that happens should use this logic, either from backend or front end."
- **Reason:** in the owner's words above. The page showed Claims evidence as Strong ("8 of 10 claims are publicly supported") while a separate claim-by-claim check inside the decision held the colour at yellow, so the sections and the colour disagreed on one product.
- **What it touched:** `src/lib/analyser-x/decision.ts` (`agreeWithSections`). When no medicine, block or gap applies, the list is verified, the ingredient screen is clear, all five sections are green, and the only cautions are `caution.claim_gap` or `caution.formula`, the product is a Good choice. Those two cautions stay on the page as notes and under Gaps; "All five areas of our checks are Strong" (`support.sections_green`) stands in for `support.claims_proportionate` as the third support. Every other caution is a flag and still decides Buy with caution: a concerning or audience-specific ingredient, an undisclosed entry, another regulator's limit, SPF below 30, wording beyond what a cosmetic can say in India, an unchecked "free from" claim, a weak list source. Blocks, gaps and medicines decide as before. The five section colours are now worked out in one place, `src/lib/analyser-x/sections.ts`, which the product page and the decision both read, so they cannot disagree; `decideReview` is the only function that produces a colour, so the product page, the lists, the compare page, the brand pages, the home page and every new analysis get the same answer. Invariant I8 checks that a decision resting on the sections really has them.
- **Measured** (read-only, before the change, on the 322 analyses then stored plus the new Cetaphil): 8 had all five sections green. Four were already Good choice; four were Buy with caution on a claim gap alone, apart from one that also had a wording flag. With the rule, three change from yellow to green: Cetaphil Moisturising Cream, Cetaphil Baby Soothing Moisturising Cream and Murad Vita-C Glycolic Serum. The Solved Skin Rapid Clear Facewash stays yellow (wording beyond a cosmetic claim). Nothing else changed. The owner chose not to run a further before-and-after on the old products.
- **Known trade-off:** the sections are more forgiving than the claim-by-claim check (Test transparency is Strong if any one performance claim has a clinical study), so a product with several unproven claims can now be green. The unproven claims remain visible under Gaps.
- **Not changed:** the five sections' own thresholds (green from 75, red under 45), the rules for blocks, gaps and medicines, the confidence rule, the stored standings, and `ANALYSER_APPROVED_BASELINE` (X1-approved-2026-10-28).
- **Undo:** revert the merge commit of this change. Nothing is migrated and no stored analysis is touched: colours are worked out when a page is drawn.

### 2026-10-30: Browse products is /products and Browse brands is /brands; every "analyse a product" link goes to /products
- **Decided by:** the owner: a Brand Intelligence Directory ("Browse brands") separate from the product list ("Browse products"), built in pull request 45. No quotation was kept, so none is given here.
- **Reason:** `/brands` is now the brand directory (a card per brand, then a profile per brand), so a link whose words are "Analyse a product", "Check a product" or "Back to all products" would land on a page that has no product list and no analyser box. The product list, its search, filters, Compare and the "Analyse any product, free" box are at `/products`.
- **What it touched (links and wording only):** the compare page and `CompareView` ("Back to product analyses", "Product analyses", "Compare something else") now go to `/products` (`/products#registry`); every "analyse a product" call to action in `blog-posts.ts` (20), the blog index, the learn guides, About, the ingredient pages, the home closing call to action, `/verify`, the `/analyser` and `/analyzer` fallbacks, and the home FAQ now go to `/products`. The product page's breadcrumb data (`src/app/analysis/[slug]/page.tsx`) names `/products`, not `/brands`, as "Product Analyses". "Reviews" became "analyses" in the /brands and /products titles and text. On the product page, "Back to all products" (shown when the brand has no brand page), the hero's Compare button and the unrated page's "Browse the products we have analysed" now go to `/products`; `/products` is in the sitemap and `llms.txt`. `/brands` and `/products` each show a plain empty state when no product has been analysed (the `/brands` opening line no longer prints "0 covered brands"; a brand profile with no products is a 404, as before).
- **Not changed:** which colour or pill any product gets, the decision core, stored analyses, `/analysis/<slug>` URLs, the product page's breadcrumb "Brands" link, which still goes to `/brands` (it means the brand directory); the brand profile pages are not yet in the sitemap. Nothing is written to the database.
- **Undo:** revert the change; no migration.

### 2026-10-30: Every stored analysis was removed, and each new analysis now reaches every page that shows analyses
- **Decided by:** the owner, on 2026-10-30, in chat: "I need all the products on the website deleted ... I will do fresh reviews from the analyser tool only. But I need the supabase data of the earlier analysis to be saved, so I can rerun them later." Asked what that covered, they answered: "All analysed products, all products present in the DB to be deleted." The Brand Intelligence tables were to be left alone. Then: "whatever new products are added: create a flow. Add to matching ingredients; add to brands page & their products; add to filters on the left; add to the total number of analysed products displayed on top; add to home page up to 5 products, once enough products are there I will choose which products to display on home page."
- **Reason:** in the owner's words above: the site is to be rebuilt from fresh runs of the analyser.
- **What was removed (production, project the-clean-sheet, 2026-10-30):** all 322 rows of `public.product_reviews` (226 brands), by `DELETE ... WHERE reviewed_at <= '2026-10-30T08:13:56Z'`, after two identical, verified exports of the whole table (322 rows, SHA-256 `0ce7b03f0cf721c3...`) were saved on the owner's Mac, outside the repository. The table, its columns and its security rules stay. Nothing else was deleted: the Brand Intelligence tables (`brand_intelligence`, `brand_manufacturer_records`, `brand_reddit_sentiment`), `brands` and `ingredients` are as they were. Every `/analysis/<slug>` page now says not found, the product list, the compare page and the counter are empty, and the sitemap shrinks when it next refreshes.
- **What the flow does (display and caching only):** when an analysis is saved, `src/lib/site-refresh.ts` refreshes the home page, `/products`, `/brands`, every brand page, every ingredient page, the product's own page and the reviews sitemap at once, instead of only `/brands` (the page cache is five minutes). Ingredient pages now list the analysed products that contain the ingredient, read from the stored analyses (`src/lib/ingredient-product-index.ts`, kept for two minutes and shared by the pages), with a rating circle and a link to the product's page; before, they read the removed hand-written catalogue and so listed nothing. The home page shows up to five products: the slugs in `src/data/home-picks.ts` when the owner has chosen any, otherwise the newest analyses. The list starts empty, so each new analysis appears on its own until the owner picks. The product list's filters, the "products analysed" figure and the brand directory already read the stored analyses, so a new analysis joins them without a change; `src/lib/new-analysis-flow.test.ts` proves it with one new product.
- **Not changed:** how any analysis is made or rated, the decision core, the prompts, the rules, and the Brand Intelligence data.
- **Undo:** the data can be put back from the saved exports (`scripts/export-product-reviews.mts` makes them; main has no restore script, it exists only on the old `feat/analyser-verifier` branch, and rebuilding through the analyser spends model credits). The code change can be reverted; nothing is migrated.

### 2026-10-29: Products are compared only with products of the same type, and a comparison page gives a pick
- **Decided by:** the owner, on 2026-10-29, in chat: "comparison should only be possible within the same category - like a sunscreen should be able to be compared with only a sunscreen and so on", then "use the available info on each product page and create product comparison and offer a suggestion - which to pick?" and, once they had seen it on localhost, "let's make it live".
- **Reason:** in the owner's words above. The old overlay compared on pillars and warning badges that the /brands list does not carry for a stored analysis, so most products read "Not enough data", and it allowed a sunscreen to be set beside a shampoo.
- **What it touched (display only):** the compare button and bar on /brands (`BrandsMarketplace.tsx`, `MarketCard.tsx`, new `CompareTray`): the first product picked sets the type, and a product of another type is refused with the reason shown. A new page, `/compare?items=slug,slug` (two to four products, not indexed), checks the rule again on the server and draws the products side by side with a pick. The type is the /brands "Product type", made finer for Hair care, Body & bath, Makeup and Eye care (`src/lib/compare-group.ts`); a product whose type is not filed is never compared. The facts are the product page's own model (`src/lib/compare-facts.ts` reads `pillsFor`, or `layoutFor` while the pills page is off), so a comparison says nothing its product page does not. Price per ml or g is worked out from the lowest price and the pack size.
- **How the pick is made (`src/lib/compare-products.ts`):** first difference wins, in this order: the pill (Good choice, Buy with caution, Look elsewhere), the ingredient safety row, the total of the five rated rows, ticks minus crosses, confidence, then the lower price per unit. A product that is Not enough info or a Medicinal product is never picked or ranked, and the page says so. A pick that is only Buy with caution says it is the better of the two, not an all-clear. A cheaper product with the same pill as the pick is offered as the value choice.
- **Not changed:** which pill or colour any product gets, the decision core, stored analyses, the product pages. Nothing is written to the database.
- **Left in place, now unused:** `ComparisonDecisionEngine.tsx` and `ComparisonTray.tsx` in `src/components/scorecards/` (the old overlay's "concern type", "formulation quality" and "use caution" read-outs are no longer shown anywhere). They sit in a folder the analyser reference fingerprints, so deleting them is a separate step.
- **Undo:** revert the change. Nothing is migrated.

### 2026-10-29: "Protects against ..." claims need a test, and an unchecked "free from" claim beside the entry it excludes is a caution
- **Decided by:** the owner, on 2026-10-29. They asked about Aveda Botanical Repair Shampoo, "How it this green? What is the logic?", were shown that the page's own text called its "synthetic fragrance-free" claim misleading and showed a crossed "Fragrance free" chip beside a Green rating, and answered "Yes, fix it" to a proposal to close the two gaps that let that happen.
- **Reason:** two gaps, each reproduced on the stored analysis. (1) The wording list that decides which claims need proof had "repairs" and "prevents" but not "protects ... against / from", so "Protects hair against heat damage up to 450F & from UV" (level 1, one retailer) was treated as routine and never raised the claim-gap caution. (2) A "free from" claim contradicts the list only through `block.contradicted`, which needs a claim whose source quote was verified; 23 of 5,365 stored claims are, so "Synthetic fragrance-free" beside "Fragrance (Parfum)" was invisible to the rating.
- **What it touched:** `src/lib/analyser-x/ladder.ts`: `PERFORMANCE_RE` also matches "protects / shields / defends / guards ... against / from" and "protection against / from"; "protects" on its own does not. `src/lib/analyser-x/claimflags.ts` and `rules.ts`: new rule `caution.free_from_unverified` (35 named rules, was 34). It fires only when the list is reliable and a claim typed free-from, never checked (corroborated unknown), is an exclusion statement (starts "free from / without / no / zero" or ends "-free", at most 90 characters) and the list holds an entry it excludes, ignoring any list entry that itself says "free". It is a caution, never a block, and it says the claim is unchecked, never that it is false. A verified claim is still a block and is not also counted. `copy.ts` has its sentence, and `pills-page.ts` lists "Proof that ... holds" under Gaps.
- **Measured** on all 317 stored analyses, before and after (nothing rerun, no model call): Green 21 to 19, Yellow 123 to 125, Red 2 and Grey 171 unchanged. Two products moved, both Green to Yellow: Aveda Botanical Repair Shampoo (both rules apply) and Yuderma Eclipse Solaire SPF 50 ("Protects from UVA/UVB/Blue Light", level 1). The new caution also appears on six products that were already Yellow, each a real conflict in the list: Anua "No Fragrance." with Fragrance; Beardo "Free from Parabens, Silicones, Mineral Oil, and Sulphates" with Sodium Laureth Sulfate; Davines "Paraben-free" with Methylparaben; Kenra "Sulfate-free" with Sodium Laureth Sulfate; Milk shake "Sulfate-free." with Ammonium Lauryl Sulfate; Venusia "Hypoallergenic and paraben-free" with Propyl Paraben. A first, looser version also fired on CodeSkin's "Only Zinc oxide and no hidden chemical filters in a silicon-based gel" (a sentence that mentions the ingredient, not an exclusion); the exclusion-statement test was added for that.
- **Not changed:** the owner's earlier decision of the same day that a "% of users" figure never moves the pill (the entry below; "95% of women say ..." is the same kind of figure, so it was deliberately not made clinical wording), the clinical wording, every threshold, the confidence figure, the screen-coverage rule, the pill precedence, and every stored analysis. The colour is worked out each time the page is built, so no row is rewritten; a page shows its new colour when it is next built.
- **Known limit:** whether "Fragrance (Parfum)" is synthetic is not something the list says, so a "synthetic fragrance-free" claim gets a caution and not a block. The rule is deliberately narrow: of 628 unchecked free-from claims on the 278 stored products that have a list, 533 read as exclusion statements and 18 conflict with their list (seven products); claims phrased as longer sentences are not read.
- **Undo:** revert the change. Nothing is migrated.

### 2026-10-29: A "% of users" figure is a survey result: it is listed as a gap and never moves the colour
- **Decided by:** the owner, on 2026-10-29. The decision is written in the code (`isUserPercentage`, `note.user_percentage`) and in pull request 44; no quotation was kept, so none is given here.
- **Reason:** a figure such as "95% of users felt ..." says how people said they felt, not what a test measured, so it should not be held to the clinical bar that a measured result is.
- **What it touched:** `src/lib/analyser-x/ladder.ts`: `isUserPercentage` recognises "N% of users", "of consumers", "of customers" or "of people", unless the same text also says clinically proven, a clinical study, an "N% reduction" or "of participants". `src/lib/analyser-x/rules.ts`: `needsProof` ignores such a figure, so it neither raises `caution.claim_gap` nor counts against `support.claims_proportionate`. A new note, `note.user_percentage`, appears when no sample size, duration or method is public for it (an evidence level below 6), and `pills-page.ts` lists it under Gaps as "The test details (sample size, duration, method) behind ...". A note never moves the colour.
- **Measured** (pull request 44, read-only, on the 317 stored analyses then): four analyses carry the new note (Cetaphil, Moroccanoil Purple Hair Oil, Eucerin Hyaluron Filler Night Cream, MCaffeine Coffee Body Lotion); one pill moved, Cetaphil Gentle Skin Cleanser from Buy with caution to Good choice; no confidence level changed.
- **Not changed:** "% of participants", a measured change ("30% reduction") and any figure that also says "clinically proven" or "clinical study" still count as before. A survey figure worded with other nouns ("95% of women say ...") is not recognised as a "% of users" figure, so it gets no Gaps line; it also needs no proof, so it moves nothing.
- **Undo:** revert the merge of pull request 44 (it also holds the next entry), or remove `isUserPercentage` from `needsProof`. Nothing is migrated.

### 2026-10-29: A clear ingredient screen stays Strong when at least half the list was checked
- **Decided by:** the owner, on 2026-10-29. The decision is written in the code (`pills-page.ts`, the "Ingredient safety" row) and in pull request 44; no quotation was kept, so none is given here.
- **Reason:** an ingredient our reference file does not hold ("Water" for Aqua; the signed-off alias is still behind `ANALYSER_INGREDIENT_ALIASES`, which stays off) says nothing about the product, and coverage is a fact about our reference file, not about the product (decision X42). It should not turn a clear screen to Fair.
- **What it touched:** `src/lib/pills-page.ts`: the "Ingredient safety" row stays Strong when `support.safety_clear` holds and at least half the list was checked (`MIN_SCREEN_COVERAGE`, 0.5). Below half it stays Fair, matching the Low confidence. The coverage sentence stays out of the row (an existing test bars reference-data wording there) and is shown in Gaps and in the confidence line.
- **Measured** (pull request 44): Cetaphil Gentle Skin Cleanser's Ingredient safety row went from Fair to Strong. The row never moves the pill and no confidence level changed.
- **Not changed:** the pill, the confidence rule, the alias flag, and `ANALYSER_APPROVED_BASELINE` (X1-approved-2026-10-28).
- **Undo:** revert the merge of pull request 44. Nothing is migrated.

### 2026-10-29: The rating on a product page names its colour, and the page carries a key to the four ratings
- **Decided by:** the owner, on 2026-10-29, by sharing a design called "The Clean Sheet Rating" (four colour tiles with a one-line meaning each) and asking for it to replace the ratings badge and to be added as a section. They then said the first attempt, on the old standing-based page, was the wrong page and asked for it on the latest X1 output. No reason beyond the design was given.
- **Reason:** none recorded in the owner's words. The design reads: Green "Meets our standards with no major concerns.", Yellow "Some concerns found. Review findings before purchase.", Red "Major concerns identified. Not recommended.", Grey "Not rated. We haven't assigned a rating yet." Footnote: "Grey means we haven't assigned a rating. It does not mean the product is unsafe." Link: "How our ratings work" (the owner later replaced the words with "Want to read about our standard?").
- **What it touched (display only):** the take card at the top of the X1 product page (`PillTake` in `src/components/scorecards/pills-ui.tsx`, `pills-badge.css`) now prints its colour's name and that colour's meaning beside the circle. Before, it printed the circle and the line "Green, yellow or red. Grey means not rated." and no name. A new key card, `src/components/scorecards/RatingKey.tsx`, the owner's design set very small (small print, not a section to read), sits at the very end of every product analysis page (just above the closing note), and nowhere else (the owner said it is not wanted on the home page); its link reads "Want to read about our standard?" and goes to `/standard`. The owner asked for the small size, the end placement and that link text after first seeing a large card in the middle of the page, and later said it is not required on the home page. The words live once, in `RATING_KEY` in `src/components/scorecards/pill-palette.ts`, so the badge and the key cannot disagree. `RatingDot` gained a `decorative` option so a circle beside its own name is not read twice.
- **Not changed:** which colour a product gets. The decision core, the pill for each product, the pill-to-colour mapping, the circle colours (the X1 palette, not the teal in the shared mock), the page's title, description and structured data, and every stored analysis. The five pill names, the old standing names and any confidence figure are still not drawn on the page. The old standing-based product page, its badge and the analyser's standing names are untouched. The owner's own Red line contains the words "Not recommended".
- **Undo:** revert the change. Nothing is migrated.

### 2026-10-29: A brand page the first lookup was shown is judged again once the brand is known; a field printed as a data dump is read as text
- **Decided by:** the owner, on 2026-10-29, after a shopper's search for Juicy Chemistry's under-eye cream was saved with no ingredients although the brand's own page lists them. The owner added the Firecrawl key to the production environment and asked for the code change.
- **Reason:** three separate causes, reproduced one by one. (1) Production had no `FIRECRAWL_API_KEY`, and Google search there is refused, so page discovery returned nothing (fixed by the owner in the environment, not in code). (2) A search typed as a name guesses the brand from its first word, so the brand's own page failed the brand check ("Juicy" against juicychemistry.com): the model proposed exactly the right page and the check threw it away, and the second lookup, once the brand was known, had the model switched off. (3) The page prints its ingredient field as a hidden data dump (`{"type"=>"root", ...}`); the extractor dropped the first entry, glued to the prose before the field, and the last, merged with the footnote line after it, so 12 of 14 came back.
- **What it touched:** `src/lib/brand-inci.ts` adds `recordCandidates` and `withKnownCandidates`. `src/lib/product-review-engine.ts` remembers every page the first lookup was shown (search results and the model's proposals) and offers them to the second lookup, which judges them again under the brand the model identified. `src/lib/inci-from-page.ts` adds `flattenRichTextDumps`: a rich-text dump is replaced by the text it holds, and each paragraph and the field as a whole are set off by commas, the boundary the list reader already splits on.
- **Cost:** none. No extra search call and no extra model call; the second lookup re-reads pages already seen.
- **Not changed:** the brand-domain rule (a page must still sit on the brand's own domain), the product-title match, the captured quotation, the list sanity check, the source policy (brand page or INKEE Decoder), and stored analyses. The Juicy Chemistry page stays as saved until it is refreshed.
- **Undo:** revert the change. Nothing is migrated.

### 2026-10-28: Repair accented exact-product lookup and reconcile missing-ingredient statements
- **Decided by:** the owner, approving this change on 2026-10-28 after reviewing the baseline diff (no quotation recorded).
- **Reason:** an ASCII retailer name did not exactly match its accented Decoder name, while model text claimed a complete ingredient list despite no retained ingredients.
- **What it touched:** Unicode-normalised exact product matching; exact matches cannot substitute nearby variants; brand-domain matching recognises accents; ingredient-free saved/fresh analyses show evidence-pending statements rather than full-INCI claims; searches retry explicitly empty saved analyses. The corrected lookup retrieves 57 quoted ingredients for the crème, distinct from Soft Creme.
- **Undo:** revert the corrective release. Existing rows can be restored from their pre-refresh backups.

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

### 2026-10-28: A live search is retried when its answer had no web search, and is never turned into an error
- **Decided by:** the owner. First: “Yes, live searches should use the same checks.” Then, shown that the full set of checks would refuse most new searches for want of a primary-source ingredient list, “B”: keep the retry and the web-search refusal, but still save a grey page when no primary list is found. Then, before this was released, the owner withdrew the refusal: a shopper must never be shown “try again”. The retry stays; the refusal does not.
- **Reason:** a product searched live and the same product re-run should be held to the same standard where that can be done without a shopper meeting an error. A web-less answer is improved by asking again, which the shopper never sees; if every try is still without a web search, a page with the gap recorded is better for the shopper than an error, and the re-run can replace it later.
- **What it touched:** `src/lib/review-checks.ts` (new) is the one definition of the four checks the re-run applies to a replacement (a list from a Decoder or brand page with its source quote, a list that is not mostly junk, a web search behind the review). `runProductReview` asks a model call that came back without a web search again, up to twice, unless 75 of the request's 180 seconds have gone. Whatever the last try returns is kept: an analysis still without a web search is stored and shown as before, with `researchLog.grounded` false. A live search refuses nothing, so `/api/review` never answers with an error for this and the engine has no `unverified` result. A product with no primary-source list is analysed and saved as before, with no ingredient list and the gap showing. The checks stay in the re-run script, which protects a good page from being replaced by a worse one and still requires a web search before it replaces one.
- **Effect to expect:** more live answers are grounded, because a web-less first answer is asked again. How often that is needed varies: 15 of 301 pages stored before today have no web search recorded, the earlier pilot re-run (before the primary-source change) saw 6 of 9 decided pages come back without one, and the current re-run needed a second attempt for 1 of 13. Each retry is one more grounded model call, and up to 75 seconds of the request can be spent waiting for one. A page that is still web-less is saved, as it was before this change.
- **Not changed:** the baseline identifier `X1-approved-2026-10-28`, which changes only with the owner's approval; existing stored pages; the re-run script.
- **Undo:** revert the change. Setting `GROUNDING_RETRIES` to 0 turns off the retry alone. Nothing is migrated.

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

Corrective release (28 October): exact matching normalises accents and punctuation; an exact product match is not replaced by a nearby variant. Explicitly empty saved analyses are retried on search. When no list is retained, model claims of full INCI, source names, formula assessment and ingredient-based suitability are reconciled in both fresh storage and page rendering.

Added 1 November 2026 (see the decision log entry of that date):

- **A list the owner typed in from the pack** (`src/data/inci/owner-supplied.ts`, `src/lib/owner-supplied-inci.ts`) stands in only when Decoder, the brand's page and Nykaa found no list. The entry carries the list verbatim as printed, a brand-page or Decoder URL that shows the product, the date and where it was read; it is matched on brand and exact product name; it is recorded at capture trust 3 with origin `owner-supplied`. Never add a list from memory, a retailer or a model.
- **A brand's own name for a product.** A brand-domain page whose title fails the name check is still read when the brand's Shopify product feed shows exactly one product that is clearly the one asked for (`src/lib/brand-catalogue.ts`). It must still carry a captured quote and a sane list.
- **Not built:** accepting a retailer list when two retailers agree. It relaxes the 28 October rule and waits on a measurement.

## 11. Approved source fingerprints

CI compares these SHA-256 fingerprints with the source. Any change in these files requires regenerating this reference and reviewing the change against the approved baseline in docs/ANALYSER-APPROVED.md.

| Source | SHA-256 |
|---|---|
| `next.config.ts` | `f1b36965c1c6a905daeb95ba48f790d30dd1d24969a56a86b1cddc060daa3d7a` |
| `src/app/analysis/[slug]/page.tsx` | `bd7043283022923cf2e80a9f8cad2e0fe7c7467f7f5e31f7d86b18b2073b2dc2` |
| `src/app/api/analyser-version/route.ts` | `e06baf28af49551cf0311a05a2c6688bc13d174c2eed7f653b4f29b6a20bfa24` |
| `src/app/api/review/route.ts` | `21af87b8f3470d9c9fac3fc7add64d4de7cac23269a417f393479b1e850c3b78` |
| `src/components/scorecards/AnalysisProductImage.tsx` | `a7e725c25a71ed0d1413ad28a8cdec40ab992e8bd56910bd287933ad7fce415c` |
| `src/components/scorecards/BadgeGroup.tsx` | `cd862de9f3f75787f1d3f2e712d4b919bab723c5efe0a8db5251d6266dbbea9d` |
| `src/components/scorecards/BrandProductCard.tsx` | `285869cee38fa65fe35206a191e98836056de2d0f0cb406a6abc0aaddd27ed4e` |
| `src/components/scorecards/ComparisonDecisionEngine.tsx` | `6139d1265902406cce1685472da73cc3e0d270aa82e41353b64d415396ac2a6d` |
| `src/components/scorecards/ComparisonTray.tsx` | `ca8914e8e41ba1990f7f84a0d18f84752b20bc34d3d7ebbf4e2333e5ab40ec8f` |
| `src/components/scorecards/ExpandableSection.tsx` | `dd553925b054f38f0062ee661dd02fb8053ad01d5bb5c9cef690bb23ad19880c` |
| `src/components/scorecards/HeroActions.tsx` | `a43e86f016df7511e283bb06c3cb83575064208bf66fa65f97154c81ba09b376` |
| `src/components/scorecards/NoResultsCard.tsx` | `77ee1bd923ed3c7be68e21a9e6642d0e098d0141a7a2ae3a80881079dff11602` |
| `src/components/scorecards/OpenDetailsLink.tsx` | `f9dac41601b9eaba78453a49899d66581e2cc0ef8b823cafd75773aca0925b74` |
| `src/components/scorecards/PillsHero.tsx` | `9590d9d05eb27743211ab31ccf1432d488515824e560378ed7aad252c304501a` |
| `src/components/scorecards/PillsPage.tsx` | `05c16a0f857d0ce8a4b08699d56f92d0833d9a8f6a554231f0451e24969aefad` |
| `src/components/scorecards/ProductComparisonTable.tsx` | `9d6c78f2ac60d01947e389af98bab286348c54b47d0a4e6ac536268c0c1f3744` |
| `src/components/scorecards/ProductHero.tsx` | `17c0ae64d4adc5cfb097e29060224d3887f22ed2315d7e945651d17978537aa9` |
| `src/components/scorecards/ProductRequestForm.tsx` | `076774b2d0c0d11cfd419dc064d49fec96b843cc4317471347891e0b347ce009` |
| `src/components/scorecards/ProductScorecardView.tsx` | `1e68db79e07c012e947cbe765093ae88910ddcd0b284800ac07611d8c7f7d49e` |
| `src/components/scorecards/RatingDot.tsx` | `38db0a7ece065f964f9c9919171b5b3ae794e6c58dea91999136191301cd02d1` |
| `src/components/scorecards/RatingKey.tsx` | `7b4066f9a080e9d74b2f6c1ca260c2848749bc9054fd4218f505a786c0832014` |
| `src/components/scorecards/ReviewRunStatus.tsx` | `95d31a0a4d27e50d3019edfbc4642be92586bd3c547a1d1ebeea014bbd723d3e` |
| `src/components/scorecards/ScoreRing.tsx` | `70d2f9e5c4e91493297c33f2f1991e5ea79a8992d4ade6e11d90febc319eefe5` |
| `src/components/scorecards/ScorecardBadge.tsx` | `ac3beafbed835890200c81e3d33fe0f6acf79436793e57cf774b1478771caade` |
| `src/components/scorecards/ScorecardTabs.tsx` | `5f642c36c562ec2c69545f91a116ecd5b620f1ffa2e3019048a5e4cb6566c72e` |
| `src/components/scorecards/TileChip.tsx` | `c02fe5b385ba58945bf45f1c973584b2c2138b132ad2ed53080e98ca1beac821` |
| `src/components/scorecards/UnratedNotice.tsx` | `e37cfac4ab9b9c55085cfabc16e72ce91004e9cf967eedcfad7ef4dbf1fc7b41` |
| `src/components/scorecards/UnratedProductPage.tsx` | `2fb73b2b15ba35be2cdd5129c8d242bf7712fd0962029a724e5f5656265a5a73` |
| `src/components/scorecards/pill-palette.ts` | `3f5d4ac105c7a2030033dc248c0df45680f16a3195a882337b0a6309c95f550f` |
| `src/components/scorecards/pillar-ui.tsx` | `ca2b0e633cdce5ea22eea0978c8508ee68fb267d5b070b84640a67f43507cf62` |
| `src/components/scorecards/pills-badge.css` | `a9d9db5c86be719ca43270e6a7ff741ae9f2b36e4b53e5f0c59a234a2ccdc592` |
| `src/components/scorecards/pills-page.css` | `2dc4a4f6d4059985581db18d9ac97c412c7723806df1436df4656fba4e8761f8` |
| `src/components/scorecards/pills-ui.tsx` | `c2d9b7b062e2c571f1fb286fe6f0a3b87760b36cafb4ec8dc7b0aeb7d47beecc` |
| `src/components/scorecards/useReviewRunner.ts` | `d57c76f9ab6d14c5104bd0707635a4f728ceb11b5063b4f9cacbda25313f535b` |
| `src/data/analysis/ingredient-risk.ts` | `165ef393f41952f539d1bac7f850007a94244650363989eed92720202753b43d` |
| `src/data/badges/taxonomy.ts` | `8c5ca46b0eb138650cfbb4dbdc9cb8fc2def5428890c1910087f19efa854d49b` |
| `src/data/ingredient-aliases.ts` | `d428faa6ba2be4f561581c0348566a158e605efb9476681d975a5c20e4f445b8` |
| `src/data/ingredients.json` | `ee6c6295f16a459d65b04d5f9f0014b9670ca95e235b05fec16f20daeb8d6a96` |
| `src/data/ingredients/claim-ontology.ts` | `c26f56943006af4a4daef5a1d2793d9fc425fbed86bbb38d35e15d977d08763f` |
| `src/data/ingredients/concepts.ts` | `2c709afb7b734c259f84b0e663020d79df00645264d35758f4960a7e227fa9a5` |
| `src/data/taxonomy/index.ts` | `c74f427f9b8fdb9dad017a24324fa6c7d0947f0f908ab6eeb7aff02bb296a602` |
| `src/data/taxonomy/schema.ts` | `fb804439e53cbe98a42070e409a5ea60d6e09f646b111bbe435de8c98c3cfd61` |
| `src/data/taxonomy/seed.ts` | `40164d44c39883af34ef462f46a0c54ee81e7e946c4747c17d14c2b0be69f3b0` |
| `src/lib/analyser-flags.ts` | `e30d68764914e89fb99cfbeef7bf3ebe342f020c6b9500a13af700571dfe5a06` |
| `src/lib/analyser-reference.ts` | `0bc7c45a1b12d0bcad694a16c147c01064e8e069af37838d8be0865782eb68c8` |
| `src/lib/analyser-x/adapter.ts` | `8eeac5cc53080cc8a860a87de3f9b8e123a4c1f9473534187411a435bcc5ca91` |
| `src/lib/analyser-x/claimflags.ts` | `bbd45bbc584599c679c5caaea06d3b815dc97cd9009b73a896c194d66afd5f92` |
| `src/lib/analyser-x/context.ts` | `72274e85c69bacd7b1c4b594de3e78c050c3c04ed2c77fff07ccd396a093e35d` |
| `src/lib/analyser-x/copy.ts` | `f1a40b600e3cf114a92a247ea39aa217364c4966de7b90f69181715a29412fef` |
| `src/lib/analyser-x/decision.ts` | `9c14136e12bb08816afdfa124e1cb803c42266e935a9fc71097a9018531b6e97` |
| `src/lib/analyser-x/factstore.ts` | `f67394c833a968e014500056739d04d3b03819d06808270fce2497db5667d1e9` |
| `src/lib/analyser-x/index.ts` | `9d5bcb0e3d6f924da02435031d81419e1120747c99af745f49f85ab30b41783d` |
| `src/lib/analyser-x/invariants.ts` | `0a5734c7383f629d214b1a505ae5cba6dff7bddab88e52f5fd7e21dd8259194a` |
| `src/lib/analyser-x/kb.ts` | `83b8b67415017755c0946f60e5ef35be719b824f140491170dd1da3a0283fe9c` |
| `src/lib/analyser-x/ladder.ts` | `592fda191f0c6781fc8558d27cc047ee103f755a2f0467e706ec5479eaaab0a1` |
| `src/lib/analyser-x/panel.ts` | `aa92c8ddd87c8cd26c65b2253fdcc751c98cd2187284e76494bb579116b6a635` |
| `src/lib/analyser-x/profile.ts` | `f0c1bcda47f50d751b0c2539b59481d417b831f9ff940e4e244cbfeaf5b6d4b0` |
| `src/lib/analyser-x/regulatory.ts` | `4e006566a4038a218476bde4424d7f7ce165ae1258230cc3be26b2f25c5726b8` |
| `src/lib/analyser-x/rules.ts` | `86e01b889d32d3bcc74b5b7ea1aace012536ca5e1872e6d3a3aa3c808fb88098` |
| `src/lib/analyser-x/screen.ts` | `f1b38f1fb3471f7f24c9f7b2a2683e84f8f01f25d190b32e1c46b10e25f1b1c0` |
| `src/lib/analyser-x/sections.ts` | `ed0bf952f885a0657a8f37880fadc1b50268e7d6b1884dc5576565ee21b99f32` |
| `src/lib/analyser-x/tags.ts` | `6f6aa00598785f7c036c60996369d438f142e10d7005bfeaaa60bfd75167973b` |
| `src/lib/analyser-x/test-helpers.ts` | `17da8d36981283a224627f933602aa341d14e77510b9440f6134067bd40f011a` |
| `src/lib/analyser-x/types.ts` | `16753986af9231b18fe0037a18b9444be733149606dbc9e2db3b4aa4e160ab7a` |
| `src/lib/analyser-x/verifier.ts` | `2aba0b3ec3b2b08f3ca4990e77c895802a63166bd2c8c84251c4ede6cd989c7c` |
| `src/lib/analyser-x/version.ts` | `f5420b59fae65a7f27e0a4156721f8b60f2b4ef46d3c2fd4ceb478d5a09072d2` |
| `src/lib/analysis-engine.ts` | `e424ed7b7ccd7f85afdaeca5be7fa497212524434e8831a8e853f1d5f7e62519` |
| `src/lib/analysis-types.ts` | `68b9913ed3febf24d683c43b7c1d7ab7c2474ca136edd437cc36171514db2b17` |
| `src/lib/analysis-wording.ts` | `e0212e3450a750e3be7852c351ca8de2f1ec677dbf9bdac7b477a7803f7d1324` |
| `src/lib/brand-inci.ts` | `a48f47abe0c5b4bd123bb6047ee059c96c80a3549b4e3bd05fa485a1c5a30941` |
| `src/lib/capture-evidence.ts` | `8257e6d83e6469a1528151042d196d402cf166713abc827a432d8fa332b949d1` |
| `src/lib/claim-evidence-display.ts` | `53f82f27429f2f993170b0105f9ad5fdc5cff95eea8f8027443c32ba286633ef` |
| `src/lib/claim-ontology.ts` | `3106538b8631e6ce7b26e88a8a6acae539edebb6f9e1b9c705333ed15ed193bd` |
| `src/lib/claim-source.ts` | `affea1c809828d7a8931d11f382bb624bc0ac00b5fcccc0115df6efddf8f7a29` |
| `src/lib/claims-context.ts` | `9fe1aa10c247220a8fba83c2458f421444b8d233708cc06d4a4ef2696add6b6f` |
| `src/lib/compliance-pillar.ts` | `c7a2c2a575d1e19548175e53bc716998a1e94135649bce8fd6e008134cc6b8a6` |
| `src/lib/drug-signals.ts` | `e4eba39275c9b08603e036d14fcf0d659ad4a7e75c342d9263b52863c76a63a0` |
| `src/lib/evidence-images.ts` | `3997d516c3a0f9d5d048edc929a1241d9aefb805ed9ad082449ae23896cbdbed` |
| `src/lib/fit-claims.ts` | `9757dde7e85691d1bf03570ada39c430e064de46b9c0907c958364760b316be4` |
| `src/lib/gemini.ts` | `800010027e49b589ca6e5813790bbc2e4c8919518c34ddcd8f2c4ecbb6815964` |
| `src/lib/inci-catchall.ts` | `c83855004cb4603bb90c1ba15e195352ff073742968998d444802778fb8e7254` |
| `src/lib/inci-cells.ts` | `8ff68b721a09998826d65a0ff2a0bcddd84f5f5897c7cb85d046ae394f9e4bae` |
| `src/lib/inci-enrich.ts` | `8c7f92cb0e365ccf12329b017603eee36eb3ddda8128b1fe214a9df37451e37c` |
| `src/lib/inci-fetch.ts` | `f0eacd30484ebc4eaa1f500a0f7a233426175c367f788c46b6764b792b24e4b7` |
| `src/lib/inci-from-page.ts` | `eb52b8b83bfe01d19cb3973dee6e6b56d53c69851be2c04526b5981a23430fcd` |
| `src/lib/inci-normalise.ts` | `fedca1cdfd008456cab57d9b0ad63401fe784a75fb98c1ed2f472f1b7f59014b` |
| `src/lib/inci-paste.ts` | `572f93f5cecdf44110e7ea5c7d925f6ebbcf310140c316025e9c7026274fd3ac` |
| `src/lib/inci-reanchor.ts` | `7759104be520335e9c78dc8d3a4d7295e2e30283d8e81a7d03cc13346334d13a` |
| `src/lib/inci-source-backing.ts` | `e0bc705232b25ed24714d6f0012e7271dc2c0d8fc2cefed707602d4b3d8d8814` |
| `src/lib/ingredient-canonical.ts` | `41ebe06c48c4c7e6c141019247acf2f45abd4060d4ea8c3fd030f9824b8404e9` |
| `src/lib/ingredient-concerns.ts` | `90e9d1ba0a11ca7f45d323da56d013aae0f5051bf2a0c7aecacc20c9c8eb8986` |
| `src/lib/ingredient-db.ts` | `1172509d23c12e59df5b3792e4520bb0669bc4807e45bdef5e1c117c4eb4fe7e` |
| `src/lib/ingredient-directory.ts` | `0c13119e0ecd730600e9112409dc86acf5f4140e73ac2a5bd5e9084aba28578a` |
| `src/lib/ingredient-intel.ts` | `e326d79922b4ff2d4e8133a4e1154c38208905a3ed68ed3b3b79b8826aa24598` |
| `src/lib/ingredient-product-index.ts` | `7edef7cea639ac4b9463092dd351b97dce5247ad5e0240be99834a12edfd0613` |
| `src/lib/ingredient-utils.ts` | `6e741947b8cc4a5f0e5bd58b0a471eb23356c38e11147ce6e70ecece8c3bd343` |
| `src/lib/listing-pill.ts` | `c996f63bf601fc20b37e88f84463e952cb6bcc6e6a011ff0472aed07fc410818` |
| `src/lib/nykaa-inci.ts` | `9c58530bb2805a53080cdeb7d44742950a2159786904c85a767d80c8d3316477` |
| `src/lib/owner-supplied-inci.ts` | `27904ab93e5cda3564c149eab948533249e2df9d288b8eacf9c7be7795bb62b3` |
| `src/lib/pillar-display.ts` | `39adb1db50a2f79f585ece4f07de70cbef438719da90e896e34fe39639ff6522` |
| `src/lib/pillar-grade.ts` | `f2c9800b6a463f45d86bc2e0be35f3ad0e9c43cfb140733bc599e369d44ad425` |
| `src/lib/pillar-standing.ts` | `4e0f84fc9b634df4b844c334360ef5924bd91b01cdb48d439e6c82ae8906845d` |
| `src/lib/pills-for-review.ts` | `8fa01b7a41a92ecd4708d60b614926d94d12f218a6528405be6556aa3c625ed0` |
| `src/lib/pills-page.ts` | `2a1a504e5b4215146223baa9321fc443e1021ef5896eb13e220760d69cb2474a` |
| `src/lib/pregnancy-screen.ts` | `2396f68741d3cefeba45646cf2a17ff2f848b50b6b1b07ce95ef3ce485542aed` |
| `src/lib/product-identity.ts` | `6b84f2ffc748cd468149bbcc1ba5b6212091b3e6a01a7935b8c3fc54fab3df25` |
| `src/lib/product-image.ts` | `14d91af7c6f23ef05e38d0f36a4f4c68529e69b15cd3df3a718f4718f029e6a0` |
| `src/lib/product-photo.ts` | `56129b74c9830a88a46e516e974a8935a64e0b26a23173b184636a06982cacfc` |
| `src/lib/product-review-context.ts` | `018eef7ebe1df71f3868f63bb3c17fc304fcd30c09f81591f0d89b68d471ec7a` |
| `src/lib/product-review-engine.ts` | `dd64819120a8a6e74cd2a4d40abe94bd0cbb0bcfb4eb9162e2510963abdd8b95` |
| `src/lib/product-review-types.ts` | `e0b8c9cb4b61897a308887e5b8693c680fbfff3c6c26c3df5c4cb583a485c641` |
| `src/lib/product-scope.ts` | `d5353ee2537c002562baf814972e1805d047dfdd4df45884d2ad6a047aee7290` |
| `src/lib/review-checks.ts` | `389273e88209c1d60b5d0ef5460844a70b59216d8a7440e8414cd0ee373da6f8` |
| `src/lib/review-engine.ts` | `34ecbe876898bebe0345a70d7daefe0a732456cfa617013783fe4c00c423d13c` |
| `src/lib/review-inci.ts` | `8490c3f2f2bf03dd643dadbe480f2f1fcb525dd96d6244b325225bc806f829a3` |
| `src/lib/review-ingredient-state.ts` | `136cf48bb84c167a24c6d94277109711bb03df5b82a3a0b922a8e80c493d80a6` |
| `src/lib/review-run.ts` | `1d19fad30908feec5547f5fc2018c7069fb04832684f65fa97b1e74e27e8989d` |
| `src/lib/review-to-scorecard.ts` | `0152e2132464eb32588b90d03b09da076fb32101458ce360ba45f7d7e4e8c60a` |
| `src/lib/review-verifier.fixtures.ts` | `33502127d9928cc7e1d952e6af1c3e66a4e583b34ef68cfd61f9a9a6ca1bf0ba` |
| `src/lib/review-verifier.ts` | `c6ef8e4517597306a379db26ac9370f27890aed9cb26d347e1a3762cae2be863` |
| `src/lib/review.fixtures.ts` | `b859d8feed2c4320cd50142a50b2e2d6fb646e8d8c07e1ed2796e830ca78fd12` |
| `src/lib/reviewer-audit.ts` | `d81b4706bc305e2afa82cb118f2c6df7e596054288ceefbf1e540f28b77a43dd` |
| `src/lib/scrape.ts` | `14ff3a9ebd3168117388fc305321926545f9a3ad2c186a0e8ddb5ecd659f192c` |
| `src/lib/text-negation.ts` | `4bc82eee3cb97ab35a439e588c5e9c05d4d2f59fc46e86490a18104c64cc790d` |
| `src/lib/unrated-kind.ts` | `425eb9ce2e45b4c57c2765165af9b909e3d334bc6e77bf0d6108e4ff53afaa74` |
| `src/lib/verdict-engine.ts` | `a8a3fc56e984540abb6a88fa6d9d95ff28bb32e86e1e4e41d9176e2a4a4074ae` |
| `src/lib/web-shopper-checks.ts` | `648e8b518771d73ca288d79b2c32452f9bdd942587927cd2a5540258b5fd5ec5` |
