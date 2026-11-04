/* READ-ONLY audit of stored ingredient lists. For every stored analysis whose list came from a brand page or INKEE Decoder, read that page again with the CURRENT reader
 * and compare it with the stored list (scripts/audit-stored-lists-policy.ts). It finds lists that lost their last entries, menus or key-actives lines stored as the list,
 * lists that belong to another page, and pages that no longer read.
 *
 * It makes HTTP GETs of the source pages only: no model, no Firecrawl, no database access (it reads an export file), and it writes nothing but its own report folder.
 * Nykaa pages are not audited (they need a rendered read); they are listed as skipped.
 *
 * Run: npx tsx --tsconfig tsconfig.json scripts/audit-stored-lists.mts <export.json> [--out-dir ~/Backups/cleansheet] [--concurrency 3] [--only brand-page|decoder] [--slug-prefix x]
 * The export comes from scripts/export-product-reviews.mts. The result depends on the reader in the tree you run it from: run it from the tree with the best reader. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { fetchInciFromProductPage } from "@/lib/inci-from-page";
import { fetchIncidecoderProduct } from "@/lib/inci-fetch";
import { compareLists, sourceKind, type ListComparison } from "./audit-stored-lists-policy";

const args = process.argv.slice(2);
const flag = (k: string, d = ""): string => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] ?? d : d; };
const file = args[0] && !args[0].startsWith("--") ? args[0] : undefined;
if (!file || !existsSync(resolve(file))) throw new Error("usage: audit-stored-lists.mts <export.json> [--out-dir DIR] [--concurrency N] [--only brand-page|decoder] [--slug-prefix X]");
const only = flag("--only"); const prefix = flag("--slug-prefix"); const concurrency = Math.max(1, Math.min(6, Number(flag("--concurrency", "3")) || 3));
const outRoot = resolve(flag("--out-dir", join(homedir(), "Backups", "cleansheet")).replace(/^~/, homedir()));

type Row = { product_slug: string; product_name: string; brand: string; reviewed_at: string | null; result?: { type?: string; review?: { inciIngredients?: string[]; inciEvidence?: { sourceUrl?: string; origin?: string } } } };
const parsed = JSON.parse(readFileSync(resolve(file), "utf8")) as { rows?: Row[] } | Row[];
const rows = (Array.isArray(parsed) ? parsed : parsed.rows ?? []).filter((r) => r.result?.type === "product-review" && r.product_slug.startsWith(prefix));

interface Finding extends ListComparison { slug: string; name: string; brand: string; reviewedAt: string | null; kind: string; url: string; skipped?: string; reason?: string }

const todo: Row[] = rows.filter((r) => (r.result?.review?.inciIngredients ?? []).length > 0 || !!r.result?.review?.inciEvidence?.sourceUrl);

/** One read, tried up to three times with a pause between: a page that fails once is usually a busy server, not a page without a list, and the audit must not call it unreadable.
 *  It says why when it still fails: the Decoder fetcher separates "could not fetch" (throttled or blocked) from "fetched, no list". */
async function readLive(kind: string, url: string): Promise<{ list: string[] | null; reason: string }> {
  let reason = "no list read";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (kind === "decoder") {
        const p = await fetchIncidecoderProduct(url);
        if (p.status === "ok" && p.result.ingredients.length) return { list: p.result.ingredients, reason: "" };
        reason = p.status === "fetch_failed" ? "could not fetch the Decoder page (throttled or blocked?)" : "Decoder page fetched but no list found";
      } else {
        const list = (await fetchInciFromProductPage(url))?.ingredients;
        if (list?.length) return { list, reason: "" };
        reason = "page fetched but the current reader finds no list";
      }
    } catch (e) { reason = `error: ${e instanceof Error ? e.message.slice(0, 60) : "unknown"}`; }
    if (attempt < 3) await new Promise((resolve_) => setTimeout(resolve_, 1500 * attempt));
  }
  return { list: null, reason };
}

const findings: Finding[] = [];
let next = 0;
async function worker() {
  for (;;) {
    const r = todo[next++]; if (!r) return;
    const ev = r.result?.review?.inciEvidence; const stored = r.result?.review?.inciIngredients ?? []; const url = ev?.sourceUrl ?? "";
    const kind = sourceKind(ev?.origin, url);
    const base = { slug: r.product_slug, name: r.product_name, brand: r.brand, reviewedAt: r.reviewed_at, kind, url };
    if (!url || !/^https:\/\//i.test(url)) { findings.push({ ...base, ...compareLists(stored, null), verdict: "page-unreadable", skipped: stored.length ? "no source address recorded" : "no list stored" }); continue; }
    if (kind === "nykaa" || kind === "other" || (only && kind !== only)) { findings.push({ ...base, ...compareLists(stored, stored), skipped: `not audited (${kind})` }); continue; }
    const live = await readLive(kind, url);
    findings.push({ ...base, ...compareLists(stored, live.list), reason: live.reason || undefined });
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));

const audited = findings.filter((f) => !f.skipped);
const order = ["stored-missing-tail", "stored-missing-head", "stored-missing-middle", "stored-has-extra", "different", "page-unreadable", "same"];
const tally: Record<string, number> = {}; for (const f of audited) tally[f.verdict] = (tally[f.verdict] ?? 0) + 1;
const stamp = new Date().toISOString().replace(/[:.]/g, "-"); const dir = join(outRoot, `audit-stored-lists-${stamp}`);
mkdirSync(dir, { recursive: true, mode: 0o700 });
const csv = ["verdict,slug,brand,kind,stored,live,missing_from_stored,missing_from_live,url", ...[...audited].sort((a, b) => order.indexOf(a.verdict) - order.indexOf(b.verdict))
  .map((f) => [f.verdict, f.slug, f.brand, f.kind, f.storedCount, f.liveCount, f.missingFromStored.join(" | "), f.missingFromLive.join(" | "), f.reason ?? "", f.url].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
writeFileSync(join(dir, "report.csv"), csv, { mode: 0o600 }); writeFileSync(join(dir, "report.json"), JSON.stringify({ file: resolve(file), when: new Date().toISOString(), tally, findings }, null, 1), { mode: 0o600 });

console.log(`audited ${audited.length} of ${findings.length} stored analyses (${findings.length - audited.length} skipped: Nykaa/other sources or nothing to compare) from ${resolve(file)}`);
console.log(order.map((v) => `  ${v.padEnd(22)} ${tally[v] ?? 0}`).join("\n"));
for (const f of audited.filter((x) => x.verdict !== "same").sort((a, b) => order.indexOf(a.verdict) - order.indexOf(b.verdict)))
  console.log(`${f.verdict.padEnd(22)} ${f.slug.slice(0, 52).padEnd(52)} stored ${String(f.storedCount).padStart(2)} live ${String(f.liveCount).padStart(2)}  ${f.reason ? "why: " + f.reason : f.missingFromStored.length ? "page adds: " + f.missingFromStored.slice(0, 3).join(" | ") : f.missingFromLive.length ? "stored adds: " + f.missingFromLive.slice(0, 3).join(" | ") : ""}`);
console.log(`report: ${dir}`);
