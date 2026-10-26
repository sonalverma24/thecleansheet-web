import { describe, expect, it } from "vitest";
import { SAMPLE_EXAMPLE_MINERAL_SUNSCREEN, SAMPLE_EXAMPLE_PROHIBITED } from "@/data/analysis/sample-reviews";
import { cheatCodeFor } from "@/data/analysis/cheat-codes";
import { deriveVerdict } from "@/lib/product-review-engine";
import { reviewToScorecard } from "@/lib/review-to-scorecard";
import { decideReview } from "@/lib/analyser-x";
import { lint } from "@/lib/analyser-x/copy";
import { BASE, claimOf, evidence, rv } from "@/lib/analyser-x/test-helpers";
import type { ProductReview } from "@/lib/product-review-types";
import { buildPillsPage, buyLinksOf, claimLine, dayText, shortActives, testLevelOf, type PillsPageModel } from "./pills-page";

const NOW = "2026-10-23T00:00:00.000Z";
const page = (review: ProductReview, now = NOW, over?: Parameters<typeof decideReview>[2]) => {
  const { product } = reviewToScorecard(review, deriveVerdict(review));
  return { model: buildPillsPage(review, product, now, decideReview(review, now, over)), product };
};
/** Every sentence the page builds from the decision and from facts. */
const sentences = (m: PillsPageModel): string[] => [
  m.take.summary, m.take.recommendation, m.take.reason, m.take.confidence.sentence, ...m.take.notes,
  m.claimCheck.oneLiner, m.regulatoryCheck.oneLiner, ...m.gaps, ...m.highlights.map((h) => h.label), ...m.highlights.flatMap((h) => (h.detail ? [h.detail] : [])),
  ...(m.details ?? []).map((d) => d.oneLiner), ...m.faq.map((f) => f.a),
].filter(Boolean);

describe("a Good choice", () => {
  const { model: m } = page(SAMPLE_EXAMPLE_MINERAL_SUNSCREEN);

  it("block 3: the take names the product, the pill's recommendation and the confidence, in words", () => {
    expect(m.pill).toEqual({ key: "good-choice", label: "Good choice", tone: "good", marker: "green" });
    expect(m.take.summary).toBe("This sunscreen's key actives are zinc oxide and titanium dioxide.");
    expect(m.take.recommendation).toBe("Good choice: we recommend buying it.");
    expect(m.take.reason).toMatch(/No prohibited or flagged ingredient/);
    expect(m.take.confidence).toMatchObject({ level: "high", label: "High" });
    expect(m.take.confidence.sentence).toBe("We are highly confident in this: the ingredient list comes from INCIDecoder, all 10 ingredients were checked and 4 of 4 claims were checked against pages we read.");
  });

  it("block 4: highlights say only what the evidence lets us say, including the pregnancy check", () => {
    const by = Object.fromEntries(m.highlights.map((h) => [h.label, h.state]));
    expect(by).toMatchObject({ "No pregnancy flags found": "unknown", "Paraben free": "yes", "Fragrance free": "yes", "Alcohol free": "yes", "Mineral filters only": "yes", "SPF: brand claim; TCS evidence not reviewed": "unknown" });
    // No product is called pregnancy safe, and a brand's SPF claim is not a verified tick without a TCS evidence record.
    expect(m.highlights.map((h) => h.label)).not.toContain("Pregnancy safe");
    expect(m.highlights.map((h) => h.label)).not.toContain("SPF verified");
  });

  it("blocks 6 and 7: one line each", () => {
    expect(m.claimCheck.oneLiner).toBe("2 of 4 claims are publicly supported; 2 need proof.");
    expect(m.regulatoryCheck.oneLiner).toBe("Meets the EU, India and South Korea; none prohibited in the US, Australia and Canada.");
    expect(m.regulatoryCheck.panel?.authorities).toHaveLength(6);
  });

  it("block 8: five numbered rows, each wearing one of the three colour markers", () => {
    expect(m.details?.map((d) => [d.n, d.title, d.rating.marker, d.rating.word])).toEqual([
      ["01", "Ingredient safety", "green", "Strong"], ["02", "Formula logic", "green", "Strong"], ["03", "Claims evidence", "green", "Strong"],
      ["04", "Test transparency", "green", "Strong"], ["05", "Consumer clarity", "yellow", "Fair"],
    ]);
    expect(m.details?.[1].oneLiner).toBe("Anhydrous silicone gel. The right vehicle for a mineral filter.");
    expect(m.details?.[4].oneLiner).toBe("Clear overall, with 1 gap in guidance: usage warnings.");
  });

  it("blocks 9, 10, 12: gaps, the sunscreen cheat code, and how to use", () => {
    expect(m.gaps).toEqual(["A clinical study with sample size, duration and method."]);
    expect(m.cheatCode).toEqual({ title: "Sunscreen cheat code", text: "SPF only works at 2 mg per cm². Apply generously and reapply every two hours." });
    expect(m.howToUse).toMatchObject({ routine: "The last step of the morning routine, after moisturiser." });
  });

  it("block 13: the FAQ is built from facts", () => {
    const q = m.faq.map((f) => f.q);
    expect(q).toEqual(expect.arrayContaining(["Can I use it during pregnancy?", "Is it allowed in India?", "Does it do what it says?", "How recent is this analysis?"]));
    expect(m.faq.find((f) => f.q === "How recent is this analysis?")?.a).toBe("Analysed on 20 Oct 2026 from INCIDecoder. We re-check analyses older than six months.");
    expect(m.faq.find((f) => f.q.startsWith("What does it cost"))?.a).toBe("50 g · from ₹649 (₹13/g). Seen at Nykaa ₹699, Amazon ₹649 and Brand Website ₹699.");
  });

  it("every built sentence passes the language lint", () => {
    for (const t of sentences(m)) expect(lint(t, { allowBanned: true }).problems.filter((p) => !/longer than/.test(p)), t).toEqual([]);
  });
});

describe("the other pills", () => {
  it("Buy with caution: a claim gap is the headline and what would strengthen it", () => {
    const review = rv({ productName: "Brightening Serum", category: "Serum", claimMap: [claimOf({ text: "Fades dark spots in 4 weeks", types: ["concern"], primaryType: "concern", evidenceLevel: 2, corroborated: true })] });
    const { model: m } = page(review);
    expect(m.pill.tone).toBe("caution");
    expect(m.take.recommendation).toBe("Buy with caution: it may be worth buying, but read the points below first.");
    expect(m.take.reason).toMatch(/Fades dark spots in 4 weeks/);
    expect(m.gaps.join(" ")).toMatch(/A test on the finished product for “Fades dark spots in 4 weeks”/);
  });

  it("Look elsewhere: the regulatory line says who prohibits it, and the ingredient safety row is a concern", () => {
    const { model: m } = page(rv({ productName: "Preserved Cream", category: "Moisturizer", inciIngredients: [...BASE, "Formaldehyde"] }));
    expect(m.pill.tone).toBe("look");
    expect(m.take.recommendation).toBe("Look elsewhere: we would not buy this one.");
    expect(m.regulatoryCheck.oneLiner).toMatch(/^Falls short in the EU, India, South Korea and Canada; none prohibited in the US and Australia\. Formaldehyde is prohibited in cosmetics in the EU, India, South Korea and Canada\./);
    expect(m.details?.[0].rating).toEqual({ word: "Concern", marker: "red" });
  });

  it("Not enough info because the page could not be read: low confidence, nothing rated, no panel", () => {
    const review = rv({ productName: "Face Cream", category: "Moisturizer", inciIngredients: [], ingredientReads: [], claimMap: [] }, evidence.model());
    const { model: m } = page(review, NOW, { acquisition: { pageFetched: false, errors: ["page_failed"] } });
    expect(m.pill.tone).toBe("info");
    expect(m.take.summary).toBe("");
    expect(m.take.confidence).toMatchObject({ level: "low", sentence: "Our confidence is low: we could not read the product page." });
    expect(m.details).toBeNull();
    expect(m.regulatoryCheck).toEqual({ oneLiner: "We cannot complete this check without a full ingredient list.", panel: null });
    expect(m.gaps).toContain("A successful read of the product page. We are checking again.");
  });

  it("Medicinal product: no cosmetic panel, no details, no cheat code, no how-to-use", () => {
    const { model: m } = page(rv({ productName: "Anti Dandruff Shampoo", category: "Shampoo", inciIngredients: [...BASE, "Ketoconazole"] }));
    expect(m.pill.tone).toBe("med");
    expect(m.take.recommendation).toBe("Medicinal product: it is assessed as a medicine, so ask a pharmacist or doctor before using it.");
    expect(m.regulatoryCheck).toEqual({ oneLiner: "Assessed as a medicine, so the cosmetic ingredient rules do not apply.", panel: null });
    expect([m.details, m.cheatCode, m.howToUse]).toEqual([null, null, null]);
    expect(m.faq.map((f) => f.q)).not.toContain("Can I use it during pregnancy?");
  });
});

describe("what changes the confidence sentence", () => {
  it("an ingredient our database lacks makes it medium, and says so", () => {
    const { model: m } = page(rv({ productName: "Serum", category: "Serum", inciIngredients: [...BASE, "Zorbaflux"] }));
    expect(m.take.confidence).toEqual({ level: "medium", label: "Medium", sentence: "We are moderately confident. What holds it back: 1 ingredient is not in our reference database." });
  });

  it("an old analysis is stale, and the confidence sentence says how old", () => {
    const { model: m } = page(SAMPLE_EXAMPLE_MINERAL_SUNSCREEN, "2027-06-01T00:00:00.000Z");
    expect(m.stale).toBe(true);
    expect(m.take.confidence.level).toBe("medium");
    expect(m.take.confidence.sentence).toMatch(/the analysis is from 20 Oct 2026, over six months ago/);
    expect(m.faq.find((f) => f.q === "How recent is this analysis?")?.a).toMatch(/this one is due a re-check/);
  });
});

describe("at a glance", () => {
  it("names a pregnancy-flagged ingredient instead of ticking", () => {
    const { model: m } = page(rv({ productName: "Night Serum", category: "Serum", inciIngredients: [...BASE, "Retinyl Palmitate"] }));
    const h = m.highlights[0];
    expect(h).toMatchObject({ label: "Pregnancy ingredient flag: Retinyl Palmitate", state: "no" });
    const answer = m.faq.find((f) => f.q === "Can I use it during pregnancy?")?.a;
    expect(answer).toMatch(/^Ingredient-level flags from our reference data: Retinyl Palmitate: .*\(source: .+\)\./);
    expect(answer).toMatch(/This is not a product safety conclusion\. Ask a healthcare professional\.$/);
  });

  it("a fragrance in the list is not fragrance free", () => {
    const { model: m } = page(rv({ productName: "Cream", category: "Moisturizer", inciIngredients: [...BASE, "Parfum"] }));
    expect(m.highlights.find((h) => h.label === "Fragrance free")?.state).toBe("no");
    expect(m.faq[0].a).toBe("The complete ingredient list names an explicit fragrance declaration or essential oil.");
  });

  it("is never a tick while the list is unknown", () => {
    const review = rv({ productName: "Cream", category: "Moisturizer", inciIngredients: [], ingredientReads: [] }, evidence.model());
    const by = Object.fromEntries(page(review).model.highlights.map((h) => [h.label, h.state]));
    expect(by["Paraben free"]).toBe("unknown");
    expect(by["Fragrance free"]).toBe("unknown");
  });
});

describe("the pregnancy chip", () => {
  const pregnancyChips = (m: PillsPageModel) => m.highlights.filter((h) => /pregnan/i.test(h.label));

  it("says 'No pregnancy flags found' when the list was screened and nothing is flagged: never 'safe'", () => {
    const chips = pregnancyChips(page(rv({ productName: "Plain Cream", category: "Moisturizer" })).model);
    expect(chips).toEqual([expect.objectContaining({ label: "No pregnancy flags found", state: "unknown", detail: expect.stringMatching(/not proof that the product is safe during pregnancy/) })]);
  });

  it("says 'Pregnancy ingredient flag' only for a product that has one, and names the ingredient", () => {
    const chips = pregnancyChips(page(rv({ productName: "Night Serum", category: "Serum", inciIngredients: [...BASE, "Retinyl Palmitate"] })).model);
    expect(chips).toEqual([expect.objectContaining({ label: "Pregnancy ingredient flag: Retinyl Palmitate", state: "no" })]);
  });

  it("a retinol serum gets the caution, though the database holds no row for plain retinol", () => {
    const chips = pregnancyChips(page(rv({ productName: "Retinol Serum", category: "Serum", inciIngredients: [...BASE, "Retinol"] })).model);
    expect(chips).toEqual([expect.objectContaining({ label: "Pregnancy ingredient flag: Retinol", state: "no" })]);
  });

  it("a retinoid is flagged on the vitamin A row's own source, and is not also listed as not checked", () => {
    const { model: m } = page(rv({ productName: "Retinol Serum", category: "Serum", inciIngredients: [...BASE, "Retinol"] }));
    const [chip] = pregnancyChips(m);
    expect(chip.detail).toMatch(/Retinol: A retinoid; generally advised against during pregnancy\. Source: .*SCCS.* \(confidence: (high|medium)\)\./);
    expect(chip.detail).not.toMatch(/Not checked:/);
  });

  it("a retinol alternative is not mistaken for a retinoid", () => {
    const { model: m } = page(rv({ productName: "Bakuchiol Serum", category: "Serum", inciIngredients: [...BASE, "Bakuchiol (a retinol alternative)"] }));
    expect(pregnancyChips(m)).toEqual([expect.objectContaining({ label: "No pregnancy flags found", state: "unknown" })]);
  });

  it("keeps the chip when some ingredient could not be checked, but names it as not checked: not a flag, not 'safe'", () => {
    const { model: m } = page(rv({ productName: "Serum", category: "Serum", inciIngredients: [...BASE, "Zorbaflux"] }));
    expect(pregnancyChips(m)).toEqual([expect.objectContaining({ label: "No pregnancy flags found", state: "unknown", detail: expect.stringMatching(/Not checked: Zorbaflux\./) })]);
  });

  it("says the screen is incomplete when there is no ingredient list to check", () => {
    const review = rv({ productName: "Cream", category: "Moisturizer", inciIngredients: [], ingredientReads: [] }, evidence.model());
    expect(pregnancyChips(page(review).model)).toEqual([expect.objectContaining({ label: "Pregnancy ingredient screen incomplete", state: "unknown" })]);
  });

  it("a flag still shows when another ingredient could not be checked, and the unchecked one is named", () => {
    const { model: m } = page(rv({ productName: "Serum", category: "Serum", inciIngredients: [...BASE, "Retinyl Palmitate", "Zorbaflux"] }));
    expect(pregnancyChips(m)).toEqual([expect.objectContaining({ label: "Pregnancy ingredient flag: Retinyl Palmitate", state: "no", detail: expect.stringMatching(/Not checked: Zorbaflux\./) })]);
  });
});

describe("buy links", () => {
  it("are searches on the retailers we know, price-only for the rest, and never a claim of a product page", () => {
    const links = buyLinksOf(SAMPLE_EXAMPLE_MINERAL_SUNSCREEN, reviewToScorecard(SAMPLE_EXAMPLE_MINERAL_SUNSCREEN, deriveVerdict(SAMPLE_EXAMPLE_MINERAL_SUNSCREEN)).product);
    expect(links.map((l) => [l.name, l.direct, l.url === null])).toEqual([["Nykaa", false, false], ["Amazon", false, false], ["Brand Website", false, true]]);
    expect(links[0].url).toMatch(/^https:\/\/www\.nykaa\.com\/search\/result\/\?q=Sample%20Co\./);
    expect(links[1].url).toMatch(/^https:\/\/www\.amazon\.in\/s\?k=/);
  });

  it("a catalogue product's own retailer links are direct", () => {
    const { product } = page(SAMPLE_EXAMPLE_MINERAL_SUNSCREEN);
    const links = buyLinksOf(SAMPLE_EXAMPLE_MINERAL_SUNSCREEN, { ...product, retailerLinks: [{ name: "Nykaa", url: "https://www.nykaa.com/p/1" }] });
    expect(links).toEqual([{ name: "Nykaa", url: "https://www.nykaa.com/p/1", price: null, direct: true }]);
  });
});

describe("the take names the category in the singular", () => {
  it("'Recreational Sunscreens' reads as one sunscreen; 'Gloss' keeps its s", () => {
    const base = SAMPLE_EXAMPLE_MINERAL_SUNSCREEN;
    expect(page({ ...base, category: "Recreational Sunscreens" }).model.take.summary).toBe("This recreational sunscreen's key actives are zinc oxide and titanium dioxide.");
    expect(page({ ...base, category: "Lip Gloss" }).model.take.summary).toBe("This lip gloss lists 10 ingredients on its label.");
  });
});

describe("helpers", () => {
  it("test transparency reads the strongest evidence for what the product promises, not for 'contains X'", () => {
    const review = rv({ claimMap: [claimOf({ text: "Contains 5% niacinamide", primaryType: "active", types: ["active"], evidenceLevel: 3 }), claimOf({ text: "Fades spots", primaryType: "concern", types: ["concern"], evidenceLevel: 2 })] });
    expect(testLevelOf(review)).toBe(2);
  });

  it("the claim line counts supported, needing proof and unsupported", () => {
    const { product } = page(SAMPLE_EXAMPLE_MINERAL_SUNSCREEN);
    expect(claimLine({ ...product, claimsCheck: [] })).toBe("We found no marketing claims to check.");
    expect(claimLine({ ...product, claimsCheck: [{ claim: "a", decision: "Publicly supported", evidenceStatus: "Evidence visible", note: "" }] })).toBe("1 of 1 claim is publicly supported.");
  });

  it("cheat codes: sunscreen first, then retinoid, acids and vitamin C; nothing for a plain moisturiser", () => {
    expect(cheatCodeFor("sunscreen", ["Retinol"])?.id).toBe("sunscreen");
    expect(cheatCodeFor("treatment", ["Retinyl Palmitate"])?.id).toBe("retinoid");
    expect(cheatCodeFor("treatment", ["Glycolic Acid"])?.id).toBe("acids");
    expect(cheatCodeFor("treatment", ["Ascorbic Acid"])?.id).toBe("vitamin-c");
    expect(cheatCodeFor("leave-on", ["Aqua", "Glycerin"])).toBeNull();
  });

  it("dates read like the rest of the site", () => {
    expect(dayText("2026-10-20T00:00:00.000Z")).toBe("20 Oct 2026");
    expect(dayText("not a date")).toBe("");
  });
});

describe("key actives are named briefly on the page", () => {
  const MEXORYL = "Mexoryl 400 (Methoxypropylamino Cyclohexenylidene Ethoxyethylcyanoacetate)";
  const GROUP = "Multiple Broad-Spectrum UV Filters (e.g., Ethylhexyl Salicylate, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Butyl Methoxydibenzoylmethane)";

  it("a name loses its bracketed chemical name and any percentage", () => {
    expect(shortActives([MEXORYL])).toEqual(["Mexoryl 400"]);
    expect(shortActives(["Niacinamide (Vitamin B3) 10%", "Betaine Salicylate 4%"])).toEqual(["Niacinamide", "Betaine Salicylate"]);
  });

  it("a compound entry becomes separate actives: nothing after the '&' is lost", () => {
    expect(shortActives(["Iron Oxides (Ci 77491, Ci 77492, Ci 77499) & Titanium Dioxide (Ci 77891)"])).toEqual(["Iron Oxides", "Titanium Dioxide"]);
    expect(shortActives(["Alcohol Denat & Silica"])).toEqual(["Alcohol Denat", "Silica"]);
    expect(shortActives(["Niacinamide and Zinc PCA", "zinc pca"])).toEqual(["Niacinamide", "Zinc PCA"]);
  });

  it("a group of filters is left out of the headline: each one is already in the ingredient list", () => {
    expect(shortActives([MEXORYL, GROUP])).toEqual(["Mexoryl 400"]);
    expect(shortActives([GROUP, MEXORYL])).toEqual(["Mexoryl 400"]);
    for (const g of ["Various UV filters", "Several plant oils", "Other emollients", "UV filters (e.g., octisalate)"]) expect(shortActives(["Zinc Oxide", g]), g).toEqual(["Zinc Oxide"]);
  });

  it("a group is named only when nothing else is, so the line is never empty", () => {
    expect(shortActives([GROUP])).toEqual(["Multiple Broad-Spectrum UV Filters"]);
    expect(shortActives([])).toEqual([]);
    expect(shortActives(["", "  "])).toEqual([]);
  });

  it("each active is named once, whatever its case", () => {
    expect(shortActives(["Zinc Oxide", "zinc oxide (non-nano)", "Titanium Dioxide"])).toEqual(["Zinc Oxide", "Titanium Dioxide"]);
  });

  it("the take sentence and the hero list use the short names: a trade name keeps its capital, a chemical name is lower case", () => {
    const review = rv({ productName: "Fluid SPF 50", category: "Sunscreen", keyActivesRead: [
      { name: MEXORYL, function: "UV filter", concentrationConfidence: "Low" }, { name: GROUP, function: "UV filters", concentrationConfidence: "Low" },
    ], inciIngredients: [...BASE, "Methoxypropylamino Cyclohexenylidene Ethoxyethylcyanoacetate", "Ethylhexyl Salicylate"] });
    const { model } = page(review);
    expect(model.take.summary).toBe("This sunscreen's key active is Mexoryl 400.");
    expect(model.keyActives).toEqual(["Mexoryl 400"]);
    const two = page(rv({ productName: "SPF Cream", category: "Sunscreen", keyActivesRead: [
      { name: "Zinc Oxide (Non-Nano) 12%", function: "UV filter", concentrationConfidence: "Low" }, { name: "Vitamin B5", function: "Humectant", concentrationConfidence: "Low" },
    ] }));
    expect(two.model.take.summary).toBe("This sunscreen's key actives are zinc oxide and Vitamin B5.");
  });

  it("the full ingredient list is untouched: the long chemical name is still there for the ingredient block and its page", () => {
    const review = rv({ productName: "Fluid SPF 50", category: "Sunscreen", keyActivesRead: [{ name: MEXORYL, function: "UV filter", concentrationConfidence: "Low" }],
      inciIngredients: [...BASE, "Methoxypropylamino Cyclohexenylidene Ethoxyethylcyanoacetate"] });
    const { product } = page(review);
    expect(product.ingredients.map((i) => i.name)).toContain("Methoxypropylamino Cyclohexenylidene Ethoxyethylcyanoacetate");
  });
});

describe("the Regulatory check reads as a search of each authority's prohibited list", () => {
  const withGap = rv({ productName: "Fluid SPF 50", category: "Sunscreen", inciIngredients: [...BASE, "Zorbaflux Glycoside", "Quillian Extract"] });
  const { model: gap } = page(withGap);
  const { model: bad } = page(SAMPLE_EXAMPLE_PROHIBITED);

  it("nothing prohibited reads 'None prohibited', whatever our reference data does not cover", () => {
    const words = new Set(gap.regulatoryCheck.panel!.authorities.map((a) => a.result));
    expect([...words].every((w) => w === "Meets" || w === "None prohibited")).toBe(true);
    expect(words.has("None prohibited")).toBe(true);
    expect(gap.regulatoryCheck.oneLiner).toMatch(/^None prohibited in /);
  });

  it("no line of the block mentions our reference data, the database or what is not covered", () => {
    const text = [gap.regulatoryCheck.oneLiner, ...gap.regulatoryCheck.panel!.authorities.flatMap((a) => [a.result, a.detail])].join(" ");
    expect(text).not.toMatch(/reference (data|database)|not covered|not in our|not fully checked|could not be fully checked/i);
    expect(gap.faq.find((f) => f.q === "Is it allowed in India?")!.a).not.toMatch(/reference (data|database)|not covered/i);
  });

  it("the coverage gap is not hidden, it moves: still counted in the confidence and still listed under Gaps", () => {
    expect(gap.take.confidence.sentence).toMatch(/reference database/);
    expect(gap.gaps.join(" ")).toMatch(/Reference data for every listed ingredient/);
  });

  it("what is prohibited is still named, and restricted-but-unverifiable ingredients are still said plainly", () => {
    const eu = bad.regulatoryCheck.panel!.authorities.find((a) => a.id === "EU")!;
    expect(eu).toMatchObject({ result: "Falls short", detail: "1 ingredient is prohibited." });
    const us = bad.regulatoryCheck.panel!.authorities.find((a) => a.id === "US")!;
    expect(us.result).toBe("None prohibited");
    expect(us.detail).toMatch(/restricted ingredient could not be checked \(strength or conditions not stated\)/);
  });

  it("the decision itself is unchanged by the wording: a gap in our reference data does not move the pill (decision X42)", () => {
    const whole = page(rv({ productName: "Fluid SPF 50", category: "Sunscreen", inciIngredients: BASE })).model;
    expect(gap.pill.key).toBe(whole.pill.key);
    expect(["high", "medium", "low"]).toContain(gap.take.confidence.level);
    expect(gap.take.confidence.level).not.toBe("high");
  });
});

describe("The detail block leaves out the coverage gap but keeps it in the logic", () => {
  const withGap = rv({ productName: "Fluid SPF 50", category: "Sunscreen", inciIngredients: [...BASE, "Zorbaflux Glycoside", "Quillian Extract", "Parfum"] });
  const { model: gap } = page(withGap);
  const rows = (m: PillsPageModel) => (m.details ?? []).flatMap((d) => [d.title, d.oneLiner, d.rating.word, ...d.body]);

  it("no row, line or bullet mentions our reference data, the database or what is not covered", () => {
    expect(gap.details).not.toBeNull();
    expect(rows(gap).join(" ")).not.toMatch(/reference (data|database)|not covered|not in our/i);
  });

  it("the Ingredient safety row is never empty: it falls back to a plain line that claims no outcome", () => {
    const safety = gap.details!.find((d) => d.title === "Ingredient safety")!;
    expect(safety.oneLiner.length).toBeGreaterThan(15);
  });

  it("the gap does not move the pill, but the confidence says so and Gaps lists it", () => {
    const whole = page(rv({ productName: "Fluid SPF 50", category: "Sunscreen", inciIngredients: [...BASE, "Parfum"] })).model;
    expect(gap.pill.key).toBe(whole.pill.key);
    expect(gap.take.confidence.sentence).toMatch(/reference database/);
    expect(gap.gaps.join(" ")).toMatch(/Reference data for every listed ingredient/);
  });

  it("an ingredient list that is only partly covered is still rated below a fully checked one", () => {
    const full = page(SAMPLE_EXAMPLE_MINERAL_SUNSCREEN).model.details!.find((d) => d.title === "Ingredient safety")!;
    const part = gap.details!.find((d) => d.title === "Ingredient safety")!;
    expect(full.rating.marker).toBe("green");
    expect(part.rating.marker).toBe("yellow");
  });

  it("a real finding is still shown: a prohibited ingredient leads the row", () => {
    const bad = page(SAMPLE_EXAMPLE_PROHIBITED).model.details!.find((d) => d.title === "Ingredient safety")!;
    expect(bad.rating.marker).toBe("red");
    expect(bad.oneLiner).toMatch(/Formaldehyde is prohibited/);
  });
});
