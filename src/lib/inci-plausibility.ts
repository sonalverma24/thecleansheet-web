/* A last check on a list that passed every other rule: could it be the WHOLE ingredient list of this product?
 *
 * Owner rule, 2026-11-04: a list that fails is held grey, never written. The other rules look at the text; this one looks at the product. A water-based product (a shampoo, a
 * conditioner, a cleanser, a moisturiser, a cream, a lotion, a sunscreen, a toner, a mist) has water, aqua, a juice or a hydrosol in its list. A "list" with none of them is
 * a different thing taken for the list: Omeo's shampoo page printed only "Key Ingredients Arnica Montana Flower Extract, ..., Lactic Acid" and it was written as the list; Be
 * Minimalist's "Shop by ingredient" menu and WishCare's key actives would have failed the same way.
 *
 * Deliberately narrow, so a real list is never refused: only the water-based categories above, never a product whose name says it is an oil, a balm, a butter, a stick, a powder,
 * a bar, a serum (hair serums are water-free silicones), a scrub, a soap or a lip product, never "dry shampoo", and never a list that is a fat-based formula (see FATTY). */
export interface Plausibility { ok: boolean; reason?: string }

const AQUEOUS = /\b(shampoo|conditioner|cleanser|face ?wash|body ?wash|hand ?wash|moisturi[sz]er|cream|lotion|sun ?screen|toner|mist|essence|gel)\b/i;
const NOT_AQUEOUS = /\b(dry shampoo|oil|balm|butter|stick|powder|bar|solid|serum|lip|wax|pomade|clay|scrub|salt|soap|tint|foundation|lipstick|kajal|mascara)\b/i;
const WATERY = /\b(water|aqua|eau|juice|hydrosol)\b/i;
/* A fat-based (anhydrous) formula has no water and is not an error: Juicy Chemistry's under-eye cream is "Theobroma Cacao Seed Butter, Helianthus Annuus Seed Oil, Cera Alba, Tocopherol,
   Rosa Damascena Flower Oil". It shows as a first entry that is a butter, an oil or a wax, or as a list that is largely made of them. One botanical oil among botanical extracts does not
   make a formula fat-based (Omeo's key actives had one oil in seven). */
const FATTY = /\b(butter|oil|wax|cera|petrolatum|squalane|lanolin|dimethicone|cyclopentasiloxane|isododecane|triglyceride)\b/i;
const FATTY_SHARE = 0.4;

export function listPlausibleFor(ingredients: string[], productName: string): Plausibility {
  const name = productName.replace(/\boil[- ]?free\b/gi, " ");
  const category = AQUEOUS.exec(name)?.[1];
  if (!category || NOT_AQUEOUS.test(name)) return { ok: true };
  if (ingredients.some((entry) => WATERY.test(entry))) return { ok: true };
  if (ingredients[0] && FATTY.test(ingredients[0])) return { ok: true };
  if (ingredients.length && ingredients.filter((entry) => FATTY.test(entry)).length / ingredients.length >= FATTY_SHARE) return { ok: true };
  return { ok: false, reason: `a ${category.toLowerCase()} is water-based, but this list has no water, aqua, juice or hydrosol: it cannot be the whole ingredient list` };
}
