import fs from "node:fs";
import path from "node:path";
import type {
  BrandingOption, BusinessType, Credential, EprInfo, EprStatus, EvidenceSource,
  EvidenceType, MaterialGroup, MoqScope, PackagingCatalogue, PackagingProduct, SampleAvailability,
  StockStatus, Supplier, SupplierOffering, VerificationOutcome, VerificationRecord,
} from "@/data/packaging/types";
import { PACKAGING_FAMILIES, MATERIAL_LABELS } from "@/data/packaging/families";
import { EVIDENCE_SOURCE_LABELS, EVIDENCE_TYPES, OUTCOME_LABELS } from "@/data/packaging/assessment";
import {
  BRANDING_LABELS, BUSINESS_TYPE_LABELS, CREDENTIAL_LABELS, EPR_LABELS, MOQ_SCOPE_LABELS,
  SAMPLE_LABELS, STOCK_LABELS,
} from "@/data/packaging/labels";
import { validateCatalogue } from "@/lib/packaging-catalogue";

/* CSV import for the packaging catalogue. TCS staff fill one spreadsheet per
   record type (suppliers, products, offerings, verifications); this module turns
   the exported CSVs into the four typed data files in src/data/packaging/.

   The rules of the directory are enforced here as well as by validateCatalogue:
   nothing is invented or defaulted into a claim. A blank MOQ is null with scope
   "unconfirmed", a blank repeat-supply answer is null, a blank stock or sample
   answer is "unconfirmed", and anything the types call required is rejected when
   blank. Every problem is reported with its file, row and column, and nothing is
   written unless the whole folder is clean. */

export const PACKAGING_CSV_FILES = {
  suppliers: "suppliers.csv",
  products: "products.csv",
  offerings: "offerings.csv",
  verifications: "verifications.csv",
} as const;

export type CsvKind = keyof typeof PACKAGING_CSV_FILES;
export const CSV_KINDS = Object.keys(PACKAGING_CSV_FILES) as CsvKind[];

/** Every column of every file, in the order the templates use. All columns must
    be present in the header; cells may be blank where the type allows. */
export const PACKAGING_CSV_COLUMNS: Record<CsvKind, readonly string[]> = {
  suppliers: [
    "id", "slug", "name", "businessType", "city", "state", "website", "yearEstablished", "about",
    "credentials", "contactPerson", "contactEmail", "contactPhone", "contactAgreedPublic",
    "eprStatus", "eprReference", "eprCheckedOn", "eprNote", "listedOn",
  ],
  products: [
    "id", "familyId", "name", "capacityValue", "capacityUnit", "material", "materialDetail",
    "containerStyle", "closure", "shape", "neckFinish", "pumpOutputMl", "childResistant",
    "tamperEvident", "pcrPercent", "lengthMm", "widthMm", "heightMm",
  ],
  offerings: [
    "id", "supplierId", "productId", "moqPieces", "moqScope", "branding", "stock",
    "leadTimeMinDays", "leadTimeMaxDays", "samples", "repeatSupplyConfirmed", "priceMinInr",
    "priceMaxInr", "priceAtQuantity", "priceQuotedOn", "priceGstIncluded", "paymentTerms", "note",
    "termsConfirmedOn",
  ],
  verifications: [
    "id", "supplierId", "offeringId", "evidence", "source", "outcome", "checkedOn", "scope",
    "limitations", "reviewer", "validUntil",
  ],
};

/** Template example rows carry this text, so an example left in by mistake is
    rejected instead of shipping as a supplier. */
export const TEMPLATE_SENTINEL = "FAKE EXAMPLE";

/* ── Issues ───────────────────────────────────────────────── */

export interface ImportIssue {
  file: string;
  /** Row as a spreadsheet shows it: the header is row 1. */
  row?: number;
  column?: string;
  message: string;
}

export function formatIssue(i: ImportIssue): string {
  const where = [i.row !== undefined ? ` row ${i.row}` : "", i.column ? `, column "${i.column}"` : ""].join("");
  return `${i.file}${where}: ${i.message}`;
}

/* ── CSV parsing ──────────────────────────────────────────── */

/** RFC 4180 parsing: quoted cells, doubled quotes, newlines inside quotes, CRLF,
    and the byte order mark Excel adds to "CSV UTF-8". Returns every record,
    blank ones included, so record n is spreadsheet row n. */
export function parseCsv(text: string): { records: string[][]; unterminatedAtRow?: number } {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const records: string[][] = [];
  let cells: string[] = [];
  let cell = "";
  let inQuotes = false;
  let quotedStartRow = 0;
  let cellStarted = false;
  const endCell = () => { cells.push(cell); cell = ""; cellStarted = false; };
  const endRecord = () => { endCell(); records.push(cells); cells = []; };

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++; } else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"' && !cellStarted) {
      inQuotes = true;
      cellStarted = true;
      quotedStartRow = records.length + 1;
    } else if (ch === ",") {
      endCell();
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      endRecord();
    } else {
      cell += ch;
      cellStarted = true;
    }
  }
  if (inQuotes) return { records, unterminatedAtRow: quotedStartRow };
  if (cell !== "" || cells.length > 0) endRecord();
  return { records };
}

interface Row {
  file: string;
  row: number;
  cells: Record<string, string>;
  /** A cell-level problem was already reported; the row is not built, but its id
      still counts so other rows referring to it do not cascade into noise. */
  bad: boolean;
}

const EM_DASH = String.fromCharCode(0x2014);

const closest = (value: string, options: readonly string[], maxDistance = 2): string | undefined => {
  const v = value.toLowerCase();
  let best: string | undefined;
  let bestDistance = maxDistance + 1;
  for (const o of options) {
    const d = editDistance(v, o.toLowerCase());
    if (d < bestDistance) { best = o; bestDistance = d; }
  }
  return best;
};

function editDistance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const up = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = up;
    }
  }
  return prev[b.length];
}

/** Reads one CSV into rows. Skips blank rows and rows whose first cell starts
    with "#" (comments, used by the templates). */
function readTable(kind: CsvKind, text: string, issues: ImportIssue[]): Row[] {
  const file = PACKAGING_CSV_FILES[kind];
  const expected = PACKAGING_CSV_COLUMNS[kind];
  const { records, unterminatedAtRow } = parseCsv(text);
  if (unterminatedAtRow !== undefined) {
    issues.push({ file, row: unterminatedAtRow, message: "a quoted cell is never closed (missing closing double quote)" });
    return [];
  }
  const headerCells = records[0]?.map((c) => c.trim()) ?? [];
  if (headerCells.every((c) => c === "") || headerCells[0].startsWith("#")) {
    issues.push({ file, row: 1, message: `row 1 must be the header row (${expected.join(", ")})` });
    return [];
  }
  if (headerCells.length === 1 && /[;\t]/.test(headerCells[0])) {
    issues.push({ file, row: 1, message: "the header is not comma separated; export as CSV (comma separated), not semicolon or tab separated" });
    return [];
  }

  const byLower = new Map(expected.map((c) => [c.toLowerCase(), c]));
  const columns: (string | undefined)[] = [];
  const seen = new Set<string>();
  let headerOk = true;
  headerCells.forEach((raw, idx) => {
    if (raw === "") { columns.push(undefined); return; }
    const canonical = byLower.get(raw.toLowerCase());
    if (!canonical) {
      const hint = closest(raw, expected);
      issues.push({ file, row: 1, column: raw, message: `unknown column${hint ? ` (did you mean "${hint}"?)` : ""}` });
      headerOk = false;
      columns.push(undefined);
      return;
    }
    if (seen.has(canonical)) {
      issues.push({ file, row: 1, column: raw, message: `column appears twice (column ${idx + 1})` });
      headerOk = false;
    }
    seen.add(canonical);
    columns.push(canonical);
  });
  for (const c of expected) {
    if (!seen.has(c)) { issues.push({ file, row: 1, column: c, message: "column is missing from the header" }); headerOk = false; }
  }
  if (!headerOk) return [];

  const rows: Row[] = [];
  records.slice(1).forEach((record, i) => {
    const rowNumber = i + 2;
    if (record.every((c) => c.trim() === "") || record[0].trim().startsWith("#")) return;
    const cells: Record<string, string> = {};
    let rowOk = true;
    record.forEach((raw, idx) => {
      const value = raw.trim();
      const column = columns[idx];
      if (!column) {
        if (value !== "") {
          issues.push({ file, row: rowNumber, message: `has a value in cell ${idx + 1}, beyond the header columns` });
          rowOk = false;
        }
        return;
      }
      if (value.includes(EM_DASH)) {
        issues.push({ file, row: rowNumber, column, message: "contains an em dash; replace it with a hyphen, a colon, or reword" });
        rowOk = false;
      }
      if (value.toLowerCase().includes(TEMPLATE_SENTINEL.toLowerCase())) {
        issues.push({ file, row: rowNumber, column, message: `looks like the template example row (it contains "${TEMPLATE_SENTINEL}"); delete the row` });
        rowOk = false;
      }
      cells[column] = value;
    });
    rows.push({ file, row: rowNumber, cells, bad: !rowOk });
  });
  return rows;
}

/* ── Cell readers ─────────────────────────────────────────── */

const keysOf = <K extends string>(r: Record<K, unknown>) => Object.keys(r) as K[];

const BUSINESS_TYPES = keysOf(BUSINESS_TYPE_LABELS);
const CREDENTIAL_KINDS = keysOf(CREDENTIAL_LABELS);
const EPR_STATUSES = keysOf(EPR_LABELS);
const MATERIALS = keysOf(MATERIAL_LABELS);
const BRANDING_OPTIONS = keysOf(BRANDING_LABELS);
const MOQ_SCOPES = keysOf(MOQ_SCOPE_LABELS);
const STOCK_STATUSES = keysOf(STOCK_LABELS);
const SAMPLE_OPTIONS = keysOf(SAMPLE_LABELS);
const EVIDENCE = keysOf(EVIDENCE_TYPES);
const SOURCES = keysOf(EVIDENCE_SOURCE_LABELS);
const OUTCOMES = keysOf(OUTCOME_LABELS);
const CAPACITY_UNITS = ["ml", "g"] as const;

const ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_MS = 24 * 60 * 60 * 1000;

function parseIsoDate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d ? date : null;
}

class RowReader {
  failed = false;
  constructor(private row: Row, private issues: ImportIssue[], private today: Date) {}

  fail(column: string, message: string): undefined {
    this.issues.push({ file: this.row.file, row: this.row.row, column, message });
    this.failed = true;
    return undefined;
  }

  text(column: string): string | undefined {
    const v = this.row.cells[column] ?? "";
    return v === "" ? undefined : v;
  }

  required(column: string): string | undefined {
    return this.text(column) ?? this.fail(column, "required but blank");
  }

  id(column: string, required = true): string | undefined {
    const v = required ? this.required(column) : this.text(column);
    if (v !== undefined && !ID.test(v)) return this.fail(column, `"${v}" is not a valid id (letters, digits, hyphen, dot and underscore only, no spaces)`);
    return v;
  }

  slug(column: string): string | undefined {
    const v = this.required(column);
    if (v !== undefined && !SLUG.test(v)) return this.fail(column, `"${v}" is not a slug (lowercase letters, digits and single hyphens, e.g. "acme-glass")`);
    return v;
  }

  private match<T extends string>(raw: string, allowed: readonly T[]): T | undefined {
    const normal = raw.trim().toLowerCase().replace(/\s+/g, "-");
    return allowed.find((a) => a === normal);
  }

  private enumError<T extends string>(raw: string, allowed: readonly T[]): string {
    const hint = closest(raw, allowed);
    return `"${raw}" is not valid; use one of: ${allowed.join(", ")}${hint ? ` (did you mean "${hint}"?)` : ""}`;
  }

  enumOf<T extends string>(column: string, allowed: readonly T[]): T | undefined {
    const v = this.required(column);
    if (v === undefined) return undefined;
    return this.match(v, allowed) ?? this.fail(column, this.enumError(v, allowed));
  }

  /** Blank returns undefined without an issue. */
  optionalEnum<T extends string>(column: string, allowed: readonly T[]): T | undefined {
    const v = this.text(column);
    if (v === undefined) return undefined;
    return this.match(v, allowed) ?? this.fail(column, this.enumError(v, allowed));
  }

  /** A `;` separated list of enum values. */
  enumList<T extends string>(column: string, allowed: readonly T[], required: boolean): T[] | undefined {
    const v = required ? this.required(column) : this.text(column);
    if (v === undefined) return undefined;
    const out: T[] = [];
    for (const part of v.split(";").map((p) => p.trim()).filter(Boolean)) {
      const hit = this.match(part, allowed);
      if (!hit) return this.fail(column, this.enumError(part, allowed));
      if (out.includes(hit)) return this.fail(column, `"${hit}" is listed twice`);
      out.push(hit);
    }
    if (out.length === 0 && required) return this.fail(column, "required but blank");
    return out;
  }

  bool(column: string): boolean | undefined {
    const v = this.text(column);
    if (v === undefined) return undefined;
    const l = v.toLowerCase();
    if (["true", "yes", "y"].includes(l)) return true;
    if (["false", "no", "n"].includes(l)) return false;
    return this.fail(column, `"${v}" is not yes or no`);
  }

  requiredBool(column: string): boolean | undefined {
    if (this.text(column) === undefined) return this.fail(column, "required but blank (yes or no)");
    return this.bool(column);
  }

  number(column: string, o: { integer?: boolean; min?: number; max?: number; positive?: boolean; required?: boolean } = {}): number | undefined {
    const v = o.required ? this.required(column) : this.text(column);
    if (v === undefined) return undefined;
    if (!/^\d+(\.\d+)?$/.test(v)) {
      return this.fail(column, `"${v}" is not a number (digits only: no commas, currency symbols or units)`);
    }
    const n = Number(v);
    if (o.integer && !Number.isInteger(n)) return this.fail(column, `"${v}" is not a whole number`);
    if (o.positive && !(n > 0)) return this.fail(column, `"${v}" must be greater than 0`);
    if (o.min !== undefined && n < o.min) return this.fail(column, `"${v}" must be at least ${o.min}`);
    if (o.max !== undefined && n > o.max) return this.fail(column, `"${v}" must be at most ${o.max}`);
    return n;
  }

  date(column: string, o: { required?: boolean; allowFuture?: boolean } = {}): string | undefined {
    const v = o.required ? this.required(column) : this.text(column);
    if (v === undefined) return undefined;
    const d = parseIsoDate(v);
    if (!d) {
      return this.fail(column, `"${v}" is not a valid date; use YYYY-MM-DD, e.g. 2026-10-15 (spreadsheets reformat dates, so set the column to plain text before typing)`);
    }
    if (!o.allowFuture && d.getTime() > this.today.getTime() + DAY_MS) {
      return this.fail(column, `"${v}" is in the future; this date records something that already happened`);
    }
    return v;
  }

  url(column: string): string | undefined {
    const v = this.text(column);
    if (v === undefined) return undefined;
    try {
      const u = new URL(v);
      if (u.protocol === "http:" || u.protocol === "https:") return v;
    } catch { /* falls through */ }
    return this.fail(column, `"${v}" is not a web address; start it with https:// or http://`);
  }

  email(column: string): string | undefined {
    const v = this.text(column);
    if (v === undefined) return undefined;
    return EMAIL.test(v) ? v : this.fail(column, `"${v}" is not an email address`);
  }
}

/** Keeps only the keys that have a value, so absent stays absent in the output. */
function compact<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

/* ── Row builders ─────────────────────────────────────────── */

/** `credentials` holds entries separated by `;`. Each entry is the kind, then
    optional `|`-separated parts: `verified`, `ref=<certificate number>`,
    `label=<text>`. Example: `iso-9001|verified|ref=ABC-123; other|label=Halal board`. */
function readCredentials(r: RowReader, column: string): Credential[] | undefined {
  const raw = r.text(column);
  if (raw === undefined) return [];
  const out: Credential[] = [];
  for (const entry of raw.split(";").map((e) => e.trim()).filter(Boolean)) {
    const [kindRaw, ...parts] = entry.split("|").map((p) => p.trim());
    const kind = CREDENTIAL_KINDS.find((k) => k === kindRaw.toLowerCase().replace(/\s+/g, "-"));
    if (!kind) {
      const hint = closest(kindRaw, CREDENTIAL_KINDS);
      return r.fail(column, `credential "${kindRaw}" is not valid; use one of: ${CREDENTIAL_KINDS.join(", ")}${hint ? ` (did you mean "${hint}"?)` : ""}`);
    }
    let verified = false;
    let label: string | undefined;
    let reference: string | undefined;
    for (const part of parts) {
      if (part.toLowerCase() === "verified") verified = true;
      else if (/^label=/i.test(part)) label = part.slice(part.indexOf("=") + 1).trim() || undefined;
      else if (/^ref=/i.test(part)) reference = part.slice(part.indexOf("=") + 1).trim() || undefined;
      else return r.fail(column, `"${part}" in the ${kind} entry is not understood; use verified, ref=<number> or label=<text>`);
    }
    if (kind === "other" && !label) return r.fail(column, `the "other" credential needs a name, e.g. other|label=Halal board`);
    out.push(compact({ kind, label, verified, reference }));
  }
  return out;
}

function readSupplier(row: Row, issues: ImportIssue[], today: Date): Supplier | undefined {
  const r = new RowReader(row, issues, today);
  const id = r.id("id");
  const slug = r.slug("slug");
  const name = r.required("name");
  const businessType = r.enumOf<BusinessType>("businessType", BUSINESS_TYPES);
  const city = r.required("city");
  const state = r.required("state");
  const website = r.url("website");
  const yearEstablished = r.number("yearEstablished", { integer: true, min: 1800, max: today.getUTCFullYear() });
  const about = r.text("about");
  const credentials = readCredentials(r, "credentials");

  const person = r.text("contactPerson");
  const email = r.email("contactEmail");
  const phone = r.text("contactPhone");
  const agreed = r.bool("contactAgreedPublic");
  let contact: Supplier["contact"];
  if (person || email || phone) {
    if (agreed !== true) {
      r.fail("contactAgreedPublic", "contact details are public, so this must be yes, and only when the supplier agreed to a public contact; otherwise clear the contact columns");
    } else contact = compact({ email, phone, person });
  } else if (agreed === true) {
    r.fail("contactAgreedPublic", "is yes but no contact details are filled in");
  }

  const eprStatus = r.optionalEnum<EprStatus>("eprStatus", EPR_STATUSES);
  const eprReference = r.text("eprReference");
  const eprCheckedOn = r.date("eprCheckedOn");
  const eprNote = r.text("eprNote");
  let epr: EprInfo | undefined;
  if (eprStatus) epr = compact({ status: eprStatus, reference: eprReference, checkedOn: eprCheckedOn, note: eprNote });
  else if (eprReference || eprCheckedOn || eprNote) r.fail("eprStatus", "required when any other eprX column is filled");

  const listedOn = r.date("listedOn", { required: true });
  if (r.failed || !id || !slug || !name || !businessType || !city || !state || !credentials || !listedOn) return undefined;
  return compact({ id, slug, name, businessType, city, state, website, yearEstablished, about, credentials, contact, epr, listedOn });
}

function readProduct(row: Row, issues: ImportIssue[], today: Date): PackagingProduct | undefined {
  const r = new RowReader(row, issues, today);
  const id = r.id("id");
  const familyId = r.required("familyId");
  const name = r.required("name");

  const capacityValue = r.number("capacityValue", { positive: true });
  const capacityUnit = r.optionalEnum("capacityUnit", CAPACITY_UNITS);
  let capacity: PackagingProduct["capacity"];
  if (capacityValue !== undefined && capacityUnit) capacity = { value: capacityValue, unit: capacityUnit };
  else if (capacityValue !== undefined) r.fail("capacityUnit", "required when capacityValue is given (ml or g)");
  else if (capacityUnit) r.fail("capacityValue", "required when capacityUnit is given");

  const material = r.enumOf<MaterialGroup>("material", MATERIALS);
  const materialDetail = r.text("materialDetail");
  const containerStyle = r.required("containerStyle");
  const closure = r.required("closure");
  const shape = r.text("shape");
  const neckFinish = r.text("neckFinish");
  const pumpOutputMl = r.number("pumpOutputMl", { positive: true });
  const childResistant = r.bool("childResistant");
  const tamperEvident = r.bool("tamperEvident");
  const pcrPercent = r.number("pcrPercent", { min: 0, max: 100 });

  const length = r.number("lengthMm", { positive: true });
  const width = r.number("widthMm", { positive: true });
  const height = r.number("heightMm", { positive: true });
  let dimensionsMm: PackagingProduct["dimensionsMm"];
  const given = [length, width, height].filter((d) => d !== undefined).length;
  if (given === 3) dimensionsMm = { length: length!, width: width!, height: height! };
  else if (given > 0) {
    for (const [col, v] of [["lengthMm", length], ["widthMm", width], ["heightMm", height]] as const) {
      if (v === undefined && r.text(col) === undefined) r.fail(col, "required when any dimension is given (give all three or none)");
    }
  }

  if (r.failed || !id || !familyId || !name || !material || !containerStyle || !closure) return undefined;
  return compact({
    id, familyId, name, capacity, material, materialDetail, containerStyle, closure, shape, neckFinish,
    pumpOutputMl, childResistant, tamperEvident, pcrPercent, dimensionsMm,
  });
}

function readOffering(row: Row, issues: ImportIssue[], today: Date): SupplierOffering | undefined {
  const r = new RowReader(row, issues, today);
  const id = r.id("id");
  const supplierId = r.id("supplierId");
  const productId = r.id("productId");

  const moqPieces = r.number("moqPieces", { integer: true, positive: true });
  const moqScopeCell = r.optionalEnum<MoqScope>("moqScope", MOQ_SCOPES);
  let moqScope: MoqScope | undefined;
  if (r.text("moqPieces") === undefined) {
    if (moqScopeCell && moqScopeCell !== "unconfirmed") r.fail("moqScope", `is "${moqScopeCell}" but moqPieces is blank; leave both blank when the MOQ is not confirmed`);
    else moqScope = "unconfirmed";
  } else if (moqPieces !== undefined) {
    if (moqScopeCell && moqScopeCell !== "unconfirmed") moqScope = moqScopeCell;
    else if (moqScopeCell === "unconfirmed" || r.text("moqScope") === undefined) {
      r.fail("moqScope", "required with a MOQ: say what it covers (complete-assembly, container-only or closure-only)");
    }
  }

  const branding = r.enumList<BrandingOption>("branding", BRANDING_OPTIONS, true);
  const stock = r.optionalEnum<StockStatus>("stock", STOCK_STATUSES) ?? "unconfirmed";

  const ltMin = r.number("leadTimeMinDays", { integer: true });
  const ltMax = r.number("leadTimeMaxDays", { integer: true });
  let leadTimeDays: SupplierOffering["leadTimeDays"];
  if (ltMin !== undefined && ltMax !== undefined) {
    if (ltMax < ltMin) r.fail("leadTimeMaxDays", "is below leadTimeMinDays");
    else leadTimeDays = { min: ltMin, max: ltMax };
  } else if (ltMin !== undefined) r.fail("leadTimeMaxDays", "required when leadTimeMinDays is given");
  else if (ltMax !== undefined) r.fail("leadTimeMinDays", "required when leadTimeMaxDays is given");

  const samples = r.optionalEnum<SampleAvailability>("samples", SAMPLE_OPTIONS) ?? "unconfirmed";
  const repeatSupplyConfirmed = r.bool("repeatSupplyConfirmed") ?? null;

  const priceCols = ["priceMinInr", "priceMaxInr", "priceAtQuantity", "priceQuotedOn", "priceGstIncluded"];
  let price: SupplierOffering["price"];
  if (priceCols.some((c) => r.text(c) !== undefined)) {
    const min = r.number("priceMinInr", { positive: true, required: true });
    const max = r.number("priceMaxInr", { positive: true });
    const atQuantity = r.number("priceAtQuantity", { integer: true, positive: true, required: true });
    const quotedOn = r.date("priceQuotedOn", { required: true });
    const gstIncluded = r.requiredBool("priceGstIncluded");
    if (max !== undefined && min !== undefined && max < min) r.fail("priceMaxInr", "is below priceMinInr");
    if (min !== undefined && atQuantity !== undefined && quotedOn && gstIncluded !== undefined) {
      price = { perPieceInr: compact({ min, max }), atQuantity, quotedOn, gstIncluded };
    }
  }

  const paymentTerms = r.text("paymentTerms");
  const note = r.text("note");
  const termsConfirmedOn = r.date("termsConfirmedOn");

  if (r.failed || !id || !supplierId || !productId || !moqScope || !branding) return undefined;
  return compact({
    id, supplierId, productId, moqPieces: moqPieces ?? null, moqScope, branding, stock, leadTimeDays, samples,
    repeatSupplyConfirmed, price, paymentTerms, note, termsConfirmedOn,
  });
}

function readVerification(row: Row, issues: ImportIssue[], today: Date): VerificationRecord | undefined {
  const r = new RowReader(row, issues, today);
  const id = r.id("id");
  const supplierId = r.id("supplierId");
  const offeringId = r.id("offeringId", false);
  const evidence = r.enumOf<EvidenceType>("evidence", EVIDENCE);
  const source = r.enumOf<EvidenceSource>("source", SOURCES);
  const outcome = r.enumOf<VerificationOutcome>("outcome", OUTCOMES);
  const checkedOn = r.date("checkedOn", { required: true });
  const scope = r.required("scope");
  const limitations = r.required("limitations");
  const reviewer = r.required("reviewer");
  const validUntil = r.date("validUntil", { allowFuture: true });
  if (validUntil && checkedOn && validUntil < checkedOn) r.fail("validUntil", "is before checkedOn");

  if (r.failed || !id || !supplierId || !evidence || !source || !outcome || !checkedOn || !scope || !limitations || !reviewer) return undefined;
  return compact({ id, supplierId, offeringId, evidence, source, outcome, checkedOn, scope, limitations, reviewer, validUntil });
}

/* ── Whole-import validation ──────────────────────────────── */

export interface ImportCounts { suppliers: number; products: number; offerings: number; verifications: number }

export type ImportResult =
  | { ok: true; catalogue: PackagingCatalogue; counts: ImportCounts; warnings: string[] }
  | { ok: false; issues: ImportIssue[] };

/** validateCatalogue speaks in ids; this finds the row and column to point at. */
const VALIDATOR_COLUMNS: [RegExp, string][] = [
  [/is not a slug/, "slug"], [/credential .* verified/, "credentials"], [/epr\.checkedOn/, "eprCheckedOn"],
  [/listedOn/, "listedOn"], [/unknown family/, "familyId"], [/pcrPercent/, "pcrPercent"],
  [/capacity/, "capacityValue"], [/unknown supplier/, "supplierId"], [/unknown product/, "productId"],
  [/already offers/, "productId"], [/MOQ must be/, "moqPieces"], [/MOQ|scope is claimed/, "moqScope"],
  [/branding/, "branding"], [/price max/, "priceMaxInr"], [/quotedOn/, "priceQuotedOn"],
  [/price/, "priceMinInr"], [/lead time/, "leadTimeMaxDays"], [/termsConfirmedOn/, "termsConfirmedOn"],
  [/unknown offering|different supplier/, "offeringId"], [/validUntil/, "validUntil"],
  [/checkedOn/, "checkedOn"], [/scope is empty/, "scope"], [/limitations/, "limitations"],
  [/reviewer/, "reviewer"],
];

const RECORD_PREFIX: Record<string, CsvKind> = {
  Supplier: "suppliers", Product: "products", Offering: "offerings", Verification: "verifications",
};

function attribute(problem: string, rowOf: Map<string, Row>): ImportIssue {
  const m = /^(Supplier|Product|Offering|Verification) (\S+?):/.exec(problem);
  if (m) {
    const kind = RECORD_PREFIX[m[1]];
    const row = rowOf.get(`${kind}|${m[2]}`);
    if (row) {
      const column = VALIDATOR_COLUMNS.find(([re]) => re.test(problem))?.[1];
      return { file: row.file, row: row.row, column, message: problem };
    }
  }
  return { file: "catalogue", message: problem };
}

export function buildCatalogueFromCsv(
  inputs: Record<CsvKind, string>,
  opts: { today?: Date } = {},
): ImportResult {
  const today = opts.today ?? new Date();
  const issues: ImportIssue[] = [];
  const tables = Object.fromEntries(CSV_KINDS.map((k) => [k, readTable(k, inputs[k], issues)])) as Record<CsvKind, Row[]>;

  const rowOf = new Map<string, Row>();
  for (const kind of CSV_KINDS) {
    for (const row of tables[kind]) {
      const id = row.cells.id;
      if (!id) continue;
      const key = `${kind}|${id}`;
      const first = rowOf.get(key);
      if (first) issues.push({ file: row.file, row: row.row, column: "id", message: `"${id}" is already used on row ${first.row}; ids must be unique` });
      else rowOf.set(key, row);
    }
  }
  const slugRows = new Map<string, Row>();
  for (const row of tables.suppliers) {
    const slug = row.cells.slug;
    if (!slug) continue;
    const first = slugRows.get(slug);
    if (first) issues.push({ file: row.file, row: row.row, column: "slug", message: `"${slug}" is already used on row ${first.row}; slugs must be unique` });
    else slugRows.set(slug, row);
  }

  const catalogue: PackagingCatalogue = { families: PACKAGING_FAMILIES, suppliers: [], products: [], offerings: [], verifications: [] };
  for (const row of tables.suppliers) { if (row.bad) continue; const v = readSupplier(row, issues, today); if (v) catalogue.suppliers.push(v); }
  for (const row of tables.products) { if (row.bad) continue; const v = readProduct(row, issues, today); if (v) catalogue.products.push(v); }
  for (const row of tables.offerings) { if (row.bad) continue; const v = readOffering(row, issues, today); if (v) catalogue.offerings.push(v); }
  for (const row of tables.verifications) { if (row.bad) continue; const v = readVerification(row, issues, today); if (v) catalogue.verifications.push(v); }

  /* Cross references, checked on the raw cells so a typo in one column does not
     hide the others. */
  const has = (kind: CsvKind, id: string) => rowOf.has(`${kind}|${id}`);
  const familyIds = PACKAGING_FAMILIES.map((f) => f.id);
  const refIssue = (row: Row, column: string, value: string, what: string, ids: string[]) => {
    const hint = closest(value, ids, 3);
    issues.push({ file: row.file, row: row.row, column, message: `"${value}" is not a known ${what}${hint ? ` (did you mean "${hint}"?)` : ""}` });
  };
  const idsOf = (kind: CsvKind) => tables[kind].map((r) => r.cells.id).filter(Boolean);
  for (const row of tables.products) {
    const f = row.cells.familyId;
    if (f && !familyIds.includes(f)) refIssue(row, "familyId", f, "family id (see src/data/packaging/families.ts)", familyIds);
  }
  for (const row of tables.offerings) {
    const { supplierId: s, productId: p } = row.cells;
    if (s && !has("suppliers", s)) refIssue(row, "supplierId", s, "supplier id from suppliers.csv", idsOf("suppliers"));
    if (p && !has("products", p)) refIssue(row, "productId", p, "product id from products.csv", idsOf("products"));
  }
  for (const row of tables.verifications) {
    const { supplierId: s, offeringId: o } = row.cells;
    if (s && !has("suppliers", s)) refIssue(row, "supplierId", s, "supplier id from suppliers.csv", idsOf("suppliers"));
    if (o) {
      const offeringRow = rowOf.get(`offerings|${o}`);
      if (!offeringRow) refIssue(row, "offeringId", o, "offering id from offerings.csv", idsOf("offerings"));
      else if (s && offeringRow.cells.supplierId && offeringRow.cells.supplierId !== s) {
        issues.push({ file: row.file, row: row.row, column: "offeringId", message: `offering "${o}" belongs to supplier "${offeringRow.cells.supplierId}", not "${s}"` });
      }
    }
  }

  if (issues.length > 0) {
    const order = new Map(CSV_KINDS.map((k, i) => [PACKAGING_CSV_FILES[k] as string, i]));
    const sorted = issues
      .map((issue, i) => ({ issue, i }))
      .sort((a, b) => (order.get(a.issue.file) ?? 9) - (order.get(b.issue.file) ?? 9) || (a.issue.row ?? 0) - (b.issue.row ?? 0) || a.i - b.i)
      .map((x) => x.issue);
    return { ok: false, issues: sorted };
  }

  const problems = validateCatalogue(catalogue);
  if (problems.length > 0) return { ok: false, issues: problems.map((p) => attribute(p, rowOf)) };

  const warnings: string[] = [];
  for (const o of catalogue.offerings) {
    if (o.repeatSupplyConfirmed !== true) continue;
    const backed = catalogue.verifications.some((v) =>
      v.supplierId === o.supplierId && v.evidence === "repeat-supply-confirmation" && v.outcome === "confirmed"
      && (!v.offeringId || v.offeringId === o.id));
    if (!backed) {
      const row = rowOf.get(`offerings|${o.id}`);
      warnings.push(`${row?.file ?? "offerings.csv"} row ${row?.row}: "${o.id}" has repeatSupplyConfirmed=yes but verifications.csv has no confirmed repeat-supply-confirmation record for it; add one so the claim has evidence`);
    }
  }

  return {
    ok: true,
    catalogue,
    counts: {
      suppliers: catalogue.suppliers.length,
      products: catalogue.products.length,
      offerings: catalogue.offerings.length,
      verifications: catalogue.verifications.length,
    },
    warnings,
  };
}

/* ── Writing the data files ───────────────────────────────── */

const GENERATED_NOTE = `/* GENERATED by scripts/packaging-import.mts from the TCS packaging spreadsheet (CSV).
   Do not hand-edit: change the spreadsheet and re-run the import. */
`;

const IDENT = /^[A-Za-z_$][\w$]*$/;

/** TypeScript literal in the repo's style: double quotes, two space indent,
    trailing commas. Short nested values stay on one line. */
function literal(value: unknown, indent: number, forceBreak = false): string {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  const pad = "  ".repeat(indent);
  const inner = "  ".repeat(indent + 1);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const inline = `[${value.map((v) => literal(v, indent + 1)).join(", ")}]`;
    if (!forceBreak && !inline.includes("\n") && pad.length + inline.length <= 100) return inline;
    return `[\n${value.map((v) => `${inner}${literal(v, indent + 1)},\n`).join("")}${pad}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined);
  const key = (k: string) => (IDENT.test(k) ? k : JSON.stringify(k));
  const inline = `{ ${entries.map(([k, v]) => `${key(k)}: ${literal(v, indent + 1)}`).join(", ")} }`;
  if (!forceBreak && !inline.includes("\n") && pad.length + inline.length <= 100) return inline;
  return `{\n${entries.map(([k, v]) => `${inner}${key(k)}: ${literal(v, indent + 1)},\n`).join("")}${pad}}`;
}

/** Replaces the exported array in an existing store file and keeps everything
    above it (imports and the explanatory comment). Empty records give back the
    pristine empty file, so an empty import is a no-op. */
export function renderStore(source: string, exportName: string, typeName: string, records: readonly object[]): string {
  const decl = `export const ${exportName}: ${typeName}[] = `;
  const at = source.indexOf(decl);
  if (at < 0) throw new Error(`could not find "${decl.trim()}" in the existing data file`);
  const rest = source.slice(at + decl.length);
  if (!/^\[[\s\S]*\];\s*$/.test(rest)) {
    throw new Error(`${exportName} is not the last statement of its data file; refusing to overwrite it`);
  }
  const head = source.slice(0, at).replace(/\/\* GENERATED by scripts\/packaging-import\.mts[\s\S]*?\*\/\n$/, "");
  const body = records.length === 0
    ? "[]"
    : `[\n${records.map((r) => `  ${literal(r, 1, true)},\n`).join("")}]`;
  return `${head}${records.length === 0 ? "" : GENERATED_NOTE}${decl}${body};\n`;
}

export const PACKAGING_STORES = [
  { kind: "suppliers", file: "suppliers.ts", exportName: "SUPPLIERS", typeName: "Supplier" },
  { kind: "products", file: "products.ts", exportName: "PACKAGING_PRODUCTS", typeName: "PackagingProduct" },
  { kind: "offerings", file: "offerings.ts", exportName: "SUPPLIER_OFFERINGS", typeName: "SupplierOffering" },
  { kind: "verifications", file: "verifications.ts", exportName: "VERIFICATION_RECORDS", typeName: "VerificationRecord" },
] as const satisfies readonly { kind: CsvKind; file: string; exportName: string; typeName: string }[];

export interface RunImportOptions {
  /** Where the current store files are read from (header comments are kept). */
  storeDir: string;
  /** Where the new store files are written. Defaults to storeDir. */
  outDir?: string;
  /** Validate and report only; write nothing. */
  dryRun?: boolean;
  today?: Date;
}

export type RunImportResult =
  | { ok: true; counts: ImportCounts; warnings: string[]; catalogue: PackagingCatalogue; written: string[] }
  | { ok: false; issues: ImportIssue[] };

/** Reads the four CSVs from `inputDir`, validates them, and writes the four data
    files only if everything is clean. */
export function runImport(inputDir: string, opts: RunImportOptions): RunImportResult {
  const inputs = {} as Record<CsvKind, string>;
  const issues: ImportIssue[] = [];
  for (const kind of CSV_KINDS) {
    const file = PACKAGING_CSV_FILES[kind];
    try {
      inputs[kind] = fs.readFileSync(path.join(inputDir, file), "utf8");
    } catch {
      issues.push({ file, message: `not found in ${inputDir}; copy the template from scripts/packaging-templates/ (a file with only the header row is fine for a record type with no rows yet)` });
    }
  }
  if (issues.length > 0) return { ok: false, issues };

  const built = buildCatalogueFromCsv(inputs, { today: opts.today });
  if (!built.ok) return built;

  const outDir = opts.outDir ?? opts.storeDir;
  const rendered = PACKAGING_STORES.map((s) => ({
    path: path.join(outDir, s.file),
    text: renderStore(
      fs.readFileSync(path.join(opts.storeDir, s.file), "utf8"),
      s.exportName,
      s.typeName,
      built.catalogue[s.kind],
    ),
  }));
  const written: string[] = [];
  if (!opts.dryRun) {
    fs.mkdirSync(outDir, { recursive: true });
    for (const r of rendered) { fs.writeFileSync(r.path, r.text); written.push(r.path); }
  }
  return { ok: true, counts: built.counts, warnings: built.warnings, catalogue: built.catalogue, written };
}
