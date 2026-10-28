# Approved analyser baseline: X1-approved-2026-10-28

The owner approved the PLIX localhost page on 28 October 2026 and asked to freeze the same analyser logic locally and on the website. This baseline is the reference for subsequent changes; change it only with the owner's approval.

## Agreed behaviour

- Fresh analyses obtain ingredient lists from the matching brand product page or INKEE Decoder (formerly INCIDecoder). Both Decoder domains are recognised. Retailer URLs supply identity, claims and prices, then trigger primary ingredient lookup.
- The captured ingredient list, quotation and source URL travel together into the analysis and product tags. When no primary list is retrieved, the model's proposed ingredient list is discarded and the gap is explicit.
- At a glance shows verified ingredient tags with ticks/crosses. It stays visible with an evidence-pending explanation if none can be verified.
- The product image uses a larger frame, the original Nykaa asset where applicable, and direct-image/error fallbacks.
- The overall rating uses the approved coloured circle design. Existing decision rules and their evidence thresholds remain in force; a genuine missing-source or identity gap can still be grey.
- The PLIX validation run returned 26 sourced ingredients, a captured quotation, yellow (Buy with caution), Paraben free, Alcohol free and crossed Fragrance free. This is a recorded test result, not a permanent promise about a product that can reformulate.

## Reference and change control

Read `ANALYSER-REFERENCE.md` first. Generate it with `npm run docs:analyser`. It includes the current prompt, rules, ingredient-source policy and source fingerprints. CI checks the file against the executable sources. Update `docs/analyser-decisions.md` with the owner's reason whenever behaviour changes, then regenerate the reference in the same pull request.

Older root documents are historical explanations. They do not override this baseline or the current code. Private and experimental branches are not production references.

## Local and production verification

`/api/analyser-version` returns the baseline and the four relevant display/method switches without exposing secrets. Compare its response between localhost and the live website. Production deploys the merged main branch through Vercel. Keep the local preview checkout at that same source revision; preserve unrelated work in other checkouts.

The PLIX local preview is `/analysis-preview/plix`. It is disabled in production and reads the private local result file `.local-preview/plix-approved-2026-10-28.json`; that result is never committed. Existing production analyses are not automatically rerun by this release. The versioned source and git release tag provide the rollback reference.

## Changes since the baseline was frozen

The baseline identifier above is unchanged. Behaviour changes made after it, each with the owner's reason in `docs/analyser-decisions.md`:

- 2026-10-28: a live search that comes back without a web search behind it is asked again, and refused if it still has none (`src/lib/review-checks.ts`). A product with no primary-source ingredient list is still saved, as the line "can still be grey" under Agreed behaviour says.
- 2026-10-28: candidate ingredient pages are found with Firecrawl search, a Decoder product page that the search surfaces is accepted as a primary source, and a short web-grounded model call may name a page (`src/lib/brand-inci.ts`).
