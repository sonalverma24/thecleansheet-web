/* Re-anchor stored ingredient lists: give a review the quoted source text it never kept.

   For each product_reviews row whose ingredient list came from an INCIDecoder product
   page (and, unless --only incidecoder, from a brand's own product page), re-fetch the
   page and compare it with the stored list under EXACT rules (see src/lib/inci-reanchor.ts):
   same brand, equal name tokens, the page's own title is the product's name, equal
   variant tokens, and an identical ordered inciKey sequence with duplicates counted.
   Only an exact match is anchorable. Everything else is queued with its diff for a
   person. No similarity threshold ever approves.

   Anchored means a quote was captured from a real source for a named product. It does
   not mean the formula is true, current for this SKU, or valid for a region or version.

   DRY RUN BY DEFAULT. Without --apply this only reads from the database and the network.
   With --apply it merges result.review.inciEvidence into `result` and writes the `result`
   column alone: tier, rubric_rev and verdict are never touched, and a row that changed
   since it was read is left alone. Re-run the census afterwards to see the effect.

   Run (dry run):
     set -a; . ./.env.local; set +a; npx tsx --tsconfig tsconfig.json scripts/reanchor-incidecoder.mts [options]
   Options:
     --apply              write the anchorable rows (omit for a dry run)
     --only incidecoder   or: brand        limit to one source kind (default: both)
     --slug <product_slug>                  one row only
     --limit <n>                            fetch at most n pages
     --delay-ms <n>                         pause before each fetch (default 1500)
     --out <file>                           report path (default reports/reanchor-incidecoder.json) */
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { RETRACTED_SLUGS } from "@/lib/product-review-engine";
import { fetchIncidecoderProduct } from "@/lib/inci-fetch";
import { fetchInciFromProductPage } from "@/lib/inci-from-page";
import {
  describeDiff, reanchorRows, snapshotFromIncidecoder, snapshotFromPage, summarise,
  type ReviewRowLike, type ReviewTable, type RowResult, type SnapshotFetch,
} from "@/lib/inci-reanchor";

const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(name);
const opt = (name: string) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : undefined);

const APPLY = flag("--apply");
const ONLY = opt("--only");
const SLUG = opt("--slug");
const LIMIT = opt("--limit") ? Number(opt("--limit")) : undefined;
const DELAY_MS = opt("--delay-ms") ? Number(opt("--delay-ms")) : 1500;
const OUT = opt("--out") ?? "reports/reanchor-incidecoder.json";

if (ONLY && ONLY !== "incidecoder" && ONLY !== "brand") { console.error('--only takes "incidecoder" or "brand"'); process.exit(1); }
if ((LIMIT !== undefined && !Number.isFinite(LIMIT)) || !Number.isFinite(DELAY_MS)) { console.error("--limit and --delay-ms take numbers"); process.exit(1); }
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Load .env.local first (see the header).");
  process.exit(1);
}
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/* ── Read ─────────────────────────────────────────────────────── */
const rows: ReviewRowLike[] = [];
for (let from = 0; ; from += 500) {
  const { data, error } = await db.from("product_reviews").select("product_slug, result").order("product_slug").range(from, from + 499);
  if (error) { console.error("read failed:", error.message); process.exit(1); }
  rows.push(...(data as ReviewRowLike[]));
  if (!data || data.length < 500) break;
}

/* ── Fetch, politely ──────────────────────────────────────────── */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const BACKOFF_MS = [5000, 15000];

async function fetchSnapshot(url: string, source: "incidecoder" | "brand_page"): Promise<SnapshotFetch> {
  for (let attempt = 0; ; attempt++) {
    await sleep(attempt === 0 ? DELAY_MS : BACKOFF_MS[attempt - 1]);
    const retrievedAt = new Date().toISOString();
    if (source === "incidecoder") {
      const got = await fetchIncidecoderProduct(url);
      if (got.status === "ok") return { status: "ok", snapshot: snapshotFromIncidecoder(got.result, url), retrievedAt };
      if (got.status === "no_list") return { status: "no_list", detail: "the page was retrieved but has no ingredient list the parser accepts" };
    } else {
      const got = await fetchInciFromProductPage(url);
      if (got) return { status: "ok", snapshot: snapshotFromPage(got), retrievedAt };
    }
    if (attempt >= BACKOFF_MS.length) {
      return source === "incidecoder"
        ? { status: "fetch_failed", detail: `no page after ${attempt + 1} attempts (network, HTTP error or rate limit)` }
        : { status: "no_list", detail: "no ingredient list returned (the page could not be fetched, or its list was not recognised)" };
    }
  }
}

/* ── The only write path, and it exists only under --apply ────── */
function makeTable(): ReviewTable {
  return {
    async readResult(slug) {
      const { data, error } = await db.from("product_reviews").select("result").eq("product_slug", slug).single();
      return error ? { error: error.message } : { result: data.result };
    },
    async writeResult(slug, result) {
      const { error } = await db.from("product_reviews").update({ result }).eq("product_slug", slug);
      return error ? { error: error.message } : {};
    },
  };
}

/* ── Run ──────────────────────────────────────────────────────── */
console.log(APPLY
  ? "APPLY: anchorable rows will be written (result.review.inciEvidence only)."
  : "DRY RUN: reads the database and the network only. Nothing is written. Pass --apply to write.");
const sources = new Set<"incidecoder" | "brand_page">(ONLY === "incidecoder" ? ["incidecoder"] : ONLY === "brand" ? ["brand_page"] : ["incidecoder", "brand_page"]);
let done = 0;
const results = await reanchorRows(rows, { fetchSnapshot, table: APPLY ? makeTable() : undefined }, {
  apply: APPLY, sources, slug: SLUG, limit: LIMIT,
  isRetracted: (s) => RETRACTED_SLUGS.has(s),
  onResult: (r) => {
    if (r.status === "skipped") return;
    done++;
    const tag = r.status === "queued" ? "queued    " : r.status === "anchorable" ? "anchorable" : "FAILED    ";
    process.stderr.write(`[${String(done).padStart(3)}] ${tag} ${r.source === "incidecoder" ? "incidecoder" : "brand page "} ${r.slug}\n`);
  },
});

/* ── Report ───────────────────────────────────────────────────── */
const summary = summarise(results);
const queued = results.filter((r): r is Extract<RowResult, { status: "queued" }> => r.status === "queued");
const failed = results.filter((r): r is Extract<RowResult, { status: "fetch_failed" | "no_list" }> => r.status === "fetch_failed" || r.status === "no_list");
const anchorable = results.filter((r): r is Extract<RowResult, { status: "anchorable" }> => r.status === "anchorable");

console.log(`\n── Queue: not anchorable, needs a person (${queued.length}) ──`);
for (const r of queued) {
  console.log(`\n${r.slug}  [${r.source}]  ${r.url}`);
  for (const f of r.decision.failures) console.log(`   ${f.code.padEnd(15)} ${f.detail}`);
}
const withProse = anchorable.filter((r) => r.decision.advisories.length);
if (withProse.length) {
  console.log(`\n── Anchorable, but entries read like page prose (advisory, not a rule; look before --apply) (${withProse.length}) ──`);
  for (const r of withProse) console.log(`${r.slug}  [${r.source}]\n   ${r.decision.advisories.slice(0, 4).map((e) => `"${e.slice(0, 90)}"`).join("  ")}`);
}
if (failed.length) {
  console.log(`\n── Fetch failures (${failed.length}) ──`);
  for (const r of failed) console.log(`${r.slug}  [${r.source}]  ${r.status}: ${r.detail}  ${r.url}`);
}

const bySource = (k: "incidecoder" | "brand_page") => ({
  anchorable: anchorable.filter((r) => r.source === k).length,
  queued: queued.filter((r) => r.source === k).length,
  fetchFailures: failed.filter((r) => r.source === k).length,
});
const inc = bySource("incidecoder"), brand = bySource("brand_page");
console.log(`\n── Counts (${APPLY ? "apply" : "dry run"}) ──`);
console.log(`anchorable ............ ${summary.anchorable}   (incidecoder ${inc.anchorable}, brand page ${brand.anchorable})`);
console.log(`  of which entries read like page prose (advisory) ... ${summary.anchorableWithProse}`);
console.log(`queued with diff ...... ${summary.queued}   (incidecoder ${inc.queued}, brand page ${brand.queued})`);
console.log(`fetch failures ........ ${summary.fetchFailures}   (${summary.fetchFailed} page not retrieved, ${summary.noList} no list on the page; incidecoder ${inc.fetchFailures}, brand page ${brand.fetchFailures})`);
console.log(`queued by rule ........ ${JSON.stringify(summary.queuedByReason)}   (a row can fail several rules)`);
console.log(`skipped (not fetched) . ${JSON.stringify(summary.skipped)}`);
if (APPLY) console.log(`written ................ ${summary.written}   left alone: ${summary.writeSkipped}`);
else console.log(`\nNothing was written. ${summary.anchorable} row(s) would be anchored by --apply.`);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({
  generatedAt: new Date().toISOString(),
  mode: APPLY ? "apply" : "dry-run",
  note: "Anchored means a quote was captured from a real source for a named product. It does not mean the formula is true, current for the SKU, or valid for a region or version. Queued rows are leads for a person, not findings.",
  rowsRead: rows.length,
  summary,
  anchorable: anchorable.map((r) => ({ slug: r.slug, source: r.source, url: r.url, matchedTitle: r.decision.matchedTitle, evidence: r.evidence, applied: r.applied })),
  queued: queued.map((r) => ({ slug: r.slug, source: r.source, url: r.url, failures: r.decision.failures, diff: r.decision.diff, diffText: describeDiff(r.decision.diff) })),
  fetchFailures: failed,
}, null, 2));
console.log(`\nFull report: ${OUT}`);
