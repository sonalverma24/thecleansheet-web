/* One-time migration: re-derive every stored review's verdict with the CURRENT
   rules (guardrails + banned-ingredient safety gate + renamed tiers) and re-stamp
   it to the current rubric, so the live catalogue serves again with correct stamps
   and the new safety screen. Deterministic only - it does NOT re-run the model, so
   there is no API cost and claim research is untouched. Idempotent (safe to re-run).
   Run: set -a; . ./.env.local; set +a; npx tsx --tsconfig tsconfig.json scripts/backfill-reviews.mts */
import { createClient } from "@supabase/supabase-js";
import { deriveVerdict, RUBRIC_REV } from "@/lib/product-review-engine";
import type { ProductReview, DerivedVerdict } from "@/lib/product-review-types";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const { data, error } = await db.from("product_reviews").select("product_slug, result, tier, rubric_rev");
if (error) { console.error("read failed:", error.message); process.exit(1); }
console.log(`read ${data!.length} rows; target rubric = ${RUBRIC_REV}`);

let updated = 0, skipped = 0, changed = 0;
const flips: string[] = [];
for (const row of data!) {
  const result = row.result as { type?: string; review?: ProductReview; verdict?: DerivedVerdict } | null;
  if (!result?.review || result.type !== "product-review") { skipped++; continue; }
  const verdict = deriveVerdict(result.review);           // current logic
  const oldTier = String(row.tier ?? "");
  if (verdict.tier !== oldTier) { changed++; if (flips.length < 25) flips.push(`${result.review.brand}/${result.review.productName}: ${oldTier} -> ${verdict.tier}`); }
  const newResult = { ...result, verdict };
  const { error: upErr } = await db.from("product_reviews")
    .update({ result: newResult, tier: verdict.tier, rubric_rev: RUBRIC_REV })
    .eq("product_slug", row.product_slug);
  if (upErr) { console.error("update failed", row.product_slug, upErr.message); continue; }
  updated++;
}
console.log(`\nupdated ${updated}, skipped ${skipped}, tier changed ${changed}`);
console.log("sample tier changes:\n  " + flips.join("\n  "));
// distribution after
const dist: Record<string,number> = {};
for (const row of data!) { const r = row.result as { review?: ProductReview } | null; if (r?.review) { const t = deriveVerdict(r.review).tier; dist[t]=(dist[t]||0)+1; } }
console.log("new tier distribution:", JSON.stringify(dist));
