import type { ProductScorecard } from "@/data/brands/types";
import { findTaxonomyMatch, getTaxonomyItem } from "@/data/taxonomy";
import { productGroup } from "@/lib/registry-filters";

/* ────────────────────────────────────────────────────────────────
   COMPARE · which products may be compared with which

   A comparison is only between products of the same type: a sunscreen with a sunscreen, a shampoo with a shampoo. The type is the /brands "Product type"
   group (productGroup), made finer where one group holds things nobody would put side by side: "Hair care" is shampoo, conditioner, hair serum and
   hair mask; "Body & bath" is soap, body wash, lotion and deodorant; "Makeup" is lipstick, mascara and foundation. A product whose type we have not
   filed ("Other") has no comparison type and is never compared.

   The same function runs on a listing card (the /brands grid decides who can be added) and on a stored analysis (the /compare page checks again, so a
   hand-typed address cannot get around the rule). Pure.
──────────────────────────────────────────────────────────────── */

/** The most products one comparison holds. */
export const COMPARE_MAX = 4;

/** What the type is read from: the same three fields the /brands grid reads. */
export type CompareSubject = Pick<ProductScorecard, "productName" | "category" | "subCategory" | "productType">;

/* First rule that matches wins, so the order matters ("Hair Serum / Leave-in Conditioner" is a serum before it is a conditioner). A rule is tried on the
   product's category text first and on its name only when the category says nothing useful. A product that matches none keeps its whole group. */
const EYE_MAKEUP = /\b(mascara|kajal|kohl|eye ?liner|eye ?shadow|brows?)\b/;
const SPLITS: Record<string, [label: string, re: RegExp][]> = {
  "Hair care": [
    ["Shampoos", /\bshampoos?\b/],
    ["Hair serums & oils", /\b(serums?|oils?|leave[- ]in)\b/],
    ["Hair masks", /\b(masks?|treatments?|packs?)\b/],
    ["Conditioners", /\bconditioners?\b/],
  ],
  "Body & bath": [
    ["Deodorants", /\b(deodorants?|deo|roll[- ]?on|sticks?)\b/],
    ["Body scrubs", /\b(scrubs?|exfoliat\w*)\b/],
    ["Body washes", /\b(body|shower|bath) ?(wash|gel)\b|\bbody wash\b/],
    ["Bath salts & soaks", /\bbath (salts?|soaks?)\b|\bsoaks?\b/],
    ["Soaps & bars", /\b(soaps?|bars?)\b/],
    ["Body lotions & creams", /\b(lotions?|creams?|moisturi[sz]ers?|butters?|balms?)\b/],
  ],
  "Makeup": [
    ["Lip colour", /\blip(stick|s)?\b|\blip (tint|gloss|colou?r|stain|liner)\b/],
    ["Eye makeup", EYE_MAKEUP],
    ["Face makeup", /\b(foundation|concealer|primer|blush|compact|powder|highlighter|bronzer|skin tint|tinted)\b/],
  ],
  "Eye care": [
    ["Eye makeup", EYE_MAKEUP],
    ["Eye creams & serums", /\b(creams?|serums?|gels?|patch(es)?|under[- ]?eye|treatments?)\b/],
  ],
};

/** The type a product is compared within, or null when we have not filed its type. */
export function compareTypeOf(p: CompareSubject): string | null {
  // productGroup reads only these fields; the rest of a ProductScorecard is not needed to file a product.
  const base = productGroup(p as ProductScorecard);
  if (base === "Other") return null;
  const rules = SPLITS[base];
  if (!rules) return base;
  const hit = (text: string) => rules.find(([, re]) => re.test(text))?.[0];
  return hit(`${p.subCategory ?? ""} ${p.category ?? ""}`.toLowerCase()) ?? hit(p.productName.toLowerCase()) ?? base;
}

/** A stored analysis as the subject of the same question. The category goes through the controlled taxonomy exactly as the /brands listing does
    (listRepositoryCatalogueProducts), so a card and the /compare page file a product in the same place. */
export function compareSubjectOfReview(review: { productName: string; category?: string }): CompareSubject {
  const raw = review.category ?? "";
  const matched = findTaxonomyMatch(raw);
  let category = raw;
  let subCategory: string | undefined;
  if (matched?.family === "product_type") {
    const parent = matched.parent_id ? getTaxonomyItem(matched.parent_id) : undefined;
    category = parent?.label ?? raw;
    subCategory = matched.label;
  } else if (matched?.family === "product_category") {
    category = matched.label;
  }
  return { productName: review.productName, productType: "leave-on", category, subCategory };
}

export type CompareBlock = { kind: "unfiled" | "full" | "type"; message: string };

/** Why a product cannot join the comparison that has `picked` in it, or null when it can. `kind` says which rule stopped it (only "type" can be fixed by
    filtering to the same product type); `message` is shown to the shopper as it is. */
export function compareBlock(args: { picked: (string | null)[]; alreadyIn: boolean; candidateType: string | null }): CompareBlock | null {
  const { picked, alreadyIn, candidateType } = args;
  if (alreadyIn) return null;
  if (candidateType === null) return { kind: "unfiled", message: "We have not filed this product's type yet, so it cannot be compared." };
  if (picked.length >= COMPARE_MAX) return { kind: "full", message: `You can compare up to ${COMPARE_MAX} products. Remove one to add another.` };
  const current = picked[0];
  if (current && current !== candidateType) {
    return { kind: "type", message: `You are comparing ${current}, so only ${current} can be added. Choose another one from the same category, or clear the list to compare something else.` };
  }
  return null;
}

/** The message alone, for a card's tooltip. */
export function compareBlockReason(args: Parameters<typeof compareBlock>[0]): string | null {
  return compareBlock(args)?.message ?? null;
}
