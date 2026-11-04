/* The list of reviews pulled from the site lives in its own small module so that a light caller (the tile-image route) can honour it without importing the whole
   analysis engine. The engine re-exports it, so every existing import keeps working. */

/* Reviews pulled from the site. Suppressed on every read path (getStored,
   listings, catalogue); the stored row is left intact so it can be restored or
   hard-deleted later. Used for known-wrong source data pending re-review, and for
   removing duplicates (e.g. a second review of the same product created because
   the product couldn't be resolved to a canonical slug - see runProductReview). */
export const RETRACTED_SLUGS = new Set<string>([
  "la-roche-posay-cicaplast-balm",
  "moxie-curly-hair-shampoo", // duplicate Moxie shampoo review (AI-generated imagery); other Moxie review kept
  // Duplicate of the same product under the old brand name "Minimalist" (the
  // company rebranded to "Be Minimalist"). The brand-PDP scrape flagged two
  // drug-boundary claims ("treats dandruff & itching", "eliminates ...fungus")
  // so it derived Not Recommended, while the INCIDecoder-sourced "Be Minimalist"
  // row never saw those claims and derived Approved. Same INCI, same product.
  // The "be-minimalist-..." row (real image + INCI source) is the keeper.
  "minimalist-cph-complex-oligopeptide-0-8-anti-dandruff-serum",
  // Duplicate Kay Beauty Hydra Creme Lipstick (doubled brand prefix in the slug). The
  // other row is the keeper: it cites its INCIDecoder source URL, a consistent
  // Rs.799 brand/Nykaa price, and a rating not drawn from a single shade.
  "kay-beauty-kay-beauty-hydra-creme-lipstick",
  // Cetaphil Facial Cleanser: a composite of three different products. Ingredients
  // are a user-uploaded INCIDecoder entry for a non-Indian formula (Parfum,
  // Methylparaben, SLES); the claims are cetaphil.in Gentle Skin Cleanser copy; the
  // "Fragrance-free" flag was "corroborated" by a Nykaa search page (see
  // marketplaceListingCorpus). Cetaphil India lists no product by this name, so
  // there is no verified formula to review. Not a duplicate of the Gentle Skin
  // Cleanser review, so no redirect.
  "cetaphil-facial-cleanser",
  // Da Membrane Daily Brightening Face Toner: the brand page makes no "Fragrance Free"
  // claim (its only "fragrance" is the ingredient in its own INCI), so the Not
  // Recommended verdict rested on a claim the model invented and the corroboration
  // check "found" in the ingredient list itself. Pending re-review.
  "da-membrane-da-membrane-daily-brightening-face-toner-with-niacinamide-and-cica-1",
  // Nat Habit Multi Nut Shea Omega3 Malai: the stored INCI (60+ botanicals plus Glycerin,
  // Phenoxyethanol) is not the brand's list (raw milk, shea, walnut, almond, coconut,
  // clove, Geogard/Nipaguard; no glycerin). It made the brand's own "glycerin-free"
  // claim look false. Pending re-review.
  "nat-habit-nat-habit-multi-nut-shea-omega3-malai-body-butter-for-dry-skin-body-ac",
  // Duplicate of the same product under its old name. Be Minimalist updated
  // beminimalist.co/products/oat-extract-06-gentle-cleanser in place from "Oat Extract 6%" to
  // "B12 + Oat Extract 6.5%", and the product is stored twice, once under each name. The
  // "...-b12-oat-extract-6-5-gentle-cleanser" row (the brand's current name) is the keeper.
  // Owner, 2026-11-04: retire the 6% row as a duplicate.
  "be-minimalist-minimalist-oat-extract-6-gentle-cleanser",
]);
