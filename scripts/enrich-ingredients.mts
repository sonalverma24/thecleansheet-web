/* Enrich all pending discovered ingredients (background search), in safe chunks.
   Run: set -a; . ./.env.local; set +a; npx tsx --tsconfig tsconfig.json scripts/enrich-ingredients.mts */
import { enrichPendingIngredients } from "@/lib/ingredient-directory";
let round = 0;
for (;;) {
  const { enriched, remaining } = await enrichPendingIngredients(25);
  round++;
  console.log(`round ${round}: +${enriched} enriched, ${remaining} remaining`);
  if (remaining === 0 || enriched === 0) break;
}
console.log("enrichment complete");
