import { describe, expect, it } from "vitest";
import { compareLists, norm, sourceKind } from "./audit-stored-lists-policy";

const LIST = ["Water/Aqua", "Glycerin", "Avena Sativa (Oat) Kernel Extract", "Butylene Glycol", "Cetyl Alcohol", "Panthenol", "Phenoxyethanol", "Trisodium Ethylenediamine Disuccinate"];

describe("compareLists: a stored list against what the current reader finds on the same page", () => {
  it("is the same list whatever the case, brackets or punctuation", () => {
    expect(compareLists(LIST, LIST.map((x) => x.toUpperCase())).verdict).toBe("same");
    expect(compareLists(["Water/Aqua", "Glycerin"], ["water / aqua", "Glycerin (Vegetable)"]).verdict).toBe("same");
  });

  it("finds a list that lost its last entries (the oat cleanser: 19 of 20, the last glued to the next heading)", () => {
    const r = compareLists(LIST.slice(0, -1), LIST);
    expect(r.verdict).toBe("stored-missing-tail");
    expect(r.missingFromStored).toEqual(["Trisodium Ethylenediamine Disuccinate"]);
  });

  it("finds a list that lost its first entries, and one with entries missing in the middle", () => {
    expect(compareLists(LIST.slice(2), LIST).verdict).toBe("stored-missing-head");
    expect(compareLists([LIST[0], LIST[1], LIST[7]], LIST).verdict).toBe("stored-missing-middle");
  });

  it("finds a stored list that holds more than the page does: a menu, a key-actives line, another product's list", () => {
    const stored = ["Back", "Vitamin C", "BHA / Salicylic Acid", "Retinoid / Retinol", "Niacinamide", "UV Filters", "Ceramide"];
    expect(compareLists([...LIST, "Retinol"], LIST).verdict).toBe("stored-has-extra");
    expect(compareLists(stored, LIST).verdict).toBe("different");
  });

  it("says when the page no longer reads at all, rather than calling the stored list wrong", () => {
    expect(compareLists(LIST, null).verdict).toBe("page-unreadable");
    expect(compareLists(LIST, []).verdict).toBe("page-unreadable");
  });

  it("does not count a repeated neighbour twice (the extractor drops one)", () => {
    expect(compareLists(["Aqua", "Aqua", "Glycerin"], ["Aqua", "Glycerin"]).verdict).toBe("same");
  });

  it("norm ignores brackets and punctuation", () => {
    expect(norm("Avena Sativa (Oat) Kernel Extract")).toBe("avenasativakernelextract");
  });
});

describe("sourceKind", () => {
  it("reads the kind of source from the recorded origin, or from the address when none was recorded", () => {
    expect(sourceKind("brand-page", "https://beminimalist.co/products/x")).toBe("brand-page");
    expect(sourceKind(undefined, "https://inkeedecoder.com/products/x")).toBe("decoder");
    expect(sourceKind(undefined, "https://www.nykaa.com/x/p/1")).toBe("nykaa");
    expect(sourceKind(undefined, "https://example.com/x")).toBe("other");
  });
});
