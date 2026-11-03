import { describe, expect, it } from "vitest";
import { OWNER_SUPPLIED_INCI } from "@/data/inci/owner-supplied";
import { checkOwnerSupplied, findOwnerSupplied, ownerSuppliedPage, parsePastedInci, type OwnerSuppliedEntry } from "./owner-supplied-inci";

/** A made-up product and list, used only to exercise the rules. It is not a real brand's list. */
const LIST = "Aqua, Zinc Oxide, Caprylic/Capric Triglyceride, Glycerin, Sodium Hyaluronate, Tocopheryl Acetate, Xanthan Gum, Phenoxyethanol";
const entry: OwnerSuppliedEntry = {
  brands: ["Test Co", "Testco Beauty"],
  productNames: ["Daily Shield SPF 50 Mineral Sunscreen", "Test Co Sunscreen - SPF 50 PA+++ Lightweight Mineral Sunscreen with Hyaluronic Acid"],
  sourceUrl: "https://testco.com/products/daily-shield-spf-50",
  quote: `Ingredients: ${LIST}.`,
  suppliedOn: "2026-11-01",
  note: "Back-of-pack photo, fourth gallery image",
};

describe("parsePastedInci", () => {
  it("drops the label and the final full stop and splits on commas", () => {
    expect(parsePastedInci("Ingredients: Aqua, Glycerin, Zinc Oxide.")).toEqual(["Aqua", "Glycerin", "Zinc Oxide"]);
  });
  it("keeps a bracketed comma inside its name", () => {
    expect(parsePastedInci("Aqua (Water, Eau), Glycerin, Zinc Oxide [CI 77947, nano]")).toEqual(["Aqua (Water, Eau)", "Glycerin", "Zinc Oxide [CI 77947, nano]"]);
  });
  it("splits on lines when the paste has one name per line and no commas", () => {
    expect(parsePastedInci("Aqua\nGlycerin\r\nZinc Oxide\n")).toEqual(["Aqua", "Glycerin", "Zinc Oxide"]);
  });
  it("splits on bullets and semicolons", () => {
    expect(parsePastedInci("Aqua • Glycerin; Zinc Oxide")).toEqual(["Aqua", "Glycerin", "Zinc Oxide"]);
  });
});

describe("checkOwnerSupplied", () => {
  it("accepts a clean entry with a brand-site source", () => {
    expect(checkOwnerSupplied(entry)).toEqual([]);
  });
  it("accepts a Decoder product page as the source", () => {
    expect(checkOwnerSupplied({ ...entry, sourceUrl: "https://inkeedecoder.com/products/test-co-daily-shield" })).toEqual([]);
  });
  it("refuses a retailer page, another brand's site or a made-up host as the source", () => {
    for (const sourceUrl of ["https://www.flipkart.com/test-co/p/abc", "https://www.nykaa.com/test-co/p/123", "https://otherbrand.com/products/x", "http://testco.com/products/x", "https://testco.com.evil.test/products/x", "https://testco.com/"]) {
      expect(checkOwnerSupplied({ ...entry, sourceUrl }), sourceUrl).not.toEqual([]);
    }
  });
  it("refuses a fragment, a sentence, a mistyped list and a list that repeats a name", () => {
    expect(checkOwnerSupplied({ ...entry, quote: "Aqua, Zinc Oxide, Glycerin" })).not.toEqual([]);
    expect(checkOwnerSupplied({ ...entry, quote: "Free from parabens and made with love in India, Aqua, Glycerin, Zinc Oxide, Xanthan Gum, Tocopherol" })).not.toEqual([]);
    expect(checkOwnerSupplied({ ...entry, quote: `${LIST}, Zinc Oxide` })).not.toEqual([]);
    expect(checkOwnerSupplied({ ...entry, quote: "Aqua, 50, Glycerin, Zinc Oxide, Xanthan Gum, Tocopherol" })).not.toEqual([]);
  });
  it("needs a date, a note saying where it was read, and at least one brand and product name", () => {
    expect(checkOwnerSupplied({ ...entry, suppliedOn: "1 Nov 2026" })).not.toEqual([]);
    expect(checkOwnerSupplied({ ...entry, note: "  " })).not.toEqual([]);
    expect(checkOwnerSupplied({ ...entry, brands: [] })).not.toEqual([]);
    expect(checkOwnerSupplied({ ...entry, productNames: [] })).not.toEqual([]);
  });
});

describe("ownerSuppliedPage", () => {
  it("is a quoted, trust-3 source whose origin says the owner typed it, with the list parsed from the quote", () => {
    const page = ownerSuppliedPage(entry);
    expect(page).toMatchObject({ source: entry.sourceUrl, trust: 3, origin: "owner-supplied", siteName: "The Clean Sheet" });
    expect(page.ingredients).toEqual(LIST.split(", "));
    expect(page.quote).toBe(`Ingredients: ${LIST}.`);
  });
});

describe("findOwnerSupplied", () => {
  const all = [entry];
  it("finds the list by brand and exact product name, in any word order and with the brand's own words ignored", () => {
    expect(findOwnerSupplied("Test Co", "Daily Shield SPF 50 Mineral Sunscreen", all)?.ingredients).toEqual(LIST.split(", "));
    expect(findOwnerSupplied("Test Co", "Mineral Sunscreen Daily Shield SPF 50", all)).not.toBeNull();
    expect(findOwnerSupplied("Test Co", "Test Co Daily Shield SPF 50 Mineral Sunscreen", all)).not.toBeNull();
    expect(findOwnerSupplied("Testco Beauty", "Daily Shield SPF 50 Mineral Sunscreen", all)).not.toBeNull();
  });
  it("finds it by the retailer title too, when that is listed", () => {
    expect(findOwnerSupplied("Test Co", "Test Co Sunscreen - SPF 50 PA+++ Lightweight Mineral Sunscreen with Hyaluronic Acid", all)).not.toBeNull();
  });
  it("never lends the list to a variant: another SPF, a tinted version, a size or a different product", () => {
    for (const name of ["Daily Shield SPF 30 Mineral Sunscreen", "Daily Shield SPF 50 Tinted Mineral Sunscreen", "Daily Shield SPF 50 Mineral Sunscreen Tester 20g", "Daily Shield Mineral Sunscreen", "Daily Shield SPF 50 Mineral Sunscreen Kit"]) {
      expect(findOwnerSupplied("Test Co", name, all), name).toBeNull();
    }
  });
  it("never lends the list to another brand's product with the same name", () => {
    expect(findOwnerSupplied("Other Brand", "Daily Shield SPF 50 Mineral Sunscreen", all)).toBeNull();
  });
  it("ignores an entry that fails its checks", () => {
    expect(findOwnerSupplied("Test Co", "Daily Shield SPF 50 Mineral Sunscreen", [{ ...entry, quote: "Aqua, Zinc Oxide" }])).toBeNull();
  });
  it("gives nothing when two entries for the same product disagree", () => {
    const other: OwnerSuppliedEntry = { ...entry, quote: LIST.replace("Glycerin", "Propanediol") };
    expect(findOwnerSupplied("Test Co", "Daily Shield SPF 50 Mineral Sunscreen", [entry, other])).toBeNull();
    expect(findOwnerSupplied("Test Co", "Daily Shield SPF 50 Mineral Sunscreen", [entry, { ...entry }])).not.toBeNull();
  });
  it("gives nothing for an empty brand or an empty list of entries", () => {
    expect(findOwnerSupplied("", "Daily Shield SPF 50 Mineral Sunscreen", all)).toBeNull();
    expect(findOwnerSupplied("Test Co", "Daily Shield SPF 50 Mineral Sunscreen", [])).toBeNull();
  });
});

describe("the owner-supplied data file", () => {
  it("holds only entries that pass every check, so a mistyped one fails here and never publishes", () => {
    for (const e of OWNER_SUPPLIED_INCI) expect(checkOwnerSupplied(e), `${e.brands[0]} / ${e.productNames[0]}`).toEqual([]);
  });
});
