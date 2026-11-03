import { describe, expect, it } from "vitest";
import { KNOWN_BRAND_NAMES } from "@/data/brands/known-names";
import { PRODUCT_CATEGORIES, PRODUCT_TYPES, CONCERNS } from "@/data/taxonomy";
import { brandTyped, mentionsBrand, namesStoredProduct, queryNamesNoProduct, resultNamesNoProduct } from "@/lib/specific-product";

/* The brands the engine would hold on 2026-11-02: the built-in list, the brands table (16) and the brand of every saved analysis (32 distinct). */
const HELD = [
  "Antinorm", "Aqualogica", "CodeSkin", "Deconstruct", "Dot & Key", "Foxtale", "Hyphen", "Kiehl's", "Lotus Herbals", "Mamaearth", "Minimalist", "Pilgrim", "Plum", "Simple Skincare", "The Derma Co",
  "Aestura", "Aqueria", "Aravi Organic", "Asaya", "Be Minimalist", "Beauty of Joseon", "Bioderma", "Biotique", "Bombae", "Brinton", "Cetaphil", "Clinique", "Conscious Chemist", "COSRX", "CRUSMETIC",
  "Dr Sheth's", "GLAMVEDA", "Humuss Beauty", "Omeo", "Phillauri", "PROWL by Tiger Shroff", "Re'equil", "Scalpe Pro", "Skince", "The Solved Skin", "WishCare",
];
const BRANDS = [...KNOWN_BRAND_NAMES, ...HELD];

/* ── the search table ──────────────────────────────────────────
   `product: true`  the text names a specific product (a real one, or a real one typed the way a shopper types it), so it must be analysed.
   `product: false` the text names none (a brand alone, a kind of product, a brand and a kind of product), so the shopper is asked.
   A false positive is a real product that is asked about; a false negative is a search that names no product and goes through to the model.
   The two lists the table must produce are pinned below: when the detector changes, the lists change, and the pull request says so. */
const SEARCHES: { q: string; product: boolean }[] = [
  // real products, typed in full
  { q: "Cetaphil Gentle Skin Cleanser", product: true },
  { q: "Dot and key watermelon sunscreen", product: true },
  { q: "Dot & Key Watermelon Cooling Sunscreen", product: true },
  { q: "Minimalist 10% Niacinamide Serum", product: true },
  { q: "Be Minimalist Vitamin B5 10% Moisturizer", product: true },
  { q: "The Ordinary Niacinamide 10% + Zinc 1%", product: true },
  { q: "CeraVe Foaming Facial Cleanser", product: true },
  { q: "CeraVe Moisturising Cream", product: true },
  { q: "La Roche-Posay Anthelios UVMune 400", product: true },
  { q: "Neutrogena Hydro Boost Water Gel", product: true },
  { q: "Neutrogena Ultra Sheer Dry-Touch Sunscreen SPF 50+", product: true },
  { q: "Plum 15% Mandelic Acid Serum", product: true },
  { q: "Pilgrim Korean Rice Water Hydra Glow Moisturizer", product: true },
  { q: "Foxtale Cover Up Mattyfying Sunscreen", product: true },
  { q: "Kiehl's Ultra Facial Cream", product: true },
  { q: "Kiehls Midnight Recovery Concentrate", product: true },
  { q: "Bioderma Sensibio H2O", product: true },
  { q: "Simple Kind to Skin Refreshing Facial Wash", product: true },
  { q: "Re'equil Retinol Night Cream", product: true },
  { q: "Dr. Sheths Copper Peptide", product: true },
  { q: "Aqualogica Glow+ Dewy Sunscreen", product: true },
  { q: "Himalaya Neem Face Wash", product: true },
  { q: "Mamaearth Vitamin C Face Wash", product: true },
  { q: "Lotus Herbals Safe Sun UV Screen Matte Gel SPF 50", product: true },
  { q: "Nivea Soft Light Moisturiser", product: true },
  { q: "Cetaphil Daily Facial Moisturizer", product: true },
  { q: "Cetaphil Moisturising Cream", product: true },
  { q: "Cetaphil Oily Skin Cleanser", product: true },
  { q: "Vaseline Petroleum Jelly", product: true },
  { q: "Garnier Micellar Cleansing Water", product: true },
  { q: "Sebamed Clear Face Gel", product: true },
  { q: "Lakmé 9 to 5 Primer + Matte Perfect Cover Foundation", product: true },
  // real products, typed the way a shopper types them
  { q: "Cetaphil gentle cleanser", product: true },
  { q: "Watermelon Cooling Sunscreen", product: true },
  { q: "Vitamin C + E Super Bright Gel Moisturizer", product: true },
  { q: "पतंजलि एलोवेरा जेल", product: true },
  { q: "https://www.nykaa.com/cetaphil-gentle-skin-cleanser/p/123", product: true },
  // real products the detector asks about anyway (false positives): every word is one it knows
  { q: "Nivea Creme", product: true },
  { q: "Niacinamide 10% + Zinc 1%", product: true },
  { q: "Hyaluronic + Ceramide Barrier Repair Hydrating Face Moisturizer", product: true },
  // a brand alone, in the spellings a shopper uses
  { q: "Cetaphil", product: false },
  { q: "cetaphil", product: false },
  { q: "CETAPHIL!", product: false },
  { q: "Dot and key", product: false },
  { q: "Dot & Key", product: false },
  { q: "dot-and-key", product: false },
  { q: "Kiehl's", product: false },
  { q: "kiehls", product: false },
  { q: "La Roche-Posay", product: false },
  { q: "la roche posay", product: false },
  { q: "Minimalist", product: false },
  { q: "Be Minimalist", product: false },
  { q: "The Derma Co", product: false },
  { q: "derma co", product: false },
  { q: "Dr. Sheth's", product: false },
  { q: "Brinton", product: false },
  { q: "CeraVe", product: false },
  // a brand and a kind of product
  { q: "Cetaphil cleanser", product: false },
  { q: "CeraVe moisturiser", product: false },
  { q: "Dot and key sunscreen SPF 50", product: false },
  { q: "Himalaya face wash", product: false },
  { q: "Plum moisturizer", product: false },
  { q: "Minimalist SPF 50", product: false },
  { q: "Dove soap", product: false },
  // a kind of product, a concern, an active, a question
  { q: "Sunscreen", product: false },
  { q: "sun screen", product: false },
  { q: "face wash", product: false },
  { q: "moisturizer", product: false },
  { q: "moisturiser for oily skin", product: false },
  { q: "best sunscreen for oily skin in India", product: false },
  { q: "niacinamide serum", product: false },
  { q: "vitamin c serum", product: false },
  { q: "retinol", product: false },
  { q: "acne", product: false },
  { q: "dark spots", product: false },
  { q: "SPF 50", product: false },
  { q: "shampoo for dandruff", product: false },
  { q: "hair oil", product: false },
  { q: "lip balm", product: false },
  { q: "sunscreen SPF 50 PA++++", product: false },
  { q: "korean sunscreen", product: false },
  { q: "Is niacinamide safe in pregnancy", product: false },
  // searches that name no product and get through (false negatives): a word it does not know
  { q: "dot n key", product: false },
  { q: "LRP", product: false },
  { q: "Cetaphill", product: false },
  { q: "matte sunscreen", product: false },
  { q: "Aveeno baby lotion", product: false },
];

/** A shopper who types the whole name expects an analysis. The detector's own answer for each search is `queryNamesNoProduct(q, BRANDS) !== null`. */
const flagged = (q: string) => queryNamesNoProduct(q, BRANDS) !== null;

const FALSE_POSITIVES = [
  "Nivea Creme",
  "Niacinamide 10% + Zinc 1%",
  "Hyaluronic + Ceramide Barrier Repair Hydrating Face Moisturizer",
];
const FALSE_NEGATIVES = ["dot n key", "LRP", "Cetaphill", "matte sunscreen", "Aveeno baby lotion"];

describe("queryNamesNoProduct: the search table", () => {
  const real = SEARCHES.filter((s) => s.product);
  const none = SEARCHES.filter((s) => !s.product);

  it("has at least 40 awkward searches, real and not", () => {
    expect(SEARCHES.length).toBeGreaterThanOrEqual(40);
    expect(real.length).toBeGreaterThanOrEqual(20);
    expect(none.length).toBeGreaterThanOrEqual(20);
  });

  it("asks about every search that names no product, except the listed false negatives", () => {
    expect(none.filter((s) => !flagged(s.q)).map((s) => s.q)).toEqual(FALSE_NEGATIVES);
  });

  it("lets every real product through, except the listed false positives", () => {
    expect(real.filter((s) => flagged(s.q)).map((s) => s.q)).toEqual(FALSE_POSITIVES);
  });

  it("reports the counts the pull request quotes", () => {
    const fp = real.filter((s) => flagged(s.q)).length;
    const fn = none.filter((s) => !flagged(s.q)).length;
    expect({ real: real.length, fp, none: none.length, fn }).toEqual({ real: real.length, fp: FALSE_POSITIVES.length, none: none.length, fn: FALSE_NEGATIVES.length });
  });
});

describe("queryNamesNoProduct: the three searches that made junk tiles", () => {
  it('"Sunscreen" is a kind of product, not a product', () => {
    expect(queryNamesNoProduct("Sunscreen", BRANDS)).toEqual({ reason: "generic", brand: null });
  });
  it('"Dot and key" is the brand Dot & Key', () => {
    expect(queryNamesNoProduct("Dot and key", BRANDS)).toEqual({ reason: "brand-only", brand: "Dot & Key" });
  });
  it('"Cetaphil" is the brand Cetaphil', () => {
    expect(queryNamesNoProduct("Cetaphil", BRANDS)).toEqual({ reason: "brand-only", brand: "Cetaphil" });
  });
  it("a product typed beside the brand is not asked about", () => {
    expect(queryNamesNoProduct("Cetaphil Gentle Skin Cleanser", BRANDS)).toBeNull();
    expect(queryNamesNoProduct("Dot and key watermelon sunscreen", BRANDS)).toBeNull();
  });
});

describe("queryNamesNoProduct: how a brand is recognised", () => {
  it.each([
    ["case and punctuation", "CETAPHIL!!", "Cetaphil"],
    ["& for and", "dot & key", "Dot & Key"],
    ["and for &", "Dot and Key", "Dot & Key"],
    ["a missing and", "dot key", "Dot & Key"],
    ["hyphens for spaces", "dot-and-key", "Dot & Key"],
    ["a leading The", "the derma co", "The Derma Co"],
    ["no leading The", "derma co", "The Derma Co"],
    ["a dropped apostrophe", "Kiehls", "Kiehl's"],
    ["a typographic apostrophe", "Kiehl’s", "Kiehl's"],
    ["an accent", "Estee Lauder", "Estée Lauder"],
    ["the brand without its company word", "Humuss", "Humuss Beauty"],
    ["the brand without its company word, again", "Simple", "Simple Skincare"],
    ["a dropped apostrophe in a two word name", "Dr Sheths", "Dr Sheth's"],
    ["a name split by a hyphen", "La Roche Posay", "La Roche-Posay"],
    ["extra spaces and a trailing full stop", "  Pilgrim . ", "Pilgrim"],
  ])("%s", (_label, text, brand) => {
    expect(queryNamesNoProduct(text, BRANDS)?.brand ?? null).toBe(brand);
  });

  it("reads the old and the new name of a rebranded brand as the same brand", () => {
    for (const text of ["Minimalist", "Be Minimalist"]) expect(queryNamesNoProduct(text, BRANDS), text).toMatchObject({ reason: "brand-only", brand: expect.stringMatching(/Minimalist$/) });
  });

  it("does not take a brand's word from the middle of another word", () => {
    expect(queryNamesNoProduct("Plumping Lip Serum Maple", BRANDS)).toBeNull();
    expect(queryNamesNoProduct("Cetaphilia Gentle", BRANDS)).toBeNull();
  });

  it("finds a brand that is only in the list it was given", () => {
    expect(queryNamesNoProduct("Zorbex", BRANDS)).toBeNull();
    expect(queryNamesNoProduct("Zorbex", [...BRANDS, "Zorbex"])).toEqual({ reason: "brand-only", brand: "Zorbex" });
  });

  it("finds the brand the model returned when the list does not hold it", () => {
    expect(queryNamesNoProduct("Zorbex sunscreen", ["Zorbex"])).toEqual({ reason: "brand-only", brand: "Zorbex" });
    expect(queryNamesNoProduct("Zorbex Mineral Fluid SPF 50", ["Zorbex"])).toBeNull();
  });

  it("never takes a one-letter brand name for a brand: it would match inside any text", () => {
    expect(queryNamesNoProduct("M serum", ["M"])?.brand ?? null).toBeNull();
  });
});

describe("queryNamesNoProduct: the words that make a name", () => {
  it("passes a name with one word it cannot place: an adjective, a flavour, an ingredient, a line name", () => {
    for (const q of ["Cetaphil Gentle Cleanser", "Cetaphil Daily Moisturizer", "Plum Green Tea Moisturizer", "Minimalist Salicylic Acid Serum", "Pilgrim Hydra Glow", "Plum 15% Niacinamide Serum"]) {
      expect(queryNamesNoProduct(q, BRANDS), q).toBeNull();
    }
  });

  it("asks when a brand is followed only by nouns, sizes, a sun rating or search chatter", () => {
    for (const q of ["Cetaphil face wash", "Cetaphil cleanser 250 ml", "Cetaphil sunscreen SPF 50 PA+++", "best Cetaphil moisturiser in India", "Cetaphil face wash price", "Cetaphil reviews"]) {
      expect(queryNamesNoProduct(q, BRANDS), q).toMatchObject({ reason: "brand-only", brand: "Cetaphil" });
    }
  });

  it("judges a search with no brand in it against the whole taxonomy", () => {
    for (const q of ["hydrating gel moisturizer", "oil control serum for acne", "anti dandruff shampoo", "mineral sunscreen for sensitive skin", "pigmentation", "korean vitamin c serum"]) {
      expect(queryNamesNoProduct(q, BRANDS), q).toEqual({ reason: "generic", brand: null });
    }
  });

  it("does not judge a search with a word the taxonomy does not hold", () => {
    for (const q of ["watermelon sunscreen", "rose water toner", "ubtan face wash", "kumkumadi serum", "snail mucin essence"]) {
      expect(queryNamesNoProduct(q, BRANDS), q).toBeNull();
    }
  });

  it("does not judge a link, or text with no letters or digits, or text in a script the lists do not know", () => {
    expect(queryNamesNoProduct("https://www.amazon.in/dp/B0ABC12345", BRANDS)).toBeNull();
    expect(queryNamesNoProduct("???", BRANDS)).toBeNull();
    expect(queryNamesNoProduct("   ", BRANDS)).toBeNull();
    expect(queryNamesNoProduct("सनस्क्रीन", BRANDS)).toBeNull();
  });

  it("reads every label of the taxonomy's product categories, product types and concerns, typed alone, as a kind of product", () => {
    const labels = [...PRODUCT_CATEGORIES, ...PRODUCT_TYPES, ...CONCERNS].map((item) => item.label);
    expect(labels.length).toBeGreaterThan(100);
    expect(labels.filter((label) => queryNamesNoProduct(label, []) === null)).toEqual([]);
  });
});

/* ── the result table ──────────────────────────────────────── */

const RESULTS: { name: string; brand: string; echoes: boolean }[] = [
  // the three rows that were saved
  { name: "M .Y Sunscreen", brand: "M .Y Sunscreen", echoes: true },
  { name: "Dot and key", brand: "Dot and key", echoes: true },
  { name: "Cetaphil", brand: "Cetaphil", echoes: true },
  // the same, spelt differently from the brand
  { name: "Dot & Key", brand: "Dot and Key", echoes: true },
  { name: "DOT & KEY", brand: "dot and key", echoes: true },
  { name: "dot-and-key", brand: "Dot & Key", echoes: true },
  { name: "Kiehl's", brand: "Kiehls", echoes: true },
  { name: "  Cetaphil. ", brand: "Cetaphil", echoes: true },
  { name: "Be Minimalist", brand: "Minimalist", echoes: true },
  // a brand and a kind of product, or a kind of product alone
  { name: "Cetaphil Cleanser", brand: "Cetaphil", echoes: true },
  { name: "Cetaphil Face Wash", brand: "Cetaphil", echoes: true },
  { name: "Sunscreen", brand: "Dot & Key", echoes: true },
  { name: "Humuss Sunscreen", brand: "Humuss Beauty", echoes: true },
  { name: "Plum Face Wash SPF 50", brand: "Plum", echoes: true },
  { name: "M .Y Sunscreen Gel", brand: "M .Y Sunscreen", echoes: true },
  { name: "Moisturiser", brand: "", echoes: true },
  // products
  { name: "Cetaphil Gentle Skin Cleanser", brand: "Cetaphil", echoes: false },
  { name: "Gentle Skin Cleanser", brand: "Cetaphil", echoes: false },
  { name: "Dot & Key Watermelon Cooling Sunscreen", brand: "Dot & Key", echoes: false },
  { name: "Watermelon Cooling Sunscreen", brand: "Dot & Key", echoes: false },
  { name: "Cetaphil Moisturising Cream", brand: "Cetaphil", echoes: false },
  { name: "2-in-1 Heat Protectant", brand: "Bombae", echoes: false },
  { name: "Volumizer Hot Air Brush", brand: "Skince", echoes: false },
  { name: "Acmist Moisturizing Cream Gel With Quick Absorbing Formulation", brand: "Brinton", echoes: false },
  { name: "Minimalist SPF 70 PA++++ Matte Sunscreen for Oily Skin with Niacinamide", brand: "Be Minimalist", echoes: false },
  { name: "Dr Sheth 's Copper Peptide", brand: "Dr Sheth's", echoes: false },
  { name: "PROWL by Tiger Shroff 10% Vitamin C Brightening Daily Face Serum", brand: "PROWL by Tiger Shroff", echoes: false },
  // a result with no name to judge
  { name: "", brand: "Cetaphil", echoes: false },
];

describe("resultNamesNoProduct: what the model named", () => {
  it.each(RESULTS)("$name by $brand", ({ name, brand, echoes }) => {
    expect(resultNamesNoProduct(name, brand) !== null).toBe(echoes);
  });

  it("says which brand an echo is of, only when there is one", () => {
    expect(resultNamesNoProduct("Cetaphil", "Cetaphil")).toEqual({ reason: "echoes-brand", brand: "Cetaphil" });
    expect(resultNamesNoProduct("Sunscreen", "")).toEqual({ reason: "echoes-brand", brand: null });
  });
});

/* The product names saved in product_reviews on 2026-11-02 (37 rows, read from the live table). None of them is a brand alone or a brand and a noun: every one
   must pass as a name the model chose, and as a search typed in full. */
const SAVED: [brand: string, name: string][] = [
  ["Aestura", "Aestura Atobarrier 365 Cream"],
  ["Aqualogica", "Aqualogica Glow+ Hydra Gel Moisturizer With Papaya & Vitamin C For 24 Hour Intense Hydration"],
  ["Aqueria", "Aqueria 10% Vitamin C Face Serum"],
  ["Aravi Organic", "Aravi Organic Oil-Free Fluid Sunscreen Serum SPF 50 PA++++ with Hyaluronic Acid, Vitamin C, Niacinamide & Ceramides"],
  ["Asaya", "Asaya 2% Kojic Acid + 1% Alpha Arbutin Face Serum"],
  ["Be Minimalist", "Be Minimalist Vitamin B5 10% Moisturizer"],
  ["Be Minimalist", "Minimalist SPF 70 PA++++ Matte Sunscreen for Oily Skin with Niacinamide"],
  ["Beauty of Joseon", "Beauty of Joseon Dynasty Cream"],
  ["Bioderma", "Bioderma Atoderm Crème Ultra"],
  ["Biotique", "Biotique Morning Nectar Nourish & Hydrate Moisturizer"],
  ["Bombae", "2-in-1 Heat Protectant"],
  ["Brinton", "Acmist Moisturizing Cream Gel With Quick Absorbing Formulation"],
  ["Cetaphil", "Cetaphil Daily Facial Moisturizer"],
  ["Cetaphil", "Cetaphil Moisturising Cream"],
  ["Clinique", "Clinique Moisture Surge™ 100H Auto-Replenishing Hydrator"],
  ["Conscious Chemist", "Conscious Chemist Eye Contour Treatment"],
  ["COSRX", "COSRX Advanced Snail 92 All In One Cream"],
  ["CRUSMETIC", "CRUSMETIC Sunscreen SPF 50 PA++ UVA/UVB for Broad Spectrum | Sun Protection with Glowing Skin | No White Cast | For All Skin Types (Oily, Dry, Acne-prone) | For Men & Women"],
  ["Dot & Key", "Dot & Key Hyaluronic + Ceramide Barrier Repair Hydrating Face Moisturizer Cream, Normal To Dry Skin"],
  ["Dot & Key", "Dot & Key Strawberry Dew Brightening Moisturizer"],
  ["Dot & Key", "Dot & Key Vitamin C + E Super Bright Gel Moisturizer For Face, Visibly Boosts Glow"],
  ["Dot & Key", "Dot & Key Watermelon Cooling Sunscreen"],
  ["Dr Sheth's", "Dr Sheth 's Copper Peptide"],
  ["Foxtale", "Foxtale Cover Up Mattyfying Sunscreen"],
  ["GLAMVEDA", "GLAMVEDA Sunscreen - SPF 50 PA+++ Body Lotion with Hyaluronic acid, Peptide - Broad Spectrum Protection"],
  ["Humuss Beauty", "Humuss Beauty Sunscreen - SPF 50 PA+++ Lightweight D-Tan Sunscreen with Hyaluronic Acid, Vitamin - E | In-Vitro Tested"],
  ["Lotus Herbals", "Lotus Herbals Whiteglow Skin Whitening And Brighening Gel Creme"],
  ["Omeo", "Omeo Anti Dandruff Shampoo with Neem, Ginger & Thuja"],
  ["Phillauri", "Phillauri Sunscreen - SPF 50 PA+++ Niacinamide Sunscreen SPF 50 PA+++ | Smooth Skin Finish | Daily Sun Cream"],
  ["Pilgrim", "Pilgrim Korean Rice Water Hydra Glow Moisturizer"],
  ["Plum", "Plum Cerasense Barrier Repair Face Moisturizer With Ceramides & Peptides For Dry, Sensitive Skin"],
  ["PROWL by Tiger Shroff", "PROWL by Tiger Shroff 10% Vitamin C Brightening Daily Face Serum"],
  ["Re'equil", "Re'equil Retinol Night Cream 0.3% Retinol"],
  ["Scalpe Pro", "Scalpe Pro Daily Anti Dandruff Shampoo"],
  ["Skince", "Volumizer Hot Air Brush"],
  ["The Solved Skin", "The Solved Skin Spot Fade Advanced Repair Serum"],
  ["WishCare", "WishCare Cellular Reset 0.1% Retinal Shot Targets Fine Lines Wrinkles & Dark Circles"],
];

describe("every product name saved today", () => {
  it.each(SAVED)("%s: %s is a name, not an echo of the brand", (brand, name) => {
    expect(resultNamesNoProduct(name, brand)).toBeNull();
  });

  /** What a shopper who knows the brand types: the name, with the brand in front when the stored name leaves it out. */
  const typedWithBrand = (brand: string, name: string) => (mentionsBrand(name, brand) ? name : `${brand} ${name}`);

  it.each(SAVED)("%s: %s typed in full, with its brand, is a search for a product", (brand, name) => {
    expect(queryNamesNoProduct(typedWithBrand(brand, name), BRANDS)).toBeNull();
  });

  it("is served when typed bare, even where the name leaves the brand out and is all words the taxonomy holds", () => {
    const rows = SAVED.map(([brand, name]) => ({ brand, name }));
    // "2-in-1 Heat Protectant" is every word a hair-care search could be made of. Typed without Bombae it reads as a kind of product, but we hold it by that name.
    expect(queryNamesNoProduct("2-in-1 Heat Protectant", BRANDS)).toEqual({ reason: "generic", brand: null });
    for (const { brand, name } of rows) expect(queryNamesNoProduct(name, BRANDS) === null || namesStoredProduct(name, rows), `${brand}: ${name}`).toBe(true);
  });
});

describe("namesStoredProduct", () => {
  const stored = [
    { brand: "Glow Lab", name: "Hydrating Gel Cream" },
    { brand: "Cetaphil", name: "Cetaphil" }, // a junk row of the kind this module stops being made
  ];

  it("serves a search that is exactly a stored product's name, with or without the brand in front", () => {
    expect(queryNamesNoProduct("Hydrating Gel Cream", BRANDS)).toEqual({ reason: "generic", brand: null });
    expect(namesStoredProduct("Hydrating Gel Cream", stored)).toBe(true);
    expect(namesStoredProduct("glow lab hydrating gel cream", stored)).toBe(true);
  });

  it("does not serve a search that is only close to a stored name", () => {
    expect(namesStoredProduct("Hydrating Gel", stored)).toBe(false);
    expect(namesStoredProduct("Gel Cream", stored)).toBe(false);
  });

  it("never lets a stored row that is only its brand make a search for the brand a product", () => {
    expect(namesStoredProduct("Cetaphil", stored)).toBe(false);
  });
});

describe("brandTyped", () => {
  it("names the brand only when the person typed it", () => {
    expect(brandTyped({ reason: "brand-only", brand: "Dot & Key" }, "dot and key")).toBe("Dot & Key");
    expect(brandTyped({ reason: "echoes-brand", brand: "Cetaphil" }, "the blue one from the shop")).toBeNull();
    expect(brandTyped({ reason: "generic", brand: null }, "Sunscreen")).toBeNull();
  });
});

describe("mentionsBrand", () => {
  it("is true for any spelling of the brand in the text, and false for part of a word", () => {
    expect(mentionsBrand("my dot and key serum", "Dot & Key")).toBe(true);
    expect(mentionsBrand("Kiehls", "Kiehl's")).toBe(true);
    expect(mentionsBrand("dot", "Dot & Key")).toBe(false);
    expect(mentionsBrand("Cetaphilia", "Cetaphil")).toBe(false);
    expect(mentionsBrand("anything", "")).toBe(false);
  });
});
