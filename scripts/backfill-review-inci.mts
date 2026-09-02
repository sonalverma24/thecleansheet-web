/* Backfill the INCI on stored reviews so the analyser stops reporting
   "INCI not available" for products whose ingredient list we actually have.

   Two passes, in order of confidence — deterministic, no model calls:

     1. From the review's own per-ingredient reads. Older reviews frequently
        had ingredientReads populated (the model DID transcribe the INCI) while
        inciIngredients was left empty, so every ingredient-dependent check on
        the analyser screen read as "not available". Copy the reads' names into
        inciIngredients.

     2. From the brand product page. For rows that carry no ingredient data at
        all AND a known source URL (repairs.json: { "<product_slug>": "<url>" }),
        read the INCI straight off the page with the same extractor the live
        engine now uses.

   After either pass, the verdict is re-derived (so the ingredient-safety gate
   runs against the recovered list) and the row is re-stored. Idempotent.

   Run: npx tsx --tsconfig tsconfig.json scripts/backfill-review-inci.mts [repairs.json]
   Env: reads .env.local for NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY. */

import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { deriveVerdict, RUBRIC_REV } from "@/lib/product-review-engine";
import { fetchInciFromProductPage } from "@/lib/inci-from-page";
import { buildGlobalScreen } from "@/lib/inci-enrich";
import type { ProductReview, DerivedVerdict } from "@/lib/product-review-types";

/* A regulatory screen the model authored with no INCI is filled with
   "missing INCI" placeholders. Detect that so we can rebuild it from the
   recovered ingredient list. */
function screenIsStale(rs: ProductReview["regulatoryScreen"]): boolean {
  if (!rs) return true;
  return Object.values(rs).some((v) =>
    /missing inci|no inci\b|inci (?:not|un)available|not available.*inci/i.test(String(v)),
  );
}

// Load .env.local without a shell (values can contain characters a naive
// `source` chokes on).
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  if (!/^[A-Z]/.test(line)) continue;
  const i = line.indexOf("=");
  if (i === -1) continue;
  const key = line.slice(0, i);
  if (!process.env[key]) process.env[key] = line.slice(i + 1).replace(/^["']|["']$/g, "");
}

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const repairsPath = process.argv[2];
const repairs: Record<string, string> =
  repairsPath && existsSync(repairsPath) ? JSON.parse(readFileSync(repairsPath, "utf8")) : {};

const { data, error } = await db.from("product_reviews").select("product_slug, result");
if (error) { console.error("read failed:", error.message); process.exit(1); }
console.log(`read ${data!.length} rows; target rubric = ${RUBRIC_REV}`);

let fromReads = 0, fromPage = 0, screensRebuilt = 0, untouched = 0, stillMissing = 0;

for (const row of data!) {
  const slug = String(row.product_slug);
  const result = row.result as { type?: string; review?: ProductReview; verdict?: DerivedVerdict } | null;
  const review = result?.review;
  if (!review || result?.type !== "product-review") continue;

  let inciSource: "reads" | "page" | null = null;

  // ── Step 1: ensure the INCI array is populated ──
  if ((review.inciIngredients?.length ?? 0) < 3) {
    // Pass 1 — from the model's own ingredient reads (deterministic, no network).
    const readNames = (review.ingredientReads ?? []).map((r) => r.name).filter(Boolean);
    if (readNames.length >= 3) {
      review.inciIngredients = readNames;
      inciSource = "reads";
    } else if (repairs[slug]) {
      // Pass 2 — read the INCI off the brand page.
      const page = await fetchInciFromProductPage(repairs[slug]);
      if (page && page.ingredients.length >= 3) {
        review.inciIngredients = page.ingredients;
        review.inciSourceUrl = page.source;
        inciSource = "page";
      }
    }
  }

  const inci = review.inciIngredients ?? [];
  if (inci.length < 3) { stillMissing++; continue; }

  // ── Step 2: rebuild a stale regulatory screen from the recovered INCI ──
  // The model bakes "not applicable due to missing INCI" into every authority
  // row when it has no ingredient list; that stale object is served verbatim,
  // so the 10-authority screen keeps reading "missing INCI" even after the INCI
  // is recovered. Rebuild it from the ingredient database.
  let rebuiltScreen = false;
  if (screenIsStale(review.regulatoryScreen)) {
    review.regulatoryScreen = buildGlobalScreen(inci);
    rebuiltScreen = true;
  }

  // Keep the data-source read honest now that the INCI is found.
  if (review.dataSource && review.dataSource.inciFound === false) {
    review.dataSource.inciFound = true;
    if (!review.dataSource.inciSource || /not found/i.test(review.dataSource.inciSource)) {
      review.dataSource.inciSource = review.inciSourceUrl ? "Brand product page" : "Ingredient reads";
    }
  }

  // Nothing changed for this row → leave it untouched.
  if (!inciSource && !rebuiltScreen) { untouched++; continue; }

  const verdict = deriveVerdict(review);
  const newResult = { ...result, review, verdict };
  const { error: upErr } = await db.from("product_reviews")
    .update({ result: newResult, tier: verdict.tier, rubric_rev: RUBRIC_REV })
    .eq("product_slug", slug);
  if (upErr) { console.error("update failed", slug, upErr.message); continue; }

  if (inciSource === "reads") fromReads++;
  else if (inciSource === "page") fromPage++;
  if (rebuiltScreen) screensRebuilt++;
  const parts = [
    inciSource ? `+${inci.length} ingredients from ${inciSource}` : null,
    rebuiltScreen ? "rebuilt regulatory screen" : null,
  ].filter(Boolean).join(", ");
  console.log(`  fixed ${slug}  (${parts}) → ${verdict.tier}`);
}

console.log(`\ndone. INCI from reads: ${fromReads}, INCI from page: ${fromPage}, regulatory screens rebuilt: ${screensRebuilt}, unchanged: ${untouched}, still missing INCI: ${stillMissing}`);
if (stillMissing) console.log("Rows still missing an INCI need a source URL added to repairs.json (product_slug → brand PDP URL).");
