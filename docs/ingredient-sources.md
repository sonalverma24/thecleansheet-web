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
