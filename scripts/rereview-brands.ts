/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · Catalogue re-review
   Runs every product in src/data/brands through the live review
   engine under the current methodology, persisting results into the
   product-keyed repository (Supabase). Resumable: products already
   stored under the current rubric revision are skipped.

   Run:        npx tsx scripts/rereview-brands.ts
   Dry sample: npx tsx scripts/rereview-brands.ts --limit 3
──────────────────────────────────────────────────────────────── */

import fs from "fs";

/* Load .env.local without a dotenv dependency (Next.js normally does this). */
for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
}

async function main() {
  // Import after env is loaded (engine reads env at call time anyway).
  const { ALL_BRANDS } = await import("../src/data/brands");
  const { runProductReview, RUBRIC_REV } = await import("../src/lib/product-review-engine");

  // Results must persist — verify the repository table exists before burning API time.
  const { createAdminClient } = await import("../src/lib/supabase/admin");
  const probe = await createAdminClient().from("product_reviews").select("product_slug").limit(1);
  if (probe.error) {
    console.error("✗ The product_reviews repository table is not ready:", probe.error.message);
    console.error("  Run the migration in supabase/migrations/20260716120000_product_review_repository.sql first.");
    process.exit(1);
  }

  const limitArg = process.argv.indexOf("--limit");
  const limit = limitArg > -1 ? parseInt(process.argv[limitArg + 1], 10) : Infinity;

  const queue: { brand: string; product: string }[] = [];
  for (const b of ALL_BRANDS) {
    for (const p of b.products) queue.push({ brand: b.name, product: p.productName });
  }

  console.log(`Catalogue: ${queue.length} products across ${ALL_BRANDS.length} brands · rubric ${RUBRIC_REV}`);
  const todo = queue.slice(0, limit);

  const summary: Record<string, number> = {};
  const issues: { query: string; type: string; options?: string[] }[] = [];
  let done = 0;

  for (const { brand, product } of todo) {
    const query = `${brand} ${product}`;
    const started = Date.now();
    try {
      const result = await runProductReview(query);
      const secs = Math.round((Date.now() - started) / 1000);
      if (result.type === "product-review") {
        const tier = result.verdict.tier;
        summary[tier] = (summary[tier] ?? 0) + 1;
        console.log(`✓ [${++done}/${todo.length}] ${query} → ${tier} (${secs}s)`);
      } else if (result.type === "disambiguation") {
        issues.push({ query, type: "disambiguation", options: result.options.map((o) => o.name) });
        console.log(`? [${++done}/${todo.length}] ${query} → ambiguous (${result.options.length} options)`);
      } else {
        issues.push({ query, type: result.type });
        console.log(`✗ [${++done}/${todo.length}] ${query} → ${result.type} (${secs}s)`);
      }
    } catch (err) {
      issues.push({ query, type: `exception: ${err instanceof Error ? err.message : String(err)}` });
      console.log(`✗ [${++done}/${todo.length}] ${query} → exception`);
    }
    // Be polite to the model + scrapers between products.
    await new Promise((r) => setTimeout(r, 4000));
  }

  console.log("\n═══ Tier distribution ═══");
  for (const [tier, n] of Object.entries(summary)) console.log(`  ${tier}: ${n}`);
  console.log(`  issues: ${issues.length}`);

  fs.writeFileSync(
    "scripts/rereview-issues.json",
    JSON.stringify({ rubric: RUBRIC_REV, ranAt: new Date().toISOString(), summary, issues }, null, 2),
  );
  console.log("Issues written to scripts/rereview-issues.json");
}

main().catch((e) => { console.error(e); process.exit(1); });
