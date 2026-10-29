import { describe, expect, it } from "vitest";
import { SAMPLE_EXAMPLE_MINERAL_SUNSCREEN, SAMPLE_EXAMPLE_PROHIBITED } from "@/data/analysis/sample-reviews";
import { cheatCodeFor } from "@/data/analysis/cheat-codes";
import { deriveVerdict } from "@/lib/product-review-engine";
import { reviewToScorecard } from "@/lib/review-to-scorecard";
import { decideReview } from "@/lib/analyser-x";
import { lint } from "@/lib/analyser-x/copy";
import { BASE, claimOf, evidence, rv } from "@/lib/analyser-x/test-helpers";
import { reviewInciList } from "@/lib/review-inci";
import type { ClaimsCheckItem } from "@/data/brands/types";
import type { ProductReview } from "@/lib/product-review-types";
import { GLANCE_MAX, buildPillsPage, buyLinksOf, claimLine, dayText, highlightsOf, shortActives, testLevelOf, verifiedChecks, type PillsPageModel } from "./pills-page";

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

  it("block 4: highlights say only what the evidence lets us say: a tick or a cross, never a grey 'not known'", () => {
    const by = Object.fromEntries(m.highlights.map((h) => [h.label, h.state]));
    expect(by).toEqual({ "Fragrance free": "yes", "Paraben free": "yes", "Alcohol free": "yes", "Mineral filters only": "yes", "Essential oil free": "yes" });
    // No product is called pregnancy safe. A brand's SPF claim with no TCS evidence record, and a screen that found no flag (which is not proof), are not drawn at all.
    const labels = m.highlights.map((h) => h.label);
    for (const gone of ["Pregnancy safe", "SPF verified", "No pregnancy flags found"]) expect(labels).not.toContain(gone);
    expect(labels.filter((l) => /brand claim|TCS evidence/i.test(l))).toEqual([]);
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
    const h = m.highlights.find((x) => x.label.startsWith("Pregnancy ingredient flag"));
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

  it("is never a tick while the list is unknown, and is then not drawn at all", () => {
    const review = rv({ productName: "Cream", category: "Moisturizer", inciIngredients: [], ingredientReads: [] }, evidence.model());
    const { model: m } = page(review);
    expect(m.highlights).toEqual([]);
    // Nothing is claimed in words either: the FAQ does not answer "is it fragrance free" from a list we could not read.
    expect(m.faq.map((f) => f.q)).not.toContain("Is Cream fragrance free?");
  });

  it("a list with no captured source quote is not drawn as ticks, however complete it looks", () => {
    const review = rv({ productName: "Cream", category: "Moisturizer" }, evidence.model());
    expect(review.inciIngredients?.length).toBeGreaterThan(3);
    expect(page(review).model.highlights).toEqual([]);
  });
});

describe("the At a glance strip: only what we can stand behind, short, and at most five", () => {
  const supported = (claim: string): ClaimsCheckItem => ({ claim, evidenceStatus: "Evidence visible", decision: "Publicly supported", note: "A named test report is public." });
  const contradicted = (claim: string): ClaimsCheckItem => ({ claim, evidenceStatus: "Evidence visible", decision: "Not publicly supported", note: "The public report says otherwise." });
  const brandOnly = (claim: string): ClaimsCheckItem => ({ claim, evidenceStatus: "Brand claim — TCS evidence not reviewed", decision: "Needs proof", note: "" });
  /** The page model for a review whose claim checks are replaced by `claims`. */
  const withClaims = (review: ProductReview, claims: ClaimsCheckItem[]) => {
    const { product } = reviewToScorecard(review, deriveVerdict(review));
    const withChecks = { ...product, claimsCheck: claims };
    return { model: buildPillsPage(review, withChecks, NOW, decideReview(review, NOW)), product: withChecks };
  };
  const SIX = ["SPF 50", "Dermatologist-tested", "Non-comedogenic", "Vegan formula", "Cruelty-free"];

  it("draws no chip for a claim that is only the brand's word: it is not a tick, a cross or a grey chip", () => {
    const { model: m } = withClaims(rv({ productName: "Sun Gel", category: "Sunscreen" }), SIX.map(brandOnly));
    expect(m.highlights.filter((h) => /SPF|Dermatologist|comedogenic|Vegan claim|Cruelty/i.test(h.label))).toEqual([]);
    for (const h of m.highlights) expect(h.state, h.label).not.toBe("unknown");
  });

  it("names a claim in a few words: supported is a tick, not supported is a cross", () => {
    const { model: m } = withClaims(rv({ productName: "Sun Gel", category: "Sunscreen" }), [supported("SPF 50"), contradicted("Non-comedogenic")]);
    const by = Object.fromEntries(m.highlights.map((h) => [h.label, h.state]));
    expect(by).toMatchObject({ "SPF: supported": "yes", "Non-comedogenic: not supported": "no" });
    for (const h of m.highlights) expect(h.label.length, h.label).toBeLessThanOrEqual(34);
  });

  it("shows at most five, ticks first and then crosses, and never drops a cross to make room for a tick", () => {
    const review = rv({ productName: "Sun Gel", category: "Sunscreen", inciIngredients: [...BASE, "Parfum", "Methylparaben", "Alcohol Denat."] });
    const all = withClaims(review, SIX.map(supported));
    const inci = reviewInciList(review);
    const checks = verifiedChecks(all.product, inci, all.product.pregnancyScreen);
    const crosses = checks.filter((h) => h.state === "no");
    // More checks than room: the fragrance, paraben and alcohol crosses are there, and five claim ticks.
    expect(checks.length).toBeGreaterThan(GLANCE_MAX);
    for (const label of ["Fragrance free", "Paraben free", "Alcohol free"]) expect(crosses.map((h) => h.label)).toContain(label);
    const shown = all.model.highlights;
    expect(shown).toHaveLength(GLANCE_MAX);
    // Every cross made it onto the strip; the ticks only fill what room is left.
    expect(shown.filter((h) => h.state === "no")).toEqual(crosses);
    // Ticks lead, crosses follow: once a cross appears, no tick comes after it.
    const firstCross = shown.findIndex((h) => h.state === "no");
    expect(firstCross).toBeGreaterThan(0);
    expect(shown.slice(0, firstCross).every((h) => h.state === "yes")).toBe(true);
    expect(shown.slice(firstCross).every((h) => h.state === "no")).toBe(true);
    expect(highlightsOf(all.product, inci, all.product.pregnancyScreen)).toEqual(shown);
  });

  it("the FAQ still answers 'is it fragrance free' when that tick falls beyond the cap", () => {
    // At least five crosses (two from the list, three contradicted claims) fill the strip, so the Fragrance free tick is not on it.
    const review = rv({ productName: "Sun Gel", category: "Sunscreen", inciIngredients: [...BASE, "Methylparaben", "Alcohol Denat."] });
    const { model: m } = withClaims(review, ["SPF 50", "Dermatologist-tested", "Non-comedogenic"].map(contradicted));
    expect(m.highlights).toHaveLength(GLANCE_MAX);
    expect(m.highlights.every((h) => h.state === "no")).toBe(true);
    expect(m.highlights.map((h) => h.label)).not.toContain("Fragrance free");
    expect(m.faq.find((f) => f.q === "Is Sun Gel fragrance free?")?.a).toMatch(/contains no explicit fragrance declaration or essential oil/);
  });
});

describe("the pregnancy chip", () => {
  const pregnancyChips = (m: PillsPageModel) => m.highlights.filter((h) => /pregnan/i.test(h.label));

  it("draws no chip when the list was screened and nothing is flagged: not a tick (never 'safe') and not a grey one; the FAQ says it in words", () => {
    const { model: m } = page(rv({ productName: "Plain Cream", category: "Moisturizer" }));
    expect(pregnancyChips(m)).toEqual([]);
    expect(m.faq.find((f) => f.q === "Can I use it during pregnancy?")?.a).toMatch(/No sourced pregnancy flags were found.*not proof that the product is safe during pregnancy/);
  });

  it("says 'Pregnancy ingredient flag' only for a product that has one, and names the ingredient", () => {
    const chips = pregnancyChips(page(rv({ productName: "Night Serum", category: "Serum", inciIngredients: [...BASE, "Retinyl Palmitate"] })).model);
    expect(chips).toEqual([expect.objectContaining({ label: "Pregnancy ingredient flag: Retinyl Palmitate", state: "no" })]);
  });

  it("a retinol serum gets the caution from retinol's own reviewed entry", () => {
    const chips = pregnancyChips(page(rv({ productName: "Retinol Serum", category: "Serum", inciIngredients: [...BASE, "Retinol"] })).model);
    expect(chips).toEqual([expect.objectContaining({ label: "Pregnancy ingredient flag: Retinol", state: "no" })]);
  });

  it("retinol is flagged on its own entry's wording and sources, and is not also listed as not checked", () => {
    const { model: m } = page(rv({ productName: "Retinol Serum", category: "Serum", inciIngredients: [...BASE, "Retinol"] }));
    const [chip] = pregnancyChips(m);
    expect(chip.detail).toMatch(/^Retinol: Caution during pregnancy: precaution is commonly advised for topical retinol\./);
    expect(chip.detail).toMatch(/Source: EU Reg\. 2024\/996 Annex III entry 376; SCCS\/1639\/21.* \(confidence: high\)\./);
    expect(chip.detail).not.toMatch(/Not checked:/);
  });

  it("a retinoid with no entry of its own (retinal) is still flagged, on the vitamin A entry's source", () => {
    const { model: m } = page(rv({ productName: "Retinal Serum", category: "Serum", inciIngredients: [...BASE, "Retinal"] }));
    const [chip] = pregnancyChips(m);
    expect(chip.label).toBe("Pregnancy ingredient flag: Retinal");
    expect(chip.detail).toMatch(/Retinal: A retinoid; generally advised against during pregnancy\. Source: .*SCCS.* \(confidence: (high|medium)\)\./);
    expect(chip.detail).not.toMatch(/Not checked:/);
  });

  it("a retinol alternative is not mistaken for a retinoid", () => {
    const { model: m } = page(rv({ productName: "Bakuchiol Serum", category: "Serum", inciIngredients: [...BASE, "Bakuchiol (a retinol alternative)"] }));
    // Not flagged as a retinoid, and nothing else to say: no chip.
    expect(pregnancyChips(m)).toEqual([]);
  });

  it("shows no chip when some ingredient could not be checked and nothing is flagged: in between is neither a flag nor 'no flags found'", () => {
    const { model: m } = page(rv({ productName: "Serum", category: "Serum", inciIngredients: [...BASE, "Zorbaflux"] }));
    expect(pregnancyChips(m)).toEqual([]);
    // The FAQ still answers the question in words.
    expect(m.faq.find((f) => f.q === "Can I use it during pregnancy?")?.a).toMatch(/Ingredients not resolved: Zorbaflux\./);
  });

  it("shows no chip when there is no ingredient list to check", () => {
    const review = rv({ productName: "Cream", category: "Moisturizer", inciIngredients: [], ingredientReads: [] }, evidence.model());
    const { model: m } = page(review);
    expect(pregnancyChips(m)).toEqual([]);
    expect(m.faq.find((f) => f.q === "Can I use it during pregnancy?")?.a).toMatch(/screen is incomplete/);
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

  it("a clear screen stays green when most of the list was checked: an ingredient we hold no row for does not make it Fair", () => {
    // 4 of the 7 ingredients are held (57%), nothing checked is flagged.
    const safety = gap.details!.find((d) => d.title === "Ingredient safety")!;
    expect(gap.decision.reasons.map((r) => r.ruleId)).toContain("note.screen_partial");
    expect(safety.rating).toEqual({ word: "Strong", marker: "green" });
  });

  it("but not when fewer than half the list was checked: the row stays Fair, as the confidence stays Low", () => {
    // 4 of the 9 ingredients are held (44%).
    const mostlyUnread = page(rv({ productName: "Fluid SPF 50", category: "Sunscreen", inciIngredients: [...BASE, "Zorbaflux Glycoside", "Quillian Extract", "Parfum", "Brenthol Ester", "Vantrix Gum"] })).model;
    const safety = mostlyUnread.details!.find((d) => d.title === "Ingredient safety")!;
    expect(safety.rating).toEqual({ word: "Fair", marker: "yellow" });
    expect(mostlyUnread.take.confidence.level).toBe("low");
  });

  it("the coverage sentence stays out of the row either way: it is in the confidence and under Gaps", () => {
    const safety = gap.details!.find((d) => d.title === "Ingredient safety")!;
    expect([safety.oneLiner, ...safety.body].join(" ")).not.toMatch(/reference (data|database)|not in our/i);
    expect(gap.gaps.join(" ")).toMatch(/Reference data for every listed ingredient/);
  });

  it("a real finding is still shown: a prohibited ingredient leads the row", () => {
    const bad = page(SAMPLE_EXAMPLE_PROHIBITED).model.details!.find((d) => d.title === "Ingredient safety")!;
    expect(bad.rating.marker).toBe("red");
    expect(bad.oneLiner).toMatch(/Formaldehyde is prohibited/);
  });
});

describe("a % of users figure is a gap note, not a reason to buy with caution (owner decision, 2026-10-29)", () => {
  const hero = claimOf({ text: "Brightens skin", types: ["appearance"], primaryType: "appearance", evidenceLevel: 6 });
  const survey = claimOf({ text: "95% of users felt the product gently cleansed their skin.", types: ["clinical", "time-bound"], primaryType: "clinical", evidenceLevel: 4 });
  const base = (claims: ReturnType<typeof claimOf>[]) => page(rv({ productName: "Gentle Cleanser", category: "Face Cleanser", inciIngredients: BASE, claimMap: claims })).model;

  it("leaves the pill where it was without the figure", () => {
    expect(base([hero, survey]).pill).toEqual(base([hero]).pill);
  });

  it("lists the missing test details under Gaps, naming the claim", () => {
    expect(base([hero, survey]).gaps).toContain("The test details (sample size, duration, method) behind “95% of users felt the product gently cleansed their skin.”.");
  });

  it("lists nothing when the test details are public", () => {
    const detailed = claimOf({ ...survey, evidenceLevel: 6 });
    expect(base([hero, detailed]).gaps.join(" ")).not.toMatch(/95% of users/);
  });
});
