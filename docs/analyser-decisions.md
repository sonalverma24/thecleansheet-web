Entry format: **date, what was decided.** Reason (in the owner's words where we have them). What it touched. How to undo it.
Add an entry whenever the owner decides something about what the analyser says or what the site shows, or when content is removed. Newest first.

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
