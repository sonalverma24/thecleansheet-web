/* Generates real reviews for the seven products on the home page shelf
   (SHELF_SEEDS in src/lib/home-shelf.ts), using the SAME pipeline as the /review tool.

   THIS SPENDS MONEY (Gemini and Firecrawl, billed to the keys in .env.local) AND WRITES TO PRODUCTION:
   the pipeline stores each review it generates in public.product_reviews. It only ever INSERTS or updates
   the review it just ran; it never drops, truncates or deletes anything.

   What protects you
     - Dry run unless --apply. A dry run makes ONE read-only SELECT and calls no model.
     - --apply needs --confirm-project <ref>, typed out, matching NEXT_PUBLIC_SUPABASE_URL.
     - --apply needs --expect-rubric <rev> equal to the RUBRIC_REV of the code being run. Production serves
       rubric_rev r7 (and r8); run this from a checkout of main, not a working folder with unreleased rubric changes.
     - --apply refuses to run if the review engine files have uncommitted changes.
     - A product production already has is skipped (no model call, no cost).
     - The run stops AT ONCE if a stored review is for a different product than the one asked for, or has a
       junk title (N/A, unknown, not identified). The pipeline has already stored it, so the slug is printed
       for review and removal.
     - Products run one at a time, so two products of one brand cannot race the pipeline's duplicate check.
     - Progress and results are written to --state after every product.

   Setup (from a checkout of main, with production's env):
     set -a; . ./.env.local; set +a
     npx tsx --tsconfig tsconfig.json scripts/home-shelf-reviews.mts
   Pilot (one product):
     npx tsx --tsconfig tsconfig.json scripts/home-shelf-reviews.mts --apply \
       --confirm-project <production ref> --expect-rubric r7 --only cosrx-bha-liquid

   Options: --only <key,key>, --limit <n>, --delay-ms <n> (default 2000), --state <path>, --apply,
            --confirm-project, --expect-rubric */
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { RUBRIC_REV, deriveVerdict, runProductReview } from "@/lib/product-review-engine";
import { SHELF_SEEDS, matchSeed, type ShelfSeed } from "@/lib/home-shelf";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const flag = (name: string, fallback?: string) => {
  const i = args.indexOf(name);
  return i > -1 && args[i + 1] ? args[i + 1] : fallback;
};
function fail(m: string): never {
  console.error(m);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (source .env.local first).");
const projectRef = new URL(url).host.split(".")[0];

const only = (flag("--only") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const unknown = only.filter((k) => !SHELF_SEEDS.some((s) => s.key === k));
if (unknown.length) fail(`Unknown product key(s): ${unknown.join(", ")}. Valid: ${SHELF_SEEDS.map((s) => s.key).join(", ")}`);
const limitRaw = flag("--limit");
const limit = limitRaw === undefined ? Infinity : Number(limitRaw);
if (!(limit > 0)) fail("--limit must be a positive number");
const delayMs = Number(flag("--delay-ms", "2000"));
const statePath = resolve(flag("--state", join(tmpdir(), "home-shelf-run.json"))!);

console.log(`Target project : ${projectRef}`);
console.log(`Rubric (code)  : ${RUBRIC_REV}`);
console.log(`Mode           : ${apply ? "APPLY (spends credit, writes to production)" : "dry run (one SELECT, no model calls)"}`);

if (apply) {
  if (flag("--confirm-project") !== projectRef) {
    fail(`--apply needs --confirm-project ${projectRef} (typed out) so the target is explicit.`);
  }
  if (flag("--expect-rubric") !== RUBRIC_REV) {
    fail(`--apply needs --expect-rubric ${RUBRIC_REV}, the RUBRIC_REV of this code. Production serves r7 and r8; run from a checkout of main.`);
  }
  const dirty = execFileSync("git", ["status", "--porcelain", "--", "src/lib/product-review-engine.ts", "src/lib/product-review-types.ts"], { encoding: "utf8" }).trim();
  if (dirty) fail(`Refusing to run: the review engine has uncommitted changes:\n${dirty}`);
}

const db = createClient(url!, serviceKey!, { auth: { persistSession: false } });

type Row = { product_slug: string; product_name: string | null; brand: string | null; tier: string | null };
const { data: existing, error } = await db
  .from("product_reviews")
  .select("product_slug, product_name, brand, tier")
  .or(["anua", "cosrx", "skin1004", "iunik"].map((b) => `brand.ilike.%${b}%`).join(","));
if (error) fail(`Could not read product_reviews: ${error.message}`);
const have = (existing ?? []) as Row[];

const plan = SHELF_SEEDS.filter((s) => only.length === 0 || only.includes(s.key)).map((seed) => {
  const hit = have.find((r) => matchSeed(seed, { brand: r.brand ?? "", productName: r.product_name ?? "" }));
  return { seed, hit };
});

console.log("\nPlan:");
for (const { seed, hit } of plan) {
  console.log(`  ${hit ? "have " : "NEW  "} ${seed.key.padEnd(28)} ${hit ? `${hit.product_slug} (${hit.tier})` : `will review "${seed.reviewQuery}"`}`);
}
const todo = plan.filter((p) => !p.hit).slice(0, limit);
console.log(`\n${todo.length} product(s) to review${apply ? "" : " (dry run: nothing was run)"}.`);
if (!apply) process.exit(0);
if (todo.length === 0) process.exit(0);

type Result = {
  key: string;
  query: string;
  outcome: "stored" | "not-a-review" | "mismatch" | "junk-title" | "error";
  slug?: string;
  brand?: string;
  name?: string;
  tier?: string;
  tierLabel?: string;
  claims?: number;
  imageUrl?: string | null;
  inciCount?: number;
  secs: number;
  detail?: string;
};
const results: Result[] = [];
const save = () => writeFileSync(statePath, JSON.stringify({ project: projectRef, rubric: RUBRIC_REV, at: new Date().toISOString(), results }, null, 2));
const JUNK = /^\s*(n\/?a|unknown|not identified|none)\s*$/i;

async function one(seed: ShelfSeed): Promise<Result> {
  const t0 = Date.now();
  const secs = () => Math.round((Date.now() - t0) / 1000);
  try {
    const res = await runProductReview(seed.reviewQuery);
    if (res.type !== "product-review") return { key: seed.key, query: seed.reviewQuery, outcome: "not-a-review", detail: `engine returned "${res.type}"`, secs: secs() };
    const r = res.review;
    const v = deriveVerdict(r);
    const base = {
      key: seed.key, query: seed.reviewQuery, slug: r.productSlug, brand: r.brand, name: r.productName,
      tier: v.tier, tierLabel: v.tierLabel, claims: r.claimSummary?.total, imageUrl: r.imageUrl ?? null,
      inciCount: r.inciIngredients?.length ?? 0, secs: secs(),
    };
    if (JUNK.test(r.productName ?? "") || JUNK.test(r.brand ?? "")) return { ...base, outcome: "junk-title" as const };
    if (!matchSeed(seed, { brand: r.brand ?? "", productName: r.productName ?? "" })) {
      return { ...base, outcome: "mismatch" as const, detail: "stored review is for a different product than the one asked for" };
    }
    return { ...base, outcome: "stored" as const };
  } catch (e) {
    return { key: seed.key, query: seed.reviewQuery, outcome: "error", detail: e instanceof Error ? e.message : String(e), secs: secs() };
  }
}

for (const [i, { seed }] of todo.entries()) {
  console.log(`\n[${i + 1}/${todo.length}] ${seed.key}: "${seed.reviewQuery}" ...`);
  const r = await one(seed);
  results.push(r);
  save();
  console.log(JSON.stringify(r, null, 2));
  if (r.outcome === "mismatch" || r.outcome === "junk-title") {
    console.error(`\nSTOPPED: ${r.outcome}. The pipeline already stored "${r.slug}". Inspect it and remove it with scripts/delete-review-row.mts if it is wrong, before running anything else.`);
    process.exit(2);
  }
  if (r.outcome !== "stored") {
    console.error(`\nSTOPPED: ${r.outcome}${r.detail ? ` (${r.detail})` : ""}. Nothing further was run.`);
    process.exit(3);
  }
  if (i < todo.length - 1) await new Promise((res) => setTimeout(res, delayMs));
}

console.log(`\nDone. ${results.length} review(s) stored. State: ${statePath}`);
for (const r of results) console.log(`  /reviews/${r.slug}  ${r.tierLabel}`);
