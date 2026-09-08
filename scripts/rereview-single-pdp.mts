import fs from "fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
}

const SLUG = "be-minimalist-cph-complex-oligopeptide-0-8-anti-dandruff-serum";
const PDP = "https://beminimalist.co/products/cph-complex-oligopeptide-0-8-anti-dandruff-serum";
const BK = process.env.SCRATCH_BACKUP
  ?? `scripts/backup-be-minimalist-cph-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;

async function main() {
  const { createAdminClient } = await import("../src/lib/supabase/admin");
  const { runProductReview } = await import("../src/lib/product-review-engine");
  const db = createAdminClient();

  const { data: before } = await db.from("product_reviews").select("*").eq("product_slug", SLUG).maybeSingle();
  if (!before) { console.error("No existing row to re-review; aborting."); process.exit(1); }
  fs.writeFileSync(BK, JSON.stringify(before, null, 2));
  console.log(`Backed up existing row (tier: ${before.tier}) → ${BK}`);

  // Delete so runProductReview does not short-circuit on the stored review.
  await db.from("product_reviews").delete().eq("product_slug", SLUG);
  console.log("Deleted stored row; running fresh review against the brand PDP...");

  const started = Date.now();
  const result = await runProductReview(PDP);
  const secs = Math.round((Date.now() - started) / 1000);

  if (result.type !== "product-review") {
    console.error(`Re-review returned "${result.type}" (${secs}s). Restoring the backup...`);
    await db.from("product_reviews").upsert(before, { onConflict: "product_slug" });
    console.error("Backup restored. No change made.");
    process.exit(1);
  }

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
