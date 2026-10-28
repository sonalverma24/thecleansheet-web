/* Rules for scripts/export-product-reviews.mts, which saves a dated JSON copy of public.product_reviews
   to a local folder, so a dropped or damaged table never again has to be regenerated at AI cost.

   Pure: nothing here reads the network or the filesystem, so every rule is unit tested. Four rules matter:
     1. Only allow-listed columns are ever exported (the same list the preview seed uses). The requester
        columns (requested_by_user_id, requested_by_email) are never selected, and neither is any column
        added to the table later, so a new private column is left out by default instead of leaking by default.
     2. The file proves itself: a row count and a SHA-256 of the rows, checked again right after writing and
        by --verify, so a truncated or edited backup is caught before the day it is needed.
     3. The folder must be outside the repository. The repository is public and an export holds review data.
     4. Messages never contain a key or a stored value, only column names, slugs and key paths. */
import { createHash } from "node:crypto";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { PRIVATE_COLUMNS, PRODUCT_REVIEW_COLUMNS, findPrivateKeys, pickColumns, projectRefFromUrl } from "./preview-seed";

export const EXPORT_FORMAT = 1;
/** Columns written to the file. Anything else in the table is left out by default. */
export const EXPORT_COLUMNS: readonly string[] = PRODUCT_REVIEW_COLUMNS;
export const PAGE_SIZE = 100;
const MAX_KEY_WARNINGS = 50;

export type Row = Record<string, unknown>;

export interface ExportFile {
  format: number;
  table: "product_reviews";
  exportedAt: string;
  /** The Supabase project reference the rows came from (never a key), or null for a non-hosted URL. */
  project: string | null;
  columns: string[];
  count: number;
  sha256: string;
  warnings: string[];
  rows: Row[];
}

/** product-reviews-2026-10-23T02-49-04Z.json: UTC, sortable, and safe on every filesystem. */
export function exportFileName(now: Date): string {
  const stamp = now.toISOString().replace(/\.\d+Z$/, "Z").replace(/:/g, "-");
  return `product-reviews-${stamp}.json`;
}

/** SHA-256 of the rows exactly as they are written, in file order. */
export function rowsDigest(rows: Row[]): string {
  return createHash("sha256").update(JSON.stringify(rows)).digest("hex");
}

const slugOf = (r: Row): string => String(r.product_slug ?? "");

/** Allow-listed columns only, one row per slug, ordered by slug so two exports of the same data match. */
export function sanitizeRows(raw: Row[]): { rows: Row[]; privateColumnRows: number; duplicates: number } {
  let privateColumnRows = 0;
  let duplicates = 0;
  const seen = new Set<string>();
  const rows: Row[] = [];
  for (const r of raw) {
    if (PRIVATE_COLUMNS.some((c) => c in r)) privateColumnRows++;
    const slug = slugOf(r);
    if (seen.has(slug)) {
      duplicates++;
      continue;
    }
    seen.add(slug);
    rows.push(pickColumns(r, EXPORT_COLUMNS));
  }
  rows.sort((a, b) => (slugOf(a) < slugOf(b) ? -1 : slugOf(a) > slugOf(b) ? 1 : 0));
  return { rows, privateColumnRows, duplicates };
}

/** Paths (never values) of keys inside a review's JSON that look like a requester, user id or email.
    They are reported, not removed: a backup must hold the review exactly as stored. */
export function privateKeyWarnings(rows: Row[]): string[] {
  const all = rows.flatMap((r) => findPrivateKeys(r.result).map((p) => `${slugOf(r)}: result.${p}`));
  return all.length > MAX_KEY_WARNINGS ? [...all.slice(0, MAX_KEY_WARNINGS), `...and ${all.length - MAX_KEY_WARNINGS} more`] : all;
}

export function buildExportFile(input: {
  rawRows: Row[];
  exportedAt: Date;
  supabaseUrl: string;
  extraWarnings?: string[];
}): ExportFile {
  const { rows, privateColumnRows, duplicates } = sanitizeRows(input.rawRows);
  const warnings = [...(input.extraWarnings ?? [])];
  if (privateColumnRows) warnings.push(`${privateColumnRows} row(s) carried a private column; it was dropped`);
  if (duplicates) warnings.push(`${duplicates} duplicate row(s) were dropped (the table changed while it was being read)`);
  warnings.push(...privateKeyWarnings(rows));
  return {
    format: EXPORT_FORMAT,
    table: "product_reviews",
    exportedAt: input.exportedAt.toISOString(),
    project: projectRefFromUrl(input.supabaseUrl),
    columns: [...EXPORT_COLUMNS],
    count: rows.length,
    sha256: rowsDigest(rows),
    warnings,
    rows,
  };
}

/** Problems that make an export file untrustworthy. Empty means it is intact and holds no private column. */
export function verifyExportFile(file: unknown): string[] {
  if (!file || typeof file !== "object" || Array.isArray(file)) return ["the file is not a JSON object"];
  const f = file as Partial<ExportFile>;
  const problems: string[] = [];
  if (f.format !== EXPORT_FORMAT) problems.push(`unknown format ${String(f.format)} (expected ${EXPORT_FORMAT})`);
  if (f.table !== "product_reviews") problems.push("the file is not a product_reviews export");
  if (!Array.isArray(f.rows)) return [...problems, "the rows are missing"];

  const rows = f.rows as Row[];
  if (f.count !== rows.length) problems.push(`the file says ${String(f.count)} rows but holds ${rows.length}`);
  if (f.sha256 !== rowsDigest(rows)) problems.push("the checksum does not match the rows (the file was edited or damaged)");

  const allowed = new Set<string>(EXPORT_COLUMNS);
  const unexpected = new Set<string>();
  const seen = new Set<string>();
  let duplicates = 0;
  let incomplete = 0;
  for (const r of rows) {
    if (!r || typeof r !== "object") {
      incomplete++;
      continue;
    }
    for (const k of Object.keys(r)) if (!allowed.has(k)) unexpected.add(k);
    const slug = slugOf(r);
    if (!slug || r.result === undefined || r.result === null) incomplete++;
    if (seen.has(slug)) duplicates++;
    seen.add(slug);
  }
  const privateFound = [...unexpected].filter((c) => (PRIVATE_COLUMNS as readonly string[]).includes(c));
  if (privateFound.length) problems.push(`private column(s) present: ${privateFound.join(", ")}`);
  const others = [...unexpected].filter((c) => !privateFound.includes(c));
  if (others.length) problems.push(`unexpected column(s): ${others.join(", ")}`);
  if (duplicates) problems.push(`${duplicates} duplicate slug(s)`);
  if (incomplete) problems.push(`${incomplete} row(s) have no slug or no review`);
  return problems;
}

/** Reasons the export folder must not be used. Pass paths already resolved through symlinks where possible. */
export function checkOutDir(outDir: string, repoRoot: string, allowInsideRepo = false): string[] {
  if (!outDir || !outDir.trim()) return ["--out-dir is required: name the folder the export should be saved in"];
  const dir = resolve(outDir);
  const root = resolve(repoRoot);
  const rel = relative(root, dir);
  const inside = rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
  if (inside && !allowInsideRepo) {
    return [
      `${dir} is inside the repository (${root}). The repository is public and an export holds review data, so choose a folder outside it (or pass --allow-inside-repo for a gitignored folder)`,
    ];
  }
  return [];
}

export interface PageResult {
  data: Row[] | null;
  error: { message: string } | null;
}

/** Read every row, one page at a time. A short page is the end; an error names the rows it was reading. */
export async function fetchAllRows(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult>,
  pageSize = PAGE_SIZE,
  maxPages = 10_000,
): Promise<Row[]> {
  const all: Row[] = [];
  for (let page = 0; page < maxPages; page++) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await fetchPage(from, to);
    if (error) throw new Error(`reading rows ${from} to ${to} failed: ${error.message}`);
    const got = data ?? [];
    all.push(...got);
    if (got.length < pageSize) return all;
  }
  throw new Error(`stopped after ${maxPages} pages without reaching the end of the table`);
}
