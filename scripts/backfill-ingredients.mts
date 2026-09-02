/* Populate the `ingredients` table with every ingredient of every scanned product
   that is not already in the curated core, so the /ingredients directory holds
   them all. Names only; the background enrichment fills the profiles.
   Run: set -a; . ./.env.local; set +a; npx tsx --tsconfig tsconfig.json scripts/backfill-ingredients.mts */
import { createClient } from "@supabase/supabase-js";
import { addDiscoveredNames, getDirectoryIngredients } from "@/lib/ingredient-directory";
import type { ProductReview } from "@/lib/product-review-types";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const { data, error } = await db.from("product_reviews").select("result");
if (error) { console.error(error.message); process.exit(1); }

const names = new Set<string>();
for (const row of data!) {
  const rv = (row.result as { review?: ProductReview } | null)?.review;
  for (const n of rv?.inciIngredients ?? []) if (n && n.trim().length > 1) names.add(n.trim());
}
console.log(`collected ${names.size} unique ingredient names from ${data!.length} reviews`);

const added = await addDiscoveredNames([...names]);
console.log(`inserted ${added} NEW ingredients (not already in the curated core)`);

const dir = await getDirectoryIngredients();
console.log(`directory now holds ${dir.length} ingredients (core + discovered)`);
