import { describe, expect, it } from "vitest";
import {
  buildComparison, canonicalCheck, displayName, parsePack, parseRupees, pickFor, priceFacts, sunFactsOf, tidyLine,
  type CompareFacts, type CompareRow, type Marker, type RowId,
} from "./compare-products";

const TITLES: Record<RowId, string> = { safety: "Ingredient safety", formula: "Formula logic", claims: "Claims evidence", tests: "Test transparency", clarity: "Consumer clarity" };
const WORD = { green: "Strong", yellow: "Fair", red: "Concern" } as const;
const PILL = {
  good: { label: "Good choice", tone: "good", marker: "green" },
  caution: { label: "Buy with caution", tone: "caution", marker: "yellow" },
  look: { label: "Look elsewhere", tone: "look", marker: "red" },
  info: { label: "Not enough info", tone: "info", marker: null },
  med: { label: "Medicinal product", tone: "med", marker: null },
} as const;

/** Rows from one marker each, in the page's order: safety, formula, claims, tests, clarity. */
const rows = (...m: Marker[]): CompareRow[] =>
  (["safety", "formula", "claims", "tests", "clarity"] as RowId[]).map((id, i) => ({ id, title: TITLES[id], marker: m[i] ?? null, word: m[i] ? WORD[m[i]!] : "Not rated", line: `${TITLES[id]} line.` }));

function mk(slug: string, over: Partial<CompareFacts> & { tone?: keyof typeof PILL; rowMarkers?: Marker[] } = {}): CompareFacts {
  const { tone = "good", rowMarkers = ["green", "green", "green", "yellow", "green"], ...rest } = over;
  return {
    slug, href: `/analysis/${slug}`, name: slug.toUpperCase(), brand: "Brand", image: null, type: "Sunscreens",
    pill: PILL[tone], confidence: "high", rows: tone === "info" || tone === "med" ? null : rows(...rowMarkers), checks: [],
    keyActives: [], price: { total: null, pack: null, perUnit: null, unit: null, line: null }, suits: [], careful: [], gaps: [], analysedAt: "2026-10-20", ...rest,
  };
}
const priced = (perUnit: number, unit: "ml" | "g" = "ml") => ({ total: perUnit * 50, pack: "50 ml", perUnit, unit, line: null });

describe("the pick", () => {
  it("prefers the better pill, whatever else differs", () => {
    const a = mk("a", { tone: "caution", rowMarkers: ["green", "green", "green", "green", "green"] });
    const b = mk("b", { tone: "good", rowMarkers: ["yellow", "yellow", "yellow", "yellow", "yellow"] });
    const p = pickFor([a, b]);
    expect(p.winner).toBe("b");
    expect(p.kind).toBe("pick");
    expect(p.reasons[0]).toMatch(/Rated Good choice\. .*A is Buy with caution/);
  });

  it("then prefers the stronger ingredient safety row", () => {
    const a = mk("a", { rowMarkers: ["yellow", "green", "green", "green", "green"] });
    const b = mk("b", { rowMarkers: ["green", "yellow", "yellow", "yellow", "yellow"] });
    expect(pickFor([a, b]).winner).toBe("b");
  });

  it("then the total of the five rows, then the checks, then confidence", () => {
    const a = mk("a", { rowMarkers: ["green", "green", "green", "green", "yellow"] });
    const b = mk("b", { rowMarkers: ["green", "green", "green", "yellow", "yellow"] });
    expect(pickFor([b, a]).winner).toBe("a");

    const c = mk("c", { checks: [{ label: "Fragrance free", state: "yes" }] });
    const d = mk("d", { checks: [{ label: "Fragrance free", state: "no" }] });
    expect(pickFor([d, c]).winner).toBe("c");

    const e = mk("e", { confidence: "high" });
    const f = mk("f", { confidence: "low" });
    expect(pickFor([f, e]).winner).toBe("e");
  });

  it("uses price only to break a tie, and only when every product has a price in the same unit", () => {
    const cheap = mk("cheap", { price: priced(10) });
    const dear = mk("dear", { price: priced(20) });
    expect(pickFor([dear, cheap]).winner).toBe("cheap");
    // A product with the better rows wins even when it costs more.
    const better = mk("better", { rowMarkers: ["green", "green", "green", "green", "green"], price: priced(40) });
    expect(pickFor([cheap, better]).winner).toBe("better");
    // Grams against millilitres is not a comparison of price.
    const grams = mk("grams", { price: priced(5, "g") });
    const kind = pickFor([grams, mk("ml", { price: priced(50) })]);
    expect(kind.value).toBeNull();
  });

  it("explains the pick with the facts it came from, and says what the others still have", () => {
    const a = mk("a", {
      rowMarkers: ["green", "green", "green", "green", "green"], checks: [{ label: "Fragrance free", state: "yes" }], price: priced(20),
    });
    const b = mk("b", {
      rowMarkers: ["green", "yellow", "yellow", "green", "green"], checks: [{ label: "Fragrance free", state: "no" }, { label: "Paraben free", state: "yes" }], price: priced(10),
    });
    const p = pickFor([b, a]);
    expect(p.winner).toBe("a");
    expect(p.reasons.join(" ")).toContain("Stronger than Brand B on formula logic and claims evidence");
    expect(p.reasons.join(" ")).toContain("Ticks Fragrance free where Brand B has a cross");
    expect(p.others).toHaveLength(1);
    expect(p.others[0].text).toContain("Behind on formula logic and claims evidence");
    expect(p.others[0].text).toContain("costs less per ml (₹10.00/ml against ₹20.00/ml)");
  });

  it("is a close call when the pill and safety row match and the rows are within a point, and still names one", () => {
    const a = mk("a", { rowMarkers: ["green", "green", "green", "green", "green"] });
    const b = mk("b", { rowMarkers: ["green", "green", "green", "green", "yellow"] });
    const p = pickFor([b, a]);
    expect(p.kind).toBe("close");
    expect(p.winner).toBe("a");
    expect(p.headline).toMatch(/close call/i);
  });

  it("offers a best-value line only for a cheaper product with the same pill as the pick", () => {
    const pick = mk("pick", { rowMarkers: ["green", "green", "green", "green", "green"], price: priced(30) });
    const value = mk("value", { rowMarkers: ["green", "yellow", "yellow", "green", "green"], price: priced(15) });
    const p = pickFor([pick, value]);
    expect(p.winner).toBe("pick");
    expect(p.value?.slug).toBe("value");
    expect(p.value?.text).toContain("same Good choice rating");

    // The cheaper one is rated lower: it is not "value", it is just cheaper, and its own line says so.
    const worse = mk("worse", { tone: "caution", price: priced(15) });
    const q = pickFor([pick, worse]);
    expect(q.value).toBeNull();
    expect(q.others[0].text).toContain("costs less per ml");
  });

  it("never picks, ranks or compares on a product without enough information, and says why", () => {
    const rated = mk("rated");
    const thin = mk("thin", { tone: "info", gaps: ["A full ingredient list published by the brand."] });
    const p = pickFor([thin, rated]);
    expect(p.winner).toBe("rated");
    expect(p.kind).toBe("only");
    expect(p.left).toHaveLength(1);
    expect(p.left[0].text).toContain("does not have enough reliable information");
    expect(p.left[0].text).toContain("a full ingredient list published by the brand");
  });

  it("leaves a medicine out of the pick, in words", () => {
    const p = pickFor([mk("med", { tone: "med" }), mk("a"), mk("b", { rowMarkers: ["green", "yellow", "yellow", "yellow", "yellow"] })]);
    expect(p.winner).toBe("a");
    expect(p.left[0].text).toContain("medicinal product");
  });

  it("says so when the pick is only Buy with caution: the better of the two, not an all-clear", () => {
    const p = pickFor([mk("a", { tone: "caution" }), mk("b", { tone: "caution", rowMarkers: ["yellow", "yellow", "yellow", "yellow", "yellow"] })]);
    expect(p.winner).toBe("a");
    expect(p.caveats.join(" ")).toContain("the better of these, not an all-clear");
    expect(pickFor([mk("a"), mk("b", { rowMarkers: ["yellow", "yellow", "yellow", "yellow", "yellow"] })]).caveats.join(" ")).not.toContain("all-clear");
  });

  it("makes no pick when nothing could be rated", () => {
    const p = pickFor([mk("a", { tone: "info" }), mk("b", { tone: "med" })]);
    expect(p.kind).toBe("unrated");
    expect(p.winner).toBeNull();
  });

  it("makes no pick when every rated product is Look elsewhere", () => {
    const p = pickFor([mk("a", { tone: "look" }), mk("b", { tone: "look" })]);
    expect(p.kind).toBe("none");
    expect(p.winner).toBeNull();
    expect(p.summary).toContain("Look elsewhere");
  });

  it("still picks the better of two Buy with caution products, and carries the confidence caveat", () => {
    const a = mk("a", { tone: "caution", confidence: "medium", rowMarkers: ["yellow", "green", "green", "green", "green"] });
    const b = mk("b", { tone: "caution", rowMarkers: ["red", "green", "green", "green", "green"] });
    const p = pickFor([b, a]);
    expect(p.winner).toBe("a");
    expect(p.caveats.join(" ")).toContain("medium confidence");
  });

  it("is the same whichever order the products were added in", () => {
    const set = [
      mk("a", { rowMarkers: ["green", "green", "yellow", "yellow", "green"], price: priced(18) }),
      mk("b", { tone: "caution", rowMarkers: ["yellow", "green", "green", "green", "green"], price: priced(9) }),
      mk("c", { rowMarkers: ["green", "yellow", "yellow", "red", "yellow"], price: priced(25) }),
    ];
    const winners = [[0, 1, 2], [2, 1, 0], [1, 2, 0], [1, 0, 2]].map((o) => pickFor(o.map((i) => set[i])).winner);
    expect(new Set(winners)).toEqual(new Set(["a"]));
  });
});

describe("the side-by-side", () => {
  it("marks the leader of a row only where products differ", () => {
    const a = mk("a", { rowMarkers: ["green", "green", "yellow", "yellow", "green"] });
    const b = mk("b", { rowMarkers: ["green", "yellow", "yellow", "yellow", "yellow"] });
    const c = buildComparison([a, b]);
    expect(c.leaders.safety).toEqual([]); // level
    expect(c.leaders.formula).toEqual(["a"]);
    expect(c.leaders.claims).toEqual([]); // level
    expect(c.leaders.clarity).toEqual(["a"]);
  });

  it("names the cheapest only when every product has a price per unit in one unit, and not when all are the same", () => {
    expect(buildComparison([mk("a", { price: priced(10) }), mk("b", { price: priced(20) })]).cheapest).toBe("a");
    expect(buildComparison([mk("a", { price: priced(10) }), mk("b", { price: priced(10) })]).cheapest).toBeNull();
    expect(buildComparison([mk("a", { price: priced(10) }), mk("b")]).cheapest).toBeNull();
  });
});

describe("price and pack", () => {
  it("reads one pack size, and refuses a multipack", () => {
    expect(parsePack("50 ml")).toMatchObject({ size: 50, unit: "ml" });
    expect(parsePack("120g")).toMatchObject({ size: 120, unit: "g" });
    expect(parsePack("1 L")).toMatchObject({ size: 1000, unit: "ml" });
    expect(parsePack("2 x 50 ml")).toBeNull();
    expect(parsePack("Pack of 3, 50ml each")).toBeNull();
    expect(parsePack("50 ml / 100 ml")).toBeNull();
    expect(parsePack("")).toBeNull();
  });

  it("reads the first rupee amount, and nothing without a rupee sign", () => {
    expect(parseRupees("Rs.298 on Zepto, Blinkit, Flipkart")).toBe(298);
    expect(parseRupees("₹1,630 on Blinkit")).toBe(1630);
    expect(parseRupees("Rs. 12300 on Nykaa, Tata CLiQ, Tira for 75ml")).toBe(12300);
    expect(parseRupees("50 ml")).toBeNull();
  });

  it("works out the price per ml from the lowest price and the pack, not from the page's own free text", () => {
    expect(priceFacts({ lowestPrice: "Rs.429 on Nykaa, Amazon India", quantity: "20ml" })).toMatchObject({ total: 429, perUnit: 21.45, unit: "ml" });
    expect(priceFacts({ lowestPrice: "Rs.298 on Zepto", quantity: "120 g" })).toMatchObject({ perUnit: 2.48, unit: "g" });
    expect(priceFacts({ lowestPrice: "Rs.298", quantity: "2 x 60 g" }).perUnit).toBeNull();
    expect(priceFacts({ priceRange: "Rs.250–499", quantity: "10 ml" })).toMatchObject({ total: 250, perUnit: 25 });
  });
});

describe("check names", () => {
  it("files a check by one name whichever answer it carries", () => {
    expect(canonicalCheck("SPF: supported", "yes").label).toBe("SPF claim supported");
    expect(canonicalCheck("SPF: not supported", "no").label).toBe("SPF claim supported");
    expect(canonicalCheck("Dermatologist-tested: supported", "yes").label).toBe("Dermatologist-tested claim supported");
    expect(canonicalCheck("Vegan claim: supported", "yes").label).toBe("Vegan claim supported");
    expect(canonicalCheck("Animal-origin ingredient: Lanolin", "no")).toEqual({ label: "Vegan ingredient origin", state: "no", detail: "Lanolin" });
    expect(canonicalCheck("Vegan ingredient origin screened", "yes").label).toBe("Vegan ingredient origin");
    expect(canonicalCheck("Pregnancy ingredient flags: Homosalate and Benzophenone-3", "no")).toEqual({ label: "No pregnancy ingredient flags", state: "no", detail: "Homosalate and Benzophenone-3" });
    expect(canonicalCheck("Fragrance free", "no")).toEqual({ label: "Fragrance free", state: "no" });
  });
});

describe("a row's line", () => {
  it("says a repeated sentence once, and cuts a long line at a word", () => {
    const rep = "Endocrine-disruptor screen: Cyclopentasiloxane: D5 bioaccumulates in aquatic environment";
    expect(tidyLine(`${rep} ${rep} ${rep}`)).toBe(rep);
    // As stored: the third copy is cut off by the source.
    expect(tidyLine(`Endocrine-disruptor screen: Cyclopentasiloxane: D5 bioaccumulates in aquatic environment Cyclopentasiloxane: D5 bioaccumulates in aquatic environment Cyclopentasiloxane: D5 bioaccumulates in...`))
      .toBe("Endocrine-disruptor screen: Cyclopentasiloxane: D5 bioaccumulates in aquatic environment");
    const long = "A named third-party lab report is public and the full method may not be, and there is much more to say about it than a narrow cell can hold at all";
    const cut = tidyLine(long, 60);
    expect(cut.length).toBeLessThanOrEqual(61);
    expect(cut.endsWith("…")).toBe(true);
    expect(tidyLine("Short line.")).toBe("Short line.");
  });
});

describe("small helpers", () => {
  it("reads SPF and PA from a sunscreen's name", () => {
    expect(sunFactsOf("Fluid SPF 50 PA++++")).toEqual({ spf: "SPF 50", pa: "PA++++" });
    expect(sunFactsOf("Daily Shield SPF50+")).toEqual({ spf: "SPF 50+", pa: null });
    expect(sunFactsOf("Plain Lotion")).toEqual({ spf: null, pa: null });
  });

  it("does not repeat the brand when the name starts with it", () => {
    expect(displayName({ brand: "Minimalist", name: "Minimalist SPF 50" })).toBe("Minimalist SPF 50");
    expect(displayName({ brand: "Minimalist", name: "SPF 50 Fluid" })).toBe("Minimalist SPF 50 Fluid");
  });
});
