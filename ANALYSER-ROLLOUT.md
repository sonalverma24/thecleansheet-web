# Analyser verifier: rollout notes

Written 2026-10-21. Source of truth for the neuro-symbolic work so a new session does not
need the original plan. Describes local code, not verified as deployed. Companion to
[ANALYSER.md](ANALYSER.md), which describes the analyser itself.

## What the first release ships, and what it does not

Written for the pull request that first brings this work onto `main`.

- **Ships:** the checks and their tests, all rollout flags OFF; the evidence record and search
  log written onto NEW reviews (stored in the review JSON, no migration); the brand-page list
  extractor fixes (they change what is read from a brand page when a new review is made); the
  read-only census, mutation sweep and re-anchor scripts; this note.
- **Does not ship:** the `r8` catch-all rubric (it lives in the owner's separate uncommitted
  work; production is still `r7`). `inci-catchall.ts` is included only because the
  normaliser reads `catchAllKind` from it; the engine does not use it. Also not shipped: the
  Nykaa pitch demo and the "record who requested a review" change.
- **Shoppers see no difference** from the analyser logic: verdicts, ticks, scorecards and
  JSON-LD are pinned by `src/lib/verdict-parity.test.ts`, recorded against the production engine.
- **Known production bug found while reconciling, NOT fixed here:** on `main` the call that reads
  brand test reports published as images (`imageEvidenceBlock`) runs inside the model retry
  loop, after the prompt is built, so that evidence never reaches the model and the vision
  call is repeated per attempt. It is a separate, behaviour-changing fix.

## Idea

The AI proposes; deterministic code disposes. The verifier turns uncertainty and
conflicts into visible flags instead of confident verdicts. It cannot promise zero
failures: errors no rule recognises can still pass. Every finding is a lead for a person,
never an auto-applied correction and never a statement that a product or brand is at fault.

## Where things stand

| Phase | State |
| --- | --- |
| 0. Harness hardening | Done. Parity matrix, mutation sweep, `captureTrust` rename, Sugandhit treated like Parfum. |
| 1. Ontology and claim disputes | Done, flag off. Aliases are UNREVIEWED, so no relation is definitive yet. |
| 1.6 Hardening from the design v2 check | Done. Alias provenance is validated, not just present; hazard disclaimer added in code; " / " cells decided by identity; exact model-read verification and conflict semantics in `capture-evidence.ts`. Not yet wired into `runProductReview`. |
| 2. Anchoring (re-fetch, quotes, grounding) | Partly applied. 143 INCIDecoder rows were anchored on 2026-10-21 (backup `reports/backup-pre-anchor-incidecoder.json`; only `review.inciEvidence` added, `tier`, `rubric_rev` and verdict unchanged). Brand-page rows are held: 6 had page text swallowed into an entry, and the sentence-end extractor fix is in the working tree uncommitted. 18 INCIDecoder rows are queued for a person. The 79 model-reported Good Standing rows have no URL. No flag reads `inciEvidence` yet. |
| 2.5 Formula currency | Not started. Needs the owner's source hierarchy and freshness window. |
| 3. Safeguards (hold, queue, audit table, preview script) | Not started. Needs a Supabase migration you run. |
| 4. Policy engine and the Provisional state | Not started. |
| 5. Staged flip, one flag per deploy | Not started. Needs signed previews. |
| 6. Strict identity and merging twins | Not started. |
| Release 2026-10-27: products we do not rate, drug signals, the pregnancy chip | **Live, no flag.** See "Release 2026-10-27" below. |

## Modules

| File | Role |
| --- | --- |
| `src/lib/inci-normalise.ts` | Synonym folding, q.s. split, suggestions, fragrance declaration. |
| `src/lib/review-verifier.ts` | Capture trust, evidence, list checks, claim disputes, `verifyReview`. |
| `src/lib/claim-ontology.ts`, `src/data/ingredients/claim-ontology.ts` | Free-from classes; definitive vs qualified; review fields. |
| `src/lib/capture-evidence.ts` | What a fresh capture does to a record's evidence status: exact ordered comparison only, `formula_conflict` retains the anchor and queues the diff, identity failures change nothing, a match never clears a conflict. Also `verifyModelRead`. |
| `src/lib/inci-cells.ts` | " / " inside a cell: two known different INCI names is a lead, a name with its common name is a display convention. |
| `src/lib/identity-resolution.ts` | PROBABLE_DUPLICATE / CONFLICT_QUARANTINE / DISTINCT. |
| `src/lib/at-a-glance.ts` | Both copies of the ticks function and the flagged ontology step. |
| `src/lib/analyser-flags.ts` | The seven rollout flags. All off. |
| `src/lib/inci-reanchor.ts` | The exact re-anchor rules, the row runner and the single guarded write. Pure apart from the injected fetcher and table. |
| `src/lib/inci-fetch.ts` | INCIDecoder parser. Exports `parseProductPage` and `fetchIncidecoderProduct`; also reports the page's own title and brand and whether the quote was cut. |
| `src/lib/inci-from-page.ts` | Brand-page list extractor. `extractInciWithQuote` returns the accepted list and the raw text span it came from; `extractInciFromText` is a wrapper with unchanged behaviour. |
| `src/lib/gemini.ts` | `generateResilientWithMeta` returns the text plus the grounding record; `generateResilient` is a thin wrapper with the same signature and behaviour. |
| `scripts/verifier-census.mts` | Read-only census of stored reviews. |
| `src/lib/reviewer-audit.ts`, `scripts/audit-reviewer-register.mts` | Checks reviewer references against the private register. Prints references, never names. |
| `scripts/mutation-check.mts` | Targeted mutation sweep over the rules. |
| `scripts/reanchor-incidecoder.mts` | Re-fetches source pages and anchors exact matches. Dry run by default. |
| `src/lib/unrated-kind.ts` | Decides whether a product is a nutraceutical or a drug, so it gets no review. One place for the product page, the lists, the sitemap and the analysis. |
| `src/lib/drug-signals.ts` | The drug signs: a prescription notice, a "Drug Facts" label, a signed-off drug-only maker. Reads only what the product says, never its ingredients. |
| `src/lib/analyser-x/kb.ts` | Also holds `DRUG_ONLY_MANUFACTURERS` (owner-signed, empty). Azelaic acid is no longer in `DRUG_ACTIVES`. |
| `src/lib/evidence-images.ts` | Also reads the page's images for label artwork that says "Drug Facts" or Rx (`imageEvidenceBlock(url, out)` fills `out.labelText`). |
| `src/components/scorecards/UnratedNotice.tsx`, `UnratedProductPage.tsx` | The popup for a product we do not rate, and the page that carries it. |
| `src/app/api/unrated-notify/route.ts` | Email signup for the nutraceutical popup. |

## Rules that must not be broken

- **Capture trust is not truth.** A recorded quote proves the text was captured as stated,
  not that the formula is true, current for the SKU, or valid for a region or version.
  Policy reads only `anchored` and `conflicting`, never arithmetic on the numbers.
- **No word list may suppress or clear a finding.** Hedges such as "technically" change
  nothing. A negation counts only when bound to the claim it governs.
- **Vocabulary.** A *lead* is a claim and the recorded list disagreeing. A *definitive
  match* is a reviewed ontology member on an anchored list. Neither is a confirmed defect;
  confirming needs a person to check product, variant and claim meaning. Two disagreeing
  sources are a *conflict*, not a winner. A precautionary hold is not a finding of fault.
- **No substring chemistry.** Forms match as whole words or whole items, with British
  "sulphate" folded to "sulfate" on both sides. An alias is `definitive` only when its
  `source` is a verified CAS number (check digit) or an https URL on a host in
  `AUTHORITATIVE_SOURCE_HOSTS`, its `reviewRef` is a TCS Panel reference of the form
  `TCS-P-014`, and its `reviewedAt` is a real past date. Owner approval sets policy; it does
  not validate chemical equivalence, and the host list is itself a policy a qualified
  reviewer should confirm.
- **The reviewer is never named.** The code and the site hold only the opaque `reviewRef`.
  The map from reference to person lives in a private register OUTSIDE this repository
  (`reviewer-register*.json` is gitignored as a safety net). The only public statement is
  the fixed line `PANEL_ATTRIBUTION`, "Reviewed by an expert on the TCS Panel.", which
  `publicAttribution` returns only for an alias that is definitive in code. Nothing may
  show that line until a panel expert has actually reviewed the alias. The shape of a
  reference proves nothing about the person, so run
  `scripts/audit-reviewer-register.mts` with the private register: it checks that each
  reference exists, is active, has a recorded credential and is not the site owner, and it
  prints references only, never names. Keep the credential on file: a public "reviewed by
  an expert" line is an advertising claim that must be substantiated.
- **Not checked is not clear.** `ontologyTick` returns null for a label nobody modelled.
  Nothing may read null as "claim satisfied".
- **A later capture is evaluated against the record, never in place of it.** Same identity,
  different formula: `conflicting`, anchor retained, diff queued. Different identity: queued,
  nothing changes. Only an exact match anchors, and an exact match never clears a conflict.
- **Sugandhit Dravya is a fragrance declaration, exactly like Parfum.** Language alone is
  not evidence of worse chemistry. Reverse this only with a written disclosure-policy reason.
- **Probable duplicate never serves another product's review**, and a dry run is never
  approval to merge.
- **Provisional applies to displayed Good Standing only.** Other standings keep their
  rating with an evidence-status note and are never softened.

## Phase 2: anchoring

Anchored means one thing: a quote was captured from a real source for a named product. It
does not mean the formula is true, current for the SKU, or valid for a region or version,
and nothing here calls a list correct. The point is that a later, separately signed-off
policy can require an anchored list before showing Good Standing, which needs the lists to
be auditable first.

**The re-anchor rules are exact.** A stored list is anchorable only if all of these hold
against a fresh read of its own source page:

1. same brand (INCIDecoder: the page's brand link equals the review's brand; a brand page: the review's brand appears in the page title or site name as whole words);
2. equal name tokens (a subset is not equal);
3. the page's own title is the product's name (the title is recorded as `matchedTitle`; a page with no title of its own cannot anchor, the slug is never used as a title);
4. equal variant tokens (size, SPF and PA rating, percentage, shade or variant number);
5. the ordered sequence of `inciKey(...)` is identical, with duplicates counted;
6. the captured quote is complete (not cut by the 2000 character quote cap or by the parser's read window) and contains the parsed list in order.

Reordered, added, removed or repeated entries, or any title, brand or variant difference,
are queued with the diff for a person. No similarity score or threshold ever approves.

**What `--apply` writes.** `result.review.inciEvidence = makeInciEvidence(url, quote, retrievedAt, matchedTitle)`
and nothing else: the row's `result` is replaced with a copy that differs only in that
field, and the write path can name only the `result` column, so `tier`, `rubric_rev` and
`verdict` are out of reach. A row that changed after it was read is left alone. Retailer
pages are never re-anchored. Rows already anchored are skipped.

**Research log.** New reviews carry `review.researchLog`: the searches the model ran and the
sources it cited (Google Search grounding), from the attempt whose output was kept.
`grounded: false` means that call did no search. Cited URIs are usually Google redirect
links; the domain is in `sourceTitles`. It records research, not evidence; nothing reads it
for a verdict. No prompt was changed.

**Not changed in Phase 2.** The review engine still records no quote for a list read from a
brand page (only INCIDecoder lists get one), so new brand-page reviews stay unanchored until
that is decided. The INCIDecoder quote is the parsed markdown line, including the
`[Name]` brackets and a `[more]` toggle the reader leaves in; it is the same quote new
reviews already record.

## Flags (all off) and rollout order

One flag per deploy, each followed by deploy, backfill, a page-content check, a measured
cache test and a soak (suggest 48 h). Vercel applies an env change on the next deployment.

| Step | Flag | Behaviour |
| --- | --- | --- |
| 5a | `ANALYSER_ONTOLOGY_TICKS` | Alcohol and Paraben ticks read the ontology. Do not enable until aliases are reviewed: today a listed methylparaben would make the tick vanish. |
| 5b | `ANALYSER_SUPPRESS_DISPUTED_TICKS` | Suppress a disputed tick; show "This claim is being checked." |
| 5c | `ANALYSER_UNDER_REVIEW_ENDORSEMENT` | Good Standing with an unresolved dispute shows Provisional. |
| 5d | `ANALYSER_HOLD_NEW_CONTRADICTIONS` | Hold NEW reviews on a definitive match or conflict. |
| 5e | `ANALYSER_POLICY_CATCHALL_GATE` | A catch-all caps the total at 64 (needs its own RUBRIC_REV bump). |
| 5f | `ANALYSER_POLICY_ANCHOR_REQUIRED` | Good Standing needs an anchored list, else Provisional. |
| 5g | `ANALYSER_STRICT_IDENTITY` | Only confirmed identity serves an existing review. |

**Parity promise.** With all flags off, verdicts, the At a glance ticks (both copies),
the scorecard, JSON-LD, listings and pitch stamps equal today's. The one exception is the
"Fragrance free" and "Essential oil free" ticks: since the evidence-backed badges they are read
from a complete captured ingredient list, so they appear only with one. Ratings never depend
on them. Pinned by
`src/lib/verdict-parity.test.ts`; its snapshot is the preview. A step that changes it has
changed what shoppers see.

## Rollback

| Item | On rollback |
| --- | --- |
| Verdict flags | Set false, redeploy the same commit, re-run `scripts/backfill-reviews.mts` to restore the `tier` column. |
| Held rows | Never auto-released; release only by a person, with an audit event. The read-path exclusion is data-driven and stays deployed. |
| Disputed-tick suppression | Stops; ticks reappear, because a dispute is not a finding of error. |
| Human-confirmed corrections | Persist; never reverted by a rollback or backfill. |
| Anchors written by `--apply` | An additive field no flag reads yet, so verdicts are unaffected either way. To undo, remove `result.review.inciEvidence` from the rows listed in that run's report (`reports/reanchor-incidecoder.json`). |
| Provisional states | Revert to the calculated tier on read. |

Measure cache lag per flip rather than assuming five minutes: `/reviews/[slug]` and
`/brands` use ISR (`revalidate = 300`, stale-while-revalidate), the in-memory review cache
adds up to 5 minutes per instance, and the CDN may add more.

## Release 2026-10-27: products we do not rate, drug signals, the pregnancy chip (live, no flag)

Unlike everything above, this release has **no rollout flag**: the owner asked for it live, and it changes what shoppers see. It is not covered by the parity promise above. It reached production as PRs #30 and #31 (merge commits `a587214` and `c1fed56`).

**What it does**

- A nutraceutical or a drug gets no review, no rating and no place in a list. `src/lib/unrated-kind.ts` decides; `src/lib/drug-signals.ts` reads the drug signs.
  - Nutraceutical: an explicit word in the name or category, or a swallowed format (capsules, gummies, tablets) only when the category is not a cosmetic type.
  - Drug: only what the product says. A prescription notice (Rx, Prescription Required, Rx only, Schedule H; negations such as "not a prescription drug" excluded) makes it a prescription drug. A "Drug Facts" label (page text, or label artwork) or a maker the owner has signed off as drug-only makes it a drug. Never an ingredient or a percentage: azelaic acid is off `DRUG_ACTIVES` and off the legacy `LICENSED_DRUG_ACTIVES`.
- Where it applies: `/analysis/[slug]` shows a popup page (no review, no JSON-LD, `noindex`). `getUnratedSlugs()` takes stored ones out of the `/brands` grid, the home shelf, the directory index, the sitemap and the counts (five-minute cache; a database error keeps the last answer, so a list is never emptied). `runProductReview` answers `{ type: "unrated" }` and stores nothing. The search box shows the popup.
- A stored review is re-checked from its name, category and each retailer's listing note (where "Prescription Required" is quoted). Of the 395 stored reviews on 2026-10-27 this flags two: the H2Glow drink mix and Aziderm 20% Cream. A new URL analysis also reads the page text and the label artwork, which a stored review does not keep.
- X1's `med.rx_text` rule uses the same prescription-notice check; the loose `RX_TEXT_RE` is retired.
- The At a glance pregnancy chip appears for a flagged ingredient, or for a complete screen with no flag ("No pregnancy flags found"). Anything in between shows no chip.
- Email signup for nutraceuticals: `POST /api/unrated-notify` writes `public.category_waitlist` (migration `20261024000000_category_waitlist.sql`, applied to the production database on 2026-10-27; row level security on, no policy) and emails the owner.

**Rollback**

| Item | On rollback |
| --- | --- |
| Whole release | Revert the two merge commits (`git revert -m 1 c1fed56`, then `git revert -m 1 a587214`) and deploy, or roll Vercel back to the deployment built from `c03474a`. Nothing was deleted: unrated products are only hidden, so they return with the revert. |
| Waitlist table | Additive; leave it. Its rows are personal data: export them before any drop. |
| One wrong match | Fix the rule in `unrated-kind.ts` or `drug-signals.ts` (tests: `unrated-kind.test.ts`, `drug-signals.test.ts`). A manufacturer entry is retired by removing it from `DRUG_ONLY_MANUFACTURERS`. |

**Known limits of this release**

- The label-artwork reader is a second vision pass over the images already downloaded. It is tested with a stand-in model, not on real photographs. It runs only for new URL analyses with `GOOGLE_AI_API_KEY`. It sits in the same call, inside the retry loop, as the known production bug at the top of this note; the label read is guarded to run once per analysis, and the bug itself is unchanged.
- `DRUG_ONLY_MANUFACTURERS` ships empty, so the manufacturer sign does nothing until the owner supplies names and a source for each.
- A "Drug Facts" label marks an over-the-counter drug, so those products show "This is a drug, not a cosmetic", never "prescription". A sunscreen whose label artwork shows a Drug Facts panel is not rated.
- A medicine recognised only by an active ingredient (a ketoconazole shampoo) is not on this list: it keeps the Medicinal product page.
- A new analysis of a nutraceutical still spends the model run before it is recognised.

## Commands

```bash
npx vitest run                                   # includes the parity snapshot
npx tsc --noEmit
npx tsx --tsconfig tsconfig.json scripts/mutation-check.mts          # targeted breaks, expect 0 survivors
set -a; . ./.env.local; set +a; npx tsx --tsconfig tsconfig.json scripts/verifier-census.mts   # read-only
# Phase 2. Dry run: reads the database and the network, writes only the report file.
set -a; . ./.env.local; set +a; npx tsx --tsconfig tsconfig.json scripts/reanchor-incidecoder.mts
#   options: --only incidecoder|brand  --slug <product_slug>  --limit <n>  --delay-ms <n>  --out <file>
# Writes inciEvidence for the exact matches only. Run the dry run first and read the queue.
set -a; . ./.env.local; set +a; npx tsx --tsconfig tsconfig.json scripts/reanchor-incidecoder.mts --apply
```

## Known limits

- Precision and recall are unknown until a person clears a sample of the leads.
- Legacy rows can be anchored only by the re-fetch above, and only when the page still
  matches exactly; model-reported rows (about 170, 79 of them Good Standing) cannot be
  anchored without an approved URL.
- The INCIDecoder parser reads only 8000 characters after the "Ingredients overview"
  heading, so a very long list is cut inside the parser itself. The re-anchor queues such a
  list as a truncated quote instead of anchoring it; the stored list for that product is
  incomplete either way.
- Existing behaviour not changed here: guardrail 1 can derive Not Recommended from a
  free-from claim contradicted by an unanchored list. The Phase 3 preview reports how many
  standings rest on that; changing it is a separate sign-off.
- `/analyzed/[slug]` needs a signed-in session, so its render is covered by tests, not smoke-tested.
