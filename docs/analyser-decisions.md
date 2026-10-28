Entry format: **date, what was decided.** Reason (in the owner's words where we have them). What it touched. How to undo it.
Add an entry whenever the owner decides something about what the analyser says or what the site shows, or when content is removed. Newest first.

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
