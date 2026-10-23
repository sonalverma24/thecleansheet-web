import { describe, expect, it } from "vitest";
import { ambitionOf, endpointMatchesClaim, evidenceLevelFor, isIndependentLab, levelFromRecord, residualRisk } from "./ladder";
import { FactStore } from "./factstore";
import { listLooksSane, spanHolds, squash, verifyProposal } from "./verifier";
import { MAX_REASON, PILLS, TEMPLATE_IDS, lint, render, sourceName } from "./copy";
import { RULES, RULE_IDS } from "./rules";
import type { Observation, Proposal } from "./types";

const obs = (over: Partial<Observation> = {}): Observation => ({ id: "o1", tool: "fetch_page", fetchedAt: "2026-10-23T00:00:00Z", ok: true, text: "Our serum has 10% niacinamide for visibly clearer skin in four weeks.", trust: 4, flags: [], ...over });

describe("evidence ladder", () => {
  const rec = (o: object) => ({ docType: "test_report", productMatches: true, ...o });
  it.each([
    [{ productMatches: false, registryId: "10.1000/x" }, 2],
    [{ registryId: "10.1000/abc123" }, 4], // traceable, but nothing is known of its design or result
    [{ registryId: "NCT01234567" }, 4],
    [{ sampleSize: 40, durationDays: 28, method: "instrumental" }, 6],
    [{ lab: "Intertek India" }, 5],
    [{ lab: "Acme Labs" }, 4],
    [{}, 4],
    [{ docType: "marketing_graphic" }, 2],
  ])("level for %j is %i", (o, level) => expect(levelFromRecord(rec(o))).toBe(level));

  describe("Level 7 needs a result that supports the claim, not only an identifier", () => {
    const design = { sampleSize: 40, durationDays: 28, method: "randomised, vehicle-controlled", registryId: "NCT01234567" };
    const claim = "Visibly reduces blemishes in 4 weeks";
    const good = { ...design, endpoint: "blemish count", direction: "improved", significant: true };
    it("a registered, designed study whose significant improvement measured what the claim promises is Level 7", () => {
      expect(levelFromRecord(rec(good), claim)).toBe(7);
    });
    it.each([
      ["the result is not shown", design],
      ["no significant change", { ...good, direction: "no_change" }],
      ["the result is worse", { ...good, direction: "worse" }],
      ["the improvement is not significant", { ...good, significant: false }],
      ["significance is not stated", { ...good, significant: undefined }],
      ["it measured something else", { ...good, endpoint: "skin hydration" }],
      ["it has no identifier", { ...good, registryId: undefined }],
    ])("stays at Level 6 when %s", (_why, o) => expect(levelFromRecord(rec(o), claim)).toBe(6));
    it("a registered study with no design is Level 4 whatever it says", () => {
      expect(levelFromRecord(rec({ registryId: "NCT01234567", endpoint: "blemish count", direction: "improved", significant: true }), claim)).toBe(4);
    });
    it("matches an endpoint to a claim by distinctive word stems", () => {
      expect(endpointMatchesClaim("Reduces dark spots", "dark spot area")).toBe(true);
      expect(endpointMatchesClaim("Reduces dark spots", "skin hydration")).toBe(false);
      expect(endpointMatchesClaim("Reduces dark spots", undefined)).toBe(false);
    });
  });

  it("a sample size without a duration or method is not Level 6", () => {
    expect(levelFromRecord(rec({ sampleSize: 40, lab: "Acme Labs" }))).toBe(4);
  });

  it("recognises independent labs as whole words only", () => {
    expect(isIndependentLab("SGS India Pvt Ltd")).toBe(true);
    expect(isIndependentLab("TUV Rheinland")).toBe(true);
    expect(isIndependentLab("Mysgstuff Labs")).toBe(false);
    expect(isIndependentLab(undefined)).toBe(false);
  });

  it("a claim's level is the best record, else a disclosed percentage (3), else a named active (2), else 1", () => {
    expect(evidenceLevelFor({ text: "10% Niacinamide", namesActive: true }, [])).toBe(3);
    expect(evidenceLevelFor({ text: "Contains niacinamide", namesActive: true }, [])).toBe(2);
    expect(evidenceLevelFor({ text: "Feels light", namesActive: false }, [])).toBe(1);
    expect(evidenceLevelFor({ text: "Reduces blemishes", namesActive: true }, [rec({ lab: "Intertek" })])).toBe(5);
    expect(evidenceLevelFor({ text: "Reduces blemishes", namesActive: true }, [rec({ productMatches: false })])).toBe(2);
  });

  it("classifies ambition: a testing statement is not a proven outcome", () => {
    expect(ambitionOf("Clinically tested on 40 people", "clinical")).toBe("routine");
    expect(ambitionOf("Dermatologist tested", "safety")).toBe("routine");
    expect(ambitionOf("Clinically proven 30% reduction in wrinkles", "clinical")).toBe("clinical");
    expect(ambitionOf("Fades dark spots", "concern")).toBe("performance");
    expect(ambitionOf("Hydrates skin", "functional")).toBe("cosmetic");
  });

  it("residual risk is ambition minus evidence, and a matched bold claim is low", () => {
    expect(residualRisk("clinical", 6)).toBe("low");
    expect(residualRisk("clinical", 4)).toBe("medium");
    expect(residualRisk("clinical", 3)).toBe("high");
    expect(residualRisk("clinical", 2)).toBe("very-high");
    expect(residualRisk("performance", 4)).toBe("low");
    expect(residualRisk("performance", 3)).toBe("medium");
    expect(residualRisk("performance", 2)).toBe("high");
    expect(residualRisk("cosmetic", 3)).toBe("low");
  });
});

describe("the verifier", () => {
  it("matches quotes regardless of case, spacing, quote style and punctuation, but not short or false ones", () => {
    const o = obs({ text: "Dermatologist-tested — “clinically proven”  to be gentle!" });
    expect(spanHolds("dermatologist tested clinically proven to be gentle", o)).toBe(true);
    expect(spanHolds("clinically proven", o)).toBe(true);
    expect(spanHolds("cures acne", o)).toBe(false);
    expect(spanHolds("tested", o)).toBe(false); // under 12 characters
    expect(spanHolds("clinically proven", obs({ ok: false, text: o.text }))).toBe(false);
    expect(spanHolds("clinically proven", undefined)).toBe(false);
    expect(squash("A  B—c")).toBe("a b c");
  });

  const claim = (over: Partial<Proposal> = {}): Proposal => ({
    id: "p1", kind: "claim", producer: "r", spans: [{ observationId: "o1", quote: "visibly clearer skin in four weeks" }],
    payload: { text: "Visibly clearer skin in four weeks", platforms: ["brand"], primaryType: "time-bound" }, ...over,
  });
  const O = new Map([["o1", obs()]]);

  it("rejects a payload that does not match its schema", () => {
    const r = verifyProposal(claim({ payload: { text: "", platforms: "x", primaryType: 4 } }), O, { subject: "s" });
    expect(r.status).toBe("rejected");
    expect(r.reasons.length).toBeGreaterThanOrEqual(3);
  });

  it("marks a proposal with no quote, or a false quote, unsupported", () => {
    expect(verifyProposal(claim({ spans: [] }), O, { subject: "s" }).status).toBe("unsupported");
    expect(verifyProposal(claim({ spans: [{ observationId: "o1", quote: "clinically proven to cure everything" }] }), O, { subject: "s" }).status).toBe("unsupported");
    expect(verifyProposal(claim({ spans: [{ observationId: "missing", quote: "visibly clearer skin in four weeks" }] }), O, { subject: "s" }).status).toBe("unsupported");
  });

  it("admits a quoted claim as a source fact and ignores any evidence level the proposal asserts", () => {
    const r = verifyProposal(claim({ payload: { text: "Visibly clearer skin in four weeks", platforms: ["brand"], primaryType: "time-bound", evidenceLevel: 7, corroborated: false } }), O, { subject: "s" });
    expect(r.status).toBe("admitted");
    expect(r.fact).toMatchObject({ predicate: "claim", origin: "source", trust: 4, value: { corroborated: true, evidenceLevel: 1, levelOrigin: "ladder" } });
  });

  it("takes the lowest trust of the observations a fact cites, and caps trust at 1 for flagged text", () => {
    const two = new Map([["o1", obs({ trust: 4 })], ["o2", obs({ id: "o2", trust: 2 })]]);
    const p = claim({ spans: [{ observationId: "o1", quote: "visibly clearer skin" }, { observationId: "o2", quote: "niacinamide for visibly" }] });
    expect(verifyProposal(p, two, { subject: "s" }).fact?.trust).toBe(2);
    const flagged = new Map([["o1", obs({ flags: ["injection-suspected"] })]]);
    expect(verifyProposal(claim(), flagged, { subject: "s" }).fact?.trust).toBe(1);
  });

  it("admits an unsourced ingredient list only as the model's own reading, at trust 1", () => {
    const p: Proposal = { id: "p", kind: "inci.list", producer: "r", spans: [], payload: { ingredients: ["Aqua", "Glycerin", "Niacinamide"], source: "model" } };
    const r = verifyProposal(p, O, { subject: "s" });
    expect(r.status).toBe("admitted");
    expect(r.fact).toMatchObject({ trust: 1, origin: "model" });
    // The same list claiming a real source, with no quote, is not admitted.
    expect(verifyProposal({ ...p, payload: { ...p.payload, source: "incidecoder" } }, O, { subject: "s" }).status).toBe("unsupported");
  });

  it("checks that a list is sane", () => {
    expect(listLooksSane(["Aqua", "Glycerin", "Niacinamide"])).toBe(true);
    expect(listLooksSane(["Aqua", "Glycerin"])).toBe(false);
    expect(listLooksSane(["Aqua", "Glycerin", "Niacinamide", "Free from parabens and sulphates and everything else you could wish for"])).toBe(true);
    expect(listLooksSane(["Aqua", "36", "100", "Made with love by people who care deeply about skin and the planet today"])).toBe(false);
  });
});

describe("the fact store", () => {
  const list = (ingredients: string[], trust: 1 | 2 | 3 | 4 | 5, origin: "source" | "model" = "source") =>
    ({ predicate: "inci.list" as const, subject: "p", value: { ingredients, source: "brand_page", sane: true }, trust, origin, spans: [], derivedFrom: [] });

  it("adding the same fact twice returns the first", () => {
    const s = new FactStore();
    expect(s.add(list(["Aqua", "Glycerin", "Niacinamide"], 4)).id).toBe(s.add(list(["Aqua", "Glycerin", "Niacinamide"], 4)).id);
    expect(s.all()).toHaveLength(1);
  });

  it("two sources that disagree are a conflict, not a winner; case and brackets do not matter, order does", () => {
    const s = new FactStore();
    s.add(list(["Aqua", "Glycerin", "Niacinamide"], 4));
    s.add({ ...list(["AQUA (Water)", "glycerin", "NIACINAMIDE"], 3), value: { ingredients: ["AQUA (Water)", "glycerin", "NIACINAMIDE"], source: "incidecoder", sane: true } });
    expect(s.conflicts()).toHaveLength(0);
    s.add({ ...list(["Aqua", "Niacinamide", "Glycerin"], 3), value: { ingredients: ["Aqua", "Niacinamide", "Glycerin"], source: "incidecoder", sane: true } });
    expect(s.conflicts()).toHaveLength(1);
  });

  it("a model's unverified reading never creates a conflict", () => {
    const s = new FactStore();
    s.add(list(["Aqua", "Glycerin", "Niacinamide"], 4));
    s.add(list(["Aqua", "Something Else", "Entirely"], 1, "model"));
    expect(s.conflicts()).toHaveLength(0);
  });

  it("two model readings never conflict with each other either, whatever their trust", () => {
    const s = new FactStore();
    s.add(list(["Aqua", "Glycerin", "Niacinamide"], 2, "model"));
    s.add(list(["Aqua", "Something Else", "Entirely"], 2, "model"));
    expect(s.conflicts()).toHaveLength(0);
  });
});

describe("the rule registry", () => {
  it("has unique ids whose prefix names their severity", () => {
    expect(new Set(RULE_IDS).size).toBe(RULE_IDS.length);
    for (const r of RULES) expect(r.id.split(".")[0], r.id).toBe(r.severity === "medicinal" ? "med" : r.severity);
  });

  it("no rule is model-origin and blocking: a block must rest on code", () => {
    for (const r of RULES.filter((x) => x.severity === "block" || x.severity === "medicinal")) expect(r.origin, r.id).toBe("code");
  });

  it("every rule, and every rule the decision synthesises, has a copy template", () => {
    const needed = [...RULE_IDS, "gap.list_blocked", "gap.possible_medicinal", "gap.support_insufficient"];
    for (const id of needed) expect(TEMPLATE_IDS, id).toContain(id);
  });
});

describe("copy", () => {
  it("uses the five meanings exactly as written", () => {
    expect(PILLS["good-choice"].meaning).toBe("Evidence supports buying this product for the intended user.");
    expect(PILLS["buy-with-caution"].meaning).toBe("Potentially worthwhile, but there are meaningful considerations.");
    expect(PILLS["look-elsewhere"].meaning).toBe("Material concerns or poor suitability make alternatives preferable.");
    expect(PILLS["not-enough-info"].meaning).toBe("Insufficient reliable evidence for a buying recommendation.");
    expect(PILLS["medicinal-product"].meaning).toBe("Requires assessment under the appropriate medicine framework.");
  });

  it("every template renders lint-clean with realistic parameters", () => {
    const params = { ingredient: "Methylparaben", claim: "Paraben-Free", source: "https://incidecoder.com/products/x", capturedAt: "2026-10-20T00:00:00Z", active: "Ketoconazole", pillarA: "Ingredient Safety & Toxicity", pillarB: "Irritation & Allergen Risk", label: "Sulphate surfactant", detail: "Built on a stronger sulphate surfactant.", audience: "baby", note: "added fragrance, a common contact allergen", entry: "Soap Base", spf: 20, days: 200, recognised: 12, total: 20 };
    for (const id of TEMPLATE_IDS) {
      const text = render({ ruleId: id, severity: "note", origin: "code", needsReliableList: false, params, derivedFrom: [] });
      const l = lint(text, { allowBanned: true });
      expect(l.problems, `${id}: ${text}`).toEqual([]);
      expect(text.length, id).toBeLessThanOrEqual(MAX_REASON);
    }
  });

  it("names a source in words, and a date as 20 Oct 2026, never as an address or an ISO string", () => {
    expect(sourceName("incidecoder")).toBe("INCIDecoder");
    expect(sourceName("https://www.incidecoder.com/products/x")).toBe("INCIDecoder");
    expect(sourceName("https://www.brand.example/products/x")).toBe("brand.example");
    expect(sourceName("brand_page")).toBe("the brand's product page");
    expect(sourceName(undefined)).toBe("the source");
    const text = render({ ruleId: "block.prohibited", severity: "block", origin: "code", needsReliableList: true, params: { ingredient: "hydroquinone", source: "https://incidecoder.com/products/x", capturedAt: "2026-10-20T00:00:00Z" }, derivedFrom: [] });
    expect(text).toBe("Hydroquinone is prohibited in cosmetics. Found in the ingredient list read from INCIDecoder on 20 Oct 2026.");
  });

  it("the lint blocks the words the prompt only asked the model to avoid", () => {
    for (const bad of ["This is unsafe.", "A toxic formula.", "It is a scam.", "Guaranteed results.", "100% safe", "There is no evidence.", "We analyze it.", "A banned ingredient."]) {
      expect(lint(bad).ok, bad).toBe(false);
    }
    expect(lint("We analyse the label and the evidence is not publicly visible.").ok).toBe(true);
    expect(lint("Prohibited in cosmetics.", { allowBanned: true }).ok).toBe(true);
  });
});
