import { describe, expect, it } from "vitest";
import { extractInciFromText, extractInciWithQuote, extractMarkdownTitles, extractPageMeta, sentenceSpans } from "@/lib/inci-from-page";

/* LEGACY is a verbatim copy of extractInciFromText as it stood before quotes were
   added. The new extractor must accept exactly the same list for every input: the quote
   is extra information, never a different decision. The one deliberate difference is a
   list whose last entry is printed with a full stop before a sentence or a section header
   ("... Tocopherol. How to use"): LEGACY drops that entry because it ends in a stop, the
   new extractor keeps it. Those inputs are kept apart (CLOSING_STOP_CORPUS, and fuzz pages
   generated without such a token) and are checked against the entry they must add. */
const LEGACY = (() => {
  const STOP =
    /\b(how to use|directions?|benefits?|precautions?|storage|warnings?|key ingredients|about the brand|why (?:you'?ll|we) love|frequently asked|reviews?|country of origin|shelf life|net (?:wt|weight)|manufactured|marketed by|imported by|importer|customer care|expiry|best before)\b/i;
  const LABEL = /\b(?:full ingredients?|product ingredients?|ingredients?|inci)\b\s*[:\-]?\s*(.+)$/i;
  const ANCHOR =
    /\b(aqua|water|glycerin|glycerine|butylene glycol|niacinamide|cetearyl alcohol|phenoxyethanol|dimethicone|centella|sodium|tocopherol|caprylic\/capric|cetyl)\b/i;
  const MARKETING_PHRASE_RE =
    /\b(free|resistant|protection|enriched|tested|proven|clinically|dermatologically|hours?|finish|non[\s-]?comedogenic|hypoallergenic|broad[\s-]spectrum|all skin types|suitable for)\b/i;
  function looksLikeIngredient(t: string): boolean {
    const s = t.trim();
    if (s.length < 2 || s.length > 70) return false;
    if (!/[a-z]/i.test(s)) return false;
    if (/[.!?;:]$/.test(s)) return false;
    if ((s.match(/\s+/g) || []).length > 7) return false;
    if (/https?:|@|www\.|\bpvt\b|\bltd\b|road|marg|compound|©|®™?/i.test(s)) return false;
    return /^[A-Za-z0-9][A-Za-z0-9 ,\-\/().'’+&*]*$/.test(s);
  }
  const cleanTok = (s: string): string =>
    s.replace(/\s+/g, " ").replace(/\s*\/\s*/g, "/").replace(/\s*-\s*/g, "-").trim();
  return function legacy(text: string): string[] {
    const rawParts = text.split(",");
    const parts: string[] = [];
    for (let i = 0; i < rawParts.length; i++) {
      let p = rawParts[i].trim();
      while (/^[0-9]+$/.test(p) && i + 1 < rawParts.length) p = `${p},${rawParts[++i].trim()}`;
      parts.push(p);
    }
    let best: string[] = [];
    let cur: string[] = [];
    const flush = () => {
      if (cur.length > best.length) best = cur.slice();
      cur = [];
    };
    for (const p of parts) {
      const stopM = STOP.exec(p);
      if (stopM) {
        const head = p.slice(0, stopM.index).trim();
        if (looksLikeIngredient(head)) cur.push(cleanTok(head));
        flush();
        const lm = LABEL.exec(p);
        if (lm && looksLikeIngredient(lm[1])) cur.push(cleanTok(lm[1]));
        continue;
      }
      if (looksLikeIngredient(p)) {
        cur.push(cleanTok(p));
        continue;
      }
      const lm = LABEL.exec(p);
      if (lm && looksLikeIngredient(lm[1])) {
        flush();
        cur.push(cleanTok(lm[1]));
      } else {
        flush();
      }
    }
    flush();
    if (best.length < 5) return [];
    if (!best.some((x) => ANCHOR.test(x))) return [];
    const marketingHits = best.filter((x) => MARKETING_PHRASE_RE.test(x)).length;
    if (marketingHits / best.length >= 0.5) return [];
    return best.filter((x, i) => i === 0 || x.toLowerCase() !== best[i - 1].toLowerCase());
  };
})();

const LIST = "Aqua, Glycerin, Niacinamide, Cetearyl Alcohol, Phenoxyethanol, Sodium Hyaluronate, Tocopherol";

/* Pages whose list is closed by a full stop and a section header. LEGACY loses the last entry
   ("Tocopherol."); the new extractor returns the whole list. */
const CLOSING_STOP_CORPUS: string[] = [
  `Product Ingredients ${LIST}. How to use: apply daily`,
  `Key Ingredients Niacinamide, Zinc. Full Ingredient List: ${LIST}. Storage: keep cool`,
];

const CORPUS: string[] = [
  `Full Ingredients: ${LIST} Benefits: hydrates`,
  `About us. Ingredients: ${LIST}`,
  `${LIST}, How to Use Apply twice daily`,
  `Ingredients - Water, Glycerin, Butylene Glycol, Dimethicone, Cetyl Alcohol, Sodium Benzoate`,
  `INCI: Aqua (Water), Glycerin, 1, 2-Hexanediol, Caprylic/Capric Triglyceride, Panthenol, Allantoin`,
  `Aqua, Glycerin, 1,2-Hexanediol, Sodium PCA, Allantoin, Panthenol, Tocopherol`,
  `Aqua, Glycerin, 1,    2-Hexanediol, Sodium PCA, Allantoin, Panthenol, Tocopherol, How to use`,
  "Ingredients:\nAqua, Glycerin,\nNiacinamide, Cetearyl Alcohol,\nPhenoxyethanol, Tocopherol",
  "8 Hours Water Resistant, Dermatologically Tested, Oil-Free Matte Finish, Clinically Proven, Broad Spectrum Protection",
  "Dermatologically Tested, Water Resistant, Suitable for all skin types, Hypoallergenic, Non-comedogenic",
  `${LIST}, ${LIST}`,
  "Water, Water, Glycerin, Niacinamide, Cetearyl Alcohol, Phenoxyethanol",
  "Aqua, Glycerin",
  "just some prose with no commas at all",
  "",
  `Manufactured by Foo Pvt Ltd, Plot 4, Industrial Road, Pune. Ingredients: ${LIST}`,
  `Ingredients Water, Glycerin, Niacinamide, Sodium Benzoate, Cetyl Alcohol, Tocopherol Directions apply daily`,
  `Country of Origin India, Ingredients: Aqua, Glycerin, Niacinamide, Sodium Hyaluronate, Tocopherol, Cetyl Alcohol Shelf life 24 months`,
  // Two label words in one piece, and the first capture can be an entry: it is still the one used.
  `Our ingredients: Overview Ingredients Water, Glycerin, Niacinamide, Sodium Benzoate, Cetyl Alcohol, Tocopherol`,
  `Key Benefits Hair nourishment How to Use Massage onto the scalp Ingredients: Overview Ingredients Water, Glycerin, Niacinamide, Sodium Benzoate, Cetyl Alcohol, Tocopherol`,
  `Our Ingredients Aqua, Glycerin, Niacinamide, Sodium Benzoate, Cetyl Alcohol, Tocopherol`,
  // Two label words in one piece, the first capture is too long and no later capture can be an entry: nothing starts there.
  `Our ingredients are chosen with care and tested for safety every single day. Ingredients: see www.example.com, ${LIST}`,
  `Every ingredient serves a function and every ingredient is listed. See all ingredients here: ${LIST}`,
  // A newline ends what the label pattern can capture, so the label on the last line was already the first match.
  `Every ingredient serves a function.\nView all other ingredients Glycerin, Aqua, Niacinamide, Cetearyl Alcohol, Phenoxyethanol, Tocopherol`,
];

/* A deterministic generator of messy page-like text. "Shake well." is a token that ends in a full
   stop; the equality tests against LEGACY leave it out (stops = false), because a token like that
   after a list is what the new extractor keeps and LEGACY drops. */
function fuzzCorpus(n: number, stops = true): string[] {
  let seed = 20260421;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 0x100000000);
  const pick = <T,>(xs: T[]) => xs[Math.floor(rnd() * xs.length)];
  const names = ["Aqua", "Water", "Glycerin", "Niacinamide", "Sodium Hyaluronate", "Cetearyl Alcohol", "Tocopherol", "Phenoxyethanol", "Panthenol", "Allantoin", "Caprylic/Capric Triglyceride", "Dimethicone", "Butylene Glycol", "Parfum", "Citric Acid", "Zinc Oxide"];
  const junk = ["How to use", "Directions", "Benefits", "Ingredients:", "Product Ingredients", "Full Ingredient List -", "8 Hours Water Resistant", "Dermatologically Tested", "36", "007", "1", "2", "Net Wt 50 g", "Reviews", "Marketed by Foo Ltd", "www.example.com", "Shake well.", "Store in a cool place;"].filter((j) => stops || j !== "Shake well.");
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const toks: string[] = [];
    const len = 3 + Math.floor(rnd() * 28);
    for (let k = 0; k < len; k++) {
      const r = rnd();
      let t = r < 0.65 ? pick(names) : pick(junk);
      if (rnd() < 0.12) t = `Ingredients: ${t}`;
      if (rnd() < 0.08) t = `${t} How to use`;
      if (rnd() < 0.1) t = `  ${t}  `;
      if (rnd() < 0.05) t = `${t}\n`;
      toks.push(t);
    }
    out.push(toks.join(rnd() < 0.5 ? ", " : ","));
  }
  return out;
}

describe("extractInciWithQuote accepts exactly the list the previous extractor accepted", () => {
  it.each(CORPUS.map((c, i) => [i, c] as const))("corpus %i", (_i, text) => {
    expect(extractInciFromText(text)).toEqual(LEGACY(text));
    expect(extractInciWithQuote(text)?.ingredients ?? []).toEqual(LEGACY(text));
  });

  it("agrees on 1500 generated pages", () => {
    for (const text of fuzzCorpus(1500, false)) {
      const expected = LEGACY(text);
      expect(extractInciFromText(text)).toEqual(expected);
      expect(extractInciWithQuote(text)?.ingredients ?? []).toEqual(expected);
    }
  });
});

describe("a list closed by a full stop differs from the previous extractor by its last entry only", () => {
  it.each(CLOSING_STOP_CORPUS.map((c, i) => [i, c] as const))("corpus %i", (_i, text) => {
    const before = LEGACY(text);
    const now = extractInciFromText(text);
    expect(before).not.toContain("Tocopherol");
    expect(now).toEqual([...before, "Tocopherol"]);
    expect(extractInciWithQuote(text)!.quote.endsWith("Tocopherol")).toBe(true);
  });
});

describe("extractInciWithQuote quote", () => {
  it("returns the raw text span the list was read from", () => {
    const text = `Home | Shop. Product Ingredients ${LIST} How to use: apply daily`;
    const ex = extractInciWithQuote(text);
    expect(ex).not.toBeNull();
    expect(ex!.quote).toBe(LIST);
    expect(text).toContain(ex!.quote);
  });

  it("starts after the label and stops before the next section header", () => {
    const text = "Full Ingredients: Aqua, Glycerin, Niacinamide, Cetearyl Alcohol, Phenoxyethanol, Tocopherol How to use: smooth on";
    const ex = extractInciWithQuote(text)!;
    expect(ex.quote).toBe("Aqua, Glycerin, Niacinamide, Cetearyl Alcohol, Phenoxyethanol, Tocopherol");
  });

  it("keeps the brand's wording, including repeated entries the accepted list de-duplicates", () => {
    const text = "Water, Water, Glycerin, Niacinamide, Cetearyl Alcohol, Phenoxyethanol";
    const ex = extractInciWithQuote(text)!;
    expect(ex.ingredients).toEqual(["Water", "Glycerin", "Niacinamide", "Cetearyl Alcohol", "Phenoxyethanol"]);
    expect(ex.quote).toBe("Water, Water, Glycerin, Niacinamide, Cetearyl Alcohol, Phenoxyethanol");
  });

  it("covers a numeric fragment that was re-joined across a comma", () => {
    const text = "Ingredients: Aqua, Glycerin, 1, 2-Hexanediol, Sodium PCA, Panthenol, Tocopherol";
    const ex = extractInciWithQuote(text)!;
    expect(ex.ingredients).toContain("1,2-Hexanediol");
    expect(ex.quote).toBe("Aqua, Glycerin, 1, 2-Hexanediol, Sodium PCA, Panthenol, Tocopherol");
  });

  it("starts at the list when a section header and a label share a token", () => {
    const text = "Benefits Ingredients Water, Glycerin, Niacinamide, Cetearyl Alcohol, Phenoxyethanol, Tocopherol";
    const ex = extractInciWithQuote(text)!;
    expect(ex.ingredients).toEqual(["Water", "Glycerin", "Niacinamide", "Cetearyl Alcohol", "Phenoxyethanol", "Tocopherol"]);
    expect(ex.quote).toBe("Water, Glycerin, Niacinamide, Cetearyl Alcohol, Phenoxyethanol, Tocopherol");
  });

  it("collapses runs of whitespace in the quote, nothing else", () => {
    const text = "Ingredients:\nAqua,  Glycerin,\nNiacinamide, Cetearyl Alcohol,\nPhenoxyethanol, Tocopherol";
    const ex = extractInciWithQuote(text)!;
    expect(ex.quote).toBe("Aqua, Glycerin, Niacinamide, Cetearyl Alcohol, Phenoxyethanol, Tocopherol");
  });

  it("is null when no list is accepted", () => {
    expect(extractInciWithQuote("8 Hours Water Resistant, Dermatologically Tested, Clinically Proven")).toBeNull();
    expect(extractInciWithQuote("")).toBeNull();
    expect(extractInciWithQuote("Aqua, Glycerin")).toBeNull();
  });

  it("every accepted entry occurs in the quote, in order, on generated pages", () => {
    for (const text of fuzzCorpus(400)) {
      const ex = extractInciWithQuote(text);
      if (!ex) continue;
      const flat = ex.quote.toLowerCase().replace(/\s+/g, "");
      let from = 0;
      for (const item of ex.ingredients) {
        const needle = item.toLowerCase().replace(/\s+/g, "");
        const at = flat.indexOf(needle, from);
        expect(at, `${item} in ${ex.quote}`).toBeGreaterThanOrEqual(0);
        from = at + needle.length;
      }
    }
  });
});

describe("page titles", () => {
  it("reads title, og:title and h1 from HTML, decoded, best first, and the site name", () => {
    const html = `<html><head><title>Ubtan Face Wash &amp; Scrub | Mamaearth</title>
      <meta property="og:title" content="Ubtan Face Wash &#8211; Mamaearth">
      <meta content="Mamaearth" property="og:site_name">
      </head><body><h1 class="t"><span>Ubtan Face Wash</span></h1></body></html>`;
    const meta = extractPageMeta(html);
    expect(meta.titles).toEqual(["Ubtan Face Wash & Scrub | Mamaearth", "Ubtan Face Wash – Mamaearth", "Ubtan Face Wash"]);
    expect(meta.siteName).toBe("Mamaearth");
  });

  it("returns nothing when the page has no titles", () => {
    expect(extractPageMeta("<html><body><p>hi</p></body></html>")).toEqual({ titles: [], siteName: null });
  });

  it("reads the Title line and first heading of a markdown scrape", () => {
    const md = "Title: Buy Plum Serum Online | Plum\n\nURL Source: https://x\n\n# [Plum Serum](https://x)\n\ntext";
    expect(extractMarkdownTitles(md)).toEqual(["Buy Plum Serum Online | Plum", "Plum Serum"]);
  });
});

/* ── A full stop that starts a new sentence ends the entry ──────────
   Six stored brand-page lists (ANALYSER-ROLLOUT.md, Phase 2) carried an entry that had
   swallowed the page text next to the list. The page text below is the wording around each
   list as the page printed it, shortened; the entries named in each test are the stored
   ones. */

const list = (s: string): string[] => s.split(", ");

describe("a full stop followed by a new sentence ends an entry", () => {
  it("da-membrane toner: drops 'Product' after 'Sodium Gluconate.'", () => {
    const items = list(
      "Purified Water, Sodium PCA, Niacinamide, Hamamelis Virginiana (Witch Hazel) Leaf Extract, Cucumis Sativus (Cucumber) Fruit Extract, Calendula Officinalis Flower Extract, Morus Alba Extract, Phenoxyethanol, Propanediol, Butylene Glycol, Centella Asiatica Leaf Extract, Allantoin, Panthenol, Fragrance, Sodium Benzoate, Sodium Gluconate",
    );
    const page =
      "Key Ingredients Niacinamide Strengthens the skin barrier, balances the oil production, improves the skin and makes it smooth, clear, and healthy. Allantoin Help improve skin comfort, hydration, and smoothness while reducing skin sensitivity. See Full Ingredients " +
      items.join(", ") +
      ". Product Benefits Long-lasting hydration support Supports Collagen Production Smooths Fine Lines & Wrinkles Regulates sebum production How It Works? The Da Membrane Niacinamide based Face Toner has been formulated to address skin issues like pigmentation, uneven skin tone, open and large pores, acne and damaged skin barrier";
    const ex = extractInciWithQuote(page)!;
    expect(ex.ingredients).toEqual(items);
    expect(ex.ingredients).not.toContain("Sodium Gluconate. Product");
    expect(ex.quote).toBe(items.join(", "));
    expect(page).toContain(ex.quote);
  });

  it.each([
    ["clean-conscious-care-rosy-radiating-lip-balm", "Rosa Centifolia Flower Extract (Rose), Alkanna Tinctoria Root Extract (Ratanjot), Tocopherol Acetate (Vitamin E), Strawberry Flavor", "Strawberry Flavor. Care Instructions Store in a cool"],
    ["clean-conscious-care-softy-soothing-lip-balm", "Garcinia Indica (Kokum) Seed Butter, Butter, Stearic Acid, Cetearyl Alcohol, Calendula Officinalis Flower Extract, Tocopherol Acetate", "Tocopherol Acetate. Care Instructions Store in a cool"],
    ["clean-conscious-care-petal-soft-moisturizing-body-cream", "Butyrospermum Parkii (Shea) Butter, Glycerin, Cetyl Alcohol, Tocopherol, Ocimum Basilicum (Basil) Oil, Phenoxyethanol (and) Ethylhexylglycerin, Xanthan Gum", "Xanthan Gum. Care Instructions Store in a cool"],
  ])("%s: drops the 'Care Instructions' sentence after the list", (_slug, tail, badEntry) => {
    const items = list(
      `Cera Alba (Beeswax), Simmondsia Chinensis Seed Oil (Jojoba Oil), Microcrystalline Wax, Caprylic Triglycerides, ${tail}`,
    );
    const page =
      "Key Ingredients Rose Alkanetroot Pomegranate Oil Kokum Butter How to Use Take a small amount with clean, dry fingers and gently massage onto lips as needed. For best results, use consistently and reapply as needed. Ingredients " +
      items.join(", ") +
      ". Care Instructions Store in a cool, dry place away from direct sunlight and heat. Frequently Asked Questions Does it have a tint? Yes. Alkanet root and rose give a soft, natural pink tint.";
    const ex = extractInciWithQuote(page)!;
    expect(ex.ingredients).toEqual(items);
    expect(ex.ingredients).not.toContain(badEntry);
    expect(ex.quote).toBe(items.join(", "));
    expect(page).toContain(ex.quote);
  });

  it("does not start the list with a sentence too short to be an ingredient name", () => {
    const items = list("Aqua, Glycerin, Niacinamide, Cetearyl Alcohol, Phenoxyethanol, Tocopherol");
    const ex = extractInciWithQuote(`Use daily. X, ${items.join(", ")}`)!;
    expect(ex.ingredients).toEqual(items);
  });

  it("does not keep a sentence that follows the list as an entry of a longer run", () => {
    const items = list("Aqua, Glycerin, Niacinamide, Cetearyl Alcohol, Phenoxyethanol, Tocopherol");
    const ex = extractInciWithQuote(`Ingredients: ${items.join(", ")}. Shake well, keep out of reach, Use daily. Store cool`)!;
    expect(ex.ingredients).toEqual(items);
  });
});

describe("a prose sentence before the Ingredients label is not part of the first entry", () => {
  it("clean-conscious-care-petal-drop body yogurt: the first entry is 'Aqua'", () => {
    const items = list(
      "Aqua, Rosa Damascena Flower Water, Caprylic/Capric Triglyceride, Glycerin, Rosa Damascena Flower Extract, Cetyl Alcohol, Polyacrylate Crosspolymer-6, C13-15 Alkane, C15-19 Alkane, Phenoxyethanol (and) Ethylhexylglycerin",
    );
    const page =
      "Key Benefits Lightweight hydration Skin plumping Fresh glow Key Ingredients Rose Water Rose Extract How to Use Apply a generous amount to clean, dry or slightly damp skin. Massage gently until fully absorbed. Use daily, especially after bathing. Ingredients " +
      items.join(", ");
    const ex = extractInciWithQuote(page)!;
    expect(ex.ingredients[0]).toBe("Aqua");
    expect(ex.ingredients).not.toContain("especially after bathing. Ingredients Aqua");
    expect(ex.ingredients).toEqual(items);
    expect(ex.quote).toBe(items.join(", "));
    expect(page).toContain(ex.quote);
  });

  it("a sentence, a label and the list in one piece: the list starts after the label", () => {
    const items = list("Aqua, Glycerin, Niacinamide, Cetearyl Alcohol, Phenoxyethanol, Tocopherol");
    const ex = extractInciWithQuote(`Use daily, especially after bathing. Ingredients ${items.join(", ")}`)!;
    expect(ex.ingredients).toEqual(items);
  });

  /* The live page prints "Phenoxyethanol." with a full stop before "How to Use": the last entry keeps
     its place (see "a list's last entry printed with a full stop is kept" below). */
  it("amahvas ocean of milk: the claim sentence before the list is dropped, the list starts at 'Aloe Barbadensis Leaf Juice' and ends at 'Phenoxyethanol'", () => {
    const items = list(
      "Aloe Barbadensis Leaf Juice, Glycerin, Simmondsia Chinensis (Jojoba) Seed Oil, Bifida Ferment Lysate, Capryloyl Glycerin/Sebacic Acid Copolymer, Niacinamide, Sodium Hyaluronate, Tocopherol, Propanediol, Sodium Benzoate, Citric Acid, Phenoxyethanol",
    );
    const page =
      "Based on a double-blinded clinical and consumer perception study conducted on 32 subjects aged 34-55. Clinically and dermatologically tested. Found to be non-irritating. Sensitive skin assessment conducted on 26 subjects aged 19-54 Ingredients FORMULATED WITHOUT FOREVER CHEMICALS, FRAGRANCE AND ESSENTIAL OILS. " +
      items.join(", ") +
      ". How to Use DIRECTIONS Apply a few drops to the face and neck on a clean face. Wear sunscreen during the day. PRECAUTIONS For external use only.";
    const ex = extractInciWithQuote(page)!;
    expect(ex.ingredients).toEqual(items);
    expect(ex.ingredients).not.toContain("FRAGRANCE AND ESSENTIAL OILS. Aloe Barbadensis Leaf Juice");
    expect(ex.ingredients).not.toContain("FORMULATED WITHOUT FOREVER CHEMICALS");
    expect(ex.quote.startsWith("Aloe Barbadensis Leaf Juice, Glycerin")).toBe(true);
    expect(ex.quote.endsWith("Citric Acid, Phenoxyethanol")).toBe(true);
    expect(page).toContain(ex.quote);
  });
});

describe("legitimate INCI text with full stops is not cut", () => {
  it("keeps abbreviations, decimals and a quantity written 'q.s.' inside an entry", () => {
    const items = [
      "Aqua q.s. To 100",
      "Glycerin",
      "Vaccinum Sect. Cyanococcus (Blueberry) Fruit Extract",
      "Ci 60730/Ext. Violet 2",
      "Hamamelis Virginiana Var. Parvifolia Leaf Extract",
      "Retinol 0.5",
      "Niacinamide 4.5",
      "Tocopherol",
      "Phenoxyethanol",
    ];
    const ex = extractInciWithQuote(`Ingredients: ${items.join(", ")}`)!;
    expect(ex.ingredients).toEqual(items);
  });

  it("still keeps them when the list is followed by a sentence", () => {
    const items = ["Aqua", "Glycerin", "Vaccinum Sect. Cyanococcus (Blueberry) Fruit Extract", "Ci 60730/Ext. Violet 2", "Niacinamide 4.5", "Tocopherol"];
    const ex = extractInciWithQuote(`Ingredients: ${items.join(", ")}. Care Instructions Store in a cool, dry place`)!;
    expect(ex.ingredients).toEqual(items);
  });

  it.each([
    ["sect", "Vaccinum Sect. Cyanococcus (Blueberry) Fruit Extract"],
    ["subsp", "Vitis Vinifera Subsp. Sylvestris Seed Oil"],
    ["ssp", "Brassica Oleracea Ssp. Italica Extract"],
    ["spp", "Lactobacillus Spp. Ferment Filtrate"],
    ["sp", "Aspergillus Sp. Ferment"],
    ["var", "Hamamelis Virginiana Var. Parvifolia Leaf Extract"],
    ["cv", "Rosa Damascena Cv. Kazanlik Flower Water"],
    ["f", "Camellia Sinensis F. Variegata Leaf Extract"],
    ["ext", "Ci 60730/Ext. Violet 2"],
    ["eq", "Ethyl Ascorbic Acid (Eq. To 15% Vitamin C)"],
    ["denat", "Alcohol Denat. Aqua"],
    ["st", "Hypericum Perforatum (St. John's Wort) Extract"],
    ["q.s.", "Aqua q.s. To 100"],
    ["q.s. at the end", "Aqua q.s."],
    ["decimal", "Retinol 0.5 Panthenol"],
    ["number", "Fd&C Red No. 33"],
  ])("sentenceSpans does not split at %s", (_what, t) => {
    expect(sentenceSpans(t).map(([a, b]) => t.slice(a, b))).toEqual([t]);
  });

  it("sentenceSpans splits where a new sentence starts, and only there", () => {
    const cut = (t: string) => sentenceSpans(t).map(([a, b]) => t.slice(a, b));
    expect(cut("Sodium Gluconate. Product")).toEqual(["Sodium Gluconate", "Product"]);
    expect(cut("Retinol 0.5. Product Benefits")).toEqual(["Retinol 0.5", "Product Benefits"]);
    expect(cut("Vitamin C. Care Instructions")).toEqual(["Vitamin C", "Care Instructions"]);
    expect(cut("Tocopherol Acetate (Vitamin E). Care Instructions")).toEqual(["Tocopherol Acetate (Vitamin E)", "Care Instructions"]);
    expect(cut("Use daily. Wear sunscreen. Ingredients Aqua")).toEqual(["Use daily", "Wear sunscreen", "Ingredients Aqua"]);
    expect(cut("Aqua. use daily")).toEqual(["Aqua. use daily"]);
    expect(cut("Aqua.\n  Glycerin")).toEqual(["Aqua", "Glycerin"]);
    expect(cut("")).toEqual([]);
    expect(cut("Aqua")).toEqual(["Aqua"]);
  });
});

/* ── A list's last entry printed with a full stop ───────────────────
   Thirteen stored brand-page lists lost an entry because the page printed it as "..., Citric Acid,
   Phenoxyethanol. How to Use ...": looksLikeIngredient rejects a token that ends in a full stop,
   so the entry was left out. The text a rule rejects whole can still close the run in progress: the
   entry is the text before its first sentence end, or all of it but a final stop, and it must still
   pass looksLikeIngredient. A final stop that belongs to an abbreviation ("Alcohol Denat.",
   "Aqua q.s.") stays in the entry. The entry ends the run. Recovering the FIRST entry when an
   earlier "Ingredients" word makes the label capture too long is a different defect, covered at
   the end of this file. */

describe("a list's last entry printed with a full stop is kept", () => {
  const body = list("Aqua, Glycerin, Niacinamide, Cetearyl Alcohol, Phenoxyethanol, Sodium Hyaluronate");
  const closed = (last: string, tail: string, label = "Ingredients: ") => {
    const items = [...body, last];
    return { items, page: `${label}${items.join(", ")}${tail}` };
  };

  it("keeps the entry before a section header: 'Tocopherol. Directions'", () => {
    const { items, page } = closed("Tocopherol", ". Directions Apply a few drops to the face and neck. Precautions For external use only.");
    const ex = extractInciWithQuote(page)!;
    expect(ex.ingredients).toEqual(items);
    expect(ex.quote).toBe(items.join(", "));
    expect(page).toContain(ex.quote);
  });

  it("keeps the entry before a section header when the head carries more than the entry", () => {
    // be-minimalist hydrating-factors shampoo: the header found is "reviews", so the head holds a rating line.
    const { items, page } = closed("Sodium Hydroxide", ". Overall rating: 2.6666667 / 5 from 12 reviews. AI Generated Review Summary Summary topics Review topics: [].");
    const ex = extractInciWithQuote(page)!;
    expect(ex.ingredients).toEqual(items);
    expect(ex.quote).toBe(items.join(", "));
  });

  it("keeps the entry when a long sentence follows and the whole piece is too long to be an entry", () => {
    // clean-conscious-care sky hair mask: "Oil. Care Instructions Store in a dry" is 12 words.
    const { items, page } = closed("Cedrus Deodara Wood (Cedar Wood) Oil", ". Care Instructions Store in a dry, cool place. Frequently Asked Questions How do I use the mask?");
    const ex = extractInciWithQuote(page)!;
    expect(ex.ingredients).toEqual(items);
    expect(ex.ingredients).not.toContain("cool place");
    expect(ex.quote).toBe(items.join(", "));
    expect(page).toContain(ex.quote);
  });

  it("keeps the entry before a sentence that starts with a code that holds a full stop", () => {
    // cetaphil baby wash: "Tocopherol. FIL.971.V00 Find your own routine ..."
    const items = [...body, "Tocopherol"];
    const page =
      "Gentle on baby's skin. Use at bath time and follow with lotion to keep skin hydrated and soft. INGREDIENTS " +
      items.join(", ") +
      ". FIL.971.V00 Find your own routine with our new AI Skin Analysis tool AI SKIN ANALYSIS YOU MAY ALSO LIKE SEE ALL PRODUCTS";
    const ex = extractInciWithQuote(page)!;
    expect(ex.ingredients).toEqual(items);
    expect(ex.quote).toBe(items.join(", "));
  });

  it("keeps the entry when the stop follows a closing bracket", () => {
    const { items, page } = closed("Chromium Oxide Greens (CI 77288)", ". Care Instructions Allow bar to dry between uses. Store away from water and excessive moisture. Frequently Asked Questions Which hair type?");
    const ex = extractInciWithQuote(page)!;
    expect(ex.ingredients).toEqual(items);
    expect(ex.quote.endsWith("Chromium Oxide Greens (CI 77288)")).toBe(true);
  });

  it("keeps the entry when the list is the last thing on the page", () => {
    const { items, page } = closed("Tocopherol", ".");
    expect(extractInciWithQuote(page)!.ingredients).toEqual(items);
    expect(extractInciWithQuote(`${page}\n`)!.ingredients).toEqual(items);
    expect(extractInciWithQuote(`${page}   `)!.quote).toBe(items.join(", "));
  });

  it("keeps the entry when the stop follows a digit or a closing bracket at the end of the page", () => {
    expect(extractInciWithQuote(closed("Retinol 0.5", ".").page)!.ingredients.at(-1)).toBe("Retinol 0.5");
    expect(extractInciWithQuote(closed("Chromium Oxide Greens (CI 77288)", ".").page)!.ingredients.at(-1)).toBe("Chromium Oxide Greens (CI 77288)");
  });

  it("keeps the entry before a section header on the next line (text read from markdown)", () => {
    const items = [...body, "Tocopherol"];
    const page = `Ingredients: ${items.join(",\n")}.\n\nHow to Use\n\nApply daily`;
    const ex = extractInciWithQuote(page)!;
    expect(ex.ingredients).toEqual(items);
    expect(ex.quote).toBe(items.join(", "));
  });

  it("tidies the entry like any other: spacing around a slash and doubled spaces", () => {
    const page = `Ingredients: ${body.join(", ")}, Capryloyl Glycerin / Sebacic Acid  Copolymer. How to Use Apply daily`;
    const ex = extractInciWithQuote(page)!;
    expect(ex.ingredients.at(-1)).toBe("Capryloyl Glycerin/Sebacic Acid Copolymer");
    expect(ex.quote.endsWith("Capryloyl Glycerin / Sebacic Acid Copolymer")).toBe(true);
  });

  it("keeps the entry whole when its final stop belongs to an abbreviation: 'Alcohol Denat.'", () => {
    for (const tail of [". How to Use Apply daily", ""]) {
      const { items, page } = closed("Alcohol Denat.", tail.slice(1));
      const ex = extractInciWithQuote(page)!;
      expect(ex.ingredients, page).toEqual(items);
      expect(ex.ingredients.at(-1)).toBe("Alcohol Denat.");
      expect(ex.quote.endsWith("Alcohol Denat.")).toBe(true);
    }
  });

  it("keeps the entry whole when its final stop belongs to a dotted abbreviation: 'Aqua q.s.'", () => {
    for (const tail of [" How to Use Apply daily", ""]) {
      const { items, page } = closed("Aqua q.s.", tail);
      const ex = extractInciWithQuote(page)!;
      expect(ex.ingredients, page).toEqual(items);
      expect(ex.ingredients.at(-1)).toBe("Aqua q.s.");
      expect(ex.quote.endsWith("Aqua q.s.")).toBe(true);
    }
  });

  it("does not cut the entry at a botanical rank inside it", () => {
    const { items, page } = closed("Hamamelis Virginiana Var. Parvifolia Leaf Extract", ". Care Instructions Store in a cool dry place away from direct heat and light. Frequently Asked Questions");
    const ex = extractInciWithQuote(page)!;
    expect(ex.ingredients).toEqual(items);
    expect(ex.ingredients.at(-1)).toBe("Hamamelis Virginiana Var. Parvifolia Leaf Extract");
  });

  it("the entry ends the run: ingredient-like pieces after the stop do not join the list", () => {
    const items = [...body, "Tocopherol"];
    const page = `Ingredients: ${items.join(", ")}. Do not use on broken skin or near the eyes at any time, Zinc Oxide, Mica, Kaolin`;
    expect(extractInciWithQuote(page)!.ingredients).toEqual(items);
  });

  it("a second list that starts with its own label does not take the entry away from the first", () => {
    // Both lists have five entries; the first wins the tie only if it kept its closing entry.
    const first = ["Aqua", "Glycerin", "Niacinamide", "Cetearyl Alcohol", "Phenoxyethanol"];
    const page = `Ingredients: ${first.join(", ")}. Wear sunscreen during the day and keep it away from the eyes. Ingredients Mica, Zinc Oxide, Kaolin, Silica, Talc`;
    expect(extractInciWithQuote(page)!.ingredients).toEqual(first);
  });

  it("does not keep a first sentence that is too long to be an ingredient name", () => {
    const items = [...body, "Tocopherol"];
    const page = `Ingredients: ${items.join(", ")}, Keep away from the eyes and wash with plenty of clean water if contact occurs. Store in a cool place`;
    expect(extractInciWithQuote(page)!.ingredients).toEqual(items);
  });

  it("does not keep a closing piece that carries a colon or other text no ingredient name has", () => {
    const items = [...body, "Tocopherol"];
    expect(extractInciWithQuote(`Ingredients: ${items.join(", ")}, Do not swallow: rinse well.`)!.ingredients).toEqual(items);
    expect(extractInciWithQuote(`Ingredients: ${items.join(", ")}, Visit us @ shop, see www.example.com for more. Thanks`)!.ingredients).toEqual(items);
  });

  it("adds nothing when no list is in progress", () => {
    expect(extractInciWithQuote("Phenoxyethanol. How to Use Apply daily")).toBeNull();
    expect(extractInciWithQuote("Aqua, Glycerin, Niacinamide, Tocopherol. How to Use Apply daily")).toBeNull();
    expect(extractInciWithQuote("Yes. Alkanet root and rose give a soft, natural pink tint.")).toBeNull();
  });

  it("does not make a list out of marketing sentences that end in a stop", () => {
    expect(extractInciWithQuote("Dermatologically Tested, Water Resistant, Hypoallergenic, Clinically Proven, Non-comedogenic. Suitable for all skin types.")).toBeNull();
  });
});

/* Lists of distinct names closed by a stop-shaped tail: the whole list comes back, last entry included. */
function closedLists(n: number): { page: string; items: string[] }[] {
  let seed = 20261021;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 0x100000000);
  const pool = ["Glycerin", "Niacinamide", "Sodium Hyaluronate", "Cetearyl Alcohol", "Tocopherol", "Phenoxyethanol", "Panthenol", "Allantoin", "Caprylic/Capric Triglyceride", "Dimethicone", "Butylene Glycol", "Citric Acid", "Zinc Oxide", "Helianthus Annuus (Sunflower) Seed Oil", "Rosa Damascena Flower Oil", "Cedrus Deodara Wood (Cedar Wood) Oil", "Chromium Oxide Greens (CI 77288)", "Skin Safe Pink Colorant", "Sodium Hydroxide", "Vitis Vinifera (Grape) Seed Oil", "Xanthan Gum", "Cetyl Alcohol"];
  // An entry that ends in a stop of its own is accepted only as the last entry (a stop in the middle of a list is not handled).
  const abbreviated = ["Alcohol Denat.", "Aqua q.s."];
  const labels = ["Ingredients: ", "Full Ingredients: ", "Product Ingredients: ", "Home | Shop. Ingredients: ", "About us. Ingredients: "];
  const tails = [
    ". How to Use Apply daily",
    ". Care Instructions Store in a cool, dry place. Frequently Asked Questions Is it safe?",
    ".",
    ". Directions Apply twice daily",
    ". Wear sunscreen during the day and avoid the eyes at all times. Reviews",
    ". Benefits Hydrates and soothes",
    ".\n",
  ];
  // After an abbreviation's own stop only a section header or the end of the page ends the entry: a sentence there
  // cannot be told from the rest of an entry ("Aqua q.s. To 100").
  const abbreviatedTails = ["", "\n", " How to Use Apply daily", " Directions Apply twice daily", " Benefits Hydrates and soothes"];
  const pick = (xs: string[]) => xs[Math.floor(rnd() * xs.length)];
  const out: { page: string; items: string[] }[] = [];
  for (let i = 0; i < n; i++) {
    const rest = [...pool];
    const items = ["Aqua"];
    const len = 5 + Math.floor(rnd() * 10);
    while (items.length < len) items.push(rest.splice(Math.floor(rnd() * rest.length), 1)[0]);
    if (rnd() < 0.25) items[items.length - 1] = abbreviated[Math.floor(rnd() * abbreviated.length)];
    const tail = items.at(-1)!.endsWith(".") ? pick(abbreviatedTails) : pick(tails);
    out.push({ page: `${labels[Math.floor(rnd() * labels.length)]}${items.join(", ")}${tail}`, items });
  }
  return out;
}

describe("a list closed by a stop-shaped tail comes back whole", () => {
  it("on 600 generated lists", () => {
    for (const { page, items } of closedLists(600)) {
      const ex = extractInciWithQuote(page);
      expect(ex?.ingredients, page).toEqual(items);
      expect(ex!.quote, page).toBe(items.join(", "));
    }
  });
});

/* ── The first entry when an earlier "ingredients" word is in the same piece ──
   The label pattern takes the first "ingredient(s)" word in a comma piece and captures everything after
   it. When an earlier word of that kind sits in the same piece ("Every ingredient serves a function. ...
   View all other ingredients Glycerin"), the capture is long, looksLikeIngredient rejects it, and the first
   entry of the real list was lost. Three stored brand-page lists lacked their first entry for this reason.
   The next label words are tried in turn, nearest first, and the first capture that can be an entry
   starts the list. A first capture that can be an entry is used as before. The page text below is the
   wording around each list as the page printed it, shortened. */

describe("a list keeps its first entry when an earlier 'ingredients' word makes the label capture too long", () => {
  it("be-minimalist hydrating factors shampoo: 'Water/Aqua' after 'All Ingredients'", () => {
    const items = list(
      "Water/Aqua, Disodium Laureth Sulfosuccinate, Cocamidopropyl Betaine, Sodium Lauroyl Sarcosinate, Glycerin, Sodium Lauryl Sulfoacetate, Cocamide MEA, Sodium Hydroxide",
    );
    const page =
      "Default Title - ₹ 449 Add to cart Ingredients Sodium Hyaluronate Powerful humectant helps to boost hair hydration Tamarindus Indica Fruit Extract Helps improve hair shine. Betaine A potent osmo-protectant that helps to improve moisture level. All Ingredients " +
      items.join(", ") +
      ". Overall rating: 2.6666667 / 5 from 12 reviews. AI Generated Review Summary Summary topics Review topics: [].";
    const ex = extractInciWithQuote(page)!;
    expect(ex.ingredients[0]).toBe("Water/Aqua");
    expect(ex.ingredients).toEqual(items);
    expect(ex.quote).toBe(items.join(", "));
    expect(page).toContain(ex.quote);
  });

  it("clean-conscious-care herbal gold hair elixir: the oil after the second 'Ingredients', in a piece that holds section headers", () => {
    const items = list(
      "Sesamum Indicum (Sesame) Seed Oil, Caprae Lac (Goat Milk), Allium Cepa (Onion Seed) Oil, Argania Spinosa Kernel (Argan) Oil, Ricinus Communis (Castor) Seed Oil, Tocopherol (Vitamin E)",
    );
    const page =
      "Key Benefits Hair nourishment Root strengthening Healthy hair growth support Key Ingredients 14 carefully selected Herbs Goat Milk Argan Oil How to Use Massage a sufficient quantity onto the scalp and hair using gentle circular motions. Leave on for 1 hour before washing. Use 2-3 times a week for best results. As a Hair Serum: Take a few drops onto your palms and apply to the mid-lengths and ends of the hair to help manage frizz and add softness and shine. Ingredients " +
      items.join(", ") +
      ". Care Instructions Store in a dry, cool place. Frequently Asked Questions How do I use Herbal Gold hair oil?";
    const ex = extractInciWithQuote(page)!;
    expect(ex.ingredients[0]).toBe("Sesamum Indicum (Sesame) Seed Oil");
    expect(ex.ingredients).toEqual(items);
    expect(ex.quote).toBe(items.join(", "));
    expect(page).toContain(ex.quote);
  });

  it("the-solved-skin rapid clear facewash: 'Glycerin' after 'View all other ingredients'", () => {
    const items = list(
      "Glycerin, Aqua, Sodium Lauryl Sarcosinate, Decyl Glucoside, Propanediol, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Phenoxyethanol, Ethylhexylglycerin, Sodium Hydroxide, Carbomer",
    );
    const page =
      "Effective in fading acne scars and dark spots. pH 5.5 Fragrance-free No alcohol No parabens Sensitive skin safe Every ingredient serves a function. Nothing is here for the label. View all other ingredients " +
      items.join(", ") +
      ". How it works Breakouts start deep. Rapid Clear works at every level.";
    const ex = extractInciWithQuote(page)!;
    expect(ex.ingredients[0]).toBe("Glycerin");
    expect(ex.ingredients).toEqual(items);
    expect(ex.quote).toBe(items.join(", "));
    expect(page).toContain(ex.quote);
  });

  it("works when the label is followed by a colon or a dash", () => {
    const items = list("Aqua, Glycerin, Niacinamide, Cetearyl Alcohol, Phenoxyethanol, Tocopherol");
    for (const label of ["ingredients: ", "ingredients - ", "ingredients -", "INGREDIENTS "]) {
      const page = `Every ingredient serves a function and nothing is here for the label. View all other ${label}${items.join(", ")}`;
      expect(extractInciWithQuote(page)!.ingredients, page).toEqual(items);
    }
  });

  it("tries the label words one after the other: the nearest whose capture can be an entry starts the list", () => {
    const items = list("Water/Aqua, Glycerin, Niacinamide, Cetearyl Alcohol, Phenoxyethanol, Tocopherol");
    const page =
      "Every ingredient serves a function. Our Ingredients page explains each one in detail and why we chose it. Full ingredient list: this is the complete formula. All Ingredients " +
      items.join(", ");
    const ex = extractInciWithQuote(page)!;
    expect(ex.ingredients).toEqual(items);
    expect(ex.quote).toBe(items.join(", "));
  });

  it("starts at the nearest label word, not at one further on in the list", () => {
    // 'Ingredients' also occurs inside the list: the list must not be cut there.
    const items = ["Water/Aqua", "Glycerin", "Niacinamide", "Cetearyl Alcohol", "Phenoxyethanol", "Tocopherol"];
    const page = `Every ingredient serves a function and nothing is here for the label. View all ingredients ${items.join(", ")}`;
    expect(extractInciWithQuote(page)!.ingredients).toEqual(items);
  });

  it("starts nothing when no later label word is followed by something that can be an entry", () => {
    const items = list("Aqua, Glycerin, Niacinamide, Cetearyl Alcohol, Phenoxyethanol, Tocopherol");
    for (const lead of [
      "Our ingredients are chosen with care and tested for safety every single day. Ingredients: see www.example.com",
      "Every ingredient serves a function and every ingredient is listed in full. See all ingredients here:",
      "Our ingredients are chosen with care and tested for safety every single day. All ingredients 100%.",
    ]) {
      const ex = extractInciWithQuote(`${lead}, ${items.join(", ")}`)!;
      expect(ex.ingredients, lead).toEqual(items);
      expect(ex.quote, lead).toBe(items.join(", "));
    }
  });

  it("uses a first capture that can be an entry, as before", () => {
    // The piece holds a colon, so it is rejected whole; its first label word has a capture that can be an entry.
    const text = "Our ingredients: Overview Ingredients Water, Glycerin, Niacinamide, Sodium Benzoate, Cetyl Alcohol, Tocopherol";
    expect(extractInciWithQuote(text)!.ingredients).toEqual(["Overview Ingredients Water", "Glycerin", "Niacinamide", "Sodium Benzoate", "Cetyl Alcohol", "Tocopherol"]);
  });

  it("a label word that ends the piece, with nothing after it, starts nothing", () => {
    const items = list("Aqua, Glycerin, Niacinamide, Cetearyl Alcohol, Phenoxyethanol, Tocopherol");
    const ex = extractInciWithQuote(`Every ingredient serves a function and nothing is here for the label. View all other ingredients, ${items.join(", ")}`)!;
    expect(ex.ingredients).toEqual(items);
  });

  it("does not add the entry twice, and adds nothing when the list is too short", () => {
    const items = list("Water/Aqua, Glycerin, Niacinamide, Cetearyl Alcohol, Phenoxyethanol, Tocopherol");
    const ex = extractInciWithQuote(`Every ingredient serves a function and nothing is here for the label. View all other ingredients ${items.join(", ")}`)!;
    expect(ex.ingredients.filter((x) => x === "Water/Aqua")).toHaveLength(1);
    expect(extractInciWithQuote("Every ingredient serves a function and nothing is here for the label. View all other ingredients Aqua, Glycerin, Niacinamide, Phenoxyethanol")).toBeNull();
  });
});

/* Lists whose first entry follows an earlier "ingredients" word in the same piece. */
function labelledLists(n: number): { page: string; items: string[] }[] {
  let seed = 20261022;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 0x100000000);
  const firsts = ["Water/Aqua", "Aqua", "Sesamum Indicum (Sesame) Seed Oil", "Aqua (Water)", "Purified Water", "Sodium Cocoyl Isethionate"];
  const pool = ["Niacinamide", "Sodium Hyaluronate", "Cetearyl Alcohol", "Tocopherol", "Phenoxyethanol", "Panthenol", "Allantoin", "Caprylic/Capric Triglyceride", "Dimethicone", "Butylene Glycol", "Citric Acid", "Zinc Oxide", "Helianthus Annuus (Sunflower) Seed Oil", "Chromium Oxide Greens (CI 77288)", "Sodium Hydroxide", "Xanthan Gum", "Cetyl Alcohol", "Carbomer"];
  // Each lead holds an "ingredient(s)" word before the label that starts the list, and is long enough that the capture after the first one is not an entry.
  const leads = [
    "Every ingredient serves a function. Nothing is here for the label. View all other ingredients ",
    "Key Benefits Hair nourishment Root strengthening Key Ingredients 14 carefully selected Herbs How to Use Massage onto the scalp and hair. Ingredients ",
    "Add to cart Ingredients Sodium Hyaluronate Powerful humectant helps to boost hair hydration Helps improve hair shine. All Ingredients ",
    "We list every ingredient we use and explain why it is in the formula in the next section. Full Ingredients: ",
    "Ingredients overview and ingredient glossary for every single product in our range. INCI: ",
    "Product Ingredients Our promise is that every ingredient is named in full on this page and on the pack. Product Ingredients - ",
  ];
  const tails = ["", ". How to Use Apply daily", ". Care Instructions Store in a cool, dry place. Frequently Asked Questions Is it safe?", ".", ". Directions Apply twice daily", ". Overall rating: 4 / 5 from 12 reviews. Review topics: []."];
  const pick = (xs: string[]) => xs[Math.floor(rnd() * xs.length)];
  const out: { page: string; items: string[] }[] = [];
  for (let i = 0; i < n; i++) {
    const rest = [...pool];
    // A list needs an ingredient the extractor knows as an anchor (Glycerin here), whatever its first entry is.
    const items = [pick(firsts), "Glycerin"];
    const len = 5 + Math.floor(rnd() * 12);
    while (items.length < len) items.push(rest.splice(Math.floor(rnd() * rest.length), 1)[0]);
    out.push({ page: `${pick(leads)}${items.join(", ")}${pick(tails)}`, items });
  }
  return out;
}

describe("a list that follows an earlier 'ingredients' word comes back whole", () => {
  it("on 600 generated lists", () => {
    for (const { page, items } of labelledLists(600)) {
      const ex = extractInciWithQuote(page);
      expect(ex?.ingredients, page).toEqual(items);
      expect(ex!.quote, page).toBe(items.join(", "));
    }
  });
});

describe("only a piece with two label words, the first capture too long, differs from the previous extractor", () => {
  // Prose pieces with and without label words, between ingredient-like pieces.
  function proseCorpus(n: number): string[] {
    let seed = 20261023;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 0x100000000);
    const pick = <T,>(xs: T[]) => xs[Math.floor(rnd() * xs.length)];
    const names = ["Aqua", "Water", "Glycerin", "Niacinamide", "Sodium Hyaluronate", "Cetearyl Alcohol", "Tocopherol", "Phenoxyethanol", "Panthenol", "Allantoin", "Dimethicone", "Butylene Glycol", "Citric Acid", "Zinc Oxide"];
    // No sentence ends: those are the sentence-end rule's business, which the previous extractor does not have.
    const prose = [
      "Every ingredient serves a function and nothing is here for the label View all other ingredients",
      "Our ingredients are chosen with care and tested for safety every single day Ingredients:",
      "Ingredients Sodium Hyaluronate Powerful humectant helps to boost hair hydration All Ingredients",
      "Full Ingredients: see the complete list for this product on the next page of our site",
      "Key Ingredients Niacinamide Strengthens the skin barrier Ingredients",
      "Free from parabens and sulphates and mineral oil",
      "Use daily Ingredients",
      "INCI",
      "How to use",
      "Net Wt 50 g",
    ];
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      const toks: string[] = [];
      const len = 4 + Math.floor(rnd() * 16);
      for (let k = 0; k < len; k++) {
        const t = rnd() < 0.7 ? pick(names) : pick(prose);
        toks.push(rnd() < 0.5 ? t : `${t} ${pick(names)}`);
      }
      out.push(toks.join(rnd() < 0.5 ? ", " : ","));
    }
    return out;
  }
  const labelWords = (s: string) => (s.match(/\b(?:full ingredients?|product ingredients?|ingredients?|inci)\b/gi) ?? []).length;

  it("pages with no comma piece that holds two label words equal the previous extractor", () => {
    let checked = 0;
    let differing = 0;
    for (const text of proseCorpus(1500)) {
      if (text.split(",").some((piece) => labelWords(piece) >= 2)) {
        // The only pages allowed to differ. A new first entry can make a run longer than the one that won before, so
        // nothing is asserted about the list itself, only that this shape is exercised.
        if (JSON.stringify(extractInciFromText(text)) !== JSON.stringify(LEGACY(text))) differing++;
        continue;
      }
      checked++;
      expect(extractInciFromText(text)).toEqual(LEGACY(text));
    }
    expect(checked).toBeGreaterThan(300);
    expect(differing).toBeGreaterThan(0);
  });
});
