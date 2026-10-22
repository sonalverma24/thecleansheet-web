# The Clean Sheet - Standings (Stamps)

The single source of truth for what each standing means and exactly when it is
assigned. The stamp is **computed in code** (`deriveVerdict` in
`src/lib/product-review-engine.ts`), never by the language model, so the same
product always earns the same stamp and the model can never talk a product up or
down a tier.

Displayed order, best to worst:

1. **Good Standing** (highest)
2. **Room to Improve**
3. **Not Recommended**

"Good Standing" is a single badge shown for two internal tiers: `approved` (the
stricter bar, still gated on claim evidence - see below) and `mostly-clean`.
They render identically - same label, same colour, same seal - so a shopper
never sees a distinct "Clean Sheet Approved" stamp above Good Standing. The
`approved` key and its stricter bar still exist in code (it still determines,
for example, whether a headline calls out that a product met the strictest
evidence bar), it just no longer carries its own visible badge.

Internal tier keys: `approved`, `mostly-clean`, `can-do-better` (displayed as
"Room to Improve"), `not-recommended`.

---

## Standing from the four pillars (flag `ANALYSER_PILLAR_STANDING`, off by default)

A different way to earn the same four standings, built behind a flag. **While the flag is off nothing below
applies and every standing is earned exactly as described under "Definitions and exact conditions".** It
turns on only after the preview is signed (see "Versioning").

### The four pillars

Each review is graded on four pillars, each out of 100 (`src/lib/pillar-grade.ts`, assembled in
`src/lib/pillar-standing.ts`):

| Pillar | Built from |
| --- | --- |
| Ingredient Safety & Toxicity | the analysis checks (`runAnalysis`): identity and purity, regulatory and toxicology screens, functional safety |
| Irritation & Allergen Risk | the analysis checks: fragrance allergens, preservative sensitivity, surfactant irritation, product-level testing |
| Ingredient Transparency | the analysis checks (full list, blends, percentages, supporting documents), plus one soft deduction when the list has an unnamed catch-all ("Soap Base", a bare "QS") |
| Standards & Compliance | exactly four items: **label compliance, regulatory screen, ASCI screen, claims screen** (`src/lib/compliance-pillar.ts`) |

A pillar's score is `100 x (1 - deductions / applicable checks)`. Per applicable check: verified 0;
brand-stated 0.2; not disclosed 0.6, 0.35 or 0.15 (evidence we could decide from public data, only the brand
can publish, or is essentially never public); a legal-but-flagged ("soft") adverse finding 1. A **hard**
adverse finding (a banned ingredient, a contradicted claim) fails the pillar outright. Checks that do not
apply to the product are left out. "Not disclosed" lowers a score but is never an adverse finding.

### The rule

A pillar scores **well** at 70 or above. It **fails** only below 50 *and* with at least one adverse finding,
or on a hard failure; in between it is neither.

| Pillars | Standing |
| --- | --- |
| all four well | Good Standing |
| two or more failing | Not Recommended |
| anything else | Room to Improve |

Unchanged and still decided first, exactly as before: a licensed drug stays **Licensed Drug**; a hard flag
(banned ingredient, a claim the product's own INCI contradicts, a skin-whitening or fairness claim) stays
**Not Recommended**; drug-boundary treatment wording still caps the standing at **Room to Improve**.

Two guards keep the principle that **missing proof is never a negative standing**:

1. A pillar that is low only because evidence was not disclosed does not count as failing.
2. A review with no ingredient list is never Good Standing, and never Not Recommended on that account: at most
   Room to Improve, unless a hard flag already decided it.

### What no longer decides the standing

The standing stops reading the scored sections (claim evidence, price fairness, platform consistency and the
rest) and the total out of 100. They stay on the page, unchanged, and the total is still computed and
displayed. A product with thin claim evidence can therefore be Good Standing if its four pillars are sound.
Claim evidence keeps one job: **Good Standing still splits internally.** It is `approved` only when the old
strict bar also holds (no hard flag, total at least 85, claim evidence at least 15, a verifiable list, no
endocrine flag), otherwise `mostly-clean`. Both display "Good Standing"; the split still decides the headline
"Claims hold up to the evidence" and pitch-stamp eligibility, which are unchanged.

### Not Recommended from the pillars

The headline for a Not Recommended earned from the pillars alone (no hard flag) names the failing pillars:
"Two or more areas of the review fall short: ...". It is not a statement that a claim was false or an
ingredient prohibited, and the standing page says so.

---

## The two axes every stamp reads

- **Safety & Compliance** - is anything actually *wrong*? A code-verified drug-boundary crossing, or a claim the product's own INCI contradicts. Absence of a problem is a pass, never a gap.
- **Proof & Transparency** - how much did the brand actually *substantiate*? Thin disclosure or claims that outrun their evidence live here. **Missing proof is a transparency gap, not a lie.**

The critical rule that prevents false negatives: **missing evidence lands in "Can Do Better", never in "Not Recommended".** Only a demonstrable, code-verified problem earns the negative stamp.

---

## Definitions and exact conditions (the rules while the pillar flag is off)

Inputs (from the scored review): `total` /100, `claimEvidence` /20, `formulaLogic` /15, and `hardFlags` (count of claims that survive both guardrails below).

### 1a. Good Standing — internal key `approved`
> "Claims hold up to the evidence."

Safe, honest, **and** the headline claims are actually proven on the finished product. This is the strictest bar, but it displays exactly the same "Good Standing" badge as 1b below - it does not get its own stamp.

**Earned when:** `hardFlags === 0` **AND** `total >= 85` **AND** `claimEvidence >= 15`.

### 1b. Good Standing — internal key `mostly-clean`
> "A well-made, transparent product - some claims rest on ingredient evidence rather than finished-product proof."

Safe and honest, but the proof leans on ingredient-level research, not finished-product tests.

**Earned when:** `hardFlags === 0` **AND** `total >= 65`, but it misses the stricter `approved` bar (either `total < 85` or `claimEvidence < 15`).

### 2. Room to Improve — internal key `can-do-better`
> "Nothing wrong here, but the proof and transparency don't yet match the claims."

Nothing is wrong. The brand simply hasn't shown enough: thin disclosure, or claims that outrun their public evidence. **This is where a safe-but-underproven product sits.**

**Earned when:** `hardFlags === 0` **AND** `total < 65`.

### 3. Not Recommended
> "Makes a claim that isn't permitted in India, or one the product's own ingredient list contradicts."

A real, code-verified problem exists. This is the only stamp that names a brand negatively, so it carries the highest evidence bar and every negative call keeps a stored evidence trail.

**Earned when:** `hardFlags > 0` (at least one hard flag survives both guardrails).

---

## What counts as a hard flag (the guardrails)

A claim can only become a hard flag - the only thing that triggers "Not Recommended" - if it is one of:

- a **drug-boundary** claim that is NOT plain SPF/PA/UVA labelling (sunscreens are licensed cosmetics in India), or
- a **red-flag** claim whose context is genuine treatment/unlawful language, or an INCI contradiction,

**and** it survives both of these code checks:

### Guardrail 1 - INCI truth (`inciConfirmsContradiction`)
The model's contradiction is re-checked against the retrieved INCI, with synonym mapping, before it can count:

- **"Contains X" claims are never a contradiction.** A present active (mapped: Hyaluronic Acid → Sodium Hyaluronate, Vitamin C → Ascorbyl/Ascorbic, Vitamin B5 → Panthenol, etc.) supports the claim; an absent one is merely *unverified*. Either way, not a hard flag.
- **"Free-from X" claims** only count when X is **confirmably present** in the INCI via a conservative family matcher (e.g. "silicone-free" trips only on real silicones like dimethicone/siloxane; "sulphate-free" trips only on a sulphate *surfactant*, never on a mineral salt like Magnesium Sulphate; "alcohol-free" ignores fatty alcohols).
- If the contradiction cannot be confirmed in code (including no INCI retrieved), the flag is **voided** (`inciFlagVoided = true`) and does not count.

*This is the fix for the Minimalist B5 case: "With Hyaluronic Acid" was flagged contradicted although Sodium Hyaluronate is in the list. Guardrail 1 voids it.*

### Guardrail 2 - corroboration (`markClaimCorroboration`)
When the engine actually scraped a product page / brand evidence, every hard-flag candidate must have its distinctive subject word appear in that scraped text. A substantial corpus that never mentions the claim's subject ⇒ `corroborated = false` ⇒ the claim is **not** hard-flagged.

*This is the fix for an invented claim: a "silicone-free" the brand never made can no longer drop a product to "Not Recommended".*

Name-only queries have no page corpus, so guardrail 2 is skipped for them (claims are assumed made) and only guardrail 1 applies. The prompt is also hardened to forbid fabricating free-from claims in the first place.

---

## Score-band fallback (static catalogue only)

Curated products with no derived verdict fall back to bands (`scoreToTier`):
`score >= 65` → Good Standing (`mostly-clean`), else → Room to Improve
(`can-do-better`). A static product has no `claimEvidence` figure to test
against the stricter `approved` bar, so this fallback never distinguishes 1a
from 1b - both already display identically, so this has no visible effect. A
static product is never auto-assigned "Not Recommended" - that requires a live
review's code-verified hard flag.

---

## Versioning

`RUBRIC_REV` in `product-review-engine.ts` is bumped whenever the EARNING rules
above change (thresholds, guardrails, hard-flag logic), so stored reviews from
an older rubric are not served stale. Current: `r7`.

A stored review is served when its `rubric_rev` is in `ACCEPTED_RUBRIC_REVS`, not only when it equals the
current revision, so a new revision can be deployed first and the rows re-stamped afterwards without hiding a
review in between. That list is `r7` and `r9`.

**`r9` is the pillar standing.** A row is stamped `r9` only while `ANALYSER_PILLAR_STANDING` is on, and `r7`
otherwise (`activeRubricRev()`), so the revision records which standing rule was in force. With the flag off
nothing is stamped `r9` and nothing a shopper sees changes. Order: deploy the code with the flag off; sign the
preview (`scripts/pillar-preview.mts`, run from a checkout of main); set the flag and redeploy the same commit;
run `scripts/backfill-reviews.mts` straight after, which re-stamps every row and refreshes the stored `tier`
column that feeds listings. Standings recompute on every read, so a flip shows on pages at once; the stored
column lags until the backfill. Rollback is the flag off, a redeploy and the backfill again. Do not run the
backfill at the same time as a review rebuild; both write `product_reviews`.

**"Good Standing" badge merge (Sept 2026) did NOT bump the rubric.** It only
changed what label/seal each already-computed tier displays - `approved` and
`mostly-clean` now both render "Good Standing" instead of `approved` getting
its own "Clean Sheet Approved"/"Clean Sheet Recommended" stamp. The underlying
`tier` value, thresholds and guardrails are unchanged, so no re-derivation or
backfill was needed; every already-stored review picks up the new label on its
next read, since `tierLabel` and the badge are computed fresh on every serve
(never persisted as text). Only bump `RUBRIC_REV` for an actual EARNING-rule
change, not a label/display change.
