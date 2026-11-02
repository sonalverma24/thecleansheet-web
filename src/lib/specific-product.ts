/* Does this search, or this result, name a specific product?

   A search for a brand alone ("Cetaphil", "Dot and key") or for a kind of product ("Sunscreen", "face wash for oily skin") names no product. Left to the
   model, it invents one: the one-word search "Sunscreen" came back as a product called "M .Y Sunscreen" by a brand of the same name, and was saved and listed
   on /products. The rule (owner, 2026-11-02): such a search must ask the shopper which product they mean, or show nothing, and is never saved as a product.
   Both engines ask this one module (runProductReview in product-review-engine.ts, runDeepScan in review-engine.ts), twice:

     queryNamesNoProduct(query, brands)       before any model is asked: the text typed is only a brand, only a kind of product, or a brand and a kind of product.
     resultNamesNoProduct(productName, brand) after: the name the model chose is the brand again, or adds nothing to the brand but a kind of product.

   It is a heuristic over words, so it is built to be wrong in one direction. A word it does not know counts as part of a product's name, and a name with one
   such word in it passes ("Cetaphil Gentle Skin Cleanser", "Dot & Key Watermelon Sunscreen", "Minimalist 10% Niacinamide Serum"). What it flags is what is
   made only of words it does know. Three sets of words do the work:
     brands   the names it is given (the brands we hold analyses of, the brands table, a short built-in list, and the brand the model returned),
     nouns    what a product is called and nothing more: cleanser, serum, cream, sunscreen, face wash. A name made of a brand and nouns names no product,
              but "Moisturising Cream" does (the adjective is a word it does not know), and so does "Minimalist 10% Niacinamide Serum" (an active is a word
              of the name when a brand stands beside it),
     generic  every word of the taxonomy (product categories and types, concerns, actives) as well. Only a search with NO brand in it is judged against these:
              with nothing but taxonomy words in it, such a search describes a kind of product, whoever makes it.
   Limits are listed in docs/analyser-decisions.md and in the pull request that added this. */

import { canonicalizeBrand, brandNameVariants } from "@/lib/verified-store";
import { PRODUCT_CATEGORIES, PRODUCT_TYPES, CONCERNS, ACTIVE_INGREDIENTS } from "@/data/taxonomy";

export type NoProductReason = "brand-only" | "generic" | "echoes-brand";

export interface NoSpecificProduct {
  reason: NoProductReason;
  /** The brand the text names, spelt as the brand list spells it. Null when it names none. */
  brand: string | null;
}

/** An analysed product offered in place of the one that was not named. */
export interface ProductSuggestion {
  name: string;
  slug: string;
}

/** What an engine returns instead of an analysis when the person has not said which product they mean. Nothing was analysed and nothing was saved. */
export interface NeedsProductResult {
  type: "needs-product";
  query: string;
  /** The brand the search named, so the question can say "Which Cetaphil product do you mean?". Null for a kind of product ("Sunscreen"). */
  brand: string | null;
  /** Products of that brand we have already analysed (at most MAX_SUGGESTIONS). Empty when the brand has none, or none was named. */
  suggestions: ProductSuggestion[];
}

export const MAX_SUGGESTIONS = 8;

/* ── words ─────────────────────────────────────────────────── */

/** Lower-case words, letters and digits of any script, accents and apostrophes removed, "&" read as "and": "Kiehl's" is "kiehls", "Dot & Key" is "dot and key". */
const wordsOf = (s: string): string[] =>
  s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " and ").replace(/['’`´]/g, "")
    .split(/[^\p{L}\p{N}]+/u).filter(Boolean);

/** A trailing plural "s" is dropped from words long enough to carry one ("cleansers" is "cleanser"; "gas" and "spf" are left alone). */
const stem = (w: string): string => (w.length > 4 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w);

/** The words of a name that tell one brand or product from another: "and" and "the" never do ("Dot & Key" is "Dot and Key" is "dot key"). */
const coreWords = (s: string): string[] => wordsOf(s).filter((w) => w !== "and" && w !== "the").map(stem);

/** What a search says around a product and not about it: asking, buying, comparing, the country. */
const CHATTER = new Set([
  "a", "an", "and", "or", "the", "for", "with", "without", "of", "in", "on", "to", "by", "from", "at", "my", "me", "i", "you", "is", "are", "does", "do", "it",
  "what", "which", "how", "best", "top", "good", "great", "new", "cheap", "affordable", "budget", "buy", "online", "price", "india", "indian", "review", "analysis",
  "ingredient", "safe", "use", "recommend", "recommendation", "pack", "set", "combo", "kit", "product", "brand",
]);

/** A size, a strength, a sun rating: a variant of a product, not what it is. Numbers, units, SPF and the PA rating ("PA++++" is "pa"). */
const SPEC = /^(?:\d+(?:\.\d+)?|ml|gm|g|kg|oz|fl|l|mg|spf|pa|uva|uvb|uv|pcs)$/;

/** What a product is called, and nothing more. Taxonomy words that describe it (gentle, foaming, hydrating, mineral) are deliberately not here: "Cetaphil Gentle
    Skin Cleanser" and "CeraVe Foaming Facial Cleanser" are real products, and a brand beside a noun is all this set is for. */
const NOUNS = new Set([
  "cleanser", "wash", "facewash", "soap", "serum", "moisturiser", "moisturizer", "cream", "creme", "lotion", "gel", "sunscreen", "sunblock", "toner", "mask", "shampoo",
  "conditioner", "oil", "balm", "scrub", "exfoliant", "essence", "ampoule", "mist", "spray", "foam", "wipe", "remover", "primer", "foundation", "concealer", "lipstick",
  "screen", "mascara", "kajal", "eyeliner", "blush", "highlighter", "deodorant", "perfume", "treatment", "skincare", "haircare", "care",
  // where on the body it goes
  "face", "facial", "skin", "body", "hair", "scalp", "lip", "eye", "hand", "foot",
]);

/** Words that describe the person or the kind of product more than the product: only a search with no brand in it is judged against these (see the header). */
const DESCRIPTORS = new Set([
  "natural", "organic", "ayurvedic", "herbal", "vegan", "korean", "men", "man", "women", "woman", "kid", "baby", "teen", "normal", "combination", "mature", "all", "type",
  "daily", "night", "day",
]);

/** Every word of the taxonomy's categories, product types, concerns and actives (labels and synonyms): "vitamin", "niacinamide", "acne", "pigmentation", "oily". */
const TAXONOMY_WORDS: Set<string> = (() => {
  const out = new Set<string>();
  for (const item of [...PRODUCT_CATEGORIES, ...PRODUCT_TYPES, ...CONCERNS, ...ACTIVE_INGREDIENTS]) {
    for (const text of [item.label, ...item.synonyms]) for (const w of coreWords(text)) out.add(w);
  }
  return out;
})();

const isFiller = (w: string): boolean => CHATTER.has(w) || SPEC.test(w);
const isNoun = (w: string): boolean => NOUNS.has(w);
const isGeneric = (w: string): boolean => isNoun(w) || DESCRIPTORS.has(w) || TAXONOMY_WORDS.has(w);

/* ── brands ────────────────────────────────────────────────── */

/** Words a company puts after its name that a shopper leaves off: "Humuss Beauty" is "Humuss", "Simple Skincare" is "Simple", "The Derma Co" is "Derma". */
const COMPANY_WORDS = new Set(["skincare", "beauty", "herbal", "organic", "cosmetic", "natural", "lab", "co", "company", "care", "pro", "by"]); // as coreWords spells them: singular

interface BrandEntry {
  display: string;
  /** Each spelling as words, longest first: the full name, the name without its company words, and every alias of the brand. */
  keys: string[][];
}

function brandEntry(display: string): BrandEntry | null {
  const keys = new Map<string, string[]>();
  for (const spelling of [canonicalizeBrand(display), ...brandNameVariants(display), display]) {
    const full = coreWords(spelling);
    if (!full.length) continue;
    keys.set(full.join(" "), full);
    const short = full.filter((w) => !COMPANY_WORDS.has(w));
    if (short.length && short.length < full.length) keys.set(short.join(" "), short);
  }
  // A one-letter name is no key: it would match inside any text.
  const usable = [...keys.values()].filter((k) => k.join("").length >= 2);
  return usable.length ? { display: display.trim(), keys: usable.sort((a, b) => b.length - a.length) } : null;
}

function brandEntries(brands: readonly string[]): BrandEntry[] {
  const seen = new Set<string>();
  const out: BrandEntry[] = [];
  for (const b of brands) {
    const k = coreWords(b).join(" ");
    if (!k || seen.has(k)) continue;
    seen.add(k);
    const entry = brandEntry(b);
    if (entry) out.push(entry);
  }
  return out;
}

/** Index of the first place `key` appears in `words` as a run of whole words, or -1. */
function indexOfRun(words: string[], key: string[]): number {
  for (let i = 0; i + key.length <= words.length; i++) {
    if (key.every((k, j) => words[i + j] === k)) return i;
  }
  return -1;
}

/** The words with every brand in `entries` that appears in them taken out (the longest spelling first), and the first brand found. */
function withoutBrands(words: string[], entries: BrandEntry[]): { rest: string[]; brand: string | null } {
  let rest = words;
  let brand: string | null = null;
  const candidates = entries.flatMap((entry) => entry.keys.map((key) => ({ entry, key }))).sort((a, b) => b.key.length - a.key.length);
  for (const { entry, key } of candidates) {
    for (let at = indexOfRun(rest, key); at !== -1; at = indexOfRun(rest, key)) {
      rest = [...rest.slice(0, at), ...rest.slice(at + key.length)];
      brand ??= entry.display;
    }
  }
  return { rest, brand };
}

/** Does the text name this brand? ("Dot and key" names "Dot & Key"; "dot" alone does not.) */
export function mentionsBrand(text: string, brand: string): boolean {
  const entry = brandEntry(brand);
  return !!entry && entry.keys.some((key) => indexOfRun(coreWords(text), key) !== -1);
}

/** The brand to name when asking which product is meant ("Which Cetaphil product do you mean?"): the one the person typed, and only that. A brand that only the
    model returned (the "M .Y Sunscreen" of a search for "Sunscreen", or a real brand the model chose for "the blue one from the shop") is not put in the person's mouth. */
export function brandTyped(no: NoSpecificProduct, query: string): string | null {
  return no.brand && mentionsBrand(query, no.brand) ? no.brand : null;
}

/* ── the two questions ─────────────────────────────────────── */

/** The text a person typed, when it names no specific product: only a brand, only a kind of product ("Sunscreen", "acne serum", "face wash for oily skin"),
    or a brand and a kind of product ("Cetaphil cleanser", "Dot and key sunscreen SPF 50"). Null when it carries any word it cannot place, which is the
    product's own name. A link, or text with no letters or digits in it, is not judged. `brands` are the names of the brands to look for. */
export function queryNamesNoProduct(query: string, brands: readonly string[]): NoSpecificProduct | null {
  if (/^https?:\/\//i.test(query.trim())) return null;
  const words = coreWords(query);
  if (!words.length) return null;
  const { rest, brand } = withoutBrands(words, brandEntries(brands));
  const left = rest.filter((w) => !isFiller(w));
  if (brand) return left.every(isNoun) ? { reason: "brand-only", brand } : null;
  return left.every(isGeneric) ? { reason: "generic", brand: null } : null;
}

/** The name the model chose for a product, when it names none: the brand again ("Cetaphil" by Cetaphil, "Dot and key" by Dot & Key), or nothing but the brand
    and a kind of product ("Cetaphil Cleanser", "M .Y Sunscreen" by "M .Y Sunscreen"). */
export function resultNamesNoProduct(productName: string, brand: string): NoSpecificProduct | null {
  const name = coreWords(productName);
  if (!name.length) return null;
  const brandWords = coreWords(brand);
  if (brandWords.length && name.join(" ") === brandWords.join(" ")) return { reason: "echoes-brand", brand: brand.trim() };
  const entry = brandEntry(brand);
  const { rest } = withoutBrands(name, entry ? [entry] : []);
  return rest.filter((w) => !isFiller(w)).every(isNoun) ? { reason: "echoes-brand", brand: brand.trim() || null } : null;
}

/** Is the text exactly the name of one of these products (with or without its brand in front)? A product we hold under a name made only of taxonomy words
    ("Hydrating Gel Cream" by Glow Lab) is served when someone types that name, not asked about. A stored row whose name is itself only a brand and a noun is
    left out: that is the kind of row this module stops being made, and it must not make the search for it a product. */
export function namesStoredProduct(query: string, products: readonly { name: string; brand: string }[]): boolean {
  const typed = coreWords(query).join(" ");
  if (!typed) return false;
  return products.some((p) => !resultNamesNoProduct(p.name, p.brand) && (coreWords(p.name).join(" ") === typed || coreWords(`${p.brand} ${p.name}`).join(" ") === typed));
}
