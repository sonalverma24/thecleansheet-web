import { describe, expect, it } from "vitest";
import {
  applyCapture, captureFindings, classifyCapture, EVIDENCE_COPY, nextEvidenceStatus, provisionalCopy, verifyModelRead,
  type CaptureOutcome, type EvidenceStatus,
} from "@/lib/capture-evidence";
import { decideReanchor, type SourceSnapshot, type StoredIdentity } from "@/lib/inci-reanchor";
import { classifySlashCell } from "@/lib/inci-cells";
import { verifyClaimDisputes, verifyInciList } from "@/lib/review-verifier";
import { reviewedForTest } from "@/lib/ontology.fixtures";
import { deriveVerdict } from "@/lib/product-review-engine";
import { makeReview } from "@/lib/review.fixtures";
import * as G from "@/lib/review-verifier.fixtures";

/* Scenarios ported from the design v2 reference (cases 1 to 12 of its pipeline harness) and
   from the places where that reference did not do what its document says. They are
   constructed regression fixtures, not expert-labelled ground truth, and say nothing about
   catalogue-wide precision or recall. The Cetaphil lists are partial and constructed. */

const CETAPHIL_NEW = ["Aqua", "Glycerin", "Panthenol", "Niacinamide", "Sodium Cocoyl Isethionate", "Sodium Benzoate", "Citric Acid"];
const CETAPHIL_CLASSIC = ["Water", "Cetyl Alcohol", "Propylene Glycol", "Sodium Lauryl Sulfate", "Stearyl Alcohol", "Methylparaben", "Propylparaben", "Butylparaben"];

const record = (inci: string[], over: Partial<StoredIdentity> = {}): StoredIdentity =>
  ({ brand: "Cetaphil", productName: "Cetaphil Gentle Skin Cleanser", inci, ...over });

function source(ingredients: string[], over: Partial<SourceSnapshot> = {}): SourceSnapshot {
  return {
    kind: "incidecoder", url: "https://incidecoder.com/products/x", titles: ["Cetaphil Gentle Skin Cleanser"],
    brandNames: ["Cetaphil"], brandRule: "equal", ingredients, quote: ingredients.join(", "), quoteComplete: true, ...over,
  };
}

describe("an exact capture", () => {
  it("anchors an unverified record", () => {
    const r = applyCapture("unverified", record(CETAPHIL_NEW), source(CETAPHIL_NEW));
    expect([r.outcome, r.status, r.queue, r.findings]).toEqual(["matches", "anchored", false, []]);
  });

  it("matches across Water/Aqua, spelling of the list and case", () => {
    const r = applyCapture("unverified", record(["Water", "Glycerin", "Niacinamide"]), source(["AQUA", "glycerin", "Niacinamide"]));
    expect(r.outcome).toBe("matches");
  });

  it("never clears a recorded conflict by itself", () => {
    expect(applyCapture("conflicting", record(CETAPHIL_NEW), source(CETAPHIL_NEW)).status).toBe("conflicting");
  });
});

describe("the Cetaphil two-formula case", () => {
  const stored = record(CETAPHIL_NEW);

  it("a capture of the classic formula against the reformulated record is a conflict, not a verdict", () => {
    const r = applyCapture("anchored", stored, source(CETAPHIL_CLASSIC));
    expect(r.outcome).toBe("formula_conflict");
    expect(r.status).toBe("conflicting");       // never "unverified": the original anchor was real
    expect(r.queue).toBe(true);
    expect(r.findings).toHaveLength(1);
    expect(r.findings[0].code).toBe("SOURCE_CONFLICT");
    expect(r.findings[0].message).toMatch(/not which source is right/);
    expect(r.findings[0].message).toMatch(/Sodium Lauryl Sulfate/);   // the diff is attached
  });

  it("its wording is the approved conflict text, not 'source not yet verified'", () => {
    expect(EVIDENCE_COPY.conflicting).toBe("Conflicting ingredient sources - assessment pending");
    expect(EVIDENCE_COPY.conflicting).not.toMatch(/not yet verified/);
  });

  it("a conflicting capture does not itself raise sulphate or paraben flags", () => {
    const f = applyCapture("anchored", stored, source(CETAPHIL_CLASSIC)).findings;
    expect(f.map((x) => x.code)).toEqual(["SOURCE_CONFLICT"]);
    expect(f.some((x) => x.code === "CLAIM_DISPUTE")).toBe(false);
  });

  it("a capture titled as a different product is queued and changes nothing", () => {
    const r = applyCapture("anchored", stored, source(CETAPHIL_CLASSIC, { titles: ["Cetaphil Facial Cleanser"] }));
    expect([r.outcome, r.status, r.queue]).toEqual(["identity_failed", "anchored", true]);
    expect(r.findings[0].code).toBe("ANCHOR_IDENTITY_MISMATCH");
  });

  it("a capture of a different variant is queued and changes nothing", () => {
    const r = applyCapture("anchored", record(CETAPHIL_NEW, { productName: "Cetaphil Gentle Skin Cleanser 250 ml" }), source(CETAPHIL_NEW));
    expect([r.outcome, r.status]).toEqual(["identity_failed", "anchored"]);
  });

  it("a capture from another brand is queued and changes nothing, even with an identical list", () => {
    const r = applyCapture("unverified", stored, source(CETAPHIL_NEW, { brandNames: ["Some Other Brand"] }));
    expect([r.outcome, r.status]).toEqual(["identity_failed", "unverified"]);
  });
});

describe("a model-proposed list is a proposal (the reference anchored all of these at Jaccard 0.9)", () => {
  const nine = ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9"].map((n) => `Ingredient ${n}`);
  const srcNine = source(nine, { titles: ["Cetaphil Gentle Skin Cleanser"] });
  const proposal = (inci: string[]) => verifyModelRead(record(inci), srcNine);

  it("anchors only an exact ordered match", () => {
    expect(proposal(nine).status).toBe("anchored");
  });
  it("one invented ingredient is not anchored", () => {
    const r = proposal([...nine, "Ingredient invented"]);
    expect([r.status, r.outcome]).toEqual(["unverified", "formula_conflict"]);
    expect(r.findings[0].code).toBe("MODEL_READ_MISMATCH");
    expect(r.findings[0].message).toMatch(/Ingredient invented/);
  });
  it("one missing ingredient is not anchored", () => {
    expect(proposal(nine.slice(0, 8)).status).toBe("unverified");
  });
  it("a reversed order is not anchored", () => {
    const r = proposal([...nine].reverse());
    expect(r.status).toBe("unverified");
    expect(r.decision.diff.kind).toBe("reordered");
  });
  it("a duplicated entry is not anchored", () => {
    expect(proposal([...nine, nine[8]]).status).toBe("unverified");
  });
  it("a source whose title is a different product is not anchored", () => {
    const r = verifyModelRead(record(nine), source(nine, { titles: ["A Completely Different Product"] }));
    expect([r.status, r.outcome]).toEqual(["unverified", "identity_failed"]);
  });
  it("a model read is never 'conflicting': it is a proposal, not a captured source", () => {
    expect(["anchored", "unverified"]).toContain(proposal([...nine, "x"]).status);
  });
  it("no list on the cited source leaves the read unverified and queued", () => {
    const r = verifyModelRead(record(nine), source([], { quote: "" }));
    expect([r.status, r.outcome]).toEqual(["unverified", "unusable"]);
  });
  it("a quote that does not hold the list cannot anchor it", () => {
    const r = verifyModelRead(record(nine), source(nine, { quote: "marketing prose with no list" }));
    expect([r.status, r.outcome]).toEqual(["unverified", "unusable"]);
  });
});

describe("state transitions", () => {
  const states: EvidenceStatus[] = ["anchored", "unverified", "conflicting"];
  const outcomes: CaptureOutcome[] = ["matches", "formula_conflict", "identity_failed", "unusable"];
  it("covers every state x outcome pair", () => {
    const table = Object.fromEntries(states.map((s) => [s, Object.fromEntries(outcomes.map((o) => [o, nextEvidenceStatus(s, o)]))]));
    expect(table).toEqual({
      anchored: { matches: "anchored", formula_conflict: "conflicting", identity_failed: "anchored", unusable: "anchored" },
      unverified: { matches: "anchored", formula_conflict: "conflicting", identity_failed: "unverified", unusable: "unverified" },
      conflicting: { matches: "conflicting", formula_conflict: "conflicting", identity_failed: "conflicting", unusable: "conflicting" },
    });
  });
  it("only an exact match ever needs no person", () => {
    expect(outcomes.filter((o) => captureFindings(decideReanchor(record(CETAPHIL_NEW), source(CETAPHIL_NEW)), o, "source").length === 0)).toEqual(["matches"]);
  });
  it("classifies an uncomparable entry as unusable, not as a formula conflict", () => {
    const d = decideReanchor(record(["Aqua", "(((", "Glycerin"]), source(["Aqua", "Glycerin", "Niacinamide"]));
    expect(classifyCapture(d)).toBe("unusable");
  });
});

describe("Provisional wording", () => {
  it("is the owner's approved text and names the calculated standing", () => {
    expect(provisionalCopy("Good Standing")).toBe(
      "Provisional assessment. Based on the ingredient list currently recorded, the calculated standing is Good Standing. Ingredient source not yet verified.",
    );
  });
});

describe('" / " cells are decided by identity, not punctuation', () => {
  it("two known, different INCI names fused in one cell is a lead", () => {
    const c = classifySlashCell("Sodium Lauroyl Sarcosinate / Sodium Laureth Sulfate");
    expect(c?.kind).toBe("two_ingredients");
    const f = verifyInciList(["Water", "Glycerin", "Sodium Lauroyl Sarcosinate / Sodium Laureth Sulfate"], G.EV_REFDB).findings;
    expect(f.find((x) => x.code === "PARSING_AMBIGUITY")?.severity).toBe("review_required");
  });
  it("an INCI name written with its common name is a display convention at info level", () => {
    for (const cell of ["Zea Mays Starch / Corn Starch", "Aqua / Water", "Butyrospermum Parkii Butter / Shea Butter"]) {
      expect(classifySlashCell(cell)?.kind, cell).toBe("display_convention");
    }
    const f = verifyInciList(["Water", "Butyrospermum Parkii Butter / Shea Butter", "Glycerin"], G.EV_REFDB).findings;
    expect(f.find((x) => x.code === "PARSING_AMBIGUITY")?.severity).toBe("info");
  });
  it("two known names for ONE substance are a display convention, not two ingredients", () => {
    for (const cell of ["Propanediol / 1,3-Propanediol", "Glycerin / Glycerin (Vegetable)"]) {
      expect(classifySlashCell(cell)?.kind, cell).toBe("display_convention");
    }
  });
  it("an INCI name with its common name is one substance even when the common name is its own profile (the almond oil cell)", () => {
    const cell = "Prunus Amygdalus Dulcis Oil / Sweet Almond Oil";
    expect(classifySlashCell(cell)?.kind).toBe("display_convention");
    const f = verifyInciList(["Water", cell, "Glycerin"], G.EV_REFDB).findings.filter((x) => x.code === "PARSING_AMBIGUITY");
    expect(f.map((x) => x.severity)).toEqual(["info"]);
  });
  it("a half the database does not know makes it a display convention, however different", () => {
    expect(classifySlashCell("Sodium Laureth Sulfate / Totally Unknown Thing")?.kind).toBe("display_convention");
  });
  it("a slash inside one name, with no spaces, is never a cell split", () => {
    expect(classifySlashCell("Cetyl PEG/PPG-10/1 Dimethicone")).toBeNull();
    expect(classifySlashCell("Ammonium Acryloyldimethyltaurate/VP Copolymer")).toBeNull();
  });
  it("a comma inside an INCI name never reaches this rule", () => {
    expect(classifySlashCell("1,2-Hexanediol")).toBeNull();
  });
});

describe("dispute wording carries the hazard-versus-risk disclaimer", () => {
  const SLES = ["Aqua", "Sodium Laureth Sulfate", "Glycerin"];
  const dispute = (ticks: string[], inci = SLES) =>
    verifyClaimDisputes({ ticks, inci, analysisTexts: [], anchored: true, ontology: reviewedForTest });

  it("is appended to a definitive match, in code", () => {
    const f = dispute(["Sulfate free"]);
    expect(f[0].strength).toBe("definitive_match");
    expect(f[0].message).toMatch(/hazard-classification matter, not an exposure-risk conclusion/);
    expect(f[0].message).toMatch(/not a confirmed product defect/);
  });
  it("is appended to a qualified relation too", () => {
    const f = verifyClaimDisputes({ ticks: ["Alcohol free"], inci: ["Aqua", "Benzyl Alcohol"], analysisTexts: [], anchored: true });
    expect(f[0].message).toMatch(/hazard-classification matter/);
  });
  it("is absent when the ontology has no hit (a prose-only lead)", () => {
    const f = verifyClaimDisputes({ ticks: ["Alcohol free"], inci: ["Aqua"], analysisTexts: ["The 'Alcohol-free' claim is contradicted by the INCI."], anchored: true });
    expect(f[0].message).not.toMatch(/hazard-classification/);
  });
  it("the US spelling ticks and checks exactly like the British one", () => {
    expect(dispute(["Sulfate free"])[0].strength).toBe(dispute(["Sulphate free"])[0].strength);
  });
});

describe("a duplicate lead does not withhold the standing today", () => {
  it("Good Standing is unchanged by a DUPLICATE_ENTRY lead (the reference withheld it on any lead)", () => {
    const review = makeReview({ inciIngredients: ["Aqua", "Glycerin", "Niacinamide", "Glycerin", "Phenoxyethanol"] });
    expect(verifyInciList(review.inciIngredients!, G.EV_REFDB).findings.map((f) => f.code)).toContain("DUPLICATE_ENTRY");
    expect(deriveVerdict(review).tierLabel).toBe("Good Standing");
  });
});
