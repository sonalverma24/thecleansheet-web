import fs from "fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
}

const SLUG = process.argv[2];
const PDP = process.argv[3];
// Optional comma list of stale twin slugs: backed up, deleted before the run (the
// engine serves an existing twin instead of reviewing), and dropped after.
const TWINS = (process.argv[4] ?? "").split(",").filter(Boolean);
const BK = process.env.SCRATCH_BACKUP
  ?? `scripts/backup-rereview-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;

if (!SLUG || !PDP) { console.error("usage: tsx scripts/rereview-pdp.mts <slug> <pdp-url>"); process.exit(1); }
async function main() {
  const { createAdminClient } = await import("../src/lib/supabase/admin");
  const { runProductReview } = await import("../src/lib/product-review-engine");
  const db = createAdminClient();

  const { data: before } = await db.from("product_reviews").select("*").eq("product_slug", SLUG).maybeSingle();
  if (!before) { console.error("No existing row to re-review; aborting."); process.exit(1); }
  fs.writeFileSync(BK, JSON.stringify(before, null, 2));
  console.log(`Backed up existing row (tier: ${before.tier}) → ${BK}`);

  const twinRows: unknown[] = [];
  for (const t of TWINS) {
    const { data } = await db.from("product_reviews").select("*").eq("product_slug", t).maybeSingle();
    if (data) twinRows.push(data);
  }
  if (twinRows.length) fs.writeFileSync(BK.replace(/\.json$/, "-twins.json"), JSON.stringify(twinRows, null, 2));
  // Delete so runProductReview does not short-circuit on the stored review.
  await db.from("product_reviews").delete().in("product_slug", [SLUG, ...TWINS]);
  console.log("Deleted stored row; running fresh review against the brand PDP...");

  const started = Date.now();
  const result = await runProductReview(PDP);
  const secs = Math.round((Date.now() - started) / 1000);

  if (result.type !== "product-review") {
    console.error(`Re-review returned "${result.type}" (${secs}s). Restoring the backup...`);
    await db.from("product_reviews").upsert([before, ...twinRows], { onConflict: "product_slug" });
    console.error("Backup restored. No change made.");
    process.exit(1);
  }

  // Keep the original URL working: if the engine stored under a different slug, move it to SLUG.
  if (result.review.productSlug !== SLUG) {
    const { data: fresh } = await db.from("product_reviews").select("*").eq("product_slug", result.review.productSlug).maybeSingle();
    if (fresh) {
      fresh.product_slug = SLUG;
      if (fresh.result?.review) fresh.result.review.productSlug = SLUG;
      await db.from("product_reviews").upsert(fresh, { onConflict: "product_slug" });
      await db.from("product_reviews").delete().eq("product_slug", result.review.productSlug);
      console.log(`moved ${result.review.productSlug} -> ${SLUG}`);
    }
  }
  for (const t of TWINS) if (t !== SLUG) console.log(`      { source: "/reviews/${t}", destination: "/reviews/${SLUG}", permanent: true },`);
  const r = result.review, v = result.verdict;
  console.log(`\n✓ Re-review done (${secs}s)`);
  console.log("stored slug   :", r.productSlug);
  console.log("brand/product :", r.brand, "—", r.productName);
  console.log("NEW tier      :", v.tier, `(${v.tierLabel})`);
  console.log("was           :", before.tier);
  console.log("headline      :", v.headline);
  console.log("score total   :", r.scores?.total);
  const hard = (r.claimMap ?? []).filter((c: any) => c.drugBoundaryRisk || c.riskLevel === "red-flag");
  console.log(`\nhard/drug-boundary candidate claims (${hard.length}):`);
  hard.forEach((c: any) => console.log(`  - risk=${c.riskLevel} drugBoundary=${c.drugBoundaryRisk} corrob=${c.corroborated} voided=${c.inciFlagVoided} :: ${String(c.text).slice(0,90)}`));
  console.log("\ngates:");
  v.gates.forEach((g: any) => console.log(`  [${g.passed ? "PASS" : "FAIL"}] ${g.label}: ${g.detail}`));
}
main().catch((e) => { console.error(e); process.exit(1); });
