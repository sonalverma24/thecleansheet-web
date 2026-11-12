import { afterEach, describe, expect, it, vi } from "vitest";
import { completeLastEntry, extendThroughPremixes, extractInciWithQuote, fetchInciFromProductPage } from "@/lib/inci-from-page";

const h = vi.hoisted(() => ({ markdown: null as string | null }));
vi.mock("@/lib/scrape", async (orig) => ({ ...(await orig<typeof import("@/lib/scrape")>()), fetchPageMarkdown: async () => h.markdown }));

afterEach(() => { vi.unstubAllGlobals(); h.markdown = null; });

/* 2026-11-03: WishCare's Cellular Reset 0.1% Retinal Shot on mywishcare.com prints "Full ingredients" with blends written the INCI way, "A (and) B". The last
   blends are nine and eleven words long: "Aqua (and) Butylene Glycol (and) Crambe Maritima Leaf Extract" is too long to be one entry, so the reader rejected it and the list
   ended at "Curcuma Longa Extract": 19 entries read, with the retinal itself and every entry after the blend lost. */
const URL = "https://www.mywishcare.com/products/retinal-retinol-serum";
const PRINTED = "Aqua, Dodecanol, Cetearyl Olivate (and) Sorbitan Olivate, Butylene Glycol, Propanediol, Dimethicone, Isononyl Isononanoate, Xylitylglucoside (and) Anhydroxylitol (and) Xylitol, Caprylic/Capric Triglyceride, Cetearyl Alcohol, Caffeine, Sodium Polyacryloyldimethyl Taurate (and) Silk Amino Acids, Ammonium Acryloyldimethyltaurate/VP Copolymer, Phenyl Trimethicone (and) Dimethicone Crosspolymer, Ascorbic Acid, Tocopheryl Acetate, Niacinamide, Phenoxyethanol (and) Ethylhexylglycerin, Curcuma Longa Extract, Aqua (and) Butylene Glycol (and) Crambe Maritima Leaf Extract, Sodium DNA (and) Panax Ginseng Root Extract, Ceramide NP (and) Ceramide AP (and) Ceramide EOP (and) Cholesterol (and) Phytosphingosine, Methylene Bis-Benzotriazolyl Tetramethylbutylphenol, Retinal, Acetyl Tetrapeptide-5 , Betaine";
const LIST = [
  "Aqua", "Dodecanol", "Cetearyl Olivate", "Sorbitan Olivate", "Butylene Glycol", "Propanediol", "Dimethicone", "Isononyl Isononanoate", "Xylitylglucoside", "Anhydroxylitol", "Xylitol",
  "Caprylic/Capric Triglyceride", "Cetearyl Alcohol", "Caffeine", "Sodium Polyacryloyldimethyl Taurate", "Silk Amino Acids", "Ammonium Acryloyldimethyltaurate/VP Copolymer",
  "Phenyl Trimethicone", "Dimethicone Crosspolymer", "Ascorbic Acid", "Tocopheryl Acetate", "Niacinamide", "Phenoxyethanol", "Ethylhexylglycerin", "Curcuma Longa Extract",
  "Crambe Maritima Leaf Extract", "Sodium DNA", "Panax Ginseng Root Extract", "Ceramide NP", "Ceramide AP", "Ceramide EOP", "Cholesterol", "Phytosphingosine",
  "Methylene Bis-Benzotriazolyl Tetramethylbutylphenol", "Retinal", "Acetyl Tetrapeptide-5", "Betaine",
];
const LEAD = "Results What makes it great Ingredients Boosts cellular skin renewal Supports collagen production & firms skin Full ingredients ";
const AFTER = "Pairs well with TRENDING (763) Niacinamide Oil Balance Fluid Sunscreen | SPF50 PA++++ Sale price ₹495 Regular price ₹499 Add to cart";
const PAGE = `${LEAD}${PRINTED}. ${AFTER}`;

describe("extendThroughPremixes: a list a '(and)' blend cut short", () => {
  it("shows the fault first: the extractor, which must not change, ends at Curcuma Longa Extract", () => {
    const raw = extractInciWithQuote(PAGE);
    expect(raw?.ingredients).toHaveLength(19);
    expect(raw?.ingredients.at(-1)).toBe("Curcuma Longa Extract");
    expect(raw?.ingredients).not.toContain("Retinal");
  });

  it("WishCare: reads all 37 entries, blends as their components, Retinal and Betaine included, and quotes the whole printed list", () => {
    const r = extendThroughPremixes(extractInciWithQuote(PAGE), PAGE);
    expect(r?.ingredients).toEqual(LIST);
    expect(r?.ingredients).toContain("Retinal");
    expect(r?.quote).toBe(PRINTED); // as printed, the page's own spacing before a comma included
    expect(PAGE).toContain(r!.quote);
  });

  it("names a repeat across blends once, in label order: Aqua and Butylene Glycol open the late blend after opening the list", () => {
    const r = extendThroughPremixes(extractInciWithQuote(PAGE), PAGE);
    expect(r?.ingredients.filter((x) => x === "Aqua")).toHaveLength(1);
    expect(r?.ingredients.filter((x) => x === "Butylene Glycol")).toHaveLength(1);
    expect(r?.ingredients.indexOf("Crambe Maritima Leaf Extract")).toBeGreaterThan(r!.ingredients.indexOf("Curcuma Longa Extract"));
  });

  it("with the last entry closed by a section header instead of a full stop", () => {
    const text = `${LEAD}${PRINTED} How to use Apply two drops at night.`;
    const r = extendThroughPremixes(extractInciWithQuote(text), text);
    expect(r?.ingredients).toEqual(LIST);
    expect(r?.quote.endsWith("Betaine")).toBe(true);
  });

  it("with a plain entry after the last blend that the page ends with", () => {
    const text = `${LEAD}${PRINTED}`;
    const r = extendThroughPremixes(extractInciWithQuote(text), text);
    expect(r?.ingredients.at(-1)).toBe("Betaine");
    expect(r?.ingredients).toHaveLength(37);
  });

  it("keeps a numeric name whose comma the reader re-joins: 1,2-Hexanediol after a blend", () => {
    const text = `${LEAD}${PRINTED}, 1,2-Hexanediol, Sodium Benzoate. ${AFTER}`;
    const r = extendThroughPremixes(extractInciWithQuote(text), text);
    expect(r?.ingredients.slice(-3)).toEqual(["Betaine", "1,2-Hexanediol", "Sodium Benzoate"]);
  });

  it("a blend inside the list, closed by a full stop", () => {
    const text = `${LEAD}${PRINTED.replace(", Betaine", ", Sodium Benzoate (and) Potassium Sorbate")}. ${AFTER}`;
    const r = extendThroughPremixes(extractInciWithQuote(text), text);
    expect(r?.ingredients.slice(-2)).toEqual(["Sodium Benzoate", "Potassium Sorbate"]);
  });
});

describe("extendThroughPremixes: leaves everything else as it was", () => {
  const same = (text: string) => {
    const raw = extractInciWithQuote(text);
    expect(raw).not.toBeNull();
    expect(extendThroughPremixes(raw, text)).toBe(raw);
  };
  const body = "Aqua, Glycerin, Niacinamide, Panthenol, Allantoin, Xylitol, Betaine, Carbomer, Phenoxyethanol";

  it("a list read in full, with a short blend inside it, is not changed", () => {
    same(`Our formula. Full ingredients ${body.replace("Allantoin", "Cetearyl Olivate (and) Sorbitan Olivate")}. Pairs well with something else entirely, in our shop.`);
  });

  it("a list followed by copy is not extended", () => {
    same(`Our formula. Full ingredients ${body}, Free shipping on every order over 499 rupees in India.`);
    same(`Our formula. Full ingredients ${body}. How to use. Apply (and) enjoy.`);
  });

  it("a blend whose component could not be an entry is not read: a sentence with '(and)' in it", () => {
    same(`Our formula. Full ingredients ${body}, Made with care (and) love by a team that has worked for many years on skin, Betaine.`);
  });

  it("an entry that follows a blend only counts once a blend has cut the list: copy after plain entries is not taken", () => {
    same(`Our formula. Full ingredients ${body}, Retinal, Sale price 495.`);
  });

  it("passes a null through and leaves a quote that is not in the text as it was", () => {
    expect(extendThroughPremixes(null, PAGE)).toBeNull();
    const raw = extractInciWithQuote(PAGE);
    expect(extendThroughPremixes(raw, "a different page")).toBe(raw);
  });
});

describe("extendThroughPremixes: on generated lists", () => {
  const POOL = ["Glycerin", "Niacinamide", "Panthenol", "Allantoin", "Xylitol", "Squalane", "Betaine", "Carbomer", "Tocopherol", "Caffeine", "Sodium Hyaluronate", "Caprylyl Glycol", "Sodium Benzoate", "Potassium Sorbate", "Citric Acid", "Sodium Hydroxide", "Salicylic Acid", "Ceramide NP", "Cholesterol", "Retinal"];
  let seed = 20261104;
  const rand = (n: number) => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed % n; };

  it("restores every entry on 300 lists whose long blend cuts them short, in label order", () => {
    for (let i = 0; i < 300; i++) {
      const pool = [...POOL].sort(() => rand(3) - 1);
      const head = pool.slice(0, 5 + rand(4));
      const blend = pool.slice(9, 14); // five components: nine words with the "(and)"s, too long for the extractor to take as one entry
      const tail = pool.slice(14, 15 + rand(3));
      const printed = ["Aqua", ...head, blend.join(" (and) "), ...tail].join(", ");
      const text = `A lovely product that is good for the skin. Full ingredients ${printed}. ${AFTER}`;
      const raw = extractInciWithQuote(text);
      const r = extendThroughPremixes(raw, text);
      expect(r?.ingredients, printed).toEqual(["Aqua", ...head, ...blend, ...tail]);
      expect(r?.quote, printed).toBe(printed);
    }
  });
});

describe("fetchInciFromProductPage: a brand's list with blends is read to its end", () => {
  const serve = (html: string) => vi.stubGlobal("fetch", vi.fn(async () => new Response(html, { status: 200 })));

  it("from the page's HTML (the WishCare accordion)", async () => {
    serve(`<html><head><title>Retinal Serum For Fine Lines | WishCare</title></head><body><div>Ingredients Boosts cellular skin renewal</div><details><summary>Full ingredients</summary><p>${PRINTED}.</p></details><div class="pairs-well-with"><h3>Pairs well with</h3></div></body></html>`);
    const read = await fetchInciFromProductPage(URL);
    expect(read?.ingredients).toEqual(LIST);
    expect(read?.ingredients).toContain("Retinal");
  });

  it("from the Jina markdown, when the page's HTML gives no list", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("no", { status: 503 })));
    h.markdown = `Title: Retinal Serum | WishCare\n\n## Full ingredients\n\n${PRINTED}.\n\n## Pairs well with\n\n${AFTER}`;
    const read = await fetchInciFromProductPage(URL);
    expect(read?.ingredients).toEqual(LIST);
  });

  it("a list that ends in a blend and then a last entry the copy ran on from still gets that entry", () => {
    const text = `${LEAD}${PRINTED}, Sodium Benzoate You might also like Salicylic Acid + LHA 2% Cleanser Acne, Breakouts`;
    const r = completeLastEntry(extendThroughPremixes(extractInciWithQuote(text), text), text);
    expect(r?.ingredients.at(-1)).toBe("Sodium Benzoate");
    expect(r?.ingredients).toContain("Retinal");
  });
});
