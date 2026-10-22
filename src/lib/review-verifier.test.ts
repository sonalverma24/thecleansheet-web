import { describe, expect, it } from "vitest";
import {
  CaptureTrust, captureTrustForUrl, evidenceForReview, isAnchored, makeInciEvidence, reviewAnalysisTexts,
  verifyClaimDisputes, verifyInciList, verifyReview, type Finding,
} from "@/lib/review-verifier";
import { DEFAULT_ONTOLOGY, effectiveStrength } from "@/lib/claim-ontology";
import { reviewedForTest } from "@/lib/ontology.fixtures";
import { deriveVerdict, reconcileReviewScores } from "@/lib/product-review-engine";
import type { ProductReview } from "@/lib/product-review-types";
import { makeReview } from "@/lib/review.fixtures";
import * as G from "@/lib/review-verifier.fixtures";

const codes = (f: Finding[]) => new Set(f.map((x) => x.code));

/* The golden cases below are regression fixtures built from real audited pages, with
   reviewed, constructed expectations. They validate this code against those fixtures
   only: not scientific correctness, not catalogue-wide precision or recall. */

describe("golden: ingredient list rules (audited pages)", () => {
  it("Patanjali stored list: a label-echo duplicate is flagged; Sugandhit Dravya is not a catch-all", () => {
    const { findings } = verifyInciList(G.PATANJALI_STORED, G.EV_REFDB, G.PATANJALI_OFFICIAL_BASE);
    expect(codes(findings)).toContain("DUPLICATE_ENTRY");
    expect(codes(findings)).not.toContain("CATCH_ALL");
    expect(codes(findings)).not.toContain("QUANTITY_UNSPECIFIED");
    expect(findings.find((f) => f.code === "DUPLICATE_ENTRY")?.message).toMatch(/echoes the source label/);
  });

  it("Sugandhit Dravya and Parfum take the same path: neither is a lead, neither costs anything", () => {
    const base = ["Aqua", "Glycerin", "Niacinamide", "Phenoxyethanol"];
    const parfum = verifyInciList([...base, "Parfum"], G.EV_REFDB).findings;
    const hindi = verifyInciList([...base, "Sugandhit Dravya"], G.EV_REFDB).findings;
    expect(parfum).toEqual([]);
    expect(codes(hindi)).not.toContain("CATCH_ALL");
    // The only difference is an info-level wording note, like "Vit E" suggesting Tocopherol.
    expect(hindi.map((f) => [f.code, f.severity])).toEqual([["NORMALISATION_SUGGESTION", "info"]]);
  });

  it("a real catch-all under the rubric is still flagged", () => {
    const { findings } = verifyInciList(["Aqua", "Glycerin", "Soap Base", "Phenoxyethanol"], G.EV_REFDB);
    expect(findings.find((f) => f.code === "CATCH_ALL")?.message).toMatch(/Soap Base/);
  });

  it("provenance gap needs MORE than 60% all-caps entries, and entries of 3 letters or fewer do not count", () => {
    const caps = (n: number, total: number) => [...Array.from({ length: n }, (_, i) => `INGREDIENT ${i}`), ...Array.from({ length: total - n }, (_, i) => `Ingredient ${i}`)];
    expect(codes(verifyInciList(caps(3, 5), G.EV_RETAILER).findings)).not.toContain("PROVENANCE_GAP"); // exactly 0.6
    expect(codes(verifyInciList(caps(4, 5), G.EV_RETAILER).findings)).toContain("PROVENANCE_GAP"); // 0.8
    const short = ["BHT", "PEG", "EDT", "Water", "Glycerin"]; // three 3-letter caps: not counted
    expect(codes(verifyInciList([...short, "ALOE VERA", "SHEA BUTTER"], G.EV_RETAILER).findings)).not.toContain("PROVENANCE_GAP");
  });

  it("a duplicate is not called a label echo when the label names it once", () => {
    const { findings } = verifyInciList(G.PATANJALI_STORED, G.EV_REFDB, ["Aqua", "Glycerin", "Carbomer"]);
    expect(findings.find((f) => f.code === "DUPLICATE_ENTRY")?.message).not.toMatch(/echoes/);
  });

  it("official panel: the q.s. line surfaces as a quantity note that the stored list lost", () => {
    const { findings } = verifyInciList(G.PATANJALI_OFFICIAL_BASE, G.EV_OFFICIAL);
    const q = findings.find((f) => f.code === "QUANTITY_UNSPECIFIED");
    expect(q?.severity).toBe("info");
    expect(q?.message).toMatch(/NOT an undisclosed-base finding/);
  });

  it("Pond's Hydra: the duplicate Dimethicone is reported once", () => {
    const { findings } = verifyInciList(G.PONDS_HYDRA, G.EV_REFDB);
    expect(findings.filter((f) => f.code === "DUPLICATE_ENTRY")).toHaveLength(1);
  });

  it("Pond's Super Light: a provenance gap and unanchored evidence, with no chemistry defect claimed", () => {
    const { findings } = verifyInciList(G.PONDS_SUPERLIGHT, G.EV_RETAILER);
    expect(codes(findings)).toContain("PROVENANCE_GAP");
    expect(codes(findings)).toContain("UNANCHORED_EVIDENCE");
    expect(codes(findings)).not.toContain("CATCH_ALL");
    expect(findings.find((f) => f.code === "PROVENANCE_GAP")?.message).toMatch(/not a chemistry defect/);
  });

  it("all-caps from a brand page is not a provenance gap", () => {
    const { findings } = verifyInciList(G.PONDS_SUPERLIGHT, { ...G.EV_OFFICIAL, quote: "quoted" });
    expect(codes(findings)).not.toContain("PROVENANCE_GAP");
  });

  it("a quoted source list raises no unanchored finding", () => {
    expect(codes(verifyInciList(G.PONDS_HYDRA, G.EV_REFDB).findings)).not.toContain("UNANCHORED_EVIDENCE");
  });

  it("a legacy list is noted at info level, not queued for review", () => {
    const legacy = { ...G.EV_RETAILER, captureTrust: CaptureTrust.REFERENCE_DB, legacy: true };
    const f = verifyInciList(G.PONDS_HYDRA, legacy).findings.find((x) => x.code === "UNANCHORED_EVIDENCE");
    expect(f?.severity).toBe("info");
  });

  it("legitimate water synonyms never flag", () => {
    const { findings } = verifyInciList(["Aqua (Water)", "Glycerin", "Niacinamide", "Phenoxyethanol"], G.EV_REFDB);
    expect(findings).toEqual([]);
  });

  it("Water and Aqua in one list are the same ingredient", () => {
    const { findings } = verifyInciList(["Water", "Glycerin", "Aqua (Water)"], G.EV_REFDB);
    expect(codes(findings)).toContain("DUPLICATE_ENTRY");
  });
});

/* ── Claim disputes ───────────────────────────────────────────────────────────── */

const SLES_LIST = ["Aqua", "Sodium Laureth Sulfate", "Cocamidopropyl Betaine", "Glycerin"];
const dispute = (over: Partial<Parameters<typeof verifyClaimDisputes>[0]>) =>
  verifyClaimDisputes({ ticks: [], inci: SLES_LIST, analysisTexts: [], anchored: false, ...over });

describe("golden: claim disputes (audited wording)", () => {
  it("the page ticks Alcohol free while its own text disputes it (real Super Light wording): a lead, never a hold", () => {
    const f = dispute({
      ticks: ["Alcohol free", "Paraben free"],
      analysisTexts: ["However, 'Alcohol-free' and 'Oil-free' claims are contradicted by INCI, which may be a concern for truthful advertising."],
    });
    expect(f.map((x) => [x.code, x.strength, x.severity, x.subject])).toEqual([["CLAIM_DISPUTE", "lead", "review_required", "alcohol free"]]);
    expect(f[0].message).toMatch(/not a confirmed product defect/);
  });

  it("no finding on a supported tick when a different claim is disputed (real MAYAMIC wording)", () => {
    const f = dispute({
      ticks: ["Alcohol free", "Paraben free"],
      analysisTexts: [
        "The composition lists 'SLES' (Sodium Laureth Sulfate), which is a sulfate. This directly contradicts the " +
          "'Sulphate Free' claim. No parabens are listed, so 'Paraben Free' is supported.",
      ],
    });
    expect(f).toEqual([]);
  });

  it("a negation bound to its own claim is honoured", () => {
    expect(dispute({ ticks: ["Paraben free"], analysisTexts: ["'Paraben Free' is supported by the absence of contradictory evidence."] })).toEqual([]);
  });

  it("in one sentence, the negation clears only the claim it governs", () => {
    const f = dispute({
      ticks: ["Alcohol free", "Paraben free"],
      analysisTexts: ["'Alcohol-free' claims are contradicted by INCI, while 'Paraben Free' is supported by the absence of contradictory evidence."],
    });
    expect(f.map((x) => x.subject)).toEqual(["alcohol free"]);
  });

  it("a negation elsewhere in the text never clears a dispute", () => {
    const f = dispute({
      ticks: ["Alcohol free"],
      analysisTexts: ["There is an absence of contradictory evidence for most claims, but 'Alcohol-free' is contradicted by the INCI."],
    });
    expect(f).toHaveLength(1);
  });

  it("a possessive apostrophe does not break quote pairing", () => {
    expect(dispute({ ticks: ["Alcohol free"], analysisTexts: ["The brand's 'Alcohol-free' claim is contradicted by the INCI."] })).toHaveLength(1);
  });

  it("an unusual quote shape yields a lead rather than silence (the former 7th mutation)", () => {
    // Glued quotes: the old opening-quote guard suppressed this. Failing toward visible is the rule.
    expect(dispute({ ticks: ["Alcohol free"], analysisTexts: ["The claim'alcohol-free' is contradicted by the INCI."] })).toHaveLength(1);
  });

  it("a dispute never leaks into the next sentence", () => {
    const f = dispute({ ticks: ["Paraben free"], analysisTexts: ["'Alcohol-free' claims are contradicted. 'Paraben Free' stays fine."] });
    expect(f).toEqual([]);
  });

  it("British and American spellings match", () => {
    expect(dispute({ ticks: ["Sulfate free"], analysisTexts: ["This contradicts the 'Sulphate Free' claim."] })).toHaveLength(1);
  });

  it("returns nothing when nothing disputes the tick", () => {
    expect(dispute({ ticks: ["Alcohol free"], analysisTexts: ["A well-made product with honest claims."] })).toEqual([]);
  });
});

describe("claim disputes: structural signal first, wording never clears it", () => {
  it('"Technically it is sulfate free" beside a listed sulfate surfactant is still a definitive match', () => {
    const f = dispute({ ticks: ["Sulfate free"], analysisTexts: ["Technically it is sulfate free."], anchored: true, ontology: reviewedForTest });
    expect(f.map((x) => [x.strength, x.severity])).toEqual([["definitive_match", "hold"]]);
    expect(f[0].message).toMatch(/Sodium Laureth Sulfate/);
    expect(f[0].message).toMatch(/not a confirmed product defect/);
  });

  it("the same list is only a lead when it is not anchored: capture is not yet established", () => {
    const f = dispute({ ticks: ["Sulfate free"], anchored: false, ontology: reviewedForTest });
    expect(f.map((x) => [x.strength, x.severity])).toEqual([["lead", "review_required"]]);
  });

  it("with the shipped, unreviewed ontology no alias is definitive, so nothing can be a hold", () => {
    const entries = DEFAULT_ONTOLOGY.classes.flatMap((c) => c.entries);
    expect(entries.some((e) => effectiveStrength(e) === "definitive")).toBe(false);
    // Until a qualified reviewer signs the aliases, every relation is a qualified one:
    // noted at info level, never queued on its own and never a hold.
    const f = dispute({ ticks: ["Sulfate free"], anchored: true });
    expect(f.map((x) => [x.strength, x.severity])).toEqual([["lead", "info"]]);
  });

  it("a qualified relation alone is noted at info level, not queued", () => {
    const f = dispute({ ticks: ["Alcohol free"], inci: ["Aqua", "Benzyl Alcohol", "Glycerin"] });
    expect(f.map((x) => [x.strength, x.severity])).toEqual([["lead", "info"]]);
  });

  it("a qualified relation plus the analysis text disputing it is queued", () => {
    const f = dispute({
      ticks: ["Alcohol free"], inci: ["Aqua", "Benzyl Alcohol", "Glycerin"],
      analysisTexts: ["INCIDecoder's 'alcohol-free' label is technically contradicted by the presence of Benzyl Alcohol."],
    });
    expect(f.map((x) => [x.strength, x.severity])).toEqual([["lead", "review_required"]]);
  });

  it("fatty alcohols and look-alike names are not members of the alcohol class", () => {
    const fatty = ["Aqua", "Cetyl Alcohol", "Cetearyl Alcohol", "Phenoxyethanol"];
    expect(dispute({ ticks: ["Alcohol free"], inci: fatty, ontology: reviewedForTest, anchored: true })).toEqual([]);
  });

  it("a bare 'Alcohol' entry is a member, matched as the whole item", () => {
    const f = dispute({ ticks: ["Alcohol free"], inci: ["Aqua", "Cetyl Alcohol", "Alcohol"], ontology: reviewedForTest, anchored: true });
    expect(f.map((x) => x.strength)).toEqual(["definitive_match"]);
    expect(f[0].message).not.toMatch(/Cetyl/);
  });

  it("magnesium sulfate is not a sulphate surfactant", () => {
    expect(dispute({ ticks: ["Sulfate free"], inci: ["Aqua", "Magnesium Sulfate"], ontology: reviewedForTest })).toEqual([]);
  });

  it("verifyReview applies the anchoring rule: a legacy list is never a definitive match", () => {
    const base = { inciIngredients: ["Aqua", "Sodium Laureth Sulfate", "Glycerin"] };
    const legacy = makeReview({ ...base, inciSourceUrl: "https://incidecoder.com/products/x" });
    const anchored = makeReview({ ...base, inciEvidence: makeInciEvidence("https://incidecoder.com/products/x", "Aqua, Sodium Laureth Sulfate", "2026-10-21T00:00:00.000Z") });
    const pick = (r: ProductReview) => verifyReview(r, ["Sulfate free"], reviewedForTest).filter((f) => f.code === "CLAIM_DISPUTE").map((f) => f.strength);
    expect(pick(legacy)).toEqual(["lead"]);
    expect(pick(anchored)).toEqual(["definitive_match"]);
  });

  it("untracked ticks are ignored by the structural check", () => {
    expect(dispute({ ticks: ["Vegan"], inci: ["Aqua", "Beeswax"] })).toEqual([]);
  });
});

describe("capture trust", () => {
  it("ranks a source by how reliably its text is captured, not by truth", () => {
    expect(captureTrustForUrl("https://incidecoder.com/products/x")).toBe(CaptureTrust.REFERENCE_DB);
    expect(captureTrustForUrl("https://www.nykaa.com/p/1")).toBe(CaptureTrust.RETAILER);
    expect(captureTrustForUrl("https://www.amazon.in/dp/B0")).toBe(CaptureTrust.RETAILER);
    expect(captureTrustForUrl("https://patanjaliayurved.net/product/1")).toBe(CaptureTrust.OFFICIAL_PAGE);
    expect(captureTrustForUrl("")).toBe(CaptureTrust.AI_TRANSCRIPTION);
    expect(captureTrustForUrl(undefined)).toBe(CaptureTrust.AI_TRANSCRIPTION);
    expect(captureTrustForUrl("not a url")).toBe(CaptureTrust.AI_TRANSCRIPTION);
  });

  it("only a quoted source above capture-trust 1 is anchored", () => {
    const at = "2026-10-21T00:00:00.000Z";
    const quoted = makeInciEvidence("https://incidecoder.com/products/x", "Aqua, Glycerin", at, "Some Product");
    expect(quoted.matchedTitle).toBe("Some Product");
    expect(isAnchored({ ...quoted, value: "" })).toBe(true);
    expect(isAnchored({ ...makeInciEvidence("https://brand.example/p", "", at), value: "" })).toBe(false);
    expect(isAnchored({ ...makeInciEvidence(undefined, "Aqua", at), value: "" })).toBe(false);
  });

  it("rebuilds a legacy review's evidence from its source URL and marks it legacy", () => {
    const e = evidenceForReview({ inciIngredients: ["Aqua", "Glycerin", "Niacinamide"], inciSourceUrl: "https://incidecoder.com/products/x" });
    expect([e.captureTrust, e.legacy, isAnchored(e)]).toEqual([CaptureTrust.REFERENCE_DB, true, false]);
  });

  it("uses the stored envelope when the review has one", () => {
    const e = evidenceForReview({
      inciIngredients: ["Aqua", "Glycerin", "Niacinamide"],
      inciEvidence: makeInciEvidence("https://incidecoder.com/products/x", "Aqua, Glycerin", "2026-10-21T00:00:00.000Z"),
    });
    expect([e.captureTrust, e.legacy, isAnchored(e)]).toEqual([CaptureTrust.REFERENCE_DB, undefined, true]);
  });
});

/* ── A review fixture for the review-level checks and the verdict ─────────────── */

describe("verifyReview", () => {
  it("is quiet for a clean, anchored review", () => {
    const review = makeReview({
      inciEvidence: makeInciEvidence("https://incidecoder.com/products/x", "Aqua, Glycerin", "2026-10-21T00:00:00.000Z"),
    });
    expect(verifyReview(review, ["Alcohol free"])).toEqual([]);
  });

  it("reads a dispute out of the review's own analysis prose, as a lead", () => {
    const review = makeReview({
      verdict: { bestThing: "", cleanSheetTakeaway: "", biggestConcern: "'Alcohol-free' and 'Oil-free' claims are contradicted by INCI." },
    } as Partial<ProductReview>);
    expect(reviewAnalysisTexts(review).join(" ")).toMatch(/contradicted by INCI/);
    const f = verifyReview(review, ["Alcohol free"]).filter((x) => x.code === "CLAIM_DISPUTE");
    expect(f.map((x) => [x.strength, x.severity])).toEqual([["lead", "review_required"]]);
  });

  it("skips the dispute check when no ticks are supplied", () => {
    const review = makeReview({
      verdict: { bestThing: "", cleanSheetTakeaway: "", biggestConcern: "'Alcohol-free' claims are contradicted by INCI." },
    } as Partial<ProductReview>);
    expect(codes(verifyReview(review))).not.toContain("CLAIM_DISPUTE");
  });

  it("notes a legacy review as info, never as a queue item", () => {
    const f = verifyReview(makeReview({ inciSourceUrl: "https://incidecoder.com/products/x" }));
    expect(f.map((x) => [x.code, x.severity])).toEqual([["UNANCHORED_EVIDENCE", "info"]]);
  });

  it("finds nothing to verify when there is no ingredient list", () => {
    expect(verifyReview(makeReview({ inciIngredients: [], ingredientReads: [] }))).toEqual([]);
  });
});

/* ── CURRENT verdict behaviour, as the local code stands today ────────────────────
   These pin down what deriveVerdict does NOW so that a policy change is a deliberate,
   visible edit to a test, not a silent drift. They are not endorsements: two describe
   the gaps the plan proposes closing. The full parity matrix is verdict-parity.test.ts.
   Any edit that changes one of these is an earning-rule change and needs a RUBRIC_REV
   bump, then deploy, then scripts/backfill-reviews.mts. */
describe("CURRENT verdict behaviour (local code, not verified as deployed)", () => {
  it("a review with a retrieved INCI and a 65+ total shows Good Standing", () => {
    const v = deriveVerdict(makeReview());
    expect([v.tier, v.tierLabel]).toEqual(["mostly-clean", "Good Standing"]);
  });

  it("a review with NO ingredient list still shows Good Standing; only the safety gate fails", () => {
    const v = deriveVerdict(makeReview({ inciIngredients: [], ingredientReads: [] }));
    expect([v.tier, v.tierLabel]).toEqual(["mostly-clean", "Good Standing"]);
    expect(v.gates.find((g) => g.id === "safety")?.passed).toBe(false);
  });

  it("a catch-all entry neither caps a section nor gates the badge in the current rubric (r7)", () => {
    // The r8 rubric (not part of this change) caps Ingredient Transparency at 7 for a base.
    // Shipping r8 is when this expectation changes, together with a RUBRIC_REV bump and backfill.
    const review = makeReview({ inciIngredients: ["Aqua", "Glycerin", "Soap Base", "Phenoxyethanol"] });
    expect(reconcileReviewScores(review).scores.ingredientTransparency).toBe(16);
    expect(deriveVerdict(review).tierLabel).toBe("Good Standing");
  });

  it("Sugandhit Dravya is a fragrance declaration like Parfum: uncapped, ungated, no lead", () => {
    const review = makeReview({ inciIngredients: G.PATANJALI_STORED });
    expect(reconcileReviewScores(review).scores.ingredientTransparency).toBe(16);
    expect(deriveVerdict(review).tierLabel).toBe("Good Standing");
    expect(verifyReview(review).some((f) => f.code === "CATCH_ALL")).toBe(false);
  });

  /* The two policies the owner has pointed toward. Each needs its own flag and a signed
     preview before it is built into the verdict (plan Phase 4 and 5). */
  it.todo("POLICY catch-all gate: a catch-all caps the total at 64 (flag ANALYSER_POLICY_CATCHALL_GATE)");
  it.todo("POLICY anchor required: Good Standing needs an anchored INCI, else Provisional (flag ANALYSER_POLICY_ANCHOR_REQUIRED)");
});
