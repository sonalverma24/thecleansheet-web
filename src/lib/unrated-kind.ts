/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Products we do not rate

   The Clean Sheet rates cosmetics. Three kinds of product are not cosmetics and get no review, no rating and no place in a product list: a nutraceutical
   (something you swallow: a supplement, a drink mix, gummies), a drug, and a tool (an appliance, a device or an accessory: a hair dryer, a hot air brush, a
   makeup brush, a face roller: nothing you put on your skin or hair, so nothing to read an ingredient list from). This file is the one place that decides which a product is. It is used on the product
   page, in every list and sitemap, and before a new analysis is stored, so the three can never disagree.

   Pure: it reads the product's name and category, and the signs a listing or a label gives, nothing else. It leans toward "not a match": a cosmetic wrongly
   called a nutraceutical or a drug would vanish from the site, so each rule asks for an explicit word. See unrated-kind.test.ts for the cosmetics it must leave alone.

   Drug: only what the product itself says (src/lib/drug-signals.ts): a prescription notice (Rx, Prescription Required, Schedule H) makes it a prescription drug; a
   "Drug Facts" label, or a maker the owner has signed off as drug-only, makes it a drug. Never its ingredients: a medicine we can only recognise by an active (a
   ketoconazole shampoo) keeps the Medicinal product page.
──────────────────────────────────────────────────────────────── */

import { categorise } from "@/lib/product-categorise";
import { UNCLASSIFIED } from "@/data/analysis/categories";
import { drugNoticeOf, type DrugSignalInput } from "@/lib/drug-signals";

export type UnratedKind = "nutraceutical" | "prescription-drug" | "drug" | "tool";

export type UnratedInput = DrugSignalInput;

/** What a stored review lets us read: its name and category, and the notes it keeps on each retailer's listing (where "Prescription Required" is quoted when a listing says it). */
export function unratedInputOf(review: {
  productName?: string | null;
  category?: string | null;
  priceAcrossPlatforms?: readonly { note?: string | null }[] | null;
}): UnratedInput {
  return {
    productName: review.productName,
    category: review.category,
    listingNotes: (review.priceAcrossPlatforms ?? []).map((p) => p?.note ?? "").filter(Boolean),
  };
}

/** Words that name a nutraceutical on their own, whatever else the category says. */
const NUTRACEUTICAL_WORD_RE = /\b(nutraceuticals?|nutricosmetics?|ingestibles?|drink mix(?:es)?|beauty drinks?|electrolyte (?:drink|mix|powder|sachets?)|protein (?:powder|shake)s?)\b/i;
/** Words that point to a nutraceutical but are also used on cosmetics: "multivitamin serum", "probiotic cleanser", "capsule serum", "cleansing tablet", "supplement" in a
    serum's name. They count only when the product's category does not resolve to a cosmetic type in the closed category list. */
const NUTRACEUTICAL_HINT_RE = /\b(supplements?|multivitamins?|probiotics?|omega[- ]?3|fish oil|protein bars?|gummies|gummy|softgels?|chewables?|effervescent|capsules?|tablets?)\b/i;

/* A tool is what a product IS, not what it is used with: "Heat Protectant for Flat Irons and Hair Dryers" is a cosmetic. Three rules keep it so:
     1. the product's category (its name, when it has none) does not resolve to a cosmetic type in the closed category list (a hair dryer, a brush set and a face roller all resolve to
        Unclassified; a serum, a mascara and a shaving cream do not);
     2. a generic word (appliance, device, gadget, tool, accessory) counts only in the category, where the model says what the product is;
     3. a specific tool phrase (hair dryer, hot air brush, flat iron, makeup brush set, face roller ...) counts in the name or the category, but not in a name that
        also holds a word for a cosmetic format (serum, spray, cream, shampoo ...), which is a cosmetic named after the tool it protects against or works with. */
const TOOL_GENERIC_RE = /\b(?:appliances?|devices?|gadgets?|tools?|accessor(?:y|ies))\b/i;
const TOOL_PHRASE_RE = new RegExp(String.raw`\b(?:${[
  String.raw`(?:hair|blow)[- ]?dr(?:y|i)ers?`, String.raw`hot[- ]air (?:brush(?:es)?|styler|comb)`, String.raw`(?:hair |ceramic |ionic )?straighteners?`, String.raw`flat[- ]irons?`,
  String.raw`curling (?:irons?|wands?|tongs)`, String.raw`(?:hair )?crimpers?`, String.raw`(?:hair |eyelash |eye lash )?curlers?`, String.raw`(?:multi[- ]?)?hair stylers?`,
  String.raw`(?:hair |beard |body |nose |bikini )?(?:trimmers?|clippers?)`, String.raw`(?:electric |foil |lady )?shavers?`, String.raw`(?:safety |disposable |electric )?razors?`, String.raw`epilators?`,
  String.raw`(?:face|facial|eye|body|scalp|hair|derma|jade|ice|rose quartz) (?:rollers?|massagers?|steamers?|wands?)`, String.raw`gua[- ]?shas?`, String.raw`massagers?`,
  String.raw`(?:derma|micro)[- ]?needl\w* (?:pens?|rollers?|stamps?|devices?)`, String.raw`(?:led|light therapy)(?: (?:face|facial))? (?:masks?|devices?|wands?)`,
  String.raw`(?:face|facial|cleansing|skin|body|scalp) brush(?:es)?`, String.raw`(?:make-?up|cosmetic|eye ?shadow|foundation|blush|powder|concealer|contour|lip|kabuki|eyeliner|brow|blending) brush(?:es)?`,
  String.raw`brush sets?`, String.raw`(?:hair )?brush(?:es)?`, String.raw`(?:beauty ?blenders?|(?:make-?up|beauty|blending) sponges?|powder puffs?)`, String.raw`(?:hair )?combs?`,
  String.raw`(?:hair )?(?:clips?|bands?|pins?|scrunchies?)`, String.raw`tweezers?`, String.raw`nail (?:clippers?|files?|buffers?)`, String.raw`pumice stones?`, String.raw`loofahs?`, String.raw`shower caps?`,
].join("|")})\b`, "i");
/** A word for a cosmetic format: its presence in a NAME means the product is a cosmetic that mentions a tool. */
const COSMETIC_FORMAT_RE = /\b(?:shampoos?|conditioners?|serums?|creams?|gels?|lotions?|oils?|mists?|sprays?|foams?|mousse|wax|balms?|butters?|toners?|cleansers?|primers?|protectants?|sunscreens?|lipsticks?|mascaras?|foundations?|concealers?|polish|perfumes?|deodorants?|soaps?|scrubs?|pomade|pastes?|powders?)\b/i;

export function unratedKindOf(p: UnratedInput): UnratedKind | null {
  const drug = drugNoticeOf(p);
  if (drug) return drug.kind;

  const name = (p.productName ?? "").trim();
  const category = (p.category ?? "").trim();
  const said = `${name} ${category}`;
  if (NUTRACEUTICAL_WORD_RE.test(said)) return "nutraceutical";
  if (NUTRACEUTICAL_HINT_RE.test(said) && categorise(category, name).id === UNCLASSIFIED.id) return "nutraceutical";
  // The category the model gave decides when there is one: a name's own words ("LED Face Mask") must not turn a device's category into a cosmetic type.
  if (categorise(category, category ? "" : name).id === UNCLASSIFIED.id) {
    if (TOOL_GENERIC_RE.test(category) || TOOL_PHRASE_RE.test(category)) return "tool";
    if (TOOL_PHRASE_RE.test(name) && !COSMETIC_FORMAT_RE.test(name) && !COSMETIC_FORMAT_RE.test(category)) return "tool";
  }
  return null;
}

/** True for a product that gets a review and a place in the lists. */
export const isRated = (p: UnratedInput): boolean => unratedKindOf(p) === null;
