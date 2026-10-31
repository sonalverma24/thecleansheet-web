/* Recognising a pasted ingredient (INCI) list.

   A bare list identifies no product: it carries a formula but no brand or product name, so
   an analysis of it is shown to the person who pasted it and never saved to the repository or
   listed on /products. Both engines ask this one question before they save (runProductReview
   in product-review-engine.ts, runDeepScan in review-engine.ts).

   A typed product name ("Cetaphil Gentle Skin Cleanser") must stay a product, so the test is
   conservative where a name and a list could be confused. It looks at the input in four ways:
     1. an "Ingredients:" / "INCI:" label in front of it,
     2. five or more items, split on any of the separators a paste arrives with,
     3. fewer items, when most of them read as ingredient names,
     4. no separators at all (a space-separated paste), when most of the words read as ingredient names.
   A word reads as an ingredient name when it is in the reference database (src/data/ingredients.json),
   is a word that only ingredient names use (Sodium, Extract, Triglyceride), or ends the way chemical
   names do (-amide, -glyceride, -stearate, -methicone, -paraben). The endings are listed by name, not as a
   bare -ate / -ine / -ol / -ic, on purpose: "Ultimate", "Routine", "Control" and "Organic" are product
   words and must not match. */

import { lookupIngredient } from "@/lib/ingredient-db";

const isURL = (t: string) => /^https?:\/\//i.test(t.trim());

/** A label in front of the list: "Ingredients:", "INCI -", "Active ingredients:", or the word on a line of its own. */
const LABEL = /^\s*(?:(?:full|complete|key|active)\s+)?(?:ingredients?(?:\s+list)?|inci(?:\s+list)?|composition)\s*(?::|[-–—]|\n)\s*/i;

/** Where one ingredient ends and the next begins: comma, semicolon, new line or tab, bullet, pipe, slash, a spaced dash,
    or a full stop that ends a word ("Aqua. Glycerin."). A full stop inside a word or number ("e.l.f.", "10.5%", "Dr. Sheth's") is not one. */
const SEPARATOR = /[,;\n\r\t•·●▪◦‣∙|/]+|\s[-–—]\s|(?<=[a-z]{3})\.(?=\s|$)/i;

const MAX_PARTS = 400; // a paste can be long; the answer is clear long before the end

const FILLER = new Set(["and", "of", "with", "in", "to", "the", "from", "qs"]);

/** Lower-case letters-only words, without brackets ("(Water)", "(and)"), digits and punctuation. */
const wordsOf = (s: string): string[] =>
  (s.toLowerCase().replace(/\([^)]*\)/g, " ").match(/[a-z]{2,}/g) ?? []).filter((w) => !FILLER.has(w)).slice(0, MAX_PARTS);

/* Words that appear inside ingredient names and almost nowhere else. The database covers whole names;
   these cover the pieces of names it does not hold ("Sodium Hyaluronate", "Camellia Sinensis Leaf Extract"). */
const INCI_WORDS = new Set([
  "aqua", "water", "eau", "parfum", "fragrance", "perfume", "alcohol", "glycol", "glycerin", "glycerine",
  "sodium", "potassium", "calcium", "magnesium", "aluminium", "aluminum", "zinc", "titanium", "silica", "mica", "talc", "iron",
  "dioxide", "oxide", "oxides", "hydroxide", "extract", "oil", "butter", "wax", "acid", "gum", "juice", "powder", "ferment", "filtrate",
  "lysate", "protein", "hydrolyzed", "hydrolysed", "hydrogenated", "leaf", "root", "seed", "fruit", "flower", "bark", "peel", "kernel", "resin",
  "peg", "ppg", "ci", "pca", "edta", "bht", "pvp", "polymer", "copolymer", "crosspolymer", "carbomer", "dimethicone", "tocopherol", "retinol",
  "phenoxyethanol", "oxybenzone", "octinoxate", "avobenzone", "octocrylene", "homosalate", "octisalate", "ceramide", "triglyceride",
  // the adjective in the name of an acid
  "stearic", "palmitic", "lauric", "myristic", "oleic", "linoleic", "linolenic", "hyaluronic", "salicylic", "glycolic", "lactic", "citric", "ascorbic",
  "caprylic", "capric", "benzoic", "sorbic", "ferulic", "azelaic", "kojic", "tranexamic", "mandelic", "malic", "tartaric", "gluconic", "folic", "retinoic",
]);

const INCI_ENDING = /(?:amide|amine|glyceride|saccharide|glucoside|glycoside|acetate|benzoate|sorbate|stearate|palmitate|laurate|myristate|oleate|citrate|lactate|gluconate|hyaluronate|carbonate|phosphate|sulfate|sulphate|silicate|salicylate|ascorbate|glutamate|methicone|siloxane|tocopheryl|ethanol|paraben|diol|cellulose)$|^.{4,}(?:yl|eth)$/;

/** Words a product is called and an ingredient never is. */
const PRODUCT_WORDS = new Set([
  "serum", "cream", "lotion", "shampoo", "conditioner", "cleanser", "wash", "sunscreen", "moisturiser", "moisturizer",
  "toner", "mask", "spf", "foundation", "lipstick", "mist", "scrub", "balm", "ampoule", "primer", "concealer", "mascara", "kajal",
]);

/** The last word of a name made of a plant or a material: "Aloe Barbadensis Leaf Extract", "Butyrospermum Parkii Butter". */
const HEAD_WORDS = new Set(["extract", "oil", "butter", "wax", "acid", "alcohol", "glycol", "gum", "juice", "powder", "ferment", "filtrate", "protein", "water", "lysate", "resin"]);

const wordReadsAsIngredient = (w: string): boolean => INCI_WORDS.has(w) || INCI_ENDING.test(w) || lookupIngredient(w) !== undefined;

/** Most of the words must read as ingredient names, not all: a space-separated paste that holds a slash ("Caprylic/Capric
    Triglyceride") arrives as long items, and one abbreviation in them ("Ceramide NP") must not decide it. */
const MOSTLY = 0.75;

function itemReadsAsIngredient(item: string): boolean {
  const words = wordsOf(item);
  if (!words.length || words.some((w) => PRODUCT_WORDS.has(w))) return false;
  return lookupIngredient(item) !== undefined || HEAD_WORDS.has(words[words.length - 1]) || words.filter(wordReadsAsIngredient).length / words.length >= MOSTLY;
}

export function looksLikeInciList(text: string): boolean {
  if (isURL(text)) return false;
  const body = text.replace(LABEL, "");
  if (body !== text && body.trim()) return true;
  const items = body.split(SEPARATOR).map((s) => s.trim()).filter(Boolean);
  if (items.length >= 5) return true;
  if (items.length >= 2) return items.filter(itemReadsAsIngredient).length / items.length >= 0.75;
  const words = wordsOf(body);
  if (words.length < 4 || words.some((w) => PRODUCT_WORDS.has(w))) return false;
  return words.filter(wordReadsAsIngredient).length / words.length >= MOSTLY;
}
