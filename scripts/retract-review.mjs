// Retract (delete) a single stored product review from Supabase.
//
// The /reviews/[slug] page renders whatever is stored in the `product_reviews`
// table. Use this to pull a review whose ingredient data is wrong, so it stops
// showing on the site. Re-running the review later (after a fix) republishes it.
//
// Usage:
//   node --env-file=.env.local scripts/retract-review.mjs
//   node --env-file=.env.local scripts/retract-review.mjs some-other-product-slug
//
// (Node 20.6+ has --env-file built in. If your Node is older, export the two
//  env vars first, or upgrade Node.)

import { createClient } from "@supabase/supabase-js";

const slug = process.argv[2] || "la-roche-posay-cicaplast-balm";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run with: node --env-file=.env.local scripts/retract-review.mjs",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existing, error: selErr } = await supabase
  .from("product_reviews")
  .select("product_slug, product_name, brand, tier")
  .eq("product_slug", slug)
  .maybeSingle();

if (selErr) {
  console.error("Lookup failed:", selErr.message);
  process.exit(1);
}
if (!existing) {
  console.log(`No stored review found for "${slug}". Nothing to delete.`);
  process.exit(0);
}

console.log(
  `Deleting: ${existing.brand} — ${existing.product_name}  (tier: ${existing.tier}, slug: ${existing.product_slug})`,
);

const { error: delErr } = await supabase
  .from("product_reviews")
  .delete()
  .eq("product_slug", slug);

if (delErr) {
  console.error("Delete failed:", delErr.message);
  process.exit(1);
}

console.log(
  "✓ Deleted. The review page will 404 and it drops from the brand page and registry\n" +
    "  after the page cache revalidates (~5 min), or immediately if you redeploy.",
);
