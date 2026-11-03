# Analyser Version X1: what it is and where it stands

> Current approved baseline: [X1-approved-2026-10-28](docs/ANALYSER-APPROVED.md). Use [ANALYSER-REFERENCE.md](ANALYSER-REFERENCE.md) for the current generated logic; this document provides historical context.


Written 2026-10-27, on `main` at `2cf36e2`. This is the reference for Version X1 as it exists in this repository. It describes code and data that are
committed here; it does not record which flags are on in production (those are set in Vercel). Companion to
[ANALYSER-ROLLOUT.md](ANALYSER-ROLLOUT.md) (the verifier rollout plan and its rules) and [HOW-THE-ANALYSER-WORKS.md](HOW-THE-ANALYSER-WORKS.md)
(the plain-English guide to the four-tier verdict that shows while the X1 flags are off).

## What X1 is

- **The decision core** lives in `src/lib/analyser-x/`. `decideReview(review, now)` reads a stored `ProductReview` and returns one of five buying
  decisions (Good choice, Buy with caution, Look elsewhere, Not enough info, Medicinal product) with the reasons behind it and a confidence. It is pure:
  no network, no database, no model, no clock (the date is passed in), and it writes nothing. 34 named rules.
- **Names:** `ANALYSER_RELEASE = "X1"` and `ANALYSER_METHOD_VERSION = "TCS-X 1.0"` (`src/lib/analyser-x/version.ts`). The method version is the stored
  decision identifier, kept for compatibility.
- **Where it shows:** the stored-review product page, behind `ANALYSER_PILLS_PAGE` (the five pills and the 13-block layout, built by
  `src/lib/pills-page.ts`). With the flag off the page shows today's four-tier standing and the older checklist. The flags are listed in
  `src/lib/analyser-flags.ts`. Ratings (the standing, JSON-LD, listings) do not depend on anything in this document's evidence rules; that is pinned by
  `src/lib/verdict-parity.test.ts`.
- **Not in this repository:** the reference core's agent, hooks, queue, email and evidence vault (`analyser/vx`). There is no "X2". A shadow-mode
  evidence harness exists only on the branch `origin/feat/neurosymbolic-evidence-harness` (one commit, 54 behind main when last checked, with an
  unflagged image-evidence prompt fix); its own notes say it is not a complete replacement.

## Evidence rules

**Ingredient-source policy (28 October 2026):** fresh analyses must check the exact product on the brand website or INKEE Decoder (formerly INCIDecoder). Retailer inputs trigger primary-source lookup; model-generated ingredient lists are not published as INCI. Source URL and quotation are retained. See [the policy](docs/ingredient-sources.md).

**A source-backed list** is defined once, in `src/lib/inci-source-backing.ts`: at least 3 ingredients, captured from a reference database or a brand page
(capture trust 3 or more), with a non-empty captured quote that was not cut short. It means the list was captured as stated. It does not mean the formula is
true or current for the product. Everything below reads that one definition:

| Reads it | What changes without a source-backed list |
| --- | --- |
| The scorecard's `inciCompleteness` status | "Full INCI on brand PDP" / "Full INCI in reference database" need it. A list with no quote reads "List read, source quote not captured"; a cut-short quote, a model-reported list or fewer than 3 ingredients reads "Partial"; no list reads "Missing". |
| At a glance ticks | "Fragrance free" and "Essential oil free" appear only with it. |
| The fragrance claim check | Becomes "Needs proof" without it. |
| The pregnancy screen | "Not screened" without it. |
| Today's checklist (`src/lib/analysis-engine.ts`) | "INCI verification" is verified only with it; otherwise the row is not drawn. |

**Pregnancy screen** (`buildPregnancyScreen` in `src/lib/review-to-scorecard.ts`). Flags come only from reference entries that are valid, have a source, are
rated High or Medium, and whose pregnancy text does not start with no / none / not. Ingredients without such an entry are listed as not checked. The page
never says a product is pregnancy safe: its labels are "Pregnancy ingredient flag: X", "No pregnancy flags found" (with "not proof of safety") and
"Pregnancy ingredient screen incomplete". Retinoids that have no entry of their own (retinal, retinyl esters, tretinoin and so on; the term list is
`RETINOID_RE` in `src/lib/pregnancy-screen.ts`) are flagged on the Retinyl Palmitate entry's source and confidence, and nothing is flagged that way if that
entry is missing or unsourced. Known limit: the screen cannot express "unsure". A sourced entry whose pregnancy text is blank or starts with "not" counts
as checked with no flag, so such an entry must not be added (this is why the fragrance entry is held).

**Claim gap** (`caution.claim_gap`, `src/lib/analyser-x/rules.ts`). The claim with the widest residual risk leads (very high, then high, then medium; ties go
to the first listed). The wording is "One claim, “X”, is not backed ..." or "N claims are not backed ..., for example “X”"; it never says "main claim". The
threshold is unchanged: any claim that needs proof and has a gap is a caution, and a caution yields Buy with caution, **except when all five sections of the
product page are green** (owner decision, 2026-10-30, PR #51). Then the claim gap no longer holds the product down: it stays as a note and under Gaps, the
product is a Good choice, and "All five areas of our checks are Strong" (`support.sections_green`) stands in for the claims support (`agreeWithSections` in
`src/lib/analyser-x/decision.ts`; the section colours are defined once in `src/lib/analyser-x/sections.ts`, which the page and the decision both read). Every
other caution is a flag and still yields Buy with caution. This answers the question this paragraph used to leave open (whether one weak claim should override
a good standing). The current rules are in [ANALYSER-REFERENCE.md](ANALYSER-REFERENCE.md) and the owner's reason is in `docs/analyser-decisions.md`.

**Today's checklist** (`src/lib/analysis-engine.ts`) carries no scores, only the checks and the hard red flags. "Pregnancy-safe assessment" is now
"Pregnancy ingredient check": a retinoid is still flagged, and otherwise the row is not drawn, so it can no longer say "Clear" beside the pregnancy
screen's "Not screened".

## Reference data

- `src/data/ingredients.json` holds 839 entries. Each pregnancy flag, limit and status the screens read comes from it.
- **Aliases** (`src/data/ingredient-aliases.ts`): all 24 draft name pairs are signed off by reviewer TCS-P-024 on 2026-10-27. They do nothing until
  `ANALYSER_INGREDIENT_ALIASES` is turned on, in its own deploy. On one sample serum they recover only "Water/Aqua/Eau".
- **Titanium dioxide** is one entry with limits by use. Its US status names the sunscreen use ("an OTC drug when used as a sunscreen active"), which the
  product-scope logic reads as applying to sunscreens only, so a colourant use no longer shows "restricted in the US".
- **Retinol** has its own entry: restricted in the EU (Annex III entry 376), Canada and Australia, with a pregnancy caution at High confidence. The EU's own
  limits are recorded as law (0.05% retinol equivalent in body lotion, 0.3% in other leave-on and rinse-off). **TCS standard (owner decision, 2026-10-27):**
  where the reviewer's two figures disagreed, the stricter one applies: a leave-on product is held to 0.05% retinol equivalent, face or body, and the
  pregnancy precaution applies to rinse-off too. No code enforces a TCS-specific cap yet; the benchmark compares only authority limits.
- **Added from the reviewer return** (2026-10-27, TCS-P-024; each carries the reviewer's sources and confidence, other authorities left "not covered", TCS
  concern level "N/A" until set): Glycol Distearate, Polyhydroxystearic Acid, Trisodium Ethylenediamine Disuccinate, Cetearyl Olivate, Dicaprylyl
  Carbonate, Cocamide MEA, Coco-Caprylate/Caprate, Glyceryl Monostearate, Laminaria Digitata Extract, Pentaerythrityl Tetra-di-t-butyl
  Hydroxyhydrocinnamate, Polyisobutene, Phospholipids, Glucose, Sodium Acrylates Copolymer, Tetrahexyldecyl Ascorbate, Retinol.
- Reviewer references are opaque (`TCS-P-024`). Names and qualifications are never stored in this repository.

## Held, and open

| Item | Why it is held |
| --- | --- |
| Fragrance blend entry (Fragrance, Perfume, Parfum, Allergen-Free Fragrance) | Needs an alias design for the spellings, and a Caution would flag about 100 products, so it needs a preview first. |
| Methylisothiazolinone (rated Low) and Methylchloroisothiazolinone | Their restrictions depend on product type; the status wording must be one the scope logic reads. About 3 non-rinse-off products contain them, none at Good Standing. |
| Glyceryl Glucoside, C15-19 Alkane, Polyglyceryl-3 Polyricinoleate | Rated Low by the reviewer. |
| Bisabolol | An existing entry has shifted columns and is ignored by the validity gate; it needs a repair, not a duplicate. |
| Vitamin E, Vitamin C | The reviewer asked for umbrella entries that list their types; the data model has no such concept. |
| "A (and) B" labels | The reviewer says they may be read as two ingredients; lookups do not split them yet. |
| Part D3 pregnancy-flag proposals (hydroquinone, oxybenzone and others) | No sources were given, so none was entered. |
| 75 further ingredient names | A research round with a reviewer; each needs sourced regulatory facts. |
| Re-anchoring | On 2026-10-27 the production database had 391 reviews: 354 with a list of 3 or more ingredients, 49 with a captured quote and 305 without (142 INCIDecoder-linked, 28 other URL, 135 no URL). ANALYSER-ROLLOUT.md says 143 INCIDecoder rows were anchored on 2026-10-21; that is not what the database shows, so find out whether that write ran against this database. `scripts/reanchor-incidecoder.mts` (dry run first) targets the 142. |
| Concern level on the 16 new entries | "N/A" until the owner sets it. |

## Checking it

`npx vitest run` (1,194 tests passed on `2cf36e2`) and `npx tsc --noEmit`. Read-only scripts: `scripts/verifier-census.mts`, `scripts/mutation-check.mts`.
To go back, redeploy the previous production commit `c03474a`.
