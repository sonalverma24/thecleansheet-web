/* Save a dated JSON copy of public.product_reviews to a local folder you choose.

   Why: when product_reviews was dropped, 143 reviews came back from a hand-made backup and the rest had to be
   regenerated with Gemini and Firecrawl at a cost. This makes the backup routine and free.

   What it does
     - Reads product_reviews with the production ANON key by default. RLS lets the anon key only select, so the
       read cannot change anything. If anon reads are blocked on the table, add --service-role (still only a SELECT).
     - Selects only allow-listed columns (src/lib/preview-seed.ts). The requester columns (requested_by_user_id,
       requested_by_email) are never selected, and neither is any column added to the table later.
     - Refuses a folder inside the repository (it is public) unless --allow-inside-repo is passed.
     - Writes product-reviews-<UTC date and time>.json, owner-readable only, and never overwrites a file.
     - The file holds a row count and a SHA-256 of its rows. It is read back and checked right after writing,
       and --verify checks any export again later without touching the network.
     - Reports any key inside a review's JSON that looks like a requester, user id or email (paths only, in
       the file's "warnings"). It does not remove them: a backup must hold each review exactly as stored.

   Setup: production's URL and anon key come from .env.local (NEXT_PUBLIC_SUPABASE_URL,
   NEXT_PUBLIC_SUPABASE_ANON_KEY). The file is read, not merged into process.env.

   Run
     npx tsx --tsconfig tsconfig.json scripts/export-product-reviews.mts --out-dir ~/Backups/cleansheet
     npx tsx --tsconfig tsconfig.json scripts/export-product-reviews.mts --count-only
     npx tsx --tsconfig tsconfig.json scripts/export-product-reviews.mts --verify ~/Backups/cleansheet/product-reviews-....json

   Options: --out-dir <folder> (required to export), --env <file> (default .env.local), --service-role (read with
            SUPABASE_SERVICE_ROLE_KEY instead of the anon key), --count-only, --verify <file>, --allow-inside-repo
   Take the export while no rebuild or backfill is writing to the table. A row count taken before and after the
   read is compared, and any difference is recorded as a warning.
   Exit code: 0 on success, 1 when a check refuses or any step fails. */
import { existsSync, mkdirSync, readFileSync, realpathSync, renameSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseEnv } from "node:util";
import { createClient } from "@supabase/supabase-js";
import {
  EXPORT_COLUMNS, buildExportFile, checkOutDir, exportFileName, fetchAllRows, verifyExportFile, type Row,
} from "./review-export";
import { projectRefFromUrl } from "./preview-seed";

const args = process.argv.slice(2);
const has = (name: string) => args.includes(name);
const flag = (name: string): string | undefined => {
  const i = args.indexOf(name);
  return i > -1 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : undefined;
};
const fail = (msg: string): never => {
  console.error(msg);
  process.exit(1);
};

/* --verify: check an export file. No network, no environment. */
if (has("--verify")) {
  const path = flag("--verify");
  if (!path) fail("--verify needs the path of an export file");
  const full = resolve(path as string);
  if (!existsSync(full)) fail(`no file at ${full}`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(full, "utf8"));
  } catch {
    fail(`${full} is not valid JSON`);
  }
  const problems = verifyExportFile(parsed);
  if (problems.length) fail(`NOT OK: ${full}\n  - ${problems.join("\n  - ")}`);
  const f = parsed as { count: number; exportedAt: string; project: string | null; warnings: string[] };
  console.log(`OK: ${full}\n  ${f.count} reviews, exported ${f.exportedAt} from project ${f.project ?? "(unknown)"}, ${f.warnings.length} warning(s)`);
  process.exit(0);
}

const repoRoot = process.cwd();
const outDirArg = flag("--out-dir");
const countOnly = has("--count-only");

/* Folder checks come first, so a bad folder is refused before anything is read. */
let outDir = "";
if (!countOnly) {
  if (!outDirArg) fail("--out-dir is required: name the folder the export should be saved in (or use --count-only / --verify)");
  const problems = checkOutDir(outDirArg as string, repoRoot, has("--allow-inside-repo"));
  const real = existsSync(resolve(outDirArg as string)) ? checkOutDir(realpathSync(resolve(outDirArg as string)), repoRoot, has("--allow-inside-repo")) : [];
  const all = [...new Set([...problems, ...real])];
  if (all.length) fail(`Refusing to export:\n  - ${all.join("\n  - ")}`);
  outDir = resolve(outDirArg as string);
}

const envPath = resolve(flag("--env") ?? ".env.local");
if (!existsSync(envPath)) fail(`env file not found at ${envPath}`);
const env = parseEnv(readFileSync(envPath, "utf8")) as Record<string, string | undefined>;
const url = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const useService = has("--service-role");
const key = (useService ? env.SUPABASE_SERVICE_ROLE_KEY : env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ?? "";
if (!url || !key) {
  fail(`${useService ? "SUPABASE_SERVICE_ROLE_KEY" : "NEXT_PUBLIC_SUPABASE_ANON_KEY"} and NEXT_PUBLIC_SUPABASE_URL must be set in ${envPath}`);
}
const project = projectRefFromUrl(url) ?? "(not a hosted supabase.co URL)";
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const countRows = async (): Promise<number> => {
  const { count, error } = await db.from("product_reviews").select("product_slug", { head: true, count: "exact" });
  if (error) fail(`could not count product_reviews: ${error.message}`);
  return count ?? 0;
};

console.log(`source: project ${project}, read with the ${useService ? "service-role" : "anon"} key (SELECT only)`);
const before = await countRows();
console.log(`product_reviews holds ${before} row(s)`);
if (countOnly) process.exit(0);

console.log(`exporting columns: ${EXPORT_COLUMNS.join(", ")}`);
let rawRows: Row[];
try {
  rawRows = await fetchAllRows(
    async (from, to) => {
      const { data, error } = await db.from("product_reviews").select(EXPORT_COLUMNS.join(", ")).order("product_slug", { ascending: true }).range(from, to);
      return { data: data as unknown as Row[] | null, error };
    },
  );
} catch (e) {
  fail(e instanceof Error ? e.message : String(e));
  throw e;
}
const after = await countRows();

const extraWarnings: string[] = [];
if (before !== after || rawRows.length !== after) {
  extraWarnings.push(`the row count changed while exporting (${before} before, ${rawRows.length} read, ${after} after); export again when nothing is writing to the table`);
}
const file = buildExportFile({ rawRows, exportedAt: new Date(), supabaseUrl: url, extraWarnings });

mkdirSync(outDir, { recursive: true, mode: 0o700 });
const finalPath = join(outDir, exportFileName(new Date(file.exportedAt)));
if (existsSync(finalPath)) fail(`${finalPath} already exists; nothing was overwritten`);
const partial = `${finalPath}.partial`;
writeFileSync(partial, JSON.stringify(file) + "\n", { flag: "wx", mode: 0o600 });
renameSync(partial, finalPath);

const problems = verifyExportFile(JSON.parse(readFileSync(finalPath, "utf8")));
if (problems.length) fail(`wrote ${finalPath} but it did not verify:\n  - ${problems.join("\n  - ")}`);

console.log(`\nwrote ${finalPath}`);
console.log(`  ${file.count} reviews, ${(statSync(finalPath).size / 1024 / 1024).toFixed(2)} MB, sha256 ${file.sha256.slice(0, 16)}...`);
console.log(`  never exported: requested_by_user_id, requested_by_email (and any column not listed above)`);
console.log(`  read back and verified: OK`);
if (file.warnings.length) {
  console.log(`\n${file.warnings.length} warning(s), also stored in the file:`);
  for (const w of file.warnings.slice(0, 10)) console.log(`  - ${w}`);
  if (file.warnings.length > 10) console.log(`  ...and ${file.warnings.length - 10} more`);
}
