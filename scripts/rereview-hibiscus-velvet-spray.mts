/* One-shot corrective re-review for the Hibiscus Monkey Velvet Spray body
   moisturizer (Bergamot). The original stored review imported hair-fall clinical
   claims from a DIFFERENT SKU (HM Love Scalp & Hair Oil) and flagged them as ASCI
   breaches on a body product. The review prompt has since been hardened ("ONE
   PRODUCT ONLY"); this regenerates the review with that prompt.

   Safeguards:
   - Pins the result to the EXISTING public slug so the live URL is preserved
     (INCIDecoder now lists this product under a different slug, which a naive
     re-review would publish to, orphaning the current page).
   - VERIFIES the regenerated claimMap carries no hair/scalp/dandruff/frizz claim
     before publishing. If any remain, it publishes NOTHING and dumps the result
     for inspection.
   - Removes any duplicate row the engine stored under its own canonical slug.

   Usage:
     npx tsx scripts/rereview-hibiscus-velvet-spray.mts          # dry run (verify only)
     npx tsx scripts/rereview-hibiscus-velvet-spray.mts --commit # publish if clean
*/
import fs from "fs";

for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
}

const TARGET_SLUG = "hibiscus-monkey-original-velvet-spray-in-shower-body-moisturizer-bergamot";
const PDP = "https://www.hibiscusmonkey.com/products/original-velvet-spray-250ml";
const COMMIT = process.argv.includes("--commit");
const DUMP = `scripts/hibiscus-rereview-result.json`;

// A body product must carry none of these. Any hit = cross-SKU contamination.
const OFFTOPIC = /\b(hair\s*fall|hairfall|scalp|dandruff|frizz|follicle|hair growth|hair(?![-\s]?free))\b/i;

async function main() {
  const { createAdminClient } = await import("../src/lib/supabase/admin");
  const { runProductReview, deriveVerdict, RUBRIC_REV } = await import("../src/lib/product-review-engine");
  const db = createAdminClient();

  console.log("Regenerating review against:", PDP);
  const started = Date.now();
  const result = await runProductReview(PDP);
  const secs = Math.round((Date.now() - started) / 1000);

  if (result.type !== "product-review") {
    console.error(`Re-review returned "${result.type}" (${secs}s). Nothing published.`);
    process.exit(1);
  }
  const review: any = result.review;
  const canonicalSlug: string = review.productSlug;
  console.log(`\n✓ Generated (${secs}s)`);
  console.log("engine canonical slug :", canonicalSlug);
  console.log("brand / product       :", review.brand, "—", review.productName);
  console.log("inciSourceUrl         :", review.inciSourceUrl);
  console.log("inciIngredients       :", JSON.stringify(review.inciIngredients));

  const claims = review.claimMap ?? [];
  const offending = claims.filter((c: any) => OFFTOPIC.test(`${c.text} ${JSON.stringify(c.types ?? c.type ?? "")}`));
  console.log(`\nclaimMap (${claims.length}):`);
  claims.forEach((c: any, i: number) =>
    console.log(`  [${i}]${OFFTOPIC.test(c.text) ? " ⚠️ OFFTOPIC" : ""} risk=${c.riskLevel} :: ${c.text}`));

  fs.writeFileSync(DUMP, JSON.stringify(result, null, 2));
  console.log(`\nFull result dumped → ${DUMP}`);

  // Clean up any row the engine auto-stored under its own canonical slug so we
  // never end up with two URLs for one product.
  if (canonicalSlug && canonicalSlug !== TARGET_SLUG) {
    await db.from("product_reviews").delete().eq("product_slug", canonicalSlug);
    console.log(`Removed engine-stored duplicate row at "${canonicalSlug}".`);
  }

  if (offending.length) {
    console.error(`\n✗ ${offending.length} hair/scalp claim(s) STILL present. NOT publishing. Inspect ${DUMP} and harden the prompt further.`);
    process.exit(2);
  }
  console.log("\n✓ No hair/scalp/dandruff/frizz claims in the regenerated review.");

  const verdict = deriveVerdict(review);
  console.log("tier:", verdict.tier, `(${verdict.tierLabel})`);
  console.log("headline:", verdict.headline);

  if (!COMMIT) {
    console.log(`\n[dry run] Clean and ready. Re-run with --commit to publish to "${TARGET_SLUG}".`);
    return;
  }

  // Pin to the existing public slug so the live URL keeps working.
  review.productSlug = TARGET_SLUG;
  await db.from("product_reviews").upsert(
    {
      product_slug: TARGET_SLUG,
      product_name: review.productName,
      brand: review.brand,
      tier: verdict.tier,
      image_url: review.imageUrl ?? null,
      result: { type: "product-review", review, verdict },
      rubric_rev: RUBRIC_REV,
      reviewed_at: new Date().toISOString(),
    },
    { onConflict: "product_slug" },
  );
  console.log(`\n✓ Published corrected review to "${TARGET_SLUG}". Live page refreshes on next ISR revalidate (~5 min).`);
}
main().catch((e) => { console.error(e); process.exit(1); });
