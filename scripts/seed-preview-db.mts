/* Seed the PREVIEW Supabase project with the public catalogue from production, so Vercel
   Preview deployments can render real review pages without ever touching production data.

   What it does
     - Reads product_reviews and ingredients from production with the production ANON key.
       RLS lets the anon key only select, so the source is read-only by construction.
     - Copies only allow-listed columns. The requester columns (requested_by_user_id,
       requested_by_email) are never copied, and neither is any column added to production later.
     - Refuses to run when the target is, or could be, the production project: same host, same
       project reference, a production key, a non-supabase.co host. See src/lib/preview-seed.ts.
     - Is a DRY RUN unless --apply is passed. A dry run reads production, runs every check and
       prints what would be written; it does not contact the preview project at all.
     - After --apply, checks the preview project for any requester value and fails if it finds one.

   Setup (the preview project must already have the migrations applied: init_schema and
   product_review_repository, in supabase/migrations/)
     1. Create a new Supabase project for previews. Never reuse the production one.
     2. Put its URL and service-role key in a local file that git ignores (.env* is ignored):
          .env.preview-seed
            PREVIEW_SUPABASE_URL=https://<preview-ref>.supabase.co
            PREVIEW_SUPABASE_SERVICE_ROLE_KEY=<preview service-role key>
        Production's URL and anon key are read from .env.local (NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY). Neither file is merged into process.env, so a shell that
        has production variables exported cannot leak into the target.

   Run (dry run first)
     npx tsx --tsconfig tsconfig.json scripts/seed-preview-db.mts
     npx tsx --tsconfig tsconfig.json scripts/seed-preview-db.mts --apply

   Options: --source-env <file> (default .env.local), --target-env <file> (default .env.preview-seed)
   Safe to re-run: rows are upserted on their natural key. Rows only in the preview are left alone.
   Exit code: 0 on success, 1 when a guard refuses or any step fails. */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseEnv } from "node:util";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  INGREDIENT_COLUMNS, PRIVATE_COLUMNS, PRODUCT_REVIEW_COLUMNS,
  checkTarget, findPrivateKeys, pickColumns,
} from "./preview-seed";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const flag = (name: string, fallback: string) => {
  const i = args.indexOf(name);
  return i > -1 && args[i + 1] ? args[i + 1] : fallback;
};
const fail = (msg: string): never => { console.error(msg); process.exit(1); };

function loadEnv(path: string, what: string): Record<string, string | undefined> {
  const full = resolve(path);
  if (!existsSync(full)) fail(`${what} env file not found at ${full}`);
  if (full.startsWith(process.cwd() + "/")) {
    const ignored = spawnSync("git", ["check-ignore", "-q", full], { cwd: process.cwd() }).status === 0;
    if (!ignored) console.warn(`WARNING: ${path} is inside the repository and is NOT gitignored. Keys in it could be committed.`);
  }
  return parseEnv(readFileSync(full, "utf8")) as Record<string, string | undefined>;
}

const sourceEnv = loadEnv(flag("--source-env", ".env.local"), "Source (production)");
const targetEnv = loadEnv(flag("--target-env", ".env.preview-seed"), "Target (preview)");

const source = {
  url: sourceEnv.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: sourceEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};
const target = {
  url: targetEnv.PREVIEW_SUPABASE_URL ?? "",
  serviceKey: targetEnv.PREVIEW_SUPABASE_SERVICE_ROLE_KEY ?? "",
};

const problems = checkTarget(source, target);
if (problems.length) {
  console.error("REFUSING to run. The preview target is not safe:");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
const targetHost = new URL(target.url).host;
const sourceHost = new URL(source.url).host;
console.log(`${apply ? "APPLY" : "DRY RUN"}: ${sourceHost} (production, read-only) -> ${targetHost} (preview)`);

const auth = { auth: { persistSession: false, autoRefreshToken: false } };
const prod = createClient(source.url, source.anonKey, auth);

type Row = Record<string, unknown>;
async function readAll(db: SupabaseClient, table: string, columns: readonly string[], orderBy: string, page: number): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += page) {
    const { data, error } = await db.from(table).select(columns.join(", ")).order(orderBy).range(from, from + page - 1);
    if (error) fail(`read of ${table} failed: ${error.message}`);
    const batch = (data ?? []) as unknown as Row[];
    rows.push(...batch);
    if (batch.length < page) break;
  }
  return rows;
}

const reviews = (await readAll(prod, "product_reviews", PRODUCT_REVIEW_COLUMNS, "product_slug", 100))
  .map((r) => pickColumns(r, PRODUCT_REVIEW_COLUMNS));
const ingredients = (await readAll(prod, "ingredients", INGREDIENT_COLUMNS, "slug", 1000))
  .map((r) => pickColumns(r, INGREDIENT_COLUMNS));

if (reviews.length === 0) fail("production returned no product_reviews. Refusing to continue: an empty read usually means the wrong URL or key.");
if (ingredients.length === 0) fail("production returned no ingredients. Refusing to continue.");

// A review's JSON should carry no requester field. Stop rather than copy a surprise.
const leaks = reviews.flatMap((r) => findPrivateKeys(r.result).map((p) => `${String(r.product_slug)}: result.${p}`));
if (leaks.length) {
  console.error(`REFUSING to run. ${leaks.length} key(s) inside review JSON look like requester data (first 10):`);
  for (const l of leaks.slice(0, 10)) console.error(`  - ${l}`);
  process.exit(1);
}

const tiers: Record<string, number> = {};
for (const r of reviews) tiers[String(r.tier)] = (tiers[String(r.tier)] ?? 0) + 1;
console.log(`read ${reviews.length} product_reviews and ${ingredients.length} ingredients from production`);
console.log(`product_reviews columns copied: ${PRODUCT_REVIEW_COLUMNS.join(", ")}`);
console.log(`never copied: ${PRIVATE_COLUMNS.join(", ")} (and any column not listed above)`);
console.log(`review tiers: ${JSON.stringify(tiers)}`);

if (!apply) {
  console.log("\nDry run only. Nothing was written and the preview project was not contacted.");
  console.log("Re-run with --apply to write these rows to the preview project.");
  process.exit(0);
}

const preview = createClient(target.url, target.serviceKey, auth);

for (const [table, col] of [["product_reviews", "product_slug"], ["ingredients", "inci_name"]] as const) {
  // A body-less HEAD request returns an empty error message, so use a real select that returns no rows.
  const { error } = await preview.from(table).select(col).limit(0);
  if (error) fail(`the preview project has no readable ${table} table (${error.code} ${error.message}). Apply the migrations in supabase/migrations/ to it first.`);
}

async function write(table: string, rows: Row[], onConflict: string, chunk: number): Promise<void> {
  for (let i = 0; i < rows.length; i += chunk) {
    const { error } = await preview.from(table).upsert(rows.slice(i, i + chunk), { onConflict });
    if (error) fail(`write to ${table} failed at row ${i}: ${error.message}`);
  }
  console.log(`wrote ${rows.length} rows to ${table}`);
}

await write("ingredients", ingredients, "inci_name", 500);
await write("product_reviews", reviews, "product_slug", 25);

// Verify: counts, and that no requester value exists in the preview project.
const count = async (table: string, col: string) => {
  const { count: n, error } = await preview.from(table).select(col, { head: true, count: "exact" });
  if (error) fail(`count of ${table} failed: ${error.message}`);
  return n ?? 0;
};
console.log(`preview now holds ${await count("product_reviews", "product_slug")} product_reviews and ${await count("ingredients", "inci_name")} ingredients`);

let leaked = 0;
for (const col of PRIVATE_COLUMNS) {
  // 42703 is Postgres "undefined column": the only error that means there is nothing to leak.
  // Any other error means the check could not run, which must not read as a pass.
  const exists = await preview.from("product_reviews").select(col).limit(0);
  if (exists.error?.code === "42703") { console.log(`check ${col}: column absent in the preview project (nothing to leak)`); continue; }
  if (exists.error) fail(`could not check ${col} in the preview project (${exists.error.code} ${exists.error.message})`);
  const { count: n, error } = await preview.from("product_reviews").select("product_slug", { head: true, count: "exact" }).not(col, "is", null);
  if (error) fail(`could not count ${col} in the preview project`);
  console.log(`check ${col}: ${n ?? 0} non-empty value(s)`);
  leaked += n ?? 0;
}
if (leaked > 0) fail(`FAILED: the preview project holds ${leaked} requester value(s). They did not come from this script. Clear them before sharing the preview.`);
console.log("\nDone. No requester data was copied or found in the preview project.");
