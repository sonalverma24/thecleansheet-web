import { afterEach, describe, expect, it } from "vitest";
import { DRUG_ONLY_MANUFACTURERS } from "@/lib/analyser-x/kb";
import { drugNoticeOf, manufacturersIn, rxPhraseIn } from "./drug-signals";

describe("a prescription phrase", () => {
  it.each([
    ["Prescription Required", "Prescription Required"],
    ["Price shown is a placeholder; product listed as 'Prescription Required'.", "Prescription Required"],
    ["Rx only", "Rx only"],
    ["Rx-only medicine", "Rx-only"],
    ["Prescription only.", "Prescription only"],
    ["Schedule H drug: to be sold by retail on the prescription of a Registered Medical Practitioner only", "Schedule H"],
    ["Schedule H1 warning", "Schedule H1"],
    ["Requires a prescription from your doctor", "Requires a prescription"],
    ["This is a prescription medicine.", "prescription medicine"],
  ])("is found in %j", (text, phrase) => {
    expect(rxPhraseIn(text)).toBe(phrase);
  });

  it.each([
    "Not a prescription drug",
    "This is not a prescription medicine; it is sold over the counter.",
    "No prescription required",
    "No prescription needed, no doctor visit.",
    "Does not require a prescription",
    "Sold without a prescription only drug store",
    "IMS Prescription Audit MAT (Mar 20)",
    "Dermatologists' most prescribed brand",
    "Upload your prescription to order medicines",
    "Ciclopirox is a prescription antifungal",
    "",
  ])("is not found in %j", (text) => {
    expect(rxPhraseIn(text)).toBeNull();
  });

  it("finds a real notice even after a negated one", () => {
    expect(rxPhraseIn("No prescription needed for our other creams. This one is Prescription Only.")).toBe("Prescription Only");
  });
});

describe("drugNoticeOf", () => {
  it("a bare Rx counts in a short field (name, category, listing note) ...", () => {
    expect(drugNoticeOf({ productName: "Aziderm Rx Cream" })).toMatchObject({ kind: "prescription-drug", why: "rx", text: "Rx" });
    expect(drugNoticeOf({ listingNotes: ["Listed as Rx item"] })).toMatchObject({ kind: "prescription-drug" });
  });

  it("... but not in the long text of a page, where it turns up in menus", () => {
    expect(drugNoticeOf({ pageText: "Menu: Home | Rx | Offers | Cart. Gentle cleanser for daily use." })).toBeNull();
    expect(drugNoticeOf({ pageText: "Menu: Rx | Offers. This serum is Prescription Required." })).toMatchObject({ kind: "prescription-drug" });
  });

  it("COSRX and similar names are not an Rx", () => {
    expect(drugNoticeOf({ productName: "COSRX BHA Blackhead Power Liquid" })).toBeNull();
  });

  it("a Drug Facts label makes it a drug, never a prescription one", () => {
    expect(drugNoticeOf({ labelText: "DRUG FACTS Active ingredient" })).toEqual({ kind: "drug", why: "drug-facts", text: "DRUG FACTS" });
  });

  it("says nothing about a product with no sign", () => {
    expect(drugNoticeOf({ productName: "Gentle Face Wash", category: "Face Wash", listingNotes: ["Seen at Nykaa."], pageText: "Fragrance free", labelText: "" })).toBeNull();
    expect(drugNoticeOf({})).toBeNull();
  });
});

describe("a maker that only makes drugs", () => {
  const PAGE = "Product details\nManufactured by: Example Pharmaceuticals Pvt Ltd, Plot 4, Baddi\nCountry of origin: India";
  afterEach(() => { DRUG_ONLY_MANUFACTURERS.length = 0; });

  it("is read off the page: 'Manufactured by', 'Marketed by', 'Manufacturer:'", () => {
    expect(manufacturersIn(PAGE)).toEqual(["Example Pharmaceuticals Pvt Ltd"]);
    expect(manufacturersIn("Marketed by Acme Labs, Mumbai")).toEqual(["Acme Labs"]);
    expect(manufacturersIn("Manufacturer: Acme Labs | Brand: Foo")).toEqual(["Acme Labs"]);
    expect(manufacturersIn("Gentle cleanser. Fragrance free.")).toEqual([]);
  });

  it("counts for nothing until the owner has signed the maker off: the table starts empty", () => {
    expect(DRUG_ONLY_MANUFACTURERS).toEqual([]);
    expect(drugNoticeOf({ pageText: PAGE })).toBeNull();
  });

  it("an entry the owner has not reviewed, or has not sourced, does not count", () => {
    DRUG_ONLY_MANUFACTURERS.push({ name: "Example Pharmaceuticals", re: /example pharmaceuticals/i, source: "CDSCO drug licence register", reviewed: false });
    DRUG_ONLY_MANUFACTURERS.push({ name: "Example Pharmaceuticals", re: /example pharmaceuticals/i, source: "  ", reviewed: true });
    expect(drugNoticeOf({ pageText: PAGE })).toBeNull();
  });

  it("a signed-off drug-only maker named on the page makes it a drug", () => {
    DRUG_ONLY_MANUFACTURERS.push({ name: "Example Pharmaceuticals", re: /example pharmaceuticals/gi, source: "CDSCO drug licence register", reviewed: true });
    expect(drugNoticeOf({ pageText: PAGE })).toEqual({ kind: "drug", why: "drug-manufacturer", text: "Example Pharmaceuticals Pvt Ltd" });
    // read twice: a global regex in the table must not alternate its answer
    expect(drugNoticeOf({ pageText: PAGE })?.kind).toBe("drug");
  });

  it("a maker's name in the product's own name or a listing note is not enough: only the page's 'made by' line counts", () => {
    DRUG_ONLY_MANUFACTURERS.push({ name: "Example Pharmaceuticals", re: /example pharmaceuticals/i, source: "register", reviewed: true });
    expect(drugNoticeOf({ productName: "Example Pharmaceuticals Face Wash", listingNotes: ["By Example Pharmaceuticals"] })).toBeNull();
  });
});
