/* Reanalyse existing live rows using the frozen engine in a credential-isolated
 * child, validate, then update the same row/URL. Dry run unless --apply.
 * Stop gracefully: create <out>/STOP. Resume with the same --out directory. */
import { appendFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { parseEnv } from "node:util";
import { createHash } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { newestFirst, rerunQuery, validateReplacement, sameReviewTime, type RerunRow } from "./approved-rerun-policy";
import type { ProductReview } from "@/lib/product-review-types";

const argv = process.argv.slice(2);
const flag = (k: string, fallback = "") => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] ?? fallback : fallback; };
const baseline = "X1-approved-2026-10-28";
const tag = "analyser-x1-approved-2026-10-28";
const script = fileURLToPath(import.meta.url);
const config = { ANALYSER_PILLS_PAGE: "true", ANALYSER_NEW_LAYOUT: "true", ANALYSER_INGREDIENT_ALIASES: "false", ANALYSER_PILLAR_STANDING: "false" };

if (argv.includes("--child")) {
  // A fresh process has no cache, database credentials or email credentials.
  for (const key of Object.keys(process.env)) if (/SUPABASE|SERVICE_ROLE|RESEND|ADMIN|PITCH/.test(key)) delete process.env[key];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (input, init) => {
    const url = input instanceof Request ? input.url : String(input);
    if (/supabase|resend/i.test(url)) return Promise.reject(new Error("Isolated analysis blocked a database/email request"));
    return originalFetch(input, init);
  };
  const { runProductReview, deriveVerdict } = await import("@/lib/product-review-engine");
  const { decideReview } = await import("@/lib/analyser-x");
  const request = JSON.parse(readFileSync(flag("--request"), "utf8")) as { query: string };
  try {
    const result = await runProductReview(request.query);
    const details = result.type === "product-review" ? { tier: deriveVerdict(result.review).tier, pill: decideReview(result.review).decision.key } : {};
    writeFileSync(flag("--result"), JSON.stringify({ result, ...details }), { mode: 0o600 });
  } catch (e) {
    writeFileSync(flag("--result"), JSON.stringify({ failure: String(e instanceof Error ? e.message : e) }), { mode: 0o600 });
    process.exitCode = 1;
  }
} else {
  const envPath = flag("--env");
  const out = resolve(flag("--out", ".local-preview/catalogue-refresh"));
  if (!envPath) throw new Error("--env <source file> is required");
  const env = parseEnv(readFileSync(envPath, "utf8"));
  const url = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const project = new URL(url).hostname.split(".")[0];
  const apply = argv.includes("--apply");
  if (apply && (flag("--confirm-project") !== project || project !== "xivtoayjkpnfkafrxghq")) throw new Error("Explicit production project confirmation is required");
  const key = apply ? env.SUPABASE_SERVICE_ROLE_KEY : env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("Missing database credential");
  Object.assign(process.env, config);
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { RETRACTED_SLUGS, ACCEPTED_RUBRIC_REVS, deriveVerdict } = await import("@/lib/product-review-engine");
  const { unratedKindOf, unratedInputOf } = await import("@/lib/unrated-kind");
  const { decideReview } = await import("@/lib/analyser-x");
  const sourceDiff = execFileSync("git", ["diff", "--name-only", tag, "--", "src", "next.config.ts"], { encoding: "utf8" });
  if (sourceDiff.trim()) throw new Error("Frozen analyser sources differ from the approved release");
  const liveVersion = await fetch("https://thecleansheet.in/api/analyser-version").then(r => r.json()) as { baseline: string; configuration: Record<string, boolean> };
  if (liveVersion.baseline !== baseline || JSON.stringify(liveVersion.configuration) !== JSON.stringify({ pillsPage: true, newLayout: true, ingredientAliases: false, pillarStanding: false })) throw new Error("Website version/configuration differs from approved baseline");
  mkdirSync(out, { recursive: true, mode: 0o700 });
  const snapshotPath = join(out, "backup.json");
  let snapshot: { takenAt: string; sha256: string; rows: RerunRow[] };
  if (existsSync(snapshotPath)) snapshot = JSON.parse(readFileSync(snapshotPath, "utf8"));
  else {
    const rows: RerunRow[] = [];
    const before = await db.from("product_reviews").select("product_slug", { count: "exact", head: true });
    if (before.error) throw before.error;
    for (let offset = 0; ; offset += 50) {
      const { data, error } = await db.from("product_reviews").select("*").order("reviewed_at", { ascending: false, nullsFirst: false }).order("product_slug").range(offset, offset + 49);
      if (error) throw error;
      rows.push(...data as RerunRow[]);
      if (data.length < 50) break;
    }
    const after = await db.from("product_reviews").select("product_slug", { count: "exact", head: true });
    if (after.error || before.count !== after.count || rows.length !== before.count || new Set(rows.map(r => r.product_slug)).size !== rows.length) throw new Error("Catalogue changed during snapshot; take a fresh snapshot");
    snapshot = { takenAt: new Date().toISOString(), sha256: createHash("sha256").update(JSON.stringify(rows)).digest("hex"), rows };
    writeFileSync(snapshotPath, JSON.stringify(snapshot), { mode: 0o600, flag: "wx" });
  }
  if (createHash("sha256").update(JSON.stringify(snapshot.rows)).digest("hex") !== snapshot.sha256) throw new Error("Backup checksum mismatch");
  const live = newestFirst(snapshot.rows.filter(r => r.result?.type === "product-review" && r.result.review && ACCEPTED_RUBRIC_REVS.includes(r.rubric_rev ?? "") && !RETRACTED_SLUGS.has(r.product_slug) && !unratedKindOf(unratedInputOf(r.result.review))));
  type Record_ = { slug: string; outcome: string; at: string; oldPill?: string; newPill?: string; attempts?: number; issues?: string[]; note?: string };
  type State = { baseline: string; startedAt: string; records: Record_[]; windowStart: number; windowCount: number; consecutiveErrors: number; finished?: string };
  const statePath = join(out, "state.json");
  const state: State = existsSync(statePath) ? JSON.parse(readFileSync(statePath, "utf8")) : { baseline, startedAt: new Date().toISOString(), records: [], windowStart: Date.now(), windowCount: 0, consecutiveErrors: 0 };
  if (state.baseline !== baseline) throw new Error("State belongs to a different analyser version");
  const done = new Set(state.records.map(r => r.slug));
  const pending = live.filter(r => !done.has(r.product_slug));
  console.log(JSON.stringify({ mode: apply ? "APPLY" : "DRY RUN", baseline, storedRows: snapshot.rows.length, liveProducts: live.length, remaining: pending.length, order: "newest to oldest by reviewed_at", batch: 20, periodMinutes: 60, backup: snapshotPath, first: pending.slice(0, 8).map(r => ({ slug: r.product_slug, date: r.reviewed_at, query: rerunQuery(r) })) }, null, 2));
  if (apply) {
    if (!env.GOOGLE_AI_API_KEY) throw new Error("Paid model key is missing");
    const lock = join(out, "RUNNING");
    mkdirSync(lock); // atomic: a second runner must not race the first
    writeFileSync(join(lock, "pid"), String(process.pid));
    let stopping = false;
    process.on("SIGINT", () => { stopping = true; });
    process.on("SIGTERM", () => { stopping = true; });
    const shouldStop = () => stopping || existsSync(join(out, "STOP"));
    const save = () => { writeFileSync(`${statePath}.tmp`, JSON.stringify(state, null, 2), { mode: 0o600 }); renameSync(`${statePath}.tmp`, statePath); };
    const safe = (message: string) => Object.values(env).filter((x): x is string => typeof x === "string" && x.length > 16).reduce((s, secret) => s.replaceAll(secret, "[redacted]"), message);
    const record = (r: Record_) => { state.records.push(r); done.add(r.slug); save(); console.log(`[${state.records.length}/${live.length}] ${r.slug}: ${r.outcome}${r.oldPill ? ` ${r.oldPill} -> ${r.newPill ?? r.oldPill}` : ""}${r.issues?.length ? ` (${r.issues.join(", ")})` : ""}${r.note ? ` ${r.note}` : ""}`); };
    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
    const childEnv: NodeJS.ProcessEnv = { NODE_ENV: "development" };
    for (const key of ["PATH", "HOME", "TMPDIR", "LANG", "SYSTEMROOT", "NODE_EXTRA_CA_CERTS"]) if (process.env[key]) childEnv[key] = process.env[key];
    for (const key of ["GOOGLE_AI_API_KEY", "FIRECRAWL_API_KEY", "GOOGLE_CSE_API_KEY", "GOOGLE_CSE_CX"]) if (env[key]) childEnv[key] = env[key];
    Object.assign(childEnv, config);
    try {
      save();
      for (const row of pending) {
        if (shouldStop()) break;
        while (state.windowCount >= 20 && Date.now() < state.windowStart + 3600000 && !shouldStop()) await wait(5000);
        if (shouldStop()) break;
        if (Date.now() >= state.windowStart + 3600000) { state.windowStart = Date.now(); state.windowCount = 0; }
        const { data: current, error: readError } = await db.from("product_reviews").select("*").eq("product_slug", row.product_slug).maybeSingle();
        if (readError) throw readError;
        if (!current || !sameReviewTime(current.reviewed_at, row.reviewed_at)) { record({ slug: row.product_slug, outcome: "skipped-concurrent-change", at: new Date().toISOString() }); continue; }
        appendFileSync(join(out, "before-each.jsonl"), JSON.stringify(current) + "\n", { mode: 0o600 });
        state.windowCount++; save();
        const oldPill = decideReview(row.result.review!).decision.key;
        const rec: Record_ = { slug: row.product_slug, outcome: "failed", at: new Date().toISOString(), oldPill };
        const requestPath = join(out, `${row.product_slug}.request.json`);
        writeFileSync(requestPath, JSON.stringify({ query: rerunQuery(row) }), { mode: 0o600 });
        for (let attempt = 1; attempt <= 3; attempt++) {
          rec.attempts = attempt;
          const resultPath = join(out, `${row.product_slug}.attempt-${attempt}.json`);
          const chunks: string[] = [];
          let timedOut = false;
          const child = spawn(process.execPath, ["--import", "tsx", script, "--child", "--request", requestPath, "--result", resultPath], { env: childEnv, stdio: ["ignore", "pipe", "pipe"] });
          child.stdout.on("data", b => chunks.push(String(b))); child.stderr.on("data", b => chunks.push(String(b)));
          const timer = setTimeout(() => { timedOut = true; child.kill("SIGKILL"); }, 12 * 60000);
          const code = await new Promise<number | null>((resolve_, reject) => { child.on("close", resolve_); child.on("error", reject); });
          clearTimeout(timer);
          writeFileSync(join(out, `${row.product_slug}.attempt-${attempt}.log`), safe(chunks.join("")), { mode: 0o600 });
          if (shouldStop()) break;
          const output = existsSync(resultPath) ? JSON.parse(readFileSync(resultPath, "utf8")) : {};
          if (output.failure || code !== 0) { rec.note = safe(String(output.failure ?? (timedOut ? "analysis-timeout" : `child-exit-${code}`))).slice(0, 350); break; }
          if (output.result?.type !== "product-review") { rec.outcome = output.result?.type === "disambiguation" ? "needs-product-url" : "held-no-analysis"; rec.note = output.result?.type ?? "no-result"; break; }
          const fresh = output.result.review as ProductReview;
          rec.newPill = output.pill;
          rec.issues = validateReplacement(row, fresh, oldPill, output.pill);
          if (rec.issues.length) {
            rec.outcome = "held-existing-page";
            if (rec.issues.every(x => ["web-search-missing", "decision-lost"].includes(x)) && attempt < 3) continue;
            break;
          }
          // A canonical slug can change wording. Identity was checked above; the URL is retained.
          fresh.productSlug = row.product_slug;
          if (row.result.review?.imageLocked && row.result.review.imageUrl) {
            fresh.imageUrl = row.result.review.imageUrl; fresh.imageLocked = true;
          } else if (!fresh.imageUrl && row.image_url) fresh.imageUrl = row.image_url;
          fresh.reviewedAt = new Date().toISOString();
          const replacement = { product_name: fresh.productName, brand: fresh.brand, tier: output.tier, image_url: fresh.imageUrl ?? null, result: { ...output.result, review: fresh, verdict: deriveVerdict(fresh) }, rubric_rev: "r7", reviewed_at: fresh.reviewedAt };
          let update = db.from("product_reviews").update(replacement).eq("product_slug", row.product_slug);
          update = row.reviewed_at ? update.eq("reviewed_at", row.reviewed_at) : update.is("reviewed_at", null);
          const { data: saved, error: writeError } = await update.select("product_slug");
          if (writeError) throw new Error(`write failed for ${row.product_slug}: ${writeError.message}`);
          if (!saved?.length) { rec.outcome = "skipped-concurrent-change"; break; }
          const { data: verified, error: verifyError } = await db.from("product_reviews").select("result,reviewed_at").eq("product_slug", row.product_slug).single();
          if (verifyError || !sameReviewTime(verified.reviewed_at, replacement.reviewed_at) || JSON.stringify(verified.result.review.inciIngredients) !== JSON.stringify(fresh.inciIngredients)) throw new Error(`WRITE UNCONFIRMED for ${row.product_slug}; stop and inspect backup/result`);
          rec.outcome = "refreshed"; break;
        }
        if (shouldStop()) { console.log(`Stopped before publishing ${row.product_slug}; existing page kept.`); break; }
        state.consecutiveErrors = rec.outcome === "failed" ? state.consecutiveErrors + 1 : 0;
        record(rec);
        if (state.consecutiveErrors >= 3 || /spending cap|monthly.*cap|API key not valid|permission_denied|billing/i.test(rec.note ?? "")) throw new Error("Stopped on repeated failures or a billing/key error");
        if (state.windowCount >= 20) console.log("Hourly quota reached; next batch starts after the current hour window.");
      }
      if (state.records.length >= live.length) { state.finished = new Date().toISOString(); save(); console.log("COMPLETE: every snapshotted live product has an outcome."); }
      else console.log("PAUSED: progress saved; resume with the same output directory.");
    } finally { rmSync(lock, { recursive: true, force: true }); }
  } else console.log("DRY RUN: snapshot backed up; no model calls or production writes.");
}
