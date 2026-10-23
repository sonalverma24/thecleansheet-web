/* ────────────────────────────────────────────────────────────────
   THE CLEAN SHEET™ · "Cheat code" lines for the product page

   One short, practical line about using a product well, chosen by product type and by what is in the ingredient list.
   Each line is well-established usage guidance. A product that matches nothing here gets no cheat code: a generic line would
   only be noise.

   This table is advice shown to shoppers, so it needs a named reviewer's sign-off before the pills page goes live (the same
   rule as the regulatory framework notes). The first matching row wins, so the order is the priority.
──────────────────────────────────────────────────────────────── */

import type { ProductScorecard } from "@/data/brands/types";

export interface CheatCode {
  id: string;
  title: string;
  text: string;
  /** Matches on the product type, or on any ingredient name. */
  productTypes?: ProductScorecard["productType"][];
  ingredient?: RegExp;
}

export const CHEAT_CODES: CheatCode[] = [
  {
    id: "sunscreen", title: "Sunscreen cheat code", productTypes: ["sunscreen"],
    text: "SPF only works at 2 mg per cm². Apply generously and reapply every two hours.",
  },
  {
    id: "retinoid", title: "Retinoid cheat code", ingredient: /\bretin(ol|al|aldehyde|yl|oate|oic)\b|\b(adapalene|tretinoin|tazarotene)\b/i,
    text: "Start with two or three evenings a week and wear sunscreen the next morning. Ask your doctor first if you are pregnant or planning a pregnancy.",
  },
  {
    id: "acids", title: "Exfoliating acid cheat code", ingredient: /\b(glycolic|lactic|mandelic|salicylic|lactobionic) acid\b|\bgluconolactone\b/i,
    text: "Acids make skin more sensitive to sun. Start every second day and wear sunscreen the next morning.",
  },
  {
    id: "vitamin-c", title: "Vitamin C cheat code", ingredient: /^(l-)?ascorbic acid$/i,
    text: "Vitamin C breaks down in light and air. Keep the cap on, store it away from heat, and stop using it if it turns brown.",
  },
];

export function cheatCodeFor(productType: ProductScorecard["productType"], ingredients: string[]): CheatCode | null {
  return CHEAT_CODES.find((c) => (c.productTypes?.includes(productType)) || (c.ingredient && ingredients.some((i) => c.ingredient!.test(i.trim())))) ?? null;
}
