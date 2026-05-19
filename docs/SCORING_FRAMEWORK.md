# The Clean Sheet - Internal Scoring Framework

> **Internal use only. Do not publish point breakdowns or sub-scores publicly.**
> Public scorecards show pillar names, performance bars, and qualitative notes only.
> All scores are calculated exclusively from publicly available data (INCI lists, brand claims, regulatory databases, peer-reviewed literature). Nothing is fabricated or assumed.

---

## Our Approach to Ingredient Assessment

The Clean Sheet does not use fear-based ingredient labels. We assess products through a structured evidence hierarchy:

1. What global regulations say
2. What toxicology says (SED/MoS methodology, SCCS opinions, peer-reviewed literature)
3. What the formula concentration shows (INCI position inference, professional methodology)
4. What the product format changes (leave-on vs rinse-off, penetration enhancer presence)
5. What the intended user needs
6. What testing evidence proves
7. What the brand is claiming

Every concern flagged in a scorecard is grounded in at least one of these layers. A concern raised only by a watchdog list, without regulatory action, peer-reviewed toxicology, or concentration evidence at cosmetic use levels, is not sufficient grounds for a warning on The Clean Sheet.

### Explicitly rejected concerns (never flag these)

- **Niacinamide + Vitamin C combination:** the niacin flush concern originates from 1960s chemistry requiring concentrated solutions, high temperatures, and extended reaction time. None of these conditions exist in a cosmetic product. At cosmetic use concentrations and temperatures, the nicotinic acid conversion is negligible. Current professional consensus (post-2021 literature): no peer-reviewed clinical evidence of adverse interaction at cosmetic concentrations. The real formulator concern is pH incompatibility: L-Ascorbic Acid requires pH below 3.5 while niacinamide works optimally at pH 5-7. If both are co-formulated in a single product at meaningful positions, note pH trade-off only. Stable vitamin C derivatives (EAA, ascorbyl glucoside, sodium ascorbyl phosphate) are fully compatible with niacinamide at all cosmetic pH ranges.
- **EWG Skin Deep as a primary source:** EWG scores are not peer-reviewed and do not use the SED/MoS methodology required by regulators. Do not cite EWG as a primary authority. Reference regulatory opinions (SCCS, ECHA) instead.
- **Phenoxyethanol as inherently concerning:** EU, India, and US compliant to 1%. pH-stable across the full cosmetic range (pKa ~8.1). Among the best-characterised single-agent preservatives available. Flag only when a preservative system gap exists.

---

## INCI Inference Methodology

### Legal basis

EU Regulation 1223/2009, Article 19(1)(g): ingredients must be listed in descending order of weight at the time of incorporation. **Ingredients at concentrations below 1% may be listed in any order after those at 1% or more.**

### What can legitimately be inferred from INCI order

**Above the 1% threshold (order is legally required):**

| INCI signal | Professional inference |
|---|---|
| Aqua (Water) as ingredient 1 | Aqueous-phase formula; microbial preservation required |
| Silicone first (dimethicone, cyclopentasiloxane) | Anhydrous silicone base; no free water; different preservation rules apply |
| Oil first, no Aqua | Anhydrous oil-phase formula; no microbial growth risk |
| Active ingredient before preservative | Active is likely above 1%; functional concentration confirmed |
| Active ingredient after phenoxyethanol or parabens | Active is likely below 1% |
| Carbomer present, no low-pH actives | Formula pH is 6.0-7.5; carbomers only gel above pH ~5.5 |
| Triethanolamine / aminomethyl propanol / sodium hydroxide | pH neutralized upward; final pH likely 6.5-7.5 |
| Citric acid + sodium citrate (buffer pair present together) | pH buffer system; likely 4.0-6.2 depending on ratio |
| Benzoic acid or sorbic acid as primary preservatives | Formula pH must be below 5.5 for these to function; see Preservative section |
| L-Ascorbic Acid at meaningful INCI position | pH is below 3.5; required for stability and transcutaneous activity |
| Ascorbyl glucoside, sodium ascorbyl phosphate, EAA | pH-stable vitamin C derivatives; compatible with pH 5-7 |

**The 1% boundary - how to identify it:**

The 1% line is roughly identifiable by the position of known low-use-rate ingredients: preservatives (phenoxyethanol typically 0.3-1.0%), chelators (EDTA typically 0.05-0.1%), colorants (CI numbers, typically 0.001-0.1%), and Parfum (typically 0.01-2%). Ingredients appearing after these anchors are likely below 1%.

**Below the 1% threshold:**

- No ordering is required; two sub-1% ingredients cannot be ranked against each other from INCI position alone.
- High-potency actives (retinol, peptides, growth factors, vitamin C derivatives, fragrance allergens) operate at 0.001-0.5%; their sub-1% INCI position does not disqualify efficacy or risk.
- Known low-use-rate ingredients (retinol, hyaluronidase, epidermal growth factor, ceramides) routinely appear deep in INCI lists and still deliver functional benefit.

**What cannot be inferred:**

- The exact concentration of any ingredient.
- The fatty acid composition of an oil from its INCI name alone (safflower oil can be oleic-dominant or linoleic-dominant depending on variant).
- The molecular weight of hyaluronic acid from "Sodium Hyaluronate" alone.
- Whether a citrus essential oil is bergapten-free (FCF) from the INCI name alone.
- Whether a penetration enhancer is present at its enhancing threshold concentration vs. a trace amount.

---

## Quantitative Safety Assessment: SED and MoS

The Clean Sheet uses the SCCS Notes of Guidance for the Testing of Cosmetic Ingredients and their Safety Evaluation, 12th revision (SCCS/1647/22, December 2023) as the definitive toxicological reference for safety evaluation methodology.

### Systemic Exposure Dose (SED)

The SED quantifies the internal (systemic) dose a consumer receives from using a cosmetic product containing an ingredient at a given concentration.

```
SED (mg/kg bw/day) = (A x C x DAp x F) / BW

A    = amount of product applied per application (g/application)
C    = ingredient concentration in the product (expressed as fraction, not %)
DAp  = dermal absorption fraction (proportion absorbed through intact skin)
F    = frequency of application (applications/day)
BW   = body weight (default 60 kg for adults)
```

**Default reference values (SCCS Table 3-1, 12th revision):**

| Parameter | Default value | Condition |
|---|---|---|
| Dermal absorption (DAp) | 0.50 (50%) | Conservative default when no measured in vitro or in vivo data exists |
| Body weight (BW) | 60 kg | Adult assessment |
| Application amounts (A) | Product-category specific | From SCCS exposure reference tables |

**Penetration enhancer modifier:** When a chemical penetration enhancer is identified in the INCI (see below), the default 50% DAp assumption is invalid for co-formulated actives. The full formulation matrix changes dermal absorption. Flag and require remeasurement or conservative adjustment.

### Margin of Safety (MoS)

```
MoS = NOAEL (or BMDL10) / SED

Pass threshold: MoS >= 100
```

The 100-fold threshold is composed of:
- 10x inter-species extrapolation (animal to human)
- 10x intra-species variation (human population variability)

**MoS below 100** means the ingredient is unsafe at that concentration in that product type without additional data to reduce the conservative DAp assumption or lower the formulation concentration.

**When to perform SED/MoS calculation:**

- Any ingredient at 80% or more of its EU Annex III regulatory maximum concentration
- Any ingredient co-formulated with an identified penetration enhancer at functional INCI position
- Any fragrance allergen approaching its 0.001% (leave-on) or 0.01% (rinse-off) declaration threshold
- Any UV filter approaching its EU Annex VI maximum

**Scorecard note rule:** Scorecard notes may state "within regulatory limits" for any ingredient whose regulatory limit was derived by SCCS using SED/MoS. Do not claim MoS compliance without performing the calculation.

---

## Score Tiers

| Score | Label | Description |
|---|---|---|
| 90-100 | Excellent | Exemplary formulation. No meaningful safety, transparency, or ethics concerns. |
| 75-89 | Good | Above-average. Minor gaps that do not materially affect safety or efficacy. |
| 60-74 | Fair | Acceptable but notable concerns consumers should be aware of. |
| Below 60 | Concern | Significant ingredient, transparency, or regulatory issues identified. |

---

## Scoring Architecture

The Clean Sheet score is the sum of four evaluated pillars, totalling 100 points.

**Layer 1 (Legal Compliance)** is a hard pass/fail gate evaluated before scoring begins. Any product containing an EU Annex II prohibited substance, an undisclosed fragrance allergen above threshold, or making drug claims without regulatory approval receives an automatic score of 0 regardless of pillar performance.

---

## Pillar 1 - Safety & Toxicity (50 points)

The highest-weighted pillar. Consumer safety is the non-negotiable foundation.

### A. Ingredient Hazard Assessment (25 pts)

Evaluated against SCCS opinions, EU Annex II/III/V, FDA 21 CFR, IARC classifications, and REACH SVHC candidate list.

- **Carcinogenicity** (5 pts): Any ingredient with IARC Group 1 or 2A/2B classification at cosmetic use concentrations? Cross-reference SCCS opinion where available. IARC classification alone does not disqualify; concentration and exposure route matter.
- **Mutagenicity/Genotoxicity** (5 pts): Any ingredient flagged under EU CMR categories or Ames test data at cosmetic use levels?
- **Reproductive & Developmental Toxicity** (5 pts): Evaluated per EU Regulation 1223/2009 Category 1A/1B/2 CMR substances. Retinoid products: mandatory pregnancy contraindication note regardless of score.
- **Endocrine Disruption** (5 pts): Evaluated against ECHA ED classifications (EATS framework), EU SVHC candidate list, and peer-reviewed in-vitro/in-vivo data.

  Current watchlist items requiring mandatory scoring notes:

  - **Benzophenone-3 (Oxybenzone):** ECHA formally classified as endocrine disruptor for human health (2025 classification). Denmark preparing formal CLP classification proposal for 2026. Active restriction process underway under EU 1223/2009 Article 15. Current EU limits: 6% face/hands, 2.2% body/sprays (Reg. 2022/1176). **Mandatory deduction applies regardless of concentration-limit compliance.** The ED classification is established; the restriction process is a matter of timing.
  - **Propylparaben / Butylparaben:** SCCS opinion states "some indications for potential endocrine effects" at currently permitted concentrations (max 0.19% individual). Safe at limits per current SCCS assessment. Minor deduction required; note required on scorecard.
  - **Methylparaben / Ethylparaben:** Estrogenic activity documented in vitro. SCCS confirmed safe at authorised limits (0.4% individual). Informational note appropriate; no scoring deduction at compliant concentrations.

- **Organ/Systemic Toxicity** (5 pts): Repeat-dose toxicity at cosmetic exposure levels per SCCS Guidance methodology.

### Paraben reference table

| Paraben | EU status | Max concentration | Scoring action |
|---|---|---|---|
| Methylparaben | Permitted | 0.4% individual; 0.8% total parabens | Info note for estrogenic activity; no deduction at compliant levels |
| Ethylparaben | Permitted | 0.4% individual | Same as methylparaben |
| Propylparaben | Permitted with limits | 0.19% individual (or combined with butylparaben) | Minor deduction for ED signal; mandatory note |
| Butylparaben | Permitted with limits | 0.19% (combined with propylparaben) | Same as propylparaben |
| Isopropylparaben | **Prohibited** | 0% | Auto-fail trigger |
| Isobutylparaben | **Prohibited** | 0% | Auto-fail trigger |
| Phenylparaben | **Prohibited** | 0% | Auto-fail trigger |
| Benzylparaben | **Prohibited** | 0% | Auto-fail trigger |
| Pentylparaben | **Prohibited** | 0% | Auto-fail trigger |

### B. Exposure Assessment (15 pts)

- **Product Type Factor** (5 pts): Leave-on products receive stricter evaluation than rinse-off. Overnight leave-on receives the highest scrutiny (8+ hours continuous contact). Treatment products (weekly peels, masks) evaluated at actual use frequency, not daily.
- **Concentration Limit Compliance** (5 pts): Evaluated against EU Annex III/V permitted concentrations, IFRA category limits for fragrance materials, and India BIS/CDSCO Schedule M.
- **Aggregate Daily Exposure** (5 pts): SED-based assessment. Any confirmed chemical penetration enhancer in the formula receives a mandatory deduction plus scorecard note.

### Penetration Enhancer Modifier

When any of the following are identified at a meaningful INCI position (above the inferred 1% threshold, or at positions consistent with functional use), the Aggregate Daily Exposure sub-score receives a mandatory deduction and a scorecard note is required. The rationale: the SCCS Notes of Guidance 12th revision state explicitly that when chemical penetration enhancers are co-formulated, the default 50% dermal absorption assumption cannot be applied to co-formulated actives; the full formulation matrix must be assessed.

| Ingredient (INCI name) | Enhancement profile | Threshold of concern |
|---|---|---|
| Dimethyl Isosorbide | Broad-spectrum: lipophilic and hydrophilic actives; bifunctional solvent | Functional at 1-10% |
| Ethoxydiglycol (Transcutol) | Strong: reduces stratum corneum diffusional resistance; increases thermodynamic activity of co-formulated actives | Functional at 1-10% |
| Propylene Glycol | Moderate at >5%; significant at >20%; intercalates into SC lipid bilayers | Above 5% indicated by INCI position |
| Olea Europaea (Olive) Fruit Oil | Oleic acid (~70-80%) disrupts ceramide bilayers; also comedogenicity concern | Above 1% INCI position |
| Prunus Amygdalus Dulcis (Sweet Almond) Oil | Oleic acid (~65-75%); same mechanism as olive oil | Above 1% INCI position |
| Alcohol Denat. / Ethanol | >20%: measurable enhancement; >40%: stratum corneum extraction and barrier disruption | Above ~20% indicated |

**Scoring rule:** Any ingredient for which MoS is being evaluated (fragrance allergen at threshold, restricted preservative, UV filter approaching limit) must have its DAp assumption explicitly flagged as potentially underestimated when a CPE is co-formulated.

### C. Sensitisation & Irritation (10 pts)

- **Skin Sensitisation Potential** (5 pts): Evaluated against ECHA classification, LLNA (Local Lymph Node Assay) data, and published contact dermatitis literature.

  **Fragrance allergen assessment (updated per EU Regulation 2023/1545):**

  EU Regulation 2023/1545 (published July 2023; compliance deadline July 31, 2026) expanded the mandatory named allergen declaration list from 26 substances to over 80 individual fragrance allergens.

  Declaration thresholds (unchanged in principle, applied to expanded list):
  - Leave-on products: 0.001% (10 ppm)
  - Rinse-off products: 0.01% (100 ppm)

  **INCI reading protocol:**

  | INCI signal | Assessment |
  |---|---|
  | "Parfum" alone, no allergens named, leave-on product | Flag: cannot confirm allergen-free status under expanded 2023/1545 list. Note: "Allergen status not confirmed under EU 2023/1545 expanded list." |
  | Named allergens listed individually after Parfum | Evidence brand is actively disclosing; credit appropriately under INCI Disclosure sub-score |
  | Essential oil in INCI without stated allergen content | Assess known allergen profile: Citrus Aurantium Bergamia (bergapten unless FCF stated); Linalool, Limonene must be declared if above threshold |
  | Full allergen INCI disclosure per 2023/1545 | Full transparency credit (2 pts under Pillar 3) |

  **Important note on Parfum and auto-fail:** "Parfum" alone in a leave-on product is NOT an automatic fail. It is flagged as unconfirmed allergen status. Auto-fail requires confirmed allergens above threshold, not mere absence of disclosure.

- **Eye Irritation Potential** (3 pts): Evaluated for periocular products and products likely to reach the eye.
- **Respiratory Irritation** (2 pts): Evaluated for spray and aerosol products only.

### Auto-Fail Triggers (Layer 1)

Any of the following zeroes the score:
- Ingredient banned under EU Annex II
- SVHC above 0.1% w/w without exemption
- Confirmed undisclosed fragrance allergens above regulatory threshold (0.001% leave-on / 0.01% rinse-off)
- IFRA standard exceeded for product category
- Formaldehyde-releasing preservative in a baby or children's product
- Any prohibited paraben: isopropylparaben, isobutylparaben, phenylparaben, benzylparaben, or pentylparaben

---

## Pillar 2 - Formulation Quality (20 points)

Evaluates whether the formula is well-designed, stable, and substantiated. **Scored exclusively from publicly available information.** No score is assigned for data not publicly verifiable.

### A. Claim Substantiation (8 pts)

- **Evidence exists for key claims** (4 pts): Published in-vivo or in-vitro evidence for the primary claim at the concentration indicated by INCI position? Evidence at cosmetically relevant concentrations, not only at pharmaceutical concentrations.
- **Evidence from credible sources** (3 pts): SCCS opinions, Cochrane reviews, British Journal of Dermatology, JAAD, Journal of Cosmetic Dermatology, peer-reviewed pharmacology journals. Not brand whitepapers or in-house studies without independent replication.
- **Formulation logic supports claims** (1 pt): Does INCI position order place key actives at functional concentrations? An ingredient claimed as the hero active but appearing after preservatives is sub-1% - assess whether the evidence supports efficacy at that level.

### B. Formulation Stability (6 pts)

- **Microbiological stability** (2 pts): Is the preservative system adequate for the formula's pH and water activity?

  **Preservative system assessment methodology:**

  For organic acid preservatives, the active antimicrobial species is the undissociated acid form. Only the undissociated form crosses microbial cell membranes and disrupts internal pH. The Henderson-Hasselbalch equation governs the effective fraction:

  ```
  % undissociated = 100 / (1 + 10^(pH - pKa))
  ```

  **Preservative pKa and effective pH range:**

  | Preservative | pKa | Effective range | At pH 6: undissociated fraction |
  |---|---|---|---|
  | Benzoic acid / Sodium benzoate | 4.2 | pH below 5.0 | ~1.6% |
  | Sorbic acid / Potassium sorbate | 4.76 | pH below 5.5 | ~5.5% |
  | Dehydroacetic acid | 4.68 | pH below 5.5 | ~4.8% |
  | Phenoxyethanol | ~8.1 | pH 3-8 (format-flexible) | ~99% active |
  | Methylparaben / Ethylparaben | ~8.1-8.5 | pH 3-8 | Largely non-ionizing |

  **Preservative-pH mismatch (flag and deduct):** A formula containing benzoic acid or sorbic acid as the primary preservatives but also containing carbomer plus an amine neutralizer (implying pH 6.5-7.5) has a pH-preservative mismatch. At that pH, less than 2% of the benzoate/sorbate is in the active undissociated form. This is a professionally identifiable formulation weakness that warrants a Microbiological Stability deduction.

  **Chelator assessment for gram-negative coverage:**

  Gram-negative bacteria (Pseudomonas aeruginosa, E. coli) have an outer membrane lipopolysaccharide layer that limits preservative penetration. Chelators destabilize this membrane by binding Mg2+ and Ca2+ ions:
  - Disodium EDTA / Tetrasodium EDTA: most effective; used at 0.05-0.1%
  - Phytic acid (IP6): natural chelator; used at 0.1-0.5%
  - Citric acid: mild chelation plus acidification (effective only at pH below 5)

  A water-based formula preserved with weak organic acids (benzoate, sorbate) but **no chelator** has a gram-negative vulnerability that warrants a Microbiological Stability deduction.

  **Water activity consideration:**

  Products with aw below 0.70 do not support microbial growth (ISO 29621). Truly anhydrous formulas (no Aqua, no hydrosols in INCI) do not require traditional microbial preservation; antioxidant stabilization may still apply. Do not penalize anhydrous formulas for absence of aqueous preservatives.

  **Expected standard:** ISO 11930 Criteria A - bacteria 3 log reduction by Day 7, no increase to Day 28. Criteria B requires documented justification.

- **Chemical/physical stability** (2 pts): Are pH-sensitive actives in appropriate vehicles and packaging?

  | Active | Stability requirement | Deduction trigger |
  |---|---|---|
  | L-Ascorbic Acid | pH below 3.5; anhydrous or air-excluded packaging; opaque container | Any deviation: pH-incompatible vehicle, transparent packaging, jar format |
  | Retinol | Oxygen- and light-sensitive; airless or sealed opaque packaging | Clear/transparent packaging; wide-mouth jar |
  | Avobenzone (Butyl Methoxydibenzoylmethane) | Requires photostabilizer: Octocrylene, Tinosorb S, Diethylhexyl 2,6-Naphthalate, or Polyester-8 | Avobenzone present without any photostabilizer in INCI - UVA protection degrades 50-90% within 1 hour of UV exposure |
  | Benzoyl Peroxide | Oxidizes vitamin C derivatives | Co-formulation with vitamin C in same product |

- **Packaging compatibility** (2 pts): Does packaging protect against oxidation, light, and contamination?
  - Wide-mouth jar packaging: contamination risk for water-based products; stability concern for retinol and vitamin C
  - Transparent/clear packaging: light stability concern for retinol and certain vitamin C forms
  - Airless pump: appropriate for retinol and vitamin C formulas; award credit where applicable

### C. Manufacturing Quality Signal (6 pts)

Evaluated from publicly available information only. No score assigned for internal data not verifiable by a consumer.

- **GMP compliance evidence** (3 pts): Facility registration under India CDSCO Schedule M, ISO 22716, or equivalent. Publicly confirmed multinational GMP: 3/3. Indian indie brand with CDSCO registration: 2/3. No public manufacturing information: 1/3.
- **Stability and testing transparency** (2 pts): Does the brand publish stability data, SPF testing methods, or clinical study references?
- **Batch traceability evidence** (1 pt): Lot number, manufacture date, and expiry date clearly communicated?

### Sunscreen-Specific Assessment (applies within Pillar 2 for all SPF products)

**Broad-spectrum coverage from INCI:**

| Filter | UV range | Notes |
|---|---|---|
| Ethylhexyl Methoxycinnamate (Octinoxate) | UVB only | No UVA protection; FDA GRASE review pending |
| Homosalate | UVB only | SCCS recommended limit reduction to 7.34% (from 10%) |
| Octisalate (Ethylhexyl Salicylate) | UVB only | Weak filter; usually combined |
| Octocrylene | UVB + some UVA II; Avobenzone photostabilizer | Dual function; also photostabilizes avobenzone |
| Butyl Methoxydibenzoylmethane (Avobenzone) | UVA I only (peak 357 nm) | Photounstable without stabilizer - see below |
| Benzophenone-3 (Oxybenzone) | UVB + UVA II (not deep UVA I) | ED classification (ECHA 2025); reduced EU limits |
| Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine (Tinosorb S) | True broad spectrum | EU-only; not FDA-approved |
| Methylene Bis-Benzotriazolyl Tetramethylbutylphenol (Tinosorb M) | True broad spectrum | EU-only; particulate filter |
| Terephthalylidene Dicamphor Sulfonic Acid (Mexoryl SX) | UVA II | EU and some markets; not US |
| Drometrizole Trisiloxane (Mexoryl XL) | True broad spectrum | EU-only |
| Zinc oxide | True broad spectrum (physical) | FDA GRASE; only confirmed safe/effective |
| Titanium dioxide | UVB + UVA II (physical) | FDA GRASE; less UVA I coverage than zinc oxide |

**Photostability rule (mandatory check for all sunscreen assessments):**

Avobenzone (Butyl Methoxydibenzoylmethane) alone degrades 50-90% within 1 hour of UV exposure through a photoisomerization pathway. This is a formulation stability failure that undermines the UVA protection claim regardless of the stated SPF.

Acceptable photostabilizers that must accompany avobenzone:
- Octocrylene
- Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine (Tinosorb S)
- Diethylhexyl 2,6-Naphthalate
- Polyester-8

If Avobenzone appears in the INCI without any of these: mandatory deduction in Chemical/Physical Stability sub-score and mandatory scorecard note.

**EU Annex VI concentration limits (current, post Reg. 2022/1176):**

| Filter | Maximum concentration |
|---|---|
| Butyl Methoxydibenzoylmethane | 5% |
| Octocrylene | 10% (9% in spray combinations) |
| Benzophenone-3 | 6% face/hands; 2.2% body/sprays |
| Homosalate | 7.34% |
| Ethylhexyl Methoxycinnamate | 10% |
| Tinosorb S | 10% |
| Tinosorb M | 10% |
| Zinc oxide | 25% |
| Titanium dioxide | 25% |

### Comedogenicity Assessment (within Claim Substantiation, for products claiming non-comedogenic)

The Kligman 0-5 comedogenicity scale is not used as a primary assessment tool. It is based primarily on rabbit ear assay data (not human skin), is concentration-dependent, and the finished formula context can negate individual ingredient ratings. Professional assessment uses **fatty acid profile** of oils:

**High oleic acid (C18:1, monounsaturated) = higher comedogenic risk:**

Oleic acid disrupts normal stratum corneum lipid organization and inserts into follicular infundibulum environments, promoting microcomedone formation. These oils also act as penetration enhancers.

| Oil (INCI) | Oleic acid content | Risk level |
|---|---|---|
| Olea Europaea (Olive) Fruit Oil | 70-80% | Higher |
| Prunus Amygdalus Dulcis (Sweet Almond) Oil | 65-75% | Higher |
| Persea Gratissima (Avocado) Oil | 55-70% | Higher |
| Argania Spinosa (Argan) Kernel Oil | 42-48% | Moderate |

**High linoleic acid (C18:2, polyunsaturated) = lower comedogenic risk:**

Linoleic acid is deficient in sebum of acne-prone skin; topical supplementation may be neutral or beneficial.

| Oil (INCI) | Linoleic acid content | Risk level |
|---|---|---|
| Helianthus Annuus (Sunflower) Seed Oil | 65-70% | Lower |
| Rosa Canina (Rosehip) Seed Oil | 45-55% | Lower |
| Cannabis Sativa (Hemp) Seed Oil | 50-60% | Lower |
| Simmondsia Chinensis (Jojoba) Seed Oil | Not a triglyceride; wax ester | Near-zero |

**Near-zero comedogenic risk (regardless of INCI position):**
- Squalane: triterpene hydrocarbon, not a fatty acid ester; rating 0-1
- Caprylic/Capric Triglyceride: C8/C10 medium-chain saturated; non-comedogenic
- Dimethicone, Cyclopentasiloxane: silicone; does not penetrate follicle

**Concentration rule (overrides ingredient rating):** A known high-risk oil (Cocos Nucifera / Coconut Oil) at a sub-1% INCI position presents negligible comedogenic risk in practice regardless of its theoretical rating. INCI position context is mandatory in the assessment.

---

## Pillar 3 - Claims & Transparency (20 points)

Evaluates completeness of disclosure and accuracy of marketing communications.

### Sub-category weighting (corrected)

INCI transparency is the foundation of consumer trust and is weighted as the highest sub-pillar.

### A. INCI Disclosure Completeness (10 pts)

- **All ingredients listed in correct INCI format** (5 pts): Named by their INCI name (not trade names, not common names). All ingredients present in the finished product listed. Deductions for: trade names used in INCI list (e.g., "Matrixyl" instead of Palmitoyl Pentapeptide-4; "Argireline" instead of Acetyl Hexapeptide-3); common names without INCI equivalent.
- **Active concentration ranges provided** (3 pts): Brand discloses key active concentrations (e.g., "Niacinamide 10%", "Retinol 0.3%", "Salicylic Acid 2%"). Full credit requires at least 2 key actives with disclosed concentrations. Single active disclosed: 1-2 pts. No concentrations disclosed: 0 pts.
- **Fragrance components disclosed** (2 pts): Fragrance allergens above EU 2023/1545 thresholds individually named in INCI, not just "Parfum". Essential oil allergen components declared separately. Full credit for complete allergen INCI disclosure. "Parfum" alone in leave-on product: 0 pts.

### B. Labelling Clarity (6 pts)

- **Correct INCI names used** (2 pts): No trade names, common names, or marketing-adjacent ingredient naming in the INCI list itself.
- **Language accessibility** (2 pts): Consumer-facing information (ingredient function, usage guidance, warnings) communicated clearly without jargon.
- **Allergen highlighting** (2 pts): Allergens, contraindications (retinoids and pregnancy; AHAs and sun sensitivity; salicylic acid and children under 3), and skin type cautions prominently communicated.

### C. Marketing Claims Accuracy (4 pts)

- **No prohibited or misleading terms** (2 pts): No "chemical-free," "toxin-free," "natural" without qualification, "non-toxic," or "dermatologist-approved" without specifying the scope of approval.
- **Claims match ingredient profile** (2 pts): Marketed benefit accurately reflects the declared active in INCI. Deductions for: Retinyl Palmitate marketed equivalently to Retinol (requires two enzymatic conversions; significantly less potent); Ascorbyl Glucoside marketed equivalently to L-Ascorbic Acid (different mechanism and pH profile); Bakuchiol marketed as "retinol" without accurate comparative qualification.

### Auto-Fail Triggers (Layer Claims)

- Drug claims without regulatory approval (treating acne as a disease, anti-wrinkle as therapeutic)
- "Chemical-free" or scientifically incoherent claims
- SPF claim without validated SPF test data (ISO 24444 or equivalent)
- "Organic" / "natural" / "vegan" claim without supporting certification or evidence

---

## Pillar 4 - Ethics & Sustainability (10 points)

### A. Cruelty-Free Status (3 pts)

- No finished product animal testing (1.5 pts): Brand does not conduct or commission animal testing on finished cosmetics.
- No ingredient animal testing (1 pt): Where alternatives exist, ingredient animal testing not conducted.
- Not sold in mandatory-testing markets (0.5 pts): Brand does not sell in markets requiring pre-market animal testing. Note: mainland China general cosmetics e-filing reform (2021) allows post-market notification for some categories; brands not yet adapted under the reform receive deduction.

### B. Ingredient Ethics (3 pts)

- Natural origin index (1.5 pts): Proportion of ingredients from natural or renewable origin (COSMOS standard as reference). Scaled: 95% and above = 1.5; 75-94% = 1.0; 50-74% = 0.5; below 50% = 0.
- Not on COSMOS prohibited list (1 pt): No use of ingredients prohibited by COSMOS Organic/Natural standard: silicones, PEGs, synthetic fragrance, synthetic dyes.
- No synthetic fragrance, PEG, or silicone in leave-on (0.5 pts): Leave-on products free from all three classes score 0.5.

### C. Ethical Sourcing (2 pts)

- RSPO-certified palm oil/palm derivatives (1 pt): Brand or parent company is RSPO member or uses RSPO-certified palm derivatives.
- Mica sourcing verified (0.5 pts): For products containing mica or iron oxides, sourcing verified (Responsible Mica Initiative membership or equivalent).
- No conflict minerals (0.5 pts): Verified absence of conflict-source minerals in pigments.

### D. Packaging Sustainability (2 pts)

- Recyclable or refillable primary packaging (1 pt): Primary container is glass, aluminium, or widely recyclable plastic (PET, HDPE).
- Post-consumer recycled content 30% or more (0.5 pts): Packaging uses measurable recycled content.
- Minimal plastic secondary packaging (0.5 pts): Outer box or secondary packaging is paper-based, minimal, or absent.

---

## Special Evaluation Rules

- **Leave-on products** receive stricter sensitisation evaluation: fragrance allergen thresholds at 0.001% vs. 0.01% rinse-off.
- **Sunscreens** require SPF validation and photostability data for the UV filter system. Avobenzone without a photostabilizer is a mandatory Pillar 2 deduction regardless of SPF claim.
- **Treatment products** (weekly peels, masks) evaluated at actual use frequency, not daily.
- **Fragrance allergens** must be assessed against the EU 2023/1545 expanded list (80+ allergens, compliance deadline July 2026). "Parfum" alone in a leave-on product is flagged as allergen status unconfirmed.
- **Penetration enhancers** at functional INCI positions: mandatory Pillar 1 deduction + scorecard note. Requires reassessment of DAp assumptions for co-formulated restricted or threshold-approaching ingredients.
- **Prohibited parabens** (isopropyl, isobutyl, phenyl, benzyl, pentyl): auto-fail trigger. Propyl/butylparaben at compliant concentrations (0.19% individual maximum): minor deduction + ED-signal note required.
- **Niacinamide + Vitamin C:** do not flag as a concern. See "Explicitly Rejected Concerns" at the top of this document.
- **Retinoid products:** mandatory pregnancy and breastfeeding contraindication note regardless of score. This is not a deduction; it is a required consumer communication signal.

---

## Skin Type Guidance (Required on all product scorecards)

Every scorecard must include at least one skin type badge and one contextual note.

| Badge | Criteria |
|---|---|
| Sensitive Skin Friendly | Fragrance-free, no essential oils, no synthetic dyes, allantoin or Centella present |
| Oily / Acne-Prone Skin | Non-comedogenic vehicle, zinc or salicylic acid present, lightweight texture |
| Dry Skin Friendly | Rich emollient base, ceramides or occlusive present |
| Combination Skin | Balanced formula: humectants plus lightweight emollients |
| All Skin Types | Minimal actives, universally tolerated vehicle |
| Not Recommended for Sensitive Skin | Fragrance, essential oils, or high allergen load present |
| Caution: Acne-Prone | High-oleic oil or comedogenic ester at meaningful INCI position |

---

## Consumer Summary Requirement

Each product scorecard must include a consumer-facing summary that:

1. Opens with one sentence explaining what the product is and who it is for.
2. Calls out the most important positive (best ingredient or best formulation feature).
3. Calls out the most important concern (if any) in plain language.
4. Ends with a practical recommendation (good for X, use with Y, avoid if Z).

Technical terms must be explained parenthetically on first use. The summary must be understandable to someone with no chemistry background.

---

## Data Sources (All Publicly Available)

- INCI lists: INCIDecoder.com, brand product pages, OpenBeautyFacts.org
- Ingredient safety data: SCCS opinions (health.ec.europa.eu/scientific-committees), SCCS Notes of Guidance 12th revision (SCCS/1647/22, December 2023), CosIng database (ec.europa.eu/growth/tools-databases/cosing), ECHA SVHC candidate list (echa.europa.eu)
- Regulatory lists: EU Cosmetics Regulation 1223/2009 and all amendments; EU Regulation 2022/1176 (UV filter limits); EU Regulation 2023/1545 (expanded fragrance allergen list); India Drugs & Cosmetics Act Schedule M; FDA 21 CFR 700-740; Korea Ministry of Food and Drug Safety
- Fragrance allergen standards: IFRA Standards (ifrafragrance.org), EU Annex III Table 2, EU Regulation 2023/1545
- Preservative assessment: ISO 11930:2019+A1:2022 (preservative efficacy / challenge test); ISO 29621 (microbiological risk assessment - water activity)
- Sunscreen testing: ISO 24444 (in vivo SPF testing); ISO 24443 (in vitro UVA-PF testing); EU Annex VI (permitted UV filters and concentrations)
- Efficacy evidence: PubMed, British Journal of Dermatology, JAAD, Journal of Cosmetic Dermatology, Cosmetics and Toiletries, IFSCC proceedings
- Ethics and sustainability: RSPO (rspo.org), Leaping Bunny (leapingbunny.org), Responsible Mica Initiative (responsiblemicainitiative.com), COSMOS standard (cosmos-standard.org)

> **All scores are based exclusively on publicly available data. Nothing is fabricated. Every claim in a product scorecard must be independently verifiable by the consumer.**
