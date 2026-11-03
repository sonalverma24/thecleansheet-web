import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { PACKAGING_FAMILIES } from "@/data/packaging/families";
import { validateCatalogue } from "@/lib/packaging-catalogue";
import {
  PACKAGING_CSV_COLUMNS, PACKAGING_CSV_FILES, PACKAGING_STORES, TEMPLATE_SENTINEL,
  buildCatalogueFromCsv, formatIssue, parseCsv, renderStore, runImport,
  type CsvKind, type ImportResult,
} from "@/lib/packaging-import";

/* Fixtures are obviously fake and live only in this test. Nothing here is written
   to src/data/packaging/: the end to end tests write to a scratch folder. */

const TODAY = new Date("2026-10-15T00:00:00Z");
const [FAMILY_A, FAMILY_B] = PACKAGING_FAMILIES.map((f) => f.id);

type Rows = Record<CsvKind, Record<string, string>[]>;

const fixtureRows = (): Rows => ({
  suppliers: [
    {
      id: "t-sup-1", slug: "test-supplier-one", name: "Test Supplier One", businessType: "manufacturer",
      city: "Testville", state: "Testland", website: "https://supplier-one.test", yearEstablished: "2005",
      about: "A fake supplier, used only in tests.", credentials: "iso-9001|verified|ref=T-1; other|label=Test board",
      contactPerson: "Test Person", contactEmail: "person@supplier-one.test", contactPhone: "+00 0000 000000",
      contactAgreedPublic: "yes", eprStatus: "registered", eprReference: "T-EPR-1", eprCheckedOn: "2026-02-01",
      listedOn: "2026-01-15",
    },
    {
      id: "t-sup-2", slug: "test-supplier-two", name: "Test Supplier Two", businessType: "trader",
      city: "Testville", state: "Testland", listedOn: "2026-01-16",
    },
  ],
  products: [
    {
      id: "t-prod-1", familyId: FAMILY_A, name: "Test 30 ml bottle", capacityValue: "30", capacityUnit: "ml",
      material: "glass", materialDetail: "Test glass", containerStyle: "Round", closure: "Dropper", shape: "Round",
      neckFinish: "18/415", pumpOutputMl: "0.5", childResistant: "no", tamperEvident: "yes", pcrPercent: "0",
      lengthMm: "30", widthMm: "30", heightMm: "90",
    },
    { id: "t-prod-2", familyId: FAMILY_B, name: "Test pump", material: "plastic", containerStyle: "Round", closure: "Pump" },
  ],
  offerings: [
    {
      id: "t-off-1", supplierId: "t-sup-1", productId: "t-prod-1", moqPieces: "500", moqScope: "complete-assembly",
      branding: "plain-stock; label-ready", stock: "both", leadTimeMinDays: "7", leadTimeMaxDays: "14", samples: "paid",
      priceMinInr: "10", priceMaxInr: "12.5", priceAtQuantity: "1000", priceQuotedOn: "2026-02-01", priceGstIncluded: "no",
      paymentTerms: "Test terms", note: "Test note, with a comma", termsConfirmedOn: "2026-02-01",
    },
    { id: "t-off-2", supplierId: "t-sup-2", productId: "t-prod-1", branding: "plain-stock" },
  ],
  verifications: [
    {
      id: "t-ver-1", supplierId: "t-sup-1", evidence: "certificate", source: "supplier-provided", outcome: "confirmed",
      checkedOn: "2026-02-01", scope: "Test certificate, rev A", limitations: "Does not cover other sites", reviewer: "Test Reviewer",
      validUntil: "2027-02-01",
    },
    {
      id: "t-ver-2", supplierId: "t-sup-1", evidence: "epr-information", source: "supplier-provided", outcome: "partly-confirmed",
      checkedOn: "2026-02-01", scope: "Test EPR reference", limitations: "Registration not checked on the public register", reviewer: "Test Reviewer",
    },
    {
      id: "t-ver-3", supplierId: "t-sup-1", offeringId: "t-off-1", evidence: "price-quote", source: "supplier-provided",
      outcome: "confirmed", checkedOn: "2026-02-01", scope: "Quote at 1000 pieces", limitations: "Price is dated", reviewer: "Test Reviewer",
    },
  ],
});

const cell = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const toCsv = (kind: CsvKind, rows: Record<string, string>[]) =>
  [PACKAGING_CSV_COLUMNS[kind].join(","), ...rows.map((r) => PACKAGING_CSV_COLUMNS[kind].map((c) => cell(r[c] ?? "")).join(","))].join("\n") + "\n";
const toInputs = (rows: Rows) => ({
  suppliers: toCsv("suppliers", rows.suppliers), products: toCsv("products", rows.products),
  offerings: toCsv("offerings", rows.offerings), verifications: toCsv("verifications", rows.verifications),
});
const run = (rows: Rows) => buildCatalogueFromCsv(toInputs(rows), { today: TODAY });

function messages(result: ImportResult): string[] {
  if (result.ok) throw new Error("expected the import to be rejected");
  return result.issues.map(formatIssue);
}
const expectRejected = (result: ImportResult, where: string, text: RegExp | string) => {
  const found = messages(result);
  const re = typeof text === "string" ? new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) : text;
  expect(found.some((m) => m.startsWith(where) && re.test(m)), `no "${where}" issue matching ${re}; got:\n${found.join("\n")}`).toBe(true);
};

/* ── CSV parsing ─────────────────────────────────────────── */

describe("parseCsv", () => {
  it("handles quotes, doubled quotes, commas and newlines inside cells", () => {
    const { records } = parseCsv('a,"b, c","say ""hi""","line1\nline2"\n1,2,3,4\n');
    expect(records).toEqual([["a", "b, c", 'say "hi"', "line1\nline2"], ["1", "2", "3", "4"]]);
  });

  it("copes with CRLF, a byte order mark and a missing final newline", () => {
    expect(parseCsv("﻿a,b\r\nc,d").records).toEqual([["a", "b"], ["c", "d"]]);
  });

  it("keeps blank lines as records so row numbers match the spreadsheet", () => {
    expect(parseCsv("a\n\nb\n").records).toEqual([["a"], [""], ["b"]]);
  });

  it("reports an unclosed quote with its row", () => {
    expect(parseCsv('a,b\nc,"never closed\n').unterminatedAtRow).toBe(2);
  });
});

/* ── Happy path ──────────────────────────────────────────── */

describe("a clean spreadsheet", () => {
  const result = run(fixtureRows());

  it("is accepted and passes validateCatalogue", () => {
    expect(result.ok, result.ok ? "" : messages(result).join("\n")).toBe(true);
    if (!result.ok) return;
    expect(validateCatalogue(result.catalogue)).toEqual([]);
    expect(result.counts).toEqual({ suppliers: 2, products: 2, offerings: 2, verifications: 3 });
    expect(result.warnings).toEqual([]);
  });

  it("builds typed records with nested fields in the order of the types", () => {
    if (!result.ok) throw new Error("rejected");
    const [s1] = result.catalogue.suppliers;
    expect(Object.keys(s1)).toEqual([
      "id", "slug", "name", "businessType", "city", "state", "website", "yearEstablished", "about",
      "credentials", "contact", "epr", "listedOn",
    ]);
    expect(s1.credentials).toEqual([
      { kind: "iso-9001", verified: true, reference: "T-1" },
      { kind: "other", label: "Test board", verified: false },
    ]);
    expect(s1.contact).toEqual({ email: "person@supplier-one.test", phone: "+00 0000 000000", person: "Test Person" });
    expect(s1.epr).toEqual({ status: "registered", reference: "T-EPR-1", checkedOn: "2026-02-01" });
    expect(result.catalogue.products[0]).toMatchObject({
      capacity: { value: 30, unit: "ml" }, pumpOutputMl: 0.5, childResistant: false, tamperEvident: true,
      pcrPercent: 0, dimensionsMm: { length: 30, width: 30, height: 90 },
    });
    expect(result.catalogue.offerings[0]).toMatchObject({
      moqPieces: 500, moqScope: "complete-assembly", branding: ["plain-stock", "label-ready"],
      leadTimeDays: { min: 7, max: 14 },
      price: { perPieceInr: { min: 10, max: 12.5 }, atQuantity: 1000, quotedOn: "2026-02-01", gstIncluded: false },
      note: "Test note, with a comma",
    });
  });

  it("never turns a blank into a claim", () => {
    if (!result.ok) throw new Error("rejected");
    expect(result.catalogue.offerings[1]).toStrictEqual({
      id: "t-off-2", supplierId: "t-sup-2", productId: "t-prod-1", moqPieces: null, moqScope: "unconfirmed",
      branding: ["plain-stock"], stock: "unconfirmed", samples: "unconfirmed", repeatSupplyConfirmed: null,
    });
    expect(result.catalogue.suppliers[1]).toStrictEqual({
      id: "t-sup-2", slug: "test-supplier-two", name: "Test Supplier Two", businessType: "trader",
      city: "Testville", state: "Testland", credentials: [], listedOn: "2026-01-16",
    });
    expect(result.catalogue.products[1]).toStrictEqual({
      id: "t-prod-2", familyId: FAMILY_B, name: "Test pump", material: "plastic", containerStyle: "Round", closure: "Pump",
    });
  });

  it("accepts header-only files as an empty catalogue", () => {
    const empty = buildCatalogueFromCsv({
      suppliers: toCsv("suppliers", []), products: toCsv("products", []),
      offerings: toCsv("offerings", []), verifications: toCsv("verifications", []),
    }, { today: TODAY });
    expect(empty.ok).toBe(true);
    if (empty.ok) expect(empty.counts).toEqual({ suppliers: 0, products: 0, offerings: 0, verifications: 0 });
  });

  it("is tolerant of header case, blank rows and comment rows, and numbers rows like the spreadsheet", () => {
    const inputs = toInputs(fixtureRows());
    const lines = inputs.products.split("\n");
    inputs.products = [lines[0].toUpperCase(), "# a comment row", ",,,,", ...lines.slice(1)].join("\n").replace("MATERIAL", "material");
    const ok = buildCatalogueFromCsv(inputs, { today: TODAY });
    expect(ok.ok, ok.ok ? "" : messages(ok).join("\n")).toBe(true);

    inputs.products = ["id,familyId,name,capacityValue,capacityUnit,material,materialDetail,containerStyle,closure,shape,neckFinish,pumpOutputMl,childResistant,tamperEvident,pcrPercent,lengthMm,widthMm,heightMm", "# comment", "", "t-prod-1,nope,Test,,,glass,,Round,Dropper,,,,,,,,,"].join("\n");
    expectRejected(buildCatalogueFromCsv(inputs, { today: TODAY }), 'products.csv row 4, column "familyId"', "not a known family id");
  });
});

/* ── Rejections ──────────────────────────────────────────── */

describe("bad rows are rejected with file, row and column", () => {
  const mutate = (fn: (r: Rows) => void) => { const r = fixtureRows(); fn(r); return run(r); };

  it("flags an unknown enum value and suggests the closest", () => {
    expectRejected(mutate((r) => { r.suppliers[0].businessType = "manufactuer"; }),
      'suppliers.csv row 2, column "businessType"', /did you mean "manufacturer"/);
  });

  it("flags a spreadsheet-formatted date", () => {
    expectRejected(mutate((r) => { r.suppliers[1].listedOn = "15/10/2026"; }),
      'suppliers.csv row 3, column "listedOn"', /use YYYY-MM-DD/);
  });

  it("flags impossible calendar dates and dates in the future", () => {
    expectRejected(mutate((r) => { r.suppliers[0].listedOn = "2026-02-30"; }), 'suppliers.csv row 2, column "listedOn"', /not a valid date/);
    expectRejected(mutate((r) => { r.verifications[0].checkedOn = "2026-12-01"; }), 'verifications.csv row 2, column "checkedOn"', /in the future/);
  });

  it("flags numbers with commas or units", () => {
    expectRejected(mutate((r) => { r.offerings[0].moqPieces = "1,00,000"; }), 'offerings.csv row 2, column "moqPieces"', /no commas/);
    expectRejected(mutate((r) => { r.offerings[0].priceMinInr = "Rs 10"; }), 'offerings.csv row 2, column "priceMinInr"', /not a number/);
  });

  it("requires the MOQ scope when there is a MOQ, and refuses a scope without a MOQ", () => {
    expectRejected(mutate((r) => { r.offerings[0].moqScope = ""; }), 'offerings.csv row 2, column "moqScope"', /say what it covers/);
    expectRejected(mutate((r) => { r.offerings[0].moqScope = "unconfirmed"; }), 'offerings.csv row 2, column "moqScope"', /say what it covers/);
    expectRejected(mutate((r) => { r.offerings[1].moqScope = "container-only"; }), 'offerings.csv row 3, column "moqScope"', /moqPieces is blank/);
  });

  it("only accepts yes or no for repeat supply and keeps blank as null", () => {
    expectRejected(mutate((r) => { r.offerings[0].repeatSupplyConfirmed = "probably"; }), 'offerings.csv row 2, column "repeatSupplyConfirmed"', /not yes or no/);
    const ok = mutate((r) => { r.offerings[0].repeatSupplyConfirmed = "no"; });
    if (!ok.ok) throw new Error("rejected");
    expect(ok.catalogue.offerings.map((o) => o.repeatSupplyConfirmed)).toEqual([false, null]);
  });

  it("warns when repeat supply is claimed without a confirmed record", () => {
    const claimed = mutate((r) => { r.offerings[0].repeatSupplyConfirmed = "yes"; });
    if (!claimed.ok) throw new Error(messages(claimed).join("\n"));
    expect(claimed.warnings).toHaveLength(1);
    expect(claimed.warnings[0]).toMatch(/offerings\.csv row 2: "t-off-1" has repeatSupplyConfirmed=yes/);

    const backed = mutate((r) => {
      r.offerings[0].repeatSupplyConfirmed = "yes";
      r.verifications.push({
        id: "t-ver-4", supplierId: "t-sup-1", offeringId: "t-off-1", evidence: "repeat-supply-confirmation",
        source: "supplier-provided", outcome: "confirmed", checkedOn: "2026-02-02", scope: "Test", limitations: "Test", reviewer: "Test",
      });
    });
    if (!backed.ok) throw new Error("rejected");
    expect(backed.warnings).toEqual([]);
  });

  it("requires scope, limitations and reviewer on every verification", () => {
    for (const col of ["scope", "limitations", "reviewer"]) {
      expectRejected(mutate((r) => { r.verifications[1][col] = "   "; }), `verifications.csv row 3, column "${col}"`, /required but blank/);
    }
  });

  it("refuses a verified credential without a confirmed certificate record", () => {
    const result = mutate((r) => { r.verifications[0].outcome = "partly-confirmed"; });
    expectRejected(result, 'suppliers.csv row 2, column "credentials"', /marked verified without a confirmed certificate record/);
    const unverified = mutate((r) => { r.verifications.splice(0, 1); r.suppliers[0].credentials = "iso-9001"; });
    expect(unverified.ok, unverified.ok ? "" : messages(unverified).join("\n")).toBe(true);
  });

  it("refuses an EPR check date with no EPR record", () => {
    expectRejected(mutate((r) => { r.verifications.splice(1, 1); }), 'suppliers.csv row 2, column "eprCheckedOn"', /without an epr-information record/);
  });

  it("only publishes a contact the supplier agreed to", () => {
    expectRejected(mutate((r) => { r.suppliers[0].contactAgreedPublic = ""; }), 'suppliers.csv row 2, column "contactAgreedPublic"', /agreed to a public contact/);
    expectRejected(mutate((r) => { r.suppliers[1].contactAgreedPublic = "yes"; }), 'suppliers.csv row 3, column "contactAgreedPublic"', /no contact details/);
  });

  it("validates credential entries", () => {
    expectRejected(mutate((r) => { r.suppliers[0].credentials = "iso9001"; }), 'suppliers.csv row 2, column "credentials"', /did you mean "iso-9001"/);
    expectRejected(mutate((r) => { r.suppliers[0].credentials = "other"; }), 'suppliers.csv row 2, column "credentials"', /needs a name/);
    expectRejected(mutate((r) => { r.suppliers[0].credentials = "gmp|certified"; }), 'suppliers.csv row 2, column "credentials"', /not understood/);
  });

  it("flags partial groups: price, lead time, capacity, dimensions, EPR", () => {
    expectRejected(mutate((r) => { r.offerings[0].priceAtQuantity = ""; }), 'offerings.csv row 2, column "priceAtQuantity"', /required but blank/);
    expectRejected(mutate((r) => { r.offerings[0].priceGstIncluded = ""; }), 'offerings.csv row 2, column "priceGstIncluded"', /required but blank/);
    expectRejected(mutate((r) => { r.offerings[0].priceMaxInr = "5"; }), 'offerings.csv row 2, column "priceMaxInr"', /below priceMinInr/);
    expectRejected(mutate((r) => { r.offerings[0].leadTimeMaxDays = ""; }), 'offerings.csv row 2, column "leadTimeMaxDays"', /required when leadTimeMinDays/);
    expectRejected(mutate((r) => { r.products[0].capacityUnit = ""; }), 'products.csv row 2, column "capacityUnit"', /required when capacityValue/);
    expectRejected(mutate((r) => { r.products[0].heightMm = ""; }), 'products.csv row 2, column "heightMm"', /give all three or none/);
    expectRejected(mutate((r) => { r.suppliers[0].eprStatus = ""; }), 'suppliers.csv row 2, column "eprStatus"', /required when any other epr/);
  });

  it("flags unknown references with the closest id", () => {
    expectRejected(mutate((r) => { r.products[0].familyId = "glass-dropper-bottle"; }), 'products.csv row 2, column "familyId"', /did you mean "glass-dropper-bottles"/);
    expectRejected(mutate((r) => { r.offerings[0].supplierId = "t-sup-9"; }), 'offerings.csv row 2, column "supplierId"', /not a known supplier id/);
    expectRejected(mutate((r) => { r.offerings[0].productId = "t-prod-9"; }), 'offerings.csv row 2, column "productId"', /not a known product id/);
    expectRejected(mutate((r) => { r.verifications[2].offeringId = "t-off-9"; }), 'verifications.csv row 4, column "offeringId"', /not a known offering id/);
  });

  it("flags a verification pointing at another supplier's offering", () => {
    expectRejected(mutate((r) => { r.verifications[2].supplierId = "t-sup-2"; }), 'verifications.csv row 4, column "offeringId"', /belongs to supplier "t-sup-1"/);
  });

  it("flags duplicate ids and slugs, and a second offering of the same variant", () => {
    expectRejected(mutate((r) => { r.products[1].id = "t-prod-1"; }), 'products.csv row 3, column "id"', /already used on row 2/);
    expectRejected(mutate((r) => { r.suppliers[1].slug = "test-supplier-one"; }), 'suppliers.csv row 3, column "slug"', /already used on row 2/);
    expectRejected(mutate((r) => { r.offerings[1].supplierId = "t-sup-1"; r.offerings[1].productId = "t-prod-1"; }),
      'offerings.csv row 3, column "productId"', /already offers this product/);
  });

  it("rejects em dashes anywhere in a cell", () => {
    expectRejected(mutate((r) => { r.suppliers[0].about = `Fake ${String.fromCharCode(0x2014)} test`; }), 'suppliers.csv row 2, column "about"', /em dash/);
  });

  it("rejects a template example row that was left in", () => {
    expectRejected(mutate((r) => { r.suppliers[1].name = `${TEMPLATE_SENTINEL} Packaging Ltd`; }), 'suppliers.csv row 3, column "name"', /template example row/);
  });

  it("does not cascade when a referenced row is itself bad", () => {
    const found = messages(mutate((r) => { r.suppliers[1].businessType = "factory"; }));
    expect(found).toHaveLength(1);
    expect(found[0]).toMatch(/^suppliers\.csv row 3, column "businessType"/);
  });

  it("reports every problem at once, ordered by file and row", () => {
    const found = messages(mutate((r) => {
      r.verifications[0].reviewer = "";
      r.offerings[0].moqPieces = "abc";
      r.suppliers[1].listedOn = "nope";
      r.suppliers[0].city = "";
    }));
    expect(found.map((m) => m.split(":")[0])).toEqual([
      'suppliers.csv row 2, column "city"', 'suppliers.csv row 3, column "listedOn"',
      'offerings.csv row 2, column "moqPieces"', 'verifications.csv row 2, column "reviewer"',
    ]);
  });

  it("numbers rows the way the spreadsheet does when comments and blank rows are present", () => {
    const inputs = toInputs(fixtureRows());
    const lines = inputs.suppliers.trimEnd().split("\n");
    lines.splice(1, 0, "# a comment", ",,,");
    lines[4] = lines[4].replace("trader", "factory");
    inputs.suppliers = lines.join("\n");
    expectRejected(buildCatalogueFromCsv(inputs, { today: TODAY }), 'suppliers.csv row 5, column "businessType"', /not valid/);
  });

  it("rejects a bad header: unknown, missing and duplicate columns", () => {
    const inputs = toInputs(fixtureRows());
    inputs.suppliers = inputs.suppliers.replace("city", "cty");
    const found = messages(buildCatalogueFromCsv(inputs, { today: TODAY }));
    expect(found).toContain('suppliers.csv row 1, column "cty": unknown column (did you mean "city"?)');
    expect(found).toContain('suppliers.csv row 1, column "city": column is missing from the header');

    inputs.suppliers = toInputs(fixtureRows()).suppliers.replace(",slug,", ",id,");
    expectRejected(buildCatalogueFromCsv(inputs, { today: TODAY }), 'suppliers.csv row 1, column "id"', /appears twice/);
  });

  it("explains semicolon separated exports and unclosed quotes", () => {
    const inputs = toInputs(fixtureRows());
    inputs.products = inputs.products.replace(/,/g, ";");
    expectRejected(buildCatalogueFromCsv(inputs, { today: TODAY }), "products.csv row 1", /not comma separated/);
    inputs.products = toInputs(fixtureRows()).products + 'x,"oops\n';
    expectRejected(buildCatalogueFromCsv(inputs, { today: TODAY }), "products.csv row 4", /never closed/);
  });
});

/* ── Templates ───────────────────────────────────────────── */

describe("blank templates", () => {
  const dir = path.resolve(__dirname, "../../scripts/packaging-templates");
  const read = (kind: CsvKind) => fs.readFileSync(path.join(dir, PACKAGING_CSV_FILES[kind]), "utf8");
  const kinds = Object.keys(PACKAGING_CSV_FILES) as CsvKind[];

  it("have exactly the importer's columns and a commented, fake example row", () => {
    for (const kind of kinds) {
      const { records } = parseCsv(read(kind));
      expect(records[0], kind).toEqual([...PACKAGING_CSV_COLUMNS[kind]]);
      expect(records[1][0], kind).toMatch(/^# FAKE EXAMPLE/);
      expect(records[1], kind).toHaveLength(PACKAGING_CSV_COLUMNS[kind].length);
      expect(records.length, kind).toBe(2);
    }
  });

  it("import as an empty catalogue", () => {
    const result = buildCatalogueFromCsv({
      suppliers: read("suppliers"), products: read("products"), offerings: read("offerings"), verifications: read("verifications"),
    }, { today: TODAY });
    expect(result.ok, result.ok ? "" : messages(result).join("\n")).toBe(true);
    if (result.ok) expect(result.counts).toEqual({ suppliers: 0, products: 0, offerings: 0, verifications: 0 });
  });

  it("reject their own example row if someone un-comments it", () => {
    for (const kind of kinds) {
      const inputs = { suppliers: read("suppliers"), products: read("products"), offerings: read("offerings"), verifications: read("verifications") };
      inputs[kind] = inputs[kind].replace("# FAKE EXAMPLE (delete this row)", "ex-1");
      expectRejected(buildCatalogueFromCsv(inputs, { today: TODAY }), `${PACKAGING_CSV_FILES[kind]} row 2`, /template example row/);
    }
  });

  it("contain no em dashes", () => {
    for (const kind of kinds) expect(read(kind)).not.toContain(String.fromCharCode(0x2014));
    expect(fs.readFileSync(path.join(dir, "README.md"), "utf8")).not.toContain(String.fromCharCode(0x2014));
  });
});

/* ── Writing the data files ──────────────────────────────── */

const evalStore = (text: string, exportName: string, typeName: string): unknown => {
  const decl = `export const ${exportName}: ${typeName}[] = `;
  const expr = text.slice(text.indexOf(decl) + decl.length).replace(/;\s*$/, "");
  return new Function(`return (${expr});`)();
};

describe("renderStore", () => {
  const empty = `import type { Thing } from "./types";\n\n/* Header comment that must survive. */\nexport const THINGS: Thing[] = [];\n`;
  const records = [{ id: "a", n: 1, nested: { x: "y", z: [1, 2] }, list: [], quoted: 'say "hi"\nnext', maybe: null, skip: undefined }];

  it("keeps the header and replaces only the array", () => {
    const out = renderStore(empty, "THINGS", "Thing", records);
    expect(out.startsWith(`import type { Thing } from "./types";\n\n/* Header comment that must survive. */\n`)).toBe(true);
    expect(out).toContain("GENERATED by scripts/packaging-import.mts");
    expect(out.endsWith("];\n")).toBe(true);
    expect(evalStore(out, "THINGS", "Thing")).toEqual([{ id: "a", n: 1, nested: { x: "y", z: [1, 2] }, list: [], quoted: 'say "hi"\nnext', maybe: null }]);
  });

  it("formats like the rest of the repo: double quotes, two space indent, trailing commas", () => {
    const out = renderStore(empty, "THINGS", "Thing", [{ id: "a", credentials: [{ kind: "gmp", verified: false }], "odd-key": 1 }]);
    expect(out).toContain([
      "export const THINGS: Thing[] = [",
      "  {",
      '    id: "a",',
      '    credentials: [{ kind: "gmp", verified: false }],',
      '    "odd-key": 1,',
      "  },",
      "];",
    ].join("\n"));
  });

  it("is idempotent, and importing nothing gives back the pristine empty file", () => {
    const once = renderStore(empty, "THINGS", "Thing", records);
    expect(renderStore(once, "THINGS", "Thing", records)).toBe(once);
    expect(renderStore(once, "THINGS", "Thing", [])).toBe(empty);
    expect(renderStore(empty, "THINGS", "Thing", [])).toBe(empty);
  });

  it("refuses a file it does not recognise instead of clobbering it", () => {
    expect(() => renderStore("export const OTHER = [];\n", "THINGS", "Thing", [])).toThrow(/could not find/);
    expect(() => renderStore(`${empty}export const EXTRA = 1;\n`, "THINGS", "Thing", [])).toThrow(/not the last statement/);
  });

  it("can replace every real store file", () => {
    for (const s of PACKAGING_STORES) {
      const src = fs.readFileSync(path.resolve(__dirname, "../data/packaging", s.file), "utf8");
      expect(() => renderStore(src, s.exportName, s.typeName, [])).not.toThrow();
    }
  });
});

describe("runImport (fixture folder in a scratch directory)", () => {
  const storeDir = path.resolve(__dirname, "../data/packaging");
  const scratch: string[] = [];
  const tmp = (label: string) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), `pkg-import-${label}-`)); scratch.push(d); return d; };
  afterEach(() => { for (const d of scratch.splice(0)) fs.rmSync(d, { recursive: true, force: true }); });

  const writeCsvs = (dir: string, rows: Rows) => {
    const inputs = toInputs(rows);
    for (const kind of Object.keys(PACKAGING_CSV_FILES) as CsvKind[]) fs.writeFileSync(path.join(dir, PACKAGING_CSV_FILES[kind]), inputs[kind]);
  };
  const snapshot = () => Object.fromEntries(PACKAGING_STORES.map((s) => [s.file, fs.readFileSync(path.join(storeDir, s.file), "utf8")]));

  it("writes four valid data files and leaves the real ones untouched", () => {
    const before = snapshot();
    const input = tmp("in");
    const out = tmp("out");
    writeCsvs(input, fixtureRows());

    const result = runImport(input, { storeDir, outDir: out, today: TODAY });
    expect(result.ok, result.ok ? "" : result.issues.map(formatIssue).join("\n")).toBe(true);
    if (!result.ok) return;
    expect(result.written.map((f) => path.basename(f)).sort()).toEqual(["offerings.ts", "products.ts", "suppliers.ts", "verifications.ts"]);

    for (const s of PACKAGING_STORES) {
      const text = fs.readFileSync(path.join(out, s.file), "utf8");
      expect(text).toContain(`import type { ${s.typeName} } from "./types";`);
      expect(text).toContain("GENERATED by scripts/packaging-import.mts");
      expect(text).not.toContain(String.fromCharCode(0x2014));
      expect(evalStore(text, s.exportName, s.typeName)).toEqual(JSON.parse(JSON.stringify(result.catalogue[s.kind])));
    }
    expect(snapshot()).toEqual(before);
  });

  it("produces identical files when run twice on the same spreadsheet", () => {
    const input = tmp("in");
    writeCsvs(input, fixtureRows());
    const [a, b] = [tmp("a"), tmp("b")];
    runImport(input, { storeDir, outDir: a, today: TODAY });
    runImport(input, { storeDir, outDir: b, today: TODAY });
    for (const s of PACKAGING_STORES) expect(fs.readFileSync(path.join(a, s.file), "utf8")).toBe(fs.readFileSync(path.join(b, s.file), "utf8"));
  });

  it("writes nothing when any row is bad", () => {
    const rows = fixtureRows();
    rows.offerings[0].moqScope = "";
    const input = tmp("in");
    const out = tmp("out");
    writeCsvs(input, rows);
    const result = runImport(input, { storeDir, outDir: out, today: TODAY });
    expect(result.ok).toBe(false);
    expect(fs.readdirSync(out)).toEqual([]);
  });

  it("writes nothing on a dry run", () => {
    const input = tmp("in");
    const out = tmp("out");
    writeCsvs(input, fixtureRows());
    const result = runImport(input, { storeDir, outDir: out, dryRun: true, today: TODAY });
    expect(result.ok && result.written).toEqual([]);
    expect(fs.readdirSync(out)).toEqual([]);
  });

  it("names a missing CSV instead of treating it as empty", () => {
    const input = tmp("in");
    writeCsvs(input, fixtureRows());
    fs.rmSync(path.join(input, "verifications.csv"));
    const result = runImport(input, { storeDir, outDir: tmp("out"), today: TODAY });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues.map(formatIssue)[0]).toMatch(/^verifications\.csv: not found in /);
  });
});
